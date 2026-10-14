import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Controls, Segmented, Button, useContainerWidth } from '../../../../../kit'
import { N, CLASSES, TRUTH, PRED0, classStats, meanIoU, f2, f3, type Grid, type AbsentRule } from './scene'

/*
  Paint the prediction, watch the counts. The selected class drives both the brush and the overlap view:
  solid = intersection (both say this class), light = predicted only, outlined = true only. The union is every marked cell.
  Per-class IoU bars and mean IoU update live, with a choice of rule for a class whose union is 0 (bicycle, unless you paint one).
*/

function GridView({
  grid,
  cell,
  label,
  paint,
  overlay,
  ariaLabel,
}: {
  grid: Grid
  cell: number
  label: ReactNode
  paint?: (k: number) => void
  overlay?: { c: number; truth: Grid }
  ariaLabel: string
}) {
  const S = cell * N
  const svgRef = useRef<SVGSVGElement>(null)
  const painting = useRef(false)
  const cellAt = (e: React.PointerEvent) => {
    const r = svgRef.current?.getBoundingClientRect()
    if (!r) return -1
    const j = Math.floor(((e.clientX - r.left) / r.width) * N)
    const i = Math.floor(((e.clientY - r.top) / r.height) * N)
    return i >= 0 && i < N && j >= 0 && j < N ? i * N + j : -1
  }
  const rects: ReactNode[] = []
  grid.forEach((v, k) => {
    const i = Math.floor(k / N)
    const j = k % N
    const x = j * cell
    const y = i * cell
    if (!overlay) {
      rects.push(<rect key={k} x={x} y={y} width={cell} height={cell} style={{ fill: CLASSES[v].color, stroke: 'var(--surface)', strokeWidth: 1 }} />)
      return
    }
    const p = v === overlay.c
    const t = overlay.truth[k] === overlay.c
    const col = CLASSES[overlay.c].color
    if (p && t) rects.push(<rect key={k} x={x} y={y} width={cell} height={cell} style={{ fill: col, stroke: 'var(--surface)', strokeWidth: 1 }} />)
    else if (p)
      rects.push(
        <g key={k}>
          <rect x={x} y={y} width={cell} height={cell} style={{ fill: `color-mix(in srgb, ${col} 30%, var(--surface))`, stroke: 'var(--surface)', strokeWidth: 1 }} />
          <line x1={x + 2} y1={y + cell - 2} x2={x + cell - 2} y2={y + 2} style={{ stroke: col, strokeWidth: 1.4 }} />
        </g>,
      )
    else if (t)
      rects.push(<rect key={k} x={x + 1.5} y={y + 1.5} width={cell - 3} height={cell - 3} style={{ fill: 'var(--surface)', stroke: col, strokeWidth: 2 }} />)
    else rects.push(<rect key={k} x={x} y={y} width={cell} height={cell} style={{ fill: 'var(--surface-2)', stroke: 'var(--surface)', strokeWidth: 1 }} />)
  })
  return (
    <div style={{ display: 'grid', gap: '0.25rem', justifyItems: 'center' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center' }}>{label}</div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${S} ${S}`}
        width={S}
        height={S}
        role="img"
        aria-label={ariaLabel}
        style={{ display: 'block', touchAction: paint ? 'none' : undefined, cursor: paint ? 'crosshair' : undefined, borderRadius: 4, outline: paint ? '2px solid var(--accent-line)' : undefined }}
        onPointerDown={
          paint
            ? (e) => {
                painting.current = true
                ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
                const k = cellAt(e)
                if (k >= 0) paint(k)
              }
            : undefined
        }
        onPointerMove={
          paint
            ? (e) => {
                if (!painting.current) return
                const k = cellAt(e)
                if (k >= 0) paint(k)
              }
            : undefined
        }
        onPointerUp={paint ? () => (painting.current = false) : undefined}
        onPointerCancel={paint ? () => (painting.current = false) : undefined}
      >
        {rects}
      </svg>
    </div>
  )
}

const pre: CSSProperties = {
  margin: 0,
  padding: '0.55rem 0.75rem',
  background: 'var(--surface-2)',
  borderRadius: 8,
  fontFamily: 'var(--font-mono)',
  fontSize: '0.8rem',
  lineHeight: 1.5,
  color: 'var(--ink)',
  whiteSpace: 'pre',
  overflowX: 'auto',
  width: '100%',
  boxSizing: 'border-box',
}

export default function MaskIoUPainter() {
  const [pred, setPred] = useState<Grid>(PRED0)
  const [brush, setBrush] = useState(2)
  const [rule, setRule] = useState<AbsentRule>('skip')
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(640)
  const threeAcross = width >= 600
  const cell = threeAcross ? Math.max(12, Math.min(19, Math.floor((width - 48) / 36))) : Math.max(11, Math.min(18, Math.floor((width - 20) / 24)))

  const stats = classStats(pred, TRUTH)
  const m = meanIoU(stats, rule)
  const sel = stats[brush]
  const acc = pred.reduce((a, v, k) => a + (v === TRUTH[k] ? 1 : 0), 0) / (N * N)
  const paint = (k: number) => setPred((g) => (g[k] === brush ? g : g.map((v, q) => (q === k ? brush : v))))

  const iouTxt = (s: (typeof stats)[number]) => (s.iou === null ? (rule === 'skip' ? 'skipped' : rule === 'one' ? '0/0 → 1' : '0/0 → 0') : f2(s.iou))
  const codeLines: [string, string][] = [
    [`p = (pred == ${brush})`, `${sel.nPred} pixels`],
    [`t = (true == ${brush})`, `${sel.nTrue} pixels`],
    ['inter = (p & t).sum()', String(sel.inter)],
    ['union = (p | t).sum()', String(sel.union)],
    ['iou = inter / union', sel.union === 0 ? '0/0: undefined!' : f3(sel.inter / sel.union)],
  ]
  const code = codeLines.map(([a, b]) => `${a.padEnd(23)}# ${b}`).join('\n')

  return (
    <Figure
      title="Paint a prediction, count the overlap"
      caption={
        <>
          Pick a class, then click or drag on the <b>prediction</b> to paint it. The overlap view shows the chosen class only:{' '}
          <b>solid</b> cells are the intersection (both maps say this class), and the union is every marked cell. Fix the car and watch its IoU
          rise. Then paint a single bicycle pixel: a class that is absent from the truth suddenly counts, with IoU 0. Switch the rule for
          classes with union 0 and see the mean change.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.9rem 1rem' }}>
        <GridView grid={TRUTH} cell={cell} label="truth (fixed)" ariaLabel="Ground-truth label map" />
        <GridView grid={pred} cell={cell} label={<>prediction (paint here)</>} paint={paint} ariaLabel="Predicted label map. Click or drag to paint the selected class." />
        <GridView grid={pred} cell={cell} label={<>overlap for {CLASSES[brush].name}</>} overlay={{ c: brush, truth: TRUTH }} ariaLabel={`Overlap for class ${CLASSES[brush].name}`} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem 1rem', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--ink-2)' }}>
        <span>
          <Swatch kind="both" color={CLASSES[brush].color} /> both say {CLASSES[brush].name} (∩ = {sel.inter})
        </span>
        <span>
          <Swatch kind="pred" color={CLASSES[brush].color} /> predicted only ({sel.nPred - sel.inter})
        </span>
        <span>
          <Swatch kind="true" color={CLASSES[brush].color} /> true only ({sel.nTrue - sel.inter})
        </span>
        <span>
          ∪ = {sel.inter} + {sel.nPred - sel.inter} + {sel.nTrue - sel.inter} = <b>{sel.union}</b>
        </span>
      </div>
      <Controls>
        <Segmented
          label="brush and focus class"
          value={brush}
          onChange={setBrush}
          options={CLASSES.map((c) => ({
            value: c.id,
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 11, height: 11, borderRadius: 3, background: c.color, display: 'inline-block', border: '1px solid var(--viz-axis)' }} />
                {c.name}
              </span>
            ),
          }))}
        />
      </Controls>
      <pre style={pre}>{code}</pre>
      <div style={{ width: '100%', display: 'grid', gap: '0.3rem' }} role="table" aria-label="IoU per class">
        {stats.map((s) => {
          const counted = s.iou !== null || rule !== 'skip'
          const val = s.iou ?? (rule === 'one' ? 1 : 0)
          return (
            <div key={s.c} role="row" style={{ display: 'grid', gridTemplateColumns: 'minmax(5.2rem, auto) minmax(3.6rem, auto) 1fr 4.6rem', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', opacity: counted ? 1 : 0.55 }}>
              <span role="cell" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: s.c === brush ? 700 : 400 }}>
                <span style={{ width: 11, height: 11, borderRadius: 3, background: CLASSES[s.c].color, border: '1px solid var(--viz-axis)', flex: 'none' }} />
                {CLASSES[s.c].name}
              </span>
              <span role="cell" className="tabular" style={{ color: 'var(--ink-2)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                {s.inter}/{s.union}
              </span>
              <span role="cell" style={{ height: 10, background: 'var(--surface-2)', borderRadius: 5, overflow: 'hidden' }}>
                <span style={{ display: 'block', height: '100%', width: `${counted ? val * 100 : 0}%`, background: CLASSES[s.c].ink, borderRadius: 5 }} />
              </span>
              <span role="cell" className="tabular" style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {iouTxt(s)}
              </span>
            </div>
          )
        })}
        <div style={{ borderTop: '1px solid var(--rule)', paddingTop: '0.35rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.3rem 1rem', fontSize: '0.88rem' }}>
          <span>
            mean IoU = ({m.terms.map(f2).join(' + ')}) / {m.terms.length} = <b className="tabular">{f3(m.value)}</b>
          </span>
          <span style={{ color: 'var(--ink-2)' }}>
            pixel accuracy = <b className="tabular">{f3(acc)}</b>
          </span>
        </div>
      </div>
      <Controls>
        <Segmented
          label="if a class has union 0"
          value={rule}
          onChange={setRule}
          options={[
            { value: 'skip', label: 'skip it' },
            { value: 'one', label: 'count IoU = 1' },
            { value: 'zero', label: 'count IoU = 0' },
          ]}
        />
        <Button onClick={() => setPred(PRED0)}>reset</Button>
        <Button onClick={() => setPred(TRUTH.slice())}>perfect</Button>
        <Button onClick={() => setPred(TRUTH.map(() => 0))}>all background</Button>
      </Controls>
    </Figure>
  )
}

function Swatch({ kind, color }: { kind: 'both' | 'pred' | 'true'; color: string }) {
  return (
    <svg width={13} height={13} viewBox="0 0 13 13" aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 3 }}>
      {kind === 'both' && <rect x={0} y={0} width={13} height={13} rx={2} style={{ fill: color }} />}
      {kind === 'pred' && (
        <>
          <rect x={0} y={0} width={13} height={13} rx={2} style={{ fill: `color-mix(in srgb, ${color} 30%, var(--surface))` }} />
          <line x1={2} y1={11} x2={11} y2={2} style={{ stroke: color, strokeWidth: 1.4 }} />
        </>
      )}
      {kind === 'true' && <rect x={1} y={1} width={11} height={11} rx={2} style={{ fill: 'var(--surface)', stroke: color, strokeWidth: 2 }} />}
    </svg>
  )
}
