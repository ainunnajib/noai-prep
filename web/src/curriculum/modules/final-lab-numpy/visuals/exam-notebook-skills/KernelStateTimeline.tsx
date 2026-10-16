import { useState } from 'react'
import { Figure, Button, useNarrow } from '../../../../../kit'
import { Notebook, NbCell, CodeLines, Note, nbStyles as s } from './nb'

/*
  Concept: kernel state traps.
  A five-cell notebook backed by a tiny simulated kernel. Run cells in any order, edit the
  function without re-running it, then restart. The kernel panel shows what Python actually
  remembers, which is not always what the page shows.
*/

type CellNo = 1 | 2 | 3 | 4 | 5
interface Kernel {
  np: boolean
  data?: { v: number[]; by: number; cell: CellNo }
  average?: { ver: 1 | 2; by: number }
}
interface CellRun {
  count: number
  out?: { text: string; kind: 'plain' | 'error' | 'ok' | 'bad' }
  ver?: 1 | 2
}
interface State {
  kernel: Kernel
  count: number
  runs: Partial<Record<CellNo, CellRun>>
  log: CellNo[]
  src3: 1 | 2
  got: Set<string>
}

const SRC: Record<CellNo, string> = {
  1: 'import numpy as np',
  2: '# DO NOT MAKE CHANGES TO THIS CELL\ndata = np.array([2, 4, 6])',
  3: '',
  4: 'print(average(data))   # expect 4.0',
  5: '# scratch: a quick experiment\ndata = np.array([1, 1])',
}
const SRC3: Record<1 | 2, string> = {
  1: 'def average(a):\n    return a.sum()',
  2: 'def average(a):\n    return a.sum() / len(a)',
}

const CHALLENGES: { id: string; text: string; done: string }[] = [
  { id: 'stale', text: 'Fix the bug in cell 3, then run only cell 4.', done: 'Still wrong: the kernel kept the old average() because cell 3 was never re-run.' },
  { id: 'scratch', text: 'Run the scratch cell 5, then run cell 4 again.', done: 'A cell further down the page replaced data, so the test used [1, 1].' },
  { id: 'name', text: 'Restart the kernel, then run cell 4 on its own.', done: 'After a restart the kernel remembers nothing: NameError.' },
  { id: 'clean', text: 'With the bug fixed, press Restart & Run All.', done: 'Top to bottom from an empty kernel: this is the run that proves your notebook works.' },
]

function exec(st: State, c: CellNo): State {
  const k: Kernel = { ...st.kernel }
  const count = st.count + 1
  const got = new Set(st.got)
  let out: CellRun['out']
  const err = (name: string) => ({ text: `NameError: name '${name}' is not defined`, kind: 'error' as const })
  if (c === 1) k.np = true
  else if (c === 2 || c === 5) {
    if (!k.np) out = err('np')
    else k.data = c === 2 ? { v: [2, 4, 6], by: count, cell: 2 } : { v: [1, 1], by: count, cell: 5 }
  } else if (c === 3) k.average = { ver: st.src3, by: count }
  else if (c === 4) {
    if (!k.average) {
      out = err('average')
      if (st.log.length === 0 || !st.log.includes(3)) got.add('name')
    } else if (!k.data) out = err('data')
    else {
      const sum = k.data.v.reduce((a, b) => a + b, 0)
      const text = k.average.ver === 1 ? String(sum) : (sum / k.data.v.length).toFixed(1)
      out = { text, kind: text === '4.0' ? 'ok' : 'bad' }
      if (st.src3 === 2 && k.average.ver === 1) got.add('stale')
      if (k.data.cell === 5) got.add('scratch')
    }
  }
  return {
    ...st,
    kernel: k,
    count,
    got,
    log: [...st.log, c],
    runs: { ...st.runs, [c]: { count, out, ver: c === 3 ? st.src3 : undefined } },
  }
}

function restart(st: State): State {
  return { ...st, kernel: { np: false }, count: 0, runs: {}, log: [] }
}

function initial(): State {
  let st: State = { kernel: { np: false }, count: 0, runs: {}, log: [], src3: 1, got: new Set() }
  for (const c of [1, 2, 3, 4] as CellNo[]) st = exec(st, c)
  return st
}

export default function KernelStateTimeline() {
  const [st, setSt] = useState<State>(initial)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(640)

  const run = (c: CellNo) => setSt((p) => exec(p, c))
  const runAll = () =>
    setSt((p) => {
      let q = restart(p)
      for (const c of [1, 2, 3, 4, 5] as CellNo[]) q = exec(q, c)
      if (q.src3 === 2 && q.runs[4]?.out?.text === '4.0') q = { ...q, got: new Set([...q.got, 'clean']) }
      return q
    })
  const reset = () => setSt(initial())

  const cell = (c: CellNo, tags: { text: string; tone?: 'lock' | 'answer' | 'warn' | 'plain' }[]) => {
    const r = st.runs[c]
    const changed = c === 3 && r && r.ver !== st.src3
    return (
      <NbCell
        key={c}
        prompt={r ? `In [${r.count}]:` : 'In [ ]:'}
        // 'cell n' is the position on the page; In [n] is the run order, which changes every time a cell is run
        tags={[{ text: `cell ${c}`, tone: 'plain' as const }, ...tags, ...(changed ? [{ text: 'changed since run', tone: 'warn' as const }] : [])]}
        locked={c === 2}
        active={st.log[st.log.length - 1] === c}
        headExtra={
          <button type="button" className="btn btn-small" style={{ minHeight: 28, padding: '0.1em 0.7em' }} onClick={() => run(c)} aria-label={`Run cell ${c}`}>
            ▶ Run
          </button>
        }
        output={r?.out?.text}
        outputKind={r?.out?.kind}
      >
        <CodeLines code={c === 3 ? SRC3[st.src3] : SRC[c]} mark={(i) => (changed && i === 1 ? 'hl' : undefined)} wrap={narrow} />
      </NbCell>
    )
  }

  const k = st.kernel
  const memory = (
    <div
      style={{
        border: '1px solid var(--rule)',
        borderRadius: 8,
        background: 'var(--surface-2)',
        padding: '0.5rem 0.7rem',
        textAlign: 'left',
        fontSize: '0.85rem',
        alignSelf: 'start',
        display: 'grid',
        gap: '0.35rem',
      }}
      aria-live="polite"
    >
      <div style={{ fontWeight: 700 }}>What the kernel remembers</div>
      {!k.np && !k.data && !k.average && <div style={{ color: 'var(--ink-3)' }}>Nothing: the kernel is empty.</div>}
      {k.np && (
        <div className={s.mono}>
          np <span style={{ color: 'var(--ink-3)' }}>= the numpy module</span>
        </div>
      )}
      {k.data && (
        <div className={s.mono}>
          data = array([{k.data.v.join(', ')}])
          <div style={{ color: k.data.cell === 5 ? 'var(--bad)' : 'var(--ink-3)', fontFamily: 'var(--font-body)', fontSize: '0.78rem' }}>
            set by In [{k.data.by}] (cell {k.data.cell}
            {k.data.cell === 5 ? ', the scratch cell!' : ''})
          </div>
        </div>
      )}
      {k.average && (
        <div className={s.mono}>
          average(a) returns {k.average.ver === 1 ? 'a.sum()' : 'a.sum() / len(a)'}
          <div style={{ color: k.average.ver !== st.src3 ? 'var(--bad)' : 'var(--ink-3)', fontFamily: 'var(--font-body)', fontSize: '0.78rem' }}>
            defined by In [{k.average.by}]{k.average.ver !== st.src3 ? ': not what cell 3 now says!' : ''}
          </div>
        </div>
      )}
      <div style={{ borderTop: '1px dashed var(--rule)', paddingTop: '0.35rem' }}>
        <div style={{ fontWeight: 700 }}>Order you ran the cells</div>
        <div className={s.mono} style={{ overflowWrap: 'anywhere' }}>
          {st.log.length ? st.log.map((c) => `cell ${c}`).join(' → ') : '(nothing since the restart)'}
        </div>
      </div>
    </div>
  )

  return (
    <Figure
      title="The page order is not the run order"
      caption={
        <>
          Try the four challenges in any order. <b>cell n</b> is the cell's position on the page; <code>In [n]</code> is the order cells were run in. Real Jupyter shows only the <code>In [n]</code> numbers; the "changed since run" tag and the memory panel are what it does{' '}
          <em>not</em> show you. Notice that only <strong>Restart &amp; Run All</strong> proves the notebook works from top to bottom.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.7rem' }}>
        <div style={{ display: 'grid', gap: '0.7rem', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1.7fr) minmax(0, 1fr)', width: '100%' }}>
          <Notebook ariaLabel="A five-cell notebook">
            {cell(1, [])}
            {cell(2, [{ text: 'DO NOT EDIT', tone: 'lock' }])}
            {cell(3, [{ text: 'your answer', tone: 'answer' }])}
            <div className={s.row} style={{ marginTop: '-0.2rem' }}>
              <Button onClick={() => setSt((p) => ({ ...p, src3: p.src3 === 1 ? 2 : 1 }))}>{st.src3 === 1 ? '✎ Edit cell 3: fix the bug' : '↶ Undo the edit'}</Button>
            </div>
            {cell(4, [{ text: 'test', tone: 'plain' }])}
            {cell(5, [{ text: 'scratch', tone: 'plain' }])}
          </Notebook>
          {memory}
        </div>
        <div className={s.row}>
          <Button onClick={() => setSt((p) => restart(p))}>Restart kernel</Button>
          <Button primary onClick={runAll}>
            Restart &amp; Run All
          </Button>
          <Button onClick={reset}>Reset the demo</Button>
        </div>
        <div style={{ width: '100%', display: 'grid', gap: '0.3rem', textAlign: 'left' }} role="list" aria-label="Challenges">
          {CHALLENGES.map((c) => {
            const done = st.got.has(c.id)
            return (
              <div key={c.id} role="listitem" style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline', fontSize: '0.88rem' }}>
                <span aria-hidden="true" style={{ color: done ? 'var(--ok)' : 'var(--ink-3)', fontWeight: 700, minWidth: '1.2em' }}>
                  {done ? '✓' : '○'}
                </span>
                <span>
                  <span style={{ fontWeight: done ? 400 : 600, color: done ? 'var(--ink-3)' : 'var(--ink)' }}>{c.text}</span>
                  {done && <span style={{ color: 'var(--ink)' }}> {c.done}</span>}
                </span>
              </div>
            )
          })}
        </div>
        {st.got.size === CHALLENGES.length && (
          <Note tone="ok" title="All four traps seen.">
            Before you submit, always Restart &amp; Run All and read every output from the top.
          </Note>
        )}
      </div>
    </Figure>
  )
}
