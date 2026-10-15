import { useMemo, useRef, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Toggle } from '../../../../../kit'
import { PixelCanvas, rgbaFrom, fmtInt } from './pixels'
import { makeSkyline, SKY_W, SKY_H } from './images'
import s from './it.module.css'

/*
  Drag a 4×4 window over a tiny 48×32 sunset. The window's pixels are shown big, and next to
  them the three grids of numbers the computer actually stores: one for red, one for green,
  one for blue. Channel toggles switch a channel off everywhere; the value switch shows the
  same numbers on the 0-255 scale or divided by 255.
*/

const WIN = 4
const CH = [
  { key: 0, name: 'Red', short: 'R', color: 'var(--viz-neg)' },
  { key: 1, name: 'Green', short: 'G', color: 'var(--viz-pos)' },
  { key: 2, name: 'Blue', short: 'B', color: 'var(--viz-1)' },
] as const

export default function PixelZoom() {
  const img = useMemo(() => makeSkyline(), [])
  const [pos, setPos] = useState<[number, number]>([33, 13])
  const [on, setOn] = useState<[boolean, boolean, boolean]>([true, true, true])
  const [scale, setScale] = useState<'255' | '1'>('255')
  const zone = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const shown = useMemo(() => rgbaFrom(SKY_W, SKY_H, (x, y) => {
    const p = img[y][x]
    return [on[0] ? p[0] : 0, on[1] ? p[1] : 0, on[2] ? p[2] : 0]
  }), [img, on])
  const chanPix = useMemo(() => CH.map((c) => rgbaFrom(SKY_W, SKY_H, (x, y) => {
    const v = img[y][x][c.key]
    return [v, v, v]
  })), [img])

  const [wx, wy] = pos
  const clampPos = (x: number, y: number): [number, number] => [Math.max(0, Math.min(SKY_W - WIN, x)), Math.max(0, Math.min(SKY_H - WIN, y))]
  const moveTo = (cx: number, cy: number) => {
    const el = zone.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = ((cx - r.left) / r.width) * SKY_W
    const py = ((cy - r.top) / r.height) * SKY_H
    setPos(clampPos(Math.round(px - WIN / 2), Math.round(py - WIN / 2)))
  }
  const onKey = (e: React.KeyboardEvent) => {
    const d: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
    const m = d[e.key]
    if (!m) return
    e.preventDefault()
    setPos(clampPos(wx + m[0], wy + m[1]))
  }

  const fmt = (v: number) => (scale === '255' ? String(v) : (v / 255).toFixed(2))
  const winBox = (stroke = 0.9) => (
    <>
      <rect x={wx} y={wy} width={WIN} height={WIN} style={{ fill: 'none', stroke: 'var(--slate)', strokeWidth: stroke + 2.5 }} vectorEffect="non-scaling-stroke" />
      <rect x={wx} y={wy} width={WIN} height={WIN} style={{ fill: 'none', stroke: 'var(--highlight)', strokeWidth: stroke + 1 }} vectorEffect="non-scaling-stroke" />
    </>
  )
  const patch = Array.from({ length: WIN }, (_, i) => Array.from({ length: WIN }, (_, j) => img[wy + i][wx + j]))
  const cell = 34

  return (
    <Figure
      title="Zoom in until the picture becomes numbers"
      caption={
        <>
          <b>Try:</b> drag the yellow window (or use the arrow keys) and tap a channel to switch it off. <b>Notice:</b> every pixel is three numbers, and each
          channel alone is a grey brightness grid; this picture is a ({3}, {SKY_H}, {SKY_W}) tensor.
        </>
      }
    >
      <div className={s.stack}>
        <div
          ref={zone}
          className={s.dragZone}
          tabIndex={0}
          role="slider"
          aria-label="Zoom window position; use arrow keys to move"
          aria-valuetext={`column ${wx}, row ${wy}`}
          onKeyDown={onKey}
          onPointerDown={(e) => {
            dragging.current = true
            e.currentTarget.setPointerCapture(e.pointerId)
            moveTo(e.clientX, e.clientY)
          }}
          onPointerMove={(e) => dragging.current && moveTo(e.clientX, e.clientY)}
          onPointerUp={(e) => {
            dragging.current = false
            e.currentTarget.releasePointerCapture(e.pointerId)
          }}
        >
          <PixelCanvas w={SKY_W} h={SKY_H} pixels={shown} ariaLabel="A 48 by 32 pixel picture of a sunset over Marina Bay">
            {winBox()}
          </PixelCanvas>
        </div>

        <div className={s.row} style={{ flexWrap: 'nowrap', maxWidth: 520 }}>
          {CH.map((c, k) => (
            <button
              key={c.key}
              type="button"
              className={s.thumbBtn}
              aria-pressed={on[k]}
              onClick={() => setOn((o) => o.map((v, i) => (i === k ? !v : v)) as [boolean, boolean, boolean])}
            >
              <PixelCanvas w={SKY_W} h={SKY_H} pixels={chanPix[k]} ariaLabel={`${c.name} channel as a grey brightness image`}>
                {winBox(0.4)}
              </PixelCanvas>
              <span className={s.chanName} style={{ color: c.color }}>
                {c.name} channel
              </span>
            </button>
          ))}
        </div>

        <div className={s.row} aria-live="polite">
          <div className={s.chan}>
            <span className={s.chanName} style={{ color: 'var(--ink-2)' }}>
              The window
            </span>
            <div className={s.numGrid} style={{ gridTemplateColumns: `repeat(${WIN}, ${cell}px)` }}>
              {patch.flatMap((row, i) =>
                row.map((p, j) => (
                  <div
                    key={`${i}-${j}`}
                    className={s.numCell}
                    style={{ height: cell, background: `rgb(${on[0] ? p[0] : 0}, ${on[1] ? p[1] : 0}, ${on[2] ? p[2] : 0})` }}
                  />
                )),
              )}
            </div>
          </div>
          {CH.map((c, k) => (
            <div key={c.key} className={s.chan} style={{ opacity: on[k] ? 1 : 0.35 }}>
              <span className={s.chanName} style={{ color: c.color }}>
                {c.short} grid
              </span>
              <div className={s.numGrid} style={{ gridTemplateColumns: `repeat(${WIN}, ${cell}px)` }}>
                {patch.flatMap((row, i) =>
                  row.map((p, j) => (
                    <div
                      key={`${i}-${j}`}
                      className={s.numCell}
                      style={{ height: cell, background: `color-mix(in srgb, ${c.color} ${Math.round((p[k] / 255) * 48)}%, var(--surface-2))` }}
                    >
                      {fmt(p[k])}
                    </div>
                  )),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Controls>
        <Segmented
          label="Show values as"
          value={scale}
          onChange={setScale}
          options={[
            { value: '255', label: '0 to 255' },
            { value: '1', label: '0 to 1 (÷ 255)' },
          ]}
        />
        <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }}>
          {CH.map((c, k) => (
            <Toggle key={c.key} label={c.name} checked={on[k]} onChange={(v) => setOn((o) => o.map((x, i) => (i === k ? v : x)) as [boolean, boolean, boolean])} />
          ))}
        </div>
      </Controls>
      <Readout
        items={[
          ['window', `rows ${wy}–${wy + WIN - 1}, columns ${wx}–${wx + WIN - 1}`],
          ['numbers in window', `3 × ${WIN} × ${WIN} = ${3 * WIN * WIN}`],
          ['whole image', `3 × ${SKY_H} × ${SKY_W} = ${fmtInt(3 * SKY_H * SKY_W)}`],
        ]}
      />
    </Figure>
  )
}
