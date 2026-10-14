import type { ModuleQuiz } from '../../types'
import q0 from './quiz/derivatives-as-slopes'
import q1 from './quiz/derivative-rules'
import q2 from './quiz/chain-rule'
import q3 from './quiz/partial-derivatives-gradients'
import q4 from './quiz/gradient-descent'
import q5 from './quiz/curvature-convexity'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "derivatives-as-slopes": q0,
  "derivative-rules": q1,
  "chain-rule": q2,
  "partial-derivatives-gradients": q3,
  "gradient-descent": q4,
  "curvature-convexity": q5,
}

export default quiz
