import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'backpropagation.network-from-scratch.1',
    prompt:
      'A batch `X` has shape `(32, 10)`, the hidden layer has 64 units and there are 3 classes. What is the shape of `dW2 = A1.T @ dZ2`?',
    options: ['`(64, 3)`', '`(32, 3)`', '`(3, 64)`', '`(32, 64)`'],
    answer: 0,
    explanation:
      '`A1` is `(32, 64)` and `dZ2` is `(32, 3)`, so `A1.T @ dZ2` is `(64, 32) @ (32, 3)`, giving `(64, 3)`: exactly the shape of `W2`, as every gradient must be. `(32, 3)` is the shape of `dZ2` itself, `(3, 64)` is `W2` transposed, and `(32, 64)` is the shape of `A1`.',
    difficulty: 'beginner',
  },
  {
    id: 'backpropagation.network-from-scratch.2',
    prompt:
      'A 2-class softmax classifier outputs $p = (0.9, 0.1)$ for an example whose true class is class 1. With cross-entropy loss, what is $\\partial L / \\partial z$ (the gradient at the two logits) for this example?',
    options: ['$(0.9,\\ -0.9)$', '$(-0.9,\\ 0.9)$', '$(-0.1,\\ 0.1)$', '$(0.9,\\ 0.1)$'],
    answer: 0,
    explanation:
      'The gradient is $p - y = (0.9 - 0,\\ 0.1 - 1) = (0.9, -0.9)$. Gradient descent moves against it, so logit 1 goes up and logit 0 goes down, strongly, because the model was confidently wrong. $(-0.9, 0.9)$ is $y - p$, which points uphill; $(-0.1, 0.1)$ is what you would get if the true class were 0; and $(0.9, 0.1)$ is $p$ itself, which forgets to subtract $y$.',
    difficulty: 'intermediate',
  },
  {
    id: 'backpropagation.network-from-scratch.3',
    prompt: 'In what order does one training step of a neural network happen?',
    options: [
      'Forward pass → loss → backward pass → update the weights',
      'Forward pass → backward pass → loss → update the weights',
      'Loss → forward pass → update the weights → backward pass',
      'Forward pass → loss → update the weights → backward pass',
    ],
    answer: 0,
    explanation:
      'The loss needs the predictions from the forward pass; the backward pass starts at the loss (from $\\partial L/\\partial L = 1$, which for softmax with cross-entropy becomes $dZ_2 = (P - Y)/N$ at the logits); and the update needs the gradients. Computing the loss after the backward pass leaves the backward pass nothing to start from, and updating before it would use stale or missing gradients.',
    difficulty: 'beginner',
  },
  {
    id: 'backpropagation.network-from-scratch.4',
    prompt: 'In the backward pass below, `dZ2` was already divided by `N`. Which line correctly computes `db1`, the gradient of the hidden-layer bias `b1` (shape `(H,)`)?',
    code: 'dA1 = dZ2 @ W2.T          # (N, H)\ndZ1 = dA1 * (Z1 > 0)      # (N, H)\ndb1 = ...',
    options: ['`db1 = dZ1.sum(axis=0)`', '`db1 = dZ1.sum(axis=1)`', '`db1 = dZ1.mean(axis=0)`', '`db1 = dZ1.sum()`'],
    answer: 0,
    explanation:
      'Each bias is added to every example, so its gradient is the upstream gradient summed over the batch: `sum(axis=0)` collapses the $N$ rows and leaves shape `(H,)`. `axis=1` gives shape `(N,)`, `sum()` gives a single number, and `mean(axis=0)` divides by $N$ a second time because `dZ2` already contains the $1/N$.',
    difficulty: 'intermediate',
  },
  {
    id: 'backpropagation.network-from-scratch.5',
    prompt:
      'Your backward pass gives $0.2500$ for one weight\'s gradient. A central-difference check gives $0.5000$ with $\\varepsilon = 10^{-3}$, and again $0.5000$ with $\\varepsilon = 10^{-5}$ and $10^{-7}$. What is the most likely explanation?',
    options: [
      'A bug in the backward pass, such as a factor of 2 missing from one of its lines',
      'The step size is too large, so truncation error dominates: retry with $\\varepsilon = 10^{-12}$',
      'Floating-point round-off in float64: switch the check to float32 so it is less sensitive',
      'Finite differences are unreliable near ReLU kinks, so the backprop value should be trusted',
    ],
    answer: 0,
    explanation:
      'Truncation and round-off errors change as $\\varepsilon$ changes, and at $\\varepsilon = 10^{-5}$ in float64 they are around $10^{-10}$, nowhere near a factor of 2. A mismatch that stays the same at every $\\varepsilon$ is a genuine bug. Float32 makes round-off worse, not better, and a kink only affects the rare weights whose neurons sit within $\\varepsilon$ of zero.',
    difficulty: 'intermediate',
  },
]

export default questions
