import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'neural-networks.activation-functions.1',
    prompt: 'A network has 5 layers, and each layer computes $W\\mathbf{x} + \\mathbf{b}$ with **no** activation function. Which statement is true?',
    options: [
      'It can only represent functions that a single linear layer could also represent',
      'It can approximate any continuous function, provided each layer is wide enough',
      'It behaves like a degree-5 polynomial, one degree for each stacked layer',
      'It overfits less than a single layer, because the extra depth acts as regularisation',
    ],
    answer: 0,
    explanation:
      'Substituting one layer into the next gives $W_2(W_1\\mathbf{x} + \\mathbf{b}_1) + \\mathbf{b}_2 = (W_2W_1)\\mathbf{x} + (W_2\\mathbf{b}_1 + \\mathbf{b}_2)$, which is again one linear layer; repeating this collapses all 5. The "approximate any continuous function" result (universal approximation) needs a non-linear activation, and multiplying linear maps never raises the degree above 1.',
    difficulty: 'beginner',
  },
  {
    id: 'neural-networks.activation-functions.2',
    prompt: 'Which pairing of activation function and output range is correct?',
    options: ['tanh: $(-1, 1)$', 'sigmoid: $(-1, 1)$', 'ReLU: $(0, 1)$', 'Leaky ReLU: $[0, \\infty)$'],
    answer: 0,
    explanation:
      'tanh squashes to $(-1, 1)$ and is centred on 0. The sigmoid squashes to $(0, 1)$, ReLU outputs $[0, \\infty)$ (0 for negatives, the input itself for positives), and Leaky ReLU can be negative too, since it outputs $\\alpha z$ for $z < 0$, so its range is $(-\\infty, \\infty)$.',
    difficulty: 'beginner',
  },
  {
    id: 'neural-networks.activation-functions.3',
    prompt:
      "The sigmoid's slope is $\\sigma'(z) = \\sigma(z)(1 - \\sigma(z))$, which is largest at $z = 0$. A gradient passes backwards through 5 sigmoid neurons in a row, each at $z = 0$. Ignoring the weights, by what factor is it multiplied?",
    options: ['$\\frac{1}{1024}$, about 0.001', '$\\frac{5}{4}$, that is 1.25', '$\\frac{1}{32}$, that is 0.03125', '$\\frac{1}{4}$, that is 0.25'],
    answer: 0,
    explanation:
      "At $z = 0$, $\\sigma = 0.5$, so $\\sigma'(0) = 0.5 \\times 0.5 = 0.25$. Each layer multiplies the gradient by 0.25, so five layers give $0.25^5 = \\frac{1}{4^5} = \\frac{1}{1024}$. Adding $5 \\times 0.25$ is the wrong operation, and $\\frac{1}{32} = 0.5^5$ uses $\\sigma(0)$ instead of its slope. This shrinking is the vanishing-gradient problem, and it is the best case: away from $z = 0$ the slope is even smaller.",
    difficulty: 'intermediate',
  },
  {
    id: 'neural-networks.activation-functions.4',
    prompt:
      'After training with a very large learning rate, 40% of the ReLU neurons in a hidden layer output 0 for every training example, and their weights no longer change at all. What is the best fix?',
    options: [
      'Retrain with a smaller learning rate and Leaky ReLU, so negative inputs still pass a small gradient',
      'Keep training for more epochs at the same rate, so the stuck neurons have time to recover by themselves',
      'Raise the learning rate further and keep ReLU, so the updates become big enough to push the stuck neurons back',
      'Remove the bias terms from that layer and retrain, so the neurons can no longer shift their inputs below zero',
    ],
    answer: 0,
    explanation:
      'These are dead ReLUs: $z \\le 0$ for every input, so the output and the slope are both 0 and their own weights get exactly zero gradient. Extra training cannot move their weights at any learning rate, since any step size times 0 is 0 (only changes in earlier layers could ever switch them back on). Leaky ReLU keeps a slope of $\\alpha$ for negative inputs, so gradient still flows, and a smaller learning rate avoids the huge updates that pushed them there. Removing biases does not stop $\\mathbf{w}\\cdot\\mathbf{x}$ itself being negative for every input.',
    difficulty: 'intermediate',
  },
  {
    id: 'neural-networks.activation-functions.5',
    prompt: 'What does this code print?',
    code: 'import numpy as np\n\nz = np.array([-2.0, 0.0, 3.0])\nprint(np.maximum(0.1 * z, z))',
    options: ['`[-0.2  0.   3. ]`', '`[0. 0. 3.]`', '`[-0.2  0.   0.3]`', '`[-2.  0.  3.]`'],
    answer: 0,
    explanation:
      '`np.maximum` compares element by element: $\\max(-0.2, -2) = -0.2$, $\\max(0, 0) = 0$ and $\\max(0.3, 3) = 3$. That is Leaky ReLU with $\\alpha = 0.1$: positives pass unchanged and negatives are scaled by 0.1. Plain ReLU (`np.maximum(0, z)`) would give `[0. 0. 3.]`.',
    difficulty: 'beginner',
  },
]

export default questions
