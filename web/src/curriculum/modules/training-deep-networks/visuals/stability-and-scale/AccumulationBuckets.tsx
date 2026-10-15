import { type ReactElement, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, usePlayer, PlayerControls, useContainerWidth, CodeBlock, mulberry32 } from '../../../../../kit'
import { Note } from './parts'

/*
  Gradient accumulation as buckets. Each GPU works through k micro-batches of b examples. Every
  backward() pours that micro-batch's gradient (divided by k) into the GPU's .grad bucket; nothing is
  updated until the k-th micro-batch. Then the GPUs average their buckets (all-reduce), the optimiser
  takes ONE step, and zero_grad() empties the buckets. The dashed line is the gradient of one real
  batch of b x k x G examples; with the division the buckets fill exactly to it.
  Aha: accumulation trades time for memory and gives the same update as one large batch.
*/

// gradient of one weight on each micro-batch: GRADS[gpu][i] (fixed, about 1 +- 0.3)
const GRADS: number[][] = (() => {
  const r = mulberry32(5)
  const g = () => {
    const u = Math.max(r(), 1e-12)
    const v = r()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  return Array.from({ length: 4 }, () => Array.from({ length: 8 }, () => Math.round((1 + 0.3 * g()) * 100) / 100))
})()

const LR = 0.1
const BASE_BATCH = 256
const BASE_LR = 0.1

export default function AccumulationBuckets() {
  const [b, setB] = useState(32)
  const [k, setK] = useState(4)
  const [G, setG] = useState(1)
  const [forgot, setForgot] = useState(false)
  const player = usePlayer({ steps: k + 1, interval: 1100 })
  const [wrapRef, cw] = useContainerWidth<HTMLDivElement>(600)
  const narrow = cw < 520
  const s = Math.min(player.step, k)
  const stepPhase = s === k
  const done = stepPhase ? k : s + 1 // micro-batches already poured

  const Nbig = b * k * G
  const bigGrad = GRADS.slice(0, G).reduce((acc, row) => acc + row.slice(0, k).reduce((a, v) => a + v, 0), 0) / (k * G)
  const div = forgot ? 1 : k
  const bucket = (gpu: number) => GRADS[gpu].slice(0, done).reduce((a, v) => a + v / div, 0)
  const avg = Array.from({ length: G }, (_, gpu) => bucket(gpu)).reduce((a, v) => a + v, 0) / G
  const ratio = avg / bigGrad

  // ---- layout ----
  const W = Math.max(300, Math.min(680, cw))
  const panelW = narrow ? W : 200
  const laneW = narrow ? W : W - panelW - 14
  const laneH = G === 1 ? (narrow ? 118 : 140) : G === 2 ? (narrow ? 92 : 104) : narrow ? 72 : 78
  const top = 22
  const lanesH = top + G * laneH
  const panelH = narrow ? 120 : Math.max(lanesH - 8, 176)
  const H = narrow ? lanesH + 12 + panelH + 4 : Math.max(lanesH, panelH + 10) + 6
  const labelW = narrow ? 46 : 54
  const bucketW = narrow ? 48 : 60
  const bucketH = laneH - 28
  const gapToBucket = narrow ? 34 : 56
  const chipsW = laneW - labelW - gapToBucket - bucketW - 4
  const chip = Math.max(16, Math.min(narrow ? 36 : 46, Math.floor(chipsW / k) - 6))
  const chipGap = Math.max(3, Math.min(10, Math.floor((chipsW - k * chip) / Math.max(1, k))))
  const bx = laneW - bucketW - 4
  const FULL = 1.6 // bucket top = 1.6 x the big-batch gradient
  const lvl = (v: number) => (v / (FULL * bigGrad)) * bucketH

  const lanes: ReactElement[] = []
  for (let gpu = 0; gpu < G; gpu++) {
    const y0 = top + gpu * laneH
    const by = y0 + 18
    const cy = by + bucketH / 2
    const segs: ReactElement[] = []
    let acc = 0
    let overflow = false
    for (let i = 0; i < done; i++) {
      const v = GRADS[gpu][i] / div
      const h0 = lvl(acc)
      acc += v
      const h1 = Math.min(lvl(acc), bucketH + 8)
      if (lvl(acc) > bucketH + 0.5) overflow = true
      if (h0 >= bucketH + 8) continue
      segs.push(
        <rect
          key={`s${i}`}
          x={bx + 3}
          y={by + bucketH - h1}
          width={bucketW - 6}
          height={Math.max(0, h1 - h0 - 1)}
          rx={2}
          style={{ fill: `color-mix(in srgb, ${lvl(acc) > bucketH + 0.5 ? 'var(--viz-neg)' : 'var(--viz-3)'} ${i % 2 ? 55 : 85}%, var(--surface))` }}
        />,
      )
    }
    const chipsEnd = labelW + k * (chip + chipGap) - chipGap
    const targetY = by + bucketH - lvl(bigGrad)
    lanes.push(
      <g key={`lane${gpu}`}>
        <text x={0} y={cy} dy="0.35em" style={{ fontSize: 12, fontWeight: 700, fill: 'var(--viz-ink)' }}>
          {`GPU ${gpu + 1}`}
        </text>
        {Array.from({ length: k }, (_, i) => {
          const x = labelW + i * (chip + chipGap)
          const isNow = !stepPhase && i === s
          const isDone = i < done && !isNow
          return (
            <g key={`c${i}`}>
              <rect
                x={x}
                y={cy - chip / 2}
                width={chip}
                height={chip}
                rx={5}
                style={{
                  fill: isNow ? 'color-mix(in srgb, var(--viz-2) 70%, var(--surface))' : isDone ? 'color-mix(in srgb, var(--viz-1) 22%, var(--surface))' : 'var(--surface)',
                  stroke: isNow ? 'var(--viz-2)' : isDone ? 'var(--viz-1)' : 'var(--viz-muted)',
                  strokeWidth: isNow ? 2.4 : 1.3,
                  strokeDasharray: isDone || isNow ? undefined : '3 3',
                }}
              />
              {chip >= 22 && (
                <text x={x + chip / 2} y={cy} dy="0.35em" textAnchor="middle" className="tabular" style={{ fontSize: chip < 30 ? 10 : 12, fontWeight: 700, fill: isDone || isNow ? 'var(--viz-ink)' : 'var(--viz-muted)' }}>
                  {b}
                </text>
              )}
            </g>
          )
        })}
        <path d={`M${chipsEnd + 6},${cy}L${bx - 9},${cy}`} style={{ stroke: 'var(--viz-muted)', strokeWidth: 1.6, strokeDasharray: '2 3' }} />
        <path d={`M${bx - 9},${cy - 5}L${bx - 2},${cy}L${bx - 9},${cy + 5}Z`} style={{ fill: 'var(--viz-muted)' }} />
        {segs}
        <path d={`M${bx},${by}L${bx},${by + bucketH}L${bx + bucketW},${by + bucketH}L${bx + bucketW},${by}`} style={{ fill: 'none', stroke: overflow ? 'var(--viz-neg)' : 'var(--viz-ink)', strokeWidth: 2.2 }} strokeLinejoin="round" />
        <line x1={bx - 5} x2={bx + bucketW + 5} y1={targetY} y2={targetY} style={{ stroke: 'var(--viz-ink)', strokeWidth: 1.5, strokeDasharray: '4 3' }} />
        {gpu === 0 && bucketH >= 70 && !narrow && (
          <text x={bx - 8} y={targetY - 6} textAnchor="end" style={{ fontSize: 10.5, fill: 'var(--ink-2)' }}>
            one big batch
          </text>
        )}
        {overflow && (
          <text x={bx + bucketW / 2} y={by - 12} textAnchor="middle" style={{ fontSize: 11.5, fontWeight: 700, fill: 'var(--viz-neg)' }}>
            {`× ${(bucket(gpu) / (GRADS[gpu].slice(0, k).reduce((a, v) => a + v, 0) / k)).toFixed(1)}`}
          </text>
        )}
      </g>,
    )
  }

  // ---- update panel ----
  const px = narrow ? 0 : laneW + 14
  const py = narrow ? lanesH + 12 : 6
  const pOff = narrow ? 0 : Math.max(0, Math.round((panelH - 112) / 2))
  const barX0 = px + 12
  const barMax = panelW - 34
  const refLen = barMax * 0.42
  const myLen = Math.min(barMax, refLen * ratio)
  const arrow = (y: number, len: number, color: string, dash?: string) => (
    <g>
      <line x1={barX0} x2={barX0 + Math.max(0, len - 8)} y1={y} y2={y} style={{ stroke: color, strokeWidth: 4, strokeDasharray: dash }} strokeLinecap="round" />
      <path d={`M${barX0 + len},${y}L${barX0 + len - 10},${y - 6}L${barX0 + len - 10},${y + 6}Z`} style={{ fill: color }} />
    </g>
  )
  const panelTitle = stepPhase ? (G > 1 ? 'average over GPUs, then step()' : 'optimiser.step()') : 'no update yet'

  return (
    <Figure
      title="Gradient accumulation: fill the bucket, then step once"
      caption={
        <>
          Press <b>Play</b>. Each chip is a micro-batch of <b>b</b> examples, the most your GPU can hold at once. Every <code>backward()</code> pours that
          micro-batch's gradient (divided by <b>k</b>) into the <code>.grad</code> bucket; only after <b>k</b> micro-batches does the optimiser take one step.
          The dashed line is the gradient of one real batch of b × k × GPUs examples: the buckets fill exactly to it. Tick <b>Forgot to divide</b> to see
          them overflow.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '0.6rem', justifyItems: 'center' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto', display: 'block' }} role="img" aria-label={`${G} GPU${G > 1 ? 's' : ''}, ${k} micro-batches of ${b} each, effective batch ${Nbig}. ${stepPhase ? 'Optimiser step.' : `Micro-batch ${s + 1} of ${k}.`}`}>
          <text x={labelW} y={12} style={{ fontSize: 11.5, fontWeight: 700, fill: 'var(--ink-2)' }}>
            micro-batches
          </text>
          <text x={bx + bucketW / 2} y={12} textAnchor="middle" style={{ fontSize: 11.5, fontWeight: 700, fill: 'var(--ink-2)' }}>
            .grad
          </text>
          {lanes}
          <g>
            <rect x={px} y={py} width={panelW} height={panelH} rx={10} style={{ fill: stepPhase ? 'color-mix(in srgb, var(--viz-3) 10%, var(--surface))' : 'var(--surface-2)', stroke: stepPhase ? 'var(--viz-3)' : 'var(--rule)', strokeWidth: 1.4 }} />
            <text x={px + 12} y={py + 20} style={{ fontSize: 12, fontWeight: 700, fill: 'var(--viz-ink)' }}>
              {panelTitle}
            </text>
            {stepPhase ? (
              <>
                <text x={barX0} y={py + pOff + 44} style={{ fontSize: 11, fill: 'var(--ink-2)' }}>
                  {`your update  ${(LR * avg).toFixed(3)}`}
                </text>
                {arrow(py + pOff + 56, myLen, forgot ? 'var(--viz-neg)' : 'var(--viz-3)')}
                <text x={barX0} y={py + pOff + 84} style={{ fontSize: 11, fill: 'var(--ink-2)' }}>
                  {`one batch of ${Nbig}  ${(LR * bigGrad).toFixed(3)}`}
                </text>
                {arrow(py + pOff + 96, refLen, 'var(--viz-muted)', '5 4')}
                {forgot && ratio * refLen > barMax && (
                  <text x={px + panelW - 10} y={py + pOff + 44} textAnchor="end" style={{ fontSize: 11, fontWeight: 700, fill: 'var(--viz-neg)' }}>
                    {`${ratio.toFixed(1)}× too big`}
                  </text>
                )}
              </>
            ) : (
              <>
                <text x={px + 12} y={py + pOff + 46} style={{ fontSize: 11.5, fill: 'var(--ink-2)' }}>
                  {`${k - done} more micro-batch${k - done === 1 ? '' : 'es'} to go`}
                </text>
                <text x={px + 12} y={py + pOff + 66} style={{ fontSize: 11.5, fill: 'var(--ink-2)' }}>
                  weights unchanged
                </text>
              </>
            )}
          </g>
        </svg>
        <div style={{ width: '100%', maxWidth: 560, minWidth: 0, overflowX: 'auto', fontSize: narrow ? '0.78rem' : '0.85rem' }}>
          <CodeBlock
            title="the loop"
            showLineNumbers={false}
            highlight={stepPhase ? [5, 6] : [2, 3]}
            code={
              narrow
                ? `for i, (x, y) in enumerate(loader):\n    loss = loss_fn(model(x), y)${forgot ? '' : ` / ${k}`}\n    loss.backward()\n    if (i + 1) % ${k} == 0:\n        optimiser.step()\n        optimiser.zero_grad()`
                : `for i, (x, y) in enumerate(loader):      # batches of ${b}\n    loss = loss_fn(model(x), y)${forgot ? '' : ` / ${k}`}\n    loss.backward()                      # pour into .grad\n    if (i + 1) % ${k} == 0:\n        optimiser.step()                 # one update\n        optimiser.zero_grad()            # empty the bucket`
            }
          />
        </div>
        <Note tone={stepPhase ? (forgot && k > 1 ? 'bad' : 'good') : 'plain'}>
          {stepPhase ? (
            forgot && k > 1 ? (
              <>
                Without <code>/ {k}</code>, each bucket holds the <b>sum</b> of {k} mean gradients: <b>{ratio.toFixed(1)}×</b> the real batch gradient. The step is {k} times too
                big, exactly as if you had secretly multiplied the learning rate by {k}.
              </>
            ) : (
              <>
                {G > 1 ? `The ${G} GPUs average their buckets, then ` : ''}
                <code>optimiser.step()</code> uses <b className="tabular">{avg.toFixed(3)}</b>: the same as the gradient of one batch of {Nbig} (
                <span className="tabular">{bigGrad.toFixed(3)}</span>). Then <code>zero_grad()</code> empties the bucket for the next round.
              </>
            )
          ) : (
            <>
              Micro-batch {s + 1} of {k}: forward pass on {b} examples{G > 1 ? ` (on each of the ${G} GPUs at once, on different examples)` : ''}, loss{' '}
              {forgot ? 'not divided' : `÷ ${k}`}, and <code>backward()</code> adds{' '}
              <span className="tabular">{(GRADS[0][s] / div).toFixed(3)}</span> to GPU 1&apos;s <code>.grad</code>. No weights change yet.
            </>
          )}
        </Note>
      </div>
      <Controls>
        <Segmented
          label="Micro-batch b (fits in memory)"
          value={b}
          onChange={setB}
          options={[8, 16, 32, 64].map((v) => ({ value: v, label: String(v) }))}
        />
        <Slider
          label="Accumulation steps k"
          value={k}
          min={1}
          max={8}
          step={1}
          onChange={(v) => {
            setK(v)
            player.reset()
          }}
        />
        <Segmented
          label="GPUs"
          value={G}
          onChange={(v) => {
            setG(v)
            player.reset()
          }}
          options={[1, 2, 4].map((v) => ({ value: v, label: String(v) }))}
        />
        <Toggle label={`Forgot to divide the loss by k`} checked={forgot} onChange={setForgot} />
        <PlayerControls player={player} label={(st) => (st >= k ? 'optimiser step' : `micro-batch ${st + 1} of ${k}`)} />
        <Readout
          items={[
            ['effective batch b × k × GPUs', `${b} × ${k} × ${G} = ${Nbig}`],
            ['passes per update (each GPU)', String(k)],
            [`linear scaling: lr for batch ${Nbig}`, `${BASE_LR} × ${Nbig}/${BASE_BATCH} = ${String(Number(((BASE_LR * Nbig) / BASE_BATCH).toPrecision(3)))}`],
          ]}
        />
      </Controls>
    </Figure>
  )
}
