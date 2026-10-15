/*
  Fixed-size chunking with overlap, and keyword retrieval, for the ChunkSizer visual.

  Chunk i covers words [i·stride, i·stride + size), with stride = size − overlap, until a chunk
  reaches the end of the document. Chunks are scored by cosine similarity of word counts (after
  dropping common words and a crude plural/-ed trim), the method built in the next lesson.
*/

export const SENTENCES = [
  'Welcome to the AI Club coding camp.',
  'Over three days you will build a small chatbot in teams of three.',
  'Each team chooses one project idea on the first morning.',
  'Mentors from local universities visit on day two to give feedback.',
  'Lunch is provided every day, and vegetarian meals are available on request.',
  'Please bring your laptop, charger and water bottle.',
  'Final projects must be submitted on the camp website by 5 pm on 11 March.',
  'Late projects lose 10% of their marks for each day they are late, and projects more than three days late get zero.',
  'Teams present their projects to the judges on the last afternoon.',
  'Prizes go to the three best projects, and every member of the winning team gets a certificate.',
  'Remember to fill in the feedback form before you leave.',
  'If you feel unwell during camp, tell a teacher immediately.',
]

/** sentences that together answer the question (the deadline and the late penalty) */
export const ANSWER_SENTENCES = [6, 7]

export const QUESTION = 'What happens if our project is submitted late?'

export const WORDS: { w: string; sent: number; ans: boolean }[] = SENTENCES.flatMap((t, si) => t.split(' ').map((w) => ({ w, sent: si, ans: ANSWER_SENTENCES.includes(si) })))

export const N_WORDS = WORDS.length
export const N_ANSWER = WORDS.filter((x) => x.ans).length

const STOP = new Set(
  'a an the and or of to in on at by for from with is are be been was were it its this that these those you your our we they their them i my me if what which who whom when where how do does did can will would should could has have had not no but so as than then there here each every one'.split(' '),
)

const stem = (w: string) => {
  for (const suf of ['ing', 'ed', 'es', 's']) if (w.endsWith(suf) && w.length - suf.length >= 3) return w.slice(0, -suf.length)
  return w
}

export const terms = (t: string) => (t.toLowerCase().match(/[a-z0-9%]+/g) ?? []).filter((x) => !STOP.has(x)).map(stem)

function cosine(a: string[], b: string[]) {
  const ca = new Map<string, number>()
  const cb = new Map<string, number>()
  a.forEach((x) => ca.set(x, (ca.get(x) ?? 0) + 1))
  b.forEach((x) => cb.set(x, (cb.get(x) ?? 0) + 1))
  let d = 0
  ca.forEach((v, x) => (d += v * (cb.get(x) ?? 0)))
  const na = Math.hypot(...ca.values())
  const nb = Math.hypot(...cb.values())
  return na && nb ? d / (na * nb) : 0
}

export interface ChunkSpan {
  idx: number
  start: number
  end: number
  score: number
}

export function makeChunks(size: number, overlap: number): ChunkSpan[] {
  const stride = Math.max(1, size - overlap)
  const out: ChunkSpan[] = []
  const q = terms(QUESTION)
  for (let st = 0; ; st += stride) {
    const end = Math.min(N_WORDS, st + size)
    const text = WORDS.slice(st, end).map((x) => x.w).join(' ')
    out.push({ idx: out.length, start: st, end, score: cosine(q, terms(text)) })
    if (st + size >= N_WORDS) break
  }
  return out
}

export function retrieveChunks(size: number, overlap: number, k: number) {
  const chunks = makeChunks(size, overlap)
  const top = [...chunks].sort((a, b) => b.score - a.score || a.idx - b.idx).slice(0, k)
  const covered = new Set<number>()
  top.forEach((c) => {
    for (let j = c.start; j < c.end; j++) covered.add(j)
  })
  const answerCovered = WORDS.filter((x, j) => x.ans && covered.has(j)).length
  const retrievedWords = top.reduce((s, c) => s + (c.end - c.start), 0)
  const relevantRetrieved = top.reduce((s, c) => s + WORDS.slice(c.start, c.end).filter((x) => x.ans).length, 0)
  return {
    chunks,
    top,
    coverage: answerCovered / N_ANSWER,
    retrievedWords,
    relevantShare: retrievedWords ? relevantRetrieved / retrievedWords : 0,
  }
}
