import { useId, useState } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, M, useContainerWidth } from '../../../../../kit'
import { fmt } from '../computational-graphs/graphCore'

/*
  Why gradients ADD where a value is used twice. x feeds two paths, u = 3x and v = x², which
  meet again in f = u + v. Nudge x by Δx: f feels the change through both paths, and the total
  change is the change through the top path plus the change through the bottom path.
  Close a path to see that each one alone gives only part of the effect.
*/

const u = (v: number, dp = 3) => fmt(v, dp).replace('-', '−')
const sgn = (v: number, dp = 3) => (v >= 0 ? `+${u(v, dp)}` : u(v, dp))

export default function BranchSum() {
  const [x, setX] = useState(1)
  const [dx, setDx] = useState(0.5)
  const [top, setTop] = useState(true)
  const [bot, setBot] = useState(true)
  const [ref, measured] = useContainerWidth<HTMLDivElement>(600)
  const uid = useId().replace(/:/g, '')

  const x1 = x + dx
  const u0 = 3 * x
  const v0 = x * x
  const f0 = u0 + v0
  const du = top ? 3 * x1 - u0 : 0
  const dv = bot ? x1 * x1 - v0 : 0
  const df = du + dv
  const slopeTop = 3
  const slopeBot = 2 * x

  const W = Math.max(300, Math.min(720, measured))
  const narrow = W < 520
  const H = 296
  // diagram positions
  const boxW = 66
  const cX = boxW / 2 + 3
  const cOp = W * (narrow ? 0.4 : 0.4)
  const cPlus = W * (narrow ? 0.64 : 0.68)
  const cF = W - boxW / 2 - 3
  const yMid = 92
  const yTop = 40
  const yBot = 144
  const r = 18
  const cTop = 'var(--viz-1)'
  const cBot = 'var(--viz-3)'

  const edge = (x1_: number, y1_: number, x2_: number, y2_: number, color: string, on: boolean, key: string) => {
    const dx_ = x2_ - x1_
    const dy_ = y2_ - y1_
    const len = Math.hypot(dx_, dy_)
    return (
      <line
        key={key}
        x1={x1_ + (dx_ / len) * (key.startsWith('x') ? boxW / 2 : r + 1)}
        y1={y1_ + (dy_ / len) * (key.startsWith('x') ? 15 : r + 1)}
        x2={x2_ - (dx_ / len) * (key.startsWith('p') ? boxW / 2 + 3 : r + 4)}
        y2={y2_ - (dy_ / len) * (key.startsWith('p') ? 0 : r + 4)}
        markerEnd={`url(#${uid}${on ? key.slice(-1) : 'm'})`}
        style={{ stroke: on ? color : 'var(--viz-muted)', strokeWidth: on ? 2.6 : 1.5, strokeDasharray: on ? undefined : '5 4' }}
      />
    )
  }

  // number line for the changes
  const nlY = 254
  const lo = Math.min(0, du, df, du + dv) - 0.05
  const hi = Math.max(0, du, df, du + dv) + 0.05
  const span = Math.max(hi - lo, 0.2)
  const L0 = 24
  const L1 = W - 24
  const sx = (v: number) => L0 + ((v - lo) / span) * (L1 - L0)
  const arrow = (a: number, b: number, y: number, color: string, label: string, above: boolean) => {
    if (Math.abs(b - a) < 1e-9) return null
    const xa = sx(a)
    const xb = sx(b)
    const dir = Math.sign(xb - xa)
    const lx = (xa + xb) / 2
    return (
      <g>
        <line x1={xa} y1={y} x2={xb - dir * 7} y2={y} style={{ stroke: color, strokeWidth: 4 }} strokeLinecap="round" />
        <path d={`M${xb},${y}L${xb - dir * 9},${y - 6}L${xb - dir * 9},${y + 6}Z`} style={{ fill: color }} />
        <text
          x={Math.max(L0 + 30, Math.min(L1 - 30, lx))}
          y={above ? y - 9 : y + 19}
          textAnchor="middle"
          className="tabular plot-label"
          style={{ fill: color, fontSize: 12.5, fontWeight: 800 }}
        >
          {label}
        </text>
      </g>
    )
  }

  return (
    <Figure
      title="Two paths, one total: why gradients add"
      caption={
        <>
          <M>x</M> reaches <M>f</M> along two paths. Nudge it by <M>\Delta x</M>: the top path changes <M>f</M> by <M>\Delta u</M>, the bottom path
          by <M>\Delta v</M>, and the total change is their <b>sum</b> (the arrows join tip to tail). Close a path to see it contribute nothing. Then
          shrink the nudge: <M>{'\\Delta f / \\Delta x'}</M> approaches <M>3 + 2x</M>, the sum of the two path slopes.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="plot" role="img" aria-label={`x feeds u = 3x and v = x squared, which add to f. A nudge of ${u(dx)} changes f by ${u(df)}.`}>
          <defs>
            {[
              ['1', cTop],
              ['2', cBot],
              ['3', 'var(--viz-axis)'],
              ['m', 'var(--viz-muted)'],
            ].map(([k, c]) => (
              <marker key={k} id={`${uid}${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0L10,5L0,10Z" style={{ fill: c }} />
              </marker>
            ))}
          </defs>
          {edge(cX, yMid, cOp, yTop, cTop, top, 'xt1')}
          {edge(cX, yMid, cOp, yBot, cBot, bot, 'xb2')}
          {edge(cOp, yTop, cPlus, yMid, cTop, top, 'ut1')}
          {edge(cOp, yBot, cPlus, yMid, cBot, bot, 'vb2')}
          {edge(cPlus, yMid, cF, yMid, 'var(--viz-axis)', true, 'pf3')}
          {/* x */}
          <rect x={cX - boxW / 2} y={yMid - 15} width={boxW} height={30} rx={8} style={{ fill: 'var(--surface)', stroke: 'var(--viz-axis)', strokeWidth: 1.5 }} />
          <text x={cX} y={yMid + 4.5} textAnchor="middle" className="tabular" style={{ fill: 'var(--viz-ink)', fontSize: 13, fontWeight: 700 }}>
            {`x = ${u(x)}`}
          </text>
          <text x={cX} y={yMid + 33} textAnchor="middle" className="tabular plot-label" style={{ fontSize: 12, fill: 'var(--viz-2)' }}>
            {`Δx = ${u(dx, 2)}`}
          </text>
          {/* ops */}
          {[
            { y: yTop, lab: '×3', c: cTop, on: top, name: 'u', v0: u0, d: du, ty: yTop - r - 8 },
            { y: yBot, lab: '( )²', c: cBot, on: bot, name: 'v', v0: v0, d: dv, ty: yBot + r + 17 },
          ].map((o) => (
            <g key={o.name}>
              <circle cx={cOp} cy={o.y} r={r} style={{ fill: `color-mix(in srgb, ${o.c} 12%, var(--surface))`, stroke: o.on ? o.c : 'var(--viz-muted)', strokeWidth: 2 }} />
              <text x={cOp} y={o.y + 4.5} textAnchor="middle" style={{ fill: 'var(--viz-ink)', fontSize: o.lab.length > 2 ? 12 : 14, fontWeight: 700 }}>
                {o.lab}
              </text>
              <text x={cOp} y={o.ty} textAnchor="middle" className="tabular plot-label" style={{ fontSize: 12.5, fill: o.on ? o.c : 'var(--viz-muted)' }}>
                {`${o.name}: ${u(o.v0)} → ${u(o.v0 + o.d)}  (Δ${o.name} = ${sgn(o.d)})`}
              </text>
            </g>
          ))}
          {/* plus */}
          <circle cx={cPlus} cy={yMid} r={r} style={{ fill: 'color-mix(in srgb, var(--viz-5) 12%, var(--surface))', stroke: 'var(--viz-5)', strokeWidth: 2 }} />
          <text x={cPlus} y={yMid + 6} textAnchor="middle" style={{ fill: 'var(--viz-ink)', fontSize: 18, fontWeight: 700 }}>
            +
          </text>
          {/* f */}
          <rect x={cF - boxW / 2} y={yMid - 15} width={boxW} height={30} rx={8} style={{ fill: 'var(--surface)', stroke: 'var(--viz-ink)', strokeWidth: 1.5 }} />
          <text x={cF} y={yMid + 4.5} textAnchor="middle" className="tabular" style={{ fill: 'var(--viz-ink)', fontSize: 13, fontWeight: 700 }}>
            {`f = ${u(f0, 2)}`}
          </text>
          <text x={cF} y={yMid + 33} textAnchor="middle" className="tabular plot-label" style={{ fontSize: 12.5 }}>
            {`→ ${u(f0 + df, 3)}`}
          </text>

          {/* number line of changes: the two path arrows join tip to tail; the dark bar is the total */}
          <line x1={sx(0)} y1={nlY - 58} x2={sx(0)} y2={nlY + 12} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.2, strokeDasharray: '3 3' }} />
          <line x1={L0} y1={nlY + 6} x2={L1} y2={nlY + 6} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.2 }} />
          {arrow(0, du, nlY - 42, cTop, `Δu ${sgn(du)}`, true)}
          {arrow(du, du + dv, nlY - 16, cBot, `Δv ${sgn(dv)}`, true)}
          {Math.abs(df) > 1e-9 && (
            <g>
              <line x1={sx(0)} y1={nlY + 6} x2={sx(df)} y2={nlY + 6} style={{ stroke: 'var(--viz-ink)', strokeWidth: 3.5 }} />
              <circle cx={sx(df)} cy={nlY + 6} r={4.5} style={{ fill: 'var(--viz-ink)' }} />
              <text x={sx(df)} y={nlY + 26} textAnchor="middle" className="tabular plot-label" style={{ fontSize: 12.5, fontWeight: 800 }}>
                Δf
              </text>
            </g>
          )}
          {Math.abs(sx(df) - sx(0)) > 26 && (
            <text x={sx(0)} y={nlY + 26} textAnchor="middle" className="tabular" style={{ fill: 'var(--ink-3)', fontSize: 12 }}>
              0
            </text>
          )}
        </svg>
      </div>
      <div style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden', fontSize: '0.95rem', lineHeight: 1.8 }}>
        <div>
          <M>{`\\Delta f = \\Delta u + \\Delta v = ${u(du).replace('−', '-')} + ${fmt(dv).startsWith('-') ? `(${fmt(dv)})` : fmt(dv)} = ${fmt(df)}`}</M>
        </div>
        <div style={{ color: 'var(--ink-2)' }}>
          Slopes: <M>{`\\frac{\\partial f}{\\partial x} = \\underbrace{3}_{\\text{top path}} + \\underbrace{2x}_{\\text{bottom path}} = 3 + ${slopeBot < 0 ? `(${fmt(slopeBot)})` : fmt(slopeBot)} = ${fmt(slopeTop + slopeBot)}`}</M>
        </div>
      </div>
      <Controls>
        <Slider label="x" value={x} min={-2} max={2} step={0.25} onChange={setX} format={(v) => u(v)} />
        <Slider label="nudge Δx" value={dx} min={0.01} max={1} step={0.01} onChange={setDx} format={(v) => u(v, 2)} />
        <Toggle label="top path open" checked={top} onChange={setTop} />
        <Toggle label="bottom path open" checked={bot} onChange={setBot} />
        <Readout
          items={[
            ['Δf ÷ Δx', u(df / dx, 3)],
            ['3 + 2x', u(slopeTop + slopeBot)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
