import type { ModuleQuiz } from '../../types'
import q0 from './quiz/missing-data-and-outliers'
import q1 from './quiz/scaling-and-normalisation'
import q2 from './quiz/encoding-categories'
import q3 from './quiz/feature-engineering'
import q4 from './quiz/splitting-and-leakage'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "missing-data-and-outliers": q0,
  "scaling-and-normalisation": q1,
  "encoding-categories": q2,
  "feature-engineering": q3,
  "splitting-and-leakage": q4,
}

export default quiz
