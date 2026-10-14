import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Toggle, Button, Plot, Grid, Axes, Path, Dots, FnPath, VLine, Label, DraggablePoint, MatrixGrid, useNarrow } from '../../../../../kit'
import { type V2, eig2, dirV, angleOf, dot, scale, lineGap, fix } from '../eigenvectors-eigenvalues/eig2'
import { whiteCloud, covariance, Cloud, Segments, type Seg } from './la2'
import s from '../eigenvectors-eigenvalues/ev.module.css'

/*
  PCA as a search: choose a direction, drop every point onto that line, and measure how spread
  out the shadows are. The spread is largest along the top eigenvector of the covariance matrix,
  and there it equals the top eigenvalue.
*/

type Key = 'tilted' | 'round' | 'thin'
const SETS: Record<Key, { a: number; b: number; deg: number; seed: number }> = {
  tilted: { a: 1.7, b: 0.6, deg: 35, seed: 5 },
  round: { a: 1.15, b: 1.0, deg: 20, seed: 9 },
  thin: { a: 1.9, b: 0.25, deg: -25, seed: 13 },
}
const norm180 = (a: number) => ((a % 180) + 180) % 180

export default function PCAProjector() {
  const [key, setKey] = useState<Key>('tilted')
  const [phi, setPhi] = useState(105)
  const [flat, setFlat] = useState(false)
  const [showPC, setShowPC] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)

  const pts = useMemo(() => {
    const d = SETS[key]
    const u = dirV(d.deg)
    const w = dirV(d.deg + 90)
    return whiteCloud(60, d.seed).map(([p, q]) => [d.a * p * u[0] + d.b * q * w[0], d.a * p * u[1] + d.b * q * w[1]] as V2)
  }, [key])
  const C = useMemo(() => covariance(pts), [pts])
  const e = eig2(C)
  const pc1 = e.kind === 'two' ? norm180(angleOf(e.v1)) : 0
  const l1 = e.kind === 'two' ? e.l1 : C[0][0]
  const l2 = e.kind === 'two' ? e.l2 : C[1][1]
  const total = C[0][0] + C[1][1]

  const u = dirV(phi)
  const scores = pts.map((p) => dot(p, u))
  const feet = scores.map((z) => scale(u, z))
  const variance = scores.reduce((acc, z) => acc + z * z, 0) / scores.length
  const lost = total - variance
  const varAt = (deg: number) => {
    const v = dirV(deg)
    return v[0] * v[0] * C[0][0] + 2 * v[0] * v[1] * C[0][1] + v[1] * v[1] * C[1][1]
  }
  const atPC1 = lineGap(phi, pc1) < 0.01
  const atPC2 = lineGap(phi, pc1 + 90) < 0.01

  const L = 4.5
  const far = L * 2
  const links: Seg[] = pts.map((p, i) => [p, feet[i]])

  // snap magnetically onto PC1 / PC2 so the learner can land exactly on them
  const turnTo = (deg: number) => {
    const a = norm180(deg)
    if (lineGap(a, pc1) < 1.5) setPhi(pc1)
    else if (lineGap(a, pc1 + 90) < 1.5) setPhi(norm180(pc1 + 90))
    else setPhi(Math.round(a))
  }
  const choose = (k: Key) => {
    setKey(k)
    setFlat(false)
  }

  return (
    <Figure
      title="PCA: find the direction where the shadows spread out most"
      caption={
        <>
          Every point casts a "shadow" onto the orange line (its projection). Drag the handle to turn the line and watch the variance of the shadows on the
          curve. The best line, PC1, is where the curve peaks: it is the top eigenvector of the covariance matrix, and the peak height is exactly the
          top eigenvalue λ₁. The lowest point, 90° away, is PC2 with variance λ₂. Whatever the angle, the kept variance plus the lost variance (mean squared distance
          to the line) is the same total, λ₁ + λ₂. Turn on <b>Flatten</b> to see the 1-number-per-point version of the data that PCA keeps. On the{' '}
          <b>Round</b> cloud no direction is much better than another.
        </>
      }
    >
      <Segmented<Key>
        label="Data"
        value={key}
        onChange={choose}
        options={[
          { value: 'tilted', label: 'Tilted' },
          { value: 'round', label: 'Round' },
          { value: 'thin', label: 'Thin' },
        ]}
      />
      <div ref={wrapRef} className={`${s.panels} ${narrow ? s.panelsNarrow : ''}`}>
        <div className={s.panel}>
          <Plot x={[-L, L]} y={[-L, L]} width={340} height={340} margin={{ top: 8, right: 8, bottom: 8, left: 8 }} maxWidth={400} ariaLabel="Data points projected onto a line through the origin">
            <Grid xTicks={9} yTicks={9} />
            <Axes origin xTicks={4} yTicks={4} />
            {showPC && e.kind === 'two' && (
              <>
                <Path points={[scale(e.v1, -far), scale(e.v1, far)]} color="var(--viz-3)" width={1.6} dash="7 5" />
                <Path points={[scale(e.v2, -far), scale(e.v2, far)]} color="var(--viz-muted)" width={1.4} dash="7 5" />
              </>
            )}
            <Path points={[scale(u, -far), scale(u, far)]} color="var(--viz-2)" width={2.5} />
            {!flat && <Segments segs={links} color="var(--viz-muted)" width={1} opacity={0.75} />}
            <Cloud pts={pts} color="var(--viz-1)" r={3} opacity={flat ? 0.15 : 0.75} />
            <Dots points={feet.map((p) => ({ x: p[0], y: p[1], r: flat ? 4 : 2.6, color: 'var(--viz-2)' }))} stroke="none" />
            <DraggablePoint
              x={u[0] * 3.7}
              y={u[1] * 3.7}
              color="var(--viz-2)"
              r={8}
              label="turn"
              onChange={(x, y) => turnTo(angleOf([x, y]))}
            />
          </Plot>
        </div>
        <div className={s.panel}>
          <div className={s.panelTitle}>Variance of the shadows for every angle</div>
          <Plot x={[0, 180]} y={[0, l1 * 1.25]} width={320} height={190} margin={{ top: 14, right: 12, bottom: 34, left: 40 }} maxWidth={380} ariaLabel="Variance of the projections against the angle of the line">
            <Grid xTicks={6} yTicks={4} />
            <Axes xTicks={6} yTicks={4} xLabel="angle of line (°)" />
            <FnPath f={varAt} color="var(--viz-5)" width={2.5} />
            <VLine x={pc1} color="var(--viz-3)" dash="4 4" />
            <Label x={pc1} y={l1} dy={-6} anchor={pc1 > 120 ? 'end' : pc1 < 40 ? 'start' : 'middle'} color="var(--viz-3)" size={12} weight={750}>
              {`PC1: λ₁ = ${fix(l1)}`}
            </Label>
            <Dots points={[{ x: phi, y: variance, color: 'var(--viz-2)', r: 6 }]} />
          </Plot>
          <MatrixGrid data={C} format={(v) => fix(v, 2)} label="Covariance matrix C" cellSize={56} ariaLabel="covariance matrix" />
          <div className={s.formula}>
            eigenvalues: <span className={`${s.mono} ${s.c3}`}>λ₁ = {fix(l1)}</span>, <span className={s.mono}>λ₂ = {fix(l2)}</span>; total ={' '}
            <span className={s.mono}>{fix(total)}</span>
          </div>
        </div>
      </div>
      <div className={`${s.status} ${atPC1 ? s.statusGood : ''}`} role="status">
        {atPC1 ? (
          <>
            This is <b>PC1</b>. The shadows are as spread out as they can be, and their variance {fix(variance)} equals λ₁, the biggest eigenvalue of C. Keeping
            only these shadows keeps {Math.round((100 * variance) / total)}% of the total variance.
          </>
        ) : atPC2 ? (
          <>
            This is <b>PC2</b>: the direction of least spread. The variance {fix(variance)} equals λ₂, the smaller eigenvalue.
          </>
        ) : (
          <>
            Along this line the shadows keep {Math.round((100 * variance) / total)}% of the total variance. Keep turning to find the peak.
          </>
        )}
      </div>
      <Controls>
        <Button onClick={() => setPhi(pc1)}>Snap to PC1</Button>
        <Button onClick={() => setPhi(norm180(pc1 + 90))}>Snap to PC2</Button>
        <Toggle label="Flatten onto the line" checked={flat} onChange={setFlat} />
        <Toggle label="Show PC1 and PC2" checked={showPC} onChange={setShowPC} />
      </Controls>
      <Controls>
        <Readout
          items={[
            ['angle', `${Math.round(phi)}°`],
            ['kept variance', fix(variance)],
            ['lost', fix(lost)],
            ['kept %', `${Math.round((100 * variance) / total)}%`],
          ]}
        />
      </Controls>
    </Figure>
  )
}
