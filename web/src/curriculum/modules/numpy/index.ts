import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "numpy",
  order: 8,
  part: "toolkit",
  domain: "computing",
  title: "NumPy: thinking in arrays",
  tagline: "Whole arrays at full speed",
  summary: "Why arrays beat lists, creating and reshaping arrays, indexing and boolean masks, element-wise versus matrix products and axis reductions, broadcasting and its silent bugs, and the handful of NumPy moves that every from-scratch Final task uses.",
  prerequisites: ["vectors-and-matrices"],
  syllabus: ["NOAI Computing: NumPy", "IOAI 1A2 NumPy and Pandas for Data Handling", "IOAI 1A6 Tensor (multi-dimensional array) manipulation", "shape, dtype, reshape, concatenate vs stack, views vs copies", "Broadcasting rules, axis reductions, * vs @", "Vectorisation, contiguous memory, the GIL and garbage collection", "Pairwise distances, argmin/argmax, rounding outputs for graders"],
  lessons: [
    {
      slug: "why-numpy",
      title: "Why NumPy? Arrays vs lists",
      summary: "Contiguous memory, vectorisation, and what happens under Python's hood.",
      minutes: 18,
      objectives: ["You can explain why NumPy arrays are faster than lists", "You can define vectorisation and stride", "You can describe Python's garbage collection and the GIL in one sentence each"],
      load: () => import('./why-numpy.mdx'),
    },
    {
      slug: "arrays-and-shapes",
      title: "Arrays, shape and dtype",
      summary: "Create arrays, read their shape and dtype, reshape them, and join them with concatenate or stack.",
      minutes: 18,
      objectives: ["You can create arrays with np.array, np.zeros, np.arange and np.linspace", "You can state the shape of any array you create", "You can reshape arrays, including with -1", "You can join arrays with concatenate or stack and predict the result shape"],
      load: () => import('./arrays-and-shapes.mdx'),
    },
    {
      slug: "indexing-and-masks",
      title: "Indexing, slicing and boolean masks",
      summary: "Pick out rows, columns and elements, and filter with conditions.",
      minutes: 20,
      objectives: ["You can select a row, a column and a single element from a 2D array", "You can filter with a boolean mask", "You can tell whether a slice is a view or a copy", "You can explain strides and why a transpose is a view, not a copy"],
      load: () => import('./indexing-and-masks.mdx'),
    },
    {
      slug: "vectorised-ops-and-axes",
      title: "Element-wise operations, matrix products and axes",
      summary: "Tell * from @ and np.dot, and reduce arrays along an axis.",
      minutes: 14,
      objectives: ["You can tell element-wise multiplication from matrix multiplication", "You can predict the shape after a reduction along an axis", "You can compute means and sums per row or column"],
      load: () => import('./vectorised-ops-and-axes.mdx'),
    },
    {
      slug: "broadcasting",
      title: "Broadcasting",
      summary: "Combine arrays of different shapes safely and spot the silent bugs.",
      minutes: 15,
      objectives: ["You can apply the broadcasting rules to predict a result shape", "You can centre and standardise data with broadcasting", "You can spot an accidental (n, n) broadcast"],
      load: () => import('./broadcasting.mdx'),
    },
    {
      slug: "from-scratch-patterns",
      title: "NumPy patterns for from-scratch ML",
      summary: "The ten NumPy moves that build K-means, kNN, metrics and boosting in the Final.",
      minutes: 18,
      objectives: ["You can compute all pairwise distances with broadcasting", "You can use argmin/argmax, np.where, np.sign and np.unique", "You can round and return results in the format tests expect"],
      load: () => import('./from-scratch-patterns.mdx'),
    },
  ],
}

export default mod
