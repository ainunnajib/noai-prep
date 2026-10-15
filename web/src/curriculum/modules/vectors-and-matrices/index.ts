import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "vectors-and-matrices",
  order: 7,
  part: "toolkit",
  domain: "mathematics",
  title: "Vectors and matrices",
  tagline: "The language every model speaks",
  summary: "Vectors as arrows and lists of numbers, the dot product, norms and cosine similarity, matrix shapes and multiplication, and the special matrices (identity, inverse, determinant) that NOAI asks about.",
  prerequisites: ["python-toolkit", "maths-foundations"],
  syllabus: ["NOAI Mathematics: Linear Algebra", "Vectors, dot product, norms (L1, L2), cosine similarity", "Matrix shapes, transpose, matrix multiplication", "Identity, inverse, determinant, trace, symmetric matrices"],
  lessons: [
    {
      slug: "vectors",
      title: "Vectors: arrows and lists of numbers",
      summary: "A vector is both an arrow in space and a list of numbers; adding and scaling work the same way in both pictures.",
      minutes: 25,
      objectives: ["You can read a vector as an arrow and as a list", "You can add vectors and multiply them by a number", "You can describe a data point (e.g. a student's marks) as a vector"],
      load: () => import('./vectors.mdx'),
    },
    {
      slug: "dot-product-and-norms",
      title: "Dot product, norms and cosine similarity",
      summary: "How to measure length, distance and 'how much two vectors point the same way'.",
      minutes: 30,
      objectives: ["You can compute a dot product by hand", "You can compute L1 and L2 norms and the distance between vectors", "You can compute and interpret cosine similarity"],
      load: () => import('./dot-product-and-norms.mdx'),
    },
    {
      slug: "matrices-and-multiplication",
      title: "Matrices, shapes and matrix multiplication",
      summary: "Matrices as tables of numbers, the shape rule for multiplication and how each entry is a row-times-column dot product.",
      minutes: 30,
      objectives: ["You can state the shape of a matrix and its transpose", "You can decide whether two matrices can be multiplied and the result's shape", "You can compute a small matrix product by hand", "You can tell element-wise multiplication from matrix multiplication"],
      load: () => import('./matrices-and-multiplication.mdx'),
    },
    {
      slug: "identity-inverse-determinant",
      title: "Identity, inverse, determinant and trace",
      summary: "The special matrices and single numbers that describe what a matrix does, including when it cannot be undone.",
      minutes: 30,
      objectives: ["You can recognise identity, diagonal and symmetric matrices", "You can compute a 2×2 determinant and inverse", "You can explain what a zero determinant (singular matrix) means", "You can compute the trace"],
      load: () => import('./identity-inverse-determinant.mdx'),
    },
  ],
}

export default mod
