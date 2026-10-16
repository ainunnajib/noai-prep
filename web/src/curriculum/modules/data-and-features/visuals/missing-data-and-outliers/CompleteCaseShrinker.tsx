import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Button, Plot, Grid, Axes, FnPath, Dots, HLine, Label, M, mulberry32, useContainerWidth } from '../../../../../kit'

/*
  Complete-case analysis (dropna) on a table with randomly missing cells.
  Every cell has a fixed random number u; the cell is missing when u < p, so raising p only
  ever adds holes. A row survives dropna only if all d of its cells are present, which
  happens with probability (1 − p)^d.
*/

const N_ROWS = 40
const MAX_D = 20
const ROW_H = 7

const U: number[][] = (() => {
  // seed chosen so that, at p = 0.15, the table tracks the formula closely (e.g. 22, 8 and 2
  // of 40 rows survive at d = 4, 10 and 20, against 20.9, 7.9 and 1.6 expected)
  const rng = mulberry32(20376878)
  return Array.from({ length: N_ROWS }, () => Array.from({ length: MAX_D }, () => rng()))
})()

const pct = (v: number) => (v >= 0.1 ? `${Math.round(v * 100)}%` : `${(v * 100).toFixed(1)}%`)

function MissingGrid({ p, d, dropped }: { p: number; d: number; dropped: boolean }) {
  const [ref, measured] = useContainerWidth<HTMLDivElement>(300)
  const width = Math.max(220, Math.min(340, measured))
  const left = 12
  const right = 4
  const top = 22
  const cellW = (width - left - right) / MAX_D
  const gridW = cellW * d
  const complete = U.map((row) => row.slice(0, d).every((u) => u >= p))
  // final vertical slot of each row: all rows in table order, or only the survivors packed to the top
  let k = 0
  const slot = complete.map((c, i) => (dropped ? (c ? k++ : -1) : i))
  const height = top + N_ROWS * ROW_H + 6
  return (
    <div ref={ref} style={{ width: '100%', maxWidth: 340 }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={`A table of ${N_ROWS} rows and ${d} features with missing cells shown in red; ${complete.filter(Boolean).length} rows are complete`}>
        <text x={left} y={13} style={{ fill: 'var(--ink-2)', fontSize: 12, fontWeight: 700 }}>
          {`${d} feature${d > 1 ? 's' : ''} in use`}
        </text>
        <text x={width - 2} y={13} textAnchor="end" style={{ fill: 'var(--ink-3)', fontSize: 11 }}>
          {dropped ? `${k} rows left` : `${N_ROWS} rows`}
        </text>
        {/* unused feature columns, drawn faintly */}
        {d < MAX_D && <rect x={left + gridW} y={top} width={cellW * (MAX_D - d)} height={N_ROWS * ROW_H - 1} style={{ fill: 'var(--surface-2)', stroke: 'var(--rule)', strokeDasharray: '3 3' }} />}
        {U.map((row, i) => {
          const s = slot[i]
          const y = top + (s < 0 ? i : s) * ROW_H
          const ok = complete[i]
          return (
            <g key={i} style={{ transform: `translateY(${y}px)`, opacity: s < 0 ? 0 : 1, transition: 'transform 0.5s ease, opacity 0.4s ease' }}>
              <rect x={left} y={0} width={gridW} height={ROW_H - 1} style={{ fill: ok ? 'color-mix(in srgb, var(--viz-3) 32%, var(--surface))' : 'color-mix(in srgb, var(--viz-1) 16%, var(--surface))' }} />
              {row.slice(0, d).map((u, j) =>
                u < p ? <rect key={j} x={left + j * cellW + 0.5} y={0} width={Math.max(1, cellW - 1)} height={ROW_H - 1} style={{ fill: 'var(--viz-neg)' }} /> : null,
              )}
              {ok && <circle cx={5} cy={(ROW_H - 1) / 2} r={2.6} style={{ fill: 'var(--viz-3)' }} />}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function CompleteCaseShrinker() {
  const [p, setP] = useState(0.15)
  const [d, setD] = useState(4)
  const [dropped, setDropped] = useState(false)
  const kept = useMemo(() => U.filter((row) => row.slice(0, d).every((u) => u >= p)).length, [p, d])
  const theory = Math.pow(1 - p, d)

  return (
    <Figure
      title="How dropna() shrinks a dataset"
      caption={
        <>
          Each row is one sample and each red cell is a missing value; green rows have no gaps. Slide the number of features <M>d</M> up to 20 with{' '}
          <M>p = 0.15</M> and press <b>dropna()</b>: a row survives only if <i>every</i> one of its cells is present, which happens with probability{' '}
          <M>(1-p)^d</M>. The curve is that formula; the hollow dot is what happened in this table.
        </>
      }
    >
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', alignItems: 'start', justifyItems: 'center' }}>
        <MissingGrid p={p} d={d} dropped={dropped} />
        <Plot x={[0, MAX_D]} y={[0, 1]} width={330} height={290} maxWidth={420} margin={{ left: 44, right: 14, top: 28 }} ariaLabel={`Fraction of rows that are complete, (1 − p) to the power d, for p = ${p}`}>
          <Grid xTicks={4} yTicks={5} />
          <Axes xLabel="features d" yLabel="rows complete" xTicks={4} yTicks={5} tickFormat={(v) => (v <= 1 && v > 0 && !Number.isInteger(v) ? `${Math.round(v * 100)}%` : v === 1 ? '100%' : String(v))} />
          <FnPath f={(x) => Math.pow(1 - p, x)} color="var(--viz-1)" width={2.5} domain={[0, MAX_D]} />
          <HLine y={theory} color="var(--viz-muted)" />
          <Dots points={[{ x: d, y: theory, r: 6, color: 'var(--viz-1)' }, { x: d, y: kept / N_ROWS, r: 6, color: 'var(--viz-3)', hollow: true }]} />
          <Label x={d} y={theory} dx={d > 12 ? -10 : 10} dy={theory > 0.85 ? 18 : -10} anchor={d > 12 ? 'end' : 'start'} color="var(--viz-1)">
            {(1 - p).toFixed(2)}
            <tspan dy={-7} style={{ fontSize: 10 }}>
              {d}
            </tspan>
            <tspan dy={7}>{` ≈ ${pct(theory)}`}</tspan>
          </Label>
        </Plot>
      </div>
      <Controls>
        <Slider label={<>missing rate <M>p</M></>} value={p} min={0} max={0.5} step={0.01} onChange={setP} format={(v) => v.toFixed(2)} />
        <Slider label={<>features <M>d</M></>} value={d} min={1} max={MAX_D} step={1} onChange={setD} />
        <Button primary onClick={() => setDropped((x) => !x)}>
          {dropped ? 'Undo dropna()' : 'dropna()'}
        </Button>
      </Controls>
      <Readout
        items={[
          [<>P(row complete) = <M>{'(1-p)^d'}</M></>, pct(theory)],
          [dropped ? 'rows kept after dropna()' : 'complete rows in this table', `${kept} of ${N_ROWS}`],
          ['data thrown away', pct(1 - kept / N_ROWS)],
        ]}
      />
    </Figure>
  )
}
