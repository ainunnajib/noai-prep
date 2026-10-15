import { useRef, useState } from 'react'
import { Figure, Controls, Slider, Toggle, Button, Plot, Grid, Axes, Arrow, useAnimationFrame, useNarrow } from '../../../../../kit'
import { type M2, I2, col, fmt, mul, rot, sameM, shearX, ColMat, FShape, WarpedGrid, Clip } from './la'
import s from './lt.module.css'

/*
  The same two moves, a rotation R and a shear S, done in the two possible orders.
  Left: rotate first, then shear  -> the single matrix is S·R (the first move sits on the right).
  Right: shear first, then rotate -> R·S.
  Scrub the progress slider (0 → 1 is the first move, 1 → 2 the second) to watch each move happen.
*/

function Panel({
  title,
  formula,
  stage,
  m,
  other,
  showOther,
  lim,
  label,
}: {
  title: string
  formula: string
  stage: number
  m: M2
  other: M2
  showOther: boolean
  lim: number
  label: string
}) {
  const c1 = col(m, 0)
  const c2 = col(m, 1)
  return (
    <div className={s.panel}>
      <div className={s.panelTitle}>{title}</div>
      <div className={s.steps} aria-hidden="true">
        {formula.split(' then ').map((txt, i) => (
          <span key={i} className={`${s.stepChip} ${stage > i + 1 - 1e-9 ? s.stepDone : stage > i ? s.stepOn : ''}`}>
            {i + 1}. {txt}
          </span>
        ))}
      </div>
      <Plot x={[-lim, lim]} y={[-lim, lim]} width={300} height={300} margin={{ top: 6, right: 6, bottom: 6, left: 6 }} ariaLabel={label}>
        <Grid xTicks={2 * Math.round(lim)} yTicks={2 * Math.round(lim)} />
        <Axes origin xTicks={6} yTicks={6} hideXTicks hideYTicks />
        <Clip>
          <WarpedGrid m={m} opacity={0.36} />
          <FShape m={I2} color="var(--viz-muted)" width={3} dash="4 5" />
          {showOther && <FShape m={other} color="var(--viz-4)" width={3.5} dash="7 5" />}
          <FShape m={m} />
          <Arrow from={[0, 0]} to={c1} color="var(--viz-1)" width={3} head={9} />
          <Arrow from={[0, 0]} to={c2} color="var(--viz-2)" width={3} head={9} />
        </Clip>
      </Plot>
    </div>
  )
}

export default function ComposeOrder() {
  const [theta, setTheta] = useState(90)
  const [k, setK] = useState(1)
  const [prog, setProg] = useState(2)
  const [playing, setPlaying] = useState(false)
  const [showOther, setShowOther] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)
  const LIM = 3.3
  const cell = narrow ? 50 : 42

  const pRef = useRef(prog)
  pRef.current = prog
  useAnimationFrame((dt) => {
    const np = Math.min(2, pRef.current + dt / 1.5)
    pRef.current = np
    setProg(np)
    if (np >= 2) setPlaying(false)
  }, playing)

  const R = rot(theta)
  const S = shearX(k)
  const SR = mul(S, R) // rotate first, then shear
  const RS = mul(R, S) // shear first, then rotate
  const ease = (u: number) => u * u * (3 - 2 * u)
  const u1 = ease(Math.min(1, prog))
  const u2 = ease(Math.max(0, prog - 1))
  // partial moves: rotations turn through part of the angle, shears slide part of the way
  const left = prog <= 1 ? rot(theta * u1) : mul(shearX(k * u2), R)
  const right = prog <= 1 ? shearX(k * u1) : mul(rot(theta * u2), S)
  const same = sameM(SR, RS, 1e-6)
  const stageText =
    prog < 0.01 ? 'start' : prog < 0.995 ? 'first move' : prog < 1.005 ? 'after the first move' : prog < 1.995 ? 'second move' : 'after both moves'

  const info = (
    <div className={s.info} aria-live="polite">
      <div className={s.row}>
        {narrow ? (
          // phones: only the two products, in cells wide enough that neighbouring entries never run together
          <>
            <ColMat rows={SR} name="SR: R first" cell={cell} />
            <ColMat rows={RS} name="RS: S first" cell={cell} />
          </>
        ) : (
          <>
            <span className={s.eq}>
              <ColMat rows={S} name="S (shear)" plain cell={cell} />
              <ColMat rows={R} name="R (rotate)" plain cell={cell} />
              <span>=</span>
              <ColMat rows={SR} name="SR: R first" cell={cell} />
            </span>
            <span className={s.eq}>
              <ColMat rows={R} name="R (rotate)" plain cell={cell} />
              <ColMat rows={S} name="S (shear)" plain cell={cell} />
              <span>=</span>
              <ColMat rows={RS} name="RS: S first" cell={cell} />
            </span>
          </>
        )}
      </div>
      <span className={`${s.badge} ${same ? '' : s.badgeBad}`}>{same ? 'SR = RS: these two moves commute' : 'SR ≠ RS: order matters'}</span>
    </div>
  )
  const controls = (
    <>
      <Controls>
        <Slider label="Rotation angle θ" value={theta} min={0} max={180} step={15} onChange={setTheta} format={(v) => `${v}°`} />
        <Slider label="Shear amount k" value={k} min={-1.5} max={1.5} step={0.5} onChange={setK} format={(v) => fmt(v)} />
      </Controls>
      <Controls>
        <Slider
          label={`Progress: ${stageText}`}
          value={prog}
          min={0}
          max={2}
          step={0.01}
          onChange={(v) => (setPlaying(false), setProg(v))}
          format={(v) => `${fmt(v, 1)} / 2`}
        />
        <Button
          primary
          onClick={() => {
            setProg(0)
            setPlaying(true)
          }}
        >
          Play both moves
        </Button>
        <Toggle label="Overlay the other order's result (pink)" checked={showOther} onChange={setShowOther} />
      </Controls>
    </>
  )

  return (
    <Figure
      title="Same two moves, different order"
      caption={
        <>
          Both panels use the same rotation <i>R</i> and the same shear <i>S</i>; only the order differs. Press <b>Play both moves</b> or drag the progress
          slider to watch each move happen. The dashed grey F is the starting picture. Change the angle and the shear: the two results almost never agree. Then
          try a shear of 0, or an angle of 180° (that rotation is <i>−I</i>), and the two orders give the same matrix.
        </>
      }
    >
      <div ref={wrapRef} className={`${s.panels} ${narrow ? s.panelsNarrow : ''}`}>
        <Panel
          title="Rotate first, then shear"
          formula={`rotate ${theta}° then shear by ${fmt(k)}`}
          stage={prog}
          m={left}
          other={RS}
          showOther={showOther}
          lim={LIM}
          label={`Rotate by ${theta} degrees, then shear by ${fmt(k)}: the matrix S R`}
        />
        <Panel
          title="Shear first, then rotate"
          formula={`shear by ${fmt(k)} then rotate ${theta}°`}
          stage={prog}
          m={right}
          other={SR}
          showOther={showOther}
          lim={LIM}
          label={`Shear by ${fmt(k)}, then rotate by ${theta} degrees: the matrix R S`}
        />
      </div>

      {/* phones: the sliders sit right under the panels they change, and the matrices follow */}
      {narrow ? (
        <>
          {controls}
          {info}
        </>
      ) : (
        <>
          {info}
          {controls}
        </>
      )}
    </Figure>
  )
}
