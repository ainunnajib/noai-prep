import { useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Slider, Readout, usePlayer, PlayerControls, useContainerWidth, M } from '../../../../../kit'
import { comma } from '../big-o/format'
import s from '../big-o/algo.module.css'

/*
  Keep the k largest scores of a stream in a min-heap of size k (like Python's heapq).
  The root is the smallest of the current top k: the "gatekeeper". A new score only gets in if it
  beats the gatekeeper; then it replaces the root and sifts down. Every comparison is counted.
*/

const STREAM = [42, 77, 15, 63, 88, 51, 29, 95, 70, 34, 81, 58, 12, 99, 66, 47]

interface Snap {
  heap: number[]
  changed: number[] // heap indices touched in this step
  kept: boolean[] // per stream item processed so far: did it enter the heap?
  comparisons: number
  note: string
}

function simulate(k: number): Snap[] {
  const heap: number[] = []
  let comparisons = 0
  const kept: boolean[] = []
  const snaps: Snap[] = [{ heap: [], changed: [], kept: [], comparisons: 0, note: `Start with an empty heap. It will hold at most k = ${k} scores.` }]
  const swap = (i: number, j: number) => ([heap[i], heap[j]] = [heap[j], heap[i]])
  for (const x of STREAM) {
    const changed: number[] = []
    let note: string
    if (heap.length < k) {
      heap.push(x)
      let i = heap.length - 1
      changed.push(i)
      let moves = 0
      while (i > 0) {
        const p = Math.floor((i - 1) / 2)
        comparisons++
        if (heap[p] <= heap[i]) break
        swap(i, p)
        i = p
        changed.push(i)
        moves++
      }
      kept.push(true)
      note = `${x} arrives. The heap has room (fewer than ${k}), so push it and sift it up${moves ? `: it swapped upwards ${moves} time${moves > 1 ? 's' : ''}` : ': it is not smaller than its parent, so it stays'}.`
    } else {
      comparisons++
      if (x > heap[0]) {
        const old = heap[0]
        heap[0] = x
        let i = 0
        changed.push(0)
        let moves = 0
        for (;;) {
          const l = 2 * i + 1
          const r = l + 1
          let smallest = i
          if (l < heap.length) {
            comparisons++
            if (heap[l] < heap[smallest]) smallest = l
          }
          if (r < heap.length) {
            comparisons++
            if (heap[r] < heap[smallest]) smallest = r
          }
          if (smallest === i) break
          swap(i, smallest)
          i = smallest
          changed.push(i)
          moves++
        }
        kept.push(true)
        note = `${x} arrives and beats the gatekeeper ${old}, so ${old} is thrown out: ${x} replaces the root and sifts down${moves ? ` (${moves} swap${moves > 1 ? 's' : ''})` : ''}.`
      } else {
        kept.push(false)
        note = `${x} arrives but is not bigger than the gatekeeper ${heap[0]}: one comparison and it is discarded.`
      }
    }
    snaps.push({ heap: heap.slice(), changed, kept: kept.slice(), comparisons, note })
  }
  return snaps
}

export default function HeapTopK() {
  const [k, setK] = useState(3)
  const snaps = useMemo(() => simulate(k), [k])
  const player = usePlayer({ steps: snaps.length, interval: 1400 })
  useEffect(() => {
    player.setStep(snaps.length - 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k])
  const t = Math.min(player.step, snaps.length - 1)
  const snap = snaps[t]
  const [ref, width] = useContainerWidth<HTMLDivElement>(560)

  const W = Math.max(280, Math.min(width, 560))
  const levels = Math.max(1, Math.ceil(Math.log2(k + 1)))
  const r = 17
  const H = 26 + (levels - 1) * 58 + r + 8
  const pos = (i: number): [number, number] => {
    const L = Math.floor(Math.log2(i + 1))
    const idx = i - (2 ** L - 1)
    return [((idx + 0.5) * W) / 2 ** L, 26 + L * 58]
  }
  const top = snap.heap.slice().sort((a, b) => b - a)
  const n = STREAM.length
  const sortCost = Math.round(n * Math.log2(n))

  return (
    <Figure
      title="Top k from a stream, with a min-heap"
      caption={
        <>
          Press Restart, then Play or Next, and watch the scores arrive one at a time. The heap keeps the best <M>k</M> so far with the
          smallest of them at the root (orange ring): the gatekeeper. Most late arrivals are rejected with a single comparison. Change{' '}
          <M>k</M> and compare the comparison count with sorting all 16 scores.
        </>
      }
    >
      <div className={s.wrap} ref={ref}>
        <div>
          <div className={s.cellLabel} style={{ marginBottom: 4 }}>
            stream (left to right): green = in the heap now, struck out = rejected on arrival, grey = got in, later pushed out
          </div>
          <div className={s.cells}>
            {STREAM.map((v, i) => {
              const done = i < t
              const cur = i === t - 1
              const inHeap = done && snap.heap.includes(v)
              const rejected = done && !snap.kept[i]
              const evicted = done && snap.kept[i] && !inHeap
              return (
                <span
                  key={i}
                  className={s.cell}
                  style={{
                    minWidth: '1.9rem',
                    height: '1.9rem',
                    fontSize: '0.8rem',
                    borderColor: cur ? 'var(--viz-2)' : inHeap ? 'color-mix(in srgb, var(--viz-3) 70%, var(--surface))' : undefined,
                    background: cur ? 'color-mix(in srgb, var(--viz-2) 22%, var(--surface))' : inHeap ? 'color-mix(in srgb, var(--viz-3) 18%, var(--surface))' : undefined,
                    color: (rejected || evicted) && !cur ? 'var(--ink-3)' : undefined,
                    textDecoration: rejected && !cur ? 'line-through' : undefined,
                    borderStyle: done ? 'solid' : 'dashed',
                  }}
                >
                  {v}
                </span>
              )
            })}
          </div>
        </div>

        <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Min-heap holding ${snap.heap.join(', ') || 'nothing yet'}`} style={{ display: 'block', maxWidth: W, margin: '0 auto' }}>
          {snap.heap.map((_, i) => {
            if (i === 0) return null
            const [x1, y1] = pos(Math.floor((i - 1) / 2))
            const [x2, y2] = pos(i)
            return <line key={`e${i}`} x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.5 }} />
          })}
          {Array.from({ length: k }, (_, i) => {
            const [x, y] = pos(i)
            const v = snap.heap[i]
            const ch = snap.changed.includes(i)
            if (v === undefined)
              return <circle key={i} cx={x} cy={y} r={r} style={{ fill: 'none', stroke: 'var(--rule)', strokeDasharray: '4 3' }} />
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  style={{
                    fill: ch ? 'color-mix(in srgb, var(--viz-2) 30%, var(--surface))' : 'color-mix(in srgb, var(--viz-3) 18%, var(--surface))',
                    stroke: i === 0 ? 'var(--viz-2)' : 'color-mix(in srgb, var(--viz-3) 70%, var(--surface))',
                    strokeWidth: i === 0 ? 3 : 1.5,
                  }}
                />
                <text x={x} y={y} dy="0.35em" textAnchor="middle" style={{ fontSize: 13, fontWeight: 800, fill: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>
                  {v}
                </text>
              </g>
            )
          })}
        </svg>

        <div className={s.muted} style={{ textAlign: 'center' }}>
          orange ring: the root, the smallest of the current top {k} (the gatekeeper)
        </div>

        <div className={s.memRow}>
          <span className={s.cellLabel}>the same heap as a Python list (children of index i are at 2i + 1 and 2i + 2)</span>
          <div className={s.cells}>
            {Array.from({ length: k }, (_, i) => (
              <span key={i} style={{ display: 'inline-grid', justifyItems: 'center', gap: 2 }}>
                <span className={s.cell} style={{ borderStyle: snap.heap[i] === undefined ? 'dashed' : 'solid', borderColor: i === 0 && snap.heap.length ? 'var(--viz-2)' : undefined }}>
                  {snap.heap[i] ?? ''}
                </span>
                <span className={s.cellLabel}>{i}</span>
              </span>
            ))}
          </div>
        </div>

        <div className={s.verdict} aria-live="polite">
          {snap.note}
          {t === snaps.length - 1 && <> All {n} scores seen. Top {k}: <b>{top.join(', ')}</b>.</>}
        </div>
        <PlayerControls player={player} label={(i) => (i === 0 ? 'Start' : `Score ${i} of ${n}`)} />
        <Controls>
          <Slider label={<>keep the top <M>k</M></>} value={k} min={1} max={7} step={1} onChange={setK} />
          <Readout
            items={[
              ['heap comparisons', String(snap.comparisons)],
              [<>sort all 16 (≈ <M>{'n \\log_2 n'}</M>)</>, `≈ ${sortCost}`],
              [<>for <M>n</M> = 1 million: <M>{'n \\log_2 k'}</M> vs <M>{'n \\log_2 n'}</M></>, `${comma(1e6 * Math.max(1, Math.log2(k)))} vs ${comma(1e6 * Math.log2(1e6))}`],
            ]}
          />
        </Controls>
      </div>
    </Figure>
  )
}
