import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'prelim-speed-toolkit.drill-shapes-and-code.1',
    prompt: 'What values does `a` hold after this code runs?',
    code: 'import numpy as np\na = np.array([1, 2, 3, 4])\nb = a[1:3]\nb[0] = 99',
    options: ['1, 99, 3, 4', '1, 2, 3, 4', '99, 2, 3, 4', '1, 99, 99, 4'],
    answer: 0,
    explanation:
      'A basic slice is a **view**: `b` shares memory with `a`, and `b[0]` is the same element as `a[1]`. So `a` becomes `[ 1 99  3  4]`. "1, 2, 3, 4" assumes the slice is a copy (true for Python lists and for fancy indexing like `a[[1, 2]]`, not for NumPy slices); "99, 2, 3, 4" forgets that `b` starts at `a[1]`.',
    difficulty: 'intermediate',
  },
  {
    id: 'prelim-speed-toolkit.drill-shapes-and-code.2',
    prompt:
      'A classifier with dropout layers trained normally. At test time you feed it the same image twice and get two different predicted probabilities. What is the most likely cause?',
    options: [
      '`model.eval()` was never called, so dropout is still zeroing a random set of units on each forward pass',
      '`optimizer.zero_grad()` was never called in training, so old gradients leaked into the forward pass',
      'Softmax was applied before `CrossEntropyLoss` in training, so the probabilities are squashed twice',
      'The input was built with `torch.tensor` from integers, so it is rounded a little differently each run',
    ],
    answer: 0,
    explanation:
      'In training mode, dropout zeroes a random subset of units on every forward pass, so repeated predictions differ; `model.eval()` turns it off. Missing `zero_grad()` and a double softmax harm *training* but are deterministic at test time, and an integer input would make the same (wrong) output every time or raise an error.',
    difficulty: 'beginner',
  },
  {
    id: 'prelim-speed-toolkit.drill-shapes-and-code.3',
    prompt: 'A batch `x` has shape `(32, 3, 64, 64)`. What is the shape of `x.mean(dim=1)`?',
    options: ['`(32, 64, 64)`', '`(32, 3, 64)`', '`(3, 64, 64)`', '`(32, 1, 64, 64)`'],
    answer: 0,
    explanation:
      'A reduction removes the dimension it reduces over. `dim=1` is the 3 colour channels, so they are averaged away and `(32, 64, 64)` is left. `(32, 1, 64, 64)` is what you would get with `keepdim=True`; `(32, 3, 64)` removes the last dimension and `(3, 64, 64)` the batch dimension.',
    difficulty: 'beginner',
  },
  {
    id: 'prelim-speed-toolkit.drill-shapes-and-code.4',
    prompt: 'What does `print(-7 // 2)` show in Python?',
    options: ['`-4`', '`-3`', '`-3.5`', '`-4.0`'],
    answer: 0,
    explanation:
      '`//` is floor division: it rounds **down**, towards minus infinity, not towards zero. $-7 / 2 = -3.5$, and rounding down gives $-4$; both numbers are integers, so the result is the integer `-4`, not `-4.0`. `-3` is what rounding towards zero would give (as `int(-3.5)` does), and `-3.5` is ordinary division with `/`.',
    difficulty: 'intermediate',
  },
  {
    id: 'prelim-speed-toolkit.drill-shapes-and-code.5',
    prompt: 'With `A = torch.ones(2, 3)` and `B = torch.ones(3, 2)`, what does `A * B` give?',
    options: [
      'An error: element-wise shapes (2, 3) and (3, 2) clash',
      'A 2 × 2 tensor of 3s: the matrix product of the two',
      'A 3 × 3 tensor of 2s: the product taken the other way',
      'A 2 × 3 tensor of 1s: each entry multiplied by 1',
    ],
    answer: 0,
    explanation:
      '`*` is element-wise, so the shapes must match or broadcast. Lining them up from the right, 3 meets 2 and neither is 1, so PyTorch raises a size-mismatch error. The 2 × 2 matrix of 3s is `A @ B`, the matrix product; `B @ A` would give the 3 × 3 matrix of 2s.',
    difficulty: 'beginner',
  },
]

export default questions
