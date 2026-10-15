import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'ml-fundamentals.reinforcement-learning.1',
    prompt: 'What best distinguishes **reinforcement learning** from **supervised learning**?',
    options: [
      'The agent is never shown the right answer; it learns from the rewards its own actions earn',
      'The agent needs a larger labelled dataset, because every action must come with its correct answer',
      'The agent groups unlabelled data points into clusters and gets no feedback on its groupings',
      'The agent copies a fixed set of expert moves, just as a supervised model copies its labels',
    ],
    answer: 0,
    explanation:
      'In RL nobody provides the correct action: the agent acts, receives a reward saying how good the outcome was, and learns from that. Needing a correct answer for every action describes supervised learning, and copying expert moves is also learning from labelled examples. Clustering without feedback is unsupervised learning.',
    difficulty: 'beginner',
  },
  {
    id: 'ml-fundamentals.reinforcement-learning.2',
    prompt:
      'A robot vacuum cleaner gets +1 for each patch of floor it cleans and −10 if its battery runs out away from its charging dock. In reinforcement learning terms, which of these is the **state**?',
    options: [
      'Its position, battery level and which patches are already clean',
      'The +1 it receives for each patch of floor that it manages to clean',
      'Moving forward, turning left or right, or heading back to the dock',
      'The rule it has learned for choosing a move in each situation',
    ],
    answer: 0,
    explanation:
      'The state describes the current situation the agent observes. The +1 is a reward, the moves are actions, and the learned rule from situations to moves is the policy.',
    difficulty: 'beginner',
  },
  {
    id: 'ml-fundamentals.reinforcement-learning.3',
    prompt: 'An agent will receive rewards of 0, 0 and 10 on its next three steps. With discount factor $\\gamma = 0.9$, what is the return?',
    options: ['8.1', '10', '9', '7.29'],
    answer: 0,
    explanation:
      '$G = 0 + 0.9 \\times 0 + 0.9^2 \\times 10 = 0.81 \\times 10 = 8.1$. The first reward is not discounted, so the third is multiplied by $\\gamma^2$, not $\\gamma^3$ (which would give 7.29). 10 ignores discounting altogether.',
    difficulty: 'intermediate',
  },
  {
    id: 'ml-fundamentals.reinforcement-learning.4',
    prompt:
      'An agent uses ε-greedy with $\\varepsilon = 0.2$ and has 4 possible actions. What is the probability that it chooses the action that currently has the highest estimated value?',
    options: ['0.85', '0.8', '0.2', '0.95'],
    answer: 0,
    explanation:
      'It exploits with probability $1 - 0.2 = 0.8$, and when it explores (probability 0.2) the random pick lands on the best action 1 time in 4: $0.8 + 0.2 \\times \\tfrac14 = 0.8 + 0.05 = 0.85$. Answering 0.8 forgets that a random choice can also hit the best action.',
    difficulty: 'intermediate',
  },
  {
    id: 'ml-fundamentals.reinforcement-learning.5',
    prompt: 'What does this code print?',
    code: 'import numpy as np\nrng = np.random.default_rng()\n\ndef choose(Q, epsilon):\n    if rng.random() < epsilon:\n        return rng.integers(len(Q))\n    return int(np.argmax(Q))\n\nQ = np.array([2.0, 5.0, 3.5])\nprint(choose(Q, 0.0))',
    options: ['`1`', '`5.0`', '`0`', 'A random index: `0`, `1` or `2`'],
    answer: 0,
    explanation:
      '`rng.random()` is never below 0, so with `epsilon = 0.0` the function always exploits and returns `np.argmax(Q)`: the **index** of the largest estimate, which is 1. `5.0` is the largest value itself, not its index, and a random index would need epsilon above 0.',
    difficulty: 'intermediate',
  },
]

export default questions
