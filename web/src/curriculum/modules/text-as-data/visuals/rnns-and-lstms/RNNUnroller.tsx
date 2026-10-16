import { useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, usePlayer, PlayerControls, useContainerWidth, M } from '../../../../../kit'
import { TryNotice } from '../Caption'
import { H, wordVec, forward, influenceOf, type Model } from './rnnSim'
import st from './rnn.module.css'

/*
  The RNN unrolled along time: one column per word. Each column shows the hidden state (8 numbers)
  after reading that word, and the bottom row shows how strongly the tracked word (click any word)
  still affects the current state: ‖∂h_t/∂x_k‖ relative to its value right after reading it.
*/

/** phrases inserted between the subject and its verb, so every sentence stays grammatical */
const CHUNKS = [
  ['that', 'the', 'auntie', 'feeds'],
  ['every', 'morning'],
  ['at', 'the', 'hawker', 'centre'],
  ['near', 'my', 'block'],
]
const PAD_L = 66
const PAD_R = 6
const TOK_H = 74
const CELL = 13
const H_TOP = TOK_H + 12
const H_BOT = H_TOP + H * CELL
const INF_TOP = H_BOT + 30
const INF_H = 54
const HEIGHT = INF_TOP + INF_H + 8

const pct = (v: number) => (v >= 10 ? v.toFixed(0) : v >= 1 ? v.toFixed(1) : v >= 0.01 ? v.toFixed(2) : v.toExponential(0)) + '%'

export default function RNNUnroller() {
  const [model, setModel] = useState<Model>('rnn')
  const [extra, setExtra] = useState(2)
  const [tracked, setTracked] = useState(0)
  const words = useMemo(() => ['Cats', ...CHUNKS.slice(0, extra).flat(), 'are', 'hungry'], [extra])
  const T = words.length
  const player = usePlayer({ steps: T, interval: 650 })
  // start (and restart after changing the sentence) with every word read, so the picture is complete at rest
  useEffect(() => {
    player.setStep(T - 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [T])
  const step = Math.min(player.step, T - 1)
  const k = Math.min(tracked, T - 1)
  const xs = useMemo(() => words.map(wordVec), [words])
  const hs = useMemo(() => forward(model, xs), [model, xs])
  const infl = useMemo(() => influenceOf(model, xs, k), [model, xs, k])
  const rel = infl.map((v) => (100 * v) / infl[k])
  const maxAbs = Math.max(1e-6, ...hs.flat().map(Math.abs))

  const [ref, measured] = useContainerWidth<HTMLDivElement>(640)
  const W = Math.max(300, Math.min(760, measured))
  const cw = (W - PAD_L - PAD_R) / T
  const cx = (t: number) => PAD_L + (t + 0.5) * cw
  const angle = cw < 26 ? -90 : -55 // vertical labels when the columns are narrow
  const cellFill = (v: number) => `color-mix(in srgb, ${v < 0 ? 'var(--viz-1)' : 'var(--viz-2)'} ${Math.round((Math.abs(v) / maxAbs) * 85)}%, var(--surface))`
  const relNow = step >= k ? rel[step] : null

  return (
    <Figure
      title="An RNN reading a sentence, one word at a time"
      caption={
        <TryNotice
          tryIt={
            <>
              press <b>Play</b>, add words in the middle, then switch to the LSTM. Click any word to track it instead.
            </>
          }
          notice={
            <>
              to choose “are”, not “is”, the network must still remember at the end that “Cats” was plural. The bottom bars show “Cats” fading fast in the RNN but lasting far longer in the LSTM.
            </>
          }
          note="Each column is the hidden state after that word: 8 numbers, orange positive, blue negative. Untrained toy weights; the LSTM's forget gate is biased towards keeping."
        />
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${HEIGHT}`} width="100%" role="group" aria-label={`Unrolled ${model === 'rnn' ? 'RNN' : 'LSTM'} over ${T} words; step ${step + 1}`} style={{ display: 'block', overflow: 'visible' }}>
          {/* row labels */}
          <text x={4} y={TOK_H - 4} className="plot-label" style={{ fontSize: 12, fill: 'var(--ink-2)' }}>
            word
          </text>
          <text x={4} y={H_TOP + (H * CELL) / 2 - 4} className="plot-label" style={{ fontSize: 12, fill: 'var(--ink-2)' }}>
            state
          </text>
          <text x={4} y={H_TOP + (H * CELL) / 2 + 11} className="plot-label" style={{ fontSize: 12, fill: 'var(--ink-2)' }}>
            h
            <tspan baselineShift="sub" style={{ fontSize: 11 }}>
              t
            </tspan>
          </text>
          {/* colour key for the state cells */}
          <rect x={4} y={H_TOP + (H * CELL) / 2 + 20} width={10} height={10} rx={2} style={{ fill: 'color-mix(in srgb, var(--viz-2) 75%, var(--surface))' }} />
          <text x={17} y={H_TOP + (H * CELL) / 2 + 29} className="plot-label" style={{ fontSize: 12, fill: 'var(--ink-2)' }}>
            +
          </text>
          <rect x={30} y={H_TOP + (H * CELL) / 2 + 20} width={10} height={10} rx={2} style={{ fill: 'color-mix(in srgb, var(--viz-1) 75%, var(--surface))' }} />
          <text x={43} y={H_TOP + (H * CELL) / 2 + 29} className="plot-label" style={{ fontSize: 12, fill: 'var(--ink-2)' }}>
            −
          </text>
          <text x={4} y={INF_TOP + 14} className="plot-label" style={{ fontSize: 12, fill: 'var(--ink-2)' }}>
            influence
          </text>
          <text x={4} y={INF_TOP + 29} className="plot-label" style={{ fontSize: 12, fill: 'var(--ink-2)' }}>
            of "{words[k].toLowerCase()}"
          </text>

          {/* current column highlight */}
          <rect x={PAD_L + step * cw + 0.5} y={TOK_H - 2} width={cw - 1} height={HEIGHT - TOK_H} rx={4} style={{ fill: 'var(--accent-soft)', opacity: 0.55 }} />

          {/* shared-weights brace */}
          <line x1={PAD_L + 2} x2={W - PAD_R - 2} y1={H_TOP - 6} y2={H_TOP - 6} style={{ stroke: 'var(--viz-muted)', strokeWidth: 1, strokeDasharray: '3 3' }} />

          {words.map((w, t) => {
            const read = t <= step
            const isK = t === k
            return (
              <g key={t}>
                <text
                  x={cx(t)}
                  y={TOK_H - 6}
                  transform={`rotate(${angle} ${cx(t)} ${TOK_H - 6})`}
                  dy={angle === -90 ? '0.35em' : undefined}
                  role="button"
                  tabIndex={0}
                  className={st.word}
                  aria-label={`Track the word ${w}`}
                  onClick={() => setTracked(t)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setTracked(t)}
                  style={{
                    fontSize: 12.5,
                    fontWeight: isK || t === step ? 800 : 500,
                    fill: isK ? 'var(--viz-4)' : read ? 'var(--ink)' : 'var(--ink-3)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {w}
                </text>
                {Array.from({ length: H }, (_, j) => (
                  <rect
                    key={j}
                    x={PAD_L + t * cw + 1.5}
                    y={H_TOP + j * CELL + 0.5}
                    width={Math.max(1, cw - 3)}
                    height={CELL - 1}
                    rx={2}
                    style={{ fill: read ? cellFill(hs[t][j]) : 'var(--surface-2)', stroke: read ? 'none' : 'var(--rule)', strokeWidth: 0.6 }}
                  />
                ))}
                {read && t >= k && (
                  <rect
                    x={PAD_L + t * cw + Math.max(1.5, cw * 0.18)}
                    y={INF_TOP + INF_H - (INF_H * Math.min(100, rel[t])) / 100}
                    width={Math.max(1, cw - 2 * Math.max(1.5, cw * 0.18))}
                    height={Math.max(0.8, (INF_H * Math.min(100, rel[t])) / 100)}
                    rx={2}
                    style={{ fill: 'var(--viz-4)' }}
                  />
                )}
              </g>
            )
          })}
          <line x1={PAD_L} x2={W - PAD_R} y1={INF_TOP + INF_H + 0.5} y2={INF_TOP + INF_H + 0.5} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1 }} />
          {relNow != null && (
            <text x={Math.min(W - 30, Math.max(PAD_L + 24, cx(step)))} y={INF_TOP - 6} textAnchor="middle" className="plot-label" style={{ fontSize: 12, fill: 'var(--viz-4)' }}>
              {pct(relNow)}
            </text>
          )}
        </svg>
      </div>
      <p style={{ margin: 0, fontSize: 'var(--step--1)', color: 'var(--ink-2)', textAlign: 'center', lineHeight: 1.5 }}>
        Step {step + 1}: read <b style={{ fontFamily: 'var(--font-mono)' }}>{words[step]}</b>.
        {model === 'rnn' ? (
          <span className={st.eqLine}>
            <M>{'h_t = \\tanh(W_x x_t + W_h h_{t-1} + b)'}</M>
          </span>
        ) : (
          <>
            <span className={st.eqLine}>
              <M>{'c_t = f_t \\odot c_{t-1} + i_t \\odot \\tilde c_t'}</M>
            </span>
            <span className={st.eqLine}>
              <M>{'h_t = o_t \\odot \\tanh(c_t)'}</M>
            </span>
          </>
        )}
      </p>
      <PlayerControls player={player} label={(s) => `Word ${Math.min(s, T - 1) + 1} of ${T}`} />
      <Controls>
        <Segmented
          label="Model"
          value={model}
          onChange={setModel}
          options={[
            { value: 'rnn', label: 'Plain RNN' },
            { value: 'lstm', label: 'LSTM' },
          ]}
        />
        <Slider
          label="Words between “Cats” and “are”"
          value={extra}
          min={0}
          max={CHUNKS.length}
          step={1}
          onChange={(v) => setExtra(v)}
          format={(v) => `${CHUNKS.slice(0, v).flat().length} words`}
        />
        <Readout
          items={[
            ['tracked word', `“${words[k]}”`],
            ['its influence now', relNow == null ? 'not read yet' : pct(relNow)],
            ['at the last word', pct(rel[T - 1])],
          ]}
        />
      </Controls>
    </Figure>
  )
}
