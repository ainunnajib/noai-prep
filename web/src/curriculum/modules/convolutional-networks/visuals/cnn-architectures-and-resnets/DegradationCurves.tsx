import { useMemo, useState } from 'react'
import { Figure, Controls, Segmented, Toggle, Plot, Grid, Axes, Path, HLine, Label, usePlot, mulberry32 } from '../../../../../kit'

/*
  Illustrative error curves with the shape of the ResNet paper's CIFAR-10 plots (He et al. 2015,
  Figs. 1 and 6): learning rate divided by 10 at 32k and 48k iterations, 64k in total. Plain
  networks get WORSE on the training data as they get deeper; residual networks get better.
  The final ResNet test errors are the published ones (8.75, 7.51, 7.17, 6.97%); everything else
  is a smooth stand-in, not data.
*/

const DEPTHS = [20, 32, 44, 56] as const
const COLOURS = ['var(--viz-3)', 'var(--viz-5)', 'var(--viz-2)', 'var(--viz-4)']
type Kind = 'plain' | 'res'
type Split = 'train' | 'test'
// [plateau before 1st LR drop, after 1st drop, after 2nd drop] per depth
const LEVELS: Record<Kind, Record<Split, number[][]>> = {
  plain: {
    train: [[9, 4, 3], [10, 5, 4], [11.5, 6.3, 5.2], [13, 7.8, 6.6]],
    test: [[13.5, 9.5, 9.0], [14.5, 10.3, 9.8], [15.5, 11.3, 10.8], [17, 12.6, 12.0]],
  },
  res: {
    train: [[8.5, 2.6, 1.8], [7.8, 1.6, 0.9], [7.2, 1.0, 0.5], [6.6, 0.6, 0.3]],
    test: [[13, 9.2, 8.75], [12.5, 8.0, 7.51], [12, 7.6, 7.17], [11.8, 7.4, 6.97]],
  },
}

function curve(levels: number[], seed: number, train: boolean): [number, number][] {
  const [a, b, c] = levels
  const rnd = mulberry32(seed)
  const pts: [number, number][] = []
  let prev = 0
  for (let i = 0; i <= 256; i++) {
    const t = (i / 256) * 64
    let e: number
    if (t < 32) e = a + (60 - a) * Math.exp(-t / 4.5)
    else if (t < 48) {
      const at32 = a + (60 - a) * Math.exp(-32 / 4.5)
      e = b + (at32 - b) * Math.exp(-(t - 32) / 0.7)
    } else {
      const at48 = b + (a + (60 - a) * Math.exp(-32 / 4.5) - b) * Math.exp(-16 / 0.7)
      e = c + (at48 - c) * Math.exp(-(t - 48) / 0.7)
    }
    const amp = (t < 32 ? 0.7 : 0.18) * (train ? 1 : 0.8)
    const n = (rnd() - 0.5) * 2 * amp
    prev = 0.5 * prev + 0.5 * n
    pts.push([t, Math.max(0.05, e + prev)])
  }
  return pts
}

function EndLabels({ ends }: { ends: { y: number; text: string; color: string }[] }) {
  const { xs, ys } = usePlot()
  const sorted = ends.map((e) => ({ ...e, py: ys(e.y) })).sort((p, q) => p.py - q.py)
  for (let i = 1; i < sorted.length; i++) if (sorted[i].py - sorted[i - 1].py < 14) sorted[i].py = sorted[i - 1].py + 14
  return (
    <g>
      {sorted.map((e) => (
        <text key={e.text} x={xs(64) + 6} y={e.py} dy="0.35em" className="plot-label" style={{ fill: e.color, fontSize: 12.5 }}>
          {e.text}
        </text>
      ))}
    </g>
  )
}

export default function DegradationCurves() {
  const [kind, setKind] = useState<Kind>('plain')
  const [split, setSplit] = useState<Split>('train')
  const [construct, setConstruct] = useState(false)
  const curves = useMemo(() => DEPTHS.map((_, i) => curve(LEVELS[kind][split][i], 1000 + i * 17 + (kind === 'res' ? 5 : 0) + (split === 'test' ? 101 : 0), split === 'train')), [kind, split])
  const finals = DEPTHS.map((_, i) => LEVELS[kind][split][i][2])
  const order = DEPTHS.map((d, i) => ({ d, v: finals[i] })).sort((p, q) => p.v - q.v)
  const deeperWorse = order[0].d === 20
  const showConstruct = construct && kind === 'plain' && split === 'train'

  return (
    <Figure
      title="Deeper plain networks train worse"
      caption={
        <>
          Error during training of 20- to 56-layer networks on a small image dataset (illustrative curves with the shape of the ResNet paper's CIFAR-10 plots; the
          sudden drops are where the learning rate is cut). With <b>plain</b> networks the deepest one is the worst, <i>even on its own training data</i>, so this is not
          overfitting. Switch to <b>ResNet</b>: the same depths with skip connections, and now deeper is better. Turn on the construction to see why plain-56 "should"
          be able to match plain-20.
        </>
      }
    >
      <Plot x={[0, 64]} y={[0, 20]} width={520} height={330} minHeight={260} margin={{ right: 74, left: 40, top: 26 }} ariaLabel={`${split === 'train' ? 'Training' : 'Test'} error curves for ${kind === 'plain' ? 'plain' : 'residual'} networks of 20 to 56 layers`}>
        <Grid xTicks={8} yTicks={4} />
        <Axes xLabel="iterations (thousands)" yLabel={split === 'train' ? 'training error (%)' : 'test error (%)'} xTicks={8} yTicks={4} />
        {curves.map((pts, i) => (
          <Path key={DEPTHS[i]} points={pts} color={COLOURS[i]} width={2.2} />
        ))}
        {showConstruct && (
          <>
            <HLine y={LEVELS.plain.train[0][2]} color="var(--viz-ink)" dash="6 4" width={2} />
            <Label x={1.5} y={LEVELS.plain.train[0][2]} dy={14} color="var(--viz-ink)" size={12.5}>
              20 layers + 36 identity layers
            </Label>
          </>
        )}
        <EndLabels ends={DEPTHS.map((d, i) => ({ y: curves[i][curves[i].length - 1][1], text: `${kind === 'plain' ? 'plain' : 'ResNet'}-${d}`, color: COLOURS[i] }))} />
      </Plot>
      <Controls>
        <Segmented label="Network" value={kind} onChange={setKind} options={[{ value: 'plain', label: 'Plain' }, { value: 'res', label: 'ResNet (skip connections)' }]} />
        <Segmented label="Error on" value={split} onChange={setSplit} options={[{ value: 'train', label: 'training data' }, { value: 'test', label: 'test data' }]} />
        <Toggle label="Show the copy + identity construction" checked={construct} onChange={setConstruct} />
      </Controls>
      <div style={{ fontSize: 'var(--step--1)', color: 'var(--ink)', textAlign: 'center' }}>
        Final {split === 'train' ? 'training' : 'test'} error, best to worst: {order.map((o) => `${o.d}`).join(' < ')} layers →{' '}
        <b style={{ color: deeperWorse ? 'var(--viz-neg)' : 'var(--viz-pos)' }}>{deeperWorse ? 'deeper is worse' : 'deeper is better'}</b>
        {construct && !(kind === 'plain' && split === 'train') && <span style={{ color: 'var(--ink-3)' }}> (the construction line appears with plain networks on training data)</span>}
      </div>
    </Figure>
  )
}
