import { useState } from 'react'
import { Figure, Controls, Segmented, Toggle, Button, Readout, Plot, Grid, Axes, Path, HLine, Dots, Label, useAnimationFrame, useContainerWidth } from '../../../../../kit'
import css from './autograd.module.css'

/*
  What tracking costs. One loop step builds a graph (Linear -> ReLU -> Linear -> MSE) whose nodes
  keep their inputs "saved for backward". backward() frees them; torch.no_grad() never saves them;
  and storing the loss tensor itself (instead of loss.item()) keeps a whole step's graph alive.
  Run 100 steps and watch GPU memory. Memory numbers are illustrative (a mid-sized CNN on an 8 GB
  GPU); the behaviour (what is kept, freed or never saved) matches PyTorch, and the printed lists
  are real outputs.
*/

type Loop = 'val' | 'train'
type Log = 'loss' | 'item' | 'detach'

const GPU = 8
const BASE = 1.2 // weights, gradients, optimiser state, the batch
const ACT = 0.6 // activations saved for backward in one step
const NOGRAD_PEAK = 0.05 // without a graph only the current layer's output exists at a time
const STEPS = 100

const PRINTS: Record<string, string> = {
  'val-off-loss': '[tensor(1.1172, grad_fn=<MseLossBackward0>), tensor(0.5825, grad_fn=<MseLossBackward0>), tensor(0.7986, grad_fn=<MseLossBackward0>)]',
  'val-off-item': '[1.1171854734420776, 0.5824916958808899, 0.7986320853233337]',
  'val-off-detach': '[tensor(1.1172), tensor(0.5825), tensor(0.7986)]',
  'val-on-loss': '[tensor(1.1172), tensor(0.5825), tensor(0.7986)]',
  'val-on-item': '[1.1171854734420776, 0.5824916958808899, 0.7986320853233337]',
  'val-on-detach': '[tensor(1.1172), tensor(0.5825), tensor(0.7986)]',
  'train-off-loss': '[tensor(1.1172, grad_fn=<MseLossBackward0>), tensor(0.5506, grad_fn=<MseLossBackward0>), tensor(0.7792, grad_fn=<MseLossBackward0>)]',
  'train-off-item': '[1.1171854734420776, 0.5505784749984741, 0.7792205810546875]',
  'train-off-detach': '[tensor(1.1172), tensor(0.5506), tensor(0.7792)]',
}

const ERR_NOGRAD_TRAIN = 'RuntimeError: element 0 of tensors does not require grad and does not have a grad_fn'

function model(loop: Loop, nograd: boolean, log: Log) {
  const error = loop === 'train' && nograd
  const recorded = !nograd
  // a stored loss keeps its whole graph, saved activations included, unless backward() already freed them
  const leakPerStep = recorded && log === 'loss' && loop === 'val' ? ACT : 0
  const keepsGraphObjects = recorded && log === 'loss'
  const peakNow = (k: number) => BASE + (recorded ? ACT : NOGRAD_PEAK) + leakPerStep * Math.max(0, k - 1)
  let oom: number | null = null
  for (let k = 1; k <= STEPS; k++)
    if (peakNow(k) > GPU) {
      oom = k
      break
    }
  return { error, recorded, leakPerStep, keepsGraphObjects, peakNow, oom }
}

const OPS = ['Linear', 'ReLU', 'Linear', 'MSE']

export default function GraphCutToggle() {
  const [loop, setLoop] = useState<Loop>('val')
  const [nograd, setNograd] = useState(false)
  const [log, setLog] = useState<Log>('loss')
  const [k, setK] = useState(STEPS)
  const [running, setRunning] = useState(false)
  const [ref, cw] = useContainerWidth<HTMLDivElement>(520)
  const m = model(loop, nograd, log)
  const end = m.error ? 0 : m.oom ?? STEPS
  const shown = Math.min(k, end)

  useAnimationFrame((dt) => {
    setK((v) => {
      const nv = v + dt * 45
      if (nv >= end) {
        setRunning(false)
        return STEPS
      }
      return nv
    })
  }, running)

  const change = <T,>(set: (v: T) => void) => (v: T) => {
    set(v)
    setRunning(false)
    setK(STEPS)
  }

  const curve: [number, number][] = []
  for (let s = 1; s <= Math.floor(shown); s++) curve.push([s, Math.min(GPU + 0.6, m.peakNow(s))])
  const now = shown >= 1 ? m.peakNow(Math.floor(shown)) : 0
  const key = `${loop}-${nograd ? 'on' : 'off'}-${log}`
  const logCall = log === 'loss' ? 'losses.append(loss)' : log === 'item' ? 'losses.append(loss.item())' : 'losses.append(loss.detach())'

  const code =
    loop === 'val'
      ? ['model.eval()', 'losses = []', 'for x, y in val_loader:', ...(nograd ? ['    with torch.no_grad():', '        loss = loss_fn(model(x), y)'] : ['    loss = loss_fn(model(x), y)']), `    ${logCall}`]
      : [
          'model.train()',
          'losses = []',
          'for x, y in train_loader:',
          '    optimizer.zero_grad()',
          ...(nograd ? ['    with torch.no_grad():', '        loss = loss_fn(model(x), y)'] : ['    loss = loss_fn(model(x), y)']),
          '    loss.backward()',
          '    optimizer.step()',
          `    ${logCall}`,
        ]

  // graph strip geometry
  const GW = Math.max(280, Math.min(cw, 560))
  const gx = (i: number) => 26 + (i * (GW - 52)) / 5
  const gy = 30
  const savedState: 'saved' | 'freed' | 'none' = !m.recorded ? 'none' : loop === 'train' ? 'freed' : 'saved'

  const verdict = m.error
    ? null
    : m.oom
      ? `Out of memory at step ${m.oom}: every stored loss keeps its step's graph and ${ACT} GB of saved activations alive.`
      : loop === 'train' && log === 'loss'
        ? 'Memory is fine here because backward() already freed the saved activations, but each stored loss still drags its graph along, and sum(losses) would build one giant graph. Log loss.item().'
        : nograd
          ? 'No graph is recorded at all: the lowest memory, and faster too. This is what evaluation should look like.'
          : loop === 'train'
            ? 'A graph is built every step and freed by backward(): steady memory. This is a healthy training loop.'
            : 'A graph is built every step and thrown away, so memory is steady but higher than it needs to be. Wrap evaluation in torch.no_grad().'

  return (
    <Figure
      wide
      title="Switching tracking off: no_grad, detach and item()"
      caption={
        <>
          Choose a loop, switch <code>torch.no_grad()</code> on or off, choose how the loss is logged, then run 100 steps. Orange blocks are values a graph
          saves for its backward pass. Storing <code>loss</code> itself in validation keeps every step's graph alive until the GPU runs out; <code>no_grad</code>{' '}
          records nothing. (Memory sizes are illustrative, for a mid-sized CNN on an 8 GB GPU; the printed lists are real PyTorch output.)
        </>
      }
    >
      <Controls>
        <Segmented label="Loop" value={loop} onChange={change(setLoop)} options={[{ value: 'val', label: 'validation' }, { value: 'train', label: 'training' }]} />
        <div className={css.segGrid}>
          <Segmented
            label="Log the loss with"
            value={log}
            onChange={change(setLog)}
            options={[
              { value: 'loss', label: <span className={css.mono}>loss</span> },
              { value: 'item', label: <span className={css.mono}>loss.item()</span> },
              { value: 'detach', label: <span className={css.mono}>loss.detach()</span> },
            ]}
          />
        </div>
        <Toggle label={<code>with torch.no_grad():</code>} checked={nograd} onChange={change(setNograd)} />
      </Controls>

      <pre className={css.code}>
        {code.map((l, i) => (
          <span key={i} className={`${css.line} ${l.includes('no_grad') || l.includes('losses.append') ? css.lineOn : ''}`}>
            {l}
          </span>
        ))}
      </pre>

      <div ref={ref} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${GW} 92`} width={GW} height={92} style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }} role="img" aria-label={`One step's graph: ${m.recorded ? 'recorded' : 'not recorded'}`}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            if (i === 5) return null
            return <line key={`e${i}`} x1={gx(i) + 18} x2={gx(i + 1) - 18} y1={gy} y2={gy} style={{ stroke: m.recorded ? 'var(--viz-axis)' : 'var(--viz-muted)', strokeWidth: 1.5, strokeDasharray: m.recorded ? undefined : '4 3' }} />
          })}
          <text x={gx(0)} y={gy} dy="0.35em" textAnchor="middle" className="nnet-node-label">
            x
          </text>
          {OPS.map((o, i) => (
            <g key={i}>
              <rect x={gx(i + 1) - 24} y={gy - 13} width={48} height={26} rx={13} style={{ fill: m.recorded ? 'var(--viz-ink)' : 'var(--surface)', stroke: m.recorded ? 'var(--viz-ink)' : 'var(--viz-muted)', strokeDasharray: m.recorded ? undefined : '4 3' }} />
              <text x={gx(i + 1)} y={gy} dy="0.35em" textAnchor="middle" style={{ fontSize: 10.5, fontWeight: 700, fill: m.recorded ? 'var(--surface)' : 'var(--ink-3)' }}>
                {o}
              </text>
              {savedState !== 'none' && (
                <rect
                  x={gx(i + 1) - 12}
                  y={gy + 22}
                  width={24}
                  height={14}
                  rx={3}
                  style={{ fill: savedState === 'saved' ? 'var(--viz-2)' : 'none', stroke: 'var(--viz-2)', strokeWidth: 1.5, strokeDasharray: savedState === 'freed' ? '3 2' : undefined }}
                />
              )}
            </g>
          ))}
          <text x={gx(5)} y={gy} dy="0.35em" textAnchor="middle" className="nnet-node-label">
            loss
          </text>
          <text x={GW / 2} y={86} textAnchor="middle" style={{ fontSize: 11, fontWeight: 600, fill: 'var(--ink-2)' }}>
            {savedState === 'none'
              ? 'no_grad: nothing recorded, loss.grad_fn is None'
              : savedState === 'freed'
                ? 'saved values (dashed) are freed by loss.backward()'
                : 'saved values (orange) live as long as the loss tensor does'}
          </text>
        </svg>
      </div>

      {m.error ? (
        <div className={css.err}>
          loss.backward()
          <br />
          {ERR_NOGRAD_TRAIN}
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--ink-2)', marginTop: 4 }}>
            Training needs the graph. Use <code>no_grad</code> only where you do not call <code>backward()</code>: evaluation, inference and manual weight updates.
          </div>
        </div>
      ) : (
        <Plot x={[0, STEPS]} y={[0, 9]} height={210} minHeight={190} margin={{ left: 44, bottom: 36, top: 14, right: 14 }} ariaLabel="GPU memory in use at each step">
          <Grid xTicks={5} yTicks={4} />
          <Axes xLabel="step" yLabel="GB" xTicks={5} yTicks={4} />
          <HLine y={GPU} color="var(--viz-neg)" />
          <Label x={STEPS} y={GPU} dx={-4} dy={15} anchor="end" color="var(--viz-neg)">
            GPU limit 8 GB
          </Label>
          {curve.length > 1 && <Path points={curve} color={m.oom ? 'var(--viz-neg)' : 'var(--viz-1)'} width={2.5} />}
          {curve.length === 1 && <Dots points={[{ x: curve[0][0], y: curve[0][1] }]} />}
          {m.oom && shown >= m.oom && <Dots points={[{ x: m.oom, y: GPU, color: 'var(--viz-neg)', shape: 'cross', r: 7, label: `CUDA out of memory (step ${m.oom})` }]} />}
        </Plot>
      )}

      <div className={css.row} style={{ justifyContent: 'space-between' }}>
        <Button
          primary
          onClick={() => {
            setK(0)
            setRunning(true)
          }}
          disabled={m.error || running}
        >
          Run 100 steps
        </Button>
        <Readout
          items={[
            ['step', m.error ? '—' : String(Math.floor(shown))],
            ['memory', m.error ? '—' : `${Math.min(now, GPU).toFixed(1)} GB`],
            ['graphs kept alive', m.error ? '—' : m.keepsGraphObjects ? String(Math.floor(shown)) : '0'],
          ]}
        />
      </div>
      {verdict && <div className={m.oom ? css.err : css.note} style={m.oom ? { fontFamily: 'var(--font-body)' } : undefined}>{verdict}</div>}
      {!m.error && (
        <pre className={css.log}>
          <span className={css.comment}>{'>>> '}</span>
          {'print(losses[:3])\n'}
          <span className={css.logOut}>{PRINTS[key]}</span>
        </pre>
      )}
    </Figure>
  )
}
