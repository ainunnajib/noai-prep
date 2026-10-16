/*
  A tiny, honest byte-pair-encoding (BPE) implementation shared by the tokenisation visuals.

  Training (Sennrich et al. 2016, as taught in the Hugging Face course):
    1. split every training word into characters;
    2. count every adjacent pair of symbols, weighted by how often the word occurs;
    3. merge the most frequent pair everywhere and record the merge rule;
    4. repeat.
  Ties are broken by first appearance (words in corpus order, pairs left to right).
  Encoding a new word applies the learned merge rules in the order they were learned.
*/

export type Pair = [string, string]
export interface Merge {
  pair: Pair
  count: number
}

/** Lower-case, then cut into runs of letters/digits and single other symbols (punctuation, emoji). */
export function pretokenise(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9]+|[^\sa-z0-9]/gu) ?? []
}

export const isWord = (t: string) => /^[a-z0-9]+$/.test(t)

/** Base (character) vocabulary: letters, digits and common punctuation. Anything else is unknown. */
export const BASE_CHARS = [...'abcdefghijklmnopqrstuvwxyz0123456789', ...'.,!?\'-:;"()']
const BASE_SET = new Set(BASE_CHARS)
export const inBase = (c: string) => BASE_SET.has(c)

/** Word frequencies in order of first appearance. */
export function wordFreq(words: string[]): [string, number][] {
  const m = new Map<string, number>()
  for (const w of words) if (isWord(w)) m.set(w, (m.get(w) ?? 0) + 1)
  return [...m.entries()]
}

export function mergeOnce(symbols: string[], [a, b]: Pair): string[] {
  const out: string[] = []
  let i = 0
  while (i < symbols.length) {
    if (i < symbols.length - 1 && symbols[i] === a && symbols[i + 1] === b) {
      out.push(a + b)
      i += 2
    } else {
      out.push(symbols[i])
      i += 1
    }
  }
  return out
}

/** One word's share of a pair count: the word, how often it occurs in the corpus, and how often the pair occurs inside it. */
export type PairSource = { word: string; freq: number; times: number }

/** Count adjacent pairs across the corpus. Returned in order of first appearance. */
export function pairCounts(freq: [string, number][], splits: string[][]): { pair: Pair; count: number; words: PairSource[] }[] {
  const map = new Map<string, { pair: Pair; count: number; words: PairSource[] }>()
  freq.forEach(([w, f], wi) => {
    const s = splits[wi]
    for (let i = 0; i < s.length - 1; i++) {
      const key = s[i] + '\u0000' + s[i + 1]
      let e = map.get(key)
      if (!e) {
        e = { pair: [s[i], s[i + 1]], count: 0, words: [] }
        map.set(key, e)
      }
      e.count += f
      // a pair that occurs twice in one word ("banana": a + n) counts that word twice
      const last = e.words[e.words.length - 1]
      if (last && last.word === w) last.times += 1
      else e.words.push({ word: w, freq: f, times: 1 })
    }
  })
  return [...map.values()]
}

/** Learn up to `maxMerges` merge rules. */
export function trainBPE(freq: [string, number][], maxMerges: number): Merge[] {
  let splits = freq.map(([w]) => [...w])
  const merges: Merge[] = []
  while (merges.length < maxMerges) {
    const counts = pairCounts(freq, splits)
    if (!counts.length) break
    let best = counts[0]
    for (const c of counts) if (c.count > best.count) best = c
    merges.push({ pair: best.pair, count: best.count })
    splits = splits.map((s) => mergeOnce(s, best.pair))
  }
  return merges
}

/** Tokenise one word with the first k merge rules. */
export function encodeWord(word: string, merges: Merge[], k: number): string[] {
  let s = [...word]
  for (let r = 0; r < Math.min(k, merges.length); r++) {
    const [a, b] = merges[r].pair
    if (s.length < 2) break
    // quick skip: only merge if both symbols are present
    if (!s.includes(a) || !s.includes(b)) continue
    s = mergeOnce(s, merges[r].pair)
  }
  return s
}
