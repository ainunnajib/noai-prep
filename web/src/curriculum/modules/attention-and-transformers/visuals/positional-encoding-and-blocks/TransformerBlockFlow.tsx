import { useState, type ReactNode } from 'react'
import { Figure, Controls, Segmented, Slider, Readout, usePlayer, PlayerControls, useContainerWidth } from '../../../../../kit'
import { fmtInt } from './pe'
import s from './peb.module.css'

/*
  One Transformer block (original post-norm layout), drawn top to bottom with the tensor shape on
  every arrow. Step through the sub-layers, switch between an encoder block, an encoder-decoder
  decoder block and a GPT-style decoder-only block, and choose how many blocks to stack.
*/

type Mode = 'encoder' | 'decoder' | 'gpt'
type Id = 'input' | 'attn' | 'norm1' | 'cross' | 'norm2' | 'ffn' | 'normF' | 'output'

interface StepInfo {
  id: Id
  title: string
  text: ReactNode
  shape: string
}

const MODES: { value: Mode; label: string }[] = [
  { value: 'encoder', label: 'Encoder' },
  { value: 'decoder', label: 'Decoder' },
  { value: 'gpt', label: 'GPT-style' },
]

const ADD_NORM = (what: string, sum: string): ReactNode => (
  <>
    <b>Add:</b> a <i>residual connection</i> carries the input round the {what} and adds it back, <code>{sum}</code>,
    so the sub-layer only has to learn a <i>change</i>, and gradients get a direct path backwards. <b>Norm:</b> LayerNorm rescales each token's
    d_model numbers to mean 0 and variance 1, then applies learned γ and β.
  </>
)

function stepsFor(mode: Mode): StepInfo[] {
  const masked = mode !== 'encoder'
  const T = mode === 'decoder' ? 'T_tgt' : 'T'
  const out: StepInfo[] = [
    {
      id: 'input',
      title: mode === 'encoder' ? 'Token embeddings + positions' : 'Tokens so far + positions',
      text:
        mode === 'encoder' ? (
          <>Each token becomes a vector of d_model numbers (its embedding), and its positional encoding is added on top.</>
        ) : mode === 'decoder' ? (
          <>The target-language words produced so far (for translation), embedded, with positional encodings added.</>
        ) : (
          <>The text so far, one vector per token, with positions added (GPT-2 learns its position embeddings).</>
        ),
      shape: `(B, ${T}, d_model)`,
    },
    {
      id: 'attn',
      title: masked ? 'Masked multi-head self-attention' : 'Multi-head self-attention',
      text: masked ? (
        <>
          Tokens talk, but only to the past. A <b>causal mask</b> lets position t look at positions 0 … t only, so the model cannot peek at the
          word it is meant to predict.
        </>
      ) : (
        <>
          Tokens talk: every token looks at <b>every</b> other token (no mask, so context flows both ways) and mixes in what it needs, using the
          multi-head attention from the previous lesson.
        </>
      ),
      shape: `weights (B, h, ${T}, ${T}) → output (B, ${T}, d_model)`,
    },
    { id: 'norm1', title: 'Add & Norm', text: ADD_NORM('attention', 'x + SelfAttention(x)'), shape: `(B, ${T}, d_model)` },
  ]
  if (mode === 'decoder')
    out.push(
      {
        id: 'cross',
        title: 'Multi-head cross-attention',
        text: (
          <>
            <b>Queries</b> come from the decoder (the line above); <b>keys and values</b> come from the encoder's output, the encoded source sentence.
            Each target word looks up the source words it needs. No causal mask here: the whole source sentence is already known.
          </>
        ),
        shape: 'weights (B, h, T_tgt, T_src) → output (B, T_tgt, d_model)',
      },
      { id: 'norm2', title: 'Add & Norm', text: ADD_NORM('cross-attention', 'x + CrossAttention(x, enc)'), shape: '(B, T_tgt, d_model)' },
    )
  out.push(
    {
      id: 'ffn',
      title: 'Position-wise feed-forward network',
      text: (
        <>
          Tokens think alone. The same small network runs on every token separately: <code>Linear(d_model → d_ff)</code>, ReLU,{' '}
          <code>Linear(d_ff → d_model)</code>, usually with d_ff = 4 × d_model. No token looks at another here; only attention mixes tokens.
        </>
      ),
      shape: `(B, ${T}, d_model) → (B, ${T}, d_ff) → (B, ${T}, d_model)`,
    },
    { id: 'normF', title: 'Add & Norm', text: ADD_NORM('feed-forward network', 'x + FFN(x)'), shape: `(B, ${T}, d_model)` },
    {
      id: 'output',
      title: 'Out to the next block',
      text:
        mode === 'encoder' ? (
          <>
            Same shape as the input, so identical blocks stack: 6 in the original Transformer, 12 in BERT-base. After the last one, a task head
            (for example a classifier on the first token's vector) reads the result.
          </>
        ) : mode === 'decoder' ? (
          <>Same shape as the input, so blocks stack. After the last one, a linear layer and softmax give the probabilities of the next word.</>
        ) : (
          <>
            GPT models are just a tall stack of these (12 in GPT-2 small): no encoder and no cross-attention. Each position's final vector predicts
            the next token. (GPT-2 and later put each LayerNorm <i>before</i> its sub-layer, but the parts are the same.)
          </>
        ),
      shape: `(B, ${T}, d_model)`,
    },
  )
  return out
}

const PER_BLOCK: Record<Mode, number> = { encoder: 3152384, decoder: 4204032, gpt: 3152384 }

interface Box {
  id: Id
  y: number
  h: number
  lines: string[]
  sub?: string
  icon?: 'full' | 'causal' | 'cross'
}

function MaskIcon({ x, y, kind, on }: { x: number; y: number; kind: 'full' | 'causal' | 'cross'; on: boolean }) {
  const n = 4
  const c = 4.5
  return (
    <g aria-hidden="true">
      {Array.from({ length: n }, (_, r) =>
        Array.from({ length: kind === 'cross' ? 5 : n }, (_, k) => {
          const blocked = kind === 'causal' && k > r
          return (
            <rect
              key={`${r}-${k}`}
              x={x + k * c}
              y={y + r * c}
              width={c - 0.8}
              height={c - 0.8}
              style={{ fill: blocked ? 'var(--surface)' : on ? 'var(--accent)' : 'var(--ink-2)', stroke: blocked ? 'var(--rule)' : 'none', strokeWidth: 0.5, opacity: blocked ? 1 : 0.8 }}
            />
          )
        }),
      )}
    </g>
  )
}

export default function TransformerBlockFlow() {
  const [mode, setMode] = useState<Mode>('encoder')
  const [N, setN] = useState(6)
  const steps = stepsFor(mode)
  const player = usePlayer({ steps: steps.length, interval: 2600 })
  const cur = steps[Math.min(player.step, steps.length - 1)]
  const [ref, width] = useContainerWidth<HTMLDivElement>(540)

  // ---- geometry (real pixels) ----
  const avail = Math.max(300, Math.min(width, 560))
  const x0 = 60
  const sideW = mode === 'decoder' ? 96 : 14
  const boxW = Math.min(270, avail - x0 - sideW)
  const W = x0 + boxW + sideW // the drawing is exactly as wide as its content, then centred
  const cx = x0 + boxW / 2
  const gap = 30
  const big = 42
  const small = 26

  const order: { id: Id; h: number; lines: string[]; sub?: string; icon?: Box['icon'] }[] = [
    { id: 'input', h: big, lines: ['Embeddings +', 'positional encoding'] },
    { id: 'attn', h: big, lines: mode === 'encoder' ? ['Multi-head', 'self-attention'] : ['Masked multi-head', 'self-attention'], icon: mode === 'encoder' ? 'full' : 'causal' },
    { id: 'norm1', h: small, lines: ['Add & Norm'] },
    ...(mode === 'decoder'
      ? [
          { id: 'cross' as Id, h: big, lines: ['Multi-head', 'cross-attention'], icon: 'cross' as const },
          { id: 'norm2' as Id, h: small, lines: ['Add & Norm'] },
        ]
      : []),
    { id: 'ffn', h: big, lines: ['Feed-forward network'], sub: 'd → d_ff → d, each token alone' },
    { id: 'normF', h: small, lines: ['Add & Norm'] },
    { id: 'output', h: big, lines: ['Output', '(to the next block)'] },
  ]
  const boxes: Box[] = []
  let y = 10
  for (const b of order) {
    if (b.id === 'attn') y += 14 // room for the block frame
    if (b.id === 'output') y += 26 // room for the frame and its label
    boxes.push({ ...b, y })
    y += b.h + gap
  }
  const H = y - gap + 10
  const box = (id: Id) => boxes.find((b) => b.id === id)!
  const frameTop = box('attn').y - 12
  const frameBottom = box('normF').y + small + 12
  const pairs: [Id, Id][] = mode === 'decoder' ? [['attn', 'norm1'], ['cross', 'norm2'], ['ffn', 'normF']] : [['attn', 'norm1'], ['ffn', 'normF']]
  const stack = Math.min(N - 1, 11)
  const T = mode === 'decoder' ? 'T_tgt' : 'T'

  const isOn = (id: Id) => cur.id === id
  const go = (id: Id) => {
    player.pause()
    player.setStep(steps.findIndex((st) => st.id === id))
  }

  return (
    <Figure
      wide
      title="Inside one Transformer block"
      caption={
        <>
          Press <b>Play</b> or tap any box to see what it does and the tensor shape it outputs. The green bypass lines are the residual connections.
          Switch between an encoder block (BERT), a decoder block from an encoder–decoder translator, and a GPT-style decoder-only block: decoders add
          a causal mask, and only the encoder–decoder kind has cross-attention. Then choose how many blocks to stack.
        </>
      }
    >
      <Controls>
        <Segmented
          label="block type"
          value={mode}
          onChange={(m) => {
            setMode(m)
            player.reset()
          }}
          options={MODES}
        />
        <Slider label="blocks stacked N" value={N} min={1} max={12} step={1} onChange={setN} />
      </Controls>

      <div ref={ref} style={{ width: '100%', maxWidth: 560 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} role="img" style={{ display: 'block', maxWidth: '100%', margin: '0 auto' }} aria-label={`Transformer ${mode} block diagram. Current step: ${cur.title}, shape ${cur.shape}.`}>
          <defs>
            <marker id="tbf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" style={{ fill: 'var(--ink-2)' }} />
            </marker>
            <marker id="tbf-arrow-res" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" style={{ fill: 'var(--viz-3)' }} />
            </marker>
          </defs>

          {/* the stack of N blocks, drawn as cards behind the frame */}
          {Array.from({ length: stack }, (_, k) => {
            const off = (stack - k) * 1.6
            return (
              <rect
                key={`st${k}`}
                x={x0 - 40 - off}
                y={frameTop + off}
                width={boxW + 50}
                height={frameBottom - frameTop}
                rx={12}
                style={{ fill: 'var(--surface)', stroke: 'var(--rule)', strokeWidth: 1 }}
              />
            )
          })}
          <rect x={x0 - 40} y={frameTop} width={boxW + 50} height={frameBottom - frameTop} rx={12} style={{ fill: 'var(--surface)', stroke: 'var(--ink-2)', strokeWidth: 1.4, strokeDasharray: '6 4' }} />
          <text x={x0 - 38} y={frameTop - 5} style={{ fill: 'var(--ink-2)', fontSize: 11.5, fontWeight: 800 }}>
            × {N}
          </text>

          {/* main arrows with shapes */}
          {boxes.slice(0, -1).map((b, k) => {
            const nb = boxes[k + 1]
            const y1 = b.y + b.h
            const y2 = nb.y
            const label = b.id === 'ffn' || b.id === 'input' || b.id.startsWith('norm') ? `(B, ${T}, d)` : ''
            return (
              <g key={`ar${b.id}`}>
                <line x1={cx} y1={y1} x2={cx} y2={y2 - 1} markerEnd="url(#tbf-arrow)" style={{ stroke: 'var(--ink-2)', strokeWidth: 1.6 }} />
                {label && (
                  <text x={cx + 8} y={(y1 + y2) / 2 + (b.id === 'input' ? -3 : 0)} dy="0.35em" style={{ fill: 'var(--ink-2)', fontSize: 10.5, fontFamily: 'var(--font-mono)' }}>
                    {label}
                  </text>
                )}
                {mode === 'decoder' && nb.id === 'cross' && (
                  <text x={cx - 6} y={y2 - 7} dy="0.35em" textAnchor="end" style={{ fill: 'var(--accent)', fontSize: 11, fontWeight: 800 }}>
                    Q
                  </text>
                )}
              </g>
            )
          })}

          {/* residual connections */}
          {pairs.map(([from, to]) => {
            const f = box(from)
            const t = box(to)
            const yb = from === 'attn' ? f.y - 7 : f.y - gap / 2
            const xr = x0 - 24
            const on = isOn(to)
            return (
              <g key={`res${to}`}>
                <path
                  d={`M${cx},${yb} H${xr + 6} Q${xr},${yb} ${xr},${yb + 6} V${t.y + t.h / 2 - 6} Q${xr},${t.y + t.h / 2} ${xr + 6},${t.y + t.h / 2} H${x0 - 2}`}
                  markerEnd="url(#tbf-arrow-res)"
                  style={{ fill: 'none', stroke: 'var(--viz-3)', strokeWidth: on ? 3.2 : 1.8, opacity: on ? 1 : 0.75 }}
                />
                <circle cx={cx} cy={yb} r={3} style={{ fill: 'var(--viz-3)' }} />
              </g>
            )
          })}

          {/* encoder output feeding cross-attention */}
          {mode === 'decoder' &&
            (() => {
              const c = box('cross')
              const ex = x0 + boxW + 12
              const ew = W - ex - 4
              const ey = c.y - 66
              return (
                <g>
                  <rect x={ex} y={ey} width={ew} height={44} rx={8} style={{ fill: 'color-mix(in srgb, var(--viz-5) 16%, var(--surface))', stroke: 'var(--viz-5)', strokeWidth: 1.4 }} />
                  <text x={ex + ew / 2} y={ey + 15} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 10.5, fontWeight: 800 }}>
                    encoder
                  </text>
                  <text x={ex + ew / 2} y={ey + 28} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 10.5, fontWeight: 800 }}>
                    output
                  </text>
                  <text x={ex + ew / 2} y={ey + 40} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                    (B,T_src,d)
                  </text>
                  <path d={`M${ex + ew / 2},${ey + 44} V${c.y + c.h / 2} H${x0 + boxW + 2}`} markerEnd="url(#tbf-arrow)" style={{ fill: 'none', stroke: 'var(--viz-5)', strokeWidth: 1.8 }} />
                  <text x={ex + ew / 2 + 6} y={ey + 58} style={{ fill: 'var(--viz-5)', fontSize: 11, fontWeight: 800 }}>
                    K, V
                  </text>
                </g>
              )
            })()}

          {/* the boxes */}
          {boxes.map((b) => {
            const on = isOn(b.id)
            const isNorm = b.id.startsWith('norm')
            const outside = b.id === 'input' || b.id === 'output'
            const tx = b.icon ? cx - 10 : cx
            return (
              <g
                key={b.id}
                onClick={() => go(b.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    go(b.id)
                  }
                }}
                tabIndex={0}
                style={{ cursor: 'pointer' }}
                role="button"
                aria-label={`Show step: ${steps.find((st) => st.id === b.id)?.title}`}
              >
                <rect
                  x={x0}
                  y={b.y}
                  width={boxW}
                  height={b.h}
                  rx={isNorm ? 6 : 9}
                  style={{
                    fill: on ? 'color-mix(in srgb, var(--accent) 20%, var(--surface))' : isNorm ? 'color-mix(in srgb, var(--viz-3) 12%, var(--surface))' : outside ? 'var(--surface-2)' : 'color-mix(in srgb, var(--viz-1) 9%, var(--surface))',
                    stroke: on ? 'var(--accent)' : 'var(--ink-2)',
                    strokeWidth: on ? 2.6 : 1.2,
                    transition: 'fill 0.3s, stroke 0.3s',
                  }}
                />
                {b.lines.map((ln, k) => (
                  <text
                    key={k}
                    x={tx}
                    y={b.y + b.h / 2 + (k - (b.lines.length - 1 + (b.sub ? 1 : 0)) / 2) * 14}
                    dy="0.35em"
                    textAnchor="middle"
                    style={{ fill: 'var(--ink)', fontSize: 12.5, fontWeight: 700, pointerEvents: 'none' }}
                  >
                    {ln}
                  </text>
                ))}
                {b.sub && (
                  <text x={tx} y={b.y + b.h / 2 + 7} dy="0.35em" textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 10.5, pointerEvents: 'none' }}>
                    {b.sub}
                  </text>
                )}
                {b.icon && <MaskIcon x={x0 + boxW - (b.icon === 'cross' ? 30 : 26)} y={b.y + b.h / 2 - 9} kind={b.icon} on={on} />}
              </g>
            )
          })}
        </svg>
      </div>

      <PlayerControls player={player} label={(st) => `Step ${st + 1} of ${steps.length}`} />
      <div className={s.stepCard} aria-live="polite">
        <div className={s.stepTitle}>{cur.title}</div>
        <div className={s.stepText}>{cur.text}</div>
        <div className={s.stepShape}>shape: {cur.shape}</div>
      </div>

      <Readout
        items={[
          ['parameters per block (d_model 512, d_ff 2048, h 8)', fmtInt(PER_BLOCK[mode])],
          [`${N} block${N === 1 ? '' : 's'}`, fmtInt(N * PER_BLOCK[mode])],
        ]}
      />
    </Figure>
  )
}
