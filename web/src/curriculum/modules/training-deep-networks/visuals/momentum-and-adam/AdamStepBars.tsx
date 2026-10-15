import { useMemo, useState } from 'react'
import { Figure, Controls, Segmented, Button, useContainerWidth, useAnimationFrame, mulberry32 } from '../../../../../kit'

/*
  Adam on three independent parameters, each fed its own stream of gradients.
  For each parameter we track (β₁ = 0.9, β₂ = 0.999, ε = 1e-8):
      m ← β₁m + (1 − β₁)g      v ← β₂v + (1 − β₂)g²
      m̂ = m / (1 − β₁ᵗ)        v̂ = v / (1 − β₂ᵗ)       step = η · m̂ / (√v̂ + ε)
  and compare with plain SGD (step = η·g). Bars show the total distance each parameter has moved,
  in units of η, on a log scale.
*/

type Pattern = 'big' | 'tiny' | 'rare' | 'noisy'
const PATTERNS: { value: Pattern; label: string }[] = [
  { value: 'big', label: 'g = 1' },
  { value: 'tiny', label: 'g = 0.01' },
  { value: 'rare', label: 'rare' },
  { value: 'noisy', label: 'noisy' },
]
const T_MAX = 200
const B1 = 0.9
const B2 = 0.999
const EPS = 1e-8
const COLORS = ['var(--viz-1)', 'var(--viz-3)', 'var(--viz-4)']

function gauss(r: () => number) {
  const u = Math.max(r(), 1e-12)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r())
}

interface Row {
  g: number
  mh: number
  sv: number
  adam: number
  sgd: number
  movedAdam: number
  movedSgd: number
}

function simulate(p: Pattern, seed: number): Row[] {
  const r = mulberry32(seed)
  let m = 0
  let v = 0
  let a = 0
  let s = 0
  const rows: Row[] = []
  for (let t = 1; t <= T_MAX; t++) {
    const g = p === 'big' ? 1 : p === 'tiny' ? 0.01 : p === 'rare' ? (t % 10 === 1 ? 1 : 0) : 0.1 + gauss(r)
    m = B1 * m + (1 - B1) * g
    v = B2 * v + (1 - B2) * g * g
    const mh = m / (1 - B1 ** t)
    const sv = Math.sqrt(v / (1 - B2 ** t))
    const adam = mh / (sv + EPS)
    a += adam
    s += g
    rows.push({ g, mh, sv, adam, sgd: g, movedAdam: Math.abs(a), movedSgd: Math.abs(s) })
  }
  return rows
}

const fmt = (x: number) => {
  const ax = Math.abs(x)
  if (ax === 0) return '0'
  if (ax >= 100) return x.toFixed(0)
  if (ax >= 1) return x.toFixed(2)
  if (ax >= 0.0095) return x.toFixed(3)
  return x.toExponential(1)
}

const LMIN = -2
const LMAX = 2.5

function LogBars({ rows, t }: { rows: Row[][]; t: number }) {
  const [ref, measured] = useContainerWidth<HTMLDivElement>(560)
  const width = Math.max(280, Math.min(680, measured))
  const left = 74
  const right = 12
  const top = 8
  const barH = 13
  const group = 2 * barH + 16
  const height = top + rows.length * group + 30
  const X = (v: number) => left + ((Math.max(LMIN, Math.min(LMAX, Math.log10(Math.max(v, 1e-9)))) - LMIN) / (LMAX - LMIN)) * (width - left - right)
  const ticks = [-2, -1, 0, 1, 2]
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={`Distance each parameter has moved after ${t} steps, SGD versus Adam, log scale`} style={{ display: 'block' }}>
        {ticks.map((k) => (
          <g key={k}>
            <line x1={X(10 ** k)} x2={X(10 ** k)} y1={top - 2} y2={height - 24} style={{ stroke: 'var(--viz-grid)', strokeWidth: 1 }} />
            <text x={X(10 ** k)} y={height - 8} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 12 }}>
              {String(10 ** k)}
            </text>
          </g>
        ))}
        {rows.map((r, i) => {
          const y = top + i * group
          const row = r[t - 1]
          return (
            <g key={i}>
              <text x={0} y={y + barH} dy="0.35em" style={{ fill: COLORS[i], fontSize: 13, fontWeight: 700 }}>
                param {i + 1}
              </text>
              <rect x={left} y={y} width={Math.max(0, X(row.movedSgd) - left)} height={barH} rx={3} style={{ fill: 'color-mix(in srgb, var(--viz-muted) 70%, var(--surface))' }} />
              <text x={Math.min(width - right, X(row.movedSgd) + 4)} y={y + barH / 2} dy="0.35em" textAnchor={X(row.movedSgd) > width - 70 ? 'end' : 'start'} style={{ fill: 'var(--ink-2)', fontSize: 11.5 }}>
                SGD {fmt(row.movedSgd)}
              </text>
              <rect x={left} y={y + barH + 2} width={Math.max(0, X(row.movedAdam) - left)} height={barH} rx={3} style={{ fill: COLORS[i] }} />
              <text x={Math.min(width - right, X(row.movedAdam) + 4)} y={y + barH * 1.5 + 2} dy="0.35em" textAnchor={X(row.movedAdam) > width - 70 ? 'end' : 'start'} style={{ fill: 'var(--ink)', fontSize: 11.5, fontWeight: 700, paintOrder: 'stroke', stroke: 'var(--surface)', strokeWidth: 3 }}>
                Adam {fmt(row.movedAdam)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function AdamStepBars() {
  const [pats, setPats] = useState<Pattern[]>(['big', 'tiny', 'rare'])
  const [t, setT] = useState(20)
  const [playing, setPlaying] = useState(false)
  const rows = useMemo(() => pats.map((p, i) => simulate(p, 101 + i * 17)), [pats])

  useAnimationFrame((dt) => {
    setT((x) => {
      const nx = Math.min(T_MAX, x + Math.max(1, Math.round(dt * 20)))
      if (nx >= T_MAX) setPlaying(false)
      return nx
    })
  }, playing)

  const setPat = (i: number, p: Pattern) => setPats((ps) => ps.map((q, k) => (k === i ? p : q)))
  const cell = { textAlign: 'right' as const, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', paddingLeft: '0.6rem' }

  return (
    <Figure
      title="Adam gives every parameter its own step size"
      caption={
        <>
          Three parameters receive very different gradients: a steady g = 1, a steady g = 0.01, a rare gradient of 1 on one step in ten, or
          noise around 0.1. Plain SGD moves each one in proportion to its gradient, so after {t} steps
          parameter 2 (gradients 100 times smaller) has barely moved. Adam divides the averaged gradient m̂ by √v̂, the typical size of
          that parameter&apos;s own gradients, so a steady gradient of 0.01 and a steady gradient of 1 both give steps of about η. A rarely
          active parameter gets bigger steps than under SGD when it does fire, and a noisy one (gradients that keep changing sign) gets small,
          careful steps. Change the patterns and press Play.
        </>
      }
    >
      <div style={{ width: '100%', display: 'grid', gap: '0.5rem' }}>
        {pats.map((p, i) => (
          <div key={i} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.25rem 0.75rem' }}>
            <span style={{ color: COLORS[i], fontWeight: 700, fontSize: 'var(--step--1)', minWidth: '4.5rem' }}>param {i + 1}</span>
            <div role="group" aria-label={`Gradient pattern for parameter ${i + 1}`}>
              <Segmented options={PATTERNS} value={p} onChange={(v) => setPat(i, v)} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--step--1)' }}>
          <caption style={{ textAlign: 'left', color: 'var(--ink-3)', paddingBottom: '0.3rem' }}>At step t = {t} (plain SGD&apos;s step ÷ η would simply be g)</caption>
          <thead>
            <tr style={{ color: 'var(--ink-3)' }}>
              <th style={{ textAlign: 'left', fontWeight: 600 }} />
              <th style={{ ...cell, fontFamily: 'inherit', fontWeight: 600 }}>gradient g</th>
              <th style={{ ...cell, fontFamily: 'inherit', fontWeight: 600 }}>m̂</th>
              <th style={{ ...cell, fontFamily: 'inherit', fontWeight: 600 }}>√v̂</th>
              <th style={{ ...cell, fontFamily: 'inherit', fontWeight: 600 }}>Adam step ÷ η</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const row = r[t - 1]
              return (
                <tr key={i} style={{ borderTop: '1px solid var(--rule)' }}>
                  <td style={{ color: COLORS[i], fontWeight: 700, padding: '0.25rem 0' }}>{i + 1}</td>
                  <td style={cell}>{fmt(row.g)}</td>
                  <td style={cell}>{fmt(row.mh)}</td>
                  <td style={cell}>{fmt(row.sv)}</td>
                  <td style={{ ...cell, fontWeight: 700, color: 'var(--ink)' }}>{fmt(row.adam)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div style={{ width: '100%', fontSize: 'var(--step--1)', color: 'var(--ink-2)', fontWeight: 600 }}>Total distance moved so far, in units of η (log scale)</div>
      <LogBars rows={rows} t={t} />
      <Controls>
        <Button onClick={() => { setPlaying(false); setT((x) => Math.min(T_MAX, x + 1)) }}>Step</Button>
        <Button primary onClick={() => { if (t >= T_MAX) setT(1); setPlaying((p) => !p) }}>{playing ? 'Pause' : t >= T_MAX ? 'Replay' : 'Play'}</Button>
        <Button onClick={() => { setPlaying(false); setT(1) }}>Back to step 1</Button>
        <span className="tabular" style={{ color: 'var(--ink-2)', fontSize: 'var(--step--1)' }}>step {t} of {T_MAX}</span>
      </Controls>
    </Figure>
  )
}
