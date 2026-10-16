import type { ModuleQuiz } from '../../types'
import q0 from './quiz/k-means'
import q1 from './quiz/hierarchical-dbscan-spectral'
import q2 from './quiz/pca'
import q3 from './quiz/tsne-umap-and-anomalies'

/** Checkpoint questions per lesson. Edit the files in ./quiz/, not this index. */
const quiz: ModuleQuiz = {
  "k-means": q0,
  "hierarchical-dbscan-spectral": q1,
  "pca": q2,
  "tsne-umap-and-anomalies": q3,
}

export default quiz
