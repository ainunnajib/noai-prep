import type { ModuleQuiz } from '../../types'
import q0 from './quiz/pacing-and-elimination'
import q1 from './quiz/drill-linear-algebra'
import q2 from './quiz/drill-calculus-probability'
import q3 from './quiz/drill-conv-and-params'
import q4 from './quiz/drill-shapes-and-code'
import q5 from './quiz/mock-prelim-and-review'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "pacing-and-elimination": q0,
  "drill-linear-algebra": q1,
  "drill-calculus-probability": q2,
  "drill-conv-and-params": q3,
  "drill-shapes-and-code": q4,
  "mock-prelim-and-review": q5,
}

export default quiz
