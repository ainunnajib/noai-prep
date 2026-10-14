import type { ModuleQuiz } from '../../types'
import q0 from './quiz/what-is-ai'
import q1 from './quiz/fit-a-line-by-hand'
import q2 from './quiz/let-the-computer-learn'
import q3 from './quiz/classify-with-boundaries'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "what-is-ai": q0,
  "fit-a-line-by-hand": q1,
  "let-the-computer-learn": q2,
  "classify-with-boundaries": q3,
}

export default quiz
