import { useEffect, useRef, useState } from 'react'

/**
 * Measures the rendered width of an element. Visuals use it to size their SVG viewBox in real
 * pixels so text stays legible on phones. Falls back to `fallback` where ResizeObserver is missing.
 */
export function useContainerWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(fallback)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w && Math.abs(w - width) > 1) setWidth(Math.round(w))
    })
    ro.observe(el)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return [ref, width] as const
}

/** True when the element is narrower than `threshold` px (phones). Use to switch layouts inside a visual. */
export function useNarrow<T extends HTMLElement>(threshold = 520) {
  const [ref, width] = useContainerWidth<T>(threshold + 1)
  return [ref, width < threshold] as const
}
