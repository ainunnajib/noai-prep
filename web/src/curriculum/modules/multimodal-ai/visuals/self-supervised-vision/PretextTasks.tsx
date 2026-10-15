import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Segmented, Button, mulberry32, shuffled, useNarrow } from '../../../../../kit'
import { PICTURES } from './pictures'
import css from './ssl.module.css'

/*
  Pretext tasks: four ways to turn an UNLABELLED photo into a question with a known answer.
  A small program makes the input and the answer; no person labels anything.
  The learner can try the rotation task themselves (guess the angle), and reveal the answer
  ("free label") for every task.
*/

type Task = 'rotation' | 'jigsaw' | 'colour' | 'mask'
const ANGLES = [0, 90, 180, 270]
const S3 = 100 / 3

const CODE: Record<Task, string> = {
  rotation: '# pick 0, 1, 2 or 3 quarter-turns\nk = random.randint(0, 3)\nx = rotate(image, 90 * k)\ny = k   # the label (4 classes)',
  jigsaw: '# pick one way to shuffle 9 tiles\np = random.choice(shuffles)\nx = shuffle_tiles(image, p)\ny = p   # the label: which shuffle',
  colour: 'x = to_greyscale(image)\ny = image   # the label: the colours',
  mask: '# hide 12 of the 16 patches\nhidden = random.sample(range(16), 12)\nx = blank_out(image, hidden)\ny = image[hidden]   # the label',
}

const WHY: Record<Task, string> = {
  rotation: 'To say which way is up, the network has to recognise things: skies go on top, cats stand on their paws, cars sit on their wheels.',
  jigsaw: 'To put the tiles back, it has to know how parts fit together: ears go above eyes, wheels go under the car body.',
  colour: 'To colour it in, it has to recognise what each region is: leaves are green, the sea is blue, the cat is ginger.',
  mask: 'To fill in the gaps, it has to understand the whole scene, not just copy neighbouring pixels. This is the idea behind MAE, later in this lesson.',
}

function Pic({ index, children, grey, label }: { index: number; children?: ReactNode; grey?: boolean; label: string }) {
  const { Draw } = PICTURES[index]
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={label} className={`${css.pic} ${grey ? css.grey : ''}`}>
      {children ?? <Draw />}
    </svg>
  )
}

export default function PretextTasks() {
  const [task, setTask] = useState<Task>('rotation')
  const [k, setK] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [guess, setGuess] = useState<number | null>(null)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(320)

  const pic = k % PICTURES.length
  const name = PICTURES[pic].name
  const { Draw } = PICTURES[pic]
  const ex = useMemo(() => {
    const r = mulberry32(4242 + k * 131)
    const angleIdx = Math.floor(r() * 4)
    const perm = shuffled([0, 1, 2, 3, 4, 5, 6, 7, 8], r)
    const hidden = new Set(shuffled(Array.from({ length: 16 }, (_, i) => i), r).slice(0, 12))
    return { angleIdx, perm, hidden }
  }, [k])

  const next = () => {
    setK((x) => x + 1)
    setRevealed(false)
    setGuess(null)
  }
  const changeTask = (t: Task) => {
    setTask(t)
    setRevealed(false)
    setGuess(null)
  }
  const show = revealed || guess !== null

  // ---------- the input the network sees ----------
  let input: ReactNode
  let answer: ReactNode
  if (task === 'rotation') {
    const a = ANGLES[ex.angleIdx]
    input = (
      <Pic index={pic} label={`The ${name} picture, rotated by an unknown angle`}>
        <g transform={`rotate(${a} 50 50)`}>
          <Draw />
        </g>
      </Pic>
    )
    answer = (
      <div className={css.answerBox} style={{ color: 'var(--ink)' }}>
        <div>
          <div className={css.bigLabel}>{a}°</div>
          <div>
            class {ex.angleIdx} of 4 ({a === 0 ? 'upright' : `turned ${a}° clockwise`})
          </div>
        </div>
      </div>
    )
  } else if (task === 'jigsaw') {
    const tiles = (numbers: boolean, order: number[]) =>
      order.map((p, slot) => (
        <g key={slot}>
          <svg x={(slot % 3) * S3 + 0.6} y={Math.floor(slot / 3) * S3 + 0.6} width={S3 - 1.2} height={S3 - 1.2} viewBox={`${(p % 3) * S3} ${Math.floor(p / 3) * S3} ${S3} ${S3}`} preserveAspectRatio="none">
            <Draw />
          </svg>
          {numbers && (
            <text
              x={(slot % 3) * S3 + 4}
              y={Math.floor(slot / 3) * S3 + 11}
              style={{ fontSize: 8, fontWeight: 800, fill: 'var(--ink)', stroke: 'var(--surface)', strokeWidth: 2, paintOrder: 'stroke' }}
            >
              {p + 1}
            </text>
          )}
        </g>
      ))
    input = (
      <Pic index={pic} label={`The ${name} picture cut into 9 tiles and shuffled`}>
        <rect width={100} height={100} style={{ fill: 'var(--surface-2)' }} />
        {tiles(show, ex.perm)}
      </Pic>
    )
    answer = (
      <div className={css.panel}>
        <Pic index={pic} label={`The ${name} picture with its tiles in the right places`}>
          <rect width={100} height={100} style={{ fill: 'var(--surface-2)' }} />
          {tiles(true, [0, 1, 2, 3, 4, 5, 6, 7, 8])}
        </Pic>
        <div className={css.small} style={{ textAlign: 'center' }}>
          label: tile order [{ex.perm.map((p) => p + 1).join(', ')}]
        </div>
      </div>
    )
  } else if (task === 'colour') {
    input = <Pic index={pic} grey label={`The ${name} picture in greyscale`} />
    answer = <Pic index={pic} label={`The ${name} picture in its original colours`} />
  } else {
    const S4 = 25
    input = (
      <Pic index={pic} label={`The ${name} picture with 12 of its 16 patches hidden`}>
        <Draw />
        {[...ex.hidden].map((i) => (
          <rect key={i} x={(i % 4) * S4} y={Math.floor(i / 4) * S4} width={S4} height={S4} style={{ fill: 'var(--surface-3)', stroke: 'var(--surface)', strokeWidth: 0.8 }} />
        ))}
      </Pic>
    )
    answer = (
      <Pic index={pic} label={`The ${name} picture with the hidden patches restored and outlined`}>
        <Draw />
        {[...ex.hidden].map((i) => (
          <rect key={i} x={(i % 4) * S4 + 0.6} y={Math.floor(i / 4) * S4 + 0.6} width={S4 - 1.2} height={S4 - 1.2} style={{ fill: 'none', stroke: 'var(--accent)', strokeWidth: 1.2, strokeDasharray: '3 2' }} />
        ))}
      </Pic>
    )
  }

  return (
    <Figure
      wide
      title="Make a question from a photo with no label"
      caption={
        <>
          Each tab is a <i>pretext task</i>: a program changes an unlabelled photo and keeps the answer. Try the rotation task yourself, then press{' '}
          <b>New photo</b> a few times. Notice that nobody ever typed a label: the answer comes free with the change, so you can make millions of these
          questions from photos scraped from the internet.
        </>
      }
    >
      <Controls>
        <Segmented
          label="pretext task"
          value={task}
          onChange={changeTask}
          options={[
            { value: 'rotation', label: 'rotation' },
            { value: 'jigsaw', label: 'jigsaw' },
            { value: 'colour', label: 'colourise' },
            { value: 'mask', label: 'fill the gaps' },
          ]}
        />
      </Controls>
      <div ref={wrapRef} className={`${css.row} ${narrow ? '' : css.rowTwo}`}>
        <div className={css.panel}>
          <div className={css.panelTitle}>What the network sees (input x)</div>
          {input}
        </div>
        <div className={css.panel}>
          <div className={css.panelTitle}>The free label (answer y)</div>
          {show ? answer : <div className={css.answerBox}>Hidden. {task === 'rotation' ? 'Guess the angle below, or reveal it.' : 'Press "Show the answer".'}</div>}
        </div>
      </div>

      {task === 'rotation' && (
        <div className={css.guessRow} role="group" aria-label="Guess how far the picture was rotated">
          <span className={css.small}>Which way was it turned?</span>
          {ANGLES.map((a, i) => (
            <Button key={a} onClick={() => setGuess(i)} primary={guess === i}>
              {a}°
            </Button>
          ))}
        </div>
      )}
      {task === 'rotation' && guess !== null && (
        <div className={`${css.feedback} ${guess === ex.angleIdx ? css.ok : css.bad}`} role="status">
          {guess === ex.angleIdx ? 'Right! You used what you know about the world to read the label.' : `Not quite: it was ${ANGLES[ex.angleIdx]}°. Look at where the sky and the ground ended up.`}
        </div>
      )}

      <div className={css.code} aria-label="The program that makes the training example">
        {CODE[task]}
      </div>
      <div className={css.why}>{WHY[task]}</div>

      <Controls>
        <Button primary onClick={next}>
          New photo
        </Button>
        <Button onClick={() => (show ? (setRevealed(false), setGuess(null)) : setRevealed(true))}>{show ? 'Hide the answer' : 'Show the answer'}</Button>
      </Controls>
    </Figure>
  )
}
