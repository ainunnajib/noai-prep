import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'data-and-features.splitting-and-leakage.1',
    prompt:
      'A dataset has 2,000 patients, 5% of whom have a rare disease. You make a **stratified** 75/25 train/validation split. How many patients with the disease are in the validation set?',
    options: ['25', '100', '75', 'Anywhere from 0 to 100, depending on the random seed'],
    answer: 0,
    explanation:
      'The validation set has $25\\% \\times 2000 = 500$ patients, and stratifying keeps the 5% share in every part: $0.05 \\times 500 = 25$. 100 is the count in the whole dataset and 75 the count in the training set. The seed only changes *which* 25 patients are chosen; that the count varies with the seed is true of a plain random split, not a stratified one.',
    difficulty: 'beginner',
  },
  {
    id: 'data-and-features.splitting-and-leakage.2',
    prompt:
      'You are building a model to forecast next week\'s daily MRT ridership from two years of daily records. Which way of choosing validation data gives the most trustworthy estimate?',
    options: [
      'Train on the earlier days and validate on the most recent weeks',
      'Shuffle all the days and hold out a random 20% of them',
      'Stratify the split so that each part has the same mix of weekdays',
      'Validate on the first 20% of days and train on all the later days',
    ],
    answer: 0,
    explanation:
      'The model will predict the future from the past, so validation must do the same. Shuffling lets the model train on days after (and right next to) the days it is tested on, so it effectively sees the future and the score is too optimistic. Validating on the earliest days is backwards in time, and stratifying by weekday does not stop future days from entering training.',
    difficulty: 'beginner',
  },
  {
    id: 'data-and-features.splitting-and-leakage.3',
    prompt: 'What is wrong with this workflow?',
    code: 'scaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)\nX_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2)\nmodel.fit(X_train, y_train)\nprint(model.score(X_test, y_test))',
    options: [
      'The scaler was fitted on the test rows as well, so test information leaked into training',
      'The scaler should be fitted on the test rows only, since the score is measured on those rows',
      'Nothing is wrong: scaling never uses the labels, so it cannot cause any kind of leakage',
      'StandardScaler must come after train_test_split because it cannot transform two arrays',
    ],
    answer: 0,
    explanation:
      '`fit_transform(X)` runs on all rows before the split, so the test rows help decide the scaling of the training rows. Split first, call `fit` on `X_train` only, and `transform` both parts (or use a Pipeline). It is true that a scaler never sees labels, which is why this leak is often small, but it is still leakage and with imputers or feature selection the same mistake can inflate scores a lot.',
    difficulty: 'intermediate',
  },
  {
    id: 'data-and-features.splitting-and-leakage.4',
    prompt:
      'A bank model predicts, **at the moment a loan is approved**, whether it will default within a year. It scores 99% on validation data. Which feature most likely explains the suspiciously high score?',
    options: [
      'Number of reminder letters sent to the borrower',
      'Borrower\'s monthly income stated on the application',
      'Number of late payments on the borrower\'s past loans',
      'Size of the loan the borrower applied for',
    ],
    answer: 0,
    explanation:
      'Reminder letters are only sent after repayments are missed, which happens after approval and is closely tied to defaulting, so the feature is target leakage: it is not known at prediction time. Income, past late payments and loan size are all known when the application is assessed, so they are fair features.',
    difficulty: 'beginner',
  },
  {
    id: 'data-and-features.splitting-and-leakage.5',
    prompt:
      'Why does passing `make_pipeline(StandardScaler(), SelectKBest(k=10), LogisticRegression())` to `cross_val_score(pipe, X, y, cv=5)` prevent preprocessing leakage?',
    options: [
      'In every round, the scaler and selector are fitted on the training folds only',
      'The pipeline removes every feature that is known only after the outcome',
      'The pipeline scales and selects once on all rows, so every fold uses the same columns',
      'The pipeline holds back an extra test set, so the cross-validation folds stay unused',
    ],
    answer: 0,
    explanation:
      'In each of the 5 rounds, `cross_val_score` calls `pipe.fit` on the 4 training folds, so every step learns from training rows only, and the held-out fold is only transformed and scored. Fitting once on all the data is exactly the leak a pipeline avoids. A pipeline cannot spot target leakage: a post-outcome feature must be removed by you.',
    difficulty: 'intermediate',
  },
]

export default questions
