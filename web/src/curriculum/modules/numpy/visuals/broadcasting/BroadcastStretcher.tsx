import { useEffect, useState, type CSSProperties } from 'react'
import { Figure, Controls, Segmented, Button, useNarrow } from '../../../../../kit'
import { Brackets, cellStyle, mono, OutputBox, shapeText } from '../vectorised-ops-and-axes/Cells'

/*
  The broadcasting rules, made visible. Pick shapes for A and B; the shapes are lined up from the
  right (missing dimensions padded with 1), each pair is checked (equal, or one of them is 1), and
  size-1 dimensions are stretched: dashed "ghost" cells are virtual copies that slide out from the
  real cell. A = arange(size).reshape(shape), B = 10 * (arange(size) + 1).reshape(shape).
*/

type Key = '3x4' | '3x1' | '1x4' | '4' | '3' | 'scalar'
const SHAPES: Record<Key, number[]> = { '3x4': [3, 4], '3x1': [3, 1], '1x4': [1, 4], '4': [4], '3': [3], scalar: [] }
const ORDER: Key[] = ['3x4', '3x1', '1x4', '4', '3', 'scalar']
const OPTIONS: { value: Key; label: string }[] = ORDER.map((k) => ({ value: k, label: k === 'scalar' ? 'scalar' : shapeText(SHAPES[k]) }))

const pad2 = (s: number[]) => [...Array(2 - s.length).fill(1), ...s] as [number, number]

function values(shape: number[], which: 'A' | 'B'): number[][] {
  const [r, c] = pad2(shape)
  if (shape.length === 0) return [[which === 'A' ? 5 : 100]]
  return Array.from({ length: r }, (_, i) => Array.from({ length: c }, (_, j) => (which === 'A' ? i * c + j : 10 * (i * c + j + 1))))
}

type DimStatus = { a: number; b: number; padA: boolean; padB: boolean; ok: boolean; out: number; why: string }

function check(sa: number[], sb: number[]) {
  const n = Math.max(sa.length, sb.length)
  const dims: DimStatus[] = []
  for (let k = 0; k < n; k++) {
    // k counts from the left of the padded shapes
    const ia = k - (n - sa.length)
    const ib = k - (n - sb.length)
    const a = ia >= 0 ? sa[ia] : 1
    const b = ib >= 0 ? sb[ib] : 1
    const ok = a === b || a === 1 || b === 1
    const why = !ok ? `${a} ≠ ${b}` : a === b ? (a === 1 ? 'both 1' : 'equal') : a === 1 ? 'A’s 1 stretches' : 'B’s 1 stretches'
    dims.push({ a, b, padA: ia < 0, padB: ib < 0, ok, out: Math.max(a, b), why })
  }
  return { dims, ok: dims.every((d) => d.ok), out: dims.map((d) => d.out) }
}

/** One input drawn at the result size: real cells solid, stretched copies dashed (and sliding out). */
function Stretched({ data, out, size, gap, phase, colour }: { data: number[][]; out: [number, number]; size: number; gap: number; phase: 'start' | 'move' | 'done'; colour: 'a' | 'b' }) {
  const r0 = data.length
  const c0 = data[0].length
  const [R, C] = out
  return (
    <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${C}, ${size}px)`, gap }}>
      {Array.from({ length: R }, (_, i) =>
        Array.from({ length: C }, (_, j) => {
          const si = r0 === 1 ? 0 : i
          const sj = c0 === 1 ? 0 : j
          const real = si === i && sj === j
          const dx = (sj - j) * (size + gap)
          const dy = (si - i) * (size + gap)
          const st: CSSProperties = real
            ? cellStyle(colour, size)
            : {
                ...cellStyle('ghost', size),
                borderColor: `color-mix(in srgb, ${colour === 'a' ? 'var(--viz-1)' : 'var(--viz-2)'} 70%, transparent)`,
                background: `color-mix(in srgb, ${colour === 'a' ? 'var(--viz-1)' : 'var(--viz-2)'} 6%, transparent)`,
                transform: phase === 'start' ? `translate(${dx}px, ${dy}px)` : 'translate(0, 0)',
                opacity: phase === 'start' ? 0 : 1,
                transition: phase === 'move' ? `transform 0.6s cubic-bezier(.4,0,.2,1) ${(Math.abs(i - si) + Math.abs(j - sj)) * 90}ms, opacity 0.3s ease ${(Math.abs(i - si) + Math.abs(j - sj)) * 90}ms` : 'none',
              }
          return (
            <div key={`${i}-${j}`} role="cell" aria-label={real ? `stored value ${data[si][sj]}` : `virtual copy of ${data[si][sj]}`} style={{ ...st, zIndex: real ? 1 : 0 }}>
              {data[si][sj]}
            </div>
          )
        }),
      )}
    </div>
  )
}

export default function BroadcastStretcher() {
  const [ka, setKa] = useState<Key>('3x1')
  const [kb, setKb] = useState<Key>('1x4')
  const [phase, setPhase] = useState<'start' | 'move' | 'done'>('done')
  const [run, setRun] = useState(0)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(540)
  const sa = SHAPES[ka]
  const sb = SHAPES[kb]
  const A = values(sa, 'A')
  const B = values(sb, 'B')
  const res = check(sa, sb)
  const out2 = pad2(res.out)
  const size = narrow ? 30 : 38
  const gap = narrow ? 3 : 4

  useEffect(() => {
    if (run === 0) return
    setPhase('start')
    let r2 = 0
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setPhase('move'))
    })
    const t = window.setTimeout(() => setPhase('done'), 1600)
    return () => {
      cancelAnimationFrame(r1)
      cancelAnimationFrame(r2)
      window.clearTimeout(t)
    }
  }, [run])
  const replay = () => setRun((n) => n + 1)

  const sum: number[][] = res.ok
    ? Array.from({ length: out2[0] }, (_, i) =>
        Array.from({ length: out2[1] }, (_, j) => A[A.length === 1 ? 0 : i][A[0].length === 1 ? 0 : j] + B[B.length === 1 ? 0 : i][B[0].length === 1 ? 0 : j]),
      )
    : []

  const nd = res.dims.length
  const th: CSSProperties = { ...mono, fontSize: '0.95rem', fontWeight: 700, textAlign: 'center', padding: '0.15rem 0.5rem' }
  const rowLab: CSSProperties = { fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'right', paddingRight: '0.5rem', whiteSpace: 'nowrap' }
  const npShape = (s: number[]) => (s.length === 0 ? '()' : s.length === 1 ? `(${s[0]},)` : `(${s.join(',')})`)

  const panelLabel = (t: string, colour: string) => <div style={{ fontSize: '0.85rem', fontWeight: 700, color: colour, whiteSpace: 'nowrap', textAlign: 'center' }}>{t}</div>
  const opSym: CSSProperties = { ...mono, fontSize: '1.3rem', fontWeight: 700, color: 'var(--ink-2)', alignSelf: 'center' }

  return (
    <Figure
      title="Broadcasting: line up from the right, stretch the 1s"
      caption={
        <>
          Choose shapes for A and B. The table lines the shapes up <b>from the right</b>, filling missing dimensions with 1 (shown in brackets). In
          every column the two sizes must be <b>equal</b>, or one of them must be <b>1</b>; a 1 is then stretched to match. The dashed cells are not
          stored anywhere: NumPy only <em>pretends</em> the copies exist. Try <code>(3, 1)</code> with <code>(3,)</code>: it works, but gives a{' '}
          <code>(3, 3)</code> grid, which is rarely what you wanted.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center', gap: '0.85rem' }}>
        <Controls>
          <Segmented label="Shape of A" value={ka} onChange={(v) => (setKa(v), replay())} options={OPTIONS} />
          <Segmented label="Shape of B" value={kb} onChange={(v) => (setKb(v), replay())} options={OPTIONS} />
        </Controls>

        {/* the alignment table */}
        <div role="table" aria-label="Shapes lined up from the right" style={{ display: 'grid', gridTemplateColumns: `auto repeat(${Math.max(nd, 1)}, minmax(4.6rem, auto))`, alignItems: 'center', rowGap: 4, columnGap: 8 }}>
          <div />
          {nd === 0 ? (
            <div style={{ ...th, fontSize: '0.75rem', color: 'var(--ink-3)' }}>no axes</div>
          ) : (
            res.dims.map((_, k) => (
              <div key={`h${k}`} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink-3)', textAlign: 'center' }}>
                axis {k - nd}
              </div>
            ))
          )}
          <div style={rowLab}>
            A <span style={{ ...mono, fontWeight: 500 }}>{shapeText(sa)}</span>
          </div>
          {nd === 0 ? <div style={th}>·</div> : res.dims.map((d, k) => <div key={`a${k}`} style={{ ...th, color: d.padA ? 'var(--ink-3)' : 'var(--viz-1)' }}>{d.padA ? `(${d.a})` : d.a}</div>)}
          <div style={rowLab}>
            B <span style={{ ...mono, fontWeight: 500 }}>{shapeText(sb)}</span>
          </div>
          {nd === 0 ? <div style={th}>·</div> : res.dims.map((d, k) => <div key={`b${k}`} style={{ ...th, color: d.padB ? 'var(--ink-3)' : 'var(--viz-2-ink)' }}>{d.padB ? `(${d.b})` : d.b}</div>)}
          <div style={{ ...rowLab, borderTop: '1.5px solid var(--rule)', paddingTop: 4 }}>check</div>
          {nd === 0 ? (
            <div style={{ ...th, borderTop: '1.5px solid var(--rule)', color: 'var(--viz-pos-ink)', fontSize: '0.8rem' }}>✓</div>
          ) : (
            res.dims.map((d, k) => (
              <div key={`c${k}`} style={{ borderTop: '1.5px solid var(--rule)', paddingTop: 4, textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: d.ok ? 'var(--viz-pos-ink)' : 'var(--viz-neg)' }}>
                {d.ok ? '✓' : '✗'} {d.why}
              </div>
            ))
          )}
          <div style={rowLab}>result</div>
          {nd === 0 ? (
            <div style={{ ...th, color: 'var(--viz-3-ink)' }}>()</div>
          ) : (
            res.dims.map((d, k) => (
              <div key={`r${k}`} style={{ ...th, color: d.ok ? 'var(--viz-3-ink)' : 'var(--viz-neg)' }}>
                {d.ok ? d.out : '?'}
              </div>
            ))
          )}
        </div>

        {/* the stretched pictures */}
        {res.ok ? (
          <div style={{ display: 'flex', flexDirection: narrow ? 'column' : 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: narrow ? '0.15rem' : '0.5rem 0.6rem' }}>
            <div style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
              {panelLabel(`A ${shapeText(sa)} stretched`, 'var(--viz-1)')}
              <Brackets>
                <Stretched data={A} out={out2} size={size} gap={gap} phase={phase} colour="a" />
              </Brackets>
            </div>
            <span style={opSym} aria-hidden="true">
              +
            </span>
            <div style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
              {panelLabel(`B ${shapeText(sb)} stretched`, 'var(--viz-2-ink)')}
              <Brackets>
                <Stretched data={B} out={out2} size={size} gap={gap} phase={phase} colour="b" />
              </Brackets>
            </div>
            <span style={opSym} aria-hidden="true">
              =
            </span>
            <div style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
              {panelLabel(`A + B ${shapeText(res.out)}`, 'var(--viz-3-ink)')}
              <Brackets>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${out2[1]}, ${size}px)`, gap }}>
                  {sum.flatMap((row, i) =>
                    row.map((v, j) => (
                      <div
                        key={`${i}-${j}`}
                        role="cell"
                        style={{ ...cellStyle('c', size), opacity: phase === 'start' ? 0 : 1, transition: phase === 'move' ? 'opacity 0.35s ease 0.75s' : 'none' }}
                      >
                        {v}
                      </div>
                    )),
                  )}
                </div>
              </Brackets>
            </div>
          </div>
        ) : (
          <OutputBox tone="bad" label="A + B">
            {`ValueError: operands could not be broadcast together with shapes ${npShape(sa)} ${npShape(sb)}`}
          </OutputBox>
        )}
        <Button onClick={replay}>Replay the stretch</Button>
      </div>
    </Figure>
  )
}
