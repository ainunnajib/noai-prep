import { useMemo, useState, type ReactNode } from 'react'
import { Figure, useNarrow } from '../../../../../kit'
import { Notebook, NbCell, CodeLines, Note } from '../exam-notebook-skills/nb'
import { npArrayRepr, npArray2DRepr } from '../exam-notebook-skills/pyfmt'
import { runMistake, runGD, ALPHA, ITERS, type MistakeId } from './gd'
import { ThetaPlane } from './ThetaPlane'

/*
  Concept: common mistakes.
  The correct solution, plus switches that each inject one classic mistake. The output is the
  real result of running that version (simulated line for line), and where θ still lives in the
  (θ0, θ1) plane its path is drawn against the correct one.
*/

const BASE = [
  'def linear_regression_gradient_descent(X, y, alpha, iterations):',
  '    m, n = X.shape',
  '    theta = np.zeros(n)',
  '    for _ in range(iterations):',
  '        errors = X @ theta - y',
  '        gradient = X.T @ errors / m',
  '        theta = theta - alpha * gradient',
  '    return np.round(theta, 4)',
]

interface Variant {
  id: MistakeId
  label: string
  /** replace line i with these lines (marked as changed) */
  edits: Record<number, string[]>
  signature: ReactNode
}

const VARIANTS: Variant[] = [
  {
    id: 'sequential',
    label: 'one θ at a time',
    edits: {
      4: ['        for j in range(n):', '            errors = X @ theta - y   # sees the new θ0'],
      5: [],
      6: ['            theta[j] -= alpha * (errors @ X[:, j]) / m'],
    },
    signature: (
      <>
        <strong>Signature: the last digit is off</strong> (0.0027, 0.9988). θ₁'s gradient was computed with the θ₀ that had just moved, so the two updates did not use the
        same old θ.
      </>
    ),
  },
  {
    id: 'sum',
    label: 'sum, not mean',
    edits: { 5: ['        gradient = X.T @ errors        # forgot / m'] },
    signature: (
      <>
        <strong>Signature: suspiciously perfect</strong> (0, 1). Without <code>/ m</code> every step is m = 3 times bigger, like using α = 0.03, so the walk finishes early.
        With more data or a larger α the same bug makes it diverge.
      </>
    ),
  },
  {
    id: 'shape',
    label: 'θ as a (2, 1) column',
    edits: { 2: ['    theta = np.zeros((n, 1))'] },
    signature: (
      <>
        <strong>Signature: a 2 × 3 table and no error.</strong> <code>X @ theta</code> is (3, 1); subtracting <code>y</code> of shape (3,) broadcasts to (3, 3), and θ silently
        becomes (2, 3). With <code>theta -= …</code> instead it crashes with "non-broadcastable output operand". Keep everything 1-D, or reshape <code>y</code> to (3, 1).
      </>
    ),
  },
  {
    id: 'noreturn',
    label: 'no return',
    edits: { 7: ['    np.round(theta, 4)'] },
    signature: (
      <>
        <strong>Signature: no output at all.</strong> The value is computed and thrown away; the function returns <code>None</code>, which Jupyter does not display.
      </>
    ),
  },
  {
    id: 'early',
    label: 'rounding inside the loop',
    edits: { 6: ['        theta = np.round(theta - alpha * gradient, 4)'] },
    signature: (
      <>
        <strong>Signature: wrong in the 3rd decimal</strong> (0.012, 0.9946). From iteration 705 each step is smaller than 0.00005, rounds away to nothing, and θ freezes
        before it arrives.
      </>
    ),
  },
  {
    id: 'extracol',
    label: 'extra column of 1s',
    edits: { 1: ['    X = np.c_[np.ones(len(X)), X]   # adds a bias column', '    m, n = X.shape'] },
    signature: (
      <>
        <strong>Signature: three numbers instead of two.</strong> X already had its intercept column (the 2s), so adding a column of 1s gives the model an extra coefficient.
      </>
    ),
  },
  {
    id: 'ones',
    label: 'start from ones',
    edits: { 2: ['    theta = np.ones(n)'] },
    signature: (
      <>
        <strong>Signature: plausible but different</strong> (0.0068, 0.997). After a fixed 1000 steps the answer still depends on where you started.
      </>
    ),
  },
  {
    id: 'noround',
    label: 'no rounding',
    edits: { 7: ['    return theta'] },
    signature: (
      <>
        <strong>Signature: eight decimals.</strong> The algorithm is right; the format is not. The task asked for 4 decimal places.
      </>
    ),
  },
]

function build(v: Variant | undefined): { code: string; changed: number[] } {
  const lines: string[] = []
  const changed: number[] = []
  BASE.forEach((l, i) => {
    if (v && i in v.edits) {
      for (const nl of v.edits[i]) {
        changed.push(lines.length)
        lines.push(nl)
      }
    } else lines.push(l)
  })
  return { code: lines.join('\n'), changed }
}

const correctPath = runGD(ALPHA, ITERS).thetas

export default function MistakeToggles() {
  const [on, setOn] = useState<MistakeId>('none')
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(760)
  const v = VARIANTS.find((x) => x.id === on)
  const { code, changed } = build(v)
  const res = useMemo(() => runMistake(on), [on])

  let out: string | undefined
  let kind: 'plain' | 'error' | 'ok' | 'bad' = 'plain'
  if (res.error) {
    out = res.error
    kind = 'error'
  } else if (res.none) {
    out = undefined
  } else if (res.matrix) {
    out = npArray2DRepr(res.matrix)
    kind = 'bad'
  } else if (res.returned) {
    out = npArrayRepr(res.returned)
    kind = out === 'array([0.003 , 0.9987])' ? 'ok' : 'bad'
  }

  const showPath = on !== 'none' && res.path && !['noreturn', 'noround'].includes(on)

  return (
    <Figure
      title="Switch on one mistake, read its signature"
      caption={
        <>
          Switch on one mistake at a time (tap it again to go back to the correct code). The changed lines turn red, the output is what that version really returns, and
          the plot shows its path (red) against the correct one (dashed). Notice that each mistake leaves a different fingerprint in the output.
        </>
      }
      wide
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.7rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', width: '100%' }} role="group" aria-label="Mistakes">
          {VARIANTS.map((x) => {
            const active = on === x.id
            return (
              <button
                key={x.id}
                type="button"
                aria-pressed={active}
                onClick={() => setOn(active ? 'none' : x.id)}
                style={{
                  font: 'inherit',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  borderRadius: 999,
                  padding: '0.25rem 0.7rem',
                  border: `1.5px solid ${active ? 'var(--bad)' : 'var(--rule)'}`,
                  background: active ? 'var(--bad-soft)' : 'var(--surface)',
                  color: active ? 'var(--bad)' : 'var(--ink-2)',
                }}
              >
                {active ? '● ' : '○ '}
                {x.label}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'grid', gap: '0.7rem', width: '100%', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1.25fr) minmax(0, 1fr)', alignItems: 'start' }}>
          <Notebook ariaLabel="The solution with the selected mistake">
            <NbCell prompt="In [4]:" tags={[{ text: on === 'none' ? 'correct' : 'one mistake', tone: on === 'none' ? 'answer' : 'warn' }]}>
              <CodeLines code={code} mark={(i) => (changed.includes(i) ? 'bad' : undefined)} wrap compact={narrow} />
            </NbCell>
            <NbCell prompt="In [5]:" tags={[{ text: 'DO NOT EDIT', tone: 'lock' }]} locked output={out ?? ''} outputLabel={out === undefined ? '(no Out[5]: the function returned None)' : 'Out[5]:'} outputKind={kind}>
              <CodeLines code={'linear_regression_gradient_descent(\n    X=X, y=y, alpha=alpha, iterations=iterations)'} wrap={narrow} />
            </NbCell>
          </Notebook>
          <div>
            <ThetaPlane
              ariaLabel="Path of theta for the correct code and for the selected mistake"
              height={280}
              x={[-0.45, 1.1]}
              y={[-0.1, 1.15]}
              paths={[
                { pts: correctPath, color: on === 'none' ? 'var(--viz-1)' : 'var(--viz-muted)', dash: on === 'none' ? undefined : '5 4' },
                ...(showPath ? [{ pts: res.path!, color: 'var(--viz-neg)', width: 2.4 }] : []),
              ]}
              current={showPath && res.value ? { p: res.value, color: 'var(--viz-neg)' } : { p: correctPath[ITERS], color: 'var(--viz-1)' }}
            />
            {on !== 'none' && !showPath && (
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-3)', textAlign: 'center' }}>
                {on === 'extracol' ? 'Three coefficients: this path does not fit in a 2-D picture.' : on === 'shape' ? 'θ became a 2 × 3 table: no single point to plot.' : 'Same path as the correct code: only the last line differs.'}
              </div>
            )}
          </div>
        </div>
        <Note tone={on === 'none' ? 'ok' : 'bad'} title={on === 'none' ? 'Correct:' : undefined}>
          {v ? v.signature : <>the expected <code>array([0.003 , 0.9987])</code>. Every switch above changes only one or two lines.</>}
        </Note>
      </div>
    </Figure>
  )
}
