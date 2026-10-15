import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'pretrained-models-text-speech.encoder-decoder-models.1',
    prompt:
      'A translation model with 8 attention heads processes a batch of 16 sentences. Each source sentence has 30 tokens and the target sentences have 12 tokens. What is the shape of the cross-attention weight tensor in one decoder layer?',
    options: ['`(16, 8, 12, 30)`', '`(16, 8, 30, 12)`', '`(16, 8, 12, 12)`', '`(16, 8, 30, 30)`'],
    answer: 0,
    explanation:
      'Cross-attention has one row per query (the 12 target tokens, from the decoder) and one column per key (the 30 source tokens, from the encoder), for each of the 16 sentences and 8 heads: `(16, 8, 12, 30)`. `(16, 8, 12, 12)` is the decoder\'s self-attention, and `(16, 8, 30, 30)` is the encoder\'s self-attention.',
    difficulty: 'intermediate',
  },
  {
    id: 'pretrained-models-text-speech.encoder-decoder-models.2',
    prompt:
      '`enc_out` has shape `(2, 7, 16)` (7 source tokens) and `dec_x` has shape `(2, 5, 16)` (5 target tokens). A student writes the cross-attention call below. What goes wrong?',
    code: 'cross = nn.MultiheadAttention(16, num_heads=4, batch_first=True)\nout, w = cross(query=enc_out, key=dec_x, value=dec_x)',
    options: [
      '`out` has shape `(2, 7, 16)`: one vector per source token, so the decoder gets no vector for each of its 5 positions to predict from',
      'It raises an error, because the query and the keys must have the same number of tokens for the matrix product to work',
      'Nothing: attention is symmetric, so swapping the query with the key and value gives exactly the same output tensor',
      '`out` has shape `(2, 5, 16)` but each row of `w` sums to 7, so the softmax has to be applied a second time afterwards',
    ],
    answer: 0,
    explanation:
      'The output of attention always has one vector per query. With the encoder output as the query, `out` is `(2, 7, 16)` and `w` is `(2, 7, 5)`, the wrong way round. The query and key lengths may differ (that is the whole point of cross-attention), and attention is not symmetric because the queries decide whose output is produced.',
    difficulty: 'intermediate',
  },
  {
    id: 'pretrained-models-text-speech.encoder-decoder-models.3',
    prompt: 'Why does the cross-attention in an encoder-decoder model NOT need a causal mask, while the decoder\'s self-attention does?',
    options: [
      'The whole input is known before decoding starts, so any output word may look at any input word; only future output words must stay hidden',
      'Cross-attention has no softmax, so there are no attention weights to which a mask could be applied in the first place',
      'Cross-attention already uses the decoder\'s causal mask through the residual connection, so adding a second mask would hide too much',
      'A causal mask can only be applied when the query and key sequences have exactly the same length, which is rarely true across languages',
    ],
    answer: 0,
    explanation:
      'The causal mask stops the decoder from seeing output words it has not yet produced (which it would otherwise just copy during training). The source sentence is fully available from the start, so cross-attention may use all of it. Cross-attention does use a softmax, and masks can have any rectangular shape.',
    difficulty: 'beginner',
  },
  {
    id: 'pretrained-models-text-speech.encoder-decoder-models.4',
    prompt:
      'An encoder-decoder model translates a 20-token sentence into a 15-token output (including `</s>`) with greedy decoding, recomputing everything at each step. How many times do the encoder and the decoder run?',
    options: ['Encoder 1 time, decoder 15 times', 'Encoder 15 times, decoder 15 times', 'Encoder 20 times, decoder 15 times', 'Encoder 1 time, decoder 1 time'],
    answer: 0,
    explanation:
      'The encoder reads the whole source once and its memory is reused at every step. The decoder runs once per output token, 15 times, each time predicting one more token. Running both only once describes training with teacher forcing, where the whole correct output is fed in at once.',
    difficulty: 'beginner',
  },
  {
    id: 'pretrained-models-text-speech.encoder-decoder-models.5',
    prompt:
      'A team builds an app that writes alt-text captions for photos posted on a school website. Which architecture is the classic fit?',
    options: [
      'A vision encoder that turns the image into patch vectors, and a text decoder that writes the caption while cross-attending to them',
      'A BERT-style encoder-only model, fine-tuned with one classification head that outputs a caption ID from a fixed list of captions',
      'A text-only decoder such as GPT-2 given the file name of the photo as its prompt, since the image pixels are not text tokens',
      'Two separate encoders, one for images and one for text, whose outputs are compared by cosine similarity to produce new captions',
    ],
    answer: 0,
    explanation:
      'Image in, sentence out: one sequence (image patches) is turned into a different sequence (words), the encoder-decoder shape. The decoder generates the caption token by token and uses cross-attention to look at the relevant parts of the image. Two encoders compared by similarity (like CLIP) can rank existing captions but cannot write new ones.',
    difficulty: 'intermediate',
  },
]

export default questions
