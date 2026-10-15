import { useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Button, Plot, Axes, Grid, FnPath, Path, Rect, HLine, M } from '../../../../../kit'
import { HaloLabel as Label } from './HaloLabel'

/*
  "Be the Fourier transform." Multiply the sound by a test wave (a probe) and average the product.
  The average is big only when the probe's frequency is really inside the sound.
  Sound: 1.0·cos(2π·3t) + 0.5·cos(2π·7t), optionally with the 7 Hz part shifted by a quarter cycle.
*/

const TWO_PI = 2 * Math.PI
const N = 400 // points used for the sums (exact for whole-number frequencies over 1 s)
const K_MAX = 12

export default function FourierProbe() {
  const [k, setK] = useState(3)
  const [probe, setProbe] = useState<'cos' | 'sin'>('cos')
  const [shift, setShift] = useState(false)
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0, 1, 2, 3]))
  const [scanning, setScanning] = useState(false)

  const phase = shift ? Math.PI / 2 : 0
  const sound = (t: number) => Math.cos(TWO_PI * 3 * t) + 0.5 * Math.cos(TWO_PI * 7 * t - phase)
  const probeFn = (t: number) => (probe === 'cos' ? Math.cos(TWO_PI * k * t) : Math.sin(TWO_PI * k * t))
  const prod = (t: number) => sound(t) * probeFn(t)

  // a_k and b_k for every probe frequency: (2/N) Σ x·cos and (2/N) Σ x·sin
  const coeffs = useMemo(
    () =>
      Array.from({ length: K_MAX + 1 }, (_, kk) => {
        let a = 0
        let b = 0
        for (let i = 0; i < N; i++) {
          const t = i / N
          const x = Math.cos(TWO_PI * 3 * t) + 0.5 * Math.cos(TWO_PI * 7 * t - phase)
          a += x * Math.cos(TWO_PI * kk * t)
          b += x * Math.sin(TWO_PI * kk * t)
        }
        const scale = kk === 0 ? 1 / N : 2 / N
        const ra = Math.abs(a * scale) < 1e-9 ? 0 : a * scale
        const rb = Math.abs(b * scale) < 1e-9 ? 0 : b * scale
        return { a: ra, b: rb, s: Math.hypot(ra, rb) }
      }),
    [phase],
  )
  const cur = coeffs[k]
  const avg2 = probe === 'cos' ? cur.a : cur.b

  const pick = (v: number) => {
    setK(v)
    setVisited((s) => (s.has(v) ? s : new Set(s).add(v)))
  }

  useEffect(() => {
    if (!scanning) return
    const id = window.setInterval(() => {
      setK((prev) => {
        const nx = prev >= K_MAX ? K_MAX : prev + 1
        setVisited((s) => (s.has(nx) ? s : new Set(s).add(nx)))
        if (nx >= K_MAX) setScanning(false)
        return nx
      })
    }, 420)
    return () => window.clearInterval(id)
  }, [scanning])

  // product curve split into positive and negative areas
  const pts = Array.from({ length: 401 }, (_, i) => i / 400)
  const posArea: [number, number][] = [[0, 0], ...pts.map((t) => [t, Math.max(0, prod(t))] as [number, number]), [1, 0]]
  const negArea: [number, number][] = [[0, 0], ...pts.map((t) => [t, Math.min(0, prod(t))] as [number, number]), [1, 0]]

  const fmt = (v: number) => (Math.abs(v) < 0.005 ? '0.00' : v.toFixed(2))

  return (
    <Figure
      title="Be the Fourier transform: hunt for hidden frequencies"
      caption={
        <>
          The blue sound secretly mixes a 3 Hz wave and a quieter 7 Hz wave. Slide the orange <b>probe</b> wave through 0 to 12 Hz.
          Multiply sound × probe point by point: when the probe matches a hidden wave, the product stays mostly above zero (green) and
          its average is large; otherwise green and red cancel. Each probe you try adds a bar to the spectrum. Then shift the 7 Hz
          wave: the cosine probe misses it, but the sine probe catches it, which is why the real transform uses both.
        </>
      }
    >
      <Plot x={[0, 1]} y={[-2.2, 2.2]} width={520} height={160} minHeight={150} margin={{ left: 34, right: 12, top: 12, bottom: 26 }} ariaLabel="The sound wave and the probe wave">
        <Grid xTicks={10} yTicks={2} />
        <Axes xTicks={5} yTicks={2} />
        <FnPath f={probeFn} color="var(--viz-2)" width={2} dash="6 4" samples={500} />
        <FnPath f={sound} color="var(--viz-1)" width={2.5} samples={500} />
        <Label x={0.01} y={2.2} dy={12} color="var(--viz-1)" size={12} weight={700}>
          sound
        </Label>
        <Label x={0.99} y={2.2} dy={12} anchor="end" color="var(--viz-2)" size={12} weight={700}>
          {`probe: ${probe}(2π·${k}·t)`}
        </Label>
      </Plot>

      <Plot x={[0, 1]} y={[-1.6, 2.1]} width={520} height={150} minHeight={140} margin={{ left: 34, right: 12, top: 12, bottom: 40 }} ariaLabel="Sound times probe, with positive area green and negative area red">
        <Path points={posArea} closed fill="color-mix(in srgb, var(--viz-pos) 38%, transparent)" color="none" width={0} />
        <Path points={negArea} closed fill="color-mix(in srgb, var(--viz-neg) 38%, transparent)" color="none" width={0} />
        <FnPath f={prod} color="var(--viz-ink)" width={1.5} samples={500} />
        <HLine y={avg2 / 2} color="var(--viz-ink)" dash="5 3" width={2} />
        <Axes xLabel="time (s)" xTicks={5} yTicks={2} />
        <Label x={0.01} y={2.1} dy={12} color="var(--ink-2)" size={12} weight={700}>
          sound × probe
        </Label>
        <Label x={0.99} y={2.1} dy={12} anchor="end" color="var(--viz-ink)" size={12} weight={700}>
          {`average (dashed) = ${fmt(avg2 / 2)}`}
        </Label>
      </Plot>

      <Plot x={[-0.5, K_MAX + 0.5]} y={[0, 1.3]} width={520} height={150} minHeight={140} margin={{ left: 34, right: 12, top: 14, bottom: 40 }} ariaLabel="Spectrum built from the probes tried so far">
        <Grid xTicks={12} yTicks={2} />
        {coeffs.map((c, i) =>
          visited.has(i) ? (
            <Rect key={i} x0={i - 0.32} x1={i + 0.32} y0={0} y1={c.s} fill={i === k ? 'var(--viz-2)' : 'var(--viz-1)'} />
          ) : (
            <Rect key={i} x0={i - 0.32} x1={i + 0.32} y0={0} y1={0.04} fill="var(--viz-grid)" />
          ),
        )}
        <Rect x0={k - 0.45} x1={k + 0.45} y0={0} y1={1.1} fill="none" stroke="var(--viz-2)" />
        <Axes xLabel="probe frequency (Hz)" xTicks={12} yTicks={2} />
        <Label x={-0.4} y={1.3} dy={10} color="var(--ink-2)" size={12} weight={700}>
          strength (the spectrum)
        </Label>
      </Plot>

      <Controls>
        <Slider label="probe frequency" value={k} min={0} max={K_MAX} step={1} onChange={pick} format={(v) => `${v} Hz`} />
        <Segmented
          label="probe"
          value={probe}
          onChange={setProbe}
          options={[
            { value: 'cos', label: 'cosine' },
            { value: 'sin', label: 'sine' },
          ]}
        />
        <Toggle label="Shift the 7 Hz wave by a quarter cycle" checked={shift} onChange={setShift} />
        <Button onClick={() => (setK(0), setVisited(new Set([0])), setScanning(true))} disabled={scanning}>
          {scanning ? 'Scanning…' : 'Scan 0 → 12 Hz'}
        </Button>
        <Readout
          items={[
            ['a (cos)', fmt(cur.a)],
            ['b (sin)', fmt(cur.b)],
            ['strength', fmt(cur.s)],
          ]}
        />
      </Controls>
      <p style={{ margin: '0.4rem 0 0', fontSize: '0.88rem', color: 'var(--ink-2)' }}>
        Strength at {k} Hz: <M>{`\\sqrt{a^2 + b^2} = \\sqrt{${fmt(cur.a)}^2 + ${fmt(cur.b)}^2} = ${fmt(cur.s)}`}</M>, where <M>a</M> and <M>b</M> are twice the
        average of sound × cosine and sound × sine.
      </p>
    </Figure>
  )
}
