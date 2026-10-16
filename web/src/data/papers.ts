import type { QuizQuestion, Domain, Level } from '../curriculum/types'

/** A solved official past-paper question (see scripts/ and research notes for provenance). */
export interface PaperQuestion {
  n: number
  question: string
  options: string[]
  answer: number
  domain: Exclude<Domain, 'orientation' | 'exam'>
  subtopic: string
  difficulty: Level
  style: string
  concepts: string[]
  explanation: string
  confidence?: 'high' | 'medium' | 'low'
  /** internal provenance notes (solving, reconciliation with the official key); not shown to students */
  notes?: string
  /** short student-facing note shown after answering, e.g. where AI Singapore's key differs from ours */
  caveat?: string
}

export interface Paper {
  paper: string
  source: string
  questions: PaperQuestion[]
}

export interface PaperMeta {
  id: string
  title: string
  short: string
  date: string
  round: string
  format: string
  sourceUrl: string
  /** the json files that make up the paper, in order */
  files: string[]
}

export const PAPERS: PaperMeta[] = [
  {
    id: 'prelim2026',
    title: 'NOAI 2026 Preliminary Round',
    short: '2026 Prelim',
    date: '20 Feb 2026',
    round: 'Preliminary',
    format: '300 MCQs · 3 hours · online, in school computer labs',
    sourceUrl: 'https://aisingapore.org/wp-content/uploads/2026/04/NOAI-2026-Preliminary-Round-Assessment-300-MCQs-Google-Forms.pdf',
    files: ['prelim2026_chunk1', 'prelim2026_chunk2', 'prelim2026_chunk3', 'prelim2026_chunk4', 'prelim2026_chunk5', 'prelim2026_chunk6'],
  },
  {
    id: 'final2026',
    title: 'NOAI 2026 Final — Section 1',
    short: '2026 Final MCQ',
    date: '6 Mar 2026',
    round: 'Final',
    format: '20 MCQs (20 marks) of a 3-hour paper; Section 2 is 3 Python tasks',
    sourceUrl: 'https://aisingapore.org/wp-content/uploads/2026/04/NOAI-2026-Final-Assessment-Section-1-MCQs-Google-Forms.pdf',
    files: ['final2026_section1'],
  },
  {
    id: 'noai2025',
    title: 'NOAI 2025 — MCQ section',
    short: '2025 MCQ',
    date: '2025',
    round: 'Inaugural edition',
    format: 'MCQs from the first NOAI (with official answers)',
    sourceUrl: 'https://aisingapore.org/wp-content/uploads/2025/12/NOAI2025_Questions.zip',
    files: ['noai2025_mcq'],
  },
]

const loaders = import.meta.glob<{ default: Paper }>('./papers/*.json')

export async function loadPaper(id: string): Promise<PaperQuestion[]> {
  const meta = PAPERS.find((p) => p.id === id)
  if (!meta) return []
  const parts = await Promise.all(
    meta.files.map(async (f) => {
      const l = loaders[`./papers/${f}.json`]
      return l ? (await l()).default.questions : []
    }),
  )
  return parts.flat().sort((a, b) => a.n - b.n)
}

export function toQuiz(paperId: string, q: PaperQuestion): QuizQuestion {
  return { id: `${paperId}.${q.n}`, prompt: q.question, options: q.options, answer: q.answer, explanation: q.explanation, difficulty: q.difficulty, caveat: q.caveat }
}
