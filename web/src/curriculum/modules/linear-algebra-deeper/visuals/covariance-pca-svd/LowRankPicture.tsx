import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Axes, Rect, Label } from '../../../../../kit'
import { fix } from '../eigenvectors-eigenvalues/eig2'
import { svd } from './la2'
import c from './cps.module.css'
import s from '../eigenvectors-eigenvalues/ev.module.css'

/*
  A 20×20 picture is a 20×20 matrix of ink levels. Its SVD splits it into layers σᵢ uᵢ vᵢᵀ,
  biggest first. Keeping the first k layers gives the best possible rank-k copy.
*/

const N = 20
function makeImage(): number[][] {
  const A: number[][] = []
  for (let i = 0; i < N; i++) {
    A.push([])
    for (let j = 0; j < N; j++) {
      const x = ((j + 0.5) / N) * 2 - 1
      const y = 1 - ((i + 0.5) / N) * 2
      let v = 0.08
      if (Math.hypot(x, y) < 0.86) v = 0.8
      if (Math.hypot(x + 0.33, y - 0.3) < 0.14 || Math.hypot(x - 0.33, y - 0.3) < 0.14) v = 0.05
      const d = Math.hypot(x, y - 0.1)
      if (d > 0.42 && d < 0.58 && y < -0.05) v = 0.05
      A[i].push(v)
    }
  }
  return A
}

const IMG = makeImage()

function Picture({ A, title }: { A: number[][]; title: string }) {
  const cells = []
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const v = Math.max(0, Math.min(1, A[i][j]))
      cells.push(<rect key={`${i}-${j}`} x={j} y={i} width={1.02} height={1.02} style={{ fill: `color-mix(in srgb, var(--viz-ink) ${Math.round(v * 100)}%, var(--surface))` }} />)
    }
  }
  return (
    <div className={c.pic}>
      <div className={c.picTitle}>{title}</div>
      <svg className={c.picSvg} viewBox={`0 0 ${N} ${N}`} shapeRendering="crispEdges" role="img" aria-label={title}>
        {cells}
      </svg>
    </div>
  )
}

export default function LowRankPicture() {
  const [k, setK] = useState(3)
  const dec = useMemo(() => svd(IMG), [])
  const approx = useMemo(() => {
    const out = Array.from({ length: N }, () => Array(N).fill(0) as number[])
    for (let r = 0; r < k; r++) {
      const sr = dec.s[r]
      if (sr < 1e-9) continue
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) out[i][j] += sr * dec.U[i][r] * dec.V[j][r]
    }
    return out
  }, [k, dec])
  const total = Math.sqrt(dec.s.reduce((a, x) => a + x * x, 0))
  const err = Math.sqrt(dec.s.slice(k).reduce((a, x) => a + x * x, 0))
  const rank = dec.s.filter((x) => x > 1e-6).length
  const sMax = dec.s[0]

  return (
    <Figure
      title="Low-rank approximation: keep only the biggest stretches"
      caption={
        <>
          A greyscale picture is just a matrix of numbers. The SVD writes it as a sum of simple layers σ₁u₁v₁ᵀ + σ₂u₂v₂ᵀ + …, each one a column times a row,
          ordered by its singular value. Slide <i>k</i> to keep only the first <i>k</i> layers. Three layers already give a recognisable face. After 10 nothing
          changes: this face is left-right symmetric, so only 10 singular values are non-zero and its rank is 10. The error readout is the size of what was thrown
          away, measured with the Frobenius norm from the end of this lesson.
        </>
      }
    >
      <div className={c.pics}>
        <Picture A={IMG} title="original (400 numbers)" />
        <Picture A={approx} title={`rank ${k} copy`} />
      </div>
      <div className={s.panelTitle}>Singular values of the picture (kept ones in orange)</div>
      <Plot x={[0.3, N + 0.7]} y={[0, sMax * 1.12]} width={420} height={170} margin={{ top: 14, right: 8, bottom: 32, left: 36 }} ariaLabel="Bar chart of the singular values">
        <Axes xTicks={10} yTicks={4} xLabel="i" />
        {dec.s.map((v, i) => (
          <Rect key={i} x0={i + 1 - 0.36} x1={i + 1 + 0.36} y0={0} y1={v} fill={i < k ? 'var(--viz-2)' : 'color-mix(in srgb, var(--viz-muted) 45%, transparent)'} />
        ))}
        <Label x={1} y={dec.s[0]} dy={-4} dx={10} size={12} weight={700}>
          {`σ₁ = ${fix(dec.s[0])}`}
        </Label>
      </Plot>
      <Controls>
        <Slider label={<>layers kept, <i>k</i></>} value={k} min={1} max={N} step={1} onChange={setK} />
        <Readout
          items={[
            ['numbers stored', `${k} × (20 + 20 + 1) = ${k * (2 * N + 1)}`],
            ['error ‖A − Aₖ‖', `${fix(err, 3)} (${Math.round((100 * err) / total)}%)`],
            ['rank of picture', String(rank)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
