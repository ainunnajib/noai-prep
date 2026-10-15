import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "prelim-speed-toolkit",
  order: 35,
  part: "exam",
  domain: "exam",
  title: "Prelim strategy and speed drills",
  tagline: "150 questions, 90 minutes, no calculator",
  summary: "A pacing and elimination method for 36-second MCQs, timed no-calculator drills for linear algebra, calculus, probability, metrics, conv arithmetic and parameter counts, speed code reading and keyword triggers, and full mock Prelims with an error log.",
  prerequisites: ["ml-systems-and-tradeoffs", "multimodal-ai"],
  syllabus: ["NOAI 2027 Preliminary Round: 150 MCQs, 90 minutes, five domains, no calculator, no penalty", "Two-pass pacing, triage and elimination", "No-calculator arithmetic: shapes, dot products, norms, 2×2 determinants, derivatives, probabilities, metrics", "Conv output sizes, parameter counts, Big-O", "Mock exams and error logs"],
  lessons: [
    {
      slug: "pacing-and-elimination",
      title: "Pacing, triage and elimination",
      summary: "A two-pass plan for 150 questions, where the questions come from, and the elimination heuristics that work on NOAI options.",
      minutes: 25,
      objectives: ["You can run a two-pass pacing plan with checkpoints", "You can eliminate distractors using reliable heuristics", "You can describe how the 2026 Prelim questions were spread across domains"],
      load: () => import('./pacing-and-elimination.mdx'),
    },
    {
      slug: "drill-linear-algebra",
      title: "Speed drills: shapes, dot products, norms and determinants",
      summary: "Mental shortcuts for the most common linear-algebra computations.",
      minutes: 20,
      objectives: ["You can chain matrix shapes instantly", "You can compute dot products and norms using Pythagorean triples", "You can compute 2x2 determinants, traces and inverses mentally"],
      load: () => import('./drill-linear-algebra.mdx'),
    },
    {
      slug: "drill-calculus-probability",
      title: "Speed drills: derivatives, probabilities, metrics and anchor values",
      summary: "Instant recall of derivative facts, quick probabilities, z-scores and classification metrics, and a dozen anchor values that replace a calculator.",
      minutes: 20,
      objectives: ["You can state derivatives of common functions in under 5 seconds", "You can compute dice, complement and Bayes probabilities mentally", "You can compute precision, recall, F1 and accuracy from counts quickly", "You can estimate logs, exponentials and square roots from memorised anchor values"],
      load: () => import('./drill-calculus-probability.mdx'),
    },
    {
      slug: "drill-dl-and-code",
      title: "Speed drills: conv sizes, parameter counts and code reading",
      summary: "Deep-learning arithmetic done in seconds, and reading Python, NumPy and PyTorch code by annotating shapes and spotting traps.",
      minutes: 30,
      objectives: ["You can compute conv output sizes and layer parameter counts in under 20 seconds", "You can annotate tensor shapes line by line", "You can predict the output of short code snippets and spot common traps"],
      load: () => import('./drill-dl-and-code.mdx'),
    },
    {
      slug: "mock-prelim-and-review",
      title: "Mock Prelims and the review loop",
      summary: "Sit a timed 150-question mock, then turn every miss into a targeted fix and track your projected score.",
      minutes: 25,
      objectives: ["You can sit a full mock under exam conditions", "You can classify mistakes and plan targeted review", "You can track progress across mocks"],
      load: () => import('./mock-prelim-and-review.mdx'),
    },
  ],
}

export default mod
