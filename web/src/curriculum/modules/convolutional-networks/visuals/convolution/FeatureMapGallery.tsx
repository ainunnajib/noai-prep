import { useMemo, useState } from 'react'
import { Figure, Readout, Button, useContainerWidth } from '../../../../../kit'
import { PixelCanvas, rgbaFrom, useCssColors, mix, type RGB } from '../images-as-tensors/pixels'
import { conv2d, fmtNum, nextWeight, type Grid } from './convMath'
import s from './conv.module.css'

/*
  One input picture (a house and a sun, 28×28, 1 = white) and six hand-made 3×3 filters. Each
  filter produces its own feature map (26×26, blue = negative, orange = positive). Tap a map to
  inspect its kernel and edit it; nudge the picture with the arrows and watch every map move
  with it: translation equivariance. The marker shows each map's strongest response.
*/

const N = 28
// The ink spans rows and columns 4 to 23 of the 28, so within ±2 pixels every response stays
// inside the 26 × 26 valid map: every map (and its peak) shifts exactly (checked for all six filters).
const MAX_SHIFT = 2

interface Filt {
  name: string
  w: Grid
  div: number
}

const FILTERS: Filt[] = [
  // the same vertical, horizontal and blur kernels as in the lesson's table and the explorer
  { name: 'Vertical edges', w: [[1, 0, -1], [1, 0, -1], [1, 0, -1]], div: 1 },
  { name: 'Horizontal edges', w: [[1, 1, 1], [0, 0, 0], [-1, -1, -1]], div: 1 },
  { name: 'Diagonal edges', w: [[0, 1, 2], [-1, 0, 1], [-2, -1, 0]], div: 1 },
  { name: 'Blur', w: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], div: 9 },
  { name: 'Sharpen', w: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], div: 1 },
  { name: 'Outline', w: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]], div: 1 },
]

/** The scene drawn with its origin moved by (dx, dy) pixels. */
function scene(dx: number, dy: number): Grid {
  const img: Grid = []
  for (let y = 0; y < N; y++) {
    const row: number[] = []
    for (let x = 0; x < N; x++) {
      const u = x - dx
      const v = y - dy
      let val = 0
      if (u >= 4 && u <= 13 && v >= 13 && v <= 23) val = 1 // house body
      if (v >= 6 && v <= 12 && Math.abs(u - 8.5) <= Math.min(4.5, (v - 5.5) * 0.85)) val = 1 // roof (no overhang)
      if (u >= 7 && u <= 9 && v >= 18 && v <= 23) val = 0 // door
      if (u >= 11 && u <= 12 && v >= 15 && v <= 16) val = 0 // window
      if ((u - 19.5) ** 2 + (v - 7.5) ** 2 <= 12.5) val = 1 // sun
      row.push(val)
    }
    img.push(row)
  }
  return img
}

/** "not moved", "1 right", "2 left, 1 up", … */
function shiftText([dx, dy]: [number, number]): string {
  const parts: string[] = []
  if (dx !== 0) parts.push(`${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'}`)
  if (dy !== 0) parts.push(`${Math.abs(dy)} ${dy > 0 ? 'down' : 'up'}`)
  return parts.length ? parts.join(', ') : 'not moved'
}

function argmaxAbs(g: Grid): [number, number] {
  let best = -1
  let at: [number, number] = [0, 0]
  g.forEach((row, i) =>
    row.forEach((v, j) => {
      if (Math.abs(v) > best + 1e-9) {
        best = Math.abs(v)
        at = [i, j]
      }
    }),
  )
  return at
}

export default function FeatureMapGallery() {
  const [shift, setShift] = useState<[number, number]>([0, 0])
  const [sel, setSel] = useState(0)
  const [kernels, setKernels] = useState<Grid[]>(() => FILTERS.map((f) => f.w))
  const cols = useCssColors(['--viz-1', '--viz-2', '--surface'] as const)
  const [ref, W] = useContainerWidth<HTMLDivElement>(600)
  const big = Math.max(110, Math.min(230, Math.floor((W - 24) / 2)))

  const img = useMemo(() => scene(shift[0], shift[1]), [shift])
  // an edited kernel keeps its preset's divisor (so an edited blur still divides by 9, as the label says)
  const maps = useMemo(() => kernels.map((k, f) => conv2d(img, k, FILTERS[f].div)), [img, kernels])
  // colour scale per filter fixed from the unshifted picture, so shifting never rescales colours
  const scales = useMemo(() => {
    const base = scene(0, 0)
    return kernels.map((k, f) => Math.max(1e-9, ...conv2d(base, k, FILTERS[f].div).flat().map(Math.abs)))
  }, [kernels])

  const inputPix = useMemo(() => rgbaFrom(N, N, (x, y) => (img[y][x] ? [248, 248, 248] : [16, 18, 26])), [img])
  const mapPix = useMemo(() => {
    if (!cols) return maps.map(() => null)
    const neg = cols['--viz-1']
    const pos = cols['--viz-2']
    const bg = cols['--surface']
    return maps.map((m, f) =>
      rgbaFrom(m[0].length, m.length, (x, y) => {
        const v = m[y][x] / scales[f]
        const t = Math.min(1, Math.abs(v))
        return mix(v < 0 ? neg : pos, bg, Math.sqrt(t) * 0.92) as RGB
      }),
    )
  }, [maps, cols, scales])

  const M = N - 2
  const peaks = maps.map(argmaxAbs)
  const edited = kernels[sel] !== FILTERS[sel].w
  const div = FILTERS[sel].div
  const nudge = (dx: number, dy: number) => setShift(([a, b]) => [Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, a + dx)), Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, b + dy))])
  const edit = (a: number, b: number) =>
    setKernels((ks) =>
      ks.map((k, f) => {
        if (f !== sel) return k
        const w = k.map((row) => row.slice())
        w[a][b] = nextWeight(w[a][b])
        return w
      }),
    )

  const marker = (p: [number, number], strokeW = 0.5) => (
    <g style={{ pointerEvents: 'none' }}>
      <rect x={p[1] - 0.5} y={p[0] - 0.5} width={2} height={2} style={{ fill: 'none', stroke: 'var(--slate)', strokeWidth: strokeW + 0.35 }} />
      <rect x={p[1] - 0.5} y={p[0] - 0.5} width={2} height={2} style={{ fill: 'none', stroke: 'var(--highlight)', strokeWidth: strokeW }} />
    </g>
  )

  return (
    <Figure
      title="Six filters, six feature maps"
      caption={
        <>
          <b>Try:</b> tap a map to see and edit its kernel, then nudge the picture with the arrows. <b>Notice:</b> every feature map moves by exactly the
          same amount as the picture, and so does each map's strongest response (the yellow square).
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <div className={s.row} style={{ gap: '0.8rem 1.2rem', alignItems: 'flex-start' }}>
          <div className={s.col} style={{ width: big }}>
            <span className={s.cap}>Input (28 × 28)</span>
            <PixelCanvas w={N} h={N} pixels={inputPix} ariaLabel={`A picture of a house and a sun, ${shift[0] === 0 && shift[1] === 0 ? 'not moved' : `moved ${shiftText(shift)}`}`} />
          </div>
          <div className={s.col} style={{ width: big }}>
            <span className={s.cap}>
              {FILTERS[sel].name}
              {edited ? ' (edited)' : ''}
            </span>
            <PixelCanvas w={M} h={M} pixels={mapPix[sel]} ariaLabel={`Feature map of the ${FILTERS[sel].name} filter`}>
              {marker(peaks[sel], 0.18)}
            </PixelCanvas>
            <div className={s.legend}>
              <span>
                <span className={s.swatch} style={{ background: 'color-mix(in srgb, var(--viz-1) 70%, var(--surface))' }} />
                negative
              </span>
              <span>
                <span className={s.swatch} style={{ background: 'color-mix(in srgb, var(--viz-2) 70%, var(--surface))' }} />
                positive
              </span>
            </div>
          </div>
        </div>
        <div className={s.row} style={{ marginTop: '0.8rem', alignItems: 'center' }}>
          <div className={s.col}>
            <span className={s.capSmall}>move the picture</span>
            <div className={s.shiftPad}>
              <span />
              <button type="button" onClick={() => nudge(0, -1)} aria-label="Shift picture up">
                ↑
              </button>
              <span />
              <button type="button" onClick={() => nudge(-1, 0)} aria-label="Shift picture left">
                ←
              </button>
              <button type="button" onClick={() => setShift([0, 0])} aria-label="Reset position" title="Reset position">
                ↺
              </button>
              <button type="button" onClick={() => nudge(1, 0)} aria-label="Shift picture right">
                →
              </button>
              <span />
              <button type="button" onClick={() => nudge(0, 1)} aria-label="Shift picture down">
                ↓
              </button>
              <span />
            </div>
          </div>
          <div className={s.col}>
            <span className={s.capSmall}>kernel{div !== 1 ? ` (÷ ${div})` : ''}: tap a weight to change it</span>
            <div className={s.mini} style={{ gridTemplateColumns: 'repeat(3, 30px)' }} role="group" aria-label="Kernel weights of the selected filter">
              {kernels[sel].flatMap((row, a) =>
                row.map((v, b) => (
                  <button
                    key={`${a}${b}`}
                    type="button"
                    className={s.miniCell}
                    style={{ width: 30, height: 30, background: v === 0 ? 'var(--surface-2)' : `color-mix(in srgb, ${v < 0 ? 'var(--viz-1)' : 'var(--viz-2)'} ${Math.min(50, 14 + 9 * Math.abs(v))}%, var(--surface))` }}
                    onClick={() => edit(a, b)}
                    aria-label={`weight ${fmtNum(v)}; tap to change`}
                  >
                    {fmtNum(v)}
                  </button>
                )),
              )}
            </div>
            {edited && (
              <Button onClick={() => setKernels((ks) => ks.map((k, f) => (f === sel ? FILTERS[f].w : k)))}>Reset kernel</Button>
            )}
          </div>
        </div>
      </div>

      <div className={s.thumbs}>
        {FILTERS.map((f, i) => (
          <button key={f.name} type="button" className={s.thumb} aria-pressed={i === sel} onClick={() => setSel(i)}>
            <PixelCanvas w={M} h={M} pixels={mapPix[i]} ariaLabel={`${f.name} feature map`}>
              {marker(peaks[i], 0.4)}
            </PixelCanvas>
            <span className={s.thumbName}>{f.name}</span>
          </button>
        ))}
      </div>
      <Readout
        items={[
          ['picture moved', shiftText(shift)],
          [`strongest ${FILTERS[sel].name.toLowerCase()} response at`, `row ${peaks[sel][0]}, column ${peaks[sel][1]}`],
          ['weights in this filter', '9 (+ 1 bias), reused at all 676 positions'],
        ]}
      />
    </Figure>
  )
}
