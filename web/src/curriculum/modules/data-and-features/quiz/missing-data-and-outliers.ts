import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'data-and-features.missing-data-and-outliers.1',
    prompt:
      'A dataset has 10 features. Each value is missing with probability 0.1, independently of all the others. Roughly what fraction of the rows survive `df.dropna()`?',
    options: ['About 35%', 'About 90%', 'About 10%', 'Almost 0%, since $10 \\times 10\\% = 100\\%$ of rows are lost'],
    answer: 0,
    explanation:
      'A row survives only if all 10 of its values are present: $0.9^{10}$. By repeated squaring, $0.9^2 = 0.81$, $0.9^4 \\approx 0.66$, $0.9^5 \\approx 0.59$ and $0.9^{10} \\approx 0.59^2 \\approx 0.35$. 90% is the answer for a single feature; adding the losses ($10 \\times 10\\%$) is wrong because the probabilities multiply.',
    difficulty: 'intermediate',
  },
  {
    id: 'data-and-features.missing-data-and-outliers.2',
    prompt:
      'A column of house prices is strongly right-skewed (a few mansions cost ten times the typical price), and 20% of its values are missing. The blanks come mostly from one agency that rarely lists cheap flats. Which treatment is most appropriate before training a linear regression?',
    options: [
      'Fill the blanks with the median and add an `is_missing` indicator column',
      'Fill the blanks with the mean, because that keeps the column’s average unchanged',
      'Fill the blanks with 0, because zero adds no information to a linear model',
      'Forward-fill each blank from the previous row of the table',
    ],
    answer: 0,
    explanation:
      'The median is not dragged up by the mansions, and the indicator lets the model learn that “missing” is linked to the agency and hence to price. The mean does keep the average, but here that average is inflated by a few extreme values. Zero is a real (and absurd) price, and the previous row is an unrelated house, not a neighbour in time.',
    difficulty: 'intermediate',
  },
  {
    id: 'data-and-features.missing-data-and-outliers.3',
    prompt:
      'A wearable heart-rate monitor records one reading per second and occasionally drops a few readings. A model must raise an alarm in real time, using each new reading as it arrives. How should dropped readings be filled?',
    options: [
      'Forward-fill: repeat the last reading that arrived',
      'Linear interpolation between the readings before and after the gap',
      'The mean heart rate of the whole recording',
      'Drop every second that has a missing reading, together with the whole recording',
    ],
    answer: 0,
    explanation:
      'Neighbouring readings in time are the best guide, and in real time only the past is available, so forward-fill is the right choice. Interpolation is excellent for cleaning stored data but needs the reading after the gap, which has not arrived yet. The global mean ignores time and needs the future too.',
    difficulty: 'intermediate',
  },
  {
    id: 'data-and-features.missing-data-and-outliers.4',
    prompt: 'A feature has first quartile $Q_1 = 20$ and third quartile $Q_3 = 32$. Which of these values does the IQR rule flag as an outlier?',
    options: ['55', '48', '3', '40'],
    answer: 0,
    explanation:
      '$\\text{IQR} = 32 - 20 = 12$ and $1.5 \\times 12 = 18$, so the fences are $20 - 18 = 2$ and $32 + 18 = 50$. Only 55 lies outside. Using $1 \\times \\text{IQR}$ by mistake would put the upper fence at 44 and wrongly flag 48; 3 is above the lower fence of 2.',
    difficulty: 'beginner',
  },
  {
    id: 'data-and-features.missing-data-and-outliers.5',
    prompt: 'What is wrong with this preprocessing code?',
    code: 'from sklearn.impute import SimpleImputer\nfrom sklearn.model_selection import train_test_split\n\nimp = SimpleImputer(strategy="mean")\nX_all = imp.fit_transform(X_all)\nX_train, X_test, y_train, y_test = train_test_split(X_all, y)',
    options: [
      'The imputer learns the column means from the test rows too, leaking test data',
      'Mean imputation is wrong here; `SimpleImputer` only works with the median',
      '`fit_transform` fails on NaN values, so the imputer must come after the split',
      'Imputation must happen after training the model, so the test set stays untouched',
    ],
    answer: 0,
    explanation:
      'The imputer learns each column’s mean from all rows, including the future test rows, before the split. Split first, call `imp.fit(X_train)` (or `fit_transform`) on the training data, and only `imp.transform(X_test)` on the test data. The median is sometimes better, but using the mean is a choice, not the bug here; and `SimpleImputer` exists precisely to handle NaN.',
    difficulty: 'intermediate',
  },
]

export default questions
