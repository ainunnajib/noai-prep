import { useEffect, useState } from 'react'

/*
  Canvas drawing cannot use CSS variables directly, so this hook reads the theme tokens as RGB
  triples and re-reads them when the site theme (data-theme on <html>) or the OS colour scheme changes.
*/

export type RGB = [number, number, number]

function parse(c: string): RGB {
  const s = c.trim()
  if (s.startsWith('#')) {
    const h = s.length === 4 ? s.slice(1).split('').map((x) => x + x).join('') : s.slice(1, 7)
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  const m = s.match(/[\d.]+/g)
  if (m && m.length >= 3) return [Number(m[0]), Number(m[1]), Number(m[2])]
  return [128, 128, 128]
}

export function useThemeColours(names: string[]): RGB[] {
  const key = names.join('|')
  const read = () => {
    if (typeof window === 'undefined') return names.map((): RGB => [128, 128, 128])
    const cs = getComputedStyle(document.documentElement)
    return names.map((n) => parse(cs.getPropertyValue(n) || '#808080'))
  }
  const [cols, setCols] = useState<RGB[]>(read)
  useEffect(() => {
    const update = () => setCols(read())
    update()
    const mo = new MutationObserver(update)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] })
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    mq?.addEventListener?.('change', update)
    return () => {
      mo.disconnect()
      mq?.removeEventListener?.('change', update)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return cols
}

/** Mix two colours: t = 0 gives a, t = 1 gives b. */
export const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
