import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'linear-algebra-deeper.covariance-and-pca.1',
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
    id: 'linear-algebra-deeper.covariance-and-pca.2',
    prompt:
      'PCA on a dataset with 3 features finds covariance eigenvalues 6, 3 and 1. If you keep the first two principal components, what fraction of the total variance do you keep?',
    options: ['90%', '60%', '67%', '30%'],
    answer: 0,
    explanation:
      'Each eigenvalue is the variance along its component, and the total is $6 + 3 + 1 = 10$ (the trace of the covariance matrix). Keeping PC1 and PC2 keeps $\\frac{6 + 3}{10} = 90\\%$. 60% is PC1 alone, 30% is PC2 alone, and 67% just counts components (2 of 3) instead of weighing them by variance.',
    difficulty: 'beginner',
  },
  {
    id: 'linear-algebra-deeper.covariance-and-pca.3',
    prompt:
      'A dataset has two features: monthly income in dollars (variance about 4,000,000) and age in years (variance about 100). You run PCA without standardising. Where does PC1 point?',
    options: [
      'Almost exactly along income, because its variance is far larger',
      'Almost exactly along age, because its smaller numbers are more precise',
      'Along the diagonal, because PCA gives every feature an equal say',
      'Nowhere in particular: PCA ignores the units of the features',
    ],
    answer: 0,
    explanation:
      'PC1 is the direction of greatest variance, and in raw units income\'s variance is 40,000 times age\'s, so PC1 lines up with income just because of the units. That is why features in different units are standardised (turned into z-scores) before PCA. PCA does not weigh features equally or ignore units; it only sees the numbers.',
    difficulty: 'beginner',
  },
  {
    id: 'linear-algebra-deeper.covariance-and-pca.4',
    prompt: 'PC1 is the unit vector $(0.6, 0.8)$. What is the PC1 score of the centred point $x = (5, 0)$?',
    options: ['3', '5', '4', '0.6'],
    answer: 0,
    explanation:
      'A score is the shadow on the line, the dot product $z = \\text{PC1} \\cdot x = 0.6 \\times 5 + 0.8 \\times 0 = 3$. 5 is the length of $x$ itself, 4 uses the second entry of PC1 by mistake ($0.8 \\times 5$), and 0.6 is just the first entry of PC1.',
    difficulty: 'beginner',
  },
  {
    id: 'linear-algebra-deeper.covariance-and-pca.5',
    prompt: 'A dataset has 500 rows (examples) and 20 features. What is the shape of its covariance matrix $C = \\frac1n X_c^T X_c$?',
    options: ['20 × 20', '500 × 500', '500 × 20', '20 × 500'],
    answer: 0,
    explanation:
      '$X_c$ is $500 \\times 20$, so $X_c^T X_c$ is $(20 \\times 500)(500 \\times 20) = 20 \\times 20$: one row and one column per feature, holding every pair of features. $500 \\times 500$ is $X_c X_c^T$, which compares examples, not features.',
    difficulty: 'beginner',
  },
]

export default questions
