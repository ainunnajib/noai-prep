import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'model-evaluation.imbalanced-data.1',
    prompt:
      'A test set has 1,000 transactions, 10 of which are fraud. Model A never flags anything. Model B flags 60 transactions, 8 of which are fraud. Which statement is true?',
    options: [
      'Model A has the higher accuracy, but Model B has far higher recall',
      'Model B has both the higher accuracy and the higher recall',
      'Both models have the same recall, because both miss some frauds',
      'Model A has the higher precision, because it never raises a false alarm',
    ],
    answer: 0,
    explanation:
      'Model A: accuracy $= 990/1000 = 99\\%$, recall $= 0/10 = 0$. Model B: $TP = 8$, $FP = 52$, $FN = 2$, $TN = 938$, so accuracy $= 946/1000 = 94.6\\%$ but recall $= 8/10 = 0.8$. The useless model wins on accuracy: the accuracy paradox. Model A\'s precision is not "higher": with no positive predictions it is $0/0$, undefined.',
    difficulty: 'intermediate',
  },
  {
    id: 'model-evaluation.imbalanced-data.2',
    prompt:
      'A training set has 4,750 negative and 250 positive examples. Using class weights $w_0 = 1$ and $w_1 = n_0 / n_1$, what weight does each positive example get in the loss?',
    options: ['19', '20', '0.05', '10'],
    answer: 0,
    explanation:
      '$w_1 = n_0 / n_1 = 4{,}750 / 250 = 19$, so the 250 positives weigh $250 \\times 19 = 4{,}750$ in total, the same as all the negatives. 20 is $5{,}000/250$ (total over positives), and 0.05 is the prevalence $250/5{,}000$.',
    difficulty: 'beginner',
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
      'A fraud model outputs calibrated probabilities. Checking a flagged payment costs 5 dollars; a missed fraud costs 45 dollars. To minimise the expected cost, flag a payment when its predicted fraud probability is above which value?',
    options: ['0.1', '0.5', '0.9', '0.11'],
    answer: 0,
    explanation:
      'Flag when the expected cost of flagging, $(1 - p) \\times 5$, is less than the expected cost of letting it through, $p \\times 45$. That happens when $p > \\frac{5}{5 + 45} = 0.1$. 0.11 is $5/45$ (forgetting the $c_{FP}$ in the denominator) and 0.9 swaps the two costs.',
    difficulty: 'intermediate',
  },
]

export default questions
