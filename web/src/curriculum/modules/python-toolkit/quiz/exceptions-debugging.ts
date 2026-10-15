import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'python-toolkit.exceptions-debugging.1',
    prompt: 'Which of these lines raises a `KeyError`?',
    options: ['`[10, 20, 30][3]`', '`{"a": 1}["b"]`', '`"total: " + 5`', '`int("five")`'],
    answer: 1,
    explanation:
      'Looking up a key that is not in a dictionary raises `KeyError: \'b\'`. `[10, 20, 30][3]` asks for position 3 of a 3-item list (`IndexError`), `"total: " + 5` mixes a string and an int (`TypeError`), and `int("five")` is a string whose value is not a whole number (`ValueError`).',
    difficulty: 'beginner',
  },
  {
    id: 'python-toolkit.exceptions-debugging.2',
    prompt: 'What does this code print, line by line?',
    code: 'data = {"a": 1}\ntry:\n    print(data["b"])\nexcept IndexError:\n    print("index")\nexcept KeyError:\n    print("key")\nelse:\n    print("fine")\nfinally:\n    print("done")',
    options: ['`index`, `key`, `done`', '`key`, `done`', '`key`, `fine`, `done`', '`key`'],
    answer: 1,
    explanation:
      '`data["b"]` raises `KeyError`. Python checks the `except` clauses top to bottom: `IndexError` does not match, `KeyError` does, so `key` is printed. Only one `except` block runs. `else` is skipped because there was an error, and `finally` always runs, printing `done`.',
    difficulty: 'intermediate',
  },
  {
    id: 'python-toolkit.exceptions-debugging.3',
    prompt: 'Why is a bare `except:` (with no exception type) usually a bad idea?',
    options: [
      'It is a `SyntaxError`, because Python requires an exception type after `except`',
      'It only catches errors raised inside functions, not errors raised in the `try` block itself',
      'It stops the `finally` block from running, so clean-up code is silently skipped',
      'It catches every exception, even a `NameError` from a typo, so real bugs are hidden',
    ],
    answer: 3,
    explanation:
      'A bare `except:` is legal Python, but it catches **every** exception, including ones caused by bugs such as a misspelt name. The program carries on with a wrong value and the real cause is hidden. Catch the specific exceptions you expect (e.g. `except ValueError:`). It does not affect `finally`, which always runs.',
    difficulty: 'intermediate',
  },
  {
    id: 'python-toolkit.exceptions-debugging.4',
    prompt: '`int("abc")` raises `ValueError`, but `int(None)` raises `TypeError`. Which statement explains the difference?',
    options: [
      '`ValueError` is raised for string arguments, and `TypeError` for any argument that is not a string',
      '`ValueError` can be caught with `try`/`except`, but a `TypeError` always stops the program',
      '`ValueError` means only the value is unusable; `TypeError` means the type itself cannot work',
      '`ValueError` comes from built-in functions, while `TypeError` only comes from operators such as `+`',
    ],
    answer: 2,
    explanation:
      '`int()` accepts strings, so `"abc"` has an acceptable **type**; only its **value** is unusable, giving `ValueError`. No `None` value could ever be converted, so the type itself is wrong: `TypeError`. Both can be caught with `try`/`except`. And `int(3.5)` shows that the claim "`TypeError` for any argument that is not a string" is false: a float is not a string, yet `int(3.5)` raises nothing and returns 3.',
    difficulty: 'intermediate',
  },
  {
    id: 'python-toolkit.exceptions-debugging.5',
    prompt:
      'A function meant to return the mean of a list returns `4.666666666666667` for `[4, 8, 6]` instead of `6.0`. No error is shown. What is the most useful next step?',
    options: [
      'Print the loop index and running total inside the loop',
      'Wrap the body in `try`/`except` so that the error is caught and handled',
      'Rewrite the whole function from scratch using a different method',
      'Round the result with `round()` so that it comes out as a whole number',
    ],
    answer: 0,
    explanation:
      'No exception is raised, so `try`/`except` has nothing to catch. Printing intermediate values shows which items are actually added. For example, in the bug hunt in this lesson, printing `i` showed only the values 1 and 2, so `nums[0]` was skipped and the total was $8 + 6 = 14$, giving $14 / 3 \\approx 4.67$. Rounding would hide the bug, and rewriting everything throws away the chance to learn the cause.',
    difficulty: 'beginner',
  },
]

export default questions
