import { useEffect, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Toggle, Button } from '../../../../../kit'

/*
  Fine-tuning a pretrained ResNet-50 (P = 25.6 million parameters) on 224×224 images with SGD +
  momentum on a 16 GB GPU. Rough memory model (GB):
    CUDA context + workspace + allocator slack       1.0
    weights 4P + gradients 4P + momentum 4P          0.31   (frozen half: gradients and momentum halve)
    FP16 copy of the weights under mixed precision   2P = 0.05
    activations  micro-batch × 0.12 GB per image (FP32, saved tensors plus backward temporaries;
                 we measured ≈ 0.09 GB of saved tensors per image for a ResNet-50 in PyTorch)
                 × 0.5 with mixed precision, × 0.3 with checkpointing, × 0.5 if the first half is frozen
  Throughput (images per second, relative to the same run on a GPU big enough to need no fix):
    mixed precision × 2 on GPUs with Tensor Cores (× 1 on older GPUs)
    micro-batches of B/4 (accumulation or a smaller batch) × 0.95 (smaller kernels use the GPU less well)
    checkpointing × 0.75 (one extra forward pass: 1 + 2 = 3 units of work become 4)
    freezing the first half × 1.4 (no backward pass through it)
  These are round, illustrative numbers; real ones depend on the GPU and the model.
*/

type FixId = 'amp' | 'acc' | 'ckpt' | 'small' | 'freeze'

const P = 25.6e6
const GB = 1e9
const CTX = 1.0
const ACT = 0.12
const CAP = 16

const FIXES: { id: FixId; name: string; does: string; cost: string }[] = [
  { id: 'amp', name: 'Mixed precision', does: 'activations ×½', cost: '×2 speed with Tensor Cores' },
  { id: 'acc', name: 'Accumulate 4 micro-batches', does: 'only B/4 images in memory', cost: 'BatchNorm sees B/4' },
  { id: 'ckpt', name: 'Activation checkpointing', does: 'activations × 0.3', cost: '+1 forward pass: ×0.75 speed' },
  { id: 'small', name: 'Batch B/4, no accumulation', does: 'only B/4 images in memory', cost: 'changes the optimisation' },
  { id: 'freeze', name: 'Freeze the first half', does: 'activations ×½, fewer grads', cost: 'early layers cannot adapt' },
]

interface Entry {
  key: string
  label: string
  mem: number
  thr: number
  recipe: boolean
  note: string
}

const fmt = (g: number) => (g >= 10 ? g.toFixed(1) : g.toFixed(2))

export default function OOMFixTradeoffs() {
  const [B, setB] = useState<128 | 256>(128)
  const [tc, setTc] = useState(true)
  const [on, setOn] = useState<Record<FixId, boolean>>({ amp: false, acc: false, ckpt: false, small: false, freeze: false })
  const [board, setBoard] = useState<Entry[]>([])

  const micro = on.acc || on.small ? B / 4 : B
  const actPer = ACT * (on.amp ? 0.5 : 1) * (on.ckpt ? 0.3 : 1) * (on.freeze ? 0.5 : 1)
  const parts = [
    { key: 'ctx', label: 'CUDA context and workspace', gb: CTX, colour: 'var(--viz-muted)' },
    { key: 'w', label: on.amp ? 'weights, grads, momentum, FP16 copy' : 'weights, grads, momentum', gb: (4 * P + 8 * P * (on.freeze ? 0.5 : 1) + (on.amp ? 2 * P : 0)) / GB, colour: 'var(--viz-1)' },
    { key: 'act', label: 'activations', gb: micro * actPer, colour: 'var(--viz-2)' },
  ]
  const total = parts.reduce((s, p) => s + p.gb, 0)
  const fits = total <= CAP
  const thr = (on.amp && tc ? 2 : 1) * (on.acc || on.small ? 0.95 : 1) * (on.ckpt ? 0.75 : 1) * (on.freeze ? 1.4 : 1)
  const recipe = !on.small && !on.freeze
  const active = FIXES.filter((f) => on[f.id])
  const label = active.length ? active.map((f) => f.name.replace(' micro-batches', '').replace(', no accumulation', '')).join(' + ') : 'no fix'
  const key = `${B}|${tc ? 'tc' : 'old'}|${active.map((f) => f.id).join(',')}`

  useEffect(() => {
    if (!fits || !active.length) return
    setBoard((b) => {
      if (b.some((e) => e.key === key)) return b
      const notes: string[] = []
      if (on.small) notes.push(`gradient from ${B / 4} images: retune LR`)
      if (on.freeze) notes.push('may lose accuracy')
      if (on.acc) notes.push(`BatchNorm on ${B / 4}`)
      const e: Entry = { key, label, mem: total, thr, recipe, note: notes.join('; ') }
      return [...b, e].sort((x, y) => Number(y.recipe) - Number(x.recipe) || y.thr - x.thr)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, fits])

  const toggle = (id: FixId) =>
    setOn((o) => {
      const n = { ...o, [id]: !o[id] }
      if (id === 'acc' && n.acc) n.small = false
      if (id === 'small' && n.small) n.acc = false
      return n
    })

  const scenario = `${B}|${tc ? 'tc' : 'old'}|`
  const shown = board.filter((e) => e.key.startsWith(scenario)).slice(0, 6)
  const scale = Math.max(20, total * 1.06)
  const pct = (g: number) => `${(g / scale) * 100}%`
  const ticks = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36].filter((t) => t <= scale && (scale <= 22 || t % 8 === 0 || t === CAP))

  return (
    <Figure
      wide
      title="Out of memory: which fix costs least?"
      caption={
        <>
          Fine-tuning a pretrained ResNet-50 at batch {B} needs {fmt(B * ACT + CTX + (12 * P) / GB)} GB on a 16 GB GPU. Click fix cards (in any combination) until the bar is under the dashed line,
          and watch the speed meter and the side effects. Every combination that fits joins the leaderboard: the best ones keep the training recipe (same effective batch, nothing frozen) and
          lose the least speed. Then try batch 256, and a GPU without Tensor Cores. Numbers are rough, for illustration.
        </>
      }
    >
      <Controls>
        <Segmented
          label="Target batch size B"
          value={B}
          onChange={(v) => setB(v)}
          options={[
            { value: 128, label: '128' },
            { value: 256, label: '256' },
          ]}
        />
        <Toggle label="GPU has Tensor Cores" checked={tc} onChange={setTc} />
      </Controls>

      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 6 }}>
        {FIXES.map((f) => {
          const a = on[f.id]
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={a}
              onClick={() => toggle(f.id)}
              style={{
                font: 'inherit',
                textAlign: 'left',
                padding: '0.45rem 0.6rem',
                borderRadius: 10,
                cursor: 'pointer',
                border: `1.5px solid ${a ? 'var(--accent)' : 'var(--rule)'}`,
                background: a ? 'var(--accent-soft)' : 'var(--surface-2)',
                color: 'var(--ink)',
                lineHeight: 1.3,
              }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 800 }}>
                {a ? '✓ ' : '+ '}
                {f.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ok)', fontWeight: 650 }}>{f.does}</div>
              <div style={{ fontSize: 12, color: 'var(--warn)', fontWeight: 650 }}>{f.id === 'amp' && !tc ? 'little speed-up on this GPU' : f.cost}</div>
            </button>
          )
        })}
      </div>

      <div style={{ width: '100%', display: 'grid', gap: 5 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)' }}>GPU memory (GB)</div>
        <div
          style={{ position: 'relative', height: 40, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--rule)', overflow: 'hidden' }}
          role="img"
          aria-label={`Memory ${fmt(total)} GB of ${CAP} GB`}
        >
          <div style={{ display: 'flex', height: '100%' }}>
            {parts.map((p) => (
              <div key={p.key} title={`${p.label}: ${fmt(p.gb)} GB`} style={{ width: pct(p.gb), background: `color-mix(in srgb, ${p.colour} 72%, var(--surface))`, borderRight: '1px solid var(--surface)', transition: 'width 0.35s ease' }} />
            ))}
          </div>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: pct(CAP), borderLeft: '2.5px dashed var(--ink)' }} />
          {!fits && <div style={{ position: 'absolute', top: 0, bottom: 0, left: pct(CAP), right: 0, background: 'repeating-linear-gradient(135deg, transparent 0 6px, color-mix(in srgb, var(--bad) 35%, transparent) 6px 9px)' }} />}
        </div>
        <div style={{ position: 'relative', height: 15, fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }} aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} style={{ position: 'absolute', left: pct(t), transform: 'translateX(-50%)', fontWeight: t === CAP ? 800 : 400, color: t === CAP ? 'var(--ink)' : undefined }}>
              {t}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 14px', fontSize: 12.5, color: 'var(--ink-2)' }}>
          {parts.map((p) => (
            <span key={p.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: `color-mix(in srgb, ${p.colour} 72%, var(--surface))` }} />
              {p.label} <b style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>{fmt(p.gb)}</b>
            </span>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', display: 'grid', gap: 4 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)' }}>Speed (images per second, relative to a GPU big enough to need no fix)</div>
        <div style={{ position: 'relative', height: 22, borderRadius: 6, background: 'var(--surface-2)', border: '1px solid var(--rule)', overflow: 'hidden' }} role="img" aria-label={`Speed ${thr.toFixed(2)} times`}>
          <div style={{ width: `${(thr / 3) * 100}%`, height: '100%', background: `color-mix(in srgb, ${thr >= 1 ? 'var(--viz-3)' : 'var(--viz-4)'} 65%, var(--surface))`, transition: 'width 0.35s ease' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${100 / 3}%`, borderLeft: '1.5px solid var(--ink-2)' }} />
          <span style={{ position: 'absolute', right: 8, top: 2, fontSize: 12.5, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>×{thr.toFixed(2)}</span>
        </div>
      </div>

      <div
        role="status"
        style={{
          width: '100%',
          padding: '0.45rem 0.7rem',
          borderRadius: 8,
          fontSize: 13.5,
          fontWeight: 650,
          background: fits ? 'var(--ok-soft)' : 'var(--bad-soft)',
          color: fits ? 'var(--ok)' : 'var(--bad)',
          fontFamily: fits ? undefined : 'var(--font-mono)',
        }}
      >
        {fits ? `Fits: ${fmt(total)} GB of ${CAP} GB.` : `torch.OutOfMemoryError: CUDA out of memory (needs ≈ ${fmt(total)} GB, the GPU has ${CAP} GB)`}
      </div>

      <Readout
        items={[
          ['gradient averaged over', `${on.small ? B / 4 : B} images`],
          ['BatchNorm statistics from', `${micro} images`],
          ['frozen layers', on.freeze ? 'first half' : 'none'],
          ['recipe kept?', recipe ? 'yes' : 'no'],
        ]}
      />

      <div style={{ width: '100%', display: 'grid', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }}>
            Leaderboard: fixes that fit (batch {B}, {tc ? 'Tensor Cores' : 'no Tensor Cores'})
          </span>
          <Button onClick={() => setBoard((b) => b.filter((e) => !e.key.startsWith(scenario)))} disabled={!shown.length}>
            clear
          </Button>
        </div>
        {shown.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Nothing yet: apply fixes until the bar fits under 16 GB.</div>
        ) : (
          <ol style={{ margin: 0, paddingLeft: '1.4rem', fontSize: 13, lineHeight: 1.45 }}>
            {shown.map((e) => (
              <li key={e.key} style={{ color: 'var(--ink)' }}>
                <b>{e.label}</b>{' '}
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-2)' }}>
                  {fmt(e.mem)} GB, ×{e.thr.toFixed(2)}
                </span>{' '}
                <span style={{ fontWeight: 700, color: e.recipe ? 'var(--ok)' : 'var(--warn)' }}>{e.recipe ? 'recipe kept' : 'recipe changed'}</span>
                {e.note && <span style={{ color: 'var(--ink-3)' }}> ({e.note})</span>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </Figure>
  )
}
