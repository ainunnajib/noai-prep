/*
  A tiny count-based language model trained on 16 Singapore-themed sentences.
  Bigram: P(w | previous word). Trigram: P(w | previous two words). "<s>" pads the start, "." ends a sentence.
  Probabilities are exact fractions count(context, w) / count(context).
*/

export const CORPUS = [
  'i take the mrt to school .',
  'i take the bus to school .',
  'i take the mrt to work .',
  'my mum takes the bus to work .',
  'we eat chicken rice at the hawker centre .',
  'we eat laksa at the hawker centre .',
  'i eat chicken rice for lunch .',
  'my friends eat laksa for lunch .',
  'the mrt is crowded in the morning .',
  'the hawker centre is crowded at lunch .',
  'i study at the library after school .',
  'we play football after school .',
  'my mum cooks chicken curry for dinner .',
  'i take the bus to the library .',
  'the bus is late again .',
  'we eat at the hawker centre after school .',
]

export const START = '<s>'
export const END = '.'

type Counts = Map<string, Map<string, number>>

function build(order: 2 | 3): Counts {
  const m: Counts = new Map()
  for (const line of CORPUS) {
    const t = [START, START, ...line.split(' ')]
    for (let i = 2; i < t.length; i++) {
      const ctx = order === 2 ? t[i - 1] : `${t[i - 2]} ${t[i - 1]}`
      if (!m.has(ctx)) m.set(ctx, new Map())
      const row = m.get(ctx)!
      row.set(t[i], (row.get(t[i]) ?? 0) + 1)
    }
  }
  return m
}

const TABLES: Record<2 | 3, Counts> = { 2: build(2), 3: build(3) }

export interface NextDist {
  context: string
  total: number
  items: { word: string; count: number; p: number }[]
}

/** Next-token distribution after `words` (the words generated so far, without <s>). */
export function nextDist(words: string[], order: 2 | 3): NextDist {
  const t = [START, START, ...words]
  const n = t.length
  const ctx = order === 2 ? t[n - 1] : `${t[n - 2]} ${t[n - 1]}`
  const row = TABLES[order].get(ctx)
  if (!row) return { context: ctx, total: 0, items: [] }
  let total = 0
  row.forEach((c) => (total += c))
  const items = [...row.entries()].map(([word, count]) => ({ word, count, p: count / total })).sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
  return { context: ctx, total, items }
}

export interface Factor {
  word: string
  context: string
  count: number
  total: number
  p: number
}

/** The chain-rule factors P(w_t | context) for every word of the sentence. */
export function factors(words: string[], order: 2 | 3): Factor[] {
  return words.map((w, i) => {
    const d = nextDist(words.slice(0, i), order)
    const hit = d.items.find((x) => x.word === w)
    return { word: w, context: d.context, count: hit?.count ?? 0, total: d.total, p: hit ? hit.p : 0 }
  })
}
