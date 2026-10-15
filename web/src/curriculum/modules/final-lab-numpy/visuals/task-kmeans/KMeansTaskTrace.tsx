import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Segmented, Plot, Grid, Axes, Dots, Arrow, Label, usePlayer, PlayerControls, useContainerWidth } from '../../../../../kit'
import { Notebook, NbCell, CodeLines, Note } from '../exam-notebook-skills/nb'
import { pyTuple } from '../exam-notebook-skills/pyfmt'
import { EXAM_POINTS, EXAM_INIT, PRACTICE_INIT, traceKMeans, round4 } from './km'
import { Star, Seg, CLUSTER_COLORS, fmt2 } from './parts'

/*
  Concept: the K-means task, traced.
  Step through the reference solution on the 2025 data: each assignment (with the distance
  table), each update (centroids slide to their cluster means), each stopping test, and the
  rounded return value. Switch to the practice start to see a point change cluster.
*/

const CODE = `def euclidean_distance(a, b):
    return np.sqrt(np.sum((np.array(a) - np.array(b)) ** 2))

def k_means_clustering(points, k, initial_centroids, max_iterations):
    points = np.array(points, dtype=float)
    centroids = np.array(initial_centroids, dtype=float)
    for _ in range(max_iterations):
        # assign: index of the nearest centroid for every point
        labels = np.array([np.argmin([euclidean_distance(p, c) for c in centroids])
                           for p in points])
        # update: mean of each cluster (keep the old centroid if empty)
        new_centroids = centroids.copy()
        for i in range(k):
            members = points[labels == i]
            if len(members) > 0:
                new_centroids[i] = members.mean(axis=0)
        # stop when no centroid moved
        if np.allclose(new_centroids, centroids):
            break
        centroids = new_centroids
    return [tuple(round(float(v), 4) for v in c) for c in centroids]`

type Kind = 'init' | 'assign' | 'update' | 'check' | 'return'
const LINES: Record<Kind, number[]> = {
  init: [4, 5],
  assign: [0, 1, 7, 8, 9],
  update: [10, 11, 12, 13, 14, 15],
  check: [16, 17, 18, 19],
  return: [20],
}
const f4 = (v: number) => (Number.isInteger(v) ? String(v) : (Math.round(v * 1e4) / 1e4).toString())
const pt4 = (p: number[]) => `(${p.map(f4).join(', ')})`

export default function KMeansTaskTrace() {
  const [start, setStart] = useState<'exam' | 'practice'>('exam')
  const init = start === 'exam' ? EXAM_INIT : PRACTICE_INIT
  const frames = useMemo(() => traceKMeans(EXAM_POINTS, init, 10), [init])
  const steps = useMemo(() => {
    const s: { kind: Kind; f: number }[] = [{ kind: 'init', f: -1 }]
    frames.forEach((_, f) => s.push({ kind: 'assign', f }, { kind: 'update', f }, { kind: 'check', f }))
    s.push({ kind: 'return', f: frames.length - 1 })
    return s
  }, [frames])
  const player = usePlayer({ steps: steps.length, interval: 2400 })
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(720)
  const narrow = width < 640
  const st = steps[Math.min(player.step, steps.length - 1)]
  const fr = st.f >= 0 ? frames[st.f] : undefined
  const last = frames[frames.length - 1]

  const centroidsNow = st.kind === 'init' ? init : st.kind === 'assign' ? fr!.before : st.kind === 'return' ? last.before : fr!.after
  const labels = st.kind === 'init' ? undefined : fr!.labels
  const result = round4(last.before)

  let note: ReactNode
  if (st.kind === 'init') note = <>Start from the given centroids, in the given order: C1 = {pt4(init[0])} and C2 = {pt4(init[1])}. Convert the lists of tuples to arrays first: tuples cannot be subtracted.</>
  else if (st.kind === 'assign') {
    const changed = st.f > 0 ? fr!.labels.filter((l, i) => l !== frames[st.f - 1].labels[i]).length : 0
    note = (
      <>
        Iteration {st.f + 1}: every point measures its distance to both centroids and joins the nearer one (the dashed lines).
        {st.f > 0 && (changed ? ` ${changed} point${changed > 1 ? 's' : ''} changed cluster.` : ' No point changed cluster.')}
      </>
    )
  } else if (st.kind === 'update')
    note = (
      <>
        Each centroid moves to the mean of its members: C1 → {pt4(fr!.after[0])}, C2 → {pt4(fr!.after[1])}. They moved {fmt2(fr!.moves[0])} and {fmt2(fr!.moves[1])}.
      </>
    )
  else if (st.kind === 'check')
    note = fr!.stop ? (
      <>No centroid moved, so <code>np.allclose</code> is True: <strong>break</strong>. Converged after {st.f + 1} iterations, well within max_iterations = 10.</>
    ) : (
      <>The centroids moved, so loop again with the new ones.</>
    )
  else
    note = (
      <>
        Return a list of tuples, each coordinate rounded to 4 d.p.: <code>{`[${result.map(pyTuple).join(', ')}]`}</code>
        {start === 'practice' ? '. Same clusters as the exam start, but in the opposite order: centroid i stays tied to initial_centroids[i].' : ', the official answer.'}
      </>
    )

  const plot = (
    <Plot x={[0, 12]} y={[-1, 11]} width={400} height={400} ariaLabel="The six exam points, the two centroids, and the current assignment">
      <Grid xTicks={6} yTicks={6} />
      <Axes xTicks={6} yTicks={6} />
      {st.kind === 'assign' &&
        EXAM_POINTS.map((p, i) => <Seg key={i} a={p} b={fr!.before[labels![i]]} color={CLUSTER_COLORS[labels![i]]} />)}
      <Dots
        points={EXAM_POINTS.map((p, i) => ({
          x: p[0],
          y: p[1],
          color: labels ? CLUSTER_COLORS[labels[i]] : 'var(--viz-muted)',
          r: 6,
        }))}
      />
      {EXAM_POINTS.map((p, i) => (
        <Label key={`l${i}`} x={p[0]} y={p[1]} dx={p[0] > 6 ? -10 : 10} dy={4} anchor={p[0] > 6 ? 'end' : 'start'} size={11} color="var(--ink-3)">
          ({p[0]}, {p[1]})
        </Label>
      ))}
      {(st.kind === 'update' || st.kind === 'check') && fr!.before.map((c, i) => <Star key={`g${i}`} x={c[0]} y={c[1]} color={CLUSTER_COLORS[i]} ghost />)}
      {st.kind === 'update' &&
        fr!.before.map((c, i) => (fr!.moves[i] > 0.05 ? <Arrow key={`a${i}`} from={c as [number, number]} to={fr!.after[i] as [number, number]} color={CLUSTER_COLORS[i]} width={2} /> : null))}
      {centroidsNow.map((c, i) => (
        <Star key={i} x={c[0]} y={c[1]} color={CLUSTER_COLORS[i]} label={`C${i + 1}`} />
      ))}
    </Plot>
  )

  const table =
    st.kind === 'assign' ? (
      <table style={{ fontSize: '0.8rem', borderCollapse: 'collapse', width: '100%', maxWidth: 420 }} className="tabular">
        <thead>
          <tr style={{ color: 'var(--ink-3)', textAlign: 'right' }}>
            <th style={{ textAlign: 'left', padding: '0.15rem 0.3rem' }}>point</th>
            <th style={{ padding: '0.15rem 0.3rem', color: CLUSTER_COLORS[0] }}>to C1</th>
            <th style={{ padding: '0.15rem 0.3rem', color: CLUSTER_COLORS[1] }}>to C2</th>
            <th style={{ padding: '0.15rem 0.3rem' }}>joins</th>
          </tr>
        </thead>
        <tbody>
          {EXAM_POINTS.map((p, i) => (
            <tr key={i} style={{ borderTop: '1px solid var(--rule)', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
              <td style={{ textAlign: 'left', padding: '0.15rem 0.3rem' }}>({p.join(', ')})</td>
              {fr!.d[i].map((d, j) => (
                <td key={j} style={{ padding: '0.15rem 0.3rem', fontWeight: labels![i] === j ? 700 : 400, color: labels![i] === j ? CLUSTER_COLORS[j] : 'var(--ink-3)' }}>
                  {d.toFixed(3)}
                </td>
              ))}
              <td style={{ padding: '0.15rem 0.3rem', color: CLUSTER_COLORS[labels![i]], fontWeight: 700 }}>C{labels![i] + 1}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <table style={{ fontSize: '0.8rem', borderCollapse: 'collapse', width: '100%', maxWidth: 420 }} className="tabular">
        <thead>
          <tr style={{ color: 'var(--ink-3)', textAlign: 'right' }}>
            <th style={{ textAlign: 'left', padding: '0.15rem 0.3rem' }}>centroid log</th>
            <th style={{ padding: '0.15rem 0.3rem', color: CLUSTER_COLORS[0] }}>C1</th>
            <th style={{ padding: '0.15rem 0.3rem', color: CLUSTER_COLORS[1] }}>C2</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderTop: '1px solid var(--rule)', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
            <td style={{ textAlign: 'left', padding: '0.15rem 0.3rem', fontFamily: 'var(--font-body)' }}>start</td>
            <td style={{ padding: '0.15rem 0.3rem' }}>{pt4(init[0])}</td>
            <td style={{ padding: '0.15rem 0.3rem' }}>{pt4(init[1])}</td>
          </tr>
          {frames
            .filter((_, f) => f < st.f || (f === st.f && st.kind !== 'assign'))
            .map((f, k) => (
              <tr key={k} style={{ borderTop: '1px solid var(--rule)', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                <td style={{ textAlign: 'left', padding: '0.15rem 0.3rem', fontFamily: 'var(--font-body)' }}>after iteration {k + 1}</td>
                <td style={{ padding: '0.15rem 0.3rem' }}>{pt4(f.after[0])}</td>
                <td style={{ padding: '0.15rem 0.3rem' }}>{pt4(f.after[1])}</td>
              </tr>
            ))}
        </tbody>
      </table>
    )

  return (
    <Figure
      title="Trace the 2025 K-means task line by line"
      caption={
        <>
          Press <strong>Next</strong> to run one block at a time: assign (dashed lines to the nearest star), update (stars slide to their cluster means), check (did anything
          move?). Then switch to the practice start, where one point changes cluster in iteration 2. Compare the centroid log with what your own code prints.
        </>
      }
      wide
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.7rem' }}>
        <Controls>
          <Segmented
            label="Initial centroids"
            value={start}
            onChange={(v) => {
              setStart(v)
              player.reset()
            }}
            options={[
              { value: 'exam', label: 'Exam: (2, 2), (10, 1)' },
              { value: 'practice', label: 'Practice: (2, 4), (2, 8)' },
            ]}
          />
        </Controls>
        <div style={{ display: 'grid', gap: '0.7rem', width: '100%', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)', alignItems: 'center' }}>
          {plot}
          <div style={{ display: 'grid', gap: '0.6rem', justifyItems: 'center', alignContent: 'start' }}>
            {table}
            <Note title={st.kind === 'init' ? 'Initialise.' : st.kind === 'assign' ? 'Assign.' : st.kind === 'update' ? 'Update.' : st.kind === 'check' ? 'Check.' : 'Return.'}>{note}</Note>
          </div>
        </div>
        <PlayerControls
          player={player}
          label={(i) => {
            const s = steps[Math.min(i, steps.length - 1)]
            return s.kind === 'init' || s.kind === 'return' ? `${s.kind === 'init' ? 'Start' : 'Return'} · step ${i + 1} of ${steps.length}` : `Iteration ${s.f + 1}: ${s.kind} · step ${i + 1} of ${steps.length}`
          }}
        />
        <Notebook ariaLabel="The reference solution with the running block highlighted">
          <NbCell prompt="In [8]:" tags={[{ text: 'your answer', tone: 'answer' }]}>
            <CodeLines code={CODE} mark={(i) => (LINES[st.kind].includes(i) ? 'hl' : undefined)} wrap compact={width < 560} />
          </NbCell>
        </Notebook>

      </div>
    </Figure>
  )
}
