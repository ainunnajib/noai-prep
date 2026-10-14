import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Figure, Readout, Segmented, Toggle, Button, Plot, Grid, Axes, Path, HLine, useAnimationFrame, useContainerWidth, useNarrow, mulberry32 } from '../../../../../kit'
import { makeData, createNet, trainEpoch, evaluate, makeBuffers, evalGrid, zeroContourPath, sigmoid, paramCount, DOMAIN, type Act, type DatasetName, type Net, type Pt, type GridMaps } from './mlp'
import { useThemeRGB, mix, css, type RGB } from './themeColors'
import s from './playground.module.css'

/*
  A TensorFlow-Playground-style sandbox. The network is trained live (see mlp.ts). Every neuron is
  drawn as a little map of its own output over the whole input square, so you can see each
  first-layer neuron draw one straight fold and later layers combine the folds into shapes.
*/

const RES = 50
const N_POINTS = 200
const MAX_EPOCHS = 2000
const PRETRAIN = 120
const MAX_LAYERS = 3
const MAX_NEURONS = 8
const LRS = [0.001, 0.003, 0.01, 0.03, 0.1, 0.3]
const COLOR_NAMES = ['--viz-1', '--viz-2', '--surface', '--viz-ink', '--viz-muted', '--accent'] as const
type Colors = Record<(typeof COLOR_NAMES)[number], RGB>

interface HistPoint {
  e: number
  tr: number
  te: number
  trAcc: number
  teAcc: number
}

interface Run {
  key: string
  net: Net
  act: Act
  rng: () => number
  epoch: number
  hist: HistPoint[]
}

const keyOf = (ds: DatasetName, hidden: number[], act: Act, seed: number) => `${ds}|${hidden.join('-')}|${act}|${seed}`

function record(run: Run, train: Pt[], test: Pt[]) {
  const buf = makeBuffers(run.net.sizes)
  const a = evaluate(run.net, run.act, train, buf)
  const b = evaluate(run.net, run.act, test, buf)
  run.hist.push({ e: run.epoch, tr: a.loss, te: b.loss, trAcc: a.acc, teAcc: b.acc })
}

function newRun(ds: DatasetName, hidden: number[], act: Act, seed: number, lr: number, train: Pt[], test: Pt[], pretrain: number): Run {
  const sizes = [2, ...hidden, 1]
  const run: Run = { key: keyOf(ds, hidden, act, seed), net: createNet(sizes, act, seed + 1), act, rng: mulberry32((seed + 1) * 99), epoch: 0, hist: [] }
  record(run, train, test)
  for (let e = 0; e < pretrain; e++) {
    trainEpoch(run.net, act, train, lr, run.rng)
    run.epoch++
    record(run, train, test)
  }
  return run
}

/** Paint one neuron's map into an ImageData. 'prob' colours σ(z) by class; 'diverge' shows sign and size. */
function paint(img: ImageData, v: Float32Array, mode: 'prob' | 'diverge', c: Colors) {
  const d = img.data
  let m = 0
  if (mode === 'diverge') for (let k = 0; k < v.length; k++) m = Math.max(m, Math.abs(v[k]))
  for (let k = 0; k < v.length; k++) {
    let col: RGB
    if (mode === 'prob') {
      const p = sigmoid(v[k])
      col = mix(p >= 0.5 ? c['--viz-2'] : c['--viz-1'], c['--surface'], 0.36 * Math.abs(2 * p - 1))
    } else {
      const t = m < 1e-9 ? 0 : v[k] / m
      col = mix(t >= 0 ? c['--viz-2'] : c['--viz-1'], c['--surface'], 0.82 * Math.abs(t))
    }
    d[k * 4] = col[0]
    d[k * 4 + 1] = col[1]
    d[k * 4 + 2] = col[2]
    d[k * 4 + 3] = 255
  }
}

function diagramLayout(sizes: number[], width: number) {
  const cols = sizes.length
  const maxN = Math.max(...sizes)
  const colSpace = (width - 40) / Math.max(1, cols - 1)
  const node = Math.max(18, Math.min(44, Math.floor(colSpace * 0.4), Math.floor(290 / (maxN * 1.28))))
  const vgap = Math.round(node * 0.28)
  const top = 34
  const stackH = maxN * node + (maxN - 1) * vgap
  const labelY = top + stackH + 8
  const height = labelY + 20
  const padX = node / 2 + 14
  const colX = (l: number) => padX + (l * (width - 2 * padX)) / Math.max(1, cols - 1)
  const nodeY = (l: number, i: number) => top + ((maxN - sizes[l]) * (node + vgap)) / 2 + i * (node + vgap)
  return { node, height, colX, nodeY, labelY }
}

const layerName = (l: number, L: number) => (l === 0 ? 'inputs' : l === L ? 'output' : `layer ${l}`)
const neuronName = (l: number, j: number, L: number) => (l === 0 ? (j === 0 ? 'input x₁' : 'input x₂') : l === L ? 'output neuron' : `layer ${l}, neuron ${j + 1}`)

function NetDiagram({
  net,
  maps,
  colors,
  sel,
  onSelect,
  onResize,
}: {
  net: Net
  maps: GridMaps
  colors: Colors | null
  sel: [number, number] | null
  onSelect: (l: number, j: number) => void
  onResize: (layer: number, delta: number) => void
}) {
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(400)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scratch = useRef<{ cv: HTMLCanvasElement; img: ImageData } | null>(null)
  const { sizes } = net
  const L = sizes.length - 1
  const lay = diagramLayout(sizes, width)

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv || !colors) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    cv.width = Math.round(width * dpr)
    cv.height = Math.round(lay.height * dpr)
    const ctx = cv.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, lay.height)
    const { node, colX, nodeY } = lay
    // edges
    let wMax = 1e-9
    for (const w of net.W) for (let k = 0; k < w.length; k++) wMax = Math.max(wMax, Math.abs(w[k]))
    for (let l = 0; l < L; l++) {
      for (let j = 0; j < sizes[l + 1]; j++) {
        const focus = sel && sel[0] === l + 1 && sel[1] === j
        for (let i = 0; i < sizes[l]; i++) {
          const w = net.W[l][j * sizes[l] + i]
          const t = Math.min(1, Math.abs(w) / wMax)
          const dim = sel && !focus ? 0.35 : 1
          ctx.strokeStyle = css(w >= 0 ? colors['--viz-2'] : colors['--viz-1'], (0.22 + 0.7 * t) * dim)
          ctx.lineWidth = 0.6 + 3.4 * t
          ctx.beginPath()
          ctx.moveTo(colX(l) + node / 2, nodeY(l, i) + node / 2)
          ctx.lineTo(colX(l + 1) - node / 2, nodeY(l + 1, j) + node / 2)
          ctx.stroke()
        }
      }
    }
    // neuron maps
    if (!scratch.current) {
      const c2 = document.createElement('canvas')
      c2.width = RES
      c2.height = RES
      scratch.current = { cv: c2, img: new ImageData(RES, RES) }
    }
    const { cv: sc, img } = scratch.current
    const sctx = sc.getContext('2d')
    if (!sctx) return
    ctx.imageSmoothingEnabled = true
    for (let l = 0; l <= L; l++) {
      for (let j = 0; j < sizes[l]; j++) {
        paint(img, l === L ? maps.z[l][j] : maps.a[l][j], l === L ? 'prob' : 'diverge', colors)
        sctx.putImageData(img, 0, 0)
        const x = colX(l) - node / 2
        const y = nodeY(l, j)
        ctx.drawImage(sc, x, y, node, node)
        const isSel = sel ? sel[0] === l && sel[1] === j : l === L
        ctx.lineWidth = isSel ? 3 : 1
        ctx.strokeStyle = css(isSel ? colors['--viz-ink'] : colors['--viz-muted'])
        ctx.strokeRect(x + 0.5, y + 0.5, node - 1, node - 1)
      }
    }
  }, [net, maps, colors, sel, width, lay, sizes, L])

  return (
    <div ref={wrapRef} className={s.diagram} style={{ height: lay.height }}>
      <canvas ref={canvasRef} style={{ height: lay.height }} role="img" aria-label={`Network diagram with layers ${sizes.join('-')}; each neuron is drawn as a small map of its output`} />
      {sizes.map((n, l) =>
        Array.from({ length: n }, (_, j) => (
          <button
            key={`${l}-${j}`}
            type="button"
            className={s.nodeBtn}
            style={{ left: lay.colX(l) - lay.node / 2, top: lay.nodeY(l, j), width: lay.node, height: lay.node }}
            aria-label={`Show the map of ${neuronName(l, j, L)}`}
            aria-pressed={sel ? sel[0] === l && sel[1] === j : l === L}
            onClick={() => onSelect(l, j)}
          />
        )),
      )}
      {sizes.slice(1, -1).map((n, k) => (
        <div key={`st${k}`} className={s.stepper} style={{ left: lay.colX(k + 1), top: 4 }}>
          <button type="button" className={s.stepBtn} onClick={() => onResize(k, -1)} disabled={n <= 1} aria-label={`Remove a neuron from layer ${k + 1}`}>
            −
          </button>
          <span>{n}</span>
          <button type="button" className={s.stepBtn} onClick={() => onResize(k, 1)} disabled={n >= MAX_NEURONS} aria-label={`Add a neuron to layer ${k + 1}`}>
            +
          </button>
        </div>
      ))}
      {sizes.map((_, l) => (
        <span key={`lab${l}`} className={s.colLabel} style={{ left: lay.colX(l), top: lay.labelY }}>
          {layerName(l, L)}
        </span>
      ))}
    </div>
  )
}

const DataPoints = memo(function DataPoints({ train, test, showTest }: { train: Pt[]; test: Pt[]; showTest: boolean }) {
  const col = (p: Pt) => (p.label === 1 ? 'var(--viz-2)' : 'var(--viz-1)')
  return (
    <g>
      {showTest &&
        test.map((p, i) => (
          <circle key={`t${i}`} cx={p.x} cy={-p.y} r={0.15} vectorEffect="non-scaling-stroke" style={{ fill: 'var(--surface)', stroke: col(p), strokeWidth: 1.8 }} />
        ))}
      {train.map((p, i) => (
        <circle key={`p${i}`} cx={p.x} cy={-p.y} r={0.15} vectorEffect="non-scaling-stroke" style={{ fill: col(p), stroke: 'var(--surface)', strokeWidth: 1.2 }} />
      ))}
    </g>
  )
})

function MainMap({ maps, view, L, colors, train, test, showTest }: { maps: GridMaps; view: [number, number]; L: number; colors: Colors | null; train: Pt[]; test: Pt[]; showTest: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [l, j] = view
  const isOut = l === L
  useEffect(() => {
    const cv = ref.current
    if (!cv || !colors) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const img = ctx.createImageData(RES, RES)
    paint(img, isOut ? maps.z[l][j] : maps.a[l][j], isOut ? 'prob' : 'diverge', colors)
    ctx.putImageData(img, 0, 0)
  }, [maps, l, j, isOut, colors])
  const contour = l === 0 ? '' : zeroContourPath(maps.z[l][j], RES)
  return (
    <div className={s.mapBox}>
      <canvas ref={ref} width={RES} height={RES} role="img" aria-label={isOut ? 'The network output over the input square, with the data points' : `Map of ${neuronName(l, j, L)}`} />
      <svg viewBox={`${-DOMAIN} ${-DOMAIN} ${2 * DOMAIN} ${2 * DOMAIN}`} aria-hidden="true">
        <line x1={-DOMAIN} x2={DOMAIN} y1={0} y2={0} vectorEffect="non-scaling-stroke" style={{ stroke: 'var(--viz-muted)', strokeWidth: 1, opacity: 0.6 }} />
        <line y1={-DOMAIN} y2={DOMAIN} x1={0} x2={0} vectorEffect="non-scaling-stroke" style={{ stroke: 'var(--viz-muted)', strokeWidth: 1, opacity: 0.6 }} />
        {contour && <path d={contour} vectorEffect="non-scaling-stroke" style={{ fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: isOut ? 2 : 1.5, strokeDasharray: isOut ? undefined : '4 3' }} />}
        <DataPoints train={train} test={test} showTest={showTest} />
      </svg>
    </div>
  )
}

function LossChart({ hist }: { hist: HistPoint[] }) {
  const last = hist[hist.length - 1]
  const xMax = Math.max(100, Math.ceil(last.e / 100) * 100)
  let yMax = 0.8
  for (const h of hist) yMax = Math.max(yMax, h.tr, h.te)
  yMax = Math.min(2, yMax * 1.05)
  const stride = Math.max(1, Math.floor(hist.length / 400))
  const pick = hist.filter((_, i) => i % stride === 0 || i === hist.length - 1)
  return (
    <Plot x={[0, xMax]} y={[0, yMax]} width={520} height={160} minHeight={170} margin={{ left: 42, bottom: 30, top: 24, right: 12 }} ariaLabel="Training and test loss against epoch">
      <Grid xTicks={5} yTicks={4} />
      <Axes xLabel="epoch" yLabel="loss" xTicks={5} yTicks={4} />
      <HLine y={Math.LN2} label="ln 2: a coin-flip guess" />
      <Path points={pick.map((h) => [h.e, h.te] as [number, number])} color="var(--viz-4)" width={2} dash="5 4" />
      <Path points={pick.map((h) => [h.e, h.tr] as [number, number])} color="var(--viz-3)" width={2.2} />
    </Plot>
  )
}

export default function MiniPlayground() {
  const [ds, setDs] = useState<DatasetName>('circle')
  const [hidden, setHidden] = useState<number[]>([4])
  const [act, setAct] = useState<Act>('relu')
  const [lr, setLr] = useState(0.01)
  const [seed, setSeed] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [showTest, setShowTest] = useState(false)
  const [sel, setSel] = useState<[number, number] | null>(null)
  const [, setTick] = useState(0)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)
  const colors = useThemeRGB(COLOR_NAMES)

  const train = useMemo(() => makeData(ds, N_POINTS, 11), [ds])
  const test = useMemo(() => makeData(ds, N_POINTS, 12), [ds])
  const key = keyOf(ds, hidden, act, seed)
  const runRef = useRef<Run | null>(null)
  if (runRef.current === null) runRef.current = newRun(ds, hidden, act, seed, lr, train, test, PRETRAIN)
  else if (runRef.current.key !== key) runRef.current = newRun(ds, hidden, act, seed, lr, train, test, 0)
  const run = runRef.current

  const stepEpoch = () => {
    const r = runRef.current
    if (!r) return
    trainEpoch(r.net, r.act, train, lr, r.rng)
    r.epoch++
    record(r, train, test)
  }

  useAnimationFrame(() => {
    const r = runRef.current
    if (!r || r.epoch >= MAX_EPOCHS) {
      setPlaying(false)
      return
    }
    stepEpoch()
    setTick((t) => t + 1)
  }, playing)

  const sizes = run.net.sizes
  const L = sizes.length - 1
  const view: [number, number] = sel && sel[0] <= L && sel[1] < sizes[sel[0]] ? sel : [L, 0]
  const maps = useMemo(() => evalGrid(run.net, run.act, RES), [run, run.epoch])
  const last = run.hist[run.hist.length - 1]

  const select = (l: number, j: number) => setSel(l === L || (view[0] === l && view[1] === j) ? null : [l, j])
  const resize = (k: number, delta: number) => {
    setSel(null)
    setHidden((h) => h.map((n, i) => (i === k ? Math.max(1, Math.min(MAX_NEURONS, n + delta)) : n)))
  }
  const setLayers = (n: number) => {
    setSel(null)
    setHidden((h) => (n > h.length ? [...h, h[h.length - 1] ?? 4] : h.slice(0, n)))
  }

  const isOut = view[0] === L
  let dead = false
  if (!isOut && view[0] > 0 && run.act === 'relu') {
    const m = maps.a[view[0]][view[1]]
    dead = true
    for (let k = 0; k < m.length; k++)
      if (m[k] > 1e-9) {
        dead = false
        break
      }
  }
  const title = isOut ? (
    <>
      <b>Output</b>: the network&rsquo;s prediction. Orange area = &ldquo;orange class&rdquo;, blue = &ldquo;blue class&rdquo;; the solid line is the decision boundary.
    </>
  ) : view[0] === 0 ? (
    <>
      <b>{neuronName(view[0], view[1], L)}</b>: the raw input itself. Tap it again to return to the output.
    </>
  ) : dead ? (
    <>
      <b>{neuronName(view[0], view[1], L)}</b> outputs 0 for every input: its weighted sum is negative everywhere, so this ReLU neuron has &ldquo;died&rdquo; and no longer
      affects the output.
    </>
  ) : (
    <>
      <b>{neuronName(view[0], view[1], L)}</b>: orange where it fires, blank where it outputs 0 (blue if negative). Dashed: where its weighted sum is 0. Tap it again to go back.
    </>
  )

  return (
    <Figure
      title="A mini neural-network playground"
      caption={
        <>
          Each small square in the network is one neuron, drawn as a map of its output over the whole input square (orange = positive, blue = negative, blank = zero). Edges are
          orange for positive weights and blue for negative ones; thicker means bigger. <b>Tap any neuron</b> to see its map full size. This network has already trained for{' '}
          {PRETRAIN} epochs on the circle: each first-layer ReLU neuron draws one straight fold, and the output neuron adds them up into a closed region. Try: remove neurons until
          the circle fails; switch to the <b>spiral</b> and compare 1 layer of 2 neurons with 2 layers of 8; set the activation to <b>none</b> and watch the boundary stay straight
          however many layers you add.
        </>
      }
    >
      <div ref={wrapRef} className={s.wrap}>
        <div className={s.row}>
          <Button primary onClick={() => setPlaying((p) => !p)} disabled={!playing && run.epoch >= MAX_EPOCHS}>
            {playing ? 'Pause' : 'Play'}
          </Button>
          <Button
            onClick={() => {
              setPlaying(false)
              stepEpoch()
              setTick((t) => t + 1)
            }}
            disabled={run.epoch >= MAX_EPOCHS}
          >
            Step 1 epoch
          </Button>
          <Button
            onClick={() => {
              setSeed((v) => v + 1)
            }}
          >
            New random weights
          </Button>
          <Readout
            items={[
              ['epoch', String(run.epoch)],
              ['parameters', String(paramCount(sizes))],
            ]}
          />
        </div>
        <div className={`${s.panels} ${narrow ? s.panelsNarrow : ''}`}>
          <div className={s.panel}>
            <div className={s.panelTitle}>
              <b>The network</b>: inputs on the left, output on the right. Use − and + to change how many neurons a hidden layer has.
            </div>
            <NetDiagram net={run.net} maps={maps} colors={colors} sel={isOut ? null : view} onSelect={select} onResize={resize} />
          </div>
          <div className={s.panel}>
            <div className={s.panelTitle}>{title}</div>
            <MainMap maps={maps} view={view} L={L} colors={colors} train={train} test={test} showTest={showTest} />
            <div className={s.legend}>
              <span>
                <i style={{ background: 'var(--viz-2)' }} />
                orange class
              </span>
              <span>
                <i style={{ background: 'var(--viz-1)' }} />
                blue class
              </span>
              {showTest && (
                <span>
                  <i className={s.ring} style={{ borderColor: 'var(--viz-ink)' }} />
                  hollow = test point
                </span>
              )}
            </div>
          </div>
        </div>
        <div className={s.panel}>
          <div className={s.legend}>
            <span>
              <span className={s.swatchLine} style={{ borderColor: 'var(--viz-3)' }} />
              training loss {last.tr.toFixed(3)} (accuracy {Math.round(last.trAcc * 100)}%)
            </span>
            <span>
              <span className={s.swatchLine} style={{ borderColor: 'var(--viz-4)', borderTopStyle: 'dashed' }} />
              test loss {last.te.toFixed(3)} (accuracy {Math.round(last.teAcc * 100)}%)
            </span>
          </div>
          <LossChart hist={run.hist} />
        </div>
        <div className={s.row}>
          <Segmented
            label="data"
            value={ds}
            onChange={(v) => {
              setDs(v)
              setSel(null)
            }}
            options={[
              { value: 'circle', label: 'circle' },
              { value: 'xor', label: 'XOR' },
              { value: 'moons', label: 'moons' },
              { value: 'spiral', label: 'spiral' },
            ]}
          />
          <Segmented
            label="activation in hidden layers"
            value={act}
            onChange={(v) => {
              setAct(v)
              setSel(null)
            }}
            options={[
              { value: 'relu', label: 'ReLU' },
              { value: 'tanh', label: 'tanh' },
              { value: 'sigmoid', label: 'sigmoid' },
              { value: 'linear', label: 'none' },
            ]}
          />
        </div>
        <div className={s.row}>
          <Segmented label="learning rate" value={lr} onChange={(v) => setLr(v)} options={LRS.map((v) => ({ value: v, label: String(v) }))} />
          <div className={s.layerStepper}>
            <span>hidden layers</span>
            <span className={s.inline}>
              <button type="button" className={s.stepBtn} onClick={() => setLayers(hidden.length - 1)} disabled={hidden.length === 0} aria-label="Remove a hidden layer">
                −
              </button>
              {hidden.length}
              <button type="button" className={s.stepBtn} onClick={() => setLayers(hidden.length + 1)} disabled={hidden.length >= MAX_LAYERS} aria-label="Add a hidden layer">
                +
              </button>
            </span>
          </div>
          <Toggle label="show test data" checked={showTest} onChange={setShowTest} />
        </div>
      </div>
    </Figure>
  )
}
