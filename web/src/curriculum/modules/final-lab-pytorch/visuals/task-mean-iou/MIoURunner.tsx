import { useState } from 'react'
import { Figure, PyRunner, useNarrow } from '../../../../../kit'
import { CodePanel, OutBox, Chips } from '../torch-exam-patterns/code'

/*
  A runnable NumPy twin of calculate_miou with the task's test cases (Pyodide runs NumPy in the
  browser), and, on the second tab, the exam's PyTorch version with the real output of the
  notebook's two self-check cells (run locally with torch 2.14).
*/

const NUMPY_CODE = `import numpy as np

def calculate_miou(pred_mask, true_mask, num_classes=2):
    pred_flat = pred_mask.reshape(-1)   # all pixels in one row
    true_flat = true_mask.reshape(-1)
    ious = []
    for cls in range(num_classes):      # classes only
        p = (pred_flat == cls)
        t = (true_flat == cls)
        intersection = (p & t).sum()
        union = (p | t).sum()
        if union == 0:                  # in neither map
            continue
        ious.append(intersection / union)
    if len(ious) == 0:
        return 0.0
    return float(sum(ious) / len(ious))

# 1. the notebook's 2x2 self-check (expects 0.5833)
pred = np.array([[[0, 0], [1, 1]]])
true = np.array([[[0, 1], [1, 1]]])
print(round(calculate_miou(pred, true), 4))

# 2. the 'missing class' check (notebook expects 0.75)
zeros = np.zeros((1, 2, 2), dtype=int)
pred = np.array([[[0, 0], [0, 1]]])
print(calculate_miou(pred, zeros))

# 3. the grader's test: class 1 in neither map
print(calculate_miou(zeros, zeros))

# 4. a batch of two images: no batch loop
pred = np.array([[[0, 1], [1, 1]], [[0, 0], [0, 1]]])
true = np.array([[[0, 1], [1, 0]], [[0, 0], [1, 1]]])
print(round(calculate_miou(pred, true), 4))`

const TORCH_LINES = [
  'def calculate_miou(pred_mask, true_mask, num_classes=2):',
  '    pred_flat = pred_mask.reshape(-1)          # (B, H, W) -> (B*H*W,)',
  '    true_flat = true_mask.reshape(-1)',
  '    ious = []',
  '    for cls in range(num_classes):             # loop over CLASSES only',
  '        p = (pred_flat == cls)                 # bool tensor: predicted cls',
  '        t = (true_flat == cls)                 # bool tensor: truly cls',
  '        intersection = (p & t).sum().item()    # both say cls (Python int)',
  '        union = (p | t).sum().item()           # either says cls',
  '        if union == 0:                         # in neither map: skip',
  '            continue',
  '        ious.append(intersection / union)',
  '    if len(ious) == 0:                         # no class to average over',
  '        return 0.0',
  '    return sum(ious) / len(ious)               # a Python float',
]

const TORCH_OUT = `Calculated mIoU: 0.5833
Expected mIoU:   0.5833
✅ Metric Check Passed!
mIoU with missing class: 0.3750
Expected: Only class 0 IoU counted (should be 0.75)
❌ Missing class handling failed`

const DIFFS: [string, string][] = [
  ['np.array([...])', 'torch.tensor([...])'],
  ['(p & t).sum()  → np.int64', '(p & t).sum().item()  → int'],
  ['float(...) at the end', 'already a Python float'],
]

export default function MIoURunner() {
  const [tab, setTab] = useState<'np' | 'torch'>('np')
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  // on phones, drop the aligned trailing comments so each line fits
  const torchLines = narrow ? TORCH_LINES.map((l) => l.replace(/\s+#.*$/, '')) : TORCH_LINES
  return (
    <Figure
      wide
      title="Rehearse in NumPy, then write it in PyTorch"
      caption={
        <>
          Press <b>Run</b> to execute the NumPy version in your browser with the task's test cases, then break it on purpose: delete the <code>if union == 0</code>{' '}
          check, or change <code>&amp;</code> to <code>and</code>, and read the error. The PyTorch tab shows the exam version, line for line the same logic, with the
          real output of the notebook's two self-check cells.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.75rem' }}>
        <Chips
          label="Version"
          options={[
            { value: 'np', label: 'NumPy: runs here' },
            { value: 'torch', label: 'PyTorch: the exam answer' },
          ]}
          value={tab}
          onChange={setTab}
        />
        {tab === 'np' ? (
          <div style={{ width: '100%', minWidth: 0 }}>
            <PyRunner packages={['numpy']} title="calculate_miou in NumPy" code={NUMPY_CODE} rows={NUMPY_CODE.split('\n').length + 1} />
          </div>
        ) : (
          <div style={{ width: '100%', display: 'grid', gap: '0.6rem', minWidth: 0 }}>
            <CodePanel title="calculate_miou in PyTorch" lines={torchLines} size={narrow ? 11.5 : 12.5} tones={{ 7: 'hl', 8: 'hl' }} />
            <OutBox title="output of the notebook's two self-check cells">{TORCH_OUT}</OutBox>
            <div style={{ display: 'grid', gap: '0.25rem', fontSize: 13, color: 'var(--ink-2)' }}>
              <b style={{ color: 'var(--ink)' }}>The only differences from the NumPy version</b>
              {DIFFS.map(([a, b]) => (
                <span key={a} style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, overflowWrap: 'anywhere' }}>
                  {a} <span style={{ color: 'var(--ink-3)' }}>→</span> {b}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Figure>
  )
}
