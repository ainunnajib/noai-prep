import { useState } from 'react'
import { Figure, Controls, Button, Readout } from '../../../../../kit'
import s from './agents.module.css'

/*
  Eight logged RAG answers. The learner classifies each one into a 2x2 grid:
  retrieval right/wrong (did the retrieved context contain what was needed?) x answer right/wrong
  (correct AND supported by the context). Each quadrant suggests what to fix.
  Ground truth: R+A+ {1,5}, R+A- {2,6,8}, R-A+ {4}, R-A- {3,7} -> retrieval hit rate 5/8,
  answer accuracy 3/8, accuracy when retrieval was right 2/5.
*/

interface Case {
  id: number
  q: string
  ctx: string
  answer: string
  ref: string
  retrieval: boolean
  correct: boolean
  why: string
}

const CASES: Case[] = [
  {
    id: 1,
    q: 'Is the library open on Friday?',
    ctx: '[d0] The library is open on Friday.',
    answer: 'Yes, it is open on Friday.',
    ref: 'Yes.',
    retrieval: true,
    correct: true,
    why: 'The right document was retrieved, and the answer says exactly what it says.',
  },
  {
    id: 2,
    q: 'What time does the canteen open?',
    ctx: '[c4] The canteen opens at 7 am and closes at 3 pm.',
    answer: 'It opens at 3 pm.',
    ref: '7 am',
    retrieval: true,
    correct: false,
    why: 'The context contains “7 am”, but the model picked the wrong time out of it. The retriever did its job; the generator did not.',
  },
  {
    id: 3,
    q: 'Who teaches the robotics CCA?',
    ctx: '[c9] The robotics club meets on Wednesdays in Lab 2.',
    answer: 'Mr Tan teaches robotics.',
    ref: 'Ms Lim',
    retrieval: false,
    correct: false,
    why: 'The retrieved chunk never names a teacher, so the model had nothing to go on and invented a name. Fix the retriever first.',
  },
  {
    id: 4,
    q: 'What does CPU stand for?',
    ctx: '[c2] The computer lab is on level 3.',
    answer: 'Central processing unit.',
    ref: 'Central processing unit',
    retrieval: false,
    correct: true,
    why: 'The context is irrelevant, yet the answer is right: the model knew it from training. Fine this time, but nothing in the system guarantees it.',
  },
  {
    id: 5,
    q: 'How many MCQs are in the NOAI 2027 Prelim?',
    ctx: '[n1] The Preliminary Round has 150 multiple-choice questions in 90 minutes.',
    answer: '150 questions.',
    ref: '150',
    retrieval: true,
    correct: true,
    why: 'Right chunk, right number, nothing added.',
  },
  {
    id: 6,
    q: 'How long is the Prelim?',
    ctx: '[n1] The Preliminary Round has 150 multiple-choice questions in 90 minutes.',
    answer: '150 minutes.',
    ref: '90 minutes',
    retrieval: true,
    correct: false,
    why: 'Both numbers are in the context, and the model attached the wrong one to “how long”. A generation failure.',
  },
  {
    id: 7,
    q: 'When is the NOAI 2027 Final?',
    ctx: '[n3] The Preliminary Round is on 19 February 2027.',
    answer: 'On 19 February 2027.',
    ref: '5 March 2027',
    retrieval: false,
    correct: false,
    why: 'The retriever fetched the Prelim chunk instead of the Final one, and the model answered from it. The generator was misled, so fix retrieval.',
  },
  {
    id: 8,
    q: 'Is the library open on Friday?',
    ctx: '[d0] The library is open on Friday.',
    answer: 'Yes, from 8 am to 9 pm.',
    ref: 'Yes.',
    retrieval: true,
    correct: false,
    why: 'Retrieval was right, but the opening hours appear nowhere in the context. An answer with unsupported details is unfaithful, so it counts as wrong.',
  },
]

type QKey = 'rr' | 'rw' | 'wr' | 'ww' // retrieval, answer
const QUADS: { key: QKey; retrieval: boolean; correct: boolean; title: string; fix: string; color: string }[] = [
  { key: 'rr', retrieval: true, correct: true, title: 'Working', fix: 'Keep it as a test case so later changes cannot break it.', color: 'var(--ok)' },
  { key: 'wr', retrieval: false, correct: true, title: 'Right for the wrong reason', fix: 'Not grounded: the model answered from memory. Fix retrieval anyway, or it fails on facts it never learnt.', color: 'var(--warn)' },
  {
    key: 'rw',
    retrieval: true,
    correct: false,
    title: 'Generator problem',
    fix: 'The answer was in the context. Tighten the prompt (use only the context, quote it), send fewer distracting chunks, or use a stronger model.',
    color: 'var(--viz-5)',
  },
  { key: 'ww', retrieval: false, correct: false, title: 'Retriever problem', fix: 'The right text never reached the model. Fix retrieval first: chunking, embeddings or keywords, and k.', color: 'var(--bad)' },
]
const keyOf = (c: Case): QKey => `${c.retrieval ? 'r' : 'w'}${c.correct ? 'r' : 'w'}` as QKey

export default function RAGEvalMatrix() {
  const [sel, setSel] = useState(1)
  const [placed, setPlaced] = useState<Record<number, boolean>>({})
  const [firstTry, setFirstTry] = useState<Record<number, boolean>>({})
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)
  const c = CASES.find((x) => x.id === sel)!

  const guess = (q: QKey) => {
    const ok = keyOf(c) === q
    if (!(c.id in firstTry)) setFirstTry({ ...firstTry, [c.id]: ok })
    if (ok) {
      setPlaced({ ...placed, [c.id]: true })
      setFeedback({ ok: true, text: `Right. ${c.why}` })
    } else {
      const quad = QUADS.find((x) => x.key === q)!
      const hint =
        quad.retrieval !== c.retrieval
          ? c.retrieval
            ? 'Look again at the context: does it contain what the reference answer needs?'
            : 'Look again at the context: could anyone answer the question from it alone?'
          : c.correct
            ? 'Compare the answer with the reference answer: does it match?'
            : 'Compare the answer with the reference, and check every detail is in the context.'
      setFeedback({ ok: false, text: `Not quite. ${hint}` })
    }
  }

  const choose = (id: number) => {
    setSel(id)
    setFeedback(null)
  }
  const showAll = () => {
    setPlaced(Object.fromEntries(CASES.map((x) => [x.id, true])))
    setFeedback(null)
  }
  const reset = () => {
    setPlaced({})
    setFirstTry({})
    setFeedback(null)
    setSel(1)
  }

  const nextId = CASES.find((x) => !placed[x.id] && x.id !== sel)?.id
  const nPlaced = Object.keys(placed).length
  const nFirst = Object.values(firstTry).filter(Boolean).length
  const hit = CASES.filter((x) => x.retrieval).length
  const acc = CASES.filter((x) => x.correct).length
  const accGivenHit = CASES.filter((x) => x.retrieval && x.correct).length

  const quad = (q: (typeof QUADS)[number]) => (
    <button
      key={q.key}
      type="button"
      className={s.quad}
      style={{ borderColor: `color-mix(in srgb, ${q.color} 55%, var(--rule))` }}
      onClick={() => guess(q.key)}
      aria-label={`Put case ${sel} in: retrieval ${q.retrieval ? 'right' : 'wrong'}, answer ${q.correct ? 'right' : 'wrong'} (${q.title})`}
    >
      <span className={s.quadTitle} style={{ color: q.color }}>
        {q.title}
      </span>
      <span className={s.quadFix}>{q.fix}</span>
      <span className={s.quadChips}>
        {CASES.filter((x) => placed[x.id] && keyOf(x) === q.key).map((x) => (
          <span key={x.id} className={s.quadChip}>
            case {x.id}
          </span>
        ))}
      </span>
    </button>
  )

  return (
    <Figure
      wide
      title="Retriever or generator? Sort the failures"
      caption={
        <>
          Each case is a logged question with the context the retriever found, the model’s answer and the reference answer. Decide whether retrieval was right
          (did the context contain what was needed?) and whether the answer was right (correct <b>and</b> supported by the context), then click that square.
          Notice that the overall accuracy (3 of 8) hides two different problems that need two different fixes.
        </>
      }
    >
      <div className={s.stack}>
        <div className={s.cases} aria-label="Cases">
          {CASES.map((x) => (
            <button key={x.id} type="button" className={`${s.caseBtn} ${sel === x.id ? s.caseOn : ''} ${placed[x.id] ? s.caseDone : ''}`} onClick={() => choose(x.id)} aria-pressed={sel === x.id}>
              case {x.id}
              {placed[x.id] ? ' ✓' : ''}
            </button>
          ))}
        </div>
        <div className={s.detail} aria-live="polite">
          <div className={s.dRow}>
            <span className={s.dKey}>question</span>
            <span>{c.q}</span>
          </div>
          <div className={s.dRow}>
            <span className={s.dKey}>retrieved</span>
            <span className={s.mono}>{c.ctx}</span>
          </div>
          <div className={s.dRow}>
            <span className={s.dKey}>model answer</span>
            <span>{c.answer}</span>
          </div>
          <div className={s.dRow}>
            <span className={s.dKey}>reference</span>
            <span>{c.ref}</span>
          </div>
          {feedback && (
            <div className={`${s.feedback} ${feedback.ok ? s.fbOk : s.fbBad}`}>
              {feedback.text}
              {feedback.ok && nextId !== undefined && (
                <>
                  {' '}
                  <Button onClick={() => choose(nextId)}>Next case</Button>
                </>
              )}
            </div>
          )}
          {!feedback && placed[c.id] && <div className={`${s.feedback} ${s.fbOk}`}>{c.why}</div>}
        </div>
        <div className={s.matrix} role="group" aria-label="Retrieval right or wrong, by answer right or wrong">
          <span />
          <span className={s.axisTop}>retrieval right</span>
          <span className={s.axisTop}>retrieval wrong</span>
          <span className={s.axisSide}>answer right</span>
          {quad(QUADS[0])}
          {quad(QUADS[1])}
          <span className={s.axisSide}>answer wrong</span>
          {quad(QUADS[2])}
          {quad(QUADS[3])}
        </div>
        <Controls>
          <Button onClick={showAll}>Show all answers</Button>
          <Button onClick={reset}>Start again</Button>
          <Readout
            items={[
              ['sorted', `${nPlaced} of ${CASES.length}`],
              ['right first time', `${nFirst}`],
            ]}
          />
        </Controls>
        {nPlaced === CASES.length && (
          <Readout
            items={[
              ['retrieval hit rate', `${hit}/8`],
              ['answer accuracy', `${acc}/8`],
              ['accuracy when retrieval was right', `${accGivenHit}/${hit}`],
            ]}
          />
        )}
      </div>
    </Figure>
  )
}
