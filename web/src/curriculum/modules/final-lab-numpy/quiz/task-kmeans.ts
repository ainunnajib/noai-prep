import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'final-lab-numpy.task-kmeans.1',
    prompt:
      'You run the task\'s `k_means_clustering` with points `[(0, 0), (2, 0), (6, 0), (6, 4)]`, `k = 2`, `initial_centroids = [(0, 0), (6, 0)]` and `max_iterations = 10`. What does it return?',
    options: ['`[(1.0, 0.0), (6.0, 2.0)]`', '`[(6.0, 2.0), (1.0, 0.0)]`', '`[(2.6667, 0.0), (6.0, 4.0)]`', '`[(0.0, 0.0), (6.0, 0.0)]`'],
    answer: 0,
    explanation:
      'Assign: (0, 0) and (2, 0) are nearer (0, 0); (6, 0) and (6, 4) are nearer (6, 0) (for (6, 4): 4 versus $\\sqrt{52} \\approx 7.2$). Update: C1 = mean of (0, 0), (2, 0) = (1, 0); C2 = mean of (6, 0), (6, 4) = (6, 2). Next round nobody switches, so it stops. The order stays tied to `initial_centroids`, so C1 comes first.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-numpy.task-kmeans.2',
    prompt: 'No point is assigned to cluster 1. What does this print?',
    code: 'points = np.array([[2, 4], [2, 8], [10, 0]])\nlabels = np.array([0, 0, 0])\nprint(points[labels == 1].mean(axis=0))',
    options: [
      '`[nan nan]`, with a "Mean of empty slice" warning',
      '`[0. 0.]`, because an empty sum counts as zero',
      '`ZeroDivisionError`, which stops the program',
      '`IndexError`, because there is no row for cluster 1',
    ],
    answer: 0,
    explanation:
      'The mask selects zero rows, an array of shape (0, 2). Its mean is 0/0 for each column, which NumPy turns into `nan` with a warning instead of an error, so the bug can go unnoticed. That is why the update needs a guard such as `if len(members) > 0`, keeping the old centroid otherwise.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-numpy.task-kmeans.3',
    prompt: 'With NumPy 2, what does this print?',
    code: 'c = np.array([2, 22 / 3])\nprint([tuple(round(float(v), 4) for v in c)])',
    options: ['`[(2.0, 7.3333)]`', '`[(np.float64(2.0), np.float64(7.3333))]`', '`[(2, 7.3333)]`', '`[array([2.    , 7.3333])]`'],
    answer: 0,
    explanation:
      '`float(v)` turns each NumPy number into a plain Python float, so the tuple prints as `(2.0, 7.3333)`: `np.array` made the 2 a float already, and `round(..., 4)` keeps 4 decimals of 7.333…. Without `float()`, NumPy 2 shows `np.float64(...)` around each value, which is the same number but not the same output text.',
    difficulty: 'beginner',
  },
  {
    id: 'final-lab-numpy.task-kmeans.4',
    prompt:
      'The official 2025 solution rounded the centroids to 4 d.p. at the end of every iteration, then tested `np.all(centroids == new_centroids)` to stop early. On the exam data the loop always ran all 10 iterations. Why?',
    options: [
      'It compared rounded old centroids with unrounded new ones, so they never matched',
      'The centroids kept moving slightly until the tenth iteration on the exam data',
      'Ten iterations is the minimum k-means needs, so an earlier stop is never allowed',
      'The `==` operator always returns False when it compares two float arrays',
    ],
    answer: 0,
    explanation:
      'After rounding, the old centroid is 7.3333 while the new mean is 7.333333…, so `==` is False every time even though nothing is moving: the algorithm had converged after 2 iterations. The answer was still right, only slower. Rounding once on return and comparing with `np.allclose` avoids the problem.',
    difficulty: 'advanced',
  },
  {
    id: 'final-lab-numpy.task-kmeans.5',
    prompt:
      'In the vectorised version, row $i$ of the distance matrix `D` holds point $i$\'s distances to the 2 centroids. If `D = np.array([[2.0, 8.5], [6.0, 10.6], [8.0, 1.0]])`, what is `D.argmin(axis=1)`?',
    options: ['`[0 0 1]`', '`[0 2]`', '`[1 1 0]`', '`[2. 6. 1.]`'],
    answer: 0,
    explanation:
      '`axis=1` looks along each row and returns the **column index** of the smallest value: 2.0 is in column 0, 6.0 in column 0, 1.0 in column 1. So points 0 and 1 join cluster 0 and point 2 joins cluster 1. `axis=0` would compare down the columns (giving `[0 2]`), and `D.min(axis=1)` would return the distances themselves.',
    difficulty: 'intermediate',
  },
]

export default questions
