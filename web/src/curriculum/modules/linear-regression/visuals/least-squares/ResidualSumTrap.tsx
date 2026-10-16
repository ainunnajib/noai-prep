import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Grid, Axes, Path, Dots, Label, VLine, FnPath, M, useNarrow } from '../../../../../kit'
import { DragDot } from './DragDot'
import { RIDES, fmt, fix, lineText } from './shared'

/*
  Why not just add up the residuals? Every line through the centre of the data (x̄, ȳ) has
  residuals that sum to exactly zero, however bad it is. The learner spins such a line and
  watches three scores: Σr (always 0), Σ|r| and Σr² (a parabola with one bottom).
*/

const CX = 3
const CY = 6
const XH = 4.5 // x position of the spin handle
const S_MIN = -1
const S_MAX = 4

const resid = (s: number) => RIDES.map(([x, y]) => y - (CY + s * (x - CX)))
const sumR = (s: number) => resid(s).reduce((a, r) => a + r, 0)
const sumAbs = (s: number) => resid(s).reduce((a, r) => a + Math.abs(r), 0)
const sumSq = (s: number) => resid(s).reduce((a, r) => a + r * r, 0)
const small: CSSProperties = { fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center', marginBottom: '0.2rem' }

export default function ResidualSumTrap() {
  const [s, setS] = useState(-0.5)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()
  const b = CY - s * CX
  const rs = resid(s)
  const setSlope = (v: number) => setS(Math.max(S_MIN, Math.min(S_MAX, Math.round(v * 10) / 10)))

  return (
    <Figure
      title="The sum-of-residuals trap"
      caption={
        <>
          Every line here passes through the centre of the data, the point <M>{'(\\bar x, \\bar y) = (3, 6)'}</M>. Spin it with the slider or the
          dark square handle on the line. Green residuals (fare above the line) and red ones (fare below) always cancel exactly, so the plain sum is 0
          for every one of these lines, even absurd downhill ones. In the scores chart, the sum of squares (orange curve) cannot be fooled: it has one
          lowest point, at slope 1.5.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: '0.75rem', alignItems: 'start' }}>
        <div>
        <div style={small}>Lines through the centre</div>
        <Plot x={[0, 6]} y={[0, 12]} width={340} height={290} minHeight={250} maxWidth={520} ariaLabel={`Line ${lineText(s, b)} through the centre of the data with residuals summing to zero`}>
          <Grid xTicks={6} yTicks={6} />
          <Axes xLabel="km" yLabel="fare ($)" xTicks={6} yTicks={6} />
          {RIDES.map(([x, y], i) => (
            <Path key={i} points={[[x, y], [x, y - rs[i]]]} color={rs[i] >= 0 ? 'var(--viz-pos)' : 'var(--viz-neg)'} width={3} />
          ))}
          <FnPath f={(x) => CY + s * (x - CX)} color="var(--viz-ink)" width={2.5} />
          <Dots points={RIDES.map(([x, y]) => ({ x, y, r: 6, color: 'var(--viz-1)' }))} />
          {RIDES.map(([x, y], i) =>
            Math.abs(rs[i]) >= 0.25 ? (
              <Label key={i} x={x} y={y - rs[i] / 2} dx={x >= CX ? 7 : -7} dy={4} anchor={x >= CX ? 'start' : 'end'} color={rs[i] >= 0 ? 'var(--viz-pos)' : 'var(--viz-neg)'} size={12} weight={700}>
                {(rs[i] > 0 ? '+' : '−') + fmt(Math.abs(rs[i]), 1)}
              </Label>
            ) : null,
          )}
          <Dots points={[{ x: CX, y: CY, r: 6, hollow: true, color: 'var(--viz-ink)' }]} />
          <Label x={CX} y={CY} dx={-9} dy={18} anchor="end" size={12}>
            centre
          </Label>
          <DragDot x={XH} y={CY + s * (XH - CX)} lockX square color="var(--viz-ink)" ariaLabel="Spin the line" onChange={(_, ny) => setSlope((ny - CY) / (XH - CX))} />
        </Plot>
        </div>
        <div>
        <div style={small}>Three scores for each slope</div>
        <Plot x={[S_MIN, S_MAX]} y={[-6, 70]} width={340} height={290} minHeight={250} maxWidth={520} margin={{ left: 40 }} ariaLabel="Three scores plotted against the slope of the line">
          <Grid xTicks={5} yTicks={7} />
          <Axes xLabel="slope of the line" yLabel="score" xTicks={5} yTicks={7} />
          <FnPath f={sumSq} color="var(--viz-2)" width={2.8} />
          <FnPath f={sumAbs} color="var(--viz-6)" width={2.4} />
          <FnPath f={sumR} color="var(--viz-5)" width={2.4} />
          <VLine x={s} color="var(--viz-muted)" />
          <Dots
            points={[
              { x: s, y: sumSq(s), r: 5, color: 'var(--viz-2)' },
              { x: s, y: sumAbs(s), r: 5, color: 'var(--viz-6)' },
              { x: s, y: sumR(s), r: 5, color: 'var(--viz-5)' },
            ]}
          />
          <Label x={-0.25} y={40} color="var(--viz-2)" weight={700} size={12}>
            Σ r² (squares)
          </Label>
          <Label x={3.3} y={16} color="var(--viz-6)" weight={700} size={12}>
            Σ |r|
          </Label>
          <Label x={3.95} y={0} dy={-7} anchor="end" color="var(--viz-5)" weight={700} size={12}>
            Σ r (plain sum)
          </Label>
        </Plot>
        </div>
      </div>
      <Controls>
        <Slider label="slope of the line" value={s} min={S_MIN} max={S_MAX} step={0.1} onChange={setSlope} format={(v) => v.toFixed(1)} />
      </Controls>
      <Readout
        items={[
          ['line', lineText(s, b)],
          ['Σ r', fix(sumR(s), 2)],
          ['Σ |r|', fix(sumAbs(s), 2)],
          ['Σ r²', fix(sumSq(s), 2)],
        ]}
      />
    </Figure>
  )
}
