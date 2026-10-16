import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Segmented, Readout, M, mulberry32, useNarrow } from '../../../../../kit'
import s from './lora.module.css'

/*
  Part 1: an outer product u vᵀ is a times table. Every row is v scaled by one entry of u,
  so the whole matrix holds only one pattern: rank 1.
  Part 2: a rank-r matrix is a sum of r such tables. We rebuild 12 × 12 pictures from their best
  r rank-1 layers (the truncated SVD, computed here with the Jacobi eigenvalue method on MᵀM).
*/

const N = 12
const VMIN = -3
const VMAX = 3

// ---------- target pictures (values 0..1) ----------
function makeTargets(): Record<string, number[][]> {
  const h = [1, 1, 0, 0, 0.5, 0, 0, 1, 1, 0, 0.5, 0]
  const tartan = h.map((a) => h.map((b) => (a + b) / 2))
  const plus = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (i >= 4 && i < 8) || (j >= 4 && j < 8) ? 1 : 0))
  const heartRows = [
    '............',
    '..##....##..',
    '.####..####.',
    '############',
    '############',
    '############',
    '.##########.',
    '..########..',
    '...######...',
    '....####....',
    '.....##.....',
    '............',
  ]
  const heart = heartRows.map((row) => row.split('').map((c) => (c === '#' ? 1 : 0)))
  const rnd = mulberry32(7)
  const noise = Array.from({ length: N }, () => Array.from({ length: N }, () => rnd()))
  return { tartan, plus, heart, noise }
}

/** Eigen-decomposition of a small symmetric matrix by cyclic Jacobi rotations. */
function jacobiEig(S: number[][]): { values: number[]; vectors: number[][] } {
  const n = S.length
  const a = S.map((r) => r.slice())
  const v: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)))
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += a[p][q] * a[p][q]
    if (off < 1e-20) break
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-15) continue
        const theta = (a[q][q] - a[p][p]) / (2 * a[p][q])
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1))
        const c = 1 / Math.sqrt(t * t + 1)
        const sn = t * c
        for (let k = 0; k < n; k++) {
          const akp = a[k][p]
          const akq = a[k][q]
          a[k][p] = c * akp - sn * akq
          a[k][q] = sn * akp + c * akq
        }
        for (let k = 0; k < n; k++) {
          const apk = a[p][k]
          const aqk = a[q][k]
          a[p][k] = c * apk - sn * aqk
          a[q][k] = sn * apk + c * aqk
        }
        for (let k = 0; k < n; k++) {
          const vkp = v[k][p]
          const vkq = v[k][q]
          v[k][p] = c * vkp - sn * vkq
          v[k][q] = sn * vkp + c * vkq
        }
      }
    }
  }
  const values = a.map((r, i) => r[i])
  const vectors = Array.from({ length: n }, (_, j) => v.map((row) => row[j])) // vectors[j] = j-th eigenvector
  return { values, vectors }
}

/** Rank-1 layers σᵢ uᵢ vᵢᵀ of M, largest first (each equals (M vᵢ) vᵢᵀ). */
function rankOneLayers(Mx: number[][]): number[][][] {
  const n = Mx.length
  const MtM = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => Mx.reduce((acc, row) => acc + row[i] * row[j], 0)))
  const { values, vectors } = jacobiEig(MtM)
  const order = values.map((_, i) => i).sort((x, y) => values[y] - values[x])
  return order.map((idx) => {
    const vi = vectors[idx]
    const Mv = Mx.map((row) => row.reduce((acc, x, j) => acc + x * vi[j], 0))
    return Mv.map((m) => vi.map((x) => m * x))
  })
}

const frob = (A: number[][]) => Math.sqrt(A.reduce((acc, r) => acc + r.reduce((b, x) => b + x * x, 0), 0))

function Pixels({ data, size, diverging, label }: { data: number[][]; size: number; diverging?: boolean; label: string }) {
  const n = data.length
  const absMax = diverging ? Math.max(1e-9, ...data.flat().map(Math.abs)) : 1
  return (
    <svg width={n * size} height={n * size} viewBox={`0 0 ${n * size} ${n * size}`} role="img" aria-label={label} style={{ display: 'block' }}>
      <rect x={0} y={0} width={n * size} height={n * size} style={{ fill: 'var(--surface)', stroke: 'var(--rule)' }} />
      {data.map((row, i) =>
        row.map((v, j) => {
          let fill: string
          if (diverging) {
            const t = Math.min(1, Math.abs(v) / absMax)
            fill = `color-mix(in srgb, ${v < 0 ? 'var(--viz-1)' : 'var(--viz-2)'} ${Math.round(t * 85)}%, var(--surface))`
          } else {
            const t = Math.max(0, Math.min(1, v))
            fill = `color-mix(in srgb, var(--ink) ${Math.round(t * 88)}%, var(--surface))`
          }
          return <rect key={`${i}-${j}`} x={j * size} y={i * size} width={size} height={size} style={{ fill }} />
        }),
      )}
    </svg>
  )
}

function Stepper({ value, onChange, label, vertical }: { value: number; onChange: (v: number) => void; label: string; vertical?: boolean }) {
  const inc = (
    <button type="button" className={s.stepBtn} onClick={() => onChange(Math.min(VMAX, value + 1))} disabled={value >= VMAX} aria-label={`increase ${label}`}>
      +
    </button>
  )
  const dec = (
    <button type="button" className={s.stepBtn} onClick={() => onChange(Math.max(VMIN, value - 1))} disabled={value <= VMIN} aria-label={`decrease ${label}`}>
      −
    </button>
  )
  return (
    <div className={`${s.stepper} ${vertical ? s.stepperCol : ''}`}>
      {vertical ? inc : dec}
      <span className={s.vecCell} style={{ width: 30, height: 26, background: 'color-mix(in srgb, var(--viz-5) 16%, var(--surface))' }} aria-label={`${label} = ${value}`}>
        {value}
      </span>
      {vertical ? dec : inc}
    </div>
  )
}

const TARGET_LABELS: Record<string, string> = { tartan: 'Tartan', plus: 'Plus sign', heart: 'Heart', noise: 'Random noise' }

export default function OuterProductBuilder() {
  const [u, setU] = useState([1, 2, 3, -1, 0])
  const [v, setV] = useState([2, 1, 0, -1, -2])
  const [target, setTarget] = useState<'tartan' | 'plus' | 'heart' | 'noise'>('heart')
  const [r, setR] = useState(2)
  const [ref, narrow] = useNarrow<HTMLDivElement>(520)

  const targets = useMemo(makeTargets, [])
  const layersByTarget = useMemo(() => {
    const out: Record<string, number[][][]> = {}
    for (const key of Object.keys(targets)) out[key] = rankOneLayers(targets[key])
    return out
  }, [targets])

  const T = targets[target]
  const layers = layersByTarget[target].slice(0, r)
  const approx = T.map((row, i) => row.map((_, j) => layers.reduce((acc, L) => acc + L[i][j], 0)))
  const err = frob(T.map((row, i) => row.map((x, j) => x - approx[i][j]))) / frob(T)
  const cell = narrow ? 32 : 34
  const px = narrow ? 8 : 11
  const thumb = narrow ? 4 : 5
  const tableMax = Math.max(1, ...u.flatMap((a) => v.map((b) => Math.abs(a * b))))

  return (
    <Figure
      wide
      title="Rank-1 building blocks: from a times table to a picture"
      caption={
        <>
          <b>Try:</b> press + and − to change <M>u</M> and <M>v</M>, then add rank-1 layers to rebuild each picture. <b>Notice:</b> every row of{' '}
          <M>{'u v^T'}</M> is a copy of <M>v</M> (rank 1); the tartan needs 2 layers, the heart 6, and noise is never rebuilt.
        </>
      }
    >
      <div ref={ref} className={s.wrap}>
        <p className={s.subhead}>1 · One rank-1 matrix is a times table</p>
        <div className={s.tableWrap}>
          <div className={s.ttable} style={{ gridTemplateColumns: `auto repeat(${v.length}, ${cell}px)` }}>
            <div className={s.corner}>
              <M>u</M> ↓ &nbsp; <M>v</M> →
            </div>
            {v.map((x, j) => (
              <Stepper key={`v${j}`} vertical value={x} label={`v${j + 1}`} onChange={(nv) => setV((old) => old.map((o, k) => (k === j ? nv : o)))} />
            ))}
            {u.map((a, i) => (
              <Row key={`r${i}`} a={a} i={i} v={v} cell={cell} tableMax={tableMax} onChange={(nv) => setU((old) => old.map((o, k) => (k === i ? nv : o)))} />
            ))}
          </div>
        </div>
        <p className={s.note} style={{ textAlign: 'center' }}>
          {u.length} + {v.length} = {u.length + v.length} numbers describe all {u.length * v.length} cells. Set an entry of <M>v</M> to 0 and its whole
          column turns to 0.
        </p>

        <p className={s.subhead}>2 · Add rank-1 layers to rebuild a picture</p>
        <div className={s.pics}>
          <div className={s.pic}>
            <Pixels data={T} size={px} label={`Target picture: ${TARGET_LABELS[target]}`} />
            target (12 × 12)
          </div>
          <div className={s.pic} style={{ alignSelf: 'center', fontSize: '1.3rem', color: 'var(--ink-3)' }}>
            ≈
          </div>
          <div className={s.pic}>
            <Pixels data={approx} size={px} label={`Sum of the first ${r} rank-1 layers`} />
            sum of {r} layer{r > 1 ? 's' : ''}
          </div>
        </div>
        <div className={s.layers} aria-label="The rank-1 layers being added">
          {layers.map((L, i) => (
            <span key={i} style={{ display: 'contents' }}>
              {i > 0 && <span className={s.plus}>+</span>}
              <span className={s.layerItem}>
                <Pixels data={L} size={thumb} diverging label={`Rank-1 layer ${i + 1}`} />
                layer {i + 1}
              </span>
            </span>
          ))}
        </div>
        <div className={s.legend}>
          <span>
            <span className={s.swatch} style={{ background: 'var(--viz-2)' }} />
            layer adds
          </span>
          <span>
            <span className={s.swatch} style={{ background: 'var(--viz-1)' }} />
            layer subtracts
          </span>
        </div>
        <Controls>
          <Segmented
            label="Picture"
            value={target}
            onChange={setTarget}
            options={(['tartan', 'plus', 'heart', 'noise'] as const).map((k) => ({ value: k, label: TARGET_LABELS[k] }))}
          />
          <Slider label="rank-1 layers r" value={r} min={1} max={6} step={1} onChange={setR} />
          <Readout
            items={[
              ['numbers stored', `${r} × 24 = ${r * 24} of 144`],
              ['error', `${(err * 100).toFixed(err < 0.0005 ? 0 : 1)}%`],
            ]}
          />
        </Controls>
      </div>
    </Figure>
  )
}

function Row({ a, i, v, cell, tableMax, onChange }: { a: number; i: number; v: number[]; cell: number; tableMax: number; onChange: (v: number) => void }) {
  return (
    <>
      <Stepper value={a} label={`u${i + 1}`} onChange={onChange} />
      {v.map((b, j) => {
        const p = a * b
        const t = Math.min(1, Math.abs(p) / tableMax)
        // capped at 45% so the number on top stays readable in both themes
        const bg = p === 0 ? 'var(--surface-2)' : `color-mix(in srgb, ${p < 0 ? 'var(--viz-1)' : 'var(--viz-2)'} ${Math.round(10 + t * 35)}%, var(--surface))`
        return (
          <div key={j} className={s.cell} style={{ width: cell, height: cell, background: bg }} aria-label={`u${i + 1} times v${j + 1} = ${p}`}>
            {p}
          </div>
        )
      })}
    </>
  )
}
