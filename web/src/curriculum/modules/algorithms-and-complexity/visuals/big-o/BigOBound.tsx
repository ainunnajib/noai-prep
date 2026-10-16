import { useState } from 'react'
import { Figure, Controls, Segmented, Readout, Plot, Grid, Axes, FnPath, VLine, Rect, M } from '../../../../../kit'
import { comma } from './format'
import s from './algo.module.css'

/*
  The formal definition, drawn. f(n) = 3n² + 50n + 200 against c·n² for a chosen c. For c > 3 the two
  curves cross once, at n₀ = (50 + √(2500 + 800(c − 3))) / (2(c − 3)); from there on c·n² stays on top,
  which is exactly "f(n) ≤ c·g(n) for every n ≥ n₀". A smaller c needs a later n₀; c = 3 never works.
*/

const f = (n: number) => 3 * n * n + 50 * n + 200
const CS = [3, 3.5, 4, 6, 20, 253] as const

/** smallest whole n ≥ 1 from which c·n² ≥ f(n) holds for good, or null if no such n exists */
function n0(c: number): number | null {
  if (c <= 3) return null
  const root = (50 + Math.sqrt(2500 + 800 * (c - 3))) / (2 * (c - 3))
  return Math.max(1, Math.ceil(root - 1e-9))
}

const short = (v: number) => (v >= 1e6 ? `${+(v / 1e6).toFixed(1)}M` : v >= 1e4 ? `${+(v / 1e3).toFixed(0)}k` : comma(v))

export default function BigOBound() {
  const [c, setC] = useState<number>(4)
  const start = n0(c)
  const xMax = start ? Math.min(400, Math.max(12, Math.ceil(start * 1.8))) : 150
  const yMax = Math.max(f(xMax), c * xMax * xMax) * 1.05

  return (
    <Figure
      title="Finding c and n₀"
      caption={
        <>
          Blue is the exact cost <M>{'f(n) = 3n^2 + 50n + 200'}</M>; orange is the bound <M>{'c \\cdot n^2'}</M>. Pick <M>c</M>: the dashed
          line marks <M>n_0</M>, the first size from which orange stays above blue for good. The shaded part on the left is where the bound may
          fail, and the definition lets us ignore it. A tight <M>c</M> such as 4 needs <M>n_0 = 54</M>; the loose <M>c = 253</M> works
          from <M>n_0 = 1</M>; <M>c = 3</M> never works, because <M>3n^2</M> is always 50<M>n</M> + 200 short.
        </>
      }
    >
      <div className={s.wrap}>
        <Segmented label="Constant c" value={c} onChange={setC} options={CS.map((v) => ({ value: v, label: `c = ${v}` }))} />
        <Plot
          x={[0, xMax]}
          y={[0, yMax]}
          minHeight={240}
          margin={{ left: 54 }}
          ariaLabel={
            start
              ? `f(n) and ${c} n squared for n from 0 to ${xMax}: the bound holds from n0 = ${start} onwards`
              : `f(n) and 3 n squared: the bound never holds`
          }
        >
          <Grid />
          {start && start > 1 && <Rect x0={0} x1={start} y0={0} y1={yMax} fill="var(--viz-muted)" opacity={0.14} />}
          <Axes xLabel="input size n" yLabel="steps" tickFormat={short} />
          <FnPath f={f} color="var(--viz-1)" />
          <FnPath f={(n) => c * n * n} color="var(--viz-2)" />
          {start && <VLine x={start} color="var(--ink-2)" label={`n₀ = ${start}`} />}
        </Plot>
        <div className={s.verdict} aria-live="polite">
          {start ? (
            <>
              With <M>{`c = ${c}`}</M>: <M>{`${c}n^2 \\ge 3n^2 + 50n + 200`}</M> for every <M>{`n \\ge ${start}`}</M>. So <M>{`n_0 = ${start}`}</M> works, and{' '}
              <M>{'f(n) = O(n^2)'}</M>.
            </>
          ) : (
            <>
              With <M>c = 3</M> the bound never holds: <M>3n^2</M> is below <M>f(n)</M> by <M>50n + 200</M> at every size. Any <M>c</M> above 3
              works, once <M>n</M> is large enough.
            </>
          )}
        </div>
        <Controls>
          <Readout
            items={[
              ['c', String(c)],
              ['n₀', start ? comma(start) : 'none'],
              [<>f(n₀)</>, start ? comma(f(start)) : '–'],
              [<>c·n₀²</>, start ? comma(c * start * start) : '–'],
            ]}
          />
        </Controls>
      </div>
    </Figure>
  )
}
