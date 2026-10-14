import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'algorithms-and-complexity.recursion-dp-graphs.1',
    prompt: 'What does this code print?',
    code: 'def f(n):\n    if n <= 1:\n        return 1\n    return n + f(n - 2)\n\nprint(f(6))',
    options: ['`13`', '`12`', '`21`', '`RecursionError`'],
    answer: 0,
    explanation:
      'Trace it: f(6) = 6 + f(4) = 6 + 4 + f(2) = 6 + 4 + 2 + f(0), and f(0) hits the base case ($0 \\le 1$) and returns 1, so the total is $12 + 1 = 13$. 12 forgets that the base case returns 1, not 0; 21 adds every number from 1 to 6. There is no RecursionError because $n$ drops by 2 each time and reaches the base case.',
    difficulty: 'beginner',
  },
  {
    id: 'algorithms-and-complexity.recursion-dp-graphs.2',
    prompt: 'Why does adding a memo (a dict of answers already computed) make recursive `fib(n)` run in $O(n)$ time instead of exponential time?',
    options: [
      'Each `fib(k)` is computed only once and later requests are dict lookups, so only about $n$ subproblems are ever solved.',
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
    id: 'algorithms-and-complexity.recursion-dp-graphs.3',
    prompt:
      'In the edit-distance table, $D[i][j] = \\min(D[i-1][j-1] + c,\\ D[i-1][j] + 1,\\ D[i][j-1] + 1)$, where $c = 0$ if the two letters match and $c = 1$ otherwise. If $D[i-1][j-1] = 2$, $D[i-1][j] = 2$, $D[i][j-1] = 3$ and the letters are different, what is $D[i][j]$?',
    options: ['3', '2', '4', '7'],
    answer: 0,
    explanation:
      'The three candidates are $2 + 1 = 3$ (substitute), $2 + 1 = 3$ (delete) and $3 + 1 = 4$ (insert); the smallest is 3. Answering 2 takes the smallest neighbour but forgets to add the cost of the edit; 7 adds all three neighbours instead of taking the minimum.',
    difficulty: 'beginner',
  },
  {
    id: 'algorithms-and-complexity.recursion-dp-graphs.4',
    prompt:
      'A delivery app needs the route with the fewest hops between two places on a map where every road counts as one hop. Which method is guaranteed to find such a route?',
    options: [
      'BFS with a queue, because it reaches places in order of their distance from the start',
      'DFS with a stack, because it goes deep first and so reaches faraway places sooner',
      'Any search that visits every place once, because every complete search returns the same route',
      'Binary search on the sorted list of place names, because it halves the search each step',
    ],
    answer: 0,
    explanation:
      'BFS visits every place 1 hop away, then every place 2 hops away, and so on, so the first time it reaches the goal it has used the fewest hops. DFS returns the first route it stumbles on, which can be much longer: 9 hops instead of 4 from Home to Stadium in the lesson, so different searches can return different routes. Binary search finds items in a sorted list, not routes.',
    difficulty: 'beginner',
  },
  {
    id: 'algorithms-and-complexity.recursion-dp-graphs.5',
    prompt: 'Which statement about BFS and DFS on a graph with $V$ nodes and $E$ edges is correct?',
    options: [
      'Both visit every reachable node in $O(V + E)$ time; the order differs because BFS uses a queue and DFS uses a stack.',
      'BFS takes $O(V^2)$ time while DFS takes $O(V + E)$, so DFS is always the faster choice on large graphs.',
      'DFS always finds the shortest path, because it follows each path all the way to the end before trying another.',
      'BFS only works if the edges are first sorted by length, which adds an $O(E \\log E)$ sorting step at the start.',
    ],
    answer: 0,
    explanation:
      'Each node is added to the frontier once and each edge is examined a constant number of times, so both are $O(V + E)$. The only difference is the frontier: first in, first out (BFS) gives level-by-level order; last in, first out (DFS) gives deep-first order. DFS does not guarantee shortest paths, and BFS needs no sorting.',
    difficulty: 'intermediate',
  },
]

export default questions
