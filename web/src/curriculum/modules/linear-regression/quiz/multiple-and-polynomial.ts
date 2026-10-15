import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'linear-regression.multiple-and-polynomial.1',
    prompt:
      'The design matrix $X$ has shape $(200, 6)$, including a column of 1s for the bias, and $y$ has shape $(200, 1)$. What are the shapes of $X^T X$ and $X^T y$ in the normal equation?',
    options: ['$(6, 6)$ and $(6, 1)$', '$(200, 200)$ and $(200, 1)$', '$(6, 6)$ and $(200, 1)$', '$(200, 6)$ and $(6, 1)$'],
    answer: 0,
    explanation:
      '$X^T$ is $6 \\times 200$. In $(6 \\times 200)(200 \\times 6)$ the inner 200s match and disappear, giving $6 \\times 6$; in $(6 \\times 200)(200 \\times 1)$ they disappear again, giving $6 \\times 1$, one entry per weight. $(200, 200)$ would be $XX^T$, the product in the other order.',
    difficulty: 'beginner',
  },
  {
    id: 'linear-regression.multiple-and-polynomial.2',
    prompt:
      'To predict flat prices you use the columns [1, floor area in m², floor area in ft², age]. Computing `np.linalg.inv(X.T @ X)` either fails with "Singular matrix" or returns enormous, meaningless numbers. What is the cause?',
    options: [
      'Area in ft² is 10.764 × area in m², so one column is built from another and $X^T X$ is singular',
      'The four columns are measured on very different scales, and a matrix with mixed scales has no inverse',
      'There are many more rows (flats) than columns, so the system has too many equations to be solved exactly',
      'The column of 1s for the bias is constant, and a constant column stops $X^T X$ from having an inverse',
    ],
    answer: 0,
    explanation:
      '$X^T X$ is singular exactly when some column of $X$ can be built from the others; here column 3 = 10.764 × column 2, so infinitely many weight vectors fit equally well (rounding can hide the exact singularity, so NumPy may return huge numbers instead of an error). Fix it by dropping one of the two area columns (or use `np.linalg.pinv`). Different scales slow gradient descent down but do not stop a matrix being invertible, more rows than columns is the normal situation that least squares is designed for, and the column of 1s is fine because it cannot be built from the other columns.',
    difficulty: 'intermediate',
  },
  {
    id: 'linear-regression.multiple-and-polynomial.3',
    prompt: 'Why is the model $\\hat{y} = w_0 + w_1x + w_2x^2 + w_3x^3$ still called *linear* regression?',
    options: [
      'Each weight only multiplies a fixed feature such as $x^2$, so the model is linear in the weights',
      'For small $x$ the terms $x^2$ and $x^3$ are tiny, so the fitted curve is close to a straight line',
      'It is trained with the same mean squared error loss that is used for fitting straight lines',
      'It has a single input $x$, and any model with just one input variable counts as linear',
    ],
    answer: 0,
    explanation:
      '"Linear" refers to the weights: each $w_k$ multiplies a column you can compute before training ($x^2$, $x^3$), so $\\hat{y} = Xw$ and the normal equation apply unchanged. The curve itself can bend a lot (it is not close to a straight line), and using MSE is not what makes a model linear: a neural network can also be trained with MSE. Having one input is not enough either: $\\hat{y} = w_0 + e^{w_1 x}$ has one input but is not linear in $w_1$.',
    difficulty: 'beginner',
  },
  {
    id: 'linear-regression.multiple-and-polynomial.4',
    prompt: 'What does this code print?',
    code: 'import numpy as np\nX = np.array([[1., 1.], [2., 2.], [3., 3.]])\ny = np.array([2., 4., 6.])\nprint(np.linalg.pinv(X) @ y)',
    options: ['`[1. 1.]`', '`[2. 0.]`', '`[0.5 0.5]`', 'An error: `LinAlgError: Singular matrix`'],
    answer: 0,
    explanation:
      'The two columns are identical, so every $w$ with $w_1 + w_2 = 2$ fits the data perfectly (row 1: $1\\cdot w_1 + 1\\cdot w_2 = 2$). The pseudoinverse picks the shortest such $w$: $(1, 1)$ has length $\\sqrt{2} \\approx 1.41$, shorter than $(2, 0)$ with length 2. `pinv` never raises for singular matrices; `np.linalg.inv(X.T @ X)` would.',
    difficulty: 'intermediate',
  },
  {
    id: 'linear-regression.multiple-and-polynomial.5',
    prompt:
      'A linear regression has $d = 2{,}000{,}000$ features and 50 million examples. Why is it trained with gradient descent rather than the normal equation?',
    options: [
      'Forming and inverting the $d \\times d$ matrix $X^T X$ takes far too much time and memory',
      'The normal equation only works for a single feature plus a bias, not for millions of features',
      'Gradient descent reaches a lower training MSE than the normal equation on the same data',
      'With many more examples than features, $X^T X$ is always singular and has no inverse',
    ],
    answer: 0,
    explanation:
      'Inverting a $d \\times d$ matrix costs roughly $d^3$ operations, here about $8 \\times 10^{18}$, and just storing $X^T X$ needs $4 \\times 10^{12}$ numbers. Each gradient descent step only needs products with $X$. Both methods aim at the same minimum, so gradient descent cannot beat the exact solution, and having more examples than features is what normally makes $X^T X$ invertible.',
    difficulty: 'intermediate',
  },
]

export default questions
