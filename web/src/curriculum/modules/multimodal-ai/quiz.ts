import type { ModuleQuiz } from '../../types'
import q0 from './quiz/vision-transformers'
import q1 from './quiz/self-supervised-vision'
import q2 from './quiz/clip-and-zero-shot'
import q3 from './quiz/vision-language-models'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "vision-transformers": q0,
  "self-supervised-vision": q1,
  "clip-and-zero-shot": q2,
  "vision-language-models": q3,
}

export default quiz
