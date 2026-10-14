import type { ModuleQuiz } from '../../types'
import q0 from './quiz/decision-trees'
import q1 from './quiz/bagging-and-random-forests'
import q2 from './quiz/boosting-adaboost'
import q3 from './quiz/gradient-boosting'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "decision-trees": q0,
  "bagging-and-random-forests": q1,
  "boosting-adaboost": q2,
  "gradient-boosting": q3,
}

export default quiz
