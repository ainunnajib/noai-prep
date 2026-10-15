import { useState } from 'react'
import { Figure, Controls, Slider, Segmented, MatrixGrid, Readout, M } from '../../../../../kit'

/*
  The same batch (rows = students = examples, columns = subjects = features) normalised two ways:
    BatchNorm: each COLUMN uses the mean and spread of that subject across the students in the batch
    LayerNorm: each ROW uses the mean and spread of that student's own marks across subjects
  (γ = 1, β = 0, ε = 1e-5.) With a batch of 1, BatchNorm's column spread is 0, so every value becomes 0.
*/

const STUDENTS = ['Ali', 'Bea', 'Chen', 'Dev', 'Ema', 'Fai']
const SUBJECTS = ['Math', 'Sci', 'Eng', 'Chi']
const MARKS = [
  [72, 65, 80, 58],
  [90, 85, 60, 70],
  [55, 70, 75, 65],
  [80, 95, 50, 60],
  [65, 60, 90, 85],
  [85, 75, 70, 75],
]
const EPS = 1e-5

function stats(v: number[]) {
  const mu = v.reduce((a, b) => a + b, 0) / v.length
  const vr = v.reduce((a, b) => a + (b - mu) ** 2, 0) / v.length
  return { mu, sd: Math.sqrt(vr), den: Math.sqrt(vr + EPS) }
}

const f2 = (v: number) => (Math.abs(v) < 0.005 ? '0.00' : v.toFixed(2))

export default function NormAxes() {
  const [kind, setKind] = useState<'bn' | 'ln'>('bn')
  const [b, setB] = useState(6)
  const [focus, setFocus] = useState<[number, number]>([0, 0])
  const rows = MARKS.slice(0, b)
  const fi = Math.min(focus[0], b - 1)
  const fj = focus[1]

  const colStats = SUBJECTS.map((_, j) => stats(rows.map((r) => r[j])))
  const rowStats = rows.map((r) => stats(r))
  const out = rows.map((r, i) => r.map((x, j) => (kind === 'bn' ? (x - colStats[j].mu) / colStats[j].den : (x - rowStats[i].mu) / rowStats[i].den)))
  const s = kind === 'bn' ? colStats[fj] : rowStats[fi]
  const collapsed = kind === 'bn' && b === 1

  // add a header row and a name column; highlight indices shift by one
  const withNames = (m: (number | string)[][]) => [['', ...SUBJECTS], ...m.map((r, i) => [STUDENTS[i], ...r])]
  const hlRows = kind === 'ln' ? [fi + 1] : []
  const hlCols = kind === 'bn' ? [fj + 1] : []
  const click = (i: number, j: number) => {
    if (i >= 1 && j >= 1) setFocus([i - 1, j - 1])
  }
  const x = rows[fi][fj]
  const who = `${STUDENTS[fi]}'s ${SUBJECTS[fj]}`

  return (
    <Figure
      title="BatchNorm and LayerNorm: same maths, different direction"
      caption={
        <>
          Exam marks for a batch of students (rows = examples) in four subjects (columns = features). <b>BatchNorm</b> normalises
          each <b>column</b>: a mark is compared with the other students&apos; marks in that subject. <b>LayerNorm</b> normalises each{' '}
          <b>row</b>: a mark is compared with the same student&apos;s other subjects. Click any mark to follow it. Then shrink the batch to{' '}
          <b>1 student</b>: BatchNorm has nobody to compare with, every column has zero spread and every output becomes 0, while LayerNorm
          gives exactly the same answers as before.
        </>
      }
    >
      <Segmented
        label="Normalise along"
        value={kind}
        onChange={setKind}
        options={[
          { value: 'bn', label: 'BatchNorm (columns)' },
          { value: 'ln', label: 'LayerNorm (rows)' },
        ]}
      />
      <div style={{ fontSize: 'var(--step--1)', color: 'var(--ink-2)', textAlign: 'center' }}>
        {kind === 'bn' ? '↓ statistics taken down each column, across the students in the batch' : '→ statistics taken along each row, across one student’s subjects'}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem 1.5rem', justifyContent: 'center', alignItems: 'flex-start' }}>
        <MatrixGrid
          label="marks in the batch"
          data={withNames(rows)}
          rows={hlRows}
          cols={hlCols}
          cells={[[fi + 1, fj + 1]]}
          cellSize={44}
          brackets={false}
          onCellClick={click}
          ariaLabel="Marks of each student in each subject; click a mark to follow it"
        />
        <MatrixGrid
          label={kind === 'bn' ? 'after BatchNorm' : 'after LayerNorm'}
          data={withNames(out)}
          format={f2}
          heat
          diverging
          rows={hlRows}
          cols={hlCols}
          cells={[[fi + 1, fj + 1]]}
          cellSize={48}
          brackets={false}
          onCellClick={click}
          ariaLabel="Normalised values"
        />
      </div>
      <div style={{ textAlign: 'center' }}>
        {collapsed ? (
          <span role="status" style={{ color: 'var(--viz-neg)', fontWeight: 700 }}>
            Batch of 1: each column holds a single mark, so its mean is that mark and its spread is 0. Every output is 0.
          </span>
        ) : (
          <M>{`\\text{${who}: } \\dfrac{${x} - ${+s.mu.toFixed(2)}}{${s.sd.toFixed(2)}} = ${f2(out[fi][fj])}`}</M>
        )}
      </div>
      <Controls>
        <Slider label="batch size (number of students)" value={b} min={1} max={STUDENTS.length} step={1} onChange={setB} />
      </Controls>
      <Readout
        items={[
          [kind === 'bn' ? `${SUBJECTS[fj]} column: mean` : `${STUDENTS[fi]}'s row: mean`, s.mu.toFixed(1)],
          ['spread (standard deviation)', s.sd.toFixed(1)],
          ['values used', kind === 'bn' ? `${rows.length} (one per student)` : `${SUBJECTS.length} (one per subject)`],
        ]}
      />
    </Figure>
  )
}
