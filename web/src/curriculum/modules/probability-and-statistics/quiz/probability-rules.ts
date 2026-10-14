import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'probability-and-statistics.probability-rules.1',
    prompt: 'Two fair dice are rolled. What is the probability that the two numbers add up to 7?',
    options: ['$1/6$', '$1/11$', '$7/36$', '$1/12$'],
    answer: 0,
    explanation:
      'There are $6 \\times 6 = 36$ equally likely ordered pairs, and six of them sum to 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1). So $P = 6/36 = 1/6$. The answer $1/11$ wrongly treats the 11 possible totals as equally likely, and $1/12$ counts only the 3 unordered pairs.',
    difficulty: 'beginner',
  },
  {
    id: 'probability-and-statistics.probability-rules.2',
    prompt: 'Events $A$ and $B$ have $P(A) = 0.3$ and $P(B) = 0.5$, and they are mutually exclusive. Which statement is correct?',
    options: [
      '$A$ and $B$ are dependent, because $P(A \\cap B) = 0$ but $P(A)P(B) = 0.15$',
      '$A$ and $B$ are independent, because $P(A \\cap B) = P(A)P(B) = 0.15$',
      '$A$ and $B$ are independent, because neither event can cause the other',
      '$P(A \\cup B) = 0.65$, because the overlap $0.15$ must be subtracted once',
    ],
    answer: 0,
    explanation:
      'Mutually exclusive means they cannot happen together, so $P(A \\cap B) = 0$. Independence would need $P(A \\cap B) = 0.3 \\times 0.5 = 0.15$, which fails. Knowing $A$ happened tells you $B$ did not, so they are dependent. With no overlap, $P(A \\cup B) = 0.3 + 0.5 = 0.8$; subtracting $0.15$ wrongly assumes independence.',
    difficulty: 'intermediate',
  },
  {
    id: 'probability-and-statistics.probability-rules.3',
    prompt: 'For two events, $P(A) = 0.6$, $P(B) = 0.5$ and $P(A \\cap B) = 0.3$. What is $P(A \\cup B)$?',
    options: ['$0.8$', '$1.1$', '$0.3$', '$0.9$'],
    answer: 0,
    explanation:
      'Use the addition rule: $P(A \\cup B) = 0.6 + 0.5 - 0.3 = 0.8$. Forgetting to subtract the overlap gives $1.1$, which is impossible because no probability can exceed 1. (Here $0.6 \\times 0.5 = 0.3$, so these events also happen to be independent.)',
    difficulty: 'beginner',
  },
  {
    id: 'probability-and-statistics.probability-rules.4',
    prompt:
      'A spam filter is tested on 200 emails. 50 are spam. The word "winner" appears in 40 emails, and 30 of those are spam. An email contains "winner". What is the probability that it is spam?',
    options: ['$3/4$', '$3/5$', '$3/20$', '$1/4$'],
    answer: 0,
    explanation:
      '"Given it contains winner" shrinks the world to those 40 emails, and 30 of them are spam, so $P(\\text{spam} \\mid \\text{winner}) = 30/40 = 3/4$. $3/5 = 30/50$ is the reverse, $P(\\text{winner} \\mid \\text{spam})$. $3/20 = 30/200$ is $P(\\text{spam and winner})$, which uses the whole data set as the denominator.',
    difficulty: 'intermediate',
  },
  {
    id: 'probability-and-statistics.probability-rules.5',
    prompt:
      'A self-driving car\'s sensor misses an obstacle with probability 0.1 on each independent check. Two checks are made. What is the probability that the obstacle is missed at least once?',
    options: ['$0.19$', '$0.2$', '$0.01$', '$0.18$'],
    answer: 0,
    explanation:
      'P(never missed) $= 0.9 \\times 0.9 = 0.81$, so P(missed at least once) $= 1 - 0.81 = 0.19$. Adding $0.1 + 0.1 = 0.2$ counts the "missed both times" case ($0.01$) twice. $0.18 = 2 \\times 0.1 \\times 0.9$ is the probability of *exactly* one miss.',
    difficulty: 'intermediate',
  },
]

export default questions
