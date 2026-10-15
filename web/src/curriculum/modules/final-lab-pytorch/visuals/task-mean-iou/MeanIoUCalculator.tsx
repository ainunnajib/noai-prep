import { useState } from 'react'
import { Figure, Controls, Readout, useNarrow } from '../../../../../kit'
import { Chips, CodePanel } from '../torch-exam-patterns/code'
import { perClass, meanIoU, accuracy, fmt3, fmt4, CLASS_NAMES, CLASS_COLOURS } from './miou'
import m from './miou.module.css'

/*
  Paint a prediction and a target label map; for the class you inspect, see its four boolean masks
  (pred == c, true == c, AND, OR) with their counts, the matching lines of calculate_miou with live
  values, and the per-class table that the mean is taken over. Presets: a 6 x 6 satellite tile with a
  third class (Water) that appears in neither map, the notebook's 2 x 2 self-check (0.5833) and a lazy
  "always forest" model (accuracy 25/36 = 0.694 but mIoU 0.347).
*/

type Grid = number[][]
type PresetId = 'sat' | 'nb' | 'lazy'

const SAT_T: Grid = [
  [1, 1, 1, 0, 0, 0],
  [1, 1, 1, 0, 0, 0],
  [1, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1],
]
const SAT_P: Grid = [
  [1, 1, 0, 0, 0, 0],
  [1, 1, 1, 0, 0, 0],
  [1, 1, 1, 0, 0, 0],
  [1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1],
]

const PRESETS: Record<PresetId, { label: string; pred: Grid; truth: Grid; k: number }> = {
  sat: { label: 'Satellite tile, 3 classes', pred: SAT_P, truth: SAT_T, k: 3 },
  nb: { label: "Notebook's 2 × 2 self-check", pred: [[0, 0], [1, 1]], truth: [[0, 1], [1, 1]], k: 2 },
  lazy: {
    label: 'Lazy model: always Forest',
    pred: SAT_T.map((r) => r.map(() => 1)),
    truth: SAT_T,
    k: 2,
  },
}

const clone = (g: Grid) => g.map((r) => [...r])

function LabelGrid({ g, k, cell, onPaint, label, diff }: { g: Grid; k: number; cell: number; onPaint: (i: number, j: number) => void; label: string; diff?: Grid }) {
  return (
    <div className={m.gridBox}>
      <span className={m.gridLabel}>{label}</span>
      <div className={m.grid} style={{ gridTemplateColumns: `repeat(${g[0].length}, ${cell}px)` }} role="grid" aria-label={label}>
        {g.map((row, i) =>
          row.map((v, j) => (
            <button
              key={`${i}-${j}`}
              type="button"
              className={`${m.cell} ${diff && diff[i][j] !== v ? m.cellDiff : ''}`}
              style={{ width: cell, height: cell, fontSize: cell > 36 ? 15 : 11, background: `color-mix(in srgb, ${CLASS_COLOURS[v % k]} 55%, var(--surface))` }}
              aria-label={`${label} row ${i}, column ${j}: class ${v} (${CLASS_NAMES[v]})`}
              onClick={() => onPaint(i, j)}
            >
              {v}
            </button>
          )),
        )}
      </div>
    </div>
  )
}

function Mask({ on, cols, cell, colour, label, count }: { on: boolean[]; cols: number; cell: number; colour: string; label: string; count: number }) {
  return (
    <div className={m.maskBox}>
      <div className={m.mask} style={{ gridTemplateColumns: `repeat(${cols}, ${cell}px)` }} aria-hidden="true">
        {on.map((v, i) => (
          <span key={i} className={m.maskCell} style={{ width: cell, height: cell, background: v ? colour : undefined }} />
        ))}
      </div>
      <span className={m.maskLabel}>{label}</span>
      <span className={m.maskCount}>
        {count} True
      </span>
    </div>
  )
}

export default function MeanIoUCalculator() {
  const [preset, setPreset] = useState<PresetId>('sat')
  const [pred, setPred] = useState<Grid>(() => clone(SAT_P))
  const [truth, setTruth] = useState<Grid>(() => clone(SAT_T))
  const [k, setK] = useState(3)
  const [brush, setBrush] = useState(0)
  const [inspect, setInspect] = useState(0)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)

  const load = (id: PresetId) => {
    const p = PRESETS[id]
    setPreset(id)
    setPred(clone(p.pred))
    setTruth(clone(p.truth))
    setK(p.k)
    setBrush((b) => Math.min(b, p.k - 1))
    setInspect((c) => Math.min(c, p.k - 1))
  }

  const stats = perClass(pred, truth, k)
  const { mean, n } = meanIoU(stats, 'union')
  const acc = accuracy(pred, truth)
  const rows = pred.length
  const cols = pred[0].length
  const cell = rows <= 2 ? (narrow ? 44 : 52) : narrow ? 22 : 30
  const mcell = rows <= 2 ? 22 : narrow ? 10 : 12
  const s = stats[inspect]
  const P = pred.flat().map((v) => v === inspect)
  const T = truth.flat().map((v) => v === inspect)
  const col = CLASS_COLOURS[inspect]
  const iou = s.u === 0 ? null : s.i / s.u

  const paint = (which: 'pred' | 'truth') => (i: number, j: number) => {
    const set = which === 'pred' ? setPred : setTruth
    set((g) => g.map((r, a) => r.map((v, b) => (a === i && b === j ? brush : v))))
  }

  return (
    <Figure
      wide
      title="Masks plus sums: mean IoU, one class at a time"
      caption={
        <>
          Click cells to paint them with the chosen class (a thick outline marks pixels where prediction and target disagree). Pick a class to inspect its four
          boolean masks: <code>&amp;</code> keeps pixels where both are True (the intersection), <code>|</code> keeps pixels where either is (the union). Paint one
          Water pixel into the prediction and watch Water stop being skipped and score 0. Then load the notebook's 2 × 2 example and check you get 0.5833.
        </>
      }
    >
      <div ref={wrapRef} className={narrow ? m.narrow : ''} style={{ width: '100%', display: 'grid', gap: '0.85rem' }}>
        <Chips
          label="Example"
          options={(Object.keys(PRESETS) as PresetId[]).map((id) => ({ value: id, label: PRESETS[id].label }))}
          value={preset}
          onChange={load}
        />
        <div className={m.row} style={narrow ? { gap: '0.6rem 0.7rem' } : undefined}>
          <LabelGrid g={pred} k={k} cell={cell} onPaint={paint('pred')} label="pred_mask" diff={truth} />
          <LabelGrid g={truth} k={k} cell={cell} onPaint={paint('truth')} label="true_mask" diff={pred} />
        </div>
        <Controls>
          <Chips
            label="Paint with"
            options={Array.from({ length: k }, (_, c) => ({ value: String(c), label: `${c}: ${CLASS_NAMES[c]}` }))}
            value={String(brush)}
            onChange={(v) => setBrush(Number(v))}
          />
          <Chips
            label="Inspect class"
            options={Array.from({ length: k }, (_, c) => ({ value: String(c), label: `${c}: ${CLASS_NAMES[c]}` }))}
            value={String(inspect)}
            onChange={(v) => setInspect(Number(v))}
          />
        </Controls>
        <div className={m.split}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', justifyContent: 'center', gap: '0.7rem 1.4rem', width: '100%' }}>
            <Mask on={P} cols={cols} cell={mcell} colour={col} label={`p = pred == ${inspect}`} count={s.p} />
            <Mask on={T} cols={cols} cell={mcell} colour={col} label={`t = true == ${inspect}`} count={s.t} />
            <Mask on={P.map((v, i) => v && T[i])} cols={cols} cell={mcell} colour="var(--viz-5)" label="p & t" count={s.i} />
            <Mask on={P.map((v, i) => v || T[i])} cols={cols} cell={mcell} colour="var(--viz-6)" label="p | t" count={s.u} />
          </div>
          <CodePanel
            title={`for cls in range(${k}):   # now cls = ${inspect}`}
            size={narrow ? 11.5 : 12.5}
            lines={[
              'p = (pred_flat == cls)',
              't = (true_flat == cls)',
              'intersection = (p & t).sum().item()',
              'union = (p | t).sum().item()',
              'if union == 0:',
              '    continue',
              'ious.append(intersection / union)',
            ]}
            notes={{
              0: `# ${s.p} True`,
              1: `# ${s.t} True`,
              2: `# ${s.i}`,
              3: `# ${s.u}`,
              5: s.u === 0 ? '# union is 0: class skipped' : undefined,
              6: iou != null ? `# ${s.i} / ${s.u} = ${fmt3(iou)}` : undefined,
            }}
            tones={s.u === 0 ? { 4: 'warn', 5: 'warn', 6: 'dim' } : { 6: 'ok' }}
          />
        </div>
        <table className={m.statTable} aria-label="Per-class intersection, union and IoU">
          <thead>
            <tr>
              <th scope="col">class</th>
              <th scope="col">pred</th>
              <th scope="col">true</th>
              <th scope="col">inter.</th>
              <th scope="col">union</th>
              <th scope="col">IoU</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((st) => (
              <tr key={st.c} className={st.c === inspect ? m.trSel : ''}>
                <td style={{ fontFamily: 'var(--font-body)' }}>
                  <span className={m.swatch} style={{ background: CLASS_COLOURS[st.c] }} />
                  {st.c} {narrow ? '' : CLASS_NAMES[st.c]}
                </td>
                <td>{st.p}</td>
                <td>{st.t}</td>
                <td>{st.i}</td>
                <td>{st.u}</td>
                <td>{st.u === 0 ? <span className={m.skipped}>skipped</span> : narrow ? fmt3(st.i / st.u) : `${st.i}/${st.u} = ${fmt3(st.i / st.u)}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Readout
          items={[
            ['mean IoU', `${fmt4(mean)}${n ? ` (over ${n} class${n === 1 ? '' : 'es'})` : ' (empty list)'}`],
            ['pixel accuracy', `${acc.ok}/${acc.n} = ${fmt3(acc.ok / acc.n)}`],
            ...(preset === 'nb' ? ([['self-check (expects 0.5833)', 0.58 < mean && mean < 0.59 ? 'passed' : 'failed']] as [string, string][]) : []),
          ]}
        />
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)', width: '100%', display: 'grid', gap: '0.2rem' }}>
          {stats.map((st) =>
            st.u === 0 ? (
              <span key={st.c}>
                {CLASS_NAMES[st.c]} (class {st.c}) is in neither map, so its union is 0 and it is skipped.
              </span>
            ) : st.t === 0 ? (
              <span key={st.c}>
                {CLASS_NAMES[st.c]} (class {st.c}) is not in the target but is predicted {st.p} time{st.p === 1 ? '' : 's'}: its union is {st.u}, so it counts and scores
                0.
              </span>
            ) : null,
          )}
          {preset === 'nb' && <span>The notebook's self-check expects 0.5833.</span>}
          {preset === 'lazy' && <span>Most pixels are Forest, so accuracy looks fine, but Urban scores IoU 0 and drags the mean down.</span>}
        </div>
      </div>
    </Figure>
  )
}
