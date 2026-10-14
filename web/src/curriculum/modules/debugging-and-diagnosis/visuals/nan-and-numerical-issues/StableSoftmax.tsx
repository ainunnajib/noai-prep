import { useState, type ReactNode } from 'react'
import { Figure, Controls, Slider, Segmented, Button, M } from '../../../../../kit'
import { round, show, type Fmt, F16_MAX, F32_MAX } from './num'
import s from './nan.module.css'

/*
  Three logits go through softmax and cross-entropy in three ways:
    naive        e^z / Σ e^z, then log
    subtract max e^(z−m) / Σ e^(z−m), then log
    log-sum-exp  log p = (z − m) − log Σ e^(z−m)   (never forms a tiny probability)
  Every intermediate value is rounded to float32 (PyTorch's default) or float16, so overflow,
  underflow and nan appear exactly where they would on a GPU. Class 3 is the true class.
  Aha: subtracting the max keeps every exponent ≤ 0 (no overflow) without changing the answer,
  and log-sum-exp also rescues the loss when a probability underflows to 0.
*/

type Method = 'naive' | 'shift' | 'lse'
const TRUE = 2

function compute(z: number[], method: Method, fmt: Fmt) {
  const R = (x: number) => round(fmt, x)
  const zr = z.map(R)
  const m = Math.max(...zr)
  const shifted = method === 'naive' ? zr : zr.map((v) => R(v - m))
  const ex = shifted.map((v) => R(Math.exp(v)))
  const sum = ex.reduce((a, b) => R(a + b), 0)
  let p: number[]
  let logp: number[]
  let logSum = NaN
  if (method === 'lse') {
    logSum = R(Math.log(sum))
    logp = shifted.map((v) => R(v - logSum))
    p = logp.map((v) => R(Math.exp(v)))
  } else {
    p = ex.map((v) => R(v / sum))
    logp = p.map((v) => R(Math.log(v)))
  }
  const loss = R(-logp[TRUE])
  return { zr, m, shifted, ex, sum, p, logp, logSum, loss }
}

function Cell({ v, kind }: { v: number; kind?: 'exp' | 'p' | 'plain' }) {
  const bad = Number.isNaN(v) || !Number.isFinite(v)
  const under = kind === 'exp' && v === 0
  const cls = bad ? s.bad : under ? s.under : undefined
  return <span className={cls}>{show(v)}</span>
}

const PRESETS: { label: string; z: number[] }[] = [
  { label: 'everyday (2, 1, 0.1)', z: [2, 1, 0.1] },
  { label: 'huge (1000, 999, 998)', z: [1000, 999, 998] },
  { label: 'far apart (1000, 0, −1000)', z: [1000, 0, -1000] },
]

export default function StableSoftmax() {
  const [z, setZ] = useState<number[]>([2, 1, 0.1])
  const [method, setMethod] = useState<Method>('naive')
  const [fmt, setFmt] = useState<Fmt>('float32')
  const r = compute(z, method, fmt)
  const ref = compute(z, 'lse', 'float32') // what the answer should be
  const max = fmt === 'float16' ? F16_MAX : F32_MAX
  const limit = Math.log(max)

  const setOne = (i: number, v: number) => setZ((old) => old.map((x, j) => (j === i ? v : x)))

  const probsBad = r.p.some((v) => Number.isNaN(v))
  const lossBad = !Number.isFinite(r.loss)
  const overflowed = r.ex.some((v) => v === Infinity)

  let verdict: ReactNode
  if (probsBad) {
    verdict = (
      <>
        <span className={s.badge}>nan</span>
        <span>
          {overflowed ? (
            <>
              An exponent passed <M>{`e^{${limit.toFixed(1)}}`}</M>, the largest {fmt} number, so it became <b>inf</b>. Then the sum is inf
              and <b>inf ÷ inf = nan</b>.
            </>
          ) : (
            <>Every exponent underflowed to 0, so the sum is 0 and 0 ÷ 0 = nan.</>
          )}
        </span>
      </>
    )
  } else if (lossBad) {
    verdict = (
      <>
        <span className={s.badge}>inf loss</span>
        <span>
          The probabilities are fine, but <M>{'p_3'}</M> underflowed to exactly 0, so the loss <M>{'-\\log p_3 = -\\log 0'}</M> is infinite.
          The true loss is <b>{show(ref.loss)}</b>: switch to <b>log-sum-exp</b>.
        </span>
      </>
    )
  } else {
    verdict = (
      <>
        <span className={`${s.badge} ${s.badgeOk}`}>ok</span>
        <span>
          Probabilities sum to {show(r.p.reduce((a, b) => a + b, 0), 4)} and the loss for class 3 is <b>{show(r.loss)}</b>.
          {method !== 'naive' && <> Every exponent is <M>{'\\le 0'}</M>, so nothing can overflow.</>}
        </span>
      </>
    )
  }

  const header = (tex: string) => <M>{tex}</M>
  const shiftCol = method !== 'naive'

  return (
    <Figure
      title="Softmax by hand, in float32: three ways"
      caption={
        <>
          Every number is rounded to {fmt}, as on a GPU. Start with <b>naive</b> and drag <M>z_1</M> past {limit.toFixed(1)}: one
          exponent becomes inf and all three probabilities become nan. Switch to <b>subtract max</b>: same answer as before, but now the
          largest exponent is always <M>{'e^0 = 1'}</M>. Then press <b>far apart</b>: the probabilities survive, yet the loss is inf
          because <M>{'p_3'}</M> rounds to 0. Only <b>log-sum-exp</b> gets the true loss. Try float16 too: there, <M>{'e^{12}'}</M> already
          overflows.
        </>
      }
    >
      <div className={s.wrap}>
        <Controls>
          <Segmented
            label="Method"
            value={method}
            onChange={setMethod}
            options={[
              { value: 'naive', label: 'naive' },
              { value: 'shift', label: 'subtract max' },
              { value: 'lse', label: 'log-sum-exp' },
            ]}
          />
          <Segmented
            label="Number format"
            value={fmt}
            onChange={setFmt}
            options={[
              { value: 'float32', label: 'float32' },
              { value: 'float16', label: 'float16' },
            ]}
          />
        </Controls>

        <div className={s.tableScroll}>
          <table className={s.table} aria-label="Softmax computation table">
            <thead>
              <tr>
                <th>class</th>
                <th>{header('z')}</th>
                {shiftCol && <th>{header('z-m')}</th>}
                <th>{header(shiftCol ? 'e^{z-m}' : 'e^{z}')}</th>
                <th>{header('p')}</th>
                <th>{header('\\log p')}</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2].map((i) => (
                <tr key={i} className={i === TRUE ? s.trueRow : undefined}>
                  <td>
                    {i + 1}
                    {i === TRUE ? ' (true)' : ''}
                  </td>
                  <td className={s.num}>{show(r.zr[i])}</td>
                  {shiftCol && (
                    <td className={s.num}>
                      <Cell v={r.shifted[i]} />
                    </td>
                  )}
                  <td className={s.num}>
                    <Cell v={r.ex[i]} kind="exp" />
                  </td>
                  <td className={`${s.num} ${s.pcell}`}>
                    {Number.isFinite(r.p[i]) && <span className={s.pbar} style={{ width: `calc(${Math.max(0, Math.min(1, r.p[i])) * 100}% - 0.4rem)` }} />}
                    <Cell v={r.p[i]} kind="p" />
                  </td>
                  <td className={s.num}>
                    <Cell v={r.logp[i]} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>sum</td>
                <td />
                {shiftCol && <td className={`${s.num} ${s.dim}`}>{`m = ${show(r.m)}`}</td>}
                <td className={s.num}>
                  <Cell v={r.sum} />
                </td>
                <td colSpan={2} className={`${s.num} ${s.dim}`}>
                  {method === 'lse' ? (
                    <>
                      log sum = <Cell v={r.logSum} />
                    </>
                  ) : (
                    ''
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className={`${s.verdict} ${probsBad || lossBad ? s.verdictBad : s.verdictOk}`} role="status">
          {verdict}
        </div>

        <Controls>
          {[0, 1, 2].map((i) => (
            <Slider
              key={i}
              label={
                <>
                  logit <M>{`z_${i + 1}`}</M>
                </>
              }
              value={z[i]}
              min={-1000}
              max={1000}
              step={0.5}
              onChange={(v) => setOne(i, v)}
            />
          ))}
        </Controls>
        <div className={s.presets}>
          <span className={s.presetsLabel}>Presets:</span>
          {PRESETS.map((p) => (
            <Button key={p.label} onClick={() => setZ(p.z)}>
              {p.label}
            </Button>
          ))}
        </div>
      </div>
    </Figure>
  )
}
