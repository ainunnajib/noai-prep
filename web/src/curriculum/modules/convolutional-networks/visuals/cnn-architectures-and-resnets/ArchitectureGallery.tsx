import { useState, type ReactElement } from 'react'
import { Figure, Segmented, useContainerWidth } from '../../../../../kit'

/*
  Four landmark CNNs, one bar per layer: conv bars are as tall as their kernel is wide (11×11
  down to 3×3), pools are small orange squares, dense layers are green. ResNet's skip connections
  are the arcs over each pair of 3×3 convs. Below, one stacked bar per network shows its parameter
  count split into conv and dense, all on one linear scale. Counts were computed by building each
  network in PyTorch (LeNet-5 in its modern form; AlexNet as published, 1,000 ImageNet classes).
*/

type L = { t: 'conv'; k: number } | { t: 'pool' } | { t: 'gap' } | { t: 'fc' }
const conv = (k: number, n = 1): L[] => Array.from({ length: n }, () => ({ t: 'conv', k }))
const pool: L = { t: 'pool' }
const fc = (n: number): L[] => Array.from({ length: n }, () => ({ t: 'fc' }))

interface Arch {
  id: string
  name: string
  year: number
  layers: L[]
  depth: string
  params: string
  who: string
  idea: string
  result: string
  skips?: boolean
  /** parameters in conv layers (incl. BatchNorm) and in dense layers */
  convP: number
  denseP: number
}

const ARCHS: Arch[] = [
  {
    id: 'lenet',
    name: 'LeNet-5',
    year: 1998,
    layers: [...conv(5), pool, ...conv(5), pool, ...fc(3)],
    depth: '5 weight layers (2 conv + 3 dense)',
    params: 'about 60 thousand',
    who: 'Yann LeCun and colleagues',
    idea: 'The template every CNN still follows: conv → pool → conv → pool → dense, with learned, shared filters. Used to read handwritten digits, for example on bank cheques.',
    result: 'Small greyscale digits (32 × 32).',
    convP: 2572,
    denseP: 59134,
  },
  {
    id: 'alexnet',
    name: 'AlexNet',
    year: 2012,
    layers: [...conv(11), pool, ...conv(5), pool, ...conv(3, 3), pool, ...fc(3)],
    depth: '8 weight layers (5 conv + 3 dense)',
    params: 'about 60 million',
    who: 'Krizhevsky, Sutskever and Hinton',
    idea: 'A much bigger CNN trained on GPUs, with ReLU instead of tanh, dropout and data augmentation. It started the deep-learning boom.',
    result: 'Won ImageNet 2012 with 15.3% top-5 error; the runner-up had 26.2%.',
    convP: 2334080,
    denseP: 58631144,
  },
  {
    id: 'vgg',
    name: 'VGG-16',
    year: 2014,
    layers: [...conv(3, 2), pool, ...conv(3, 2), pool, ...conv(3, 3), pool, ...conv(3, 3), pool, ...conv(3, 3), pool, ...fc(3)],
    depth: '16 weight layers (13 conv + 3 dense)',
    params: '138 million (124 million of them in the 3 dense layers)',
    who: 'Simonyan and Zisserman, Oxford',
    idea: 'Only 3×3 convolutions and 2×2 max-pools, stacked deep: a big receptive field from depth, not from big kernels.',
    result: 'Runner-up to GoogLeNet in ImageNet 2014 classification; still a popular feature extractor.',
    convP: 14714688,
    denseP: 123642856,
  },
  {
    id: 'resnet',
    name: 'ResNet-34',
    year: 2015,
    layers: [...conv(7), pool, ...conv(3, 32), { t: 'gap' }, ...fc(1)],
    depth: '34 weight layers; the family goes up to 152',
    params: '21.8 million (ResNet-50: 25.6 million)',
    who: 'He, Zhang, Ren and Sun, Microsoft Research',
    idea: 'Residual blocks, y = F(x) + x: every pair of 3×3 convs gets a skip connection, so very deep networks still train. Also BatchNorm, and global average pooling instead of big dense layers.',
    result: 'Won ImageNet 2015 (3.57% top-5 error with an ensemble of ResNets).',
    skips: true,
    convP: 21284672,
    denseP: 513000,
  },
]

const fmtP = (v: number) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)} M` : `${(v / 1e3).toFixed(v < 1e5 ? 1 : 0)} k`)
const MAX_P = Math.max(...ARCHS.map((a) => a.convP + a.denseP))

function Swatch({ color, label, round }: { color: string; label: string; round?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span aria-hidden="true" style={{ width: 11, height: 11, borderRadius: round ? 6 : 2, background: color, display: 'inline-block' }} />
      {label}
    </span>
  )
}

export default function ArchitectureGallery() {
  const [sel, setSel] = useState('vgg')
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(600)
  const W = Math.min(width, 680)
  const nameW = W < 420 ? 0 : 92
  const maxLen = Math.max(...ARCHS.map((a) => a.layers.length))
  const bw = (W - nameW - 8) / maxLen
  const rowH = 58
  const convH = (k: number) => 8 + (k / 11) * (rowH - 14)
  const svgH = ARCHS.length * (rowH + (W < 420 ? 18 : 0)) + 8
  const a = ARCHS.find((x) => x.id === sel)!

  const rows: ReactElement[] = []
  ARCHS.forEach((arch, r) => {
    const y0 = r * (rowH + (W < 420 ? 18 : 0)) + (W < 420 ? 18 : 0)
    const base = y0 + rowH - 6
    const isSel = arch.id === sel
    const op = isSel ? 1 : 0.45
    if (W < 420)
      rows.push(
        <text key={`n${r}`} x={0} y={y0 - 4} style={{ fontSize: 12.5, fontWeight: 800, fill: isSel ? 'var(--ink)' : 'var(--ink-3)' }}>
          {arch.name} ({arch.year})
        </text>,
      )
    else
      rows.push(
        <g key={`n${r}`}>
          <text x={0} y={base - 20} style={{ fontSize: 13, fontWeight: 800, fill: isSel ? 'var(--ink)' : 'var(--ink-3)' }}>
            {arch.name}
          </text>
          <text x={0} y={base - 5} style={{ fontSize: 12, fill: 'var(--ink-3)' }}>
            {arch.year}
          </text>
        </g>,
      )
    rows.push(<rect key={`hit${r}`} x={0} y={y0 - (W < 420 ? 16 : 0)} width={W} height={rowH + (W < 420 ? 16 : 0)} style={{ fill: isSel ? 'color-mix(in srgb, var(--accent) 7%, transparent)' : 'transparent', cursor: 'pointer' }} onClick={() => setSel(arch.id)} />)
    arch.layers.forEach((l, i) => {
      const x = nameW + i * bw
      const w = Math.max(2, bw - 2)
      let h = 0
      let fill = ''
      if (l.t === 'conv') {
        h = convH(l.k)
        fill = 'var(--viz-1)'
      } else if (l.t === 'pool' || l.t === 'gap') {
        h = Math.min(w, 10)
        fill = 'var(--viz-2)'
      } else {
        h = rowH - 8
        fill = 'var(--viz-3)'
      }
      rows.push(<rect key={`b${r}-${i}`} x={x} y={base - h} width={w} height={h} rx={1.5} style={{ fill, opacity: op, pointerEvents: 'none' }} />)
    })
    if (arch.skips) {
      // arcs over each pair of 3×3 convs (layers 2..33)
      for (let b = 0; b < 16; b++) {
        const i0 = 2 + 2 * b
        const x1 = nameW + i0 * bw - 0.5
        const x2 = nameW + (i0 + 2) * bw - 2.5
        const yb = base - convH(3) - 3
        rows.push(<path key={`s${b}`} d={`M${x1},${yb}Q${(x1 + x2) / 2},${yb - 16} ${x2},${yb}`} style={{ fill: 'none', stroke: 'var(--viz-4)', strokeWidth: 1.6, opacity: op, pointerEvents: 'none' }} />)
      }
    }
  })

  return (
    <Figure
      title="Four landmark CNNs: kernel sizes and where the parameters live"
      caption={
        <>
          <b>Try:</b> pick each network. <b>Notice:</b> kernels shrink (11×11 to 3×3), depth grows, and the huge dense layers that hold most of AlexNet's and
          VGG's parameters almost vanish in ResNet.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${svgH}`} width={W} height={svgH} style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }} role="img" aria-label="Layer diagrams of LeNet-5, AlexNet, VGG-16 and ResNet-34">
          {rows}
        </svg>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 14px', fontSize: 12, color: 'var(--ink-2)' }}>
        <Swatch color="var(--viz-1)" label="conv (taller = bigger kernel)" />
        <Swatch color="var(--viz-2)" label="pool" />
        <Swatch color="var(--viz-3)" label="dense" />
        <Swatch color="var(--viz-4)" label="skip connection" round />
      </div>
      <div style={{ width: '100%', display: 'grid', gap: 7 }} role="img" aria-label={ARCHS.map((x) => `${x.name}: ${fmtP(x.convP + x.denseP)} parameters, ${fmtP(x.denseP)} of them dense`).join('; ')}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--ink-2)' }}>Parameters, all on one scale (k = thousand, M = million)</div>
        {ARCHS.map((x) => {
          const tot = x.convP + x.denseP
          const isSel = x.id === sel
          return (
            <div key={x.id} style={{ display: 'grid', gap: 2, opacity: isSel ? 1 : 0.6 }}>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', display: 'flex', flexWrap: 'wrap', gap: '0 8px' }}>
                <b style={{ color: 'var(--ink)' }}>{x.name}</b>
                <span>
                  {fmtP(tot)} total: <span style={{ color: 'var(--viz-1)', fontWeight: 700 }}>conv {fmtP(x.convP)}</span>,{' '}
                  <span style={{ color: 'var(--viz-3)', fontWeight: 700 }}>dense {fmtP(x.denseP)}</span>
                </span>
              </div>
              <div style={{ height: 9, borderRadius: 3, background: 'var(--surface-2)', display: 'flex', overflow: 'hidden' }}>
                <div style={{ width: `${(100 * x.convP) / MAX_P}%`, minWidth: 2, background: 'var(--viz-1)' }} />
                <div style={{ width: `${(100 * x.denseP) / MAX_P}%`, minWidth: 2, background: 'var(--viz-3)' }} />
              </div>
            </div>
          )
        })}
      </div>
      <Segmented label="Network" value={sel} onChange={setSel} options={ARCHS.map((x) => ({ value: x.id, label: x.name }))} />
      <div style={{ width: '100%', display: 'grid', gap: 6, padding: '10px 12px', borderRadius: 10, background: 'var(--surface-2)', fontSize: 'var(--step--1)', lineHeight: 1.5 }}>
        <div style={{ fontWeight: 800, color: 'var(--ink)' }}>
          {a.name} ({a.year}) · {a.who}
        </div>
        <div>
          <b>Key idea.</b> {a.idea}
        </div>
        <div style={{ color: 'var(--ink-2)' }}>
          <b>Depth:</b> {a.depth}. <b>Parameters:</b> {a.params}. {a.result}
        </div>
      </div>
    </Figure>
  )
}
