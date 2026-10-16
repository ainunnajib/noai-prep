import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Bars } from '../../../../../kit'
import s from './pss.module.css'

/*
  Standard vs depthwise separable convolution (biases ignored, as is usual for this comparison).
  Standard: C_out kernels of k×k×C_in, so k²·C_in·C_out weights.
  Depthwise: one k×k filter per input channel (k²·C_in), then pointwise: a 1×1 conv that mixes
  channels (C_in·C_out). Multiply-adds = weights × output positions (H_out · W_out).
*/

const K_OPTS = [1, 3, 5, 7]
const C_OPTS = [3, 16, 32, 64, 128, 256, 512]
const HW_OPTS = [7, 14, 28, 56, 112]

const big = (v: number) => v.toLocaleString('en-GB')
function short(v: number) {
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)} billion`
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)} million`
  return big(v)
}

/** An oblique box: front face w×h, depth d (all in px). */
function Box({ w, h, d, colour, x = 0, y = 0 }: { w: number; h: number; d: number; colour: string; x?: number; y?: number }) {
  const dx = d * 0.7
  const dy = -d * 0.45
  const face = { fill: `color-mix(in srgb, ${colour} 30%, var(--surface))`, stroke: colour, strokeWidth: 1.4 }
  const topF = { fill: `color-mix(in srgb, ${colour} 18%, var(--surface))`, stroke: colour, strokeWidth: 1.4 }
  const sideF = { fill: `color-mix(in srgb, ${colour} 42%, var(--surface))`, stroke: colour, strokeWidth: 1.4 }
  return (
    <g transform={`translate(${x}, ${y})`}>
      <path d={`M0,0 L${dx},${dy} L${w + dx},${dy} L${w},0 Z`} style={topF} />
      <path d={`M${w},0 L${w + dx},${dy} L${w + dx},${h + dy} L${w},${h} Z`} style={sideF} />
      <rect x={0} y={0} width={w} height={h} style={face} />
    </g>
  )
}

function Glyph({ k, depth, colour, label }: { k: number; depth: number; colour: string; label: string }) {
  const unit = 9
  const w = k * unit
  const d = depth
  const W = w + d * 0.7 + 8
  const H = w + d * 0.45 + 8
  return (
    <svg viewBox={`-4 ${-d * 0.45 - 4} ${W} ${H}`} width={W} height={H} role="img" aria-label={label} style={{ display: 'block' }}>
      <Box w={w} h={w} d={d} colour={colour} />
    </svg>
  )
}

export default function ConvParamCompare() {
  const [ki, setKi] = useState(1)
  const [cin, setCin] = useState(4)
  const [cout, setCout] = useState(4)
  const [hw, setHw] = useState(2)
  const k = K_OPTS[ki]
  const Cin = C_OPTS[cin]
  const Cout = C_OPTS[cout]
  const HWo = HW_OPTS[hw]
  const pos = HWo * HWo

  const standard = k * k * Cin * Cout
  const depthwise = k * k * Cin
  const pointwise = Cin * Cout
  const separable = depthwise + pointwise
  const ratio = standard / separable
  const depthPx = (c: number) => 6 + Math.log2(c) * 7

  return (
    <Figure
      title="Standard vs depthwise separable convolution"
      caption={
        <>
          <b>Try:</b> slide k, C<sub>in</sub> and C<sub>out</sub>, then the output size. <b>Notice:</b> a depthwise k × k step plus a 1 × 1 mixing
          step saves nearly k<sup>2</sup> (about 9× for 3 × 3) on wide layers, and costs slightly more when k = 1, since a 1 × 1 convolution has no
          spatial part to separate. Multiply-adds grow with the number of output positions; the weight counts do not. Biases are ignored.
        </>
      }
    >
      <div className={s.glyphs}>
        <div className={s.glyph}>
          <span className={s.glyphName}>Standard</span>
          <Glyph k={k} depth={depthPx(Cin)} colour="var(--viz-neg)" label="a standard kernel" />
          <span className={s.glyphSub}>
            kernel {k}×{k}×{Cin}
            <br />× {Cout} kernels
          </span>
        </div>
        <div className={s.glyph}>
          <span className={s.glyphName}>Depthwise</span>
          <Glyph k={k} depth={4} colour="var(--viz-1)" label="a depthwise filter" />
          <span className={s.glyphSub}>
            filter {k}×{k}×1
            <br />× {Cin} (one per channel)
          </span>
        </div>
        <div className={s.glyph}>
          <span className={s.glyphName}>Pointwise (1 × 1)</span>
          <Glyph k={1} depth={depthPx(Cin)} colour="var(--viz-3)" label="a pointwise 1 by 1 kernel" />
          <span className={s.glyphSub}>
            kernel 1×1×{Cin}
            <br />× {Cout} kernels
          </span>
        </div>
      </div>
      <Bars
        ariaLabel="Number of weights in each kind of layer"
        format={(v) => big(v)}
        data={[
          { label: 'standard', value: standard, color: 'var(--viz-neg)', strong: true },
          { label: 'depthwise separable', value: separable, color: 'var(--viz-5)', strong: true },
          { label: '… depthwise part', value: depthwise, color: 'var(--viz-1)' },
          { label: '… pointwise (1 × 1) part', value: pointwise, color: 'var(--viz-3)' },
        ]}
      />
      <Controls>
        <Slider label="kernel size k" value={ki} min={0} max={K_OPTS.length - 1} onChange={setKi} format={(i) => `${K_OPTS[i]} × ${K_OPTS[i]}`} />
        <Slider label={<>input channels C<sub>in</sub></>} value={cin} min={0} max={C_OPTS.length - 1} onChange={setCin} format={(i) => C_OPTS[i]} />
        <Slider label={<>output channels C<sub>out</sub></>} value={cout} min={0} max={C_OPTS.length - 1} onChange={setCout} format={(i) => C_OPTS[i]} />
        <Slider label="output size (H = W)" value={hw} min={0} max={HW_OPTS.length - 1} onChange={setHw} format={(i) => `${HW_OPTS[i]} × ${HW_OPTS[i]}`} />
      </Controls>
      <Readout
        items={[
          ['separable uses', ratio >= 1.005 ? `${ratio.toFixed(1)}× fewer weights` : `${(1 / ratio).toFixed(2)}× more weights`],
          ['multiply-adds, standard', short(standard * pos)],
          ['multiply-adds, separable', short(separable * pos)],
        ]}
      />
    </Figure>
  )
}
