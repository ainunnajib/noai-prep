import { useEffect, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Segmented, Button, useContainerWidth } from '../../../../../kit'
import { npPrint, shapeStr, type Nested } from './npFormat'
import css from './reshape.module.css'

/*
  Two (2, 3) arrays A and B, joined with concatenate, stack, vstack or hstack along a chosen axis.
  Every cell keeps its colour (A blue, B orange) and slides to its place in the result.
*/

type Fn = 'concatenate' | 'stack' | 'vstack' | 'hstack'
interface Cell {
  id: string
  v: number
  src: 'A' | 'B'
}
type Grid = Cell[][]

const mk = (src: 'A' | 'B', base: number): Grid => [0, 1].map((i) => [0, 1, 2].map((j) => ({ id: `${src}${i}${j}`, v: base + i * 3 + j, src })))
const A = mk('A', 1)
const B = mk('B', 7)
const ALL = [...A.flat(), ...B.flat()]

interface Result {
  panels?: { label: string; grid: Grid }[]
  shape?: number[]
  nested?: Nested
  error?: string
  explain: string
}

function compute(fn: Fn, axis: number): Result {
  const f = fn === 'vstack' ? 0 : fn === 'hstack' ? 1 : axis
  if (fn !== 'stack') {
    if (f === 2) return { error: 'AxisError: axis 2 is out of bounds for array of dimension 2', explain: 'A and B only have axes 0 and 1, and concatenate can only join along an axis that already exists.' }
    const g: Grid = f === 0 ? [...A, ...B] : A.map((row, i) => [...row, ...B[i]])
    const shortcut = fn === 'vstack' ? 'vstack is a shortcut for concatenating along axis 0. ' : fn === 'hstack' ? 'hstack is a shortcut for concatenating along axis 1. ' : ''
    return {
      panels: [{ label: 'result', grid: g }],
      shape: [g.length, g[0].length],
      nested: g.map((r) => r.map((c) => c.v)),
      explain:
        shortcut +
        (f === 0
          ? "B's rows go underneath A's rows. Axis 0 grows from 2 + 2 = 4; nothing new is created, so it stays 2-D."
          : "B's columns go to the right of A's columns. Axis 1 grows from 3 + 3 = 6; it stays 2-D."),
    }
  }
  if (f === 0)
    return {
      panels: [
        { label: 'result[0]', grid: A },
        { label: 'result[1]', grid: B },
      ],
      shape: [2, 2, 3],
      nested: [A, B].map((g) => g.map((r) => r.map((c) => c.v))),
      explain: 'A brand-new axis 0 is added in front: result[0] is all of A and result[1] is all of B. Two (2, 3) arrays become one (2, 2, 3) array.',
    }
  if (f === 1) {
    const blocks = [0, 1].map((i) => [A[i], B[i]])
    return {
      panels: blocks.map((g, i) => ({ label: `result[${i}]`, grid: g })),
      shape: [2, 2, 3],
      nested: blocks.map((g) => g.map((r) => r.map((c) => c.v))),
      explain: 'The new axis goes in position 1: result[i] pairs row i of A with row i of B. Same shape (2, 2, 3) as axis=0, but the numbers are grouped differently.',
    }
  }
  const blocks = [0, 1].map((i) => [0, 1, 2].map((j) => [A[i][j], B[i][j]]))
  return {
    panels: blocks.map((g, i) => ({ label: `result[${i}]`, grid: g })),
    shape: [2, 3, 2],
    nested: blocks.map((g) => g.map((r) => r.map((c) => c.v))),
    explain: 'The new axis goes at the end: result[i, j] is the pair (A[i, j], B[i, j]). Shape (2, 3) with a new length-2 axis on the end gives (2, 3, 2).',
  }
}

function place(panels: { label: string; grid: Grid }[], W: number) {
  const gap = 4
  const pg = 22
  const dims = panels.map((p) => ({ r: p.grid.length, c: p.grid[0].length }))
  const sumC = dims.reduce((a, d) => a + d.c, 0)
  let s = Math.min(42, Math.floor((W - (panels.length - 1) * pg - dims.reduce((a, d) => a + (d.c - 1) * gap, 0)) / sumC))
  const side = s >= 30
  if (!side) s = Math.min(42, Math.floor((W - (Math.max(...dims.map((d) => d.c)) - 1) * gap) / Math.max(...dims.map((d) => d.c))))
  const pos: Record<string, { x: number; y: number; s: number }> = {}
  const labels: { x: number; y: number; text: string }[] = []
  const widths = dims.map((d) => d.c * s + (d.c - 1) * gap)
  const heights = dims.map((d) => d.r * s + (d.r - 1) * gap)
  const totalW = side ? widths.reduce((a, b) => a + b, 0) + (panels.length - 1) * pg : Math.max(...widths)
  let x = (W - totalW) / 2
  let y = 20
  panels.forEach((p, k) => {
    const px = side ? x : (W - widths[k]) / 2
    labels.push({ x: px, y: y - 18, text: p.label })
    p.grid.forEach((row, i) => row.forEach((cell, j) => (pos[cell.id] = { x: px + j * (s + gap), y: y + i * (s + gap), s })))
    if (side) x += widths[k] + pg
    else y += heights[k] + 30
  })
  const H = side ? 20 + Math.max(...heights) + 4 : y - 30 + 4
  return { pos, labels, H }
}

const pre: CSSProperties = {
  margin: 0,
  padding: '0.55rem 0.75rem',
  background: 'var(--surface-2)',
  borderRadius: 8,
  fontFamily: 'var(--font-mono)',
  fontSize: '0.85rem',
  lineHeight: 1.45,
  color: 'var(--ink)',
  whiteSpace: 'pre',
  overflowX: 'auto',
  width: '100%',
  boxSizing: 'border-box',
}

export default function StackVsConcat() {
  const [fn, setFn] = useState<Fn>('concatenate')
  const [axis, setAxis] = useState(0)
  const [phase, setPhase] = useState<'before' | 'after'>('after')
  const [ref, w] = useContainerWidth<HTMLDivElement>(520)
  const W = Math.max(280, Math.min(620, w))
  const res = compute(fn, axis)
  const before = place(
    [
      { label: 'A  (2, 3)', grid: A },
      { label: 'B  (2, 3)', grid: B },
    ],
    W,
  )
  const after = res.panels ? place(res.panels, W) : before
  const show = phase === 'before' || !res.panels ? before : after
  const H = Math.max(before.H, after.H)

  useEffect(() => {
    if (phase !== 'before') return
    const t = window.setTimeout(() => setPhase('after'), 900)
    return () => window.clearTimeout(t)
  }, [phase])

  const hasAxis = fn === 'concatenate' || fn === 'stack'
  const call = hasAxis ? `np.${fn}([A, B], axis=${axis})` : `np.${fn}([A, B])`

  return (
    <Figure
      title="concatenate versus stack"
      caption={
        <>
          Choose a function and an axis, then press <b>Play</b> to watch A (blue) and B (orange) join. <b>concatenate</b> glues along an axis
          that already exists, so the result keeps ndim 2. <b>stack</b> first creates a new axis and lines A and B up along it, so ndim goes
          up to 3. Compare <code>stack</code> with axis 0, 1 and 2: same numbers, different grouping.
        </>
      }
    >
      <Controls>
        <Segmented
          label="function"
          value={fn}
          onChange={(v) => {
            setFn(v)
            setPhase('after')
          }}
          options={(['concatenate', 'stack', 'vstack', 'hstack'] as Fn[]).map((f) => ({ value: f, label: f }))}
        />
        {hasAxis && (
          <Segmented
            label="axis"
            value={axis}
            onChange={(v) => {
              setAxis(v)
              setPhase('after')
            }}
            options={[0, 1, 2].map((a) => ({ value: a, label: String(a) }))}
          />
        )}
        <Button primary onClick={() => setPhase('before')} disabled={phase === 'before'}>
          Play
        </Button>
      </Controls>
      <pre style={{ ...pre, fontWeight: 700, color: 'var(--accent)' }}>result = {call}</pre>
      <div ref={ref} style={{ width: '100%' }}>
        <div className={css.stage} style={{ height: H, maxWidth: W, margin: '0 auto' }}>
          {show.labels.map((l, i) => (
            <span key={`${phase}-${fn}-${axis}-${i}`} className={css.blockLabel} style={{ left: l.x, top: l.y }}>
              {l.text}
            </span>
          ))}
          {ALL.map((c, k) => {
            const p = show.pos[c.id]
            const col = c.src === 'A' ? 'var(--viz-1)' : 'var(--viz-2)'
            return (
              <div
                key={c.id}
                className={css.cell}
                style={{
                  width: p.s,
                  height: p.s,
                  fontSize: p.s < 32 ? '0.8rem' : '0.95rem',
                  transform: `translate(${p.x}px, ${p.y}px)`,
                  transitionDelay: phase === 'after' ? `${k * 40}ms` : '0ms',
                  background: `color-mix(in srgb, ${col} 22%, var(--surface))`,
                  border: `1.5px solid ${res.error ? 'var(--viz-neg)' : col}`,
                }}
              >
                {c.v}
              </div>
            )
          })}
        </div>
      </div>
      {res.error ? (
        <div style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: 8, background: 'var(--bad-soft)', color: 'var(--bad)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700 }}>
          {res.error}
        </div>
      ) : (
        <Readout
          items={[
            ['A.shape, B.shape', '(2, 3)'],
            ['result.shape', shapeStr(res.shape!)],
            ['ndim', `2 → ${res.shape!.length}`],
          ]}
        />
      )}
      <div style={{ width: '100%', fontSize: '0.9rem', color: 'var(--ink-2)' }}>{res.explain}</div>
      {res.nested && (
        <div style={{ width: '100%' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-3)', marginBottom: '0.2rem' }}>print(result) shows</div>
          <pre style={pre}>{npPrint(res.nested, false)}</pre>
        </div>
      )}
    </Figure>
  )
}
