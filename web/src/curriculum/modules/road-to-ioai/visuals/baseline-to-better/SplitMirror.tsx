import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Toggle, Button, Plot, Rect, usePlot, useBump, mulberry32, Bars } from '../../../../../kit'

/*
  A scan classifier where every patient contributes 5 near-identical scans, and the hidden test set
  is made of NEW patients. A 1-nearest-neighbour model is scored with 5-fold cross-validation that
  splits either random rows or whole patients, and then tested for real on 150 new patients.
  Random rows put sibling scans of the same patient on both sides, so validation turns into a
  memory test and overestimates the real score; splitting by patient mirrors the test.
*/

const PATIENTS = 60
const PER = 5
const TEST_PATIENTS = 150
const FOLDS = 5

interface Scan {
  x: number
  y: number
  label: 0 | 1
  patient: number
}

function makeData(seed: number) {
  const rnd = mulberry32(seed)
  const normal = () => {
    const u = Math.max(1e-12, rnd())
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd())
  }
  const gen = (n: number, offset: number): Scan[] => {
    const out: Scan[] = []
    for (let p = 0; p < n; p++) {
      const cx = rnd() * 10
      const cy = rnd() * 10
      const label: 0 | 1 = cx + cy + 2.5 * normal() > 10 ? 1 : 0
      for (let k = 0; k < PER; k++) out.push({ x: cx + 0.3 * normal(), y: cy + 0.3 * normal(), label, patient: offset + p })
    }
    return out
  }
  const train = gen(PATIENTS, 0)
  const test = gen(TEST_PATIENTS, 1000)
  // fold assignment for rows and for patients (shuffled)
  const shuffle = (n: number) => {
    const a = Array.from({ length: n }, (_, i) => i)
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const rowOrder = shuffle(train.length)
  const rowFold = new Array<number>(train.length)
  rowOrder.forEach((r, i) => (rowFold[r] = i % FOLDS))
  const patOrder = shuffle(PATIENTS)
  const patFold = new Array<number>(PATIENTS)
  patOrder.forEach((p, i) => (patFold[p] = i % FOLDS))
  const groupFold = train.map((s) => patFold[s.patient])
  return { train, test, rowFold, groupFold }
}

/** index of the nearest training scan to q among those where use[i] is true */
function nearest(train: Scan[], use: boolean[], q: { x: number; y: number }) {
  let best = -1
  let bd = Infinity
  for (let i = 0; i < train.length; i++) {
    if (!use[i]) continue
    const d = (train[i].x - q.x) ** 2 + (train[i].y - q.y) ** 2
    if (d < bd) {
      bd = d
      best = i
    }
  }
  return best
}

function Links({ links }: { links: { a: Scan; b: Scan; sibling: boolean }[] }) {
  const { xs, ys } = usePlot()
  return (
    <g aria-hidden="true">
      {links.map((l, i) => (
        <line
          key={i}
          x1={xs(l.a.x)}
          y1={ys(l.a.y)}
          x2={xs(l.b.x)}
          y2={ys(l.b.y)}
          style={{ stroke: l.sibling ? 'var(--viz-neg)' : 'var(--viz-pos)', strokeWidth: 2.2, opacity: 0.95 }}
        />
      ))}
    </g>
  )
}

function hull(pts: [number, number][]): [number, number][] {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  if (p.length < 3) return p
  const cross = (o: [number, number], a: [number, number], b: [number, number]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lower: [number, number][] = []
  for (const q of p) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop()
    lower.push(q)
  }
  const upper: [number, number][] = []
  for (const q of [...p].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop()
    upper.push(q)
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1))
}

/** Each patient's 5 scans wrapped in a soft rounded blob (a convex hull drawn with a wide round stroke). */
function PatientBlobs({ scans }: { scans: Scan[] }) {
  const { xs, ys } = usePlot()
  const groups = new Map<number, [number, number][]>()
  for (const s of scans) {
    if (!groups.has(s.patient)) groups.set(s.patient, [])
    groups.get(s.patient)!.push([xs(s.x), ys(s.y)])
  }
  const tint = 'color-mix(in srgb, var(--viz-axis) 16%, transparent)'
  return (
    <g aria-hidden="true">
      {[...groups.values()].map((g, i) => {
        const h = hull(g)
        const d = h.map(([x, y], k) => `${k ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('') + 'Z'
        return <path key={i} d={d} style={{ fill: tint, stroke: tint, strokeWidth: 15, strokeLinejoin: 'round', strokeLinecap: 'round' }} />
      })}
    </g>
  )
}

function ScanDots({ scans, valMask }: { scans: Scan[]; valMask: boolean[] }) {
  const { xs, ys } = usePlot()
  return (
    <g>
      {scans.map((s, i) => {
        const c = s.label ? 'var(--viz-2)' : 'var(--viz-1)'
        const val = valMask[i]
        return val ? (
          <circle key={i} cx={xs(s.x)} cy={ys(s.y)} r={4.6} style={{ fill: 'var(--surface)', stroke: c, strokeWidth: 2.2 }} />
        ) : (
          <circle key={i} cx={xs(s.x)} cy={ys(s.y)} r={3} style={{ fill: c, opacity: 0.75 }} />
        )
      })}
    </g>
  )
}

export default function SplitMirror() {
  const [mode, setMode] = useState<'rows' | 'patients'>('rows')
  const [showLinks, setShowLinks] = useState(true)
  const [seed, bump] = useBump()
  const data = useMemo(() => makeData(7 + seed * 101), [seed])

  const stats = useMemo(() => {
    const fold = mode === 'rows' ? data.rowFold : data.groupFold
    let correct = 0
    let siblings = 0
    const n = data.train.length
    const links: { a: Scan; b: Scan; sibling: boolean }[] = []
    for (let f = 0; f < FOLDS; f++) {
      const use = fold.map((k) => k !== f)
      for (let i = 0; i < n; i++) {
        if (fold[i] !== f) continue
        const j = nearest(data.train, use, data.train[i])
        if (data.train[j].label === data.train[i].label) correct++
        const sib = data.train[j].patient === data.train[i].patient
        if (sib) siblings++
        if (f === 0) links.push({ a: data.train[i], b: data.train[j], sibling: sib })
      }
    }
    const all = data.train.map(() => true)
    let testCorrect = 0
    for (const q of data.test) if (data.train[nearest(data.train, all, q)].label === q.label) testCorrect++
    return {
      cv: correct / n,
      test: testCorrect / data.test.length,
      siblingShare: siblings / n,
      links,
      valMask: fold.map((k) => k === 0),
    }
  }, [data, mode])

  const gap = (stats.cv - stats.test) * 100
  const pct = (v: number) => `${(v * 100).toFixed(1)}%`

  return (
    <Figure
      title="Does your validation look like the test?"
      caption={
        <>
          Each patient (60 of them) has 5 scans that look almost the same, and the hidden test set contains <strong>new patients</strong>. Rings are the validation scans of fold 1; each line joins a
          validation scan to the training scan the 1-nearest-neighbour model copies its answer from. Switch between splitting random rows and splitting whole patients, then press{' '}
          <em>New data</em> a few times. Splitting rows lets a scan find its own twin in training (red lines), so validation becomes a memory test and overestimates the real score.
        </>
      }
    >
      <Plot x={[-1, 11]} y={[-1, 11]} width={420} height={380} margin={{ left: 8, right: 8, top: 8, bottom: 8 }} ariaLabel="Scatter plot of patient scans in two classes, each patient circled, with validation scans drawn as rings and lines to their nearest training scans.">
        <Rect x0={-1} x1={11} y0={-1} y1={11} fill="none" stroke="var(--viz-grid)" />
        <PatientBlobs scans={data.train} />
        {showLinks && <Links links={stats.links} />}
        <ScanDots scans={data.train} valMask={stats.valMask} />
      </Plot>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.25rem 0.9rem', fontSize: '0.8rem', color: 'var(--ink-2)' }} aria-hidden="true">
        <span>
          <span style={{ color: 'var(--viz-1)' }}>●</span> healthy
        </span>
        <span>
          <span style={{ color: 'var(--viz-2)' }}>●</span> disease
        </span>
        <span>○ validation scan (fold 1)</span>
        <span>shaded blob: one patient's 5 scans</span>
        {showLinks && (
          <>
            <span>
              <span style={{ color: 'var(--viz-neg)', fontWeight: 800 }}>—</span> copies its own patient
            </span>
            <span>
              <span style={{ color: 'var(--viz-pos)', fontWeight: 800 }}>—</span> copies another patient
            </span>
          </>
        )}
      </div>
      <Controls>
        <Segmented
          label="Split"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'rows', label: 'random rows' },
            { value: 'patients', label: 'whole patients' },
          ]}
        />
        <Toggle label="Show nearest-neighbour lines" checked={showLinks} onChange={setShowLinks} />
        <Button onClick={bump}>New data</Button>
      </Controls>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <Bars
          ariaLabel="Validation estimate compared with the real score on new patients"
          max={1}
          format={(v) => pct(v)}
          data={[
            { label: '5-fold CV estimate', value: stats.cv, color: mode === 'rows' ? 'var(--viz-neg)' : 'var(--viz-pos)', strong: true },
            { label: 'real score, new patients', value: stats.test, color: 'var(--viz-5)' },
          ]}
        />
      </div>
      <Readout
        items={[
          ['validation scans whose nearest neighbour is the same patient', pct(stats.siblingShare)],
          ['overestimate', `${gap >= 0 ? '+' : ''}${gap.toFixed(1)} points`],
        ]}
      />
    </Figure>
  )
}
