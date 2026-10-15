import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Button, Bars, Plot, Grid, Axes, Path, Dots, VLine, Label, DraggablePoint, useNarrow } from '../../../../../kit'
import m from './mp.module.css'

/*
  Score projector. Weekly full-mock scores (out of 150) over an 18-week run-up to the Prelim.
  Drag any week's score; the least-squares trend, the ±2 SD noise of a single sitting
  (SD = √(150·p·(1 − p))) and a projected range on Prelim day update. Planned study hours scale
  the future trend; guessing the blanks left in the last mock adds (150 − answered)/4 expected marks,
  drawn as a step on Prelim day.
  The trend uses the last four mocks, so an early jump followed by a plateau projects flat. Its slope is
  capped at 3 marks a week, and the fan widens with the uncertainty of the fitted level and slope, so
  one wild mock makes the fan balloon instead of making the projection leap.
  The latest mock is broken down by domain (the example split is scaled to the latest score). A button loads the mocks saved by this site's
  Mock exam page, if there are any in this browser.
*/

const WEEKS = 18
const PAST_HOURS = 6
const DOMS = ['Maths', 'Computing', 'AI/ML/DL', 'GenAI', 'Problem solving']
const DOM_KEYS = ['mathematics', 'computing', 'ai_ml_dl', 'generative_ai', 'problem_solving']

interface Profile {
  id: string
  label: string
  scores: number[]
  /** latest mock by domain, out of 30 each */
  domains: number[]
}

const PROFILES: Profile[] = [
  { id: 'steady', label: 'Steady climber', scores: [62, 70, 66, 75, 79, 77], domains: [20, 17, 16, 10, 14] },
  { id: 'plateau', label: 'Fast start, then flat', scores: [80, 92, 95, 94, 96, 95], domains: [24, 21, 19, 14, 17] },
  { id: 'noisy', label: 'Noisy but rising', scores: [55, 71, 60, 74, 69, 82], domains: [15, 19, 18, 16, 14] },
]

const sd = (score: number) => {
  const p = Math.min(0.99, Math.max(0.01, score / 150))
  return Math.sqrt(150 * p * (1 - p))
}

/** Least-squares line through the last `k` weekly scores (x = week number). */
function fit(all: number[], k = 4) {
  const start = Math.max(0, all.length - k)
  const scores = all.slice(start)
  const n = scores.length
  const xs = scores.map((_, i) => start + i + 1)
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = scores.reduce((a, b) => a + b, 0) / n
  let sxy = 0
  let sxx = 0
  xs.forEach((x, i) => {
    sxy += (x - mx) * (scores[i] - my)
    sxx += (x - mx) ** 2
  })
  const b = sxx ? sxy / sxx : 0
  const a = my - b * mx
  // standard error of the slope: large when the points do not sit near one line
  const rss = scores.reduce((t, y, i) => t + (y - (a + b * xs[i])) ** 2, 0)
  const s2 = n > 2 ? rss / (n - 2) : 0
  const se = sxx ? Math.sqrt(s2 / sxx) : 0
  // standard error of the fitted level at the latest week
  const xl = start + n
  const seLevel = sxx ? Math.sqrt(s2 * (1 / n + (xl - mx) ** 2 / sxx)) : 0
  return { b, a, mean: my, from: start + 1, se, seLevel }
}

const MAX_SLOPE = 3 // marks a week: faster than this is not sustained for months

interface Saved {
  total: number
  correct: number
  byDomain?: Record<string, { total: number; correct: number }>
}

function loadSiteMocks(): Saved[] {
  try {
    const raw = window.localStorage.getItem('noai-prep:progress-v1')
    if (!raw) return []
    const exams = (JSON.parse(raw)?.exams ?? []) as Saved[]
    return exams.filter((e) => e && e.total >= 30 && Number.isFinite(e.correct))
  } catch {
    return []
  }
}

export default function ScoreProjector() {
  const [profile, setProfile] = useState('steady')
  const [scores, setScores] = useState<number[]>(PROFILES[0].scores)
  const [domains, setDomains] = useState<number[]>(PROFILES[0].domains)
  const [hours, setHours] = useState(PAST_HOURS)
  const [reached, setReached] = useState(140)
  const [guess, setGuess] = useState(true)
  const [noise, setNoise] = useState(true)
  const [msg, setMsg] = useState('')
  const [ref, narrow] = useNarrow<HTMLDivElement>(520)

  const pick = (id: string) => {
    const p = PROFILES.find((x) => x.id === id)
    if (!p) return
    setProfile(id)
    setScores(p.scores)
    setDomains(p.domains)
    setMsg('')
  }

  const loadMine = () => {
    const ex = loadSiteMocks()
    if (!ex.length) {
      setMsg('No mocks of 30 or more questions are saved in this browser yet. Sit one on the Mock exam page, then come back.')
      return
    }
    const last = ex.slice(-12)
    setScores(last.map((e) => Math.round((150 * e.correct) / e.total)))
    const bd = last[last.length - 1].byDomain ?? {}
    setDomains(DOM_KEYS.map((k) => (bd[k]?.total ? Math.round((30 * bd[k].correct) / bd[k].total) : 0)))
    setProfile('mine')
    setMsg(`Loaded your last ${last.length} mock${last.length === 1 ? '' : 's'}, scaled to 150 marks, one per week in the order you sat them.`)
  }

  const n = scores.length
  const { b: rawB, a, mean, from, se, seLevel } = fit(scores)
  const cap = (v: number) => Math.max(-MAX_SLOPE, Math.min(MAX_SLOPE, v))
  const b = cap(rawB)
  const level = n >= 2 ? a + rawB * n : scores[0]
  // fraction of the remaining gap closed per week, from the (capped) trend, scaled by planned hours
  const rate = (slope: number) => Math.min(0.1, ((n >= 2 && slope > 0 ? slope / Math.max(5, 150 - mean) : 0) * hours) / PAST_HOURS)
  const f = rate(b)
  // the same projection with the slope 2 standard errors lower and higher: how much the trend itself is in doubt
  const gainAt = (slope: number, weeks: number) => (150 - level) * (1 - (1 - rate(cap(slope))) ** weeks)
  const trendHalf = (w: number) => Math.abs(gainAt(rawB + 2 * se, w - n) - gainAt(rawB - 2 * se, w - n)) / 2
  const bonus = guess ? (150 - reached) / 4 : 0
  const proj: [number, number][] = [[n, level]]
  let s = level
  for (let w = n + 1; w <= WEEKS; w++) {
    s = s + f * (150 - s)
    proj.push([w, s])
  }
  // the guessing bonus is a one-off on the day, not learning, so it is drawn as a step at the end rather than folded into the trend
  const trendEnd = proj[proj.length - 1][1]
  const final = Math.min(150, trendEnd + bonus)
  // chance noise of one sitting, plus the uncertainty of the trend itself carried forward (w − n) weeks
  const half = (w: number, v: number) =>
    Math.sqrt((2 * sd(v)) ** 2 * (1 + Math.max(0, w - n) / Math.max(2, n)) + (w > n ? (2 * seLevel) ** 2 + trendHalf(w) ** 2 : 0))
  const band: [number, number][] = [
    ...proj.map(([w, v]) => [w, Math.min(150, v + half(w, v))] as [number, number]),
    ...proj
      .slice()
      .reverse()
      .map(([w, v]) => [w, Math.max(0, v - half(w, v))] as [number, number]),
  ]
  const lo = Math.max(0, final - half(WEEKS, trendEnd))
  const hi = Math.min(150, final + half(WEEKS, trendEnd))
  // the example split is scaled so it always adds up to the latest score (a saved mock's own split is used as it is)
  const rawSum = domains.reduce((p, q) => p + q, 0)
  const latest = scores[n - 1]
  const shown = profile === 'mine' || rawSum === 0 ? domains : domains.map((d) => Math.min(30, Math.round((d * latest) / rawSum)))
  const domSum = shown.reduce((p, q) => p + q, 0)
  const weakest = shown.indexOf(Math.min(...shown))

  return (
    <Figure
      title="Project your Prelim score"
      caption={
        <>
          Drag any week’s score. The grey dashed line is the trend of your last four mocks; the shaded fan is where your score on 19 February would probably land, if you keep improving at that rate (scaled by your planned
          hours). The short step at the end is the guessing bonus for blanks, a one-off on the day rather than progress. Error bars show ±2 SD of chance alone for a single sitting. Drag one point far from the others: the fan balloons, because one mock says little about the trend. A model, not a promise: real progress
          is lumpier. On a phone, type the scores in the boxes under the chart instead of dragging.
        </>
      }
    >
      <div className={m.wrap} ref={ref}>
        <Segmented
          label="Example student"
          value={profile}
          onChange={pick}
          options={[...PROFILES.map((p) => ({ value: p.id, label: p.label })), ...(profile === 'mine' ? [{ value: 'mine', label: 'My mocks' }] : [])]}
        />
        <Plot x={[0.4, WEEKS + 0.6]} y={[0, 150]} width={560} height={320} minHeight={270} margin={{ left: 42, right: narrow ? 14 : 20, top: 18, bottom: 36 }} ariaLabel="Weekly mock scores out of 150, the trend line and a projected range on Prelim day">
          <Grid xTicks={9} yTicks={6} />
          <Axes xTicks={9} yTicks={6} xLabel="week" yLabel="score / 150" />
          <Path points={band} closed fill="color-mix(in srgb, var(--viz-1) 14%, transparent)" color="transparent" width={0} />
          {n >= 2 && (
            <Path
              points={[
                [from, a + rawB * from],
                [n, level],
              ]}
              color="var(--viz-muted)"
              dash="6 5"
              width={2}
            />
          )}
          <Path points={proj} color="var(--viz-1)" width={2.5} dash="2 4" />
          {final - trendEnd > 0.05 && (
            <Path
              points={[
                [WEEKS, trendEnd],
                [WEEKS, final],
              ]}
              color="var(--viz-4)"
              width={4}
            />
          )}
          {noise &&
            scores.map((v, i) => (
              <Path
                key={`e${i}`}
                points={[
                  [i + 1, Math.max(0, v - 2 * sd(v))],
                  [i + 1, Math.min(150, v + 2 * sd(v))],
                ]}
                color="var(--viz-2)"
                width={2}
              />
            ))}
          <VLine x={WEEKS} color="var(--viz-4)" dash="5 4" />
          <Label x={WEEKS} y={0} dx={-6} dy={-7} anchor="end" color="var(--viz-4)" weight={750}>
            {narrow ? 'Prelim' : 'Prelim, 19 Feb'}
          </Label>
          <Dots points={[{ x: WEEKS, y: final, color: 'var(--viz-4)', r: 6 }]} />
          <Label x={WEEKS} y={final} dx={-10} dy={final > 128 ? 18 : -12} anchor="end" color="var(--viz-4)" weight={800}>
            {`≈ ${Math.round(final)}`}
          </Label>
          {scores.map((v, i) => (
            <DraggablePoint
              key={i}
              x={i + 1}
              y={v}
              lockX
              r={7}
              color="var(--viz-2)"
              label={undefined}
              constrain={(x, y) => [x, Math.round(Math.max(0, Math.min(150, y)))]}
              onChange={(_, y) => setScores((sc) => sc.map((q, j) => (j === i ? y : q)))}
            />
          ))}
        </Plot>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(74px, 1fr))', gap: '0.35rem', width: '100%' }} role="group" aria-label="Weekly mock scores">
          {scores.map((v, i) => (
            <label key={i} style={{ display: 'grid', gap: 2, fontSize: '0.75rem', color: 'var(--ink-3)' }}>
              week {i + 1}
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={150}
                value={v}
                onChange={(e) => {
                  const y = Math.round(Math.max(0, Math.min(150, Number(e.target.value) || 0)))
                  setScores((sc) => sc.map((q, j) => (j === i ? y : q)))
                }}
                style={{ width: '100%', minHeight: 32, font: 'inherit', fontSize: '0.9rem', padding: '0.2rem 0.35rem', borderRadius: 6, border: '1px solid var(--rule)', background: 'var(--surface)', color: 'var(--ink)' }}
              />
            </label>
          ))}
        </div>
        <Readout
          items={[
            ['latest mock', `${scores[n - 1]} / 150`],
            ['trend', n >= 2 ? `${rawB >= 0 ? '+' : '−'}${Math.abs(rawB).toFixed(1)} a week${Math.abs(rawB) > MAX_SLOPE ? ` (projected at most ${MAX_SLOPE})` : ''}` : '–'],
            ['projected on 19 Feb', `${Math.round(final)} (likely ${Math.round(lo)}–${Math.round(hi)})${final - trendEnd > 0.05 ? `, incl. +${(final - trendEnd).toFixed(1)} from guessing` : ''}`],
          ]}
        />
        <Controls>
          <Slider label={`Study hours a week from now (so far: ${PAST_HOURS})`} value={hours} min={1} max={15} step={1} onChange={setHours} format={(v) => `${v} h`} />
          <Slider label="Questions answered in your last mock (the rest left blank)" value={reached} min={100} max={150} step={1} onChange={setReached} format={(v) => `${v}`} />
        </Controls>
        <div className={m.formRow}>
          <Toggle label={`Guess those blanks on the day (+${((150 - reached) / 4).toFixed(1)} expected)`} checked={guess} onChange={setGuess} />
          <Toggle label="Show ±2 SD noise bars" checked={noise} onChange={setNoise} />
        </div>
        <div className={m.formRow}>
          <Button onClick={() => setScores((sc) => (sc.length < 12 ? [...sc, sc[sc.length - 1]] : sc))} disabled={n >= 12}>
            Add a week
          </Button>
          <Button onClick={() => setScores((sc) => (sc.length > 2 ? sc.slice(0, -1) : sc))} disabled={n <= 2}>
            Remove a week
          </Button>
          <Button onClick={loadMine}>Use my mocks from this site</Button>
        </div>
        {msg && <div className={m.banner}>{msg}</div>}
        <div style={{ display: 'grid', gap: '0.35rem', width: '100%' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 750, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
            Latest mock by domain (out of 30 each{profile === 'mine' ? '' : '; an example split, scaled to the latest score'})
          </div>
          <Bars
            ariaLabel="Latest mock score per domain, out of 30"
            max={30}
            format={(v) => `${v} / 30`}
            data={DOMS.map((d, i) => ({ label: d, value: shown[i], color: `var(--viz-${i + 1})`, strong: i === weakest }))}
          />
          <div style={{ fontSize: '0.88rem', color: 'var(--ink-2)' }}>
            {domSum > 0 ? (
              <>
                Most marks still available in <strong>{DOMS[weakest]}</strong>: {30 - shown[weakest]} of 30 missed. Check your error log for that domain before deciding whether it needs lessons (gaps) or
                drills (slips).
              </>
            ) : (
              'No domain breakdown saved for this mock.'
            )}
          </div>
        </div>
      </div>
    </Figure>
  )
}
