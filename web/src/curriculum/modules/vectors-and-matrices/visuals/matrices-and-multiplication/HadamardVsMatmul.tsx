import { useState } from 'react'
import { Figure, Controls, Segmented } from '../../../../../kit'
import { Mat, matmul, type Tone } from './Mat'
import s from './mm.module.css'

/*
  Same two matrices, two different "multiplications". A * B multiplies matching cells and
  needs equal shapes; A @ B takes row-times-column dot products and needs matching inner sizes.
  Tap an output cell to see exactly which inputs made it.
*/

type Case = 'sq' | 'same' | 'inner'
type Op = '*' | '@'

const CASES: Record<Case, { A: number[][]; B: number[][]; label: string }> = {
  sq: { A: [[1, 2], [3, 4]], B: [[5, 6], [7, 8]], label: '2×2 and 2×2' },
  same: { A: [[1, 2, 3], [4, 5, 6]], B: [[1, 0, 2], [2, 1, 0]], label: '2×3 and 2×3' },
  inner: { A: [[1, 2, 3], [4, 5, 6]], B: [[1, 0], [0, 1], [2, 1]], label: '2×3 and 3×2' },
}

const shape = (M: number[][]) => [M.length, M[0].length] as const

export default function HadamardVsMatmul() {
  const [cs, setCs] = useState<Case>('sq')
  const [sel, setSel] = useState<{ op: Op; i: number; j: number }>({ op: '@', i: 0, j: 1 })
  const { A, B } = CASES[cs]
  const [ma, na] = shape(A)
  const [mb, nb] = shape(B)
  const starOk = ma === mb && na === nb
  const atOk = na === mb
  const star = starOk ? A.map((r, i) => r.map((v, j) => v * B[i][j])) : null
  const at = atOk ? matmul(A, B) : null

  const choose = (c: Case) => {
    setCs(c)
    const { A: a, B: b } = CASES[c]
    const ok = a[0].length === b.length
    setSel(ok ? { op: '@', i: 0, j: Math.min(1, b[0].length - 1) } : { op: '*', i: 0, j: 2 })
  }

  const { op, i, j } = sel
  const toneA = (ii: number, jj: number): Tone => (op === '*' ? (ii === i && jj === j ? 'a' : undefined) : ii === i ? 'a' : undefined)
  const toneB = (ii: number, jj: number): Tone => (op === '*' ? (ii === i && jj === j ? 'b' : undefined) : jj === j ? 'b' : undefined)
  const cell = 38

  const errStar = `ValueError: operands could not be broadcast together with shapes (${ma},${na}) (${mb},${nb})`
  const errAt = `ValueError: matmul: Input operand 1 has a mismatch in its core dimension 0, with gufunc signature (n?,k),(k,m?)->(n?,m?) (size ${mb} is different from ${na})`

  return (
    <Figure
      title="A * B versus A @ B"
      caption={
        <>
          Tap any cell in either answer to see which inputs produced it. <b>*</b> pairs each cell with the cell in the <i>same position</i>; <b>@</b> pairs a whole{' '}
          <i>row</i> with a whole <i>column</i>. Then change the shapes: one operation survives each time, and it is never the same one.
        </>
      }
    >
      <div className={s.pair}>
        <Mat data={A} name={`A (${ma}×${na})`} cell={cell} tone={toneA} strong={(ii, jj) => toneA(ii, jj) !== undefined} ariaLabel="matrix A" />
        <Mat data={B} name={`B (${mb}×${nb})`} cell={cell} tone={toneB} strong={(ii, jj) => toneB(ii, jj) !== undefined} ariaLabel="matrix B" />
      </div>

      <div className={s.pair} style={{ alignItems: 'stretch' }}>
        <div className={s.panel} style={{ flex: '1 1 150px', maxWidth: 260, borderColor: op === '*' ? 'var(--viz-3)' : undefined }}>
          <div className={s.panelTitle}>A * B</div>
          <div className={s.panelSub}>element-wise: shapes must be equal</div>
          {star ? (
            <Mat
              data={star}
              cell={cell}
              tone={(ii, jj) => (op === '*' && ii === i && jj === j ? 'out' : undefined)}
              strong={(ii, jj) => op === '*' && ii === i && jj === j}
              onCell={(ii, jj) => setSel({ op: '*', i: ii, j: jj })}
              ariaLabel="A times B element-wise"
            />
          ) : (
            <div className={s.errorBox}>{errStar}</div>
          )}
        </div>
        <div className={s.panel} style={{ flex: '1 1 150px', maxWidth: 260, borderColor: op === '@' ? 'var(--viz-3)' : undefined }}>
          <div className={s.panelTitle}>A @ B</div>
          <div className={s.panelSub}>matrix product: inner sizes must match</div>
          {at ? (
            <Mat
              data={at}
              cell={cell}
              tone={(ii, jj) => (op === '@' && ii === i && jj === j ? 'out' : undefined)}
              strong={(ii, jj) => op === '@' && ii === i && jj === j}
              onCell={(ii, jj) => setSel({ op: '@', i: ii, j: jj })}
              ariaLabel="A matrix-multiplied by B"
            />
          ) : (
            <div className={s.errorBox}>{errAt}</div>
          )}
        </div>
      </div>

      <div className={s.calc} aria-live="polite">
        {op === '*' && star && (
          <>
            <div>
              (A * B) row {i + 1}, column {j + 1} uses only the cells in that same position:
            </div>
            <div className={s.calcLine}>
              <span className={s.aNum}>{A[i][j]}</span>×<span className={s.bNum}>{B[i][j]}</span> = <span className={s.outNum}>{star[i][j]}</span>
            </div>
          </>
        )}
        {op === '@' && at && (
          <>
            <div>
              (A @ B) row {i + 1}, column {j + 1} = <span className={s.aNum}>row {i + 1} of A</span> · <span className={s.bNum}>column {j + 1} of B</span>:
            </div>
            <div className={s.calcLine}>
              {A[i].map((a, k) => (
                <span key={k}>
                  {k > 0 && '+ '}
                  <span className={s.aNum}>{a}</span>×<span className={s.bNum}>{B[k][j]}</span>
                </span>
              ))}
              <span>=</span>
              <span className={s.outNum}>{at[i][j]}</span>
            </div>
          </>
        )}
      </div>

      <Controls>
        <Segmented
          label="Shapes"
          value={cs}
          onChange={choose}
          options={(Object.keys(CASES) as Case[]).map((k) => ({ value: k, label: CASES[k].label }))}
        />
      </Controls>
    </Figure>
  )
}
