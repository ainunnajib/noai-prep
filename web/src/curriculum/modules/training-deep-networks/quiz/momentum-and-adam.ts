import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'training-deep-networks.momentum-and-adam.1',
    prompt: 'An exponential moving average uses $m_t = \\beta m_{t-1} + (1-\\beta) g_t$ with $\\beta = 0.5$ and $m_0 = 0$. The first two values are $g_1 = 4$ and $g_2 = 8$. What is $m_2$?',
    options: ['5', '6', '8', '3'],
    answer: 0,
    explanation:
      '$m_1 = 0.5 \\times 0 + 0.5 \\times 4 = 2$, then $m_2 = 0.5 \\times 2 + 0.5 \\times 8 = 1 + 4 = 5$. The plain average of 4 and 8 is 6, but the EMA starts from $m_0 = 0$, which drags the early values down (bias correction would give $5 / (1 - 0.25) \\approx 6.67$).',
    difficulty: 'beginner',
  },
  {
    id: 'training-deep-networks.momentum-and-adam.2',
    prompt:
      'Gradient descent on a long, narrow valley zig-zags from wall to wall while creeping along the floor. You add momentum with $\\beta = 0.9$. Why does the path improve?',
    options: [
      'Gradient components that flip sign each step cancel in the running average, while components that keep the same sign add up',
      'Momentum lowers the learning rate in steep directions by dividing each step by the size of recent gradients',
      'Momentum computes second derivatives, so it can step straight to the bottom of the valley',
      'Momentum adds random noise to the gradient, which knocks the parameters off the valley walls',
    ],
    answer: 0,
    explanation:
      'Across the valley the gradient alternates $+, -, +, \\dots$, so the velocity $v = \\beta v + g$ stays small (about $\\pm 0.53$ for $\\beta = 0.9$); along the valley it is steady, so the velocity builds up towards $1/(1-\\beta) = 10$ times a single step. Dividing by recent gradient size is what RMSProp does, not momentum.',
    difficulty: 'intermediate',
  },
  {
    id: 'training-deep-networks.momentum-and-adam.3',
    prompt: 'Training with Adagrad goes well at first, but after many epochs the loss stops improving even though the model is far from good. Switching to RMSProp fixes it. What is the most likely reason?',
    options: [
      "Adagrad divides by the root of the running sum of all past squared gradients, which only grows, so its steps shrink towards zero; RMSProp uses a moving average that forgets old gradients",
      'Adagrad has no learning rate, so it cannot take large steps; RMSProp adds a learning rate to fix this',
      "Adagrad uses momentum, which overshoots the minimum; RMSProp removes the momentum term to stop overshooting",
      'Adagrad divides by a moving average of squared gradients that forgets too quickly; RMSProp sums every past squared gradient instead',
    ],
    answer: 0,
    explanation:
      "Adagrad's denominator $\\sqrt{g_1^2 + g_2^2 + \\dots + g_t^2}$ keeps growing, so for a steady gradient its step falls like $1/\\sqrt{t}$ and eventually stalls. RMSProp replaces the sum with an exponential moving average, which stays the size of recent gradients. The last option describes the two methods the wrong way round.",
    difficulty: 'intermediate',
  },
  {
    id: 'training-deep-networks.momentum-and-adam.4',
    prompt:
      "On Adam's very first update ($t = 1$, $\\beta_1 = 0.9$, $\\beta_2 = 0.999$, with bias correction), a weight has gradient $g = 0.02$ and the learning rate is $\\eta = 0.001$. By about how much does the weight change?",
    options: ['0.001', '0.00002', '0.0032', '0.02'],
    answer: 0,
    explanation:
      'With bias correction, $\\hat m_1 = g$ and $\\hat v_1 = g^2$, so the step is $\\eta \\times g / |g| = \\eta = 0.001$ whatever the size of $g$. Plain SGD would move by $\\eta g = 0.00002$; skipping bias correction gives $\\eta \\times 0.1 g / \\sqrt{0.001 g^2} \\approx 3.16\\,\\eta \\approx 0.0032$.',
    difficulty: 'advanced',
  },
  {
    id: 'training-deep-networks.momentum-and-adam.5',
    prompt: 'A team adds weight decay by passing `weight_decay=0.01` to `torch.optim.Adam`, which adds $\\lambda w$ to each gradient. Why is `torch.optim.AdamW` usually the better choice?',
    options: [
      "In Adam the added $\\lambda w$ is divided by $\\sqrt{\\hat v}$, so weights with large gradients are barely decayed; AdamW applies the decay to the weights directly, so every weight shrinks by the same fraction",
      'AdamW turns off the second-moment estimate $v$, so weight decay becomes the only regulariser and works more strongly',
      "Adam ignores the `weight_decay` argument entirely, while AdamW is the only PyTorch optimiser that supports weight decay",
      'AdamW applies weight decay only to the biases, which prevents the weights from shrinking too much',
    ],
    answer: 0,
    explanation:
      "Adding $\\lambda w$ to the gradient is L2 regularisation; Adam's per-parameter division by $\\sqrt{\\hat v}$ then distorts it. AdamW decouples it: $w \\leftarrow w - \\eta(\\hat m/(\\sqrt{\\hat v}+\\epsilon) + \\lambda w)$. Adam does accept `weight_decay`; it just applies it in the less effective, coupled way.",
    difficulty: 'intermediate',
  },
]

export default questions
