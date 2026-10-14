import { useEffect, useRef, useState } from 'react'
import { Figure, Controls, Readout, Toggle, Button, useContainerWidth } from '../../../../../kit'
import s from './mm.module.css'

/*
  Matrix shapes as dominoes. A (m×n) can be multiplied by B (n×p) only when the touching
  halves match; the result keeps the two outer halves (m×p). Below, a block picture shows
  why: each entry of AB pairs the n numbers in a row of A with the n numbers in a column of B.
*/

type Dims = [number, number]
type HalfTone = 'ok' | 'bad' | 'outer' | undefined
const MIN = 1
const MAX = 6

const HALF_BG: Record<Exclude<HalfTone, undefined>, string> = {
  ok: 'color-mix(in srgb, var(--viz-pos) 22%, var(--surface))',
  bad: 'color-mix(in srgb, var(--viz-neg) 22%, var(--surface))',
  outer: 'color-mix(in srgb, var(--viz-1) 14%, var(--surface))',
}

function reducedMotion() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

function Domino({
  name,
  dims,
  setDims,
  tones,
  caption,
}: {
  name: string
  dims: Dims
  setDims?: (d: Dims) => void
  tones: [HalfTone, HalfTone]
  caption: string
}) {
  const half = (k: 0 | 1) => {
    const v = dims[k]
    const what = k === 0 ? 'rows' : 'columns'
    const set = (nv: number) => {
      if (!setDims) return
      const d: Dims = [dims[0], dims[1]]
      d[k] = nv
      setDims(d)
    }
    return (
      <div className={s.half} style={{ background: tones[k] ? HALF_BG[tones[k]!] : undefined, minHeight: 72 }}>
        {setDims && (
          <button type="button" className={s.step} disabled={v >= MAX} onClick={() => set(v + 1)} aria-label={`${name}: more ${what}`}>
            ▲
          </button>
        )}
        <span className={s.halfNum} aria-label={`${name} has ${v} ${what}`}>
          {v}
        </span>
        {setDims && (
          <button type="button" className={s.step} disabled={v <= MIN} onClick={() => set(v - 1)} aria-label={`${name}: fewer ${what}`}>
            ▼
          </button>
        )}
      </div>
    )
  }
  return (
    <div className={s.dominoUnit}>
      <div className={s.domino}>
        {half(0)}
        {half(1)}
      </div>
      <div className={s.dominoCaption}>{caption}</div>
    </div>
  )
}

function Joint({ ok }: { ok: boolean }) {
  return (
    <div className={`${s.joint} ${ok ? s.jointOk : s.jointBad}`} aria-label={ok ? 'inner sizes match' : 'inner sizes do not match'}>
      {ok ? '' : '≠'}
    </div>
  )
}

/** The block picture: A bottom-left, B top-right, AB where A's rows meet B's columns. */
function BlockPicture({ m, n, n2, p, sel, setSel }: { m: number; n: number; n2: number; p: number; sel: [number, number]; setSel: (v: [number, number]) => void }) {
  const [ref, W] = useContainerWidth<HTMLDivElement>(420)
  const fits = n === n2
  const padL = 18
  const g = 14
  const avail = Math.min(W, 460) - padL - g - 24
  const cs = Math.max(14, Math.min(34, Math.floor(avail / (n + p))))
  const padT = 26
  const xL = padL
  const xR = xL + n * cs + g
  const yT = padT
  const yB = yT + n2 * cs + g
  const width = xR + p * cs + 24
  const height = yB + m * cs + 30
  const [si, sj] = [Math.min(sel[0], m - 1), Math.min(sel[1], p - 1)]
  const pairs = Math.min(n, n2)
  const inset = 1.5
  const fs = cs >= 20 ? 12 : 10

  const cellRect = (x: number, y: number, fill: string, stroke: string, sw = 1.2) => (
    <rect x={x + inset} y={y + inset} width={cs - 2 * inset} height={cs - 2 * inset} rx={4} style={{ fill, stroke, strokeWidth: sw }} />
  )
  const tint = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, var(--surface))`

  return (
    <div ref={ref} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} style={{ maxWidth: '100%', height: 'auto' }} role="img" aria-label={`Block picture: A is ${m} by ${n}, B is ${n2} by ${p}${fits ? `, so AB is ${m} by ${p}` : ', so AB does not exist'}`}>
        {/* A: m × n, bottom-left */}
        {Array.from({ length: m }, (_, i) =>
          Array.from({ length: n }, (_, j) => {
            const inRow = i === si
            const bad = inRow && j >= pairs
            return (
              <g key={`a${i}-${j}`}>
                {cellRect(xL + j * cs, yB + i * cs, inRow ? tint(bad ? 'var(--viz-neg)' : 'var(--viz-1)', 34) : tint('var(--viz-1)', 10), inRow ? (bad ? 'var(--viz-neg)' : 'var(--viz-1)') : tint('var(--viz-1)', 40))}
                {inRow && (
                  <text x={xL + j * cs + cs / 2} y={yB + i * cs + cs / 2} dy="0.35em" textAnchor="middle" className={s.monoText} style={{ fontSize: fs, fontWeight: 700, fill: bad ? 'var(--viz-neg)' : 'var(--viz-ink)' }}>
                    {j + 1}
                  </text>
                )}
              </g>
            )
          }),
        )}
        {/* B: n2 × p, top-right */}
        {Array.from({ length: n2 }, (_, i) =>
          Array.from({ length: p }, (_, j) => {
            const inCol = j === sj
            const bad = inCol && i >= pairs
            return (
              <g key={`b${i}-${j}`}>
                {cellRect(xR + j * cs, yT + i * cs, inCol ? tint(bad ? 'var(--viz-neg)' : 'var(--viz-2)', 34) : tint('var(--viz-2)', 10), inCol ? (bad ? 'var(--viz-neg)' : 'var(--viz-2)') : tint('var(--viz-2)', 40))}
                {inCol && (
                  <text x={xR + j * cs + cs / 2} y={yT + i * cs + cs / 2} dy="0.35em" textAnchor="middle" className={s.monoText} style={{ fontSize: fs, fontWeight: 700, fill: bad ? 'var(--viz-neg)' : 'var(--viz-ink)' }}>
                    {i + 1}
                  </text>
                )}
              </g>
            )
          }),
        )}
        {/* AB: m × p, or an empty dashed slot when it does not exist */}
        {fits ? (
          Array.from({ length: m }, (_, i) =>
            Array.from({ length: p }, (_, j) => {
              const on = i === si && j === sj
              return (
                <g key={`c${i}-${j}`} role="button" tabIndex={0} aria-label={`select entry row ${i + 1}, column ${j + 1} of AB`} style={{ cursor: 'pointer' }} onClick={() => setSel([i, j])} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSel([i, j]))}>
                  {cellRect(xR + j * cs, yB + i * cs, on ? tint('var(--viz-3)', 45) : tint('var(--viz-3)', 12), on ? 'var(--viz-3)' : tint('var(--viz-3)', 45), on ? 2.2 : 1.2)}
                  {on && (
                    <text x={xR + j * cs + cs / 2} y={yB + i * cs + cs / 2} dy="0.35em" textAnchor="middle" style={{ fontSize: fs + 1, fontWeight: 800, fill: 'var(--viz-ink)' }}>
                      Σ
                    </text>
                  )}
                </g>
              )
            }),
          )
        ) : (
          <g>
            <rect x={xR + inset} y={yB + inset} width={p * cs - 2 * inset} height={m * cs - 2 * inset} rx={5} style={{ fill: 'none', stroke: 'var(--viz-neg)', strokeWidth: 1.5, strokeDasharray: '5 4' }} />
            <text x={xR + (p * cs) / 2} y={yB + (m * cs) / 2} dy="0.35em" textAnchor="middle" style={{ fontSize: 12, fontWeight: 700, fill: 'var(--viz-neg)' }}>
              ✗
            </text>
          </g>
        )}
        {/* light guide lines: the selected row of A runs right into AB, the selected column of B runs down into AB */}
        {fits && (
          <>
            <line x1={xL + n * cs} x2={xR} y1={yB + si * cs + cs / 2} y2={yB + si * cs + cs / 2} style={{ stroke: 'var(--viz-1)', strokeWidth: 1.5, strokeDasharray: '3 3' }} />
            <line x1={xR + sj * cs + cs / 2} x2={xR + sj * cs + cs / 2} y1={yT + n2 * cs} y2={yB} style={{ stroke: 'var(--viz-2)', strokeWidth: 1.5, strokeDasharray: '3 3' }} />
          </>
        )}
        {/* names */}
        <text x={xL + (n * cs) / 2} y={yB + m * cs + 18} textAnchor="middle" className={s.svgText} style={{ fontSize: 12.5, fontWeight: 700, fill: 'var(--viz-1)' }}>
          A ({m}×{n})
        </text>
        <text x={xR + (p * cs) / 2} y={yT - 9} textAnchor="middle" className={s.svgText} style={{ fontSize: 12.5, fontWeight: 700, fill: 'var(--viz-2)' }}>
          B ({n2}×{p})
        </text>
        <text x={xR + (p * cs) / 2} y={yB + m * cs + 18} textAnchor="middle" className={s.svgText} style={{ fontSize: 12.5, fontWeight: 700, fill: fits ? 'var(--viz-3)' : 'var(--viz-neg)' }}>
          {fits ? `AB (${m}×${p})` : 'AB: none'}
        </text>
      </svg>
    </div>
  )
}

export default function ShapeDominoes() {
  const [a, setA] = useState<Dims>([3, 2])
  const [b, setB] = useState<Dims>([2, 4])
  const [c, setC] = useState<Dims>([4, 2])
  const [chain, setChain] = useState(false)
  const [sel, setSel] = useState<[number, number]>([0, 0])
  const rowRef = useRef<HTMLDivElement>(null)
  const resRef = useRef<HTMLDivElement>(null)

  const ok1 = a[1] === b[0]
  const ok2 = !chain || b[1] === c[0]
  const allOk = ok1 && ok2
  const out: Dims = chain ? [a[0], c[1]] : [a[0], b[1]]
  const key = `${a}|${b}|${c}|${chain}`

  // shake on a mismatch, pop the result on a match (Web Animations API: no remounting, so focus stays on the button you pressed)
  useEffect(() => {
    if (reducedMotion()) return
    if (!allOk) {
      rowRef.current?.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }],
        { duration: 380, easing: 'ease-in-out' },
      )
    } else {
      resRef.current?.animate([{ transform: 'scale(0.75)', opacity: 0.2 }, { transform: 'scale(1)', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.3,1.6,.5,1)' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const preset = (pa: Dims, pb: Dims) => {
    setChain(false)
    setA(pa)
    setB(pb)
    setSel([0, 0])
  }

  // the error PyTorch prints for A @ B (@ C), evaluated left to right
  const err = !ok1
    ? `RuntimeError: mat1 and mat2 shapes cannot be multiplied (${a[0]}x${a[1]} and ${b[0]}x${b[1]})`
    : !ok2
      ? `RuntimeError: mat1 and mat2 shapes cannot be multiplied (${a[0]}x${b[1]} and ${c[0]}x${c[1]})`
      : ''

  const tonesA: [HalfTone, HalfTone] = ['outer', ok1 ? 'ok' : 'bad']
  const tonesB: [HalfTone, HalfTone] = chain ? [ok1 ? 'ok' : 'bad', ok2 ? 'ok' : 'bad'] : [ok1 ? 'ok' : 'bad', 'outer']
  const tonesC: [HalfTone, HalfTone] = [ok2 ? 'ok' : 'bad', 'outer']

  const inner = (v: number, good: boolean) => <span className={good ? s.outNum : s.badNum}>{v}</span>

  return (
    <Figure
      title="Shape dominoes: which matrices fit together?"
      caption={
        <>
          Press ▲ and ▼ to change the shapes. The touching halves (the <b>inner</b> numbers) must be equal, like domino ends; the result keeps the two{' '}
          <b>outer</b> numbers. In the block picture, tap a green cell of AB: its row of A and its column of B light up, and their numbered entries pair up
          1-with-1, 2-with-2. Make the inner numbers differ and watch an entry lose its partner. Then try a chain of three.
        </>
      }
    >
      <div ref={rowRef} className={s.dominoRow}>
        <Domino name="A" dims={a} setDims={setA} tones={tonesA} caption="A" />
        <Joint ok={ok1} />
        <Domino name="B" dims={b} setDims={setB} tones={tonesB} caption="B" />
        {chain && (
          <>
            <Joint ok={b[1] === c[0]} />
            <Domino name="C" dims={c} setDims={setC} tones={tonesC} caption="C" />
          </>
        )}
        <div className={s.equals} aria-hidden="true">
          =
        </div>
        <div ref={resRef}>
          {allOk ? (
            <Domino name="result" dims={out} tones={['outer', 'outer']} caption={chain ? 'ABC' : 'AB'} />
          ) : (
            <div className={s.dominoUnit}>
              <div className={s.domino} style={{ borderStyle: 'dashed', borderColor: 'var(--viz-neg)' }}>
                <div className={s.half} style={{ minHeight: 72 }}>
                  <span className={s.halfNum} style={{ color: 'var(--viz-neg)' }}>
                    ✗
                  </span>
                </div>
              </div>
              <div className={s.dominoCaption}>no result</div>
            </div>
          )}
        </div>
      </div>

      <div className={s.rule} aria-live="polite">
        ({a[0]}×{inner(a[1], ok1)})({inner(b[0], ok1)}×{chain ? inner(b[1], ok2) : b[1]}){chain && <>({inner(c[0], ok2)}×{c[1]})</>} →{' '}
        {allOk ? (
          <span className={s.outNum}>
            {out[0]}×{out[1]}
          </span>
        ) : (
          <span className={s.badNum}>not defined</span>
        )}
      </div>

      {err ? (
        <>
          <div className={s.warn}>
            {!ok1 ? (
              <>
                A row of A has {a[1]} number{a[1] > 1 ? 's' : ''} but a column of B has {b[0]}, so they cannot be paired off one-to-one and AB is not
                defined. PyTorch stops with:
              </>
            ) : (
              <>
                AB is fine ({a[0]}×{b[1]}), but it has {b[1]} column{b[1] > 1 ? 's' : ''} while C has {c[0]} row{c[0] > 1 ? 's' : ''}, so (AB)C is not
                defined. PyTorch stops with:
              </>
            )}
          </div>
          <div className={s.errorBox} role="status">
            {err}
          </div>
        </>
      ) : chain ? (
        <div className={s.okBox}>
          Work left to right: AB is {a[0]}×{b[1]}, then (AB)C is ({a[0]}×{b[1]})({c[0]}×{c[1]}) = {a[0]}×{c[1]}. Every inner pair cancels and only the very first
          and very last numbers survive.
        </div>
      ) : (
        <div className={s.okBox}>
          Each entry of AB pairs the {a[1]} numbers in a row of A with the {b[0]} numbers in a column of B, multiplies each pair and adds. The inner size {a[1]}{' '}
          is used up by that adding, which is why it disappears from the answer.
        </div>
      )}

      {!chain && <BlockPicture m={a[0]} n={a[1]} n2={b[0]} p={b[1]} sel={sel} setSel={setSel} />}

      <Controls>
        <Toggle label="Chain of three (A·B·C)" checked={chain} onChange={setChain} />
        <Button onClick={() => preset([3, 2], [2, 4])}>3×2 · 2×4</Button>
        <Button onClick={() => preset([3, 2], [3, 4])}>3×2 · 3×4</Button>
        <Button onClick={() => preset([1, 3], [3, 1])}>row · column</Button>
        <Button onClick={() => preset([3, 1], [1, 3])}>column · row</Button>
        {!chain && (
          <Readout
            items={[
              ['AB shape', ok1 ? `${a[0]}×${b[1]}` : '—'],
              ['multiplications', ok1 ? `${a[0]}×${a[1]}×${b[1]} = ${a[0] * a[1] * b[1]}` : '—'],
            ]}
          />
        )}
      </Controls>
    </Figure>
  )
}
