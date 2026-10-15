import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'linear-regression.regularisation.1',
    prompt:
      'A linear model has bias $w_0 = 4$ and feature weights $w_1 = 2$, $w_2 = -1$, $w_3 = 0$. With $\\lambda = 0.5$, what is the ridge (L2) penalty term added to the MSE?',
    options: ['2.5', '1.5', '10.5', '5'],
    answer: 0,
    explanation:
      'Ridge adds $\\lambda \\sum_j w_j^2$ over the feature weights only: $0.5 \\times (2^2 + (-1)^2 + 0^2) = 0.5 \\times 5 = 2.5$. 1.5 is the L1 penalty $0.5 \\times (2 + 1 + 0)$, and 10.5 wrongly includes the bias: $0.5 \\times (16 + 4 + 1)$. The bias is not regularised.',
    difficulty: 'beginner',
  },
  {
    id: 'linear-regression.regularisation.2',
    prompt: 'Why does L1 regularisation tend to make some weights exactly 0, while L2 regularisation only makes them small?',
    options: [
      'Near 0, the pull (slope) of $\\lambda|w|$ stays at $\\lambda$, while the slope $2\\lambda w$ of $\\lambda w^2$ fades away',
      'L1 punishes large weights more heavily than L2 does, so the largest weights are the first to be removed',
      'L2 cannot be minimised by gradient descent, so the optimiser always stops just before the weights reach 0',
      'L1 removes the features with the smallest variance before training starts, which leaves their weights at 0',
    ],
    answer: 0,
    explanation:
      "L1's constant pull of size $\\lambda$ can drag a small weight all the way to 0 and hold it there (one weight: $w^* = \\max(|a| - \\lambda/2, 0)$), whereas L2's pull $2\\lambda w$ weakens as the weight shrinks ($w^* = a/(1+\\lambda)$, never exactly 0). Geometrically, the L1 diamond has corners on the axes. It is L2, not L1, that punishes large weights more heavily: $3^2 = 9$ versus $|3| = 3$.",
    difficulty: 'intermediate',
  },
  {
    id: 'linear-regression.regularisation.3',
    prompt: '`LogisticRegression(C=100)` reaches 99% training accuracy but only 70% validation accuracy. Which change is most likely to help?',
    options: [
      'Decrease C to about 0.1, which strengthens the regularisation',
      'Increase C to about 10,000, which strengthens the regularisation',
      'Keep C = 100 but also apply the penalty to the intercept',
      'Increase C until the training accuracy reaches 100%',
    ],
    answer: 0,
    explanation:
      'The big gap between training and validation accuracy is overfitting, so the model needs more regularisation. In scikit-learn, C is the inverse of the regularisation strength (it plays the role of $1/\\lambda$), so a smaller C means a stronger penalty; increasing C weakens it and makes overfitting worse. Penalising the intercept does not help, because it does not control how wiggly the model is.',
    difficulty: 'intermediate',
  },
  {
    id: 'linear-regression.regularisation.4',
    prompt:
      'A model must predict the same constant $c$ for every example. The targets are 2, 3, 4, 5 and 96. Which constant minimises the MAE, and which minimises the MSE?',
    options: ['MAE: 4; MSE: 22', 'MAE: 22; MSE: 4', 'MAE: 4; MSE: 4', 'MAE: 49; MSE: 22'],
    answer: 0,
    explanation:
      'The MAE is minimised by the median, 4 (two targets below, two above), and the MSE by the mean, $(2 + 3 + 4 + 5 + 96) \\div 5 = 110 \\div 5 = 22$. The single outlier 96 drags the MSE answer far from most of the data, which is why MAE is called robust. 49 is the midpoint of the smallest and largest values, which minimises neither.',
    difficulty: 'beginner',
  },
  {
    id: 'linear-regression.regularisation.5',
    prompt: 'In ridge regression with an unpenalised intercept, $\\lambda$ is made extremely large. What do the predictions approach?',
    options: [
      'The same value for every example: the mean of the training targets',
      'Zero for every example, because every parameter is pushed to 0',
      'The ordinary least-squares predictions, because only the sizes of the weights change',
      'A curve that passes exactly through every training point',
    ],
    answer: 0,
    explanation:
      'A huge $\\lambda$ forces every feature weight towards 0, but the intercept is not penalised, so it settles at the best constant for the MSE: the mean of $y$. The model then ignores its inputs, which is severe underfitting. Predictions would only go to 0 if the intercept were penalised too; passing through every point is what happens with $\\lambda = 0$ and a very flexible model.',
    difficulty: 'intermediate',
  },
]

export default questions
