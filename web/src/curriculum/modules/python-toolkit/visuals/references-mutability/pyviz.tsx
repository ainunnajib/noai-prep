import { Highlight, themes } from 'prism-react-renderer'
import { useEffect, useMemo, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { useContainerWidth, usePlayer, PlayerControls, Segmented } from '../../../../../kit'

/*
  Shared building blocks for the python-toolkit visuals written for the lessons
  references-mutability, classes-objects and exceptions-debugging:

  - CodeView: syntax-coloured code with a highlighted line, dimmed lines, clickable lines
    and optional rows inserted after a line (print probes).
  - Console: what the program has printed so far (and its errors).
  - MemoryDiagram: Python-Tutor style "names on the left, objects on the right, arrows between".
  - TraceStepper: CodeView + Console + MemoryDiagram driven by a list of precomputed steps,
    with optional predict-then-reveal questions on print lines.
  - ChoiceGroup: the kit's Segmented control on wide screens, separate wrapping chips on phones.
*/

export const MONO = 'var(--font-mono)'
const CH = 8 // approx. width of one 13px monospace character in px

/* ------------------------------------------------------------------ code view */

export function CodeView({
  code,
  active = [],
  dim,
  onLineClick,
  lineLabel,
  marks,
  inserts,
  title,
  activeTone = 'highlight',
  fontSize = 13.5,
  fitChars,
}: {
  code: string
  /** 1-based line numbers to highlight */
  active?: number[]
  /** dim this 1-based line? */
  dim?: (line: number) => boolean
  onLineClick?: (line: number) => void
  /** accessible label for a clickable line */
  lineLabel?: (line: number) => string
  /** something to show in the margin of a line (1-based), e.g. a marker */
  marks?: Record<number, ReactNode>
  /** extra rows shown after a line (1-based), e.g. inserted print probes */
  inserts?: Record<number, ReactNode>
  title?: ReactNode
  activeTone?: 'highlight' | 'bad' | 'ok'
  fontSize?: number
  /** number of characters that must fit on one line (defaults to the longest code line) */
  fitChars?: number
}) {
  const src = code.replace(/\n$/, '')
  // shrink the font (down to 11.5px) so the longest line fits on a 390px phone; anything longer scrolls inside the box
  const [wrapRef, w] = useContainerWidth<HTMLDivElement>(640)
  const longest = fitChars ?? Math.max(1, ...src.split('\n').map((l) => l.length))
  const hasMarks = Boolean(marks)
  const fit = (w - 18) / ((hasMarks ? 3.8 : 2.8) + 0.61 * longest)
  const fs = Math.max(11.5, Math.min(fontSize, fit))
  const toneBg =
    activeTone === 'bad'
      ? 'color-mix(in srgb, var(--bad) 16%, var(--surface))'
      : activeTone === 'ok'
        ? 'color-mix(in srgb, var(--ok) 16%, var(--surface))'
        : 'var(--highlight-soft)'
  const toneBar = activeTone === 'bad' ? 'var(--bad)' : activeTone === 'ok' ? 'var(--ok)' : 'var(--highlight)'
  return (
    <div ref={wrapRef} style={{ border: '1px solid var(--rule)', borderRadius: 10, background: 'var(--surface-2)', overflow: 'hidden', width: '100%', minWidth: 0 }}>
      {title && (
        <div style={{ padding: '0.3rem 0.75rem', borderBottom: '1px solid var(--rule)', background: 'var(--surface-3)', fontFamily: MONO, fontSize: 12, color: 'var(--ink-3)' }}>
          {title}
        </div>
      )}
      <Highlight code={src} language="python" theme={themes.vsLight}>
        {({ tokens, getTokenProps }) => (
          <div style={{ overflowX: 'auto', padding: '0.45rem 0', fontFamily: MONO, fontSize: fs, lineHeight: 1.6 }}>
            <div style={{ minWidth: 'max-content' }}>
              {tokens.map((line, i) => {
                const n = i + 1
                const on = active.includes(n)
                const faded = !on && dim?.(n)
                const clickable = Boolean(onLineClick)
                const rowStyle: CSSProperties = {
                  display: 'flex',
                  alignItems: 'baseline',
                  padding: '0 0.5rem 0 0.4rem',
                  background: on ? toneBg : undefined,
                  boxShadow: on ? `inset 3px 0 0 ${toneBar}` : undefined,
                  opacity: faded ? 0.42 : 1,
                  cursor: clickable ? 'pointer' : undefined,
                  transition: 'background 0.2s, opacity 0.2s',
                  whiteSpace: 'pre',
                }
                const content = (
                  <>
                    {hasMarks && (
                      <span aria-hidden="true" style={{ width: '1.3em', flex: 'none', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>
                        {marks?.[n] ?? ''}
                      </span>
                    )}
                    <span aria-hidden="true" style={{ width: '1.6em', flex: 'none', textAlign: 'right', marginRight: '0.9em', marginLeft: hasMarks ? 0 : '0.3em', color: 'var(--ink-3)', opacity: 0.7, userSelect: 'none' }}>
                      {n}
                    </span>
                    <span>
                      {line.map((token, k) => {
                        if (token.empty) return null
                        const tp = getTokenProps({ token })
                        const text = String(tp.children ?? '').replace(/\n/g, '')
                        return (
                          <span key={k} className={`tok ${token.types.join(' ')}`}>
                            {text}
                          </span>
                        )
                      })}
                      {line.every((t) => t.empty || !t.content.replace(/\n/g, '')) ? ' ' : null}
                    </span>
                  </>
                )
                return (
                  <div key={i}>
                    {clickable ? (
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label={lineLabel?.(n) ?? `line ${n}`}
                        aria-pressed={on}
                        style={rowStyle}
                        onClick={() => onLineClick!(n)}
                        onKeyDown={(e: KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onLineClick!(n)
                          }
                        }}
                      >
                        {content}
                      </div>
                    ) : (
                      <div style={rowStyle}>{content}</div>
                    )}
                    {inserts?.[n]}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Highlight>
    </div>
  )
}

/* ------------------------------------------------------------------ console */

export interface ConsoleLine {
  text: string
  tone?: 'out' | 'err' | 'cmd' | 'note' | 'ok' | 'hidden'
}

export function Console({ lines, title = 'output', minLines = 2, children }: { lines: ConsoleLine[]; title?: ReactNode; minLines?: number; children?: ReactNode }) {
  const colour = (t: ConsoleLine['tone']) =>
    t === 'err' ? 'var(--bad)' : t === 'cmd' ? 'var(--ink-3)' : t === 'note' ? 'var(--ink-3)' : t === 'ok' ? 'var(--ok)' : 'var(--ink)'
  return (
    <div style={{ border: '1px solid var(--rule)', borderRadius: 10, background: 'var(--surface)', width: '100%', minWidth: 0, overflow: 'hidden' }}>
      <div style={{ padding: '0.25rem 0.75rem', borderBottom: '1px dashed var(--rule)', fontFamily: MONO, fontSize: 12, color: 'var(--ink-3)' }}>{title}</div>
      <div
        role="log"
        aria-live="polite"
        style={{ padding: '0.4rem 0.75rem', fontFamily: MONO, fontSize: 13.5, lineHeight: 1.55, minHeight: `${minLines * 1.55 + 0.8}em`, overflowX: 'auto' }}
      >
        {lines.map((l, i) =>
          l.tone === 'hidden' ? (
            <div key={i} style={{ color: 'var(--accent)', fontWeight: 700 }}>
              ? <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontFamily: 'var(--font-body)', fontSize: 13 }}>predict this line below</span>
            </div>
          ) : (
            <div
              key={i}
              style={{
                color: colour(l.tone),
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
                fontStyle: l.tone === 'note' ? 'italic' : undefined,
                fontWeight: l.tone === 'err' ? 600 : undefined,
              }}
            >
              {l.text}
            </div>
          ),
        )}
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ memory diagram */

export interface DName {
  name: string
  /** id of the object this name points to */
  to?: string
  /** or an inline value (small ints, None) shown inside the slot */
  value?: string
  /** draw this name's arrow as "just changed" */
  hl?: boolean
}

export interface DFrame {
  id: string
  label: string
  names: DName[]
  /** 'defaults' draws a dashed box (values stored on a function object) */
  kind?: 'frame' | 'defaults'
}

export interface DObj {
  id: string
  /** small type label, e.g. 'list' or 'int' */
  type: string
  cells: string[]
  /** just changed */
  hl?: boolean
  /** nothing points here any more */
  garbage?: boolean
  /** show list indices above the cells (default true for lists) */
  indices?: boolean
  /** extra text after the type label, e.g. 'id 1' */
  tag?: string
}

interface Layout {
  W: number
  H: number
  FW: number
  frames: { f: DFrame; x: number; y: number; w: number; h: number; rows: { n: DName; y: number; slotX: number; slotW: number }[] }[]
  objects: { o: DObj; x: number; y: number; w: number; cellW: number }[]
}

const FRAME_HEAD = 20
const ROW = 30
const BOX_H = 30
const OBJ_LABEL = 16
const IDX = 13

function cellWidth(o: DObj) {
  const longest = Math.max(1, ...o.cells.map((c) => c.length))
  return Math.max(30, longest * CH + 12)
}

export function layoutDiagram(frames: DFrame[], objects: DObj[], W: number): Layout {
  const longestName = Math.max(4, ...frames.flatMap((f) => f.names.map((n) => n.name.length)))
  const longestVal = Math.max(0, ...frames.flatMap((f) => f.names.map((n) => (n.value ? n.value.length : 0))))
  const slotW = Math.max(30, longestVal * CH + 14)
  const longestLabel = Math.max(...frames.map((f) => f.label.length), 6)
  const FW = Math.min(Math.max(longestName * CH + slotW + 30, longestLabel * 6.6 + 16, 112), Math.max(112, W * 0.5))
  const fl: Layout['frames'] = []
  let y = 4
  for (const f of frames) {
    const rows = f.names.map((n, i) => ({ n, y: y + FRAME_HEAD + 4 + i * ROW + ROW / 2, slotX: FW - 8 - slotW, slotW }))
    const h = FRAME_HEAD + 8 + Math.max(1, f.names.length) * ROW
    fl.push({ f, x: 1, y, w: FW - 1, h, rows })
    y += h + 12
  }
  const framesBottom = y
  const maxObjW = Math.max(30, ...objects.map((o) => cellWidth(o) * Math.max(1, o.cells.length)))
  const gap = Math.min(96, Math.max(46, W - FW - maxObjW - 6))
  const OX = FW + gap
  const ol: Layout['objects'] = []
  let prevBottom = 0
  for (const o of objects) {
    // aim for the first name pointing here
    const ref = fl.flatMap((f) => f.rows).find((r) => r.n.to === o.id)
    const want = ref ? ref.y - OBJ_LABEL - BOX_H / 2 : prevBottom
    const top = Math.max(want, prevBottom)
    const cw = cellWidth(o)
    ol.push({ o, x: OX, y: top, w: cw * Math.max(1, o.cells.length), cellW: cw })
    prevBottom = top + OBJ_LABEL + BOX_H + IDX + (o.garbage ? 18 : 8)
  }
  const H = Math.max(framesBottom - 6, prevBottom, 60)
  return { W, H, FW, frames: fl, objects: ol }
}

export function MemoryDiagram({ frames, objects, minHeight = 0, ariaLabel }: { frames: DFrame[]; objects: DObj[]; minHeight?: number; ariaLabel: string }) {
  const [ref, measured] = useContainerWidth<HTMLDivElement>(340)
  const W = Math.max(280, Math.min(560, measured))
  const L = layoutDiagram(frames, objects, W)
  const H = Math.max(L.H, minHeight)
  const objPos = new Map(L.objects.map((o) => [o.o.id, o]))
  // incoming arrows per object, so that several arrows land at different heights
  const incoming = new Map<string, number>()
  for (const f of L.frames) for (const r of f.rows) if (r.n.to) incoming.set(r.n.to, (incoming.get(r.n.to) ?? 0) + 1)
  const seen = new Map<string, number>()

  return (
    <div ref={ref} style={{ width: '100%', minWidth: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', maxWidth: W, margin: '0 auto', overflow: 'visible' }} role="img" aria-label={ariaLabel}>
        {/* column titles */}
        {L.frames.map(({ f, x, y, w, h, rows }) => (
          <g key={f.id} style={{ transition: 'transform 0.35s' }}>
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx={8}
              style={{
                fill: f.kind === 'defaults' ? 'color-mix(in srgb, var(--viz-5) 8%, var(--surface))' : 'var(--surface-2)',
                stroke: f.kind === 'defaults' ? 'var(--viz-5)' : 'var(--rule)',
                strokeWidth: 1.5,
                strokeDasharray: f.kind === 'defaults' ? '5 4' : undefined,
              }}
            />
            <text x={x + 8} y={y + 14} style={{ fontSize: 11.5, fill: f.kind === 'defaults' ? 'var(--viz-5)' : 'var(--ink-3)', fontWeight: 700, fontFamily: 'var(--font-body)' }}>
              {f.label}
            </text>
            {rows.map(({ n, y: ry, slotX, slotW }) => (
              <g key={n.name}>
                <text x={slotX - 8} y={ry} dy="0.35em" textAnchor="end" style={{ fontFamily: MONO, fontSize: 13.5, fill: 'var(--ink)', fontWeight: 600 }}>
                  {n.name}
                </text>
                <rect x={slotX} y={ry - 11} width={slotW} height={22} rx={4} style={{ fill: 'var(--surface)', stroke: 'var(--viz-axis)', strokeWidth: 1 }} />
                {n.value != null ? (
                  <text x={slotX + slotW / 2} y={ry} dy="0.35em" textAnchor="middle" style={{ fontFamily: MONO, fontSize: 13, fill: n.hl ? 'var(--viz-2)' : 'var(--ink)', fontWeight: n.hl ? 700 : 400 }}>
                    {n.value}
                  </text>
                ) : (
                  <circle cx={slotX + slotW / 2} cy={ry} r={3.6} style={{ fill: n.hl ? 'var(--viz-2)' : 'var(--viz-1)' }} />
                )}
              </g>
            ))}
          </g>
        ))}
        {/* arrows */}
        {L.frames.flatMap(({ f, rows }) =>
          rows
            .filter((r) => r.n.to && objPos.has(r.n.to))
            .map(({ n, y: ry, slotX, slotW }) => {
              const o = objPos.get(n.to!)!
              const k = seen.get(n.to!) ?? 0
              seen.set(n.to!, k + 1)
              const total = incoming.get(n.to!) ?? 1
              const sx = slotX + slotW / 2
              const ex = o.x - 1
              const ey = o.y + OBJ_LABEL + (BOX_H * (k + 1)) / (total + 1)
              const dx = Math.max(24, (ex - sx) * 0.55)
              const col = n.hl ? 'var(--viz-2)' : 'var(--viz-1)'
              const d = `M${sx},${ry} C${sx + dx},${ry} ${ex - 8 - dx * 0.6},${ey} ${ex - 8},${ey}`
              return (
                <g key={`${f.id}-${n.name}`}>
                  <path d={d} style={{ fill: 'none', stroke: col, strokeWidth: n.hl ? 2.6 : 1.8, transition: 'd 0.35s' }} />
                  <path d={`M${ex},${ey} L${ex - 9},${ey - 5} L${ex - 9},${ey + 5} Z`} style={{ fill: col, transition: 'd 0.35s' }} />
                </g>
              )
            }),
        )}
        {/* objects */}
        {L.objects.map(({ o, x, y, cellW }) => {
          const showIdx = o.indices ?? o.type === 'list'
          const empty = o.cells.length === 0
          return (
            <g key={o.id} style={{ opacity: o.garbage ? 0.45 : 1, transition: 'opacity 0.3s' }}>
              <text x={x} y={y + 11} style={{ fontSize: 11.5, fill: o.hl ? 'var(--viz-2)' : 'var(--ink-3)', fontWeight: 700, fontFamily: 'var(--font-body)' }}>
                {o.type}
                {o.tag ? <tspan style={{ fontWeight: 400 }}>{`  ${o.tag}`}</tspan> : null}
              </text>
              {empty ? (
                <g>
                  <rect x={x} y={y + OBJ_LABEL} width={44} height={BOX_H} rx={3} style={{ fill: o.hl ? 'color-mix(in srgb, var(--viz-2) 16%, var(--surface))' : 'var(--surface)', stroke: o.hl ? 'var(--viz-2)' : 'var(--viz-axis)', strokeWidth: o.hl ? 2 : 1.2 }} />
                  <text x={x + 22} y={y + OBJ_LABEL + BOX_H / 2} dy="0.35em" textAnchor="middle" style={{ fontSize: 11.5, fill: 'var(--ink-3)', fontStyle: 'italic', fontFamily: 'var(--font-body)' }}>
                    empty
                  </text>
                </g>
              ) : (
                o.cells.map((c, i) => (
                  <g key={i}>
                    {showIdx && (
                      <text x={x + i * cellW + cellW / 2} y={y + OBJ_LABEL + BOX_H + 12} textAnchor="middle" style={{ fontSize: 11.5, fill: 'var(--ink-3)', fontFamily: MONO }}>
                        {i}
                      </text>
                    )}
                    <rect
                      x={x + i * cellW}
                      y={y + OBJ_LABEL}
                      width={cellW}
                      height={BOX_H}
                      style={{
                        fill: o.hl ? 'color-mix(in srgb, var(--viz-2) 16%, var(--surface))' : 'var(--surface)',
                        stroke: o.hl ? 'var(--viz-2)' : 'var(--viz-axis)',
                        strokeWidth: o.hl ? 2 : 1.2,
                      }}
                    />
                    <text x={x + i * cellW + cellW / 2} y={y + OBJ_LABEL + BOX_H / 2} dy="0.35em" textAnchor="middle" style={{ fontFamily: MONO, fontSize: 13.5, fill: 'var(--ink)' }}>
                      {c}
                    </text>
                  </g>
                ))
              )}
              {o.garbage && (
                <text
                  x={Math.min(W - 2, Math.max(x + cellW * Math.max(1, o.cells.length), x + 104))}
                  y={y + OBJ_LABEL + BOX_H + 25}
                  textAnchor="end"
                  style={{ fontSize: 11.5, fill: 'var(--ink-3)', fontStyle: 'italic', fontFamily: 'var(--font-body)' }}
                >
                  no names left: freed
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/** Explains the two arrow colours used by MemoryDiagram. */
export function DiagramLegend() {
  const swatch = (colour: string, thick: number) => (
    <svg width="26" height="10" aria-hidden="true" style={{ flex: 'none' }}>
      <line x1="1" y1="5" x2="18" y2="5" style={{ stroke: colour, strokeWidth: thick }} />
      <path d="M25,5 L17,1 L17,9 Z" style={{ fill: colour }} />
    </svg>
  )
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 1rem', fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.4 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {swatch('var(--viz-2)', 2.6)} what this line just used or changed
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {swatch('var(--viz-1)', 1.8)} every other arrow
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ trace stepper */

export interface Predict {
  q: string
  options: string[]
  answer: number
  /** hide the last console line until answered (default true: the step prints the answer) */
  hide?: boolean
}

export interface TraceStep {
  /** 1-based line(s) that just ran */
  line: number[]
  note: ReactNode
  frames: DFrame[]
  objects: DObj[]
  /** everything printed so far */
  out: ConsoleLine[]
  /** ask the learner to predict the LAST line of `out` before showing it */
  predict?: Predict
}

export function PredictBox({ p, chosen, onChoose, last }: { p: Predict; chosen: number | undefined; onChoose: (i: number) => void; last?: boolean }) {
  const done = chosen !== undefined
  return (
    <div style={{ width: '100%', border: '1.5px solid var(--accent-line)', background: 'var(--accent-soft)', borderRadius: 10, padding: '0.55rem 0.75rem' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>{p.q}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {p.options.map((o, i) => {
          const isAns = i === p.answer
          const picked = chosen === i
          const style: CSSProperties = {
            fontFamily: MONO,
            fontSize: 13.5,
            borderColor: done && isAns ? 'var(--ok)' : done && picked ? 'var(--bad)' : undefined,
            background: done && isAns ? 'var(--ok-soft)' : done && picked ? 'var(--bad-soft)' : undefined,
          }
          return (
            <button key={i} type="button" className="btn btn-small" style={style} onClick={() => !done && onChoose(i)} aria-pressed={picked} disabled={done && !picked && !isAns}>
              {o}
            </button>
          )
        })}
      </div>
      {done && (
        <div style={{ marginTop: 6, fontSize: 13.5, fontWeight: 600, color: chosen === p.answer ? 'var(--ok)' : 'var(--bad)' }}>
          {chosen === p.answer
            ? `Correct.${last ? '' : p.hide === false ? ' Press Next to watch it happen.' : ' Press Next to carry on.'}`
            : `Not quite: it prints ${p.options[p.answer]}. Follow the arrows in the diagram to see why.`}
        </div>
      )}
    </div>
  )
}

export function TraceStepper({ code, steps, resetKey, codeTitle, diagramLabel, interval = 1500 }: { code: string; steps: TraceStep[]; resetKey: string; codeTitle?: ReactNode; diagramLabel: string; interval?: number }) {
  const player = usePlayer({ steps: steps.length, interval })
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(640)
  const wide = width >= 600

  useEffect(() => {
    player.reset()
    setAnswers({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  const i = Math.min(player.step, steps.length - 1)
  const s = steps[i]
  const waiting = Boolean(s.predict) && answers[i] === undefined

  useEffect(() => {
    if (player.playing && waiting) player.pause()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.playing, waiting])

  // keep the diagram the same height for every step so the page does not jump
  const minHeight = useMemo(() => {
    const W = Math.max(280, Math.min(560, wide ? width / 2 : width))
    return Math.max(...steps.map((st) => layoutDiagram(st.frames, st.objects, W).H))
  }, [steps, width, wide])

  const out: ConsoleLine[] = waiting && s.predict?.hide !== false ? [...s.out.slice(0, -1), { text: '', tone: 'hidden' }] : s.out

  return (
    <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: wide ? 'minmax(0, 1fr) minmax(0, 1fr)' : 'minmax(0, 1fr)', gap: 12, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 10, minWidth: 0 }}>
          <CodeView code={code} active={s.line} title={codeTitle} marks={Object.fromEntries(s.line.map((l) => [l, '▶']))} />
          <Console lines={out} />
        </div>
        <div style={{ display: 'grid', gap: 8, minWidth: 0 }}>
          <MemoryDiagram frames={s.frames} objects={s.objects} minHeight={minHeight} ariaLabel={diagramLabel} />
          <DiagramLegend />
          <div style={{ fontSize: 14.5, lineHeight: 1.5, color: 'var(--ink)', background: 'var(--surface-2)', borderRadius: 8, padding: '0.5rem 0.7rem', minHeight: '3.2em' }}>
            {waiting ? <span style={{ color: 'var(--ink-3)' }}>Make your prediction below first. The explanation appears here once you have chosen.</span> : s.note}
          </div>
        </div>
      </div>
      {s.predict && (
        <PredictBox key={`${resetKey}-${i}`} p={s.predict} chosen={answers[i]} last={i === steps.length - 1} onChoose={(k) => setAnswers((a) => ({ ...a, [i]: k }))} />
      )}
      <PlayerControls player={player} label={(k) => `Step ${k + 1} of ${steps.length}`} />
    </div>
  )
}

/* ------------------------------------------------------------------ helpers */

/**
 * Font size (px) that lets `chars` monospace characters fit in the measured width minus
 * `overhead` px, clamped to [min, max]. Attach `ref` to the element whose width counts.
 */
export function useFitFont<T extends HTMLElement>(chars: number, overhead: number, max = 12.5, min = 11.5) {
  const [ref, w] = useContainerWidth<T>(640)
  const fs = Math.max(min, Math.min(max, (w - overhead) / (0.61 * Math.max(1, chars))))
  return [ref, fs] as const
}

export const out = (...texts: string[]): ConsoleLine[] => texts.map((text) => ({ text }))

/** small pill used for True / False lamps and status chips */
export function Lamp({ on, label, sub }: { on: boolean; label: ReactNode; sub?: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        justifyItems: 'center',
        gap: 4,
        padding: '0.55rem 0.8rem',
        borderRadius: 12,
        minWidth: 118,
        border: `2px solid ${on ? 'var(--viz-pos)' : 'var(--rule)'}`,
        background: on ? 'color-mix(in srgb, var(--viz-pos) 14%, var(--surface))' : 'var(--surface-2)',
        transition: 'all 0.25s',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: on ? 'var(--viz-pos)' : 'var(--surface-3)',
          boxShadow: on ? '0 0 0 5px color-mix(in srgb, var(--viz-pos) 25%, transparent), 0 0 18px color-mix(in srgb, var(--viz-pos) 70%, transparent)' : 'inset 0 0 0 1.5px var(--rule)',
          transition: 'all 0.25s',
        }}
      />
      <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{label}</span>
      <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: on ? 'var(--viz-pos)' : 'var(--ink-3)' }}>{on ? 'True' : 'False'}</span>
      {sub && <span style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'center' }}>{sub}</span>}
    </div>
  )
}

/* ------------------------------------------------------------------ choice group */

/**
 * The kit's Segmented control when there is room. On phones a wrapped pill track looks ragged,
 * so below the breakpoint each option becomes its own chip (optionally with a shorter label).
 */
export function ChoiceGroup<T extends string | number>({
  narrow,
  options,
  value,
  onChange,
  label,
}: {
  narrow: boolean
  options: { value: T; label: ReactNode; short?: ReactNode }[]
  value: T
  onChange: (v: T) => void
  label?: string
}) {
  if (!narrow) return <Segmented label={label} value={value} onChange={onChange} options={options.map((o) => ({ value: o.value, label: o.label }))} />
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {label && <span className="segmented-label">{label}</span>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {options.map((o) => {
          const on = o.value === value
          return (
            <button
              key={String(o.value)}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.value)}
              style={{
                font: 'inherit',
                fontSize: 'var(--step--1)',
                fontWeight: 700,
                padding: '0.3rem 0.75rem',
                minHeight: 34,
                borderRadius: 999,
                border: `1.5px solid ${on ? 'var(--accent)' : 'var(--rule)'}`,
                background: on ? 'var(--accent-soft)' : 'var(--surface)',
                color: on ? 'var(--ink)' : 'var(--ink-2)',
                cursor: 'pointer',
              }}
            >
              {o.short ?? o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
