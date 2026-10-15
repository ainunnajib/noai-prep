import type { ModuleDef } from '../../types'

const mod: ModuleDef = {
  slug: "numpy",
  order: 8,
  part: "toolkit",
  domain: "computing",
  title: "NumPy: thinking in arrays",
  tagline: "Whole arrays at full speed",
  summary: "Why arrays beat lists, creating and reshaping arrays, indexing, boolean masks and views, element-wise versus matrix products and axis reductions, broadcasting and its silent bugs, and the ten NumPy moves behind the Final's from-scratch tasks.",
  prerequisites: ["vectors-and-matrices"],
  syllabus: ["NOAI Computing: NumPy", "IOAI 1A2 NumPy and Pandas for Data Handling", "IOAI 1A6 Tensor (multi-dimensional array) manipulation", "shape, dtype, reshape, concatenate vs stack, views vs copies", "Broadcasting rules, axis reductions, * vs @", "Vectorisation, contiguous memory, the GIL and garbage collection", "Pairwise distances, argmin/argmax, rounding outputs for graders"],
  lessons: [
    {
      slug: "why-numpy",
      title: "Why NumPy? Arrays vs lists",
      summary: "Contiguous memory and strides, vectorisation, and two pieces of Python machinery: garbage collection and the GIL.",
      minutes: 25,
      objectives: ["You can explain why a vectorised NumPy operation beats a Python loop over a list", "You can work out an array's strides and size in bytes from its shape and dtype", "You can explain when Python frees an object and why threads do not speed up CPU-bound pure Python"],
      load: () => import('./why-numpy.mdx'),
    },
    {
      slug: "arrays-and-shapes",
      title: "Arrays, shape and dtype",
      summary: "Create arrays, read their shape and dtype, reshape them, and join them with concatenate or stack.",
      minutes: 30,
      objectives: ["You can create arrays with np.array, np.zeros, np.ones, np.arange and np.linspace", "You can read an array's shape, ndim and size", "You can reshape arrays, including with -1", "You can join arrays with concatenate or stack and predict the result shape"],
      load: () => import('./arrays-and-shapes.mdx'),
    },
    {
      slug: "indexing-and-masks",
      title: "Indexing, slicing and boolean masks",
      summary: "Pick out rows, columns and elements, filter with boolean masks, and tell views from copies.",
      minutes: 25,
      objectives: ["You can select a row, a column, a slice or a single element from a 2-D array", "You can filter, count and measure with a boolean mask", "You can tell whether an indexing result is a view or a copy", "You can work out the strides of a transpose and explain why it is a view"],
      load: () => import('./indexing-and-masks.mdx'),
    },
    {
      slug: "vectorised-ops-and-axes",
      title: "Element-wise operations, matrix products and axes",
      summary: "Tell element-wise * from the matrix product @ (or np.dot), and reduce arrays along an axis.",
      minutes: 20,
      objectives: ["You can tell element-wise multiplication from the matrix product and predict a product's shape", "You can predict the shape after a reduction along an axis, with or without keepdims", "You can compute sums, means and argmax per row or per column"],
      load: () => import('./vectorised-ops-and-axes.mdx'),
    },
    {
      slug: "broadcasting",
      title: "Broadcasting",
      summary: "Combine arrays of different shapes safely and spot the silent bugs.",
      minutes: 25,
      objectives: ["You can apply the broadcasting rules to predict a result shape or an error", "You can centre and standardise data with broadcasting", "You can spot an accidental (n, n) broadcast"],
      load: () => import('./broadcasting.mdx'),
    },
    {
      slug: "from-scratch-patterns",
      title: "NumPy patterns for from-scratch ML",
      summary: "The ten NumPy moves that build K-means, kNN, metrics and boosting in the Final.",
      minutes: 25,
      objectives: ["You can compute every pairwise distance with broadcasting and assign clusters with argmin", "You can use np.where, np.sign and np.median in from-scratch code", "You can round and return results in exactly the type and format a test expects"],
      load: () => import('./from-scratch-patterns.mdx'),
    },
  ],
}

export default mod
