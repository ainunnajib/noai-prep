import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Button } from '../../../../../kit'

/*
  a = np.arange(12).reshape(3, 4). Choose how b is made, then click cells of b (or a) to add 100.
  Views are modelled exactly as NumPy stores them (offset + strides into a's memory), so an edit
  through a view lands in a's memory; copies get their own memory at the moment they are made.
*/

interface ViewDef {
  kind: 'view'
  offset: number
  shape: number[]
  strides: number[] // in elements
}
interface CopyDef {
  kind: 'copy'
  src: (a: number[]) => number[] // flat indices of a that are copied, in order
  shape: (n: number) => number[]
}
interface Opt {
  code: string
  what: string
  def: ViewDef | CopyDef
}

const OPTS: Opt[] = [
  { code: 'b = a[1]', what: 'an integer index (basic indexing) gives a view', def: { kind: 'view', offset: 4, shape: [4], strides: [1] } },
  { code: 'b = a[:, 2]', what: 'a basic slice gives a view, even of a column', def: { kind: 'view', offset: 2, shape: [3], strides: [4] } },
  { code: 'b = a[0:2, 1:3]', what: 'a basic slice gives a view', def: { kind: 'view', offset: 1, shape: [2, 2], strides: [4, 1] } },
  { code: 'b = a.T', what: 'the transpose is a view with the strides swapped', def: { kind: 'view', offset: 0, shape: [4, 3], strides: [1, 4] } },
  { code: 'b = a.reshape(2, 6)', what: 'reshape gives a view whenever it can', def: { kind: 'view', offset: 0, shape: [2, 6], strides: [6, 1] } },
  {
    code: 'b = a[[0, 2]]',
    what: 'fancy indexing (a list of indices) always copies',
    def: { kind: 'copy', src: () => [0, 1, 2, 3, 8, 9, 10, 11], shape: () => [2, 4] },
  },
  {
    code: 'b = a[a > 6]',
    what: 'a boolean mask always copies',
    def: { kind: 'copy', src: (a) => a.map((v, i) => (v > 6 ? i : -1)).filter((i) => i >= 0), shape: (n) => [n] },
  },
  { code: 'b = a[1].copy()', what: '.copy() makes an independent copy on purpose', def: { kind: 'copy', src: () => [4, 5, 6, 7], shape: () => [4] } },
]

const INIT = Array.from({ length: 12 }, (_, i) => i)

function Chain({ linked }: { linked: boolean }) {
  const c = linked ? 'var(--viz-pos)' : 'var(--viz-neg)'
  return (
    <svg width="64" height="30" viewBox="0 0 64 30" aria-hidden="true">
      {linked ? (
        <>
          <rect x="4" y="8" width="30" height="14" rx="7" style={{ fill: 'none', stroke: c, strokeWidth: 3 }} />
          <rect x="30" y="8" width="30" height="14" rx="7" style={{ fill: 'none', stroke: c, strokeWidth: 3 }} />
        </>
      ) : (
        <>
          <rect x="2" y="8" width="24" height="14" rx="7" style={{ fill: 'none', stroke: c, strokeWidth: 3 }} />
          <rect x="38" y="8" width="24" height="14" rx="7" style={{ fill: 'none', stroke: c, strokeWidth: 3 }} />
          <path d="M28,4 L36,26" style={{ stroke: c, strokeWidth: 2.5 }} />
        </>
      )}
    </svg>
  )
}

const cellStyle = (size: number): CSSProperties => ({
  height: size,
  display: 'grid',
  placeItems: 'center',
  borderRadius: 6,
  fontFamily: 'var(--font-mono)',
  fontSize: '0.85rem',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'background 0.25s ease, border-color 0.25s ease',
})

export default function ViewCopyLink() {
  const [opt, setOpt] = useState(0)
  const [bufA, setBufA] = useState(INIT)
  const [bufB, setBufB] = useState<number[]>([])
  const [srcIdx, setSrcIdx] = useState<number[]>([])
  const [flash, setFlash] = useState<{ buf: 'A' | 'B'; idx: number } | null>(null)
  const [last, setLast] = useState<string | null>(null)
  const o = OPTS[opt]
  const d = o.def

  const choose = (i: number) => {
    setOpt(i)
    setBufA(INIT)
    const def = OPTS[i].def
    if (def.kind === 'copy') {
      const src = def.src(INIT)
      setSrcIdx(src)
      setBufB(src.map((k) => INIT[k]))
    } else {
      setSrcIdx([])
      setBufB([])
    }
    setFlash(null)
    setLast(null)
  }

  // b as a list of cells: each knows which buffer slot it reads
  const bShape = d.kind === 'view' ? d.shape : d.shape(bufB.length)
  const bRows = bShape.length === 1 ? 1 : bShape[0]
  const bCols = bShape.length === 1 ? bShape[0] : bShape[1]
  const bSlot = (i: number, j: number): { buf: 'A' | 'B'; idx: number } => {
    if (d.kind === 'view') {
      const idx = bShape.length === 1 ? d.offset + j * d.strides[0] : d.offset + i * d.strides[0] + j * d.strides[1]
      return { buf: 'A', idx }
    }
    return { buf: 'B', idx: i * bCols + j }
  }
  const covered = new Set<number>()
  if (d.kind === 'view') for (let i = 0; i < bRows; i++) for (let j = 0; j < bCols; j++) covered.add(bSlot(i, j).idx)

  const bump = (buf: 'A' | 'B', idx: number, label: string) => {
    if (buf === 'A') setBufA((b) => b.map((v, k) => (k === idx ? v + 100 : v)))
    else setBufB((b) => b.map((v, k) => (k === idx ? v + 100 : v)))
    setFlash({ buf, idx })
    setLast(label)
  }

  const isFlash = (buf: 'A' | 'B', idx: number) => flash != null && flash.buf === buf && flash.idx === idx
  const size = 40
  const view = d.kind === 'view'
  const aChanged = bufA.some((v, i) => v !== INIT[i])
  const sharedEdit = view && flash != null

  const idxText = (i: number, j: number) => (bShape.length === 1 ? `${j}` : `${i}, ${j}`)

  return (
    <Figure
      title="View or copy? Edit b and watch a"
      caption={
        <>
          Pick how <code>b</code> is made from <code>a</code>, then click any cell of <code>b</code> to add 100 to it. With a <b>view</b> the
          change also appears in <code>a</code>, because both read the same memory (green chain). With a <b>copy</b> the chain is broken and{' '}
          <code>a</code> stays the same. You can click cells of <code>a</code> too.
        </>
      }
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', width: '100%' }}>
        {OPTS.map((x, i) => (
          <button
            key={x.code}
            type="button"
            onClick={() => choose(i)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              padding: '0.25rem 0.55rem',
              borderRadius: 999,
              border: `1.5px solid ${i === opt ? 'var(--accent)' : 'var(--rule)'}`,
              background: i === opt ? 'var(--accent-soft)' : 'var(--surface)',
              color: i === opt ? 'var(--accent)' : 'var(--ink-2)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {x.code}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.75rem 1.25rem', width: '100%' }}>
        <div style={{ display: 'grid', gap: '0.3rem', justifyItems: 'center' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>a  (3, 4)</div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(4, ${size}px)`, gap: 3 }}>
            {bufA.map((v, k) => {
              const inView = covered.has(k)
              const copied = !view && srcIdx.includes(k)
              const fl = isFlash('A', k)
              return (
                <button
                  key={k}
                  type="button"
                  aria-label={`a[${Math.floor(k / 4)}, ${k % 4}] = ${v}. Click to add 100`}
                  onClick={() => bump('A', k, `a[${Math.floor(k / 4)}, ${k % 4}] += 100`)}
                  style={{
                    ...cellStyle(size),
                    fontSize: v >= 100 ? '0.75rem' : '0.85rem',
                    color: 'var(--ink)',
                    background: fl ? 'color-mix(in srgb, var(--viz-2) 40%, var(--surface))' : inView ? 'color-mix(in srgb, var(--viz-1) 22%, var(--surface))' : 'var(--surface-2)',
                    border: `1.5px ${copied ? 'dashed' : 'solid'} ${fl ? 'var(--viz-2)' : inView ? 'var(--viz-1)' : copied ? 'var(--viz-6)' : 'transparent'}`,
                  }}
                >
                  {v}
                </button>
              )
            })}
          </div>
        </div>
        <div style={{ display: 'grid', justifyItems: 'center', gap: '0.15rem', minWidth: 90 }}>
          <Chain linked={view} />
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: view ? 'var(--viz-pos)' : 'var(--viz-neg)' }}>{view ? 'VIEW: same memory' : 'COPY: own memory'}</div>
        </div>
        <div style={{ display: 'grid', gap: '0.3rem', justifyItems: 'center' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>
            b  ({bShape.join(', ')}
            {bShape.length === 1 ? ',' : ''})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${bCols}, ${size}px)`, gap: 3 }}>
            {Array.from({ length: bRows }, (_, i) =>
              Array.from({ length: bCols }, (_, j) => {
                const s = bSlot(i, j)
                const v = s.buf === 'A' ? bufA[s.idx] : bufB[s.idx]
                const fl = isFlash(s.buf, s.idx)
                return (
                  <button
                    key={`${i}-${j}`}
                    type="button"
                    aria-label={`b[${idxText(i, j)}] = ${v}. Click to add 100`}
                    onClick={() => bump(s.buf, s.idx, `b[${idxText(i, j)}] += 100`)}
                    style={{
                      ...cellStyle(size),
                      fontSize: v >= 100 ? '0.75rem' : '0.85rem',
                      color: 'var(--ink)',
                      background: fl ? 'color-mix(in srgb, var(--viz-2) 40%, var(--surface))' : view ? 'color-mix(in srgb, var(--viz-1) 22%, var(--surface))' : 'color-mix(in srgb, var(--viz-6) 16%, var(--surface))',
                      border: `1.5px solid ${fl ? 'var(--viz-2)' : view ? 'var(--viz-1)' : 'var(--viz-6)'}`,
                    }}
                  >
                    {v}
                  </button>
                )
              }),
            )}
          </div>
        </div>
      </div>
      <pre
        style={{
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
        }}
      >
        {`a = np.arange(12).reshape(3, 4)\n${o.code}${' '.repeat(Math.max(1, 20 - o.code.length))}# ${view ? 'view' : 'copy'}${last ? `\n${last}` : ''}`}
      </pre>
      <Readout items={[['np.shares_memory(a, b)', view ? 'True' : 'False']]} />
      <div style={{ width: '100%', fontSize: '0.875rem', color: 'var(--ink-2)' }}>
        Why: <code>{o.code.replace('b = ', '')}</code>: {o.what}.
      </div>
      <div style={{ width: '100%', fontSize: '0.9rem', fontWeight: 600, minHeight: '1.4em', color: last == null ? 'var(--ink-3)' : sharedEdit ? 'var(--viz-2)' : 'var(--ink-2)' }} aria-live="polite">
        {last == null
          ? 'Click a cell of b to change it.'
          : last.startsWith('b')
            ? view
              ? 'b is a window onto a, so a changed too.'
              : aChanged
                ? 'b changed; a only changed where you clicked it directly.'
                : 'Only b changed: a is untouched, because b is a copy.'
            : view && covered.has(flash?.idx ?? -1)
              ? 'You changed a, and b shows the change too, because b is a view of that memory.'
              : view
                ? 'You changed a cell of a that b does not include.'
                : 'You changed a; b is a copy made earlier, so it does not notice.'}
      </div>
      <Controls>
        <Button onClick={() => choose(opt)}>Reset</Button>
      </Controls>
    </Figure>
  )
}
