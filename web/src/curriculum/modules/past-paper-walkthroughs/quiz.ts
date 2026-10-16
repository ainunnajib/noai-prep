import type { ModuleQuiz } from '../../types'
import q0 from './quiz/prelim-maths-computing'
import q1 from './quiz/prelim-ml-genai'
import q2 from './quiz/prelim-problem-solving'
import q3 from './quiz/final-mcqs-and-trends'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "prelim-maths-computing": q0,
  "prelim-ml-genai": q1,
  "prelim-problem-solving": q2,
  "final-mcqs-and-trends": q3,
}

export default quiz
