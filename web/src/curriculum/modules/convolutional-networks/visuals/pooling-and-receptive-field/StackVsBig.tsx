import { useState, type ReactElement } from 'react'
import { Figure, Controls, Segmented, Slider, Readout, Bars, Button, useContainerWidth, M } from '../../../../../kit'

/*
  Two stacked 3×3 convs see the same 5×5 patch as one 5×5 conv (three see 7×7 like one 7×7),
  with fewer weights and an extra ReLU. Click any neuron in the stack to see what it looks at.
  Weights with C input and C output channels (biases ignored): one k×k layer has k²C².
*/

const CHANNELS = [1, 16, 32, 64, 128, 256, 512]
const nf = (v: number) => v.toLocaleString('en-GB')

export default function StackVsBig() {
  const [view, setView] = useState<5 | 7>(5)
  const [ci, setCi] = useState(3)
  const L = (view - 1) / 2 // number of 3×3 layers
  const sizes = Array.from({ length: L + 1 }, (_, l) => view - 2 * l) // input, layer 1, ..., layer L (=1)
  // [layer, row, col] in the stack; starts on the output neuron, which sees the whole patch
  const [sel, setSel] = useState<[number, number, number]>([2, 0, 0])
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(600)
  const C = CHANNELS[ci]

  const sl = Math.min(sel[0], L)
  const sr = Math.min(sel[1], sizes[sl] - 1)
  const sc = Math.min(sel[2], sizes[sl] - 1)
  // patch of the selected neuron in each layer below it: rows/cols [r, r + 2(sl - l)]
  const inPatch = (l: number, r: number, c: number) => l <= sl && r >= sr && r <= sr + 2 * (sl - l) && c >= sc && c <= sc + 2 * (sl - l)

  // layout: stack row and big-kernel row, each left to right
  const arrowW = 26
  const cellsAcross = sizes.reduce((a, b) => a + b, 0)
  const margin = 16
  const cs = Math.max(13, Math.min(30, Math.floor((Math.min(width, 640) - arrowW * L - 4 - margin) / cellsAcross)))
  const gridH = view * cs
  const stackW = cellsAcross * cs + arrowW * L
  const svgW = Math.max(stackW, view * cs + arrowW + cs) + margin
  // if the drawing still has to shrink to fit (very narrow phones), enlarge the text to match,
  // so labels never render below their nominal size
  const fz = (px: number) => px / Math.min(1, width / svgW)
  const titleH = 20
  const rowA = titleH // stacked row top
  const rowB = rowA + gridH + titleH + 22 // big-kernel row top
  const svgH = rowB + gridH + 6

  const grids: ReactElement[] = []
  let x = (svgW - stackW) / 2
  sizes.forEach((n, l) => {
    const y0 = rowA + (gridH - n * cs) / 2
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++) {
        const on = inPatch(l, r, c)
        const isSel = l === sl && r === sr && c === sc
        grids.push(
          <rect
            key={`s${l}-${r}-${c}`}
            x={x + c * cs + 1}
            y={y0 + r * cs + 1}
            width={cs - 2}
            height={cs - 2}
            rx={3}
            onClick={l > 0 ? () => setSel([l, r, c]) : undefined}
            style={{
              cursor: l > 0 ? 'pointer' : 'default',
              fill: isSel ? 'var(--viz-4)' : on ? 'color-mix(in srgb, var(--viz-2) 55%, var(--surface))' : 'var(--surface-3)',
              stroke: isSel ? 'var(--viz-4)' : on ? 'var(--viz-2)' : 'none',
              strokeWidth: 1.5,
            }}
          />,
        )
      }
    grids.push(
      <text key={`t${l}`} x={x + (n * cs) / 2} y={rowA + gridH + 15} textAnchor="middle" style={{ fontSize: fz(12), fontWeight: 700, fill: 'var(--ink-2)' }}>
        {l === 0 ? `input ${n}×${n}` : l === L ? 'out' : `${n}×${n}`}
      </text>,
    )
    x += n * cs
    if (l < L) {
      grids.push(
        <text key={`a${l}`} x={x + arrowW / 2} y={rowA + gridH / 2} dy="0.35em" textAnchor="middle" style={{ fontSize: fz(12), fontWeight: 700, fill: 'var(--viz-1)' }}>
          3×3
        </text>,
      )
      grids.push(<path key={`ar${l}`} d={`M${x + 5},${rowA + gridH / 2 + 10}h${arrowW - 10}m-5,-4l5,4l-5,4`} style={{ fill: 'none', stroke: 'var(--viz-1)', strokeWidth: 1.6 }} />)
      x += arrowW
    }
  })
  // big kernel row
  const bx = (svgW - (view * cs + arrowW + cs)) / 2
  for (let r = 0; r < view; r++)
    for (let c = 0; c < view; c++)
      grids.push(<rect key={`b${r}-${c}`} x={bx + c * cs + 1} y={rowB + r * cs + 1} width={cs - 2} height={cs - 2} rx={3} style={{ fill: 'color-mix(in srgb, var(--viz-3) 45%, var(--surface))', stroke: 'var(--viz-3)', strokeWidth: 1 }} />)
  const ox = bx + view * cs + arrowW
  grids.push(<rect key="bo" x={ox + 1} y={rowB + (gridH - cs) / 2 + 1} width={cs - 2} height={cs - 2} rx={3} style={{ fill: 'var(--viz-3)' }} />)
  grids.push(
    <text key="bl" x={bx + view * cs + arrowW / 2} y={rowB + gridH / 2} dy="0.35em" textAnchor="middle" style={{ fontSize: fz(12), fontWeight: 700, fill: 'var(--viz-3)' }}>
      {view}×{view}
    </text>,
  )

  const stackW8 = L * 9
  const bigW8 = view * view
  const saving = Math.round((1 - stackW8 / bigW8) * 100)

  return (
    <Figure
      title={`${L} stacked 3×3 convs versus one ${view}×${view} conv`}
      caption={
        <>
          <b>Try:</b> click any neuron (or press <b>Next neuron</b>) to light up the pixels it depends on. <b>Notice:</b> the output neuron sees the whole{' '}
          {view}×{view} patch, like the big kernel below, with <M>{`${stackW8}C^2`}</M> weights instead of <M>{`${view * view}C^2`}</M> and {L} ReLUs instead of 1.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} width={svgW} height={svgH} style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }} role="img" aria-label={`${L} stacked 3 by 3 convolutions and one ${view} by ${view} convolution, both seeing a ${view} by ${view} input patch`}>
          <text x={svgW / 2} y={13} textAnchor="middle" style={{ fontSize: fz(13), fontWeight: 700, fill: 'var(--viz-1)' }}>
            {L} × (3×3 conv + ReLU)
          </text>
          <text x={svgW / 2} y={rowB - 8} textAnchor="middle" style={{ fontSize: fz(13), fontWeight: 700, fill: 'var(--viz-3)' }}>
            1 × ({view}×{view} conv + ReLU)
          </text>
          {grids}
        </svg>
      </div>
      <Bars
        ariaLabel="Number of weights"
        data={[
          { label: `${L} × 3×3`, value: stackW8 * C * C, color: 'var(--viz-1)' },
          { label: `1 × ${view}×${view}`, value: bigW8 * C * C, color: 'var(--viz-3)' },
        ]}
        format={(v) => nf(v)}
      />
      <Controls>
        <Segmented
          label="Target view"
          value={view}
          onChange={(v) => {
            setView(v)
            setSel([(v - 1) / 2, 0, 0])
          }}
          options={[
            { value: 5, label: '5×5' },
            { value: 7, label: '7×7' },
          ]}
        />
        <Slider label="Channels in = out = C" value={ci} min={0} max={CHANNELS.length - 1} step={1} onChange={setCi} format={(i) => String(CHANNELS[i])} />
        <Button
          onClick={() => {
            // walk through every neuron of every layer above the input
            const cells: [number, number, number][] = []
            for (let l = 1; l <= L; l++) for (let r = 0; r < sizes[l]; r++) for (let c = 0; c < sizes[l]; c++) cells.push([l, r, c])
            const idx = cells.findIndex(([l, r, c]) => l === sl && r === sr && c === sc)
            setSel(cells[(idx + 1) % cells.length])
          }}
        >
          Next neuron
        </Button>
      </Controls>
      <Readout
        items={[
          ['weights saved', `${saving}%`],
          ['non-linearities', `${L} vs 1`],
          ['selected neuron sees', `${2 * sl + 1}×${2 * sl + 1}`],
        ]}
      />
    </Figure>
  )
}
