import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'numpy.arrays-and-shapes.1',
    prompt: 'What does this code print?',
    code: 'import numpy as np\na = np.array([[1, 2, 3], [4, 5, 6]])\nprint(a.shape, a.ndim, a.size)',
    options: ['`(2, 3) 2 6`', '`(3, 2) 2 6`', '`(2, 3) 6 2`', '`(6,) 1 6`'],
    answer: 0,
    explanation:
      'The outer list holds 2 inner lists of 3 numbers, so there are 2 rows and 3 columns: shape `(2, 3)`. ndim is the number of axes (2) and size is $2 \\times 3 = 6$. Shapes list rows first, so `(3, 2)` is the classic trap.',
    difficulty: 'beginner',
  },
  {
    id: 'numpy.arrays-and-shapes.2',
    prompt: 'What does `np.arange(1, 10, 3)` produce?',
    options: ['`[1 4 7]`', '`[1 4 7 10]`', '`[3 6 9]`', '`[1 3 5 7 9]`'],
    answer: 0,
    explanation:
      'Start at 1 and add 3 each time: 1, 4, 7. The next value would be 10, but `arange` stops *before* the stop value, so 10 is not included. `[1 3 5 7 9]` would need a step of 2.',
    difficulty: 'beginner',
  },
  {
    id: 'numpy.arrays-and-shapes.3',
    prompt: '`a = np.arange(24)`. What is the shape of `a.reshape(4, -1, 2)`?',
    options: ['`(4, 3, 2)`', '`(4, 6, 2)`', '`(4, 1, 2)`', 'It raises an error, because −1 cannot be in the middle'],
    answer: 0,
    explanation:
      'The size stays 24. The given lengths multiply to $4 \\times 2 = 8$, so the missing length is $24 \\div 8 = 3$, giving `(4, 3, 2)`. The −1 may be in any position; `(4, 6, 2)` would need 48 elements.',
    difficulty: 'intermediate',
  },
  {
    id: 'numpy.arrays-and-shapes.4',
    prompt: '`a` and `b` both have shape `(3, 4)`. What is the shape of `np.stack([a, b], axis=1)`?',
    options: ['`(3, 2, 4)`', '`(3, 8)`', '`(6, 4)`', '`(2, 3, 4)`'],
    answer: 0,
    explanation:
      '`stack` creates a new axis whose length is the number of arrays (2) and inserts it at position 1: `(3, 2, 4)`. `(3, 8)` is what `np.concatenate([a, b], axis=1)` gives, because concatenate joins along an existing axis, and `(2, 3, 4)` is stacking along axis 0.',
    difficulty: 'intermediate',
  },
  {
    id: 'numpy.arrays-and-shapes.5',
    prompt:
      'An array `X` holds 1,000 greyscale images of 28 × 28 pixels, shape `(1000, 28, 28)`. A scikit-learn model needs one row per image and one column per pixel. Which line makes that table?',
    options: ['`X.reshape(1000, -1)`', '`X.reshape(-1, 1000)`', '`X.reshape(-1)`', '`np.stack([X], axis=1)`'],
    answer: 0,
    explanation:
      'Keep 1,000 rows and let NumPy work out the rest: $28 \\times 28 = 784$, so the result is `(1000, 784)`. `X.reshape(-1, 1000)` gives `(784, 1000)`, which mixes pixels from different images in each row, and `X.reshape(-1)` flattens everything into one long `(784000,)` array.',
    difficulty: 'intermediate',
  },
]

export default questions
