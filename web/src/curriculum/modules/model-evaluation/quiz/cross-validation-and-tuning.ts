import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'model-evaluation.cross-validation-and-tuning.1',
    prompt: '4-fold cross-validation gives validation accuracies of 0.6, 0.8, 0.6 and 0.8. How should you report the result (mean ± standard deviation)?',
    options: ['$0.70 \\pm 0.10$', '$0.70 \\pm 0.20$', '$0.70 \\pm 0.01$', '$0.80 \\pm 0.10$'],
    answer: 0,
    explanation:
      'Mean $= (0.6 + 0.8 + 0.6 + 0.8)/4 = 2.8/4 = 0.7$. Every score is $0.1$ from the mean, so the average squared distance is $0.01$ and the SD is $\\sqrt{0.01} = 0.1$. $0.20$ is the range (best minus worst), and $0.01$ is the variance, which still needs its square root.',
    difficulty: 'beginner',
  },
  {
    id: 'model-evaluation.cross-validation-and-tuning.2',
    prompt:
      '`X` has 100 rows and 5,000 columns of random numbers, and `y` holds random labels, so there is nothing real to learn. Yet this code prints about 0.86. What is the best explanation?',
    code: 'X_sel = SelectKBest(f_classif, k=20).fit_transform(X, y)\nscores = cross_val_score(LogisticRegression(), X_sel, y, cv=5)\nprint(scores.mean())',
    options: [
      'The validation rows\' labels helped to choose the 20 columns',
      'Five folds are too few; with 10 folds the score would drop to about 0.5',
      'Logistic regression overfits the 20 chosen columns, which raises the validation scores',
      'With more columns than rows, random numbers always contain a genuine pattern',
    ],
    answer: 0,
    explanation:
      'Selecting on all rows lets the validation labels pick columns that match them by chance, so those columns keep "working" on the validation folds. Put `SelectKBest` and the model in a Pipeline and the score falls to about 0.5. Overfitting would *lower* validation scores, not raise them, and changing the number of folds does not remove the leak.',
    difficulty: 'intermediate',
  },
  {
    id: 'model-evaluation.cross-validation-and-tuning.3',
    prompt:
      'You can afford 16 trials to tune the learning rate and the batch size, but only the learning rate really affects the score. A 4 × 4 grid search is compared with 16 random-search trials. How many different learning rates does each one test?',
    options: ['Grid: 4; random: up to 16', 'Grid: 16; random: 4', 'Grid: 16; random: up to 16', 'Grid: 4; random: 4'],
    answer: 0,
    explanation:
      'The grid repeats each of its 4 learning rates with 4 batch sizes, so it learns about only 4 learning rates. Random search draws a fresh learning rate for every trial: up to 16 different values. This is why random search explores the hyperparameter that matters more thoroughly for the same budget.',
    difficulty: 'beginner',
  },
  {
    id: 'model-evaluation.cross-validation-and-tuning.4',
    prompt:
      'A team retrains after each of 40 hyperparameter tweaks, checks the test accuracy every time, and reports the best one: 93%. Deployed on new data from the same source, the model scores 89%. What is the most likely explanation?',
    options: [
      'The best of all 40 test scores is partly luck, so 93% was biased upwards',
      'The model is underfitting because 40 tweaks were not enough tuning',
      'The test set was too large, which made each individual test score unstable',
      'The deployment data must come from a different distribution than the test set',
    ],
    answer: 0,
    explanation:
      'Every test score is true skill plus luck. Choosing the maximum of 40 noisy scores selects luck, so the test set has effectively been used for tuning. Tune on a validation set or with CV and test once. A larger test set would make each score *more* stable, and the stem rules out a change of distribution.',
    difficulty: 'intermediate',
  },
  {
    id: 'model-evaluation.cross-validation-and-tuning.5',
    prompt:
      'With only 300 rows, you skip a separate test set and tune a model with `GridSearchCV(model, grid, cv=5)`. Which number is an honest estimate of how the tuned model will do on new data?',
    options: [
      'The mean outer-fold score of nested cross-validation',
      '`best_score_`, the best mean cross-validation score that the grid search found',
      'The accuracy of the refitted best model on the 300 rows it was trained on',
      'The highest single-fold score of the winning setting',
    ],
    answer: 0,
    explanation:
      'In nested CV each outer fold is scored by a model whose tuning never saw it, so no choice was made using that fold. `best_score_` is the maximum over many settings, which makes it slightly optimistic, and the highest single fold is even more so. Training accuracy measures memorisation, not performance on new data.',
    difficulty: 'advanced',
  },
]

export default questions
