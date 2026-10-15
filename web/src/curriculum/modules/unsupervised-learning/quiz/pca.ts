import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'unsupervised-learning.pca.1',
    prompt: 'In PCA, the first principal component (PC1) is…',
    options: [
      'the eigenvector of the covariance matrix with the largest eigenvalue',
      'the eigenvector of the covariance matrix with the smallest eigenvalue',
      'the original feature column that has the largest variance',
      'the direction that best separates the classes in the labels',
    ],
    answer: 0,
    explanation:
      'Each eigenvalue is the variance along its eigenvector, so the largest eigenvalue marks the direction of greatest spread: PC1. The smallest eigenvalue gives the direction of least spread (the last component). PCA builds new directions rather than picking an original column, and it never looks at labels.',
    difficulty: 'beginner',
  },
  {
    id: 'unsupervised-learning.pca.2',
    prompt:
      'The covariance matrix of a 4-feature dataset has eigenvalues $5$, $3$, $1.5$ and $0.5$. What is the smallest number of principal components that keeps at least 80% of the variance?',
    options: ['1', '2', '3', '4'],
    answer: 1,
    explanation:
      'The total is $5 + 3 + 1.5 + 0.5 = 10$. PC1 alone keeps $5/10 = 50\\%$; PC1 and PC2 keep $(5 + 3)/10 = 80\\%$, which reaches the target. Three components (95%) also work, but the question asks for the smallest number.',
    difficulty: 'beginner',
  },
  {
    id: 'unsupervised-learning.pca.3',
    prompt:
      'A table has two features: monthly income (from about S\\$2,000 to S\\$15,000) and age (15 to 80 years). You run PCA on the raw numbers without standardising. What will PC1 most likely be?',
    options: [
      'Almost exactly the income axis, since its variance is far larger',
      'Almost exactly the age axis, because age varies more in relative terms than income',
      'The 45° diagonal, because PCA gives both features the same weight',
      'Undefined, because PCA raises an error when features have different units',
    ],
    answer: 0,
    explanation:
      'PCA maximises variance, and income\'s variance (thousands squared, so millions) dwarfs age\'s (hundreds), so PC1 just follows income. PCA does not weigh features equally unless you standardise first, which gives each feature variance 1. It runs happily on any numbers; it simply does not know about units.',
    difficulty: 'intermediate',
  },
  {
    id: 'unsupervised-learning.pca.4',
    prompt: 'What does this code print?',
    code: 'import numpy as np\nfrom sklearn.decomposition import PCA\n\nX = np.random.rand(200, 10)\npca = PCA(n_components=3)\nZ = pca.fit_transform(X)\nprint(Z.shape, pca.components_.shape)',
    options: ['`(200, 3) (3, 10)`', '`(200, 3) (10, 3)`', '`(3, 10) (200, 3)`', '`(200, 10) (3, 10)`'],
    answer: 0,
    explanation:
      '`fit_transform` returns the scores: one row per sample (200) and one column per kept component (3). `components_` stores one component per row, each a direction in the original 10-feature space, so its shape is `(3, 10)`.',
    difficulty: 'intermediate',
  },
  {
    id: 'unsupervised-learning.pca.5',
    prompt:
      'Points lie on a rolled-up sheet in 3-D (a "Swiss roll"). Reducing them to 2-D with PCA makes points from different layers of the roll land on top of each other. Why?',
    options: [
      'PCA is linear, so it can only rotate and flatten the data, not unroll a curve',
      'PCA needs labels to know which layer each point belongs to, and no labels were given',
      'The data was not standardised, so one axis dominated the principal components',
      'PCA can keep only one component when the original data is three-dimensional',
    ],
    answer: 0,
    explanation:
      'Each principal component is a straight direction (a weighted sum of the features), so PCA amounts to rotating the data and flattening it like a shadow, which piles the layers of a roll on top of each other. PCA is unsupervised and never uses labels, and with 3 features it can keep up to 3 components. Non-linear methods such as t-SNE and UMAP are built for curved structure.',
    difficulty: 'intermediate',
  },
]

export default questions
