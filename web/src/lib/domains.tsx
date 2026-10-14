import type { Domain } from '../curriculum/types'

export const DOMAIN_LABEL: Record<Domain, string> = {
  orientation: 'Start here',
  mathematics: 'Mathematics',
  computing: 'Computing',
  ai_ml_dl: 'AI / ML / DL',
  generative_ai: 'Generative AI',
  problem_solving: 'Problem solving',
  exam: 'Exam practice',
}

export const EXAM_DOMAINS: Domain[] = ['mathematics', 'computing', 'ai_ml_dl', 'generative_ai', 'problem_solving']

export function DomainChip({ domain }: { domain: Domain }) {
  return (
    <span className={`chip dom-${domain}`} style={{ color: 'var(--dom)', borderColor: 'color-mix(in srgb, var(--dom) 40%, transparent)' }}>
      <span className="chip-dot" />
      {DOMAIN_LABEL[domain]}
    </span>
  )
}
