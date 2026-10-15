import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'algorithms-and-complexity.graph-search.1',
    prompt: 'This breadth-first search starts at `S`. What does it print?',
    code: 'from collections import deque\n\ngraph = {\n    "S": ["B", "E"],\n    "B": ["S", "A", "D"],\n    "E": ["S", "C"],\n    "A": ["B"],\n    "D": ["B", "C"],\n    "C": ["E", "D"],\n}\n\nqueue, seen, order = deque(["S"]), {"S"}, []\nwhile queue:\n    u = queue.popleft()\n    order.append(u)\n    for v in graph[u]:\n        if v not in seen:\n            seen.add(v)\n            queue.append(v)\nprint(" ".join(order))',
    options: ['`S B E A D C`', '`S B A D C E`', '`S E C D B A`', '`S E B C D A`'],
    answer: 0,
    explanation:
      "The queue hands out the oldest node first, so BFS finishes each level before the next: S, then its neighbours B and E (1 edge away), then B's new neighbours A and D, then E's new neighbour C (2 edges away). `S B A D C E` is the depth-first order, which goes down from B to A and D before coming back for E. `S E C D B A` is what you get by swapping `popleft()` for `pop()`, which takes the newest node instead of the oldest.",
    difficulty: 'intermediate',
  },
  {
    id: 'algorithms-and-complexity.graph-search.2',
    prompt:
      'A delivery app needs the route with the fewest hops between two places on a map where every road counts as one hop. Which method is guaranteed to find such a route?',
    options: [
      'BFS with a queue, because it reaches places in order of their distance from the start',
      'DFS with a stack, because it goes deep first and so reaches faraway places sooner',
      'Any search that visits each place once, because a complete search returns the same route',
      'Binary search on the sorted list of place names, because it halves the search each step',
    ],
    answer: 0,
    explanation:
      'BFS visits every place 1 hop away, then every place 2 hops away, and so on, so the first time it reaches the goal it has used the fewest hops. DFS returns the first route it stumbles on, which can be much longer: 9 hops instead of 4 from Home to Stadium in the lesson, so different searches can return different routes. Binary search finds items in a sorted list, not routes.',
    difficulty: 'beginner',
  },
  {
    id: 'algorithms-and-complexity.graph-search.3',
    prompt: 'Which statement about BFS and DFS on a graph with $V$ nodes and $E$ edges, stored as an adjacency list, is correct?',
    options: [
      'Both visit every reachable node in $O(V + E)$ time; only the frontier differs: a queue versus a stack.',
      'BFS takes $O(V^2)$ time while DFS takes $O(V + E)$, so DFS is always the faster choice on large graphs.',
      'DFS always finds the shortest path, because it follows each path all the way to the end before trying another.',
      'BFS needs the edges sorted by length before it starts, which adds an $O(E \\log E)$ sorting step to its cost.',
    ],
    answer: 0,
    explanation:
      'Each node is added to the frontier once and each edge is examined a constant number of times, so both are $O(V + E)$. The only difference is the frontier: first in, first out (BFS) gives level-by-level order; last in, first out (DFS) gives deep-first order. DFS does not guarantee shortest paths, BFS needs no sorting, and $O(V^2)$ is what either search costs on an adjacency matrix, not BFS alone.',
    difficulty: 'intermediate',
  },
  {
    id: 'algorithms-and-complexity.graph-search.4',
    prompt:
      'Two routes join Home to the Stadium. Route P uses 2 roads of 30 minutes each; route Q uses 3 roads of 10 minutes each. Which route does BFS return?',
    options: [
      'P, the route with fewer roads, although Q takes less time (30 minutes against 60)',
      'Q, because BFS adds up the minutes on each route and returns the smallest total',
      'P, and P is also the faster route, because fewer roads means less travel time',
      'Q, because its queue keeps routes sorted by total time, with the quickest at the front',
    ],
    answer: 0,
    explanation:
      "BFS counts edges and ignores their costs: it reaches the Stadium after 2 roads along P before it gets 3 roads down Q. But P takes $30 + 30 = 60$ minutes and Q only $10 + 10 + 10 = 30$, so fewer roads is not the same as less time. A BFS queue is first in, first out, not sorted by cost; keeping the frontier sorted by total cost in a priority queue (a heap) is what Dijkstra's algorithm adds.",
    difficulty: 'intermediate',
  },
  {
    id: 'algorithms-and-complexity.graph-search.5',
    prompt:
      'A language model picks each word from a vocabulary of 1,000 words and writes 3-word sentences. How many sentences sit at level 3 of a full breadth-first search, and how many does beam search with beam width 4 keep at each level?',
    options: [
      '$1{,}000^3 = 10^9$ in the full search; beam search keeps 4',
      '$3 \\times 1{,}000 = 3{,}000$ in the full search; beam search keeps 4',
      '$1{,}000^3 = 10^9$ in the full search; beam search keeps $4^3 = 64$ by level 3',
      '$3 \\times 1{,}000 = 3{,}000$ in the full search; beam search keeps $4^3 = 64$ by level 3',
    ],
    answer: 0,
    explanation:
      'Each partial sentence can be extended by any of the 1,000 words, so the full tree multiplies: $1{,}000 \\times 1{,}000 \\times 1{,}000 = 10^9$ sentences at level 3. Beam search scores the extensions of its 4 kept sentences ($4 \\times 1{,}000 = 4{,}000$ candidates), then keeps only the best 4 again, so the beam never grows past its width. Adding instead of multiplying gives 3,000, and $4^3 = 64$ forgets the pruning back to 4 at every level.',
    difficulty: 'intermediate',
  },
]

export default questions
