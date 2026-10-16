import { useState } from 'react'
import { Figure, Controls, Toggle, Button, Readout, useContainerWidth } from '../../../../../kit'
import css from './autograd.module.css'

/*
  One weight, w, in the running example L = (w*x + b - y)^2 with x = 3, b = 1, y = 5, so one
  backward pass gives dL/dw = 2(3w - 4) * 3 = 18w - 24 (12 at w = 2). w.grad is drawn as a bar
  built from one block per backward() call, so accumulation is visible. All arithmetic is done
  in float32 (Math.fround), like PyTorch, and printed the way PyTorch prints scalars.
*/

const f = Math.fround
const LR = 0.05
const lossAt = (w: number) => f(f(f(f(3 * w) + 1) - 5) ** 2)
const gradAt = (w: number) => f(f(2 * f(f(f(3 * w) + 1) - 5)) * 3)

/** PyTorch-style scalar printing: 12. / 1.4000 */
const num = (v: number) => (Number.isInteger(v) ? `${v}.` : v.toFixed(4))
const tensor = (v: number, rg = false) => `tensor(${num(v)}${rg ? ', requires_grad=True' : ''})`
/** plain number for readouts: at most 4 decimals, no trailing zeros */
const plain = (v: number) => String(Math.round(v * 10000) / 10000).replace('-', '−')

const SECOND_ERR =
  'RuntimeError: Trying to backward through the graph a second time (or directly access saved tensors after they have already been freed). Saved intermediate values of the graph are freed when you call .backward() or autograd.grad(). Specify retain_graph=True if you need to backward through the graph a second time or if you need to access saved tensors after calling backward.'

interface Entry {
  code: string
  out?: string
  err?: boolean
}

interface State {
  w: number
  grads: number[] | null
  /** the graph of the last loss: none yet, still alive, or already freed by backward */
  graph: 'none' | 'live' | 'freed'
  log: Entry[]
}

const START: State = {
  w: 2,
  grads: [gradAt(2)],
  graph: 'freed',
  log: [
    { code: 'L = (w * x + b - y) ** 2' },
    { code: 'L.backward()' },
    { code: 'w.grad', out: tensor(gradAt(2)) },
  ],
}

export default function GradAccumulationCounter() {
  const [s, setS] = useState<State>(START)
  const [retain, setRetain] = useState(false)
  const [ref, cw] = useContainerWidth<HTMLDivElement>(520)
  const total = s.grads ? s.grads.reduce((a, b) => f(a + b), 0) : null
  const one = gradAt(s.w)

  const push = (st: State, entries: Entry[]): State => ({ ...st, log: [...st.log, ...entries].slice(-9) })
  const bw = retain ? 'L.backward(retain_graph=True)' : 'L.backward()'

  const forwardBackward = () =>
    setS((st) => {
      const g = gradAt(st.w)
      const grads = [...(st.grads ?? []), g]
      const t = grads.reduce((a, b) => f(a + b), 0)
      return push({ ...st, grads, graph: retain ? 'live' : 'freed' }, [{ code: 'L = (w * x + b - y) ** 2' }, { code: bw }, { code: 'w.grad', out: tensor(t) }])
    })
  const backwardAgain = () =>
    setS((st) => {
      if (st.graph !== 'live') return push(st, [{ code: bw }, { code: SECOND_ERR, err: true }])
      const grads = [...(st.grads ?? []), gradAt(st.w)]
      const t = grads.reduce((a, b) => f(a + b), 0)
      return push({ ...st, grads, graph: retain ? 'live' : 'freed' }, [{ code: bw }, { code: 'w.grad', out: tensor(t) }])
    })
  const zeroGrad = () => setS((st) => push({ ...st, grads: null }, [{ code: 'optimizer.zero_grad()' }, { code: 'w.grad', out: 'None' }]))
  const step = () =>
    setS((st) => {
      if (!st.grads) return push(st, [{ code: 'optimizer.step()' }, { code: '# w.grad is None, so step() leaves w unchanged', out: undefined }])
      const t = st.grads.reduce((a, b) => f(a + b), 0)
      const w = f(st.w - f(LR * t))
      return push({ ...st, w, graph: 'none' }, [{ code: `optimizer.step()   # w -= ${LR} * w.grad` }, { code: 'w', out: tensor(w, true) }])
    })

  // bar geometry
  const W = Math.max(260, Math.min(cw, 560))
  const contribs = s.grads ?? []
  const pos = contribs.reduce((a, c) => a + Math.max(0, c), 0)
  const neg = contribs.reduce((a, c) => a + Math.min(0, c), 0)
  const hi = Math.max(pos, one, 12) * 1.08
  const lo = Math.min(neg, one, 0) * 1.08
  const pad = 14
  const X = (v: number) => pad + ((v - lo) / (hi - lo || 1)) * (W - 2 * pad)
  const barY = 34
  const barH = 30
  let acc = 0
  const segs = contribs.map((c, i) => {
    const a = acc
    acc = f(acc + c)
    return { x0: X(Math.min(a, acc)), x1: X(Math.max(a, acc)), c, i, end: acc }
  })
  const H = 112

  return (
    <Figure
      title="Gradients pile up until you zero them"
      caption={
        <>
          <code>w.grad</code> is drawn as one block per <code>backward()</code> call. Press <b>forward + backward</b> again and the bar doubles: PyTorch{' '}
          <b>adds</b> the new gradient to <code>.grad</code>. Then try <code>optimizer.step()</code> without zeroing and see how far w jumps, or call{' '}
          <code>backward()</code> twice on the same loss (it fails unless you keep the graph with <code>retain_graph=True</code>).
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }} role="img" aria-label={`w.grad is ${total == null ? 'None' : num(total)}, made of ${contribs.length} backward calls`}>
          <text x={pad} y={16} style={{ fontSize: 12.5, fontWeight: 700, fill: 'var(--ink-2)' }}>
            w.grad = {total == null ? 'None' : tensor(total)}
          </text>
          <rect x={pad} y={barY} width={W - 2 * pad} height={barH} rx={6} style={{ fill: 'var(--surface-2)' }} />
          {segs.map((g) => (
            <g key={g.i}>
              <rect x={g.x0} y={barY} width={Math.max(1, g.x1 - g.x0)} height={barH} rx={4} style={{ fill: `color-mix(in srgb, ${g.i % 2 ? 'var(--viz-5)' : 'var(--viz-1)'} ${g.c >= 0 ? 55 : 30}%, var(--surface))`, stroke: 'var(--surface)', strokeWidth: 2 }} />
              {g.x1 - g.x0 > 34 && (
                <text x={(g.x0 + g.x1) / 2} y={barY + barH / 2} dy="0.35em" textAnchor="middle" style={{ fontSize: 11.5, fontWeight: 700, fill: 'var(--ink)' }}>
                  #{g.i + 1}: {plain(g.c)}
                </text>
              )}
            </g>
          ))}
          {total == null && (
            <text x={W / 2} y={barY + barH / 2} dy="0.35em" textAnchor="middle" style={{ fontSize: 12, fill: 'var(--ink-3)', fontWeight: 700 }}>
              None (cleared by zero_grad)
            </text>
          )}
          <line x1={X(0)} x2={X(0)} y1={barY - 6} y2={barY + barH + 6} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.5 }} />
          <text x={X(0)} y={barY + barH + 18} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ink-3)' }}>
            0
          </text>
          {/* what ONE backward pass at the current w gives */}
          <line x1={X(one)} x2={X(one)} y1={barY - 8} y2={barY + barH + 8} style={{ stroke: 'var(--viz-2)', strokeWidth: 2.5, strokeDasharray: '5 3' }} />
          <text x={X(one) < W / 2 ? Math.max(pad, X(one) - 6) : Math.min(W - pad, X(one) + 6)} y={barY + barH + 34} textAnchor={X(one) < W / 2 ? 'start' : 'end'} style={{ fontSize: 11.5, fontWeight: 700, fill: 'var(--viz-2)' }}>
            the gradient of this step alone: {plain(one)}
          </text>
        </svg>
      </div>

      <div className={css.row} style={{ justifyContent: 'center' }}>
        <Button primary onClick={forwardBackward}>
          forward + backward()
        </Button>
        <Button onClick={backwardAgain} disabled={s.graph === 'none'}>
          backward() again, same L
        </Button>
        <Button onClick={zeroGrad}>optimizer.zero_grad()</Button>
        <Button onClick={step}>optimizer.step()</Button>
      </div>
      <Controls>
        <Toggle label={<>keep the graph: <code>retain_graph=True</code></>} checked={retain} onChange={setRetain} />
        <Button
          onClick={() => {
            setS(START)
            setRetain(false)
          }}
        >
          Reset
        </Button>
      </Controls>
      <Readout
        items={[
          ['w', plain(s.w)],
          ['loss L', plain(lossAt(s.w))],
          ['backward calls since zeroing', String(contribs.length)],
          ['step() would change w by', total == null ? '0' : `−${LR} × ${plain(total)} = ${plain(f(-LR * total))}`],
        ]}
      />
      <pre className={css.log} aria-live="polite" aria-label="Python session">
        {s.log.map((e, i) => (
          <span key={i} style={{ display: 'block' }} className={e.err ? css.logErr : undefined}>
            {e.err ? '' : <span className={css.comment}>{'>>> '}</span>}
            {e.code}
            {e.out && (
              <>
                {'\n'}
                <span className={css.logOut}>{e.out}</span>
              </>
            )}
          </span>
        ))}
      </pre>
    </Figure>
  )
}
