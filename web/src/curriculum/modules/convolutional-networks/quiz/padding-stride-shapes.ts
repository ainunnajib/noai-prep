import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'convolutional-networks.padding-stride-shapes.1',
    prompt: "AlexNet's first layer applies an $11 \\times 11$ convolution with stride 4 and no padding to a $227 \\times 227$ image. What is the output's height and width?",
    options: ['55 × 55', '54 × 54', '56 × 56', '57 × 57'],
    answer: 0,
    explanation:
      'Use $\\lfloor (n + 2p - k)/s \\rfloor + 1 = \\lfloor (227 + 0 - 11)/4 \\rfloor + 1 = \\lfloor 216/4 \\rfloor + 1 = 54 + 1 = 55$. Forgetting the $+1$ gives 54; simply dividing the input by the stride ($227/4 \\approx 56.75$) gives 56 or 57.',
    difficulty: 'beginner',
  },
  {
    id: 'convolutional-networks.padding-stride-shapes.2',
    prompt: 'A layer uses $5 \\times 5$ kernels with stride 1. How much padding $p$ (on each side) keeps the output the same height and width as the input?',
    options: ['2', '1', '4', '5'],
    answer: 0,
    explanation:
      "'Same' padding needs $n + 2p - k + 1 = n$, so $p = (k - 1)/2 = (5 - 1)/2 = 2$. Answering 4 forgets that padding is added on **both** sides; 1 is the right answer for a $3 \\times 3$ kernel, not $5 \\times 5$.",
    difficulty: 'beginner',
  },
  {
    id: 'convolutional-networks.padding-stride-shapes.3',
    prompt: 'A convolutional layer maps 32 input channels to 64 output channels with $3 \\times 3$ kernels and biases. How many parameters does it have?',
    options: ['18,496', '18,432', '640', '18,464'],
    answer: 0,
    explanation:
      'Each of the 64 kernels spans all 32 input channels: $3 \\times 3 \\times 32 = 288$ weights, plus 1 bias, so 289. Then $289 \\times 64 = 18{,}496$. 18,432 leaves out the biases; 640 forgets the input channels, $(9 + 1) \\times 64$; 18,464 adds one bias per input channel instead of one per output channel.',
    difficulty: 'intermediate',
  },
  {
    id: 'convolutional-networks.padding-stride-shapes.4',
    prompt: 'What does this code print?',
    code: 'import torch\nimport torch.nn as nn\nconv = nn.Conv2d(256, 64, kernel_size=1)\nx = torch.rand(2, 256, 14, 14)\nprint(conv(x).shape, sum(p.numel() for p in conv.parameters()))',
    options: [
      '`torch.Size([2, 64, 14, 14]) 16448`',
      '`torch.Size([2, 64, 14, 14]) 16384`',
      '`torch.Size([2, 256, 14, 14]) 16448`',
      '`torch.Size([2, 64, 12, 12]) 16448`',
    ],
    answer: 0,
    explanation:
      'A $1 \\times 1$ convolution keeps height and width ($\\lfloor (14 - 1)/1 \\rfloor + 1 = 14$) and only mixes channels, turning 256 channels into 64. Parameters: $(1 \\times 1 \\times 256 + 1) \\times 64 = 16{,}448$, of which 16,384 are weights and 64 are biases. $12 \\times 12$ is what a $3 \\times 3$ kernel without padding would give.',
    difficulty: 'intermediate',
  },
  {
    id: 'convolutional-networks.padding-stride-shapes.5',
    prompt:
      'To fit a model on a phone, a team replaces a standard $3 \\times 3$ convolution from 256 to 256 channels with a depthwise separable one (biases ignored). Which statement is correct?',
    options: [
      'The weights drop from about 590,000 to about 68,000, roughly 9 times fewer',
      'The weights drop by a factor of 256, one for each input channel',
      'The weights stay the same; only the number of multiply-adds falls',
      'The weights drop, but the output shrinks from $H \\times W$ to $H/3 \\times W/3$',
    ],
    answer: 0,
    explanation:
      'Standard: $9 \\times 256 \\times 256 = 589{,}824$. Separable: depthwise $9 \\times 256 = 2{,}304$ plus pointwise $256 \\times 256 = 65{,}536$, total $67{,}840$: about $8.7\\times$ fewer, close to $k^2 = 9$. Multiply-adds fall by the same factor, and with the same padding and stride the output shape does not change.',
    difficulty: 'intermediate',
  },
]

export default questions
