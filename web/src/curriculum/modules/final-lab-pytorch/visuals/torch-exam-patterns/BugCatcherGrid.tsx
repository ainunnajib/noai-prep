import { useState } from 'react'
import { Figure, Controls, Readout, Button, useNarrow } from '../../../../../kit'
import { Py } from './code'
import s from './tep.module.css'

/*
  Which quick tests catch which bugs? Five tests that a student might put in a scratch cell before
  running the notebook's own test cell, against five classic bugs in attention_weights (the function
  from the shape-comment stepper). Every cell of the table was produced by running the tests on the
  buggy functions in PyTorch 2.14 (verification script catch1.py):

    bug \ test           all-2 shape  distinct shape  rows sum  all-ones  slow reference
    forgot K transpose   pass(miss)   crash           crash     crash     crash
    K.transpose(1, 2)    pass(miss)   crash           crash     crash     crash
    view, no transpose   miss         miss            miss      miss      caught
    softmax(dim=-2)      miss         miss            caught    miss      caught
    forgot / sqrt(d_k)   miss         miss            miss      miss      caught
*/

type Res = 'crash' | 'caught' | 'miss'

const TESTS = [
  {
    id: 'all2',
    name: 'Shape test, every size 2',
    code: 'x2 = torch.randn(2, 2, 4)\nassert attention_weights(x2, W_q2, W_k2, h=2).shape == (2, 2, 2, 2)',
  },
  {
    id: 'distinct',
    name: 'Shape test, all sizes different',
    code: 'x = torch.randn(2, 5, 12)\nw = attention_weights(x, W_q, W_k, h=3)\nassert w.shape == (2, 3, 5, 5)',
  },
  {
    id: 'rows',
    name: 'Each row of weights sums to 1',
    code: 'assert torch.allclose(w.sum(dim=-1), torch.ones(2, 3, 5))',
  },
  {
    id: 'ones',
    name: 'All-ones input gives weights 1/T',
    code: 'o = torch.ones(12, 12)\nw1 = attention_weights(torch.ones(2, 5, 12), o, o, h=3)\nassert torch.allclose(w1, torch.full_like(w1, 1 / 5))',
  },
  {
    id: 'ref',
    name: 'Matches a slow loop over heads',
    code: 'assert torch.allclose(w, slow_attention(x, W_q, W_k, h=3), atol=1e-6)',
  },
] as const

const BUGS: { name: string; kind: string; res: Res[] }[] = [
  { name: "Forgot K's transpose(1, 2)", kind: 'crashes', res: ['miss', 'crash', 'crash', 'crash', 'crash'] },
  { name: 'K.transpose(1, 2) in scores', kind: 'crashes', res: ['miss', 'crash', 'crash', 'crash', 'crash'] },
  { name: 'view(B, h, T, d_k), no transpose', kind: 'silent', res: ['miss', 'miss', 'miss', 'miss', 'caught'] },
  { name: 'softmax(dim=-2)', kind: 'silent', res: ['miss', 'miss', 'caught', 'miss', 'caught'] },
  { name: 'Forgot / math.sqrt(d_k)', kind: 'silent', res: ['miss', 'miss', 'miss', 'miss', 'caught'] },
]

export default function BugCatcherGrid() {
  const [on, setOn] = useState<boolean[]>([true, false, false, true, false])
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)
  const caught = BUGS.map((b) => b.res.some((r, j) => on[j] && r !== 'miss'))
  const escaped = caught.filter((c) => !c).length
  const nOn = on.filter(Boolean).length

  return (
    <Figure
      title="Which quick test catches which bug?"
      caption={
        <>
          Tick the tests you would write in a scratch cell before running the notebook's own test cell. A bug is caught if any ticked test crashes or fails on it.
          Notice that the tests with every size equal to 2, or with all-ones input, catch almost nothing: symmetric inputs hide swapped axes and wrong dims. Distinct
          sizes plus one comparison with a slow, obviously-correct version catch all five.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.8rem' }}>
        <div className={s.bcTests} role="group" aria-label="Tests to run">
          {TESTS.map((t, j) => (
            <button
              key={t.id}
              type="button"
              role="checkbox"
              aria-checked={on[j]}
              className={`${s.bcTest} ${on[j] ? s.bcTestOn : ''}`}
              onClick={() => setOn((o) => o.map((v, k) => (k === j ? !v : v)))}
            >
              <span className={s.bcBox} aria-hidden="true">
                {on[j] ? '✓' : ''}
              </span>
              <span className={s.bcTestName}>
                T{j + 1}. {t.name}
              </span>
              <span className={s.bcTestCode}>
                <Py code={t.code} size={narrow ? 11.5 : 12.5} />
              </span>
            </button>
          ))}
        </div>
        <div style={{ width: '100%', fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.45 }}>
          {narrow ? (
            <>
              In the table, <b style={{ color: 'var(--ok)' }}>✓</b> means the test notices the bug (it crashes or its assert fails) and <b>–</b> means the test passes,
              so the bug slips through.
            </>
          ) : (
            <>
              In the table, <b style={{ color: 'var(--ok)' }}>crash</b> or <b style={{ color: 'var(--ok)' }}>fails</b> means the test notices the bug; <b>pass</b> means
              the test passes, so the bug slips through unnoticed.
            </>
          )}
        </div>
        <div className={s.scrollX}>
          <table className={`${s.bcTable} ${narrow ? s.bcNarrow : ''}`} aria-label="Which tests catch which bugs">
            <thead>
              <tr>
                <th scope="col">Bug</th>
                {TESTS.map((t, j) => (
                  <th key={t.id} scope="col" className={on[j] ? '' : s.bcOff} title={t.name}>
                    T{j + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BUGS.map((b, i) => (
                <tr key={b.name} className={caught[i] ? '' : s.bcEscaped}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: narrow ? 11.5 : 12.5 }}>{b.name}</span>
                    <br />
                    <span className={`${s.bcBadge} ${caught[i] ? s.bcBadgeOk : s.bcBadgeBad}`}>{caught[i] ? 'caught' : 'escapes'}</span>{' '}
                    <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{b.kind}</span>
                  </td>
                  {b.res.map((r, j) => (
                    <td key={j} className={on[j] ? '' : s.bcOff}>
                      {r === 'crash' ? (
                        <span className={s.bcCrash} title="the test crashes, so you notice">
                          {narrow ? '✓' : 'crash'}
                        </span>
                      ) : r === 'caught' ? (
                        <span className={s.bcCaught} title="the assert fails">
                          {narrow ? '✓' : 'fails'}
                        </span>
                      ) : (
                        <span className={s.bcMissed} title="the test passes: bug not noticed">
                          {narrow ? '–' : 'pass'}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Controls>
          <Readout
            items={[
              ['tests ticked', `${nOn} of 5`],
              ['bugs that reach the hidden tests', `${escaped} of 5`],
            ]}
          />
          <Button onClick={() => setOn([false, true, true, false, true])}>Tick the strong set</Button>
          <Button onClick={() => setOn([true, false, false, true, false])}>Back to the lazy set</Button>
        </Controls>
      </div>
    </Figure>
  )
}
