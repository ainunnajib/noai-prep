import { useState } from 'react'
import { Figure, Controls, Slider, Toggle, Button, Readout, useContainerWidth } from '../../../../../kit'

/*
  Centre-crop a big encoder map (H_enc x H_enc) down to the decoder's size (H_dec x H_dec).
  start = (H_enc - H_dec) // 2, slice start : start + H_dec. When the difference is odd, the extra row goes at the bottom (and the
  extra column at the right). The "d:-d" shortcut is shown for comparison: it is wrong whenever the difference is odd (one row too
  many) and returns an EMPTY slice when d = 0.
*/

export default function CenterCropper() {
  const [hEnc, setHEnc] = useState(15)
  const [hDec, setHDec] = useState(12)
  const [showBug, setShowBug] = useState(false)
  const [wrapRef, measured] = useContainerWidth<HTMLDivElement>(520)
  const W = Math.max(280, Math.min(560, measured))

  const dec = Math.min(hDec, hEnc)
  const diff = hEnc - dec
  const start = Math.floor(diff / 2)
  const end = start + dec
  const below = hEnc - end
  // the d:-d shortcut
  const d = Math.floor(diff / 2)
  const bugRows = d === 0 ? 0 : hEnc - 2 * d
  const bugOk = bugRows === dec

  // drawing
  const pad = 30
  const S = Math.min(W - pad - 14, 340)
  const ox = Math.max(pad, (W - S) / 2 + 8)
  const oy = 26
  const c = S / hEnc
  const H = oy + S + 30
  const showCells = hEnc <= 40
  const cx0 = ox + start * c
  const cw = dec * c

  const lines = []
  if (showCells)
    for (let i = 1; i < hEnc; i++) {
      lines.push(<line key={`h${i}`} x1={ox} x2={ox + S} y1={oy + i * c} y2={oy + i * c} style={{ stroke: 'var(--surface)', strokeWidth: 1 }} />)
      lines.push(<line key={`v${i}`} y1={oy} y2={oy + S} x1={ox + i * c} x2={ox + i * c} style={{ stroke: 'var(--surface)', strokeWidth: 1 }} />)
    }
  const tick = (v: number, label: string, side: 'top' | 'left', strong = false) =>
    side === 'top' ? (
      <g key={`t${label}${v}`}>
        <line x1={ox + v * c} x2={ox + v * c} y1={oy - 5} y2={oy} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.2 }} />
        <text x={ox + v * c} y={oy - 9} textAnchor="middle" style={{ fill: strong ? 'var(--accent)' : 'var(--viz-axis)', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: strong ? 700 : 400 }}>
          {label}
        </text>
      </g>
    ) : (
      <g key={`l${label}${v}`}>
        <line y1={oy + v * c} y2={oy + v * c} x1={ox - 5} x2={ox} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.2 }} />
        <text x={ox - 8} y={oy + v * c} dy="0.35em" textAnchor="end" style={{ fill: strong ? 'var(--accent)' : 'var(--viz-axis)', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: strong ? 700 : 400 }}>
          {label}
        </text>
      </g>
    )
  // tick labels: always show the crop start/end; drop 0 or H_enc when they would collide with them
  const marks: { v: number; strong: boolean }[] = []
  if (start > 0) marks.push({ v: start, strong: true })
  if (end < hEnc) marks.push({ v: end, strong: true })
  for (const v of [0, hEnc]) if (marks.every((mk) => Math.abs(mk.v - v) * c >= 24)) marks.push({ v, strong: false })
  const topTicks = marks.map((mk) => tick(mk.v, String(mk.v), 'top', mk.strong))
  const leftTicks = marks.map((mk) => tick(mk.v, String(mk.v), 'left', mk.strong))

  const code = `top  = (${hEnc} - ${dec}) // 2  = ${start}
crop = x[:, :, ${start}:${start} + ${dec}, ${start}:${start} + ${dec}]
# rows ${start} to ${end - 1}, same for columns`
  const bugCode = `x[:, :, ${d}:-${d}, ${d}:-${d}]\n# ${d === 0 ? '-0 is 0, so this is 0:0, an EMPTY slice' : `${bugRows} rows`}`

  const preset = (a: number, b: number) => {
    setHEnc(a)
    setHDec(b)
  }

  return (
    <Figure
      title="Centre-crop the skip map"
      caption={
        <>
          The grey border is thrown away and the outlined window is kept, so the crop stays centred on the same part of the image as the
          decoder map. Slide the sizes until the difference is <b>odd</b> (e.g. 15 and 12): the window cannot sit exactly in the middle, so
          integer division puts the extra row at the bottom. Switch on the <code>d:-d</code> shortcut to see it give the wrong size (or nothing
          at all when the sizes are equal).
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Encoder map ${hEnc} by ${hEnc}, cropped window rows ${start} to ${end - 1}`} style={{ display: 'block', maxWidth: W, margin: '0 auto' }}>
          {/* the whole encoder map (to be thrown away) */}
          <rect x={ox} y={oy} width={S} height={S} style={{ fill: 'color-mix(in srgb, var(--viz-muted) 30%, var(--surface))' }} />
          {/* the kept window */}
          <rect x={cx0} y={oy + start * c} width={cw} height={cw} style={{ fill: 'color-mix(in srgb, var(--viz-1) 30%, var(--surface))' }} />
          {lines}
          <rect x={ox} y={oy} width={S} height={S} style={{ fill: 'none', stroke: 'var(--viz-axis)', strokeWidth: 1.2 }} />
          <rect x={cx0} y={oy + start * c} width={cw} height={cw} style={{ fill: 'none', stroke: 'var(--viz-1)', strokeWidth: 3 }} />
          {showBug && bugRows > 0 && (
            <rect x={ox + d * c} y={oy + d * c} width={bugRows * c} height={bugRows * c} style={{ fill: 'none', stroke: bugOk ? 'var(--viz-3)' : 'var(--viz-neg)', strokeWidth: 2.5, strokeDasharray: '7 4' }} />
          )}
          {topTicks}
          {leftTicks}
          <text x={ox + S / 2} y={oy + S + 20} textAnchor="middle" style={{ fill: 'var(--viz-ink)', fontSize: 12, fontWeight: 700 }}>
            {`encoder ${hEnc}×${hEnc}  →  keep ${dec}×${dec}`}
          </text>
        </svg>
      </div>
      <pre
        style={{
          margin: 0,
          padding: '0.55rem 0.75rem',
          background: 'var(--surface-2)',
          borderRadius: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.82rem',
          lineHeight: 1.5,
          color: 'var(--ink)',
          whiteSpace: 'pre',
          overflowX: 'auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {code}
        {showBug && (
          <span style={{ color: bugOk ? 'var(--ok)' : 'var(--bad)', fontWeight: 700 }}>
            {'\n'}
            {bugCode}
            {bugOk ? ' (right size here)' : ` ≠ ${dec}: cat still fails`}
          </span>
        )}
      </pre>
      <Readout
        items={[
          ['difference', `${diff}${diff % 2 ? ' (odd)' : ''}`],
          ['cut from top', String(start)],
          ['cut from bottom', String(below)],
          ['kept rows', String(dec)],
        ]}
      />
      <Controls>
        <Slider label={<>encoder size H<sub>enc</sub></>} value={hEnc} min={4} max={130} onChange={(v) => { setHEnc(v); setHDec((h) => Math.min(h, v)) }} />
        <Slider label={<>decoder size H<sub>dec</sub></>} value={dec} min={1} max={hEnc} onChange={setHDec} />
        <Toggle label={<>compare the <code>d:-d</code> shortcut</>} checked={showBug} onChange={setShowBug} />
      </Controls>
      <Controls>
        <Button onClick={() => preset(15, 12)}>15 → 12</Button>
        <Button onClick={() => preset(25, 24)}>25 → 24 (odd pool)</Button>
        <Button onClick={() => preset(20, 16)}>20 → 16</Button>
        <Button onClick={() => preset(12, 12)}>12 → 12</Button>
        <Button onClick={() => preset(122, 114)}>122 → 114 (2026 Final)</Button>
      </Controls>
    </Figure>
  )
}
