import type { Domain, Level, QuizQuestion } from '../curriculum/types'
import { loadAllModuleQuizzes, getModule } from '../curriculum/registry'
import { PAPERS, loadPaper, toQuiz } from './papers'

export type ExamDomain = Exclude<Domain, 'orientation' | 'exam'>

export interface BankQuestion extends QuizQuestion {
  domain: ExamDomain
  subtopic: string
  difficulty: Level
  source: 'bank' | 'course' | 'paper'
  /** e.g. "2026 Prelim · Q12" or "Module 5 checkpoint" */
  sourceLabel: string
}

interface RawBankItem {
  id: string
  domain: ExamDomain
  subtopic: string
  difficulty: Level
  prompt: string
  options: string[]
  answer: number
  explanation: string
  drop?: boolean
}

export const SUBTOPIC_LABEL: Record<string, string> = {
  'linear-algebra': 'Linear algebra',
  calculus: 'Calculus',
  'probability-statistics': 'Probability & statistics',
  optimisation: 'Optimisation',
  python: 'Python',
  numpy: 'NumPy',
  pandas: 'Pandas',
  pytorch: 'PyTorch',
  'data-preprocessing': 'Data preprocessing',
  'code-debugging': 'Debugging code',
  'ml-fundamentals': 'ML fundamentals',
  regression: 'Regression',
  classification: 'Classification',
  'trees-ensembles': 'Trees & ensembles',
  unsupervised: 'Unsupervised learning',
  'model-evaluation': 'Model evaluation',
  'neural-networks': 'Neural networks',
  'training-regularisation': 'Training & regularisation',
  'cnn-vision': 'CNNs & vision',
  'sequence-models': 'Sequence models',
  'nlp-transformers': 'NLP & transformers',
  'reinforcement-learning': 'Reinforcement learning',
  llms: 'Large language models',
  'generative-models': 'Generative models',
  multimodal: 'Multimodal',
  'prompting-rag': 'Prompting & RAG',
  'ai-ethics-safety': 'AI ethics & safety',
  'algorithms-complexity': 'Algorithms & complexity',
  'ml-debugging-diagnosis': 'Diagnosing ML problems',
  'ml-system-design': 'ML system design',
  'optimisation-tradeoffs': 'Optimisation trade-offs',
}

export const DOMAIN_SUBTOPICS: Record<ExamDomain, string[]> = {
  mathematics: ['linear-algebra', 'calculus', 'probability-statistics', 'optimisation'],
  computing: ['python', 'numpy', 'pandas', 'pytorch', 'data-preprocessing', 'code-debugging'],
  ai_ml_dl: ['ml-fundamentals', 'regression', 'classification', 'trees-ensembles', 'unsupervised', 'model-evaluation', 'neural-networks', 'training-regularisation', 'cnn-vision', 'sequence-models', 'nlp-transformers', 'reinforcement-learning'],
  generative_ai: ['llms', 'generative-models', 'multimodal', 'prompting-rag', 'ai-ethics-safety'],
  problem_solving: ['algorithms-complexity', 'ml-debugging-diagnosis', 'ml-system-design', 'optimisation-tradeoffs'],
}

const SUB_TO_DOMAIN: Record<string, ExamDomain> = Object.fromEntries(
  Object.entries(DOMAIN_SUBTOPICS).flatMap(([d, subs]) => subs.map((s) => [s, d as ExamDomain])),
)

/** Practice-topic tag for each course module's checkpoint questions (the module's main exam subtopic). */
const MODULE_SUBTOPIC: Record<string, string> = {
  'ai-first-look': 'ml-fundamentals',
  'python-basics': 'python',
  'python-toolkit': 'python',
  'algorithms-and-complexity': 'algorithms-complexity',
  'maths-foundations': 'calculus',
  'vectors-and-matrices': 'linear-algebra',
  numpy: 'numpy',
  'probability-and-statistics': 'probability-statistics',
  'pandas-and-plotting': 'pandas',
  'ml-fundamentals': 'ml-fundamentals',
  'data-and-features': 'data-preprocessing',
  'calculus-and-gradient-descent': 'calculus',
  'linear-regression': 'regression',
  classification: 'classification',
  'model-evaluation': 'model-evaluation',
  'trees-and-ensembles': 'trees-ensembles',
  'linear-algebra-deeper': 'linear-algebra',
  'unsupervised-learning': 'unsupervised',
  'neural-networks': 'neural-networks',
  backpropagation: 'neural-networks',
  pytorch: 'pytorch',
  'training-deep-networks': 'training-regularisation',
  'convolutional-networks': 'cnn-vision',
  'vision-tasks': 'cnn-vision',
  'text-as-data': 'nlp-transformers',
  'attention-and-transformers': 'nlp-transformers',
  'pretrained-models-text-speech': 'nlp-transformers',
  'large-language-models': 'llms',
  'prompting-and-rag': 'prompting-rag',
  'generative-models': 'generative-models',
  'multimodal-ai': 'multimodal',
  'debugging-and-diagnosis': 'ml-debugging-diagnosis',
  'ml-systems-and-tradeoffs': 'ml-system-design',
}

/** Lessons whose topic differs from their module's (same domain only). */
const LESSON_SUBTOPIC: Record<string, string> = {
  'ml-fundamentals/reinforcement-learning': 'reinforcement-learning',
  'calculus-and-gradient-descent/gradient-descent': 'optimisation',
  'calculus-and-gradient-descent/curvature-convexity': 'optimisation',
  'pandas-and-plotting/cleaning-data': 'data-preprocessing',
  'text-as-data/rnns-and-lstms': 'sequence-models',
  'large-language-models/limits-and-responsible-ai': 'ai-ethics-safety',
  'ml-systems-and-tradeoffs/compute-and-memory-tradeoffs': 'optimisation-tradeoffs',
  'ml-systems-and-tradeoffs/cost-of-ml': 'optimisation-tradeoffs',
}

let cache: Promise<BankQuestion[]> | null = null

async function loadCoreBank(): Promise<BankQuestion[]> {
  const mod = await import('./bank/bank.json')
  const raw = (mod.default ?? mod) as unknown as RawBankItem[]
  return raw
    .filter((q) => !q.drop)
    .map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      domain: SUB_TO_DOMAIN[q.subtopic] ?? q.domain,
      subtopic: q.subtopic,
      difficulty: q.difficulty,
      source: 'bank' as const,
      sourceLabel: 'Question bank',
    }))
}

async function loadCourseQuestions(): Promise<BankQuestion[]> {
  const all = await loadAllModuleQuizzes()
  return all.flatMap(({ moduleSlug, quiz }) => {
    const m = getModule(moduleSlug)
    if (!m || m.domain === 'orientation' || m.domain === 'exam') return []
    return Object.entries(quiz).flatMap(([lessonSlug, qs]) =>
      qs.map((q) => ({
        ...q,
        domain: m.domain as ExamDomain,
        subtopic: LESSON_SUBTOPIC[`${moduleSlug}/${lessonSlug}`] ?? MODULE_SUBTOPIC[moduleSlug] ?? '',
        difficulty: q.difficulty ?? 'beginner',
        source: 'course' as const,
        sourceLabel: `Course: ${m.title}`,
      })),
    )
  })
}

async function loadPaperQuestions(): Promise<BankQuestion[]> {
  const out: BankQuestion[] = []
  for (const p of PAPERS) {
    const qs = await loadPaper(p.id)
    for (const q of qs) {
      // practice filters group by topic, so the domain follows the topic (the paper's own section can differ: see PaperView)
      out.push({
        ...toQuiz(p.id, q),
        domain: SUB_TO_DOMAIN[q.subtopic] ?? q.domain,
        subtopic: q.subtopic,
        difficulty: q.difficulty,
        source: 'paper',
        sourceLabel: `${p.short} · Q${q.n}`,
      })
    }
  }
  return out
}

/** Every practice question on the site. Cached after the first call. */
export function loadAllQuestions(): Promise<BankQuestion[]> {
  if (!cache) {
    cache = Promise.all([loadCoreBank(), loadCourseQuestions(), loadPaperQuestions()]).then((parts) => parts.flat())
    cache.catch(() => {
      cache = null
    })
  }
  return cache
}
