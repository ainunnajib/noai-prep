import { useEffect, useRef, useState } from 'react'

/*
  A small grey-scale image drawn on a <canvas>, scaled up with crisp pixels. Values in [-1, 1]
  (the range diffusion models use) are mapped from the page background colour (-1) to the
  theme's ink colour (+1), so the picture works in light and dark mode. Values outside [-1, 1]
  are clipped, as when a diffusion model's output is turned into an image.
*/

type RGB = [number, number, number]

function parseColor(s: string): RGB {
  const t = s.trim()
  if (t.startsWith('#')) {
    const h = t.slice(1)
    if (h.length === 3) return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  const m = t.match(/rgba?\(([^)]+)\)/)
  if (m) {
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number)
    return [p[0] || 0, p[1] || 0, p[2] || 0]
  }
  return [128, 128, 128]
}

/** reads --surface and --viz-1 and re-reads them when the theme changes */
function useThemeRamp(): [RGB, RGB] | null {
  const [cols, setCols] = useState<[RGB, RGB] | null>(null)
  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement)
      setCols([parseColor(cs.getPropertyValue('--surface') || '#ffffff'), parseColor(cs.getPropertyValue('--viz-1') || '#3a43d1')])
    }
    read()
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    mq?.addEventListener?.('change', read)
    const mo = new MutationObserver(read)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] })
    return () => {
      mq?.removeEventListener?.('change', read)
      mo.disconnect()
    }
  }, [])
  return cols
}

export function GreyImage({ values, size, ariaLabel, maxWidth = 150 }: { values: Float32Array | number[]; size: number; ariaLabel: string; maxWidth?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const ramp = useThemeRamp()
  useEffect(() => {
    const c = ref.current
    if (!c || !ramp) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const img = ctx.createImageData(size, size)
    const [lo, hi] = ramp
    for (let i = 0; i < size * size; i++) {
      const v = Math.max(-1, Math.min(1, values[i]))
      const t = (v + 1) / 2
      img.data[i * 4] = lo[0] + (hi[0] - lo[0]) * t
      img.data[i * 4 + 1] = lo[1] + (hi[1] - lo[1]) * t
      img.data[i * 4 + 2] = lo[2] + (hi[2] - lo[2]) * t
      img.data[i * 4 + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
  }, [values, size, ramp])
  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      role="img"
      aria-label={ariaLabel}
      style={{
        width: '100%',
        maxWidth,
        aspectRatio: '1 / 1',
        height: 'auto',
        imageRendering: 'pixelated',
        display: 'block',
        margin: '0 auto',
        borderRadius: 4,
        border: '1px solid var(--rule)',
        background: 'var(--surface-2)',
      }}
    />
  )
}
