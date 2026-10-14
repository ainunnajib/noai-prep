import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'ai-first-look.classify-with-boundaries.1',
    prompt: 'Which of these is a **classification** task?',
    options: [
      'Predicting whether a durian is ripe or unripe from its smell and weight',
      'Predicting the resale price of an HDB flat from its floor area',
      'Predicting how many minutes late the next bus will arrive',
      "Predicting a student's exam mark out of 100 from their hours of revision",
    ],
    answer: 0,
    explanation:
      'Classification predicts a category; "ripe" and "unripe" are two classes with nothing in between. A price, a number of minutes and a mark are all numbers on a scale, so predicting them is regression, even when the numbers are whole numbers like a mark out of 100.',
    difficulty: 'beginner',
  },
  {
    id: 'ai-first-look.classify-with-boundaries.2',
    prompt:
      'A new photo is compared with a labelled training set. Its five nearest training photos, sorted by distance, are: 0.5 (cat), 0.9 (dog), 1.2 (dog), 1.6 (cat), 2.0 (cat). What does kNN predict with $k = 3$ and with $k = 5$?',
    options: ['$k = 3$: dog; $k = 5$: cat', '$k = 3$: cat; $k = 5$: cat', '$k = 3$: dog; $k = 5$: dog', '$k = 3$: cat; $k = 5$: dog'],
    answer: 0,
    explanation:
      'With $k = 3$ the neighbours are cat, dog, dog: dog wins 2 to 1. With $k = 5$ we add two more cats: cat wins 3 to 2. Picking "cat" for $k = 3$ comes from looking only at the single nearest photo, which is what $k = 1$ would do.',
    difficulty: 'beginner',
  },
  {
    id: 'ai-first-look.classify-with-boundaries.3',
    prompt: 'Compared with a kNN classifier that uses $k = 15$, the same classifier with $k = 1$:',
    options: [
      'follows every training point, giving a jagged boundary and 100% training accuracy',
      'averages over more neighbours, giving a smoother boundary that ignores odd points',
      'always scores higher on new data, because it uses the single closest example',
      'needs a much longer training phase before it is able to make any predictions',
    ],
    answer: 0,
    explanation:
      'With $k = 1$ every prediction copies the single nearest training point, so the boundary bends around every point, including unusual ones, and each training point is classified by itself (100% training accuracy). That jaggedness usually makes it worse, not better, on new data. Smoothing comes from a larger $k$, and kNN has no training phase at all: it just stores the examples.',
    difficulty: 'beginner',
  },
  {
    id: 'ai-first-look.classify-with-boundaries.4',
    prompt:
      'Two models are trained on the same data. Model P: training accuracy 99%, test accuracy 70%. Model Q: training accuracy 88%, test accuracy 86%. Which statement is correct?',
    options: [
      'P is overfitting; Q generalises better and is the one to use',
      'P is the one to use, because it has the highest accuracy of all',
      'Q is underfitting, because its training accuracy is lower than P’s',
      'P is underfitting, because its test accuracy is the lowest number',
    ],
    answer: 0,
    explanation:
      'P is almost perfect on data it has seen but much worse on new data: a 29-point gap, the signature of overfitting (memorising). Q does almost as well on new data as on training data, and 86% on new data beats 70%. Underfitting would show low accuracy on the training data too, which is not the case for either model.',
    difficulty: 'intermediate',
  },
  {
    id: 'ai-first-look.classify-with-boundaries.5',
    prompt: 'Why does a 1-nearest-neighbour classifier always score 100% on its own training data (when no two training points share the same spot)?',
    options: [
      "Each training point's nearest neighbour is itself, at distance 0, so it copies its own label",
      'Its decision boundary is a straight line that is placed to fit the training data exactly',
      'It is trained with gradient descent until the loss on the training data reaches zero',
      'It ignores the unusual training points, so only the easy, typical points are counted',
    ],
    answer: 0,
    explanation:
      'When you ask 1-NN about a training point, the closest stored point is that very point (distance 0), so it simply returns the stored label. That is pure memorising, which is why its training accuracy says nothing about how well it generalises. kNN has no straight boundary and no gradient descent; and far from ignoring unusual points, 1-NN builds little islands around them.',
    difficulty: 'intermediate',
  },
]

export default questions
