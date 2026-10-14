import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'vectors-and-matrices.dot-product-and-norms.1',
    prompt: 'What is the dot product of $[2, -1, 3]$ and $[1, 4, 2]$?',
    options: ['$4$', '$12$', '$-4$', '$[2, -4, 6]$'],
    answer: 0,
    explanation:
      'Multiply matching components and add: $2 \\times 1 + (-1) \\times 4 + 3 \\times 2 = 2 - 4 + 6 = 4$. Ignoring the minus sign gives $2 + 4 + 6 = 12$. $[2, -4, 6]$ is the element-wise product before the adding step, and a dot product is always a single number.',
    difficulty: 'beginner',
  },
  {
    id: 'vectors-and-matrices.dot-product-and-norms.2',
    prompt: 'What does this code print?',
    code: 'import numpy as np\nv = np.array([-6, 8])\nprint(np.abs(v).sum(), np.linalg.norm(v))',
    options: ['`14 10.0`', '`2 10.0`', '`14 100.0`', '`10.0 14`'],
    answer: 0,
    explanation:
      'The first value is the L1 norm: $|-6| + |8| = 6 + 8 = 14$. The second is the L2 norm: $\\sqrt{36 + 64} = \\sqrt{100} = 10$, printed as the float `10.0`. `2` forgets the absolute value ($-6 + 8$), and `100.0` forgets the square root.',
    difficulty: 'beginner',
  },
  {
    id: 'vectors-and-matrices.dot-product-and-norms.3',
    prompt: 'What is the cosine similarity of $\\mathbf{a} = [2, 1]$ and $\\mathbf{b} = [-4, -2]$?',
    options: ['$-1$', '$1$', '$0$', '$-10$'],
    answer: 0,
    explanation:
      '$\\mathbf{b} = -2\\mathbf{a}$, so $\\mathbf{b}$ points in exactly the opposite direction and the cosine similarity is $-1$. Check: $\\mathbf{a} \\cdot \\mathbf{b} = -8 - 2 = -10$, and $\\lVert \\mathbf{a} \\rVert \\lVert \\mathbf{b} \\rVert = \\sqrt{5} \\times \\sqrt{20} = 10$, so $-10/10 = -1$. $-10$ is the dot product, which is not limited to $[-1, 1]$; cosine similarity is.',
    difficulty: 'beginner',
  },
  {
    id: 'vectors-and-matrices.dot-product-and-norms.4',
    prompt: 'Two non-zero vectors $\\mathbf{a}$ and $\\mathbf{b}$ have $\\mathbf{a} \\cdot \\mathbf{b} = 0$. Which statement must be true?',
    options: [
      'The angle between them is 90°',
      'They point in opposite directions',
      'They have the same length',
      'Their cosine similarity is $-1$',
    ],
    answer: 0,
    explanation:
      'Since $\\mathbf{a} \\cdot \\mathbf{b} = \\lVert \\mathbf{a} \\rVert \\lVert \\mathbf{b} \\rVert \\cos\\theta$ and neither length is 0, the dot product can only be 0 if $\\cos\\theta = 0$, i.e. $\\theta = 90°$: the vectors are orthogonal. Opposite directions give a negative dot product and a cosine of $-1$, not 0. The lengths can be anything.',
    difficulty: 'beginner',
  },
  {
    id: 'vectors-and-matrices.dot-product-and-norms.5',
    prompt:
      'A search engine stores each document as a vector of word counts. Document Q is document P copied out 10 times, so every count in Q is 10 times the count in P. Which statement is correct?',
    options: [
      'Their cosine similarity is 1, even though the Euclidean distance between them is large',
      'Their cosine similarity is 0.1, because Q is 10 times longer than P',
      'Their Euclidean distance is 0, because they contain exactly the same words',
      'Their dot product is 1, because the two vectors point the same way',
    ],
    answer: 0,
    explanation:
      '$\\mathbf{q} = 10\\mathbf{p}$ points in exactly the same direction as $\\mathbf{p}$, and cosine similarity only measures direction, so it is 1. The Euclidean distance $\\lVert \\mathbf{q} - \\mathbf{p} \\rVert = \\lVert 9\\mathbf{p} \\rVert = 9\\lVert \\mathbf{p} \\rVert$ is large, which is exactly why search systems prefer cosine for comparing texts of different lengths. The dot product is $10\\lVert \\mathbf{p} \\rVert^2$, not 1.',
    difficulty: 'intermediate',
  },
]

export default questions
