import type { ModuleQuiz } from '../../types'
import q0 from './quiz/perceptron'
import q1 from './quiz/activation-functions'
import q2 from './quiz/multilayer-perceptrons'
import q3 from './quiz/outputs-and-losses'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "perceptron": q0,
  "activation-functions": q1,
  "multilayer-perceptrons": q2,
  "outputs-and-losses": q3,
}

export default quiz
