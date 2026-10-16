import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'prelim-speed-toolkit.drill-conv-and-params.1',
    prompt: 'A batch of $64 \\times 64$ images goes through `nn.Conv2d(3, 8, kernel_size=5, stride=2, padding=2)`. What is the output height?',
    options: ['32', '31', '33', '30'],
    answer: 0,
    explanation:
      '$\\lfloor (64 + 2 \\cdot 2 - 5)/2 \\rfloor + 1 = \\lfloor 63/2 \\rfloor + 1 = 31 + 1 = 32$. 31 forgets the $+1$, 33 rounds 31.5 up instead of down, and 30 leaves out the padding: $\\lfloor 59/2 \\rfloor + 1 = 30$.',
    difficulty: 'beginner',
  },
  {
    id: 'prelim-speed-toolkit.drill-conv-and-params.2',
    prompt: 'How many learnable parameters does `nn.Conv2d(8, 32, kernel_size=3)` have?',
    options: ['2,336', '2,304', '2,312', '320'],
    answer: 0,
    explanation:
      'Each filter has $3 \\cdot 3 \\cdot 8 = 72$ weights plus 1 bias, and there are 32 filters: $73 \\times 32 = 2190 + 146 = 2336$. 2,304 forgets the 32 biases; 2,312 adds one bias per *input* channel (8) instead of per filter; 320 $= (9 + 1) \\times 32$ forgets that each filter spans all 8 input channels.',
    difficulty: 'intermediate',
  },
  {
    id: 'prelim-speed-toolkit.drill-conv-and-params.3',
    prompt: 'Compare `nn.MultiheadAttention(embed_dim=512, num_heads=1)` with `nn.MultiheadAttention(embed_dim=512, num_heads=8)`. How do their parameter counts compare?',
    options: [
      'They are equal: the heads split the 512 dimensions, so all four projections stay 512 × 512',
      'The 8-head layer has 8 times as many: each head owns its own full set of four 512 × 512 projections',
      'The 8-head layer has 8 times fewer: each head works on just 64 of the 512 dimensions, so its matrices shrink',
      'The 8-head layer has slightly more: each extra head adds its own 512-long bias vector to the output',
    ],
    answer: 0,
    explanation:
      'Both have $4d^2 + 4d = 4 \\cdot 262{,}144 + 2048 = 1{,}050{,}624$ parameters. The heads cut each $d$-wide projection into 8 slices of 64, so the matrices are the same size; $h$ never appears in the formula. "8 times as many" would be true only if each head had full $512 \\times 512$ matrices of its own.',
    difficulty: 'intermediate',
  },
  {
    id: 'prelim-speed-toolkit.drill-conv-and-params.4',
    prompt: 'How many learnable parameters does `nn.Linear(256, 10)` have?',
    options: ['2,570', '2,560', '2,816', '266'],
    answer: 0,
    explanation:
      'A Linear layer has one weight per input-output pair plus one bias per output: $256 \\times 10 + 10 = 2{,}570$. 2,560 forgets the biases, 2,816 adds a bias for each of the 256 inputs instead of each of the 10 outputs ($2{,}560 + 256$), and 266 adds the sizes instead of multiplying them.',
    difficulty: 'beginner',
  },
  {
    id: 'prelim-speed-toolkit.drill-conv-and-params.5',
    prompt: 'A $32 \\times 32$ feature map with 16 channels passes through `nn.MaxPool2d(2)`. What comes out, and how many learnable parameters does the layer have?',
    options: [
      '$16 \\times 16$ with 16 channels, and 0 parameters',
      '$16 \\times 16$ with 16 channels, and 16 parameters (one per channel)',
      '$32 \\times 32$ with 8 channels, and 0 parameters',
      '$31 \\times 31$ with 16 channels, and 4 parameters (one per window cell)',
    ],
    answer: 0,
    explanation:
      '`MaxPool2d(2)` uses a $2 \\times 2$ window with stride 2 (the stride defaults to the kernel size), so $\\lfloor (32 - 2)/2 \\rfloor + 1 = 16$ on each side. Pooling works on each channel separately, so the 16 channels stay 16, and taking a maximum needs no weights at all: 0 parameters. 31 is what a stride of 1 would give.',
    difficulty: 'beginner',
  },
  {
    id: 'prelim-speed-toolkit.drill-conv-and-params.6',
    prompt:
      'Computing the attention scores $QK^T$ for a context of 2,048 tokens takes 10 ms. Keeping the width $d$ the same, roughly how long does it take for 4,096 tokens?',
    options: [
      'About 40 ms: there is one score for every pair of tokens, so $n^2$ of them',
      'About 20 ms: each token is scored once, so the work grows in step with $n$',
      'About 80 ms: forming the scores costs $O(n^3)$, like inverting an $n \\times n$ matrix',
      'About 10 ms: the extra tokens are shared out between the heads, which run in parallel',
    ],
    answer: 0,
    explanation:
      '$QK^T$ is $(n \\times d)(d \\times n)$: $n^2$ scores, each a dot product of length $d$, so the cost is $O(n^2 d)$. Doubling $n$ with $d$ fixed multiplies the work by $2^2 = 4$, so about 40 ms. 20 ms would be true of a linear cost such as a feed-forward layer, and $O(n^3)$ is the cost of inverting a matrix, not of multiplying two thin ones; splitting into heads divides $d$, not $n$.',
    difficulty: 'intermediate',
  },
]

export default questions
