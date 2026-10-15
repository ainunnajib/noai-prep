import { useEffect, useMemo, useRef, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Slider, Plot, Grid, Axes, Path, VLine, useNarrow, M } from '../../../../../kit'
import { Chips, Py } from '../task-attention/ui'
import { useThemeColours, mix } from './themeColours'
import s from './pe.module.css'

/*
  Q3.5: the positional-encoding table for the first 64 positions, computed in float32 like PyTorch,
  for the correct div_term and three wrong ones. The heat map shows every column; the plot below
  follows one column down the positions. Readouts count the frequencies that underflow to 0 and
  measure how close the two most similar position codes are.
*/

type Version = 'ok' | 'bug' | 'nominus' | 'arange'
const L = 64

const LINES: Record<Version, string> = {
  ok: 'div_term = torch.exp(torch.arange(0, d_model, 2).float() * -(math.log(10000.0) / d_model))',
  bug: 'div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-10000.0 / d_model))',
  nominus: 'div_term = torch.exp(torch.arange(0, d_model, 2).float() * (math.log(10000.0) / d_model))',
  arange: 'div_term = torch.exp(torch.arange(0, d_model).float() * -(math.log(10000.0) / d_model))',
}

const f32 = Math.fround

/** 0.0316 or 1.08 × 10^-17, as TeX */
function texNum(x: number): string {
  if (x === 0) return '0'
  if (x >= 0.01 && x < 1000) return String(Number(x.toPrecision(3)))
  const [m, e] = x.toExponential(2).split('e')
  return `${m}\\times 10^{${Number(e)}}`
}

function divTerm(v: Version, d: number): Float32Array {
  const n = d / 2
  const out = new Float32Array(n)
  const k = v === 'bug' ? f32(-10000 / d) : v === 'nominus' ? f32(Math.log(10000) / d) : f32(-Math.log(10000) / d)
  for (let i = 0; i < n; i++) out[i] = f32(Math.exp(f32(f32(2 * i) * k)))
  return out
}

function table(div: Float32Array, d: number): Float32Array {
  const pe = new Float32Array(L * d)
  for (let p = 0; p < L; p++)
    for (let i = 0; i < d / 2; i++) {
      const a = f32(p * div[i])
      pe[p * d + 2 * i] = Math.sin(a)
      pe[p * d + 2 * i + 1] = Math.cos(a)
    }
  return pe
}

function stats(pe: Float32Array, d: number) {
  let varying = 0
  for (let j = 0; j < d; j++) {
    let lo = Infinity
    let hi = -Infinity
    for (let p = 0; p < L; p++) {
      const v = pe[p * d + j]
      if (v < lo) lo = v
      if (v > hi) hi = v
    }
    if (hi - lo > 1e-6) varying++
  }
  let best = Infinity
  let pair: [number, number] = [0, 1]
  for (let a = 0; a < L; a++)
    for (let b = a + 1; b < L; b++) {
      let acc = 0
      for (let j = 0; j < d; j++) {
        const t = pe[a * d + j] - pe[b * d + j]
        acc += t * t
      }
      if (acc < best) {
        best = acc
        pair = [a, b]
      }
    }
  return { varying, closest: Math.sqrt(best), pair }
}

function HeatCanvas({ pe, d, col }: { pe: Float32Array; d: number; col: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [neg, pos, surf] = useThemeColours(['--viz-1', '--viz-2', '--surface'])
  useEffect(() => {
    const c = ref.current
    if (!c) return
    c.width = d
    c.height = L
    const ctx = c.getContext('2d')
    if (!ctx) return
    const img = ctx.createImageData(d, L)
    for (let p = 0; p < L; p++)
      for (let j = 0; j < d; j++) {
        const v = pe[p * d + j]
        const rgb = mix(surf, v < 0 ? neg : pos, Math.min(1, Math.abs(v)) * 0.92)
        const o = (p * d + j) * 4
        img.data[o] = rgb[0]
        img.data[o + 1] = rgb[1]
        img.data[o + 2] = rgb[2]
        img.data[o + 3] = 255
      }
    ctx.putImageData(img, 0, 0)
  }, [pe, d, neg, pos, surf])
  return (
    <div className={s.heatWrap}>
      <span className={s.heatY}>position 0 → {L - 1}</span>
      <div className={s.heatBox}>
        <canvas ref={ref} className={s.heat} role="img" aria-label={`Positional encoding table: ${L} positions down, ${d} dimensions across`} />
        <span className={s.marker} style={{ left: `${((col + 0.5) / d) * 100}%` }} aria-hidden="true" />
      </div>
      <span className={s.heatX}>
        dimension 0 → {d - 1}
        <span className={s.legend}>
          <i style={{ background: 'var(--viz-1)' }} /> −1 <i style={{ background: 'var(--surface)', border: '1px solid var(--rule)' }} /> 0{' '}
          <i style={{ background: 'var(--viz-2)' }} /> +1
        </span>
      </span>
    </div>
  )
}

export default function PEBugFixHeatmap() {
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)
  const [v, setV] = useState<Version>('ok')
  const [d, setD] = useState(64)
  const [col, setCol] = useState(6)
  const c = Math.min(col, d - 1)

  const good = useMemo(() => table(divTerm('ok', d), d), [d])
  const cur = useMemo(() => (v === 'ok' || v === 'arange' ? good : table(divTerm(v, d), d)), [v, d, good])
  const div = useMemo(() => divTerm(v === 'arange' ? 'ok' : v, d), [v, d])
  const st = useMemo(() => stats(cur, d), [cur, d])
  const zeros = div.reduce((a, x) => a + (x === 0 ? 1 : 0), 0)
  const freq = div[Math.floor(c / 2)]

  const series = (pe: Float32Array): [number, number][] => Array.from({ length: L }, (_, p) => [p, pe[p * d + c]])

  const verdict =
    v === 'ok'
      ? 'Correct: every column is a wave, fast on the left and slower to the right, so every position gets its own code.'
      : v === 'bug'
        ? `The intended bug: 10000 where ln 10000 belongs. ${zeros} of ${d / 2} frequencies underflow to exactly 0, so those columns are sin 0 = 0 and cos 0 = 1 at every position.`
        : v === 'nominus'
          ? 'Missing minus sign: the frequencies grow instead of shrinking, so most columns flicker like noise. The codes still differ, but they no longer match the formula, so value tests fail.'
          : 'arange(0, d_model) makes twice too many frequencies, and the next line cannot fit them into the even columns.'

  return (
    <Figure
      title="One missing log flattens the waves"
      caption={
        <>
          Switch between the correct line and the wrong ones, and change <code>d_model</code>. Each row of the heat map is one position's code; drag the column slider to follow one
          column down the positions. With the bug at <code>d_model = 512</code>, 253 of the 256 frequencies are exactly 0 and only 2 columns change at all, so two positions 44 apart
          (such as 0 and 44) get almost the same code.
        </>
      }
    >
      <div ref={wrapRef} className={s.stack}>
        <Chips
          label="The div_term line"
          options={[
            { value: 'ok', label: 'Correct (with log)' },
            { value: 'bug', label: 'Intended bug: −10000 / d', bad: true },
            { value: 'nominus', label: 'Missing minus sign', bad: true },
            { value: 'arange', label: 'arange(0, d_model)', bad: true },
          ]}
          value={v}
          onChange={setV}
        />
        <div className={s.codeLine}>
          <Py code={LINES[v]} />
        </div>
        {v === 'arange' ? (
          <div className={s.error}>
            RuntimeError: The expanded size of the tensor ({d / 2}) must match the existing size ({d}) at non-singleton dimension 1. Target sizes: [5000, {d / 2}]. Tensor sizes:
            [5000, {d}]
          </div>
        ) : (
          <HeatCanvas pe={cur} d={d} col={c} />
        )}
        <p className={`${s.verdict} ${v === 'ok' ? s.ok : s.bad}`}>{verdict}</p>
        {v !== 'arange' && (
          <div className={s.plotBox}>
            <div className={s.plotTitle}>
              column {c} ({c % 2 === 0 ? 'sin' : 'cos'}), frequency <M>{texNum(freq)}</M>
            </div>
            <Plot x={[0, L - 1]} y={[-1.15, 1.15]} height={narrow ? 200 : 180} width={560} minHeight={170} ariaLabel={`Value of column ${c} at positions 0 to ${L - 1}`}>
              <Grid xTicks={8} yTicks={4} />
              <Axes xLabel="position" xTicks={narrow ? 4 : 8} yTicks={4} />
              <Path points={series(good)} color="var(--viz-1)" width={2.5} />
              {v !== 'ok' && <Path points={series(cur)} color="var(--viz-2)" width={2.5} dash="6 4" />}
              {v === 'bug' && <VLine x={st.pair[0]} color="var(--viz-4)" />}
              {v === 'bug' && <VLine x={st.pair[1]} color="var(--viz-4)" label={`${st.pair[0]} ≈ ${st.pair[1]}`} />}
            </Plot>
            <div className={s.key}>
              <span>
                <i style={{ background: 'var(--viz-1)' }} /> correct
              </span>
              {v !== 'ok' && (
                <span>
                  <i style={{ background: 'var(--viz-2)' }} /> this version
                </span>
              )}
            </div>
          </div>
        )}
        <Controls>
          <Segmented label="d_model" options={[16, 64, 128, 512].map((x) => ({ value: x, label: String(x) }))} value={d} onChange={setD} />
          <Slider label="column" value={c} min={0} max={d - 1} step={1} onChange={setCol} />
          {v !== 'arange' && (
            <Readout
              items={[
                ['frequencies equal to 0', `${zeros} of ${d / 2}`],
                ['columns that change', `${st.varying} of ${d}`],
                ['closest two positions', `${st.pair[0]} and ${st.pair[1]}, distance ${st.closest.toFixed(2)}`],
              ]}
            />
          )}
        </Controls>
      </div>
    </Figure>
  )
}
