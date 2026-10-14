import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'classification.likelihood-and-entropy.1',
    prompt: 'A coin is flipped 12 times and lands heads 3 times. What is the maximum-likelihood estimate of the probability of heads?',
    options: ['$0.25$', '$0.5$', '$0.75$', '$1/3$'],
    answer: 0,
    explanation:
      'The likelihood $p^3(1-p)^9$ is largest at $\\hat{p} = \\frac{\\text{heads}}{\\text{flips}} = \\frac{3}{12} = 0.25$ (set the derivative of $3\\ln p + 9\\ln(1-p)$ to zero). $1/3$ divides heads by *tails*, and $0.5$ assumes the coin is fair, which ignores the data; MLE uses only the data.',
    difficulty: 'beginner',
  },
  {
    id: 'classification.likelihood-and-entropy.2',
    prompt: 'What is the entropy, in bits, of a distribution over three outcomes with probabilities $(\\tfrac12, \\tfrac14, \\tfrac14)$?',
    options: ['$1.5$ bits', '$\\log_2 3 \\approx 1.58$ bits', '$1$ bit', '$0.5$ bits'],
    answer: 0,
    explanation:
      'The surprises are $-\\log_2 \\tfrac12 = 1$, $-\\log_2 \\tfrac14 = 2$ and $2$ bits. Weighted by the probabilities: $\\tfrac12(1) + \\tfrac14(2) + \\tfrac14(2) = 1.5$ bits. $\\log_2 3$ would be the entropy if the three outcomes were *equally* likely (the maximum for three outcomes); 1 bit is a fair coin.',
    difficulty: 'intermediate',
  },
  {
    id: 'classification.likelihood-and-entropy.3',
    prompt: 'The true distribution $p$ has entropy $H(p) = 1.2$ nats. A model $q$ has cross-entropy $H(p, q) = 1.5$ nats against it. What is $\\mathrm{KL}(p\\,\\|\\,q)$?',
    options: ['$0.3$ nats', '$2.7$ nats', '$1.25$ nats', '$-0.3$ nats'],
    answer: 0,
    explanation:
      'Cross-entropy = entropy + KL, so $\\mathrm{KL}(p\\,\\|\\,q) = H(p, q) - H(p) = 1.5 - 1.2 = 0.3$ nats: the extra average surprise caused by predicting with $q$. KL is never negative, so $-0.3$ is impossible; adding (2.7) or dividing (1.25) the two quantities has no meaning here.',
    difficulty: 'beginner',
  },
  {
    id: 'classification.likelihood-and-entropy.4',
    prompt: 'Why do we usually maximise the log-likelihood instead of the likelihood itself?',
    options: [
      'The log turns a product of many small probabilities into a sum, which avoids underflow, and it has the same maximiser',
      'The log-likelihood has a different maximiser from the likelihood, and that maximiser generalises better to new data',
      'The likelihood can be negative for some parameters, and taking the log makes it positive so that it can be maximised',
      'The log makes the likelihood a linear function of the parameters, so the best parameters can be found with one formula',
    ],
    answer: 0,
    explanation:
      'A likelihood is a product of probabilities, which underflows to 0 for large datasets; $\\ln$ turns it into a sum of log-probabilities. Because $\\ln$ is increasing, the parameter with the largest likelihood also has the largest log-likelihood, so the answer is unchanged. Likelihoods are never negative, and the log-likelihood is generally not linear in the parameters.',
    difficulty: 'intermediate',
  },
  {
    id: 'classification.likelihood-and-entropy.5',
    prompt:
      'A regression model assumes that each target equals the model\'s prediction plus Gaussian (bell-shaped) noise with a fixed variance. Maximising the likelihood of the training data is then the same as minimising which loss?',
    options: ['Mean squared error', 'Mean absolute error', 'Binary cross-entropy', 'Hinge loss'],
    answer: 0,
    explanation:
      'The Gaussian likelihood of one target is proportional to $e^{-(y - \\hat{y})^2 / (2\\sigma^2)}$, so its negative log is $\\frac{(y - \\hat{y})^2}{2\\sigma^2}$ plus a constant. Summing over examples, maximum likelihood = minimum squared error. Mean absolute error corresponds to Laplace noise, and binary cross-entropy to a yes/no (Bernoulli) output.',
    difficulty: 'intermediate',
  },
]

export default questions
