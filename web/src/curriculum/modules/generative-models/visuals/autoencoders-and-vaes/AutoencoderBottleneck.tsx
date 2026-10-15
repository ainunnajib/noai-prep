import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Grid, Axes, Path, Dots, Label, M, useContainerWidth } from '../../../../../kit'
import { DigitImg, decodeImg, mse, Tiny } from './digits'
import { SIZES, TEST_MSE, SHOW, REC, LEVELS, NOISY, DEN, PLAIN, DEN_ERR } from './aeData'

/*
  Real autoencoders (trained in PyTorch on scikit-learn's 8 x 8 digits): 64 -> 128 -> k -> 128 -> 64.
  "Squeeze" mode: one trained model per bottleneck size k; the reconstructions of six test digits are shown.
  "Denoise" mode: noisy inputs, and the output of a denoising autoencoder (trained on noisy inputs with clean
  targets) or of a plain one with the same bottleneck (k = 16).
*/

type Mode = 'squeeze' | 'denoise'
const GAP = 6

const rowHead: CSSProperties = { fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink-2)', margin: '0.5rem 0 0.25rem' }

/** pass `mode` to fix the figure to one mode (the mode switch is then hidden) */
export default function AutoencoderBottleneck({ mode: fixed }: { mode?: Mode }) {
  const [chosen, setMode] = useState<Mode>('squeeze')
  const mode = fixed ?? chosen
  const [ki, setKi] = useState(3) // k = 8
  const [li, setLi] = useState(2) // noise 0.3
  const [model, setModel] = useState<'den' | 'plain'>('den')
  const [sel, setSel] = useState(0)
  const [ref, w] = useContainerWidth<HTMLDivElement>(520)

  const k = SIZES[ki]
  const inputs = useMemo(() => SHOW.map((s) => decodeImg(s.x)), [])
  const recs = useMemo(() => REC[String(k)].map(decodeImg), [k])
  const noisy = useMemo(() => NOISY[li].map(decodeImg), [li])
  const outs = useMemo(() => (model === 'den' ? DEN : PLAIN)[li].map(decodeImg), [li, model])

  const size = Math.max(34, Math.min(64, Math.floor((w - 5 * GAP) / 6)))
  const row = (imgs: number[][], what: string, tone: 'ink' | 'error' = 'ink', notes?: string[]) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(6, ${size}px)`, gap: GAP, justifyContent: 'center' }}>
      {imgs.map((px, i) => (
        <button
          key={i}
          type="button"
          onClick={() => setSel(i)}
          aria-label={`${what} of digit ${SHOW[i].label}${i === sel ? ' (shown in the diagram)' : ''}`}
          style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
        >
          <DigitImg px={px} size={size} label={`${what}, digit ${SHOW[i].label}`} tone={tone} outline={i === sel ? '2px solid var(--viz-5)' : undefined} />
          {notes && <Tiny>{notes[i]}</Tiny>}
        </button>
      ))}
    </div>
  )

  const errs = inputs.map((x, i) => mse(x, recs[i]))
  const errMaps = inputs.map((x, i) => x.map((v, j) => Math.abs(v - recs[i][j])))
  const denErrs = inputs.map((x, i) => mse(x, outs[i]))
  const noisyErrs = inputs.map((x, i) => mse(x, noisy[i]))
  const DE = DEN_ERR[li]

  return (
    <Figure
      wide
      title={mode === 'squeeze' ? 'Squeeze 64 pixels through k numbers' : 'Clean up noisy digits'}
      caption={
        mode === 'squeeze' ? (
          <>
            Each row of six is a real autoencoder at work on digits it never saw in training. Slide the bottleneck <M>k</M> from 64 down to 1. With room for 32 numbers
            the copies are almost perfect; at 2 or 1 the network can only keep the rough shape, and some digits turn into a different digit. The red row shows
            where each reconstruction is wrong. Click any digit to show it in the diagram.
          </>
        ) : (
          <>
            Slide the noise level up. This <b>denoising autoencoder</b> (bottleneck 16) was trained to output the clean digit from a noisy copy, so it has learned what
            digits look like and ignores the speckle. Then switch to a plain autoencoder of the same size, trained only on clean digits: it has never seen noise,
            and its outputs end up further from the clean digits than the noisy inputs were.
          </>
        )
      }
    >
      {!fixed && (
        <Controls>
          <Segmented
            label="Mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'squeeze', label: 'Squeeze' },
              { value: 'denoise', label: 'Denoise' },
            ]}
          />
        </Controls>
      )}
      <div ref={ref} style={{ width: '100%' }}>
        <Funnel width={w} k={mode === 'squeeze' ? k : 16} left={mode === 'squeeze' ? inputs[sel] : noisy[sel]} right={mode === 'squeeze' ? recs[sel] : outs[sel]} />
        {mode === 'squeeze' ? (
          <>
            <div style={rowHead}>Input: six test digits (64 numbers each)</div>
            {row(inputs, 'input')}
            <div style={rowHead}>Reconstruction through a bottleneck of k = {k}</div>
            {row(recs, 'reconstruction', 'ink', errs.map((e) => e.toFixed(3)))}
            <div style={rowHead}>Where it went wrong (redder = bigger error)</div>
            {row(errMaps, 'error map', 'error')}
          </>
        ) : (
          <>
            <div style={rowHead}>The clean digits (the targets)</div>
            {row(inputs, 'clean digit')}
            <div style={rowHead}>What goes in: noisy copies (noise level {LEVELS[li].toFixed(2)})</div>
            {row(noisy, 'noisy input', 'ink', noisyErrs.map((e) => e.toFixed(3)))}
            <div style={rowHead}>What comes out: {model === 'den' ? 'denoising autoencoder' : 'plain autoencoder'}</div>
            {row(outs, 'output', 'ink', denErrs.map((e) => e.toFixed(3)))}
          </>
        )}
      </div>
      {mode === 'squeeze' && <ErrorCurve k={k} />}
      <Controls>
        {mode === 'squeeze' ? (
          <>
            <Slider label={<>bottleneck size <M>k</M></>} value={ki} min={0} max={SIZES.length - 1} step={1} onChange={setKi} format={(i) => String(SIZES[i])} />
            <Readout
              items={[
                ['numbers kept', `${k} of 64`],
                ['error on all 297 test digits', TEST_MSE[String(k)].toFixed(4)],
              ]}
            />
          </>
        ) : (
          <>
            <Slider label="noise level" value={li} min={0} max={LEVELS.length - 1} step={1} onChange={setLi} format={(i) => LEVELS[i].toFixed(2)} />
            <Segmented
              label="Model (k = 16)"
              value={model}
              onChange={setModel}
              options={[
                { value: 'den', label: 'Denoising AE' },
                { value: 'plain', label: 'Plain AE' },
              ]}
            />
            <Readout
              items={[
                ['error of the noisy inputs', DE.noisy.toFixed(4)],
                ['error after the autoencoder', (model === 'den' ? DE.out : DE.plain16).toFixed(4)],
              ]}
            />
          </>
        )}
      </Controls>
      <p style={{ fontSize: '0.75rem', color: 'var(--ink-3)', textAlign: 'center', margin: '0.3rem 0 0' }}>
        Numbers under the images and in the read-out are mean squared errors against the clean digit (pixels run from 0 to 1); the read-out averages over all 297 test digits.
      </p>
    </Figure>
  )
}

/** 64 -> 128 -> k -> 128 -> 64, bar heights proportional to the square root of the layer width */
function Funnel({ width, k, left, right }: { width: number; k: number; left: number[]; right: number[] }) {
  const W = Math.max(300, width)
  const H = 150
  const img = Math.min(56, Math.round(W * 0.1))
  const sizes = [64, 128, k, 128, 64]
  const x0 = img + 26
  const x1 = W - img - 26
  const xs = sizes.map((_, i) => x0 + ((x1 - x0) * i) / 4)
  const cy = 68
  const hOf = (n: number) => 6 + 7.2 * Math.sqrt(n)
  const bw = 14
  const lab = ['64', '128', `k = ${k}`, '128', '64']
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', maxWidth: W }} role="img" aria-label={`Autoencoder: 64 inputs, 128 hidden, bottleneck of ${k}, 128 hidden, 64 outputs`}>
      {xs.slice(0, -1).map((x, i) => {
        const h1 = hOf(sizes[i]) / 2
        const h2 = hOf(sizes[i + 1]) / 2
        const xn = xs[i + 1]
        return (
          <path
            key={i}
            d={`M${x + bw / 2},${cy - h1}L${xn - bw / 2},${cy - h2}L${xn - bw / 2},${cy + h2}L${x + bw / 2},${cy + h1}Z`}
            style={{ fill: i < 2 ? 'color-mix(in srgb, var(--viz-1) 12%, transparent)' : 'color-mix(in srgb, var(--viz-3) 12%, transparent)' }}
          />
        )
      })}
      {xs.map((x, i) => (
        <g key={i}>
          <rect x={x - bw / 2} y={cy - hOf(sizes[i]) / 2} width={bw} height={hOf(sizes[i])} rx={3} style={{ fill: i === 2 ? 'var(--viz-5)' : i < 2 ? 'var(--viz-1)' : 'var(--viz-3)', opacity: i === 2 ? 1 : 0.75 }} />
          <text x={x} y={cy + 64} textAnchor="middle" className="tabular" style={{ fontSize: 12, fill: i === 2 ? 'var(--viz-5)' : 'var(--ink-2)', fontWeight: i === 2 ? 700 : 400 }}>
            {lab[i]}
          </text>
        </g>
      ))}
      <text x={(xs[0] + xs[2]) / 2} y={14} textAnchor="middle" style={{ fontSize: 12.5, fill: 'var(--viz-1)', fontWeight: 700 }}>
        encoder
      </text>
      <text x={(xs[2] + xs[4]) / 2} y={14} textAnchor="middle" style={{ fontSize: 12.5, fill: 'var(--viz-3)', fontWeight: 700 }}>
        decoder
      </text>
      <text x={xs[2]} y={H - 4} textAnchor="middle" style={{ fontSize: 11.5, fill: 'var(--ink-2)' }}>
        bottleneck (the latent code)
      </text>
      <foreignObject x={4} y={cy - img / 2} width={img + 4} height={img + 4}>
        <DigitImg px={left} size={img} label="input image" />
      </foreignObject>
      <foreignObject x={W - img - 6} y={cy - img / 2} width={img + 4} height={img + 4}>
        <DigitImg px={right} size={img} label="output image" />
      </foreignObject>
      <text x={4 + img / 2} y={cy + img / 2 + 16} textAnchor="middle" style={{ fontSize: 11.5, fill: 'var(--ink-2)' }}>
        x
      </text>
      <text x={W - 6 - img / 2} y={cy + img / 2 + 16} textAnchor="middle" style={{ fontSize: 11.5, fill: 'var(--ink-2)' }}>
        x̂
      </text>
    </svg>
  )
}

/** test error against bottleneck size (log scale) */
function ErrorCurve({ k }: { k: number }) {
  const pts: [number, number][] = SIZES.map((s) => [Math.log2(s), TEST_MSE[String(s)]])
  const cur: [number, number] = [Math.log2(k), TEST_MSE[String(k)]]
  return (
    <div style={{ marginTop: '0.6rem', width: '100%' }}>
      <div style={{ ...rowHead, textAlign: 'center' }}>Average test error for each bottleneck size</div>
      <Plot x={[-0.3, 6.3]} y={[0, 0.056]} width={520} height={170} minHeight={160} margin={{ left: 50, bottom: 34, top: 10, right: 16 }} ariaLabel="Reconstruction error falls as the bottleneck grows">
        <Grid xTicks={7} yTicks={4} />
        <Path points={pts} color="var(--viz-5)" width={2.4} />
        <Dots points={pts.map(([x, y]) => ({ x, y, r: 3.5, color: 'var(--viz-5)' }))} />
        <Dots points={[{ x: cur[0], y: cur[1], r: 7, color: 'var(--viz-5)' }]} />
        <Label x={cur[0]} y={cur[1]} dx={cur[0] > 4.5 ? -10 : 10} dy={cur[1] > 0.04 ? 16 : -10} anchor={cur[0] > 4.5 ? 'end' : 'start'} weight={700} color="var(--viz-5)">
          {cur[1].toFixed(4)}
        </Label>
        <Axes xTicks={7} hideYTicks tickFormat={(v) => (Number.isInteger(v) && v >= 0 ? String(2 ** v) : '')} xLabel="bottleneck size k" />
        <Axes hideXTicks yTicks={4} yLabel="mean sq. error" />
      </Plot>
    </div>
  )
}
