/*
  Content validation for the whole course.
    npm run check:content                 -> every module
    MODULE=linear-algebra npm run check:content   -> one module only
  It checks module metadata, compiles + server-renders every lesson, and validates quizzes,
  past papers and the question bank.
*/
import { MDXProvider } from '@mdx-js/react'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { mdxComponents } from '../src/components/content/mdxComponents'
import { modules, loadModuleQuiz } from '../src/curriculum/registry'
import { parts } from '../src/curriculum/parts'
import type { QuizQuestion } from '../src/curriculum/types'

const ONLY = process.env.MODULE
const ROOT = join(__dirname, '..', 'src')
const MOD_DIR = join(ROOT, 'curriculum', 'modules')
const DOMAINS = ['orientation', 'mathematics', 'computing', 'ai_ml_dl', 'generative_ai', 'problem_solving', 'exam']
const SUBTOPICS = [
  'linear-algebra', 'calculus', 'probability-statistics', 'optimisation',
  'python', 'numpy', 'pandas', 'pytorch', 'data-preprocessing', 'code-debugging',
  'ml-fundamentals', 'regression', 'classification', 'trees-ensembles', 'unsupervised', 'model-evaluation', 'neural-networks', 'training-regularisation', 'cnn-vision', 'sequence-models', 'nlp-transformers', 'reinforcement-learning',
  'llms', 'generative-models', 'multimodal', 'prompting-rag', 'ai-ethics-safety',
  'algorithms-complexity', 'ml-debugging-diagnosis', 'ml-system-design', 'optimisation-tradeoffs',
]

const targets = ONLY ? modules.filter((m) => m.slug === ONLY) : modules

function checkQuestion(q: QuizQuestion, where: string) {
  expect(q.id, `${where}: id`).toMatch(/^[a-z0-9][a-z0-9.\-_]*$/)
  expect(q.prompt.trim().length, `${where}: prompt`).toBeGreaterThan(5)
  expect(q.options.length, `${where}: options`).toBeGreaterThanOrEqual(2)
  expect(new Set(q.options).size, `${where}: duplicate options`).toBe(q.options.length)
  expect(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, `${where}: answer index ${q.answer}`).toBe(true)
  expect(q.explanation.trim().length, `${where}: explanation`).toBeGreaterThan(15)
  for (const o of q.options) expect(o.trim().length, `${where}: empty option`).toBeGreaterThan(0)
}

describe('course structure', () => {
  it('has modules', () => {
    expect(targets.length, ONLY ? `module ${ONLY} not found (is its index.ts default-exporting the ModuleDef?)` : 'no modules').toBeGreaterThan(0)
  })

  if (!ONLY) {
    it('module order is unique and contiguous from 1', () => {
      const orders = modules.map((m) => m.order).sort((a, b) => a - b)
      expect(orders).toEqual(orders.map((_, i) => i + 1))
    })
    it('module slugs are unique', () => {
      expect(new Set(modules.map((m) => m.slug)).size).toBe(modules.length)
    })
  }

  for (const m of targets) {
    describe(`module ${m.slug}`, () => {
      it('metadata is valid', () => {
        expect(existsSync(join(MOD_DIR, m.slug, 'index.ts')), 'folder name must equal slug').toBe(true)
        expect(parts.some((p) => p.id === m.part), `unknown part "${m.part}"`).toBe(true)
        expect(DOMAINS).toContain(m.domain)
        expect(m.title.length).toBeGreaterThan(2)
        expect(m.summary.length).toBeGreaterThan(10)
        expect(m.lessons.length).toBeGreaterThan(0)
        expect(new Set(m.lessons.map((l) => l.slug)).size, 'duplicate lesson slugs').toBe(m.lessons.length)
        for (const p of m.prerequisites) {
          const pre = modules.find((x) => x.slug === p)
          if (!ONLY) expect(pre, `prerequisite ${p} missing`).toBeTruthy()
          if (pre) expect(pre.order, `prerequisite ${p} must come earlier`).toBeLessThan(m.order)
        }
        for (const l of m.lessons) {
          expect(l.slug).toMatch(/^[a-z0-9-]+$/)
          expect(l.minutes).toBeGreaterThanOrEqual(5)
          expect(l.minutes).toBeLessThanOrEqual(50)
          expect(l.objectives.length).toBeGreaterThan(0)
          expect(l.summary.length).toBeGreaterThan(10)
        }
      })

      for (const l of m.lessons) {
        it(`lesson ${l.slug} compiles and renders`, async () => {
          const mod = await l.load()
          const Content = mod.default
          const html = renderToString(
            <MemoryRouter>
              <MDXProvider components={mdxComponents}>
                <Content />
              </MDXProvider>
            </MemoryRouter>,
          )
          expect(html.length, 'lesson renders almost nothing').toBeGreaterThan(1500)
          expect(html, 'unresolved component (did you forget to import it?)').not.toMatch(/Expected component `\w+` to be defined/)
        })
      }

      it('lesson sources use at least one visual explainer each', () => {
        for (const l of m.lessons) {
          const file = [`${l.slug}.mdx`, `${l.slug}.tsx`].map((f) => join(MOD_DIR, m.slug, f)).find(existsSync)
          expect(file, `lesson file for ${l.slug} should be ${l.slug}.mdx`).toBeTruthy()
          const src = readFileSync(file!, 'utf8')
          const usesVisual = /from ['"]\.\/visuals\//.test(src) || /<(Figure|NeuralNet|MatrixGrid|Bars|Steps)\b/.test(src)
          expect(usesVisual, `${l.slug} has no visual explainer`).toBe(true)
        }
      })

      it('checkpoint quizzes are valid', async () => {
        const quiz = await loadModuleQuiz(m.slug)
        for (const [lessonSlug, qs] of Object.entries(quiz)) {
          expect(m.lessons.some((l) => l.slug === lessonSlug), `quiz key "${lessonSlug}" is not a lesson slug`).toBe(true)
          qs.forEach((q, i) => checkQuestion(q, `${m.slug}/${lessonSlug}#${i + 1}`))
        }
      })
    })
  }

  if (!ONLY) {
    it('all quiz ids are unique across the course', async () => {
      const ids: string[] = []
      for (const m of modules) {
        const quiz = await loadModuleQuiz(m.slug)
        Object.values(quiz).forEach((qs) => qs.forEach((q) => ids.push(q.id)))
      }
      const dup = ids.filter((id, i) => ids.indexOf(id) !== i)
      expect(dup).toEqual([])
    })
  }
})

describe.skipIf(Boolean(ONLY))('data files', () => {
  it('past papers are well-formed', () => {
    const dir = join(ROOT, 'data', 'papers')
    if (!existsSync(dir)) return
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
      const paper = JSON.parse(readFileSync(join(dir, f), 'utf8'))
      expect(Array.isArray(paper.questions), f).toBe(true)
      const ns = new Set<number>()
      for (const q of paper.questions) {
        const where = `${f} Q${q.n}`
        expect(ns.has(q.n), `${where} duplicate n`).toBe(false)
        ns.add(q.n)
        checkQuestion({ id: `p.${q.n}`, prompt: q.question, options: q.options, answer: q.answer, explanation: q.explanation }, where)
        expect(SUBTOPICS, `${where} subtopic`).toContain(q.subtopic)
      }
    }
  })

  it('question bank is well-formed', () => {
    const bank = JSON.parse(readFileSync(join(ROOT, 'data', 'bank', 'bank.json'), 'utf8')) as (QuizQuestion & { subtopic: string })[]
    const ids = new Set<string>()
    for (const q of bank) {
      expect(ids.has(q.id), `duplicate ${q.id}`).toBe(false)
      ids.add(q.id)
      checkQuestion(q, q.id)
      expect(SUBTOPICS, `${q.id} subtopic`).toContain(q.subtopic)
    }
  })
})
