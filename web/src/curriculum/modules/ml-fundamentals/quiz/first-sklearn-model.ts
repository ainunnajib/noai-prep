import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'ml-fundamentals.first-sklearn-model.1',
    prompt: 'Which of these is a **hyperparameter** rather than a parameter?',
    options: [
      'The split thresholds a decision tree chooses',
      'The weights of a linear regression model',
      'The maximum depth of a decision tree',
      'The intercept $b$ of a fitted straight line',
    ],
    answer: 2,
    explanation:
      'A hyperparameter is chosen by you before training, and `max_depth` is set when you create the tree. Weights, intercepts and split thresholds are all found by `fit()` from the training data, so they are parameters. The split thresholds are the tempting trap: they look like settings, but the tree learns them.',
    difficulty: 'beginner',
  },
  {
    id: 'ml-fundamentals.first-sklearn-model.2',
    prompt: 'For a `LinearRegression` model, what does `model.fit(X_train, y_train)` do?',
    options: [
      'Stores the predictions for `X_train` so that `predict` can look them up later',
      'Tries several hyperparameter values and keeps the one with the best score on `X_train`',
      'Finds the `coef_` and `intercept_` that minimise the squared error on training data',
      'Measures the accuracy of the model on the training data and returns that number',
    ],
    answer: 2,
    explanation:
      'Fitting is training: it searches for the parameter values (here the weights and intercept) that make the loss on the training data as small as possible. It does not tune hyperparameters; you choose those, usually by comparing scores on validation data. Measuring performance is the job of `score`, and `fit` returns the model itself.',
    difficulty: 'beginner',
  },
  {
    id: 'ml-fundamentals.first-sklearn-model.3',
    prompt: 'What does this code print?',
    code: 'from sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit([[0], [1], [2]], [-1, 2, 5])\nprint(model.predict([[4]]))',
    options: ['`[11.]`', '`[12.]`', '`[13.]`', 'A `ValueError`, because the feature list must be one-dimensional'],
    answer: 0,
    explanation:
      'The points $(0, -1)$, $(1, 2)$, $(2, 5)$ lie exactly on $y = 3x - 1$, so `fit` learns `coef_` $= 3$ and `intercept_` $= -1$. Then $3 \\times 4 - 1 = 11$, printed as the float array `[11.]`. Forgetting the intercept gives 12. The input is correctly 2-D (one row per sample), so there is no error; a 1-D list such as `[4]` is what would raise one.',
    difficulty: 'intermediate',
  },
  {
    id: 'ml-fundamentals.first-sklearn-model.4',
    prompt: 'You fit a `LinearRegression` and a `KNeighborsClassifier(n_neighbors=5)` on the same 1,000 training rows. What does each model keep after `fit`?',
    options: [
      'Linear regression keeps a weight and an intercept; k-NN keeps the training rows and labels',
      'Both keep only a few learned numbers; k-NN stores 5 weights, one for each neighbour',
      'Both keep a full copy of the training rows, because every model needs them to predict',
      'Linear regression keeps the training rows; k-NN keeps a learned boundary line and its slope',
    ],
    answer: 0,
    explanation:
      'A linear model compresses the data into its parameters: one weight per feature plus an intercept. k-NN does no fitting work beyond storing the data; at prediction time it searches those stored rows for the 5 nearest and lets them vote. The number 5 is a hyperparameter, not 5 learned weights.',
    difficulty: 'intermediate',
  },
  {
    id: 'ml-fundamentals.first-sklearn-model.5',
    prompt:
      'A school wants to predict whether each Sec 4 student will pass their national Maths exam (the O-level, or the SEC that replaces it), using their prelim exam mark, hours of revision per week and attendance rate. They train `DecisionTreeClassifier(max_depth=4)`. Which statement is correct?',
    options: [
      'Pass/fail is a feature, attendance is the label, and `max_depth` is a hyperparameter',
      'The prelim mark is the label, pass/fail is a feature, and `max_depth` is a hyperparameter',
      'The prelim mark is a feature, pass/fail is the label, and `max_depth` is a hyperparameter',
      'The prelim mark is a feature, pass/fail is a parameter, and `max_depth` is a parameter',
    ],
    answer: 2,
    explanation:
      'The label is the answer we want to predict (pass or fail), so this is classification. The prelim mark, revision hours and attendance are inputs we know in advance: features. `max_depth` is written in the brackets before training, so it is a hyperparameter. The prelim mark looks like an answer, but here it is an input.',
    difficulty: 'beginner',
  },
]

export default questions
