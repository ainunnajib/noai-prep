import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, useContainerWidth, shuffled, M } from '../../../../../kit'
import { seeded } from './sim'
import s from './shift.module.css'

/*
  A real (tiny) classifier on K balanced classes: nearest class centroid on 6 standardised features.
  Training: 40 examples per class; validation: 40 per class. Raw features are in "sensor units"
  (about 500 ± 15), and the model is trained on standardised features (z-scores from the training set).
  Bugs only touch the VALIDATION pipeline, so training accuracy never changes:
    shuffled labels   validation labels shuffled out of step with the inputs
    no scaling        validation inputs fed raw, without the training standardisation
    class mapping     validation labels written with a different class-to-index mapping
  Each bug sends validation accuracy to about 1/K, and each leaves a different fingerprint in the
  confusion matrix (rows = label in the file, columns = model's prediction).
*/

type Bug = 'none' | 'shuffle' | 'scale' | 'mapping'
const D = 6
const PER = 40

function simulate(K: number) {
  const { rnd, gauss } = seeded(9100 + K)
  const centres = Array.from({ length: K }, () => Array.from({ length: D }, () => 2.2 * gauss()))
  const draw = () => {
    const X: number[][] = []
    const y: number[] = []
    for (let k = 0; k < K; k++)
      for (let i = 0; i < PER; i++) {
        X.push(centres[k].map((c) => 500 + 5 * (c + gauss())))
        y.push(k)
      }
    return { X, y }
  }
  const train = draw()
  const val = draw()
  // standardisation statistics from the TRAINING set only
  const mean = Array.from({ length: D }, (_, j) => train.X.reduce((a, r) => a + r[j], 0) / train.X.length)
  const sd = Array.from({ length: D }, (_, j) => Math.sqrt(train.X.reduce((a, r) => a + (r[j] - mean[j]) ** 2, 0) / train.X.length))
  const scale = (r: number[]) => r.map((v, j) => (v - mean[j]) / sd[j])
  const trainS = train.X.map(scale)
  const cents = Array.from({ length: K }, (_, k) => {
    const rows = trainS.filter((_, i) => train.y[i] === k)
    return Array.from({ length: D }, (_, j) => rows.reduce((a, r) => a + r[j], 0) / rows.length)
  })
  const predict = (r: number[]) => {
    let best = 0
    let bd = Infinity
    for (let k = 0; k < K; k++) {
      let d = 0
      for (let j = 0; j < D; j++) d += (r[j] - cents[k][j]) ** 2
      if (d < bd) {
        bd = d
        best = k
      }
    }
    return best
  }
  const trainAcc = trainS.filter((r, i) => predict(r) === train.y[i]).length / trainS.length
  // A different class-to-index mapping. A random reordering keeps, on average, exactly one class in
  // place, so we use one fixed class and a single cycle through the others. With K = 2 the only
  // possible mix-up is a swap.
  const order = shuffled(
    Array.from({ length: K }, (_, i) => i),
    rnd,
  )
  const perm = Array.from({ length: K }, (_, i) => i)
  if (K === 2) {
    perm[0] = 1
    perm[1] = 0
  } else {
    const rest = order.slice(1)
    rest.forEach((c, i) => {
      perm[c] = rest[(i + 1) % rest.length]
    })
  }
  const shuffledLabels = shuffled(val.y, rnd)

  const run = (bug: Bug) => {
    const conf = Array.from({ length: K }, () => Array<number>(K).fill(0))
    let correct = 0
    val.X.forEach((r, i) => {
      const input = bug === 'scale' ? r : scale(r)
      const pred = predict(input)
      const label = bug === 'shuffle' ? shuffledLabels[i] : bug === 'mapping' ? perm[val.y[i]] : val.y[i]
      conf[label][pred]++
      if (pred === label) correct++
    })
    return { conf, acc: correct / val.X.length }
  }
  return { trainAcc, run, perm }
}

function Gauge({ val, train, chance }: { val: number; train: number; chance: number }) {
  const W = 280
  const H = 196
  const cx = W / 2
  const cy = 128
  const R = 112
  const ang = (f: number) => Math.PI * (1 - f) // 0 → left, 1 → right
  const pt = (f: number, r: number): [number, number] => [cx + r * Math.cos(ang(f)), cy - r * Math.sin(ang(f))]
  const arc = (f0: number, f1: number, r: number) => {
    const [x0, y0] = pt(f0, r)
    const [x1, y1] = pt(f1, r)
    return `M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}`
  }
  const nearChance = Math.abs(val - chance) < 0.06
  const [nx, ny] = pt(val, R - 20)
  const tick = (f: number, color: string) => {
    const [x0, y0] = pt(f, R - 13)
    const [x1, y1] = pt(f, R + 13)
    return <line x1={x0} y1={y0} x2={x1} y2={y1} style={{ stroke: color, strokeWidth: 4 }} strokeLinecap="round" />
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 320, display: 'block', margin: '0 auto' }} role="img" aria-label={`Gauge: validation accuracy ${Math.round(val * 100)}%, chance level ${Math.round(chance * 100)}%, training accuracy ${Math.round(train * 100)}%`}>
      <path d={arc(0, 1, R)} style={{ fill: 'none', stroke: 'var(--surface-3)', strokeWidth: 18 }} />
      <path d={arc(Math.max(0.001, chance - 0.05), Math.min(0.999, chance + 0.05), R)} style={{ fill: 'none', stroke: 'color-mix(in srgb, var(--viz-neg) 35%, var(--surface))', strokeWidth: 18 }} />
      <path d={arc(0, Math.max(0.002, val), R)} style={{ fill: 'none', stroke: nearChance ? 'var(--viz-neg)' : 'var(--viz-pos)', strokeWidth: 7 }} />
      {tick(chance, 'var(--viz-neg)')}
      {tick(train, 'var(--viz-1)')}
      <line x1={cx} y1={cy} x2={nx} y2={ny} style={{ stroke: 'var(--ink)', strokeWidth: 3 }} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={6} style={{ fill: 'var(--ink)' }} />
      <text x={cx} y={cy + 40} textAnchor="middle" style={{ fill: nearChance ? 'var(--viz-neg)' : 'var(--ink)', fontSize: 26, fontWeight: 800 }}>
        {Math.round(val * 100)}%
      </text>
      <text x={cx} y={cy + 60} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 12 }}>
        validation accuracy
      </text>
      <text x={cx - R} y={cy + 20} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 11 }}>
        0%
      </text>
      <text x={cx + R} y={cy + 20} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 11 }}>
        100%
      </text>
    </svg>
  )
}

function Confusion({ conf }: { conf: number[][] }) {
  const K = conf.length
  const [ref, measured] = useContainerWidth<HTMLDivElement>(300)
  const avail = Math.min(320, measured)
  const lab = 34
  const cell = Math.max(18, Math.min(40, Math.floor((avail - lab - 6) / K)))
  const size = lab + cell * K + 4
  const max = Math.max(...conf.flat())
  const fs = cell >= 26 ? 11 : 9
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${size} ${size + 4}`} width={size} style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }} role="img" aria-label="Confusion matrix: rows are labels in the validation file, columns are predictions">
        <text x={lab + (cell * K) / 2} y={11} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 11, fontWeight: 650 }}>
          predicted class →
        </text>
        <text transform={`translate(10, ${lab + (cell * K) / 2}) rotate(-90)`} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 11, fontWeight: 650 }}>
          label in file →
        </text>
        {conf.map((row, i) =>
          row.map((v, j) => {
            const x = lab + j * cell
            const y = lab + i * cell
            const t = max ? v / max : 0
            return (
              <g key={`${i}-${j}`}>
                <rect
                  x={x}
                  y={y}
                  width={cell - 1.5}
                  height={cell - 1.5}
                  rx={3}
                  style={{
                    fill: `color-mix(in srgb, var(--viz-1) ${Math.round(4 + t * 80)}%, var(--surface))`,
                    stroke: i === j ? 'var(--ink)' : 'none',
                    strokeWidth: i === j ? 1.3 : 0,
                    strokeDasharray: i === j ? '3 2' : undefined,
                  }}
                />
                {v > 0 && (
                  <text x={x + (cell - 1.5) / 2} y={y + (cell - 1.5) / 2} dy="0.34em" textAnchor="middle" style={{ fill: t > 0.55 ? 'var(--surface)' : 'var(--ink)', fontSize: fs, fontWeight: 650 }}>
                    {v}
                  </text>
                )}
              </g>
            )
          }),
        )}
        {Array.from({ length: K }, (_, k) => (
          <g key={k}>
            <text x={lab + k * cell + cell / 2} y={lab - 6} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 10 }}>
              {k + 1}
            </text>
            <text x={lab - 6} y={lab + k * cell + cell / 2} dy="0.34em" textAnchor="end" style={{ fill: 'var(--ink-3)', fontSize: 10 }}>
              {k + 1}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

const BUG_TEXT: Record<Bug, ReactNode> = {
  none: <>Healthy pipeline: the counts sit on the dashed diagonal (label = prediction). Validation accuracy is close to training accuracy.</>,
  shuffle: (
    <>
      The validation labels were shuffled out of step with the inputs (say, sorted in one file but not the other). The model still predicts
      well, but the labels are now random, so the matrix is <b>evenly smeared</b>: no structure at all.
    </>
  ),
  scale: (
    <>
      Validation inputs reach the model in raw units (around 500) instead of the z-scores it was trained on. They all land far from every
      class centre, so the model gives <b>one class for everything</b>: a single full column.
    </>
  ),
  mapping: (
    <>
      The validation file numbers the classes in a different order. The model is right, but its answers are compared with relabelled classes,
      so the counts form a <b>reshuffled diagonal</b>: one bright cell per row, mostly off the diagonal. A random reordering keeps about one
      class in place, so accuracy lands near <M>{'1/K'}</M>.
    </>
  ),
}

const SWAP_TEXT = (
  <>
    With two classes, a mixed-up mapping simply <b>swaps</b> them: the model is right, yet almost every answer is marked wrong, so accuracy
    falls <b>far below</b> chance. Worse than guessing is just as suspicious as exactly guessing.
  </>
)

export default function ChanceLevelMeter() {
  const [K, setK] = useState(10)
  const [bug, setBug] = useState<Bug>('scale')
  const sim = useMemo(() => simulate(K), [K])
  const res = useMemo(() => sim.run(bug), [sim, bug])
  const chance = 1 / K
  const [wrapRef, narrowW] = useContainerWidth<HTMLDivElement>(600)
  const narrow = narrowW < 560

  return (
    <Figure
      title="Validation accuracy at chance level: a pipeline-bug detector"
      caption={
        <>
          A real nearest-centroid classifier with {K} balanced classes. The bugs change only the <b>validation</b> pipeline, so training
          accuracy stays at {Math.round(sim.trainAcc * 100)}%. Switch between the bugs: each one drags validation accuracy down to about{' '}
          <M>{'1/K'}</M> (try <M>{'K = 2'}</M> with the class mapping, too), and each leaves its own fingerprint in the confusion matrix. Slide <M>K</M> and watch the chance tick move to{' '}
          <M>{'1/K'}</M>.
        </>
      }
    >
      <div className={s.wrap} ref={wrapRef}>
        <Controls>
          <Segmented
            label="Validation pipeline"
            value={bug}
            onChange={setBug}
            options={[
              { value: 'none', label: 'no bug' },
              { value: 'shuffle', label: 'labels shuffled' },
              { value: 'scale', label: 'not standardised' },
              { value: 'mapping', label: 'class mapping' },
            ]}
          />
          <Slider label={<>number of classes <M>K</M></>} value={K} min={2} max={10} step={1} onChange={setK} />
        </Controls>
        <div className={narrow ? s.stack : s.twoCol}>
          <div>
            <Gauge val={res.acc} train={sim.trainAcc} chance={chance} />
            <div className={s.legend} aria-hidden="true">
              <span>
                <i className={s.tick} style={{ background: 'var(--viz-neg)' }} /> chance level <M>{'1/K'}</M>
              </span>
              <span>
                <i className={s.tick} style={{ background: 'var(--viz-1)' }} /> training accuracy
              </span>
            </div>
            <Readout
              items={[
                ['training acc.', `${Math.round(sim.trainAcc * 100)}%`],
                ['validation acc.', `${(res.acc * 100).toFixed(1)}%`],
                [<>chance <M>{'1/K'}</M></>, `${(chance * 100).toFixed(1)}%`],
              ]}
            />
          </div>
          <Confusion conf={res.conf} />
        </div>
        <p className={`${s.note} ${bug === 'none' ? s.noteOk : s.noteBad}`} role="status">
          {bug === 'mapping' && K === 2 ? SWAP_TEXT : BUG_TEXT[bug]}
        </p>
      </div>
    </Figure>
  )
}
