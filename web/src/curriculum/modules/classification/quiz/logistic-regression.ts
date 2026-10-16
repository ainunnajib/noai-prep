import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'classification.logistic-regression.1',
    prompt: 'A logistic regression model predicts a pass with $w = 2$ and $b = -6$. What does this code print?',
    code: 'import numpy as np\n\nw, b = 2.0, -6.0\nhours = np.array([1.0, 3.0, 4.0])\nz = w * hours + b\nprint((z >= 0).astype(int))',
    options: ['`[0 1 1]`', '`[0 0 1]`', '`[-4.  0.  2.]`', '`[0.018 0.5 0.881]`'],
    answer: 0,
    explanation:
      'The scores are $z = -4, 0, 2$. Since $\\sigma(z) \\ge 0.5$ exactly when $z \\ge 0$, the test `z >= 0` is the usual "predict class 1 when $p \\ge 0.5$" rule, and it gives `[0 1 1]`. At 3 hours $z = 0$, so $p = \\sigma(0) = 0.5$, which counts as class 1 under $\\ge$. The code never prints the raw scores or the probabilities themselves.',
    difficulty: 'beginner',
  },
  {
    id: 'classification.logistic-regression.2',
    prompt: 'A logistic regression with two features has $\\mathbf{w} = (1, 2)$ and $b = -4$. Which statement about its decision boundary is correct?',
    options: [
      'It is the straight line $x_1 + 2x_2 = 4$, and the point $(4, 4)$ is on the class-1 side',
      'It is the straight line $x_1 + 2x_2 = 4$, and the point $(0, 0)$ is on the class-1 side',
      'It is an S-shaped curve, because the sigmoid that produces the probabilities is S-shaped',
      'It is the straight line $x_1 + 2x_2 - 4 = 0.5$, because that is where the probability is 0.5',
    ],
    answer: 0,
    explanation:
      'The boundary is where $p = 0.5$, i.e. where the score $z = x_1 + 2x_2 - 4 = 0$: a straight line. At $(4, 4)$, $z = 4 + 8 - 4 = 8 > 0$, so class 1; at $(0, 0)$, $z = -4 < 0$, so class 0. The sigmoid bends the probabilities, not the boundary, and $p = 0.5$ corresponds to $z = 0$, not $z = 0.5$.',
    difficulty: 'intermediate',
  },
  {
    id: 'classification.logistic-regression.3',
    prompt:
      'A model with a sigmoid output is trained with squared error $(y - p)^2$. One example has $y = 1$, but the model predicts $p = 0.01$. Why does the model learn very little from this badly wrong example?',
    options: [
      'Its slope with respect to the score is $2(p - y)\\,p(1 - p)$, and the factor $p(1-p) \\approx 0.01$ makes that slope (and the update) tiny',
      'Squared error becomes negative when $p < y$, so gradient descent moves the weights in the wrong direction for this example',
      'Squared error is at most 1, so the loss of this example ($\\approx 0.98$) is too small for gradient descent to notice',
      'Squared error ignores examples whose prediction is below the 0.5 threshold, so training skips this example',
    ],
    answer: 0,
    explanation:
      'By the chain rule, $\\frac{\\partial}{\\partial z}(p - y)^2 = 2(p - y)\\,\\sigma\'(z) = 2(p-y)\\,p(1-p) = 2(-0.99)(0.01)(0.99) \\approx -0.02$: a tiny push. With binary cross-entropy the push is $p - y = -0.99$, about 50 times stronger, because the $p(1-p)$ cancels. A square is never negative, squared error has no threshold that skips examples, and a loss of 0.98 is large; what is small is its *slope*.',
    difficulty: 'intermediate',
  },
  {
    id: 'classification.logistic-regression.4',
    prompt: 'An email is not spam ($y = 0$), but the model says $p = 0.9$ that it is spam. What is the binary cross-entropy loss for this email (natural log)?',
    options: ['$-\\ln 0.1 \\approx 2.30$', '$-\\ln 0.9 \\approx 0.105$', '$0.81$', '$0.9$'],
    answer: 0,
    explanation:
      'With $y = 0$, $L = -[0 \\cdot \\ln 0.9 + 1 \\cdot \\ln(1 - 0.9)] = -\\ln 0.1 = \\ln 10 \\approx 2.30$: the model gave only 0.1 to what actually happened. $-\\ln 0.9 \\approx 0.105$ would be the loss if the email *were* spam, and $0.81 = (0 - 0.9)^2$ is the squared error.',
    difficulty: 'beginner',
  },
  {
    id: 'classification.logistic-regression.5',
    prompt: 'Model B is model A with every weight and the bias multiplied by 2 ($\\mathbf{w} \\to 2\\mathbf{w}$, $b \\to 2b$). Compared with model A, model B:',
    options: [
      'has the same decision boundary, but every point off that line now gets a probability closer to 0 or 1',
      'has its decision boundary moved twice as far from the origin, with the same probabilities along the line',
      'gives exactly the same probabilities everywhere, because the ratio between $b$ and the weights is unchanged',
      'has its decision boundary rotated by 90 degrees, because the weight vector has changed length',
    ],
    answer: 0,
    explanation:
      'Every score doubles: $z_B = 2z_A$. Points with $z_A = 0$ still have $z_B = 0$, so the boundary is unchanged, but a point with $z_A = 1$ ($p \\approx 0.73$) now has $z_B = 2$ ($p \\approx 0.88$). A longer $\\mathbf{w}$ means a sharper, more confident switch; only the direction of $\\mathbf{w}$ and the value of $-b/\\lVert\\mathbf{w}\\rVert$ fix where the line is.',
    difficulty: 'intermediate',
  },
]

export default questions
