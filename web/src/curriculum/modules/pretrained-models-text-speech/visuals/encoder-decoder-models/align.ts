/*
  Illustrative cross-attention patterns, shaped like those of a trained translation model.
  For each target (output) word we list the source words it should focus on with a score;
  every other source word gets score 0. The weights are softmax(scores) over the source words,
  so each row adds up to 1, exactly as real attention weights do.
*/

export interface AlignExample {
  label: string
  from: string
  to: string
  source: string[]
  target: string[]
  /** for each target word: [source index, score] pairs */
  focus: [number, number][][]
  note: string
}

export const EXAMPLES: AlignExample[] = [
  {
    label: 'English → Malay',
    from: 'English',
    to: 'Malay',
    source: ['I', 'like', 'to', 'eat', 'durian', '.'],
    target: ['Saya', 'suka', 'makan', 'durian', '.'],
    focus: [[[0, 4]], [[1, 4]], [[3, 3.6], [2, 1.6]], [[4, 4.4]], [[5, 4]]],
    note: 'The word order is the same in both languages, so the bright cells run down the diagonal. "makan" (eat) also glances at "to", because "to eat" becomes one Malay word.',
  },
  {
    label: 'Malay: order flips',
    from: 'English',
    to: 'Malay',
    source: ['the', 'new', 'school', 'library'],
    target: ['perpustakaan', 'sekolah', 'baharu', 'itu'],
    focus: [[[3, 4]], [[2, 4]], [[1, 4]], [[0, 3.6], [3, 1]]],
    note: 'Malay puts the noun first and the describing words after it, so "the new school library" becomes "perpustakaan sekolah baharu itu": the bright cells run along the other diagonal. Each output word still finds its source word, wherever it is.',
  },
  {
    label: 'English → Chinese',
    from: 'English',
    to: 'Chinese',
    source: ['I', 'am', 'going', 'to', 'school', 'tomorrow', '.'],
    target: ['我', '明天', '去', '学校', '。'],
    focus: [[[0, 4]], [[5, 4.2]], [[2, 3.4], [3, 1.6], [1, 1.2]], [[4, 4], [3, 1]], [[6, 4]]],
    note: 'Chinese puts the time word early ("I tomorrow go school"), so 明天 (tomorrow) reaches all the way to the end of the English sentence. 去 (go) spreads its attention over "am going to", which together mean one Chinese word.',
  },
]

export function weights(ex: AlignExample): number[][] {
  return ex.focus.map((pairs) => {
    const scores = ex.source.map((_, j) => pairs.find((p) => p[0] === j)?.[1] ?? 0)
    const m = Math.max(...scores)
    const e = scores.map((s) => Math.exp(s - m))
    const z = e.reduce((a, b) => a + b, 0)
    return e.map((v) => v / z)
  })
}
