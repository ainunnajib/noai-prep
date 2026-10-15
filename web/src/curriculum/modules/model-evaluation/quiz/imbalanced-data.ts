import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'model-evaluation.imbalanced-data.1',
    prompt:
      'A screening model for a rare disease is tested on a large set of patients, 0.5% of whom have the disease. The team reports an accuracy of 99.4%. What is the most sensible conclusion?',
    options: [
      'The accuracy tells you little: calling everyone healthy would score 99.5%, so check recall and precision on the disease class',
      'The model is excellent, because it gives the right answer for more than 99 out of every 100 patients it sees',
      'The model must have a high recall, because its mistakes add up to at most 0.6% of all the patients tested',
      'The model is useless, because its accuracy is lower than the accuracy of always answering "healthy"',
    ],
    answer: 0,
    explanation:
      'With 0.5% prevalence, the do-nothing model that always says "healthy" scores $1 - 0.005 = 99.5\\%$, so 99.4% on its own proves nothing. The 0.6% of mistakes could include every sick patient (recall 0), or the model could catch most of them while raising a few false alarms, which is exactly how a useful detector can score *below* the do-nothing baseline. Only recall and precision on the disease class tell the two apart.',
    difficulty: 'intermediate',
  },
  {
    id: 'model-evaluation.imbalanced-data.2',
    prompt:
      'A training set has 4,750 negative and 250 positive examples. Which statement comparing class weights with random oversampling is correct?',
    options: [
      'Giving each positive weight 19 has the same effect on the loss as copying each positive 19 times, but the copies make training slower',
      'Copying each positive 19 times adds new information about the positive class, so it generalises better than class weights',
      'Each positive needs weight 20 to balance the classes, because there are 5,000 examples and 250 of them are positive',
      'Class weights must also be applied when scoring the test set, whereas an oversampled model can be tested as it is',
    ],
    answer: 0,
    explanation:
      '$w_1 = n_0 / n_1 = 4{,}750 / 250 = 19$, so the positives weigh $250 \\times 19 = 4{,}750$ in total, the same as the negatives. Copying a row 19 times adds 19 identical terms to the loss, which is exactly weight 19, but the training set grows to 9,500 rows and contains no new information. 20 wrongly divides the total (5,000) instead of the negatives, and the test set is never reweighted or resampled.',
    difficulty: 'intermediate',
  },
  {
    id: 'model-evaluation.imbalanced-data.3',
    prompt:
      'SMOTE builds a synthetic example from the minority point $x_i = (2, 4)$ and its neighbour $x_{nn} = (6, 8)$, using $\\lambda = 0.25$. What is the new point?',
    options: ['$(3, 5)$', '$(4, 6)$', '$(5, 7)$', '$(2, 4)$'],
    answer: 0,
    explanation:
      '$x_{\\text{new}} = x_i + \\lambda (x_{nn} - x_i) = (2, 4) + 0.25 \\times (4, 4) = (3, 5)$, a quarter of the way along the line to the neighbour. $(4, 6)$ is the midpoint ($\\lambda = 0.5$), and $(2, 4)$ would be a plain copy, which is random oversampling rather than SMOTE.',
    difficulty: 'beginner',
  },
  {
    id: 'model-evaluation.imbalanced-data.4',
    prompt: 'Why must oversampling (or SMOTE) be applied only to the training set, after the train/test split?',
    options: [
      'Otherwise copies of the same minority example can land in both sets, so the test score is inflated',
      'Because oversampling changes the number of features, so the test set would no longer fit the model',
      'Because the test set must be balanced as well, otherwise precision and recall cannot be computed',
      'Because oversampling the test set would make training slower without changing any result',
    ],
    answer: 0,
    explanation:
      'If you resample before splitting, a fraud and its duplicates (or synthetic points built from it) can end up on both sides, so the model is tested on near-copies of its training data: leakage. The test set should keep the real imbalance, and precision and recall work perfectly well on imbalanced data.',
    difficulty: 'intermediate',
  },
  {
    id: 'model-evaluation.imbalanced-data.5',
    prompt:
      'A fraud model outputs calibrated probabilities. Flagging a genuine payment (a false alarm) costs 5 dollars, a missed fraud costs 45 dollars, and correct decisions cost nothing. To minimise the expected cost, flag a payment when its predicted fraud probability is above which value?',
    options: ['0.1', '0.5', '0.9', '0.11'],
    answer: 0,
    explanation:
      'Flag when the expected cost of flagging, $(1 - p) \\times 5$, is less than the expected cost of letting it through, $p \\times 45$. That happens when $p > \\frac{5}{5 + 45} = 0.1$. 0.11 is $5/45$ (forgetting the $c_{FP}$ in the denominator) and 0.9 swaps the two costs.',
    difficulty: 'intermediate',
  },
]

export default questions
