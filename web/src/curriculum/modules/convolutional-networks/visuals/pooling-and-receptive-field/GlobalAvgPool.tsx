import { useState } from 'react'
import { Figure, Controls, Segmented, Slider, Readout, Bars, useContainerWidth } from '../../../../../kit'
import { heat } from './common'

/** Heat fill with a visible floor, so a map with almost no activation still reads as a map (dark mode too). */
const mapFill = (v: number) => `color-mix(in srgb, var(--viz-1) ${Math.round(12 + 73 * Math.max(0, Math.min(1, v)))}%, var(--surface))`

/*
  Global average pooling versus flatten, at the end of a CNN. Four final feature maps (one per
  detector) shrink to four numbers with GAP, whatever the image size. Flatten keeps every
  position, so its classifier only fits the one size it was built for.
*/

const CHANNELS = ['whiskers', 'pointy ears', 'wheels', 'headlights'] as const
type Photo = 'cat' | 'car'

// Blob layouts in normalised image coordinates (x, y in 0..1): [cx, cy, sigma, amplitude]
const BLOBS: Record<Photo, [number, number, number, number][][]> = {
  cat: [
    [[0.5, 0.62, 0.22, 1.0]],
    [[0.27, 0.2, 0.15, 0.95], [0.73, 0.2, 0.15, 0.95]],
    [[0.15, 0.9, 0.12, 0.15]],
    [[0.85, 0.55, 0.12, 0.12]],
  ],
  car: [
    [[0.45, 0.3, 0.12, 0.12]],
    [[0.7, 0.15, 0.12, 0.15]],
    [[0.25, 0.8, 0.15, 1.0], [0.75, 0.8, 0.15, 1.0]],
    [[0.1, 0.5, 0.13, 0.95], [0.9, 0.5, 0.13, 0.95]],
  ],
}
const BUILT_SIZE = 224 // the classifier after Flatten was created for 224×224 images
const HEAD_W = [4, 4, -4, -4] // cat-versus-car weights on the four averaged features
const HEAD_B = 0

function featureMap(photo: Photo, ch: number, n: number): number[][] {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      const x = (j + 0.5) / n
      const y = (i + 0.5) / n
      let v = 0
      for (const [cx, cy, sg, a] of BLOBS[photo][ch]) v += a * Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * sg * sg))
      return Math.min(1, v)
    }),
  )
}

const mean = (m: number[][]) => m.flat().reduce((a, b) => a + b, 0) / (m.length * m.length)

function MiniMap({ m, size, label, avg, showAvg }: { m: number[][]; size: number; label: string; avg: number; showAvg: boolean }) {
  const n = m.length
  const c = size / n
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 2, minWidth: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label} feature map, ${n} by ${n}`} style={{ display: 'block' }}>
        {m.map((row, i) => row.map((v, j) => <rect key={`${i}-${j}`} x={j * c + 0.5} y={i * c + 0.5} width={c - 1} height={c - 1} rx={Math.min(3, c / 5)} style={{ fill: mapFill(v) }} />))}
        <rect x={0.5} y={0.5} width={size - 1} height={size - 1} rx={3} style={{ fill: 'none', stroke: 'var(--viz-grid)', strokeWidth: 1 }} />
      </svg>
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
      {showAvg && <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>mean {avg.toFixed(2)}</span>}
    </div>
  )
}

export default function GlobalAvgPool() {
  const [head, setHead] = useState<'gap' | 'flatten'>('flatten')
  const [size, setSize] = useState(224)
  const [photo, setPhoto] = useState<Photo>('cat')
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(600)
  const n = size / 32
  const maps = CHANNELS.map((_, c) => featureMap(photo, c, n))
  const avgs = maps.map(mean)
  const nIn = head === 'gap' ? 4 : 4 * n * n
  const builtIn = head === 'gap' ? 4 : 4 * (BUILT_SIZE / 32) ** 2
  const mismatch = nIn !== builtIn
  const z = avgs.reduce((a, v, i) => a + v * HEAD_W[i], HEAD_B)
  const pCat = 1 / (1 + Math.exp(-z))
  const mapSize = Math.max(56, Math.min(110, Math.floor((width - 3 * 12) / 4)))

  // flatten strip layout
  const cell = n <= 4 ? 12 : n <= 7 ? 8 : 6
  const gap = 6
  const perRow = Math.max(8, Math.floor((width - 4) / cell))
  const cellsPos: { x: number; y: number; v: number }[] = []
  let x = 0
  let y = 0
  maps.forEach((m) => {
    m.flat().forEach((v) => {
      if (x + cell > perRow * cell) {
        x = 0
        y += cell
      }
      cellsPos.push({ x, y, v })
      x += cell
    })
    x += gap
  })
  const stripH = y + cell
  const stripW = Math.min(width, perRow * cell + 3 * gap)

  return (
    <Figure
      title="Global average pooling: one number per feature map"
      caption={
        <>
          <b>Try:</b> switch heads, then slide the image size. <b>Notice:</b> global average pooling keeps one number per map (how strongly that feature
          appears, wherever it is), so it works at every size; the Flatten head breaks at any size but 224.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'nowrap' }}>
          {maps.map((m, c) => (
            <MiniMap key={c} m={m} size={mapSize} label={CHANNELS[c]} avg={avgs[c]} showAvg={head === 'gap'} />
          ))}
        </div>
        <div style={{ textAlign: 'center', fontSize: 'var(--step--1)', color: 'var(--ink-2)', fontWeight: 700 }}>
          {head === 'gap' ? (
            <>↓ average each map ↓</>
          ) : (
            <>
              ↓ flatten: {4 * n * n} numbers ↓
            </>
          )}
        </div>
        {head === 'flatten' ? (
          <svg width={stripW} height={stripH} viewBox={`0 0 ${stripW} ${stripH}`} style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }} role="img" aria-label={`Flattened vector of ${4 * n * n} numbers`}>
            {cellsPos.map((p, i) => (
              <rect key={i} x={p.x} y={p.y} width={cell - 1} height={cell - 1} style={{ fill: mapFill(p.v) }} />
            ))}
          </svg>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
            {avgs.map((v, i) => (
              <div key={i} title={CHANNELS[i]} style={{ width: 54, height: 34, display: 'grid', placeItems: 'center', borderRadius: 6, background: heat(v, 0, 0.5, 70), fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>
                {v.toFixed(2)}
              </div>
            ))}
          </div>
        )}
        <div style={{ textAlign: 'center', fontSize: 'var(--step--1)', color: 'var(--ink-2)' }}>
          Classifier: <code>nn.Linear({builtIn}, 2)</code>
          {head === 'flatten' && <> (made for {BUILT_SIZE} × {BUILT_SIZE} images)</>}
        </div>
        {mismatch ? (
          <div role="alert" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, padding: '8px 10px', borderRadius: 8, background: 'color-mix(in srgb, var(--viz-neg) 12%, var(--surface))', color: 'var(--ink)', border: '1.5px solid var(--viz-neg)', overflowWrap: 'anywhere' }}>
            RuntimeError: mat1 and mat2 shapes cannot be multiplied (1x{nIn} and {builtIn}x2)
          </div>
        ) : (
          <Bars
            ariaLabel="Class probabilities"
            max={1}
            data={[
              { label: 'cat', value: pCat, color: 'var(--viz-2)', strong: pCat > 0.5 },
              { label: 'car', value: 1 - pCat, color: 'var(--viz-3)', strong: pCat <= 0.5 },
            ]}
          />
        )}
      </div>
      <Controls>
        <Segmented label="Head" value={head} onChange={setHead} options={[{ value: 'flatten', label: 'Flatten' }, { value: 'gap', label: 'Global average pool' }]} />
        <Segmented label="Photo" value={photo} onChange={setPhoto} options={[{ value: 'cat', label: 'cat' }, { value: 'car', label: 'car' }]} />
        <Slider label="Input image size" value={size} min={64} max={320} step={32} onChange={setSize} format={(v) => `${v} × ${v}`} />
      </Controls>
      <Readout
        items={[
          ['final maps', `${n} × ${n}`],
          ['numbers into the classifier', String(nIn)],
          ['classifier parameters', `${builtIn} × 2 + 2 = ${builtIn * 2 + 2}`],
        ]}
      />
    </Figure>
  )
}
