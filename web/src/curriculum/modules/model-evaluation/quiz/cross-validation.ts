import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'model-evaluation.cross-validation.1',
    prompt: '4-fold cross-validation gives validation accuracies of 0.6, 0.8, 0.6 and 0.8. How should you report the result (mean ± standard deviation)?',
    options: ['$0.70 \\pm 0.10$', '$0.70 \\pm 0.20$', '$0.70 \\pm 0.01$', '$0.80 \\pm 0.10$'],
    answer: 0,
    explanation:
      'Mean $= (0.6 + 0.8 + 0.6 + 0.8)/4 = 2.8/4 = 0.7$. Every score is $0.1$ from the mean, so the average squared distance is $0.01$ and the SD is $\\sqrt{0.01} = 0.1$. $0.20$ is the range (best minus worst), and $0.01$ is the variance, which still needs its square root.',
    difficulty: 'beginner',
  },
  {
    id: 'model-evaluation.cross-validation.2',
    prompt: 'A dataset has 300 rows, and 60 of them belong to the positive class. With stratified 5-fold cross-validation, how many positive rows does each validation fold contain?',
    options: ['12', '48', '60', '15'],
    answer: 0,
    explanation:
      'Each fold holds $300 / 5 = 60$ rows, and stratification keeps the positive rate of the whole dataset, $60 / 300 = 20\\%$, in every fold: $0.2 \\times 60 = 12$ (the same as $60 / 5$). 48 is the number of positives in the four *training* folds, and 60 is the size of a whole fold, not its count of positives.',
    difficulty: 'beginner',
  },
  {
    id: 'model-evaluation.cross-validation.3',
    prompt:
      'A hospital dataset has 5 chest X-rays from each of 200 patients. You run plain 5-fold cross-validation on the 1,000 X-rays, so most patients have X-rays in both the training and the validation folds. What does this do to the cross-validation score?',
    options: [
      'Too optimistic: the model can recognise patients it has already seen in training',
      'Too pessimistic: each model is trained on just 800 of the 1,000 X-rays',
      'Unbiased, because each X-ray is in the validation fold exactly once',
      'Unbiased, as long as the folds are also stratified by diagnosis',
    ],
    answer: 0,
    explanation:
      "Most validation X-rays share a patient with X-rays in the training folds (each of a patient's other 4 X-rays lands in training with probability about 0.8), so the model can score well by recognising the patient rather than the disease. Real new patients were never in the training data, so the score is too high. Keep each patient's X-rays together in one fold (`GroupKFold`); stratifying by diagnosis balances the classes but does not stop this leak.",
    difficulty: 'intermediate',
  },
  {
    id: 'model-evaluation.cross-validation.4',
    prompt:
      'You use 5-fold cross-validation to score a random forest with fixed settings. The fold scores range from 0.81 to 0.88, and you decide to use this recipe. Which model should you deploy?',
    options: [
      'A fresh forest with the same settings, trained once on all the training data',
      'The forest from the round that scored 0.88, because it generalised best',
      'The forest from the round whose score was closest to the mean of all five',
      'The forest from the last round, because it was trained most recently',
    ],
    answer: 0,
    explanation:
      'Cross-validation scores a recipe (model type plus hyperparameters); the five fold forests exist only to produce those scores, and each saw just 80% of the rows. Retrain once on all of them. The 0.88 forest is not better: its validation fold happened to be easier, which is luck, not skill.',
    difficulty: 'beginner',
  },
  {
    id: 'model-evaluation.cross-validation.5',
    prompt: 'This is one round of k-fold cross-validation written from scratch. What does it print?',
    code: 'import numpy as np\nrows = np.arange(20)\nfolds = np.array_split(rows, 4)\ni = 1\nval = folds[i]\nrest = folds[:i] + folds[i+1:]\ntrain = np.concatenate(rest)\nprint(len(train), val[:2])',
    options: ['`15 [5 6]`', '`15 [0 1]`', '`5 [5 6]`', '`20 [5 6]`'],
    answer: 0,
    explanation:
      '`np.array_split` cuts the row numbers 0 to 19 into 4 folds of 5: 0–4, 5–9, 10–14 and 15–19. Python counts from 0, so `folds[1]` is the second fold, which starts 5, 6. The training rows are the other three folds glued together: $3 \\times 5 = 15$. Printing 20 would mean the validation rows were also used for training.',
    difficulty: 'intermediate',
  },
  {
    id: 'model-evaluation.cross-validation.6',
    prompt:
      'You have 2 million labelled rows and plan to hold out 10% of them for validation. One training run takes 3 hours. To compare two models, a teammate suggests 10-fold cross-validation instead. What is the better plan?',
    options: [
      'A single split: 200,000 validation rows already give a stable score',
      '10-fold CV, because a single split is too noisy to compare two models',
      'Leave-one-out CV, because each model then trains on the most rows',
      'Skip validation and compare the two models on their training accuracy',
    ],
    answer: 0,
    explanation:
      'With 200,000 validation rows, each row is worth just $\\frac{1}{200{,}000}$ of the score (0.0005 percentage points), so the score hardly depends on which rows land in the validation set. 10-fold CV would cost $10 \\times 3 = 30$ hours per model for almost no extra reliability: it pays off when data are scarce and each score is noisy. Leave-one-out would need 2 million fits, and training accuracy rewards memorising, not generalising.',
    difficulty: 'beginner',
  },
]

export default questions
