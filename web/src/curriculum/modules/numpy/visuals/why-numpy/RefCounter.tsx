import { useId, useState, type CSSProperties } from 'react'
import { Figure, Controls, Segmented, usePlayer, PlayerControls, useContainerWidth } from '../../../../../kit'

/*
  Step through tiny programs and watch every object's reference count.
  Scenario 1: reference counting frees an object the moment its count reaches 0.
  Scenario 2: two lists that refer to each other keep their counts at 1 after the names are gone,
  so only the cyclic garbage collector (gc.collect()) can free them.
*/

type Scenario = 'count' | 'cycle'

interface ObjState {
  id: string
  label: string
  refs: number
  freed?: boolean
  unreachable?: boolean
}
interface StepState {
  line: number
  names: { name: string; to: string }[]
  objects: ObjState[]
  links: { from: string; to: string }[] // object slot -> object
  note: string
}

const PROGRAMS: Record<Scenario, { code: string[]; steps: StepState[] }> = {
  count: {
    code: ['a = [1, 2, 3]', 'b = a', 'del a', 'b = None'],
    steps: [
      { line: 0, names: [{ name: 'a', to: 'L' }], objects: [{ id: 'L', label: '[1, 2, 3]', refs: 1 }], links: [], note: 'A new list object is created and the name a refers to it. Its reference count is 1.' },
      {
        line: 1,
        names: [
          { name: 'a', to: 'L' },
          { name: 'b', to: 'L' },
        ],
        objects: [{ id: 'L', label: '[1, 2, 3]', refs: 2 }],
        links: [],
        note: 'b = a does NOT copy the list. It adds a second reference to the same object, so the count goes up to 2.',
      },
      { line: 2, names: [{ name: 'b', to: 'L' }], objects: [{ id: 'L', label: '[1, 2, 3]', refs: 1 }], links: [], note: 'del a removes the name a, not the object. b still refers to the list, so its count is 1 and it stays alive.' },
      {
        line: 3,
        names: [{ name: 'b', to: 'N' }],
        objects: [
          { id: 'L', label: '[1, 2, 3]', refs: 0, freed: true },
          { id: 'N', label: 'None', refs: 0 },
        ],
        links: [],
        note: 'Now nothing refers to the list: its count drops to 0 and Python frees its memory immediately. No waiting.',
      },
    ],
  },
  cycle: {
    code: ['a = []', 'b = [a]', 'a.append(b)', 'del a, b', 'gc.collect()'],
    steps: [
      { line: 0, names: [{ name: 'a', to: 'A' }], objects: [{ id: 'A', label: 'list A', refs: 1 }], links: [], note: 'An empty list A is created; the name a refers to it.' },
      {
        line: 1,
        names: [
          { name: 'a', to: 'A' },
          { name: 'b', to: 'B' },
        ],
        objects: [
          { id: 'A', label: 'list A', refs: 2 },
          { id: 'B', label: 'list B', refs: 1 },
        ],
        links: [{ from: 'B', to: 'A' }],
        note: 'List B holds a reference to A inside it, so A is now referred to twice: by the name a and by B.',
      },
      {
        line: 2,
        names: [
          { name: 'a', to: 'A' },
          { name: 'b', to: 'B' },
        ],
        objects: [
          { id: 'A', label: 'list A', refs: 2 },
          { id: 'B', label: 'list B', refs: 2 },
        ],
        links: [
          { from: 'B', to: 'A' },
          { from: 'A', to: 'B' },
        ],
        note: 'Now A also holds a reference to B. The two lists refer to each other: a reference cycle.',
      },
      {
        line: 3,
        names: [],
        objects: [
          { id: 'A', label: 'list A', refs: 1, unreachable: true },
          { id: 'B', label: 'list B', refs: 1, unreachable: true },
        ],
        links: [
          { from: 'B', to: 'A' },
          { from: 'A', to: 'B' },
        ],
        note: 'The names are gone, so your program can never reach these lists again. But each is still referred to by the other, so both counts are 1, never 0. Reference counting alone cannot free them.',
      },
      {
        line: 4,
        names: [],
        objects: [
          { id: 'A', label: 'list A', refs: 0, freed: true },
          { id: 'B', label: 'list B', refs: 0, freed: true },
        ],
        links: [],
        note: 'The cyclic garbage collector looks for groups of objects that only refer to each other, finds this island and frees both. Python runs it automatically from time to time; gc.collect() runs it now.',
      },
    ],
  },
}

const codeLine = (state: 'done' | 'now' | 'todo'): CSSProperties => ({
  display: 'block',
  padding: '0.1rem 0.5rem',
  borderRadius: 5,
  background: state === 'now' ? 'var(--highlight-soft)' : 'transparent',
  boxShadow: state === 'now' ? 'inset 3px 0 0 var(--highlight)' : undefined,
  color: state === 'todo' ? 'var(--ink-3)' : 'var(--ink)',
  opacity: state === 'todo' ? 0.6 : 1,
  fontWeight: state === 'now' ? 700 : 400,
})

export default function RefCounter() {
  const [sc, setSc] = useState<Scenario>('count')
  const prog = PROGRAMS[sc]
  const player = usePlayer({ steps: prog.steps.length, interval: 2200 })
  const st = prog.steps[Math.min(player.step, prog.steps.length - 1)]
  const [ref, w] = useContainerWidth<HTMLDivElement>(420)
  const W = Math.max(280, Math.min(520, w))
  const mid = useId().replace(/:/g, '')

  const H = 186
  const ox = Math.max(96, Math.round(W * 0.3))
  const ow = 104
  const oh = 38
  const pos: Record<string, { x: number; y: number; w: number }> = {
    L: { x: ox, y: 34, w: ow },
    N: { x: ox, y: 124, w: 60 },
    A: { x: ox, y: 24, w: ow },
    B: { x: ox, y: 124, w: ow },
  }
  const nameY: Record<string, number> = sc === 'count' ? { a: 38, b: 128 } : { a: 28, b: 128 }

  return (
    <Figure
      title="Reference counting, and the cycles it cannot see"
      caption={
        <>
          Step through each program with <b>Next</b>. Watch the count beside each object: an object is freed the instant nothing refers to
          it. Then try the <b>reference cycle</b>: two lists pointing at each other keep each other's count at 1 even after your program has
          lost them, which is exactly why Python also has a cyclic garbage collector.
        </>
      }
    >
      <Controls>
        <Segmented
          label="program"
          value={sc}
          onChange={(v) => {
            setSc(v)
            player.reset()
          }}
          options={[
            { value: 'count', label: 'reference counting' },
            { value: 'cycle', label: 'a reference cycle' },
          ]}
        />
      </Controls>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '0.8rem', width: '100%', alignItems: 'center' }}>
        <pre style={{ margin: 0, padding: '0.5rem 0.3rem', background: 'var(--surface-2)', borderRadius: 10, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.6 }} aria-label="Program">
          {sc === 'cycle' && <span style={codeLine('done')}>import gc</span>}
          {prog.code.map((c, i) => (
            <span key={i} style={codeLine(i < st.line ? 'done' : i === st.line ? 'now' : 'todo')}>
              {c}
            </span>
          ))}
        </pre>
        <div ref={ref} style={{ width: '100%' }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={st.note} style={{ display: 'block', maxWidth: W, fontFamily: 'var(--font-body)' }}>
            <defs>
              <marker id={`${mid}m`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" style={{ fill: 'var(--ink-2)' }} />
              </marker>
            </defs>
            <text x={8} y={12} style={{ fontSize: 11, fill: 'var(--ink-3)', fontWeight: 700 }}>
              names
            </text>
            <text x={ox} y={12} style={{ fontSize: 11, fill: 'var(--ink-3)', fontWeight: 700 }}>
              objects in memory
            </text>
            {/* name tags */}
            {st.names.map((n) => {
              const y = nameY[n.name]
              const p = pos[n.to]
              const ty = p.y + oh / 2
              return (
                <g key={n.name}>
                  <rect x={8} y={y} width={34} height={28} rx={6} style={{ fill: 'var(--accent-soft)', stroke: 'var(--accent)' }} />
                  <text x={25} y={y + 19} textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, fill: 'var(--accent)' }}>
                    {n.name}
                  </text>
                  <path d={`M44,${y + 14} C${(44 + p.x) / 2},${y + 14} ${(44 + p.x) / 2},${ty} ${p.x - 3},${ty}`} markerEnd={`url(#${mid}m)`} style={{ fill: 'none', stroke: 'var(--ink-2)', strokeWidth: 1.6 }} />
                </g>
              )
            })}
            {/* object-to-object references (cycle) */}
            {st.links.map((l, i) => {
              const a = pos[l.from]
              const b = pos[l.to]
              const down = b.y > a.y
              const sx = a.x + (down ? 74 : 30)
              const sy = down ? a.y + oh : a.y
              const ex = b.x + (down ? 74 : 30)
              const ey = down ? b.y - 3 : b.y + oh + 3
              return <path key={i} d={`M${sx},${sy} C${sx + (down ? 26 : -26)},${(sy + ey) / 2} ${ex + (down ? 26 : -26)},${(sy + ey) / 2} ${ex},${ey}`} markerEnd={`url(#${mid}m)`} style={{ fill: 'none', stroke: 'var(--viz-4)', strokeWidth: 1.8 }} />
            })}
            {/* objects */}
            {st.objects.map((o) => {
              const p = pos[o.id]
              const dead = o.freed
              const lone = o.id === 'N'
              return (
                <g key={o.id} style={{ opacity: dead ? 0.45 : 1 }}>
                  <rect
                    x={p.x}
                    y={p.y}
                    width={p.w}
                    height={oh}
                    rx={7}
                    style={{
                      fill: dead ? 'transparent' : o.unreachable ? 'color-mix(in srgb, var(--viz-neg) 12%, var(--surface))' : 'var(--surface-2)',
                      stroke: dead ? 'var(--ink-3)' : o.unreachable ? 'var(--viz-neg)' : 'var(--ink-2)',
                      strokeWidth: 1.5,
                      strokeDasharray: dead || o.unreachable ? '5 4' : undefined,
                    }}
                  />
                  <text x={p.x + p.w / 2} y={p.y + oh / 2 + 5} textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, fill: 'var(--ink)', textDecoration: dead ? 'line-through' : undefined }}>
                    {o.label}
                  </text>
                  {!lone && (
                    <g>
                      <text x={p.x + p.w + 8} y={p.y + 15} style={{ fontSize: 11, fill: 'var(--ink-3)', fontWeight: 700 }}>
                        {dead ? 'freed' : 'ref count'}
                      </text>
                      {!dead && (
                        <text x={p.x + p.w + 8} y={p.y + 33} style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 800, fill: o.refs === 0 ? 'var(--viz-neg)' : o.unreachable ? 'var(--viz-neg)' : 'var(--viz-pos)' }}>
                          {o.refs}
                        </text>
                      )}
                      {!dead &&
                        Array.from({ length: o.refs }, (_, i) => (
                          <circle key={i} cx={p.x + p.w + 30 + i * 11} cy={p.y + 27} r={4} style={{ fill: o.unreachable ? 'var(--viz-neg)' : 'var(--viz-pos)' }} />
                        ))}
                    </g>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      </div>
      <PlayerControls player={player} label={(s) => `Line ${s + 1} of ${prog.steps.length}`} />
      <div style={{ width: '100%', fontSize: '0.9rem', color: 'var(--ink)', background: 'var(--surface-2)', borderRadius: 8, padding: '0.5rem 0.7rem', minHeight: '3.2em' }} aria-live="polite">
        {st.note}
      </div>
    </Figure>
  )
}
