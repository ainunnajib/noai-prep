import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, usePlayer, PlayerControls, useContainerWidth } from '../../../../../kit'
import { HawkerScene, PatchGrid } from './scene'
import s from './vlm.module.css'

/*
  How a LLaVA-style vision-language model reads a picture:
  picture → patches → frozen vision encoder → small trained projector → image tokens placed in front
  of the text tokens → the LLM reads one long sequence and answers.
  The learner steps through the stages and changes the vision encoder / image size (so the number
  of image tokens) and the number of pictures, and watches the context window fill up.
*/

const CONFIGS = [
  { id: 'b32', short: 'B/32 · 224', enc: 'CLIP ViT-B/32', size: 224, patch: 32, dim: 768 },
  { id: 'b16', short: 'B/16 · 224', enc: 'CLIP ViT-B/16', size: 224, patch: 16, dim: 768 },
  { id: 'l14', short: 'L/14 · 224', enc: 'CLIP ViT-L/14', size: 224, patch: 14, dim: 1024 },
  { id: 'l14x', short: 'L/14 · 336', enc: 'CLIP ViT-L/14', size: 336, patch: 14, dim: 1024 },
] as const
type ConfigId = (typeof CONFIGS)[number]['id']

const QUESTION = ['How', 'much', 'is', 'the', 'chicken', 'rice', '?']
const ANSWER = 'It costs $4.50.'
const LLM_DIM = 4096
const CONTEXT = 4096
const fmt = (n: number) => n.toLocaleString('en-GB')

const STEPS = [
  'A picture and a question',
  'Cut the picture into patches',
  'Vision encoder (frozen)',
  'Projector (trained)',
  'One sequence of tokens',
  'The LLM answers',
]

export default function ImageTokensToLLM() {
  const [cfgId, setCfgId] = useState<ConfigId>('l14x')
  const [pics, setPics] = useState(1)
  const player = usePlayer({ steps: STEPS.length, interval: 1800 })
  const step = player.step
  const [ref, width] = useContainerWidth<HTMLDivElement>(680)

  const cfg = CONFIGS.find((c) => c.id === cfgId)!
  const n = cfg.size / cfg.patch
  const N = n * n
  const T = QUESTION.length
  const imgTotal = N * pics
  const total = imgTotal + T
  const over = total > CONTEXT

  // ---------- layout (real pixels) ----------
  const W = Math.max(300, Math.min(width, 760))
  const narrow = W < 520
  const P = Math.round(Math.max(100, Math.min(170, W * 0.24)))
  const gap = narrow ? 22 : 34
  const boxW = (W - 16 - P - 2 * gap) / 2
  const y1 = 22
  const bx1 = 8 + P + gap
  const bx2 = bx1 + boxW + gap
  const yStrip = y1 + P + 60
  const stripH = 26
  const yBar = yStrip + stripH + 30
  const yLLM = yBar + 58
  const llmH = 46
  const H = yLLM + llmH + 16
  const fs = narrow ? 10.5 : 12
  const vis = (k: number) => (step >= k ? 1 : 0.35)
  // changing the encoder or the number of pictures jumps to the token sequence, so the change is not hidden in a dimmed stage
  const reveal = () => {
    if (step < 4) player.setStep(4)
  }
  const cur = (k: number) => step === k

  // token strip: a few image squares, an ellipsis with the count, then the text tokens
  const charW = narrow ? 5.4 : 6.6
  const chipW = (w: string) => Math.max(15, w.length * charW + (narrow ? 9 : 10))
  const textChips = narrow ? [`${QUESTION.length} text tokens`] : QUESTION
  const textW = textChips.reduce((a, w) => a + chipW(w) + 3, 0)
  const sq = narrow ? 9 : 13
  const dotsLabel = (k: number) => `… ${fmt(k)} …`
  const avail = W - 16 - textW - 8
  const fitsAll = imgTotal * (sq + 2) <= avail
  // the dashed box is sized from its label (widest case: all but 2 squares hidden)
  const dw = Math.max(narrow ? 46 : 58, dotsLabel(imgTotal).length * (narrow ? 5.6 : 6.6) + 12)
  const shownSq = fitsAll ? imgTotal : Math.max(2, Math.floor((avail - dw - 4) / (sq + 2)))
  const needDots = !fitsAll
  const lastSq = needDots ? Math.min(2, Math.floor(shownSq / 2)) : 0
  const firstSq = needDots ? shownSq - lastSq : shownSq
  let cx = 8
  const strip: JSX.Element[] = []
  for (let i = 0; i < firstSq; i++, cx += sq + 2) strip.push(<rect key={`a${i}`} x={cx} y={yStrip + (stripH - sq) / 2} width={sq} height={sq} rx={2} style={{ fill: 'var(--viz-3)' }} />)
  if (needDots) {
    strip.push(
      <g key="dots">
        <rect x={cx} y={yStrip + 2} width={dw} height={stripH - 4} rx={4} style={{ fill: 'color-mix(in srgb, var(--viz-3) 18%, var(--surface))', stroke: 'var(--viz-3)', strokeDasharray: '3 2' }} />
        <text x={cx + dw / 2} y={yStrip + stripH / 2 + 4} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: fs - 1, fontWeight: 700 }}>
          {dotsLabel(imgTotal - firstSq - lastSq)}
        </text>
      </g>,
    )
    cx += dw + 2
    for (let i = 0; i < lastSq; i++, cx += sq + 2) strip.push(<rect key={`b${i}`} x={cx} y={yStrip + (stripH - sq) / 2} width={sq} height={sq} rx={2} style={{ fill: 'var(--viz-3)' }} />)
  }
  const imgMid = Math.max(20, (cx - 8) / 2)
  const textStart = cx + 8
  let tx = textStart
  for (const [i, w] of textChips.entries()) {
    const cw = chipW(w)
    strip.push(
      <g key={`t${i}`}>
        <rect x={tx} y={yStrip + 1} width={cw} height={stripH - 2} rx={5} style={{ fill: 'color-mix(in srgb, var(--viz-1) 18%, var(--surface))', stroke: 'var(--viz-1)', strokeWidth: 1.2 }} />
        <text x={tx + cw / 2} y={yStrip + stripH / 2 + 4} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: narrow ? 9.5 : fs - 0.5, fontFamily: 'var(--font-mono)' }}>
          {w}
        </text>
      </g>,
    )
    tx += cw + 3
  }

  const barW = W - 16
  const gW = Math.min(1, imgTotal / CONTEXT) * barW
  const tW = Math.min(1 - Math.min(1, imgTotal / CONTEXT), T / CONTEXT) * barW

  const box = (x: number, k: number, title: string[], sub: string[], badge: string, badgeColour: string) => (
    <g style={{ opacity: vis(k) }}>
      <rect x={x} y={y1} width={boxW} height={P} rx={10} style={{ fill: 'var(--surface-2)', stroke: cur(k) ? 'var(--accent)' : 'var(--rule)', strokeWidth: cur(k) ? 2.5 : 1.5 }} />
      {title.map((tt, i) => (
        <text key={i} x={x + boxW / 2} y={y1 + 20 + i * (fs + 3)} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: fs + 0.5, fontWeight: 800 }}>
          {tt}
        </text>
      ))}
      {sub.map((tt, i) => (
        <text key={i} x={x + boxW / 2} y={y1 + 24 + title.length * (fs + 3) + i * (fs + 2)} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: fs - 0.5 }}>
          {tt}
        </text>
      ))}
      <rect x={x + boxW / 2 - 30} y={y1 + P - 24} width={60} height={17} rx={8.5} style={{ fill: `color-mix(in srgb, ${badgeColour} 20%, var(--surface))`, stroke: badgeColour }} />
      <text x={x + boxW / 2} y={y1 + P - 12} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 10, fontWeight: 800, letterSpacing: '0.04em' }}>
        {badge}
      </text>
    </g>
  )
  const arrowR = (x0: number, x1: number, y: number, k: number) => (
    <g style={{ opacity: vis(k) }}>
      <line x1={x0 + 3} x2={x1 - 7} y1={y} y2={y} style={{ stroke: 'var(--viz-axis)', strokeWidth: 2 }} />
      <path d={`M${x1 - 2},${y} l-7,-4.5 v9 Z`} style={{ fill: 'var(--viz-axis)' }} />
    </g>
  )
  const arrowD = (x: number, y0: number, y1_: number, k: number, label?: string) => (
    <g style={{ opacity: vis(k) }}>
      <line x1={x} x2={x} y1={y0 + 3} y2={y1_ - 7} style={{ stroke: 'var(--viz-axis)', strokeWidth: 2 }} />
      <path d={`M${x},${y1_ - 1} l-4.5,-7 h9 Z`} style={{ fill: 'var(--viz-axis)' }} />
      {label && (
        <text x={x + 8} y={(y0 + y1_) / 2 + 4} style={{ fill: 'var(--ink-2)', fontSize: fs - 1 }}>
          {label}
        </text>
      )}
    </g>
  )

  const explain = [
    <>A user sends this photo and asks <i>How much is the chicken rice?</i> An LLM can only read tokens, so the picture has to become tokens too.</>,
    <>
      The vision encoder is a ViT. At {cfg.size} × {cfg.size} pixels with {cfg.patch} × {cfg.patch}-pixel patches, each side holds {cfg.size} ÷ {cfg.patch} = {n} patches, so
      the picture becomes {n} × {n} = <b>{fmt(N)}</b> patches, one token each.
    </>,
    <>
      A pretrained {cfg.enc} turns every patch into a vector of <b>{fmt(cfg.dim)}</b> numbers describing what is in it. CLIP training already tied these vectors to
      words, which is why CLIP encoders are the usual choice. Its weights stay <b>frozen</b>.
    </>,
    <>
      A small trained network (LLaVA-1.5 uses a 2-layer MLP) maps each {fmt(cfg.dim)}-number vector to {fmt(LLM_DIM)} numbers, the size of the LLM's word embeddings. Each patch
      now looks to the LLM like a word: an <b>image token</b>.
    </>,
    <>
      The image tokens are placed in front of the question's text tokens. {pics === 1 ? 'This one picture uses' : `These ${pics} pictures use`} <b>{fmt(imgTotal)}</b> tokens, about as many as a{' '}
      {fmt(Math.round((imgTotal * 0.75) / 10) * 10)}-word essay.{' '}
      {over ? <span className={s.warn}>That is more than the 4,096-token context window, so it does not fit.</span> : `Together with the question that is ${fmt(total)} of the 4,096-token window.`}
    </>,
    over ? (
      <>
        <span className={s.warn}>The sequence does not fit, so the LLM cannot read it.</span> A real system has to drop some pictures, shrink them, or squeeze each
        picture into fewer tokens with a small resampler (Flamingo, later in this lesson, uses just 64 tokens per picture).
      </>
    ) : (
      <>
        The LLM reads the whole sequence with its ordinary self-attention, so every text token can look at every image token. It then writes the answer one token at a
        time: <i>{ANSWER}</i>
      </>
    ),
  ]

  return (
    <Figure
      wide
      title="How a picture becomes tokens an LLM can read"
      caption={
        <>
          Step through the pipeline of a LLaVA-style model. Then change the vision encoder and image size, and the number of pictures in the chat: halving the patch size
          quadruples the image tokens, and a few high-resolution pictures can fill the LLM's whole context window. Notice how little is new: a frozen CLIP encoder, a
          pretrained LLM, and a small trained bridge between them.
        </>
      }
    >
      <div ref={ref} className={s.full}>
        <svg className={s.svgFull} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Pipeline: picture, ${fmt(N)} patches, vision encoder, projector, ${fmt(total)} tokens, LLM answer`}>
          {/* picture */}
          <text x={8} y={14} style={{ fill: 'var(--ink-2)', fontSize: fs - 1, fontWeight: 700 }}>
            {cfg.size} × {cfg.size} px
          </text>
          <g transform={`translate(8,${y1}) scale(${P / 100})`}>
            <HawkerScene />
            {step >= 1 && <PatchGrid n={n} color="var(--viz-ink)" width={n > 12 ? 0.35 : 0.7} />}
          </g>
          <rect x={8} y={y1} width={P} height={P} rx={4} style={{ fill: 'none', stroke: cur(0) || cur(1) ? 'var(--accent)' : 'var(--rule)', strokeWidth: cur(0) || cur(1) ? 2.5 : 1.5 }} />
          {step >= 1 && (
            <text x={8 + P / 2} y={y1 + P + 16} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: fs, fontWeight: 800 }}>
              {n} × {n} = {fmt(N)} patches
            </text>
          )}
          {arrowR(8 + P, bx1, y1 + P / 2, 2)}
          {box(bx1, 2, narrow ? ['Vision', 'encoder'] : ['Vision encoder'], narrow ? [cfg.enc.replace('CLIP ', ''), `${fmt(N)} × ${fmt(cfg.dim)}`] : [cfg.enc, `out: ${fmt(N)} vectors`, `× ${fmt(cfg.dim)} numbers`], 'FROZEN', 'var(--viz-1)')}
          {arrowR(bx1 + boxW, bx2, y1 + P / 2, 3)}
          {box(bx2, 3, ['Projector'], narrow ? ['MLP', `${fmt(cfg.dim)}→${fmt(LLM_DIM)}`] : ['small MLP', `${fmt(cfg.dim)} → ${fmt(LLM_DIM)}`, 'numbers per token'], 'TRAINED', 'var(--viz-2)')}
          {/* projector output → the image-token part of the sequence (elbow arrow) */}
          <g style={{ opacity: vis(4) }}>
            <path
              d={`M${bx2 + boxW / 2},${y1 + P + 3} V${y1 + P + 30} H${8 + imgMid} V${yStrip - 9}`}
              style={{ fill: 'none', stroke: 'var(--viz-3)', strokeWidth: 2, strokeLinejoin: 'round' }}
            />
            <path d={`M${8 + imgMid},${yStrip - 2} l-4.5,-7 h9 Z`} style={{ fill: 'var(--viz-3)' }} />
          </g>
          <g style={{ opacity: vis(4) }}>
            <text x={W - 8} y={yStrip - 8} textAnchor="end" style={{ fill: 'var(--ink)', fontSize: fs, fontWeight: 800 }}>
              {fmt(imgTotal)} image tokens + {T} text tokens
            </text>
            {strip}
            <rect x={8} y={yBar} width={barW} height={14} rx={7} style={{ fill: 'var(--surface-2)', stroke: over ? 'var(--viz-neg)' : 'var(--rule)', strokeWidth: over ? 2 : 1 }} />
            <rect x={8} y={yBar} width={gW} height={14} rx={7} style={{ fill: over ? 'var(--viz-neg)' : 'var(--viz-3)' }} />
            {!over && <rect x={8 + gW} y={yBar} width={Math.max(2, tW)} height={14} style={{ fill: 'var(--viz-1)' }} />}
            <text x={8} y={yBar + 30} style={{ fill: over ? 'var(--viz-neg)' : 'var(--ink-2)', fontSize: fs - 0.5, fontWeight: over ? 800 : 500 }}>
              context window: {fmt(total)} / {fmt(CONTEXT)} tokens ({Math.round((100 * total) / CONTEXT)}%){over ? ' — too long!' : ''}
            </text>
          </g>
          {/* LLM */}
          {arrowD(W / 2, yBar + 34, yLLM, 5)}
          <g style={{ opacity: vis(5) }}>
            <rect x={8} y={yLLM} width={W - 16} height={llmH} rx={10} style={{ fill: 'var(--surface-2)', stroke: cur(5) ? 'var(--accent)' : 'var(--rule)', strokeWidth: cur(5) ? 2.5 : 1.5 }} />
            <text x={20} y={yLLM + 19} style={{ fill: 'var(--ink)', fontSize: fs + 0.5, fontWeight: 800 }}>
              LLM {narrow ? '' : '(e.g. Vicuna-7B)'}
            </text>
            <text x={20} y={yLLM + 35} style={{ fill: 'var(--ink-2)', fontSize: fs - 1 }}>
              {narrow ? 'self-attention over all tokens' : 'reads all the tokens with ordinary self-attention'}
            </text>
            {/* the answer, or a refusal when the sequence is longer than the context window */}
            <rect
              x={W - 8 - (narrow ? 118 : 150)}
              y={yLLM + 9}
              width={narrow ? 110 : 140}
              height={28}
              rx={14}
              style={{ fill: `color-mix(in srgb, ${over ? 'var(--viz-neg)' : 'var(--viz-3)'} 22%, var(--surface))`, stroke: over ? 'var(--viz-neg)' : 'var(--viz-3)' }}
            />
            <text x={W - 8 - (narrow ? 63 : 80)} y={yLLM + 27} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: fs, fontWeight: 700 }}>
              {over ? '✗ context full' : ANSWER}
            </text>
          </g>
        </svg>
      </div>

      <div className={s.stepText} aria-live="polite">
        <span className={s.stepTitle}>
          {step + 1}. {STEPS[step]}
        </span>
        {explain[step]}
      </div>

      <PlayerControls player={player} label={(k) => `Stage ${k + 1} of ${STEPS.length}`} />

      <Controls>
        <div className={narrow ? s.encPickNarrow : undefined}>
          <Segmented<ConfigId>
            label="vision encoder · image size"
            value={cfgId}
            onChange={(v) => (setCfgId(v), reveal())}
            options={CONFIGS.map((c) => ({ value: c.id, label: c.short }))}
          />
        </div>
        <Slider label="pictures in the chat" value={pics} min={1} max={8} step={1} onChange={(v) => (setPics(v), reveal())} />
        <Readout
          items={[
            ['tokens per picture', fmt(N)],
            ['total tokens', fmt(total)],
            ['context used', `${Math.round((100 * total) / CONTEXT)}%`],
          ]}
        />
      </Controls>
    </Figure>
  )
}
