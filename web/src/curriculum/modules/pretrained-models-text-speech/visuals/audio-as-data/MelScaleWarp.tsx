import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Grid, Axes, FnPath, Path, DraggablePoint, Rect, Dots, VLine, M } from '../../../../../kit'
import { HaloLabel as Label } from './HaloLabel'
import { hzToMel, melToHz } from './dsp'

/*
  The mel scale: drag a fixed-size step in Hz along the curve and watch how big a step in perceived pitch
  (mel) it is: huge at low frequencies, tiny at high ones. Below: the triangular mel filterbank that turns
  hundreds of FFT rows into a few dozen mel rows.
*/

const F_TOP = 8000 // speech models usually use 16 kHz audio, so frequencies go up to 8 kHz
const M_TOP = 3000

export default function MelScaleWarp() {
  const [f0, setF0] = useState(200)
  const [step, setStep] = useState(1000)
  const [nMels, setNMels] = useState(20)
  const mMax = hzToMel(F_TOP)
  const start = Math.min(f0, F_TOP - step)
  const f1 = start + step
  const m0 = hzToMel(start)
  const m1 = hzToMel(f1)
  const dMel = m1 - m0
  const share = (dMel / mMax) * 100

  // triangle corners for each filter: [lo, centre, hi] in Hz
  const tris = useMemo(() => {
    const edges = Array.from({ length: nMels + 2 }, (_, i) => melToHz((mMax * i) / (nMels + 1)))
    return Array.from({ length: nMels }, (_, m) => [edges[m], edges[m + 1], edges[m + 2]] as const)
  }, [nMels, mMax])
  const below1k = tris.filter(([, c]) => c < 1000).length
  // the filter that responds most strongly to the start of the step
  let hit = -1
  let best = 0
  tris.forEach(([lo, c, hi], i) => {
    const w = start <= lo || start >= hi ? 0 : start <= c ? (start - lo) / (c - lo) : (hi - start) / (hi - c)
    if (w > best) {
      best = w
      hit = i
    }
  })
  const widthAt = hit >= 0 ? tris[hit][2] - tris[hit][0] : 0
  const kHz = (v: number) => (v >= 1000 ? `${v / 1000}k` : String(v))

  return (
    <Figure
      title="The mel scale: equal steps in Hz are not equal steps in pitch"
      caption={
        <>
          Drag the blue dot. The orange band along the bottom is always the same width in Hz, but the band it makes on the mel axis
          (roughly "how different the two pitches sound") shrinks as you move right. With 1,000 Hz steps, the first step takes a third of
          the whole mel axis and the last takes about a twentieth. The triangles below are the <b>mel filters</b>: each adds up the energy
          under it to make one row of a mel spectrogram, so the narrow low filters keep fine detail where speech needs it.
        </>
      }
    >
      <Plot x={[0, F_TOP]} y={[0, M_TOP]} width={520} height={240} minHeight={250} margin={{ left: 46, right: 14, top: 26, bottom: 40 }} ariaLabel={`The mel scale curve. A ${step} Hz step from ${start} Hz covers ${dMel.toFixed(0)} mel`}>
        <Grid xTicks={8} yTicks={6} />
        {/* projections of the step onto both axes */}
        <Rect x0={start} x1={f1} y0={0} y1={m1} fill="color-mix(in srgb, var(--viz-2) 13%, transparent)" />
        <Rect x0={0} x1={start} y0={m0} y1={m1} fill="color-mix(in srgb, var(--viz-2) 22%, transparent)" />
        <Rect x0={start} x1={f1} y0={0} y1={70} fill="var(--viz-2)" />
        <Rect x0={0} x1={110} y0={m0} y1={m1} fill="var(--viz-2)" />
        <Axes xLabel="frequency (Hz)" yLabel="mel" xTicks={4} yTicks={6} tickFormat={kHz} />
        <FnPath f={hzToMel} color="var(--viz-1)" width={2.5} />
        <FnPath f={hzToMel} domain={[start, f1]} color="var(--viz-2)" width={6} />
        <Dots points={[{ x: 1000, y: 1000, color: 'var(--viz-muted)', r: 3.5 }, { x: f1, y: m1, color: 'var(--viz-2)', r: 6 }]} />
        <Label x={1000} y={1000} dx={8} dy={16} color="var(--ink-2)" size={11} weight={600}>
          1,000 Hz = 1,000 mel
        </Label>
        <Label x={F_TOP} y={M_TOP} dx={-2} dy={-10} anchor="end" color="var(--viz-2)" size={13}>
          {`${start} → ${f1} Hz  =  Δ ${dMel.toFixed(0)} mel`}
        </Label>
        <DraggablePoint
          x={start}
          y={m0}
          color="var(--viz-1)"
          label="drag"
          lockY
          constrain={(x) => {
            const fx = Math.max(0, Math.min(F_TOP - step, Math.round(x / 50) * 50))
            return [fx, hzToMel(fx)]
          }}
          onChange={(x) => setF0(x)}
        />
      </Plot>

      <Plot x={[0, F_TOP]} y={[0, 1.08]} width={520} height={150} minHeight={150} margin={{ left: 46, right: 14, top: 26, bottom: 40 }} ariaLabel={`${nMels} triangular mel filters spread over 0 to 8000 Hz`}>
        {tris.map(([lo, c, hi], i) => (
          <Path
            key={i}
            points={[
              [lo, 0],
              [c, 1],
              [hi, 0],
            ]}
            closed
            color={i === hit ? 'var(--viz-2)' : i % 2 ? 'var(--viz-1)' : 'var(--viz-5)'}
            width={i === hit ? 2.5 : 1.2}
            fill={i === hit ? 'color-mix(in srgb, var(--viz-2) 30%, transparent)' : 'color-mix(in srgb, var(--viz-1) 7%, transparent)'}
          />
        ))}
        <VLine x={start} color="var(--viz-1)" dash="4 3" width={1.5} />
        <Axes xLabel="frequency (Hz)" xTicks={4} hideYTicks tickFormat={kHz} />
        <Label x={F_TOP} y={1.08} dx={-2} dy={-10} anchor="end" color="var(--ink-2)" size={11}>
          {`${nMels} mel filters · highlighted one is ${widthAt.toFixed(0)} Hz wide`}
        </Label>
      </Plot>

      <Controls>
        <Segmented
          label="step size"
          value={step}
          onChange={(v) => setStep(v)}
          options={[
            { value: 100, label: '100 Hz' },
            { value: 500, label: '500 Hz' },
            { value: 1000, label: '1,000 Hz' },
          ]}
        />
        <Slider label="number of mel filters" value={nMels} min={8} max={40} step={1} onChange={setNMels} />
        <Readout
          items={[
            ['step', `${start} → ${f1} Hz`],
            ['in mel', `${m0.toFixed(0)} → ${m1.toFixed(0)}`],
            ['share of mel axis', `${share.toFixed(1)}%`],
            ['filters below 1 kHz', `${below1k} of ${nMels}`],
          ]}
        />
      </Controls>
      <p style={{ margin: '0.4rem 0 0', fontSize: '0.88rem', color: 'var(--ink-2)' }}>
        <M>{`\\text{mel}(f) = 2595 \\log_{10}\\!\\left(1 + \\frac{f}{700}\\right)`}</M>. The bottom eighth of the Hz range (0 to 1 kHz) gets {below1k} of the {nMels} filters.
      </p>
    </Figure>
  )
}
