import { useEffect, useMemo, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { Figure, Controls, Button, useAnimationFrame, useContainerWidth, mulberry32 } from '../../../../../kit'
import { PRELIM, FINAL, FUNNEL } from '../../../../../data/facts'
import css from './funnel.module.css'

/*
  The NOAI → IOAI selection funnel. Four bands (Prelim, Final, NTU stage, IOAI team).
  Dots stream down and settle in the last band each student reaches, so a band holds the students
  who STOP there (Final: 150 reach it, 90 stop; NTU: ~60 reach it, ~52 stop; team: 8, of which 4
  are hollow because 2027 may allow only 4). The Prelim band is symbolic: entry is uncapped.
  Click a band to read what that stage looks like and which skill it rewards.
*/

interface Stage {
  name: string
  short: string
  when: string
  count: string
  /** how many students end their run at this stage (shown under the count) */
  stop?: string
  colour: string
  where: string
  format: string
  who: string
  rewards: string
  prepare: { slug: string; label: string }[]
}

const STAGES: Stage[] = [
  {
    name: 'Preliminary Round',
    short: 'Prelim',
    when: 'Fri 19 Feb 2027',
    count: 'open entry, no cap',
    stop: 'most stop here',
    colour: 'var(--viz-1)',
    where: `${PRELIM.dateLabel}, in your school's computer lab (approved direct-entry students sit it at the AI Singapore office at NUS).`,
    format: `${PRELIM.questions} multiple-choice questions in ${PRELIM.minutes} minutes (about ${PRELIM.secondsPerQuestion} seconds each) on a Google Form. No calculator: pen and paper for rough work only.`,
    who: `Every eligible student whose school signs up. ${PRELIM.advance}.`,
    rewards: 'Breadth and speed: quick, confident recall across five domains (maths, computing, AI/ML/DL, generative AI and problem solving).',
    prepare: [
      { slug: 'python-basics', label: 'Code from zero' },
      { slug: 'prelim-speed-toolkit', label: 'Prelim speed drills' },
    ],
  },
  {
    name: 'Final Assessment',
    short: 'Final',
    when: 'Fri 5 Mar 2027',
    count: `about the top ${FUNNEL[1].n}`,
    stop: `${Number(FUNNEL[1].n) - Number(FUNNEL[2].n.replace('~', ''))} of them stop here`,
    colour: 'var(--viz-3)',
    where: `${FINAL.dateLabel}, two weeks after the Prelim.`,
    format: `${FINAL.format} ${FINAL.lastYear}`,
    who: `About the top ${FUNNEL[1].n} from the Prelim, ranked on total correct answers, with school seat quotas (not published) so that no single school takes too many seats; tied students may all go through. Results come as an award tier (Gold, Silver, Bronze or Participation).`,
    rewards: 'Implementation: writing classic algorithms such as gradient descent, K-means or attention from scratch in NumPy or PyTorch, plus harder code-reading MCQs.',
    prepare: [
      { slug: 'final-lab-numpy', label: 'Final lab I (NumPy)' },
      { slug: 'final-lab-pytorch', label: 'Final lab II (PyTorch)' },
    ],
  },
  {
    name: 'NTU selection and training',
    short: 'NTU stage',
    when: '8 May – 18 Jun 2027',
    count: `${FUNNEL[2].n} → ${FUNNEL[3].n} at camp`,
    stop: '~52 stop here',
    colour: 'var(--viz-5)',
    where: 'At NTU: a Selection Test on Sat 8 May 2027, four Saturday training sessions (22 May – 12 Jun) and a residential camp (14–18 Jun).',
    format: 'Run by NTU, not AI Singapore. NTU professors teach machine learning, computer vision, language and audio, and set IOAI-style tasks on real datasets.',
    who: `About the top ${FUNNEL[2].n.replace('~', '')} finalists are invited to the Selection Test; about ${FUNNEL[3].n.replace('~', '')} reached the camp in 2026. NTU re-ranks everyone, so your NOAI award tier is not the final word.`,
    rewards: 'Building and tuning real models on real data, and judging which approach suits a problem.',
    prepare: [{ slug: 'road-to-ioai', label: 'Beyond NOAI: the road to IOAI' }],
  },
  {
    name: 'IOAI team',
    short: 'IOAI',
    when: '4–10 Jul 2027',
    count: `${FUNNEL[4].n} places`,
    colour: 'var(--viz-2)',
    where: 'The International Olympiad in AI, hosted in Singapore by AI Singapore and NTU.',
    format: 'In 2026 the individual contest was 6 tasks over two 6-hour days (machine learning, vision, language and multimodal problems), in JupyterLab with GPUs and no internet.',
    who: 'Singapore Citizens and PRs only, aged 20 or under on 1 July 2027. Singapore sent 8 students in past years; from 2027 IOAI allows one national team per country, so there may be only 4 places.',
    rewards: 'Open-ended modelling under time pressure: understand a new task, build a baseline, then beat it.',
    prepare: [{ slug: 'road-to-ioai', label: 'Beyond NOAI: the road to IOAI' }],
  },
]

/** Dots that come to rest in each band. Prelim is symbolic (uncapped); then 150 → 60 → 8 reach the next stages. */
const STOPS = [240, 90, 52, 8]
const DURATION = 6.5 // seconds for one full stream

interface Dot {
  band: number
  x: number
  y: number
  sx: number
  start: number
  travel: number
  hollow: boolean
}

function geometry(W: number) {
  const narrow = W < 520
  const H = narrow ? 330 : 360
  const fw = narrow ? Math.round(W * 0.5) : Math.min(Math.round(W * 0.5), 330)
  const left = 6
  const cx = left + fw / 2
  const top = 24
  const bottom = H - 6
  const fr = [0.33, 0.26, 0.22, 0.19]
  const gap = 5
  const widths = [1, 0.64, 0.38, 0.21, 0.11].map((f) => f * fw)
  const avail = bottom - top - gap * 3
  const bands: { y0: number; y1: number; w0: number; w1: number }[] = []
  let y = top
  for (let i = 0; i < 4; i++) {
    const h = avail * fr[i]
    bands.push({ y0: y, y1: y + h, w0: widths[i], w1: widths[i + 1] })
    y += h + gap
  }
  return { narrow, H, fw, cx, top, bands, labelX: left + fw + (narrow ? 12 : 22) }
}

const halfWidthAt = (b: { y0: number; y1: number; w0: number; w1: number }, y: number) => (b.w0 + ((b.w1 - b.w0) * (y - b.y0)) / (b.y1 - b.y0)) / 2

export default function SelectionFunnel() {
  const [wrapRef, measured] = useContainerWidth<HTMLDivElement>(640)
  const W = Math.max(300, measured)
  const [sel, setSel] = useState(0)
  const [p, setP] = useState(1)
  const [playing, setPlaying] = useState(false)
  const g = geometry(W)
  const r = g.narrow ? 2.4 : 3

  const dots = useMemo<Dot[]>(() => {
    const rng = mulberry32(2027)
    const rr = g.narrow ? 2.4 : 3
    const out: Dot[] = []
    STOPS.forEach((n, band) => {
      const b = g.bands[band]
      const placed: [number, number][] = []
      for (let i = 0; i < n; i++) {
        let x = g.cx
        let y = (b.y0 + b.y1) / 2
        if (band === 3) {
          // the team: two neat rows of four; the second row is hollow (maybe only 4 places in 2027)
          const row = Math.floor(i / 4)
          const col = i % 4
          x = g.cx + (col - 1.5) * (rr * 2.9)
          y = b.y0 + (b.y1 - b.y0) * (row === 0 ? 0.34 : 0.68)
        } else {
          let best: [number, number] = [x, y]
          let bestD = -1
          for (let tries = 0; tries < 12; tries++) {
            const ty = b.y0 + (b.y1 - b.y0) * (0.12 + 0.76 * rng())
            const hw = halfWidthAt(b, ty) - rr - 3
            const tx = g.cx + (2 * rng() - 1) * Math.max(2, hw)
            const d = placed.reduce((m, [px, py]) => Math.min(m, Math.hypot(px - tx, py - ty)), 1e9)
            if (d > bestD) {
              bestD = d
              best = [tx, ty]
            }
            if (d > rr * (band === 0 ? 1.9 : 2.3)) break
          }
          ;[x, y] = best
        }
        placed.push([x, y])
        out.push({ band, x, y, sx: g.cx + (2 * rng() - 1) * (g.fw / 2 - 10), start: 0, travel: 0.18 + band * 0.05, hollow: band === 3 && i >= 4 })
      }
    })
    // shuffle the entry order so deeper dots are spread through the stream
    const order = out.map((_, i) => i)
    const rng2 = mulberry32(7)
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rng2() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }
    order.forEach((di, rank) => {
      out[di].start = (0.72 - out[di].travel * 0.5) * (rank / order.length)
    })
    return out
  }, [W]) // eslint-disable-line react-hooks/exhaustive-deps

  useAnimationFrame((dt) => {
    setP((v) => Math.min(1, v + dt / DURATION))
  }, playing)
  useEffect(() => {
    if (playing && p >= 1) setPlaying(false)
  }, [playing, p])

  const play = () => {
    if (playing) setPlaying(false)
    else {
      if (p >= 1) setP(0)
      setPlaying(true)
    }
  }

  const onKey = (i: number) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSel(i)
    }
  }

  const stage = STAGES[sel]
  const arrived = STOPS.map((_, band) => dots.filter((d) => d.band >= band && p >= d.start + d.travel).length)

  return (
    <Figure
      title="From open entry to a team of a handful"
      caption={
        <>
          Press <strong>Play the stream</strong>. From the Final onwards one dot is one student, and each dot settles in the <em>last</em> stage that student reaches: the green
          band holds the 90 finalists who stop at the Final, while the 60 who go on settle lower down (the counts under the button add them up). Hollow dots are team places that
          may not exist in 2027, when IOAI allows one team per country. The Prelim band is only symbolic, because entry is uncapped. Then click (or tap) each band and compare the{' '}
          <strong>Rewards</strong> line: it changes at every stage.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%' }}>
        <svg className="plot" viewBox={`0 0 ${W} ${g.H}`} role="img" aria-label="A funnel with four bands: Preliminary Round (open entry), Final (top 150), NTU selection (about 60, about 10 at camp) and the IOAI team (4 to 8).">
          {g.bands.map((b, i) => {
            const s = STAGES[i]
            const on = i === sel
            const pts = `${g.cx - b.w0 / 2},${b.y0} ${g.cx + b.w0 / 2},${b.y0} ${g.cx + b.w1 / 2},${b.y1} ${g.cx - b.w1 / 2},${b.y1}`
            const my = (b.y0 + b.y1) / 2
            const edge = g.cx + halfWidthAt(b, my)
            return (
              <g
                key={s.short}
                role="button"
                tabIndex={0}
                aria-pressed={on}
                aria-label={`${s.name}, ${s.when}, ${s.count}. Show details.`}
                onClick={() => setSel(i)}
                onKeyDown={onKey(i)}
                onFocus={() => setSel(i)}
                style={{ cursor: 'pointer', outline: 'none', ['--band' as string]: s.colour } as CSSProperties}
                className={css.band}
              >
                <polygon
                  points={pts}
                  style={{
                    fill: `color-mix(in srgb, ${s.colour} ${on ? 22 : 10}%, var(--surface))`,
                    stroke: s.colour,
                    strokeWidth: on ? 2.5 : 1.2,
                    strokeLinejoin: 'round',
                  }}
                />
                <line className={css.leader} x1={edge + 3} x2={g.labelX - 5} y1={my} y2={my} style={{ stroke: on ? s.colour : 'var(--viz-muted)', strokeWidth: on ? 1.8 : 1, strokeDasharray: on ? undefined : '3 3' }} />
                <rect x={g.labelX - 4} y={my - 26} width={Math.max(10, W - g.labelX + 2)} height={52} style={{ fill: 'transparent' }} />
                <text x={g.labelX} y={my - 8} style={{ fill: on ? `color-mix(in srgb, ${s.colour} 65%, var(--ink))` : 'var(--ink)', fontSize: g.narrow ? 13 : 14, fontWeight: 750 }}>
                  {g.narrow ? s.short : s.name}
                  {on ? '' : ' ▸'}
                </text>
                <text x={g.labelX} y={my + 8} style={{ fill: 'var(--ink-2)', fontSize: 12, fontWeight: 600 }}>
                  {s.when}
                </text>
                <text x={g.labelX} y={my + 23} style={{ fill: 'var(--ink-2)', fontSize: 12 }}>
                  {s.count}
                </text>
                {s.stop && (
                  <text x={g.labelX} y={my + 37} style={{ fill: 'var(--ink-3)', fontSize: 11.5, fontStyle: 'italic' }}>
                    {s.stop}
                  </text>
                )}
              </g>
            )
          })}
          <g aria-hidden="true" style={{ pointerEvents: 'none' }}>
            {dots.map((d, i) => {
              const q = Math.max(0, Math.min(1, (p - d.start) / d.travel))
              if (q <= 0) return null
              const e = 1 - (1 - q) * (1 - q)
              const x = d.sx + (d.x - d.sx) * e
              const y = g.top - 16 + (d.y - (g.top - 16)) * e
              const c = STAGES[d.band].colour
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={d.band === 3 ? r + 0.8 : r}
                  style={{
                    fill: d.hollow ? 'var(--surface)' : c,
                    stroke: d.hollow ? c : 'none',
                    strokeWidth: d.hollow ? 1.5 : 0,
                    opacity: Math.min(1, q * 4) * (d.band === 0 ? 0.75 : 0.95),
                  }}
                />
              )
            })}
          </g>
        </svg>
      </div>
      <Controls>
        <Button primary onClick={play}>
          {playing ? 'Pause' : p >= 1 ? 'Play the stream' : 'Resume'}
        </Button>
        <span style={{ fontSize: '0.875rem', color: 'var(--ink-2)' }} className="tabular">
          Reached the Final: <strong>{arrived[1]}</strong> · NTU: <strong>{arrived[2]}</strong> · team: <strong>{arrived[3]}</strong>
        </span>
      </Controls>
      <StageCard stage={stage} narrow={g.narrow} />
    </Figure>
  )
}

const rowWide: CSSProperties = { display: 'grid', gridTemplateColumns: 'minmax(6.5rem, max-content) 1fr', gap: '0.2rem 0.8rem', alignItems: 'baseline' }
const rowNarrow: CSSProperties = { display: 'grid', gap: '0.1rem' }
const dt: CSSProperties = { fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.03em' }

function StageCard({ stage, narrow }: { stage: Stage; narrow: boolean }) {
  const row = narrow ? rowNarrow : rowWide
  return (
    <div
      aria-live="polite"
      style={{
        width: '100%',
        borderLeft: `5px solid ${stage.colour}`,
        background: 'var(--surface-2)',
        borderRadius: 'var(--radius-m)',
        padding: '0.8rem 1rem',
        display: 'grid',
        gap: '0.55rem',
        fontSize: '0.92rem',
        lineHeight: 1.45,
      }}
    >
      <div style={{ fontWeight: 800, fontSize: '1.02rem', color: 'var(--ink)' }}>{stage.name}</div>
      <div style={row}>
        <span style={dt}>When, where</span>
        <span>{stage.where}</span>
      </div>
      <div style={row}>
        <span style={dt}>Format</span>
        <span>{stage.format}</span>
      </div>
      <div style={row}>
        <span style={dt}>Who</span>
        <span>{stage.who}</span>
      </div>
      <div style={row}>
        <span style={dt}>Rewards</span>
        <span style={{ fontWeight: 700, color: 'var(--ink)', background: `color-mix(in srgb, ${stage.colour} 14%, transparent)`, borderRadius: 4, padding: '0 0.25rem' }}>{stage.rewards}</span>
      </div>
      <div style={row}>
        <span style={dt}>Prepare with</span>
        <span>
          {stage.prepare.map((m, i) => (
            <span key={m.slug}>
              {i > 0 && ' · '}
              <Link to={`/learn/${m.slug}`}>{m.label}</Link>
            </span>
          ))}
        </span>
      </div>
    </div>
  )
}
