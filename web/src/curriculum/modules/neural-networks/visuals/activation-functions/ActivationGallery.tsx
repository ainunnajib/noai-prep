import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Grid, Axes, FnPath, Path, Dots, Label, HLine, VLine, Rect, DraggablePoint, usePlot, M } from '../../../../../kit'
import { ACTS, GALLERY_ALPHA, flatZones, type ActName } from './acts'

/*
  The activation gallery: the chosen function on top, its derivative (slope) underneath, on the same
  z-axis. Shaded bands are where the slope is below 0.05 in size (saturated: almost no gradient gets
  through). Drag the point along the curve (or use the slider) to read f(z), f′(z) and what happens if
  ten layers in a row each multiplied the gradient by this slope.
*/

const ZR: [number, number] = [-5, 5]
const MARGIN = { left: 44, right: 16, top: 14, bottom: 32 }

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }

/** Plain-text "1.6 × 10⁻¹⁰" style formatting, in the same font as the other readouts. */
function sci(v: number) {
  if (v === 0) return '0'
  const a = Math.abs(v)
  if (a >= 0.001 && a < 1000) return (Math.round(v * 1000) / 1000).toString()
  let e = Math.floor(Math.log10(a))
  let m = v / 10 ** e
  // 9.96 × 10⁻⁵ must not print as "10.0 × 10⁻⁵"
  if (Math.abs(Number(m.toFixed(1))) >= 10) {
    e += 1
    m = v / 10 ** e
  }
  return `${m.toFixed(1)} × 10${String(e).split('').map((c) => SUP[c]).join('')}`
}
/**
 * The drag point's label, placed in whichever of four spots around the point is clear of the curve,
 * the dashed asymptotes and the plot edges (so it is never struck through by a line).
 */
function PointLabel({ x, y, f, asymptotes, text }: { x: number; y: number; f: (z: number) => number; asymptotes: number[]; text: string }) {
  const { xs, ys } = usePlot()
  const [X0, X1] = xs.range()
  const [Yb, Yt] = ys.range()
  const px = xs(x)
  const py = ys(y)
  const w = text.length * 7.4
  const spots: { dx: number; dy: number; anchor: 'start' | 'end' }[] = [
    { dx: -14, dy: -14, anchor: 'end' },
    { dx: 14, dy: -14, anchor: 'start' },
    { dx: 14, dy: 24, anchor: 'start' },
    { dx: -14, dy: 24, anchor: 'end' },
  ]
  const clear = (s: (typeof spots)[number]) => {
    const left = s.anchor === 'end' ? px + s.dx - w : px + s.dx
    const right = left + w
    const top = py + s.dy - 13
    const bottom = py + s.dy + 4
    if (left < Math.min(X0, X1) || right > Math.max(X0, X1) || top < Math.min(Yb, Yt) || bottom > Math.max(Yb, Yt)) return false
    for (const a of asymptotes) {
      const ay = ys(a)
      if (ay > top - 3 && ay < bottom + 3) return false
    }
    for (let k = 0; k <= 12; k++) {
      const cy = ys(f(xs.invert(left + (k / 12) * w)))
      if (cy > top - 4 && cy < bottom + 4) return false
    }
    return true
  }
  const s = spots.find(clear) ?? spots[0]
  return (
    <text className="plot-label" x={px + s.dx} y={py + s.dy} textAnchor={s.anchor} style={{ fill: 'var(--viz-4)', fontSize: 12.5, strokeWidth: 4 }}>
      {text}
    </text>
  )
}

const f3 = (v: number) => {
  const r = Math.round(v * 1000) / 1000
  return (r === 0 ? 0 : r).toFixed(3).replace('-', '−')
}

export default function ActivationGallery() {
  const [name, setName] = useState<ActName>('sigmoid')
  const [z, setZ] = useState(2)
  const [touched, setTouched] = useState(false)
  const A = ACTS[name]
  const fz = A.f(z)
  const atKink = A.kink && Math.abs(z) < 1e-9
  const dz = A.df(z)
  // only the flat tails count as saturation (GELU also has a single flat point at its minimum, z ≈ −0.75)
  const zones = flatZones(A.df, ZR[0], ZR[1]).filter(([a, b]) => a <= ZR[0] + 0.05 || b >= ZR[1] - 0.05)
  const pow10 = dz ** 10
  const d = 0.9 / Math.sqrt(1 + dz * dz)
  const snap = (v: number) => Math.round(Math.max(ZR[0], Math.min(ZR[1], v)) * 20) / 20
  const zoneLabel = name === 'relu' ? 'slope 0' : 'saturated'
  const lowLeft = name === 'leaky' ? GALLERY_ALPHA : 0

  return (
    <Figure
      title="The activation gallery: each function and its slope"
      caption={
        <>
          Top: the activation <i>f</i>(<i>z</i>). Bottom: its slope <i>f</i>′(<i>z</i>), the factor training multiplies the gradient by at this neuron; shaded bands
          are where it is almost 0 (saturated). Drag the pink point into a band on <b>sigmoid</b> and watch the &ldquo;10 layers&rdquo; number collapse, then
          compare the other four. (Leaky ReLU&rsquo;s α is drawn as 0.1, bigger than the usual 0.01, so you can see it.)
        </>
      }
    >
      <Segmented
        label="Activation"
        options={(Object.keys(ACTS) as ActName[]).map((k) => ({ value: k, label: ACTS[k].label }))}
        value={name}
        onChange={setName}
      />
      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1.5rem', justifyContent: 'center', alignItems: 'center', fontSize: '0.95rem' }}>
        <M>{A.fTex}</M>
        <M>{A.dfTex}</M>
        <span style={{ fontSize: '0.9rem', color: 'var(--ink-2)' }}>
          range <b style={{ color: 'var(--ink)' }}>{A.range}</b>
        </span>
      </div>
      <div style={{ width: '100%', display: 'grid', gap: 2, justifyItems: 'center' }}>
        <Plot x={ZR} y={A.yr} width={520} height={240} minHeight={190} margin={MARGIN} ariaLabel={`${A.label} of z; at z = ${z.toFixed(2)} the output is ${fz.toFixed(3)}`}>
          {zones.map(([a, b], i) => (
            <Rect key={i} x0={a} x1={b} y0={A.yr[0]} y1={A.yr[1]} fill="color-mix(in srgb, var(--viz-neg) 11%, var(--surface))" />
          ))}
          <Grid xTicks={10} yTicks={8} />
          <Axes xLabel="z" yLabel="f(z)" xTicks={10} yTicks={4} origin />
          {A.asymptotes.map((y) => (
            <HLine key={y} y={y} color="var(--viz-muted)" dash="5 5" width={1.25} />
          ))}
          {zones.map(([a, b], i) =>
            b - a > 1 ? (
              <Label key={`l${i}`} x={(a + b) / 2} y={A.yr[1]} dy={16} anchor="middle" color="var(--viz-neg)" size={12}>
                {zoneLabel}
              </Label>
            ) : null,
          )}
          <FnPath f={A.f} color="var(--viz-1)" width={3} />
          {!atKink && (
            <Path
              points={[
                [z - d, fz - dz * d],
                [z + d, fz + dz * d],
              ]}
              color="var(--viz-4)"
              width={2}
              dash="5 3"
            />
          )}
          <DraggablePoint
            x={z}
            y={fz}
            color="var(--viz-4)"
            onChange={(x) => {
              setZ(snap(x))
              setTouched(true)
            }}
            constrain={(x) => [x, A.f(snap(x))]}
            lockY
          />
          <PointLabel x={z} y={fz} f={A.f} asymptotes={A.asymptotes} text={`${touched ? '' : 'drag me · '}z = ${z.toFixed(2).replace('-', '−')}`} />
        </Plot>
        <Plot x={ZR} y={[-0.25, 1.25]} width={520} height={150} minHeight={170} margin={MARGIN} ariaLabel={`Slope of ${A.label}: ${atKink ? 'undefined at the kink' : dz.toFixed(3)} at z = ${z.toFixed(2)}`}>
          {zones.map(([a, b], i) => (
            <Rect key={i} x0={a} x1={b} y0={-0.25} y1={1.25} fill="color-mix(in srgb, var(--viz-neg) 11%, var(--surface))" />
          ))}
          <Grid xTicks={10} yTicks={4} />
          <Axes xLabel="z" yLabel="f′(z)" xTicks={10} yTicks={4} origin />
          <HLine y={0.25} color="var(--viz-muted)" dash="3 4" width={1.25} label="sigmoid max 0.25" />
          {A.kink ? (
            <>
              <Path points={[[ZR[0], lowLeft], [0, lowLeft]]} color="var(--viz-3)" width={3} />
              <Path points={[[0, 1], [ZR[1], 1]]} color="var(--viz-3)" width={3} />
              <Dots points={[{ x: 0, y: lowLeft, r: 4.5, color: 'var(--viz-3)', hollow: true }, { x: 0, y: 1, r: 4.5, color: 'var(--viz-3)', hollow: true }]} />
            </>
          ) : (
            <FnPath f={A.df} color="var(--viz-3)" width={3} />
          )}
          <VLine x={z} color="var(--viz-4)" dash="3 4" width={1.25} />
          {!atKink && <Dots points={[{ x: z, y: dz, r: 6.5, color: 'var(--viz-4)' }]} />}
        </Plot>
      </div>
      <Controls>
        <Slider label="input z" value={z} min={ZR[0]} max={ZR[1]} step={0.05} onChange={(v) => setZ(snap(v))} format={(v) => v.toFixed(2)} />
      </Controls>
      <Readout
        items={[
          ['f(z)', f3(fz)],
          ['slope f′(z)', atKink ? `undefined at the kink (PyTorch uses ${lowLeft === 0 ? '0' : 'α'} there)` : f3(dz)],
          ['10 layers like this: f′(z)¹⁰', atKink ? '—' : sci(pow10).replace('-', '−')],
        ]}
      />
      <p style={{ margin: 0, width: '100%', fontSize: '0.9rem', color: 'var(--ink-2)' }}>{A.note}</p>
    </Figure>
  )
}
