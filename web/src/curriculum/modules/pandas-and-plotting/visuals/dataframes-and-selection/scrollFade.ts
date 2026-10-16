import { useEffect, useState, type CSSProperties, type RefObject } from 'react'

/*
  Tables in this module keep a readable font size on phones and scroll sideways instead of
  shrinking. This hook fades the edge of a horizontally scrolling element while more content is
  hidden on that side, so learners can see that there is more to scroll to.
*/

const FADE = 28

/** `contentKey`: pass something that changes whenever the content changes (a tab, a mode), so the edges are re-measured. */
export function useScrollFade(ref: RefObject<HTMLElement | null>, contentKey?: unknown): CSSProperties {
  const [edges, setEdges] = useState<{ left: boolean; right: boolean }>({ left: false, right: false })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const left = el.scrollLeft > 2
      const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 2
      setEdges((e) => (e.left === left && e.right === right ? e : { left, right }))
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(update)
      ro.observe(el)
      if (el.firstElementChild) ro.observe(el.firstElementChild)
    }
    return () => {
      el.removeEventListener('scroll', update)
      ro?.disconnect()
    }
  }, [ref, contentKey])
  if (!edges.left && !edges.right) return {}
  const stops = [edges.left ? `transparent 0, black ${FADE}px` : 'black 0', edges.right ? `black calc(100% - ${FADE}px), transparent 100%` : 'black 100%']
  const mask = `linear-gradient(to right, ${stops.join(', ')})`
  return { WebkitMaskImage: mask, maskImage: mask }
}
