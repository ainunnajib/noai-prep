import { empty, normalize, toJSON, type SyncState } from '../progress-crdt'
import { revFrom } from './adapter'

/*
  How the account copy of progress is stored (progress/{uid}, format 3; backend/firestore.rules allows exactly this):
  the SyncState's resetAt as a number, and its parts as JSON text (lessons, checkpoints, exams, and the answers spread
  over a0 to a7), plus the format version `v`, the revision `rev` and the server's `updatedAt`.
  Split so that the save sent while a page closes can carry just the parts that changed: browsers cap such requests
  at 64 KB, and a student who has answered most of the question bank has more than that in total.
  Pure functions, no Firebase: firebase-adapter.ts uses them, and the tests check them directly.
*/

export const PROGRESS_FORMAT = 3
export const ANSWER_PARTS = 8
/** Browsers cap the requests that may outlive a page at 64 KB in all: stay a little under. */
export const EXIT_SAVE_LIMIT = 60_000

/**
 * Which answers part a question's attempts are kept in: a fixed spread by where the question comes from (its id up
 * to the last dot: a lesson's checkpoint, a bank topic, a past paper, a past paper's questions 50 at a time). So the
 * answers of one checkpoint, one practice topic or one block of a paper are in the same part, and finishing a
 * checkpoint changes just one of them.
 */
export function answerPart(questionId: string): number {
  const dot = questionId.lastIndexOf('.')
  let source = dot > 0 ? questionId.slice(0, dot) : questionId
  // a past paper's questions ("prelim2026.1" to ".300") go 50 at a time, so a long paper is spread over several parts
  const n = Number(questionId.slice(dot + 1))
  if (dot > 0 && !source.includes('.') && Number.isInteger(n) && n > 0) source += `.${Math.ceil(n / 50)}`
  let h = 0
  for (let i = 0; i < source.length; i++) h = (h + source.charCodeAt(i)) % ANSWER_PARTS
  return h
}

/** The text parts of a state: field name -> JSON text (the same state always gives the same text). */
export function toParts(s: SyncState): Record<string, string> {
  const j = toJSON(s)
  const parts: Record<string, SyncState['answers']> = {}
  for (let i = 0; i < ANSWER_PARTS; i++) parts[`a${i}`] = {}
  for (const [k, v] of Object.entries(j.answers)) parts[`a${answerPart(k)}`][k] = v
  const fields: Record<string, string> = {
    lessons: JSON.stringify(j.lessons),
    checkpoints: JSON.stringify(j.checkpoints),
    exams: JSON.stringify(j.exams),
  }
  for (const [k, p] of Object.entries(parts)) fields[k] = JSON.stringify(p)
  return fields
}

/** The whole document for saving `s` as revision `rev` (the caller adds the server's `updatedAt`). */
export const toDoc = (s: SyncState, rev: number) => ({ v: PROGRESS_FORMAT, rev, resetAt: s.resetAt, ...toParts(s) })

function parseJSON(text: unknown): unknown {
  if (typeof text !== 'string') return undefined
  try {
    return JSON.parse(text)
  } catch {
    return undefined // a damaged part reads as empty rather than failing
  }
}

/**
 * The state and revision a stored document holds (its fields read with `get`), checked like any untrusted copy.
 * A document in another format reads as empty: the next save replaces it.
 */
export function fromDoc(get: (field: string) => unknown): { state: SyncState; rev: number } {
  const rev = revFrom(get('rev'))
  if (get('v') !== PROGRESS_FORMAT) return { state: empty(), rev }
  const answers: Record<string, unknown> = {}
  for (let i = 0; i < ANSWER_PARTS; i++) {
    const part = parseJSON(get(`a${i}`))
    if (typeof part !== 'object' || part === null || Array.isArray(part)) continue
    for (const [k, v] of Object.entries(part)) if (k !== '__proto__') answers[k] = v
  }
  const state = normalize({
    v: 3,
    resetAt: get('resetAt'),
    lessons: parseJSON(get('lessons')),
    checkpoints: parseJSON(get('checkpoints')),
    exams: parseJSON(get('exams')),
    answers,
  })
  return { state, rev }
}

/**
 * A Firestore REST commit that saves `next` as revision `rev` of the document `docName`, sending only the parts that
 * differ from `base` (the copy at `rev - 1`; the rules refuse it on any other), always with `resetAt`, `v` and `rev`,
 * and the server's time as `updatedAt`. When the changed parts together are more than `limit` bytes, it sends as many
 * as fit: the mock-exam records first, then lessons, checkpoints and the smallest answer parts. (Any such mix is a
 * copy between `base` and `next`: each part is a slice of the state, and resetAt hides what it must in every part.)
 * Null when nothing differs. `sent`: the parts it carries.
 */
export function exitCommit(docName: string, next: SyncState, rev: number, base: SyncState, limit = EXIT_SAVE_LIMIT): { body: string; sent: string[] } | null {
  const now = toParts(next)
  const before = toParts(base)
  const rank = (k: string) => ['exams', 'lessons', 'checkpoints'].indexOf(k) >>> 0 // (answer parts last)
  const changed = Object.keys(now)
    .filter((k) => now[k] !== before[k])
    .sort((a, b) => rank(a) - rank(b) || now[a].length - now[b].length)
  if (changed.length === 0 && next.resetAt === base.resetAt) return null
  const body = (send: string[]) => {
    const int = (n: number) => ({ integerValue: String(n) })
    const fields: Record<string, unknown> = { v: int(PROGRESS_FORMAT), rev: int(rev), resetAt: int(next.resetAt) }
    for (const k of send) fields[k] = { stringValue: now[k] }
    return JSON.stringify({
      writes: [
        {
          update: { name: docName, fields },
          // only these fields change; the rest of the document stays as it is
          updateMask: { fieldPaths: [...send, 'v', 'rev', 'resetAt'] },
          // the server's time, so the rules' updatedAt == request.time still holds
          updateTransforms: [{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }],
        },
      ],
    })
  }
  const bytes = (text: string) => new TextEncoder().encode(text).length
  const sent: string[] = []
  for (const k of changed) if (bytes(body([...sent, k])) <= limit) sent.push(k)
  if (sent.length === 0 && next.resetAt === base.resetAt) return null
  return { body: body(sent), sent }
}
