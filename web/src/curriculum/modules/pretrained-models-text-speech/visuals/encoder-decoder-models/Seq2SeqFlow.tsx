import { useEffect, useState } from 'react'
import { Figure, Controls, Toggle, Readout, usePlayer, PlayerControls, useContainerWidth } from '../../../../../kit'
import { EXAMPLES, weights } from './align'
import s from './ed.module.css'

/*
  How an encoder-decoder translates. The encoder reads the whole source sentence once and leaves one vector per
  source word ("memory"). The decoder then writes the output one token per step: it reads <s> plus everything
  written so far (causal self-attention), looks back at the memory with cross-attention, and predicts the next token.
  The training view shows teacher forcing: the whole correct output, shifted right, in a single pass.
*/

// the English → Malay example without the full stop, so every token fits on a phone
const EX = { ...EXAMPLES[0], source: EXAMPLES[0].source.slice(0, 5), target: EXAMPLES[0].target.slice(0, 4), focus: EXAMPLES[0].focus.slice(0, 4) }
const SRC = EX.source
const OUT = [...EX.target, '</s>']
// </s>: "is the whole sentence covered?" spreads its attention, a little more on the last word
const ATT = [...weights(EX), [0.15, 0.15, 0.15, 0.15, 0.4]]

export default function Seq2SeqFlow() {
  const player = usePlayer({ steps: OUT.length, interval: 1300 })
  // open mid-sentence, so the first view already shows the decoder looking back at the input
  useEffect(() => {
    player.setStep(2)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [training, setTraining] = useState(false)
  const [wrapRef, measured] = useContainerWidth<HTMLDivElement>(600)
  const step = player.step // decoder is producing OUT[step]

  const W = Math.max(300, Math.min(700, measured))
  const narrow = W < 460
  const pad = 10
  const fs = narrow ? 11.5 : 13.5
  const nS = SRC.length
  const nT = OUT.length
  const sx = (j: number) => pad + 6 + ((j + 0.5) * (W - 2 * pad - 12)) / nS
  const tx = (i: number) => pad + 6 + ((i + 0.5) * (W - 2 * pad - 12)) / nT
  const chipW = (txt: string) => Math.max(26, txt.length * fs * 0.58 + 10)

  const yLabS = 14
  const ySrc = 36
  const encTop = 54
  const encH = 46
  const yMem = encTop + encH + 22
  const decTop = yMem + 92
  const decH = 46
  const yIn = decTop + decH + 30
  const yOut = yIn + 50
  const H = yOut + 32
  // small labels sit on a halo of the figure background so lines behind them never cut through the text
  const halo = { stroke: 'var(--surface)', strokeWidth: 4, paintOrder: 'stroke' as const, strokeLinejoin: 'round' as const }

  const inputs = ['<s>', ...OUT.slice(0, -1)]
  const shownIn = training ? nT : step + 1 // decoder input positions visible
  const att = ATT[step]

  const chip = (x: number, y: number, txt: string, kind: 'plain' | 'on' | 'new' | 'ghost') => {
    const w = chipW(txt)
    const fill =
      kind === 'on'
        ? 'color-mix(in srgb, var(--viz-2) 22%, var(--surface))'
        : kind === 'new'
          ? 'color-mix(in srgb, var(--viz-3) 24%, var(--surface))'
          : kind === 'ghost'
            ? 'transparent'
            : 'var(--surface-2)'
    const stroke = kind === 'on' ? 'var(--viz-2)' : kind === 'new' ? 'var(--viz-3)' : 'var(--rule)'
    return (
      <g key={`${x}-${y}-${txt}`}>
        <rect x={x - w / 2} y={y - 13} width={w} height={22} rx={6} style={{ fill, stroke, strokeWidth: 1.4, strokeDasharray: kind === 'ghost' ? '3 3' : undefined }} />
        <text x={x} y={y + 2} textAnchor="middle" style={{ fill: kind === 'ghost' ? 'var(--ink-3)' : 'var(--ink)', fontSize: fs, fontWeight: kind === 'plain' || kind === 'ghost' ? 600 : 800 }}>
          {txt}
        </text>
      </g>
    )
  }

  return (
    <Figure
      wide
      title="An encoder-decoder translating, one token at a time"
      caption={
        <>
          Press <b>Play</b> or <b>Next</b>. The encoder reads the whole English sentence in one go, with no mask, and leaves one vector per word (the
          "memory"). The decoder then writes Malay one token per step: it reads <code>&lt;s&gt;</code> plus everything written so far, uses
          cross-attention (orange lines) to look back at the memory, and predicts the next token, until it writes <code>&lt;/s&gt;</code>. Count the
          passes: the encoder runs once, the decoder once per output token. Then switch on the training view.
        </>
      }
    >
      <div ref={wrapRef} className="plot-wrap" style={{ maxWidth: 700 }}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Encoder-decoder data flow" style={{ width: '100%', height: 'auto', display: 'block' }}>
          <text x={pad} y={yLabS} style={{ fill: 'var(--ink-3)', fontSize: 11, fontWeight: 700 }}>
            source (English)
          </text>
          {SRC.map((w, j) => chip(sx(j), ySrc, w, 'plain'))}

          {/* encoder */}
          <rect x={pad} y={encTop} width={W - 2 * pad} height={encH} rx={10} style={{ fill: 'color-mix(in srgb, var(--viz-1) 12%, var(--surface))', stroke: 'var(--viz-1)', strokeWidth: 1.5 }} />
          <text x={W / 2} y={encTop + 19} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 13, fontWeight: 800 }}>
            ENCODER {narrow ? '' : '· self-attention with no mask'}
          </text>
          <text x={W / 2} y={encTop + 36} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 11.5 }}>
            reads every source word at once · runs once
          </text>

          {/* memory */}
          {SRC.map((_, j) => (
            <g key={`m${j}`}>
              <line x1={sx(j)} y1={encTop + encH} x2={sx(j)} y2={yMem - 8} style={{ stroke: 'var(--viz-1)', strokeWidth: 1.5 }} />
              <rect x={sx(j) - 8} y={yMem - 8} width={16} height={16} rx={3} style={{ fill: 'var(--viz-1)', opacity: 0.85 }} />
            </g>
          ))}

          {/* cross-attention from the current query position to the memory */}
          {!training &&
            att.map((v, j) => (
              <line
                key={`a${j}`}
                x1={tx(step)}
                y1={decTop}
                x2={sx(j)}
                y2={yMem + 9}
                style={{ stroke: 'var(--viz-2)', strokeWidth: 0.6 + 8 * v, opacity: 0.25 + 0.75 * v }}
                strokeLinecap="round"
              />
            ))}
          {training &&
            OUT.map((_, i) =>
              SRC.map((__, j) => (
                <line key={`t${i}-${j}`} x1={tx(i)} y1={decTop} x2={sx(j)} y2={yMem + 9} style={{ stroke: 'var(--viz-2)', strokeWidth: 0.4 + 3 * ATT[i][j], opacity: 0.12 + 0.5 * ATT[i][j] }} />
              )),
            )}

          <text x={W - pad} y={yMem + 26} textAnchor="end" style={{ fill: 'var(--ink-3)', fontSize: 11, fontWeight: 700, ...halo }}>
            memory: keys and values
          </text>

          {/* decoder */}
          <rect x={pad} y={decTop} width={W - 2 * pad} height={decH} rx={10} style={{ fill: 'color-mix(in srgb, var(--viz-5) 13%, var(--surface))', stroke: 'var(--viz-5)', strokeWidth: 1.5 }} />
          <text x={W / 2} y={decTop + 19} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 13, fontWeight: 800 }}>
            DECODER {narrow ? '' : '· causal self-attention + cross-attention'}
          </text>
          <text x={W / 2} y={decTop + 36} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 11.5 }}>
            {training ? 'training: all positions in one pass' : `runs once per output token · pass ${step + 1}`}
          </text>

          {/* decoder inputs and predictions */}
          <text x={pad} y={yIn + 25} style={{ fill: 'var(--ink-3)', fontSize: 11, fontWeight: 700, ...halo }}>
            {training ? '↑ decoder input: the correct output, shifted right' : '↑ decoder input: <s> + everything written so far'}
          </text>
          {inputs.map((w, i) => (i < shownIn ? chip(tx(i), yIn, w, !training && i === step ? 'on' : 'plain') : chip(tx(i), yIn, '·', 'ghost')))}
          {inputs.map((_, i) =>
            i < shownIn ? (
              <g key={`u${i}`}>
                <line x1={tx(i)} y1={yIn - 13} x2={tx(i)} y2={decTop + decH + 5} style={{ stroke: 'var(--viz-muted)', strokeWidth: 1.2 }} />
                <path d={`M${tx(i)},${decTop + decH + 1} l-4,6 l8,0 z`} style={{ fill: 'var(--viz-muted)' }} />
              </g>
            ) : null,
          )}
          <text x={pad} y={yOut + 25} style={{ fill: 'var(--ink-3)', fontSize: 11, fontWeight: 700, ...halo }}>
            {training ? 'targets: one per position, all at once' : 'decoder output: predicted next token'}
          </text>
          {OUT.map((w, i) => (i < shownIn ? chip(tx(i), yOut, w, !training && i === step ? 'new' : 'plain') : chip(tx(i), yOut, '?', 'ghost')))}
        </svg>
      </div>

      {!training && <PlayerControls player={player} label={(st) => `writing token ${st + 1} of ${OUT.length}`} />}
      <Controls>
        <Toggle label="training view (teacher forcing)" checked={training} onChange={setTraining} />
        <Readout
          items={[
            ['encoder passes', '1'],
            ['decoder passes', training ? '1 (all positions)' : String(step + 1)],
            ['new token', training ? '–' : OUT[step]],
          ]}
        />
      </Controls>
      <p className={s.hint}>
        {training ? (
          <>
            <b>Training:</b> we already know the correct translation, so the decoder is fed all of it at once, shifted right by one (<code>&lt;s&gt;</code>{' '}
            first), and predicts every next token in a single pass. A causal mask stops each position from seeing the word it must predict. Feeding the
            true previous words instead of the model's own guesses is called <b>teacher forcing</b>.
          </>
        ) : (
          <>
            <b>Generating:</b> the decoder's newest position (orange) asks "which source words matter for the next word?" Here "
            {inputs[step]}" leads to "<b>{OUT[step]}</b>", and its strongest cross-attention goes to "{SRC[att.indexOf(Math.max(...att))]}".
          </>
        )}
      </p>
    </Figure>
  )
}
