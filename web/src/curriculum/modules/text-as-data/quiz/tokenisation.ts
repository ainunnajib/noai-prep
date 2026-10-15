import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'text-as-data.tokenisation.1',
    prompt:
      'A chatbot uses a **word-level** tokeniser built from news articles. On Singlish chat messages ("so shiok sia", "dun liddat") it produces many `[UNK]` tokens. Which change fixes this best while keeping input sequences reasonably short?',
    options: [
      'Switch to a subword (BPE) tokeniser trained on text that includes chat messages',
      'Switch to a character-level tokeniser, so that no word in a chat message is unknown',
      'Raise `max_length`, so that long chat messages are no longer cut off part-way',
      'Delete `[UNK]` from the vocabulary, so that unknown words are skipped, not encoded',
    ],
    answer: 0,
    explanation:
      'A subword tokeniser spells unseen words from known pieces, so `[UNK]` almost disappears, and frequent words stay as single tokens, so sequences stay short. Character-level tokenisation also removes `[UNK]`, but makes every sequence several times longer, which is the cost the question asks you to avoid. `max_length` controls truncation, not the vocabulary, and skipping unknown words throws information away.',
    difficulty: 'beginner',
  },
  {
    id: 'text-as-data.tokenisation.2',
    prompt:
      'BPE is trained on the corpus sing ×5, ring ×4, rings ×2, sin ×3, starting from single characters. After **two** merges, how is the word "sing" tokenised?',
    options: ['s + ing', 'sin + g', 's + i + ng', 'sing'],
    answer: 0,
    explanation:
      'Merge 1: $(i, n)$ appears in every word: $5 + 4 + 2 + 3 = 14$, more than $(n, g) = 11$ or $(s, i) = 8$, so "in" is created. Recount: $(in, g) = 5 + 4 + 2 = 11$ beats $(s, in) = 5 + 3 = 8$ and $(r, in) = 6$, so merge 2 creates "ing". "sing" is therefore s + ing. "sin + g" would need $(s, in)$ to win the second round, but it only has 8.',
    difficulty: 'intermediate',
  },
  {
    id: 'text-as-data.tokenisation.3',
    prompt:
      'A BERT tokeniser turns "ok lah" into `[CLS] ok lah [SEP] [PAD] [PAD]` (padded to length 6). What is its attention mask?',
    options: ['`[1, 1, 1, 1, 0, 0]`', '`[0, 1, 1, 0, 0, 0]`', '`[1, 1, 0, 0, 0, 0]`', '`[0, 0, 0, 0, 1, 1]`'],
    answer: 0,
    explanation:
      'The mask is 1 for every token the model should attend to and 0 for padding. `[CLS]` and `[SEP]` are real tokens that the model uses (the `[CLS]` vector even feeds the classifier), so 4 ones are followed by 2 zeros. Marking the special tokens with 0 is the tempting mistake; reversing the mask would make the model read only the padding.',
    difficulty: 'beginner',
  },
  {
    id: 'text-as-data.tokenisation.4',
    prompt: 'What does this code print? (`BOS = 2`, `EOS = 3`, `PAD = 0`.)',
    code: 'BOS, EOS, PAD = 2, 3, 0\n\ndef encode(ids, max_len):\n    ids = [BOS] + ids + [EOS]\n    ids = ids[:max_len]\n    return ids + [PAD] * (max_len - len(ids))\n\nprint(encode([7, 8, 9, 10], 5))',
    options: ['`[2, 7, 8, 9, 10]`', '`[2, 7, 8, 9, 3]`', '`[2, 7, 8, 9, 10, 3]`', '`[7, 8, 9, 10, 3]`'],
    answer: 0,
    explanation:
      'The markers are added first, giving `[2, 7, 8, 9, 10, 3]` (6 ids), and then the slice keeps only the first 5, so `<EOS>` (3) is cut off and no padding is needed. This is the classic bug: the model never sees the sequence end. Cutting the content to `max_len - 2` first and then adding the markers would give `[2, 7, 8, 9, 3]`.',
    difficulty: 'intermediate',
  },
  {
    id: 'text-as-data.tokenisation.5',
    prompt:
      'When training a language model on padded batches, padding positions get the **label** −100 while the **input** keeps the pad id 0. Why?',
    options: [
      '`cross_entropy` ignores all labels equal to −100, but the embedding table has no row −100',
      '−100 pushes the predicted probability of padding down, and 0 marks padding for the optimiser',
      'Labels must be negative for the loss to work, and inputs must be non-negative to be multiplied',
      'The attention mask is built from the labels, and the pad id 0 tells the model where sentences end',
    ],
    answer: 0,
    explanation:
      "PyTorch's `cross_entropy` has `ignore_index=-100` by default, so positions labelled −100 add nothing to the loss and padding cannot pollute training. The input still needs a real id to look up in the embedding table, and row −100 does not exist, so the input keeps the pad id. The attention mask comes from the input (1 = real, 0 = pad), and the end of a sentence is marked by `<EOS>`, not by padding.",
    difficulty: 'intermediate',
  },
]

export default questions
