import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'trees-and-ensembles.gradient-boosting.1',
    prompt: 'A trained gradient-boosting model has `init_prediction = 4.0` and `learning_rate = 0.1`. Its three trees predict 6.0, 5.4 and 4.9 for one input. What does `predict` return for that input?',
    code: 'pred = np.full(X.shape[0], self.init_prediction)\nfor tree in self.trees:\n    pred += self.learning_rate * tree.predict(X)\nreturn pred',
    options: ['5.63', '20.3', '1.63', '4.49'],
    answer: 0,
    explanation:
      'The prediction is the starting constant plus a scaled sum of the trees: $4.0 + 0.1 \\times (6.0 + 5.4 + 4.9) = 4.0 + 0.1 \\times 16.3 = 5.63$. 20.3 forgets the learning rate, 1.63 forgets the starting constant, and 4.49 adds only the last tree.',
    difficulty: 'beginner',
  },
  {
    id: 'trees-and-ensembles.gradient-boosting.2',
    prompt: 'Gradient boosting with the L1 loss $L = |y - F|$ is trained on the targets $y = [3, 1, 2, 10]$. What is the starting constant $F_0$, and which pseudo-residuals (negative gradients) does the first tree learn?',
    options: ['$F_0 = 2.5$, pseudo-residuals $[+1, -1, -1, +1]$', '$F_0 = 4$, pseudo-residuals $[-1, -1, -1, +1]$', '$F_0 = 2.5$, pseudo-residuals $[0.5, -1.5, -0.5, 7.5]$', '$F_0 = 4$, pseudo-residuals $[-1, -3, -2, 6]$'],
    answer: 0,
    explanation:
      'For L1 the best constant is the median: sorted, the targets are $[1, 2, 3, 10]$, so $F_0 = \\tfrac{2 + 3}{2} = 2.5$ (the mean, 4, is the L2 start). The negative gradient of $|y - F|$ is $\\operatorname{sign}(y - F)$: $3 - 2.5 > 0$ gives $+1$, $1 - 2.5$ and $2 - 2.5$ give $-1$, and $10 - 2.5$ gives $+1$. The plain residuals $y - F$ are the L2 pseudo-residuals, and $[-1, -3, -2, 6]$ is the full L2 answer, from the mean.',
    difficulty: 'intermediate',
  },
  {
    id: 'trees-and-ensembles.gradient-boosting.7',
    prompt: 'A table of HDB resale flats has some missing values in its numeric columns and a text column `town` with 26 categories. Which statement about the gradient-boosting libraries is true?',
    options: [
      'XGBoost learns a default direction for missing values at each split, so rows with NaNs can be used as they are',
      'XGBoost needs every NaN replaced by the column mean first, because a split cannot compare a NaN with a threshold',
      'CatBoost needs the town column one-hot encoded first, because its trees can only split on numeric columns',
      'LightGBM is fast because it trains all of its trees in parallel and averages them, as a random forest does',
    ],
    answer: 0,
    explanation:
      "At every split XGBoost (like LightGBM and scikit-learn's `HistGradientBoostingRegressor`) learns which branch the missing values should go down, so no imputation is needed. CatBoost is built to take categorical columns such as `town` directly (listed in `cat_features`), with no one-hot encoding. LightGBM is still sequential boosting: its speed comes from sorting feature values into histogram bins, not from training independent trees in parallel.",
    difficulty: 'beginner',
  },
  {
    id: 'trees-and-ensembles.gradient-boosting.4',
    prompt: 'You lower the learning rate of a gradient-boosting model from 0.1 to 0.01 and keep everything else the same. What typically happens?',
    options: [
      'You must add many more trees to reach a similar training loss, and the model often generalises as well or better.',
      'You need far fewer trees, because each smaller step fits the residuals more precisely, so training finishes sooner.',
      'Nothing changes once enough trees are added, because the learning rate scales just the first tree in the model.',
      'The model can no longer overfit however many trees you add, so early stopping and a validation set become unnecessary.',
    ],
    answer: 0,
    explanation:
      'Each tree is scaled by $\\eta$, so with $\\eta = 0.01$ every step is ten times smaller and roughly ten times as many trees are needed; in exchange, many small corrections usually generalise at least as well. A small learning rate delays overfitting but does not prevent it, so you still choose the number of trees with early stopping, and $\\eta$ scales every tree, not just the first.',
    difficulty: 'intermediate',
  },
  {
    id: 'trees-and-ensembles.gradient-boosting.5',
    prompt:
      'Early stopping uses `patience = 3` and `min_delta = 0`. The validation loss after trees 1 to 8 is: 10, 8, 7, 7.2, 6.9, 7.0, 7.1, 7.3. After which tree does training stop, and how many trees does the final model keep?',
    options: ['It stops after tree 8 and keeps 5 trees', 'It stops after tree 4 and keeps 3 trees', 'It stops after tree 8 and keeps 8 trees', 'It stops after tree 7 and keeps 5 trees'],
    answer: 0,
    explanation:
      'The best loss improves at trees 1, 2, 3 and 5 (6.9 beats 7). Tree 4 (7.2) only raised the counter to 1, and the improvement at tree 5 reset it. Trees 6, 7 and 8 fail to beat 6.9, so the counter reaches 3 after tree 8 and training stops, keeping the 5 trees up to the best round. Stopping at tree 4 would be a patience of 1, and keeping all 8 trees forgets to roll back to the best round.',
    difficulty: 'advanced',
  },
  {
    id: 'trees-and-ensembles.gradient-boosting.6',
    prompt:
      'A gradient-boosting classifier uses the log-loss, with labels $y = 0$ or $1$ and predicted probability $p = \\sigma(F)$. For one example with $y = 0$, the model currently gives $p = 0.3$. What pseudo-residual does the next tree learn for it?',
    options: ['$-0.3$', '$+0.3$', '$+0.7$', '$-0.7$'],
    answer: 0,
    explanation:
      'For the log-loss, the negative gradient with respect to the score $F$ is $y - p$, "true label minus predicted probability": $0 - 0.3 = -0.3$, which pushes the score, and so the probability, down. $+0.3$ is $p - y$, the gradient itself with the wrong sign; $+0.7$ is $1 - p$, the answer only if the label were 1; and $-0.7$ is $p - 1$.',
    difficulty: 'intermediate',
  },
]

export default questions
