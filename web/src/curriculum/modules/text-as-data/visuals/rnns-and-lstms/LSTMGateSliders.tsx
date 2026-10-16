import { useState, type ReactNode } from 'react'
import { Figure, Controls, Readout, Slider, Button, Plot, Grid, Axes, Rect, Path, Dots, HLine, usePlot, useContainerWidth, M } from '../../../../../kit'
import { TryNotice } from '../Caption'
import st from './rnn.module.css'

/*
  A one-number LSTM cell. Word 1 ("Cats") writes 0.9 into the cell state; the learner sets the
  forget, input and output gates used for the words after it and sees, step by step,
  c_t = f·c_{t−1} + i·c̃_t and h_t = o·tanh(c_t). The dashed line is Cats' own contribution to
  c_t, 0.9·f^(t−1); later words' notes add to it or subtract from it.
*/

const WORDS = ['Cats', 'that', 'the', 'auntie', 'feeds', 'every', 'morning', 'are']
/** candidate notes c̃_t that each later word tries to write (made-up, mixed signs) */
const CAND = [0.9, -0.6, 0.5, -0.7, 0.4, -0.5, 0.6, -0.4]
const N = WORDS.length

interface StepVals {
  cPrev: number
  f: number
  i: number
  g: number
  o: number
  c: number
  h: number
  cats: number
}

function run(f: number, i: number, o: number): StepVals[] {
  const out: StepVals[] = []
  let c = 0
  for (let t = 0; t < N; t++) {
    // word 1 always writes its note fully (i = 1); the sliders set the gates for the later words
    const ft = t === 0 ? 0 : f
    const it = t === 0 ? 1 : i
    const cPrev = c
    c = ft * cPrev + it * CAND[t]
    out.push({ cPrev, f: ft, i: it, g: CAND[t], o, c, h: o * Math.tanh(c), cats: 0.9 * f ** t })
  }
  return out
}

/** a variable name with a subscript, for SVG text */
const sub = (name: string, s: string) => (
  <>
    {name}
    <tspan baselineShift="sub" style={{ fontSize: 11 }}>
      {s}
    </tspan>
  </>
)

const n2 = (v: number) => (v < 0 && Math.abs(v) >= 0.005 ? '−' : '') + Math.abs(v).toFixed(2)

/** the cell diagram for one step, drawn at the container's real pixel width so text stays 12–13 px */
function CellDiagram({ v, t }: { v: StepVals; t: number }) {
  const [ref, measured] = useContainerWidth<HTMLDivElement>(560)
  const W = Math.max(300, Math.min(640, measured))
  const Hh = 270
  const inY = 234 // the line that feeds [h_{t−1}, x_t] into every gate
  const beltY = 50
  const gateY = 186
  const xF = 0.3 * W
  const xA = 0.56 * W
  const xI = 0.47 * W
  const xG = 0.64 * W
  const xO = 0.83 * W
  const mulY = 122
  const tanhY = 84
  const outY = 128
  const line = { stroke: 'var(--viz-ink)', strokeWidth: 1.6, fill: 'none' }
  const gateBox = (x: number, sym: string, val: number, kind: 'gate' | 'cand', label: string, name: string) => {
    const w = 46
    const h = 44
    const frac = kind === 'gate' ? val : Math.abs(val)
    const col = kind === 'gate' ? 'var(--viz-3)' : val >= 0 ? 'var(--viz-2)' : 'var(--viz-1)'
    return (
      <g aria-label={`${label} ${val.toFixed(2)}`}>
        <rect x={x - w / 2} y={gateY - h / 2} width={w} height={h} rx={7} style={{ fill: 'var(--surface)', stroke: col, strokeWidth: 2 }} />
        <rect x={x - w / 2 + 2} y={gateY + h / 2 - 2 - (h - 4) * frac} width={w - 4} height={(h - 4) * frac} rx={5} style={{ fill: `color-mix(in srgb, ${col} 35%, transparent)` }} />
        <text x={x} y={gateY - 4} textAnchor="middle" style={{ fontSize: 14, fontWeight: 800, fill: 'var(--ink)', fontStyle: 'italic' }}>
          {sym}
        </text>
        <text x={x} y={gateY + 13} textAnchor="middle" style={{ fontSize: 12, fontWeight: 700, fill: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>
          {n2(val)}
        </text>
        <text className="plot-label" x={x} y={gateY + h / 2 + 13} textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: 'var(--ink-2)' }}>
          {name}
        </text>
      </g>
    )
  }
  const op = (x: number, y: number, sym: string) => (
    <g>
      <circle cx={x} cy={y} r={11} style={{ fill: 'var(--surface)', stroke: 'var(--viz-ink)', strokeWidth: 1.6 }} />
      <text x={x} y={y + 5} textAnchor="middle" style={{ fontSize: 15, fontWeight: 800, fill: 'var(--ink)' }}>
        {sym}
      </text>
    </g>
  )
  const lbl = (x: number, y: number, text: ReactNode, anchor: 'start' | 'middle' | 'end' = 'middle', color = 'var(--ink)') => (
    <text className="plot-label" x={x} y={y} textAnchor={anchor} style={{ fontSize: 12, fill: color }}>
      {text}
    </text>
  )
  return (
    <div ref={ref} style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${W} ${Hh}`} width="100%" role="img" aria-label={`LSTM cell at word ${t + 1}: c_t = ${v.c.toFixed(2)}, h_t = ${v.h.toFixed(2)}`} style={{ display: 'block' }}>
        {/* conveyor belt: the cell state */}
        <rect x={6} y={beltY - 9} width={W - 12} height={18} rx={9} style={{ fill: 'color-mix(in srgb, var(--viz-5) 16%, transparent)' }} />
        <line x1={10} y1={beltY} x2={W - 12} y2={beltY} style={line} />
        <path d={`M${W - 12},${beltY - 5}L${W - 4},${beltY}L${W - 12},${beltY + 5}Z`} style={{ fill: 'var(--viz-ink)' }} />
        {lbl(8, beltY - 16, <>{sub('c', 't−1')} = {n2(v.cPrev)}</>, 'start', 'var(--viz-5)')}
        {lbl(W - 6, beltY - 16, <>{sub('c', 't')} = {n2(v.c)}</>, 'end', 'var(--viz-5)')}
        {lbl((xF + xA) / 2, beltY + 24, `${n2(v.f * v.cPrev)}`)}
        {/* forget gate */}
        <line x1={xF} y1={gateY - 22} x2={xF} y2={beltY + 11} style={line} />
        {op(xF, beltY, '×')}
        {/* input gate × candidate, added to the belt */}
        <polyline points={`${xI},${gateY - 22} ${xI},${mulY + 18} ${xA},${mulY + 11}`} style={line} />
        <polyline points={`${xG},${gateY - 22} ${xG},${mulY + 18} ${xA},${mulY + 11}`} style={line} />
        {op(xA, mulY, '×')}
        <line x1={xA} y1={mulY - 11} x2={xA} y2={beltY + 11} style={line} />
        {lbl(xA + 8, (mulY + beltY) / 2 + 4, `+${n2(v.i * v.g)}`.replace('+−', '−'), 'start')}
        {op(xA, beltY, '+')}
        {/* output: tanh(c_t) × o → h_t */}
        <line x1={xO} y1={beltY} x2={xO} y2={tanhY - 14} style={line} />
        <circle cx={xO} cy={tanhY} r={14} style={{ fill: 'var(--surface)', stroke: 'var(--viz-ink)', strokeWidth: 1.6 }} />
        <text x={xO} y={tanhY + 3.5} textAnchor="middle" style={{ fontSize: 10, fontWeight: 700, fill: 'var(--ink)' }}>
          tanh
        </text>
        <line x1={xO} y1={tanhY + 14} x2={xO} y2={outY - 11} style={line} />
        <line x1={xO} y1={gateY - 22} x2={xO} y2={outY + 11} style={line} />
        {op(xO, outY, '×')}
        <line x1={xO + 11} y1={outY} x2={W - 12} y2={outY} style={line} />
        <path d={`M${W - 12},${outY - 5}L${W - 4},${outY}L${W - 12},${outY + 5}Z`} style={{ fill: 'var(--viz-ink)' }} />
        {/* h_t sits above the output arrow, right of the tanh → × line (two lines when narrow) */}
        {W < 440 ? (
          <>
            {lbl(W - 6, outY - 22, <>{sub('h', 't')} =</>, 'end', 'var(--viz-3)')}
            {lbl(W - 6, outY - 8, n2(v.h), 'end', 'var(--viz-3)')}
          </>
        ) : (
          lbl(W - 6, outY - 9, <>{sub('h', 't')} = {n2(v.h)}</>, 'end', 'var(--viz-3)')
        )}
        {lbl(xO + 18, tanhY + 4, n2(Math.tanh(v.c)), 'start')}
        {/* inputs feeding the gates */}
        <line x1={10} y1={inY} x2={xO} y2={inY} style={{ ...line, stroke: 'var(--viz-muted)' }} />
        {[xF, xI, xG, xO].map((x) => (
          <line key={x} x1={x} y1={inY} x2={x} y2={gateY + 22} style={{ ...line, stroke: 'var(--viz-muted)' }} />
        ))}
        {lbl(10, inY + 17, <>from {sub('h', 't−1')} and {sub('x', 't')}</>, 'start', 'var(--ink-2)')}
        {gateBox(xF, 'f', v.f, 'gate', 'forget gate', 'forget')}
        {gateBox(xI, 'i', v.i, 'gate', 'input gate', 'input')}
        {gateBox(xG, 'c̃', v.g, 'cand', 'candidate note', 'new note')}
        {gateBox(xO, 'o', v.o, 'gate', 'output gate', 'output')}
      </svg>
    </div>
  )
}

/** word labels under the timeline (rotated so long words fit on phones) */
function WordTicks({ sel, onPick }: { sel: number; onPick: (t: number) => void }) {
  const { xs, ys, width } = usePlot()
  const y0 = ys.range()[0]
  const angle = width < 480 ? -60 : -30
  return (
    <g>
      {WORDS.map((w, t) => (
        <text
          key={t}
          x={xs(t + 1)}
          y={y0 + 14}
          transform={`rotate(${angle} ${xs(t + 1)} ${y0 + 14})`}
          textAnchor="end"
          role="button"
          tabIndex={0}
          className={st.word}
          onClick={() => onPick(t)}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPick(t)}
          style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: t === sel ? 800 : 500, fill: t === sel ? 'var(--accent)' : 'var(--ink-2)' }}
        >
          {w}
        </text>
      ))}
    </g>
  )
}

export default function LSTMGateSliders() {
  const [f, setF] = useState(0.9)
  const [i, setI] = useState(0.2)
  const [o, setO] = useState(1)
  const [sel, setSel] = useState(N - 1)
  const steps = run(f, i, o)
  const v = steps[sel]
  const preset = (ff: number, ii: number, oo: number) => {
    setF(ff)
    setI(ii)
    setO(oo)
  }

  return (
    <Figure
      title="An LSTM cell: three valves on a conveyor belt"
      caption={
        <TryNotice
          tryIt={
            <>
              press the presets: <b>f = 1, i = 0</b>, then <b>o = 0</b>. Click a word to inspect that step in the diagram.
            </>
          }
          notice={
            <>
              with <b>f = 1, i = 0</b> the note "Cats" wrote (0.9) rides the cell state untouched to "are"; with <b>o = 0</b> it is still stored but hidden from the output.
            </>
          }
          note={
            <>
              Bars are the cell state <M>{'c_t'}</M>, dots the output <M>{'h_t'}</M>. The dashed line is Cats&apos; own share, <M>{'0.9 \\cdot f^{\\,t-1}'}</M>; later words add to it or subtract from it.
              In a real LSTM the gates are recomputed at every step from <M>{'h_{t-1}'}</M> and the current word; here they are held fixed so you can see what each one does.
            </>
          }
        />
      }
    >
      <CellDiagram v={v} t={sel} />
      <p style={{ margin: 0, fontSize: 'var(--step--1)', color: 'var(--ink-2)', textAlign: 'center' }}>
        Word {sel + 1}, “{WORDS[sel]}”: <M>{`c_t = ${n2(v.f)} \\times ${v.cPrev <= -0.005 ? `(${n2(v.cPrev)})` : n2(v.cPrev)} + ${n2(v.i)} \\times (${n2(v.g)}) = ${n2(v.c)}`}</M>, <M>{`h_t = ${n2(v.o)} \\times \\tanh(${n2(v.c)}) = ${n2(v.h)}`}</M>
      </p>
      <Plot
        x={[0.4, N + 0.6]}
        y={[-1.05, 1.05]}
        width={520}
        height={210}
        minHeight={200}
        margin={{ left: 40, bottom: 58 }}
        ariaLabel="Cell state, Cats' remaining note and output for each word"
        onPointerDown={([x]) => setSel(Math.max(0, Math.min(N - 1, Math.round(x) - 1)))}
      >
        <Rect x0={sel + 0.55} x1={sel + 1.45} y0={-1.05} y1={1.05} fill="var(--accent-soft)" opacity={0.7} />
        <Grid xTicks={0} yTicks={4} />
        <HLine y={0} color="var(--viz-axis)" dash="" width={1} />
        {steps.map((s, t) => (
          <Rect key={t} x0={t + 1 - 0.28} x1={t + 1 + 0.28} y0={0} y1={s.c} fill="color-mix(in srgb, var(--viz-5) 70%, var(--surface))" rx={2} />
        ))}
        <Path points={steps.map((s, t) => [t + 1, s.cats] as [number, number])} color="var(--viz-4)" width={2.2} dash="6 4" />
        <Dots points={steps.map((s, t) => ({ x: t + 1, y: s.h, r: 4.5, color: 'var(--viz-3)' }))} />
        <Axes yTicks={4} hideXTicks />
        <WordTicks sel={sel} onPick={setSel} />
      </Plot>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem 1rem', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--ink-2)' }} aria-hidden="true">
        <span>
          <i style={{ display: 'inline-block', width: 10, height: 12, marginRight: 5, verticalAlign: '-1px', borderRadius: 2, background: 'color-mix(in srgb, var(--viz-5) 70%, var(--surface))' }} />
          bars: cell state c<sub>t</sub>
        </span>
        <span>
          <i style={{ display: 'inline-block', width: 18, height: 0, marginRight: 5, verticalAlign: '3px', borderTop: '2.2px dashed var(--viz-4)' }} />
          dashed: Cats&apos; note
        </span>
        <span>
          <i style={{ display: 'inline-block', width: 9, height: 9, marginRight: 5, borderRadius: 5, background: 'var(--viz-3)' }} />
          dots: output h<sub>t</sub>
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
        <Button onClick={() => preset(1, 0, 1)}>Remember: f = 1, i = 0</Button>
        <Button onClick={() => preset(0, 1, 1)}>Forget: f = 0, i = 1</Button>
        <Button onClick={() => preset(0.5, 0.5, 1)}>Leaky: f = i = 0.5</Button>
        <Button onClick={() => preset(1, 0, 0)}>Hide: o = 0</Button>
      </div>
      <Controls>
        <Slider label="forget f" value={f} min={0} max={1} step={0.05} onChange={setF} format={(x) => x.toFixed(2)} />
        <Slider label="input i" value={i} min={0} max={1} step={0.05} onChange={setI} format={(x) => x.toFixed(2)} />
        <Slider label="output o" value={o} min={0} max={1} step={0.05} onChange={setO} format={(x) => x.toFixed(2)} />
        <Slider label="inspect word" value={sel + 1} min={1} max={N} step={1} onChange={(x) => setSel(x - 1)} format={(x) => `${x}: “${WORDS[x - 1]}”`} />
        <Readout
          items={[
            [`c at “${WORDS[sel]}”`, n2(v.c)],
            ['still from “Cats”', n2(v.cats)],
            [`h at “${WORDS[sel]}”`, n2(v.h)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
