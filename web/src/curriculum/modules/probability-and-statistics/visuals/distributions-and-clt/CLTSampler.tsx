import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Figure,
  Controls,
  Readout,
  Slider,
  Segmented,
  Toggle,
  Button,
  Plot,
  Grid,
  Axes,
  FnPath,
  Path,
  Rect,
  Label,
  Dots,
  usePlot,
  useAnimationFrame,
  mulberry32,
  M,
} from '../../../../../kit'
import { normalPdf, gauss, fmt } from './stats'

/*
  Central Limit Theorem. Top: the population (a source distribution on 0–10 minutes) with the
  n values of the latest sample as dots and their mean as a diamond. Bottom: histogram of all
  sample means drawn so far, with the normal curve N(μ, σ²/n) predicted by the CLT on top.
  Sample i always uses its own seeded RNG, so moving the n slider re-draws the same experiment
  instantly at the new n: the histogram morphs from the source shape into a narrow bell.
*/

type Source = 'uniform' | 'skewed' | 'twohump'
type Speed = 'slow' | 'fast'

const MAX = 2000
const START = 600
const BIN = 0.2
const NBINS = Math.round(10 / BIN)
const RATE: Record<Speed, number> = { slow: 2.5, fast: 80 }

const SOURCES: Record<Source, { label: string; mu: number; sigma: number; pdf: (x: number) => number; draw: (r: () => number) => number }> = {
  uniform: {
    label: 'flat',
    mu: 5,
    sigma: 10 / Math.sqrt(12),
    pdf: (x) => (x >= 0 && x <= 10 ? 0.1 : 0),
    draw: (r) => 10 * r(),
  },
  skewed: {
    label: 'skewed',
    mu: 2,
    sigma: 2,
    pdf: (x) => (x >= 0 ? 0.5 * Math.exp(-x / 2) : 0),
    draw: (r) => -2 * Math.log(1 - r()),
  },
  twohump: {
    label: 'two humps',
    mu: 5,
    sigma: Math.sqrt(0.64 + 6.25),
    pdf: (x) => 0.5 * normalPdf(x, 2.5, 0.8) + 0.5 * normalPdf(x, 7.5, 0.8),
    draw: (r) => (r() < 0.5 ? 2.5 : 7.5) + 0.8 * gauss(r),
  },
}
const SRC_CODE: Record<Source, number> = { uniform: 11, skewed: 23, twohump: 37 }

/** the n values of sample number i (deterministic) */
function sampleValues(src: Source, n: number, i: number, seed: number) {
  const r = mulberry32((seed * 7919 + i * 104729 + SRC_CODE[src] * 15485863) >>> 0)
  return Array.from({ length: n }, () => SOURCES[src].draw(r))
}

/** histogram bars in one SVG path (keeps the element count low) */
function HistBars({ counts, hiBin }: { counts: number[]; hiBin: number }) {
  const { xs, ys, clipId } = usePlot()
  let d = ''
  counts.forEach((c, b) => {
    if (c <= 0 || b === hiBin) return
    const x0 = xs(b * BIN) + 0.5
    const x1 = xs((b + 1) * BIN) - 0.5
    d += `M${x0.toFixed(1)},${ys(0).toFixed(1)}V${ys(c).toFixed(1)}H${x1.toFixed(1)}V${ys(0).toFixed(1)}Z`
  })
  return <path d={d} clipPath={`url(#${clipId})`} style={{ fill: 'color-mix(in srgb, var(--viz-1) 45%, var(--surface))', stroke: 'none' }} />
}

export default function CLTSampler() {
  const [src, setSrc] = useState<Source>('skewed')
  const [n, setN] = useState(4)
  const [count, setCount] = useState(START)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<Speed>('fast')
  const [showCurve, setShowCurve] = useState(true)
  const [seed, setSeed] = useState(3)
  const acc = useRef(0)

  const S = SOURCES[src]
  const means = useMemo(() => {
    const out = new Float64Array(MAX)
    for (let i = 0; i < MAX; i++) {
      const v = sampleValues(src, n, i, seed)
      out[i] = v.reduce((a, b) => a + b, 0) / n
    }
    return out
  }, [src, n, seed])

  useAnimationFrame((dt) => {
    acc.current += dt * RATE[speed]
    const k = Math.floor(acc.current)
    if (k > 0) {
      acc.current -= k
      setCount((c) => Math.min(MAX, c + k))
    }
  }, playing)
  useEffect(() => {
    if (count >= MAX) setPlaying(false)
  }, [count])

  const counts = useMemo(() => {
    const c = new Array(NBINS).fill(0)
    for (let i = 0; i < count; i++) {
      const b = Math.min(NBINS - 1, Math.max(0, Math.floor(means[i] / BIN)))
      c[b]++
    }
    return c
  }, [means, count])

  const latest = count > 0 ? sampleValues(src, n, count - 1, seed) : []
  const latestMean = count > 0 ? means[count - 1] : NaN
  const hiBin = count > 0 ? Math.min(NBINS - 1, Math.floor(latestMean / BIN)) : -1

  let sum = 0
  for (let i = 0; i < count; i++) sum += means[i]
  const mMean = count > 0 ? sum / count : NaN
  let ss = 0
  for (let i = 0; i < count; i++) ss += (means[i] - mMean) ** 2
  const mSd = count > 1 ? Math.sqrt(ss / count) : NaN
  const se = S.sigma / Math.sqrt(n)

  const curve = (x: number) => count * BIN * normalPdf(x, S.mu, se)
  const yTop = Math.max(5, ...counts, showCurve && count > 0 ? curve(S.mu) : 0) * 1.12
  const srcTop = src === 'skewed' ? 0.56 : src === 'uniform' ? 0.16 : 0.34

  // place the latest sample's dots in a few rows so they do not overlap too much
  const dotRows = latest.map((v, j) => ({ x: Math.min(10, v), y: srcTop * (0.1 + 0.11 * (j % 4)), r: n > 20 ? 3.2 : 4.2, color: 'var(--viz-2)' }))

  const toggle = () => {
    if (playing) setPlaying(false)
    else {
      if (count >= MAX) setCount(0)
      setPlaying(true)
    }
  }

  return (
    <Figure
      title="Averages of samples become a bell curve"
      caption={
        <>
          Each <b>sample</b> is <M>n</M> random waiting times from the population on top (orange dots); its average is the orange square, and it lands as
          one more block in the histogram below. Slide <M>n</M> down to 1: the histogram copies the skewed population. Slide it up to 30: the averages pile
          into a narrow, symmetric bell that matches the dashed normal curve with spread <M>{'\\sigma/\\sqrt{n}'}</M>. Try the other two population shapes,
          then press <b>Clear</b> and <b>Play</b> to watch it build.
        </>
      }
    >
      <Plot x={[0, 10]} y={[0, srcTop]} width={560} height={160} maxWidth={680} minHeight={140} margin={{ left: 40, bottom: 38, top: 18 }} ariaLabel={`Population distribution: ${S.label}, mean ${fmt(S.mu)}`}>
        <Axes xTicks={10} yTicks={0} hideYTicks xLabel="waiting time (min)" />
        <Path
          points={[[0, 0], ...Array.from({ length: 201 }, (_, i): [number, number] => [i / 20, Math.min(srcTop, S.pdf(i / 20))]), [10, 0]]}
          closed
          color="none"
          fill="color-mix(in srgb, var(--viz-3) 22%, transparent)"
        />
        <FnPath f={(x) => S.pdf(x)} color="var(--viz-3)" width={2.5} samples={300} />
        <Label x={10} y={srcTop} dy={4} anchor="end" color="var(--viz-3)" weight={700}>
          {`population: μ = ${fmt(S.mu)}, σ = ${fmt(S.sigma)}`}
        </Label>
        {count > 0 && <Dots points={dotRows} stroke="var(--surface)" />}
        {count > 0 && <Dots points={[{ x: latestMean, y: srcTop * 0.62, r: 7, shape: 'square', color: 'var(--viz-2)' }]} />}
        {count > 0 && (
          <Label x={latestMean} y={srcTop * 0.62} dx={latestMean > 7.5 ? -11 : 11} dy={4} anchor={latestMean > 7.5 ? 'end' : 'start'} color="var(--viz-2)" weight={700}>
            {`sample mean ${latestMean.toFixed(2)}`}
          </Label>
        )}
      </Plot>

      <Plot x={[0, 10]} y={[0, yTop]} width={560} height={260} maxWidth={680} minHeight={220} margin={{ left: 44, bottom: 36, top: 16 }} ariaLabel={`Histogram of ${count} sample means with n = ${n}`}>
        <Grid xTicks={10} yTicks={4} />
        <Axes xLabel="sample mean x̄" yLabel="how many samples" xTicks={10} yTicks={4} />
        <HistBars counts={counts} hiBin={hiBin} />
        {hiBin >= 0 && counts[hiBin] > 0 && <Rect x0={hiBin * BIN + 0.01} x1={(hiBin + 1) * BIN - 0.01} y0={0} y1={counts[hiBin]} fill="var(--viz-2)" />}
        {showCurve && count > 0 && <FnPath f={curve} color="var(--viz-ink)" width={2} dash="6 4" samples={300} />}
      </Plot>

      <Controls>
        <Segmented
          label="population shape"
          value={src}
          onChange={setSrc}
          options={[
            { value: 'skewed', label: 'skewed' },
            { value: 'uniform', label: 'flat' },
            { value: 'twohump', label: 'two humps' },
          ]}
        />
        <Slider label={<>sample size n</>} value={n} min={1} max={50} step={1} onChange={setN} />
      </Controls>
      <Controls>
        <Button primary onClick={toggle}>
          {playing ? 'Pause' : 'Play'}
        </Button>
        <Button onClick={() => setCount((c) => Math.min(MAX, c + 1))} disabled={playing || count >= MAX}>
          Draw 1 sample
        </Button>
        <Button
          onClick={() => {
            setPlaying(false)
            acc.current = 0
            setSeed((s) => s + 1)
            setCount(0)
          }}
        >
          Clear
        </Button>
        <Segmented
          label="speed"
          value={speed}
          onChange={setSpeed}
          options={[
            { value: 'slow', label: 'slow' },
            { value: 'fast', label: 'fast' },
          ]}
        />
        <Toggle label="normal curve" checked={showCurve} onChange={setShowCurve} />
      </Controls>
      <Readout
        items={[
          ['samples', String(count)],
          ['mean of the x̄s', Number.isFinite(mMean) ? `${mMean.toFixed(2)} (μ = ${fmt(S.mu)})` : '–'],
          ['spread (sd) of the x̄s', Number.isFinite(mSd) ? mSd.toFixed(2) : '–'],
          ['CLT predicts σ/√n', `${fmt(S.sigma)}/√${n} = ${se.toFixed(2)}`],
        ]}
      />
    </Figure>
  )
}
