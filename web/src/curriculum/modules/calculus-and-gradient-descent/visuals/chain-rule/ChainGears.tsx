import { useMemo, useRef, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Button, MBlock, useAnimationFrame, useContainerWidth } from '../../../../../kit'
import { ft } from '../derivatives-as-slopes/plotHelpers'

/*
  Three meshed gears x → u → y. Gear u turns r1 times per turn of x (du/dx = r1) and gear y turns
  r2 times per turn of u (dy/du = r2), so y turns r1·r2 times per turn of x: rates multiply.
  Tooth counts are exact integers (N_u = N_x / r1, N_y = N_u / r2) and the gears are drawn with a
  shared tooth size and the correct phase, so the teeth really mesh as they turn.
*/

const RATIOS = [0.5, 1, 1.5, 2, 3]
const COLS = ['var(--viz-1)', 'var(--viz-5)', 'var(--viz-2)']
const NAMES = ['x', 'u', 'y']

/** smallest tooth count for gear x so that all three gears have whole numbers of teeth (at least 8 each) */
function teeth(r1: number, r2: number): [number, number, number] {
  for (let na = 8; na < 400; na++) {
    const nb = na / r1
    const nc = nb / r2
    if (Math.abs(nb - Math.round(nb)) < 1e-9 && Math.abs(nc - Math.round(nc)) < 1e-9 && nb >= 8 && nc >= 8) return [na, Math.round(nb), Math.round(nc)]
  }
  return [24, 24, 24]
}

function gearPath(cx: number, cy: number, n: number, m: number, rot: number): string {
  const r = (n * m) / 2
  const rRoot = r - 1.25 * m
  const rTip = r + m
  const p = (2 * Math.PI) / n
  let d = ''
  for (let k = 0; k < n; k++) {
    const t = rot + k * p
    const pts: [number, number][] = [
      [rRoot, t - 0.3 * p],
      [rTip, t - 0.14 * p],
      [rTip, t + 0.14 * p],
      [rRoot, t + 0.3 * p],
    ]
    for (const [rr, a] of pts) d += `${d ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`
  }
  return d + 'Z'
}

export default function ChainGears() {
  const [r1, setR1] = useState(3)
  const [r2, setR2] = useState(2)
  const [phi, setPhi] = useState(Math.PI / 2) // total angle turned by gear x (radians), keeps counting past 2π
  const [playing, setPlaying] = useState(false)
  const [wrapRef, measured] = useContainerWidth<HTMLDivElement>(560)
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<{ last: number } | null>(null)

  const [na, nb, nc] = useMemo(() => teeth(r1, r2), [r1, r2])
  const W = Math.max(260, Math.min(680, measured))
  const H = W < 480 ? 230 : 330
  const pad = 10
  // tooth size (module) so that the row of gears fits the width and the biggest gear fits the height
  const m = Math.min((W - 2 * pad) / (na + nb + nc + 2.6), (H - 2 * pad - 18) / (Math.max(na, nb, nc) + 2.6))
  const ra = (na * m) / 2
  const rb = (nb * m) / 2
  const rc = (nc * m) / 2
  const rowW = 2 * (ra + rb + rc) + 2.6 * m
  const x0 = (W - rowW) / 2 + 1.3 * m
  const cy = (H - 18) / 2 + 2
  const cxA = x0 + ra
  const cxB = cxA + ra + rb
  const cxC = cxB + rb + rc

  // meshing phases (gear B is to the right of A, C to the right of B)
  const thA = phi
  const thB = Math.PI - Math.PI / nb - (na / nb) * thA
  const thC = Math.PI - Math.PI / nc - (nb / nc) * thB
  const turns = [phi / (2 * Math.PI), (phi / (2 * Math.PI)) * r1, (phi / (2 * Math.PI)) * r1 * r2]

  useAnimationFrame((dt) => setPhi((p) => p + dt * 1.2), playing)

  const angleAt = (e: React.PointerEvent) => {
    const svg = svgRef.current
    if (!svg) return 0
    const box = svg.getBoundingClientRect()
    const sx = W / box.width
    const px = (e.clientX - box.left) * sx
    const py = (e.clientY - box.top) * sx
    return Math.atan2(py - cy, px - cxA)
  }

  const gears = [
    { cx: cxA, n: na, r: ra, th: thA },
    { cx: cxB, n: nb, r: rb, th: thB },
    { cx: cxC, n: nc, r: rc, th: thC },
  ]

  return (
    <Figure
      title="Rates multiply along a chain of gears"
      caption={
        <>
          Drag gear <b>x</b> round (or press <b>Turn</b>) and watch the turn counters under each gear. Gear <i>u</i> turns <i>du/dx</i> times for every turn of <i>x</i>,
          and gear <i>y</i> turns <i>dy/du</i> times for every turn of <i>u</i>. Change the two ratios: the total is always their <b>product</b>. Neighbouring
          gears spin in opposite directions; here we only count turns.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="plot"
          role="img"
          aria-label={`Three gears: u turns ${r1} times per turn of x, y turns ${r2} times per turn of u, so y turns ${r1 * r2} times per turn of x`}
          onPointerMove={(e) => {
            if (!drag.current) return
            const a = angleAt(e)
            let d = a - drag.current.last
            if (d > Math.PI) d -= 2 * Math.PI
            if (d < -Math.PI) d += 2 * Math.PI
            drag.current.last = a
            setPhi((p) => p + d)
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerLeave={() => (drag.current = null)}
        >
          {gears.map((g, i) => (
            <g key={i}>
              <path
                d={gearPath(g.cx, cy, g.n, m, g.th)}
                style={{ fill: `color-mix(in srgb, ${COLS[i]} 22%, var(--surface))`, stroke: COLS[i], strokeWidth: 1.6, cursor: i === 0 ? 'grab' : undefined }}
                strokeLinejoin="round"
                onPointerDown={
                  i === 0
                    ? (e) => {
                        ;(e.currentTarget.ownerSVGElement as SVGSVGElement).setPointerCapture(e.pointerId)
                        drag.current = { last: angleAt(e) }
                        setPlaying(false)
                      }
                    : undefined
                }
              />
              {/* a spoke so the rotation is easy to see */}
              <line
                x1={g.cx}
                y1={cy}
                x2={g.cx + (g.r - 1.6 * m) * Math.cos(g.th)}
                y2={cy + (g.r - 1.6 * m) * Math.sin(g.th)}
                style={{ stroke: COLS[i], strokeWidth: Math.max(2, Math.min(5, g.r / 10)), pointerEvents: 'none' }}
                strokeLinecap="round"
              />
              <circle cx={g.cx} cy={cy} r={Math.max(9, Math.min(17, g.r * 0.3))} style={{ fill: 'var(--surface)', stroke: COLS[i], strokeWidth: 2, pointerEvents: 'none' }} />
              <text x={g.cx} y={cy} dy="0.35em" textAnchor="middle" style={{ fill: 'var(--viz-ink)', fontWeight: 800, fontSize: 14, pointerEvents: 'none' }}>
                {NAMES[i]}
              </text>
              <text x={g.cx} y={H - 4} textAnchor="middle" className="tabular" style={{ fill: COLS[i], fontWeight: 800, fontSize: 12.5 }}>
                {turns[i].toFixed(2)}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <Controls>
        <Segmented label="du/dx: turns of u per turn of x" value={r1} onChange={setR1} options={RATIOS.map((v) => ({ value: v, label: `×${v}` }))} />
        <Segmented label="dy/du: turns of y per turn of u" value={r2} onChange={setR2} options={RATIOS.map((v) => ({ value: v, label: `×${v}` }))} />
      </Controls>
      <Controls>
        <Button primary onClick={() => setPlaying((p) => !p)}>
          {playing ? 'Pause' : 'Turn'}
        </Button>
        <Button
          onClick={() => {
            setPlaying(false)
            setPhi(0)
          }}
        >
          Reset
        </Button>
      </Controls>
      <MBlock>{`\\frac{dy}{dx} = \\frac{dy}{du} \\times \\frac{du}{dx} = ${ft(r2, 2)} \\times ${ft(r1, 2)} = ${ft(r1 * r2, 2)}`}</MBlock>
      <Readout
        items={[
          ['turns of x, u, y', `${turns[0].toFixed(2)}, ${turns[1].toFixed(2)}, ${turns[2].toFixed(2)}`],
          ['y turns ÷ x turns', Math.abs(turns[0]) > 0.005 ? (turns[2] / turns[0]).toFixed(2) : '—'],
          ['teeth', `${na} → ${nb} → ${nc}`],
        ]}
      />
    </Figure>
  )
}
