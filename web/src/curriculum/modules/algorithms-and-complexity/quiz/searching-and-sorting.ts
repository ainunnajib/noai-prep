import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'algorithms-and-complexity.searching-and-sorting.1',
    prompt: 'This binary search looks for `10` in `a = [2, 5, 9, 14, 20, 27, 31, 38, 45]`. Which values of `a[mid]` does it compare with the target, in order?',
    code: 'lo, hi = 0, len(a) - 1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if a[mid] == target:\n        break\n    elif a[mid] < target:\n        lo = mid + 1\n    else:\n        hi = mid - 1',
    options: ['20, 5, 9, 14', '2, 5, 9, 14', '20, 9, 14', '20, 31, 38, 45'],
    answer: 0,
    explanation:
      'mid = (0 + 8) // 2 = 4, so 20 first; 20 > 10, so hi = 3. Then mid = 3 // 2 = 1: 5 < 10, so lo = 2. Then mid = (2 + 3) // 2 = 2: 9 < 10, so lo = 3. Then mid = 3: 14 > 10, so hi = 2 < lo and the search stops: 10 is not there. "20, 9, 14" comes from rounding the middle up instead of down (`//` rounds down); "20, 31, 38, 45" moves right after 20 although 20 is bigger than the target; "2, 5, 9, 14" is linear search.',
    difficulty: 'intermediate',
  },
  {
    id: 'algorithms-and-complexity.searching-and-sorting.2',
    prompt:
      'Binary search needs at most 20 comparisons on a sorted list of 1,000,000 names. The list grows to 4,000,000 names. What is the largest number of comparisons it can need now?',
    options: ['22', '80', '40', '320'],
    answer: 0,
    explanation:
      'Each doubling of $n$ adds just one comparison, and 4 times as many names is two doublings: $20 + 2 = 22$. Exactly: $2^{21} = 2{,}097{,}152 \\le 4{,}000{,}000 < 2^{22}$, so $\\lfloor \\log_2 4{,}000{,}000 \\rfloor + 1 = 21 + 1 = 22$. 80 multiplies by 4 as if binary search grew linearly, 40 doubles the count, and 320 multiplies by 16 as an $O(n^2)$ cost would.',
    difficulty: 'intermediate',
  },
  {
    id: 'algorithms-and-complexity.searching-and-sorting.3',
    prompt: 'Which statement about sorting $n$ items is correct?',
    options: [
      'Merge sort needs $O(n \\log n)$ comparisons even in its worst case; bubble sort can need $O(n^2)$.',
      'Bubble sort needs $O(n \\log n)$ comparisons, because each pass halves the unsorted part of the list.',
      'Merge sort needs $O(n^2)$ comparisons, because each of its levels has to merge the whole list of $n$ items.',
      'Both need $O(n)$ comparisons on random data, because each item has to move to its place just once.',
    ],
    answer: 0,
    explanation:
      'Merge sort has $\\log_2 n$ levels of splitting and each level of merging costs about $n$ comparisons, so $O(n \\log n)$ always. Bubble sort shrinks the unsorted part by only one item per pass (it does not halve it), so it can need about $n^2/2$ comparisons. Each level does merge all $n$ items, but there are only $\\log_2 n$ levels, not $n$.',
    difficulty: 'beginner',
  },
  {
    id: 'algorithms-and-complexity.searching-and-sorting.4',
    prompt:
      'Merge sort merges the sorted lists `[2, 4, 6, 8]` and `[1, 3, 5]` by repeatedly comparing their front items and taking the smaller. How many comparisons does this merge take?',
    options: ['5', '6', '7', '12'],
    answer: 0,
    explanation:
      '1 vs 2 takes 1; 2 vs 3 takes 2; 4 vs 3 takes 3; 4 vs 5 takes 4; 6 vs 5 takes 5. The right list is now empty, so 6 and 8 are copied across with no comparison: 5 in total. 6 is the most a merge of 7 items can need ($n - 1$), but this one stops early because one list runs out first; 7 counts a comparison for every item placed; 12 = 4 × 3 compares every pair, which a merge never does.',
    difficulty: 'beginner',
  },
  {
    id: 'algorithms-and-complexity.searching-and-sorting.5',
    prompt:
      'A quicksort always uses the first item of the part it is sorting as the pivot. It is given $n$ numbers that are already in sorted order. How does its running time grow?',
    options: [
      '$O(n^2)$: every pivot is the smallest item left, so one side is empty and there are $n$ levels',
      '$O(n \\log n)$: each pivot still splits its part into two halves, so there are $\\log_2 n$ levels',
      '$O(n)$: the numbers are in order already, so each item is compared with a pivot just once',
      '$O(\\log n)$: each pivot rules out half of what is left, just as binary search does',
    ],
    answer: 0,
    explanation:
      'On sorted data the first item is the smallest, so every other item goes to the right of the pivot and the left side is empty. Each level removes just one item, so there are $n$ levels with $n - 1, n - 2, \\ldots$ comparisons: about $n^2/2$ in total (4,950 for $n = 100$), which is $O(n^2)$. $O(n \\log n)$ is the average case, which needs pivots that roughly halve the list. Already-sorted input is this quicksort\'s worst case, not a shortcut to $O(n)$, and any sort has to look at all $n$ items, so it can never be the $O(\\log n)$ of binary search.',
    difficulty: 'intermediate',
  },
]

export default questions
