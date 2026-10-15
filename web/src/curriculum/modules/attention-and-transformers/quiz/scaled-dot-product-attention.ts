import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'attention-and-transformers.scaled-dot-product-attention.1',
    prompt: 'Which expression is scaled dot-product attention for queries $Q$, keys $K$ and values $V$, with key dimension $d_k$?',
    options: [
      '$\\operatorname{softmax}\\!\\left(QK^\\top / \\sqrt{d_k}\\right) V$',
      '$\\operatorname{softmax}\\!\\left(Q^\\top K / \\sqrt{d_k}\\right) V$',
      '$\\operatorname{softmax}\\!\\left(QK^\\top / d_k\\right) V$',
      '$\\operatorname{softmax}\\!\\left(QK^\\top V\\right) / \\sqrt{d_k}$',
    ],
    answer: 0,
    explanation:
      'Queries are rows of $Q$ and keys are rows of $K$, so $QK^\\top$ gives the $T \\times T$ table of every query–key dot product. It is divided by $\\sqrt{d_k}$, softmaxed row by row, then multiplied by $V$. $Q^\\top K$ would be a $d_k \\times d_k$ table comparing features, not tokens; dividing by $d_k$ over-shrinks the scores; and the scaling must happen **before** the softmax, not after it.',
    difficulty: 'beginner',
  },
  {
    id: 'attention-and-transformers.scaled-dot-product-attention.2',
    prompt:
      'A batch of 8 sentences of 20 tokens has queries and keys of shape `(8, 20, 64)` and values of shape `(8, 20, 32)`. What are the shapes of the attention weights and the attention output?',
    options: [
      'weights `(8, 20, 20)`, output `(8, 20, 32)`',
      'weights `(8, 64, 64)`, output `(8, 20, 32)`',
      'weights `(8, 20, 20)`, output `(8, 20, 64)`',
      'weights `(8, 20, 64)`, output `(8, 64, 32)`',
    ],
    answer: 0,
    explanation:
      'Each of the 20 queries is scored against each of the 20 keys, so the scores and weights are $(8, 20, 20)$; the 64 features are summed away inside each dot product. The output is $(20, 20)$ times $(20, 32)$ for each sentence, so $(8, 20, 32)$: one row per token, as long as a **value** (32), not as long as a key (64).',
    difficulty: 'intermediate',
  },
  {
    id: 'attention-and-transformers.scaled-dot-product-attention.3',
    prompt:
      'A student deletes the division by $\\sqrt{d_k}$ from a model with $d_k = 256$, whose query and key entries have mean 0 and variance 1. The code still runs. What goes wrong?',
    options: [
      'The scores have a standard deviation of about 16, so softmax becomes almost one-hot and its gradients nearly vanish',
      'The scores have a standard deviation of about 256, so softmax overflows and every weight becomes `nan`',
      'The attention weights no longer add up to 1 in each row, so the output is no longer an average of the values',
      'The weight matrix changes shape from $(T, T)$ to $(T, d_k)$, so the multiplication by $V$ fails',
    ],
    answer: 0,
    explanation:
      'A dot product of 256 unit-variance terms has variance 256 and standard deviation $\\sqrt{256} = 16$. Scores that far apart push softmax into saturation: nearly all the weight lands on one key, and the gradient $p(1-p)$ is close to 0, so learning stalls. The rows still sum to 1 and the shapes are unchanged, which is why the bug is silent; 256 is the variance, not the standard deviation, and a stable softmax does not produce `nan` here.',
    difficulty: 'intermediate',
  },
  {
    id: 'attention-and-transformers.scaled-dot-product-attention.4',
    prompt:
      'A row of scaled scores is $[2, 2, 5]$, and a causal mask blocks the third position. What are the attention weights for this row?',
    options: ['$[0.5, 0.5, 0]$', '$[0.05, 0.05, 0.9]$', '$[0.47, 0.47, 0.06]$', '$[\\tfrac13, \\tfrac13, \\tfrac13]$'],
    answer: 0,
    explanation:
      'The blocked score becomes $-\\infty$, so the row is $[2, 2, -\\infty]$ and $e^{-\\infty} = 0$. The two remaining scores are equal, so they share the weight equally: $[0.5, 0.5, 0]$. Ignoring the mask gives about $[0.05, 0.05, 0.9]$, letting the token peek at the future. Writing 0 instead of $-\\infty$ gives $[2, 2, 0]$ and about $[0.47, 0.47, 0.06]$: the blocked position still leaks weight because $e^0 = 1$.',
    difficulty: 'beginner',
  },
  {
    id: 'attention-and-transformers.scaled-dot-product-attention.5',
    prompt: '`scores` has shape `(T, T)`, rows are queries and columns are keys. Which line correctly applies a causal mask before the softmax?',
    options: [
      "`scores.masked_fill(torch.triu(torch.ones(T, T), diagonal=1) == 1, float('-inf'))`",
      "`scores.masked_fill(torch.triu(torch.ones(T, T)) == 1, float('-inf'))`",
      "`scores.masked_fill(torch.tril(torch.ones(T, T)) == 1, float('-inf'))`",
      "`scores.masked_fill(torch.triu(torch.ones(T, T), diagonal=1) == 0, float('-inf'))`",
    ],
    answer: 0,
    explanation:
      '`triu(..., diagonal=1)` has 1s strictly above the diagonal, exactly the future keys $j > i$, so blocking where it equals 1 is correct. Without `diagonal=1`, `triu` also covers the diagonal, so the first row is blocked completely and becomes `nan`. Blocking where `tril` is 1 hides the past and the token itself, and blocking where `triu(diagonal=1)` is 0 lets each token see only the future: both use the mask with the wrong convention.',
    difficulty: 'advanced',
  },
]

export default questions
