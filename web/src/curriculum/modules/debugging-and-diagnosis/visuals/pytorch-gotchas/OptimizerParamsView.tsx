import { useState } from 'react'
import { Figure, Button, Readout, useNarrow } from '../../../../../kit'
import { CodePanel, Note, Section } from '../reading-loss-curves/ui'
import s from './pg.module.css'

/*
  What does the optimiser actually hold? A transfer-learning model (a pretrained backbone of three
  blocks plus a classifier head, fc). The learner freezes, replaces the head, creates the optimiser and
  trains one step, in any order. Rules (as in PyTorch): the optimiser keeps the parameter tensors it
  was given when it was created; a parameter changes in a step only if the optimiser holds it AND it
  received a gradient (requires_grad=True when the loss was computed).
*/

const BLOCKS = [
  { id: 'conv1', label: 'conv1' },
  { id: 'layer1', label: 'layer1' },
  { id: 'layer2', label: 'layer2' },
  { id: 'fc', label: 'fc' },
] as const
type BlockId = (typeof BLOCKS)[number]['id']

interface State {
  /** which version of each block is in the model (fc gets a new version when replaced) */
  version: Record<BlockId, number>
  requiresGrad: Record<BlockId, boolean>
  /** parameter tensors held by the optimiser, as "block@version" keys; null = no optimiser yet */
  opt: string[] | null
  /** result of the last training step: block -> 'updated' | reason */
  step: Record<BlockId, string> | null
  /** the error PyTorch would raise for the last action, if any */
  error?: string
  log: string[]
}

const key = (b: BlockId, v: number) => `${b}@${v}`
const START: State = {
  version: { conv1: 0, layer1: 0, layer2: 0, fc: 0 },
  requiresGrad: { conv1: true, layer1: true, layer2: true, fc: true },
  opt: null,
  step: null,
  log: ['model = pretrained_resnet()'],
}

type Action = 'freezeBackbone' | 'freezeAll' | 'unfreeze' | 'replace' | 'optAll' | 'optTrainable' | 'train'

function act(st: State, a: Action): State {
  const n: State = { ...st, version: { ...st.version }, requiresGrad: { ...st.requiresGrad }, step: null, error: undefined, log: [...st.log] }
  switch (a) {
    case 'freezeBackbone':
      for (const b of ['conv1', 'layer1', 'layer2'] as BlockId[]) n.requiresGrad[b] = false
      n.log.push('for p in model.backbone.parameters():', '    p.requires_grad = False')
      break
    case 'freezeAll':
      for (const b of BLOCKS) n.requiresGrad[b.id] = false
      n.log.push('for p in model.parameters():', '    p.requires_grad = False')
      break
    case 'unfreeze':
      for (const b of BLOCKS) n.requiresGrad[b.id] = true
      n.log.push('for p in model.parameters():', '    p.requires_grad = True')
      break
    case 'replace':
      n.version.fc = st.version.fc + 1
      n.requiresGrad.fc = true // a new nn.Linear always starts with requires_grad=True
      n.log.push('model.fc = nn.Linear(512, 5)')
      break
    case 'optAll':
      n.opt = BLOCKS.map((b) => key(b.id, n.version[b.id]))
      n.log.push('opt = Adam(model.parameters())')
      break
    case 'optTrainable':
      n.log.push('params = model.parameters()', 'trainable = [p for p in params', '             if p.requires_grad]', 'opt = Adam(trainable)')
      if (!BLOCKS.some((b) => n.requiresGrad[b.id])) {
        // nothing is trainable: PyTorch refuses to build the optimiser
        n.opt = null
        n.error = 'ValueError: optimizer got an empty parameter list'
        break
      }
      n.opt = BLOCKS.filter((b) => n.requiresGrad[b.id]).map((b) => key(b.id, n.version[b.id]))
      break
    case 'train': {
      n.log.push('loss.backward(); opt.step()')
      if (!BLOCKS.some((b) => n.requiresGrad[b.id])) {
        // no parameter requires grad, so the loss has no graph to differentiate
        n.error = 'RuntimeError: element 0 of tensors does not require grad and does not have a grad_fn'
        break
      }
      if (n.opt === null) {
        n.error = "NameError: name 'opt' is not defined (build an optimiser first)"
        break
      }
      const res = {} as Record<BlockId, string>
      for (const b of BLOCKS) {
        const held = !!n.opt?.includes(key(b.id, n.version[b.id]))
        const hasGrad = n.requiresGrad[b.id]
        res[b.id] = held && hasGrad ? 'updated' : !hasGrad ? 'frozen' : 'notHeld'
      }
      n.step = res
      break
    }
  }
  return n
}

const SCENARIOS: { label: string; actions: Action[] }[] = [
  { label: 'Buggy order', actions: ['freezeAll', 'optAll', 'replace', 'train'] },
  { label: 'Correct order', actions: ['freezeBackbone', 'replace', 'optTrainable', 'train'] },
]

export default function OptimizerParamsView() {
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)
  const [st, setSt] = useState<State>(START)
  const doAct = (a: Action) => setSt((x) => act(x, a))
  const run = (acts: Action[]) => setSt(acts.reduce((x, a) => act(x, a), START))

  const stale = st.opt?.filter((k) => {
    const [b, v] = k.split('@') as [BlockId, string]
    return st.version[b] !== Number(v)
  })
  const nHeld = st.opt?.length ?? 0
  const nTrainable = BLOCKS.filter((b) => st.requiresGrad[b.id]).length
  const nUpdated = st.step ? BLOCKS.filter((b) => st.step![b.id] === 'updated').length : null
  const fcProblem = st.step && st.step.fc !== 'updated'

  return (
    <Figure
      title="What does the optimiser hold?"
      caption={
        <>
          A transfer-learning model: a pretrained backbone (three blocks) and a classifier head, fc. Run the two scenarios, or click the steps yourself in any order.
          Each block shows whether its weights require gradients (frozen means requires_grad = False) and whether the optimiser holds them. When you train one
          step, only blocks that both require gradients and are held by the optimiser change.
        </>
      }
    >
      <div ref={wrapRef} className={narrow ? s.narrow : undefined} style={{ width: '100%', display: 'grid', gap: '0.8rem' }}>
        <Section label="Scenarios">
          <div className={s.btnRow}>
            {SCENARIOS.map((sc) => (
              <Button key={sc.label} onClick={() => run(sc.actions)}>
                {sc.label}
              </Button>
            ))}
            <Button onClick={() => setSt(START)}>Reset</Button>
          </div>
        </Section>
        <Section label="Or do it step by step">
          <div className={s.btnRow}>
            <Button onClick={() => doAct('freezeBackbone')}>Freeze backbone</Button>
            <Button onClick={() => doAct('freezeAll')}>Freeze everything</Button>
            <Button onClick={() => doAct('unfreeze')}>Unfreeze everything</Button>
            <Button onClick={() => doAct('replace')}>Replace fc</Button>
            <Button onClick={() => doAct('optAll')}>Create optimiser (all params)</Button>
            <Button onClick={() => doAct('optTrainable')}>Create optimiser (trainable only)</Button>
            <Button primary onClick={() => doAct('train')} disabled={!st.opt}>
              Train one step
            </Button>
          </div>
        </Section>
        <div className={s.model} role="list" aria-label="Model blocks">
          {BLOCKS.map((b, i) => {
            const v = st.version[b.id]
            const held = !!st.opt?.includes(key(b.id, v))
            const rg = st.requiresGrad[b.id]
            const res = st.step?.[b.id]
            const cls = res === undefined ? '' : res === 'updated' ? s.updated : s.notUpdated
            return (
              <div key={b.id} className={`${s.block} ${i === 3 ? s.head : ''} ${cls}`} role="listitem">
                <div className={s.blockName}>
                  {b.label}
                  {b.id === 'fc' && v > 0 && <span className={s.newTag}>new</span>}
                </div>
                <div className={s.blockSub}>{b.id === 'fc' ? (v > 0 ? 'head, 512 → 5' : 'head, 512 → 1000') : 'pretrained backbone'}</div>
                <div className={`${s.badge} ${rg ? s.on : s.off}`}>{rg ? '✓ requires_grad' : '✗ frozen'}</div>
                <div className={`${s.badge} ${st.opt === null ? s.na : held ? s.on : s.off}`}>{st.opt === null ? 'no optimiser yet' : held ? '✓ in optimiser' : '✗ not in optimiser'}</div>
                {res && <div className={s.result}>{res === 'updated' ? '● updated' : res === 'frozen' ? '○ unchanged: no gradient' : '○ unchanged: not in optimiser'}</div>}
              </div>
            )
          })}
        </div>
        {stale && stale.length > 0 && (
          <Note tone="warn">
            The optimiser still holds the <b>old</b> fc's weights, which are no longer part of the model. Training will "update" tensors that nothing uses.
          </Note>
        )}
        <Readout
          items={[
            ['blocks held by optimiser', st.opt === null ? '–' : String(nHeld)],
            ['blocks requiring grad', String(nTrainable)],
            ['blocks updated last step', nUpdated === null ? '–' : String(nUpdated)],
          ]}
        />
        {st.error && (
          <Note tone="bad">
            <b>PyTorch stops with an error:</b> <code>{st.error}</code>.{' '}
            {st.error.startsWith('RuntimeError')
              ? 'Every parameter is frozen, so there is nothing to differentiate. Freezing everything does not give a flat loss: it crashes.'
              : st.error.startsWith('ValueError')
                ? 'No parameter requires a gradient, so there is nothing for the optimiser to hold.'
                : null}
          </Note>
        )}
        {st.step && (
          <Note tone={nUpdated === 0 || fcProblem ? 'bad' : nUpdated === BLOCKS.length ? 'info' : 'good'}>
            {nUpdated === 0 ? (
              <>
                <b>Nothing changed.</b> {st.step.fc === 'notHeld' ? 'The new fc gets a gradient, but the optimiser holds only the old weights.' : 'Every block is frozen or missing from the optimiser.'} The model
                can only guess. Create the optimiser <i>after</i> the last change to the model.
              </>
            ) : fcProblem ? (
              <>
                <b>The head did not learn.</b> {st.step.fc === 'notHeld' ? 'The new fc has a gradient, but the optimiser does not hold its weights.' : 'fc is frozen, so it gets no gradient.'} Create the
                optimiser after the last change to the model, from the parameters that require gradients.
              </>
            ) : nUpdated === BLOCKS.length ? (
              <>
                <b>Every block updated.</b> That is full fine-tuning: fine if you meant it, but slower, and with a small dataset it can overwrite the useful pretrained
                features.
              </>
            ) : (
              <>
                <b>
                  {nUpdated} of {BLOCKS.length} blocks updated.
                </b>{' '}
                {nUpdated === 1 ? 'Only the new head trains and the pretrained backbone stays fixed: exactly what this kind of transfer learning wants.' : 'The head trains, along with the unfrozen blocks.'}
              </>
            )}
          </Note>
        )}
        <CodePanel lines={st.log.slice(-9)} title="code so far" size={12} />
      </div>
    </Figure>
  )
}
