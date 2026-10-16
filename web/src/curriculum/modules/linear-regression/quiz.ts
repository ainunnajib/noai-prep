import type { ModuleQuiz } from '../../types'
import q0 from './quiz/least-squares'
import q1 from './quiz/regression-by-gradient-descent'
import q2 from './quiz/multiple-and-polynomial'
import q3 from './quiz/regularisation'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "least-squares": q0,
  "regression-by-gradient-descent": q1,
  "multiple-and-polynomial": q2,
  "regularisation": q3,
}

export default quiz
