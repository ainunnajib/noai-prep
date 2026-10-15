import { Fragment, useMemo, useState } from 'react'
import { Figure, Controls, Slider, useContainerWidth } from '../../../../../kit'
import s from './tok.module.css'

/*
  Generative-model encoding: <BOS> words <EOS>, padded with <PAD> to max_len.
  Two orders of operations are compared:
    buggy:   add <BOS>/<EOS> first, then cut to max_len  (the end marker can fall off)
    correct: cut the words to max_len - 2, then add <BOS>/<EOS>
  For the correct version the training labels are shown too: a copy of the ids with every
  padding position replaced by -100, the value PyTorch's cross-entropy ignores. A second, short
  sentence ("ok lah") is encoded in the same batch so that padding and -100 are visible at rest.
*/

const IDS = { PAD: 0, UNK: 1, BOS: 2, EOS: 3 }
const DEFAULT = 'the bus came late so i ran'
const SHORT = ['ok', 'lah']
const LABEL_W = 40
const GAP = 3
// narrowest cell that still fits "−100"; on phones the max_len slider stops at what fits
const MIN_CW = 31

interface C {
  tok: string
  id: number
  kind: 'word' | 'special' | 'pad'
}

export default function EndMarkerTruncation() {
  const [text, setText] = useState(DEFAULT)
  const [maxLen, setMaxLen] = useState(8)
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(600)

  const fitCols = Math.floor((width - LABEL_W) / (MIN_CW + GAP))
  const maxCols = Math.max(6, Math.min(12, fitCols))
  const L = Math.min(maxLen, maxCols)

  const words = useMemo(() => (text.toLowerCase().match(/[a-z0-9']+/g) ?? []).slice(0, 14), [text])
  const vocab = useMemo(() => {
    const v = new Map<string, number>()
    for (const w of [...words, ...SHORT]) if (!v.has(w)) v.set(w, 4 + v.size)
    return v
  }, [words])
  const cellsOf = (ws: string[]): C[] => ws.map((w) => ({ tok: w, id: vocab.get(w) ?? IDS.UNK, kind: 'word' }))
  const wordCells = cellsOf(words)
  const bos: C = { tok: '<BOS>', id: IDS.BOS, kind: 'special' }
  const eos: C = { tok: '<EOS>', id: IDS.EOS, kind: 'special' }
  const pad = (row: C[]): C[] => [...row, ...Array.from({ length: Math.max(0, L - row.length) }, () => ({ tok: '<PAD>', id: IDS.PAD, kind: 'pad' as const }))]
  const encode = (cells: C[]) => pad([bos, ...cells.slice(0, Math.max(0, L - 2)), eos])

  const buggy = pad([bos, ...wordCells, eos].slice(0, L))
  const correct = encode(wordCells)
  const short = encode(cellsOf(SHORT))
  const buggyHasEos = buggy.some((c) => c.tok === '<EOS>')
  const cutWords = Math.max(0, words.length - (L - 2))

  const cw = Math.max(MIN_CW, Math.min(62, Math.floor((width - LABEL_W - L * GAP) / L)))
  const cols = `${LABEL_W}px repeat(${L}, ${cw}px)`
  const showWords = cw >= 40

  const cls = (c: C) => [s.cell, c.kind === 'pad' ? s.cellPad : '', c.kind === 'special' ? s.cellSpecial : ''].join(' ')
  const tokRow = (row: C[], key: string) => (
    <Fragment key={key}>
      <span className={s.rowLabel}>ids</span>
      {row.map((c, j) => (
        <span key={j} className={cls(c)} title={`${c.tok} → ${c.id}`}>
          {showWords && <span className={s.cellWord} style={{ maxWidth: cw - 4 }}>{c.tok}</span>}
          <span className={showWords ? s.cellId : undefined}>{c.id}</span>
        </span>
      ))}
    </Fragment>
  )
  // ids, attention mask and labels of one sentence in the correct order
  const trainRows = (row: C[], key: string) => (
    <Fragment key={key}>
      {tokRow(row, `${key}-ids`)}
      <span className={s.rowLabel}>mask</span>
      {row.map((c, j) => (
        <span key={`m${j}`} className={`${s.cell} ${c.kind === 'pad' ? s.cellZero : s.cellOne}`} style={{ minHeight: 26 }}>
          {c.kind === 'pad' ? 0 : 1}
        </span>
      ))}
      <span className={s.rowLabel}>labels</span>
      {row.map((c, j) => (
        <span key={`l${j}`} className={`${s.cell} ${c.kind === 'pad' ? s.cellIgnore : ''}`} style={{ minHeight: 26, fontSize: c.kind === 'pad' && cw < 34 ? 10.5 : undefined }}>
          {c.kind === 'pad' ? '−100' : c.id}
        </span>
      ))}
    </Fragment>
  )
  const heading = (t: string, bad?: boolean) => (
    <span className={s.rowLabel} style={{ gridColumn: `1 / span ${L + 1}`, justifyContent: 'flex-start', paddingTop: 6, color: bad ? 'var(--viz-neg)' : 'var(--ink-2)', whiteSpace: 'normal' }}>
      {t}
    </span>
  )

  return (
    <Figure
      wide
      title="Truncate first, then add the end marker"
      caption={
        <>
          Generative models wrap each sequence as <code>&lt;BOS&gt; … &lt;EOS&gt;</code>. Slide <code>max_len</code> above and below the sentence
          length + 2. In the top version the markers are added first and the sequence is cut afterwards, so <code>&lt;EOS&gt;</code> silently falls off
          the end and the model is trained on sentences that never finish. Cutting the words first and adding the markers afterwards always keeps{' '}
          <code>&lt;EOS&gt;</code>. Now look at the short sentence <i>ok lah</i> in the same batch: in its labels every padding position becomes{' '}
          <code>−100</code>, the value PyTorch&apos;s cross-entropy skips, while the input itself keeps the pad id 0.
        </>
      }
    >
      <div className={s.field}>
        <label className={s.fieldLabel} htmlFor="eos-text">
          Sentence ({words.length} words)
        </label>
        <input id="eos-text" className={s.input} value={text} spellCheck={false} onChange={(e) => setText(e.target.value)} />
      </div>
      <Controls>
        <Slider label="max_len" value={L} min={4} max={maxCols} step={1} onChange={setMaxLen} />
      </Controls>
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.6rem' }}>
        <div className={s.gridScroll}>
          <div className={s.gridTable} style={{ gridTemplateColumns: cols }} role="table" aria-label="Encodings with two truncation orders">
            {heading(`✗ add <BOS>/<EOS>, then cut to ${L}${buggyHasEos ? '' : ': <EOS> is lost!'}`, !buggyHasEos)}
            {tokRow(buggy, 'bug')}
            {heading(`✓ cut words to ${L} − 2 = ${Math.max(0, L - 2)}, then add <BOS>/<EOS>`)}
            {trainRows(correct, 'ok')}
            {heading('✓ same batch, a short sentence: “ok lah”')}
            {trainRows(short, 'short')}
          </div>
        </div>
        <p className={s.legend} style={{ margin: 0 }}>
          ids: 0 = &lt;PAD&gt;, 1 = &lt;UNK&gt;, 2 = &lt;BOS&gt;, 3 = &lt;EOS&gt;, 4 and up = words
        </p>
        {buggyHasEos ? (
          <p className={s.ok} role="status">
            Everything fits ({words.length} words + 2 markers ≤ {L}), so both orders give the same result. Make <code>max_len</code> smaller.
          </p>
        ) : (
          <p className={s.warn} role="status">
            The sentence needs {words.length + 2} slots but only {L} are allowed. The buggy order drops <code>&lt;EOS&gt;</code>; the correct order
            drops {cutWords} word{cutWords === 1 ? '' : 's'} and keeps the end marker.
          </p>
        )}
      </div>
    </Figure>
  )
}
