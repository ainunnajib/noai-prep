import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'python-basics.loops.1',
    prompt: 'What does this code print?',
    code: 'print(list(range(10, 0, -3)))',
    options: ['`[10, 7, 4, 1]`', '`[10, 7, 4]`', '`[]`', '`[9, 6, 3, 0]`'],
    answer: 0,
    explanation:
      'Start at 10 and add $-3$ each time: 10, 7, 4, 1. The next value would be $-2$, which is past the stop value 0, so the range ends at 1. It is not empty: a negative step counts **down**, so starting above the stop is exactly right. `[]` is what `range(10, 0)` would give, with the default step of +1.',
    difficulty: 'beginner',
  },
  {
    id: 'python-basics.loops.2',
    prompt: 'What does this code print?',
    code: 'count = 0\nfor i in range(2, 15, 4):\n    count = count + 1\nprint(count)',
    options: ['`4`', '`3`', '`13`', '`5`'],
    answer: 0,
    explanation:
      'The loop runs once per value of `range(2, 15, 4)`, which is 2, 6, 10, 14, so `count` reaches 4. With the formula: $\\lceil (15 - 2)/4 \\rceil = \\lceil 3.25 \\rceil = 4$. Rounding 3.25 **down** gives the tempting wrong answer 3, and 13 is the distance $15 - 2$ without dividing by the step.',
    difficulty: 'intermediate',
  },
  {
    id: 'python-basics.loops.3',
    prompt: 'What does this code print?',
    code: 'x = 100\nsteps = 0\nwhile x > 1:\n    x = x // 2\n    steps = steps + 1\nprint(x, steps)',
    options: ['`1 6`', '`1 7`', '`0 7`', '`3 5`'],
    answer: 0,
    explanation:
      'Trace it: 100 → 50 → 25 → 12 → 6 → 3 → 1, one step per arrow, so `steps` is 6 (remember `//` rounds down, so 25 // 2 is 12). Then `1 > 1` is `False` and the loop stops. Answering 7 counts the final check as a pass, but the body does not run when the condition is `False`.',
    difficulty: 'intermediate',
  },
  {
    id: 'python-basics.loops.4',
    prompt: 'This program never finishes. Why?',
    code: 'balance = 3\nwhile balance < 20:\n    print("Top up!")\nbalance = balance + 5',
    options: [
      'The last line is not indented, so it is outside the loop and never runs while the loop repeats',
      'A `while` loop always needs a `break` statement inside it to stop',
      'The condition should be written `balance =< 20` for a `while` loop',
      'Calling `print` inside a loop stops Python from ever checking the condition again',
    ],
    answer: 0,
    explanation:
      'Only the indented line `print("Top up!")` is in the loop body, so nothing inside the loop changes `balance`. It stays 3, `3 < 20` is `True` on every check, and the loop runs for ever. Indenting the last line fixes it. A `while` loop stops by itself once its condition becomes `False`, so `break` is optional.',
    difficulty: 'beginner',
  },
  {
    id: 'python-basics.loops.5',
    prompt:
      'A student runs the nudge loop `w = w - lr * error` (with `error = 2 * w - 6`) using `lr = 1.1`. The values of `w` go 0, 6.6, −1.32, 8.18, … What is happening, and what is the fix?',
    options: [
      'Each nudge overshoots 3 by more than the gap it corrects, so the swings grow; use a smaller learning rate',
      'The loop has not run for long enough yet; with more passes `w` will settle at 3',
      'The first guess `w = 0` is too far from 3; starting at `w = 10` would make it settle',
      'The nudges are too timid to reach 3; use a bigger learning rate such as 2',
    ],
    answer: 0,
    explanation:
      'Each pass multiplies the gap $w - 3$ by $1 - 2 \\times 1.1 = -1.2$. The minus sign flips $w$ to the other side of 3, and the size 1.2 makes the gap 20% bigger every pass, so more passes or a different start only make things worse. Any `lr` below 1 makes the gap shrink. In real training this shows up as a loss that oscillates wildly or becomes NaN.',
    difficulty: 'intermediate',
  },
]

export default questions
