import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'maths-foundations.powers-and-exponentials.1',
    prompt: 'What is the value of $\\dfrac{2^5 \\times 2^{-2}}{2^3}$?',
    options: ['$1$', '$0$', '$2$', '$\\tfrac{1}{8}$'],
    answer: 0,
    explanation:
      'Add the exponents on top, then subtract the bottom one: $2^{5 + (-2) - 3} = 2^0 = 1$. Any non-zero number to the power 0 is 1, not 0. Check with plain numbers: $32 \\times \\tfrac14 = 8$ and $8 \\div 8 = 1$.',
    difficulty: 'beginner',
  },
  {
    id: 'maths-foundations.powers-and-exponentials.2',
    prompt: 'Three learning rates are written in code as `3e-4`, `1e-3` and `5e-5`. Which list puts them from smallest to largest?',
    options: ['`5e-5`, `3e-4`, `1e-3`', '`1e-3`, `3e-4`, `5e-5`', '`3e-4`, `5e-5`, `1e-3`', '`1e-3`, `5e-5`, `3e-4`'],
    answer: 0,
    explanation:
      'Compare the exponents first: $-5 < -4 < -3$, so $5 \\times 10^{-5} = 0.00005$ is smallest, then $3 \\times 10^{-4} = 0.0003$, then $1 \\times 10^{-3} = 0.001$. Ordering by the front numbers (1, 3, 5) ignores the exponents, and the more negative exponent is the smaller number, not the larger.',
    difficulty: 'beginner',
  },
  {
    id: 'maths-foundations.powers-and-exponentials.3',
    prompt:
      'In a 10-layer network the gradient is multiplied by about $0.25$ at every layer on its way back to the first layer. Roughly what fraction of the original signal reaches the first layer?',
    options: ['about $10^{-6}$ (one millionth)', 'about $2.5$', 'about $0.025$', 'about $0.25$ (a quarter)'],
    answer: 0,
    explanation:
      'Ten multiplications by 0.25 give $0.25^{10} = \\dfrac{1}{4^{10}} = \\dfrac{1}{2^{20}} \\approx \\dfrac{1}{10^6}$, about one millionth: a vanishing gradient. $2.5$ multiplies 0.25 by 10 and $0.025$ divides it by 10, instead of multiplying 0.25 by itself 10 times; a quarter forgets that the factors compound layer after layer.',
    difficulty: 'intermediate',
  },
  {
    id: 'maths-foundations.powers-and-exponentials.4',
    prompt: 'Softmax turns raw scores into probabilities by first computing $e^{z}$ for every score $z$. Why use $e^{z}$ for that first step?',
    options: [
      '$e^{z}$ is positive for every $z$, so even a negative score becomes a positive weight',
      '$e^{z}$ always lies between 0 and 1, so each score becomes a probability straight away',
      '$e^{z}$ turns negative scores into exactly 0, which removes the unlikely classes',
      '$e^{z}$ keeps the sign of each score, so negative scores give negative probabilities',
    ],
    answer: 0,
    explanation:
      '$e^{z} > 0$ for every real $z$ (for example $e^{-1} \\approx 0.37$), so after dividing by the total every probability is positive and they add up to 1. $e^{z}$ is not capped at 1 ($e^2 \\approx 7.39$), which is why the division step is needed; turning negatives into 0 describes ReLU, not $e^{z}$.',
    difficulty: 'intermediate',
  },
  {
    id: 'maths-foundations.powers-and-exponentials.5',
    prompt: 'What does this Python code print?',
    code: 'a = 2 ** 10\nb = 0.5 ** 10 < 0.001\nc = 10 ** -2\nprint(a, b, c)',
    options: ['`1024 True 0.01`', '`20 False -20`', '`1024 False 0.01`', '`1024 True -100`'],
    answer: 0,
    explanation:
      '`**` is the power operator. $2^{10} = 1024$; $0.5^{10} = \\tfrac{1}{1024} \\approx 0.00098$, which is just below 0.001, so the comparison is `True`; and $10^{-2} = \\tfrac{1}{100} = 0.01$. A negative exponent gives a small positive number, never a negative one, and `2 ** 10` is not $2 \\times 10$.',
    difficulty: 'beginner',
  },
]

export default questions
