import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Bars, M } from '../../../../../kit'

/*
  What PolynomialFeatures actually builds. The learner picks the number of input features n and
  the degree d, and can switch on interaction_only / include_bias. Every generated column is shown
  as a chip (in scikit-learn's order) with its value for one example row, and the column count is
  worked out with the formula. A bar chart shows how fast the count explodes as n grows.
*/

const SUB = ['₁', '₂', '₃', '₄', '₅']
const SUP: Record<number, string> = { 2: '²', 3: '³', 4: '⁴' }
const EXAMPLE = [2, 3, 1, -1, 2]
const DEG_COL = ['var(--viz-muted)', 'var(--viz-1)', 'var(--viz-3)', 'var(--viz-2)', 'var(--viz-4)']
const MAX_CHIPS = 60

function comb(n: number, k: number) {
  if (k < 0 || k > n) return 0
  let r = 1
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i
  return Math.round(r)
}

/** combinations (with or without replacement) of feature indices, in scikit-learn's order */
function combos(n: number, k: number, repeat: boolean): number[][] {
  const out: number[][] = []
  const rec = (start: number, cur: number[]) => {
    if (cur.length === k) {
      out.push(cur.slice())
      return
    }
    for (let i = start; i < n; i++) {
      cur.push(i)
      rec(repeat ? i : i + 1, cur)
      cur.pop()
    }
  }
  rec(0, [])
  return out
}

function termName(c: number[]) {
  if (c.length === 0) return '1'
  const counts = new Map<number, number>()
  c.forEach((i) => counts.set(i, (counts.get(i) ?? 0) + 1))
  return [...counts.entries()].map(([i, p]) => `x${SUB[i]}${p > 1 ? SUP[p] : ''}`).join('')
}

const count = (n: number, d: number, interOnly: boolean, bias: boolean) => {
  let total = 0
  for (let k = bias ? 0 : 1; k <= d; k++) total += interOnly ? comb(n, k) : comb(n + k - 1, k)
  return total
}

const chip = (deg: number): CSSProperties => ({
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: 44,
  padding: '3px 7px',
  borderRadius: 8,
  border: `1.5px solid ${DEG_COL[deg]}`,
  background: `color-mix(in srgb, ${DEG_COL[deg]} 12%, var(--surface))`,
  fontSize: '0.9rem',
  lineHeight: 1.25,
  color: 'var(--ink)',
})
const valStyle: CSSProperties = { fontSize: '0.75rem', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }

export default function PolynomialExpander() {
  const [n, setN] = useState(2)
  const [d, setD] = useState(2)
  const [interOnly, setInterOnly] = useState(false)
  const [bias, setBias] = useState(true)

  const terms: number[][] = []
  for (let k = bias ? 0 : 1; k <= d; k++) terms.push(...combos(n, k, !interOnly))
  const total = terms.length
  const shown = terms.slice(0, MAX_CHIPS)
  const value = (c: number[]) => c.reduce((p, i) => p * EXAMPLE[i], 1)

  const formula = interOnly
    ? `\\sum_{k=${bias ? 0 : 1}}^{${d}} \\binom{${n}}{k} = ${total}`
    : bias
      ? `\\binom{n+d}{d} = \\binom{${n + d}}{${d}} = ${total}`
      : `\\binom{n+d}{d} - 1 = \\binom{${n + d}}{${d}} - 1 = ${total}`

  const growth = [2, 5, 10, 20, 50, 100].map((m) => ({
    label: `n = ${m}`,
    value: count(m, d, interOnly, bias),
    color: m === n ? 'var(--viz-2)' : 'var(--viz-1)',
  }))

  return (
    <Figure
      title="What PolynomialFeatures builds"
      caption={
        <>
          Each chip is one new column, listed in the order scikit-learn uses, with its value for the example row{' '}
          <M>{`x = [${EXAMPLE.slice(0, n).join(', ')}]`}</M>. Squares such as <M>{'x_1^2'}</M> let a model bend; products such as <M>{'x_1x_2'}</M>{' '}
          (interaction features) let the effect of one feature depend on another. Raise the degree or the number of features and watch the column
          count explode: with 100 features, degree 2 already gives over 5,000 columns.
        </>
      }
    >
      <Controls>
        <Slider label="input features n" value={n} min={1} max={5} onChange={setN} />
        <Slider label="degree d" value={d} min={1} max={4} onChange={setD} />
      </Controls>
      <Controls>
        <Toggle label="interaction_only (no powers like x²)" checked={interOnly} onChange={setInterOnly} />
        <Toggle label="include_bias (the column of 1s)" checked={bias} onChange={setBias} />
      </Controls>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', width: '100%' }} aria-label={`${total} generated columns`}>
        {shown.map((c, i) => (
          <span key={i} style={chip(c.length)}>
            <span>{termName(c)}</span>
            <span style={valStyle}>{value(c)}</span>
          </span>
        ))}
        {total > MAX_CHIPS && <span style={{ ...chip(0), justifyContent: 'center' }}>+{total - MAX_CHIPS} more</span>}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 1rem', fontSize: '0.8rem', color: 'var(--ink-2)', justifyContent: 'center' }}>
        {[0, 1, 2, 3, 4]
          .filter((k) => k <= d && (bias || k > 0))
          .map((k) => (
            <span key={k}>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: DEG_COL[k], marginRight: 5 }} />
              degree {k}
            </span>
          ))}
      </div>
      <div style={{ fontSize: '1rem' }}>
        <M>{`\\text{columns} = ${formula}`}</M>
      </div>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center', marginBottom: 4 }}>
          Columns produced at degree {d} for more input features
        </div>
        <Bars data={growth} format={(v) => v.toLocaleString('en-GB')} ariaLabel={`Number of polynomial columns at degree ${d} for 2 to 100 input features`} />
      </div>
      <Readout
        items={[
          ['inputs', String(n)],
          ['outputs', String(total)],
          ['growth', `×${(total / n).toFixed(1)}`],
        ]}
      />
    </Figure>
  )
}
