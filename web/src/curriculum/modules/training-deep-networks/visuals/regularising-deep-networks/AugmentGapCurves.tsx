import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Toggle, Button, Plot, Grid, Axes, Path, Label, usePlot, useNarrow, useBump, mulberry32 } from '../../../../../kit'
import { AUG_RUNS, DIGITS, EVERY } from './augData'
import { Legend, Note } from './parts'

/*
  Data augmentation as regularisation. Top: one training digit and six random augmented copies made
  with the transforms you switch on. Bottom: REAL accuracy curves (precomputed, see augData.ts) for a
  small network trained on only 150 digits, with and without those augmentations.
  Aha: more varied data closes the train-validation gap without changing the model, but only if the
  transform keeps the label (flipping digits does not) and is not so strong it wrecks the image.
*/

const S = 10
const SHIFT = [0, 1, 2, 3]
const ROT = [0, 10, 20, 30]
const NOISE = [0, 0.1, 0.2, 0.3]
type Level = 1 | 2 | 3

function gauss(r: () => number) {
  const u = Math.max(r(), 1e-12)
  const v = r()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/** 8x8 digit placed in the middle of a 10x10 canvas */
function canvas(d: number[]): number[][] {
  const c = Array.from({ length: S }, () => new Array(S).fill(0))
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) c[i + 1][j + 1] = d[i * 8 + j]
  return c
}

function rotate(img: number[][], deg: number): number[][] {
  const th = (deg * Math.PI) / 180
  const c = Math.cos(th)
  const s = Math.sin(th)
  const cc = (S - 1) / 2
  const out = Array.from({ length: S }, () => new Array(S).fill(0))
  for (let i = 0; i < S; i++)
    for (let j = 0; j < S; j++) {
      const yy = i - cc
      const xx = j - cc
      const sx = c * xx + s * yy + cc
      const sy = -s * xx + c * yy + cc
      const x0 = Math.floor(sx)
      const y0 = Math.floor(sy)
      const fx = sx - x0
      const fy = sy - y0
      let v = 0
      const taps: [number, number, number][] = [
        [y0, x0, (1 - fx) * (1 - fy)],
        [y0, x0 + 1, fx * (1 - fy)],
        [y0 + 1, x0, (1 - fx) * fy],
        [y0 + 1, x0 + 1, fx * fy],
      ]
      for (const [yi, xi, wt] of taps) if (yi >= 0 && yi < S && xi >= 0 && xi < S) v += wt * img[yi][xi]
      out[i][j] = v
    }
  return out
}

function shift(img: number[][], dx: number, dy: number): number[][] {
  const out = Array.from({ length: S }, () => new Array(S).fill(0))
  for (let i = 0; i < S; i++)
    for (let j = 0; j < S; j++) {
      const si = i - dy
      const sj = j - dx
      if (si >= 0 && si < S && sj >= 0 && sj < S) out[i][j] = img[si][sj]
    }
  return out
}

interface Opts {
  shift: boolean
  rotate: boolean
  noise: boolean
  flip: boolean
}

function augment(img: number[][], o: Opts, lev: Level, r: () => number): number[][] {
  let a = img
  if (o.flip && r() < 0.5) a = a.map((row) => row.slice().reverse())
  if (o.rotate) a = rotate(a, (2 * r() - 1) * ROT[lev])
  if (o.shift) {
    const s = SHIFT[lev]
    const dx = Math.floor(r() * (2 * s + 1)) - s
    const dy = Math.floor(r() * (2 * s + 1)) - s
    a = shift(a, dx, dy)
  }
  if (o.noise) a = a.map((row) => row.map((v) => Math.min(1, Math.max(0, v + NOISE[lev] * gauss(r)))))
  return a
}

function Pixels({ img, size, label, highlight }: { img: number[][]; size: number; label: string; highlight?: boolean }) {
  const c = size / S
  return (
    <figure style={{ margin: 0, display: 'grid', justifyItems: 'center', gap: 3 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} style={{ borderRadius: 4, outline: highlight ? '2px solid var(--accent)' : '1px solid var(--rule)' }}>
        <rect width={size} height={size} style={{ fill: 'var(--surface)' }} />
        {img.flatMap((row, i) =>
          row.map((v, j) =>
            v > 0.02 ? <rect key={`${i}-${j}`} x={j * c} y={i * c} width={c + 0.3} height={c + 0.3} style={{ fill: `color-mix(in srgb, var(--viz-ink) ${Math.round(Math.min(1, v) * 100)}%, var(--surface))` }} /> : null,
          ),
        )}
      </svg>
      <figcaption style={{ fontSize: '0.72rem', color: 'var(--ink-3)' }}>{label}</figcaption>
    </figure>
  )
}

function GapShade({ top, bottom }: { top: [number, number][]; bottom: [number, number][] }) {
  const { xs, ys, clipId } = usePlot()
  const pts = [...top, ...bottom.slice().reverse()].map(([x, y]) => `${xs(x).toFixed(1)},${ys(y).toFixed(1)}`).join(' ')
  return <polygon clipPath={`url(#${clipId})`} points={pts} style={{ fill: 'color-mix(in srgb, var(--viz-2) 14%, transparent)' }} />
}

const keyOf = (o: Opts, lev: Level) => {
  const any = o.shift || o.rotate || o.noise
  return `${+o.shift}${+o.rotate}${+o.noise}${+o.flip}${any ? lev : 0}`
}

export default function AugmentGapCurves() {
  const [o, setO] = useState<Opts>({ shift: true, rotate: false, noise: false, flip: false })
  const [lev, setLev] = useState<Level>(1)
  const [digit, setDigit] = useState(0)
  const [seed, bump] = useBump()
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)

  const base = AUG_RUNS['00000']
  const run = AUG_RUNS[keyOf(o, lev)]
  const anyAug = o.shift || o.rotate || o.noise || o.flip

  const original = useMemo(() => canvas(DIGITS[digit].pixels), [digit])
  const copies = useMemo(() => {
    const r = mulberry32(4242 + seed * 131 + digit * 17)
    return Array.from({ length: 6 }, () => augment(original, o, lev, r))
  }, [original, o, lev, seed, digit])

  const n = base.train.length
  const toPts = (arr: number[]): [number, number][] => arr.map((v, i) => [i * EVERY, v / 10])
  const last = (arr: number[]) => arr[n - 1] / 10
  const gapBase = last(base.train) - last(base.val)
  const gapNow = last(run.train) - last(run.val)
  const dVal = last(run.val) - last(base.val)

  // the same augmentation without flips, to show what flipping adds or costs
  const noFlip = AUG_RUNS[keyOf({ ...o, flip: false }, lev)]
  const flipCost = o.flip && (o.shift || o.rotate || o.noise) ? last(noFlip.val) - last(run.val) : 0

  let tone: 'plain' | 'good' | 'bad' | 'warn' = 'plain'
  let msg: string
  if (!anyAug)
    msg = `No augmentation: the network memorises the 150 training digits (training accuracy ${last(base.train).toFixed(0)}%) but gets only ${last(base.val).toFixed(0)}% of new digits right. That ${gapBase.toFixed(0)}-point gap is overfitting.`
  else if (last(run.val) < last(base.val) - 2) {
    tone = 'bad'
    msg = `Too strong: the copies are so distorted that the network cannot even fit its own training digits (${last(run.train).toFixed(0)}%), and validation accuracy falls to ${last(run.val).toFixed(0)}%, worse than no augmentation. Augment, but keep the images recognisable.`
  } else if (flipCost > 2) {
    tone = 'bad'
    msg = `Adding flips costs ${flipCost.toFixed(0)} points of validation accuracy (${last(noFlip.val).toFixed(0)}% without them, ${last(run.val).toFixed(0)}% with). A mirrored 2 or 7 is not a digit anyone writes, so the label no longer fits the picture. For photos of cats, flips are great; for digits and text, they are not.`
  } else if (last(run.train) < 85) {
    tone = 'warn'
    msg = `Strong settings start to hurt: training accuracy drops to ${last(run.train).toFixed(0)}% because some copies are pushed half off the small canvas. Validation ${last(run.val).toFixed(0)}% is still above no augmentation (${last(base.val).toFixed(0)}%), but gentler settings do better.`
  } else if (dVal > 4) {
    tone = 'good'
    msg = `Same network, same 150 digits, but varied copies every epoch: validation accuracy rises from ${last(base.val).toFixed(0)}% to ${last(run.val).toFixed(0)}% and the gap shrinks from ${gapBase.toFixed(0)} to ${gapNow.toFixed(0)} points.`
  } else {
    msg = `Only a small change: validation accuracy ${last(base.val).toFixed(0)}% → ${last(run.val).toFixed(0)}%.${o.flip && !(o.shift || o.rotate || o.noise) ? ' Flipped digits are not real digits, so they teach little.' : ''} In this data the digits differ mostly in position, so shifting is the transform that teaches the most.`
  }

  const flipT = (k: keyof Opts) => (v: boolean) => setO((p) => ({ ...p, [k]: v }))
  const big = narrow ? 70 : 96
  const small = narrow ? 46 : 64

  return (
    <Figure
      title="Augmentation: more variety, smaller gap"
      caption={
        <>
          A network with one hidden layer of 64 neurons trained on only 150 handwritten digits (each 10 × 10 pixels; digits sit up to 1 pixel off
          centre), checked on 600 others. Curves are real, averaged over 3 training runs; training accuracy is measured on the original
          (unaltered) training digits. Switch transforms on and off and change their strength:
          the <b>solid</b> curves are with your augmentation, the <b>dashed</b> ones without. Gentle shifts close most of the gap; flips
          barely help on their own and hurt when added to shifts; strong settings wreck the images.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: '0.7rem', justifyItems: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'flex-end', justifyContent: 'center' }}>
          <Pixels img={original} size={big} label={`original "${DIGITS[digit].label}"`} highlight />
          <span aria-hidden="true" style={{ alignSelf: 'center', color: 'var(--ink-3)', fontSize: '1.2rem', padding: '0 0.1rem' }}>
            →
          </span>
          {copies.slice(0, narrow ? 4 : 6).map((img, i) => (
            <Pixels key={i} img={img} size={small} label={anyAug ? `copy ${i + 1}` : 'same'} />
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem 1.1rem', justifyContent: 'center' }}>
          <Toggle label="Shift" checked={o.shift} onChange={flipT('shift')} />
          <Toggle label="Rotate" checked={o.rotate} onChange={flipT('rotate')} />
          <Toggle label="Noise" checked={o.noise} onChange={flipT('noise')} />
          <Toggle label="Flip left–right" checked={o.flip} onChange={flipT('flip')} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem 1rem', justifyContent: 'center', alignItems: 'flex-end' }}>
          <Segmented
            label={`Strength: shift ±${SHIFT[lev]} px, rotate ±${ROT[lev]}°, noise σ ${NOISE[lev]}`}
            value={lev}
            onChange={setLev}
            options={[
              { value: 1 as Level, label: 'gentle' },
              { value: 2 as Level, label: 'medium' },
              { value: 3 as Level, label: 'strong' },
            ]}
          />
          <Segmented
            label="Training image"
            value={digit}
            onChange={setDigit}
            options={DIGITS.map((d, i) => ({ value: i, label: d.label }))}
          />
          <Button onClick={bump}>New random copies</Button>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--ink-2)', fontWeight: 700 }}>Accuracy (%) per epoch</div>
        <Plot
          x={[0, (n - 1) * EVERY]}
          y={[0, 100]}
          width={narrow ? 360 : 600}
          height={narrow ? 230 : 250}
          minHeight={200}
          maxWidth={720}
          margin={{ left: 44, right: 14, top: 14 }}
          ariaLabel={`Accuracy curves. Without augmentation: training ${last(base.train).toFixed(0)} percent, validation ${last(base.val).toFixed(0)} percent. With the chosen augmentation: training ${last(run.train).toFixed(0)} percent, validation ${last(run.val).toFixed(0)} percent.`}
        >
          <Grid xTicks={8} yTicks={5} />
          {anyAug && <GapShade top={toPts(run.train)} bottom={toPts(run.val)} />}
          <Axes xLabel="epoch" xTicks={narrow ? 4 : 8} yTicks={5} />
          <Path points={toPts(base.train)} color="var(--viz-1)" width={1.8} dash="5 4" opacity={anyAug ? 0.5 : 1} />
          <Path points={toPts(base.val)} color="var(--viz-2)" width={1.8} dash="5 4" opacity={anyAug ? 0.5 : 1} />
          {anyAug && <Path points={toPts(run.train)} color="var(--viz-1)" width={2.8} />}
          {anyAug && <Path points={toPts(run.val)} color="var(--viz-2)" width={2.8} />}
          <Label x={(n - 1) * EVERY} y={last(run.val)} dx={-4} dy={18} anchor="end" color="var(--viz-2)" size={12} weight={700}>
            {`validation ${last(run.val).toFixed(0)}%`}
          </Label>
          <Label x={(n - 1) * EVERY} y={last(run.train)} dx={-4} dy={last(run.train) > 93 ? 18 : -9} anchor="end" color="var(--viz-1)" size={12} weight={700}>
            {`training ${last(run.train).toFixed(0)}%`}
          </Label>
        </Plot>
        <Legend
          items={[
            { color: 'var(--viz-1)', label: 'training accuracy' },
            { color: 'var(--viz-2)', label: 'validation accuracy' },
            { color: 'var(--viz-muted)', label: 'no augmentation', dash: true },
          ]}
        />
        <Note tone={tone}>{msg}</Note>
      </div>
      <Controls>
        <Readout
          items={[
            ['validation accuracy', `${last(base.val).toFixed(1)}% → ${last(run.val).toFixed(1)}%`],
            ['gap (train − val)', `${gapBase.toFixed(1)} → ${gapNow.toFixed(1)} pts`],
          ]}
        />
      </Controls>
    </Figure>
  )
}
