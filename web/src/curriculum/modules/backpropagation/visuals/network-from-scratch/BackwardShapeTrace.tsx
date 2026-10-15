import { Fragment, useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Slider, Segmented, MatrixGrid, usePlayer, PlayerControls, useContainerWidth } from '../../../../../kit'
import { makeProblem, forward, matmul, T, sumRows, numericalGrad, cloneParams, fmtShape, type Mat, type Vec, type Bug, type ParamName, type Params } from './net'
import css from './trace.module.css'

/*
  Step through the seven backward-pass lines for a batch, with the shape arithmetic for each line and a heat map
  of the arrays involved. Change N, D, H, K and every shape updates. Inject a classic bug and see whether a shape
  error or only the gradient check catches it.
*/

type Arr = Mat | Vec
const isMat = (a: Arr): a is Mat => Array.isArray(a[0])
const shapeOf = (a: Arr): number[] => (isMat(a) ? [a.length, a[0].length] : [a.length])
const asMat = (a: Arr): Mat => (isMat(a) ? a : [a])

interface LineResult {
  code: string
  out: string
  like: string
  likeShape: number[]
  shapeText: string
  operands: { name: string; arr: Arr; op?: string }[]
  result?: Arr
  error?: string
  /** a plain-words reading of the error */
  gloss?: string
  skipped?: boolean
}

const BUGS: { value: Bug; label: string }[] = [
  { value: 'none', label: 'no bug' },
  { value: 'noTransposeX', label: 'X @ dZ1 (no .T)' },
  { value: 'noTransposeW2', label: 'dZ2 @ W2 (no .T)' },
  { value: 'noMask', label: 'forgot ReLU mask' },
  { value: 'noN', label: 'forgot / N' },
]

function runLines(X: Mat, Y: Mat, p: Params, bug: Bug, N: number, D: number, H: number, K: number): LineResult[] {
  const f = forward(X, Y, p)
  const res: LineResult[] = []
  const env: Record<string, Arr | undefined> = {}
  const s = (a: number[]) => fmtShape(a)
  // Python stops at the first error, so every line after a crash is "not run"
  let crashed = false
  const push = (r: Omit<LineResult, 'result' | 'error' | 'skipped' | 'gloss'>, compute: () => Arr, needs: string[], gloss?: () => string) => {
    if (crashed || needs.some((n) => env[n] === undefined)) {
      res.push({ ...r, skipped: true })
      return
    }
    try {
      const out = compute()
      env[r.out] = out
      res.push({ ...r, result: out })
    } catch (e) {
      crashed = true
      res.push({ ...r, error: (e as Error).message, gloss: gloss?.() })
    }
  }
  /** "inner sizes must match" explanation for A @ B */
  const innerGloss = (an: string, A: Arr, bn: string, B: Arr) => {
    const sa = shapeOf(A)
    const sb = shapeOf(B)
    return `In plain words: for A @ B the inner sizes must match. ${an} is ${s(sa)} and ${bn} is ${s(sb)}, so ${sa[sa.length - 1]} ≠ ${sb[0]}.`
  }
  const mask = f.Z1.map((row) => row.map((v) => (v > 0 ? 1 : 0)))

  push(
    {
      code: bug === 'noN' ? 'dZ2 = P - Y' : 'dZ2 = (P - Y) / N',
      out: 'dZ2',
      like: 'Z2',
      likeShape: [N, K],
      shapeText: `${s([N, K])} − ${s([N, K])}${bug === 'noN' ? '' : ` ÷ ${N}`} → ${s([N, K])}`,
      operands: [
        { name: 'P', arr: f.P },
        { name: 'Y', arr: Y, op: '−' },
      ],
    },
    () => f.P.map((row, i) => row.map((v, k) => (bug === 'noN' ? v - Y[i][k] : (v - Y[i][k]) / N))),
    [],
  )
  push(
    { code: 'dW2 = A1.T @ dZ2', out: 'dW2', like: 'W2', likeShape: [H, K], shapeText: `${s([H, N])} @ ${s([N, K])} → ${s([H, K])}`, operands: [{ name: 'A1.T', arr: T(f.A1) }, { name: 'dZ2', arr: env.dZ2 ?? [[0]], op: '@' }] },
    () => matmul(T(f.A1), env.dZ2 as Mat),
    ['dZ2'],
  )
  push(
    { code: 'db2 = dZ2.sum(axis=0)', out: 'db2', like: 'b2', likeShape: [K], shapeText: `${s([N, K])} summed down the rows → ${s([K])}`, operands: [{ name: 'dZ2', arr: env.dZ2 ?? [[0]] }] },
    () => sumRows(env.dZ2 as Mat),
    ['dZ2'],
  )
  push(
    {
      code: bug === 'noTransposeW2' ? 'dA1 = dZ2 @ W2' : 'dA1 = dZ2 @ W2.T',
      out: 'dA1',
      like: 'A1',
      likeShape: [N, H],
      shapeText: bug === 'noTransposeW2' ? `${s([N, K])} @ ${s([H, K])} → ${K === H ? s([N, K]) : 'error'}` : `${s([N, K])} @ ${s([K, H])} → ${s([N, H])}`,
      operands: [
        { name: 'dZ2', arr: env.dZ2 ?? [[0]] },
        { name: bug === 'noTransposeW2' ? 'W2' : 'W2.T', arr: bug === 'noTransposeW2' ? p.W2 : T(p.W2), op: '@' },
      ],
    },
    () => matmul(env.dZ2 as Mat, bug === 'noTransposeW2' ? p.W2 : T(p.W2)),
    ['dZ2'],
    () => innerGloss('dZ2', env.dZ2 as Mat, bug === 'noTransposeW2' ? 'W2' : 'W2.T', bug === 'noTransposeW2' ? p.W2 : T(p.W2)),
  )
  push(
    {
      code: bug === 'noMask' ? 'dZ1 = dA1' : 'dZ1 = dA1 * (Z1 > 0)',
      out: 'dZ1',
      like: 'Z1',
      likeShape: [N, H],
      shapeText: bug === 'noMask' ? `${s([N, H])} → ${s([N, H])}` : `${s([N, H])} * ${s([N, H])} (element by element) → ${s([N, H])}`,
      operands: bug === 'noMask' ? [{ name: 'dA1', arr: env.dA1 ?? [[0]] }] : [{ name: 'dA1', arr: env.dA1 ?? [[0]] }, { name: 'Z1 > 0', arr: mask, op: '*' }],
    },
    () => {
      const dA1 = env.dA1 as Mat
      if (dA1.length !== N || dA1[0].length !== H) throw new Error(`ValueError: operands could not be broadcast together with shapes ${s(shapeOf(dA1))} ${s([N, H])}`)
      return bug === 'noMask' ? dA1.map((r) => r.slice()) : dA1.map((row, i) => row.map((v, j) => v * mask[i][j]))
    },
    ['dA1'],
    () => `In plain words: * works element by element, so both arrays need the same shape (or shapes NumPy can stretch to match), and ${s(shapeOf(env.dA1 as Mat))} and ${s([N, H])} cannot be matched.`,
  )
  push(
    {
      code: bug === 'noTransposeX' ? 'dW1 = X @ dZ1' : 'dW1 = X.T @ dZ1',
      out: 'dW1',
      like: 'W1',
      likeShape: [D, H],
      shapeText: bug === 'noTransposeX' ? `${s([N, D])} @ ${s([N, H])} → ${N === D ? s([N, H]) : 'error'}` : `${s([D, N])} @ ${s([N, H])} → ${s([D, H])}`,
      operands: [
        { name: bug === 'noTransposeX' ? 'X' : 'X.T', arr: bug === 'noTransposeX' ? X : T(X) },
        { name: 'dZ1', arr: env.dZ1 ?? [[0]], op: '@' },
      ],
    },
    () => matmul(bug === 'noTransposeX' ? X : T(X), env.dZ1 as Mat),
    ['dZ1'],
    () => innerGloss(bug === 'noTransposeX' ? 'X' : 'X.T', bug === 'noTransposeX' ? X : T(X), 'dZ1', env.dZ1 as Mat),
  )
  push(
    { code: 'db1 = dZ1.sum(axis=0)', out: 'db1', like: 'b1', likeShape: [H], shapeText: `${s([N, H])} summed down the rows → ${s([H])}`, operands: [{ name: 'dZ1', arr: env.dZ1 ?? [[0]] }] },
    () => sumRows(env.dZ1 as Mat),
    ['dZ1'],
  )
  return res
}

/** Gradient check: ‖analytic − numerical‖ / max(‖analytic‖, ‖numerical‖) for one parameter. */
function checkParam(X: Mat, Y: Mat, p: Params, name: ParamName, analytic: Arr): number {
  const q = cloneParams(p)
  const a = asMat(analytic)
  let diff = 0
  let na = 0
  let nn = 0
  const ref = q[name] as Arr
  const rows = isMat(ref) ? ref.length : 1
  const cols = isMat(ref) ? ref[0].length : ref.length
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) {
      const idx = isMat(ref) ? [i, j] : [j]
      const num = numericalGrad(X, Y, q, name, idx, 1e-5)
      const an = a[i][j]
      diff += (an - num) ** 2
      na += an * an
      nn += num * num
    }
  const d = Math.max(Math.sqrt(na), Math.sqrt(nn))
  return d === 0 ? 0 : Math.sqrt(diff) / d
}

const fmtVal = (v: number) => (Math.abs(v) < 0.005 ? '0' : v.toFixed(2))
const blank = () => ''

function Op({ children }: { children: ReactNode }) {
  return <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--ink-2)', alignSelf: 'center' }}>{children}</span>
}

export default function BackwardShapeTrace() {
  const [N, setN] = useState(4)
  const [D, setD] = useState(3)
  const [H, setH] = useState(5)
  const [K, setK] = useState(2)
  const [bug, setBug] = useState<Bug>('none')
  const player = usePlayer({ steps: 8, interval: 1600 })
  const step = player.step
  const [gridsRef, gridsW] = useContainerWidth<HTMLDivElement>(560)

  const prob = useMemo(() => makeProblem(1000 + N * 100 + D * 10 + H + K * 1000, N, D, H, K), [N, D, H, K])
  const lines = useMemo(() => runLines(prob.X, prob.Y, prob.p, bug, N, D, H, K), [prob, bug, N, D, H, K])
  const checks = useMemo(() => {
    if (step < 7) return null
    const byName: Record<string, LineResult> = Object.fromEntries(lines.map((l) => [l.out, l]))
    return (['W2', 'b2', 'W1', 'b1'] as ParamName[]).map((name) => {
      const l = byName['d' + name]
      const shapeOk = l.result ? fmtShape(shapeOf(l.result)) === fmtShape(l.likeShape) : false
      const rel = l.result && shapeOk ? checkParam(prob.X, prob.Y, prob.p, name, l.result) : NaN
      return { name, l, shapeOk, rel }
    })
  }, [step, lines, prob])

  const cur = step < 7 ? lines[step] : null
  const curShapeOk = cur?.result ? fmtShape(shapeOf(cur.result)) === fmtShape(cur.likeShape) : false

  return (
    <Figure
      wide
      title="The backward pass, one line at a time, with shapes"
      caption={
        <>
          Step through the seven lines, then a final gradient check (step 8). Each line shows its shape arithmetic and the arrays involved (shaded
          blue for negative, orange for positive; outlined cells are 0).
          Notice that <b>every gradient comes out with exactly the shape of the thing it is the gradient of</b>: dW1 like W1, db2 like b2. Change N, D,
          H or K and the shapes follow. Then pick a bug: a missing <code>.T</code> usually crashes with a shape error (unless the sizes happen to
          match), but a missing ReLU mask or <code>/ N</code> runs happily and only the gradient check on the last step catches it.
        </>
      }
    >
      <Controls>
        <Segmented label="Inject a bug" value={bug} onChange={(b) => setBug(b)} options={BUGS} />
      </Controls>
      <div style={{ width: '100%', display: 'grid', gap: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
        {lines.map((l, i) => {
          const done = i <= step
          const active = i === step
          const ok = l.result && fmtShape(shapeOf(l.result)) === fmtShape(l.likeShape)
          const badge = !done ? '' : l.skipped ? 'not run' : l.error ? 'error' : ok ? `${fmtShape(shapeOf(l.result!))} ✓` : `${fmtShape(shapeOf(l.result!))} ≠ ${l.like} ${fmtShape(l.likeShape)}`
          const badgeColour = l.error || (done && !l.skipped && !ok) ? 'var(--bad)' : l.skipped ? 'var(--ink-3)' : 'var(--ok)'
          return (
            <button
              key={i}
              type="button"
              onClick={() => player.setStep(i)}
              style={{
                font: 'inherit',
                textAlign: 'left',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: '0.2rem 0.8rem',
                padding: '0.3rem 0.6rem',
                borderRadius: 8,
                border: `1.5px solid ${active ? 'var(--accent)' : 'transparent'}`,
                background: active ? 'color-mix(in srgb, var(--accent) 12%, var(--surface))' : done ? 'var(--surface-2)' : 'transparent',
                color: done ? 'var(--ink)' : 'var(--ink-3)',
                cursor: 'pointer',
              }}
            >
              <span>
                <span style={{ color: 'var(--ink-3)' }}>{i + 1}. </span>
                {l.code}
              </span>
              <span style={{ color: badgeColour, fontWeight: 700 }}>{badge}</span>
            </button>
          )
        })}
      </div>

      <div style={{ width: '100%', minHeight: 170, borderRadius: 10, padding: '0.7rem', background: 'var(--surface-2)', border: '1px solid var(--rule)', display: 'grid', gap: '0.6rem', justifyItems: 'center' }}>
        {cur && (
          <>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--ink)', textAlign: 'center', overflowWrap: 'anywhere' }}>
              <b>{cur.code}</b>
              <br />
              {cur.shapeText}
            </div>
            {cur.skipped ? (
              <div style={{ color: 'var(--ink-2)', fontSize: '0.875rem' }}>Not run: an earlier line crashed, so Python stopped there.</div>
            ) : (
              <div ref={gridsRef} className={css.grids} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
                {cur.operands.map((o, k) => (
                  <Fragment key={k}>
                    {o.op && <Op>{o.op}</Op>}
                    <MatrixGrid data={asMat(o.arr)} heat diverging format={blank} cellSize={13} label={`${o.name} ${fmtShape(shapeOf(o.arr))}`} brackets={false} ariaLabel={o.name} />
                  </Fragment>
                ))}
                {cur.result && (
                  <>
                    <Op>=</Op>
                    <MatrixGrid
                      data={asMat(cur.result)}
                      heat
                      diverging
                      format={fmtVal}
                      // shrink the cells so a 6-column result still fits a phone-width panel
                      cellSize={Math.max(30, Math.min(50, Math.floor((gridsW - 40) / (shapeOf(cur.result)[1] ?? 1)) - 3))}
                      label={
                        <span style={{ color: curShapeOk ? 'var(--ok)' : 'var(--bad)' }}>
                          {cur.out} {fmtShape(shapeOf(cur.result))} {curShapeOk ? `= shape of ${cur.like} ✓` : `but ${cur.like} is ${fmtShape(cur.likeShape)} ✗`}
                        </span>
                      }
                      ariaLabel={cur.out}
                    />
                  </>
                )}
              </div>
            )}
            {cur.error && (
              <div role="alert" style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--bad)', background: 'var(--bad-soft)', borderRadius: 8, padding: '0.5rem 0.6rem', overflowWrap: 'anywhere' }}>
                {cur.error}
                {cur.gloss && <div style={{ marginTop: '0.35rem', fontFamily: 'var(--font-body)', color: 'var(--ink)', fontSize: '0.8125rem' }}>{cur.gloss}</div>}
              </div>
            )}
          </>
        )}
        {checks && (
          <div style={{ width: '100%', display: 'grid', gap: '0.35rem' }}>
            <div style={{ fontWeight: 800, color: 'var(--ink)' }}>Final checks</div>
            {checks.map(({ name, l, shapeOk, rel }) => {
              const gradOk = Number.isFinite(rel) && rel < 1e-6
              return (
                <div key={name} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem 1rem', fontSize: '0.875rem', padding: '0.3rem 0.5rem', borderRadius: 8, background: 'var(--surface)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, minWidth: '3.2em' }}>d{name}</span>
                  <span style={{ color: l.result && shapeOk ? 'var(--ok)' : 'var(--bad)' }}>
                    shape: {l.skipped ? 'not computed' : l.error ? 'crashed' : `${fmtShape(shapeOf(l.result!))} vs ${name} ${fmtShape(l.likeShape)} ${shapeOk ? '✓' : '✗'}`}
                  </span>
                  <span style={{ color: gradOk ? 'var(--ok)' : 'var(--bad)' }}>
                    gradient check: {Number.isFinite(rel) ? `relative error ${rel < 1e-12 ? '< 10⁻¹²' : rel.toExponential(1)} ${gradOk ? '✓' : '✗'}` : '–'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <PlayerControls player={player} label={(s) => (s < 7 ? `Step ${s + 1} of 8: line ${s + 1}` : 'Step 8 of 8: final checks')} />
      <Controls>
        <Slider label="N (examples in the batch)" value={N} min={1} max={6} onChange={setN} />
        <Slider label="D (input features)" value={D} min={1} max={5} onChange={setD} />
        <Slider label="H (hidden units)" value={H} min={1} max={6} onChange={setH} />
        <Slider label="K (classes)" value={K} min={2} max={4} onChange={setK} />
      </Controls>
    </Figure>
  )
}
