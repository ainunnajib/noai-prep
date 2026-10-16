import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'final-lab-pytorch.torch-exam-patterns.1',
    prompt: '`Q` and `K` both have shape `(8, 4, 16, 32)`, meaning (B, h, T, d_k). What is the shape of `Q @ K.transpose(-2, -1)`?',
    options: ['`(8, 4, 16, 16)`', '`(8, 4, 32, 32)`', '`(8, 4, 16, 32)`', 'It raises an error: the shapes do not match'],
    answer: 0,
    explanation:
      '`K.transpose(-2, -1)` swaps the last two axes: `(8, 4, 32, 16)`. The `@` multiplies the last two dims as matrices, $(16 \\times 32) @ (32 \\times 16) = (16 \\times 16)$, and keeps the batch dims `(8, 4)`. That is (B, h, T, T): one score per pair of tokens. `(8, 4, 32, 32)` would come from `Q.transpose(-2, -1) @ K`.',
    difficulty: 'beginner',
  },
  {
    id: 'final-lab-pytorch.torch-exam-patterns.2',
    prompt: 'A NumPy line reads `col_means = a.mean(axis=0, keepdims=True)` where `a` has shape `(5, 3)` and dtype float. Which PyTorch line gives the same result for a float tensor `t` of shape `(5, 3)`?',
    options: ['`t.mean(dim=0, keepdim=True)`', '`t.mean(dim=1, keepdim=True)`', '`t.mean(0).unsqueeze(1)`', '`torch.mean(t, keepdim=True)`'],
    answer: 0,
    explanation:
      '`axis=0` becomes `dim=0` and `keepdims=True` becomes `keepdim=True`, giving shape `(1, 3)`: one mean per column. `dim=1` averages each row instead, giving `(5, 1)`. `t.mean(0).unsqueeze(1)` puts the kept axis in the wrong place, `(3, 1)`, and `torch.mean(t, keepdim=True)` without a dim raises a `TypeError`.',
    difficulty: 'beginner',
  },
  {
    id: 'final-lab-pytorch.torch-exam-patterns.3',
    prompt: 'You want a check that stops the notebook cell, with a useful message, whenever `x` does not have shape `(2, 3)`. Which line does that?',
    options: [
      '`assert x.shape == (2, 3), x.shape`',
      '`assert (x.shape == (2, 3), x.shape)`',
      '`assert x.shape == [2, 3], x.shape`',
      '`assert x.size == (2, 3), x.shape`',
    ],
    answer: 0,
    explanation:
      '`x.shape` is a `torch.Size`, which compares equal to a tuple, and the text after the comma is printed when the assert fails. With outer brackets, the assert checks a two-item tuple, which is always true, so it never fires. A `torch.Size` never equals a list, so `== [2, 3]` fails even for the right shape, and `x.size` without brackets is a method, not a shape, so that assert always fails.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-pytorch.torch-exam-patterns.4',
    prompt:
      'You load features with NumPy, convert them with `t = torch.from_numpy(X)` and pass them to an `nn.Linear` layer. PyTorch raises `RuntimeError: mat1 and mat2 must have the same dtype, but got Double and Float`. What is the best fix?',
    options: ['Pass `t.float()` to the layer', 'Pass `t.long()` to the layer', 'Call `t.item()` before the layer', 'Wrap the call in `torch.no_grad()`'],
    answer: 0,
    explanation:
      'NumPy floats are float64 ("Double") and `torch.from_numpy` keeps that dtype, but layer weights are float32 ("Float"). `t.float()` converts the input to float32. `.long()` makes integers, which a linear layer also rejects; `.item()` only works on a one-number tensor; and `no_grad` turns off gradient tracking without changing any dtype.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-pytorch.torch-exam-patterns.5',
    prompt: 'You write a shape comment after every line of an attention function and check each one. Which bug can these shape checks **not** catch?',
    options: [
      'Calling `torch.softmax(scores, dim=-2)` instead of `dim=-1`',
      'Forgetting `.transpose(1, 2)` after splitting `K` into heads, with B = 2, T = 5, h = 3',
      'Joining a skip connection with `torch.cat(..., dim=0)` instead of `dim=1`',
      'Cropping a feature map to 115 × 115 when the comment says 114 × 114',
    ],
    answer: 0,
    explanation:
      'Softmax keeps the shape whichever dim it runs over, so `(B, h, T, T)` is still right; only a value check such as "rows sum to 1" notices. The other three all change a shape: `K` becomes `(2, 5, 3, 4)` instead of `(2, 3, 5, 4)`, concatenating on dim 0 doubles the batch instead of the channels, and 115 is not 114.',
    difficulty: 'intermediate',
  },
]

export default questions
