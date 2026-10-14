import type { ModuleQuiz } from '../../types'
import q0 from './quiz/logistic-regression'
import q1 from './quiz/likelihood-and-entropy'
import q2 from './quiz/softmax-and-multiclass'
import q3 from './quiz/knn-and-naive-bayes'
import q4 from './quiz/support-vector-machines'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "logistic-regression": q0,
  "likelihood-and-entropy": q1,
  "softmax-and-multiclass": q2,
  "knn-and-naive-bayes": q3,
  "support-vector-machines": q4,
}

export default quiz
