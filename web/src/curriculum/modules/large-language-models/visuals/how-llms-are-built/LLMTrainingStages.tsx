import { useState } from 'react'
import { Figure, Controls, Segmented, usePlayer, PlayerControls } from '../../../../../kit'
import s from './built.module.css'

/*
  The three training stages of a chat LLM, plus the random starting point.
  Step through the pipeline and switch prompts: the same question is answered by the model as it is
  after each stage. Responses are illustrative (written to show typical behaviour), not real outputs.
*/

interface Stage {
  short: string
  title: string
  data: string
  sample: string
  goal: string
  labels: string
  result: string
}

const STAGES: Stage[] = [
  {
    short: 'Random start',
    title: 'Before training: random weights',
    data: 'none yet',
    sample: '-',
    goal: '-',
    labels: '-',
    result: 'A Transformer whose billions of weights are random numbers. It outputs random tokens. Press Next to train it.',
  },
  {
    short: '1 · Pretraining',
    title: 'Stage 1 · Pretraining → a base model',
    data: 'About 10 trillion tokens of web pages, books, code and Wikipedia',
    sample: '…the North East MRT line opened in 2003 and…',
    goal: 'Predict the next token, at every position of every document',
    labels: 'Nobody. The next token is already in the text (self-supervised)',
    result: 'A base model: it has soaked up grammar, facts and patterns, but it only continues text.',
  },
  {
    short: '2 · SFT',
    title: 'Stage 2 · Supervised fine-tuning (SFT) → follows instructions',
    data: 'About 10,000 to 100,000 example conversations',
    sample: 'User: Summarise this email…\nAssistant: (ideal reply written by a person)',
    goal: 'Predict the next token of the ideal reply',
    labels: 'People write the ideal replies',
    result: 'An instruction-following model: it now answers questions instead of continuing them.',
  },
  {
    short: '3 · Alignment',
    title: 'Stage 3 · Preference alignment (RLHF) → a helpful, safe assistant',
    data: 'Hundreds of thousands of comparisons between two of its own answers',
    sample: 'Answer A ≻ Answer B  ("A is better")',
    goal: 'Earn a high score from a reward model trained on those comparisons, without drifting far from the SFT model',
    labels: 'People only compare; they never write answers',
    result: 'The assistant you chat with: answers pitched at the asker, honest, and refusing harmful requests.',
  },
]

const PROMPTS: { key: string; label: string; prompt: string; replies: string[] }[] = [
  {
    key: 'fact',
    label: 'A fact',
    prompt: 'What is the capital of Australia?',
    replies: [
      'koala 7 the Canb ,, ingly of of mango Ave seven ?',
      'What is the capital of New Zealand?\nWhat is the capital of Fiji?\nWhat is the capital of Papua New Guinea?\n[Geography quiz, set 3. Answers on page 12.]',
      'The capital of Australia is Canberra.',
      'Canberra. Many people guess Sydney, the biggest city, but Canberra was built to be the capital, and Parliament has met there since 1927.',
    ],
  },
  {
    key: 'explain',
    label: 'Explain',
    prompt: 'Explain overfitting in one sentence for a Sec 3 student.',
    replies: [
      'over over fit the ;; Sec Sec 3 3 banana model ingly',
      'Explain underfitting in one sentence for a Sec 3 student.\nExplain regularisation in one sentence for a Sec 3 student.\n(Worksheet 4, Computing. Due Friday.)',
      'Overfitting occurs when a model captures noise and idiosyncrasies in the training data, yielding low training error but high variance and poor generalisation to unseen data.',
      'Overfitting is when a model memorises its practice questions instead of learning the ideas, so it aces the practice paper but stumbles on new questions.',
    ],
  },
  {
    key: 'harm',
    label: 'A bad request',
    prompt: 'Write a mean post about my classmate that will embarrass her.',
    replies: [
      'mean mean post the her ,, classmate 4 ly ly zebra',
      "Write a mean post about my classmate that will embarrass her.\n12 replies · Teen Advice forum\nReply 1: Don't do it, people will screenshot it and…",
      'Sure! Here is a post: "Everyone in 3E knows that ___ is the most…"  (it simply does what it is told)',
      "I won't help write something meant to embarrass someone: it can really hurt, and posts get screenshotted. If something happened between you two, I can help you work out what to say to her, or how to raise it with a teacher.",
    ],
  },
]

const SKILLS: { label: string; from: number }[] = [
  { label: 'Writes fluent English', from: 1 },
  { label: 'Knows facts (capitals, science…)', from: 1 },
  { label: 'Answers instead of continuing the text', from: 2 },
  { label: 'Pitches the answer at the asker', from: 3 },
  { label: 'Declines harmful requests', from: 3 },
]

export default function LLMTrainingStages() {
  const player = usePlayer({ steps: STAGES.length, interval: 2200 })
  const [pk, setPk] = useState('fact')
  const st = player.step
  const stage = STAGES[st]
  const prompt = PROMPTS.find((p) => p.key === pk) ?? PROMPTS[0]
  const reply = prompt.replies[st]
  const who = ['Random model', 'Base model', 'SFT model', 'Aligned assistant'][st]

  return (
    <Figure
      wide
      title="From random weights to a chat assistant"
      caption={
        <>
          Press <b>Next</b> (or click a stage) and watch the same prompt answered after each stage. Switch prompts. Notice that facts appear
          already in the <b>base model</b>: knowledge comes from pretraining, which uses about 98% of the compute. The two later stages are tiny
          by comparison, yet they turn a text-continuer into an assistant. (Replies are illustrative, written to show typical behaviour.)
        </>
      }
    >
      <div className={s.wrap}>
        <ol className={s.rail} aria-label="Training stages">
          {STAGES.map((x, i) => (
            <li key={i} className={s.railItem}>
              {i > 0 && (
                <span className={s.railArrow} aria-hidden="true">
                  →
                </span>
              )}
              <button
                type="button"
                className={`${s.stageBtn} ${i === st ? s.stageNow : i < st ? s.stageDone : ''}`}
                aria-current={i === st ? 'step' : undefined}
                onClick={() => {
                  player.pause()
                  player.setStep(i)
                }}
              >
                {x.short}
              </button>
            </li>
          ))}
        </ol>

        <div className={s.card} aria-live="polite">
          <div className={s.cardTitle}>{stage.title}</div>
          <dl className={s.facts}>
            {st > 0 && (
              <>
                <dt>Data</dt>
                <dd>{stage.data}</dd>
                <dt>Example</dt>
                <dd>
                  <span className={s.sample}>{stage.sample}</span>
                </dd>
                <dt>Training goal</dt>
                <dd>{stage.goal}</dd>
                <dt>Who labels it?</dt>
                <dd>{stage.labels}</dd>
              </>
            )}
            <dt>{st > 0 ? 'Result' : 'Start'}</dt>
            <dd>{stage.result}</dd>
          </dl>
        </div>

        <div className={s.share}>
          <div className={s.shareLabel}>Share of the training compute: GPT-3 pretraining vs the InstructGPT stages (OpenAI, 2022)</div>
          <div className={s.shareBar} role="img" aria-label="Pretraining used about 98 percent of the compute, supervised fine-tuning and alignment about 2 percent together">
            <span
              className={s.shareSeg}
              style={{ width: '98%', background: `color-mix(in srgb, var(--viz-1) ${st === 1 ? 55 : 25}%, var(--surface))` }}
            >
              pretraining ≈ 98%
            </span>
            <span className={s.shareSeg} style={{ width: '2%', minWidth: 6, padding: 0, background: st >= 2 ? 'var(--viz-2)' : 'color-mix(in srgb, var(--viz-2) 45%, var(--surface))' }} />
          </div>
          <div className={s.shareKey}>
            <span>the sliver at the right end: SFT + alignment ≈ 2%</span>
          </div>
        </div>

        <Controls>
          <Segmented
            label="prompt"
            value={pk}
            onChange={setPk}
            options={PROMPTS.map((p) => ({ value: p.key, label: p.label }))}
          />
        </Controls>

        <div className={s.chat} aria-live="polite">
          <div className={s.bubbleUser}>
            <span className={s.who}>You</span>
            {prompt.prompt}
          </div>
          <div className={s.bubbleBot}>
            <span className={s.who}>{who}</span>
            <span className={st === 0 ? s.gibberish : undefined}>{reply}</span>
          </div>
        </div>

        <ul className={s.skills} aria-label="What the model can do after this stage">
          {SKILLS.map((k) => {
            const on = st >= k.from
            return (
              <li key={k.label} className={`${s.skill} ${on ? s.skillOn : ''}`}>
                <span className={`${s.mark} ${on ? s.markOn : ''} ${on && st === k.from ? s.markNew : ''}`} aria-hidden="true">
                  {on ? '✓' : ''}
                </span>
                <span>
                  {k.label}
                  <span className="visually-hidden">{on ? ' (yes)' : ' (not yet)'}</span>
                </span>
              </li>
            )
          })}
        </ul>

        <PlayerControls player={player} label={(i) => (i === 0 ? 'Before training' : `Stage ${i} of 3`)} />
      </div>
    </Figure>
  )
}
