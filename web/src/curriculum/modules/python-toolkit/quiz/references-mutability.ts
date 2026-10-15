import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'python-toolkit.references-mutability.1',
    prompt: 'What does this code print?',
    code: 'a = [1, 2]\nb = a\nb = b + [3]\na.append(4)\nprint(b)',
    options: ['`[1, 2, 3, 4]`', '`[1, 2, 3]`', '`[1, 2, 4]`', '`[1, 2, 4, 3]`'],
    answer: 1,
    explanation:
      'After line 2, `a` and `b` point at the same list. Line 3 builds a **new** list `[1, 2, 3]` and moves only `b` to it (rebinding). Line 4 then mutates the original list, which only `a` still points at, giving `a = [1, 2, 4]`. So `b` is `[1, 2, 3]`. If line 3 were `b += [3]`, the list would be mutated in place and the answer would be `[1, 2, 3, 4]`.',
    difficulty: 'intermediate',
  },
  {
    id: 'python-toolkit.references-mutability.2',
    prompt: 'After running `x = [0, 0]` and then `y = x.copy()`, which statement is true?',
    options: [
      '`x == y` is True and `x is y` is True',
      '`x == y` is True and `x is y` is False',
      '`x == y` is False and `x is y` is False',
      '`x == y` is False and `x is y` is True',
    ],
    answer: 1,
    explanation:
      '`.copy()` builds a separate list with equal contents. `==` compares values, so it is True; `is` asks whether both names point at the very same object, and they do not, so it is False. Both would be True only after `y = x`, which copies the arrow instead of the list.',
    difficulty: 'beginner',
  },
  {
    id: 'python-toolkit.references-mutability.3',
    prompt: 'What does this code print?',
    code: 'def reset(scores):\n    scores = []\n\ndef clear(scores):\n    scores.clear()\n\na = [5, 6]\nb = [7, 8]\nreset(a)\nclear(b)\nprint(a, b)',
    options: ['`[] []`', '`[5, 6] [7, 8]`', '`[5, 6] []`', '`[] [7, 8]`'],
    answer: 2,
    explanation:
      'Both functions receive an arrow to the caller\'s list, not a copy. `reset` only **rebinds** its local name `scores` to a new empty list, which never reaches the caller, so `a` stays `[5, 6]`. `clear` **mutates** the shared list through the arrow, so `b` becomes `[]`.',
    difficulty: 'intermediate',
  },
  {
    id: 'python-toolkit.references-mutability.4',
    prompt: 'With `def add(x, items=[]): items.append(x); return items`, the calls `add(1)` then `add(2)` return `[1]` and then `[1, 2]`. Why does the list keep growing?',
    options: [
      'Local variables keep their values between calls, so `items` still holds the list from the last call',
      'The default list is created once, when the `def` line runs, and every call without `items` reuses it',
      '`append` returns a copy of the list, and Python stores that copy as the default for the next call',
      'Python caches each call\'s return value and adds it to the list that the next call builds',
    ],
    answer: 1,
    explanation:
      'Default values are evaluated once, at `def` time, and stored on the function object. Each call that leaves out `items` gets an arrow to that one stored list and appends to it. Local variables do **not** survive between calls (each call gets a fresh local scope); here it is the default object that persists. The fix is `items=None` plus `if items is None: items = []` inside.',
    difficulty: 'intermediate',
  },
  {
    id: 'python-toolkit.references-mutability.5',
    prompt:
      'A training loop runs `best_w = w` whenever the validation loss improves, and updates the NumPy array `w` in place with `w -= lr * grad`. At the end, `best_w` always equals the final `w`. Which change fixes this?',
    options: [
      'Compare with `best_w == w` instead of assigning with `=`',
      'Copy the gradient first: `w -= lr * grad.copy()`',
      'Save a snapshot with `best_w = w.copy()` instead',
      'Assign `best_w = w` once, before the loop starts',
    ],
    answer: 2,
    explanation:
      '`best_w = w` makes `best_w` an alias of the same array, and `-=` mutates that array in place, so the "best" weights change with every update. `w.copy()` stores a separate array that later updates cannot touch. Copying `grad` changes nothing, because the problem is the shared `w` array, and `==` only compares values without saving anything. Assigning `best_w = w` once before the loop still makes an alias of the same array, so it would also follow every in-place update.',
    difficulty: 'intermediate',
  },
]

export default questions
