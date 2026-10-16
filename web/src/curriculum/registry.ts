import type { ModuleDef, ModuleQuiz, LessonDef } from './types'
import { parts, type PartDef } from './parts'

const found = import.meta.glob<{ default: ModuleDef }>(['./modules/*/index.ts', '!./modules/_*/index.ts'], { eager: true })
const quizLoaders = import.meta.glob<{ default: ModuleQuiz }>(['./modules/*/quiz.ts', '!./modules/_*/quiz.ts'])

export const modules: ModuleDef[] = Object.values(found)
  .map((m) => m.default)
  .sort((a, b) => a.order - b.order)

const bySlug = new Map(modules.map((m) => [m.slug, m]))

export function getModule(slug: string | undefined): ModuleDef | undefined {
  return slug ? bySlug.get(slug) : undefined
}

export function getLesson(m: ModuleDef | undefined, slug: string | undefined): LessonDef | undefined {
  return m?.lessons.find((l) => l.slug === slug)
}

export interface LessonRef {
  module: ModuleDef
  lesson: LessonDef
  index: number
}

/** Every lesson in course order. */
export const lessonSequence: LessonRef[] = modules.flatMap((module) =>
  module.lessons.map((lesson) => ({ module, lesson, index: 0 })),
).map((ref, index) => ({ ...ref, index }))

export function neighbours(moduleSlug: string, lessonSlug: string) {
  const i = lessonSequence.findIndex((r) => r.module.slug === moduleSlug && r.lesson.slug === lessonSlug)
  return { prev: i > 0 ? lessonSequence[i - 1] : undefined, next: i >= 0 ? lessonSequence[i + 1] : undefined }
}

export const lessonHref = (moduleSlug: string, lessonSlug: string) => `/learn/${moduleSlug}/${lessonSlug}`
export const moduleHref = (moduleSlug: string) => `/learn/${moduleSlug}`

export async function loadModuleQuiz(moduleSlug: string): Promise<ModuleQuiz> {
  const loader = quizLoaders[`./modules/${moduleSlug}/quiz.ts`]
  if (!loader) return {}
  return (await loader()).default
}

/** Loads every module's checkpoint questions (used by the practice bank). */
export async function loadAllModuleQuizzes(): Promise<{ moduleSlug: string; quiz: ModuleQuiz }[]> {
  const entries = Object.entries(quizLoaders)
  return Promise.all(
    entries.map(async ([path, load]) => ({
      moduleSlug: path.split('/')[2],
      quiz: (await load()).default,
    })),
  )
}

export function modulesInPart(partId: string): ModuleDef[] {
  return modules.filter((m) => m.part === partId)
}

export const partList: (PartDef & { modules: ModuleDef[] })[] = parts
  .map((p) => ({ ...p, modules: modulesInPart(p.id) }))
  .filter((p) => p.modules.length > 0)

export const totalMinutes = modules.reduce((s, m) => s + m.lessons.reduce((t, l) => t + l.minutes, 0), 0)
