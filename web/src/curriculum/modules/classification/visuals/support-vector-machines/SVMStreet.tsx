import { useState } from 'react'
import { Figure, Controls, Readout, Toggle, Button, Plot, Grid, Axes, Arrow, Label, Path, DraggablePoint } from '../../../../../kit'
import { hardMarginLine, margin, fLine, type Line, type P2 } from './svm'
import { STREET_BLUE, STREET_ORANGE } from './svmData'
import { Street, DragMark, Ring, Legend, swatch } from './parts'

/*
  The maximum-margin ("widest street") line for two separable classes, recomputed exactly every time a
  point moves. Support vectors (the points on the edges of the street) are ringed. Optionally the learner
  can place their own separating line and compare its street with the SVM's.
*/

type Pts = [number, number][]

/** Street half-width of the line through A and B, oriented so blue is on the positive side; null if it does not separate. */
function userStreet(A: P2, B: P2, blue: Pts, orange: Pts): { line: Line; width: number } | null {
  let ux = -(B[1] - A[1])
  let uy = B[0] - A[0]
  const n = Math.hypot(ux, uy)
  if (n < 1e-6) return null
  ux /= n
  uy /= n
  const c = ux * A[0] + uy * A[1]
  let minB = Infinity
  let maxO = -Infinity
  for (const p of blue) minB = Math.min(minB, ux * p[0] + uy * p[1] - c)
  for (const p of orange) maxO = Math.max(maxO, ux * p[0] + uy * p[1] - c)
  let sgn = 1
  if (minB <= 0 || maxO >= 0) {
    // try the other orientation
    const minB2 = -maxO
    const maxO2 = -minB
    if (minB2 <= 0 || maxO2 >= 0) return null
    sgn = -1
    minB = minB2
    maxO = maxO2
  }
  const h = Math.min(minB, -maxO)
  // the street of this line is symmetric about it, reaching the nearest point on either side
  return { line: { w: [(sgn * ux) / h, (sgn * uy) / h], b: (-sgn * c) / h }, width: 2 * h }
}

export default function SVMStreet() {
  const [blue, setBlue] = useState<Pts>(() => STREET_BLUE.map((p) => [...p] as [number, number]))
  const [orange, setOrange] = useState<Pts>(() => STREET_ORANGE.map((p) => [...p] as [number, number]))
  const [mine, setMine] = useState(false)
  const [A, setA] = useState<[number, number]>([3.2, 9.4])
  const [B, setB] = useState<[number, number]>([6.4, 0.6])

  const hard = hardMarginLine(blue, orange)
  const user = mine ? userStreet(A, B, blue, orange) : null

  const reset = () => {
    setBlue(STREET_BLUE.map((p) => [...p] as [number, number]))
    setOrange(STREET_ORANGE.map((p) => [...p] as [number, number]))
  }

  // a double arrow across the street, through the point of the boundary nearest the middle of the plot
  let arrow: { mid: [number, number]; up: [number, number]; dn: [number, number] } | null = null
  if (hard) {
    const l = hard.line
    const n2 = l.w[0] ** 2 + l.w[1] ** 2
    const c: [number, number] = [5, 5]
    const f = fLine(l, c)
    const mid: [number, number] = [c[0] - (f * l.w[0]) / n2, c[1] - (f * l.w[1]) / n2]
    arrow = { mid, up: [mid[0] + l.w[0] / n2, mid[1] + l.w[1] / n2], dn: [mid[0] - l.w[0] / n2, mid[1] - l.w[1] / n2] }
  }
  const width = hard ? margin(hard.line) : 0

  return (
    <Figure
      title="The widest street between two classes"
      caption={
        <>
          The SVM's line runs down the middle of the widest empty street that fits between the classes. Drag any point. A point that is not ringed
          can wander anywhere outside the street and the line does not move at all. Drag a ringed <b>support vector</b> and the whole street shifts or
          turns. Then switch on "Try your own line" and move its two handles: every other separating line has a narrower street.
        </>
      }
    >
      <Legend
        items={[
          { swatch: swatch.neg, label: 'class −1' },
          { swatch: swatch.pos, label: 'class +1' },
          { swatch: swatch.street, label: 'boundary and street' },
          { swatch: swatch.sv, label: 'support vector' },
        ]}
      />
      <Plot
        x={[0, 10]}
        y={[0, 10]}
        width={440}
        height={440}
        maxWidth={480}
        margin={{ left: 34, bottom: 34, right: 12, top: 12 }}
        ariaLabel={
          hard
            ? `Maximum-margin line with street width ${width.toFixed(2)} and ${hard.sv.pos.length + hard.sv.neg.length} support vectors.`
            : 'The classes overlap, so no straight street separates them.'
        }
      >
        <Grid xTicks={10} yTicks={10} />
        <Axes xLabel="x₁" yLabel="x₂" xTicks={5} yTicks={5} />
        {user && <Street line={user.line} color="var(--viz-5)" faint />}
        {mine && <Path points={[A, B]} color="var(--viz-5)" width={2.5} dash="2 4" />}
        {hard && <Street line={hard.line} />}
        {hard && arrow && (
          <>
            <Arrow from={arrow.mid} to={arrow.up} color="var(--viz-ink)" width={1.8} head={7} />
            <Arrow from={arrow.mid} to={arrow.dn} color="var(--viz-ink)" width={1.8} head={7} />
            <Label x={arrow.up[0]} y={arrow.up[1]} dx={8} dy={-6} color="var(--viz-ink)" weight={700}>
              {`width ${width.toFixed(2)}`}
            </Label>
          </>
        )}
        {orange.map((p, i) => (
          <DragMark
            key={`o${i}`}
            x={p[0]}
            y={p[1]}
            label={-1}
            name={`orange point ${i + 1}`}
            onChange={(x, y) => setOrange((o) => o.map((q, j) => (j === i ? [x, y] : q)))}
          />
        ))}
        {blue.map((p, i) => (
          <DragMark key={`b${i}`} x={p[0]} y={p[1]} label={1} name={`blue point ${i + 1}`} onChange={(x, y) => setBlue((o) => o.map((q, j) => (j === i ? [x, y] : q)))} />
        ))}
        {hard && hard.sv.pos.map((i) => <Ring key={`sp${i}`} x={blue[i][0]} y={blue[i][1]} r={13} width={2.5} />)}
        {hard && hard.sv.neg.map((i) => <Ring key={`sn${i}`} x={orange[i][0]} y={orange[i][1]} r={13} width={2.5} />)}
        {mine && (
          <>
            <DraggablePoint x={A[0]} y={A[1]} r={7} color="var(--viz-5)" onChange={(x, y) => setA([x, y])} label="your line" />
            <DraggablePoint x={B[0]} y={B[1]} r={7} color="var(--viz-5)" onChange={(x, y) => setB([x, y])} />
          </>
        )}
        {!hard && (
          <Label x={5} y={9.3} anchor="middle" color="var(--viz-neg)" weight={700}>
            The classes overlap: no straight street fits
          </Label>
        )}
      </Plot>
      <Controls>
        <Readout
          items={[
            ['SVM street width', hard ? width.toFixed(2) : 'none'],
            ['support vectors', hard ? String(hard.sv.pos.length + hard.sv.neg.length) : '–'],
            ['w', hard ? `(${hard.line.w[0].toFixed(2)}, ${hard.line.w[1].toFixed(2)})` : '–'],
            ['b', hard ? hard.line.b.toFixed(2) : '–'],
            ...(mine ? ([['your street', user ? user.width.toFixed(2) : 'does not separate']] as [string, string][]) : []),
          ]}
        />
        <Toggle label="Try your own line" checked={mine} onChange={setMine} />
        <Button onClick={reset}>Reset points</Button>
      </Controls>
    </Figure>
  )
}
