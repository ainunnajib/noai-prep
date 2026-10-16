import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Toggle, Button, useContainerWidth, mulberry32 } from '../../../../../kit'
import { dist, divColour, peTable, randMat, selfAttention, type Mat } from './pe'
import s from './peb.module.css'

/*
  Self-attention on "the dog bites the man" with tiny 4-number embeddings and one real attention head.
  Shuffle the words: without positional encoding every word's output is exactly the same as before,
  just moved to a new place. Add the sinusoidal positional encoding and the outputs really change.
*/

const VOCAB = ['the', 'dog', 'bites', 'man']
const SENT = [0, 1, 2, 0, 3] // the dog bites the man
const T = SENT.length
const D = 4
const E = randMat(VOCAB.length, D, 2027, 0.9) // word embeddings
// seeds chosen so that, with positions on, every real shuffle visibly changes every word's output
const WQ = randMat(D, D, 1998, 0.8)
const WK = randMat(D, D, 1999, 0.8)
const WV = randMat(D, D, 2000, 0.8)
const PE = peTable(T, D)
const IDENTITY = [0, 1, 2, 3, 4]
const MAN_BITES_DOG = [0, 4, 2, 3, 1] // new position p holds original word perm[p]

function run(order: number[], usePE: boolean) {
  const X: Mat = order.map((k, p) => E[SENT[k]].map((v, j) => v + (usePE ? PE[p][j] : 0)))
  return { X, out: selfAttention(X, WQ, WK, WV).out }
}

const sameWords = (p: number[]) => p.every((k, i) => SENT[k] === SENT[i])

/** A random reordering that really changes the sentence (not just swapping the two copies of "the"). */
function randomPerm(seed: number, current: number[]) {
  const rng = mulberry32(seed)
  for (let tries = 0; tries < 50; tries++) {
    const p = [...IDENTITY]
    for (let i = p.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[p[i], p[j]] = [p[j], p[i]]
    }
    if (!sameWords(p) && !p.every((k, i) => k === current[i])) return p
  }
  return [1, 2, 3, 4, 0]
}

const mean = (M: Mat) => M[0].map((_, j) => M.reduce((a, r) => a + r[j], 0) / M.length)

function Strip({ x, y, w, h, values, max }: { x: number; y: number; w: number; h: number; values: number[]; max: number }) {
  const cw = w / values.length
  return (
    <g>
      {values.map((v, j) => (
        <rect key={j} x={x + j * cw + 0.5} y={y} width={cw - 1} height={h} rx={2} style={{ fill: divColour(v, max), stroke: 'var(--rule)', strokeWidth: 0.6 }} />
      ))}
    </g>
  )
}

export default function ShuffleInvariance() {
  const [order, setOrder] = useState<number[]>(MAN_BITES_DOG)
  const [usePE, setUsePE] = useState(false)
  const [seed, setSeed] = useState(1)
  const [ref, width] = useContainerWidth<HTMLDivElement>(560)

  const { A, B, deltas, sumDelta, inMax, outMax } = useMemo(() => {
    const A = run(IDENTITY, usePE)
    const B = run(order, usePE)
    const deltas = order.map((k, p) => dist(B.out[p], A.out[k]))
    const sumDelta = dist(mean(B.out), mean(A.out))
    // fixed colour scales across both settings, so toggling does not rescale the colours
    const all = [run(IDENTITY, false), run(IDENTITY, true)]
    const inMax = Math.max(...all.flatMap((r) => r.X.flat().map(Math.abs)))
    const outMax = Math.max(...all.flatMap((r) => r.out.flat().map(Math.abs)))
    return { A, B, deltas, sumDelta, inMax, outMax }
  }, [order, usePE])

  const W = Math.max(300, Math.min(width, 600))
  const padL = 36
  const colW = (W - padL - 4) / T
  const cx = (p: number) => padL + p * colW + colW / 2
  const stripW = Math.min(64, colW - 10)
  const Y = { titleA: 12, chipA: 18, inA: 48, outA: 64, c0: 86, c1: 132, chipB: 138, inB: 168, outB: 184, delta: 216 }
  const H = 226
  const same = deltas.every((d) => d < 1e-9)
  const maxDelta = Math.max(...deltas)
  const words = (o: number[]) => o.map((k) => VOCAB[SENT[k]]).join(' ')

  const chip = (p: number, y: number, word: string) => (
    <g key={`${y}-${p}`}>
      <rect x={cx(p) - (colW - 6) / 2} y={y} width={colW - 6} height={24} rx={7} style={{ fill: 'var(--surface-2)', stroke: 'var(--rule)', strokeWidth: 1.2 }} />
      <text x={cx(p)} y={y + 12} dy="0.35em" textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 13, fontWeight: 700 }}>
        {word}
      </text>
    </g>
  )

  return (
    <Figure
      title="Shuffle the words: can attention tell?"
      caption={
        <>
          One real attention head reads <i>the dog bites the man</i>. Under each word, <b>in</b> is the 4-number vector that goes into attention and{' '}
          <b>out</b> is what comes out (blue negative, orange positive). Shuffle the words or swap to <i>the man bites the dog</i>: with positional
          encoding off, every word's output is identical to before, only moved, so the two sentences look exactly alike. Notice too that the two
          copies of <i>the</i> get identical outputs. Now switch positional encoding on and shuffle again.
        </>
      }
    >
      <Controls>
        <Button onClick={() => setOrder(MAN_BITES_DOG)}>man bites dog</Button>
        <Button
          primary
          onClick={() => {
            setOrder(randomPerm(seed, order))
            setSeed((v) => v + 1)
          }}
        >
          Shuffle
        </Button>
        <Toggle label="add positional encoding" checked={usePE} onChange={setUsePE} />
      </Controls>

      <div ref={ref} style={{ width: '100%', maxWidth: 600 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" style={{ display: 'block' }} aria-label={`Original sentence "${words(IDENTITY)}" and shuffled sentence "${words(order)}" with each word's attention output. ${same ? 'Outputs are identical, just moved.' : 'Outputs differ.'}`}>
          <text x={2} y={Y.titleA} style={{ fill: 'var(--ink-2)', fontSize: 11, fontWeight: 800 }}>
            original
          </text>
          <text x={2} y={Y.c1 - 6} style={{ fill: 'var(--ink-2)', fontSize: 11, fontWeight: 800 }}>
            shuffled
          </text>
          {(['inA', 'outA', 'inB', 'outB'] as const).map((k) => (
            <text key={k} x={padL - 6} y={Y[k] + (k.startsWith('in') ? 6 : 8)} dy="0.35em" textAnchor="end" style={{ fill: 'var(--ink-2)', fontSize: 11, fontWeight: 700 }}>
              {k.startsWith('in') ? 'in' : 'out'}
            </text>
          ))}

          {/* links: where each word went */}
          {order.map((k, p) => {
            const ok = deltas[p] < 1e-9
            const xa = cx(k)
            const xb = cx(p)
            const ym = (Y.c0 + Y.c1) / 2
            return (
              <path
                key={`l${p}`}
                d={`M${xa},${Y.c0} C${xa},${ym} ${xb},${ym} ${xb},${Y.c1}`}
                style={{ fill: 'none', stroke: ok ? 'var(--viz-pos)' : 'var(--viz-4)', strokeWidth: 2, strokeDasharray: ok ? undefined : '5 3', opacity: 0.85 }}
              />
            )
          })}

          {IDENTITY.map((k, p) => (
            <g key={`a${p}`}>
              {chip(p, Y.chipA, VOCAB[SENT[k]])}
              <Strip x={cx(p) - stripW / 2} y={Y.inA} w={stripW} h={12} values={A.X[p]} max={inMax} />
              <Strip x={cx(p) - stripW / 2} y={Y.outA} w={stripW} h={16} values={A.out[p]} max={outMax} />
            </g>
          ))}
          {order.map((k, p) => (
            <g key={`b${p}`}>
              {chip(p, Y.chipB, VOCAB[SENT[k]])}
              <Strip x={cx(p) - stripW / 2} y={Y.inB} w={stripW} h={12} values={B.X[p]} max={inMax} />
              <Strip x={cx(p) - stripW / 2} y={Y.outB} w={stripW} h={16} values={B.out[p]} max={outMax} />
              <text x={cx(p)} y={Y.delta} textAnchor="middle" style={{ fill: deltas[p] < 1e-9 ? 'var(--viz-pos)' : 'var(--viz-4)', fontSize: 11.5, fontWeight: 800 }}>
                {deltas[p] < 1e-9 ? 'same ✓' : `Δ ${deltas[p].toFixed(2)}`}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <p className={s.verdict} style={{ borderColor: same ? 'var(--viz-pos)' : 'var(--viz-4)' }}>
        {same ? (
          <>
            <b>No positions:</b> every word's output is exactly what it was, just moved. The sentence average is unchanged too, so "{words(order)}"
            and "{words(IDENTITY)}" are indistinguishable to this layer.
          </>
        ) : (
          <>
            <b>With positions:</b> each word's input now depends on where it sits, so its output changes (by up to {maxDelta.toFixed(2)}). The layer
            can now tell "{words(order)}" from "{words(IDENTITY)}".
          </>
        )}
      </p>
      <Readout
        items={[
          ['largest change in a word’s output', maxDelta.toFixed(3)],
          ['change in the sentence average', sumDelta.toFixed(3)],
        ]}
      />
    </Figure>
  )
}
