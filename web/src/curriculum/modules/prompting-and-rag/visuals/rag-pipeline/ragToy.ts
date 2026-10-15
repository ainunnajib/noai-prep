/*
  A toy RAG system for the RAGPipeline visual. Everything here is deterministic and small enough to
  check by hand.

  Embedding model (a stand-in for a real one): 11 hand-made "meaning" dimensions. Each word in the
  lexicon adds weight to one or more dimensions (so "cost", "price" and "pay" all push the same
  dimension, like synonyms in a learned embedding). Each dimension saturates with 1 − e^(−x), and the
  vector is scaled to length 1. Chunks and questions go through the SAME function, as they must in
  real RAG.

  Retrieval: cosine similarity (a plain dot product, because every vector has length 1), then top-k.
*/

export const DIMS = ['when', 'where', 'cost', 'exam', 'format', 'rules', 'device', 'camp', 'club', 'borrow', 'wifi'] as const

const LEX_SRC: Record<(typeof DIMS)[number], string> = {
  when: 'when date day time schedule start begin wednesday saturday january february march pm am week 2027 deadline until held:0.5 days:0.5 long:0.5',
  where: 'where venue place location room lab hall held:0.5 school:0.5 centre space',
  cost: 'cost price fee pay much dollar $ cents fine money cheap expensive covering',
  exam: 'exam mock test prelim:0.5 score marks paper:0.5 quiz',
  format: 'format question multiple-choice mcq minutes prelim:0.5 many calculator:1 paper:0.5 long:0.5',
  rules: 'allow can:0.6 may must rule bring permit banned keep stay use:0.4 need anything:0.5',
  device: 'calculator:0.6 phone laptop computer device pencil:0.5 eraser:0.5',
  camp: 'camp coding t-shirt meals',
  club: 'club member meet cca squad join training',
  borrow: 'borrow return loan lend late overdue library',
  wifi: 'wifi wi-fi internet password network online login',
}

const LEX: Map<string, [number, number][]> = (() => {
  const m = new Map<string, [number, number][]>()
  DIMS.forEach((d, di) => {
    for (const item of LEX_SRC[d].split(/\s+/)) {
      const [w, wt] = item.includes(':') ? [item.split(':')[0], Number(item.split(':')[1])] : [item, 1]
      if (!m.has(w)) m.set(w, [])
      m.get(w)!.push([di, wt])
    }
  })
  return m
})()

export const tokens = (t: string) => t.toLowerCase().match(/\$|[a-z0-9]+(?:-[a-z0-9]+)*/g) ?? []

/** Lexicon keys a text switches on (a key matches a word exactly, or as a prefix if it has 4+ letters). */
export function matchedKeys(t: string): string[] {
  const keys = new Set<string>()
  for (const tok of tokens(t)) {
    for (const k of LEX.keys()) {
      if (k === '$' ? tok === '$' : tok === k || (k.length >= 4 && tok.startsWith(k))) keys.add(k)
    }
  }
  return [...keys]
}

export function embed(t: string): number[] {
  const raw = DIMS.map(() => 0)
  for (const k of matchedKeys(t)) for (const [di, wt] of LEX.get(k)!) raw[di] += wt
  const v = raw.map((x) => 1 - Math.exp(-x))
  const n = Math.hypot(...v)
  return n > 0 ? v.map((x) => x / n) : v
}

export const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0)

export interface Chunk {
  id: number
  text: string
}

export const CHUNKS: Chunk[] = [
  { id: 1, text: 'AI Club meets every Wednesday from 3.30 pm to 5.30 pm in Computer Lab 2.' },
  { id: 2, text: 'Our mock exam is on Saturday 23 January 2027, from 9 am to 10.30 am, in the school hall.' },
  { id: 3, text: 'The mock exam copies the Prelim format: 150 multiple-choice questions in 90 minutes, and no calculator is allowed.' },
  { id: 4, text: 'Phones must stay in your bag during the mock exam. Bring two pencils and an eraser.' },
  { id: 5, text: 'Members may borrow a club laptop for up to 7 days. Late returns are fined 50 cents a day.' },
  { id: 6, text: 'The coding camp costs $40 per student, covering meals and a camp T-shirt. Pay Ms Tan by 15 February.' },
  { id: 7, text: "The coding camp runs from 9 to 11 March 2027 in the school's maker space." },
  { id: 8, text: 'Members who score at least 100 out of 150 in the mock exam join the Final training squad.' },
]

export const CHUNK_VECS = CHUNKS.map((c) => embed(c.text))

export interface Fact {
  chunk: number
  text: string
  missing: string
}

export interface Preset {
  id: string
  label: string
  q: string
  facts: Fact[]
  noRag: { text: string; verdict: string; bad: boolean }
}

export const PRESETS: Preset[] = [
  {
    id: 'mock',
    label: 'Mock exam date',
    q: 'When is the mock exam?',
    facts: [{ chunk: 2, text: 'The mock exam is on Saturday 23 January 2027, from 9 am to 10.30 am, in the school hall', missing: 'The context does not give the date of the mock exam' }],
    noRag: { text: 'The mock exam is usually held in early February, a couple of weeks before the Prelim.', verdict: 'made up: the model never saw your club handbook', bad: true },
  },
  {
    id: 'camp',
    label: 'Camp cost and place',
    q: 'How much is the coding camp, and where is it held?',
    facts: [
      { chunk: 6, text: 'It costs $40 per student, which covers meals and a camp T-shirt', missing: 'The context does not say how much it costs' },
      { chunk: 7, text: "It is held in the school's maker space, from 9 to 11 March 2027", missing: 'The context does not say where it is held' },
    ],
    noRag: { text: 'Coding camps like this usually cost about $150 and are held on a university campus.', verdict: 'made up: a confident guess', bad: true },
  },
  {
    id: 'calc',
    label: 'Calculator?',
    q: 'Can I use a calculator in the mock exam?',
    facts: [{ chunk: 3, text: 'No. The mock exam copies the Prelim format, and no calculator is allowed', missing: 'The context does not mention calculators' }],
    noRag: { text: 'Yes, a basic scientific calculator is normally allowed in exams like this.', verdict: 'wrong: the handbook says no calculator', bad: true },
  },
  {
    id: 'laptop',
    label: 'Late laptop',
    q: 'What happens if I return a club laptop late?',
    facts: [{ chunk: 5, text: 'You are fined 50 cents for each day it is late (you may borrow it for up to 7 days)', missing: 'The context does not mention late returns' }],
    noRag: { text: 'Usually nothing: most clubs just send you a reminder.', verdict: 'made up: plausible, but not from any source', bad: true },
  },
  {
    id: 'wifi',
    label: 'Wifi password',
    q: 'What is the school wifi password?',
    facts: [],
    noRag: { text: "I don't know your school's wifi password. Please ask your school's IT staff.", verdict: 'honest: it admits it does not know', bad: false },
  },
]

export interface Scored {
  chunk: Chunk
  vec: number[]
  score: number
}

/** All chunks, scored by cosine similarity with the question and sorted best first. */
export function search(q: string): { qvec: number[]; ranked: Scored[] } {
  const qvec = embed(q)
  const ranked = CHUNKS.map((c, i) => ({ chunk: c, vec: CHUNK_VECS[i], score: dot(qvec, CHUNK_VECS[i]) })).sort((a, b) => b.score - a.score || a.chunk.id - b.chunk.id)
  return { qvec, ranked }
}

export interface Answer {
  parts: { text: string; cite?: number; missing?: boolean }[]
  /** how many of the chunks the answer needs were retrieved (presets only) */
  needed?: [number, number]
  note?: string
}

const sentences = (t: string) => t.match(/[^.!?]+(?:\.\d+[^.!?]*)*[.!?]/g)?.map((x) => x.trim()) ?? [t]

/** The "LLM" of this demo, reading only the retrieved chunks. */
export function generate(q: string, preset: Preset | undefined, topk: Scored[]): Answer {
  const ids = topk.map((s) => s.chunk.id)
  if (preset) {
    if (preset.facts.length === 0)
      return { parts: [{ text: "The context doesn't mention a wifi password, so I can't answer from the handbook. Please ask your teacher." }], needed: [0, 0] }
    const parts = preset.facts.map((f) => (ids.includes(f.chunk) ? { text: f.text + '.', cite: f.chunk } : { text: f.missing + '.', missing: true }))
    const found = preset.facts.filter((f) => ids.includes(f.chunk)).length
    return { parts, needed: [found, preset.facts.length] }
  }
  // Custom question: quote the retrieved sentence that matches the question best.
  const qv = embed(q)
  let best = { s: '', id: 0, score: 0 }
  for (const sc of topk)
    for (const s of sentences(sc.chunk.text)) {
      const v = dot(qv, embed(s))
      if (v > best.score) best = { s, id: sc.chunk.id, score: v }
    }
  if (best.score < 0.5) return { parts: [{ text: "I can't find the answer in the retrieved handbook text." }], note: 'no retrieved sentence matched well' }
  return { parts: [{ text: `The handbook says: “${best.s}”`, cite: best.id }], note: 'this stand-in for an LLM quotes the best-matching sentence' }
}

export const INSTRUCTIONS = [
  'Answer the question using ONLY the context below.',
  'Cite the chunk number for each fact, like [2].',
  "If the answer is not in the context, say you don't know.",
]

export const wordCount = (t: string) => t.split(/\s+/).filter(Boolean).length
