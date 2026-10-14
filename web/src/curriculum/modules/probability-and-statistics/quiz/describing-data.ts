import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'probability-and-statistics.describing-data.1',
    prompt:
      'A small start-up pays its 9 employees \\$4000 a month each, and its founder \\$100,000 a month. A journalist wants one number for what a *typical* person at the company earns. Which choice is best?',
    options: [
      'The median, \\$4000, because one huge salary drags the mean but cannot move the middle value',
      'The mean, \\$13,600, because it is the only average that uses every salary in the company',
      'The midpoint of the lowest and highest pay, \\$52,000, because it balances the two extremes',
      'The range, \\$96,000, because it shows how different the salaries in the company are',
    ],
    answer: 0,
    explanation:
      'The mean is $(9 \\times 4000 + 100\\,000) \\div 10 = 136\\,000 \\div 10 = 13\\,600$, more than three times what 9 of the 10 people earn. Sorted, the middle values are both 4000, so the median is 4000, which describes almost everyone. The mean does use every value, but that is exactly why a single outlier distorts it.',
    difficulty: 'beginner',
  },
  {
    id: 'probability-and-statistics.describing-data.2',
    prompt: 'What is the standard deviation of $[2, 4, 4, 4, 5, 5, 7, 9]$, dividing by $n$? (Hint: the mean is 5.)',
    options: ['$2$', '$4$', '$1.5$', '$32$'],
    answer: 0,
    explanation:
      'Deviations from 5: $-3, -1, -1, -1, 0, 0, 2, 4$. Squares: $9, 1, 1, 1, 0, 0, 4, 16$, which sum to 32. Variance $= 32 \\div 8 = 4$, so the SD is $\\sqrt{4} = 2$. 4 is the variance (you forgot the square root), 32 is the sum of squares (you forgot to divide), and 1.5 is the mean *absolute* deviation $12 \\div 8$.',
    difficulty: 'intermediate',
  },
  {
    id: 'probability-and-statistics.describing-data.3',
    prompt:
      'House prices in a district are mostly moderate, with a long tail of a few extremely expensive homes. Which ordering of the three averages is most likely?',
    options: ['mean > median > mode', 'mode > median > mean', 'mean = median = mode', 'median > mean > mode'],
    answer: 0,
    explanation:
      'A long tail of large values is a right (positive) skew. The few huge prices drag the mean furthest to the right, the median moves a little, and the mode stays at the peak where most homes are. "mode > median > mean" is the ordering for a *left* skew, and equality only holds for a symmetric shape.',
    difficulty: 'beginner',
  },
  {
    id: 'probability-and-statistics.describing-data.4',
    prompt: 'What does this code print?',
    code: 'import numpy as np\nimport pandas as pd\n\nx = [2, 4, 6]\nprint(np.var(x), pd.Series(x).var())',
    options: ['`2.6666666666666665 4.0`', '`4.0 4.0`', '`2.6666666666666665 2.6666666666666665`', '`4.0 2.6666666666666665`'],
    answer: 0,
    explanation:
      'The mean is 4 and the squared deviations are $4, 0, 4$, summing to 8. NumPy divides by $n$ by default: $8 \\div 3 \\approx 2.667$. pandas divides by $n - 1$ by default: $8 \\div 2 = 4.0$. The two libraries disagree unless you pass `ddof` explicitly.',
    difficulty: 'intermediate',
  },
  {
    id: 'probability-and-statistics.describing-data.5',
    prompt: 'Why does the variance square each deviation $x_i - \\bar{x}$ instead of simply averaging the deviations?',
    options: [
      'The plain deviations always add up to zero, so their average is 0 for every data set',
      'Squaring keeps the result in the same units as the data, so it is easier to interpret',
      'Squaring shrinks the influence of points far from the mean, so the measure is more robust',
      'The plain deviations add up to the range, which only depends on the two extreme values',
    ],
    answer: 0,
    explanation:
      'The mean is the balance point, so the negative deviations exactly cancel the positive ones: $\\sum (x_i - \\bar{x}) = 0$ always. Squaring makes every term positive so nothing cancels. Squaring does the opposite of the other claims: it changes the units to units² (hence the square root for the SD) and it *magnifies* far-out points.',
    difficulty: 'beginner',
  },
]

export default questions
