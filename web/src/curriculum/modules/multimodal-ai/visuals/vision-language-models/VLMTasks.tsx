import { useState, type ReactNode } from 'react'
import { Figure, useNarrow } from '../../../../../kit'
import { HawkerScene } from './scene'
import { Thumb } from '../clip-and-zero-shot/Thumb'
import s from './vlm.module.css'

/*
  One vision-language model, many tasks: the weights never change, only the text you send with the
  picture. The answers are illustrative (typical of what a good VLM replies), not from a live model.
*/

type TaskId = 'caption' | 'vqa' | 'ocr' | 'price' | 'fewshot' | 'halluc'

interface Task {
  id: TaskId
  chip: string
  skill: string
  prompt: ReactNode
  answer: string
  region?: [number, number, number, number]
  bad?: boolean
  note: string
}

const TASKS: Task[] = [
  {
    id: 'caption',
    chip: 'Describe it',
    skill: 'Image captioning',
    prompt: 'Describe this picture in one sentence.',
    answer: 'A hawker stall called Ah Huat Chicken Rice, with a plate of chicken rice and a cup of coffee on the counter and an orange cat sitting on a stool.',
    region: [1, 1, 98, 98],
    note: 'Captioning: turn the whole picture into a sentence.',
  },
  {
    id: 'vqa',
    chip: 'Ask about it',
    skill: 'Visual question answering (VQA)',
    prompt: 'What animal is sitting on the stool?',
    answer: 'A cat. It is orange.',
    region: [76, 48, 100, 100],
    note: 'VQA: answer a question whose answer is in the picture.',
  },
  {
    id: 'ocr',
    chip: 'Read the sign',
    skill: 'Reading text (OCR)',
    prompt: 'What does the red sign say?',
    answer: '“AH HUAT CHICKEN RICE”',
    region: [2, 2, 98, 23],
    note: 'OCR (optical character recognition): read the text inside the picture.',
  },
  {
    id: 'price',
    chip: 'Price?',
    skill: 'VQA that needs reading',
    prompt: 'How much is one plate of chicken rice?',
    answer: 'One plate costs $4.50.',
    region: [52, 27, 74, 46],
    note: 'Combines skills: find the price board, read it, and connect it to the question.',
  },
  {
    id: 'fewshot',
    chip: 'Few-shot',
    skill: 'Few-shot, in-context learning',
    prompt: (
      <span style={{ display: 'grid', gap: '0.3rem' }}>
        <span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <Thumb id="laksa" size={30} title="photo of laksa" /> Dish: laksa. Spicy: yes.
        </span>
        <span style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <Thumb id="chickenrice" size={30} title="photo of chicken rice" /> Dish: chicken rice. Spicy: no.
        </span>
        <span>(this picture) Dish:</span>
      </span>
    ),
    answer: 'chicken rice. Spicy: no.',
    region: [23, 48, 51, 61],
    note: 'Flamingo-style: a couple of picture-and-answer examples inside the prompt teach the format. No weights change.',
  },
  {
    id: 'halluc',
    chip: 'Trick question',
    skill: 'A failure: hallucination',
    prompt: 'What colour is the dog?',
    answer: 'The dog is brown.',
    bad: true,
    note: 'There is no dog. VLMs sometimes describe things that are not in the picture (hallucination). A good answer would be “I can’t see a dog; there is a cat.”',
  },
]

export default function VLMTasks() {
  const [id, setId] = useState<TaskId>('price')
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const task = TASKS.find((t) => t.id === id)!

  return (
    <Figure
      wide
      title="One model, many tasks: just change the words"
      caption={
        <>
          Tap the chips. The picture and the model's weights stay exactly the same; only the text sent with the picture changes, and the same model captions, answers
          questions, reads text and copies a format from examples. The shaded box shows the part of the picture each answer depends on. The answers are typical of a
          good VLM, written for illustration. The last chip shows a real weakness.
        </>
      }
    >
      <div className={s.chips} role="group" aria-label="Choose a task">
        {TASKS.map((t) => (
          <button key={t.id} type="button" className={s.chip} aria-pressed={t.id === id} onClick={() => setId(t.id)}>
            {t.chip}
          </button>
        ))}
      </div>

      <div ref={ref} className={`${s.taskGrid} ${narrow ? s.taskGridNarrow : ''}`}>
        <svg viewBox="0 0 100 100" className={s.svgFull} style={{ maxWidth: 230 }} role="img" aria-label="A hawker stall: a red sign reading Ah Huat Chicken Rice, a price board showing $4.50, a plate of chicken rice, a cup and an orange cat on a stool">
          <HawkerScene />
          {task.region && (
            <rect
              x={task.region[0]}
              y={task.region[1]}
              width={task.region[2] - task.region[0]}
              height={task.region[3] - task.region[1]}
              rx={2}
              style={{ fill: 'color-mix(in srgb, var(--viz-4) 18%, transparent)', stroke: 'var(--viz-4)', strokeWidth: 1.4, strokeDasharray: '3 2' }}
            />
          )}
          {task.bad && (
            <text x={50} y={96} textAnchor="middle" style={{ fill: 'var(--viz-neg)', fontSize: 6.5, fontWeight: 800, paintOrder: 'stroke', stroke: 'var(--surface)', strokeWidth: 2 }}>
              no dog here!
            </text>
          )}
        </svg>
        <div className={s.chat} aria-live="polite">
          <div className={s.bubbleUser}>
            <span className={s.who}>you + the picture</span>
            {task.prompt}
          </div>
          <div className={`${s.bubbleBot} ${task.bad ? s.bubbleBad : ''}`}>
            <span className={s.who}>VLM</span>
            {task.answer}
          </div>
          <div className={s.note}>
            <b>{task.skill}.</b> {task.note}
          </div>
        </div>
      </div>
    </Figure>
  )
}
