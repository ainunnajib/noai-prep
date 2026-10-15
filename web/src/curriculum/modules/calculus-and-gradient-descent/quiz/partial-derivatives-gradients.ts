import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'calculus-and-gradient-descent.partial-derivatives-gradients.1',
    prompt: 'What is $\\dfrac{\\partial f}{\\partial y}$ for $f(x, y) = 3x^2 y + y^3$?',
    options: ['$3x^2 + 3y^2$', '$6xy$', '$6xy + 3y^2$', '$3x^2 y + 3y^2$'],
    answer: 0,
    explanation:
      'Freeze $x$, so $3x^2$ is just a coefficient: $3x^2 y$ becomes $3x^2$, and $y^3$ becomes $3y^2$. Total: $3x^2 + 3y^2$. $6xy$ is $\\partial f/\\partial x$ (differentiating in the wrong variable), $6xy + 3y^2$ mixes the two partial derivatives together, and $3x^2 y + 3y^2$ leaves the $3x^2 y$ term untouched, as if freezing $x$ meant not differentiating that term at all.',
    difficulty: 'beginner',
  },
  {
    id: 'calculus-and-gradient-descent.partial-derivatives-gradients.2',
    prompt: 'What is the gradient of $f(x, y) = x^2 + 3xy$ at the point $(1, 2)$?',
    options: ['$[8,\\ 3]$', '$[2,\\ 3]$', '$[8,\\ 6]$', '$11$'],
    answer: 0,
    explanation:
      '$\\partial f/\\partial x = 2x + 3y = 2 + 6 = 8$ and $\\partial f/\\partial y = 3x = 3$, so $\\nabla f = [8, 3]$. $[2, 3]$ forgets that the $3xy$ term also depends on $x$; $[8, 6]$ uses $3y$ instead of $3x$ for the second entry; $11$ adds the entries, but a gradient is a vector with one entry per input.',
    difficulty: 'beginner',
  },
  {
    id: 'calculus-and-gradient-descent.partial-derivatives-gradients.3',
    prompt:
      'On the contour map of a loss $L(w_1, w_2)$, drawn at equal steps of loss, the contour lines are packed tightly together around point P and spread far apart around point Q. Which statement is correct?',
    options: [
      '$\\lVert \\nabla L \\rVert$ is larger at P, and at both points $\\nabla L$ crosses the contour lines at right angles',
      '$\\lVert \\nabla L \\rVert$ is larger at Q, and at both points $\\nabla L$ crosses the contour lines at right angles',
      '$\\lVert \\nabla L \\rVert$ is larger at P, and at both points $\\nabla L$ runs along the contour line',
      '$\\lVert \\nabla L \\rVert$ is the same at P and Q, because both lie on contour lines',
    ],
    answer: 0,
    explanation:
      'Tightly packed contours mean the height changes a lot over a short distance, so the ground is steep and the gradient is long at P. Walking along a contour does not change the height (slope $= \\nabla L \\cdot u = 0$), so the gradient is always perpendicular to the contour, not along it. Spread-out contours (at Q) mean gentle ground and a short gradient.',
    difficulty: 'intermediate',
  },
  {
    id: 'calculus-and-gradient-descent.partial-derivatives-gradients.4',
    prompt:
      'A map gives the height of a hill as $h(x, y)$. At one spot, $\\nabla h = [3, 4]$. Rain lands there. In which direction does it start to flow, and how steep is the ground in that direction?',
    options: [
      'Towards $[-3, -4]$, with a downhill slope of 5',
      'Towards $[3, 4]$, with an uphill slope of 5',
      'Towards $[-3, -4]$, with a downhill slope of 7',
      'Towards $[4, -3]$, with a slope of 0',
    ],
    answer: 0,
    explanation:
      'Water takes the steepest way down, which is $-\\nabla h = [-3, -4]$, and the steepest slope is $\\lVert \\nabla h \\rVert = \\sqrt{3^2 + 4^2} = 5$. $[3, 4]$ is straight uphill. 7 adds the entries instead of using Pythagoras. $[4, -3]$ is perpendicular to the gradient: that runs along the contour line, where the ground is flat, so water would not choose it.',
    difficulty: 'intermediate',
  },
  {
    id: 'calculus-and-gradient-descent.partial-derivatives-gradients.5',
    prompt: 'This code estimates the gradient of $f(w) = w^T x + \\lVert w \\rVert^2$ by nudging each weight. What does it print?',
    code: 'import numpy as np\n\nx = np.array([3.0, -1.0])\n\ndef f(w):\n    return w @ x + np.sum(w ** 2)\n\nw = np.array([1.0, 2.0])\nh = 1e-4\ngrad = np.array([(f(w + h*e) - f(w - h*e)) / (2*h) for e in np.eye(2)])\nprint(np.round(grad, 3))',
    options: ['`[5. 3.]`', '`[4. 1.]`', '`[2. 4.]`', '`[ 3. -1.]`'],
    answer: 0,
    explanation:
      'The gradient is $\\nabla(w^T x) + \\nabla \\lVert w \\rVert^2 = x + 2w = [3, -1] + [2, 4] = [5, 3]$, and the central-difference estimate matches it to 3 decimals. `[4. 1.]` uses $w$ instead of $2w$ for the squared norm; `[2. 4.]` keeps only the $2w$ part; `[ 3. -1.]` keeps only the $x$ part.',
    difficulty: 'intermediate',
  },
]

export default questions
