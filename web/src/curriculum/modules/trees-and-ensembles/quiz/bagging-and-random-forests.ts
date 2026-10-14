import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'trees-and-ensembles.bagging-and-random-forests.1',
    prompt:
      'A training set has 10,000 rows. For one tree, a random forest draws a bootstrap sample. Which description of that sample is correct?',
    options: [
      '10,000 rows drawn with replacement, about 6,300 of them distinct',
      '6,300 rows drawn without replacement, all of them distinct',
      '10,000 rows in a new random order, all of them distinct',
      '3,700 rows drawn with replacement, about 2,300 of them distinct',
    ],
    answer: 0,
    explanation:
      'A bootstrap sample has the same size $n$ as the data and draws **with** replacement, so some rows repeat. A row is missed by all $n$ draws with probability $(1 - \\tfrac1n)^n \\approx \\tfrac1e \\approx 0.368$, so about 63.2% of the rows (about 6,300) appear at least once. Drawing 6,300 rows without replacement is subsampling, not bootstrapping.',
    difficulty: 'beginner',
  },
  {
    id: 'trees-and-ensembles.bagging-and-random-forests.2',
    prompt: 'Why can a random forest estimate its error on new data without a separate validation set?',
    options: [
      'Each tree skips about 37% of the rows, so every row can be predicted by the trees that never saw it',
      'Each tree is tested on the 37% of features it skipped, so the unused features act as a validation set',
      'The forest holds back the last 37% of the rows before training and scores itself on them at the end',
      'Averaging many trees removes all overfitting, so the training accuracy already equals the test accuracy',
    ],
    answer: 0,
    explanation:
      'Every bootstrap sample leaves about 36.8% of the rows out of bag. Predicting each row with only the trees for which it was out of bag gives the OOB error, an honest estimate of the test error (`oob_score=True` in scikit-learn). Training accuracy with all the trees is far too optimistic, since most trees have seen each row.',
    difficulty: 'beginner',
  },
  {
    id: 'trees-and-ensembles.bagging-and-random-forests.3',
    prompt:
      'Each tree in a bagged ensemble makes predictions with variance $\\sigma^2 = 4$, and any two trees\' errors have correlation $\\rho = 0.25$. Using $\\operatorname{Var} = \\rho\\sigma^2 + \\frac{1-\\rho}{B}\\sigma^2$, what is the variance of the average of $B = 100$ trees?',
    options: ['1.03', '0.04', '1.00', '3.00'],
    answer: 0,
    explanation:
      '$\\rho\\sigma^2 = 0.25 \\times 4 = 1$ and $\\frac{1-\\rho}{B}\\sigma^2 = \\frac{0.75 \\times 4}{100} = 0.03$, so the total is $1.03$. The tempting 0.04 is $\\sigma^2/B$, which is only true for independent trees: correlation leaves a floor of $\\rho\\sigma^2 = 1$ that more trees cannot remove. Random forests lower $\\rho$ by giving each split a random subset of features.',
    difficulty: 'intermediate',
  },
  {
    id: 'trees-and-ensembles.bagging-and-random-forests.4',
    prompt:
      'A random forest with 300 trees scores 99% on training data and 86% on validation data. A teammate suggests training 3,000 trees instead. What is the most likely result?',
    options: [
      'Validation accuracy stays close to 86% while training takes about 10 times longer',
      'Validation accuracy falls well below 86%, because 3,000 trees overfit the training data',
      'Validation accuracy rises to about 99%, because more trees always close the gap',
      'Training accuracy drops towards 86%, because the extra trees average away what was learned',
    ],
    answer: 0,
    explanation:
      'Once a few hundred trees are averaged, the forest\'s prediction barely changes as more are added, so validation accuracy plateaus while cost grows in proportion to the number of trees. More trees do **not** make a forest overfit more. To close the train-validation gap you would limit tree depth or leaf size, change `max_features`, or improve the features.',
    difficulty: 'intermediate',
  },
  {
    id: 'trees-and-ensembles.bagging-and-random-forests.5',
    prompt:
      'In a random forest predicting customer churn, `feature_importances_` (impurity based) ranks a `customer_id` column, a unique number for every row, third out of 10 features. Permutation importance on the test set gives it about 0. What is the best explanation?',
    options: [
      'Impurity importance comes from training splits and favours features with many distinct values, which deep trees use to fit noise',
      'The ID is genuinely predictive, and permutation importance misses it because shuffling an ID column does not change its values',
      'Permutation importance only works for features that were standardised, so an unscaled ID column always scores 0',
      'The forest used the ID in many splits, which proves the ID causes churn even though the test score does not show it',
    ],
    answer: 0,
    explanation:
      'A unique ID offers a different threshold between almost every pair of rows, so deep trees can always find an ID split that happens to separate a few noisy training rows, and each such split earns impurity credit. On held-out data the ID carries no signal, so shuffling it costs nothing. Shuffling does change which row gets which ID, so permutation importance is a fair test, and trees never need scaling.',
    difficulty: 'intermediate',
  },
]

export default questions
