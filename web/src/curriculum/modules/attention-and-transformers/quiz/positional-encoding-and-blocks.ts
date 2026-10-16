import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'attention-and-transformers.positional-encoding-and-blocks.1',
    prompt: 'Why does a Transformer add positional encodings to its token embeddings?',
    options: [
      'Self-attention on its own ignores word order, so without them shuffling the words only shuffles the outputs',
      'Softmax needs every attention score to be positive, and the encodings shift the scores so that none of them is below zero',
      'They cut the cost of attention from quadratic to linear in the sequence length by letting each token skip distant tokens',
      'They rescale every embedding to length 1, so that the dot products between tokens always stay between −1 and 1',
    ],
    answer: 0,
    explanation:
      'Each attention output is a weighted sum over all tokens, computed from their contents only, so self-attention without a causal mask is blind to order: "dog bites man" and "man bites dog" give the same outputs, just rearranged. Adding a position vector makes the same word at different positions a different input. Softmax works fine with negative scores, positional encodings do nothing to the $O(T^2)$ cost, and they are added to the embeddings rather than rescaling them.',
    difficulty: 'beginner',
  },
  {
    id: 'attention-and-transformers.positional-encoding-and-blocks.2',
    prompt:
      'In sinusoidal positional encoding, $\\text{PE}(\\text{pos}, 2i) = \\sin(\\text{pos}/10000^{2i/d})$ and $\\text{PE}(\\text{pos}, 2i+1) = \\cos(\\text{pos}/10000^{2i/d})$. With $d = d_\\text{model} = 8$, dimensions 4 and 5 share one denominator $10000^{2i/d}$. What is it?',
    options: ['100', '10', '1000', '10000'],
    answer: 0,
    explanation:
      'Dimensions 4 and 5 form pair $i = 2$, so the exponent is $2i/d = 4/8 = 1/2$ and $10000^{1/2} = 100$. Using $i/d = 2/8$ instead gives $10000^{1/4} = 10$, and $1000 = 10000^{6/8}$ belongs to the next pair, dimensions 6 and 7.',
    difficulty: 'intermediate',
  },
  {
    id: 'attention-and-transformers.positional-encoding-and-blocks.3',
    prompt:
      'Inside a Transformer block, `x` has shape `(4, 10, 64)` for $(B, T, d_\\text{model})$ and `attn(x)` returns a tensor of the same shape. What is the shape of the FFN\'s hidden activations (after the ReLU), and of `y`?',
    code: 'ff = nn.Sequential(nn.Linear(64, 256), nn.ReLU(), nn.Linear(256, 64))\nh = norm1(x + attn(x))\ny = norm2(h + ff(h))',
    options: ['`(4, 10, 256)` and `(4, 10, 64)`', '`(4, 10, 256)` and `(4, 10, 256)`', '`(4, 256, 64)` and `(4, 10, 64)`', '`(4, 10, 10)` and `(4, 10, 64)`'],
    answer: 0,
    explanation:
      '`nn.Linear` acts on the last axis, so each of the $4 \\times 10$ tokens is processed separately: 64 numbers become 256 after the first layer and ReLU, then 64 again. The residual sum `h + ff(h)` needs matching shapes, and LayerNorm keeps the shape, so `y` is `(4, 10, 64)`. A $10 \\times 10$ table is the shape of an attention weight matrix, not of the FFN.',
    difficulty: 'intermediate',
  },
  {
    id: 'attention-and-transformers.positional-encoding-and-blocks.4',
    prompt:
      'An encoder–decoder Transformer is translating a 12-token English sentence. The decoder has produced 7 French tokens so far. Ignoring the batch, what is the shape of one head\'s **cross-attention** weight matrix in the decoder?',
    options: ['$7 \\times 12$', '$12 \\times 7$', '$12 \\times 12$', '$7 \\times 7$'],
    answer: 0,
    explanation:
      'In cross-attention the queries come from the decoder (7 French tokens, the rows) and the keys and values come from the encoder output (12 English tokens, the columns), so the weights are $7 \\times 12$, each row summing to 1. $12 \\times 7$ swaps the roles of queries and keys; $7 \\times 7$ is the decoder\'s masked self-attention and $12 \\times 12$ is the encoder\'s self-attention.',
    difficulty: 'intermediate',
  },
  {
    id: 'attention-and-transformers.positional-encoding-and-blocks.5',
    prompt:
      'A team runs a Transformer with sinusoidal positional encoding on documents of 8,192 tokens instead of 4,096, changing nothing else. What happens to the memory for the self-attention score tables and to the number of model weights?',
    options: [
      'The score tables need about 4 times the memory, and the number of weights stays exactly the same',
      'The score tables need about 2 times the memory, and the number of weights doubles',
      'The score tables need about 4 times the memory, and the number of weights also quadruples',
      'The score tables need about 2 times the memory, and the number of weights stays the same',
    ],
    answer: 0,
    explanation:
      'Each head stores a $T \\times T$ table, so doubling $T$ multiplies it by $2^2 = 4$. The weights ($W_Q$, $W_K$, $W_V$, $W_O$, the FFN, LayerNorm) do not depend on $T$, and sinusoidal encodings are computed rather than learned, so the parameter count is unchanged. "2 times" would be true of the token vectors and the FFN work, which grow linearly in $T$.',
    difficulty: 'beginner',
  },
]

export default questions
