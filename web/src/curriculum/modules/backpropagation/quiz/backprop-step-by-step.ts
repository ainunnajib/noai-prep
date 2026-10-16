import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'backpropagation.backprop-step-by-step.1',
    prompt: 'Why does backpropagation visit the nodes of a computational graph in the reverse of the forward order?',
    options: [
      'Each node needs the finished gradients of all the nodes that use its output, which come later in the forward pass',
      'Gradients are smaller near the output, so starting there reduces rounding errors in the arithmetic',
      'The forward pass deletes the intermediate values, so they must be recomputed from the output end',
      'Reversing the order lets the weights be updated during the same sweep that computes the loss',
    ],
    answer: 0,
    explanation:
      'A node\'s gradient is (sum over its users of) upstream × local, and its users all come after it in the forward pass. Starting at the loss with $\\partial L/\\partial L = 1$ and moving backwards guarantees each upstream gradient is complete before it is needed. The forward pass actually **keeps** the intermediate values because the backward pass needs them, and updating weights is the optimiser\'s job, done afterwards.',
    difficulty: 'intermediate',
  },
  {
    id: 'backpropagation.backprop-step-by-step.2',
    prompt:
      'A value $x$ feeds two nodes. During the backward pass, the first sends back a gradient of $2$ and the second a gradient of $-5$. What is $\\partial L / \\partial x$?',
    options: ['$-3$', '$-5$', '$-10$', '$7$'],
    answer: 0,
    explanation:
      'When a value is used in several places its gradients **add** (one chain-rule product per path): $2 + (-5) = -3$. Answering $-5$ is the classic bug of overwriting `grad = ...` instead of accumulating `grad += ...`, which keeps only the last path. Multiplying the two ($-10$) or adding their sizes ($7$) has no basis in the chain rule.',
    difficulty: 'beginner',
  },
  {
    id: 'backpropagation.backprop-step-by-step.3',
    prompt:
      'In an MLP, weight $w$ connects a hidden neuron with activation $h = 0.5$ to an output neuron whose delta is $\\delta = \\partial L / \\partial z = -4$. What is $\\partial L / \\partial w$?',
    options: ['$-2$', '$-8$', '$-4$', '$-4.5$'],
    answer: 0,
    explanation:
      'The output neuron computes $z = \\dots + h\\,w + \\dots$, and a multiply node sends each input the upstream gradient times the other input: $\\partial L/\\partial w = h \\times \\delta = 0.5 \\times (-4) = -2$. $-8$ divides by $0.5$ instead of multiplying, $-4$ forgets the input activation, and $-4.5$ subtracts $h$ from $\\delta$ ($-4 - 0.5$) instead of multiplying.',
    difficulty: 'intermediate',
  },
  {
    id: 'backpropagation.backprop-step-by-step.4',
    prompt:
      'For one training example, a ReLU hidden neuron has weighted sum $z = -2$. What gradient do the weights feeding **into** this neuron receive from this example?',
    options: [
      'Zero, because ReLU\'s slope at $z = -2$ is $0$, which blocks the gradient',
      'The same gradient as the other hidden neurons, because ReLU is linear',
      'A negative gradient, because the neuron\'s weighted sum is negative',
      'An undefined gradient, because ReLU has no derivative when $z \\le 0$',
    ],
    answer: 0,
    explanation:
      'For $z < 0$, ReLU outputs $0$ and is flat, so its local derivative is $0$: $\\delta = (\\text{upstream}) \\times 0 = 0$, and every incoming weight gradient $x_i \\times \\delta$ is $0$. ReLU\'s derivative is undefined only at exactly $z = 0$ (PyTorch uses 0 there); for every negative $z$ it is simply $0$, not undefined. And the sign of $z$ does not set the sign of the gradient.',
    difficulty: 'intermediate',
  },
  {
    id: 'backpropagation.backprop-step-by-step.5',
    prompt: 'What does this code print?',
    code: 'x, w, b, y = 2.0, 3.0, -4.0, 1.0\ny_hat = w * x + b\nL = (y_hat - y) ** 2\n\nd_yhat = 2 * (y_hat - y)\nd_w = d_yhat * x\nd_b = d_yhat\nprint(d_w, d_b)',
    options: ['`4.0 2.0`', '`2.0 2.0`', '`6.0 2.0`', '`4.0 4.0`'],
    answer: 0,
    explanation:
      'Forward: $\\hat y = 3 \\times 2 - 4 = 2$, so $L = (2 - 1)^2 = 1$. Backward: `d_yhat` $= 2(2 - 1) = 2$; the weight gets upstream × input $= 2 \\times 2 = 4$ and the bias gets the upstream gradient unchanged, $2$. `2.0 2.0` forgets the factor $x$, and `6.0 2.0` multiplies by $w$ instead of $x$. `4.0 4.0` multiplies the bias gradient by $x$ too, but the bias is simply added, so its local derivative is 1.',
    difficulty: 'beginner',
  },
]

export default questions
