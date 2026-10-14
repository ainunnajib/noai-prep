import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Button, Plot, Grid, Axes, FnPath, Path, Dots, Label, VLine, HLine, useNarrow } from '../../../../../kit'

/*
  A simple half-life model of memory for ONE topic you learn on day 0.
    retention R(t) = 2^(−Δ/h): Δ = days since the last review, h = half-life in days.
  Each review resets R to 100% and multiplies the half-life by g = 1 + k(1 − R), where R is the
  retention just before the review: k = 3 if you test yourself, k = 1 if you only re-read.
  So reviewing when you have forgotten more (but not everything) grows the half-life more.
  The numbers are illustrative; the shapes match what memory research finds.
  Day 60 = Prelim and day 74 = Final if you first learn the topic on 21 Dec 2026.
*/

const H0 = 2
const END = 80
const PRELIM_DAY = 60
const FINAL_DAY = 74

type Mode = 'test' | 'reread'
const K: Record<Mode, number> = { test: 3, reread: 1 }

const PRESETS = {
  none: [] as number[],
  cram: [59],
  spaced: [2, 7, 19, 50],
  both: [2, 7, 19, 50, 59],
}
type Preset = keyof typeof PRESETS | 'custom'

interface Ev {
  day: number
  before: number
  h: number
}

function run(reviews: number[], k: number) {
  const days = [...reviews].sort((a, b) => a - b)
  let h = H0
  let last = 0
  const evs: Ev[] = []
  for (const d of days) {
    const before = 2 ** (-(d - last) / h)
    h = h * (1 + k * (1 - before))
    evs.push({ day: d, before, h })
    last = d
  }
  const at = (t: number) => {
    let hh = H0
    let ll = 0
    for (const e of evs) {
      if (e.day <= t) {
        hh = e.h
        ll = e.day
      }
    }
    return 2 ** (-(t - ll) / hh)
  }
  // the curve, with a vertical jump back to 100% at every review
  const pts: [number, number][] = []
  let s = 0
  let hh = H0
  for (const seg of [...evs.map((e) => e.day), END]) {
    for (let t = s; t < seg; t += 0.25) pts.push([t, 2 ** (-(t - s) / hh)])
    pts.push([seg, 2 ** (-(seg - s) / hh)])
    const e = evs.find((x) => x.day === seg)
    if (e) {
      pts.push([seg, 1])
      hh = e.h
      s = seg
    }
  }
  return { evs, at, pts, h: evs.length ? evs[evs.length - 1].h : H0 }
}

const pct = (v: number) => `${Math.round(v * 100)}%`

export default function ForgettingCurve() {
  const [reviews, setReviews] = useState<number[]>(PRESETS.spaced)
  const [preset, setPreset] = useState<Preset>('spaced')
  const [mode, setMode] = useState<Mode>('test')
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const m = useMemo(() => run(reviews, K[mode]), [reviews, mode])
  const rP = m.at(PRELIM_DAY)
  const rF = m.at(FINAL_DAY)

  const choose = (p: Preset) => {
    setPreset(p)
    if (p !== 'custom') setReviews(PRESETS[p])
  }
  const click = ([x]: [number, number]) => {
    const d = Math.round(x)
    if (d < 1 || d > END - 1) return
    setPreset('custom')
    setReviews((rs) => (rs.some((r) => Math.abs(r - d) <= 1) ? rs.filter((r) => Math.abs(r - d) > 1) : [...rs, d].sort((a, b) => a - b)))
  }

  return (
    <Figure
      title="Forgetting, and how reviews slow it down"
      caption={
        <>
          Click on the chart to add a review on that day (click a review again to remove it), or use the presets. Compare <strong>Cram</strong> (one review the night before) with{' '}
          <strong>Spaced</strong>: both look fine on Prelim day, but only the spaced reviews still hold two weeks later at the Final. Then switch to <strong>Re-read</strong> and see
          how much less each review buys you. (A simplified model of one topic; the numbers are illustrative, the shapes are real.)
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <Plot
          x={[0, END]}
          y={[0, 1.08]}
          width={660}
          height={300}
          minHeight={270}
          margin={{ left: 44, right: 12, top: 22, bottom: 36 }}
          ariaLabel={`Retention of one topic over ${END} days with reviews on days ${reviews.join(', ') || 'none'}. Retention is ${pct(rP)} on Prelim day and ${pct(rF)} on Final day.`}
          onPointerDown={(p) => click(p)}
        >
          <Grid xTicks={8} yTicks={4} />
          <Axes xLabel="days since you first learnt it" yLabel="remembered" xTicks={narrow ? 4 : 8} hideYTicks />
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <Label key={v} x={0} y={v} dx={-7} dy={4} anchor="end" color="var(--ink-3)" size={11.5}>
              {`${v * 100}%`}
            </Label>
          ))}
          <HLine y={0.5} color="var(--viz-muted)" dash="3 4" width={1} />
          {!narrow && (
            <Label x={40} y={0.5} dy={14} anchor="middle" color="var(--ink-3)" size={11}>
              half forgotten
            </Label>
          )}
          <VLine x={PRELIM_DAY} color="var(--viz-1)" dash="5 4" width={1.5} />
          <VLine x={FINAL_DAY} color="var(--viz-3)" dash="5 4" width={1.5} />
          <Label x={PRELIM_DAY} y={1.08} dx={-4} dy={11} anchor="end" color="var(--viz-1)" size={12} weight={800}>
            Prelim
          </Label>
          <Label x={FINAL_DAY} y={1.08} dx={-4} dy={11} anchor="end" color="var(--viz-3)" size={12} weight={800}>
            Final
          </Label>
          {/* no-review reference */}
          <FnPath f={(t) => 2 ** (-t / H0)} color="var(--viz-muted)" width={1.5} dash="4 4" />
          {/* review markers */}
          {m.evs.map((e) => (
            <g key={e.day}>
              <Path points={[[e.day, 0], [e.day, 1]]} color="var(--viz-2)" width={1.2} dash="2 3" />
              {!narrow && reviews.length <= 6 && (
                <Label x={e.day} y={0} dx={3} dy={-5} color="var(--viz-2)" size={10.5} weight={700}>
                  {`h=${e.h < 10 ? e.h.toFixed(1) : Math.round(e.h)}d`}
                </Label>
              )}
            </g>
          ))}
          <Path points={m.pts} color={mode === 'test' ? 'var(--viz-4)' : 'var(--viz-5)'} width={2.6} />
          <Dots points={m.evs.map((e) => ({ x: e.day, y: 1, color: 'var(--viz-2)', r: 5, shape: 'triangle' as const }))} />
          <Dots
            points={[
              { x: PRELIM_DAY, y: rP, color: 'var(--viz-1)', r: 6 },
              { x: FINAL_DAY, y: rF, color: 'var(--viz-3)', r: 6 },
            ]}
          />
          <Label x={PRELIM_DAY} y={rP} dx={-9} dy={rP > 0.9 ? 16 : -8} anchor="end" color="var(--viz-1)" size={13} weight={800}>
            {pct(rP)}
          </Label>
          <Label x={FINAL_DAY} y={rF} dx={9} dy={rF > 0.9 ? 16 : -8} color="var(--viz-3)" size={13} weight={800}>
            {pct(rF)}
          </Label>
        </Plot>
      </div>
      <Controls>
        <Segmented
          label="Reviews"
          value={preset}
          onChange={choose}
          options={[
            { value: 'none', label: 'None' },
            { value: 'cram', label: narrow ? 'Cram' : 'Cram the night before' },
            { value: 'spaced', label: 'Spaced' },
            { value: 'both', label: narrow ? 'Both' : 'Spaced + night before' },
          ]}
        />
        <Segmented
          label="How you review"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'test', label: 'Test yourself' },
            { value: 'reread', label: 'Re-read' },
          ]}
        />
      </Controls>
      <Readout
        items={[
          ['reviews on days', reviews.length ? reviews.join(', ') : 'none'],
          ['remembered on Prelim day', pct(rP)],
          ['on Final day', pct(rF)],
          ['half-life now', `${m.h < 10 ? m.h.toFixed(1) : Math.round(m.h)} days`],
        ]}
      />
      {reviews.length > 0 && (
        <Button
          onClick={() => {
            setReviews([])
            setPreset('none')
          }}
        >
          Clear all reviews
        </Button>
      )}
    </Figure>
  )
}
