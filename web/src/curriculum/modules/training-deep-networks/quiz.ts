import type { ModuleQuiz } from '../../types'
import q0 from './quiz/sgd-and-mini-batches'
import q1 from './quiz/momentum-and-adam'
import q2 from './quiz/initialisation-and-normalisation'
import q3 from './quiz/regularising-deep-networks'
import q4 from './quiz/learning-rate-warmup-schedules'
import q5 from './quiz/stability-and-scale'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "sgd-and-mini-batches": q0,
  "momentum-and-adam": q1,
  "initialisation-and-normalisation": q2,
  "regularising-deep-networks": q3,
  "learning-rate-warmup-schedules": q4,
  "stability-and-scale": q5,
}

export default quiz
