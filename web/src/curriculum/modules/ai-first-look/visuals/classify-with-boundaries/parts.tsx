import type { ReactNode } from 'react'
import { usePlot } from '../../../../../kit'
import { type Run, type Student, PASS_C, FAIL_C, PASS_BG, FAIL_BG } from './students'

/** Background colouring: one rectangle per run of same-class grid cells. */
export function Regions({ runs, opacity = 1 }: { runs: Run[]; opacity?: number }) {
  const { xs, ys, clipId } = usePlot()
  return (
    <g clipPath={`url(#${clipId})`} aria-hidden="true" style={{ opacity }}>
      {runs.map((r, i) => (
        <rect
          key={i}
          x={xs(r.x0)}
          y={ys(r.y1)}
          width={xs(r.x1) - xs(r.x0) + 0.6}
          height={ys(r.y0) - ys(r.y1) + 0.6}
          shapeRendering="crispEdges"
          style={{ fill: r.pass ? PASS_BG : FAIL_BG }}
        />
      ))}
    </g>
  )
}

/** Students: pass = orange circle, fail = blue square. `hollow` draws new (test) students as outlines. */
export function StudentMarks({ data, r = 6, hollow = false, dim = false }: { data: Student[]; r?: number; hollow?: boolean; dim?: boolean }) {
  const { xs, ys } = usePlot()
  return (
    <g style={{ opacity: dim ? 0.35 : 1 }}>
      {data.map((p, i) => {
        const cx = xs(p.x)
        const cy = ys(p.y)
        const c = p.pass ? PASS_C : FAIL_C
        const style = hollow ? { fill: 'var(--surface)', stroke: c, strokeWidth: 2.6 } : { fill: c, stroke: 'var(--surface)', strokeWidth: 1.5 }
        return p.pass ? (
          <circle key={i} cx={cx} cy={cy} r={r} style={style} />
        ) : (
          <rect key={i} x={cx - r * 0.9} y={cy - r * 0.9} width={r * 1.8} height={r * 1.8} style={style} />
        )
      })}
    </g>
  )
}

/** A ring around points that the classifier gets wrong; it blinks unless the reader prefers reduced motion. */
export function WrongRings({ pts, still, r = 11 }: { pts: { x: number; y: number }[]; still: boolean; r?: number }) {
  const { xs, ys } = usePlot()
  return (
    <g aria-hidden="true">
      {pts.map((p, i) => (
        <circle key={i} cx={xs(p.x)} cy={ys(p.y)} r={r} style={{ fill: 'none', stroke: 'var(--viz-neg)', strokeWidth: 2.5 }}>
          {!still && <animate attributeName="opacity" values="1;0.15;1" dur="1.1s" repeatCount="indefinite" />}
        </circle>
      ))}
    </g>
  )
}

/** Small legend row in HTML (pass/fail shapes, plus optional extra items). */
export function Legend({ extra }: { extra?: { label: string; swatch: ReactNode }[] }) {
  const item = { display: 'inline-flex', alignItems: 'center', gap: '0.35rem' } as const
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.25rem 1rem', fontSize: '0.82rem', color: 'var(--ink-2)', fontWeight: 600 }}>
      <span style={item}>
        <svg width="14" height="14" aria-hidden="true">
          <circle cx="7" cy="7" r="6" style={{ fill: PASS_C }} />
        </svg>
        passed
      </span>
      <span style={item}>
        <svg width="14" height="14" aria-hidden="true">
          <rect x="1.5" y="1.5" width="11" height="11" style={{ fill: FAIL_C }} />
        </svg>
        failed
      </span>
      {extra?.map((e, i) => (
        <span key={i} style={item}>
          {e.swatch}
          {e.label}
        </span>
      ))}
    </div>
  )
}
