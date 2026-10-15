import { useRef, useState, type ReactNode } from 'react'
import { Figure, useContainerWidth } from '../../../../../kit'
import { slicePositions, strRepr } from './pyStr'
import s from './str.module.css'

/*
  A string as a row of numbered boxes: positive indices above, negative below. Slice
  positions sit on the GAPS between boxes (fence posts), which is why s[start:stop] includes
  start and stops just before stop. Drag the two handles or type any s[...] expression.
*/

type Query =
  | { kind: 'index'; i: number }
  | { kind: 'slice'; start: number | null; stop: number | null; step: number | null }
  | { kind: 'len' }
  | { kind: 'error'; msg: string; py?: boolean }

function parseQuery(text: string): Query {
  const t = text.replace(/\s+/g, '')
  if (t === 'len(s)') return { kind: 'len' }
  const m = /^s\[(.*)\]$/.exec(t)
  if (!m) return { kind: 'error', msg: 'Type something like s[1:4], s[-1] or len(s).' }
  const parts = m[1].split(':')
  const num = (p: string) => (p === '' ? null : /^[+-]?\d+$/.test(p) ? Number(p) : NaN)
  if (parts.length === 1) {
    const i = num(parts[0])
    if (i === null || Number.isNaN(i)) return { kind: 'error', msg: 'Inside the brackets, use whole numbers, for example s[2] or s[1:4].' }
    return { kind: 'index', i }
  }
  if (parts.length > 3) return { kind: 'error', msg: 'SyntaxError: invalid syntax', py: true }
  const [a, b, c] = parts.map(num)
  if ([a, b, c].some((v) => v !== undefined && Number.isNaN(v))) return { kind: 'error', msg: 'Inside the brackets, use whole numbers, for example s[2] or s[1:4].' }
  if (c === 0) return { kind: 'error', msg: 'ValueError: slice step cannot be zero', py: true }
  return { kind: 'slice', start: a ?? null, stop: b ?? null, step: c ?? null }
}

const PRESETS = ['s[0]', 's[-1]', 's[1:4]', 's[:5]', 's[5:]', 's[-4:]', 's[::2]', 's[::-1]', 's[20]', 's[3:100]', 'len(s)']

export default function StringSlicer() {
  const [word, setWord] = useState('Singapore')
  const [expr, setExpr] = useState('s[1:4]')
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(560)
  const dragging = useRef<'start' | 'stop' | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const chars = Array.from(word)
  const n = chars.length
  const q = parseQuery(expr)

  // geometry (real pixels: the viewBox matches the measured width)
  const W = Math.max(280, Math.min(width, 720))
  const boxW = Math.max(22, Math.min(48, (W - 24) / Math.max(n, 1)))
  const boxH = Math.min(44, boxW * 1.1)
  const x0 = (W - boxW * n) / 2
  const yIdx = 16
  const yBox = 26
  const yNeg = yBox + boxH + 16
  const yRule = yNeg + 22
  const H = yRule + 44
  const gapX = (g: number) => x0 + g * boxW
  const font = Math.min(22, boxW * 0.52)

  // what the query selects
  let positions: number[] = []
  let indexPos: number | null = null
  let out: ReactNode = null
  let explain: ReactNode = null
  let handles: { start: number; stop: number } | null = null
  if (q.kind === 'index') {
    const real = q.i < 0 ? q.i + n : q.i
    if (real >= 0 && real < n) {
      indexPos = real
      out = strRepr(chars[real])
      explain =
        q.i < 0 ? (
          <>
            A negative index counts from the end: <code>s[{q.i}]</code> is <code>s[{n} {q.i}]</code>, which is <code>s[{real}]</code>.
          </>
        ) : (
          <>
            Indexing picks <strong>one</strong> character. Counting starts at 0, so <code>s[{q.i}]</code> is character number {q.i + 1}.
          </>
        )
    } else {
      out = <span className={s.err}>IndexError: string index out of range</span>
      explain =
        n === 0 ? (
          <>The empty string has no characters, so every index is an IndexError (but every slice is just &apos;&apos;).</>
        ) : (
          <>
            The valid indices for a string of length {n} are 0 to {n - 1} (or −{n} to −1). Asking for one character outside that range is an error.
          </>
        )
    }
  } else if (q.kind === 'slice') {
    positions = slicePositions(n, q.start, q.stop, q.step)
    out = strRepr(positions.map((p) => chars[p]).join(''))
    const step = q.step ?? 1
    if (step === 1) {
      const startGap = q.start === null ? 0 : q.start < 0 ? Math.max(0, q.start + n) : Math.min(q.start, n)
      const stopGap = q.stop === null ? n : q.stop < 0 ? Math.max(0, q.stop + n) : Math.min(q.stop, n)
      handles = { start: startGap, stop: stopGap }
      const negParts: string[] = []
      if (q.start !== null && q.start < 0) negParts.push(`${q.start} means ${n} − ${-q.start} = ${q.start + n}`)
      if (q.stop !== null && q.stop < 0) negParts.push(`${q.stop} means ${n} − ${-q.stop} = ${q.stop + n}`)
      const negNote = negParts.length ? `Negative numbers count from the end: ${negParts.join(' and ')}. ` : ''
      explain =
        positions.length === 0 ? (
          n === 0 ? (
            <>The string is empty, so every slice of it is empty too. Slices never raise an error.</>
          ) : (
            <>{negNote}The stop is not after the start, so the slice is empty. Slices never raise an error.</>
          )
        ) : (
          <>
            {negNote}Takes positions {positions[0]} to {positions[positions.length - 1]}:{' '}
            {q.start === null ? <>with no start, it begins at 0</> : <>the start ({startGap}) is included</>},{' '}
            {q.stop === null ? <>with no stop, it runs to the end ({n})</> : <>the stop ({stopGap}) is not</>}, so you get {stopGap} − {startGap} ={' '}
            {positions.length} character{positions.length === 1 ? '' : 's'}.{(q.stop ?? 0) > n && ' A stop past the end is fine: slices are forgiving.'}
          </>
        )
    } else {
      const ordinal = (k: number) => (k === 2 ? 'second' : k === 3 ? 'third' : `${k}th`)
      const how =
        step < 0
          ? step === -1
            ? 'A step of −1 walks backwards, one character at a time'
            : `A step of ${step} walks backwards, taking every ${ordinal(-step)} character`
          : `A step of ${step} takes every ${ordinal(step)} character`
      explain = (
        <>
          {how}: positions {positions.join(', ') || '(none)'}. The small numbers show the order they are taken in.
        </>
      )
    }
  } else if (q.kind === 'len') {
    out = String(n)
    explain = (
      <>
        <code>len(s)</code> counts the characters, including spaces: {n}.{' '}
        {n === 0 ? <>The string is empty, so there is no last index.</> : <>The last index is always <code>len(s) - 1</code> = {n - 1}.</>}
      </>
    )
  } else {
    out = q.py ? <span className={s.err}>{q.msg}</span> : null
    explain = q.py ? null : q.msg
  }

  const order = new Map(positions.map((p, k) => [p, k + 1]))
  const showOrder = q.kind === 'slice' && (q.step ?? 1) !== 1

  const gapFromEvent = (clientX: number) => {
    const svg = svgRef.current
    if (!svg) return 0
    const r = svg.getBoundingClientRect()
    const px = ((clientX - r.left) / r.width) * W
    return Math.max(0, Math.min(n, Math.round((px - x0) / boxW)))
  }
  const setHandle = (which: 'start' | 'stop', g: number) => {
    const cur = handles ?? { start: 0, stop: n }
    const next = { ...cur, [which]: g }
    setExpr(`s[${next.start}:${next.stop}]`)
  }

  const handleEl = (which: 'start' | 'stop', g: number) => {
    const x = gapX(g)
    const colour = which === 'start' ? 'var(--viz-2)' : 'var(--viz-5)'
    // both handles on one gap: one shared label instead of two overlapping ones
    const shared = handles !== null && handles.start === handles.stop
    const label = shared ? (which === 'start' ? `start = stop = ${g}` : '') : `${which} = ${g}`
    const half = label.length * 3.5 + 2
    const labelX = Math.max(half, Math.min(W - half, x))
    return (
      <g
        key={which}
        className={s.handle}
        tabIndex={0}
        role="slider"
        aria-label={`${which} position`}
        aria-valuemin={0}
        aria-valuemax={n}
        aria-valuenow={g}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault()
            setHandle(which, Math.max(0, Math.min(n, g + (e.key === 'ArrowLeft' ? -1 : 1))))
          }
        }}
        onPointerDown={(e) => {
          dragging.current = which
          ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (dragging.current === which) setHandle(which, gapFromEvent(e.clientX))
        }}
        onPointerUp={(e) => {
          dragging.current = null
          ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
        }}
      >
        <line x1={x} x2={x} y1={yBox - 6} y2={yRule} style={{ stroke: colour, strokeWidth: 2.5, strokeDasharray: '5 3' }} />
        <rect x={x - 22} y={yRule + 4} width={44} height={30} style={{ fill: 'transparent' }} />
        <path className={s.grip} d={`M${x},${yRule} l9,10 v14 h-18 v-14 z`} style={{ fill: colour, stroke: 'var(--surface)', strokeWidth: 1.5 }} />
        <text x={labelX} y={yRule + 44} textAnchor="middle" style={{ fill: shared ? 'var(--ink-2)' : colour, fontSize: 11.5, fontWeight: 800 }}>
          {label}
        </text>
      </g>
    )
  }

  return (
    <Figure
      title="Index and slice a string"
      caption={
        <>
          Drag the <strong>start</strong> and <strong>stop</strong> handles, tap an example, or type your own expression. Notice that slice numbers sit on
          the <em>gaps</em> between characters: the start gap is included, the stop gap is where the slice ends. Change the word too.
        </>
      }
    >
      <div className={s.wrap} ref={wrapRef}>
        <div className={s.row}>
          <label className={s.field}>
            <span className={s.fieldLabel}>s =</span>
            <input className={s.input} value={word} maxLength={12} spellCheck={false} onChange={(e) => setWord(e.target.value)} aria-label="The string s" />
          </label>
          <label className={s.field}>
            <span className={s.fieldLabel}>&gt;&gt;&gt;</span>
            <input className={s.input} value={expr} maxLength={24} spellCheck={false} onChange={(e) => setExpr(e.target.value)} aria-label="Expression, for example s[1:4]" />
          </label>
        </div>
        <div className={s.chips} role="group" aria-label="Examples">
          {PRESETS.map((p) => (
            <button key={p} type="button" className={`${s.chip} ${p === expr ? s.chipOn : ''}`} onClick={() => setExpr(p)} aria-pressed={p === expr}>
              {p}
            </button>
          ))}
        </div>
        {x0 <= 30 && n > 0 && (
          <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>
            Numbers above the boxes: <span style={{ color: 'var(--viz-1)', fontWeight: 700 }}>index</span> · below:{' '}
            <span style={{ color: 'var(--viz-4)', fontWeight: 700 }}>index from the end</span> · ruler: the gaps a slice cuts at
          </div>
        )}
        <div className={s.svgBox}>
          <svg ref={svgRef} className={s.svg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`The string ${strRepr(word)} with its indices`}>
            <text x={4} y={yIdx + 4} style={{ fill: 'var(--viz-1)', fontSize: 10.5, fontWeight: 700 }}>
              {x0 > 30 ? 'index' : ''}
            </text>
            <text x={4} y={yNeg + 4} style={{ fill: 'var(--viz-4)', fontSize: 10.5, fontWeight: 700 }}>
              {x0 > 30 ? 'from end' : ''}
            </text>
            {chars.map((ch, i) => {
              const x = gapX(i)
              const sel = indexPos === i || order.has(i)
              const fill = indexPos === i ? 'color-mix(in srgb, var(--viz-2) 28%, var(--surface))' : sel ? 'color-mix(in srgb, var(--accent) 22%, var(--surface))' : 'var(--surface-2)'
              const stroke = indexPos === i ? 'var(--viz-2)' : sel ? 'var(--accent)' : 'var(--viz-muted)'
              return (
                <g key={i}>
                  <text x={x + boxW / 2} y={yIdx + 4} textAnchor="middle" className={s.mono} style={{ fill: 'var(--viz-1)', fontSize: 12.5, fontWeight: 700 }}>
                    {i}
                  </text>
                  <rect x={x + 1.5} y={yBox} width={boxW - 3} height={boxH} rx={6} style={{ fill, stroke, strokeWidth: sel ? 2.2 : 1.2 }} />
                  <text x={x + boxW / 2} y={yBox + boxH / 2 + font * 0.36} textAnchor="middle" className={s.mono} style={{ fill: ch === ' ' ? 'var(--ink-3)' : 'var(--ink)', fontSize: font, fontWeight: 700 }}>
                    {ch === ' ' ? '·' : ch}
                  </text>
                  <text x={x + boxW / 2} y={yNeg + 4} textAnchor="middle" className={s.mono} style={{ fill: 'var(--viz-4)', fontSize: 11.5, fontWeight: 600 }}>
                    {i - n}
                  </text>
                  {showOrder && order.has(i) && (
                    <g>
                      <circle cx={x + boxW - 5} cy={yBox + 3} r={8} style={{ fill: 'var(--accent)' }} />
                      <text x={x + boxW - 5} y={yBox + 6.5} textAnchor="middle" style={{ fill: 'var(--accent-ink)', fontSize: 10, fontWeight: 800 }}>
                        {order.get(i)}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
            {/* the gap ruler used by slices */}
            <line x1={gapX(0)} x2={gapX(n)} y1={yRule} y2={yRule} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.2 }} />
            {Array.from({ length: n + 1 }, (_, g) => (
              <line key={g} x1={gapX(g)} x2={gapX(g)} y1={yRule - 4} y2={yRule + 4} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.2 }} />
            ))}
            {/* gap numbers: the numbers a slice uses (hidden where a handle sits, whose label shows it) */}
            {Array.from({ length: n + 1 }, (_, g) =>
              handles && (g === handles.start || g === handles.stop) ? null : (
                <text key={`gn${g}`} x={gapX(g)} y={yRule + 17} textAnchor="middle" style={{ fill: 'var(--viz-muted)', fontSize: 11, fontWeight: 600 }}>
                  {g}
                </text>
              ),
            )}
            {handles && [handleEl('start', handles.start), handleEl('stop', handles.stop)]}
          </svg>
        </div>
        <div className={s.result} aria-live="polite">
          <div className={s.resultLine}>
            <span className={s.prompt}>&gt;&gt;&gt; </span>
            {expr.trim() || '…'}
            <br />
            {out}
          </div>
          {explain && <div>{explain}</div>}
        </div>
      </div>
    </Figure>
  )
}
