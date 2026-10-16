import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Path, Label, Rect, DraggablePoint, usePlot, mulberry32, M, useNarrow } from '../../../../../kit'

/*
  IOAI task scoring (IOAI 2026 Contest Rules §2.5) and medal rule (§5):
    Max   = max(0.9 × SC_solution, best submission)
    score = clip( (yours − baseline) / (Max − baseline) × 100, 0, 100 )
  Gold: smallest score band holding ≥ 1/12 of contestants; gold+silver ≥ 1/4; any medal ≥ 1/2.
  The 440-contestant field below is SIMULATED (seeded), sized like IOAI 2026.
*/

const N = 440
const TASKS = 6

function simulateField(): number[] {
  const rnd = mulberry32(20270704)
  const normal = () => {
    const u = Math.max(1e-12, rnd())
    const v = rnd()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  const b = [0.2, -0.4, 0, -0.7, 0.3, -0.3]
  const out: number[] = []
  for (let i = 0; i < N; i++) {
    const a = normal()
    let total = 0
    for (let t = 0; t < TASKS; t++) {
      const z = 1.1 * a + b[t] - 0.1 + 0.9 * normal()
      const pStuck = 1 / (1 + Math.exp(1.6 * a + 1.2 + b[t]))
      total += rnd() < pStuck ? 0 : 100 / (1 + Math.exp(-z))
    }
    out.push(total)
  }
  return out.sort((x, y) => y - x)
}

const FIELD = simulateField()
const cutAt = (frac: number) => FIELD[Math.ceil(N * frac) - 1]
const GOLD = cutAt(1 / 12)
const SILVER = cutAt(1 / 4)
const BRONZE = cutAt(1 / 2)

const MEDAL = {
  gold: { name: 'Gold', colour: 'color-mix(in srgb, var(--viz-6) 55%, var(--highlight))' },
  silver: { name: 'Silver', colour: 'color-mix(in srgb, var(--ink-3) 55%, var(--surface))' },
  bronze: { name: 'Bronze', colour: 'var(--viz-2)' },
  none: { name: 'No medal', colour: 'var(--surface-3)' },
}
/** series colour pulled towards the ink, so small text stays readable in both themes */
const textOf = (c: string) => `color-mix(in srgb, ${c} 60%, var(--ink))`
const medalOf = (t: number) => (t >= GOLD ? MEDAL.gold : t >= SILVER ? MEDAL.silver : t >= BRONZE ? MEDAL.bronze : MEDAL.none)

const TOP = 0.62
const BOT = 0.1

interface Tag {
  x: number
  text: string
  colour: string
  bold?: boolean
}

/** Labels above the raw-metric axis, stacked on up to five levels so they do not overlap. */
function TagRow({ tags }: { tags: Tag[] }) {
  const { xs, ys } = usePlot()
  const sorted = [...tags].sort((a, b) => a.x - b.x)
  const ends = [-1e9, -1e9, -1e9, -1e9, -1e9]
  const [x0, x1] = xs.range()
  const placed = sorted.map((t) => {
    const px = xs(t.x)
    const w = t.text.length * 6.6 + 8
    const cx = Math.min(x1 - w / 2, Math.max(x0 + w / 2, px))
    let lvl = ends.findIndex((e) => cx - w / 2 > e)
    if (lvl < 0) lvl = ends.length - 1
    ends[lvl] = cx + w / 2
    return { ...t, px, cx, lvl }
  })
  return (
    <g>
      {placed.map((t) => {
        const y = ys(TOP) - 14 - t.lvl * 15
        const cx = t.cx
        return (
          <g key={t.text}>
            <line x1={t.px} x2={t.px} y1={ys(TOP) - 6} y2={y + 3} style={{ stroke: t.colour, strokeWidth: 1, opacity: 0.7 }} />
            <text x={cx} y={y} textAnchor="middle" style={{ fontSize: 11.5, fontWeight: t.bold ? 800 : 650, fill: textOf(t.colour), paintOrder: 'stroke', stroke: 'var(--surface)', strokeWidth: 4, strokeLinejoin: 'round' }}>
              {t.text}
            </text>
          </g>
        )
      })}
    </g>
  )
}

function Ticks({ y, step, fmt, below }: { y: number; step: number; fmt: (v: number) => string; below?: boolean }) {
  const { xs, ys } = usePlot()
  const vals: number[] = []
  for (let v = 0; v <= 100 + 1e-9; v += step) vals.push(v)
  return (
    <g>
      {vals.map((v) => (
        <g key={v} transform={`translate(${xs(v)},${ys(y)})`}>
          <line y1={-3} y2={3} style={{ stroke: 'var(--viz-axis)' }} />
          <text y={below ? 15 : -6} textAnchor="middle" style={{ fontSize: 10.5, fill: 'var(--ink-3)' }}>
            {fmt(v)}
          </text>
        </g>
      ))}
    </g>
  )
}

export default function ScoreNormalisation() {
  const [base, setBase] = useState(60)
  const [sc, setSc] = useState(95)
  const [others, setOthers] = useState(90)
  const [you, setYou] = useState(85)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)

  const best = Math.max(others, you)
  const maxScore = Math.max(0.9 * sc, best)
  const raw = maxScore > base ? ((you - base) / (maxScore - base)) * 100 : 0
  const score = Math.max(0, Math.min(100, raw))
  const total = score * TASKS
  const medal = medalOf(total)
  const spiky = 2 * 100

  const tags: Tag[] = [
    { x: base, text: 'baseline', colour: 'var(--viz-neg)', bold: true },
    { x: 0.9 * sc, text: narrow ? '0.9×SC' : '0.9 × expert', colour: 'var(--viz-5)', bold: 0.9 * sc >= best },
    { x: sc, text: narrow ? 'SC' : 'expert (SC)', colour: 'var(--viz-5)' },
    { x: others, text: narrow ? 'rival' : 'best rival', colour: 'var(--viz-3)', bold: others >= 0.9 * sc && others >= you },
    { x: you, text: 'you', colour: 'var(--viz-1)', bold: true },
  ]

  // histogram of the simulated field
  const binW = 25
  const bins = useMemo(() => {
    const cols = new Map<number, number[]>()
    for (const t of FIELD) {
      const k = Math.min(600 / binW - 1, Math.floor(t / binW))
      if (!cols.has(k)) cols.set(k, [])
      cols.get(k)!.push(t)
    }
    return cols
  }, [])
  const maxCount = Math.max(...[...bins.values()].map((v) => v.length))

  return (
    <Figure
      title="How one result becomes a task score, and scores become medals"
      caption={
        <>
          Drag <strong>you</strong>, then raise the baseline: anything at or below it scores 0. Below, a <em>simulated</em> field of {N} shows your medal if you repeat that score on all six tasks;
          compare it with a spiky rival.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%' }}>
        <Plot x={[0, 100]} y={[0, 1]} width={560} height={215} minHeight={280} margin={{ left: 14, right: 16, top: 4, bottom: 34 }} ariaLabel="Two axes: raw accuracy on top, task score 0 to 100 below, with lines showing how the baseline maps to 0 and the maximum score maps to 100.">
          {/* below-baseline zone */}
          <Rect x0={0} x1={base} y0={TOP - 0.035} y1={TOP + 0.035} fill="color-mix(in srgb, var(--viz-neg) 22%, var(--surface))" />
          {/* the stretch band */}
          <Path
            points={[
              [base, TOP],
              [maxScore, TOP],
              [100, BOT],
              [0, BOT],
            ]}
            closed
            fill="color-mix(in srgb, var(--viz-1) 12%, transparent)"
            color="color-mix(in srgb, var(--viz-1) 40%, transparent)"
            width={1}
          />
          {/* axes */}
          <Path points={[[0, TOP], [100, TOP]]} color="var(--viz-axis)" width={1.5} />
          <Path points={[[0, BOT], [100, BOT]]} color="var(--viz-axis)" width={1.5} />
          <Rect x0={base} x1={maxScore} y0={TOP - 0.03} y1={TOP + 0.03} fill="color-mix(in srgb, var(--viz-1) 45%, var(--surface))" />
          <Ticks y={TOP} step={narrow ? 20 : 10} fmt={(v) => `${v}%`} below />
          <Ticks y={BOT} step={25} fmt={(v) => `${v}`} below />
          <Label x={0} y={TOP} dy={30} color="var(--ink-2)" size={11.5} weight={700}>
            raw metric: accuracy on the hidden test set
          </Label>
          <Label x={0} y={BOT} dy={30} color="var(--ink-2)" size={11.5} weight={700}>
            task score, 0 to 100
          </Label>
          <TagRow tags={tags} />
          {/* your mapping */}
          <Path points={[[you, TOP], [score, BOT]]} color="var(--viz-1)" width={2.5} dash="5 3" />
          <Label x={score} y={BOT} dy={-8} anchor={score > 80 ? 'end' : score < 20 ? 'start' : 'middle'} color={textOf('var(--viz-1)')} size={13} weight={800}>
            {score.toFixed(1)}
          </Label>
          <DraggablePoint x={you} y={TOP} lockY onChange={(x) => setYou(Math.round(x * 2) / 2)} color="var(--viz-1)" />
        </Plot>
      </div>

      <Controls>
        <Slider label="baseline (Min)" value={base} min={0} max={85} step={1} onChange={(v) => setBase(Math.min(v, Math.floor(0.9 * sc) - 1))} format={(v) => `${v}%`} />
        <Slider label="expert solution (SC)" value={sc} min={50} max={100} step={1} onChange={(v) => setSc(Math.max(v, Math.ceil((base + 1) / 0.9)))} format={(v) => `${v}%`} />
        <Slider label="best rival's result" value={others} min={0} max={100} step={0.5} onChange={setOthers} format={(v) => `${v}%`} />
      </Controls>
      <Readout
        items={[
          [<M key="m">{'\\text{Max}'}</M>, `max(${(0.9 * sc).toFixed(1)}, ${best.toFixed(1)}) = ${maxScore.toFixed(1)}%`],
          ['your task score', you <= base ? `${score.toFixed(1)} (at or below baseline)` : `(${(you - base).toFixed(1)} ÷ ${(maxScore - base).toFixed(1)}) × 100 = ${score.toFixed(1)}`],
        ]}
      />

      <Plot x={[0, 600]} y={[0, maxCount + 7]} width={560} height={200} minHeight={190} margin={{ left: 14, right: 14, top: 10, bottom: 30 }} ariaLabel={`Simulated totals of ${N} contestants out of 600, coloured by medal, with your total and a spiky rival marked.`}>
        {[...bins.entries()].map(([k, list]) =>
          list
            .slice()
            .sort((a, b) => a - b)
            .map((t, i) => <Rect key={`${k}-${i}`} x0={k * binW + 1.5} x1={(k + 1) * binW - 1.5} y0={i + 0.12} y1={i + 0.88} fill={medalOf(t).colour} stroke={t < BRONZE ? 'var(--viz-muted)' : undefined} />),
        )}
        <Path points={[[0, 0], [600, 0]]} color="var(--viz-axis)" width={1.5} />
        {[0, 100, 200, 300, 400, 500, 600].map((v) => (
          <Label key={v} x={v} y={0} dy={15} anchor={v === 0 ? 'start' : v === 600 ? 'end' : 'middle'} color="var(--ink-3)" size={10.5}>
            {v}
          </Label>
        ))}
        <Label x={300} y={0} dy={27} anchor="middle" color="var(--ink-2)" size={11} weight={700}>
          total over 6 tasks (simulated field)
        </Label>
        <Path points={[[spiky, 0], [spiky, maxCount + 3]]} color="var(--viz-4)" width={2} dash="4 3" />
        <Label x={spiky} y={maxCount + 3} dy={-3} anchor="end" dx={-3} color={textOf('var(--viz-4)')} size={11.5} weight={700}>
          spiky rival 200
        </Label>
        <Path points={[[total, 0], [total, maxCount + 6]]} color="var(--viz-1)" width={2.5} />
        <Label x={total} y={maxCount + 6} dy={-2} anchor={total > 450 ? 'end' : 'start'} dx={total > 450 ? -4 : 4} color="var(--viz-1)" size={12} weight={800}>
          {`you ${Math.round(total)}`}
        </Label>
      </Plot>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.3rem 0.9rem', fontSize: '0.8rem', color: 'var(--ink-2)' }} aria-hidden="true">
        {Object.values(MEDAL).map((m) => (
          <span key={m.name} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '0.8rem', height: '0.8rem', borderRadius: 2, background: m.colour, display: 'inline-block', boxSizing: 'border-box', border: m === MEDAL.none ? '1px solid var(--viz-muted)' : undefined }} />
            {m.name}
          </span>
        ))}
      </div>
      <Readout
        items={[
          ['cut-offs (this field)', `Gold ≥ ${Math.round(GOLD)}, Silver ≥ ${Math.round(SILVER)}, Bronze ≥ ${Math.round(BRONZE)}`],
          ['you (6 × task score)', `${Math.round(total)} → ${medal.name}`],
        ]}
      />
    </Figure>
  )
}
