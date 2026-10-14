import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'linear-regression.regression-by-gradient-descent.1',
    prompt: 'For the loss $L = \\frac{1}{n}\\sum_i (y_i - \\hat{y}_i)^2$ with $\\hat{y}_i = w x_i + b$, what is $\\partial L / \\partial w$?',
    options: [
      '$-\\frac{2}{n}\\sum_i x_i\\,(y_i - \\hat{y}_i)$',
      '$-\\frac{2}{n}\\sum_i (y_i - \\hat{y}_i)$',
      '$\\frac{2}{n}\\sum_i x_i\\,(y_i - \\hat{y}_i)$',
      '$-\\frac{1}{n}\\sum_i x_i^2\\,(y_i - \\hat{y}_i)$',
    ],
    answer: 0,
    explanation:
      'By the chain rule, $\\frac{\\partial}{\\partial w}(y_i - w x_i - b)^2 = 2(y_i - \\hat{y}_i) \\cdot (-x_i)$; averaging gives $-\\frac{2}{n}\\sum_i x_i (y_i - \\hat{y}_i)$, the same as $\\frac{2}{n}\\sum_i e_i x_i$ with $e = \\hat{y} - y$. Without the factor $x_i$ you have $\\partial L/\\partial b$ instead, and dropping the minus sign would send gradient descent uphill.',
    difficulty: 'intermediate',
  },
  {
    id: 'linear-regression.regression-by-gradient-descent.2',
    prompt:
      'Data: $x = [1, 2]$, $y = [2, 4]$. The model $\\hat{y} = wx + b$ starts at $w = 0$, $b = 0$ and is trained on the MSE $\\frac{1}{n}\\sum (\\hat{y}_i - y_i)^2$ with learning rate $\\eta = 0.1$. What are $w$ and $b$ after one gradient descent step?',
    options: ['$w = 1$, $b = 0.6$', '$w = -1$, $b = -0.6$', '$w = 0.5$, $b = 0.3$', '$w = 2$, $b = 1.2$'],
    answer: 0,
    explanation:
      'Predictions are $0, 0$, so the errors $e = \\hat{y} - y$ are $-2, -4$. Then $\\partial L/\\partial w = \\frac{2}{2}\\,[(-2)(1) + (-4)(2)] = -10$ and $\\partial L/\\partial b = \\frac{2}{2}\\,(-2 - 4) = -6$. The update gives $w = 0 - 0.1(-10) = 1$ and $b = 0 - 0.1(-6) = 0.6$. Adding the gradient instead of subtracting gives $-1, -0.6$; dropping the 2 gives $0.5, 0.3$; forgetting to divide by $n$ gives $2, 1.2$.',
    difficulty: 'intermediate',
  },
  {
    id: 'linear-regression.regression-by-gradient-descent.3',
    prompt: 'What values does `grad` hold after this code runs?',
    code: 'import numpy as np\nX = np.array([[1., 0.], [1., 1.], [1., 2.]])\ny = np.array([1., 3., 5.])\ntheta = np.zeros(2)\nerror = X @ theta - y\ngrad = X.T @ error / len(y)',
    options: ['$[-3, -4.333]$', '$[3, 4.333]$', '$[-9, -13]$', '$[-1, -3, -5]$'],
    answer: 0,
    explanation:
      'With $\\theta = 0$ every prediction is 0, so `error` is $[-1, -3, -5]$. `X.T @ error` multiplies each column of `X` by the errors and adds: column of 1s gives $-1 - 3 - 5 = -9$, column $0, 1, 2$ gives $0 - 3 - 10 = -13$. Dividing by $m = 3$ gives $[-3, -4.333]$, one gradient per parameter (the first column of 1s is the intercept column). $[-9, -13]$ forgets the division, $[3, 4.333]$ uses $y - X\\theta$, and $[-1, -3, -5]$ is the error vector, shape `(3,)` rather than `(2,)`.',
    difficulty: 'intermediate',
  },
  {
    id: 'linear-regression.regression-by-gradient-descent.4',
    prompt:
      'You train linear regression with full-batch gradient descent and print the MSE after each iteration: 40.8, 51.9, 66.1, 84.2, 107.3, 136.8, … What should you do?',
    options: [
      'Lower the learning rate, because each step overshoots further than the last',
      'Train for more iterations, because the loss has simply not converged yet',
      'Raise the learning rate, because the model is learning far too slowly',
      'Add more training examples, because the model is overfitting the data',
    ],
    answer: 0,
    explanation:
      'With a sensible learning rate the loss of full-batch gradient descent on MSE falls at every step. A loss that grows every iteration means the steps overshoot further and further: the learning rate is above the stability limit (these numbers are the Grab rides at $\\eta = 0.09$, just above the limit $2/23.66 \\approx 0.0845$). More iterations would make it worse, and raising the rate would diverge even faster.',
    difficulty: 'beginner',
  },
  {
    id: 'linear-regression.regression-by-gradient-descent.5',
    prompt: 'This loop is meant to implement the update $\\theta_j := \\theta_j - \\alpha\\frac{1}{m}\\sum_i (h_\\theta(x^{(i)}) - y^{(i)})\\,x_j^{(i)}$ for every $j$. What is wrong with it?',
    code: 'for _ in range(iterations):\n    for j in range(n):\n        error = X @ theta - y\n        theta[j] -= alpha * np.sum(error * X[:, j]) / m',
    options: [
      'Later θ values use errors computed after earlier θ values changed, so the update is not simultaneous',
      'Dividing by m is wrong here, because np.sum already averages the products over all examples',
      'The minus sign should be a plus, because the gradient already points towards the minimum',
      'The error should be y - X @ theta, because the update rule needs truth minus prediction',
    ],
    answer: 0,
    explanation:
      'Because `error` is recomputed inside the `j` loop after `theta[0]` has already changed, `theta[1]` is updated from a different $\\theta$ than `theta[0]` was. That is a different (sequential) algorithm: on the 2025 Final data it gives $[0.0027, 0.9988]$ instead of $[0.003, 0.9987]$. The fix is to compute the error once per iteration, or use `theta -= alpha * X.T @ (X @ theta - y) / m`. The signs are correct as written: error $= h - y$ with a minus in the update moves downhill.',
    difficulty: 'advanced',
  },
]

export default questions
