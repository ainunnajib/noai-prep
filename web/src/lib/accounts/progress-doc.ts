import type { ProgressState } from '../progress'

/*
  How the account copy of progress is stored (progress/{uid}, format 2; backend/firestore.rules allows exactly this):
  JSON text split into parts (lessons, checkpoints, exams, and the answers spread over a0 to a7), plus the format
  version `v`, the revision `rev` and the server's `updatedAt`.
  Split so that the save sent while a page closes can carry just the parts that changed: browsers cap such requests
  at 64 KB, and a student who has answered most of the question bank has more than that in total.
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
 * The body of a Firestore REST commit that saves `state` as revision `rev` of the document `docName`, sending only the
 * fields that differ from `base` (the copy at `rev - 1`; the rules refuse it on any other). Null when nothing differs.
 */
export function exitCommitBody(docName: string, state: ProgressState, rev: number, base: ProgressState): string | null {
  const next = toFields(state)
  const prev = toFields(base)
  const changed = Object.keys(next).filter((k) => next[k] !== prev[k])
  if (changed.length === 0) return null
  const fields: Record<string, unknown> = { v: { integerValue: String(PROGRESS_FORMAT) }, rev: { integerValue: String(rev) } }
  for (const k of changed) fields[k] = { stringValue: next[k] }
  return JSON.stringify({
    writes: [
      {
        update: { name: docName, fields },
        // only these fields change; the rest of the document stays as it is
        updateMask: { fieldPaths: [...changed, 'v', 'rev'] },
        // the server's time, so the rules' updatedAt == request.time still holds
        updateTransforms: [{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }],
      },
    ],
  })
}
