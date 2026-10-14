import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'unsupervised-learning.hierarchical-dbscan-spectral.1',
    prompt:
      'In agglomerative clustering, which linkage is most likely to join two separate groups into one long cluster through a thin line of in-between points ("chaining")?',
    options: [
      'Single linkage, which uses the distance between the closest pair of points',
      'Complete linkage, which uses the distance between the farthest pair of points',
      'Average linkage, which uses the mean distance over all pairs of points',
      'Ward linkage, which uses the smallest increase in within-cluster squared distance',
    ],
    answer: 0,
    explanation:
      'Single linkage needs only **one** close pair to merge two clusters, so a chain of bridge points can link groups that are far apart overall. Complete linkage looks at the farthest pair, so a long straggly cluster has a large distance to everything and resists chaining; average and Ward linkage also favour compact clusters.',
    difficulty: 'intermediate',
  },
  {
    id: 'unsupervised-learning.hierarchical-dbscan-spectral.2',
    prompt:
      'Agglomerative clustering of 6 points makes its 5 merges at heights 1, 2, 3, 7 and 12. You cut the dendrogram with a horizontal line at height 5. How many clusters do you get?',
    options: ['3', '2', '4', '5'],
    answer: 0,
    explanation:
      'Start with 6 clusters; each merge below the cut (heights 1, 2 and 3) reduces the count by one, giving $6 - 3 = 3$. Equivalently, the cut crosses 3 vertical lines of the dendrogram. Answering 2 counts the merges above the cut instead.',
    difficulty: 'beginner',
  },
  {
    id: 'unsupervised-learning.hierarchical-dbscan-spectral.3',
    prompt:
      'DBSCAN runs with eps = 1 and min_samples = 3 (counting the point itself) on the one-dimensional points $0,\\ 0.8,\\ 1.6,\\ 4,\\ 4.5$. What is the point $1.6$?',
    options: [
      'A border point: only 2 points lie within eps of it, but one of them, 0.8, is a core point',
      'A core point: it lies within eps of another point, so its neighbourhood counts as dense',
      'A noise point: fewer than 3 points lie within eps of it, so it cannot join any cluster',
      'A core point: the cluster it ends up in contains 3 points, which meets min_samples',
    ],
    answer: 0,
    explanation:
      'Within 1 of $1.6$ are $0.8$ and $1.6$ itself: 2 points, fewer than 3, so it is not core. But $0.8$ has $0, 0.8, 1.6$ within 1, so $0.8$ **is** core, and $1.6$ joins its cluster as a **border** point. "Noise" forgets the border rule; $4$ and $4.5$ are the real noise points here (2 neighbours each, no core point nearby).',
    difficulty: 'intermediate',
  },
  {
    id: 'unsupervised-learning.hierarchical-dbscan-spectral.4',
    prompt:
      'A delivery company runs DBSCAN on customer GPS locations with eps = 50 m and min_samples = 20. It labels 70% of the customers as noise and finds only a few tiny clusters. Which change is most likely to help?',
    options: [
      'Increase eps (or lower min_samples), so that more points have enough neighbours to be core points',
      'Decrease eps, so that each cluster becomes tighter and the clusters are better separated',
      'Increase min_samples, so that only the truly dense neighbourhoods are allowed to form clusters',
      'Set k to the number of delivery zones first, so that DBSCAN knows how many clusters to find',
    ],
    answer: 0,
    explanation:
      'Too much noise means too few points reach min_samples neighbours within eps. A larger eps or a smaller min_samples makes more points core, so clusters grow and noise shrinks. Decreasing eps or increasing min_samples makes the problem worse, and DBSCAN has no k to set: it finds the number of clusters itself.',
    difficulty: 'intermediate',
  },
  {
    id: 'unsupervised-learning.hierarchical-dbscan-spectral.5',
    prompt:
      'In spectral clustering, the graph Laplacian $L = D - W$ of a similarity graph turns out to have exactly **three** eigenvalues equal to 0. What does this tell you?',
    options: [
      'The similarity graph falls into three separate pieces, with no edges at all between them',
      'Three of the features are constant, so the data really has three fewer useful dimensions',
      'The similarity threshold is so large that every point is joined into one single piece',
      'The data contains exactly three outliers, which spectral clustering will label as noise',
    ],
    answer: 0,
    explanation:
      'The number of zero eigenvalues of a graph Laplacian equals the number of connected pieces of the graph, and each zero-eigenvalue eigenvector is constant on each piece, which is why these eigenvectors reveal clusters. A graph joined into one piece has exactly **one** zero eigenvalue (the constant vector). Spectral clustering does not label noise; DBSCAN does.',
    difficulty: 'advanced',
  },
]

export default questions
