import type { ModuleQuiz } from '../../types'
import q0 from './quiz/generative-vs-discriminative'
import q1 from './quiz/autoencoders-and-vaes'
import q2 from './quiz/gans'
import q3 from './quiz/diffusion-models'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "generative-vs-discriminative": q0,
  "autoencoders-and-vaes": q1,
  "gans": q2,
  "diffusion-models": q3,
}

export default quiz
