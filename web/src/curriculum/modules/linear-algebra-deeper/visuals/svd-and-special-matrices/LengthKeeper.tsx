import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Segmented, Plot, Grid, Axes, Arrow, Path, Label, FnPath, DraggablePoint, MatrixGrid, usePlot, useNarrow } from '../../../../../kit'
import { type M2, type V2, apply, mul, transpose, rot, dirV, norm, scale, symFromEig, fmt, fix, imageOfCircle } from '../eigenvectors-eigenvalues/eig2'
import { contour, Segments } from '../covariance-and-pca/la2'
import s from '../eigenvectors-eigenvalues/ev.module.css'
import c from '../covariance-and-pca/cps.module.css'

/*
  Two special kinds of matrix.
  1. Orthogonal (QᵀQ = I): turns or mirrors space, so every length stays the same.
  2. Positive definite (symmetric, all eigenvalues > 0): the function xᵀAx is a bowl.
*/

type Tab = 'orth' | 'pd'
type Kind = 'rotation' | 'reflection' | 'shear' | 'stretch'

const FAN: V2[] = [
  [2, 0],
  [1.2, 1.6],
  [-1, 1],
  [-0.6, -1.8],
]
const TONES = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)']

function makeMatrix(kind: Kind, p: number): M2 {
  if (kind === 'rotation') return rot(p)
  if (kind === 'reflection') {
    const r = (2 * p * Math.PI) / 180
    return [
      [Math.cos(r), Math.sin(r)],
      [Math.sin(r), -Math.cos(r)],
    ]
  }
  if (kind === 'shear')
    return [
      [1, p / 45],
      [0, 1],
    ]
  return [
    [1 + p / 90, 0],
    [0, 1 / (1 + p / 90)],
  ]
}

function Orthogonal() {
  const [kind, setKind] = useState<Kind>('rotation')
  const [p, setP] = useState(40)
  const [probe, setProbe] = useState<V2>([0.5, 2])
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)
  const Q = makeMatrix(kind, p)
  const QtQ = mul(transpose(Q), Q)
  const isOrth = Math.abs(QtQ[0][0] - 1) < 1e-9 && Math.abs(QtQ[1][1] - 1) < 1e-9 && Math.abs(QtQ[0][1]) < 1e-9
  const L = 3
  const img = apply(Q, probe)
  const sliderLabel = kind === 'rotation' ? 'angle' : kind === 'reflection' ? 'mirror line angle' : kind === 'shear' ? 'shear amount' : 'stretch factor'
  const sliderText = kind === 'rotation' || kind === 'reflection' ? `${p}°` : kind === 'shear' ? fmt(p / 45, 2) : `×${fmt(1 + p / 90, 2)}`
  const rows: { name: string; v: V2; tone: string }[] = [...FAN.map((v, i) => ({ name: `arrow ${i + 1}`, v, tone: TONES[i] })), { name: 'x (drag)', v: probe, tone: 'var(--viz-5)' }]

  return (
    <>
      <Segmented<Kind>
        label="Matrix"
        value={kind}
        onChange={(k) => {
          setKind(k)
          setP(k === 'rotation' ? 40 : k === 'reflection' ? 30 : 45)
        }}
        options={[
          { value: 'rotation', label: 'Rotate' },
          { value: 'reflection', label: 'Reflect' },
          { value: 'shear', label: 'Shear' },
          { value: 'stretch', label: 'Stretch' },
        ]}
      />
      <div ref={wrapRef} className={`${s.panels} ${narrow ? s.panelsNarrow : ''}`}>
        <div className={s.panel}>
          <Plot x={[-L, L]} y={[-L, L]} width={320} height={320} margin={{ top: 8, right: 8, bottom: 8, left: 8 }} maxWidth={380} ariaLabel="Arrows before and after the matrix">
            <Grid xTicks={6} yTicks={6} />
            <Axes origin xTicks={6} yTicks={6} />
            <Path points={imageOfCircle([[1, 0], [0, 1]])} closed color="var(--viz-muted)" width={1.4} dash="5 5" />
            <Path points={imageOfCircle(Q)} closed color="var(--viz-5)" width={2} fill="color-mix(in srgb, var(--viz-5) 10%, transparent)" />
            {kind === 'reflection' && <Path points={[scale(dirV(p), -L * 2), scale(dirV(p), L * 2)]} color="var(--viz-muted)" width={1.5} dash="2 4" />}
            {FAN.map((v, i) => (
              <g key={i}>
                <Arrow from={[0, 0]} to={v} color={`color-mix(in srgb, ${TONES[i]} 35%, transparent)`} width={2} dash="4 3" />
                <Arrow from={[0, 0]} to={apply(Q, v)} color={TONES[i]} width={2.8} />
              </g>
            ))}
            <Arrow from={[0, 0]} to={probe} color="color-mix(in srgb, var(--viz-5) 40%, transparent)" width={2} dash="4 3" />
            <Arrow from={[0, 0]} to={img} color="var(--viz-5)" width={3} label="Qx" labelOffset={[6, 14]} />
            <DraggablePoint x={probe[0]} y={probe[1]} color="var(--viz-5)" r={7} label="x" onChange={(x, y) => setProbe([Math.round(x * 10) / 10, Math.round(y * 10) / 10])} />
          </Plot>
        </div>
        <div className={s.panel}>
          <table className={c.lenTable}>
            <thead>
              <tr>
                <th>arrow</th>
                <th>length before</th>
                <th>after</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const a = norm(r.v)
                const b = norm(apply(Q, r.v))
                return (
                  <tr key={r.name}>
                    <td style={{ color: r.tone, fontWeight: 700 }}>{r.name}</td>
                    <td>{fix(a)}</td>
                    <td style={{ fontWeight: 700, color: Math.abs(a - b) < 0.005 ? 'var(--viz-pos)' : 'var(--viz-neg)' }}>{fix(b)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className={c.mats}>
            <MatrixGrid data={Q} format={(v) => fix(v, 2)} label="Q" cellSize={50} ariaLabel="the matrix" />
            <MatrixGrid data={QtQ} format={(v) => fix(v, 2)} label="QᵀQ" cellSize={50} ariaLabel="Q transpose times Q" />
          </div>
          <div className={`${s.status} ${isOrth ? s.statusGood : s.statusBad}`} role="status">
            {isOrth ? (
              <>
                QᵀQ = I, so Q is <b>orthogonal</b>: its columns are perpendicular and of length 1, and every length is unchanged.
              </>
            ) : (
              <>
                QᵀQ ≠ I, so this matrix is <b>not</b> orthogonal: lengths change and the circle becomes an oval.
              </>
            )}
          </div>
        </div>
      </div>
      <Controls>
        <Slider label={sliderLabel} value={p} min={0} max={kind === 'rotation' ? 360 : kind === 'reflection' ? 180 : 90} step={5} onChange={setP} format={() => sliderText} />
      </Controls>
    </>
  )
}

/** Heat map of f over the plot as a grid of rectangles (theme colours only). */
function Heat({ f, n, scaleMax }: { f: (x: number, y: number) => number; n: number; scaleMax: number }) {
  const { xs, ys } = usePlot()
  const [x0, x1] = xs.domain()
  const [y0, y1] = ys.domain()
  const hx = (x1 - x0) / n
  const hy = (y1 - y0) / n
  const cells = []
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const v = f(x0 + (i + 0.5) * hx, y0 + (j + 0.5) * hy)
      const tt = Math.min(1, Math.abs(v) / scaleMax)
      const tone = v >= 0 ? 'var(--viz-2)' : 'var(--viz-1)'
      cells.push(
        <rect
          key={`${i}-${j}`}
          x={xs(x0 + i * hx)}
          y={ys(y0 + (j + 1) * hy)}
          width={xs(x0 + hx) - xs(x0) + 0.5}
          height={ys(y0) - ys(y0 + hy) + 0.5}
          style={{ fill: `color-mix(in srgb, ${tone} ${Math.round(tt * 62)}%, var(--surface))` }}
        />,
      )
    }
  }
  return (
    <g aria-hidden="true" shapeRendering="crispEdges">
      {cells}
    </g>
  )
}

const LEVELS = [-6, -4, -2.5, -1.2, -0.4, 0.4, 1.2, 2.5, 4, 6]

function PositiveDefinite() {
  const [l1, setL1] = useState(1.5)
  const [l2, setL2] = useState(0.5)
  const [ang, setAng] = useState(30)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)
  const A = symFromEig(l1, l2, ang)
  const f = (x: number, y: number) => A[0][0] * x * x + 2 * A[0][1] * x * y + A[1][1] * y * y
  const R = 2
  const lines = useMemo(() => contour(f, -R, R, -R, R, 40, LEVELS), [l1, l2, ang]) // eslint-disable-line react-hooks/exhaustive-deps
  const zero = useMemo(() => contour(f, -R, R, -R, R, 40, [0])[0], [l1, l2, ang]) // eslint-disable-line react-hooks/exhaustive-deps
  const v1 = dirV(ang)
  const v2 = dirV(ang + 90)
  const eps = 1e-9
  let kind: { name: string; text: React.ReactNode; cls: string }
  if (l1 > eps && l2 > eps)
    kind = { name: 'bowl', cls: s.statusGood, text: <><b>Bowl: positive definite.</b> Both eigenvalues are positive, so xᵀAx &gt; 0 for every x ≠ 0. There is a single lowest point, at the centre.</> }
  else if (l1 < -eps && l2 < -eps) kind = { name: 'dome', cls: s.statusWarn, text: <><b>Dome: negative definite.</b> Both eigenvalues are negative: a single highest point.</> }
  else if ((l1 > eps && l2 < -eps) || (l1 < -eps && l2 > eps))
    kind = { name: 'saddle', cls: s.statusBad, text: <><b>Saddle: not definite.</b> One eigenvalue is positive and one negative, so the surface goes up one way and down the other. The centre is not a minimum.</> }
  else if (Math.abs(l1) <= eps && Math.abs(l2) <= eps) kind = { name: 'flat', cls: '', text: <>Both eigenvalues are 0: the function is 0 everywhere.</> }
  else if (l1 > eps || l2 > eps)
    kind = {
      name: 'trough',
      cls: s.statusWarn,
      text: <><b>Trough: positive semi-definite.</b> One eigenvalue is 0 and the other positive, so xᵀAx ≥ 0 and the surface is flat along one eigenvector: a whole line of lowest points.</>,
    }
  else
    kind = {
      name: 'ridge',
      cls: s.statusWarn,
      text: <><b>Ridge (an upside-down trough): negative semi-definite.</b> One eigenvalue is 0 and the other negative, so xᵀAx ≤ 0: a whole line of highest points.</>,
    }

  // sliders sit right under the contour map on phones, at the bottom on wider screens
  const controls = (
    <Controls>
      <Slider label={<span className={s.c2}>λ₁</span>} value={l1} min={-2} max={2} step={0.1} onChange={setL1} format={(v) => fmt(v, 1)} />
      <Slider label={<span className={s.c3}>λ₂</span>} value={l2} min={-2} max={2} step={0.1} onChange={setL2} format={(v) => fmt(v, 1)} />
      <Slider label="direction of eigenvector 1" value={ang} min={0} max={165} step={15} onChange={setAng} format={(v) => `${v}°`} />
    </Controls>
  )

  return (
    <>
      <div ref={wrapRef} className={`${s.panels} ${narrow ? s.panelsNarrow : ''}`}>
        <div className={s.panel}>
          <div className={s.panelTitle}>Contour map of f(x) = xᵀAx (orange above 0, blue below)</div>
          <Plot x={[-R, R]} y={[-R, R]} width={320} height={320} margin={{ top: 8, right: 8, bottom: 8, left: 8 }} maxWidth={380} ariaLabel="Contour map of the quadratic form">
            <Heat f={f} n={26} scaleMax={6} />
            <Axes origin hideXTicks hideYTicks />
            {lines.map((segs, i) => (
              <Segments key={i} segs={segs} color={LEVELS[i] > 0 ? 'var(--viz-2)' : 'var(--viz-1)'} width={1.4} />
            ))}
            <Segments segs={zero} color="var(--viz-ink)" width={1.6} dash="5 4" />
            <Arrow from={[0, 0]} to={scale(v1, 1.4)} color="var(--viz-ink)" width={2.4} label={`λ₁ = ${fmt(l1, 1)}`} labelOffset={[4, -6]} />
            <Arrow from={[0, 0]} to={scale(v2, 1.4)} color="var(--viz-ink)" width={2.4} label={`λ₂ = ${fmt(l2, 1)}`} labelOffset={[4, -6]} />
          </Plot>
        </div>
        {narrow && controls}
        <div className={s.panel}>
          <div className={s.panelTitle}>Slices through the centre along each eigenvector</div>
          <Plot x={[-2, 2]} y={[-6, 6]} width={300} height={200} margin={{ top: 10, right: 10, bottom: 30, left: 34 }} maxWidth={360} ariaLabel="The function along the two eigenvectors">
            <Grid xTicks={4} yTicks={4} />
            <Axes origin xTicks={4} yTicks={4} xLabel="t" />
            <FnPath f={(t) => l1 * t * t} color="var(--viz-2)" width={2.6} />
            <FnPath f={(t) => l2 * t * t} color="var(--viz-3)" width={2.6} dash="7 4" />
            <Label x={1.2} y={Math.max(-5.2, Math.min(5.2, l1 * 1.44))} dx={-4} dy={l1 >= 0 ? -8 : 16} anchor="end" color="var(--viz-2)" size={12} weight={700}>
              {`along v₁: λ₁t²`}
            </Label>
            <Label x={-1.95} y={Math.max(-5.4, Math.min(5.4, l2 * 3.8))} dx={2} dy={l2 >= 0 ? -8 : 16} color="var(--viz-3)" size={12} weight={700}>
              {`along v₂: λ₂t²`}
            </Label>
          </Plot>
          <MatrixGrid data={A} format={(v) => fix(v, 2)} label="A (symmetric)" cellSize={56} ariaLabel="the symmetric matrix A" />
          <div className={s.formula}>
            <span className={s.mono}>
              xᵀAx = {fix(A[0][0])}x² {A[0][1] < 0 ? '−' : '+'} {fix(Math.abs(2 * A[0][1]))}xy {A[1][1] < 0 ? '−' : '+'} {fix(Math.abs(A[1][1]))}y²
            </span>
          </div>
        </div>
      </div>
      <div className={`${s.status} ${kind.cls}`} role="status">
        {kind.text}
      </div>
      {!narrow && controls}
    </>
  )
}

const CAPTIONS: Record<Tab, React.ReactNode> = {
  orth: (
    <>
      <b>Try:</b>
      <ol className="try">
        <li>Pick each matrix in turn and move the slider.</li>
        <li>
          Drag <i>x</i> to try any arrow.
        </li>
      </ol>
      <b>Notice:</b> rotations and reflections keep every length (green) and the dashed circle; shears and stretches do not (red). QᵀQ is the identity
      exactly when Q is orthogonal.
      <span className="fine">Faint dashed arrows are before the matrix, solid arrows after.</span>
    </>
  ),
  pd: (
    <>
      <b>Try:</b>
      <ol className="try">
        <li>Drag λ₂ below 0, then back up to exactly 0.</li>
        <li>Turn the eigenvector direction.</li>
      </ol>
      <b>Notice:</b> both eigenvalues positive gives a bowl (positive definite), mixed signs a saddle, and a zero eigenvalue a trough (semi-definite).
      <span className="fine">
        For a symmetric matrix, xᵀAx is a curved surface over the plane, drawn here as a contour map; along each eigenvector it is simply λt². A loss function
        near a minimum has this bowl shape.
      </span>
    </>
  ),
}

/** `show` pins the figure to one of its two halves (no tab switcher); without it both are offered as tabs. */
export default function LengthKeeper({ show }: { show?: Tab }) {
  const [tabState, setTab] = useState<Tab>(show ?? 'orth')
  const tab = show ?? tabState
  const title = show === 'orth' ? 'Orthogonal matrices keep every length' : show === 'pd' ? 'Positive definite: the quadratic form is a bowl' : 'Orthogonal keeps lengths; positive definite makes a bowl'
  return (
    <Figure title={title} caption={CAPTIONS[tab]}>
      {!show && (
        <Segmented<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'orth', label: 'Orthogonal' },
            { value: 'pd', label: 'Positive definite' },
          ]}
        />
      )}
      {tab === 'orth' ? <Orthogonal /> : <PositiveDefinite />}
    </Figure>
  )
}
