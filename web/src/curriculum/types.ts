import type { ComponentType } from 'react'

/** NOAI assessment domains (as listed for the 2026 preliminary round), plus site-only groupings. */
export type Domain =
  | 'orientation'
  | 'mathematics'
  | 'computing'
  | 'ai_ml_dl'
  | 'generative_ai'
  | 'problem_solving'
  | 'exam'

export type Level = 'beginner' | 'intermediate' | 'advanced'

/** A multiple-choice question. `prompt`, `options` and `explanation` accept Markdown with $math$ and `code`. */
export interface QuizQuestion {
  /** globally unique, e.g. "linear-algebra.vectors.1" */
  id: string
  prompt: string
  /** optional code shown under the prompt (rendered as a Python block unless `codeLang` says otherwise) */
  code?: string
  codeLang?: string
  options: string[]
  /** 0-based index into options */
  answer: number
  explanation: string
  difficulty?: Level
}

export interface LessonDef {
  slug: string
  title: string
  /** one sentence shown in lists */
  summary: string
  /** estimated study time */
  minutes: number
  /** "By the end you can…" statements */
  objectives: string[]
  /** lazy MDX/TSX page */
  load: () => Promise<{ default: ComponentType<Record<string, unknown>> }>
}

export interface ModuleDef {
  /** must equal the module's folder name */
  slug: string
  /** global position in the course (1-based, unique) */
  order: number
  part: string
  domain: Domain
  title: string
  /** 3-8 words */
  tagline: string
  /** 1-2 sentences */
  summary: string
  /** slugs of modules to finish first */
  prerequisites: string[]
  /** NOAI / IOAI syllabus items this module covers */
  syllabus: string[]
  lessons: LessonDef[]
}

/** Shape of a module's optional quiz.ts default export: lesson slug -> checkpoint questions. */
export type ModuleQuiz = Record<string, QuizQuestion[]>
