import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "algorithms-and-complexity",
  order: 5,
  part: "code",
  domain: "problem_solving",
  title: "Algorithms and complexity",
  tagline: "Thinking about cost before coding",
  summary: "Big-O notation and counting steps in code, binary search, sorting, hashing and heaps, then recursion, memoisation, dynamic programming and graph search, the algorithm-design toolkit behind the Problem Solving domain.",
  prerequisites: ["python-toolkit"],
  syllabus: ["NOAI Problem Solving: Algorithm Design", "Big-O time and space complexity", "Binary search, sorting, hashing, heaps for top-k", "Recursion, memoisation, dynamic programming, BFS/DFS"],
  lessons: [
    {
      slug: "big-o",
      title: "Big-O: how cost grows",
      summary: "Counting steps as the input grows, the common complexity classes and what Big-O formally means, reading complexity off code, and time versus space.",
      minutes: 35,
      objectives: ["You can simplify a step count to its Big-O by keeping the dominant term", "You can rank O(1), O(log n), O(n), O(n log n), O(n²) and O(2ⁿ) from slowest- to fastest-growing", "You can work out the Big-O of loops, nested loops and halving loops", "You can work out the extra space an algorithm needs, separately from its time"],
      load: () => import('./big-o.mdx'),
    },
    {
      slug: "searching-and-sorting",
      title: "Searching and sorting",
      summary: "Linear versus binary search and why halving gives O(log n), then sorting from O(n²) bubble and insertion sort to O(n log n) merge sort, and when quicksort slows to O(n²).",
      minutes: 20,
      objectives: ["You can trace binary search on a sorted list and work out its worst-case number of comparisons, about log₂ n", "You can merge two sorted lists by hand and explain why merge sort is O(n log n) while bubble sort can need O(n²)", "You can explain why quicksort is O(n log n) on average but O(n²) when every pivot is the smallest item, as on sorted data"],
      load: () => import('./searching-and-sorting.mdx'),
    },
    {
      slug: "hashing-and-heaps",
      title: "Hashing and heaps",
      summary: "Hash tables jump straight to a key's bucket, so dict and set lookups are O(1) on average, and a size-k min-heap finds the top k of n items in O(n log k) without sorting everything.",
      minutes: 25,
      objectives: ["You can explain why dict and set lookups are O(1) on average and work out a hash table's load factor n/m", "You can push a value into a min-heap stored as a list, sifting it up to its place", "You can use a size-k min-heap to find the top k of n items in O(n log k), and explain why it is a min-heap and not a max-heap"],
      load: () => import('./hashing-and-heaps.mdx'),
    },
    {
      slug: "recursion-and-dynamic-programming",
      title: "Recursion and dynamic programming",
      summary: "Functions that call themselves, why naive recursive Fibonacci is exponential, memoisation that remembers every answer, and dynamic-programming tables such as edit distance.",
      minutes: 30,
      objectives: ["You can trace a recursive function down to its base case and back, and explain why n waiting calls use O(n) space on the call stack", "You can explain how memoisation turns exponential recursion into linear time", "You can fill a dynamic-programming table bottom-up, from counting ways up a staircase to the cells of an edit-distance table"],
      load: () => import('./recursion-and-dynamic-programming.mdx'),
    },
    {
      slug: "graph-search",
      title: "Graph search: breadth-first and depth-first",
      summary: "Graphs stored as adjacency lists, breadth-first search with a queue for fewest-hop paths, depth-first search with a stack, and the graphs inside AI, from computational graphs to beam search.",
      minutes: 20,
      objectives: ["You can store a graph as an adjacency list and trace breadth-first search by hand, writing down the queue after each visit", "You can choose BFS (a queue) for fewest-hop paths, explain how DFS (a stack) differs, and explain why both take O(V + E) time", "You can explain why BFS no longer finds the cheapest route once edges have different costs, the job of Dijkstra's algorithm", "You can explain beam search as a breadth-first search that keeps only the k best partial sentences at each level"],
      load: () => import('./graph-search.mdx'),
    },
  ],
}

export default mod
