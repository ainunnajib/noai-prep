import { useId, useState, type ReactNode } from 'react'
import { Figure, usePlayer, PlayerControls, useContainerWidth } from '../../../../../kit'
import { CodePanel } from './CodePanel'
import s from './fn.module.css'

/*
  Step through a program in which the same name x lives in two scopes. The global scope is a big
  bubble; each function call adds a local bubble inside it that disappears when the call ends.
  When a line needs x, the lookup arrow shows Python checking local first, then global.
*/

const CODE = ['x = 10', '', 'def show():', '    print(x)', '', 'def change():', '    x = 5', '    print(x)', '', 'show()', 'change()', 'print(x)']

type Var = [string, string]
interface Step {
  line: number
  globals: Var[]
  local?: { fn: string; vars: Var[] }
  /** where the lookup of x starts and where it is found */
  lookup?: { from: 'local' | 'global'; found: 'local' | 'global' }
  out?: string
  note: ReactNode
}

const G1: Var[] = [['x', '10']]
const G2: Var[] = [...G1, ['show', 'function']]
const G3: Var[] = [...G2, ['change', 'function']]

const STEPS: Step[] = [
  { line: 1, globals: G1, note: <>Python creates the name <b>x</b> in the <b>global</b> scope (the main program) and gives it the value 10.</> },
  { line: 3, globals: G2, note: <><b>def</b> stores the recipe under the name <b>show</b>. The body does not run yet.</> },
  { line: 6, globals: G3, note: <>The same for <b>change</b>. Still nothing inside the functions has run.</> },
  { line: 10, globals: G3, local: { fn: 'show', vars: [] }, note: <>Calling <b>show()</b> creates a fresh <b>local</b> scope for this call. It is empty: show has no variables of its own.</> },
  {
    line: 4,
    globals: G3,
    local: { fn: 'show', vars: [] },
    lookup: { from: 'local', found: 'global' },
    out: '10',
    note: <>print(x) needs x. Python looks in the local scope first: no x there. So it looks <b>outwards</b>, in the global scope, and finds x = 10.</>,
  },
  { line: 10, globals: G3, note: <>show() is finished, so its local scope is thrown away.</> },
  { line: 11, globals: G3, local: { fn: 'change', vars: [] }, note: <>Calling <b>change()</b> creates another fresh, empty local scope.</> },
  {
    line: 7,
    globals: G3,
    local: { fn: 'change', vars: [['x', '5']] },
    note: <>Assigning <b>x = 5</b> inside a function creates a <b>new local x</b>. The global x is untouched: there are now two different variables called x.</>,
  },
  {
    line: 8,
    globals: G3,
    local: { fn: 'change', vars: [['x', '5']] },
    lookup: { from: 'local', found: 'local' },
    out: '5',
    note: <>Local first: change has its own x, so Python uses it and never looks outside.</>,
  },
  { line: 11, globals: G3, note: <>change() is finished. Its local x disappears with its scope.</> },
  {
    line: 12,
    globals: G3,
    lookup: { from: 'global', found: 'global' },
    out: '10',
    note: <>Back in the main program, the only x is the global one, still 10. The function could not overwrite it.</>,
  },
]
const CHOICES = ['10', '5', 'NameError']

export default function ScopeBubbles() {
  const player = usePlayer({ steps: STEPS.length, interval: 1700 })
  const markerId = `scope-arrow-${useId().replace(/:/g, '')}`
  const [guess, setGuess] = useState<Record<number, string>>({})
  const st = STEPS[player.step]
  const needsGuess = st.out != null && guess[player.step] == null && !player.playing
  // Until the learner has predicted, hide the lookup arrow and the explanation (they give the answer away).
  const showLookup = !!st.lookup && !needsGuess

  // ---------- layout ----------
  const [ref, measured] = useContainerWidth<HTMLDivElement>(340)
  const width = Math.max(260, Math.min(measured, 460))
  const pad = 8
  const rowH = 26
  const gTop = 40
  const gRowsTop = gTop + 34
  const lTop = gRowsTop + 3 * rowH + 14 // room for the three global names
  const lH = 78
  const height = lTop + lH + 26
  const gx = pad + 10
  const gw = width - 2 * gx
  const lx = gx + 14
  const lw = gw - 28
  const nameX = (x0: number) => x0 + 16
  const valX = (x0: number) => x0 + 92
  const globalRowY = (i: number) => gRowsTop + i * rowH
  const localRowY = lTop + 44

  const found = st.lookup?.found
  const from = st.lookup?.from
  // where the "x?" query starts, and the row where x is found
  const qx = width - gx - 40
  const qy = from === 'local' ? lTop + 18 : gTop + 18
  const targetY = found === 'local' ? localRowY : globalRowY(0)
  const targetX = (found === 'local' ? valX(lx) : valX(gx)) + 34

  const printed = STEPS.slice(0, player.step + 1)
    .map((x, i) => ({ out: x.out, i }))
    .filter((x) => x.out != null)

  return (
    <Figure
      title="Scope: where does Python look for a name?"
      caption={
        <>
          Press <b>Next</b> to run the program one line at a time. At each <span className={s.mono}>print(x)</span>, predict the output before Python shows it. Watch the local
          bubble appear when a function is called and vanish when it returns, and follow the arrow: lookup starts in the innermost scope and moves outwards.
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.split}>
          <CodePanel lines={CODE} active={st.line} />
          <div ref={ref} style={{ width: '100%' }}>
            <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={`Scopes after line ${st.line}. Global: ${st.globals.map((v) => `${v[0]} = ${v[1]}`).join(', ')}.${st.local ? ` Local scope of ${st.local.fn}: ${st.local.vars.map((v) => `${v[0]} = ${v[1]}`).join(', ') || 'empty'}.` : ''}`} style={{ display: 'block', maxWidth: width, margin: '0 auto' }}>
              <defs>
                <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 Z" style={{ fill: 'var(--viz-2)' }} />
                </marker>
              </defs>
              {/* built-in scope */}
              <rect x={pad / 2} y={2} width={width - pad} height={height - 4} rx={18} style={{ fill: 'none', stroke: 'var(--viz-muted)', strokeWidth: 1.5, strokeDasharray: '5 4' }} />
              <text x={pad + 8} y={22} style={{ fill: 'var(--ink-2)', fontSize: 11.5, fontWeight: 700 }}>
                built-in: print, len, range, …
              </text>
              {/* global scope */}
              <rect x={gx} y={gTop} width={gw} height={height - gTop - 12} rx={16} style={{ fill: 'color-mix(in srgb, var(--viz-1) 7%, var(--surface))', stroke: 'var(--viz-1)', strokeWidth: 2 }} />
              <text x={gx + 12} y={gTop + 21} style={{ fill: 'var(--viz-1)', fontSize: 13, fontWeight: 800 }}>
                global scope
              </text>
              {st.globals.map(([n, v], i) => (
                <g key={n}>
                  <text x={nameX(gx)} y={globalRowY(i) + 17} className={s.svgMono} style={{ fill: 'var(--ink)', fontSize: 13, fontWeight: 700 }}>
                    {n}
                  </text>
                  <text x={valX(gx)} y={globalRowY(i) + 17} className={s.svgMono} style={{ fill: v === 'function' ? 'var(--ink-2)' : 'var(--ink)', fontSize: 13, fontWeight: v === 'function' ? 400 : 800 }}>
                    {v === 'function' ? '<function>' : v}
                  </text>
                </g>
              ))}
              {/* local scope */}
              {st.local ? (
                <g>
                  <rect x={lx} y={lTop} width={lw} height={lH} rx={14} style={{ fill: 'color-mix(in srgb, var(--viz-3) 12%, var(--surface))', stroke: 'var(--viz-3)', strokeWidth: 2 }} />
                  <text x={lx + 12} y={lTop + 21} style={{ fill: 'var(--viz-3)', fontSize: 13, fontWeight: 800 }}>
                    local scope of {st.local.fn}()
                  </text>
                  {st.local.vars.length ? (
                    st.local.vars.map(([n, v]) => (
                      <g key={n}>
                        <text x={nameX(lx)} y={localRowY + 17} className={s.svgMono} style={{ fill: 'var(--ink)', fontSize: 13, fontWeight: 700 }}>
                          {n}
                        </text>
                        <text x={valX(lx)} y={localRowY + 17} className={s.svgMono} style={{ fill: 'var(--ink)', fontSize: 13, fontWeight: 800 }}>
                          {v}
                        </text>
                      </g>
                    ))
                  ) : (
                    <text x={nameX(lx)} y={localRowY + 17} style={{ fill: 'var(--ink-2)', fontSize: 12, fontStyle: 'italic' }}>
                      (no variables)
                    </text>
                  )}
                </g>
              ) : (
                <text x={lx + 12} y={lTop + 40} style={{ fill: 'var(--viz-muted)', fontSize: 12, fontStyle: 'italic' }}>
                  no function is running
                </text>
              )}
              {/* lookup */}
              {showLookup && (
                <g>
                  <rect x={qx - 22} y={qy - 13} width={44} height={24} rx={12} style={{ fill: 'var(--viz-2)' }} />
                  <text x={qx} y={qy + 4} textAnchor="middle" className={s.svgMono} style={{ fill: 'var(--surface)', fontSize: 12.5, fontWeight: 800 }}>
                    x?
                  </text>
                  {from === 'local' && found === 'global' && (
                    <text x={lx + lw - 12} y={qy + 31} textAnchor="end" style={{ fill: 'var(--viz-neg)', fontSize: 11.5, fontWeight: 800 }}>
                      1. local: no x
                    </text>
                  )}
                  <path
                    d={`M${qx},${qy + (targetY + 10 > qy ? 12 : -12)} C${qx},${(qy + targetY + 10) / 2} ${targetX + 40},${targetY + 10} ${targetX + 6},${targetY + 11}`}
                    markerEnd={`url(#${markerId})`}
                    style={{ fill: 'none', stroke: 'var(--viz-2)', strokeWidth: 2.5 }}
                  />
                  <rect x={(found === 'local' ? valX(lx) : valX(gx)) - 6} y={targetY - 1} width={44} height={rowH} rx={6} style={{ fill: 'none', stroke: 'var(--viz-pos)', strokeWidth: 2 }} />
                  <text x={targetX + 6} y={targetY - 6} style={{ fill: 'var(--viz-pos)', fontSize: 11.5, fontWeight: 800 }}>
                    {from === 'local' && found === 'global' ? '2. global: found' : `${found}: found`}
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        <div className={s.status} aria-live="polite">
          <b>Line {st.line}.</b>{' '}
          {needsGuess ? (
            <>
              print(x) needs the value of x. Which x will Python use? Make your prediction below, then the arrow will show where Python found it.
            </>
          ) : (
            st.note
          )}
        </div>

        {needsGuess && (
          <div className={s.predict}>
            <span>Predict: what does this print(x) show?</span>
            {CHOICES.map((c) => (
              <button key={c} type="button" className={s.chip} aria-label={`Predict ${c}`} onClick={() => setGuess({ ...guess, [player.step]: c })}>
                {c}
              </button>
            ))}
          </div>
        )}

        <pre className={s.console}>
          <span className={s.consoleLabel}>Printed output</span>
          {printed.length === 0 && <span className={s.muted}>(nothing yet)</span>}
          {printed.map(({ out, i }) => {
            const hidden = i === player.step && needsGuess
            const g = guess[i]
            return (
              <span key={i}>
                {hidden ? <span className={s.muted}>?</span> : out}
                {!hidden && g != null && (
                  <span className={g === out ? s.ok : s.err}>{g === out ? '   ✓ you predicted it' : `   ✗ you guessed ${g}`}</span>
                )}
                {'\n'}
              </span>
            )
          })}
        </pre>

        <PlayerControls player={player} label={(k) => `Step ${k + 1} of ${STEPS.length}`} />
      </div>
    </Figure>
  )
}
