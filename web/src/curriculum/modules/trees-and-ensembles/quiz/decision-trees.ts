import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'trees-and-ensembles.decision-trees.1',
    prompt: 'A node contains three classes in proportions $\\tfrac12$, $\\tfrac14$ and $\\tfrac14$. What is its entropy, using $\\log_2$?',
    options: ['1.5 bits', '1 bit', '2 bits', '0.625 bits'],
    answer: 0,
    explanation:
      '$H = -\\sum p_k \\log_2 p_k = \\tfrac12(1) + \\tfrac14(2) + \\tfrac14(2) = 0.5 + 0.5 + 0.5 = 1.5$ bits, since $-\\log_2 \\tfrac12 = 1$ and $-\\log_2 \\tfrac14 = 2$. 2 bits is the maximum for **four** equally likely classes, and 0.625 is the Gini impurity of this node ($1 - \\tfrac14 - \\tfrac1{16} - \\tfrac1{16}$), not its entropy.',
    difficulty: 'intermediate',
  },
  {
    id: 'trees-and-ensembles.decision-trees.2',
    prompt: 'What does this code print (rounded to 3 decimal places)?',
    code: 'import numpy as np\n\ndef gini(y):\n    p = np.bincount(y) / len(y)\n    return 1 - np.sum(p ** 2)\n\nprint(gini(np.array([0, 0, 1, 1, 1, 1])))',
    options: ['`0.444`', '`0.556`', '`0.5`', '`0.222`'],
    answer: 0,
    explanation:
      '`np.bincount` counts the labels: two 0s and four 1s, so `p = [1/3, 2/3]`. Then $1 - (\\tfrac19 + \\tfrac49) = \\tfrac49 \\approx 0.444$. The tempting 0.556 is $\\tfrac59$, the sum of squares before subtracting from 1; 0.5 would need a 50-50 node, and 0.222 is $p(1-p)$ without the factor 2.',
    difficulty: 'beginner',
  },
  {
    id: 'trees-and-ensembles.decision-trees.3',
    prompt:
      'A node has 4 examples of class A and 4 of class B (Gini 0.5). A split sends 2 A to the left (a pure child) and the other 2 A and 4 B to the right, whose Gini is $\\tfrac49 \\approx 0.444$. What is the Gini gain of this split?',
    options: ['about 0.167', 'about 0.278', 'about 0.056', 'about 0.333'],
    answer: 0,
    explanation:
      'Weight each child by its share of the 8 examples: $\\tfrac28(0) + \\tfrac68 \\cdot \\tfrac49 = \\tfrac13 \\approx 0.333$. The gain is $0.5 - 0.333 \\approx 0.167$. 0.278 comes from the unweighted average $(0 + 0.444)/2$, 0.056 ignores the pure child completely, and 0.333 is the impurity after the split, not the drop.',
    difficulty: 'intermediate',
  },
  {
    id: 'trees-and-ensembles.decision-trees.4',
    prompt:
      'A decision tree with no depth limit scores 100% training accuracy and 71% validation accuracy. The same tree with `max_depth=4` scores 86% training and 82% validation. What is going on, and what should you do?',
    options: [
      'The unlimited tree memorised noise in the training data (high variance); keep a depth limit, tuned on validation data',
      'The unlimited tree underfits the validation data (high bias); grow it deeper or for more iterations until validation also reaches 100%',
      'The depth-4 tree overfits because its training and validation scores are closer; remove the limit and add more features',
      'The features have very different scales, which only hurts deep trees; standardise them and keep the unlimited tree',
    ],
    answer: 0,
    explanation:
      'A perfect training score with a much lower validation score is the classic sign of overfitting: the full-depth tree has carved tiny leaves around noisy examples. The depth-4 tree generalises better (82% against 71%). Trees do not need feature scaling, and growing deeper only makes the memorising worse.',
    difficulty: 'beginner',
  },
  {
    id: 'trees-and-ensembles.decision-trees.5',
    prompt: 'Which statement about a standard decision tree classifier (such as scikit-learn\'s `DecisionTreeClassifier`) is true?',
    options: [
      'Its decision boundary is made of axis-parallel cuts, and rescaling a feature does not change its predictions',
      'It needs standardised features, because each split compares the sizes of two different features',
      'A node with a 50-50 mix of two classes has the maximum Gini impurity, which is 1',
      'It chooses each split to maximise the plain (unweighted) average impurity of the two children',
    ],
    answer: 0,
    explanation:
      'Each question tests one feature against a threshold, such as "area ≤ 93", so every cut is parallel to an axis, and rescaling a feature only moves the threshold without changing which side any example falls on. The 50-50 maximum is 0.5 for Gini (1 is the entropy maximum), and the tree **minimises** the **weighted** impurity of the children.',
    difficulty: 'beginner',
  },
]

export default questions
