import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Button, Plot, Grid, Axes, Path, HLine, VLine, Dots, Label, useAnimationFrame, M } from '../../../../../kit'
import s from './heads.module.css'

/*
  One sigmoid output, one example with true label y = 1, starting confidently wrong (logit z₀ < 0).
  Gradient descent on the logit, z ← z − η·dL/dz with η = 1:
    binary cross-entropy  L = −ln σ(z)        dL/dz = p − 1
    squared error         L = (1 − σ(z))²     dL/dz = 2(p − 1)·p(1 − p)
  The extra factor p(1 − p) = σ′(z) is almost 0 when the sigmoid is saturated, so MSE barely moves.
*/

const sig = (z: number) => 1 / (1 + Math.exp(-z))
const LR = 1

function run(z0: number, kind: 'bce' | 'mse', steps: number) {
  const zs = [z0]
  let z = z0
  for (let t = 0; t < steps; t++) {
    const p = sig(z)
    z -= LR * (kind === 'bce' ? p - 1 : 2 * (p - 1) * p * (1 - p))
    zs.push(z)
  }
  return zs
}

function stepsToHalf(zs: number[]) {
  const i = zs.findIndex((z) => z > 0)
  return i < 0 ? null : i
}

export default function SaturationRace() {
  const [z0, setZ0] = useState(-6)
  const [t, setT] = useState(7)
  const [playing, setPlaying] = useState(false)

  const { bce, mse, xMax, nB, nM } = useMemo(() => {
    const longRun = run(z0, 'mse', 4000)
    const nM0 = stepsToHalf(longRun) ?? 4000
    const xm = Math.max(20, Math.ceil((nM0 * 1.15) / 10) * 10)
    const b = run(z0, 'bce', xm)
    return { bce: b, mse: longRun.slice(0, xm + 1), xMax: xm, nB: stepsToHalf(b), nM: nM0 }
  }, [z0])

  const tt = Math.min(t, xMax)
  useAnimationFrame(() => {
    setT((v) => {
      const nv = v + Math.max(1, Math.round(xMax / 180))
      if (nv >= xMax) {
        setPlaying(false)
        return xMax
      }
      return nv
    })
  }, playing)

  const pB = sig(bce[tt])
  const pM = sig(mse[tt])
  const gB = pB - 1
  const gM = 2 * (pM - 1) * pM * (1 - pM)
  const fmtP = (p: number) => (p < 0.001 ? p.toExponential(1) : p.toFixed(3))
  const stride = Math.max(1, Math.floor(xMax / 400))
  const curve = (zs: number[]) => zs.filter((_, i) => i % stride === 0 || i === zs.length - 1).map((z, i, arr) => [i === arr.length - 1 ? zs.length - 1 : i * stride, sig(z)] as [number, number])

  return (
    <Figure
      title="Confidently wrong: which loss escapes faster?"
      caption={
        <>
          One sigmoid output, one example whose true label is 1, and a model that starts out confidently wrong (logit <M>{'z_0'}</M>, so <M>{'p = \\sigma(z_0)'}</M> is
          tiny). Each step of gradient descent moves the logit by <M>{'-\\partial L/\\partial z'}</M>. With binary cross-entropy that push is <M>{'p - 1 \\approx -1'}</M>, so the
          model escapes in a few steps. With squared error the push is multiplied by <M>{"\\sigma'(z) = p(1-p) \\approx 0"}</M>, so it crawls. Make the start more
          confidently wrong and watch the gap explode, then press <b>Play</b>.
        </>
      }
    >
      <Plot x={[0, xMax]} y={[0, 1]} width={520} height={260} minHeight={220} margin={{ left: 42, bottom: 32, top: 26, right: 14 }} ariaLabel="Probability of the correct class against training step, for cross-entropy and squared error">
        <Grid xTicks={5} yTicks={4} />
        <Axes xLabel="gradient-descent step" yLabel="p (correct class)" xTicks={5} yTicks={4} tickFormat={(v) => (Number.isInteger(v) ? v.toLocaleString('en-GB') : String(v))} />
        <HLine y={0.5} />
        <Label x={xMax * 0.5} y={0.5} dy={-6} anchor="middle" color="var(--viz-muted)" size={12}>
          p = 0.5
        </Label>
        <Path points={curve(mse)} color="var(--viz-4)" width={2.6} dash="7 5" />
        <Path points={curve(bce)} color="var(--viz-3)" width={2.6} />
        <VLine x={tt} color="var(--viz-ink)" dash="2 3" width={1.2} />
        <Dots
          points={[
            { x: tt, y: pB, color: 'var(--viz-3)', r: 6 },
            { x: tt, y: pM, color: 'var(--viz-4)', r: 6 },
          ]}
        />
      </Plot>
      <div className={s.legend}>
        <span>
          <span className={s.swatch} style={{ borderColor: 'var(--viz-3)' }} />
          binary cross-entropy: reaches p &gt; 0.5 after {nB == null ? '–' : nB.toLocaleString('en-GB')} steps
        </span>
        <span>
          <span className={s.swatch} style={{ borderColor: 'var(--viz-4)', borderTopStyle: 'dashed' }} />
          squared error: after {nM.toLocaleString('en-GB')} steps
        </span>
      </div>
      <Controls>
        <Slider
          label={
            <>
              starting logit <M>{'z_0'}</M> (p = {fmtP(sig(z0))})
            </>
          }
          value={z0}
          min={-8}
          max={-1}
          step={0.5}
          onChange={(v) => {
            setZ0(v)
            setPlaying(false)
            setT(stepsToHalf(run(v, 'bce', 60)) ?? 0)
          }}
          format={(v) => v.toFixed(1).replace('-', '−')}
        />
        <Slider label="step" value={tt} min={0} max={xMax} step={1} onChange={(v) => setT(v)} />
        <Button
          primary
          onClick={() => {
            if (!playing && tt >= xMax) setT(0)
            setPlaying((p) => !p)
          }}
        >
          {playing ? 'Pause' : 'Play'}
        </Button>
        <Readout
          items={[
            ['BCE: p', fmtP(pB)],
            ['BCE push', gB.toFixed(3).replace('-', '−')],
            ['MSE: p', fmtP(pM)],
            ['MSE push', gM.toFixed(3).replace('-', '−')],
          ]}
        />
      </Controls>
    </Figure>
  )
}
