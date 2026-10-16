import { useState, type ReactNode } from 'react'
import { Figure, Controls, Segmented, Toggle, Readout, useContainerWidth, M } from '../../../../../kit'

/*
  A ResNet basic block with tensor shapes on its edges:
  x → conv3×3 (stride s) → BN → ReLU → conv3×3 → BN → (+ shortcut) → ReLU → y.
  The addition needs both tensors to have the same shape. With stride 2 or more output channels,
  the identity shortcut fails (PyTorch's real error is shown) until a 1×1 projection is switched on.
*/

const C_IN = 64
const H_IN = 56
const nf = (v: number) => v.toLocaleString('en-GB')
type Shape = [number, number, number]
const fmtShape = (s: Shape) => `(${s[0]}, ${s[1]}, ${s[2]})`

export default function ResidualBlockFlow() {
  const [skip, setSkip] = useState(true)
  const [stride, setStride] = useState(1)
  const [cout, setCout] = useState(64)
  const [proj, setProj] = useState(false)
  const [back, setBack] = useState(false)
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(560)

  const h = stride === 1 ? H_IN : H_IN / 2
  const xS: Shape = [C_IN, H_IN, H_IN]
  const fS: Shape = [cout, h, h]
  const sS: Shape = proj ? fS : xS
  const match = sS.every((v, i) => v === fS[i])
  const ok = !skip || match
  let errDim = -1
  for (let d = 2; d >= 0; d--) if (sS[d] !== fS[d]) {
    errDim = d
    break
  }
  const torchDim = errDim + 1 // batch dimension comes first

  const p1 = 9 * C_IN * cout
  const p2 = 9 * cout * cout
  const pbn = 2 * 2 * cout
  const pp = skip && proj ? C_IN * cout + 2 * cout : 0
  const total = p1 + p2 + pbn + pp

  // layout
  const W = Math.min(width, 440)
  const bw = Math.min(200, W - 150)
  const x0 = 8
  const cx = x0 + bw / 2
  const xs = W - 26
  const bh = 30
  const ys = { x: 18, c1: 58, bn1: 112, c2: 166, bn2: 220, add: 290, relu: 336, y: 384 }
  const svgH = ys.y + 22
  const addR = 13

  const box = (y: number, label: ReactNode, sub?: string, fill = 'color-mix(in srgb, var(--viz-1) 16%, var(--surface))') => (
    <g>
      <rect x={x0} y={y} width={bw} height={bh} rx={7} style={{ fill, stroke: 'var(--viz-1)', strokeWidth: 1.5 }} />
      <text x={cx} y={y + bh / 2} dy="0.35em" textAnchor="middle" style={{ fontSize: 13, fontWeight: 700, fill: 'var(--ink)' }}>
        {label}
        {sub && <tspan style={{ fontWeight: 500, fill: 'var(--ink-2)' }}> {sub}</tspan>}
      </text>
    </g>
  )
  const vline = (y1: number, y2: number, x = cx, color = 'var(--viz-axis)') => <line x1={x} x2={x} y1={y1} y2={y2} style={{ stroke: color, strokeWidth: 2 }} />
  const shapeLabel = (x: number, y: number, s: Shape, color = 'var(--ink-2)', anchor: 'start' | 'middle' | 'end' = 'start') => (
    <text x={x} y={y} dy="0.35em" textAnchor={anchor} className="plot-label" style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600, fill: color }}>
      {fmtShape(s)}
    </text>
  )
  const projY = (ys.c1 + ys.add) / 2 - 22
  const bad = 'var(--viz-neg)'

  return (
    <Figure
      title="Inside a residual block"
      caption={
        <>
          <b>Try:</b> set the stride to 2 or the channels to 128, then switch on the 1×1 projection; finally show the backward pass. <b>Notice:</b>{' '}
          <M>{'F(x) + x'}</M> needs equal <M>{'(C, H, W)'}</M> shapes, and the shortcut hands the gradient straight back (× 1).
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${svgH}`} width={W} height={svgH} style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }} role="img" aria-label={`Residual block with input ${fmtShape(xS)} and residual branch output ${fmtShape(fS)}; ${ok ? 'shapes match' : 'shapes do not match'}`}>
          {/* input */}
          <text x={cx} y={ys.x} dy="0.35em" textAnchor="middle" style={{ fontSize: 15, fontWeight: 800, fill: 'var(--ink)' }}>
            x
          </text>
          {shapeLabel(cx + 12, ys.x, xS)}
          {vline(ys.x + 10, ys.c1)}
          {box(ys.c1, `conv 3×3, ${cout}`, stride === 2 ? 'stride 2' : '')}
          {vline(ys.c1 + bh, ys.bn1)}
          {shapeLabel(cx + 8, (ys.c1 + bh + ys.bn1) / 2, fS, 'var(--viz-1)')}
          {box(ys.bn1, 'BatchNorm + ReLU')}
          {vline(ys.bn1 + bh, ys.c2)}
          {box(ys.c2, `conv 3×3, ${cout}`)}
          {vline(ys.c2 + bh, ys.bn2)}
          {box(ys.bn2, 'BatchNorm')}
          {vline(ys.bn2 + bh, skip ? ys.add - addR : ys.relu)}
          {shapeLabel(cx + 8, (ys.bn2 + bh + ys.add - addR) / 2, fS, 'var(--viz-1)')}
          <text x={cx - 8} y={(ys.bn2 + bh + ys.add - addR) / 2} dy="0.35em" textAnchor="end" style={{ fontSize: 12.5, fontWeight: 800, fill: 'var(--viz-1)' }}>
            F(x)
          </text>
          {/* shortcut */}
          {skip && (
            <g>
              <path d={`M${cx + 6},${ys.x + 9} L${xs},${ys.x + 9} L${xs},${ys.add} L${cx + addR},${ys.add}`} style={{ fill: 'none', stroke: ok ? 'var(--viz-4)' : bad, strokeWidth: 2.4, strokeDasharray: ok ? undefined : '6 4' }} />
              {proj && (
                <g>
                  <rect x={xs - 64} y={projY} width={86} height={44} rx={7} style={{ fill: 'color-mix(in srgb, var(--viz-4) 15%, var(--surface))', stroke: 'var(--viz-4)', strokeWidth: 1.5 }} />
                  <text x={xs - 21} y={projY + 16} textAnchor="middle" style={{ fontSize: 12, fontWeight: 700, fill: 'var(--ink)' }}>
                    1×1 conv
                  </text>
                  <text x={xs - 21} y={projY + 32} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ink-2)' }}>
                    {stride === 2 ? 'stride 2, BN' : 'then BN'}
                  </text>
                </g>
              )}
              {/* the skip's shape sits at the right, above the pink line, clear of the F(x) label */}
              {shapeLabel(xs - 8, ys.add - 11, sS, ok ? 'var(--viz-4)' : bad, 'end')}
              <circle cx={cx} cy={ys.add} r={addR} style={{ fill: ok ? 'var(--surface)' : `color-mix(in srgb, ${bad} 20%, var(--surface))`, stroke: ok ? 'var(--viz-ink)' : bad, strokeWidth: 2 }} />
              <text x={cx} y={ys.add} dy="0.36em" textAnchor="middle" style={{ fontSize: 18, fontWeight: 700, fill: ok ? 'var(--ink)' : bad }}>
                +
              </text>
              {vline(ys.add + addR, ys.relu)}
            </g>
          )}
          {box(ys.relu, 'ReLU', undefined, 'var(--surface-2)')}
          {vline(ys.relu + bh, ys.y - 8, cx, ok ? 'var(--viz-axis)' : bad)}
          <text x={cx} y={ys.y + 4} dy="0.35em" textAnchor="middle" style={{ fontSize: 15, fontWeight: 800, fill: ok ? 'var(--ink)' : bad }}>
            {ok ? 'y' : '✗'}
          </text>
          {ok && shapeLabel(cx + 12, ys.y + 4, fS)}
          {/* backward pass */}
          {back && ok && (
            <g>
              {skip && (
                <g>
                  <path d={`M${xs + 12},${ys.add - 4} L${xs + 12},${ys.x + 20}`} style={{ stroke: 'var(--viz-2)', strokeWidth: 3 }} />
                  <path d={`M${xs + 12},${ys.x + 14} l-5,9 l10,0 z`} style={{ fill: 'var(--viz-2)' }} />
                  {/* with a projection the label sits on the arrow ABOVE the 1×1 box, so it is not read as part of the box */}
                  <text
                    x={xs + 4}
                    y={proj ? (ys.x + 20 + projY) / 2 : (ys.x + ys.add) / 2}
                    dy="0.35em"
                    textAnchor="end"
                    className="plot-label"
                    style={{ fontSize: 13, fill: 'var(--viz-2)', fontWeight: 800, paintOrder: 'stroke', stroke: 'var(--surface)', strokeWidth: 4, strokeLinejoin: 'round' }}
                  >
                    {proj ? '↑ × W' : '↑ × 1'}
                  </text>
                </g>
              )}
              <text x={cx + bw / 2 - 4} y={ys.bn1 + bh + 12} textAnchor="end" className="plot-label" style={{ fontSize: 12.5, fill: 'var(--viz-2)', fontWeight: 800 }}>
                ↑ × ∂F/∂x
              </text>
            </g>
          )}
        </svg>
      </div>
      {!ok && (
        <div role="alert" style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: 13, padding: '8px 10px', borderRadius: 8, background: 'color-mix(in srgb, var(--viz-neg) 12%, var(--surface))', border: '1.5px solid var(--viz-neg)', color: 'var(--ink)', overflowWrap: 'anywhere' }}>
          RuntimeError: The size of tensor a ({fS[errDim]}) must match the size of tensor b ({sS[errDim]}) at non-singleton dimension {torchDim}
        </div>
      )}
      {back && ok && (
        <div style={{ fontSize: 'var(--step--1)', color: 'var(--ink)', textAlign: 'center' }}>
          {skip ? (
            proj ? (
              <>
                Gradient into <M>x</M>: <M>{'\\frac{\\partial F}{\\partial x} + W_{1\\times1}'}</M> (the orange arrow multiplies by the 1×1 conv&apos;s weights{' '}
                <M>{'W_{1\\times1}'}</M>), still a short, cheap path that skips both 3×3 convs.
              </>
            ) : (
              <>
                Gradient into <M>x</M> (before the last ReLU): <M>{'\\frac{\\partial y}{\\partial x} = \\frac{\\partial F}{\\partial x} + 1'}</M>. Even if{' '}
                <M>{'\\partial F/\\partial x'}</M> is tiny, the <b>+1</b> passes the gradient straight back.
              </>
            )
          ) : (
            <>
              Plain block: <M>{'\\frac{\\partial y}{\\partial x} = \\frac{\\partial F}{\\partial x}'}</M> only. Stack 50 of these with small factors and the gradient
              vanishes.
            </>
          )}
        </div>
      )}
      <Controls>
        <Toggle label="Skip connection" checked={skip} onChange={setSkip} />
        <Segmented label="Stride of first conv" value={stride} onChange={setStride} options={[{ value: 1, label: '1' }, { value: 2, label: '2' }]} />
        <Segmented label="Output channels" value={cout} onChange={setCout} options={[{ value: 64, label: '64' }, { value: 128, label: '128' }]} />
        {skip && <Toggle label="1×1 projection on the skip" checked={proj} onChange={setProj} />}
        <Toggle label="Show backward pass" checked={back} onChange={setBack} />
      </Controls>
      <Readout
        items={[
          ['3×3 conv weights', `${nf(p1)} + ${nf(p2)}`],
          ['BatchNorm (2 layers × a scale and a shift per channel)', nf(pbn)],
          ['projection', nf(pp)],
          ['block total', nf(total)],
        ]}
      />
    </Figure>
  )
}
