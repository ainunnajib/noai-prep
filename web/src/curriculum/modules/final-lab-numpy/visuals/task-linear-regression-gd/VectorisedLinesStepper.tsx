import type { ReactNode } from 'react'
import { Figure, Readout, usePlayer, PlayerControls, M, useNarrow } from '../../../../../kit'
import { Mat } from './Mat'
import { Notebook, NbCell, CodeLines, Note } from '../exam-notebook-skills/nb'
import { npArrayRepr, npRound } from '../exam-notebook-skills/pyfmt'
import { X, Y, ALPHA, ITERS, runGD, transpose, matVec, sub, short, cost } from './gd'

/*
  Concept: the three vectorised lines.
  Step through the official-style solution one line at a time for the first three iterations,
  seeing every array's values and shape, then jump to the returned answer after 1000 iterations.
*/

const CODE = `def linear_regression_gradient_descent(X, y, alpha, iterations):
    m, n = X.shape                        # 3 examples, 2 coefficients
    theta = np.zeros(n)                   # start at [0. 0.]
    for _ in range(iterations):
        predictions = X @ theta           # shape (3,)
        errors = predictions - y          # shape (3,)
        gradient = X.T @ errors / m       # shape (2,)
        theta = theta - alpha * gradient  # shape (2,)
    return np.round(theta, 4)`

type Kind = 'setup' | 'pred' | 'err' | 'grad' | 'upd' | 'ret'
const CODE_NARROW = CODE.split('\n')
  .map((l) => l.replace(/\s+#.*$/, ''))
  .join('\n')

const STEPS: { kind: Kind; it: number }[] = [
  { kind: 'setup', it: 0 },
  ...[1, 2, 3].flatMap((it) => (['pred', 'err', 'grad', 'upd'] as Kind[]).map((kind) => ({ kind, it }))),
  { kind: 'ret', it: ITERS },
]
const LINE: Record<Kind, number[]> = { setup: [1, 2], pred: [3, 4], err: [5], grad: [6], upd: [7], ret: [8] }

const trace = runGD(ALPHA, ITERS)
const XT = transpose(X)
const col = (v: number[]) => v.map((x) => [x])

function Eq({ children }: { children: ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.4rem 0.6rem', width: '100%' }}>{children}</div>
}
const Op = ({ children }: { children: ReactNode }) => <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ink-2)' }}>{children}</span>

export default function VectorisedLinesStepper() {
  const player = usePlayer({ steps: STEPS.length, interval: 2600 })
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const st = STEPS[player.step]
  const it = st.kind === 'ret' ? ITERS : st.it
  const before = trace.thetas[Math.max(0, it - 1)]
  const preds = matVec(X, before)
  const errs = sub(preds, Y)
  const grad = matVec(XT, errs).map((g) => g / X.length)
  const after = trace.thetas[it]
  const fmt = (v: number) => short(v, 4)

  let panel: ReactNode = null
  let note: ReactNode = null
  if (st.kind === 'setup') {
    panel = (
      <Eq>
        <Mat data={X} label="X   shape (3, 2)" />
        <Mat data={col(Y)} label="y   shape (3,)" />
        <Mat data={col([0, 0])} label="θ   shape (2,)" format={(v) => v.toFixed(0) + '.'} />
      </Eq>
    )
    note = (
      <>
        <code>X.shape</code> is <code>(3, 2)</code>, so <M>{'m = 3'}</M> examples and <M>{'n = 2'}</M> coefficients. θ starts at zeros: the task does not say so, but it is the
        standard choice and the one the official answer uses.
      </>
    )
  } else if (st.kind === 'pred') {
    panel = (
      <Eq>
        <Mat data={X} rows={[0]} label="X (3, 2)" />
        <Op>@</Op>
        <Mat data={col(before)} format={fmt} label="θ (2,)" />
        <Op>=</Op>
        <Mat data={col(preds)} format={fmt} cells={[[0, 0]]} label="predictions (3,)" />
      </Eq>
    )
    note = (
      <>
        Every prediction at once. Row 1: <M>{`2 \\times ${fmt(before[0])} + 2 \\times ${fmt(before[1])} = ${fmt(preds[0])}`}</M>. This is <M>{'h_\\theta(x^{(i)})'}</M> for all
        three examples.
      </>
    )
  } else if (st.kind === 'err') {
    panel = (
      <Eq>
        <Mat data={col(preds)} format={fmt} label="predictions" />
        <Op>−</Op>
        <Mat data={col(Y)} label="y" />
        <Op>=</Op>
        <Mat data={col(errs)} format={fmt} tone="sign" label="errors (3,)" />
      </Eq>
    )
    note = (
      <>
        <M>{'h_\\theta(x^{(i)}) - y^{(i)}'}</M> for every example. All three are negative: the line is still below every point, so the gradient will push θ up.
      </>
    )
  } else if (st.kind === 'grad') {
    panel = (
      <Eq>
        <Mat data={XT} rows={[1]} label="X.T (2, 3)" />
        <Op>@</Op>
        <Mat data={col(errs)} format={fmt} label="errors (3,)" />
        <Op>/ 3 =</Op>
        <Mat data={col(grad)} format={fmt} cells={[[1, 0]]} label="gradient (2,)" />
      </Eq>
    )
    note = (
      <>
        Row <em>j</em> of <code>X.T</code> times the errors is the task's sum <M>{'\\sum_i (h_\\theta(x^{(i)}) - y^{(i)})\\,x_j^{(i)}'}</M>, and <code>/ m</code> makes it the mean.
        Row 2: <M>{`(2 \\times ${fmt(errs[0])} + 4 \\times ${fmt(errs[1])} + 6 \\times ${fmt(errs[2])}) / 3 = ${fmt(grad[1])}`}</M>.
      </>
    )
  } else if (st.kind === 'upd') {
    panel = (
      <Eq>
        <Mat data={col(before)} format={fmt} label="θ (old)" />
        <Op>− 0.01 ×</Op>
        <Mat data={col(grad)} format={fmt} label="gradient" />
        <Op>=</Op>
        <Mat data={col(after)} format={fmt} label="θ (new)" />
      </Eq>
    )
    note = (
      <>
        Both coefficients change together, using the same old θ: <M>{`${fmt(before[0])} - 0.01 \\times (${fmt(grad[0])}) = ${fmt(after[0])}`}</M>. Subtracting a negative
        gradient moves θ up. Iteration {st.it} done.
      </>
    )
  } else {
    panel = (
      <Eq>
        <Mat data={col(after)} format={(v) => v.toFixed(8)} label="θ after 1000 iterations" />
        <Op>→</Op>
        <Mat data={col(npRound(after, 4))} format={(v) => short(v, 4)} label="np.round(θ, 4)" />
      </Eq>
    )
    note = (
      <>
        After 1000 iterations the function returns <code>{npArrayRepr(npRound(after, 4))}</code>, the official answer. Rounding happens once, on the way out.
      </>
    )
  }

  return (
    <Figure
      title="Three vectorised lines, one iteration at a time"
      caption={
        <>
          Press <strong>Next</strong> to run the loop body line by line. Watch the shapes: <code>(3, 2) @ (2,)</code> gives one prediction per example, and{' '}
          <code>(2, 3) @ (3,)</code> gives one gradient per coefficient. The highlighted cells are the ones worked out in the text below the arrays.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.7rem' }}>
        <Notebook ariaLabel="The solution, with the running line highlighted">
          <NbCell prompt="In [4]:" tags={[{ text: 'your answer', tone: 'answer' }]}>
            <CodeLines code={narrow ? CODE_NARROW : CODE} mark={(i) => (LINE[st.kind].includes(i) ? 'hl' : undefined)} wrap={narrow} />
          </NbCell>
        </Notebook>
        <div style={{ minHeight: narrow ? 0 : 190, display: 'grid', alignItems: 'center', width: '100%' }} aria-live="polite">
          {panel}
        </div>
        <Note>{note}</Note>
        <Readout
          items={[
            ['iteration', st.kind === 'setup' ? '0 (before the loop)' : st.kind === 'ret' ? `${ITERS} (done)` : `${st.it} of ${ITERS}`],
            ['θ now', `(${(st.kind === 'upd' || st.kind === 'ret' ? after : before).map(fmt).join(', ')})`],
            ['cost J', short(cost(st.kind === 'upd' || st.kind === 'ret' ? after : before), 6)],
          ]}
        />
        <PlayerControls player={player} label={(i) => `Step ${i + 1} of ${STEPS.length}`} />
      </div>
    </Figure>
  )
}
