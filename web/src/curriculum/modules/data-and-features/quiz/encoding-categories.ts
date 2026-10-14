import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'data-and-features.encoding-categories.1',
    prompt:
      'A linear regression predicts flat prices. The `town` column is label-encoded alphabetically (Ang Mo Kio = 0, Bedok = 1, Clementi = 2, …). What is the main problem?',
    options: [
      'The codes act as amounts, which invents an order and equal gaps between towns',
      'Linear regression needs float features, and integer codes make training fail',
      'Label encoding creates one new column per town, which is far too many columns',
      'The codes are fine but must be standardised first, or the weights will explode',
    ],
    answer: 0,
    explanation:
      'With one column of codes the model can only learn price ≈ w × code + b, so every town is forced onto one straight line in alphabetical order. One-hot encoding gives each town its own weight. Creating one column per town is what one-hot does, not label encoding; and standardising the codes keeps the same fake order and spacing.',
    difficulty: 'beginner',
  },
  {
    id: 'data-and-features.encoding-categories.2',
    prompt: 'What does this code print?',
    code: 'import pandas as pd\n\ndf = pd.DataFrame({"size": ["S", "L", "M", "S"]})\nprint(pd.get_dummies(df["size"]).shape)',
    options: ['`(4, 3)`', '`(4, 1)`', '`(3, 4)`', '`(4, 4)`'],
    answer: 0,
    explanation:
      '`get_dummies` makes one 0/1 column per distinct category (L, M, S), and keeps one row per original row: 4 rows and 3 columns. `(4, 1)` would be a single label-encoded column; `(4, 4)` counts the rows instead of the distinct values. With `drop_first=True` it would be `(4, 2)`.',
    difficulty: 'beginner',
  },
  {
    id: 'data-and-features.encoding-categories.3',
    prompt: 'For which of these features is ordinal (integer) encoding a sensible choice?',
    options: ['T-shirt size: S, M, L, XL', 'Blood type: A, B, AB, O', 'MRT line: East-West, North-South, Circle', 'Country of birth'],
    answer: 0,
    explanation:
      'Sizes have a real order (S < M < L < XL), so codes 0, 1, 2, 3 in that order carry true information. Blood types, MRT lines and countries are nominal: any integer order would be invented, so they should be one-hot encoded (or embedded, if there are very many).',
    difficulty: 'beginner',
  },
  {
    id: 'data-and-features.encoding-categories.4',
    prompt:
      'A dataset has a `postal_code` column with about 20,000 distinct values, most of which appear only once or twice. What is the best way to use it in a logistic regression?',
    options: [
      'Group rare codes into an “other” category, or use frequency or target encoding',
      'Feed the postal code in as a number, since it already consists only of digits',
      'Standardise the postal code to mean 0 and standard deviation 1, then train',
      'One-hot encode all 20,000 codes, since one-hot encoding never invents an order',
    ],
    answer: 0,
    explanation:
      'This is a high-cardinality feature: plain one-hot creates 20,000 mostly-empty columns, each seen too rarely to learn a weight from, so rare codes are grouped or replaced by a frequency or (carefully fitted) target encoding. Postal codes are labels, not amounts, so using or standardising them as numbers invents an order.',
    difficulty: 'intermediate',
  },
  {
    id: 'data-and-features.encoding-categories.5',
    prompt:
      'A vocabulary is `{"[PAD]": 0, "[UNK]": 1, "the": 2, "cat": 3, "sat": 4, "on": 5, "mat": 6}`. Unknown words map to `[UNK]` and sequences are padded at the end to length 5. What is the encoding of “the dog sat”?',
    options: ['`[2, 1, 4, 0, 0]`', '`[2, 4, 0, 0, 0]`', '`[2, 0, 4, 0, 0]`', '`[2, 7, 4, 0, 0]`'],
    answer: 0,
    explanation:
      '“the” → 2, “dog” is not in the vocabulary → `[UNK]` = 1, “sat” → 4, then two `[PAD]` = 0 to reach length 5. Dropping the unknown word loses its position; using 0 confuses it with padding; and the vocabulary is fixed after training, so “dog” cannot be given a new id 7 at test time.',
    difficulty: 'beginner',
  },
]

export default questions
