import { useId, useState, type ReactNode } from 'react'
import { Figure, Controls, Button, Readout } from '../../../../../kit'
import { CatScene, ChestXray, DigitSix, SatelliteTile, TurnLeftSign } from './drawings'
import css from './tl.module.css'

/*
  Predict, then reveal: is this augmentation safe for this task? Five example cards × four
  augmentations. Each verdict is one of: use it (label still true, variation is realistic),
  breaks the label (the image now shows a different class, or the evidence is gone), or
  unrealistic (label survives, but test images never look like this).
  Aha: good augmentation encodes domain knowledge about which changes do not matter.
*/

type AugKey = 'hflip' | 'vflip' | 'rot' | 'bright'
type Verdict = 'use' | 'breaks' | 'odd'

const AUGS: { key: AugKey; short: ReactNode; name: string }[] = [
  { key: 'hflip', short: <>flip ↔</>, name: 'horizontal flip' },
  { key: 'vflip', short: <>flip ↕</>, name: 'vertical flip' },
  { key: 'rot', short: <>rotate 10°</>, name: 'small rotation (10°)' },
  { key: 'bright', short: <>strong light</>, name: 'strong brightness and contrast change' },
]

interface Card {
  key: string
  name: string
  label: string
  draw: (aug: AugKey | null) => ReactNode
  verdicts: Record<AugKey, [Verdict, string]>
}

/**
 * Geometric augmentations as SVG transforms. The strong light change multiplies contrast by 0.3
 * and brightness by 1.6 (a linear change of the pixel values; nothing clips at these settings).
 * The X-ray applies the same change to its own pixel values: the nodule-to-lung difference drops
 * from 0.11 to about 0.05, so the faint nodule becomes much harder to see.
 */
const SLOPE = 0.3 * 1.6
const INTERCEPT = 0.5 * (1 - 0.3) * 1.6

function Geo({ aug, children }: { aug: AugKey | null; children: ReactNode }) {
  const id = useId().replace(/:/g, '')
  const t = aug === 'hflip' ? 'translate(100 0) scale(-1 1)' : aug === 'vflip' ? 'translate(0 100) scale(1 -1)' : aug === 'rot' ? 'rotate(10 50 50)' : undefined
  return (
    <>
      {aug === 'bright' && (
        <filter id={`sl${id}`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="linear" slope={SLOPE} intercept={INTERCEPT} />
            <feFuncG type="linear" slope={SLOPE} intercept={INTERCEPT} />
            <feFuncB type="linear" slope={SLOPE} intercept={INTERCEPT} />
          </feComponentTransfer>
        </filter>
      )}
      <rect x={0} y={0} width={100} height={100} style={{ fill: 'var(--surface-3)' }} />
      <g transform={t} filter={aug === 'bright' ? `url(#sl${id})` : undefined}>
        {children}
      </g>
    </>
  )
}

const geo = (aug: AugKey | null, child: ReactNode) => <Geo aug={aug}>{child}</Geo>

const CARDS: Card[] = [
  {
    key: 'six',
    name: 'Digit',
    label: '6',
    draw: (a) => geo(a, <DigitSix />),
    verdicts: {
      hflip: ['odd', 'A back-to-front 6 is not something people write. Mirroring digits creates shapes the model never meets in real data (and turns some digits into other symbols).'],
      vflip: ['breaks', 'The loop is now at the top, so it looks like a (back-to-front) 9, and a digit model would read it as one. The image no longer matches its label "6". Rotating by 180° gives an exact 9.'],
      rot: ['use', 'Handwriting is often slanted by a few degrees, so a small rotation is realistic and the digit is still clearly a 6.'],
      bright: ['use', 'Faint or heavy ink and dim scans happen; the shape, which is what decides the digit, is unchanged.'],
    },
  },
  {
    key: 'sign',
    name: 'Road sign',
    label: 'turn left',
    draw: (a) => geo(a, <TurnLeftSign />),
    verdicts: {
      hflip: ['breaks', 'The arrow now points right: this is a "turn right" sign. Training on it with the label "turn left" teaches the model the wrong thing.'],
      vflip: ['odd', 'The arrowhead still points left, but the stem now comes down from the top, so this is no longer the standard "turn left" sign, and no camera ever sees an upside-down sign anyway. Avoid it.'],
      rot: ['use', 'A tilted camera or a slightly bent post gives exactly this view, and the meaning is unchanged.'],
      bright: ['use', 'Signs are seen at dusk, in glare and in rain. Lighting changes are realistic and do not change the arrow.'],
    },
  },
  {
    key: 'xray',
    name: 'X-ray',
    label: 'nodule present',
    draw: (a) =>
      a === 'bright' ? (
        <ChestXray contrast={0.3} brightness={1.6} />
      ) : (
        geo(a, <ChestXray />)
      ),
    verdicts: {
      hflip: ['odd', 'The nodule is still there, but the heart now appears on the wrong side. X-rays are taken in a standard orientation, and any label that mentions left or right would now be wrong.'],
      vflip: ['odd', 'Still has a nodule, but nobody takes an X-ray upside down. The model would spend effort learning a view it never sees.'],
      rot: ['use', 'Patients never stand perfectly straight, so a few degrees of rotation is realistic and keeps every finding.'],
      bright: ['breaks', 'The faint spot is now barely distinguishable from the washed-out lung. In an X-ray, brightness is the evidence (it shows tissue density), so strong intensity changes can hide a finding or fake one, and the image may no longer support the label "nodule present".'],
    },
  },
  {
    key: 'cat',
    name: 'Pet photo',
    label: 'cat',
    draw: (a) => geo(a, <CatScene />),
    verdicts: {
      hflip: ['use', 'A cat facing left is just as much a cat as one facing right. This is the classic safe augmentation for photos.'],
      vflip: ['odd', 'Still a cat, but upside-down cats almost never appear in real photos, so this rarely helps and is usually left out.'],
      rot: ['use', 'Photos are often taken at a slight angle. Still a cat.'],
      bright: ['use', 'Indoor, outdoor, night and flash photos all show cats in very different lighting. Still a cat.'],
    },
  },
  {
    key: 'sat',
    name: 'Satellite',
    label: 'river',
    draw: (a) => geo(a, <SatelliteTile />),
    verdicts: {
      hflip: ['use', 'Seen from directly above, there is no natural left or right. Any flip is a view the satellite could really take.'],
      vflip: ['use', 'From above there is no "up" either, so a vertical flip is perfectly realistic here, unlike for photos of cats.'],
      rot: ['use', 'Any rotation is safe for overhead images: the river is a river at every angle.'],
      bright: ['use', 'Sun angle, haze and season change the brightness of every tile, so this is realistic.'],
    },
  },
]

const VERDICT_TEXT: Record<Verdict, string> = {
  use: 'Use it',
  breaks: 'Avoid: breaks the label',
  odd: 'Avoid: unrealistic',
}
const SYMBOL: Record<Verdict, string> = { use: '✓', breaks: '✗', odd: '~' }

function Img({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={label} style={{ width: '100%', maxWidth: 150, height: 'auto', display: 'block', borderRadius: 6 }}>
      {children}
    </svg>
  )
}

export default function LabelSafetyCheck() {
  const [sel, setSel] = useState<[number, number]>([0, 1])
  const [answers, setAnswers] = useState<Record<string, 'use' | 'avoid'>>({})
  const [revealAll, setRevealAll] = useState(false)
  const card = CARDS[sel[0]]
  const aug = AUGS[sel[1]]
  const cellKey = (i: number, j: number) => `${CARDS[i].key}:${AUGS[j].key}`
  const myAnswer = answers[cellKey(sel[0], sel[1])]
  const [verdict, reason] = card.verdicts[aug.key]
  const shown = revealAll || myAnswer != null
  const correct = myAnswer != null && (myAnswer === 'use') === (verdict === 'use')

  const answered = Object.keys(answers)
  const nRight = answered.filter((k) => {
    const [ck, ak] = k.split(':')
    const c = CARDS.find((x) => x.key === ck)!
    return (answers[k] === 'use') === (c.verdicts[ak as AugKey][0] === 'use')
  }).length

  const goNext = () => {
    for (let n = 1; n <= CARDS.length * AUGS.length; n++) {
      const idx = (sel[0] * AUGS.length + sel[1] + n) % (CARDS.length * AUGS.length)
      const i = Math.floor(idx / AUGS.length)
      const j = idx % AUGS.length
      if (answers[cellKey(i, j)] == null) {
        setSel([i, j])
        return
      }
    }
  }

  return (
    <Figure
      title="Does the label survive? Predict, then reveal"
      caption={
        <>
          Pick a cell: a task (row) and an augmentation (column). Decide whether you would use that augmentation for that task, then check. Green ✓ means use it,
          red ✗ means it breaks the label, amber ~ means the label survives but real test images never look like that. Notice that the same flip is fine for one task
          and wrong for another: the right choice depends on the domain.
        </>
      }
    >
      <div className={css.lsTable} role="grid" aria-label="Tasks by augmentations">
        <div className={css.lsRow}>
          <span />
          {AUGS.map((a) => (
            <span key={a.key} className={css.lsColHead}>
              {a.short}
            </span>
          ))}
        </div>
        {CARDS.map((c, i) => (
          <div key={c.key} className={css.lsRow} role="row">
            <div className={css.lsRowHead}>
              <svg viewBox="0 0 100 100" aria-hidden="true" style={{ width: 30, height: 30, borderRadius: 4, flex: 'none' }}>
                {c.draw(null)}
              </svg>
              <span>
                <b>{c.name}</b>“{c.label}”
              </span>
            </div>
            {AUGS.map((a, j) => {
              const k = cellKey(i, j)
              const v = c.verdicts[a.key][0]
              const vis = revealAll || answers[k] != null
              const isSel = sel[0] === i && sel[1] === j
              return (
                <button
                  key={a.key}
                  type="button"
                  role="gridcell"
                  aria-label={`${c.name}, ${a.name}${vis ? `: ${VERDICT_TEXT[v]}` : ''}`}
                  className={`${css.lsCell}${isSel ? ` ${css.sel}` : ''}${vis ? ` ${css[v]}` : ''}`}
                  onClick={() => setSel([i, j])}
                >
                  {vis ? SYMBOL[v] : '?'}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className={css.lsPanel}>
        <div className={css.lsPair}>
          <div style={{ display: 'grid', gap: 2, justifyItems: 'center', width: '100%' }}>
            <Img label={`Original: ${card.name}`}>{card.draw(null)}</Img>
            <span className={css.small}>original: “{card.label}”</span>
          </div>
          <div className={css.lsArrow}>
            {aug.name}
            <br />→
          </div>
          <div style={{ display: 'grid', gap: 2, justifyItems: 'center', width: '100%' }}>
            <Img label={`${card.name} after ${aug.name}`}>{card.draw(aug.key)}</Img>
            <span className={css.small}>still “{card.label}”?</span>
          </div>
        </div>
        {!shown ? (
          <>
            <div className={css.lsQ}>
              Would you use <b>{aug.name}</b> to train a model that labels this as “{card.label}”?
            </div>
            <div className={css.lsBtns}>
              <Button primary onClick={() => setAnswers((o) => ({ ...o, [cellKey(sel[0], sel[1])]: 'use' }))}>
                Use it
              </Button>
              <Button primary onClick={() => setAnswers((o) => ({ ...o, [cellKey(sel[0], sel[1])]: 'avoid' }))}>
                Avoid it
              </Button>
            </div>
          </>
        ) : (
          <div className={css.lsQ} aria-live="polite" style={{ textAlign: 'left' }}>
            {myAnswer != null && <b style={{ color: correct ? 'var(--viz-pos)' : 'var(--viz-neg)' }}>{correct ? 'You got it. ' : 'Not quite. '}</b>}
            <b>{VERDICT_TEXT[verdict]}.</b> {reason}
          </div>
        )}
      </div>

      <div className={css.lsKey}>
        <span>
          <span className={css.swatch} style={{ background: 'color-mix(in srgb, var(--viz-pos) 22%, var(--surface))', borderColor: 'var(--viz-pos)' }} />✓ use it
        </span>
        <span>
          <span className={css.swatch} style={{ background: 'color-mix(in srgb, var(--viz-neg) 22%, var(--surface))', borderColor: 'var(--viz-neg)' }} />✗ breaks the label
        </span>
        <span>
          <span className={css.swatch} style={{ background: 'color-mix(in srgb, var(--viz-6) 22%, var(--surface))', borderColor: 'var(--viz-6)' }} />~ label survives, but unrealistic
        </span>
      </div>
      <Controls>
        <Button onClick={goNext}>Next unanswered</Button>
        <Button onClick={() => setRevealAll((v) => !v)}>{revealAll ? 'Hide answers' : 'Reveal all'}</Button>
        <Button
          onClick={() => {
            setAnswers({})
            setRevealAll(false)
            setSel([0, 1])
          }}
        >
          Reset
        </Button>
      </Controls>
      <Readout items={[['your score', `${nRight} / ${answered.length} answered`]]} />
    </Figure>
  )
}
