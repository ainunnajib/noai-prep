import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'attention-and-transformers.attention-intuition.1',
    prompt: 'In attention, what is compared to produce the scores, and what does the output average?',
    options: [
      'The query is compared with each key; the output is a weighted average of the values',
      'The query is compared with each value; the output is a weighted average of the keys',
      'Each key is compared with each value; the output is a weighted average of the queries',
      'The query is compared with each key; the output is the one value whose key scores highest',
    ],
    answer: 0,
    explanation:
      'Scores are dot products $q \\cdot k_i$ between the query and every key; softmax turns them into weights, and the output is $\\sum_i a_i v_i$, a weighted average of the **values**. Returning only the best-matching value is a hard (dictionary) lookup, which attention deliberately replaces with a smooth blend.',
    difficulty: 'beginner',
  },
  {
    id: 'attention-and-transformers.attention-intuition.2',
    prompt:
      'An attention step has produced the weights $[0.5, 0.25, 0.25]$ for three values $v_1 = [2, 0]$, $v_2 = [0, 4]$ and $v_3 = [4, 4]$. What is the output?',
    options: ['$[2, 2]$', '$[2, 0]$', '$[2, 2.67]$', '$[6, 8]$'],
    answer: 0,
    explanation:
      'Multiply each value by its weight and add: $0.5 \\times [2, 0] + 0.25 \\times [0, 4] + 0.25 \\times [4, 4] = [1, 0] + [0, 1] + [1, 1] = [2, 2]$. $[2, 0]$ is a hard lookup of the biggest weight, $[2, 2.67]$ is the plain average that ignores the weights, and $[6, 8]$ is the plain sum.',
    difficulty: 'beginner',
  },
  {
    id: 'attention-and-transformers.attention-intuition.3',
    prompt: 'Why does attention pass the scores through softmax instead of using the raw dot products as the weights?',
    options: [
      'So the weights are positive and add up to 1, making the output a proper weighted average of the values',
      'So exactly one key gets weight 1 and all the others get weight 0, just as in a dictionary lookup',
      'So the dot products become smaller numbers, which makes the computation run faster on a GPU',
      'So keys pointing away from the query get large negative weights that cancel out the matching values',
    ],
    answer: 0,
    explanation:
      'Raw dot products can be negative and can add up to anything, so they would not give an average. Softmax computes $e^{s_i} / \\sum_j e^{s_j}$: every weight is positive and they sum to 1. It never produces exact 0s and 1s (that would be a hard lookup with no useful gradient), and it never produces negative weights.',
    difficulty: 'intermediate',
  },
  {
    id: 'attention-and-transformers.attention-intuition.4',
    prompt: 'What does this code print?',
    code: 'import numpy as np\nq = np.ones(8)          # one query\nK = np.ones((5, 8))     # 5 keys, one per row\nV = np.ones((5, 3))     # 5 values, one per row\ns = K @ q\nw = np.exp(s) / np.exp(s).sum()\nout = w @ V\nprint(out.shape)',
    options: ['`(3,)`', '`(5,)`', '`(8,)`', '`(5, 3)`'],
    answer: 0,
    explanation:
      '`K @ q` gives one score per key, shape `(5,)`, and so does `w`. Then `w @ V` is a weighted average of the 5 rows of `V`, giving one vector as long as a value: shape `(3,)`. `(5,)` is the shape of the weights, not the output, and the output never has the query length 8 unless the values do.',
    difficulty: 'intermediate',
  },
  {
    id: 'attention-and-transformers.attention-intuition.5',
    prompt:
      'A model reads "I deposited cash at the bank" and "We had a picnic on the river bank". Before attention, "bank" has the same embedding in both sentences. Why is its vector different after a self-attention layer?',
    options: [
      'Its new vector is a weighted mix of the values of the words around it, and those words differ',
      'Its attention weights are learned parameters, stored separately for every sentence it has seen',
      'The matrices $W_Q$, $W_K$ and $W_V$ are retrained on each new sentence before it is read',
      'The tokeniser gives "bank" a different token id depending on the words that surround it',
    ],
    answer: 0,
    explanation:
      'Self-attention outputs $\\sum_j a_j v_j$ over the whole sentence, so "bank" absorbs "cash" in one sentence and "river" in the other: a contextual embedding. The weights are computed fresh from each input; the learned matrices stay fixed after training, and the tokeniser gives "bank" the same id every time.',
    difficulty: 'intermediate',
  },
]

export default questions
