import { useEffect, useRef, type ComponentProps } from 'react'
import { Figure } from '../../../../kit'
import s from './touch.module.css'

/*
  The kit's <Figure>, made friendlier to phones. The kit gives every plot `touch-action: none`, so a swipe that
  starts on a plot cannot scroll the page, and these lessons are full of full-width plots. Inside this figure:
  - plots allow vertical scrolling and pinch-zoom (touch.module.css), so swiping over a plot scrolls the page;
  - a touch that starts on a draggable handle (the kit's DraggablePoint, class .plot-drag) still drags it,
    because its touchstart is cancelled, which stops the browser from scrolling instead.
  CSS alone cannot keep the handles draggable: Chromium ignores touch-action on SVG shapes and groups
  (checked with emulated touch swipes), so the handles need the touchstart listener.
*/

const HOLD = '.plot-drag'

/** Invisible marker that finds its <figure> and switches the touch behaviour on (only in the browser). */
function TouchProbe() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const fig = ref.current?.closest('figure')
    if (!fig) return
    fig.classList.add(s.panY)
    const hold = (e: TouchEvent) => {
      const t = e.target
      if (t instanceof Element && t.closest(HOLD) && e.cancelable) e.preventDefault()
    }
    fig.addEventListener('touchstart', hold, { passive: false })
    return () => {
      fig.classList.remove(s.panY)
      fig.removeEventListener('touchstart', hold)
    }
  }, [])
  return <span ref={ref} hidden />
}

export default function TouchFigure({ children, ...rest }: ComponentProps<typeof Figure>) {
  return (
    <Figure {...rest}>
      <TouchProbe />
      {children}
    </Figure>
  )
}
