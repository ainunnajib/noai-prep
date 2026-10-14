import { VOCAB, STOP, IDF, COUNT_W, COUNT_B, TFIDF_W, TFIDF_B, EMB, EMB_W, EMB_B } from './toyData'

/*
  The three toy sentiment classifiers used in this lesson. Every function mirrors what
  scikit-learn did when the models were trained (see toyData.ts), so the numbers on screen
  are the model's real outputs.
*/

export const VOCAB_INDEX = new Map(VOCAB.map((w, i) => [w, i] as const))

export type TokStatus = 'known' | 'stop' | 'unknown'
export interface Tok {
  word: string
  status: TokStatus
}

/** lower-case, split into runs of letters/digits, then mark stop words and out-of-vocabulary words */
export function tokenise(text: string): Tok[] {
  const words = text.toLowerCase().match(/[a-z0-9]+/g) ?? []
  return words.map((w) => ({ word: w, status: STOP.has(w) ? 'stop' : VOCAB_INDEX.has(w) ? 'known' : 'unknown' }))
}

export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))

export interface Contribution {
  word: string
  /** how many times the word appears */
  count: number
  /** the number this word puts into the feature vector */
  value: number
  weight: number
  /** weight × value: how much this word moves the score z */
  contrib: number
}

export interface Scored {
  contribs: Contribution[]
  bias: number
  z: number
  p: number
}

/** known words in order of first appearance, with their counts */
export function knownCounts(toks: Tok[]): [string, number][] {
  const m = new Map<string, number>()
  for (const t of toks) if (t.status === 'known') m.set(t.word, (m.get(t.word) ?? 0) + 1)
  return [...m.entries()]
}

function finish(contribs: Contribution[], bias: number): Scored {
  const z = bias + contribs.reduce((s, c) => s + c.contrib, 0)
  return { contribs, bias, z, p: sigmoid(z) }
}

/** bag of words (counts) + logistic regression: one weight per vocabulary word */
export function scoreCounts(toks: Tok[]): Scored {
  return finish(
    knownCounts(toks).map(([word, count]) => {
      const weight = COUNT_W[VOCAB_INDEX.get(word)!]
      return { word, count, value: count, weight, contrib: count * weight }
    }),
    COUNT_B,
  )
}

/** TF-IDF vector over the whole vocabulary (count × idf, then scaled to length 1) */
export function tfidfVector(toks: Tok[]): number[] {
  const v = new Array<number>(VOCAB.length).fill(0)
  for (const [word, count] of knownCounts(toks)) {
    const j = VOCAB_INDEX.get(word)!
    v[j] = count * IDF[j]
  }
  const norm = Math.hypot(...v)
  return norm > 0 ? v.map((x) => x / norm) : v
}

export function scoreTfidf(toks: Tok[]): Scored & { vec: number[] } {
  const vec = tfidfVector(toks)
  const contribs = knownCounts(toks).map(([word, count]) => {
    const j = VOCAB_INDEX.get(word)!
    return { word, count, value: vec[j], weight: TFIDF_W[j], contrib: vec[j] * TFIDF_W[j] }
  })
  return { ...finish(contribs, TFIDF_B), vec }
}

/** average of the known words' 2-D embeddings ([0, 0] when no word is known) */
export function meanEmbedding(toks: Tok[]): [number, number] {
  const known = toks.filter((t) => t.status === 'known')
  if (!known.length) return [0, 0]
  let x = 0
  let y = 0
  for (const t of known) {
    x += EMB[t.word][0]
    y += EMB[t.word][1]
  }
  return [x / known.length, y / known.length]
}

/** averaged embeddings + logistic regression; each word's share of w·mean is its contribution */
export function scoreEmb(toks: Tok[]): Scored & { mean: [number, number]; n: number } {
  const n = toks.filter((t) => t.status === 'known').length
  const mean = meanEmbedding(toks)
  const contribs = knownCounts(toks).map(([word, count]) => {
    const e = EMB[word]
    const dot = EMB_W[0] * e[0] + EMB_W[1] * e[1]
    return { word, count, value: count / n, weight: dot, contrib: (count * dot) / n }
  })
  return { ...finish(contribs, EMB_B), mean, n }
}

/** "+0.81" / "−1.23" with a real minus sign */
export const signed = (v: number, d = 2) => (Math.abs(v) < 0.5 * 10 ** -d ? '' : v < 0 ? '−' : '+') + Math.abs(v).toFixed(d)
export const fixed = (v: number, d = 2) => (v < 0 && Math.abs(v) >= 0.5 * 10 ** -d ? '−' : '') + Math.abs(v).toFixed(d)
