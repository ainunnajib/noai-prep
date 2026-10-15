import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Bars, useContainerWidth } from '../../../../../kit'
import { CLS_DATA } from './clsData'

/*
  [CLS] in a real fine-tuned BERT. Thirteen rows of dots: the embeddings and the 12 encoder layers, one dot per token.
  The [CLS] column is highlighted all the way up; its top vector goes through the pooler and a linear head to the
  sentiment probabilities. Choosing a layer draws [CLS]'s attention to every token in the layer below (real weights,
  averaged over 12 heads). The freeze toggle switches between full fine-tuning and training only the linear head.
*/

const BERT_PARAMS = 109_482_240 // encoder + embeddings + pooler of bert-base-uncased
const fmt = (n: number) => n.toLocaleString('en-GB')
const SHORT = ['amazing', 'queue', 'not bad', 'shiok'] // labels for narrow screens, in CLS_DATA order
const ORANGE_TEXT = 'color-mix(in srgb, var(--viz-2) 70%, var(--ink))' // orange that passes contrast as text

export default function CLSHead() {
  const [ex, setEx] = useState(0)
  const [layer, setLayer] = useState(12)
  const [frozen, setFrozen] = useState(false)
  const [wrapRef, measured] = useContainerWidth<HTMLDivElement>(560)
  const d = CLS_DATA[ex]
  const n = d.tokens.length
  const head = 2 * 768 + 2
  const trainable = frozen ? head : BERT_PARAMS + head

  const W = Math.max(300, Math.min(640, measured))
  const narrow = W < 460
  const gutter = narrow ? 44 : 64
  const colW = (W - gutter - 10) / n
  const rh = narrow ? 14 : 16
  const GAP = narrow ? 64 : 76 // extra space under the chosen layer, so the attention lines fan out
  const headH = 134
  const top = headH + 16
  const x = (j: number) => gutter + (j + 0.5) * colW
  const y = (lvl: number) => top + (12 - lvl) * rh + (lvl < layer ? GAP : 0)
  const encTop = y(12) - rh / 2 - 4
  const encBot = y(0) + rh / 2 + 4
  const labY = encBot + 16
  const H = labY + (narrow ? 26 : 12)
  const r = narrow ? 4 : 5
  const w = d.att[layer - 1]
  const wMax = Math.max(...w)
  const top3 = [...w].sort((p, q) => q - p)[Math.min(2, w.length - 1)] // on phones, only the 3 largest weights get a number
  const clsX = x(0)
  const boxW = Math.min(210, W - clsX + 6)
  const encFill = frozen ? 'var(--surface-2)' : 'color-mix(in srgb, var(--viz-1) 9%, var(--surface))'
  const encStroke = frozen ? 'var(--viz-muted)' : 'var(--viz-1)'

  return (
    <Figure
      wide
      title="The [CLS] token: one vector that sums up the sentence"
      caption={
        <>
          Pick a layer: the orange lines show how much [CLS] attends to each token below. Notice that middle layers park most of it on
          [SEP] ("nothing to read here"), while layer 12 spreads it over the words. Then try "shiok" and freeze the encoder.
        </>
      }
    >
      <Controls>
        <Segmented
          label="sentence"
          value={ex}
          onChange={setEx}
          options={CLS_DATA.map((c, i) => ({ value: i, label: narrow ? SHORT[i] : c.text.replace(/^the /, '…') }))}
        />
      </Controls>
      {narrow && <p style={{ margin: '0 0 0.3rem', fontSize: '0.9rem', color: 'var(--ink-2)' }}>"{d.text}"</p>}
      <div ref={wrapRef} className="plot-wrap" style={{ maxWidth: 640 }}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`BERT layers for "${d.text}" with the [CLS] attention in layer ${layer}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* encoder box */}
          <rect x={gutter - 4} y={encTop} width={W - gutter - 2} height={encBot - encTop} rx={10} style={{ fill: encFill, stroke: encStroke, strokeWidth: 1.2, strokeDasharray: frozen ? '5 4' : undefined }} />
          <text x={W - 8} y={encTop - 7} textAnchor="end" style={{ fill: encStroke, fontSize: 12, fontWeight: 700 }}>
            {frozen ? 'BERT encoder: frozen' : 'BERT encoder: trainable'}
          </text>

          {/* chosen layer and the layer it reads from */}
          <rect x={gutter - 2} y={y(layer) - rh / 2} width={W - gutter - 6} height={rh} rx={4} style={{ fill: 'color-mix(in srgb, var(--viz-2) 18%, transparent)' }} />
          <rect x={gutter - 2} y={y(layer - 1) - rh / 2} width={W - gutter - 6} height={rh} rx={4} style={{ fill: 'color-mix(in srgb, var(--viz-2) 8%, transparent)' }} />

          {/* row labels + click targets */}
          {Array.from({ length: 13 }, (_, lvl) => (
            <g key={`row${lvl}`}>
              <text x={gutter - 10} y={y(lvl)} dy="0.35em" textAnchor="end" style={{ fill: lvl === layer ? ORANGE_TEXT : 'var(--ink-3)', fontSize: 11, fontWeight: lvl === layer ? 800 : 600 }}>
                {lvl === 0 ? (narrow ? 'emb' : 'embed') : narrow ? `L${lvl}` : `layer ${lvl}`}
              </text>
              {lvl > 0 && <rect x={0} y={y(lvl) - rh / 2} width={W} height={rh} style={{ fill: 'transparent', cursor: 'pointer' }} onClick={() => setLayer(lvl)} />}
            </g>
          ))}

          {/* attention lines from [CLS] at the chosen layer to all tokens one layer down */}
          {w.map((a, j) => (
            <line
              key={`a${j}`}
              x1={clsX}
              y1={y(layer)}
              x2={x(j)}
              y2={y(layer - 1)}
              style={{ stroke: 'var(--viz-2)', strokeWidth: 0.8 + 7 * (a / wMax), opacity: 0.35 + 0.65 * (a / wMax), pointerEvents: 'none' }}
              strokeLinecap="round"
            />
          ))}

          {/* dots */}
          {Array.from({ length: 13 }, (_, lvl) =>
            d.tokens.map((_, j) => {
              const isCls = j === 0
              return (
                <circle
                  key={`n${lvl}-${j}`}
                  cx={x(j)}
                  cy={y(lvl)}
                  r={isCls ? r + 1 : r}
                  style={{
                    fill: isCls ? 'var(--accent)' : 'var(--surface)',
                    stroke: isCls ? 'var(--accent)' : lvl === layer - 1 ? 'var(--viz-2)' : 'var(--viz-muted)',
                    strokeWidth: 1.4,
                    pointerEvents: 'none',
                  }}
                />
              )
            }),
          )}

          {/* attention weights, just above the tokens they land on */}
          {w.map((a, j) =>
            narrow && a < top3 ? null : (
              <text
                key={`w${j}`}
                x={x(j)}
                y={y(layer - 1) - r - 7}
                textAnchor="middle"
                style={{ fill: ORANGE_TEXT, fontSize: 11, fontWeight: 800, stroke: 'var(--surface)', strokeWidth: 4, paintOrder: 'stroke', pointerEvents: 'none' }}
              >
                {a.toFixed(2)}
              </text>
            ),
          )}
          <text x={W - 8} y={y(layer) + rh / 2 + 13} textAnchor="end" style={{ fill: ORANGE_TEXT, fontSize: 11, fontWeight: 700, stroke: 'var(--surface)', strokeWidth: 3, paintOrder: 'stroke' }}>
            {narrow ? `[CLS] attention, layer ${layer}` : `how much [CLS] in layer ${layer} attends to each token below`}
          </text>

          {/* token labels */}
          {d.tokens.map((t, j) => (
            <text
              key={`l${j}`}
              x={x(j)}
              y={labY + (narrow && j % 2 === 1 ? 13 : 0)}
              textAnchor="middle"
              style={{ fill: j === 0 ? 'var(--accent)' : 'var(--ink)', fontSize: narrow ? 11 : 12.5, fontWeight: j === 0 ? 800 : 600 }}
            >
              {t}
            </text>
          ))}

          {/* head: pooler + linear */}
          <line x1={clsX} y1={y(12) - r - 2} x2={clsX} y2={86} style={{ stroke: 'var(--accent)', strokeWidth: 2.5 }} />
          <text x={clsX + 8} y={108} style={{ fill: 'var(--ink-3)', fontSize: 11, fontWeight: 600 }}>
            [CLS] vector: 768 numbers
          </text>
          <rect x={clsX - 14} y={56} width={boxW} height={30} rx={7} style={{ fill: frozen ? 'var(--surface-2)' : 'color-mix(in srgb, var(--viz-1) 12%, var(--surface))', stroke: encStroke, strokeWidth: 1.2, strokeDasharray: frozen ? '5 4' : undefined }} />
          <text x={clsX - 4} y={71} dy="0.35em" style={{ fill: 'var(--ink)', fontSize: 12, fontWeight: 650 }}>
            pooler: 768→768, tanh{frozen ? ' (frozen)' : ''}
          </text>
          <line x1={clsX} y1={56} x2={clsX} y2={42} style={{ stroke: 'var(--accent)', strokeWidth: 2.5 }} />
          <rect x={clsX - 14} y={10} width={boxW} height={32} rx={7} style={{ fill: 'color-mix(in srgb, var(--viz-3) 16%, var(--surface))', stroke: 'var(--viz-3)', strokeWidth: 1.8 }} />
          <text x={clsX - 4} y={26} dy="0.35em" style={{ fill: 'var(--ink)', fontSize: 12, fontWeight: 750 }}>
            linear head: 768→2 (trainable)
          </text>
        </svg>
      </div>

      <div style={{ width: '100%', maxWidth: 520 }}>
        <Bars
          ariaLabel="Sentiment probabilities"
          max={1}
          format={(v) => v.toFixed(4)}
          data={[
            { label: 'positive', value: d.pPos, color: 'var(--viz-3)', strong: d.pPos > d.pNeg },
            { label: 'negative', value: d.pNeg, color: 'var(--viz-4)', strong: d.pNeg > d.pPos },
          ]}
        />
      </div>

      <Controls>
        <Slider label="show [CLS] attention in layer" value={layer} min={1} max={12} step={1} onChange={setLayer} />
        <Toggle label="freeze the encoder (train only the linear head)" checked={frozen} onChange={setFrozen} />
        <Readout
          items={[
            ['trainable parameters', fmt(trainable)],
            ['share of the model', `${((100 * trainable) / (BERT_PARAMS + head)).toFixed(frozen ? 4 : 0)}%`],
          ]}
        />
      </Controls>
    </Figure>
  )
}
