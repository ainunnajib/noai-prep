import { useState } from 'react'
import { Figure, Segmented } from '../../../../../kit'
import { OPS, ROWS } from './dtypeData'
import css from './tensors.module.css'

/*
  Pick a way of creating a 3-number tensor and see the dtype PyTorch gives it; then use it with a
  float32 weight vector and see which operations work. All outputs and error messages were produced
  by running the code in PyTorch (see dtypeData.ts).
*/

const WHY: string[] = [
  'Only whole numbers, so PyTorch infers int64 (also called "long").',
  "Decimal points make it floating point. PyTorch's default float is float32 (NumPy's is float64).",
  'One decimal is enough: a tensor has a single dtype, so all three numbers become float32.',
  'Capital T is the tensor class itself. Calling it always gives float32, whatever the data.',
  'True and False give a bool tensor, the kind that comparisons such as x > 0 produce.',
  'Whole-number arguments give int64, just like range(3).',
  'zeros, ones, rand, randn and linspace all default to float32.',
  'NumPy floats are float64, and from_numpy keeps that dtype (it even shares the memory).',
  'Naming the dtype yourself always wins over inference.',
]

const OP_WHY: { ok: string; bad: string }[] = [
  { ok: 'Element-wise arithmetic promotes to the wider type: int64 + float32 gives float32, float64 + float32 gives float64.', bad: '' },
  { ok: 'Both sides are float32, so the dot product works.', bad: 'Matrix and dot products do not promote: both sides must have exactly the same dtype.' },
  {
    ok: 'A float32 input meets float32 weights, so the layer runs.',
    bad: "nn.Linear stores float32 weights, so the input must be float32 too. This is the classic error when NumPy data (float64) or integer data is fed to a model.",
  },
  { ok: 'Floating point, so autograd can track it and compute gradients.', bad: 'Gradients only exist for floating-point tensors: an integer cannot be nudged by 0.001.' },
  { ok: '.float() converts to float32 first, which fixes every error in the other columns.', bad: '' },
]

const SHORT_OPS = ['+ w', '@ w', 'layer', 'grad', '.float() @']

const dtypeColour = (dt: string) =>
  dt.includes('int') ? 'var(--viz-2)' : dt.includes('float64') ? 'var(--viz-5)' : dt.includes('bool') ? 'var(--viz-4)' : 'var(--viz-3)'

const mono = { fontFamily: 'var(--font-mono)' }

export default function DtypeInspector() {
  const [ci, setCi] = useState(0)
  const [oi, setOi] = useState(2)
  const row = ROWS[ci]
  const [ok, out] = row.results[oi]
  const dt = row.dtype.replace('torch.', '')

  return (
    <Figure
      title="Which dtype did I get, and what can I do with it?"
      caption={
        <>
          Pick a way to make <code>x</code>, then an operation with the float32 weights <code>w</code>. Notice that lowercase{' '}
          <code>torch.tensor</code> copies the type of your data, while capital <code>torch.Tensor</code> always types it in float32. The table at the
          bottom sums up every combination: only float32 survives every column.
        </>
      }
    >
      <div style={{ width: '100%', display: 'grid', gap: 4 }} role="radiogroup" aria-label="How x is created">
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)' }}>
          1. Make a tensor <code>x</code>
        </div>
        {ROWS.map((r, i) => {
          const d = r.dtype.replace('torch.', '')
          const active = i === ci
          return (
            <button
              key={r.code}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setCi(i)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                textAlign: 'left',
                padding: '0.3rem 0.6rem',
                borderRadius: 8,
                border: `1.5px solid ${active ? 'var(--accent)' : 'var(--rule)'}`,
                background: active ? 'var(--accent-soft)' : 'var(--surface)',
                color: 'var(--ink)',
                cursor: 'pointer',
                font: 'inherit',
              }}
            >
              <span style={{ ...mono, fontSize: '0.8rem', overflowWrap: 'break-word', minWidth: 0 }}>{r.code}</span>
              <span style={{ ...mono, fontSize: '0.75rem', fontWeight: 800, color: dtypeColour(d), flex: 'none' }}>{d}</span>
            </button>
          )
        })}
      </div>

      <pre className={css.code}>
        <span className={css.comment}>{'>>> '}</span>
        {'print(x)\n'}
        {row.print}
        {'\n'}
        <span className={css.comment}>{'>>> '}</span>
        {'x.dtype\n'}
        <b style={{ color: dtypeColour(dt) }}>{row.dtype}</b>
      </pre>
      <div className={css.note}>{WHY[ci]}</div>

      <div style={{ width: '100%', display: 'grid', gap: 6 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)' }}>
          2. Use it with <code>w = torch.tensor([0.5, -1.0, 2.0])</code> and <code>layer = nn.Linear(3, 1)</code>
        </div>
        <Segmented label="operation" value={oi} onChange={setOi} options={OPS.map((o, i) => ({ value: i, label: <span style={mono}>{o}</span> }))} />
      </div>
      <div className={ok ? css.ok : css.error} style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.82rem' }} aria-live="polite">
        <span style={{ fontWeight: 400, opacity: 0.8 }}>{'>>> '}</span>
        {OPS[oi]}
        <br />
        {out}
      </div>
      <div className={css.note}>{ok ? OP_WHY[oi].ok : OP_WHY[oi].bad}</div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', margin: '0 auto', fontSize: '0.78rem' }} aria-label="Which operations work for each dtype">
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '2px 6px', color: 'var(--ink-3)' }}>x is…</th>
              {SHORT_OPS.map((s, i) => (
                <th key={s} style={{ ...mono, padding: '2px 6px', color: i === oi ? 'var(--accent)' : 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {['torch.int64', 'torch.float32', 'torch.float64', 'torch.bool'].map((d) => {
              const r = ROWS.find((x) => x.dtype === d)!
              const isCur = d === row.dtype
              return (
                <tr key={d} style={{ background: isCur ? 'var(--accent-soft)' : undefined }}>
                  <td style={{ ...mono, padding: '3px 6px', fontWeight: 800, color: dtypeColour(d) }}>{d.replace('torch.', '')}</td>
                  {r.results.map(([good], i) => (
                    <td
                      key={i}
                      style={{
                        textAlign: 'center',
                        padding: '3px 6px',
                        fontWeight: 800,
                        color: good ? 'var(--ok)' : 'var(--bad)',
                        outline: isCur && i === oi ? '2px solid var(--accent)' : undefined,
                        outlineOffset: -2,
                        borderRadius: 4,
                      }}
                      aria-label={good ? 'works' : 'error'}
                    >
                      {good ? '✓' : '✗'}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Figure>
  )
}
