import { useState } from 'react'
import { Figure, Controls, Slider, Segmented, Plot, Grid, Axes, Arrow, Path, Rect, Label, HLine, MatrixGrid, M, useNarrow } from '../../../../../kit'
import { type M2, type V2, eig2, det, trace, symFromEig, scale, dirV, fmt, fix } from './eig2'
import s from './ev.module.css'

/*
  Eigenvalues vs determinant and trace. Either choose the eigenvalues (and the direction of the
  first eigenvector) and see the matrix they make, or edit the entries and see the eigenvalues.
  Either way the bars for λ₁λ₂ and det, and for λ₁ + λ₂ and the trace, stay level.
*/

type Mode = 'eig' | 'entries'

const niceMax = (v: number) => {
  const steps = [4, 6, 8, 10, 12, 16, 20]
  return steps.find((x) => x >= v) ?? Math.ceil(v)
}

export default function EigenBars() {
  const [mode, setMode] = useState<Mode>('eig')
  const [l1, setL1] = useState(3)
  const [l2, setL2] = useState(1)
  const [ang, setAng] = useState(45)
  const [ent, setEnt] = useState<M2>([
    [2, 1],
    [1, 2],
  ])
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)

  const m: M2 = mode === 'eig' ? symFromEig(l1, l2, ang) : ent
  const D = det(m)
  const T = trace(m)
  const e = eig2(m)
  const real = e.kind !== 'complex'
  const lam: [number, number] | null = e.kind === 'two' ? [e.l1, e.l2] : e.kind === 'one' || e.kind === 'all' ? [e.l, e.l] : null
  // in 'eig' mode show the eigenvalues in the order the learner set them
  const L: [number, number] | null = mode === 'eig' ? [l1, l2] : lam && e.kind === 'two' ? ([Math.max(e.l1, e.l2), Math.min(e.l1, e.l2)] as [number, number]) : lam

  const switchMode = (md: Mode) => {
    // keep the exact entries, so the eigenvalues just chosen stay put; the 0.5-step sliders snap only when moved
    if (md === 'entries' && mode === 'eig') setEnt(m.map((r) => r.map((x) => Math.round(x * 1e6) / 1e6)) as M2)
    setMode(md)
  }
  const setEntry = (i: 0 | 1, j: 0 | 1, val: number) => {
    const mm = ent.map((r) => [...r]) as M2
    mm[i][j] = val
    setEnt(mm)
  }

  // ----- bars -----
  // For a complex pair λ = re ± im·i the product is re² + im² and the sum is 2·re: computed from the
  // eigenvalues themselves, so the match with det and trace is a genuine check, not a copy.
  const cpx = e.kind === 'complex' ? e : null
  const prod = L ? L[0] * L[1] : cpx ? cpx.re * cpx.re + cpx.im * cpx.im : D
  const sum = L ? L[0] + L[1] : cpx ? 2 * cpx.re : T
  const vals = [L ? L[0] : 0, L ? L[1] : 0, prod, D, sum, T]
  const hiV = Math.max(0, ...vals)
  const loV = Math.min(0, ...vals)
  const Yhi = hiV > 0 ? Math.max(2, niceMax(hiV * 1.2)) : 1
  const Ylo = loV < 0 ? -Math.max(2, niceMax(-loV * 1.2)) : 0
  const xsPos = [0, 1, 2.7, 3.7, 5.4, 6.4]
  const colours = ['var(--viz-1)', 'var(--viz-5)', 'var(--viz-2)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-3)']
  const names = cpx ? ['', '', 're²+im²', 'det', '2·re', 'tr'] : ['λ₁', 'λ₂', 'λ₁×λ₂', 'det', 'λ₁+λ₂', 'tr']
  const hollow = [false, false, false, true, false, true]

  // ----- area picture: eigen-parallelogram and its image -----
  type Pic = { before: V2[]; after: V2[]; i1: V2; i2: V2; eigen: boolean }
  const fromPairs = (a1: number, v1: V2, a2: number, v2: V2): Pic => {
    const i1 = scale(v1, a1)
    const i2 = scale(v2, a2)
    return {
      before: [[0, 0], v1, [v1[0] + v2[0], v1[1] + v2[1]], v2],
      after: [[0, 0], i1, [i1[0] + i2[0], i1[1] + i2[1]], i2],
      i1,
      i2,
      eigen: true,
    }
  }
  let pic: Pic
  if (mode === 'eig') pic = fromPairs(l1, dirV(ang), l2, dirV(ang + 90))
  else if (e.kind === 'two') pic = e.l1 >= e.l2 ? fromPairs(e.l1, e.v1, e.l2, e.v2) : fromPairs(e.l2, e.v2, e.l1, e.v1)
  else {
    const c1: V2 = [m[0][0], m[1][0]]
    const c2: V2 = [m[0][1], m[1][1]]
    pic = {
      before: [[0, 0], [1, 0], [1, 1], [0, 1]],
      after: [[0, 0], c1, [c1[0] + c2[0], c1[1] + c2[1]], c2],
      i1: c1,
      i2: c2,
      eigen: false,
    }
  }
  // frame the two shapes: a square window around their bounding box (equal scales on both axes)
  const allPts = [...pic.before, ...pic.after]
  const bx0 = Math.min(...allPts.map((p) => p[0]))
  const bx1 = Math.max(...allPts.map((p) => p[0]))
  const by0 = Math.min(...allPts.map((p) => p[1]))
  const by1 = Math.max(...allPts.map((p) => p[1]))
  const half = Math.max(1, (Math.max(bx1 - bx0, by1 - by0) / 2) * 1.25)
  const cx = (bx0 + bx1) / 2
  const cy = (by0 + by1) / 2
  const R = Math.ceil(half * 2) / 2

  const singular = Math.abs(D) < 0.005
  const prodOk = Math.abs(prod - D) < 1e-6
  const sumOk = Math.abs(sum - T) < 1e-6

  // the sliders, placed right under the area picture on phones and at the bottom on wider screens
  const sliders =
    mode === 'eig' ? (
      <Controls>
        <Slider label={<span className={s.c1}>λ₁</span>} value={l1} min={-3} max={3} step={0.1} onChange={setL1} format={(x) => fmt(x, 1)} />
        <Slider label={<span className={s.c5}>λ₂</span>} value={l2} min={-3} max={3} step={0.1} onChange={setL2} format={(x) => fmt(x, 1)} />
        <Slider label="direction of eigenvector 1" value={ang} min={0} max={165} step={15} onChange={setAng} format={(x) => `${x}°`} />
      </Controls>
    ) : (
      <div className={s.matSliders}>
        <Slider label="a" value={ent[0][0]} min={-3} max={3} step={0.5} onChange={(x) => setEntry(0, 0, x)} format={(x) => fmt(x)} />
        <Slider label="b" value={ent[0][1]} min={-3} max={3} step={0.5} onChange={(x) => setEntry(0, 1, x)} format={(x) => fmt(x)} />
        <Slider label="c" value={ent[1][0]} min={-3} max={3} step={0.5} onChange={(x) => setEntry(1, 0, x)} format={(x) => fmt(x)} />
        <Slider label="d" value={ent[1][1]} min={-3} max={3} step={0.5} onChange={(x) => setEntry(1, 1, x)} format={(x) => fmt(x)} />
      </div>
    )

  return (
    <Figure
      title="Eigenvalues, determinant and trace always agree"
      caption={
        <>
          <b>Try:</b>
          <ol className="try">
            <li>Drag λ₁ and λ₂ (the figure builds a matrix with those eigenvalues), then drag either one to 0.</li>
            <li>
              Switch to <b>Edit the entries</b> and let the figure find the eigenvalues.
            </li>
          </ol>
          <b>Notice:</b> the <span className={s.c2}>product</span> bar always matches the determinant and the <span className={s.c3}>sum</span> bar the trace.
          <span className="fine">
            Along its eigenvectors the matrix only stretches, by λ₁ one way and λ₂ the other, so every area is multiplied by |λ₁ × λ₂| (and mirrored when the
            product is negative).
          </span>
        </>
      }
    >
      <Segmented<Mode>
        label="Start from"
        value={mode}
        onChange={switchMode}
        options={[
          { value: 'eig', label: 'Pick the eigenvalues' },
          { value: 'entries', label: 'Edit the entries' },
        ]}
      />
      <div ref={wrapRef} className={`${s.panels} ${narrow ? s.panelsNarrow : ''}`}>
        <div className={s.panel}>
          <div className={s.panelTitle}>
            Area: the {pic.eigen ? 'eigen-parallelogram' : 'unit square'} (dashed) becomes the shaded shape
          </div>
          <Plot x={[cx - R, cx + R]} y={[cy - R, cy + R]} width={280} height={280} margin={{ top: 8, right: 8, bottom: 8, left: 8 }} maxWidth={320} ariaLabel="A parallelogram along the eigenvectors and its image after the matrix">
            <Grid xTicks={2 * R} yTicks={2 * R} />
            <Axes origin hideXTicks hideYTicks />
            <Path points={pic.after} closed color="var(--viz-2)" width={2} fill="color-mix(in srgb, var(--viz-2) 22%, transparent)" />
            <Path points={pic.before} closed color="var(--viz-ink)" width={1.5} dash="5 4" />
            <Arrow from={[0, 0]} to={pic.i1} color="var(--viz-1)" width={2.5} />
            <Arrow from={[0, 0]} to={pic.i2} color="var(--viz-5)" width={2.5} />
            {pic.eigen && (
              <>
                <Label x={pic.i1[0]} y={pic.i1[1]} dx={6} dy={-6} color="var(--viz-1)">
                  {`λ₁v₁`}
                </Label>
                <Label x={pic.i2[0]} y={pic.i2[1]} dx={6} dy={14} color="var(--viz-5)">
                  {`λ₂v₂`}
                </Label>
              </>
            )}
          </Plot>
          <div className={s.formula}>
            {pic.eigen ? (
              <>
                area × <span className={s.mono}>|λ₁ × λ₂| = {fix(Math.abs(prod))}</span>
              </>
            ) : (
              <>
                area × <span className={s.mono}>|det| = {fix(Math.abs(D))}</span>
              </>
            )}
          </div>
        </div>
        {narrow && sliders}
        <div className={s.panel}>
          <div className={s.panelTitle}>Eigenvalues against det and trace</div>
          <Plot x={[-0.6, 7]} y={[Ylo, Yhi]} width={340} height={280} margin={{ top: 18, right: 6, bottom: 40, left: 34 }} maxWidth={400} ariaLabel="Bars comparing the eigenvalues, their product and sum, with the determinant and trace">
            <Grid xTicks={0} yTicks={4} />
            <Axes hideXTicks yTicks={4} />
            <HLine y={0} color="var(--viz-axis)" dash="" width={1.5} />
            {vals.map((v, i) => {
              const show = i >= 2 || L
              if (!show) return null
              return (
                <g key={i}>
                  {hollow[i] ? (
                    <Rect x0={xsPos[i] - 0.36} x1={xsPos[i] + 0.36} y0={0} y1={v} fill={`color-mix(in srgb, ${colours[i]} 18%, transparent)`} stroke={colours[i]} />
                  ) : (
                    <Rect x0={xsPos[i] - 0.36} x1={xsPos[i] + 0.36} y0={0} y1={v} fill={colours[i]} />
                  )}
                  <Label x={xsPos[i]} y={v} dy={v >= 0 ? -5 : 15} anchor="middle" size={12}>
                    {fmt(v, 2)}
                  </Label>
                </g>
              )
            })}
            {!L && (
              <Label x={0.5} y={0} dy={-6} anchor="middle" size={12} color="var(--ink-3)">
                complex
              </Label>
            )}
            {names.map((n, i) => (
              <Label key={i} x={xsPos[i]} y={Ylo} dy={18} anchor="middle" color={colours[i]} size={12} weight={750}>
                {n}
              </Label>
            ))}
            <Label x={3.2} y={Ylo} dy={34} anchor="middle" size={12} color={prodOk ? 'var(--viz-pos)' : 'var(--viz-neg)'}>
              {prodOk ? 'equal ✓' : 'differ'}
            </Label>
            <Label x={5.9} y={Ylo} dy={34} anchor="middle" size={12} color={sumOk ? 'var(--viz-pos)' : 'var(--viz-neg)'}>
              {sumOk ? 'equal ✓' : 'differ'}
            </Label>
          </Plot>
        </div>
      </div>

      <div className={s.row}>
        <MatrixGrid data={m} format={(x) => fmt(x, 2)} cells={[[0, 0], [1, 1]]} label="A (diagonal highlighted)" cellSize={52} ariaLabel="the matrix A" />
        <div className={s.formula}>
          {real && L ? (
            <div>
              eigenvalues: <span className={s.c1}>λ₁ = {fmt(L[0])}</span>, <span className={s.c5}>λ₂ = {fmt(L[1])}</span>
            </div>
          ) : (
            e.kind === 'complex' && (
              <div>
                no real eigenvalues: <M>{`\\lambda = ${fmt(e.re)} \\pm ${fmt(e.im)}i`}</M> (a complex pair)
              </div>
            )
          )}
          <div>
            {mode === 'entries' ? (
              <M>{`\\det A = ad - bc = (${fmt(m[0][0])})(${fmt(m[1][1])}) - (${fmt(m[0][1])})(${fmt(m[1][0])}) = ${fmt(D)}`}</M>
            ) : (
              <M>{`\\det A = ad - bc = ${fmt(D)}`}</M>
            )}
          </div>
          <div>
            {mode === 'entries' ? (
              <M>{`\\operatorname{tr} A = a + d = ${fmt(m[0][0])} + ${m[1][1] < 0 ? `(${fmt(m[1][1])})` : fmt(m[1][1])} = ${fmt(T)}`}</M>
            ) : (
              <M>{`\\operatorname{tr} A = a + d = ${fmt(T)}`}</M>
            )}
          </div>
        </div>
      </div>

      <div className={`${s.status} ${singular ? s.statusWarn : ''}`} role="status">
        {singular ? (
          <>
            An eigenvalue is 0, so <b>det A = 0</b>: the matrix squashes one direction flat. It is <b>singular</b> and has no inverse.
          </>
        ) : e.kind === 'complex' ? (
          <>
            This matrix turns every direction, so its eigenvalues are a complex pair λ = {cpx ? fmt(cpx.re) : ''} ± {cpx ? fmt(cpx.im) : ''}i. Their sum, 2·re ={' '}
            {fmt(sum)}, is still the trace, and their product, re² + im² = {fmt(prod)}, is still the determinant.
          </>
        ) : (
          <>
            Product: {fmt(L ? L[0] : 0)} × {fmt(L ? L[1] : 0)} = {fmt(prod)} = det. Sum: {fmt(L ? L[0] : 0)} + {fmt(L ? L[1] : 0)} = {fmt(sum)} = trace.
          </>
        )}
      </div>

      {!narrow && sliders}
    </Figure>
  )
}
