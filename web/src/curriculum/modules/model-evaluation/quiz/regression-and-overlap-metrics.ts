import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'model-evaluation.regression-and-overlap-metrics.1',
    prompt: 'A model predicts flat prices in thousands of dollars. On the test set its mean squared error (MSE) is 400. What is its RMSE?',
    options: ['20, in thousands of dollars', '400, in thousands of dollars', '20, in thousands of dollars squared', '200, in thousands of dollars'],
    answer: 0,
    explanation:
      'RMSE $= \\sqrt{\\text{MSE}} = \\sqrt{400} = 20$. Taking the square root brings the units back from (thousands of dollars)$^2$ to thousands of dollars, which is why RMSE is easier to explain than MSE. 200 is half of 400, not its square root.',
    difficulty: 'beginner',
  },
  {
    id: 'model-evaluation.regression-and-overlap-metrics.2',
    prompt: 'A regression model scores $R^2 = -0.3$ on the test set. What does this tell you?',
    options: [
      'It makes 30% more squared error than always predicting the mean',
      'There must be a bug, because a squared quantity can never be negative',
      'It explains 30% of the variation in the targets, but in the opposite direction',
      'Its predictions are wrong by 0.3 units on average',
    ],
    answer: 0,
    explanation:
      '$R^2 = 1 - \\frac{SS_{res}}{SS_{tot}} = -0.3$ means $\\frac{SS_{res}}{SS_{tot}} = 1.3$: the model makes 30% more squared error than the "always predict the mean" baseline. R² is not literally a square, so negative values are possible, and common for a poor model on test data. An average error of 0.3 units would be an MAE, not R².',
    difficulty: 'intermediate',
  },
  {
    id: 'model-evaluation.regression-and-overlap-metrics.3',
    prompt: 'A true box has corners $(0, 0, 4, 4)$ and a predicted box has corners $(2, 2, 6, 6)$, written as $(x_1, y_1, x_2, y_2)$. What is their IoU?',
    options: ['$\\frac{1}{7} \\approx 0.14$', '$\\frac{1}{4} = 0.25$', '$\\frac{1}{8} = 0.125$', '$\\frac{1}{2} = 0.5$'],
    answer: 0,
    explanation:
      'Overlap: width $\\min(4, 6) - \\max(0, 2) = 2$ and height $2$, so the overlap is $4$. Each box has area $16$, so the union is $16 + 16 - 4 = 28$ and IoU $= \\frac{4}{28} = \\frac{1}{7}$. $\\frac{1}{4}$ divides by one box only, and $\\frac{1}{8}$ forgets to subtract the overlap from the union.',
    difficulty: 'beginner',
  },
  {
    id: 'model-evaluation.regression-and-overlap-metrics.4',
    prompt:
      'A 3-class classifier has F1 scores of 0.96 (900 test images), 0.92 (80 images) and 0.10 (20 images). The team wants a single score in which poor performance on the rare class clearly shows. Which should they report?',
    options: ['Macro-F1, about 0.66', 'Weighted-F1, about 0.66', 'Macro-F1, about 0.94', 'Micro-F1, about 0.66'],
    answer: 0,
    explanation:
      'Macro-F1 averages the classes equally: $\\frac{0.96 + 0.92 + 0.10}{3} = \\frac{1.98}{3} = 0.66$, so the rare class pulls it down. Weighted-F1 weights by class size, $\\frac{900(0.96) + 80(0.92) + 20(0.10)}{1000} \\approx 0.94$, and micro-F1 is dominated by the 900 common images in the same way, so both hide the problem.',
    difficulty: 'intermediate',
  },
  {
    id: 'model-evaluation.regression-and-overlap-metrics.5',
    prompt: 'A lazy model predicts class 0 for every example. What does this code print? (Classes that are never predicted get F1 = 0.)',
    code: 'from sklearn.metrics import f1_score\ny_true = [0, 0, 0, 0, 0, 0, 1, 2]\ny_pred = [0, 0, 0, 0, 0, 0, 0, 0]\nprint(round(f1_score(y_true, y_pred, average="micro"), 2),\n      round(f1_score(y_true, y_pred, average="macro"), 2))',
    options: ['`0.75 0.29`', '`0.29 0.75`', '`0.75 0.75`', '`0.86 0.29`'],
    answer: 0,
    explanation:
      'Micro-F1 equals accuracy for single-label data: $6/8 = 0.75$. For macro, class 0 has TP 6, FP 2, FN 0, so $F_1 = \\frac{12}{14} \\approx 0.857$; classes 1 and 2 have F1 0. The average is $\\frac{0.857}{3} \\approx 0.29$. 0.86 is class 0\'s F1 on its own, not the micro average.',
    difficulty: 'advanced',
  },
]

export default questions
