import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'debugging-and-diagnosis.nan-and-numerical-issues.1',
    prompt: 'What does this code print (ignoring NumPy warnings)?',
    code: 'import numpy as np\nz = np.array([1000.0, 999.0], dtype=np.float32)\nprint(np.exp(z) / np.exp(z).sum())',
    options: ['`[nan nan]`', '`[0.7310586 0.2689414]`', '`[inf inf]`', '`[1. 0.]`'],
    answer: 0,
    explanation:
      'The largest float32 is about $3.4 \\times 10^{38} \\approx e^{88.7}$, so both $e^{1000}$ and $e^{999}$ overflow to `inf`. The sum is `inf` too, and $\\infty / \\infty$ is `nan`. The answer `[0.7310586 0.2689414]` is what the stable version (subtract the max first) would print: $1/(1 + e^{-1}) \\approx 0.731$.',
    difficulty: 'intermediate',
  },
  {
    id: 'debugging-and-diagnosis.nan-and-numerical-issues.2',
    prompt: 'Using the subtract-the-max trick, what is the softmax of the logits $z = (1002, 1000)$? Use $e^{-2} \\approx 0.135$.',
    options: ['$(0.88,\\ 0.12)$', '$(0.50,\\ 0.50)$', '$(1,\\ 0)$', '`nan`, because $e^{1002}$ overflows'],
    answer: 0,
    explanation:
      'Subtract $m = 1002$: the shifted logits are $(0, -2)$, so the exponentials are $1$ and $0.135$, with sum $1.135$. Then $p_1 = 1/1.135 \\approx 0.88$ and $p_2 \\approx 0.12$. Softmax depends only on the gap between logits (here 2), not on their size, so $(0.50, 0.50)$ is wrong; and the shift means nothing ever overflows.',
    difficulty: 'intermediate',
  },
  {
    id: 'debugging-and-diagnosis.nan-and-numerical-issues.3',
    prompt: 'A hand-written cross-entropy loss. The true class is the third one. What does it print?',
    code: 'import torch\np = torch.tensor([0.2, 0.0, 0.8])   # predicted probabilities\ny = torch.tensor([0.0, 0.0, 1.0])   # one-hot target\nprint(-(y * torch.log(p)).sum())',
    options: ['`tensor(nan)`', '`tensor(0.2231)`', '`tensor(inf)`', '`tensor(-inf)`'],
    answer: 0,
    explanation:
      '`torch.log(p)` is $(-1.61, -\\infty, -0.22)$. The second target is 0, but $0 \\times (-\\infty)$ is `nan`, not 0, and a sum containing `nan` is `nan`. The intended loss, $-\\log 0.8 \\approx 0.2231$, is what `F.cross_entropy` on the logits, or `torch.log(p + eps)`, would give.',
    difficulty: 'intermediate',
  },
  {
    id: 'debugging-and-diagnosis.nan-and-numerical-issues.4',
    prompt:
      'Training was stable for 20 epochs. From step 41,200 onwards the loss prints `nan`, and when you inspect the model every weight is `nan`. What is the most useful next step?',
    options: [
      'Re-run from a checkpoint with `set_detect_anomaly(True)` and per-layer checks to find the first nan',
      'Find the layer whose final weights hold the most nan values and rewrite that layer',
      'Switch the model to float16 so large intermediate values use less GPU memory',
      'Keep training for more epochs so the optimiser can pull the weights back to normal',
    ],
    answer: 0,
    explanation:
      'One bad value spreads forward to the loss, backward to every gradient, and through the update to every weight, so by now *every* layer is nan and the final weights say nothing about the cause. You must catch the first non-finite value, which is what anomaly detection and per-layer checks do. Training on cannot help (anything minus nan is nan), and float16 overflows sooner, not later.',
    difficulty: 'intermediate',
  },
  {
    id: 'debugging-and-diagnosis.nan-and-numerical-issues.5',
    prompt:
      'You log per-layer gradient norms in the first 40 steps of training a 10-layer network:\n\n| Step | Layer 1 | Layer 5 | Layer 10 | Loss |\n|---|---|---|---|---|\n| 1 | 310 | 180 | 95 | 2.3 |\n| 20 | 2,900 | 1,600 | 820 | 48.7 |\n| 40 | nan | nan | nan | nan |\n\nWhat is the most likely problem, and the best first fix?',
    options: [
      'Exploding gradients: clip the gradient norm and lower the learning rate',
      'Vanishing gradients: add residual connections so early layers learn',
      'Underfitting: add more layers so the model has more capacity',
      'Overfitting: add dropout and stop training at an earlier epoch',
    ],
    answer: 0,
    explanation:
      'Every layer has norms in the hundreds and thousands, growing each step, and the loss climbs before turning into nan: exploding gradients. Clipping caps each update and a lower learning rate shrinks it. Vanishing gradients would show *tiny* norms near the input (like 0.0003) and a loss that barely moves, and residual connections can even make exploding worse. Under- and overfitting do not produce nan.',
    difficulty: 'intermediate',
  },
]

export default questions
