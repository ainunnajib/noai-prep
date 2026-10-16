import type { ModuleQuiz } from '../../types'
import q0 from './quiz/confusion-matrix-and-metrics'
import q1 from './quiz/imbalanced-data'
import q2 from './quiz/roc-and-pr-curves'
import q3 from './quiz/cross-validation'
import q4 from './quiz/hyperparameter-tuning'
import q5 from './quiz/regression-and-overlap-metrics'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "confusion-matrix-and-metrics": q0,
  "imbalanced-data": q1,
  "roc-and-pr-curves": q2,
  "cross-validation": q3,
  "hyperparameter-tuning": q4,
  "regression-and-overlap-metrics": q5,
}

export default quiz
