import { useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Button, useNarrow } from '../../../../../kit'
import { useDropSort } from './useDropSort'
import s from './sort.module.css'

/** Sort six real systems into the nested rings: ordinary software ⊃ AI ⊃ ML ⊃ DL. */

type ZoneId = 'none' | 'ai' | 'ml' | 'dl'

const ZONES: { id: ZoneId; title: string; blurb: string; color: string }[] = [
  { id: 'none', title: 'All computer programs', blurb: 'Most just follow exact steps that people wrote.', color: 'var(--viz-axis)' },
  { id: 'ai', title: 'Artificial intelligence (AI)', blurb: 'Does tasks that seem to need intelligence.', color: 'var(--viz-6)' },
  { id: 'ml', title: 'Machine learning (ML)', blurb: 'AI that learns patterns from data.', color: 'var(--viz-1)' },
  { id: 'dl', title: 'Deep learning (DL)', blurb: 'ML using neural networks with many layers.', color: 'var(--viz-3)' },
]
const DEPTH: Record<ZoneId, number> = { none: 0, ai: 1, ml: 2, dl: 3 }

interface Card {
  id: string
  label: string
  detail: string
  zone: ZoneId
  ok: string
  tooDeep?: string
  tooShallow?: string
}

const CARDS: Card[] = [
  {
    id: 'calc',
    label: 'Calculator app',
    detail: 'does exact arithmetic, step by step',
    zone: 'none',
    ok: 'Right. A calculator follows exact steps that people wrote. Very useful, but nothing it does needs intelligence, so it sits outside AI.',
    tooDeep: 'A calculator only follows fixed arithmetic steps. Nothing it does seems intelligent, and it never learns. Try the outer box.',
  },
  {
    id: 'chess',
    label: 'Classic chess engine',
    detail: 'searches millions of moves and scores them with rules written by experts',
    zone: 'ai',
    ok: 'Right. Playing chess at grandmaster level looks intelligent, so it is AI. But every scoring rule was written by people and it never learns from data, so it is not ML.',
    tooDeep: 'Does it learn from data? No: chess experts wrote its scoring rules by hand. AI, yes; ML, no.',
    tooShallow: 'Playing chess at grandmaster level looks intelligent. It belongs inside the AI ring.',
  },
  {
    id: 'spam',
    label: 'Spam filter',
    detail: 'learns a score for each word from emails labelled spam or not spam',
    zone: 'ml',
    ok: 'Right. It learns its word scores from labelled emails, so it is ML. Adding up word scores is a simple model, not a deep neural network, so it is not DL.',
    tooDeep: 'It does learn from data, but adding up word scores is a simple model, not a neural network with many layers.',
    tooShallow: 'It does more than look clever: it learns its word scores from data. Is there a smaller ring for that?',
  },
  {
    id: 'price',
    label: 'HDB price predictor',
    detail: 'a straight line fitted to past resale prices',
    zone: 'ml',
    ok: 'Right. The slope and height of the line are learned from past sales, so it is ML. You will fit one yourself in the next lesson. A straight line is not a deep network.',
    tooDeep: 'It learns from data, but a straight line is about the simplest model there is, not a many-layered neural network.',
    tooShallow: 'Its line is learned from past sales data. Is there a smaller ring for things that learn?',
  },
  {
    id: 'face',
    label: 'Face unlock',
    detail: 'a deep neural network trained on millions of face photos',
    zone: 'dl',
    ok: 'Right. Face unlock runs a deep neural network, so it is DL, which also makes it ML and AI.',
    tooShallow: 'True, it learns from data. But it uses a neural network with many layers, and there is an even smaller ring for that.',
  },
  {
    id: 'chat',
    label: 'Chatbot like ChatGPT',
    detail: 'a huge neural network trained on text',
    zone: 'dl',
    ok: 'Right. Chatbots are huge deep neural networks trained on text: DL, and therefore also ML and AI.',
    tooShallow: 'True, it learns from data. But it is a neural network with many layers, and there is an even smaller ring for that.',
  },
]

export default function AIVennExplorer() {
  const [placed, setPlaced] = useState<Record<string, ZoneId>>({})
  const [slips, setSlips] = useState(0)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'bad'; text: ReactNode } | null>(null)

  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const [deck, setDeck] = useState(0)

  const sort = useDropSort((id, zone) => {
    const card = CARDS.find((c) => c.id === id)
    if (!card || !(zone in DEPTH)) return
    const z = zone as ZoneId
    if (z === card.zone) {
      const next = { ...placed, [id]: z }
      setPlaced(next)
      const done = Object.keys(next).length === CARDS.length
      setMsg({
        kind: 'ok',
        text: done ? (
          <>
            {card.ok} <strong>All six sorted.</strong> Notice that everything in DL is also in ML and AI, while the chess engine shows that not all AI learns.
          </>
        ) : (
          card.ok
        ),
      })
    } else {
      setSlips((n) => n + 1)
      sort.shake(id)
      const hint = DEPTH[z] > DEPTH[card.zone] ? card.tooDeep : card.tooShallow
      setMsg({ kind: 'bad', text: <>Not quite: “{card.label}” bounced back. {hint}</> })
    }
  })

  const left = CARDS.filter((c) => !placed[c.id])
  const current = left.length ? left[deck % left.length] : null
  const armed = narrow ? !!current : !!sort.selected
  const reset = () => {
    setPlaced({})
    setDeck(0)
    setSlips(0)
    sort.setSelected(null)
    setMsg(null)
  }

  const renderZone = (i: number): ReactNode => {
    const z = ZONES[i]
    const here = CARDS.filter((c) => placed[c.id] === z.id)
    const cls = [s.zone, i === 0 ? s.zoneOuter : '', armed ? s.targetable : '', sort.hover === z.id ? s.hovered : ''].join(' ')
    return (
      <div className={cls} data-zone={z.id} style={{ '--zc': z.color } as CSSProperties}>
        <button type="button" className={s.zoneHead} aria-label={`${z.title}${armed ? ': place the card here' : ''}`}>
          <span className={s.zoneTitle}>{z.title}</span>
          <span className={s.zoneBlurb}>{z.blurb}</span>
        </button>
        <div className={s.chips}>
          {here.map((c) => (
            <span key={c.id} className={s.chip}>
              {c.label}
            </span>
          ))}
          {here.length === 0 && armed && <span className={s.dropHint}>drop here</span>}
        </div>
        {i < ZONES.length - 1 && renderZone(i + 1)}
      </div>
    )
  }

  const ghostCard = sort.ghost && CARDS.find((c) => c.id === sort.ghost!.id)

  return (
    <Figure
      title="Which ring does each system belong in?"
      caption={
        <>
          Each ring sits inside the one around it: every DL system is also ML, and every ML system is also AI. Try the chess engine and the spam filter: what
          decides whether something counts as ML is <strong>whether it learns from data</strong>, not how clever it looks.
        </>
      }
    >
      <div className={s.wrap} ref={wrapRef}>
        <div className={s.trayLabel}>
          {!left.length ? 'All cards sorted' : narrow ? `Card ${CARDS.length - left.length + 1} of ${CARDS.length}: tap the ring it belongs in` : `Cards to sort (${left.length} left)`}
        </div>
        {narrow && current ? (
          <div className={s.deck}>
            <button
              type="button"
              aria-pressed="true"
              className={[s.card, s.cardSelected, sort.shakeId === current.id ? s.shake : ''].join(' ')}
              {...sort.cardHandlers(current.id)}
            >
              <strong>{current.label}</strong>
              <span>{current.detail}</span>
            </button>
            {left.length > 1 && (
              <button type="button" className={s.skip} onClick={() => (setDeck((d) => d + 1), sort.setSelected(null))} aria-label="Skip to the next card">
                Skip
              </button>
            )}
          </div>
        ) : (
          <div className={s.tray}>
            {left.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={sort.selected === c.id}
                className={[s.card, sort.selected === c.id ? s.cardSelected : '', sort.shakeId === c.id ? s.shake : '', sort.ghost?.id === c.id ? s.cardDragging : ''].join(' ')}
                {...sort.cardHandlers(c.id)}
              >
                <strong>{c.label}</strong>
                <span>{c.detail}</span>
              </button>
            ))}
            {left.length === 0 && <span className={s.trayDone}>Press “Start again” to replay.</span>}
          </div>
        )}
        <div onClick={(e) => sort.onZoneClick(e, narrow ? current?.id : null)}>{renderZone(0)}</div>
        <div className={[s.feedback, msg?.kind === 'ok' ? s.feedbackOk : msg?.kind === 'bad' ? s.feedbackBad : ''].join(' ')} aria-live="polite">
          {msg
            ? msg.text
            : narrow
              ? 'Tap the smallest ring that the card belongs in. Wrong rings bounce the card back with a hint.'
              : 'Pick a card (click it, or drag it with the mouse), then drop it into the smallest ring it belongs in. Wrong rings bounce the card back with a hint.'}
        </div>
        <div className={s.bar}>
          <span className={s.score}>
            {Object.keys(placed).length} of {CARDS.length} placed · {slips} {slips === 1 ? 'slip' : 'slips'}
          </span>
          <Button onClick={reset}>Start again</Button>
        </div>
      </div>
      {ghostCard && sort.ghost && (
        <div className={s.ghost} style={{ left: sort.ghost.x, top: sort.ghost.y }} aria-hidden="true">
          {ghostCard.label}
        </div>
      )}
    </Figure>
  )
}
