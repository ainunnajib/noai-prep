import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'model-evaluation.hyperparameter-tuning.1',
    prompt:
      'You can afford 16 trials to tune the learning rate and the batch size, but only the learning rate really affects the score. A 4 × 4 grid search is compared with 16 random-search trials. How many different learning rates does each one test?',
    options: ['Grid: 4; random: up to 16', 'Grid: 16; random: 4', 'Grid: 16; random: up to 16', 'Grid: 4; random: 4'],
    answer: 0,
    explanation:
      'The grid repeats each of its 4 learning rates with 4 batch sizes, so it learns about only 4 learning rates. Random search draws a fresh learning rate for every trial: up to 16 different values. This is why random search explores the hyperparameter that matters more thoroughly for the same budget.',
    difficulty: 'beginner',
  },
  {
    id: 'model-evaluation.hyperparameter-tuning.2',
    prompt:
      'A grid search tries 3 values of `max_depth`, 2 values of `min_samples_leaf` and 2 values of `criterion`, and scores every setting with 3-fold cross-validation. How many models does it train before the final refit?',
    options: ['36', '12', '21', '7'],
    answer: 0,
    explanation:
      'The grid has $3 \\times 2 \\times 2 = 12$ settings, and 3-fold CV trains 3 models for each: $12 \\times 3 = 36$. Adding the counts instead of multiplying them gives $3 + 2 + 2 = 7$ (or 21 with the folds), and 12 forgets that every setting is trained once per fold. `GridSearchCV` then refits the winner on all the rows, a 37th fit.',
    difficulty: 'beginner',
  },
  {
    id: 'model-evaluation.hyperparameter-tuning.3',
    prompt:
      '`X` has 100 rows and 5,000 columns of random numbers, and `y` holds random labels, so there is nothing real to learn. Yet this code prints about 0.86. What is the best explanation?',
    code: 'sel = SelectKBest(f_classif,\n                  k=20)\nX_sel = sel.fit_transform(X, y)\nlr = LogisticRegression()\ns = cross_val_score(lr, X_sel, y,\n                    cv=5)\nprint(s.mean())',
    options: [
      "The validation rows' labels helped to choose the 20 columns",
      'Five folds are too few; with 10 folds the score would drop to about 0.5',
      'Logistic regression overfits the 20 chosen columns, which raises the validation scores',
      'With more columns than rows, random numbers contain a real pattern to learn',
    ],
    answer: 0,
    explanation:
      'Selecting on all rows lets the validation labels pick columns that match them by chance, so those columns keep "working" on the validation folds. Put `SelectKBest` and the model in a Pipeline and the score falls to about 0.5. Overfitting would *lower* validation scores, not raise them, and changing the number of folds does not remove the leak.',
    difficulty: 'intermediate',
  },
  {
    id: 'model-evaluation.hyperparameter-tuning.4',
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
    id: 'model-evaluation.hyperparameter-tuning.5',
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
