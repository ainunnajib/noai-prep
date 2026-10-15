import { useMemo } from 'react'
import { Figure, useContainerWidth } from '../../../../../kit'
import s from '../big-o/algo.module.css'

/*
  Merge sort counted level by level: 16 numbers start as 16 one-item groups, and each level merges
  neighbouring groups in pairs (8 groups of 2, 4 of 4, 2 of 8, 1 of 16). Every level touches all 16
  items, so it costs fewer than 16 comparisons; there are log2(16) = 4 levels, so the total stays
  under 16 × 4 = 64. The comparison counts are the real ones for this list.
*/

const START = [40, 3, 35, 26, 44, 22, 67, 31, 62, 7, 58, 11, 53, 15, 18, 49]
const N = START.length

function merge(a: number[], b: number[]) {
  const out: number[] = []
  let i = 0
  let j = 0
  let comps = 0
  while (i < a.length && j < b.length) {
    comps++
    out.push(a[i] <= b[j] ? a[i++] : b[j++])
  }
  return { out: out.concat(a.slice(i), b.slice(j)), comps }
}

interface Level {
  groups: number[][]
  comps: number
}

function levels(): Level[] {
  const res: Level[] = [{ groups: START.map((v) => [v]), comps: 0 }]
  while (res[res.length - 1].groups.length > 1) {
    const prev = res[res.length - 1].groups
    const groups: number[][] = []
    let comps = 0
    for (let g = 0; g < prev.length; g += 2) {
      const m = merge(prev[g], prev[g + 1] ?? [])
      groups.push(m.out)
      comps += m.comps
    }
    res.push({ groups, comps })
  }
  return res
}

export default function MergeLevels() {
  const [ref, width] = useContainerWidth<HTMLDivElement>(560)
  const rows = useMemo(levels, [])
  const total = rows.reduce((t, r) => t + r.comps, 0)
  const depth = rows.length - 1

  const W = Math.max(280, Math.min(width, 560))
  const gap = 4
  const cw = (W - 2 - (N - 1) * gap) / N
  const ch = Math.min(26, Math.max(20, cw))
  const fs = cw >= 24 ? 12 : cw >= 17 ? 10.5 : 9.5
  const labelH = 18
  const rowH = labelH + ch + 10
  const H = rows.length * rowH + 4

  return (
    <Figure
      title="Merge sort, level by level"
      caption={
        <>
          Each row is one level of merging. A box is one sorted group. Every level handles all {N} items once, so it needs fewer
          than {N} comparisons; halving {N} down to 1 takes log₂ {N} = {depth} levels. So the total can never pass {N} × {depth} ={' '}
          {N * depth}, which is <i>n</i> log₂ <i>n</i>. For this list it took {total}.
        </>
      }
    >
      <div className={s.wrap} ref={ref}>
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Merge sort of ${N} numbers in ${depth} levels: ${rows
            .slice(1)
            .map((r, i) => `level ${i + 1}, ${r.comps} comparisons`)
            .join('; ')}; ${total} in total, at most ${N * depth}.`}
          style={{ display: 'block', maxWidth: W, margin: '0 auto' }}
        >
          {rows.map((r, L) => {
            const size = r.groups[0].length
            const y = L * rowH + labelH
            const label =
              L === 0
                ? `Start: ${N} groups of 1`
                : `Level ${L}: ${r.groups.length} group${r.groups.length === 1 ? '' : 's'} of ${size}`
            return (
              <g key={L}>
                <text x={1} y={y - 5} style={{ fontSize: 12, fontWeight: 700, fill: 'var(--ink)' }}>
                  {label}
                </text>
                {L > 0 && (
                  <text x={W - 1} y={y - 5} textAnchor="end" style={{ fontSize: 12, fill: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>
                    {r.comps} comparisons
                  </text>
                )}
                {r.groups.map((grp, g) => {
                  const x0 = 1 + g * size * (cw + gap)
                  const tint = g % 2 ? 'var(--viz-2)' : 'var(--viz-1)'
                  return (
                    <g key={g}>
                      <rect
                        x={x0 - 1}
                        y={y - 1}
                        width={size * cw + (size - 1) * gap + 2}
                        height={ch + 2}
                        rx={5}
                        style={{ fill: `color-mix(in srgb, ${tint} 14%, var(--surface))`, stroke: tint, strokeWidth: 1.5 }}
                      />
                      {grp.map((v, k) => (
                        <text
                          key={k}
                          x={x0 + k * (cw + gap) + cw / 2}
                          y={y + ch / 2}
                          dy="0.35em"
                          textAnchor="middle"
                          style={{ fontSize: fs, fontWeight: 700, fill: 'var(--ink)', fontFamily: 'var(--font-mono)' }}
                        >
                          {v}
                        </text>
                      ))}
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>
      </div>
    </Figure>
  )
}
