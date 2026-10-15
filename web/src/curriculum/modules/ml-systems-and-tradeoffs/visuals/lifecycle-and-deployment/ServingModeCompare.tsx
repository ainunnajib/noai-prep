import { useState } from 'react'
import { Figure, Controls, Readout, Segmented, Plot, Path, Rect, Dots, Label, VLine, useNarrow } from '../../../../../kit'

/*
  Batch versus real-time serving on one day's timeline (x = hours; 24–27 is 00:00–03:00 the next day).
  Batch: one scheduled job 02:00–03:00 scores everything it already knows and writes a table.
    - If the input exists in advance (stores' sales history, users' viewing history), a request is
      answered instantly by looking the prediction up (it may be up to a day old).
    - If the input only exists at request time (a payment, a ride booking), it has to wait for the
      next job, which ends at 03:00 tomorrow.
  Real-time: a server is always on and answers each request in tens of milliseconds.
  Compute paid: batch ≈ 1 machine-hour a day; real-time = 24 machine-hours (one server always on).
  These are round illustrative numbers; the point is the shape of the trade-off.
*/

type Scn = 'fraud' | 'report' | 'eta' | 'recs'
type Mode = 'batch' | 'live'

interface Scenario {
  label: string
  need: string
  inputAhead: boolean
  times: number[]
  limit: string
  batchVerdict: string
  liveVerdict: string
  batchOk: boolean
}

const SC: Record<Scn, Scenario> = {
  fraud: {
    label: 'card fraud check',
    need: 'Approve or block a card payment while the customer is tapping: within about 0.2 s. The payment does not exist until it happens.',
    inputAhead: false,
    times: [7.2, 8.6, 12.4, 12.9, 17.8, 19.5, 21.3],
    limit: '≈ 0.2 s',
    batchOk: false,
    batchVerdict: 'Fails: each payment waits for tomorrow’s 02:00 job. The fraudster is long gone.',
    liveVerdict: 'Meets it: every payment is scored in tens of milliseconds, using the payment’s own details.',
  },
  report: {
    label: 'weekly sales forecast',
    need: 'A sales forecast for every store, needed by 09:00 on Monday. All inputs (last week’s sales) are known the night before.',
    inputAhead: true,
    times: [9],
    limit: 'by 09:00',
    batchOk: true,
    batchVerdict: 'Meets it, cheaply: the job finishes at 03:00, six hours early, and the machine is then switched off.',
    liveVerdict: 'Meets it, but you pay for a server all day (and all week) to answer one request.',
  },
  eta: {
    label: 'ride-hailing ETA',
    need: 'Show the arrival time the moment a rider books: within about 1 s. It depends on the driver’s live position and the traffic right now.',
    inputAhead: false,
    times: [6.8, 8.1, 9.0, 13.3, 18.2, 22.6],
    limit: '≈ 1 s',
    batchOk: false,
    batchVerdict: 'Fails: the booking waits for tomorrow’s job, and last night’s traffic says nothing about now.',
    liveVerdict: 'Meets it: each booking is scored with the live position and traffic.',
  },
  recs: {
    label: 'home-screen picks',
    need: 'Suggested shows on the app’s home screen when a user opens it. Yesterday’s viewing history is good enough.',
    inputAhead: true,
    times: [7.5, 12.2, 20.4, 21.9, 23.1],
    limit: 'instant, a day old is fine',
    batchOk: true,
    batchVerdict: 'Meets it: picks for every user were computed at 02:00; opening the app just looks them up.',
    liveVerdict: 'Meets it, at 24× the compute. Worth it only if what the user did a minute ago must count.',
  },
}

const JOB: [number, number][] = [
  [2, 3],
  [26, 27],
]
const hh = (h: number) => {
  const m = Math.round((h % 24) * 60)
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

export default function ServingModeCompare() {
  const [scn, setScn] = useState<Scn>('fraud')
  const [mode, setMode] = useState<Mode>('batch')
  const [ref, narrow] = useNarrow<HTMLDivElement>(520)
  const s = SC[scn]
  const live = mode === 'live'
  const yReq = 3.5
  const yAns = 2.3
  const yCmp = 0.6

  // when is each request answered?
  const answer = (t: number) => (live || s.inputAhead ? t : t < 3 ? 3 : 27)
  const waits = s.times.map((t) => answer(t) - t)
  const worst = Math.max(...waits)
  const ok = live || s.batchOk
  const verdict = live ? s.liveVerdict : s.batchVerdict

  const ticks = narrow ? [0, 6, 12, 18, 24] : [0, 3, 6, 9, 12, 15, 18, 21, 24, 27]

  return (
    <Figure
      wide
      title="Batch or real-time serving?"
      caption={
        <>
          Pick a use case, then flip between <b>batch</b> (one scheduled job at 02:00) and <b>real-time</b> (a server that is always on). Each dot on the top row is a request; the line drops to
          when its prediction is ready. Notice that batch fails exactly when the input <i>only exists at request time</i>, and that real-time always works but costs 24 machine-hours a day.
          (Times and costs are round illustrative numbers.)
        </>
      }
    >
      <div style={{ width: '100%', fontSize: 14, lineHeight: 1.45, color: 'var(--ink-2)', background: 'var(--surface-2)', borderRadius: 10, padding: '0.5rem 0.75rem' }}>
        <b style={{ color: 'var(--ink)' }}>Requirement:</b> {s.need}
      </div>
      <div ref={ref} style={{ width: '100%' }}>
        <Plot x={[0, 27]} y={[0, 4.2]} width={600} height={220} minHeight={250} margin={{ left: 12, right: 12, top: 8, bottom: 26 }} ariaLabel={`Timeline of requests and when they are answered, ${live ? 'real-time' : 'batch'} serving`}>
          {/* next-day shading */}
          <Rect x0={24} x1={27} y0={0} y1={4.2} fill="var(--surface-2)" />
          {!narrow && (
            <Label x={25.5} y={4.2} dy={14} anchor="middle" size={11} color="var(--ink-3)">
              next day
            </Label>
          )}
          {ticks.map((t) => (
            <g key={t}>
              <VLine x={t} color="var(--viz-grid)" dash="0" width={1} />
              <Label x={t} y={0} dy={17} anchor="middle" size={11.5} color="var(--ink-3)">
                {hh(t)}
              </Label>
            </g>
          ))}
          <Label x={0.3} y={yReq + 0.42} size={12} color="var(--ink-2)" weight={750}>
            requests
          </Label>
          <Label x={0.3} y={yAns - 0.42} dy={8} size={12} color="var(--ink-2)" weight={750}>
            prediction ready
          </Label>
          <Label x={0.3} y={yCmp + 0.42} size={12} color="var(--ink-2)" weight={750}>
            compute you pay for
          </Label>
          {/* compute row */}
          {live ? (
            <Rect x0={0} x1={27} y0={yCmp - 0.22} y1={yCmp + 0.22} fill="color-mix(in srgb, var(--viz-4) 55%, var(--surface))" rx={4} />
          ) : (
            JOB.map(([a, b]) => <Rect key={a} x0={a} x1={b} y0={yCmp - 0.22} y1={yCmp + 0.22} fill="color-mix(in srgb, var(--viz-1) 60%, var(--surface))" rx={4} />)
          )}
          {!live && (
            <Label x={3.2} y={yCmp} dy={4} size={11.5} color="var(--viz-1)" weight={700}>
              batch job 02:00–03:00
            </Label>
          )}
          {live && (
            <Label x={26.7} y={yCmp + 0.42} anchor="end" size={11.5} color="var(--viz-4)" weight={750}>
              server always on
            </Label>
          )}
          {/* request → answer lines */}
          {s.times.map((t, i) => {
            const a = answer(t)
            const late = a - t > 0.01
            return <Path key={i} points={[[t, yReq], [a, yAns]]} color={late ? 'var(--bad)' : 'var(--ok)'} width={late ? 1.6 : 2} dash={late ? '4 3' : undefined} opacity={0.9} />
          })}
          <Dots points={s.times.map((t) => ({ x: t, y: yReq, r: 6, color: 'var(--viz-2)' }))} />
          <Dots
            points={s.times.map((t) => {
              const a = answer(t)
              return { x: a, y: yAns, r: 5, color: a - t > 0.01 ? 'var(--bad)' : 'var(--ok)', shape: 'square' as const }
            })}
          />
          {scn === 'report' && (
            <Label x={9} y={yReq} dx={9} dy={4} size={11.5} color="var(--viz-2)" weight={700}>
              deadline 09:00
            </Label>
          )}
          {!live && s.inputAhead && scn !== 'report' && (
            <Label x={23.7} y={yAns - 0.42} dy={8} anchor="end" size={11.5} color="var(--ok)" weight={700}>
              looked up instantly
            </Label>
          )}
          {!live && !s.inputAhead && (
            <Label x={26.8} y={yAns - 0.42} dy={8} anchor="end" size={11.5} color="var(--bad)" weight={700}>
              all ready 03:00 tomorrow
            </Label>
          )}
          {scn === 'report' && !live && (
            <Label x={3} y={yAns} dx={8} dy={-9} size={11.5} color="var(--ok)" weight={700}>
              ready at 03:00
            </Label>
          )}
        </Plot>
      </div>
      <div
        role="status"
        style={{
          width: '100%',
          padding: '0.45rem 0.7rem',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 650,
          background: ok ? 'var(--ok-soft)' : 'var(--bad-soft)',
          color: ok ? 'var(--ok)' : 'var(--bad)',
        }}
      >
        {verdict}
      </div>
      <Controls>
        <Segmented
          label="Use case"
          value={scn}
          onChange={setScn}
          options={(Object.keys(SC) as Scn[]).map((k) => ({ value: k, label: SC[k].label }))}
        />
        <Segmented
          label="Serving mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'batch', label: 'batch' },
            { value: 'live', label: 'real-time' },
          ]}
        />
      </Controls>
      <Readout
        items={[
          ['required', s.limit],
          ['slowest answer', live ? '≈ 0.05 s' : s.inputAhead ? (scn === 'report' ? '6 h early' : 'instant (lookup)') : `${worst.toFixed(1)} h`],
          ['uses data from', live ? 'right now' : 'last night'],
          ['compute paid', live ? '24 machine-h / day' : '≈ 1 machine-h / day'],
        ]}
      />
    </Figure>
  )
}
