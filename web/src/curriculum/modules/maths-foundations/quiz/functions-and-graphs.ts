import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'maths-foundations.functions-and-graphs.1',
    prompt: 'Let $f(x) = 2x + 3$ and $g(x) = x^2$. What are $f(g(-2))$ and $g(f(-2))$?',
    options: [
      '$f(g(-2)) = 11$ and $g(f(-2)) = 1$',
      '$f(g(-2)) = 1$ and $g(f(-2)) = 11$',
      '$f(g(-2)) = -5$ and $g(f(-2)) = 1$',
      '$f(g(-2)) = 11$ and $g(f(-2)) = 11$',
    ],
    answer: 0,
    explanation:
      'Work inside out. $g(-2) = (-2)^2 = 4$, so $f(g(-2)) = 2 \\times 4 + 3 = 11$. In the other order $f(-2) = -1$, so $g(f(-2)) = (-1)^2 = 1$. The $-5$ comes from writing $-2^2 = -4$ without brackets, and assuming both orders agree is the classic composition trap.',
    difficulty: 'beginner',
  },
  {
    id: 'maths-foundations.functions-and-graphs.2',
    prompt: 'A straight line passes through the points $(1, 5)$ and $(3, 9)$. What are its slope and its $y$-intercept?',
    options: ['slope 2, intercept 3', 'slope 2, intercept 5', 'slope 0.5, intercept 4.5', 'slope 4, intercept 1'],
    answer: 0,
    explanation:
      'Slope $=$ rise $\\div$ run $= (9 - 5) \\div (3 - 1) = 4 \\div 2 = 2$. Then $5 = 2 \\times 1 + c$ gives $c = 3$, so the line is $y = 2x + 3$. Slope 0.5 is run $\\div$ rise (upside down), slope 4 forgets to divide by the run, and intercept 5 is the $y$-value at $x = 1$, not at $x = 0$.',
    difficulty: 'beginner',
  },
  {
    id: 'maths-foundations.functions-and-graphs.3',
    prompt:
      'A model has one weight $w$, and its training loss is $L(w) = 3(w - 2)^2 + 5$. Which weight gives the lowest loss, and what is that lowest loss?',
    options: ['$w = 2$, loss $5$', '$w = -2$, loss $5$', '$w = 2$, loss $0$', '$w = 0$, loss $17$'],
    answer: 0,
    explanation:
      'This is a parabola $a(w - h)^2 + k$ with $a = 3 > 0$, so its vertex $(h, k) = (2, 5)$ is the lowest point. The square $(w - 2)^2$ is 0 at $w = 2$, leaving $L = 5$. A minimum loss is not automatically 0 (here the $+5$ remains), and $w = -2$ forgets that $(w - 2)$ means $h = +2$. At $w = 0$ the loss is $3 \\times 4 + 5 = 17$, which is not the lowest.',
    difficulty: 'beginner',
  },
  {
    id: 'maths-foundations.functions-and-graphs.4',
    prompt: 'Why is $\\text{ReLU}(x) = \\max(0, x)$ said to be not differentiable at $x = 0$?',
    options: [
      'Its slope is 0 on the left of 0 and 1 on the right, so no single tangent exists at 0',
      'Its graph jumps from 0 to 1 at $x = 0$, so the function is not continuous there',
      'Its output at $x = 0$ is undefined, because $\\max(0, 0)$ has no answer',
      'Its graph is vertical at $x = 0$, so the slope there is infinite',
    ],
    answer: 0,
    explanation:
      'ReLU is flat (slope 0) for negative inputs and the line $y = x$ (slope 1) for positive ones. At 0 these two slopes meet in a corner, so no single tangent exists. ReLU does not jump: it is continuous, and $\\text{ReLU}(0) = \\max(0, 0) = 0$ is perfectly well defined. The jump describes the step function instead.',
    difficulty: 'intermediate',
  },
  {
    id: 'maths-foundations.functions-and-graphs.5',
    prompt: 'What does this code print?',
    code: 'import numpy as np\nx = np.array([-3, 0, 2])\nprint(np.maximum(0, x) + np.abs(x))',
    options: ['`[3 0 4]`', '`[0 0 4]`', '`[6 0 4]`', '`[-3 0 4]`'],
    answer: 0,
    explanation:
      '`np.maximum(0, x)` is ReLU applied to each element: `[0 0 2]`. `np.abs(x)` is `[3 0 2]`. Adding element by element gives `[3 0 4]`. `[6 0 4]` treats ReLU of $-3$ as 3 (confusing ReLU with $|x|$), `[0 0 4]` makes the opposite swap (treating $|x|$ like ReLU), and `[-3 0 4]` adds ReLU to $x$ itself instead of to $|x|$.',
    difficulty: 'beginner',
  },
]

export default questions
