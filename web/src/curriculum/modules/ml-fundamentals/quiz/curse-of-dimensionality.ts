import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'ml-fundamentals.curse-of-dimensionality.1',
    prompt: 'Which statement best describes the **curse of dimensionality**?',
    options: [
      'Adding features makes data sparse and distances less useful, so far more data is needed',
      "Adding features always makes training slower, but it always improves the model's accuracy",
      'Arrays with more than two dimensions cannot be passed to scikit-learn models for training',
      'Adding features always makes every model too simple, so it underfits the training data',
    ],
    answer: 0,
    explanation:
      'The volume of the space grows exponentially with the number of features, so a fixed dataset becomes sparse, nearest and farthest points end up at similar distances, and models overfit. More features do not always improve accuracy, and the problem has nothing to do with NumPy array `ndim`.',
    difficulty: 'beginner',
  },
  {
    id: 'ml-fundamentals.curse-of-dimensionality.2',
    prompt:
      '1,000 data points are spread evenly over $d$ features, each between 0 and 1. A box around a new point covers **half** the range of every feature. With $d = 10$, about how many of the 1,000 points do you expect inside the box?',
    options: ['1', '500', '100', '50'],
    answer: 0,
    explanation:
      'The share of the space in the box is $0.5^{10} = \\tfrac{1}{1024}$, so you expect $1000 \\div 1024 \\approx 1$ point. 500 halves only once, forgetting that each of the 10 features halves the count again. 100 divides by 10 (as if the 10 features cut the count by a tenth just once), and 50 multiplies by one half and then by a tenth; neither multiplies ten halves together.',
    difficulty: 'intermediate',
  },
  {
    id: 'ml-fundamentals.curse-of-dimensionality.3',
    prompt: 'Why does k-nearest neighbours often work badly when every point has hundreds of features?',
    options: [
      'Distances to the nearest and farthest points become almost equal, so "nearest" means little',
      'Euclidean distance cannot be computed with more than three features, so k-NN has to switch metric',
      'k-NN must store one separate model per feature, so it runs out of memory with hundreds of features',
      'k-NN needs k to be larger than the number of features, so every prediction becomes a vote of the whole dataset',
    ],
    answer: 0,
    explanation:
      'Each feature adds a squared term to the distance; with many features the distances all become similar (nearest ÷ farthest approaches 1), so the chosen neighbours are hardly closer than random points. Euclidean distance works in any number of dimensions, and k has no link to the number of features.',
    difficulty: 'intermediate',
  },
  {
    id: 'ml-fundamentals.curse-of-dimensionality.4',
    prompt:
      'A lab has 40 patients and measures 5,000 genes for each. A logistic regression model scores 100% accuracy on the training patients but 55% on validation patients. What is the most sensible next step?',
    options: [
      'Cut the features (feature selection or PCA) and add strong regularisation such as L1',
      'Measure even more genes per patient so that the model has more information to learn from',
      'Train for more epochs so that the validation accuracy catches up with the training accuracy',
      'Report the 100% training accuracy, because the model has clearly learned the task perfectly',
    ],
    answer: 0,
    explanation:
      'With $p = 5000$ features and only $n = 40$ patients, the model has far more parameters than examples, so it can memorise the training set (100%) without learning anything general (55%). Reducing the features and regularising attacks the cause; adding genes makes $p \\gg n$ even worse, and more training only memorises harder.',
    difficulty: 'intermediate',
  },
  {
    id: 'ml-fundamentals.curse-of-dimensionality.5',
    prompt: 'Which output is this code most likely to print?',
    code: 'import numpy as np\nrng = np.random.default_rng(0)\nfor d in [2, 1000]:\n    X = rng.uniform(0, 1, (500, d))\n    q = rng.uniform(0, 1, d)\n    dist = np.sqrt(((X - q) ** 2).sum(axis=1))\n    print(d, round(dist.min() / dist.max(), 2))',
    options: ['`2 0.02` then `1000 0.91`', '`2 0.91` then `1000 0.02`', '`2 0.5` then `1000 0.5`', '`2 0.02` then `1000 0.0`'],
    answer: 0,
    explanation:
      'The code prints nearest ÷ farthest distance from a random query point. With 2 features some point lands very close, so the ratio is tiny (0.02); with 1,000 features distances concentrate and the nearest is almost as far as the farthest (0.91). The reverse order is the misconception that more dimensions make points easier to tell apart.',
    difficulty: 'intermediate',
  },
]

export default questions
