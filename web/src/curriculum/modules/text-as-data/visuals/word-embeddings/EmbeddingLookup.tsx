import { Fragment, useMemo, useState } from 'react'
import { Figure, Controls, Slider, Toggle, Readout, mulberry32, useNarrow } from '../../../../../kit'
import s from './emb.module.css'

/*
  nn.Embedding(V, d) is a V x d table. Looking up a sequence of T token ids returns a T x d matrix
  whose row t is row ids[t] of the table, which is exactly one_hot(ids) @ table.
  The table values are a fixed random "initialisation" (seeded), as before training.
*/

const VOCAB = ['[PAD]', 'the', 'uncle', 'cooks', 'spicy', 'laksa', 'at', 'hawker', 'centre', 'kopi', 'teh', 'mrt']
const TABLE: number[][] = (() => {
  const rng = mulberry32(2027)
  // row 0 is [PAD]: all zeros, as nn.Embedding(..., padding_idx=0) makes it
  return VOCAB.map((_, i) => Array.from({ length: 5 }, () => (i === 0 ? 0 : Math.round((rng() * 2 - 1) * 10) / 10)))
})()

const fmt = (x: number) => (x === 0 ? '0' : x.toFixed(1))

function Matrix({ title, rows, cols, cell, rowLabel, hlRows, selRow, colLabels, faded }: {
  title: string
  rows: number
  cols: number
  cell: (i: number, j: number) => { text: string; cls?: string }
  rowLabel?: (i: number) => string
  hlRows?: Set<number>
  selRow?: number
  colLabels?: (j: number) => string
  faded?: boolean
}) {
  return (
    <div className={s.mat} style={faded ? { opacity: 0.35 } : undefined}>
      <span className={s.matTitle}>{title}</span>
      <div className={s.grid} style={{ gridTemplateColumns: `${rowLabel ? 'auto ' : ''}repeat(${cols}, ${cols > 6 ? 22 : 36}px)` }} role="table" aria-label={title}>
        {colLabels && (
          <>
            {rowLabel && <span />}
            {Array.from({ length: cols }, (_, j) => (
              <span key={j} className={s.head} style={{ fontSize: '0.7rem' }}>
                {colLabels(j)}
              </span>
            ))}
          </>
        )}
        {Array.from({ length: rows }, (_, i) => (
          <Fragment key={i}>
            {rowLabel && (
              <span className={s.rowHead} style={{ fontSize: '0.7rem', color: hlRows?.has(i) ? 'var(--ink)' : 'var(--ink-3)' }}>
                {rowLabel(i)}
              </span>
            )}
            {Array.from({ length: cols }, (_, j) => {
              const c = cell(i, j)
              return (
                <span key={j} className={`${s.cell} ${hlRows?.has(i) ? s.rowHl : ''} ${selRow === i ? s.cellSel : ''} ${c.cls ?? ''}`} style={{ minHeight: 24 }}>
                  {c.text}
                </span>
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

export default function EmbeddingLookup() {
  const [idsText, setIdsText] = useState('1 2 3 1 5')
  const [V, setV] = useState(10)
  const [d, setD] = useState(3)
  const [oneHot, setOneHot] = useState(false)
  const [sel, setSel] = useState(0)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const opStyle = narrow ? { flexBasis: '100%', textAlign: 'center' as const, lineHeight: 1 } : undefined

  const parsed = useMemo(() => (idsText.match(/-?\d+/g) ?? []).slice(0, 6).map(Number), [idsText])
  const bad = parsed.filter((x) => x < 0 || x >= V)
  const ids = parsed.filter((x) => x >= 0 && x < V)
  const T = ids.length
  const t = Math.min(sel, Math.max(0, T - 1))
  const used = new Set(ids)
  // PyTorch raises an error for the whole lookup: there is no partial output
  const crashed = bad.length > 0

  return (
    <Figure
      wide
      title="An embedding layer is a table you look rows up in"
      caption={
        <>
          The embedding table has one row per token id (here <i>V</i> = {V} rows) and <i>d</i> = {d} columns. Looking up the ids simply copies the
          matching rows, in order, into the output; a repeated token (“the”) gets the same row twice. Switch on the one-hot view: multiplying each
          one-hot row by the table picks out exactly the same row, which is why an embedding layer is the same as a linear layer on one-hot inputs,
          only much faster. Row 0 (<code>[PAD]</code>) is all zeros, as <code>padding_idx=0</code> would make it. Change <i>V</i> and <i>d</i> to see the parameter count, and type an id ≥ <i>V</i> to see the error PyTorch raises.
        </>
      }
    >
      <div style={{ width: '100%', display: 'grid', gap: '0.3rem' }}>
        <label className={s.label} htmlFor="emb-ids">
          Token ids (up to 6): {ids.map((i) => VOCAB[i]).join(' ') || '—'}
        </label>
        <input id="emb-ids" className={s.input} value={idsText} spellCheck={false} onChange={(e) => setIdsText(e.target.value)} />
      </div>
      <Controls>
        <Slider label="vocabulary size V" value={V} min={6} max={12} step={1} onChange={setV} />
        <Slider label="embedding size d" value={d} min={2} max={5} step={1} onChange={setD} />
        <Toggle label="show as one-hot × table" checked={oneHot} onChange={setOneHot} />
      </Controls>
      {bad.length > 0 && (
        <p className={s.err} role="alert">
          IndexError: index out of range in self ({bad.length > 1 ? 'ids' : 'id'} {bad.join(', ')} {bad.length > 1 ? 'are' : 'is'} outside 0 to {V - 1}, because V = {V})
        </p>
      )}
      <div className={s.scroll} ref={wrapRef}>
        <div className={s.matrices}>
          {oneHot ? (
            <Matrix
              title={`one-hot (${T} × ${V})`}
              rows={T}
              cols={V}
              colLabels={(j) => String(j)}
              selRow={t}
              faded={crashed}
              cell={(i, j) => (ids[i] === j ? { text: '1', cls: s.cellOne } : { text: '0', cls: s.cellMuted })}
            />
          ) : (
            <Matrix title={`token ids (${T})`} rows={T} cols={1} selRow={t} faded={crashed} rowLabel={(i) => `t=${i}`} cell={(i) => ({ text: String(ids[i]) })} />
          )}
          <span className={s.op} style={opStyle}>{oneHot ? '×' : narrow ? '↓' : '→'}</span>
          <Matrix
            title={`embedding table (${V} × ${d})`}
            rows={V}
            cols={d}
            rowLabel={(i) => `${i} ${VOCAB[i]}`}
            hlRows={used}
            selRow={T ? ids[t] : undefined}
            cell={(i, j) => ({ text: fmt(TABLE[i][j]) })}
          />
          <span className={s.op} style={opStyle}>=</span>
          {crashed ? (
            <div className={s.mat}>
              <span className={s.matTitle}>output</span>
              <span className={s.err} style={{ width: 'auto', maxWidth: 160, fontFamily: 'var(--font-body)' }}>
                no output: the lookup crashed
              </span>
            </div>
          ) : (
            <div className={s.mat}>
              <span className={s.matTitle}>{`output (${T} × ${d})`}</span>
              <div className={s.grid} style={{ gridTemplateColumns: `auto repeat(${d}, 36px)` }} role="table" aria-label="output vectors">
                {ids.map((id, i) => (
                  <Fragment key={i}>
                    <button type="button" className={s.rowHead} style={{ fontSize: '0.7rem', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }} onClick={() => setSel(i)}>
                      {VOCAB[id]}
                    </button>
                    {Array.from({ length: d }, (_, j) => (
                      <button key={j} type="button" className={`${s.cellBtn} ${s.rowHl} ${t === i ? s.cellSel : ''}`} style={{ minHeight: 24 }} onClick={() => setSel(i)} aria-label={`row ${i}: ${VOCAB[id]}`}>
                        {fmt(TABLE[id][j])}
                      </button>
                    ))}
                  </Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Readout
        items={[
          ['learnable numbers', `V × d = ${V} × ${d} = ${V * d}`],
          ['BERT-base', '30,522 × 768 = 23,440,896'],
          ['selected', crashed ? '— (no output)' : T ? `output row ${t} = table row ${ids[t]} (${VOCAB[ids[t]]})` : '—'],
        ]}
      />
    </Figure>
  )
}
