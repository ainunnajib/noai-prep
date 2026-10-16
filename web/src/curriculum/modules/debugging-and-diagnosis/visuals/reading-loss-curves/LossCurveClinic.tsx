import { useMemo, useState } from 'react'
import { Figure, Segmented, Plot, Grid, Axes, Path, Dots, Label, usePlot } from '../../../../../kit'
import { PATIENTS, DIAGNOSES, REMEDIES, Y_MAX, OSC_FROM, simulate, treated, type DiagnosisId, type RemedyId, type Curves } from './clinicModel'
import { Chip, Chips, Legend, Note, Section } from './ui'

/*
  The loss-curve clinic. Six training runs, each with a recognisable symptom. The learner picks a
  diagnosis (with feedback), then tries treatments: the run is re-simulated with the change and the
  "after" curves are drawn over the faded "before" curves.
*/

interface RunState {
  guess: DiagnosisId | null
  solved: boolean
  remedy: RemedyId | null
}

const TRAIN = 'var(--viz-1)'
const VAL = 'var(--viz-2)'

function NanMarker({ at }: { at: number }) {
  const { xs, ys } = usePlot()
  const [y0, y1] = ys.range()
  const x = xs(at)
  const [, xEnd] = xs.range()
  const right = xEnd - x > 110
  return (
    <g>
      <line x1={x} x2={x} y1={y0} y2={y1} style={{ stroke: 'var(--viz-neg)', strokeDasharray: '4 4', strokeWidth: 1.5 }} />
      <text className="plot-label" x={right ? x + 6 : x - 6} y={y1 + 14} textAnchor={right ? 'start' : 'end'} style={{ fill: 'var(--viz-neg)' }}>
        {right ? 'loss = NaN from here' : 'loss = NaN'}
      </text>
    </g>
  )
}

function CurvePair({ c, faint }: { c: Curves; faint?: boolean }) {
  return (
    <>
      <Path points={c.val} color={VAL} width={faint ? 2 : 2.6} opacity={faint ? 0.25 : 1} />
      <Path points={c.train} color={TRAIN} width={faint ? 2 : 2.6} opacity={faint ? 0.25 : 1} />
    </>
  )
}

const HEALTHY = PATIENTS.find((q) => q.diagnosis === 'healthy') ?? PATIENTS[PATIENTS.length - 1]

export default function LossCurveClinic() {
  const [idx, setIdx] = useState(0)
  const [states, setStates] = useState<RunState[]>(() => PATIENTS.map(() => ({ guess: null, solved: false, remedy: null })))
  const p = PATIENTS[idx]
  const st = states[idx]
  const update = (patch: Partial<RunState>) => setStates((all) => all.map((s, i) => (i === idx ? { ...s, ...patch } : s)))

  const before = useMemo(() => simulate(p.spec), [p])
  const after = useMemo(() => (st.remedy ? simulate(treated(p, st.remedy)) : null), [p, st.remedy])
  const shown = after ?? before
  const xMax = Math.max(p.spec.epochs, after ? treated(p, st.remedy!).epochs : 0)
  // a healthy run, drawn faintly behind every other patient as a reference
  const reference = useMemo(() => simulate(HEALTHY.spec), [])
  const showRef = p !== HEALTHY

  // lowest validation loss of the curve on top, if it is clearly before the end (early-stopping point)
  const shownSpec = st.remedy ? treated(p, st.remedy) : p.spec
  const jumpy = shownSpec.lr > OSC_FROM
  const best = useMemo(() => {
    const v = shown.val
    if (jumpy || shown.nanAt !== null || v.length < 10) return null
    let k = 0
    for (let i = 1; i < v.length; i++) if (v[i][1] < v[k][1]) k = i
    // only worth marking when validation loss clearly rose again afterwards
    return v.length - 1 - k >= 10 && v[v.length - 1][1] - v[k][1] > 0.06 ? v[k] : null
  }, [shown, jumpy])

  const solvedCount = states.filter((s) => s.solved).length
  const guessRight = st.guess === p.diagnosis
  const outcome = st.remedy ? p.remedies[st.remedy] : null
  const outcomeTone = outcome ? (outcome[0] === 'fixed' ? 'good' : outcome[0] === 'better' ? 'info' : outcome[0] === 'worse' ? 'bad' : 'warn') : 'plain'
  const outcomeWord = outcome ? { fixed: 'Cured.', better: 'Better, but not cured.', same: 'No real change.', worse: 'Worse.' }[outcome[0]] : ''

  return (
    <Figure
      title="The loss curve clinic"
      caption={
        <>
          Six training runs, each with one problem (or none). Pick a run, read its curves, and choose a diagnosis. Then try treatments: the run is
          redrawn after the change, with the original run faded behind it. The thin dashed line is a healthy run's validation loss, for comparison. Each point is an average over a whole epoch, so a healthy curve here is smooth: bouncing at this scale is a real problem (unlike the per-batch noise in a later figure). The open circle marks the lowest validation loss, the point early stopping
          would keep. The curves are simplified versions of shapes that real training runs produce.
        </>
      }
    >
      <Segmented
        label={`Patients (diagnosed ${solvedCount} of ${PATIENTS.length})`}
        value={idx}
        onChange={setIdx}
        options={PATIENTS.map((q, i) => ({ value: i, label: `${states[i].solved ? '✓ ' : ''}${q.name}` }))}
      />
      <Plot x={[0, xMax]} y={[0, Y_MAX]} width={560} height={290} minHeight={230} margin={{ left: 44, right: 14, top: 18 }} ariaLabel={`Training and validation loss for ${p.name}`}>
        <Grid xTicks={6} yTicks={4} />
        <Axes xLabel="epoch" yLabel="loss" xTicks={6} yTicks={4} />
        {showRef && <Path points={reference.val.filter(([x]) => x <= xMax)} color="var(--ink-3)" width={1.6} dash="3 4" opacity={0.6} />}
        {after && <CurvePair c={before} faint />}
        <CurvePair c={shown} />
        {shown.nanAt !== null && <NanMarker at={shown.nanAt} />}
        {best && <Dots points={[{ x: best[0], y: best[1], hollow: true, r: 6, color: VAL }]} />}
        {best && (
          <Label x={best[0]} y={best[1]} dy={22} anchor="middle" color="var(--ink-2)" size={12}>
            lowest val
          </Label>
        )}
      </Plot>
      <Legend
        items={[
          { color: TRAIN, label: 'training loss' },
          { color: VAL, label: 'validation loss' },
          ...(showRef ? [{ color: 'var(--ink-3)', label: 'a healthy run (validation), for reference', dash: true }] : []),
          ...(after ? [{ color: 'var(--ink-3)', label: 'before treatment', faint: true }] : []),
        ]}
      />
      <Section label="1. Diagnose">
        <Chips label="Diagnosis">
          {DIAGNOSES.map((d) => (
            <Chip
              key={d.id}
              state={st.guess === d.id ? (d.id === p.diagnosis ? 'good' : 'bad') : 'idle'}
              onClick={() => update({ guess: d.id, solved: st.solved || d.id === p.diagnosis })}
            >
              {d.label}
            </Chip>
          ))}
        </Chips>
      </Section>
      {st.guess && (
        <Note tone={guessRight ? 'good' : 'bad'}>
          {guessRight ? (
            <>
              <b>Correct.</b> {p.confirm}
            </>
          ) : (
            <>
              <b>Not quite.</b> {p.hint}
            </>
          )}
        </Note>
      )}
      <Section label={st.guess ? '2. Treat' : '2. Treat (diagnose first)'}>
        <Chips label="Treatment">
          {REMEDIES.map((r) => (
            <Chip key={r.id} disabled={!st.guess} state={st.remedy === r.id ? 'selected' : 'idle'} onClick={() => update({ remedy: st.remedy === r.id ? null : r.id })}>
              {r.label}
            </Chip>
          ))}
        </Chips>
      </Section>
      {outcome && (
        <Note tone={outcomeTone}>
          <b>{outcomeWord}</b> {outcome[1]} <span style={{ color: 'var(--ink-3)' }}>(Tap the treatment again to undo it.)</span>
        </Note>
      )}
    </Figure>
  )
}
