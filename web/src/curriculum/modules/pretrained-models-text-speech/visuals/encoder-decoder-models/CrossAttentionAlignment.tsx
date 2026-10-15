import { useState } from 'react'
import { Figure, Controls, Segmented, Readout, useContainerWidth, useNarrow } from '../../../../../kit'
import { EXAMPLES, weights } from './align'
import s from './ed.module.css'

/*
  Cross-attention as a soft alignment. Top row: the encoder's outputs for the source sentence (keys and values).
  Bottom row: the decoder's output words (queries). Clicking an output word draws its attention to every source
  word (line width = weight) and highlights its row in the heat map below.
*/

// Weights up to 0.5 get light cells (dark text), larger ones dark cells (light text). The jump skips the middle shades,
// where neither text colour reaches 4.5:1 contrast in both themes.
const heatPct = (v: number) => (v <= 0.5 ? Math.round(6 + v * 98) : Math.round(80 + (v - 0.5) * 32))
const heatBg = (v: number) => `color-mix(in srgb, var(--viz-1) ${heatPct(v)}%, var(--surface))`
const SHORT = ['EN → MS', 'order flips', 'EN → ZH'] // segmented labels for narrow screens, in EXAMPLES order
const ORANGE_TEXT = 'color-mix(in srgb, var(--viz-2) 70%, var(--ink))'

export default function CrossAttentionAlignment() {
  const [k, setK] = useState(0)
  const [selRaw, setSel] = useState(2)
  const [wrapRef, measured] = useContainerWidth<HTMLDivElement>(600)
  const [gridRef, narrow] = useNarrow<HTMLDivElement>(480)
  const ex = EXAMPLES[k]
  const W8 = weights(ex)
  const sel = Math.min(selRaw, ex.target.length - 1)
  const row = W8[sel]
  const best = row.indexOf(Math.max(...row))

  const W = Math.max(280, Math.min(700, measured))
  const pad = 12
  const fs = W < 420 ? 12 : 14
  const spS = (W - 2 * pad) / ex.source.length
  const spT = (W - 2 * pad) / ex.target.length
  const textW = (w: string) => w.length * fs * (/[\u4e00-\u9fff]/.test(w) ? 1.05 : 0.58)
  const stS = Math.max(...ex.source.map(textW)) > spS - 6 // stagger labels that would collide
  const stT = Math.max(...ex.target.map(textW)) > spT - 10
  const ySrc = stS ? 48 : 36
  const lineTop = ySrc + 34
  const yTgt = lineTop + 92
  const yT = (i: number) => yTgt + (stT && i % 2 === 1 ? 20 : 0)
  const H = yTgt + (stT ? 20 : 0) + 34
  const sx = (j: number) => pad + (j + 0.5) * spS
  const tx = (i: number) => pad + (i + 0.5) * spT
  const cell = narrow ? (ex.source.length > 6 ? 34 : 40) : 46

  return (
    <Figure
      wide
      title="Cross-attention: each output word looks back at the input"
      caption={
        <>
          Click an output word: the orange lines and its heat-map row show how much it draws from each input word. Switch examples and
          notice how word-order differences between languages show up as off-diagonal patterns.
        </>
      }
    >
      <Controls>
        <Segmented label="example" value={k} onChange={(v) => setK(v)} options={EXAMPLES.map((e, i) => ({ value: i, label: narrow ? SHORT[i] : e.label }))} />
      </Controls>
      {narrow && <p className={s.hint} style={{ margin: 0 }}>{ex.label}</p>}

      <div ref={wrapRef} className="plot-wrap" style={{ maxWidth: 700 }}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Attention from "${ex.target[sel]}" to the ${ex.from} words`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          <text x={pad} y={12} style={{ fill: 'var(--ink-3)', fontSize: 11, fontWeight: 700 }}>
            encoder outputs ({ex.from}): keys and values
          </text>
          <text x={pad} y={H - 4} style={{ fill: 'var(--ink-3)', fontSize: 11, fontWeight: 700 }}>
            decoder ({ex.to}): queries. Click a word.
          </text>
          {row.map((v, j) => (
            <line
              key={`l${j}`}
              x1={tx(sel)}
              y1={yT(sel) - 18}
              x2={sx(j)}
              y2={lineTop}
              style={{ stroke: 'var(--viz-2)', strokeWidth: 0.6 + 9 * v, opacity: 0.25 + 0.75 * v }}
              strokeLinecap="round"
            />
          ))}
          {ex.source.map((w, j) => (
            <g key={`s${j}`}>
              <text x={sx(j)} y={ySrc - (stS && j % 2 === 1 ? 15 : 0)} textAnchor="middle" style={{ fill: j === best ? ORANGE_TEXT : 'var(--ink)', fontSize: fs, fontWeight: j === best ? 800 : 600 }}>
                {w}
              </text>
              <text x={sx(j)} y={ySrc + 20} textAnchor="middle" style={{ fill: ORANGE_TEXT, fontSize: 11, fontWeight: 700, stroke: 'var(--surface)', strokeWidth: 3, paintOrder: 'stroke' }}>
                {row[j].toFixed(2)}
              </text>
            </g>
          ))}
          {ex.target.map((w, i) => (
            <g key={`t${i}`} style={{ cursor: 'pointer' }} onClick={() => setSel(i)} role="button" aria-label={`select ${w}`}>
              <rect x={tx(i) - Math.min(spT * (stT ? 2 : 1) - 4, textW(w) + 16) / 2} y={yT(i) - 17} width={Math.min(spT * (stT ? 2 : 1) - 4, textW(w) + 16)} height={26} rx={7} style={{ fill: i === sel ? 'color-mix(in srgb, var(--viz-2) 22%, var(--surface))' : 'transparent', stroke: i === sel ? 'var(--viz-2)' : 'transparent', strokeWidth: 1.5 }} />
              <text x={tx(i)} y={yT(i) + 1} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: fs, fontWeight: i === sel ? 800 : 600 }}>
                {w}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div ref={gridRef} style={{ width: '100%', display: 'grid', justifyItems: 'center', gap: '0.3rem' }}>
        <div className={s.axisNote}>columns: {ex.from} input words (keys)</div>
        <div className={s.heat} style={{ gridTemplateColumns: `minmax(2.5rem, max-content) repeat(${ex.source.length}, ${cell}px)` }} role="grid" aria-label="Cross-attention weights">
          <span />
          {ex.source.map((w, j) => (
            <span key={`c${j}`} className={s.hColLab} style={{ width: cell }} title={w}>
              {w}
            </span>
          ))}
          {ex.target.map((w, i) => (
            <Row key={`r${i}`} i={i} label={w} values={W8[i]} sel={sel} onSel={setSel} cell={cell} />
          ))}
        </div>
        <div className={s.axisNote}>rows: {ex.to} output words (queries) · each row sums to 1</div>
      </div>

      <Readout
        items={[
          ['output word', ex.target[sel]],
          ['looks mostly at', `"${ex.source[best]}" (${row[best].toFixed(2)})`],
          ['weight matrix shape', `${ex.target.length} × ${ex.source.length}`],
        ]}
      />
      <p className={s.hint}>
        {ex.note} <span style={{ color: 'var(--ink-3)' }}>(Weights are illustrative, shaped like those of a trained translation model.)</span>
      </p>
    </Figure>
  )
}

function Row({ i, label, values, sel, onSel, cell }: { i: number; label: string; values: number[]; sel: number; onSel: (i: number) => void; cell: number }) {
  return (
    <>
      <button type="button" className={`${s.hRowLab} ${i === sel ? s.hRowOn : ''}`} onClick={() => onSel(i)} aria-pressed={i === sel}>
        {label}
      </button>
      {values.map((v, j) => (
        <button
          key={j}
          type="button"
          className={`${s.hCell} ${i === sel ? s.hCellRow : ''}`}
          style={{ height: Math.round(cell * 0.72), background: heatBg(v), color: v > 0.5 ? 'var(--surface)' : 'var(--ink)' }}
          onClick={() => onSel(i)}
          aria-label={`${label} to column ${j + 1}: ${v.toFixed(2)}`}
        >
          {v.toFixed(2).replace(/^0/, '')}
        </button>
      ))}
    </>
  )
}
