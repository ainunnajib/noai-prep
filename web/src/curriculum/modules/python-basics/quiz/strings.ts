import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'python-basics.strings.1',
    prompt: "With `s = 'Singapore'`, what is `s[2:6]`?",
    options: ["`'ngap'`", "`'ngapo'`", "`'inga'`", "`'ingap'`"],
    answer: 0,
    explanation:
      "Indices start at 0: S=0, i=1, n=2, g=3, a=4, p=5, o=6. The slice starts at position 2 and stops just *before* 6, so it takes positions 2, 3, 4 and 5: `'ngap'`, which is $6 - 2 = 4$ characters. Including position 6 gives `'ngapo'`; counting from 1 instead of 0 gives `'inga'`.",
    difficulty: 'beginner',
  },
  {
    id: 'python-basics.strings.2',
    prompt: "What does `print('PYTHON'[-2])` show?",
    options: ['`O`', '`N`', '`H`', '`IndexError`'],
    answer: 0,
    explanation:
      "Negative indices count from the end: `-1` is the last character (`N`) and `-2` is the one before it (`O`). In general `s[-k]` is `s[len(s) - k]`, here `s[6 - 2]` = `s[4]` = `'O'`. Negative indices are valid down to `-len(s)`, so there is no error.",
    difficulty: 'beginner',
  },
  {
    id: 'python-basics.strings.3',
    prompt: 'What does this program print?',
    code: 's = "  Hello World  "\nt = s.strip().lower().replace("o", "0")\nprint(t)',
    options: ['`hell0 w0rld`', '`hell0 world`', '`Hell0 W0rld`', '`hello world`'],
    answer: 0,
    explanation:
      'The methods run left to right, each on the result of the one before: `.strip()` removes the spaces at both ends, `.lower()` gives `hello world`, and `.replace("o", "0")` swaps **every** letter o for the digit 0, not just the first one. Skipping `.lower()` would give `Hell0 W0rld`; skipping `.replace()` would give `hello world`.',
    difficulty: 'beginner',
  },
  {
    id: 'python-basics.strings.4',
    prompt: 'What does this program print, and why?',
    code: 'name = "alice"\nname.upper()\nprint(name)',
    options: [
      '`alice`, because `upper()` returns a new string that is never saved back to `name`',
      '`ALICE`, because `upper()` changes the string stored in `name` itself',
      '`Alice`, because `upper()` capitalises just the first letter of a word',
      'An error, because strings cannot be changed, so `upper()` must fail',
    ],
    answer: 0,
    explanation:
      'Strings are immutable, so `upper()` cannot change `name`; it returns a new string `\'ALICE\'`. That new string is not assigned to anything, so it is thrown away and `name` is still `\'alice\'`. To keep it, write `name = name.upper()`. Capitalising only the first letter is what `.capitalize()` does.',
    difficulty: 'intermediate',
  },
  {
    id: 'python-basics.strings.5',
    prompt: 'What does `print(f"{2 / 3:.2f}")` show?',
    options: ['`0.67`', '`0.66`', '`0.6666666666666666`', '`.67`'],
    answer: 0,
    explanation:
      '`2 / 3` is $0.666\\ldots$, and the format specification `.2f` shows it as a float with 2 decimal places, **rounded**: `0.67`. It does not chop off the extra digits (that would give 0.66), and without `:.2f` you would see all the digits, `0.6666666666666666`.',
    difficulty: 'beginner',
  },
]

export default questions
