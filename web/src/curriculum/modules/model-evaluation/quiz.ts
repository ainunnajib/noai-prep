import type { ModuleQuiz } from '../../types'
import q0 from './quiz/confusion-matrix-and-metrics'
import q1 from './quiz/imbalanced-data'
import q2 from './quiz/roc-and-pr-curves'
import q3 from './quiz/cross-validation-and-tuning'
import q4 from './quiz/regression-and-overlap-metrics'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "confusion-matrix-and-metrics": q0,
  "imbalanced-data": q1,
  "roc-and-pr-curves": q2,
  "cross-validation-and-tuning": q3,
  "regression-and-overlap-metrics": q4,
}

export default quiz
