import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "past-paper-walkthroughs",
  order: 36,
  part: "exam",
  domain: "exam",
  title: "Past-paper walkthroughs",
  tagline: "Every real question, explained",
  summary: "Guided walkthroughs of the 2026 Prelim by domain, its long problem-solving scenarios, the code-reading MCQs of the 2026 Final, and the 2025 MCQs, with the pattern behind each question and the anatomy of its distractors.",
  prerequisites: ["prelim-speed-toolkit"],
  syllabus: ["NOAI 2026 Preliminary Round (300 MCQs) by domain", "NOAI 2026 Final Section 1 (20 code-reading MCQs)", "NOAI 2025 MCQs", "Cross-year trends and distractor patterns"],
  lessons: [
    {
      slug: "prelim-maths-computing",
      title: "2026 Prelim: Mathematics and Computing",
      summary: "Every question pattern from the maths and computing sections, solved with the fastest method.",
      minutes: 22,
      objectives: ["You can solve each recurring maths and computing question pattern within the time budget", "You can link each pattern to its lesson"],
      load: () => import('./prelim-maths-computing.mdx'),
    },
    {
      slug: "prelim-ml-genai",
      title: "2026 Prelim: AI/ML/DL and Generative AI",
      summary: "Definitions, architectures and model-behaviour questions from the AI and GenAI sections, and how their distractors are built.",
      minutes: 22,
      objectives: ["You can map each AI and GenAI question to its concept cluster", "You can explain the key fact behind each answer", "You can name the trap in each distractor"],
      load: () => import('./prelim-ml-genai.mdx'),
    },
    {
      slug: "prelim-problem-solving",
      title: "2026 Prelim: Problem-solving scenarios",
      summary: "Long scenario questions about training logs, metrics and systems, with a reading method that saves time.",
      minutes: 22,
      objectives: ["You can read a scenario question stem-first and extract the key numbers", "You can map a scenario to a known diagnosis pattern", "You can name the keyword that decides a scenario (e.g. oscillating loss → learning rate)"],
      load: () => import('./prelim-problem-solving.mdx'),
    },
    {
      slug: "final-mcqs-and-trends",
      title: "2026 Final MCQs and the 2025 paper",
      summary: "The 20 code-reading MCQs of the 2026 Final, the 20 definition-level 2025 MCQs, and what the trend says about 2027.",
      minutes: 25,
      objectives: ["You can find the faulty line in a 15 to 30 line code snippet", "You can explain each 2026 Final MCQ with its concept and line", "You can describe how question style changed from 2025 to 2026"],
      load: () => import('./final-mcqs-and-trends.mdx'),
    },
  ],
}

export default mod
