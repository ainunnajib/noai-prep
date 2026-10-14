import type { ModuleQuiz } from '../../types'
import q0 from './quiz/torch-exam-patterns'
import q1 from './quiz/task-unet-center-crop'
import q2 from './quiz/task-mean-iou'
import q3 from './quiz/task-attention'
import q4 from './quiz/task-pe-classifier-mask'
import q5 from './quiz/practice-set'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "torch-exam-patterns": q0,
  "task-unet-center-crop": q1,
  "task-mean-iou": q2,
  "task-attention": q3,
  "task-pe-classifier-mask": q4,
  "practice-set": q5,
}

export default quiz
