import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Button, M, mulberry32 } from '../../../../../kit'
import s from './iid.module.css'

/*
  A 3×3 matrix you can edit. Badges light up when it is the identity, diagonal, symmetric or
  singular; trace and determinant update live. Focusing a cell also highlights its mirror
  image across the main diagonal, which is exactly what "symmetric" compares.
*/

type M3 = number[][]
const PRESETS: { name: string; A: M3 }[] = [
  { name: 'Identity', A: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] },
  { name: 'Diagonal', A: [[2, 0, 0], [0, 3, 0], [0, 0, -1]] },
  { name: 'Covariance', A: [[4, 2, 0], [2, 3, 1], [0, 1, 2]] },
  { name: 'Singular', A: [[1, 2, 3], [2, 4, 6], [1, 0, 1]] },
]
const SUB = ['₁', '₂', '₃']

const det3 = (A: M3) =>
  A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0])
const paren = (v: number) => (v < 0 ? `(${v})` : String(v))

export default function MatrixTypeSpotter() {
  const [text, setText] = useState<string[][]>(PRESETS[2].A.map((r) => r.map(String)))
  const [focus, setFocus] = useState<[number, number]>([0, 1])
  const [seed, setSeed] = useState(1)

  const A: M3 = text.map((r) => r.map((t) => {
    const v = Number(t)
    return t.trim() === '' || !Number.isFinite(v) ? 0 : v
  }))
  const offZero = A.every((r, i) => r.every((v, j) => i === j || v === 0))
  const isIdentity = offZero && A.every((r, i) => r[i] === 1)
  const isSym = A.every((r, i) => r.every((v, j) => v === A[j][i]))
  const det = det3(A)
  const singular = det === 0
  const tr = A[0][0] + A[1][1] + A[2][2]

  const [fi, fj] = focus
  const mirrorOk = A[fi][fj] === A[fj][fi]

  const setCell = (i: number, j: number, raw: string) => {
    const nt = text.map((r) => [...r])
    const v = Number(raw)
    nt[i][j] = raw.trim() !== '' && Number.isFinite(v) && Math.abs(v) > 99 ? String(Math.sign(v) * 99) : raw
    setText(nt)
  }
  const load = (P: M3) => setText(P.map((r) => r.map(String)))
  const random = () => {
    const rnd = mulberry32(seed * 7919 + 13)
    setSeed(seed + 1)
    load([0, 1, 2].map(() => [0, 1, 2].map(() => Math.floor(rnd() * 7) - 3)))
  }

  const cellStyle = (i: number, j: number): CSSProperties => {
    const inPair = (i === fi && j === fj) || (i === fj && j === fi)
    if (inPair) {
      const col = fi === fj ? 'var(--viz-5)' : mirrorOk ? 'var(--viz-3)' : 'var(--viz-neg)'
      return { borderColor: col, background: `color-mix(in srgb, ${col} 22%, var(--surface))`, borderWidth: 2.5 }
    }
    if (i === j) return { background: 'color-mix(in srgb, var(--viz-5) 13%, var(--surface-2))', borderColor: 'color-mix(in srgb, var(--viz-5) 45%, transparent)' }
    return {}
  }

  const badge = (on: boolean, label: string, bad = false) => (
    <span className={`${s.badge} ${on ? (bad ? s.badgeBad : s.badgeOn) : ''}`} aria-label={`${label}: ${on ? 'yes' : 'no'}`}>
      <span aria-hidden="true">{on ? '✓' : '·'}</span>
      {label}
    </span>
  )

  const pairText =
    fi === fj ? (
      <>
        a{SUB[fi]}
        {SUB[fj]} = {A[fi][fj]} is on the main diagonal: it is its own mirror image, and it counts towards the trace.
      </>
    ) : (
      <>
        a{SUB[fi]}
        {SUB[fj]} = {A[fi][fj]} and its mirror a{SUB[fj]}
        {SUB[fi]} = {A[fj][fi]}: <span className={mirrorOk ? s.pos : s.neg}>{mirrorOk ? 'they match' : 'they differ, so A is not symmetric'}</span>.
      </>
    )

  return (
    <Figure
      title="Spot the special matrix"
      caption={
        <>
          Type numbers into the cells or load a preset. Tap a cell to light up its mirror image across the main diagonal (shaded): a matrix is <b>symmetric</b>{' '}
          when every such pair matches. Can you make a matrix that is symmetric but not diagonal? One that is diagonal but singular? Watch the trace: only the
          shaded diagonal cells change it.
        </>
      }
    >
      <div className={s.row}>
        <div className={s.col}>
          <div className={s.matLabel}>A</div>
          <div className={s.edMat} style={{ gridTemplateColumns: 'repeat(3, auto)' }}>
            {text.map((r, i) =>
              r.map((t, j) => (
                <input
                  key={`${i}${j}`}
                  className={s.edCell}
                  style={cellStyle(i, j)}
                  type="number"
                  inputMode="numeric"
                  step={1}
                  value={t}
                  aria-label={`row ${i + 1}, column ${j + 1}`}
                  onFocus={() => setFocus([i, j])}
                  onPointerEnter={() => setFocus([i, j])}
                  onChange={(e) => setCell(i, j, e.target.value)}
                />
              )),
            )}
          </div>
        </div>
        <div className={`${s.info} ${s.big}`} style={{ width: 'auto', justifyItems: 'start', textAlign: 'left' }}>
          <M>{`\\operatorname{tr}(A) = ${A[0][0]} + ${paren(A[1][1])} + ${paren(A[2][2])} = ${tr}`}</M>
          <M>{`\\det A = ${det}`}</M>
          {offZero && <M>{`\\det A = ${A[0][0]}\\times ${paren(A[1][1])}\\times ${paren(A[2][2])}\\ \\text{(diagonal: just multiply)}`}</M>}
        </div>
      </div>

      <div className={s.badges}>
        {badge(isIdentity, 'identity')}
        {badge(offZero, 'diagonal')}
        {badge(isSym, 'symmetric (A = Aᵀ)')}
        {badge(singular, 'singular (det = 0)', true)}
      </div>

      <div className={s.info} aria-live="polite">
        <div>{pairText}</div>
      </div>

      <Controls>
        {PRESETS.map((p) => (
          <Button key={p.name} onClick={() => load(p.A)}>
            {p.name}
          </Button>
        ))}
        <Button onClick={random}>Random</Button>
      </Controls>
    </Figure>
  )
}
