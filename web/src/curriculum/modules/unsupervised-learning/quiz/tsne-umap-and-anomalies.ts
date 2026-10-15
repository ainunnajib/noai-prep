import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'unsupervised-learning.tsne-umap-and-anomalies.1',
    prompt: 'What does t-SNE mainly try to preserve when it maps high-dimensional data to 2-D?',
    options: [
      'Which points are close neighbours of each other',
      'The distances between clusters of points',
      'The directions along which the variance is largest',
      'The class labels attached to each point',
    ],
    answer: 0,
    explanation:
      't-SNE turns distances into neighbour probabilities and moves map points so that close neighbours stay close: it preserves local neighbourhoods. Gaps between clusters are not reliably preserved. Directions of greatest variance are what PCA keeps, and t-SNE is unsupervised, so it never uses labels.',
    difficulty: 'beginner',
  },
  {
    id: 'unsupervised-learning.tsne-umap-and-anomalies.2',
    prompt:
      'You run t-SNE on 500 points drawn from a single random Gaussian blob (no real groups). At perplexity 2 the map shows several small, separate clumps. What is the best explanation?',
    options: [
      'Each point looks at so few neighbours that chance gaps become fake clusters',
      'The blob really contains several clusters, which a low perplexity is best at revealing',
      'Perplexity 2 tells t-SNE to keep only 2 dimensions, which splits the blob apart',
      'The clumps are the 2 principal components that t-SNE computes before drawing',
    ],
    answer: 0,
    explanation:
      'Perplexity is roughly the number of neighbours each point considers. At 2, each point cares only about its one or two nearest neighbours, so chance gaps in random data get exaggerated into clumps. Perplexity has nothing to do with the number of dimensions, and the data was generated with no groups at all. Always try several perplexities before believing a cluster.',
    difficulty: 'intermediate',
  },
  {
    id: 'unsupervised-learning.tsne-umap-and-anomalies.3',
    prompt:
      'A t-SNE map shows three clusters. A and B look the same size, and C is drawn three times farther from A than B is. Which conclusion is justified?',
    options: [
      'Points drawn right next to each other were close neighbours in the original data',
      'A and B have about the same spread in the original high-dimensional data',
      'C is about three times more different from A than B is in the original data',
      'The original data contains exactly three natural groups of similar size',
    ],
    answer: 0,
    explanation:
      'Only who sits right next to whom is trustworthy in a t-SNE map: two points at opposite ends of one big cluster need not have been close. Each point\'s bell-curve width adapts to local density, so dense and sparse clusters come out a similar size, and gaps between clusters are not preserved. Even the number of clusters can change with perplexity or random seed.',
    difficulty: 'intermediate',
  },
  {
    id: 'unsupervised-learning.tsne-umap-and-anomalies.4',
    prompt: 'A student wants to use the 2-D t-SNE coordinates of each training image as input features for a classifier. Why is this usually a bad idea?',
    options: [
      't-SNE cannot add new test points to an existing map, and every rerun can give a different map',
      't-SNE is supervised, so the coordinates would leak the training labels into the features',
      't-SNE always produces exactly one coordinate per point, which is too little information',
      't-SNE increases the number of dimensions, so the classifier would face the curse of dimensionality',
    ],
    answer: 0,
    explanation:
      'scikit-learn\'s `TSNE` has no `transform`: new points require rerunning on everything, and the new map can look different. The output also depends on perplexity and the random start, and its distances are deliberately distorted. t-SNE is unsupervised (no label leakage) and gives 2 or 3 coordinates, fewer than the original features. PCA, or UMAP with care, can transform new points.',
    difficulty: 'intermediate',
  },
  {
    id: 'unsupervised-learning.tsne-umap-and-anomalies.5',
    prompt:
      'A factory has a year of sensor readings from machines working normally, but has recorded only two breakdowns, and future faults may look different from both. Which approach fits best?',
    options: [
      'Fit a one-class SVM on the normal readings and flag new readings that fall outside its boundary',
      'Train a binary classifier on normal readings versus the two breakdowns and flag what it predicts as faults',
      'Run t-SNE on all readings and flag points whose map coordinates are larger than a threshold',
      'Run PCA, keep the top two components, and flag the readings with the largest PC1 scores',
    ],
    answer: 0,
    explanation:
      'With almost no labelled faults and new kinds expected, you learn what normal looks like and flag anything unlike it: a one-class SVM (or isolation forest, or reconstruction error) needs normal data only. A classifier trained on two examples cannot learn what a fault looks like, t-SNE coordinates are not anomaly scores, and a large PC1 score just means far along the main direction of normal variation.',
    difficulty: 'beginner',
  },
]

export default questions
