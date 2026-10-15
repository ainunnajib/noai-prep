import { useState } from 'react'
import { Figure, Controls, Segmented, Toggle, Readout, M, useNarrow } from '../../../../../kit'
import { fmtInt, headColour, tint } from './mha'
import s from './mha.module.css'

/*
  Parameter count of a multi-head attention layer: four d_model × d_model weight matrices
  (W_Q, W_K, W_V, W_O) and four bias vectors of length d_model. Heads only SLICE these matrices
  (columns of W_Q, W_K, W_V; rows of W_O, drawn in the x @ W layout), so h never changes the total.
*/

const D_OPTIONS = [16, 64, 256, 512, 768, 1024]
const H_OPTIONS = [1, 2, 4, 8, 16]
const NAMES = ['W_Q', 'W_K', 'W_V', 'W_O']

function Square({ which, h, bias, pick, onPick }: { which: number; h: number; bias: boolean; pick: number; onPick: (i: number) => void }) {
  const isO = which === 3
  const S = 100
  const band = S / h
  return (
    <svg viewBox={`-2 -2 ${S + 4} ${S + 18}`} width="100%" role="img" aria-label={`${NAMES[which]}: a d_model by d_model grid cut into ${h} head slices`} style={{ display: 'block' }}>
      {Array.from({ length: h }, (_, i) => {
        const on = i === pick
        const col = headColour(i)
        const r = isO ? { x: 0, y: i * band, width: S, height: band } : { x: i * band, y: 0, width: band, height: S }
        return (
          <rect
            key={i}
            {...r}
            onClick={() => onPick(i)}
            onPointerEnter={(e) => e.pointerType === 'mouse' && onPick(i)}
            style={{ fill: tint(col, on ? 0.75 : 0.3), stroke: 'var(--surface)', strokeWidth: h > 8 ? 0.6 : 1.2, cursor: 'pointer' }}
          />
        )
      })}
      <rect x={0} y={0} width={S} height={S} style={{ fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 1.2 }} />
      {bias &&
        (isO ? (
          <rect x={0} y={S + 6} width={S} height={9} rx={2} style={{ fill: tint('var(--viz-ink)', 0.35) }} />
        ) : (
          Array.from({ length: h }, (_, i) => (
            <rect key={i} x={i * band} y={S + 6} width={band} height={9} style={{ fill: tint(headColour(i), i === pick ? 0.75 : 0.3), stroke: 'var(--surface)', strokeWidth: 0.6 }} />
          ))
        ))}
    </svg>
  )
}

export default function ParamCounter() {
  const [d, setD] = useState(512)
  const [h, setH] = useState(8)
  const [bias, setBias] = useState(true)
  const [pick, setPick] = useState(0)
  const [ref, narrow] = useNarrow<HTMLDivElement>(520)
  const dk = d / h
  const p = Math.min(pick, h - 1)
  const weights = 4 * d * d
  const biases = bias ? 4 * d : 0
  const total = weights + biases

  return (
    <Figure
      title="Count the parameters of a multi-head attention layer"
      caption={
        <>
          Each square is one d_model × d_model weight matrix (drawn as input rows × output columns, the <M>{'x\\,W'}</M> layout), with its bias
          strip underneath. Change the number of heads: the squares are only <b>sliced</b> into more, thinner pieces, so the total never moves. Change
          d_model: doubling it multiplies the weights by four. Tap a slice to see one head's share.
        </>
      }
    >
      <Controls>
        <Segmented label="d_model" value={d} onChange={setD} options={D_OPTIONS.map((v) => ({ value: v, label: String(v) }))} />
        <Segmented label="heads h" value={h} onChange={(v) => { setH(v); setPick(0) }} options={H_OPTIONS.map((v) => ({ value: v, label: String(v) }))} />
        <Toggle label="include biases" checked={bias} onChange={setBias} />
      </Controls>

      <div ref={ref} className={`${s.mats} ${narrow ? s.matsNarrow : ''}`}>
        {NAMES.map((n, w) => (
          <div key={n} className={s.wCard}>
            <Square which={w} h={h} bias={bias} pick={p} onPick={setPick} />
            <span className={s.wName}>
              <M>{`W_${n[2]}`}</M>
            </span>
            <span>
              {d} × {d}
              {bias ? ` + ${d}` : ''}
            </span>
          </div>
        ))}
      </div>

      <div className={s.sum}>
        <span>weights: 4 × {d}²</span>
        <b>{fmtInt(weights)}</b>
        <span>biases: 4 × {d}</span>
        <b>{bias ? fmtInt(biases) : '0'}</b>
        <span className={s.sumTotal}>total</span>
        <b className={s.sumTotal}>{fmtInt(total)}</b>
      </div>

      <Readout
        items={[
          ['d_k = d_model / h', `${d} / ${h} = ${dk}`],
          [`head ${p + 1}'s slice of W_Q`, `${d} × ${dk} = ${fmtInt(d * dk)}`],
          ['total with h = 1', fmtInt(total)],
        ]}
      />
    </Figure>
  )
}
