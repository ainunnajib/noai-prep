import { useEffect, useRef, useState } from 'react'
import { Figure, Button, useNarrow } from '../../../../../kit'
import { Chips, Py } from '../task-attention/ui'
import { TASKS, type PracticeTask } from './tasks'
import { runTests, OFFLINE_MESSAGE, type TestRun } from './pyrun'
import { PRACTICE_EVENT, PRACTICE_ANCHOR } from './events'
import s from './practice.module.css'

/*
  A test-first practice loop: pick a task, read the signature and the visible tests, write the
  function, run the visible tests (real Python via Pyodide), and only then unlock the hidden tests,
  which check the edge cases that hidden graders like. Edits are kept per task while the page is open.
*/

type Status = 'idle' | 'loading'

function TestList({ task, which, run }: { task: PracticeTask; which: 'visible' | 'hidden'; run?: TestRun }) {
  const tests = task[which]
  return (
    <div className={s.tests} role="list">
      {tests.map((t, i) => {
        const r = run?.results[i]
        const state = !r ? 'todo' : r[1] ? 'pass' : 'fail'
        return (
          <div key={t.name} role="listitem" className={`${s.test} ${s[`t_${state}`]}`}>
            <span className={s.mark} aria-label={state}>
              {state === 'pass' ? '✓' : state === 'fail' ? '✗' : '·'}
            </span>
            <span className={s.testBody}>
              <b>{t.name}</b>
              <span className={s.call}>
                {/^[A-Za-z_][\w.]*\(/.test(t.call) ? <Py code={t.call} /> : <span className={s.plain}>{t.call}</span>} <span className={s.arrow}>→</span> <span className={s.expect}>{t.expect}</span>
              </span>
              {r && !r[1] && <span className={s.fail}>{r[2]}</span>}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function TestDrivenLoop() {
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const [id, setId] = useState(TASKS[0].id)
  const [codes, setCodes] = useState<Record<string, string>>(() => Object.fromEntries(TASKS.map((t) => [t.id, t.stub])))
  const [visRun, setVisRun] = useState<Record<string, TestRun | undefined>>({})
  const [hidRun, setHidRun] = useState<Record<string, TestRun | undefined>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [showHand, setShowHand] = useState(false)
  const [showSol, setShowSol] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const started = useRef(false)
  const task = TASKS.find((t) => t.id === id) ?? TASKS[0]
  const code = codes[id]
  const vis = visRun[id]
  const hid = hidRun[id]
  const visPass = !!vis && !vis.error && vis.results.every((r) => r[1])
  const hidPass = !!hid && !hid.error && hid.results.every((r) => r[1])

  useEffect(() => {
    const open = (e: Event) => {
      const want = (e as CustomEvent<string>).detail
      if (TASKS.some((t) => t.id === want)) {
        setId(want)
        setShowHand(false)
        setShowSol(false)
      }
    }
    window.addEventListener(PRACTICE_EVENT, open)
    return () => window.removeEventListener(PRACTICE_EVENT, open)
  }, [])

  const choose = (v: string) => {
    setId(v)
    setShowHand(false)
    setShowSol(false)
    setMessage('')
  }

  const run = async (which: 'visible' | 'hidden') => {
    setMessage(started.current ? '' : 'Starting Python in your browser (the first run takes a few seconds)…')
    setStatus('loading')
    try {
      const t0 = performance.now()
      const res = await runTests(code, which === 'visible' ? task.visibleCode : task.hiddenCode)
      ;(which === 'visible' ? setVisRun : setHidRun)((m) => ({ ...m, [id]: res }))
      if (which === 'visible') setHidRun((m) => ({ ...m, [id]: undefined }))
      started.current = true
      setMessage(performance.now() - t0 > 4000 ? 'Python is ready now; later runs are instant.' : '')
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setMessage(/load|network|fetch|initialise/i.test(msg) ? OFFLINE_MESSAGE : msg)
    }
    setStatus('idle')
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      const ta = e.currentTarget
      const { selectionStart: a, selectionEnd: b } = ta
      setCodes((c) => ({ ...c, [id]: code.slice(0, a) + '    ' + code.slice(b) }))
      requestAnimationFrame(() => {
        if (taRef.current) taRef.current.selectionStart = taRef.current.selectionEnd = a + 4
      })
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      void run('visible')
    }
  }

  const busy = status !== 'idle'
  return (
    <Figure
      title="Test-first practice: eight likely tasks"
      caption={
        <>
          Pick a task, work the tiny example by hand, then fill in the function and press <b>Run visible tests</b> (real Python and NumPy, running in your browser). Read any failure
          message, fix, and run again. Only when every visible test passes do the hidden tests unlock: they check the edge cases a grader would, such as dividing by zero, huge
          numbers and ties.
        </>
      }
    >
      <div ref={wrapRef} className={s.stack} id={PRACTICE_ANCHOR}>
        <Chips label="Task" options={TASKS.map((t) => ({ value: t.id, label: t.title }))} value={id} onChange={choose} />
        <div className={s.brief}>
          <div className={s.briefHead}>
            <b>{task.title}</b>
            <span className={s.lib}>{task.lib}</span>
          </div>
          <p>{task.brief}</p>
          <button type="button" className={s.linkBtn} onClick={() => setShowHand((v) => !v)} aria-expanded={showHand}>
            {showHand ? 'Hide' : 'Show'} the tiny example worked by hand
          </button>
          {showHand && <p className={s.hand}>{task.hand}</p>}
        </div>
        <textarea
          ref={taRef}
          className={s.editor}
          value={code}
          spellCheck={false}
          aria-label={`Python editor for ${task.title}`}
          rows={Math.min(22, code.split('\n').length + 3)}
          onChange={(e) => setCodes((c) => ({ ...c, [id]: e.target.value }))}
          onKeyDown={onKeyDown}
        />
        <div className={s.btnRow}>
          <Button primary onClick={() => void run('visible')} disabled={busy}>
            {status === 'loading' ? 'Running…' : 'Run visible tests'}
          </Button>
          <Button onClick={() => void run('hidden')} disabled={busy || !visPass}>
            {visPass ? 'Run hidden tests' : 'Hidden tests: pass the visible ones first'}
          </Button>
          <Button onClick={() => setCodes((c) => ({ ...c, [id]: task.stub }))} disabled={busy}>
            Reset
          </Button>
          <Button onClick={() => setShowSol((v) => !v)}>{showSol ? 'Hide model solution' : 'Show model solution'}</Button>
        </div>
        {message && <div className={s.note}>{message}</div>}
        <div className={`${s.results} ${narrow ? s.resultsNarrow : ''}`}>
          <div>
            <div className={s.resHead}>
              Visible tests{' '}
              {vis && !vis.error && (
                <span className={visPass ? s.good : s.bad}>
                  {vis.results.filter((r) => r[1]).length} / {vis.results.length} passed
                </span>
              )}
            </div>
            {vis?.error && <div className={s.error}>{vis.error}</div>}
            <TestList task={task} which="visible" run={vis} />
          </div>
          <div>
            <div className={s.resHead}>
              Hidden tests{' '}
              {hid && !hid.error && (
                <span className={hidPass ? s.good : s.bad}>
                  {hid.results.filter((r) => r[1]).length} / {hid.results.length} passed
                </span>
              )}
            </div>
            {hid?.error && <div className={s.error}>{hid.error}</div>}
            {visPass || hid ? (
              <TestList task={task} which="hidden" run={hid} />
            ) : (
              <p className={s.locked}>
                {task.hidden.length} hidden tests, locked until the visible tests pass. Before you unlock them, list the edge cases you would test yourself.
              </p>
            )}
          </div>
        </div>
        {(vis?.stdout || hid?.stdout) && (
          <pre className={s.stdout} aria-label="What your code printed">
            {[vis?.stdout, hid?.stdout].filter(Boolean).join('\n')}
          </pre>
        )}
        {hidPass && <div className={s.done}>All tests pass. Now try it without the hints, or move on to the next task.</div>}
        {showSol && (
          <div className={s.solution}>
            <div className={s.resHead}>Model solution (one of several correct ways)</div>
            <pre>
              <Py code={task.solution.trimEnd()} />
            </pre>
          </div>
        )}
      </div>
    </Figure>
  )
}
