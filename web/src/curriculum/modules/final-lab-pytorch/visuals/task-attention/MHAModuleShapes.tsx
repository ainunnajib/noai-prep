import { useState, type ReactNode } from 'react'
import { Figure, Controls, Readout, Segmented, usePlayer, PlayerControls, useNarrow } from '../../../../../kit'
import { CodeLines, Chips, type CodeLine } from './ui'
import s from './attn.module.css'

/*
  Q3.3 + Q3.4: the shape of the tensor after every line of MultiHeadAttention, for the notebook's test
  (B = 2, T = 10). The learner picks d_model and h, plays the forward pass, and can inject the two
  classic reshape slips (no transpose, no .contiguous()). Every shape is computed from the settings.
*/

type Ax = { name: string; size: number; key: 'B' | 'T' | 'h' | 'dk' | 'd' | 'T2' }
type Bug = 'ok' | 'notr' | 'nocontig'

const B = 2
const T = 10
const AX_COLOUR: Record<Ax['key'], string> = {
  B: 'var(--viz-5)',
  T: 'var(--viz-1)',
  T2: 'var(--viz-1)',
  h: 'var(--viz-2)',
  dk: 'var(--viz-3)',
  d: 'var(--viz-4)',
}

const CODE: string[] = [
  'assert d_model % num_heads == 0',
  'self.d_k = d_model // num_heads',
  'self.W_q = nn.Linear(d_model, d_model)  # also W_k, W_v, W_o',
  'Q = self.W_q(query)',
  'Q = Q.view(batch_size, -1, self.num_heads, self.d_k)',
  'Q = Q.transpose(1, 2)',
  'out, attn = scaled_dot_product_attention(Q, K, V, mask, self.dropout)',
  'out = out.transpose(1, 2)',
  'out = out.contiguous().view(batch_size, -1, self.d_model)',
  'return self.W_o(out), attn',
]
/** which code line each player step highlights */
const STEP_LINE = [1, 3, 4, 5, 6, 7, 8, 9]

function AxisRow({ axes, moved = [], bad }: { axes: Ax[]; moved?: string[]; bad?: boolean }) {
  return (
    <div className={s.axes} aria-label={`shape (${axes.map((a) => a.size).join(', ')})`}>
      <span className={s.paren}>(</span>
      {axes.map((a, i) => (
        <span
          key={`${a.key}-${i}`}
          className={`${s.axis} ${moved.includes(a.key) ? s.axisMoved : ''} ${bad ? s.axisBad : ''}`}
          style={{ ['--ax' as string]: AX_COLOUR[a.key] }}
        >
          <span className={s.axisName}>{a.name}</span>
          <span className={s.axisSize}>{a.size}</span>
        </span>
      ))}
      <span className={s.paren}>)</span>
    </div>
  )
}

export default function MHAModuleShapes() {
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const [d, setD] = useState(512)
  const [h, setH] = useState(8)
  const [bug, setBug] = useState<Bug>('ok')
  const player = usePlayer({ steps: STEP_LINE.length, interval: 1500 })
  const step = player.step
  const ok = d % h === 0
  const dk = Math.floor(d / h)

  const ax = {
    B: { name: 'B', size: B, key: 'B' } as Ax,
    T: { name: 'T', size: T, key: 'T' } as Ax,
    T2: { name: 'T', size: T, key: 'T2' } as Ax,
    h: { name: 'h', size: h, key: 'h' } as Ax,
    dk: { name: 'd_k', size: dk, key: 'dk' } as Ax,
    d: { name: 'd_model', size: d, key: 'd' } as Ax,
  }

  let shapeRow: ReactNode = null
  let extra: ReactNode = null
  let note: ReactNode = null
  let error: string | null = null

  if (!ok) {
    error = 'AssertionError: d_model must be divisible by num_heads'
    note = (
      <>
        {d} ÷ {h} = {(d / h).toFixed(2)} is not a whole number, so the heads cannot share the {d} numbers equally. The <code>assert</code> given in <code>__init__</code> stops
        the cell at once, which is exactly what you want.
      </>
    )
  } else if (step === 0) {
    shapeRow = (
      <div className={s.legend}>
        <span>
          <b>d_k</b> = {d} // {h} = <b>{dk}</b> numbers per head
        </span>
      </div>
    )
    note = (
      <>
        <code>__init__</code> runs once, when the model is built. It creates four <code>nn.Linear(d_model, d_model)</code> layers and one <code>nn.Dropout</code>. Make them here, not in{' '}
        <code>forward</code>: a layer created inside <code>forward</code> gets new random weights on every call and never learns.
      </>
    )
  } else if (step === 1) {
    shapeRow = <AxisRow axes={[ax.B, ax.T, ax.d]} />
    note = (
      <>
        <code>nn.Linear</code> only changes the last axis, here from {d} to {d} numbers. One big {d}×{d} projection does the work of {h} small {d}×{dk} projections, one per
        head, side by side.
      </>
    )
  } else if (step === 2) {
    shapeRow = bug === 'notr' ? <AxisRow axes={[ax.B, ax.h, ax.T, ax.dk]} bad /> : <AxisRow axes={[ax.B, ax.T, ax.h, ax.dk]} moved={['h', 'dk']} />
    note =
      bug === 'notr' ? (
        <>
          The slip: <code>Q.view(batch_size, self.num_heads, -1, self.d_k)</code> jumps straight to (B, h, T, d_k). The shape is right, so nothing crashes, but <code>view</code>{' '}
          only re-cuts memory in order, as the table shows.
        </>
      ) : (
        <>
          <code>view</code> cuts each token's {d} numbers into {h} groups of {dk}. The <code>-1</code> means "work this axis out": {(B * T * d).toLocaleString('en-GB')} numbers ÷ ({B}·{h}·{dk}) = {T}.
          Nothing moves in memory.
        </>
      )
    if (bug === 'notr') extra = <ScrambleTable d={d} h={h} dk={dk} />
  } else if (step === 3) {
    shapeRow = bug === 'notr' ? <AxisRow axes={[ax.B, ax.h, ax.T, ax.dk]} bad /> : <AxisRow axes={[ax.B, ax.h, ax.T, ax.dk]} moved={['h', 'T']} />
    note =
      bug === 'notr' ? (
        <>With the slip there is no transpose line, and the tensor already has the right shape. Shape tests pass; the hidden value tests do not.</>
      ) : (
        <>
          <code>transpose(1, 2)</code> swaps axes 1 and 2, bringing <b>h</b> forward. Now every head is its own (T, d_k) = ({T}, {dk}) matrix, ready for the attention function
          from Q3.1.
        </>
      )
    if (bug === 'notr') extra = <ScrambleTable d={d} h={h} dk={dk} />
  } else if (step === 4) {
    shapeRow = (
      <>
        <AxisRow axes={[ax.B, ax.h, ax.T, ax.dk]} />
        <div className={s.legend}>attention weights:</div>
        <AxisRow axes={[ax.B, ax.h, ax.T, ax.T2]} />
      </>
    )
    note = (
      <>
        One call runs all {h} heads of both sequences at once, because <code>torch.matmul</code> treats the leading axes (B, h) as a batch. Pass <code>self.dropout</code>{' '}
        here. The weights have one {T}×{T} table per head: {(B * h * T * T).toLocaleString('en-GB')} numbers.
      </>
    )
  } else if (step === 5) {
    shapeRow = <AxisRow axes={[ax.B, ax.T, ax.h, ax.dk]} moved={['h', 'T']} />
    note = <>Undo the head split in reverse order: first <code>transpose(1, 2)</code> puts T back in position 1.</>
  } else if (step === 6) {
    if (bug === 'nocontig') {
      error =
        "RuntimeError: view size is not compatible with input tensor's size and stride (at least one dimension spans across two contiguous subspaces). Use .reshape(...) instead."
      note = (
        <>
          <code>transpose</code> only changes how memory is read, so the {h} pieces of each token are no longer side by side in memory and <code>view</code> refuses. Add{' '}
          <code>.contiguous()</code> (copies into the new order) or use <code>.reshape</code>.
        </>
      )
    } else {
      shapeRow = <AxisRow axes={[ax.B, ax.T, ax.d]} moved={['d']} />
      note = (
        <>
          <code>.contiguous()</code> copies the numbers into the new order, then <code>view</code> glues the {h} heads of each token back into {d} numbers: the
          "concatenate" step of the notebook's logic.
        </>
      )
    }
  } else {
    if (bug === 'nocontig') {
      error = 'The cell already stopped at the RuntimeError on the line before.'
    } else {
      shapeRow = (
        <>
          <AxisRow axes={[ax.B, ax.T, ax.d]} />
          <div className={s.legend}>and the attention weights (B, h, T, T) = ({B}, {h}, {T}, {T})</div>
        </>
      )
      note = (
        <>
          <code>W_o</code> mixes the heads' results. The output has the <b>same shape as the input</b>, which is what the test asserts (<code>out.shape == x.shape</code>) and what lets
          layers be stacked.
        </>
      )
    }
  }

  const hl = STEP_LINE[step]
  const lines: CodeLine[] = CODE.map((code, i) => {
    let c = code
    let tone: CodeLine['tone'] = (step === 0 ? i <= 2 : i === hl) ? 'cur' : undefined
    if (bug === 'notr' && i === 4) {
      c = 'Q = Q.view(batch_size, self.num_heads, -1, self.d_k)'
      tone = 'bad'
    }
    if (bug === 'notr' && i === 5) {
      c = '# (no transpose)'
      tone = i === hl ? 'bad' : 'dim'
    }
    if (bug === 'nocontig' && i === 8) {
      c = 'out = out.view(batch_size, -1, self.d_model)'
      tone = 'bad'
    }
    if (!ok) tone = i === 0 ? 'bad' : 'dim'
    return { code: c, tone }
  })

  const hOptions = [1, 2, 3, 4, 8, 12]
  return (
    <Figure
      title="Shapes through MultiHeadAttention"
      caption={
        <>
          Press <b>Play</b> and watch the axes regroup line by line for the notebook's test (B = 2, T = 10). Change <code>d_model</code> and <code>num_heads</code>: every size
          updates, and a head count that does not divide <code>d_model</code> trips the <code>assert</code>. Then inject a slip. Notice that skipping the transpose keeps every
          shape right while scrambling which numbers each head sees.
        </>
      }
    >
      <div ref={wrapRef} className={s.stack}>
        <CodeLines lines={lines} title="class MultiHeadAttention(nn.Module)" narrow={narrow} />
        <div className={s.stage}>
          {error ? <div className={s.errorBox}>{error}</div> : shapeRow}
          {extra}
          <p className={s.say}>{note}</p>
        </div>
        <PlayerControls
          player={player}
          label={(i) => (i === 0 ? '__init__' : `forward, line ${i} of ${STEP_LINE.length - 1}`)}
        />
        <Controls>
          <Segmented
            label="d_model"
            options={[12, 64, 256, 512].map((v) => ({ value: v, label: String(v) }))}
            value={d}
            onChange={setD}
          />
          <Segmented label="num_heads" options={hOptions.map((v) => ({ value: v, label: String(v) }))} value={h} onChange={setH} />
          <Chips
            label="Inject a slip"
            options={[
              { value: 'ok', label: 'Correct code' },
              { value: 'notr', label: 'view straight to (B, h, T, d_k)', bad: true },
              { value: 'nocontig', label: 'no .contiguous()', bad: true },
            ]}
            value={bug}
            onChange={setBug}
          />
          <Readout
            items={[
              ['d_k', ok ? String(dk) : '—'],
              ['parameters 4(d² + d)', (4 * (d * d + d)).toLocaleString('en-GB')],
            ]}
          />
        </Controls>
      </div>
    </Figure>
  )
}

/**
 * Where head 0's rows really come from when Q is viewed straight to (B, h, T, d_k): view reads batch
 * item 0's memory in order, d_k numbers per row.
 */
function ScrambleTable({ d, h, dk }: { d: number; h: number; dk: number }) {
  const rows = [0, 1, 2, 3].filter((r) => r < T)
  return (
    <div className={s.strip} role="table" aria-label="Which numbers land in head 0">
      <div className={s.legend}>
        <b>Head 0:</b> row r should hold token r, numbers 0–{dk - 1}
      </div>
      {rows.map((r) => {
        const start = r * dk
        const tok = Math.floor(start / d)
        const from = start % d
        const right = tok === r && from === 0
        return (
          <div key={r} className={s.stripRow} role="row">
            <span className={s.stripLab}>row {r}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: right ? 'var(--ok)' : 'var(--bad)' }}>
              token {tok}, numbers {from}–{from + dk - 1} {right ? '✓' : '✗'}
            </span>
          </div>
        )
      })}
      {h === 1 && <div className={s.legend}>With one head the slip happens to be harmless: there is nothing to scramble.</div>}
    </div>
  )
}
