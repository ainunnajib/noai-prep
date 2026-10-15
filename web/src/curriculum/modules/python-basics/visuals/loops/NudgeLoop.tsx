import { useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Slider, Plot, Grid, Axes, Path, Dots, HLine, Label, usePlayer, PlayerControls, useNarrow } from '../../../../../kit'
import { highlightPy, Py } from '../decisions/pyCode'
import s from '../decisions/ui.module.css'

/*
  The "predict, measure, nudge" loop that learns w so that 2 × w = 6. The plot shows w after
  every pass of the loop closing in on 3 (or overshooting, or flying off), the code pane shows
  the arithmetic of the current pass, and the error bar shrinks as w improves.
  Each pass multiplies the gap (w − 3) by (1 − 2 × lr), which is what the regimes below describe.
*/

const N = 15
const TARGET = 6
const X = 2
const Y_LO = -4
const Y_HI = 10

function trajectory(lr: number) {
  const ws = [0]
  const errs: number[] = []
  let w = 0
  for (let k = 0; k < N; k++) {
    const err = X * w - TARGET
    errs.push(err)
    w = w - lr * err
    ws.push(w)
  }
  return { ws, errs }
}

const f3 = (v: number) => {
  if (!Number.isFinite(v)) return '∞'
  const r = Math.round(v * 1000) / 1000
  return Object.is(r, -0) ? '0' : String(r)
}
const paren = (v: number) => (v < 0 ? `(${f3(v)})` : f3(v))

const PRESETS = [
  { lr: 0.05, label: '0.05 slow' },
  { lr: 0.1, label: '0.1' },
  { lr: 0.3, label: '0.3 fast' },
  { lr: 0.8, label: '0.8 overshoot' },
  { lr: 1.05, label: '1.05 too big' },
]

function regime(lr: number) {
  const r = 1 - X * lr
  if (Math.abs(r) < 1e-9) return { tone: 'ok', text: 'Exactly one nudge lands on 3: the gap is multiplied by 0 on the first pass. A lucky choice that only works because this problem is so simple.' }
  if (r > 0.85) return { tone: 'warn', text: 'Too timid: each nudge is tiny, so w creeps towards 3 and is still far away after 15 passes. It would get there, but slowly.' }
  if (r > 0) return { tone: 'ok', text: 'Smooth: every pass removes a fixed fraction of the gap, so w closes in on 3 without ever passing it.' }
  if (r > -1) return { tone: 'warn', text: 'Overshoot: each nudge jumps past 3, so w zig-zags above and below the target, but the swings shrink and it still settles.' }
  if (Math.abs(r + 1) < 1e-9) return { tone: 'bad', text: 'Stuck bouncing: every nudge overshoots by exactly the gap, so w jumps between 0 and 6 forever.' }
  return { tone: 'bad', text: 'Diverging: each nudge overshoots by more than the gap it was correcting, so the swings grow and w flies off the chart. The learning rate is too big.' }
}

function ErrorBar({ err }: { err: number }) {
  const MAX = 8
  const frac = Math.max(-1, Math.min(1, err / MAX))
  return (
    <div style={{ width: '100%', display: 'grid', gap: '0.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--step--1)', color: 'var(--ink-2)' }}>
        <span>
          <Py>error</Py> this pass
        </span>
        <span className="tabular" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink)' }}>
          {f3(err)}
          {Math.abs(err) > MAX ? ' (off the scale)' : ''}
        </span>
      </div>
      <div style={{ position: 'relative', height: 16, borderRadius: 8, background: 'var(--surface-3)', overflow: 'hidden' }} aria-hidden="true">
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: frac < 0 ? `${50 + frac * 50}%` : '50%',
            width: `${Math.abs(frac) * 50}%`,
            background: Math.abs(err) < 0.05 ? 'var(--viz-pos)' : 'var(--viz-2)',
            transition: 'left .2s, width .2s',
          }}
        />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, marginLeft: -1, background: 'var(--ink)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--ink-3)' }}>
        <span>prediction too small</span>
        <span>0 = perfect</span>
        <span>too big</span>
      </div>
    </div>
  )
}

export default function NudgeLoop() {
  const [lr, setLr] = useState(0.1)
  const [ref, narrow] = useNarrow<HTMLDivElement>(620)
  const { ws, errs } = useMemo(() => trajectory(lr), [lr])
  const player = usePlayer({ steps: N + 1, interval: 600 })
  const { setStep } = player
  useEffect(() => {
    setStep(N)
  }, [lr, setStep])
  const k = Math.min(player.step, N) // passes completed
  const wNow = ws[k]
  const prevW = k > 0 ? ws[k - 1] : 0
  const errPass = k > 0 ? errs[k - 1] : X * 0 - TARGET
  const reg = regime(lr)

  const lines = ['w = 0.0', `lr = ${lr}`, `for step in range(${N}):`, '    prediction = 2 * w', '    error = prediction - 6', '    w = w - lr * error']
  const visible = ws.slice(0, k + 1).map((w, i) => [i, w] as [number, number])
  const inChart = visible.filter(([, w]) => w >= Y_LO && w <= Y_HI)

  return (
    <Figure
      wide
      title="A loop that learns: predict, measure, nudge"
      caption={
        <>
          Press <strong>Play</strong> to run the loop one pass at a time: the error shrinks and <code>w</code> closes in on 3, the number that makes{' '}
          <code>2 * w</code> equal 6. Then change the learning rate <code>lr</code>. Small values crawl, medium values glide in, and values above 0.5
          overshoot. Above 1 every nudge overshoots by more than it fixes, and <code>w</code> explodes. The visual runs 15 passes; the code above printed only the first 5.
        </>
      }
    >
      <div ref={ref} className={s.wrap}>
        <div className={narrow ? s.stack : s.cols} style={narrow ? undefined : { gridTemplateColumns: 'minmax(0, 0.95fr) minmax(0, 1.05fr)' }}>
          <div className={s.stack}>
            <div className={s.pane}>
              <div className={s.bar}>
                <span>learn_w.py</span>
                <span>
                  pass {k} of {N}
                </span>
              </div>
              <ol className={s.lines} aria-label="The learning loop">
                {lines.map((l, i) => {
                  const inBody = i >= 3
                  const cls = k > 0 && inBody ? s.lineNow : k > 0 && i === 2 ? s.lineRun : ''
                  return (
                    <li key={i} className={`${s.line} ${cls}`}>
                      <span className={s.gutter}>
                        <span className={s.mark} />
                        <span>{i + 1}</span>
                      </span>
                      <span className={s.code}>{highlightPy(l)}</span>
                    </li>
                  )
                })}
              </ol>
            </div>
            <div className={s.status} aria-live="polite">
              {k === 0 ? (
                <>
                  First guess: <Py>w = 0.0</Py>, so the prediction is <Py>2 * 0.0 = 0.0</Py>, which is 6 too small. Press <strong>Next</strong>.
                </>
              ) : (
                <div className={s.trace}>
                  <div>
                    <strong style={{ fontFamily: 'var(--font-body)' }}>Pass {k}</strong>
                  </div>
                  <Py>{`prediction = 2 × ${paren(prevW)} = ${f3(X * prevW)}`}</Py>
                  <Py>{`error = ${f3(X * prevW)} − 6 = ${f3(errPass)}`}</Py>
                  <Py>{`w = ${f3(prevW)} − ${lr} × ${paren(errPass)} = ${f3(wNow)}`}</Py>
                </div>
              )}
            </div>
          </div>
          <div className={s.stack}>
            <Plot x={[0, N]} y={[Y_LO, Y_HI]} width={440} height={380} minHeight={260} margin={{ left: 36, bottom: 34, top: 14, right: 14 }} ariaLabel={`w after each pass of the loop with learning rate ${lr}. After ${k} passes w is ${f3(wNow)}.`}>
              <Grid xTicks={N} yTicks={7} />
              <Axes xLabel="pass" yLabel="w" xTicks={5} yTicks={7} />
              <HLine y={3} color="var(--viz-pos)" dash="6 4" width={2} />
              <Path points={visible} color="var(--viz-1)" width={2.25} />
              <Dots points={inChart.map(([x, y], i) => ({ x, y, r: i === inChart.length - 1 && inChart[inChart.length - 1][0] === k ? 6.5 : 4 }))} color="var(--viz-1)" />
              {(wNow > Y_HI || wNow < Y_LO) && (
                <Label x={N / 2} y={wNow > Y_HI ? Y_HI - 1.2 : Y_LO + 0.8} anchor="middle" color="var(--viz-neg)" weight={700}>
                  w = {f3(wNow)}: off the chart
                </Label>
              )}
            </Plot>
            <div className={s.legend} style={{ justifyContent: 'center' }}>
              <span className={s.legendItem}>
                <span className={s.swatch} style={{ background: 'var(--viz-1)', height: 4, borderRadius: 2 }} />
                <code>w</code> after each pass
              </span>
              <span className={s.legendItem}>
                <span className={s.swatch} style={{ background: 'repeating-linear-gradient(90deg, var(--viz-pos) 0 5px, transparent 5px 8px)', height: 3 }} />
                target: <code>w = 3</code>
              </span>
            </div>
            <ErrorBar err={k === 0 ? -6 : errPass} />
          </div>
        </div>
        <div className={`${s.status} ${reg.tone === 'ok' ? s.statusOk : reg.tone === 'bad' ? s.statusBad : s.statusWarn}`}>
          <strong>lr = {lr}:</strong> {reg.text} Each pass multiplies the gap <Py>w - 3</Py> by <Py>{`1 - 2 * lr = ${f3(1 - X * lr)}`}</Py>.
        </div>
        <PlayerControls player={player} label={(st) => `Pass ${Math.min(st, N)} of ${N} · w = ${f3(ws[Math.min(st, N)])}`} />
        <div className={s.chips}>
          <span style={{ fontSize: 'var(--step--1)', fontWeight: 700, color: 'var(--ink-2)' }}>Try lr =</span>
          {PRESETS.map((p) => (
            <button key={p.lr} type="button" className={`${s.chip} ${lr === p.lr ? s.chipOn : ''}`} onClick={() => setLr(p.lr)}>
              {p.label}
            </button>
          ))}
        </div>
        <Controls>
          <Slider label={<>learning rate <code>lr</code></>} value={lr} min={0.01} max={1.1} step={0.01} onChange={(v) => setLr(Math.round(v * 100) / 100)} />
        </Controls>
      </div>
    </Figure>
  )
}
