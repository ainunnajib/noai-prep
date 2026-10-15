import { useState, type ReactElement } from 'react'
import { Figure, Controls, Button, Segmented, Slider, useContainerWidth, M } from '../../../../../kit'
import { outLen } from './common'

/*
  Side view of a stack of layers over one row of input pixels (no padding, so each layer is a
  little shorter). Every neuron is drawn above the centre of the input pixels it can see, so the
  "cone" under a neuron is exactly its receptive field. Click any neuron to see its cone, or pick
  one with the layer and position controls (stride-1 rows are too dense to tap precisely on a phone).
  Receptive field: r_l = r_{l-1} + (k_l - 1) j_{l-1}, jump: j_l = j_{l-1} s_l (r_0 = j_0 = 1).
*/

type LayerType = 'c3' | 'c5' | 'c3s2' | 'p2'
const SPEC: Record<LayerType, { k: number; s: number; name: string; short: string }> = {
  c3: { k: 3, s: 1, name: '3×3 conv', short: 'conv 3×3' },
  c5: { k: 5, s: 1, name: '5×5 conv', short: 'conv 5×5' },
  c3s2: { k: 3, s: 2, name: '3×3 conv, stride 2', short: 'conv 3×3 s2' },
  p2: { k: 2, s: 2, name: '2×2 max-pool', short: 'pool 2×2 s2' },
}
const N = 21
const MAX_LAYERS = 4
const DEFAULT: LayerType[] = ['c3', 'c3', 'c3']

interface Geo {
  len: number // neurons in this layer
  r: number // receptive field (input pixels)
  j: number // jump: input pixels between neighbouring neurons
  k: number
  s: number
}

function geometry(layers: LayerType[]): Geo[] {
  const g: Geo[] = [{ len: N, r: 1, j: 1, k: 1, s: 1 }]
  for (const t of layers) {
    const { k, s } = SPEC[t]
    const prev = g[g.length - 1]
    g.push({ len: outLen(prev.len, k, s), r: prev.r + (k - 1) * prev.j, j: prev.j * s, k, s })
  }
  return g
}

export default function ReceptiveFieldTower() {
  const [layers, setLayers] = useState<LayerType[]>(DEFAULT)
  const geo = geometry(layers)
  const top = geo.length - 1
  const [sel, setSel] = useState<[number, number]>([top, Math.floor((geo[top].len - 1) / 2)])
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(600)

  const update = (next: LayerType[]) => {
    const g = geometry(next)
    const t = g.length - 1
    setLayers(next)
    setSel([t, Math.floor((g[t].len - 1) / 2)])
  }
  const canAdd = (t: LayerType) => layers.length < MAX_LAYERS && outLen(geo[top].len, SPEC[t].k, SPEC[t].s) >= 1

  // cone: range of neurons in each layer that feed the selected neuron
  const [sl, si] = sel[0] <= top && sel[1] < geo[Math.min(sel[0], top)].len ? sel : [top, 0]
  const ranges: [number, number][] = Array(geo.length).fill([-1, -2])
  ranges[sl] = [si, si]
  for (let l = sl; l >= 1; l--) {
    const [lo, hi] = ranges[l]
    ranges[l - 1] = [lo * geo[l].s, hi * geo[l].s + geo[l].k - 1]
  }
  const rf = geo[sl].r
  const rfStart = si * geo[sl].j

  // moving to another layer keeps the selection above (roughly) the same input pixels
  const centre = (l: number, i: number) => i * geo[l].j + (geo[l].r - 1) / 2
  const pickLayer = (l: number) => {
    const i = Math.round((centre(sl, si) - (geo[l].r - 1) / 2) / geo[l].j)
    setSel([l, Math.max(0, Math.min(geo[l].len - 1, i))])
  }

  // layout
  const padX = 10
  const unit = (Math.min(width, 640) - 2 * padX) / N
  const svgW = N * unit + 2 * padX
  const rowGap = 60
  const labelH = 18
  const svgH = labelH + top * rowGap + 46
  const yOf = (l: number) => labelH + (top - l) * rowGap + 8
  const xOf = (l: number, i: number) => padX + (i * geo[l].j + (geo[l].r - 1) / 2 + 0.5) * unit
  const rad = Math.max(3.5, Math.min(7, unit * 0.32))
  const inCone = (l: number, i: number) => i >= ranges[l][0] && i <= ranges[l][1]

  const edges: ReactElement[] = []
  for (let l = sl; l >= 1; l--) {
    for (let i = ranges[l][0]; i <= ranges[l][1]; i++) {
      for (let q = 0; q < geo[l].k; q++) {
        const c = i * geo[l].s + q
        edges.push(<line key={`e${l}-${i}-${q}`} x1={xOf(l, i)} y1={yOf(l)} x2={xOf(l - 1, c)} y2={yOf(l - 1)} style={{ stroke: 'var(--viz-2)', strokeWidth: 1.3, opacity: 0.55 }} />)
      }
    }
  }

  // 2-D footprint
  const fp = Math.max(5, Math.min(9, Math.floor((Math.min(width, 320) - 8) / N)))

  return (
    <Figure
      title="Receptive field: how much of the image can one neuron see?"
      caption={
        <>
          <b>Try:</b> tap any neuron (or pick one with the layer and position controls) to see its orange cone of inputs, then add a pool or a stride-2
          conv. <b>Notice:</b> three 3×3 convs see 7 pixels; after
          a pool or stride, every later layer's view grows twice as fast.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} width={svgW} height={svgH} style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }} role="img" aria-label={`Stack of ${layers.length} layers; the selected neuron in layer ${sl} has a receptive field of ${rf} input pixels`}>
          {/* receptive-field band on the input row */}
          <rect x={padX + rfStart * unit} y={yOf(0) - rad - 5} width={rf * unit} height={2 * rad + 10} rx={6} style={{ fill: 'color-mix(in srgb, var(--viz-2) 18%, transparent)', stroke: 'var(--viz-2)', strokeWidth: 1.5 }} />
          {edges}
          {geo.map((g, l) => (
            <g key={`l${l}`}>
              <text x={padX} y={yOf(l) - rad - 8} className="plot-label" style={{ fontSize: 12, fill: 'var(--ink-2)' }}>
                {l === 0 ? 'input pixels' : `layer ${l}: ${SPEC[layers[l - 1]].short}`}
              </text>
              {Array.from({ length: g.len }, (_, i) => {
                const on = inCone(l, i)
                const isSel = l === sl && i === si
                const cx = xOf(l, i)
                return (
                  <g key={i} onClick={() => setSel([l, i])} style={{ cursor: 'pointer' }}>
                    {/* tap target: the whole gap to the neighbouring neurons, so a tap anywhere on the row picks the nearest one */}
                    <rect x={cx - (g.j * unit) / 2} y={yOf(l) - 20} width={g.j * unit} height={40} style={{ fill: 'transparent' }} />
                    {l === 0 ? (
                      <rect x={cx - rad} y={yOf(l) - rad} width={2 * rad} height={2 * rad} rx={2} style={{ fill: on ? 'var(--viz-2)' : 'var(--surface-3)', stroke: on ? 'var(--viz-2)' : 'var(--viz-muted)', strokeWidth: 1 }} />
                    ) : (
                      <circle cx={cx} cy={yOf(l)} r={isSel ? rad + 2 : rad} style={{ fill: isSel ? 'var(--viz-4)' : on ? 'var(--viz-2)' : 'var(--surface)', stroke: isSel ? 'var(--viz-4)' : on ? 'var(--viz-2)' : 'var(--viz-muted)', strokeWidth: 1.5 }} />
                    )}
                  </g>
                )
              })}
            </g>
          ))}
          <text x={padX + (rfStart + rf / 2) * unit} y={yOf(0) + rad + 22} textAnchor="middle" className="plot-label" style={{ fill: 'var(--viz-2)', fontSize: 13 }}>
            receptive field = {rf} pixel{rf === 1 ? '' : 's'}
          </text>
        </svg>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 20px', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
          <svg width={N * fp} height={N * fp} viewBox={`0 0 ${N * fp} ${N * fp}`} role="img" aria-label={`In two dimensions the receptive field is ${rf} by ${rf} pixels`} style={{ display: 'block' }}>
            <rect x={0} y={0} width={N * fp} height={N * fp} style={{ fill: 'var(--surface-2)', stroke: 'var(--viz-grid)' }} />
            {Array.from({ length: N + 1 }, (_, q) => (
              <g key={q}>
                <line x1={q * fp} x2={q * fp} y1={0} y2={N * fp} style={{ stroke: 'var(--viz-grid)', strokeWidth: 1 }} />
                <line y1={q * fp} y2={q * fp} x1={0} x2={N * fp} style={{ stroke: 'var(--viz-grid)', strokeWidth: 1 }} />
              </g>
            ))}
            <rect x={rfStart * fp} y={((N - rf) / 2) * fp} width={rf * fp} height={rf * fp} style={{ fill: 'color-mix(in srgb, var(--viz-2) 45%, transparent)', stroke: 'var(--viz-2)', strokeWidth: 2 }} />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>
            in 2-D: {rf} × {rf} = {rf * rf} pixels
          </span>
        </div>
        <table style={{ fontSize: 13, borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums' }}>
          <thead>
            <tr style={{ color: 'var(--ink-3)', textAlign: 'right' }}>
              <th style={{ textAlign: 'left', padding: '2px 8px 2px 0' }}>layer</th>
              <th style={{ padding: '2px 6px' }}>k</th>
              <th style={{ padding: '2px 6px' }}>s</th>
              <th style={{ padding: '2px 6px' }}>jump</th>
              <th style={{ padding: '2px 0 2px 6px' }}>RF</th>
            </tr>
          </thead>
          <tbody>
            {geo.map((g, l) => (
              <tr key={l} style={{ textAlign: 'right', color: l === sl ? 'var(--ink)' : 'var(--ink-2)', fontWeight: l === sl ? 800 : 500 }}>
                <td style={{ textAlign: 'left', padding: '2px 8px 2px 0' }}>{l === 0 ? 'input' : `${l}: ${SPEC[layers[l - 1]].short}`}</td>
                <td style={{ padding: '2px 6px' }}>{l === 0 ? '' : g.k}</td>
                <td style={{ padding: '2px 6px' }}>{l === 0 ? '' : g.s}</td>
                <td style={{ padding: '2px 6px' }}>{g.j}</td>
                <td style={{ padding: '2px 0 2px 6px' }}>{g.r}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sl > 0 && (
        <div style={{ fontSize: 'var(--step--1)', color: 'var(--ink-2)', textAlign: 'center' }}>
          Layer {sl}: <M>{`r = ${geo[sl - 1].r} + (${geo[sl].k} - 1) \\times ${geo[sl - 1].j} = ${geo[sl].r}`}</M>
        </div>
      )}
      <Controls>
        <Segmented
          label="selected layer"
          options={geo.map((_, l) => ({ value: l, label: l === 0 ? 'input' : String(l) }))}
          value={sl}
          onChange={pickLayer}
        />
        <Slider
          label="position in layer"
          value={si + 1}
          min={1}
          max={geo[sl].len}
          onChange={(v) => setSel([sl, v - 1])}
          format={(v) => `${v} of ${geo[sl].len}`}
        />
      </Controls>
      <Controls>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(Object.keys(SPEC) as LayerType[]).map((t) => (
            <Button key={t} onClick={() => update([...layers, t])} disabled={!canAdd(t)}>
              + {SPEC[t].name}
            </Button>
          ))}
          <Button onClick={() => update(layers.slice(0, -1))} disabled={layers.length === 0}>
            Remove top layer
          </Button>
          <Button onClick={() => update(DEFAULT)}>Reset</Button>
        </div>
      </Controls>
    </Figure>
  )
}
