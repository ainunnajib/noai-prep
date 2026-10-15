import { useMemo, useState } from 'react'
import { Figure, Controls, Button, Plot, Grid, Axes, Arrow, useNarrow, mulberry32, shuffled } from '../../../../../kit'
import { type M2, col, fmtV, mul, ColMat, FShape, WarpedGrid, Clip, TipLabel } from './la'
import s from './lt.module.css'

/*
  "Name that matrix": a picture before (dashed) and after (green) a mystery matrix.
  Read where the grid's unit steps went, pick the matrix, and the columns are revealed.
*/

interface Round {
  m: M2
  name: string
  wrong: M2[]
  why: string
}

const ROUNDS: Round[] = [
  {
    m: [
      [0, -1],
      [1, 0],
    ],
    name: 'rotation by 90° anticlockwise',
    wrong: [
      [
        [0, 1],
        [-1, 0],
      ],
      [
        [-1, 0],
        [0, -1],
      ],
      [
        [0, 1],
        [1, 0],
      ],
    ],
    why: '(1, 0) went up to (0, 1) and (0, 1) went left to (−1, 0). Those are the columns. Its look-alike with the signs swapped turns clockwise instead.',
  },
  {
    m: [
      [1, 1],
      [0, 1],
    ],
    name: 'horizontal shear',
    wrong: [
      [
        [1, 0],
        [1, 1],
      ],
      [
        [2, 0],
        [0, 1],
      ],
      [
        [1, 1],
        [1, 0],
      ],
    ],
    why: '(1, 0) stayed put while (0, 1) slid sideways to (1, 1): every horizontal line slides by its height. The lower-triangular look-alike slides vertical lines up instead.',
  },
  {
    m: [
      [-1, 0],
      [0, 1],
    ],
    name: 'reflection in the y-axis',
    wrong: [
      [
        [1, 0],
        [0, -1],
      ],
      [
        [-1, 0],
        [0, -1],
      ],
      [
        [0, 1],
        [1, 0],
      ],
    ],
    why: '(1, 0) flipped to (−1, 0) and (0, 1) stayed. The F now faces the other way: a mirror image (det = −1). The negative entry sits in the column of the axis that flips, not the mirror line.',
  },
  {
    m: [
      [2, 0],
      [0, 0.5],
    ],
    name: 'scaling: x × 2, y × ½',
    wrong: [
      [
        [0.5, 0],
        [0, 2],
      ],
      [
        [2, 0],
        [0, 2],
      ],
      [
        [1, 0],
        [0, 0.5],
      ],
    ],
    why: 'Both basis arrows stayed on their own axes, so the matrix is diagonal. (1, 0) doubled to (2, 0) and (0, 1) halved to (0, 0.5). Areas are unchanged here: det = 2 × 0.5 = 1.',
  },
  {
    m: [
      [1, 0],
      [0, 0],
    ],
    name: 'projection onto the x-axis',
    wrong: [
      [
        [0, 0],
        [0, 1],
      ],
      [
        [1, 0],
        [0, -1],
      ],
      [
        [1, 1],
        [0, 0],
      ],
    ],
    why: '(1, 0) stayed and (0, 1) was crushed to (0, 0): every point slides straight up or down onto the x-axis, like a shadow cast by a lamp directly overhead. The F is now a flat segment, det = 0, and nothing can undo it.',
  },
  {
    m: [
      [0, 1],
      [1, 0],
    ],
    name: 'reflection in the line y = x',
    wrong: [
      [
        [0, -1],
        [1, 0],
      ],
      [
        [0, -1],
        [-1, 0],
      ],
      [
        [1, 0],
        [0, -1],
      ],
    ],
    why: '(1, 0) went to (0, 1) and (0, 1) went to (1, 0): the coordinates swap. Unlike the 90° rotation, the F is mirrored (det = −1).',
  },
]

// the F is drawn at 3/4 size so that even the sheared and stretched copies fit inside the plot
const F_SIZE: M2 = [
  [0.75, 0],
  [0, 0.75],
]

export default function MatrixMatch() {
  const [round, setRound] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const R = ROUNDS[round]
  const options = useMemo(() => shuffled([R.m, ...R.wrong], mulberry32(31 + round * 7)), [round, R])
  const correctIdx = options.indexOf(R.m)
  const revealed = picked !== null
  const LIM = 2.6

  const choose = (i: number) => {
    if (revealed) return
    setPicked(i)
    setAnswered((a) => a + 1)
    if (i === correctIdx) setScore((v) => v + 1)
  }
  const finished = revealed && round === ROUNDS.length - 1
  const next = () => {
    if (finished) {
      setRound(0)
      setScore(0)
      setAnswered(0)
    } else setRound((r) => r + 1)
    setPicked(null)
  }
  const c1 = col(R.m, 0)
  const c2 = col(R.m, 1)

  return (
    <Figure
      title="Name that matrix"
      caption={
        <>
          <b>Try:</b>
          <ol className="try">
            <li>
              Read where the <span className={s.c1}>blue</span> arrow (1, 0) and the <span className={s.c2}>orange</span> arrow (0, 1) landed.
            </li>
            <li>
              Pick the matrix with those as its <b>columns</b>, then press <b>Next picture</b>.
            </li>
          </ol>
          <b>Notice:</b> the green F moved exactly as the two arrows say.
          <span className="fine">
            The dashed grey F is the picture before. On the projection, the orange arrow has shrunk to nothing.
          </span>
        </>
      }
    >
      <div
        ref={wrapRef}
        style={{
          width: '100%',
          display: 'grid',
          justifyItems: 'center',
          gap: '0.7rem',
        }}
      >
        <Plot
          x={[-LIM, LIM]}
          y={[-LIM, LIM]}
          width={360}
          height={360}
          margin={{ top: 6, right: 6, bottom: 6, left: 6 }}
          ariaLabel={`Picture ${round + 1}: the letter F before and after a mystery matrix`}
        >
          <Grid xTicks={2 * Math.round(LIM)} yTicks={2 * Math.round(LIM)} />
          <Axes origin xTicks={5} yTicks={5} />
          <Clip>
            <WarpedGrid m={R.m} />
            <FShape m={F_SIZE} color="var(--viz-muted)" width={3.5} dash="4 5" />
            <FShape m={mul(R.m, F_SIZE)} width={5.5} />
            <Arrow from={[0, 0]} to={c1} color="var(--viz-1)" width={3.5} head={10} />
            <Arrow from={[0, 0]} to={c2} color="var(--viz-2)" width={3.5} head={10} />
            {revealed && (
              <>
                <TipLabel tip={c1} away={c2} text={`col 1 ${fmtV(c1)}`} color="var(--viz-1)" />
                {Math.hypot(c2[0], c2[1]) > 1e-6 && <TipLabel tip={c2} away={c1} text={`col 2 ${fmtV(c2)}`} color="var(--viz-2)" />}
              </>
            )}
          </Clip>
        </Plot>

        <div className={s.prompt}>
          <b>
            Picture {round + 1} of {ROUNDS.length}.
          </b>{' '}
          Which matrix did this?
        </div>
        <div className={`${s.choices} ${narrow ? s.choicesNarrow : ''}`} role="group" aria-label="Candidate matrices">
          {options.map((m, i) => {
            const cls = revealed && i === correctIdx ? s.choiceRight : revealed && i === picked ? s.choiceWrong : ''
            return (
              <button
                key={`${round}-${i}`}
                type="button"
                className={`${s.choice} ${cls}`}
                onClick={() => choose(i)}
                disabled={revealed}
                aria-label={`Matrix with rows ${m[0].join(', ')} and ${m[1].join(', ')}`}
              >
                <ColMat rows={m} plain={!revealed || i !== correctIdx} cell={38} />
              </button>
            )
          })}
        </div>
        {revealed && (
          <div className={`${s.feedback} ${picked === correctIdx ? '' : s.feedbackBad}`} aria-live="polite">
            <b>{picked === correctIdx ? 'Yes!' : 'Not quite.'}</b> It is a <b>{R.name}</b>. {R.why}
          </div>
        )}
        {finished && (
          <div className={s.feedback} aria-live="polite">
            <b>
              That was the last picture: you named {score} of {ROUNDS.length} correctly.
            </b>{' '}
            {score === ROUNDS.length ? 'Every one right: you can read a matrix from its columns.' : 'Press Play again to have another go.'}
          </div>
        )}
      </div>
      <Controls>
        <Button primary onClick={next} disabled={!revealed}>
          {finished ? 'Play again' : 'Next picture'}
        </Button>
        <span className={s.muted} style={{ fontSize: 'var(--step--1)' }}>
          Score: {score} / {answered}
        </span>
      </Controls>
    </Figure>
  )
}
