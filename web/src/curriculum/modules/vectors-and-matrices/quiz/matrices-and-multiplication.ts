import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'vectors-and-matrices.matrices-and-multiplication.1',
    prompt:
      'A batch of 32 images is stored as a matrix $X$ of shape $32 \\times 784$ (one flattened image per row). A layer multiplies it by a weight matrix $W$ of shape $784 \\times 128$ (here $W$ is stored as inputs × outputs, so no transpose is needed). What is the shape of $XW$?',
    options: ['$32 \\times 128$', '$784 \\times 784$', '$128 \\times 32$', 'It cannot be computed'],
    answer: 0,
    explanation:
      'Write the shapes side by side: $(32 \\times 784)(784 \\times 128)$. The inner 784s match and cancel, leaving the outer numbers $32 \\times 128$: one row of 128 outputs per image. $128 \\times 32$ would be the shape of the transpose $(XW)^T$.',
    difficulty: 'beginner',
  },
  {
    id: 'vectors-and-matrices.matrices-and-multiplication.2',
    prompt:
      'Let $A = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}$ and $B = \\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}$. What is the matrix product $AB$?',
    options: [
      '$\\begin{bmatrix} 2 & 1 \\\\ 4 & 3 \\end{bmatrix}$',
      '$\\begin{bmatrix} 3 & 4 \\\\ 1 & 2 \\end{bmatrix}$',
      '$\\begin{bmatrix} 0 & 2 \\\\ 3 & 0 \\end{bmatrix}$',
      '$\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}$',
    ],
    answer: 0,
    explanation:
      'Each entry is a row of $A$ times a column of $B$. Row 1 $[1, 2]$ with column 1 $[0, 1]$ gives $0 + 2 = 2$; with column 2 $[1, 0]$ gives $1 + 0 = 1$. Row 2 gives $4$ and $3$. So $AB$ swaps the columns of $A$. The swapped-rows matrix is $BA$ (order matters), and $\\begin{bmatrix} 0 & 2 \\\\ 3 & 0 \\end{bmatrix}$ is the element-wise product.',
    difficulty: 'intermediate',
  },
  {
    id: 'vectors-and-matrices.matrices-and-multiplication.3',
    prompt: 'What does this code print?',
    code: 'import numpy as np\nA = np.array([[1, 2], [3, 4]])\nB = np.array([[2, 0], [0, 2]])\nprint(A * B)',
    options: ['`[[2 0] [0 8]]`', '`[[2 4] [6 8]]`', '`[[3 2] [3 6]]`', 'A `ValueError`, because `*` needs `@` for matrices'],
    answer: 0,
    explanation:
      '`*` is element-wise: it multiplies entries in the same position, $1 \\times 2 = 2$, $2 \\times 0 = 0$, $3 \\times 0 = 0$, $4 \\times 2 = 8$. The matrix product `A @ B` would give `[[2 4] [6 8]]` (every entry doubled). Both shapes are 2×2, so `*` runs without any error.',
    difficulty: 'intermediate',
  },
  {
    id: 'vectors-and-matrices.matrices-and-multiplication.4',
    prompt: 'For matrices $A$ and $B$ whose product $AB$ exists, which expression always equals $(AB)^T$?',
    options: ['$B^T A^T$', '$A^T B^T$', '$BA$', '$(BA)^T$'],
    answer: 0,
    explanation:
      'Transposing a product reverses the order: $(AB)^T = B^T A^T$, like taking off shoes before socks. Check with shapes: if $A$ is $2 \\times 3$ and $B$ is $3 \\times 4$, then $(AB)^T$ is $4 \\times 2$ and $B^T A^T = (4 \\times 3)(3 \\times 2) = 4 \\times 2$, while $A^T B^T = (3 \\times 2)(4 \\times 3)$ does not even exist.',
    difficulty: 'intermediate',
  },
  {
    id: 'vectors-and-matrices.matrices-and-multiplication.5',
    prompt: '$A$ is a $2 \\times 3$ matrix and $B$ is a $3 \\times 2$ matrix. Which statement is true?',
    options: [
      '$AB$ is $2 \\times 2$ and $BA$ is $3 \\times 3$, so they cannot be equal',
      '$AB$ and $BA$ are both $2 \\times 2$ but usually have different entries',
      '$AB$ exists but $BA$ does not, because the inner sizes of $BA$ differ',
      '$AB = BA$, because swapping the order of a product never changes it',
    ],
    answer: 0,
    explanation:
      '$(2 \\times 3)(3 \\times 2) = 2 \\times 2$ and $(3 \\times 2)(2 \\times 3) = 3 \\times 3$: both exist, but they have different shapes. Matrix multiplication is not commutative. For $BA$ the inner sizes are 2 and 2, which do match, so it does exist.',
    difficulty: 'beginner',
  },
]

export default questions
