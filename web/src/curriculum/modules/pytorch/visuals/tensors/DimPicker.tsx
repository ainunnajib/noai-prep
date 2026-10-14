import { useState } from 'react'
import { Figure, Controls, Segmented, Toggle, mulberry32, useContainerWidth } from '../../../../../kit'
import { layoutTensor, unravel, ravel, type TensorLayout } from './blocks'
import css from './tensors.module.css'

/*
  One (2, 3, 4) tensor, four everyday operations, three possible dims. The figure computes the real
  result, draws it, and links every result cell back to the cells it came from (click a result
  cell). Only one dim gives the meaning you want; the other two still run without an error.
*/

type OpKey = 'softmax' | 'mean' | 'argmax' | 'cat'
const SHAPE = [2, 3, 4]

interface Scenario {
  names: [string, string, string]
  story: string
  right: number
  verdict: [string, string, string]
}

const SCEN: Record<OpKey, Scenario> = {
  softmax: {
    names: ['batch', 'query', 'key'],
    story: 'x holds attention scores: 2 sentences, 3 queries, 4 keys. Each query needs weights over the keys that sum to 1.',
    right: 2,
    verdict: [
      'Runs, but normalises across the 2 sentences in the batch: each pair of numbers sums to 1, mixing unrelated sentences.',
      'Runs, but normalises down each column (across queries), so the keys compete for queries instead of the other way round.',
      "Right: each query's 4 weights over the keys sum to 1. This is softmax(scores, dim=-1) in attention.",
    ],
  },
  mean: {
    names: ['batch', 'token', 'feature'],
    story: 'x holds token embeddings: 2 sentences, 3 tokens each, 4 numbers per token. We want one vector per sentence.',
    right: 1,
    verdict: [
      'Runs, but averages the same token position across 2 different sentences.',
      'Right: averages over the 3 tokens, giving one 4-number vector per sentence (mean pooling).',
      'Runs, but squashes each token’s 4 features into one number, throwing the features away.',
    ],
  },
  argmax: {
    names: ['image', 'class', 'pixel'],
    story: 'x holds segmentation scores: 2 images, 3 classes, 4 pixels. We want the predicted class of every pixel.',
    right: 1,
    verdict: [
      'Runs, but asks which image scores higher, which is not a class at all.',
      'Right: for every pixel, the index of the class with the highest score. One label per pixel.',
      'Runs, but asks which pixel scores highest for each class, which is not a prediction per pixel.',
    ],
  },
  cat: {
    names: ['image', 'channel', 'position'],
    story: 'x holds feature maps (2 images, 3 channels, 4 positions); skip is a matching map from earlier in a U-Net. Join them.',
    right: 1,
    verdict: [
      'Runs, but stacks the skip maps as if they were 2 more images: the batch becomes 4.',
      'Right: joins along channels, 3 + 3 = 6 channels per image. This is a U-Net skip connection.',
      'Runs, but glues the maps end to end, so positions 4 to 7 are not real positions.',
    ],
  },
}

function ints(seed: number, lo: number, hi: number, n: number) {
  const r = mulberry32(seed)
  return Array.from({ length: n }, () => lo + Math.floor(r() * (hi - lo + 1)))
}
function distinct(seed: number, n: number) {
  const r = mulberry32(seed)
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const N = 24
const DATA: Record<OpKey, number[]> = {
  softmax: ints(7, -1, 2, N),
  mean: ints(11, 0, 9, N),
  argmax: distinct(5, N),
  cat: ints(3, 0, 9, N),
}
const SKIP = ints(19, 0, 9, N)

interface Result {
  shape: number[]
  values: number[]
  /** for each result cell, the source cells: [which tensor, logical index] */
  src: [0 | 1, number][][]
  fmt: (v: number) => string
}

function compute(op: OpKey, dim: number, keepdim: boolean): Result {
  const x = DATA[op]
  if (op === 'cat') {
    const shape = SHAPE.map((s, i) => (i === dim ? s * 2 : s))
    const n = shape.reduce((a, b) => a * b, 1)
    const values: number[] = []
    const src: [0 | 1, number][][] = []
    for (let k = 0; k < n; k++) {
      const idx = unravel(k, shape)
      const from: 0 | 1 = idx[dim] < SHAPE[dim] ? 0 : 1
      const sIdx = idx.slice()
      sIdx[dim] = idx[dim] % SHAPE[dim]
      const j = ravel(sIdx, SHAPE)
      values.push(from === 0 ? x[j] : SKIP[j])
      src.push([[from, j]])
    }
    return { shape, values, src, fmt: (v) => String(v) }
  }
  if (op === 'softmax') {
    const values: number[] = new Array(N)
    const src: [0 | 1, number][][] = new Array(N)
    for (let k = 0; k < N; k++) {
      const idx = unravel(k, SHAPE)
      const fibre = Array.from({ length: SHAPE[dim] }, (_, t) => {
        const q = idx.slice()
        q[dim] = t
        return ravel(q, SHAPE)
      })
      const mx = Math.max(...fibre.map((j) => x[j]))
      const z = fibre.reduce((a, j) => a + Math.exp(x[j] - mx), 0)
      values[k] = Math.exp(x[k] - mx) / z
      src[k] = fibre.map((j) => [0, j])
    }
    return { shape: SHAPE.slice(), values, src, fmt: (v) => v.toFixed(2) }
  }
  // reductions
  const outShape = SHAPE.map((s, i) => (i === dim ? 1 : s))
  const n = outShape.reduce((a, b) => a * b, 1)
  const values: number[] = []
  const src: [0 | 1, number][][] = []
  for (let k = 0; k < n; k++) {
    const idx = unravel(k, outShape)
    const fibre = Array.from({ length: SHAPE[dim] }, (_, t) => {
      const q = idx.slice()
      q[dim] = t
      return ravel(q, SHAPE)
    })
    const vals = fibre.map((j) => x[j])
    if (op === 'mean') values.push(vals.reduce((a, b) => a + b, 0) / vals.length)
    else values.push(vals.indexOf(Math.max(...vals)))
    src.push(fibre.map((j) => [0, j]))
  }
  const shape = keepdim ? outShape : SHAPE.filter((_, i) => i !== dim)
  return { shape, values, src, fmt: op === 'mean' ? (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1)) : (v) => String(v) }
}

const shapeStr = (s: number[]) => `(${s.join(', ')}${s.length === 1 ? ',' : ''})`

export default function DimPicker() {
  const [op, setOp] = useState<OpKey>('softmax')
  const [dim, setDim] = useState(2)
  const [keepdim, setKeepdim] = useState(false)
  const [focus, setFocus] = useState(0)
  const [wrapRef, wrap] = useContainerWidth<HTMLDivElement>(520)
  const sc = SCEN[op]
  const res = compute(op, dim, keepdim)
  const f = Math.min(focus, res.values.length - 1)
  const srcSet = new Set(res.src[f].map(([t, j]) => `${t}:${j}`))
  const ok = dim === sc.right

  const avail = Math.max(260, Math.min(560, wrap))
  const lx = layoutTensor(SHAPE, op === 'cat' ? Math.min(avail, 460) : avail, { maxCell: 32, minCell: 22, sheetLabel: (_, j) => `${sc.names[0]} ${j}` })
  const ly = layoutTensor(SHAPE, Math.min(avail, 460), { maxCell: 32, minCell: 22, sheetLabel: (_, j) => `${sc.names[0]} ${j}` })
  const lr = layoutTensor(res.shape, avail, {
    maxCell: 38,
    minCell: 22,
    sheetLabel: (_, j) => (res.shape.length === 3 ? `[${j}]` : ''),
  })

  const call =
    op === 'cat'
      ? `out = torch.cat([x, skip], dim=${dim})`
      : op === 'softmax'
        ? `out = torch.softmax(x, dim=${dim === 2 ? -1 : dim})`
        : `out = x.${op}(dim=${dim}${keepdim ? ', keepdim=True' : ''})`

  const fibreSum = op === 'softmax' ? res.src[f].reduce((a, [, j]) => a + res.values[j], 0) : null

  const changeOp = (o: OpKey) => {
    setOp(o)
    setFocus(0)
  }
  const changeDim = (d: number) => {
    setDim(d)
    setFocus(0)
  }

  return (
    <Figure
      wide
      title="Choosing dim: same tensor, three different answers"
      caption={
        <>
          Pick an operation, then a dim. The outlined cells in <code>x</code> are the ones combined into the outlined result cell; click any result
          cell to trace it back. Every dim runs without an error, but only one matches the meaning in the story. Reductions remove the dim you name
          (unless <code>keepdim=True</code>), softmax keeps the shape and makes each traced group sum to 1, and <code>cat</code> grows the dim you name.
        </>
      }
    >
      <Controls>
        <Segmented
          label="Operation"
          value={op}
          onChange={changeOp}
          options={(['softmax', 'mean', 'argmax', 'cat'] as OpKey[]).map((o) => ({ value: o, label: <span className={css.mono}>{o}</span> }))}
        />
        <Segmented
          label="dim"
          value={dim}
          onChange={changeDim}
          options={[0, 1, 2].map((d) => ({
            value: d,
            label: (
              <span className={css.mono}>
                {d === 2 ? '2 (= -1)' : d}: {sc.names[d]}
              </span>
            ),
          }))}
        />
        {(op === 'mean' || op === 'argmax') && <Toggle label="keepdim=True" checked={keepdim} onChange={setKeepdim} />}
      </Controls>
      <div className={css.note}>{sc.story}</div>

      <div
        ref={wrapRef}
        style={{ width: '100%', display: 'grid', gap: 10, justifyItems: 'center' }}
      >
        <div className={css.chips}>
          <span className={css.mono} style={{ fontWeight: 700, color: 'var(--ink-2)', marginRight: 2, fontSize: '0.85rem' }}>
            x.shape =
          </span>
          <span className={css.paren}>(</span>
          {SHAPE.map((s, i) => (
            <span key={i} className={css.chip} style={{ color: i === dim ? 'var(--accent)' : 'var(--viz-muted)' }}>
              <span className={css.chipNum}>{s}</span>
              <span className={css.chipName}>{sc.names[i]}</span>
              <span className={css.chipName} style={{ opacity: 0.8 }}>
                dim {i}
                {i === 2 ? ' / -1' : ''}
              </span>
            </span>
          ))}
          <span className={css.paren}>)</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', width: '100%' }}>
          <Grid lay={lx} values={DATA[op]} fmt={(v) => String(v)} tag={0} srcSet={srcSet} label="x" />
          {op === 'cat' && <Grid lay={ly} values={SKIP} fmt={(v) => String(v)} tag={1} srcSet={srcSet} label="skip" />}
        </div>
        <pre className={css.code} style={{ textAlign: 'left' }}>
          {call}
          {'\n'}
          <span className={css.comment}>
            {'# out.shape = '}
            {shapeStr(res.shape)}
          </span>
        </pre>
        <Grid
          lay={lr}
          values={res.values}
          fmt={res.fmt}
          tag={2}
          srcSet={new Set()}
          label="out"
          focus={f}
          onPick={setFocus}
          colourOf={op === 'cat' ? (k) => (res.src[k][0][0] === 1 ? 'var(--viz-3)' : 'var(--viz-1)') : undefined}
        />
      </div>
      {fibreSum != null && (
        <div className={css.note} style={{ textAlign: 'center' }}>
          The {res.src[f].length} outlined probabilities add up to <b>{fibreSum.toFixed(2)}</b>.
        </div>
      )}
      <div className={ok ? css.ok : css.error} style={ok ? undefined : { fontFamily: 'var(--font-body)', fontWeight: 600, background: 'var(--warn-soft)', color: 'var(--warn)' }} aria-live="polite">
        {ok ? '✓ ' : 'No error, wrong meaning. '}
        {sc.verdict[dim]}
      </div>
    </Figure>
  )
}

function Grid({
  lay,
  values,
  fmt,
  tag,
  srcSet,
  label,
  focus,
  onPick,
  colourOf,
}: {
  lay: TensorLayout
  values: number[]
  fmt: (v: number) => string
  tag: 0 | 1 | 2
  srcSet: Set<string>
  label: string
  focus?: number
  onPick?: (k: number) => void
  colourOf?: (k: number) => string
}) {
  const base = tag === 1 ? 'var(--viz-3)' : 'var(--viz-1)'
  const anyFocus = tag !== 2 && srcSet.size > 0
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 2 }}>
      <div className={css.mono} style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--ink-2)' }}>
        {label}
      </div>
      <div className={css.stage} style={{ width: lay.width, height: lay.height }}>
        {lay.sheetLabels.map((l, j) => (
          <span key={j} className={css.sheetLabel} style={{ transform: `translate(${l.x}px, ${l.y}px)`, transition: 'none' }}>
            {l.text}
          </span>
        ))}
        {lay.cells.map((b, k) => {
          const hit = tag === 2 ? k === focus : srcSet.has(`${tag}:${k}`)
          const c = colourOf ? colourOf(k) : base
          const Tag = onPick ? 'button' : 'div'
          return (
            <Tag
              key={k}
              type={onPick ? 'button' : undefined}
              onClick={onPick ? () => onPick(k) : undefined}
              aria-label={onPick ? `result cell ${k}, value ${fmt(values[k])}` : undefined}
              className={css.cell}
              style={{
                font: 'inherit',
                transition: 'none',
                width: b.w,
                height: b.h,
                transform: `translate(${b.x}px, ${b.y}px)`,
                background: `color-mix(in srgb, ${c} ${hit ? 30 : 12}%, var(--surface))`,
                border: hit ? '2.5px solid var(--viz-2)' : `1px solid color-mix(in srgb, ${c} 45%, var(--surface))`,
                opacity: anyFocus && !hit ? 0.6 : 1,
                fontSize: b.w >= 34 ? 11.5 : b.w >= 28 ? 10.5 : 9.5,
                cursor: onPick ? 'pointer' : undefined,
                padding: 0,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--ink)',
              }}
            >
              {fmt(values[k])}
            </Tag>
          )
        })}
      </div>
    </div>
  )
}
