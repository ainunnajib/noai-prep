import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'python-toolkit.iteration-tools.1',
    prompt: 'What does this list comprehension produce?',
    code: '[x * 2 for x in range(5) if x % 2 == 1]',
    options: ['`[2, 6]`', '`[1, 3]`', '`[0, 4, 8]`', '`[2, 6, 10]`'],
    answer: 0,
    explanation:
      '`range(5)` gives 0, 1, 2, 3, 4. The filter `x % 2 == 1` keeps the odd values 1 and 3, and the expression doubles them: $1 \\times 2 = 2$ and $3 \\times 2 = 6$. `[1, 3]` forgets the expression, `[0, 4, 8]` doubles the even values instead, and `[2, 6, 10]` wrongly includes 5, the stop value of `range`.',
    difficulty: 'beginner',
  },
  {
    id: 'python-toolkit.iteration-tools.2',
    prompt: 'What does this code print?',
    code: "names = ['Ann', 'Bo', 'Cy']\nages = [15, 16]\nprint(list(zip(names, ages)))",
    options: ["`[('Ann', 15), ('Bo', 16)]`", "`[('Ann', 15), ('Bo', 16), ('Cy', None)]`", "`[['Ann', 15], ['Bo', 16]]`", '`ValueError`, because the lists have different lengths'],
    answer: 0,
    explanation:
      "`zip` pairs items position by position into **tuples** and stops when the shorter list runs out, so 'Cy' is silently dropped. It never pads with `None` and raises no error. The pairs are tuples (round brackets), not lists.",
    difficulty: 'beginner',
  },
  {
    id: 'python-toolkit.iteration-tools.3',
    prompt: 'Why does `(x * x for x in range(10_000_000))` use far less memory than `[x * x for x in range(10_000_000)]`?',
    options: [
      'The generator works out each square only when it is asked for, so it never stores all ten million values',
      'The generator stores its ten million values as compressed bytes, which take about a quarter of the space',
      'The generator keeps every second value and recomputes the missing ones from their neighbours when needed',
      'The generator saves its ten million values to a temporary file on disk instead of keeping them in memory',
    ],
    answer: 0,
    explanation:
      'A generator is lazy: it remembers only where it is up to (here, the current x and the range) and computes the next value on demand, so its size stays tiny (200 bytes on a 64-bit computer) whatever the length. The list must build and store all ten million results before the line finishes. No compression or disk storage is involved.',
    difficulty: 'intermediate',
  },
  {
    id: 'python-toolkit.iteration-tools.4',
    prompt: 'What is the difference between `[x * x for x in range(5)]` and `(x * x for x in range(5))`?',
    options: [
      'The first builds a list of all five squares at once; the second is a generator that makes them one at a time, on demand',
      'The first builds a list of all five squares at once; the second builds a tuple holding the same five squares',
      'The first can be looped over only once; the second can be looped over again as many times as you like',
      'Both build the same list of five squares; round brackets are just an older way of writing a comprehension',
    ],
    answer: 0,
    explanation:
      'Square brackets make a list immediately. Round brackets around `x for x in …` make a **generator expression**, not a tuple; to get a tuple you would write `tuple(x * x for x in range(5))`. It is the generator, not the list, that can be used only once.',
    difficulty: 'intermediate',
  },
  {
    id: 'python-toolkit.iteration-tools.5',
    prompt:
      'A student writes `pairs = zip(X_train, y_train)` once, then trains with `for epoch in range(3): for x, y in pairs: ...`. Epoch 1 trains normally, but epochs 2 and 3 do nothing and no error appears. What is wrong?',
    options: [
      '`zip` returns a one-pass iterator, so `pairs` is already used up (empty) when epochs 2 and 3 try to loop over it',
      '`zip` stops at the shorter of `X_train` and `y_train`, so the later epochs run out of training examples to use',
      'The inner loop variables `x` and `y` overwrite the data, so after epoch 1 both lists have become empty',
      '`range(3)` gives 1, 2, 3, so the loop is skipping epoch 0 and the student is miscounting the epochs',
    ],
    answer: 0,
    explanation:
      "`zip` is an iterator: it hands out each pair once and is then empty, so later `for` loops over it run zero times without any error. Re-create it each epoch (`for x, y in zip(X_train, y_train):`) or store the pairs with `list(zip(...))`. Stopping at the shorter input would affect every epoch equally, and `range(3)` gives 0, 1, 2.",
    difficulty: 'advanced',
  },
]

export default questions
