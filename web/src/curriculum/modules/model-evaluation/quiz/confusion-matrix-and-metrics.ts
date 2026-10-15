import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'model-evaluation.confusion-matrix-and-metrics.1',
    prompt: 'A spam filter moves 20 emails to the spam folder, and 15 of them really are spam. Altogether there were 25 spam emails. What is the filter\'s **recall**?',
    options: ['0.60', '0.75', '0.80', '0.40'],
    answer: 0,
    explanation:
      'Recall $= \\frac{TP}{TP + FN}$: of the 25 real spams, 15 were caught, so recall $= 15/25 = 0.60$. The tempting 0.75 is $15/20$, which divides by everything flagged: that is **precision**, not recall.',
    difficulty: 'beginner',
  },
  {
    id: 'model-evaluation.confusion-matrix-and-metrics.2',
    prompt: 'A classifier has precision $0.8$ and recall $0.4$. What is its F1 score?',
    options: ['0.53', '0.60', '0.32', '0.40'],
    answer: 0,
    explanation:
      '$F_1 = \\frac{2PR}{P + R} = \\frac{2 \\times 0.8 \\times 0.4}{0.8 + 0.4} = \\frac{0.64}{1.2} \\approx 0.53$. The ordinary average, 0.60, is the trap: F1 is a harmonic mean, so it is pulled towards the weaker value (but stays above it). 0.32 is just $P \\times R$.',
    difficulty: 'beginner',
  },
  {
    id: 'model-evaluation.confusion-matrix-and-metrics.3',
    prompt: 'A model outputs probabilities, and you raise its decision threshold from 0.5 to 0.8 without retraining. What usually happens?',
    options: [
      'Recall falls or stays the same, and precision usually rises',
      'Recall rises or stays the same, and precision usually falls',
      'Precision and recall both rise, because the model is more confident',
      'Nothing changes, because the model\'s probabilities are the same',
    ],
    answer: 0,
    explanation:
      'A higher threshold flags fewer examples. Every positive it flagged before at 0.8 or more is still flagged, but those between 0.5 and 0.8 are now missed, so FN can only grow and recall cannot rise. Fewer flags usually means fewer false alarms, so precision usually rises. The probabilities are unchanged, but the predictions (and so the confusion matrix) are not.',
    difficulty: 'intermediate',
  },
  {
    id: 'model-evaluation.confusion-matrix-and-metrics.4',
    prompt:
      'A clinic uses a model to decide who is sent for a follow-up scan for a dangerous but treatable disease. The scan is cheap and harmless, and a missed case can be fatal. Which metric should the team care about most when choosing the threshold?',
    options: ['Recall', 'Precision', 'Accuracy', 'Specificity'],
    answer: 0,
    explanation:
      'The costly mistake is a false negative (a sick patient sent home), and recall $= \\frac{TP}{TP + FN}$ is the metric that falls when false negatives rise. Precision guards against false alarms, but here a false alarm only costs a cheap scan. Accuracy and specificity can both look excellent while sick patients are missed.',
    difficulty: 'beginner',
  },
  {
    id: 'model-evaluation.confusion-matrix-and-metrics.5',
    prompt: 'This code prints a 2 × 2 matrix. What is the number in its **top-right** corner, and what does it count?',
    code: 'from sklearn.metrics import confusion_matrix\ny_true = [0, 0, 0, 1, 1, 1, 1]\ny_pred = [0, 1, 1, 1, 0, 1, 1]\nprint(confusion_matrix(y_true, y_pred))',
    options: ['2, the false positives', '1, the false negatives', '3, the true positives', '2, the false negatives'],
    answer: 0,
    explanation:
      'scikit-learn puts actual classes in rows and predicted classes in columns, class 0 first: `[[TN, FP], [FN, TP]]`. The top-right cell is actual 0, predicted 1: the false positives. The second and third examples are actual 0 but predicted 1, so FP = 2. The full output is `[[1 2] [1 3]]`. Reading it with the positive class first would wrongly give the false negatives.',
    difficulty: 'intermediate',
  },
]

export default questions
