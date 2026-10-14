import { useState } from 'react'
import { Figure, Controls, Readout, Slider, useNarrow } from '../../../../../kit'
import css from './tl.module.css'

/*
  How much of a pretrained ResNet-18 to train. The stack shows the real stages of ResNet-18
  with their exact parameter counts (counted in PyTorch), plus a new head for 5 classes.
  The slider unfreezes blocks from the top down. The 2×2 grid picks a scenario (data size ×
  similarity to ImageNet) and jumps to the usual recommendation; the verdict compares your
  setting with it.
  Aha: freeze more when data is small and similar; fine-tune more, gently, when data is large
  or different.
*/

const K = 5
const HEAD = 512 * K + K // 2,565

// bottom (input side) to top (output side)
const LAYERS = [
  { name: 'stem (conv1)', what: 'edges, colour blobs', params: 9536 },
  { name: 'layer1', what: 'simple textures, corners', params: 147968 },
  { name: 'layer2', what: 'patterns, repeated textures', params: 525568 },
  { name: 'layer3', what: 'object parts: eyes, wheels, leaves', params: 2099712 },
  { name: 'layer4', what: 'ImageNet-specific object features', params: 8393728 },
  { name: 'new head (fc)', what: `512 features → ${K} classes, random start`, params: HEAD },
]
const TOTAL = LAYERS.reduce((s, l) => s + l.params, 0) // 11,179,077
const MAXP = Math.max(...LAYERS.map((l) => l.params))

type Scen = 'ss' | 'sd' | 'ls' | 'ld'
const SCEN: Record<Scen, { title: string; eg: string; small: boolean; similar: boolean; rec: [number, number]; pick: number; why: string }> = {
  ss: {
    title: 'Small, similar',
    eg: '300 photos of 5 hawker dishes',
    small: true,
    similar: true,
    rec: [1, 1],
    pick: 1,
    why: 'Feature extraction: ImageNet features already describe food photos well, and 300 images are far too few to retune millions of weights. Train only the new head.',
  },
  sd: {
    title: 'Small, different',
    eg: '300 chest X-rays',
    small: true,
    similar: false,
    rec: [2, 3],
    pick: 2,
    why: 'Keep the generic early layers (edges and textures appear in X-rays too) frozen, and gently fine-tune the top block or two plus the head, with strong augmentation. Too few images to retrain everything.',
  },
  ls: {
    title: 'Large, similar',
    eg: '50,000 photos of 100 dog breeds',
    small: false,
    similar: true,
    rec: [3, 6],
    pick: 3,
    why: 'Plenty of data, so fine-tuning the upper blocks (or the whole network) with a small learning rate adds accuracy without overfitting.',
  },
  ld: {
    title: 'Large, different',
    eg: '100,000 satellite images',
    small: false,
    similar: false,
    rec: [6, 6],
    pick: 6,
    why: 'The late features need to change a lot and there is enough data to do it: fine-tune the whole network. Pretrained weights are still a better starting point than random ones.',
  },
}

const fmt = (n: number) => n.toLocaleString('en-GB')

function LockIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={css.icon} aria-hidden="true">
      <rect x={5} y={11} width={14} height={10} rx={2} style={{ fill: open ? 'var(--viz-2)' : 'var(--viz-muted)' }} />
      <path
        d={open ? 'M8,11 V7.5 A4,4 0 0 1 15.6,5.8' : 'M8,11 V7.5 A4,4 0 0 1 16,7.5 V11'}
        style={{ fill: 'none', stroke: open ? 'var(--viz-2)' : 'var(--viz-muted)', strokeWidth: 2.2, strokeLinecap: 'round' }}
      />
    </svg>
  )
}

export default function FreezeDial() {
  const [u, setU] = useState(1) // number of blocks trainable, counted from the top (1 = head only)
  const [scen, setScen] = useState<Scen>('ss')
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(620)
  const s = SCEN[scen]
  const trainable = LAYERS.slice(LAYERS.length - u).reduce((a, l) => a + l.params, 0)
  const frozenNames = LAYERS.slice(0, LAYERS.length - u).map((l) => l.name.split(' ')[0])

  let tone: 'good' | 'warn' | 'bad' = 'good'
  let msg: string
  if (u >= s.rec[0] && u <= s.rec[1]) {
    msg = `Matches the usual recommendation for this scenario. ${s.why}`
  } else if (u > s.rec[1]) {
    // only reachable for the small-data scenarios (the large-data ones allow up to everything)
    tone = 'bad'
    msg = `Risky: ${fmt(trainable)} trainable weights but only a few hundred images. Expect overfitting, and with a large learning rate the pretrained features can be wiped out (catastrophic forgetting).`
  } else {
    tone = s.similar ? 'warn' : 'bad'
    msg = s.similar
      ? `Safe but leaves accuracy on the table: with this much data you can afford to adapt more layers.`
      : `Too frozen: the top layers' ImageNet features (fur, faces, wheels) do not describe these images well, so the model underfits.`
  }

  const order = [...LAYERS].map((l, i) => ({ ...l, i })).reverse() // draw output side on top

  return (
    <Figure
      title="How much of the pretrained network should you train?"
      caption={
        <>
          The stack is a real ResNet-18 pretrained on ImageNet with a new {K}-class head (parameter counts are exact). Slide to unfreeze blocks from the top down,
          then click a scenario in the grid. Notice how the last stage alone holds three quarters of the weights, and how the advice moves from &ldquo;train only the
          head&rdquo; (small, similar data) to &ldquo;fine-tune everything, gently&rdquo; (large, different data).
        </>
      }
    >
      <div
        ref={wrapRef}
        style={{ width: '100%', display: 'grid', gap: '0.9rem', gridTemplateColumns: narrow ? 'minmax(0, 1fr)' : 'minmax(0, 1.15fr) minmax(0, 1fr)', alignItems: 'start' }}
      >
        <div style={{ display: 'grid', gap: 6 }}>
          <div className={css.panelTitle}>ResNet-18 + new head (class scores come out at the top)</div>
          <div className={css.stack} role="list" aria-label="Layer stack with frozen and trainable blocks">
            {order.map((l) => {
              const isTrain = l.i >= LAYERS.length - u
              const isHead = l.i === LAYERS.length - 1
              return (
                <div key={l.name} role="listitem" className={`${css.layer}${isTrain ? ` ${css.trainable}` : ''}${isHead ? ` ${css.head}` : ''}`}>
                  <LockIcon open={isTrain} />
                  <div style={{ minWidth: 0 }}>
                    <div className={css.layerName}>
                      {l.name} <span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--ink-3)' }}>{isTrain ? 'trainable' : 'frozen'}</span>
                    </div>
                    <div className={css.layerWhat}>{l.what}</div>
                    <div className={css.layerBar}>
                      <span style={{ width: `${Math.max(1.5, (l.params / MAXP) * 100)}%`, background: isTrain ? 'var(--viz-2)' : 'var(--viz-muted)' }} />
                    </div>
                  </div>
                  <div className={css.layerCount}>{fmt(l.params)}</div>
                </div>
              )
            })}
          </div>
          <div className={css.small} style={{ textAlign: 'center' }}>
            ↑ the input image enters at the bottom
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <div className={css.panelTitle}>Pick a scenario</div>
          <div className={css.scen}>
            <span />
            <span className={css.scenHead}>similar to ImageNet</span>
            <span className={css.scenHead}>different from ImageNet</span>
            {(['small', 'large'] as const).map((size) => (
              <div key={size} style={{ display: 'contents' }}>
                <span className={css.scenRowHead}>{size} data</span>
                {(size === 'small' ? (['ss', 'sd'] as Scen[]) : (['ls', 'ld'] as Scen[])).map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={scen === k}
                    className={`${css.scenBtn}${scen === k ? ` ${css.active}` : ''}`}
                    onClick={() => {
                      setScen(k)
                      setU(SCEN[k].pick)
                    }}
                  >
                    <b>{SCEN[k].title}</b>
                    {SCEN[k].eg}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className={`${css.verdict} ${css[tone]}`} aria-live="polite">
            {msg}
          </div>
        </div>
      </div>

      <Controls>
        <Slider
          label="Trainable blocks, counted from the top"
          value={u}
          min={1}
          max={6}
          step={1}
          onChange={setU}
          format={(v) => (v === 1 ? '1 (head only)' : v === 6 ? '6 (everything)' : String(v))}
        />
      </Controls>
      <Readout
        items={[
          ['trainable weights', `${fmt(trainable)} of ${fmt(TOTAL)}`],
          ['share trained', `${((100 * trainable) / TOTAL).toFixed(trainable / TOTAL < 0.01 ? 2 : 1)}%`],
          ['frozen', frozenNames.length ? frozenNames.join(', ') : 'nothing'],
          ['learning rates', u === 1 ? 'head 1e-3, backbone frozen' : 'head 1e-3, unfrozen blocks 1e-4'],
        ]}
      />
    </Figure>
  )
}
