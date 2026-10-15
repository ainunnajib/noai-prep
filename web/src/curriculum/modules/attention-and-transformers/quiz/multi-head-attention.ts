import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'attention-and-transformers.multi-head-attention.1',
    prompt: 'A Transformer layer has $d_\\text{model} = 512$ and uses 8 attention heads. What is the head size $d_k$?',
    options: ['64', '512', '4096', '8'],
    answer: 0,
    explanation:
      'Each head gets an equal slice of the features: $d_k = d_\\text{model} / h = 512 / 8 = 64$. A common mistake is to think every head works on the full 512 numbers; another is to multiply ($512 \\times 8 = 4096$) instead of divide.',
    difficulty: 'beginner',
  },
  {
    id: 'attention-and-transformers.multi-head-attention.2',
    prompt: 'With $B = 2$, $T = 10$, $d_\\text{model} = 512$ and 8 heads, what is the shape of `Q` after this line?',
    code: 'Q = W_q(x).view(B, T, 8, 64).transpose(1, 2)',
    options: ['`(2, 8, 10, 64)`', '`(2, 10, 8, 64)`', '`(2, 8, 64, 10)`', '`(16, 10, 64)`'],
    answer: 0,
    explanation:
      '`view` gives $(B, T, h, d_k) = (2, 10, 8, 64)$, then `transpose(1, 2)` swaps axes 1 and 2, giving $(B, h, T, d_k) = (2, 8, 10, 64)$. `(2, 10, 8, 64)` is the shape before the transpose; `(2, 8, 64, 10)` would need `transpose(-2, -1)` as well; `(16, 10, 64)` merges the batch and head axes, which would take an extra `reshape`.',
    difficulty: 'intermediate',
  },
  {
    id: 'attention-and-transformers.multi-head-attention.3',
    prompt:
      'After attention, `out` has shape $(B, h, T, d_k)$ and is a fresh tensor from `attn @ V`. Which line correctly merges the heads back into shape $(B, T, d_\\text{model})$ with each token\'s own numbers?',
    options: [
      '`out.transpose(1, 2).contiguous().view(B, T, d_model)`',
      '`out.contiguous().transpose(1, 2).view(B, T, d_model)`',
      '`out.contiguous().view(B, T, d_model)`',
      '`out.transpose(2, 3).contiguous().view(B, T, d_model)`',
    ],
    answer: 0,
    explanation:
      'First `transpose(1, 2)` puts the token axis back in front of the head axis, then `contiguous()` copies the data into that order so `view` can glue the $h$ chunks of each token together. Calling `contiguous()` before the transpose does not help: the transposed tensor is out of order again, so `view` raises a RuntimeError. Leaving out `transpose(1, 2)`, or swapping axes 2 and 3 instead, runs without an error but glues together numbers from different tokens.',
    difficulty: 'intermediate',
  },
  {
    id: 'attention-and-transformers.multi-head-attention.4',
    prompt:
      'A multi-head attention layer with $d_\\text{model} = 8$ uses `nn.Linear(8, 8)` (with bias) for each of $W_Q$, $W_K$, $W_V$ and $W_O$. A student changes the number of heads from 2 to 4. How many parameters does the layer have after the change?',
    options: ['288', '576', '256', '72'],
    answer: 0,
    explanation:
      'Each `nn.Linear(8, 8)` has $8 \\times 8 = 64$ weights plus 8 biases, so 72; four of them give $4 \\times 72 = 288$. The heads only slice these matrices, so the count is 288 with 2 heads and still 288 with 4. Doubling it to 576 assumes extra heads add weights, 256 forgets the biases, and 72 counts only one of the four layers.',
    difficulty: 'intermediate',
  },
  {
    id: 'attention-and-transformers.multi-head-attention.5',
    prompt:
      'Researchers inspect a trained Transformer. In one layer, head 3 almost always attends to the previous token, while head 7 links each verb to its subject. What best explains why the heads behave differently?',
    options: [
      'Each head has its own learned query, key and value projections, so training can shape every head into its own pattern',
      'Each head is given a different subset of the tokens, so head 3 sees the early words and head 7 sees the later words',
      'The programmer gives each head a fixed rule, such as "attend to the previous token", before training of the model begins',
      'Each head uses a different softmax temperature, so the heads differ in sharpness while sharing the same projections',
    ],
    answer: 0,
    explanation:
      'All heads see every token, but each has its own slices of $W_Q$, $W_K$ and $W_V$. They start random, and training pushes them towards whatever patterns help. Heads split the **features** of each token, not the tokens, and no rule is programmed in by hand. Nor do the heads share projections and differ only in temperature: every head uses the same $\\sqrt{d_k}$ scaling.',
    difficulty: 'beginner',
  },
]

export default questions
