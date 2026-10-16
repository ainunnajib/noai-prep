import type { ModuleQuiz } from '../../types'
import q0 from './quiz/transfer-learning-and-augmentation'
import q1 from './quiz/vision-tasks-and-detection'
import q2 from './quiz/u-net-segmentation'
import q3 from './quiz/segmentation-metrics'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "transfer-learning-and-augmentation": q0,
  "vision-tasks-and-detection": q1,
  "u-net-segmentation": q2,
  "segmentation-metrics": q3,
}

export default quiz
