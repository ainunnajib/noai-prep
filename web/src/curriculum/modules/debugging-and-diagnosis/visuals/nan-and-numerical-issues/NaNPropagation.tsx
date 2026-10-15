import { useEffect, useState, type ReactNode } from 'react'
import { Figure, Controls, Segmented, Toggle, usePlayer, PlayerControls, useContainerWidth, M } from '../../../../../kit'
import s from './nan.module.css'

/*
  A tiny fully connected network (3 inputs → 3 → 3 → 3 logits → loss) goes through one training step
  and then sees the next batch. One operation produces the first bad value:
    log 0     in the loss:   −log p with p = e^(−200), which rounds to 0 in float32  → inf
    0 ÷ 0     in layer 1:    (h − mean) / std with std = 0                             → nan
    overflow  in layer 2:    softmax computes e^120 > float32 max (≈ e^88.7)           → inf
  The learner watches the bad value spread: forward to the loss, backward to every gradient,
  then through optimiser.step() into every weight. Toggling the fix keeps everything finite.
  The "finite?" table is what a per-layer check (or a forward hook) would print, in forward order.
*/

type Src = 'log0' | 'div0' | 'overflow'
type St = 'idle' | 'ok' | 'inf' | 'nan'

const GROUPS = ['input', 'layer 1', 'layer 2', 'logits', 'loss'] as const
const SRC_GROUP: Record<Src, number> = { log0: 4, div0: 1, overflow: 2 }
const SRC_TAG: Record<Src, string> = { log0: '−log p', div0: '÷ std', overflow: 'exp in softmax' }

/** States of every node after one forward pass. */
function forward(src: Src, fix: boolean, weightsNan: boolean): St[][] {
  const ok3: St[] = ['ok', 'ok', 'ok']
  if (weightsNan) return [ok3, ['nan', 'nan', 'nan'], ['nan', 'nan', 'nan'], ['nan', 'nan', 'nan'], ['nan']]
  if (fix) return [ok3, ok3, ok3, ok3, ['ok']]
  if (src === 'log0') return [ok3, ok3, ok3, ok3, ['inf']]
  if (src === 'div0') return [ok3, ['nan', 'nan', 'nan'], ['nan', 'nan', 'nan'], ['nan', 'nan', 'nan'], ['nan']]
  return [ok3, ok3, ['ok', 'inf', 'ok'], ['inf', 'inf', 'inf'], ['nan']]
}

const STEP_NAMES = ['Batch arrives', 'Forward: first bad value', 'Forward: the loss', 'Backward: gradients', 'Update: weights', 'Next batch']

function narration(src: Src, fix: boolean, step: number): ReactNode {
  const C = ({ children }: { children: ReactNode }) => <code className={s.code}>{children}</code>
  if (step === 0) return <>A batch of clean data enters the network. Values flow forward, layer by layer, towards the loss.</>
  if (fix) {
    const first: Record<Src, ReactNode> = {
      log0: (
        <>
          The logits are (100, 0, −100) and the true class is the third. Instead of taking the log of a probability, the loss is computed
          straight from the logits with log-softmax (<C>F.cross_entropy</C> does this): loss = 200. Huge, but finite.
        </>
      ),
      div0: (
        <>
          Layer 1 standardises its outputs. In this batch all three are equal, so std = 0, but the layer divides by std + ε with ε = 10⁻⁵:
          0 ÷ 0.00001 = 0. No nan.
        </>
      ),
      overflow: (
        <>
          Layer 2 applies softmax to its inputs (exp, then divide by the sum), and one input is 120. Subtracting the max first gives{' '}
          <M>{'e^{120 - 120} = e^0 = 1'}</M>. No overflow, and the output is unchanged: the common factor <M>{'e^{-120}'}</M> cancels between top and bottom.
        </>
      ),
    }
    if (step === 1) return first[src]
    if (step === 2) return <>Everything after the risky operation stays finite, so the loss is an ordinary number.</>
    if (step === 3) return <><C>loss.backward()</C> produces finite gradients for every weight (green dashes).</>
    if (step === 4) return <><C>optimiser.step()</C> takes a normal step, w ← w − η·g. Every weight is still a real number.</>
    return <>The next batch flows through healthy weights. Training carries on as if nothing happened.</>
  }
  if (step === 1) {
    if (src === 'log0')
      return (
        <>
          The layers are fine, but the logits are (100, 0, −100) and the true class is the third: <M>{'p_3 \\approx e^{-200}'}</M> is too
          small for float32 and rounds to 0. The loss <M>{'-\\log p_3 = -\\log 0'}</M> = <b>inf</b>.
        </>
      )
    if (src === 'div0')
      return (
        <>
          Layer 1 standardises its outputs: (h − mean) ÷ std. In this batch all three outputs are equal, so h − mean = 0 and std = 0. Every
          output is 0 ÷ 0 = <b>nan</b>.
        </>
      )
    return (
      <>
        Layer 2 applies softmax to its inputs (exp, then divide by the sum), and one input is 120. The largest float32 is about <M>{'e^{88.7}'}</M>, so <M>{'e^{120}'}</M>{' '}
        overflows to <b>inf</b>.
      </>
    )
  }
  if (step === 2) {
    if (src === 'log0')
      return (
        <>
          The loss is inf, not nan yet, but it is already a warning: one more operation such as 0 × inf or inf − inf gives nan, and the
          backward pass is about to do exactly that.
        </>
      )
    if (src === 'div0') return <>Anything computed from a nan is nan: layer 2, all the logits and the loss are now nan.</>
    return (
      <>
        Each logit adds up weight × input, so it inherits the inf (as +inf or −inf). The loss's softmax then computes inf ÷ inf ={' '}
        <b>nan</b>.
      </>
    )
  }
  if (step === 3)
    return (
      <>
        <C>loss.backward()</C> sends gradients back from the loss. Every gradient passes through the bad value, so <b>all</b> of them are
        nan: ∂L/∂W₁, ∂L/∂W₂ and ∂L/∂W₃ (red dashes).
      </>
    )
  if (step === 4)
    return (
      <>
        <C>optimiser.step()</C> computes w ← w − η·g. With g = nan, <b>every weight becomes nan</b>, even in layers that had nothing to do
        with the original problem.
      </>
    )
  return (
    <>
      The next batch is perfectly clean, yet every activation and the loss are nan, because the weights are. Training never recovers.{' '}
      {src === 'div0' ? (
        <>Here the check table happens to point at layer 1, the real source, but only because the first bad value was there too.</>
      ) : (
        <>
          Notice that the check table now blames <b>layer 1</b>: by now, the last nan tells you nothing about the cause.
        </>
      )}
    </>
  )
}

function fill(st: St) {
  if (st === 'idle') return 'var(--surface)'
  if (st === 'ok') return 'color-mix(in srgb, var(--viz-1) 16%, var(--surface))'
  if (st === 'inf') return 'color-mix(in srgb, var(--viz-2) 32%, var(--surface))'
  return 'color-mix(in srgb, var(--viz-neg) 34%, var(--surface))'
}
function stroke(st: St) {
  if (st === 'idle') return 'var(--viz-muted)'
  if (st === 'ok') return 'var(--viz-1)'
  if (st === 'inf') return 'var(--viz-2)'
  return 'var(--viz-neg)'
}

export default function NaNPropagation() {
  const [src, setSrc] = useState<Src>('div0')
  const [fix, setFix] = useState(false)
  const player = usePlayer({ steps: 6, interval: 1900 })
  // Rest on the last step so the figure is complete before anyone presses Play.
  useEffect(() => {
    player.setStep(5)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const step = player.step
  const [wrapRef, measured] = useContainerWidth<HTMLDivElement>(560)
  const W = Math.max(300, Math.min(600, measured))
  const narrow = W < 440
  const H = narrow ? 246 : 258
  const padX = narrow ? 26 : 40
  const top = 68
  const bottom = H - 46
  const r = narrow ? 13 : 15

  const srcGroup = SRC_GROUP[src]
  const weightsNan = !fix && step >= 4
  const full = forward(src, fix, step === 5 ? weightsNan : false)
  // how far the forward pass has got
  const shownUpTo = step === 0 ? 0 : step === 1 ? srcGroup : 4
  const states: St[][] = full.map((g, gi) => (gi <= shownUpTo ? g : g.map(() => 'idle' as St)))
  const showGrads = step === 3
  const gradBad = !fix

  const colX = (g: number) => padX + (g * (W - 2 * padX)) / 4
  const rowY = (n: number, i: number) => {
    if (n === 1) return (top + bottom) / 2
    const gap = (bottom - top) / 2
    return top + i * gap
  }
  const pos = (g: number, i: number): [number, number] => [colX(g), rowY(g === 4 ? 1 : 3, i)]

  // edges: weights W1 (0→1), W2 (1→2), W3 (2→3); plain lines 3→4
  const edges: { g: number; i: number; j: number }[] = []
  for (let g = 0; g < 3; g++) for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) edges.push({ g, i, j })

  const checkRows = [1, 2, 3, 4].map((g) => {
    const st = states[g]
    const computed = st.every((v) => v !== 'idle')
    const bad = st.find((v) => v === 'nan' || v === 'inf')
    return { g, computed, bad }
  })
  const firstBadRow = checkRows.find((r) => r.computed && r.bad)

  const sourceLabel: Record<Src, string> = { log0: 'log 0', div0: '0 ÷ 0', overflow: 'overflow' }
  const fixLabel: Record<Src, string> = {
    log0: 'Fix: loss from logits (log-softmax)',
    div0: 'Fix: divide by std + ε',
    overflow: 'Fix: subtract the max before exp',
  }

  return (
    <Figure
      title="Watch one bad value take over a network"
      caption={
        <>
          Pick where the first bad value comes from and press <b>Replay</b> (or <b>Play</b>); use <b>Back</b>/<b>Next</b> to go one step at a time. Watch
          the colour spread forward to the loss, backward into every gradient, then into every weight. Then switch on the fix and replay.
          Compare the check table at the last step with the one at step 2: only the first bad value points at the real cause.
        </>
      }
    >
      <div className={s.wrap}>
        <Controls>
          <Segmented
            label="Source of the first bad value"
            value={src}
            onChange={(v) => {
              setSrc(v)
              player.setStep(5)
            }}
            options={[
              { value: 'log0', label: 'log 0' },
              { value: 'div0', label: '0 ÷ 0' },
              { value: 'overflow', label: 'overflow' },
            ]}
          />
          <Toggle label={fixLabel[src]} checked={fix} onChange={setFix} />
        </Controls>

        <div ref={wrapRef} style={{ width: '100%' }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Network diagram, step ${step + 1}: ${STEP_NAMES[step]}`} style={{ display: 'block', maxWidth: 600, margin: '0 auto' }}>
            {/* weight labels */}
            {[0, 1, 2].map((g) => (
              <text key={`wl${g}`} x={(colX(g) + colX(g + 1)) / 2} y={15} textAnchor="middle" style={{ fill: weightsNan ? 'var(--viz-neg)' : 'var(--ink-2)', fontSize: 13, fontWeight: 700 }}>
                {`W${'₁₂₃'[g]}`}
                {weightsNan ? ' = nan' : ''}
              </text>
            ))}
            {/* weight edges */}
            {edges.map(({ g, i, j }) => {
              const [x1, y1] = pos(g, i)
              const [x2, y2] = pos(g + 1, j)
              return (
                <line
                  key={`e${g}${i}${j}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  style={{
                    stroke: weightsNan ? 'var(--viz-neg)' : 'var(--viz-muted)',
                    strokeWidth: weightsNan ? 2 : 1.2,
                    opacity: weightsNan ? 0.8 : 0.55,
                  }}
                />
              )
            })}
            {/* gradient overlay during the backward pass */}
            {showGrads &&
              edges.map(({ g, i, j }) => {
                const [x1, y1] = pos(g, i)
                const [x2, y2] = pos(g + 1, j)
                return (
                  <line
                    key={`gr${g}${i}${j}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    style={{ stroke: gradBad ? 'var(--viz-neg)' : 'var(--viz-pos)', strokeWidth: 2.2, strokeDasharray: '5 4' }}
                  />
                )
              })}
            {/* logits → loss */}
            {[0, 1, 2].map((i) => {
              const [x1, y1] = pos(3, i)
              const [x2, y2] = pos(4, 0)
              return <line key={`l${i}`} x1={x1} y1={y1} x2={x2 - 18} y2={y2} style={{ stroke: 'var(--viz-muted)', strokeWidth: 1.2, opacity: 0.55 }} />
            })}
            {/* risky-operation tag above the source column */}
            {(() => {
              const tag = SRC_TAG[src]
              const w = tag.length * 7.5 + 14
              const x = Math.min(W - w / 2 - 2, Math.max(w / 2 + 2, colX(srcGroup)))
              return (
                <g>
                  <rect x={x - w / 2} y={24} width={w} height={18} rx={9} style={{ fill: 'color-mix(in srgb, var(--highlight) 55%, var(--surface))', stroke: 'var(--ink-3)', strokeWidth: 1 }} />
                  <text x={x} y={37} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 12, fontWeight: 700 }}>
                    {tag}
                  </text>
                </g>
              )
            })()}
            {/* nodes */}
            {states.map((grp, g) =>
              grp.map((st, i) => {
                const [x, y] = pos(g, i)
                const isLoss = g === 4
                const isFirst = step >= 1 && step <= 4 && !fix && g === srcGroup && (st === 'nan' || st === 'inf') && (src !== 'overflow' || i === 1)
                const text = st === 'nan' ? 'nan' : st === 'inf' ? 'inf' : isLoss ? 'L' : ''
                return (
                  <g key={`n${g}${i}`}>
                    {isFirst && <circle cx={x} cy={y} r={(isLoss ? r + 4 : r) + 6} style={{ fill: 'none', stroke: 'var(--ink)', strokeWidth: 2, strokeDasharray: '3 3' }} />}
                    {isLoss ? (
                      <rect x={x - r - 4} y={y - r - 1} width={2 * r + 8} height={2 * r + 2} rx={8} style={{ fill: fill(st), stroke: stroke(st), strokeWidth: st === 'nan' || st === 'inf' ? 2.5 : 1.8, strokeDasharray: st === 'idle' ? '3 3' : undefined }} />
                    ) : (
                      <circle cx={x} cy={y} r={r} style={{ fill: fill(st), stroke: stroke(st), strokeWidth: st === 'nan' || st === 'inf' ? 2.5 : 1.8, strokeDasharray: st === 'idle' ? '3 3' : undefined }} />
                    )}
                    {text && (
                      <text x={x} y={y} dy="0.34em" textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: narrow ? 10 : 11, fontWeight: 700 }}>
                        {text}
                      </text>
                    )}
                  </g>
                )
              }),
            )}
            {/* column labels */}
            {GROUPS.map((name, g) => (
              <text key={name} x={colX(g)} y={H - 14} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 12, fontWeight: g === srcGroup ? 750 : 500 }}>
                {name}
              </text>
            ))}
          </svg>
        </div>

        <PlayerControls player={player} label={(k) => `Step ${k + 1} of 6: ${STEP_NAMES[k]}`} />

        <p className={s.narr} aria-live="polite">
          {narration(src, fix, step)}
        </p>

        <div className={s.checkGrid}>
          <div className={s.tableScroll}>
            <table className={s.table} aria-label="Per-layer finiteness check for the latest forward pass">
              <thead>
                <tr>
                  <th>{step === 5 ? 'next batch' : 'this batch'}</th>
                  <th>all finite?</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {checkRows.map((row) => (
                  <tr key={row.g}>
                    <td>{GROUPS[row.g]}</td>
                    <td className={s.num}>
                      {!row.computed ? <span className={s.dim}>not yet</span> : row.bad ? <span className={s.bad}>no ({row.bad})</span> : 'yes'}
                    </td>
                    <td className={s.flagCell}>{firstBadRow && firstBadRow.g === row.g ? (step === 5 ? '← first nan now' : '← first bad value') : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={s.legend} aria-hidden="true">
            <span>
              <i className={s.sw} style={{ background: fill('ok'), borderColor: stroke('ok') }} /> finite
            </span>
            <span>
              <i className={s.sw} style={{ background: fill('inf'), borderColor: stroke('inf') }} /> inf
            </span>
            <span>
              <i className={s.sw} style={{ background: fill('nan'), borderColor: stroke('nan') }} /> nan
            </span>
            <span>
              <i className={s.swDash} /> nan gradient
            </span>
            <span>
              <i className={s.swDashOk} /> finite gradient
            </span>
          </div>
        </div>
        <p className={s.small}>
          {step === 5 && (
            <>
              Real source: <b>{sourceLabel[src]}</b> in <b>{GROUPS[srcGroup]}</b>.{' '}
            </>
          )}
          {step === 5 && !fix && srcGroup !== 1 ? <>The table above now blames layer 1: the latest nan hides the real cause. </> : null}In PyTorch,
          checking <code className={s.code}>torch.isfinite(out).all()</code> after each layer prints this table.
        </p>
      </div>
    </Figure>
  )
}
