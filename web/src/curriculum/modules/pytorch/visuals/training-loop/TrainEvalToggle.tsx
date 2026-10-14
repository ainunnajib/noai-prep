import { useState } from 'react'
import { Figure, Controls, Readout, Segmented, Toggle, Button, Plot, Axes, Dots, Label, HLine } from '../../../../../kit'
import { run, COMPANIONS, RM0, RV0, type BNState } from './tevModel'
import { MONO } from './PyCode'

/*
  The same example A goes through a small network with BatchNorm and Dropout again and again.
  In train mode its output changes every run (a new dropout mask) and depends on the other
  examples in the batch (batch statistics). In eval mode it is identical every time.
  torch.no_grad() only switches off the autograd recording: the outputs do not change.
*/

interface Run {
  train: boolean
  noGrad: boolean
  out: number
  keep: boolean[]
  hidden: number[]
  dropped: number[]
}

interface State {
  bn: BNState
  runs: Run[]
  seed: number
}

function step(s: State, train: boolean, noGrad: boolean, comp: number): State {
  const r = run(train, COMPANIONS[comp], s.bn, s.seed)
  return { bn: r.next, seed: s.seed + 1, runs: [...s.runs, { train, noGrad, out: r.out, keep: r.keep, hidden: r.hidden, dropped: r.dropped }].slice(-12) }
}

function initial(): State {
  let s: State = { bn: { rm: RM0, rv: RV0 }, runs: [], seed: 0 }
  for (let i = 0; i < 5; i++) s = step(s, true, false, 0)
  for (let i = 0; i < 3; i++) s = step(s, false, false, 0)
  return s
}

const BOXES = [
  { name: 'Linear(3, 4)', train: 'same in both modes', eval: 'same in both modes', changes: false },
  { name: 'BatchNorm1d(4)', train: "normalises with this batch's mean and variance, and updates its running averages", eval: 'normalises with the stored running averages', changes: true },
  { name: 'ReLU()', train: 'same in both modes', eval: 'same in both modes', changes: false },
  { name: 'Dropout(p=0.5)', train: 'zeroes each unit with probability 0.5, doubles the rest', eval: 'does nothing: passes every unit through', changes: true },
  { name: 'Linear(4, 1)', train: 'same in both modes', eval: 'same in both modes', changes: false },
]

export default function TrainEvalToggle() {
  const [train, setTrain] = useState(false)
  const [noGrad, setNoGrad] = useState(false)
  const [comp, setComp] = useState(0)
  const [s, setS] = useState<State>(initial)
  const last = s.runs[s.runs.length - 1]

  const doRun = (c = comp, t = train) => setS((p) => step(p, t, noGrad, c))

  // dot plot: runs with exactly the same output share one dot, labelled with a count
  const rowY = (t: boolean) => (t ? 1.55 : 0.45)
  const groups = (() => {
    const m = new Map<string, { x: number; train: boolean; n: number; last: boolean }>()
    s.runs.forEach((r, i) => {
      const k = `${r.train}-${r.out.toFixed(4)}`
      const g = m.get(k) ?? { x: Math.min(6, r.out), train: r.train, n: 0, last: false }
      g.n++
      if (i === s.runs.length - 1) g.last = true
      m.set(k, g)
    })
    return [...m.values()]
  })()

  const chip = (v: number, kept: boolean, drop: boolean) => (
    <span
      style={{
        display: 'inline-grid',
        placeItems: 'center',
        minWidth: 48,
        padding: '3px 6px',
        borderRadius: 8,
        fontFamily: MONO,
        fontSize: 13,
        fontWeight: 650,
        border: `1.5px solid ${kept ? 'var(--viz-1)' : 'var(--rule)'}`,
        background: kept ? 'color-mix(in srgb, var(--viz-1) 12%, var(--surface))' : 'var(--surface-2)',
        color: kept ? 'var(--ink)' : 'var(--ink-3)',
        textDecoration: drop ? 'line-through' : undefined,
      }}
    >
      {drop ? '0 ✕' : v.toFixed(2)}
    </span>
  )

  return (
    <Figure
      wide
      title="Same input, same weights: train mode versus eval mode"
      caption={
        <>
          Example A has already been run five times in train mode (orange: five different answers) and three times in eval mode (blue: one answer, ×3). Press <b>Run model(x)</b> in each mode,
          then change the other examples in A's batch: in train mode A's answer changes, in eval mode it does not. Turning on <code>torch.no_grad()</code> changes neither; it only stops the
          recording of the graph. (BatchNorm's running averages move a little after every train-mode run, so eval answers from different moments can differ slightly.)
        </>
      }
    >
      <Controls>
        <Segmented
          label="Mode"
          value={train ? 'train' : 'eval'}
          onChange={(v) => {
            setTrain(v === 'train')
            doRun(comp, v === 'train')
          }}
          options={[
            { value: 'train', label: 'model.train()' },
            { value: 'eval', label: 'model.eval()' },
          ]}
        />
        <Toggle label="inside with torch.no_grad():" checked={noGrad} onChange={setNoGrad} />
      </Controls>

      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'stretch' }} aria-label="The layers of the network and what each does in the current mode">
        {BOXES.map((b) => (
          <div
            key={b.name}
            style={{
              flex: '1 1 120px',
              minWidth: 0,
              padding: '6px 8px',
              borderRadius: 10,
              border: `1.5px solid ${b.changes ? (train ? 'var(--viz-2)' : 'var(--viz-1)') : 'var(--rule)'}`,
              background: b.changes ? `color-mix(in srgb, ${train ? 'var(--viz-2)' : 'var(--viz-1)'} 9%, var(--surface))` : 'var(--surface-2)',
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: 'var(--ink)' }}>{b.name}</div>
            <div style={{ fontSize: 12, lineHeight: 1.35, color: b.changes ? 'var(--ink)' : 'var(--ink-3)', marginTop: 2 }}>{train ? b.train : b.eval}</div>
          </div>
        ))}
      </div>

      {last && (
        <div style={{ width: '100%', display: 'grid', gap: 6 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 650, color: 'var(--ink-2)', minWidth: 170 }}>A's 4 hidden units after ReLU</span>
            {last.hidden.map((h, j) => (
              <span key={j}>{chip(h, true, false)}</span>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 650, color: 'var(--ink-2)', minWidth: 170 }}>…after Dropout {last.train ? '(×2 survivors)' : '(nothing dropped)'}</span>
            {last.dropped.map((d, j) => (
              <span key={j}>{chip(d, last.keep[j], !last.keep[j])}</span>
            ))}
          </div>
        </div>
      )}

      <Plot x={[0, 6]} y={[0, 2.2]} width={560} height={140} minHeight={140} margin={{ left: 16, right: 18, top: 10, bottom: 32 }} ariaLabel="Each run's output for example A: train-mode runs in the top row, eval-mode runs in the bottom row">
        <HLine y={1.55} color="var(--viz-grid)" dash="0" width={1} />
        <HLine y={0.45} color="var(--viz-grid)" dash="0" width={1} />
        <Axes xTicks={6} hideYTicks xLabel="output y for example A" />
        <Label x={0.05} y={1.55} dy={-14} color="var(--viz-2)" weight={700} size={12}>
          train-mode runs
        </Label>
        <Label x={0.05} y={0.45} dy={-14} color="var(--viz-1)" weight={700} size={12}>
          eval-mode runs
        </Label>
        {groups
          .filter((g) => g.last)
          .map((g, i) => (
            <Dots key={i} points={[{ x: g.x, y: rowY(g.train), r: 10.5, hollow: true, color: 'var(--ink)' }]} />
          ))}
        <Dots points={groups.map((g) => ({ x: g.x, y: rowY(g.train), r: 6, color: g.train ? 'var(--viz-2)' : 'var(--viz-1)' }))} />
        {groups
          .filter((g) => g.n > 1)
          .map((g, i) => (
            <Label key={i} x={g.x} y={rowY(g.train)} dx={12} dy={-8} size={12} weight={700} color="var(--ink)">
              ×{g.n}
            </Label>
          ))}
      </Plot>

      <Controls>
        <Button primary onClick={() => doRun()}>
          Run model(x)
        </Button>
        <Button
          onClick={() => {
            const c = (comp + 1) % COMPANIONS.length
            setComp(c)
            doRun(c)
          }}
        >
          Change the other 3 examples in the batch
        </Button>
        <Button onClick={() => setS((p) => ({ ...p, runs: [] }))} disabled={!s.runs.length}>
          Clear dots
        </Button>
      </Controls>
      <Readout
        items={[
          ['last output for A', last ? last.out.toFixed(3) : '–'],
          ['batch-mates', `set ${comp + 1} of 3`],
          ['autograd graph', noGrad ? 'not recorded' : 'recorded'],
          ['BN running_mean[0]', s.bn.rm[0].toFixed(3)],
        ]}
      />
    </Figure>
  )
}
