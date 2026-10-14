import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'vectors-and-matrices.identity-inverse-determinant.1',
    prompt: 'What is $\\det \\begin{bmatrix} 3 & 2 \\\\ 1 & 4 \\end{bmatrix}$?',
    options: ['10', '14', '2', '−10'],
    answer: 0,
    explanation:
      'For $\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$ the determinant is $ad - bc = 3 \\times 4 - 2 \\times 1 = 12 - 2 = 10$. Adding the two products gives 14, multiplying along the rows ($3 \\times 2 - 1 \\times 4$) gives 2, and subtracting the wrong way round gives −10.',
    difficulty: 'beginner',
  },
  {
    id: 'vectors-and-matrices.identity-inverse-determinant.2',
    prompt: 'What is the inverse of $A = \\begin{bmatrix} 2 & 1 \\\\ 1 & 1 \\end{bmatrix}$?',
    options: [
      '$\\begin{bmatrix} 1 & -1 \\\\ -1 & 2 \\end{bmatrix}$',
      '$\\begin{bmatrix} 1 & 1 \\\\ 1 & 2 \\end{bmatrix}$',
      '$\\begin{bmatrix} 2 & -1 \\\\ -1 & 1 \\end{bmatrix}$',
      '$\\begin{bmatrix} \\tfrac12 & 1 \\\\ 1 & 1 \\end{bmatrix}$',
    ],
    answer: 0,
    explanation:
      '$\\det A = 2 \\times 1 - 1 \\times 1 = 1$. Swap $a$ and $d$, negate $b$ and $c$, divide by 1: $\\begin{bmatrix} 1 & -1 \\\\ -1 & 2 \\end{bmatrix}$. Check: row 1 of $A$ times column 1 is $2 - 1 = 1$ and times column 2 is $-2 + 2 = 0$. Forgetting the minus signs or the swap gives the other matrices, and taking $1/\\text{entry}$ is not an inverse at all.',
    difficulty: 'intermediate',
  },
  {
    id: 'vectors-and-matrices.identity-inverse-determinant.3',
    prompt: 'What happens when this code runs?',
    code: 'import numpy as np\nA = np.array([[1., 2.], [2., 4.]])\nprint(np.linalg.inv(A))',
    options: [
      'It raises a `LinAlgError`, because $\\det A = 0$ so $A$ has no inverse',
      'It prints `[[ 4. -2.] [-2.  1.]]`, the inverse of $A$',
      'It prints `[[1.   0.5 ] [0.5  0.25]]`, one over each entry',
      'It prints the identity matrix, because $A$ is symmetric',
    ],
    answer: 0,
    explanation:
      '$\\det A = 1 \\times 4 - 2 \\times 2 = 0$: the second column is twice the first, so $A$ squashes the plane onto a line and is singular. NumPy stops with `LinAlgError: Singular matrix`. `[[4, -2], [-2, 1]]` is the swap-and-negate step without dividing by the determinant, which here would mean dividing by 0.',
    difficulty: 'intermediate',
  },
  {
    id: 'vectors-and-matrices.identity-inverse-determinant.4',
    prompt:
      'A data scientist computes the $3 \\times 3$ covariance matrix $\\Sigma$ of three features: height, weight and age. Entry $\\Sigma_{13}$ (height with age) is $0.8$. What is entry $\\Sigma_{31}$?',
    options: ['$0.8$, because a covariance matrix is symmetric', '$-0.8$, because the order of the features is reversed', '$1.25$, because $\\Sigma_{31}$ is the reciprocal of $\\Sigma_{13}$', 'It cannot be known without the original data'],
    answer: 0,
    explanation:
      'The covariance of height with age is the same number as the covariance of age with height, so $\\Sigma_{ij} = \\Sigma_{ji}$ for every pair: covariance matrices are always symmetric ($\\Sigma = \\Sigma^T$). Swapping the order of a covariance never changes its sign, and reciprocals have nothing to do with transposes.',
    difficulty: 'beginner',
  },
  {
    id: 'vectors-and-matrices.identity-inverse-determinant.5',
    prompt: 'For the $3 \\times 3$ identity matrix $I_3$, what are its determinant and its trace?',
    options: ['$\\det = 1$ and $\\operatorname{tr} = 3$', '$\\det = 1$ and $\\operatorname{tr} = 1$', '$\\det = 3$ and $\\operatorname{tr} = 3$', '$\\det = 0$ and $\\operatorname{tr} = 3$'],
    answer: 0,
    explanation:
      'The identity changes nothing, so it scales volumes by 1: $\\det I_3 = 1$ (for a diagonal matrix, multiply the diagonal: $1 \\times 1 \\times 1$). The trace adds the diagonal: $1 + 1 + 1 = 3$. Mixing up "add the diagonal" (trace) with "multiply the diagonal" (determinant of a diagonal matrix) gives the wrong pairs.',
    difficulty: 'beginner',
  },
]

export default questions
