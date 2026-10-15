import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Slider, Toggle, Button, Plot, Grid, Path, Dots, HLine, Label, useAnimationFrame, useContainerWidth, mulberry32 } from '../../../../../kit'
import { PRELIM } from '../../../../../data/facts'

/*
  One simulated Prelim: 150 questions, 90 minutes, the same student, two strategies.
  Each question has a type (quick, medium, hard, or one of the 15 long scenarios at the end),
  a time it takes this student to work out IF they know it (reading included), a reading time,
  and whether they know it at all.
  - Never skip: work through in order; on a question you don't know you struggle for 1.5× its
    time before guessing.
  - Skip: if a question needs more than the limit, spend the limit, guess and move on.
    · If the limit was long enough to read it, you know whether you can do it: flag the ones you
      can, and on the way back finish them, re-skimming half the question first.
    · If the limit was too short even to read it, you cannot tell yet: flag it anyway. On the way
      back you start from scratch (or read it, find you can't do it and keep your guess).
    The second pass does the read, flagged questions shortest first, then the unread ones in order.
  Score = 1 for a question worked out + 1/4 for a guess (expected value) + 0 for a blank.
*/

const N = PRELIM.questions
const TOTAL = PRELIM.minutes * 60
const SWEEP = 60 // seconds kept back to guess every blank
const STUCK = 1.5
const REREAD = 0.5 // fraction of the reading time spent re-skimming a flagged question
const LIMITS = Array.from({ length: 17 }, (_, i) => 10 + 5 * i) // 10, 15, …, 90 s

type Kind = 'quick' | 'medium' | 'hard' | 'scenario'
interface Q {
  kind: Kind
  f: number
  know: boolean
}

const KNOW: Record<Kind, number> = { quick: 0.85, medium: 0.7, hard: 0.5, scenario: 0.6 }
/** reading time as a multiple of "your time on an easy question" */
const READ: Record<Kind, number> = { quick: 0.4, medium: 0.6, hard: 0.8, scenario: 1.4 }

function makePaper(seed: number): Q[] {
  const r = mulberry32(seed)
  return Array.from({ length: N }, (_, i) => {
    let kind: Kind
    let f: number
    if (i >= N - 15) {
      kind = 'scenario'
      f = 2.2 + 1.4 * r()
    } else {
      const u = r()
      if (u < 0.55) {
        kind = 'quick'
        f = 0.5 + 0.6 * r()
      } else if (u < 0.85) {
        kind = 'medium'
        f = 1.4 + 0.8 * r()
      } else {
        kind = 'hard'
        f = 3 + 2 * r()
      }
    }
    return { kind, f, know: r() < KNOW[kind] }
  })
}

type Status = 'solved' | 'guessed' | 'blank'
interface Seg {
  q: number
  t0: number
  t1: number
  kind: 'solved' | 'guessed' | 'second'
}
interface Outcome {
  status: Status[]
  /** clock time at which each question got its first status, and its upgrade (second pass) */
  first: number[]
  upgrade: number[]
  segs: Seg[]
  solved: number
  guessed: number
  blank: number
  score: number
}

function simulate(paper: Q[], easy: number, limit: number | null, sweep: boolean): Outcome {
  const end = sweep ? TOTAL - SWEEP : TOTAL
  const status: Status[] = Array(N).fill('blank')
  const first = Array(N).fill(Infinity)
  const upgrade = Array(N).fill(Infinity)
  const segs: Seg[] = []
  const read: { i: number; rest: number; solve: boolean }[] = []
  const unread: { i: number; rest: number; solve: boolean }[] = []
  let t = 0
  for (let i = 0; i < N; i++) {
    const q = paper[i]
    const b = easy * q.f
    const r = easy * READ[q.kind]
    const need = q.know ? b : STUCK * b
    const capped = limit !== null && need > limit
    const spend = capped ? limit : need
    if (t + spend > end) break
    const solvedNow = !capped && q.know
    segs.push({ q: i, t0: t, t1: t + spend, kind: solvedNow ? 'solved' : 'guessed' })
    t += spend
    status[i] = solvedNow ? 'solved' : 'guessed'
    first[i] = t
    if (!capped || limit === null) continue
    if (limit < r) unread.push({ i, rest: q.know ? b : r, solve: q.know })
    else if (q.know) read.push({ i, rest: b - limit + REREAD * r, solve: true })
  }
  read.sort((x, y) => x.rest - y.rest)
  for (const f of [...read, ...unread]) {
    if (t + f.rest > end) continue
    segs.push({ q: f.i, t0: t, t1: t + f.rest, kind: 'second' })
    t += f.rest
    if (f.solve) {
      status[f.i] = 'solved'
      upgrade[f.i] = t
    }
  }
  if (sweep) {
    for (let i = 0; i < N; i++)
      if (status[i] === 'blank') {
        status[i] = 'guessed'
        first[i] = TOTAL - 1
      }
  }
  const solved = status.filter((s) => s === 'solved').length
  const guessed = status.filter((s) => s === 'guessed').length
  const blank = N - solved - guessed
  return { status, first, upgrade, segs, solved, guessed, blank, score: solved + guessed / 4 }
}

const COLOUR = { solved: 'var(--viz-pos)', guessed: 'var(--viz-2)', second: 'var(--viz-5)' }
const PLAY_SECONDS = 9

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export default function PaceSimulator() {
  const [limit, setLimit] = useState(90)
  const [easy, setEasy] = useState(25)
  const [sweep, setSweep] = useState(false)
  const [clock, setClock] = useState(TOTAL)
  const [playing, setPlaying] = useState(false)
  const [ref, measured] = useContainerWidth<HTMLDivElement>(640)
  const W = Math.max(280, measured)

  const paper = useMemo(() => makePaper(269), [])
  const a = useMemo(() => simulate(paper, easy, null, sweep), [paper, easy, sweep])
  const b = useMemo(() => simulate(paper, easy, limit, sweep), [paper, easy, limit, sweep])
  const needed = paper.reduce((s, q) => s + easy * q.f * (q.know ? 1 : STUCK), 0)
  const known = paper.filter((q) => q.know).length
  const ceiling = known + (N - known) / 4
  const curve = useMemo(() => LIMITS.map((L) => simulate(paper, easy, L, sweep).score), [paper, easy, sweep])

  useAnimationFrame((dt) => {
    setClock((c) => Math.min(TOTAL, c + (dt * TOTAL) / PLAY_SECONDS))
  }, playing)
  useEffect(() => {
    if (playing && clock >= TOTAL) setPlaying(false)
  }, [playing, clock])

  const play = () => {
    if (playing) setPlaying(false)
    else {
      if (clock >= TOTAL) setClock(0)
      setPlaying(true)
    }
  }

  return (
    <Figure
      title="Same paper, same student, two strategies"
      caption={
        <>
          Both rows sit the same simulated Prelim: green = worked out (1 mark), orange = guessed (worth 1/4 mark on average), empty = never reached. The bar under each grid shows
          where the 90 minutes went. Slide <strong>skip after</strong> down from 90 s and watch the bottom score rise overall: time stops leaking into questions you were never
          going to crack. The small chart traces the whole curve. A cap that is too tight backfires, because you skip questions before you have even read them and every flagged
          question costs time when you come back; try a slower student (35 s on an easy question) to see it clearly. Then switch on <strong>guess every blank</strong> and see what
          the top row was throwing away.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', gap: '0.9rem' }}>
        <StrategyRow title="Never skip: work through in order" o={a} clock={clock} W={W} />
        <StrategyRow title={`Skip after ${limit} s, flag it, come back at the end`} o={b} clock={clock} W={W} accent />
      </div>
      <Controls>
        <Slider label="skip after" value={limit} min={10} max={90} step={5} onChange={setLimit} format={(v) => `${v} s`} />
        <Slider label="your time on an easy question" value={easy} min={10} max={40} step={1} onChange={setEasy} format={(v) => `${v} s`} />
      </Controls>
      <Controls>
        <Toggle label="Guess every blank in the last minute" checked={sweep} onChange={setSweep} />
        <Button primary onClick={play}>
          {playing ? 'Pause' : clock >= TOTAL ? 'Play the 90 minutes' : 'Resume'}
        </Button>
        <span className="tabular" style={{ fontSize: '0.875rem', color: 'var(--ink-2)', fontWeight: 600 }}>
          clock {mmss(clock)} / {mmss(TOTAL)}
        </span>
      </Controls>
      <ScoreCurve curve={curve} limit={limit} never={a.score} ceiling={ceiling} />
      <div style={{ width: '100%', fontSize: '0.85rem', color: 'var(--ink-2)', lineHeight: 1.45 }}>
        This student knows how to do {known} of the {N} questions. Working through all of them in order, struggling on the unknown ones, would take about{' '}
        <strong className="tabular">{Math.round(needed / 60)} minutes</strong>, but there are only {PRELIM.minutes}. The best any strategy can do is{' '}
        <strong className="tabular">{ceiling.toFixed(1)}</strong>: all {known} known questions worked out and the other {N - known} guessed. Strategy cannot add knowledge, but it stops the
        clock from wasting it.
      </div>
    </Figure>
  )
}

/** Expected score of the skip strategy for every limit, with the current one marked. */
function ScoreCurve({ curve, limit, never, ceiling }: { curve: number[]; limit: number; never: number; ceiling: number }) {
  const lo = Math.floor(Math.min(never, ...curve) / 5) * 5 - 2
  const hi = Math.ceil(ceiling / 5) * 5 + 2
  const cur = curve[LIMITS.indexOf(limit)] ?? curve[0]
  const best = LIMITS[curve.indexOf(Math.max(...curve))]
  return (
    <div style={{ width: '100%', display: 'grid', gap: '0.15rem' }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center' }}>Expected score of the skip strategy, for every “skip after” limit</div>
      <Plot
        x={[10, 90]}
        y={[lo, hi]}
        width={620}
        height={170}
        minHeight={160}
        margin={{ left: 40, right: 16, top: 12, bottom: 30 }}
        ariaLabel={`Expected score against the skip-after limit, from 10 s to 90 s. At ${limit} s the score is ${cur.toFixed(1)}; the best limit for this student is ${best} s; never skipping scores ${never.toFixed(1)}.`}
      >
        <Grid xTicks={8} yTicks={4} />
        {LIMITS.filter((L) => L % 20 === 10).map((L) => (
          <Label key={L} x={L} y={lo} dy={16} anchor="middle" color="var(--ink-3)" size={11}>
            {`${L} s`}
          </Label>
        ))}
        {[lo + 2, Math.round((lo + hi) / 2), hi - 2].map((v) => (
          <Label key={v} x={10} y={v} dx={-6} dy={4} anchor="end" color="var(--ink-3)" size={11}>
            {String(v)}
          </Label>
        ))}
        <HLine y={never} color="var(--ink-3)" dash="4 4" width={1.5} label={`never skip: ${never.toFixed(1)}`} />
        <HLine y={ceiling} color="var(--viz-pos)" dash="2 4" width={1} />
        <Path points={LIMITS.map((L, i) => [L, curve[i]] as [number, number])} color="var(--accent)" width={2.4} />
        <Dots points={[{ x: limit, y: cur, color: 'var(--accent)', r: 6 }]} />
        <Label x={limit} y={cur} dx={limit < 50 ? 9 : -9} dy={-8} anchor={limit < 50 ? 'start' : 'end'} color="var(--ink)" size={12} weight={800}>
          {`${limit} s: ${cur.toFixed(1)}`}
        </Label>
      </Plot>
      <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)', textAlign: 'center' }}>“skip after”, from tight (left) to loose (right) · dotted green line: the best possible score</div>
    </div>
  )
}

const stat: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }

function Swatch({ c, hollow }: { c: string; hollow?: boolean }) {
  return <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 2, background: hollow ? 'transparent' : c, border: hollow ? `1.5px dashed ${c}` : 'none', display: 'inline-block' }} />
}

function StrategyRow({ title, o, clock, W, accent }: { title: string; o: Outcome; clock: number; W: number; accent?: boolean }) {
  const cols = 30
  const gap = W < 420 ? 1.5 : 2.5
  const cell = (W - gap * (cols - 1)) / cols
  const gridH = cell * 5 + gap * 4
  const barY = gridH + 10
  const barH = 14
  const H = barY + barH + 16
  const live = clock < TOTAL
  // counts at the current clock (for the animation)
  const at = (i: number): Status => {
    if (o.first[i] > clock) return 'blank'
    if (o.status[i] === 'solved' && o.upgrade[i] !== Infinity && o.upgrade[i] > clock) return 'guessed'
    return o.status[i]
  }
  const st = Array.from({ length: N }, (_, i) => at(i))
  const solved = st.filter((s) => s === 'solved').length
  const guessed = st.filter((s) => s === 'guessed').length
  const score = solved + guessed / 4
  const x = (t: number) => (t / TOTAL) * W
  // merge back-to-back stretches of the same kind so the bar reads as blocks of time
  const merged: Seg[] = []
  for (const sg of o.segs) {
    if (sg.t0 >= clock) break
    const cut = { ...sg, t1: Math.min(sg.t1, clock) }
    const last = merged[merged.length - 1]
    if (last && last.kind === cut.kind && Math.abs(last.t1 - cut.t0) < 1e-6) last.t1 = cut.t1
    else merged.push(cut)
  }
  return (
    <div
      style={{
        border: `1.5px solid ${accent ? 'var(--accent)' : 'var(--rule)'}`,
        borderRadius: 'var(--radius-m)',
        padding: '0.55rem 0.65rem 0.4rem',
        background: accent ? 'color-mix(in srgb, var(--accent) 5%, var(--surface))' : 'var(--surface)',
        display: 'grid',
        gap: '0.4rem',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.2rem 1rem' }}>
        <strong style={{ fontSize: '0.92rem', color: 'var(--ink)' }}>{title}</strong>
        <span className="tabular" style={{ fontSize: '1.05rem', fontWeight: 800, color: accent ? 'var(--accent)' : 'var(--ink)' }}>
          {score.toFixed(1)} marks {live ? 'so far' : 'expected'}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="plot" role="img" aria-label={`${title}: ${solved} worked out, ${guessed} guessed, ${N - solved - guessed} blank, expected score ${score.toFixed(1)} out of ${N}.`}>
        {st.map((s, i) => {
          const cx = (i % cols) * (cell + gap)
          const cy = Math.floor(i / cols) * (cell + gap)
          const scen = i >= N - 15
          return s === 'blank' ? (
            <rect key={i} x={cx + 0.75} y={cy + 0.75} width={cell - 1.5} height={cell - 1.5} rx={2} style={{ fill: 'none', stroke: 'var(--viz-muted)', strokeWidth: 1, strokeDasharray: '2 2' }} />
          ) : (
            <rect key={i} x={cx} y={cy} width={cell} height={cell} rx={2} style={{ fill: COLOUR[s], opacity: scen ? 0.85 : 1 }} />
          )
        })}
        {/* the 15 long scenario questions at the end */}
        <line x1={15 * (cell + gap)} x2={W} y1={gridH + 3} y2={gridH + 3} style={{ stroke: 'var(--viz-muted)', strokeWidth: 1.5 }} />
        {/* time bar */}
        <rect x={0} y={barY} width={W} height={barH} rx={3} style={{ fill: 'var(--surface-3)' }} />
        {merged.map((sg, k) => (
          <rect key={k} x={x(sg.t0)} y={barY} width={Math.max(0.5, x(sg.t1) - x(sg.t0))} height={barH} style={{ fill: COLOUR[sg.kind] }} />
        ))}
        {[0, 30, 60, 90].map((m) => (
          <text key={m} x={x(m * 60)} y={H - 2} textAnchor={m === 0 ? 'start' : m === 90 ? 'end' : 'middle'} style={{ fill: 'var(--ink-3)', fontSize: 11 }}>
            {m} min
          </text>
        ))}
        {live && <line x1={x(clock)} x2={x(clock)} y1={barY - 3} y2={barY + barH + 3} style={{ stroke: 'var(--viz-ink)', strokeWidth: 2 }} />}
      </svg>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 0.9rem', fontSize: '0.8rem', color: 'var(--ink-2)' }} className="tabular">
        <span style={stat}>
          <Swatch c={COLOUR.solved} /> worked out <strong>{solved}</strong>
        </span>
        <span style={stat}>
          <Swatch c={COLOUR.guessed} /> guessed <strong>{guessed}</strong>
        </span>
        <span style={stat}>
          <Swatch c="var(--viz-muted)" hollow /> blank <strong>{N - solved - guessed}</strong>
        </span>
        {accent && (
          <span style={stat}>
            <Swatch c={COLOUR.second} /> time on the second pass
          </span>
        )}
        <span style={{ ...stat, color: 'var(--ink-3)' }}>grey rule: the 15 long scenarios</span>
      </div>
    </div>
  )
}
