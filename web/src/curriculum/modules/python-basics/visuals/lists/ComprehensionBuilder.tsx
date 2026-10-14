import { useEffect, useState, type ReactNode } from 'react'
import { Figure, Controls, Slider, Segmented, usePlayer, PlayerControls } from '../../../../../kit'
import { Py, highlightPy } from '../decisions/pyCode'
import ui from '../decisions/ui.module.css'
import s from './lists.module.css'

/*
  Build a list with a loop and append, one pass at a time, next to the one-line list
  comprehension that does the same job. Matching parts of the two versions share a colour,
  so you can see that [EXPR for x in range(n)] is the loop folded into one line.
*/

const EXPRS: { src: string; f: (x: number) => number }[] = [
  { src: 'x', f: (x) => x },
  { src: 'x * 2', f: (x) => x * 2 },
  { src: 'x ** 2', f: (x) => x ** 2 },
  { src: 'x % 2', f: (x) => x % 2 },
  { src: '10 - x', f: (x) => 10 - x },
]

const C_EXPR = 'var(--viz-2)'
const C_LOOP = 'var(--viz-1)'

function Part({ colour, children }: { colour: string; children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        whiteSpace: 'pre',
        borderRadius: 4,
        padding: '0 3px',
        background: `color-mix(in srgb, ${colour} 16%, transparent)`,
        boxShadow: `inset 0 -2px 0 ${colour}`,
      }}
    >
      {children}
    </span>
  )
}

export default function ComprehensionBuilder() {
  const [ei, setEi] = useState(2)
  const [n, setN] = useState(5)
  const { src, f } = EXPRS[ei]
  const vals = Array.from({ length: n }, (_, x) => f(x))
  const player = usePlayer({ steps: n + 1, interval: 750 })
  const { setStep } = player
  useEffect(() => {
    setStep(n)
  }, [ei, n, setStep])
  const k = Math.min(player.step, n)

  const codeLine = (children: ReactNode, on = false, wrap = false) => (
    <li className={`${ui.line} ${on ? ui.lineNow : ''}`} style={{ minHeight: '1.8rem' }}>
      <span className={ui.code} style={{ paddingLeft: '0.5rem', whiteSpace: wrap ? 'normal' : undefined, lineHeight: wrap ? 1.9 : undefined }}>
        {children}
      </span>
    </li>
  )

  return (
    <Figure
      wide
      title="Building a list: the loop and the one-liner"
      caption={
        <>
          Pick an expression and a length, then press <strong>Play</strong> to watch the list fill up one <code>append</code> at a time. The orange
          part is <em>what</em> goes into the list and the blue part is <em>which</em> values of <code>x</code> are used. A list comprehension is the
          same loop written inside square brackets.
        </>
      }
    >
      <div className={ui.wrap}>
        <div className={ui.row} style={{ justifyContent: 'center', gap: '0.6rem 1.2rem' }}>
          <Segmented label="What to put in" options={EXPRS.map((e, i) => ({ value: i, label: e.src }))} value={ei} onChange={setEi} />
        </div>
        <div className={ui.stack}>
          <div className={ui.pane}>
            <div className={ui.bar}>
              <span>with a loop</span>
            </div>
            <ol className={ui.lines}>
              {codeLine(<>{highlightPy('result = []')}</>, k === 0)}
              {codeLine(
                <>
                  <Part colour={C_LOOP}>
                    {highlightPy(`for x in range(${n})`)}
                  </Part>
                  {highlightPy(':')}
                </>,
                k > 0 && k <= n,
              )}
              {codeLine(
                <>
                  {highlightPy('    result.append(')}
                  <Part colour={C_EXPR}>
                    {highlightPy(src)}
                  </Part>
                  {highlightPy(')')}
                </>,
                k > 0 && k <= n,
              )}
            </ol>
          </div>
          <div className={ui.pane}>
            <div className={ui.bar}>
              <span>as a list comprehension</span>
            </div>
            <ol className={ui.lines}>
              {codeLine(
                <>
                  {highlightPy('result = [')}
                  <Part colour={C_EXPR}>
                    {highlightPy(src)}
                  </Part>{' '}
                  <Part colour={C_LOOP}>
                    {highlightPy(`for x in range(${n})`)}
                  </Part>
                  {highlightPy(']')}
                </>,
                false,
                true,
              )}
            </ol>
            <div className={ui.console} style={{ borderTop: '1px solid var(--rule)' }}>
              {k === n ? <Py>{`[${vals.join(', ')}]`}</Py> : <span className={ui.muted}>press Play to build it step by step</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', minHeight: 64, alignItems: 'flex-end' }} aria-live="polite">
          {vals.map((v, x) => (
            <div key={`${ei}-${n}-${x}`} style={{ display: 'grid', justifyItems: 'center', gap: 2, visibility: x < k ? 'visible' : 'hidden' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>[{x}]</span>
              <div
                className={`${x === k - 1 ? s.boxNew : ''}`}
                style={{
                  width: 46,
                  height: 46,
                  display: 'grid',
                  placeItems: 'center',
                  border: `2px solid ${x === k - 1 ? 'var(--accent)' : 'var(--viz-1)'}`,
                  borderRadius: 8,
                  background: x === k - 1 ? 'var(--accent-soft)' : 'color-mix(in srgb, var(--viz-1) 12%, var(--surface))',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>
        <div className={ui.status}>
          {k === 0 ? (
            <>
              <Py>{'result = []'}</Py> starts an empty list. Press <strong>Next</strong>.
            </>
          ) : (
            <>
              Pass {k}: <Py>{`x = ${k - 1}`}</Py>, so <Py>{src}</Py> is <Py>{String(vals[k - 1])}</Py> and <Py>{`result.append(${vals[k - 1]})`}</Py> puts it
              at the end. The list now has {k} item{k === 1 ? '' : 's'}.
            </>
          )}
        </div>
        <PlayerControls player={player} label={(st) => `${Math.min(st, n)} of ${n} appended`} />
        <Controls>
          <Slider label={<>length <code>n</code> in <code>range(n)</code></>} value={n} min={1} max={8} step={1} onChange={setN} />
        </Controls>
      </div>
    </Figure>
  )
}
