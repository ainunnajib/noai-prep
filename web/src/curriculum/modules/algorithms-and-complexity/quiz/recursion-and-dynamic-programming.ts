import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'algorithms-and-complexity.recursion-and-dynamic-programming.1',
    prompt: 'What does this code print?',
    code: 'def f(n):\n    if n <= 1:\n        return 1\n    return n + f(n - 2)\n\nprint(f(6))',
    options: ['`13`', '`12`', '`21`', '`RecursionError`'],
    answer: 0,
    explanation:
      'Trace it: f(6) = 6 + f(4) = 6 + 4 + f(2) = 6 + 4 + 2 + f(0), and f(0) hits the base case ($0 \\le 1$) and returns 1, so the total is $12 + 1 = 13$. 12 forgets that the base case returns 1, not 0; 21 adds every number from 1 to 6. There is no RecursionError because $n$ drops by 2 each time and reaches the base case.',
    difficulty: 'beginner',
  },
  {
    id: 'algorithms-and-complexity.recursion-and-dynamic-programming.2',
    prompt:
      'The recursive `factorial(n)` from the lesson returns `factorial(10)` at once, but `factorial(1500)` stops with `RecursionError`. A loop that multiplies $1 \\times 2 \\times \\dots \\times 1500$ works fine. Why does the recursive version fail?',
    options: [
      'All 1,501 calls wait on the call stack at the same time, which is deeper than Python allows',
      'The answer has thousands of digits, more than a Python integer can hold, so the multiplication overflows',
      'Python allows about 1,000 function calls per program in total, and `factorial(1500)` makes 1,501 of them',
      'Each call makes two more calls, as `fib` does, so the number of calls grows exponentially with `n`',
    ],
    answer: 0,
    explanation:
      '`factorial(1500)` waits for `factorial(1499)`, which waits for `factorial(1498)`, and so on down to the base case, so at the deepest point 1,501 calls sit on the call stack together ($O(n)$ space), and Python stops at a depth of about 1,000. The limit is on calls waiting at the same time, not on calls in total: running `factorial(500)` twenty times in a row is fine. Python integers grow as large as needed, and factorial makes one recursive call per level, not two.',
    difficulty: 'intermediate',
  },
  {
    id: 'algorithms-and-complexity.recursion-and-dynamic-programming.3',
    prompt: 'Why does adding a memo (a dict of answers already computed) make recursive `fib(n)` run in $O(n)$ time instead of exponential time?',
    options: [
      'Each `fib(k)` is worked out only once; every later request is an $O(1)$ dict lookup, so about $n$ subproblems are solved.',
      'The dict keeps the calls in sorted order, so Python can find each answer by binary search instead of recursion.',
      'The memo replaces the base cases, so the recursion stops earlier and never reaches `fib(1)` or `fib(0)`.',
      'Python runs the two recursive calls `fib(n - 1)` and `fib(n - 2)` at the same time, halving the work at each level.',
    ],
    answer: 0,
    explanation:
      'Naive `fib` recomputes the same overlapping subproblems again and again (for example `fib(2)` five times inside `fib(6)`). With a memo, `fib(0)` to `fib(n)` are each computed once; every repeat is an $O(1)$ average dict lookup, giving $2n - 1$ calls in total. The base cases are still needed, and nothing runs in parallel.',
    difficulty: 'intermediate',
  },
  {
    id: 'algorithms-and-complexity.recursion-and-dynamic-programming.4',
    prompt:
      'You climb a staircase 1 or 2 steps at a time. Step 1 can be reached in 1 way and step 2 in 2 ways (1 + 1, or 2). Filling the table upwards, in how many different ways can you reach step 7?',
    options: ['21', '13', '34', '128'],
    answer: 0,
    explanation:
      'Every way to reach step $s$ ends with a 1-step from step $s - 1$ or a 2-step from step $s - 2$, so ways($s$) = ways($s - 1$) + ways($s - 2$). Filling upwards from 1 and 2 gives 3, 5, 8, 13, 21 for steps 3 to 7. 13 stops one step early, at step 6, and 34 goes one too far; $2^7 = 128$ treats each of 7 steps as a free choice, but a 2-step covers two steps at once, so the choices are not independent.',
    difficulty: 'beginner',
  },
  {
    id: 'algorithms-and-complexity.recursion-and-dynamic-programming.5',
    prompt:
      'You are filling an edit-distance table. For the next cell, the up-left cell holds 2, the cell above holds 2 and the cell to the left holds 3, and the two letters differ. What number goes in the cell?',
    options: ['3', '2', '4', '7'],
    answer: 0,
    explanation:
      'The cell is the smallest of up-left + $c$, up + 1 and left + 1, with $c = 1$ because the letters differ. The three candidates are $2 + 1 = 3$ (substitute), $2 + 1 = 3$ (delete) and $3 + 1 = 4$ (insert); the smallest is 3. Answering 2 takes the smallest neighbour but forgets to add the cost of the edit; 7 adds all three neighbours instead of taking the minimum.',
    difficulty: 'beginner',
  },
]

export default questions
