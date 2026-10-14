import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'ai-first-look.let-the-computer-learn.1',
    prompt: 'At the current value of the knob $w$, the slope of the loss curve is $-3$. What does one step of gradient descent do to $w$?',
    options: [
      'Increases $w$, because the loss goes down as $w$ gets larger',
      'Decreases $w$, because a negative slope means $w$ is too large',
      'Leaves $w$ unchanged until the slope becomes positive',
      'Sets $w$ to $-3$, the value of the slope',
    ],
    answer: 0,
    explanation:
      'A negative slope means the loss falls as $w$ grows, so downhill is towards larger $w$. The rule $w_{\\text{new}} = w - \\eta \\times (-3) = w + 3\\eta$ makes $w$ bigger. Reading a negative slope as "go left" is the classic sign mistake.',
    difficulty: 'beginner',
  },
  {
    id: 'ai-first-look.let-the-computer-learn.2',
    prompt: 'Gradient descent is at $w = 5$. The slope of the loss there is $-4$ and the learning rate is $\\eta = 0.25$. What is $w$ after one step?',
    options: ['$6$', '$4$', '$9$', '$1$'],
    answer: 0,
    explanation:
      '$w_{\\text{new}} = w - \\eta \\times \\text{slope} = 5 - 0.25 \\times (-4) = 5 + 1 = 6$. Getting $4$ means the minus sign was lost; $9$ forgets to multiply by the learning rate ($5 - (-4)$).',
    difficulty: 'beginner',
  },
  {
    id: 'ai-first-look.let-the-computer-learn.3',
    prompt:
      'Three runs train the same model on the same data, each with a different learning rate. After 100 steps:\n\n- Run P: the loss fell smoothly from 50 to 48.\n- Run Q: the loss fell from 50 to 0.3.\n- Run R: the loss rose from 50 to about $10^9$.\n\nWhich description fits?',
    options: [
      'P: too small, Q: about right, R: too large',
      'P: too large, Q: about right, R: too small',
      'P: about right, Q: too large, R: too small',
      'All three used the same rate; only the random start differed',
    ],
    answer: 0,
    explanation:
      'A tiny learning rate makes safe but tiny steps, so the loss creeps down (P). A good rate reaches a low loss (Q). A rate that is too large overshoots the bottom further each step, so the loss explodes (R): that is divergence. A too-small rate never makes the loss grow, so R cannot be "too small".',
    difficulty: 'beginner',
  },
  {
    id: 'ai-first-look.let-the-computer-learn.4',
    prompt: 'Which order of moves makes up one step of the training loop?',
    options: [
      'predict → measure the loss → find the slope → nudge the knobs',
      'measure the loss → predict → nudge the knobs → find the slope',
      'find the slope → predict → measure the loss → nudge the knobs',
      'nudge the knobs → find the slope → predict → measure the loss',
    ],
    answer: 0,
    explanation:
      'You need predictions before you can measure how wrong they are, you need the loss before you can find which way lowers it, and only then do you know which way to nudge. After the nudge the loop starts again with new predictions.',
    difficulty: 'beginner',
  },
  {
    id: 'ai-first-look.let-the-computer-learn.5',
    prompt: 'The learning rate stays fixed at $0.1$, yet the steps of gradient descent get smaller and smaller as it nears the bottom of the loss valley. Why?',
    options: [
      'The slope gets closer to zero, and each step is the learning rate times the slope',
      'The computer lowers the learning rate by itself as training goes on',
      'The loss becomes negative near the bottom, which makes each step shrink',
      'The computer can see where the bottom is, so it slows down on purpose',
    ],
    answer: 0,
    explanation:
      'Each step is $\\eta \\times \\text{slope}$. Near the bottom the valley flattens, so the slope shrinks towards 0 and so does the step: for example $0.1 \\times (-10) = -1$ far away, but $0.1 \\times (-0.5) = -0.05$ close by. Plain gradient descent never changes $\\eta$ on its own (a learning-rate schedule would, but that is an extra you add), and the MSE loss can never be negative.',
    difficulty: 'intermediate',
  },
]

export default questions
