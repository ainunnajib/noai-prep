import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'ai-first-look.fit-a-line-by-hand.1',
    prompt: 'A model predicts a flat’s price with $\\hat{y} = wx + b$, where $x$ is the floor area. During training on 500 past sales, what is allowed to change?',
    options: [
      'Only $w$ and $b$; the areas and prices of the 500 flats stay fixed',
      'Only the 500 prices, which are adjusted until they lie on the line',
      'Only $x$ and $\\hat{y}$, which are adjusted until they are equal',
      'All of $w$, $b$, $x$ and $y$, until the line passes through every flat',
    ],
    answer: 0,
    explanation:
      'The parameters $w$ and $b$ are the knobs that training turns; the data (each flat’s area $x$ and price $y$) is fixed. Changing the data to fit the model would be cheating, and $\\hat{y}$ is simply whatever the line predicts for a given $x$.',
    difficulty: 'beginner',
  },
  {
    id: 'ai-first-look.fit-a-line-by-hand.2',
    prompt: 'A flat sold for S\\$520k. The model predicted S\\$560k. What is the residual (actual minus predicted), in S\\$ thousands?',
    options: ['$-40$', '$+40$', '$1600$', '$-1600$'],
    answer: 0,
    explanation:
      'Residual $= y - \\hat{y} = 520 - 560 = -40$. It is negative because the model guessed too high. $+40$ has the subtraction the wrong way round, and $1600 = 40^2$ is the squared error, not the residual.',
    difficulty: 'beginner',
  },
  {
    id: 'ai-first-look.fit-a-line-by-hand.3',
    prompt: 'A model’s residuals on four flats are $1$, $-3$, $3$ and $-1$. What is its mean squared error (MSE)?',
    options: ['$5$', '$0$', '$2$', '$20$'],
    answer: 0,
    explanation:
      'Square each residual: $1 + 9 + 9 + 1 = 20$, then divide by $n = 4$: MSE $= 5$. Averaging the raw residuals gives $0$ because they cancel, averaging their sizes gives $8 \\div 4 = 2$, and $20$ is the sum before dividing by $n$.',
    difficulty: 'beginner',
  },
  {
    id: 'ai-first-look.fit-a-line-by-hand.4',
    prompt: 'Why does the mean squared error square each residual before averaging?',
    options: [
      'So that positive and negative misses can never cancel, and big misses count more',
      'So that the loss comes out in thousands of dollars, the same units as the flat prices',
      'So that the best possible line ends up with a loss of exactly zero, a perfect fit',
      'So that the single largest miss decides the loss, and the small misses drop out',
    ],
    answer: 0,
    explanation:
      'Squares are never negative, so a $+50$ miss and a $-50$ miss both count instead of cancelling, and a miss of 50 costs 25 times as much as a miss of 10. Squaring actually changes the units (to thousands of dollars, squared), the best line usually still has a loss above zero, and every residual contributes, not just the largest.',
    difficulty: 'beginner',
  },
  {
    id: 'ai-first-look.fit-a-line-by-hand.5',
    prompt:
      'Keeping $b$ fixed, you try five slopes and record the MSE: $w = 2$: 50, $w = 3$: 18, $w = 4$: 6, $w = 5$: 14, $w = 6$: 42. What is the best conclusion?',
    options: [
      'The best slope is near $w = 4$, where the loss curve is at its lowest',
      'The best slope is $w = 6$, because that is where the loss changes the fastest',
      'The best slope is $w = 2$, because the smallest slope gives the simplest model',
      'No slope fits well here, because a well-fitting line has an MSE of zero',
    ],
    answer: 0,
    explanation:
      'Lower loss means a better fit, so the best of these is $w = 4$ with MSE 6, the lowest point of the U-shaped valley (the true minimum lies between 3 and 5). The loss rises on both sides, and a minimum above zero is normal: real data almost never lies exactly on one straight line.',
    difficulty: 'beginner',
  },
]

export default questions
