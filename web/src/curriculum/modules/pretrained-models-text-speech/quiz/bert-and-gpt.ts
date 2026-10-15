import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'pretrained-models-text-speech.bert-and-gpt.1',
    prompt: 'What is the main reason BERT can use context on both sides of a word, while GPT cannot?',
    options: [
      'BERT has no causal mask, so each token attends to every position; GPT\'s causal mask limits a token to itself and earlier ones',
      'BERT reads the sentence twice, forwards and then backwards, with two separate recurrent networks, and joins the two results at the end',
      'GPT has no attention layers at all, and predicts each token only from a fixed window of the three tokens immediately before it',
      'BERT adds positional encodings to its input while GPT does not, so GPT cannot tell which of the words come after the current one',
    ],
    answer: 0,
    explanation:
      'Both are stacks of Transformer blocks with attention and positional information. The difference is the attention mask: BERT\'s encoder lets every token see the whole sentence (bidirectional), while GPT\'s causal mask hides future positions so it can be trained to predict the next token. Two recurrent passes describes ELMo-style models, not BERT.',
    difficulty: 'beginner',
  },
  {
    id: 'pretrained-models-text-speech.bert-and-gpt.2',
    prompt:
      'BERT is pretrained on a batch containing 4,000 ordinary tokens (no special tokens) using the standard masking recipe. On average, how many positions are replaced by the `[MASK]` token, and how many positions contribute to the loss?',
    options: ['480 replaced; 600 contribute to the loss', '600 replaced; 600 contribute to the loss', '480 replaced; 480 contribute to the loss', '3,200 replaced; 4,000 contribute to the loss'],
    answer: 0,
    explanation:
      '15% are chosen: $0.15 \\times 4000 = 600$. Of these, 80% become `[MASK]`: $0.8 \\times 600 = 480$. All 600 chosen positions are predicted and scored, including the 60 random and 60 unchanged ones. Scoring only the 480 masked positions is the common misconception; 3,200 applies 80% to every token.',
    difficulty: 'intermediate',
  },
  {
    id: 'pretrained-models-text-speech.bert-and-gpt.3',
    prompt: 'A language model assigns the four tokens of a sentence probabilities $\\tfrac12$, $\\tfrac12$, $\\tfrac14$ and $\\tfrac18$. What is its perplexity on this sentence?',
    options: ['$\\sqrt[4]{128} \\approx 3.4$', '128', '$\\tfrac{1}{128}$', '$\\tfrac{11}{32} \\approx 0.34$'],
    answer: 0,
    explanation:
      'The product of the probabilities is $\\tfrac12 \\cdot \\tfrac12 \\cdot \\tfrac14 \\cdot \\tfrac18 = \\tfrac{1}{128}$. Perplexity is $\\exp$ of the average $-\\ln p$, which equals $(1/\\text{product})^{1/N} = 128^{1/4} \\approx 3.4$. 128 forgets to take the 4th root (average over tokens), $\\tfrac{1}{128}$ is the sentence probability itself, and $\\tfrac{11}{32}$ is the average probability.',
    difficulty: 'intermediate',
  },
  {
    id: 'pretrained-models-text-speech.bert-and-gpt.4',
    prompt: '`hidden` is the last-layer output of BERT-base for a batch, with shape `(32, 128, 768)`. What is the shape of `logits`?',
    code: 'cls_vec = hidden[:, 0, :]\nhead = nn.Linear(768, 3)\nlogits = head(cls_vec)',
    options: ['`(32, 3)`', '`(32, 128, 3)`', '`(128, 3)`', '`(32, 768)`'],
    answer: 0,
    explanation:
      '`hidden[:, 0, :]` keeps every sentence but only position 0, the `[CLS]` token, giving `(32, 768)`. The linear layer maps the last dimension 768 to 3, so `logits` is `(32, 3)`: one score per class per sentence. `(32, 128, 3)` would come from applying the head to every token (as in token tagging), and `(32, 768)` is `cls_vec` before the head.',
    difficulty: 'beginner',
  },
  {
    id: 'pretrained-models-text-speech.bert-and-gpt.5',
    prompt:
      'A team fine-tunes BERT to classify customer emails, but they also want the same model to draft replies to the emails. A teammate suggests appending several `[MASK]` tokens after each email and letting BERT fill them in. What is the main problem?',
    options: [
      'BERT learned to fill gaps from both sides, never to continue text left to right, so it writes poor replies; a GPT-style model fits',
      'Fine-tuning for classification deletes `[MASK]` from BERT\'s vocabulary, so appending `[MASK]` tokens to an email would raise an error',
      'BERT can only ever predict one masked position per forward pass, so filling several `[MASK]` tokens at once is impossible however it was trained',
      'The fine-tuned `[CLS]` head would overwrite every masked position, so all of the filled-in words would just be the predicted class label',
    ],
    answer: 0,
    explanation:
      'BERT predicts hidden tokens independently from bidirectional context and was never trained on left-to-right continuation, so it writes poor free text. Generation needs a model trained autoregressively with a causal mask. BERT can predict many masked positions in one pass (one output per position), and `[MASK]` stays in the vocabulary.',
    difficulty: 'intermediate',
  },
  {
    id: 'pretrained-models-text-speech.bert-and-gpt.6',
    prompt: 'A language model\'s average cross-entropy on a test text is 3 **bits** per token (measured with $\\log_2$). What is its perplexity?',
    options: ['8', '$e^3 \\approx 20$', '9', '$\\tfrac18$'],
    answer: 0,
    explanation:
      'With the cross-entropy $H$ in bits, perplexity is $2^H = 2^3 = 8$: the model is as unsure as if it were choosing among 8 equally likely tokens. $e^3 \\approx 20$ mixes bases (the base of the power must match the base of the log), 9 squares 3 instead of raising 2 to the power 3, and $\\tfrac18$ is the typical probability per token, the reciprocal of the perplexity.',
    difficulty: 'intermediate',
  },
]

export default questions
