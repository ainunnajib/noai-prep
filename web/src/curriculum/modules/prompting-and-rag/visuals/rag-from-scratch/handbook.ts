/*
  The tiny "school handbook" corpus used throughout the lesson, and a TypeScript copy of the
  NumPy retriever taught in the lesson (same tokeniser, same stop words, same formulas), so the
  numbers in the visuals match the Python output exactly.

  Verified with Python (numpy): for "Is the library open on Friday?"
    vocab = [canteen, closed, exam, friday, hall, library, monday, open, week]
    D @ q = [3, 2, 3, 0], ||d||^2 = [3, 5, 10, 3], ||q||^2 = 3
    scores = [1.000, 0.516, 0.548, 0.000]  ->  top-2 = [0, 2]
*/

export const HANDBOOK: string[] = [
  'The library is open on Friday.',
  'The canteen is open on Monday and closed on Friday.',
  'Exam week: the library is open on Friday, and the exam hall is closed.',
  'The hall is closed on Monday.',
]

export const PRESET_QUERIES: string[] = ['Is the library open on Friday?', 'Is the canteen open on Monday?', 'When is the exam hall closed?']

/** Same list as the lesson's Python STOP set. */
export const STOP = new Set(['a', 'an', 'the', 'is', 'are', 'on', 'in', 'at', 'of', 'and', 'to', 'for', 'it', 'when', 'where', 'what', 'how', 'does', 'do'])

/** lower-case, keep letters only, drop stop words: re.findall(r"[a-z]+", text.lower()) */
export function tokenise(text: string): string[] {
  return (text.toLowerCase().match(/[a-z]+/g) ?? []).filter((w) => !STOP.has(w))
}

export interface Fitted {
  docs: string[]
  vocab: string[]
  index: Map<string, number>
  /** document-term counts, one row per document */
  D: number[][]
  /** idf = ln(N / df) */
  idf: number[]
  df: number[]
}

export function fit(docs: string[]): Fitted {
  const tokens = docs.map(tokenise)
  // Python's sorted() on lower-case ASCII words = JS default sort
  const vocab = [...new Set(tokens.flat())].sort()
  const index = new Map(vocab.map((w, j) => [w, j]))
  const D = tokens.map((t) => {
    const v = new Array(vocab.length).fill(0) as number[]
    for (const w of t) v[index.get(w)!] += 1
    return v
  })
  const df = vocab.map((_, j) => D.filter((r) => r[j] > 0).length)
  const idf = df.map((d) => Math.log(docs.length / d))
  return { docs, vocab, index, D, idf, df }
}

export function vectorise(f: Fitted, text: string): number[] {
  const v = new Array(f.vocab.length).fill(0) as number[]
  for (const w of tokenise(text)) {
    const j = f.index.get(w)
    if (j !== undefined) v[j] += 1
  }
  return v
}

export const norm = (v: number[]) => Math.sqrt(v.reduce((a, x) => a + x * x, 0))
export const dot = (a: number[], b: number[]) => a.reduce((s, x, j) => s + x * b[j], 0)

export interface Scored {
  /** weighted document rows (counts, or counts x idf) */
  W: number[][]
  q: number[]
  dots: number[]
  norms: number[]
  qNorm: number
  scores: number[]
  /** np.argsort(-scores, kind="stable") */
  order: number[]
}

export function score(f: Fitted, query: string, weighting: 'count' | 'tfidf' = 'count'): Scored {
  const w = (v: number[]) => (weighting === 'tfidf' ? v.map((c, j) => c * f.idf[j]) : v)
  const W = f.D.map(w)
  const q = w(vectorise(f, query))
  const dots = W.map((r) => dot(r, q))
  const norms = W.map(norm)
  const qNorm = norm(q)
  const scores = dots.map((d, i) => d / (norms[i] * qNorm + 1e-10))
  const order = stableArgsortDesc(scores)
  return { W, q, dots, norms, qNorm, scores, order }
}

/** np.argsort(-s, kind="stable"): largest first, ties keep the lower index first, NaN last. */
export function stableArgsortDesc(s: number[]): number[] {
  const key = (v: number) => (Number.isNaN(v) ? Infinity : -v)
  return s.map((_, i) => i).sort((a, b) => key(s[a]) - key(s[b]) || a - b)
}

/** np.argsort(s, kind="stable"): smallest first, ties keep the lower index first, NaN last. */
export function stableArgsortAsc(s: number[]): number[] {
  const key = (v: number) => (Number.isNaN(v) ? Infinity : v)
  return s.map((_, i) => i).sort((a, b) => {
    const d = key(s[a]) - key(s[b])
    return (Number.isNaN(d) ? 0 : d) || a - b
  })
}
