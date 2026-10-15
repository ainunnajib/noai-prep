import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Segmented, Readout, Plot, Grid, Axes, Path, Dots, VLine, HLine, M, useContainerWidth } from '../../../../../kit'
import { HeatCanvas } from './HeatCanvas'
import { peAngle, peDenominator, peTable, peValue, useCanvasTheme, type PeVariant } from './pe'
import s from './peb.module.css'

/*
  The sinusoidal positional-encoding table PE(pos, dim) as a heat map, one dimension as a wave,
  and the cosine similarity between every pair of positions. Two classic bugs can be switched on
  to see what breaks.
*/

const VARIANTS: { value: PeVariant; label: string }[] = [
  { value: 'correct', label: 'correct' },
  { value: 'samefreq', label: 'bug: no 10000' },
  { value: 'multiply', label: 'bug: × not ÷' },
]

const NOTE: Record<PeVariant, string> = {
  correct:
    'Fast waves on the left, slow waves on the right, and every row (position) gets a different pattern. In the similarity map each position matches itself best (the diagonal), its next-door neighbours almost as well, and positions further away less, with gentle ripples.',
  samefreq:
    'Bug: forgot the 10000^(2i/d) term. Every pair of columns is the same sin(pos), cos(pos) wave, which repeats every 2π ≈ 6.28 positions. Strong stripes repeat far from the diagonal: different positions get almost the same code (positions 0 and 44 match to 0.9998).',
  multiply:
    'Bug: multiplied by 10000^(2i/d) instead of dividing. The higher dimensions jump by huge angles from one position to the next, so the codes look like noise. Each code still matches itself (the thin diagonal), but the soft band around it breaks up: neighbouring positions are no longer reliably similar.',
}

const fmt = (v: number, dp = 3) => {
  const t = v.toFixed(dp)
  return t === `-${(0).toFixed(dp)}` ? (0).toFixed(dp) : t
}

function ticks(n: number, step: number) {
  const out: number[] = []
  for (let t = 0; t < n; t += step) out.push(t)
  return out
}

function cosSim(a: number[], b: number[]) {
  let ab = 0
  let aa = 0
  let bb = 0
  for (let i = 0; i < a.length; i++) {
    ab += a[i] * b[i]
    aa += a[i] * a[i]
    bb += b[i] * b[i]
  }
  return ab / Math.sqrt(aa * bb)
}

export default function PositionalEncodingHeatmap() {
  const [d, setD] = useState(64)
  const [T, setT] = useState(50)
  const [variant, setVariant] = useState<PeVariant>('correct')
  const [pos, setPos] = useState(5)
  const [dim, setDim] = useState(3)
  const theme = useCanvasTheme()
  const [heatRef, heatW] = useContainerWidth<HTMLDivElement>(420)
  const [simRef, simW] = useContainerWidth<HTMLDivElement>(280)

  const p = Math.min(pos, T - 1)
  const j = Math.min(dim, d - 1)
  const table = useMemo(() => peTable(T, d, variant), [T, d, variant])
  const sim = useMemo(() => table.map((a) => table.map((b) => cosSim(a, b))), [table])
  const simLo = useMemo(() => Math.min(...sim.map((row) => Math.min(...row))), [sim])

  const i = Math.floor(j / 2)
  const isSin = j % 2 === 0
  const fn = isSin ? '\\sin' : '\\cos'
  const den = peDenominator(i, d)
  const angle = peAngle(p, j, d, variant)
  const value = peValue(p, j, d, variant)
  const nearest = sim[p].reduce((best, v, q) => (q !== p && (best < 0 || v > sim[p][best]) ? q : best), -1)
  const period = variant === 'samefreq' ? 2 * Math.PI : variant === 'multiply' ? (2 * Math.PI) / den : 2 * Math.PI * den

  let calc: string
  if (variant === 'correct')
    calc = `\\text{PE}(${p}, ${j}) = ${fn}\\!\\left(\\dfrac{${p}}{10000^{2\\cdot${i}/${d}}}\\right) = ${fn}\\!\\left(\\dfrac{${p}}{${fmt(den)}}\\right) = ${fn}(${fmt(angle)}) = ${fmt(value)}`
  else if (variant === 'samefreq') calc = `\\text{PE}(${p}, ${j}) = ${fn}(${p}) = ${fmt(value)}`
  else calc = `\\text{PE}(${p}, ${j}) = ${fn}(${p} \\times ${fmt(den)}) = ${fn}(${fmt(angle, 2)}) = ${fmt(value)}`

  const heatW2 = Math.max(240, Math.min(heatW, 520))
  const simSide = Math.max(200, Math.min(simW, 300))
  const gridH = Math.max(150, Math.min(240, T * 6))
  const xStep = d <= 16 ? 2 : d <= 32 ? 4 : d <= 64 ? 8 : 16
  const yStep = T <= 20 ? 2 : T <= 50 ? 10 : 20

  // the selected dimension as a wave over positions
  const pts: [number, number][] = table.map((row, q) => [q, row[j]])
  const smooth = Math.abs(peAngle(1, j, d, variant)) < 1.2
  const curve: [number, number][] = smooth
    ? Array.from({ length: 300 }, (_, k) => {
        const x = ((T - 1) * k) / 299
        const a = variant === 'samefreq' ? x : variant === 'multiply' ? x * den : x / den
        return [x, isSin ? Math.sin(a) : Math.cos(a)]
      })
    : pts

  return (
    <Figure
      wide
      title="The positional-encoding table, one wave at a time"
      caption={
        <>
          Each row is the code added to the token at that position; each column is one dimension. Tap any cell (or use the sliders) to see its exact
          sin/cos calculation and to draw that column as a wave. Slide <b>d_model</b>: the left columns always wiggle fast and the right ones slowly. Then
          switch on a bug and watch the similarity map: the correct formula gives every position its own code, with neighbours similar.
        </>
      }
    >
      <Controls>
        <Slider label="d_model" value={d} min={4} max={128} step={4} onChange={setD} />
        <Slider label="number of positions" value={T} min={10} max={100} step={5} onChange={setT} />
        <Segmented label="formula" value={variant} onChange={setVariant} options={VARIANTS} />
      </Controls>

      <div className={s.twoPanels}>
        <div ref={heatRef} className={s.panel}>
          <div className={s.panelTitle}>PE table: positions down, dimensions across</div>
          <HeatCanvas
            data={table}
            width={heatW2}
            gridH={gridH}
            theme={theme}
            selRow={p}
            selCol={j}
            onPick={(r, c) => {
              setPos(r)
              setDim(c)
            }}
            xTitle="dimension →"
            yTitle="pos ↓"
            xTicks={ticks(d, xStep)}
            yTicks={ticks(T, yStep)}
            ariaLabel={`Positional encoding heat map, ${T} positions by ${d} dimensions. Selected position ${p}, dimension ${j}, value ${fmt(value)}.`}
          />
          <div className={s.legend}>
            <span>
              <i className={s.swatch} style={{ background: 'var(--viz-1)' }} /> −1
            </span>
            <span>
              <i className={s.swatch} style={{ background: 'var(--surface)', border: '1px solid var(--rule)' }} /> 0
            </span>
            <span>
              <i className={s.swatch} style={{ background: 'var(--viz-2)' }} /> +1
            </span>
          </div>
        </div>
        <div ref={simRef} className={s.panel}>
          <div className={s.panelTitle}>similarity of position p to position q</div>
          <div className={s.seqLegend}>
            <span>{fmt(simLo, 2)}</span>
            <i className={s.seqBar} />
            <span>1 (identical)</span>
          </div>
          <HeatCanvas
            data={sim}
            width={simSide}
            gridH={simSide - 34}
            theme={theme}
            seq={[simLo, 1]}
            selRow={p}
            onPick={(r) => setPos(r)}
            xTitle="q →"
            yTitle="p ↓"
            xTicks={ticks(T, yStep)}
            yTicks={ticks(T, yStep)}
            ariaLabel={`Cosine similarity between the codes of every pair of positions. Position ${p} is most similar to position ${nearest}.`}
          />
        </div>
      </div>


      <p className={s.note} style={{ borderColor: variant === 'correct' ? 'var(--viz-pos)' : 'var(--viz-neg)' }}>
        {variant === 'correct' && d < 12
          ? `With d_model = ${d} there are only ${d / 2} waves, and the fast ones wrap round every 2π ≈ 6.3 positions, so some distant positions look more alike than neighbours (see the stripes). From d_model = 12 up, each position's closest match is its neighbour; real models use 64 or more.`
          : NOTE[variant]}
      </p>

      <Controls>
        <Slider label="selected position" value={p} min={0} max={T - 1} step={1} onChange={setPos} />
        <Slider label="selected dimension" value={j} min={0} max={d - 1} step={1} onChange={setDim} />
      </Controls>

      <div className={s.calc}>
        <div className={s.calcWhy}>
          dimension {j} is {isSin ? 'even → sin' : 'odd → cos'}, pair <M>{`i = ${i}`}</M>
          {variant === 'correct' && (
            <>
              , exponent <M>{`2i/d = ${2 * i}/${d}`}</M>
            </>
          )}
        </div>
        <div className={s.calcLine}>
          <M>{calc}</M>
        </div>
      </div>

      <Plot x={[0, T - 1]} y={[-1.15, 1.15]} width={560} height={180} minHeight={160} margin={{ top: 26 }} ariaLabel={`Dimension ${j} of the positional encoding plotted against position`}>
        <Grid xTicks={10} yTicks={4} />
        <HLine y={0} color="var(--viz-axis)" dash="0" width={1} />
        <Axes xLabel="position" yLabel={`PE(pos, ${j})`} xTicks={8} yTicks={4} />
        <Path points={curve} color="var(--viz-2)" width={smooth ? 2.5 : 1.5} opacity={smooth ? 1 : 0.6} />
        <Dots points={pts.map(([x, y]) => ({ x, y, r: T > 60 ? 2.2 : 3 }))} color="var(--viz-2)" />
        <VLine x={p} color="var(--viz-ink)" />
        <Dots points={[{ x: p, y: value, r: 6 }]} color="var(--viz-ink)" />
      </Plot>

      <Readout
        items={[
          ['PE(pos, dim)', fmt(value)],
          [
            'this wave repeats every',
            period < 2 ? 'under 2 positions (looks random)' : `${period >= 1e5 ? period.toExponential(1) : period < 10 ? period.toFixed(2) : fmt(period, 1)} positions`,
          ],
          [`most similar to pos ${p}`, nearest >= 0 ? `pos ${nearest} (${fmt(sim[p][nearest], 2)})` : '–'],
        ]}
      />
    </Figure>
  )
}
