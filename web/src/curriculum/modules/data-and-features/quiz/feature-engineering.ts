import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'data-and-features.feature-engineering.1',
    prompt:
      'Points of class A lie at $|x| < 1$ and points of class B at $|x| > 2$ on a number line. Logistic regression on $x$ alone fails, but after adding the column $x^2$ it separates them perfectly. Why?',
    options: [
      'The model is still linear, but one straight cut on $x^2$ is the same as two cuts on the original $x$',
      'Squaring removes the negative values, which logistic regression cannot handle as inputs',
      'Adding any second feature makes a linear model non-linear, so $2x$ would have worked too',
      'Squaring makes the values larger, so gradient descent takes bigger steps and converges',
    ],
    answer: 0,
    explanation:
      'The model is still linear in its features: it learns a rule like $x^2 > 2.5$, a straight cut in the new feature, which means $x < -1.58$ or $x > 1.58$ on the original line. Negative inputs are fine for logistic regression, and a feature like $2x$ only stretches the line, so class B would still sit on both sides of class A.',
    difficulty: 'beginner',
  },
  {
    id: 'data-and-features.feature-engineering.2',
    prompt: 'What does this code print?',
    code: 'import pandas as pd\ns = pd.Series([4, 8, 6, 10, 5])\nprint(s.rolling(3).mean().tolist())',
    options: ['`[nan, nan, 6.0, 8.0, 7.0]`', '`[4.0, 6.0, 6.0, 8.0, 7.0]`', '`[nan, 6.0, 8.0, 7.0, nan]`', '`[6.0, 8.0, 7.0, nan, nan]`'],
    answer: 0,
    explanation:
      'A pandas rolling window ends at the current row, and the first $k - 1 = 2$ rows have no full window, so they are `NaN`. The three full windows are $(4+8+6)/3 = 6$, $(8+6+10)/3 = 8$ and $(6+10+5)/3 = 7$. The version with values in front uses partial windows (`min_periods=1`); the one with `NaN` at both ends is a centred window.',
    difficulty: 'beginner',
  },
  {
    id: 'data-and-features.feature-engineering.3',
    prompt: 'How many columns does `PolynomialFeatures(degree=2)` (default settings, so the bias column is included) produce from 3 input features?',
    options: ['10', '9', '13', '7'],
    answer: 0,
    explanation:
      'Count them: the bias $1$, the 3 originals, the 3 squares $x_1^2, x_2^2, x_3^2$ and the 3 products $x_1x_2, x_1x_3, x_2x_3$, giving $1 + 3 + 3 + 3 = 10 = \\binom{5}{2}$. Forgetting the bias gives 9; forgetting the products gives 7; and counting $x_1x_2$ and $x_2x_1$ as different columns (all 9 ordered products $x_ix_j$) gives $1 + 3 + 9 = 13$.',
    difficulty: 'intermediate',
  },
  {
    id: 'data-and-features.feature-engineering.4',
    prompt:
      'You are predicting the number of taxi bookings in each hour, and one input column is the booking timestamp. Which feature engineering is most useful?',
    options: [
      'Extract the hour of day, the day of week and an `is_weekend` flag',
      'Convert the timestamp to seconds since 1970 and use that one number',
      'One-hot encode every distinct timestamp value in the data',
      'Drop the column, since a timestamp is an ID rather than a measurement',
    ],
    answer: 0,
    explanation:
      'Demand repeats every day and every week, and the date parts expose those cycles (the hour can also go on a circle with sine and cosine). Seconds since 1970 just grow forever, so the model cannot see that every 8 a.m. is alike. One-hot encoding gives each timestamp its own column, used once and never again.',
    difficulty: 'beginner',
  },
  {
    id: 'data-and-features.feature-engineering.5',
    prompt: 'Which statement about using PCA as a feature-engineering step is correct?',
    options: [
      'It makes a few new features, each a weighted sum of all the columns, ignoring the labels',
      'It keeps the $k$ original columns that are most strongly correlated with the label',
      'It adds squared and product columns so that a linear model can fit curved boundaries',
      'It uses the labels to find the directions that best separate the classes from each other',
    ],
    answer: 0,
    explanation:
      'PCA is unsupervised dimensionality reduction: its new features are weighted combinations of all the original columns, chosen to keep as much variance as possible, and labels play no part. Keeping the columns most correlated with the label is supervised feature selection, and adding powers and products is what `PolynomialFeatures` does.',
    difficulty: 'intermediate',
  },
]

export default questions
