import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Segmented, Plot, usePlot, Path, M, useNarrow } from '../../../../../kit'
import { makeProblem, forward, backward, gradsOf, numericalGrad, relError, getEntry, type Bug, type ParamName } from './net'

/*
  Gradient checking on a small network (N = 5 examples, D = 3, H = 4, K = 3). For eight individual parameters we compare
  the backprop ("analytic") gradient with a finite-difference estimate and show the relative error on a log scale.
  Slide ε to see the error fall (less truncation) and then rise again (floating-point round-off). Inject a bug to see
  the checks fail at every ε.
*/

const CHECKS: [ParamName, number[]][] = [
  ['W1', [0, 0]],
  ['W1', [2, 1]],
  ['b1', [1]],
  ['b1', [3]],
  ['W2', [0, 2]],
  ['W2', [3, 0]],
  ['b2', [0]],
  ['b2', [2]],
]
const THRESH = 1e-6
const LOG_MIN = -14
const BUGS: { value: Bug; label: string }[] = [
  { value: 'none', label: 'correct code' },
  { value: 'noMask', label: 'forgot ReLU mask' },
  { value: 'noN', label: 'forgot / N' },
  { value: 'useZ1', label: 'dW2 = Z1.T @ dZ2' },
]
const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '.': '.' }
const pow10 = (e: number) => (Number.isInteger(e) ? `10${String(e).split('').map((c) => SUP[c] ?? c).join('')}` : `10^${e}`)
const label = (name: ParamName, idx: number[]) => `${name}[${idx.join(',')}]`

function clampLog(r: number) {
  if (!(r > 0)) return LOG_MIN
  return Math.max(LOG_MIN, Math.min(0.5, Math.log10(r)))
}

function UCurve({ curves, logEps }: { curves: { central: [number, number][]; forward: [number, number][] }; logEps: number }) {
  const { xs, ys } = usePlot()
  const [x0, x1] = xs.range()
  const cur = curves.central.find(([e]) => Math.abs(e - logEps) < 1e-9)
  return (
    <g>
      {[-12, -9, -6, -3, 0].map((t) => (
        <g key={t}>
          <line x1={x0} x2={x1} y1={ys(t)} y2={ys(t)} style={{ stroke: t === -6 ? 'var(--viz-neg)' : 'var(--viz-grid)', strokeDasharray: t === -6 ? '5 4' : undefined }} />
          <text x={x0 - 5} y={ys(t)} dy="0.32em" textAnchor="end" style={{ fill: 'var(--viz-axis)', fontSize: 11 }}>
            {pow10(t)}
          </text>
        </g>
      ))}
      {[-10, -8, -6, -4, -2].map((t) => (
        <text key={t} x={xs(t)} y={ys(LOG_MIN) + 15} textAnchor="middle" style={{ fill: 'var(--viz-axis)', fontSize: 11 }}>
          {pow10(t)}
        </text>
      ))}
      <text x={x1} y={ys(LOG_MIN) + 29} textAnchor="end" style={{ fill: 'var(--viz-axis)', fontSize: 11 }}>
        step size ε →
      </text>
      <line x1={xs(logEps)} x2={xs(logEps)} y1={ys(LOG_MIN)} y2={ys(0.5)} style={{ stroke: 'var(--accent)', strokeWidth: 1.5 }} />
      <Path points={curves.forward} color="var(--viz-5)" width={2} dash="5 4" />
      <Path points={curves.central} color="var(--viz-1)" width={2.5} />
      {cur && <circle cx={xs(cur[0])} cy={ys(cur[1])} r={5} style={{ fill: 'var(--viz-1)', stroke: 'var(--surface)', strokeWidth: 2 }} />}
    </g>
  )
}

export default function GradCheckMeter() {
  const [logEps, setLogEps] = useState(-5)
  const [central, setCentral] = useState(true)
  const [bug, setBug] = useState<Bug>('none')
  const prob = useMemo(() => makeProblem(8, 5, 3, 4, 3), [])
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)
  // on phones each row shows only its error; tap a row to see a and n as well
  const [openRow, setOpenRow] = useState<number | null>(null)
  const analytic = useMemo(() => {
    const f = forward(prob.X, prob.Y, prob.p)
    return gradsOf(backward(prob.X, prob.Y, prob.p, f, bug))
  }, [prob, bug])
  const eps = 10 ** logEps

  const rows = CHECKS.map(([name, idx]) => {
    const a = getEntry(analytic, name, idx)
    const n = numericalGrad(prob.X, prob.Y, prob.p, name, idx, eps, central)
    const r = relError(a, n)
    return { name, idx, a, n, r }
  })
  const passed = rows.filter((r) => r.r < THRESH).length

  const curves = useMemo(() => {
    const out = { central: [] as [number, number][], forward: [] as [number, number][] }
    for (let e = -10; e <= -1 + 1e-9; e += 0.5) {
      for (const c of [true, false]) {
        const errs = CHECKS.map(([name, idx]) => relError(getEntry(analytic, name, idx), numericalGrad(prob.X, prob.Y, prob.p, name, idx, 10 ** e, c))).sort((x, y) => x - y)
        const med = (errs[3] + errs[4]) / 2
        ;(c ? out.central : out.forward).push([e, clampLog(med)])
      }
    }
    return out
  }, [analytic, prob])

  return (
    <Figure
      wide
      title="Gradient check: backprop versus a finite difference"
      caption={
        <>
          Each row compares the gradient from backprop with <M>{'\\frac{L(w+\\varepsilon) - L(w-\\varepsilon)}{2\\varepsilon}'}</M> for one
          parameter (a weight or a bias), and the bar shows their relative error (log scale; shorter is better). Slide <M>\varepsilon</M> to the
          left: the error first falls, then rises again below about <M>{'10^{-5}'}</M> because the two losses become so close that rounding
          dominates. The curve below summarises all eight
          rows. Switch to one-sided differences and the best possible error is far worse. Then inject a bug: the bad rows fail at every{' '}
          <M>\varepsilon</M>, which is how you tell a real bug from a badly chosen step size.
        </>
      }
    >
      <Controls>
        <Segmented label="Backprop code" value={bug} onChange={setBug} options={BUGS} />
        <Segmented
          label="Difference"
          value={central ? 'c' : 'f'}
          onChange={(v) => setCentral(v === 'c')}
          options={[
            { value: 'c', label: 'central (w ± ε)' },
            { value: 'f', label: 'one-sided (w + ε)' },
          ]}
        />
      </Controls>
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.3rem' }}>
        {rows.map(({ name, idx, a, n, r }, ri) => {
          const ok = r < THRESH
          const w = ((clampLog(r) - LOG_MIN) / (0 - LOG_MIN)) * 100
          return (
            <div
              key={label(name, idx)}
              role={narrow ? 'button' : undefined}
              tabIndex={narrow ? 0 : undefined}
              aria-expanded={narrow ? openRow === ri : undefined}
              onClick={narrow ? () => setOpenRow(openRow === ri ? null : ri) : undefined}
              onKeyDown={
                narrow
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setOpenRow(openRow === ri ? null : ri)
                      }
                    }
                  : undefined
              }
              style={{ display: 'grid', gridTemplateColumns: 'minmax(4.6em, auto) minmax(0, 1fr) 1.4em', gap: '0.15rem 0.6rem', alignItems: 'center', fontSize: '0.8125rem', cursor: narrow ? 'pointer' : undefined }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--ink)' }}>{label(name, idx)}</span>
              <span style={{ position: 'relative', height: 14, borderRadius: 4, background: 'var(--surface-2)', overflow: 'hidden' }} aria-hidden="true">
                <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.max(1, Math.min(100, w))}%`, background: ok ? 'var(--viz-3)' : 'var(--viz-neg)', opacity: 0.85 }} />
                <span style={{ position: 'absolute', left: `${((-6 - LOG_MIN) / -LOG_MIN) * 100}%`, top: -2, bottom: -2, width: 2, background: 'var(--ink)' }} />
              </span>
              <span style={{ fontWeight: 800, color: ok ? 'var(--ok)' : 'var(--bad)' }} aria-label={ok ? 'pass' : 'fail'}>
                {ok ? '✓' : '✗'}
              </span>
              <span />
              <span className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-2)', overflowWrap: 'anywhere' }}>
                {narrow && openRow !== ri ? '' : `a = ${a.toFixed(6)} · n = ${n.toFixed(6)} · `}error {r === 0 ? '0' : r.toExponential(1)}
              </span>
              <span />
            </div>
          )
        })}
        <div style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }}>
          <M>a</M> = backprop, <M>n</M> = numerical{narrow ? ' (tap a row to see them)' : ''}. Bars: relative error <M>{'|a - n| / \\max(|a|, |n|)'}</M> from <M>{'10^{-14}'}</M> (left) to 1 (right); the black tick marks the pass line <M>{'10^{-6}'}</M>.{' '}
          <b style={{ color: passed === rows.length ? 'var(--ok)' : 'var(--bad)' }}>
            {passed} of {rows.length} pass.
          </b>
        </div>
      </div>
      <Plot x={[-10.3, -0.7]} y={[LOG_MIN, 0.5]} width={520} height={200} minHeight={190} margin={{ left: 42, right: 10, top: 8, bottom: 32 }} ariaLabel="Median relative error against step size epsilon, for central and one-sided differences">
        <UCurve curves={curves} logEps={logEps} />
      </Plot>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--ink-2)' }}>
        <span>
          <span style={{ display: 'inline-block', width: 18, height: 3, background: 'var(--viz-1)', verticalAlign: 'middle', marginRight: 6 }} />
          central difference (median of the 8 rows)
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 18, height: 0, borderTop: '3px dashed var(--viz-5)', verticalAlign: 'middle', marginRight: 6 }} />
          one-sided difference
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 18, height: 0, borderTop: '2px dashed var(--viz-neg)', verticalAlign: 'middle', marginRight: 6 }} />
          pass line, <M>{'10^{-6}'}</M>
        </span>
      </div>
      <Controls>
        <Slider label={<>step size <M>\varepsilon</M></>} value={logEps} min={-10} max={-1} step={0.5} onChange={setLogEps} format={(v) => (Number.isInteger(v) ? pow10(v) : `${(10 ** v).toExponential(1)}`)} />
      </Controls>
    </Figure>
  )
}
