import { useState } from 'react'
import { Figure, Readout, Button } from '../../../../../kit'
import s from './dts.module.css'

/*
  Sort six types into "mutable" and "immutable". Sorting a card runs a real attempt to change the
  object in place, so the learner sees the list update and the tuple refuse (TypeError).
  Every message below is copied from Python 3.13.
*/

interface Card {
  type: string
  mutable: boolean
  setup: string
  change: string
  /** printed value of x after a successful change */
  after?: string
  error?: string
  /** for immutable types: Python's way of getting a "changed" value (a new object) */
  rebuild?: string
  rebuilt?: string
  note: string
  /** result of using the ORIGINAL x as a dict key: {x: 'ok'} */
  asKey: string
  keyOk: boolean
}

const CARDS: Card[] = [
  {
    type: 'list',
    mutable: true,
    setup: 'x = [3, 4, 5]',
    change: 'x[0] = 9',
    after: '[9, 4, 5]',
    note: 'The same list object now holds new contents.',
    asKey: "TypeError: unhashable type: 'list'",
    keyOk: false,
  },
  {
    type: 'tuple',
    mutable: false,
    setup: 'x = (3, 4, 5)',
    change: 'x[0] = 9',
    error: "TypeError: 'tuple' object does not support item assignment",
    rebuild: 'x = (9,) + x[1:]',
    rebuilt: '(9, 4, 5)',
    note: 'To "change" a tuple you build a new one and point x at it.',
    asKey: "{(3, 4, 5): 'ok'}",
    keyOk: true,
  },
  {
    type: 'dict',
    mutable: true,
    setup: "x = {'kopi': 1.2}",
    change: "x['teh'] = 1.1",
    after: "{'kopi': 1.2, 'teh': 1.1}",
    note: 'Adding or replacing a key changes the dict in place.',
    asKey: "TypeError: unhashable type: 'dict'",
    keyOk: false,
  },
  {
    type: 'str',
    mutable: false,
    setup: "x = 'kopi'",
    change: "x[0] = 'K'",
    error: "TypeError: 'str' object does not support item assignment",
    rebuild: "x = 'K' + x[1:]",
    rebuilt: "'Kopi'",
    note: 'String methods such as .upper() also return a new string.',
    asKey: "{'kopi': 'ok'}",
    keyOk: true,
  },
  {
    type: 'set',
    mutable: true,
    setup: 'x = {3, 4, 5}',
    change: 'x.add(6)',
    after: '{3, 4, 5, 6}',
    note: 'Sets have no positions (x[0] fails), but .add() and .remove() change them in place.',
    asKey: "TypeError: unhashable type: 'set'",
    keyOk: false,
  },
  {
    type: 'int',
    mutable: false,
    setup: 'x = 5',
    change: 'x += 1',
    after: '6',
    note: 'It looks like a change, but the 5 was never altered: Python made a brand-new int 6 and moved the name x to it. An int has no parts you can change.',
    asKey: "{5: 'ok'}",
    keyOk: true,
  },
]

type Guess = 'mut' | 'imm'

export default function MutabilitySorter() {
  const [guesses, setGuesses] = useState<Record<string, Guess>>({ list: 'mut' })
  const sorted = CARDS.filter((c) => guesses[c.type])
  const correct = sorted.filter((c) => (guesses[c.type] === 'mut') === c.mutable).length

  return (
    <Figure
      title="Sort the types: can it change in place?"
      caption={
        <>
          For each card, decide whether the type is mutable or immutable. Your choice runs the code on the card, so you see Python either change the object
          or refuse with a <span className={s.mono}>TypeError</span>. Notice the pattern in the last line of each card too: only immutable objects can be dictionary
          keys.
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.cards}>
          {CARDS.map((c) => {
            const g = guesses[c.type]
            const right = g && (g === 'mut') === c.mutable
            return (
              <div key={c.type} className={`${s.card} ${g ? (c.mutable ? s.cardMut : s.cardImm) : ''}`}>
                <div className={s.cardHead}>
                  <span className={s.typeName}>{c.type}</span>
                  {g && (
                    <span className={s.verdict} style={{ color: right ? 'var(--viz-pos)' : 'var(--viz-neg)' }}>
                      {right ? '✓ ' : '✗ '}
                      {c.mutable ? 'mutable' : 'immutable'}
                    </span>
                  )}
                </div>
                <pre className={s.cardCode}>
                  {c.setup}
                  {'\n'}
                  {c.change}
                  {g && (
                    <>
                      {'\n'}
                      {c.error ? (
                        <span className={s.err}>{c.error}</span>
                      ) : (
                        <>
                          print(x) <span className={s.comment}>#</span> <span className={s.out}>{c.after}</span>
                        </>
                      )}
                      {c.rebuild && (
                        <>
                          {'\n'}
                          {c.rebuild} <span className={s.comment}># new object:</span> <span className={s.out}>{c.rebuilt}</span>
                        </>
                      )}
                    </>
                  )}
                </pre>
                {g ? (
                  <>
                    <div className={s.note}>{c.note}</div>
                    <div className={s.note}>
                      As a dict key, <span className={s.mono}>{'{x: \'ok\'}'}</span>:{' '}
                      <span className={`${s.mono} ${c.keyOk ? s.ok : s.err}`}>{c.keyOk ? `works, ${c.asKey}` : c.asKey}</span>
                    </div>
                  </>
                ) : (
                  <div className={s.cardBtns}>
                    <button type="button" className={s.sortBtn} onClick={() => setGuesses({ ...guesses, [c.type]: 'mut' })}>
                      mutable
                    </button>
                    <button type="button" className={s.sortBtn} onClick={() => setGuesses({ ...guesses, [c.type]: 'imm' })}>
                      immutable
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className={s.bins}>
          <div className={`${s.bin} ${s.binMut}`}>
            <div className={s.binTitle} style={{ color: 'var(--viz-1)' }}>
              Mutable: can be changed in place
            </div>
            <div className={s.binItems}>
              {sorted
                .filter((c) => c.mutable)
                .map((c) => (
                  <span key={c.type} className={s.tag}>
                    {c.type}
                  </span>
                ))}
            </div>
          </div>
          <div className={`${s.bin} ${s.binImm}`}>
            <div className={s.binTitle} style={{ color: 'var(--viz-2)' }}>
              Immutable: a "change" makes a new object
            </div>
            <div className={s.binItems}>
              {sorted
                .filter((c) => !c.mutable)
                .map((c) => (
                  <span key={c.type} className={s.tag}>
                    {c.type}
                  </span>
                ))}
            </div>
          </div>
        </div>
        <div className={s.row} style={{ justifyContent: 'space-between' }}>
          <Readout
            items={[
              ['sorted', `${sorted.length} of ${CARDS.length}`],
              ['your sorts correct', `${correct} of ${sorted.length}`],
            ]}
          />
          <Button onClick={() => setGuesses({ list: 'mut' })}>Reset</Button>
        </div>
      </div>
    </Figure>
  )
}
