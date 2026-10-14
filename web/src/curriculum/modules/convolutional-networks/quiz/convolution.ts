import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'convolutional-networks.convolution.1',
    prompt:
      'The kernel $\\begin{bmatrix} 0 & 1 & 0 \\\\ 1 & -4 & 1 \\\\ 0 & 1 & 0 \\end{bmatrix}$ sits on the patch $\\begin{bmatrix} 2 & 0 & 1 \\\\ 1 & 3 & 0 \\\\ 0 & 1 & 2 \\end{bmatrix}$. What is the output value?',
    options: ['−10', '10', '−12', '2'],
    answer: 0,
    explanation:
      'Multiply matching positions and add. The four neighbours with weight 1 are $0 + 1 + 0 + 1 = 2$; the centre gives $3 \\times (-4) = -12$; the corners meet weight 0. Total $2 - 12 = -10$. Answering −12 forgets the neighbours; 2 forgets the centre.',
    difficulty: 'beginner',
  },
  {
    id: 'convolutional-networks.convolution.2',
    prompt:
      'An image in which every pixel equals 7 is convolved with the horizontal-edge kernel $\\begin{bmatrix} 1 & 2 & 1 \\\\ 0 & 0 & 0 \\\\ -1 & -2 & -1 \\end{bmatrix}$. What is every output value, and why?',
    options: [
      '0, because the weights add up to 0, so a flat region cancels out',
      '7, because the kernel keeps the brightness of flat regions',
      '28, because the positive weights add up to 4 and $4 \\times 7 = 28$',
      '63, because the kernel covers 9 pixels and $9 \\times 7 = 63$',
    ],
    answer: 0,
    explanation:
      'On a flat region every pixel is the same value $c$, so the output is $c \\times$ (sum of the weights) $= 7 \\times (1 + 2 + 1 - 1 - 2 - 1) = 7 \\times 0 = 0$. Edge detectors respond only where brightness changes. Keeping the value 7 is what a blur (weights summing to 1 after dividing) would do; 28 ignores the negative weights.',
    difficulty: 'beginner',
  },
  {
    id: 'convolutional-networks.convolution.3',
    prompt: 'What does this code print?',
    code: 'import numpy as np\nx = np.array([[1, 2, 3],\n              [4, 5, 6],\n              [7, 8, 9]])\nk = np.array([[1, 0],\n              [0, -1]])\nout = np.zeros((2, 2))\nfor i in range(2):\n    for j in range(2):\n        out[i, j] = np.sum(x[i:i+2, j:j+2] * k)\nprint(out)',
    options: ['`[[-4. -4.] [-4. -4.]]`', '`[[ 1 -2] [ 4 -5]]`', '`[[4. 4.] [4. 4.]]`', '`[[-3. -3.] [-3. -3.]]`'],
    answer: 0,
    explanation:
      'Each output is the top-left pixel of its $2 \\times 2$ patch minus the bottom-right one: $1 - 5$, $2 - 6$, $4 - 8$, $5 - 9$, all $-4$. `[[1 -2] [4 -5]]` is the matrix product `x[:2, :2] @ k`, the classic mistake: convolution multiplies matching positions and adds them, it is not matrix multiplication.',
    difficulty: 'intermediate',
  },
  {
    id: 'convolutional-networks.convolution.4',
    prompt: 'In a trained CNN, where do the values of the convolution kernels come from?',
    options: [
      'They are learned from data by gradient descent, starting from random values',
      'They are fixed edge and blur filters chosen by the network designer',
      'They are copied from patches of the training images before training starts',
      'They are computed from the mean and standard deviation of each image',
    ],
    answer: 0,
    explanation:
      'Kernel weights are ordinary learnable parameters: initialised randomly and updated by backpropagation and gradient descent to reduce the loss. Hand-designed filters such as Sobel edge detectors are fixed, but the first-layer filters a CNN learns often end up looking similar to them.',
    difficulty: 'beginner',
  },
  {
    id: 'convolutional-networks.convolution.5',
    prompt:
      "One filter of a trained CNN responds strongly to a cat's eye that appears in the top-left corner of an image. In a new image, the same eye appears in the bottom-right corner. What happens in that filter's feature map?",
    options: [
      'A strong response appears in the bottom-right, because the same weights are used at every position',
      'There is no strong response, because the filter only learned to look at the top-left corner',
      'The strong response stays in the top-left, because feature maps do not depend on where objects are',
      'The response is spread evenly over the map, because the filter cannot locate the eye',
    ],
    answer: 0,
    explanation:
      'Weight sharing means the same kernel is applied at every position, so the eye produces the same strong response wherever it is, just in a different place in the map: translation equivariance. A dense layer, which has separate weights for every position, is the one that would fail to recognise the moved eye.',
    difficulty: 'intermediate',
  },
]

export default questions
