import { useEffect, useRef, useState } from 'react'

/*
  Canvas helpers for this lesson's feature-map thumbnails. Theme colours are read from CSS custom
  properties (so heat maps follow light/dark mode) and re-read when the theme changes.
*/

type RGB = [number, number, number]

function parse(s: string): RGB {
  const t = s.trim()
  if (t.startsWith('#')) {
    const h = t.length === 4 ? t.slice(1).split('').map((c) => c + c).join('') : t.slice(1, 7)
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  const m = t.match(/rgba?\(([^)]+)\)/)
  if (m) {
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number)
    return [p[0] || 0, p[1] || 0, p[2] || 0]
  }
  return [128, 128, 128]
}

/** [low, high] colours for heat maps: card surface → viz-1. */
export function useHeatColours(): [RGB, RGB] {
  const [cols, setCols] = useState<[RGB, RGB]>([
    [255, 255, 255],
    [58, 67, 209],
  ])
  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement)
      setCols([parse(cs.getPropertyValue('--surface') || '#ffffff'), parse(cs.getPropertyValue('--viz-1') || '#3a43d1')])
    }
    read()
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    mq?.addEventListener?.('change', read)
    const mo = new MutationObserver(read)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] })
    return () => {
      mq?.removeEventListener?.('change', read)
      mo.disconnect()
    }
  }, [])
  return cols
}

/** A 2-D map drawn as a heat map (min → surface, max → viz-1), scaled up with crisp pixels. */
export function HeatCanvas({ map, size, label }: { map: number[][]; size: number; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [lo, hi] = useHeatColours()
  const h = map.length
  const w = map[0]?.length ?? 0
  useEffect(() => {
    const c = ref.current
    if (!c || !h || !w) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const img = ctx.createImageData(w, h)
    let mn = Infinity
    let mx = -Infinity
    for (const row of map) for (const v of row) {
      mn = Math.min(mn, v)
      mx = Math.max(mx, v)
    }
    const span = mx - mn || 1
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const t = mx === mn ? 0 : (map[y][x] - mn) / span
        const i = (y * w + x) * 4
        img.data[i] = lo[0] + (hi[0] - lo[0]) * t
        img.data[i + 1] = lo[1] + (hi[1] - lo[1]) * t
        img.data[i + 2] = lo[2] + (hi[2] - lo[2]) * t
        img.data[i + 3] = 255
      }
    ctx.putImageData(img, 0, 0)
  }, [map, h, w, lo, hi])
  const aspect = h && w ? h / w : 1
  return (
    <canvas
      ref={ref}
      width={Math.max(1, w)}
      height={Math.max(1, h)}
      role="img"
      aria-label={label}
      style={{ width: size, height: size * aspect, imageRendering: 'pixelated', borderRadius: 3, border: '1px solid var(--rule)', display: 'block' }}
    />
  )
}

/** An RGB image (values 0..1, shape [3][H][W]) drawn with crisp pixels. */
export function RgbCanvas({ img, size, label }: { img: number[][][]; size: number; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const h = img[0].length
  const w = img[0][0].length
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    const data = ctx.createImageData(w, h)
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4
        data.data[i] = img[0][y][x] * 255
        data.data[i + 1] = img[1][y][x] * 255
        data.data[i + 2] = img[2][y][x] * 255
        data.data[i + 3] = 255
      }
    ctx.putImageData(data, 0, 0)
  }, [img, h, w])
  return <canvas ref={ref} width={w} height={h} role="img" aria-label={label} style={{ width: size, height: size, imageRendering: 'pixelated', borderRadius: 3, display: 'block' }} />
}
