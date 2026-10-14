import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Plot, Grid, Axes, Arrow, Path, Label, DraggablePoint, MatrixGrid, useNarrow } from '../../../../../kit'
import { type V2, eig2, dirV, angleOf, norm, dot, scale, fmt, fix } from '../eigenvectors-eigenvalues/eig2'
import { whiteCloud, covariance, covEllipse, Cloud } from './la2'
import s from '../eigenvectors-eigenvalues/ev.module.css'

/*
  A cloud of 200 points shaped by three knobs: the spread along its long axis, the spread across
  it, and the tilt. The covariance matrix is computed from the points themselves; its eigenvectors
  are drawn as the axes of the 2-standard-deviation ellipse.
*/

const BASE = whiteCloud(200, 11)
const MIN = 0.3
const MAX = 2.4
const clampS = (v: number) => Math.max(MIN, Math.min(MAX, Math.round(v * 10) / 10))
const wrapTilt = (deg: number) => {
  let t = ((deg + 90) % 180 + 180) % 180 - 90
  t = Math.round(t / 5) * 5
  return t === 90 ? -90 : t
}

export default function CovarianceEllipse() {
  const [s1, setS1] = useState(2)
  const [s2, setS2] = useState(0.7)
  const [tilt, setTilt] = useState(30)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)

  const pts = useMemo(() => {
    const u = dirV(tilt)
    const w = dirV(tilt + 90)
    return BASE.map(([a, b]) => [s1 * a * u[0] + s2 * b * w[0], s1 * a * u[1] + s2 * b * w[1]] as V2)
  }, [s1, s2, tilt])
  const C = covariance(pts)
  const e = eig2(C)
  const ell = covEllipse(C, 2)
  // point each eigenvector arrow towards the handle on its axis, so labels and handles never collide
  const towardHandle = (v: V2): V2 => {
    const a = dot(v, dirV(tilt))
    const b = dot(v, dirV(tilt + 90))
    const sgn = Math.abs(a) >= Math.abs(b) ? Math.sign(a) || 1 : Math.sign(b) || 1
    return [v[0] * sgn, v[1] * sgn]
  }
  const axes =
    e.kind === 'two'
      ? [
          { v: towardHandle(e.v1), l: e.l1 },
          { v: towardHandle(e.v2), l: e.l2 },
        ]
      : [
          { v: dirV(tilt) as V2, l: C[0][0] },
          { v: dirV(tilt + 90) as V2, l: C[1][1] },
        ]
  const cov = C[0][1]
  const h1 = scale(dirV(tilt), 2 * s1)
  const h2 = scale(dirV(tilt + 90), 2 * s2)
  const L = 5

  const tiltText =
    Math.abs(cov) < 0.02 ? (
      <>
        Cov(x, y) ≈ 0: the cloud is <b>not tilted</b>, so its axes line up with the x- and y-axes and the eigenvectors are just (1, 0) and (0, 1).
      </>
    ) : cov > 0 ? (
      <>
        Cov(x, y) &gt; 0: the cloud <b>rises</b> from left to right (big x tends to come with big y).
      </>
    ) : (
      <>
        Cov(x, y) &lt; 0: the cloud <b>falls</b> from left to right (big x tends to come with small y).
      </>
    )

  return (
    <Figure
      title="The covariance matrix is the shape of the cloud"
      caption={
        <>
          Drag the two handles (or use the sliders) to stretch and tilt the cloud of 200 points. The matrix is computed from the points. The diagonal holds the
          variances of x and y, the off-diagonal entry holds their covariance, and the two copies of it are always equal. Its <span className={s.c2}>orange</span> and{' '}
          <span className={s.c3}>green</span> eigenvectors are the long and short axes of the ellipse (drawn 2 standard deviations out), and the eigenvalues are the
          variances along those axes. Set the tilt to 0° and watch the off-diagonal entries become 0.
        </>
      }
    >
      <div ref={wrapRef} className={`${s.panels} ${narrow ? s.panelsNarrow : ''}`}>
        <div className={s.panel}>
          <Plot x={[-L, L]} y={[-L, L]} width={340} height={340} margin={{ top: 8, right: 8, bottom: 8, left: 8 }} maxWidth={400} ariaLabel="A scatter of points with its covariance ellipse and eigenvector axes">
            <Grid xTicks={10} yTicks={10} />
            <Axes origin xTicks={5} yTicks={5} />
            <Cloud pts={pts} color="var(--viz-1)" r={2.6} opacity={0.55} />
            <Path points={ell} closed color="var(--viz-5)" width={2} fill="color-mix(in srgb, var(--viz-5) 10%, transparent)" />
            {axes.map((ax, i) => {
              const tip = scale(ax.v, 2 * Math.sqrt(Math.max(0, ax.l)))
              // label on the far side of the origin, so it never sits under a handle
              const back = scale(ax.v, -2 * Math.sqrt(Math.max(0, ax.l)) - 0.35)
              return (
                <g key={i}>
                  <Arrow from={[0, 0]} to={tip} color={i === 0 ? 'var(--viz-2)' : 'var(--viz-3)'} width={3} />
                  <Path points={[[0, 0], scale(ax.v, -2 * Math.sqrt(Math.max(0, ax.l)))]} color={i === 0 ? 'var(--viz-2)' : 'var(--viz-3)'} width={1.5} dash="4 4" />
                  <Label x={back[0]} y={back[1]} dy={5} anchor="middle" color={i === 0 ? 'var(--viz-2)' : 'var(--viz-3)'} weight={750}>
                    {i === 0 ? 'v₁' : 'v₂'}
                  </Label>
                </g>
              )
            })}
            <DraggablePoint
              x={h1[0]}
              y={h1[1]}
              color="var(--viz-ink)"
              r={7}
              onChange={(x, y) => {
                const p: V2 = [x, y]
                setTilt(wrapTilt(angleOf(p)))
                setS1(clampS(norm(p) / 2))
              }}
            />
            <DraggablePoint
              x={h2[0]}
              y={h2[1]}
              color="var(--viz-ink)"
              r={7}
              onChange={(x, y) => setS2(clampS(Math.abs(dot([x, y], dirV(tilt + 90))) / 2))}
            />
          </Plot>
        </div>
        <div className={s.panel}>
          <MatrixGrid
            data={C}
            format={(v) => fix(v, 2)}
            cells={[
              [0, 0],
              [1, 1],
            ]}
            label="Covariance matrix C"
            cellSize={62}
            ariaLabel="the covariance matrix"
          />
          <div className={s.formula}>
            <div>
              diagonal: <span className={s.mono}>Var(x) = {fix(C[0][0])}</span>, <span className={s.mono}>Var(y) = {fix(C[1][1])}</span>
            </div>
            <div>
              off-diagonal: <span className={s.mono}>Cov(x, y) = Cov(y, x) = {fix(cov)}</span>
            </div>
            <div style={{ marginTop: '0.4rem' }}>
              eigenvalues: <span className={`${s.mono} ${s.c2}`}>λ₁ = {fix(axes[0].l)}</span>, <span className={`${s.mono} ${s.c3}`}>λ₂ = {fix(axes[1].l)}</span>
            </div>
            <div>
              <span className={s.mono}>
                λ₁ + λ₂ = {fix(axes[0].l + axes[1].l)} = Var(x) + Var(y)
              </span>
            </div>
            <div className={s.small}>(the total spread does not depend on the tilt)</div>
          </div>
          <div className={s.status} role="status">
            {tiltText}
          </div>
        </div>
      </div>
      <Controls>
        <Slider label="spread along the long axis" value={s1} min={MIN} max={MAX} step={0.1} onChange={setS1} format={(v) => fmt(v, 1)} />
        <Slider label="spread across it" value={s2} min={MIN} max={MAX} step={0.1} onChange={setS2} format={(v) => fmt(v, 1)} />
        <Slider label="tilt" value={tilt} min={-90} max={85} step={5} onChange={setTilt} format={(v) => `${fmt(v)}°`} />
      </Controls>
    </Figure>
  )
}
