import { useState } from 'react'
import { Figure, Controls, Button, Readout, useNarrow } from '../../../../../kit'
import css from './modules.module.css'
import {
  NAMES,
  DEFAULT_KINDS,
  INIT,
  X_NEW,
  trainStep,
  evaluate,
  EMPTY_OPT_ERROR,
  saveAndReload,
  stateDictKeys,
  type Name,
  type Kind,
  type Values,
  type Vec,
} from './pbModel'

/*
  Parameters vs buffers vs plain attributes, on a BatchNorm-style MyNorm(3) (see pbModel.ts for the
  exact module and the PyTorch-checked numbers). Each tensor's registration can be switched; the
  buttons run the real operations and every card shows what happened to that tensor.
*/

type Role = 'learned' | 'stat' | 'counter'
const ROLE: Record<Name, Role> = { gamma: 'learned', beta: 'learned', running_mean: 'stat', running_var: 'stat', num_batches: 'counter' }
const ROLE_LABEL: Record<Role, string> = { learned: 'learned by gradient descent', stat: 'running statistic, set by forward()', counter: 'how many batches seen' }
const INIT_SRC: Record<Name, string> = {
  gamma: 'torch.ones(3)',
  beta: 'torch.zeros(3)',
  running_mean: 'torch.zeros(3)',
  running_var: 'torch.ones(3)',
  num_batches: 'torch.tensor(0)',
}

function codeLine(n: Name, k: Kind) {
  if (k === 'param') return `self.${n} = nn.Parameter(${INIT_SRC[n]})`
  if (k === 'buffer') return `self.register_buffer('${n}', ${INIT_SRC[n]})`
  return `self.${n} = ${INIT_SRC[n]}`
}

function verdict(n: Name, k: Kind): { good: boolean | null; text: string } {
  const r = ROLE[n]
  if (r === 'learned') {
    if (k === 'param') return { good: true, text: 'Right: trained by optimizer.step(), saved, and moved with the model.' }
    if (k === 'buffer') return { good: false, text: `Saved and moved, but never trained: ${n} is stuck at its starting value.` }
    return { good: false, text: 'Never trained, not saved, and left behind on the CPU by model.to().' }
  }
  if (r === 'stat') {
    if (k === 'buffer') return { good: true, text: 'Right: saved and moved with the model, never touched by the optimiser.' }
    if (k === 'param')
      return { good: false, text: 'Counted as a learnable weight (requires_grad=True, handed to the optimiser) although only forward() should change it.' }
    return { good: false, text: 'Not saved, so it is lost on reload, and left on the CPU, so forward() on the GPU crashes.' }
  }
  if (k === 'buffer') return { good: true, text: 'Right: saved and moved. nn.BatchNorm1d keeps this count as a buffer called num_batches_tracked.' }
  if (k === 'plain') return { good: null, text: 'Not saved and not moved. Fine for a throwaway value, but this count resets to 0 on reload.' }
  return { good: false, text: 'nn.Parameter needs floats: this line fails when the model is built.' }
}

const KINDS: { value: Kind; label: string }[] = [
  { value: 'param', label: 'Parameter' },
  { value: 'buffer', label: 'buffer' },
  { value: 'plain', label: 'plain' },
]

const f2 = (x: number) => x.toFixed(2)
const vecStr = (v: Vec) => `[${v.map(f2).join(', ')}]`
function torchRow(v: Vec) {
  const neg = v.some((x) => x < 0)
  return v.map((x) => (neg && x >= 0 ? ' ' : '') + x.toFixed(4)).join(', ')
}

interface LogEntry {
  code: string
  result: string
  error?: boolean
}

export default function ParamBufferInspector() {
  const [kinds, setKinds] = useState<Record<Name, Kind>>(DEFAULT_KINDS)
  const [vals, setVals] = useState<Values>(INIT)
  const [gpu, setGpu] = useState(false)
  const [training, setTraining] = useState(true)
  const [changed, setChanged] = useState<Set<Name>>(new Set())
  const [log, setLog] = useState<LogEntry>({ code: 'model = MyNorm(3)\noptimizer = torch.optim.SGD(model.parameters(), lr=0.3)', result: 'Built. Now press the buttons and watch the cards.' })

  const [listRef, narrow] = useNarrow<HTMLDivElement>(600)
  const broken = kinds.num_batches === 'param'
  // with no Parameter at all, building the optimiser fails, so there is nothing to train with
  const noOpt = !broken && !NAMES.some((n) => kinds[n] === 'param')
  const dev = (n: Name) => (kinds[n] === 'plain' ? 'cpu' : gpu ? 'cuda:0' : 'cpu')
  const sdKeys = stateDictKeys(kinds)
  const paramNames = NAMES.filter((n) => kinds[n] === 'param')

  const rebuild = (next: Record<Name, Kind>) => {
    setKinds(next)
    setVals(INIT)
    setGpu(false)
    setTraining(true)
    setChanged(new Set())
    setLog(
      next.num_batches === 'param'
        ? {
            code: "model = MyNorm(3)      # self.num_batches = nn.Parameter(torch.tensor(0))",
            result: 'RuntimeError: Only Tensors of floating point and complex dtype can require gradients',
            error: true,
          }
        : !NAMES.some((n) => next[n] === 'param')
          ? { code: 'model = MyNorm(3)      # new class, new model\noptimizer = torch.optim.SGD(model.parameters(), lr=0.3)', result: EMPTY_OPT_ERROR, error: true }
          : { code: 'model = MyNorm(3)      # new class, new model\noptimizer = torch.optim.SGD(model.parameters(), lr=0.3)', result: 'Built a fresh model.' },
    )
  }

  const diff = (a: Values, b: Values) =>
    new Set(NAMES.filter((n) => (n === 'num_batches' ? a.num_batches !== b.num_batches : (a[n] as Vec).some((x, j) => Math.abs(x - (b[n] as Vec)[j]) > 1e-12))))

  const doTrain = () => {
    const r = trainStep(vals, kinds, gpu)
    setChanged(diff(vals, r.next))
    setVals(r.next)
    setTraining(true)
    const code = `model.train()\nout = model(x${gpu ? '.to(device)' : ''})\nloss = ((out - y) ** 2).mean()\nloss.backward()\noptimizer.step(); optimizer.zero_grad()`
    if (r.error)
      setLog({
        code,
        error: true,
        result:
          r.error +
          (r.partial
            ? `\n(${r.partial}.mul_(0.9) had already run on the CPU before .add_() met the GPU batch statistics, so ${r.partial} was scaled but not updated.)`
            : r.error.includes('grad_fn')
              ? '\n(forward() ran and updated the statistics, but neither gamma nor beta is a Parameter, so the loss does not depend on anything that requires grad.)'
              : ''),
      })
    else
      setLog({
        code,
        result: `loss = ${r.loss!.toFixed(4)}. forward() updated the running statistics; optimizer.step() changed ${paramNames.filter((n) => ROLE[n] === 'learned').join(' and ') || 'nothing (no learned parameters registered)'}.`,
      })
  }

  const doDevice = () => {
    const to = !gpu
    setGpu(to)
    setChanged(new Set(NAMES.filter((n) => kinds[n] !== 'plain')))
    const left = NAMES.filter((n) => kinds[n] === 'plain')
    setLog({
      code: `device = '${to ? 'cuda' : 'cpu'}'\nmodel.to(device)`,
      result: `Moved every parameter and buffer to ${to ? 'cuda:0' : 'the CPU'}.${left.length ? ` Plain attribute${left.length > 1 ? 's' : ''} ${left.join(', ')} stayed on the CPU.` : ''}`,
    })
  }

  const doSave = () => {
    const next = saveAndReload(vals, kinds)
    const lost = NAMES.filter((n) => kinds[n] === 'plain' && diff(vals, next).has(n))
    setChanged(new Set(lost))
    setVals(next)
    setGpu(false)
    setTraining(true)
    setLog({
      code: "torch.save(model.state_dict(), 'norm.pt')\nmodel = MyNorm(3)                  # a fresh model in a new session\nmodel.load_state_dict(torch.load('norm.pt'))",
      result: `The file held: ${sdKeys.join(', ')}. ${lost.length ? `Lost on reload (back to the starting value): ${lost.join(', ')}.` : 'Every tensor that had changed came back.'}`,
    })
  }

  const doEval = () => {
    const r = evaluate(vals, kinds, gpu)
    setTraining(false)
    setChanged(new Set())
    const code = `model.eval()\nwith torch.no_grad():\n    print(model(torch.tensor([[${X_NEW.join('., ')}.]])${gpu ? '.to(device)' : ''}))`
    if (r.error) setLog({ code, error: true, result: r.error })
    else setLog({ code, result: `tensor([[${torchRow(r.out!)}]]${gpu ? ", device='cuda:0'" : ''})\nIn eval mode the input is normalised with running_mean and running_var.` })
  }

  return (
    <Figure
      wide
      title="Parameter, buffer or plain attribute?"
      caption={
        <>
          Press <b>train one step</b> a few times: <code>forward()</code> updates the running statistics and <code>optimizer.step()</code> changes only the
          parameters. Then <b>save and reload</b> (the plain <code>num_batches</code> resets to 0) and <b>move to the GPU</b>. Now switch{' '}
          <code>running_var</code> to <i>plain</i> and try again: it is not saved, it stays on the CPU, and the GPU run crashes. Switch <code>gamma</code> to{' '}
          <i>buffer</i> and it never learns.
        </>
      }
    >
      <div className={css.statusBar}>
        <span>
          model on <b className={css.mono}>{gpu ? 'cuda:0' : 'cpu'}</b>
        </span>
        <span>
          mode <b className={css.mono}>{training ? 'train' : 'eval'}</b>
        </span>
        <span>
          batch <span className={css.mono}>x</span>: 4 examples × 3 features
        </span>
      </div>

      <div ref={listRef} className={css.pbList}>
        {NAMES.map((n) => {
          const k = kinds[n]
          const v = verdict(n, k)
          const val = n === 'num_batches' ? `tensor(${vals.num_batches})` : vecStr(vals[n] as Vec)
          const d = dev(n)
          const stranded = gpu && d === 'cpu'
          return (
            <div key={n} className={`${css.card} ${narrow ? '' : css.pbWide} ${changed.has(n) ? css.flash : ''}`}>
              <div className={css.cardHead}>
                <b className={css.mono}>{n}</b>
                <span className={css.nodeKind}>{ROLE_LABEL[ROLE[n]]}</span>
              </div>
              <div className={css.pbBody}>
                <div className={css.pbRow}>
                  <div className="segmented" role="radiogroup" aria-label={`register ${n} as`}>
                    <div className="segmented-track">
                      {KINDS.map((o) => (
                        <button
                          key={o.value}
                          type="button"
                          role="radio"
                          aria-checked={o.value === k}
                          className={`segmented-opt${o.value === k ? ' is-active' : ''}`}
                          onClick={() => rebuild({ ...kinds, [n]: o.value })}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={css.cardVal}>
                    <span className={css.mono}>{broken && n === 'num_batches' ? '—' : val}</span>
                    {changed.has(n) && <span className={css.changedMark}>changed</span>}
                  </div>
                </div>
                <code className={css.cardCode}>{codeLine(n, k)}</code>
                <div className={css.chips}>
                  <span className={`${css.tag} ${k === 'param' ? css.tagYes : css.tagNo}`}>parameters()</span>
                  <span className={`${css.tag} ${k !== 'plain' ? css.tagYes : css.tagNo}`}>state_dict()</span>
                  <span className={`${css.tag} ${k === 'param' ? css.tagYes : css.tagNo}`}>requires_grad</span>
                  <span className={`${css.tag} ${stranded ? css.tagWarn : ''}`}>{d}</span>
                </div>
                <div className={v.good === true ? css.vGood : v.good === false ? css.vBad : css.vMeh}>
                  {v.good === true ? '✓ ' : v.good === false ? '✗ ' : '• '}
                  {v.text}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Controls>
        <Button primary disabled={broken || noOpt} onClick={doTrain}>
          train one step
        </Button>
        <Button disabled={broken} onClick={doDevice}>
          <span className={css.btnCode}>{gpu ? "model.to('cpu')" : "model.to('cuda')"}</span>
        </Button>
        <Button disabled={broken} onClick={doSave}>
          save and reload
        </Button>
        <Button disabled={broken} onClick={doEval}>
          <span className={css.btnCode}>model.eval()</span> and predict
        </Button>
        <Button onClick={() => rebuild(DEFAULT_KINDS)}>reset</Button>
      </Controls>

      <div className={css.logBox} aria-live="polite">
        <pre className={css.logCode}>{log.code}</pre>
        <div className={log.error ? css.logErr : css.logOk}>{log.result}</div>
      </div>

      <Readout
        items={[
          ['named_parameters()', broken ? '—' : `[${paramNames.map((p) => `'${p}'`).join(', ')}]`],
          ['state_dict() keys', broken ? '—' : `[${sdKeys.map((p) => `'${p}'`).join(', ')}]`],
        ]}
      />
    </Figure>
  )
}
