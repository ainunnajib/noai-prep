import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'algorithms-and-complexity.searching-sorting-hashing.1',
    prompt: 'This binary search looks for `10` in `a = [2, 5, 9, 14, 20, 27, 31, 38, 45]`. Which values of `a[mid]` does it compare with the target, in order?',
    code: 'lo, hi = 0, len(a) - 1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if a[mid] == target:\n        break\n    elif a[mid] < target:\n        lo = mid + 1\n    else:\n        hi = mid - 1',
    options: ['20, 5, 9, 14', '2, 5, 9, 14', '20, 9, 14', '20, 14, 9'],
    answer: 0,
    explanation:
      'mid = (0 + 8) // 2 = 4, so 20 first; 20 > 10, so hi = 3. Then mid = 3 // 2 = 1: 5 < 10, so lo = 2. Then mid = (2 + 3) // 2 = 2: 9 < 10, so lo = 3. Then mid = 3: 14 > 10, so hi = 2 < lo and the search stops: 10 is not there. "20, 9, 14" comes from rounding the middle up instead of down (`//` rounds down); "2, 5, 9, 14" is linear search.',
    difficulty: 'intermediate',
  },
  {
    id: 'algorithms-and-complexity.searching-sorting-hashing.2',
    prompt: 'Which statement about sorting $n$ items is correct?',
    options: [
      'Merge sort makes $O(n \\log n)$ comparisons even in its worst case, while bubble sort can need $O(n^2)$.',
      'Bubble sort makes $O(n \\log n)$ comparisons, because each pass halves the unsorted part of the list.',
      'Merge sort makes $O(n^2)$ comparisons, because every one of its levels has to merge all $n$ items.',
      'Both make $O(n)$ comparisons on random data, because each item only needs to move to its place once.',
    ],
    answer: 0,
    explanation:
      'Merge sort has $\\log_2 n$ levels of splitting and each level of merging costs about $n$ comparisons, so $O(n \\log n)$ always. Bubble sort shrinks the unsorted part by only one item per pass (it does not halve it), so it can need about $n^2/2$ comparisons. "Every level merges all $n$ items" is true, but there are only $\\log n$ levels, not $n$.',
    difficulty: 'beginner',
  },
  {
    id: 'algorithms-and-complexity.searching-sorting-hashing.3',
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
    id: 'algorithms-and-complexity.searching-sorting-hashing.4',
    prompt:
      'Finding the $k$ largest of $n$ numbers with a size-$k$ min-heap takes $O(n \\log k)$ steps. For $n = 1{,}000{,}000$ and $k = 8$, roughly how many steps is that? (Sorting everything would take about $n \\log_2 n \\approx 20{,}000{,}000$.)',
    options: ['About 3,000,000', 'About 8,000,000', 'About 24', 'About 20,000,000'],
    answer: 0,
    explanation:
      '$\\log_2 8 = 3$, so $n \\log_2 k = 1{,}000{,}000 \\times 3 = 3{,}000{,}000$, about 7 times fewer than sorting. 8,000,000 multiplies $n$ by $k$ instead of $\\log k$; 24 is $k \\log_2 k$ and forgets that every one of the $n$ numbers must be looked at.',
    difficulty: 'intermediate',
  },
  {
    id: 'algorithms-and-complexity.searching-sorting-hashing.5',
    prompt:
      'A program streams exam scores and must keep the 10 highest so far. It uses a MIN-heap holding at most 10 scores. Why a min-heap rather than a max-heap?',
    options: [
      'Its root is the smallest of the current top 10, so one comparison with the root decides whether a new score gets in.',
      'A min-heap keeps all the scores in sorted order, so the 10 highest can be read off the end of its list.',
      'A max-heap cannot hold more than one item at a time, so it cannot store ten scores together.',
      'A min-heap stores its items in less memory than a max-heap holding the same 10 scores.',
    ],
    answer: 0,
    explanation:
      'The score to beat is the lowest of the current top 10, and a min-heap keeps exactly that one at the root, readable in $O(1)$. A new score that beats it replaces the root and sifts down in $O(\\log 10)$; anything else is rejected after one comparison. A heap is only partly ordered (not sorted), and min- and max-heaps use the same memory.',
    difficulty: 'intermediate',
  },
]

export default questions
