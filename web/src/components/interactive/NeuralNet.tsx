import type { ReactNode } from 'react'
import { useContainerWidth } from './useContainerWidth'

export interface NeuralNetProps {
  /** neurons per layer, e.g. [3, 4, 2] */
  layers: number[]
  /** labels under each layer */
  layerLabels?: string[]
  /** optional per-neuron labels/values: nodeLabels[layer][i] */
  nodeLabels?: (ReactNode | undefined)[][]
  /** optional activations in [0,1] to shade neurons */
  activations?: number[][]
  /** optional weights[l][i][j] from layer l neuron i to layer l+1 neuron j; colours/thickness edges */
  weights?: number[][][]
  /** highlight one neuron: [layer, index] (its incoming edges are emphasised) */
  focus?: [number, number]
  /** highlight a whole layer of edges (between l and l+1) */
  activeEdgeLayer?: number
  width?: number
  height?: number
  ariaLabel?: string
}

/** Layered network diagram for perceptrons, MLPs, forward/backward passes. */
export function NeuralNet({ layers, layerLabels, nodeLabels, activations, weights, focus, activeEdgeLayer, width: designWidth = 520, height: designHeight = 300, ariaLabel }: NeuralNetProps) {
  const [wrapRef, measured] = useContainerWidth<HTMLDivElement>(designWidth)
  const width = Math.max(220, Math.min(designWidth * 1.2, measured))
  const height = Math.round((designHeight * width) / designWidth)
  const padX = 60
  const padY = 28
  const bottom = layerLabels ? 26 : 0
  const colX = (l: number) => (layers.length === 1 ? width / 2 : padX + (l * (width - 2 * padX)) / (layers.length - 1))
  const maxN = Math.max(...layers)
  const r = Math.max(9, Math.min(20, (height - 2 * padY - bottom) / (maxN * 2.6)))
  const span = height - 2 * padY - bottom
  const gap = maxN > 1 ? span / (maxN - 1) : 0
  const rowY = (l: number, i: number) => padY + span / 2 + (i - (layers[l] - 1) / 2) * gap
  const wMax = weights ? Math.max(1e-9, ...weights.flat(2).map(Math.abs)) : 1

  return (
    <div ref={wrapRef} className="plot-wrap" style={{ maxWidth: designWidth * 1.2 }}>
    <svg className="nnet" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel ?? `Neural network with layers ${layers.join('-')}`}>
      {layers.slice(0, -1).map((n, l) =>
        Array.from({ length: n }).flatMap((_, i) =>
          Array.from({ length: layers[l + 1] }).map((__, j) => {
            const w = weights?.[l]?.[i]?.[j]
            const isFocus = focus && focus[0] === l + 1 && focus[1] === j
            const active = activeEdgeLayer === l || isFocus
            const stroke = w == null ? (active ? 'var(--viz-1)' : 'var(--viz-muted)') : w >= 0 ? 'var(--viz-2)' : 'var(--viz-1)'
            const sw = w == null ? (active ? 2 : 1) : 0.6 + (Math.abs(w) / wMax) * 4
            const op = focus && !isFocus ? 0.18 : w == null && !active ? 0.45 : 0.85
            return <line key={`${l}-${i}-${j}`} x1={colX(l)} y1={rowY(l, i)} x2={colX(l + 1)} y2={rowY(l + 1, j)} style={{ stroke, strokeWidth: sw, opacity: op }} />
          }),
        ),
      )}
      {layers.map((n, l) =>
        Array.from({ length: n }).map((_, i) => {
          const a = activations?.[l]?.[i]
          const isFocus = focus && focus[0] === l && focus[1] === i
          const fill = a == null ? 'var(--surface)' : `color-mix(in srgb, var(--viz-1) ${Math.round(Math.max(0, Math.min(1, a)) * 85)}%, var(--surface))`
          const lab = nodeLabels?.[l]?.[i]
          return (
            <g key={`n${l}-${i}`}>
              <circle cx={colX(l)} cy={rowY(l, i)} r={r} style={{ fill, stroke: isFocus ? 'var(--viz-2)' : 'var(--viz-ink)', strokeWidth: isFocus ? 3 : 1.5 }} />
              {lab != null && (
                <text x={colX(l)} y={rowY(l, i)} dy="0.35em" textAnchor="middle" className="nnet-node-label">
                  {lab}
                </text>
              )}
            </g>
          )
        }),
      )}
      {layerLabels?.map((t, l) => (
        <text key={`ll${l}`} x={colX(l)} y={height - 8} textAnchor="middle" className="nnet-layer-label">
          {t}
        </text>
      ))}
    </svg>
    </div>
  )
}
