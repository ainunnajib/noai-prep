import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'probability-and-statistics.bayes-theorem.1',
    prompt: 'In Bayes\' theorem $P(H \\mid E) = \\dfrac{P(E \\mid H)\\,P(H)}{P(E)}$, where $H$ is a hypothesis and $E$ is the evidence, which term is the **prior**?',
    options: ['$P(H)$', '$P(E \\mid H)$', '$P(H \\mid E)$', '$P(E)$'],
    answer: 0,
    explanation:
      'The prior $P(H)$ is your belief in the hypothesis *before* seeing the evidence. $P(E \\mid H)$ is the likelihood, $P(H \\mid E)$ is the posterior (the belief *after* the evidence), and $P(E)$ is the evidence term that normalises the result.',
    difficulty: 'beginner',
  },
  {
    id: 'probability-and-statistics.bayes-theorem.2',
    prompt:
      'Out of 100 people, 10 have a disease. A test correctly flags 8 of those 10, and also wrongly flags 9 of the 90 healthy people. A person tests positive. What is the probability that they have the disease?',
    options: ['$8/17$', '$4/5$', '$17/100$', '$1/10$'],
    answer: 0,
    explanation:
      'Look only at the people who test positive: $8 + 9 = 17$ of them, of whom 8 have the disease, so $P(\\text{disease} \\mid +) = 8/17 \\approx 47\\%$. $4/5 = 8/10$ is the sensitivity $P(+ \\mid \\text{disease})$, $17/100$ is $P(+)$, and $1/10$ is the prior.',
    difficulty: 'intermediate',
  },
  {
    id: 'probability-and-statistics.bayes-theorem.3',
    prompt:
      'A screening test is 99% sensitive with a 1% false-positive rate. It is used for a condition that affects 1 in 10,000 people, and most of its positive results turn out to be false alarms. Why?',
    options: [
      'Healthy people are so common that 1% of them (about 100 per 10,000) far outnumber the 1 real case caught',
      'A sensitivity of 99% is too low for screening, so the test misses most of the real cases',
      'A test whose sensitivity and false-positive rate add up to 100% always gives mostly false alarms',
      'The test must have been evaluated on too few people for its 99% sensitivity to be reliable',
    ],
    answer: 0,
    explanation:
      'Count 10,000 people: about 1 has the condition and is (almost surely) flagged, while 1% of the 9,999 healthy people, about 100, are flagged too. So only about 1 in 101 positives is real. This is the base-rate fallacy: the test is accurate, but the prior is tiny. Missing real cases is not the problem here; the 99% sensitivity catches almost all of them.',
    difficulty: 'intermediate',
  },
  {
    id: 'probability-and-statistics.bayes-theorem.4',
    prompt:
      'Before testing, a patient\'s chance of having a condition is 1%. After one positive test it is updated to 15%. A second, independent test is then done. Which probability should be used as the prior for the second update?',
    options: ['15%', '1%', '90%, the sensitivity of the test', '50%, because the first test may have been wrong'],
    answer: 0,
    explanation:
      'Bayesian updating is sequential: the posterior after the first test (15%) is the prior for the second. Going back to 1% would throw away the evidence from the first test. The sensitivity is a likelihood, not a belief about the patient.',
    difficulty: 'beginner',
  },
  {
    id: 'probability-and-statistics.bayes-theorem.5',
    prompt:
      '90% of spam emails contain the word "free". 20% of all emails are spam, and 30% of all emails contain "free". What is $P(\\text{spam} \\mid \\text{free})$?',
    options: ['$0.6$', '$0.9$', '$0.18$', '$0.27$'],
    answer: 0,
    explanation:
      'Bayes: $P(\\text{spam} \\mid \\text{free}) = \\dfrac{P(\\text{free} \\mid \\text{spam})\\,P(\\text{spam})}{P(\\text{free})} = \\dfrac{0.9 \\times 0.2}{0.3} = \\dfrac{0.18}{0.3} = 0.6$. $0.9$ confuses $P(\\text{free} \\mid \\text{spam})$ with $P(\\text{spam} \\mid \\text{free})$, $0.18$ is $P(\\text{spam and free})$ before dividing by $P(\\text{free})$, and $0.27 = 0.9 \\times 0.3$ multiplies by $P(\\text{free})$ instead of dividing.',
    difficulty: 'intermediate',
  },
]

export default questions
