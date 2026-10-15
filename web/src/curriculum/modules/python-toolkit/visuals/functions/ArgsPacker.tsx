import { useEffect, useState } from 'react'
import { Figure, Controls, Slider, Button, useContainerWidth } from '../../../../../kit'
import s from './fn.module.css'

/*
  Where does each argument go? For def f(a, b, *args, **kwargs), positional arguments fill a and b
  in order, extra positional arguments are packed into the tuple args, keyword arguments go to the
  parameter with the same name, and any other keyword arguments are packed into the dict kwargs.
  Error messages are copied from Python 3.13.
*/

type Dest = 'a' | 'b' | 'args' | 'kwargs' | 'clash'
interface Arg {
  id: string
  kind: 'pos' | 'kw'
  text: string
  key?: string
  val: string
}
const KEYWORDS: { key: string; val: string }[] = [
  { key: 'b', val: '7' },
  { key: 'lr', val: '0.1' },
  { key: 'epochs', val: '5' },
]
const ROWS: { id: Exclude<Dest, 'clash'>; label: string; sub: string }[] = [
  { id: 'a', label: 'a', sub: 'normal parameter' },
  { id: 'b', label: 'b', sub: 'normal parameter' },
  { id: 'args', label: '*args', sub: 'a tuple' },
  { id: 'kwargs', label: '**kwargs', sub: 'a dict' },
]
const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const ordinal = (i: number) => ['1st', '2nd', '3rd', '4th', '5th'][i]

function bind(args: Arg[]) {
  const dest: Record<string, Dest> = {}
  const bound: Partial<Record<'a' | 'b', string>> = {}
  let clash: string | null = null
  args.forEach((g, i) => {
    if (g.kind === 'pos') {
      if (i < 2) {
        const p = i === 0 ? 'a' : 'b'
        dest[g.id] = p
        bound[p] = g.val
      } else dest[g.id] = 'args'
    } else if (g.key === 'a' || g.key === 'b') {
      if (bound[g.key] != null) {
        dest[g.id] = 'clash'
        clash = clash ?? g.key
      } else {
        dest[g.id] = g.key
        bound[g.key] = g.val
      }
    } else dest[g.id] = 'kwargs'
  })
  const missing = (['a', 'b'] as const).filter((p) => bound[p] == null)
  let error: string | null = null
  if (clash) error = `TypeError: f() got multiple values for argument '${clash}'`
  else if (missing.length === 1) error = `TypeError: f() missing 1 required positional argument: '${missing[0]}'`
  else if (missing.length === 2) error = `TypeError: f() missing 2 required positional arguments: 'a' and 'b'`
  const tupleItems = args.filter((g) => dest[g.id] === 'args').map((g) => g.val)
  const dictItems = args.filter((g) => dest[g.id] === 'kwargs').map((g) => `'${g.key}': ${g.val}`)
  const tuple = tupleItems.length === 1 ? `(${tupleItems[0]},)` : `(${tupleItems.join(', ')})`
  const dict = `{${dictItems.join(', ')}}`
  const printed = error ?? `${bound.a} ${bound.b} ${tuple} ${dict}`
  return { dest, missing, error, tuple, dict, printed, bound }
}

export default function ArgsPacker() {
  const [nPos, setNPos] = useState(3)
  const [kws, setKws] = useState<string[]>(['lr', 'epochs'])
  const [moved, setMoved] = useState(99)
  const [runId, setRunId] = useState(0)

  const args: Arg[] = [
    ...Array.from({ length: nPos }, (_, i) => ({ id: `p${i}`, kind: 'pos' as const, text: String(i + 1), val: String(i + 1) })),
    ...KEYWORDS.filter((k) => kws.includes(k.key)).map((k) => ({ id: `k-${k.key}`, kind: 'kw' as const, text: `${k.key}=${k.val}`, key: k.key, val: k.val })),
  ]
  const res = bind(args)
  const callText = `f(${args.map((g) => g.text).join(', ')})`

  useEffect(() => {
    if (runId === 0 || reducedMotion()) {
      setMoved(99)
      return
    }
    setMoved(0)
    let m = 0
    const t = window.setInterval(() => {
      m += 1
      setMoved(m)
      if (m > args.length) window.clearInterval(t)
    }, 620)
    return () => window.clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId])
  const replay = () => setRunId((r) => r + 1)
  const done = moved > args.length

  // ---------- layout ----------
  const [ref, measured] = useContainerWidth<HTMLDivElement>(520)
  const width = Math.max(300, Math.min(measured, 600))
  const narrow = width < 460
  const chipH = 26
  const tiny = width < 340 // the smallest phones: shrink chips so **kwargs still fits
  const chipFont = tiny ? 11.5 : 12.5
  const charW = tiny ? 6.95 : 7.6
  const chipW = (t: string) => t.length * charW + (tiny ? 12 : 14)
  const landedText = (g: Arg) => (g.kind === 'kw' && res.dest[g.id] === 'kwargs' ? `'${g.key}': ${g.val}` : g.val)

  // call line (flows onto a second line if needed)
  const callPos: Record<string, [number, number]> = {}
  let cx = 8 + 22
  let cy = 10
  const commas: [number, number][] = []
  args.forEach((g, i) => {
    const w = chipW(g.text)
    if (cx + w > width - 20) {
      cx = 8 + 22
      cy += chipH + 10
    }
    callPos[g.id] = [cx, cy]
    cx += w
    if (i < args.length - 1) commas.push([cx + 2, cy])
    cx += 12
  })
  const closeAt: [number, number] = [args.length ? cx - 10 : cx, cy]
  const callBottom = cy + chipH

  const labelW = tiny ? 74 : narrow ? 80 : 124
  const rowsTop = callBottom + 34
  const rowH = 40
  const rowGap = 8
  const rowY = (i: number) => rowsTop + i * (rowH + rowGap)
  const contentX = 8 + labelW + 8
  const height = rowY(ROWS.length) - rowGap + 6

  const destPos: Record<string, [number, number]> = {}
  ROWS.forEach((r, ri) => {
    const bracket = r.id === 'args' || r.id === 'kwargs' ? 12 : 0
    let x = contentX + 4 + bracket
    for (const g of args) {
      const d = res.dest[g.id]
      if (d === r.id || (r.id === 'b' && d === 'clash' && g.key === 'b')) {
        destPos[g.id] = [x, rowY(ri) + (rowH - chipH) / 2]
        x += chipW(d === 'clash' ? g.text : landedText(g)) + 6
      }
    }
  })
  const bracketEnd = (rid: string) => {
    const ids = args.filter((g) => res.dest[g.id] === rid)
    if (!ids.length) return contentX + 4 + 12 + 3
    const last = ids[ids.length - 1]
    return destPos[last.id][0] + chipW(landedText(last)) + 3
  }

  const reason = (g: Arg, i: number) => {
    const d = res.dest[g.id]
    if (d === 'a' || d === 'b') {
      return g.kind === 'pos' ? (
        <>
          <b>{g.text}</b> → <b>{d}</b>: the {ordinal(i)} positional argument fills the {ordinal(i)} parameter.
        </>
      ) : (
        <>
          <b>{g.text}</b> → <b>b</b>: a keyword argument goes to the parameter with that name, wherever it is.
        </>
      )
    }
    if (d === 'args') return <><b>{g.text}</b> → <b>args</b>: a and b are already full, so this extra positional argument is packed into the tuple.</>
    if (d === 'kwargs') return <><b>{g.text}</b> → <b>kwargs['{g.key}']</b>: there is no parameter called {g.key}, so it is packed into the dict.</>
    return <><b>{g.text}</b> → <b>error</b>: b already got a value from its position.</>
  }

  return (
    <Figure
      title="*args and **kwargs: where does each argument land?"
      caption={
        <>
          Change the number of positional arguments and switch keyword arguments on or off, then watch each argument fly to its parameter. Normal parameters
          are filled first; leftover positional arguments are packed into the tuple <span className={s.mono}>args</span>, and leftover keyword arguments into the dict{' '}
          <span className={s.mono}>kwargs</span>. Try <span className={s.mono}>b=7</span> with 1 and then with 2 positional arguments.
        </>
      }
    >
      <div ref={ref} className={s.wrap}>
        <pre className={s.console} style={{ background: 'var(--surface-2)' }}>
          <span className={s.kw}>def</span> <span className={s.fnName}>f</span>(a, b, *args, **kwargs):{'\n'}
          {'    '}print(a, b, args, kwargs){'\n'}
          {'\n'}
          {callText}
        </pre>

        <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={`Call ${callText}. ${res.error ?? `a = ${res.bound.a}, b = ${res.bound.b}, args = ${res.tuple}, kwargs = ${res.dict}`}`} style={{ display: 'block', maxWidth: width, margin: '0 auto' }}>
          {/* call line */}
          <text x={8} y={10 + 18} className={s.svgMono} style={{ fill: 'var(--ink)', fontSize: 15, fontWeight: 800 }}>
            f(
          </text>
          {commas.map(([x, y], i) => (
            <text key={i} x={x} y={y + 20} className={s.svgMono} style={{ fill: 'var(--ink-2)', fontSize: 15, fontWeight: 800 }}>
              ,
            </text>
          ))}
          <text x={closeAt[0]} y={closeAt[1] + 18} className={s.svgMono} style={{ fill: 'var(--ink)', fontSize: 15, fontWeight: 800 }}>
            )
          </text>
          {/* ghosts of chips that have left the call line */}
          {args.map((g, i) =>
            i < moved ? (
              <g key={g.id}>
                <rect x={callPos[g.id][0]} y={callPos[g.id][1]} width={chipW(g.text)} height={chipH} rx={13} style={{ fill: 'var(--surface-2)', stroke: 'var(--rule)', strokeDasharray: '3 3' }} />
                <text x={callPos[g.id][0] + chipW(g.text) / 2} y={callPos[g.id][1] + 17.5} textAnchor="middle" className={s.svgMono} style={{ fill: 'var(--ink-2)', fontSize: chipFont, fontWeight: 700 }}>
                  {g.text}
                </text>
              </g>
            ) : null,
          )}

          {/* destination rows */}
          {ROWS.map((r, ri) => {
            const y = rowY(ri)
            const isMissing = res.missing.includes(r.id as 'a' | 'b') && !res.error?.includes('multiple')
            return (
              <g key={r.id}>
                <rect x={8} y={y} width={width - 16} height={rowH} rx={10} style={{ fill: r.id === 'args' ? 'color-mix(in srgb, var(--viz-1) 8%, var(--surface))' : r.id === 'kwargs' ? 'color-mix(in srgb, var(--viz-2) 9%, var(--surface))' : 'var(--surface-2)', stroke: 'var(--rule)' }} />
                <text x={16} y={y + 18} className={s.svgMono} style={{ fill: 'var(--ink)', fontSize: tiny ? 12.5 : 13.5, fontWeight: 800 }}>
                  {r.label}
                </text>
                <text x={16} y={y + 33} style={{ fill: 'var(--ink-2)', fontSize: 11.5, fontWeight: 700 }}>
                  {narrow && r.sub === 'normal parameter' ? 'parameter' : r.sub}
                </text>
                {(r.id === 'args' || r.id === 'kwargs') && (
                  <>
                    <text x={contentX + 3} y={y + 26} className={s.svgMono} style={{ fill: 'var(--ink-2)', fontSize: 17, fontWeight: 700 }}>
                      {r.id === 'args' ? '(' : '{'}
                    </text>
                    <text x={bracketEnd(r.id)} y={y + 26} className={s.svgMono} style={{ fill: 'var(--ink-2)', fontSize: 17, fontWeight: 700 }}>
                      {r.id === 'args' ? ')' : '}'}
                    </text>
                  </>
                )}
                {isMissing && done && (
                  <g>
                    <rect x={contentX + 4} y={y + (rowH - chipH) / 2} width={70} height={chipH} rx={13} style={{ fill: 'none', stroke: 'var(--viz-neg)', strokeWidth: 1.5, strokeDasharray: '4 3' }} />
                    <text x={contentX + 39} y={y + 25} textAnchor="middle" style={{ fill: 'var(--viz-neg)', fontSize: 11.5, fontWeight: 800 }}>
                      missing!
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {/* the argument chips */}
          {args.map((g, i) => {
            const landed = i < moved
            const d = res.dest[g.id]
            const [x, y] = landed ? destPos[g.id] : callPos[g.id]
            const text = landed && d !== 'clash' ? landedText(g) : g.text
            const fill = landed && d === 'clash' ? 'var(--viz-neg)' : g.kind === 'pos' ? 'var(--viz-1)' : 'var(--viz-2)'
            return (
              <g key={g.id} style={{ transform: `translate(${x}px, ${y}px)`, transition: 'transform 0.55s cubic-bezier(.3,.7,.3,1)' }}>
                <rect x={0} y={0} width={chipW(text)} height={chipH} rx={13} style={{ fill }} />
                <text x={chipW(text) / 2} y={17.5} textAnchor="middle" className={s.svgMono} style={{ fill: 'var(--surface)', fontSize: chipFont, fontWeight: 800 }}>
                  {text}
                </text>
              </g>
            )
          })}
        </svg>

        <pre className={s.console} aria-live="polite">
          <span className={s.consoleLabel}>Printed output</span>
          {done ? <span className={res.error ? s.err : s.out}>{res.printed}</span> : <span className={s.muted}>…</span>}
        </pre>

        <ol className={s.list}>
          {args.map((g, i) => (
            <li key={g.id} className={!done && i === moved - 1 ? s.listOn : undefined}>
              {reason(g, i)}
            </li>
          ))}
          {args.length === 0 && <li>No arguments at all, so a and b are both missing.</li>}
        </ol>

        <Controls>
          <Slider label="positional arguments" value={nPos} min={0} max={5} step={1} onChange={(v) => { setNPos(v); replay() }} />
          <div className={s.row}>
            <span className={s.rowLabel}>keyword arguments:</span>
            {KEYWORDS.map((k) => {
              const on = kws.includes(k.key)
              return (
                <button
                  key={k.key}
                  type="button"
                  aria-pressed={on}
                  className={`${s.chip} ${on ? s.chipOn : ''}`}
                  onClick={() => {
                    setKws(on ? kws.filter((x) => x !== k.key) : [...kws, k.key])
                    replay()
                  }}
                >
                  {k.key}={k.val}
                </button>
              )
            })}
          </div>
          <Button primary onClick={replay}>
            Replay
          </Button>
        </Controls>
      </div>
    </Figure>
  )
}
