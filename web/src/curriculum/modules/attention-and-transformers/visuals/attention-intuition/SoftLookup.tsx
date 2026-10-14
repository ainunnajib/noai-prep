import { Fragment, useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Plot, Axes, Arrow, DraggablePoint, usePlot, useNarrow } from '../../../../../kit'
import { type V2, dot, softmax, hardmax, blendColours, fmtExp, sgn } from './attn'
import s from './lookup.module.css'

/*
  Attention as a soft dictionary lookup, in 2-D.
  Four keys (arrows) each carry a value, drawn as a paint colour. The learner drags the query q.
  Scores q·k_i -> softmax -> weights -> output = weighted average of the value colours.
  The background shows the output colour for EVERY possible query position, so the difference
  between a soft lookup (smooth field) and a hard lookup (sharp patchwork) is visible at a glance.
*/

const PALETTE = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)', 'var(--viz-5)', 'var(--viz-6)']
const PALETTE_NAMES = ['indigo', 'orange', 'green', 'pink', 'purple', 'olive']
const SUB = ['₁', '₂', '₃', '₄']
const INIT_KEYS: V2[] = [
  [2, 0.5],
  [0.5, 2],
  [-2, 0.5],
  [-0.5, -2],
]
const INIT_COLS = [1, 2, 3, 4]
const LIM = 3
const snap = (v: number) => Math.round(v * 10) / 10

type Mode = 'soft' | 'hard'

/** The output colour for every query position on a grid of cells. */
function Field({ keys, colours, mode }: { keys: V2[]; colours: string[]; mode: Mode }) {
  const { xs, ys } = usePlot()
  const n = 34
  const h = (2 * LIM) / n
  const cells = useMemo(() => {
    const out: { x: number; y: number; w: number; hgt: number; fill: string }[] = []
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const qx = -LIM + (i + 0.5) * h
        const qy = -LIM + (j + 0.5) * h
        const sc = keys.map((k) => dot([qx, qy], k))
        const w = mode === 'soft' ? softmax(sc) : hardmax(sc)
        const x0 = xs(-LIM + i * h)
        const x1 = xs(-LIM + (i + 1) * h)
        const y0 = ys(-LIM + (j + 1) * h)
        const y1 = ys(-LIM + j * h)
        out.push({ x: x0, y: y0, w: x1 - x0 + 0.6, hgt: y1 - y0 + 0.6, fill: `color-mix(in srgb, ${blendColours(colours, w)} 38%, var(--surface))` })
      }
    }
    return out
  }, [keys, colours, mode, xs, ys, h])
  return (
    <g aria-hidden="true">
      {cells.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width={c.w} height={c.hgt} style={{ fill: c.fill }} />
      ))}
    </g>
  )
}

export default function SoftLookup() {
  const [q, setQ] = useState<V2>([1.5, 0.8])
  const [keys, setKeys] = useState<V2[]>(INIT_KEYS)
  const [cols, setCols] = useState<number[]>(INIT_COLS)
  const [mode, setMode] = useState<Mode>('soft')
  const [showField, setShowField] = useState(true)
  const [ref, narrow] = useNarrow<HTMLDivElement>(640)

  const colours = cols.map((c) => PALETTE[c])
  const scores = keys.map((k) => dot(q, k))
  const soft = softmax(scores)
  const hard = hardmax(scores)
  const w = mode === 'soft' ? soft : hard
  const qLen = Math.hypot(q[0], q[1])
  const best = hard.indexOf(1)
  const softColour = blendColours(colours, soft)
  const hardColour = colours[best]

  const setKey = (i: number, x: number, y: number) => setKeys((ks) => ks.map((k, j) => (j === i ? [snap(x), snap(y)] : k)))
  const cycle = (i: number) => setCols((cs) => cs.map((c, j) => (j === i ? (c + 1) % PALETTE.length : c)))
  const setLength = (L: number) => {
    const len = qLen < 1e-6 ? 1 : qLen
    const ux = qLen < 1e-6 ? 1 : q[0] / len
    const uy = qLen < 1e-6 ? 0 : q[1] / len
    const clamp = (v: number) => Math.max(-LIM, Math.min(LIM, v))
    setQ([snap(clamp(ux * L)), snap(clamp(uy * L))])
  }

  const tableCols = 'auto auto auto auto minmax(2rem, 1fr) auto'

  return (
    <Figure
      wide
      title="Attention as a soft lookup: drag the query"
      caption={
        <>
          Each key <b>k</b> is a label; the colour it carries is its <b>value</b>. Drag the black query <b>q</b>: every key gets a score{' '}
          <b>q·k</b> (a dot product), softmax turns the scores into weights that add up to 1, and the output is the weights' mix of the value colours.
          Drag <b>q</b> further from the centre and the scores grow, so the weights become sharper. The background paints the output for every place
          you could put <b>q</b>: switch to <b>hard lookup</b> and it becomes a patchwork with sudden jumps, while the soft lookup changes smoothly. You
          can also drag the key tips and tap a colour to change a value.
        </>
      }
    >
      <div ref={ref} className={`${s.wrap} ${narrow ? '' : s.wrapWide}`}>
        <Plot x={[-LIM, LIM]} y={[-LIM, LIM]} width={360} height={360} margin={{ top: 10, right: 10, bottom: 10, left: 10 }} ariaLabel="A query arrow and four key arrows in a plane, with the output colour of the lookup painted in the background">
          {showField && <Field keys={keys} colours={colours} mode={mode} />}
          <Axes origin hideXTicks hideYTicks />
          {keys.map((k, i) => (
            <Arrow key={`k${i}`} from={[0, 0]} to={k} color={colours[i]} width={w[i] > 0.5 ? 4 : 2.5} label={`k${SUB[i]}`} labelOffset={[k[0] >= 0 ? 8 : -26, k[1] >= 0 ? -6 : 16]} />
          ))}
          <Arrow from={[0, 0]} to={q} color="var(--viz-ink)" width={3.5} label="q" labelOffset={[8, -8]} />
          {keys.map((k, i) => (
            <DraggablePoint key={`d${i}`} x={k[0]} y={k[1]} r={6} color={colours[i]} onChange={(x, y) => setKey(i, x, y)} />
          ))}
          <DraggablePoint x={q[0]} y={q[1]} r={9} color="var(--viz-ink)" onChange={(x, y) => setQ([snap(x), snap(y)])} label="" />
        </Plot>

        <div style={{ display: 'grid', gap: '0.9rem', minWidth: 0 }}>
          <div className={s.table} style={{ gridTemplateColumns: tableCols }} role="table" aria-label="Scores, exponentials and weights for each key">
            <span className={s.th}>key</span>
            <span className={s.th}>value</span>
            <span className={s.th} style={{ textAlign: 'right' }}>
              score q·k
            </span>
            <span className={s.th} style={{ textAlign: 'right' }}>
              e<sup>score</sup>
            </span>
            <span className={s.th}>weight</span>
            <span />
            {keys.map((k, i) => (
              <Fragment key={i}>
                <span className={s.keyCell}>
                  <span className={s.name} style={{ color: colours[i] }}>
                    k{SUB[i]}
                  </span>
                  <span className={s.vec}>
                    [{sgn(k[0], 1)}, {sgn(k[1], 1)}]
                  </span>
                </span>
                <button
                  type="button"
                  className={s.swatchBtn}
                  style={{ background: colours[i] }}
                  onClick={() => cycle(i)}
                  aria-label={`Value of key ${i + 1} is ${PALETTE_NAMES[cols[i]]}. Tap to change it.`}
                  title="Tap to change this value"
                />
                <span className={s.num}>{sgn(scores[i])}</span>
                <span className={s.num}>{mode === 'soft' ? fmtExp(Math.exp(scores[i])) : '–'}</span>
                <span className={s.barTrack}>
                  <span className={s.barFill} style={{ width: `${w[i] * 100}%`, background: colours[i] }} />
                </span>
                <span className={s.num} style={{ fontWeight: w[i] > 0.5 ? 800 : 500 }}>
                  {w[i].toFixed(3)}
                </span>
              </Fragment>
            ))}
            <span className={`${s.th} ${s.sumRow}`} style={{ gridColumn: '1 / span 5' }}>
              {mode === 'soft' ? 'weights = e^score ÷ total, so they add up to' : 'hard lookup: 1 for the best key, 0 for the others; total'}
            </span>
            <span className={`${s.num} ${s.sumRow}`}>{w.reduce((a, b) => a + b, 0).toFixed(3)}</span>
          </div>

          <div className={s.outs}>
            <div className={`${s.out} ${mode === 'soft' ? s.outActive : ''}`}>
              <span className={s.bigSwatch} style={{ background: softColour }} />
              <span className={s.outTitle}>soft: attention</span>
              <span className={s.outNote}>a mix of all the values</span>
            </div>
            <div className={`${s.out} ${mode === 'hard' ? s.outActive : ''}`}>
              <span className={s.bigSwatch} style={{ background: hardColour }} />
              <span className={s.outTitle}>hard: dictionary</span>
              <span className={s.outNote}>only the best key's value</span>
            </div>
          </div>
        </div>
      </div>

      <Controls>
        <Slider label="query length |q| (sharpness)" value={Number(qLen.toFixed(1))} min={0} max={4.2} step={0.1} onChange={setLength} format={(v) => v.toFixed(1)} />
        <Segmented
          label="lookup"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'soft', label: 'soft (softmax)' },
            { value: 'hard', label: 'hard (best match)' },
          ]}
        />
        <Toggle label="paint the output everywhere" checked={showField} onChange={setShowField} />
        <Readout
          items={[
            ['q', `[${sgn(q[0], 1)}, ${sgn(q[1], 1)}]`],
            ['largest weight', Math.max(...w).toFixed(3)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
