import { useState } from 'react'
import { Figure, Button, M } from '../../../../../kit'
import d from '../drill-linear-algebra/drill.module.css'

/*
  Derivative flashcards with a simple spaced-repetition (Leitner) schedule.
  Every card sits in one of four boxes. "I knew it" moves it up a box and pushes its next review
  further away; "I missed it" sends it back to box 1, two cards from now.
*/

interface Card {
  front: string
  back: string
  note: string
}

const CARDS: Card[] = [
  { front: '\\dfrac{d}{dx}\\,x^n', back: 'n\\,x^{n-1}', note: 'Power rule: bring the power down, then lower it by one.' },
  { front: '\\dfrac{d}{dx}\\,(5x + 3)', back: '5', note: 'A constant has slope 0; a line’s slope is its coefficient.' },
  { front: '\\dfrac{d^2}{dx^2}\\,x^3', back: '6x', note: 'Differentiate twice: 3x² first, then 6x.' },
  { front: '\\dfrac{d}{dx}\\,\\dfrac{1}{x}', back: '-\\dfrac{1}{x^2}', note: 'Write 1/x as x⁻¹ and use the power rule.' },
  { front: '\\dfrac{d}{dx}\\,\\sqrt{x}', back: '\\dfrac{1}{2\\sqrt{x}}', note: '√x = x^½, so the power rule gives ½ x^(−½).' },
  { front: '\\dfrac{d}{dx}\\,e^x', back: 'e^x', note: 'The function that is its own slope.' },
  { front: '\\dfrac{d}{dx}\\,e^{-x}', back: '-e^{-x}', note: 'Chain rule: the inside, −x, has slope −1.' },
  { front: '\\dfrac{d}{dx}\\,\\ln x', back: '\\dfrac{1}{x}', note: 'Defined for x > 0. Behind every log-loss gradient.' },
  { front: '\\dfrac{d}{dx}\\,\\sigma(x),\\ \\ \\sigma(x) = \\dfrac{1}{1 + e^{-x}}', back: '\\sigma(x)\\,\\bigl(1 - \\sigma(x)\\bigr)', note: 'Largest at x = 0: 0.5 × 0.5 = 0.25. That cap of ¼ is why deep sigmoid nets lose their gradients.' },
  { front: '\\dfrac{d}{dx}\\,\\tanh x', back: '1 - \\tanh^2 x', note: 'Largest at x = 0, where it equals 1.' },
  { front: '\\dfrac{d}{dx}\\,\\operatorname{ReLU}(x) = \\dfrac{d}{dx}\\max(0, x)', back: '\\begin{cases} 0 & x < 0 \\\\ 1 & x > 0 \\end{cases}', note: 'Undefined at exactly 0 (libraries use 0 there). Slope 1 means gradients pass through unshrunk.' },
  { front: '\\nabla_{\\mathbf{x}}\\,\\lVert \\mathbf{x} \\rVert^2', back: '2\\mathbf{x}', note: '‖x‖² = x₁² + x₂² + …, and each xᵢ² differentiates to 2xᵢ.' },
  { front: '\\nabla\\,(x^2 + y^2)', back: '[\\,2x,\\ 2y\\,]', note: 'One partial derivative per variable, stacked into a vector.' },
  { front: '\\dfrac{\\partial}{\\partial w}\\,(wx - y)^2', back: '2\\,(wx - y)\\,x', note: 'Chain rule: the outer square gives 2(wx − y); the inside, wx − y, has slope x.' },
  { front: '\\dfrac{\\partial}{\\partial x}\\,(x^2 y + 3x)', back: '2xy + 3', note: 'Treat y as a constant while you differentiate in x.' },
  { front: '\\dfrac{\\partial}{\\partial y}\\,(x^2 y)', back: 'x^2', note: 'Now x is the constant: x² y is “a number times y”.' },
  { front: '\\dfrac{d}{dx}\\,f\\bigl(g(x)\\bigr)', back: "f'\\bigl(g(x)\\bigr)\\cdot g'(x)", note: 'The chain rule: outside slope (at the inside value) times inside slope.' },
  {
    front: '\\dfrac{\\partial L}{\\partial z},\\ \\ L = -\\bigl[y\\ln p + (1-y)\\ln(1-p)\\bigr],\\ p = \\sigma(z)',
    back: 'p - y',
    note: 'Binary cross-entropy after a sigmoid: the σ(1 − σ) terms cancel, leaving prediction minus label.',
  },
]

const BOXES = ['Learning', 'Again soon', 'Getting there', 'Known']
const INTERVAL = [2, 4, 8, 16] // turns until the next review, by box
const BOX_COLOUR = ['var(--viz-neg)', 'var(--viz-2)', 'var(--viz-1)', 'var(--viz-pos)']

interface Sched {
  box: number[]
  due: number[]
  turn: number
  current: number
  flipped: boolean
  last: null | { card: number; knew: boolean; back: number }
  reviews: number
}

const initial = (): Sched => ({ box: CARDS.map(() => 0), due: CARDS.map((_, i) => i), turn: 0, current: 0, flipped: false, last: null, reviews: 0 })

function pickNext(box: number[], due: number[], exclude: number): number {
  let best = -1
  for (let i = 0; i < CARDS.length; i++) {
    if (i === exclude && CARDS.length > 1) continue
    if (best < 0 || due[i] < due[best] || (due[i] === due[best] && box[i] < box[best])) best = i
  }
  return best
}

export default function FlashcardDrill() {
  const [s, setS] = useState<Sched>(initial)
  const card = CARDS[s.current]

  const grade = (knew: boolean) =>
    setS((p) => {
      const box = p.box.slice()
      const due = p.due.slice()
      const turn = p.turn + 1
      box[p.current] = knew ? Math.min(3, box[p.current] + 1) : 0
      due[p.current] = turn + INTERVAL[box[p.current]]
      const next = pickNext(box, due, p.current)
      return { box, due, turn, current: next, flipped: false, last: { card: p.current, knew, back: INTERVAL[box[p.current]] }, reviews: p.reviews + 1 }
    })

  const known = s.box.filter((b) => b === 3).length

  return (
    <Figure
      title="Derivative flashcards with spaced repetition"
      caption={
        <>
          Say the derivative out loud, then tap the card to flip it and grade yourself honestly. A card you knew moves up a box and comes back later; a card you missed drops to{' '}
          <strong>Learning</strong> and comes back after a couple of other cards. Keep going until all {CARDS.length} cards reach <strong>Known</strong>: that is the whole list the Prelim draws on.
        </>
      }
    >
      <div className={d.wrap} style={{ justifyItems: 'center' }}>
        <div className={d.boxes}>
          {BOXES.map((name, b) => {
            const ids = CARDS.map((_, i) => i).filter((i) => s.box[i] === b)
            return (
              <div key={name} className={d.box} style={{ borderColor: `color-mix(in srgb, ${BOX_COLOUR[b]} 45%, var(--rule))` }}>
                <span className={d.boxTitle}>{name}</span>
                <span className={d.boxCount}>{ids.length}</span>
                <span className={d.pips} aria-hidden="true">
                  {ids.map((i) => (
                    <span
                      key={i}
                      className={d.pip}
                      style={{ background: BOX_COLOUR[b], outline: i === s.current ? '2px solid var(--viz-ink)' : 'none', outlineOffset: 1 }}
                    />
                  ))}
                </span>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          className={`${d.card}${s.flipped ? ` ${d.cardBack}` : ''}`}
          onClick={() => setS((p) => ({ ...p, flipped: !p.flipped }))}
          aria-label={s.flipped ? 'Card back: the derivative. Tap to see the front again.' : 'Card front. Tap to flip and see the derivative.'}
        >
          <span className={d.label}>{s.flipped ? 'Answer' : `Card ${s.current + 1} of ${CARDS.length} · box: ${BOXES[s.box[s.current]]}`}</span>
          <span style={{ fontSize: '1.15rem', overflowX: 'auto', maxWidth: '100%' }}>
            <M>{card.front}</M>
          </span>
          {s.flipped ? (
            <>
              <span style={{ fontSize: '1.3rem' }}>
                <M>{`= ${card.back}`}</M>
              </span>
              <span className={d.small}>{card.note}</span>
            </>
          ) : (
            <span className={d.small}>Say it, then tap to flip</span>
          )}
        </button>

        <div className={d.row} style={{ justifyContent: 'center' }}>
          {s.flipped ? (
            <>
              <Button primary onClick={() => grade(true)}>
                I knew it
              </Button>
              <Button onClick={() => grade(false)}>I missed it</Button>
            </>
          ) : (
            <Button primary onClick={() => setS((p) => ({ ...p, flipped: true }))}>
              Flip
            </Button>
          )}
          <Button onClick={() => setS(initial())}>Reset</Button>
        </div>

        <div className={d.small} aria-live="polite" style={{ textAlign: 'center' }}>
          {s.last ? (
            <>
              {s.last.knew ? 'Moved up a box' : 'Back to Learning'}: that card is due again in about <strong>{s.last.back}</strong> cards.{' '}
            </>
          ) : null}
          Reviews <strong className="tabular">{s.reviews}</strong> · known <strong className="tabular">{known}</strong> of {CARDS.length}
          {known === CARDS.length && <strong> · every card known. Come back tomorrow and check they stay there.</strong>}
        </div>
      </div>
    </Figure>
  )
}
