/*
  The NOAI 2025 Final, Question 3 pipeline, in TypeScript, for the visuals of this lesson.
  It mirrors the Python taught in the lesson line for line:
    tokenise   -> re.findall(r"[a-z]+", text.lower()) minus stop words  (or plain .split())
    vocabulary -> sorted set of document tokens (the query never adds words)
    tf         -> raw counts, one row per document
    idf        -> smoothed ln((1 + N) / (1 + df)) + 1  (scikit-learn's default), plain ln(N / df), or none
    scores     -> cosine similarity between the query vector and every document vector
    top-k      -> np.argsort(-scores, kind="stable")[:k], optionally skipping zero scores
  Every number was checked against Python (numpy) in scratch/rag_numbers.py.
*/

export const DOCUMENTS = [
  'Artificial intelligence is transforming industries.',
  'Machine learning is a subset of artificial intelligence.',
  'Deep learning allows machines to solve complex problems.',
  'Data science involves statistics and machine learning.',
  'Neural networks are inspired by the human brain.',
]

export const QUERY = 'How does machine learning work?'

/** The sample answer printed under "Expected output" in the 2025 notebook. */
export const EXPECTED_RESPONSE =
  'Machine learning is a subset of artificial intelligence that enables systems to learn from data. It involves techniques like statistics and algorithms, often used in data science.'

/** Indices (0-based) of the documents the notebook expects: documents 2 and 4. */
export const EXPECTED_TOP = [1, 3]

export const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'of', 'and', 'to', 'by', 'how', 'does', 'do', 'what', 'why', 'in', 'on', 'for', 'it', 'this', 'that', 'with', 'as',
])

export interface TokOpts {
  /** keep letters only (re.findall(r"[a-z]+")) instead of splitting on spaces */
  strip: boolean
  /** drop stop words */
  stop: boolean
}

export const CLEAN: TokOpts = { strip: true, stop: true }
export const OFFICIAL: TokOpts = { strip: false, stop: false }

/** Raw pieces before stop-word removal. */
export function rawTokens(text: string, strip: boolean): string[] {
  const low = text.toLowerCase()
  return strip ? low.match(/[a-z]+/g) ?? [] : low.split(/\s+/).filter(Boolean)
}

export function tokenise(text: string, o: TokOpts = CLEAN): string[] {
  return rawTokens(text, o.strip).filter((w) => !(o.stop && STOP_WORDS.has(w)))
}

/** Each raw piece with a flag saying whether it is dropped as a stop word (for drawing chips). */
export function tokenChips(text: string, o: TokOpts = CLEAN): { w: string; dropped: boolean }[] {
  return rawTokens(text, o.strip).map((w) => ({ w, dropped: o.stop && STOP_WORDS.has(w) }))
}

export type IdfVariant = 'smooth' | 'plain' | 'none'

export function idfValue(N: number, df: number, v: IdfVariant): number {
  if (v === 'none') return 1
  if (v === 'plain') return df > 0 ? Math.log(N / df) : 0
  return Math.log((1 + N) / (1 + df)) + 1
}

export interface Index {
  docTokens: string[][]
  vocab: string[]
  pos: Map<string, number>
  tf: number[][]
  df: number[]
  idf: number[]
  /** tf × idf, one row per document */
  W: number[][]
}

export function buildIndex(docs: string[], o: TokOpts = CLEAN, v: IdfVariant = 'smooth'): Index {
  const docTokens = docs.map((d) => tokenise(d, o))
  const vocab = [...new Set(docTokens.flat())].sort()
  const pos = new Map(vocab.map((w, i) => [w, i]))
  const tf = docTokens.map((toks) => {
    const row = new Array(vocab.length).fill(0)
    for (const w of toks) row[pos.get(w)!] += 1
    return row
  })
  const N = docs.length
  const df = vocab.map((_, j) => tf.filter((row) => row[j] > 0).length)
  const idf = df.map((d) => idfValue(N, d, v))
  const W = tf.map((row) => row.map((c, j) => c * idf[j]))
  return { docTokens, vocab, pos, tf, df, idf, W }
}

/** Query vector in the documents' space: words outside the vocabulary are ignored. */
export function vectorise(text: string, ix: Index, o: TokOpts = CLEAN): { counts: number[]; vec: number[]; known: string[]; unknown: string[] } {
  const counts = new Array(ix.vocab.length).fill(0)
  const known: string[] = []
  const unknown: string[] = []
  for (const w of tokenise(text, o)) {
    const j = ix.pos.get(w)
    if (j === undefined) unknown.push(w)
    else {
      counts[j] += 1
      known.push(w)
    }
  }
  return { counts, vec: counts.map((c, j) => c * ix.idf[j]), known, unknown }
}

export const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0)
export const norm = (a: number[]) => Math.sqrt(dot(a, a))

export function cosine(a: number[], b: number[]): number {
  const n = norm(a) * norm(b)
  return n === 0 ? 0 : dot(a, b) / n
}

/** Stable descending order of the scores (ties keep document order), like np.argsort(-s, kind="stable"). */
export function ranking(scores: number[]): number[] {
  return scores.map((_, i) => i).sort((i, j) => scores[j] - scores[i])
}

export function topK(scores: number[], k: number, skipZero: boolean): number[] {
  return ranking(scores)
    .slice(0, k)
    .filter((i) => !skipZero || scores[i] > 1e-12)
}

export interface Retrieval {
  ix: Index
  q: ReturnType<typeof vectorise>
  scores: number[]
}

export function retrieve(query: string, o: TokOpts = CLEAN, v: IdfVariant = 'smooth', docs = DOCUMENTS): Retrieval {
  const ix = buildIndex(docs, o, v)
  const q = vectorise(query, ix, o)
  const scores = ix.W.map((row) => cosine(row, q.vec))
  return { ix, q, scores }
}

/** Our generator: an extractive template that only repeats retrieved text. */
export function generateTemplate(top: string[]): string {
  if (!top.length) return "I don't know based on the given documents."
  return 'According to the documents: ' + top.join(' ')
}

/** The official 2025 solution's generator: a keyword rule that returns the sample sentence. */
export function generateOfficial(top: string[]): string {
  const words = new Set(top.join(' ').toLowerCase().split(/\s+/))
  if (words.has('machine') && words.has('science')) return EXPECTED_RESPONSE
  return "I don't know."
}

export const fmt = (x: number, d = 2) => (Math.abs(x) < 5e-13 ? '0' : Math.abs(x - Math.round(x)) < 1e-9 ? String(Math.round(x)) : x.toFixed(d))
