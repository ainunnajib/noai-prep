import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'prelim-speed-toolkit.drill-calculus-probability.1',
    prompt: 'Why do deep networks with sigmoid activations in every hidden layer tend to suffer from vanishing gradients?',
    options: [
      'The sigmoid’s slope $\\sigma(1 - \\sigma)$ never exceeds 0.25, and backpropagation multiplies one such factor per layer, so the product shrinks',
      'The sigmoid’s outputs lie between 0 and 1, so the loss can never be larger than 1 and there is little error to pass back',
      'The sigmoid has no derivative at exactly 0, so the gradient is undefined whenever an input lands on that one point',
      'The sigmoid needs an exponential, which is slow to compute, so the gradient takes too long to reach the early layers',
    ],
    answer: 0,
    explanation:
      '$\\sigma\'(x) = \\sigma(x)(1 - \\sigma(x))$ peaks at $0.5 \\times 0.5 = 0.25$ when $x = 0$. The chain rule multiplies one such factor per layer, so after 10 layers the gradient has been scaled by at most $0.25^{10}$, about a millionth. Having no derivative at 0 is ReLU’s quirk, not the sigmoid’s; computing time does not shrink a gradient; and hidden outputs between 0 and 1 put no cap on the loss.',
    difficulty: 'intermediate',
  },
  {
    id: 'prelim-speed-toolkit.drill-calculus-probability.2',
    prompt:
      'A condition affects 10% of people. A test detects 90% of people who have it, and wrongly flags 10% of people who do not. Someone tests positive. What is the probability that they have the condition?',
    options: ['50%', '90%', '81%', '10%'],
    answer: 0,
    explanation:
      'Think of 100 people: 10 are ill and 9 of them test positive; 90 are healthy and 9 of them test positive too. So 9 of the 18 positives are ill: $\\frac{9}{18} = 50\\%$. 90% is the test’s detection rate, $P(\\text{positive} \\mid \\text{ill})$, the reverse of what was asked.',
    difficulty: 'intermediate',
  },
  {
    id: 'prelim-speed-toolkit.drill-calculus-probability.3',
    prompt: 'Exam marks have mean 60 and standard deviation 8. What is the z-score of a mark of 48?',
    options: ['$-1.5$', '$1.5$', '$-12$', '$-0.67$'],
    answer: 0,
    explanation:
      '$z = \\frac{x - \\mu}{\\sigma} = \\frac{48 - 60}{8} = \\frac{-12}{8} = -1.5$: one and a half standard deviations below the mean. $-12$ forgets to divide by $\\sigma$, $1.5$ drops the sign, and $-0.67$ divides the wrong way round ($8 / -12$).',
    difficulty: 'beginner',
  },
  {
    id: 'prelim-speed-toolkit.drill-calculus-probability.4',
    prompt: 'A spam filter gives TP = 30, FP = 10, FN = 20 and TN = 40. What is its F1 score?',
    options: ['$\\frac{2}{3}$', '$\\frac{27}{40}$', '$\\frac{7}{10}$', '$\\frac{3}{4}$'],
    answer: 0,
    explanation:
      'By counts, $F_1 = \\frac{2TP}{2TP + FP + FN} = \\frac{60}{60 + 10 + 20} = \\frac{60}{90} = \\frac23$. Precision is $\\frac{30}{40} = \\frac34$ and recall $\\frac{30}{50} = \\frac35$; their ordinary average, $\\frac{27}{40} = 0.675$, is the classic trap. $\\frac{7}{10}$ is the accuracy, $\\frac{30 + 40}{100}$, and $\\frac34$ is the precision on its own.',
    difficulty: 'intermediate',
  },
  {
    id: 'prelim-speed-toolkit.drill-calculus-probability.5',
    prompt:
      'A newly initialised 10-class classifier outputs probability 0.1 for every class. Roughly what cross-entropy loss (natural log) should its first training batch report?',
    options: ['About 2.30', 'About 0.10', 'About 1.00', 'About 3.32'],
    answer: 0,
    explanation:
      'The loss is $-\\ln(\\text{probability of the true class}) = -\\ln 0.1 = \\ln 10 \\approx 2.30$. 1.00 would be $\\log_{10} 10$ and 3.32 is $\\log_2 10$, the same quantity measured with a different base; 0.10 is the probability itself, not its log.',
    difficulty: 'intermediate',
  },
]

export default questions
