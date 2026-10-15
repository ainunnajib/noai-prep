import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'prelim-speed-toolkit.drill-dl-and-code.1',
    prompt: 'A batch of $64 \\times 64$ images goes through `nn.Conv2d(3, 8, kernel_size=5, stride=2, padding=2)`. What is the output height?',
    options: ['32', '31', '33', '30'],
    answer: 0,
    explanation:
      '$\\lfloor (64 + 2 \\cdot 2 - 5)/2 \\rfloor + 1 = \\lfloor 63/2 \\rfloor + 1 = 31 + 1 = 32$. 31 forgets the $+1$, 33 rounds 31.5 up instead of down, and 30 leaves out the padding: $\\lfloor 59/2 \\rfloor + 1 = 30$.',
    difficulty: 'beginner',
  },
  {
    id: 'prelim-speed-toolkit.drill-dl-and-code.2',
    prompt: 'How many learnable parameters does `nn.Conv2d(16, 32, kernel_size=3)` have?',
    options: ['4,640', '4,608', '4,624', '320'],
    answer: 0,
    explanation:
      'Each filter has $3 \\cdot 3 \\cdot 16 = 144$ weights plus 1 bias, and there are 32 filters: $145 \\times 32 = 4350 + 290 = 4640$. 4,608 forgets the 32 biases; 4,624 adds one bias per *input* channel (16) instead of per filter; 320 $= (9 + 1) \\times 32$ forgets that each filter spans all 16 input channels.',
    difficulty: 'intermediate',
  },
  {
    id: 'prelim-speed-toolkit.drill-dl-and-code.3',
    prompt: 'Compare `nn.MultiheadAttention(embed_dim=512, num_heads=1)` with `nn.MultiheadAttention(embed_dim=512, num_heads=8)`. How do their parameter counts compare?',
    options: [
      'They are equal: the heads split the 512 dimensions, so the four 512 × 512 projections keep their size',
      'The 8-head layer has 8 times as many: every head owns a separate set of four 512 × 512 projections',
      'The 8-head layer has 8 times fewer: each head only ever touches 64 of the 512 dimensions',
      'The 8-head layer has slightly more: each extra head adds its own 512-long bias vector to the output',
    ],
    answer: 0,
    explanation:
      'Both have $4d^2 + 4d = 4 \\cdot 262{,}144 + 2048 = 1{,}050{,}624$ parameters. The heads cut each $d$-wide projection into 8 slices of 64, so the matrices are the same size; $h$ never appears in the formula. "8 times as many" would be true only if each head had full $512 \\times 512$ matrices of its own.',
    difficulty: 'intermediate',
  },
  {
    id: 'prelim-speed-toolkit.drill-dl-and-code.4',
    prompt: 'What values does `a` hold after this code runs?',
    code: 'import numpy as np\na = np.array([1, 2, 3, 4])\nb = a[1:3]\nb[0] = 99',
    options: ['1, 99, 3, 4', '1, 2, 3, 4', '99, 2, 3, 4', '1, 99, 99, 4'],
    answer: 0,
    explanation:
      'A basic slice is a **view**: `b` shares memory with `a`, and `b[0]` is the same element as `a[1]`. So `a` becomes `[ 1 99  3  4]`. "1, 2, 3, 4" assumes the slice is a copy (true for Python lists and for fancy indexing like `a[[1, 2]]`, not for NumPy slices); "99, 2, 3, 4" forgets that `b` starts at `a[1]`.',
    difficulty: 'intermediate',
  },
  {
    id: 'prelim-speed-toolkit.drill-dl-and-code.5',
    prompt:
      'A classifier with dropout layers trained normally. At test time you feed it the same image twice and get two different predicted probabilities. What is the most likely cause?',
    options: [
      'The model was never put in evaluation mode with `model.eval()`, so dropout still zeroes random units',
      '`optimiser.zero_grad()` was never called, so old gradients leaked into the forward pass',
      'Softmax was applied before `CrossEntropyLoss`, so the probabilities are squashed twice',
      'The input was built with `torch.tensor` from integers, so it is rounded differently each run',
    ],
    answer: 0,
    explanation:
      'In training mode, dropout zeroes a random subset of units on every forward pass, so repeated predictions differ; `model.eval()` turns it off. Missing `zero_grad()` and a double softmax harm *training* but are deterministic at test time, and an integer input would make the same (wrong) output every time or raise an error.',
    difficulty: 'beginner',
  },
]

export default questions
