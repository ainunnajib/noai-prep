import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'training-deep-networks.regularising-deep-networks.1',
    prompt: 'A layer uses `nn.Dropout(p=0.25)`. During training, a neuron whose normal output is $6.0$ is **kept**. What value does the next layer receive from it?',
    options: ['$8.0$', '$4.5$', '$6.0$', '$7.5$'],
    answer: 0,
    explanation:
      'Inverted dropout divides survivors by the keep probability $1 - p = 0.75$: $6.0 / 0.75 = 8.0$. That keeps the average output equal to $6.0$, since $0.75 \\times 8 + 0.25 \\times 0 = 6$. Multiplying by $0.75$ (giving $4.5$) scales the wrong way, and $7.5 = 6 \\times 1.25$ uses $1 + p$, which is not the same as $\\frac{1}{1-p}$.',
    difficulty: 'beginner',
  },
  {
    id: 'training-deep-networks.regularising-deep-networks.2',
    prompt: 'What does this code print?',
    code: 'import torch\nimport torch.nn as nn\n\ndrop = nn.Dropout(p=0.5)\ndrop.eval()\nprint(drop(torch.ones(4)))',
    options: ['`tensor([1., 1., 1., 1.])`', '`tensor([2., 0., 2., 0.])`', '`tensor([0.5000, 0.5000, 0.5000, 0.5000])`', '`tensor([2., 2., 2., 2.])`'],
    answer: 0,
    explanation:
      'After `.eval()` dropout is switched off: nothing is zeroed and nothing is rescaled, so the input passes through unchanged. A pattern like `[2., 0., 2., 0.]` is what training mode could produce (survivors doubled by $\\frac{1}{1-0.5}$). Multiplying by $0.5$ at test time belongs to the old non-inverted dropout, which PyTorch does not use.',
    difficulty: 'beginner',
  },
  {
    id: 'training-deep-networks.regularising-deep-networks.3',
    prompt: 'Plain gradient descent with weight decay updates a weight by $w \\leftarrow w - \\eta(g + \\lambda w)$. With $w = 10$, gradient $g = 2$, learning rate $\\eta = 0.1$ and weight decay $\\lambda = 0.5$, what is the new weight?',
    options: ['$9.3$', '$9.8$', '$9.5$', '$4.8$'],
    answer: 0,
    explanation:
      'First shrink: $1 - \\eta\\lambda = 1 - 0.05 = 0.95$, so $0.95 \\times 10 = 9.5$. Then the usual step: $9.5 - 0.1 \\times 2 = 9.3$. In one line: $10 - 0.1 \\times (2 + 5) = 9.3$. $9.8$ forgets the decay, $9.5$ forgets the gradient, and $4.8$ multiplies by $\\lambda$ instead of by $1 - \\eta\\lambda$.',
    difficulty: 'intermediate',
  },
  {
    id: 'training-deep-networks.regularising-deep-networks.4',
    prompt:
      'Early stopping with **patience 2** watches these validation losses after epochs 1 to 8: 0.80, 0.62, 0.55, 0.57, 0.54, 0.56, 0.58, 0.59. When does training stop, and which weights are kept?',
    options: [
      'It stops after epoch 7 and restores the epoch-5 weights',
      'It stops after epoch 4 and restores the epoch-3 weights',
      'It stops after epoch 6 and restores the epoch-5 weights',
      'It stops after epoch 8 and keeps the epoch-8 weights',
    ],
    answer: 0,
    explanation:
      'Epoch 3 is a best (0.55); epoch 4 is worse (count 1); epoch 5 is a new best (0.54), so the count resets to 0. Epochs 6 and 7 are worse (count 1, then 2 = patience), so it stops after epoch 7 and restores the best checkpoint, epoch 5. Stopping after epoch 4 is what patience 1 would do, and keeping the last weights defeats the purpose of early stopping.',
    difficulty: 'intermediate',
  },
  {
    id: 'training-deep-networks.regularising-deep-networks.5',
    prompt:
      'You train a small CNN to read handwritten digits 0 to 9 and it overfits badly. You decide to add data augmentation. Which transform is the **worst** choice for this task?',
    options: [
      'Mirroring each digit left to right at random',
      'Shifting each digit by 1 or 2 pixels in a random direction',
      'Rotating each digit by a random angle of up to 10 degrees',
      'Adding a little random noise to the pixel brightness',
    ],
    answer: 0,
    explanation:
      'Augmentation must keep the label true. A mirrored 2, 3 or 7 is not a digit anyone writes, so the model is trained on misleading examples. Small shifts, small rotations and light noise all leave the digit recognisable and teach useful invariances. (For photos of animals, left-right flips are a standard and safe augmentation.)',
    difficulty: 'intermediate',
  },
]

export default questions
