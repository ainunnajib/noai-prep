import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'prelim-speed-toolkit.pacing-and-elimination.1',
    prompt: 'The Prelim has 150 questions in 90 minutes. On the must-hit line of 36 seconds per question, which question should you have finished at the 60-minute checkpoint?',
    options: ['Q100', 'Q120', 'Q90', 'Q60'],
    answer: 0,
    explanation:
      '60 minutes is 3600 s, and $3600 \\div 36 = 100$. Equivalently, 25 questions per 15 minutes gives $4 \\times 25 = 100$. Q120 is the faster 30-second target line ($2 \\times 60$), and Q60 confuses minutes with questions.',
    difficulty: 'beginner',
  },
  {
    id: 'prelim-speed-toolkit.pacing-and-elimination.2',
    prompt:
      'At the 30:00 checkpoint you have just finished Q38. You have been solving every question fully before moving on. What is the best change of plan?',
    options: [
      'Cap each question at about 30 s from now: if it is not done, leave a best guess, note its number and move on',
      'Keep solving every question fully, then use the final 15 minutes of the paper to catch up on the rest',
      'Leave the slow questions blank so that no time is wasted choosing answers you are unsure about',
      'Return to Q1 and double-check the first 38 answers, since accuracy matters more than reaching the end of the paper',
    ],
    answer: 0,
    explanation:
      'The must-hit line at 30:00 is Q50, so you are 12 questions behind with 60 minutes left. Capping time per question gets you to the end, and a guess left behind is worth $\\frac14$ of a mark on average while a blank is worth 0. Catching up at the end fails because the final questions tend to be the longest.',
    difficulty: 'intermediate',
  },
  {
    id: 'prelim-speed-toolkit.pacing-and-elimination.3',
    prompt:
      'A question asks: "What does recall measure?" One option reads: "Of all the items the model predicted positive, the fraction that are actually positive." Which heuristic lets you strike it?',
    options: [
      'Swapped terms: it describes precision, the partner metric, instead of recall',
      'Absolute word: it makes a claim about all the items, with no exceptions',
      'Clashes with the stem: it contradicts a number or a fact that the question itself gives',
      'Vague or empty: it names no mechanism, only a general impression',
    ],
    answer: 0,
    explanation:
      'Dividing by everything **predicted** positive is precision, $\\frac{TP}{TP+FP}$. Recall divides by everything **actually** positive, $\\frac{TP}{TP+FN}$. The word "all" here is part of a precise definition, not an overclaim, so the absolute-word rule does not apply.',
    difficulty: 'intermediate',
  },
  {
    id: 'prelim-speed-toolkit.pacing-and-elimination.4',
    prompt:
      'With 2 minutes left you have 10 questions you cannot solve. In each one, two of the four options begin with "always", "never" or "only", so you strike those two and guess between the other two. How many marks do you expect to gain from these 10 guesses? (No negative marking.)',
    options: ['5', '2.5', '3.3', '10'],
    answer: 0,
    explanation:
      'Absolute-word options were almost never right in 2026 (1 of 50), so striking them is a safe bet. With 2 options left, each guess is worth $\\frac12$ of a mark on average, so $10 \\times \\frac12 = 5$. Blind guesses among 4 would give $10 \\times \\frac14 = 2.5$, and striking only one option gives $10 \\times \\frac13 \\approx 3.3$.',
    difficulty: 'beginner',
  },
  {
    id: 'prelim-speed-toolkit.pacing-and-elimination.5',
    prompt: 'How did the last 30 questions of the 2026 Prelim differ from the first 60?',
    options: [
      'They were mostly scenario, comparison and "why" questions, with roughly six times as much text to read',
      'They were mostly multi-step calculations that would have needed a calculator to finish in the time allowed',
      'They were worth two marks each, so the setters made them harder and placed them last',
      'They were short recall questions about the same topics, mixed in random order across domains',
    ],
    answer: 0,
    explanation:
      'The paper ran in domain blocks and ended with Problem solving: the last 30 had a median of about 690 characters against about 110 for the first 60, and most were scenarios or comparisons. Every question was worth 1 mark, and the few calculations were short enough to do mentally, mostly in the Mathematics block at the start.',
    difficulty: 'beginner',
  },
]

export default questions
