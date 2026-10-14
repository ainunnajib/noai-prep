import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Grid, Axes, FnPath, Path, Dots, Label, DraggablePoint, M } from '../../../../../kit'
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

  return (
    <Figure
      title="Arithmetic mean versus harmonic mean (F1)"
      caption={
        <>
          The horizontal axis is recall; precision is set by the slider. Drag the olive point (or use the sliders). With precision 1.00 and recall 0.10 the
          ordinary average is a flattering 0.55, but F1 is only 0.18: it stays close to the <b>weaker</b> of the two (the dotted line). Now make precision and
          recall equal: the two means meet. F1 is only high when <b>both</b> are high.
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
        {r > 0.6 ? (
          <Label x={r} y={am} dx={-10} dy={-8} anchor="end" color={AM_C}>
            {`average = ${am.toFixed(2)}`}
          </Label>
        ) : (
          <Label x={r} y={am} dx={6} dy={-30} anchor="start" color={AM_C}>
            {`average = ${am.toFixed(2)}`}
          </Label>
        )}
        <Label x={r} y={hm} dx={r > 0.6 ? -12 : 12} dy={18} anchor={r > 0.6 ? 'end' : 'start'} color={F1_C}>
          {`F1 = ${hm.toFixed(2)}`}
        </Label>
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
      <M>{`F_1 = \\frac{2PR}{P + R} = \\frac{2 \\times ${p.toFixed(2)} \\times ${r.toFixed(2)}}{${p.toFixed(2)} + ${r.toFixed(2)}} = ${hm.toFixed(2)}`}</M>
      <Controls>
        <Slider label="precision P" value={p} min={0} max={1} step={0.01} onChange={setP} format={(v) => v.toFixed(2)} />
        <Slider label="recall R" value={r} min={0} max={1} step={0.01} onChange={setR} format={(v) => v.toFixed(2)} />
        <Readout
          items={[
            ['arithmetic mean', am.toFixed(2)],
            ['F1', hm.toFixed(2)],
            ['smaller one', lo.toFixed(2)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
