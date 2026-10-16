import { useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Controls, Segmented, Button, usePlayer, PlayerControls, useNarrow } from '../../../../../kit'
import { ArrayGrid, OutputBox, mono, shapeText, smallLabel } from './Cells'

/*
  * versus @ on two small matrices. Element-wise: out[i, j] = A[i, j] * B[i, j].
  Matrix product: out[i, j] = sum_k A[i, k] * B[k, j]. Click an output cell to see its inputs;
  change the shapes to see which operation errors (messages are NumPy 2's real ones).
*/

type ShapeKey = '2x2' | '2x3' | '3x2'
type Op = '*' | '@'

const A_DATA: Record<ShapeKey, number[][]> = {
  '2x2': [
    [1, 2],
    [3, 4],
  ],
  '2x3': [
    [1, 2, 3],
    [4, 5, 6],
  ],
  '3x2': [
    [1, 2],
    [3, 4],
    [5, 6],
  ],
}
const B_DATA: Record<ShapeKey, number[][]> = {
  '2x2': [
    [2, 0],
    [1, 3],
  ],
  '2x3': [
    [2, 0, 1],
    [1, 3, 0],
  ],
  '3x2': [
    [2, 0],
    [1, 3],
    [0, 1],
  ],
}
const SHAPES: { value: ShapeKey; label: string }[] = [
  { value: '2x2', label: '(2, 2)' },
  { value: '2x3', label: '(2, 3)' },
  { value: '3x2', label: '(3, 2)' },
]

const dims = (m: number[][]) => [m.length, m[0].length] as [number, number]

const A_COL = 'var(--viz-1)'
const B_COL = 'var(--viz-2)'
const C_COL = 'var(--viz-3)'

function Num({ v, c }: { v: number; c: string }) {
  return <span style={{ color: c, fontWeight: 700 }}>{v}</span>
}

export default function ElementwiseVsMatmul() {
  const [op, setOp] = useState<Op>('*')
  const [sa, setSa] = useState<ShapeKey>('2x3')
  const [sb, setSb] = useState<ShapeKey>('2x3')
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const A = A_DATA[sa]
  const B = B_DATA[sb]
  const [ar, ac] = dims(A)
  const [br, bc] = dims(B)
  const ok = op === '*' ? ar === br && ac === bc : ac === br
  const outR = ar
  const outC = op === '*' ? ac : bc
  const out: number[][] = ok
    ? Array.from({ length: outR }, (_, i) =>
        Array.from({ length: outC }, (_, j) => (op === '*' ? A[i][j] * B[i][j] : A[i].reduce((s, a, k) => s + a * B[k][j], 0))),
      )
    : []
  const nCells = ok ? outR * outC : 1
  const player = usePlayer({ steps: nCells, interval: 1500 })
  const step = Math.min(player.step, nCells - 1)
  const si = ok ? Math.floor(step / outC) : -1
  const sj = ok ? step % outC : -1
  const size = narrow ? 34 : 42

  const toneA = (i: number, j: number) => (!ok ? 'plain' : op === '*' ? (i === si && j === sj ? 'a' : 'plain') : i === si ? 'a' : 'plain')
  const toneB = (i: number, j: number) => (!ok ? 'plain' : op === '*' ? (i === si && j === sj ? 'b' : 'plain') : j === sj ? 'b' : 'plain')

  const opSym: CSSProperties = { ...mono, fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink-2)', alignSelf: 'center', padding: '0 2px' }

  let formula: ReactNode = null
  if (ok && op === '*') {
    formula = (
      <>
        out[{si}, {sj}] = A[{si}, {sj}] × B[{si}, {sj}] = <Num v={A[si][sj]} c={A_COL} /> × <Num v={B[si][sj]} c={B_COL} /> = <Num v={out[si][sj]} c={C_COL} />
      </>
    )
  } else if (ok) {
    formula = (
      <>
        out[{si}, {sj}] = (row {si} of A) · (column {sj} of B) ={' '}
        {A[si].map((a, k) => (
          <span key={k}>
            {k > 0 && ' + '}
            <Num v={a} c={A_COL} />×<Num v={B[k][sj]} c={B_COL} />
          </span>
        ))}{' '}
        = <Num v={out[si][sj]} c={C_COL} />
      </>
    )
  }

  const errText =
    op === '*'
      ? `ValueError: operands could not be broadcast together with shapes (${ar},${ac}) (${br},${bc})`
      : `ValueError: matmul: Input operand 1 has a mismatch in its core dimension 0, with gufunc signature (n?,k),(k,m?)->(n?,m?) (size ${br} is different from ${ac})`
  const fixKey: ShapeKey = op === '*' ? sa : ac === 2 ? '2x3' : '3x2'

  const shapeRule =
    op === '*' ? (
      <>
        {shapeText([ar, ac])} * {shapeText([br, bc])}:{' '}
        {ok ? (
          <>
            same shape, so the result is <b>{shapeText([outR, outC])}</b>
          </>
        ) : (
          <span style={{ color: 'var(--viz-neg)', fontWeight: 700 }}>shapes differ, so there is no partner for every cell</span>
        )}
      </>
    ) : (
      <>
        ({ar}, <b style={{ color: ok ? 'var(--viz-pos)' : 'var(--viz-neg)' }}>{ac}</b>) @ (<b style={{ color: ok ? 'var(--viz-pos)' : 'var(--viz-neg)' }}>{br}</b>, {bc}):{' '}
        {ok ? (
          <>
            inner sizes match ({ac} = {br}), result is the outer pair <b>{shapeText([ar, bc])}</b>
          </>
        ) : (
          <span style={{ color: 'var(--viz-neg)', fontWeight: 700 }}>
            inner sizes {ac} ≠ {br}: a row of A has {ac} numbers but a column of B has {br}
          </span>
        )}
      </>
    )

  return (
    <Figure
      title="* pairs up positions; @ mixes rows with columns"
      caption={
        <>
          Switch between <code>A * B</code> and <code>A @ B</code>, then click any cell of the result (or press Play) to see which inputs made it. With{' '}
          <code>*</code> each output uses <em>one</em> number from each matrix, in the same position. With <code>@</code> each output uses a whole{' '}
          <b>row</b> of A and a whole <b>column</b> of B. Change the shapes: <code>*</code> needs equal shapes (or broadcastable ones: next lesson), <code>@</code> needs A's column count to
          equal B's row count.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.8rem', justifyItems: 'center' }}>
        <Controls>
          <Segmented
            label="Operation"
            value={op}
            onChange={setOp}
            options={[
              { value: '*', label: narrow ? 'A * B' : 'A * B (element-wise)' },
              { value: '@', label: narrow ? 'A @ B' : 'A @ B (matrix product)' },
            ]}
          />
        </Controls>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '0.4rem 0.5rem' }}>
          <ArrayGrid data={A} size={size} tone={toneA} label={<span style={{ color: A_COL }}>A {shapeText([ar, ac])}</span>} ariaLabel="Matrix A" />
          <span style={opSym} aria-hidden="true">
            {op === '*' ? '*' : '@'}
          </span>
          <ArrayGrid data={B} size={size} tone={toneB} label={<span style={{ color: B_COL }}>B {shapeText([br, bc])}</span>} ariaLabel="Matrix B" />
          <span style={opSym} aria-hidden="true">
            =
          </span>
          {ok ? (
            <ArrayGrid
              data={out}
              size={size}
              tone={(i, j) => (i === si && j === sj ? 'c' : 'plain')}
              strong={(i, j) => i === si && j === sj}
              onCellClick={(i, j) => {
                player.pause()
                player.setStep(i * outC + j)
              }}
              label={<span style={{ color: C_COL }}>A {op} B {shapeText([outR, outC])}</span>}
              ariaLabel="Result: click a cell to see how it was computed"
            />
          ) : (
            <div style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
              <div style={{ ...smallLabel, color: 'var(--viz-neg)' }}>A {op} B</div>
              <div
                style={{
                  ...mono,
                  width: size * 2.4,
                  height: size * 2,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 10,
                  border: '2px dashed var(--viz-neg)',
                  color: 'var(--viz-neg)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                error
              </div>
            </div>
          )}
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--ink-2)', textAlign: 'center', ...mono }}>{shapeRule}</div>
        {ok ? (
          <div style={{ fontSize: '0.95rem', textAlign: 'center', ...mono, color: 'var(--ink)', lineHeight: 1.6 }} aria-live="polite">
            {formula}
          </div>
        ) : (
          <OutputBox tone="bad" label="NumPy says">
            {errText}
          </OutputBox>
        )}
        {ok ? (
          <PlayerControls player={player} label={() => `cell ${step + 1} of ${nCells}`} />
        ) : (
          <Button primary onClick={() => setSb(fixKey)}>
            Fix it: make B {SHAPES.find((s) => s.value === fixKey)!.label}
          </Button>
        )}
        <Controls>
          <Segmented label="Shape of A" value={sa} onChange={setSa} options={SHAPES} />
          <Segmented label="Shape of B" value={sb} onChange={setSb} options={SHAPES} />
        </Controls>
      </div>
    </Figure>
  )
}
