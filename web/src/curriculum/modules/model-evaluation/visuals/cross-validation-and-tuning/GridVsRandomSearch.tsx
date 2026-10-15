import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Segmented, Button, mulberry32, useBump, useContainerWidth, useNarrow } from '../../../../../kit'
import { txt } from '../confusion-matrix-and-metrics/colors'
import s from './cv.module.css'

/*
  Grid search versus random search with the same budget of trials.
  The square is a 2-D hyperparameter space (A across, B up); its shading is the validation score
  you would get at each setting. The strips on top and on the right show the best score possible
  for each value of A (top) and of B (right), with the trials placed at their A or B value.
  When only A matters, the grid wastes its budget: 9 grid trials test only 3 different values of A,
  while 9 random trials test 9 different values.
*/

type Mode = 'A' | 'B' | 'both'

function score(a: number, b: number, mode: Mode): number {
  if (mode === 'A') return 0.55 + 0.39 * Math.exp(-(((a - 0.58) / 0.08) ** 2)) + 0.012 * Math.cos(3 * b)
  if (mode === 'B') return 0.55 + 0.39 * Math.exp(-(((b - 0.42) / 0.08) ** 2)) + 0.012 * Math.cos(3 * a)
  return 0.55 + 0.4 * Math.exp(-(((a - 0.58) / 0.14) ** 2) - ((b - 0.42) / 0.14) ** 2)
}

const LO = 0.5
const HI = 0.96
const CELLS = 20

/** best score reachable at each value of one hyperparameter (maximising over the other) */
function marginal(mode: Mode, axis: 'A' | 'B', samples = 80): [number, number][] {
  const out: [number, number][] = []
  for (let i = 0; i <= samples; i++) {
    const u = i / samples
    let best = -1
    for (let j = 0; j <= 60; j++) {
      const v = j / 60
      best = Math.max(best, axis === 'A' ? score(u, v, mode) : score(v, u, mode))
    }
    out.push([u, best])
  }
  return out
}

interface Trial {
  a: number
  b: number
  s: number
}

function distinct(v: number[]) {
  return new Set(v.map((x) => x.toFixed(6))).size
}

export default function GridVsRandomSearch() {
  const [budget, setBudget] = useState(9)
  const [mode, setMode] = useState<Mode>('A')
  const [seed, bump] = useBump()
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)

  const m = Math.round(Math.sqrt(budget))
  const gridTrials: Trial[] = useMemo(() => {
    const out: Trial[] = []
    for (let i = 0; i < m; i++)
      for (let j = 0; j < m; j++) {
        const a = (i + 0.5) / m
        const b = (j + 0.5) / m
        out.push({ a, b, s: score(a, b, mode) })
      }
    return out
  }, [m, mode])
  const randTrials: Trial[] = useMemo(() => {
    const rng = mulberry32(4242 + seed * 7919)
    return Array.from({ length: budget }, () => {
      const a = 0.02 + 0.96 * rng()
      const b = 0.02 + 0.96 * rng()
      return { a, b, s: score(a, b, mode) }
    })
  }, [budget, mode, seed])

  const margA = useMemo(() => marginal(mode, 'A'), [mode])
  const margB = useMemo(() => marginal(mode, 'B'), [mode])
  const bestPossible = Math.max(...margA.map((p) => p[1]))

  return (
    <Figure
      title="Grid search versus random search, same budget"
      caption={
        <>
          With “only A” mattering, the grid's trials line up in columns, so it tests just {m} values of A; random search tests {budget}. Press{' '}
          <b>New random draw</b> a few times, then try “both”.
        </>
      }
    >
      <div className={s.wrap} ref={wrapRef}>
        <Controls>
          <Segmented
            label="Budget (trials)"
            value={budget}
            onChange={setBudget}
            options={[4, 9, 16, 25].map((v) => ({ value: v, label: String(v) }))}
          />
          <Segmented
            label="Which hyperparameter matters?"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'A', label: 'only A' },
              { value: 'B', label: 'only B' },
              { value: 'both', label: 'both' },
            ]}
          />
          <Button onClick={bump}>New random draw</Button>
        </Controls>
        <div className={s.panels}>
          <SearchPanel title="Grid search" kind="grid" trials={gridTrials} mode={mode} margA={margA} margB={margB} bestPossible={bestPossible} />
          <SearchPanel
            title="Random search"
            kind="random"
            trials={randTrials}
            mode={mode}
            margA={margA}
            margB={margB}
            bestPossible={bestPossible}
            extra={
              // on phones the panels stack, so repeat the button next to the panel it changes
              narrow ? (
                <Controls>
                  <Button onClick={bump}>New random draw</Button>
                </Controls>
              ) : null
            }
          />
        </div>
      </div>
    </Figure>
  )
}

function SearchPanel({
  title,
  kind,
  trials,
  mode,
  margA,
  margB,
  bestPossible,
  extra,
}: {
  extra?: ReactNode
  title: string
  kind: 'grid' | 'random'
  trials: Trial[]
  mode: Mode
  margA: [number, number][]
  margB: [number, number][]
  bestPossible: number
}) {
  const [ref, measured] = useContainerWidth<HTMLDivElement>(340)
  const W = Math.max(240, Math.min(400, measured))
  const L = 24 // left margin (B label)
  const STRIP = 46
  const GAP = 6
  const RIGHT = 20 // room for the right strip's title, outside the strip
  const S = W - L - GAP - STRIP - RIGHT // main square side
  const TOP = 20 // room for the top strip's title, outside the strip
  const H = TOP + STRIP + GAP + S + 26

  const x0 = L
  const y0 = TOP + STRIP + GAP // top of the main square
  const px = (a: number) => x0 + a * S
  const py = (b: number) => y0 + (1 - b) * S
  // top strip: score -> height (baseline at the bottom of the strip)
  const sy = (v: number) => TOP + STRIP - ((v - LO) / (HI - LO)) * STRIP
  // right strip: score -> width (baseline at the left of the strip)
  const rx0 = x0 + S + GAP
  const sx = (v: number) => rx0 + ((v - LO) / (HI - LO)) * STRIP

  const best = trials.reduce((p, c) => (c.s > p.s ? c : p), trials[0])
  const nA = distinct(trials.map((t) => t.a))
  const nB = distinct(trials.map((t) => t.b))
  const heat = (v: number) => `color-mix(in srgb, var(--viz-1) ${Math.round(4 + ((v - LO) / (HI - LO)) * 70)}%, var(--surface))`
  const col = kind === 'grid' ? 'var(--viz-2)' : 'var(--viz-4)'

  const cells = []
  const cs = S / CELLS
  for (let i = 0; i < CELLS; i++)
    for (let j = 0; j < CELLS; j++) {
      const a = (i + 0.5) / CELLS
      const b = (j + 0.5) / CELLS
      cells.push(<rect key={`${i}-${j}`} x={x0 + i * cs} y={y0 + (CELLS - 1 - j) * cs} width={cs + 0.6} height={cs + 0.6} style={{ fill: heat(score(a, b, mode)) }} />)
    }

  const pathA = margA.map(([u, v], i) => `${i ? 'L' : 'M'}${px(u).toFixed(1)},${sy(v).toFixed(1)}`).join('')
  const pathB = margB.map(([u, v], i) => `${i ? 'L' : 'M'}${sx(v).toFixed(1)},${py(u).toFixed(1)}`).join('')

  const marker = (x: number, y: number, r: number, key: string) =>
    kind === 'grid' ? (
      <rect key={key} x={x - r} y={y - r} width={2 * r} height={2 * r} style={{ fill: col, stroke: 'var(--surface)', strokeWidth: 1.5 }} />
    ) : (
      <circle key={key} cx={x} cy={y} r={r} style={{ fill: col, stroke: 'var(--surface)', strokeWidth: 1.5 }} />
    )

  return (
    <div className={s.panel} ref={ref}>
      <p className={s.panelTitle}>
        <span className={s.badge} style={{ color: txt(col) }}>
          {kind === 'grid' ? '■' : '●'} {title}
        </span>
        <span className={s.muted}>{trials.length} trials</span>
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W, display: 'block' }}
        role="img"
        aria-label={`${title}: ${trials.length} trials testing ${nA} distinct values of A and ${nB} of B; best score found ${best.s.toFixed(2)}`}
      >
        {/* top strip: best score for each A */}
        <rect x={x0} y={TOP} width={S} height={STRIP} rx={4} style={{ fill: 'var(--surface-2)' }} />
        <path d={pathA} style={{ fill: 'none', stroke: 'var(--viz-1)', strokeWidth: 2 }} />
        {trials.map((t, i) => (
          <line key={`ta${i}`} x1={px(t.a)} x2={px(t.a)} y1={TOP + STRIP} y2={sy(t.s)} style={{ stroke: col, strokeWidth: 1.2, opacity: 0.55 }} />
        ))}
        {trials.map((t, i) => marker(px(t.a), sy(t.s), 3.5, `ma${i}`))}
        <text x={x0} y={TOP - 6} className="plot-label" style={{ fontSize: 11 }}>
          best score at each A
        </text>

        {/* right strip: best score for each B */}
        <rect x={rx0} y={y0} width={STRIP} height={S} rx={4} style={{ fill: 'var(--surface-2)' }} />
        <path d={pathB} style={{ fill: 'none', stroke: 'var(--viz-1)', strokeWidth: 2 }} />
        {trials.map((t, i) => (
          <line key={`tb${i}`} x1={rx0} x2={sx(t.s)} y1={py(t.b)} y2={py(t.b)} style={{ stroke: col, strokeWidth: 1.2, opacity: 0.55 }} />
        ))}
        {trials.map((t, i) => marker(sx(t.s), py(t.b), 3.5, `mb${i}`))}
        <text transform={`translate(${rx0 + STRIP + 16},${y0 + S}) rotate(-90)`} className="plot-label" style={{ fontSize: 11 }}>
          best score at each B
        </text>

        {/* main square */}
        <g aria-hidden="true">{cells}</g>
        <rect x={x0} y={y0} width={S} height={S} style={{ fill: 'none', stroke: 'var(--viz-axis)', strokeWidth: 1.25 }} />
        {trials.map((t, i) => marker(px(t.a), py(t.b), 5.5, `m${i}`))}
        <circle cx={px(best.a)} cy={py(best.b)} r={11} style={{ fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: 2.2 }} />

        {/* axis labels */}
        <text x={x0 + S / 2} y={y0 + S + 18} textAnchor="middle" className="plot-axis-label">
          hyperparameter A →
        </text>
        <text transform={`translate(${L - 8},${y0 + S / 2}) rotate(-90)`} textAnchor="middle" className="plot-axis-label">
          hyperparameter B →
        </text>
      </svg>
      <div className={s.stats}>
        <span className={s.stat}>
          <span className={s.statNum}>{nA}</span>
          <span>values of A tried</span>
        </span>
        <span className={s.stat}>
          <span className={s.statNum}>{nB}</span>
          <span>values of B tried</span>
        </span>
        <span className={s.stat}>
          <span className={s.statNum} style={{ color: best.s > bestPossible - 0.05 ? txt('var(--viz-pos)') : undefined }}>
            {best.s.toFixed(2)}
          </span>
          <span>best found (max {bestPossible.toFixed(2)})</span>
        </span>
      </div>
      {extra}
    </div>
  )
}
