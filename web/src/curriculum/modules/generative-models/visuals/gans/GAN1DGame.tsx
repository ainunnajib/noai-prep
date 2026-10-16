import { useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Figure,
  Controls,
  Readout,
  Slider,
  Segmented,
  Button,
  Plot,
  Axes,
  FnPath,
  Path,
  Arrow,
  Label,
  HLine,
  useAnimationFrame,
  usePlot,
  mulberry32,
  M,
} from '../../../../../kit'
import { MU_R, SD_R, K_D, dOf, logitSlope, normalPdf, stats, trainRound, type GanState } from './gan1d'

const MAX_ROUNDS = 400
const N_DOTS = 14

function gaussian(rng: () => number) {
  const u = Math.max(1e-12, rng())
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function initialState(seed: number): GanState {
  if (seed === 1) return { b: 0, a: 1, c: [0, 0, 0], round: 0, diverged: false }
  const rng = mulberry32(seed * 101 + 7)
  return { b: -2.5 + 3 * rng(), a: 0.5 + rng(), c: [0, 0, 0], round: 0, diverged: false }
}

interface Hist {
  lossD: number[]
  lossG: number[]
}

export default function GAN1DGame() {
  const [seed, setSeed] = useState(1)
  const [lrD, setLrD] = useState(3)
  const [lrG, setLrG] = useState(0.2)
  const [st, setSt] = useState<GanState>(() => initialState(1))
  const [speed, setSpeed] = useState<'slow' | 'fast'>('slow')
  const acc = useRef(0)
  const [hist, setHist] = useState<Hist>(() => {
    const s = stats(initialState(1))
    return { lossD: [s.lossD], lossG: [s.lossG] }
  })
  const [playing, setPlaying] = useState(false)

  const dots = useMemo(() => {
    const rng = mulberry32(seed * 7919 + 3)
    const real = Array.from({ length: N_DOTS }, () => MU_R + SD_R * gaussian(rng))
    const z = Array.from({ length: N_DOTS }, () => gaussian(rng))
    return { real, z }
  }, [seed])

  const advance = (n: number) => {
    let s = st
    const lD = [...hist.lossD]
    const lG = [...hist.lossG]
    for (let i = 0; i < n && s.round < MAX_ROUNDS && !s.diverged; i++) {
      s = trainRound(s, lrD, lrG)
      const m = stats(s)
      lD.push(m.lossD)
      lG.push(m.lossG)
    }
    setSt(s)
    setHist({ lossD: lD, lossG: lG })
    if (s.round >= MAX_ROUNDS || s.diverged) setPlaying(false)
  }

  // a fixed number of rounds per second, whatever the screen's refresh rate, so the pushes can be watched
  useAnimationFrame((dt) => {
    acc.current += dt * (speed === 'slow' ? 6 : 30)
    const n = Math.floor(acc.current)
    if (n > 0) {
      acc.current -= n
      advance(n)
    }
  }, playing)

  const restart = (newSeed: number) => {
    const s0 = initialState(newSeed)
    const m = stats(s0)
    setSeed(newSeed)
    setSt(s0)
    setHist({ lossD: [m.lossD], lossG: [m.lossG] })
    setPlaying(false)
  }

  const m = stats(st)
  const sdG = Math.abs(st.a)

  // generator density: a fixed grid plus extra points near its centre, so narrow spikes still draw
  const gPoints = useMemo(() => {
    const xs: number[] = []
    for (let i = 0; i <= 260; i++) xs.push(-3 + (10 * i) / 260)
    for (let i = -40; i <= 40; i++) xs.push(st.b + (sdG * 4 * i) / 40)
    xs.sort((p, q) => p - q)
    return xs.filter((x) => x >= -3 && x <= 7).map((x) => [x, Math.min(1.6, normalPdf(x, st.b, sdG))] as [number, number])
  }, [st.b, sdG])

  const realArea = useMemo(() => {
    const pts: [number, number][] = [[-3, 0]]
    for (let i = 0; i <= 200; i++) {
      const x = -3 + (10 * i) / 200
      pts.push([x, normalPdf(x, MU_R, SD_R)])
    }
    pts.push([7, 0])
    return pts
  }, [])

  const fakeX = dots.z.map((z) => st.b + st.a * z)
  const Y_REAL = -0.09
  const Y_FAKE = -0.2

  const status = st.diverged
    ? 'Training blew up: the generator overshot. Lower its learning rate and restart.'
    : st.round === 0
      ? 'Round 0: D has not learned anything yet, so it says 0.5 ("no idea") everywhere.'
      : Math.abs(m.dReal - 0.5) < 0.02 && Math.abs(m.dFake - 0.5) < 0.02 && Math.abs(st.b - MU_R) < 0.1 && Math.abs(sdG - SD_R) < 0.07
        ? 'Equilibrium: the fakes match the real data and D can only guess 0.5.'
        : sdG < 0.15
          ? 'The generator has squeezed all its outputs into a narrow spike where D says "real".'
          : 'Training: D marks where fakes are; G slides its outputs towards where D says "real".'

  return (
    <Figure
      wide
      title="A real GAN, small enough to watch"
      caption={
        <>
          The blue hump is the real data. The green curve is what the generator currently produces, and the orange dashed curve is the discriminator's verdict{' '}
          <M>{'D(x)'}</M> = probability that <M>{'x'}</M> is real. Press <b>Play</b> (one round = {K_D} updates of D, then 1 update of G). Watch the green arrows:
          each fake is pushed <i>uphill on D's curve</i>. The generator never looks at the blue data; it only follows D's slope. Then try: discriminator learning
          rate 0 (nothing happens), 0.3 (the fakes collapse into a spike), 6 (D flip-flops), or generator learning rate 2.5 (it blows up).
        </>
      }
    >
      <Legend />
      <Plot x={[-3, 7]} y={[-0.27, 1.08]} width={640} height={330} minHeight={320} margin={{ left: 44 }} ariaLabel="Real data density, generator density and discriminator curve on one axis">
        <Path points={realArea} color="var(--viz-1)" width={2} fill="color-mix(in srgb, var(--viz-1) 18%, transparent)" closed />
        <HLine y={0.5} color="var(--viz-muted)" dash="3 4" width={1} />
        <Path points={[[-3, 0], [7, 0]]} color="var(--viz-axis)" width={1.2} />
        <Path points={gPoints} color="var(--viz-3)" width={2.6} />
        <FnPath f={(x) => dOf(st.c, x)} color="var(--viz-2)" width={2.6} dash="7 5" />
        <RowDots xs={dots.real} y={Y_REAL} color="var(--viz-1)" hollow />
        <RowDots xs={fakeX} y={Y_FAKE} color="var(--viz-3)" />
        {fakeX.map((x, i) => {
          if (x < -3 || x > 7 || st.round === 0) return null
          const push = (1 - dOf(st.c, x)) * logitSlope(st.c, x)
          const len = Math.max(-0.9, Math.min(0.9, push * 0.6))
          if (Math.abs(len) < 0.06) return null
          return <Arrow key={`a${i}`} from={[x, Y_FAKE + 0.055]} to={[x + len, Y_FAKE + 0.055]} color="var(--viz-3)" width={1.6} head={6} />
        })}
        <RowLabel y={Y_REAL} color="var(--viz-1)">real</RowLabel>
        <RowLabel y={Y_FAKE} color="var(--viz-3)">fake</RowLabel>
        <Axes xTicks={10} yTicks={2} hideYTicks xLabel="x" />
        <YTicks />
      </Plot>
      <LossHistory hist={hist} />
      <p style={{ margin: '0.3rem 0 0', fontSize: '0.875rem', color: st.diverged ? 'var(--bad)' : 'var(--ink-2)', textAlign: 'center' }} aria-live="polite">
        {status}
      </p>
      <Controls>
        <div className="player">
          <Button primary onClick={() => (st.diverged || st.round >= MAX_ROUNDS ? restart(seed) : setPlaying((p) => !p))}>
            {playing ? 'Pause' : st.diverged || st.round >= MAX_ROUNDS ? 'Restart' : 'Play'}
          </Button>
          <Button onClick={() => advance(1)} disabled={playing || st.diverged || st.round >= MAX_ROUNDS}>
            1 round
          </Button>
          <Button onClick={() => advance(25)} disabled={playing || st.diverged || st.round >= MAX_ROUNDS}>
            25 rounds
          </Button>
          <Button onClick={() => restart(seed + 1)}>New seed</Button>
        </div>
        <Segmented<'slow' | 'fast'>
          label="speed"
          value={speed}
          onChange={setSpeed}
          options={[
            { value: 'slow', label: 'slow' },
            { value: 'fast', label: 'fast' },
          ]}
        />
        <Slider label="discriminator learning rate" value={lrD} min={0} max={6} step={0.1} onChange={setLrD} format={(v) => v.toFixed(1)} />
        <Slider label="generator learning rate" value={lrG} min={0} max={2.5} step={0.05} onChange={setLrG} format={(v) => v.toFixed(2)} />
        <Readout
          items={[
            ['round', String(st.round)],
            ['fake mean (real 3.0)', st.b.toFixed(2)],
            ['fake std (real 0.7)', sdG.toFixed(2)],
            ['avg D(real)', m.dReal.toFixed(2)],
            ['avg D(fake)', m.dFake.toFixed(2)],
          ]}
        />
      </Controls>
    </Figure>
  )
}

function RowDots({ xs, y, color, hollow }: { xs: number[]; y: number; color: string; hollow?: boolean }) {
  return (
    <>
      {xs.map((x, i) =>
        x < -3 || x > 7 ? null : <DotAt key={i} x={x} y={y} color={color} hollow={hollow} />,
      )}
    </>
  )
}

function DotAt({ x, y, color, hollow }: { x: number; y: number; color: string; hollow?: boolean }) {
  const { xs, ys } = usePlot()
  return (
    <circle
      cx={xs(x)}
      cy={ys(y)}
      r={4.5}
      style={hollow ? { fill: 'var(--surface)', stroke: color, strokeWidth: 2 } : { fill: color, stroke: 'var(--surface)', strokeWidth: 1.2, opacity: 0.9 }}
    />
  )
}

function YTicks() {
  const { xs, ys } = usePlot()
  const x0 = xs(-3)
  return (
    <g className="plot-axes">
      {[0, 0.5, 1].map((t) => (
        <g key={t} transform={`translate(${x0},${ys(t)})`}>
          <line x2={-5} />
          <text x={-8} dy="0.32em" textAnchor="end">
            {t}
          </text>
        </g>
      ))}
    </g>
  )
}

function RowLabel({ y, color, children }: { y: number; color: string; children: string }) {
  const { xs, ys } = usePlot()
  return (
    <text x={xs(-3) - 6} y={ys(y)} dy="0.35em" textAnchor="end" style={{ fontSize: 11.5, fontWeight: 600, fill: color }}>
      {children}
    </text>
  )
}

function Legend() {
  const item = (swatch: ReactNode, text: string) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
      <svg width={26} height={12} aria-hidden="true">
        {swatch}
      </svg>
      {text}
    </span>
  )
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.3rem 1rem', fontSize: '0.8125rem', color: 'var(--ink-2)', marginBottom: '0.25rem' }}>
      {item(<rect x={1} y={1} width={24} height={10} rx={2} style={{ fill: 'color-mix(in srgb, var(--viz-1) 25%, transparent)', stroke: 'var(--viz-1)', strokeWidth: 1.5 }} />, 'real data')}
      {item(<line x1={1} x2={25} y1={6} y2={6} style={{ stroke: 'var(--viz-3)', strokeWidth: 2.6 }} />, 'generator G')}
      {item(<line x1={1} x2={25} y1={6} y2={6} style={{ stroke: 'var(--viz-2)', strokeWidth: 2.6, strokeDasharray: '7 5' }} />, 'D(x) = P(real)')}
      <span style={{ flexBasis: '100%', textAlign: 'center', fontSize: '0.75rem' }}>The humps show where values are common (their shape only); the 0 to 1 scale is for D(x).</span>
    </div>
  )
}

function LossHistory({ hist }: { hist: Hist }) {
  const n = Math.max(60, hist.lossD.length - 1)
  const toPts = (arr: number[]) => arr.map((v, i) => [i, Math.min(3.4, v)] as [number, number])
  return (
    <Plot x={[0, n]} y={[0, 3.5]} width={640} height={150} minHeight={140} margin={{ left: 40, right: 16, top: 12, bottom: 44 }} ariaLabel="Discriminator and generator loss over training rounds">
      <HLine y={2 * Math.LN2} color="var(--viz-2)" dash="3 4" width={1} />
      <HLine y={Math.LN2} color="var(--viz-3)" dash="3 4" width={1} />
      <Path points={toPts(hist.lossD)} color="var(--viz-2)" width={2} />
      <Path points={toPts(hist.lossG)} color="var(--viz-3)" width={2} />
      <Label x={n} y={2 * Math.LN2} dx={-4} dy={-5} anchor="end" size={11.5} color="var(--viz-2)">
        loss_D (2 ln 2 ≈ 1.39 at balance)
      </Label>
      <Label x={n} y={Math.LN2} dx={-4} dy={14} anchor="end" size={11.5} color="var(--viz-3)">
        loss_G (ln 2 ≈ 0.69 at balance)
      </Label>
      <Axes xTicks={5} yTicks={3} xLabel="round" />
    </Plot>
  )
}
