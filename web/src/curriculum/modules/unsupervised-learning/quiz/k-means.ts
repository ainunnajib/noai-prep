import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'unsupervised-learning.k-means.1',
    prompt: 'In K-means, what does the **update** step do?',
    options: [
      'Moves each centroid to the mean of the points currently assigned to it',
      'Moves each point into the cluster whose centroid is currently nearest to it',
      'Moves each centroid onto the data point that is currently nearest to it',
      'Moves each centroid halfway towards the farthest point in its cluster',
    ],
    answer: 0,
    explanation:
      'The update step recomputes every centroid as the **mean** (average) of its assigned points, which is the spot with the smallest total squared distance to them. Giving each point to its nearest centroid is the other half of the loop, the **assign** step. Snapping a centre onto an actual data point is what k-medoids does, not K-means.',
    difficulty: 'beginner',
  },
  {
    id: 'unsupervised-learning.k-means.2',
    prompt:
      'One-dimensional data: $1, 2, 3, 8, 10$. K-means with $k = 2$ starts with centroids at $2$ and $3$. Where are the centroids after **one** assign step and **one** update step?',
    options: ['$1.5$ and $7$', '$2$ and $9$', '$1.5$ and $9$', '$2$ and $7$'],
    answer: 0,
    explanation:
      'Assign: $1$ and $2$ are nearest to $2$; $3$, $8$ and $10$ are nearest to $3$. Update: $(1 + 2) / 2 = 1.5$ and $(3 + 8 + 10) / 3 = 21 / 3 = 7$. The pair $2$ and $9$ is where K-means ends up after a **second** round ($3$ is then closer to $1.5$ than to $7$), not after the first.',
    difficulty: 'intermediate',
  },
  {
    id: 'unsupervised-learning.k-means.3',
    prompt: 'Why can you **not** choose k for K-means by simply picking the k with the smallest inertia?',
    options: [
      'Inertia never increases as k grows and reaches 0 when every point is its own cluster, so the smallest inertia always means the largest k',
      'Inertia changes randomly from run to run, so its smallest value over several k is just noise and cannot be compared fairly',
      'Inertia can only be computed when the true cluster labels are known, and unsupervised data does not come with any labels',
      'Inertia increases as k grows, because every extra centroid adds more squared distances to the total, so it always picks k = 1',
    ],
    answer: 0,
    explanation:
      'An extra centroid can always sit closer to some points, so the best inertia falls (or stays flat) as k grows, down to 0 at $k = n$. Minimising it would always choose the biggest k. Instead look for the **elbow**, where extra clusters stop reducing inertia much. Inertia needs no labels: it uses only the points and their centroids.',
    difficulty: 'beginner',
  },
  {
    id: 'unsupervised-learning.k-means.4',
    prompt: 'What does this code print?',
    code: 'import numpy as np\nX = np.array([[0, 0], [2, 0], [10, 0]])\nC = np.array([[1, 0], [10, 0]])\nlabels = np.array([0, 0, 1])\nprint(((X - C[labels]) ** 2).sum())',
    options: ['`2`', '`[1 1 0]`', '`0`', '`4`'],
    answer: 0,
    explanation:
      '`C[labels]` picks each point\'s own centroid: `[[1,0],[1,0],[10,0]]`. The differences are $(-1,0), (1,0), (0,0)$; squared and summed over everything that gives $1 + 1 + 0 = 2$, the **inertia**. `[1 1 0]` would be the per-point squared distances, which needs `.sum(axis=1)` instead of `.sum()`.',
    difficulty: 'intermediate',
  },
  {
    id: 'unsupervised-learning.k-means.5',
    prompt:
      'A dataset has two true groups: points spread evenly around a ring of radius 5, and a tight blob at the centre of that ring. K-means with $k = 2$ splits the data into a left half and a right half. What is the main reason?',
    options: [
      'Points join the nearest centroid, so K-means can only form round groups split by straight lines, and the ring and blob share a centre',
      'The two starting centroids were placed badly; with k-means++ seeding K-means would separate the ring from the blob every time',
      'The value of k is too small; with k = 3 K-means would put the ring into one cluster and the central blob into another',
      'The ring has far more points than the blob, so K-means ignores the blob, which is too small to have a centroid of its own',
    ],
    answer: 0,
    explanation:
      'K-means describes each cluster only by its centre, and every boundary is a straight line halfway between two centroids. A ring and the blob inside it have the same centre, so no placement of centroids can separate them: this is a shape problem, not a starting-point or k problem. A density-based method such as DBSCAN, or spectral clustering, follows the ring instead.',
    difficulty: 'intermediate',
  },
]

export default questions
