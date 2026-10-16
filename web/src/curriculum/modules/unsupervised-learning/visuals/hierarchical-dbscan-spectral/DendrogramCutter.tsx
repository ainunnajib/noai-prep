import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Button, Plot, Path, Label, Axes, usePlot, useNarrow } from '../../../../../kit'
import { clusterColour, tint, fmt, convexHull, type Pt } from '../k-means/clustering'
import { HullBlob, Note, DragHandle } from '../k-means/parts'
import { agglomerate, leafOrder, cutTree, type Linkage, type Merge } from './graphs'

/*
  Agglomerative clustering of 15 labelled points, shown two ways at once: the scatter plot and the
  dendrogram (merge tree). Dragging the horizontal cut chooses how many clusters you get; the clusters
  below the cut are coloured identically in both views. The next merge above the cut is drawn on the
  scatter: the pair of points that defines its linkage distance (closest pair for single linkage,
  farthest pair for complete linkage, all pairs averaged for average linkage).
  Merge heights were checked against scipy.cluster.hierarchy.linkage.
*/

const P: Pt[] = [
  [1.1, 6.75],
  [1.95, 7.4],
  [2.4, 6.15],
  [1.55, 5.6],
  [3.15, 7.05],
  [6.85, 6.7],
  [7.6, 7.25],
  [8.2, 6.4],
  [7.3, 5.7],
  [8.85, 7.5],
  [5.75, 2.7],
  [6.4, 1.75],
  [7.35, 2.75],
  [6.0, 3.4],
  [3.9, 4.2],
]
const N = P.length
const NAMES = 'ABCDEFGHIJKLMNO'.split('')
const nameSet = (m: number[]) =>
  m
    .slice()
    .sort((a, b) => a - b)
    .map((i) => NAMES[i])
    .join('')

/** a cut height that leaves exactly k clusters (halfway between the two relevant merges) */
function heightForK(merges: Merge[], k: number): number {
  const hs = merges.map((m) => m.height)
  const top = hs[hs.length - 1]
  if (k <= 1) return top * 1.04
  if (k >= N) return hs[0] / 2
  // k clusters remain after the first N - k merges
  return (hs[N - k - 1] + hs[N - k]) / 2
}

interface Tree {
  merges: Merge[]
  order: number[]
  pos: number[] // x position of every node (leaves 0..N-1, merges N..)
}

function buildTree(linkage: Linkage): Tree {
  const merges = agglomerate(P, linkage)
  const order = leafOrder(N, merges)
  const pos = new Array(2 * N - 1).fill(0)
  order.forEach((leaf, i) => (pos[leaf] = i))
  merges.forEach((m, k) => (pos[N + k] = (pos[m.a] + pos[m.b]) / 2))
  return { merges, order, pos }
}

function Dendrogram({ tree, h, labels, onCut, top }: { tree: Tree; h: number; labels: number[]; onCut: (h: number) => void; top: number }) {
  const { merges, order, pos } = tree
  const nodeHeight = (id: number) => (id < N ? 0 : merges[id - N].height)
  const nodeColour = (id: number) => {
    const first = id < N ? id : merges[id - N].members[0]
    return clusterColour(labels[first])
  }
  const muted = 'var(--viz-muted)'
  return (
    <>
      <Axes yLabel="merge height" hideXTicks yTicks={4} />
      {merges.map((m, k) => {
        const id = N + k
        const above = m.height > h
        const xa = pos[m.a]
        const xb = pos[m.b]
        const legs = [m.a, m.b].map((c) => {
          const x = pos[c]
          const y0 = nodeHeight(c)
          if (!above) return <Path key={c} points={[[x, y0], [x, m.height]]} color={nodeColour(id)} width={2.4} />
          const split = Math.max(y0, Math.min(h, m.height))
          return (
            <g key={c}>
              {split > y0 && <Path points={[[x, y0], [x, split]]} color={nodeColour(c)} width={2.4} />}
              <Path points={[[x, split], [x, m.height]]} color={muted} width={1.8} />
            </g>
          )
        })
        return (
          <g key={id}>
            {legs}
            <Path points={[[xa, m.height], [xb, m.height]]} color={above ? muted : nodeColour(id)} width={above ? 1.8 : 2.4} />
          </g>
        )
      })}
      {order.map((leaf, i) => (
        <Label key={leaf} x={i} y={0} dy={15} anchor="middle" size={12} weight={700} color={clusterColour(labels[leaf])}>
          {NAMES[leaf]}
        </Label>
      ))}
      <Path points={[[-0.6, h], [N - 0.4, h]]} color="var(--viz-ink)" width={1.6} dash="6 4" />
      <Label x={-0.4} y={h} dy={-6} size={11} weight={700}>
        cut
      </Label>
      <DragHandle x={N - 0.5} y={h} lockX ariaLabel="Cut height (drag up or down)" valueText={`height ${h.toFixed(2)}`} onChange={(_, y) => onCut(Math.max(0.02, Math.min(top * 0.995, y)))} />
    </>
  )
}

function ScatterView({ labels, next, linkage }: { labels: number[]; next: Merge | null; linkage: Linkage }) {
  const { xs, ys } = usePlot()
  const k = Math.max(...labels) + 1
  const groups = Array.from({ length: k }, (_, c) => P.filter((_, i) => labels[i] === c))
  let A: number[] = []
  let B: number[] = []
  if (next) {
    // split the next merge's members back into its two sides
    const la = labels[next.pair[0]]
    const lb = labels[next.pair[1]]
    A = next.members.filter((i) => labels[i] === la)
    B = next.members.filter((i) => labels[i] === lb)
  }
  return (
    <>
      {groups.map((g, c) => (
        <HullBlob key={c} points={convexHull(g)} colour={tint(c, 60)} pad={12} opacity={0.45} />
      ))}
      {next && linkage === 'average' && A.flatMap((i) => B.map((j) => <Path key={`${i}-${j}`} points={[P[i], P[j]]} color="var(--viz-ink)" width={1} opacity={0.25} />))}
      {next && (
        <Path points={[P[next.pair[0]], P[next.pair[1]]]} color="var(--viz-ink)" width={2} dash="5 3" opacity={linkage === 'average' ? 0 : 1} />
      )}
      {P.map((p, i) => (
        <g key={i}>
          <circle cx={xs(p[0])} cy={ys(p[1])} r={5.5} style={{ fill: clusterColour(labels[i]), stroke: 'var(--surface)', strokeWidth: 1.5 }} />
          <text className="plot-label" x={xs(p[0]) + 7} y={ys(p[1]) - 6} style={{ fontSize: 12, fontWeight: 700 }}>
            {NAMES[i]}
          </text>
        </g>
      ))}
    </>
  )
}

export default function DendrogramCutter() {
  const [linkage, setLinkage] = useState<Linkage>('single')
  const trees = useMemo(() => ({ single: buildTree('single'), complete: buildTree('complete'), average: buildTree('average') }), [])
  const tree = trees[linkage]
  const top = tree.merges[N - 2].height * 1.1
  const [h, setH] = useState(() => heightForK(trees.single.merges, 3))
  const [ref, narrow] = useNarrow<HTMLDivElement>(620)

  const labels = cutTree(N, tree.merges, h, tree.order)
  const k = Math.max(...labels) + 1
  const next = tree.merges.find((m) => m.height > h) ?? null

  const changeLinkage = (l: Linkage) => {
    setH(heightForK(trees[l].merges, k))
    setLinkage(l)
  }
  const stepTo = (kk: number) => setH(heightForK(tree.merges, Math.max(1, Math.min(N, kk))))

  let nextText = 'All points are already in one cluster.'
  if (next) {
    const la = labels[next.pair[0]]
    const lb = labels[next.pair[1]]
    const A = next.members.filter((i) => labels[i] === la)
    const B = next.members.filter((i) => labels[i] === lb)
    const how =
      linkage === 'single'
        ? `the closest pair, ${NAMES[next.pair[0]]}–${NAMES[next.pair[1]]}, is ${fmt(next.height, 2)} apart`
        : linkage === 'complete'
          ? `the farthest pair, ${NAMES[next.pair[0]]}–${NAMES[next.pair[1]]}, is ${fmt(next.height, 2)} apart`
          : A.length * B.length === 1
            ? `with one point on each side, the average is just the distance ${NAMES[next.pair[0]]}–${NAMES[next.pair[1]]}`
            : `the average of all ${A.length * B.length} pairwise distances (grey lines) is ${fmt(next.height, 2)}`
    nextText = `Next merge: {${nameSet(A)}} with {${nameSet(B)}} at height ${fmt(next.height, 2)}, because ${how}.`
  }

  const scatter = (
    <Plot x={[0.3, 9.7]} y={[0.9, 8.1]} width={360} height={286} maxWidth={460} margin={{ left: 10, right: 10, top: 10, bottom: 10 }} ariaLabel={`15 points A to O coloured into ${k} clusters by cutting the ${linkage}-linkage tree at height ${fmt(h, 2)}`}>
      <ScatterView labels={labels} next={next} linkage={linkage} />
    </Plot>
  )
  const dendro = (
    <Plot x={[-0.7, N - 0.3]} y={[0, top]} width={360} height={286} maxWidth={460} margin={{ left: 40, right: 14, top: 18, bottom: 26 }} ariaLabel={`Dendrogram for ${linkage} linkage, cut at height ${fmt(h, 2)}, giving ${k} clusters`}>
      <Dendrogram tree={tree} h={h} labels={labels} onCut={setH} top={top} />
    </Plot>
  )

  return (
    <Figure
      wide
      title="Cut the dendrogram"
      caption={
        <>
          Drag the round handle on the <b>cut</b> line (or use the merge buttons). Every vertical line the cut crosses is one cluster, coloured the same in
          both views. Lower the cut all the way to see the first merges (the closest pairs), raise it to see groups join. Then cut at 2 clusters and
          switch the linkage: single linkage chains the left and bottom groups together through the bridge point O, while complete and average linkage
          join the bottom group to the right group instead and keep clusters compact. One run of the algorithm gives
          every possible number of clusters; the cut only chooses among them.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: '0.75rem', alignItems: 'start' }}>
        <div style={{ display: 'grid', justifyItems: 'center', minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)' }}>The points, coloured by cluster</div>
          {scatter}
        </div>
        <div style={{ display: 'grid', justifyItems: 'center', minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)' }}>The merge tree (dendrogram)</div>
          {dendro}
        </div>
      </div>
      <Note>{nextText}</Note>
      <Readout
        items={[
          ['cut height', fmt(h, 2)],
          ['clusters', String(k)],
          ['linkage', linkage],
        ]}
      />
      <Controls>
        <Segmented
          label="Linkage (distance between two clusters)"
          value={linkage}
          onChange={changeLinkage}
          options={[
            { value: 'single', label: 'Single (closest pair)' },
            { value: 'complete', label: 'Complete (farthest pair)' },
            { value: 'average', label: 'Average' },
          ]}
        />
        <Button onClick={() => stepTo(k + 1)} disabled={k >= N}>
          Undo a merge
        </Button>
        <Button primary onClick={() => stepTo(k - 1)} disabled={k <= 1}>
          Next merge
        </Button>
      </Controls>
    </Figure>
  )
}
