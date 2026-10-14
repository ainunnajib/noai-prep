import type { ModuleQuiz } from '../../types'
import q0 from './quiz/linear-transformations'
import q1 from './quiz/span-rank-independence'
import q2 from './quiz/eigenvectors-eigenvalues'
import q3 from './quiz/covariance-pca-svd'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "linear-transformations": q0,
  "span-rank-independence": q1,
  "eigenvectors-eigenvalues": q2,
  "covariance-pca-svd": q3,
}

export default quiz
