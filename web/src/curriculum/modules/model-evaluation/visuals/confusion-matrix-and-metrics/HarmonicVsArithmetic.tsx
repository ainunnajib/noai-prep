import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Grid, Axes, FnPath, Path, Dots, DraggablePoint, M } from '../../../../../kit'
import { HaloLabel } from './HaloLabel'
import { txt } from './colors'
import s from './eval.module.css'

/*
  F1 is the harmonic mean of precision P and recall R: 2PR / (P + R).
  With P fixed by a slider, the plot shows (as functions of R):
    arithmetic mean (P + R)/2   (a straight line)
    harmonic mean = F1          (a curve that bends down towards the smaller value)
    min(P, R)                   (dotted guide: F1 always lies between min and the arithmetic mean)
*/

const AM_C = 'var(--viz-axis)'
const F1_C = 'var(--viz-6)'
const MIN_C = 'var(--viz-muted)'

const f1 = (p: number, r: number) => (p + r === 0 ? 0 : (2 * p * r) / (p + r))
const round2 = (v: number) => Math.round(v * 100) / 100

export default function HarmonicVsArithmetic() {
  const [p, setP] = useState(1)
  const [r, setR] = useState(0.1)
  const am = (p + r) / 2
  const hm = f1(p, r)
  const lo = Math.min(p, r)
  // with P = R = 0, F1 = 0/0 is undefined (the curve is drawn as 0 there, its limit along the axis)
  const undef = p + r === 0
  const f1Text = undef ? 'F1 undefined (0/0)' : `F1 = ${hm.toFixed(2)}`

  return (
    <Figure
      title="Arithmetic mean versus harmonic mean (F1)"
      caption={
        <>
          Drag the olive point along the F1 curve. At precision 1.00 and recall 0.10 the average says 0.55 but F1 says 0.18, close to the weaker value. Now
          make precision and recall equal: the two means meet.
        </>
      }
    >
      <Plot x={[0, 1]} y={[0, 1]} width={460} height={340} ariaLabel={`Means of precision ${p.toFixed(2)} and recall ${r.toFixed(2)}: arithmetic ${am.toFixed(2)}, harmonic ${hm.toFixed(2)}`}>
        <Grid xTicks={10} yTicks={10} />
        <Axes xLabel="recall R" yLabel="mean" xTicks={5} yTicks={5} />
        <FnPath f={(x) => Math.min(p, x)} color={MIN_C} width={2} dash="2 5" />
        <FnPath f={(x) => (p + x) / 2} color={AM_C} width={2.5} dash="7 5" />
        <FnPath f={(x) => f1(p, x)} color={F1_C} width={3} />
        <Path points={[[r, 0], [r, Math.max(am, hm)]]} color="var(--viz-muted)" width={1.5} dash="3 4" />
        <Path points={[[r, hm], [r, am]]} color="var(--viz-neg)" width={3} />
        <Dots points={[{ x: r, y: am, color: AM_C, r: 6 }]} />
        {/* the top-left corner (below the axis title) is always empty: every curve stays below (1 + R)/2 there, so the values never touch a line */}
        <HaloLabel x={0} y={1} dx={8} dy={32} anchor="start" color={AM_C}>
          {`● average = ${am.toFixed(2)}`}
        </HaloLabel>
        <HaloLabel x={0} y={1} dx={8} dy={50} anchor="start" color={txt(F1_C)}>
          {`● ${f1Text}`}
        </HaloLabel>
        <DraggablePoint x={r} y={hm} color={F1_C} onChange={(x) => setR(Math.max(0, Math.min(1, round2(x))))} constrain={(x) => [x, f1(p, x)]} />
      </Plot>
      <div className={s.legend}>
        <span>
          <span className={`${s.swatchLine} ${s.swatchDash}`} style={{ borderColor: AM_C }} />
          arithmetic mean
        </span>
        <span>
          <span className={s.swatchLine} style={{ borderColor: F1_C }} />
          harmonic mean = F1
        </span>
        <span>
          <span className={`${s.swatchLine} ${s.swatchDash}`} style={{ borderColor: MIN_C, borderTopStyle: 'dotted' }} />
          the smaller of P and R
        </span>
      </div>
      <M>{`F_1 = \\frac{2PR}{P + R} = \\frac{2 \\times ${p.toFixed(2)} \\times ${r.toFixed(2)}}{${p.toFixed(2)} + ${r.toFixed(2)}} = ${undef ? '\\frac{0}{0}\\text{, undefined}' : hm.toFixed(2)}`}</M>
      <Controls>
        <Slider label="precision P" value={p} min={0} max={1} step={0.01} onChange={setP} format={(v) => v.toFixed(2)} />
        <Slider label="recall R" value={r} min={0} max={1} step={0.01} onChange={setR} format={(v) => v.toFixed(2)} />
        <Readout
          items={[
            ['arithmetic mean', am.toFixed(2)],
            ['F1', undef ? '–' : hm.toFixed(2)],
            ['smaller one', lo.toFixed(2)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
