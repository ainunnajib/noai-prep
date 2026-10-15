import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'numpy.broadcasting.1',
    prompt: 'What does **broadcasting** do in NumPy?',
    options: [
      'Lets an element-wise operation combine compatible shapes by virtually stretching their size-1 dimensions, without copying data',
      'Sends a copy of the array to each CPU core so that one element-wise operation runs on several cores at once',
      'Repeats the smaller array until both arrays hold the same number of elements, whatever their shapes are',
      'Converts Python lists into NumPy arrays automatically so that vectorised operations can be applied to them',
    ],
    answer: 0,
    explanation:
      'Broadcasting is a shape rule: size-1 (or missing) dimensions are stretched to match, without copying data, and then the operation runs element-wise. It has nothing to do with parallel hardware. "Same number of elements" is the classic trap: $(2, 3)$ and $(3, 2)$ both hold 6 numbers but do not broadcast.',
    difficulty: 'beginner',
  },
  {
    id: 'numpy.broadcasting.2',
    prompt: '`a.shape` is `(4, 1)` and `b.shape` is `(3,)`. What is `(a + b).shape`?',
    options: ['`(4, 3)`', '`(4, 1)`', '`(3, 4)`', 'It raises a `ValueError`'],
    answer: 0,
    explanation:
      'Line up from the right, padding `b` to $(1, 3)$. Right position: $1$ and $3$, so the 1 stretches to 3. Left position: $4$ and $1$, so the 1 stretches to 4. The result is $(4, 3)$; the order follows the positions, so it is not $(3, 4)$.',
    difficulty: 'beginner',
  },
  {
    id: 'numpy.broadcasting.3',
    prompt: 'Which line raises a `ValueError`?',
    options: ['`np.ones((2, 3)) + np.ones(2)`', '`np.ones((2, 3)) + np.ones(3)`', '`np.ones((2, 3)) + np.ones((2, 1))`', '`np.ones((2, 3)) + 5`'],
    answer: 0,
    explanation:
      '`np.ones(2)` has shape $(2,)$, which is padded to $(1, 2)$ and compared with the **last** axis of $(2, 3)$: $2$ against $3$ fails. The $(3,)$ vector matches the last axis, the $(2, 1)$ column stretches across the columns, and a single number stretches everywhere. To add one value per row you need the $(2, 1)$ form.',
    difficulty: 'intermediate',
  },
  {
    id: 'numpy.broadcasting.4',
    prompt: '`X` has shape `(100, 5)`: 100 examples, 5 features. After `Z = (X - X.mean(axis=0)) / X.std(axis=0)`, which statement is true?',
    options: [
      'Each of the 5 columns of `Z` has mean 0 and standard deviation 1',
      'Each of the 100 rows of `Z` has mean 0 and standard deviation 1',
      '`Z` has shape `(5,)`: one standardised value for each feature',
      'The line raises an error because `(100, 5)` and `(5,)` are different shapes',
    ],
    answer: 0,
    explanation:
      '`axis=0` gives one mean and one standard deviation per column, each of shape $(5,)$. They broadcast down the 100 rows, so every column is centred and scaled by its own statistics and `Z` keeps the shape $(100, 5)$. Rows are not standardised, and $(100, 5)$ with $(5,)$ is perfectly compatible.',
    difficulty: 'intermediate',
  },
  {
    id: 'numpy.broadcasting.5',
    prompt: 'In a from-scratch regression, `pred` has shape `(50, 1)` and `y` has shape `(50,)`. What does `loss = np.mean((pred - y) ** 2)` do?',
    options: [
      'Averages a `(50, 50)` grid of every prediction minus every target, so the loss is silently wrong',
      'Raises `ValueError: operands could not be broadcast together` because the shapes differ',
      'Gives the correct mean squared error, because NumPy pairs the 50 predictions with the 50 targets',
      'Returns a `(50, 1)` array holding the squared error of each example instead of one number',
    ],
    answer: 0,
    explanation:
      'Lined up from the right, $(50, 1)$ meets $(1, 50)$: both positions contain a 1, so both stretch and `pred - y` has shape $(50, 50)$. No error is raised; `np.mean` averages 2,500 mostly meaningless differences. Fix it with `pred.reshape(-1)` (or `y[:, None]`) so both shapes match exactly.',
    difficulty: 'intermediate',
  },
]

export default questions
