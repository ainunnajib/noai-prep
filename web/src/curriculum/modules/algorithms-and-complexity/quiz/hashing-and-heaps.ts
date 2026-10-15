import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'algorithms-and-complexity.hashing-and-heaps.1',
    prompt: 'Why is `x in s` usually much faster when `s` is a Python `set` than when `s` is a `list` of the same items?',
    options: [
      'The set hashes `x` to find the one bucket where `x` could be, so on average it checks only a few items.',
      'The set keeps its items in sorted order, so Python can run a binary search on it.',
      'The set checks the items from the front like a list does, but it is written in C, so each check is faster.',
      'The set has removed duplicate items, so there are fewer items for Python to check one by one.',
    ],
    answer: 0,
    explanation:
      'A set is a hash table: Python computes `hash(x)`, turns it into a bucket number and compares `x` only with the few items there, $O(1)$ on average. A list must be scanned item by item, $O(n)$. Sets are not sorted (binary search would still be $O(\\log n)$), and removing duplicates cannot explain the speed-up when the list has no duplicates.',
    difficulty: 'beginner',
  },
  {
    id: 'algorithms-and-complexity.hashing-and-heaps.2',
    prompt:
      'A hash table with chaining stores 2,000 keys in 500 buckets, spread evenly by a good hash function. About how many stored keys does a lookup compare the target with?',
    options: ['About 4', 'About 500', 'About 2,000', 'About 11'],
    answer: 0,
    explanation:
      'The load factor is $\\alpha = n/m = 2{,}000/500 = 4$, so each chain holds about 4 keys, and a lookup hashes the target and walks just one chain: $O(1 + \\alpha)$. About 11 is $\\log_2 2{,}000$, the cost of binary search on sorted data; 2,000 is a scan of every key, which happens only in the worst case where all keys collide; 500 is the number of buckets, but a lookup visits one of them.',
    difficulty: 'beginner',
  },
  {
    id: 'algorithms-and-complexity.hashing-and-heaps.3',
    prompt:
      'The list `h` below is already a min-heap (the children of position $i$ are at $2i + 1$ and $2i + 2$). What does the code print?',
    code: 'import heapq\nh = [3, 8, 5, 12, 9, 7]\nheapq.heappush(h, 2)\nprint(h)',
    options: ['[2, 8, 3, 12, 9, 7, 5]', '[2, 3, 5, 7, 8, 9, 12]', '[3, 8, 5, 12, 9, 7, 2]', '[2, 3, 5, 8, 9, 7, 12]'],
    answer: 0,
    explanation:
      '2 goes in at the end, position 6. Its parent is at $\\lfloor (6 - 1)/2 \\rfloor = 2$, which holds 5, and $2 < 5$, so they swap: `[3, 8, 2, 12, 9, 7, 5]`. Its new parent is position 0, which holds 3, and $2 < 3$, so they swap again and 2 becomes the root. A heap is only partly ordered, so the list does not become sorted; `[2, 3, 5, 8, 9, 7, 12]` takes the parent of position $i$ to be $i // 2$ (swapping 2 with 12, then 8, then 3), and leaving 2 at the end skips the sift-up.',
    difficulty: 'intermediate',
  },
  {
    id: 'algorithms-and-complexity.hashing-and-heaps.4',
    prompt:
      'Finding the $k$ largest of $n$ numbers with a size-$k$ min-heap takes $O(n \\log k)$ steps. For $n = 1{,}000{,}000$ and $k = 8$, roughly how many steps is that? (Sorting everything would take about $n \\log_2 n \\approx 20{,}000{,}000$.)',
    options: ['About 3,000,000', 'About 8,000,000', 'About 24', 'About 20,000,000'],
    answer: 0,
    explanation:
      '$\\log_2 8 = 3$, so $n \\log_2 k = 1{,}000{,}000 \\times 3 = 3{,}000{,}000$, about 7 times fewer than sorting. 8,000,000 multiplies $n$ by $k$ instead of $\\log k$; 24 is $k \\log_2 k$ and forgets that every one of the $n$ numbers must be looked at.',
    difficulty: 'intermediate',
  },
  {
    id: 'algorithms-and-complexity.hashing-and-heaps.5',
    prompt:
      'A program streams exam scores and must keep the 10 highest so far. It uses a MIN-heap holding at most 10 scores. Why a min-heap rather than a max-heap?',
    options: [
      'Its root is the lowest of the top 10, so one comparison with the root decides if a new score gets in.',
      'A min-heap keeps its scores fully sorted, so the 10 highest can be read straight off the end of its list.',
      "A max-heap's root would be the highest score, and each new score has to beat the highest score to get in.",
      'A min-heap pushes and pops in $O(1)$ time, whereas a max-heap needs $O(\\log n)$ for each of them.',
    ],
    answer: 0,
    explanation:
      'The score to beat is the lowest of the current top 10, and a min-heap keeps exactly that one at the root, readable in $O(1)$. A new score that beats it replaces the root and sifts down in $O(\\log 10)$; anything else is rejected after one comparison. A max-heap would put the highest score at the root, but a new score only has to beat the lowest of the top 10, which a max-heap buries among its leaves. A heap is only partly ordered (not sorted), and min- and max-heaps cost the same $O(\\log n)$ per push or pop.',
    difficulty: 'intermediate',
  },
]

export default questions
