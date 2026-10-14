import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'classification.knn-and-naive-bayes.1',
    prompt:
      'A k-NN classifier with $k = 1$ scores 100% on its training data but only 79% on new data. Which change is most likely to raise its accuracy on new data?',
    options: [
      'Raise $k$ to around 9, so that one unusual training point can no longer decide a prediction on its own',
      'Set $k$ equal to the number of training points, so that every stored example gets a vote',
      'Keep $k = 1$ but train for more epochs, so that the neighbours are learnt more precisely',
      'Add many more features to each point, so that the distances between points become more precise',
    ],
    answer: 0,
    explanation:
      'With $k = 1$ every training point is its own nearest neighbour, so training accuracy is always 100%, and each noisy point grows an island around itself: high variance, overfitting. A moderate $k$ averages the vote and smooths those islands away. Making $k$ equal to the whole training set predicts the majority class everywhere (underfitting), k-NN has no epochs because it does not train, and extra features usually hurt k-NN (the curse of dimensionality).',
    difficulty: 'beginner',
  },
  {
    id: 'classification.knn-and-naive-bayes.2',
    prompt:
      'A k-NN model predicts whether an HDB flat sells within a month from two raw features: asking price in dollars (about 300,000 to 1,500,000) and floor level (1 to 40). What is the main problem, and the usual fix?',
    options: [
      'Price differences are thousands of times larger, so distance is decided almost only by price; standardise both features first',
      'Floor level has fewer distinct values, so it dominates the distance; drop floor level and keep only the price',
      'k-NN can only compare categories, not numbers; convert both features into a few price bands and floor bands first',
      'There is no problem: k-NN learns a weight for each feature during training, so it rescales the features automatically',
    ],
    answer: 0,
    explanation:
      'Distance adds up raw differences. Two flats 50,000 dollars apart differ by 50,000 in price but by at most 39 in floor level, so floor level hardly counts. Standardising each feature, $z = (x - \\mu)/\\sigma$, puts both on a comparable scale. k-NN has no weights to learn: it uses the numbers exactly as given, which is why scaling matters so much for it.',
    difficulty: 'beginner',
  },
  {
    id: 'classification.knn-and-naive-bayes.3',
    prompt:
      'A Naive Bayes spam filter has $P(\\text{spam}) = 0.25$ and $P(\\text{normal}) = 0.75$. For the words "deal" and "today": $P(\\text{deal} \\mid \\text{spam}) = 0.4$, $P(\\text{today} \\mid \\text{spam}) = 0.2$, $P(\\text{deal} \\mid \\text{normal}) = 0.1$ and $P(\\text{today} \\mid \\text{normal}) = 0.3$. Which class does it choose for the message "deal today", and with what scores?',
    options: [
      'Normal, with scores 0.0225 for normal and 0.02 for spam',
      'Spam, with scores 0.08 for spam and 0.03 for normal',
      'Spam, with scores 0.6 for spam and 0.4 for normal',
      'Normal, with scores 0.75 for normal and 0.25 for spam',
    ],
    answer: 0,
    explanation:
      'Score = prior × product of likelihoods. Spam: $0.25 \\times 0.4 \\times 0.2 = 0.02$. Normal: $0.75 \\times 0.1 \\times 0.3 = 0.0225$, which is larger, so normal wins (with $P(\\text{spam} \\mid \\text{message}) = 0.02/0.0425 \\approx 0.47$). Forgetting the priors gives $0.08$ against $0.03$ and the wrong class; adding the likelihoods (0.6 against 0.4) is not how independent probabilities combine.',
    difficulty: 'intermediate',
  },
  {
    id: 'classification.knn-and-naive-bayes.4',
    prompt:
      'In the training messages of the class "sports", the word "match" appears 3 times out of 40 words in total. The vocabulary has 10 different words. With Laplace (add-one) smoothing, what is $P(\\text{match} \\mid \\text{sports})$?',
    options: ['$4/50$', '$3/40$', '$4/41$', '$4/40$'],
    answer: 0,
    explanation:
      'Laplace smoothing adds 1 to every word count and the vocabulary size $|V| = 10$ to the total: $\\frac{3 + 1}{40 + 10} = \\frac{4}{50} = 0.08$. The denominator grows by 10, not by 1, because each of the 10 words received one extra count; only then do the 10 probabilities still add up to 1. $\\frac{3}{40}$ is the unsmoothed estimate.',
    difficulty: 'intermediate',
  },
  {
    id: 'classification.knn-and-naive-bayes.5',
    prompt: 'What exactly is "naive" about Naive Bayes?',
    options: [
      'It treats the features as independent of each other once the class is known: $P(x_1, x_2 \\mid c) = P(x_1 \\mid c)\\,P(x_2 \\mid c)$',
      'It treats every class as equally likely before seeing any features, so the prior $P(c)$ can always be left out',
      'It treats the features as independent of the class itself, so that $P(x_1 \\mid c) = P(x_1)$ for every class $c$',
      'It treats the features as mutually exclusive, so that at most one of the words can appear in any one message',
    ],
    answer: 0,
    explanation:
      'The naive assumption is conditional independence given the class, which turns one impossible-to-count joint probability into a product of simple one-feature probabilities. Naive Bayes does use the prior $P(c)$. If features were independent of the class they would carry no information at all, and "mutually exclusive" describes events that cannot happen together, which is a different idea from independence.',
    difficulty: 'beginner',
  },
]

export default questions
