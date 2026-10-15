import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'numpy.from-scratch-patterns.1',
    prompt: '`X` holds 50 points with 4 features, shape `(50, 4)`, and `C` holds 3 centroids, shape `(3, 4)`. What is the shape of `D`?',
    code: 'A = X[:, None, :]\nB = C[None, :, :]\nsq = ((A - B) ** 2).sum(axis=-1)\nD = np.sqrt(sq)',
    options: ['`(50, 3)`', '`(50, 3, 4)`', '`(50, 4)`', '`(3, 4)`'],
    answer: 0,
    explanation:
      '`A` has shape $(50, 1, 4)$ and `B` has shape $(1, 3, 4)$, so `A - B` broadcasts to $(50, 3, 4)$: one difference vector per (point, centroid) pair. Summing over `axis=-1` removes the 4 features, leaving the $(50, 3)$ distance matrix. $(50, 3, 4)$ is the shape *before* the sum.',
    difficulty: 'intermediate',
  },
  {
    id: 'numpy.from-scratch-patterns.2',
    prompt: 'In k-means, `D` has shape `(n, k)`: the distance from each of `n` points to each of `k` centroids. Which line gives every point its cluster label?',
    options: ['`labels = D.argmin(axis=1)`', '`labels = D.min(axis=1)`', '`labels = D.argmin(axis=0)`', '`labels = D.argmin()`'],
    answer: 0,
    explanation:
      'Each point is one row, so we need the **position** of the smallest entry in each row: `argmin(axis=1)`, shape $(n,)$. `min(axis=1)` gives the distances themselves, not the cluster numbers. `argmin(axis=0)` finds the nearest point for each centroid, and `argmin()` with no axis returns a single position in the flattened array.',
    difficulty: 'beginner',
  },
  {
    id: 'numpy.from-scratch-patterns.3',
    prompt: 'Each entry of `r` is a true value minus your guess for it. What does this print?',
    code: 'import numpy as np\n# each entry is y - guess\nr = np.array([2.5, -0.5,\n              0.0, 3.0])\nprint(np.sign(r))',
    options: ['`[ 1. -1.  0.  1.]`', '`[2.5 0.5 0.  3. ]`', '`[ 1. -1.  1.  1.]`', '`[1. 0. 0. 1.]`'],
    answer: 0,
    explanation:
      '`np.sign` gives $-1$ for negative values, $0$ for zero and $1$ for positive values, keeping the float type, so `[ 1. -1.  0.  1.]`: guesses 0 and 3 are too low, guess 1 is too high and guess 2 is exact. `[2.5 0.5 0.  3. ]` is `np.abs(r)`. The sign of 0 is 0, not 1, and negative values become $-1$, not 0.',
    difficulty: 'beginner',
  },
  {
    id: 'numpy.from-scratch-patterns.4',
    prompt: 'A stub says: "return the score as a float rounded to 4 decimal places". Your value is `x = 2 / 3`, and the hidden test is `assert result == 0.6667`. Which return statement passes?',
    options: ['`return round(float(x), 4)`', '`return int(x * 10000) / 10000`', '`return np.round(x, 2)`', '`return str(np.round(x, 4))`'],
    answer: 0,
    explanation:
      '`round(float(x), 4)` gives the float `0.6667`. `int(x * 10000) / 10000` *truncates* to `0.6666` instead of rounding. Two decimal places give `0.67`. `str(...)` returns the text `"0.6667"`, and a string never equals a number in Python, so the right digits in the wrong type still fail.',
    difficulty: 'intermediate',
  },
  {
    id: 'numpy.from-scratch-patterns.5',
    prompt:
      'You must pick **one** number $c$ to stand for every value in `y = np.array([1, 2, 3, 4, 15])`, and your total error is the sum of the gaps, $\\sum_i |y_i - c|$. Which $c$ makes this total as small as possible?',
    options: ['`3.0`, from `np.median(y)`', '`5.0`, from `np.mean(y)`', '`8.0`, halfway between the min and max', '`4.0`, halfway between the mean and the median'],
    answer: 0,
    explanation:
      'The median makes the total gap smallest: at $c = 3$ the total is $2 + 1 + 0 + 1 + 12 = 16$, while $c = 5$ (the mean) gives $4 + 3 + 2 + 1 + 10 = 20$ and $c = 4$ gives 17. The mean is the best choice for the total *squared* gap, which is why the one extreme value (15) drags it up.',
    difficulty: 'intermediate',
  },
]

export default questions
