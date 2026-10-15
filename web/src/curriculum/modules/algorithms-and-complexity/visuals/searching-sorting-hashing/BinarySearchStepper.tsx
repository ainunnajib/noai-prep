import { useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Slider, Toggle, Readout, usePlayer, PlayerControls, useContainerWidth } from '../../../../../kit'
import s from '../big-o/algo.module.css'

/*
  Binary search drawn as a trace: one row per comparison. Cells outside the live range [lo, hi]
  fade out, the middle cell that gets compared is highlighted. The same code is run on a shuffled
  copy of the list to show that halving only works on sorted data.
*/

const SORTED = [3, 7, 11, 15, 18, 22, 26, 31, 35, 40, 44, 49, 53, 58, 62, 67]
// A fixed shuffle in which binary search misses 44 although it is at index 4.
const SHUFFLED = [40, 3, 35, 26, 44, 22, 67, 31, 62, 7, 58, 11, 53, 15, 18, 49]
const N = SORTED.length

interface Probe {
  lo: number
  hi: number
  mid: number
  v: number
  cmp: '<' | '>' | '='
}

function binarySearch(a: number[], t: number) {
  const probes: Probe[] = []
  let lo = 0
  let hi = a.length - 1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    const v = a[mid]
    const cmp = v === t ? '=' : v < t ? '<' : '>'
    probes.push({ lo, hi, mid, v, cmp })
    if (cmp === '=') return { probes, found: mid }
    if (cmp === '<') lo = mid + 1
    else hi = mid - 1
  }
  return { probes, found: -1, end: { lo, hi } }
}

function describe(p: Probe, t: number, k: number) {
  const head = `${k}. Middle of [${p.lo}…${p.hi}] is index ${p.mid}: a[${p.mid}] = ${p.v}.`
  if (p.cmp === '=') return `${head} That is ${t}: found!`
  if (p.cmp === '<') return `${head} ${p.v} < ${t}, so ${t} can only be to the right: lo = ${p.mid + 1}.`
  return `${head} ${p.v} > ${t}, so ${t} can only be to the left: hi = ${p.mid - 1}.`
}

export default function BinarySearchStepper() {
  const [target, setTarget] = useState(44)
  const [shuffled, setShuffled] = useState(false)
  const [ref, width] = useContainerWidth<HTMLDivElement>(560)
  const a = shuffled ? SHUFFLED : SORTED
  const res = useMemo(() => binarySearch(a, target), [a, target])
  const T = res.probes.length
  const player = usePlayer({ steps: T + 1, interval: 1100 })
  // Show the finished search whenever the question changes (complete at rest); Restart replays it.
  useEffect(() => {
    player.setStep(T)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, shuffled, T])

  const f = Math.min(player.step, T)
  const done = f === T
  const truePos = a.indexOf(target)
  const linear = truePos >= 0 ? truePos + 1 : N

  const W = Math.max(280, Math.min(width, 640))
  const cw = (W - 2) / N
  const ch = Math.min(30, Math.max(24, cw))
  const fs = cw >= 26 ? 13 : cw >= 21 ? 11.5 : 10
  const rowGap = 6
  const showEmptyRow = done && res.found < 0
  const rows = Math.max(1, f) + (showEmptyRow ? 1 : 0)
  const top = 18
  const H = top + rows * (ch + rowGap)

  const rowRanges: { lo: number; hi: number; mid?: number; cmp?: Probe['cmp'] }[] = []
  if (f === 0) rowRanges.push({ lo: 0, hi: N - 1 })
  for (let i = 0; i < f; i++) rowRanges.push(res.probes[i])
  if (showEmptyRow && res.end) rowRanges.push({ lo: res.end.lo, hi: res.end.hi })

  let status: string
  if (f === 0) status = `Looking for ${target}. The whole list is still in play: lo = 0, hi = ${N - 1}.`
  else status = describe(res.probes[f - 1], target, f)
  if (done && res.found < 0) {
    status += ` Now lo > hi: the range is empty, so binary search reports "not found".`
    if (truePos >= 0) status += ` But ${target} IS in the list, at index ${truePos}. On unsorted data the halves tell you nothing.`
  }
  if (done && res.found >= 0 && shuffled) status += ' (Lucky! Try other targets: on unsorted data most are missed.)'

  return (
    <Figure
      title="Binary search: halve, and halve again"
      caption={
        <>
          Each row is one comparison. Faded cells have been ruled out; the orange cell is the middle item being compared. Slide the target (try
          values that are missing, such as 50) and press Restart then Play to watch it step by step. Then switch on <b>Shuffle</b>: the same
          code on unsorted data throws away the wrong half and misses numbers that are right there: the dashed green outline marks where the target really
          is, and a green fill means found.
        </>
      }
    >
      <div className={s.wrap} ref={ref}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Binary search for ${target}: ${T} comparisons, ${res.found >= 0 ? 'found' : 'not found'}`} style={{ display: 'block', maxWidth: W }}>
          {a.map((_, j) => (
            <text
              key={j}
              x={1 + j * cw + cw / 2}
              y={11}
              textAnchor="middle"
              style={{ fontSize: 10, fill: j === truePos ? 'var(--viz-3)' : 'var(--ink-3)', fontWeight: j === truePos ? 800 : 500, fontFamily: 'var(--font-mono)' }}
            >
              {j}
            </text>
          ))}
          {rowRanges.map((r, i) => {
            const y = top + i * (ch + rowGap)
            const empty = r.lo > r.hi
            return (
              <g key={i}>
                {a.map((v, j) => {
                  const inRange = !empty && j >= r.lo && j <= r.hi
                  const isMid = j === r.mid
                  const c = isMid ? (r.cmp === '=' ? 'var(--viz-3)' : 'var(--viz-2)') : null
                  return (
                    <g key={j} opacity={inRange ? 1 : 0.28}>
                      <rect
                        x={1 + j * cw + 1}
                        y={y}
                        width={cw - 2}
                        height={ch}
                        rx={4}
                        style={{
                          fill: c ? `color-mix(in srgb, ${c} 35%, var(--surface))` : inRange ? 'color-mix(in srgb, var(--viz-1) 12%, var(--surface))' : 'var(--surface-2)',
                          stroke: c ?? (inRange ? 'color-mix(in srgb, var(--viz-1) 45%, var(--surface))' : 'var(--rule)'),
                          strokeWidth: c ? 2 : 1,
                        }}
                      />
                      <text x={1 + j * cw + cw / 2} y={y + ch / 2} dy="0.35em" textAnchor="middle" style={{ fontSize: fs, fontWeight: 700, fill: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>
                        {v}
                      </text>
                    </g>
                  )
                })}
                {/* where the target really is: a dashed green ring at full strength, even when that cell has been ruled out */}
                {a.map((_, j) =>
                  shuffled && j === truePos && !(j === r.mid && r.cmp === '=') ? (
                    <rect
                      key={`true${j}`}
                      x={1 + j * cw}
                      y={y - 1}
                      width={cw}
                      height={ch + 2}
                      rx={5}
                      style={{ fill: 'none', stroke: 'var(--viz-3)', strokeWidth: 2, strokeDasharray: '4 3' }}
                    />
                  ) : null,
                )}
              </g>
            )
          })}
        </svg>
        <div className={s.verdict} aria-live="polite">
          {status}
        </div>
        <PlayerControls player={player} label={(k) => (k === 0 ? 'Start' : `Comparison ${Math.min(k, T)} of ${T}`)} />
        <Controls>
          <Slider label="target" value={target} min={0} max={70} step={1} onChange={setTarget} />
          <Toggle label="Shuffle the list (unsorted)" checked={shuffled} onChange={setShuffled} />
          <Readout
            items={[
              ['binary search', `${T} comparison${T === 1 ? '' : 's'}`],
              ['linear search', `${linear} comparison${linear === 1 ? '' : 's'}`],
            ]}
          />
        </Controls>
      </div>
    </Figure>
  )
}
