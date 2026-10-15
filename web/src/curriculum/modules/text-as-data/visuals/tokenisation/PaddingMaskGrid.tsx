import { Fragment, useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, useContainerWidth } from '../../../../../kit'
import { TryNotice } from '../Caption'
import s from './tok.module.css'

/*
  A batch of up to 5 sentences turned into a rectangular input_ids tensor plus its attention_mask,
  the way a BERT-style tokeniser does it: (optionally) cut the words to fit, wrap them in
  [CLS] ... [SEP], then pad with [PAD] to the chosen length on the chosen side.
  Ids: [PAD] = 0, [UNK] = 1, [CLS] = 2, [SEP] = 3, then words in order of first appearance.
*/

const DEFAULT = 'see you at the hawker centre\nthe bus is late again\nok lah\ni love chicken rice so much it is shiok'
const SPECIAL = { PAD: 0, UNK: 1, CLS: 2, SEP: 3 }

interface Cell {
  tok: string
  id: number
  kind: 'word' | 'special' | 'pad' | 'over' | 'empty'
}

export default function PaddingMaskGrid() {
  const [src, setSrc] = useState(DEFAULT)
  const [maxLen, setMaxLen] = useState(8)
  const [truncate, setTruncate] = useState(true)
  const [specials, setSpecials] = useState(true)
  const [side, setSide] = useState<'right' | 'left'>('right')
  const [padTo, setPadTo] = useState<'max' | 'longest'>('max')
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(600)

  const sentences = useMemo(
    () =>
      src
        .split('\n')
        .map((l) => l.toLowerCase().match(/[a-z0-9']+/g) ?? [])
        .filter((w) => w.length)
        .slice(0, 5)
        .map((w) => w.slice(0, 16)),
    [src],
  )
  const vocab = useMemo(() => {
    const v = new Map<string, number>()
    for (const sen of sentences) for (const w of sen) if (!v.has(w)) v.set(w, 4 + v.size)
    return v
  }, [sentences])

  const extra = specials ? 2 : 0
  const budget = Math.max(0, maxLen - extra)
  const rows = sentences.map((sen) => {
    const kept = truncate ? sen.slice(0, budget) : sen
    const cut = sen.length - kept.length
    const toks: Cell[] = kept.map((w) => ({ tok: w, id: vocab.get(w) ?? SPECIAL.UNK, kind: 'word' }))
    if (specials) {
      toks.unshift({ tok: '[CLS]', id: SPECIAL.CLS, kind: 'special' })
      toks.push({ tok: '[SEP]', id: SPECIAL.SEP, kind: 'special' })
    }
    return { toks, cut }
  })
  const longest = Math.max(0, ...rows.map((r) => r.toks.length))
  const target = padTo === 'max' ? maxLen : Math.min(longest, truncate ? maxLen : longest)
  const L = Math.max(target, longest)
  const ragged = rows.some((r) => r.toks.length > target)

  const grid: Cell[][] = rows.map(({ toks }) => {
    const n = Math.max(0, target - toks.length)
    const pads: Cell[] = Array.from({ length: n }, () => ({ tok: '[PAD]', id: SPECIAL.PAD, kind: 'pad' }))
    const marked = toks.map((t, j) => (j >= target ? { ...t, kind: 'over' as const } : t))
    let row = side === 'right' ? [...marked, ...pads] : [...pads, ...marked]
    if (row.length < L) row = [...row, ...Array.from({ length: L - row.length }, () => ({ tok: '', id: 0, kind: 'empty' as const }))]
    return row
  })

  const real = rows.reduce((a, r) => a + r.toks.length, 0)
  const pads = grid.flat().filter((c) => c.kind === 'pad').length
  const labelW = 30
  const noteW = 34
  const cw = Math.max(24, Math.min(60, Math.floor((width - labelW - noteW - (L + 2) * 3) / Math.max(1, L))))
  const cols = `${labelW}px repeat(${L}, ${cw}px) ${noteW}px`
  const showWords = cw >= 34
  const overflows = labelW + noteW + L * cw + (L + 2) * 3 > width + 1

  // narrow cells: name special tokens with 3 letters ([CLS] → CLS) and show words by their id
  const cellContent = (c: Cell) =>
    showWords ? (
      <>
        <span className={s.cellWord} style={{ maxWidth: cw - 4 }}>
          {c.tok}
        </span>
        <span className={s.cellId}>{c.id}</span>
      </>
    ) : c.kind === 'word' || c.kind === 'over' ? (
      <span>{c.id}</span>
    ) : (
      <>
        <span className={s.cellAbbr}>{c.tok.replace(/[^A-Z]/g, '')}</span>
        <span className={s.cellId}>{c.id}</span>
      </>
    )

  const cellClass = (c: Cell) =>
    [s.cell, c.kind === 'pad' ? s.cellPad : '', c.kind === 'special' ? s.cellSpecial : '', c.kind === 'over' ? s.cellMissing : ''].join(' ')

  return (
    <Figure
      wide
      title="From a ragged batch to a rectangle: padding and the attention mask"
      caption={
        <TryNotice
          tryIt={
            <>
              slide <code>max_length</code>, switch truncation off, then pad to the longest sentence or on the left.
            </>
          }
          notice={
            <>
              every row is filled with <code>[PAD]</code> (id 0) to one length, and the mask marks real tokens 1, padding 0. <code>[CLS]</code> and{' '}
              <code>[SEP]</code> use up 2 of the slots.
            </>
          }
        />
      }
    >
      <div className={s.field}>
        <label className={s.fieldLabel} htmlFor="padgrid-src">
          Batch: one sentence per line (up to 5)
        </label>
        <textarea id="padgrid-src" className={s.textarea} rows={4} value={src} spellCheck={false} onChange={(e) => setSrc(e.target.value)} />
      </div>
      <Controls>
        <Slider label="max_length" value={maxLen} min={3} max={12} step={1} onChange={setMaxLen} />
        <Segmented
          label="pad to"
          value={padTo}
          onChange={setPadTo}
          options={[
            { value: 'max', label: 'max_length' },
            { value: 'longest', label: 'longest' },
          ]}
        />
        <Segmented
          label="padding side"
          value={side}
          onChange={setSide}
          options={[
            { value: 'right', label: 'right' },
            { value: 'left', label: 'left' },
          ]}
        />
        <Toggle label="truncation" checked={truncate} onChange={setTruncate} />
        <Toggle label="add [CLS] … [SEP]" checked={specials} onChange={setSpecials} />
      </Controls>
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.6rem' }}>
        {sentences.length === 0 ? (
          <p className={s.warn}>Type at least one sentence.</p>
        ) : (
          <div className={s.gridScroll}>
            <div className={s.gridTable} style={{ gridTemplateColumns: cols }} role="table" aria-label="input_ids and attention_mask for the batch">
              <span className={s.rowLabel} />
              {Array.from({ length: L }, (_, j) => (
                <span key={j} className={s.colLabel}>
                  {j}
                </span>
              ))}
              <span />
              <span className={s.rowLabel} style={{ gridColumn: `1 / span ${L + 2}`, justifyContent: 'flex-start', paddingTop: 2 }}>
                {showWords ? 'input_ids (token above, id below)' : 'input_ids (words shown by id)'}
              </span>
              {grid.map((row, i) => (
                <Fragment key={`r${i}`}>
                  <span className={s.rowLabel}>{`s${i + 1}`}</span>
                  {row.map((c, j) =>
                    c.kind === 'empty' ? (
                      <span key={j} />
                    ) : (
                      <span key={j} className={cellClass(c)} title={`${c.tok} → ${c.id}`}>
                        {cellContent(c)}
                      </span>
                    ),
                  )}
                  <span className={s.colLabel} style={{ alignSelf: 'center', color: rows[i].cut ? 'var(--viz-neg)' : undefined }}>
                    {rows[i].cut ? `✂${rows[i].cut}` : ''}
                  </span>
                </Fragment>
              ))}
              <span className={s.rowLabel} style={{ gridColumn: `1 / span ${L + 2}`, justifyContent: 'flex-start', paddingTop: 8 }}>
                attention_mask (1 = real token, 0 = padding)
              </span>
              {grid.map((row, i) => (
                <Fragment key={`m${i}`}>
                  <span className={s.rowLabel}>{`s${i + 1}`}</span>
                  {row.map((c, j) =>
                    c.kind === 'empty' ? (
                      <span key={j} />
                    ) : (
                      <span key={j} className={`${s.cell} ${c.kind === 'pad' ? s.cellZero : s.cellOne}`} style={{ minHeight: 26 }}>
                        {c.kind === 'pad' ? 0 : 1}
                      </span>
                    ),
                  )}
                  <span />
                </Fragment>
              ))}
            </div>
          </div>
        )}
        {overflows && sentences.length > 0 && <p className={s.scrollHint}>scroll the table sideways to see every column →</p>}
        <div className={s.legend}>
          <span>
            <i className={s.swatch} style={{ background: 'color-mix(in srgb, var(--viz-1) 15%, var(--surface))' }} />
            word
          </span>
          <span>
            <i className={`${s.swatch} ${s.cellSpecial}`} style={{ borderStyle: 'solid', borderWidth: 1.5 }} />
            special token
          </span>
          <span>
            <i className={`${s.swatch} ${s.cellPad}`} style={{ border: '1px solid var(--rule)' }} />
            [PAD]
          </span>
          <span style={{ color: 'var(--viz-neg)' }}>✂n = words cut off</span>
        </div>
        <p className={s.legend} style={{ margin: 0 }}>
          ids: 0 = [PAD], 1 = [UNK], 2 = [CLS], 3 = [SEP], 4 and up = words
        </p>
        {ragged ? (
          <p className={s.warn} role="status">
            Without truncation some rows are longer than {target}, so the batch is not a rectangle and cannot become one tensor. Real tokenisers raise an
            error here: switch truncation on or raise <code>max_length</code>.
          </p>
        ) : (
          <p className={s.ok} role="status">
            Rectangle OK: <code>input_ids</code> and <code>attention_mask</code> both have shape ({sentences.length}, {target}).
          </p>
        )}
      </div>
      <Readout
        items={[
          ['batch shape', ragged ? 'ragged' : `(${sentences.length}, ${target})`],
          ['real tokens', String(real)],
          ['[PAD] tokens', String(pads)],
          ['padding', ragged ? '–' : `${Math.round((100 * pads) / Math.max(1, sentences.length * target))}%`],
        ]}
      />
    </Figure>
  )
}
