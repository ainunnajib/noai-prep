import { useState } from 'react'
import { Figure, Controls, Segmented, Slider, Readout, useNarrow, useContainerWidth, M } from '../../../../../kit'
import { HawkerScene, PATCHES, PatchGrid, type PatchLabel } from './scene'
import s from './vlm.module.css'

/*
  Two ways to let text tokens look at a picture.
  - LLaVA-style: image tokens are concatenated in front of the text tokens and the LLM's ordinary
    (causal) SELF-attention runs over the one sequence, so Q, K and V all come from the mixed sequence.
  - Flamingo-style: a new CROSS-attention layer takes Q from the text tokens and K, V from the image
    tokens; a tanh gate (starting at 0) decides how much of the result is added to the frozen LLM.
  Weights are ILLUSTRATIVE: hand-set relevance scores passed through a real softmax.
*/

const WORDS = ['How', 'much', 'is', 'the', 'chicken', 'rice', '?']
const NI = 16
const NT = WORDS.length

/** relevance of each word to each kind of patch (unlisted pairs score 0) */
const AFF: Partial<Record<PatchLabel, number>>[] = [
  { price: 1.4, sign: 0.4 },
  { price: 3.2, sign: 0.5 },
  {},
  { plate: 0.4, price: 0.4, cat: 0.3 },
  { plate: 2.2, sign: 1.6, pot: 0.6 },
  { plate: 2.2, sign: 1.6, pot: 0.6 },
  { price: 1.8, plate: 1.0 },
]
/** extra relevance between words (query, key, bonus); every word also gets +1 for itself */
const TXT: [number, number, number][] = [
  [1, 0, 1.6],
  [2, 1, 0.8],
  [3, 2, 0.5],
  [5, 4, 2.0],
  [6, 0, 1.0],
  [6, 1, 1.0],
]
const FLAT: PatchLabel[] = PATCHES.flat()

const softmax = (z: number[]) => {
  const m = Math.max(...z)
  const e = z.map((x) => Math.exp(x - m))
  const t = e.reduce((a, b) => a + b, 0)
  return e.map((x) => x / t)
}

type Mode = 'concat' | 'cross'

/** attention row of text token t: weights over [16 image tokens, text tokens 0..NT-1] (masked text = 0) */
function row(t: number, mode: Mode): number[] {
  const img = FLAT.map((lab) => AFF[t][lab] ?? 0)
  if (mode === 'cross') return [...softmax(img), ...new Array(NT).fill(0)]
  const txt = WORDS.map((_, j) => (j === t ? 1 : 0) + TXT.filter(([q, k]) => q === t && k === j).reduce((a, [, , b]) => a + b, 0))
  const allowed = WORDS.map((_, j) => j <= t)
  const scores = [...img, ...txt.filter((_, j) => allowed[j])]
  const w = softmax(scores)
  return [...w.slice(0, NI), ...WORDS.map((_, j) => (allowed[j] ? w[NI + j] : 0))]
}

export default function SelfVsCrossAttention() {
  const [mode, setMode] = useState<Mode>('concat')
  const [sel, setSel] = useState(1)
  const [alpha, setAlpha] = useState(0)
  const [twoRef, narrow] = useNarrow<HTMLDivElement>(600)
  const [gRef, gWidth] = useContainerWidth<HTMLDivElement>(340)

  const rows = WORDS.map((_, t) => row(t, mode))
  const r = rows[sel]
  const imgShare = r.slice(0, NI).reduce((a, b) => a + b, 0)
  const top3 = FLAT.map((_, k) => k).sort((a, b) => r[b] - r[a]).slice(0, 3)
  // colour intensity from the absolute weight (square root so small weights stay visible)
  const shade = (w: number) => Math.min(1, Math.sqrt(w / 0.6))
  const gate = Math.tanh(alpha)

  // ---- attention grid geometry
  const cols = mode === 'concat' ? NI + NT : NI
  const GW = Math.max(260, Math.min(gWidth, 420))
  const labW = 60
  const cell = Math.max(8, Math.min(18, Math.floor((GW - labW - 6) / cols)))
  const gx = labW
  const gy = 104
  const GH = gy + NT * cell + 30

  const src = (who: 'text' | 'image' | 'both') =>
    who === 'text' ? 'var(--viz-1)' : who === 'image' ? 'var(--viz-3)' : 'url(#mixfill)'
  const qkv: [string, 'text' | 'image' | 'both', string][] =
    mode === 'concat'
      ? [
          ['Q', 'both', 'image + text tokens'],
          ['K', 'both', 'image + text tokens'],
          ['V', 'both', 'image + text tokens'],
        ]
      : [
          ['Q', 'text', 'text tokens'],
          ['K', 'image', 'image tokens'],
          ['V', 'image', 'image tokens'],
        ]

  return (
    <Figure
      wide
      title="Self-attention or cross-attention: where do K and V come from?"
      caption={
        <>
          Tap a word of the question to make it the query, and watch where it looks in the picture. <b>Try:</b>
          <ol className="try">
            <li>
              In <b>concatenate</b> mode (LLaVA-style) the image tokens sit in the same sequence as the words, so the word's weight is shared between patches and
              earlier words.
            </li>
            <li>
              Switch to <b>cross-attention</b> (Flamingo-style): queries come from the words, keys and values only from the picture, so all the weight goes to
              patches.
            </li>
            <li>Slide the gate: at 0 the picture adds nothing and the frozen LLM behaves exactly as before.</li>
          </ol>
          <b>Notice:</b> the attention maths is identical; only the source of K and V changes.
          <span className="fine">The weights are illustrative (hand-set scores through a real softmax).</span>
        </>
      }
    >
      <Controls>
        <Segmented<Mode>
          label="how the picture gets in"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'concat', label: 'concatenate' },
            { value: 'cross', label: 'cross-attention' },
          ]}
        />
      </Controls>

      <div className={s.tokRow} role="group" aria-label="Choose the query word">
        {WORDS.map((w, i) => (
          <button key={i} type="button" className={s.tokBtn} aria-pressed={sel === i} onClick={() => setSel(i)}>
            {w}
          </button>
        ))}
      </div>
      <p className={s.hint}>Tap a word: it becomes the query.</p>

      <div ref={twoRef} className={`${s.twoUp} ${narrow ? s.twoUpNarrow : ''}`}>
        <div>
          <p className={s.panelTitle}>Where “{WORDS[sel]}” looks in the picture</p>
          <svg viewBox="0 0 100 100" className={s.svgFull} style={{ maxWidth: 300, margin: '0 auto' }} role="img" aria-label={`Attention from ${WORDS[sel]} over the 16 patches`}>
            <HawkerScene />
            {FLAT.map((_, k) => {
              const i = Math.floor(k / 4)
              const j = k % 4
              return <rect key={k} x={j * 25} y={i * 25} width={25} height={25} style={{ fill: 'var(--viz-4)', opacity: 0.05 + 0.65 * shade(r[k]) }} />
            })}
            {/* % labels only on the three strongest patches, tucked into a corner so the picture stays readable */}
            {top3.map((k) => {
              const i = Math.floor(k / 4)
              const j = k % 4
              return (
                <text
                  key={`t${k}`}
                  x={j * 25 + 23.5}
                  y={i * 25 + 6.5}
                  textAnchor="end"
                  style={{ fill: 'var(--ink)', fontSize: 5, fontWeight: 800, paintOrder: 'stroke', stroke: 'var(--surface)', strokeWidth: 1.4, strokeLinejoin: 'round' }}
                >
                  {Math.round(r[k] * 100)}%
                </text>
              )
            })}
            <PatchGrid n={4} color="var(--viz-ink)" width={0.5} />
          </svg>
          <p className={s.split}>
            {mode === 'concat' ? (
              <>
                {Math.round(imgShare * 100)}% of the attention from “{WORDS[sel]}” goes to the picture, and {100 - Math.round(imgShare * 100)}% to {sel === 0 ? 'the word itself' : 'itself and earlier words'}.
              </>
            ) : (
              <>Cross-attention only looks at the picture: the 16 patches share 100%.</>
            )}
          </p>
        </div>

        <div ref={gRef}>
          <p className={s.panelTitle}>{mode === 'concat' ? 'One sequence, one self-attention' : 'Two sequences, one cross-attention'}</p>
          <svg viewBox={`0 0 ${GW} ${GH}`} className={s.svgFull} role="img" aria-label="Where queries, keys and values come from, and the attention weights of the text tokens">
            <defs>
              <linearGradient id="mixfill" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0.5" style={{ stopColor: 'var(--viz-3)' }} />
                <stop offset="0.5" style={{ stopColor: 'var(--viz-1)' }} />
              </linearGradient>
            </defs>
            {qkv.map(([name, who, txt], k) => (
              <g key={name} transform={`translate(0,${4 + k * 22})`}>
                <rect x={0} y={0} width={24} height={18} rx={4} style={{ fill: src(who) }} />
                <text x={12} y={13} textAnchor="middle" style={{ fill: 'var(--surface)', fontSize: 12, fontWeight: 800 }}>
                  {name}
                </text>
                <text x={32} y={13} style={{ fill: 'var(--ink)', fontSize: 12 }}>
                  from the {txt}
                </text>
              </g>
            ))}
            {/* key headers */}
            {Array.from({ length: cols }, (_, c) => (
              <rect key={`h${c}`} x={gx + c * cell + 1} y={gy - 12} width={cell - 2} height={8} rx={2} style={{ fill: c < NI ? 'var(--viz-3)' : 'var(--viz-1)' }} />
            ))}
            <text x={gx} y={gy - 18} style={{ fill: 'var(--ink-2)', fontSize: 11.5 }}>
              keys: {mode === 'concat' ? '16 patches, then the words' : '16 patches'}
            </text>
            {/* rows */}
            {WORDS.map((w, t) => (
              <g key={`r${t}`} onClick={() => setSel(t)} style={{ cursor: 'pointer' }}>
                <text x={labW - 6} y={gy + t * cell + cell / 2 + 4} textAnchor="end" style={{ fill: t === sel ? 'var(--viz-1)' : 'var(--ink-2)', fontSize: Math.min(11.5, cell + 1), fontWeight: t === sel ? 800 : 500, fontFamily: 'var(--font-mono)' }}>
                  {w}
                </text>
                {Array.from({ length: cols }, (_, c) => {
                  const masked = mode === 'concat' && c >= NI && c - NI > t
                  const v = rows[t][c]
                  return (
                    <rect
                      key={c}
                      x={gx + c * cell}
                      y={gy + t * cell}
                      width={cell - 1}
                      height={cell - 1}
                      style={{
                        fill: masked ? 'var(--surface-3)' : `color-mix(in srgb, var(--viz-4) ${Math.round(4 + 86 * shade(v))}%, var(--surface))`,
                        stroke: t === sel ? 'var(--viz-1)' : 'none',
                        strokeWidth: t === sel ? 0.8 : 0,
                      }}
                    />
                  )
                })}
              </g>
            ))}
            <rect x={gx - 2} y={gy + sel * cell - 2} width={cols * cell + 3} height={cell + 3} rx={3} style={{ fill: 'none', stroke: 'var(--viz-1)', strokeWidth: 2 }} />
            <text x={gx} y={gy + NT * cell + 18} style={{ fill: 'var(--ink-2)', fontSize: 11.5 }}>
              {mode === 'concat' ? 'grey = masked: a word cannot see later words' : 'rows: text queries · each row sums to 100%'}
            </text>
          </svg>
        </div>
      </div>

      {mode === 'cross' && (
        <Controls>
          <Slider label={<>gate <M>{'\\alpha'}</M> (starts at 0)</>} value={alpha} min={0} max={3} step={0.1} onChange={setAlpha} format={(v) => v.toFixed(1)} />
          <Readout
            items={[[<M key="t">{'\\tanh(\\alpha)'}</M>, gate.toFixed(2)]]}
          />
          {/* what reaches the next layer for the chosen word: its own vector plus the gated picture information */}
          <div className={s.gateMeter} aria-label={`For “${WORDS[sel]}”, the picture adds ${Math.round(gate * 100)}% of its cross-attention result`} role="img">
            <span className={s.gateLabel}>what “{WORDS[sel]}” passes on</span>
            <span className={s.gateBar}>
              <span style={{ flex: '0 0 60%', background: 'color-mix(in srgb, var(--viz-1) 45%, var(--surface))' }}>the word itself</span>
              <span style={{ flex: `0 0 ${40 * gate}%`, background: 'color-mix(in srgb, var(--viz-3) 45%, var(--surface))' }}>{gate > 0.85 ? 'from the picture' : gate > 0.3 ? 'picture' : ''}</span>
            </span>
          </div>
          <p className={s.split} style={{ width: '100%', textAlign: 'left' }}>
            Flamingo adds the result as <M>{'\\mathbf{x} \\leftarrow \\mathbf{x} + \\tanh(\\alpha)\\,\\mathrm{CrossAttn}(\\mathbf{x}, \\text{image})'}</M>.{' '}
            {gate < 0.005
              ? 'With the gate at 0 the word vectors pass through unchanged: the LLM is exactly the original, frozen model.'
              : `The cross-attention result is scaled by ${gate.toFixed(2)} before it is added. As training raises α, the picture is blended in gradually.`}
          </p>
        </Controls>
      )}
    </Figure>
  )
}
