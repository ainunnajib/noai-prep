import { useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Button, useNarrow } from '../../../../../kit'
import { useDropSort } from './useDropSort'
import s from './sort.module.css'

/** Sort nine scenarios into supervised / unsupervised / reinforcement learning. */

type Bin = 'sup' | 'unsup' | 'rl'

const BINS: { id: Bin; title: string; blurb: string; clue: string; color: string }[] = [
  { id: 'sup', title: 'Supervised', blurb: 'Learns from examples that come with the right answers.', clue: 'has labels', color: 'var(--viz-1)' },
  { id: 'unsup', title: 'Unsupervised', blurb: 'Finds structure, such as groups, in data with no answers.', clue: 'no labels', color: 'var(--viz-3)' },
  { id: 'rl', title: 'Reinforcement', blurb: 'Learns by trial and error from rewards and penalties.', clue: 'gets rewards', color: 'var(--viz-2)' },
]

interface Card {
  id: string
  text: string
  bin: Bin
  why: string
}

const CARDS: Card[] = [
  {
    id: 'hdb',
    text: 'Predict an HDB flat’s resale price from 20,000 past sales, each with its final price',
    bin: 'sup',
    why: 'Every past sale comes with its answer (the price). Examples with answers mean supervised.',
  },
  {
    id: 'shoppers',
    text: 'Split a bubble-tea shop’s customers into groups by what they buy; nobody says what the groups are',
    bin: 'unsup',
    why: 'Nobody gives the groups or any right answers. Finding groups in unlabelled data is unsupervised (this is called clustering).',
  },
  {
    id: 'robot',
    text: 'A robot dog learns to walk: +1 point for each step forward, −10 for falling over',
    bin: 'rl',
    why: 'Nobody shows it the correct leg movements. It acts, then gets points or penalties. Rewards mean reinforcement learning.',
  },
  {
    id: 'spam',
    text: 'Flag spam using 50,000 emails that users have marked “spam” or “not spam”',
    bin: 'sup',
    why: 'Each email comes with its answer (spam or not). That is labelled data, so supervised.',
  },
  {
    id: 'game',
    text: 'An AI learns a mobile game by playing it millions of times, trying to push up its score',
    bin: 'rl',
    why: 'The score is a reward signal from the game. Trial, error and rewards mean reinforcement learning.',
  },
  {
    id: 'news',
    text: 'Sort 10,000 news articles into topics that nobody has named or listed in advance',
    bin: 'unsup',
    why: 'There are no topic labels to learn from. The program must discover the groups itself: unsupervised.',
  },
  {
    id: 'digits',
    text: 'Read handwritten postcodes after training on 60,000 digit images, each tagged 0 to 9',
    bin: 'sup',
    why: 'Each image is tagged with its digit, the right answer. Labels mean supervised.',
  },
  {
    id: 'fraud',
    text: 'Spot strange card payments when no past payment has been marked as fraud',
    bin: 'unsup',
    why: 'There are no fraud labels, so it learns what “normal” looks like and flags what doesn’t fit. No labels means unsupervised.',
  },
  {
    id: 'traffic',
    text: 'Tune traffic-light timings by trying plans and being rewarded when queues get shorter',
    bin: 'rl',
    why: 'It tries actions and receives a reward (shorter queues). Learning from rewards is reinforcement learning.',
  },
]

export default function LearningTypesSorter() {
  const [placed, setPlaced] = useState<Record<string, Bin>>({})
  const [slips, setSlips] = useState(0)
  const [msg, setMsg] = useState<{ kind: 'ok' | 'bad'; text: ReactNode } | null>(null)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const [deck, setDeck] = useState(0)

  const sort = useDropSort((id, zone) => {
    const card = CARDS.find((c) => c.id === id)
    if (!card || !BINS.some((b) => b.id === zone)) return
    if (zone === card.bin) {
      const next = { ...placed, [id]: card.bin }
      setPlaced(next)
      const done = Object.keys(next).length === CARDS.length
      setMsg({
        kind: 'ok',
        text: (
          <>
            <strong>{BINS.find((b) => b.id === card.bin)!.clue}:</strong> {card.why}
            {done && <> All nine sorted with {slips} {slips === 1 ? 'slip' : 'slips'}. One question did all the work: answers, no answers, or rewards?</>}
          </>
        ),
      })
    } else {
      setSlips((n) => n + 1)
      sort.shake(id)
      setMsg({
        kind: 'bad',
        text: (
          <>
            Not quite, it bounced back. Ask three questions: does it get the right answer for each example, no answers at all, or rewards after its actions?
            Read the card again for the clue.
          </>
        ),
      })
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
  const ghostCard = sort.ghost && CARDS.find((c) => c.id === sort.ghost!.id)

  return (
    <Figure
      title="Supervised, unsupervised or reinforcement?"
      caption={
        <>
          Sort all nine. For these scenarios you don't need the algorithm's name: the type of learning is decided by <strong>what the data gives you</strong>.
          Right answers (labels) mean supervised, no answers mean unsupervised, and rewards after actions mean reinforcement.
        </>
      }
    >
      <div className={s.wrap} ref={wrapRef}>
        <div className={s.trayLabel}>
          {!left.length
            ? 'All scenarios sorted'
            : narrow
              ? `Scenario ${CARDS.length - left.length + 1} of ${CARDS.length}: tap the bin it belongs in`
              : `Scenarios to sort (${left.length} left)`}
        </div>
        {narrow && current ? (
          <div className={s.deck}>
            <button
              type="button"
              aria-pressed="true"
              className={[s.card, s.cardSelected, sort.shakeId === current.id ? s.shake : ''].join(' ')}
              {...sort.cardHandlers(current.id)}
            >
              {current.text}
            </button>
            {left.length > 1 && (
              <button type="button" className={s.skip} onClick={() => (setDeck((d) => d + 1), sort.setSelected(null))} aria-label="Skip to the next scenario">
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
                {c.text}
              </button>
            ))}
            {left.length === 0 && <span className={s.trayDone}>Press “Start again” to replay.</span>}
          </div>
        )}
        <div className={s.bins} onClick={(e) => sort.onZoneClick(e, narrow ? current?.id : null)}>
          {BINS.map((b) => {
            const here = CARDS.filter((c) => placed[c.id] === b.id)
            return (
              <div
                key={b.id}
                data-zone={b.id}
                className={[s.bin, armed ? s.targetable : '', sort.hover === b.id ? s.hovered : ''].join(' ')}
                style={{ '--zc': b.color } as CSSProperties}
              >
                <button type="button" className={s.zoneHead} aria-label={`${b.title} learning${armed ? ': place the scenario here' : ''}`}>
                  <span className={s.zoneTitle}>{b.title}</span>
                  <span className={s.zoneBlurb}>{b.blurb}</span>
                  <span className={s.clue}>clue: {b.clue}</span>
                </button>
                <div className={s.binChips}>
                  {here.map((c) => (
                    <span key={c.id} className={s.binChip}>
                      {c.text}
                    </span>
                  ))}
                  {here.length === 0 && armed && <span className={s.dropHint}>drop here</span>}
                </div>
              </div>
            )
          })}
        </div>
        <div className={[s.feedback, msg?.kind === 'ok' ? s.feedbackOk : msg?.kind === 'bad' ? s.feedbackBad : ''].join(' ')} aria-live="polite">
          {msg
            ? msg.text
            : narrow
              ? 'Tap the bin this scenario belongs in. Look for the clue: labels, no labels, or rewards.'
              : 'Pick a scenario (click it, or drag it with the mouse), then drop it into a bin. Look for the clue: labels, no labels, or rewards.'}
        </div>
        <div className={s.bar}>
          <span className={s.score}>
            {Object.keys(placed).length} of {CARDS.length} sorted · {slips} {slips === 1 ? 'slip' : 'slips'}
          </span>
          <Button onClick={reset}>Start again</Button>
        </div>
      </div>
      {ghostCard && sort.ghost && (
        <div className={s.ghost} style={{ left: sort.ghost.x, top: sort.ghost.y }} aria-hidden="true">
          {ghostCard.text}
        </div>
      )}
    </Figure>
  )
}
