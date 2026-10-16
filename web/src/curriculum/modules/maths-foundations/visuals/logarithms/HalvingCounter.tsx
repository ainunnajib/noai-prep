import { useEffect, useState } from 'react'
import { Figure, Controls, Readout, Segmented, usePlayer, PlayerControls, useContainerWidth, M } from '../../../../../kit'

/*
  Halve n again and again until at most 1 is left. Each row is one halving, drawn to scale,
  so the HEIGHT of the staircase (the number of rows) is the logarithm: ⌈log₂ n⌉.
  This is binary search: every yes/no question throws away half of the candidates.
*/

const PRESETS = [
  { value: 16, label: '16' },
  { value: 100, label: '100' },
  { value: 1000, label: '1,000' },
  { value: 1_000_000, label: '1 million' },
]

function halvings(n: number) {
  const vals = [n]
  while (vals[vals.length - 1] > 1) vals.push(vals[vals.length - 1] / 2)
  return vals
}

function fmtVal(v: number) {
  if (v >= 1000) return v.toLocaleString('en-GB', { maximumFractionDigits: 1 })
  if (Number.isInteger(v)) return String(v)
  if (v >= 10) return v.toFixed(1)
  return v.toFixed(2)
}

export default function HalvingCounter() {
  const [n, setN] = useState(1000)
  const [draft, setDraft] = useState('1000')
  const vals = halvings(n)
  const K = vals.length - 1
  const player = usePlayer({ steps: K + 1, interval: 550 })
  const [wrapRef, w] = useContainerWidth<HTMLDivElement>(520)

  // show the finished staircase whenever n changes (complete at rest)
  useEffect(() => {
    player.setStep(K)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])

  const step = Math.min(player.step, K)
  const W = Math.max(280, Math.min(640, w))
  const rowH = K > 14 ? 17 : 21
  const left = 64
  const right = 104
  const barMax = W - left - right
  const top = 24
  const H = top + (K + 1) * rowH + 8
  const log2n = Math.log2(n)

  const applyDraft = () => {
    const v = Math.round(Number(draft))
    if (Number.isFinite(v) && v >= 2 && v <= 1e9) setN(v)
    else setDraft(String(n))
  }

  return (
    <Figure
      title="How many times can you halve it?"
      caption={
        <>
          Pick a starting number (or type your own) and press <strong>Replay</strong> (or <strong>Restart</strong>, then <strong>Next</strong>) to watch it one
          halving at a time. Each row halves the one above, drawn to scale, until at most 1
          is left. Count the rows: that count is <M>{'\\log_2 n'}</M>, rounded up. A thousand needs 10 halvings; a million needs only 20, because{' '}
          <M>{'2^{10} \\approx 1000'}</M> and <M>{'2^{20} \\approx 1{,}000{,}000'}</M>. This is binary search: each question halves the candidates.
        </>
      }
    >
      <Controls>
        <Segmented label="Start with n =" value={PRESETS.some((p) => p.value === n) ? n : -1} onChange={(v) => { setN(v); setDraft(String(v)) }} options={PRESETS} />
        <label style={{ display: 'grid', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink-2)' }}>
          or type your own
          <span style={{ display: 'flex', gap: '0.4rem' }}>
            <input
              type="number"
              min={2}
              max={1000000000}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={applyDraft}
              onKeyDown={(e) => e.key === 'Enter' && applyDraft()}
              style={{ width: '8.5rem', font: 'inherit', fontFamily: 'var(--font-mono)', padding: '0.3rem 0.5rem', borderRadius: 8, border: '1.5px solid var(--rule)', background: 'var(--surface)', color: 'var(--ink)' }}
              aria-label="Starting number n"
            />
            <button type="button" className="btn btn-small" onClick={applyDraft}>
              Use
            </button>
          </span>
        </label>
      </Controls>
      <div ref={wrapRef} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', maxWidth: W, margin: '0 auto', fontFamily: 'var(--font-body)' }} role="img" aria-label={`Halving ${n.toLocaleString('en-GB')} takes ${K} halvings to reach at most 1. Showing ${step} so far.`}>
          <text x={left - 10} y={14} textAnchor="end" style={{ fill: 'var(--ink-3)', fontSize: 12, fontWeight: 700 }}>
            halvings
          </text>
          <text x={left} y={14} style={{ fill: 'var(--ink-3)', fontSize: 12, fontWeight: 700 }}>
            what is left (to scale)
          </text>
          {vals.slice(0, step + 1).map((v, k) => {
            const y = top + k * rowH
            const bw = Math.max(2, (v / n) * barMax)
            const done = k === K
            const fill = done ? 'var(--viz-pos)' : k === step ? 'var(--viz-2)' : 'var(--viz-1)'
            return (
              <g key={k}>
                <text x={left - 10} y={y + rowH * 0.68} textAnchor="end" style={{ fill: 'var(--ink-2)', fontSize: 12, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                  {k}
                </text>
                <rect x={left} y={y + 2} width={bw} height={rowH - 5} rx={3} style={{ fill, opacity: k === step || done ? 1 : 0.55 }} />
                <text x={left + bw + 6} y={y + rowH * 0.68} style={{ fill: 'var(--viz-ink)', fontSize: 12, fontWeight: k === step ? 700 : 500, fontVariantNumeric: 'tabular-nums' }}>
                  {fmtVal(v)}
                  {done ? '  ≤ 1, stop' : ''}
                </text>
              </g>
            )
          })}
          {step >= 1 && (() => {
            const bx = W - 26
            const y1 = top + rowH + 3
            const y2 = top + step * rowH + rowH - 3
            const mid = (y1 + y2) / 2
            const text = step === K ? `${K} halvings ≈ log₂ n` : `${step} so far`
            return (
              <g aria-hidden="true">
                <path d={`M${bx - 6},${y1} L${bx},${y1} L${bx},${y2} L${bx - 6},${y2}`} style={{ fill: 'none', stroke: 'var(--viz-2)', strokeWidth: 2 }} />
                {y2 - y1 >= text.length * 6.6 && (
                  <text transform={`translate(${bx + 15},${mid}) rotate(-90)`} textAnchor="middle" style={{ fill: 'var(--viz-2)', fontSize: 12, fontWeight: 700 }}>
                    {text}
                  </text>
                )}
              </g>
            )
          })()}
        </svg>
      </div>
      <PlayerControls player={player} label={(s) => `${Math.min(s, K)} of ${K} halvings`} />
      <Readout
        items={[
          ['n', n.toLocaleString('en-GB')],
          ['halvings to reach 1 or less (log₂ n rounded up)', String(K)],
          [<M key="l">{'\\log_2 n'}</M>, log2n.toFixed(2)],
        ]}
      />
    </Figure>
  )
}
