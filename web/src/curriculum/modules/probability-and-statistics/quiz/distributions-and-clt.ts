import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'probability-and-statistics.distributions-and-clt.1',
    prompt:
      'A spinner at a games stall scores 0 points with probability 0.5, 2 points with probability 0.3 and 10 points with probability 0.2. What is the expected score per spin?',
    options: ['2.6', '4', '0', '3.4'],
    answer: 0,
    explanation:
      'Multiply each score by its probability and add: $E[X] = 0 \\times 0.5 + 2 \\times 0.3 + 10 \\times 0.2 = 0 + 0.6 + 2 = 2.6$. 4 is the plain average of 0, 2 and 10, which ignores the probabilities; 0 is the most likely single score (the mode), not the long-run average; 3.4 pairs 10 with 0.3 and 2 with 0.2 by mistake.',
    difficulty: 'beginner',
  },
  {
    id: 'probability-and-statistics.distributions-and-clt.2',
    prompt: 'A fair six-sided die has expected value $E[X] = 3.5$. Which statement about this die is correct?',
    options: [
      'A roll of 3.5 is the single most likely outcome of one roll',
      'After a run of high rolls, low rolls become more likely, pulling the average back to 3.5',
      'The average of a very large number of rolls will be close to 3.5',
      'Any 10 rolls of the die always add up to exactly 35',
    ],
    answer: 2,
    explanation:
      'Expectation is a long-run average: by the law of large numbers, the average of many rolls settles near 3.5. The die has no memory, so a streak never makes low rolls more likely (the gambler\'s fallacy); the average settles because many ordinary rolls swamp the streak. 3.5 cannot be rolled at all, and 10 rolls only total about 35 on average, not exactly.',
    difficulty: 'beginner',
  },
  {
    id: 'probability-and-statistics.distributions-and-clt.3',
    prompt:
      'Marks in a large exam are approximately normal with mean 70 and standard deviation 5. Roughly what percentage of candidates scored **below** 80?',
    options: ['2.5%', '95%', '97.5%', '68%'],
    answer: 2,
    explanation:
      'The z-score of 80 is $z = (80 - 70)/5 = 2$. About 95% lie within $\\pm 2\\sigma$, so 5% lie outside, 2.5% in each tail. Below $z = 2$ is therefore about $100\\% - 2.5\\% = 97.5\\%$. 95% is the share *within* two standard deviations, not below; 2.5% is the share *above* 80; 68% is the one-standard-deviation band.',
    difficulty: 'intermediate',
  },
  {
    id: 'probability-and-statistics.distributions-and-clt.4',
    prompt: 'What does this code print?',
    code: 'import numpy as np\nnp.random.seed(0)\nx = np.random.normal(5, 2, size=100_000)\nprint(round(x.mean()), round(x.var()))',
    options: ['`5 4`', '`5 2`', '`2 4`', '`5 25`'],
    answer: 0,
    explanation:
      'In `np.random.normal(loc, scale, size)`, `loc` is the mean and `scale` is the **standard deviation**. With 100,000 draws the sample mean rounds to 5 and the variance to $\\sigma^2 = 2^2 = 4$. `5 2` mistakes the variance for the standard deviation, and `5 25` squares the mean instead of the standard deviation.',
    difficulty: 'intermediate',
  },
  {
    id: 'probability-and-statistics.distributions-and-clt.5',
    prompt:
      'Waiting times at a hawker stall are right-skewed with mean 6 minutes and standard deviation 6 minutes. Each month you average the waits of 36 random visits, and you repeat this for many months. How are the monthly averages distributed?',
    options: [
      'Approximately normal, with mean 6 min and standard deviation 1 min',
      'Right-skewed like single waits, with mean 6 min and standard deviation 6 min',
      'Approximately normal, with mean 6 min and standard deviation 6 min',
      'Approximately normal, with mean 6 min and standard deviation 1/6 min',
    ],
    answer: 0,
    explanation:
      'By the Central Limit Theorem, sample means are approximately normal, centred on the population mean (6 min), with standard error $\\sigma/\\sqrt{n} = 6/\\sqrt{36} = 6/6 = 1$ min. Keeping $\\sigma = 6$ forgets that averaging shrinks the spread; $1/6$ divides by $n = 36$ instead of $\\sqrt{n} = 6$. The single waits stay skewed, but averages of 36 are close to normal.',
    difficulty: 'intermediate',
  },
]

export default questions
