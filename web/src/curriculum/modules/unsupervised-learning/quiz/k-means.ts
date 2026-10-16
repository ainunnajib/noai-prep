import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'unsupervised-learning.k-means.1',
    prompt: 'In k-means, what does the **update** step do?',
    options: [
      'Moves each centroid to the mean of the points currently assigned to it',
      'Moves each point into the cluster whose centroid is currently nearest to it',
      'Moves each centroid onto the data point that is currently nearest to it',
      'Moves each centroid halfway towards the farthest point in its cluster',
    ],
    answer: 0,
    explanation:
      'The update step recomputes every centroid as the **mean** (average) of its assigned points, which is the spot with the smallest total squared distance to them. Giving each point to its nearest centroid is the other half of the loop, the **assign** step. Snapping a centre onto an actual data point is what k-medoids (a variant whose centres must be real data points) does, not k-means.',
    difficulty: 'beginner',
  },
  {
    id: 'unsupervised-learning.k-means.2',
    prompt:
      'One-dimensional data: $1, 2, 3, 8, 10$. k-means with $k = 2$ starts with centroids at $2$ and $3$. Where are the centroids after **one** assign step and **one** update step?',
    options: ['$1.5$ and $7$', '$2$ and $9$', '$1.5$ and $9$', '$2$ and $7$'],
    answer: 0,
    explanation:
      'Assign: $1$ and $2$ are nearest to $2$; $3$, $8$ and $10$ are nearest to $3$. Update: $(1 + 2) / 2 = 1.5$ and $(3 + 8 + 10) / 3 = 21 / 3 = 7$. The pair $2$ and $9$ is where k-means ends up after a **second** round ($3$ is then closer to $1.5$ than to $7$), not after the first.',
    difficulty: 'intermediate',
  },
  {
    id: 'unsupervised-learning.k-means.3',
    prompt: 'Why can you **not** choose k for k-means by simply picking the k with the smallest inertia?',
    options: [
      'Inertia never rises as k grows and is 0 when every point has its own centroid, so its minimum always picks the largest k',
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
      'A dataset has two true groups: points spread evenly around a ring of radius 5, and a tight blob at the centre of that ring. k-means with $k = 2$ splits the data into a left half and a right half. What is the main reason?',
    options: [
      'k-means cuts the plane with straight lines between centroids, so it cannot separate a ring from the blob it surrounds',
      'The two starting centroids were placed badly; with k-means++ seeding k-means would separate the ring from the blob every time',
      'The value of k is too small; with k = 3 k-means would put the ring into one cluster and the central blob into another',
      'The ring has far more points than the blob, so k-means ignores the blob, which is too small to have a centroid of its own',
    ],
    answer: 0,
    explanation:
      'Every point joins its nearest centroid, so the boundary between two clusters is a straight line halfway between their centroids. No straight line can cut a ring away from the blob it surrounds, so no placement of centroids works: this is a shape problem, not a starting-point or k problem (with k = 3 the ring is still sliced into pieces). A density-based method such as DBSCAN, or spectral clustering, follows the ring instead.',
    difficulty: 'intermediate',
  },
  {
    id: 'unsupervised-learning.k-means.6',
    prompt:
      'You run k-means with $k = 3$ twice on the same data, each time from different random starting centroids. Both runs converge (nothing changes any more), one with inertia 41 and the other with inertia 128. What is the best explanation?',
    options: [
      'The two runs started from different centroids, and the second got stuck in a poorer local minimum',
      'The second run needs more iterations, after which its inertia would keep falling until it reached 41',
      'The assign and update steps are random, so even the same start would give a different result each time',
      'The run with inertia 128 is better, because a higher inertia means more spread-out, distinct clusters',
    ],
    answer: 0,
    explanation:
      'Given its starting centroids, k-means is completely deterministic, and a converged run never changes again, so the gap comes from the starts: the second run began badly (for example with two centroids in one blob) and stopped in a local minimum. That is why libraries use k-means++ seeding and several restarts (`n_init`) and keep the run with the lowest inertia. Lower inertia means tighter clusters, so 41 is the better result.',
    difficulty: 'intermediate',
  },
]

export default questions
