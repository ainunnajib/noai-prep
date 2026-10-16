import type { QuizQuestion } from '../../../types'

const questions: QuizQuestion[] = [
    {
      id: '_template.what-is-a-vector.1',
      prompt: 'What is the length (L2 norm) of the vector $v = [6, 8]$?',
      options: ['10', '14', '48', '100'],
      answer: 0,
      explanation: 'Use Pythagoras: $\\sqrt{6^2 + 8^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10$. Adding the parts (14) gives the L1 norm, not the length.',
      difficulty: 'beginner',
    },
    {
      id: '_template.what-is-a-vector.2',
      prompt: 'What does this code print?',
      code: 'import numpy as np\nv = np.array([3, 4])\nprint(np.linalg.norm(v))',
      options: ['`5.0`', '`7`', '`25`', '`[3 4]`'],
      answer: 0,
      explanation: '`np.linalg.norm` returns the L2 norm by default: $\\sqrt{3^2+4^2} = 5$, printed as the float `5.0`.',
      difficulty: 'beginner',
    },
  ]

export default questions
