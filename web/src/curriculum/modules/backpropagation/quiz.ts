import type { ModuleQuiz } from '../../types'
import q0 from './quiz/computational-graphs'
import q1 from './quiz/backprop-step-by-step'
import q2 from './quiz/vanishing-and-exploding-gradients'
import q3 from './quiz/network-from-scratch'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "computational-graphs": q0,
  "backprop-step-by-step": q1,
  "vanishing-and-exploding-gradients": q2,
  "network-from-scratch": q3,
}

export default quiz
