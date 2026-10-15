import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'prelim-speed-toolkit.drill-linear-algebra.1',
    prompt: '$A$ is $4 \\times 2$, $B$ is $4 \\times 3$ and $C$ is $3 \\times 5$. What is the shape of $A^\\top B C$?',
    options: ['$2 \\times 5$', '$4 \\times 5$', '$2 \\times 3$', 'It cannot be multiplied'],
    answer: 0,
    explanation:
      'Flip the transpose first: $A^\\top$ is $2 \\times 4$. Then $(2 \\times 4)(4 \\times 3)(3 \\times 5)$: the touching pairs $4 = 4$ and $3 = 3$ match, and the ends give $2 \\times 5$. Forgetting the transpose makes it look like $(4 \\times 2)(4 \\times 3)$, which wrongly suggests "cannot be multiplied".',
    difficulty: 'beginner',
  },
  {
    id: 'prelim-speed-toolkit.drill-linear-algebra.2',
    prompt: 'What does this code print?',
    code: 'import numpy as np\na = np.array([2, -1, 3])\nb = np.array([4, 5, -2])\nprint(a @ b, np.abs(a).sum())',
    options: ['`-3 6`', '`-3 4`', '`19 6`', '`3 6`'],
    answer: 0,
    explanation:
      'Running total for the dot product: $2 \\times 4 = 8$, then $8 + (-1)(5) = 3$, then $3 + 3 \\times (-2) = -3$. `np.abs(a).sum()` is the L1 norm, $2 + 1 + 3 = 6$. 19 comes from dropping every minus sign in the products ($8 + 5 + 6$), and 4 from adding the entries of `a` with their signs ($2 - 1 + 3$).',
    difficulty: 'beginner',
  },
  {
    id: 'prelim-speed-toolkit.drill-linear-algebra.3',
    prompt: 'What is the length (L2 norm) of $v = [12, 4, -3]$?',
    options: ['13', '19', '169', '$\\sqrt{13}$'],
    answer: 0,
    explanation:
      'Spot the hidden triples: $3, 4 \\to 5$ (a 3-4-5 triangle), then $5, 12 \\to 13$. Check: $144 + 16 + 9 = 169 = 13^2$. 19 is the L1 norm, 169 is the squared length, and the sign of $-3$ does not matter because it is squared.',
    difficulty: 'intermediate',
  },
  {
    id: 'prelim-speed-toolkit.drill-linear-algebra.4',
    prompt: 'A $2 \\times 2$ matrix has trace 6 and determinant 8. What are its eigenvalues?',
    options: ['4 and 2', '6 and 8', '8 and −2', '3 and 3'],
    answer: 0,
    explanation:
      'The eigenvalues add to the trace and multiply to the determinant: $4 + 2 = 6$ and $4 \\times 2 = 8$. "6 and 8" just repeats the trace and determinant; $8 + (-2) = 6$ but $8 \\times (-2) = -16$; and $3 \\times 3 = 9$, not 8.',
    difficulty: 'intermediate',
  },
  {
    id: 'prelim-speed-toolkit.drill-linear-algebra.5',
    prompt:
      'A model needs to invert one of these $2 \\times 2$ matrices. Which one has no inverse?',
    options: [
      '$\\begin{bmatrix} 2 & 6 \\\\ 3 & 9 \\end{bmatrix}$',
      '$\\begin{bmatrix} 2 & 6 \\\\ 3 & 8 \\end{bmatrix}$',
      '$\\begin{bmatrix} 6 & 2 \\\\ 3 & 9 \\end{bmatrix}$',
      '$\\begin{bmatrix} 2 & 3 \\\\ 6 & 8 \\end{bmatrix}$',
    ],
    answer: 0,
    explanation:
      'A matrix is singular (no inverse) when $\\det = ad - bc = 0$, that is when the two diagonal products match. $2 \\times 9 = 18 = 6 \\times 3$, so the first is singular: its second column is 3 times its first. The others give $16 - 18 = -2$, $54 - 6 = 48$ and $16 - 18 = -2$, all non-zero.',
    difficulty: 'intermediate',
  },
]

export default questions
