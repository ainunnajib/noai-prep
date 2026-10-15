import { useState } from 'react'
import { Figure, Readout, useNarrow } from '../../../../../kit'
import { Chips } from '../torch-exam-patterns/code'
import { perClass, contributions, meanIoU, fmt3, fmt4, CLASS_NAMES, CLASS_COLOURS, type Conv } from './miou'
import m from './miou.module.css'

/*
  Auditing the notebook's "missing class" self-check. Two 2 x 2 maps (click to flip a pixel between
  0 and 1), a per-class table, and three conventions for classes that are missing:
    union : skip a class only when its union is 0 (the written rule and the official solution)
    gt    : average only the classes present in the ground truth
    zero  : count a class with union 0 as IoU 0
  The right-hand columns are fixed facts, verified in Python: on the notebook's missing-class check
  (expects 0.75) the three give 0.375 / 0.75 / 0.375; on the grader's all-zero test (expects 1.0)
  they give 1.0 / 1.0 / 0.5.
*/

type Grid = number[][]
type Ex = 'missing' | 'grader' | 'main'

const EXAMPLES: Record<Ex, { label: string; pred: Grid; truth: Grid }> = {
  missing: { label: "Notebook's missing-class check", pred: [[0, 0], [0, 1]], truth: [[0, 0], [0, 0]] },
  grader: { label: "Grader's test: all zeros", pred: [[0, 0], [0, 0]], truth: [[0, 0], [0, 0]] },
  main: { label: "Notebook's main self-check", pred: [[0, 0], [1, 1]], truth: [[0, 1], [1, 1]] },
}

const CONVS: { value: Conv; name: string; desc: string; missing: number; grader: number; written: boolean }[] = [
  { value: 'union', name: 'Skip if union = 0', desc: 'the written rule; the official solution', missing: 0.375, grader: 1, written: true },
  { value: 'gt', name: 'Only classes in the target', desc: 'skip any class absent from true_mask', missing: 0.75, grader: 1, written: false },
  { value: 'zero', name: 'Absent class scores 0', desc: 'union = 0 counts as IoU 0', missing: 0.375, grader: 0.5, written: false },
]

const clone = (g: Grid) => g.map((r) => [...r])

export default function SelfCheckAudit() {
  const [ex, setEx] = useState<Ex>('missing')
  const [pred, setPred] = useState<Grid>(() => clone(EXAMPLES.missing.pred))
  const [truth, setTruth] = useState<Grid>(() => clone(EXAMPLES.missing.truth))
  const [conv, setConv] = useState<Conv>('union')
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)

  const load = (e: Ex) => {
    setEx(e)
    setPred(clone(EXAMPLES[e].pred))
    setTruth(clone(EXAMPLES[e].truth))
  }
  const flip = (which: 'pred' | 'truth', i: number, j: number) => {
    const set = which === 'pred' ? setPred : setTruth
    set((g) => g.map((r, a) => r.map((v, b) => (a === i && b === j ? 1 - v : v))))
  }

  const stats = perClass(pred, truth, 2)
  const contrib = contributions(stats, conv)
  const cell = narrow ? 50 : 58

  const grid = (g: Grid, which: 'pred' | 'truth', label: string) => (
    <div className={m.gridBox}>
      <span className={m.gridLabel}>{label}</span>
      <div className={m.grid} style={{ gridTemplateColumns: `repeat(2, ${cell}px)` }}>
        {g.map((row, i) =>
          row.map((v, j) => (
            <button
              key={`${i}-${j}`}
              type="button"
              className={`${m.cell} ${(which === 'pred' ? truth : pred)[i][j] !== v ? m.cellDiff : ''}`}
              style={{ width: cell, height: cell, fontSize: 17, background: `color-mix(in srgb, ${CLASS_COLOURS[v]} 55%, var(--surface))` }}
              aria-label={`${label} row ${i}, column ${j}: class ${v}. Click to flip.`}
              onClick={() => flip(which, i, j)}
            >
              {v}
            </button>
          )),
        )}
      </div>
    </div>
  )

  return (
    <Figure
      wide
      title="Audit the self-check: which rule gives 0.75?"
      caption={
        <>
          The notebook's extra cell predicts class 1 once while the target is all class 0, and expects 0.75. Switch between the three conventions and compare the
          two right-hand columns: only "only classes in the target" reproduces 0.75, but the task's written rule is "skip a class when its union is 0", which gives
          0.375, and so does the official solution. Click pixels to flip them and see how each convention treats your own maps.
        </>
      }
    >
      <div ref={wrapRef} className={narrow ? m.narrow : ''} style={{ width: '100%', display: 'grid', gap: '0.85rem' }}>
        <Chips label="Example" options={(Object.keys(EXAMPLES) as Ex[]).map((e) => ({ value: e, label: EXAMPLES[e].label }))} value={ex} onChange={load} />
        <div className={m.split}>
          <div className={m.row}>
            {grid(pred, 'pred', 'pred_mask')}
            {grid(truth, 'truth', 'true_mask')}
          </div>
          <table className={m.statTable} aria-label="Per-class intersection and union">
            <thead>
              <tr>
                <th scope="col">class</th>
                <th scope="col">inter.</th>
                <th scope="col">union</th>
                <th scope="col">in this average</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s, c) => (
                <tr key={c}>
                  <td style={{ fontFamily: 'var(--font-body)' }}>
                    <span className={m.swatch} style={{ background: CLASS_COLOURS[c] }} />
                    {c} {CLASS_NAMES[c]}
                  </td>
                  <td>{s.i}</td>
                  <td>{s.u}</td>
                  <td>
                    {contrib[c] == null ? (
                      <span className={m.skipped}>skipped</span>
                    ) : s.u === 0 ? (
                      '0 (union 0)'
                    ) : (
                      `${s.i}/${s.u} = ${fmt3(contrib[c] as number)}`
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Chips label="Convention for missing classes" options={CONVS.map((c) => ({ value: c.value, label: c.name }))} value={conv} onChange={setConv} />
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table className={m.auditTable} aria-label="Mean IoU under three conventions">
            <thead>
              <tr>
                <th scope="col">convention</th>
                <th scope="col">your maps</th>
                <th scope="col">missing-class check (expects 0.75)</th>
                <th scope="col">grader test (expects 1.0)</th>
              </tr>
            </thead>
            <tbody>
              {CONVS.map((c) => {
                const r = meanIoU(stats, c.value)
                return (
                  <tr key={c.value} className={c.value === conv ? m.auditOn : ''}>
                    <td>
                      <div className={m.convName}>{c.name}</div>
                      {!narrow && <div className={m.convDesc}>{c.desc}</div>}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{fmt4(r.mean)}</td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{c.missing === 0.75 ? '0.75' : String(c.missing)}</span>{' '}
                      <span className={c.missing === 0.75 ? m.ok : m.bad}>{c.missing === 0.75 ? '✓' : '✗'}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{c.grader === 1 ? '1.0' : String(c.grader)}</span>{' '}
                      <span className={c.grader === 1 ? m.ok : m.bad}>{c.grader === 1 ? '✓' : '✗'}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <Readout
          items={[
            ['convention', CONVS.find((c) => c.value === conv)!.name],
            ['mean IoU of your maps', fmt4(meanIoU(stats, conv).mean)],
            ['the written rule?', conv === 'union' ? 'yes' : 'no'],
          ]}
        />
      </div>
    </Figure>
  )
}
