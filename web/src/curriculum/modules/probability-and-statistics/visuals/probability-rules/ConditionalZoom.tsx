import { useState } from 'react'
import { Figure, Controls, Readout, Segmented, Button, Plot, usePlot, M, useAnimationFrame } from '../../../../../kit'
import { type Box, Handle, UnitGrid, EventBox, area, overlap, overlapBox, moveBox, resizeBox, pf, tidy } from './shared'

/*
  Conditioning as zooming. Phase 1 greys out everything outside the event we are told happened;
  phase 2 zooms in until that event fills the whole frame. What is left of the other event, as a
  fraction of the frame, is the conditional probability. Switch which event is "given" to see
  that P(A | B) and P(B | A) are different fractions of different worlds.
*/

const START_A: Box = { x0: 0.35, x1: 0.95, y0: 0.3, y1: 0.8 }
const START_B: Box = { x0: 0.55, x1: 0.95, y0: 0.1, y1: 0.6 }
const DURATION = 1.1 // seconds per phase

const ease = (t: number) => t * t * (3 - 2 * t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function Shade({ c, amount }: { c: Box; amount: number }) {
  const { xs, ys, clipId } = usePlot()
  if (amount <= 0) return null
  // everything outside the given event, drawn as one path with a hole (even-odd rule)
  const outer = `M${xs(-1)},${ys(-1)}H${xs(2)}V${ys(2)}H${xs(-1)}Z`
  const inner = `M${xs(c.x0)},${ys(c.y0)}H${xs(c.x1)}V${ys(c.y1)}H${xs(c.x0)}Z`
  return <path clipPath={`url(#${clipId})`} d={outer + inner} fillRule="evenodd" style={{ fill: 'var(--surface)', opacity: 0.82 * amount }} />
}

function Frame({ c, t }: { c: Box; t: number }) {
  const { xs, ys } = usePlot()
  return (
    <rect
      x={xs(c.x0)}
      y={ys(c.y1)}
      width={xs(c.x1) - xs(c.x0)}
      height={ys(c.y0) - ys(c.y1)}
      style={{ fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: t > 0 ? 3 : 0, strokeDasharray: '8 5' }}
    />
  )
}

export default function ConditionalZoom() {
  const [A, setA] = useState<Box>(START_A)
  const [B, setB] = useState<Box>(START_B)
  const [given, setGiven] = useState<'B' | 'A'>('B')
  const [t, setT] = useState(0) // 0..2: phase 1 = grey out, phase 2 = zoom
  const [dir, setDir] = useState<0 | 1 | -1>(0)

  useAnimationFrame((dt) => {
    // dt can be slightly negative on the first frame, so ignore that and only stop at the far end
    const nv = Math.max(0, Math.min(2, t + (dir * Math.max(0, dt)) / DURATION))
    setT(nv)
    if ((dir === 1 && nv >= 2) || (dir === -1 && nv <= 0)) setDir(0)
  }, dir !== 0)

  const c = given === 'B' ? B : A
  const other = given === 'B' ? A : B
  const otherName = given === 'B' ? 'A' : 'B'
  const shade = ease(Math.min(1, t))
  const zoom = ease(Math.max(0, t - 1))
  const xd: [number, number] = [lerp(0, c.x0, zoom), lerp(1, c.x1, zoom)]
  const yd: [number, number] = [lerp(0, c.y0, zoom), lerp(1, c.y1, zoom)]

  const PA = area(A)
  const PB = area(B)
  const PAB = overlap(A, B)
  const Pc = given === 'B' ? PB : PA
  const cond = Pc > 0 ? tidy(PAB / Pc) : 0
  const atRest = t === 0 && dir === 0
  const done = t === 2
  const o = overlapBox(A, B)

  return (
    <Figure
      title="Conditioning is zooming in"
      caption={
        <>
          A is "the MRT is crowded" and B is "it is raining". Press <b>Zoom into B</b>. First, everything outside B fades: those outcomes did not happen.
          Then B is stretched to fill the frame, because it is now the whole world. The share of the frame still covered by A is P(A | B). Switch the given
          event to A and replay: the overlap is the same, but it is a different fraction of a different world. Before zooming you can drag the rectangles
          (round handle moves, square handle resizes).
        </>
      }
    >
      <Plot x={xd} y={yd} width={360} height={360} maxWidth={400} margin={{ left: 10, right: 10, top: 10, bottom: 10 }} ariaLabel={`Unit square zooming into event ${given}; P(A given B) = ${pf(PAB / PB)}`}>
        <UnitGrid />
        <EventBox r={A} color="var(--viz-1)" name={zoom > 0.6 && given === 'A' ? '' : 'A: crowded'} />
        <EventBox r={B} color="var(--viz-2)" name={zoom > 0.6 && given === 'B' ? '' : 'B: raining'} nameAt="br" />
        {o && <OverlapFill o={o} />}
        <Shade c={c} amount={shade} />
        <Frame c={c} t={t} />
        {done && <ZoomLabel given={given} otherName={otherName} share={cond} other={other} c={c} />}
        <UnitFrame />
        {atRest && (
          <>
            <Handle x={(A.x0 + A.x1) / 2} y={(A.y0 + A.y1) / 2} color="var(--viz-1)" label="move A" onMove={(x, y) => setA((r) => moveBox(r, x, y))} />
            <Handle x={A.x1} y={A.y1} shape="square" color="var(--viz-1)" label="resize A" onMove={(x, y) => setA((r) => resizeBox(r, x, y))} />
            <Handle x={(B.x0 + B.x1) / 2} y={(B.y0 + B.y1) / 2} color="var(--viz-2)" label="move B" onMove={(x, y) => setB((r) => moveBox(r, x, y))} />
            <Handle x={B.x1} y={B.y1} shape="square" color="var(--viz-2)" label="resize B" onMove={(x, y) => setB((r) => resizeBox(r, x, y))} />
          </>
        )}
      </Plot>
      <div style={{ fontSize: '1.05rem', textAlign: 'center' }}>
        {given === 'B' ? (
          <M>{`P(A \\mid B) = \\frac{P(A \\text{ and } B)}{P(B)} = \\frac{${pf(PAB)}}{${pf(PB)}} = ${pf(cond)}`}</M>
        ) : (
          <M>{`P(B \\mid A) = \\frac{P(A \\text{ and } B)}{P(A)} = \\frac{${pf(PAB)}}{${pf(PA)}} = ${pf(cond)}`}</M>
        )}
      </div>
      <Controls>
        <Button primary onClick={() => setDir(t >= 2 ? -1 : 1)}>
          {t >= 2 || dir === 1 ? 'Zoom back out' : `Zoom into ${given}`}
        </Button>
        <Segmented
          label="Given"
          value={given}
          onChange={(v) => {
            setGiven(v)
            setT(0)
            setDir(0)
          }}
          options={[
            { value: 'B', label: 'B (raining)' },
            { value: 'A', label: 'A (crowded)' },
          ]}
        />
        <Button
          onClick={() => {
            setA(START_A)
            setB(START_B)
            setT(0)
            setDir(0)
          }}
        >
          Reset
        </Button>
      </Controls>
      <Readout
        items={[
          ['P(A)', pf(PA)],
          ['P(B)', pf(PB)],
          ['P(A and B)', pf(PAB)],
          ['P(A | B)', PB > 0 ? pf(PAB / PB) : '–'],
          ['P(B | A)', PA > 0 ? pf(PAB / PA) : '–'],
        ]}
      />
    </Figure>
  )
}

function OverlapFill({ o }: { o: Box }) {
  const { xs, ys } = usePlot()
  return <rect x={xs(o.x0)} y={ys(o.y1)} width={xs(o.x1) - xs(o.x0)} height={ys(o.y0) - ys(o.y1)} style={{ fill: 'color-mix(in srgb, var(--viz-5) 30%, transparent)', stroke: 'var(--viz-ink)', strokeWidth: 1.5, strokeDasharray: '5 3' }} />
}

function UnitFrame() {
  const { xs, ys, clipId } = usePlot()
  return <rect clipPath={`url(#${clipId})`} x={xs(0)} y={ys(1)} width={xs(1) - xs(0)} height={ys(0) - ys(1)} style={{ fill: 'none', stroke: 'var(--viz-axis)', strokeWidth: 1.5 }} />
}

function ZoomLabel({ given, otherName, share, other, c }: { given: string; otherName: string; share: number; other: Box; c: Box }) {
  const { xs, ys } = usePlot()
  const o = overlapBox(other, c)
  return (
    <g>
      <text x={xs((c.x0 + c.x1) / 2)} y={ys(c.y1) + 22} textAnchor="middle" className="plot-label" style={{ fontSize: 14 }}>
        {given} is now the whole world
      </text>
      {o && (
        <text x={xs((o.x0 + o.x1) / 2)} y={ys((o.y0 + o.y1) / 2) + 5} textAnchor="middle" className="plot-label" style={{ fontSize: 14 }}>
          {otherName} covers {Math.round(share * 100)}%
        </text>
      )}
    </g>
  )
}
