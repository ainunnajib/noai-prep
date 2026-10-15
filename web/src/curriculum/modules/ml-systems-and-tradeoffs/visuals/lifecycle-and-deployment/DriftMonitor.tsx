import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Button, Plot, Axes, Rect, Path, Dots, HLine, VLine, Label, useBump } from '../../../../../kit'
import { simulate, alerts, REF, START, LABEL_DELAY, WEEKS, type DriftKind, type Week } from './driftData'

/*
  A monitoring dashboard for a deployed loan-approval model (data from driftData.ts).
  Three signals per week, each with an alert band = reference ± k × its normal weekly wobble (SE):
    1. input: the income distribution of applicants (bar = middle 50%, whiskers = middle 80%, dot = mean)
    2. prediction: the approval rate
    3. outcome: the default rate of approved loans, known only LABEL_DELAY = 12 weeks later
*/

const KINDS: { value: DriftKind; label: string }[] = [
  { value: 'none', label: 'no drift' },
  { value: 'data-gradual', label: 'gradual data drift' },
  { value: 'data-sudden', label: 'sudden data drift' },
  { value: 'concept', label: 'concept drift' },
]

const BAND = 'color-mix(in srgb, var(--viz-3) 20%, transparent)'

function Panel({ title, note, children }: { title: ReactNode; note?: ReactNode; children: ReactNode }) {
  return (
    <div style={{ width: '100%', display: 'grid', gap: 2 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0 12px', fontSize: 13.5, fontWeight: 750, color: 'var(--ink)' }}>
        <span>{title}</span>
        {note && <span style={{ fontWeight: 600, color: 'var(--ink-3)', fontSize: 12.5 }}>{note}</span>}
      </div>
      {children}
    </div>
  )
}

function Light({ label, week, raisedAt, pending }: { label: string; week: number | null; raisedAt?: number | null; pending?: boolean }) {
  const on = week !== null
  return (
    <div
      style={{
        flex: '1 1 150px',
        padding: '0.4rem 0.6rem',
        borderRadius: 9,
        border: `1.5px solid ${on ? 'var(--bad)' : 'var(--rule)'}`,
        background: on ? 'var(--bad-soft)' : 'var(--surface-2)',
        fontSize: 12.5,
        lineHeight: 1.35,
      }}
    >
      <div style={{ fontWeight: 750, color: 'var(--ink-2)' }}>{label}</div>
      <div style={{ fontWeight: 800, color: on ? 'var(--bad)' : 'var(--ink-3)' }}>
        {on ? (raisedAt ? `ALERT in week ${raisedAt} (loans of week ${week})` : `ALERT since week ${week}`) : pending ? 'quiet (labels still arriving)' : 'quiet'}
      </div>
    </div>
  )
}

const pct = (v: number) => `${(v * 100).toFixed(1)}%`

export default function DriftMonitor() {
  const [kind, setKind] = useState<DriftKind>('data-gradual')
  const [today, setToday] = useState(16)
  const [k, setK] = useState(3)
  const [seed, bump] = useBump()
  const data = useMemo(() => simulate(kind, seed), [kind, seed])
  const al = useMemo(() => alerts(data, k), [data, k])

  const seen = data.filter((d) => d.w <= today)
  const labelled = data.filter((d) => d.w + LABEL_DELAY <= today)
  const firstIn = (ws: number[], last: number) => ws.find((w) => w <= last) ?? null
  const incAlert = firstIn(al.income, today)
  const apAlert = firstIn(al.approval, today)
  const defAlert = firstIn(al.def, today - LABEL_DELAY)
  const falseAlarms =
    al.income.filter((w) => w <= today && (kind === 'none' || kind === 'concept' || w < START)).length +
    al.approval.filter((w) => w <= today && (kind === 'none' || kind === 'concept' || w < START)).length +
    al.def.filter((w) => w + LABEL_DELAY <= today && (kind === 'none' || w < START)).length

  const xr: [number, number] = [0.5, WEEKS + 0.5]
  const plotProps = { x: xr, width: 640, height: 128, minHeight: 140, margin: { left: 40, right: 10, top: 8, bottom: 22 } }
  const today_ = <VLine x={today + 0.45} color="var(--ink-2)" dash="2 3" width={1.4} />
  const startLine = kind !== 'none' ? <VLine x={START - 0.5} color="var(--viz-4)" dash="5 4" width={1.4} /> : null
  const out = (v: number, ref: number, se: number) => Math.abs(v - ref) > k * se

  const lineOf = (rows: Week[], f: (d: Week) => number): [number, number][] => rows.map((d) => [d.w, f(d)])

  return (
    <Figure
      wide
      title="A drift dashboard for a loan-approval model"
      caption={
        <>
          A model approves loans for applicants with high enough income. Slide <b>today</b> forward and see which panel raises the first alert (red). Then try <b>concept drift</b>: incomes and
          approvals stay calm, and only the default rate moves, 12 weeks late, because repayment labels take that long to arrive. Drop the threshold to 1 and watch the false alarms; raise it to 5
          and alerts come later. The green band is each signal’s normal range; the pink dashed line marks when the drift begins.
        </>
      }
    >
      <Controls>
        <Segmented label="What happens from week 10" value={kind} onChange={setKind} options={KINDS} />
      </Controls>
      <Controls>
        <Slider label="today (week)" value={today} min={1} max={WEEKS} onChange={setToday} />
        <Slider label="alert threshold (× normal wobble)" value={k} min={1} max={5} step={0.5} onChange={setK} format={(v) => `${v.toFixed(1)}×`} />
      </Controls>

      <Panel title="1. Input: applicants’ income ($1000s)" note={`mean, middle 50% and 80% · trained on mean ${REF.income}`}>
        <Plot {...plotProps} y={[30, 90]} ariaLabel="Weekly income distribution of applicants">
          <Rect x0={xr[0]} x1={xr[1]} y0={REF.income - k * REF.seIncome} y1={REF.income + k * REF.seIncome} fill={BAND} />
          <HLine y={REF.income} color="var(--viz-3)" dash="0" width={1} />
          <Axes xTicks={6} yTicks={3} />
          {startLine}
          {kind !== 'none' && (
            <Label x={START - 0.5} y={90} dx={-5} dy={12} anchor="end" size={11.5} color="var(--viz-4)" weight={700}>
              drift starts
            </Label>
          )}
          {seen.map((d) => (
            <g key={d.w}>
              <Path points={[[d.w, d.q10], [d.w, d.q90]]} color="var(--viz-muted)" width={1.2} />
              <Rect x0={d.w - 0.27} x1={d.w + 0.27} y0={d.q25} y1={d.q75} fill="color-mix(in srgb, var(--viz-1) 30%, var(--surface))" />
            </g>
          ))}
          <Dots points={seen.map((d) => ({ x: d.w, y: d.mean, r: 3.6, color: out(d.mean, REF.income, REF.seIncome) ? 'var(--bad)' : 'var(--viz-1)' }))} />
          {today_}
        </Plot>
      </Panel>

      <Panel title="2. Prediction: approval rate (%)" note={`trained at ${REF.approval * 100}%`}>
        <Plot {...plotProps} y={[0, 60]} ariaLabel="Weekly approval rate">
          <Rect x0={xr[0]} x1={xr[1]} y0={(REF.approval - k * REF.seApproval) * 100} y1={(REF.approval + k * REF.seApproval) * 100} fill={BAND} />
          <HLine y={REF.approval * 100} color="var(--viz-3)" dash="0" width={1} />
          <Axes xTicks={6} yTicks={3} />
          {startLine}
          <Path points={lineOf(seen, (d) => d.approval * 100)} color="var(--viz-2)" width={2} />
          <Dots points={seen.map((d) => ({ x: d.w, y: d.approval * 100, r: 3.6, color: out(d.approval, REF.approval, REF.seApproval) ? 'var(--bad)' : 'var(--viz-2)' }))} />
          {today_}
        </Plot>
      </Panel>

      <Panel title="3. Outcome: default rate of approved loans (%)" note={`labels arrive ${LABEL_DELAY} weeks late · trained at ${(REF.def * 100).toFixed(1)}%`}>
        <Plot {...plotProps} y={[0, 20]} ariaLabel="Weekly default rate of approved loans, known 12 weeks later">
          <Rect x0={xr[0]} x1={xr[1]} y0={Math.max(0, (REF.def - k * REF.seDef) * 100)} y1={(REF.def + k * REF.seDef) * 100} fill={BAND} />
          <HLine y={REF.def * 100} color="var(--viz-3)" dash="0" width={1} />
          <Rect
            x0={Math.max(xr[0], today - LABEL_DELAY + 0.5)}
            x1={today + 0.45}
            y0={0}
            y1={20}
            fill="color-mix(in srgb, var(--viz-muted) 22%, transparent)"
          />
          <Label x={Math.max(xr[0], today - LABEL_DELAY + 0.5)} y={20} dx={4} dy={13} size={11.5} color="var(--ink-2)" weight={700}>
            labels not in yet
          </Label>
          <Axes xTicks={6} yTicks={2} />
          {startLine}
          <Path points={lineOf(labelled, (d) => d.def * 100)} color="var(--viz-5)" width={2} />
          <Dots points={labelled.map((d) => ({ x: d.w, y: d.def * 100, r: 3.6, color: out(d.def, REF.def, REF.seDef) ? 'var(--bad)' : 'var(--viz-5)' }))} />
          {today_}
        </Plot>
      </Panel>

      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 6 }} role="status">
        <Light label="Input monitor" week={incAlert} />
        <Light label="Prediction monitor" week={apAlert} />
        <Light label="Outcome monitor" week={defAlert} raisedAt={defAlert !== null ? defAlert + LABEL_DELAY : null} pending={today < START + LABEL_DELAY} />
      </div>
      <Controls>
        <Button onClick={bump}>new random weeks</Button>
        <Readout
          items={[
            ['week shown', `${today} of ${WEEKS}`],
            ['latest approval rate', seen.length ? pct(seen[seen.length - 1].approval) : '–'],
            ['false alarms so far', String(falseAlarms)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
