import { useMemo, useState } from 'react'
import { Figure, Bars, useContainerWidth } from '../../../../../kit'
import { Thumb, ThumbG } from './Thumb'
import { IMAGES, REGIONS, cosine, encodeText, imageEmbedding, mapPosition, type ImageId, type Vec } from './toyClip'
import s from './clip.module.css'

/*
  One space for images and words. Image and caption embeddings from the toy CLIP live in the same
  space, so search in either direction is "compute cosines, sort". The map is a flattened picture
  of the space; the ranked lists use the true cosine similarity.
*/

const IMGS: ImageId[] = ['cat', 'dog', 'bird', 'train', 'bicycle', 'laksa', 'chickenrice', 'sunset']
const CAPTIONS = [
  'a cat asleep on a sofa',
  'a dog chasing a ball',
  'a bird on a branch',
  'an MRT train at the station',
  'a red bicycle',
  'a bowl of spicy laksa',
  'chicken rice on a plate',
  'sunset over the sea',
  'a kitten playing with a ball',
  'a bus on the road',
  'noodles for lunch',
  'birds flying over the sea at sunset',
]
const SUGGEST = ['a pet playing with a ball', 'a sleepy cat', 'something to eat', 'a vehicle with wheels', 'a bird flying over the sea', 'something red']

const IMG_V = IMGS.map(imageEmbedding)
const CAP_V = CAPTIONS.map((c) => encodeText(c).v)
const IMG_P = IMG_V.map((v) => mapPosition(v) as [number, number])
const CAP_P = CAP_V.map((v) => mapPosition(v) as [number, number])
const fmt = (v: number) => v.toFixed(2).replace('-', '−')

/** Where to draw a typed query: by its concepts, or (for colour-only text) near the images it matches. */
function queryPosition(v: Vec): [number, number] | null {
  const p = mapPosition(v)
  if (p) return p
  let sx = 0
  let sy = 0
  let sw = 0
  IMG_V.forEach((iv, i) => {
    const c = Math.max(0, cosine(iv, v))
    sx += c * c * IMG_P[i][0]
    sy += c * c * IMG_P[i][1]
    sw += c * c
  })
  return sw < 1e-9 ? null : [sx / sw, sy / sw]
}

type Sel = { kind: 'query' } | { kind: 'image'; i: number }

export default function JointEmbeddingSpace() {
  const [text, setText] = useState(SUGGEST[0])
  const [sel, setSel] = useState<Sel>({ kind: 'query' })
  const [ref, width] = useContainerWidth<HTMLDivElement>(560)

  const q = useMemo(() => encodeText(text), [text])
  const qPos = q.known ? queryPosition(q.v) : null

  // ---- geometry
  const W = Math.max(280, Math.min(width, 760))
  const H = Math.round(Math.max(300, Math.min(460, W * 0.7)))
  const pad = 26
  const tsz = W < 420 ? 30 : W < 600 ? 36 : 44
  const px = (x: number) => pad + ((x + 1.15) / 2.3) * (W - 2 * pad)
  const py = (y: number) => pad + ((1.15 - y) / 2.3) * (H - 2 * pad)

  // nudge items apart (display only) so thumbnails and caption markers do not cover each other
  const layout = useMemo(() => {
    const items = [
      ...IMG_P.map(([x, y]) => ({ x: px(x), y: py(y), x0: px(x), y0: py(y), r: tsz / 2 + 3 })),
      ...CAP_P.map(([x, y]) => ({ x: px(x), y: py(y), x0: px(x), y0: py(y), r: 7 })),
    ]
    for (let it = 0; it < 80; it++) {
      for (let a = 0; a < items.length; a++)
        for (let b = a + 1; b < items.length; b++) {
          const A = items[a]
          const B = items[b]
          let dx = B.x - A.x
          let dy = B.y - A.y
          let d = Math.hypot(dx, dy)
          const need = A.r + B.r
          if (d >= need) continue
          if (d < 1e-6) {
            dx = 1
            dy = 0.4
            d = Math.hypot(dx, dy)
          }
          const push = (need - d) / 2
          A.x -= (dx / d) * push
          A.y -= (dy / d) * push
          B.x += (dx / d) * push
          B.y += (dy / d) * push
        }
      for (const P of items) {
        P.x += (P.x0 - P.x) * 0.05
        P.y += (P.y0 - P.y) * 0.05
        P.x = Math.max(P.r, Math.min(W - P.r, P.x))
        P.y = Math.max(P.r + 12, Math.min(H - P.r - 12, P.y))
      }
    }
    return { img: items.slice(0, IMGS.length), cap: items.slice(IMGS.length) }
  }, [W, H, tsz]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---- rankings
  const queryRank = IMGS.map((id, i) => ({ i, id, c: cosine(IMG_V[i], q.v) })).sort((a, b) => b.c - a.c)
  const selImg = sel.kind === 'image' ? sel.i : -1
  const capRank = selImg >= 0 ? CAPTIONS.map((t, j) => ({ j, t, c: cosine(IMG_V[selImg], CAP_V[j]) })).sort((a, b) => b.c - a.c) : []
  const bestCap = IMG_V.map((iv) => CAP_V.map((cv) => cosine(iv, cv)).reduce((bi, c, j, arr) => (c > arr[bi] ? j : bi), 0))

  const hiCaps = new Set(capRank.slice(0, 3).map((r) => r.j))
  const hiImgs = sel.kind === 'query' && qPos ? new Set(queryRank.slice(0, 3).filter((r) => r.c >= 0.15).map((r) => r.i)) : new Set<number>()
  const qx = qPos ? Math.max(10, Math.min(W - 10, px(qPos[0]))) : 0
  const qy = qPos ? Math.max(10, Math.min(H - 10, py(qPos[1]))) : 0

  const pickImage = (i: number) => setSel({ kind: 'image', i })

  // label placement: highlighted captions first, then (on roomy maps) the rest if they fit
  type Box = { x0: number; y0: number; x1: number; y1: number }
  const boxes: Box[] = layout.img.map((p) => ({ x0: p.x - tsz / 2 - 2, y0: p.y - tsz / 2 - 2, x1: p.x + tsz / 2 + 2, y1: p.y + tsz / 2 + 2 }))
  if (qPos) boxes.push({ x0: qx - 10, y0: qy - 22, x1: qx + 70, y1: qy + 10 })
  const hit = (b: Box) => boxes.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0)
  const order = [...capRank.slice(0, 3).map((r) => r.j), ...CAPTIONS.map((_, j) => j).filter((j) => !hiCaps.has(j))]
  const labels: { j: number; x: number; y: number; anchor: 'start' | 'end'; text: string; hi: boolean }[] = []
  const compact = W < 520 // phones: numbered badges on the map instead of text labels
  for (const j of order) {
    const hi = hiCaps.has(j)
    if (compact) continue
    const p = layout.cap[j]
    const text = CAPTIONS[j].length > 30 ? CAPTIONS[j].slice(0, 29) + '…' : CAPTIONS[j]
    const w = text.length * (hi ? 6.4 : 5.8)
    const sides: ('start' | 'end')[] = p.x < W / 2 ? ['start', 'end'] : ['end', 'start']
    // try right/left of the marker, then just above/below it; highlighted labels are placed even if crowded
    const spots: { anchor: 'start' | 'end'; x: number; y: number }[] = []
    for (const anchor of sides) spots.push({ anchor, x: p.x + (anchor === 'start' ? 9 : -9), y: p.y + 4 })
    for (const dy of [-12, 16]) spots.push({ anchor: sides[0], x: p.x + (sides[0] === 'start' ? -4 : 4), y: p.y + dy })
    const boxOf = (sp: { anchor: 'start' | 'end'; x: number; y: number }) =>
      sp.anchor === 'start' ? { x0: sp.x, y0: sp.y - 13, x1: sp.x + w, y1: sp.y + 1 } : { x0: sp.x - w, y0: sp.y - 13, x1: sp.x, y1: sp.y + 1 }
    const inside = (b: Box) => b.x0 >= 2 && b.x1 <= W - 2 && b.y0 >= 2 && b.y1 <= H - 2
    let pick = spots.find((sp) => inside(boxOf(sp)) && !hit(boxOf(sp)))
    if (!pick && hi) pick = spots.find((sp) => inside(boxOf(sp))) ?? spots[0]
    if (pick) {
      boxes.push(boxOf(pick))
      labels.push({ j, x: pick.x, y: pick.y, anchor: pick.anchor, text, hi })
    }
  }

  return (
    <Figure
      wide
      title="One space for pictures and words"
      caption={
        <>
          Pictures and captions are both arrows in the same embedding space, so searching in <i>either</i> direction is the same job: compute cosine similarities and
          sort. Type your own search text (or tap a suggestion) to find the closest pictures; tap a picture to find its closest captions. Mixed ideas land between
          the groups, e.g. <i>a bird flying over the sea</i>. The map is a flattened sketch of a 40-dimensional toy space (points are nudged so they do not overlap), so
          trust the numbers in the list, which are true cosine similarities. Our toy text encoder knows about 170 words (grey ones are ignored filler; struck-through ones are unknown to it).
        </>
      }
    >
      <div className={s.searchRow}>
        <label className={s.inputLabel} htmlFor="jes-q">
          Search text
        </label>
        <input
          id="jes-q"
          className={s.input}
          type="text"
          value={text}
          maxLength={80}
          spellCheck={false}
          onChange={(e) => {
            setText(e.target.value)
            setSel({ kind: 'query' })
          }}
          onFocus={() => setSel({ kind: 'query' })}
        />
      </div>
      <div className={s.chips} role="group" aria-label="Suggested searches">
        {SUGGEST.map((t) => (
          <button
            key={t}
            type="button"
            className={s.chip}
            onClick={() => {
              setText(t)
              setSel({ kind: 'query' })
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div className={s.tokens} aria-live="polite">
        <span>Encoder read:</span>
        {q.tokens.length === 0 && <span>(nothing yet)</span>}
        {q.tokens.map((t, k) => (
          <span key={k} className={`${s.tok} ${t.kind === 'stop' ? s.tokStop : ''} ${t.kind === 'unknown' ? s.tokUnknown : ''} ${t.kind === 'ambiguous' ? s.tokAmb : ''}`} title={t.kind === 'stop' ? 'filler word, ignored' : t.kind === 'unknown' ? 'not in the toy vocabulary' : t.sense ?? 'known word'}>
            {t.word}
          </span>
        ))}
      </div>

      <div className={s.full}>
        <div ref={ref} className={s.full}>
          <svg className={s.svgFull} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Map of the joint embedding space with pictures, captions and your search text">
            <rect x={0} y={0} width={W} height={H} rx={10} style={{ fill: 'var(--surface-2)' }} />
            {REGIONS.map((r) => (
              <text
                key={r.label}
                x={Math.max(40, Math.min(W - 40, px(r.at[0])))}
                y={r.at[1] > 0 ? 15 : H - 7}
                textAnchor="middle"
                style={{ fill: 'var(--ink-3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                {r.label}
              </text>
            ))}
            {/* each picture to its best caption, faintly */}
            {IMGS.map((_, i) => {
              const a = layout.img[i]
              const b = layout.cap[bestCap[i]]
              return <line key={`b${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} style={{ stroke: 'var(--viz-muted)', strokeWidth: 1.2, strokeDasharray: '3 3' }} />
            })}
            {/* highlighted links */}
            {selImg >= 0 &&
              capRank.slice(0, 3).map((r, k) => {
                const a = layout.img[selImg]
                const b = layout.cap[r.j]
                return <line key={`hc${k}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} style={{ stroke: 'var(--viz-2)', strokeWidth: 1 + Math.max(0, r.c) * 4, opacity: 0.9 }} />
              })}
            {sel.kind === 'query' &&
              qPos &&
              queryRank
                .slice(0, 3)
                .filter((r) => r.c >= 0.15)
                .map((r, k) => {
                const b = layout.img[r.i]
                return <line key={`hq${k}`} x1={qx} y1={qy} x2={b.x} y2={b.y} style={{ stroke: 'var(--viz-4)', strokeWidth: 1 + Math.max(0, r.c) * 4, opacity: 0.9 }} />
              })}
            {/* captions */}
            {CAPTIONS.map((t, j) => {
              const p = layout.cap[j]
              const hi = hiCaps.has(j)
              return (
                <g key={`c${j}`}>
                  <rect x={p.x - 5} y={p.y - 5} width={10} height={10} transform={`rotate(45 ${p.x} ${p.y})`} style={{ fill: hi ? 'var(--viz-2)' : 'color-mix(in srgb, var(--viz-2) 55%, var(--surface))', stroke: 'var(--surface)', strokeWidth: 1.5 }}>
                    <title>{t}</title>
                  </rect>
                </g>
              )
            })}
            {/* images */}
            {IMGS.map((id, i) => {
              const p = layout.img[i]
              const on = selImg === i || hiImgs.has(i)
              return (
                <g
                  key={id}
                  className={s.mapItem}
                  role="button"
                  tabIndex={0}
                  aria-label={`Picture: ${IMAGES[id].name}. Show its closest captions.`}
                  onClick={() => pickImage(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      pickImage(i)
                    }
                  }}
                >
                  {on && <rect x={p.x - tsz / 2 - 4} y={p.y - tsz / 2 - 4} width={tsz + 8} height={tsz + 8} rx={9} style={{ fill: 'none', stroke: selImg === i ? 'var(--viz-2)' : 'var(--viz-4)', strokeWidth: 3 }} />}
                  <ThumbG id={id} x={p.x - tsz / 2} y={p.y - tsz / 2} size={tsz} />
                </g>
              )
            })}
            {/* caption labels, drawn last so they sit on top; placed greedily so they never overlap */}
            {labels.map((l) => (
              <text
                key={`l${l.j}`}
                x={l.x}
                y={l.y}
                textAnchor={l.anchor}
                style={{
                  fill: l.hi ? 'var(--ink)' : 'var(--ink-3)',
                  fontSize: l.hi ? 11.5 : 10.5,
                  fontWeight: l.hi ? 700 : 500,
                  paintOrder: 'stroke',
                  stroke: 'var(--surface-2)',
                  strokeWidth: 4,
                  strokeLinejoin: 'round',
                }}
              >
                {l.text}
              </text>
            ))}
            {compact &&
              capRank.slice(0, 3).map((r, k) => {
                const p = layout.cap[r.j]
                const bx = p.x + (p.x < W / 2 ? 11 : -11)
                return (
                  <g key={`n${r.j}`}>
                    <circle cx={bx} cy={p.y - 8} r={7.5} style={{ fill: 'var(--viz-2)', stroke: 'var(--surface)', strokeWidth: 1.5 }} />
                    <text x={bx} y={p.y - 4.5} textAnchor="middle" style={{ fill: 'var(--surface)', fontSize: 10, fontWeight: 800 }}>
                      {k + 1}
                    </text>
                  </g>
                )
              })}
            {/* the search text */}
            {qPos && (
              <g style={{ opacity: sel.kind === 'query' ? 1 : 0.55 }}>
                <path
                  d={`M${qx},${qy - 9} L${qx + 2.6},${qy - 2.8} L${qx + 8.6},${qy - 2.8} L${qx + 3.8},${qy + 1.4} L${qx + 5.6},${qy + 8} L${qx},${qy + 4} L${qx - 5.6},${qy + 8} L${qx - 3.8},${qy + 1.4} L${qx - 8.6},${qy - 2.8} L${qx - 2.6},${qy - 2.8} Z`}
                  style={{ fill: 'var(--viz-4)', stroke: 'var(--surface)', strokeWidth: 1.5 }}
                />
                <text
                  x={qx + (qx < W / 2 ? 11 : -11)}
                  y={qy - 8}
                  textAnchor={qx < W / 2 ? 'start' : 'end'}
                  style={{ fill: 'var(--viz-4)', fontSize: 11.5, fontWeight: 750, paintOrder: 'stroke', stroke: 'var(--surface-2)', strokeWidth: 4, strokeLinejoin: 'round' }}
                >
                  your text
                </text>
              </g>
            )}
          </svg>
        </div>

        <div className={s.legend} aria-hidden="true" style={{ margin: '0.4rem 0 0.8rem' }}>
          <span>picture (tap one)</span>
          <span>
            <span className={s.swatch} style={{ background: 'var(--viz-2)', transform: 'rotate(45deg) scale(0.75)' }} />
            caption
          </span>
          <span style={{ color: 'var(--viz-4)', fontWeight: 700 }}>★ your text</span>
        </div>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          {sel.kind === 'query' ? (
            <>
              <p className={s.listTitle}>Top 5 pictures for your text</p>
              {q.known ? (
                <Bars
                  ariaLabel="Pictures ranked by cosine similarity to your text"
                  format={fmt}
                  max={1}
                  data={queryRank.slice(0, 5).map((r, k) => ({
                    label: (
                      <span className={s.thumbLabel}>
                        <Thumb id={r.id} size={22} title={IMAGES[r.id].name} />
                        {IMAGES[r.id].label}
                      </span>
                    ),
                    value: Math.max(0, r.c),
                    strong: k === 0,
                    color: k < 3 ? 'var(--viz-4)' : 'var(--viz-muted)',
                  }))}
                />
              ) : (
                <p className={s.hint} style={{ textAlign: 'left' }}>
                  None of these words are in the toy's vocabulary, so the text has no direction yet. Try a suggestion.
                </p>
              )}
            </>
          ) : (
            <>
              <p className={s.listTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Thumb id={IMGS[selImg]} size={26} title={IMAGES[IMGS[selImg]].name} /> Top 5 captions for this picture
              </p>
              <Bars
                ariaLabel="Captions ranked by cosine similarity to the picture"
                format={fmt}
                max={1}
                data={capRank.slice(0, 5).map((r, k) => ({ label: `${k + 1}. ${r.t}`, value: Math.max(0, r.c), strong: k === 0, color: k < 3 ? 'var(--viz-2)' : 'var(--viz-muted)' }))}
              />
            </>
          )}
        </div>
      </div>
    </Figure>
  )
}
