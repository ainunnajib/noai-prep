import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Slider, Toggle, Button, useAnimationFrame, useContainerWidth, mulberry32 } from '../../../../../kit'
import { PRELIM } from '../../../../../data/facts'

/*
  One simulated Prelim: 150 questions, 90 minutes, the same student, two strategies.
  Each question has a type (quick, medium, hard, or one of the 15 long scenarios at the end),
  a time it takes this student to work out IF they know it, and whether they know it at all.
  - Never skip: work through in order; on a question you don't know you struggle for 1.5× its
    time before guessing.
  - Skip: if a question needs more than the limit, spend the limit, guess, flag it (if you know
    how to do it, just slowly) and come back after reaching the end.
  Score = 1 for a question worked out + 1/4 for a guess (expected value) + 0 for a blank.
*/

const N = PRELIM.questions
const TOTAL = PRELIM.minutes * 60
const SWEEP = 60 // seconds kept back to guess every blank
const REREAD = 10 // seconds to re-read a flagged question when you come back to it
const STUCK = 1.5

type Kind = 'quick' | 'medium' | 'hard' | 'scenario'
interface Q {
  kind: Kind
  f: number
  know: boolean
}

const KNOW: Record<Kind, number> = { quick: 0.85, medium: 0.7, hard: 0.5, scenario: 0.6 }

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
  const flagged: number[] = []
  let t = 0
  for (let i = 0; i < N; i++) {
    const q = paper[i]
    const b = easy * q.f
    const need = q.know ? b : STUCK * b
    const spend = limit !== null && need > limit ? limit : need
    if (t + spend > end) break
    const solvedNow = spend === need && q.know
    segs.push({ q: i, t0: t, t1: t + spend, kind: solvedNow ? 'solved' : 'guessed' })
    t += spend
    status[i] = solvedNow ? 'solved' : 'guessed'
    first[i] = t
    if (!solvedNow && q.know && limit !== null) flagged.push(i)
  }
  for (const i of flagged) {
    const rest = easy * paper[i].f - (limit ?? 0) + REREAD
    if (t + rest > end) continue
    segs.push({ q: i, t0: t, t1: t + rest, kind: 'second' })
    t += rest
    status[i] = 'solved'
    upgrade[i] = t
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
  const [limit, setLimit] = useState(30)
  const [easy, setEasy] = useState(25)
  const [sweep, setSweep] = useState(false)
  const [clock, setClock] = useState(TOTAL)
  const [playing, setPlaying] = useState(false)
  const [ref, measured] = useContainerWidth<HTMLDivElement>(640)
  const W = Math.max(280, measured)

  const paper = useMemo(() => makePaper(168), [])
  const a = useMemo(() => simulate(paper, easy, null, sweep), [paper, easy, sweep])
  const b = useMemo(() => simulate(paper, easy, limit, sweep), [paper, easy, limit, sweep])
  const needed = paper.reduce((s, q) => s + easy * q.f * (q.know ? 1 : STUCK), 0)
  const known = paper.filter((q) => q.know).length
  const ceiling = known + (N - known) / 4

  useAnimationFrame((dt) => {
    setClock((c) => {
      const n = c + (dt * TOTAL) / PLAY_SECONDS
      if (n >= TOTAL) {
        setPlaying(false)
        return TOTAL
      }
      return n
    })
  }, playing)

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
          where the 90 minutes went. Slide <strong>skip after</strong> from 90 s down to about 20 s and watch the bottom score climb: time stops leaking into questions you were
          never going to crack. Then switch on <strong>guess every blank</strong> and see what the top strategy was throwing away.
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
      <div style={{ width: '100%', fontSize: '0.85rem', color: 'var(--ink-2)', lineHeight: 1.45 }}>
        This student knows how to do {known} of the {N} questions. Working through all of them in order, struggling on the unknown ones, would take about{' '}
        <strong className="tabular">{Math.round(needed / 60)} minutes</strong>, but there are only {PRELIM.minutes}. The best any strategy can do is{' '}
        <strong className="tabular">{ceiling.toFixed(1)}</strong>: all {known} known questions worked out and the other {N - known} guessed. Strategy cannot add knowledge, but it stops the
        clock from wasting it.
      </div>
    </Figure>
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
