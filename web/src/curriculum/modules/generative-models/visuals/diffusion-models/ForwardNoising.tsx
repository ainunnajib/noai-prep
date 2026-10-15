import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Button, Plot, Axes, Grid, FnPath, VLine, Dots, Label, useNarrow, useAnimationFrame, mulberry32, M } from '../../../../../kit'
import { ABAR, T, gaussian, type ScheduleName } from './diffusion'
import { GreyImage } from './pixels'

const N = 32

/** a 32×32 picture of Marina Bay Sands at sunset, values in [-1, 1] */
function skyline(): Float32Array {
  const img = new Float32Array(N * N).fill(-1)
  const set = (x: number, y: number, v: number) => {
    if (x >= 0 && x < N && y >= 0 && y < N) img[y * N + x] = v
  }
  // sun
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if ((x - 25) ** 2 + (y - 4.5) ** 2 <= 8.5) set(x, y, 0.15)
  // three towers, slightly flared at the base
  for (const x0 of [6, 14, 22])
    for (let y = 12; y < 27; y++) {
      const flare = y > 22 ? 1 : 0
      for (let x = x0 - flare; x < x0 + 4; x++) set(x, y, 1)
    }
  // the SkyPark "ship" across the top, with a cantilevered bow on the right
  for (let x = 4; x <= 29; x++) {
    set(x, 10, 1)
    set(x, 11, 1)
  }
  set(30, 10, 1)
  // water with ripples
  for (let y = 27; y < N; y++) for (let x = 0; x < N; x++) set(x, y, (x + 2 * y) % 5 === 0 ? 0.35 : -0.35)
  return img
}

const BASE = skyline()

function noiseImage(seed: number): Float32Array {
  const rng = mulberry32(seed * 977 + 13)
  return Float32Array.from({ length: N * N }, () => gaussian(rng))
}

const lab: CSSProperties = { fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink-2)', textAlign: 'center', marginTop: 4, lineHeight: 1.3 }
const op: CSSProperties = { fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center', alignSelf: 'center', paddingBottom: '1.4rem' }

export default function ForwardNoising() {
  const [t, setT] = useState(250)
  const [sched, setSched] = useState<ScheduleName>('linear')
  const [seed, setSeed] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [ref, narrow] = useNarrow<HTMLDivElement>(520)

  useAnimationFrame((dt) => {
    setT((v) => {
      const nv = Math.min(T, v + Math.round(dt * 260))
      if (nv >= T) setPlaying(false)
      return nv
    })
  }, playing)

  const eps = useMemo(() => noiseImage(seed), [seed])
  const abar = ABAR[sched][t]
  const sa = Math.sqrt(abar)
  const sb = Math.sqrt(1 - abar)
  const signal = useMemo(() => BASE.map((v) => sa * v), [sa])
  const noise = useMemo(() => eps.map((v) => sb * v), [eps, sb])
  const xt = useMemo(() => signal.map((v, i) => v + noise[i]), [signal, noise])
  const other: ScheduleName = sched === 'linear' ? 'cosine' : 'linear'
  const size = narrow ? 92 : 150

  return (
    <Figure
      wide
      title="Forward noising: jump straight to any step t"
      caption={
        <>
          Slide <M>t</M> from 0 to 1000. The noisy image is always the same recipe: a shrinking amount of the original plus a growing amount of one fixed noise
          image <M>{'\\varepsilon'}</M>. The curve shows how much of the original survives, <M>{'\\bar\\alpha_t'}</M>. With the <b>linear</b> schedule the picture is
          practically gone by <M>{'t \\approx 600'}</M>, so the last few hundred steps are spent on near-pure noise; the <b>cosine</b> schedule destroys it more
          evenly. Nothing here is learned: noising is a fixed formula.
        </>
      }
    >
      <div
        ref={ref}
        style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr)', gap: narrow ? 4 : 10, alignItems: 'start', width: '100%', maxWidth: 620, margin: '0 auto' }}
      >
        <div>
          <GreyImage values={signal} size={N} maxWidth={size} ariaLabel={`The original image scaled by ${sa.toFixed(2)}`} />
          <div style={lab}>
            <M>{'\\sqrt{\\bar\\alpha_t}\\,x_0'}</M>
            <br />
            original × {sa.toFixed(2)}
          </div>
        </div>
        <div style={op}>+</div>
        <div>
          <GreyImage values={noise} size={N} maxWidth={size} ariaLabel={`Gaussian noise scaled by ${sb.toFixed(2)}`} />
          <div style={lab}>
            <M>{'\\sqrt{1-\\bar\\alpha_t}\\,\\varepsilon'}</M>
            <br />
            noise × {sb.toFixed(2)}
          </div>
        </div>
        <div style={op}>=</div>
        <div>
          <GreyImage values={xt} size={N} maxWidth={size} ariaLabel={`The noisy image at step ${t}`} />
          <div style={lab}>
            <M>{'x_t'}</M>
            <br />
            what the network sees
          </div>
        </div>
      </div>
      <Plot x={[0, T]} y={[0, 1.05]} width={620} height={200} minHeight={170} ariaLabel="The schedule: fraction of the original signal left at each step">
        <Grid xTicks={5} yTicks={4} />
        <FnPath f={(x) => ABAR[other][Math.round(x)]} color="var(--viz-muted)" width={1.8} dash="5 4" samples={200} />
        <FnPath f={(x) => ABAR[sched][Math.round(x)]} color="var(--viz-1)" width={2.8} samples={300} />
        <VLine x={t} color="var(--viz-2)" dash="4 3" width={1.5} />
        <Dots points={[{ x: t, y: abar, color: 'var(--viz-2)', r: 6 }]} />
        <Label x={t} y={abar} dx={t > 700 ? -10 : 10} dy={-10} anchor={t > 700 ? 'end' : 'start'} color="var(--viz-2)" weight={700}>
          {`ᾱ = ${abar < 0.001 ? abar.toExponential(1) : abar.toFixed(3)}`}
        </Label>
        <Axes xLabel="step t" yLabel="signal left, ᾱ" xTicks={5} yTicks={4} tickFormat={(v) => String(Math.round(v * 100) / 100)} />
      </Plot>
      <Controls>
        <Slider label={<>step <M>t</M></>} value={t} min={0} max={T} step={1} onChange={(v) => (setPlaying(false), setT(v))} />
        <Segmented
          label="Schedule"
          value={sched}
          onChange={setSched}
          options={[
            { value: 'linear', label: 'linear' },
            { value: 'cosine', label: 'cosine' },
          ]}
        />
        <Button primary onClick={() => (t >= T ? (setT(0), setPlaying(true)) : setPlaying((p) => !p))}>
          {playing ? 'Pause' : t >= T ? 'Replay from 0' : 'Play'}
        </Button>
        <Button onClick={() => setSeed((s) => s + 1)}>New noise ε</Button>
        <Readout
          items={[
            [<M key="a">{'\\bar\\alpha_t'}</M>, abar < 0.001 ? abar.toExponential(1) : abar.toFixed(3)],
            [<M key="b">{'\\sqrt{\\bar\\alpha_t}'}</M>, sa.toFixed(3)],
            [<M key="c">{'\\sqrt{1 - \\bar\\alpha_t}'}</M>, sb.toFixed(3)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
