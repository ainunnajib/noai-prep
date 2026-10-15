import type { ModuleQuiz } from '../../types'
import q0 from './quiz/linear-transformations'
import q1 from './quiz/span-rank-independence'
import q2 from './quiz/eigenvectors-eigenvalues'
import q3 from './quiz/covariance-and-pca'
import q4 from './quiz/svd-and-special-matrices'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "linear-transformations": q0,
  "span-rank-independence": q1,
  "eigenvectors-eigenvalues": q2,
  "covariance-and-pca": q3,
  "svd-and-special-matrices": q4,
}

export default quiz
