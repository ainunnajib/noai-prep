import { useState } from 'react'
import { Figure, Controls, Readout, Slider, useNarrow } from '../../../../../kit'
import s from './bg.module.css'

/*
  The same Transformer block, two attention masks. Rows are the token doing the looking (query),
  columns are the tokens it may look at (keys). Encoder (BERT): every cell is 1. Decoder (GPT):
  lower triangle only, so token i sees positions 0..i. Clicking a row shows what that token can see,
  and, for GPT, which next token it is trained to predict.
*/

const SENT = ['i', 'take', 'the', 'mrt', 'to', 'school', 'every', 'day']
const NEXT = ['take', 'the', 'mrt', 'to', 'school', 'every', 'day', '.']

function MaskGrid({
  toks,
  causal,
  sel,
  onSel,
  cell,
  name,
}: {
  toks: string[]
  causal: boolean
  sel: number
  onSel: (i: number) => void
  cell: number
  name: string
}) {
  const T = toks.length
  return (
    <div
      className={s.maskGrid}
      style={{ gridTemplateColumns: `minmax(2.6rem, auto) repeat(${T}, ${cell}px)` }}
      role="grid"
      aria-label={`${name} attention mask: rows are queries, columns are keys`}
    >
      <span />
      {toks.map((t, j) => (
        <span key={`c${j}`} className={`${s.mLab} ${s.mColLab}`} style={{ width: cell }} title={t}>
          {t}
        </span>
      ))}
      {toks.map((t, i) => (
        <RowCells key={i} i={i} t={t} T={T} causal={causal} sel={sel} onSel={onSel} cell={cell} />
      ))}
    </div>
  )
}

function RowCells({ i, t, T, causal, sel, onSel, cell }: { i: number; t: string; T: number; causal: boolean; sel: number; onSel: (i: number) => void; cell: number }) {
  return (
    <>
      <button type="button" className={`${s.mRowLab} ${i === sel ? s.mLabOn : ''}`} onClick={() => onSel(i)} aria-pressed={i === sel}>
        {t}
      </button>
      {Array.from({ length: T }, (_, j) => {
        const on = !causal || j <= i
        const cls = [s.mCell, on ? s.mOn : s.mOff, i === sel ? s.mRowSel : '', i === sel && on ? s.mOnSel : ''].join(' ')
        return (
          <button
            key={j}
            type="button"
            className={cls}
            style={{ height: cell - 4 }}
            onClick={() => onSel(i)}
            aria-label={`${t} ${on ? 'can' : 'cannot'} attend to position ${j + 1}`}
          >
            {on ? '1' : '0'}
          </button>
        )
      })}
    </>
  )
}

export default function EncoderVsDecoderMasks() {
  const [T, setT] = useState(6)
  const [selRaw, setSel] = useState(3)
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const sel = Math.min(selRaw, T - 1)
  const toks = SENT.slice(0, T)
  const cell = narrow ? (T > 6 ? 24 : 28) : T > 6 ? 30 : 34

  const strip = (causal: boolean) => (
    <div className={s.tokens} aria-label="What the selected token can see">
      {toks.map((t, j) => {
        const seen = !causal || j <= sel
        const cls = j === sel ? s.tokSel : seen ? s.tokSeen : s.tokHidden
        return (
          <span key={j} className={`${s.tok} ${cls}`}>
            {t}
          </span>
        )
      })}
    </div>
  )

  return (
    <Figure
      wide
      title="Same blocks, different mask: BERT versus GPT"
      caption={
        <>
          Click any row to see what that token may attend to. Notice that BERT's rows are all 1s (both sides), while GPT's mask is
          lower-triangular: "{toks[sel]}" sees only itself and earlier words, so it cannot peek at the word it must predict.
        </>
      }
    >
      <Controls>
        <Slider label="sentence length T" value={T} min={3} max={SENT.length} step={1} onChange={setT} />
        <Readout
          items={[
            ['selected token', `"${toks[sel]}" (position ${sel + 1})`],
            ['1s in the mask', `BERT ${T}² = ${T * T} · GPT ${T}·${T + 1}/2 = ${(T * (T + 1)) / 2}`],
          ]}
        />
      </Controls>
      <div ref={ref} className={s.pair}>
        <div className={s.panel}>
          <div className={s.panelTitle}>
            <span>Encoder (BERT)</span>
            <span className={s.panelSub}>no causal mask: bidirectional</span>
          </div>
          {strip(false)}
          <MaskGrid toks={toks} causal={false} sel={sel} onSel={setSel} cell={cell} name="Encoder" />
          <p className={s.hint}>
            "{toks[sel]}" sees <b>{T}</b> of {T} tokens. Trained to fill in <b>[MASK]</b> positions using both sides.
          </p>
        </div>
        <div className={s.panel}>
          <div className={s.panelTitle}>
            <span>Decoder (GPT)</span>
            <span className={s.panelSub}>causal mask: left to right</span>
          </div>
          {strip(true)}
          <MaskGrid toks={toks} causal sel={sel} onSel={setSel} cell={cell} name="Decoder" />
          <p className={s.hint}>
            "{toks[sel]}" sees <b>{sel + 1}</b> of {T} tokens. Trained to predict the next token: <b>"{NEXT[sel]}"</b>.
          </p>
        </div>
      </div>
      <div className={s.units} role="list" aria-label="GPT inputs and their next-token targets">
        <div className={s.unit} role="listitem">
          <span className={s.cellOrig}>input</span>
          <span className={s.cellLab}>target</span>
        </div>
        {toks.map((t, j) => (
          <button
            key={j}
            type="button"
            role="listitem"
            className={`${s.unit} ${j === sel ? s.unitChosen : ''}`}
            onClick={() => setSel(j)}
            style={{ font: 'inherit', background: j === sel ? undefined : 'transparent', cursor: 'pointer' }}
            aria-label={`input ${t}, target ${NEXT[j]}`}
          >
            <span className={s.cellIn}>{t}</span>
            <span className={`${s.cellLab} ${j === sel ? s.cellLabOn : ''}`}>{NEXT[j]}</span>
          </button>
        ))}
      </div>
      <p className={s.hint}>
        The target row is the input shifted one place to the left, so one pass gives a prediction exercise at every position, all at once. A text of{' '}
        {T} tokens gives <b>{T - 1}</b>; here the last target, "{NEXT[T - 1]}", is borrowed from just past the window, so you see {T}.
      </p>
    </Figure>
  )
}
