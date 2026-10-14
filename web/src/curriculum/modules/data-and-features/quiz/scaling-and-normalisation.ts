import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'data-and-features.scaling-and-normalisation.1',
    prompt: 'A feature has mean 60 and standard deviation 8. What is the standardised value (z-score) of 76?',
    options: ['2', '16', '9.5', '0.5'],
    answer: 0,
    explanation:
      '$z = (x - \\mu)/\\sigma = (76 - 60)/8 = 16/8 = 2$: the value is two standard deviations above the mean. 16 forgets to divide by $\\sigma$; 9.5 divides $x$ itself by 8 without subtracting the mean.',
    difficulty: 'beginner',
  },
  {
    id: 'data-and-features.scaling-and-normalisation.2',
    prompt: 'In the training set a feature ranges from 10 to 50. After min-max scaling, what does the value 20 become?',
    options: ['0.25', '0.4', '0.5', '0.2'],
    answer: 0,
    explanation:
      '$x\' = (x - x_{\\min})/(x_{\\max} - x_{\\min}) = (20 - 10)/(50 - 10) = 10/40 = 0.25$. Dividing by the maximum without subtracting the minimum gives $20/50 = 0.4$; dividing by the range without subtracting the minimum gives $20/40 = 0.5$.',
    difficulty: 'beginner',
  },
  {
    id: 'data-and-features.scaling-and-normalisation.3',
    prompt: 'For which of these models does standardising the features make the least difference?',
    options: ['A random forest', 'k-nearest neighbours', 'An SVM with an RBF kernel', 'Logistic regression trained by gradient descent'],
    answer: 0,
    explanation:
      'Each tree in a random forest splits on one feature at a time using a threshold, and scaling keeps the order of the values, so the same samples go left and right. k-NN and RBF SVMs measure distances, which large-unit features dominate, and gradient descent converges much faster on standardised features.',
    difficulty: 'beginner',
  },
  {
    id: 'data-and-features.scaling-and-normalisation.4',
    prompt: 'What is wrong with this code?',
    code: 'from sklearn.preprocessing import StandardScaler\n\nscaler = StandardScaler()\nX_train_s = scaler.fit_transform(X_train)\nX_test_s = scaler.fit_transform(X_test)',
    options: [
      'The test set is scaled with its own statistics, not the training mean and std',
      'The training set should use `transform`, because `fit_transform` leaks its data',
      '`StandardScaler` may only be applied to training data, so the test set stays raw',
      'The scaler must be fitted after the model is trained, using its predictions',
    ],
    answer: 0,
    explanation:
      'The second `fit_transform` refits the scaler on the test data, so the same raw value maps to different numbers in training and testing, and test statistics leak into the evaluation. The last line should be `X_test_s = scaler.transform(X_test)`. Using `fit_transform` on the training data is exactly right.',
    difficulty: 'intermediate',
  },
  {
    id: 'data-and-features.scaling-and-normalisation.5',
    prompt:
      'A k-NN classifier uses two features: age (18 to 80 years) and annual income (\\$20,000 to \\$500,000). Changing a customer’s age from 20 to 70 hardly ever changes the prediction. What is the most likely reason?',
    options: [
      'Income gaps are far bigger numbers than age gaps, so they dominate the distance',
      'k-NN automatically gives a lower weight to any feature measured in years',
      'Age is unrelated to the label, so k-NN learned to ignore it during training',
      'k is too small, so only one neighbour’s income decides every prediction',
    ],
    answer: 0,
    explanation:
      'A 50-year age gap adds $50^2 = 2500$ to the squared distance, while even a \\$5,000 income gap adds $5000^2 = 25{,}000{,}000$. The distance is essentially income alone, so age barely matters. Standardising both features gives age a fair say. k-NN does not learn feature weights at all, and changing $k$ does not fix the units problem.',
    difficulty: 'intermediate',
  },
]

export default questions
