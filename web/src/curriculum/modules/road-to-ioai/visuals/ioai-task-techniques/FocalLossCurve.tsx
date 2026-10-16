import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Grid, Axes, FnPath, VLine, DraggablePoint, M } from '../../../../../kit'
import styles from './techniques.module.css'

/*
  Focal loss FL(p) = -(1 - p)^γ · ln p, where p is the probability the model gives the TRUE class.
  γ = 0 is ordinary cross-entropy. Drag an easy and a hard example along the curve and watch how
  much each one counts, alone and in a batch where easy examples vastly outnumber hard ones.
*/

const GAMMAS = [0, 1, 2, 5]
const focal = (p: number, g: number) => -Math.pow(1 - p, g) * Math.log(p)
const clampP = (p: number) => Math.min(0.99, Math.max(0.02, Math.round(p * 100) / 100))
const fmtLoss = (v: number) => (v >= 0.1 ? v.toFixed(3) : v >= 0.001 ? v.toFixed(4) : v.toExponential(1))
const fmtRatio = (v: number) => (v >= 100 ? Math.round(v).toLocaleString('en-GB') : v.toFixed(1))

export default function FocalLossCurve() {
  const [gamma, setGamma] = useState(2)
  const [pEasy, setPEasy] = useState(0.9)
  const [pHard, setPHard] = useState(0.2)
  const [perHard, setPerHard] = useState(99)

  const lEasy = focal(pEasy, gamma)
  const lHard = focal(pHard, gamma)
  const ratio = lHard / Math.max(lEasy, 1e-12)

  // share of the batch's total loss that comes from the easy examples
  const share = (g: number) => {
    const e = perHard * focal(pEasy, g)
    const h = focal(pHard, g)
    return e / (e + h)
  }
  const shareCE = share(0)
  const shareNow = share(gamma)

  return (
    <Figure
      title="Focal loss turns down the easy examples"
      caption={
        <>
          Slide <M>{'\\gamma'}</M> and drag the easy and hard examples. Notice that raising <M>{'\\gamma'}</M> flattens the right-hand end of the curve, so the batch's loss comes mostly from the
          hard examples.
        </>
      }
    >
      <Plot x={[0, 1]} y={[0, 3]} width={480} height={300} minHeight={290} margin={{ top: 26 }} ariaLabel="Focal loss against the probability of the true class for several values of gamma">
        <Grid xTicks={10} yTicks={6} />
        <Axes xLabel="p (probability of the true class)" yLabel="loss" xTicks={5} yTicks={6} />
        {GAMMAS.map((g) => (
          <FnPath key={g} f={(p) => focal(p, g)} domain={[0.01, 1]} color="var(--viz-muted)" width={1.5} dash="5 4" opacity={0.9} />
        ))}
        <FnPath f={(p) => focal(p, gamma)} domain={[0.01, 1]} color="var(--viz-1)" width={3} />
        <VLine x={pHard} color="var(--viz-2)" dash="3 4" width={1} />
        <VLine x={pEasy} color="var(--viz-3)" dash="3 4" width={1} />
        <DraggablePoint
          x={pHard}
          y={Math.min(3, lHard)}
          color="var(--viz-2)"
          label="hard"
          onChange={(x) => setPHard(clampP(Math.min(x, pEasy - 0.05)))}
        />
        <DraggablePoint
          x={pEasy}
          y={Math.min(3, lEasy)}
          color="var(--viz-3)"
          label="easy"
          onChange={(x) => setPEasy(clampP(Math.max(x, pHard + 0.05)))}
        />
      </Plot>
      <div className={styles.plotKey} aria-hidden="true">
        <span>
          <span className={styles.keySolid} /> your <M>{'\\gamma'}</M>
        </span>
        <span>
          <span className={styles.keyDash} /> <M>{'\\gamma = 0, 1, 2, 5'}</M> (top to bottom)
        </span>
      </div>
      <Controls>
        <Slider label={<>focusing parameter <M>{'\\gamma'}</M></>} value={gamma} min={0} max={5} step={0.5} onChange={setGamma} />
        <Readout
          items={[
            [`easy loss (p = ${pEasy.toFixed(2)})`, fmtLoss(lEasy)],
            [`hard loss (p = ${pHard.toFixed(2)})`, fmtLoss(lHard)],
            ['one hard example counts as', `${fmtRatio(ratio)} easy ones`],
          ]}
        />
      </Controls>

      <div className={styles.batchBox}>
        <div className={styles.batchHead}>
          <strong>In a batch</strong> with {perHard} easy examples for every hard one, who supplies the loss?
        </div>
        {[
          { name: 'cross-entropy (γ = 0)', s: shareCE },
          { name: `focal loss (γ = ${gamma})`, s: shareNow },
        ].map((row) => (
          <div key={row.name} className={styles.shareRow}>
            <span className={styles.shareName}>{row.name}</span>
            <span className={styles.shareTrack} role="img" aria-label={`${row.name}: easy examples supply ${Math.round(row.s * 100)} percent of the loss`}>
              <span className={styles.shareEasy} style={{ width: `${row.s * 100}%` }} />
              <span className={styles.shareHard} style={{ width: `${(1 - row.s) * 100}%` }} />
            </span>
            <span className={styles.shareNums}>
              <span style={{ color: 'color-mix(in srgb, var(--viz-3) 60%, var(--ink))', fontWeight: 700 }}>easy {Math.round(row.s * 100)}%</span> ·{' '}
              <span style={{ color: 'color-mix(in srgb, var(--viz-2) 60%, var(--ink))', fontWeight: 700 }}>hard {Math.round((1 - row.s) * 100)}%</span>
            </span>
          </div>
        ))}
        <Controls>
          <Slider label="easy examples per hard one" value={perHard} min={1} max={999} step={1} onChange={setPerHard} />
        </Controls>
      </div>
    </Figure>
  )
}
