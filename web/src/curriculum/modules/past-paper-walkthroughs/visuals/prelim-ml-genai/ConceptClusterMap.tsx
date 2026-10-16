import { useMemo, useState } from 'react'
import { Figure, Button, QuestionCard, useContainerWidth, mulberry32, shuffled } from '../../../../../kit'
import { loadPaper, toQuiz, type PaperQuestion } from '../../../../../data/papers'
import { CLUSTERS, CLUSTER_TOTAL, blockOf, type Cluster } from './clusters'
import s from '../prelim-maths-computing/pp.module.css'

/*
  A treemap of the concept clusters behind the 136 AI/ML/DL and Generative AI questions of the
  2026 Prelim (Q120–255). Tile area = number of questions. Click a tile to see what the cluster
  tests and its confusable pairs, then practise its real questions in a five-question round.
*/

interface Box {
  x: number
  y: number
  w: number
  h: number
}

/** squarified treemap layout of `values` (sorted large → small) in a w × h rectangle */
function squarify(values: number[], w: number, h: number): Box[] {
  const total = values.reduce((a, v) => a + v, 0)
  const areas = values.map((v) => (v / total) * w * h)
  const out: Box[] = []
  const worst = (row: number[], side: number) => {
    const sum = row.reduce((a, v) => a + v, 0)
    const mx = Math.max(...row)
    const mn = Math.min(...row)
    return Math.max((side * side * mx) / (sum * sum), (sum * sum) / (side * side * mn))
  }
  let rest = areas
  let x = 0
  let y = 0
  let W = w
  let H = h
  while (rest.length) {
    const side = Math.min(W, H)
    let i = 1
    while (i < rest.length && worst(rest.slice(0, i + 1), side) <= worst(rest.slice(0, i), side)) i++
    const row = rest.slice(0, i)
    const sum = row.reduce((a, v) => a + v, 0)
    if (W >= H) {
      const cw = sum / H
      let yy = y
      for (const a of row) {
        out.push({ x, y: yy, w: cw, h: a / cw })
        yy += a / cw
      }
      x += cw
      W -= cw
    } else {
      const rh = sum / W
      let xx = x
      for (const a of row) {
        out.push({ x: xx, y, w: a / rh, h: rh })
        xx += a / rh
      }
      y += rh
      H -= rh
    }
    rest = rest.slice(i)
  }
  return out
}

const ROUND = 5

export default function ConceptClusterMap() {
  const [ref, width] = useContainerWidth<HTMLDivElement>(640)
  const narrow = width < 520
  const aspect = narrow ? 0.8 : 1.6 // width / height (chosen so the smallest tile still fits its label)
  const sorted = useMemo(() => [...CLUSTERS].sort((a, b) => b.items.length - a.items.length), [])
  const boxes = useMemo(
    () =>
      squarify(
        sorted.map((c) => c.items.length),
        aspect,
        1,
      ),
    [sorted, aspect],
  )
  const [sel, setSel] = useState('nn')
  const c = CLUSTERS.find((x) => x.id === sel)!

  return (
    <Figure
      title="Where the AI and GenAI marks were"
      caption={
        <>
          Each tile is one concept cluster; its area is the number of 2026 Prelim questions on it ({CLUSTER_TOTAL} questions, Q120–255). Click a tile to see what it tests and the pairs of ideas its questions confuse, then press <strong>Practise</strong> for a quick-fire round of its real questions. Notice that four clusters hold more than half the questions.
        </>
      }
    >
      <div className={s.wrap} ref={ref}>
        <div className={s.treemap} style={{ aspectRatio: String(aspect) }} role="group" aria-label="Concept clusters sized by number of questions">
          {sorted.map((cl, i) => {
            const b = boxes[i]
            const on = cl.id === sel
            return (
              <button
                key={cl.id}
                type="button"
                className={`${s.tile}${on ? ` ${s.tileOn}` : ''}`}
                aria-pressed={on}
                aria-label={`${cl.name}: ${cl.items.length} questions`}
                onClick={() => setSel(cl.id)}
                style={{
                  left: `${(b.x / aspect) * 100}%`,
                  top: `${b.y * 100}%`,
                  width: `${(b.w / aspect) * 100}%`,
                  height: `${b.h * 100}%`,
                  background: `color-mix(in srgb, ${cl.colour} ${on ? 48 : 26}%, var(--surface))`,
                  padding: narrow ? '0.25rem 0.3rem' : undefined,
                }}
              >
                <span className={s.tileName} style={narrow ? { fontSize: '0.68rem' } : undefined}>
                  {cl.short}
                </span>
                <span className={`${s.tileCount} tabular`}>{cl.items.length}</span>
              </button>
            )
          })}
        </div>
        <ClusterPanel key={c.id} c={c} />
      </div>
    </Figure>
  )
}

function ClusterPanel({ c }: { c: Cluster }) {
  const [round, setRound] = useState<number[] | null>(null)
  const [pos, setPos] = useState(0)
  const [sel, setSel] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [qs, setQs] = useState<Record<number, PaperQuestion>>({})
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [seed, setSeed] = useState(1)
  const share = Math.round((c.items.length / CLUSTER_TOTAL) * 100)

  const start = async (only?: number) => {
    setLoading(true)
    setFailed(false)
    let all: PaperQuestion[]
    try {
      all = await loadPaper('prelim2026')
    } catch {
      setLoading(false)
      setFailed(true)
      return
    }
    const byN: Record<number, PaperQuestion> = {}
    for (const q of all) byN[q.n] = q
    setQs(byN)
    const usable = c.items.filter((n) => byN[n] && byN[n].confidence !== 'low')
    const picked = only != null ? [only] : shuffled(usable, mulberry32(seed * 7919 + c.items[0])).slice(0, ROUND)
    setSeed((x) => x + 1)
    setRound(picked)
    setPos(0)
    setSel(null)
    setScore(0)
    setLoading(false)
  }

  const blocks = [...new Set(c.items.map(blockOf))].join(' and ')
  const q = round ? qs[round[pos]] : null

  return (
    <div className={s.card}>
      <div className={s.spread}>
        <span className={s.cardTitle}>{c.name}</span>
        <span className={`${s.small} tabular`}>
          {c.items.length} questions · {share}% of Q120–255
        </span>
      </div>
      <div className={s.small}>
        <strong>What it tests:</strong> {c.tests} <span className={s.muted}>(From the {blocks}.)</span>
      </div>
      <div className={s.kv}>
        <span className={s.kvKey}>Confusable pairs to learn</span>
        <ul className={s.pairList} style={{ color: 'var(--ink)' }}>
          {c.pairs.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
      <div className={s.kv}>
        <span className={s.kvKey}>Its 2026 questions (tap one to try it)</span>
        <div className={s.row}>
          {c.items.map((n) => (
            <button key={n} type="button" className={`${s.chip}${round?.length === 1 && round[0] === n ? ` ${s.chipOn}` : ''}`} onClick={() => start(n)}>
              Q{n}
            </button>
          ))}
        </div>
      </div>
      <div className={s.spread}>
        <span className={s.small}>
          Taught in:{' '}
          {c.lessons.map((l, i) => (
            <span key={l.href}>
              {i > 0 && ' · '}
              <a href={l.href}>{l.label}</a>
            </span>
          ))}
        </span>
        <Button primary onClick={() => start()} disabled={loading}>
          {loading ? 'Loading…' : `Practise ${Math.min(ROUND, c.items.length)} at random`}
        </Button>
      </div>
      {failed && <span className={s.small}>The questions could not be loaded. Check your connection and press the button again.</span>}

      {round && q && (
        <div className={s.wrap}>
          <span className={`${s.label} tabular`}>
            {round.length > 1 ? `Quick-fire · question ${pos + 1} of ${round.length} · score ${score}` : 'Single question'}
          </span>
          <QuestionCard
            key={q.n}
            q={toQuiz('prelim2026', q)}
            selected={sel}
            revealed={sel != null}
            shuffle={false}
            meta={`2026 Prelim · Q${q.n}`}
            onSelect={(i) => {
              if (sel != null) return
              setSel(i)
              if (i === q.answer) setScore((x) => x + 1)
            }}
          />
          {sel != null && (
            <div className={s.row}>
              {pos < round.length - 1 ? (
                <Button
                  primary
                  onClick={() => {
                    setPos(pos + 1)
                    setSel(null)
                  }}
                >
                  Next question →
                </Button>
              ) : (
                <>
                  {round.length > 1 && (
                    <span className={`${s.small} tabular`}>
                      Round over: <strong>{score}</strong> of {round.length}. {score === round.length ? 'Cluster mastered for now.' : 'Open the lessons above for the ones you missed.'}
                    </span>
                  )}
                  <Button onClick={() => start()}>New round</Button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
