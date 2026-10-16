import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'pandas-and-plotting.cleaning-data.1',
    prompt: 'What does this code print?',
    code: "df = pd.DataFrame({'a': [1, None, 3, None],\n                   'b': [5, 6, None, 8],\n                   'c': [9, 10, 11, 12]})\nprint(df.isna().sum())",
    options: ['`a` 2, `b` 1, `c` 0', '`a` 2, `b` 3, `c` 4', '`a` True, `b` True, `c` False', 'The single number 3'],
    answer: 0,
    explanation:
      '`df.isna()` is True wherever a value is missing, and `.sum()` adds each **column** (True counts as 1): `a` has 2 gaps, `b` has 1 and `c` has none. `2, 3, 4` are the non-missing counts that `info()` would show, and the single total 3 needs a second `.sum()`.',
    difficulty: 'beginner',
  },
  {
    id: 'pandas-and-plotting.cleaning-data.2',
    prompt: 'What are `df.dropna().shape` and `df.dropna(axis=1).shape`?',
    code: "df = pd.DataFrame({'x': [1, 2, None, 4, 5],\n                   'y': [None, 2, 3, 4, 5],\n                   'z': [1, 2, 3, 4, 5]})",
    options: ['`(3, 3)` and `(5, 1)`', '`(5, 1)` and `(3, 3)`', '`(3, 3)` and `(5, 3)`', '`(4, 3)` and `(5, 2)`'],
    answer: 0,
    explanation:
      'Rows 0 (`y` missing) and 2 (`x` missing) have a gap, so `dropna()` keeps the other 3 rows and all 3 columns: `(3, 3)`. `dropna(axis=1)` removes every **column** with a gap, leaving only `z` with all 5 rows: `(5, 1)`. Swapping the two answers is the classic axis mix-up.',
    difficulty: 'beginner',
  },
  {
    id: 'pandas-and-plotting.cleaning-data.3',
    prompt: 'Hourly temperature readings have a two-hour gap. What does this print?',
    code: 's = pd.Series([28.0, None, None, 29.5])\nprint(s.interpolate().tolist())',
    options: ['`[28.0, 28.5, 29.0, 29.5]`', '`[28.0, 28.0, 28.0, 29.5]`', '`[28.0, 28.75, 28.75, 29.5]`', '`[28.0, 0.0, 0.0, 29.5]`'],
    answer: 0,
    explanation:
      '`interpolate()` draws a straight line between the neighbours: a change of $29.5 - 28.0 = 1.5$ over 3 steps is 0.5 per step, giving 28.5 and 29.0. `[28.0, 28.0, 28.0, 29.5]` is what `ffill()` gives, filling both gaps with the neighbours\' average 28.75 ignores where each gap sits, and the zeros come from `fillna(0)`.',
    difficulty: 'intermediate',
  },
  {
    id: 'pandas-and-plotting.cleaning-data.4',
    prompt: "A CSV file gives a `price` column of dtype `object` with entries such as `'450,000'`. Which line turns it into whole numbers correctly?",
    options: [
      "`df['price'] = df['price'].str.replace(',', '').astype(int)`",
      "`df['price'] = df['price'].astype(int)`",
      "`df['price'] = pd.to_numeric(df['price'], errors='coerce')`",
      "`df['price'] = df['price'].fillna(0).astype(int)`",
    ],
    answer: 0,
    explanation:
      "The commas stop the text from being read as a number, so remove them first, then convert. `astype(int)` on `'450,000'` raises `ValueError: invalid literal for int()`, and `fillna(0)` does not help because nothing is missing. `errors='coerce'` raises no error but turns every price into NaN, a silent disaster.",
    difficulty: 'intermediate',
  },
  {
    id: 'pandas-and-plotting.cleaning-data.5',
    prompt: 'What does this code print?',
    code: "df = pd.DataFrame({'name': ['Ali', 'Bee', 'Ali', 'Cai', 'Bee'],\n                   'score': [80, 75, 80, 90, 70]})\nprint(df.duplicated().sum(), len(df.drop_duplicates()))",
    options: ['`1 4`', '`2 3`', '`2 4`', '`1 5`'],
    answer: 0,
    explanation:
      'By default `duplicated()` compares **whole rows**. Only the second `(Ali, 80)` repeats an earlier row; the two Bee rows have different scores, so they are not duplicates. That is 1 duplicate, and removing it leaves 4 rows. `2 3` would be the answer if only the names were compared (`subset=[\'name\']`).',
    difficulty: 'beginner',
  },
]

export default questions
