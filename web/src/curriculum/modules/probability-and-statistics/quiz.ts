import type { ModuleQuiz } from '../../types'
import q0 from './quiz/describing-data'
import q1 from './quiz/probability-rules'
import q2 from './quiz/bayes-theorem'
import q3 from './quiz/distributions-and-clt'
import q4 from './quiz/correlation-and-testing'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "describing-data": q0,
  "probability-rules": q1,
  "bayes-theorem": q2,
  "distributions-and-clt": q3,
  "correlation-and-testing": q4,
}

export default quiz
