import { useState, type ReactNode } from 'react'
import { Figure, Controls, Segmented, Button, usePlayer, PlayerControls, useNarrow } from '../../../../../kit'
import { Notebook, NbCell, CodeLines, Note, nbStyles as s, type LineMark } from './nb'

/*
  Concept: reading the stub.
  Tour: the 2025 Task 1 notebook, annotated one clue at a time.
  Your turn: the 2026 Question 1.1 stub; click the line that answers each question.
*/

type CellId = 'md' | 'data' | 'stub' | 'call'

const MD_LINES: ReactNode[] = [
  <strong key="h">Task #1</strong>,
  <>• The function should take</>,
  <>
    {'    '}◦ NumPy arrays X (features with a column of values for the intercept);
  </>,
  <>{'    '}◦ y (target) as input;</>,
  <>{'    '}◦ learning rate alpha;</>,
  <>{'    '}◦ the number of iterations;</>,
  <>{'    '}◦ return the coefficients of the linear regression model as a NumPy array.</>,
  <>• Round your answer to four decimal places. -0.0 is a valid result for rounding a very small number.</>,
]

const DATA = `# DO NOT MAKE CHANGES TO THIS CELL

X = np.array([[2, 2], [2, 4], [2, 6]])
y = np.array([2, 4, 6])
alpha = 0.01
iterations = 1000`

const STUB = `def linear_regression_gradient_descent(
        X: np.ndarray, y: np.ndarray,
        alpha: float, iterations: int
) -> np.ndarray:
    # your code here
    return`

const CALL = `# DO NOT MAKE CHANGES TO THIS CELL

linear_regression_gradient_descent(
    X=X, y=y, alpha=alpha, iterations=iterations)`

const TOUR: { cell: CellId; lines: number[]; title: string; body: ReactNode }[] = [
  {
    cell: 'md',
    lines: [2],
    title: 'The intercept is already in X.',
    body: (
      <>
        "With a column of values for the intercept" means the first column of <code>X</code> plays the role of the bias. Do not add your own column of 1s, or you will return
        three numbers instead of two.
      </>
    ),
  },
  {
    cell: 'md',
    lines: [6],
    title: 'What to return.',
    body: (
      <>
        "As a NumPy array": return an <code>np.ndarray</code>. Not a list, not a printed string, not <code>None</code>.
      </>
    ),
  },
  {
    cell: 'md',
    lines: [7],
    title: 'How to format it.',
    body: (
      <>
        Round once, at the very end: <code>np.round(theta, 4)</code>. The note about <code>-0.0</code> tells you that values are compared, so a tiny negative number rounding
        to <code>-0.0</code> is fine.
      </>
    ),
  },
  {
    cell: 'data',
    lines: [0, 2, 3, 4, 5],
    title: 'The fixed input.',
    body: (
      <>
        Never edit this cell, but do read it. <code>X</code> has shape (3, 2), so there are <em>m</em> = 3 examples and <em>n</em> = 2 coefficients; <code>y</code> has
        shape (3,). To test other inputs, add a new cell of your own below.
      </>
    ),
  },
  {
    cell: 'stub',
    lines: [0, 1, 2, 3],
    title: 'The signature is a contract.',
    body: (
      <>
        Keep the function name, the parameter names and their order exactly. The type hints say: arrays and numbers in, one NumPy array out (<code>-&gt; np.ndarray</code>).
      </>
    ),
  },
  {
    cell: 'stub',
    lines: [4, 5],
    title: 'The empty stub returns None.',
    body: (
      <>
        A bare <code>return</code> gives back <code>None</code>. Replace <code>{'# your code here'}</code> with your code and make the last line return your rounded answer.
      </>
    ),
  },
  {
    cell: 'call',
    lines: [2, 3],
    title: 'How your function will be called.',
    body: (
      <>
        The call uses keywords (<code>alpha=alpha</code>), so renaming a parameter to <code>lr</code> makes this line crash with <code>TypeError</code>. The value of the last
        line is what Jupyter displays, and most likely what the marker compared (no marking scheme was published).
      </>
    ),
  },
  {
    cell: 'stub',
    lines: [4],
    title: 'What the stub does not say.',
    body: (
      <>
        Nothing says where θ starts. Use the textbook default, zeros (<code>np.zeros(n)</code>), which is what the official answer assumes. When a detail is missing, pick
        the standard choice and write it in a comment.
      </>
    ),
  },
]

/* ---------------- your turn: 2026 Question 1.1 ---------------- */

const ANSWER_CELL = `### ANSWER QUESTION 1.1 HERE
def l1_negative_gradient(
        y: np.ndarray, y_pred: np.ndarray
) -> np.ndarray:
    """
    Compute L1 negative gradient (sign of residual).
    This returns the direction of the error, not the magnitude.

    Parameters:
        y (np.ndarray): True values
        y_pred (np.ndarray): Current predictions

    Returns:
        np.ndarray: L1 Negative gradient (values will be -1, 0, or 1)
    """
    ### QUESTION 1.1 START
    # TODO: Implement L1 gradient computation
    ### QUESTION 1.1 END`

const TEST_CELL = `### TEST FOR QUESTION 1.1
y = np.random.rand(3, 5)
y_pred = np.random.rand(3, 5)
print(repr(l1_negative_gradient(y, y_pred)))`

type Pick = { cell: 'a' | 't'; line: number }

const QUESTIONS: { q: string; correct: Pick[]; why: ReactNode }[] = [
  {
    q: 'Which line tells you what values a correct answer can contain?',
    correct: [{ cell: 'a', line: 13 }],
    why: (
      <>
        "Values will be -1, 0, or 1": the answer is a <em>sign</em>, not a size. That points straight at <code>np.sign</code>.
      </>
    ),
  },
  {
    q: 'Where does your code go?',
    correct: [{ cell: 'a', line: 16 }],
    why: <>Replace the TODO line, between the START and END markers. Leave the markers and the docstring alone.</>,
  },
  {
    q: 'Which line shows the shape of the arrays the test will pass in?',
    correct: [
      { cell: 't', line: 1 },
      { cell: 't', line: 2 },
    ],
    why: (
      <>
        Shape (3, 5): a <em>2-D</em> array. Your function must work on whole arrays of any shape. <code>np.sign(y - y_pred)</code> does; a loop over{' '}
        <code>range(len(y))</code> would only see the 3 rows.
      </>
    ),
  },
  {
    q: 'Which line tells you what type of object to return?',
    correct: [
      { cell: 'a', line: 3 },
      { cell: 'a', line: 13 },
    ],
    why: (
      <>
        <code>-&gt; np.ndarray</code> (and "Returns: np.ndarray"): one array, the same shape as <code>y</code>. Not a list, not a single number.
      </>
    ),
  },
]

const HINTS: Record<string, string> = {
  a0: 'That line only labels which question this answer cell belongs to.',
  a1: 'The function name. Keep it exactly as it is.',
  a2: 'The inputs: y and y_pred, both NumPy arrays.',
  a3: 'After the arrow comes the return type.',
  a5: 'This describes what to compute: the sign of the residual.',
  a6: 'This says it is a direction, not a magnitude. Useful, but not the answer to this question.',
  a8: 'This introduces the inputs.',
  a9: 'An input: the true values.',
  a10: 'An input: the current predictions.',
  a12: 'The heading of the return section. Look at the line below it.',
  a13: 'The return description: type and possible values.',
  a15: 'A marker. Your code goes between START and END; do not delete the markers.',
  a16: 'The TODO line, where your code goes.',
  a17: 'A marker. Your code goes between START and END; do not delete the markers.',
  t0: 'A label for the test cell.',
  t1: 'The test builds y with np.random.rand(3, 5).',
  t2: 'The test builds y_pred with np.random.rand(3, 5).',
  t3: 'The test prints your result with repr, so you will see array([...]).',
}

export default function NotebookAnatomy() {
  const [mode, setMode] = useState<'tour' | 'turn'>('tour')
  const player = usePlayer({ steps: TOUR.length, interval: 4200 })
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const step = TOUR[player.step]

  // your-turn state
  const [qi, setQi] = useState(0)
  const [wrong, setWrong] = useState<Pick | null>(null)
  const [solved, setSolved] = useState<boolean[]>(QUESTIONS.map(() => false))
  const cur = QUESTIONS[qi]
  const allDone = solved.every(Boolean)

  const tourMark =
    (cell: CellId) =>
    (i: number): LineMark =>
      step.cell === cell && step.lines.includes(i) ? 'hl' : step.cell === cell ? undefined : 'dim'

  const pick = (p: Pick) => {
    if (solved[qi]) return
    if (cur.correct.some((c) => c.cell === p.cell && c.line === p.line)) {
      setSolved((v) => v.map((x, i) => (i === qi ? true : x)))
      setWrong(null)
    } else setWrong(p)
  }
  const turnMark =
    (cell: 'a' | 't') =>
    (i: number): LineMark => {
      if (solved[qi] && cur.correct.some((c) => c.cell === cell && c.line === i)) return 'ok'
      if (wrong && wrong.cell === cell && wrong.line === i) return 'bad'
      return undefined
    }
  const reset = () => {
    setQi(0)
    setWrong(null)
    setSolved(QUESTIONS.map(() => false))
  }

  return (
    <Figure
      title="Read the stub before you write a line"
      caption={
        mode === 'tour' ? (
          <>
            Step through the clues in the real 2025 Task 1 notebook (line breaks added to fit). Then switch to <strong>Your turn</strong> and find the clues in a 2026 stub
            yourself. Notice how much of the answer the stub already gives away.
          </>
        ) : (
          <>
            Click the line that answers each question. The 2026 stubs (here Question 1.1, test cell shortened) put the algorithm, the return type and the test inputs in plain
            sight.
          </>
        )
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.7rem' }}>
        <Controls>
          <Segmented
            label="Mode"
            value={mode}
            onChange={(v) => setMode(v)}
            options={[
              { value: 'tour', label: 'Tour: 2025 Task 1' },
              { value: 'turn', label: 'Your turn: 2026 Q1.1' },
            ]}
          />
        </Controls>

        {mode === 'tour' ? (
          <>
            <Notebook ariaLabel="The 2025 Task 1 notebook, four cells">
              <NbCell kind="markdown" active={step.cell === 'md'}>
                {MD_LINES.map((l, i) => (
                  <div
                    key={i}
                    className={step.cell === 'md' && step.lines.includes(i) ? s.hl : step.cell === 'md' ? undefined : s.dim}
                    style={{ whiteSpace: 'pre-wrap', padding: '0 0.25rem', borderRadius: 4 }}
                  >
                    {l}
                  </div>
                ))}
              </NbCell>
              <NbCell prompt="In [ ]:" tags={[{ text: 'DO NOT EDIT', tone: 'lock' }]} active={step.cell === 'data'} locked>
                <CodeLines code={DATA} mark={tourMark('data')} wrap={narrow} />
              </NbCell>
              <NbCell prompt="In [ ]:" tags={[{ text: 'your answer', tone: 'answer' }]} active={step.cell === 'stub'}>
                <CodeLines code={STUB} mark={tourMark('stub')} wrap={narrow} />
              </NbCell>
              <NbCell prompt="In [ ]:" tags={[{ text: 'DO NOT EDIT', tone: 'lock' }]} active={step.cell === 'call'} locked>
                <CodeLines code={CALL} mark={tourMark('call')} wrap={narrow} />
              </NbCell>
            </Notebook>
            <Note title={`Clue ${player.step + 1}: ${step.title}`}>{step.body}</Note>
            <PlayerControls player={player} label={(i) => `Clue ${i + 1} of ${TOUR.length}`} />
          </>
        ) : (
          <>
            <Note title={allDone ? 'All four found.' : `Question ${qi + 1} of ${QUESTIONS.length}:`} tone={allDone ? 'ok' : 'info'}>
              {allDone ? (
                <>
                  The whole answer is one line, <code>return np.sign(y - y_pred)</code>, and the stub, its docstring and the test cell told you nearly all of it.
                </>
              ) : (
                cur.q
              )}
            </Note>
            <Notebook ariaLabel="The 2026 Question 1.1 answer cell and its test cell">
              <NbCell prompt="In [ ]:" tags={[{ text: 'answer cell', tone: 'answer' }]}>
                <CodeLines
                  code={ANSWER_CELL}
                  mark={turnMark('a')}
                  onLineClick={allDone ? undefined : (i) => pick({ cell: 'a', line: i })}
                  wrap={narrow}
                />
              </NbCell>
              <NbCell prompt="In [ ]:" tags={[{ text: 'test cell', tone: 'lock' }]} locked>
                <CodeLines code={TEST_CELL} mark={turnMark('t')} onLineClick={allDone ? undefined : (i) => pick({ cell: 't', line: i })} wrap={narrow} />
              </NbCell>
            </Notebook>
            {!allDone && solved[qi] && (
              <Note tone="ok" title="Yes.">
                {cur.why}
              </Note>
            )}
            {!allDone && !solved[qi] && wrong && (
              <Note tone="bad" title="Not that one.">
                {HINTS[`${wrong.cell}${wrong.line}`] ?? 'That line does not answer this question. Look again.'}
              </Note>
            )}
            <div className={s.row}>
              {!allDone && solved[qi] && qi < QUESTIONS.length - 1 && (
                <Button primary onClick={() => (setQi(qi + 1), setWrong(null))}>
                  Next question
                </Button>
              )}
              <Button onClick={reset}>Start again</Button>
              <span style={{ fontSize: '0.85rem', color: 'var(--ink-3)' }}>
                Found {solved.filter(Boolean).length} of {QUESTIONS.length}
              </span>
            </div>
          </>
        )}
      </div>
    </Figure>
  )
}
