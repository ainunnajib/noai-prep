import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Plot, Grid, Axes, Path, Dots, VLine, HLine, useContainerWidth } from '../../../../../kit'
import { LENGTHS, SIZES, ACC } from './s2sData'

/*
  Top: an encoder RNN squeezes n words into one context vector of d numbers, which a decoder RNN
  unpacks; with attention, each decoder step also looks back at every encoder state.
  Bottom: real results from small GRU encoder–decoders trained on a toy translation task
  (write out a sequence of 4–40 random words from a 20-word vocabulary): % of output words correct
  on new test sentences, against sentence length, with and without attention.
*/

type Size = (typeof SIZES)[number]

function Diagram({ n, d, attn }: { n: number; d: Size; attn: boolean }) {
  const [ref, measured] = useContainerWidth<HTMLDivElement>(600)
  const W = Math.max(300, Math.min(720, measured))
  const Hh = 160
  const rowY = 100
  const box = 15
  const ctxW = 26
  const ctxX = W / 2 - ctxW / 2
  const encL = 8
  const encR = ctxX - 16
  const decL = ctxX + ctxW + 16
  const decR = W - 8
  const slots = Math.max(5, Math.floor((encR - encL) / (box + 6)))
  // which word indices to draw: all of them, or the first few, a gap and the last few
  const shown = (count: number): (number | null)[] => {
    if (count <= slots) return Array.from({ length: count }, (_, i) => i)
    const a = Math.floor((slots - 1) / 2)
    const b = slots - 1 - a
    return [...Array.from({ length: a }, (_, i) => i), null, ...Array.from({ length: b }, (_, i) => count - b + i)]
  }
  const enc = shown(n)
  const dec = shown(n)
  const xAt = (k: number, len: number, left: number, right: number) => left + ((k + 0.5) * (right - left)) / len
  const cells = d / 8
  const cellH = 4.5
  const ctxH = cells * cellH
  const ctxTop = rowY - ctxH / 2
  const focus = dec.length - 1 // the decoder's last output step is the one shown attending
  const fx = xAt(focus, dec.length, decL, decR)
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${Hh}`} width="100%" role="img" aria-label={`Encoder reads ${n} words into a context vector of ${d} numbers; the decoder writes ${n} words${attn ? ', looking back at every encoder state' : ''}`} style={{ display: 'block' }}>
        <text x={(encL + encR) / 2} y={14} textAnchor="middle" className="plot-label" style={{ fontSize: 12.5 }}>
          encoder ({n} words in)
        </text>
        <text x={(decL + decR) / 2} y={14} textAnchor="middle" className="plot-label" style={{ fontSize: 12.5 }}>
          decoder ({n} words out)
        </text>
        {attn &&
          enc.map((k, j) =>
            k == null ? null : (
              <path
                key={`a${j}`}
                d={`M${fx},${rowY - box / 2 - 2} Q${(fx + xAt(j, enc.length, encL, encR)) / 2},${18} ${xAt(j, enc.length, encL, encR)},${rowY - box / 2 - 2}`}
                style={{ fill: 'none', stroke: 'var(--viz-3)', strokeWidth: 1.3, opacity: 0.55 }}
              />
            ),
          )}
        {/* encoder chain */}
        <line x1={encL} x2={ctxX - 4} y1={rowY} y2={rowY} style={{ stroke: 'var(--viz-muted)', strokeWidth: 1.5 }} />
        {enc.map((k, j) => {
          const x = xAt(j, enc.length, encL, encR)
          return k == null ? (
            <text key={`e${j}`} x={x} y={rowY + 4} textAnchor="middle" style={{ fontSize: 13, fill: 'var(--ink-2)', fontWeight: 800 }}>
              …
            </text>
          ) : (
            <rect key={`e${j}`} x={x - box / 2} y={rowY - box / 2} width={box} height={box} rx={3} style={{ fill: 'color-mix(in srgb, var(--viz-1) 30%, var(--surface))', stroke: 'var(--viz-1)', strokeWidth: 1.4 }} />
          )
        })}
        {/* the context vector */}
        <rect x={ctxX - 3} y={ctxTop - 3} width={ctxW + 6} height={ctxH + 6} rx={5} style={{ fill: 'none', stroke: 'var(--viz-2)', strokeWidth: 2 }} />
        {Array.from({ length: cells }, (_, c) => (
          <rect key={c} x={ctxX} y={ctxTop + c * cellH + 0.5} width={ctxW} height={cellH - 1} rx={1.5} style={{ fill: 'color-mix(in srgb, var(--viz-2) 55%, var(--surface))' }} />
        ))}
        <text x={W / 2} y={ctxTop + ctxH + 17} textAnchor="middle" className="plot-label" style={{ fontSize: 12, fill: 'var(--viz-2)' }}>
          context: {d} numbers
        </text>
        {/* decoder chain */}
        <line x1={ctxX + ctxW + 4} x2={decR} y1={rowY} y2={rowY} style={{ stroke: 'var(--viz-muted)', strokeWidth: 1.5 }} />
        {dec.map((k, j) => {
          const x = xAt(j, dec.length, decL, decR)
          return k == null ? (
            <text key={`d${j}`} x={x} y={rowY + 4} textAnchor="middle" style={{ fontSize: 13, fill: 'var(--ink-2)', fontWeight: 800 }}>
              …
            </text>
          ) : (
            <rect
              key={`d${j}`}
              x={x - box / 2}
              y={rowY - box / 2}
              width={box}
              height={box}
              rx={3}
              style={{ fill: 'color-mix(in srgb, var(--viz-3) 30%, var(--surface))', stroke: attn && j === focus ? 'var(--viz-ink)' : 'var(--viz-3)', strokeWidth: attn && j === focus ? 2.2 : 1.4 }}
            />
          )
        })}
      </svg>
    </div>
  )
}

export default function Seq2SeqBottleneck() {
  const [n, setN] = useState(30)
  const [d, setD] = useState<Size>(64)
  const [attn, setAttn] = useState(false)
  const idx = LENGTHS.indexOf(n)
  const plain = ACC[d].plain
  const withA = ACC[d].attn
  const pts = (arr: number[]) => LENGTHS.map((L, i) => [L, arr[i]] as [number, number])

  return (
    <Figure
      title="Squeezing a sentence through one vector"
      caption={
        <>
          Slide the sentence length: without attention, the share of correct output words falls as sentences get longer, because every extra word must be crammed into the same {d}{' '}
          numbers. A bigger context vector postpones the drop but does not remove it. Switch on attention: the decoder reads every encoder state directly and stays close to 100% (only the
          tiny 16-number model slips on long sentences). These are real results: one small GRU encoder–decoder trained for each setting.
        </>
      }
    >
      <Diagram n={n} d={d} attn={attn} />
      <p style={{ margin: 0, fontSize: 'var(--step--1)', color: 'var(--ink-2)', textAlign: 'center' }}>
        {attn ? 'With attention, every output step also looks back at every encoder state (green arcs).' : 'Everything the decoder knows about the input must pass through the context vector.'}
      </p>
      <Plot x={[4, 40]} y={[0, 100]} width={520} height={260} minHeight={240} margin={{ left: 44, top: 26 }} ariaLabel="Percentage of output words correct against sentence length, with and without attention">
        <Grid xTicks={9} yTicks={5} />
        <HLine y={5} color="var(--viz-muted)" label="guessing: 5%" />
        <VLine x={n} color="var(--viz-ink)" dash="4 4" width={1.2} />
        <Path points={pts(plain)} color="var(--viz-2)" width={2.6} />
        {attn && <Path points={pts(withA)} color="var(--viz-3)" width={2.6} />}
        <Dots points={[{ x: n, y: plain[idx], color: 'var(--viz-2)', r: 6 }, ...(attn ? [{ x: n, y: withA[idx], color: 'var(--viz-3)', r: 6, shape: 'square' as const }] : [])]} />
        <Axes xLabel="sentence length (words)" yLabel="% output words correct" xTicks={9} yTicks={5} />
      </Plot>
      <Controls>
        <Slider label="Sentence length" value={n} min={LENGTHS[0]} max={LENGTHS[LENGTHS.length - 1]} step={1} onChange={setN} format={(v) => `${v} words`} />
        <Segmented label="Context vector size" value={d} onChange={setD} options={SIZES.map((s) => ({ value: s, label: String(s) }))} />
        <Toggle label="Attention" checked={attn} onChange={setAttn} />
        <Readout
          items={[
            [<span style={{ color: 'var(--viz-2)' }}>no attention</span>, `${plain[idx].toFixed(0)}%`],
            [<span style={{ color: 'var(--viz-3)' }}>with attention</span>, attn ? `${withA[idx].toFixed(0)}%` : '(switch it on)'],
          ]}
        />
      </Controls>
    </Figure>
  )
}
