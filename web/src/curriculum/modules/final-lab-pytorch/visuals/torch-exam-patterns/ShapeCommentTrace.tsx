import { useState, type ReactNode } from 'react'
import { Figure, Controls, Readout, usePlayer, PlayerControls, useNarrow } from '../../../../../kit'
import { Py, Chips, OutBox } from './code'
import s from './tep.module.css'

/*
  Shape-first coding: step through a small multi-head attention-weights function. Each step writes
  the expected shape as a comment (with letters and numbers for B=2, T=5, d=12, h=3, so d_k=4) and
  compares it with the shape PyTorch really produces. Pick a bug to see where the first mismatch is
  flagged and where PyTorch actually crashes.

  Every "got" shape and the error message were produced by running the same code in PyTorch 2.14
  (see the lesson's verification script): the crash for both transpose bugs is
  "The size of tensor a (3) must match the size of tensor b (5) at non-singleton dimension 1".
*/

type Bug = 'none' | 'forgotK' | 'wrongT' | 'noT' | 'dim'

interface Line {
  code: string
  /** expected shape in letters, e.g. (B, h, T, d_k) */
  expect?: string
  /** expected numbers */
  nums?: string
  /** what PyTorch gives; 'ERR' means this line raises */
  got?: string
  plain?: string
}

const SHAPE = (a: number[]) => `(${a.join(', ')})`
const ERR = 'RuntimeError: The size of tensor a (3) must match the size of tensor b (5) at non-singleton dimension 1'

function buildLines(bug: Bug): Line[] {
  const qLine = bug === 'noT' ? '    Q = Q.view(B, h, T, d_k)' : '    Q = Q.view(B, T, h, d_k).transpose(1, 2)'
  const kLine =
    bug === 'noT' ? '    K = K.view(B, h, T, d_k)' : bug === 'forgotK' ? '    K = K.view(B, T, h, d_k)' : '    K = K.view(B, T, h, d_k).transpose(1, 2)'
  const sLine = bug === 'wrongT' ? '    scores = Q @ K.transpose(1, 2) / math.sqrt(d_k)' : '    scores = Q @ K.transpose(-2, -1) / math.sqrt(d_k)'
  const wLine = bug === 'dim' ? '    weights = torch.softmax(scores, dim=-2)' : '    weights = torch.softmax(scores, dim=-1)'
  const crashAt = bug === 'forgotK' || bug === 'wrongT' ? 7 : -1
  const lines: Line[] = [
    { code: 'def attention_weights(x, W_q, W_k, h):' },
    { code: '    B, T, d = x.shape', plain: 'B = 2, T = 5, d = 12', got: SHAPE([2, 5, 12]) },
    { code: '    d_k = d // h', plain: 'd_k = 12 // 3 = 4' },
    { code: '    Q = x @ W_q', expect: '(B, T, d)', nums: SHAPE([2, 5, 12]), got: SHAPE([2, 5, 12]) },
    { code: '    K = x @ W_k', expect: '(B, T, d)', nums: SHAPE([2, 5, 12]), got: SHAPE([2, 5, 12]) },
    { code: qLine, expect: '(B, h, T, d_k)', nums: SHAPE([2, 3, 5, 4]), got: SHAPE([2, 3, 5, 4]) },
    { code: kLine, expect: '(B, h, T, d_k)', nums: SHAPE([2, 3, 5, 4]), got: bug === 'forgotK' ? SHAPE([2, 5, 3, 4]) : SHAPE([2, 3, 5, 4]) },
    { code: sLine, expect: '(B, h, T, T)', nums: SHAPE([2, 3, 5, 5]), got: crashAt === 7 ? 'ERR' : SHAPE([2, 3, 5, 5]) },
    { code: wLine, expect: '(B, h, T, T)', nums: SHAPE([2, 3, 5, 5]), got: crashAt >= 0 ? undefined : SHAPE([2, 3, 5, 5]) },
    { code: '    return weights' },
  ]
  return lines
}

const BUGS: { value: Bug; label: string; tone?: 'bad' }[] = [
  { value: 'none', label: 'No bug' },
  { value: 'forgotK', label: "Forgot K's transpose(1, 2)", tone: 'bad' },
  { value: 'wrongT', label: 'K.transpose(1, 2) in scores', tone: 'bad' },
  { value: 'noT', label: 'view(B, h, T, d_k), no transpose', tone: 'bad' },
  { value: 'dim', label: 'softmax(dim=-2)', tone: 'bad' },
]

/** value checks after the function runs: [rows sum to 1, matches a slow reference] (verified in PyTorch) */
const CHECKS: Record<Bug, [boolean, boolean] | null> = {
  none: [true, true],
  forgotK: null,
  wrongT: null,
  noT: [true, false],
  dim: [false, false],
}

const MESSAGES: Record<Bug, ReactNode> = {
  none: (
    <>
      Every line's shape matches its comment, the rows of <code>weights</code> sum to 1 and the result equals a slow loop version. With shapes this distinct
      (2, 3, 5, 4 are all different), a swapped axis cannot hide.
    </>
  ),
  forgotK: (
    <>
      Your comment flags <b>line 6</b>: you expected <code>(B, h, T, d_k)</code> but <code>K</code> is still <code>(2, 5, 3, 4)</code>, tokens before heads. PyTorch
      only complains on <b>line 7</b>, with a message about "tensor a (3)" and "tensor b (5)" that never mentions <code>K</code>. The comment points at the cause; the
      error points at the symptom.
    </>
  ),
  wrongT: (
    <>
      <code>K</code> is <code>(B, h, T, d_k)</code>, so <code>transpose(1, 2)</code> swaps <b>h and T</b>, giving <code>(2, 5, 3, 4)</code>. Writing the comment
      for <code>K.transpose(…)</code> before you type it makes you say which two axes move: the last two, <code>(-2, -1)</code>.
    </>
  ),
  noT: (
    <>
      Every shape matches, yet the answer is wrong. <code>view(B, h, T, d_k)</code> pours the numbers of <code>(B, T, d)</code> into a new grid in memory order,
      so "head 0" receives the first 20 numbers: all 12 of token 0 and 8 of token 1, chopped into five fake "tokens" of 4. Shape comments cannot catch this one;
      only a <b>value</b> test, such as comparing with a slow loop version, can. Hidden tests that compare values would fail it.
    </>
  ),
  dim: (
    <>
      Shapes are all correct, but softmax ran down the <b>columns</b>, so each query's weights no longer sum to 1. A one-line check,{' '}
      <code>weights.sum(dim=-1)</code> is all ones, catches it.
    </>
  ),
}

export default function ShapeCommentTrace() {
  const [bug, setBug] = useState<Bug>('none')
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const lines = buildLines(bug)
  const annotated = [1, 2, 3, 4, 5, 6, 7, 8]
  // step 0: nothing annotated; step k (1..8): lines 1..k annotated; step 9: value checks
  const player = usePlayer({ steps: 10, interval: 1100 })
  const [started, setStarted] = useState(false)
  const step = started ? player.step : 9
  const shown = (i: number) => i <= step && i >= 1

  const crashLine = lines.findIndex((l) => l.got === 'ERR')
  const firstBad = lines.findIndex((l) => l.nums && l.got && l.got !== 'ERR' && l.got !== l.nums)
  const flagLine = firstBad >= 0 ? firstBad : crashLine
  const ranTo = crashLine >= 0 ? crashLine : 9
  const checks = CHECKS[bug]

  const noteFor = (l: Line, i: number): ReactNode => {
    if (i > ranTo) return <span className={s.expect}># not reached: the function crashed on line {crashLine}</span>
    if (l.plain) return <span className={s.expect}># {l.plain}</span>
    if (!l.expect) return null
    if (l.got === 'ERR')
      return (
        <>
          <span className={s.expect}># {l.expect} = {l.nums}</span>
          <span className={`${s.mark} ${s.markBad}`}>✗ crash</span>
        </>
      )
    const ok = l.got === l.nums
    return (
      <>
        <span className={s.expect}># {l.expect} = {l.nums}</span>
        <span className={`${s.mark} ${ok ? s.markOk : s.markBad}`}>{ok ? '✓' : '✗'}</span>
        {!ok && (
          <>
            {' '}
            <span className={s.got} style={{ color: 'var(--bad)', fontWeight: 700 }}>
              got {l.got}
            </span>
          </>
        )}
      </>
    )
  }

  const rowClass = (i: number) => {
    const cls = [s.traceRow]
    const isCur = started && i === step && step <= 8
    const bad = shown(i) && (i === crashLine || (lines[i].nums && lines[i].got && lines[i].got !== 'ERR' && lines[i].got !== lines[i].nums))
    if (bad) cls.push(s.traceBad)
    else if (isCur) cls.push(s.traceCur)
    if (!shown(i) || !annotated.includes(i)) cls.push(s.traceHidden)
    return cls.join(' ')
  }

  const pickBug = (b: Bug) => {
    setBug(b)
  }

  return (
    <Figure
      wide
      title="Label every box: shape comments on every line"
      caption={
        <>
          Press <b>Restart</b>, then <b>Next</b> to write one shape comment per line and compare it with what PyTorch really returns (B = 2 sequences, T = 5 tokens,
          d = 12 features, h = 3 heads). Then inject a bug. Two bugs are flagged by a comment before PyTorch crashes; two others keep every shape right and are only
          caught by the value checks at the end.
        </>
      }
    >
      <div ref={wrapRef} className={narrow ? s.narrow : ''} style={{ width: '100%', display: 'grid', gap: '0.75rem' }}>
        <Chips label="Inject a bug" options={BUGS} value={bug} onChange={pickBug} />
        <div className={s.panel} aria-label="attention_weights with shape comments">
          <div className={s.panelBar}>
            <span>x: (B, T, d) = (2, 5, 12), h = 3</span>
          </div>
          <div className={s.panelBody}>
            {lines.map((l, i) => (
              <div key={i} className={rowClass(i)}>
                <div className={s.traceCode}>
                  <span style={{ display: 'inline-block', width: narrow ? '1.3em' : '1.6em', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{i}</span>
                  <Py code={narrow ? l.code.replace(/^ {4}/, '  ') : l.code} size={narrow ? 11 : 12} />
                </div>
                <div className={s.traceNote}>{shown(i) ? noteFor(l, i) : ' '}</div>
              </div>
            ))}
          </div>
        </div>
        {step >= 7 && crashLine >= 0 && <OutBox tone="err" title={`line ${crashLine} raised`}>{ERR}</OutBox>}
        {step >= 9 && checks && (
          <OutBox tone={checks[0] && checks[1] ? 'ok' : 'err'} title="value checks after the call">
            {`rows of weights sum to 1:  ${checks[0] ? 'True' : 'False'}\nmatches a slow loop:       ${checks[1] ? 'True' : 'False'}`}
          </OutBox>
        )}
        {step >= 9 && <div className={`${s.message} ${bug === 'none' ? s.messageOk : s.messageBad}`}>{MESSAGES[bug]}</div>}
        <Controls>
          <PlayerControls
            player={{
              ...player,
              step,
              reset: () => {
                setStarted(true)
                player.reset()
              },
              toggle: () => {
                setStarted(true)
                if (!started) {
                  player.setStep(0)
                  player.play()
                } else player.toggle()
              },
              next: () => {
                if (!started) {
                  setStarted(true)
                  player.setStep(1)
                } else player.next()
              },
              prev: () => {
                if (!started) {
                  setStarted(true)
                  player.setStep(8)
                } else player.prev()
              },
            }}
            label={(k) => (k === 0 ? 'Ready: no comments yet' : k <= 8 ? `Line ${k} of 8` : 'Value checks')}
          />
          <Readout
            items={[
              ['first flag', flagLine >= 0 ? `line ${flagLine}` : 'none'],
              ['PyTorch crashes', crashLine >= 0 ? `line ${crashLine}` : 'no'],
            ]}
          />
        </Controls>
      </div>
    </Figure>
  )
}
