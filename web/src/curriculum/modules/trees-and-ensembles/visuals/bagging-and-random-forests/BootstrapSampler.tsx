import { useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Button, usePlayer, PlayerControls, Plot, Axes, Rect, VLine, Label, mulberry32, useContainerWidth } from '../../../../../kit'
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
  const rowH = n <= 20 ? cell * 0.98 : cell * 0.75
  const H = rows * rowH + 6
  const cnt = new Array(n).fill(0)
  for (let j = 0; j < k; j++) cnt[draws[j]]++
  const done = k >= n
  const last = k > 0 ? draws[k - 1] : -1
  const big = n <= 20
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${n} balls; ${cnt.filter((c) => c > 0).length} drawn at least once so far`} style={{ display: 'block' }}>
        {cnt.map((c, i) => {
          const cx = (i % cols) * cell + cell / 2
          const cy = Math.floor(i / cols) * rowH + rowH / 2 + 3
          const oob = c === 0 && done
          const fill = c === 0 ? 'var(--surface)' : `color-mix(in srgb, var(--viz-1) ${c === 1 ? 55 : c === 2 ? 80 : 100}%, var(--surface))`
          const stroke = oob ? 'var(--viz-2)' : c === 0 ? 'var(--viz-muted)' : 'var(--viz-1)'
          return (
            <g key={i}>
              {i === last && <circle cx={cx} cy={cy} r={r + 4} style={{ fill: 'none', stroke: 'var(--highlight)', strokeWidth: 3.5 }} />}
              <circle cx={cx} cy={cy} r={r} style={{ fill, stroke, strokeWidth: oob ? 2.2 : 1.5, strokeDasharray: oob ? '3 2.5' : undefined }} />
              {big && (
                <text x={cx} y={cy} dy="0.35em" textAnchor="middle" style={{ fontSize: 11.5, fontWeight: 700, fill: c >= 1 ? 'var(--surface)' : oob ? 'var(--viz-2)' : 'var(--ink-3)' }}>
                  {i + 1}
                </text>
              )}
              {big && c >= 2 && (
                <text x={cx + r * 0.75} y={cy - r * 0.75} textAnchor="start" className={s.edgeText} style={{ fontSize: 11, fill: 'var(--viz-ink)', fontWeight: 700 }}>
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
  const firstSeen = new Set<number>()

  return (
    <Figure
      title="Drawing a bootstrap sample"
      caption={
        <>
          Press <b>Play</b> to draw {n} times from {n} balls, putting each ball back after drawing it. Dark balls were drawn more than once; balls with a
          dashed orange ring were never drawn: they are <b>out of bag</b>. Then press <b>Run 1,000 more samples</b>: the fraction of distinct balls piles up
          just below two-thirds. Switch to 100 balls and it settles even closer to <b>63.2%</b>.
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
      <Plot x={[0.4, 0.92]} y={[0, maxCount * 1.18]} width={460} height={200} minHeight={180} margin={{ left: 40, top: 12, bottom: 36, right: 12 }} ariaLabel={`Histogram of the fraction of distinct balls; average ${(100 * sim.mean).toFixed(1)}%`}>
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
        <Axes xLabel="fraction of distinct balls" xTicks={6} yTicks={3} tickFormat={(v) => (v < 1.0001 && !Number.isInteger(v) ? `${Math.round(v * 100)}%` : String(v))} />
        <VLine x={expected} color="var(--viz-3)" dash="5 4" width={2} />
        <Label x={expected} y={maxCount * 1.18} dx={6} dy={14} color="var(--viz-3)" size={12} weight={700}>
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
