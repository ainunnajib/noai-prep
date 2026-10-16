import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'python-basics.variables-types-arithmetic.1',
    prompt: 'What does this program print?',
    code: 'x = 4\ny = x\nx = x * 3\ny = y + x\nprint(x, y)',
    options: ['`12 16`', '`12 24`', '`4 16`', '`12 4`'],
    answer: 0,
    explanation:
      '`y = x` points `y` at the same 4. `x = x * 3` makes a new value 12 and moves only `x`, so `y` is still 4. Then `y = y + x` is $4 + 12 = 16$. The answer 24 comes from wrongly assuming `y` followed `x` to 12.',
    difficulty: 'beginner',
  },
  {
    id: 'python-basics.variables-types-arithmetic.2',
    prompt: 'What does `print(type(10 / 5))` show?',
    options: ["`<class 'float'>`", "`<class 'int'>`", '`2.0`', "`<class 'str'>`"],
    answer: 0,
    explanation:
      'The `/` operator always gives a float, even when the division comes out whole: `10 / 5` is `2.0`. `type()` then reports `float`. `2.0` is the value itself, not its type; `10 // 5` would have given the int `2`.',
    difficulty: 'beginner',
  },
  {
    id: 'python-basics.variables-types-arithmetic.3',
    prompt: 'Without a calculator: what does `print(17 // 5, 17 % 5, 2 ** 3 ** 2)` show?',
    options: ['`3 2 512`', '`3 2 64`', '`3.4 2 512`', '`2 3 64`'],
    answer: 0,
    explanation:
      '5 fits into 17 three whole times, so `17 // 5` is 3, and $17 - 3 \\times 5 = 2$ is left over, so `17 % 5` is 2. `**` works right to left: `3 ** 2` is 9 first, then `2 ** 9` is 512. Working left to right gives $8^2 = 64$, and 3.4 is what `/` would give.',
    difficulty: 'intermediate',
  },
  {
    id: 'python-basics.variables-types-arithmetic.4',
    prompt: "Why does `'5' + 5` raise a `TypeError`, while `'5' * 5` runs without error?",
    options: [
      '`+` could mean adding or joining, so Python won\'t guess; `*` by an int can only mean repeating the text',
      "Python turns `'5'` into the number 5 for `*`, giving 25, but it does not do this for `+`",
      "`+` only works on numbers, while `*` works on any two values, even two strings like `'5' * '5'`",
      "Both lines raise a `TypeError`, because strings can never be used with arithmetic operators",
    ],
    answer: 0,
    explanation:
      "`'5' * 5` repeats the text and gives `'55555'`, not 25: Python never turns a string into a number for you. With `+`, a string and a number could mean adding (10) or joining (`'55'`), so Python raises a `TypeError` instead of guessing. `+` does work on two strings (`'5' + '5'` is `'55'`), while `'5' * '5'` is an error.",
    difficulty: 'intermediate',
  },
  {
    id: 'python-basics.variables-types-arithmetic.5',
    prompt: 'A student writes `avg = 70 + 80 + 90 / 3` to average three test scores, and gets `180.0`. What went wrong?',
    options: [
      'Division comes before addition, so only 90 was divided by 3; the fix is `(70 + 80 + 90) / 3`',
      'The `/` operator rounded the answer; the fix is to use `//` so that Python divides exactly',
      'Python adds from right to left, so the order of the scores matters; the fix is to reverse them',
      'The scores are ints, so the division failed; the fix is to convert each score with `float()` first',
    ],
    answer: 0,
    explanation:
      '`/` has higher precedence than `+`, so Python works out `90 / 3 = 30.0` first and then $70 + 80 + 30.0 = 180.0$. Brackets force the addition first: `(70 + 80 + 90) / 3` is $240 / 3 = 80.0$. Using `//` would not help: it changes how the division rounds, not when it happens.',
    difficulty: 'beginner',
  },
]

export default questions
