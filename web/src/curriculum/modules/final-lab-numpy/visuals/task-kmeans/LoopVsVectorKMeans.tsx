import { useMemo, useState } from 'react'
import { Figure, Plot, Grid, Axes, DraggablePoint, Button, Label, mulberry32, useContainerWidth } from '../../../../../kit'
import { Notebook, NbCell, CodeLines, Note, nbStyles as s } from '../exam-notebook-skills/nb'
import { pyTuple } from '../exam-notebook-skills/pyfmt'
import { Mat } from '../task-linear-regression-gd/Mat'
import { EXAM_POINTS, EXAM_INIT, kmLoops, kmVectorised, round4, type Pt } from './km'
import { Star, CLUSTER_COLORS } from './parts'

/*
  Concept: the vectorised version.
  The same algorithm written twice: Python loops over points and coordinates, and NumPy
  broadcasting with argmin and boolean masks. Drag the points or shuffle the data; both
  versions are run on every change and must return identical centroids.
*/

const LOOPS = `import math

def k_means_loops(points, k, initial_centroids, max_iterations):
    centroids = [tuple(map(float, c)) for c in initial_centroids]
    for _ in range(max_iterations):
        clusters = [[] for _ in range(k)]
        for p in points:                        # assign
            d = [math.dist(p, c) for c in centroids]
            clusters[d.index(min(d))].append(p)
        new = []
        for i, members in enumerate(clusters):  # update
            if members:
                new.append(tuple(sum(x) / len(members)
                                 for x in zip(*members)))
            else:
                new.append(centroids[i])        # empty: keep it
        if new == centroids:                    # converged
            break
        centroids = new
    return [tuple(round(v, 4) for v in c) for c in centroids]`

const VEC = `def k_means_vectorised(points, k, initial_centroids, max_iterations):
    P = np.array(points, dtype=float)              # (n, d)
    C = np.array(initial_centroids, dtype=float)   # (k, d)
    for _ in range(max_iterations):
        diff = P[:, None, :] - C[None, :, :]       # (n, k, d)
        D = np.sqrt((diff ** 2).sum(axis=2))       # (n, k)
        labels = D.argmin(axis=1)                  # (n,)
        new_C = np.array([P[labels == i].mean(axis=0)
                          if np.any(labels == i) else C[i]
                          for i in range(k)])
        if np.allclose(new_C, C):
            break
        C = new_C
    return [tuple(round(float(v), 4) for v in c) for c in C]`

const snap = (v: number) => Math.round(v * 2) / 2

function shuffledData(seed: number): Pt[] {
  const rng = mulberry32(seed * 104729 + 7)
  return Array.from({ length: 6 }, () => [snap(rng() * 11 + 0.5), snap(rng() * 10.5)])
}

export default function LoopVsVectorKMeans() {
  const [pts, setPts] = useState<Pt[]>(EXAM_POINTS.map((p) => [...p]))
  const [seed, setSeed] = useState(0)
  const [touched, setTouched] = useState(false)
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(720)
  const narrow = width < 560

  const loops = useMemo(() => round4(kmLoops(pts, EXAM_INIT, 10)), [pts])
  const vec = useMemo(() => kmVectorised(pts, EXAM_INIT, 10), [pts])
  const vecOut = round4(vec.centroids)
  const outL = `[${loops.map(pyTuple).join(', ')}]`
  const outV = `[${vecOut.map(pyTuple).join(', ')}]`
  const same = outL === outV

  const move = (i: number, x: number, y: number) => {
    setTouched(true)
    setPts((ps) => ps.map((p, k) => (k === i ? [snap(x), snap(y)] : p)))
  }

  return (
    <Figure
      title="Loops or broadcasting: same algorithm, same answer"
      caption={
        <>
          Drag any point (or shuffle the data) and both versions run again on the new data, starting from the exam's centroids (2, 2) and (10, 1). The matrix shows the
          vectorised version&apos;s first distance matrix <code>D</code>: one row per point, one column per starting centroid, with each row&apos;s smallest entry (the{' '}
          <code>argmin</code>) outlined in the colour of the cluster it picks. Notice the two outputs always agree.
        </>
      }
      wide
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.7rem' }}>
        <div
          style={{ display: 'grid', gap: '0.7rem', width: '100%', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1fr) minmax(0, 1fr)', alignItems: 'center', userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          <Plot x={[0, 12]} y={[-1, 11]} width={360} height={340} ariaLabel="Six points you can drag, coloured by their final cluster">
            <Grid xTicks={6} yTicks={6} />
            <Axes xTicks={6} yTicks={6} />
            {EXAM_INIT.map((c, i) => (
              <Star key={`i${i}`} x={c[0]} y={c[1]} color={CLUSTER_COLORS[i]} ghost r={8} />
            ))}
            {vec.centroids.map((c, i) => (
              <Star key={`c${i}`} x={c[0]} y={c[1]} color={CLUSTER_COLORS[i]} label={`C${i + 1}`} />
            ))}
            {pts.map((p, i) => {
              const d = vec.centroids.map((c) => Math.hypot(p[0] - c[0], p[1] - c[1]))
              const lab = d.indexOf(Math.min(...d))
              return <DraggablePoint key={i} x={p[0]} y={p[1]} r={7} color={CLUSTER_COLORS[lab]} onChange={(x, y) => move(i, x, y)} />
            })}
            {!touched && seed === 0 && (
              <Label x={pts[0][0]} y={pts[0][1]} dx={12} dy={4} size={11} color="var(--ink-3)">
                drag any point
              </Label>
            )}
          </Plot>
          <div style={{ display: 'grid', justifyItems: 'center', gap: '0.4rem' }}>
            <Mat
              data={vec.firstD}
              label="D = distances in iteration 1, shape (6, 2)"
              format={(v) => v.toFixed(2)}
              cells={vec.firstLabels.map((l, i) => [i, l] as [number, number])}
              cellColor={(_, j) => CLUSTER_COLORS[j]}
              colLabels={EXAM_INIT.map((_, j) => (
                <span key={j} style={{ color: CLUSTER_COLORS[j], fontWeight: 700 }}>
                  to C{j + 1}
                </span>
              ))}
              rowLabels={pts.map((p) => `(${p[0]}, ${p[1]})`)}
            />
            <div className={s.mono} style={{ fontSize: '0.82rem' }}>
              labels = D.argmin(axis=1) = [{vec.firstLabels.join(' ')}]
            </div>
            <div className={s.row} style={{ justifyContent: 'center' }}>
              <Button
                onClick={() => {
                  const next = seed + 1
                  setSeed(next)
                  setPts(shuffledData(next))
                }}
              >
                Shuffle data
              </Button>
              <Button onClick={() => (setPts(EXAM_POINTS.map((p) => [...p])), setSeed(0))}>Exam data</Button>
            </div>
            {seed > 0 && <div style={{ fontSize: '0.78rem', color: 'var(--ink-3)' }}>random data set #{seed}</div>}
          </div>
        </div>
        <div style={{ display: 'grid', gap: '0.6rem', width: '100%' }}>
          <Notebook ariaLabel="Loop version">
            <NbCell prompt="In [1]:" tags={[{ text: 'loops: standard library only', tone: 'plain' }]} output={outL} outputLabel="Out:" outputKind={same ? 'ok' : 'bad'}>
              <CodeLines code={LOOPS} wrap compact={narrow} />
            </NbCell>
          </Notebook>
          <Notebook ariaLabel="Vectorised version">
            <NbCell prompt="In [2]:" tags={[{ text: 'vectorised: NumPy', tone: 'plain' }]} output={outV} outputLabel="Out:" outputKind={same ? 'ok' : 'bad'}>
              <CodeLines code={VEC} wrap compact={narrow} />
            </NbCell>
          </Notebook>
        </div>
        <Note tone={same ? 'ok' : 'bad'} title={same ? 'Identical.' : 'They differ!'}>
          {same ? (
            <>
              Both return <code>{outV}</code>. The broadcast <code>P[:, None, :] - C[None, :, :]</code> builds every point-minus-centroid difference at once, which is the
              loop's <code>for p in points</code> and <code>for c in centroids</code> written as one array operation.
            </>
          ) : (
            <>The two outputs disagree on this data. Look for a tie in the distance matrix.</>
          )}
        </Note>
      </div>
    </Figure>
  )
}
