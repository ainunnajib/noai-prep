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
      summary: "Counting steps as input grows, the common complexity classes, and reading complexity off code.",
      minutes: 30,
      objectives: ["You can rank O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)", "You can derive the complexity of loops and nested loops", "You can distinguish time and space complexity"],
      load: () => import('./big-o.mdx'),
    },
    {
      slug: "searching-sorting-hashing",
      title: "Searching, sorting, hashing and heaps",
      summary: "Binary search halves the problem, sorting algorithms trade simplicity for speed, hash tables give constant-time lookup and heaps give the top k cheaply.",
      minutes: 35,
      objectives: ["You can explain why binary search is O(log n) and needs sorted data", "You can compare O(n²) and O(n log n) sorting", "You can explain why dict/set lookups are O(1) on average and when a heap beats sorting"],
      load: () => import('./searching-sorting-hashing.mdx'),
    },
    {
      slug: "recursion-dp-graphs",
      title: "Recursion, dynamic programming and graph search",
      summary: "Solving problems by breaking them into subproblems, remembering answers to avoid repeated work, and exploring graphs breadth-first or depth-first.",
      minutes: 35,
      objectives: ["You can trace a recursive function", "You can explain how memoisation turns exponential recursion into linear time", "You can fill a small dynamic-programming table", "You can contrast BFS and DFS"],
      load: () => import('./recursion-dp-graphs.mdx'),
    },
  ],
}

export default mod
