import { useEffect, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Segmented, Button, usePlayer, PlayerControls, CodeBlock, useNarrow, M } from '../../../../../kit'

/*
  Σ is a for-loop. One expression, three versions that always agree:
    maths (expanded term by term), a plain Python loop with a running total, and a NumPy one-liner.
  Step through the terms; edit the numbers; switch the expression (Σxᵢ, Σxᵢ², MSE, Πxᵢ).
  It opens on Σxᵢ for x = [3, 1, 5, 2], the lesson's own example (total 11).
*/

type Mode = 'sum' | 'sq' | 'mse' | 'prod'

const MODES: { value: Mode; label: string }[] = [
  { value: 'sum', label: 'Σ xᵢ' },
  { value: 'sq', label: 'Σ xᵢ²' },
  { value: 'mse', label: 'MSE' },
  { value: 'prod', label: 'Π xᵢ' },
]

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 1000) / 1000))
const paren = (v: number) => (v < 0 ? `(${v})` : String(v))

const chip: CSSProperties = {
  display: 'inline-grid',
  justifyItems: 'center',
  gap: '0.1rem',
  padding: '0.3rem 0.45rem',
  borderRadius: 8,
  border: '1.5px solid var(--rule)',
  background: 'var(--surface-2)',
  minWidth: '3.2rem',
  transition: 'background 0.2s, border-color 0.2s',
}
const inputStyle: CSSProperties = {
  width: '3.1rem',
  font: 'inherit',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.95rem',
  textAlign: 'center',
  padding: '0.25rem 0.2rem',
  borderRadius: 6,
  border: '1.5px solid var(--rule)',
  background: 'var(--surface)',
  color: 'var(--ink)',
}
const label: CSSProperties = { fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }

/**
 * A whole-number box from −9 to 9. It keeps what the learner types as a draft string, so a lone
 * "-" (on the way to "-3") or an empty box is allowed while typing; only a real number is committed.
 */
function NumInput({ value, onCommit, ariaLabel, style }: { value: number; onCommit: (v: number) => void; ariaLabel: string; style: CSSProperties }) {
  const [draft, setDraft] = useState(String(value))
  // follow outside changes (another term added, a reset) without fighting the learner's typing
  useEffect(() => {
    setDraft((d) => (d.trim() !== '' && Number(d) === value ? d : String(value)))
  }, [value])
  return (
    <input
      type="number"
      min={-9}
      max={9}
      step={1}
      value={draft}
      aria-label={ariaLabel}
      onChange={(e) => {
        const t = e.target.value
        setDraft(t)
        const v = Number(t)
        if (t.trim() !== '' && Number.isFinite(v)) onCommit(Math.max(-9, Math.min(9, Math.round(v))))
      }}
      onBlur={() => setDraft(String(value))}
      style={style}
    />
  )
}

export default function SigmaLoopStepper() {
  const [mode, setMode] = useState<Mode>('sum')
  const [x, setX] = useState<number[]>([3, 1, 5, 2])
  const [y, setY] = useState<number[]>([3, 5, 2, 6])
  const [yh, setYh] = useState<number[]>([2, 5, 4, 5])
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)

  const n = mode === 'mse' ? y.length : x.length
  const player = usePlayer({ steps: n + 2, interval: 1000 })
  // complete at rest: jump to the finished state whenever the setup changes
  useEffect(() => {
    player.setStep(n + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, n])
  const step = Math.min(player.step, n + 1)

  const isProd = mode === 'prod'
  const terms = Array.from({ length: n }, (_, k) => {
    if (mode === 'mse') return (y[k] - yh[k]) ** 2
    if (mode === 'sq') return x[k] ** 2
    return x[k]
  })
  const init = isProd ? 1 : 0
  const running = (s: number) => terms.slice(0, s).reduce((acc, t) => (isProd ? acc * t : acc + t), init)
  const total = running(Math.min(step, n))
  const final = mode === 'mse' ? running(n) / n : running(n)
  const accName = isProd ? 'product' : 'total'

  // ----- maths -----
  const head =
    mode === 'sum'
      ? `\\displaystyle\\sum_{i=1}^{${n}} x_i`
      : mode === 'sq'
        ? `\\displaystyle\\sum_{i=1}^{${n}} x_i^2`
        : mode === 'mse'
          ? `\\displaystyle\\text{MSE} = \\frac{1}{${n}} \\sum_{i=1}^{${n}} (y_i - \\hat{y}_i)^2`
          : `\\displaystyle\\prod_{i=1}^{${n}} x_i`
  const symTerm = (k: number) => (mode === 'sum' || mode === 'prod' ? `x_{${k + 1}}` : mode === 'sq' ? `x_{${k + 1}}^2` : `(y_{${k + 1}} - \\hat{y}_{${k + 1}})^2`)
  const numTerm = (k: number) => (mode === 'sum' || mode === 'prod' ? `${x[k]}` : mode === 'sq' ? `${paren(x[k])}^2` : `(${y[k]} - ${paren(yh[k])})^2`)

  // ----- code -----
  const list = (v: number[]) => `[${v.join(', ')}]`
  let lines: string[]
  if (mode === 'mse')
    lines = [`y     = ${list(y)}`, `y_hat = ${list(yh)}`, 'total = 0', 'for i in range(len(y)):', '    total = total + (y[i] - y_hat[i]) ** 2', 'print(total / len(y))']
  else
    lines = [
      `x = ${list(x)}`,
      `${accName} = ${init}`,
      'for i in range(len(x)):',
      mode === 'sum' ? '    total = total + x[i]' : mode === 'sq' ? '    total = total + x[i] ** 2' : '    product = product * x[i]',
      `print(${accName})`,
    ]
  const initLine = mode === 'mse' ? 3 : 2
  const bodyLine = mode === 'mse' ? 5 : 4
  const printLine = mode === 'mse' ? 6 : 5
  const hl = step === 0 ? [initLine] : step <= n ? [bodyLine - 1, bodyLine] : [printLine]
  const numpy =
    mode === 'sum' ? 'np.sum(x)' : mode === 'sq' ? 'np.sum(x ** 2)' : mode === 'mse' ? 'np.mean((y - y_hat) ** 2)' : 'np.prod(x)'

  // ----- editing -----
  const edit = (arr: readonly number[], set: (v: number[]) => void, k: number, num: number) => set(arr.map((a, i) => (i === k ? num : a)))
  const addTerm = () => {
    if (n >= 6) return
    setX([...x, ((x.length * 3 + 2) % 7) + 1])
    setY([...y, (y.length * 2 + 1) % 8])
    setYh([...yh, (yh.length * 2 + 3) % 8])
  }
  const removeTerm = () => {
    if (n <= 2) return
    setX(x.slice(0, -1))
    setY(y.slice(0, -1))
    setYh(yh.slice(0, -1))
  }

  const watch: [string, string][] =
    step === 0
      ? [[accName, String(init)]]
      : step <= n
        ? [
            ['maths i', String(step)],
            ['Python i', String(step - 1)],
            ['term', fmt(terms[step - 1])],
            [accName, fmt(total)],
          ]
        : [
            [accName, fmt(running(n))],
            ['printed', fmt(final)],
          ]

  const stepLabel = (s: number) => (s === 0 ? `start: ${accName} = ${init}` : s <= n ? `term ${s} of ${n}` : 'done: print the answer')

  return (
    <Figure
      title="Σ is a for-loop with a running total"
      caption={
        <>
          Press <strong>Restart</strong> then <strong>Next</strong> to add one term at a time: the highlighted term in the maths, the highlighted lines
          of the loop and the running total all move together. Change the numbers or the expression and check that the maths, the loop and the
          NumPy one-liner always agree (try a negative number such as −3 in <M>{'\\sum x_i^2'}</M>). Notice two details: Python counts from 0 while maths counts
          from 1, and a product (Π) must start at 1, not 0. The MSE option is explained in the next section.
        </>
      }
    >
      <Controls>
        <Segmented label="Expression" value={mode} onChange={setMode} options={MODES} />
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <Button onClick={removeTerm} disabled={n <= 2}>
            − term
          </Button>
          <Button onClick={addTerm} disabled={n >= 6}>
            + term
          </Button>
        </div>
      </Controls>

      <div style={{ fontSize: '1.25rem' }}>
        <M>{head}</M>
      </div>

      {/* expanded terms */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }} aria-label="The expression written out term by term">
        {mode === 'mse' && <M>{`\\tfrac{1}{${n}}\\Big(`}</M>}
        {terms.map((t, k) => {
          const done = step > k + 1 || step === n + 1
          const cur = step === k + 1
          const bg = cur ? 'color-mix(in srgb, var(--highlight) 55%, var(--surface))' : done ? 'color-mix(in srgb, var(--viz-1) 12%, var(--surface))' : 'var(--surface-2)'
          const bd = cur ? 'var(--highlight)' : done ? 'color-mix(in srgb, var(--viz-1) 45%, var(--surface))' : 'var(--rule)'
          return (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              {k > 0 && <span style={{ fontWeight: 700, color: 'var(--ink-2)' }}>{isProd ? '×' : '+'}</span>}
              <span style={{ ...chip, background: bg, borderColor: bd }}>
                <span style={{ fontSize: '0.95rem' }}>
                  <M>{symTerm(k)}</M>
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--ink-2)' }}>
                  <M>{numTerm(k)}</M>
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem' }}>{fmt(t)}</span>
              </span>
            </span>
          )
        })}
        {mode === 'mse' && <M>{'\\Big)'}</M>}
      </div>
      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ink-2)', textAlign: 'center' }}>
        {step === 0
          ? `Before the loop: ${accName} = ${init}`
          : step <= n
            ? `Running ${accName} after term ${step}: ${terms
                .slice(0, step)
                .map((t, i) => (i === 0 || t >= 0 ? fmt(t) : `(${fmt(t)})`))
                .join(isProd ? ' × ' : ' + ')} = ${fmt(total)}`
            : mode === 'mse'
              ? `All ${n} terms: total = ${fmt(running(n))}, divided by ${n} gives ${fmt(final)}`
              : `All ${n} terms: ${fmt(final)}`}
      </div>

      {/* data */}
      <div style={{ display: 'grid', gap: '0.35rem', justifyItems: 'center' }}>
        {(mode === 'mse'
          ? ([
              ['y', y, setY],
              ['ŷ', yh, setYh],
            ] as const)
          : ([['x', x, setX]] as const)
        ).map(([name, arr, set]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ width: '1.4rem', fontWeight: 700, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>{name}</span>
            {arr.map((v, k) => (
              <NumInput
                key={k}
                value={v}
                ariaLabel={`${name} number ${k + 1}`}
                onCommit={(num) => edit(arr, set as (v: number[]) => void, k, num)}
                style={{ ...inputStyle, borderColor: step === k + 1 ? 'var(--highlight)' : 'var(--rule)' }}
              />
            ))}
          </div>
        ))}
      </div>

      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1.35fr) minmax(0, 1fr)', gap: '0.75rem', alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={label}>Python loop</div>
          <CodeBlock code={lines.join('\n')} language="python" title="loop" highlight={hl} showLineNumbers />
        </div>
        <div style={{ display: 'grid', gap: '0.6rem', minWidth: 0 }}>
          <div>
            <div style={label}>Variables now</div>
            <Readout items={watch} />
          </div>
          <div>
            <div style={label}>NumPy one-liner</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.6, background: 'var(--surface-2)', border: '1px solid var(--rule)', borderRadius: 8, padding: '0.45rem 0.6rem', overflowX: 'auto', whiteSpace: 'pre' }}>
              {mode === 'mse' ? `y = np.array(${list(y)})\ny_hat = np.array(${list(yh)})\n` : `x = np.array(${list(x)})\n`}
              {numpy}
              <span style={{ color: 'var(--ink-3)' }}>{'   # '}</span>
              <strong>{fmt(final)}</strong>
            </div>
            <div style={{ marginTop: '0.35rem', fontSize: '0.85rem', fontWeight: 700, color: step === n + 1 ? 'var(--viz-pos)' : 'var(--ink-3)' }}>
              {step === n + 1 ? `Maths, loop and NumPy all give ${fmt(final)}` : `The loop has not finished yet (${n + 1 - step} step${n + 1 - step === 1 ? '' : 's'} to go)`}
            </div>
          </div>
        </div>
      </div>
      <PlayerControls player={player} label={stepLabel} />
    </Figure>
  )
}
