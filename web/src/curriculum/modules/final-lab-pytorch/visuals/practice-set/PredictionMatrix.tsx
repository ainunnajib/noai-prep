import { Fragment, useState } from 'react'
import { Figure, Controls, Segmented, useNarrow } from '../../../../../kit'
import { Chips } from '../task-attention/ui'
import { openPractice } from './events'
import s from './practice.module.css'

/*
  Evidence for likely 2027 Final tasks. Each tick is a checkable fact, not a probability:
  - Prelim 2026: a question on the topic in the 2026 Preliminary Round (question numbers given);
  - Final MCQ 2026: a code-reading question on it in Section 1 of the 2026 Final;
  - IOAI syllabus: the topic is named in the IOAI syllabus (section and topic names given);
  - Past Final task: a 2025 or 2026 programming task used the same core skill.
*/

type Lib = 'NumPy' | 'PyTorch' | 'Either'
interface Row {
  task: string
  lib: Lib
  prelim?: string
  finalMcq?: string
  ioai?: string
  pastTask?: string
  why: string
  practice?: string
  revise: { label: string; href: string }
}

const ROWS: Row[] = [
  {
    task: 'Logistic regression with L2, by gradient descent',
    lib: 'NumPy',
    prelim: 'Q139',
    finalMcq: 'Q4 (the L2 gradient)',
    ioai: 'Supervised Learning: Logistic Regression; L1 & L2 Regularization',
    pastTask: '2025 Task 1: linear regression by gradient descent',
    why: 'The natural next step after 2025 Task 1: same loop, plus a sigmoid and a penalty that must skip the bias.',
    practice: 'logreg',
    revise: { label: 'Logistic regression', href: '#/learn/classification/logistic-regression' },
  },
  {
    task: 'k-nearest neighbours',
    lib: 'NumPy',
    prelim: 'Q140',
    ioai: 'Supervised Learning: K-Nearest Neighbors',
    pastTask: '2025 Task 2: K-means (distances, argmin)',
    why: 'Pairwise distances by broadcasting, argsort and a vote: the K-means skills in a new order.',
    practice: 'knn',
    revise: { label: 'k-nearest neighbours', href: '#/learn/classification/k-nearest-neighbours' },
  },
  {
    task: 'Softmax with cross-entropy (numerically stable)',
    lib: 'Either',
    prelim: 'Q61, Q183',
    finalMcq: 'Q6 (binary cross-entropy for multi-label; why softmax is wrong there)',
    ioai: 'Neural Networks: Loss Functions',
    pastTask: '2026 Task 3: softmax over the right axis',
    why: 'Short, easy to test, and it has a classic trap (overflow without subtracting the maximum).',
    practice: 'softmax_ce',
    revise: { label: 'Softmax and multiclass', href: '#/learn/classification/softmax-and-multiclass' },
  },
  {
    task: 'PCA from the covariance eigenvectors',
    lib: 'NumPy',
    prelim: 'Q14, Q145',
    ioai: 'Unsupervised Learning: Principal Component Analysis',
    why: 'Centre, covariance, eigh, sort: a few lines, with sign and ordering traps.',
    practice: 'pca',
    revise: { label: 'PCA', href: '#/learn/unsupervised-learning/pca' },
  },
  {
    task: 'Decision stump: the best split by Gini',
    lib: 'NumPy',
    prelim: 'Q141',
    finalMcq: 'Q5 (AdaBoost with depth-1 trees)',
    ioai: 'Supervised Learning: Decision Trees',
    why: 'Trees appeared in both 2026 papers; writing the split search yourself is the from-scratch version.',
    revise: { label: 'Decision trees', href: '#/learn/trees-and-ensembles/decision-trees' },
  },
  {
    task: 'Precision, recall and F1 from scratch',
    lib: 'Either',
    prelim: 'Q55, Q56, Q57',
    ioai: 'Data Science Fundamentals: Model Evaluation Metrics',
    pastTask: '2026 Task 2: mean IoU from boolean masks',
    why: 'Exactly the mIoU pattern: boolean masks, sums, and a guard for a zero denominator.',
    practice: 'prf1',
    revise: { label: 'Confusion matrix and metrics', href: '#/learn/model-evaluation/confusion-matrix-and-metrics' },
  },
  {
    task: 'conv2d forward pass',
    lib: 'Either',
    prelim: 'Q190, Q191, Q193',
    ioai: 'Computer Vision: Convolutional Layers',
    pastTask: '2026 Task 2: convolution sizes in U-Net',
    why: 'Four loops or one im2col matrix product; the output-size formula is tested everywhere.',
    practice: 'conv2d',
    revise: { label: 'Convolution', href: '#/learn/convolutional-networks/convolution' },
  },
  {
    task: 'BatchNorm or LayerNorm forward',
    lib: 'Either',
    prelim: 'Q170, Q184, Q185',
    finalMcq: 'Q8 (a custom BatchNorm)',
    ioai: 'Deep Learning: Batch Normalization',
    why: 'Mean and variance along the right axis, biased variance, eps, and register_buffer for running statistics.',
    practice: 'layernorm',
    revise: { label: 'Initialisation and normalisation', href: '#/learn/training-deep-networks/initialisation-and-normalisation' },
  },
  {
    task: 'Dice or focal loss for segmentation',
    lib: 'Either',
    finalMcq: 'Q13 (IoU, a close cousin)',
    pastTask: '2026 Task 2: overlap of masks',
    why: 'Builds directly on 2026 Task 2: overlap sums with an eps for empty masks.',
    practice: 'dice',
    revise: { label: 'Segmentation metrics', href: '#/learn/vision-tasks/segmentation-metrics' },
  },
  {
    task: "Fix a CNN's shape bug",
    lib: 'PyTorch',
    prelim: 'Q190, Q191',
    finalMcq: 'Q12 (U-Net decoder shapes)',
    ioai: 'Computer Vision: Convolutional Layers',
    pastTask: '2026 Task 2: the crashing U-Net',
    why: 'Debugging was graded in 2026; shape arithmetic is the fastest way in.',
    revise: { label: '2026 Task 2 Part 1', href: '#/learn/final-lab-pytorch/task-unet-center-crop' },
  },
  {
    task: 'Debug a PyTorch training loop',
    lib: 'PyTorch',
    prelim: 'Q110, Q113, Q115, Q116',
    finalMcq: 'Q10, Q14 (training-loop code)',
    ioai: 'Programming Fundamentals: PyTorch Basics',
    why: 'A missing zero_grad(), a forgotten eval() or no_grad(), softmax before CrossEntropyLoss, an optimiser built before a layer was replaced: each runs without an error and quietly trains badly.',
    revise: { label: 'PyTorch gotchas', href: '#/learn/debugging-and-diagnosis/pytorch-gotchas' },
  },
]

const COLS: { key: 'prelim' | 'finalMcq' | 'ioai' | 'pastTask'; label: string; short: string }[] = [
  { key: 'prelim', label: '2026 Prelim', short: 'Prelim' },
  { key: 'finalMcq', label: '2026 Final MCQ', short: 'Final MCQ' },
  { key: 'ioai', label: 'IOAI syllabus', short: 'IOAI' },
  { key: 'pastTask', label: 'Past Final task', short: 'Past task' },
]

const ticks = (r: Row) => COLS.filter((c) => r[c.key]).length

export default function PredictionMatrix() {
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(640)
  const [sort, setSort] = useState<'course' | 'ticks'>('ticks')
  const [lib, setLib] = useState<'all' | 'NumPy' | 'PyTorch'>('all')
  const [open, setOpen] = useState<number | null>(0)

  let rows = ROWS.map((r, i) => ({ r, i })).filter(({ r }) => lib === 'all' || r.lib === lib || r.lib === 'Either')
  if (sort === 'ticks') rows = [...rows].sort((a, b) => ticks(b.r) - ticks(a.r) || a.i - b.i)

  const detail = (r: Row) => (
    <div className={s.detail}>
      <p>{r.why}</p>
      <div className={s.evidence} role="list">
        {COLS.map((c) => (
          <div key={c.key} role="listitem" className={r[c.key] ? s.has : s.hasNot}>
            <span aria-hidden="true">{r[c.key] ? '✓' : '–'}</span> {c.label}: {r[c.key] ?? 'no direct evidence'}
          </div>
        ))}
      </div>
      <div className={s.btnRow}>
        {r.practice && (
          <button type="button" className={s.practiseBtn} onClick={() => openPractice(r.practice!)}>
            Practise it below
          </button>
        )}
        <a className={s.reviseLink} href={r.revise.href}>
          Revise: {r.revise.label}
        </a>
      </div>
    </div>
  )

  return (
    <Figure
      title="Which tasks could the 2027 Final set?"
      caption={
        <>
          Every tick is a checkable fact (the question numbers and IOAI syllabus topic names are listed), not a probability: nobody outside the organisers knows the 2027 tasks. Sort by the
          number of ticks, filter by library, and open a row to see the evidence, then jump to its practice task. Tasks marked Either can be set in NumPy or PyTorch.
        </>
      }
    >
      <div ref={wrapRef} className={s.stack}>
        <Controls>
          <Segmented
            label="Order"
            options={[
              { value: 'ticks', label: 'Most evidence first' },
              { value: 'course', label: 'Classical ML first' },
            ]}
            value={sort}
            onChange={setSort}
          />
          <Chips
            label="Library"
            options={[
              { value: 'all', label: 'All' },
              { value: 'NumPy', label: 'NumPy' },
              { value: 'PyTorch', label: 'PyTorch' },
            ]}
            value={lib}
            onChange={setLib}
          />
        </Controls>
        {narrow ? (
          <div className={s.cards}>
            {rows.map(({ r, i }) => (
              <div key={i} className={`${s.card} ${open === i ? s.cardOpen : ''}`}>
                <button type="button" className={s.cardHead} onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                  <span className={s.cardTitle}>{r.task}</span>
                  <span className={s.cardMeta}>
                    <span className={s.lib}>{r.lib}</span>
                    <span className={s.tickRow} aria-label={`${ticks(r)} of 4 kinds of evidence`}>
                      {COLS.map((c) => (
                        <span key={c.key} className={r[c.key] ? s.dotOn : s.dotOff} title={c.label}>
                          {c.short}
                        </span>
                      ))}
                    </span>
                  </span>
                </button>
                {open === i && detail(r)}
              </div>
            ))}
          </div>
        ) : (
          <table className={s.matrix}>
            <thead>
              <tr>
                <th scope="col">Candidate task</th>
                <th scope="col">Library</th>
                {COLS.map((c) => (
                  <th key={c.key} scope="col" className={s.tickCol}>
                    {c.label}
                  </th>
                ))}
                <th scope="col" className={s.tickCol}>
                  Ticks
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ r, i }) => (
                <Fragment key={i}>
                  <tr className={`${s.mRow} ${open === i ? s.mRowOpen : ''}`} onClick={() => setOpen(open === i ? null : i)}>
                    <th scope="row">
                      <button type="button" className={s.rowBtn} aria-expanded={open === i}>
                        {r.task}
                      </button>
                    </th>
                    <td>
                      <span className={s.lib}>{r.lib}</span>
                    </td>
                    {COLS.map((c) => (
                      <td key={c.key} className={s.tickCol} title={r[c.key] ?? 'no direct evidence'}>
                        {r[c.key] ? <span className={s.tick}>✓</span> : <span className={s.noTick}>–</span>}
                      </td>
                    ))}
                    <td className={s.tickCol}>
                      <b>{ticks(r)}</b>
                    </td>
                  </tr>
                  {open === i && (
                    <tr className={s.detailRow}>
                      <td colSpan={7}>{detail(r)}</td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Figure>
  )
}
