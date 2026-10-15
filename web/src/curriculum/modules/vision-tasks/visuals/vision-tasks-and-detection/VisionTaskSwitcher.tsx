import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Figure, Segmented, Readout, Toggle, useContainerWidth } from '../../../../../kit'
import { CLASS_COLOUR } from '../classColours'
import { OBJECTS, LABEL_MAP, ROWS, COLS, CELL, SW, SH, StreetPhoto, boxOf, objectAt, THINGS, type ClassName } from './street'
import css from './det.module.css'

/*
  One scene, five tasks. The same street picture is labelled as a classification model,
  a detector, and semantic, instance and panoptic segmentation models would label it.
  The label maps are computed from the drawing itself (each 2×2 cell takes the label of the
  shape covering its centre), so the masks are exact for this picture.
  Aha: the tasks differ in how much "where" information they produce, from none to every pixel.
*/

type Task = 'cls' | 'det' | 'sem' | 'inst' | 'pan'

const TASKS: { value: Task; label: string; where: string }[] = [
  { value: 'cls', label: 'Classification', where: 'no "where" at all' },
  { value: 'det', label: 'Detection', where: 'a box per object' },
  { value: 'sem', label: 'Semantic', where: 'a class for every pixel' },
  { value: 'inst', label: 'Instance', where: 'a mask per object' },
  { value: 'pan', label: 'Panoptic', where: 'class + object for every pixel' },
]

/* Class colours are shared across the module. The pale "stuff" tints are CSS variables (det.module.css, class .vts) so they
   can be made stronger in dark mode, where light tints vanish into the dark surface. */
const SEM_COLOUR: Record<ClassName, string> = {
  sky: 'var(--sem-sky)',
  building: 'var(--sem-building)',
  road: 'var(--sem-road)',
  car: CLASS_COLOUR.car,
  person: CLASS_COLOUR.person,
}
const PAN_STUFF: Record<string, string> = {
  sky: 'var(--pan-sky)',
  building: 'var(--pan-building)',
  road: 'var(--pan-road)',
}
/** one clearly different hue per object; the first car and first person keep their class colour */
const INST_COLOUR: Record<string, string> = {
  car1: CLASS_COLOUR.car,
  car2: 'var(--viz-3)',
  person1: CLASS_COLOUR.person,
  person2: 'var(--viz-1)',
  person3: 'var(--viz-6)',
}
/** label positions (centre x, top y) for the three people, whose boxes are too close for on-box labels */
const CALLOUT: Record<string, [number, number]> = { person1: [98, 31], person2: [122, 23], person3: [144, 31] }
const isThing = (k: number) => THINGS.includes(OBJECTS[k].cls)
const things = OBJECTS.map((o, k) => ({ o, k })).filter(({ k }) => isThing(k))
const nameOf = (k: number) => (isThing(k) ? `${OBJECTS[k].cls} #${OBJECTS[k].inst}` : OBJECTS[k].cls)

/** Colour of a label-map cell for a task, or null for "unlabelled". */
function cellColour(task: Task, k: number): string | null {
  const o = OBJECTS[k]
  if (task === 'sem') return SEM_COLOUR[o.cls]
  if (task === 'inst') return isThing(k) ? INST_COLOUR[o.id] : null
  if (task === 'pan') return isThing(k) ? INST_COLOUR[o.id] : PAN_STUFF[o.cls]
  return null
}

/** Run-length merge each row of the label map into rectangles (keeps the SVG small). */
function maskRects(task: Task, hi: number | null) {
  const out: ReactNode[] = []
  for (let r = 0; r < ROWS; r++) {
    let c = 0
    while (c < COLS) {
      const k = LABEL_MAP[r][c]
      let e = c
      while (e + 1 < COLS && LABEL_MAP[r][e + 1] === k) e++
      const col = cellColour(task, k)
      if (col) {
        const sameGroup = hi != null && (task === 'sem' ? OBJECTS[hi].cls === OBJECTS[k].cls : hi === k)
        out.push(
          <rect key={`${r}-${c}`} x={c * CELL} y={r * CELL} width={(e - c + 1) * CELL} height={CELL} style={{ fill: col, opacity: hi == null || sameGroup ? 1 : 0.55 }} />,
        )
      }
      c = e + 1
    }
  }
  return out
}

function countCells(pred: (k: number) => boolean) {
  let n = 0
  for (const row of LABEL_MAP) for (const k of row) if (pred(k)) n++
  return n
}

/** number of separate 4-connected blobs of a class in the label map */
function blobs(cls: ClassName) {
  const seen = LABEL_MAP.map((row) => row.map(() => false))
  let n = 0
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      if (seen[r][c] || OBJECTS[LABEL_MAP[r][c]].cls !== cls) continue
      n++
      const st: [number, number][] = [[r, c]]
      seen[r][c] = true
      while (st.length) {
        const [a, b] = st.pop()!
        for (const [da, db] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const y = a + da
          const x = b + db
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS && !seen[y][x] && OBJECTS[LABEL_MAP[y][x]].cls === cls) {
            seen[y][x] = true
            st.push([y, x])
          }
        }
      }
    }
  return n
}

export default function VisionTaskSwitcher() {
  const [task, setTask] = useState<Task>('det')
  const [hover, setHover] = useState<{ k: number; r: number; c: number } | null>(null)
  const [photo, setPhoto] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(640)
  const narrow = width < 560
  // keep box labels about 11 px tall on screen however narrow the picture gets
  const fs = Math.max(4.6, 11 / (Math.min(width, 640) / SW))

  const stats = useMemo(
    () => ({
      carCells: countCells((k) => OBJECTS[k].cls === 'car'),
      personCells: countCells((k) => OBJECTS[k].cls === 'person'),
      carBlobs: blobs('car'),
      personBlobs: blobs('person'),
      perObject: Object.fromEntries(things.map(({ o, k }) => [o.id, countCells((x) => x === k)])),
    }),
    [],
  )

  const onPoint = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * SW
    const y = ((e.clientY - rect.top) / rect.height) * SH
    if (x < 0 || y < 0 || x >= SW || y >= SH) return
    const r = Math.min(ROWS - 1, Math.floor(y / CELL))
    const c = Math.min(COLS - 1, Math.floor(x / CELL))
    setHover({ k: task === 'det' ? objectAt(x, y) : LABEL_MAP[r][c], r, c })
  }

  const hk = hover?.k ?? null
  const showMask = task === 'sem' || task === 'inst' || task === 'pan'
  const hiForMask = hk != null && showMask && (task !== 'inst' || isThing(hk)) ? hk : null

  // ----- the output read-out for the current task -----
  let shape: ReactNode
  let detail: ReactNode
  if (task === 'cls') {
    shape = <>one label for the whole image (the top score out of K classes)</>
    detail = (
      <>
        Output: <b>“street”</b>. It says nothing about where the cars or people are, or how many there are. Tapping different spots gives the same answer.
      </>
    )
  } else if (task === 'det') {
    shape = <>N × 6 table: (x₁, y₁, x₂, y₂, class, score) for each of N = {things.length} objects</>
    detail =
      hk != null && isThing(hk) ? (
        <>
          <b>{nameOf(hk)}</b>: box ({boxOf(OBJECTS[hk]).map((v) => Math.round(v)).join(', ')}), confidence {OBJECTS[hk].score?.toFixed(2)}. Sky, road and
          buildings get no boxes: detectors only look for countable objects.
        </>
      ) : (
        <>Tap a car or person to read its row. Sky, road and buildings get no boxes: detectors only look for countable objects.</>
      )
  } else if (task === 'sem') {
    shape = (
      <>
        {ROWS} × {COLS} map of class ids, one per pixel
      </>
    )
    detail =
      hk != null ? (
        <>
          Pixel (row {hover!.r}, col {hover!.c}): <b>{OBJECTS[hk].cls}</b>. The two cars form {stats.carBlobs === 1 ? 'one single' : stats.carBlobs} “car” region and the
          two touching people one “person” region: semantic segmentation cannot tell objects of the same class apart.
        </>
      ) : (
        <>
          Every pixel gets a class. But the two overlapping cars become {stats.carBlobs === 1 ? 'one' : stats.carBlobs} car-coloured blob: semantic segmentation cannot count objects.
        </>
      )
  } else if (task === 'inst') {
    shape = <>N masks of {ROWS} × {COLS} (1 = this object), each with a class and score</>
    detail =
      hk != null && isThing(hk) ? (
        <>
          <b>{nameOf(hk)}</b>: its own mask of {stats.perObject[OBJECTS[hk].id]} pixels. Overlapping objects of the same class are now separate.
        </>
      ) : (
        <>Each car and person gets its own mask and colour. Sky, road and buildings are left out: instance segmentation only covers countable “things”.</>
      )
  } else {
    shape = (
      <>
        {ROWS} × {COLS} map: a class for every pixel, plus an instance id for things
      </>
    )
    detail =
      hk != null ? (
        <>
          Pixel (row {hover!.r}, col {hover!.c}): <b>{isThing(hk) ? `${OBJECTS[hk].cls}, instance ${OBJECTS[hk].inst}` : `${OBJECTS[hk].cls} (stuff: no instance id)`}</b>.
        </>
      ) : (
        <>Every pixel is labelled. “Stuff” (sky, road, buildings) gets a class only; “things” (cars, people) also get an instance id.</>
      )
  }

  return (
    <Figure
      title="One scene, five tasks"
      caption={
        <>
          Switch between the five tasks and tap (or hover over) the picture to read the model&rsquo;s output at that spot. Compare <b>Semantic</b> with{' '}
          <b>Instance</b> on the two overlapping cars and the two touching people. Each step to the right adds more information about <i>where</i> things are.
        </>
      }
    >
      <Segmented label="Task" value={task} onChange={(t) => (setTask(t), setHover(null))} options={TASKS.map((t) => ({ value: t.value, label: t.label }))} />
      <div className={css.ladder} aria-hidden="true">
        {narrow ? (
          <span className={`${css.rung} ${css.rungOn}`}>
            {TASKS.findIndex((t) => t.value === task) + 1} / {TASKS.length} · {TASKS.find((t) => t.value === task)!.where}
          </span>
        ) : (
          TASKS.map((t) => (
            <span key={t.value} className={`${css.rung}${t.value === task ? ` ${css.rungOn}` : ''}`}>
              {t.where}
            </span>
          ))
        )}
        <span className={css.ladderArrow}>more “where” →</span>
      </div>
      <div ref={wrapRef} className={css.vts} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SW} ${SH}`}
          role="img"
          aria-label={`Street scene with two cars and three people, shown as ${TASKS.find((t) => t.value === task)!.label.toLowerCase()} output`}
          style={{ width: '100%', maxWidth: 640, height: 'auto', display: 'block', borderRadius: 8, touchAction: 'manipulation', cursor: 'crosshair' }}
          onPointerMove={onPoint}
          onPointerDown={onPoint}
          onPointerLeave={() => setHover(null)}
        >
          {(photo || !showMask) && <StreetPhoto />}
          {showMask && (
            <g shapeRendering="crispEdges" style={{ opacity: photo ? 0.75 : 1 }}>
              {!photo && <rect x={0} y={0} width={SW} height={SH} style={{ fill: 'var(--surface-2)' }} />}
              {maskRects(task, hiForMask)}
            </g>
          )}
          {task === 'cls' && (
            <g>
              <rect x={6} y={6} width={58} height={15} rx={4} style={{ fill: 'var(--surface)', stroke: 'var(--viz-ink)', strokeWidth: 0.8 }} />
              <text x={35} y={16.6} textAnchor="middle" style={{ fontSize: 8.5, fontWeight: 700, fill: 'var(--viz-ink)' }}>
                “street”
              </text>
            </g>
          )}
          {task === 'det' &&
            things.map(({ o, k }) => {
              const [x1, y1, x2, y2] = boxOf(o)
              const col = o.cls === 'car' ? 'var(--viz-2)' : 'var(--viz-4)'
              const on = hk === k
              const label = narrow ? `${o.cls} ${o.score?.toFixed(2).slice(1)}` : `${o.cls} ${o.score?.toFixed(2)}`
              const lh = fs * 1.41
              const w = label.length * fs * 0.6 + 3
              // people stand too close for labels on their boxes: use callouts with leader lines
              const call = CALLOUT[o.id]
              const lx = Math.min(SW - w, call ? call[0] - w / 2 : x1)
              const ly = call ? call[1] + 6.5 - lh : y1 - lh
              return (
                <g key={o.id} style={{ opacity: hk != null && isThing(hk) && !on ? 0.45 : 1 }}>
                  <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1} style={{ fill: 'none', stroke: col, strokeWidth: on ? 1.8 : 1.2 }} />
                  {call && <line x1={(x1 + x2) / 2} y1={y1} x2={call[0]} y2={ly + lh} style={{ stroke: col, strokeWidth: 0.7 }} />}
                  <rect x={lx} y={ly} width={w} height={lh} rx={1} style={{ fill: col }} />
                  <text x={lx + 1.5} y={ly + lh * 0.74} style={{ fontSize: fs, fontWeight: 700, fill: 'var(--surface)' }}>
                    {label}
                  </text>
                </g>
              )
            })}
        </svg>
      </div>
      {showMask && (
        <div className={`${css.legend} ${css.vts}`}>
          {task === 'sem' &&
            (Object.keys(SEM_COLOUR) as ClassName[]).map((c) => (
              <span key={c}>
                <i className={css.sw} style={{ background: SEM_COLOUR[c] }} />
                {c}
              </span>
            ))}
          {task !== 'sem' &&
            things.map(({ o }) => (
              <span key={o.id}>
                <i className={css.sw} style={{ background: INST_COLOUR[o.id] }} />
                {o.cls} #{o.inst}
              </span>
            ))}
          {task === 'pan' &&
            Object.keys(PAN_STUFF).map((c) => (
              <span key={c}>
                <i className={css.sw} style={{ background: PAN_STUFF[c] }} />
                {c}
              </span>
            ))}
        </div>
      )}
      <div className={css.out} aria-live="polite">
        <div>
          <span className={css.outKey}>Output shape</span> {shape}
        </div>
        <div>{detail}</div>
      </div>
      {showMask && <Toggle label="Show the photo under the mask" checked={photo} onChange={setPhoto} />}
      <Readout
        items={[
          ['task', TASKS.find((t) => t.value === task)!.label],
          ['separate car regions', task === 'sem' ? String(stats.carBlobs) : task === 'cls' ? '–' : '2'],
          ['separate person regions', task === 'sem' ? String(stats.personBlobs) : task === 'cls' ? '–' : '3'],
        ]}
      />
    </Figure>
  )
}
