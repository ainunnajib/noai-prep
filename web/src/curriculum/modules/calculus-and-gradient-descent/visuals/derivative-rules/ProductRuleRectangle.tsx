import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Rect, Label, Path, Bars, MBlock } from '../../../../../kit'
import { ft } from '../derivatives-as-slopes/plotHelpers'

/*
  The product rule as a growing rectangle. Sides u = 3 + t and v = 2 + 0.5t (so u′ = 1 and
  v′ = 0.5) grow for a time Δt. The new area is two strips, u′Δt·v and u·v′Δt, plus a corner
  u′Δt·v′Δt. Divided by Δt, the strips give 2 + 1.5 = 3.5 whatever Δt is, while the corner gives
  0.5·Δt, which vanishes as Δt → 0. So (uv)′ = u′v + uv′ = 3.5.
*/

const U0 = 3
const V0 = 2
const DU = 1 // u′
const DV = 0.5 // v′

export default function ProductRuleRectangle() {
  const [dt, setDt] = useState(1)
  const du = DU * dt
  const dv = DV * dt
  const right = du * V0
  const top = U0 * dv
  const corner = du * dv
  const total = right + top + corner

  const X: [number, number] = [-0.15, 4.65]
  const Y: [number, number] = [-0.55, 2.85]
  // keep 1 unit the same length on both axes
  const W = 440
  const H = Math.round(((Y[1] - Y[0]) / (X[1] - X[0])) * (W - 22) + 22)

  const cRight = 'var(--viz-1)'
  const cTop = 'var(--viz-2)'
  const cCorner = 'var(--viz-4)'
  const tint = (c: string, p = 30) => `color-mix(in srgb, ${c} ${p}%, var(--surface))`

  return (
    <Figure
      title="The product rule: a rectangle with growing sides"
      caption={
        <>
          The rectangle has sides <i>u</i> = 3 and <i>v</i> = 2. Over a short time Δ<i>t</i>, <i>u</i> grows at rate <i>u</i>′ = 1 and <i>v</i> at rate{' '}
          <i>v</i>′ = 0.5. Slide Δ<i>t</i> towards 0. The two strips shrink in proportion to Δ<i>t</i>, but the pink corner shrinks much faster (it is
          Δ<i>t</i> × Δ<i>t</i>). So in the rate of growth, area added ÷ Δ<i>t</i>, the corner disappears and only <i>u</i>′<i>v</i> + <i>uv</i>′ = 3.5
          is left.
        </>
      }
    >
      <div style={{ width: '100%' }}>
        <Plot x={X} y={Y} width={W} height={H} maxWidth={470} margin={{ left: 11, right: 11, top: 11, bottom: 11 }} ariaLabel="A rectangle whose sides grow, with the added area split into two strips and a corner">
          <Rect x0={0} x1={U0} y0={0} y1={V0} fill="var(--surface-3)" stroke="var(--viz-axis)" />
          <Rect x0={U0} x1={U0 + du} y0={0} y1={V0} fill={tint(cRight)} stroke={cRight} />
          <Rect x0={0} x1={U0} y0={V0} y1={V0 + dv} fill={tint(cTop)} stroke={cTop} />
          <Rect x0={U0} x1={U0 + du} y0={V0} y1={V0 + dv} fill={tint(cCorner, 55)} stroke={cCorner} />
          <Label x={U0 / 2} y={V0 / 2} anchor="middle" dy={5} color="var(--ink-2)" size={14} weight={700}>
            old area u·v = 6
          </Label>
          {/* side lengths */}
          <Path points={[[0, -0.2], [U0, -0.2]]} color="var(--viz-axis)" width={1.4} />
          <Label x={U0 / 2} y={-0.2} dy={15} anchor="middle" color="var(--ink-2)" size={12}>
            u = 3
          </Label>
          <Label x={0.1} y={0.22} dy={4} color="var(--ink-2)" size={12}>
            v = 2
          </Label>
          {du > 0.55 && (
            <Label x={U0 + du / 2} y={V0 / 2} anchor="middle" dy={5} color={cRight} weight={700}>
              {`${ft(right, 2)}`}
            </Label>
          )}
          {dv > 0.22 && (
            <Label x={U0 / 2} y={V0 + dv / 2} anchor="middle" dy={5} color={cTop} weight={700}>
              {`${ft(top, 2)}`}
            </Label>
          )}
        </Plot>
      </div>
      <Controls>
        <Slider label="Δt (how long the sides grow)" value={dt} min={0.02} max={1.5} step={0.01} onChange={setDt} format={(v) => v.toFixed(2)} />
      </Controls>
      <MBlock>
        {`\\underbrace{\\textstyle \\frac{\\text{area added}}{\\Delta t}}_{${ft(total / dt, 3)}} = \\underbrace{u'v}_{${ft(right / dt, 2)}} + \\underbrace{uv'}_{${ft(top / dt, 2)}} + \\underbrace{u'v'\\,\\Delta t}_{${ft(corner / dt, 3)}}`}
      </MBlock>
      <Bars
        max={2.1}
        format={(v) => v.toFixed(3)}
        ariaLabel="Each piece of added area divided by the time step"
        data={[
          { label: "right strip ÷ Δt  (u′v)", value: right / dt, color: cRight },
          { label: "top strip ÷ Δt  (uv′)", value: top / dt, color: cTop },
          { label: 'corner ÷ Δt', value: corner / dt, color: cCorner, strong: true },
        ]}
      />
      <Readout
        items={[
          ['Δu = u′Δt', ft(du, 3)],
          ['Δv = v′Δt', ft(dv, 3)],
          ['area added', ft(total, 4)],
          ['rate (area added ÷ Δt)', ft(total / dt, 3)],
        ]}
      />
    </Figure>
  )
}
