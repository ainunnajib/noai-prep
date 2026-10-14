import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'maths-foundations.sigma-notation-and-subscripts.1',
    prompt: 'With $x = [4, 1, 2]$, what is $\\sum_{i=1}^{3} x_i^2$?',
    options: ['21', '49', '14', '16'],
    answer: 0,
    explanation:
      'Square each term first, then add: $4^2 + 1^2 + 2^2 = 16 + 1 + 4 = 21$. Adding first and then squaring gives $(4 + 1 + 2)^2 = 49$, which is $\\left(\\sum x_i\\right)^2$, a different quantity. 14 doubles instead of squaring, and 16 is only the first term.',
    difficulty: 'beginner',
  },
  {
    id: 'maths-foundations.sigma-notation-and-subscripts.2',
    prompt: 'In a dataset written with the notation of the 2025 NOAI Final, what does $x_2^{(3)}$ refer to?',
    options: [
      'Feature 2 of training example 3',
      'Feature 3 of training example 2',
      'Feature 2 raised to the power 3',
      'The predicted output for example 3',
    ],
    answer: 0,
    explanation:
      'The bracketed superscript $(i)$ picks the example (the row) and the subscript $j$ picks the feature (the column), so $x_2^{(3)}$ is the cell in row 3, column 2. The brackets are there precisely so that it is not read as a power, and a prediction would wear a hat: $\\hat{y}^{(3)}$.',
    difficulty: 'beginner',
  },
  {
    id: 'maths-foundations.sigma-notation-and-subscripts.3',
    prompt: 'Which NumPy expression computes $\\frac{1}{m}\\sum_{i=1}^{m}\\left(\\hat{y}^{(i)} - y^{(i)}\\right)^2$ for arrays `y_hat` and `y` of length $m$?',
    options: ['`np.mean(y_hat - y) ** 2`', '`np.sum((y_hat - y) ** 2)`', '`np.mean((y_hat - y) ** 2)`', '`np.mean(y_hat ** 2 - y ** 2)`'],
    answer: 2,
    explanation:
      'Read from the inside out: subtract, square each error, then average (sum and divide by $m$), which is `np.mean((y_hat - y) ** 2)`, the MSE. `np.mean(y_hat - y) ** 2` squares the *average* error, so errors of $+3$ and $-3$ cancel to 0. `np.sum(...)` forgets the $\\frac{1}{m}$, and $\\hat{y}^2 - y^2$ is not $(\\hat{y} - y)^2$.',
    difficulty: 'intermediate',
  },
  {
    id: 'maths-foundations.sigma-notation-and-subscripts.4',
    prompt:
      'A model gives three independent test examples the probabilities $0.5$, $0.2$ and $0.1$ for their true labels. What is the likelihood $\\prod_{i=1}^{3} p_i$, the probability that all three labels are right?',
    options: ['$0.8$', '$0.27$', '$0.001$', '$0.01$'],
    answer: 3,
    explanation:
      '$\\Pi$ multiplies: $0.5 \\times 0.2 \\times 0.1 = 0.1 \\times 0.1 = 0.01$. Independent probabilities multiply, which is why likelihoods use $\\Pi$. 0.8 is the sum ($\\Sigma$ instead of $\\Pi$), 0.27 is roughly the mean, and 0.001 comes from losing a decimal place.',
    difficulty: 'beginner',
  },
  {
    id: 'maths-foundations.sigma-notation-and-subscripts.5',
    prompt: 'A student translates $\\sum_{i=1}^{n} x_i$ into Python by copying the "start at 1" from the maths. What does this code print?',
    code: 'x = [4, 5, 6]\ntotal = 0\nfor i in range(1, len(x)):\n    total = total + x[i]\nprint(total)',
    options: ['`15`', '`IndexError: list index out of range`', '`11`', '`6`'],
    answer: 2,
    explanation:
      '`range(1, 3)` gives `i = 1, 2`, so the loop adds `x[1] + x[2] = 5 + 6 = 11` and silently skips `x[0] = 4`. Python lists start at index 0, so $\\sum_{i=1}^{n} x_i$ becomes `range(len(x))` (or simply `sum(x)`, which prints 15). No error is raised, which makes this bug easy to miss.',
    difficulty: 'intermediate',
  },
]

export default questions
