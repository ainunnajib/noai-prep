import { Fragment, useState } from 'react'
import { Figure, Controls, Button } from '../../../../../kit'
import s from './rag.module.css'

/*
  Prompting, RAG or fine-tuning? Pick a scenario, answer the flowchart's questions, and compare your
  path with the recommended one. The flowchart encodes the rule of thumb: try prompting first, use RAG
  when what is missing is knowledge, and fine-tune when what is missing is behaviour.
*/

type Leaf = 'prompt' | 'rag' | 'finetune' | 'rethink'

const QUESTIONS = [
  'Can a well-written prompt (perhaps with a few examples) already do the job well?',
  'Is the missing piece knowledge: facts that are new, private or change often?',
  'Is the missing piece a behaviour (a style, a format or a narrow skill), and do you have many good examples of it?',
]
/** leaf reached by answering "yes" to question i, and by "no" to the last question */
const YES_LEAF: Leaf[] = ['prompt', 'rag', 'finetune']
const NO_LEAF: Leaf = 'rethink'

const LEAVES: Record<Leaf, { name: string; color: string; line: string }> = {
  prompt: { name: 'Prompt engineering', color: 'var(--viz-1)', line: 'Changes only the input. Cheapest and instant.' },
  rag: { name: 'RAG', color: 'var(--viz-pos)', line: 'Adds retrieved documents to the input. Update by editing documents.' },
  finetune: { name: 'Fine-tuning', color: 'var(--viz-4)', line: 'Changes the weights by training. Needs data; costs most.' },
  rethink: { name: 'Rethink', color: 'var(--viz-6)', line: 'Improve the prompt, collect examples, or combine methods.' },
}

interface Scenario {
  id: string
  title: string
  sub: string
  brief: string
  /** recommended yes/no answers, in order, until a leaf is reached */
  answers: boolean[]
  /** why each recommended answer is right */
  why: string[]
  verdict: string
}

const SCENARIOS: Scenario[] = [
  {
    id: 'policy',
    title: 'Company policy chatbot',
    sub: 'staff ask about leave rules',
    brief:
      'A bank wants a chatbot that answers staff questions about its 300-page HR policy. The policy is private, it changes every month, and every answer must show which rule it comes from.',
    answers: [false, true],
    why: [
      'No: the model has never seen this private policy, so no wording of the prompt can make it know the rules. (Pasting all 300 pages into every prompt is slow and costly; that is RAG without the retrieval.)',
      'Yes: what is missing is private facts that change monthly. That is exactly what retrieval supplies.',
    ],
    verdict:
      'RAG: retrieve the relevant rules into the prompt and cite them. When the policy changes, re-index the documents; nothing is retrained. Fine-tuning would bake in last month’s rules and could not point to its source.',
  },
  {
    id: 'news',
    title: 'Latest news Q&A',
    sub: 'questions about today’s stories',
    brief: 'A news app wants to answer readers’ questions about stories published today. The LLM’s training data stops more than a year ago.',
    answers: [false, true],
    why: ['No: today’s news is newer than the model’s training cut-off, so it cannot know it from its weights.', 'Yes: the missing piece is new facts, which change every hour.'],
    verdict: 'RAG: fetch today’s articles at question time and answer from them. Fine-tuning every day would be slow, expensive and still out of date by the afternoon.',
  },
  {
    id: 'legal',
    title: 'Legal style rewriting',
    sub: 'rough notes into house style',
    brief:
      'A law firm wants rough notes rewritten in its strict house style: fixed clause numbering, set phrases and an approved tone. Few-shot prompts got the style right only about half the time. The firm has 8,000 pairs of notes and approved rewrites.',
    answers: [false, false, true],
    why: [
      'No: they tried few-shot prompting and it was right only about half the time.',
      'No: no new facts are needed. Everything is in the notes; the problem is how to write.',
      'Yes: the missing piece is a consistent behaviour, and 8,000 approved examples are plenty to train on.',
    ],
    verdict: 'Fine-tuning: training on the 8,000 approved rewrites changes the weights so the house style becomes the model’s default. Retrieval adds facts, not a reliable writing style.',
  },
  {
    id: 'singlish',
    title: 'Singlish sentiment classifier',
    sub: '“shiok” or “jialat”?',
    brief:
      'A food-delivery app must label 2 million Singlish reviews a day as positive or negative, cheaply and fast. A few-shot prompt to a large model gets 74% right and costs too much at this volume. The team has 30,000 labelled reviews.',
    answers: [false, false, true],
    why: [
      'No: 74% is not good enough, and a large model is too slow and expensive for 2 million reviews a day.',
      'No: the task needs no outside facts; each review contains everything needed.',
      'Yes: it is one narrow skill, done millions of times, with 30,000 labelled examples.',
    ],
    verdict:
      'Fine-tuning: train a small model on the 30,000 labelled reviews. It learns Singlish slang and is cheap to run. It may lose some general abilities (catastrophic forgetting), which does not matter for a one-task classifier.',
  },
  {
    id: 'homework',
    title: 'Homework explainer',
    sub: 'photosynthesis for Sec 1',
    brief:
      'A tutor wants clear explanations of standard science topics for Sec 1 students, each with one everyday example. A prompt with a role (“patient science tutor for Sec 1”) and a fixed format already gives good answers.',
    answers: [true],
    why: ['Yes: the model already knows standard science and how to explain it. The prompt sets the level and format, and it already works.'],
    verdict: 'Prompt engineering: cheapest and instant, with no data and no training. RAG or fine-tuning would add cost and complexity for no gain.',
  },
]

const leafOf = (ans: boolean[]): Leaf | null => {
  for (let i = 0; i < ans.length; i++) if (ans[i]) return YES_LEAF[i]
  return ans.length === QUESTIONS.length ? NO_LEAF : null
}

export default function AdaptationChooser() {
  const [sid, setSid] = useState('policy')
  const sc = SCENARIOS.find((x) => x.id === sid)!
  const [ans, setAns] = useState<boolean[]>(sc.answers)
  const [showRec, setShowRec] = useState(false)

  const mine = leafOf(ans)
  const rec = leafOf(sc.answers)!
  const done = mine !== null
  const firstDiff = ans.findIndex((a, i) => a !== sc.answers[i])
  const revealRec = done || showRec

  const pick = (id: string) => {
    setSid(id)
    setAns([])
    setShowRec(false)
  }
  const answer = (qi: number, v: boolean) => setAns((a) => [...a.slice(0, qi), v])

  return (
    <Figure
      wide
      title="Prompting, RAG or fine-tuning?"
      caption={
        <>
          Pick a scenario, read the brief, and answer the questions in the flowchart with <b>Yes</b> or <b>No</b>. Your path lights up; when you reach a box, the recommended answers and choice get a dashed
          green outline and the reasons appear. Most problems follow the same rule of thumb: try <b>prompting</b> first, use <b>RAG</b> when the model lacks knowledge, and <b>fine-tune</b> when it lacks a
          behaviour. Real projects often combine them.
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.cards} role="group" aria-label="Scenarios">
          {SCENARIOS.map((x) => (
            <button key={x.id} type="button" className={`${s.card} ${x.id === sid ? s.cardOn : ''}`} aria-pressed={x.id === sid} onClick={() => pick(x.id)}>
              <span className={s.cardTitle}>{x.title}</span>
              <span className={s.cardSub}>{x.sub}</span>
            </button>
          ))}
        </div>
        <p className={s.brief}>
          <b>Brief: </b>
          {sc.brief}
        </p>

        <div className={s.flow} aria-label="Decision flowchart">
          {QUESTIONS.map((qt, qi) => {
            const reached = qi <= ans.length && ans.slice(0, qi).every((a) => !a)
            const active = reached && ans[qi] === undefined
            const leaf = YES_LEAF[qi]
            const yesTaken = reached && ans[qi] === true
            const noTaken = reached && ans[qi] === false
            const L = LEAVES[leaf]
            return (
              <Fragment key={qi}>
                {qi > 0 && (
                  <div className={s.noLink} aria-hidden="true">
                    <span className={`${s.noLine} ${ans[qi - 1] === false && reached ? s.noLineOn : ''}`}>
                      <span className={s.noLab}>No</span>
                    </span>
                  </div>
                )}
                <div className={s.fRow}>
                  <div className={`${s.fQ} ${active ? s.fQActive : ''} ${!reached ? s.fQDim : ''}`}>
                    <span>
                      <b>Q{qi + 1}.</b> {qt}
                    </span>
                    <span className={s.ynRow}>
                      <button type="button" className={`${s.yn} ${yesTaken ? s.ynOn : ''} ${revealRec && sc.answers[qi] === true ? s.ynRec : ''}`} disabled={!reached} aria-pressed={yesTaken} onClick={() => answer(qi, true)}>
                        Yes
                      </button>
                      <button type="button" className={`${s.yn} ${noTaken ? s.ynOn : ''} ${revealRec && sc.answers[qi] === false ? s.ynRec : ''}`} disabled={!reached} aria-pressed={noTaken} onClick={() => answer(qi, false)}>
                        No
                      </button>
                    </span>
                  </div>
                  <div className={`${s.yesArrow} ${yesTaken ? s.yesArrowOn : ''}`} aria-hidden="true">
                    <span className={s.yesLab}>Yes</span>
                  </div>
                  <div
                    className={`${s.leaf} ${mine === leaf ? s.leafOn : ''} ${revealRec && rec === leaf ? s.leafRec : ''}`}
                    style={{ borderColor: L.color, background: mine === leaf ? `color-mix(in srgb, ${L.color} 18%, var(--surface))` : undefined }}
                  >
                    <span className={s.leafTitle}>{L.name}</span>
                    {L.line}
                  </div>
                </div>
              </Fragment>
            )
          })}
          <div className={s.noLink} aria-hidden="true">
            <span className={`${s.noLine} ${ans.length === QUESTIONS.length && ans.every((a) => !a) ? s.noLineOn : ''}`}>
              <span className={s.noLab}>No</span>
            </span>
          </div>
          <div className={s.fRow}>
            <div
              className={`${s.leaf} ${mine === 'rethink' ? s.leafOn : ''}`}
              style={{ borderColor: LEAVES.rethink.color, background: mine === 'rethink' ? `color-mix(in srgb, ${LEAVES.rethink.color} 18%, var(--surface))` : undefined }}
            >
              <span className={s.leafTitle}>{LEAVES.rethink.name}</span>
              {LEAVES.rethink.line}
            </div>
          </div>
        </div>

        <div aria-live="polite">
          {done ? (
            <p className={s.result} style={{ background: `color-mix(in srgb, ${mine === rec ? 'var(--viz-pos)' : 'var(--viz-2)'} 14%, var(--surface))` }}>
              {mine === rec ? (
                <>
                  <b>✓ Your choice matches the recommendation. </b>
                  {sc.verdict}
                </>
              ) : (
                <>
                  <b>
                    You chose {LEAVES[mine as Leaf].name}; the recommendation is {LEAVES[rec].name}.{' '}
                  </b>
                  {firstDiff >= 0 && (
                    <>
                      At Q{firstDiff + 1}: {sc.why[firstDiff]}{' '}
                    </>
                  )}
                  {sc.verdict}
                </>
              )}
            </p>
          ) : showRec ? (
            <p className={s.result} style={{ background: 'color-mix(in srgb, var(--viz-pos) 12%, var(--surface))' }}>
              <b>Recommended: {LEAVES[rec].name}. </b>
              {sc.why.map((w, i) => `Q${i + 1}: ${w}`).join(' ')}
            </p>
          ) : (
            <p className={s.note}>Answer Q{ans.length + 1} to continue.</p>
          )}
        </div>
        <Controls>
          <Button onClick={() => { setAns([]); setShowRec(false) }} disabled={ans.length === 0}>
            Start again
          </Button>
          <Button onClick={() => setShowRec(true)} disabled={done || showRec}>
            Show the recommended path
          </Button>
        </Controls>
      </div>
    </Figure>
  )
}
