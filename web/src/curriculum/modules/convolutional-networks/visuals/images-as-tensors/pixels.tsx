import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/*
  Small helpers shared by this module's pixel visuals (images, feature maps).
  Pixel images are drawn on a <canvas> (one canvas pixel per image pixel, scaled up with
  nearest-neighbour), so even large grids stay cheap. Theme colours for heat maps are read
  from the CSS custom properties and re-read when the theme changes.
*/

export type RGB = [number, number, number]

export function parseColor(s: string): RGB {
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

export const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] * t + b[0] * (1 - t), a[1] * t + b[1] * (1 - t), a[2] * t + b[2] * (1 - t)]

/** Resolve CSS custom properties (e.g. '--viz-1') to RGB; re-resolves when the light/dark theme changes. */
export function useCssColors<K extends string>(names: readonly K[]): Record<K, RGB> | null {
  const [cols, setCols] = useState<Record<K, RGB> | null>(null)
  const key = names.join(',')
  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement)
      const out = {} as Record<K, RGB>
      for (const n of key.split(',') as K[]) out[n] = parseColor(cs.getPropertyValue(n) || '#808080')
      setCols(out)
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
  }, [key])
  return cols
}

/** Fill an RGBA buffer from a per-pixel colour function. */
export function rgbaFrom(w: number, h: number, f: (x: number, y: number) => RGB): Uint8ClampedArray {
  const buf = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const [r, g, b] = f(x, y)
      const i = (y * w + x) * 4
      buf[i] = r
      buf[i + 1] = g
      buf[i + 2] = b
      buf[i + 3] = 255
    }
  return buf
}

/**
 * A w×h pixel image drawn on a canvas and scaled to its container with crisp pixels.
 * `children` are drawn in an SVG overlay whose viewBox is 0 0 w h (one unit = one pixel).
 */
export function PixelCanvas({
  w,
  h,
  pixels,
  ariaLabel,
  children,
  maxWidth,
  style,
  overlayProps,
  grid,
}: {
  w: number
  h: number
  pixels: Uint8ClampedArray | null
  ariaLabel: string
  children?: ReactNode
  maxWidth?: number
  style?: CSSProperties
  overlayProps?: React.SVGProps<SVGSVGElement>
  /** draw faint pixel borders (only sensible for small grids) */
  grid?: boolean
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c || !pixels) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.putImageData(new ImageData(new Uint8ClampedArray(pixels), w, h), 0, 0)
  }, [pixels, w, h])
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth, lineHeight: 0, ...style }}>
      <canvas
        ref={ref}
        width={w}
        height={h}
        role="img"
        aria-label={ariaLabel}
        style={{ width: '100%', height: 'auto', imageRendering: 'pixelated', display: 'block', borderRadius: 4, background: 'var(--surface-2)' }}
      />
      {(children || grid) && (
        <svg
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
          aria-hidden="true"
          {...overlayProps}
        >
          {grid && (
            <g style={{ stroke: 'var(--surface)', strokeOpacity: 0.35 }} vectorEffect="non-scaling-stroke">
              {Array.from({ length: w - 1 }, (_, i) => (
                <line key={`v${i}`} x1={i + 1} x2={i + 1} y1={0} y2={h} style={{ strokeWidth: 1 }} vectorEffect="non-scaling-stroke" />
              ))}
              {Array.from({ length: h - 1 }, (_, i) => (
                <line key={`h${i}`} y1={i + 1} y2={i + 1} x1={0} x2={w} style={{ strokeWidth: 1 }} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
          )}
          {children}
        </svg>
      )}
    </div>
  )
}

/** Format big integers with thousands separators: 150528 -> "150,528". */
export const fmtInt = (n: number) => Math.round(n).toLocaleString('en-GB')

/** Compact big numbers: 150529000 -> "150.5 million". */
export function fmtBig(n: number): string {
  const a = Math.abs(n)
  if (a >= 1e9) return `${(n / 1e9).toFixed(a >= 1e11 ? 0 : 1)} billion`
  if (a >= 1e6) return `${(n / 1e6).toFixed(1)} million`
  return fmtInt(n)
}
