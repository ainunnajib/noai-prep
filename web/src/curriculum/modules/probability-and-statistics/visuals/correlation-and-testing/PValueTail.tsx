import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Toggle, Plot, Axes, FnPath, Label, DraggablePoint, usePlot, useNarrow, M } from '../../../../../kit'
import { binomialPmf, normalPdf, fmtP } from './stats'

/*
  p-value as a tail area. The bars are the EXACT null distribution of the number of heads in
  100 tosses of a fair coin, Binomial(100, 0.5). Drag (or tap) the observed count: the bars at
  least as extreme as it turn orange, and their total is the p-value. The red band marks the
  rejection region for the chosen α (the most extreme counts whose total probability is ≤ α),
  so "p ≤ α" and "observed count inside the red band" always agree.
*/

type Tails = 'two' | 'one'
const N = 100
const K0 = 25
const K1 = 75
const Y_TOP = 0.092

function BarsPath({ pmf, pick, fill }: { pmf: number[]; pick: (k: number) => boolean; fill: string }) {
  const { xs, ys, clipId } = usePlot()
  let d = ''
  for (let k = K0; k <= K1; k++) {
    if (!pick(k)) continue
    const a = xs(k - 0.42)
    const b = xs(k + 0.42)
    d += `M${a.toFixed(1)},${ys(0).toFixed(1)}V${ys(pmf[k]).toFixed(1)}H${b.toFixed(1)}V${ys(0).toFixed(1)}Z`
  }
  return <path d={d} clipPath={`url(#${clipId})`} style={{ fill, stroke: 'none' }} />
}

/** shaded background + strip under the axis for the rejection region */
function RejectRegion({ ks }: { ks: number[] }) {
  const { xs, ys } = usePlot()
  if (!ks.length) return null
  // group consecutive ks into runs
  const runs: [number, number][] = []
  ks.forEach((k) => {
    const last = runs[runs.length - 1]
    if (last && k === last[1] + 1) last[1] = k
    else runs.push([k, k])
  })
  const [top, bottom] = [ys(Y_TOP), ys(0)]
  return (
    <g aria-hidden="true">
      {runs.map(([a, b], i) => {
        const x0 = xs(Math.max(K0 - 0.5, a - 0.5))
        const x1 = xs(Math.min(K1 + 0.5, b + 0.5))
        if (x1 <= x0) return null
        return (
          <g key={i}>
            <rect x={x0} y={top} width={x1 - x0} height={bottom - top} style={{ fill: 'color-mix(in srgb, var(--viz-neg) 9%, transparent)' }} />
            <rect x={x0} y={bottom + 1} width={x1 - x0} height={6} style={{ fill: 'var(--viz-neg)' }} />
          </g>
        )
      })}
    </g>
  )
}

function ZRuler() {
  const { xs, ys } = usePlot()
  const y = ys(0) + 48
  return (
    <g aria-hidden="true">
      <line x1={xs(35)} x2={xs(65)} y1={y} y2={y} style={{ stroke: 'var(--viz-5)', strokeWidth: 2 }} />
      {[-3, -2, -1, 0, 1, 2, 3].map((z) => (
        <g key={z} transform={`translate(${xs(50 + 5 * z)},${y})`}>
          <line y1={-5} y2={5} style={{ stroke: 'var(--viz-5)', strokeWidth: 2 }} />
          <text y={18} textAnchor="middle" style={{ fill: 'var(--viz-5)', fontSize: 12, fontWeight: 700 }}>
            {z > 0 ? `+${z}` : z}
          </text>
        </g>
      ))}
      <text x={xs(35) - 10} y={y + 4} textAnchor="end" style={{ fill: 'var(--viz-5)', fontSize: 13, fontWeight: 700 }}>
        z
      </text>
    </g>
  )
}

export default function PValueTail() {
  const [obs, setObs] = useState(62)
  const [alpha, setAlpha] = useState(0.05)
  const [tails, setTails] = useState<Tails>('two')
  const [showCurve, setShowCurve] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(480)

  const pmf = useMemo(() => binomialPmf(N, 0.5), [])
  const extreme = (k: number) => (tails === 'two' ? Math.abs(k - 50) >= Math.abs(obs - 50) : k >= obs)
  let p = 0
  for (let k = 0; k <= N; k++) if (extreme(k)) p += pmf[k]

  // rejection region: the most extreme counts whose total probability is at most alpha
  const region = useMemo(() => {
    if (tails === 'two') {
      for (let d = 0; d <= 50; d++) {
        let s = 0
        for (let k = 0; k <= N; k++) if (Math.abs(k - 50) >= d) s += pmf[k]
        if (s <= alpha + 1e-12) return { test: (k: number) => Math.abs(k - 50) >= d, text: `${50 - d} or fewer, or ${50 + d} or more heads`, size: s }
      }
    } else {
      for (let c = 50; c <= N; c++) {
        let s = 0
        for (let k = c; k <= N; k++) s += pmf[k]
        if (s <= alpha + 1e-12) return { test: (k: number) => k >= c, text: `${c} or more heads`, size: s }
      }
    }
    return { test: () => false, text: 'never', size: 0 }
  }, [tails, alpha, pmf])

  const regionKs: number[] = []
  for (let k = K0; k <= K1; k++) if (region.test(k)) regionKs.push(k)
  const reject = p <= alpha + 1e-12
  const z = (obs - 50) / 5
  const setFromX = (x: number) => setObs(Math.max(K0 + 1, Math.min(K1 - 1, Math.round(x))))

  return (
    <Figure
      title="Is the coin fair? The p-value is a tail area"
      caption={
        <>
          The bars show how often each number of heads turns up in 100 tosses <b>if the coin is fair</b> (the null hypothesis). Drag the orange point,
          or tap a bar, to set what you observed. The orange bars are the results <b>at least as extreme</b> as yours, and the p-value is their total
          height. The red band is where <M>{'p \\le \\alpha'}</M>, so H₀ gets rejected. Try 60 heads, 62 heads, then make <M>{'\\alpha'}</M> smaller.
          Finally switch to <b>one-tailed</b> (H₁: the coin favours heads), where only the upper tail counts as extreme.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <Plot
          x={[K0 - 1, K1 + 1]}
          y={[0, Y_TOP]}
          width={560}
          height={320}
          maxWidth={680}
          minHeight={300}
          margin={{ left: 46, right: 14, bottom: 76, top: 18 }}
          ariaLabel={`Null distribution of heads in 100 fair tosses; observed ${obs}; p-value ${fmtP(p)}`}
          onPointerDown={([x]) => setFromX(x)}
        >
          <RejectRegion ks={regionKs} />
          <Axes xLabel="number of heads in 100 tosses" xTicks={narrow ? 5 : 10} yTicks={4} tickFormat={(v) => (v < 1 ? v.toFixed(2) : String(v))} />
          <BarsPath pmf={pmf} pick={(k) => !extreme(k)} fill="color-mix(in srgb, var(--viz-1) 45%, var(--surface))" />
          <BarsPath pmf={pmf} pick={extreme} fill="var(--viz-2)" />
          {showCurve && <FnPath f={(x) => normalPdf(x, 50, 5)} color="var(--viz-ink)" dash="5 4" width={1.8} />}
          <Label x={K0} y={Y_TOP} dy={12} color="var(--viz-2)" weight={800} size={14}>
            {`p-value = ${fmtP(p)}`}
          </Label>
          {!narrow && (
            <Label x={K0} y={Y_TOP} dy={30} color="var(--ink-2)" size={12}>
              {tails === 'two' ? 'sum of the orange bars (both tails)' : 'sum of the orange bars (upper tail)'}
            </Label>
          )}
          <Label x={obs} y={pmf[obs]} dy={-8} anchor="middle" color="var(--viz-2)" weight={700} size={12}>
            {`${obs}`}
          </Label>
          <Label x={K1} y={Y_TOP} dy={12} anchor="end" color="var(--viz-neg)" weight={700} size={12}>
            {narrow ? 'red: reject H₀' : 'red band: reject H₀ here'}
          </Label>
          <ZRuler />
          <DraggablePoint x={obs} y={0} lockY r={8} color="var(--viz-2)" constrain={(x) => [Math.max(K0 + 1, Math.min(K1 - 1, Math.round(x))), 0]} onChange={(x) => setObs(x)} />
        </Plot>
      </div>
      <Controls>
        <Slider label={<>significance level α</>} value={alpha} min={0.01} max={0.1} step={0.01} onChange={setAlpha} format={(v) => v.toFixed(2)} />
        <Segmented
          label="alternative H₁"
          value={tails}
          onChange={setTails}
          options={[
            { value: 'two', label: 'two-tailed' },
            { value: 'one', label: 'one-tailed' },
          ]}
        />
        <Toggle label="normal curve (CLT)" checked={showCurve} onChange={setShowCurve} />
      </Controls>
      <Readout
        items={[
          ['observed', `${obs} heads`],
          ['z = (heads − 50)/5', z.toFixed(1)],
          ['p-value', fmtP(p)],
          ['reject H₀ if', region.text],
        ]}
      />
      <div
        role="status"
        style={{
          width: '100%',
          padding: '0.55rem 0.8rem',
          borderRadius: '10px',
          fontWeight: 700,
          fontSize: '0.92rem',
          color: 'var(--ink)',
          background: reject ? 'color-mix(in srgb, var(--viz-neg) 14%, var(--surface))' : 'color-mix(in srgb, var(--viz-3) 14%, var(--surface))',
          border: `1.5px solid ${reject ? 'var(--viz-neg)' : 'var(--viz-3)'}`,
        }}
      >
        {reject
          ? `p = ${fmtP(p)} ≤ α = ${alpha.toFixed(2)}: reject H₀. A fair coin rarely does this, so the result is "statistically significant".`
          : `p = ${fmtP(p)} > α = ${alpha.toFixed(2)}: do not reject H₀. A fair coin does this often enough that luck is a fine explanation.`}
      </div>
    </Figure>
  )
}
