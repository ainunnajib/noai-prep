import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'final-lab-numpy.task-gradient-boosting.1',
    prompt: 'What does this print?',
    code: 'import numpy as np\n\ndef l1_negative_gradient(y, y_pred):\n    return np.sign(y - y_pred)\n\nprint(l1_negative_gradient(np.array([5., 2., 7.]), np.array([3., 2., 9.])))',
    options: ['`[ 1.  0. -1.]`', '`[ 2.  0. -2.]`', '`[-1.  0.  1.]`', '`[ 1.  1. -1.]`'],
    answer: 0,
    explanation:
      '$y - \\hat y = [5 - 3, 2 - 2, 7 - 9] = [2, 0, -2]$, and `np.sign` keeps only the direction: $[1, 0, -1]$. `[ 2.  0. -2.]` is the L2 negative gradient (the residual), `[-1.  0.  1.]` is the gradient (`y_pred - y`), and `[ 1.  1. -1.]` wrongly makes the sign of 0 equal to $+1$.',
    difficulty: 'beginner',
  },
  {
    id: 'final-lab-numpy.task-gradient-boosting.2',
    prompt: "Why does `l1_initial_prediction` return the **median** of `y`, while `l2_initial_prediction` returns the **mean**?",
    options: [
      'The median minimises the mean absolute error, and the mean minimises the mean squared error',
      'The median ignores outliers, so it is the more accurate starting point for both losses',
      'The mean minimises the mean absolute error, and the median minimises the mean squared error',
      'NumPy computes the median of a 2-D array faster than its mean, which suits the L1 tests',
    ],
    answer: 0,
    explanation:
      'The best constant is where the negative gradients cancel. For L2 the residuals $y - c$ sum to 0 exactly at the mean; for L1 the signs $\\pm 1$ cancel when half the points are above $c$, which is the median. On $y = [3, 1, 2, 10]$ the MSE is smallest at 4 (the mean) and the MAE is smallest anywhere between 2 and 3 (including the median 2.5). Robustness to outliers is a property of the median, but it is not the best constant for squared error.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-numpy.task-gradient-boosting.3',
    prompt:
      '$F_0 = 50$, `learning_rate = 0.2`, and the three stored trees predict $10$, $-5$ and $15$ for one sample. A student forgets the learning rate in `predict` but used it correctly in `fit`. What does their `predict` return for this sample, and what should it return?',
    options: ['They get 70; it should be 54', 'They get 54; it should be 70', 'They get 20; it should be 4', 'They get 70; it should be 14'],
    answer: 0,
    explanation:
      'Correct: $F_0 + \\eta \\sum h_m = 50 + 0.2 \\times (10 - 5 + 15) = 50 + 4 = 54$. Without the learning rate: $50 + 20 = 70$. Leaving out $F_0$ gives 20 or 4, and 14 wrongly scales $F_0$ by the learning rate too. The trees were trained to take steps of $0.2 \\times$ their output, so adding them at full size overshoots; in the real test cell this raises the test MSE from about 1,268 to about 959,123.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-numpy.task-gradient-boosting.4',
    prompt:
      'With `subsample=0.8`, a student writes step d as `current_pred[indices] += self.learning_rate * tree.predict(X[indices])`. What goes wrong?',
    options: [
      'Rows left out of the sample miss this tree’s correction, so the predictions in fit() drift away from what predict() computes',
      'Nothing goes wrong: rows a tree was not fitted on should keep their old prediction, which is the purpose of subsampling',
      'The tree cannot predict rows it was not fitted on, so the full update with tree.predict(X) would raise an error',
      'The update is correct, but the learning rate must be divided by 0.8 to make up for the rows that were left out',
    ],
    answer: 0,
    explanation:
      '`predict` adds every tree to every row, so `fit` must too: the scaffold says "update predictions for ALL samples". A tree can predict any row (it only needs the features), so `tree.predict(X)` works fine. In the notebook data with `subsample=0.5`, updating only the sampled rows raised the test MSE from about 859 to about 7,102.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-numpy.task-gradient-boosting.5',
    prompt:
      'In `GBREarlyStop` with `patience=2` and `min_delta=0`, the validation MSE after trees 1 to 7 is 50, 40, 35, 36, 34, 37, 38. Training stops when `patience_counter >= patience`. After which tree does it stop, and how many trees are kept?',
    options: ['Stops after tree 7, keeps 5', 'Stops after tree 4, keeps 3', 'Stops after tree 7, keeps 7', 'Stops after tree 7, keeps 4'],
    answer: 0,
    explanation:
      'Trees 1 to 3 each improve (best 35, `best_n_estimators` 3). Tree 4 (36) fails: counter 1. Tree 5 (34) improves: best 34, `best_n_estimators = 5`, counter 0. Trees 6 and 7 fail: counter 2, which reaches the patience, so it stops after tree 7 and trims to the first 5 trees. Stopping at the first rise ignores the patience, keeping 7 forgets the trim, and 4 comes from storing the index `m` instead of `m + 1`.',
    difficulty: 'intermediate',
  },
]

export default questions
