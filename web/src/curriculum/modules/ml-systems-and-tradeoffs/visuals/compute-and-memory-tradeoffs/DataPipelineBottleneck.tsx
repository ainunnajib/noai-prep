import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Button, Plot, Rect, Label, VLine, useAnimationFrame, useNarrow } from '../../../../../kit'

/*
  A training step needs a batch of 32 images. The timeline shows the first second (1000 ms). CPU workers decode and augment batches; the GPU copies a
  batch in (5 ms) and computes on it (50 ms). Discrete-event simulation of the first BATCHES steps:
    workers = 0 : the main process loads a batch, then the GPU works, then it loads the next (no overlap)
    workers = W : batch b is loaded by worker b mod W; a worker may run at most 2W batches ahead of the
                  GPU (PyTorch's default prefetch_factor = 2 batches per worker)
    copies      : calling .cpu()/.numpy()/.item() on GPU tensors every step forces the GPU to finish and
                  ship data back: modelled as a 30 ms stall per step (GPU idle)
  Steady state: step time = max(load / W, copy + compute + stall), utilisation = compute / step time.
*/

const T_GPU = 50
const T_COPY = 5
const T_STALL = 30
const BATCHES = 30
const VIEW = 1000 // ms of timeline shown
const IMG = 32

interface Sim {
  loads: { w: number; b: number; t0: number; t1: number }[]
  gpu: { b: number; t0: number; tc: number; t1: number; t2: number }[] // copy t0..tc, compute tc..t1, stall t1..t2
  end: number
}

function simulate(workers: number, tLoad: number, stall: boolean): Sim {
  const loads: Sim['loads'] = []
  const gpu: Sim['gpu'] = []
  const tStall = stall ? T_STALL : 0
  if (workers === 0) {
    let t = 0
    for (let b = 0; b < BATCHES; b++) {
      loads.push({ w: 0, b, t0: t, t1: t + tLoad })
      const t0 = t + tLoad
      gpu.push({ b, t0, tc: t0 + T_COPY, t1: t0 + T_COPY + T_GPU, t2: t0 + T_COPY + T_GPU + tStall })
      t = t0 + T_COPY + T_GPU + tStall
    }
    return { loads, gpu, end: t }
  }
  const wFree = Array(workers).fill(0)
  const ready: number[] = []
  let gpuFree = 0
  for (let b = 0; b < BATCHES; b++) {
    const w = b % workers
    const limit = b - 2 * workers >= 0 ? gpu[b - 2 * workers].t0 : 0
    const t0 = Math.max(wFree[w], limit)
    ready[b] = t0 + tLoad
    wFree[w] = ready[b]
    loads.push({ w, b, t0, t1: ready[b] })
    // the GPU takes batches in order
    const g0 = Math.max(ready[b], gpuFree)
    const row = { b, t0: g0, tc: g0 + T_COPY, t1: g0 + T_COPY + T_GPU, t2: g0 + T_COPY + T_GPU + tStall }
    gpu.push(row)
    gpuFree = row.t2
  }
  return { loads, gpu, end: gpuFree }
}

export default function DataPipelineBottleneck() {
  const [workers, setWorkers] = useState(0)
  const [tLoad, setTLoad] = useState(200)
  const [stall, setStall] = useState(false)
  const [t, setT] = useState<number | null>(null) // animation time; null = show everything
  const [ref, narrow] = useNarrow<HTMLDivElement>(520)

  const sim = useMemo(() => simulate(workers, tLoad, stall), [workers, tLoad, stall])
  const gpuWork = T_COPY + T_GPU + (stall ? T_STALL : 0)
  const stepTime = workers === 0 ? tLoad + gpuWork : Math.max(tLoad / workers, gpuWork)
  const util = T_GPU / stepTime
  const imgsPerSec = (IMG * 1000) / stepTime
  const bottleneck = workers === 0 ? 'loading and GPU take turns' : tLoad / workers > gpuWork + 0.01 ? 'data loading (CPU)' : stall ? 'GPU, padded with stalls' : 'the GPU (good!)'

  const view = VIEW
  const now = t ?? view
  useAnimationFrame((dt) => {
    setT((x) => {
      const nx = (x ?? 0) + dt * 260
      return nx >= view ? null : nx
    })
  }, t !== null)

  // the first long idle stretch on the GPU row that is already visible, for an "idle" label
  const idleGap = (() => {
    let prev = 0
    for (const g of sim.gpu) {
      if (g.t0 - prev >= 70 && g.t0 <= now) return [prev, g.t0] as [number, number]
      prev = g.t2
    }
    return null
  })()
  const rows = Math.max(1, workers)
  const rowH = 1
  const yGpu = rows * rowH + 0.7
  const yMax = yGpu + 1.2
  const clipT = (a: number) => Math.min(a, now)

  return (
    <Figure
      wide
      title="Is the GPU waiting for data?"
      caption={
        <>
          Each orange bar is one CPU worker preparing a batch of 32 images; on the GPU row, blue is computing, grey is copying the batch in, red is a stall, and the gaps are the GPU
          sitting idle. Start with 0 workers (the main process does everything), then add workers until the GPU row is solid blue. Turn the per-step copies on and see a fast GPU waste
          time anyway. Press Play to watch the first second of training unfold.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <Plot x={[0, view]} y={[0, yMax]} width={640} height={60 + rows * 26} minHeight={narrow ? 70 + rows * 24 : undefined} margin={{ left: narrow ? 64 : 84, right: 10, top: 6, bottom: 26 }} ariaLabel="Timeline of CPU workers loading batches and the GPU computing">
          {Array.from({ length: rows }, (_, r) => (
            <Label key={r} x={0} y={r * rowH + 0.5} dx={-8} dy={4} anchor="end" size={11.5} color="var(--ink-2)" weight={700}>
              {workers === 0 ? 'main proc.' : `worker ${rows - r}`}
            </Label>
          ))}
          <Label x={0} y={yGpu + 0.45} dx={-8} dy={4} anchor="end" size={12} color="var(--ink)" weight={800}>
            GPU
          </Label>
          {/* idle background for the GPU row */}
          <Rect x0={0} x1={clipT(view)} y0={yGpu + 0.05} y1={yGpu + 0.85} fill="color-mix(in srgb, var(--viz-muted) 16%, transparent)" />
          {sim.loads
            .filter((l) => l.t0 < now && clipT(l.t1) - l.t0 > 2)
            .map((l) => (
              <Rect key={`l${l.b}`} x0={l.t0 + 1} x1={clipT(l.t1) - 1} y0={(workers === 0 ? 0 : rows - 1 - l.w) * rowH + 0.15} y1={(workers === 0 ? 0 : rows - 1 - l.w) * rowH + 0.85} fill="color-mix(in srgb, var(--viz-2) 70%, var(--surface))" rx={3} />
            ))}
          {sim.gpu
            .filter((g) => g.t0 < now)
            .map((g) => (
              <g key={`g${g.b}`}>
                <Rect x0={g.t0} x1={clipT(g.tc)} y0={yGpu + 0.05} y1={yGpu + 0.85} fill="var(--viz-muted)" />
                {g.tc < now && <Rect x0={g.tc} x1={clipT(g.t1)} y0={yGpu + 0.05} y1={yGpu + 0.85} fill="color-mix(in srgb, var(--viz-1) 75%, var(--surface))" />}
                {stall && g.t1 < now && <Rect x0={g.t1} x1={clipT(g.t2)} y0={yGpu + 0.05} y1={yGpu + 0.85} fill="color-mix(in srgb, var(--viz-neg) 70%, var(--surface))" />}
              </g>
            ))}
          {idleGap && (
            <Label x={(idleGap[0] + idleGap[1]) / 2} y={yGpu + 0.45} dy={4} anchor="middle" size={11.5} color="var(--ink-3)" weight={700}>
              idle
            </Label>
          )}
          {[0, 250, 500, 750, 1000].map((x) => (
            <Label key={x} x={x} y={0} dy={17} anchor="middle" size={11} color="var(--ink-3)">
              {narrow && x % 500 !== 0 ? '' : `${x} ms`}
            </Label>
          ))}
          {t !== null && <VLine x={now} color="var(--ink)" dash="0" width={1.5} />}
        </Plot>
      </div>
      <div
        role="status"
        style={{
          width: '100%',
          padding: '0.45rem 0.7rem',
          borderRadius: 8,
          fontSize: 13.5,
          fontWeight: 650,
          background: util > 0.85 ? 'var(--ok-soft)' : util > 0.5 ? 'var(--warn-soft)' : 'var(--bad-soft)',
          color: util > 0.85 ? 'var(--ok)' : util > 0.5 ? 'var(--warn)' : 'var(--bad)',
        }}
      >
        GPU busy computing {Math.round(util * 100)}% of the time. Bottleneck: {bottleneck}.
      </div>
      <Controls>
        <Slider label="DataLoader workers (num_workers)" value={workers} min={0} max={8} onChange={setWorkers} />
        <Slider label="CPU time to prepare one batch" value={tLoad} min={20} max={400} step={10} onChange={setTLoad} format={(v) => `${v} ms`} />
      </Controls>
      <Controls>
        <Toggle label="copy results to the CPU every step (.cpu() / .item())" checked={stall} onChange={setStall} />
        <Button primary onClick={() => setT(0)}>
          {t === null ? 'Play' : 'Restart'}
        </Button>
      </Controls>
      <Readout
        items={[
          ['step time', `${Math.round(stepTime)} ms`],
          ['GPU utilisation', `${Math.round(util * 100)}%`],
          ['throughput', `${Math.round(imgsPerSec)} images/s`],
        ]}
      />
    </Figure>
  )
}
