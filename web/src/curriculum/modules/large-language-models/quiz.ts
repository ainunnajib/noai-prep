import type { ModuleQuiz } from '../../types'
import q0 from './quiz/how-llms-are-built'
import q1 from './quiz/decoding-and-sampling'
import q2 from './quiz/context-and-cost'
import q3 from './quiz/fine-tuning-and-lora'
import q4 from './quiz/limits-and-responsible-ai'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "how-llms-are-built": q0,
  "decoding-and-sampling": q1,
  "context-and-cost": q2,
  "fine-tuning-and-lora": q3,
  "limits-and-responsible-ai": q4,
}

export default quiz
