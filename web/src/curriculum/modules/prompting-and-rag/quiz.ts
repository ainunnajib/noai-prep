import type { ModuleQuiz } from '../../types'
import q0 from './quiz/prompt-engineering'
import q1 from './quiz/rag-pipeline'
import q2 from './quiz/rag-from-scratch'
import q3 from './quiz/tools-and-agents'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "prompt-engineering": q0,
  "rag-pipeline": q1,
  "rag-from-scratch": q2,
  "tools-and-agents": q3,
}

export default quiz
