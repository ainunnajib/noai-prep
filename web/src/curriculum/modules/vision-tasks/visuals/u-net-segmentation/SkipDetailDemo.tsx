import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Segmented, Toggle, Button, Readout, useContainerWidth } from '../../../../../kit'

/*
  A simplified picture of what each level of a U-Net still knows about WHERE the object is.
  Encoder maps: the 32x32 true mask, average-pooled to 16x16, 8x8 and the 4x4 bottleneck (each square shaded by how much of it
  the object covers). Decoder: at each level it either receives the encoder map through the skip connection, or it can only
  enlarge (bilinear x2) the coarser decoder map below it. The output is the 32x32 decoder map thresholded at 0.5.
  All maps are drawn at the same size so the loss of detail shows as bigger squares.
*/

const N = 32
type Shape = 'cell' | 'road' | 'starfish'

interface Grid {
  n: number
  v: number[]
}

function makeShape(kind: Shape): Grid {
  const v: number[] = []
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      const y = i + 0.5
      const x = j + 0.5
      const a = Math.atan2(y - 16, x - 16)
      const r = Math.hypot(y - 16, x - 16)
      let on = false
      if (kind === 'cell') on = r < 9 + 2.2 * Math.sin(3 * a) + 1.2 * Math.cos(5 * a + 1)
      else if (kind === 'starfish') on = r < 6 + 6 * Math.abs(Math.cos(2.5 * a)) ** 3
      else on = Math.abs(y - (16 + 7 * Math.sin(x / 5.5))) < 1.3 || (Math.abs(x - 22) < 1.1 && y < 16)
      v.push(on ? 1 : 0)
    }
  return { n: N, v }
}

function pool(g: Grid): Grid {
  const n = g.n / 2
  const v: number[] = []
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const a = g.v[2 * i * g.n + 2 * j] + g.v[2 * i * g.n + 2 * j + 1] + g.v[(2 * i + 1) * g.n + 2 * j] + g.v[(2 * i + 1) * g.n + 2 * j + 1]
      v.push(a / 4)
    }
  return { n, v }
}

/** bilinear x2 enlargement, sampling at pixel centres (like align_corners=False) */
function enlarge(g: Grid): Grid {
  const n = g.n * 2
  const src = (u: number) => Math.max(0, Math.min(g.n - 1, (u + 0.5) / 2 - 0.5))
  const at = (i: number, j: number) => g.v[i * g.n + j]
  const v: number[] = []
  for (let i = 0; i < n; i++) {
    const yi = src(i)
    const i0 = Math.floor(yi)
    const i1 = Math.min(g.n - 1, i0 + 1)
    const ty = yi - i0
    for (let j = 0; j < n; j++) {
      const xj = src(j)
      const j0 = Math.floor(xj)
      const j1 = Math.min(g.n - 1, j0 + 1)
      const tx = xj - j0
      const top = at(i0, j0) * (1 - tx) + at(i0, j1) * tx
      const bot = at(i1, j0) * (1 - tx) + at(i1, j1) * tx
      v.push(top * (1 - ty) + bot * ty)
    }
  }
  return { n, v }
}

// a mild gamma lifts faint (blurred) values so they stay visible on a dark background too
const shade = (f: number) => `color-mix(in srgb, var(--viz-1) ${Math.round(Math.pow(f, 0.6) * 88)}%, var(--surface))`

/** A map drawn as an S x S square. Binary maps use row runs to keep the SVG small. */
function MapView({ g, x, y, S, errors }: { g: Grid; x: number; y: number; S: number; errors?: boolean[] }) {
  const c = S / g.n
  const cells: ReactNode[] = []
  const binary = g.v.every((t) => t === 0 || t === 1)
  if (binary) {
    for (let i = 0; i < g.n; i++) {
      let j = 0
      while (j < g.n) {
        if (g.v[i * g.n + j] === 1) {
          let k = j
          while (k < g.n && g.v[i * g.n + k] === 1) k++
          cells.push(<rect key={`r${i}-${j}`} x={x + j * c} y={y + i * c} width={(k - j) * c + 0.3} height={c + 0.3} style={{ fill: shade(1) }} />)
          j = k
        } else j++
      }
    }
  } else {
    g.v.forEach((f, idx) => {
      const i = Math.floor(idx / g.n)
      const j = idx % g.n
      cells.push(<rect key={idx} x={x + j * c} y={y + i * c} width={c} height={c} style={{ fill: shade(f), stroke: 'var(--surface)', strokeWidth: g.n <= 16 ? 0.6 : 0 }} />)
    })
  }
  if (errors)
    errors.forEach((e, idx) => {
      if (!e) return
      const i = Math.floor(idx / g.n)
      const j = idx % g.n
      cells.push(<rect key={`e${idx}`} x={x + j * c} y={y + i * c} width={c} height={c} style={{ fill: 'color-mix(in srgb, var(--viz-neg) 75%, var(--surface))' }} />)
    })
  return (
    <g>
      <rect x={x} y={y} width={S} height={S} style={{ fill: 'var(--surface)' }} />
      {cells}
      <rect x={x} y={y} width={S} height={S} style={{ fill: 'none', stroke: 'var(--viz-axis)', strokeWidth: 1 }} />
    </g>
  )
}

function Arrow({ pts, color = 'var(--viz-axis)', width = 1.6, dash }: { pts: [number, number][]; color?: string; width?: number; dash?: string }) {
  const [x1, y1] = pts[pts.length - 1]
  const [x0, y0] = pts[pts.length - 2]
  const len = Math.hypot(x1 - x0, y1 - y0) || 1
  const ux = (x1 - x0) / len
  const uy = (y1 - y0) / len
  const bx = x1 - ux * 7
  const by = y1 - uy * 7
  return (
    <g>
      <path d={pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('')} style={{ fill: 'none', stroke: color, strokeWidth: width, strokeDasharray: dash }} />
      <path d={`M${x1},${y1}L${bx - uy * 4},${by + ux * 4}L${bx + uy * 4},${by - ux * 4}Z`} style={{ fill: color }} />
    </g>
  )
}

const LEVEL_SIZES = [32, 16, 8]

export default function SkipDetailDemo() {
  const [shape, setShape] = useState<Shape>('road')
  const [skip, setSkip] = useState<[boolean, boolean, boolean]>([false, false, false])
  const [wrapRef, measured] = useContainerWidth<HTMLDivElement>(560)
  const W = Math.max(300, Math.min(700, measured))

  const { enc, bott, dec, pred, wrong, area } = useMemo(() => {
    const e0 = makeShape(shape)
    const e1 = pool(e0)
    const e2 = pool(e1)
    const b = pool(e2)
    const encs = [e0, e1, e2]
    const decs: Grid[] = [e0, e1, e2]
    decs[2] = skip[2] ? e2 : enlarge(b)
    decs[1] = skip[1] ? e1 : enlarge(decs[2])
    decs[0] = skip[0] ? e0 : enlarge(decs[1])
    const p: Grid = { n: N, v: decs[0].v.map((f) => (f >= 0.5 ? 1 : 0)) }
    const err = p.v.map((t, i) => t !== e0.v[i])
    return { enc: encs, bott: b, dec: decs, pred: p, wrong: err, area: e0.v.reduce((s, t) => s + t, 0) }
  }, [shape, skip])
  const nWrong = wrong.filter(Boolean).length

  // layout
  const gap = Math.max(76, Math.min(150, W * 0.22))
  const S = Math.max(72, Math.min(150, Math.floor((W - gap - 44) / 2)))
  const x0 = (W - 2 * S - gap) / 2
  const x1 = x0 + S + gap
  const top = 22
  const rowH = S + 34
  const rowY = (r: number) => top + r * rowH
  const Sb = Math.round(S * 0.78)
  const bx = W / 2 - Sb / 2
  const by = rowY(3) - 6
  const H = by + Sb + 10

  const toggle = (i: number) => setSkip((s) => s.map((v, k) => (k === i ? !v : v)) as [boolean, boolean, boolean])
  const lab = (x: number, y: number, t: string, anchor: 'start' | 'middle' | 'end' = 'start', color = 'var(--viz-ink)') => (
    <text x={x} y={y} textAnchor={anchor} style={{ fill: color, fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
      {t}
    </text>
  )

  return (
    <Figure
      title="What survives the trip down the U"
      caption={
        <>
          A simplified picture: every map is shaded by how much of each square the object covers, and all maps are drawn the same size, so
          lost detail shows up as bigger squares. With the skips <b>off</b>, the decoder can only enlarge the 4×4 bottleneck, and the thin
          road disappears. Click a skip arrow (or use the switches) to hand the decoder the encoder&apos;s map at that resolution, and watch
          the red (wrong) pixels vanish. Which skip fixes the most? (A real decoder combines the skip map with its own upsampled map
          rather than swapping one for the other; this toy only isolates where the location detail comes from.)
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Encoder maps from 32 by 32 down to a 4 by 4 bottleneck, and decoder maps back up. ${nWrong} of 1024 output pixels are wrong.`} style={{ display: 'block', maxWidth: W, margin: '0 auto' }}>
          {LEVEL_SIZES.map((sz, r) => {
            const y = rowY(r)
            const on = skip[r]
            const cy = y + S / 2
            const midX = (x0 + S + x1) / 2
            const decSrc = r === 0 ? `output ${sz}×${sz}` : `decoder ${sz}×${sz}`
            return (
              <g key={r}>
                {lab(x0, y - 6, `encoder ${sz}×${sz}`)}
                <MapView g={enc[r]} x={x0} y={y} S={S} />
                {lab(x1 + S, y - 6, decSrc, 'end')}
                <MapView g={r === 0 ? pred : dec[r]} x={x1} y={y} S={S} errors={r === 0 ? wrong : undefined} />
                {/* encoder down arrow (outer left) */}
                {r < 2 && <Arrow pts={[[x0 - 10, y + S * 0.3], [x0 - 10, rowY(r + 1) + S * 0.3]]} />}
                {/* decoder up arrow (outer right) */}
                {r < 2 && <Arrow pts={[[x1 + S + 10, rowY(r + 1) + S * 0.3], [x1 + S + 10, y + S * 0.3]]} />}
                {/* skip arrow + clickable pill */}
                <g
                  role="button"
                  tabIndex={0}
                  aria-pressed={on}
                  aria-label={`skip connection at ${sz} by ${sz}: ${on ? 'on' : 'off'}. Press to toggle.`}
                  onClick={() => toggle(r)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggle(r)
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <rect x={x0 + S + 2} y={cy - 18} width={gap - 4} height={36} style={{ fill: 'transparent' }} />
                  <Arrow pts={[[x0 + S + 4, cy], [x1 - 4, cy]]} color={on ? 'var(--viz-3)' : 'var(--viz-muted)'} width={on ? 2.6 : 1.4} dash={on ? undefined : '4 4'} />
                  <rect x={midX - 29} y={cy - 21} width={58} height={17} rx={8.5} style={{ fill: on ? 'var(--viz-3)' : 'var(--surface-2)', stroke: on ? 'var(--viz-3)' : 'var(--viz-muted)', strokeWidth: 1.2 }} />
                  <text x={midX} y={cy - 9} textAnchor="middle" style={{ fill: on ? 'var(--surface)' : 'var(--ink-2)', fontSize: 10.5, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {on ? 'skip on' : 'off'}
                  </text>
                </g>
              </g>
            )
          })}
          {/* bottleneck */}
          {lab(W / 2, by - 6, 'bottleneck 4×4', 'middle')}
          <MapView g={bott} x={bx} y={by} S={Sb} />
          <Arrow pts={[[x0 - 10, rowY(2) + S * 0.3], [x0 - 10, by + Sb / 2], [bx - 4, by + Sb / 2]]} />
          <Arrow pts={[[bx + Sb + 4, by + Sb / 2], [x1 + S + 10, by + Sb / 2], [x1 + S + 10, rowY(2) + S * 0.3]]} />
        </svg>
      </div>
      <Readout
        items={[
          ['object pixels', `${area}`],
          ['wrong output pixels', `${nWrong} of 1024`],
          ['finest map reaching the output', skip[0] ? '32×32' : skip[1] ? '16×16' : skip[2] ? '8×8' : '4×4 (bottleneck)'],
        ]}
      />
      <Controls>
        <Segmented
          label="object"
          value={shape}
          onChange={setShape}
          options={[
            { value: 'road', label: 'thin road' },
            { value: 'cell', label: 'cell' },
            { value: 'starfish', label: 'starfish' },
          ]}
        />
        {LEVEL_SIZES.map((sz, r) => (
          <Toggle key={sz} label={`skip at ${sz}×${sz}`} checked={skip[r]} onChange={() => toggle(r)} />
        ))}
        <Button onClick={() => setSkip([true, true, true])}>all skips on</Button>
        <Button onClick={() => setSkip([false, false, false])}>all off</Button>
      </Controls>
    </Figure>
  )
}
