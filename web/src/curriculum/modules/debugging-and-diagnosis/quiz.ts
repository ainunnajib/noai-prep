import type { ModuleQuiz } from '../../types'
import q0 from './quiz/reading-loss-curves'
import q1 from './quiz/systematic-debugging'
import q2 from './quiz/pytorch-gotchas'
import q3 from './quiz/nan-and-numerical-issues'
import q4 from './quiz/data-bugs-and-shift'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "reading-loss-curves": q0,
  "systematic-debugging": q1,
  "pytorch-gotchas": q2,
  "nan-and-numerical-issues": q3,
  "data-bugs-and-shift": q4,
}

export default quiz
