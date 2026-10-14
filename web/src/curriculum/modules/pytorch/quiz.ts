import type { ModuleQuiz } from '../../types'
import q0 from './quiz/tensors'
import q1 from './quiz/autograd'
import q2 from './quiz/modules-and-layers'
import q3 from './quiz/training-loop'
import q4 from './quiz/devices-and-common-errors'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "tensors": q0,
  "autograd": q1,
  "modules-and-layers": q2,
  "training-loop": q3,
  "devices-and-common-errors": q4,
}

export default quiz
