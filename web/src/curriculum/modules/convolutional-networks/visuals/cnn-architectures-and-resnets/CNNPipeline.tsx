import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Segmented, Button, Bars, Readout, useContainerWidth, M } from '../../../../../kit'
import { carImage, layer1, layer2, maxPool, outSize, L1_NAMES, L2_NAMES, type Tensor } from './pipeline'
import { HeatCanvas, RgbCanvas } from './canvas'

/*
  A small CNN for 32×32 colour images, traced shape by shape:
  conv → ReLU → pool → conv → ReLU → pool → flatten (or global average pool) → linear → softmax.
  Click a conv layer to edit its kernel, padding, stride and channels; every shape downstream
  updates. The linear layer keeps the in_features "written in the code" until you fix it, so a
  shape change upstream produces PyTorch's real error message.
*/

interface ConvCfg {
  k: number
  p: number
  s: number
  c: number
}
const DEFAULT: [ConvCfg, ConvCfg] = [
  { k: 3, p: 1, s: 1, c: 16 },
  { k: 3, p: 1, s: 1, c: 32 },
]
const CLASSES = ['automobile', 'truck', 'ship', 'airplane', 'frog']
const PROBS = [0.71, 0.17, 0.05, 0.03, 0.01] // illustrative output of a trained network
const nf = (v: number) => v.toLocaleString('en-GB')

function Card({ title, shape, sub, active, error, onClick, children }: { title: ReactNode; shape: ReactNode; sub?: ReactNode; active?: boolean; error?: boolean; onClick?: () => void; children?: ReactNode }) {
  const style = {
    display: 'grid',
    gap: 4,
    alignContent: 'start',
    justifyItems: 'center',
    padding: '8px 6px',
    borderRadius: 10,
    border: `1.5px solid ${error ? 'var(--viz-neg)' : active ? 'var(--accent)' : 'var(--rule)'}`,
    background: error ? 'color-mix(in srgb, var(--viz-neg) 10%, var(--surface))' : active ? 'var(--accent-soft)' : 'var(--surface)',
    minWidth: 0,
    font: 'inherit',
    color: 'inherit',
    textAlign: 'center' as const,
    cursor: onClick ? 'pointer' : 'default',
  }
  const body = (
    <>
      <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--ink)' }}>{title}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 700, color: error ? 'var(--viz-neg)' : 'var(--viz-1)' }}>{shape}</span>
      {children}
      {sub && <span style={{ fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.25 }}>{sub}</span>}
    </>
  )
  return onClick ? (
    <button type="button" onClick={onClick} aria-pressed={active} style={style}>
      {body}
    </button>
  ) : (
    <div style={style}>{body}</div>
  )
}

function Maps({ t, names, size }: { t: Tensor; names: string[]; size: number }) {
  if (!t.length || !t[0].length) return <span style={{ fontSize: 12, color: 'var(--viz-neg)' }}>nothing left</span>
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: 3 }}>
      {t.map((m, i) => (
        <HeatCanvas key={i} map={m} size={size} label={`${names[i]} feature map, ${m.length} by ${m[0].length}`} />
      ))}
    </div>
  )
}

export default function CNNPipeline() {
  const [cfg, setCfg] = useState<[ConvCfg, ConvCfg]>(DEFAULT)
  const [sel, setSel] = useState<0 | 1>(0)
  const [head, setHead] = useState<'flatten' | 'gap'>('flatten')
  const [built, setBuilt] = useState({ flatten: 2048, gap: 32 }) // in_features written in the code
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(640)

  const img = useMemo(() => carImage(), [])
  const [c1, c2] = cfg
  const h1 = outSize(32, c1.k, c1.p, c1.s)
  const h1p = outSize(h1, 2, 0, 2)
  const h2 = h1p ? outSize(h1p, c2.k, c2.p, c2.s) : 0
  const h2p = h2 ? outSize(h2, 2, 0, 2) : 0
  const broken = h2p === 0

  const a1 = useMemo(() => (h1 ? layer1(img, c1.k, c1.p, c1.s) : []), [img, c1.k, c1.p, c1.s, h1])
  const p1 = useMemo(() => (h1p ? a1.map(maxPool) : []), [a1, h1p])
  const a2 = useMemo(() => (h2 ? layer2(p1, c2.k, c2.p, c2.s) : []), [p1, c2.k, c2.p, c2.s, h2])
  const p2 = useMemo(() => (h2p ? a2.map(maxPool) : []), [a2, h2p])

  const feats = head === 'flatten' ? c2.c * h2p * h2p : c2.c
  const expected = built[head]
  const mismatch = !broken && feats !== expected
  const params1 = (c1.k * c1.k * 3 + 1) * c1.c
  const params2 = (c2.k * c2.k * c1.c + 1) * c2.c
  const paramsFc = (expected + 1) * 10

  const narrow = width < 520
  const cols = narrow ? 2 : 4
  const cardW = (width - (cols - 1) * 8) / cols
  const mapPx = Math.max(36, Math.min(72, Math.floor((cardW - 22) / 2)))

  const edit = (patch: Partial<ConvCfg>) => setCfg((old) => old.map((c, i) => (i === sel ? { ...c, ...patch } : c)) as [ConvCfg, ConvCfg])
  const cur = cfg[sel]
  const nIn = sel === 0 ? 32 : h1p
  const nOut = sel === 0 ? h1 : h2
  const shape = (c: number, h: number) => (h ? `(${c}, ${h}, ${h})` : 'size 0!')

  return (
    <Figure
      wide
      title="Follow the shapes through a small CNN"
      caption={
        <>
          A 32 × 32 colour photo flows left to right. Each card shows the tensor shape <M>{'(C, H, W)'}</M>; the small heat maps are 4 of each layer's feature maps,
          computed live from hand-made filters (a trained network learns its own). <b>Click a conv card</b> and change its kernel, padding, stride or channels: every
          shape after it updates, and the linear layer, whose input size was typed into the code, breaks with PyTorch's real error until you fix it. Then try{' '}
          <b>global average pooling</b>: the classifier stops caring about height and width (but still cares about channels).
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: 8 }}>
          <Card title="① input" shape="(3, 32, 32)" sub="32×32 RGB photo">
            <RgbCanvas img={img} size={mapPx * 2 + 3} label="A 32 by 32 pixel photo of a red car on a road" />
          </Card>
          <Card title={`② conv ${c1.k}×${c1.k} + ReLU`} shape={shape(c1.c, h1)} sub={`${nf(params1)} params · showing 4 of ${c1.c}`} active={sel === 0} error={!h1} onClick={() => setSel(0)}>
            <Maps t={a1} names={L1_NAMES} size={mapPx} />
          </Card>
          <Card title="③ max-pool 2×2" shape={shape(c1.c, h1p)} sub="0 params" error={!!h1 && !h1p}>
            <Maps t={p1} names={L1_NAMES} size={mapPx} />
          </Card>
          <Card title={`④ conv ${c2.k}×${c2.k} + ReLU`} shape={shape(c2.c, h2)} sub={`${nf(params2)} params · showing 4 of ${c2.c}`} active={sel === 1} error={!!h1p && !h2} onClick={() => setSel(1)}>
            <Maps t={a2} names={L2_NAMES} size={mapPx} />
          </Card>
          <Card title="⑤ max-pool 2×2" shape={shape(c2.c, h2p)} sub="0 params" error={!!h2 && !h2p}>
            <Maps t={p2} names={L2_NAMES} size={mapPx} />
          </Card>
          <Card title={head === 'flatten' ? '⑥ flatten' : '⑥ global avg pool'} shape={broken ? '—' : `(${nf(feats)})`} sub={head === 'flatten' ? `${c2.c} × ${h2p} × ${h2p} numbers in a row` : `one mean per channel`}>
            <div aria-hidden="true" style={{ width: '90%', height: 10, borderRadius: 3, background: 'repeating-linear-gradient(90deg, color-mix(in srgb, var(--viz-1) 45%, var(--surface)) 0 3px, var(--surface-2) 3px 5px)', opacity: head === 'flatten' ? 1 : 0.35 }} />
          </Card>
          <Card title="⑦ linear → 10" shape={`Linear(${nf(expected)}, 10)`} sub={`${nf(paramsFc)} params`} error={mismatch}>
            {mismatch && <span style={{ fontSize: 11.5, color: 'var(--ink)' }}>gets {nf(feats)} numbers</span>}
          </Card>
          <Card title="⑧ softmax" shape="(10)" sub={mismatch || broken ? 'no output' : 'illustrative, after training'}>
            {!mismatch && !broken && (
              <div style={{ width: '100%', fontSize: 11 }}>
                <Bars data={CLASSES.slice(0, 3).map((c, i) => ({ label: c, value: PROBS[i], color: 'var(--viz-2)', strong: i === 0 }))} max={1} format={(v) => v.toFixed(2)} ariaLabel="Class probabilities (illustrative)" />
              </div>
            )}
          </Card>
        </div>

        {mismatch && (
          <div role="alert" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, padding: '8px 10px', borderRadius: 8, background: 'color-mix(in srgb, var(--viz-neg) 12%, var(--surface))', border: '1.5px solid var(--viz-neg)', color: 'var(--ink)', overflowWrap: 'anywhere' }}>
            RuntimeError: mat1 and mat2 shapes cannot be multiplied (1x{feats} and {expected}x10)
          </div>
        )}
        {broken && (
          <div role="alert" style={{ fontSize: 13, padding: '8px 10px', borderRadius: 8, background: 'color-mix(in srgb, var(--viz-neg) 12%, var(--surface))', border: '1.5px solid var(--viz-neg)', color: 'var(--ink)' }}>
            The feature maps shrank to nothing: a kernel or pool no longer fits. Add padding or use stride 1.
          </div>
        )}

        <div style={{ display: 'grid', gap: 8, padding: '10px 12px', borderRadius: 10, background: 'var(--surface-2)' }}>
          <div style={{ fontSize: 'var(--step--1)', fontWeight: 700, color: 'var(--ink-2)' }}>
            Editing {sel === 0 ? '② the first' : '④ the second'} conv layer:{' '}
            <M>{`\\lfloor (${nIn} + 2 \\cdot ${cur.p} - ${cur.k}) / ${cur.s} \\rfloor + 1 = ${nOut}`}</M>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
            <Segmented label="Kernel" value={cur.k} onChange={(k) => edit({ k })} options={[1, 3, 5].map((v) => ({ value: v, label: `${v}×${v}` }))} />
            <Segmented label="Padding" value={cur.p} onChange={(p) => edit({ p })} options={[0, 1, 2].map((v) => ({ value: v, label: String(v) }))} />
            <Segmented label="Stride" value={cur.s} onChange={(s) => edit({ s })} options={[1, 2].map((v) => ({ value: v, label: String(v) }))} />
            <Segmented label="Channels" value={cur.c} onChange={(c) => edit({ c })} options={[8, 16, 32, 64].map((v) => ({ value: v, label: String(v) }))} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end' }}>
            <Segmented label="Head" value={head} onChange={setHead} options={[{ value: 'flatten', label: 'Flatten' }, { value: 'gap', label: 'Global avg pool' }]} />
            <Button primary onClick={() => setBuilt((b) => ({ ...b, [head]: feats }))} disabled={!mismatch}>
              Fix the linear layer
            </Button>
            <Button
              onClick={() => {
                setCfg(DEFAULT)
                setBuilt({ flatten: 2048, gap: 32 })
                setHead('flatten')
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
      <Readout
        items={[
          ['total parameters', broken ? '—' : nf(params1 + params2 + paramsFc)],
          ['share in the linear layer', broken ? '—' : `${Math.round((100 * paramsFc) / (params1 + params2 + paramsFc))}%`],
        ]}
      />
    </Figure>
  )
}
