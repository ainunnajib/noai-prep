import { useSyncExternalStore } from 'react'
import { readJSON, writeJSON, removeKey } from './storage'

/** Per-viewer study progress, stored in localStorage only. */
export interface ProgressState {
  /** lessonKey ("module/lesson") -> ISO date completed */
  lessons: Record<string, string>
  /** lessonKey -> best checkpoint score as fraction 0..1 */
  checkpoints: Record<string, number>
  /** question id -> history of correctness (most recent last, max 5) */
  answers: Record<string, boolean[]>
  /** completed mock exams */
  exams: ExamRecord[]
}

export interface ExamRecord {
  id: string
  date: string
  mode: string
  total: number
  correct: number
  seconds: number
  byDomain: Record<string, { total: number; correct: number }>
}

const KEY = 'progress-v1'
const empty: ProgressState = { lessons: {}, checkpoints: {}, answers: {}, exams: [] }

let state: ProgressState = load()
const listeners = new Set<() => void>()

function load(): ProgressState {
  const s = readJSON<Partial<ProgressState>>(KEY, {})
  return {
    lessons: s.lessons ?? {},
    checkpoints: s.checkpoints ?? {},
    answers: s.answers ?? {},
    exams: s.exams ?? [],
  }
}

function commit(next: ProgressState) {
  state = next
  writeJSON(KEY, state)
  listeners.forEach((l) => l())
}

export const progress = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
  markLesson(key: string, done = true) {
    const lessons = { ...state.lessons }
    if (done) lessons[key] = lessons[key] ?? new Date().toISOString()
    else delete lessons[key]
    commit({ ...state, lessons })
  },
  recordCheckpoint(key: string, score: number) {
    const prev = state.checkpoints[key] ?? 0
    commit({ ...state, checkpoints: { ...state.checkpoints, [key]: Math.max(prev, score) } })
  },
  recordAnswer(questionId: string, correct: boolean) {
    const hist = [...(state.answers[questionId] ?? []), correct].slice(-5)
    commit({ ...state, answers: { ...state.answers, [questionId]: hist } })
  },
  recordExam(rec: ExamRecord) {
    if (state.exams.some((e) => e.id === rec.id)) return // the same attempt is only recorded once
    commit({ ...state, exams: [...state.exams, rec].slice(-50) })
  },
  reset() {
    removeKey(KEY)
    commit({ ...empty, lessons: {}, checkpoints: {}, answers: {}, exams: [] })
  },
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(progress.subscribe, progress.get, progress.get)
}

export const lessonKey = (moduleSlug: string, lessonSlug: string) => `${moduleSlug}/${lessonSlug}`
