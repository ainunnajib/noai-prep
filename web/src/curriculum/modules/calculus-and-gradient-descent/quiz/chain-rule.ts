import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'calculus-and-gradient-descent.chain-rule.1',
    prompt: 'What is the derivative of $h(x) = e^{2x^2}$?',
    options: ['$4x\\,e^{2x^2}$', '$e^{2x^2}$', '$2x^2\\,e^{2x^2 - 1}$', '$4x\\,e^{4x}$'],
    answer: 0,
    explanation:
      'Inner $u = 2x^2$ with $\\frac{du}{dx} = 4x$; outer $e^u$ with slope $e^u$, evaluated at the inner value: $e^{2x^2}$. Multiply: $4x\\,e^{2x^2}$. Plain $e^{2x^2}$ forgets the inner factor, $2x^2 e^{2x^2-1}$ wrongly uses the power rule on an exponential, and $4x\\,e^{4x}$ evaluates the outer function at the inner derivative instead of at the inner function.',
    difficulty: 'intermediate',
  },
  {
    id: 'calculus-and-gradient-descent.chain-rule.2',
    prompt: 'For $y = (2x + 1)^4$, what is $\\frac{dy}{dx}$ at $x = 0$?',
    options: ['8', '4', '2', '1'],
    answer: 0,
    explanation:
      'Inner $u = 2x + 1 = 1$ at $x = 0$, with slope 2. Outer $u^4$ has slope $4u^3 = 4$ at $u = 1$. Multiply: $4 \\times 2 = 8$. 4 forgets the inner factor 2, 2 is only the inner slope, and 1 is the value of $y$ itself.',
    difficulty: 'beginner',
  },
  {
    id: 'calculus-and-gradient-descent.chain-rule.3',
    prompt:
      'A linear model predicts $\\hat{y} = wx + b$ and is scored with $L = (\\hat{y} - y)^2$. With $x = 3$, $w = 2$, $b = 1$ and target $y = 4$, what is $\\frac{\\partial L}{\\partial w}$?',
    options: ['18', '6', '9', '12'],
    answer: 0,
    explanation:
      'Forward: $\\hat{y} = 2 \\times 3 + 1 = 7$, so the error is $7 - 4 = 3$. Chain rule: $\\frac{\\partial L}{\\partial w} = 2(\\hat{y} - y) \\cdot x = 2 \\times 3 \\times 3 = 18$. 6 stops at $\\frac{\\partial L}{\\partial \\hat{y}}$ and forgets $x$, 9 drops the 2 from the square, and 12 multiplies by $w$ instead of $x$.',
    difficulty: 'intermediate',
  },
  {
    id: 'calculus-and-gradient-descent.chain-rule.4',
    prompt: 'This code does the backward pass for one sigmoid neuron by hand. Which statement about it is correct?',
    code: 'z = w * x + b\na = 1 / (1 + np.exp(-z))\nL = (a - y) ** 2\n\ndL_da = 2 * (a - y)\ndL_dz = dL_da * a * (1 - a)\ndL_dw = dL_dz * w',
    options: [
      '`dL_dw` should be `dL_dz * x`, because $\\partial z / \\partial w = x$',
      '`dL_dz` should be `dL_da * a`, because the sigmoid is its own derivative',
      '`dL_da` should be `(a - y)`, because the factor 2 cancels in backpropagation',
      'The code is correct as written',
    ],
    answer: 0,
    explanation:
      'Each backward step is upstream × local. For $z = wx + b$, the slope in the $w$ direction is $x$, so $\\frac{\\partial L}{\\partial w} = \\frac{\\partial L}{\\partial z} \\cdot x$; multiplying by $w$ gives $\\frac{\\partial L}{\\partial x}$ instead. The `dL_dz` line is right, because $\\sigma\' = a(1 - a)$ (being its own derivative is a property of $e^x$), and the 2 from the square is a genuine factor.',
    difficulty: 'intermediate',
  },
  {
    id: 'calculus-and-gradient-descent.chain-rule.5',
    prompt:
      'A 20-layer network with sigmoid activations is training. The last layers\' weights change steadily, but the first layers\' weights hardly change at all. Which explanation fits best?',
    options: [
      'Backpropagation multiplies about 20 local slopes, each at most 0.25 for the sigmoid, so the gradient reaching the first layers is vanishingly small',
      'Backpropagation adds about 20 local slopes, each at most 0.25 for the sigmoid, so the first layers receive an update that is far too large',
      'The sigmoid has no derivative at 0, so backpropagation stops as soon as any neuron outputs exactly 0.5',
      'The first layers see the raw input, which has larger values, so their gradients are automatically rescaled to zero',
    ],
    answer: 0,
    explanation:
      'The chain rule multiplies one factor per layer, and $\\sigma\' \\le 0.25$, so with weights of moderate size the product shrinks exponentially with depth ($0.25^{10} \\approx 10^{-6}$ after only 10 layers): the vanishing gradient problem. Gradients are multiplied, not added, and the sigmoid is smooth with slope $0.25$ at $z = 0$; nothing rescales gradients automatically.',
    difficulty: 'beginner',
  },
]

export default questions
