import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Axes, Rect, VLine, Label, Dots, mulberry32, M, type DotDatum } from '../../../../../kit'
import { f16, F16_MAX, F16_MIN_NORMAL, F16_MIN_SUB, show } from './num'
import s from './nan.module.css'

/*
  Mixed-precision training stores gradients in float16, which can only hold positive numbers from
  about 6e-8 (smaller ones round to 0) up to 65504 (bigger ones become inf).
  48 typical gradient sizes (log-normal around 2.5e-8) are drawn on a log axis. Multiplying the loss
  by S multiplies every gradient by S (chain rule), sliding the whole cloud right.
  S too small: many gradients underflow to 0, so those weights silently stop learning.
  S too big: some overflow to inf; GradScaler then skips the step and halves S.
  Every dot's fate is computed by rounding S·g to float16 with f16().
*/

const N = 48

function gradients(): number[] {
  const rnd = mulberry32(20270219)
  const out: number[] = []
  for (let i = 0; i < N; i++) {
    // Box–Muller: log10 g ~ Normal(−7.6, 1.1)
    const u = Math.max(1e-9, rnd())
    const v = rnd()
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
    out.push(10 ** (-7.6 + 1.1 * Math.max(-2.6, Math.min(2.6, z))))
  }
  return out
}

const LO = -12
const HI = 8
const fmtTick = (v: number) => (v === 0 ? '1' : `1e${v}`)

export default function LossScaleWindow() {
  const [k, setK] = useState(0)
  const S = 2 ** k
  const g = useMemo(gradients, [])
  const rows = useMemo(() => {
    const rnd = mulberry32(7)
    return g.map(() => rnd())
  }, [g])

  const scaled = g.map((v) => f16(v * S))
  const under = scaled.filter((v) => v === 0).length
  const over = scaled.filter((v) => v === Infinity).length
  const sub = scaled.filter((v) => v > 0 && v < F16_MIN_NORMAL).length

  const top: DotDatum[] = g.map((v, i) => ({ x: Math.log10(v), y: 0.6 + 0.32 * rows[i], r: 3.5, color: 'var(--viz-muted)' }))
  const bottom: DotDatum[] = g.map((v, i) => {
    const sv = v * S
    const q = scaled[i]
    const x = Math.max(LO + 0.1, Math.min(HI - 0.1, Math.log10(sv)))
    const y = 0.06 + 0.36 * rows[i]
    if (q === 0) return { x, y, r: 4.5, color: 'var(--viz-neg)', shape: 'cross' as const }
    if (q === Infinity) return { x, y, r: 4.5, color: 'var(--viz-neg)', shape: 'cross' as const }
    if (q < F16_MIN_NORMAL) return { x, y, r: 4, color: 'var(--viz-2)', hollow: true }
    return { x, y, r: 4, color: 'var(--viz-1)' }
  })

  const lsub = Math.log10(F16_MIN_SUB / 2) // below this, float16 rounds to 0
  const lnorm = Math.log10(F16_MIN_NORMAL)
  const lmax = Math.log10(F16_MAX)

  let verdict: string
  if (over > 0) verdict = `${over} gradient${over > 1 ? 's' : ''} overflowed to inf: GradScaler skips this update and halves S.`
  else if (under > 0) verdict = `${under} of ${N} gradients rounded to exactly 0: those weights silently stop learning. Raise S.`
  else verdict = `Every gradient fits. After backward(), dividing by S in float32 recovers the true values.`

  return (
    <Figure
      title="Loss scaling: slide the gradients into float16's window"
      caption={
        <>
          Grey dots: true gradient sizes (tiny, mostly between <M>{'10^{-10}'}</M> and <M>{'10^{-5}'}</M>). Coloured dots: the same gradients after multiplying the loss
          by <M>S</M>, stored in float16. At <M>S = 1</M>, red crosses have underflowed to 0. Slide <M>S</M> up: the whole cloud moves right
          into the shaded window. Push it too far and the top ones overflow to inf. The default in PyTorch's GradScaler is{' '}
          <M>{'S = 2^{16} = 65\\,536'}</M>.
        </>
      }
    >
      <Plot x={[LO, HI]} y={[0, 1]} width={560} height={240} minHeight={270} margin={{ left: 14, right: 14, top: 26, bottom: 34 }} ariaLabel="Gradient sizes on a logarithmic axis with the float16 range shaded">
        <Rect x0={LO} x1={lsub} y0={0} y1={0.5} fill="color-mix(in srgb, var(--viz-neg) 12%, var(--surface))" />
        <Rect x0={lmax} x1={HI} y0={0} y1={0.5} fill="color-mix(in srgb, var(--viz-neg) 12%, var(--surface))" />
        <Rect x0={lsub} x1={lnorm} y0={0} y1={0.5} fill="color-mix(in srgb, var(--viz-2) 14%, var(--surface))" />
        <Rect x0={lnorm} x1={lmax} y0={0} y1={0.5} fill="color-mix(in srgb, var(--viz-3) 16%, var(--surface))" />
        <VLine x={lsub} color="var(--viz-neg)" dash="4 3" />
        <VLine x={lmax} color="var(--viz-neg)" dash="4 3" />
        <Label x={(lnorm + lmax) / 2} y={0.5} dy={14} anchor="middle" color="var(--ink-2)" size={11}>
          float16 window
        </Label>
        <Label x={LO + 0.2} y={0.5} dy={14} anchor="start" color="var(--viz-neg)" size={11} weight={700}>
          → 0
        </Label>
        <Label x={HI - 0.2} y={0.5} dy={14} anchor="end" color="var(--viz-neg)" size={11} weight={700}>
          → inf
        </Label>
        <Label x={LO + 0.2} y={0.98} dy={2} anchor="start" color="var(--ink-2)" size={11}>
          true gradients g
        </Label>
        <Label x={LO + 0.2} y={0.5} dy={-4} anchor="start" color="var(--ink-2)" size={11}>
          {`S·g in float16`}
        </Label>
        <Dots points={top} />
        <Dots points={bottom} />
        <Axes hideYTicks xTicks={5} tickFormat={fmtTick} />
      </Plot>
      <div className={s.legend} aria-hidden="true">
        <span>
          <i className={s.sw} style={{ background: 'var(--viz-1)', borderColor: 'var(--viz-1)' }} /> stored normally
        </span>
        <span>
          <i className={s.sw} style={{ background: 'var(--surface)', borderColor: 'var(--viz-2)' }} /> subnormal: kept, but with fewer digits
        </span>
        <span>
          <b className={s.crossMark}>×</b> lost: rounded to 0 or to inf
        </span>
      </div>
      <Controls>
        <Slider label={<>loss scale <M>S</M></>} value={k} min={0} max={36} step={1} onChange={setK} format={(v) => (v === 0 ? '1' : `2^${v} = ${show(2 ** v, 5)}`)} />
        <Readout
          items={[
            ['→ 0 (lost)', `${under} / ${N}`],
            ['subnormal (blurry)', `${sub}`],
            ['→ inf', `${over}`],
          ]}
        />
      </Controls>
      <div className={`${s.verdict} ${over > 0 || under > 0 ? s.verdictBad : s.verdictOk}`} role="status">
        <span className={`${s.badge} ${over > 0 || under > 0 ? '' : s.badgeOk}`}>{over > 0 ? 'skip step' : under > 0 ? 'underflow' : 'ok'}</span>
        <span>{verdict}</span>
      </div>
    </Figure>
  )
}
