import { useEffect, useRef, useState } from 'react'

/**
 * True when the measured container is narrower than `threshold` px (phones), so a visual can
 * switch to a taller plot shape there. Starts as false (wide) until measured.
 */
export function useNarrow<T extends HTMLElement>(threshold = 520) {
  const ref = useRef<T>(null)
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w) setNarrow(w < threshold)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [threshold])
  return [ref, narrow] as const
}
