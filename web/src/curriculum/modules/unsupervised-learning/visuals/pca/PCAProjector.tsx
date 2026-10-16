import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Button, Plot, Grid, Axes, Path, Dots, Arrow, VLine, FnPath, Label, DraggablePoint, M, useNarrow } from '../../../../../kit'
import { tiltedCloud, cov2, eig2, keptVariance, fmt, type Pt } from './pcaMath'

/*
  Rotate a line through the centre of a 2-D cloud. Every point drops a perpendicular onto the line:
  the foot of the perpendicular is the point's "shadow" (its projection), the perpendicular itself is
  what is lost if we keep only the shadow. By Pythagoras, kept + lost = total variance for every angle,
  so the angle that keeps the most variance is the angle that loses the least: PC1.
*/

type DataKey = 'cloud' | 'tiny'

interface DataSet {
  pts: Pt[]
  mu: Pt
  x: [number, number]
  y: [number, number]
  handle: number
}

const DATA: Record<DataKey, DataSet> = {
  // 40 points stretched along 32 degrees, already centred on (0, 0)
  cloud: { pts: tiltedCloud(19, 40, 32, 2.1, 0.7), mu: [0, 0], x: [-6, 6], y: [-4.5, 4.5], handle: 4.3 },
  // the lesson's worked example: (1,3), (3,4), (4,3), (4,6) with mean (3, 4)
  tiny: { pts: [[1, 3], [3, 4], [4, 3], [4, 6]], mu: [3, 4], x: [-1, 7], y: [1, 7], handle: 2.9 },
}

const label: CSSProperties = { fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink-2)' }

export default function PCAProjector() {
  const [key, setKey] = useState<DataKey>('cloud')
  const [deg, setDeg] = useState(100)
  const [answer, setAnswer] = useState(false)
  const [ref, narrow] = useNarrow<HTMLDivElement>(600)

  const d = DATA[key]
  const stats = useMemo(() => {
    const c = cov2(d.pts)
    return { c, e: eig2(c), total: c.sxx + c.syy }
  }, [d])

  const th = (deg * Math.PI) / 180
  const u: Pt = [Math.cos(th), Math.sin(th)]
  const kept = keptVariance(stats.c, th)
  const lost = stats.total - kept
  const keptPct = (100 * kept) / stats.total
  const [mx, my] = d.mu
  const feet = d.pts.map(([x, y]) => {
    const z = (x - mx) * u[0] + (y - my) * u[1]
    return [mx + z * u[0], my + z * u[1]] as Pt
  })
  const L = 40
  const handle: Pt = [mx + d.handle * u[0], my + d.handle * u[1]]
  const atBest = stats.e.l1 - kept < 0.002 * stats.total

  const setFromPointer = (x: number, y: number) => {
    let a = (Math.atan2(y - my, x - mx) * 180) / Math.PI
    if (a < 0) a += 180
    if (a >= 180) a -= 180
    setDeg(Math.round(a) % 180)
  }

  const sd1 = Math.sqrt(stats.e.l1)
  const sd2 = Math.sqrt(stats.e.l2)
  const s = key === 'tiny' ? 1.4 : 1.6

  return (
    <Figure
      wide
      title="Find the line that keeps the most spread"
      caption={
        <>
          Drag the handle (or use the slider) to turn the line. Each point's <b style={{ color: 'var(--viz-1)' }}>shadow</b> on the line is what we
          keep; the <b style={{ color: 'var(--viz-2)' }}>orange drop</b> to the line is what we lose. Watch the bar: kept + lost never changes, so
          the angle with the most spread in the shadows is exactly the angle with the shortest drops. That angle is <M>{'\\text{PC1}'}</M>.
          Switch to the 4-point worked example to check the numbers from the lesson.
        </>
      }
    >
      <div
        ref={ref}
        style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1.25fr) minmax(0, 1fr)', gap: narrow ? '0.75rem' : '1.25rem', alignItems: 'start' }}
      >
        <div style={{ minWidth: 0 }}>
          <Plot x={d.x} y={d.y} width={480} height={360} maxWidth={520} margin={{ left: 16, right: 16, top: 12, bottom: 12 }} ariaLabel={`Data cloud with a line through its centre at ${Math.round(deg)} degrees; ${keptPct.toFixed(0)}% of the variance is kept`}>
            <Grid xTicks={key === 'tiny' ? 8 : 12} yTicks={key === 'tiny' ? 6 : 9} />
            <Path points={[[mx - L * u[0], my - L * u[1]], [mx + L * u[0], my + L * u[1]]]} color="var(--viz-1)" width={2.5} />
            {d.pts.map((p, i) => (
              <Path key={i} points={[p, feet[i]]} color="var(--viz-2)" width={key === 'tiny' ? 2.5 : 1.6} />
            ))}
            <Dots points={d.pts.map(([x, y]) => ({ x, y, color: 'var(--viz-ink)', r: key === 'tiny' ? 6 : 4 }))} />
            <Dots points={feet.map(([x, y]) => ({ x, y, color: 'var(--viz-1)', r: key === 'tiny' ? 4.5 : 3 }))} />
            {key === 'tiny' && <Dots points={[{ x: mx, y: my, shape: 'cross', r: 5, color: 'var(--viz-muted)' }]} />}
            {answer && (
              <>
                <Arrow from={d.mu} to={[mx + s * sd1 * stats.e.v1[0], my + s * sd1 * stats.e.v1[1]]} color="var(--viz-3)" width={3} label="PC1" labelOffset={[8, 18]} />
                <Arrow from={d.mu} to={[mx + s * sd2 * stats.e.v2[0], my + s * sd2 * stats.e.v2[1]]} color="var(--viz-4)" width={3} label="PC2" labelOffset={[-34, -4]} />
              </>
            )}
            <DraggablePoint x={handle[0]} y={handle[1]} onChange={setFromPointer} color="var(--viz-1)" label="turn me" />
          </Plot>
        </div>
        <div style={{ minWidth: 0, display: 'grid', gap: '0.6rem' }}>
          <div style={label}>Variance of the shadows at each angle</div>
          <Plot x={[0, 180]} y={[0, stats.total * 1.08]} width={340} height={200} maxWidth={420} margin={{ left: 40, bottom: 34, top: 12, right: 12 }} ariaLabel="Kept and lost variance as the line turns from 0 to 180 degrees">
            <Grid xTicks={4} yTicks={4} />
            <Axes yTicks={4} hideXTicks />
            {[0, 45, 90, 135, 180].map((t) => (
              <Label key={t} x={t} y={0} dy={17} anchor="middle" size={12} color="var(--viz-axis)">
                {`${t}°`}
              </Label>
            ))}
            <FnPath f={(a) => keptVariance(stats.c, (a * Math.PI) / 180)} color="var(--viz-1)" width={2.5} />
            <FnPath f={(a) => stats.total - keptVariance(stats.c, (a * Math.PI) / 180)} color="var(--viz-2)" width={2.5} dash="6 4" />
            <VLine x={deg} color="var(--viz-ink)" dash="3 3" width={1.2} />
            <Dots points={[{ x: deg, y: kept, color: 'var(--viz-1)', r: 5 }, { x: deg, y: lost, color: 'var(--viz-2)', r: 5 }]} />
          </Plot>
          <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--ink-2)' }}>
            <span>
              <b style={{ color: 'var(--viz-1)' }}>━</b> kept (spread of shadows)
            </span>
            <span>
              <b style={{ color: 'var(--viz-2)' }}>╍</b> lost (squared drops)
            </span>
          </div>
          <div>
            <div style={label}>Total variance = {fmt(stats.total)}, split into</div>
            <div role="img" aria-label={`kept ${fmt(kept)}, lost ${fmt(lost)}`} style={{ display: 'flex', height: 20, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--rule)', marginTop: 4 }}>
              <div style={{ width: `${keptPct}%`, background: 'var(--viz-1)', transition: 'width 120ms' }} />
              <div style={{ flex: 1, background: 'color-mix(in srgb, var(--viz-2) 85%, var(--surface))' }} />
            </div>
            <div className="tabular" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--ink-2)', marginTop: 2 }}>
              <span>kept {fmt(kept)}</span>
              <span>lost {fmt(lost)}</span>
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', minHeight: '2.6em', color: atBest ? 'var(--ok)' : 'var(--ink-2)', fontWeight: atBest ? 700 : 400 }}>
            {atBest
              ? `This is PC1: the most spread you can keep (${fmt(stats.e.l1)}), and the least you can lose (${fmt(stats.e.l2)}).`
              : 'Not the best yet: turn the line to make the blue part of the bar as long as you can.'}
          </div>
        </div>
      </div>
      <Controls>
        <Segmented
          label="data"
          value={key}
          onChange={(k) => {
            setKey(k)
            setDeg(100)
          }}
          options={[
            { value: 'cloud', label: '40 points' },
            { value: 'tiny', label: 'worked example' },
          ]}
        />
        <Slider label="angle of the line" value={deg} min={0} max={179} step={1} onChange={setDeg} format={(v) => `${Math.round(v)}°`} />
        <Button onClick={() => setDeg(stats.e.angle)}>Snap to PC1</Button>
        <Toggle label="Show PC1 and PC2" checked={answer} onChange={setAnswer} />
        <Readout items={[['kept', `${keptPct.toFixed(1)}%`], ['kept var', fmt(kept)], ['lost var', fmt(lost)]]} />
      </Controls>
    </Figure>
  )
}
