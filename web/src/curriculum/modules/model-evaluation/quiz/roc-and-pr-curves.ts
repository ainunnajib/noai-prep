import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'model-evaluation.roc-and-pr-curves.1',
    prompt: 'The ROC curve plots the true positive rate against the false positive rate. Which formula is the **false positive rate**?',
    options: ['$\\frac{FP}{FP + TN}$', '$\\frac{FP}{FP + TP}$', '$\\frac{FN}{FN + TP}$', '$\\frac{TN}{TN + FP}$'],
    answer: 0,
    explanation:
      'FPR is the fraction of actual negatives that are wrongly flagged: $\\frac{FP}{FP + TN}$, the actual-negative row of the confusion matrix. $\\frac{FP}{FP + TP}$ divides by the predicted positives instead (that is $1 - \\text{precision}$), and $\\frac{TN}{TN + FP}$ is specificity, which equals $1 - \\text{FPR}$.',
    difficulty: 'beginner',
  },
  {
    id: 'model-evaluation.roc-and-pr-curves.2',
    prompt: 'A classifier has an ROC-AUC of 0.85. Which statement is correct?',
    options: [
      'In 85% of all (positive, negative) pairs, the positive gets the higher score',
      'The classifier labels 85% of all examples correctly at its default threshold',
      'At a threshold of 0.5, the classifier finds 85% of the positives',
      '85% of the examples the classifier flags as positive really are positive',
    ],
    answer: 0,
    explanation:
      'AUC measures ranking: it is the probability that a random positive outscores a random negative, which is the same as the fraction of (positive, negative) pairs ranked correctly, and it does not depend on any threshold. The other options describe accuracy, recall at one threshold and precision, each of which depends on the threshold you choose.',
    difficulty: 'intermediate',
  },
  {
    id: 'model-evaluation.roc-and-pr-curves.3',
    prompt:
      'A model scores three positives 0.9, 0.6 and 0.4, and two negatives 0.7 and 0.2. What is its ROC-AUC?',
    options: ['$\\frac{4}{6}$', '$\\frac{5}{6}$', '$\\frac{3}{6}$', '$\\frac{2}{6}$'],
    answer: 0,
    explanation:
      'There are $3 \\times 2 = 6$ (positive, negative) pairs. 0.9 beats both negatives (2 pairs), 0.6 beats only 0.2 (1 pair), and 0.4 beats only 0.2 (1 pair). That is $2 + 1 + 1 = 4$ correct pairs, so AUC $= \\frac{4}{6} \\approx 0.67$.',
    difficulty: 'intermediate',
  },
  {
    id: 'model-evaluation.roc-and-pr-curves.4',
    prompt: 'On an ROC plot, what does the straight diagonal line from $(0, 0)$ to $(1, 1)$ represent?',
    options: [
      'A classifier that guesses at random: TPR equals FPR, and the AUC is 0.5',
      'A perfect classifier, which finds every positive without any false alarms',
      'A classifier that always predicts the positive class, whatever the input',
      'The best threshold for the model, where precision equals recall',
    ],
    answer: 0,
    explanation:
      'Flagging a random fraction $f$ of the examples catches a fraction $f$ of the positives and a fraction $f$ of the negatives, so TPR = FPR: the diagonal, with area 0.5 under it. A perfect classifier goes straight up to the top-left corner $(0, 1)$, and "always positive" is the single point $(1, 1)$, not the whole line.',
    difficulty: 'beginner',
  },
  {
    id: 'model-evaluation.roc-and-pr-curves.5',
    prompt:
      'A fraud model has an ROC-AUC of 0.97 on data where 0.1% of transactions are fraud, yet the investigators say most of its alerts are false alarms. Which evaluation would best expose this problem?',
    options: [
      'The precision-recall curve and its average precision',
      'The ROC curve and its AUC, recomputed on a larger test set',
      'The accuracy of the model at the default threshold of 0.5',
      'The specificity of the model at the default threshold of 0.5',
    ],
    answer: 0,
    explanation:
      'With 0.1% fraud there are about 999 genuine transactions per fraud, so even a small false positive rate produces many false alarms per real fraud. Accuracy and specificity are dominated by the huge negative class, and ROC-AUC ignores the class ratio altogether: FPR divides by the huge number of genuine transactions, so thousands of false alarms still look like a tiny FPR, and a larger test set only measures that same flattering number more precisely. Precision divides by the alerts themselves, so the PR curve shows directly how many alerts are real.',
    difficulty: 'intermediate',
  },
]

export default questions
