import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "vectors-and-matrices",
  order: 7,
  part: "toolkit",
  domain: "mathematics",
  title: "Vectors and matrices",
  tagline: "The language every model speaks",
  summary: "Vectors as arrows and lists of numbers, the dot product, norms and cosine similarity, matrix shapes, multiplication and the transpose, and the special matrices and numbers (identity, inverse, determinant, trace) that NOAI asks about.",
  prerequisites: ["python-toolkit", "maths-foundations"],
  syllabus: ["NOAI Mathematics: Linear Algebra", "Vectors, dot product, norms (L1, L2), cosine similarity", "Matrix shapes, transpose, matrix multiplication", "Identity, inverse, determinant, trace, symmetric matrices"],
  lessons: [
    {
      slug: "vectors",
      title: "Vectors: arrows and lists of numbers",
      summary: "A vector is both an arrow and a list of numbers: add, subtract and scale it component by component, read a data row as a vector, and see why Python lists do not add like vectors.",
      minutes: 25,
      objectives: ["You can read a vector both as an arrow and as a list of numbers", "You can add, subtract and scale vectors component by component", "You can write a row of a data table as a vector and give its dimension", "You can predict what + does to Python lists and to NumPy arrays"],
      load: () => import('./vectors.mdx'),
    },
    {
      slug: "dot-product-and-norms",
      title: "Dot product, norms and cosine similarity",
      summary: "The dot product, L1 and L2 norms, distance and cosine similarity: how to measure a vector's length and how closely two vectors point the same way.",
      minutes: 30,
      objectives: ["You can compute a dot product and read its sign: positive, zero (perpendicular) or negative", "You can compute L1 and L2 norms and the distance between two vectors", "You can compute cosine similarity and explain why it ignores length"],
      load: () => import('./dot-product-and-norms.mdx'),
    },
    {
      slug: "matrices-and-multiplication",
      title: "Matrices, shapes and matrix multiplication",
      summary: "Matrices as tables of numbers, the shape rule for multiplication, each entry as a row-times-column dot product, the transpose and the element-wise product.",
      minutes: 30,
      objectives: ["You can give a matrix's shape and decide whether two matrices can be multiplied", "You can compute a small matrix product by hand and explain why AB and BA usually differ", "You can transpose a matrix and a product of two matrices", "You can tell element-wise multiplication (*) from matrix multiplication (@)"],
      load: () => import('./matrices-and-multiplication.mdx'),
    },
    {
      slug: "identity-inverse-determinant",
      title: "Identity, inverse, determinant and trace",
      summary: "The determinant as an area scale factor, the identity and the 2×2 inverse, why a zero determinant means no inverse, and diagonal and symmetric matrices and the trace.",
      minutes: 30,
      objectives: ["You can compute a 2×2 determinant and explain it as an area scale factor", "You can invert a 2×2 matrix and check the answer by multiplying", "You can explain why a zero determinant means a matrix is singular and has no inverse", "You can recognise identity, diagonal and symmetric matrices and compute a trace"],
      load: () => import('./identity-inverse-determinant.mdx'),
    },
  ],
}

export default mod
