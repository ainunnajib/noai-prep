import { useState } from 'react'
import { Figure, Controls, Slider, Button, Readout, useNarrow } from '../../../../../kit'
import { CodePanel, OutBox } from '../torch-exam-patterns/code'
import { traceNet, catError } from './netShapes'
import u from './unet.module.css'

/*
  center_crop for the Task 2 network. Pick an input size; the skip map x2 (S x S) and the decoder
  map d1 (s x s) follow from the network (valid padding). The drawing shows the crop window, the
  scaffold's four TODO steps fill in with real numbers, and three implementations are compared:
  start + length (correct), the d:-d shortcut and a hard-coded slice. Sizes verified in PyTorch
  (256 -> 122/114/out 110, 128 -> 58/50/46, 42 -> 15/6/out 2).
*/

/** Python slice length for a[start:stop] on an axis of length len (start, stop >= 0 or stop < 0) */
function sliceLen(len: number, start: number, stop: number) {
  const a = Math.min(Math.max(start, 0), len)
  const b = stop < 0 ? Math.max(len + stop, 0) : Math.min(stop, len)
  return Math.max(0, b - a)
}

export default function CenterCropVisual() {
  const [n, setN] = useState(256)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)
  const t = traceNet(n, 0, 'crop')
  const S = t.x2
  const s = t.d1
  const off = Math.floor((S - s) / 2)
  const below = S - off - s
  const ok = !t.tooSmall && s >= 1

  // the three implementations
  const d = off
  const naive = d === 0 ? 0 : sliceLen(S, d, -d)
  const hard = sliceLen(S, 4, 118)
  const impls = [
    { name: 'start + length (this lesson)', code: 'layer[:, :, off_h:off_h + target_h, off_w:off_w + target_w]', rows: s },
    { name: 'the d:-d shortcut', code: 'd = (h - th) // 2;  layer[:, :, d:-d, d:-d]', rows: naive },
    { name: 'hard-coded for 256 × 256', code: 'layer[:, :, 4:118, 4:118]', rows: hard },
  ]

  // drawing
  const box = narrow ? 230 : 200
  const pad = 30
  const W = box + pad * 2
  const H = box + pad * 2
  const k = box / Math.max(S, 1)
  const showCells = S <= 32
  const x0 = pad
  const y0 = pad

  return (
    <Figure
      wide
      title="center_crop: cut the middle out of the skip map"
      caption={
        <>
          Change the input size and watch the four TODO steps fill in. The crop keeps a {s} × {s} window starting at row and column{' '}
          <b>(S − s) // 2</b>, so it works for every size. Try <b>128</b> (the grader's visible test) to see the hard-coded slice fail, and <b>42</b>, where the
          difference is odd (9), to see the <code>d:-d</code> shortcut keep one row too many.
        </>
      }
    >
      <div ref={wrapRef} className={narrow ? u.narrow : ''} style={{ width: '100%', display: 'grid', gap: '0.8rem' }}>
        <Controls>
          <Slider label="input image size" value={n} min={40} max={300} step={1} onChange={setN} format={(v) => `${v} × ${v}`} />
          <Button onClick={() => setN(256)}>256: self-check</Button>
          <Button onClick={() => setN(128)}>128: grader test</Button>
          <Button onClick={() => setN(42)}>42: odd gap</Button>
        </Controls>
        {ok && (
          <div className={u.ccGrid}>
            <div style={{ display: 'grid', justifyItems: 'center', gap: '0.3rem' }}>
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }} role="img" aria-label={`A ${S} by ${S} skip map with the central ${s} by ${s} crop window starting at offset ${off}`}>
                {/* whole skip map */}
                <rect x={x0} y={y0} width={box} height={box} style={{ fill: 'color-mix(in srgb, var(--viz-neg) 55%, var(--surface))', stroke: 'var(--viz-2)', strokeWidth: 2 }} />
                {/* crop window */}
                <rect
                  x={x0 + off * k}
                  y={y0 + off * k}
                  width={s * k}
                  height={s * k}
                  style={{ fill: 'color-mix(in srgb, var(--viz-3) 30%, var(--surface))', stroke: 'var(--viz-3)', strokeWidth: 2.5 }}
                />
                {showCells &&
                  Array.from({ length: S + 1 }).map((_, i) => (
                    <g key={i} style={{ stroke: 'var(--viz-grid)', strokeWidth: 0.8 }}>
                      <line x1={x0 + i * k} x2={x0 + i * k} y1={y0} y2={y0 + box} />
                      <line y1={y0 + i * k} y2={y0 + i * k} x1={x0} x2={x0 + box} />
                    </g>
                  ))}
                {/* labels */}
                <text x={x0 + box / 2} y={y0 - 10} textAnchor="middle" style={{ fill: 'var(--viz-2)', fontSize: 12.5, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  x2: {S} × {S}
                </text>
                <text x={x0 + (off + s / 2) * k} y={y0 + (off + s / 2) * k + 5} textAnchor="middle" style={{ fill: 'var(--viz-ink)', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {s} × {s}
                </text>
                {/* offset markers on the left edge */}
                <line x1={x0 - 8} x2={x0 - 8} y1={y0} y2={y0 + off * k} style={{ stroke: 'var(--viz-neg)', strokeWidth: 3 }} />
                <line x1={x0 - 8} x2={x0 - 8} y1={y0 + (off + s) * k} y2={y0 + box} style={{ stroke: 'var(--viz-neg)', strokeWidth: 3 }} />
                <text x={x0 - 13} y={y0 + (off * k) / 2 + 4} textAnchor="end" style={{ fill: 'var(--viz-neg)', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {off}
                </text>
                <text x={x0 - 13} y={y0 + (off + s) * k + (below * k) / 2 + 4} textAnchor="end" style={{ fill: 'var(--viz-neg)', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {below}
                </text>
                <text x={x0 + box / 2} y={y0 + box + 19} textAnchor="middle" style={{ fill: 'var(--viz-muted)', fontSize: 11.5 }}>
                  rows {off} to {off + s - 1} kept · {off} above, {below} below
                </text>
              </svg>
            </div>
            <div style={{ display: 'grid', gap: '0.55rem', minWidth: 0 }}>
              <CodePanel
                title="def center_crop(self, layer, target_shape):"
                size={narrow ? 11.5 : 12}
                lines={[
                  '_, _, h_layer, w_layer = layer.shape',
                  'target_h, target_w = target_shape[2], target_shape[3]',
                  'off_h = (h_layer - target_h) // 2',
                  'off_w = (w_layer - target_w) // 2',
                  'return layer[:, :, off_h:off_h + target_h,',
                  '                   off_w:off_w + target_w]',
                ]}
                notes={{
                  0: `# step 1: h_layer = w_layer = ${S}`,
                  1: `# step 2: target_h = target_w = ${s}`,
                  2: `# step 3: (${S} - ${s}) // 2 = ${off}`,
                  3: `#         (${S} - ${s}) // 2 = ${off}`,
                  5: `# step 4: rows ${off}:${off + s}, cols ${off}:${off + s} -> (1, 128, ${s}, ${s})`,
                }}
                tones={{ 4: 'ok', 5: 'ok' }}
              />
              <OutBox tone="ok" title="forward pass after the fix">
                {`>>> BrokenUNet()(torch.randn(1, 3, ${n}, ${n})).shape\ntorch.Size([1, 2, ${t.out}, ${t.out}])`}
              </OutBox>
            </div>
          </div>
        )}
        {ok && (
          <div className={u.impls}>
            {impls.map((im) => {
              const good = im.rows === s
              return (
                <div key={im.name} className={u.impl}>
                  <span className={u.implName}>{im.name}</span>
                  <span className={`${u.badge} ${good ? u.badgeOk : u.badgeBad}`}>{good ? 'works' : im.rows === 0 ? 'empty tensor' : 'crash'}</span>
                  <span className={u.implRes}>
                    {im.code}
                    {'  →  '}
                    {im.rows} × {im.rows}
                    {!good && im.rows > 0 && ` (needs ${s})`}
                  </span>
                  {!good && im.rows > 0 && (
                    <span className={u.implRes} style={{ color: 'var(--bad)' }}>
                      {catError(im.rows, s).replace('RuntimeError: ', 'torch.cat: ')}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
        <Readout
          items={[
            ['skip x2 (S)', `${S}`],
            ['decoder d1 (s)', `${s}`],
            ['S − s', `${S - s}${(S - s) % 2 ? ' (odd)' : ''}`],
            ['offset', `${off}`],
          ]}
        />
      </div>
    </Figure>
  )
}
