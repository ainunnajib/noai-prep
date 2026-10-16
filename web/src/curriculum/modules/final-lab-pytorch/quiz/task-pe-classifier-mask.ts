import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'final-lab-pytorch.task-pe-classifier-mask.1',
    prompt:
      'The positional-encoding formula uses frequencies $1 / 10000^{2i/d_\\text{model}}$ for the column pairs $2i, 2i+1$. Which `div_term` line computes them correctly?',
    options: [
      '`torch.exp(torch.arange(0, d_model, 2).float() * -(math.log(10000.0) / d_model))`',
      '`torch.exp(torch.arange(0, d_model, 2).float() * (-10000.0 / d_model))`',
      '`torch.exp(torch.arange(0, d_model, 1).float() * -(math.log(10000.0) / d_model))`',
      '`torch.exp(torch.arange(0, d_model, 2).float() * (math.log(10000.0) / d_model))`',
    ],
    answer: 0,
    explanation:
      '$1/10000^{x} = e^{-x \\ln 10000}$, and `arange(0, d_model, 2)` gives the even numbers $2i$, so the exponent is $2i \\times (-\\ln 10000 / d_\\text{model})$. Using $-10000$ instead of $-\\ln 10000$ was 2026\'s intended bug: 253 of 256 frequencies underflow to 0. With a step of 1 instead of 2 there are twice too many frequencies and the next line crashes; without the minus sign the frequencies grow instead of shrinking.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-pytorch.task-pe-classifier-mask.2',
    prompt: 'With the correct positional encoding and $d_\\text{model} = 4$, what is the code for position 1 (to 2 decimal places)?',
    options: ['[0.84, 0.54, 0.01, 1.00]', '[0.84, 0.54, 0.84, 0.54]', '[0.54, 0.84, 1.00, 0.01]', '[0.84, 0.54, 0.00, 1.00]'],
    answer: 0,
    explanation:
      'The frequencies are $[1, 0.01]$, so position 1 gives $[\\sin 1, \\cos 1, \\sin 0.01, \\cos 0.01] \\approx [0.84, 0.54, 0.01, 1.00]$. Repeating $[0.84, 0.54]$ forgets that the second pair is slower; $[0.54, 0.84, \\ldots]$ swaps sin and cos; and $[0.84, 0.54, 0.00, 1.00]$ is exactly what the buggy line produces, because its second frequency is 0.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-pytorch.task-pe-classifier-mask.3',
    prompt:
      'Inside `TransformerClassifier.forward`, `attention_mask` has shape `(B, T)` and the attention scores have shape `(B, h, T, T)`. Which conversion lets the mask broadcast correctly in `masked_fill(mask == 0, -1e9)`?',
    options: [
      '`attention_mask.unsqueeze(1).unsqueeze(2)`, giving `(B, 1, 1, T)`',
      '`attention_mask.unsqueeze(-1).unsqueeze(-1)`, giving `(B, T, 1, 1)`',
      '`attention_mask.unsqueeze(1)`, giving `(B, 1, T)`',
      '`attention_mask.unsqueeze(0).unsqueeze(0)`, giving `(1, 1, B, T)`',
    ],
    answer: 0,
    explanation:
      'Broadcasting lines shapes up from the right. $(B, 1, 1, T)$ matches the batch axis, stretches over the $h$ heads and the $T$ query rows, and hides key column $j$ wherever token $j$ is padding. $(B, T, 1, 1)$ would put the token axis where the heads are. $(B, 1, T)$ is read as $(1, B, 1, T)$, so its $B$ lines up with the head axis: it crashes when $B \\ne h$, and when $B = h$ it silently applies sentence $b$\'s mask to head $b$ of every sentence, so it is only right when $B = 1$. $(1, 1, B, T)$ treats batch items as query rows.',
    difficulty: 'intermediate',
  },
  {
    id: 'final-lab-pytorch.task-pe-classifier-mask.4',
    prompt:
      'A classifier uses `pooled = x.mean(dim=1)` after the encoder and runs in `eval()` mode. Two inputs are identical except for the ids of their padding tokens, and both use the same attention mask. Their logits differ. Why?',
    options: [
      'The mean also averages the padding tokens\' output vectors, which depend on their ids',
      'The attention mask is ignored inside the encoder layers, so the padding leaks through attention',
      'The positional encoding gives padding positions different codes in the two inputs',
      'Dropout still randomly zeroes some numbers in evaluation mode, so each run differs',
    ],
    answer: 0,
    explanation:
      'The mask stops real tokens attending to padding, but each padding position still gets its own output vector, built from its embedding. `x.mean(dim=1)` divides by all $T$ positions, so those vectors enter the sentence vector. Masked mean pooling, `(x * m).sum(1) / m.sum(1)`, removes them; in our check the change in the logits went from 0.0653 to exactly 0. Positional codes depend only on position, and dropout is off in `eval()`.',
    difficulty: 'advanced',
  },
  {
    id: 'final-lab-pytorch.task-pe-classifier-mask.5',
    prompt:
      'The test for `create_causal_mask(5)` asserts that the shape is `(1, 1, 5, 5)` and that `torch.allclose(mask.squeeze(), torch.tril(torch.ones(5, 5)))`. Which body passes?',
    options: [
      '`return torch.tril(torch.ones(seq_len, seq_len)).unsqueeze(0).unsqueeze(0)`',
      '`return torch.tril(torch.ones(seq_len, seq_len)).bool().unsqueeze(0).unsqueeze(0)`',
      '`return torch.triu(torch.ones(seq_len, seq_len), diagonal=1).unsqueeze(0).unsqueeze(0)`',
      '`return torch.tril(torch.ones(seq_len, seq_len))`',
    ],
    answer: 0,
    explanation:
      'A float lower triangle with two extra axes passes both checks. The bool version has the right pattern but `allclose` refuses to compare it with floats ("Bool did not match Float"). `triu(..., diagonal=1)` marks the future with 1s, the opposite convention. Without the `unsqueeze` calls the shape is $(5, 5)$, so the shape assertion fails.',
    difficulty: 'intermediate',
  },
]

export default questions
