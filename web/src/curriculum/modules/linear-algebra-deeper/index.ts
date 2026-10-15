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
      summary: "Every matrix stretches, rotates, shears, reflects or squashes the whole grid; its columns are the recipe, and multiplying matrices chains the moves.",
      minutes: 30,
      objectives: ["You can read where a 2×2 matrix sends the basis vectors from its columns, and build a matrix from them", "You can recognise rotation, scaling, shear, reflection and projection matrices", "You can put two moves in the right order as a product, and explain why stacked linear layers collapse into one matrix", "You can tell the input and output sizes of an m × n matrix, such as a layer's weight matrix"],
      load: () => import('./linear-transformations.mdx'),
    },
    {
      slug: "span-rank-independence",
      title: "Span, linear independence and rank",
      summary: "How many truly different directions a set of vectors or a matrix has, why rank limits what a matrix can do, and what 'nearly singular' means.",
      minutes: 35,
      objectives: ["You can decide whether a set of vectors is linearly independent and describe what it spans", "You can find the rank of a small matrix and explain why it is at most min(m, n)", "You can link full rank, a non-zero determinant and invertibility for a square matrix", "You can explain what a large condition number means when solving Ax = b"],
      load: () => import('./span-rank-independence.mdx'),
    },
    {
      slug: "eigenvectors-eigenvalues",
      title: "Eigenvectors and eigenvalues",
      summary: "The special directions a matrix only stretches, never turns, and the numbers that say by how much.",
      minutes: 35,
      objectives: ["You can check whether a vector is an eigenvector with Av = λv and read off its eigenvalue", "You can find the eigenvalues of a 2×2 matrix, by inspection when it is triangular", "You can use sum = trace and product = determinant, and spot a singular matrix from a zero eigenvalue", "You can predict what multiplying by the same matrix again and again does to a vector"],
      load: () => import('./eigenvectors-eigenvalues.mdx'),
    },
    {
      slug: "covariance-and-pca",
      title: "Covariance and PCA",
      summary: "The shape of a data cloud captured in a matrix, and PCA: its eigenvectors are the directions of greatest spread.",
      minutes: 20,
      objectives: ["You can read and compute a covariance matrix and give its shape", "You can explain PCA as finding the eigenvectors of the covariance matrix, and why features are standardised first", "You can compute an explained variance ratio and a PCA score"],
      load: () => import('./covariance-and-pca.mdx'),
    },
    {
      slug: "svd-and-special-matrices",
      title: "SVD and special matrices",
      summary: "Orthogonal matrices, the turn-stretch-turn view of any matrix, low-rank approximation, positive definite matrices, QR and the Frobenius norm.",
      minutes: 35,
      objectives: ["You can describe the SVD as turn, stretch, turn and find the singular values of a small matrix", "You can recognise orthogonal matrices (they keep lengths) and positive definite ones (all eigenvalues positive)", "You can describe QR decomposition by Gram–Schmidt and compute a Frobenius norm"],
      load: () => import('./svd-and-special-matrices.mdx'),
    },
  ],
}

export default mod
