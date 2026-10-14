import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'classification.support-vector-machines.1',
    prompt:
      'A hard-margin linear SVM is trained on separable data and has 3 support vectors. You delete one training point that is **not** a support vector and train again. What happens to the decision boundary?',
    options: [
      'It stays exactly the same, because only the support vectors determine the street',
      'It moves slightly towards where the deleted point used to be, because there is one fewer point holding it back',
      'It gets a wider margin, because removing any training point always gives the street more room',
      'It changes unpredictably, because every training point has a small non-zero weight in the solution',
    ],
    answer: 0,
    explanation:
      'The solution is $w = \\sum_i \\alpha_i y_i x_i$ with $\\alpha_i > 0$ only for support vectors, the points on the edges of the street. A point outside the street has $\\alpha_i = 0$, so deleting it changes nothing. Only moving or removing a support vector can widen, shift or turn the street.',
    difficulty: 'beginner',
  },
  {
    id: 'classification.support-vector-machines.2',
    prompt:
      'A linear soft-margin SVM is trained on two overlapping classes. You raise $C$ from 0.01 to 100. What do you expect?',
    options: [
      'A narrower street with fewer points inside it, fitting the training data harder and risking overfitting',
      'A wider street with more points inside it, because a larger $C$ means stronger regularisation',
      'No change at all, because $C$ only matters when an RBF or polynomial kernel is used',
      'More support vectors, because a larger $C$ forces every training point onto the edge of the street',
    ],
    answer: 0,
    explanation:
      'The objective is $\\frac12\\lVert w \\rVert^2 + C\\sum_i \\xi_i$, so $C$ is the price of each unit of slack. A larger $C$ makes violations expensive: the SVM accepts a smaller margin to have fewer of them, which can overfit noisy points. $C$ acts like $1/\\lambda$, so a large $C$ means *weak* regularisation; it matters for linear SVMs too, and with fewer points inside the street there are usually *fewer* support vectors.',
    difficulty: 'beginner',
  },
  {
    id: 'classification.support-vector-machines.3',
    prompt:
      'A soft-margin SVM gives decision values $f(x) = w \\cdot x + b$. Three training points have label $y$ and value $f$: A ($y = +1$, $f = 2.5$), B ($y = +1$, $f = 0.4$) and C ($y = -1$, $f = 0.5$). What are their slacks $\\xi = \\max(0,\\, 1 - y\\,f)$?',
    options: [
      'A: 0, B: 0.6, C: 1.5',
      'A: 0, B: 0.4, C: 0.5',
      'A: 0, B: 0.6, C: 0.5',
      'A: 1.5, B: 0.6, C: 0',
    ],
    answer: 0,
    explanation:
      'A: $1 - 2.5 < 0$, so $\\xi = 0$ (outside the street). B: $1 - 0.4 = 0.6$, inside the street but on the correct side. C: $y f = (-1)(0.5) = -0.5$, so $\\xi = 1 - (-0.5) = 1.5$; a slack above 1 means C is on the wrong side of the boundary. Forgetting the label $y$ gives 0.5 for C, as if it were a positive point.',
    difficulty: 'intermediate',
  },
  {
    id: 'classification.support-vector-machines.4',
    prompt:
      'For 2-D inputs, the kernel $K(x, z) = (x \\cdot z)^2$ equals the dot product $\\phi(x) \\cdot \\phi(z)$ of the 3-D features $\\phi(x) = (x_1^2,\\ \\sqrt{2}\\,x_1 x_2,\\ x_2^2)$. For $x = (1, 2)$ and $z = (2, 1)$, what is $K(x, z)$, and what did computing it need?',
    options: [
      '16, from one 2-D dot product squared, without ever building $\\phi(x)$ or $\\phi(z)$',
      '4, from one 2-D dot product, without ever building $\\phi(x)$ or $\\phi(z)$',
      '16, but only after building the 3-D vectors $\\phi(x)$ and $\\phi(z)$ explicitly',
      '8, from adding up the squares of all four input numbers',
    ],
    answer: 0,
    explanation:
      '$x \\cdot z = 1 \\times 2 + 2 \\times 1 = 4$, so $K = 4^2 = 16$. Check: $\\phi(x) = (1, 2\\sqrt2, 4)$ and $\\phi(z) = (4, 2\\sqrt2, 1)$ give $4 + 8 + 4 = 16$, the same number. That is the kernel trick: the dot product in the bigger space comes straight from the original inputs, so $\\phi$ never has to be built. Answering 4 forgets to square.',
    difficulty: 'intermediate',
  },
  {
    id: 'classification.support-vector-machines.5',
    prompt:
      'An SVM with an RBF kernel, $K(x, z) = e^{-\\gamma \\lVert x - z \\rVert^2}$, scores 100% on its training data but 64% on new data, and every training point is a support vector. Which change is most likely to help?',
    options: [
      'Decrease $\\gamma$, so each point influences a wider area and the boundary becomes smoother',
      'Increase $\\gamma$, so each point influences a smaller area and the boundary can follow the data more closely',
      'Increase $C$, so that the remaining training errors are punished even more heavily',
      'Remove the support vectors from the training set, since they are the points that cause the overfitting',
    ],
    answer: 0,
    explanation:
      'A large $\\gamma$ makes each kernel bump very narrow, so the boundary wraps tiny islands around individual points: perfect training accuracy, poor test accuracy, and nearly every point a support vector. Lowering $\\gamma$ (and possibly $C$) smooths the boundary. Raising $\\gamma$ or $C$ would push further towards overfitting, and deleting support vectors throws away exactly the points that define the boundary.',
    difficulty: 'intermediate',
  },
]

export default questions
