import type { ModuleQuiz } from '../../types'
import q0 from './quiz/what-is-noai'
import q1 from './quiz/exam-format-and-strategy'
import q2 from './quiz/how-to-study'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "what-is-noai": q0,
  "exam-format-and-strategy": q1,
  "how-to-study": q2,
}

export default quiz
