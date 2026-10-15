/*
  Toy word embeddings made for this lesson (NOT trained): 24 words, 16 numbers each.
  Dimensions 0-3 mark the topic (people, places, food & drink, transport) and are the largest entries,
  so words of one topic have cosine similarity of about 0.2-0.98 and words of different topics about 0.
  Dimension 4 is shared by every word, and the remaining dimensions encode relations (gender, royalty,
  capital city, Singlish vs English drink names, ...). Every other entry is small noise, so no entry is
  exactly 0, as in real embeddings. `xy` is a fixed linear projection of each vector to 2-D for drawing
  (linear, so analogy parallelograms stay parallelograms).
*/
export const CLUSTERS = ['people', 'places', 'food & drink', 'transport'] as const

export interface WordVec {
  word: string
  cluster: number
  vec: number[]
  xy: [number, number]
}

export const WORDS: WordVec[] = [
  { word: 'man', cluster: 0, vec: [1.94, -0.01, -0.05, -0.04, 0.34, -0.6, 0.03, -0.03, 0.04, -0.09, 0.08, -0.03, 0.03, -0.01, -0.02, 0.02], xy: [-4.126, 2.551] },
  { word: 'woman', cluster: 0, vec: [1.92, -0.05, -0.02, -0.04, 0.27, 0.59, -0.03, -0.1, -0.04, -0.02, -0.06, -0.07, 0.03, 0.04, -0.01, -0.04], xy: [-2.277, 2.367] },
  { word: 'king', cluster: 0, vec: [1.96, 0.05, 0.06, -0.04, 0.34, -0.61, 1.62, 0.01, 0.05, -0.06, -0.03, -0.04, -0.09, 0.01, 0.03, -0.04], xy: [-4.208, 3.816] },
  { word: 'queen', cluster: 0, vec: [1.9, 0.04, -0.01, 0.06, 0.28, 0.6, 1.63, -0.09, 0.02, -0.01, 0.04, -0.02, -0.03, 0.02, -0.04, 0.03], xy: [-1.856, 4.092] },
  { word: 'boy', cluster: 0, vec: [1.96, 0.05, 0.03, -0.05, 0.34, -0.56, 0.06, 1.29, -0.08, 0.04, 0.02, -0.05, -0.05, 0.06, -0.06, 0.03], xy: [-4.348, 1.209] },
  { word: 'girl', cluster: 0, vec: [1.92, -0.03, -0.04, 0.06, 0.43, 0.65, -0.09, 1.17, 0.04, 0.08, 0.02, -0.04, 0.01, -0.04, -0.01, -0.04], xy: [-1.745, 0.918] },
  { word: 'japan', cluster: 1, vec: [-0.02, 1.86, 0.05, -0.02, 0.33, 0.04, -0.01, -0.07, 1.07, -0.27, 0.11, 0.04, -0.02, -0.07, 0.07, 0.13], xy: [3.999, 1.675] },
  { word: 'tokyo', cluster: 1, vec: [-0.04, 1.92, 0.03, -0.05, 0.33, 0.01, 0.05, 0.02, 1.05, -0.32, 1.32, -0.11, -0.07, 0.04, -0.03, 0.03], xy: [3.923, 3.144] },
  { word: 'france', cluster: 1, vec: [0.05, 1.92, -0.03, -0.02, 0.32, -0.03, -0.02, -0.06, -1.03, -0.3, 0.01, -0.02, -0.1, 0.02, 0.01, 0.05], xy: [0.53, 1.739] },
  { word: 'paris', cluster: 1, vec: [-0.05, 1.9, -0.04, -0.03, 0.44, 0.08, -0.04, 0.02, -0.98, -0.27, 1.33, 0.01, 0.01, -0.08, -0.01, -0.04], xy: [1.223, 2.977] },
  { word: 'korea', cluster: 1, vec: [0.02, 1.9, -0.02, 0.05, 0.37, 0.04, -0.02, -0.01, -0.02, 0.52, 0.02, 0.03, -0.07, 0.04, -0.04, -0.04], xy: [2.805, 2.248] },
  { word: 'seoul', cluster: 1, vec: [0.05, 1.94, -0.06, 0.04, 0.31, 0.05, 0.06, -0.06, -0.05, 0.42, 1.39, -0.08, 0.02, 0.03, -0.07, 0.02], xy: [2.876, 4.179] },
  { word: 'coffee', cluster: 2, vec: [0.01, -0.03, 1.88, -0.02, 0.37, -0.01, 0.03, -0.05, 0.04, -0.03, -0.05, -0.78, 0.88, 0.95, -0.03, 0.03], xy: [-3.969, -0.634] },
  { word: 'tea', cluster: 2, vec: [0.02, 0.02, 1.92, -0.02, 0.3, -0.02, -0.07, -0.08, -0.05, 0.04, 0.08, -0.8, -0.75, 0.89, -0.1, 0.01], xy: [-4.187, -1.632] },
  { word: 'kopi', cluster: 2, vec: [-0.05, 0.06, 1.92, 0.02, 0.28, -0.01, -0.01, -0.02, 0.05, 0.09, -0.02, 0.83, 0.85, 0.94, 0.05, -0.02], xy: [-1.72, -0.728] },
  { word: 'teh', cluster: 2, vec: [0.04, 0.01, 1.88, 0.04, 0.41, 0.01, -0.03, 0.08, -0.06, 0.03, -0.04, 0.74, -0.74, 0.92, -0.06, 0.03], xy: [-2.257, -1.852] },
  { word: 'laksa', cluster: 2, vec: [0.04, 0.04, 1.88, 0.04, 0.36, -0.03, 0.02, -0.01, 0.06, 0.01, 0.01, 1.13, -0.05, -1.14, 0.08, 0.02], xy: [-1.474, -3.873] },
  { word: 'prata', cluster: 2, vec: [0.02, -0.04, 1.92, -0.05, 0.36, -0.06, 0.07, -0.03, -0.08, -0.01, -0.02, -1.09, -0.06, -1.08, 0.18, -0.06], xy: [-4.439, -3.92] },
  { word: 'satay', cluster: 2, vec: [-0.01, -0.04, 1.86, -0.05, 0.37, 0.03, 0.08, -0.04, 0.01, 0.15, -0.04, -0.05, -0.9, -1.1, 0.04, 0.01], xy: [-2.896, -4.239] },
  { word: 'mrt', cluster: 3, vec: [-0.06, -0.03, -0.03, 1.88, 0.34, -0.03, 0.03, -0.01, 0.1, 0.05, 0.04, 0.01, -0.03, 0.02, -0.94, 0.83], xy: [1.607, -1.07] },
  { word: 'train', cluster: 3, vec: [-0.04, 0.06, 0.05, 1.96, 0.32, -0.02, -0.14, 0.05, 0.03, -0.01, 0.05, 0.02, 0.02, -0.12, -1.21, 0.53], xy: [1.208, -1.878] },
  { word: 'bus', cluster: 3, vec: [-0.06, 0.05, 0.05, 1.9, 0.38, 0.02, 0.05, -0.01, 0.01, -0.07, 0.02, -0.02, 0.02, 0.02, 0.89, 0.92], xy: [3.826, -1.11] },
  { word: 'taxi', cluster: 3, vec: [0.03, -0.02, -0.04, 1.96, 0.44, -0.01, 0.05, 0.02, -0.03, -0.04, 0.01, 0.01, 0.03, -0.06, 0.97, -0.6], xy: [3.86, -2.648] },
  { word: 'car', cluster: 3, vec: [-0.04, 0.04, -0.03, 1.94, 0.33, 0.01, 0.08, 0.02, 0.02, 0.02, -0.04, 0.03, -0.01, -0.04, 0.8, -1.11], xy: [3.942, -3.154] },
]

export const cosine = (a: number[], b: number[]) => {
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return na > 0 && nb > 0 ? dot / Math.sqrt(na * nb) : 0
}

export const byWord = (w: string) => WORDS.find((x) => x.word === w)!

/** Words ranked by cosine similarity to v, best first, skipping `exclude`. */
export function nearest(v: number[], exclude: string[] = [], k = 3) {
  return WORDS.filter((w) => !exclude.includes(w.word))
    .map((w) => ({ word: w.word, cos: cosine(v, w.vec) }))
    .sort((a, b) => b.cos - a.cos)
    .slice(0, k)
}
