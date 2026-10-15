import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'convolutional-networks.images-as-tensors.1',
    prompt: 'An image loaded from a file is stored channels-last. What does this code print?',
    code: 'import numpy as np\nimg = np.zeros((32, 48, 3), dtype=np.uint8)   # (H, W, C)\nx = img.transpose(2, 0, 1)\nbatch = x[None]\nprint(batch.shape)',
    options: ['`(1, 3, 32, 48)`', '`(1, 32, 48, 3)`', '`(3, 32, 48, 1)`', '`(3, 48, 32, 1)`'],
    answer: 0,
    explanation:
      '`transpose(2, 0, 1)` puts axis 2 (channels) first, then axes 0 and 1 (height, width): $(32, 48, 3) \\to (3, 32, 48)$. Indexing with `[None]` adds a new axis at the front, the batch axis, giving $(1, 3, 32, 48)$, which is the $(N, C, H, W)$ layout PyTorch expects. $(1, 32, 48, 3)$ would be the result without the transpose.',
    difficulty: 'beginner',
  },
  {
    id: 'convolutional-networks.images-as-tensors.2',
    prompt: 'A $64 \\times 64$ RGB image is flattened and fed into a dense layer of 100 neurons. How many parameters (weights and biases) does that layer have?',
    options: ['1,228,900', '1,228,800', '409,700', '12,388'],
    answer: 0,
    explanation:
      'The image holds $64 \\times 64 \\times 3 = 4{,}096 \\times 3 = 12{,}288$ numbers. Each of the 100 neurons has one weight per input plus one bias: $12{,}288 \\times 100 + 100 = 1{,}228{,}900$. Forgetting the biases gives 1,228,800; forgetting the 3 channels gives $4{,}096 \\times 100 + 100 = 409{,}700$.',
    difficulty: 'beginner',
  },
  {
    id: 'convolutional-networks.images-as-tensors.3',
    prompt: 'An 8-bit pixel has value 51. What is it after min-max scaling to $[0, 1]$, as done when images are divided by 255?',
    options: ['0.2', '0.51', '0.25', '5.0'],
    answer: 0,
    explanation:
      'An 8-bit pixel ranges from 0 to 255, so min-max scaling is $(51 - 0)/(255 - 0) = 51/255 = 0.2$ (because $255 = 5 \\times 51$). 0.51 comes from dividing by 100 instead of 255.',
    difficulty: 'beginner',
  },
  {
    id: 'convolutional-networks.images-as-tensors.4',
    prompt:
      'Two pipelines feed the same CNN. Pipeline P divides pixels by 255. Pipeline Q divides by 255, then subtracts the training-set mean and divides by the training-set standard deviation. Q trains faster. What is the best explanation?',
    options: [
      "Q's inputs straddle zero, so a neuron's weight gradients can differ in sign",
      "Q's inputs all lie in $[0, 1]$, so no input can dominate the weighted sum",
      'Q uses different statistics for every image, so each gets the contrast that suits it',
      "Q's inputs are larger, so gradients are larger and each step moves the weights further",
    ],
    answer: 0,
    explanation:
      "Both apply one fixed affine transform to every image, so they keep the same information, and a difference in scale could be matched by tuning P's learning rate. What no learning rate gives P is zero-centring: a weight's gradient is $\\delta \\cdot x_i$, and with P every $x_i \\ge 0$, so for one example all of a neuron's weight gradients share the sign of $\\delta$ and the weights zig-zag. Larger inputs (the last option) are a scale effect that retuning the learning rate reproduces, so they are not why Q trains faster; and it is P, not Q, whose inputs all lie in $[0, 1]$.",
    difficulty: 'intermediate',
  },
  {
    id: 'convolutional-networks.images-as-tensors.5',
    prompt:
      'A team classifying chest X-rays switches from dataset-wide z-scoring to standardising each image with its own mean and standard deviation. Validation accuracy drops. What is the most likely cause?',
    options: [
      'Per-image scaling erases overall brightness, which signalled tissue density',
      'Per-image scaling leaves every input positive, so the first-layer gradients all share one sign',
      'Per-image scaling uses statistics from the test set, which leaks information and causes overfitting',
      'Per-image scaling changes the tensor shape from $(N, C, H, W)$ to $(N, H, W, C)$',
    ],
    answer: 0,
    explanation:
      'Standardising each image by itself forces every image to mean 0 and standard deviation 1, so a dense, whiter X-ray becomes indistinguishable in overall brightness from a clear one. Per-image z-scores are centred, so they do contain negative values, and they use only the image itself, not the test set. Normalisation never changes the tensor shape.',
    difficulty: 'intermediate',
  },
]

export default questions
