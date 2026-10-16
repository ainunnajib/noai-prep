import { useState } from 'react'
import { Figure, Controls, Slider, Plot, usePlot } from '../../../../../kit'
import { Py } from './pyCode'
import s from './ui.module.css'

/*
  A number line for one comparison, x OP t. Drag x (or click the line), pick an operator by
  clicking its lamp, and slide the threshold t. The green band is every x that makes the
  comparison True; a filled end dot means "t itself is included", a hollow one means "excluded",
  exactly like inequalities in school maths.
*/

type Op = '<' | '<=' | '==' | '!=' | '>=' | '>'
/** Laid out in rows of opposites: in every row exactly one lamp is True. */
const OPS: Op[] = ['<', '>=', '<=', '>', '==', '!=']
const WORDS: Record<Op, string> = {
  '<': 'less than',
  '<=': 'less than or equal to',
  '==': 'equal to',
  '!=': 'not equal to',
  '>=': 'greater than or equal to',
  '>': 'greater than',
}
const X0 = -0.5
const X1 = 10.5

function test(op: Op, x: number, t: number): boolean {
  switch (op) {
    case '<':
      return x < t
    case '<=':
      return x <= t
    case '==':
      return x === t
    case '!=':
      return x !== t
    case '>=':
      return x >= t
    case '>':
      return x > t
  }
}
const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1))
const snap = (v: number) => Math.max(0, Math.min(10, Math.round(v * 2) / 2))

function Line({ op, t, x, setX }: { op: Op; t: number; x: number; setX: (v: number) => void }) {
  const { xs, ys } = usePlot()
  const yL = ys(1)
  const yPin = ys(2.25)
  const truth = test(op, x, t)
  const inclusive = op === '<=' || op === '>=' || op === '=='
  // the True region as intervals in data units
  let bands: [number, number][] = []
  if (op === '<' || op === '<=') bands = [[X0, t]]
  else if (op === '>' || op === '>=') bands = [[t, X1]]
  else if (op === '!=') bands = [[X0, X1]]
  const pinColour = truth ? 'var(--viz-pos)' : 'var(--viz-neg)'

  const onKey = (e: React.KeyboardEvent) => {
    let v = x
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') v = x - 0.5
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') v = x + 0.5
    else if (e.key === 'Home') v = 0
    else if (e.key === 'End') v = 10
    else return
    e.preventDefault()
    setX(snap(v))
  }

  return (
    <g>
      {/* True region */}
      {bands.map(([a, b], i) => (
        <line key={i} x1={xs(a)} x2={xs(b)} y1={yL} y2={yL} style={{ stroke: 'var(--viz-pos)', strokeWidth: 12, opacity: 0.45 }} strokeLinecap="butt" />
      ))}
      {/* the number line */}
      <line x1={xs(X0)} x2={xs(X1)} y1={yL} y2={yL} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.5 }} />
      {Array.from({ length: 11 }, (_, k) => (
        <g key={k}>
          <line x1={xs(k)} x2={xs(k)} y1={yL - 5} y2={yL + 5} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.25 }} />
          <text
            x={xs(k)}
            y={yL + 22}
            textAnchor="middle"
            style={{ fill: k === t ? 'var(--accent)' : 'var(--ink-3)', fontSize: k === t ? 14 : 12, fontWeight: k === t ? 800 : 400 }}
          >
            {k}
          </text>
        </g>
      ))}
      <text x={xs(t)} y={yL + 38} textAnchor="middle" style={{ fill: 'var(--accent)', fontSize: 11, fontWeight: 700 }}>
        t
      </text>
      {/* end dot at t: filled = included, hollow = excluded */}
      <circle
        cx={xs(t)}
        cy={yL}
        r={7}
        style={inclusive ? { fill: 'var(--viz-pos)', stroke: 'var(--surface)', strokeWidth: 2 } : { fill: 'var(--surface)', stroke: 'var(--viz-pos)', strokeWidth: 2.5 }}
      />
      {/* x pin */}
      <line x1={xs(x)} x2={xs(x)} y1={yPin} y2={yL} style={{ stroke: pinColour, strokeWidth: 2, strokeDasharray: '4 3' }} />
      <g
        className="plot-drag"
        tabIndex={0}
        role="slider"
        aria-label="x: drag along the number line"
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={x}
        onKeyDown={onKey}
      >
        <circle cx={xs(x)} cy={yPin} r={20} style={{ fill: 'transparent' }} />
        <circle cx={xs(x)} cy={yPin} r={10} style={{ fill: pinColour, stroke: 'var(--surface)', strokeWidth: 2.5 }} />
      </g>
      <text
        className="plot-label"
        x={Math.max(xs(X0) + 34, Math.min(xs(X1) - 34, xs(x)))}
        y={yPin - 17}
        textAnchor="middle"
        style={{ fill: pinColour }}
      >
        x = {fmt(x)}
      </text>
    </g>
  )
}

export default function ComparisonLine() {
  const [op, setOp] = useState<Op>('>=')
  const [t, setT] = useState(5)
  const [x, setX] = useState(6.5)
  const truth = test(op, x, t)

  return (
    <Figure
      title="Where is a comparison True?"
      caption={
        <>
          Drag the pin (or tap the line) to change <code>x</code>, slide <code>t</code>, and click a lamp to choose the comparison. The green band
          is every <code>x</code> that makes it <code>True</code>. A filled dot at <code>t</code> means <code>t</code> itself counts (
          <code>&lt;=</code>, <code>&gt;=</code>, <code>==</code>); a hollow dot means it does not, just like inequalities in maths. Notice that{' '}
          <code>==</code> is True at a single point, and that the two lamps in each row are always opposites.
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.bigExpr} aria-live="polite">
          <Py>{`x ${op} t`}</Py>
          <span className={s.arrow}>→</span>
          <Py>{`${fmt(x)} ${op} ${t}`}</Py>
          <span className={s.arrow}>→</span>
          <span className={`${s.pill} ${truth ? s.pillTrue : s.pillFalse}`}>{truth ? 'True' : 'False'}</span>
        </div>
        <div style={{ fontSize: 'var(--step--1)', color: 'var(--ink-2)', textAlign: 'center' }}>
          “Is x {WORDS[op]} t?”
        </div>
        <Plot
          x={[X0, X1]}
          y={[0, 3]}
          width={540}
          height={150}
          minHeight={140}
          margin={{ top: 6, right: 14, bottom: 6, left: 14 }}
          ariaLabel={`Number line from 0 to 10. x is ${fmt(x)}, t is ${t}. The comparison x ${op} t is ${truth}.`}
          onPointerDown={(p, e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            setX(snap(p[0]))
          }}
          onPointerMove={(p, e) => {
            if (e.buttons & 1) setX(snap(p[0]))
          }}
        >
          <Line op={op} t={t} x={x} setX={setX} />
        </Plot>
        <div className={s.lampGrid} role="radiogroup" aria-label="Choose a comparison">
          {OPS.map((o) => {
            const v = test(o, x, t)
            return (
              <button key={o} type="button" role="radio" aria-checked={o === op} className={`${s.lampBtn} ${o === op ? s.lampBtnOn : ''}`} onClick={() => setOp(o)}>
                <span className={s.lampExpr}>
                  <Py>{`x ${o} t`}</Py>
                  <span className={s.lampSub}>
                    {fmt(x)} {o} {t}
                  </span>
                </span>
                <span className={`${s.pill} ${v ? s.pillTrue : s.pillFalse}`}>{v ? 'True' : 'False'}</span>
              </button>
            )
          })}
        </div>
        <Controls>
          <Slider label={<>threshold <code>t</code></>} value={t} min={0} max={10} step={1} onChange={setT} />
          <Slider label={<>value <code>x</code></>} value={x} min={0} max={10} step={0.5} onChange={setX} format={fmt} />
        </Controls>
      </div>
    </Figure>
  )
}
