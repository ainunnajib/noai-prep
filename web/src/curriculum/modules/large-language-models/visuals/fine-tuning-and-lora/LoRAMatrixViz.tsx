import { useState } from 'react'
import { Figure, Controls, Slider, Segmented, Readout, M, useContainerWidth } from '../../../../../kit'
import s from './lora.module.css'

/*
  LoRA to scale. A frozen weight matrix W (d × k) next to the two thin LoRA matrices
  B (d × r) and A (r × k), drawn with one common scale so their real proportions show.
  Parameter counts: full fine-tuning trains d·k numbers, LoRA trains r(d + k).
*/

const SIZES = [128, 256, 512, 768, 1024, 2048, 4096, 8192]
const RANKS = [1, 2, 4, 8, 16, 32, 64, 128]
const MIN_T = 4 // thinnest drawn thickness (px) for B and A
const LABEL_GAP = 12 // smallest gap (px) between neighbouring labels
/** rough rendered width of a label line: 13px bold title, 11.5px numbers */
const labelWidth = (title: string, sub: string) => Math.max(title.length * 8, sub.length * 6.8)
/** text versions of the B and A colours, mixed towards the ink for readable contrast */
const TEXT_B = 'color-mix(in srgb, var(--viz-2) 55%, var(--ink))'
const TEXT_A = 'color-mix(in srgb, var(--viz-3) 60%, var(--ink))'

const fmt = (n: number) => n.toLocaleString('en-GB')
const pct = (x: number) => {
  const p = x * 100
  const digits = p >= 10 ? 0 : p >= 1 ? 1 : p >= 0.1 ? 2 : 3
  return `${p.toFixed(digits)}%`
}

export default function LoRAMatrixViz() {
  const [di, setDi] = useState(6) // 4096
  const [ki, setKi] = useState(6) // 4096
  const [ri, setRi] = useState(3) // 8
  const [stage, setStage] = useState<'start' | 'trained'>('trained')
  const [wrapRef, measured] = useContainerWidth<HTMLDivElement>(560)
  const started = stage === 'start'

  const d = SIZES[di]
  const k = SIZES[ki]
  const r = RANKS[ri]
  const full = d * k
  const lora = r * (d + k)
  const ratio = lora / full

  // ---- layout (all in real pixels) ----
  const W = Math.max(280, Math.min(640, measured))
  const narrow = W < 440
  const opGap = narrow ? 30 : 40
  const pad = 6
  const maxH = narrow ? 150 : 190
  const top = 8
  const sc = Math.min(maxH / d, (W - 2 * pad - 2 * opGap - MIN_T) / (2 * k + r))
  const wW = Math.max(MIN_T, k * sc)
  const wH = Math.max(MIN_T, d * sc)
  const trueT = r * sc
  const t = Math.max(MIN_T, trueT)
  const exaggeration = t / trueT
  // Labels sit in their own columns: when a block is very thin, it moves right so that its label never collides
  // with its neighbour's (block sizes stay to scale; only the gaps between blocks grow).
  const showInside = wW >= 70 && wH >= 46
  const titleW = showInside ? 'W' : 'W (frozen)'
  const titleB = started ? 'B = 0' : 'B'
  const subW = `${fmt(d)} × ${fmt(k)}`
  const subB = `${fmt(d)} × ${r}`
  const subA = `${r} × ${fmt(k)}`
  const lw0 = labelWidth(titleW, subW)
  const lw1 = labelWidth(titleB, subB)
  const lw2 = labelWidth('A', subA)
  const cW = Math.max(pad + wW / 2, lw0 / 2 + 2)
  const xW = cW - wW / 2
  const xB = Math.max(xW + wW + opGap, cW + lw0 / 2 + LABEL_GAP + lw1 / 2 - t / 2)
  const cB = xB + t / 2
  const xA = Math.max(xB + t + opGap, cB + lw1 / 2 + LABEL_GAP + lw2 / 2 - wW / 2)
  const cA = xA + wW / 2
  const plusX = (xW + wW + xB) / 2
  const timesX = (xB + t + xA) / 2
  const yA = top + Math.max(0, (wH - t) / 2)
  const labelY = top + wH + 18
  const H = labelY + 34
  const midY = top + wH / 2
  const bFill = started ? 'var(--surface)' : 'color-mix(in srgb, var(--viz-2) 75%, var(--surface))'
  const aFill = 'color-mix(in srgb, var(--viz-3) 75%, var(--surface))'
  const barMax = Math.max(full, lora)

  return (
    <Figure
      wide
      title="LoRA to scale: a frozen W and two thin trainable matrices"
      caption={
        <>
          <b>Try:</b> slide the rank <M>r</M> and the matrix size, then switch to <b>start of training</b>. <b>Notice:</b> at <M>d = k = 4096</M>,{' '}
          <M>r = 8</M> the trainable part is 1/256 of <M>W</M>, and at the start <M>B = 0</M>, so <M>BA = 0</M>.
        </>
      }
    >
      <div className={s.wrap}>
        <div ref={wrapRef} className={s.svgWrap}>
          <svg
            className={s.svg}
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`Weight matrix W of size ${d} by ${k}, plus B of size ${d} by ${r} times A of size ${r} by ${k}`}
          >
            {/* W */}
            <rect x={xW} y={top} width={wW} height={wH} rx={3} style={{ fill: 'color-mix(in srgb, var(--viz-muted) 22%, var(--surface))', stroke: 'var(--viz-axis)', strokeWidth: 1.5 }} />
            {showInside && (
              <>
                <text x={xW + wW / 2} y={midY - 4} textAnchor="middle" className={s.blockLabel} style={{ fontSize: 18 }}>
                  W
                </text>
                <text x={xW + wW / 2} y={midY + 14} textAnchor="middle" className={s.blockSub}>
                  frozen
                </text>
              </>
            )}
            <text x={cW} y={labelY} textAnchor="middle" className={s.blockLabel}>
              {titleW}
            </text>
            <text x={cW} y={labelY + 15} textAnchor="middle" className={s.blockSub}>
              {subW}
            </text>

            {/* + */}
            <text x={plusX} y={midY} dy="0.35em" textAnchor="middle" className={s.op}>
              +
            </text>

            {/* B */}
            <rect
              x={xB}
              y={top}
              width={t}
              height={wH}
              rx={1.5}
              style={{ fill: bFill, stroke: 'var(--viz-2)', strokeWidth: 1.5, strokeDasharray: started ? '3 2' : undefined }}
            />
            <text x={cB} y={labelY} textAnchor="middle" className={s.blockLabel} style={{ fill: TEXT_B }}>
              {titleB}
            </text>
            <text x={cB} y={labelY + 15} textAnchor="middle" className={s.blockSub}>
              {subB}
            </text>

            {/* × */}
            <text x={timesX} y={midY} dy="0.35em" textAnchor="middle" className={s.op}>
              ×
            </text>

            {/* A */}
            <rect x={xA} y={yA} width={wW} height={t} rx={1.5} style={{ fill: aFill, stroke: 'var(--viz-3)', strokeWidth: 1.5 }} />
            <text x={cA} y={labelY} textAnchor="middle" className={s.blockLabel} style={{ fill: TEXT_A }}>
              A
            </text>
            <text x={cA} y={labelY + 15} textAnchor="middle" className={s.blockSub}>
              {subA}
            </text>
          </svg>
        </div>

        <Controls>
          <Slider label={<>rows <M>d</M></>} value={di} min={0} max={SIZES.length - 1} step={1} onChange={setDi} format={(v) => fmt(SIZES[v])} />
          <Slider label={<>columns <M>k</M></>} value={ki} min={0} max={SIZES.length - 1} step={1} onChange={setKi} format={(v) => fmt(SIZES[v])} />
          <Slider label={<>rank <M>r</M></>} value={ri} min={0} max={RANKS.length - 1} step={1} onChange={setRi} format={(v) => RANKS[v]} />
        </Controls>

        <p className={s.note}>
          {exaggeration > 1.05 ? (
            <>
              Drawn to one scale, except that <b>B</b> and <b>A</b> are shown {exaggeration >= 10 ? Math.round(exaggeration) : exaggeration.toFixed(1)} times
              thicker than they really are: at true scale they would be {trueT < 1 ? 'thinner than a pixel' : `${trueT.toFixed(1)} px thick`}.
            </>
          ) : (
            <>Everything is drawn to one scale.</>
          )}{' '}
          {started ? (
            <>
              Right now <b>B is all zeros</b>, so <M>{'\\Delta W = BA = 0'}</M> and <M>{"W' = W"}</M>: the model behaves exactly like the pretrained one.
            </>
          ) : (
            <>
              After training, <M>{'\\Delta W = BA'}</M> is a full {fmt(d)} × {fmt(k)} matrix, but it is built from only {r} rank-1 layer{r > 1 ? 's' : ''}{' '}
              (column <M>i</M> of <M>B</M> times row <M>i</M> of <M>A</M>).
            </>
          )}
        </p>

        <div className={s.panel}>
          <p className={s.subhead}>Numbers trained for this one matrix</p>
          <div className={s.countGrid} role="list" aria-label="Trainable parameter counts">
            <span className={s.countLabel}>Full fine-tuning</span>
            <span className={s.countTrack} role="listitem" aria-label={`Full fine-tuning: ${fmt(full)}`}>
              <span className={s.countFill} style={{ width: `${(full / barMax) * 100}%`, background: 'color-mix(in srgb, var(--viz-muted) 55%, var(--surface))' }} />
              <span className={s.countText}>
                d·k = {fmt(full)}
              </span>
            </span>
            <span className={s.countLabel}>LoRA</span>
            <span className={s.countTrack} role="listitem" aria-label={`LoRA: ${fmt(lora)}`}>
              <span className={s.countFill} style={{ width: `${(lora / barMax) * 100}%`, background: 'var(--viz-2)' }} />
              <span className={s.countText}>
                r(d + k) = {fmt(lora)}
              </span>
            </span>
          </div>
          <p className={s.note}>
            {ratio < 1 ? (
              <>
                LoRA trains <b>{pct(ratio)}</b> as many numbers as full fine-tuning
                {ratio <= 0.02 ? <> (about 1 in {fmt(Math.round(1 / ratio))})</> : null}.
              </>
            ) : (
              <>
                Here LoRA would train <b>more</b> numbers than <M>W</M> itself ({(ratio).toFixed(2)}×). Low rank only pays off when <M>r</M> is much
                smaller than <M>d</M> and <M>k</M>.
              </>
            )}
          </p>
        </div>

        <Controls>
          <Segmented
            label="Show"
            value={stage}
            onChange={setStage}
            options={[
              { value: 'start', label: 'start of training' },
              { value: 'trained', label: 'after training' },
            ]}
          />
          <Readout
            items={[
              ['trainable', fmt(lora)],
              ['frozen', fmt(full)],
              ['share', pct(ratio)],
            ]}
          />
        </Controls>
      </div>
    </Figure>
  )
}
