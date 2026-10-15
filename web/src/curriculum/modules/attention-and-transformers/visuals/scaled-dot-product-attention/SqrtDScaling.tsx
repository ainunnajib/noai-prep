import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Button, Plot, Axes, Rect, VLine, Label, Bars, useBump, useNarrow, mulberry32 } from '../../../../../kit'
import { softmaxRow } from './Mat'
import s from './sdpa.module.css'

/*
  Why divide by √d_k. Real random vectors q and k with N(0, 1) entries:
  left, a histogram of 1,200 dot products q·k (optionally divided by √d_k);
  right, one query against 8 keys: the softmax weights and the slope p(1 − p) of the top weight.
*/

const N_PAIRS = 1200
const N_KEYS = 8
const XLIM = 70

/** Standard normal samples from a seeded uniform generator (Box–Muller). */
function normals(rnd: () => number, n: number): Float64Array {
  const out = new Float64Array(n)
  for (let i = 0; i < n; i += 2) {
    const u = Math.max(1e-12, rnd())
    const v = rnd()
    const r = Math.sqrt(-2 * Math.log(u))
    out[i] = r * Math.cos(2 * Math.PI * v)
    if (i + 1 < n) out[i + 1] = r * Math.sin(2 * Math.PI * v)
  }
  return out
}

function dots(rnd: () => number, d: number, n: number): number[] {
  const q = normals(rnd, n * d)
  const k = normals(rnd, n * d)
  const out: number[] = []
  for (let p = 0; p < n; p++) {
    let acc = 0
    for (let t = 0; t < d; t++) acc += q[p * d + t] * k[p * d + t]
    out.push(acc)
  }
  return out
}

function oneRow(rnd: () => number, d: number): number[] {
  const q = normals(rnd, d)
  const out: number[] = []
  for (let j = 0; j < N_KEYS; j++) {
    const k = normals(rnd, d)
    let acc = 0
    for (let t = 0; t < d; t++) acc += q[t] * k[t]
    out.push(acc)
  }
  return out
}

const std = (xs: number[]) => {
  const m = xs.reduce((a, b) => a + b, 0) / xs.length
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length)
}

export default function SqrtDScaling() {
  const [p, setP] = useState(6)
  const [scaled, setScaled] = useState(false)
  const [seed, bump] = useBump()
  const [ref, narrow] = useNarrow<HTMLDivElement>(640)
  const d = 2 ** p
  const root = Math.sqrt(d)

  const raw = useMemo(() => dots(mulberry32(9001 + 31 * p + 7777 * seed), d, N_PAIRS), [d, p, seed])
  const rowRaw = useMemo(() => oneRow(mulberry32(4242 + 17 * p + 5555 * seed), d), [d, p, seed])

  const scores = scaled ? raw.map((v) => v / root) : raw
  const row = scaled ? rowRaw.map((v) => v / root) : rowRaw
  const w = softmaxRow(row)
  const sd = std(scores)
  const top = Math.max(...w)
  const slope = top * (1 - top)
  const outside = scores.filter((v) => Math.abs(v) > XLIM).length
  // The x-axis stays fixed so the spreads can be compared; narrow spreads get finer bins so their shape still shows.
  const BIN = sd < 2.5 ? 0.5 : sd < 6 ? 1 : 2.5

  const bins = useMemo(() => {
    const nb = Math.round((2 * XLIM) / BIN)
    const c = new Array(nb).fill(0)
    for (const v of scores) {
      const b = Math.floor((v + XLIM) / BIN)
      if (b >= 0 && b < nb) c[b]++
    }
    return c
  }, [scores, BIN])
  const maxC = Math.max(...bins)

  const health = slope > 0.12 ? 'healthy' : slope > 0.03 ? 'weak' : 'almost zero'
  const healthColour = slope > 0.12 ? 'var(--viz-pos)' : slope > 0.03 ? 'var(--viz-2)' : 'var(--viz-neg)'

  return (
    <Figure
      wide
      title="Why divide by √dₖ: bigger vectors, bigger scores"
      caption={
        <>
          Each score is the dot product of two random vectors whose {d} entries each have mean 0 and variance 1. Slide d<sub>k</sub> up with scaling off:
          the scores spread out like √d<sub>k</sub> (their standard deviation is about {root.toFixed(1)}), and the softmax of one row turns almost one-hot,
          so the top weight's slope p(1 − p) collapses towards 0 and learning stalls. Switch scaling on: dividing by √d<sub>k</sub> pulls the spread back to
          about 1 at every size, and the weights stay soft.
        </>
      }
    >
      <Controls>
        <Slider label={<>key/query length d<sub>k</sub></>} value={p} min={1} max={9} step={1} onChange={setP} format={(v) => String(2 ** v)} />
        <Toggle label={<>divide scores by √d<sub>k</sub></>} checked={scaled} onChange={setScaled} />
        <Button onClick={bump}>New random vectors</Button>
      </Controls>

      <div ref={ref} className={`${s.panels} ${narrow ? '' : s.panels2}`}>
        <div>
          <div className={s.panelTitle}>
            {N_PAIRS.toLocaleString('en-GB')} scores {scaled ? <>q·k / √{d}</> : <>q·k</>}
          </div>
          <Plot x={[-XLIM, XLIM]} y={[0, maxC * 1.18]} width={440} height={220} margin={{ top: 12, right: 10, bottom: 30, left: 12 }} ariaLabel={`Histogram of ${N_PAIRS} attention scores with standard deviation ${sd.toFixed(1)}`}>
            <Axes xTicks={7} hideYTicks />
            {bins.map((c, b) =>
              c > 0 ? <Rect key={b} x0={-XLIM + b * BIN} x1={-XLIM + (b + 1) * BIN - BIN * 0.14} y0={0} y1={c} fill={scaled ? 'var(--viz-3)' : 'var(--viz-2)'} /> : null,
            )}
            <VLine x={-sd} color="var(--viz-ink)" dash="4 4" width={1.2} />
            <VLine x={sd} color="var(--viz-ink)" dash="4 4" width={1.2} />
            <Label x={Math.min(sd, XLIM - 30)} y={maxC * 1.08} dx={6} color="var(--viz-ink)">
              ±1 std = {sd.toFixed(1)}
            </Label>
          </Plot>
          <div className={s.panelNote}>
            The dashed lines mark one standard deviation either side of 0. The axis never changes, so you can compare spreads.
            {outside > 0 ? ` ${outside} scores fall off the chart.` : ''}
          </div>
        </div>
        <div>
          <div className={s.panelTitle}>One query against {N_KEYS} keys: softmax weights</div>
          <Bars
            data={w.map((v, k) => ({ label: `key ${k + 1}`, value: v, strong: v === top, color: scaled ? 'var(--viz-3)' : 'var(--viz-2)' }))}
            max={1}
            format={(v) => v.toFixed(3)}
            ariaLabel="Softmax weights of one row of attention"
          />
          <div className={s.meter} style={{ marginTop: '0.75rem' }}>
            <div className={s.meterHead}>
              <span>
                slope of the top weight, p(1 − p) = {top.toFixed(3)} × {(1 - top).toFixed(3)}
              </span>
            </div>
            <div className={s.meterTrack} aria-hidden="true">
              <span className={s.meterFill} style={{ width: `${(slope / 0.25) * 100}%`, background: healthColour }} />
            </div>
            <div className={s.meterHead}>
              <span className={s.mono}>{slope.toFixed(3)}</span>
              <span style={{ color: healthColour, fontWeight: 800 }}>{health}</span>
            </div>
          </div>
        </div>
      </div>
      <Readout
        items={[
          [<>d<sub>k</sub></>, String(d)],
          [<>√d<sub>k</sub></>, root.toFixed(2)],
          ['measured std of scores', sd.toFixed(2)],
          ['top weight', top.toFixed(3)],
        ]}
      />
    </Figure>
  )
}
