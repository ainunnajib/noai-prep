import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'final-lab-numpy.task-linear-regression-gd.1',
    prompt:
      'Using the task\'s update rule with $X = \\begin{bmatrix} 1 & 1 \\\\ 1 & 2 \\end{bmatrix}$, $y = [2, 4]$, $\\alpha = 0.1$ and $\\theta$ starting at $[0, 0]$, what is $\\theta$ after **one** iteration?',
    options: ['$[0.3, 0.5]$', '$[0.6, 1.0]$', '$[-0.3, -0.5]$', '$[0.3, 0.455]$'],
    answer: 0,
    explanation:
      'Predictions are $[0, 0]$, so the errors $h - y$ are $[-2, -4]$. Gradient $= X^\\top e / m = [(-2 - 4)/2,\\ (-2 - 8)/2] = [-3, -5]$. Then $\\theta = 0 - 0.1 \\times [-3, -5] = [0.3, 0.5]$. Forgetting $/m$ gives $[0.6, 1.0]$; updating $\\theta_0$ first and reusing it for $\\theta_1$ gives $[0.3, 0.455]$.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-numpy.task-linear-regression-gd.2',
    prompt:
      'On the 2025 task data, a student\'s function returns `array([5.000e-04, 1.100e-03, 9.994e-01])` instead of `array([0.003 , 0.9987])`. What is the most likely mistake?',
    options: [
      'A column of 1s was added to `X`, which already had its intercept column',
      'The coefficients were rounded inside the loop instead of once at the end',
      'The gradient was summed over the examples instead of averaged over them',
      'The learning rate was too large, so gradient descent started to diverge',
    ],
    answer: 0,
    explanation:
      'Three numbers means three coefficients, so `X` gained a column: the student added a bias column of 1s although the column of 2s already plays that role. The scientific notation is just how NumPy prints values of very different sizes. Rounding early or summing would still give two numbers, and divergence would give huge ones.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-numpy.task-linear-regression-gd.3',
    prompt:
      'A model trained on this task\'s `X` (first column all 2s, second column the input $x$) returns $\\theta = [0.25, 2]$. What does it predict for $x = 3$?',
    options: ['6.5', '6.25', '6.75', '8'],
    answer: 0,
    explanation:
      'The prediction is $\\hat{y} = 2\\theta_0 + \\theta_1 x = 2 \\times 0.25 + 2 \\times 3 = 0.5 + 6 = 6.5$. Treating $\\theta_0$ as the intercept gives $0.25 + 6 = 6.25$, forgetting that its column holds 2s, not 1s.',
    difficulty: 'beginner',
  },
  {
    id: 'final-lab-numpy.task-linear-regression-gd.4',
    prompt:
      'A student writes `gradient = X.T @ errors` (no `/ m`). On the 2025 data, with $m = 3$ and $\\alpha = 0.01$, why does the answer after 1000 iterations change?',
    options: [
      'Every step is 3 times larger, the same as using α = 0.03',
      'Every step is 3 times smaller, the same as using α = 0.0033',
      'The steps point in a different direction, towards another minimum',
      'Each update now uses one example at a time, like stochastic descent',
    ],
    answer: 0,
    explanation:
      'The sum is $m$ times the mean, so the update becomes $\\alpha \\times m \\times$ (mean gradient): the direction is unchanged and the step is 3 times longer. After a fixed 1000 steps the faster walk is further along, here all the way to $(0, 1)$, so the 4 d.p. answer differs. On larger data the same bug easily pushes the step past the stability limit and the run diverges.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-numpy.task-linear-regression-gd.5',
    prompt: 'With the task\'s `X` of shape `(3, 2)` and `y` of shape `(3,)`, what does this print?',
    code: 'theta = np.zeros((2, 1))\nerrors = X @ theta - y\nprint(errors.shape)',
    options: ['`(3, 3)`', '`(3, 1)`', '`(3,)`', 'A `ValueError`, because the shapes do not match'],
    answer: 0,
    explanation:
      '`X @ theta` has shape `(3, 1)`. Subtracting `y` of shape `(3,)` broadcasts: `(3,)` is treated as `(1, 3)`, and `(3, 1)` with `(1, 3)` stretch to `(3, 3)`, every prediction minus every target, with no error message. Keep `theta` 1-D (`np.zeros(n)`) or reshape `y` to `(3, 1)`.',
    difficulty: 'intermediate',
  },
]

export default questions
