import { Fragment, useState } from 'react'
import { Figure, Controls, Readout, Segmented, PlayerControls } from '../../../../../kit'
import { useStepper } from './useStepper'
import s from './pe.module.css'

/*
  Why "think step by step" helps. An LLM writes one token at a time, and each token gets the same
  fixed amount of computation (one pass through the network). Written-out steps put intermediate
  results INTO the context, where later tokens can read them.
  Maths: 90 − 50 = 40 min = 2400 s; 150 − 70 = 80 questions; 2400 ÷ 80 = 30 s.
  The tempting shortcut 90 × 60 ÷ 150 = 36 s is the average for the WHOLE paper.
*/

type Seg = { t: string; id?: string }
interface Line {
  segs: Seg[]
  reads: string[]
  made: string
  op: string
}

const Q: Seg[] = [
  { t: 'The NOAI Prelim has ' },
  { t: '150', id: 'q150' },
  { t: ' questions in ' },
  { t: '90', id: 'q90' },
  { t: ' minutes. Mei spends ' },
  { t: '50', id: 'q50' },
  { t: ' minutes on the first ' },
  { t: '70', id: 'q70' },
  { t: ' questions. How many seconds can she spend on each remaining question?' },
]

const DIRECT: Line[] = [{ segs: [{ t: 'Answer: ' }, { t: '36', id: 'd36' }, { t: ' seconds.' }], reads: ['q150', 'q90'], made: 'd36', op: 'four operations squeezed into one step' }]

const COT: Line[] = [
  { segs: [{ t: 'Time left: 90 − 50 = ' }, { t: '40', id: 'c40' }, { t: ' minutes.' }], reads: ['q90', 'q50'], made: 'c40', op: 'one subtraction' },
  { segs: [{ t: 'In seconds: 40 × 60 = ' }, { t: '2400', id: 'c2400' }, { t: '.' }], reads: ['c40'], made: 'c2400', op: 'one multiplication' },
  { segs: [{ t: 'Questions left: 150 − 70 = ' }, { t: '80', id: 'c80' }, { t: '.' }], reads: ['q150', 'q70'], made: 'c80', op: 'one subtraction' },
  { segs: [{ t: 'Per question: 2400 ÷ 80 = ' }, { t: '30', id: 'c30' }, { t: '.' }], reads: ['c2400', 'c80'], made: 'c30', op: 'one division' },
  { segs: [{ t: 'Answer: ' }, { t: '30', id: 'a30' }, { t: ' seconds.' }], reads: ['c30'], made: 'a30', op: 'copy the result' },
]

/** rough token count: numbers, words and punctuation marks each count as one token */
const tokCount = (line: Line) => (line.segs.map((x) => x.t).join('').match(/\d+|[A-Za-z']+|[^\sA-Za-z\d]/g) ?? []).length

function Segs({ segs, reads, made }: { segs: Seg[]; reads: string[]; made: string }) {
  return (
    <>
      {segs.map((x, i) =>
        x.id ? (
          <span key={i} className={`${s.num} ${reads.includes(x.id) ? s.numRead : ''} ${made === x.id ? s.numMade : ''}`}>
            {x.t}
          </span>
        ) : (
          <Fragment key={i}>{x.t}</Fragment>
        ),
      )}
    </>
  )
}

export default function ChainOfThought() {
  const [mode, setMode] = useState<'direct' | 'cot'>('direct')
  const lines = mode === 'direct' ? DIRECT : COT
  const player = useStepper({ steps: lines.length, interval: 1300 })
  const step = Math.min(player.step, lines.length - 1)
  const cur = lines[step]
  const done = step === lines.length - 1
  const tokensPer = lines.map(tokCount)
  const totalBefore = tokensPer.slice(0, -1).reduce((a, b) => a + b, 0)
  const correct = mode === 'cot'

  const switchMode = (m: 'direct' | 'cot') => {
    setMode(m)
    player.pause()
    player.setStep(m === 'direct' ? DIRECT.length - 1 : COT.length - 1)
  }

  return (
    <Figure
      title="Why “Let's think step by step” works"
      caption={
        <>
          Blue boxes are the numbers the model is reading while it writes the current line; the orange box is the number it produces. In <b>Answer directly</b>, the very first token must
          already be the answer, so all four operations have to happen inside one pass through the network, and the model grabs a familiar pattern: 90 minutes ÷ 150 questions = 36 s, the average
          for the <i>whole</i> paper. Switch to <b>Think step by step</b> and press Play: each line does one small operation and writes its result down, so the next line can read it. More tokens means
          more computation, and the working becomes scratch paper. (A simplified picture; the token count is approximate.)
        </>
      }
    >
      <div className={s.wrap}>
        <Controls>
          <Segmented
            label="Prompt ending"
            value={mode}
            onChange={switchMode}
            options={[
              { value: 'direct', label: 'Answer directly' },
              { value: 'cot', label: 'Think step by step' },
            ]}
          />
        </Controls>
        <div className={s.ctx} aria-label="The prompt">
          <span className={s.ctxRole}>prompt</span>
          Q: <Segs segs={Q} reads={cur.reads} made={cur.made} />
          <br />
          A:{mode === 'cot' ? <b> Let's think step by step.</b> : ' Give only the final answer.'}
        </div>
        <div className={s.ctx} aria-label="What the model writes" aria-live="polite">
          <span className={s.ctxRole}>model writes, one token at a time</span>
          {lines.map((ln, i) => (
            <span key={i} className={`${s.genLine} ${i === step ? s.genLineNow : ''} ${i > step ? s.genLineLater : ''}`}>
              <Segs segs={ln.segs} reads={i <= step ? cur.reads : []} made={i === step ? cur.made : ''} />
              {i === lines.length - 1 && i <= step && (
                <span className={correct ? s.verdictOk : s.verdictBad}>{correct ? '  ✓ correct' : '  ✗ wrong (should be 30)'}</span>
              )}
            </span>
          ))}
        </div>
        <div style={{ width: '100%' }}>
          <div className={s.panelHead}>
            <span>Computation used</span>
            <small>each square ≈ one token = one pass through the network</small>
          </div>
          <div className={s.tokens} role="img" aria-label={`${tokensPer.reduce((a, b) => a + b, 0)} tokens generated`}>
            {lines.map((_, i) =>
              Array.from({ length: tokensPer[i] }, (_, j) => (
                <span
                  key={`${i}-${j}`}
                  className={`${s.tokSq} ${i > step ? s.tokSqLater : ''}`}
                  style={i === step ? { background: 'var(--viz-2)' } : i === lines.length - 1 && i <= step ? { background: correct ? 'var(--viz-pos)' : 'var(--viz-neg)' } : undefined}
                />
              )),
            )}
          </div>
        </div>
        <PlayerControls player={player} label={(st) => `Line ${st + 1} of ${lines.length}: ${lines[Math.min(st, lines.length - 1)].op}`} />
        <Readout
          items={[
            ['tokens written before the answer', String(totalBefore)],
            ['work per step', mode === 'direct' ? '4 operations in 1 step' : '1 operation per step'],
            ['final answer', done ? (correct ? '30 s' : '36 s') : '…'],
          ]}
        />
      </div>
    </Figure>
  )
}
