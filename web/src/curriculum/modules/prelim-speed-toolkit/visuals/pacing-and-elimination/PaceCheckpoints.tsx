import { useMemo, useRef, useState } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Button, Plot, Grid, Axes, Path, Dots, Label, useAnimationFrame, usePlot, mulberry32 } from '../../../../../kit'
import { PRELIM } from '../../../../../data/facts'
import s from './pe.module.css'

/*
  A simulated Prelim on a time-vs-question chart.
  - Normal questions take (your average) × a random factor between 0.55 and 1.45.
  - Hard questions take 3 × your average if you grind them out.
  - "Speed up" from a checkpoint onwards: hard questions are capped at 30 s (best guess + flag),
    normal ones go 15% faster (no re-reading options you have already ruled out).
  Two reference lines: the 30 s target (Q = 2 × minutes) and the 36 s must-hit line (Q = minutes × 5/3).
*/

const N = PRELIM.questions
const TOTAL = PRELIM.minutes * 60
const CHECK_MIN = [15, 30, 45, 60, 75, 90]
const CAP = 30
const HARD_X = 3
const FAST = 0.85
const PLAY_SECONDS = 14

interface Paper {
  f: number[]
  hardOrder: number[]
}

function makePaper(seed: number): Paper {
  const r = mulberry32(seed)
  const f = Array.from({ length: N }, () => 0.55 + 0.9 * r())
  // weighted sampling without replacement: later questions (the long scenarios) are more likely to be hard
  const keys = Array.from({ length: N }, (_, i) => {
    const w = i >= N * 0.8 ? 4 : 1
    return { i, k: Math.pow(r(), 1 / w) }
  })
  keys.sort((a, b) => b.k - a.k)
  return { f, hardOrder: keys.map((x) => x.i) }
}

interface Run {
  finish: number[]
  hard: boolean[]
  capped: number
}

function simulate(p: Paper, avg: number, nHard: number, speedFrom: number): Run {
  const hard = Array(N).fill(false) as boolean[]
  p.hardOrder.slice(0, nHard).forEach((i) => (hard[i] = true))
  const finish: number[] = []
  let t = 0
  let capped = 0
  for (let i = 0; i < N; i++) {
    const fast = t >= speedFrom
    let dt: number
    if (hard[i]) {
      dt = fast ? CAP : HARD_X * avg
      if (fast) capped++
    } else dt = avg * p.f[i] * (fast ? FAST : 1)
    t += dt
    finish.push(t)
  }
  return { finish, hard, capped }
}

const reachedBy = (run: Run, t: number) => {
  let n = 0
  while (n < N && run.finish[n] <= t + 1e-9) n++
  return n
}

const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`
const redLine = (min: number) => (min * 60) / PRELIM.secondsPerQuestion
const targetLine = (min: number) => (min * 60) / 30

type Status = 'ahead' | 'ok' | 'behind' | 'done'
function statusAt(q: number, min: number): Status {
  if (q >= N) return 'done'
  if (q >= targetLine(min)) return 'ahead'
  if (q >= redLine(min)) return 'ok'
  return 'behind'
}
const STATUS_COLOUR: Record<Status, string> = { ahead: 'var(--viz-pos)', done: 'var(--viz-pos)', ok: 'var(--viz-2)', behind: 'var(--viz-neg)' }

export default function PaceCheckpoints() {
  const [avg, setAvg] = useState(34)
  const [nHard, setNHard] = useState(20)
  const [stopAtChecks, setStopAtChecks] = useState(true)
  const [speedAt, setSpeedAt] = useState<number | null>(null) // checkpoint index where you sped up
  const [clock, setClock] = useState(TOTAL)
  const [playing, setPlaying] = useState(false)
  const [pausedAt, setPausedAt] = useState<number | null>(null) // checkpoint index we are paused at

  const paper = useMemo(() => makePaper(2027), [])
  const speedFrom = speedAt === null ? Infinity : CHECK_MIN[speedAt] * 60
  const run = useMemo(() => simulate(paper, avg, nHard, speedFrom), [paper, avg, nHard, speedFrom])
  const plain = useMemo(() => simulate(paper, avg, nHard, Infinity), [paper, avg, nHard])

  // set when the run pauses itself, so a frame that is already queued cannot push the clock past the checkpoint
  const halted = useRef(false)
  useAnimationFrame((dt) => {
    if (halted.current) return
    setClock((c) => {
      const next = c + (dt * TOTAL) / PLAY_SECONDS
      if (stopAtChecks) {
        const k = CHECK_MIN.findIndex((m) => c < m * 60 && next >= m * 60)
        if (k >= 0 && k < CHECK_MIN.length - 1) {
          halted.current = true
          setPlaying(false)
          setPausedAt(k)
          return CHECK_MIN[k] * 60
        }
      }
      if (next >= TOTAL) {
        halted.current = true
        setPlaying(false)
        return TOTAL
      }
      return next
    })
  }, playing)

  const play = () => {
    setPausedAt(null)
    if (playing) {
      halted.current = true
      setPlaying(false)
      return
    }
    halted.current = false
    if (clock >= TOTAL) {
      setClock(0)
      setSpeedAt(null)
    }
    setPlaying(true)
  }
  const decide = (speed: boolean) => {
    if (speed && pausedAt !== null && speedAt === null) setSpeedAt(pausedAt)
    setPausedAt(null)
    halted.current = false
    setPlaying(true)
  }

  const live = clock < TOTAL
  const qNow = reachedBy(run, clock)
  const finalQ = reachedBy(run, TOTAL)
  const finishedAt = run.finish[N - 1]
  const plainFinal = reachedBy(plain, TOTAL)

  // the path: done part (solid) and the rest of the run if you change nothing more (faded)
  const pts: [number, number][] = [[0, 0], ...run.finish.map((t, i) => [t / 60, i + 1] as [number, number])]
  const cut = (t: number) => {
    const done: [number, number][] = [[0, 0]]
    for (let i = 0; i < N && run.finish[i] <= t; i++) done.push([run.finish[i] / 60, i + 1])
    const last = done[done.length - 1]
    if (last[1] < N) done.push([t / 60, last[1]])
    return done
  }
  const donePts = live ? cut(clock) : pts.filter(([m]) => m <= 90.01)

  const checks = CHECK_MIN.map((m, k) => {
    const q = reachedBy(run, m * 60)
    return { m, k, q, st: statusAt(q, m), reached: clock >= m * 60 - 1e-6 }
  })

  const pk = pausedAt !== null ? checks[pausedAt] : null

  return (
    <Figure
      title="Checkpoints: an early warning system for your clock"
      caption={
        <>
          Press <strong>Play the exam</strong>. The simulated student stops at every 15-minute checkpoint; compare the dot with the two lines and decide whether to speed up. Above the
          dashed green line (30 s a question) you are ahead; below the red line (36 s a question, 25 questions every 15 minutes) you will not reach Q{N}. Try a slower average or
          more hard questions, then compare speeding up at 15:00 with speeding up at 60:00.
        </>
      }
    >
      <div className={s.wrap}>
        <Plot x={[0, 90]} y={[0, N]} width={560} height={330} minHeight={260} margin={{ left: 54, right: 14, top: 26, bottom: 38 }} ariaLabel={`Questions answered against time. With your settings the student reaches question ${finalQ} by 90 minutes.`}>
          <Grid xTicks={6} yTicks={6} />
          {/* behind zone: under the red line */}
          <Path points={[[0, 0], [90, redLine(90)], [90, 0]]} closed fill="color-mix(in srgb, var(--viz-neg) 9%, transparent)" color="transparent" width={0} />
          {/* ahead zone: above the target line */}
          <Path points={[[0, 0], [75, N], [0, N]]} closed fill="color-mix(in srgb, var(--viz-pos) 9%, transparent)" color="transparent" width={0} />
          <Axes xLabel="minutes" xTicks={6} yTicks={6} tickFormat={(v) => String(v)} />
          <YTitle text="question reached" />
          {CHECK_MIN.map((m) => (
            <Path key={m} points={[[m, 0], [m, N]]} color="var(--viz-muted)" width={1} dash="2 4" />
          ))}
          {CHECK_MIN.map((m) => (
            <Label key={`f${m}`} x={m} y={N} dy={-8} anchor={m === 90 ? 'end' : 'middle'} color="var(--viz-neg)" size={11} weight={700}>
              {`Q${Math.round(redLine(m))}`}
            </Label>
          ))}
          <Path points={[[0, 0], [75, N]]} color="var(--viz-pos)" width={2} dash="7 5" />
          <Path points={[[0, 0], [90, redLine(90)]]} color="var(--viz-neg)" width={2} />
          {live && <Path points={pts} color="var(--viz-1)" width={2} opacity={0.25} />}
          <Path points={donePts} color="var(--viz-1)" width={3} />
          {live && <Path points={[[clock / 60, 0], [clock / 60, N]]} color="var(--viz-ink)" width={1.5} />}
          {checks.map(({ m, q, st, reached }) => (
            <g key={m} style={{ opacity: reached ? 1 : 0.3 }}>
              <Dots points={[{ x: m, y: Math.min(q, N), color: STATUS_COLOUR[st], r: 6 }]} />
              {reached && (
                <Label x={m} y={Math.min(q, N)} dx={m === 90 ? -9 : 9} dy={m === 90 ? -9 : 14} anchor={m === 90 ? 'end' : 'start'} color={STATUS_COLOUR[st]} size={11} weight={750}>
                  {`Q${q}`}
                </Label>
              )}
            </g>
          ))}
        </Plot>

        <div className={s.legend}>
          <span className={s.legendItem} style={{ color: 'var(--viz-pos)' }}>
            <span className={s.swatchDash} /> <span style={{ color: 'var(--ink-2)' }}>target: 30 s each (Q = 2 × minutes)</span>
          </span>
          <span className={s.legendItem} style={{ color: 'var(--viz-neg)' }}>
            <span className={s.swatchLine} /> <span style={{ color: 'var(--ink-2)' }}>must-hit: 36 s each (25 per 15 min)</span>
          </span>
          <span className={s.legendItem} style={{ color: 'var(--viz-1)' }}>
            <span className={s.swatchLine} /> <span style={{ color: 'var(--ink-2)' }}>the student</span>
          </span>
        </div>

        {pk && (
          <div className={`${s.panel} ${pk.st === 'behind' ? s.panelBehind : pk.st === 'ok' ? s.panelOk : s.panelAhead}`} role="status">
            <div>
              <strong>Checkpoint {pk.m}:00.</strong> You are on <strong>Q{pk.q}</strong>. The must-hit line says Q{Math.round(redLine(pk.m))}; the target says Q{targetLine(pk.m)}.{' '}
              {pk.st === 'behind' && (
                <>
                  You are <strong>{Math.round(redLine(pk.m)) - pk.q} behind</strong> the must-hit line: at this pace you will not reach the end.
                </>
              )}
              {pk.st === 'ok' && <>You are between the lines: on pace to finish, but with little spare time for flagged questions.</>}
              {(pk.st === 'ahead' || pk.st === 'done') && <>You are ahead of the target. Keep going.</>}
            </div>
            <div className={s.row}>
              {speedAt === null ? (
                <>
                  <Button primary onClick={() => decide(true)}>
                    Speed up from here
                  </Button>
                  <Button onClick={() => decide(false)}>Keep my pace</Button>
                </>
              ) : (
                <>
                  <span className={s.small}>You already switched to speed mode at {CHECK_MIN[speedAt]}:00.</span>
                  <Button primary onClick={() => decide(false)}>
                    Continue
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        <Controls>
          <Slider label="average time on a normal question" value={avg} min={20} max={45} step={1} onChange={setAvg} format={(v) => `${v} s`} />
          <Slider label="hard questions (3× your average if you grind)" value={nHard} min={0} max={40} step={1} onChange={setNHard} />
        </Controls>
        <Controls>
          <Button primary onClick={play}>
            {playing ? 'Pause' : clock >= TOTAL ? 'Play the exam' : 'Resume'}
          </Button>
          <Toggle label="Stop at each checkpoint" checked={stopAtChecks} onChange={setStopAtChecks} />
          <Readout
            items={[
              ['clock', mmss(clock)],
              ['reached', `Q${live ? qNow : finalQ}`],
              ['speed mode', speedAt === null ? 'off' : `from ${CHECK_MIN[speedAt]}:00`],
            ]}
          />
        </Controls>
        <div className={s.small}>
          {finishedAt <= TOTAL ? (
            <>
              With these settings the student reaches Q{N} at <strong className="tabular">{mmss(finishedAt)}</strong>, leaving <strong className="tabular">{mmss(TOTAL - finishedAt)}</strong> for
              a second pass
              {run.capped > 0 && (
                <>
                  {' '}
                  over the <strong>{run.capped}</strong> hard questions that were guessed and flagged
                </>
              )}
              .
            </>
          ) : (
            <>
              With these settings the student is on <strong>Q{finalQ}</strong> when time runs out: <strong>{N - finalQ}</strong> questions never read, worth about{' '}
              {((N - finalQ) / 4).toFixed(1)} marks as blind guesses instead of the marks they could have earned.
            </>
          )}{' '}
          {speedAt === null ? (
            <span className={s.muted}>No speed-up chosen yet.</span>
          ) : (
            <span className={s.muted}>
              Without speeding up: {plainFinal >= N ? `finished at ${mmss(plain.finish[N - 1])}` : `stuck on Q${plainFinal} at 90:00`}.
            </span>
          )}
        </div>
      </div>
    </Figure>
  )
}

/** Rotated y-axis title, so it never collides with the checkpoint flags along the top. */
function YTitle({ text }: { text: string }) {
  const { ys } = usePlot()
  const [y0, y1] = ys.range()
  const mid = (y0 + y1) / 2
  return (
    <text className="plot-axis-label" x={13} y={mid} textAnchor="middle" transform={`rotate(-90 13 ${mid})`}>
      {text}
    </text>
  )
}
