import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Figure, Button } from '../../../../../kit'
import styles from './roadmap.module.css'

/*
  The five-rung skills ladder from the NOAI Prelim to IOAI. Click a rung to see its skills, the
  course lessons that build each skill and a real sample task. Tick the skills you already have;
  the "next" rung is the lowest one with unticked skills, and its unticked skills' lessons are
  suggested. Ticking the last skill of the open rung offers a button to move on; the panel never
  jumps by itself, so the box just ticked stays in view. Ticks are remembered in this browser only
  (a convenience; it works without storage).
*/

interface Skill {
  text: string
  lessons: { to: string; label: string }[]
}
interface Rung {
  stage: string
  verb: string
  when: string
  colour: string
  skills: Skill[]
  sample: string
}

const L = (mod: string, lesson: string, label: string) => ({ to: `/learn/${mod}/${lesson}`, label })

const RUNGS: Rung[] = [
  {
    stage: 'NOAI Prelim',
    verb: 'Recall concepts quickly',
    when: 'Fri 19 Feb 2027',
    colour: 'var(--viz-1)',
    skills: [
      { text: 'Answer a definition MCQ (overfitting, attention, CLIP, LoRA…) in under 30 seconds', lessons: [L('prelim-speed-toolkit', 'pacing-and-elimination', 'Pacing and elimination'), L('past-paper-walkthroughs', 'prelim-ml-genai', '2026 Prelim: ML and GenAI')] },
      { text: 'Do one-step maths without a calculator: dot products, norms, derivatives, probabilities', lessons: [L('prelim-speed-toolkit', 'drill-linear-algebra', 'Linear-algebra drills'), L('prelim-speed-toolkit', 'drill-calculus-probability', 'Calculus and probability drills')] },
      { text: 'Read a short NumPy or PyTorch snippet and predict its output or shape', lessons: [L('prelim-speed-toolkit', 'drill-shapes-and-code', 'Code-reading drills'), L('numpy', 'broadcasting', 'Broadcasting')] },
      { text: 'Know the vocabulary of all five domains, generative AI and problem solving included', lessons: [L('past-paper-walkthroughs', 'prelim-problem-solving', '2026 Prelim: problem solving'), L('large-language-models', 'how-llms-are-built', 'How LLMs are built')] },
    ],
    sample: '2026 Prelim: "LoRA (Low-Rank Adaptation) enables: …" Four options, about 36 seconds, no calculator.',
  },
  {
    stage: 'NOAI Final',
    verb: 'Implement known algorithms from scratch',
    when: 'Fri 5 Mar 2027',
    colour: 'var(--viz-3)',
    skills: [
      { text: 'Write gradient descent, K-means or gradient boosting in NumPy without help', lessons: [L('final-lab-numpy', 'task-kmeans', 'K-means from scratch'), L('final-lab-numpy', 'task-gradient-boosting', 'Gradient boosting from scratch')] },
      { text: 'Write scaled dot-product and multi-head attention in PyTorch', lessons: [L('final-lab-pytorch', 'task-attention', 'Attention from scratch')] },
      { text: 'Fix shape bugs and compute metrics such as mean IoU yourself', lessons: [L('final-lab-pytorch', 'task-unet-center-crop', 'U-Net centre crop'), L('final-lab-pytorch', 'task-mean-iou', 'Mean IoU from scratch')] },
      { text: 'Work in a Jupyter notebook against its tests, under time pressure, without AI help', lessons: [L('final-lab-numpy', 'exam-notebook-skills', 'Exam notebook skills')] },
    ],
    sample: '2026 Final Task 2: a U-Net crashes because padding was removed; fix it, then write mean IoU from scratch.',
  },
  {
    stage: 'NTU Selection Test',
    verb: 'Complete and improve a real pipeline',
    when: 'Sat 8 May 2027',
    colour: 'var(--viz-2)',
    skills: [
      { text: 'Write a full PyTorch training loop: DataLoader, train/eval modes, best-checkpoint saving', lessons: [L('pytorch', 'training-loop', 'The training loop'), L('debugging-and-diagnosis', 'pytorch-gotchas', 'PyTorch gotchas')] },
      { text: 'Fine-tune a pretrained torchvision or Hugging Face model on new data', lessons: [L('vision-tasks', 'transfer-learning-and-augmentation', 'Transfer learning'), L('pretrained-models-text-speech', 'hugging-face-in-practice', 'Hugging Face in practice')] },
      { text: 'Set up validation that matches the test set and keep an experiment log', lessons: [L('road-to-ioai', 'baseline-to-better', 'From baseline to better')] },
      { text: 'Spot bugs in starter code: wrong normalisation, missing learning rate, wrong loss', lessons: [L('debugging-and-diagnosis', 'systematic-debugging', 'Systematic debugging'), L('debugging-and-diagnosis', 'data-bugs-and-shift', 'Data bugs and leakage')] },
    ],
    sample: '2025 Selection Test (CV): complete a U-Net for Pascal VOC, add class weights and a pretrained ResNet-34 encoder, then push mean IoU up and log every experiment.',
  },
  {
    stage: 'NTU training and camp',
    verb: 'Learn new model families on a GPU',
    when: '22 May – 18 Jun 2027',
    colour: 'var(--viz-5)',
    skills: [
      { text: 'Use CLIP zero-shot and train a small head on cached embeddings', lessons: [L('multimodal-ai', 'clip-and-zero-shot', 'CLIP and zero-shot'), L('road-to-ioai', 'ioai-task-techniques', 'Winning techniques')] },
      { text: 'Train a small GAN and explain its two-player loss', lessons: [L('generative-models', 'gans', 'GANs')] },
      { text: 'Fine-tune a Transformer for text; use unlabelled data with pseudo-labels', lessons: [L('large-language-models', 'fine-tuning-and-lora', 'Fine-tuning and LoRA'), L('road-to-ioai', 'ioai-task-techniques', 'Pseudo-labelling')] },
      { text: 'Run a pretrained speech model (Whisper or HuBERT) on audio', lessons: [L('pretrained-models-text-speech', 'audio-as-data', 'Sound as data'), L('pretrained-models-text-speech', 'speech-models', 'Speech models')] },
    ],
    sample: '2025 camp (CV): build and train a DCGAN on MNIST, then edit StyleGAN faces along a learned "smile" direction.',
  },
  {
    stage: 'IOAI 2027',
    verb: 'Invent under constraints',
    when: '4 – 10 Jul 2027',
    colour: 'var(--viz-4)',
    skills: [
      { text: 'Turn a story-style statement and its rule sheet into a plan within 20 minutes', lessons: [L('ml-systems-and-tradeoffs', 'designing-ml-solutions', 'Designing ML solutions')] },
      { text: 'Exploit structure: frozen embeddings, symmetry, input gradients, cheap baselines', lessons: [L('road-to-ioai', 'ioai-task-techniques', 'Winning techniques')] },
      { text: 'Build a fast validation loop and submit improvements without overfitting the leaderboard', lessons: [L('road-to-ioai', 'baseline-to-better', 'Leaderboard discipline')] },
      { text: 'Work with unfamiliar data (audio, multimodal) using only documentation', lessons: [L('multimodal-ai', 'vision-language-models', 'Vision-language models'), L('pretrained-models-text-speech', 'speech-models', 'Speech models')] },
    ],
    sample: 'IOAI 2026 Double Agent Dilemma: perturb photos so a ResNet-18 and a ViT-Tiny disagree, with smaller changes scoring higher.',
  },
]

const KEY = 'road-to-ioai.skills-ladder.v1'

function load(): boolean[][] {
  const empty = RUNGS.map((r) => r.skills.map(() => false))
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return empty
    const v = JSON.parse(raw) as boolean[][]
    return RUNGS.map((r, i) => r.skills.map((_, j) => Boolean(v?.[i]?.[j])))
  } catch {
    return empty
  }
}

const nextRung = (t: boolean[][]) => RUNGS.findIndex((r, i) => t[i].filter(Boolean).length < r.skills.length)

export default function SkillsLadder() {
  const [ticks, setTicks] = useState<boolean[][]>(load)
  // open on the learner's next rung (the lowest one with unticked skills)
  const [open, setOpen] = useState(() => {
    const n = nextRung(ticks)
    return n < 0 ? RUNGS.length - 1 : n
  })
  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(ticks))
    } catch {
      /* storage unavailable: ticks just are not remembered */
    }
  }, [ticks])

  const done = (i: number) => ticks[i].filter(Boolean).length
  const next = nextRung(ticks)
  const toggle = (i: number, j: number) =>
    setTicks((prev) => prev.map((row, a) => (a === i ? row.map((v, b) => (b === j ? !v : v)) : row)))
  const rung = RUNGS[open]
  // the open rung is complete and another rung still has gaps: offer to go there
  const offerNext = ticks[open].every(Boolean) && next >= 0 && next !== open
  const suggestions = next < 0 ? [] : RUNGS[next].skills.filter((_, j) => !ticks[next][j]).flatMap((s) => s.lessons)
  const unique = suggestions.filter((s, k) => suggestions.findIndex((t) => t.to === s.to) === k).slice(0, 4)

  return (
    <Figure
      title="The skills ladder from Prelim to IOAI"
      caption={
        <>
          Tap a rung and tick the skills you already have: the ladder marks your next rung and suggests lessons. Notice how the verbs change: recall, implement, improve, learn, invent.
        </>
      }
      wide
    >
      <div className={styles.ladderWrap}>
        <ol className={styles.ladder} aria-label="Ladder rungs, top is IOAI">
          {RUNGS.map((_, i) => i)
            .reverse()
            .map((i) => {
              const r = RUNGS[i]
              const n = done(i)
              return (
                <li key={r.stage}>
                  <button
                    type="button"
                    className={`${styles.rung}${open === i ? ` ${styles.rungOpen}` : ''}`}
                    style={{ ['--rung' as string]: r.colour }}
                    aria-pressed={open === i}
                    onClick={() => setOpen(i)}
                  >
                    <span className={styles.rungIdx}>{i + 1}</span>
                    <span className={styles.rungText}>
                      <span className={styles.rungStage}>
                        {r.stage}
                        {i === next && <span className={styles.nextTag}>your next rung</span>}
                      </span>
                      <span className={styles.rungVerb}>{r.verb}</span>
                    </span>
                    <span className={styles.rungProg} aria-label={`${n} of ${r.skills.length} skills ticked`}>
                      {r.skills.map((_, j) => (
                        <span key={j} className={`${styles.pip}${ticks[i][j] ? ` ${styles.pipOn}` : ''}`} />
                      ))}
                    </span>
                  </button>
                </li>
              )
            })}
        </ol>
        <div className={styles.rungPanel} aria-live="polite">
          <div className={styles.panelHead} style={{ borderColor: rung.colour }}>
            <strong>
              Rung {open + 1}: {rung.stage}
            </strong>
            <span className={styles.when}>{rung.when}</span>
          </div>
          <ul className={styles.skillList}>
            {rung.skills.map((s, j) => (
              <li key={j}>
                <label className={styles.skill}>
                  <input type="checkbox" checked={ticks[open][j]} onChange={() => toggle(open, j)} />
                  <span>{s.text}</span>
                </label>
                <span className={styles.skillLinks}>
                  {s.lessons.map((l) => (
                    <Link key={l.to + l.label} to={l.to}>
                      {l.label}
                    </Link>
                  ))}
                </span>
              </li>
            ))}
          </ul>
          {offerNext && (
            <div className={styles.rungDone}>
              <span>
                All {rung.skills.length} skills on this rung ticked.{next < open ? ` Rung ${next + 1} below still has gaps.` : ''}
              </span>
              <Button primary onClick={() => setOpen(next)}>
                Go to rung {next + 1}: {RUNGS[next].stage} →
              </Button>
            </div>
          )}
          <div className={styles.sample}>
            <span className={styles.sampleLabel}>Sample task</span> {rung.sample}
          </div>
        </div>
      </div>
      <div className={styles.suggest}>
        {next < 0 ? (
          <span>Every skill ticked: you are ready for IOAI-style tasks. Keep practising on past IOAI problems.</span>
        ) : (
          <>
            <span>
              <strong>Next:</strong> rung {next + 1} ({RUNGS[next].stage}), {done(next)} of {RUNGS[next].skills.length} skills ticked. Suggested lessons:
            </span>{' '}
            {unique.map((l, k) => (
              <span key={l.to}>
                <Link to={l.to}>{l.label}</Link>
                {k < unique.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </>
        )}
      </div>
    </Figure>
  )
}
