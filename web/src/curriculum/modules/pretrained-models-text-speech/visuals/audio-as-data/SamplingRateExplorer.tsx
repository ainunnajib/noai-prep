import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Plot, Grid, Axes, FnPath, Path, Dots, Label, Rect, VLine, Arrow, M, useNarrow } from '../../../../../kit'

/*
  Sample a sine wave at a chosen rate and rebuild the smoothest wave through the samples.
  Above the Nyquist limit (rate / 2) the rebuilt wave is a slower "alias".
  Everything is slowed down 1000× (Hz instead of kHz) so the wiggles are visible.
*/

const TWO_PI = 2 * Math.PI
const LOW_F = 2 // the optional second, slow tone
const LOW_A = 0.5

/** Where a frequency f lands after sampling at rate fs: folded into [0, fs/2]. sign = −1 means the wave comes back upside down. */
function fold(f: number, fs: number) {
  const k = Math.round(f / fs)
  const a = f - k * fs
  return { freq: Math.abs(a), sign: a < 0 ? -1 : 1 }
}

/** The wave a perfect reconstruction draws through the samples of A·sin(2π f t). */
function rebuilt(f: number, fs: number, amp: number) {
  const { freq, sign } = fold(f, fs)
  // exactly at the limit, every sample of a sine lands on a zero crossing: nothing survives
  if (Math.abs(freq - fs / 2) < 1e-9 && freq > 0) return () => 0
  return (t: number) => sign * amp * Math.sin(TWO_PI * freq * t)
}

export default function SamplingRateExplorer() {
  const [f, setF] = useState(3)
  const [fs, setFs] = useState(20)
  const [mix, setMix] = useState(false)
  const [ref, narrow] = useNarrow<HTMLDivElement>(480)

  const signal = (t: number) => Math.sin(TWO_PI * f * t) + (mix ? LOW_A * Math.sin(TWO_PI * LOW_F * t) : 0)
  const rHigh = rebuilt(f, fs, 1)
  const rLow = rebuilt(LOW_F, fs, LOW_A)
  const rec = (t: number) => rHigh(t) + (mix ? rLow(t) : 0)

  const n = Math.floor(fs) + 1 // samples at t = 0, 1/fs, …, 1
  const samples = Array.from({ length: n }, (_, i) => i / fs).filter((t) => t <= 1 + 1e-9)
  const nyq = fs / 2
  const { freq: seen } = fold(f, fs)
  const atLimit = Math.abs(f - nyq) < 1e-9
  const ok = f < nyq
  const yMax = mix ? 1.75 : 1.3

  let verdict: string
  if (ok) verdict = `captured: ${f} Hz is below the limit of ${nyq} Hz`
  else if (atLimit) verdict = `exactly at the limit: every sample lands on a zero crossing, so the wave vanishes`
  else verdict = `aliased: ${f} Hz is above ${nyq} Hz, so it comes back as a fake ${+seen.toFixed(2)} Hz`

  const fMaxAxis = 20

  return (
    <Figure
      title="Sample a wave, then rebuild it from the dots"
      caption={
        <>
          Grey: the real sound wave. Dots: the numbers the microphone stores. Orange dashed: the smoothest wave that passes through
          the dots, which is what any playback or model can recover. Lower the <b>sampling rate</b> below twice the wave's
          frequency and the orange wave turns into a slower, fake wave (an <b>alias</b>). Try 3 Hz at 4 samples per second, then
          5 Hz at exactly 10.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
      <Plot x={[0, 1]} y={[-yMax, yMax]} width={520} height={250} minHeight={210} margin={{ left: 34, right: 12, bottom: 32 }} ariaLabel={`A ${f} Hz sine wave sampled ${fs} times per second, with the wave rebuilt from the samples`}>
        <Grid xTicks={10} yTicks={4} />
        <Axes xLabel="time (s)" xTicks={5} yTicks={4} />
        <FnPath f={signal} color="var(--viz-muted)" width={6} opacity={0.55} samples={600} />
        <FnPath f={rec} color="var(--viz-2)" width={2.5} dash="7 5" samples={600} />
        {samples.map((t) => (
          <Path key={t} points={[[t, 0], [t, signal(t)]]} color="var(--viz-1)" width={1.5} opacity={0.6} />
        ))}
        <Dots points={samples.map((t) => ({ x: t, y: signal(t) }))} r={4.5} color="var(--viz-1)" />
      </Plot>

      <Plot x={[0, fMaxAxis]} y={[0, 1]} width={520} height={104} minHeight={104} margin={{ left: 34, right: 12, top: 26, bottom: 42 }} ariaLabel="Frequency line showing which frequencies this sampling rate can capture">
        <Rect x0={0} x1={Math.min(nyq, fMaxAxis)} y0={0} y1={1} fill="color-mix(in srgb, var(--viz-pos) 18%, transparent)" />
        <Axes xLabel="frequency (Hz)" xTicks={narrow ? 5 : 10} hideYTicks />
        {nyq <= fMaxAxis && <VLine x={nyq} color="var(--viz-pos)" dash="5 3" width={2} />}
        {nyq <= fMaxAxis && (
          <Label x={nyq} y={1} dy={-8} anchor={nyq > fMaxAxis * 0.7 ? 'end' : 'start'} color="var(--viz-pos)" size={11} weight={700}>
            {`limit = rate ÷ 2 = ${nyq} Hz`}
          </Label>
        )}
        {!ok && !atLimit && f <= fMaxAxis && seen <= fMaxAxis && <Arrow from={[f, 0.45]} to={[seen, 0.45]} color="var(--viz-2)" width={2} />}
        <Dots
          points={[
            { x: f, y: 0.45, color: 'var(--viz-muted)', r: 6, shape: 'square' },
            ...(!ok && !atLimit ? [{ x: seen, y: 0.45, color: 'var(--viz-2)', r: 6 }] : []),
            ...(mix ? [{ x: LOW_F, y: 0.45, color: 'var(--viz-muted)', r: 4.5, shape: 'square' as const }] : []),
          ]}
        />
        {f <= fMaxAxis && (
          <Label x={f} y={0.45} dx={9} dy={4} anchor="start" color="var(--ink-2)" size={11} weight={700}>
            {`${f} Hz`}
          </Label>
        )}
        {!ok && !atLimit && (
          <Label x={seen} y={0.45} dy={-10} anchor="middle" color="var(--viz-2)" size={11} weight={700}>
            {`alias ${+seen.toFixed(2)}`}
          </Label>
        )}
      </Plot>
      </div>

      <Controls>
        <Slider label="wave frequency" value={f} min={1} max={15} step={0.5} onChange={setF} format={(v) => `${v} Hz`} />
        <Slider label="sampling rate" value={fs} min={2} max={40} step={1} onChange={setFs} format={(v) => `${v} per second`} />
        <Toggle label={`Mix in a slow ${LOW_F} Hz tone`} checked={mix} onChange={setMix} />
        <Readout
          items={[
            ['Nyquist limit', `${nyq} Hz`],
            ['you hear', ok ? `${f} Hz` : atLimit ? 'silence' : `${+seen.toFixed(2)} Hz`],
          ]}
        />
      </Controls>
      <p style={{ margin: '0.4rem 0 0', fontSize: '0.92rem', color: ok ? 'var(--viz-pos)' : 'var(--viz-neg)', fontWeight: 600 }} aria-live="polite">
        {verdict}
        {mix && <span style={{ color: 'var(--ink-2)', fontWeight: 400 }}> · the slow {LOW_F} Hz tone {LOW_F < nyq ? 'survives' : 'is lost too'}</span>}
      </p>
      <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--ink-2)' }}>
        {ok ? (
          <>
            Below the limit, the nearest whole multiple of the rate is 0, so the wave stays where it is:{' '}
            <M>{`|${f} - 0 \\times ${fs}| = ${f}`}</M> Hz.
          </>
        ) : atLimit ? (
          <>
            At exactly half the rate, <M>f</M> sits halfway between 0 and the rate, and a sine's samples all land on zero crossings.
          </>
        ) : (
          <>
            Fake frequency = distance from <M>f</M> to the nearest whole multiple of the rate:{' '}
            <M>{`|${f} - ${Math.round(f / fs)} \\times ${fs}| = ${+seen.toFixed(2)}`}</M> Hz.
          </>
        )}
      </p>
    </Figure>
  )
}
