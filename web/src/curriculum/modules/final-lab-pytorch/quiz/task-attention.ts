import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'final-lab-pytorch.task-attention.1',
    prompt: '`query` and `key` both have shape `(B, h, T, d_k)`. Which line computes the scaled attention scores with shape `(B, h, T, T)`?',
    options: [
      '`torch.matmul(query, key.transpose(-2, -1)) / math.sqrt(d_k)`',
      '`torch.matmul(query, key.T) / math.sqrt(d_k)`',
      '`torch.matmul(query.transpose(-2, -1), key) / math.sqrt(d_k)`',
      '`torch.matmul(query, key.transpose(0, 1)) / math.sqrt(d_k)`',
    ],
    answer: 0,
    explanation:
      '`transpose(-2, -1)` swaps only the last two axes, so the key becomes $(B, h, d_k, T)$ and $(T \\times d_k) @ (d_k \\times T)$ gives $(B, h, T, T)$. On a 4-axis tensor `key.T` reverses **all** axes to $(d_k, T, h, B)$, so the matmul crashes. Transposing the query instead gives $(B, h, d_k, d_k)$, and `transpose(0, 1)` swaps the batch and head axes.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-pytorch.task-attention.2',
    prompt:
      'Every entry of the query and key vectors has mean 0 and variance 1, and $d_k = 64$. What is the typical size (standard deviation) of a score $q \\cdot k$ before scaling, and after dividing by $\\sqrt{d_k}$?',
    options: ['8 before scaling and 1 after', '64 before scaling and 8 after', '64 before scaling and 1 after', '8 before scaling and 0.125 after'],
    answer: 0,
    explanation:
      '$q \\cdot k$ is a sum of 64 products, each with variance 1, so its variance is 64 and its standard deviation is $\\sqrt{64} = 8$. Dividing by $\\sqrt{d_k} = 8$ gives standard deviation $8 / 8 = 1$. "64" is the variance, not the typical size, and 0.125 would come from dividing by $d_k$ instead of $\\sqrt{d_k}$.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-pytorch.task-attention.3',
    prompt:
      'A padding query has **every** key in its row masked. What does softmax give for that row if the masked scores are filled with `-1e9`, compared with `float("-inf")`?',
    options: [
      '`-1e9` gives a uniform row (harmless); `-inf` gives a row of `nan`',
      '`-1e9` gives a row of `nan`; `-inf` gives a uniform row',
      'Both give a row of zeros, because the whole row is hidden',
      '`-1e9` gives zeros; `-inf` gives a uniform row',
    ],
    answer: 0,
    explanation:
      'With `-1e9` all the scores in the row are equal, so softmax spreads the weight evenly: harmless. With $-\\infty$ every $e^{s}$ is 0, and softmax computes $0/0$ = `nan`, which then spreads through later layers. A softmax row can never be all zeros, because its weights must add up to 1. That is why the 2026 notebook said not to use `-inf`.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-pytorch.task-attention.4',
    prompt:
      'A student writes `Q = self.W_q(query).view(batch_size, self.num_heads, -1, self.d_k)` in `MultiHeadAttention.forward` and does no transpose. The notebook test cell prints a tick, but the hidden value tests fail. Why?',
    options: [
      '`view` cuts memory in token order, so the heads receive scrambled slices of the tokens',
      '`view` needs `.contiguous()` first, so the projection is silently copied wrongly',
      'The `-1` makes PyTorch guess the sequence length, which it gets wrong for $h > 1$',
      'Each head should see the full token vector, so `self.d_k` should be `self.d_model`',
    ],
    answer: 0,
    explanation:
      'The projection has shape $(B, T, d_\\text{model})$, stored token after token. Viewing it directly as $(B, h, T, d_k)$ fills head 0\'s rows with consecutive chunks of token 0, then token 1, and so on: the shape is right but the numbers are scrambled. The fix is `.view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)`. The output of `W_q` is already contiguous, `-1` is always worked out exactly, and each head is meant to see only its own $d_k$ numbers.',
    difficulty: 'advanced',
  },
  {
    id: 'final-lab-pytorch.task-attention.5',
    prompt: 'The docstring says the mask uses "1 = keep, 0 = mask out". Which line applies it correctly, before the softmax?',
    options: [
      '`scores = scores.masked_fill(mask == 0, -1e9)`',
      '`scores = scores.masked_fill(mask == 1, -1e9)`',
      '`scores = scores * mask`',
      '`scores = scores.masked_fill(mask == 0, 0)`',
    ],
    answer: 0,
    explanation:
      '`masked_fill(cond, value)` writes `value` wherever `cond` is True, so `mask == 0` targets the hidden positions and $-10^9$ makes their softmax weight exactly 0. `mask == 1` hides the real tokens instead. Multiplying by the mask, or filling with 0, sets hidden scores to 0, and $e^0 = 1$, so those keys still get weight.',
    difficulty: 'beginner',
  },
]

export default questions
