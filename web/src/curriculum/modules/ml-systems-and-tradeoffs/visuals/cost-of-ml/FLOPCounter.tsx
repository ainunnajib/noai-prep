import { useState, type ReactNode } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Button, MBlock } from '../../../../../kit'
import { approx, commas, pow10, texNum } from './format'

/*
  Parameters versus multiply-adds for one layer, one forward pass:
    dense      params d_in·d_out + d_out           MACs B·d_in·d_out
    conv       params k²·C_in·C_out + C_out        MACs H_out·W_out·k²·C_in·C_out   (one image)
    attention  params 4d² + 4d (W_Q, W_K, W_V, W_O) MACs 4·T·d² (projections) + T²·d (QKᵀ) + T²·d (weights × V)   (one sequence)
  Bars use a log scale because the numbers span 1 to 10¹³.
*/

type Kind = 'dense' | 'conv' | 'attn'

interface Cost {
  kind: Kind
  name: string
  params: number
  macs: number
  parts?: { label: string; macs: number; colour: string }[]
}

const POW2 = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => 2 ** (a + i))
const BATCH = POW2(0, 8)
const WIDTH = POW2(4, 12)
const SIZES = [7, 14, 28, 56, 112, 224]
const KERNELS = [1, 3, 5, 7]
const CHANNELS = [3, 8, 16, 32, 64, 128, 256, 512]
const TOKENS = POW2(4, 15)
const DIMS = [64, 128, 256, 512, 768, 1024]

const LOG_MAX = 13

function denseCost(B: number, din: number, dout: number): Cost {
  return { kind: 'dense', name: `Dense ${din}→${dout}, batch ${B}`, params: din * dout + dout, macs: B * din * dout }
}
function convCost(H: number, k: number, cin: number, cout: number): Cost {
  return { kind: 'conv', name: `Conv ${k}×${k}, ${cin}→${cout} channels, ${H}×${H} output`, params: k * k * cin * cout + cout, macs: H * H * k * k * cin * cout }
}
function attnCost(T: number, d: number): Cost {
  const proj = 4 * T * d * d
  const qk = T * T * d
  const av = T * T * d
  return {
    kind: 'attn',
    name: `Self-attention, T = ${T}, d = ${d}`,
    params: 4 * d * d + 4 * d,
    macs: proj + qk + av,
    parts: [
      { label: 'projections 4Td²', macs: proj, colour: 'var(--viz-1)' },
      { label: 'scores QKᵀ: T²d', macs: qk, colour: 'var(--viz-2)' },
      { label: 'weights × V: T²d', macs: av, colour: 'var(--viz-4)' },
    ],
  }
}

const PRESET_PIN = denseCost(1, 1024, 1024)

/** "×110" for more, "÷28" for less */
function ratio(a: number, b: number): string {
  const r = a / b
  const f = (x: number) => (x >= 100 ? Math.round(x).toLocaleString('en-GB') : x >= 10 ? x.toFixed(0) : x.toFixed(1))
  if (Math.abs(r - 1) < 0.005) return 'same'
  return r > 1 ? `×${f(r)}` : `÷${f(1 / r)}`
}

function LogBar({ value, colour, faded }: { value: number; colour: string; faded?: boolean }) {
  const pct = (Math.log10(Math.max(1, value)) / LOG_MAX) * 100
  return (
    <div style={{ position: 'relative', height: faded ? 10 : 16, borderRadius: 5, background: 'var(--surface-2)', border: '1px solid var(--rule)', overflow: 'hidden' }}>
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: faded ? `color-mix(in srgb, ${colour} 30%, var(--surface))` : `color-mix(in srgb, ${colour} 75%, var(--surface))`,
          transition: 'width 0.3s ease',
        }}
      />
      {[3, 6, 9, 12].map((e) => (
        <div key={e} style={{ position: 'absolute', top: 0, bottom: 0, left: `${(e / LOG_MAX) * 100}%`, borderLeft: '1px dashed color-mix(in srgb, var(--ink-3) 45%, transparent)' }} />
      ))}
    </div>
  )
}

function Scale() {
  return (
    <div style={{ position: 'relative', height: 16, fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }} aria-hidden="true">
      {[0, 3, 6, 9, 12].map((e) => (
        <span key={e} style={{ position: 'absolute', left: `${(e / LOG_MAX) * 100}%`, transform: e === 0 ? undefined : 'translateX(-50%)' }}>
          {pow10(e)}
        </span>
      ))}
    </div>
  )
}

function Row({ label, value, colour, faded, note }: { label: ReactNode; value: number; colour: string; faded?: boolean; note?: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', fontSize: 13, color: faded ? 'var(--ink-3)' : 'var(--ink-2)' }}>
        <span style={{ fontWeight: 700 }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', color: faded ? 'var(--ink-3)' : 'var(--ink)', fontWeight: faded ? 500 : 700 }}>
          {commas(value)} <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, color: 'var(--ink-3)' }}>(≈ {approx(value)})</span>
          {note}
        </span>
      </div>
      <LogBar value={value} colour={colour} faded={faded} />
    </div>
  )
}

export default function FLOPCounter() {
  const [kind, setKind] = useState<Kind>('conv')
  // dense
  const [bi, setBi] = useState(5) // 32
  const [dii, setDii] = useState(6) // 1024
  const [doi, setDoi] = useState(6) // 1024
  // conv
  const [hi, setHi] = useState(3) // 56
  const [ki, setKi] = useState(1) // 3
  const [cii, setCii] = useState(4) // 64
  const [coi, setCoi] = useState(4) // 64
  // attention
  const [ti, setTi] = useState(6) // 1024
  const [di, setDi] = useState(4) // 768
  const [pinned, setPinned] = useState<Cost | null>(PRESET_PIN)

  const B = BATCH[bi]
  const din = WIDTH[dii]
  const dout = WIDTH[doi]
  const H = SIZES[hi]
  const k = KERNELS[ki]
  const cin = CHANNELS[cii]
  const cout = CHANNELS[coi]
  const T = TOKENS[ti]
  const d = DIMS[di]

  const cost = kind === 'dense' ? denseCost(B, din, dout) : kind === 'conv' ? convCost(H, k, cin, cout) : attnCost(T, d)
  const reuse = cost.macs / cost.params

  let lines: string[]
  if (kind === 'dense') {
    lines = [
      `\\text{multiply-adds} &= B \\cdot d_{\\text{in}} \\cdot d_{\\text{out}}`,
      `&= ${B} \\cdot ${din} \\cdot ${dout}`,
      `&= ${texNum(cost.macs)}`,
      `\\text{parameters} &= d_{\\text{in}} d_{\\text{out}} + d_{\\text{out}} = ${texNum(cost.params)}`,
    ]
  } else if (kind === 'conv') {
    lines = [
      `\\text{multiply-adds} &= H_{\\text{out}} W_{\\text{out}} \\cdot k^2 \\cdot C_{\\text{in}} \\cdot C_{\\text{out}}`,
      `&= ${H} \\cdot ${H} \\cdot ${k}^2 \\cdot ${cin} \\cdot ${cout}`,
      `&= ${texNum(cost.macs)}`,
      `\\text{parameters} &= k^2 C_{\\text{in}} C_{\\text{out}} + C_{\\text{out}} = ${texNum(cost.params)}`,
    ]
  } else {
    lines = [
      `\\text{multiply-adds} &= 4Td^2 + T^2 d + T^2 d`,
      `&= 4 \\cdot ${T} \\cdot ${d}^2 + 2 \\cdot ${T}^2 \\cdot ${d}`,
      `&= ${texNum(cost.macs)}`,
      `\\text{parameters} &= 4d^2 + 4d = ${texNum(cost.params)} \\quad (\\text{no } T)`,
    ]
  }
  const formula = `\\begin{aligned}${lines.join(' \\\\ ')}\\end{aligned}`

  const unit = kind === 'dense' ? (B === 1 ? 'for one example' : `for a batch of ${B}`) : kind === 'conv' ? 'for one image' : 'for one sequence'

  return (
    <Figure
      wide
      title="Parameters versus compute, layer by layer"
      caption={
        <>
          Pick a layer type and drag its sizes. The top bar counts <b>parameters</b> (what must be stored), the bottom bar counts <b>multiply-adds</b> (the work in one forward pass); both use a
          log scale, so each dashed line is 1,000 times more than the one before. A dense layer with batch 1 does about one multiply-add per weight, while a conv layer re-uses each weight at every
          output position and attention's work grows with T² although its weights do not change. Pin a layer to compare it with another.
        </>
      }
    >
      <Segmented
        label="Layer"
        value={kind}
        onChange={setKind}
        options={[
          { value: 'dense', label: 'Dense' },
          { value: 'conv', label: 'Conv' },
          { value: 'attn', label: 'Self-attention' },
        ]}
      />

      {kind === 'dense' && (
        <Controls>
          <Slider label="batch size B" value={bi} min={0} max={BATCH.length - 1} onChange={setBi} format={(i) => BATCH[i]} />
          <Slider label={<>inputs d<sub>in</sub></>} value={dii} min={0} max={WIDTH.length - 1} onChange={setDii} format={(i) => WIDTH[i]} />
          <Slider label={<>outputs d<sub>out</sub></>} value={doi} min={0} max={WIDTH.length - 1} onChange={setDoi} format={(i) => WIDTH[i]} />
        </Controls>
      )}
      {kind === 'conv' && (
        <Controls>
          <Slider label={<>output size H<sub>out</sub> = W<sub>out</sub></>} value={hi} min={0} max={SIZES.length - 1} onChange={setHi} format={(i) => SIZES[i]} />
          <Slider label="kernel k" value={ki} min={0} max={KERNELS.length - 1} onChange={setKi} format={(i) => `${KERNELS[i]}×${KERNELS[i]}`} />
          <Slider label={<>channels in C<sub>in</sub></>} value={cii} min={0} max={CHANNELS.length - 1} onChange={setCii} format={(i) => CHANNELS[i]} />
          <Slider label={<>channels out C<sub>out</sub></>} value={coi} min={0} max={CHANNELS.length - 1} onChange={setCoi} format={(i) => CHANNELS[i]} />
        </Controls>
      )}
      {kind === 'attn' && (
        <Controls>
          <Slider label="sequence length T (tokens)" value={ti} min={0} max={TOKENS.length - 1} onChange={setTi} format={(i) => TOKENS[i]} />
          <Slider label="model width d" value={di} min={0} max={DIMS.length - 1} onChange={setDi} format={(i) => DIMS[i]} />
        </Controls>
      )}

      <div style={{ width: '100%', padding: '0.2rem 0.5rem', borderRadius: 8, background: 'var(--surface-2)', fontSize: 14 }}>
        <MBlock>{formula}</MBlock>
      </div>

      <div style={{ width: '100%', display: 'grid', gap: 10 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }}>
          {cost.name} <span style={{ fontWeight: 500, color: 'var(--ink-3)' }}>({unit})</span>
        </div>
        <Row label="parameters" value={cost.params} colour="var(--viz-5)" />
        {pinned && <Row label="pinned" value={pinned.params} colour="var(--viz-5)" faded />}
        <Row label="multiply-adds" value={cost.macs} colour="var(--viz-3)" />
        {pinned && <Row label="pinned" value={pinned.macs} colour="var(--viz-3)" faded />}
        <Scale />
        {cost.parts && (
          <div style={{ display: 'grid', gap: 4 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)' }}>Where attention's work goes (linear scale, adds to 100%)</div>
            <div style={{ display: 'flex', height: 18, borderRadius: 5, overflow: 'hidden', border: '1px solid var(--rule)' }} role="img" aria-label="Share of attention work by part">
              {cost.parts.map((p) => (
                <div key={p.label} title={p.label} style={{ width: `${(p.macs / cost.macs) * 100}%`, background: `color-mix(in srgb, ${p.colour} 70%, var(--surface))`, transition: 'width 0.3s ease' }} />
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 14px', fontSize: 12.5, color: 'var(--ink-2)' }}>
              {cost.parts.map((p) => (
                <span key={p.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 11, height: 11, borderRadius: 3, background: `color-mix(in srgb, ${p.colour} 70%, var(--surface))` }} />
                  {p.label} <b style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>{Math.round((p.macs / cost.macs) * 100)}%</b>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Controls>
        <Readout
          items={[
            ['multiply-adds per parameter', reuse >= 10 ? Math.round(reuse).toLocaleString('en-GB') : reuse.toFixed(2)],
            ...(pinned ? ([['compute vs pinned', ratio(cost.macs, pinned.macs)], ['parameters vs pinned', ratio(cost.params, pinned.params)]] as [string, string][]) : []),
          ]}
        />
        <Button onClick={() => setPinned(cost)}>Pin this layer</Button>
        {pinned && <Button onClick={() => setPinned(null)}>Unpin</Button>}
      </Controls>
      {pinned && (
        <div style={{ width: '100%', fontSize: 12.5, color: 'var(--ink-3)' }}>
          Pinned (faded bars): <b style={{ color: 'var(--ink-2)' }}>{pinned.name}</b>
        </div>
      )}
    </Figure>
  )
}
