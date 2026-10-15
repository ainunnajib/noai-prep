import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "linear-algebra-deeper",
  order: 18,
  part: "classical-ml",
  domain: "mathematics",
  title: "Matrices as transformations: rank, eigenvectors and SVD",
  tagline: "Watching matrices bend space",
  summary: "Seeing a matrix as a warp of space explains rank, linear independence and conditioning, eigenvectors and eigenvalues, covariance matrices and SVD, the ideas behind PCA and many deeper NOAI maths questions.",
  prerequisites: ["vectors-and-matrices", "numpy", "probability-and-statistics"],
  syllabus: ["NOAI Mathematics: Linear Algebra", "Linear transformations and composition", "Span, linear independence, rank", "Eigenvalues and eigenvectors", "Covariance matrix, PCA, SVD, orthogonal and positive definite matrices", "Condition number and numerical stability"],
  lessons: [
    {
      slug: "linear-transformations",
      title: "A matrix is a transformation of space",
      summary: "Every matrix stretches, rotates, shears or squashes the whole grid, and multiplying matrices chains the moves.",
      minutes: 30,
      objectives: ["You can predict where a 2×2 matrix sends the basis vectors", "You can recognise rotation, scaling, shear and projection matrices", "You can explain why matrix multiplication order matters"],
      load: () => import('./linear-transformations.mdx'),
    },
    {
      slug: "span-rank-independence",
      title: "Span, linear independence and rank",
      summary: "How many truly different directions a set of vectors or a matrix has, why rank limits what a matrix can do, and what 'nearly singular' means.",
      minutes: 30,
      objectives: ["You can decide whether vectors are linearly independent", "You can find the rank of small matrices", "You can explain why rank ≤ min(m, n)"],
      load: () => import('./span-rank-independence.mdx'),
    },
    {
      slug: "eigenvectors-eigenvalues",
      title: "Eigenvectors and eigenvalues",
      summary: "The special directions a matrix only stretches, never turns, and the numbers that say by how much.",
      minutes: 35,
      objectives: ["You can state Av = λv in words", "You can find eigenvalues of a 2×2 diagonal or triangular matrix by inspection", "You can relate eigenvalues to determinant and trace"],
      load: () => import('./eigenvectors-eigenvalues.mdx'),
    },
    {
      slug: "covariance-pca-svd",
      title: "Covariance, PCA and SVD",
      summary: "The shape of a data cloud captured in a matrix, its principal directions, and the rotate-stretch-rotate view of any matrix.",
      minutes: 45,
      objectives: ["You can read a covariance matrix", "You can explain PCA as finding eigenvectors of the covariance matrix", "You can describe SVD as rotate, stretch, rotate", "You can describe QR decomposition (Gram-Schmidt) and compute a Frobenius norm"],
      load: () => import('./covariance-pca-svd.mdx'),
    },
  ],
}

export default mod
