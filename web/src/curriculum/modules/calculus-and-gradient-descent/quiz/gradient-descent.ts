import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'calculus-and-gradient-descent.gradient-descent.1',
    prompt:
      'At the current weight $w = 2$, the slope of the loss is $L\'(2) = -4$. With learning rate $\\eta = 0.5$, what is $w$ after one gradient descent step?',
    options: ['4', '0', '2.5', '6'],
    answer: 0,
    explanation:
      'Use $w_{\\text{new}} = w - \\eta\\,L\'(w) = 2 - 0.5 \\times (-4) = 2 + 2 = 4$. A negative slope means the loss goes down as $w$ increases, so gradient descent moves $w$ to the right. 0 comes from ignoring the sign of the slope (subtracting a negative number adds); 2.5 just adds $\\eta$; 6 forgets to multiply the slope by $\\eta$.',
    difficulty: 'beginner',
  },
  {
    id: 'calculus-and-gradient-descent.gradient-descent.2',
    prompt: 'This code runs gradient descent on $L(w) = w^2$. What does it print?',
    code: 'w = 5.0\nlr = 0.1\nfor _ in range(2):\n    grad = 2 * w\n    w = w - lr * grad\nprint(w)',
    options: ['`3.2`', '`4.0`', '`3.0`', '`7.2`'],
    answer: 0,
    explanation:
      'Each step computes $w - 0.1 \\times 2w = 0.8\\,w$. Step 1: $5 \\times 0.8 = 4.0$. Step 2: $4 \\times 0.8 = 3.2$. `4.0` is the value after only one step; `3.0` keeps the first gradient (10) for both steps instead of recomputing it; `7.2` adds the step ($\\times 1.2$ each time), which walks uphill.',
    difficulty: 'beginner',
  },
  {
    id: 'calculus-and-gradient-descent.gradient-descent.3',
    prompt:
      'Two runs train the same model with different learning rates. Run A logs the loss $5.00, 4.99, 4.98, 4.97, \\dots$ and Run B logs $5.0, 7.9, 12.6, 20.1, \\dots$. Which diagnosis fits best?',
    options: [
      'A\'s learning rate is too small and B\'s is too large, so B diverges',
      "A's learning rate is too large and B's is too small",
      'A has nearly converged and B needs more epochs to settle',
      'Both learning rates are too large, but B more so than A',
    ],
    answer: 0,
    explanation:
      "A's loss falls by only $0.01$ per step: tiny steps, the signature of a learning rate that is too small. B's loss grows by a factor of about $1.6$ every step: each update overshoots further than the last, so it is diverging because $\\eta$ is too large. More epochs would only make B worse.",
    difficulty: 'beginner',
  },
  {
    id: 'calculus-and-gradient-descent.gradient-descent.4',
    prompt: 'Gradient descent is run on $L(w) = 5w^2$. Which learning rate makes it **diverge**?',
    options: ['$\\eta = 0.25$', '$\\eta = 0.15$', '$\\eta = 0.1$', '$\\eta = 0.05$'],
    answer: 0,
    explanation:
      'The slope is $L\'(w) = 10w$, so each step gives $w_{\\text{new}} = (1 - 10\\eta)\\,w$. It converges only if $|1 - 10\\eta| < 1$, i.e. $\\eta < 2/10 = 0.2$. At $\\eta = 0.25$ the multiplier is $-1.5$, so $w$ flips sign and grows. $\\eta = 0.15$ gives $-0.5$ (zig-zags but converges), $\\eta = 0.1$ gives $0$ (lands on the minimum in one step) and $\\eta = 0.05$ gives $0.5$ (smooth).',
    difficulty: 'intermediate',
  },
  {
    id: 'calculus-and-gradient-descent.gradient-descent.5',
    prompt:
      'A linear model uses two features: income in dollars (around 50,000) and age in years. Gradient descent zig-zags and only works with a tiny learning rate. Why does standardising both features help?',
    options: [
      'It makes the loss bowl rounder (similar curvature), so one learning rate suits every direction',
      'It shifts the minimum to the origin, so the starting point is already close to it',
      'It turns the non-convex loss into a convex one with a single global minimum',
      'It lets gradient descent skip computing the gradient for the smaller feature',
    ],
    answer: 0,
    explanation:
      "Income's huge values make the loss very sharply curved along its weight, and the largest curvature caps the learning rate ($\\eta < 2/c$), so progress along age's gently curved direction crawls. Standardising gives both features a similar spread, so the curvatures become similar, the contours become rounder and a larger learning rate is safe in every direction. The loss of a linear model with MSE was already convex, so convexity is not what changed.",
    difficulty: 'intermediate',
  },
]

export default questions
