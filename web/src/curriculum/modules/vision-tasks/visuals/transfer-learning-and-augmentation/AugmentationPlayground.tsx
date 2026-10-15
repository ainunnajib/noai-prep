import { useId, useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Slider, Toggle, Button, CodeBlock, useNarrow, mulberry32 } from '../../../../../kit'
import { CatScene, tint } from './drawings'
import css from './tl.module.css'

/*
  The augmentation playground. One training image (a drawn cat) and nine random augmented
  copies, as a data loader would produce them in nine different epochs. Every augmentation can
  be switched on and tuned; the matching torchvision pipeline is written out underneath.
  Order follows a typical torchvision pipeline: crop → flip → rotate → colour jitter → noise → erase.
  Conventions: as in torchvision, a positive angle turns the picture anticlockwise. The colour jitter is an approximation:
  it scales contrast about mid-grey and always applies contrast before brightness, while torchvision's ColorJitter blends
  with the image's mean grey and applies its jitters in a random order.
  Aha: augmentation multiplies your data for free, as long as the label stays true.
*/

interface Settings {
  flip: boolean
  cropOn: boolean
  minScale: number
  rotOn: boolean
  maxRot: number
  jitterOn: boolean
  bright: number
  contrast: number
  noiseOn: boolean
  noise: number
  cutout: boolean
}

interface Draw {
  flipped: boolean
  crop: { side: number; x: number; y: number } | null
  angle: number
  b: number
  c: number
  noiseSeed: number
  erase: { x: number; y: number; side: number } | null
}

function drawParams(seed: number, s: Settings): Draw {
  const r = mulberry32(seed)
  const u = () => r()
  // always consume the same number of random numbers so one setting does not reshuffle the others
  const f = u()
  const a = u()
  const cx = u()
  const cy = u()
  const rot = u()
  const bj = u()
  const cj = u()
  const ns = u()
  const ex = u()
  const ey = u()
  const es = u()
  let crop: Draw['crop'] = null
  if (s.cropOn) {
    const area = s.minScale + (1 - s.minScale) * a
    const side = 100 * Math.sqrt(area)
    crop = { side, x: (100 - side) * cx, y: (100 - side) * cy }
  }
  const eSide = 100 * Math.sqrt(0.06 + 0.1 * es)
  return {
    flipped: s.flip && f < 0.5,
    crop,
    angle: s.rotOn ? (2 * rot - 1) * s.maxRot : 0,
    b: s.jitterOn ? 1 + (2 * bj - 1) * s.bright : 1,
    c: s.jitterOn ? 1 + (2 * cj - 1) * s.contrast : 1,
    noiseSeed: Math.floor(ns * 1000),
    erase: s.cutout ? { side: eSide, x: (100 - eSide) * ex, y: (100 - eSide) * ey } : null,
  }
}

function describe(d: Draw, s: Settings) {
  const parts: string[] = []
  if (s.flip) parts.push(d.flipped ? 'flipped' : 'not flipped')
  if (d.crop) parts.push(`crop keeps ${Math.round((d.crop.side * d.crop.side) / 100)}% of the area`)
  if (s.rotOn) parts.push(`rotated ${Math.abs(d.angle).toFixed(0)}° ${d.angle >= 0 ? 'anticlockwise' : 'clockwise'}`)
  if (s.jitterOn) parts.push(`brightness ×${d.b.toFixed(2)}, contrast ×${d.c.toFixed(2)}`)
  if (s.noiseOn && s.noise > 0) parts.push(`noise σ = ${s.noise.toFixed(2)}`)
  if (d.erase) parts.push('a patch erased')
  return parts.length ? parts.join(' · ') : 'no augmentation: identical to the original'
}

function Augmented({ d, s, size, label }: { d: Draw; s: Settings; size: number | string; label: string }) {
  const id = useId().replace(/:/g, '')
  const k = d.crop ? 100 / d.crop.side : 1
  const tf = [
    // SVG's rotate() turns clockwise on screen (y points down); torchvision's positive angles turn anticlockwise
    d.angle ? `rotate(${(-d.angle).toFixed(2)} 50 50)` : '',
    d.flipped ? 'translate(100 0) scale(-1 1)' : '',
    d.crop ? `scale(${k.toFixed(4)}) translate(${(-d.crop.x).toFixed(2)} ${(-d.crop.y).toFixed(2)})` : '',
  ]
    .filter(Boolean)
    .join(' ')
  const slope = d.b * d.c
  const intercept = 0.5 * (1 - d.c) * d.b
  const amt = s.noiseOn ? s.noise * 3.2 : 0
  const useFilter = slope !== 1 || intercept !== 0 || amt > 0
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={label} style={{ width: size, height: 'auto', display: 'block', borderRadius: 6 }}>
      {useFilter && (
        <filter id={`f${id}`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feComponentTransfer in="SourceGraphic" result="j">
            <feFuncR type="linear" slope={slope} intercept={intercept} />
            <feFuncG type="linear" slope={slope} intercept={intercept} />
            <feFuncB type="linear" slope={slope} intercept={intercept} />
          </feComponentTransfer>
          {amt > 0 && (
            <>
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={d.noiseSeed} result="t" />
              <feColorMatrix in="t" type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1" result="g" />
              <feComposite in="j" in2="g" operator="arithmetic" k1={0} k2={1} k3={amt} k4={-amt / 2} />
            </>
          )}
        </filter>
      )}
      <g filter={useFilter ? `url(#f${id})` : undefined}>
        <rect x={0} y={0} width={100} height={100} style={{ fill: 'var(--surface-3)' }} />
        <g transform={tf || undefined}>
          <CatScene />
        </g>
      </g>
      {d.erase && (
        <rect x={d.erase.x} y={d.erase.y} width={d.erase.side} height={d.erase.side} style={{ fill: tint('var(--ink)', 45) }} />
      )}
    </svg>
  )
}

function code(s: Settings) {
  const lines = ['train_tf = transforms.Compose([']
  if (s.cropOn) lines.push(`    transforms.RandomResizedCrop(224, scale=(${s.minScale.toFixed(2)}, 1.0), ratio=(1.0, 1.0)),`)
  else lines.push('    transforms.Resize((224, 224)),')
  if (s.flip) lines.push('    transforms.RandomHorizontalFlip(p=0.5),')
  if (s.rotOn) lines.push(`    transforms.RandomRotation(degrees=${s.maxRot}),`)
  if (s.jitterOn) lines.push(`    transforms.ColorJitter(brightness=${s.bright.toFixed(2)}, contrast=${s.contrast.toFixed(2)}),`)
  lines.push('    transforms.ToTensor(),')
  if (s.noiseOn && s.noise > 0) lines.push(`    transforms.Lambda(lambda x: x + ${s.noise.toFixed(2)} * torch.randn_like(x)),`)
  lines.push("    transforms.Normalize(mean=[0.485, 0.456, 0.406],   # ImageNet's mean")
  lines.push('                         std=[0.229, 0.224, 0.225]),   # and standard deviation')
  if (s.cutout) lines.push('    transforms.RandomErasing(p=1.0, scale=(0.06, 0.16), ratio=(1.0, 1.0)),')
  lines.push('])')
  return lines.join('\n')
}

/** One augmentation: its switch on top, its sliders underneath (greyed out, not removed, while it is off, so nothing jumps). */
function AugGroup({ toggle, on, children }: { toggle: ReactNode; on: boolean; children?: ReactNode }) {
  return (
    <div className={`${css.augGroup}${on ? ` ${css.augOn}` : ''}`}>
      {toggle}
      {children && (
        <fieldset disabled={!on} className={css.augSliders}>
          {children}
        </fieldset>
      )}
    </div>
  )
}

export default function AugmentationPlayground() {
  const [s, setS] = useState<Settings>({
    flip: true,
    cropOn: true,
    minScale: 0.6,
    rotOn: true,
    maxRot: 15,
    jitterOn: true,
    bright: 0.3,
    contrast: 0.3,
    noiseOn: false,
    noise: 0.05,
    cutout: false,
  })
  const [seed, setSeed] = useState(1)
  const [sel, setSel] = useState(0)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const set = <K extends keyof Settings>(k: K) => (v: Settings[K]) => setS((o) => ({ ...o, [k]: v }))
  const draws = useMemo(() => Array.from({ length: 9 }, (_, i) => drawParams(seed * 1013 + i * 7919, s)), [seed, s])
  const noAug = !s.flip && !s.cropOn && !s.rotOn && !s.jitterOn && !(s.noiseOn && s.noise > 0) && !s.cutout
  // settings strong enough to produce pictures that no real test photo would look like
  const unreal: string[] = []
  if (s.rotOn && s.maxRot > 30) unreal.push(s.maxRot > 90 ? 'upside-down cats never appear in real photos' : 'real photos are rarely tilted by more than about 30°')
  if (s.cropOn && s.minScale < 0.3) unreal.push('a crop this small can cut most of the cat away')
  if (s.jitterOn && (s.bright > 0.6 || s.contrast > 0.6)) unreal.push('lighting this extreme washes the cat out or turns it almost black')

  return (
    <Figure
      title="The augmentation playground"
      caption={
        <>
          Each copy is what the model might see of this one photo in a different epoch. Switch augmentations on and off and drag their strength; press{' '}
          <b>New random copies</b> to draw again. Notice that every copy is still obviously a cat, yet no two are the same pixels. Tap a copy to read exactly what
          was done to it. The code underneath is the torchvision pipeline these copies imitate. Then push a slider to its extreme and ask: could a real test photo
          look like that?
        </>
      }
    >
      <div ref={wrapRef} className={css.augWrap} style={{ gridTemplateColumns: narrow ? 'minmax(0, 1fr)' : 'minmax(0, 0.8fr) minmax(0, 1.6fr)' }}>
        <div className={css.augOrig} style={narrow ? { gridTemplateColumns: '120px minmax(0, 1fr)', alignItems: 'center', justifyItems: 'start' } : undefined}>
          <div style={{ display: 'grid', gap: 4, justifyItems: 'center', width: '100%' }}>
            <div className={css.panelTitle}>Original</div>
            <svg viewBox="0 0 100 100" role="img" aria-label="Original training image: a cat in a garden" style={{ width: narrow ? 110 : '100%', maxWidth: 220, height: 'auto', borderRadius: 6 }}>
              <CatScene />
            </svg>
            <div className={css.small}>
              label: <b>cat</b>
            </div>
          </div>
          <div className={css.augInfo} aria-live="polite">
            <b>Copy {sel + 1}:</b> {describe(draws[sel], s)}.
          </div>
        </div>
        <div style={{ display: 'grid', gap: 4 }}>
          <div
            className={css.panelTitle}
            style={unreal.length ? { background: 'var(--highlight-soft)', color: 'var(--highlight-ink)', borderRadius: 4, padding: '0 6px' } : undefined}
          >
            {noAug ? 'Nine epochs, no augmentation: the same image every time' : unreal.length ? 'Nine epochs, but some copies look like no real photo' : 'Nine epochs, nine different training images'}
          </div>
          <div className={css.augGrid}>
            {draws.map((d, i) => (
              <button key={i} type="button" className={`${css.augCell}${sel === i ? ` ${css.sel}` : ''}`} onClick={() => setSel(i)} aria-label={`Copy ${i + 1}: ${describe(d, s)}`}>
                <Augmented d={d} s={s} size="100%" label={`Augmented copy ${i + 1}`} />
                <span>epoch {i + 1} · cat</span>
              </button>
            ))}
          </div>
          {unreal.length > 0 && (
            <div className={css.small} role="status" style={{ background: 'var(--highlight-soft)', color: 'var(--highlight-ink)', borderRadius: 6, padding: '4px 8px' }}>
              <b>Careful:</b> {unreal.join('; ')}. Copies like these are unrealistic, so the model wastes effort on them (see the next figure).
            </div>
          )}
        </div>
      </div>

      <div className={css.augControls} style={{ gridTemplateColumns: narrow ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))' }}>
        <AugGroup on={s.cropOn} toggle={<Toggle label="Random crop" checked={s.cropOn} onChange={set('cropOn')} />}>
          <Slider label="smallest crop (share of area)" value={s.minScale} min={0.2} max={1} step={0.05} onChange={set('minScale')} format={(v) => `${Math.round(v * 100)}%`} />
        </AugGroup>
        <AugGroup on={s.rotOn} toggle={<Toggle label="Random rotation" checked={s.rotOn} onChange={set('rotOn')} />}>
          <Slider label="max rotation" value={s.maxRot} min={0} max={180} step={5} onChange={set('maxRot')} format={(v) => `±${v}°`} />
        </AugGroup>
        <AugGroup on={s.jitterOn} toggle={<Toggle label="Colour jitter" checked={s.jitterOn} onChange={set('jitterOn')} />}>
          <Slider label="brightness" value={s.bright} min={0} max={0.8} step={0.05} onChange={set('bright')} format={(v) => `×${(1 - v).toFixed(2)} to ×${(1 + v).toFixed(2)}`} />
          <Slider label="contrast" value={s.contrast} min={0} max={0.8} step={0.05} onChange={set('contrast')} format={(v) => `×${(1 - v).toFixed(2)} to ×${(1 + v).toFixed(2)}`} />
        </AugGroup>
        <AugGroup on={s.noiseOn} toggle={<Toggle label="Gaussian noise" checked={s.noiseOn} onChange={set('noiseOn')} />}>
          <Slider label="noise σ" value={s.noise} min={0} max={0.3} step={0.01} onChange={set('noise')} format={(v) => v.toFixed(2)} />
        </AugGroup>
        <AugGroup on={s.flip} toggle={<Toggle label="Horizontal flip (50% chance)" checked={s.flip} onChange={set('flip')} />} />
        <AugGroup on={s.cutout} toggle={<Toggle label="Cutout (random erasing)" checked={s.cutout} onChange={set('cutout')} />} />
      </div>
      <Controls>
        <Button primary onClick={() => setSeed((x) => x + 1)}>
          New random copies
        </Button>
      </Controls>
      <div style={{ width: '100%' }}>
        <CodeBlock code={code(s)} language="python" title="the torchvision pipeline these copies imitate (training set only)" showLineNumbers={false} />
      </div>
    </Figure>
  )
}
