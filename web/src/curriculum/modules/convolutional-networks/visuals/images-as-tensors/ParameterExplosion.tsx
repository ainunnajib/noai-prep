import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, M, useContainerWidth } from '../../../../../kit'
import { fmtInt, fmtBig } from './pixels'

/*
  Parameter counter for the first layer. A dense layer connects every input number to every
  neuron: (C·H·W) × neurons weights + one bias per neuron. A convolutional layer with 64 small
  3×3 filters needs (3·3·C + 1) × 64 parameters, whatever the image size. Bars use a log scale
  (each gridline is 1,000× the previous one), otherwise the conv bar would be invisible.
*/

const SIZES = [28, 32, 64, 128, 224, 512]
const WIDTHS = [100, 256, 512, 1000, 2048, 4096]
const LOG_MAX = 12

function LogBars({ rows }: { rows: { label: string; value: number; color: string; text: string }[] }) {
  const [ref, w] = useContainerWidth<HTMLDivElement>(520)
  const W = Math.max(260, Math.min(620, w))
  const left = 4
  const right = 8
  const track = W - left - right
  const rowH = 46
  const top = 6
  const H = top + rows.length * rowH + 22
  const x = (v: number) => left + (Math.log10(Math.max(1, v)) / LOG_MAX) * track
  const ticks = [
    [0, '1'],
    [3, 'thousand'],
    [6, 'million'],
    [9, 'billion'],
    [12, 'trillion'],
  ] as const
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label={rows.map((r) => `${r.label}: ${r.text}`).join('; ')}>
        {ticks.map(([e, t]) => (
          <g key={e}>
            <line x1={x(10 ** e)} x2={x(10 ** e)} y1={top} y2={H - 18} style={{ stroke: 'var(--viz-grid)', strokeWidth: 1.2 }} />
            <text x={x(10 ** e)} y={H - 4} textAnchor={e === 0 ? 'start' : e === LOG_MAX ? 'end' : 'middle'} style={{ fontSize: 11, fill: 'var(--ink-3)' }}>
              {t}
            </text>
          </g>
        ))}
        {rows.map((r, i) => {
          const y = top + i * rowH
          const xe = x(r.value)
          const inside = xe > W * 0.62
          return (
            <g key={r.label}>
              <text x={left} y={y + 13} style={{ fontSize: 12.5, fontWeight: 700, fill: 'var(--ink-2)' }}>
                {r.label}
              </text>
              <rect x={left} y={y + 19} width={Math.max(2, xe - left)} height={18} rx={4} style={{ fill: r.color }} />
              <text
                x={inside ? xe - 6 : xe + 6}
                y={y + 32}
                textAnchor={inside ? 'end' : 'start'}
                style={{ fontSize: 12.5, fontWeight: 800, fill: inside ? 'var(--surface)' : 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}
              >
                {r.text}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function ParameterExplosion() {
  const [si, setSi] = useState(4)
  const [wi, setWi] = useState(3)
  const [C, setC] = useState<1 | 3>(3)
  const S = SIZES[si]
  const n = WIDTHS[wi]
  const inputs = C * S * S
  const dense = inputs * n + n
  const conv = (9 * C + 1) * 64
  const mb = (dense * 4) / 1e6

  return (
    <Figure
      title="How many weights does the first layer need?"
      caption={
        <>
          Slide the image size and the number of neurons. The dense layer needs one weight for <b>every pair</b> (input number, neuron), so its count is the
          product of the two and explodes. The convolutional layer reuses 64 small 3 × 3 filters at every position, so its count does not depend on the image
          size at all. The bars use a log scale: each gridline is 1,000 times the one before.
        </>
      }
    >
      <LogBars
        rows={[
          { label: `numbers in one ${C === 3 ? 'colour' : 'greyscale'} image`, value: inputs, color: 'var(--viz-muted)', text: fmtInt(inputs) },
          { label: `dense layer, ${fmtInt(n)} neurons`, value: dense, color: 'var(--viz-neg)', text: fmtBig(dense) },
          { label: 'conv layer, 64 filters of 3 × 3', value: conv, color: 'var(--viz-pos)', text: fmtInt(conv) },
        ]}
      />
      <Controls>
        <Slider label="image size (H = W)" value={si} min={0} max={SIZES.length - 1} onChange={setSi} format={(i) => `${SIZES[i]} × ${SIZES[i]}`} />
        <Slider label="neurons in the dense layer" value={wi} min={0} max={WIDTHS.length - 1} onChange={setWi} format={(i) => fmtInt(WIDTHS[i])} />
        <Segmented
          label="channels"
          value={C}
          onChange={setC}
          options={[
            { value: 1, label: '1 (grey)' },
            { value: 3, label: '3 (RGB)' },
          ]}
        />
      </Controls>
      <div style={{ width: '100%', fontSize: 'var(--step--1)', color: 'var(--ink-2)', lineHeight: 1.6 }}>
        Dense: <M>{`(${C} \\times ${S} \\times ${S}) \\times ${n} + ${n} = ${fmtInt(dense).replace(/,/g, '{,}')}`}</M>
        <br />
        Conv: <M>{`(3 \\times 3 \\times ${C} + 1) \\times 64 = ${fmtInt(conv).replace(/,/g, '{,}')}`}</M>
      </div>
      <Readout
        items={[
          ['dense ÷ conv', `${fmtInt(Math.round(dense / conv))} ×`],
          ['dense weights in memory (4 bytes each)', mb >= 1000 ? `${(mb / 1000).toFixed(1)} GB` : `${mb >= 10 ? mb.toFixed(0) : mb.toFixed(1)} MB`],
        ]}
      />
    </Figure>
  )
}
