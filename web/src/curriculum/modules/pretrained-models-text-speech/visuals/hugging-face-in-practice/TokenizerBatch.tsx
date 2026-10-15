import { useState } from 'react'
import { Figure, Controls, Segmented, Toggle, Readout, useContainerWidth } from '../../../../../kit'
import { TOKB } from './hfData'
import s from './hf.module.css'

/*
  What tokenizer(batch, padding=..., truncation=..., max_length=...) returns, with real bert-base-uncased ids.
  input_ids must be a rectangle to become a tensor, so short rows are padded with [PAD] = 0 and the attention_mask
  marks real tokens with 1 and padding with 0. Truncation cuts long rows but keeps [CLS] and [SEP].
*/

type Pad = 'none' | 'longest' | 'max'
const PAD_ID = 0
const MAXLEN_PAD = 16
const MAXLEN_TRUNC = 8

export default function TokenizerBatch() {
  const [pad, setPad] = useState<Pad>('longest')
  const [trunc, setTrunc] = useState(false)
  const [ref, width] = useContainerWidth<HTMLDivElement>(600)

  // apply truncation (keep [CLS] ... [SEP], as the tokenizer does)
  const tl = pad === 'max' ? MAXLEN_PAD : MAXLEN_TRUNC
  const rows = TOKB.ids.map((ids, r) => {
    const toks = TOKB.tokens[r]
    if (!trunc || ids.length <= tl) return { ids, toks, cut: [] as string[] }
    const keep = tl - 1
    return { ids: [...ids.slice(0, keep), ids[ids.length - 1]], toks: [...toks.slice(0, keep), toks[toks.length - 1]], cut: toks.slice(keep, -1) }
  })
  const longest = Math.max(...rows.map((r) => r.ids.length))
  const L = pad === 'none' ? longest : pad === 'longest' ? longest : Math.max(MAXLEN_PAD, longest)
  const ragged = pad === 'none' && new Set(rows.map((r) => r.ids.length)).size > 1

  const labW = 34
  const fit = Math.floor((Math.min(width, 640) - labW - 8) / L) - 2
  const cellIds = Math.max(40, Math.min(46, fit)) // 5-digit ids need ~40px; the grid scrolls sideways on phones
  const cellMask = Math.max(18, Math.min(46, fit))

  const grid = (kind: 'ids' | 'mask') => (
    <div className={s.mat} style={{ gridTemplateColumns: `${labW}px repeat(${L}, ${kind === 'ids' ? cellIds : cellMask}px)` }} role="table" aria-label={kind === 'ids' ? 'input_ids' : 'attention_mask'}>
      {rows.map((r, i) => [
        <span key={`l${i}`} className={s.hLab} style={{ alignSelf: 'center' }}>
          row {i}
        </span>,
        ...Array.from({ length: L }, (_, j) => {
          const real = j < r.ids.length
          if (!real && pad === 'none') return <span key={`${i}-${j}`} />
          const id = real ? r.ids[j] : PAD_ID
          const tok = real ? r.toks[j] : '[PAD]'
          const special = real && /^\[(CLS|SEP)\]$/.test(tok)
          const cls = kind === 'ids' ? [s.mCell, !real ? s.mPad : special ? s.mSpecial : ''].join(' ') : [s.mCell, real ? s.mOne : s.mPad].join(' ')
          return (
            <span key={`${i}-${j}`} className={cls} title={`${tok} → ${id}`}>
              {kind === 'ids' ? id : real ? 1 : 0}
            </span>
          )
        }),
      ])}
    </div>
  )

  const code = `enc = tok(texts${pad === 'longest' ? ', padding=True' : pad === 'max' ? `, padding="max_length", max_length=${MAXLEN_PAD}` : ''}${trunc ? `, truncation=True${pad === 'max' ? '' : `, max_length=${MAXLEN_TRUNC}`}` : ''}, return_tensors="pt")`

  return (
    <Figure
      wide
      title="What the tokenizer hands the model"
      caption={
        <>
          Three sentences go through BERT's tokenizer (real ids; hover a cell to see its token). A tensor must be a rectangle, so the short rows are filled
          with <code>[PAD]</code> = 0 and the <code>attention_mask</code> marks real tokens with 1 and padding with 0, so attention ignores the padding.
          Try "no padding" to meet the classic error, then switch on truncation: long rows are cut, but <code>[CLS]</code> and <code>[SEP]</code> are kept.
        </>
      }
    >
      <ul className={s.hint} style={{ margin: 0, paddingLeft: '1.2rem' }}>
        {TOKB.texts.map((t, i) => (
          <li key={i}>
            row {i}: "{t}" → {TOKB.tokens[i].join(' ')}
          </li>
        ))}
      </ul>
      <Controls>
        <Segmented
          label="padding"
          value={pad}
          onChange={setPad}
          options={[
            { value: 'none', label: 'none' },
            { value: 'longest', label: 'padding=True' },
            { value: 'max', label: `max_length=${MAXLEN_PAD}` },
          ]}
        />
        <Toggle label={`truncation=True (max_length=${pad === 'max' ? MAXLEN_PAD : MAXLEN_TRUNC})`} checked={trunc} onChange={setTrunc} />
      </Controls>
      <pre className={s.code}>{code}</pre>
      <div ref={ref} className={s.mats}>
        <div>
          <div className={s.matTitle}>input_ids</div>
          <div className={s.scroll}>{grid('ids')}</div>
        </div>
        <div>
          <div className={s.matTitle}>attention_mask</div>
          <div className={s.scroll}>{grid('mask')}</div>
        </div>
      </div>
      {ragged ? (
        <div className={`${s.status} ${s.statusBad}`} role="status">
          ValueError: Unable to create tensor, you should probably activate truncation and/or padding with 'padding=True' 'truncation=True' to have batched
          tensors with the same length.
        </div>
      ) : (
        <Readout
          items={[
            ['shape', `(${rows.length}, ${L})`],
            ['real tokens', String(rows.reduce((a, r) => a + r.ids.length, 0))],
            ['padding', String(rows.length * L - rows.reduce((a, r) => a + r.ids.length, 0))],
            ...(rows.some((r) => r.cut.length) ? ([['cut off', rows.flatMap((r) => r.cut).join(' ')]] as [string, string][]) : []),
          ]}
        />
      )}
    </Figure>
  )
}
