import { useEffect, useRef, useState } from 'react'
import { Figure, Controls, Button, Plot, Grid, Axes, Path, Dots, M, usePlayer, PlayerControls, useAnimationFrame } from '../../../../../kit'
import s from './iid.module.css'

/*
  Apply A to a little house, then apply A⁻¹ and watch it come home. Edit A (or pick
  "Squash") so that det A = 0: the house is flattened onto a line and the undo step fails,
  because several points now sit in the same place and nothing can separate them again.
*/

type V = [number, number]
type Mat2 = [[number, number], [number, number]]
const I: Mat2 = [
  [1, 0],
  [0, 1],
]
const HOUSE: V[] = [
  [0, 0],
  [1.2, 0],
  [1.2, 1],
  [0.6, 1.6],
  [0, 1],
]
const DOOR: V[] = [
  [0.2, 0],
  [0.5, 0],
  [0.5, 0.6],
  [0.2, 0.6],
]
const WINDOW: V = [0.85, 0.65]

const PRESETS: { name: string; A: Mat2 }[] = [
  { name: 'Rotate & grow', A: [[1, -1], [1, 1]] },
  { name: 'Shear', A: [[1, 1], [0, 1]] },
  { name: 'Stretch', A: [[2, 0], [0, 1]] },
  { name: 'Mirror', A: [[0, 1], [1, 0]] },
  { name: 'Squash', A: [[1, 1], [1, 1]] },
]

const apply = (Mx: Mat2, p: V): V => [Mx[0][0] * p[0] + Mx[0][1] * p[1], Mx[1][0] * p[0] + Mx[1][1] * p[1]]
const lerpM = (P: Mat2, Q: Mat2, t: number): Mat2 => [
  [P[0][0] + (Q[0][0] - P[0][0]) * t, P[0][1] + (Q[0][1] - P[0][1]) * t],
  [P[1][0] + (Q[1][0] - P[1][0]) * t, P[1][1] + (Q[1][1] - P[1][1]) * t],
]
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t))

function gcd(x: number, y: number): number {
  x = Math.abs(x)
  y = Math.abs(y)
  while (y) [x, y] = [y, x % y]
  return x || 1
}
/** n / den as a KaTeX fraction in lowest terms. */
function frac(n: number, den: number): string {
  if (n === 0) return '0'
  const sign = n * den < 0 ? '-' : ''
  const g = gcd(n, den)
  const p = Math.abs(n) / g
  const q = Math.abs(den) / g
  return q === 1 ? `${sign}${p}` : `${sign}\\dfrac{${p}}{${q}}`
}
const neg = (v: number) => (v === 0 ? 0 : -v)

export default function InverseUndo() {
  const [A, setA] = useState<Mat2>(PRESETS[0].A)
  const [text, setText] = useState<string[]>(['1', '-1', '1', '1'])
  const player = usePlayer({ steps: 3, interval: 1700 })
  const [a, b] = A[0]
  const [c, d] = A[1]
  const det = a * d - b * c
  const singular = det === 0
  const step = player.step

  // which matrix the house should currently be transformed by
  const target: Mat2 = step === 1 || (step === 2 && singular) ? A : I
  const [anim, setAnim] = useState<{ from: Mat2; to: Mat2; t: number }>({ from: I, to: I, t: 1 })
  const shownRef = useRef<Mat2>(I)
  const shown = lerpM(anim.from, anim.to, ease(anim.t))
  shownRef.current = shown
  const key = `${step}|${A.flat().join(',')}`
  useEffect(() => {
    setAnim({ from: shownRef.current, to: target, t: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  useAnimationFrame((dt) => setAnim((p) => ({ ...p, t: Math.min(1, p.t + Math.max(0, dt) / 0.8) })), anim.t < 1)

  const setEntry = (k: number, raw: string) => {
    const nt = [...text]
    nt[k] = raw
    const parsed = raw.trim() === '' ? 0 : Number(raw)
    if (!Number.isFinite(parsed)) {
      setText(nt) // e.g. a lone minus sign while typing
      return
    }
    const v = Math.max(-3, Math.min(3, Math.round(parsed)))
    if (raw.trim() !== '' && String(v) !== raw) nt[k] = String(v)
    setText(nt)
    const nA: Mat2 = [
      [k === 0 ? v : a, k === 1 ? v : b],
      [k === 2 ? v : c, k === 3 ? v : d],
    ]
    setA(nA)
    if (player.step > 1) player.setStep(1)
  }
  const choose = (P: Mat2) => {
    setA(P)
    setText(P.flat().map(String))
    player.reset()
  }

  const house = HOUSE.map((p) => apply(shown, p))
  const door = DOOR.map((p) => apply(shown, p))
  const win = apply(shown, WINDOW)
  const failed = step === 2 && singular

  const invTex = singular
    ? `A^{-1} = \\dfrac{1}{0}\\begin{bmatrix} ${d} & ${neg(b)} \\\\ ${neg(c)} & ${a} \\end{bmatrix} \\;\\Rightarrow\\; \\text{undefined}`
    : `A^{-1} = \\dfrac{1}{${det}}\\begin{bmatrix} ${d} & ${neg(b)} \\\\ ${neg(c)} & ${a} \\end{bmatrix}${Math.abs(det) === 1 ? ` = \\begin{bmatrix} ${frac(d, det)} & ${frac(neg(b), det)} \\\\ ${frac(neg(c), det)} & ${frac(a, det)} \\end{bmatrix}` : ''}`

  const messages = [
    <>The house as it starts. Nothing has been applied yet, which is the same as applying the identity I.</>,
    <>
      Apply A: every point p moves to Ap. {singular ? <>det A = 0, so the area becomes 0: the whole house is flattened onto a line.</> : <>Every area is multiplied by |det A| = {Math.abs(det)}.</>}
    </>,
    singular ? (
      <>
        <b>No inverse.</b> A flattened the house onto a line, so different points of the house now land on the same spot. Nothing can tell
        them apart again, and the formula would need 1/0. A is <b>singular</b>.
      </>
    ) : (
      <>
        Apply A⁻¹: every point moves back. Because A⁻¹A = I, the house is exactly where it started, door and window included.
      </>
    ),
  ]

  return (
    <Figure
      title="Undo it with the inverse"
      caption={
        <>
          Step through: apply A, then apply A⁻¹. Change the entries of A (whole numbers from −3 to 3) or pick a preset, and step again. Then make det A = 0, for
          example with <b>Squash</b> or by making one column a multiple of the other, and watch the undo step fail.
        </>
      }
    >
      <div className={s.row}>
        <div className={s.col}>
          <div className={s.matLabel}>A (type to edit)</div>
          <div className={s.edMat} style={{ gridTemplateColumns: 'repeat(2, auto)' }}>
            {text.map((t, k) => (
              <input
                key={k}
                className={s.edCell}
                type="number"
                inputMode="numeric"
                min={-3}
                max={3}
                step={1}
                value={t}
                aria-label={`A row ${Math.floor(k / 2) + 1}, column ${(k % 2) + 1}`}
                onChange={(e) => setEntry(k, e.target.value)}
              />
            ))}
          </div>
        </div>
        <div className={s.info} style={{ width: 'auto' }}>
          <M>{`\\det A = ${a}\\times ${d < 0 ? `(${d})` : d} - ${b < 0 ? `(${b})` : b}\\times ${c < 0 ? `(${c})` : c} = ${det}`}</M>
          <M>{invTex}</M>
        </div>
      </div>

      <Plot x={[-3, 3]} y={[-2.5, 3.5]} width={380} height={380} ariaLabel={`A house shape after step ${step + 1}`}>
        <Grid xTicks={6} yTicks={6} />
        <Axes origin xTicks={6} yTicks={6} />
        {/* ghost of the original house */}
        <Path points={HOUSE} closed color="var(--viz-muted)" width={1.5} dash="5 4" />
        <Path points={house} closed fill="color-mix(in srgb, var(--viz-1) 22%, transparent)" color={failed ? 'var(--viz-neg)' : 'var(--viz-1)'} width={2.5} />
        <Path points={door} closed fill="color-mix(in srgb, var(--viz-2) 55%, transparent)" color="var(--viz-2)" width={2} />
        <Dots points={[{ x: win[0], y: win[1], color: 'var(--viz-6)', r: 5 }]} />
      </Plot>

      <div className={`${s.status} ${failed ? s.statusBad : ''}`} aria-live="polite">
        {messages[step]}
      </div>

      <PlayerControls player={player} label={(st) => ['Start', 'Apply A', 'Apply A⁻¹'][st]} />
      <Controls>
        {PRESETS.map((p) => (
          <Button key={p.name} onClick={() => choose(p.A)}>
            {p.name}
          </Button>
        ))}
      </Controls>
    </Figure>
  )
}
