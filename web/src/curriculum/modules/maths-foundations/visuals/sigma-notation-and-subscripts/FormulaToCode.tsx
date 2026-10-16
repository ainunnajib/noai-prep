import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Controls, Readout, Segmented, Button, MatrixGrid, Plot, Grid, Axes, Path, Dots, Label, useNarrow, M } from '../../../../../kit'

/*
  Translating the 2025 Final's update rule into code, symbol by symbol.
    θ_j := θ_j − α · (1/m) · Σ_i (h_θ(x⁽ⁱ⁾) − y⁽ⁱ⁾) · x_j⁽ⁱ⁾,   h_θ(x) = θ₀x₀ + θ₁x₁
  on X = [[2, 2], [2, 4], [2, 6]], y = [2, 4, 6], α = 0.01, θ starting at [0, 0].
  Each symbol has a colour; hovering it lights up the same symbol in the formula, the table and the code.
  Both the loop version and the vectorised version are actually run (in JS) and must agree.
*/

type Key = 'theta' | 'alpha' | 'm' | 'sum' | 'h' | 'y' | 'x' | 'assign'
type Stage = 'symbols' | 'loops' | 'numpy'

const SYM: Record<Key, { colour: string; tex: string; py: string; words: string; value: string }> = {
  theta: { colour: 'var(--viz-1)', tex: '\\theta_j', py: 'theta[j]', words: 'parameter number j (j = 0 or 1)', value: 'theta: 2 numbers, start [0, 0]' },
  assign: { colour: 'var(--ink-2)', tex: ':=', py: '=', words: '"becomes": replace the old value with the new one', value: 'all θⱼ change together' },
  alpha: { colour: 'var(--viz-2)', tex: '\\alpha', py: 'alpha', words: 'learning rate: the size of each step', value: '0.01' },
  m: { colour: 'var(--viz-3)', tex: '\\dfrac{1}{m}', py: '/ m', words: 'divide by m, the number of examples (rows of X)', value: 'm = 3' },
  sum: { colour: 'var(--viz-4)', tex: '\\displaystyle\\sum_{i=1}^{m}', py: 'for i in range(m)', words: 'add up over every example i', value: 'a loop over 3 rows' },
  h: { colour: 'var(--viz-5)', tex: 'h_\\theta(x^{(i)})', py: 'h', words: 'the prediction for example i: θ₀x₀⁽ⁱ⁾ + θ₁x₁⁽ⁱ⁾', value: 'one number per example' },
  y: { colour: 'var(--viz-6)', tex: 'y^{(i)}', py: 'y[i]', words: 'the true answer for example i', value: 'y = [2, 4, 6]' },
  x: { colour: 'var(--viz-neg)', tex: 'x_j^{(i)}', py: 'X[i][j]', words: 'feature j of example i', value: 'X: 3 rows × 2 columns' },
}
const ORDER: Key[] = ['theta', 'assign', 'alpha', 'm', 'sum', 'h', 'y', 'x']

const FORMULA: (Key | string)[] = ['theta', 'assign', 'theta', '-', 'alpha', '\\cdot', 'm', '\\cdot', 'sum', '\\big(', 'h', '-', 'y', '\\big)', '\\cdot', 'x']

type Seg = [string, Key?]
const LOOP: Seg[][] = [
  [['new_theta = [0.0, 0.0]']],
  [['for j in range(n):'], ['   # every θ_j']],
  [['    total = 0.0']],
  [['    '], ['for i in range(m):', 'sum'], ['   # Σ over i']],
  [['        '], ['h', 'h'], [' = theta[0]*X[i][0] + theta[1]*X[i][1]']],
  [['        total += ('], ['h', 'h'], [' - '], ['y[i]', 'y'], [') * '], ['X[i][j]', 'x']],
  [['    new_theta[j] '], ['=', 'assign'], [' '], ['theta[j]', 'theta'], [' - '], ['alpha', 'alpha'], [' * total '], ['/ m', 'm']],
  [['theta '], ['=', 'assign'], [' new_theta'], ['   # all θ_j at once']],
]
const NUMPY: Seg[][] = [
  [['errors = '], ['X @ theta', 'h'], [' - '], ['y', 'y']],
  [['theta '], ['=', 'assign'], [' '], ['theta', 'theta'], [' - '], ['alpha', 'alpha'], [' * '], ['X.T @ errors', 'sum'], [' '], ['/ m', 'm']],
]

// ---------- the actual computation, done two ways ----------
const X = [
  [2, 2],
  [2, 4],
  [2, 6],
]
const Y = [2, 4, 6]
const ALPHA = 0.01
const MM = 3
const NN = 2
const STEPS = 1000

function loopStep(theta: number[]) {
  const next = [0, 0]
  for (let j = 0; j < NN; j++) {
    let total = 0
    for (let i = 0; i < MM; i++) {
      const h = theta[0] * X[i][0] + theta[1] * X[i][1]
      total += (h - Y[i]) * X[i][j]
    }
    next[j] = theta[j] - (ALPHA * total) / MM
  }
  return next
}
const matVec = (A: number[][], v: number[]) => A.map((row) => row.reduce((s, a, k) => s + a * v[k], 0))
const transpose = (A: number[][]) => A[0].map((_, c) => A.map((row) => row[c]))
function vecStep(theta: number[]) {
  const errors = matVec(X, theta).map((p, i) => p - Y[i])
  const grad = matVec(transpose(X), errors)
  return theta.map((t, j) => t - (ALPHA * grad[j]) / MM)
}

const f4 = (v: number) => (Math.abs(v) < 5e-5 ? '0.0000' : v.toFixed(4))

const codeBox: CSSProperties = {
  margin: 0,
  padding: '0.6rem 0.75rem',
  borderRadius: 10,
  border: '1px solid var(--rule)',
  background: 'var(--surface-2)',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.82rem',
  lineHeight: 1.65,
  overflowX: 'auto',
  whiteSpace: 'pre',
  color: 'var(--ink)',
  width: '100%',
}

export default function FormulaToCode() {
  const [stage, setStage] = useState<Stage>('symbols')
  const [hover, setHover] = useState<Key | null>(null)
  const [t, setT] = useState(STEPS)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)

  const history = useMemo(() => {
    const loop = [[0, 0]]
    const vec = [[0, 0]]
    for (let k = 0; k < STEPS; k++) {
      loop.push(loopStep(loop[k]))
      vec.push(vecStep(vec[k]))
    }
    return { loop, vec }
  }, [])

  const thL = history.loop[t]
  const thV = history.vec[t]
  const agree = Math.abs(thL[0] - thV[0]) < 1e-12 && Math.abs(thL[1] - thV[1]) < 1e-12
  const preds = matVec(X, thV)

  const bind = (k: Key) => ({
    onMouseEnter: () => setHover(k),
    onMouseLeave: () => setHover((h) => (h === k ? null : h)),
    onFocus: () => setHover(k),
    onBlur: () => setHover((h) => (h === k ? null : h)),
    onClick: () => setHover(k),
  })
  const mark = (k: Key, children: ReactNode, big = false) => {
    const on = hover === k
    return (
      <button
        type="button"
        {...bind(k)}
        aria-label={`${SYM[k].tex}: ${SYM[k].words}`}
        style={{
          font: 'inherit',
          fontSize: big ? '1.15rem' : 'inherit',
          color: SYM[k].colour,
          fontWeight: 700,
          background: on ? 'color-mix(in srgb, var(--highlight) 45%, var(--surface))' : 'transparent',
          border: `1.5px solid ${on ? 'var(--highlight)' : 'transparent'}`,
          borderBottom: `2px solid ${on ? 'var(--highlight)' : `color-mix(in srgb, ${SYM[k].colour} 55%, transparent)`}`,
          borderRadius: 5,
          padding: big ? '0.05rem 0.2rem' : '0 0.05rem',
          cursor: 'pointer',
          whiteSpace: 'pre',
        }}
      >
        {children}
      </button>
    )
  }
  const renderCode = (code: Seg[][]) => (
    <pre style={codeBox}>
      {code.map((line, li) => (
        <div key={li}>
          {line.map(([text, k], si) =>
            k ? (
              <span key={si}>{mark(k, text)}</span>
            ) : (
              <span key={si} style={{ color: text.trim().startsWith('#') ? 'var(--ink-3)' : undefined, fontStyle: text.trim().startsWith('#') ? 'italic' : undefined }}>
                {text}
              </span>
            ),
          )}
        </div>
      ))}
    </pre>
  )

  // θ path for the little chart (sampled)
  const sample = (arr: number[][], idx: number) => {
    const pts: [number, number][] = []
    const stride = Math.max(1, Math.floor(t / 250))
    for (let k = 0; k <= t; k += stride) pts.push([k, arr[k][idx]])
    pts.push([t, arr[t][idx]])
    return pts
  }

  return (
    <Figure
      title="From formula to code: the 2025 Final's update rule"
      caption={
        <>
          Hover over (or tap) any coloured symbol: the same idea lights up in the formula, the table and the code. Step through{' '}
          <strong>Symbols → Loops → NumPy</strong>. The run below shows all 1,000 updates; press <strong>Reset to 0</strong>, then{' '}
          <strong>Run 1 update</strong> and compare with the hand calculation in the next box. The loop version and the NumPy version are both
          really computed here and agree to every digit, ending at <M>{'\\theta \\approx [0.0030,\\ 0.9987]'}</M>.
        </>
      }
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.15rem 0.25rem' }}>
        {FORMULA.map((p, i) =>
          p in SYM ? (
            <span key={i}>{mark(p as Key, <M>{SYM[p as Key].tex}</M>, true)}</span>
          ) : (
            <span key={i} style={{ fontSize: '1.15rem' }}>
              <M>{p}</M>
            </span>
          ),
        )}
      </div>
      <div style={{ fontSize: '0.95rem', color: 'var(--ink-2)' }}>
        where <M>{'h_\\theta(x^{(i)}) = \\theta_0 x_0^{(i)} + \\theta_1 x_1^{(i)}'}</M>
      </div>

      <Controls>
        <Segmented
          label="Translate"
          value={stage}
          onChange={setStage}
          options={[
            { value: 'symbols', label: '1 · Symbols' },
            { value: 'loops', label: '2 · Loops' },
            { value: 'numpy', label: '3 · NumPy' },
          ]}
        />
      </Controls>

      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.75rem' }}>
        {stage === 'symbols' && (
          <>
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.88rem' }}>
                <thead>
                  <tr>
                    {(narrow ? ['Symbol', 'Meaning and Python'] : ['Symbol', 'In words', 'Python', 'Here']).map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.3rem 0.4rem', borderBottom: '1.5px solid var(--ink-3)', color: 'var(--ink-2)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ORDER.map((k) => (
                    <tr key={k} style={{ background: hover === k ? 'color-mix(in srgb, var(--highlight) 30%, var(--surface))' : undefined }}>
                      <td style={{ padding: '0.3rem 0.4rem', borderBottom: '1px solid var(--rule)' }}>{mark(k, <M>{SYM[k].tex}</M>)}</td>
                      <td style={{ padding: '0.3rem 0.4rem', borderBottom: '1px solid var(--rule)' }}>
                        {SYM[k].words}
                        {narrow && (
                          <div style={{ fontSize: '0.8rem', marginTop: '0.15rem' }}>
                            <code>{SYM[k].py}</code>
                            <span style={{ color: 'var(--ink-3)' }}> · {SYM[k].value}</span>
                          </div>
                        )}
                      </td>
                      {!narrow && <td style={{ padding: '0.3rem 0.4rem', borderBottom: '1px solid var(--rule)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{SYM[k].py}</td>}
                      {!narrow && <td style={{ padding: '0.3rem 0.4rem', borderBottom: '1px solid var(--rule)', color: 'var(--ink-2)' }}>{SYM[k].value}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', justifyContent: 'center', alignItems: 'center' }}>
              <MatrixGrid data={X} label={<>X (3 × 2): row i is example x⁽ⁱ⁾, column j is feature j</>} cols={hover === 'x' ? [0, 1] : []} cellSize={38} />
              <MatrixGrid data={Y.map((v) => [v])} label="y (3 values)" rows={hover === 'y' ? [0, 1, 2] : []} cellSize={38} />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ink-2)', textAlign: 'center' }}>
              Every row is (2, x) with y = x, so the perfect answer is θ = [0, 1]. Column 0 of X is the 2025 task's "intercept" column (it holds 2s, not the usual 1s).
            </div>
          </>
        )}
        {stage === 'loops' && (
          <>
            {renderCode(LOOP)}
            <div style={{ fontSize: '0.88rem', color: 'var(--ink-2)' }}>
              One update, written exactly like the maths: an outer loop over <M>{'j'}</M> (each parameter), an inner loop for the{' '}
              <M>{'\\Sigma'}</M> over examples <M>{'i'}</M>. The new values go into <code>new_theta</code> first, so every{' '}
              <M>{'\\theta_j'}</M> is computed from the <em>old</em> <M>{'\\theta'}</M>.
            </div>
          </>
        )}
        {stage === 'numpy' && (
          <>
            {renderCode(NUMPY)}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-2)', justifyContent: 'center' }}>
              <span>X (3, 2)</span>
              <span>theta (2,)</span>
              <span>X @ theta (3,)</span>
              <span>errors (3,)</span>
              <span>X.T (2, 3)</span>
              <span>X.T @ errors (2,)</span>
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--ink-2)' }}>
              <code>@</code> multiplies matching entries and adds them up, which is a <M>{'\\Sigma'}</M> built in: <code>(X @ theta)[i]</code> is{' '}
              <M>{'\\sum_j x_j^{(i)}\\theta_j = h_\\theta(x^{(i)})'}</M>, and <code>(X.T @ errors)[j]</code> is{' '}
              <M>{'\\sum_i (h_\\theta(x^{(i)}) - y^{(i)})\\, x_j^{(i)}'}</M>, for every <M>{'j'}</M> at once. Two lines replace both loops.
            </div>
          </>
        )}
      </div>

      <div style={{ width: '100%', borderTop: '1px dashed var(--rule)', paddingTop: '0.75rem', display: 'grid', gap: '0.6rem', justifyItems: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
          <Button onClick={() => setT(0)} disabled={t === 0}>
            Reset to 0
          </Button>
          <Button primary onClick={() => setT(Math.min(STEPS, t + 1))} disabled={t >= STEPS}>
            Run 1 update
          </Button>
          <Button onClick={() => setT(Math.min(STEPS, t + 10))} disabled={t >= STEPS}>
            +10
          </Button>
          <Button onClick={() => setT(STEPS)} disabled={t >= STEPS}>
            Run to 1,000
          </Button>
        </div>
        <Readout
          items={[
            ['updates', String(t)],
            ['loop θ', `[${f4(thL[0])}, ${f4(thL[1])}]`],
            ['NumPy θ', `[${f4(thV[0])}, ${f4(thV[1])}]`],
            ['predictions Xθ', `[${preds.map((p) => p.toFixed(3)).join(', ')}]`],
            ['targets y', '[2, 4, 6]'],
          ]}
        />
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: agree ? 'var(--viz-pos)' : 'var(--viz-neg)' }}>
          {agree ? 'The loop and NumPy versions agree exactly' : 'Mismatch!'}
          {t === STEPS ? ': θ rounds to [0.003, 0.9987], the official 2025 answer.' : '.'}
        </div>
        <Plot x={[0, STEPS]} y={[-0.05, 1.08]} width={520} height={170} minHeight={160} margin={{ left: 40, right: 16 }} ariaLabel={`θ₀ and θ₁ after ${t} updates: ${f4(thV[0])} and ${f4(thV[1])}`}>
          <Grid xTicks={5} yTicks={4} />
          <Axes xTicks={5} yTicks={4} xLabel="updates" tickFormat={(v) => String(Math.round(v * 100) / 100)} />
          {t > 0 && <Path points={sample(history.vec, 0)} color="var(--viz-1)" width={2.5} />}
          {t > 0 && <Path points={sample(history.vec, 1)} color="var(--viz-2)" width={2.5} />}
          <Dots
            points={[
              { x: t, y: thV[0], color: 'var(--viz-1)' },
              { x: t, y: thV[1], color: 'var(--viz-2)' },
            ]}
          />
          <Label x={t} y={thV[1]} dx={t > 700 ? -8 : 8} dy={-8} anchor={t > 700 ? 'end' : 'start'} color="var(--viz-2)">
            {`θ₁ = ${f4(thV[1])}`}
          </Label>
          <Label x={t} y={thV[0]} dx={t > 700 ? -8 : 8} dy={t > 700 ? -8 : 16} anchor={t > 700 ? 'end' : 'start'} color="var(--viz-1)">
            {`θ₀ = ${f4(thV[0])}`}
          </Label>
        </Plot>
      </div>
    </Figure>
  )
}
