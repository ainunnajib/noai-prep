import { useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Grid, Axes, Rect, VLine, Label, Arrow, DraggablePoint, useNarrow } from '../../../../../kit'
import { DigitImg, decodeImg, Tiny } from './digits'
import { ANOM } from './aeData'

/*
  Anomaly detection with an autoencoder (k = 8) trained only on handwritten digits.
  The histogram shows the reconstruction errors of 297 normal test digits. Pick an input to see its
  reconstruction and error; anything whose error is above the threshold gets flagged.
*/

const XMAX = 0.1
const BIN = 0.004
const card: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }

export default function AnomalyDetector() {
  const items = ANOM.items
  const [sel, setSel] = useState(items.findIndex((d) => d.name === 'smiley face'))
  const [thr, setThr] = useState(0.04)
  const [ref, narrow] = useNarrow<HTMLDivElement>(520)

  const bins = useMemo(() => {
    const n = Math.ceil(XMAX / BIN)
    const c = new Array(n).fill(0)
    for (const e of ANOM.normal) c[Math.min(n - 1, Math.floor(e / BIN))]++
    return c as number[]
  }, [])
  const yMax = Math.max(...bins) * 1.18
  const it = items[sel]
  const x = useMemo(() => decodeImg(it.x), [it])
  const rec = useMemo(() => decodeImg(it.rec), [it])
  const errMap = x.map((v, i) => Math.abs(v - rec[i]))
  const flagged = it.err > thr
  const falseAlarms = ANOM.normal.filter((e) => e > thr).length
  const oddItems = items.filter((d) => d.odd)
  const caught = oddItems.filter((d) => d.err > thr).length
  const big = narrow ? 64 : 84
  const markCol = it.odd ? 'var(--viz-4)' : 'var(--viz-3)'

  return (
    <Figure
      wide
      title="Spot the odd one out by its reconstruction error"
      caption={
        <>
          This autoencoder (bottleneck 8) was trained only on handwritten digits. The blue bars are the reconstruction errors of 297 real test digits: almost all are
          small. Pick an input below. The odd ones (a smiley, a letter, static) come back badly mangled and land far to the right. Then drag the threshold: set it too low
          and real digits trigger false alarms; too high and the upside-down 7 slips through.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.25rem', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={card}>
            <DigitImg px={x} size={big} label={`input: ${it.name}`} />
            <Tiny>input</Tiny>
          </div>
          <div style={card}>
            <DigitImg px={rec} size={big} label={`reconstruction of ${it.name}`} />
            <Tiny>reconstruction</Tiny>
          </div>
          <div style={card}>
            <DigitImg px={errMap} size={big} tone="error" label="error map" />
            <Tiny>error map</Tiny>
          </div>
        </div>
        <div style={{ textAlign: 'center', minWidth: 170 }} aria-live="polite">
          <div style={{ fontSize: '0.8125rem', color: 'var(--ink-2)' }}>{it.name}</div>
          <div className="tabular" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)' }}>
            error = {it.err.toFixed(3)}
          </div>
          <div
            style={{
              marginTop: 4,
              display: 'inline-block',
              padding: '0.15rem 0.6rem',
              borderRadius: 999,
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: flagged ? 'var(--bad)' : 'var(--ok)',
              background: flagged ? 'var(--bad-soft)' : 'var(--ok-soft)',
            }}
          >
            {flagged ? 'flagged: anomaly' : 'passes as normal'}
          </div>
        </div>
      </div>

      <Plot x={[0, XMAX + 0.004]} y={[0, yMax]} width={560} height={210} minHeight={190} margin={{ left: 40, bottom: 34, top: 14, right: 12 }} ariaLabel="Histogram of reconstruction errors of normal digits, with a threshold line">
        <Grid xTicks={10} yTicks={4} />
        {bins.map((c, i) =>
          c > 0 ? (
            <Rect
              key={i}
              x0={i * BIN + 0.0003}
              x1={(i + 1) * BIN - 0.0003}
              y0={0}
              y1={c}
              rx={1.5}
              fill={(i + 0.5) * BIN > thr ? 'color-mix(in srgb, var(--viz-neg) 70%, var(--surface))' : 'color-mix(in srgb, var(--viz-1) 55%, var(--surface))'}
            />
          ) : null,
        )}
        <VLine x={thr} color="var(--viz-neg)" dash="6 4" width={2} />
        <Label x={thr} y={yMax * 0.7} dx={6} color="var(--viz-neg)" weight={700} size={12}>
          threshold
        </Label>
        {it.err <= XMAX ? (
          <>
            <VLine x={it.err} color={markCol} dash="" width={2.5} />
            <Label x={it.err} y={yMax * 0.45} dx={it.err > 0.07 ? -6 : 6} anchor={it.err > 0.07 ? 'end' : 'start'} color={markCol} weight={700} size={12}>
              {it.name}
            </Label>
          </>
        ) : (
          <>
            <Arrow from={[XMAX - 0.022, yMax * 0.45]} to={[XMAX + 0.003, yMax * 0.45]} color={markCol} width={2.5} />
            <Label x={XMAX + 0.003} y={yMax * 0.45} dy={-10} anchor="end" color={markCol} weight={700} size={12}>
              {`${it.name}: ${it.err.toFixed(2)}, off the chart`}
            </Label>
          </>
        )}
        <Axes xTicks={5} yTicks={4} xLabel="reconstruction error" yLabel="number of real test digits" tickFormat={(v) => (v === 0 ? '0' : v < 1 ? v.toFixed(2) : String(v))} />
        {/* drawn after the axes so the axis line and tick labels never sit on top of the handle */}
        <DraggablePoint
          x={thr}
          y={0}
          lockY
          r={8}
          color="var(--viz-neg)"
          ariaLabel={`threshold, ${thr.toFixed(3)}`}
          onChange={(nx) => setThr(Math.round(Math.max(0.005, Math.min(XMAX, nx)) * 1000) / 1000)}
        />
      </Plot>

      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center', margin: '0.5rem 0 0.3rem' }}>Pick an input</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 6, maxWidth: 520, margin: '0 auto' }}>
        {items.map((d, i) => (
          <button
            key={d.name}
            type="button"
            onClick={() => setSel(i)}
            aria-pressed={i === sel}
            aria-label={`${d.name}, error ${d.err.toFixed(3)}`}
            style={{
              padding: '4px 2px',
              borderRadius: 8,
              border: i === sel ? '2px solid var(--viz-5)' : '1px solid var(--rule)',
              background: i === sel ? 'color-mix(in srgb, var(--viz-5) 10%, var(--surface))' : 'var(--surface)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              minWidth: 0,
            }}
          >
            <DigitImg px={decodeImg(d.x)} size={34} label={d.name} />
            <span style={{ fontSize: '0.6875rem', lineHeight: 1.15, color: d.odd ? 'var(--viz-4)' : 'var(--ink-2)', textAlign: 'center', fontWeight: 600 }}>{d.name}</span>
          </button>
        ))}
      </div>
      <Controls>
        <Slider label="threshold" value={thr} min={0.005} max={XMAX} step={0.001} onChange={setThr} format={(v) => v.toFixed(3)} />
        <Readout
          items={[
            ['false alarms (real digits flagged)', `${falseAlarms} of ${ANOM.normal.length}`],
            ['odd inputs caught', `${caught} of ${oddItems.length}`],
          ]}
        />
      </Controls>
    </Figure>
  )
}
