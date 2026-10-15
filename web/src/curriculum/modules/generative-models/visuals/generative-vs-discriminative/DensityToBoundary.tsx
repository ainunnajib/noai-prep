import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Plot, Grid, Axes, FnPath, Path, Dots, VLine, HLine, Label, DraggablePoint, M } from '../../../../../kit'

/*
  One feature x, two classes. A generative model stores the two hills h_k(x) = p(x | k) P(k)
  (normal curves with means you can drag, equal width SD), and gets everything else from them:
     p(x) = h_A(x) + h_B(x)                      (how typical x is)
     P(B | x) = h_B(x) / (h_A(x) + h_B(x))       (Bayes' rule: the classifier)
  A discriminative model learns only the bottom curve P(B | x).
*/

const SD = 1.1
const XD: [number, number] = [0, 12]
const normal = (x: number, mu: number) => Math.exp(-0.5 * ((x - mu) / SD) ** 2) / (SD * Math.sqrt(2 * Math.PI))
const COLA = 'var(--viz-1)'
const COLB = 'var(--viz-2)'
const head: CSSProperties = { fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink-2)', margin: '0.2rem 0 0.1rem', textAlign: 'center' }

export default function DensityToBoundary() {
  const [muA, setMuA] = useState(4)
  const [muB, setMuB] = useState(7.5)
  const [priorB, setPriorB] = useState(0.4)
  const [x, setX] = useState(6)
  const [discOnly, setDiscOnly] = useState(false)

  const hA = (t: number) => normal(t, muA) * (1 - priorB)
  const hB = (t: number) => normal(t, muB) * priorB
  const post = (t: number) => hB(t) / (hA(t) + hB(t))
  const a = hA(x)
  const b = hB(x)
  const px = a + b
  const pb = post(x)
  const peakA = normal(muA, muA) * (1 - priorB)
  const peakB = normal(muB, muB) * priorB
  const unusual = px < 0.005
  const yTop = 0.42
  const area = (h: (t: number) => number) => {
    const pts: [number, number][] = [[XD[0], 0]]
    for (let i = 0; i <= 160; i++) {
      const t = XD[0] + ((XD[1] - XD[0]) * i) / 160
      pts.push([t, h(t)])
    }
    pts.push([XD[1], 0])
    return pts
  }
  // no e-notation: tiny heights read as 0.0002, or ≈ 0 when they round to nothing
  const fmt = (v: number) => (v < 0.00005 ? '≈ 0' : v < 0.001 ? v.toFixed(4) : v.toFixed(3))
  const tick = (v: number) => (v === 0 ? '0' : Number.isInteger(v) ? String(v) : v.toFixed(1))

  return (
    <Figure
      title="From two hills to one classifier"
      caption={
        <>
          Top: what a generative model knows, a hill <M>{'p(x \\mid y)\\,P(y)'}</M> for each class (drag the peaks; slide the class share). Bottom: the classifier you get by
          dividing, <M>{'P(B \\mid x)'}</M> = orange height ÷ (blue height + orange height). Now slide <M>x</M> to 11.5: the classifier is almost 100% sure it is B,
          yet both hills are flat there, so <M>{'p(x)'}</M> warns that no training data looked like this. Switch on the toggle to keep only the bottom curve, which is all a
          discriminative model learns: that warning is gone.
        </>
      }
    >
      <div style={head}>{discOnly ? 'Hidden: a discriminative model never learns these hills' : 'What a generative model learns: p(x | y) P(y) for each class'}</div>
      <Plot x={XD} y={[0, yTop]} width={520} height={210} minHeight={200} margin={{ left: 46, bottom: 30, top: 10 }} ariaLabel="Two class hills over one feature x, and their sum">
        <Grid xTicks={12} yTicks={4} />
        {!discOnly && (
          <>
            <Path points={area(hA)} closed fill="color-mix(in srgb, var(--viz-1) 16%, transparent)" color="none" width={0} />
            <Path points={area(hB)} closed fill="color-mix(in srgb, var(--viz-2) 18%, transparent)" color="none" width={0} />
            <FnPath f={hA} color={COLA} width={2.5} />
            <FnPath f={hB} color={COLB} width={2.5} />
            <FnPath f={(t) => hA(t) + hB(t)} color="var(--viz-ink)" width={1.8} dash="5 4" opacity={0.75} />
            <Label x={muA} y={peakA} dy={-8} anchor="middle" color={COLA} weight={700}>
              A
            </Label>
            <Label x={muB} y={peakB} dy={-8} anchor="middle" color={COLB} weight={700}>
              B
            </Label>
            <Dots
              points={[
                { x, y: a, color: COLA, r: 4.5 },
                { x, y: b, color: COLB, r: 4.5 },
              ]}
            />
          </>
        )}
        {discOnly && (
          <Label x={6} y={yTop * 0.55} anchor="middle" color="var(--viz-muted)" size={13} weight={600}>
            no hills stored: nothing to sample from
          </Label>
        )}
        <VLine x={x} color="var(--viz-ink)" dash="3 3" />
        <Axes xTicks={6} yTicks={4} yLabel="height" tickFormat={tick} />
        {!discOnly && (
          <>
            <DraggablePoint x={muA} y={peakA} lockY color={COLA} r={7} onChange={(nx) => setMuA(Math.round(Math.min(10.5, Math.max(1, nx)) * 10) / 10)} label="" ariaLabel="class A peak" />
            <DraggablePoint x={muB} y={peakB} lockY color={COLB} r={7} onChange={(nx) => setMuB(Math.round(Math.min(11, Math.max(1.5, nx)) * 10) / 10)} label="" ariaLabel="class B peak" />
          </>
        )}
      </Plot>
      <div style={head}>What both kinds of model can give you: P(B | x)</div>
      <Plot x={XD} y={[0, 1]} width={520} height={160} minHeight={140} margin={{ left: 46, bottom: 42, top: 10 }} ariaLabel="The probability of class B given x, an S-shaped curve">
        <Grid xTicks={12} yTicks={2} />
        <HLine y={0.5} />
        <FnPath f={post} color={COLB} width={2.8} />
        <VLine x={x} color="var(--viz-ink)" dash="3 3" />
        <Dots points={[{ x, y: pb, color: COLB, r: 5 }]} />
        <Label x={x} y={pb} dx={x > 9 ? -10 : 10} dy={pb > 0.8 ? 16 : -8} anchor={x > 9 ? 'end' : 'start'} weight={700}>
          {pb.toFixed(2)}
        </Label>
        <Axes xTicks={6} yTicks={2} xLabel="feature x" />
      </Plot>
      <p style={{ textAlign: 'center', fontSize: '0.875rem', margin: '0.35rem 0 0', color: unusual ? 'var(--viz-neg)' : 'var(--ink-2)', fontWeight: unusual ? 700 : 400, minHeight: '1.4em' }}>
        {unusual
          ? discOnly
            ? 'A discriminative model would simply answer "B" here, with no warning.'
            : `p(x) = ${fmt(px)}: almost no training data looks like this. Be suspicious!`
          : `p(x) = ${fmt(px)}: this x is typical enough.`}
      </p>
      <Controls>
        <Slider label={<>feature value <M>x</M></>} value={x} min={0} max={12} step={0.1} onChange={setX} format={(v) => v.toFixed(1)} />
        <Slider label={<>class share <M>{'P(B)'}</M></>} value={priorB} min={0.1} max={0.9} step={0.05} onChange={setPriorB} format={(v) => v.toFixed(2)} />
        <Toggle label="Keep only what a discriminative model learns" checked={discOnly} onChange={setDiscOnly} />
        <Readout
          items={
            discOnly
              ? [['P(B | x)', pb.toFixed(3)]]
              : [
                  ['blue height', fmt(a)],
                  ['orange height', fmt(b)],
                  ['P(B | x) = orange ÷ total', pb.toFixed(3)],
                  ['p(x) = total', fmt(px)],
                ]
          }
        />
      </Controls>
    </Figure>
  )
}
