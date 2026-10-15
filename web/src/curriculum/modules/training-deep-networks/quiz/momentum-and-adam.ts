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
      'Components that flip sign each step cancel in the running average, while steady components add up',
      'Momentum divides each step by the size of recent gradients, so steep directions get smaller steps',
      'Momentum uses second derivatives to measure the curvature, so it can step straight to the valley floor',
      'Momentum adds random noise to each gradient, which knocks the parameters away from the valley walls',
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
      "Adagrad's sum of past squared gradients only grows, so its steps shrink towards zero; RMSProp's moving average forgets old gradients",
      'Adagrad has no learning-rate setting, so it cannot take large steps late in training; RMSProp adds a learning rate to fix this',
      'Adagrad includes momentum, which overshoots the minimum again and again; RMSProp removes the momentum term to stop the overshooting',
      "Adagrad's moving average of squared gradients forgets too quickly; RMSProp sums every past squared gradient so that nothing is forgotten",
    ],
    answer: 0,
    explanation:
      "Adagrad's denominator $\\sqrt{g_1^2 + g_2^2 + \\dots + g_t^2}$ keeps growing, so for a steady gradient its step falls like $1/\\sqrt{t}$ and eventually stalls. RMSProp replaces the sum with an exponential moving average, which stays the size of recent gradients. The option claiming that Adagrad forgets and RMSProp sums describes the two methods the wrong way round.",
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
      'Adam divides the added $\\lambda w$ by $\\sqrt{\\hat v}$, so weights with big gradients barely decay; AdamW shrinks every weight directly by the same fraction',
      'AdamW switches off the second moment $v$ whenever weight decay is used, so the decay becomes the only force on the weights and works more strongly',
      '`torch.optim.Adam` silently ignores the `weight_decay` argument, and AdamW is the only PyTorch optimiser that actually supports weight decay',
      'AdamW applies weight decay only to the biases and never to the weights, which stops the weights from shrinking too far during long training runs',
    ],
    answer: 0,
    explanation:
      "Adding $\\lambda w$ to the gradient is L2 regularisation; Adam's per-parameter division by $\\sqrt{\\hat v}$ then distorts it. AdamW decouples it: $w \\leftarrow w - \\eta(\\hat m/(\\sqrt{\\hat v}+\\epsilon) + \\lambda w)$. Adam does accept `weight_decay`; it just applies it in the less effective, coupled way.",
    difficulty: 'intermediate',
  },
]

export default questions
