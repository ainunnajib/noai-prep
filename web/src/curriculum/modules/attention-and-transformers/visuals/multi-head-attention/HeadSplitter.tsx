import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, usePlayer, PlayerControls, CodeBlock, useContainerWidth } from '../../../../../kit'
import { attention, cols, headColour, matmul, randMat, tint, type Mat } from './mha'
import s from './mha.module.css'

/*
  The reshapes of multi-head attention, drawn for batch item 0 of a batch of B = 2.
  Every rectangle is ONE number. Its colour says which head it belongs to; its shade is its real value
  (computed with random weights). Stepping moves the same rectangles, so you can see that view and
  transpose only regroup numbers, while attention and W_o change them.
*/

const TOKENS = ['I', 'love', 'nasi', 'lemak']
const T = TOKENS.length
const B = 2

const CODE = `Q = self.W_q(x)
Q = Q.view(B, T, h, d_k)
Q = Q.transpose(1, 2)
out, attn = attention(Q, K, V)
out = out.transpose(1, 2)
out = out.contiguous().view(B, T, d_model)
y = self.W_o(out)`

const STEP_SHAPE = ['(B, T, d_model)', '(B, T, h, d_k)', '(B, h, T, d_k)', '(B, h, T, d_k)', '(B, T, h, d_k)', '(B, T, d_model)', '(B, T, d_model)']

function stepNote(step: number, d: number, h: number, dk: number) {
  switch (step) {
    case 0:
      return (
        <>
          <b>Project.</b> <code>W_q</code> turns each token into a row of d_model = {d} numbers. The colours show which head each column{' '}
          <i>will</i> belong to; nothing is split yet. (K and V are made and split in exactly the same way.)
        </>
      )
    case 1:
      return (
        <>
          <b>view.</b> The same {T * d} numbers in the same order, just regrouped: each token's row becomes {h} chunks of d_k = {dk}. The frames
          show the outer axis is still the <b>token</b>. No number moves.
        </>
      )
    case 2:
      return (
        <>
          <b>transpose(1, 2).</b> Axes 1 (tokens) and 2 (heads) swap, so the <b>head</b> is now the outer axis: {h} separate (T × d_k) ={' '}
          ({T} × {dk}) matrices. Every head still sees all {T} tokens, but only its own {dk} feature{dk === 1 ? '' : 's'}.
        </>
      )
    case 3:
      return (
        <>
          <b>Attention, in every head at once.</b> Each head builds its own {T} × {T} weight map from its own slices of Q and K (shown under each
          head) and mixes its own slice of V. The shades change because these are new numbers.
        </>
      )
    case 4:
      return (
        <>
          <b>transpose(1, 2) again.</b> Swap back so the token is the outer axis: (B, T, h, d_k). Each token now holds {h} chunk
          {h === 1 ? '' : 's'}, one answer from each head.
        </>
      )
    case 5:
      return (
        <>
          <b>contiguous().view.</b> Glue each token's {h} chunks into one row of {d} numbers: this is the <b>concatenation</b> of the heads.{' '}
          <code>contiguous()</code> first copies the numbers into this new reading order, because <code>view</code> refuses to work on
          transposed memory.
        </>
      )
    default:
      return (
        <>
          <b>Output projection.</b> <code>W_o</code> computes each output number as a weighted sum of <i>all</i> {d} numbers in the row, so the
          heads' findings are blended together. The shape is back to (B, T, d_model), ready for the next layer.
        </>
      )
  }
}

export default function HeadSplitter() {
  const [d, setD] = useState(12)
  const [h, setH] = useState(3)
  const player = usePlayer({ steps: 7, interval: 1700 })
  const step = player.step
  const valid = d % h === 0
  const dk = valid ? d / h : Math.floor(d / h)
  const [ref, width] = useContainerWidth<HTMLDivElement>(600)

  const data = useMemo(() => {
    if (!valid) return null
    const x = randMat(T, d, 11)
    const sc = 1 / Math.sqrt(d)
    const [Wq, Wk, Wv, Wo] = [21, 22, 23, 24].map((seed) => randMat(d, d, seed + d, sc))
    const Q = matmul(x, Wq)
    const K = matmul(x, Wk)
    const V = matmul(x, Wv)
    const heads = Array.from({ length: h }, (_, i) => attention(cols(Q, i * dk, (i + 1) * dk), cols(K, i * dk, (i + 1) * dk), cols(V, i * dk, (i + 1) * dk)))
    const concat: Mat = Array.from({ length: T }, (_, t) => heads.flatMap((hd) => hd.out[t]))
    const final = matmul(concat, Wo)
    return { Q, heads, concat, final }
  }, [d, h, dk, valid])

  // ---- geometry (real pixels) ----
  const Wpx = Math.max(290, Math.min(width, 640))
  const labelW = 44
  const gapBig = h <= 4 ? 16 : 10
  const cell = Math.max(11, Math.min(30, Math.floor((Wpx - labelW - 6 - (h - 1) * gapBig) / d)))
  const top = 30
  const blockW = dk * cell
  const mini = Math.max(5, Math.min(12, Math.floor(blockW / T)))
  const miniTop = top + T * cell + 12
  const Hpx = miniTop + T * mini + 8
  const gap = step === 2 || step === 3 ? gapBig : step === 1 || step === 4 ? 6 : 0
  const headX = (i: number) => labelW + i * (blockW + gap)
  const cellX = (j: number) => (valid ? headX(Math.floor(j / dk)) + (j % dk) * cell : labelW + j * cell)
  const rowY = (t: number) => top + t * cell

  const M: Mat | null = data ? (step <= 2 ? data.Q : step <= 5 ? data.concat : data.final) : null
  const flat = M ? M.flat() : [0]
  const lo = Math.min(...flat)
  const hi = Math.max(...flat)
  const shade = (v: number) => (hi === lo ? 0.5 : (v - lo) / (hi - lo))
  const totalW = valid ? labelW + h * blockW + (h - 1) * gap : labelW + d * cell

  const sizes: Record<string, number> = { B, T, h, d_k: dk, d_model: d }
  const shapeNums = STEP_SHAPE[step].replace(/[A-Za-z_]+/g, (k) => String(sizes[k] ?? k))

  return (
    <Figure
      wide
      title="Split into heads, attend, glue back together"
      caption={
        <>
          Press <b>Play</b> (or step with Next and Back) and watch batch item 0 of a batch of B = 2. Every small square is one number: its colour is
          the head it belongs to and its shade is its value. <code>view</code> and <code>transpose</code> only move squares around; attention and{' '}
          <code>W_o</code> are the only steps that compute new numbers. Then change d_model and the number of heads, and try a pair that does not
          divide (say 10 and 4).
        </>
      }
    >
      <Controls>
        <Slider label="d_model" value={d} min={4} max={16} step={1} onChange={setD} />
        <Slider label="heads h" value={h} min={1} max={8} step={1} onChange={setH} />
      </Controls>

      {valid ? (
        <div className={s.shapeLine}>
          d_k = d_model / h = {d} / {h} = {dk} <span>·</span> shape {STEP_SHAPE[step]} = {shapeNums}
        </div>
      ) : (
        <div className={s.shapeLine}>
          d_model / h = {d} / {h} = {(d / h).toFixed(2).replace(/\.?0+$/, '')} <span>(not a whole number)</span>
        </div>
      )}

      <div ref={ref} style={{ width: '100%', maxWidth: 640 }}>
        <svg viewBox={`0 0 ${Wpx} ${Hpx}`} width="100%" role="img" style={{ display: 'block', overflow: 'visible' }} aria-label={valid ? `Step ${step + 1}: tensor of shape ${shapeNums}, drawn for one batch item` : 'd_model is not divisible by the number of heads'}>
          <g style={{ transform: `translateX(${Math.max(0, (Wpx - totalW) / 2 - labelW / 2)}px)`, transition: 'transform 0.6s ease' }}>
            {/* token labels */}
            {TOKENS.map((tk, t) => (
              <text key={tk} x={labelW - 6} y={rowY(t) + cell / 2} dy="0.35em" textAnchor="end" style={{ fill: 'var(--ink)', fontSize: 12, fontWeight: 600 }}>
                {tk}
              </text>
            ))}

            {/* frames: token rows (step 1, 4) or head blocks (step 2, 3) */}
            {valid &&
              TOKENS.map((tk, t) => (
                <rect
                  key={`rf${tk}`}
                  x={labelW - 3}
                  y={rowY(t) - 2}
                  width={h * blockW + (h - 1) * 6 + 6}
                  height={cell + 4}
                  rx={5}
                  style={{ fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 1.5, strokeDasharray: '4 3', opacity: step === 1 || step === 4 ? 0.9 : 0, transition: 'opacity 0.4s' }}
                />
              ))}
            {valid &&
              Array.from({ length: h }, (_, i) => (
                <g key={`hf${i}`} style={{ opacity: step === 2 || step === 3 ? 1 : 0, transition: 'opacity 0.4s' }}>
                  <rect x={labelW + i * (blockW + gapBig) - 3} y={top - 3} width={blockW + 6} height={T * cell + 6} rx={5} style={{ fill: 'none', stroke: headColour(i), strokeWidth: 2 }} />
                </g>
              ))}

            {/* head labels above the columns */}
            {valid &&
              Array.from({ length: h }, (_, i) => (
                <text
                  key={`hl${i}`}
                  x={headX(i) + blockW / 2}
                  y={top - 9}
                  textAnchor="middle"
                  style={{
                    fill: headColour(i),
                    fontSize: 11,
                    fontWeight: 800,
                    opacity: step >= 1 && step <= 4 ? 1 : 0,
                    transition: 'opacity 0.4s',
                  }}
                >
                  {blockW >= 46 ? `head ${i}` : `h${i}`}
                </text>
              ))}
            {(step === 0 || step >= 5 || !valid) && (
              <text x={labelW + (d * cell) / 2} y={top - 9} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 11, fontWeight: 700 }}>
                {step === 6 && valid ? 'y = W_o(out): heads blended' : step === 5 && valid ? 'concatenated heads' : `${d} numbers per token`}
              </text>
            )}

            {/* the numbers */}
            {Array.from({ length: T }, (_, t) =>
              Array.from({ length: d }, (_, j) => {
                const head = valid ? Math.floor(j / dk) : -1
                const leftover = !valid && j >= h * dk
                const v = M ? M[t][j] : 0
                const fill = !valid
                  ? leftover
                    ? tint('var(--viz-neg)', 0.55)
                    : tint('var(--viz-muted)', 0.35)
                  : step === 6
                    ? tint('var(--viz-ink)', 0.12 + 0.7 * shade(v))
                    : tint(headColour(head), 0.14 + 0.8 * shade(v))
                return (
                  <rect
                    key={`${t}-${j}`}
                    x={0}
                    y={0}
                    width={cell - 2}
                    height={cell - 2}
                    rx={2.5}
                    style={{
                      transform: `translate(${cellX(j) + 1}px, ${rowY(t) + 1}px)`,
                      transition: 'transform 0.6s ease, fill 0.6s ease',
                      fill,
                      stroke: leftover ? 'var(--viz-neg)' : 'none',
                      strokeWidth: 1.5,
                    }}
                  />
                )
              }),
            )}

            {/* step 3: each head's own T x T attention map */}
            {data &&
              data.heads.map((hd, i) => (
                <g key={`mini${i}`} style={{ opacity: step === 3 ? 1 : 0, transition: 'opacity 0.4s' }} aria-hidden={step !== 3}>
                  {hd.weights.map((row, a) =>
                    row.map((w, b) => (
                      <rect
                        key={`${a}-${b}`}
                        x={labelW + i * (blockW + gapBig) + (blockW - T * mini) / 2 + b * mini}
                        y={miniTop + a * mini}
                        width={mini - 0.8}
                        height={mini - 0.8}
                        style={{ fill: tint(headColour(i), 0.08 + 0.92 * w) }}
                      />
                    )),
                  )}
                </g>
              ))}
            {step === 3 && valid && (
              <text x={labelW - 6} y={miniTop + (T * mini) / 2} dy="0.35em" textAnchor="end" style={{ fill: 'var(--ink-2)', fontSize: 10.5, fontWeight: 700 }}>
                T×T
              </text>
            )}
          </g>
        </svg>
      </div>

      {valid ? (
        <>
          <PlayerControls player={player} label={(st) => `Step ${st + 1} of 7`} />
          <p className={s.stepNote}>{stepNote(step, d, h, dk)}</p>
          <div className={s.codeWrap}>
            <CodeBlock code={CODE} language="python" title="inside MultiHeadAttention.forward" highlight={[step + 1]} showLineNumbers />
          </div>
        </>
      ) : (
        <p className={s.warn}>
          <b>
            {d} numbers per token cannot be cut into {h} equal heads.
          </b>{' '}
          The usual <code>__init__</code> stops at once with <code>AssertionError: d_model must be divisible by num_heads</code>. Without that check,
          d_k = {d} // {h} = {dk} and the reshape fails instead: <code>{`RuntimeError: shape '[${B}, ${T}, ${h}, ${dk}]' is invalid for input of size ${B * T * d}`}</code>{' '}
          (the {d - h * dk} red number{d - h * dk === 1 ? '' : 's'} per token would have no head). Choose h so that d_model ÷ h is whole.
        </p>
      )}
    </Figure>
  )
}
