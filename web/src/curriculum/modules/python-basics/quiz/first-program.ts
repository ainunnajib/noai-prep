import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'python-basics.first-program.1',
    prompt: 'What does this program print?',
    code: 'print("2 + 3")\nprint(2 + 3)',
    options: ['`2 + 3`, then `5`', '`5`, then `5`', '`2 + 3`, then `2 + 3`', '`5`, then `2 + 3`'],
    answer: 0,
    explanation:
      'Line 1 prints a string: text in quotes is shown exactly as written, so it prints `2 + 3`. Line 2 has no quotes, so Python works out the calculation and prints `5`. The lines run top to bottom, so `2 + 3` comes first.',
    difficulty: 'beginner',
  },
  {
    id: 'python-basics.first-program.2',
    prompt: 'A program contains the line `# print("Hello")`. What happens when Python reaches it?',
    options: [
      'Python skips it, so nothing is printed',
      'Python prints `Hello` as a note in grey',
      'Python prints `# print("Hello")` exactly as written',
      'Python stops with a `SyntaxError`, because `#` is not valid code',
    ],
    answer: 0,
    explanation:
      'A `#` starts a comment, and Python ignores everything from the `#` to the end of the line. This line has been *commented out*: it looks like code, but it is switched off, so it prints nothing. Comments are perfectly valid Python, so there is no error.',
    difficulty: 'beginner',
  },
  {
    id: 'python-basics.first-program.3',
    prompt: 'Which error does the line `print("Score: " + 90)` raise?',
    options: ['`TypeError`', '`SyntaxError`', '`NameError`', '`ZeroDivisionError`'],
    answer: 0,
    explanation:
      'The grammar is fine and every name is known, but `+` is being asked to join a string (`"Score: "`) to a number (`90`). Using a value of the wrong type is a `TypeError`: "can only concatenate str (not "int") to str". The fix is `print("Score:", 90)`.',
    difficulty: 'beginner',
  },
  {
    id: 'python-basics.first-program.4',
    prompt:
      'A 5-line program has a `print` on every line. Lines 1 to 4 are correct, but line 5 is `print("Bye)`, with the closing quote missing. What happens when you run it?',
    options: [
      'Nothing is printed: Python reports a `SyntaxError` for line 5 straight away',
      'Lines 1 to 4 print their output, then a `SyntaxError` for line 5 appears',
      'Lines 1 to 4 print their output, and line 5 is skipped without any message',
      'Python adds the missing quote itself and prints all five lines',
    ],
    answer: 0,
    explanation:
      'A missing quote breaks the grammar, and Python checks the grammar of the whole file before running any of it. So no line runs at all, not even the correct lines 1 to 4. A `NameError`, `TypeError` or `ZeroDivisionError` on line 5 would be different: those appear only when line 5 runs, after lines 1 to 4 have printed.',
    difficulty: 'intermediate',
  },
  {
    id: 'python-basics.first-program.5',
    prompt: 'A program crashes, and the traceback ends with these four lines. Which is the best description of the bug?',
    code: '  File "quiz.py", line 2, in <module>\n    print(totl)\n          ^^^^\nNameError: name \'totl\' is not defined. Did you mean: \'total\'?',
    codeLang: 'text',
    options: [
      'Line 2 uses the name `totl`, a typo for `total`',
      'Line 2 breaks the grammar rules, so no line of the program ran',
      'Line 1 is wrong, because the top of a traceback shows the bad line',
      'Line 2 tries to join a piece of text to a number',
    ],
    answer: 0,
    explanation:
      'Read the last line first: a `NameError` means Python met a name it does not know, and the message even suggests `total`. The line above says where: line 2, `print(totl)`. A grammar problem would be a `SyntaxError`, and joining text to a number would be a `TypeError`.',
    difficulty: 'beginner',
  },
]

export default questions
