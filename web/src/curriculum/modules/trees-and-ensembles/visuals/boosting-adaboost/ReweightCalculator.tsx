import { useState } from 'react'
import { Figure, Controls, Segmented, Button, useContainerWidth, M } from '../../../../../kit'
import s from './boosting.module.css'

/*
  One AdaBoost re-weighting step on 10 examples, with numbers you can check by hand.
  Click examples to mark which ones the stump got wrong. Stage 1: ε and α. Stage 2: multiply
  mistakes by e^α and the rest by e^−α. Stage 3: divide by the new total. The mistakes always
  end up holding exactly half of the weight (as long as 0 < ε < 1).
*/

const N = 10
const START_WRONG = [false, false, true, false, false, false, false, true, false, false]
type Stage = 0 | 1 | 2

const f3 = (v: number) => v.toFixed(3)
/** 4 decimals, trailing zeros trimmed, but at least 2 decimals: 0.10, 0.05, 0.0625, 0.0357 */
const fW = (v: number) => {
  const t = v.toFixed(4).replace(/0+$/, '')
  const dec = t.split('.')[1]?.length ?? 0
  return dec >= 2 ? t : v.toFixed(2)
}

export default function ReweightCalculator() {
  const [w, setW] = useState<number[]>(() => new Array(N).fill(1 / N))
  const [wrong, setWrong] = useState<boolean[]>(START_WRONG)
  const [stage, setStage] = useState<Stage>(0)
  const [round, setRound] = useState(1)
  const [ref, width] = useContainerWidth<HTMLDivElement>(600)

  const eps = w.reduce((acc, wi, i) => acc + (wrong[i] ? wi : 0), 0)
  const degenerate = eps < 1e-9 || eps > 1 - 1e-9
  const alpha = degenerate ? NaN : 0.5 * Math.log((1 - eps) / eps)
  const up = Math.exp(alpha)
  const down = Math.exp(-alpha)
  const raw = w.map((wi, i) => (degenerate ? wi : wi * (wrong[i] ? up : down)))
  const Z = raw.reduce((a, b) => a + b, 0)
  const normed = raw.map((v) => v / Z)
  const shown = stage === 0 ? w : stage === 1 ? raw : normed
  const totalShown = shown.reduce((a, b) => a + b, 0)
  const wrongShown = shown.reduce((acc, v, i) => acc + (wrong[i] ? v : 0), 0)
  const share = totalShown > 0 ? wrongShown / totalShown : 0

  const toggle = (i: number) => setWrong((old) => old.map((v, j) => (j === i ? !v : v)))
  const nextRound = () => {
    if (degenerate) return
    setW(normed)
    setWrong(new Array(N).fill(false))
    setStage(0)
    setRound((r) => r + 1)
  }
  const reset = () => {
    setW(new Array(N).fill(1 / N))
    setWrong(START_WRONG)
    setStage(0)
    setRound(1)
  }

  // layout: one row of 10 on wide screens, two rows of 5 on phones
  const W = Math.max(280, width)
  const cols = W < 520 ? 5 : 10
  const rows = N / cols
  const slot = W / cols
  const rowH = 92
  const H = rows * rowH + 6
  const rad = (v: number) => Math.max(3, Math.min(Math.min(19, slot / 2 - 6), 30 * Math.sqrt(v)))

  const wrongIdx = wrong.map((v, i) => (v ? i : -1)).filter((i) => i >= 0)
  const epsSum =
    wrongIdx.length === 0 ? '0' : wrongIdx.length <= 4 ? `${wrongIdx.map((i) => fW(w[i])).join(' + ')} = ${f3(eps)}` : `\\text{(${wrongIdx.length} weights)} = ${f3(eps)}`

  let maths: React.ReactNode
  if (degenerate) {
    maths =
      eps < 1e-9 ? (
        <>No mistakes marked, so <M>{'\\varepsilon = 0'}</M> and <M>{'\\alpha'}</M> would be infinite: a perfect learner. AdaBoost would simply stop. Click some examples to mark them wrong.</>
      ) : (
        <>Every example is marked wrong, so <M>{'\\varepsilon = 1'}</M>: flipping this learner's answers would make it perfect. Unmark some examples.</>
      )
  } else if (stage === 0) {
    maths = (
      <>
        <M>{`\\varepsilon = ${epsSum}`}</M>
        <br />
        <M>{`\\alpha = \\tfrac12 \\ln\\frac{1-\\varepsilon}{\\varepsilon} = \\tfrac12 \\ln\\frac{${f3(1 - eps)}}{${f3(eps)}} = ${alpha.toFixed(3)}`}</M>
      </>
    )
  } else if (stage === 1) {
    maths = (
      <>
        wrong: <M>{`\\times\\, e^{\\alpha} = \\times ${up.toFixed(3)}`}</M>, &nbsp;right: <M>{`\\times\\, e^{-\\alpha} = \\times ${down.toFixed(3)}`}</M>
        <br />
        new total <M>{`Z = ${f3(wrongShown)} + ${f3(totalShown - wrongShown)} = ${f3(Z)}`}</M>
      </>
    )
  } else {
    maths = (
      <>
        divide every weight by <M>{`Z = ${f3(Z)}`}</M>: the wrong ones now hold <M>{`${f3(raw.reduce((a, v, i) => a + (wrong[i] ? v : 0), 0))} / ${f3(Z)} = ${f3(share)}`}</M> of the total
      </>
    )
  }

  return (
    <Figure
      title="Re-weighting, by hand"
      caption={
        <>
          Ten training examples, each starting with weight 0.1. <b>Click an example</b> to mark it right or wrong for this round's stump, then step through
          the three stages. With two mistakes, <M>{'\\varepsilon = 0.2'}</M> and <M>{'\\alpha = \\ln 2'}</M>, so the mistakes double and the rest halve.
          Whatever you mark, look at the bar after stage 2: the mistakes always end up with <b>exactly half</b> of the weight. Then press{' '}
          <b>Next round</b> and mark new mistakes, starting from the new weights.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="group" aria-label={`Ten examples with their weights; ${wrongIdx.length} marked wrong`} className={s.svgText} style={{ display: 'block', overflow: 'visible' }}>
          {shown.map((v, i) => {
            const c = i % cols
            const r = Math.floor(i / cols)
            const cx = slot * (c + 0.5)
            const cy = r * rowH + 46
            const rr = rad(v)
            const bad = wrong[i]
            return (
              <g
                key={i}
                className={s.token}
                role="button"
                tabIndex={0}
                aria-pressed={bad}
                aria-label={`example ${i + 1}, ${bad ? 'wrong' : 'right'}, weight ${v.toFixed(4)}`}
                onClick={() => toggle(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggle(i)
                  }
                }}
              >
                <rect x={cx - slot / 2 + 2} y={r * rowH + 2} width={slot - 4} height={rowH - 6} rx={8} style={{ fill: bad ? 'color-mix(in srgb, var(--viz-neg) 8%, transparent)' : 'transparent' }} />
                <text x={cx} y={r * rowH + 16} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 11.5, fontWeight: 600 }}>
                  #{i + 1}
                </text>
                <circle
                  className={s.tokenBody}
                  cx={cx}
                  cy={cy}
                  r={rr}
                  style={{
                    fill: bad ? 'color-mix(in srgb, var(--viz-neg) 75%, var(--surface))' : 'color-mix(in srgb, var(--viz-pos) 60%, var(--surface))',
                    stroke: bad ? 'var(--viz-neg)' : 'var(--viz-pos)',
                    strokeWidth: 1.5,
                  }}
                />
                <text x={cx} y={cy + 4.5} textAnchor="middle" style={{ fill: 'var(--viz-ink)', fontSize: 13, fontWeight: 800, pointerEvents: 'none' }}>
                  {bad ? '✗' : '✓'}
                </text>
                <text x={cx} y={r * rowH + 84} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 12.5, fontWeight: 700 }}>
                  {fW(v)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <div style={{ width: '100%' }}>
        <p className={s.panelTitle}>Share of the total weight{stage === 1 ? ` (total is now ${f3(totalShown)})` : ''}</p>
        <div style={{ display: 'flex', width: '100%', height: 22, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--rule)' }} role="img" aria-label={`Mistakes hold ${(100 * share).toFixed(1)}% of the weight`}>
          <div style={{ width: `${100 * share}%`, background: 'color-mix(in srgb, var(--viz-neg) 70%, var(--surface))', transition: 'width 300ms ease' }} />
          <div style={{ flex: 1, background: 'color-mix(in srgb, var(--viz-pos) 55%, var(--surface))' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginTop: 4 }}>
          <span style={{ color: 'var(--viz-neg)' }}>✗ wrong: {(100 * share).toFixed(1)}%</span>
          <span style={{ color: 'var(--viz-pos)' }}>✓ right: {(100 * (1 - share)).toFixed(1)}%</span>
        </div>
      </div>
      <div className={s.mathLine}>{maths}</div>
      {!degenerate && eps > 0.5 + 1e-9 && (
        <p className={s.note}>
          ε is above 0.5, so α is negative and the mistakes would <i>shrink</i>. Real implementations stop (or discard this learner) instead: a weak
          learner must beat a coin flip.
        </p>
      )}
      <Controls>
        <Segmented
          label={`Round ${round}`}
          value={stage}
          onChange={setStage}
          options={[
            { value: 0, label: '1 · ε and α' },
            { value: 1, label: '2 · multiply' },
            { value: 2, label: '3 · normalise' },
          ]}
        />
        <div className={s.buttons}>
          <Button onClick={() => setStage((v) => (v < 2 ? ((v + 1) as Stage) : v))} disabled={stage === 2 || degenerate} primary>
            Next stage
          </Button>
          <Button onClick={nextRound} disabled={stage !== 2 || degenerate}>
            Next round
          </Button>
          <Button onClick={reset}>Reset</Button>
        </div>
      </Controls>
    </Figure>
  )
}
