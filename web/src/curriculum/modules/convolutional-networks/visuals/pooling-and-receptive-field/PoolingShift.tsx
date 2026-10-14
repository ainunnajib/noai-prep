import { useState } from 'react'
import { Figure, Controls, Segmented, Button, Readout, useContainerWidth } from '../../../../../kit'
import { heat, fmt, pool2d, cellText, type Kind } from './common'

/*
  Small-shift tolerance. A sparse ReLU feature map with four "detections" is shifted by whole
  pixels; 2×2 / stride-2 pooling then reports each detection only by which 2×2 block it is in.
  A 1-pixel shift that keeps a detection inside its block leaves the pooled map unchanged there.
*/

const N = 8
const SPIKES = [
  { r: 2, c: 3, v: 9 },
  { r: 3, c: 5, v: 7 },
  { r: 4, c: 2, v: 8 },
  { r: 5, c: 4, v: 6 },
]

function mapFor(dx: number, dy: number): number[][] {
  const m = Array.from({ length: N }, () => Array(N).fill(0) as number[])
  for (const p of SPIKES) m[p.r + dy][p.c + dx] = p.v
  return m
}

export default function PoolingShift() {
  const [dx, setDx] = useState(0)
  const [dy, setDy] = useState(0)
  const [kind, setKind] = useState<Kind>('max')
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(600)

  const base = mapFor(0, 0)
  const cur = mapFor(dx, dy)
  const pBase = pool2d(base, 2, 2, kind)
  const pCur = pool2d(cur, 2, 2, kind)
  const movedFeature = SPIKES.filter(() => dx !== 0 || dy !== 0).length
  const movedPooled = SPIKES.filter((p) => Math.floor((p.r + dy) / 2) !== Math.floor(p.r / 2) || Math.floor((p.c + dx) / 2) !== Math.floor(p.c / 2)).length
  const changedPooled = pCur.flat().filter((v, i) => v !== pBase.flat()[i]).length

  const narrow = width < 520
  const cs = narrow ? Math.min(38, Math.floor((width - 8) / N)) : Math.min(38, Math.floor((width - 60) / (N + 4)))
  const os = narrow ? cs * 1.5 : cs * 1.5
  const inW = N * cs
  const outW = 4 * os
  const labelH = 22
  const svgW = narrow ? Math.max(inW, outW) : inW + 50 + outW
  const inX = narrow ? (svgW - inW) / 2 : 0
  const outX = narrow ? (svgW - outW) / 2 : inW + 50
  const inY = labelH
  const outY = narrow ? inY + inW + 18 + labelH : labelH + (inW - outW) / 2
  const svgH = narrow ? outY + outW + 4 : labelH + inW + 4
  const fs = Math.max(11, Math.min(15, cs * 0.38))

  const step = (ddx: number, ddy: number) => {
    setDx((v) => Math.max(-2, Math.min(2, v + ddx)))
    setDy((v) => Math.max(-2, Math.min(2, v + ddy)))
  }

  return (
    <Figure
      title="Shift the input: what does pooling notice?"
      caption={
        <>
          A "corner detector" fired at four places (all other values are 0, as is typical after ReLU). Move the input with the arrow buttons. In the feature map every
          detection moves with it: convolution is <i>equivariant</i>. After 2×2 max pooling, a detection only changes the output when it crosses one of the thick block
          borders (changed cells get a red outline; dashed outlines mark where things were). Try one step right, then a second step right: a shift of 2 pixels moves the
          pooled map by exactly one cell.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} width={svgW} height={svgH} style={{ display: 'block', margin: '0 auto', maxWidth: '100%', height: 'auto' }} role="img" aria-label={`Feature map shifted by ${dx} right and ${dy} down, and its 2 by 2 pooled version; ${changedPooled} pooled cells changed`}>
          <text x={inX + inW / 2} y={15} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontWeight: 700, fontSize: 13 }}>
            Feature map (shifted {dx >= 0 ? '+' : '−'}{Math.abs(dx)} across, {dy >= 0 ? '+' : '−'}{Math.abs(dy)} down)
          </text>
          <text x={outX + outW / 2} y={outY - 7} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontWeight: 700, fontSize: 13 }}>
            After 2×2 {kind === 'max' ? 'max' : 'average'} pooling
          </text>
          {cur.map((row, r) =>
            row.map((v, c) => {
              const changed = v !== base[r][c]
              const wasHere = base[r][c] > 0 && changed
              return (
                <g key={`i${r}-${c}`}>
                  <rect x={inX + c * cs + 1} y={inY + r * cs + 1} width={cs - 2} height={cs - 2} rx={4} style={{ fill: heat(v, 0, 9) }} />
                  {wasHere && <rect x={inX + c * cs + 3} y={inY + r * cs + 3} width={cs - 6} height={cs - 6} rx={3} style={{ fill: 'none', stroke: 'var(--viz-muted)', strokeWidth: 1.5, strokeDasharray: '3 3' }} />}
                  {v > 0 && (
                    <text x={inX + c * cs + cs / 2} y={inY + r * cs + cs / 2} dy="0.35em" textAnchor="middle" style={{ ...cellText, fontSize: fs, fontWeight: 800 }}>
                      {v}
                    </text>
                  )}
                </g>
              )
            }),
          )}
          {/* 2×2 block borders */}
          {[0, 1, 2, 3, 4].map((q) => (
            <g key={`b${q}`}>
              <line x1={inX + q * 2 * cs} x2={inX + q * 2 * cs} y1={inY} y2={inY + inW} style={{ stroke: 'var(--viz-axis)', strokeWidth: 2 }} />
              <line y1={inY + q * 2 * cs} y2={inY + q * 2 * cs} x1={inX} x2={inX + inW} style={{ stroke: 'var(--viz-axis)', strokeWidth: 2 }} />
            </g>
          ))}
          {pCur.map((row, i) =>
            row.map((v, j) => {
              const changed = v !== pBase[i][j]
              const wasHere = pBase[i][j] > 0 && changed
              return (
                <g key={`o${i}-${j}`}>
                  <rect x={outX + j * os + 1} y={outY + i * os + 1} width={os - 2} height={os - 2} rx={5} style={{ fill: heat(v, 0, kind === 'max' ? 9 : 4.5), stroke: changed ? 'var(--viz-neg)' : 'none', strokeWidth: 3 }} />
                  {wasHere && v === 0 && <rect x={outX + j * os + 5} y={outY + i * os + 5} width={os - 10} height={os - 10} rx={3} style={{ fill: 'none', stroke: 'var(--viz-muted)', strokeWidth: 1.5, strokeDasharray: '3 3' }} />}
                  {v > 0 && (
                    <text x={outX + j * os + os / 2} y={outY + i * os + os / 2} dy="0.35em" textAnchor="middle" style={{ ...cellText, fontSize: fs, fontWeight: 800 }}>
                      {fmt(v)}
                    </text>
                  )}
                </g>
              )
            }),
          )}
        </svg>
      </div>
      <Controls>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button onClick={() => step(-1, 0)} disabled={dx <= -2}>
            ← left
          </Button>
          <Button onClick={() => step(1, 0)} disabled={dx >= 2}>
            right →
          </Button>
          <Button onClick={() => step(0, -1)} disabled={dy <= -2}>
            ↑ up
          </Button>
          <Button onClick={() => step(0, 1)} disabled={dy >= 2}>
            ↓ down
          </Button>
          <Button
            onClick={() => {
              setDx(0)
              setDy(0)
            }}
          >
            Reset
          </Button>
        </div>
        <Segmented label="Pooling" value={kind} onChange={setKind} options={[{ value: 'max', label: 'Max' }, { value: 'avg', label: 'Average' }]} />
      </Controls>
      <Readout
        items={[
          ['detections that moved in the feature map', `${movedFeature} of 4`],
          ['in the pooled map', `${movedPooled} of 4`],
        ]}
      />
    </Figure>
  )
}
