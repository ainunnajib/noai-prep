import { useState } from 'react'
import { Figure, Controls, Slider, Segmented, Button, MatrixGrid, M, usePlayer, PlayerControls, mulberry32 } from '../../../../../kit'

/*
  BatchNorm on a batch of 5 examples (rows) × 3 features (columns), one stage at a time.
  Training mode, for each column (feature) j:
      μ_j = mean of the column        σ²_j = mean of (x − μ_j)²   (divide by m = 5)
      x̂ = (x − μ_j) / √(σ²_j + ε)     y = γ_j·x̂ + β_j
  and the running statistics (PyTorch: momentum 0.1, unbiased variance for running_var):
      running_mean ← 0.9·running_mean + 0.1·μ_j
      running_var  ← 0.9·running_var  + 0.1·σ²_j·m/(m − 1)
  Evaluation mode uses running_mean and running_var instead of the batch's own μ and σ².
*/

const M_ROWS = 5
const EPS = 1e-5
const MOMENTUM = 0.1
const START: number[][] = [
  [2, 60, 1],
  [4, 20, 2.5],
  [5, 50, -0.5],
  [6, 80, 0.5],
  [8, 40, 1.5],
]
const FEATURE_MEAN = [5, 50, 1]
const FEATURE_SD = [2, 20, 1]
const RANGE: [number, number][] = [
  [-5, 15],
  [-50, 150],
  [-3, 5],
]
const STAGES = ['The batch', 'Mean of each feature', 'Subtract the mean', 'Spread of each feature', 'Divide by the spread', 'Scale by γ and shift by β']

/** wrap negative numbers in brackets when they follow an operator */
const par = (v: number) => (fmt(v).startsWith('-') ? `(${fmt(v)})` : fmt(v))
const fmt = (v: number) => {
  if (Math.abs(v) < 5e-4) return '0'
  if (Number.isInteger(v)) return String(v)
  const a = Math.abs(v)
  return a >= 100 ? v.toFixed(0) : a >= 10 ? v.toFixed(1) : v.toFixed(2)
}

export default function BatchNormStepper() {
  const [batch, setBatch] = useState<number[][]>(START)
  const [sel, setSel] = useState<[number, number]>([0, 0])
  const [gamma, setGamma] = useState([1, 1, 1])
  const [beta, setBeta] = useState([0, 0, 0])
  const [mode, setMode] = useState<'train' | 'eval'>('train')
  const [runMean, setRunMean] = useState([0, 0, 0])
  const [runVar, setRunVar] = useState([1, 1, 1])
  const [seen, setSeen] = useState(0)
  const [batchSeed, setBatchSeed] = useState(1)
  const player = usePlayer({ steps: STAGES.length, interval: 1400 })
  const stage = player.step
  const [si, sj] = sel

  const cols = [0, 1, 2]
  const mu = cols.map((j) => batch.reduce((s, r) => s + r[j], 0) / M_ROWS)
  const varB = cols.map((j) => batch.reduce((s, r) => s + (r[j] - mu[j]) ** 2, 0) / M_ROWS)
  const useMu = mode === 'train' ? mu : runMean
  const useVar = mode === 'train' ? varB : runVar
  const sd = useVar.map((v) => Math.sqrt(v + EPS))
  const centred = batch.map((r) => r.map((v, j) => v - useMu[j]))
  const xhat = centred.map((r) => r.map((v, j) => v / sd[j]))
  const out = xhat.map((r) => r.map((v, j) => gamma[j] * v + beta[j]))
  const shown = stage <= 1 ? batch : stage <= 3 ? centred : stage === 4 ? xhat : out
  const normalised = stage >= 4

  /** k training steps: fold each batch's statistics into the running averages, then draw the next batch */
  const advance = (k: number) => {
    let b = batch
    let rm = runMean
    let rv = runVar
    let seed = batchSeed
    for (let s = 0; s < k; s++) {
      const bm = cols.map((j) => b.reduce((acc, row) => acc + row[j], 0) / M_ROWS)
      const bv = cols.map((j) => b.reduce((acc, row) => acc + (row[j] - bm[j]) ** 2, 0) / M_ROWS)
      rm = rm.map((v, j) => (1 - MOMENTUM) * v + MOMENTUM * bm[j])
      rv = rv.map((v, j) => (1 - MOMENTUM) * v + MOMENTUM * bv[j] * (M_ROWS / (M_ROWS - 1)))
      const r = mulberry32(seed * 7919)
      const g = () => {
        const u = Math.max(r(), 1e-12)
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r())
      }
      b = Array.from({ length: M_ROWS }, () => cols.map((j) => Math.round((FEATURE_MEAN[j] + FEATURE_SD[j] * g()) * 10) / 10))
      seed += 1
    }
    setRunMean(rm)
    setRunVar(rv)
    setBatch(b)
    setBatchSeed(seed)
    setSeen((n) => n + k)
  }
  const resetAll = () => {
    setBatch(START)
    setRunMean([0, 0, 0])
    setRunVar([1, 1, 1])
    setSeen(0)
    setBatchSeed(1)
    setGamma([1, 1, 1])
    setBeta([0, 0, 0])
    player.reset()
  }

  const colVals = batch.map((r) => fmt(r[sj])).join(' + ')
  const statWord = mode === 'train' ? 'batch' : 'running'
  const formula = (() => {
    const j = sj
    const x = batch[si][j]
    switch (stage) {
      case 0:
        return `\\text{feature ${j + 1}, example ${si + 1}: } x = ${fmt(x)}`
      case 1:
        return mode === 'train' ? `\\mu_{${j + 1}} = \\tfrac{${colVals}}{5} = ${fmt(mu[j])}` : `\\text{eval: use running mean } ${fmt(runMean[j])}`
      case 2:
        return `x - \\mu = ${fmt(x)} - ${par(useMu[j])} = ${fmt(centred[si][j])}`
      case 3:
        return mode === 'train'
          ? `\\sigma_{${j + 1}} = \\sqrt{\\text{mean of squared gaps}} = \\sqrt{${fmt(varB[j])}} = ${fmt(Math.sqrt(varB[j]))}`
          : `\\text{eval: } \\sqrt{\\text{running var}} = \\sqrt{${fmt(runVar[j])}} = ${fmt(Math.sqrt(runVar[j]))}`
      case 4:
        return `\\hat x = \\tfrac{${fmt(centred[si][j])}}{${fmt(sd[j])}} = ${fmt(xhat[si][j])}`
      default:
        return `y = \\gamma \\hat x + \\beta = ${fmt(gamma[j])} \\times ${par(xhat[si][j])} + ${par(beta[j])} = ${fmt(out[si][j])}`
    }
  })()

  return (
    <Figure
      title="BatchNorm, one step at a time"
      caption={
        <>
          Rows are 5 examples in a batch; columns are 3 features with very different scales. Step through: BatchNorm works on each
          <b> column</b> separately, subtracting its mean and dividing by its spread, so every feature ends up centred on 0 with spread 1;
          then γ and β let the network choose a new scale and shift. Click any cell to follow it in the formula and to edit it. Each{' '}
          <b>Next batch</b> is one training step, which moves the stored running averages 10% of the way towards that batch&apos;s
          statistics. Switch to <b>eval</b> and the stored averages are used instead, so the result no longer depends on the other examples
          in the batch. After only a few batches the stored averages are still far from the true means, so eval outputs come out badly
          scaled; press <b>+20 batches</b> and they settle.
        </>
      }
    >
      <Segmented
        label="Mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'train', label: 'train: use batch statistics' },
          { value: 'eval', label: 'eval: use running statistics' },
        ]}
      />
      <div style={{ fontWeight: 700, color: 'var(--ink)' }}>
        Stage {stage + 1}: {STAGES[stage]}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem 2rem', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div style={{ display: 'grid', gap: '0.4rem', justifyItems: 'center' }}>
          <MatrixGrid
            label={normalised ? (stage === 4 ? 'normalised x̂' : 'output y') : stage >= 2 ? 'x − μ' : 'input x (rows = examples)'}
            data={shown}
            format={fmt}
            cols={[sj]}
            cells={[[si, sj]]}
            heat={normalised || stage >= 2}
            diverging
            cellSize={50}
            onCellClick={(i, j) => setSel([i, j])}
            ariaLabel="Batch matrix"
          />
          {stage >= 1 && <MatrixGrid label={`${statWord} mean μ`} data={[useMu]} format={fmt} cols={[sj]} cellSize={50} ariaLabel="Mean of each feature" />}
          {stage >= 3 && <MatrixGrid label={`${statWord} spread σ`} data={[useVar.map(Math.sqrt)]} format={fmt} cols={[sj]} cellSize={50} ariaLabel="Spread of each feature" />}
        </div>
        <div style={{ display: 'grid', gap: '0.4rem', justifyItems: 'center' }}>
          <MatrixGrid label="running mean (stored)" data={[runMean]} format={fmt} cellSize={50} ariaLabel="Running mean" />
          <MatrixGrid label="running var (stored)" data={[runVar]} format={fmt} cellSize={50} ariaLabel="Running variance" />
          <div style={{ fontSize: 'var(--step--1)', color: 'var(--ink-2)', textAlign: 'center', maxWidth: '16rem' }}>
            batches seen in training: {seen}
            <br />
            true feature means: 5, 50, 1
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
            <Button onClick={() => advance(1)}>Next batch</Button>
            <Button onClick={() => advance(20)}>+20 batches</Button>
          </div>
        </div>
      </div>
      <div style={{ minHeight: '2.6em', textAlign: 'center' }}>
        <M>{formula}</M>
      </div>
      <PlayerControls player={player} label={(s) => `Stage ${s + 1} of ${STAGES.length}`} />
      <Controls>
        <Slider
          label={`selected cell (example ${si + 1}, feature ${sj + 1})`}
          value={batch[si][sj]}
          min={RANGE[sj][0]}
          max={RANGE[sj][1]}
          step={sj === 1 ? 1 : 0.5}
          onChange={(v) => setBatch((b) => b.map((r, i) => (i === si ? r.map((x, j) => (j === sj ? v : x)) : r)))}
          format={fmt}
        />
        <Slider label={`γ for feature ${sj + 1}`} value={gamma[sj]} min={0} max={3} step={0.1} onChange={(v) => setGamma((g) => g.map((x, j) => (j === sj ? v : x)))} format={(v) => v.toFixed(1)} />
        <Slider label={`β for feature ${sj + 1}`} value={beta[sj]} min={-2} max={2} step={0.1} onChange={(v) => setBeta((g) => g.map((x, j) => (j === sj ? v : x)))} format={(v) => v.toFixed(1)} />
      </Controls>
      <Button onClick={resetAll}>Reset everything</Button>
    </Figure>
  )
}
