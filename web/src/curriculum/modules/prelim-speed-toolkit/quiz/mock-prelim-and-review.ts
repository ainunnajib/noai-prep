import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'prelim-speed-toolkit.mock-prelim-and-review.1',
    prompt: 'You want your next mock to match the real Prelim as closely as possible. Which set-up does that?',
    options: [
      '150 questions in 90 minutes, pen and scrap paper only, no calculator',
      '150 questions in 90 minutes, with a basic calculator for the arithmetic',
      '150 questions with no time limit, closed book, to measure pure knowledge',
      '150 questions in 90 minutes, with one page of your own formula notes',
    ],
    answer: 0,
    explanation:
      'The Prelim allows pen and paper for rough work only: no calculator, notes, textbooks, AI tools or websites, and 90 minutes for 150 questions. Removing the time limit hides exactly what a mock is for: whether you can reach the end at about 36 seconds a question.',
    difficulty: 'beginner',
  },
  {
    id: 'prelim-speed-toolkit.mock-prelim-and-review.2',
    prompt:
      'A mock question asked for the **median** of [1, 3, 5, 7, 100], and you answered 23.2. Reviewing it at home, you see at once that 23.2 is the mean, and that the median is 5. How should you log it?',
    options: [
      'Misread: read the question line first and circle the word that says what to compute',
      'Knowledge gap: re-study mean and median in the statistics lesson before the next mock',
      'Time pressure: move faster through the paper so that you have more time at the end',
      'Calculation slip: do more timed arithmetic drills so that sums like 116 ÷ 5 are quick',
    ],
    answer: 0,
    explanation:
      'You can do it untimed and your arithmetic was right ($116 \\div 5 = 23.2$ is the mean), so it is neither a knowledge gap nor a slip. You answered a different question from the one asked: a misread, fixed by a reading routine rather than by more study or more drills.',
    difficulty: 'beginner',
  },
  {
    id: 'prelim-speed-toolkit.mock-prelim-and-review.3',
    prompt:
      'Your true accuracy is about 60%. Using $\\text{SD} = \\sqrt{150\\,p\\,(1-p)}$, about how many marks can one 150-question mock vary by chance alone (one standard deviation)?',
    options: ['6', '36', '0.24', '15'],
    answer: 0,
    explanation:
      '$150 \\times 0.6 \\times 0.4 = 36$ and $\\sqrt{36} = 6$. So about 95% of sittings land within $\\pm 12$ marks of your true level. 36 is the variance (you forgot the square root), 0.24 is just $p(1-p)$, and 15 is 10% of 150, a guess rather than the formula.',
    difficulty: 'intermediate',
  },
  {
    id: 'prelim-speed-toolkit.mock-prelim-and-review.4',
    prompt:
      'In a mock you answered 130 questions, got 91 of them right, and left 20 blank when time ran out. If you had guessed those 20 at random (four options each), what would your expected score have been?',
    options: ['96', '91', '111', '101'],
    answer: 0,
    explanation:
      'Each random guess is right with probability $\\frac14$, so 20 guesses add $20 \\times \\frac14 = 5$ expected marks: $91 + 5 = 96$. 111 assumes every guess is right, and 101 assumes half of them are; with four options a guess is right only a quarter of the time.',
    difficulty: 'beginner',
  },
  {
    id: 'prelim-speed-toolkit.mock-prelim-and-review.5',
    prompt:
      'After three mocks your error log shows: Generative AI 14 misses (11 of them knowledge gaps), Maths 9 misses (7 of them calculation slips), and 4 or 5 misses in each other domain. Which plan follows from the log?',
    options: [
      'Study the GenAI lessons behind the gaps, and do timed arithmetic drills for Maths',
      'Sit more full mocks each week, since enough practice fixes every kind of error',
      'Do timed drills for GenAI, and re-study the Maths lessons from the very beginning',
      'Spread revision evenly over all five domains so that no domain gets neglected',
    ],
    answer: 0,
    explanation:
      'The log says where the marks are lost (GenAI, then Maths) and why: GenAI misses are mostly missing knowledge, which needs lessons; Maths misses are mostly slips, which need execution drills. Swapping the two fixes treats a gap with drills and slips with lessons; more mocks repeat the same errors; and even revision ignores the evidence.',
    difficulty: 'intermediate',
  },
]

export default questions
