import { useId, useMemo, useState } from 'react'
import { Figure, useNarrow } from '../../../../../kit'
import { parse, evaluate, traceSteps, stopsEarly, ExprError, type Node } from './boolExpr'
import { Py } from './pyCode'
import s from './ui.module.css'

/*
  Two switches A and B, live lamps for A and B / A or B / not A / your own condition, and the
  full truth table with the current row highlighted. Typing a condition adds it as a column and
  shows Python's evaluation one operation at a time (not first, then and, then or).
*/

const ROWS: [boolean, boolean][] = [
  [false, false],
  [false, true],
  [true, false],
  [true, true],
]
const PRESETS = ['A and not B', 'not (A and B)', 'not A and not B', 'not A or B']
// the caption's challenge: True when exactly one switch is on (F, T, T, F down the table)
const XOR = ROWS.map(([a, b]) => a !== b)
const FIXED: { label: string; f: (a: boolean, b: boolean) => boolean }[] = [
  { label: 'A and B', f: (a, b) => a && b },
  { label: 'A or B', f: (a, b) => a || b },
  { label: 'not A', f: (a) => !a },
]

function Switch({ name, on, set }: { name: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} className={`${s.switch} ${on ? s.switchOn : ''}`} onClick={() => set(!on)}>
      <span className={s.knobTrack} aria-hidden="true">
        <span className={s.knob} />
      </span>
      <span>
        {name} = <span style={{ color: on ? 'var(--ok)' : 'var(--bad)' }}>{on ? 'True' : 'False'}</span>
      </span>
    </button>
  )
}

function Lamp({ label, on }: { label: string; on: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
      <span
        aria-hidden="true"
        style={{
          flex: 'none',
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: '2px solid ' + (on ? 'var(--ok)' : 'var(--rule)'),
          background: on ? 'var(--ok)' : 'var(--surface-3)',
          boxShadow: on ? '0 0 0 4px color-mix(in srgb, var(--ok) 25%, transparent)' : 'none',
          transition: 'background-color .15s, box-shadow .15s',
        }}
      />
      <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
        <Py>{label}</Py>
      </span>
      <span className={`${s.pill} ${on ? s.pillTrue : s.pillFalse}`}>{on ? 'True' : 'False'}</span>
    </div>
  )
}

export default function TruthTableToggle() {
  const [A, setA] = useState(true)
  const [B, setB] = useState(false)
  const [src, setSrc] = useState('A and not B')
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const fid = useId()

  const parsed = useMemo((): { node: Node } | { err: ExprError } => {
    try {
      return { node: parse(src) }
    } catch (e) {
      return { err: e instanceof ExprError ? e : new ExprError('SyntaxError', String(e)) }
    }
  }, [src])
  const node = 'node' in parsed ? parsed.node : null
  const custom = node ? src.trim().replace(/\s+/g, ' ') : null
  const steps = node ? traceSteps(node, { A, B }) : []
  const solved = node !== null && ROWS.every(([a, b], i) => evaluate(node, { A: a, B: b }) === XOR[i])
  const tf = (v: boolean) => (narrow ? (v ? 'T' : 'F') : v ? 'True' : 'False')

  return (
    <Figure
      title="Flip the switches, read the truth table"
      caption={
        <>
          Flip <code>A</code> and <code>B</code> (or click a row of the table). <code>and</code> is True only when <em>both</em> sides are True,{' '}
          <code>or</code> when <em>at least one</em> is, and <code>not</code> flips a value. Then type your own condition: the last column shows it
          for all four cases, and the trace shows Python working it out one operation at a time. Challenge: find a condition that is True when
          exactly one switch is on.
        </>
      }
    >
      <div ref={ref} className={s.wrap}>
        <div className={s.switchRow}>
          <Switch name="A" on={A} set={setA} />
          <Switch name="B" on={B} set={setB} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: '0.5rem 1.2rem', width: '100%' }} aria-live="polite">
          {FIXED.map((c) => (
            <Lamp key={c.label} label={c.label} on={c.f(A, B)} />
          ))}
          {node && custom && <Lamp label={custom} on={evaluate(node, { A, B })} />}
        </div>

        <div className={s.field}>
          <label className={s.fieldLabel} htmlFor={fid}>
            Your own condition (use A, B, True, False, and, or, not, ==, != and brackets)
          </label>
          <input
            id={fid}
            type="text"
            className={`${s.input} ${node ? '' : s.inputBad}`}
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
          />
          <div className={s.chips}>
            {PRESETS.map((p) => (
              <button key={p} type="button" className={`${s.chip} ${src.trim() === p ? s.chipOn : ''}`} onClick={() => setSrc(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {node ? (
          <div className={s.status}>
            <div style={{ marginBottom: '0.25rem' }}>
              <strong>How Python works it out</strong> with A = {A ? 'True' : 'False'}, B = {B ? 'True' : 'False'}:
            </div>
            <div className={s.trace}>
              {steps.map((st, i) => (
                <div key={i} className={s.traceStep}>
                  <span className={s.traceArrow}>{i ? '→' : ''}</span>
                  <Py>{st}</Py>
                </div>
              ))}
            </div>
            {stopsEarly(node, { A, B }) && (
              <div style={{ marginTop: '0.25rem' }}>
                Python stopped early: <Py>False and …</Py> is already False and <Py>True or …</Py> is already True, so the right side is never looked at.
              </div>
            )}
          </div>
        ) : (
          <div className={`${s.status} ${s.statusBad}`} role="alert">
            <strong>{'err' in parsed ? parsed.err.kind : 'Error'}:</strong> {'err' in parsed ? parsed.err.message : ''}
          </div>
        )}

        {solved && (
          <div className={`${s.status} ${s.statusOk}`}>
            <strong>Challenge solved:</strong> your condition is True exactly when one switch is on. Two classic ways to write it are{' '}
            <Py>A != B</Py> and <Py>(A or B) and not (A and B)</Py>.
          </div>
        )}

        <div className={s.tableWrap}>
          <table className={s.table} aria-label="Truth table for A and B">
            <thead>
              <tr>
                <th>A</th>
                <th>B</th>
                {FIXED.map((c) => (
                  <th key={c.label}>{c.label}</th>
                ))}
                {custom && (
                  <th className={s.colCustom} style={{ maxWidth: narrow ? 90 : 160, whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                    {custom}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([a, b]) => {
                const now = a === A && b === B
                const cell = (v: boolean, extra = '') => <td className={`${v ? s.cellT : s.cellF} ${extra}`}>{tf(v)}</td>
                return (
                  <tr
                    key={`${a}${b}`}
                    className={now ? s.rowNow : ''}
                    onClick={() => {
                      setA(a)
                      setB(b)
                    }}
                    aria-current={now ? 'true' : undefined}
                  >
                    {cell(a)}
                    {cell(b)}
                    {FIXED.map((c) => (
                      <td key={c.label} className={c.f(a, b) ? s.cellT : s.cellF}>
                        {tf(c.f(a, b))}
                      </td>
                    ))}
                    {node && cell(evaluate(node, { A: a, B: b }), s.colCustom)}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {narrow && <div className={s.legend}>T = True, F = False. Tap a row to set the switches.</div>}
      </div>
    </Figure>
  )
}
