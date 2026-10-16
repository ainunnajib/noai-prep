import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "prelim-speed-toolkit",
  order: 35,
  part: "exam",
  domain: "exam",
  title: "Prelim strategy and speed drills",
  tagline: "150 questions, 90 minutes, no calculator",
  summary: "A pacing, elimination and keyword-trigger method for 36-second MCQs, timed no-calculator drills for linear algebra, calculus, probability, metrics, conv arithmetic and parameter counts, speed code reading, and full mock Prelims with an error log.",
  prerequisites: ["ml-systems-and-tradeoffs", "multimodal-ai"],
  syllabus: ["NOAI 2027 Preliminary Round: 150 MCQs, 90 minutes, five domains, no calculator, no penalty", "Two-pass pacing, triage and elimination", "No-calculator arithmetic: shapes, dot products, norms, 2×2 determinants, derivatives, probabilities, metrics", "Conv output sizes, parameter counts, Big-O", "Mock exams and error logs"],
  lessons: [
    {
      slug: "pacing-and-elimination",
      title: "Pacing, triage and elimination",
      summary: "A checkpoint-based two-pass plan for 150 questions, the elimination heuristics and keyword triggers that work on NOAI options, and where the 2026 questions came from.",
      minutes: 25,
      objectives: ["You can work out where you should be at each 15-minute checkpoint and when to switch to speed mode", "You can strike distractors for a stated reason and work out what the remaining guess is worth", "You can describe how the 2026 Prelim was laid out, from short recall questions at the start to long scenarios at the end"],
      load: () => import('./pacing-and-elimination.mdx'),
    },
    {
      slug: "drill-linear-algebra",
      title: "Speed drills: shapes, dot products, norms and determinants",
      summary: "Mental shortcuts and timed drills for matrix shapes, dot products, norms, cosine similarity, and 2 × 2 determinants, inverses and eigenvalues.",
      minutes: 20,
      objectives: ["You can find the shape of a chain of matrix products, transposes included, in a few seconds", "You can compute dot products and L1 and L2 norms mentally, spotting the Pythagorean triples hidden in exam vectors", "You can find the determinant and eigenvalues of a 2 × 2 matrix and tell whether it has an inverse"],
      load: () => import('./drill-linear-algebra.mdx'),
    },
    {
      slug: "drill-calculus-probability",
      title: "Speed drills: derivatives, probabilities, metrics and anchor values",
      summary: "Instant recall of derivative facts, quick probabilities, z-scores and classification metrics, and a dozen anchor values that replace a calculator.",
      minutes: 25,
      objectives: ["You can recall the derivatives behind NOAI questions, including the sigmoid's, and explain why its slope makes gradients vanish", "You can work out Bayes probabilities and z-scores without a calculator", "You can compute precision, recall, F1 and accuracy from the four counts", "You can estimate logs and loss values such as ln 10 ≈ 2.30 from a few memorised anchors"],
      load: () => import('./drill-calculus-probability.mdx'),
    },
    {
      slug: "drill-conv-and-params",
      title: "Speed drills: conv sizes and parameter counts",
      summary: "Deep-learning arithmetic done in seconds: conv output sizes, parameter counts and the cost of common operations, without a calculator.",
      minutes: 20,
      objectives: ["You can compute conv and pooling output sizes in under 20 seconds by counting the places the window fits", "You can count the parameters of conv, linear, embedding, attention and pooling layers without a calculator", "You can say how the cost of attention grows with the number of tokens, and why"],
      load: () => import('./drill-conv-and-params.mdx'),
    },
    {
      slug: "drill-shapes-and-code",
      title: "Speed drills: shapes and code traps",
      summary: "Reading Python, NumPy and PyTorch code at speed: writing the shape on every line and spotting the dozen traps that recur in past papers.",
      minutes: 20,
      objectives: ["You can write the shape after each line of NumPy or PyTorch code, including reductions and broadcasting", "You can predict what short snippets print when they hide a view, floor division or a training-mode trap", "You can name the trap a code question is built around"],
      load: () => import('./drill-shapes-and-code.mdx'),
    },
    {
      slug: "mock-prelim-and-review",
      title: "Mock Prelims and the review loop",
      summary: "Sit a timed 150-question mock, then turn every miss into a targeted fix and track your projected score.",
      minutes: 25,
      objectives: ["You can set up a mock that matches the real Prelim's conditions", "You can classify each mistake as a knowledge gap, misread, slip or time pressure and choose its fix", "You can tell whether a change in mock scores is real or chance, and what guessing your blanks is worth"],
      load: () => import('./mock-prelim-and-review.mdx'),
    },
  ],
}

export default mod
