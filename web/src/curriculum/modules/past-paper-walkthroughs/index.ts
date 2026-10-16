import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "past-paper-walkthroughs",
  order: 36,
  part: "exam",
  domain: "exam",
  title: "Past-paper walkthroughs",
  tagline: "The real papers, pattern by pattern",
  summary: "Guided walkthroughs of the 2026 Prelim by domain, its long problem-solving scenarios, the code-reading MCQs of the 2026 Final, and the 2025 MCQs, with the pattern behind each question and the anatomy of its distractors.",
  prerequisites: ["prelim-speed-toolkit"],
  syllabus: ["NOAI 2026 Preliminary Round (300 MCQs) by domain", "NOAI 2026 Final Section 1 (20 code-reading MCQs)", "NOAI 2025 MCQs", "Cross-year trends and distractor patterns"],
  lessons: [
    {
      slug: "prelim-maths-computing",
      title: "2026 Prelim: Mathematics and Computing",
      summary: "The 26 question templates behind Q1–119, seven model solutions against the clock, and how quick answers bank time for the long scenarios.",
      minutes: 25,
      objectives: ["You can recognise the recurring maths and computing question templates and recall the one fact that decides each", "You can work out shape, eigenvalue, sigmoid, probability and code-output questions by hand in seconds", "You can name the slip behind a wrong option, such as a dropped minus sign or a skipped step"],
      load: () => import('./prelim-maths-computing.mdx'),
    },
    {
      slug: "prelim-ml-genai",
      title: "2026 Prelim: AI/ML/DL and Generative AI",
      summary: "The AI and GenAI questions sorted into concept clusters, seven model solutions, the confusable pairs that decide them and how their wrong options are built.",
      minutes: 25,
      objectives: ["You can place an AI or GenAI question in its concept cluster and name the confusable pair that decides it", "You can state the one-line difference in key pairs such as bagging and boosting, BERT and GPT, and self- and cross-attention", "You can count LoRA's trainable parameters for one weight matrix", "You can name the trap behind a wrong option, such as a twin, an opposite effect or a filler"],
      load: () => import('./prelim-ml-genai.mdx'),
    },
    {
      slug: "prelim-problem-solving",
      title: "2026 Prelim: Problem-solving scenarios",
      summary: "The long scenario questions: a question-line-first reading method, the few diagnoses they repeat, their trigger phrases and a pacing plan.",
      minutes: 25,
      objectives: ["You can read a long scenario question line first and pick out the two or three numbers that decide it", "You can diagnose a scenario from one deciding number: the train–validation gap, chance level, the positive share or features against samples", "You can work out precision and recall from a scenario's counts without a calculator", "You can match a trigger phrase, such as an out-of-memory error, to its diagnosis and fix"],
      load: () => import('./prelim-problem-solving.mdx'),
    },
    {
      slug: "final-mcqs-and-trends",
      title: "2026 Final MCQs and the 2025 paper",
      summary: "How to read the 2026 Final's code MCQs line by line, a key to all 20, the definition-level 2025 MCQs and what the trend says about 2027.",
      minutes: 30,
      objectives: ["You can find the decisive line in a code snippet of 8 to 24 lines by checking it against a rule you know", "You can predict what common training-code bugs do, such as summed gradients, a flipped update sign or a 0/0 in IoU", "You can describe how the MCQs changed from 2025 to the 2026 Final and what that means for 2027"],
      load: () => import('./final-mcqs-and-trends.mdx'),
    },
  ],
}

export default mod
