import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'python-toolkit.functions.1',
    prompt: 'What does this code print?',
    code: 'def f(a, *args, **kwargs):\n    print(a, args, kwargs)\n\nf(1, 2, 3, lr=0.1)',
    options: ["`1 (2, 3) {'lr': 0.1}`", "`1 [2, 3] {'lr': 0.1}`", "`(1, 2, 3) () {'lr': 0.1}`", '`1 (2, 3, 0.1) {}`'],
    answer: 0,
    explanation:
      "The first positional argument fills the named parameter `a`. The leftover positional arguments 2 and 3 are packed into the **tuple** `args`, printed with round brackets, not as a list. The keyword argument `lr=0.1` has no parameter of its own, so it goes into the **dict** `kwargs`.",
    difficulty: 'intermediate',
  },
  {
    id: 'python-toolkit.functions.2',
    prompt: 'What does this code print?',
    code: 'def half(x):\n    print(x / 2)\n\nr = half(5)\nprint(r, r is None)',
    options: ['`2.5`, then `None True`', '`2.5`, then `2.5 False`', '`2`, then `None True`', '`2.5`, then `None False`'],
    answer: 0,
    explanation:
      "Calling `half(5)` runs `print(x / 2)`, which shows `2.5` (`/` always gives a float; `//` would give 2). The function has no `return`, so it hands back `None`, which is stored in `r`, and `r is None` is True. The second line could only be `2.5 False` if the function used `return x / 2`, and then nothing would be printed inside the function.",
    difficulty: 'beginner',
  },
  {
    id: 'python-toolkit.functions.3',
    prompt: 'What does this code print?',
    code: 'x = 3\ndef f():\n    x = 7\n    return x * 2\n\nprint(f(), x)',
    options: ['`14 3`', '`14 7`', '`6 3`', '`UnboundLocalError`'],
    answer: 0,
    explanation:
      "Inside `f`, the assignment `x = 7` creates a **local** `x`, so `x * 2` uses 7 and `f()` returns 14. The global `x` is a different variable and is still 3. `14 7` assumes the function changed the global; the local variable disappears when `f` returns.",
    difficulty: 'intermediate',
  },
  {
    id: 'python-toolkit.functions.4',
    prompt:
      'A program has `count = 0` at the top. Inside `def inc():` the only line is `count = count + 1`. Calling `inc()` raises `UnboundLocalError`. Why?',
    options: [
      'Assigning to `count` in `inc` makes `count` local to all of `inc`, so it is read before it has a value',
      'A function can never read a global variable; it may only read its parameters and its local variables',
      'Integers are immutable, so Python refuses to add 1 to an integer that was created outside the function',
      '`inc` has no `return` statement, so the new value of `count` has nowhere to go and Python stops it',
    ],
    answer: 0,
    explanation:
      "Python decides which names are local before the function runs: any name assigned inside the function is local everywhere in it. So `count + 1` tries to read the local `count`, which has not been given a value. A function *can* read a global (if it never assigns to that name), and immutability only means `count + 1` builds a new int, which would be fine.",
    difficulty: 'advanced',
  },
  {
    id: 'python-toolkit.functions.5',
    prompt: 'A training function is defined as `def train(model, epochs=10, lr=0.01):`. Which call trains `m` for 10 epochs with a learning rate of 0.1?',
    options: ['`train(m, lr=0.1)`', '`train(m, 0.1)`', '`train(m, 10, 0.1, lr=0.1)`', '`train(lr=0.1, m)`'],
    answer: 0,
    explanation:
      "Leaving `epochs` out uses its default 10, and the keyword argument sets `lr` by name. `train(m, 0.1)` puts 0.1 into the **second** parameter, `epochs`. Passing `lr` both by position and by name raises `TypeError: train() got multiple values for argument 'lr'`, and a positional argument after a keyword argument is a `SyntaxError`.",
    difficulty: 'intermediate',
  },
]

export default questions
