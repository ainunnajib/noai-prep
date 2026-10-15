import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'numpy.why-numpy.1',
    prompt: 'A `float64` NumPy array has shape `(4, 5)`. What is `a.strides`?',
    options: ['`(40, 8)`', '`(5, 1)`', '`(8, 40)`', '`(32, 8)`'],
    answer: 0,
    explanation:
      'Each float64 takes 8 bytes, so one step along a row (next column) is 8 bytes. One step down skips a whole row of 5 numbers: $5 \\times 8 = 40$ bytes. Strides are counted in bytes, not elements, so `(5, 1)` is wrong; `(32, 8)` wrongly uses the number of rows (4) instead of the number of columns.',
    difficulty: 'intermediate',
  },
  {
    id: 'numpy.why-numpy.6',
    prompt: 'Which statement best describes **vectorisation** in NumPy?',
    options: [
      'Writing one whole-array operation, such as `y = 2 * x + 1`, instead of a Python loop',
      'Converting single numbers (scalars) into vectors so that NumPy can store them in arrays',
      'Moving an array onto the GPU so that a graphics card handles every element in parallel',
      'Changing an array to a smaller dtype, such as `float32`, so each element takes fewer bytes',
    ],
    answer: 0,
    explanation:
      'Vectorised code states the work for the whole array at once; the loop over the elements still happens, but inside NumPy\'s compiled C code. "Converting scalars to vectors" is the classic trap: it sounds like the word, but it is not what the term means. NumPy runs on the CPU, and changing the dtype (with `astype`) is a separate idea.',
    difficulty: 'beginner',
  },
  {
    id: 'numpy.why-numpy.2',
    prompt: 'Why does `out = arr * 2` on a NumPy array run much faster than a Python `for` loop that doubles each number of a list?',
    options: [
      'Its loop runs in compiled C over raw same-type numbers, with no per-element type checks',
      'NumPy automatically sends the array to the GPU and doubles the numbers there in parallel',
      'NumPy notices repeated values in the array and only doubles each distinct number once',
      'Python lists are kept on the hard disk, while NumPy arrays are held in fast memory (RAM)',
    ],
    answer: 0,
    explanation:
      'Vectorised code still loops over every element, but inside NumPy\'s compiled C code over one contiguous block of same-dtype numbers. The Python loop must check each object\'s type and build a new object for every answer. NumPy runs on the CPU: using a GPU needs a library such as PyTorch and an explicit move to the device.',
    difficulty: 'beginner',
  },
  {
    id: 'numpy.why-numpy.3',
    prompt: 'What does this code print?',
    code: 'import numpy as np\na = np.arange(8, dtype=np.int32)\nb = a.reshape(2, 4)\nprint(a.nbytes, b.strides)',
    options: ['`32 (16, 4)`', '`8 (4, 1)`', '`32 (4, 16)`', '`64 (32, 8)`'],
    answer: 0,
    explanation:
      'int32 uses 4 bytes per number, so 8 numbers take $8 \\times 4 = 32$ bytes. After reshaping to (2, 4), moving one column is 4 bytes and moving one row skips 4 numbers: $4 \\times 4 = 16$ bytes, giving `(16, 4)`. `64 (32, 8)` would be the answer for 8-byte int64.',
    difficulty: 'intermediate',
  },
  {
    id: 'numpy.why-numpy.4',
    prompt:
      'Your pure-Python function crunches numbers (no NumPy, no file or network access). You must run it on 4 independent chunks of data on a 4-core laptop. Which approach can actually make it about 4 times faster?',
    options: [
      'Use `multiprocessing` to run 4 processes, every one of them with its own interpreter and GIL',
      'Use `threading` to run 4 threads, because the threads share memory and so avoid copying data',
      'Call `gc.disable()` so that garbage collection stops pausing the program',
      'Use 4 threads, but give each thread a separate list so that they do not compete for the GIL',
    ],
    answer: 0,
    explanation:
      'The work is CPU-bound pure Python, so threads must take turns holding the GIL and finish no sooner than one thread would. Separate processes each have their own GIL and really run in parallel. Giving threads separate lists does not help: the GIL locks the whole interpreter, not individual objects.',
    difficulty: 'intermediate',
  },
  {
    id: 'numpy.why-numpy.5',
    prompt: 'After these three lines run, what happens to the list object `[1, 2, 3]`?',
    code: 'a = [1, 2, 3]\nb = a\ndel a',
    options: [
      'It stays in memory, because `del a` removes only the name and `b` still refers to it',
      'It is freed immediately, because `del a` deletes the list object',
      'It stays in memory until the cyclic garbage collector runs, because `b` is a copy',
      'Python raises an error, because a list cannot be deleted while another name refers to it',
    ],
    answer: 0,
    explanation:
      '`b = a` makes a second reference to the same list (not a copy), so the count becomes 2. `del a` removes only the name `a`, bringing the count down to 1. The list is freed only when its count reaches 0, for example after `b = None`.',
    difficulty: 'beginner',
  },
]

export default questions
