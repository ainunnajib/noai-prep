/*
  One dot in a score strip (ConfusionThreshold, ROCTracer).
  A wrong prediction gets a red ring with a gap in the surface colour between the ring and a smaller
  coloured core. The gap keeps the ring visible on orange dots, whose colour is close to the red in
  dark mode, and the ringed shape still reads as "wrong" where the two colours are hard to tell apart.
*/

export function ScoreDot({ cx, cy, r, color, wrong }: { cx: number; cy: number; r: number; color: string; wrong: boolean }) {
  if (!wrong) return <circle cx={cx} cy={cy} r={r} style={{ fill: color, stroke: 'var(--surface)', strokeWidth: 1 }} />
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 0.2} style={{ fill: 'var(--surface)', stroke: 'var(--viz-neg)', strokeWidth: 1.6 }} />
      <circle cx={cx} cy={cy} r={Math.max(1.2, r - 1.4)} style={{ fill: color }} />
    </g>
  )
}
