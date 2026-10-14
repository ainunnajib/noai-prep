import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'numpy.indexing-and-masks.1',
    prompt: 'What does this code print?',
    code: 'import numpy as np\narr = np.arange(12).reshape(3, 4)\nprint(arr[:, 1])',
    options: ['`[1 5 9]`', '`[4 5 6 7]`', '`[[1] [5] [9]]` (a column of shape (3, 1))', '`[0 1 2 3]`'],
    answer: 0,
    explanation:
      'The rows are `[0 1 2 3]`, `[4 5 6 7]` and `[8 9 10 11]`. `arr[:, 1]` takes every row (`:`) and column 1, giving 1, 5 and 9. The integer 1 removes the column axis, so the result is 1-D with shape `(3,)`, not a `(3, 1)` column. `[4 5 6 7]` is `arr[1]`, the second row.',
    difficulty: 'beginner',
  },
  {
    id: 'numpy.indexing-and-masks.2',
    prompt: '`arr` has shape `(5, 6)`. What is the shape of `arr[1:3, ::2]`?',
    options: ['`(2, 3)`', '`(3, 3)`', '`(2, 2)`', '`(2, 6)`'],
    answer: 0,
    explanation:
      '`1:3` keeps rows 1 and 2 (the stop, 3, is not included): 2 rows. `::2` keeps columns 0, 2 and 4: 3 columns. So the shape is `(2, 3)`. `(3, 3)` comes from wrongly including row 3, and `(2, 2)` from reading `::2` as "2 columns".',
    difficulty: 'intermediate',
  },
  {
    id: 'numpy.indexing-and-masks.3',
    prompt: 'What does this code print?',
    code: 'import numpy as np\nx = np.array([3, -1, 4, -1, 5])\nprint(x[x > 0].sum(), (x > 0).mean())',
    options: ['`12 0.6`', '`3 0.6`', '`12 3`', '`10 0.4`'],
    answer: 0,
    explanation:
      '`x[x > 0]` keeps `[3 4 5]`, whose sum is 12. The mask `x > 0` is `[True False True False True]`; with True as 1 and False as 0 its mean is $3 \\div 5 = 0.6$. `3` is the *count* of positives, `mask.sum()`, not the sum of the values.',
    difficulty: 'intermediate',
  },
  {
    id: 'numpy.indexing-and-masks.4',
    prompt: 'Which values does `a` hold after this code runs?',
    code: 'import numpy as np\na = np.array([1, 2, 3, 4])\nb = a[1:3]\nb[0] = 99',
    options: ['1, 99, 3, 4', '1, 2, 3, 4', '99, 2, 3, 4', '1, 2, 99, 4'],
    answer: 0,
    explanation:
      'A basic slice is a view: `b` shares memory with `a`, and `b[0]` is the same element as `a[1]`. Setting it to 99 changes `a` to 1, 99, 3, 4. Leaving `a` as 1, 2, 3, 4 is what would happen if slices made copies, as Python list slices do (or with `a[1:3].copy()`).',
    difficulty: 'intermediate',
  },
  {
    id: 'numpy.indexing-and-masks.5',
    prompt: 'A `float64` array `a` has shape `(3, 4)` and strides `(32, 8)`. Which statement about `a.T` is correct?',
    options: [
      'Its shape is `(4, 3)` and its strides are `(8, 32)`; it shares memory with `a`',
      'Its shape is `(4, 3)` and its strides are `(24, 8)`, because NumPy copies the data into the new order',
      'Its shape is `(4, 3)` and its strides stay `(32, 8)`, because strides depend only on the dtype',
      'Its shape stays `(3, 4)` until `.copy()` is called, because transposing is lazy',
    ],
    answer: 0,
    explanation:
      'Transposing swaps the shape to `(4, 3)` and swaps the strides to `(8, 32)`: one step along the new rows moves 8 bytes, one step along the new columns moves 32. No data moves, so it is a view and not C-contiguous. Strides `(24, 8)` describe a contiguous `(4, 3)` copy, which only `a.T.copy()` or `np.ascontiguousarray(a.T)` would make.',
    difficulty: 'advanced',
  },
]

export default questions
