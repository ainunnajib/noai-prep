import { useMemo, useState, type CSSProperties, type ReactElement } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, usePlayer, PlayerControls, useContainerWidth, mulberry32 } from '../../../../../kit'
import { Note } from './parts'

/*
  Dropout, one training step at a time. A tiny fixed network (4 inputs, two hidden layers of 6
  ReLU neurons, 2 outputs) sees the same input every step. In training mode each hidden neuron is
  switched off with probability p and the survivors are multiplied by 1/(1 - p) ("inverted
  dropout", what nn.Dropout does). The table under the network shows hidden layer 1 before and
  after the mask; the running average of its total settles on the evaluation value.
  Aha: every step trains a different thinned network, and on average nothing is changed.
*/

const X = [1.0, 0.5, -0.5, 0.8]
const W1 = [
  [0, 1.0, 0.9, 0, 0.4, 0.6],
  [-0.3, 0.3, 0.7, 0.7, 0.4, 0.5],
  [0.5, 0.6, 0.5, 0.3, 0.2, 0.8],
  [0.9, 0.3, -0.3, 0.8, 0.7, -0.1],
]
const W2 = [
  [0.4, -0.1, 0.1, 0.2, 0.1, -0.2],
  [-0.1, 0.4, 0, -0.1, 0.3, 0],
  [0.1, 0.2, 0.2, 0.1, 0.4, 0.4],
  [0, 0.5, 0, 0, 0.5, -0.3],
  [0.4, 0, 0.3, 0.3, -0.1, 0.4],
  [0.4, 0.4, 0, 0, 0.1, 0.1],
]
const W3 = [
  [0.8, -0.6],
  [-0.7, -0.2],
  [0.7, -0.6],
  [0, 0.3],
  [-0.7, 0.9],
  [-0.8, 0.2],
]
const NH = 6
const STEPS = 60

const matVec = (v: number[], W: number[][]) => W[0].map((_, j) => v.reduce((s, vi, i) => s + vi * W[i][j], 0))
const relu = (v: number[]) => v.map((z) => Math.max(0, z))

/** fixed uniforms per training step, so raising p drops a superset of neurons */
function uniforms(step: number): number[] {
  const r = mulberry32(9003 + step * 7919)
  return Array.from({ length: 2 * NH }, () => r())
}

function forward(keep: boolean[] | null, p: number) {
  const s = keep ? 1 / (1 - p) : 1
  const a1 = relu(matVec(X, W1))
  const d1 = a1.map((v, j) => (keep ? (keep[j] ? v * s : 0) : v))
  const a2 = relu(matVec(d1, W2))
  const d2 = a2.map((v, j) => (keep ? (keep[NH + j] ? v * s : 0) : v))
  const out = matVec(d2, W3)
  return { a1, d1, a2, d2, out }
}

const sum = (v: number[]) => v.reduce((a, b) => a + b, 0)
const f2 = (v: number) => (Math.abs(v) < 0.005 ? '0.00' : v.toFixed(2))

export default function DropoutMask() {
  const [p, setP] = useState(0.5)
  const [mode, setMode] = useState<'train' | 'eval'>('train')
  const player = usePlayer({ steps: STEPS, interval: 850 })
  const [wrapRef, w] = useContainerWidth<HTMLDivElement>(560)
  const narrow = w < 470
  const train = mode === 'train'
  const step = player.step

  const keepAt = (k: number) => uniforms(k).map((u) => u >= p)
  const keep = train ? keepAt(step) : null
  const evalPass = useMemo(() => forward(null, 0), [])
  const pass = forward(keep, p)

  // running average of hidden-layer-1 total over the training steps so far, and distinct masks seen
  const { avg1, distinct } = useMemo(() => {
    let tot = 0
    const seen = new Set<string>()
    for (let k = 0; k <= step; k++) {
      const kp = uniforms(k).map((u) => u >= p)
      tot += sum(forward(kp, p).d1)
      seen.add(kp.map((b) => (b ? '1' : '0')).join(''))
    }
    return { avg1: tot / (step + 1), distinct: seen.size }
  }, [step, p])

  const kept = keep ? keep.filter(Boolean).length : 2 * NH
  const scale = 1 / (1 - p)

  // ---- network drawing ----
  const W = Math.max(300, Math.min(640, w))
  const Hh = narrow ? 270 : 300
  const r = narrow ? 15 : 18
  const padX = narrow ? 26 : 44
  const top = 22
  const bottom = 34
  const layers = [4, NH, NH, 2]
  const colX = (l: number) => padX + r + (l * (W - 2 * padX - 2 * r)) / 3
  const rowY = (l: number, i: number) => {
    const span = Hh - top - bottom
    const gap = span / NH
    return top + span / 2 + (i - (layers[l] - 1) / 2) * gap
  }
  const isOn = (l: number, i: number) => {
    if (!keep) return true
    if (l === 1) return keep[i]
    if (l === 2) return keep[NH + i]
    return true
  }
  const nodeVal = (l: number, i: number) => (l === 0 ? X[i] : l === 1 ? pass.d1[i] : l === 2 ? pass.d2[i] : pass.out[i])
  const maxVal = 2.2

  const edges: ReactElement[] = []
  for (let l = 0; l < 3; l++) {
    for (let i = 0; i < layers[l]; i++) {
      for (let j = 0; j < layers[l + 1]; j++) {
        const on = isOn(l, i) && isOn(l + 1, j)
        edges.push(
          <line
            key={`e${l}-${i}-${j}`}
            x1={colX(l)}
            y1={rowY(l, i)}
            x2={colX(l + 1)}
            y2={rowY(l + 1, j)}
            style={{ stroke: on ? 'var(--viz-axis)' : 'var(--viz-muted)', strokeWidth: on ? 1.1 : 0.8, opacity: on ? 0.55 : 0.12, strokeDasharray: on ? undefined : '3 4' }}
          />,
        )
      }
    }
  }

  const nodes: ReactElement[] = []
  layers.forEach((n, l) => {
    for (let i = 0; i < n; i++) {
      const on = isOn(l, i)
      const v = nodeVal(l, i)
      const cx = colX(l)
      const cy = rowY(l, i)
      const t = Math.min(1, Math.abs(v) / maxVal)
      const base = l === 3 ? (v >= 0 ? 'var(--viz-2)' : 'var(--viz-1)') : l === 0 ? 'var(--viz-3)' : 'var(--viz-1)'
      const fill = on ? `color-mix(in srgb, ${base} ${Math.round(10 + t * 38)}%, var(--surface))` : 'var(--surface-2)'
      nodes.push(
        <g key={`n${l}-${i}`}>
          <circle cx={cx} cy={cy} r={r} style={{ fill, stroke: on ? 'var(--viz-ink)' : 'var(--viz-muted)', strokeWidth: on ? 1.4 : 1.4, strokeDasharray: on ? undefined : '3 3' }} />
          <text x={cx} y={cy} dy="0.35em" textAnchor="middle" className="tabular" style={{ fontSize: narrow ? 10.5 : 11.5, fontWeight: 700, fill: on ? 'var(--viz-ink)' : 'var(--viz-muted)' }}>
            {on ? (l === 0 ? v.toFixed(1) : f2(v)) : '0'}
          </text>
        </g>,
      )
    }
  })

  const layerNames = ['input', 'hidden 1', 'hidden 2', 'output']

  // ---- table for hidden layer 1 ----
  const cell = narrow ? 36 : 44
  const labelW = narrow ? 58 : 76
  const grid: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `${labelW}px repeat(${NH}, ${cell}px) ${cell + 8}px`,
    fontSize: narrow ? '0.74rem' : '0.82rem',
    alignItems: 'center',
    rowGap: 3,
  }
  let cellKey = 0
  const numCell = (content: string, opts: { dim?: boolean; strong?: boolean; bg?: string } = {}) => (
    <span
      key={`c${cellKey++}`}
      className="tabular"
      style={{
        textAlign: 'center',
        padding: '2px 0',
        borderRadius: 4,
        fontWeight: opts.strong ? 700 : 500,
        color: opts.dim ? 'var(--ink-3)' : 'var(--ink)',
        background: opts.bg,
      }}
    >
      {content}
    </span>
  )
  const lab = (t: string) => (
    <span key={`l${t}`} style={{ color: 'var(--ink-2)', fontWeight: 700 }}>
      {t}
    </span>
  )

  return (
    <Figure
      title="Dropout: a different thinned network every step"
      caption={
        <>
          Press <b>Play</b> (or <b>Next</b>). Each training step, every hidden neuron is switched off with probability <b>p</b> (dashed circles) and
          the survivors are multiplied by <b>1/(1 − p)</b>. The output jumps around from step to step, yet the running average of the layer-1
          total settles on the evaluation value: on average nothing changes. Raise p to drop more and scale up harder. Switch to{' '}
          <b>evaluation</b>: all neurons come back and nothing is scaled.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.7rem', justifyItems: 'center' }}>
        <Segmented
          label="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'train', label: 'Training mode' },
            { value: 'eval', label: 'Evaluation mode' },
          ]}
        />
        <svg viewBox={`0 0 ${W} ${Hh}`} style={{ width: '100%', maxWidth: W, height: 'auto', display: 'block' }} role="img" aria-label={`Network with 4 inputs, two hidden layers of 6 neurons and 2 outputs. ${train ? `${kept} of 12 hidden neurons kept at this training step, survivors scaled by ${scale.toFixed(2)}.` : 'Evaluation mode: all neurons active.'}`}>
          {edges}
          {nodes}
          {layerNames.map((t, l) => (
            <text key={t} x={colX(l)} y={Hh - 8} textAnchor="middle" className="nnet-layer-label">
              {t}
            </text>
          ))}
          {train && p > 0 && (
            <>
              {[1, 2].map((l) => (
                <text key={l} x={colX(l)} y={12} textAnchor="middle" className="tabular" style={{ fontSize: 11.5, fontWeight: 700, fill: 'var(--viz-2)' }}>
                  {`× ${scale.toFixed(2)}`}
                </text>
              ))}
            </>
          )}
        </svg>

        <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
          <div style={grid} role="table" aria-label="Hidden layer 1 before and after dropout">
            {lab('neuron')}
            {Array.from({ length: NH }, (_, j) => numCell(`h${j + 1}`, { dim: true }))}
            {numCell('total', { dim: true })}

            {lab('before')}
            {evalPass.a1.map((v) => numCell(v.toFixed(2)))}
            {numCell(sum(evalPass.a1).toFixed(2), { strong: true })}

            {lab(train ? 'kept?' : 'mask')}
            {Array.from({ length: NH }, (_, j) =>
              numCell(train ? (keep![j] ? '1' : '0') : '—', {
                dim: !train,
                bg: train ? (keep![j] ? 'color-mix(in srgb, var(--viz-pos) 16%, transparent)' : 'color-mix(in srgb, var(--viz-neg) 16%, transparent)') : undefined,
              }),
            )}
            {numCell('', {})}

            {lab('after')}
            {pass.d1.map((v) => numCell(v.toFixed(2), { dim: v === 0 }))}
            {numCell(sum(pass.d1).toFixed(2), { strong: true })}
          </div>
        </div>

        {train ? (
          <Note>
            Training mode (<code>model.train()</code>), step {step + 1}: kept <b>{kept}</b> of 12 hidden neurons, survivors × <b>{scale.toFixed(2)}</b>. Layer-1 total this step{' '}
            <b className="tabular">{sum(pass.d1).toFixed(2)}</b>; average over the {step + 1} step{step ? 's' : ''} so far{' '}
            <b className="tabular">{avg1.toFixed(2)}</b>; without dropout <b className="tabular">{sum(evalPass.a1).toFixed(2)}</b>. Distinct thinned
            networks used so far: <b>{distinct}</b> of 2<sup>12</sup> = 4096.
          </Note>
        ) : (
          <Note tone="good">
            Evaluation mode (<code>model.eval()</code>): dropout is switched off. All 12 hidden neurons are used, nothing is multiplied, and the same input always gives the
            same output (<span className="tabular">{evalPass.out.map((v) => v.toFixed(2)).join(', ')}</span>).
          </Note>
        )}
      </div>
      <Controls>
        <Slider label="Drop probability p" value={p} min={0} max={0.8} step={0.1} onChange={setP} format={(v) => v.toFixed(1)} />
        <Readout
          items={[
            ['scale 1/(1−p)', train ? scale.toFixed(2) : '1 (off)'],
            ['outputs', pass.out.map((v) => v.toFixed(2)).join(', ')],
          ]}
        />
        {train && <PlayerControls player={player} label={(s) => `Training step ${s + 1} of ${STEPS}`} />}
      </Controls>
    </Figure>
  )
}
