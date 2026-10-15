import type { CSSProperties, ReactNode } from 'react'
import { Figure, Plot, Grid, Axes, Dots, Label, VLine, usePlayer, PlayerControls, useNarrow } from '../../../../../kit'
import { Brackets, cellStyle, mono } from '../vectorised-ops-and-axes/Cells'

/*
  Standardising a (5, 3) feature table in two broadcast lines:
    mu = X.mean(axis=0); sd = X.std(axis=0); Z = (X - mu) / sd
  The (3,) rows of means and standard deviations are stretched down the 5 rows. A strip plot
  under the grids shows each feature's values on one shared axis, so the learner sees centring
  (every feature moves to 0) and scaling (every spread becomes the same).
*/

const FEATURES = ['height', 'mass', 'CCA hrs']
const X = [
  [170, 57, 1],
  [150, 49, 7],
  [165, 53, 4],
  [180, 61, 3],
  [160, 55, 5],
]
const N = X.length
const D = 3
const MU = Array.from({ length: D }, (_, j) => X.reduce((s, r) => s + r[j], 0) / N)
const SD = Array.from({ length: D }, (_, j) => Math.sqrt(X.reduce((s, r) => s + (r[j] - MU[j]) ** 2, 0) / N))
const CEN = X.map((r) => r.map((v, j) => v - MU[j]))
const Z = CEN.map((r) => r.map((v, j) => v / SD[j]))
const COLS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)']

const STEPS: { text: ReactNode; code: string }[] = [
  { text: 'X has shape (5, 3): 5 students and 3 features on very different scales. On the shared axis below, height swamps everything.', code: 'X.shape\n# (5, 3)' },
  { text: 'Step 1: one mean per column. mu = X.mean(axis=0) has shape (3,).', code: 'mu = X.mean(axis=0)\n# [165.  55.   4.]' },
  { text: 'Step 2: (5, 3) − (3,). Lined up from the right, 3 matches 3, and the missing axis counts as 1, so mu is stretched down all 5 rows (dashed copies).', code: 'X - mu\n# (5, 3) - (3,) -> (5, 3)' },
  { text: 'Step 3: every column now averages 0. The features are centred, but their spreads still differ (±15 cm against ±3 hours).', code: 'Xc = X - mu\n# column means: [0. 0. 0.]' },
  { text: 'Step 4: one standard deviation per column, sd = X.std(axis=0), shape (3,), stretched down the rows in exactly the same way.', code: 'sd = X.std(axis=0)\n# [10.  4.  2.]' },
  { text: 'Step 5: every column now has mean 0 and standard deviation 1. One broadcast line standardised all three features at once.', code: 'Z = (X - mu) / sd\n# means 0, standard deviations 1' },
]

const fmt1 = (v: number) => (Math.abs(v) < 1e-9 ? '0.0' : v.toFixed(1))
const fmt0 = (v: number) => String(Math.round(v))

function Table({ data, fmt, tone, ghostRows, size, header, label }: { data: number[][]; fmt: (v: number) => string; tone: 'plain' | 'a' | 'b' | 'c' | 'd'; ghostRows?: boolean; size: number; header?: boolean; label: ReactNode }) {
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 4 }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>{label}</div>
      {header && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${D}, ${size}px)`, gap: 3, padding: '0 10px' }}>
          {FEATURES.map((f, j) => (
            <div key={f} style={{ fontSize: '0.68rem', fontWeight: 700, color: COLS[j], textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {f}
            </div>
          ))}
        </div>
      )}
      <Brackets>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${D}, ${size}px)`, gap: 3 }}>
          {data.flatMap((row, i) =>
            row.map((v, j) => {
              const ghost = ghostRows && i > 0
              const h = size * 0.82
              const st = (
                ghost
                  ? { ...cellStyle('ghost', size), height: h, '--dy': `${-i * (h + 3)}px`, animation: `nps-stretch 0.55s cubic-bezier(.4,0,.2,1) ${i * 90}ms both` }
                  : { ...cellStyle(tone, size), height: h }
              ) as CSSProperties
              return (
                <div key={`${i}-${j}`} role="cell" className={ghost ? 'nps-ghost' : undefined} style={{ ...st, width: size, fontSize: '0.78rem' }}>
                  {fmt(v)}
                </div>
              )
            }),
          )}
        </div>
      </Brackets>
    </div>
  )
}

export default function StandardiseBroadcast() {
  const player = usePlayer({ steps: STEPS.length, interval: 2600 })
  const s = player.step
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const size = narrow ? 42 : 48
  const op: CSSProperties = { ...mono, fontSize: '1.3rem', fontWeight: 700, color: 'var(--ink-2)', alignSelf: 'center' }

  // which values the strip plot shows
  const stage = s <= 2 ? 'raw' : s <= 4 ? 'centred' : 'z'
  const vals = stage === 'raw' ? X : stage === 'centred' ? CEN : Z
  const xr: [number, number] = stage === 'raw' ? [0, 190] : stage === 'centred' ? [-20, 20] : [-2.5, 2.5]
  const muRow = [MU]
  const sdRow = [SD]
  const stretched = (row: number[]) => Array.from({ length: N }, () => row)

  return (
    <Figure
      title="Standardising every feature in one broadcast line"
      caption={
        <>
          Press Play (or step with Next). Watch the row of column means get stretched down the table and subtracted, then the row of standard
          deviations. Below, each dot is one student's value of one feature on a shared number line: centring slides every feature to 0, and dividing
          by the standard deviation gives them all the same spread.
        </>
      }
      wide
    >
      <style>{`@keyframes nps-stretch { from { transform: translateY(var(--dy)); opacity: 0 } to { transform: none; opacity: 1 } }
@media (prefers-reduced-motion: reduce) { .nps-ghost { animation: none !important } }`}</style>
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center', gap: '0.8rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'end', gap: '0.5rem 0.6rem', minHeight: 230 }}>
          {s <= 3 && <Table data={X} fmt={fmt0} tone="plain" size={size} header label="X (5, 3)" />}
          {s >= 4 && <Table data={CEN} fmt={fmt0} tone="plain" size={size} header label="X − mu" />}
          {s === 1 && <Table data={muRow} fmt={fmt0} tone="b" size={size} label="mu (3,)" />}
          {(s === 2 || s === 3) && (
            <>
              <span style={op}>−</span>
              <Table data={stretched(MU)} fmt={fmt0} tone="b" ghostRows size={size} label="mu stretched" />
            </>
          )}
          {s === 3 && (
            <>
              <span style={op}>=</span>
              <Table data={CEN} fmt={fmt0} tone="c" size={size} label="X − mu" />
            </>
          )}
          {s === 4 && <Table data={sdRow} fmt={fmt0} tone="d" size={size} label="sd (3,)" />}
          {s === 5 && (
            <>
              <span style={op}>/</span>
              <Table data={stretched(SD)} fmt={fmt0} tone="d" ghostRows size={size} label="sd stretched" />
              <span style={op}>=</span>
              <Table data={Z} fmt={fmt1} tone="c" size={size} label="Z (5, 3)" />
            </>
          )}
        </div>
        <div style={{ fontSize: '0.92rem', color: 'var(--ink)', textAlign: 'center', maxWidth: 600, minHeight: '2.8em' }} aria-live="polite">
          {STEPS[s].text}
        </div>
        <div style={{ ...mono, fontSize: '0.85rem', color: 'var(--ink-2)', background: 'var(--surface-2)', borderRadius: 8, padding: '0.3rem 0.7rem', maxWidth: '100%', overflowX: 'auto', whiteSpace: 'pre' }}>
          {STEPS[s].code}
        </div>
        <Plot
          x={xr}
          y={[-0.6, 2.6]}
          width={620}
          height={170}
          minHeight={160}
          margin={{ left: narrow ? 62 : 70, right: 14, top: 10, bottom: 30 }}
          ariaLabel={`Values of each feature on a shared axis, ${stage === 'raw' ? 'before scaling' : stage === 'centred' ? 'after centring' : 'after standardising'}`}
        >
          <Grid xTicks={8} yTicks={1} />
          <Axes xTicks={narrow ? 5 : 8} hideYTicks />
          <VLine x={0} color="var(--viz-axis)" dash="3 3" />
          {FEATURES.map((f, j) => (
            <Label key={f} x={xr[0]} y={2 - j} dx={-8} dy={4} anchor="end" color={COLS[j]} weight={700} size={12}>
              {f}
            </Label>
          ))}
          <Dots points={vals.flatMap((r) => r.map((v, j) => ({ x: v, y: 2 - j, color: COLS[j], r: 6 })))} />
        </Plot>
        <PlayerControls player={player} label={(k) => (k === 0 ? 'the data' : `step ${k} of ${STEPS.length - 1}`)} />
      </div>
    </Figure>
  )
}
