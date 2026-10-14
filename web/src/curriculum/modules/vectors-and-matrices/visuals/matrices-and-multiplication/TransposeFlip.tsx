import { useState } from 'react'
import { Figure, Controls, Slider, Toggle, Button, Readout, M, useAnimationFrame, useContainerWidth } from '../../../../../kit'
import s from './mm.module.css'

/*
  The transpose as a mirror flip across the main diagonal. Every entry a_ij travels to
  position (j, i); entries on the diagonal stay put. Rows (coloured) become columns.
*/

const NUMS = [
  [1, 2, 3],
  [4, 5, 6],
]
const TIMETABLE = [
  ['Maths', 'Eng', 'Sci'],
  ['Chi', 'PE', 'Art'],
]
const ROWS = ['Mon', 'Tue']
const COLS = ['P1', 'P2', 'P3']
const SUB = ['₁', '₂', '₃']
const ROW_COLOUR = ['var(--viz-1)', 'var(--viz-2)']

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export default function TransposeFlip() {
  const [t, setT] = useState(0)
  const [dir, setDir] = useState<1 | -1>(1)
  const [playing, setPlaying] = useState(false)
  const [timetable, setTimetable] = useState(false)
  const [sel, setSel] = useState<[number, number]>([0, 2])
  const [ref, W] = useContainerWidth<HTMLDivElement>(400)

  useAnimationFrame((dt) => {
    // dt can be slightly negative on the very first frame; ignore that
    const nt = Math.max(0, Math.min(1, t + (dir * Math.max(0, dt)) / 1.3))
    setT(nt)
    if ((dir > 0 && nt >= 1) || (dir < 0 && nt <= 0)) setPlaying(false)
  }, playing)

  const play = () => {
    const d: 1 | -1 = t >= 0.5 ? -1 : 1
    setDir(d)
    setPlaying(true)
  }

  const e = ease(t)
  const c = W < 360 ? 46 : 54
  const hw = timetable ? 46 : 12
  const hh = timetable ? 28 : 12
  const ox = hw + 8
  const oy = hh + 8
  const width = ox + 3 * c + 16
  const height = oy + 3 * c + 40
  const bw = lerp(3 * c, 2 * c, e)
  const bh = lerp(2 * c, 3 * c, e)
  const data = timetable ? TIMETABLE : NUMS
  const flipped = t >= 0.5
  const ins = 3
  const [si, sj] = sel
  const selVal = data[si][sj]

  const bracket = (x: number, y: number, w: number, h: number) => {
    const k = 7
    return (
      <g style={{ fill: 'none', stroke: 'var(--ink)', strokeWidth: 2 }}>
        <path d={`M${x + k},${y - 3} H${x - 3} V${y + h + 3} H${x + k}`} />
        <path d={`M${x + w - k},${y - 3} H${x + w + 3} V${y + h + 3} H${x + w - k}`} />
      </g>
    )
  }

  return (
    <Figure
      title="The transpose: flip across the diagonal"
      caption={
        <>
          Press <b>Flip</b> or drag the slider. Each entry moves from row i, column j to row j, column i, crossing the dashed <b>main diagonal</b> like a mirror;
          entries on the diagonal don't move. Watch the blue row become the first column. Tap a cell to follow it, and switch on the timetable to see the same flip
          turn "days across" into "days down".
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width={width} style={{ maxWidth: '100%', height: 'auto' }} role="img" aria-label={flipped ? 'The transposed matrix, 3 rows by 2 columns' : 'The original matrix, 2 rows by 3 columns'}>
          {/* mirror line: the main diagonal */}
          <line x1={ox - 16} y1={oy - 16} x2={ox + 3 * c - 8} y2={oy + 3 * c - 8} style={{ stroke: 'var(--viz-muted)', strokeWidth: 1.6, strokeDasharray: '6 5' }} />
          {bracket(ox, oy, bw, bh)}
          {data.map((row, i) =>
            row.map((v, j) => {
              const x = ox + lerp(j, i, e) * c
              const y = oy + lerp(i, j, e) * c
              const on = i === si && j === sj
              const col = ROW_COLOUR[i]
              return (
                <g
                  key={`${i}${j}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`follow entry ${v}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSel([i, j])}
                  onKeyDown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && (ev.preventDefault(), setSel([i, j]))}
                >
                  <rect
                    x={x + ins}
                    y={y + ins}
                    width={c - 2 * ins}
                    height={c - 2 * ins}
                    rx={7}
                    style={{ fill: `color-mix(in srgb, ${col} ${on ? 34 : 16}%, var(--surface))`, stroke: col, strokeWidth: on ? 3 : 1.4 }}
                  />
                  <text x={x + c / 2} y={y + c / 2 + (timetable ? 0 : 3)} dy="0.35em" textAnchor="middle" className={timetable ? s.svgText : s.monoText} style={{ fontSize: timetable ? 12.5 : 17, fontWeight: 700, fill: 'var(--viz-ink)' }}>
                    {v}
                  </text>
                  {!timetable && (
                    <text x={x + 8} y={y + 15} style={{ fontSize: 10.5, fontWeight: 600, fill: 'var(--ink-3)' }}>
                      a{SUB[i]}
                      {SUB[j]}
                    </text>
                  )}
                </g>
              )
            }),
          )}
          {timetable && (
            <>
              {ROWS.map((r, i) => (
                <text key={r} x={lerp(ox - hw / 2 - 2, ox + i * c + c / 2, e)} y={lerp(oy + i * c + c / 2, oy - hh / 2 - 2, e)} dy="0.35em" textAnchor="middle" style={{ fontSize: 12.5, fontWeight: 800, fill: ROW_COLOUR[i] }}>
                  {r}
                </text>
              ))}
              {COLS.map((h, j) => (
                <text key={h} x={lerp(ox + j * c + c / 2, ox - hw / 2 - 2, e)} y={lerp(oy - hh / 2 - 2, oy + j * c + c / 2, e)} dy="0.35em" textAnchor="middle" style={{ fontSize: 12.5, fontWeight: 700, fill: 'var(--ink-2)' }}>
                  {h}
                </text>
              ))}
            </>
          )}
          <text x={ox + 3 * c + 6} y={oy + 3 * c + 14} textAnchor="end" style={{ fontSize: 11, fontWeight: 600, fill: 'var(--viz-muted)' }}>
            main diagonal
          </text>
          <text x={ox} y={oy + 3 * c + 32} style={{ fontSize: 13, fontWeight: 800, fill: 'var(--viz-ink)', opacity: Math.abs(1 - 2 * e) * 0.7 + 0.3 }}>
            {flipped ? 'Aᵀ is 3 × 2' : 'A is 2 × 3'}
          </text>
        </svg>
      </div>

      <div className={s.calc} aria-live="polite">
        <div>
          <b>{selVal}</b> is in row {si + 1}, column {sj + 1} of A, so it lands in row {sj + 1}, column {si + 1} of Aᵀ
          {si === sj ? ' (it is on the diagonal, so it stays put)' : ''}.
        </div>
        <M>{`a_{${si + 1}${sj + 1}} = (A^T)_{${sj + 1}${si + 1}} = ${typeof selVal === 'number' ? selVal : `\\text{${selVal}}`}`}</M>
      </div>

      <Controls>
        <Button primary onClick={play}>
          {t >= 0.5 ? 'Flip back' : 'Flip'}
        </Button>
        <Slider label="flip" value={Math.round(t * 100) / 100} min={0} max={1} step={0.01} onChange={(v) => (setPlaying(false), setT(v))} format={(v) => `${Math.round(v * 100)}%`} />
        <Toggle label="Timetable labels" checked={timetable} onChange={setTimetable} />
        <Readout items={[['shape', flipped ? '(3, 2)' : '(2, 3)']]} />
      </Controls>
    </Figure>
  )
}
