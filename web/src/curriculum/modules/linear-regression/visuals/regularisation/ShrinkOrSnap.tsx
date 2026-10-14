import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Plot, Grid, Axes, FnPath, Dots, Label, VLine, Rect, DraggablePoint, useNarrow } from '../../../../../kit'

/*
  One weight w. Without a penalty the best value is a (the data term is (w − a)²).
    L2:  (w − a)² + λw²   →  w* = a / (1 + λ)                 (divides: shrinks, never exactly 0)
    L1:  (w − a)² + λ|w|  →  w* = sign(a)·max(|a| − λ/2, 0)   (subtracts: snaps to exactly 0)
  Left: the loss curves for the chosen penalty. Right: w* against a for both penalties.
*/

type Mode = 'l1' | 'l2'
const l2Star = (a: number, lam: number) => a / (1 + lam)
const l1Star = (a: number, lam: number) => Math.sign(a) * Math.max(Math.abs(a) - lam / 2, 0)
const f2 = (v: number) => (Math.abs(v) < 0.005 ? '0.00' : v.toFixed(2))

export default function ShrinkOrSnap() {
  const [mode, setMode] = useState<Mode>('l1')
  const [a, setA] = useState(1.5)
  const [lam, setLam] = useState(1)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)

  const pen = (w: number) => (mode === 'l2' ? lam * w * w : lam * Math.abs(w))
  const total = (w: number) => (w - a) ** 2 + pen(w)
  const star = mode === 'l2' ? l2Star(a, lam) : l1Star(a, lam)
  const s2 = l2Star(a, lam)
  const s1 = l1Star(a, lam)
  const col = mode === 'l2' ? 'var(--viz-1)' : 'var(--viz-2)'
  const zero = Math.abs(s1) < 1e-12

  return (
    <Figure
      title="Shrink (L2) or snap to zero (L1)"
      caption={
        <>
          One weight on its own. Without a penalty the best weight is <b>a</b> (green handle: drag it, or use the slider). Adding the penalty moves the bottom
          of the total loss towards 0. On the right, follow both answers as a changes: L2 <b>divides</b> by 1 + λ, so the weight shrinks but never reaches 0; L1{' '}
          <b>subtracts</b> λ/2 and stops at 0, so every a inside the shaded band gives a weight of exactly 0.
        </>
      }
    >
      <div
        ref={wrapRef}
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: narrow ? '1fr' : '1fr 1fr',
          gap: 14,
        }}
      >
        <div style={{ display: 'grid', gap: 4 }}>
          <div
            style={{
              fontSize: 'var(--step--1)',
              fontWeight: 700,
              color: 'var(--ink-2)',
              textAlign: 'center',
            }}
          >
            Loss for one weight: (w − a)² + {mode === 'l2' ? 'λw²' : 'λ|w|'}
          </div>
          <Plot
            x={[-3, 3]}
            y={[-0.4, 7]}
            width={330}
            height={270}
            minHeight={240}
            margin={{ left: 30, bottom: 32 }}
            ariaLabel="Data term, penalty and total loss for one weight"
          >
            <Grid xTicks={6} yTicks={7} />
            <Axes xLabel="w" xTicks={6} yTicks={4} origin />
            <FnPath f={(w) => (w - a) ** 2} color="var(--viz-3)" width={2} dash="6 5" />
            <FnPath f={pen} color={col} width={2} dash="2 4" />
            <FnPath f={total} color={col} width={3.5} />
            <VLine x={star} color={col} dash="4 4" />
            <Dots points={[{ x: star, y: total(star), r: 6, color: col }]} />
            <Label x={star} y={total(star)} dx={star > 1.2 ? -8 : 8} dy={-10} anchor={star > 1.2 ? 'end' : 'start'} color={col} weight={700}>
              {`best w = ${f2(star)}`}
            </Label>
            <DraggablePoint x={a} y={0} lockY color="var(--viz-3)" onChange={(x) => setA(Math.round(Math.max(-2.5, Math.min(2.5, x)) * 20) / 20)} label="a" />
          </Plot>
        </div>
        <div style={{ display: 'grid', gap: 4 }}>
          <div
            style={{
              fontSize: 'var(--step--1)',
              fontWeight: 700,
              color: 'var(--ink-2)',
              textAlign: 'center',
            }}
          >
            Where the best weight lands, for every a
          </div>
          <Plot
            x={[-2.5, 2.5]}
            y={[-2.5, 2.5]}
            width={330}
            height={270}
            minHeight={240}
            margin={{ left: 34, bottom: 32 }}
            ariaLabel="Best weight against a for L1 and L2 penalties"
          >
            <Rect x0={-lam / 2} x1={lam / 2} y0={-2.5} y1={2.5} fill="color-mix(in srgb, var(--viz-2) 14%, transparent)" />
            <Grid xTicks={5} yTicks={5} />
            <Axes xLabel="a" yLabel="best w" xTicks={5} yTicks={5} origin />
            <FnPath f={(x) => x} color="var(--viz-muted)" width={1.5} dash="5 5" />
            <FnPath f={(x) => l2Star(x, lam)} color="var(--viz-1)" width={3} />
            <FnPath f={(x) => l1Star(x, lam)} color="var(--viz-2)" width={3} />
            <VLine x={a} color="var(--viz-3)" dash="4 4" />
            <Dots
              points={[
                { x: a, y: s2, r: 6, color: 'var(--viz-1)' },
                { x: a, y: s1, r: 6, color: 'var(--viz-2)' },
              ]}
            />
            <Label x={2.4} y={l2Star(2.4, lam)} dx={-2} dy={18} anchor="end" color="var(--viz-1)" weight={700}>
              L2
            </Label>
            <Label x={2.0} y={l1Star(2.0, lam)} dx={-6} dy={-8} anchor="end" color="var(--viz-2)" weight={700}>
              L1
            </Label>
            <Label x={-2.45} y={2.5} dy={14} color="var(--viz-muted)">
              no penalty
            </Label>
          </Plot>
        </div>
      </div>
      <Controls>
        <Segmented
          label="Penalty on the left"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'l1', label: 'L1: λ|w|' },
            { value: 'l2', label: 'L2: λw²' },
          ]}
        />
        <Slider label="a: best w without a penalty" value={a} min={-2.5} max={2.5} step={0.05} onChange={setA} format={(v) => v.toFixed(2)} />
        <Slider label="λ: penalty strength" value={lam} min={0} max={4} step={0.05} onChange={setLam} format={(v) => v.toFixed(2)} />
      </Controls>
      <Readout
        items={[
          ['L2: a ÷ (1 + λ)', f2(s2)],
          ['L1: a − λ/2, stopped at 0', <span style={{ color: zero ? 'var(--viz-neg)' : undefined }}>{zero ? '0 exactly' : f2(s1)}</span>],
          ['pull towards 0 at the answer', `L2: 2λw = ${f2(Math.abs(2 * lam * s2))}, L1: λ = ${f2(lam)}`],
        ]}
      />
    </Figure>
  )
}
