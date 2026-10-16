import type { ProgressState } from '../progress'

/*
  How the account copy of progress is stored (progress/{uid}, format 2; backend/firestore.rules allows exactly this):
  JSON text split into parts (lessons, checkpoints, exams, and the answers spread over a0 to a7), plus the format
  version `v`, the revision `rev` and the server's `updatedAt`.
  Split so that the save sent while a page closes can carry just the parts that changed: browsers cap such requests
  at 64 KB, and a student who has answered most of the question bank has more than that in total. (Even so, a mock
  exam touches most answer parts: then it sends the parts that fit, and the rest waits for the next visit.)
  Pure functions, no Firebase: firebase-adapter.ts uses them, and the tests check them directly.
*/

export const PROGRESS_FORMAT = 2
export const ANSWER_PARTS = 8
/** Browsers cap the requests that may outlive a page at 64 KB in all: stay a little under. */
export const EXIT_SAVE_LIMIT = 60_000

/**
 * Which answers part a question's history is kept in: a fixed spread by where the question comes from (its id up to
 * the last dot: a lesson's checkpoint, a bank topic, a past paper). So the answers of one checkpoint, one practice
 * topic or one paper are in the same part, and finishing a checkpoint changes just one of them.
 */
export function answerPart(questionId: string): number {
  const dot = questionId.lastIndexOf('.')
  const source = dot > 0 ? questionId.slice(0, dot) : questionId
  let h = 0
  for (let i = 0; i < source.length; i++) h = (h + source.charCodeAt(i)) % ANSWER_PARTS
  return h
}

/** The same object with its keys in sorted order, so the same progress always gives the same text. */
const sorted = <T,>(o: Record<string, T>): Record<string, T> => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]))

/** The stored fields for a copy of progress: field name -> JSON text. */
export function toFields(s: ProgressState): Record<string, string> {
  const parts: [string, boolean[]][][] = Array.from({ length: ANSWER_PARTS }, () => [])
  for (const k of Object.keys(s.answers).sort()) parts[answerPart(k)].push([k, s.answers[k]])
  const fields: Record<string, string> = {
    lessons: JSON.stringify(sorted(s.lessons)),
    checkpoints: JSON.stringify(sorted(s.checkpoints)),
    exams: JSON.stringify(s.exams),
  }
  parts.forEach((p, i) => (fields[`a${i}`] = JSON.stringify(Object.fromEntries(p))))
  return fields
}

function parseJSON(text: unknown): unknown {
  if (typeof text !== 'string') return undefined
  try {
    return JSON.parse(text)
  } catch {
    return undefined // a damaged part reads as empty rather than failing
  }
}

/**
 * Progress (untrusted: normalise it before use) from a stored document's fields. Missing parts are empty. Format 1
 * kept it all in one `data` text.
 */
export function fromFields(get: (field: string) => unknown): unknown {
  if (get('v') !== PROGRESS_FORMAT && typeof get('data') === 'string') return parseJSON(get('data')) ?? {}
  const answers: Record<string, unknown> = {}
  for (let i = 0; i < ANSWER_PARTS; i++) {
    const part = parseJSON(get(`a${i}`))
    if (typeof part !== 'object' || part === null || Array.isArray(part)) continue
    for (const [k, v] of Object.entries(part)) if (k !== '__proto__') answers[k] = v
  }
  return { lessons: parseJSON(get('lessons')), checkpoints: parseJSON(get('checkpoints')), exams: parseJSON(get('exams')), answers }
}

/**
 * A Firestore REST commit that saves `state` as revision `rev` of the document `docName`, sending only the fields that
 * differ from `base` (the copy at `rev - 1`; the rules refuse it on any other): its body, and the copy the document then
 * holds. When the changed fields together are more than `limit` bytes, it sends as many as fit: the mock-exam records
 * first, then lessons, checkpoints and the smallest answer parts. Null when nothing differs, or nothing fits.
 */
export function exitCommit(
  docName: string,
  state: ProgressState,
  rev: number,
  base: ProgressState,
  limit = EXIT_SAVE_LIMIT,
): { body: string; saved: ProgressState } | null {
  const next = toFields(state)
  const prev = toFields(base)
  const rank = (k: string) => ['exams', 'lessons', 'checkpoints'].indexOf(k) >>> 0 // (answer parts last)
  const changed = Object.keys(next)
    .filter((k) => next[k] !== prev[k])
    .sort((a, b) => rank(a) - rank(b) || next[a].length - next[b].length)
  const body = (send: string[]) => {
    const fields: Record<string, unknown> = { v: { integerValue: String(PROGRESS_FORMAT) }, rev: { integerValue: String(rev) } }
    for (const k of send) fields[k] = { stringValue: next[k] }
    return JSON.stringify({
      writes: [
        {
          update: { name: docName, fields },
          // only these fields change; the rest of the document stays as it is
          updateMask: { fieldPaths: [...send, 'v', 'rev'] },
          // the server's time, so the rules' updatedAt == request.time still holds
          updateTransforms: [{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }],
        },
      ],
    })
  }
  const bytes = (text: string) => new TextEncoder().encode(text).length
  const send: string[] = []
  for (const k of changed) if (bytes(body([...send, k])) <= limit) send.push(k)
  if (send.length === 0) return null
  const sends = new Set(send)
  const answers: Record<string, boolean[]> = {}
  for (const [k, v] of Object.entries(base.answers)) if (!sends.has(`a${answerPart(k)}`)) answers[k] = v
  for (const [k, v] of Object.entries(state.answers)) if (sends.has(`a${answerPart(k)}`)) answers[k] = v
  const saved: ProgressState = {
    lessons: sends.has('lessons') ? state.lessons : base.lessons,
    checkpoints: sends.has('checkpoints') ? state.checkpoints : base.checkpoints,
    exams: sends.has('exams') ? state.exams : base.exams,
    answers,
  }
  return { body: body(send), saved }
}
