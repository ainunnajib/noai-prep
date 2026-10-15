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
      slug: "searching-sorting-hashing",
      title: "Searching, sorting, hashing and heaps",
      summary: "Binary search halves the problem, sorting algorithms trade simplicity for speed, hash tables give constant-time lookup on average and heaps give the top k cheaply.",
      minutes: 40,
      objectives: ["You can trace binary search on a sorted list and explain why it takes O(log n) steps", "You can compare O(n²) sorts such as bubble sort with O(n log n) merge sort", "You can explain why dict and set lookups are O(1) on average", "You can use a size-k min-heap to find the top k of n items in O(n log k)"],
      load: () => import('./searching-sorting-hashing.mdx'),
    },
    {
      slug: "recursion-dp-graphs",
      title: "Recursion, dynamic programming and graph search",
      summary: "Solving problems by breaking them into subproblems, remembering answers to avoid repeated work, and exploring graphs breadth-first or depth-first.",
      minutes: 40,
      objectives: ["You can trace a recursive function down to its base case and back", "You can explain how memoisation turns exponential recursion into linear time", "You can fill in cells of a dynamic-programming table such as edit distance", "You can choose BFS for fewest-hop paths and explain how it differs from DFS"],
      load: () => import('./recursion-dp-graphs.mdx'),
    },
  ],
}

export default mod
