import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Segmented, Button, Bars, usePlayer, PlayerControls, useContainerWidth, useBump, mulberry32, shuffled, M } from '../../../../../kit'
import { FRAMES, type Algo } from './sorting'
import s from '../big-o/algo.module.css'

/*
  Watch bubble, insertion or merge sort on the same list of bars. Every frame is one comparison.
  The table underneath counts the comparisons all three algorithms need on this exact list.
*/

type Order = 'random' | 'nearly' | 'reversed'

function makeList(n: number, order: Order, seed: number): number[] {
  const base = Array.from({ length: n }, (_, i) => i + 1)
  if (order === 'reversed') return base.reverse()
  const rng = mulberry32(1000 * n + 17 * seed + (order === 'nearly' ? 5 : 1))
  if (order === 'random') return shuffled(base, rng)
  // nearly sorted: a few neighbouring pairs swapped
  const a = base.slice()
  const swaps = Math.max(1, Math.round(n / 8))
  for (let k = 0; k < swaps; k++) {
    const i = Math.floor(rng() * (n - 1))
    ;[a[i], a[i + 1]] = [a[i + 1], a[i]]
  }
  return a
}

const ALGO_LABEL: Record<Algo, string> = { bubble: 'bubble sort', insertion: 'insertion sort', merge: 'merge sort' }
const SPEEDS = { slow: 420, medium: 120, fast: 30 }

export default function SortVisualizer() {
  const [algo, setAlgo] = useState<Algo>('bubble')
  const [n, setN] = useState(16)
  const [order, setOrder] = useState<Order>('random')
  const [speed, setSpeed] = useState<keyof typeof SPEEDS>('medium')
  const [seed, bump] = useBump()
  const [ref, width] = useContainerWidth<HTMLDivElement>(560)

  const list = useMemo(() => makeList(n, order, seed), [n, order, seed])
  const frames = useMemo(() => FRAMES[algo](list), [algo, list])
  const counts = useMemo(() => (['bubble', 'insertion', 'merge'] as Algo[]).map((x) => (() => { const f = FRAMES[x](list); return f[f.length - 1].comparisons })()), [list])
  const player = usePlayer({ steps: frames.length, interval: SPEEDS[speed] })
  const fr = frames[Math.min(player.step, frames.length - 1)]

  const W = Math.max(260, Math.min(width, 640))
  const H = 170
  const pad = 4
  const bw = (W - 2 * pad) / n
  const unit = (H - 20) / n
  const quad = (n * (n - 1)) / 2
  const nlogn = n * Math.log2(n)

  const reset = (fn: () => void) => {
    fn()
    player.reset()
  }

  return (
    <Figure
      title="Sorting race"
      caption={
        <>
          Press Play. Orange bars are being compared, green bars are in their final place (for insertion sort: the sorted "hand" so far), and
          for merge sort the shaded band is the part being merged. Then compare the counts underneath and slide <M>n</M> up to 32: on random bars,
          bubble and insertion sort need hundreds of comparisons, merge sort only about a hundred. Try "nearly sorted": insertion sort barely
          has to work. At <M>n = 8</M> insertion sort can even beat merge sort: Big-O is about what happens for large <M>n</M>.
        </>
      }
    >
      <div className={s.wrap} ref={ref}>
        <Segmented label="Algorithm" value={algo} onChange={(v) => reset(() => setAlgo(v))} options={(['bubble', 'insertion', 'merge'] as Algo[]).map((v) => ({ value: v, label: ALGO_LABEL[v] }))} />
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${ALGO_LABEL[algo]} on ${n} bars, step ${player.step + 1} of ${frames.length}`} style={{ display: 'block', maxWidth: W, margin: '0 auto' }}>
          {fr.range && (
            <rect x={pad + fr.range[0] * bw} y={0} width={(fr.range[1] - fr.range[0]) * bw} height={H - 14} rx={4} style={{ fill: 'color-mix(in srgb, var(--viz-5) 14%, transparent)' }} />
          )}
          {fr.a.map((v, i) => {
            const isCmp = fr.cmp.includes(i)
            const isSorted = fr.sorted[i]
            const isMoved = fr.moved.includes(i)
            const c = isCmp ? 'var(--viz-2)' : isSorted ? 'var(--viz-3)' : 'var(--viz-1)'
            const pct = isCmp ? 90 : isSorted ? 72 : isMoved ? 75 : 60
            const h = v * unit
            return (
              <rect
                key={i}
                x={pad + i * bw + Math.min(2, bw * 0.12)}
                y={H - 16 - h}
                width={Math.max(1, bw - 2 * Math.min(2, bw * 0.12))}
                height={h}
                rx={Math.min(3, bw / 4)}
                style={{ fill: `color-mix(in srgb, ${c} ${pct}%, var(--surface))`, transition: 'y 80ms, height 80ms' }}
              />
            )
          })}
          <line x1={pad} x2={W - pad} y1={H - 15.5} y2={H - 15.5} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1 }} />
          {fr.range && (
            <text x={pad + ((fr.range[0] + fr.range[1]) / 2) * bw} y={H - 3} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--viz-5)', fontWeight: 700 }}>
              merging
            </text>
          )}
        </svg>
        <div className={s.verdict} aria-live="polite">
          <b>{fr.comparisons}</b> comparison{fr.comparisons === 1 ? '' : 's'} so far. {fr.note}
        </div>
        <PlayerControls player={player} label={(k) => `${k + 1} / ${frames.length}`} />
        <Controls>
          <Slider label={<>number of bars <M>n</M></>} value={n} min={8} max={32} step={4} onChange={(v) => reset(() => setN(v))} />
          <Segmented
            label="Starting order"
            value={order}
            onChange={(v) => reset(() => setOrder(v))}
            options={[
              { value: 'random', label: 'random' },
              { value: 'nearly', label: 'nearly sorted' },
              { value: 'reversed', label: 'reversed' },
            ]}
          />
          <Segmented
            label="Speed"
            value={speed}
            onChange={setSpeed}
            options={[
              { value: 'slow', label: 'slow' },
              { value: 'medium', label: 'medium' },
              { value: 'fast', label: 'fast' },
            ]}
          />
          {order === 'random' && <Button onClick={() => reset(bump)}>New random list</Button>}
          <Button onClick={() => player.setStep(frames.length - 1)}>Jump to the end</Button>
        </Controls>
        <div style={{ width: '100%' }}>
          <div className={s.summaryHead} style={{ fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
            Comparisons needed for this exact list of {n} bars
          </div>
          <Bars
            ariaLabel="Comparisons needed by each algorithm"
            max={quad}
            format={(v) => String(Math.round(v))}
            data={[
              { label: 'bubble', value: counts[0], color: 'var(--viz-1)', strong: algo === 'bubble' },
              { label: 'insertion', value: counts[1], color: 'var(--viz-5)', strong: algo === 'insertion' },
              { label: 'merge', value: counts[2], color: 'var(--viz-3)', strong: algo === 'merge' },
            ]}
          />
          <div className={s.muted} style={{ marginTop: '0.35rem' }}>
            For reference: <M>{`n(n-1)/2 = ${quad}`}</M> (every pair) and <M>{`n \\log_2 n \\approx ${Math.round(nlogn)}`}</M>.
          </div>
        </div>
      </div>
    </Figure>
  )
}
