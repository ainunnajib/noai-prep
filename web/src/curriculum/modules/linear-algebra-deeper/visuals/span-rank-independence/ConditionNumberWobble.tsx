import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Button, Plot, Grid, Axes, Path, Dots, Label, Readout, mulberry32 } from '../../../../../kit'
import { type V2, fmt, Clip } from '../linear-transformations/la'
import { singular2 } from './linalg'
import s from './sri.module.css'

/*
  Solving Ax = b for a 2×2 system = finding where two lines cross. Every row of A is the
  (unit) normal of one line. Nudge b by a tiny random amount (at most EPS) many times and
  re-solve: the solutions form an ellipse around the true answer whose long/short ratio is
  exactly the condition number κ = σmax/σmin. Rotate the lines towards each other and watch it.
*/

const P: V2 = [1, 1] // the true solution
const EPS = 0.15 // largest nudge to b
const BATCH = 30
const A1 = 45 // direction (degrees) of the first line's normal

function nudges(seed: number): V2[] {
  const rnd = mulberry32(seed)
  return Array.from({ length: BATCH }, () => {
    const rr = EPS * Math.sqrt(rnd())
    const t = 2 * Math.PI * rnd()
    return [rr * Math.cos(t), rr * Math.sin(t)] as V2
  })
}

export default function ConditionNumberWobble() {
  const [theta, setTheta] = useState(45)
  const [batches, setBatches] = useState(1)

  const a1 = (A1 * Math.PI) / 180
  const a2 = ((A1 + theta) * Math.PI) / 180
  const A = [
    [Math.cos(a1), Math.sin(a1)],
    [Math.cos(a2), Math.sin(a2)],
  ]
  const D = A[0][0] * A[1][1] - A[0][1] * A[1][0]
  const inv = [
    [A[1][1] / D, -A[0][1] / D],
    [-A[1][0] / D, A[0][0] / D],
  ]
  const solveDelta = (d: V2): V2 => [P[0] + inv[0][0] * d[0] + inv[0][1] * d[1], P[1] + inv[1][0] * d[0] + inv[1][1] * d[1]]
  const [smax, smin] = singular2(A)
  const kappa = smax / smin
  const b = [A[0][0] * P[0] + A[0][1] * P[1], A[1][0] * P[0] + A[1][1] * P[1]]

  const allNudges = useMemo(() => Array.from({ length: batches }, (_, i) => nudges(1000 + i * 17)).flat(), [batches])
  const sols = allNudges.map(solveDelta)
  const ellipse = Array.from({ length: 73 }, (_, i) => {
    const t = (i / 72) * 2 * Math.PI
    return solveDelta([EPS * Math.cos(t), EPS * Math.sin(t)])
  })
  // each line: points x with row·x = b_i; direction is perpendicular to the row
  const line = (row: number[], bi: number): [V2, V2] => {
    const base: V2 = [row[0] * bi, row[1] * bi]
    const dir: V2 = [-row[1], row[0]]
    return [
      [base[0] - 30 * dir[0], base[1] - 30 * dir[1]],
      [base[0] + 30 * dir[0], base[1] + 30 * dir[1]],
    ]
  }
  const l1 = line(A[0], b[0])
  const l2 = line(A[1], b[1])
  const worst = EPS / smin
  // put the two labels on opposite sides of the crossing point, 1.8 units along each line
  const d1: V2 = [-A[0][1], A[0][0]]
  let d2: V2 = [-A[1][1], A[1][0]]
  if (d1[0] * d2[0] + d1[1] * d2[1] < 0) d2 = [-d2[0], -d2[1]]
  const lab1: V2 = [P[0] + 1.8 * d1[0], P[1] + 1.8 * d1[1]]
  const lab2: V2 = [P[0] - 1.8 * d2[0], P[1] - 1.8 * d2[1]]
  const tone = kappa < 5 ? 'var(--viz-3)' : kappa < 30 ? 'var(--viz-2)' : 'var(--viz-neg)'

  return (
    <Figure
      title="Nearly parallel lines make a wobbly answer"
      caption={
        <>
          Each line is one equation of a 2×2 system <i>Ax = b</i>; the solution is where they cross (black ring). Every green dot is the solution after nudging{' '}
          <i>b</i> by at most {EPS}. Press <b>Jitter b</b> for more nudges, then drag the angle down: as the lines become nearly parallel, the same tiny nudges
          throw the solution far along the lines. The dashed ellipse holds every possible answer; its long side divided by its short side is the condition
          number κ.
        </>
      }
    >
      <Plot
        x={[-1.5, 3.5]}
        y={[-1.5, 3.5]}
        width={420}
        height={420}
        margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
        ariaLabel={`Two lines at ${theta} degrees; condition number ${fmt(kappa, 1)}`}
      >
        <Grid xTicks={10} yTicks={10} />
        <Axes origin xTicks={5} yTicks={5} />
        <Clip>
          <Path points={l1} color="var(--viz-1)" width={2.5} />
          <Path points={l2} color="var(--viz-2)" width={2.5} />
          <Path points={ellipse} closed color={tone} width={1.8} dash="5 4" fill={`color-mix(in srgb, ${tone} 10%, transparent)`} />
          <Dots
            points={sols.map((p) => ({
              x: p[0],
              y: p[1],
              r: 3.2,
              color: 'var(--viz-3)',
            }))}
            stroke="none"
          />
          <Dots points={[{ x: P[0], y: P[1], r: 6, hollow: true, color: 'var(--viz-ink)' }]} />
          <Label x={lab1[0]} y={lab1[1]} color="var(--viz-1)" anchor="middle" dy={-8}>
            equation 1
          </Label>
          <Label x={lab2[0]} y={lab2[1]} color="var(--viz-2)" anchor="middle" dy={-8}>
            equation 2
          </Label>
        </Clip>
      </Plot>

      <div className={s.info} aria-live="polite">
        <Readout
          items={[
            ['angle between lines', `${theta}°`],
            ['σmax', fmt(smax, 3)],
            ['σmin', fmt(smin, 3)],
            ['κ = σmax / σmin', fmt(kappa, 1)],
          ]}
        />
        <span className={`${s.badge} ${kappa < 5 ? '' : kappa < 30 ? s.badgeWarn : s.badgeBad}`}>
          a nudge of {EPS} to b can move the answer by up to {fmt(worst, 2)}
          {kappa >= 30 ? ': ill-conditioned' : kappa < 5 ? ': well-conditioned' : ''}
        </span>
      </div>

      <Controls>
        <Slider label="Angle between the two lines" value={theta} min={2} max={90} step={1} onChange={setTheta} format={(v) => `${v}°`} />
        <Button primary onClick={() => setBatches((k) => Math.min(8, k + 1))}>
          Jitter b
        </Button>
        <Button onClick={() => setBatches(1)}>Clear</Button>
      </Controls>
    </Figure>
  )
}
