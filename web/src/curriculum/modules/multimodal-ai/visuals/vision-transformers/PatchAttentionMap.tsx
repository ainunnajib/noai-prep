import { useId, useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { Figure, Controls, Segmented, Readout, useNarrow } from '../../../../../kit'
import { GardenScene, patchLabels, COLOUR_GROUP, type ObjectLabel } from './scene'
import css from './vit.module.css'

/*
  Attention across patches versus a CNN's receptive field, on the same 224 × 224 picture.
  Left: a ViT-B/16 view (14 × 14 patches). Click a patch to make it the query; brightness shows
  ILLUSTRATIVE attention weights (hand-made scores through a real softmax) that mimic what trained
  ViTs show: early heads mix "nearby" with "same colour anywhere", late layers attend to the same object.
  Right: the EXACT receptive field of one VGG-16 neuron at the same spot after conv layer 1, 7 or 13
  (3, 40 and 196 pixels wide).
  Aha: a ViT patch may look anywhere from layer 1; a CNN neuron starts with a 3 × 3 keyhole.
*/

const IMG = 224
const N = 14
const PATCH = IMG / N
type Depth = 'early' | 'middle' | 'late'
const DEPTH: Record<Depth, { vit: string; cnn: string; rf: number }> = {
  early: { vit: 'layer 1 of 12', cnn: 'conv layer 1 of 13', rf: 3 },
  middle: { vit: 'layer 6 of 12', cnn: 'conv layer 7 of 13', rf: 40 },
  late: { vit: 'layer 12 of 12', cnn: 'conv layer 13 of 13', rf: 196 },
}

const softmax = (scores: number[]) => {
  const m = Math.max(...scores)
  const ex = scores.map((s) => Math.exp(s - m))
  const z = ex.reduce((a, b) => a + b, 0)
  return ex.map((e) => e / z)
}

function attention(q: number, depth: Depth, labels: ObjectLabel[]): number[] {
  const rq = Math.floor(q / N)
  const cq = q % N
  const lq = labels[q]
  const feats = labels.map((lk, k) => ({
    d2: (Math.floor(k / N) - rq) ** 2 + ((k % N) - cq) ** 2,
    sameColour: COLOUR_GROUP[lk] === COLOUR_GROUP[lq] ? 1 : 0,
    sameObj: lk === lq ? 1 : 0,
    cat: lk === 'cat' ? 1 : 0,
  }))
  if (depth === 'early') {
    // average of two heads: one looks at neighbours, the other at the same colour anywhere
    const local = softmax(feats.map((f) => -f.d2 / 2))
    const colour = softmax(feats.map((f) => 2.5 * f.sameColour - f.d2 / 800))
    return local.map((v, k) => 0.6 * v + 0.4 * colour[k])
  }
  if (depth === 'middle') return softmax(feats.map((f) => -f.d2 / 18 + 2.2 * f.sameColour + 0.8 * f.sameObj))
  return softmax(feats.map((f) => 4 * f.sameObj + f.cat - f.d2 / 200))
}

const pct = (v: number) => (v >= 0.1 ? `${(v * 100).toFixed(0)}%` : v >= 0.001 ? `${(v * 100).toFixed(1)}%` : `${(v * 100).toFixed(2)}%`)

export default function PatchAttentionMap() {
  const labels = useMemo(() => patchLabels(N), [])
  const [q, setQ] = useState(6 * N + 4) // the cat's head
  const [depth, setDepth] = useState<Depth>('early')
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const sceneId = 'vit-attn-' + useId().replace(/:/g, '')

  const w = useMemo(() => attention(q, depth, labels), [q, depth, labels])
  const wMax = Math.max(...w)
  const rq = Math.floor(q / N)
  const cq = q % N
  const near = w.reduce((a, v, k) => (Math.abs(Math.floor(k / N) - rq) <= 1 && Math.abs((k % N) - cq) <= 1 ? a + v : a), 0)
  const sameObj = w.reduce((a, v, k) => (labels[k] === labels[q] ? a + v : a), 0)

  // CNN receptive field centred on the chosen patch's centre, clipped to the image
  const rf = DEPTH[depth].rf
  const cx = (cq + 0.5) * PATCH
  const cy = (rq + 0.5) * PATCH
  const x0 = Math.max(0, cx - rf / 2)
  const x1 = Math.min(IMG, cx + rf / 2)
  const y0 = Math.max(0, cy - rf / 2)
  const y1 = Math.min(IMG, cy + rf / 2)
  const seen = (x1 - x0) * (y1 - y0)

  const pick = (e: MouseEvent<SVGSVGElement>) => {
    const b = e.currentTarget.getBoundingClientRect()
    const c = Math.max(0, Math.min(N - 1, Math.floor(((e.clientX - b.left) / b.width) * N)))
    const r = Math.max(0, Math.min(N - 1, Math.floor(((e.clientY - b.top) / b.height) * N)))
    setQ(r * N + c)
  }
  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    const d: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
    const m = d[e.key]
    if (!m) return
    e.preventDefault()
    setQ(Math.max(0, Math.min(N - 1, rq + m[1])) * N + Math.max(0, Math.min(N - 1, cq + m[0])))
  }

  const queryBox = <rect x={cq * PATCH} y={rq * PATCH} width={PATCH} height={PATCH} style={{ fill: 'none', stroke: 'var(--accent)', strokeWidth: 3 }} />

  const vit = (
    <div className={css.panel}>
      <div className={css.panelTitle}>
        ViT, {DEPTH[depth].vit}
        <br />
        attention from the chosen patch
      </div>
      <svg
        viewBox={`0 0 ${IMG} ${IMG}`}
        className={css.image}
        role="img"
        tabIndex={0}
        onClick={pick}
        onKeyDown={onKey}
        aria-label={`ViT attention from patch at row ${rq + 1}, column ${cq + 1} (${labels[q]}). ${pct(near)} of the attention lands on the chosen patch and its 8 neighbours; ${pct(sameObj)} lands on the same object. Arrow keys move the chosen patch.`}
      >
        <defs>
          <g id={sceneId}>
            <g transform={`scale(${IMG / 100})`}>
              <GardenScene />
            </g>
          </g>
        </defs>
        <use href={`#${sceneId}`} />
        {w.map((v, k) => (
          <rect
            key={k}
            x={(k % N) * PATCH}
            y={Math.floor(k / N) * PATCH}
            width={PATCH}
            height={PATCH}
            style={{ fill: 'var(--surface)', opacity: 0.9 * (1 - Math.pow(v / wMax, 0.55)) }}
          />
        ))}
        {queryBox}
      </svg>
      <div className={css.panelNote}>Click any patch, or use the arrow keys.</div>
      <Readout
        items={[
          ['can attend to', `all ${N * N} patches`],
          ['weight on the 3 × 3 block around it', pct(near)],
          [`weight on the ${labels[q]}`, pct(sameObj)],
        ]}
      />
    </div>
  )

  const cnn = (
    <div className={css.panel}>
      <div className={css.panelTitle}>
        CNN (VGG-16), {DEPTH[depth].cnn}
        <br />
        what one neuron here can see
      </div>
      <svg
        viewBox={`0 0 ${IMG} ${IMG}`}
        className={css.image}
        role="img"
        tabIndex={0}
        onClick={pick}
        onKeyDown={onKey}
        aria-label={`CNN receptive field of ${rf} by ${rf} pixels centred on the same spot.`}
      >
        <use href={`#${sceneId}`} />
        <path
          d={`M0,0H${IMG}V${IMG}H0Z M${x0},${y0}V${y1}H${x1}V${y0}Z`}
          style={{ fill: 'var(--surface)', opacity: 0.88, fillRule: 'evenodd' }}
        />
        {rf < 12 && <circle cx={cx} cy={cy} r={13} style={{ fill: 'none', stroke: 'var(--accent)', strokeWidth: 2, strokeDasharray: '4 3' }} />}
        <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} style={{ fill: 'none', stroke: 'var(--accent)', strokeWidth: rf < 12 ? 1.5 : 3 }} />
      </svg>
      <Readout
        items={[
          ['window', `${rf} × ${rf} px`],
          ['share of the image', pct(seen / (IMG * IMG))],
        ]}
      />
    </div>
  )

  return (
    <Figure
      wide
      title="Who can a patch talk to?"
      caption={
        <>
          Bright areas are where the chosen patch looks. <b>Try:</b>
          <ol className="try">
            <li>Click any patch (the cat's ear, the sun, the grass) in the early layer.</li>
            <li>Pick a grass patch: the far-away leaves light up faintly, because one early head looks at the same colour anywhere.</li>
            <li>Switch to the middle and late layers, and compare the CNN neuron's window beside it.</li>
          </ol>
          <b>Notice:</b> the ViT can look anywhere from layer 1 and later gathers the whole object; the CNN starts with a 3 × 3 pixel keyhole that widens only layer
          by layer.
          <span className="fine">
            The ViT weights are illustrative (hand-set scores through a real softmax, mimicking patterns seen in trained ViTs; the early map averages a
            neighbour head and a same-colour head). The CNN windows are the exact receptive fields of VGG-16.
          </span>
        </>
      }
    >
      <Controls>
        <Segmented
          label="depth"
          value={depth}
          onChange={setDepth}
          options={[
            { value: 'early', label: 'early' },
            { value: 'middle', label: 'middle' },
            { value: 'late', label: 'late' },
          ]}
        />
      </Controls>
      <div ref={wrapRef} className={`${css.row} ${narrow ? '' : css.rowTwo}`}>
        {vit}
        {cnn}
      </div>
    </Figure>
  )
}
