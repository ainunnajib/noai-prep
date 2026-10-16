import { Figure, useNarrow } from '../../../../../kit'
import { DOMAINS, PRELIM } from '../../../../../data/facts'

/*
  The 2027 Prelim as 150 squares, one per question, in five domain blocks (the 2026 paper came
  in domain blocks: Mathematics first, Problem solving last). The 2026 split (out of 300) was
  almost even, so each domain is drawn as about a fifth of the 2027 paper.
*/

const COLOURS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)', 'var(--viz-5)']

export default function DomainStrip() {
  const [ref, narrow] = useNarrow<HTMLDivElement>(520)
  const total2026 = DOMAINS.reduce((s, d) => s + d.share2026, 0)
  const perRow = Math.round(PRELIM.questions / DOMAINS.length)

  return (
    <Figure
      title={`The ${PRELIM.questions}-question Prelim, one square per question`}
      caption={
        <>
          Each row is one domain, in the order the 2026 paper used. In the {total2026}-question 2026 paper the split was almost even (the numbers on the right), so expect about
          a fifth of the 2027 paper, roughly {perRow} questions, from each domain: none is safe to skip.
        </>
      }
    >
      <div ref={ref} role="list" aria-label="Prelim domains" style={{ width: '100%', display: 'grid', gap: narrow ? '0.5rem' : '0.35rem' }}>
        {DOMAINS.map((dm, i) => (
          <div
            role="listitem"
            key={dm.domain}
            aria-label={`${dm.title}: about ${perRow} of ${PRELIM.questions} questions; ${dm.share2026} of ${total2026} in 2026.`}
            style={{
              display: 'grid',
              gridTemplateColumns: narrow ? '1fr auto' : '8.5rem 1fr 5.5rem',
              gridTemplateAreas: narrow ? '"name n" "cells cells"' : '"name cells n"',
              alignItems: 'center',
              gap: narrow ? '0.15rem 0.5rem' : '0.6rem',
            }}
          >
            <span style={{ gridArea: 'name', fontSize: '0.88rem', fontWeight: 750, color: 'var(--ink)' }}>{dm.title}</span>
            <span aria-hidden="true" style={{ gridArea: 'cells', display: 'grid', gridTemplateColumns: `repeat(${perRow}, minmax(0, 1fr))`, gap: 2 }}>
              {Array.from({ length: perRow }, (_, k) => (
                <span key={k} style={{ aspectRatio: '1', borderRadius: 2, background: COLOURS[i] }} />
              ))}
            </span>
            <span className="tabular" style={{ gridArea: 'n', fontSize: '0.8rem', color: 'var(--ink-2)', textAlign: 'right' }}>
              2026: {dm.share2026}/{total2026}
            </span>
          </div>
        ))}
      </div>
    </Figure>
  )
}
