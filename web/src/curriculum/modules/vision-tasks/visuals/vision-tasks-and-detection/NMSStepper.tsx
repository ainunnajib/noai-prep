import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Readout, usePlayer, PlayerControls, useNarrow } from '../../../../../kit'
import { DetScene } from './detScene'
import css from './det.module.css'

/*
  Non-maximum suppression, one greedy step at a time. A detector has produced 10 candidate
  boxes for a scene with two people standing close together, a car and a bush. Each step picks
  the highest-scoring box left, keeps it, computes its IoU with every remaining box of the same
  class, and suppresses those above the IoU threshold.
  Aha: NMS is a greedy loop driven by IoU; its threshold trades duplicates against missed neighbours.
*/

type Box = { id: string; cls: 'person' | 'car'; obj: 'A' | 'B' | 'car' | 'bush'; b: [number, number, number, number]; score: number }

// (x1, y1, x2, y2) in a 100 × 70 image, y pointing down
const BOXES: Box[] = [
  { id: 'A1', cls: 'person', obj: 'A', b: [20, 14, 38, 60], score: 0.92 },
  { id: 'A2', cls: 'person', obj: 'A', b: [18, 12, 37, 58], score: 0.81 },
  { id: 'A3', cls: 'person', obj: 'A', b: [22, 18, 40, 62], score: 0.64 },
  { id: 'B1', cls: 'person', obj: 'B', b: [27, 15, 45, 61], score: 0.88 },
  { id: 'B2', cls: 'person', obj: 'B', b: [29, 13, 46, 58], score: 0.73 },
  { id: 'B3', cls: 'person', obj: 'B', b: [25, 19, 44, 63], score: 0.55 },
  { id: 'C1', cls: 'car', obj: 'car', b: [58, 34, 94, 60], score: 0.95 },
  { id: 'C2', cls: 'car', obj: 'car', b: [55, 32, 90, 58], score: 0.83 },
  { id: 'C3', cls: 'car', obj: 'car', b: [61, 36, 96, 62], score: 0.58 },
  { id: 'F1', cls: 'person', obj: 'bush', b: [4, 30, 14, 50], score: 0.31 },
]

function iou(a: [number, number, number, number], b: [number, number, number, number]) {
  const iw = Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0]))
  const ih = Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]))
  const inter = iw * ih
  const union = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter
  return union > 0 ? inter / union : 0
}

type Status = 'cut' | 'wait' | 'current' | 'kept' | 'supp' | 'suppNow'
interface Frame {
  status: Record<string, Status>
  ious: Record<string, number>
  current: string | null
  msg: string
}

function runNMS(thr: number, conf: number) {
  const cut = BOXES.filter((b) => b.score < conf).map((b) => b.id)
  const order = BOXES.filter((b) => b.score >= conf).sort((a, b) => b.score - a.score)
  const frames: Frame[] = []
  const status: Record<string, Status> = {}
  BOXES.forEach((b) => (status[b.id] = cut.includes(b.id) ? 'cut' : 'wait'))
  frames.push({
    status: { ...status },
    ious: {},
    current: null,
    msg: cut.length
      ? `Start: drop ${cut.length} box${cut.length > 1 ? 'es' : ''} scoring below the confidence cut-off ${conf.toFixed(2)}, then sort the remaining ${order.length} by score (highest first).`
      : `Start: no box scores below the confidence cut-off ${conf.toFixed(2)}, so sort all ${order.length} boxes by score (highest first).`,
  })
  let remaining = [...order]
  const kept: Box[] = []
  while (remaining.length) {
    const cur = remaining[0]
    remaining = remaining.slice(1)
    kept.push(cur)
    const ious: Record<string, number> = {}
    const gone: string[] = []
    for (const r of remaining) {
      if (r.cls !== cur.cls) continue
      ious[r.id] = iou(cur.b, r.b)
      if (ious[r.id] > thr) gone.push(r.id)
    }
    Object.keys(status).forEach((k) => {
      if (status[k] === 'current') status[k] = 'kept'
      if (status[k] === 'suppNow') status[k] = 'supp'
    })
    status[cur.id] = 'current'
    gone.forEach((g) => (status[g] = 'suppNow'))
    const compared = Object.keys(ious)
    let msg = `Pick ${cur.id} (${cur.score.toFixed(2)}), the highest-scoring box left, and keep it. `
    if (!compared.length) msg += `No other ${cur.cls} boxes are left to compare with.`
    else {
      const parts = compared.map((k) => `${k} ${ious[k].toFixed(2)}`).join(', ')
      msg += `IoU with the remaining ${cur.cls} boxes: ${parts}. `
      msg += gone.length ? `Above ${thr.toFixed(2)}, so suppressed: ${gone.join(', ')}.` : `None is above ${thr.toFixed(2)}, so none is suppressed.`
    }
    frames.push({ status: { ...status }, ious, current: cur.id, msg })
    remaining = remaining.filter((r) => !gone.includes(r.id))
  }
  Object.keys(status).forEach((k) => {
    if (status[k] === 'current') status[k] = 'kept'
    if (status[k] === 'suppNow') status[k] = 'supp'
  })
  frames.push({ status: { ...status }, ious: {}, current: null, msg: `Done: ${kept.length} box${kept.length === 1 ? '' : 'es'} kept (${kept.map((k) => k.id).join(', ')}).` })
  return { frames, kept }
}

function verdict(kept: Box[], thr: number) {
  const n = (o: Box['obj']) => kept.filter((k) => k.obj === o).length
  const issues: string[] = []
  const aB = iou(BOXES[0].b, BOXES[3].b)
  if (n('B') === 0 && n('A') >= 1) issues.push(`Person B has vanished: the people overlap (their best boxes have IoU ${aB.toFixed(2)}), so with a threshold of ${thr.toFixed(2)} person A's box suppressed person B's. Raise the threshold.`)
  const dups = (['A', 'B', 'car'] as const).filter((o) => n(o) > 1)
  if (dups.length) issues.push(`Duplicates: ${dups.map((o) => (o === 'car' ? 'the car' : `person ${o}`)).join(' and ')} reported more than once. The threshold is too high to remove near-copies.`)
  if (n('bush') > 0) issues.push('The bush (score 0.31) survives as a false “person”. NMS cannot remove it because nothing overlaps it: raise the confidence cut-off.')
  return issues
}

const BOX_COLOUR = { person: 'var(--viz-4)', car: 'var(--viz-2)' }

export default function NMSStepper() {
  const [thr, setThr] = useState(0.5)
  const [conf, setConf] = useState(0.25)
  const { frames, kept } = useMemo(() => runNMS(thr, conf), [thr, conf])
  const player = usePlayer({ steps: frames.length, interval: 1600 })
  const f = frames[Math.min(player.step, frames.length - 1)]
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(620)
  const issues = verdict(kept, thr)
  const sorted = [...BOXES].sort((a, b) => b.score - a.score)

  return (
    <Figure
      title="Non-maximum suppression, step by step"
      caption={
        <>
          The detector proposed 10 overlapping boxes for 2 people, a car and a bush. Press <b>Next</b> to run NMS one pick at a time. Then drag the{' '}
          <b>IoU threshold</b> down to 0.30 and watch person B disappear, or up to 0.80 and watch duplicates survive. Finally use the <b>confidence cut-off</b> to
          get rid of the bush.
        </>
      }
    >
      <div ref={wrapRef} className={css.nmsWrap} style={{ gridTemplateColumns: narrow ? 'minmax(0, 1fr)' : 'minmax(0, 1.2fr) minmax(0, 1fr)' }}>
        <div style={{ display: 'grid', gap: 4, justifyItems: 'center', alignContent: 'start' }}>
          <svg viewBox="-1 -1 102 72" role="img" aria-label={`Scene with candidate boxes. ${f.msg}`} style={{ width: '100%', maxWidth: 520, height: 'auto', display: 'block', margin: '0 auto', borderRadius: 8 }}>
          <DetScene />
          {sorted.map((bx) => {
            const st = f.status[bx.id]
            const [x1, y1, x2, y2] = bx.b
            const col = BOX_COLOUR[bx.cls]
            const faded = st === 'cut' || st === 'supp'
            const isCur = st === 'current'
            const label = `${bx.id} ${bx.score.toFixed(2)}`
            // label the current pick and the best kept box of each object (keeps labels from piling up)
            const firstKept = st === 'kept' && !BOXES.some((o) => o.obj === bx.obj && o.score > bx.score && f.status[o.id] === 'kept')
            const showLabel = st === 'current' || firstKept
            const below = bx.obj === 'B' // person B's labels go under its box so they do not cover person A's
            const ly = below ? y2 : y1 - 5
            return (
              <g key={bx.id} style={{ opacity: faded ? 0.18 : st === 'wait' ? 0.75 : 1, transition: 'opacity 300ms' }}>
                <rect
                  x={x1}
                  y={y1}
                  width={x2 - x1}
                  height={y2 - y1}
                  style={{
                    fill: isCur ? `color-mix(in srgb, ${col} 14%, transparent)` : 'none',
                    stroke: st === 'suppNow' ? 'var(--viz-neg)' : col,
                    strokeWidth: isCur ? 1.4 : st === 'kept' ? 1.1 : 0.6,
                    strokeDasharray: st === 'suppNow' || st === 'cut' ? '2 1.5' : undefined,
                  }}
                />
                {showLabel && (
                  <g>
                    <rect x={x1} y={ly} width={label.length * 2.45 + 2} height={5} style={{ fill: col }} />
                    <text x={x1 + 1} y={ly + 3.7} style={{ fontSize: 3.9, fontWeight: 700, fill: 'var(--surface)' }}>
                      {label}
                    </text>
                  </g>
                )}
              </g>
            )
          })}
        </svg>
          <div className={css.legend}>
            <span>
              <i className={css.sw} style={{ background: 'var(--viz-4)' }} /> person box
            </span>
            <span>
              <i className={css.sw} style={{ background: 'var(--viz-2)' }} /> car box
            </span>
            <span>
              <i className={css.sw} style={{ background: 'var(--viz-neg)' }} /> suppressed this step (dashed)
            </span>
          </div>
        </div>
        <table className={css.nmsTable} aria-label="Candidate boxes sorted by score">
          <thead>
            <tr>
              <th>box</th>
              <th>class</th>
              <th>score</th>
              <th>IoU with pick</th>
              <th>status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((bx) => {
              const st = f.status[bx.id]
              const cls = st === 'current' ? css.cur : st === 'supp' ? css.gone : st === 'cut' ? css.cut : ''
              const v = f.ious[bx.id]
              return (
                <tr key={bx.id} className={cls}>
                  <td>{bx.id}</td>
                  <td>{bx.cls}</td>
                  <td>{bx.score.toFixed(2)}</td>
                  <td style={{ color: v != null && v > thr ? 'var(--viz-neg)' : undefined, fontWeight: v != null && v > thr ? 700 : undefined }}>
                    {st === 'current' ? 'picked' : v != null ? v.toFixed(2) : ''}
                  </td>
                  <td>
                    {st === 'kept' || st === 'current' ? (
                      <span className={`${css.tag} ${css.kept}`}>kept</span>
                    ) : st === 'supp' || st === 'suppNow' ? (
                      <span className={`${css.tag} ${css.supp}`}>suppressed</span>
                    ) : st === 'cut' ? (
                      <span className={`${css.tag} ${css.wait}`}>below cut-off</span>
                    ) : (
                      <span className={`${css.tag} ${css.wait}`}>waiting</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className={css.status} aria-live="polite">
        {f.msg}
      </div>
      <PlayerControls player={player} label={(s) => (s === 0 ? 'Start' : s === frames.length - 1 ? 'Done' : `Pick ${s} of ${frames.length - 2}`)} />
      <Controls>
        <Slider label="IoU threshold" value={thr} min={0.1} max={0.95} step={0.05} onChange={setThr} format={(v) => v.toFixed(2)} />
        <Slider label="confidence cut-off" value={conf} min={0} max={0.9} step={0.05} onChange={setConf} format={(v) => v.toFixed(2)} />
      </Controls>
      <div className={`${css.status} ${issues.length ? css.warn : css.ok}`}>
        <b>Final result with these settings: {kept.map((k) => k.id).join(', ') || 'nothing'}.</b>{' '}
        {issues.length ? issues.join(' ') : 'One box per real object, and no false alarms.'}
      </div>
      <Readout
        items={[
          ['boxes in', String(BOXES.length)],
          ['kept', String(kept.length)],
          ['real objects', '3 (2 people, 1 car)'],
        ]}
      />
    </Figure>
  )
}
