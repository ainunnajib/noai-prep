import type { ModuleQuiz } from '../../types'
import q0 from './quiz/pacing-and-elimination'
import q1 from './quiz/drill-linear-algebra'
import q2 from './quiz/drill-calculus-probability'
import q3 from './quiz/drill-dl-and-code'
import q4 from './quiz/mock-prelim-and-review'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "pacing-and-elimination": q0,
  "drill-linear-algebra": q1,
  "drill-calculus-probability": q2,
  "drill-dl-and-code": q3,
  "mock-prelim-and-review": q4,
}

export default quiz
