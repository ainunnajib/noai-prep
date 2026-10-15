import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'python-basics.lists.1',
    prompt: 'What does this code print?',
    code: 'a = [1, 2]\nb = [3]\nprint(a + b * 2)',
    options: ['`[1, 2, 3, 3]`', '`[1, 2, 3, 1, 2, 3]`', '`[1, 2, 6]`', '`[2, 4, 6]`'],
    answer: 0,
    explanation:
      'Like numbers, `*` happens before `+`. `b * 2` repeats the list: `[3, 3]`. Then `+` joins: `[1, 2] + [3, 3]` is `[1, 2, 3, 3]`. Doing the `+` first would give `[1, 2, 3, 1, 2, 3]`, and multiplying the numbers inside is NumPy behaviour, not list behaviour.',
    difficulty: 'intermediate',
  },
  {
    id: 'python-basics.lists.2',
    prompt: 'What happens when this code runs?',
    code: 'marks = [72, 85, 64]\nfor i in range(1, 4):\n    print(marks[i])',
    options: [
      'It prints `85` and `64`, then stops with an `IndexError`',
      'It prints `85` and `64`, then quietly skips the missing item',
      'It prints `72`, `85` and `64`, and the loop ends normally',
      'It stops with an `IndexError` before printing anything',
    ],
    answer: 0,
    explanation:
      '`range(1, 4)` gives 1, 2, 3. `marks[1]` is 85 and `marks[2]` is 64, but the list has 3 items, so the valid indices are 0 to 2 and `marks[3]` raises `IndexError: list index out of range` on the third pass; Python never skips a bad index quietly. It runs line by line, so the first two values are already printed when the error happens.',
    difficulty: 'beginner',
  },
  {
    id: 'python-basics.lists.3',
    prompt: 'What does this code print?',
    code: 'grid = [[3, 8, 1],\n        [4, 0, 7]]\nprint(grid[1][2] + grid[0][-1])',
    options: ['`8`', '`10`', '`15`', '`IndexError`'],
    answer: 0,
    explanation:
      'Row first, then column. `grid[1]` is `[4, 0, 7]`, and item 2 of it is `7`. `grid[0]` is `[3, 8, 1]`, and item −1 (the **last**) is `1`. So $7 + 1 = 8$. Treating `[-1]` as the first item gives $7 + 3 = 10$, and reading the indices column first would look for a third row that does not exist, which is where the tempting `IndexError` comes from.',
    difficulty: 'beginner',
  },
  {
    id: 'python-basics.lists.4',
    prompt: 'What does this code print?',
    code: 'nums = [3, 1, 2]\nnums.append(4)\nnums.insert(0, 9)\nx = nums.pop()\nprint(nums, x)',
    options: ['`[9, 3, 1, 2] 4`', '`[9, 3, 1, 2, 4] 4`', '`[3, 1, 2, 4] 9`', '`[3, 9, 1, 2] 4`'],
    answer: 0,
    explanation:
      '`append(4)` gives `[3, 1, 2, 4]`. `insert(0, 9)` puts 9 at index 0: `[9, 3, 1, 2, 4]`. `pop()` with no index removes the **last** item and returns it, so `x` is 4 and `nums` is `[9, 3, 1, 2]`. `pop()` does take the item out of the list, and it works from the end, not the front.',
    difficulty: 'intermediate',
  },
  {
    id: 'python-basics.lists.5',
    prompt: 'Which pair of lines stops with a `TypeError`?',
    options: [
      '`word = "cat"` then `word[0] = "b"`',
      '`letters = ["c", "a", "t"]` then `letters[0] = "b"`',
      '`letters = ["c", "a", "t"]` then `letters.append("s")`',
      '`word = "cat"` then `word = "b" + word[1:]`',
    ],
    answer: 0,
    explanation:
      'Strings are immutable, so you cannot change a character in place: Python raises `TypeError: \'str\' object does not support item assignment`. Lists are mutable, so assigning to `letters[0]` or appending works. `word = "b" + word[1:]` is fine because it builds a **new** string, `"bat"`, and moves the name `word` to it.',
    difficulty: 'beginner',
  },
]

export default questions
