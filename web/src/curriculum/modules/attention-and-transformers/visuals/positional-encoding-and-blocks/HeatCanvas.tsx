import { useEffect, useRef } from 'react'
import { divRGB, rgbCss, seqRGB, type CanvasTheme, type Mat } from './pe'

/*
  A diverging heat map drawn on <canvas> (fast for thousands of cells), with axis ticks,
  a highlighted row / column / cell, and click-to-pick. Values are expected in [-1, 1].
*/

export function HeatCanvas({
  data,
  width,
  gridH,
  theme,
  onPick,
  selRow,
  selCol,
  xTitle,
  yTitle,
  xTicks,
  yTicks,
  ariaLabel,
  seq,
}: {
  /** draw with a one-colour scale from seq[0] (pale) to seq[1] (full) instead of the blue–orange diverging scale */
  seq?: [number, number]
  data: Mat
  width: number
  gridH: number
  theme: CanvasTheme
  onPick?: (row: number, col: number) => void
  selRow?: number
  selCol?: number
  xTitle: string
  yTitle: string
  xTicks: number[]
  yTicks: number[]
  ariaLabel: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const rows = data.length
  const cols = data[0]?.length ?? 0
  const left = 30
  const top = 30
  const gridW = Math.max(40, width - left - 4)
  const H = top + gridH + 4
  const cw = gridW / cols
  const ch = gridH / rows

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const dpr = window.devicePixelRatio || 1
    cv.width = Math.round(width * dpr)
    cv.height = Math.round(H * dpr)
    const ctx = cv.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, H)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = seq ? seqRGB(theme, (data[r][c] - seq[0]) / (seq[1] - seq[0] || 1)) : divRGB(theme, data[r][c])
        // overlap by a hair so no seams show between cells
        ctx.fillRect(left + c * cw, top + r * ch, cw + 0.6, ch + 0.6)
      }
    }
    const ink = rgbCss(theme.ink)
    ctx.strokeStyle = ink
    ctx.lineWidth = 1
    ctx.strokeRect(left - 0.5, top - 0.5, gridW + 1, gridH + 1)
    // highlights
    ctx.lineWidth = 2
    if (selRow != null && selRow < rows) {
      ctx.strokeStyle = ink
      ctx.setLineDash([4, 3])
      ctx.strokeRect(left - 1, top + selRow * ch - 1, gridW + 2, ch + 2)
      ctx.setLineDash([])
    }
    if (selCol != null && selCol < cols) {
      ctx.strokeStyle = ink
      ctx.setLineDash([4, 3])
      ctx.strokeRect(left + selCol * cw - 1, top - 1, cw + 2, gridH + 2)
      ctx.setLineDash([])
    }
    if (selRow != null && selCol != null && selRow < rows && selCol < cols) {
      ctx.lineWidth = 2.5
      ctx.strokeStyle = ink
      ctx.strokeRect(left + selCol * cw - 2, top + selRow * ch - 2, cw + 4, ch + 4)
    }
    // ticks and titles
    ctx.fillStyle = ink
    ctx.font = '600 11px system-ui, -apple-system, "Segoe UI", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    for (const t of xTicks) if (t < cols) ctx.fillText(String(t), left + (t + 0.5) * cw, top - 4)
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (const t of yTicks) if (t < rows) ctx.fillText(String(t), left - 5, top + (t + 0.5) * ch)
    ctx.font = '700 11px system-ui, -apple-system, "Segoe UI", sans-serif'
    ctx.textBaseline = 'alphabetic'
    ctx.textAlign = 'left'
    ctx.fillText(yTitle, 0, 11)
    ctx.textAlign = 'right'
    ctx.fillText(xTitle, left + gridW, 11)
  }, [data, width, gridH, theme, selRow, selCol, rows, cols, cw, ch, gridW, H, xTitle, yTitle, xTicks, yTicks, seq?.[0], seq?.[1]])

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={ariaLabel}
      style={{ width, height: H, display: 'block', cursor: onPick ? 'pointer' : 'default', touchAction: 'manipulation' }}
      onClick={(e) => {
        if (!onPick) return
        const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect()
        const x = e.clientX - rect.left - left
        const y = e.clientY - rect.top - top
        if (x < 0 || y < 0 || x > gridW || y > gridH) return
        onPick(Math.min(rows - 1, Math.floor(y / ch)), Math.min(cols - 1, Math.floor(x / cw)))
      }}
    />
  )
}
