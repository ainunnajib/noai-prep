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
      '$\\sigma(1 - \\sigma)$ is largest when $\\sigma = 0.5$, giving $0.5 \\times 0.5 = 0.25$. Ten such factors give at most $0.25^{10} \\approx 9.5 \\times 10^{-7}$: vanishing gradients. The tempting $0.5$ is the value of $\\sigma(0)$, not of its slope.',
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
    prompt: 'Batch gradient descent, mini-batch gradient descent and stochastic gradient descent (SGD) differ mainly in:',
    options: [
      'how many training examples are used to compute each update',
      'which learning rate is used for each update',
      'how many epochs are run before training stops',
      'whether past gradients are averaged together into each new update',
    ],
    answer: 0,
    explanation:
      'Batch GD uses all the training data for each update, SGD uses one random example, and mini-batch GD uses a small batch in between (2026 Q67–69). Averaging past gradients is momentum, a separate idea that any of the three can use, which makes it the tempting wrong answer.',
    difficulty: 'beginner',
  },
]

export default questions
