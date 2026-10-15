import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'final-lab-pytorch.practice-set.1',
    prompt: 'Based on the 2025 and 2026 Finals, which description best fits the programming tasks you should prepare for?',
    options: [
      'Classical ML algorithms written from scratch in NumPy, plus PyTorch components with debugging parts',
      'Training a large network on a GPU for hours until it reaches a target accuracy on a hidden leaderboard',
      'Calling scikit-learn models on a provided dataset, then tuning their hyperparameters by grid search',
      'Short essays on the history, ethics and social impact of AI, marked by hand against a rubric',
    ],
    answer: 0,
    explanation:
      'Every past Final task implemented a known algorithm: linear regression, K-means and retrieval in NumPy in 2025, gradient boosting in 2026 (NumPy, with scikit-learn\'s `DecisionTreeRegressor` as the weak learner), and in 2026 a U-Net fix, mean IoU and attention in PyTorch, with debugging parts. No past Final asked for leaderboard-style training or grid searches, and the only written parts were two- to four-sentence explanations inside coding tasks.',
    difficulty: 'beginner',
  },
  {
    id: 'final-lab-pytorch.practice-set.2',
    prompt: 'With `y_true = [1, 1, 0, 0]` and `y_pred = [1, 0, 1, 0]`, what are precision, recall and F1?',
    options: ['0.5, 0.5 and 0.5', '0.5, 1.0 and 0.67', '1.0, 0.5 and 0.67', '0.25, 0.5 and 0.33'],
    answer: 0,
    explanation:
      'TP = 1 (position 0), FP = 1 (position 2) and FN = 1 (position 1). Precision $= 1/(1+1) = 0.5$, recall $= 1/(1+1) = 0.5$, and $F_1 = 2 \\cdot 0.5 \\cdot 0.5 / (0.5 + 0.5) = 0.5$. Dividing TP by all four labels gives the misleading 0.25.',
    difficulty: 'beginner',
  },
  {
    id: 'final-lab-pytorch.practice-set.3',
    prompt:
      'Your `softmax_cross_entropy` passes the visible tests, which use small logits, but a hidden test with logits `[[1000, 0]]` returns `nan`. What is the fix?',
    options: [
      'Subtract each row\'s maximum logit before taking the exponentials',
      'Divide the logits by 1000 first, so that the exponentials stay small',
      'Replace `np.exp` with `np.log` in the softmax, so nothing can overflow',
      'Clip the final loss to the range 0 to 1, so that `nan` cannot appear',
    ],
    answer: 0,
    explanation:
      '$e^{1000}$ overflows to `inf`, and $\\infty / \\infty$ is `nan`. Softmax does not change if you subtract the same number from every logit in a row, so subtracting the maximum makes the largest exponent $e^0 = 1$ and nothing overflows. Dividing by 1000 changes the answer (it is a temperature), `np.log` no longer computes a softmax at all, and clipping cannot remove a `nan` (`np.clip` passes `nan` straight through).',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-pytorch.practice-set.4',
    prompt: 'A conv2d written with four Python loops and the im2col version give exactly the same output, but im2col is tens to hundreds of times faster in NumPy. Why?',
    options: [
      'The same multiply-adds run inside one compiled matrix product, not one Python step at a time',
      'im2col does far fewer multiplications, because each overlapping window is copied only once',
      'NumPy sends the matrix product to the GPU automatically, while the Python loops stay on the CPU',
      'im2col skips the windows at the edges of the image, so there are fewer multiply-adds to do',
    ],
    answer: 0,
    explanation:
      'Both versions do exactly the same arithmetic: (number of windows) × $k^2$ multiply-adds. The difference is who runs the loops: in the naive version the Python interpreter executes every step, while `cols @ kernel` hands the whole job to compiled, optimised code. NumPy never uses the GPU by itself, and im2col visits every window, edges included, which is why the outputs agree.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-pytorch.practice-set.5',
    prompt: '`X_test` has shape `(5, 2)` and `X_train` has shape `(100, 2)`. What is the shape of `D` in this vectorised k-NN line?',
    code: 'D = ((X_test[:, None, :] - X_train[None, :, :]) ** 2).sum(axis=-1)',
    options: ['(5, 100)', '(100, 5)', '(5, 100, 2)', '(5, 2)'],
    answer: 0,
    explanation:
      '`X_test[:, None, :]` is $(5, 1, 2)$ and `X_train[None, :, :]` is $(1, 100, 2)$. Broadcasting gives $(5, 100, 2)$: every test point minus every training point. Summing over the last axis removes the 2 coordinates, leaving $(5, 100)$: one squared distance per pair. $(5, 100, 2)$ is the shape before the sum.',
    difficulty: 'intermediate',
  },
]

export default questions
