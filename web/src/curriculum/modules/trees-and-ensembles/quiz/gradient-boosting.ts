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
    prompt: 'With the L1 loss $L = |y - F|$, the targets are $y = [3, 1, 2, 10]$ and every current prediction is $F = 2.5$. Which pseudo-residuals (negative gradients) does the next tree learn?',
    options: ['$[+1, -1, -1, +1]$', '$[0.5, -1.5, -0.5, 7.5]$', '$[-1, +1, +1, -1]$', '$[0.5, 1.5, 0.5, 7.5]$'],
    answer: 0,
    explanation:
      'For L1 the negative gradient is $\\operatorname{sign}(y - F)$: $3 - 2.5 > 0$ gives $+1$, $1 - 2.5 < 0$ gives $-1$, and so on. $[0.5, -1.5, -0.5, 7.5]$ are the plain residuals, which is the L2 answer. $[-1, +1, +1, -1]$ is the gradient itself (`y_pred - y`), with the wrong sign, and $[0.5, 1.5, 0.5, 7.5]$ takes absolute values of the residuals.',
    difficulty: 'intermediate',
  },
  {
    id: 'trees-and-ensembles.gradient-boosting.3',
    prompt: 'The training targets are $y = [3, 1, 2, 10]$. Which constant does gradient boosting start from, $F_0$, under the L2 loss and under the L1 loss?',
    options: ['L2: 4, L1: 2.5', 'L2: 2.5, L1: 4', 'L2: 4, L1: 4', 'L2: 0, L1: 0'],
    answer: 0,
    explanation:
      'The best constant for squared error is the mean, $\\tfrac{3 + 1 + 2 + 10}{4} = 4$; for absolute error it is the median, the middle of $[1, 2, 3, 10]$, which is $\\tfrac{2 + 3}{2} = 2.5$. Swapping them is the common slip. Starting from 0 still works in principle, but it wastes many early trees on just shifting every prediction up to the right level.',
    difficulty: 'beginner',
  },
  {
    id: 'trees-and-ensembles.gradient-boosting.4',
    prompt: 'You lower the learning rate of a gradient-boosting model from 0.1 to 0.01 and keep everything else the same. What typically happens?',
    options: [
      'You need many more trees to reach a similar training loss, and the final model often generalises as well or slightly better.',
      'You need many fewer trees, because each tree now fits the residuals more precisely, so training finishes sooner.',
      'Nothing changes after enough trees, because the learning rate only affects the very first tree that is added.',
      'The model can no longer overfit, so early stopping and a validation set are no longer needed.',
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
