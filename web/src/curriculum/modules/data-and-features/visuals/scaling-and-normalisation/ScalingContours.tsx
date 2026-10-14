import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Button, Plot, Grid, Axes, Path, Dots, Label, usePlayer, useContainerWidth, M } from '../../../../../kit'

/*
  Gradient descent for a linear model y ≈ w_age·age + w_inc·income + b on 30 people
  (age in years, income in $ thousands per month). The bias is kept at its best value, so
  the loss is a bowl over the two weights: L(w) = L* + (w − w*)ᵀ Σ (w − w*), where Σ is the
  covariance matrix of the (centred) features. Gradient: ∇L = 2 Σ (w − w*).
  Left: raw features. Right: standardised features (Σ becomes the correlation matrix).
  Both start at w = (0, 0). Plots use equal units on both axes, so the true shape shows.
*/

const AGE = [56, 56, 43, 33, 22, 37, 38, 22, 22, 65, 49, 31, 40, 64, 60, 58, 38, 42, 50, 23, 45, 32, 60, 23, 51, 59, 30, 60, 59, 21]
const INC = [7.7, 2.0, 6.0, 5.5, 3.6, 4.6, 8.4, 4.5, 3.2, 7.6, 5.6, 8.4, 3.9, 4.6, 8.4, 6.1, 6.1, 3.9, 2.1, 9.5, 2.7, 8.8, 4.9, 9.6, 5.2, 9.5, 6.4, 3.9, 7.9, 7.4]
const Y = [8.4, 6.7, 5.7, 4.9, 4.1, 4.8, 6.4, 3.5, 3.5, 8.6, 6.5, 5.8, 5.2, 7.3, 9.1, 6.9, 4.9, 4.6, 6.2, 4.9, 4.7, 5.2, 7.7, 4.5, 5.9, 9.1, 4.2, 7.0, 8.3, 4.1]
const STEPS = 30

type Vec = [number, number]
type Mat = [[number, number], [number, number]]

const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length

/** Build Σ and w* (order: [income, age] so income is the horizontal axis). */
function problem(standardise: boolean) {
  const ma = mean(AGE)
  const mi = mean(INC)
  const my = mean(Y)
  const sa = Math.sqrt(mean(AGE.map((a) => (a - ma) ** 2)))
  const si = Math.sqrt(mean(INC.map((v) => (v - mi) ** 2)))
  const f1 = INC.map((v) => (v - mi) / (standardise ? si : 1))
  const f2 = AGE.map((a) => (a - ma) / (standardise ? sa : 1))
  const yc = Y.map((v) => v - my)
  const n = Y.length
  const s11 = f1.reduce((s, v) => s + v * v, 0) / n
  const s22 = f2.reduce((s, v) => s + v * v, 0) / n
  const s12 = f1.reduce((s, v, k) => s + v * f2[k], 0) / n
  const b1 = f1.reduce((s, v, k) => s + v * yc[k], 0) / n
  const b2 = f2.reduce((s, v, k) => s + v * yc[k], 0) / n
  const det = s11 * s22 - s12 * s12
  const wstar: Vec = [(s22 * b1 - s12 * b2) / det, (s11 * b2 - s12 * b1) / det]
  const S: Mat = [
    [s11, s12],
    [s12, s22],
  ]
  // eigenvalues of Σ
  const tr = s11 + s22
  const disc = Math.sqrt(((s11 - s22) / 2) ** 2 + s12 * s12)
  const lmax = tr / 2 + disc
  const lmin = tr / 2 - disc
  // eigenvector of lmax (for drawing ellipses)
  const ang = 0.5 * Math.atan2(2 * s12, s11 - s22)
  return { S, wstar, lmax, lmin, ang }
}

const RAW = problem(false)
const STD = problem(true)

const quad = (S: Mat, d: Vec) => S[0][0] * d[0] * d[0] + 2 * S[0][1] * d[0] * d[1] + S[1][1] * d[1] * d[1]

function descend(P: typeof RAW, eta: number) {
  const pts: Vec[] = [[0, 0]]
  let w: Vec = [0, 0]
  for (let t = 0; t < STEPS; t++) {
    const d: Vec = [w[0] - P.wstar[0], w[1] - P.wstar[1]]
    const g: Vec = [2 * (P.S[0][0] * d[0] + P.S[0][1] * d[1]), 2 * (P.S[1][0] * d[0] + P.S[1][1] * d[1])]
    w = [w[0] - eta * g[0], w[1] - eta * g[1]]
    if (!Number.isFinite(w[0]) || Math.abs(w[0]) > 1e6) break
    pts.push(w)
  }
  return pts
}

function ellipse(P: typeof RAW, c: number): Vec[] {
  // (w − w*)ᵀ Σ (w − w*) = c: semi-axes sqrt(c/λ) along the eigenvectors
  const a = Math.sqrt(c / P.lmax)
  const b = Math.sqrt(c / P.lmin)
  const ca = Math.cos(P.ang)
  const sa = Math.sin(P.ang)
  return Array.from({ length: 121 }, (_, k) => {
    const t = (k / 120) * 2 * Math.PI
    const u = a * Math.cos(t)
    const v = b * Math.sin(t)
    return [P.wstar[0] + u * ca - v * sa, P.wstar[1] + u * sa + v * ca]
  })
}

const DESIGN_W = 400
const DESIGN_H = 250
const MARGIN = { left: 44, right: 14, top: 26, bottom: 36 }

function Panel({ P, eta, shown, title, xLabel, yLabel }: { P: typeof RAW; eta: number; shown: number; title: string; xLabel: string; yLabel: string }) {
  const [ref, measured] = useContainerWidth<HTMLDivElement>(DESIGN_W)
  const width = Math.max(200, Math.min(DESIGN_W * 1.25, measured))
  const height = Math.round((DESIGN_H * width) / DESIGN_W)
  const iw = width - MARGIN.left - MARGIN.right
  const ih = height - MARGIN.top - MARGIN.bottom
  const L0 = quad(P.S, [-P.wstar[0], -P.wstar[1]])
  const levels = [0.03, 0.15, 0.4, 0.75, 1, 1.5].map((f) => f * L0)
  // bounding box of the outer contour, then widen one axis so both axes use equal units
  const cOut = levels[levels.length - 1]
  const det = P.S[0][0] * P.S[1][1] - P.S[0][1] ** 2
  const ex = Math.sqrt((cOut * P.S[1][1]) / det)
  const ey = Math.sqrt((cOut * P.S[0][0]) / det)
  const cx = P.wstar[0]
  const cy = P.wstar[1]
  const s = Math.min(iw / (2 * ex), ih / (2 * ey))
  const hx = iw / s / 2
  const hy = ih / s / 2
  const xD: [number, number] = [cx - hx, cx + hx]
  const yD: [number, number] = [cy - hy, cy + hy]

  const path = useMemo(() => descend(P, eta), [P, eta])
  const vis = path.slice(0, Math.min(path.length, shown + 1))
  const diverged = path.length < STEPS + 1 || Math.abs(quad(P.S, [path[path.length - 1][0] - P.wstar[0], path[path.length - 1][1] - P.wstar[1]])) > 4 * L0
  const offMap = vis.some(([a, b]) => a < xD[0] || a > xD[1] || b < yD[0] || b > yD[1])
  const clamp = (p: Vec): Vec => [Math.max(xD[0], Math.min(xD[1], p[0])), Math.max(yD[0], Math.min(yD[1], p[1]))]

  return (
    <div ref={ref} style={{ width: '100%', maxWidth: DESIGN_W * 1.25, display: 'grid', gap: '0.2rem' }}>
      <div style={{ fontWeight: 700, fontSize: 'var(--step--1)', color: 'var(--ink)', textAlign: 'center' }}>{title}</div>
      <Plot x={xD} y={yD} width={DESIGN_W} height={DESIGN_H} margin={MARGIN} ariaLabel={`${title}: loss contours and a gradient descent path of ${vis.length - 1} steps`}>
        <Grid xTicks={5} yTicks={4} />
        {levels
          .slice()
          .reverse()
          .map((c, k) => (
            <Path key={k} points={ellipse(P, c)} closed fill={`color-mix(in srgb, var(--viz-1) ${4 + k * 2}%, transparent)`} color="color-mix(in srgb, var(--viz-1) 55%, var(--surface))" width={1.2} />
          ))}
        <Axes xLabel={xLabel} yLabel={yLabel} xTicks={5} yTicks={4} />
        <Path points={vis.map(clamp)} color="var(--viz-2)" width={1.5} />
        <Dots points={vis.slice(0, 31).map(([a, b]) => ({ x: a, y: b, r: 2.6, color: 'var(--viz-2)' })).filter((p) => p.x >= xD[0] && p.x <= xD[1] && p.y >= yD[0] && p.y <= yD[1])} stroke="none" />
        <Dots points={[{ x: P.wstar[0], y: P.wstar[1], r: 6, color: 'var(--viz-3)', shape: 'cross' }, { x: 0, y: 0, r: 5, color: 'var(--viz-ink)' }]} />
        <Label x={0} y={0} dx={-8} dy={16} anchor="end" size={12}>
          start
        </Label>
        {(diverged || offMap) && (
          <Label x={cx} y={yD[0]} dy={-8} anchor="middle" color="var(--viz-neg)" weight={700}>
            {diverged ? 'diverges: η is too big for this bowl' : 'path leaves the map'}
          </Label>
        )}
      </Plot>
    </div>
  )
}

/** progress measured as distance to the minimum in weight space, relative to the start */
function status(P: typeof RAW, eta: number) {
  const d0 = Math.hypot(P.wstar[0], P.wstar[1])
  let w: Vec = [0, 0]
  for (let t = 1; t <= 2000; t++) {
    const d: Vec = [w[0] - P.wstar[0], w[1] - P.wstar[1]]
    w = [w[0] - eta * 2 * (P.S[0][0] * d[0] + P.S[0][1] * d[1]), w[1] - eta * 2 * (P.S[1][0] * d[0] + P.S[1][1] * d[1])]
    const r = Math.hypot(w[0] - P.wstar[0], w[1] - P.wstar[1]) / d0
    if (!Number.isFinite(r) || r > 1e3) return 'diverges'
    if (r < 0.01) return `${t} step${t === 1 ? '' : 's'} to reach it`
    if (t === STEPS && r > 1) return 'diverges'
  }
  return 'over 2,000 steps to reach it'
}

function progress(P: typeof RAW, eta: number) {
  const path = descend(P, eta)
  if (path.length < STEPS + 1) return null
  const [a, b] = path[STEPS]
  const r = Math.hypot(a - P.wstar[0], b - P.wstar[1]) / Math.hypot(P.wstar[0], P.wstar[1])
  return r > 1 ? null : Math.round((1 - r) * 100)
}

const bestEta = (P: typeof RAW) => 1 / (P.lmax + P.lmin)

export default function ScalingContours() {
  const [logEta, setLogEta] = useState(Math.log10(0.0045))
  const [best, setBest] = useState(true)
  const player = usePlayer({ steps: STEPS + 1, interval: 110 })
  const [replayed, setReplayed] = useState(false)
  const shown = replayed ? player.step : STEPS
  const eta = 10 ** logEta
  const etaRaw = best ? bestEta(RAW) : eta
  const etaStd = best ? bestEta(STD) : eta
  const replay = () => {
    setReplayed(true)
    player.reset()
    window.setTimeout(() => player.play(), 30)
  }
  const fmtEta = (v: number) => (v < 0.01 ? v.toFixed(4) : v < 0.1 ? v.toFixed(3) : v.toFixed(2))
  const describe = (P: typeof RAW, e: number) => {
    const p = progress(P, e)
    return p == null ? 'diverges' : `${p}% of the way after ${STEPS} steps; ${status(P, e)}`
  }

  return (
    <Figure
      wide
      title="Gradient descent on raw and standardised features"
      caption={
        <>
          A linear model predicts a target from age (years) and monthly income ($ thousands). Each map is the loss over the two weights, seen from
          above (both axes use the same units, so the shapes are true); the green cross is the minimum. Both runs start at zero and take {STEPS} steps
          with the same learning rate <M>\eta</M>. Slide <M>\eta</M> up: the raw run zig-zags across its narrow valley and then blows up above about{' '}
          {fmtEta(1 / RAW.lmax)}, while the standardised run only gets faster. <b>Best η for each</b> (on at first) gives each run the learning rate that suits it best.
        </>
      }
    >
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1rem', justifyItems: 'center' }}>
        <Panel P={RAW} eta={etaRaw} shown={shown} title="Raw features" xLabel="w (income)" yLabel="w (age)" />
        <Panel P={STD} eta={etaStd} shown={shown} title="Standardised features" xLabel="w (income)" yLabel="w (age)" />
      </div>
      <Controls>
        <Slider label={<>learning rate <M>\eta</M> (shared)</>} value={logEta} min={-3} max={0} step={0.02} onChange={(v) => { setLogEta(v); setBest(false); setReplayed(false) }} format={(v) => fmtEta(10 ** v)} />
        <Toggle label="best η for each" checked={best} onChange={(v) => { setBest(v); setReplayed(false) }} />
        <Button onClick={replay}>Replay the descent</Button>
      </Controls>
      <Readout
        items={[
          [`raw, η = ${fmtEta(etaRaw)}`, describe(RAW, etaRaw)],
          [`standardised, η = ${fmtEta(etaStd)}`, describe(STD, etaStd)],
          ['largest safe η', `raw ${fmtEta(1 / RAW.lmax)}, standardised ${fmtEta(1 / STD.lmax)}`],
        ]}
      />
    </Figure>
  )
}
