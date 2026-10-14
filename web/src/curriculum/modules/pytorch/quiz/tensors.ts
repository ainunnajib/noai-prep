import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'pytorch.tensors.1',
    prompt: 'What are the dtypes of `a` and `b`?',
    code: 'a = torch.tensor([1, 2, 3])\nb = torch.Tensor([1, 2, 3])',
    options: ['`a` is int64, `b` is float32', 'both are float32', 'both are int64', '`a` is int64, `b` is float64'],
    answer: 0,
    explanation:
      'Lowercase `torch.tensor` infers the dtype from the data, and whole numbers give int64. Capital `torch.Tensor` is the class constructor, which always gives the default float type, float32. float64 is NumPy’s default float, not PyTorch’s, so it is the trap here.',
    difficulty: 'beginner',
  },
  {
    id: 'pytorch.tensors.2',
    prompt: 'What does this code print?',
    code: 'x = torch.zeros(3, 4)\ny = x.unsqueeze(1)\nz = y.squeeze()\nprint(y.shape, z.shape)',
    options: [
      '`torch.Size([3, 1, 4]) torch.Size([3, 4])`',
      '`torch.Size([1, 3, 4]) torch.Size([3, 4])`',
      '`torch.Size([3, 4, 1]) torch.Size([3, 4])`',
      '`torch.Size([3, 1, 4]) torch.Size([3, 1, 4])`',
    ],
    answer: 0,
    explanation:
      '`unsqueeze(1)` inserts a size-1 axis at position 1, between the 3 and the 4, giving (3, 1, 4). `squeeze()` with no argument removes every size-1 axis, so z is back to (3, 4). (1, 3, 4) would come from `unsqueeze(0)` and (3, 4, 1) from `unsqueeze(2)` or `unsqueeze(-1)`.',
    difficulty: 'beginner',
  },
  {
    id: 'pytorch.tensors.3',
    prompt:
      'A NumPy pipeline gives you a batch of colour images `x` with shape `(16, 64, 64, 3)`, in (N, H, W, C) order. Which line converts it to the (N, C, H, W) layout that `nn.Conv2d` expects, with every pixel in its correct place?',
    options: ['`x.permute(0, 3, 1, 2)`', '`x.permute(0, 2, 3, 1)`', '`x.reshape(16, 3, 64, 64)`', '`x.transpose(1, 3)`'],
    answer: 0,
    explanation:
      'Each permute argument names an old axis: new order N (old 0), C (old 3), H (old 1), W (old 2), so `permute(0, 3, 1, 2)` gives (16, 3, 64, 64). `reshape(16, 3, 64, 64)` has the right shape but pours the numbers in stored order and scrambles the pixels. `transpose(1, 3)` also gives (16, 3, 64, 64), but its axes are (N, C, W, H): every image is flipped over its diagonal. `permute(0, 2, 3, 1)` gives (16, 64, 3, 64).',
    difficulty: 'intermediate',
  },
  {
    id: 'pytorch.tensors.4',
    prompt:
      '`Q` and `K` both have shape `(2, 8, 10, 16)`, meaning (batch, heads, tokens, head size). After `scores = Q @ K.transpose(-2, -1)`, what is the shape of `scores`, and which `dim` must softmax use so that each query’s weights over the keys sum to 1?',
    options: ['`(2, 8, 10, 10)`, with `dim=-1`', '`(2, 8, 10, 10)`, with `dim=-2`', '`(2, 8, 16, 16)`, with `dim=-1`', '`(2, 8, 10, 16)`, with `dim=1`'],
    answer: 0,
    explanation:
      '`K.transpose(-2, -1)` is (2, 8, 16, 10). The batch dims (2, 8) match, and each product is (10 × 16) @ (16 × 10) = (10 × 10), so scores is (2, 8, 10, 10): rows are queries, columns are keys. Normalising across the keys means along the last dim, `dim=-1`. `dim=-2` would make each key’s column sum to 1 instead, and (16, 16) comes from multiplying in the wrong order.',
    difficulty: 'intermediate',
  },
  {
    id: 'pytorch.tensors.5',
    prompt: 'Why does the last line raise `RuntimeError: view size is not compatible with input tensor’s size and stride`?',
    code: 'w = torch.randn(4, 6)\nwt = w.T\nflat = wt.view(24)',
    options: [
      '`wt` is not contiguous: transposing only changed its strides, so its numbers are not stored in reading order',
      '`view` must keep the number of rows, so a (6, 4) tensor can only be viewed as another shape with 6 rows',
      '`view` only works on 1-D tensors, so `wt` has to be flattened with `wt.flatten()` before it can be viewed',
      '`w.T` copies the data into float64, and `view` refuses any tensor whose dtype differs from the original',
    ],
    answer: 0,
    explanation:
      '`.T` (like `permute` and `transpose`) moves no data: it just changes the strides, so reading `wt` row by row jumps around memory and `wt.is_contiguous()` is False. `view` can only relabel memory that is already in reading order. Use `wt.reshape(24)`, which copies when it must, or `wt.contiguous().view(24)`. The size is fine (24 elements either way), `view` works on tensors of any rank and may change the number of rows, and `.T` never changes the dtype.',
    difficulty: 'intermediate',
  },
]

export default questions
