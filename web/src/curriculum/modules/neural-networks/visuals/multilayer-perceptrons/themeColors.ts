import { useEffect, useState } from 'react'

/*
  Canvas cannot read CSS variables, so canvas-drawn visuals resolve the theme tokens to RGB here
  and re-read them whenever the light/dark theme changes.
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

/** a·t + b·(1 − t) */
export const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] * t + b[0] * (1 - t), a[1] * t + b[1] * (1 - t), a[2] * t + b[2] * (1 - t)]

export const css = (c: RGB, alpha = 1) => `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${alpha})`

/** Resolve CSS custom properties (e.g. '--viz-1') to RGB; re-resolves when the theme changes. */
export function useThemeRGB<K extends string>(names: readonly K[]): Record<K, RGB> | null {
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
