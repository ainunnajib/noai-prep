import { useEffect, useRef, useState } from 'react'
import { Figure, Controls, Segmented, Toggle, usePlayer, PlayerControls, useContainerWidth } from '../../../../../kit'
import { PRESETS, conv2d, patchAt, fmtNum, nextWeight, type Grid, type Kernel } from './convMath'
import s from './conv.module.css'

/*
  Slide a 3×3 kernel over an 8×8 image of a "4" (1 = white ink, 0 = black). At every position:
  multiply the 9 overlapping pixels by the 9 weights, add the 9 products, write the sum into the
  feature map. Drag on the image, tap an output cell, or press Play to sweep. Tap a kernel weight
  to change it (cycles −2 … 2).
*/

const IMG: Grid = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 1, 0, 0, 0],
  [0, 1, 0, 0, 1, 0, 0, 0],
  [0, 1, 0, 0, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
]
const N = 8
const K = 3
const M = N - K + 1 // 6

const tint = (c: string, pct: number) => `color-mix(in srgb, ${c} ${Math.round(pct)}%, var(--surface))`
const divColour = (v: number, maxAbs: number) => (Math.abs(v) < 1e-9 ? 'var(--surface-2)' : tint(v < 0 ? 'var(--viz-1)' : 'var(--viz-2)', 12 + 58 * Math.min(1, Math.abs(v) / maxAbs)))

export default function ConvolutionExplorer() {
  const [kernel, setKernel] = useState<Kernel>(PRESETS[0])
  const [showAll, setShowAll] = useState(true)
  const player = usePlayer({ steps: M * M, interval: 650 })
  // start on an interesting position (row 2, column 2 of the map); Play switches to "fill in" mode
  useEffect(() => {
    player.setStep(M + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (player.playing) setShowAll(false)
  }, [player.playing])
  const [ref, W] = useContainerWidth<HTMLDivElement>(600)
  const inputRef = useRef<SVGSVGElement>(null)
  const dragging = useRef(false)

  const k = player.step
  const pi = Math.floor(k / M)
  const pj = k % M
  const out = conv2d(IMG, kernel.w, kernel.div)
  const maxAbs = Math.max(1e-9, ...out.flat().map(Math.abs))
  const patch = patchAt(IMG, pi, pj, K)
  const prods = patch.map((row, a) => row.map((v, b) => v * kernel.w[a][b]))
  const sum = prods.flat().reduce((p, q) => p + q, 0)

  const side = W >= 444
  const c = Math.max(18, side ? Math.min(40, Math.floor((W - 28) / 14)) : Math.min(38, Math.floor((W - 4) / 8)))
  const mc = 28 // mini-grid cell

  const goTo = (i: number, j: number) => {
    player.pause()
    player.setStep(Math.max(0, Math.min(M - 1, i)) * M + Math.max(0, Math.min(M - 1, j)))
  }
  const fromPointer = (e: React.PointerEvent) => {
    const svg = inputRef.current
    if (!svg) return
    const r = svg.getBoundingClientRect()
    const col = Math.floor(((e.clientX - r.left) / r.width) * N)
    const row = Math.floor(((e.clientY - r.top) / r.height) * N)
    goTo(row - 1, col - 1)
  }
  const editWeight = (a: number, b: number) => {
    const w = kernel.w.map((row) => row.slice())
    w[a][b] = nextWeight(w[a][b])
    setKernel({ name: 'Custom', w, div: 1, blurb: 'your own kernel' })
  }

  const isPreset = PRESETS.some((p) => p.name === kernel.name)
  const terms = prods.flat().map((v) => (v < 0 ? `(${fmtNum(v)})` : fmtNum(v)))

  const mini = (g: Grid, opts: { colour?: (v: number) => string; text?: (v: number) => string; onClick?: (a: number, b: number) => void; ink?: (v: number) => string; label: string }) => (
    <div className={s.mini} style={{ gridTemplateColumns: `repeat(${K}, ${mc}px)` }} role={opts.onClick ? 'group' : 'img'} aria-label={opts.label}>
      {g.flatMap((row, a) =>
        row.map((v, b) => {
          const style = { width: mc, height: mc, background: opts.colour?.(v), color: opts.ink?.(v) }
          const txt = opts.text ? opts.text(v) : fmtNum(v)
          return opts.onClick ? (
            <button key={`${a}${b}`} type="button" className={s.miniCell} style={style} onClick={() => opts.onClick!(a, b)} aria-label={`weight row ${a + 1} column ${b + 1}: ${txt}. Tap to change.`}>
              {txt}
            </button>
          ) : (
            <div key={`${a}${b}`} className={s.miniCell} style={style}>
              {txt}
            </div>
          )
        }),
      )}
    </div>
  )

  return (
    <Figure
      title="Slide the kernel, multiply, add"
      caption={
        <>
          Drag across the image, tap a cell of the feature map, or press <b>Play</b> to watch the map fill in. The orange window is where the kernel sits: its 9 pixels are multiplied by
          the kernel's 9 weights, and the 9 products are added to give <b>one</b> number of the feature map. Try each preset and predict where the map will be
          large before you look; then tap kernel weights to make your own.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <div className={s.row} style={{ gap: side ? '0.5rem 28px' : '0.8rem' }}>
          <div className={s.col}>
            <span className={s.cap}>Input image (8 × 8)</span>
            <svg
              ref={inputRef}
              viewBox={`-2 -2 ${N * c + 4} ${N * c + 4}`}
              width={N * c + 4}
              style={{ maxWidth: '100%', height: 'auto', touchAction: 'none', cursor: 'crosshair', display: 'block' }}
              role="img"
              aria-label={`8 by 8 image of the digit 4; the kernel window covers rows ${pi + 1} to ${pi + 3}, columns ${pj + 1} to ${pj + 3}`}
              onPointerDown={(e) => {
                dragging.current = true
                ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
                fromPointer(e)
              }}
              onPointerMove={(e) => dragging.current && fromPointer(e)}
              onPointerUp={(e) => {
                dragging.current = false
                ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
              }}
            >
              {IMG.flatMap((row, i) =>
                row.map((v, j) => (
                  <g key={`${i}-${j}`}>
                    <rect x={j * c} y={i * c} width={c} height={c} style={{ fill: v ? 'rgb(250, 250, 250)' : 'rgb(18, 20, 28)', stroke: 'var(--viz-muted)', strokeWidth: 0.6 }} />
                    <text x={j * c + c / 2} y={i * c + c / 2} dy="0.35em" textAnchor="middle" style={{ fontSize: c > 30 ? 13 : 11, fontFamily: 'var(--font-mono)', fontWeight: 600, fill: v ? 'rgb(20, 20, 30)' : 'rgb(150, 155, 170)' }}>
                      {v}
                    </text>
                  </g>
                )),
              )}
              <rect x={pj * c} y={pi * c} width={K * c} height={K * c} rx={4} style={{ fill: 'color-mix(in srgb, var(--viz-2) 22%, transparent)', stroke: 'var(--viz-2)', strokeWidth: 3.5, pointerEvents: 'none' }} />
            </svg>
          </div>
          <div className={s.col}>
            <span className={s.cap}>Feature map (6 × 6)</span>
            <svg viewBox={`-2 -2 ${M * c + 4} ${M * c + 4}`} width={M * c + 4} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} role="group" aria-label="Feature map; tap a cell to move the kernel there">
              {out.flatMap((row, i) =>
                row.map((v, j) => {
                  const idx = i * M + j
                  const filled = showAll || idx <= k
                  const cur = idx === k
                  return (
                    <g key={`${i}-${j}`} onClick={() => goTo(i, j)} style={{ cursor: 'pointer' }}>
                      <rect
                        x={j * c + 1.5}
                        y={i * c + 1.5}
                        width={c - 3}
                        height={c - 3}
                        rx={4}
                        style={{ fill: filled ? divColour(v, maxAbs) : 'var(--surface)', stroke: cur ? 'var(--viz-2)' : filled ? 'transparent' : 'var(--viz-muted)', strokeWidth: cur ? 3 : 1, strokeDasharray: filled || cur ? undefined : '3 3' }}
                      />
                      {filled && (
                        <text x={j * c + c / 2} y={i * c + c / 2} dy="0.35em" textAnchor="middle" style={{ fontSize: c > 30 ? 12.5 : 10.5, fontFamily: 'var(--font-mono)', fontWeight: 700, fill: 'var(--ink)' }}>
                          {fmtNum(v)}
                        </text>
                      )}
                    </g>
                  )
                }),
              )}
            </svg>
            <div className={s.legend}>
              <span>
                <span className={s.swatch} style={{ background: tint('var(--viz-1)', 60) }} />
                negative
              </span>
              <span>
                <span className={s.swatch} style={{ background: tint('var(--viz-2)', 60) }} />
                positive
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={s.calc} aria-live="polite">
        <div className={s.col}>
          <span className={s.capSmall}>patch under window</span>
          {mini(patch, { label: 'the 9 pixels under the window', colour: (v) => (v ? 'rgb(250, 250, 250)' : 'rgb(18, 20, 28)'), ink: (v) => (v ? 'rgb(20, 20, 30)' : 'rgb(170, 175, 190)') })}
        </div>
        <span className={s.op}>×</span>
        <div className={s.col}>
          <span className={s.capSmall}>kernel{kernel.div !== 1 ? ` (then ÷ ${kernel.div})` : ''}</span>
          {mini(kernel.w, { label: 'kernel weights; tap one to change it', onClick: editWeight, colour: (v) => (v === 0 ? 'var(--surface-2)' : tint(v < 0 ? 'var(--viz-1)' : 'var(--viz-2)', 14 + 12 * Math.abs(v))) })}
        </div>
        <span className={s.op}>=</span>
        <div className={s.col}>
          <span className={s.capSmall}>9 products</span>
          {mini(prods, { label: 'the 9 products', colour: (v) => (v === 0 ? 'var(--surface-2)' : tint(v < 0 ? 'var(--viz-1)' : 'var(--viz-2)', 30)) })}
        </div>
      </div>
      <div className={s.sumLine}>
        sum = {terms.join(' + ')} = <b>{fmtNum(sum)}</b>
        {kernel.div !== 1 && (
          <>
            {' '}
            → ÷ {kernel.div} = <b>{fmtNum(sum / kernel.div)}</b>
          </>
        )}{' '}
        → feature map row {pi + 1}, column {pj + 1}
      </div>

      <PlayerControls player={player} label={(st) => `Position ${st + 1} of ${M * M}`} />
      <Controls>
        <Segmented
          label="Kernel"
          value={isPreset ? kernel.name : 'Custom'}
          onChange={(name) => {
            const p = PRESETS.find((q) => q.name === name)
            if (p) setKernel(p)
          }}
          options={[...PRESETS.map((p) => ({ value: p.name, label: p.name })), ...(isPreset ? [] : [{ value: 'Custom', label: 'Custom' }])]}
        />
        <Toggle label="Show the whole feature map" checked={showAll} onChange={setShowAll} />
      </Controls>
      <div className={s.note}>
        <b>{kernel.name}:</b> {kernel.blurb}.
      </div>
    </Figure>
  )
}
