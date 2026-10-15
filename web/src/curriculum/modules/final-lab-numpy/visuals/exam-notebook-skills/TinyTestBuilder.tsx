import { useMemo, useState } from 'react'
import { Figure, Toggle, Button, useNarrow } from '../../../../../kit'
import { Notebook, NbCell, CodeLines, Note, nbStyles as s } from './nb'
import { TESTS, runCentroid, fmtVal, fmtExpected, passes, callText, codeFor, type Fixes, type PyVal } from './centroidSim'

/*
  Concept: testing and formatting.
  A k-means "update one centroid" function with three classic gaps. Add exam-style edge-case
  tests, run them, and switch on fixes until every test passes. Every "got" value is computed by
  simulating the Python code shown.
*/

const START: string[] = ['two', 'one']

const ADVICE: Record<string, string> = {
  thirds: 'The mean 22/3 is printed with 16 digits. Round each coordinate to 4 d.p. before returning.',
  empty: 'An empty cluster has no mean. Check for it first and return the old centroid.',
  three: 'The code only ever looks at p[0] and p[1]. Loop over the coordinates instead (zip(*points)).',
  tiny: 'Unrounded, the mean prints as -5e-06. Rounded, it becomes -0.0, which equals 0.0, so it passes.',
}

export default function TinyTestBuilder() {
  const [fix, setFix] = useState<Fixes>({ empty: false, anyDim: false, round4: false })
  const [ids, setIds] = useState<string[]>(START)
  // results of the last run, with the fixes they were run against
  const [ran, setRan] = useState<{ fix: Fixes; ids: string[] }>({ fix: { empty: false, anyDim: false, round4: false }, ids: START })
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)

  const { code, added } = useMemo(() => codeFor(fix), [fix])
  const stale = ran.ids.length !== ids.length || ran.fix.empty !== fix.empty || ran.fix.anyDim !== fix.anyDim || ran.fix.round4 !== fix.round4

  const results = useMemo(() => {
    const m = new Map<string, PyVal>()
    for (const id of ran.ids) {
      const t = TESTS.find((x) => x.id === id)!
      m.set(id, runCentroid(t.points, t.old, ran.fix))
    }
    return m
  }, [ran])

  const shown = ids.map((id) => TESTS.find((t) => t.id === id)!)
  const nPass = ran.ids.filter((id) => passes(results.get(id)!, TESTS.find((t) => t.id === id)!)).length
  const firstFail = ran.ids.find((id) => !passes(results.get(id)!, TESTS.find((t) => t.id === id)!))
  const allTests = ids.length === TESTS.length
  const allPass = !stale && nPass === ran.ids.length

  const run = () => setRan({ fix: { ...fix }, ids: [...ids] })

  return (
    <Figure
      title="Build a tiny test table, then fix what fails"
      caption={
        <>
          This is the update step of k-means (2025 Task 2) as a small function. Add the edge cases one at a time, press <strong>Run tests</strong>, and switch on a fix for
          each failure. Notice that the two "obvious" tests pass even though the function has three bugs: only the exam-style thirds test and the edge cases catch them.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.7rem' }}>
        <Notebook ariaLabel="The function being tested">
          <NbCell prompt="In [ ]:" tags={[{ text: 'your answer', tone: 'answer' }]} headExtra={stale ? <span className={`${s.tag} ${s.tagWarn}`}>edited</span> : undefined}>
            <CodeLines code={code} mark={(i) => (added.includes(i) ? 'add' : undefined)} wrap={narrow} />
          </NbCell>
        </Notebook>
        <div className={s.row} role="group" aria-label="Fixes you can apply to the function">
          <Toggle label="handle an empty cluster" checked={fix.empty} onChange={(v) => setFix({ ...fix, empty: v })} />
          <Toggle label="any number of coordinates" checked={fix.anyDim} onChange={(v) => setFix({ ...fix, anyDim: v })} />
          <Toggle label="round to 4 d.p." checked={fix.round4} onChange={(v) => setFix({ ...fix, round4: v })} />
        </div>

        <div style={{ width: '100%', display: 'grid', gap: '0.4rem' }} role="list" aria-label="Test cases">
          {shown.map((t) => {
            const r = ran.ids.includes(t.id) ? results.get(t.id) : undefined
            const ok = r ? passes(r, t) : false
            const pending = stale || !r
            return (
              <div
                key={t.id}
                role="listitem"
                style={{
                  border: '1px solid var(--rule)',
                  borderLeft: `4px solid ${pending ? 'var(--rule)' : ok ? 'var(--ok)' : 'var(--bad)'}`,
                  borderRadius: 8,
                  padding: '0.4rem 0.6rem',
                  background: 'var(--surface)',
                  textAlign: 'left',
                  minWidth: 0,
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <strong style={{ color: pending ? 'var(--ink-3)' : ok ? 'var(--ok)' : 'var(--bad)', minWidth: '4.2em' }}>{pending ? 'not run' : ok ? '✓ pass' : '✗ fail'}</strong>
                  <span style={{ fontWeight: 700 }}>{t.name}</span>
                  <span style={{ color: 'var(--ink-3)', fontSize: '0.82rem' }}>{t.why}</span>
                </div>
                <div className={s.mono} style={{ fontSize: '0.78rem', overflowWrap: 'anywhere', color: 'var(--ink-2)' }}>
                  {callText(t)}
                </div>
                <div className={s.mono} style={{ fontSize: '0.78rem', display: 'flex', flexWrap: 'wrap', gap: '0.2rem 1rem' }}>
                  <span>
                    <span style={{ color: 'var(--ink-3)' }}>expected </span>
                    {fmtExpected(t)}
                  </span>
                  <span style={{ color: pending ? 'var(--ink-3)' : ok ? 'var(--ink)' : 'var(--bad)', overflowWrap: 'anywhere' }}>
                    <span style={{ color: 'var(--ink-3)' }}>got </span>
                    {pending ? '…' : fmtVal(r!)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className={s.row}>
          <Button primary onClick={run}>
            Run tests
          </Button>
          <span className={s.mono} style={{ fontSize: '0.85rem' }}>
            {stale ? 'changed: run again' : `${nPass} of ${ran.ids.length} passed`}
          </span>
        </div>
        {!allTests && (
          <div className={s.row} role="group" aria-label="Add an edge-case test">
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)' }}>Add a test:</span>
            {TESTS.filter((t) => !ids.includes(t.id)).map((t) => (
              <Button key={t.id} onClick={() => setIds([...ids, t.id])}>
                + {t.name}
              </Button>
            ))}
          </div>
        )}
        {!stale && firstFail && (
          <Note tone="bad" title={`Failing: ${TESTS.find((t) => t.id === firstFail)!.name}.`}>
            {ADVICE[firstFail] ?? 'Compare expected with got, then change one thing.'}
          </Note>
        )}
        {allPass && !allTests && (
          <Note title="All your tests pass.">Good, but are they the hard ones? Add another edge case from the list.</Note>
        )}
        {allPass && allTests && (
          <Note tone="ok" title="Six out of six.">
            Two lines for the empty cluster, one loop over the coordinates and one round(). Each fix was worth marks, and each was found by a test you wrote in seconds.
          </Note>
        )}
      </div>
    </Figure>
  )
}
