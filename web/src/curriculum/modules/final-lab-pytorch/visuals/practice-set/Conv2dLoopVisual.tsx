import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Segmented, Readout, Button, usePlayer, PlayerControls, useNarrow, mulberry32 } from '../../../../../kit'
import { CodeLines, type CodeLine } from '../task-attention/ui'
import { runCode, OFFLINE_MESSAGE } from './pyrun'
import s from './practice.module.css'

/*
  The same convolution two ways. "Loops" visits output positions one at a time (the window moves over
  the image). "im2col" copies every window into one row of a patch matrix, so a single
  matrix-vector product computes all outputs. Both are computed here from the same small integers,
  and the timing table shows real NumPy measurements (plus a button to time it in the browser).
*/

type Mode = 'loops' | 'im2col'

const TIMING_CODE = `import numpy as np, timeit
from numpy.lib.stride_tricks import sliding_window_view

def conv2d_loops(image, kernel):
    H, W = image.shape
    k = kernel.shape[0]
    out = np.zeros((H - k + 1, W - k + 1))
    for i in range(H - k + 1):
        for j in range(W - k + 1):
            total = 0.0
            for a in range(k):
                for b in range(k):
                    total += image[i + a, j + b] * kernel[a, b]
            out[i, j] = total
    return out

def conv2d_im2col(image, kernel):
    k = kernel.shape[0]
    patches = sliding_window_view(image, (k, k))
    oh, ow = patches.shape[:2]
    cols = patches.reshape(oh * ow, k * k)
    return (cols @ kernel.reshape(-1)).reshape(oh, ow)

rng = np.random.default_rng(0)
img, ker = rng.standard_normal((64, 64)), rng.standard_normal((3, 3))
t_loop = min(timeit.repeat(lambda: conv2d_loops(img, ker), number=1, repeat=3))
t_vec = min(timeit.repeat(lambda: conv2d_im2col(img, ker), number=20, repeat=3)) / 20
diff = np.abs(conv2d_loops(img, ker) - conv2d_im2col(img, ker)).max()
print(f"64 x 64 image, 3 x 3 kernel in your browser:")
print(f"loops  {t_loop * 1000:8.2f} ms")
print(f"im2col {t_vec * 1000:8.3f} ms   ({t_loop / t_vec:.0f} times faster)")
print(f"largest difference between the outputs: {diff:.1e}")`

const MEASURED: [string, string, string, string][] = [
  ['32 × 32', '2.6 ms', '0.03 ms', 'about 85×'],
  ['64 × 64', '11.3 ms', '0.09 ms', 'about 130×'],
  ['128 × 128', '51.8 ms', '0.94 ms', 'about 55×'],
]

function grid(n: number, seed: number, lo: number, hi: number): number[][] {
  const r = mulberry32(seed)
  return Array.from({ length: n }, () => Array.from({ length: n }, () => lo + Math.floor(r() * (hi - lo + 1))))
}

const fmtInt = (v: number) => String(v).replace('-', '−')

function Cells({
  data,
  hl,
  caption,
  colour = 'var(--viz-1)',
  hide,
  cell = 30,
}: {
  data: number[][]
  hl?: (i: number, j: number) => boolean
  caption: ReactNode
  colour?: string
  hide?: (i: number, j: number) => boolean
  cell?: number
}) {
  return (
    <div className={s.cgWrap}>
      <div className={s.cgCap}>{caption}</div>
      <div className={s.cg} style={{ gridTemplateColumns: `repeat(${data[0].length}, ${cell}px)` }}>
        {data.map((row, i) =>
          row.map((v, j) => {
            const on = hl?.(i, j)
            const hidden = hide?.(i, j)
            return (
              <span
                key={`${i}-${j}`}
                className={`${s.cgCell} ${on ? s.cgOn : ''}`}
                style={{
                  height: Math.round(cell * 0.8),
                  background: on ? `color-mix(in srgb, ${colour} 30%, var(--surface))` : undefined,
                  borderColor: on ? colour : undefined,
                }}
              >
                {hidden ? '·' : fmtInt(v)}
              </span>
            )
          }),
        )}
      </div>
    </div>
  )
}

export default function Conv2dLoopVisual() {
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const [mode, setMode] = useState<Mode>('loops')
  const [H, setH] = useState(4)
  const [k, setK] = useState(2)
  const [timing, setTiming] = useState('')
  const [timingBusy, setTimingBusy] = useState(false)
  const oh = H - k + 1
  const n = oh * oh
  const player = usePlayer({ steps: n, interval: 900 })
  const step = Math.min(player.step, n - 1)
  const pi = Math.floor(step / oh)
  const pj = step % oh

  const image = useMemo(() => grid(H, 11 + H, 0, 4), [H])
  const kernel = useMemo(() => grid(k, 5 + k, -1, 2), [k])
  const out = useMemo(
    () =>
      Array.from({ length: oh }, (_, i) =>
        Array.from({ length: oh }, (_, j) => {
          let t = 0
          for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) t += image[i + a][j + b] * kernel[a][b]
          return t
        }),
      ),
    [image, kernel, oh, k],
  )
  const patches = useMemo(() => {
    const rows: number[][] = []
    for (let i = 0; i < oh; i++) for (let j = 0; j < oh; j++) rows.push(Array.from({ length: k * k }, (_, c) => image[i + Math.floor(c / k)][j + (c % k)]))
    return rows
  }, [image, oh, k])
  const flatK = kernel.flat()
  const viaMatmul = patches.map((row) => row.reduce((acc, v, c) => acc + v * flatK[c], 0))
  const agree = viaMatmul.every((v, r) => v === out[Math.floor(r / oh)][r % oh])

  const inWindow = (i: number, j: number) => i >= pi && i < pi + k && j >= pj && j < pj + k
  const terms = Array.from({ length: k * k }, (_, c) => {
    const a = Math.floor(c / k)
    const b = c % k
    return `${fmtInt(image[pi + a][pj + b])}·${fmtInt(kernel[a][b])}`
  })

  const loopLines: CodeLine[] = [
    { code: 'for i in range(out_h):', note: `# i = ${pi}`, tone: 'cur' },
    { code: '    for j in range(out_w):', note: `# j = ${pj}`, tone: 'cur' },
    { code: '        total = 0.0' },
    { code: '        for a in range(k):' },
    { code: '            for b in range(k):' },
    { code: '                total += image[i + a, j + b] * kernel[a, b]' },
    { code: '        out[i, j] = total', note: `# out[${pi}, ${pj}] = ${fmtInt(out[pi][pj])}`, tone: 'cur' },
  ]
  const vecLines: CodeLine[] = [
    { code: 'patches = sliding_window_view(image, (k, k))', note: `# (${oh}, ${oh}, ${k}, ${k})` },
    { code: 'cols = patches.reshape(out_h * out_w, k * k)', note: `# (${n}, ${k * k}): one window per row`, tone: 'cur' },
    { code: 'out = (cols @ kernel.reshape(-1)).reshape(out_h, out_w)', note: `# (${n},) -> (${oh}, ${oh})`, tone: 'cur' },
  ]

  const runTiming = async () => {
    setTimingBusy(true)
    setTiming('Starting Python in your browser (the first run takes a few seconds)…')
    try {
      setTiming(await runCode(TIMING_CODE))
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setTiming(/load|network|fetch|initialise/i.test(msg) ? OFFLINE_MESSAGE : msg)
    }
    setTimingBusy(false)
  }

  return (
    <Figure
      title="conv2d: four loops, or one matrix product"
      caption={
        <>
          In <b>Loops</b>, step through the output positions and watch the window slide. Switch to <b>im2col</b>: the same windows become the rows of one patch matrix, and a
          single matrix-vector product gives every output at once. Change the sizes; the two versions always agree. The timing table shows why it matters.
        </>
      }
    >
      <div ref={wrapRef} className={s.stack}>
        <Controls>
          <Segmented
            label="Version"
            options={[
              { value: 'loops', label: 'Loops' },
              { value: 'im2col', label: 'im2col' },
            ]}
            value={mode}
            onChange={setMode}
          />
          <Segmented label="image" options={[3, 4, 5, 6].map((v) => ({ value: v, label: `${v}×${v}` }))} value={H} onChange={setH} />
          <Segmented
            label="kernel"
            options={[2, 3].map((v) => ({ value: v, label: `${v}×${v}` }))}
            value={k}
            onChange={(v) => {
              setK(v)
              player.reset()
            }}
          />
        </Controls>
        <CodeLines lines={mode === 'loops' ? loopLines : vecLines} title={mode === 'loops' ? 'naive version' : 'vectorised version (im2col)'} narrow={narrow} />
        <div className={s.convStage}>
          <Cells data={image} hl={inWindow} caption={`image (${H}×${H})`} />
          <Cells data={kernel} caption={`kernel (${k}×${k})`} colour="var(--viz-2)" hl={() => true} />
          {mode === 'loops' ? (
            <Cells data={out} caption={`output (${oh}×${oh})`} colour="var(--viz-3)" hl={(i, j) => i === pi && j === pj} hide={(i, j) => i * oh + j > step} />
          ) : (
            <div className={s.im2col}>
              <Cells
                data={patches}
                caption={`patch matrix (${n}×${k * k})`}
                hl={(r) => r === step}
                cell={narrow ? 24 : 28}
              />
              <span className={s.op}>@</span>
              <Cells data={flatK.map((v) => [v])} caption="kernel" colour="var(--viz-2)" hl={() => true} cell={narrow ? 24 : 28} />
              <span className={s.op}>=</span>
              <Cells data={viaMatmul.map((v) => [v])} caption="outputs" colour="var(--viz-3)" hl={(r) => r === step} cell={narrow ? 30 : 34} />
            </div>
          )}
        </div>
        <p className={s.sum}>
          {mode === 'loops' ? (
            <>
              out[{pi}, {pj}] = {terms.join(' + ')} = <b>{fmtInt(out[pi][pj])}</b>
            </>
          ) : (
            <>
              Row {step} of the patch matrix is the window at ({pi}, {pj}); its dot product with the flattened kernel is {terms.join(' + ')} = <b>{fmtInt(viaMatmul[step])}</b>.
            </>
          )}
        </p>
        <PlayerControls player={player} label={(i) => `position ${Math.min(i, n - 1) + 1} of ${n}`} />
        <Readout
          items={[
            ['output side', `${H} − ${k} + 1 = ${oh}`],
            ['multiplications', `${n} × ${k * k} = ${n * k * k}`],
            ['loops and im2col agree', agree ? 'yes, exactly' : 'no'],
          ]}
        />
        <div className={s.timing}>
          <div className={s.resHead}>Timing, 3×3 kernel, NumPy (best of 7 runs on our busy test server; your numbers will differ)</div>
          <table className={s.timeTable}>
            <thead>
              <tr>
                <th scope="col">image</th>
                <th scope="col">4 loops</th>
                <th scope="col">im2col</th>
                <th scope="col">speed-up</th>
              </tr>
            </thead>
            <tbody>
              {MEASURED.map((r) => (
                <tr key={r[0]}>
                  {r.map((c, i) => (i === 0 ? <th key={i} scope="row">{c}</th> : <td key={i}>{c}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
          <Button onClick={() => void runTiming()} disabled={timingBusy}>
            {timingBusy ? 'Timing…' : 'Time it in your browser'}
          </Button>
          {timing && <pre className={s.stdout}>{timing}</pre>}
        </div>
      </div>
    </Figure>
  )
}
