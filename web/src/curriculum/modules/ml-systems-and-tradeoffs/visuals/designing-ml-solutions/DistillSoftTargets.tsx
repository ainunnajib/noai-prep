import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Bars, useNarrow } from '../../../../../kit'

/*
  Knowledge distillation's soft targets. A big "teacher" network looks at a handwritten 7 and outputs logits
  (illustrative values) for the digits 0–9. Softmax with temperature T: p_i = exp(z_i / T) / Σ_j exp(z_j / T).
  T = 1 is the teacher's normal output; higher T spreads probability onto the "nearly right" digits
  (1 and 9 look most like this 7), which is extra information the hard one-hot label does not carry.
*/

const LOGITS = [-1.0, 4.0, 1.0, 0.5, 0.2, -0.5, -2.0, 9.0, 0.0, 3.0]

function softmax(z: number[], T: number) {
  const m = Math.max(...z)
  const e = z.map((v) => Math.exp((v - m) / T))
  const s = e.reduce((a, b) => a + b, 0)
  return e.map((v) => v / s)
}

const entropyBits = (p: number[]) => -p.reduce((s, v) => s + (v > 0 ? v * Math.log2(v) : 0), 0)

function Seven() {
  return (
    <svg viewBox="0 0 64 64" width={64} height={64} role="img" aria-label="A handwritten digit 7" style={{ flex: 'none' }}>
      <rect x={1} y={1} width={62} height={62} rx={8} style={{ fill: 'var(--surface-2)', stroke: 'var(--rule)' }} />
      <path d="M17 17 C 26 15, 38 14, 47 16 C 41 26, 35 37, 31 51" style={{ fill: 'none', stroke: 'var(--ink)', strokeWidth: 5, strokeLinecap: 'round', strokeLinejoin: 'round' }} />
      <path d="M25 33 L 41 32" style={{ fill: 'none', stroke: 'var(--ink)', strokeWidth: 3.5, strokeLinecap: 'round' }} />
    </svg>
  )
}

export default function DistillSoftTargets() {
  const [T, setT] = useState(4)
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const p = softmax(LOGITS, T)
  const hard = LOGITS.map((_, i) => (i === 7 ? 1 : 0))
  const fmt = (v: number) => (v >= 0.995 ? '1.00' : v < 0.005 ? (v === 0 ? '0' : '<0.01') : v.toFixed(2))
  const near = [1, 9]

  const col = (title: string, sub: string, data: number[], colour: string) => (
    <div style={{ display: 'grid', gap: 6, minWidth: 0 }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{sub}</div>
      </div>
      <Bars
        max={1}
        format={fmt}
        ariaLabel={title}
        data={data.map((v, i) => ({ label: `${i}`, value: v, color: i === 7 ? colour : near.includes(i) ? 'var(--viz-2)' : 'var(--viz-muted)', strong: i === 7 || near.includes(i) }))}
      />
    </div>
  )

  return (
    <Figure
      wide
      title="What a student learns from its teacher"
      caption={
        <>
          The training label for this image says only "7". The teacher's output says more: it is a 7, but it looks a little like a 1 and a 9, and nothing like a 6. Raise the temperature T to
          soften the teacher's probabilities and reveal those similarities; at T = 1 they are almost invisible. A distilled student is trained to match these soft probabilities, which carry far
          more information per example than the hard label.
        </>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
        <Seven />
        <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>
          Input image. Teacher's raw scores (logits) for 0–9: <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--ink)' }}>[{LOGITS.join(', ')}]</span>
        </div>
      </div>
      <div ref={ref} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: 18 }}>
        {col('Hard label', 'what the dataset says', hard, 'var(--viz-1)')}
        {col(`Teacher's soft label, T = ${T}`, 'what the student is trained to match', p, 'var(--viz-1)')}
      </div>
      <Controls>
        <Slider label="temperature T" value={T} min={1} max={10} step={0.5} onChange={setT} format={(v) => v.toFixed(1)} />
        <Readout
          items={[
            ['P(7)', p[7].toFixed(3)],
            ['P(1) + P(9)', (p[1] + p[9]).toFixed(3)],
            ['spread (entropy)', `${entropyBits(p).toFixed(2)} bits`],
          ]}
        />
      </Controls>
    </Figure>
  )
}
