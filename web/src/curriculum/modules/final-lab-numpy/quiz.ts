import type { ModuleQuiz } from '../../types'
import q0 from './quiz/exam-notebook-skills'
import q1 from './quiz/task-linear-regression-gd'
import q2 from './quiz/task-kmeans'
import q3 from './quiz/task-rag-tfidf'
import q4 from './quiz/task-gradient-boosting'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "exam-notebook-skills": q0,
  "task-linear-regression-gd": q1,
  "task-kmeans": q2,
  "task-rag-tfidf": q3,
  "task-gradient-boosting": q4,
}

export default quiz
