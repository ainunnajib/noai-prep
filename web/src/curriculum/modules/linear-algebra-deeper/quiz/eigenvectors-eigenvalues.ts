import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'linear-algebra-deeper.eigenvectors-eigenvalues.1',
    prompt: 'For a square matrix $A$ and the vector $v = [1, 2]$, you find that $Av = [-3, -6]$. What can you conclude?',
    options: [
      '$v$ is an eigenvector of $A$ with eigenvalue $-3$',
      '$v$ is not an eigenvector, because $Av$ points the opposite way to $v$',
      '$v$ is an eigenvector of $A$ with eigenvalue $3$',
      '$v$ is an eigenvector of $A$ with eigenvalue $-\\tfrac{1}{3}$',
    ],
    answer: 0,
    explanation:
      '$[-3, -6] = -3 \\times [1, 2]$, so $Av = \\lambda v$ with $\\lambda = -3$. Pointing backwards along the same line still counts: a negative eigenvalue is a flip, not a turn. Answering 3 drops the sign, and $-\\tfrac13$ divides the wrong way round ($v$ divided by $Av$).',
    difficulty: 'beginner',
  },
  {
    id: 'linear-algebra-deeper.eigenvectors-eigenvalues.2',
    prompt: 'What are the eigenvalues of $\\begin{bmatrix} 5 & 3 \\\\ 0 & -2 \\end{bmatrix}$?',
    options: ['$5$ and $-2$', '$5$ and $3$', '$3$ and $-10$', '$2$ and $-5$'],
    answer: 0,
    explanation:
      'The matrix is triangular (zero below the diagonal), so its eigenvalues are its diagonal entries, 5 and $-2$. Check: their sum $3$ is the trace and their product $-10$ is the determinant $5 \\times (-2) - 3 \\times 0$. The pair 3 and $-10$ is the trace and determinant themselves, not the eigenvalues; 5 and 3 just reads the top row.',
    difficulty: 'beginner',
  },
  {
    id: 'linear-algebra-deeper.eigenvectors-eigenvalues.3',
    prompt: 'What does this code print?',
    code: 'import numpy as np\nA = np.array([[4, 1],\n              [2, 3]])\nvals = np.linalg.eigvals(A).real\ns, p = vals.sum(), vals.prod()\nprint(round(s), round(p))',
    options: ['`7 10`', '`7 12`', '`10 7`', '`5 2`'],
    answer: 0,
    explanation:
      'No need to find the eigenvalues: their sum is the trace, $4 + 3 = 7$, and their product is the determinant, $4 \\times 3 - 1 \\times 2 = 10$. (The eigenvalues are in fact 5 and 2.) `7 12` forgets to subtract $bc$ in the determinant, `10 7` swaps the two numbers, and `5 2` prints the eigenvalues instead of their sum and product.',
    difficulty: 'intermediate',
  },
  {
    id: 'linear-algebra-deeper.eigenvectors-eigenvalues.4',
    prompt: 'A 3×3 matrix $W$ has eigenvalues $2$, $0.5$ and $0$. Which statement must be true?',
    options: [
      '$W$ has no inverse: some non-zero vector is sent to the zero vector',
      '$W$ is invertible, because two of its three eigenvalues are non-zero',
      '$\\det W = 2.5$, because the determinant is the sum of the eigenvalues',
      '$W$ must contain a row of zeros, because one eigenvalue is zero',
    ],
    answer: 0,
    explanation:
      'The determinant is the product of the eigenvalues, $2 \\times 0.5 \\times 0 = 0$, so $W$ is singular. Geometrically, the eigenvector $v$ for $\\lambda = 0$ satisfies $Wv = 0$: a whole direction is squashed flat, so it cannot be undone. One zero is enough. $2.5$ is the sum, which is the trace, and a singular matrix need not have a zero row: $\\begin{bmatrix} 1 & 1 \\\\ 1 & 1 \\end{bmatrix}$ is singular too.',
    difficulty: 'intermediate',
  },
  {
    id: 'linear-algebra-deeper.eigenvectors-eigenvalues.5',
    prompt:
      'A simple recurrent network (ignore its activation function) multiplies its hidden state by the same 2×2 matrix $W$ at each of 40 time steps. $W$ has eigenvalues $1.2$ and $0.5$. Starting from a typical hidden state, what happens?',
    options: [
      'Its length grows roughly like $1.2^{40}$ and it lines up with the eigenvector for $1.2$',
      'Its length shrinks towards 0, because $\\det W = 1.2 \\times 0.5 = 0.6$ is less than 1',
      'Its length shrinks towards 0 and it lines up with the eigenvector for $0.5$, because the smaller eigenvalue wins',
      'Its length stays about the same, because one eigenvalue is above 1 and the other is below 1',
    ],
    answer: 0,
    explanation:
      'Split the state into its parts along the two eigenvectors. After 40 steps they have been scaled by $1.2^{40} \\approx 1470$ and $0.5^{40} \\approx 10^{-12}$, so the first part completely dominates: the state explodes along that eigenvector (an exploding signal). A determinant below 1 only means that areas shrink, because one direction is squashed hard; a single vector can still grow along the other direction.',
    difficulty: 'advanced',
  },
]

export default questions
