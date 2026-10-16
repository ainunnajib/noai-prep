import { useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Button, usePlayer, PlayerControls, Plot, Axes, Rect, VLine, Label, mulberry32, useContainerWidth } from '../../../../../kit'
import { TXT_ORANGE, TXT_GREEN } from '../tones'
import s from '../decision-trees/trees.module.css'

/*
  Bootstrap sampling: draw n numbered balls from n WITH replacement. Some balls come up twice or
  more, others never (they are "out of bag"). Repeating it many times builds a histogram of the
  fraction of distinct balls, which settles near 1 − (1 − 1/n)^n ≈ 63.2%.
*/

const SIZES = [10, 20, 50, 100]

function drawsFor(n: number, sample: number) {
  const rng = mulberry32(7919 * (sample + 1) + n)
  return Array.from({ length: n }, () => Math.floor(rng() * n))
}

/** histogram of the number of distinct balls over `runs` bootstrap samples */
function simulate(n: number, runs: number) {
  const rng = mulberry32(424242 + n)
  const counts = new Array(n + 1).fill(0)
  const seen = new Uint8Array(n)
  let total = 0
  for (let r = 0; r < runs; r++) {
    seen.fill(0)
    let d = 0
    for (let k = 0; k < n; k++) {
      const i = Math.floor(rng() * n)
      if (!seen[i]) {
        seen[i] = 1
        d++
      }
    }
    counts[d]++
    total += d
  }
  return { counts, mean: total / runs / n }
}

function Balls({ n, draws, k }: { n: number; draws: number[]; k: number }) {
  const [ref, w] = useContainerWidth<HTMLDivElement>(460)
  const W = Math.max(260, Math.min(520, w))
  const cols = 10
  const cell = W / cols
  const r = Math.min(n <= 20 ? 15 : n <= 50 ? 10 : 7.5, cell * 0.36)
  const rows = Math.ceil(n / cols)
  const big = n <= 20
  // big balls get a line under them for the ×2 / ×3 badge, so a badge never touches a neighbour
  const rowH = big ? 2 * r + 26 : cell * 0.75
  const H = rows * rowH + 6
  const cnt = new Array(n).fill(0)
  for (let j = 0; j < k; j++) cnt[draws[j]]++
  const done = k >= n
  const last = k > 0 ? draws[k - 1] : -1
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${n} balls; ${cnt.filter((c) => c > 0).length} drawn at least once so far`} style={{ display: 'block' }}>
        {cnt.map((c, i) => {
          const cx = (i % cols) * cell + cell / 2
          const cy = Math.floor(i / cols) * rowH + (big ? r + 7 : rowH / 2 + 3)
          const oob = c === 0 && done
          // one fill for every drawn ball (the same in both themes); repeats show as a thicker ring and a ×2 / ×3 badge
          const fill = c === 0 ? 'var(--surface)' : 'color-mix(in srgb, var(--viz-1) 35%, var(--surface))'
          const stroke = oob ? 'var(--viz-2)' : c === 0 ? 'var(--viz-muted)' : 'var(--viz-1)'
          const sw = oob ? 2.2 : c >= 3 ? 4.5 : c === 2 ? 3.2 : 1.5
          return (
            <g key={i}>
              {i === last && <circle cx={cx} cy={cy} r={r + 5} style={{ fill: 'none', stroke: 'var(--highlight)', strokeWidth: 3.5 }} />}
              <circle cx={cx} cy={cy} r={c >= 2 ? r - sw / 2 + 0.75 : r} style={{ fill, stroke, strokeWidth: sw, strokeDasharray: oob ? '3 2.5' : undefined }} />
              {big && (
                <text x={cx} y={cy} dy="0.35em" textAnchor="middle" style={{ fontSize: 11.5, fontWeight: 700, fill: c >= 1 ? 'var(--ink)' : oob ? TXT_ORANGE : 'var(--ink-3)' }}>
                  {i + 1}
                </text>
              )}
              {big && c >= 2 && (
                <text x={cx} y={cy + r + 13} textAnchor="middle" className={s.edgeText} style={{ fontSize: 11.5, fill: 'var(--ink)', fontWeight: 700 }}>
                  ×{c}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function BootstrapSampler() {
  const [n, setN] = useState(20)
  const [sample, setSample] = useState(0)
  const [runs, setRuns] = useState(300)
  const player = usePlayer({ steps: n + 1, interval: Math.max(60, Math.round(4000 / n)) })
  const { setStep } = player
  // complete at rest: show the finished sample whenever n or the sample changes
  useEffect(() => setStep(n), [n, sample, setStep])

  const draws = useMemo(() => drawsFor(n, sample), [n, sample])
  const k = Math.min(player.step, n)
  const distinct = new Set(draws.slice(0, k)).size
  const done = k >= n
  const sim = useMemo(() => simulate(n, runs), [n, runs])
  const fracNow = new Set(draws).size / n
  const expected = 1 - (1 - 1 / n) ** n
  const maxCount = Math.max(...sim.counts)
  // x-range: at least 40%–92%, widened to show every fraction that has occurred (e.g. 30% or 100% with n = 10)
  const seenD = sim.counts.map((c, d) => (c ? d / n : NaN)).filter((v) => !Number.isNaN(v))
  const xLo = Math.min(0.4, Math.min(...seenD) - 0.6 / n)
  const xHi = Math.max(0.92, Math.max(...seenD) + 0.6 / n)
  const firstSeen = new Set<number>()

  return (
    <Figure
      title="Drawing a bootstrap sample"
      caption={
        <>
          Press <b>Replay</b> to watch the {n} draws one at a time, then <b>Run 1,000 more samples</b>. Filled balls were drawn (×2, ×3 and a thicker ring
          mark repeats); dashed orange rings were never drawn: they are <b>out of bag</b>.
        </>
      }
    >
      <Balls n={n} draws={draws} k={k} />
      {n <= 20 && (
        <div style={{ width: '100%', fontSize: 'var(--step--1)', color: 'var(--ink-2)', display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }} aria-label="The bootstrap sample so far">
          <span style={{ fontWeight: 700, marginRight: 4 }}>The sample so far:</span>
          {draws.slice(0, k).map((d, j) => {
            const repeat = firstSeen.has(d)
            firstSeen.add(d)
            return (
              <span
                key={j}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  padding: '0 5px',
                  borderRadius: 5,
                  background: repeat ? 'color-mix(in srgb, var(--viz-1) 30%, var(--surface))' : 'var(--surface-2)',
                  color: 'var(--ink)',
                }}
              >
                {d + 1}
              </span>
            )
          })}
          {!k && <span>(empty: press Play)</span>}
        </div>
      )}
      <Readout
        items={[
          ['draws', `${k} of ${n}`],
          ['distinct balls', String(distinct)],
          ['repeats', String(k - distinct)],
          ['never drawn (OOB)', done ? `${n - distinct} = ${Math.round((100 * (n - distinct)) / n)}%` : '…'],
        ]}
      />
      <PlayerControls player={player} label={(st) => `${Math.min(st, n)} of ${n} draws`} />
      <p className={s.panelTitle} style={{ width: '100%', marginTop: 4 }}>
        Fraction of distinct balls over {runs.toLocaleString('en-GB')} bootstrap samples of size {n}
      </p>
      <Plot x={[xLo, xHi]} y={[0, maxCount * 1.18]} width={460} height={200} minHeight={180} margin={{ left: 40, top: 12, bottom: 36, right: 12 }} ariaLabel={`Histogram of the fraction of distinct balls; average ${(100 * sim.mean).toFixed(1)}%`}>
        {sim.counts.map((c, d) =>
          c ? (
            <Rect
              key={d}
              x0={d / n - 0.42 / n}
              x1={d / n + 0.42 / n}
              y0={0}
              y1={c}
              fill={Math.abs(d / n - fracNow) < 1e-9 ? 'var(--viz-2)' : 'color-mix(in srgb, var(--viz-1) 55%, var(--surface))'}
            />
          ) : null,
        )}
        <Axes xLabel="fraction of distinct balls" xTicks={6} yTicks={3} tickFormat={(v) => (v > 0 && v < 1.0001 ? `${Math.round(v * 100)}%` : String(v))} />
        <VLine x={expected} color="var(--viz-3)" dash="5 4" width={2} />
        <Label x={expected} y={maxCount * 1.18} dx={6} dy={14} color={TXT_GREEN} size={12} weight={700}>
          {`expected ${(100 * expected).toFixed(1)}%`}
        </Label>
      </Plot>
      <Readout
        items={[
          ['this sample', `${Math.round(fracNow * 100)}% distinct (orange bar)`],
          ['average of all samples', `${(100 * sim.mean).toFixed(1)}%`],
          ['formula 1 − (1 − 1/n)ⁿ', `${(100 * expected).toFixed(1)}%`],
        ]}
      />
      <Controls>
        <Segmented label="Balls (n)" value={n} onChange={(v) => setN(v)} options={SIZES.map((v) => ({ value: v, label: String(v) }))} />
        <Button onClick={() => setSample((v) => v + 1)}>New sample</Button>
        <Button primary onClick={() => setRuns((v) => v + 1000)}>
          Run 1,000 more samples
        </Button>
      </Controls>
    </Figure>
  )
}
