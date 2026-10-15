import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'maths-foundations.logarithms.1',
    prompt: 'Which statement is correct?',
    options: [
      '$\\log_2 8 = 3$, because $2^3 = 8$',
      '$\\log_{10} 1000 = 4$, because 1000 has four digits',
      '$\\ln 1 = 1$, because any number to the power 1 is itself',
      '$\\log_2 8 = 4$, because $8 \\div 2 = 4$',
    ],
    answer: 0,
    explanation:
      'A log asks "which power?": $\\log_2 8 = 3$ because $2^3 = 8$. For the others: $\\log_{10} 1000 = 3$ because $10^3 = 1000$ (it counts the zeros, not the digits); $\\ln 1 = 0$ because $e^0 = 1$; and dividing 8 by the base is not a logarithm at all.',
    difficulty: 'beginner',
  },
  {
    id: 'maths-foundations.logarithms.2',
    prompt: 'Given $\\log_{10} 2 \\approx 0.301$, what is $\\log_{10} 8$?',
    options: ['$0.903$', '$0.602$', '$2.408$', '$0.027$'],
    answer: 0,
    explanation:
      '$8 = 2^3$, so the power rule gives $\\log_{10} 8 = 3 \\log_{10} 2 \\approx 3 \\times 0.301 = 0.903$. Multiplying by 8 instead of by the power 3 gives 2.408, doubling gives $0.602 = \\log_{10} 4$, and cubing the log ($0.301^3 \\approx 0.027$) mixes up "log of a power" with "power of a log".',
    difficulty: 'beginner',
  },
  {
    id: 'maths-foundations.logarithms.3',
    prompt: 'Why do machine-learning libraries add up log-probabilities instead of multiplying the probabilities of many independent examples?',
    options: [
      'Logs turn each probability into a number above 1, so the probabilities of different examples become easier to compare with one another',
      'Log-probabilities are always positive, so the summed loss can never become negative during training and the optimiser stays stable',
      'A product of thousands of probabilities underflows to 0, but the sum of their logs stays a normal size and always peaks at the same parameters',
      'Multiplying the probabilities of independent examples is mathematically wrong, so taking logs is needed to make the overall likelihood correct',
    ],
    answer: 2,
    explanation:
      'For 1,000 examples at probability 0.9, the product is $0.9^{1000} \\approx 1.7 \\times 10^{-46}$, which float32 stores as 0. The log turns it into a sum, $1000 \\ln 0.9 \\approx -105.4$, and because $\\ln$ is increasing the parameters that maximise one also maximise the other. Log-probabilities are actually negative or 0 (logs of numbers up to 1), and multiplying independent probabilities is correct; it is only numerically fragile.',
    difficulty: 'intermediate',
  },
  {
    id: 'maths-foundations.logarithms.4',
    prompt:
      'For the same test image, model A gives the correct class probability $0.5$ and model B gives it $0.25$. How does B\'s cross-entropy cost $-\\ln p$ compare with A\'s?',
    options: ['It is exactly half of A\'s', 'It is exactly 0.25 more than A\'s', 'It is exactly four times A\'s', 'It is exactly twice A\'s'],
    answer: 3,
    explanation:
      '$0.25 = 0.5^2$, so by the power rule $-\\ln 0.25 = 2 \\times (-\\ln 0.5) = 2 \\ln 2 \\approx 1.386$, twice A\'s $\\ln 2 \\approx 0.693$. A smaller probability for the truth means a bigger cost, not a smaller one, and squaring the probability doubles (not quadruples) its log.',
    difficulty: 'intermediate',
  },
  {
    id: 'maths-foundations.logarithms.5',
    prompt:
      'A freshly initialised classifier for 100 classes reports a cross-entropy loss of about $4.6$ on its very first batch. Using $\\ln 10 \\approx 2.303$, what should you conclude?',
    options: [
      'There is a bug: an untrained model\'s cross-entropy loss should start very close to 0',
      'There is a bug: the loss should start at $\\tfrac{1}{100} = 0.01$, the probability given to each class',
      'This is expected: guessing $\\tfrac{1}{100}$ for every class costs $\\ln 100 = 2 \\ln 10 \\approx 4.6$',
      'This is expected: cross-entropy always starts at $\\ln 2 \\approx 0.693$ times the number of layers',
    ],
    answer: 2,
    explanation:
      'An untrained model spreads its bets evenly, so the true class gets $p = \\tfrac{1}{100}$ and the cost is $-\\ln \\tfrac{1}{100} = \\ln 100 = 2 \\ln 10 \\approx 4.605$. A loss near 0 would mean confident correct answers, which an untrained model cannot give; 0.01 is the probability, not its cost; and $\\ln 2$ is the starting loss only for 2 classes.',
    difficulty: 'intermediate',
  },
]

export default questions
