import { useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Readout, Button, Plot, Grid, Axes, Path, Label, DraggablePoint, useNarrow } from '../../../../../kit'
import { TRAIN, X_RANGE, Y_RANGE, PLOT_W, PLOT_H, PASS_BG, FAIL_BG, ruleFromPoints, countCorrect, linePass, bestLine, handlesFor, halfPlane, ruleText, prefersReducedMotion } from './students'
import { StudentMarks, WrongRings, Legend, RegionVars } from './parts'

/*
  Drag the two round handles to place a straight boundary between passes and fails. The side with more
  passes is shaded orange (predict "pass"), the other blue (predict "fail"). Wrongly classified students
  get a red ring. "Show the computer's best line" jumps to the line found by brute force (22/24, the best possible).
  The handles start in empty space (not on top of a student) so they are easy to grab on a phone.
*/

const START_A: [number, number] = [5.6, 9.85]
const START_B: [number, number] = [5.0, 3.15]
const LINE_C = 'var(--viz-ink)'

function centroid(poly: [number, number][]): [number, number] {
  const n = poly.length || 1
  return [poly.reduce((s, p) => s + p[0], 0) / n, poly.reduce((s, p) => s + p[1], 0) / n]
}

function Swatch({ fill }: { fill: string }) {
  return (
    <svg width="14" height="14" aria-hidden="true">
      <RegionVars>
        <rect x="0.75" y="0.75" width="12.5" height="12.5" rx="2" style={{ fill, stroke: 'var(--viz-muted)', strokeWidth: 1 }} />
      </RegionVars>
    </svg>
  )
}

export default function BoundaryDrawer() {
  const [A, setA] = useState<[number, number]>(START_A)
  const [B, setB] = useState<[number, number]>(START_B)
  const [still, setStill] = useState(true)
  useEffect(() => setStill(prefersReducedMotion()), [])
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(480)

  const best = useMemo(() => bestLine(TRAIN), [])
  const bestCorrect = countCorrect(best, TRAIN)
  const rule = ruleFromPoints(A, B, TRAIN)
  const correct = countCorrect(rule, TRAIN)
  const wrong = TRAIN.filter((p) => linePass(rule, p.x, p.y) !== p.pass)
  const passPoly = halfPlane(rule, 1)
  const failPoly = halfPlane(rule, -1)
  const dx = B[0] - A[0]
  const dy = B[1] - A[1]
  const far: [number, number][] = [
    [A[0] - dx * 30, A[1] - dy * 30],
    [B[0] + dx * 30, B[1] + dy * 30],
  ]
  const pc = centroid(passPoly)
  const fc = centroid(failPoly)
  const atBest = correct >= bestCorrect

  const move = (which: 'A' | 'B') => (x: number, y: number) => {
    const other = which === 'A' ? B : A
    if (Math.hypot(x - other[0], y - other[1]) < 0.4) return // keep the two handles apart
    const p: [number, number] = [Math.round(x * 20) / 20, Math.round(y * 20) / 20]
    if (which === 'A') setA(p)
    else setB(p)
  }

  return (
    <Figure
      title="Draw the boundary"
      caption={
        <>
          Each mark is a student from last year's class: hours of revision in the week before the test (across) and hours of sleep the night before (up).
          Drag the two round handles to split the passes from the fails. Students on the orange side are predicted to pass, on the blue side to fail, and
          red rings mark the ones your line gets wrong. Can you reach 22? Then press <b>Show the computer's best line</b>.
        </>
      }
    >
      <Legend
        extra={
          narrow
            ? [
                { label: 'orange side: predict pass', swatch: <Swatch fill={PASS_BG} /> },
                { label: 'blue side: predict fail', swatch: <Swatch fill={FAIL_BG} /> },
              ]
            : undefined
        }
      />
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
      <Plot x={X_RANGE} y={Y_RANGE} width={PLOT_W} height={PLOT_H} maxWidth={640} ariaLabel={`Students plotted by revision and sleep, with a straight boundary that classifies ${correct} of ${TRAIN.length} correctly`}>
        <RegionVars>
          {passPoly.length > 2 && <Path points={passPoly} closed fill={PASS_BG} color="none" width={0} />}
          {failPoly.length > 2 && <Path points={failPoly} closed fill={FAIL_BG} color="none" width={0} />}
        </RegionVars>
        <Grid xTicks={10} yTicks={7} />
        <Axes xLabel="hours of revision" yLabel="hours of sleep" xTicks={10} yTicks={7} />
        {!narrow && passPoly.length > 2 && (
          <Label x={pc[0]} y={pc[1]} anchor="middle" color="var(--viz-2)" weight={800} size={13}>
            predict pass
          </Label>
        )}
        {!narrow && failPoly.length > 2 && (
          <Label x={fc[0]} y={fc[1]} anchor="middle" color="var(--viz-1)" weight={800} size={13}>
            predict fail
          </Label>
        )}
        <Path points={far} color={LINE_C} width={3} />
        <StudentMarks data={TRAIN} r={narrow ? 5 : 6} />
        <WrongRings pts={wrong} still={still} r={narrow ? 9 : 11} />
        <DraggablePoint x={A[0]} y={A[1]} onChange={move('A')} color={LINE_C} label="drag" r={8} />
        {/* on phones the lower label would sit on the students near the bottom edge; the top one is enough */}
        <DraggablePoint x={B[0]} y={B[1]} onChange={move('B')} color={LINE_C} label={narrow ? undefined : 'drag'} r={8} />
      </Plot>
      </div>
      <Readout
        items={[
          ['correct', `${correct} / ${TRAIN.length}`],
          ['accuracy', `${Math.round((100 * correct) / TRAIN.length)}%`],
          ['wrong', String(wrong.length)],
        ]}
      />
      <div style={{ fontSize: '0.88rem', color: 'var(--ink-2)', textAlign: 'center', lineHeight: 1.5 }}>
        Your line as a rule: <b style={{ color: 'var(--ink)' }}>{ruleText(rule)}</b>; pass if score &gt; 0
      </div>
      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, textAlign: 'center', color: atBest ? 'var(--viz-pos)' : 'var(--ink-2)' }} aria-live="polite">
        {atBest
          ? `${correct} out of ${TRAIN.length}: no straight line can do better here. The two students still ringed are unusual: one barely revised but passed, one revised a lot but failed.`
          : `${wrong.length} student${wrong.length === 1 ? '' : 's'} on the wrong side. Tilt and slide the line to fix them.`}
      </p>
      <Controls>
        <Button
          primary
          onClick={() => {
            const [p, q] = handlesFor(best)
            setA(p)
            setB(q)
          }}
        >
          Show the computer's best line
        </Button>
        <Button
          onClick={() => {
            setA(START_A)
            setB(START_B)
          }}
        >
          Reset
        </Button>
      </Controls>
    </Figure>
  )
}
