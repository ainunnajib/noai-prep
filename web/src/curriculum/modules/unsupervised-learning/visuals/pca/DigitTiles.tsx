/*
  A row of 8x8 greyscale images drawn as ONE svg. Pixels are grouped into a few shade levels and each
  level is a single <path>, so even 20 images cost only a few dozen SVG elements.
  mode 'ink': values 0..16, drawn as ink on the card (works in light and dark themes).
  mode 'signed': values in [-1, 1], negative in --viz-1, positive in --viz-2 (for principal components).
*/

const LEVELS = 12

export default function DigitTiles({
  images,
  mode = 'ink',
  ariaLabel,
  maxTile = 46,
}: {
  images: number[][]
  mode?: 'ink' | 'signed'
  ariaLabel: string
  maxTile?: number
}) {
  const n = images.length
  const gap = 1.5
  const W = n * 8 + (n - 1) * gap
  // paths[sign][level] -> path data
  const paths: string[][] = [Array(LEVELS + 1).fill(''), Array(LEVELS + 1).fill('')]
  images.forEach((img, k) => {
    const ox = k * (8 + gap)
    let scale = 16
    if (mode === 'signed') scale = Math.max(1e-9, ...img.map(Math.abs))
    for (let p = 0; p < 64; p++) {
      const v = img[p] / scale
      const t = Math.max(0, Math.min(1, Math.abs(v)))
      const lvl = Math.round(t * LEVELS)
      if (lvl === 0) continue
      const sign = mode === 'signed' && v < 0 ? 0 : 1
      const x = ox + (p % 8)
      const y = Math.floor(p / 8)
      paths[sign][lvl] += `M${x},${y}h1.02v1.02h-1.02z`
    }
  })
  const colour = (sign: number, lvl: number) => {
    const pct = Math.round((100 * lvl) / LEVELS)
    if (mode === 'ink') return `color-mix(in srgb, var(--viz-ink) ${pct}%, var(--surface))`
    return `color-mix(in srgb, ${sign === 0 ? 'var(--viz-1)' : 'var(--viz-2)'} ${pct}%, var(--surface))`
  }
  return (
    <svg viewBox={`-0.2 -0.2 ${W + 0.4} 8.4`} role="img" aria-label={ariaLabel} style={{ width: '100%', maxWidth: n * maxTile, display: 'block', margin: '0 auto' }}>
      {images.map((_, k) => (
        <rect key={k} x={k * (8 + gap)} y={0} width={8} height={8} style={{ fill: 'var(--surface)', stroke: 'var(--rule)', strokeWidth: 0.12 }} />
      ))}
      {paths.map((row, sign) => row.map((d, lvl) => (d ? <path key={`${sign}-${lvl}`} d={d} style={{ fill: colour(sign, lvl) }} /> : null)))}
    </svg>
  )
}
