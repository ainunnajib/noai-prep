/*
  Toy word embeddings made for this lesson (NOT trained): 24 words, 16 numbers each.
  Dimensions 0-3 mark the topic (people, places, food & drink, transport), dimension 4 is shared by
  every word, and the remaining dimensions encode relations (gender, royalty, capital city, Singlish
  vs English drink names, ...), plus a little random noise. `xy` is a fixed linear projection of each
  vector to 2-D for drawing (linear, so analogy parallelograms stay parallelograms).
*/
export const CLUSTERS = ['people', 'places', 'food & drink', 'transport'] as const

export interface WordVec {
  word: string
  cluster: number
  vec: number[]
  xy: [number, number]
}

export const WORDS: WordVec[] = [
  { word: 'man', cluster: 0, vec: [1.02, 0, 0, 0, 0.34, -0.83, 0.03, 0, 0.04, -0.09, 0.08, 0, 0.03, -0.01, -0.02, 0.02], xy: [-4.1, 2.417] },
  { word: 'woman', cluster: 0, vec: [1.01, 0, 0, 0, 0.27, 0.82, -0.03, -0.1, -0.04, -0.02, -0.06, -0.07, 0, 0.04, -0.01, -0.04], xy: [-2.184, 2.325] },
  { word: 'king', cluster: 0, vec: [1.03, 0, 0, 0, 0.34, -0.84, 1.62, 0.01, 0.05, -0.06, -0.03, -0.04, -0.09, 0.01, 0.03, -0.04], xy: [-4.112, 3.802] },
  { word: 'queen', cluster: 0, vec: [1, 0, 0, 0, 0.28, 0.83, 1.63, -0.09, 0.02, -0.01, 0.04, -0.02, 0, 0.02, -0.04, 0.03], xy: [-2.005, 4.124] },
  { word: 'boy', cluster: 0, vec: [1.03, 0, 0, 0, 0.34, -0.77, 0.06, 1.29, -0.08, 0.04, 0.02, 0, -0.05, 0.06, -0.06, 0.03], xy: [-4.227, 1.145] },
  { word: 'girl', cluster: 0, vec: [1.01, 0, 0, 0, 0.43, 0.9, -0.09, 1.17, 0.04, 0.08, 0.02, -0.04, 0.01, 0, -0.01, -0.04], xy: [-1.85, 1.008] },
  { word: 'japan', cluster: 1, vec: [0, 0.98, 0, 0, 0.33, 0.06, -0.01, -0.07, 1.07, -0.27, 0.11, 0, -0.02, -0.07, 0.07, 0.13], xy: [4.036, 1.746] },
  { word: 'tokyo', cluster: 1, vec: [0, 1.01, 0, 0, 0.33, 0.01, 0.05, 0, 1.05, -0.32, 1.32, -0.11, -0.07, 0.04, -0.03, 0.03], xy: [3.97, 3.2] },
  { word: 'france', cluster: 1, vec: [0, 1.01, 0, 0, 0.32, -0.04, -0.02, -0.06, -1.03, -0.3, 0.01, -0.02, -0.1, 0, 0.01, 0.05], xy: [0.59, 1.591] },
  { word: 'paris', cluster: 1, vec: [0, 1, 0, 0, 0.44, 0.11, -0.04, 0.02, -0.98, -0.27, 1.33, 0.01, 0.01, -0.08, -0.01, -0.04], xy: [1.121, 2.953] },
  { word: 'korea', cluster: 1, vec: [0, 1, 0, 0, 0.37, 0, -0.02, -0.01, -0.02, 0.52, 0, 0.03, -0.07, 0.04, -0.04, -0.04], xy: [2.663, 2.226] },
  { word: 'seoul', cluster: 1, vec: [0, 1.02, 0, 0, 0.31, 0.07, 0, -0.06, 0, 0.42, 1.39, -0.08, 0.02, 0.03, -0.07, 0.02], xy: [2.882, 4.02] },
  { word: 'coffee', cluster: 2, vec: [0, 0, 0.99, 0, 0.37, -0.01, 0.03, -0.05, 0.04, -0.03, -0.05, -0.78, 0.88, 0.95, -0.03, 0.03], xy: [-3.884, -0.64] },
  { word: 'tea', cluster: 2, vec: [0, 0, 1.01, 0, 0.3, -0.03, -0.07, -0.08, -0.05, 0.04, 0.08, -0.8, -0.75, 0.89, -0.1, 0.01], xy: [-4.155, -1.695] },
  { word: 'kopi', cluster: 2, vec: [0, 0, 1.01, 0, 0.28, -0.01, -0.01, -0.02, 0.05, 0.09, -0.02, 0.83, 0.85, 0.94, 0.05, -0.02], xy: [-1.896, -0.702] },
  { word: 'teh', cluster: 2, vec: [0, 0, 0.99, 0, 0.41, 0.02, -0.03, 0.08, -0.06, 0.03, 0, 0.74, -0.74, 0.92, -0.06, 0.03], xy: [-2.247, -1.821] },
  { word: 'laksa', cluster: 2, vec: [0, 0, 0.99, 0, 0.36, 0, 0.02, -0.01, 0.06, 0.01, 0.01, 1.13, -0.05, -1.14, 0.08, 0.02], xy: [-1.466, -3.918] },
  { word: 'prata', cluster: 2, vec: [0, 0, 1.01, 0, 0.36, -0.08, 0.07, -0.03, -0.08, -0.01, -0.02, -1.09, -0.06, -1.08, 0.18, -0.06], xy: [-4.284, -3.958] },
  { word: 'satay', cluster: 2, vec: [0, 0, 0.98, 0, 0.37, 0, 0.08, -0.04, 0.01, 0.15, -0.04, -0.05, -0.9, -1.1, 0.04, 0.01], xy: [-2.848, -4.244] },
  { word: 'mrt', cluster: 3, vec: [0, 0, 0, 0.99, 0.34, -0.04, 0.03, -0.01, 0.1, 0.05, 0.04, 0.01, 0, 0.02, -0.94, 0.83], xy: [1.506, -0.99] },
  { word: 'train', cluster: 3, vec: [0, 0, 0, 1.03, 0.32, -0.03, -0.14, 0.05, 0.03, -0.01, 0.05, 0.02, 0.02, -0.12, -1.21, 0.53], xy: [1.141, -1.817] },
  { word: 'bus', cluster: 3, vec: [0, 0, 0, 1, 0.38, 0, 0.05, -0.01, 0.01, -0.07, 0.02, -0.02, 0.02, 0.02, 0.89, 0.92], xy: [3.712, -1.019] },
  { word: 'taxi', cluster: 3, vec: [0, 0, 0, 1.03, 0.44, -0.01, 0.05, 0.02, -0.03, -0.04, 0.01, 0.01, 0.03, -0.06, 0.97, -0.6], xy: [3.87, -2.714] },
  { word: 'car', cluster: 3, vec: [0, 0, 0, 1.02, 0.33, 0.02, 0.08, 0.02, 0.02, 0.02, -0.04, 0.03, -0.01, -0.04, 0.8, -1.11], xy: [3.786, -3.181] },
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
