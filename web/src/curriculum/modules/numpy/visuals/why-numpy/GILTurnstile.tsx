import { useState } from 'react'
import { Figure, Controls, Readout, Segmented, Slider, Button, useAnimationFrame, useContainerWidth } from '../../../../../kit'

/*
  A timeline of T workers that each have 4 units of work.
  - Threads running pure Python must hold the GIL, so they take turns (the "turnstile").
  - Threads that call NumPy (C code) or wait for a download hold the GIL only briefly, then release it.
  - Processes each have their own interpreter and their own GIL, so they all run at once (after a start-up cost).
*/

type Work = 'python' | 'numpy' | 'io'
type RunAs = 'threads' | 'processes'
type Kind = 'py' | 'free' | 'wait' | 'spawn'
interface Seg {
  a: number
  b: number
  kind: Kind
}

const JOB = 4
const PY_PART = 0.5
const SPAWN = 0.5
const X_MAX = 16.5
const COLOURS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-5)']
const FREE_LABEL: Record<Work, string> = { python: '', numpy: 'C code', io: 'waiting for network' }

function schedule(work: Work, runAs: RunAs, T: number): Seg[][] {
  const rows: Seg[][] = []
  for (let k = 0; k < T; k++) {
    const segs: Seg[] = []
    if (runAs === 'processes') {
      segs.push({ a: 0, b: SPAWN, kind: 'spawn' })
      if (work === 'python') segs.push({ a: SPAWN, b: SPAWN + JOB, kind: 'py' })
      else segs.push({ a: SPAWN, b: SPAWN + PY_PART, kind: 'py' }, { a: SPAWN + PY_PART, b: SPAWN + JOB, kind: 'free' })
    } else if (work === 'python') {
      // round robin: slot s belongs to thread s % T, every thread needs JOB slots
      let last = 0
      for (let r = 0; r < JOB; r++) {
        const s = r * T + k
        if (s > last) segs.push({ a: last, b: s, kind: 'wait' })
        segs.push({ a: s, b: s + 1, kind: 'py' })
        last = s + 1
      }
    } else {
      const start = PY_PART * k
      if (start > 0) segs.push({ a: 0, b: start, kind: 'wait' })
      segs.push({ a: start, b: start + PY_PART, kind: 'py' }, { a: start + PY_PART, b: start + JOB, kind: 'free' })
    }
    rows.push(segs)
  }
  return rows
}

export default function GILTurnstile() {
  const [work, setWork] = useState<Work>('python')
  const [runAs, setRunAs] = useState<RunAs>('threads')
  const [T, setT] = useState(4)
  const rows = schedule(work, runAs, T)
  const wall = Math.max(...rows.map((r) => r[r.length - 1].b))
  const [clock, setClock] = useState<number | null>(null) // null = finished (show everything)
  const now = clock ?? wall
  const [ref, w] = useContainerWidth<HTMLDivElement>(560)
  const W = Math.max(300, Math.min(720, w))
  const narrow = W < 460
  const left = narrow ? 66 : 84
  const right = 10
  const rowH = 26
  const gap = 8
  const showGil = runAs === 'threads'
  const top = 22
  const lanes = (showGil ? 1 : 0) + T
  const plotBottom = top + lanes * (rowH + gap)
  const H = plotBottom + 28
  const x = (t: number) => left + (t / X_MAX) * (W - left - right)

  useAnimationFrame((dt) => {
    setClock((c) => {
      if (c == null) return null
      const n = c + dt * (wall / 4) // whole run takes about 4 s
      return n >= wall ? null : n
    })
  }, clock != null)

  const reset = (fn: () => void) => {
    setClock(null)
    fn()
  }

  // who holds the GIL right now?
  let holder = -1
  if (showGil)
    rows.forEach((segs, k) =>
      segs.forEach((s) => {
        if (s.kind === 'py' && now >= s.a && now < s.b) holder = k
      }),
    )
  const seq = JOB * T
  const speedup = seq / wall
  const name = runAs === 'threads' ? 'Thread' : 'Process'

  const gilSegs: { a: number; b: number; k: number }[] = []
  if (showGil) rows.forEach((segs, k) => segs.forEach((s) => s.kind === 'py' && gilSegs.push({ a: s.a, b: s.b, k })))

  const clipB = (b: number) => Math.min(b, now)

  return (
    <Figure
      title="The GIL: one thread through the turnstile at a time"
      caption={
        <>
          Each worker has 4 units of work. With <b>pure-Python threads</b>, only the thread holding the GIL may run, so adding threads
          does not finish the job sooner: they just take turns. Switch the work to <b>NumPy</b> or <b>downloads</b>: the GIL is released
          while C code runs or while waiting for the network, so the threads overlap. Switch to <b>processes</b>: each has its own GIL, so
          even pure Python runs in parallel (after a small start-up cost). Press Play to watch the turnstile.
        </>
      }
    >
      <Controls>
        <Segmented
          label="each worker's job"
          value={work}
          onChange={(v) => reset(() => setWork(v))}
          options={[
            { value: 'python', label: 'Python maths' },
            { value: 'numpy', label: 'NumPy maths' },
            { value: 'io', label: 'downloads' },
          ]}
        />
        <Segmented
          label="run them as"
          value={runAs}
          onChange={(v) => reset(() => setRunAs(v))}
          options={[
            { value: 'threads', label: 'threads' },
            { value: 'processes', label: 'processes' },
          ]}
        />
        <Slider label={runAs === "threads" ? "number of threads" : "number of processes"} value={T} min={1} max={4} step={1} onChange={(v) => reset(() => setT(v))} />
        <Button primary onClick={() => setClock(0)} disabled={clock != null}>
          {clock != null ? 'Playing…' : 'Play'}
        </Button>
      </Controls>
      <div ref={ref} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Timeline of ${T} ${name.toLowerCase()}s. All work finishes at time ${wall}, a speed-up of ${speedup.toFixed(1)} times.`} style={{ display: 'block', maxWidth: W, fontFamily: 'var(--font-body)' }}>
          {/* time grid */}
          {Array.from({ length: 9 }, (_, i) => i * 2).map((t) => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={top - 4} y2={plotBottom} style={{ stroke: 'var(--viz-grid)' }} />
              <text x={x(t)} y={plotBottom + 14} textAnchor="middle" style={{ fontSize: 11, fill: 'var(--ink-3)' }}>
                {t}
              </text>
            </g>
          ))}
          <text x={W - right} y={plotBottom + 26} textAnchor="end" style={{ fontSize: 11, fill: 'var(--ink-2)', fontWeight: 700 }}>
            time (units)
          </text>
          {/* single-thread reference: the job alone takes 4 units */}
          <line x1={x(JOB)} x2={x(JOB)} y1={top - 6} y2={plotBottom} style={{ stroke: 'var(--viz-muted)', strokeDasharray: '3 3' }} />
          <text x={x(JOB) + 4} y={top - 9} style={{ fontSize: 11, fill: 'var(--ink-3)', fontWeight: 700 }}>
            one job alone
          </text>

          {showGil && (
            <g>
              <text x={left - 8} y={top + rowH / 2 + 4} textAnchor="end" style={{ fontSize: 12, fontWeight: 700, fill: 'var(--ink)' }}>
                GIL
              </text>
              <rect x={x(0)} y={top} width={x(X_MAX) - x(0)} height={rowH} rx={5} style={{ fill: 'var(--surface-2)', stroke: 'var(--rule)' }} />
              {gilSegs
                .filter((s) => s.a < now)
                .map((s, i) => (
                  <rect key={i} x={x(s.a) + 0.5} y={top + 3} width={Math.max(0, x(clipB(s.b)) - x(s.a) - 1)} height={rowH - 6} rx={3} style={{ fill: COLOURS[s.k] }} />
                ))}
            </g>
          )}

          {rows.map((segs, k) => {
            const y = top + ((showGil ? 1 : 0) + k) * (rowH + gap)
            const c = COLOURS[k]
            return (
              <g key={k}>
                <text x={left - 8} y={y + rowH / 2 + 4} textAnchor="end" style={{ fontSize: narrow ? 11 : 12, fontWeight: 700, fill: c }}>
                  {`${name} ${k + 1}`}
                </text>
                {segs
                  .filter((s) => s.a < now)
                  .map((s, i) => {
                    const x0 = x(s.a)
                    const x1 = x(clipB(s.b))
                    const wd = Math.max(0, x1 - x0)
                    if (s.kind === 'wait')
                      return <line key={i} x1={x0} x2={x1} y1={y + rowH / 2} y2={y + rowH / 2} style={{ stroke: 'var(--viz-muted)', strokeWidth: 2, strokeDasharray: '2 4' }} />
                    if (s.kind === 'spawn')
                      return <rect key={i} x={x0 + 0.5} y={y + 4} width={Math.max(0, wd - 1)} height={rowH - 8} rx={3} style={{ fill: 'var(--surface-3)', stroke: 'var(--ink-3)' }} />
                    if (s.kind === 'py') return <rect key={i} x={x0 + 0.5} y={y} width={Math.max(0, wd - 1)} height={rowH} rx={4} style={{ fill: c }} />
                    return (
                      <g key={i}>
                        <rect x={x0 + 0.5} y={y + 1} width={Math.max(0, wd - 1)} height={rowH - 2} rx={4} style={{ fill: `color-mix(in srgb, ${c} 22%, var(--surface))`, stroke: c, strokeWidth: 1.2, strokeDasharray: '5 3' }} />
                        {wd > 120 && (
                          <text x={x0 + 8} y={y + rowH / 2 + 4} style={{ fontSize: 11, fill: 'var(--ink-2)', fontWeight: 600 }}>
                            {FREE_LABEL[work]}
                          </text>
                        )}
                      </g>
                    )
                  })}
              </g>
            )
          })}
          {/* playhead */}
          <line x1={x(now)} x2={x(now)} y1={top - 6} y2={plotBottom - gap + 2} style={{ stroke: 'var(--ink)', strokeWidth: 1.5 }} />
        </svg>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem 1rem', fontSize: '0.8rem', color: 'var(--ink-2)', width: '100%' }}>
        <span>
          <span style={{ display: 'inline-block', width: 14, height: 10, borderRadius: 2, background: 'var(--viz-1)', marginRight: 5 }} />
          running Python bytecode (needs the GIL)
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 14, height: 10, borderRadius: 2, border: '1.2px dashed var(--viz-1)', background: 'color-mix(in srgb, var(--viz-1) 22%, var(--surface))', marginRight: 5 }} />
          C code or waiting for the network (GIL released)
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 14, borderTop: '2px dotted var(--viz-muted)', marginRight: 5, verticalAlign: 'middle' }} />
          queuing for the GIL
        </span>
        {runAs === 'processes' && (
          <span>
            <span style={{ display: 'inline-block', width: 14, height: 10, borderRadius: 2, border: '1px solid var(--ink-3)', background: 'var(--surface-3)', marginRight: 5 }} />
            starting a new Python process
          </span>
        )}
      </div>
      <Readout
        items={[
          ['all work done at', `${wall} units`],
          ['one worker doing everything', `${seq} units`],
          ['speed-up', `× ${speedup.toFixed(1)}`],
          ...(showGil ? ([['GIL held by', holder >= 0 ? `Thread ${holder + 1}` : clock == null ? '(finished)' : 'nobody']] as [string, string][]) : []),
        ]}
      />
    </Figure>
  )
}
