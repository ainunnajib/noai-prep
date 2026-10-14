import type { ModuleQuiz } from '../../types'
import q0 from './quiz/tokenisation'
import q1 from './quiz/bag-of-words-and-tfidf'
import q2 from './quiz/word-embeddings'
import q3 from './quiz/text-classification'
import q4 from './quiz/rnns-and-lstms'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "tokenisation": q0,
  "bag-of-words-and-tfidf": q1,
  "word-embeddings": q2,
  "text-classification": q3,
  "rnns-and-lstms": q4,
}

export default quiz
