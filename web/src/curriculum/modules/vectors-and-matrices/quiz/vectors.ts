import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
  {
    id: 'vectors-and-matrices.vectors.1',
    prompt:
      'A school stores a table with 500 rows (one per student) and 6 columns (six exam marks per student). If each student is treated as a vector, what is the dimension of each vector?',
    options: ['6', '500', '3000', '1'],
    answer: 0,
    explanation:
      'Each row is one student, and reading across a row gives one number per column, so each student is a list of 6 numbers: a vector in $\\mathbb{R}^6$. 500 is the number of vectors (rows), not the length of each one, and 3000 is the total count of numbers in the table.',
    difficulty: 'beginner',
  },
  {
    id: 'vectors-and-matrices.vectors.2',
    prompt: 'Let $\\mathbf{u} = [3, -1]$ and $\\mathbf{v} = [4, 2]$. What is $2\\mathbf{u} - \\mathbf{v}$?',
    options: ['$[2, -4]$', '$[-2, 4]$', '$[10, 0]$', '$[2, -3]$'],
    answer: 0,
    explanation:
      'First scale: $2\\mathbf{u} = [6, -2]$. Then subtract component by component: $[6 - 4,\\ -2 - 2] = [2, -4]$. $[-2, 4]$ is $\\mathbf{v} - 2\\mathbf{u}$ (the order flipped), $[10, 0]$ is $2\\mathbf{u} + \\mathbf{v}$, and $[2, -3]$ forgets to double the second component.',
    difficulty: 'beginner',
  },
  {
    id: 'vectors-and-matrices.vectors.3',
    prompt: 'What does this code print?',
    code: 'a = [1, 2]\nb = [3, 4]\nprint(a + b)',
    options: ['`[1, 2, 3, 4]`', '`[4, 6]`', '`[1, 2, [3, 4]]`', '`TypeError`'],
    answer: 0,
    explanation:
      '`a` and `b` are plain Python lists, and `+` on lists **concatenates** them, giving `[1, 2, 3, 4]`: the items of `b` join the end of `a` one by one, not as a nested list (`[1, 2, [3, 4]]` is what `a.append(b)` would make). Adding two lists is allowed, so there is no `TypeError`. Component-by-component addition, `[4, 6]`, only happens with NumPy arrays (or PyTorch tensors), for example `np.array(a) + np.array(b)`.',
    difficulty: 'beginner',
  },
  {
    id: 'vectors-and-matrices.vectors.4',
    prompt: 'A non-zero vector $\\mathbf{v}$ is multiplied by the scalar $-0.5$. Compared with $\\mathbf{v}$, the new arrow:',
    options: [
      'points the opposite way and is half as long',
      'points the same way and is half as long',
      'points the opposite way and is twice as long',
      'is turned through 90° and is half as long',
    ],
    answer: 0,
    explanation:
      'Every component is multiplied by $-0.5$. The minus sign flips the direction (it stays on the same line through the origin) and the size $0.5$ halves the length. Scaling can never turn an arrow sideways, so the 90° option is impossible.',
    difficulty: 'beginner',
  },
  {
    id: 'vectors-and-matrices.vectors.5',
    prompt:
      "A fitness app stores each user as a vector [steps per day, hours of sleep, resting heart rate]. Ali is $[8000, 7, 62]$ and Bala is $[6000, 8, 70]$. The app wants one vector describing the average of the two users. Which statement is correct?",
    options: [
      'The average is $\\tfrac{1}{2}(\\text{Ali} + \\text{Bala}) = [7000, 7.5, 66]$',
      'The average is $\\text{Ali} + \\text{Bala} = [14000, 15, 132]$',
      'The average is $\\tfrac{1}{2}(\\text{Ali} - \\text{Bala}) = [1000, -0.5, -4]$',
      'No average vector exists, because the three components have different units',
    ],
    answer: 0,
    explanation:
      'Add matching components and scale by $\\tfrac{1}{2}$: $\\tfrac{1}{2}[14000, 15, 132] = [7000, 7.5, 66]$. Mixed units are not a problem, because each component is only ever combined with the matching component of the other vector (steps with steps, sleep with sleep). $[14000, 15, 132]$ forgets to halve the sum.',
    difficulty: 'beginner',
  },
]

export default questions
