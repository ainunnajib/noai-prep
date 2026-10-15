import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'classification.naive-bayes.1',
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
    id: 'classification.naive-bayes.2',
    prompt:
      'In the training messages of the class "sports", the word "match" appears 3 times out of 40 words in total. The vocabulary has 10 different words. With Laplace (add-one) smoothing, what is $P(\\text{match} \\mid \\text{sports})$?',
    options: ['$4/50$', '$3/40$', '$4/41$', '$4/40$'],
    answer: 0,
    explanation:
      'Laplace smoothing adds 1 to every word count and the vocabulary size $|V| = 10$ to the total: $\\frac{3 + 1}{40 + 10} = \\frac{4}{50} = 0.08$. The denominator grows by 10, not by 1, because each of the 10 words received one extra count; only then do the 10 probabilities still add up to 1. $\\frac{3}{40}$ is the unsmoothed estimate.',
    difficulty: 'intermediate',
  },
  {
    id: 'classification.naive-bayes.3',
    prompt: 'What exactly is "naive" about Naive Bayes?',
    options: [
      'Features are independent of each other once the class is known: $P(x_1, x_2 \\mid c) = P(x_1 \\mid c)\\,P(x_2 \\mid c)$',
      'Every class is equally likely before any features are seen, so the prior $P(c)$ is always left out of the score',
      'Features are independent of the class itself, so that $P(x_1 \\mid c) = P(x_1)$ for every class $c$ and every word',
      'Features are mutually exclusive, so at most one of the vocabulary words can appear in any one message',
    ],
    answer: 0,
    explanation:
      'The naive assumption is conditional independence given the class, which turns one impossible-to-count joint probability into a product of simple one-feature probabilities. Naive Bayes does use the prior $P(c)$. If features were independent of the class they would carry no information at all, and "mutually exclusive" describes events that cannot happen together, which is a different idea from independence.',
    difficulty: 'beginner',
  },
  {
    id: 'classification.naive-bayes.4',
    prompt:
      'A Naive Bayes filter multiplies 400 word probabilities of about 0.001 each, and in Python every class score comes out as exactly 0.0. What is the standard fix?',
    options: [
      'Add the logs of the probabilities instead of multiplying them',
      'Apply Laplace smoothing so that no word probability is exactly 0',
      'Leave out the prior P(c), so there is one factor fewer to multiply',
      'Switch to 32-bit floats, which can hold even smaller numbers',
    ],
    answer: 0,
    explanation:
      'The true product is about $10^{-1200}$, far below the smallest positive 64-bit float (about $5 \\times 10^{-324}$), so it underflows to 0. Adding logs gives a sum of about $-2763$, which is easy to store, and since log always increases the class with the largest log score still wins. Smoothing fixes zero counts, not underflow; dropping one factor changes almost nothing; 32-bit floats hold even less.',
    difficulty: 'intermediate',
  },
  {
    id: 'classification.naive-bayes.5',
    prompt:
      'Naive Bayes assumes words are independent once the class is known, which is clearly false ("free" and "prize" love to appear together). Why does it still classify well?',
    options: [
      'Classifying only needs the class scores in the right order, not exact values',
      'Laplace smoothing removes the links between words, so the assumption becomes true',
      'The prior P(c) corrects for any words that tend to appear together in one class',
      'With enough training data the word counts become independent of each other',
    ],
    answer: 0,
    explanation:
      'Counting linked words twice pushes the scores further apart, which makes the probabilities over-confident, but it rarely swaps which class scores highest, and the highest score is all a classifier needs. Smoothing only adds 1 to the counts, the prior only reflects how common each class is, and more data cannot make linked words independent.',
    difficulty: 'intermediate',
  },
]

export default questions
