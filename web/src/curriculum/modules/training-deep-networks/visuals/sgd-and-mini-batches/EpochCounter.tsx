import { useId, useState } from 'react'
import { Figure, Controls, Slider, Toggle, M, useContainerWidth } from '../../../../../kit'

/*
  A training set of N examples drawn as a strip, cut into batches of size B (alternating shades).
  One row per epoch, numbered with the global iteration count. The last, smaller batch is orange;
  with drop_last it is skipped. Counters: iterations per epoch = ⌈N/B⌉ (or ⌊N/B⌋), total iterations.
*/

const MAX_ROWS = 4
const ROW_H = 24
const ROW_GAP = 30
const LEFT = 64
const RIGHT = 8
const TOP = 6

const fmt = (n: number) => n.toLocaleString('en-GB')

export default function EpochCounter() {
  const [n, setN] = useState(1000)
  const [b, setB] = useState(32)
  const [epochs, setEpochs] = useState(3)
  const [dropLast, setDropLast] = useState(false)
  const [ref, measured] = useContainerWidth<HTMLDivElement>(560)
  const pid = useId().replace(/:/g, '')

  const full = Math.floor(n / b)
  const rem = n - full * b
  const perEpoch = dropLast ? full : Math.ceil(n / b)
  const total = perEpoch * epochs
  const width = Math.max(260, Math.min(680, measured))
  const inner = width - LEFT - RIGHT
  const u = inner / n
  // the leftover batch is drawn at least 8 px wide so it stays visible (8 of 1,000 examples would be ~3 px)
  const remW = rem > 0 ? Math.min(inner, Math.max(rem * u, 8)) : 0
  const segW = full > 0 ? (inner - remW) / full : b * u
  const rows = Math.min(epochs, MAX_ROWS)
  const height = TOP + rows * (ROW_H + ROW_GAP) + (epochs > MAX_ROWS ? 18 : 0)
  const labelEach = segW >= 26 && perEpoch <= 60

  const exact = n / b
  const exactStr = Number.isInteger(exact) ? String(exact) : exact.toFixed(exact * 100 === Math.round(exact * 100) ? 2 : 3)

  return (
    <Figure
      title="Counting iterations: cut the data into batches"
      caption={
        <>
          The strip is the whole training set; each shaded block is one batch, so each block is one <b>iteration</b> (one update of the
          weights). A full row is one <b>epoch</b>. Start with 1,000 examples and batch size 32: 31 full batches use 992 examples and the
          8 left over form a smaller last batch (orange), so an epoch has 32 iterations. Switch on <b>drop_last</b> to skip that small batch.
          Then try a batch size that divides the data exactly, such as 25 or 40.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={`${n} examples in batches of ${b}: ${perEpoch} iterations per epoch, ${total} in ${epochs} epochs`} style={{ display: 'block', overflow: 'visible' }}>
          <defs>
            <pattern id={`stripes-${pid}`} patternUnits="userSpaceOnUse" x={LEFT} y={0} width={2 * segW} height={ROW_H}>
              <rect x={0} y={0} width={segW} height={ROW_H} style={{ fill: 'color-mix(in srgb, var(--viz-1) 62%, var(--surface))' }} />
              <rect x={segW} y={0} width={segW} height={ROW_H} style={{ fill: 'color-mix(in srgb, var(--viz-1) 30%, var(--surface))' }} />
            </pattern>
          </defs>
          {Array.from({ length: rows }, (_, e) => {
            const y = TOP + e * (ROW_H + ROW_GAP)
            const first = e * perEpoch + 1
            const last = (e + 1) * perEpoch
            return (
              <g key={e}>
                <text x={LEFT - 8} y={y + ROW_H / 2} dy="0.35em" textAnchor="end" style={{ fill: 'var(--ink-2)', fontSize: 12.5, fontWeight: 700 }}>
                  epoch {e + 1}
                </text>
                {full > 0 && <rect x={LEFT} y={y} width={full * segW} height={ROW_H} rx={3} style={{ fill: segW < 1.5 ? 'color-mix(in srgb, var(--viz-1) 46%, var(--surface))' : `url(#stripes-${pid})` }} />}
                {rem > 0 && (
                  <rect
                    x={LEFT + full * segW}
                    y={y}
                    width={remW}
                    height={ROW_H}
                    rx={3}
                    style={dropLast ? { fill: 'transparent', stroke: 'var(--viz-muted)', strokeDasharray: '3 3', strokeWidth: 1.5 } : { fill: 'var(--viz-2)' }}
                  />
                )}
                {labelEach &&
                  Array.from({ length: full }, (_, k) => (
                    <text key={k} x={LEFT + (k + 0.5) * segW} y={y + ROW_H / 2} dy="0.35em" textAnchor="middle" style={{ fill: 'var(--viz-ink)', fontSize: 11, fontWeight: 600 }}>
                      {e * perEpoch + k + 1}
                    </text>
                  ))}
                <text x={LEFT} y={y + ROW_H + 15} style={{ fill: 'var(--ink-3)', fontSize: 12 }}>
                  {perEpoch === 0
                    ? `no iterations: all ${fmt(n)} examples fit in one batch smaller than ${b}, and it is dropped`
                    : `iterations ${fmt(first)}–${fmt(last)}${rem > 0 ? (dropLast ? `, last ${rem} examples skipped` : `, last batch has ${rem}`) : ''}`}
                </text>
              </g>
            )
          })}
          {epochs > MAX_ROWS && (
            <text x={LEFT} y={height - 4} style={{ fill: 'var(--ink-3)', fontSize: 12 }}>
              … and {epochs - MAX_ROWS} more epoch{epochs - MAX_ROWS > 1 ? 's' : ''}, each reshuffled
            </text>
          )}
        </svg>
      </div>
      <div style={{ width: '100%', display: 'grid', gap: '0.35rem', fontSize: 'var(--step-0)' }}>
        <div>
          iterations per epoch{' '}
          {dropLast ? (
            <M>{`= \\left\\lfloor \\tfrac{${n}}{${b}} \\right\\rfloor = \\lfloor ${exactStr} \\rfloor = ${perEpoch}`}</M>
          ) : (
            <M>{`= \\left\\lceil \\tfrac{${n}}{${b}} \\right\\rceil = \\lceil ${exactStr} \\rceil = ${perEpoch}`}</M>
          )}
        </div>
        <div>
          total iterations <M>{`= ${perEpoch} \\times ${epochs} = ${total}`}</M>
          <span style={{ color: 'var(--ink-3)' }}> (weight updates)</span>
        </div>
        <div style={{ color: 'var(--ink-2)', fontSize: 'var(--step--1)' }}>
          PyTorch: <code>{`DataLoader(train_set, batch_size=${b}, shuffle=True, drop_last=${dropLast ? 'True' : 'False'})`}</code> gives{' '}
          <code>{`len(loader) == ${perEpoch}`}</code>
        </div>
      </div>
      <Controls>
        <Slider label="training examples N" value={n} min={10} max={2000} step={10} onChange={setN} format={fmt} />
        <Slider label="batch size B" value={b} min={1} max={256} step={1} onChange={setB} />
        <Slider label="epochs" value={epochs} min={1} max={10} step={1} onChange={setEpochs} />
      </Controls>
      <Controls>
        <Toggle label="drop_last (skip the smaller final batch)" checked={dropLast} onChange={setDropLast} />
      </Controls>
    </Figure>
  )
}
