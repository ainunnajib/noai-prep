import { useId, useState } from 'react'
import { Figure, Controls, Segmented, Readout, usePlayer, PlayerControls, useContainerWidth, M } from '../../../../../kit'
import { heat, fmt, isRounded, outLen, pool2d, windowValues, cellText, type Kind } from './common'

/*
  Max / average pooling on an 8×8 feature map. Pick window and stride; click an output cell (or
  press Play) to see which window it summarises and the arithmetic. Cells that no window covers
  (when the stride does not divide evenly, or the stride is bigger than the window) are greyed.
*/

// An 8×8 ReLU feature map (all values ≥ 0): a diagonal edge detector firing along a diagonal.
const FMAP: number[][] = [
  [0, 1, 0, 0, 2, 0, 1, 0],
  [1, 7, 2, 0, 0, 1, 0, 0],
  [0, 2, 8, 3, 0, 0, 2, 1],
  [0, 0, 3, 9, 1, 0, 0, 0],
  [1, 0, 0, 2, 6, 2, 0, 1],
  [0, 0, 1, 0, 3, 8, 1, 0],
  [2, 0, 0, 1, 0, 2, 5, 3],
  [0, 1, 0, 0, 1, 0, 3, 9],
]
const N = 8

export default function PoolingExplorer() {
  const [kind, setKind] = useState<Kind>('max')
  const [k, setK] = useState(2)
  const [s, setS] = useState(2)
  const outN = outLen(N, k, s)
  const player = usePlayer({ steps: outN * outN, interval: 700 })
  const sel = Math.min(player.step, outN * outN - 1)
  const si = Math.floor(sel / outN)
  const sj = sel % outN
  const pooled = pool2d(FMAP, k, s, kind)
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(600)
  const hatchId = 'hatch' + useId().replace(/:/g, '')

  const narrow = width < 520
  // Layout in real pixels so the numbers stay legible on phones.
  const cs = narrow ? Math.min(40, Math.floor((width - 8) / N)) : Math.min(40, Math.floor((width - 70) / (N + outN)))
  const os = cs // output cell size
  const labelH = 22
  const inW = N * cs
  const outW = outN * os
  // leave room for the centred title above a small pooled map ("Average-pooled 2 × 2" is about 150 px wide)
  const svgW = narrow ? Math.max(inW, outW, 160) : Math.max(inW + 56 + outW, inW + 56 + outW / 2 + 80)
  const inX = narrow ? (svgW - inW) / 2 : 0
  const inY = labelH
  const outX = narrow ? (svgW - outW) / 2 : inW + 56
  const outY = narrow ? inY + inW + 46 + labelH : labelH + (inW - outW) / 2
  const svgH = narrow ? outY + outW + 4 : labelH + inW + 4
  const fs = Math.max(11, Math.min(15, cs * 0.38))

  // which input cells some window covers
  const covered = FMAP.map((row, r) => row.map((_, c) => {
    const inRange = (p: number) => Array.from({ length: outN }, (_, i) => i * s).some((st) => p >= st && p < st + k)
    return inRange(r) && inRange(c)
  }))
  const win = windowValues(FMAP, si, sj, k, s)
  const best = Math.max(...win)
  const value = pooled[si]?.[sj] ?? 0
  const nonOverlap = s >= k

  const choose = (i: number, j: number) => {
    player.pause()
    player.setStep(i * outN + j)
  }
  const reset = (nk: number, ns: number) => {
    setK(nk)
    setS(ns)
    player.reset()
  }

  const arithmetic =
    kind === 'max'
      ? `\\max(${win.join(', ')}) = ${best}`
      : `\\tfrac{${win.reduce((a, b) => a + b, 0)}}{${win.length}} ${isRounded(value) ? '\\approx' : '='} ${fmt(value)}`

  return (
    <Figure
      title="Pooling: one number per window"
      caption={
        <>
          <b>Try:</b> click a cell of the pooled map (or press <b>Play</b>), then a 3×3 window with stride 3. <b>Notice:</b> the diagonal edge survives max
          pooling at half the size, nothing is learned, and hatched grey cells are never looked at.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} width={svgW} height={svgH} style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto', userSelect: 'none', WebkitUserSelect: 'none' }} role="img" aria-label={`An 8 by 8 feature map pooled with a ${k} by ${k} window and stride ${s} into a ${outN} by ${outN} map`}>
          <defs>
            <pattern id={hatchId} width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1={0} y1={0} x2={0} y2={6} style={{ stroke: 'var(--viz-muted)', strokeWidth: 1.5 }} />
            </pattern>
          </defs>
          <text x={inX + inW / 2} y={15} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontWeight: 700, fontSize: 13 }}>
            Feature map 8 × 8
          </text>
          <text x={outX + outW / 2} y={outY - 7} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontWeight: 700, fontSize: 13 }}>
            {kind === 'max' ? 'Max' : 'Average'}-pooled {outN} × {outN}
          </text>
          {/* input cells */}
          {FMAP.map((row, r) =>
            row.map((v, c) => {
              const inWin = r >= si * s && r < si * s + k && c >= sj * s && c < sj * s + k
              const isBest = kind === 'max' && inWin && v === best
              return (
                <g key={`i${r}-${c}`}>
                  <rect
                    x={inX + c * cs + 1}
                    y={inY + r * cs + 1}
                    width={cs - 2}
                    height={cs - 2}
                    rx={4}
                    style={{ fill: covered[r][c] ? heat(v, 0, 9) : 'var(--surface-2)' }}
                  />
                  {!covered[r][c] && <rect x={inX + c * cs + 1} y={inY + r * cs + 1} width={cs - 2} height={cs - 2} rx={4} style={{ fill: `url(#${hatchId})`, opacity: 0.7 }} />}
                  <text
                    x={inX + c * cs + cs / 2}
                    y={inY + r * cs + cs / 2}
                    dy="0.35em"
                    textAnchor="middle"
                    style={{ ...cellText, fontSize: fs, fill: isBest ? 'var(--viz-2)' : covered[r][c] ? 'var(--ink)' : 'var(--ink-3)', fontWeight: isBest ? 800 : 600 }}
                  >
                    {v}
                  </text>
                  {isBest && <circle cx={inX + c * cs + cs / 2} cy={inY + r * cs + cs / 2} r={cs * 0.36} style={{ fill: 'none', stroke: 'var(--viz-2)', strokeWidth: 2 }} />}
                </g>
              )
            }),
          )}
          {/* all window outlines when they do not overlap */}
          {nonOverlap &&
            Array.from({ length: outN * outN }, (_, q) => {
              const i = Math.floor(q / outN)
              const j = q % outN
              return (
                <rect
                  key={`w${q}`}
                  x={inX + j * s * cs}
                  y={inY + i * s * cs}
                  width={k * cs}
                  height={k * cs}
                  rx={5}
                  style={{ fill: 'none', stroke: 'var(--viz-axis)', strokeWidth: 1.2, strokeDasharray: '4 3', opacity: 0.8 }}
                />
              )
            })}
          {/* the selected window */}
          <rect x={inX + sj * s * cs} y={inY + si * s * cs} width={k * cs} height={k * cs} rx={6} style={{ fill: 'color-mix(in srgb, var(--viz-2) 10%, transparent)', stroke: 'var(--viz-2)', strokeWidth: 3 }} />
          {/* output cells */}
          {pooled.map((row, i) =>
            row.map((v, j) => {
              const isSel = i === si && j === sj
              return (
                <g key={`o${i}-${j}`} onClick={() => choose(i, j)} style={{ cursor: 'pointer' }}>
                  <rect x={outX + j * os + 1} y={outY + i * os + 1} width={os - 2} height={os - 2} rx={4} style={{ fill: heat(v, 0, 9), stroke: isSel ? 'var(--viz-2)' : 'none', strokeWidth: 3 }} />
                  <text x={outX + j * os + os / 2} y={outY + i * os + os / 2} dy="0.35em" textAnchor="middle" style={{ ...cellText, fontSize: Number.isInteger(v) ? fs : Math.min(fs, os * 0.3), fontWeight: isSel ? 800 : 600 }}>
                    {fmt(v)}
                  </text>
                </g>
              )
            }),
          )}
        </svg>
      </div>
      <div style={{ fontSize: 'var(--step--1)', color: 'var(--ink-2)', textAlign: 'center' }}>
        Output <code>out[{si}, {sj}]</code>: <M>{arithmetic}</M>
        <br />
        Output size: <M>{`\\lfloor (8 - ${k}) / ${s} \\rfloor + 1 = ${outN}`}</M>
      </div>
      <Controls>
        <Segmented label="Pooling" value={kind} onChange={setKind} options={[{ value: 'max', label: 'Max' }, { value: 'avg', label: 'Average' }]} />
        <Segmented label="Window" value={k} onChange={(v) => reset(v, s)} options={[{ value: 2, label: '2×2' }, { value: 3, label: '3×3' }]} />
        <Segmented label="Stride" value={s} onChange={(v) => reset(k, v)} options={[{ value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }]} />
        <Readout items={[['learnable parameters', '0'], ['values', `${N * N} → ${outN * outN}`]]} />
      </Controls>
      <PlayerControls player={player} label={() => `Window ${sel + 1} of ${outN * outN}`} />
    </Figure>
  )
}
