import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Segmented, Toggle, Button, Readout, useContainerWidth } from '../../../../../kit'

/*
  A toy model (not a trained network) of what each half of a U-Net knows.
  - The encoder maps answer only "WHERE is there something with sharp edges?": the object AND some clutter (a bubble, a pebble,
    a fence) look alike up close, so the 32x32 map marks both, and is average-pooled to 16x16 and 8x8.
  - The 4x4 bottleneck has seen enough context to know WHAT is the object: it holds the object alone (pooled to 4x4).
  - Decoder, at each level: take the skip's encoder map if that skip is on, otherwise enlarge (bilinear x2) the decoder map from
    below. Then keep values only where the context map coming up from the bottleneck (enlarged the same way) says "object"
    (at least TAU). With the context cut, nothing comes from below: no blob, and no filtering of the clutter.
  The output is the 32x32 decoder map thresholded at 0.5. Python check of this rule (tau 0.15): skips never make it worse;
  bottleneck only gives blobs (road lost), top skip without context keeps the clutter, both together miss about 1 pixel.
  All maps are drawn at the same size so the loss of detail shows as bigger squares.
*/

const N = 32
const TAU = 0.15
type Shape = 'cell' | 'road' | 'starfish'

interface Grid {
  n: number
  v: number[]
}

const CLUTTER_NAME: Record<Shape, string> = { road: 'a fence', cell: 'two bubbles', starfish: 'a pebble and some seaweed' }

/** The object (target) and look-alike clutter, as two 32x32 binary masks. */
function makeScene(kind: Shape): { target: Grid; clutter: Grid } {
  const t: number[] = []
  const c: number[] = []
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      const y = i + 0.5
      const x = j + 0.5
      const a = Math.atan2(y - 16, x - 16)
      const r = Math.hypot(y - 16, x - 16)
      let on = false
      let cl = false
      if (kind === 'cell') {
        on = r < 9 + 2.2 * Math.sin(3 * a) + 1.2 * Math.cos(5 * a + 1)
        cl = Math.hypot(y - 4.5, x - 27.5) < 3.2 || Math.hypot(y - 28, x - 4) < 2.5
      } else if (kind === 'starfish') {
        on = r < 6 + 6 * Math.abs(Math.cos(2.5 * a)) ** 3
        cl = Math.hypot(y - 27.5, x - 27) < 3 || (Math.abs(y - 4) < 1.1 && x > 3 && x < 12)
      } else {
        on = Math.abs(y - (16 + 7 * Math.sin(x / 5.5))) < 1.3 || (Math.abs(x - 22) < 1.1 && y < 16)
        cl = Math.abs(y - 28.5) < 1.1 && x > 2 && x < 30
      }
      t.push(on ? 1 : 0)
      c.push(cl && !on ? 1 : 0)
    }
  return { target: { n: N, v: t }, clutter: { n: N, v: c } }
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
function MapView({ g, x, y, S, errors, outline }: { g: Grid; x: number; y: number; S: number; errors?: boolean[]; outline?: Grid }) {
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
  if (outline) {
    // the true object's boundary: one segment wherever an object cell meets a non-object cell (or the edge)
    const n = outline.n
    const inside = (i: number, j: number) => i >= 0 && i < n && j >= 0 && j < n && outline.v[i * n + j] === 1
    let d = ''
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        if (!inside(i, j)) continue
        const X = x + j * c
        const Y = y + i * c
        if (!inside(i - 1, j)) d += `M${X.toFixed(1)},${Y.toFixed(1)}h${c.toFixed(2)}`
        if (!inside(i + 1, j)) d += `M${X.toFixed(1)},${(Y + c).toFixed(1)}h${c.toFixed(2)}`
        if (!inside(i, j - 1)) d += `M${X.toFixed(1)},${Y.toFixed(1)}v${c.toFixed(2)}`
        if (!inside(i, j + 1)) d += `M${(X + c).toFixed(1)},${Y.toFixed(1)}v${c.toFixed(2)}`
      }
    cells.push(<path key="outline" d={d} style={{ fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: 1.1, strokeLinecap: 'square' }} />)
  }
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

const zeros = (n: number): Grid => ({ n, v: new Array(n * n).fill(0) })

/** Run the toy decoder for one set of switches. */
function simulate(encs: Grid[], bott: Grid, target: Grid, skip: boolean[], context: boolean) {
  const decs: Grid[] = []
  let below: Grid = context ? bott : zeros(4)
  let what: Grid | null = context ? bott : null
  for (let l = 2; l >= 0; l--) {
    const where = skip[l] ? encs[l] : enlarge(below)
    what = what ? enlarge(what) : null
    const w = what
    decs[l] = w ? { n: where.n, v: where.v.map((f, i) => (w.v[i] >= TAU ? f : 0)) } : where
    below = decs[l]
  }
  const pred: Grid = { n: N, v: decs[0].v.map((f) => (f >= 0.5 ? 1 : 0)) }
  const wrong = pred.v.map((t, i) => t !== target.v[i])
  return { decs, pred, wrong, nWrong: wrong.filter(Boolean).length }
}

export default function SkipDetailDemo() {
  const [shape, setShape] = useState<Shape>('road')
  const [skip, setSkip] = useState<[boolean, boolean, boolean]>([false, false, false])
  const [context, setContext] = useState(true)
  const [wrapRef, measured] = useContainerWidth<HTMLDivElement>(560)
  const W = Math.max(300, Math.min(700, measured))

  const { enc, bott, target, run, area, clutterArea, compare } = useMemo(() => {
    const { target: t, clutter } = makeScene(shape)
    const e0: Grid = { n: N, v: t.v.map((f, i) => Math.max(f, clutter.v[i])) }
    const e1 = pool(e0)
    const e2 = pool(e1)
    const b = pool(pool(pool(t)))
    const encs = [e0, e1, e2]
    return {
      enc: encs,
      bott: b,
      target: t,
      run: simulate(encs, b, t, skip, context),
      area: t.v.reduce((s, x) => s + x, 0),
      clutterArea: clutter.v.reduce((s, x) => s + x, 0),
      compare: {
        bottleneckOnly: simulate(encs, b, t, [false, false, false], true).nWrong,
        skipOnly: simulate(encs, b, t, [true, false, false], false).nWrong,
        both: simulate(encs, b, t, [true, false, false], true).nWrong,
      },
    }
  }, [shape, skip, context])
  const { decs: dec, pred, wrong, nWrong } = run

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
  const ctxX = (bx + Sb + x1 + S + 10) / 2
  const ctxY = by + Sb / 2

  const toggle = (i: number) => setSkip((s) => s.map((v, k) => (k === i ? !v : v)) as [boolean, boolean, boolean])
  const lab = (x: number, y: number, t: string, anchor: 'start' | 'middle' | 'end' = 'start', color = 'var(--viz-ink)') => (
    <text x={x} y={y} textAnchor={anchor} style={{ fill: color, fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
      {t}
    </text>
  )
  const pill = (cx: number, cy: number, on: boolean, text: string, w = 58) => (
    <>
      <rect x={cx - w / 2} y={cy - 21} width={w} height={17} rx={8.5} style={{ fill: on ? 'var(--viz-3)' : 'var(--surface-2)', stroke: on ? 'var(--viz-3)' : 'var(--viz-muted)', strokeWidth: 1.2 }} />
      <text x={cx} y={cy - 9} textAnchor="middle" style={{ fill: on ? 'var(--surface)' : 'var(--ink-2)', fontSize: 10.5, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
        {text}
      </text>
    </>
  )
  const keyToggle = (f: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      f()
    }
  }

  return (
    <Figure
      title="What survives the trip down the U"
      caption={
        <>
          A toy model, not a trained network. The encoder&apos;s maps (left) only say <i>where</i> something with sharp edges is: up close, the object and
          the clutter ({CLUTTER_NAME[shape]}) look alike. Only the 4×4 bottleneck has seen enough of the picture to know <i>what</i> the object is. The
          decoder keeps a skip&apos;s sharp detail only where the map coming up from below says &ldquo;object&rdquo;. Start with every skip off: blobs, and
          the thin road vanishes. Switch on the 32×32 skip: sharp edges. Then cut the bottleneck&apos;s <b>context</b>: the clutter comes back. The
          outlined shape is the true object; red pixels are wrong.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          role="img"
          aria-label={`Encoder maps from 32 by 32 down to a 4 by 4 bottleneck, and decoder maps back up. Context from the bottleneck is ${context ? 'on' : 'cut'}. ${nWrong} of 1024 output pixels are wrong.`}
          style={{ display: 'block', maxWidth: W, margin: '0 auto' }}
        >
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
                <MapView g={r === 0 ? pred : dec[r]} x={x1} y={y} S={S} errors={r === 0 ? wrong : undefined} outline={r === 0 ? target : undefined} />
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
                  onKeyDown={keyToggle(() => toggle(r))}
                  style={{ cursor: 'pointer' }}
                >
                  <rect x={x0 + S + 2} y={cy - 18} width={gap - 4} height={36} style={{ fill: 'transparent' }} />
                  <Arrow pts={[[x0 + S + 4, cy], [x1 - 4, cy]]} color={on ? 'var(--viz-3)' : 'var(--viz-muted)'} width={on ? 2.6 : 1.4} dash={on ? undefined : '4 4'} />
                  {pill(midX, cy, on, on ? 'skip on' : 'off')}
                </g>
              </g>
            )
          })}
          {/* bottleneck */}
          {lab(W / 2, by - 6, 'bottleneck 4×4', 'middle')}
          <MapView g={bott} x={bx} y={by} S={Sb} />
          <Arrow pts={[[x0 - 10, rowY(2) + S * 0.3], [x0 - 10, by + Sb / 2], [bx - 4, by + Sb / 2]]} />
          <g
            role="button"
            tabIndex={0}
            aria-pressed={context}
            aria-label={`context from the bottleneck: ${context ? 'on' : 'cut'}. Press to toggle.`}
            onClick={() => setContext((c) => !c)}
            onKeyDown={keyToggle(() => setContext((c) => !c))}
            style={{ cursor: 'pointer' }}
          >
            <rect x={bx + Sb + 2} y={ctxY - 22} width={x1 + S + 10 - bx - Sb} height={34} style={{ fill: 'transparent' }} />
            <Arrow
              pts={[[bx + Sb + 4, ctxY], [x1 + S + 10, ctxY], [x1 + S + 10, rowY(2) + S * 0.3]]}
              color={context ? 'var(--viz-3)' : 'var(--viz-muted)'}
              width={context ? 2.2 : 1.4}
              dash={context ? undefined : '4 4'}
            />
            {pill(ctxX, ctxY, context, context ? 'context' : 'cut', 64)}
          </g>
        </svg>
      </div>
      <Readout
        items={[
          ['object / clutter pixels', `${area} / ${clutterArea}`],
          ['wrong output pixels now', `${nWrong} of 1024`],
          ['bottleneck only', `${compare.bottleneckOnly} wrong`],
          ['top skip, context cut', `${compare.skipOnly} wrong`],
          ['top skip + context', `${compare.both} wrong`],
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
        <Toggle label="context from the bottleneck" checked={context} onChange={setContext} />
        <Button onClick={() => setSkip([true, true, true])}>all skips on</Button>
        <Button onClick={() => setSkip([false, false, false])}>all off</Button>
      </Controls>
    </Figure>
  )
}
