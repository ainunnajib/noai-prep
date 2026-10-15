import { useId, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { Figure, Controls, Slider, Readout, M, useNarrow } from '../../../../../kit'
import { GardenScene } from './scene'
import css from './vit.module.css'

/*
  Cutting an image into patches. The learner picks the image size H = W and the patch size P;
  the image gets a patch grid, and the patches appear as a sequence of tokens (with [CLS] at the
  front and position numbers underneath), exactly in the raster order a ViT uses.
  Clicking a patch on the image highlights its token in the strip, and vice versa.
  Aha: a ViT reads an image like a sentence of patches, and the sentence gets long fast.
*/

const SIZES = [32, 64, 96, 128, 224, 384]
const PATCHES = [4, 8, 16, 32]
const fmt = (v: number) => v.toLocaleString('en-GB')

type Item = { kind: 'tok'; i: number } | { kind: 'gap'; hidden: number }

/** Which patch tokens to draw: all of them when there are few, otherwise the start, the selected one and the end. */
function stripItems(N: number, sel: number): Item[] {
  if (N <= 20) return Array.from({ length: N }, (_, i) => ({ kind: 'tok', i }))
  const keep = new Set<number>()
  for (let i = 0; i < 6; i++) keep.add(i)
  for (const k of [sel - 1, sel, sel + 1]) if (k >= 0 && k < N) keep.add(k)
  keep.add(N - 2)
  keep.add(N - 1)
  const idx = [...keep].sort((a, b) => a - b)
  const out: Item[] = []
  idx.forEach((i, k) => {
    if (k > 0 && i - idx[k - 1] > 1) out.push({ kind: 'gap', hidden: i - idx[k - 1] - 1 })
    out.push({ kind: 'tok', i })
  })
  return out
}

export default function Patchifier() {
  const [si, setSi] = useState(4) // 224 px
  const [pi, setPi] = useState(2) // 16 px
  // the selected patch is stored as a point (u, v) in [0, 1]² so it survives a change of grid
  const [pt, setPt] = useState<[number, number]>([0.33, 0.44])
  const [touched, setTouched] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)
  const sceneId = 'vit-scene-' + useId().replace(/:/g, '')

  const H = SIZES[si]
  const P = PATCHES[pi]
  const n = H / P
  const N = n * n
  const s = 100 / n
  const selR = Math.min(n - 1, Math.floor(pt[1] * n))
  const selC = Math.min(n - 1, Math.floor(pt[0] * n))
  const sel = selR * n + selC

  const pick = (e: MouseEvent<SVGSVGElement>) => {
    const b = e.currentTarget.getBoundingClientRect()
    setPt([Math.max(0, Math.min(0.999, (e.clientX - b.left) / b.width)), Math.max(0, Math.min(0.999, (e.clientY - b.top) / b.height))])
  }
  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    const d: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
    const m = d[e.key]
    if (!m) return
    e.preventDefault()
    const c = Math.max(0, Math.min(n - 1, selC + m[0]))
    const r = Math.max(0, Math.min(n - 1, selR + m[1]))
    setPt([(c + 0.5) / n, (r + 0.5) / n])
  }
  const selectToken = (i: number) => setPt([((i % n) + 0.5) / n, (Math.floor(i / n) + 0.5) / n])

  // one path for all the grid lines
  let grid = ''
  for (let k = 1; k < n; k++) grid += `M${k * s},0V100M0,${k * s}H100`
  // reading order (only drawn for small grids)
  const order = n > 8 ? '' : Array.from({ length: N }, (_, i) => `${i ? 'L' : 'M'}${((i % n) + 0.5) * s},${(Math.floor(i / n) + 0.5) * s}`).join('')

  const items = stripItems(N, sel)
  const key = `${H}-${P}`

  const image = (
    <div className={css.panel}>
      <div className={css.panelTitle}>
        {H} × {H} image, {P} × {P} patches
      </div>
      <svg
        viewBox="0 0 100 100"
        className={css.image}
        role="img"
        aria-label={`A ${H} by ${H} pixel image cut into a ${n} by ${n} grid of ${P} by ${P} patches. Selected patch: number ${sel + 1}, row ${selR + 1}, column ${selC + 1}. Use the arrow keys to move the selection.`}
        tabIndex={0}
        onClick={pick}
        onKeyDown={onKey}
      >
        <defs>
          <g id={sceneId}>
            <GardenScene />
          </g>
        </defs>
        <use href={`#${sceneId}`} />
        {n > 1 && (
          <path
            d={grid}
            vectorEffect="non-scaling-stroke"
            style={{ fill: 'none', stroke: 'var(--surface)', strokeWidth: n > 24 ? 0.6 : n > 12 ? 1 : 2, opacity: n > 48 ? 0.75 : 1 }}
          />
        )}
        {n > 1 && n <= 8 && (
          <path d={order} vectorEffect="non-scaling-stroke" style={{ fill: 'none', stroke: 'var(--accent)', strokeWidth: 1.5, strokeDasharray: '4 3', opacity: 0.75 }} />
        )}
        {n <= 8 &&
          Array.from({ length: N }, (_, i) => (
            <text
              key={i}
              x={((i % n) + 0.5) * s}
              y={(Math.floor(i / n) + 0.5) * s}
              dy="0.35em"
              textAnchor="middle"
              style={{
                fontSize: Math.min(8, s * 0.36),
                fontWeight: 800,
                fill: 'var(--ink)',
                stroke: 'var(--surface)',
                strokeWidth: Math.min(2, s * 0.08),
                paintOrder: 'stroke',
              }}
            >
              {i + 1}
            </text>
          ))}
        <rect
          x={selC * s}
          y={selR * s}
          width={s}
          height={s}
          vectorEffect="non-scaling-stroke"
          style={{ fill: 'color-mix(in srgb, var(--accent) 18%, transparent)', stroke: 'var(--accent)', strokeWidth: 3 }}
        />
      </svg>
      <div className={css.panelNote}>Click a patch (or focus the image and use the arrow keys).</div>
    </div>
  )

  const side = (
    <div className={css.side}>
      <div className={css.formula}>
        <M>{`${narrow ? '' : '\\dfrac{H}{P}\\times\\dfrac{W}{P} = '}\\dfrac{${H}}{${P}}\\times\\dfrac{${H}}{${P}} = ${n}\\times${n} = ${fmt(N).replace(/,/g, '{,}')}\\text{ patches}`}</M>
      </div>
      <Readout
        items={[
          ['tokens with [CLS]', fmt(N + 1)],
          ['numbers in one patch', `${P}×${P}×3 = ${fmt(P * P * 3)}`],
          ['attention scores per head', fmt((N + 1) * (N + 1))],
        ]}
      />
      <div className={css.small}>
        You picked patch <b>{sel + 1}</b> (row {selR + 1}, column {selC + 1}). It becomes token number <b>{sel + 1}</b> in the sequence; position 0
        belongs to <b>[CLS]</b>. Every token can attend to every other, so one attention head computes (tokens)² scores in every layer.
      </div>
    </div>
  )

  return (
    <Figure
      wide
      title="Cut the image into patches"
      caption={
        <>
          Slide the image size and the patch size and watch the patch count change. Halving <M>P</M> gives four times as many tokens, and about
          sixteen times as many attention scores. With few patches the dashed line shows the reading order: left to right, then the next row, just
          like reading words on a page. Click a patch on the image or a token in the strip to see that they are the same thing.
        </>
      }
    >
      <div ref={wrapRef} className={`${css.row} ${narrow ? '' : css.rowWide}`}>
        {image}
        {side}
      </div>

      <div style={{ width: '100%' }}>
        <div className={css.stripLabel}>
          The image as a sequence of {fmt(N + 1)} tokens{N > 20 ? ' (most of the middle is hidden)' : ''}
        </div>
        <div className={css.strip} role="group" aria-label={`Token sequence: [CLS] followed by ${N} patch tokens`}>
          <div className={css.token} key={`${key}-cls`}>
            <span className={`${css.tokenBox} ${css.tokenCls}`}>[CLS]</span>
            <span className={css.tokenPos}>0</span>
          </div>
          {items.map((it, k) =>
            it.kind === 'gap' ? (
              <span key={`${key}-g${k}`} className={css.gap}>
                … {fmt(it.hidden)} more …
              </span>
            ) : (
              <button
                key={`${key}-${it.i}`}
                type="button"
                className={`${css.token} ${touched ? css.tokenAnim : ''} ${it.i === sel ? css.tokenSel : ''}`}
                style={{ animationDelay: `${Math.min(k, 24) * 22}ms` }}
                onClick={() => selectToken(it.i)}
                aria-label={`Patch token ${it.i + 1}`}
                aria-pressed={it.i === sel}
              >
                <svg className={css.tokenBox} viewBox={`${(it.i % n) * s} ${Math.floor(it.i / n) * s} ${s} ${s}`} preserveAspectRatio="none" aria-hidden="true">
                  <use href={`#${sceneId}`} />
                </svg>
                <span className={css.tokenPos}>{it.i + 1}</span>
              </button>
            ),
          )}
        </div>
      </div>

      <Controls>
        <Slider label="image size H = W" value={si} min={0} max={SIZES.length - 1} step={1} onChange={(v) => (setSi(v), setTouched(true))} format={(v) => `${SIZES[v]} px`} />
        <Slider label="patch size P" value={pi} min={0} max={PATCHES.length - 1} step={1} onChange={(v) => (setPi(v), setTouched(true))} format={(v) => `${PATCHES[v]} px`} />
      </Controls>
    </Figure>
  )
}
