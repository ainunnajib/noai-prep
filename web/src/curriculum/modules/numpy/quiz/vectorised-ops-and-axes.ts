import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'numpy.vectorised-ops-and-axes.1',
    prompt: '`A` has shape `(2, 3)` and `B` has shape `(3, 4)`. Which expression computes their matrix product?',
    options: ['`np.dot(A, B)`', '`A * B`', '`np.multiply(A, B)`', '`B @ A`'],
    answer: 0,
    explanation:
      '`np.dot` (like `@`) dots each row of `A` with each column of `B`; the inner sizes match ($3 = 3$), so the result has shape $(2, 4)$. `A * B` and `np.multiply(A, B)` are the same element-wise operation and raise a `ValueError` here because the shapes differ. `B @ A` puts the matrices in the wrong order: it would need $4 = 2$.',
    difficulty: 'beginner',
  },
  {
    id: 'numpy.vectorised-ops-and-axes.2',
    prompt: '`arr` is a 2-D array with one row per student and one column per subject. Which call gives the average of **each subject** (each column)?',
    options: ['`np.mean(arr, axis=0)`', '`np.mean(arr, axis=1)`', '`np.avg(arr, axis=0)`', '`arr.average(axis=0)`'],
    answer: 0,
    explanation:
      '`axis=0` runs down the rows and squashes them together, leaving one value per column. `axis=1` would give one average per student instead. NumPy has no `np.avg` function and arrays have no `.average()` method, so those two lines raise errors.',
    difficulty: 'beginner',
  },
  {
    id: 'numpy.vectorised-ops-and-axes.3',
    prompt: 'What does this code print?',
    code: 'import numpy as np\na = np.array([[1, 2],\n              [3, 4]])\np = a * a\nq = a @ a\nprint(p[1, 1], q[1, 1])',
    options: ['`16 22`', '`22 16`', '`16 16`', '`8 22`'],
    answer: 0,
    explanation:
      '`a * a` squares each entry, so its bottom-right entry is $4 \\times 4 = 16$. `a @ a` dots row 1 `[3, 4]` with column 1 `[2, 4]`: $3 \\times 2 + 4 \\times 4 = 6 + 16 = 22$. The two operations only agree by coincidence, never in general.',
    difficulty: 'intermediate',
  },
  {
    id: 'numpy.vectorised-ops-and-axes.4',
    prompt:
      '`counts` has shape `(4, 3)`: word counts for 4 documents (rows) and 3 words (columns). You want to divide every row by its own total so that each **row** sums to 1. Which line does this?',
    options: [
      '`counts / counts.sum(axis=1, keepdims=True)`',
      '`counts / counts.sum(axis=0, keepdims=True)`',
      '`counts / counts.sum(axis=1).reshape(1, -1)`',
      '`counts / counts.sum(axis=(0, 1), keepdims=True)`',
    ],
    answer: 0,
    explanation:
      'With `axis=1, keepdims=True` the row totals form a $(4, 1)$ column, one per row, so each row is divided by its own total. `.reshape(1, -1)` turns the 4 totals into a $(1, 4)$ row, which meets the 3 columns and raises a `ValueError` (so does plain `counts.sum(axis=1)`, shape $(4,)$). `axis=0` makes each *column* sum to 1, and `axis=(0, 1)` divides by the grand total, so the whole table sums to 1.',
    difficulty: 'intermediate',
  },
  {
    id: 'numpy.vectorised-ops-and-axes.5',
    prompt: 'A classifier gives these class probabilities for 2 examples. What is printed?',
    code: 'import numpy as np\nprobs = np.array(\n    [[0.1, 0.7, 0.2],\n     [0.6, 0.3, 0.1]])\nprint(probs.argmax(axis=1))',
    options: ['`[1 0]`', '`[0.7 0.6]`', '`[1 0 0]`', '`1`'],
    answer: 0,
    explanation:
      '`argmax` returns the **position** of the largest value, and `axis=1` gives one answer per row: row 0 peaks at index 1 (0.7) and row 1 at index 0 (0.6). `[0.7 0.6]` is `probs.max(axis=1)`, the values rather than the positions. `[1 0 0]` is `argmax(axis=0)` (one per column), and `1` is the position in the flattened array with no axis.',
    difficulty: 'intermediate',
  },
]

export default questions
