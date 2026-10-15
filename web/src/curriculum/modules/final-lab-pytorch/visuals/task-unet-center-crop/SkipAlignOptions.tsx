import { useId, useState, type ReactNode } from 'react'
import { Figure, Controls, Slider, Button, Readout, useNarrow } from '../../../../../kit'
import { Chips } from '../torch-exam-patterns/code'
import { traceNet } from './netShapes'
import u from './unet.module.css'

/*
  Q2.1b: crop, pad or interpolate? Three ways to make the skip map x2 and the decoder map d1 the same
  size, drawn side by side with what each one throws away or invents, and the output size for the
  chosen input (from the same verified shape rules as the other visuals: 256 -> crop 110, same
  padding 128, resizing d1 118). Below: write your own 2-3 sentence answer, check which key points
  it covers, then compare with a model answer.
*/

type Mode = 'crop' | 'same' | 'resize'
type ResizeKind = 'interp' | 'pad'

const fmt = (v: number) => v.toLocaleString('en-GB')

function Square({
  x,
  y,
  size,
  fill,
  stroke,
  label,
  dash,
}: {
  x: number
  y: number
  size: number
  fill: string
  stroke: string
  label?: ReactNode
  dash?: string
}) {
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} style={{ fill, stroke, strokeWidth: 2, strokeDasharray: dash }} />
      {label && (
        <text x={x + size / 2} y={y - 8} textAnchor="middle" style={{ fill: 'var(--viz-ink)', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
          {label}
        </text>
      )}
    </g>
  )
}

/** A ring between an outer square and an inner square, drawn as a path with a hole. */
function Ring({ x, y, outer, inner, fill }: { x: number; y: number; outer: number; inner: number; fill: string }) {
  const o = (outer - inner) / 2
  const d = `M${x},${y}h${outer}v${outer}h${-outer}Z M${x + o},${y + o}v${inner}h${inner}v${-inner}Z`
  return <path d={d} style={{ fill, fillRule: 'evenodd' }} />
}

const POINTS: { id: string; label: string; hint: string; test: (t: string) => boolean }[] = [
  {
    id: 'crop',
    label: 'What cropping loses',
    hint: 'Say that the outer ring (border, edge) of the skip map is thrown away, so detail near the image edge never reaches the decoder.',
    test: (t) => /(border|edge|outer|ring|boundar|corner|context)/.test(t) && /(lose|lost|loss|discard|throw|thrown|remov|cut|drop|waste)/.test(t),
  },
  {
    id: 'size',
    label: 'The output is smaller than the input',
    hint: 'Mention that the output (110 × 110 for a 256 × 256 input) is smaller than the input, so large images need overlapping tiles.',
    test: (t) => /(smaller|shrink|110|tile|output size|fewer pixels|not the same size)/.test(t),
  },
  {
    id: 'pad',
    label: 'Padding: an alternative and its cost',
    hint: 'Name padding (padding=1, "same") as an alternative and give its cost: zeros at the border, or a little more compute and memory.',
    test: (t) => /pad/.test(t) && /(zero|artificial|fake|invent|compute|cost|memory|slower|edge|border|reliab)/.test(t),
  },
  {
    id: 'interp',
    label: 'Interpolation: an alternative and its cost',
    hint: 'Name interpolating (resizing) the decoder map as an alternative and give its cost: it stretches the map and invents in-between values.',
    test: (t) => /(interpol|resiz|upsampl|stretch|rescal)/.test(t),
  },
]

export default function SkipAlignOptions() {
  const [mode, setMode] = useState<Mode>('crop')
  const [kind, setKind] = useState<ResizeKind>('interp')
  const [n, setN] = useState(256)
  const [text, setText] = useState('')
  const [checked, setChecked] = useState(false)
  const [showModel, setShowModel] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)
  const hatch = `sa-hatch-${useId().replace(/:/g, '')}`

  const valid = traceNet(n, 0, 'crop')
  const same = traceNet(n, 1, 'none')
  const resized = traceNet(n, 0, 'resize')
  const t = mode === 'crop' ? valid : mode === 'same' ? same : resized
  const S = t.x2
  const s = t.d1
  const sameBroken = mode === 'same' && same.x2 !== same.d1

  // drawing: skip map on the left, decoder map on the right, common scale
  const W = narrow ? 320 : 460
  const big = narrow ? 118 : 165
  const scale = big / Math.max(valid.x2, same.x2, 1)
  const gap = narrow ? 34 : 60
  const sizeL = S * scale
  const sizeR = (mode === 'resize' ? S : s) * scale
  const sizeRorig = s * scale
  const top = 30
  const xL = (W - (sizeL + gap + Math.max(sizeR, sizeRorig))) / 2
  const xR = xL + sizeL + gap
  const H = top + Math.max(sizeL, sizeR) + 52
  const cyL = top
  const cyR = top + (sizeL - sizeR) / 2

  const discarded = valid.x2 * valid.x2 - valid.d1 * valid.d1
  const facts: { good: boolean; text: ReactNode }[] =
    mode === 'crop'
      ? [
          { good: true, text: <>Every value that reaches the decoder is real, and the centred crop keeps skip and decoder positions exactly lined up.</> },
          {
            good: false,
            text: (
              <>
                Throws away the outer ring of every skip map: {fmt(discarded)} of {fmt(valid.x2 * valid.x2)} values per channel here (
                {Math.round((100 * discarded) / Math.max(1, valid.x2 * valid.x2))}%). Detail and context near the image border never reach the decoder.
              </>
            ),
          },
          {
            good: false,
            text: (
              <>
                The output ({valid.out} × {valid.out}) is smaller than the input, so the border pixels get no prediction; a large image must be processed as
                overlapping tiles, which costs extra compute.
              </>
            ),
          },
          { good: true, text: <>Cheapest to run: every map is smaller, so there are fewer multiplications.</> },
        ]
      : mode === 'same'
        ? [
            sameBroken
              ? {
                  good: false,
                  text: (
                    <>
                      With input {n}, pooling rounds down ({same.x2} becomes {Math.floor(same.x2 / 2)}, doubled back to {same.d1}), so even same padding gives{' '}
                      {same.x2} ≠ {same.d1}. Same padding needs an input that halves cleanly at every pooling step.
                    </>
                  ),
                }
              : { good: true, text: <>No 3 × 3 conv shrinks a map, so the skip and decoder maps line up ({same.x2} and {same.d1}) without any cropping.</> },
            {
              good: true,
              text: (
                <>
                  No border is thrown away. In a full U-Net (one upsampling per pooling) the output is then the same size as the input. This cut-down network pools
                  twice but upsamples once, so its output is at half resolution: {same.out ?? '–'} × {same.out ?? '–'}.
                </>
              ),
            },
            { good: false, text: <>The outermost pixels of every map are computed partly from padded zeros, so predictions right at the edge are less reliable.</> },
            { good: false, text: <>Slightly more compute and memory: every map stays bigger.</> },
          ]
        : kind === 'interp'
          ? [
              { good: true, text: <>One line, <code>F.interpolate(d1, size=x2.shape[-2:])</code>, and the network is otherwise unchanged.</> },
              {
                good: false,
                text: (
                  <>
                    Stretches {valid.d1} values per row over {valid.x2}: every value is re-sampled, so in-between values are invented and the map is blurred.
                  </>
                ),
              },
              {
                good: false,
                text: (
                  <>
                    The decoder map describes the central {valid.d1} × {valid.d1} region, so stretching it over {valid.x2} × {valid.x2} shifts features outwards by
                    up to {Math.floor((valid.x2 - valid.d1) / 2)} pixels: skip and decoder no longer line up.
                  </>
                ),
              },
              { good: true, text: <>The output grows to {resized.out} × {resized.out} (from {valid.out}), still smaller than the input.</> },
            ]
          : [
              { good: true, text: <>One line, <code>F.pad(d1, (4, 4, 4, 4))</code> (or 4 and 5 when the gap is odd), and the network is otherwise unchanged.</> },
              { good: false, text: <>Invents {fmt(discarded)} zeros per channel around the decoder map: the decoder half of the joined map has a fake border.</> },
              { good: true, text: <>Centred padding keeps the real values lined up with the skip map.</> },
              { good: true, text: <>The output grows to {resized.out} × {resized.out} (from {valid.out}), still smaller than the input.</> },
            ]

  const lower = text.toLowerCase()
  const hits = POINTS.map((p) => p.test(lower))
  const nHits = hits.filter(Boolean).length

  return (
    <Figure
      wide
      title="Crop, pad or interpolate? (Q2.1b)"
      caption={
        <>
          Switch between the three ways of making <code>x2</code> (orange) and <code>d1</code> (green) the same size. Red marks values that are thrown away;
          hatched amber marks values that are invented. Then write your own two-to-three-sentence answer and check which key points it covers before you look at the
          model answer.
        </>
      }
    >
      <div ref={wrapRef} className={narrow ? u.narrow : ''} style={{ width: '100%', display: 'grid', gap: '0.8rem' }}>
        <Chips
          label="How to align the maps"
          options={[
            { value: 'crop', label: 'Crop the skip map' },
            { value: 'same', label: 'Same padding' },
            { value: 'resize', label: 'Resize the decoder map' },
          ]}
          value={mode}
          onChange={setMode}
        />
        {mode === 'resize' && (
          <Chips
            label="Resize with"
            options={[
              { value: 'interp', label: 'F.interpolate (stretch)' },
              { value: 'pad', label: 'F.pad (add zeros)' },
            ]}
            value={kind}
            onChange={setKind}
          />
        )}
        <div className={u.saGrid}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, justifySelf: 'center' }} role="img" aria-label="The skip map and the decoder map drawn to scale for the chosen option">
            <defs>
              <pattern id={hatch} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="6" height="6" style={{ fill: 'color-mix(in srgb, var(--warn) 22%, var(--surface))' }} />
                <line x1="0" y1="0" x2="0" y2="6" style={{ stroke: 'var(--warn)', strokeWidth: 2.2 }} />
              </pattern>
            </defs>
            {/* skip map */}
            <Square x={xL} y={cyL} size={sizeL} fill="color-mix(in srgb, var(--viz-2) 22%, var(--surface))" stroke="var(--viz-2)" label={`x2 ${S}×${S}`} />
            {mode === 'crop' && (
              <>
                <Ring x={xL} y={cyL} outer={sizeL} inner={s * scale} fill="color-mix(in srgb, var(--viz-neg) 55%, var(--surface))" />
                <rect x={xL + ((S - s) / 2) * scale} y={cyL + ((S - s) / 2) * scale} width={s * scale} height={s * scale} style={{ fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: 1.5, strokeDasharray: '4 3' }} />
              </>
            )}
            {mode === 'same' && <Ring x={xL} y={cyL} outer={sizeL} inner={Math.max(0, sizeL - 10)} fill={`url(#${hatch})`} />}
            {/* decoder map */}
            {mode === 'resize' && kind === 'pad' ? (
              <>
                <Square x={xR} y={cyR} size={sizeR} fill={`url(#${hatch})`} stroke="var(--warn)" label={`d1 → ${S}×${S}`} />
                <rect x={xR + ((S - s) / 2) * scale} y={cyR + ((S - s) / 2) * scale} width={s * scale} height={s * scale} style={{ fill: 'color-mix(in srgb, var(--viz-3) 30%, var(--surface))', stroke: 'var(--viz-3)', strokeWidth: 2 }} />
              </>
            ) : mode === 'resize' ? (
              <>
                <Square x={xR} y={cyR} size={sizeR} fill="color-mix(in srgb, var(--viz-3) 30%, var(--surface))" stroke="var(--warn)" label={`d1 → ${S}×${S}`} />
                <rect x={xR} y={cyR} width={sizeR} height={sizeR} style={{ fill: `url(#${hatch})`, opacity: 0.55 }} />
              </>
            ) : (
              <Square x={xR} y={cyR} size={sizeR} fill="color-mix(in srgb, var(--viz-3) 30%, var(--surface))" stroke="var(--viz-3)" label={`d1 ${s}×${s}`} />
            )}
            {mode === 'same' && <Ring x={xR} y={cyR} outer={sizeR} inner={Math.max(0, sizeR - 10)} fill={`url(#${hatch})`} />}
            <text x={W / 2} y={top + Math.max(sizeL, sizeR) + 22} textAnchor="middle" style={{ fill: sameBroken ? 'var(--bad)' : 'var(--viz-ink)', fontSize: 12.5, fontWeight: 700 }}>
              {sameBroken
                ? `torch.cat fails: ${same.x2} ≠ ${same.d1}`
                : `joined: 256 × ${t.joined ?? '–'} × ${t.joined ?? '–'}  →  output ${t.out ?? '–'} × ${t.out ?? '–'}`}
            </text>
            <text x={W / 2} y={top + Math.max(sizeL, sizeR) + 40} textAnchor="middle" style={{ fill: 'var(--viz-muted)', fontSize: 11.5 }}>
              {mode === 'crop' ? 'red ring: thrown away' : mode === 'same' ? 'hatched: computed partly from zero padding' : kind === 'pad' ? 'hatched: zeros added by F.pad' : 'hatched: every value re-sampled'}
            </text>
          </svg>
          <div className={u.facts}>
            {facts.map((f, i) => (
              <div key={i} className={u.fact}>
                <span className={`${u.factIcon} ${f.good ? u.good : u.bad}`}>{f.good ? '+' : '−'}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <Controls>
          <Slider label="input size" value={n} min={40} max={320} step={1} onChange={setN} format={(v) => `${v} × ${v}`} />
          <Readout
            items={[
              ['output: crop', `${valid.out}`],
              ['same padding', same.out != null && same.x2 === same.d1 ? `${same.out}` : 'crash'],
              ['resize d1', `${resized.out}`],
            ]}
          />
        </Controls>
        <div style={{ width: '100%', display: 'grid', gap: '0.55rem' }}>
          <label htmlFor="q21b-answer" style={{ fontWeight: 700, fontSize: 'var(--step--1)', color: 'var(--ink-2)' }}>
            Your answer to Q2.1b (2–3 sentences): what are the trade-offs of centre cropping?
          </label>
          <textarea
            id="q21b-answer"
            className={u.answer}
            value={text}
            placeholder="Cropping throws away… Padding instead would… Interpolating…"
            onChange={(e) => {
              setText(e.target.value)
              setChecked(false)
            }}
          />
          <Controls>
            <Button primary onClick={() => setChecked(true)} disabled={text.trim().length < 20}>
              Check my points
            </Button>
            <Button onClick={() => setShowModel((v) => !v)}>{showModel ? 'Hide the model answer' : 'Show a model answer'}</Button>
            {checked && <Readout items={[['key points covered', `${nHits} of 4`]]} />}
          </Controls>
          {checked && (
            <div className={u.points} aria-live="polite">
              {POINTS.map((p, i) => (
                <div key={p.id} className={u.point}>
                  <span className={`${u.factIcon} ${hits[i] ? u.good : u.bad}`}>{hits[i] ? '✓' : '·'}</span>
                  <span>
                    <b>{p.label}.</b> {hits[i] ? 'Covered.' : p.hint}
                  </span>
                </div>
              ))}
              <div style={{ color: 'var(--ink-3)', fontSize: 12.5 }}>
                This checker only looks for key words; a human marks the real exam, so make each point in a clear sentence.
              </div>
            </div>
          )}
          {showModel && (
            <div className={u.model}>
              <b>Model answer.</b> Cropping throws away the outer ring of every skip feature map, so detail near the image border never reaches the decoder, and the
              output (110 × 110 for a 256 × 256 input) is smaller than the input, so large images have to be processed as overlapping tiles. Using padding=1
              ("same" convolutions) instead keeps every map the same size, so the skip and decoder maps line up without cropping, at the cost of a little more compute
              and less reliable predictions at the zero-padded border. Interpolating or padding the decoder map also makes the shapes match, but it invents or
              stretches values instead of keeping only real ones.
              <div style={{ marginTop: '0.45rem', color: 'var(--ink-2)' }}>
                Bonus point: the question says the original U-Net used padding=1, but the 2015 paper actually used unpadded convolutions and cropping (a 572 × 572
                input gave a 388 × 388 output); padding=1 is the common modern variant.
              </div>
            </div>
          )}
        </div>
      </div>
    </Figure>
  )
}
