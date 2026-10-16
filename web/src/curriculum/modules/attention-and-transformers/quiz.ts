import type { ModuleQuiz } from '../../types'
import q0 from './quiz/attention-intuition'
import q1 from './quiz/scaled-dot-product-attention'
import q2 from './quiz/multi-head-attention'
import q3 from './quiz/positional-encoding-and-blocks'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "attention-intuition": q0,
  "scaled-dot-product-attention": q1,
  "multi-head-attention": q2,
  "positional-encoding-and-blocks": q3,
}

export default quiz
