import { useState, type ReactNode } from 'react'
import { Figure, Controls, Slider, Segmented, Bars, Readout, useContainerWidth } from '../../../../../kit'

/*
  A 20x20 image that is mostly background with one square object of side `side`.
  Three predictions: lazy (everything background), shifted (the right size but one pixel down and right), too big (one extra ring).
  Bars compare pixel accuracy, IoU of each class, mean IoU and the object's Dice score, all counted from the same two masks.
*/

const G = 20
type Mode = 'lazy' | 'shifted' | 'big' | 'perfect'

function objectBox(side: number) {
  const a = Math.floor((G - side) / 2)
  return { a, b: a + side } // rows/cols a..b-1
}

export default function PixelAccuracyTrap() {
  const [side, setSide] = useState(4)
  const [mode, setMode] = useState<Mode>('lazy')
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(560)
  const cell = Math.max(11, Math.min(16, Math.floor((Math.min(width, 520) - 10) / G)))

  const { a, b } = objectBox(side)
  const isTrue = (i: number, j: number) => i >= a && i < b && j >= a && j < b
  const isPred = (i: number, j: number) => {
    if (mode === 'lazy') return false
    if (mode === 'perfect') return isTrue(i, j)
    if (mode === 'shifted') return i >= a + 1 && i < b + 1 && j >= a + 1 && j < b + 1
    return i >= a - 1 && i < b + 1 && j >= a - 1 && j < b + 1
  }
  let tp = 0
  let fp = 0
  let fn = 0
  let tn = 0
  const rects: ReactNode[] = []
  for (let i = 0; i < G; i++)
    for (let j = 0; j < G; j++) {
      const t = isTrue(i, j)
      const p = isPred(i, j)
      if (t && p) tp++
      else if (p) fp++
      else if (t) fn++
      else tn++
      rects.push(
        <rect
          key={`${i}-${j}`}
          x={j * cell}
          y={i * cell}
          width={cell}
          height={cell}
          style={{ fill: p ? 'color-mix(in srgb, var(--viz-1) 70%, var(--surface))' : 'color-mix(in srgb, var(--viz-muted) 22%, var(--surface))', stroke: 'var(--surface)', strokeWidth: 1 }}
        />,
      )
    }
  const total = G * G
  const acc = (tp + tn) / total
  const iouObj = tp / (tp + fp + fn)
  const iouBg = tn / (tn + fp + fn)
  const miou = (iouObj + iouBg) / 2
  const dice = (2 * tp) / (2 * tp + fp + fn)
  const S = cell * G
  const pct = (x: number) => `${(x * 100).toFixed(1)}%`

  return (
    <Figure
      title="The pixel accuracy trap"
      caption={
        <>
          The outlined square is the true object; filled cells are what the model predicts as object. Start with the <b>lazy</b> model: it
          predicts background everywhere, finds nothing, and still scores a pixel accuracy above 90%. Shrink the object and its accuracy only
          goes <i>up</i>. Mean IoU and Dice cannot be fooled: the object&apos;s IoU is 0. Then compare the shifted and too-big predictions:
          accuracy barely moves, but IoU shows the difference.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '1rem 1.5rem', justifyContent: 'center', alignItems: 'center' }}>
        <svg viewBox={`0 0 ${S} ${S}`} width={S} height={S} role="img" aria-label={`A ${G} by ${G} image with a ${side} by ${side} object. Prediction: ${mode}.`} style={{ display: 'block', borderRadius: 4 }}>
          {rects}
          <rect x={a * cell} y={a * cell} width={side * cell} height={side * cell} style={{ fill: 'none', stroke: 'var(--viz-2)', strokeWidth: 3 }} />
        </svg>
        <div style={{ flex: '1 1 240px', minWidth: 220, maxWidth: 380 }}>
          <Bars
            ariaLabel="Metrics for this prediction"
            max={1}
            format={(v) => v.toFixed(2)}
            data={[
              // neutral stripes for accuracy (not a class); the background bar uses the background cells' colour
              { label: 'pixel accuracy', value: acc, color: 'repeating-linear-gradient(135deg, var(--ink-3) 0 4px, color-mix(in srgb, var(--ink-3) 35%, transparent) 4px 7px)', strong: true },
              { label: 'IoU background', value: iouBg, color: 'var(--viz-muted)' },
              { label: 'IoU object', value: iouObj, color: 'var(--viz-1)' },
              { label: 'mean IoU', value: miou, color: 'var(--viz-5)', strong: true },
              { label: 'Dice (object)', value: dice, color: 'var(--viz-2)' },
            ]}
          />
        </div>
      </div>
      <Readout
        items={[
          ['object', `${side * side} of ${total} pixels (${pct((side * side) / total)})`],
          ['TP', String(tp)],
          ['FP', String(fp)],
          ['FN', String(fn)],
          ['TN', String(tn)],
        ]}
      />
      <Controls>
        <Slider label="object side (pixels)" value={side} min={1} max={10} onChange={setSide} />
        <Segmented
          label="prediction"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'lazy', label: 'lazy: all background' },
            { value: 'shifted', label: 'shifted by 1' },
            { value: 'big', label: 'too big' },
            { value: 'perfect', label: 'perfect' },
          ]}
        />
      </Controls>
    </Figure>
  )
}
