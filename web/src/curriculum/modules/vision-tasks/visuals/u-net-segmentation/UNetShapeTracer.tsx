import { useState, type ReactNode } from 'react'
import { Figure, Controls, Slider, Segmented, Toggle, Button, useContainerWidth } from '../../../../../kit'
import { traceUNet, shp, type PadMode, type Trace } from './unetShapes'

/*
  A U-Net drawn as a U of blocks. Every block shows its (C, H, W) shape, computed with the same rules the lesson teaches:
  3x3 conv: H - 2 (valid) or H (same); 2x2 max pool: floor(H / 2); ConvTranspose2d(k=2, s=2): 2H; cat along channels.
  When a skip map and the upsampled map disagree in H, torch.cat would crash: that level turns red and later blocks fade.
*/

const MONO = 'var(--font-mono)'

/** Polyline through points with a filled arrowhead at the last point. */
function Arrow({ pts, color = 'var(--viz-axis)', dash, width = 1.6 }: { pts: [number, number][]; color?: string; dash?: string; width?: number }) {
  const [x1, y1] = pts[pts.length - 1]
  const [x0, y0] = pts[pts.length - 2]
  const len = Math.hypot(x1 - x0, y1 - y0) || 1
  const ux = (x1 - x0) / len
  const uy = (y1 - y0) / len
  const hl = 7
  const bx = x1 - ux * hl
  const by = y1 - uy * hl
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('')
  return (
    <g>
      <path d={d} style={{ fill: 'none', stroke: color, strokeWidth: width, strokeDasharray: dash }} />
      <path d={`M${x1},${y1}L${bx - uy * 4},${by + ux * 4}L${bx + uy * 4},${by - ux * 4}Z`} style={{ fill: color }} />
    </g>
  )
}

function Block({
  x,
  y,
  w,
  h,
  tint,
  lines,
  bar,
  state = 'ok',
  fs = 11,
}: {
  fs?: number
  x: number
  y: number
  w: number
  h: number
  tint: string
  lines: ReactNode[]
  bar: number
  state?: 'ok' | 'bad' | 'off'
}) {
  const stroke = state === 'bad' ? 'var(--viz-neg)' : `color-mix(in srgb, ${tint} 70%, var(--viz-axis))`
  const fill = state === 'bad' ? 'color-mix(in srgb, var(--viz-neg) 16%, var(--surface))' : `color-mix(in srgb, ${tint} 12%, var(--surface))`
  return (
    <g style={{ opacity: state === 'off' ? 0.35 : 1 }}>
      <rect x={x} y={y} width={w} height={h} rx={7} style={{ fill, stroke, strokeWidth: state === 'bad' ? 2.2 : 1.4 }} />
      {lines.map((l, i) => (
        <text key={i} x={x + 6} y={y + 15 + i * 14.5} style={{ fill: i === 0 ? 'var(--viz-ink)' : 'var(--ink-2)', fontSize: fs, fontFamily: MONO, fontWeight: i === 0 ? 700 : 400 }}>
          {l}
        </text>
      ))}
      {/* resolution bar: width proportional to H relative to the input */}
      <rect x={x + 7} y={y + h - 7} width={Math.max(2, (w - 14) * Math.min(1, bar))} height={3} rx={1.5} style={{ fill: state === 'bad' ? 'var(--viz-neg)' : tint, opacity: 0.85 }} />
    </g>
  )
}

function statusText(t: Trace, n: number, pad: PadMode, depth: number): { ok: boolean; text: ReactNode } {
  const m = 2 ** depth
  if (t.error?.kind === 'mismatch') {
    const lvl = t.error.level + 1
    const why =
      pad === 'valid'
        ? 'the valid convolutions below this level (deeper encoder, bottleneck and decoder convolutions) shrank the map that comes back up, so the upsampled map is smaller than this skip map.'
        : `pooling rounded an odd size down somewhere above this level, and doubling cannot get the lost pixel back.`
    return {
      ok: false,
      text: (
        <>
          <b>torch.cat crashes at level {lvl}</b>: the skip map is {t.error.skipH}×{t.error.skipH} but the upsampled map is {t.error.upH}×{t.error.upH}. The
          cause: {why} Turn on <b>centre crop</b>
          {pad === 'same' ? <>, or choose an input size divisible by {m}</> : null}.
        </>
      ),
    }
  }
  if (t.error?.kind === 'too-small') return { ok: false, text: <>The input is too small: the map shrinks to nothing at {t.error.where}. Make the input bigger.</> }
  const o = t.out!
  return {
    ok: true,
    text: (
      <>
        Output {shp(o.c, o.h)}: 2 class scores for each of {o.h}×{o.h} pixels
        {o.h === n ? <> (the same size as the input).</> : <> from a {n}×{n} input, so the label masks must be centre-cropped to {o.h}×{o.h} as well.</>}
      </>
    ),
  }
}

export default function UNetShapeTracer() {
  const [n, setN] = useState(128)
  const [depth, setDepth] = useState(3)
  const [pad, setPad] = useState<PadMode>('same')
  const [skips, setSkips] = useState(true)
  const [crop, setCrop] = useState(false)
  const [wrapRef, measured] = useContainerWidth<HTMLDivElement>(640)
  const W = Math.max(300, Math.min(700, measured))

  const t = traceUNet(n, depth, pad, skips, crop)
  const status = statusText(t, n, pad, depth)

  // layout
  const m = 2
  const ind = Math.min(16, W * 0.028)
  const minGap = W < 420 ? 32 : 40
  const bw = Math.min(190, (W - 2 * m - minGap - 2 * (depth - 1) * ind) / 2)
  const bh = 56
  const compact = bw < 165
  const ar = compact ? ' ' : ' → '
  const errLevel = t.error?.kind === 'mismatch' ? t.error.level : -1
  const decByLevel = new Map(t.dec.map((d) => [d.level, d]))
  const reachedOut = !!t.out

  // every block's text lines, worked out first so the font can be as large as the widest line allows
  const encLines = Array.from({ length: depth }, (_, i) => {
    const e = t.enc[i]
    return [`enc ${i + 1}: 2 convs`, e ? shp(e.c, e.h) : '—', e ? `pool${ar}${e.pooled}×${e.pooled}` : '']
  })
  const bottLines = ['bottleneck', t.bott ? shp(t.bott.c, t.bott.h) : '—', compact ? 'smallest' : 'smallest map']
  const decLines = Array.from({ length: depth }, (_, i) => {
    const d = decByLevel.get(i)
    const bad = errLevel === i
    return d
      ? [
          `up${ar}${shp(d.upC, d.upH)}`,
          skips ? (bad ? `cat ✗ ${d.skipH} vs ${d.upH}` : `cat${ar}${shp(d.catC, d.catH)}`) : 'no skip: no cat',
          bad ? 'crash' : `conv${ar}${shp(d.outC, d.outH)}`,
        ]
      : [`dec ${i + 1}`, '—', '']
  })
  const longest = Math.max(...[...encLines, bottLines, ...decLines].flat().map((l) => l.length))
  // monospace glyphs are about 0.6 em wide; keep at least 11 px and at most 12 px
  const fs = Math.max(11, Math.min(12, (bw - 10) / (longest * 0.6)))
  const rowH = bh + 24
  const top = 34
  const encX = (i: number) => m + i * ind
  const decX = (i: number) => W - m - bw - i * ind
  const rowY = (i: number) => top + i * rowH
  const H = top + depth * rowH + bh + 10
  const bx = W / 2 - bw / 2
  const by = rowY(depth)

  const isFinal = n === 256 && depth === 2 && pad === 'valid' && skips

  const preset = (pn: number, pd: number, pp: PadMode, pc: boolean) => {
    setN(pn)
    setDepth(pd)
    setPad(pp)
    setCrop(pc)
    setSkips(true)
  }

  return (
    <Figure
      title="Trace every shape through a U-Net"
      caption={
        <>
          Each block shows <b>channels × height × width</b>; the thin bar under it shows the height compared with the input. Start with 128 and
          same padding: every skip map matches. Now press <b>100, same</b>: pooling floors 25 to 12, the decoder doubles it to 24, and
          concatenating with the 25×25 skip map crashes. Turn on <b>centre crop</b> to fix it. Then try <b>valid</b> padding, where every
          level needs a crop, or load the original paper's 572 → 388.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`U-Net shape trace for a ${n} by ${n} input. ${typeof status.text === 'string' ? status.text : ''}`} style={{ display: 'block', maxWidth: W, margin: '0 auto' }}>

          {/* input and output labels */}
          <text x={encX(0) + 2} y={14} style={{ fill: 'var(--viz-ink)', fontSize: 11.5, fontFamily: MONO, fontWeight: 700 }}>
            input 3×{n}×{n}
          </text>
          <Arrow pts={[[encX(0) + 18, 19], [encX(0) + 18, rowY(0) - 2]]} />
          <text x={decX(0) + bw - 2} y={14} textAnchor="end" style={{ fill: reachedOut ? 'var(--viz-ink)' : 'var(--viz-muted)', fontSize: 11.5, fontFamily: MONO, fontWeight: 700 }}>
            {reachedOut ? `output ${shp(t.out!.c, t.out!.h)}` : 'output: not reached'}
          </text>
          <Arrow pts={[[decX(0) + bw - 18, rowY(0) - 2], [decX(0) + bw - 18, 19]]} color={reachedOut ? 'var(--viz-axis)' : 'var(--viz-muted)'} />

          {/* encoder */}
          {Array.from({ length: depth }, (_, i) => {
            const e = t.enc[i]
            const x = encX(i)
            const y = rowY(i)
            const nextX = i + 1 < depth ? encX(i + 1) : null
            return (
              <g key={`e${i}`}>
                <Block
                  x={x}
                  y={y}
                  w={bw}
                  h={bh}
                  tint="var(--viz-1)"
                  state={e ? 'ok' : 'off'}
                  bar={e ? e.h / n : 0}
                  fs={fs}
                  lines={encLines[i]}
                />
                {nextX !== null && <Arrow pts={[[x + 18, y + bh], [x + 18, rowY(i + 1) - 2]]} color={t.enc[i + 1] ? 'var(--viz-axis)' : 'var(--viz-muted)'} />}
              </g>
            )
          })}
          {/* down into the bottleneck */}
          <Arrow pts={[[encX(depth - 1) + 18, rowY(depth - 1) + bh], [encX(depth - 1) + 18, by + bh / 2], [bx - 2, by + bh / 2]]} color={t.bott ? 'var(--viz-axis)' : 'var(--viz-muted)'} />
          <Block
            x={bx}
            y={by}
            w={bw}
            h={bh}
            tint="var(--viz-5)"
            fs={fs}
            state={t.bott ? 'ok' : 'off'}
            bar={t.bott ? t.bott.h / n : 0}
            lines={bottLines}
          />
          {/* up out of the bottleneck */}
          <Arrow
            pts={[[bx + bw, by + bh / 2], [decX(depth - 1) + bw - 18, by + bh / 2], [decX(depth - 1) + bw - 18, rowY(depth - 1) + bh + 2]]}
            color={t.dec.length ? 'var(--viz-axis)' : 'var(--viz-muted)'}
          />

          {/* decoder + skips */}
          {Array.from({ length: depth }, (_, i) => {
            const d = decByLevel.get(i)
            const x = decX(i)
            const y = rowY(i)
            const bad = errLevel === i
            const off = !d
            const e = t.enc[i]
            const joinWord = !skips ? '' : bad ? '✗' : d?.join === 'crop' ? 'crop' : d?.join === 'copy' ? 'copy' : ''
            const skipColor = bad ? 'var(--viz-neg)' : d?.join === 'crop' ? 'var(--viz-2)' : off ? 'var(--viz-muted)' : 'var(--viz-3)'
            const lines: ReactNode[] = decLines[i]
            const gx0 = encX(i) + bw
            const gx1 = x
            return (
              <g key={`d${i}`}>
                {skips && e && (
                  <g>
                    <Arrow pts={[[gx0 + 2, y + bh / 2], [gx1 - 2, y + bh / 2]]} color={skipColor} dash={d?.join === 'crop' ? '5 3' : undefined} width={bad ? 2.4 : 1.8} />
                    <text x={(gx0 + gx1) / 2} y={y + bh / 2 - 6} textAnchor="middle" style={{ fill: skipColor, fontSize: 10.5, fontFamily: MONO, fontWeight: 700 }}>
                      {joinWord}
                    </text>
                  </g>
                )}
                <Block fs={fs} x={x} y={y} w={bw} h={bh} tint="var(--viz-2)" state={bad ? 'bad' : off ? 'off' : 'ok'} bar={d ? d.outH / n : 0} lines={lines} />
                {i > 0 && <Arrow pts={[[decX(i) + bw - 18, y], [decX(i - 1) + bw - 18, rowY(i - 1) + bh + 2]]} color={decByLevel.get(i - 1) ? 'var(--viz-axis)' : 'var(--viz-muted)'} />}
              </g>
            )
          })}
        </svg>
      </div>
      <div
        role="status"
        style={{
          width: '100%',
          padding: '0.55rem 0.75rem',
          borderRadius: 8,
          fontSize: '0.9rem',
          background: status.ok ? 'var(--ok-soft)' : 'var(--bad-soft)',
          color: 'var(--ink)',
          borderLeft: `4px solid ${status.ok ? 'var(--ok)' : 'var(--bad)'}`,
          boxSizing: 'border-box',
        }}
      >
        {status.text}
        {isFinal && (
          <div style={{ marginTop: 4, color: 'var(--ink-2)', fontSize: '0.85rem' }}>
            The 2026 Final&rsquo;s network stops after one decoder level (it has no skip from the top level), so with the crop its output is 2×110×110.
          </div>
        )}
      </div>
      <Controls>
        <Slider label="input size H = W" value={n} min={16} max={600} step={1} onChange={setN} />
        <Segmented
          label="pooling steps"
          value={depth}
          onChange={setDepth}
          options={[
            { value: 2, label: '2' },
            { value: 3, label: '3' },
            { value: 4, label: '4' },
          ]}
        />
        <Segmented
          label="3×3 conv padding"
          value={pad}
          onChange={setPad}
          options={[
            { value: 'same', label: 'same (p = 1)' },
            { value: 'valid', label: 'valid (p = 0)' },
          ]}
        />
        <Toggle label="skip connections" checked={skips} onChange={setSkips} />
        <Toggle label="centre crop the skip maps" checked={crop} onChange={setCrop} />
      </Controls>
      <Controls>
        <Button onClick={() => preset(128, 3, 'same', false)}>128, same</Button>
        <Button onClick={() => preset(100, 3, 'same', false)}>100, same (odd sizes)</Button>
        <Button onClick={() => preset(256, 2, 'valid', false)}>256, valid (the 2026 Final&rsquo;s crash)</Button>
        <Button onClick={() => preset(572, 4, 'valid', true)}>572, valid (2015 paper)</Button>
      </Controls>
    </Figure>
  )
}
