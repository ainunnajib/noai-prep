import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'text-as-data.rnns-and-lstms.1',
    prompt: 'An RNN updates its hidden state with $h_t = \\tanh(W_x x_t + W_h h_{t-1} + b)$. Which statement is true?',
    options: [
      'The same $W_x$, $W_h$ and $b$ are reused at every step, whatever the length of the sequence',
      'Each step has its own $W_h$, so a 50-word sentence needs 50 times the parameters',
      '$h_{t-1}$ is the previous word\'s embedding, so the model remembers only one word back',
      'The $\\tanh$ lets the hidden state grow without limit, so long sentences fit in full',
    ],
    answer: 0,
    explanation:
      'RNNs share their weights across time: one cell, reused at every step, which is why one RNN handles any length. $h_{t-1}$ is the previous *hidden state*, a summary of all the words so far, not just the last word. $\\tanh$ does the opposite of letting it grow: it squashes every number into $(-1, 1)$.',
    difficulty: 'beginner',
  },
  {
    id: 'text-as-data.rnns-and-lstms.2',
    prompt:
      'In one LSTM step the old cell state is $c_{t-1} = 0.8$, the forget gate is $f_t = 0.5$, the input gate is $i_t = 1$, the candidate is $\\tilde c_t = -0.2$ and the output gate is $o_t = 0$. What are $c_t$ and $h_t$?',
    options: ['$c_t = 0.2$ and $h_t = 0$', '$c_t = 0$ and $h_t = 0$', '$c_t = 0.6$ and $h_t = 0$', '$c_t = 0.2$ and $h_t = \\tanh(0.2)$'],
    answer: 0,
    explanation:
      '$c_t = f_t c_{t-1} + i_t \\tilde c_t = 0.5 \\times 0.8 + 1 \\times (-0.2) = 0.4 - 0.2 = 0.2$. Then $h_t = o_t \\tanh(c_t) = 0 \\times \\tanh(0.2) = 0$. The output gate hides the memory from the output but does **not** erase it: $c_t = 0.2$ is still carried to the next step. 0.6 comes from adding $0.2$ instead of subtracting it.',
    difficulty: 'intermediate',
  },
  {
    id: 'text-as-data.rnns-and-lstms.3',
    prompt: 'A plain RNN fails to learn that the verb at word 40 must agree with the subject at word 2. What is the main reason?',
    options: [
      'The gradient from word 40 to word 2 is a product of about 38 factors below 1, so almost none of it arrives',
      'The weights used at word 40 are different from those used at word 2, so the network cannot connect the two positions',
      'An RNN can only read a fixed number of words, usually around 10, and silently ignores everything after that',
      'The tanh function cannot output values that represent singular or plural, so the subject cannot be stored at all',
    ],
    answer: 0,
    explanation:
      'Backpropagation through time multiplies one factor ($w_h \\cdot \\tanh\'$) per step. With factors below 1 the product shrinks exponentially, e.g. $0.5^{38}$ is about $4 \\times 10^{-12}$: the vanishing-gradient problem, which blocks long-term dependencies. The weights are the same at every step, an RNN reads any number of words, and a hidden state can easily encode singular versus plural.',
    difficulty: 'intermediate',
  },
  {
    id: 'text-as-data.rnns-and-lstms.4',
    prompt: 'Compared with a plain RNN with the same input and hidden sizes, an LSTM:',
    options: [
      'has about 4 times as many weights and can carry information over many more steps',
      'has fewer weights, because its gates replace the recurrent matrix $W_h$',
      'trains faster, because its three gates process all the time steps in parallel',
      'never needs gradient clipping, because its gates also stop exploding gradients',
    ],
    answer: 0,
    explanation:
      'An LSTM computes four blocks from $[h_{t-1}, x_t]$ (forget, input and output gates plus the candidate), each the size of a plain RNN\'s weights, so about 4 times the parameters (in PyTorch, 1664 versus 416 for input 8 and hidden 16). Its additively updated cell state lets gradients survive many steps. It still reads one step at a time, so it is slower, and gradient clipping is still commonly used with LSTMs.',
    difficulty: 'intermediate',
  },
  {
    id: 'text-as-data.rnns-and-lstms.5',
    prompt:
      'An RNN encoder–decoder without attention translates short sentences well but long ones badly. The encoder passes only its final hidden state to the decoder. Which change is most likely to help the long sentences?',
    options: [
      'Let the decoder attend to all of the encoder\'s hidden states at every output step',
      'Use a larger output vocabulary so the decoder has more words to choose from',
      'Feed each source sentence through the encoder twice before decoding starts',
      'Replace the decoder\'s tanh with ReLU so that its hidden state can grow larger',
    ],
    answer: 0,
    explanation:
      'The problem is the bottleneck: a whole sentence, however long, must fit into one fixed-size context vector. Attention removes it by letting each decoder step take a weighted average of **all** encoder states, so nothing has to be squeezed into a single vector. A bigger vocabulary, a second pass or a different activation still leave the decoder with one fixed-size summary.',
    difficulty: 'beginner',
  },
]

export default questions
