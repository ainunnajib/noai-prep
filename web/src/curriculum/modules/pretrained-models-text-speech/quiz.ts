import type { ModuleQuiz } from '../../types'
import q0 from './quiz/bert-and-gpt'
import q1 from './quiz/encoder-decoder-models'
import q2 from './quiz/hugging-face-in-practice'
import q3 from './quiz/audio-as-data'
import q4 from './quiz/speech-models'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "bert-and-gpt": q0,
  "encoder-decoder-models": q1,
  "hugging-face-in-practice": q2,
  "audio-as-data": q3,
  "speech-models": q4,
}

export default quiz
