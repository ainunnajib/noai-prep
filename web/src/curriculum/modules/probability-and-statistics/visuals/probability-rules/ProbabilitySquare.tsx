import { useState } from 'react'
import { Figure, Controls, Readout, Segmented, Button, Plot, usePlot, MBlock, useNarrow } from '../../../../../kit'
import { type Box, Handle, UnitGrid, EventBox, area, overlap, overlapBox, moveBox, resizeBox, snap, clamp, tidy, pf } from './shared'

/*
  Probability as area. All outcomes fill a unit square (100 small cells = 100 equally likely
  outcomes); an event's probability is its area. Two rectangles A and B can be moved (round
  handle) and resized (square handle). Readouts give P(A), P(B), P(A and B), P(A or B) and
  test for "mutually exclusive" (no overlap) and "independent" (overlap = P(A)P(B)).
  "Independent" mode turns A into a full-height strip and B into a full-width strip, which
  forces the overlap to be exactly P(A) x P(B).
*/

type Mode = 'free' | 'indep'

const START_A: Box = { x0: 0.1, x1: 0.6, y0: 0.3, y1: 0.9 }
const START_B: Box = { x0: 0.4, x1: 0.9, y0: 0.1, y1: 0.6 }
const APART_A: Box = { x0: 0, x1: 0.5, y0: 0.4, y1: 1 }
const APART_B: Box = { x0: 0.5, x1: 1, y0: 0, y1: 0.5 }

function OverlapMark({ a, b }: { a: Box; b: Box }) {
  const { xs, ys } = usePlot()
  const o = overlapBox(a, b)
  if (!o) return null
  const W = xs(o.x1) - xs(o.x0)
  const H = ys(o.y0) - ys(o.y1)
  return (
    <g>
      <rect x={xs(o.x0)} y={ys(o.y1)} width={W} height={H} style={{ fill: 'color-mix(in srgb, var(--viz-5) 30%, transparent)', stroke: 'var(--viz-ink)', strokeWidth: 1.5, strokeDasharray: '5 3' }} />
      {W > 54 && H > 22 && (
        <text x={xs(o.x0) + W / 2} y={ys(o.y1) + H / 2 + 4} textAnchor="middle" className="plot-label" style={{ fontSize: 12 }}>
          A and B
        </text>
      )}
    </g>
  )
}

export default function ProbabilitySquare() {
  const [mode, setMode] = useState<Mode>('free')
  const [A, setA] = useState<Box>(START_A)
  const [B, setB] = useState<Box>(START_B)
  const [pa, setPa] = useState(0.5)
  const [pb, setPb] = useState(0.4)

  const a = mode === 'free' ? A : { x0: 0, x1: pa, y0: 0, y1: 1 }
  const b = mode === 'free' ? B : { x0: 0, x1: 1, y0: 0, y1: pb }
  const PA = area(a)
  const PB = area(b)
  const PAB = overlap(a, b)
  const POR = tidy(PA + PB - PAB)
  const prod = tidy(PA * PB)
  const exclusive = PAB === 0
  const independent = Math.abs(PAB - prod) < 1e-9
  const [ref, narrow] = useNarrow<HTMLDivElement>()
  const sum = `${pf(PA)} + ${pf(PB)} - ${pf(PAB)} = ${pf(POR)}`

  return (
    <Figure
      title="Probability is area"
      caption={
        <>
          The square holds every possible outcome, and its total area is 1 (think of 100 equally likely outcomes, one per small cell). An event's probability is
          its area. Drag a round handle to move a rectangle and a square handle to resize it. Press <b>Pull them apart</b> to make the events mutually exclusive,
          then compare P(A) × P(B) with the overlap. Switch to <b>independent</b>: now A is a vertical strip and B a horizontal strip, so the overlap is always exactly
          P(A) × P(B).
        </>
      }
    >
      <Plot x={[0, 1]} y={[0, 1]} width={360} height={360} maxWidth={400} margin={{ left: 10, right: 10, top: 10, bottom: 10 }} ariaLabel={`Unit square with event A of area ${pf(PA)} and event B of area ${pf(PB)}, overlapping in area ${pf(PAB)}`}>
        <UnitGrid />
        <EventBox r={a} color="var(--viz-1)" name="A" />
        <EventBox r={b} color="var(--viz-2)" name="B" nameAt="br" />
        <OverlapMark a={a} b={b} />
        <SquareFrame />
        {mode === 'free' ? (
          <>
            <Handle x={(A.x0 + A.x1) / 2} y={(A.y0 + A.y1) / 2} color="var(--viz-1)" label="move A" onMove={(x, y) => setA((r) => moveBox(r, x, y))} />
            <Handle x={A.x1} y={A.y1} shape="square" color="var(--viz-1)" label="resize A" onMove={(x, y) => setA((r) => resizeBox(r, x, y))} />
            <Handle x={(B.x0 + B.x1) / 2} y={(B.y0 + B.y1) / 2} color="var(--viz-2)" label="move B" onMove={(x, y) => setB((r) => moveBox(r, x, y))} />
            <Handle x={B.x1} y={B.y1} shape="square" color="var(--viz-2)" label="resize B" onMove={(x, y) => setB((r) => resizeBox(r, x, y))} />
          </>
        ) : (
          <>
            <Handle x={pa} y={0.88} shape="square" color="var(--viz-1)" label="P(A): width of strip A" onMove={(x) => setPa(tidy(clamp(snap(x), 0.05, 0.95)))} />
            <Handle x={0.88} y={pb} shape="square" color="var(--viz-2)" label="P(B): height of strip B" onMove={(_, y) => setPb(tidy(clamp(snap(y), 0.05, 0.95)))} />
          </>
        )}
      </Plot>
      <div ref={ref} style={{ width: '100%' }}>
        <MBlock>
          {narrow
            ? `\\begin{aligned}P(A \\cup B) &= P(A) + P(B) - P(A \\cap B) \\\\ &= ${sum}\\end{aligned}`
            : `P(A \\text{ or } B) = P(A) + P(B) - P(A \\text{ and } B) = ${sum}`}
        </MBlock>
      </div>
      <Readout
        items={[
          ['P(A)', pf(PA)],
          ['P(B)', pf(PB)],
          ['P(A and B)', pf(PAB)],
          ['P(A or B)', pf(POR)],
          ['P(A) × P(B)', pf(prod)],
        ]}
      />
      <div style={{ width: '100%', display: 'grid', gap: '0.35rem', fontSize: '0.9rem' }}>
        <Verdict ok={exclusive} label="Mutually exclusive?" yes="yes: the overlap is 0, they never happen together" no={`no: they overlap in area ${pf(PAB)}`} />
        <Verdict
          ok={independent}
          label="Independent?"
          yes={`yes: P(A and B) = ${pf(PAB)} = P(A) × P(B)`}
          no={`no: P(A and B) = ${pf(PAB)}, but P(A) × P(B) = ${pf(prod)}`}
        />
      </div>
      <Controls>
        <Segmented
          label="Rectangles"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'free', label: 'free' },
            { value: 'indep', label: 'independent (strips)' },
          ]}
        />
        {mode === 'free' && (
          <>
            <Button
              onClick={() => {
                setA(APART_A)
                setB(APART_B)
              }}
            >
              Pull them apart
            </Button>
            <Button
              onClick={() => {
                setA(START_A)
                setB(START_B)
              }}
            >
              Reset
            </Button>
          </>
        )}
      </Controls>
    </Figure>
  )
}

function SquareFrame() {
  const { xs, ys } = usePlot()
  return <rect x={xs(0)} y={ys(1)} width={xs(1) - xs(0)} height={ys(0) - ys(1)} style={{ fill: 'none', stroke: 'var(--viz-axis)', strokeWidth: 1.5 }} />
}

function Verdict({ ok, label, yes, no }: { ok: boolean; label: string; yes: string; no: string }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--ink-3)' }}>{label}</span>
      <span style={{ fontWeight: 650, color: ok ? 'var(--ok)' : 'var(--ink)' }}>{ok ? yes : no}</span>
    </div>
  )
}
