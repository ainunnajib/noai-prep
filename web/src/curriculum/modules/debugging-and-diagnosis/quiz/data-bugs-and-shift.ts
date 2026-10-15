import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'debugging-and-diagnosis.data-bugs-and-shift.1',
    prompt:
      'A classifier for 20 balanced classes reaches a training loss of 0.02. Its validation accuracy is 5.1% and does not improve over 30 epochs. What does this most strongly suggest?',
    options: [
      'Validation inputs and labels are out of step: look for a pipeline bug',
      'The model is overfitting: add dropout and stop training at an earlier epoch',
      'The model is underfitting: add more layers so it can separate 20 classes',
      'The learning rate is too low: raise it so that validation accuracy can catch up',
    ],
    answer: 0,
    explanation:
      'Chance level for 20 balanced classes is $1/20 = 5\\%$, so 5.1% is random guessing, while the training loss shows the model learned its training data very well. That combination points to a broken link between validation inputs and labels. Overfitting usually leaves validation accuracy well above chance, and an underfitting or slow model would not reach a training loss of 0.02.',
    difficulty: 'intermediate',
  },
  {
    id: 'debugging-and-diagnosis.data-bugs-and-shift.2',
    prompt: 'What does this code print?',
    code: 'from sklearn.preprocessing import LabelEncoder\ny_train = LabelEncoder().fit_transform(["cat", "dog", "fox"])\ny_val = LabelEncoder().fit_transform(["dog", "fox", "dog"])\nprint(y_train, y_val)',
    options: ['`[0 1 2] [0 1 0]`', '`[0 1 2] [1 2 1]`', '`[1 2 3] [2 3 2]`', '`[0 1 2] [1 0 1]`'],
    answer: 0,
    explanation:
      '`LabelEncoder` numbers the classes it was fitted on in alphabetical order. The first encoder sees cat, dog, fox and gives 0, 1, 2. The second sees only dog and fox, so dog becomes 0 and fox 1: `[0 1 0]`. In training, "dog" is 1, so every validation label is now wrong. `[1 2 1]` is what you get by fitting one encoder on the training labels and reusing it, which is the fix.',
    difficulty: 'intermediate',
  },
  {
    id: 'debugging-and-diagnosis.data-bugs-and-shift.3',
    prompt:
      'A loan model was trained in 2023. In 2024, applicants have the same mix of incomes, ages and jobs as before, but after an economic downturn people with the same profile are less likely to repay. What is this?',
    options: [
      'Concept drift: $P(y \\mid x)$ has changed while $P(x)$ stayed the same',
      'Covariate shift: $P(x)$ has changed while $P(y \\mid x)$ stayed the same',
      'Data leakage: information from the test set has entered the training set',
      'Overfitting: the model memorised the noise in its 2023 training data',
    ],
    answer: 0,
    explanation:
      'The inputs look the same (same mix of incomes, ages and jobs), so $P(x)$ has not changed. What changed is the rule linking an applicant to the outcome: the same profile now has a different chance of repaying, which is a change in $P(y \\mid x)$, concept drift. Covariate shift would be a different mix of applicants with the same rule.',
    difficulty: 'intermediate',
  },
  {
    id: 'debugging-and-diagnosis.data-bugs-and-shift.4',
    prompt:
      'An image classifier for 10 classes was trained on pixel values divided by 255 and scored 94% on the validation set. In the phone app, accuracy is about 10%, and nearly every photo gets the same label. Validation and app photos look alike. What is the most likely cause?',
    options: [
      'The app feeds raw 0–255 pixels: a train/serve preprocessing mismatch',
      'Concept drift: what the classes look like changed after deployment',
      'Overfitting: the model memorised the validation photos during training',
      'Too few epochs: the model needed more training to generalise',
    ],
    answer: 0,
    explanation:
      '10% is chance for 10 classes, and "the same label for nearly everything" is the fingerprint of inputs on a completely different scale: pixels 255 times larger than anything seen in training push every image into one class. The photos look alike, so it is not drift; a model never trains on its validation set, and a 94% validation score rules out a model that simply needed more training. The fix is to run exactly the same preprocessing code in the app.',
    difficulty: 'intermediate',
  },
  {
    id: 'debugging-and-diagnosis.data-bugs-and-shift.5',
    prompt:
      'You have daily sales data from January 2022 to December 2024 and will forecast sales in 2025. Customer habits change over time. Which validation scheme gives the most honest estimate of 2025 performance?',
    options: [
      'Train on 2022–2023 and validate on 2024, then retrain on all three years',
      'Shuffle all the days, then use a random 80/20 train/validation split',
      'Use 5-fold cross-validation with shuffling over all three years of days',
      'Train on 2023–2024 and validate on 2022, the oldest and most different year',
    ],
    answer: 0,
    explanation:
      'The model will always predict the future from the past, so validation should do the same: train on earlier data and validate on the most recent period. Shuffled splits (random or k-fold) let days from late 2024 into training while validating on earlier days, which hides drift and gives an optimistic score. Validating on 2022 checks how well the model predicts the past, which is not the question.',
    difficulty: 'intermediate',
  },
]

export default questions
