import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/** useLayoutEffect in a real browser (runs before paint); useEffect when rendering to a string in the jsdom content tests. */
const useIsoLayoutEffect = typeof navigator !== 'undefined' && !/jsdom/i.test(navigator.userAgent) ? useLayoutEffect : useEffect

/**
 * Measures the rendered width of an element. Visuals use it to size their SVG viewBox in real
 * pixels so text stays legible on phones. Falls back to `fallback` where ResizeObserver is missing.
 * The first measurement happens before the browser paints, so a phone never sees (or scrolls to)
 * the wide desktop layout for a frame.
 */
export function useContainerWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(fallback)
  // true once the real width is known: visuals with CSS transitions can wait for it, so nothing animates in from the fallback layout
  const [measured, setMeasured] = useState(false)
  useIsoLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    // Reading the width makes the browser style the fallback layout; switch transitions off inside this element until the
    // measured layout has been applied, or elements would animate in from their fallback positions (see global.css).
    el.setAttribute('data-measuring', '')
    const first = el.getBoundingClientRect().width
    if (first) setWidth(Math.round(first))
    setMeasured(true)
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w) setWidth((cur) => (Math.abs(w - cur) > 1 ? Math.round(w) : cur))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useIsoLayoutEffect(() => {
    const el = ref.current
    if (!measured || !el || !el.hasAttribute('data-measuring')) return
    void el.offsetWidth // apply the measured layout while transitions are still off
    el.removeAttribute('data-measuring')
  }, [measured, width])
  return [ref, width, measured] as const
}

/** True when the element is narrower than `threshold` px (phones). Use to switch layouts inside a visual. */
export function useNarrow<T extends HTMLElement>(threshold = 520) {
  const [ref, width] = useContainerWidth<T>(threshold + 1)
  return [ref, width < threshold] as const
}
