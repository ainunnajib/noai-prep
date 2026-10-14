import { useMemo, useState } from 'react'
import { Figure, Controls, Plot, Grid, Axes, Arrow, Path, Dots, Label, DraggablePoint, Segmented, Toggle, mulberry32, type DotDatum } from '../../../../../kit'
import { Vec, ArrowLabel, fmt, snap, clamp, type P } from './shared'
import s from './vectors.module.css'

type Mode = 'arrow' | 'data'

const X_COL = 'var(--viz-3)'
const Y_COL = 'var(--viz-4)'
const V_COL = 'var(--viz-1)'

/** Words for "go x across, then y up". */
function reading([x, y]: P) {
  if (x === 0 && y === 0) return 'Stay where you are: this is the zero vector.'
  const across = x === 0 ? null : `${fmt(Math.abs(x))} ${x > 0 ? 'right' : 'left'}`
  const up = y === 0 ? null : `${fmt(Math.abs(y))} ${y > 0 ? 'up' : 'down'}`
  return `Go ${[across, up].filter(Boolean).join(', then ')}.`
}

/** A small class of students for "data mode" (deterministic, so the picture never changes). */
function classData(): DotDatum[] {
  const rnd = mulberry32(2027)
  return Array.from({ length: 14 }, () => {
    const h = Math.round((1 + rnd() * 8.5) * 2) / 2
    const sc = Math.round(clamp(32 + 6.5 * h + (rnd() - 0.5) * 22, 5, 98))
    return { x: h, y: sc, r: 4.5, color: 'color-mix(in srgb, var(--viz-muted) 75%, var(--surface))' }
  })
}

/** Drag the tip of an arrow; the list [x, y] updates live. "Data mode" turns the same arrow into a student's record. */
export default function VectorPlayground() {
  const [mode, setMode] = useState<Mode>('arrow')
  const [tip, setTip] = useState<P>([3, 4])
  const [rec, setRec] = useState<P>([6, 75])
  const [legs, setLegs] = useState(true)
  const others = useMemo(classData, [])

  const isData = mode === 'data'
  const v = isData ? rec : tip

  return (
    <Figure
      title={isData ? 'The same arrow, now a student record' : 'One vector, two pictures: an arrow and a list'}
      caption={
        isData ? (
          <>
            Each grey dot is another student. Every one of them is a vector <strong>[hours, score]</strong>, drawn as just the tip of its arrow. Drag
            the blue student around and read the list: the picture and the numbers always agree.
          </>
        ) : (
          <>
            Drag the tip anywhere, including into negative territory. The first number says how far to go across (green), the second how far up (pink).
            Then switch to <strong>Data</strong> to see the very same object as a row of data.
          </>
        )
      }
    >
      <Controls>
        <Segmented
          label="Read the axes as"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'arrow', label: 'Arrow (x, y)' },
            { value: 'data', label: 'Data (hours, score)' },
          ]}
        />
        <Toggle label="Show the two legs" checked={legs} onChange={setLegs} />
      </Controls>
      <div className={s.split}>
        <div className={s.splitMain}>
          {isData ? (
            <Plot x={[0, 10]} y={[0, 100]} width={420} height={340} margin={{ left: 44, bottom: 40, top: 16, right: 16 }} ariaLabel="Scatter plot of students: hours studied across, score up, with one student drawn as an arrow from the origin">
              <Grid xTicks={10} yTicks={10} />
              <Axes xLabel="hours studied" yLabel="score" xTicks={10} yTicks={5} />
              <Dots points={others} />
              {legs && (
                <>
                  <Path points={[[0, 0], [rec[0], 0]]} color={X_COL} width={4} dash="7 5" />
                  <Path points={[[rec[0], 0], rec]} color={Y_COL} width={4} dash="7 5" />
                </>
              )}
              <Arrow from={[0, 0]} to={rec} color={V_COL} width={3.5} />
              <DraggablePoint
                x={rec[0]}
                y={rec[1]}
                color={V_COL}
                label="drag"
                onChange={(x, y) => setRec([clamp(snap(x, 0.5), 0, 10), clamp(Math.round(y), 0, 100)])}
              />
            </Plot>
          ) : (
            <Plot x={[-6, 6]} y={[-6, 6]} width={420} height={420} margin={{ left: 14, right: 14, top: 14, bottom: 14 }} ariaLabel="A vector drawn as an arrow from the origin; drag its tip">
              <Grid xTicks={12} yTicks={12} />
              <Axes origin xTicks={6} yTicks={6} />
              {legs && (
                <>
                  <Path points={[[0, 0], [tip[0], 0]]} color={X_COL} width={4} dash="7 5" />
                  <Path points={[[tip[0], 0], tip]} color={Y_COL} width={4} dash="7 5" />
                  {Math.abs(tip[0]) >= 1 && (
                    <Label x={tip[0] / 2} y={0} dy={tip[1] >= 0 ? 38 : -12} anchor="middle" color={X_COL} size={14} weight={800}>
                      {fmt(tip[0])}
                    </Label>
                  )}
                  {Math.abs(tip[1]) >= 1 && (
                    <Label x={tip[0]} y={tip[1] / 2} dx={tip[0] >= 0 ? 10 : -10} dy={5} anchor={tip[0] >= 0 ? 'start' : 'end'} color={Y_COL} size={14} weight={800}>
                      {fmt(tip[1])}
                    </Label>
                  )}
                </>
              )}
              <Arrow from={[0, 0]} to={tip} color={V_COL} width={3.5} />
              <ArrowLabel from={[0, 0]} to={tip} text="v" color={V_COL} t={0.5} side={tip[0] * tip[1] >= 0 ? 1 : -1} />
              <DraggablePoint x={tip[0]} y={tip[1]} color={V_COL} onChange={(x, y) => setTip([snap(x, 0.5), snap(y, 0.5)])} label="drag me" />
            </Plot>
          )}
        </div>
        <div className={s.splitSide}>
          {isData ? (
            <Vec name="student" values={rec} colors={[X_COL, Y_COL]} captions={['hours', 'score']} />
          ) : (
            <Vec name="v" values={tip} colors={[X_COL, Y_COL]} captions={['across', 'up']} />
          )}
          <p className={s.reading}>
            {isData ? `This student studied ${fmt(rec[0])} hours and scored ${fmt(rec[1])}.` : reading(tip)}
          </p>
          <code className={s.code}>
            {isData ? 'student' : 'v'} = [{fmt(v[0]).replace('−', '-')}, {fmt(v[1]).replace('−', '-')}]
          </code>
        </div>
      </div>
    </Figure>
  )
}
