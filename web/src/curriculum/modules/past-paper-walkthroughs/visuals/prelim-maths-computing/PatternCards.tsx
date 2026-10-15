import { useEffect, useRef, useState } from 'react'
import { Figure, Segmented, Button } from '../../../../../kit'
import { TEMPLATES, GROUPS, TOTAL_ITEMS, type Template } from './patterns'
import { Rich } from './Rich'
import { drillRequests, cardRequests } from './drillChannel'
import s from './pp.module.css'

/*
  The 26 templates behind all 119 questions in the 2026 Prelim's Mathematics and Computing blocks.
  Pick a template chip, recall its method, flip the card to check. The coverage bar shows how much of
  the paper each template covers. Templates are sorted by topic, not by paper block. The timed drill
  lives in its own figure (TemplateDrill); "Drill a variant of this" sends the template there.
*/

type Filter = 'all' | 'maths' | 'computing'
const DOMAIN_COLOUR = { maths: 'var(--d-math)', computing: 'var(--d-computing)' } as const

const BY_SIZE = [...TEMPLATES].sort((a, b) => b.items.length - a.items.length)
const TOP8 = BY_SIZE.slice(0, 8).reduce((a, t) => a + t.items.length, 0)
/** Computing-block questions (Q61–119) whose template is filed under a maths topic */
const COMPUTING_UNDER_MATHS = TEMPLATES.filter((t) => t.domain === 'maths')
  .flatMap((t) => t.items)
  .filter((n) => n >= 61)
  .sort((a, b) => a - b)

export default function PatternCards() {
  const [filter, setFilter] = useState<Filter>('all')
  const [sel, setSel] = useState('det')
  const [flipped, setFlipped] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const t = TEMPLATES.find((x) => x.id === sel)!
  const shown = TEMPLATES.filter((x) => filter === 'all' || x.domain === filter)

  const select = (id: string) => {
    setSel(id)
    setFlipped(false)
  }

  // the drill below asked to open a template's card
  useEffect(
    () =>
      cardRequests.listen((id) => {
        setFilter('all')
        setSel(id)
        setFlipped(true)
        cardRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }),
    [],
  )

  return (
    <Figure
      title="26 templates cover all of Q1–119"
      caption={
        <>
          Every one of the {TOTAL_ITEMS} questions in the Mathematics and Computing blocks (Q1–119) fits one of these {TEMPLATES.length} templates, and the 8 biggest
          cover {TOP8} of them. Pick a template, say its method out loud, then <strong>flip</strong> to check. Notice how few facts the whole first third of the
          paper rests on.
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.group}>
          <span className={s.label}>Questions per template, largest first</span>
          <div className={s.coverage} role="img" aria-label={`Share of the ${TOTAL_ITEMS} questions covered by each template; selected: ${t.name}, ${t.items.length} questions`}>
            {BY_SIZE.map((x, i) => (
              <div
                key={x.id}
                className={`${s.coverSeg}${x.id === sel ? ` ${s.coverSegOn}` : ''}`}
                style={{ flex: x.items.length, background: `color-mix(in srgb, ${DOMAIN_COLOUR[x.domain]} ${i % 2 ? 55 : 85}%, var(--surface))` }}
                title={`${x.name}: ${x.items.length}`}
              />
            ))}
          </div>
          <div className={s.legend}>
            <span className={s.legendItem}>
              <span className={s.swatch} style={{ background: DOMAIN_COLOUR.maths }} /> maths topics
            </span>
            <span className={s.legendItem}>
              <span className={s.swatch} style={{ background: DOMAIN_COLOUR.computing }} /> computing topics
            </span>
            <span className={`${s.legendItem} tabular`}>
              selected: {t.items.length} of {TOTAL_ITEMS} questions
            </span>
          </div>
        </div>

        <Segmented<Filter>
          label="Show"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All 26' },
            { value: 'maths', label: 'Maths topics' },
            { value: 'computing', label: 'Computing topics' },
          ]}
        />
        {filter !== 'all' && (
          <span className={s.small}>
            Sorted by topic, not by paper block: {COMPUTING_UNDER_MATHS.length} questions from the Computing block (
            {COMPUTING_UNDER_MATHS.map((n) => `Q${n}`).join(', ')}) test optimisers, probability, Newton&rsquo;s method or a loss formula, so they sit under
            maths topics.
          </span>
        )}

        <div className={s.groups}>
          {GROUPS.filter((g) => shown.some((x) => x.group === g)).map((g) => (
            <div key={g} className={s.group}>
              <span className={s.label}>{g}</span>
              <div className={s.row}>
                {shown
                  .filter((x) => x.group === g)
                  .map((x) => (
                    <button key={x.id} type="button" className={`${s.chip}${x.id === sel ? ` ${s.chipOn}` : ''}`} aria-pressed={x.id === sel} onClick={() => select(x.id)}>
                      {x.name}
                      <span className={s.badge}>{x.items.length}</span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div ref={cardRef}>
          <TemplateCard t={t} flipped={flipped} onFlip={() => setFlipped((f) => !f)} onDeal={t.gen ? () => drillRequests.send(t.id) : undefined} />
        </div>
      </div>
    </Figure>
  )
}

function TemplateCard({ t, flipped, onFlip, onDeal }: { t: Template; flipped: boolean; onFlip: () => void; onDeal?: () => void }) {
  return (
    <div className={s.flip}>
      <div className={`${s.flipInner}${flipped ? ` ${s.flipped}` : ''}`}>
        <div className={`${s.face} ${s.front}`}>
          <div className={s.spread}>
            <span className={s.label} style={{ color: t.domain === 'maths' ? 'var(--d-math)' : 'var(--d-computing)' }}>
              {t.group} · front
            </span>
            <span className={`${s.small} tabular`}>
              {t.items.length} question{t.items.length > 1 ? 's' : ''} in 2026
            </span>
          </div>
          <div className={s.cardTitle}>{t.name}</div>
          <div className={s.kv}>
            <span className={s.kvKey}>How it was asked</span>
            <span className={s.kvVal}>
              <Rich text={t.stem} />
            </span>
          </div>
          <div className={s.kv}>
            <span className={s.kvKey}>2026 items</span>
            <span className={`${s.kvVal} tabular`}>{t.items.map((n) => `Q${n}`).join(' · ')}</span>
          </div>
          <div className={`${s.row} ${s.faceFoot}`}>
            <Button primary onClick={onFlip}>
              I know the method: flip
            </Button>
          </div>
        </div>
        <div className={`${s.face} ${s.back}`}>
          <div className={s.spread}>
            <span className={s.label}>{t.name} · back</span>
          </div>
          <div className={s.kv}>
            <span className={s.kvKey}>Fastest method</span>
            <span className={s.kvVal}>
              <Rich text={t.method} />
            </span>
          </div>
          <div className={s.kv}>
            <span className={s.kvKey}>The usual trap</span>
            <span className={s.kvVal}>
              <Rich text={t.trap} />
            </span>
          </div>
          <div className={s.kv}>
            <span className={s.kvKey}>Taught in</span>
            <span className={s.kvVal}>
              {t.lessons.map((l, i) => (
                <span key={l.href}>
                  {i > 0 && ' · '}
                  <a href={l.href}>{l.label}</a>
                </span>
              ))}
            </span>
          </div>
          <div className={`${s.row} ${s.faceFoot}`}>
            <Button onClick={onFlip}>Flip back</Button>
            {onDeal ? (
              <Button primary onClick={onDeal}>
                Drill a variant of this (below)
              </Button>
            ) : (
              <span className={s.small}>Recall-only template: no number variant to deal.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
