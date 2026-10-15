import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'linear-algebra-deeper.covariance-pca-svd.1',
    prompt:
      'The covariance matrix of two features, height (cm) and mass (kg), is $\\begin{bmatrix} 49 & 21 \\\\ 21 & 16 \\end{bmatrix}$, with height first. Which statement is correct?',
    options: [
      'The variance of height is 49, and height and mass tend to rise together',
      'The standard deviation of height is 49, and height and mass tend to rise together',
      'The variance of height is 49, and the correlation between height and mass is 21',
      'The variance of height is 49, and height and mass tend to move in opposite directions',
    ],
    answer: 0,
    explanation:
      'The diagonal holds the variances (so the standard deviation of height is $\\sqrt{49} = 7$), and the off-diagonal holds the covariance. It is positive, so taller people tend to be heavier. 21 is a covariance, not a correlation: the correlation is $\\frac{21}{7 \\times 4} = 0.75$, and correlations always lie between $-1$ and 1.',
    difficulty: 'beginner',
  },
  {
    id: 'linear-algebra-deeper.covariance-pca-svd.2',
    prompt:
      'PCA on a dataset with 3 features finds covariance eigenvalues 6, 3 and 1. If you keep the first two principal components, what fraction of the total variance do you keep?',
    options: ['90%', '60%', '67%', '30%'],
    answer: 0,
    explanation:
      'Each eigenvalue is the variance along its component, and the total is $6 + 3 + 1 = 10$ (the trace of the covariance matrix). Keeping PC1 and PC2 keeps $\\frac{6 + 3}{10} = 90\\%$. 60% is PC1 alone, 30% is PC2 alone, and 67% just counts components (2 of 3) instead of weighing them by variance.',
    difficulty: 'beginner',
  },
  {
    id: 'linear-algebra-deeper.covariance-pca-svd.3',
    prompt: 'What does this code print?',
    code: 'import numpy as np\nA = np.array([[3, 0],\n              [0, -2]])\ns = np.linalg.svd(A, compute_uv=False)\nprint(s)',
    options: ['`[3. 2.]`', '`[ 3. -2.]`', '`[-2.  3.]`', '`[9. 4.]`'],
    answer: 0,
    explanation:
      'With `compute_uv=False` NumPy returns only the singular values. They are never negative and are sorted from largest to smallest. This matrix stretches x by 3 and y by 2 with a flip; the minus sign is absorbed by one of the orthogonal factors (here NumPy puts it in $V^T$), so the stretches are 3 and 2. `[ 3. -2.]` gives the eigenvalues instead, and `[9. 4.]` gives the eigenvalues of $A^TA$ without taking square roots.',
    difficulty: 'intermediate',
  },
  {
    id: 'linear-algebra-deeper.covariance-pca-svd.4',
    prompt: '$Q$ is a 2×2 orthogonal matrix and $x = [6, 8]$. What is $\\lVert Qx \\rVert$?',
    options: [
      '10, because $Q^TQ = I$ means $Q$ keeps every length',
      '100, because $\\lVert Qx \\rVert = x^TQ^TQx = x^Tx$',
      'It cannot be found without knowing the entries of $Q$',
      '10 if $Q$ is a rotation, but a different value if $Q$ is a reflection',
    ],
    answer: 0,
    explanation:
      '$\\lVert Qx \\rVert^2 = x^TQ^TQx = x^Tx = 36 + 64 = 100$, so $\\lVert Qx \\rVert = 10 = \\lVert x \\rVert$, whatever the entries of $Q$. 100 is the squared length: the square root was forgotten. Reflections are orthogonal too, and they keep lengths just as rotations do.',
    difficulty: 'intermediate',
  },
  {
    id: 'linear-algebra-deeper.covariance-pca-svd.5',
    prompt:
      'A tiny layer has weight matrix $W = \\begin{bmatrix} 2 & -1 \\\\ -2 & 4 \\end{bmatrix}$. Weight decay penalises the size of $W$ using its Frobenius norm. What is $\\lVert W \\rVert_F$?',
    options: ['5', '25', '3', '4'],
    answer: 0,
    explanation:
      'Square every entry, add, then take the square root: $\\sqrt{4 + 1 + 4 + 16} = \\sqrt{25} = 5$. 25 is $\\lVert W \\rVert_F^2$: the square root was skipped (weight decay does add this squared value to the loss, but the question asks for the norm). 3 is the plain sum of the entries, and 4 is the largest entry.',
    difficulty: 'beginner',
  },
  {
    id: 'linear-algebra-deeper.covariance-pca-svd.6',
    prompt: 'Gram–Schmidt turns the columns of a square matrix $A$ with independent columns into $A = QR$. Which statement is true?',
    options: [
      '$Q$ has perpendicular unit columns and $R$ is upper triangular',
      '$Q$ is upper triangular and $R$ has perpendicular unit columns',
      '$Q$ and $R$ are both diagonal, holding the lengths of the columns',
      '$Q$ is the transpose of $A$ and $R$ is the identity matrix',
    ],
    answer: 0,
    explanation:
      '$Q$ collects the straightened columns $q_1, q_2, \\dots$ (perpendicular, length 1), so $Q^TQ = I$. $R$ records how to rebuild each column of $A$ from them: $a_1$ uses only $q_1$, $a_2$ uses $q_1$ and $q_2$, and so on, which is why $R$ is upper triangular. Its diagonal holds the lengths found along the way, starting with $\\lVert a_1 \\rVert$. Swapping the roles of $Q$ and $R$ is the classic trap, and diagonal factors could only stretch the axes, never straighten slanted columns.',
    difficulty: 'beginner',
  },
]

export default questions
