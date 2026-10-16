import { useCallback, useEffect, useRef, useState } from 'react'

/*
  Tap-or-drag sorting for the card games in this lesson.
  - Tap (or Enter/Space) a card to pick it up, then tap a zone to drop it.
  - With a mouse or pen you can also drag the card onto a zone.
  Zones are any elements carrying data-zone="<id>"; the innermost one under the pointer wins.
  Touch input uses tap-tap only, so the page still scrolls normally on phones.
*/

export interface Ghost {
  id: string
  x: number
  y: number
}

function zoneAt(x: number, y: number): string | null {
  if (typeof document === 'undefined') return null
  const el = document.elementFromPoint(x, y) as HTMLElement | null
  const z = el?.closest('[data-zone]') as HTMLElement | null
  return z?.dataset.zone ?? null
}

export function useDropSort(onDrop: (cardId: string, zone: string) => void) {
  const [selected, setSelected] = useState<string | null>(null)
  const [ghost, setGhost] = useState<Ghost | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [shakeId, setShakeId] = useState<string | null>(null)
  const start = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null)
  const dragEnded = useRef({ id: '', t: 0 })
  const dropRef = useRef(onDrop)
  dropRef.current = onDrop

  useEffect(() => {
    if (!shakeId) return
    const t = window.setTimeout(() => setShakeId(null), 480)
    return () => window.clearTimeout(t)
  }, [shakeId])

  const cardHandlers = useCallback(
    (id: string) => ({
      onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
        if (e.pointerType === 'touch' || e.button !== 0) return
        start.current = { id, x: e.clientX, y: e.clientY, moved: false }
        e.currentTarget.setPointerCapture(e.pointerId)
      },
      onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
        const s = start.current
        if (!s || s.id !== id) return
        if (!s.moved && Math.hypot(e.clientX - s.x, e.clientY - s.y) < 6) return
        s.moved = true
        setGhost({ id, x: e.clientX, y: e.clientY })
        setHover(zoneAt(e.clientX, e.clientY))
      },
      onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
        const s = start.current
        start.current = null
        if (!s || s.id !== id || !s.moved) return
        dragEnded.current = { id, t: Date.now() }
        setGhost(null)
        setHover(null)
        const z = zoneAt(e.clientX, e.clientY)
        setSelected(null)
        if (z) dropRef.current(id, z)
      },
      onPointerCancel: () => {
        start.current = null
        setGhost(null)
        setHover(null)
      },
      onClick: () => {
        // a drag ends with a click on the same card: ignore that one
        if (dragEnded.current.id === id && Date.now() - dragEnded.current.t < 300) return
        setSelected((cur) => (cur === id ? null : id))
      },
    }),
    [],
  )

  /**
   * Attach to the element that contains all zones: a tap on any zone drops the selected card there.
   * `fallbackId` is the card to drop when nothing is selected (one-card-at-a-time mode on phones).
   */
  const onZoneClick = useCallback(
    (e: React.MouseEvent<HTMLElement>, fallbackId?: string | null) => {
      const id = selected ?? fallbackId
      if (!id) return
      const z = (e.target as HTMLElement).closest('[data-zone]') as HTMLElement | null
      const zone = z?.dataset.zone
      if (!zone) return
      setSelected(null)
      dropRef.current(id, zone)
    },
    [selected],
  )

  return { selected, setSelected, ghost, hover, shakeId, shake: setShakeId, cardHandlers, onZoneClick }
}
