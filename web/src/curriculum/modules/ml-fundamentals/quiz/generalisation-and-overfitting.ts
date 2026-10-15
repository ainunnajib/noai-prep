import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'ml-fundamentals.generalisation-and-overfitting.1',
    prompt:
      'A team splits its data into a training set and a second set S. They train with 30 different learning rates, keep the one with the lowest error on S, and publish that error on S as their final result. What is the main problem?',
    options: [
      'Choosing the rate on S makes its error optimistic; an untouched test set is needed',
      'Nothing is wrong, because `fit()` never saw the examples in S during training',
      'They should have chosen the learning rate using the error on the training set instead',
      'Thirty learning rates are too few, so the chosen value is probably far from the best',
    ],
    answer: 0,
    explanation:
      'Choosing among 30 settings by their score on S partly picks the setting that got lucky on S, so S has become a validation set and its score is optimistically biased. A separate test set, used once, gives the honest number. "fit() never saw S" is the tempting trap: selection uses the data too. The training error would be even worse for choosing, because it rewards whichever setting fits the training data hardest, noise included, not the one that generalises best.',
    difficulty: 'intermediate',
  },
  {
    id: 'ml-fundamentals.generalisation-and-overfitting.2',
    prompt: 'As you raise the degree of a polynomial model, why does the **training** error keep going down even after the model starts to overfit?',
    options: [
      'A more flexible model can always fit its own training points at least as well',
      'Higher-degree models generalise better, so training and validation error both fall',
      'The noise in the training labels gets smaller when the model has more weights',
      'The validation set is used during training and pulls the training error down',
    ],
    answer: 0,
    explanation:
      'Every degree-$d$ polynomial is also a degree-$(d+1)$ polynomial (with the extra weight set to 0), so the best fit can only stay the same or improve on the training points. Past the sweet spot, the improvement comes from fitting noise, which is why the validation error rises at the same time instead of falling with it. The noise in the labels is fixed; the model cannot change it.',
    difficulty: 'beginner',
  },
  {
    id: 'ml-fundamentals.generalisation-and-overfitting.3',
    prompt:
      'At one input the true value is 5 and the label noise has variance $\\sigma^2 = 0.5$. Retrained on four different training sets, a model predicts $6, 8, 6, 8$. Using expected error $=$ bias² $+$ variance $+$ $\\sigma^2$ at this input, what is the expected squared error?',
    options: ['5.5', '5', '4.5', '3.5'],
    answer: 0,
    explanation:
      'The average prediction is $(6 + 8 + 6 + 8)/4 = 7$, so bias $= 7 - 5 = 2$ and bias² $= 4$. The predictions are each 1 away from 7, so variance $= (1 + 1 + 1 + 1)/4 = 1$. Total $= 4 + 1 + 0.5 = 5.5$. Forgetting the noise gives 5, forgetting the variance gives 4.5, and not squaring the bias gives 3.5.',
    difficulty: 'intermediate',
  },
  {
    id: 'ml-fundamentals.generalisation-and-overfitting.4',
    prompt:
      'A model\'s learning curves level off with training error 0.40 and validation error 0.42, almost flat for the last few thousand examples. The best possible error (the noise level) is about 0.05. Which action is most likely to help?',
    options: [
      'Use a more flexible model or add more informative features',
      'Collect ten times more training data of the same kind',
      'Increase the regularisation strength to simplify the model',
      'Stop training earlier, before the validation error rises',
    ],
    answer: 0,
    explanation:
      'Both errors are high, close together and far above the noise level: high bias (underfitting). The model cannot represent the pattern, so it needs more flexibility or better features. More data helps high variance, not high bias; the flat curves show extra data is not changing anything. More regularisation and earlier stopping make a model simpler, which makes underfitting worse.',
    difficulty: 'intermediate',
  },
  {
    id: 'ml-fundamentals.generalisation-and-overfitting.5',
    prompt: 'As model complexity increases from very simple to very complex, how do the training error and the validation error typically change?',
    options: [
      'Training error keeps falling; validation error falls at first, then rises',
      'Training error keeps falling; validation error keeps falling too',
      'Training error rises steadily; validation error keeps falling throughout',
      'Training error falls at first, then rises; validation error does the same',
    ],
    answer: 0,
    explanation:
      'Extra flexibility always lets the model fit its training data better, so training error keeps falling. Validation error falls while the model is still underfitting, reaches a minimum, then rises as the model starts fitting noise (overfitting). That U shape is why the best complexity is chosen with validation data, not training data.',
    difficulty: 'beginner',
  },
]

export default questions
