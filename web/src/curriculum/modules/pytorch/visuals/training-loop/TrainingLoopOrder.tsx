import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Figure, Controls, Readout, Segmented, Button, Plot, Grid, Axes, Path, Dots, Label, useNarrow } from '../../../../../kit'
import { OUTCOMES, PROGRAM_OUTCOME, DATA_X, DATA_Y, GRID_X } from './loopData'
import { LINE_CODE, traceProgram, type LineId, type Trace, type Tone } from './loopTrace'
import { Py, MONO } from './PyCode'

/*
  Five line cards make up the body of a training loop. Reorder them (drag the handle, or use the
  arrow buttons) and switch lines off. Every one of the 326 possible bodies was run in real PyTorch
  (see loopData.ts), so the loss curve, the final fit and any error are what PyTorch really does.
  Under each card, a trace explains what that line did to .grad and the weights in iteration 1, 2 or 3.
*/

const START: LineId[] = ['Z', 'F', 'C', 'S', 'B']
const CORRECT = OUTCOMES[PROGRAM_OUTCOME['ZFCBS']]
const ITERS = CORRECT.curve.length - 1

const toneColour: Record<Tone, string> = { ok: 'var(--ok)', warn: 'var(--warn)', bad: 'var(--bad)', muted: 'var(--ink-3)' }

const VERDICT = {
  learns: { title: 'Learns', colour: 'var(--ok)' },
  lags: { title: 'Learns, but one batch behind', colour: 'var(--warn)' },
  flat: { title: 'Runs without error, never learns', colour: 'var(--warn)' },
  unstable: { title: 'Unstable: gradients pile up', colour: 'var(--bad)' },
  crash: { title: 'Crashes', colour: 'var(--bad)' },
} as const

function explain(prog: LineId[], tr: Trace, errMsg: string | undefined) {
  switch (tr.verdict) {
    case 'learns':
      return <>Every <code>step()</code> uses exactly the current batch's gradient. The loss falls towards the noise level of the data.</>
    case 'lags':
      return (
        <>
          <code>step()</code> runs before this batch's <code>backward()</code>, so each update uses the <i>previous</i> batch's gradient. It still learns, but it is confusing code and the last
          batch's gradient is never used.
        </>
      )
    case 'flat':
      if (!prog.includes('B')) return <>There is no <code>loss.backward()</code>, so no gradient is ever computed and <code>step()</code> has nothing to apply.</>
      if (!prog.includes('S')) return <>Without <code>optimizer.step()</code> the gradients are computed and then thrown away: the weights never change.</>
      return (
        <>
          <code>zero_grad()</code> always runs between <code>backward()</code> and <code>step()</code>, so <code>step()</code> finds <code>.grad</code> empty (<code>None</code>) and skips every
          weight. No error, no learning.
        </>
      )
    case 'unstable':
      return (
        <>
          With no <code>zero_grad()</code>, each <code>backward()</code> <b>adds</b> onto the gradients of every earlier batch, so the steps use a growing pile of stale gradients. The loss swings
          and climbs.
        </>
      )
    case 'crash':
      return (
        <>
          Iteration {tr.crash!.iter} stops with <code style={{ overflowWrap: 'anywhere' }}>{tr.crash!.type}: {errMsg}</code>
          {tr.crash!.type === 'NameError'
            ? ' A line uses a variable before the line that creates it has ever run.'
            : ' optimizer.step() changed the weights in place after the forward pass but before backward(), and autograd still needed the old values.'}
        </>
      )
  }
}

const fmt = (v: number | null | undefined) => (v == null ? 'inf' : v >= 10 ? v.toFixed(1) : v >= 1 ? v.toFixed(2) : v.toFixed(3))

export default function TrainingLoopOrder() {
  const [order, setOrder] = useState<LineId[]>(START)
  const [off, setOff] = useState<LineId[]>([])
  const [iter, setIter] = useState<1 | 2 | 3>(1)
  const [dragId, setDragId] = useState<LineId | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(640)

  const prog = order.filter((l) => !off.includes(l))
  const outcome = OUTCOMES[PROGRAM_OUTCOME[prog.join('')]]
  const tr = traceProgram(prog)
  const v = VERDICT[tr.verdict]
  const shownIter = tr.crash ? Math.min(iter, tr.crash.iter) : iter
  const notes = tr.notes[shownIter - 1] ?? []
  const noteFor = (id: LineId) => {
    const i = prog.indexOf(id)
    return i >= 0 ? notes[i] : undefined
  }

  const move = (id: LineId, d: -1 | 1) => {
    const i = order.indexOf(id)
    const j = i + d
    if (j < 0 || j >= order.length) return
    const next = [...order]
    ;[next[i], next[j]] = [next[j], next[i]]
    setOrder(next)
  }
  const toggle = (id: LineId) => setOff(off.includes(id) ? off.filter((x) => x !== id) : [...off, id])

  const onDown = (e: PointerEvent<HTMLButtonElement>, id: LineId) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragId(id)
  }
  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!dragId || !listRef.current) return
    const rows = Array.from(listRef.current.querySelectorAll<HTMLElement>('[data-row]'))
    const others = order.filter((x) => x !== dragId)
    let target = 0
    rows.forEach((r) => {
      if (r.dataset.row === dragId) return
      const b = r.getBoundingClientRect()
      if (e.clientY > b.top + b.height / 2) target++
    })
    const next = [...others.slice(0, target), dragId, ...others.slice(target)]
    if (next.join('') !== order.join('')) setOrder(next)
  }
  const onUp = () => setDragId(null)
  const onKey = (e: KeyboardEvent, id: LineId) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      move(id, -1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      move(id, 1)
    }
  }

  const shuffle = () => {
    // a deterministic cycle of instructive orders
    const pool: LineId[][] = [
      ['F', 'C', 'B', 'S', 'Z'],
      ['C', 'Z', 'F', 'B', 'S'],
      ['F', 'C', 'S', 'B', 'Z'],
      ['S', 'Z', 'F', 'C', 'B'],
      ['Z', 'F', 'B', 'C', 'S'],
      ['F', 'C', 'B', 'Z', 'S'],
    ]
    const k = (pool.findIndex((p) => p.join('') === order.join('')) + 1) % pool.length
    setOrder(pool[k])
    setOff([])
  }

  // loss curves on a log10 scale
  const toPts = (c: (number | null)[]): [number, number][] =>
    c.flatMap((y, i) => (y == null ? [] : [[i, Math.log10(Math.max(0.01, Math.min(100, y)))] as [number, number]]))
  const cur = toPts(outcome.curve)
  const last = outcome.curve[outcome.curve.length - 1]
  const btn: React.CSSProperties = {
    width: 26,
    height: 24,
    border: '1px solid var(--rule)',
    borderRadius: 6,
    background: 'var(--surface)',
    color: 'var(--ink-2)',
    font: 'inherit',
    fontSize: 13,
    lineHeight: 1,
    cursor: 'pointer',
    padding: 0,
  }

  const cards = (
    <div style={{ display: 'grid', gap: 6, minWidth: 0 }}>
      <div style={{ fontFamily: MONO, fontSize: 12.5, color: 'var(--ink-3)' }}>
        <Py code="for inputs, targets in train_loader:" size={narrow ? 12 : 13} />
      </div>
      <div ref={listRef} style={{ display: 'grid', gap: 6, paddingLeft: narrow ? 8 : 10, borderLeft: '2px dotted var(--rule)', marginLeft: 4 }}>
        {order.map((id, i) => {
          const isOff = off.includes(id)
          const note = noteFor(id)
          return (
            <div
              key={id}
              data-row={id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 6px 6px 4px',
                borderRadius: 10,
                border: `1.5px solid ${dragId === id ? 'var(--accent)' : 'var(--rule)'}`,
                background: dragId === id ? 'var(--accent-soft)' : 'var(--surface-2)',
                boxShadow: dragId === id ? '0 6px 16px -8px rgba(0,0,0,0.35)' : undefined,
                transition: 'background 0.15s, border-color 0.15s',
              }}
            >
              <button
                type="button"
                aria-label={`Drag to reorder ${LINE_CODE[id]} (or use the arrow keys)`}
                onPointerDown={(e) => onDown(e, id)}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
                onKeyDown={(e) => onKey(e, id)}
                style={{ ...btn, width: 22, height: 34, border: 'none', background: 'transparent', cursor: 'grab', touchAction: 'none', color: 'var(--ink-3)', fontSize: 16 }}
              >
                ⠿
              </button>
              <div style={{ flex: '1 1 auto', minWidth: 0, opacity: isOff ? 0.45 : 1 }}>
                <div style={{ lineHeight: 1.45 }}>
                  <Py code={LINE_CODE[id]} size={narrow ? 12 : 12.8} style={{ textDecoration: isOff ? 'line-through' : undefined }} />
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.35, marginTop: 2, color: isOff ? 'var(--ink-3)' : note ? toneColour[note.tone] : 'var(--ink-3)', fontWeight: 600 }}>
                  {isOff ? 'removed' : note ? note.text : tr.crash ? 'never reached' : ''}
                </div>
              </div>
              <div style={{ display: 'grid', gap: 3, flex: 'none' }}>
                <button type="button" style={btn} onClick={() => move(id, -1)} disabled={i === 0} aria-label={`Move ${LINE_CODE[id]} up`}>
                  ↑
                </button>
                <button type="button" style={btn} onClick={() => move(id, 1)} disabled={i === order.length - 1} aria-label={`Move ${LINE_CODE[id]} down`}>
                  ↓
                </button>
              </div>
              <button
                type="button"
                style={{ ...btn, height: 51, flex: 'none', color: isOff ? 'var(--accent)' : 'var(--ink-3)' }}
                onClick={() => toggle(id)}
                aria-label={isOff ? `Put back ${LINE_CODE[id]}` : `Remove ${LINE_CODE[id]}`}
                title={isOff ? 'put back' : 'remove'}
              >
                {isOff ? '↺' : '✕'}
              </button>
            </div>
          )
        })}
      </div>
      <Segmented
        label="Trace what each line does in iteration"
        value={iter}
        onChange={setIter}
        options={[
          { value: 1, label: '1' },
          { value: 2, label: '2' },
          { value: 3, label: '3' },
        ]}
      />
    </div>
  )

  const crashAt = tr.crash ? cur[cur.length - 1] : null
  const plots = (
    <div style={{ display: 'grid', gap: 8, minWidth: 0, alignContent: 'start' }}>
      <div style={{ borderLeft: `4px solid ${v.colour}`, background: `color-mix(in srgb, ${v.colour} 9%, var(--surface))`, borderRadius: 8, padding: '0.5rem 0.7rem', fontSize: 13.5, lineHeight: 1.45 }}>
        <div style={{ fontWeight: 750, color: v.colour, marginBottom: 2 }}>{v.title}</div>
        <div style={{ color: 'var(--ink-2)' }}>{explain(prog, tr, outcome.err?.msg.split(': [')[0])}</div>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 650, color: 'var(--ink-2)', marginBottom: -4 }}>Training loss after each iteration (log scale)</div>
      <Plot x={[0, ITERS]} y={[-2, 2]} width={420} height={230} minHeight={200} margin={{ left: 46, bottom: 36, top: 10 }} ariaLabel="Training loss (log scale) against iteration for the chosen loop order, with the correct order as a dashed reference">
        <Grid xTicks={6} yTicks={4} />
        <Axes xLabel="iteration" xTicks={6} yTicks={4} hideYTicks />
        {[-2, -1, 0, 1, 2].map((t) => (
          <Label key={t} x={0} y={t} dx={-8} dy={4} anchor="end" color="var(--viz-axis)" size={11.5}>
            {['0.01', '0.1', '1', '10', '100'][t + 2]}
          </Label>
        ))}
        <Path points={toPts(CORRECT.curve)} color="var(--viz-muted)" width={2} dash="5 4" />
        {tr.verdict !== 'learns' && <Label x={ITERS} y={Math.log10(CORRECT.curve[ITERS] ?? 0.03)} dx={-4} dy={-8} anchor="end" color="var(--viz-muted)" size={11.5}>correct order</Label>}
        <Path points={cur} color={v.colour} width={2.6} />
        {crashAt && (
          <>
            <Dots points={[{ x: crashAt[0], y: crashAt[1], shape: 'cross', color: 'var(--bad)', r: 7 }]} />
            <Label x={crashAt[0]} y={crashAt[1]} dx={12} dy={-10} color="var(--bad)" weight={700} size={12.5}>
              crashed in iteration {tr.crash!.iter}
            </Label>
          </>
        )}
      </Plot>
      <div style={{ fontSize: 12.5, fontWeight: 650, color: 'var(--ink-2)', marginBottom: -4 }}>
        The data (grey) and the model's curve {tr.crash ? 'when it crashed' : `after ${ITERS} iterations`}
      </div>
      <Plot x={[-2, 2]} y={[-1.7, 1.7]} width={420} height={150} minHeight={140} margin={{ left: 34, bottom: 30, top: 14 }} ariaLabel="The data points and the model's curve after training">
        <Grid xTicks={4} yTicks={3} />
        <Axes xTicks={4} yTicks={3} xLabel="x" />
        <Dots points={DATA_X.map((x, i) => ({ x, y: DATA_Y[i], r: 2.6, color: 'var(--viz-muted)' }))} stroke="none" />
        <Path points={GRID_X.map((x, i) => [x, outcome.fit[i]] as [number, number])} color={v.colour} width={2.6} />
      </Plot>
    </div>
  )

  return (
    <Figure
      wide
      title="Put the five lines in order"
      caption={
        <>
          The cards are the body of the training loop. Drag a card by its handle (or use the arrows) and switch lines off with ✕. All 326 possible loop bodies were run in real PyTorch: a small
          network learning the grey dots, 90 iterations of batches of 8. The trace under each card says what that line did in the chosen iteration. Try: the starting order (step before backward),
          removing <code>zero_grad()</code>, and moving <code>step()</code> to the top.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: 16, alignItems: 'start' }}>
        {cards}
        {plots}
      </div>
      <Controls>
        <Button onClick={shuffle}>Try another order</Button>
        <Button
          onClick={() => {
            setOrder(['Z', 'F', 'C', 'B', 'S'])
            setOff([])
          }}
        >
          Show the correct order
        </Button>
        <Readout
          items={[
            ['loss now', tr.crash ? 'crashed' : fmt(last)],
            ['correct order', fmt(CORRECT.curve[ITERS])],
          ]}
        />
      </Controls>
    </Figure>
  )
}
