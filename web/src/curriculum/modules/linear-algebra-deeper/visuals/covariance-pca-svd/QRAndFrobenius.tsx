import { useEffect, useState } from 'react'
import { Figure, Controls, Segmented, Button, Plot, Grid, Axes, Arrow, Path, DraggablePoint, MatrixGrid, M, usePlayer, PlayerControls, useNarrow } from '../../../../../kit'
import { type V2, dot, norm, scale, fix, fmt, imageOfCircle } from '../eigenvectors-eigenvalues/eig2'
import { svd, RightAngle, MiniMat, FactorRow } from './la2'
import s from '../eigenvectors-eigenvalues/ev.module.css'
import c from './cps.module.css'

/*
  Tab 1: Gram–Schmidt builds Q (perpendicular unit columns) from the columns of A, step by step,
  and R records how to rebuild A from them.
  Tab 2: the Frobenius norm squares every entry, adds them up and takes the square root.
*/

type Tab = 'qr' | 'fro'
const LIM = 2.8
const snap = (v: number) => Math.max(-LIM, Math.min(LIM, Math.round(v * 2) / 2))

const QR_TEXT = [
  <>Start with the two columns of A. They are not perpendicular and not of length 1.</>,
  <>
    Step 1: shrink a₁ to length 1. <M>{'q_1 = a_1 / \\lVert a_1 \\rVert'}</M>. The length <M>{'\\lVert a_1 \\rVert'}</M> goes into R.
  </>,
  <>
    Step 2: find the shadow of a₂ on q₁. Its length is the dot product <M>{'q_1 \\cdot a_2'}</M>, which goes into R.
  </>,
  <>
    Step 3: subtract the shadow: <M>{'w = a_2 - (q_1 \\cdot a_2)\\,q_1'}</M> is perpendicular to q₁.
  </>,
  <>
    Step 4: shrink w to length 1 to get q₂. Its length <M>{'\\lVert w \\rVert'}</M> goes into R. Now Q = [q₁ q₂] is orthogonal and A = QR.
  </>,
]

function QRPanel() {
  const [a1, setA1] = useState<V2>([2.5, 1])
  const [a2, setA2] = useState<V2>([1, 2.5])
  const player = usePlayer({ steps: 5, interval: 1400 })
  // complete at rest: open on the finished construction; Replay steps through it
  useEffect(() => player.setStep(4), []) // eslint-disable-line react-hooks/exhaustive-deps
  const k = player.step
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)

  const r11 = norm(a1)
  const has1 = r11 > 1e-9 // q₁ only exists when a₁ is not the zero vector
  const q1: V2 = has1 ? [a1[0] / r11, a1[1] / r11] : [0, 0]
  const r12 = dot(q1, a2)
  const shadow = scale(q1, r12)
  const w: V2 = [a2[0] - shadow[0], a2[1] - shadow[1]]
  const r22 = norm(w)
  const ok = has1 && r22 > 1e-9
  const q2: V2 = ok ? [w[0] / r22, w[1] / r22] : [0, 0]
  const a2zero = norm(a2) < 1e-9
  const rank = !has1 && a2zero ? 0 : ok ? 2 : 1
  const L = 3

  const qCell = (v: number, known: boolean) => (known ? v : '?')
  const Q = [
    [qCell(q1[0], k >= 1 && has1), qCell(q2[0], k >= 4 && ok)],
    [qCell(q1[1], k >= 1 && has1), qCell(q2[1], k >= 4 && ok)],
  ]
  const R = [
    [qCell(r11, k >= 1), qCell(r12, k >= 2 && has1)],
    [0, qCell(r22, k >= 4 && has1)],
  ]
  const A = [
    [a1[0], a2[0]],
    [a1[1], a2[1]],
  ]

  return (
    <>
      <div ref={wrapRef} className={`${s.panels} ${narrow ? s.panelsNarrow : ''}`}>
        <div className={s.panel}>
          <Plot x={[-L, L]} y={[-L, L]} width={320} height={320} margin={{ top: 8, right: 8, bottom: 8, left: 8 }} maxWidth={380} ariaLabel="Gram–Schmidt: making two columns perpendicular">
            <Grid xTicks={6} yTicks={6} />
            <Axes origin xTicks={6} yTicks={6} />
            {k >= 1 && <Path points={imageOfCircle([[1, 0], [0, 1]])} closed color="var(--viz-muted)" width={1.3} dash="5 5" />}
            <Arrow from={[0, 0]} to={a1} color={k >= 1 ? 'color-mix(in srgb, var(--viz-1) 40%, transparent)' : 'var(--viz-1)'} width={2.8} label="a₁" labelOffset={[6, 14]} />
            <Arrow from={[0, 0]} to={a2} color={k >= 3 ? 'color-mix(in srgb, var(--viz-2) 40%, transparent)' : 'var(--viz-2)'} width={2.8} label="a₂" labelOffset={[6, -6]} />
            {k >= 2 && ok && (
              <>
                <Path points={[a2, shadow]} color="var(--viz-muted)" width={1.6} dash="3 4" />
                <Arrow from={[0, 0]} to={shadow} color="var(--viz-2)" width={2.4} dash="6 4" />
                {r22 > 0.25 && Math.abs(r12) > 0.25 && <RightAngle at={shadow} a={[-q1[0] * Math.sign(r12), -q1[1] * Math.sign(r12)]} b={[w[0] / r22, w[1] / r22]} />}
              </>
            )}
            {k >= 3 && ok && (
              <>
                <Arrow from={[0, 0]} to={w} color="var(--viz-4)" width={2.8} label="w" labelOffset={[-16, -6]} />
                {r22 > 0.25 && <RightAngle at={[0, 0]} a={q1} b={q2} size={11} />}
              </>
            )}
            {k >= 1 && has1 && <Arrow from={[0, 0]} to={q1} color="var(--viz-3)" width={4} label="q₁" labelOffset={[2, 16]} />}
            {k >= 4 && ok && <Arrow from={[0, 0]} to={q2} color="var(--viz-3)" width={4} label="q₂" labelOffset={[-18, -4]} />}
            <DraggablePoint x={a1[0]} y={a1[1]} color="var(--viz-1)" r={7} onChange={(x, y) => setA1([snap(x), snap(y)])} />
            <DraggablePoint x={a2[0]} y={a2[1]} color="var(--viz-2)" r={7} onChange={(x, y) => setA2([snap(x), snap(y)])} />
          </Plot>
        </div>
        <div className={s.panel}>
          <FactorRow
            lhs={<MiniMat rows={A} name="A = [a₁ a₂]" format={(v) => fmt(v, 2)} />}
            factors={[<MiniMat key="q" rows={Q} name="Q" />, <MiniMat key="r" rows={R} name="R" />]}
          />
          <div className={s.formula}>
            <div>
              <span className={s.mono}>‖a₁‖ = {fix(r11)}</span>, <span className={s.mono}>q₁·a₂ = {fix(r12)}</span>, <span className={s.mono}>‖w‖ = {fix(r22)}</span>
            </div>
            <div className={s.small}>R is upper triangular because a₁ is built from q₁ alone: a₁ = ‖a₁‖ q₁, while a₂ = (q₁·a₂) q₁ + ‖w‖ q₂.</div>
          </div>
          <div className={`${s.status} ${k === 4 && ok ? s.statusGood : ''}`} role="status">
            {ok ? (
              QR_TEXT[k]
            ) : rank === 0 ? (
              <>Both columns are zero: A has rank 0, and there is no direction at all to build Q from.</>
            ) : !has1 ? (
              <>a₁ is the zero vector, so there is no direction to make q₁ from, and Gram–Schmidt (which needs independent columns) cannot start: A has rank 1.</>
            ) : (
              <>a₂ is parallel to a₁ (or zero), so there is no new direction to make q₂ from: A has rank 1.</>
            )}
          </div>
        </div>
      </div>
      <PlayerControls player={player} label={(st) => (st === 0 ? 'Start' : `Step ${st} of 4`)} />
    </>
  )
}

const START = [
  [1, -2, 0],
  [2, 0, 4],
]

function FroPanel() {
  const [A, setA] = useState<number[][]>(START)
  const sq = A.map((r) => r.map((v) => v * v))
  const sum = sq.flat().reduce((a, b) => a + b, 0)
  const fro = Math.sqrt(sum)
  const all = svd(A).s
  const sv = all.filter((x) => x > 1e-6 * Math.max(1, all[0]))
  const svSum = sv.reduce((a, x) => a + x * x, 0)
  const bump = (i: number, j: number) => {
    const B = A.map((r) => [...r])
    B[i][j] = B[i][j] >= 3 ? -3 : B[i][j] + 1
    setA(B)
  }
  const maxSq = Math.max(1, ...sq.flat())

  return (
    <>
      <div className={c.mats}>
        <MatrixGrid data={A} format={(v) => fmt(v)} label="A (click a cell to change it)" cellSize={46} onCellClick={bump} ariaLabel="the matrix A; click a cell to change it" />
        <span className={c.op}>→</span>
        <div className={c.matCard}>
          <div className={s.small} style={{ fontWeight: 700, textAlign: 'center' }}>
            each entry squared
          </div>
          <div className={c.sqGrid} style={{ gridTemplateColumns: `repeat(${A[0].length}, 46px)` }} role="table" aria-label="the squared entries">
            {sq.flat().map((v, i) => (
              <div key={i} role="cell" className={c.sqCell} style={{ background: `color-mix(in srgb, var(--viz-2) ${Math.round(8 + (v / maxSq) * 55)}%, var(--surface))` }}>
                {v}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={s.formula} style={{ fontSize: '1rem' }}>
        <M>{`\\lVert A \\rVert_F = \\sqrt{${sq.flat().join(' + ')}} = \\sqrt{${sum}} = ${fmt(fro, 3)}`}</M>
      </div>
      <div className={s.formula}>
        Same number from the singular values:{' '}
        <M>{`\\sqrt{${sv.map((x) => `${fix(x, 2)}^2`).join(' + ') || '0'}} = ${fmt(Math.sqrt(svSum), 3)}`}</M>
      </div>
      <Controls>
        <Button onClick={() => setA(START)}>Reset</Button>
        <Button
          onClick={() =>
            setA([
              [1, 2, 3],
              [2, 4, 6],
            ])
          }
        >
          Try a rank-1 matrix
        </Button>
      </Controls>
    </>
  )
}

export default function QRAndFrobenius() {
  const [tab, setTab] = useState<Tab>('qr')
  return (
    <Figure
      title="QR by Gram–Schmidt, and the Frobenius norm"
      caption={
        tab === 'qr' ? (
          <>
            Press <b>Play</b> (or <b>Next</b>) to straighten the two columns of <i>A</i> into perpendicular unit arrows q₁ and q₂, the columns of <i>Q</i>. The
            numbers you needed along the way fill in <i>R</i>, which is upper triangular. Drag the tips of a₁ and a₂ to try other matrices: q₁ always points
            along a₁, and q₂ always sits at a right angle to it.
          </>
        ) : (
          <>
            Click any entry to change it (it cycles from −3 to 3). The Frobenius norm treats the matrix as one long list of numbers and takes its ordinary
            length: square every entry, add, square-root. The second line shows a deeper fact: the same number comes from the singular values. A rank-1 matrix
            has just one non-zero singular value, so its Frobenius norm is that σ₁.
          </>
        )
      }
    >
      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'qr', label: 'QR (Gram–Schmidt)' },
          { value: 'fro', label: 'Frobenius norm' },
        ]}
      />
      {tab === 'qr' ? <QRPanel /> : <FroPanel />}
    </Figure>
  )
}
