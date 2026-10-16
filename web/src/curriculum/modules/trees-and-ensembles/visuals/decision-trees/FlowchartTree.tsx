import { useState } from 'react'
import { Figure, useContainerWidth } from '../../../../../kit'
import Choice from '../Choice'
import { TXT_ORANGE } from '../tones'
import s from './trees.module.css'

/*
  The depth-2 tree that scikit-learn learns from the 32 made-up flats, drawn as a flowchart.
  Pick a flat and its path from the root to a leaf lights up.
*/

interface Flat {
  key: string
  label: string
  area: number
  lease: number
}

const FLATS: Flat[] = [
  { key: 'a', label: '100 m², 70 yrs', area: 100, lease: 70 },
  { key: 'b', label: '110 m², 55 yrs', area: 110, lease: 55 },
  { key: 'c', label: '80 m², 85 yrs', area: 80, lease: 85 },
]

/** node ids: q1 = lease question, q2 = area question, L1/L2/L3 = leaves */
function pathOf(f: Flat): string[] {
  if (f.lease <= 59.5) return ['q1', 'L1']
  return f.area <= 93 ? ['q1', 'q2', 'L2'] : ['q1', 'q2', 'L3']
}

export default function FlowchartTree() {
  const [pick, setPick] = useState('a')
  const [ref, width] = useContainerWidth<HTMLDivElement>(460)
  const W = Math.max(300, Math.min(540, width))
  const flat = FLATS.find((f) => f.key === pick)!
  const path = pathOf(flat)
  const on = (id: string) => path.includes(id)

  const nodeH = 30
  const gap = 66
  const yOf = (d: number) => 4 + d * gap
  const pos: Record<string, [number, number]> = {
    q1: [W * 0.4, yOf(0)],
    L1: [W * 0.17, yOf(1)],
    q2: [W * 0.64, yOf(1)],
    L2: [W * 0.44, yOf(2)],
    L3: [W * 0.82, yOf(2)],
  }
  const H = yOf(2) + nodeH + 6
  const qW = Math.min(150, W * 0.42)
  const lW = Math.min(124, W * 0.34)

  const edge = (from: string, to: string, yes: boolean) => {
    const [x1, y1] = pos[from]
    const [x2, y2] = pos[to]
    const lit = on(from) && on(to)
    const mx = (x1 + x2) / 2
    const my = (y1 + nodeH + y2) / 2
    return (
      <g key={`${from}-${to}`}>
        <line x1={x1} y1={y1 + nodeH} x2={x2} y2={y2} style={{ stroke: lit ? 'var(--accent)' : 'var(--viz-axis)', strokeWidth: lit ? 3 : 1.5 }} />
        <text className={s.edgeText} x={mx + (yes ? -8 : 8)} y={my - 7} dy="0.32em" textAnchor={yes ? 'end' : 'start'}>
          {yes ? 'yes' : 'no'}
        </text>
      </g>
    )
  }

  const question = (id: string, text: string) => {
    const [x, y] = pos[id]
    return (
      <g key={id}>
        <rect x={x - qW / 2} y={y} width={qW} height={nodeH} rx={8} style={{ fill: 'var(--surface-2)', stroke: on(id) ? 'var(--accent)' : 'var(--viz-axis)', strokeWidth: on(id) ? 2.5 : 1.2 }} />
        <text className={s.nodeText} x={x} y={y + nodeH / 2} dy="0.34em" textAnchor="middle" style={{ fontSize: 12.5 }}>
          {text}
        </text>
      </g>
    )
  }

  const leaf = (id: string, over: boolean) => {
    const [x, y] = pos[id]
    return (
      <g key={id}>
        <rect
          x={x - lW / 2}
          y={y}
          width={lW}
          height={nodeH}
          rx={8}
          style={{
            fill: `color-mix(in srgb, ${over ? 'var(--viz-2)' : 'var(--viz-1)'} ${on(id) ? 30 : 14}%, var(--surface))`,
            stroke: on(id) ? 'var(--accent)' : 'var(--viz-axis)',
            strokeWidth: on(id) ? 2.5 : 1.2,
          }}
        />
        <text x={x} y={y + nodeH / 2} dy="0.34em" textAnchor="middle" style={{ fontSize: 12.5, fontWeight: 700, fill: over ? TXT_ORANGE : 'var(--viz-1)' }}>
          {over ? '$600k or more' : 'under $600k'}
        </text>
      </g>
    )
  }

  const verdict = path[path.length - 1] === 'L3' ? '$600k or more' : 'under $600k'
  const steps =
    flat.lease <= 59.5
      ? `lease ${flat.lease} ≤ 59.5? yes`
      : `lease ${flat.lease} ≤ 59.5? no → area ${flat.area} ≤ 93? ${flat.area <= 93 ? 'yes' : 'no'}`

  return (
    <Figure title="The learned tree as a flowchart" caption={<>Pick a flat and follow its path from the top question down to a leaf.</>}>
      <div ref={ref} style={{ width: '100%' }}>
        <svg className={s.diagram} viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`A depth-2 tree. ${flat.label}: ${steps}, so it predicts ${verdict}.`} style={{ display: 'block' }}>
          {edge('q1', 'L1', true)}
          {edge('q1', 'q2', false)}
          {edge('q2', 'L2', true)}
          {edge('q2', 'L3', false)}
          {question('q1', 'lease ≤ 59.5 yrs?')}
          {question('q2', 'area ≤ 93 m²?')}
          {leaf('L1', false)}
          {leaf('L2', false)}
          {leaf('L3', true)}
        </svg>
      </div>
      <p className={s.status} style={{ textAlign: 'center' }}>
        {steps} → <b className={s.strong}>{verdict}</b>
      </p>
      <Choice label="Follow a flat" value={pick} onChange={setPick} options={FLATS.map((f) => ({ value: f.key, label: f.label }))} />
    </Figure>
  )
}
