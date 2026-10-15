import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'pandas-and-plotting.groupby-merge.1',
    prompt:
      "A DataFrame `df` has 500 rows of HDB sales across 26 towns, with a `town` column and a numeric `price` column. What does `df.groupby('town')['price'].mean()` return?",
    options: [
      'A Series with 26 values: the average price of each town, indexed by town name',
      'A single number: the average price over all 500 rows, labelled by town',
      'A DataFrame with 500 rows, each row showing the average price of its own town',
      'The 500 rows sorted by town, with the average price shown under each town',
    ],
    answer: 0,
    explanation:
      "groupby splits the 500 rows into one group per town, `.mean()` is applied to the prices inside each group, and the 26 answers are combined into a Series whose index is the town names. One overall number would be `df['price'].mean()`. Keeping all 500 rows with each group's mean is what `transform('mean')` does, not `.mean()`.",
    difficulty: 'beginner',
  },
  {
    id: 'pandas-and-plotting.groupby-merge.2',
    prompt: 'What does this code print for the group `B`?',
    code: "import pandas as pd\ndf = pd.DataFrame({'cls': ['A', 'B', 'A', 'B', 'A'],\n                   'score': [3, 5, 4, 7, 2]})\nprint(df.groupby('cls')['score'].sum())",
    options: ['`12`', '`6.0`', '`2`', '`21`'],
    answer: 0,
    explanation:
      'The B rows are rows 1 and 3, with scores 5 and 7, so their sum is $5 + 7 = 12$ (group A gets $3 + 4 + 2 = 9$). 6.0 is the mean of the B group, 2 is its count, and 21 is the sum of the whole column, ignoring the groups.',
    difficulty: 'beginner',
  },
  {
    id: 'pandas-and-plotting.groupby-merge.3',
    prompt:
      'A school has a `students` table (one row per student) and a `cca` table (one row per CCA membership). The principal wants a list of **every** student, showing their CCA where they have one. Which call fits?',
    options: [
      "`pd.merge(students, cca, on='id', how='left')`",
      "`pd.merge(students, cca, on='id', how='inner')`",
      "`pd.merge(students, cca, on='id', how='right')`",
      '`pd.concat([students, cca])`',
    ],
    answer: 0,
    explanation:
      'A left join keeps every row of the left table (`students`) and fills `NaN` into the CCA column for students without a CCA. An inner join would silently drop those students, and a right join keeps every CCA row instead. `pd.concat` stacks the tables on top of each other without matching ids at all.',
    difficulty: 'beginner',
  },
  {
    id: 'pandas-and-plotting.groupby-merge.4',
    prompt: "`sales` has 100 rows. After `result = pd.merge(sales, prices, on='item', how='left')`, `result` has 104 rows. What is the most likely cause?",
    options: [
      'Some `item` values appear more than once in `prices`, so those sales rows matched several price rows',
      'A left join also adds a row for every `item` in `prices` that never appears in `sales`, filled with `NaN`',
      'Sales whose `item` is missing from `prices` are given a second, extra row with `NaN` in the price columns',
      'pandas adds a header row for every distinct `item` value when it merges the two tables on that column',
    ],
    answer: 0,
    explanation:
      "A key that appears $k$ times on one side and $m$ times on the other gives $k \\times m$ rows, so duplicate items in `prices` multiply the matching sales rows. Adding unmatched rows from `prices` is what a right or outer join does, not a left join, and an unmatched sale stays as exactly one row (with `NaN`). Checking `prices['item'].duplicated().sum()` before merging catches this.",
    difficulty: 'intermediate',
  },
  {
    id: 'pandas-and-plotting.groupby-merge.5',
    prompt:
      "Both lines give the same new column. Why is `df['bmi'] = df['kg'] / df['m'] ** 2` usually preferred to `df['bmi'] = df.apply(lambda r: r['kg'] / r['m'] ** 2, axis=1)`?",
    options: [
      'The first works on whole columns at once in compiled NumPy code; the second calls a Python function once for every row',
      'The first divides row by row in a Python loop, which avoids the rounding errors that vectorised division can introduce on large numbers',
      'The second changes `df` in place while it runs, so the original `kg` and `m` columns are overwritten and lost',
      'The second only fills in the first row of `df` unless you also pass `axis=0`, so every other row is left empty',
    ],
    answer: 0,
    explanation:
      'Column arithmetic is vectorised: pandas hands whole columns to NumPy, which loops in fast compiled code. `apply` with `axis=1` makes one ordinary Python call per row, which can be about a thousand times slower on a million rows. Both give the same numbers, so accuracy is not the reason, and `axis=0` would apply the function to each column, not each row.',
    difficulty: 'beginner',
  },
]

export default questions
