import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'pandas-and-plotting.dataframes-and-selection.1',
    prompt: 'The DataFrame has the default index 0 to 5. What does this code print?',
    code: "df = pd.DataFrame({'x': [10, 20, 30, 40, 50, 60]})\na = df.loc[1:4]\nb = df.iloc[1:4]\nprint(len(a), len(b))",
    options: ['`4 3`', '`3 3`', '`4 4`', '`3 4`'],
    answer: 0,
    explanation:
      '`loc` slices by label and **includes** the end label, so `df.loc[1:4]` keeps labels 1, 2, 3 and 4 (4 rows). `iloc` slices by position and **excludes** the end, like a Python list, so `df.iloc[1:4]` keeps positions 1, 2 and 3 (3 rows). Answering `3 3` means treating `loc` like a list slice.',
    difficulty: 'beginner',
  },
  {
    id: 'pandas-and-plotting.dataframes-and-selection.2',
    prompt: 'Which line keeps only the 4-room flats that cost less than 500000?',
    options: [
      "`df[(df['rooms'] == 4) & (df['price'] < 500000)]`",
      "`df[df['rooms'] == 4 & df['price'] < 500000]`",
      "`df[(df['rooms'] == 4) and (df['price'] < 500000)]`",
      "`df[(df['rooms'] == 4) | (df['price'] < 500000)]`",
    ],
    answer: 0,
    explanation:
      'Both conditions must hold, so combine the masks with `&`, with brackets round each condition. Without brackets, `&` is done before `==` and `<`, so Python reads the line as the chained comparison `df[\'rooms\'] == (4 & df[\'price\']) < 500000`, which needs a single True or False and raises `ValueError: The truth value of a Series is ambiguous`. `and` fails with the same error for the same reason, and `|` would keep flats that pass **either** condition.',
    difficulty: 'beginner',
  },
  {
    id: 'pandas-and-plotting.dataframes-and-selection.3',
    prompt: 'A table has 200 rows (`RangeIndex: 200 entries`). Part of the output of `df.info()` is shown. What does it tell you about the `income` column?',
    code: ' #   Column  Non-Null Count  Dtype\n---  ------  --------------  -----\n 0   age     200 non-null    int64\n 1   income  184 non-null    float64',
    codeLang: 'text',
    options: ['16 of its values are missing', 'It is missing in 184 rows', 'It contains 184 different values', 'It has 16 values above the mean'],
    answer: 0,
    explanation:
      'There are 200 rows (entries) but only 184 non-null incomes, so $200 - 184 = 16$ are missing (NaN). "Non-null" counts values that are **present**, not missing ones, and it says nothing about how many values are different; `nunique()` would tell you that.',
    difficulty: 'beginner',
  },
  {
    id: 'pandas-and-plotting.dataframes-and-selection.4',
    prompt: 'A column holds the values 2, 4, 4, 5 and 15. What do the **mean** and **50%** rows of `df.describe()` show for it?',
    options: ['mean 6, 50% 4', 'mean 4, 50% 6', 'mean 6, 50% 8.5', 'mean 7.5, 50% 4'],
    answer: 0,
    explanation:
      'The mean is $\\frac{2 + 4 + 4 + 5 + 15}{5} = \\frac{30}{5} = 6$. The 50% row is the **median**, the middle value once sorted, which is 4. 8.5 is the midpoint of the range, $(2 + 15)/2$, not the median. The large value 15 pulls the mean above the median.',
    difficulty: 'beginner',
  },
  {
    id: 'pandas-and-plotting.dataframes-and-selection.5',
    prompt:
      "You sort a table of exam results with `df = df.sort_values('score', ascending=False)`, so the highest score comes first. Which expression returns the top student's row?",
    options: ['`df.iloc[0]`', '`df.loc[0]`', '`df.iloc[1]`', '`df.loc[-1]`'],
    answer: 0,
    explanation:
      'Sorting moves rows but each keeps its old label, so the top student now sits at **position** 0 with whatever label it had before. `df.iloc[0]` picks by position. `df.loc[0]` picks the row **labelled** 0, which is whoever was first before sorting, and positions count from 0, so `df.iloc[1]` is the runner-up.',
    difficulty: 'intermediate',
  },
]

export default questions
