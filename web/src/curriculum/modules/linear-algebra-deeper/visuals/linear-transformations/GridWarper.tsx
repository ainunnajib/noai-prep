import { useRef, useState } from 'react'
import { Figure, Controls, Slider, Toggle, Button, Plot, Grid, Axes, Arrow, Dots, DraggablePoint, useAnimationFrame, useNarrow } from '../../../../../kit'
import { type M2, type V2, I2, apply, col, det, describe, fmt, fromCols, morphM, sameM, ColMat, Vec, Smiley, WarpedGrid, Clip, KeyStep, TipLabel } from './la'
import s from './lt.module.css'

/*
  The whole plane moved by a 2×2 matrix. The two draggable arrows ARE the columns of A:
  column 1 is where (1, 0) lands, column 2 is where (0, 1) lands. The probe point p shows
  why that is enough: A·p = x·(column 1) + y·(column 2), drawn tip to tail.
*/

const PRESETS: { name: string; m: M2 }[] = [
  { name: 'Identity', m: I2 },
  {
    name: 'Rotate 90°',
    m: [
      [0, -1],
      [1, 0],
    ],
  },
  {
    name: 'Rotate 30°',
    m: [
      [Math.cos(Math.PI / 6), -0.5],
      [0.5, Math.cos(Math.PI / 6)],
    ],
  },
  {
    name: 'Scale',
    m: [
      [1.5, 0],
      [0, 0.5],
    ],
  },
  {
    name: 'Shear',
    m: [
      [1, 1],
      [0, 1],
    ],
  },
  {
    name: 'Reflect',
    m: [
      [-1, 0],
      [0, 1],
    ],
  },
  {
    name: 'Project onto y = x',
    m: [
      [0.5, 0.5],
      [0.5, 0.5],
    ],
  },
]

const START: M2 = [
  [1.5, -0.5],
  [0.5, 1],
]

const snapHalf = (v: number) => Math.round(v * 2) / 2

export default function GridWarper() {
  const [target, setTarget] = useState<M2>(START)
  // how far through the move we are (0 = identity, 1 = A); the slider shows this same number
  const [frac, setFrac] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [probe, setProbe] = useState<V2>([2, 1.5])
  const [showProbe, setShowProbe] = useState(true)
  const [showGhost, setShowGhost] = useState(true)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()
  const LIM = narrow ? 3.6 : 4.2
  const reach = narrow ? 3 : 3.5
  const clampV = (v: number) => Math.max(-reach, Math.min(reach, v))

  // Play: time runs from 0 to 1 and is eased, so the motion starts and ends gently
  const tauRef = useRef(1)
  useAnimationFrame((dt) => {
    const nt = Math.min(1, tauRef.current + dt / 1.8)
    tauRef.current = nt
    setFrac(nt * nt * (3 - 2 * nt))
    if (nt >= 1) setPlaying(false)
  }, playing)
  const play = () => {
    tauRef.current = 0
    setFrac(0)
    setPlaying(true)
  }

  const m = frac >= 1 ? target : morphM(target, frac)
  const moving = frac < 1
  const c1 = col(m, 0)
  const c2 = col(m, 1)
  const out = apply(m, probe)
  const leg1: V2 = [probe[0] * c1[0], probe[0] * c1[1]]
  const D = det(m)
  // when Ap sits on top of p (e.g. the identity), leave out its label so 'p' and 'Ap' do not overprint
  const apNearP = Math.hypot(out[0] - probe[0], out[1] - probe[1]) < 0.4
  const presetIdx = PRESETS.findIndex((p) => sameM(p.m, target, 1e-9))

  const moveProbe = (x: number, y: number) => setProbe([clampV(snapHalf(x)), clampV(snapHalf(y))])
  const setCol = (j: 0 | 1, x: number, y: number) => {
    const v: V2 = [clampV(snapHalf(x)), clampV(snapHalf(y))]
    setPlaying(false)
    setFrac(1)
    const cur = target
    setTarget(j === 0 ? fromCols(v, col(cur, 1)) : fromCols(col(cur, 0), v))
  }

  return (
    <Figure
      title="Drag the columns: the whole grid follows"
      caption={
        <>
          <b>Try:</b>
          <ol className="try">
            <li>
              Drag the tips of the <span className={s.c1}>blue</span> and <span className={s.c2}>orange</span> arrows: they are the two columns of <i>A</i>.
            </li>
            <li>
              Press the presets (each one plays its move). After <b>Reflect</b>, the smiley winks with the other eye.
            </li>
          </ol>
          <b>Notice:</b> grid lines stay straight, parallel and evenly spaced, and halfway through <b>Reflect</b> the plane is squashed flat (det = 0).
          <span className="fine">
            The faint grid is the plane before the move, the violet grid after it. The green probe <i>p</i> = (x, y) lands on the hollow ring <i>Ap</i>: x steps of column 1, then y
            steps of column 2. In-between frames blend the entries, so they are not themselves the final kind of move.
          </span>
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <Plot
          x={[-LIM, LIM]}
          y={[-LIM, LIM]}
          width={440}
          height={440}
          margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
          ariaLabel={`Grid transformed by the matrix with columns (${fmt(c1[0])}, ${fmt(c1[1])}) and (${fmt(c2[0])}, ${fmt(c2[1])})`}
        >
          <Grid xTicks={2 * Math.round(LIM)} yTicks={2 * Math.round(LIM)} />
          <Axes origin xTicks={8} yTicks={8} />
          <Clip>
            <WarpedGrid m={m} />
            {showGhost && <Smiley m={I2} cx={-1} cy={-1.2} r={0.7} ghost />}
            <Smiley m={m} cx={-1} cy={-1.2} r={0.7} />
            {showProbe && (
              <>
                <Arrow from={[0, 0]} to={leg1} color="var(--viz-1)" width={2} dash="5 4" head={7} />
                <Arrow from={leg1} to={out} color="var(--viz-2)" width={2} dash="5 4" head={7} />
                <Dots
                  points={[
                    {
                      x: out[0],
                      y: out[1],
                      color: 'var(--viz-3)',
                      r: 6.5,
                      hollow: true,
                      label: apNearP ? undefined : 'Ap',
                    },
                  ]}
                />
              </>
            )}
            <Arrow from={[0, 0]} to={c1} color="var(--viz-1)" width={4} head={11} />
            <Arrow from={[0, 0]} to={c2} color="var(--viz-2)" width={4} head={11} />
          </Clip>
          {showProbe && (
            <KeyStep x={probe[0]} y={probe[1]} onChange={moveProbe}>
              <DraggablePoint x={probe[0]} y={probe[1]} r={7} color="var(--viz-3)" label="p" onChange={moveProbe} />
            </KeyStep>
          )}
          <TipLabel tip={c1} away={c2} text="col 1" color="var(--viz-1)" />
          <TipLabel tip={c2} away={c1} text="col 2" color="var(--viz-2)" />
          <g className={s.noDragText}>
            <KeyStep x={c1[0]} y={c1[1]} onChange={(x, y) => setCol(0, x, y)}>
              <DraggablePoint x={c1[0]} y={c1[1]} color="var(--viz-1)" label="col 1" onChange={(x, y) => setCol(0, x, y)} />
            </KeyStep>
            <KeyStep x={c2[0]} y={c2[1]} onChange={(x, y) => setCol(1, x, y)}>
              <DraggablePoint x={c2[0]} y={c2[1]} color="var(--viz-2)" label="col 2" onChange={(x, y) => setCol(1, x, y)} />
            </KeyStep>
          </g>
        </Plot>
      </div>

      <div className={s.info} aria-live="polite">
        <div className={s.row}>
          <ColMat rows={m} name={moving ? `${Math.round(frac * 100)}% of the way from I to A` : 'A'} ariaLabel="the matrix A" />
          <div style={{ display: 'grid', gap: '0.35rem', justifyItems: 'center' }}>
            {moving ? (
              <span className={`${s.badge} ${s.badgeNeutral}`}>on the way to A: {describe(target)}</span>
            ) : (
              <span className={`${s.badge} ${Math.abs(D) < 1e-9 ? s.badgeBad : ''}`}>{describe(m)}</span>
            )}
            <span>
              det A = {fmt(D)}{' '}
              <span className={s.muted}>
                (area × {fmt(Math.abs(D))}
                {D < -1e-9 ? ', flipped' : ''})
              </span>
            </span>
          </div>
        </div>
        {showProbe && (
          <div className={s.eq}>
            <span>
              A·
              <Vec p={probe} tone="var(--viz-3)" /> =
            </span>
            <span>
              {fmt(probe[0])}·<Vec p={c1} tone="var(--viz-1)" />
            </span>
            <span>+</span>
            <span>
              {fmt(probe[1])}·<Vec p={c2} tone="var(--viz-2)" />
            </span>
            <span>
              = <Vec p={out} tone="var(--viz-3)" />
            </span>
          </div>
        )}
      </div>

      <Controls>
        {PRESETS.map((p, i) => (
          <Button
            key={p.name}
            primary={i === presetIdx}
            onClick={() => {
              setTarget(p.m)
              play()
            }}
          >
            {p.name}
          </Button>
        ))}
      </Controls>
      <Controls>
        <Slider
          label="Morph from the identity to A"
          value={frac}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => (setPlaying(false), setFrac(v))}
          format={(v) => `${Math.round(v * 100)}%`}
        />
        <Button primary onClick={play}>
          Play the move
        </Button>
        <Toggle label="Follow a point p" checked={showProbe} onChange={setShowProbe} />
        <Toggle label="Show the starting smiley" checked={showGhost} onChange={setShowGhost} />
      </Controls>
    </Figure>
  )
}
