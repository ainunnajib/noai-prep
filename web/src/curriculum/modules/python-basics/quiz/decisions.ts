import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'python-basics.decisions.1',
    prompt: 'What does this code print?',
    code: 'x = 10\nprint(x > 5 or x < 0 and x == 3)',
    options: ['`True`', '`False`', '`10`', '`SyntaxError`'],
    answer: 0,
    explanation:
      'Comparisons first: `x > 5` is `True`, `x < 0` is `False`, `x == 3` is `False`. Then `and` before `or`: `False and False` is `False`, so the line becomes `True or False`, which is `True`. Reading left to right instead, `(True or False) and False`, gives the tempting wrong answer `False`.',
    difficulty: 'intermediate',
  },
  {
    id: 'python-basics.decisions.2',
    prompt: 'What does this code print?',
    code: 'temp = 31\nif temp > 25:\n    print("warm")\nelif temp > 30:\n    print("hot")\nelse:\n    print("cool")',
    options: ['`warm`', '`hot`', '`warm` and then `hot`, on two lines', '`cool`'],
    answer: 0,
    explanation:
      'Python checks from the top and runs only the first branch whose condition is `True`. `31 > 25` is `True`, so it prints `warm` and skips the rest of the chain, even though `31 > 30` is also `True`. To get `hot`, the stricter check `temp > 30` would have to come first.',
    difficulty: 'beginner',
  },
  {
    id: 'python-basics.decisions.3',
    prompt: 'A student runs this program. What happens?',
    code: 'score = 100\nif score = 100:\n    print("full marks")',
    options: [
      'Python stops with a `SyntaxError` before running any line',
      'It prints `full marks`',
      'It sets `score` to 100 again and prints nothing',
      'It prints `True`',
    ],
    answer: 0,
    explanation:
      'A single `=` assigns; comparing needs `==`. An `if` must be followed by a condition, so Python rejects the line with `SyntaxError: invalid syntax. Maybe you meant \'==\' or \':=\' instead of \'=\'?`. Syntax is checked before the program starts, so not even line 1 runs. With `==` it would print `full marks`.',
    difficulty: 'beginner',
  },
  {
    id: 'python-basics.decisions.4',
    prompt: 'What does this code print?',
    code: 'x = 7\nif x > 5:\n    print("big")\nif x > 2:\n    print("medium")\nelse:\n    print("small")',
    options: ['`big` and then `medium`, on two lines', '`big` only', '`big` and then `small`, on two lines', '`medium` only'],
    answer: 0,
    explanation:
      'These are two separate `if` statements, so both questions are asked. `7 > 5` is `True`, so `big` is printed. Then `7 > 2` is also `True`, so `medium` is printed. The `else` belongs only to the second `if`, so `small` would print only if `x > 2` were `False`. Answering `big` only treats the second `if` as if it were an `elif`.',
    difficulty: 'intermediate',
  },
  {
    id: 'python-basics.decisions.5',
    prompt:
      'A spam filter should flag an email when it has more than 5 links **or** contains the word "winner", but never when the sender is in your contacts. Which condition does exactly this?',
    options: [
      '`(links > 5 or has_winner) and not in_contacts`',
      '`links > 5 or has_winner and not in_contacts`',
      '`(links > 5 and has_winner) and not in_contacts`',
      '`not in_contacts or links > 5 or has_winner`',
    ],
    answer: 0,
    explanation:
      'The brackets make Python decide "suspicious?" first, and only then apply "and not a contact". Without brackets, `and` is done before `or`, so the version without brackets means `links > 5 or (has_winner and not in_contacts)`: a friend\'s email with 6 links would still be flagged. The version with `and` between the two warning signs needs both at once, and the one starting `not in_contacts or` flags every email from a stranger.',
    difficulty: 'intermediate',
  },
]

export default questions
