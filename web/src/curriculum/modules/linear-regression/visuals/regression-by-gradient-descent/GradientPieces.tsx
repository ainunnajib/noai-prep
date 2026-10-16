import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Controls, Slider, Button, Plot, Grid, Axes, Path, Dots, FnPath, MBlock, usePlayer, PlayerControls, useNarrow } from '../../../../../kit'
import { RIDES, fmt, lineText } from '../least-squares/shared'

/*
  The MSE gradient computed as a table, one column at a time:
    ŷ = wx + b,  e = ŷ − y,  e·x,  then Σ, then × 2/n, then the update.
  The learner steps through it, changes w and b to watch the gradient change sign, and can
  apply the update repeatedly to do gradient descent by hand.
*/

const N = RIDES.length
const STEP_NAMES = ['Start: the data and the current line', 'Predict: ŷ = wx + b', 'Error: e = ŷ − y', 'Error × feature: e·x', 'Add up each column', 'Scale by 2/n: the gradient', 'Update w and b']

const POS = 'var(--viz-2)' // prediction too high (e > 0)
const NEG = 'var(--viz-5)' // prediction too low (e < 0)

const cell: CSSProperties = { padding: '0.32rem 0.45rem', textAlign: 'right', borderBottom: '1px solid var(--rule)', whiteSpace: 'nowrap' }
const head: CSSProperties = { ...cell, fontWeight: 700, color: 'var(--ink-2)', background: 'var(--surface-2)', borderBottom: '1.5px solid var(--ink-3)', fontFamily: 'var(--font-body)' }

const mseOf = (w: number, b: number) => RIDES.reduce((s, [x, y]) => s + (w * x + b - y) ** 2, 0) / N
const sgn = (v: number) => (v < 0 ? `(${fmt(v, 3)})` : fmt(v, 3))

/** A gradient entry in the table: its name on a small line above its value. */
function GradCell({ name, v }: { name: string; v: number }) {
  return (
    <span style={{ display: 'inline-grid', justifyItems: 'end', lineHeight: 1.15 }}>
      <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>{name} =</span>
      <span>{fmt(v, 3)}</span>
    </span>
  )
}

function verdict(name: string, g: number): ReactNode {
  if (Math.abs(g) < 0.005) return <>{name}: gradient ≈ 0, already at its best for now.</>
  return g > 0 ? (
    <>
      {name}: gradient is <b>positive</b>, so raising {name} would raise the loss. The update <b>lowers</b> {name}.
    </>
  ) : (
    <>
      {name}: gradient is <b>negative</b>, so raising {name} would lower the loss. The update <b>raises</b> {name}.
    </>
  )
}

export default function GradientPieces() {
  const [w, setW] = useState(2)
  const [b, setB] = useState(1)
  const [eta, setEta] = useState(0.05)
  const player = usePlayer({ steps: STEP_NAMES.length, interval: 1700 })
  const s = player.step
  // start with the whole computation visible; "Replay" rebuilds it column by column
  useEffect(() => {
    player.setStep(STEP_NAMES.length - 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>()

  const rows = RIDES.map(([x, y]) => {
    const yh = w * x + b
    const e = yh - y
    return { x, y, yh, e, ex: e * x }
  })
  const sumE = rows.reduce((a, r) => a + r.e, 0)
  const sumEx = rows.reduce((a, r) => a + r.ex, 0)
  const gw = (2 / N) * sumEx
  const gb = (2 / N) * sumE
  const w2 = w - eta * gw
  const b2 = b - eta * gb
  const L1 = mseOf(w, b)
  const L2 = mseOf(w2, b2)

  const col = (k: number): CSSProperties => (s === k ? { background: 'var(--accent-soft)' } : {})
  const show = (k: number, v: ReactNode) => (s >= k ? v : <span style={{ color: 'var(--ink-3)' }}>·</span>)
  const eColour = (e: number) => (e > 1e-9 ? POS : e < -1e-9 ? NEG : 'var(--ink)')

  const reset = () => {
    setW(2)
    setB(1)
    player.pause()
    player.setStep(STEP_NAMES.length - 1)
  }

  return (
    <Figure
      title="The gradient, one column at a time"
      caption={
        <>
          Press <b>Replay</b> (or <b>Restart</b> and <b>Next</b>) to build the table one column at a time: predictions, errors, errors × x, the
          column sums, and finally the gradient and the update. Orange errors
          mean the line is too high at that ride, purple too low; the dashed green line is the line after the update. Then drag the <b>w</b> and <b>b</b> sliders (for example make the line too flat) and
          watch the gradient change sign. <b>Apply the update</b> repeatedly to do gradient descent by hand.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1fr) minmax(0, 1.15fr)', gap: '0.9rem', alignItems: 'center' }}>
        <Plot x={[0, 6]} y={[0, 12]} width={300} height={260} minHeight={220} maxWidth={440} ariaLabel={`The rides with the line ${lineText(w, b)} and the error of each ride`}>
          <Grid xTicks={6} yTicks={6} />
          <Axes xLabel="km" yLabel="fare ($)" xTicks={6} yTicks={6} />
          {rows.map((r, i) => (
            <Path key={i} points={[[r.x, r.y], [r.x, r.yh]]} color={eColour(r.e)} width={3} />
          ))}
          {s >= 6 && <FnPath f={(x) => w2 * x + b2} color="var(--viz-3)" width={2.2} dash="6 5" />}
          <FnPath f={(x) => w * x + b} color="var(--viz-ink)" width={2.5} />
          <Dots points={RIDES.map(([x, y]) => ({ x, y, r: 6, color: 'var(--viz-1)' }))} />
        </Plot>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
            <thead>
              <tr>
                <th style={head}>x</th>
                <th style={head}>y</th>
                <th style={{ ...head, ...col(1) }}>ŷ</th>
                <th style={{ ...head, ...col(2) }}>e</th>
                <th style={{ ...head, ...col(3) }}>e·x</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={cell}>{r.x}</td>
                  <td style={cell}>{r.y}</td>
                  <td style={{ ...cell, ...col(1) }}>{show(1, fmt(r.yh, 3))}</td>
                  <td style={{ ...cell, ...col(2), color: s >= 2 ? eColour(r.e) : undefined, fontWeight: 700 }}>{show(2, fmt(r.e, 3))}</td>
                  <td style={{ ...cell, ...col(3) }}>{show(3, fmt(r.ex, 3))}</td>
                </tr>
              ))}
              <tr>
                <td style={{ ...cell, textAlign: 'left', fontFamily: 'var(--font-body)', fontWeight: 700 }} colSpan={3}>
                  Σ (sum)
                </td>
                <td style={{ ...cell, ...col(4), fontWeight: 700 }}>{show(4, fmt(sumE, 3))}</td>
                <td style={{ ...cell, ...col(4), fontWeight: 700 }}>{show(4, fmt(sumEx, 3))}</td>
              </tr>
              <tr>
                <td style={{ ...cell, textAlign: 'left', fontFamily: 'var(--font-body)', fontWeight: 700, borderBottom: 'none' }} colSpan={3}>
                  × 2/n = gradient
                </td>
                <td style={{ ...cell, ...col(5), fontWeight: 700, borderBottom: 'none', color: s >= 5 ? 'var(--accent)' : undefined }}>{show(5, <GradCell name="∂L/∂b" v={gb} />)}</td>
                <td style={{ ...cell, ...col(5), fontWeight: 700, borderBottom: 'none', color: s >= 5 ? 'var(--accent)' : undefined }}>{show(5, <GradCell name="∂L/∂w" v={gw} />)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ width: '100%', minHeight: '5.6rem' }}>
        {s <= 4 && (
          <MBlock>{`\\hat y_i = w x_i + b,\\qquad e_i = \\hat y_i - y_i \\qquad (w = ${fmt(w, 3)},\\ b = ${fmt(b, 3)})`}</MBlock>
        )}
        {s === 5 && (
          <MBlock>{`\\begin{aligned}
\\frac{\\partial L}{\\partial w} &= \\tfrac{2}{n}\\textstyle\\sum e_i x_i = \\tfrac{2}{5} \\times ${sgn(sumEx)} = ${fmt(gw, 3)} \\\\
\\frac{\\partial L}{\\partial b} &= \\tfrac{2}{n}\\textstyle\\sum e_i = \\tfrac{2}{5} \\times ${sgn(sumE)} = ${fmt(gb, 3)}
\\end{aligned}`}</MBlock>
        )}
        {s >= 6 && (
          <MBlock>{`\\begin{aligned}
w &\\leftarrow ${fmt(w, 3)} - ${eta.toFixed(2)} \\times ${sgn(gw)} = ${fmt(w2, 3)} \\\\
b &\\leftarrow ${fmt(b, 3)} - ${eta.toFixed(2)} \\times ${sgn(gb)} = ${fmt(b2, 3)} \\\\
\\text{MSE} &\\text{: } ${fmt(L1, 3)} \\to ${fmt(L2, 3)}
\\end{aligned}`}</MBlock>
        )}
      </div>
      {s >= 5 && (
        <div style={{ width: '100%', fontSize: '0.875rem', color: 'var(--ink-2)', display: 'grid', gap: '0.2rem' }}>
          <div>{verdict('w', gw)}</div>
          <div>{verdict('b', gb)}</div>
        </div>
      )}
      <PlayerControls player={player} label={(k) => `${k + 1}/${STEP_NAMES.length}: ${STEP_NAMES[k]}`} />
      <Controls>
        <Slider label="slope w" value={w} min={-1} max={4} step={0.1} onChange={setW} format={(v) => fmt(v, 3)} />
        <Slider label="intercept b" value={b} min={-3} max={6} step={0.1} onChange={setB} format={(v) => fmt(v, 3)} />
        <Slider label="learning rate η" value={eta} min={0.01} max={0.08} step={0.01} onChange={setEta} format={(v) => v.toFixed(2)} />
      </Controls>
      <Controls>
        <Button
          primary
          onClick={() => {
            setW(Math.round(w2 * 1000) / 1000)
            setB(Math.round(b2 * 1000) / 1000)
            player.setStep(STEP_NAMES.length - 1)
          }}
        >
          Apply the update
        </Button>
        <Button onClick={reset}>Reset to w = 2, b = 1</Button>
      </Controls>
    </Figure>
  )
}
