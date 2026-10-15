import { useEffect, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Button, Plot, Grid, Axes, Rect, HLine, Label, M } from '../../../../../kit'

/*
  Multiply by the same factor again and again. Bars show factor^n for n = 1..30 on a log axis
  (where repeated multiplication becomes a straight staircase) or a linear one (where growth
  explodes and decay vanishes). Play grows n one step at a time. The table compares the six
  classic factors 0.25, 0.5, 0.9, 1, 1.1 and 2 after the same number of steps.
*/

const N_MAX = 30
const PRESETS = [0.25, 0.5, 0.9, 1, 1.1, 2]

/** short scientific formatting: 1.07e9, 8.67e-19, 0.0424, 17.4 */
function sci(v: number): string {
  if (v === 0) return '0'
  const a = Math.abs(v)
  if (a >= 1e7 || a < 1e-3) {
    const [m, e] = v.toExponential(2).split('e')
    return `${m.replace(/\.?0+$/, '')}e${Number(e)}`
  }
  if (a >= 1000) return Math.round(v).toLocaleString('en-GB') // e.g. 2^13 = 8,192 exactly
  return String(Number(v.toPrecision(3)))
}

/** y-axis labels on the linear axis: 80,000 written out, 2e5 and up in the lesson's e-notation */
function linTick(v: number) {
  if (Math.abs(v) < 1e5) return v.toLocaleString('en-GB', { maximumFractionDigits: 2 })
  const [m, e] = v.toExponential().split('e')
  return `${Number(Number(m).toPrecision(3))}e${Number(e)}`
}

/** y-axis labels on the log axis: the value 10^t written plainly when short */
function logTick(t: number) {
  if (!Number.isInteger(t)) return ''
  if (t === 0) return '1'
  if (t >= -2 && t <= 3) return String(10 ** t)
  return `1e${t}`
}

function words(v: number) {
  if (Math.abs(v - 1) < 1e-12) return 'stays exactly 1'
  if (v > 1e6) return 'explodes'
  if (v > 1) return 'grows'
  if (v < 1e-6) return 'vanishes (practically 0)'
  return 'shrinks'
}

export default function RepeatedMultiplier() {
  const [r, setR] = useState(0.5)
  const [n, setN] = useState(N_MAX)
  const [playing, setPlaying] = useState(false)
  const [logAxis, setLogAxis] = useState(true)

  useEffect(() => {
    if (!playing) return
    if (n >= N_MAX) {
      setPlaying(false)
      return
    }
    const t = window.setTimeout(() => setN((v) => v + 1), 170)
    return () => window.clearTimeout(t)
  }, [playing, n])

  const play = () => {
    if (n >= N_MAX) setN(1)
    setPlaying(true)
  }

  const val = (k: number) => r ** k
  const v = val(n)
  const colour = (x: number) => (Math.abs(x - 1) < 1e-12 ? 'var(--viz-muted)' : x > 1 ? 'var(--viz-2)' : 'var(--viz-1)')

  // linear axis: scale to the biggest bar on show (or 1)
  const linTop = Math.max(1, ...Array.from({ length: n }, (_, i) => val(i + 1))) * 1.08
  const y: [number, number] = logAxis ? [-19, 10] : [0, linTop]
  const toY = (x: number) => (logAxis ? Math.log10(x) : x)

  const maxAbsExp = 19

  return (
    <Figure
      title="Multiply by the same factor again and again"
      caption={
        <>
          Pick a factor and press <b>Replay</b> to multiply by it once per step. Above 1 the bars climb, below 1 they sink, and exactly 1 stays put. On the log axis each
          step moves the same distance, so the bars form a straight staircase; switch the log axis off to see the same numbers explode or vanish. Try{' '}
          <b>0.9</b> and <b>1.1</b>: factors that look harmless become <M>{'0.9^{30} \\approx 0.04'}</M> and <M>{'1.1^{30} \\approx 17'}</M>.
        </>
      }
    >
      <Segmented label="Factor presets" value={PRESETS.includes(r) ? r : -1} onChange={(p) => setR(p)} options={PRESETS.map((p) => ({ value: p, label: String(p) }))} />
      <Plot
        x={[0.3, N_MAX + 0.7]}
        y={y}
        width={520}
        height={320}
        minHeight={260}
        margin={{ left: 52 }}
        ariaLabel={`Bars of ${r} to the power n for n = 1 to ${n}, ${logAxis ? 'log' : 'linear'} axis`}
      >
        <Grid xTicks={6} yTicks={6} />
        {/* two Axes so the log-style labels apply to the y-axis only */}
        <Axes hideXTicks yTicks={6} tickFormat={logAxis ? logTick : linTick} yLabel={logAxis ? 'rⁿ (log scale)' : 'rⁿ'} />
        <Axes xLabel="n (number of multiplications)" xTicks={6} hideYTicks />
        <HLine y={logAxis ? 0 : 1} color="var(--viz-ink)" dash="5 4" width={1.2} />
        {(logAxis || r <= 1) && (
          <Label x={0.4} y={logAxis ? 0 : 1} dy={logAxis && r >= 1 ? 16 : -7} size={12} color="var(--viz-ink)">
            1 (no change)
          </Label>
        )}
        {Array.from({ length: N_MAX }, (_, i) => {
          const k = i + 1
          const x = val(k)
          const shown = k <= n
          const top = toY(x)
          return (
            <Rect
              key={k}
              x0={k - 0.36}
              x1={k + 0.36}
              y0={0}
              y1={top}
              fill={colour(x)}
              opacity={shown ? (k === n ? 1 : 0.75) : 0.08}
              rx={1.5}
            />
          )
        })}
      </Plot>
      <Controls>
        <Slider label={<>factor <M>r</M></>} value={r} min={0.25} max={2} step={0.05} onChange={(x) => setR(Math.round(x * 100) / 100)} />
        <Slider label={<>steps <M>n</M></>} value={n} min={1} max={N_MAX} step={1} onChange={(x) => (setPlaying(false), setN(x))} />
      </Controls>
      <Controls>
        <Button primary onClick={() => (playing ? setPlaying(false) : play())}>
          {playing ? 'Pause' : n >= N_MAX ? 'Replay' : 'Play'}
        </Button>
        <Toggle label="log axis" checked={logAxis} onChange={setLogAxis} />
        <Readout
          items={[
            [<M key="k">{`${r}^{${n}}`}</M>, sci(v)],
            ['so the value', words(v)],
          ]}
        />
      </Controls>

      <div style={{ width: '100%', display: 'grid', gap: 4 }} role="table" aria-label={`${PRESETS.length} factors after ${n} steps`}>
        <div role="row" style={{ display: 'grid', gridTemplateColumns: '3.2rem minmax(0, 1fr) 5.4rem', gap: 8, fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-3)' }}>
          <span role="columnheader">factor</span>
          <span role="columnheader" style={{ textAlign: 'center' }}>
            smaller ← 1 → bigger
          </span>
          <span role="columnheader" style={{ textAlign: 'right' }}>
            after {n} steps
          </span>
        </div>
        {PRESETS.map((p) => {
          const x = p ** n
          const e = Math.log10(x)
          const w = Math.min(50, (Math.abs(e) / maxAbsExp) * 50)
          const isCur = p === r
          return (
            <div
              key={p}
              role="row"
              style={{
                display: 'grid',
                gridTemplateColumns: '3.2rem minmax(0, 1fr) 5.4rem',
                gap: 8,
                alignItems: 'center',
                fontSize: '0.88rem',
                padding: '2px 0',
                fontWeight: isCur ? 800 : 500,
                color: isCur ? 'var(--ink)' : 'var(--ink-2)',
              }}
            >
              <span role="cell" className="tabular">
                {p}
              </span>
              <span role="cell" style={{ position: 'relative', height: 14, background: 'var(--surface-2)', borderRadius: 7 }} aria-hidden="true">
                <span style={{ position: 'absolute', left: '50%', top: -2, bottom: -2, width: 2, marginLeft: -1, background: 'var(--viz-ink)' }} />
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    bottom: 2,
                    borderRadius: 5,
                    background: colour(x),
                    left: e < 0 ? `${50 - w}%` : '50%',
                    width: `${Math.max(w, 0.6)}%`,
                  }}
                />
              </span>
              <span role="cell" className="tabular" style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                {sci(x)}
              </span>
            </div>
          )
        })}
      </div>
    </Figure>
  )
}
