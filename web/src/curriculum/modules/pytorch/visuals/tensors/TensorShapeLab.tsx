import { useState } from 'react'
import { Figure, Controls, Segmented, Toggle, Button, Readout, useContainerWidth } from '../../../../../kit'
import { applyOp, argChoices, contiguousStrides, isContiguous, storagePos, shapeText, type Op, type TState } from './strided'
import { layoutTensor } from './blocks'
import css from './tensors.module.css'

/*
  Shape surgery on a tiny 4 x 5 photo with 3 colour channels, stored (H, W, C) the way image
  libraries load it. Every button runs a real PyTorch shape operation (through a faithful model of
  storage + strides), and the 60 coloured cells glide to their new places. Goal: build the
  (N, C, H, W) batch that PyTorch layers expect.
*/

const H = 4
const W = 5
const C = 3

// The photo: sky, sun, a little red-roofed house and grass. Values are channel intensities 0..1.
const S: [number, number, number] = [0.35, 0.65, 0.95]
const Y: [number, number, number] = [1, 0.85, 0.15]
const R: [number, number, number] = [0.85, 0.2, 0.15]
const Wl: [number, number, number] = [0.95, 0.9, 0.75]
const D: [number, number, number] = [0.45, 0.25, 0.1]
const G: [number, number, number] = [0.2, 0.7, 0.25]
const PHOTO = [
  [S, S, S, S, Y],
  [S, R, R, R, S],
  [S, Wl, D, Wl, S],
  [G, G, G, G, G],
]

const CH_COLOUR = ['var(--viz-neg)', 'var(--viz-pos)', 'var(--viz-1)']
const CH_NAME = ['R', 'G', 'B']

// element id = position in the original (H, W, C) memory strip
const decode = (id: number) => ({ h: Math.floor(id / (W * C)), w: Math.floor(id / C) % W, c: id % C })

const AXIS_COLOUR: Record<string, string> = { H: 'var(--viz-5)', W: 'var(--viz-6)', C: 'var(--viz-2)', '1': 'var(--viz-4)' }
const axisColour = (name: string) => AXIS_COLOUR[name] ?? 'var(--viz-3)'

const START: TState = {
  shape: [H, W, C],
  strides: contiguousStrides([H, W, C]),
  storage: Array.from({ length: H * W * C }, (_, i) => i),
  names: ['H', 'W', 'C'],
  axisIds: [1, 2, 3],
}

const OPS: Op[] = ['permute', 'unsqueeze', 'squeeze', 'transpose', 'flatten', 'view', 'reshape', 'contiguous']

interface Entry {
  state: TState
  line: string
}

const pad = (s: string, n: number) => (s.length >= n ? s + ' ' : s + ' '.repeat(n - s.length))

export default function TensorShapeLab() {
  const [hist, setHist] = useState<Entry[]>([{ state: START, line: 'x = img' }])
  const [op, setOp] = useState<Op>('permute')
  const [error, setError] = useState<{ line: string; msg: string } | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [showMem, setShowMem] = useState(false)
  const [ref, cw] = useContainerWidth<HTMLDivElement>(560)
  const avail = Math.max(260, Math.min(620, cw))

  const t = hist[hist.length - 1].state
  const d = t.shape.length
  const n = H * W * C
  const contiguous = isContiguous(t.shape, t.strides)
  const done = t.shape.join(',') === '1,3,4,5' && t.names.join(',') === '1,C,H,W'
  const scrambled = t.names.includes('?')

  const lay = layoutTensor(t.shape, avail, {
    maxCell: 26,
    minCell: 13,
    sheetLabel: (_, j) => (/^[A-Z]$/.test(t.names[d - 3]) ? `${t.names[d - 3]}=${j}` : `[${j}]`),
    groupLabel: (g) => (/^[A-Z]$/.test(t.names[d - 4]) ? `${t.names[d - 4]}=${g}` : `x[${g}]`),
  })

  const apply = (o: Op, dims: number[], label: string) => {
    const r = applyOp(t, o, dims)
    const line = `x = x.${o}(${label})`
    if (r.error) {
      setError({ line, msg: r.error })
      setNote(null)
      return
    }
    setError(null)
    setNote(r.note ?? null)
    setHist((h) => [...h, { state: r.state!, line }])
  }
  const undo = () => {
    setError(null)
    setNote(null)
    setHist((h) => (h.length > 1 ? h.slice(0, -1) : h))
  }
  const reset = () => {
    setError(null)
    setNote(null)
    setHist([{ state: START, line: 'x = img' }])
  }

  const choices = argChoices(op, t.shape)
  const width = Math.max(...hist.map((e) => e.line.length)) + 2
  const codeText = hist.map((e) => `${pad(e.line, width)}# ${shapeText(e.state.shape)}  ${e.state.names.join(', ')}`).join('\n')

  const legend: [string, string][] = []
  if (d >= 1) legend.push(['along each row of cells', t.names[d - 1]])
  if (d >= 2) legend.push(['down the rows', t.names[d - 2]])
  if (d >= 3) legend.push(['from sheet to sheet', t.names[d - 3]])
  if (d >= 4) legend.push(['from box to box', t.names[d - 4]])

  return (
    <Figure
      wide
      title="Shape surgery lab: from a photo to a batch"
      caption={
        <>
          The photo is 4 pixels tall and 5 wide with 3 colour channels, loaded as <code>(H, W, C)</code>: each row of cells is one pixel's R, G, B
          values. Apply operations to reach <code>(N, C, H, W) = (1, 3, 4, 5)</code>. Watch the cells: <code>permute</code> moves whole axes, so after{' '}
          <code>permute(2, 0, 1)</code> each sheet is one colour plane and the picture appears. Then try <code>view(-1)</code>, and switch on memory order
          to see why it fails while <code>reshape(-1)</code> works.
        </>
      }
    >
      <div className={`${css.goal} ${done ? css.goalDone : ''}`} aria-live="polite">
        <Photo />
        <span>
          {done ? (
            <>
              <b>Done:</b> <code>(1, 3, 4, 5)</code> is a batch of one image in <code>(N, C, H, W)</code> order, ready for <code>nn.Conv2d</code>.
            </>
          ) : scrambled ? (
            <>This shape no longer lines up with H, W and C (marked <b>?</b>). Undo or reset.</>
          ) : (
            <>
              <b>Goal:</b> reach <code>(1, 3, 4, 5)</code> with axes <code>N, C, H, W</code>. Two moves are enough.
            </>
          )}
        </span>
      </div>

      <div className={css.chips} aria-label={`x.shape is ${shapeText(t.shape)}`}>
        <span className={css.mono} style={{ fontWeight: 700, color: 'var(--ink-2)', marginRight: 2, fontSize: '0.85rem' }}>
          x.shape =
        </span>
        <span className={css.paren}>(</span>
        {t.shape.map((s, i) => (
          <span key={t.axisIds[i]} className={css.chip} style={{ color: axisColour(t.names[i]) }}>
            <span className={css.chipNum}>{s}</span>
            <span className={css.chipName}>{t.names[i] === '1' ? 'new' : t.names[i]}</span>
          </span>
        ))}
        <span className={css.paren}>)</span>
      </div>

      <div ref={ref} style={{ width: '100%' }}>
        <div className={css.stage} style={{ height: lay.height, maxWidth: avail, margin: '0 auto' }} role="img" aria-label={`The ${n} numbers of x drawn as coloured cells in shape ${shapeText(t.shape)}`}>
          {lay.frames.map((f, g) => (
            <div key={`f${g}`} className={css.frame} style={{ left: f.x, top: f.y, width: f.w, height: f.h, borderColor: axisColour(t.names[d - 4]) }}>
              <span className={css.frameLabel} style={{ color: axisColour(t.names[d - 4]) }}>
                {f.label}
              </span>
            </div>
          ))}
          {lay.sheetLabels.map((l, j) => (
            <span key={`s${j}`} className={css.sheetLabel} style={{ transform: `translate(${l.x}px, ${l.y}px)`, color: axisColour(t.names[d - 3]) }}>
              {l.text}
            </span>
          ))}
          {Array.from({ length: n }, (_, k) => {
            const p = storagePos(t, k)
            const id = t.storage[p]
            const { h, w, c } = decode(id)
            const v = PHOTO[h][w][c]
            const box = lay.cells[k]
            return (
              <div
                key={id}
                className={css.cell}
                title={`pixel (h=${h}, w=${w}), channel ${CH_NAME[c]}`}
                style={{
                  width: box.w,
                  height: box.h,
                  transform: `translate(${box.x}px, ${box.y}px)`,
                  background: `color-mix(in srgb, ${CH_COLOUR[c]} ${Math.round(12 + v * 78)}%, var(--surface))`,
                  border: box.w >= 8 ? `1.5px solid ${CH_COLOUR[c]}` : 'none',
                  borderRadius: box.w >= 8 ? 4 : 1,
                  fontSize: Math.max(8, Math.min(11, box.w * 0.45)),
                  color: v > 0.6 ? 'var(--surface)' : 'var(--ink)',
                }}
              >
                {showMem && box.w >= 15 ? p : ''}
              </div>
            )
          })}
        </div>
      </div>

      <div className={css.legend}>
        {legend.map(([where, name]) => (
          <span key={where}>
            {where}: <b style={{ color: axisColour(name) }}>{name === '1' ? 'new axis' : name}</b>
          </span>
        ))}
        <span>
          channels: <b style={{ color: 'var(--viz-neg)' }}>R</b> <b style={{ color: 'var(--viz-pos)' }}>G</b> <b style={{ color: 'var(--viz-1)' }}>B</b>
        </span>
      </div>

      <Controls>
        <Segmented label="Operation" value={op} onChange={setOp} options={OPS.map((o) => ({ value: o, label: <span className={css.mono}>{o}</span> }))} />
      </Controls>
      <div className={css.row}>
        {choices.length === 0 ? (
          <span className={css.note}>This lab stops at 4 axes. Squeeze or flatten first.</span>
        ) : (
          <>
            <span className={css.mono} style={{ fontWeight: 700, color: 'var(--ink-2)' }}>
              x = x.{op}
            </span>
            {choices.map((a) => (
              <Button key={a.label} onClick={() => apply(op, a.dims, a.label)}>
                <span className={css.mono} aria-label={`.${op}(${a.label})`}>
                  ({a.label})
                </span>
              </Button>
            ))}
          </>
        )}
      </div>
      <div className={css.row}>
        <Button onClick={undo} disabled={hist.length <= 1}>
          Undo
        </Button>
        <Button onClick={reset}>Reset</Button>
        <Toggle label="number cells by memory order" checked={showMem} onChange={setShowMem} />
      </div>

      <pre className={css.code}>{codeText}</pre>
      {error && (
        <div className={css.error} role="alert">
          {error.line}
          <br />
          {error.msg}
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--ink-2)', marginTop: 4 }}>
            The tensor was not changed. Switch on memory order: the numbers are no longer stored in reading order, so <code>view</code> cannot simply
            relabel them. Use <code>.reshape(…)</code>, or <code>.contiguous()</code> first.
          </div>
        </div>
      )}
      {note && !error && <div className={css.note}>{note}</div>}
      <Readout
        items={[
          ['x.is_contiguous()', contiguous ? 'True' : 'False'],
          ['x.stride()', shapeText(t.strides)],
          ['x.numel()', String(n)],
        ]}
      />
    </Figure>
  )
}

/** The photo itself (image data, so these are the picture's real colours, not theme colours). */
function Photo() {
  const s = 12
  return (
    <svg width={W * s + 2} height={H * s + 2} role="img" aria-label="The 4 by 5 pixel photo: sky, sun, a red-roofed house and grass" style={{ flex: 'none', borderRadius: 3 }}>
      {PHOTO.map((row, h) =>
        row.map((px, w) => (
          <rect
            key={`${h}-${w}`}
            x={1 + w * s}
            y={1 + h * s}
            width={s}
            height={s}
            style={{ fill: `rgb(${Math.round(px[0] * 255)}, ${Math.round(px[1] * 255)}, ${Math.round(px[2] * 255)})` }}
          />
        )),
      )}
    </svg>
  )
}
