import type { ModuleQuiz } from '../../types'
import q0 from './quiz/logistic-regression'
import q1 from './quiz/likelihood-and-entropy'
import q2 from './quiz/softmax-and-multiclass'
import q3 from './quiz/k-nearest-neighbours'
import q4 from './quiz/naive-bayes'
import q5 from './quiz/support-vector-machines'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "logistic-regression": q0,
  "likelihood-and-entropy": q1,
  "softmax-and-multiclass": q2,
  "k-nearest-neighbours": q3,
  "naive-bayes": q4,
  "support-vector-machines": q5,
}

export default quiz
