import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Segmented, Button } from '../../../../../kit'
import { mono, OutputBox } from '../vectorised-ops-and-axes/Cells'

/*
  Same maths, different return formats, two kinds of hidden test. Every verdict and message
  below was produced by actually running the candidate against the test in Python 3.13 with
  NumPy 2 (C = [[1.5, 2.0], [4.333333333333333, 5.0]]).
*/

type Grader = 'exact' | 'tol'
type Verdict = 'PASS' | 'FAIL' | 'ERROR'

interface Candidate {
  code: string
  returns: string
  exact: [Verdict, string]
  tol: [Verdict, string]
}

const CANDIDATES: Candidate[] = [
  {
    code: 'return C.tolist()',
    returns: '[[1.5, 2.0], [4.333333333333333, 5.0]]',
    exact: ['FAIL', 'Not rounded: 4.333333333333333 is not equal to 4.3333, so == is False.'],
    tol: ['PASS', 'The difference 0.0000333 is below the tolerance 0.0001, so a tolerant test accepts it.'],
  },
  {
    code: 'return np.round(C, 4)',
    returns: 'array([[1.5   , 2.    ],\n       [4.3333, 5.    ]])',
    exact: ['ERROR', 'Comparing an array with == gives an array of True/False, and assert cannot turn that into one answer:\nValueError: The truth value of an array with more than one element is ambiguous. Use a.any() or a.all()'],
    tol: ['PASS', 'assert_allclose converts both sides to arrays, so the type does not matter here.'],
  },
  {
    code: 'return np.round(C, 4).tolist()',
    returns: '[[1.5, 2.0], [4.3333, 5.0]]',
    exact: ['PASS', 'Right values, right rounding, right type (a list of lists), right shape.'],
    tol: ['PASS', 'Passes the tolerant test as well. This is the one to write.'],
  },
  {
    code: 'return [tuple(r) for r in np.round(C, 4).tolist()]',
    returns: '[(1.5, 2.0), (4.3333, 5.0)]',
    exact: ['FAIL', 'A tuple is never == a list in Python, even with the same numbers inside.'],
    tol: ['PASS', 'assert_allclose turns the tuples into an array, so only the numbers are compared.'],
  },
  {
    code: 'return np.round(C, 2).tolist()',
    returns: '[[1.5, 2.0], [4.33, 5.0]]',
    exact: ['FAIL', 'Rounded to 2 decimal places instead of 4: 4.33 is not 4.3333.'],
    tol: ['FAIL', '|4.33 − 4.3333| = 0.0033, which is bigger than the tolerance 0.0001:\nMismatched elements: 1 / 4 (25%)'],
  },
  {
    code: 'return np.round(C, 4).ravel().tolist()',
    returns: '[1.5, 2.0, 4.3333, 5.0]',
    exact: ['FAIL', 'Right numbers, wrong shape: one flat list of 4 instead of 2 lists of 2.'],
    tol: ['FAIL', 'Shapes must match even with a tolerance:\n(shapes (4,), (2, 2) mismatch)'],
  },
  {
    code: 'print(np.round(C, 4).tolist())   # no return',
    returns: 'None   (the right list is printed, but nothing is returned)',
    exact: ['FAIL', 'The test sees the return value, None, and None == [[1.5, 2.0], [4.3333, 5.0]] is False.'],
    tol: ['ERROR', 'TypeError: unsupported operand type(s) for -: \'NoneType\' and \'float\''],
  },
]

const TEST: Record<Grader, string> = {
  exact: 'out = update_centroids(X, labels, 2)\nassert out == [[1.5, 2.0],\n               [4.3333, 5.0]]',
  tol: 'out = update_centroids(X, labels, 2)\nnp.testing.assert_allclose(\n    out, [[1.5, 2.0], [4.3333, 5.0]],\n    atol=1e-4)',
}

const chip = (v: Verdict | '?'): CSSProperties => {
  const c = v === 'PASS' ? 'var(--viz-pos)' : v === '?' ? 'var(--ink-3)' : 'var(--viz-neg)'
  return {
    ...mono,
    fontSize: '0.72rem',
    fontWeight: 700,
    padding: '0.15rem 0.45rem',
    borderRadius: 999,
    border: `1.5px solid ${c}`,
    color: c,
    background: v === '?' ? 'transparent' : `color-mix(in srgb, ${c} 12%, var(--surface))`,
    minWidth: '3.6rem',
    textAlign: 'center',
    flexShrink: 0,
  }
}

export default function OutputFormatChecker() {
  const [grader, setGrader] = useState<Grader>('exact')
  const [sel, setSel] = useState(0)
  const [seen, setSeen] = useState<Set<string>>(() => new Set(['exact:0']))
  const pick = (i: number) => {
    setSel(i)
    setSeen((s) => new Set(s).add(`${grader}:${i}`))
  }
  const changeGrader = (g: Grader) => {
    setGrader(g)
    setSeen((s) => new Set(s).add(`${g}:${sel}`))
  }
  const c = CANDIDATES[sel]
  const [verdict, why] = c[grader]
  const passCount = CANDIDATES.filter((k) => k[grader][0] === 'PASS').length
  const allSeen = CANDIDATES.every((_, i) => seen.has(`${grader}:${i}`))

  return (
    <Figure
      title="Right answer, wrong format, no marks"
      caption={
        <>
          The stub says: <em>return the k new centroids as a list of lists, rounded to 4 decimal places</em>. Seven students computed the same
          centroids <code>C</code> correctly but returned them differently. Guess which ones pass, then click each to find out. Switch the hidden
          test between an exact <code>==</code> check and a tolerant one: you rarely know which one the grader uses, so only an answer that passes
          both is safe.
        </>
      }
    >
      <Controls>
        <Segmented
          label="Hidden test"
          value={grader}
          onChange={changeGrader}
          options={[
            { value: 'exact', label: 'exact ==' },
            { value: 'tol', label: 'with tolerance' },
          ]}
        />
      </Controls>
      <OutputBox label="the hidden test" nowrap small>
        {TEST[grader]}
      </OutputBox>
      <div role="list" style={{ display: 'grid', gap: 6, width: '100%' }}>
        {CANDIDATES.map((k, i) => {
          const shown = seen.has(`${grader}:${i}`)
          const v = shown ? k[grader][0] : '?'
          return (
            <button
              key={i}
              type="button"
              role="listitem"
              onClick={() => pick(i)}
              aria-pressed={sel === i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                boxSizing: 'border-box',
                textAlign: 'left',
                padding: '0.45rem 0.6rem',
                borderRadius: 10,
                cursor: 'pointer',
                border: `1.5px solid ${sel === i ? 'var(--accent)' : 'var(--rule)'}`,
                background: sel === i ? 'var(--accent-soft)' : 'var(--surface)',
                color: 'var(--ink)',
                font: 'inherit',
              }}
            >
              <span style={chip(v)}>{v}</span>
              <code style={{ ...mono, fontSize: '0.8rem', overflowWrap: 'anywhere', background: 'none', padding: 0 }}>{k.code}</code>
            </button>
          )
        })}
      </div>
      <div style={{ width: '100%', display: 'grid', gap: 6 }} aria-live="polite">
        <OutputBox label="your function returns" small>
          {c.returns}
        </OutputBox>
        <div
          style={{
            width: '100%',
            boxSizing: 'border-box',
            borderRadius: 10,
            padding: '0.55rem 0.75rem',
            border: `1.5px solid ${verdict === 'PASS' ? 'var(--viz-pos)' : 'var(--viz-neg)'}`,
            background: `color-mix(in srgb, ${verdict === 'PASS' ? 'var(--viz-pos)' : 'var(--viz-neg)'} 9%, var(--surface))`,
            fontSize: '0.88rem',
            color: 'var(--ink)',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
          }}
        >
          <b style={{ color: verdict === 'PASS' ? 'var(--viz-pos)' : 'var(--viz-neg)' }}>{verdict}. </b>
          {why}
        </div>
      </div>
      <Controls>
        <Button onClick={() => setSeen((s) => new Set([...s, ...CANDIDATES.map((_, i) => `${grader}:${i}`)]))}>Reveal all</Button>
        {allSeen && (
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink-2)' }}>
            {passCount} of 7 pass this test; only <code>np.round(C, 4).tolist()</code> passes both.
          </span>
        )}
      </Controls>
    </Figure>
  )
}
