import { Fragment, useMemo, useState } from 'react'
import { Figure, Controls, Slider, useContainerWidth } from '../../../../../kit'
import s from './tok.module.css'

/*
  Generative-model encoding: <BOS> words <EOS>, padded with <PAD> to max_len.
  Two orders of operations are compared:
    buggy:   add <BOS>/<EOS> first, then cut to max_len  (the end marker can fall off)
    correct: cut the words to max_len - 2, then add <BOS>/<EOS>
  For the correct version the training labels are shown too: a copy of the ids with every
  padding position replaced by -100, the value PyTorch's cross-entropy ignores.
*/

const IDS = { PAD: 0, UNK: 1, BOS: 2, EOS: 3 }
const DEFAULT = 'the bus came late so i ran'

interface C {
  tok: string
  id: number
  kind: 'word' | 'special' | 'pad'
}

export default function EndMarkerTruncation() {
  const [text, setText] = useState(DEFAULT)
  const [maxLen, setMaxLen] = useState(8)
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(600)

  const words = useMemo(() => (text.toLowerCase().match(/[a-z0-9']+/g) ?? []).slice(0, 14), [text])
  const vocab = useMemo(() => {
    const v = new Map<string, number>()
    for (const w of words) if (!v.has(w)) v.set(w, 4 + v.size)
    return v
  }, [words])
  const wordCells: C[] = words.map((w) => ({ tok: w, id: vocab.get(w) ?? IDS.UNK, kind: 'word' }))
  const bos: C = { tok: '<BOS>', id: IDS.BOS, kind: 'special' }
  const eos: C = { tok: '<EOS>', id: IDS.EOS, kind: 'special' }
  const pad = (row: C[]): C[] => [...row, ...Array.from({ length: Math.max(0, maxLen - row.length) }, () => ({ tok: '<PAD>', id: IDS.PAD, kind: 'pad' as const }))]

  const buggy = pad([bos, ...wordCells, eos].slice(0, maxLen))
  const correct = pad([bos, ...wordCells.slice(0, Math.max(0, maxLen - 2)), eos])
  const buggyHasEos = buggy.some((c) => c.tok === '<EOS>')
  const cutWords = Math.max(0, words.length - (maxLen - 2))

  const labelW = 44
  const cw = Math.max(29, Math.min(62, Math.floor((width - labelW - (maxLen + 1) * 3) / maxLen)))
  const cols = `${labelW}px repeat(${maxLen}, ${cw}px)`
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
  const heading = (t: string, bad?: boolean) => (
    <span className={s.rowLabel} style={{ gridColumn: `1 / span ${maxLen + 1}`, justifyContent: 'flex-start', paddingTop: 6, color: bad ? 'var(--viz-neg)' : 'var(--ink-2)' }}>
      {t}
    </span>
  )

  return (
    <Figure
      wide
      title="Truncate first, then add the end marker"
      caption={
        <>
          Generative models wrap each sequence as <code>&lt;BOS&gt; … &lt;EOS&gt;</code>. Slide <code>max_len</code> below the sentence length + 2. In the
          top version the markers are added first and the sequence is cut afterwards, so <code>&lt;EOS&gt;</code> silently falls off the end and the
          model is trained on sentences that never finish. Cutting the words first and adding the markers afterwards always keeps <code>&lt;EOS&gt;</code>.
          In the labels, every padding position becomes <code>−100</code>, the value PyTorch&apos;s cross-entropy skips, while the input itself keeps the
          pad id 0.
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
        <Slider label="max_len" value={maxLen} min={4} max={12} step={1} onChange={setMaxLen} />
      </Controls>
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.6rem' }}>
        <div className={s.gridScroll}>
          <div className={s.gridTable} style={{ gridTemplateColumns: cols }} role="table" aria-label="Encodings with two truncation orders">
            {heading(`✗ add <BOS>/<EOS>, then cut to ${maxLen}${buggyHasEos ? '' : ': <EOS> is lost!'}`, !buggyHasEos)}
            {tokRow(buggy, 'bug')}
            {heading(`✓ cut words to ${maxLen} − 2 = ${Math.max(0, maxLen - 2)}, then add <BOS>/<EOS>`)}
            {tokRow(correct, 'ok')}
            <span className={s.rowLabel}>mask</span>
            {correct.map((c, j) => (
              <span key={`m${j}`} className={`${s.cell} ${c.kind === 'pad' ? s.cellZero : s.cellOne}`} style={{ minHeight: 26 }}>
                {c.kind === 'pad' ? 0 : 1}
              </span>
            ))}
            <span className={s.rowLabel}>labels</span>
            {correct.map((c, j) => (
              <span key={`l${j}`} className={`${s.cell} ${c.kind === 'pad' ? s.cellIgnore : ''}`} style={{ minHeight: 26 }}>
                {c.kind === 'pad' ? '−100' : c.id}
              </span>
            ))}
          </div>
        </div>
        {buggyHasEos ? (
          <p className={s.ok} role="status">
            Everything fits ({words.length} words + 2 markers ≤ {maxLen}), so both orders give the same result. Make <code>max_len</code> smaller.
          </p>
        ) : (
          <p className={s.warn} role="status">
            The sentence needs {words.length + 2} slots but only {maxLen} are allowed. The buggy order drops <code>&lt;EOS&gt;</code>; the correct order
            drops {cutWords} word{cutWords === 1 ? '' : 's'} and keeps the end marker.
          </p>
        )}
      </div>
    </Figure>
  )
}
