import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Readout, Slider, Button, MatrixGrid, M, useNarrow } from '../../../../../kit'
import { matvec, matmul, transpose, solve, mse } from './linalg'

/*
  Five taxi rides: features (distance, time) → fare. X has a column of 1s so that the first
  weight acts as the base fare (the bias). The learner sets the three weights and sees every
  prediction ŷ = Xw update at once; clicking a row spells out that row's dot product.
*/

const KM = [2, 5, 8, 3, 10]
const MIN = [10, 15, 30, 20, 25]
const FARE = [6.3, 9.4, 15.0, 8.6, 15.6]
const X = KM.map((k, i) => [1, k, MIN[i]])
const BEST = solve(matmul(transpose(X), X), matvec(transpose(X), FARE)) ?? [0, 0, 0]
const START: [number, number, number] = [2, 1, 0.1]

const f2 = (v: number) => v.toFixed(2)
// weights live on the slider grid (0.01, 0.01, 0.001), so these formats show them exactly
const WF = [f2, f2, (v: number) => v.toFixed(3)]
const BEST_SNAP: [number, number, number] = [Math.round(BEST[0] * 100) / 100, Math.round(BEST[1] * 100) / 100, Math.round(BEST[2] * 1000) / 1000]

function Header({ labels, cell }: { labels: string[]; cell: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${labels.length}, ${cell}px)`,
        gap: 3,
        padding: '0 10px',
        justifyContent: 'center',
      }}
      aria-hidden="true"
    >
      {labels.map((l) => (
        <span
          key={l}
          style={{
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--ink-3)',
          }}
        >
          {l}
        </span>
      ))}
    </div>
  )
}

function Block({ title, header, children }: { title: ReactNode; header?: ReactNode; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 2 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>{title}</span>
      {header ?? <span style={{ height: 15 }} aria-hidden="true" />}
      {children}
    </div>
  )
}

const Op = ({ children }: { children: ReactNode }) => (
  <span
    style={{
      alignSelf: 'center',
      marginTop: 34,
      fontSize: 20,
      fontWeight: 700,
      color: 'var(--ink-2)',
    }}
    aria-hidden="true"
  >
    {children}
  </span>
)

export default function PredictionsAsXw() {
  const [w, setW] = useState<[number, number, number]>(START)
  const [row, setRow] = useState(2)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const pred = useMemo(() => matvec(X, w), [w])
  const err = pred.map((p, i) => FARE[i] - p)
  const loss = mse(pred, FARE)
  const best = mse(matvec(X, BEST), FARE)
  // one cell size for every column so that row i lines up across X, ŷ, y and the errors.
  // On phones the "= ŷ, y, error" group wraps onto its own line.
  const cx = narrow ? 50 : 52
  const cw = cx
  const cwW = narrow ? 56 : 58 // the w column shows 3 decimals, so it needs a little more room
  const fp = (v: number) => (Math.abs(v) < 0.005 ? '0.00' : v.toFixed(2))
  const set = (k: number) => (v: number) => setW((old) => old.map((o, i) => (i === k ? v : o)) as [number, number, number])
  const r = X[row]

  return (
    <Figure
      title="Every prediction at once: ŷ = Xw"
      caption={
        <>
          Each row of <b>X</b> is one taxi ride: a 1 (for the base fare), the distance and the time. <b>Click a row</b> to see its prediction worked out as a
          row-times-column sum. Then move the sliders: all five predictions change together, because <M>{'\\hat{y} = Xw'}</M> is one matrix product. Can you get
          the MSE below 0.1 by hand? <b>Best fit</b> jumps to the weights given by the normal equation (coming up next).
        </>
      }
    >
      <div
        ref={wrapRef}
        style={{
          width: '100%',
          display: 'grid',
          justifyItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: narrow ? 4 : 8,
          }}
        >
          <Block title="X (5×3)" header={<Header labels={['1', 'km', 'min']} cell={cx} />}>
            <MatrixGrid data={X} rows={[row]} cellSize={cx} onCellClick={(i) => setRow(i)} ariaLabel="Feature matrix X: click a row" />
          </Block>
          <Op>×</Op>
          <Block title="w (3×1)" header={<Header labels={['']} cell={cwW} />}>
            <MatrixGrid data={w.map((v, k) => [WF[k](v)])} cols={[0]} cellSize={cwW} ariaLabel="Weight vector w" />
          </Block>
          {narrow && <div style={{ flexBasis: '100%', height: 0 }} aria-hidden="true" />}
          <Op>=</Op>
          <Block title="ŷ (5×1)" header={<Header labels={['$']} cell={cw} />}>
            <MatrixGrid data={pred.map((v) => [v])} format={fp} rows={[row]} cellSize={cw} onCellClick={(i) => setRow(i)} ariaLabel="Predictions" />
          </Block>
          <div
            style={{
              display: 'flex',
              gap: narrow ? 4 : 8,
              marginLeft: narrow ? 0 : 10,
            }}
          >
            <Block title="actual y" header={<Header labels={['$']} cell={cw} />}>
              <MatrixGrid
                data={FARE.map((v) => [v])}
                format={(v) => v.toFixed(1)}
                rows={[row]}
                cellSize={cw}
                brackets={false}
                onCellClick={(i) => setRow(i)}
                ariaLabel="Actual fares"
              />
            </Block>
            <Block title="residual y − ŷ" header={<Header labels={['$']} cell={cw} />}>
              <MatrixGrid
                data={err.map((v) => [v])}
                format={fp}
                rows={[row]}
                heat
                diverging
                cellSize={cw}
                brackets={false}
                onCellClick={(i) => setRow(i)}
                ariaLabel="Residuals, y minus y-hat"
              />
            </Block>
          </div>
        </div>
        <div
          style={{
            fontSize: 'var(--step--1)',
            textAlign: 'center',
            maxWidth: '100%',
            overflowX: 'auto',
          }}
        >
          <div style={{ color: 'var(--ink-2)', fontWeight: 600, marginBottom: 2 }}>Ride {row + 1}: row of X times the column w</div>
          <M>{`\\hat{y}_{${row + 1}} = ${r[0]}(${WF[0](w[0])}) + ${r[1]}(${WF[1](w[1])}) + ${r[2]}(${WF[2](w[2])}) = ${f2(pred[row])}`}</M>
        </div>
      </div>
      <Controls>
        <Slider label="w₀: base fare ($)" value={w[0]} min={0} max={5} step={0.01} onChange={set(0)} format={f2} />
        <Slider label="w₁: $ per km" value={w[1]} min={0} max={2} step={0.01} onChange={set(1)} format={f2} />
        <Slider label="w₂: $ per minute" value={w[2]} min={0} max={0.5} step={0.001} onChange={set(2)} format={WF[2]} />
      </Controls>
      <Controls>
        <Button primary onClick={() => setW(BEST_SNAP)}>
          Best fit
        </Button>
        <Button onClick={() => setW(START)}>Reset</Button>
        <Readout
          items={[
            ['MSE = mean of (y − ŷ)²', loss.toFixed(3)],
            ['smallest possible', best.toFixed(3)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
