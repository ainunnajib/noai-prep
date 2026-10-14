import { useId, useState, type ReactNode } from 'react'
import { Figure, Controls, Slider, Button, useNarrow, useContainerWidth } from '../../../../../kit'
import { highlightPy, Py } from './pyCode'
import s from './ui.module.css'

/*
  An if/elif/elif/else grading chain shown three ways at once: the code (with each condition
  marked True / False / skipped), a flowchart with the path Python takes, and a "band map"
  of the band every score from 0 to 100 receives. Reordering the elif lines shows how a broad
  condition placed first swallows the scores meant for the branches below it.
*/

interface Branch {
  id: string
  min: number
  band: string
}
const BR: Record<string, Branch> = {
  A: { id: 'A', min: 80, band: 'A' },
  B: { id: 'B', min: 65, band: 'B' },
  C: { id: 'C', min: 50, band: 'C' },
}
const CORRECT = ['A', 'B', 'C']
const ELSE_BAND = 'U'
const BAND_COLOUR: Record<string, string> = { A: 'var(--viz-3)', B: 'var(--viz-1)', C: 'var(--viz-2)', U: 'var(--viz-muted)' }

/** idx = position of the first True branch in `order`, or -1 when the else runs. */
function run(score: number, order: string[]) {
  for (let i = 0; i < order.length; i++) if (score >= BR[order[i]].min) return { idx: i, band: BR[order[i]].band }
  return { idx: -1, band: ELSE_BAND }
}

function runs(order: string[]) {
  const out: { a: number; b: number; band: string; wrong: boolean }[] = []
  for (let sc = 0; sc <= 100; sc++) {
    const band = run(sc, order).band
    const wrong = band !== run(sc, CORRECT).band
    const last = out[out.length - 1]
    if (last && last.band === band && last.wrong === wrong) last.b = sc
    else out.push({ a: sc, b: sc, band, wrong })
  }
  return out
}

/* ---------------- flowchart ---------------- */
const FW = 330
const CX = 92
const HW = 84
const HH = 25
const YS = [34, 108, 182]
const Y_ELSE = 254
const Y_PRINT = 324
const BOX_X = 204
const BOX_W = 96
const BUS_X = 316
const FH = 372

function Flowchart({ order, score }: { order: string[]; score: number }) {
  const { idx, band } = run(score, order)
  const checked = (i: number) => idx === -1 || idx >= i
  const on = 'var(--accent)'
  const off = 'var(--viz-muted)'
  const edge = (taken: boolean) => ({ stroke: taken ? on : off, strokeWidth: taken ? 3 : 1.5, fill: 'none', opacity: taken ? 1 : 0.7 })
  const head = (x: number, y: number, dir: 'down' | 'right' | 'left', taken: boolean) => {
    const d =
      dir === 'down'
        ? `M${x},${y}l-5,-8h10z`
        : dir === 'right'
          ? `M${x},${y}l-8,-5v10z`
          : `M${x},${y}l8,-5v10z`
    return <path d={d} style={{ fill: taken ? on : off, opacity: taken ? 1 : 0.7 }} />
  }
  const busFrom = idx >= 0 ? YS[idx] : null

  return (
    <svg viewBox={`0 0 ${FW} ${FH}`} className={s.svgFull} style={{ maxWidth: 380 }} role="img" aria-label={`Flowchart of the grading code. With score ${score}, the path ends with band ${band}.`}>
      {/* the "bus" collecting every yes-branch into print(band) */}
      <path d={`M${BUS_X},${YS[0]}V${Y_PRINT}H${CX + 66}`} style={edge(false)} />
      {busFrom !== null && <path d={`M${BUS_X},${busFrom}V${Y_PRINT}H${CX + 74}`} style={edge(true)} />}
      {head(CX + 66, Y_PRINT, 'left', busFrom !== null)}

      {order.map((id, i) => {
        const b = BR[id]
        const y = YS[i]
        const seen = checked(i)
        const yes = idx === i
        const noTaken = seen && !yes
        return (
          <g key={id}>
            {/* yes edge + box */}
            <path d={`M${CX + HW},${y}H${BOX_X - 2}`} style={edge(yes)} />
            {head(BOX_X, y, 'right', yes)}
            <text x={CX + HW + 3} y={y - 6} className={s.svgSmall} style={{ fill: yes ? on : 'var(--ink-3)' }}>
              yes
            </text>
            <rect
              x={BOX_X}
              y={y - 16}
              width={BOX_W}
              height={32}
              rx={7}
              style={{
                fill: yes ? 'var(--accent-soft)' : 'var(--surface)',
                stroke: yes ? on : 'var(--rule)',
                strokeWidth: yes ? 2 : 1.25,
                opacity: yes ? 1 : 0.55,
              }}
            />
            <text x={BOX_X + BOX_W / 2} y={y + 4.5} textAnchor="middle" className={s.svgMono} style={{ fill: 'var(--ink)', opacity: yes ? 1 : 0.55 }}>
              band = "{b.band}"
            </text>
            <path d={`M${BOX_X + BOX_W},${y}H${BUS_X}`} style={edge(yes)} />
            {/* no edge to the next check */}
            <path d={`M${CX},${y + HH}V${(i < 2 ? YS[i + 1] - HH : Y_ELSE - 16) - 2}`} style={edge(noTaken)} />
            {head(CX, i < 2 ? YS[i + 1] - HH : Y_ELSE - 16, 'down', noTaken)}
            <text x={CX + 8} y={y + HH + 17} className={s.svgSmall} style={{ fill: noTaken ? on : 'var(--ink-3)' }}>
              no
            </text>
            {/* the decision diamond */}
            <path
              d={`M${CX},${y - HH}L${CX + HW},${y}L${CX},${y + HH}L${CX - HW},${y}Z`}
              style={{
                fill: !seen ? 'var(--surface)' : yes ? 'var(--ok-soft)' : 'var(--bad-soft)',
                stroke: !seen ? 'var(--rule)' : yes ? 'var(--ok)' : 'var(--bad)',
                strokeWidth: seen ? 2 : 1.25,
                opacity: seen ? 1 : 0.5,
              }}
            />
            <text x={CX} y={y - 2} textAnchor="middle" className={s.svgMono} style={{ fill: 'var(--ink)', opacity: seen ? 1 : 0.5 }}>
              score &gt;= {b.min}?
            </text>
            <text x={CX} y={y + 13} textAnchor="middle" className={s.svgSmall} style={{ fill: !seen ? 'var(--ink-3)' : yes ? 'var(--ok)' : 'var(--bad)', opacity: seen ? 1 : 0.7 }}>
              {!seen ? 'not checked' : yes ? 'True' : 'False'}
            </text>
          </g>
        )
      })}

      {/* else box */}
      <rect
        x={CX - 62}
        y={Y_ELSE - 16}
        width={124}
        height={32}
        rx={7}
        style={{ fill: idx === -1 ? 'var(--accent-soft)' : 'var(--surface)', stroke: idx === -1 ? on : 'var(--rule)', strokeWidth: idx === -1 ? 2 : 1.25, opacity: idx === -1 ? 1 : 0.55 }}
      />
      <text x={CX} y={Y_ELSE + 4.5} textAnchor="middle" className={s.svgMono} style={{ fill: 'var(--ink)', opacity: idx === -1 ? 1 : 0.55 }}>
        band = "{ELSE_BAND}"
      </text>
      <text x={CX + 68} y={Y_ELSE - 4} className={s.svgSmall} style={{ fill: 'var(--ink-3)' }}>
        else
      </text>
      <path d={`M${CX},${Y_ELSE + 16}V${Y_PRINT - 19}`} style={edge(idx === -1)} />
      {head(CX, Y_PRINT - 17, 'down', idx === -1)}

      {/* print box */}
      <rect x={CX - 66} y={Y_PRINT - 17} width={132} height={34} rx={17} style={{ fill: 'var(--highlight-soft)', stroke: 'var(--highlight)', strokeWidth: 2 }} />
      <text x={CX} y={Y_PRINT + 4.5} textAnchor="middle" className={s.svgMono} style={{ fill: 'var(--ink)' }}>
        print(band)
      </text>
      <text x={CX} y={Y_PRINT + 40} textAnchor="middle" className={s.svgMono} style={{ fill: 'var(--ink)', fontWeight: 700 }}>
        output: {band}
      </text>
    </svg>
  )
}

/* ---------------- band map ---------------- */
function BandMap({ order, score, setScore }: { order: string[]; score: number; setScore: (v: number) => void }) {
  const [ref, w] = useContainerWidth<HTMLDivElement>(520)
  const pid = useId().replace(/:/g, '')
  const W = Math.max(260, w)
  const L = 6
  const R = 6
  const X = (v: number) => L + ((W - L - R) * v) / 101
  const strips = [
    { label: 'Bands we wanted', order: CORRECT, y: 18 },
    { label: 'Bands your code gives', order, y: 62 },
  ]
  const H = 112
  const pick = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    setScore(Math.max(0, Math.min(100, Math.floor(((px - L) / (W - L - R)) * 101))))
  }
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={s.svgFull}
        style={{ touchAction: 'none', cursor: 'pointer' }}
        role="img"
        aria-label="The band that each score from 0 to 100 receives, for the intended order and for your order"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          pick(e)
        }}
        onPointerMove={(e) => e.buttons & 1 && pick(e)}
      >
        <defs>
          <pattern id={pid} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="7" style={{ stroke: 'var(--bad)', strokeWidth: 2.5 }} />
          </pattern>
        </defs>
        {strips.map((st) => (
          <g key={st.label}>
            <text x={L} y={st.y - 5} className={s.svgSmall} style={{ fill: 'var(--ink-2)' }}>
              {st.label}
            </text>
            {runs(st.order).map((r) => {
              const x0 = X(r.a)
              const x1 = X(r.b + 1)
              return (
                <g key={r.a}>
                  <rect x={x0} y={st.y} width={x1 - x0} height={22} style={{ fill: `color-mix(in srgb, ${BAND_COLOUR[r.band]} 45%, var(--surface))` }} />
                  {r.wrong && <rect x={x0} y={st.y} width={x1 - x0} height={22} style={{ fill: `url(#${pid})`, opacity: 0.55 }} />}
                  {x1 - x0 > 16 && (
                    <text x={(x0 + x1) / 2} y={st.y + 15.5} textAnchor="middle" className={s.svgMono} style={{ fill: 'var(--ink)', fontWeight: 700 }}>
                      {r.band}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        ))}
        {[0, 50, 65, 80, 100].map((v) => (
          <text key={v} x={X(v + 0.5)} y={H - 12} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 11 }}>
            {v}
          </text>
        ))}
        {/* current score marker */}
        <line x1={X(score + 0.5)} x2={X(score + 0.5)} y1={14} y2={88} style={{ stroke: 'var(--ink)', strokeWidth: 2 }} />
        <path d={`M${X(score + 0.5)},${92}l-6,8h12z`} style={{ fill: 'var(--ink)' }} />
      </svg>
    </div>
  )
}

/* ---------------- main ---------------- */
export default function FlowchartRunner() {
  const [score, setScore] = useState(72)
  const [order, setOrder] = useState<string[]>(CORRECT)
  const [ref, narrow] = useNarrow<HTMLDivElement>(640)
  const { idx, band } = run(score, order)
  const wanted = run(score, CORRECT).band
  const isCorrectOrder = order.join() === CORRECT.join()
  const bad = runs(order).filter((r) => r.wrong)

  const move = (i: number, d: -1 | 1) => {
    const o = order.slice()
    ;[o[i], o[i + d]] = [o[i + d], o[i]]
    setOrder(o)
  }

  // code lines: [text, kind, branch index]
  type Kind = 'assign' | 'cond' | 'body' | 'else' | 'elseBody' | 'print'
  const lines: { text: string; kind: Kind; i: number }[] = [{ text: `score = ${score}`, kind: 'assign', i: -1 }]
  order.forEach((id, i) => {
    lines.push({ text: `${i === 0 ? 'if' : 'elif'} score >= ${BR[id].min}:`, kind: 'cond', i })
    lines.push({ text: `    band = "${BR[id].band}"`, kind: 'body', i })
  })
  lines.push({ text: 'else:', kind: 'else', i: -1 }, { text: `    band = "${ELSE_BAND}"`, kind: 'elseBody', i: -1 }, { text: 'print(band)', kind: 'print', i: -1 })

  const checked = (i: number) => idx === -1 || idx >= i
  const lineState = (l: (typeof lines)[number]): { cls: string; mark: ReactNode; tag?: ReactNode } => {
    switch (l.kind) {
      case 'assign':
        return { cls: s.lineRun, mark: <span className={s.markTrue}>✓</span> }
      case 'cond':
        if (!checked(l.i)) return { cls: s.lineSkip, mark: '', tag: <span className={`${s.tag} ${s.tagMuted}`}>skipped</span> }
        return idx === l.i
          ? { cls: s.lineTrue, mark: <span className={s.markTrue}>✓</span>, tag: <span className={`${s.tag} ${s.tagTrue}`}>True</span> }
          : { cls: s.lineFalse, mark: <span className={s.markFalse}>✗</span>, tag: <span className={`${s.tag} ${s.tagFalse}`}>False</span> }
      case 'body':
        return idx === l.i ? { cls: s.lineNow, mark: <span className={s.markNow}>▶</span> } : { cls: s.lineSkip, mark: '' }
      case 'else':
        return idx === -1 ? { cls: s.lineTrue, mark: <span className={s.markTrue}>✓</span>, tag: <span className={`${s.tag} ${s.tagTrue}`}>reached</span> } : { cls: s.lineSkip, mark: '', tag: <span className={`${s.tag} ${s.tagMuted}`}>skipped</span> }
      case 'elseBody':
        return idx === -1 ? { cls: s.lineNow, mark: <span className={s.markNow}>▶</span> } : { cls: s.lineSkip, mark: '' }
      case 'print':
        return { cls: s.lineRun, mark: <span className={s.markTrue}>✓</span> }
    }
  }

  const fmtRange = (a: number, b: number) => (a === b ? `${a}` : `${a}–${b}`)
  const culprit = (() => {
    for (let i = 0; i < order.length; i++) for (let j = i + 1; j < order.length; j++) if (BR[order[i]].min < BR[order[j]].min) return [BR[order[i]], BR[order[j]]]
    return null
  })()

  return (
    <Figure
      wide
      title="Follow the path through if / elif / else"
      caption={
        <>
          Slide the score (or tap the band map) and watch Python check the conditions from the top: every False sends it down to the next check,
          and the <strong>first</strong> True runs its line and skips everything else. Now use the ↑ ↓ buttons to reorder the conditions. Put{' '}
          <code>score &gt;= 50</code> first and the hatched red region appears: high scores get the wrong band, because the broad condition catches
          them before the stricter ones are ever checked.
        </>
      }
    >
      <div ref={ref} className={s.wrap}>
        <div className={narrow ? s.stack : s.cols}>
          <div className={s.pane}>
            <div className={s.bar}>
              <span>grade.py</span>
              <span>{isCorrectOrder ? '' : 'reordered'}</span>
            </div>
            <ol className={s.lines} aria-label="Grading code">
              {lines.map((l, k) => {
                const st = lineState(l)
                return (
                  <li key={k} className={`${s.line} ${st.cls}`}>
                    <span className={s.gutter}>
                      <span className={s.mark}>{st.mark}</span>
                      <span>{k + 1}</span>
                    </span>
                    <span className={s.code}>{highlightPy(l.text)}</span>
                    {!narrow && st.tag}
                    {l.kind === 'cond' && (
                      <>
                        <button type="button" className={s.iconBtn} disabled={l.i === 0} onClick={() => move(l.i, -1)} aria-label={`Move the check score >= ${BR[order[l.i]].min} up`} title="Move this check up">
                          ↑
                        </button>
                        <button type="button" className={s.iconBtn} disabled={l.i === order.length - 1} onClick={() => move(l.i, 1)} aria-label={`Move the check score >= ${BR[order[l.i]].min} down`} title="Move this check down">
                          ↓
                        </button>
                      </>
                    )}
                  </li>
                )
              })}
            </ol>
            <div className={s.bar} style={{ borderTop: '1px solid var(--rule)', borderBottom: 0 }}>
              <span>Output</span>
            </div>
            <div className={s.console}>
              {band}
              <span className={s.muted} style={{ marginLeft: '0.8rem' }}>
                {band === wanted ? `(correct: ${score} should get ${wanted})` : `(wrong: ${score} should get ${wanted})`}
              </span>
            </div>
          </div>
          <div className={s.center}>
            <Flowchart order={order} score={score} />
          </div>
        </div>

        <div className={`${s.status} ${band !== wanted ? s.statusBad : ''}`} aria-live="polite">
          {idx === -1 ? (
            <>
              With <Py>{`score = ${score}`}</Py>, all three conditions are False, so Python reaches <Py>else</Py> and runs{' '}
              <Py>{`band = "${ELSE_BAND}"`}</Py>.
            </>
          ) : (
            <>
              With <Py>{`score = ${score}`}</Py>,
              {idx > 0 && (
                <>
                  {' '}
                  {order.slice(0, idx).map((id, k) => (
                    <span key={id}>
                      {k > 0 && ' and '}
                      <Py>{`score >= ${BR[id].min}`}</Py>
                    </span>
                  ))}{' '}
                  {idx > 1 ? 'are' : 'is'} False, then
                </>
              )}{' '}
              <Py>{`score >= ${BR[order[idx]].min}`}</Py> is True, so <Py>{`band = "${band}"`}</Py> runs and{' '}
              {idx < order.length - 1 ? 'every branch below it is skipped' : 'the else is skipped'}.
            </>
          )}
          {band !== wanted && <strong> That is the wrong band: {score} should get {wanted}.</strong>}
        </div>

        <BandMap order={order} score={score} setScore={setScore} />

        {bad.length > 0 && culprit && (
          <div className={`${s.status} ${s.statusWarn}`}>
            With this order, scores <strong>{bad.map((r) => fmtRange(r.a, r.b)).join(', ')}</strong> get the wrong band. The check{' '}
            <Py>{`score >= ${culprit[0].min}`}</Py> comes before <Py>{`score >= ${culprit[1].min}`}</Py>, so it catches those scores first and the
            stricter check below it never gets a chance. Put the strictest condition first.
          </div>
        )}
        {!isCorrectOrder && bad.length === 0 && (
          <div className={`${s.status} ${s.statusOk}`}>This order still gives every score the right band.</div>
        )}

        <Controls>
          <Slider label="score" value={score} min={0} max={100} step={1} onChange={setScore} />
          <Button onClick={() => setOrder(CORRECT)} disabled={isCorrectOrder}>
            Reset order
          </Button>
        </Controls>
      </div>
    </Figure>
  )
}
