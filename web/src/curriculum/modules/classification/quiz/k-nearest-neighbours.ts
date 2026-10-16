import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'classification.k-nearest-neighbours.1',
    prompt:
      'A k-NN classifier with $k = 1$ scores 100% on its training data but only 79% on new data. Which change is most likely to raise its accuracy on new data?',
    options: [
      'Raise $k$ to about 9, so one unusual training point can no longer decide a prediction alone',
      'Set $k$ equal to the number of training points, so that every stored example gets a vote',
      'Keep $k = 1$ but train for more epochs, so that the neighbours are learnt more precisely',
      'Add many more features, even weakly related ones, so that the distances between points become more precise',
    ],
    answer: 0,
    explanation:
      'With $k = 1$ every training point is its own nearest neighbour, so training accuracy is 100% (unless identical points carry different labels), and each noisy point grows an island around itself: high variance, overfitting. A moderate $k$ averages the vote and smooths those islands away. Making $k$ equal to the whole training set predicts the majority class everywhere (underfitting), k-NN has no epochs because it does not train, and piling on weakly related features hurts k-NN (the curse of dimensionality).',
    difficulty: 'beginner',
  },
  {
    id: 'classification.k-nearest-neighbours.2',
    prompt:
      'A k-NN model predicts whether an HDB flat sells within a month from two raw features: asking price in dollars (about 300,000 to 1,500,000) and floor level (1 to 40). What is the main problem, and the usual fix?',
    options: [
      'Price gaps are thousands of times larger, so the distance depends almost only on price; standardise both features first',
      'Floor level has fewer distinct values, so it dominates the distance; drop floor level and keep just the price',
      'k-NN can only compare categories, not numbers; convert both features into a few price bands and floor bands first',
      'There is no problem: k-NN learns a weight for each feature during training, so it rescales the features automatically',
    ],
    answer: 0,
    explanation:
      'Distance adds up raw differences. Two flats 50,000 dollars apart differ by 50,000 in price but by at most 39 in floor level, so floor level hardly counts. Standardising each feature, $z = (x - \\mu)/\\sigma$, puts both on a comparable scale. k-NN has no weights to learn: it uses the numbers exactly as given, which is why scaling matters so much for it.',
    difficulty: 'beginner',
  },
  {
    id: 'classification.k-nearest-neighbours.3',
    prompt:
      'A query point has five training points at these distances: 1.0 (cat), 1.5 (dog), 2.0 (dog), 2.2 (cat) and 4.0 (cat). What do 3-NN and 5-NN predict?',
    options: [
      '3-NN predicts dog and 5-NN predicts cat',
      '3-NN predicts cat and 5-NN predicts cat',
      '3-NN predicts dog and 5-NN predicts dog',
      '3-NN predicts cat and 5-NN predicts dog',
    ],
    answer: 0,
    explanation:
      'The 3 nearest are at 1.0 (cat), 1.5 (dog) and 2.0 (dog): 2 dogs against 1 cat, so dog. With all 5 the vote is 3 cats (1.0, 2.2, 4.0) against 2 dogs, so cat. Changing $k$ changes who gets a vote, and here it flips the answer; the single nearest point alone (1-NN) would say cat.',
    difficulty: 'beginner',
  },
  {
    id: 'classification.k-nearest-neighbours.4',
    prompt:
      'A k-NN classifier stores 1,000,000 training examples with 50 features each. Compared with a logistic regression trained on the same data, which statement is true?',
    options: [
      'k-NN trains almost instantly, but each prediction measures the distance to all 1,000,000 stored examples',
      'k-NN trains slowly, because it has to fit one weight per feature, but each prediction is just one weighted sum',
      'k-NN keeps only the k nearest examples after training, so it needs less memory than logistic regression',
      'k-NN and logistic regression both make a prediction with one weighted sum of the same 50 feature values',
    ],
    answer: 0,
    explanation:
      'k-NN is a lazy learner: training only stores the data, and all the work happens at prediction time, about $n \\times d = 50$ million operations per query here, with the whole training set kept in memory. Logistic regression is the opposite: slow to fit its 51 numbers, then one weighted sum per prediction. k-NN has no weights, and it cannot know which examples will be nearest until a query arrives.',
    difficulty: 'beginner',
  },
  {
    id: 'classification.k-nearest-neighbours.5',
    prompt:
      'Two documents have word-count vectors $a = [3, 1]$ and $b = [6, 2]$. What is the cosine distance between them, and what does it tell you?',
    options: [
      '0: they point the same way, so they have the same mix of words',
      '3.16: the Euclidean gap between them, since b is twice as long',
      '0.5: b has twice as many words, so they are half as alike',
      '1: they share no words, so they are as far apart as possible',
    ],
    answer: 0,
    explanation:
      '$b = 2a$, so the angle between them is 0: $\\cos = \\frac{3 \\times 6 + 1 \\times 2}{\\sqrt{10}\\,\\sqrt{40}} = \\frac{20}{20} = 1$ and the cosine distance is $1 - 1 = 0$. Cosine ignores length, which is why it suits text: a longer document with the same mix of words counts as identical. $\\sqrt{3^2 + 1^2} \\approx 3.16$ is the Euclidean distance, which does see the length.',
    difficulty: 'intermediate',
  },
]

export default questions
