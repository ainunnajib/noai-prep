import { useRef, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Button, Plot, usePlot } from '../../../../../kit'
import { fmt, mean, median, modes } from './stats'

/*
  Mean as the balance point of a see-saw, median as the middle.
  Weights (bus waiting times) sit on a beam. In "pivot at the mean" mode the triangle always sits
  at the mean and the beam is level; the learner drags weights or adds an outlier and watches the
  pivot slide while the median marker barely moves. In "you place the pivot" mode the learner
  drags the pivot and the beam tips towards the heavier side until it sits at the mean.
*/

const START = [2, 3, 5, 5, 5, 7, 8]
const OUTLIER = 21
const X_MAX = 22

type Mode = 'auto' | 'manual'

/** Pivot positions snap to quarter-minutes, and to the exact mean when within half a step of it,
 *  so the beam can always be levelled (e.g. a mean of 36/7 = 5.142…). */
const PIVOT_STEP = 0.25
function snapPivot(x: number, m: number) {
  const p = Math.max(0, Math.min(X_MAX, Math.round(x / PIVOT_STEP) * PIVOT_STEP))
  return Math.abs(x - m) < PIVOT_STEP / 2 ? m : p
}
/** level when the pivot sits at the mean (allowing only floating-point error) */
const isLevel = (p: number, m: number) => Math.abs(p - m) < 1e-9

/** a weight the learner can drag along the beam (snaps to whole minutes; arrow keys move it by 1) */
function Weight({ cx, cy, r, value, color, onMove, label }: { cx: number; cy: number; r: number; value: number; color: string; onMove: (v: number) => void; label: string }) {
  const { toData } = usePlot()
  const dragging = useRef(false)
  const set = (v: number) => onMove(Math.max(0, Math.min(X_MAX, Math.round(v))))
  return (
    <g
      className="plot-drag"
      tabIndex={0}
      role="slider"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={X_MAX}
      aria-valuenow={value}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') set(value - 1)
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') set(value + 1)
        else return
        e.preventDefault()
      }}
      onPointerDown={(e) => {
        dragging.current = true
        ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => dragging.current && set(toData(e.clientX, e.clientY)[0])}
      onPointerUp={(e) => {
        dragging.current = false
        ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
      }}
    >
      <circle cx={cx} cy={cy} r={r + 7} style={{ fill: 'transparent' }} />
      <circle cx={cx} cy={cy} r={r} style={{ fill: color, stroke: 'var(--surface)', strokeWidth: 2 }} />
    </g>
  )
}

function Scene({ values, mode, pivot, setPivot, setValue, outlierIndex }: { values: number[]; mode: Mode; pivot: number; setPivot: (p: number) => void; setValue: (i: number, v: number) => void; outlierIndex: number }) {
  const { xs, height, margin, toData } = usePlot()
  const pivotDrag = useRef(false)
  const m = mean(values)
  const med = median(values)
  const md = modes(values)
  const p = mode === 'auto' ? m : pivot
  const unit = xs(1) - xs(0)
  const r = Math.max(8, Math.min(11, unit * 0.45))
  const gap = 2 * r + 1.5
  const RULER = 18
  const beamY = height - margin.bottom - RULER - 26 - 24 // top surface of the beam, where the weights sit
  const torque = values.reduce((s, v) => s + (v - p), 0)
  const angle = mode === 'auto' || isLevel(p, m) ? 0 : Math.max(-8, Math.min(8, torque * 0.8))
  const px = xs(p)
  const tipY = beamY + RULER
  const groundY = tipY + 26

  // stack equal values on top of each other
  const seen = new Map<number, number>()
  const placed = values.map((v, i) => {
    const k = seen.get(v) ?? 0
    seen.set(v, k + 1)
    return { v, i, k }
  })
  const tallest = Math.max(...seen.values())
  const showMode = tallest > 1 && md.length === 1
  const ticks = Array.from({ length: X_MAX + 1 }, (_, i) => i)
  const labelEvery = unit < 20 ? 2 : 1

  return (
    <>
      {/* median marker: dashed line from the top of the scene down to the beam */}
      {mode === 'auto' && (
        <g>
          <line x1={xs(med)} x2={xs(med)} y1={margin.top + 4} y2={beamY} style={{ stroke: 'var(--viz-3)', strokeWidth: 2, strokeDasharray: '5 4' }} />
          <text x={xs(med)} y={margin.top + 14} dx={xs(med) > xs(X_MAX * 0.75) ? -6 : 6} textAnchor={xs(med) > xs(X_MAX * 0.75) ? 'end' : 'start'} className="plot-label" style={{ fill: 'var(--viz-3)' }}>
            median {fmt(med)}
          </text>
        </g>
      )}

      {/* the beam is a ruler; it and its weights tip around the pivot */}
      <g style={{ transform: `rotate(${angle.toFixed(2)}deg)`, transformOrigin: `${px}px ${tipY}px`, transformBox: 'view-box', transition: 'transform 0.35s ease-out' }}>
        <rect x={xs(0) - 8} y={beamY} width={xs(X_MAX) - xs(0) + 16} height={RULER} rx={4} style={{ fill: 'var(--surface-2)', stroke: 'var(--viz-axis)', strokeWidth: 1.25 }} />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={xs(t)} x2={xs(t)} y1={beamY} y2={beamY + (t % labelEvery === 0 ? 3 : 5)} style={{ stroke: 'var(--viz-axis)' }} />
            {t % labelEvery === 0 && (
              <text x={xs(t)} y={beamY + 14} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>
                {t}
              </text>
            )}
          </g>
        ))}
        {placed.map(({ v, i, k }) => {
          const cx = xs(v)
          const cy = beamY - r - k * gap
          const color = i === outlierIndex ? 'var(--viz-4)' : 'var(--viz-1)'
          return mode === 'auto' ? (
            <Weight key={i} cx={cx} cy={cy} r={r} value={v} color={color} onMove={(nv) => setValue(i, nv)} label={`weight ${i + 1}: ${v} minutes`} />
          ) : (
            <circle key={i} cx={cx} cy={cy} r={r} style={{ fill: color, stroke: 'var(--surface)', strokeWidth: 2 }} />
          )
        })}
        {showMode && mode === 'auto' && (
          <text x={xs(md[0]) + r + 5} y={beamY - r - (tallest - 1) * gap + 4} textAnchor="start" className="plot-label" style={{ fill: 'var(--viz-5)' }}>
            mode
          </text>
        )}
      </g>

      {/* what can be dragged in this mode */}
      <text x={med > X_MAX * 0.6 ? xs(0) : xs(X_MAX)} y={margin.top + 14} textAnchor={med > X_MAX * 0.6 ? 'start' : 'end'} className="plot-label" style={{ fill: 'var(--ink-2)', fontSize: 12, fontWeight: 600 }}>
        {mode === 'auto' ? '⇆ drag any weight' : 'weights fixed: ⇆ drag the triangle'}
      </text>

      {/* pivot (fulcrum) */}
      <g
        className={mode === 'manual' ? 'plot-drag' : undefined}
        tabIndex={mode === 'manual' ? 0 : undefined}
        role={mode === 'manual' ? 'slider' : undefined}
        aria-label={mode === 'manual' ? 'pivot position' : undefined}
        aria-valuenow={mode === 'manual' ? pivot : undefined}
        onKeyDown={(e) => {
          if (mode !== 'manual') return
          if (e.key === 'ArrowLeft') setPivot(snapPivot(pivot - PIVOT_STEP, m))
          else if (e.key === 'ArrowRight') setPivot(snapPivot(pivot + PIVOT_STEP, m))
          else return
          e.preventDefault()
        }}
        onPointerDown={(e) => {
          if (mode !== 'manual') return
          pivotDrag.current = true
          ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (!pivotDrag.current) return
          const x = toData(e.clientX, e.clientY)[0]
          setPivot(snapPivot(x, m))
        }}
        onPointerUp={(e) => {
          pivotDrag.current = false
          ;(e.currentTarget as Element).releasePointerCapture(e.pointerId)
        }}
      >
        {mode === 'manual' && <rect x={px - 26} y={tipY} width={52} height={34} style={{ fill: 'transparent' }} />}
        <path d={`M${px},${tipY}L${px + 15},${groundY}L${px - 15},${groundY}Z`} style={{ fill: 'var(--viz-2)', stroke: 'var(--surface)', strokeWidth: 1.5 }} />
        <line x1={px - 28} x2={px + 28} y1={groundY} y2={groundY} style={{ stroke: 'var(--viz-axis)', strokeWidth: 2 }} />
      </g>
      <text x={px} y={groundY + 17} textAnchor={px < xs(2) ? 'start' : px > xs(X_MAX - 2) ? 'end' : 'middle'} className="plot-label" style={{ fill: 'var(--viz-2)' }}>
        {mode === 'auto' ? `mean ${fmt(m)}` : `pivot ${fmt(p)}${mode === 'manual' ? ' ⇆ drag' : ''}`}
      </text>
    </>
  )
}

export default function BalanceBeam() {
  const [values, setValues] = useState<number[]>(START)
  const [mode, setMode] = useState<Mode>('auto')
  const [pivot, setPivot] = useState(12)
  const hasOutlier = values.length > START.length
  const m = mean(values)
  const med = median(values)
  const md = modes(values)
  const p = mode === 'auto' ? m : pivot
  const left = values.filter((v) => v < p).reduce((s, v) => s + (p - v), 0)
  const right = values.filter((v) => v > p).reduce((s, v) => s + (v - p), 0)
  const balanced = isLevel(p, m)
  const setValue = (i: number, v: number) => setValues((vs) => vs.map((x, j) => (j === i ? v : x)))

  return (
    <Figure
      title="The mean is where the see-saw balances"
      caption={
        <>
          Seven friends' waiting times for a bus, as equal weights on a beam. Drag any weight, then press <b>Add an outlier</b> (one friend's bus broke down:{' '}
          {OUTLIER} minutes). Notice that the orange pivot (the mean) slides a long way towards the outlier, while the green median line hardly moves. Then switch
          to <b>you place the pivot</b> (the weights stay fixed) and drag the triangle: the beam only levels out when the pivot reaches the mean, where the total
          distance on the left equals the total distance on the right.
        </>
      }
    >
      <Plot x={[0, X_MAX]} y={[0, 1]} width={600} height={190} minHeight={200} margin={{ left: 16, right: 16, top: 8, bottom: 8 }} ariaLabel={`Balance beam with weights at ${values.join(', ')}; mean ${fmt(m)}, median ${fmt(med)}`}>
        <Scene values={values} mode={mode} pivot={pivot} setPivot={setPivot} setValue={setValue} outlierIndex={hasOutlier ? values.length - 1 : -1} />
      </Plot>
      <Controls>
        <Segmented
          label="Pivot"
          value={mode}
          onChange={(v) => {
            setMode(v)
            if (v === 'manual') setPivot(snapPivot(Math.min(X_MAX - 1, Math.round(m) + 5), m))
          }}
          options={[
            { value: 'auto', label: 'sits at the mean' },
            { value: 'manual', label: 'you place the pivot' },
          ]}
        />
        <Button primary onClick={() => setValues((vs) => (hasOutlier ? vs.slice(0, START.length) : [...vs, OUTLIER]))}>
          {hasOutlier ? 'Remove the outlier' : 'Add an outlier'}
        </Button>
        <Button
          onClick={() => {
            setValues(START)
            setPivot(12)
          }}
        >
          Reset
        </Button>
      </Controls>
      <Readout
        items={[
          ['n', String(values.length)],
          ['mean', `${fmt(m)} min`],
          ['median', `${fmt(med)} min`],
          ['mode', md.length === 0 ? 'none (all different)' : md.map((v) => fmt(v)).join(' and ')],
          [mode === 'auto' ? 'left pull = right pull' : 'left pull vs right pull', mode === 'auto' ? fmt(left) : `${fmt(left)} vs ${fmt(right)}${balanced ? ' (balanced!)' : ''}`],
        ]}
      />
    </Figure>
  )
}
