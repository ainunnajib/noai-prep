import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'algorithms-and-complexity.big-o.1',
    prompt: 'An algorithm takes $5n^2 + 300n + 1000$ steps on an input of size $n$. What is the tightest Big-O description of its time complexity?',
    options: [
      '$O(n^2)$, because the $n^2$ term grows fastest',
      '$O(n)$, because $300n$ has the largest coefficient',
      '$O(n^3)$, because the expression has three terms',
      '$O(1)$, because Big-O drops all constants',
    ],
    answer: 0,
    explanation:
      'For large $n$ the fastest-growing term dominates and its coefficient is dropped. At $n = 1000$: $5n^2 = 5{,}000{,}000$ while $300n = 300{,}000$ and the constant is $1{,}000$, so $O(n^2)$. A big coefficient like 300 cannot stop $n^2$ from overtaking $n$; the number of terms is irrelevant, and only constant **factors** are dropped, not $n$ itself.',
    difficulty: 'beginner',
  },
  {
    id: 'algorithms-and-complexity.big-o.2',
    prompt: 'What is the time complexity of this function, where `n` is a positive integer?',
    code: 'def f(n):\n    total = 0\n    for i in range(n):\n        for j in range(n):\n            total += i * j\n    for k in range(n):\n        total -= k\n    return total',
    options: ['$O(n)$', '$O(n \\log n)$', '$O(n^2)$', '$O(n^3)$'],
    answer: 2,
    explanation:
      'The two nested loops multiply: $n \\times n = n^2$ steps. The last loop comes after them, so it adds: $n^2 + n$, which is $O(n^2)$. $O(n^3)$ would be right only if the third loop were nested inside the other two; $O(n)$ comes from adding the three loops as if none were nested.',
    difficulty: 'beginner',
  },
  {
    id: 'algorithms-and-complexity.big-o.3',
    prompt: 'About how many times does the body of this loop run when `n = 1_000_000`?',
    code: 'steps = 0\nwhile n > 1:\n    n = n // 2\n    steps += 1',
    options: ['About 6', 'About 20', 'About 1,000', 'About 500,000'],
    answer: 1,
    explanation:
      'Each pass halves `n`, so the loop runs about $\\log_2 1{,}000{,}000$ times. Since $2^{10} \\approx 1000$, a million is about $2^{20}$: about 20 passes (exactly 19, because it stops when `n` reaches 1). 6 is the number of zeros, which would be $\\log_{10}$ of a loop dividing by 10; 500,000 confuses halving once with halving repeatedly.',
    difficulty: 'intermediate',
  },
  {
    id: 'algorithms-and-complexity.big-o.4',
    prompt:
      'Two functions check whether a list of $n$ numbers contains a repeat. Function P compares every pair of items. Function Q walks through the list once, storing each number it has seen in a set. In the worst case, which statement is correct?',
    options: [
      'P: $O(n^2)$ time, $O(1)$ extra space. Q: $O(n)$ time, $O(n)$ extra space.',
      'P: $O(n^2)$ time, $O(n^2)$ extra space. Q: $O(n)$ time, $O(1)$ extra space.',
      'P: $O(n)$ time, $O(1)$ extra space. Q: $O(n)$ time, $O(n)$ extra space.',
      'P: $O(n^2)$ time, $O(n)$ extra space. Q: $O(n)$ time, $O(n)$ extra space.',
    ],
    answer: 0,
    explanation:
      'P makes $n(n-1)/2$ comparisons, which is $O(n^2)$, but only remembers two positions, so its extra space is $O(1)$. Q does one set lookup per item, $O(n)$ time, but its set can grow to all $n$ numbers: $O(n)$ extra space. Giving P $O(n)$ space counts the input list, which space complexity leaves out. Q trades memory for speed.',
    difficulty: 'intermediate',
  },
  {
    id: 'algorithms-and-complexity.big-o.5',
    prompt: 'Which list orders these complexity classes from slowest-growing to fastest-growing?',
    options: [
      '$O(1)$, $O(\\log n)$, $O(n)$, $O(n \\log n)$, $O(n^2)$, $O(2^n)$',
      '$O(1)$, $O(n)$, $O(\\log n)$, $O(n \\log n)$, $O(2^n)$, $O(n^2)$',
      '$O(1)$, $O(\\log n)$, $O(n \\log n)$, $O(n)$, $O(n^2)$, $O(2^n)$',
      '$O(\\log n)$, $O(1)$, $O(n)$, $O(n^2)$, $O(n \\log n)$, $O(2^n)$',
    ],
    answer: 0,
    explanation:
      'Plug in $n = 1024$: $1 < 10 < 1024 < 10{,}240 < 1{,}048{,}576 < 2^{1024}$. $\\log n$ is far smaller than $n$, and $n \\log n$ is only a little more than $n$ (it is $n$ times a small number), while $2^n$ eventually outgrows any power of $n$, including $n^2$.',
    difficulty: 'beginner',
  },
]

export default questions
