import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'past-paper-walkthroughs.prelim-maths-computing.1',
    prompt: 'A $2 \\times 2$ matrix has eigenvalues $5$ and $-2$. What is its determinant?',
    options: ['$-10$', '$3$', '$10$', '$7$'],
    answer: 0,
    explanation:
      'The determinant is the product of the eigenvalues: $5 \\times (-2) = -10$. The sum $5 + (-2) = 3$ is the trace, a different quantity. $10$ drops the minus sign, and $7$ is $5 - (-2)$. Since $-10 \\neq 0$, the matrix is invertible.',
    difficulty: 'beginner',
  },
  {
    id: 'past-paper-walkthroughs.prelim-maths-computing.2',
    prompt: 'What does this code print?',
    code: 'import numpy as np\nA = np.zeros((4, 3))\nB = np.ones((3, 2))\nprint((A @ B).shape)',
    options: ['`(4, 2)`', '`(3, 3)`', '`(4, 3)`', 'An error, because the shapes differ'],
    answer: 0,
    explanation:
      'This is the shape-of-a-product template in code: $(4 \\times 3)(3 \\times 2)$. The inner 3s match and cancel, leaving $(4, 2)$. The shapes do not need to be equal, only the inner pair must agree. `(3, 3)` is the inner pair, which is exactly what disappears.',
    difficulty: 'beginner',
  },
  {
    id: 'past-paper-walkthroughs.prelim-maths-computing.3',
    prompt:
      'Every hidden layer of a 10-layer network uses the sigmoid. Using $\\sigma\'(x) = \\sigma(x)(1 - \\sigma(x))$, what is the most each sigmoid can multiply the backpropagated gradient by, and what follows?',
    options: [
      'At most $0.25$, so ten layers can shrink the gradient below a millionth of its size',
      'At most $1$, so the gradient passes through every layer without shrinking',
      'At most $0.5$, because $\\sigma(0) = 0.5$, so the gradient halves at each layer',
      'At most $e$, because the sigmoid is built from $e^{-x}$, so the gradients tend to explode instead',
    ],
    answer: 0,
    explanation:
      '$\\sigma(1 - \\sigma)$ is largest when $\\sigma = 0.5$, giving $0.5 \\times 0.5 = 0.25$. Ten such factors multiply the gradient by at most $0.25^{10} \\approx 9.5 \\times 10^{-7}$, so unless the weights are large enough to compensate, the gradient vanishes. The tempting $0.5$ is the value of $\\sigma(0)$, not of its slope.',
    difficulty: 'intermediate',
  },
  {
    id: 'past-paper-walkthroughs.prelim-maths-computing.4',
    prompt:
      'A training loop calls `loss.backward()` and `optimiser.step()` every iteration but never calls `optimiser.zero_grad()`. Each iteration on its own would give the weight $w$ a gradient of $0.3$. What gradient does `optimiser.step()` use for $w$ in the third iteration?',
    options: ['$0.9$', '$0.3$', '$0$, because the gradients cancel out', 'None: PyTorch raises an error on the second iteration'],
    answer: 0,
    explanation:
      '`backward()` adds into `.grad`, so after three iterations `w.grad` $= 0.3 + 0.3 + 0.3 = 0.9$, and the step is three times too big. There is no error, because each iteration builds a fresh graph with a new forward pass. That is why `zero_grad()` belongs at the start of every step.',
    difficulty: 'intermediate',
  },
  {
    id: 'past-paper-walkthroughs.prelim-maths-computing.5',
    prompt: 'What do these two lines print?',
    code: 'import numpy as np\nprint([1, 2] * 2)\nprint(np.array([1, 2]) * 2)',
    options: ['`[1, 2, 1, 2]` and then `[2 4]`', '`[2, 4]` and then `[2 4]`', '`[1, 2, 1, 2]` and then `[1 2 1 2]`', '`[2, 4]` and then `[1 2 1 2]`'],
    answer: 0,
    explanation:
      'This is the Python-output template. `*` on a Python list repeats the list, so `[1, 2] * 2` is `[1, 2, 1, 2]`. On a NumPy array, `*` works element by element, so every entry is doubled: `[2 4]` (NumPy prints arrays without commas). The tempting `[2, 4]` for the list treats it as if it were already a NumPy array.',
    difficulty: 'beginner',
  },
  {
    id: 'past-paper-walkthroughs.prelim-maths-computing.6',
    prompt: 'Two fair six-sided dice are rolled. What is the probability that their total is 7?',
    options: ['$\\tfrac{1}{6}$', '$\\tfrac{7}{36}$', '$\\tfrac{1}{11}$', '$\\tfrac{1}{12}$'],
    answer: 0,
    explanation:
      'Count outcomes: the two dice give $6 \\times 6 = 36$ equally likely ordered pairs, and six of them total 7: (1, 6), (2, 5), (3, 4), (4, 3), (5, 2), (6, 1). So $P = 6/36 = 1/6$. $\\tfrac{1}{11}$ wrongly treats the 11 possible totals (2 to 12) as equally likely, and $\\tfrac{1}{12}$ counts only the 3 unordered pairs.',
    difficulty: 'beginner',
  },
]

export default questions
