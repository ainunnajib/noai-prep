import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'linear-algebra-deeper.span-rank-independence.1',
    prompt: 'The vectors $u$, $v$ and $w$ are linearly **dependent**. Which statement must be true?',
    options: [
      'At least one of them can be written as a combination of the others',
      'They lie on a single line through the origin, so each pair is parallel',
      'At least one of them is the zero vector, which adds no new direction',
      'Each pair of them is perpendicular, so the dot product of any two is 0',
    ],
    answer: 0,
    explanation:
      'Dependent means some $c_1u + c_2v + c_3w = \\mathbf{0}$ with amounts not all zero, so one vector can be solved for in terms of the others, e.g. $w = u + v$. They need not all be parallel: $(1, 0, 1)$, $(0, 1, 1)$ and $(1, 1, 2)$ are dependent but span a whole plane. A zero vector would make a set dependent, but dependent sets need not contain one, and perpendicular non-zero vectors are actually independent.',
    difficulty: 'beginner',
  },
  {
    id: 'linear-algebra-deeper.span-rank-independence.2',
    prompt: '$A$ is a 6×2 matrix and $B$ is a 2×6 matrix, so the product $AB$ is 6×6. What is the largest rank that $AB$ can possibly have?',
    options: ['2', '6', '12', '36'],
    answer: 0,
    explanation:
      '$B$ has only 2 rows, so $\\operatorname{rank} B \\le \\min(2, 6) = 2$; likewise $\\operatorname{rank} A \\le 2$. Every input to $AB$ is squeezed through 2 numbers in the middle, and $\\operatorname{rank}(AB) \\le \\min(\\operatorname{rank} A, \\operatorname{rank} B) \\le 2$. 6 is the size of the product, not its rank; 12 and 36 are not possible ranks for a 6×6 matrix at all. (This bottleneck is the idea behind LoRA.)',
    difficulty: 'intermediate',
  },
  {
    id: 'linear-algebra-deeper.span-rank-independence.3',
    prompt: 'A 4×4 matrix $A$ has rank 3. Which statement is correct?',
    options: [
      '$\\det A = 0$ and $A$ has no inverse',
      '$\\det A \\neq 0$, but $A$ has no inverse',
      '$A$ has an inverse, because its rank is not 0',
      '$A$ has an inverse, but $\\det A$ is undefined',
    ],
    answer: 0,
    explanation:
      'Rank 3 out of a possible 4 means one dimension is squashed: the columns are dependent, so the matrix is singular, $\\det A = 0$ and no inverse exists. A square matrix is invertible exactly when it has full rank (here 4). Rank above 0 only means the matrix is not the zero matrix, and every square matrix has a determinant.',
    difficulty: 'beginner',
  },
  {
    id: 'linear-algebra-deeper.span-rank-independence.4',
    prompt:
      'A dataset has two features, "temperature from sensor 1" and "temperature from sensor 2", which almost always agree to within 0.01 °C. When you fit linear regression with the normal equation $w = (X^TX)^{-1}X^Ty$, the two weights come out huge and of opposite sign, and they swing wildly if a single data point is changed. What is the best explanation?',
    options: [
      'The two columns are nearly dependent, so $X^TX$ is ill-conditioned with a huge condition number',
      'The two columns are exactly dependent, so $X^TX$ has rank 0 and no solution',
      'The learning rate is too high, so the updates to the weights keep overshooting',
      'The features have very different scales, so one weight has to grow to compensate',
    ],
    answer: 0,
    explanation:
      'Nearly identical columns are nearly dependent: $X^TX$ is invertible but ill-conditioned (huge $\\kappa = \\sigma_{\\max}/\\sigma_{\\min}$), so tiny changes in the data are amplified into large swings of the solution. They are not exactly dependent (and even then the rank would drop to 1, not 0). The normal equation uses no learning rate, and both features are temperatures on the same scale. Dropping one sensor, averaging them or adding ridge regularisation fixes it.',
    difficulty: 'intermediate',
  },
  {
    id: 'linear-algebra-deeper.span-rank-independence.5',
    prompt: 'What does this code print?',
    code: 'import numpy as np\nA = np.array([[1, 2, 3],\n              [4, 5, 6],\n              [5, 7, 9]])\nprint(np.linalg.matrix_rank(A))',
    options: ['`2`', '`3`', '`1`', '`LinAlgError: Singular matrix`'],
    answer: 0,
    explanation:
      'Row 3 is row 1 + row 2: $(1 + 4, 2 + 5, 3 + 6) = (5, 7, 9)$, so only two rows are independent and the rank is 2. Rows 1 and 2 are not multiples of each other, so the rank is not 1. `matrix_rank` works on any matrix, singular or not. `LinAlgError: Singular matrix` comes from routines like `np.linalg.inv` or `solve`, and only when elimination hits an exact zero; for this matrix rounding hides the zero, and `inv` may instead return meaningless numbers around $10^{15}$.',
    difficulty: 'beginner',
  },
]

export default questions
