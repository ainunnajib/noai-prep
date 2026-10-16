import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, M } from '../../../../../kit'

/*
  What fills a GPU's memory during one training step:
    weights        4 bytes × P                      (FP32 master copy, also under mixed precision)
    gradients      4 bytes × P_trainable
    optimiser      0 (SGD), 4 (SGD + momentum) or 8 (Adam: two running averages) bytes × P_trainable
    activations    batch size × A, where A is the memory one example's saved activations need in
                   FP32; mixed precision stores them in 16 bits (about half)
  Freezing the first half of the layers removes their gradients and optimiser state, and (because
  nothing below them needs gradients) about half of the saved activations.
  Rough model: real frameworks add a little overhead (CUDA context, workspace, fragmentation).
*/

const PARAMS = [10, 25, 50, 110, 340, 770, 1500] // millions
const BATCHES = [1, 2, 4, 8, 16, 32, 64, 128]
const CAP = 16

type Opt = 'sgd' | 'momentum' | 'adam'
const OPT_BYTES: Record<Opt, number> = { sgd: 0, momentum: 4, adam: 8 }

const fmt = (g: number) => (g >= 10 ? g.toFixed(1) : g.toFixed(2))

export default function GPUMemoryBudget() {
  const [pi, setPi] = useState(3)
  const [bi, setBi] = useState(5)
  const [act, setAct] = useState(0.7)
  const [amp, setAmp] = useState(false)
  const [opt, setOpt] = useState<Opt>('adam')
  const [freeze, setFreeze] = useState(false)

  const P = PARAMS[pi] * 1e6
  const B = BATCHES[bi]
  const tf = freeze ? 0.5 : 1
  const GB = 1e9
  const parts = [
    { key: 'weights', label: 'weights', gb: (4 * P) / GB, colour: 'var(--viz-1)' },
    { key: 'grads', label: 'gradients', gb: (4 * P * tf) / GB, colour: 'var(--viz-5)' },
    { key: 'opt', label: 'optimiser state', gb: (OPT_BYTES[opt] * P * tf) / GB, colour: 'var(--viz-4)' },
    { key: 'act', label: 'activations', gb: B * act * (amp ? 0.5 : 1) * (freeze ? 0.5 : 1), colour: 'var(--viz-2)' },
  ]
  const total = parts.reduce((s, p) => s + p.gb, 0)
  const scale = Math.max(20, total * 1.08)
  const fits = total <= CAP
  const pct = (g: number) => `${(g / scale) * 100}%`
  const ticks = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128].filter((t) => t <= scale && (scale <= 26 ? t % 4 === 0 : scale <= 50 ? t % 8 === 0 : t % 16 === 0))

  return (
    <Figure
      wide
      title="What fills a 16 GB GPU during training"
      caption={
        <>
          Start: a mid-sized text model (110 million parameters) reading long texts of 512 tokens (word pieces) in batches of 32, with Adam in FP32. It does not fit.
          Find three different ways to get under the 16 GB line. Notice which slider moves the orange block (activations) and which move the others. The
          activations slider is the memory one example needs in FP32. Figures are rough: real runs add some overhead.
        </>
      }
    >
      <div style={{ width: '100%', display: 'grid', gap: 6 }}>
        <div style={{ position: 'relative', height: 50, borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--rule)', overflow: 'hidden' }} role="img" aria-label={`Memory: ${parts.map((p) => `${p.label} ${fmt(p.gb)} GB`).join(', ')}; total ${fmt(total)} GB of ${CAP} GB`}>
          <div style={{ display: 'flex', height: '100%' }}>
            {parts.map((p) => (
              <div
                key={p.key}
                title={`${p.label}: ${fmt(p.gb)} GB`}
                style={{ width: pct(p.gb), background: `color-mix(in srgb, ${p.colour} 75%, var(--surface))`, borderRight: p.gb > 0 ? '1px solid var(--surface)' : undefined, transition: 'width 0.35s ease' }}
              />
            ))}
          </div>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: pct(CAP), width: 0, borderLeft: '2.5px dashed var(--ink)' }} />
          {!fits && <div style={{ position: 'absolute', top: 0, bottom: 0, left: pct(CAP), right: 0, background: 'repeating-linear-gradient(135deg, transparent 0 6px, color-mix(in srgb, var(--bad) 35%, transparent) 6px 9px)' }} />}
        </div>
        <div style={{ position: 'relative', height: 16, fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }} aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} style={{ position: 'absolute', left: pct(t), transform: 'translateX(-50%)', fontWeight: t === CAP ? 800 : 400, color: t === CAP ? 'var(--ink)' : undefined }}>
              {t}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', fontSize: 12.5 }}>
          {parts.map((p) => (
            <span key={p.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: `color-mix(in srgb, ${p.colour} 75%, var(--surface))` }} />
              {p.label} <b style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>{fmt(p.gb)} GB</b>
            </span>
          ))}
          <span style={{ color: 'var(--ink-3)' }}>(scale in GB; dashed line = 16 GB)</span>
        </div>
        <div
          role="status"
          style={{
            padding: '0.45rem 0.7rem',
            borderRadius: 8,
            fontSize: 13.5,
            fontWeight: 650,
            background: fits ? 'var(--ok-soft)' : 'var(--bad-soft)',
            color: fits ? 'var(--ok)' : 'var(--bad)',
            fontFamily: fits ? undefined : 'var(--font-mono)',
          }}
        >
          {fits ? `Fits: ${fmt(total)} GB of ${CAP} GB used.` : `torch.OutOfMemoryError: CUDA out of memory. (needs ≈ ${fmt(total)} GB, the GPU has ${CAP} GB)`}
        </div>
      </div>
      <Controls>
        <Slider label="parameters" value={pi} min={0} max={PARAMS.length - 1} onChange={setPi} format={(i) => (PARAMS[i] >= 1000 ? `${PARAMS[i] / 1000} billion` : `${PARAMS[i]} million`)} />
        <Slider label="batch size" value={bi} min={0} max={BATCHES.length - 1} onChange={setBi} format={(i) => String(BATCHES[i])} />
        <Slider label="activations / example" value={act} min={0.05} max={1.5} step={0.05} onChange={setAct} format={(v) => `${v.toFixed(2)} GB`} />
      </Controls>
      <Controls>
        <Segmented
          label="Precision"
          value={amp ? 'amp' : 'fp32'}
          onChange={(v) => setAmp(v === 'amp')}
          options={[
            { value: 'fp32', label: 'FP32' },
            { value: 'amp', label: 'mixed (FP16)' },
          ]}
        />
        <Segmented
          label="Optimiser"
          value={opt}
          onChange={setOpt}
          options={[
            { value: 'sgd', label: 'SGD' },
            { value: 'momentum', label: 'SGD+momentum' },
            { value: 'adam', label: 'Adam' },
          ]}
        />
        <Toggle label="freeze the first half of the layers" checked={freeze} onChange={setFreeze} />
      </Controls>
      <Readout
        items={[
          ['bytes per parameter', `${4 + (4 + OPT_BYTES[opt]) * tf}`],
          ['activations', <M key="m">{`${BATCHES[bi]} \\times ${(act * (amp ? 0.5 : 1) * (freeze ? 0.5 : 1)).toFixed(2)}\\ \\text{GB}`}</M>],
          ['total', `${fmt(total)} GB`],
        ]}
      />
    </Figure>
  )
}
