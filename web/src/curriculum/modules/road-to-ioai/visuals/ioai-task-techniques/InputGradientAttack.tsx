import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Button, Bars, mulberry32, M } from '../../../../../kit'
import { W1, B1, W2, B2, EXAMPLES } from './digitsModel'
import styles from './techniques.module.css'

/*
  A real (tiny) trained classifier: 8×8 digit → 32 ReLU units → 10 logits, weights in ./digitsModel.
  Everything shown is computed live:
    gradient of the cross-entropy loss with respect to the INPUT pixels, by backprop by hand:
      g_z = p − onehot(y);  g_h = W2ᵀ g_z ⊙ [h > 0];  g_x = W1ᵀ g_h
    FGSM:  x_adv = clip(x + ε · sign(g_x), 0, 1)
    random: x_adv = clip(x + ε · s), s a fixed random ±1 pattern (same size, random direction)
    steps: repeat x ← clip(x + 0.01 · sign(g_x(x)), 0, 1), recomputing the gradient each time
*/

const H = 32
const N = 64
const K = 10
const STEP = 0.01

function forward(x: number[]) {
  const h = new Array<number>(H)
  for (let j = 0; j < H; j++) {
    let s = B1[j]
    for (let i = 0; i < N; i++) s += W1[j * N + i] * x[i]
    h[j] = Math.max(0, s)
  }
  const z = new Array<number>(K)
  for (let k = 0; k < K; k++) {
    let s = B2[k]
    for (let j = 0; j < H; j++) s += W2[k * H + j] * h[j]
    z[k] = s
  }
  const m = Math.max(...z)
  const e = z.map((v) => Math.exp(v - m))
  const tot = e.reduce((a, b) => a + b, 0)
  return { h, p: e.map((v) => v / tot) }
}

/** ∂(cross-entropy with true class t) / ∂x */
function inputGrad(x: number[], t: number) {
  const { h, p } = forward(x)
  const gz = p.map((v, k) => v - (k === t ? 1 : 0))
  const gh = new Array<number>(H)
  for (let j = 0; j < H; j++) {
    let s = 0
    for (let k = 0; k < K; k++) s += W2[k * H + j] * gz[k]
    gh[j] = h[j] > 0 ? s : 0
  }
  const gx = new Array<number>(N).fill(0)
  for (let j = 0; j < H; j++) {
    if (gh[j] === 0) continue
    for (let i = 0; i < N; i++) gx[i] += W1[j * N + i] * gh[j]
  }
  return gx
}

const clip01 = (v: number) => Math.min(1, Math.max(0, v))
const sign = (v: number) => (v > 0 ? 1 : v < 0 ? -1 : 0)

type Mode = 'fgsm' | 'random' | 'steps'

function Pixels({ values, diverging, label }: { values: number[]; diverging?: boolean; label: string }) {
  const max = diverging ? Math.max(1e-9, ...values.map(Math.abs)) : 1
  return (
    <svg className={styles.panelSvg} viewBox="0 0 8 8" role="img" aria-label={label} shapeRendering="crispEdges">
      <rect x={0} y={0} width={8} height={8} style={{ fill: 'var(--surface)' }} />
      {values.map((v, i) => {
        const x = i % 8
        const y = Math.floor(i / 8)
        let fill: string
        if (diverging) {
          const t = Math.round((Math.abs(v) / max) * 85)
          fill = `color-mix(in srgb, ${v < 0 ? 'var(--viz-1)' : 'var(--viz-2)'} ${t}%, var(--surface))`
        } else {
          fill = `color-mix(in srgb, var(--viz-ink) ${Math.round(clip01(v) * 100)}%, var(--surface))`
        }
        return <rect key={i} x={x} y={y} width={1} height={1} style={{ fill }} />
      })}
    </svg>
  )
}

export default function InputGradientAttack() {
  const [which, setWhich] = useState(0)
  const [mode, setMode] = useState<Mode>('fgsm')
  const [eps, setEps] = useState(0.12)
  const [steps, setSteps] = useState(0)

  const ex = EXAMPLES[which]
  const t = ex.label
  const x = useMemo(() => ex.pixels.map((v) => v / 16), [ex])
  const g = useMemo(() => inputGrad(x, t), [x, t])
  const noise = useMemo(() => {
    const r = mulberry32(1000 + ex.id)
    return Array.from({ length: N }, () => (r() < 0.5 ? 1 : -1))
  }, [ex])

  const adv = useMemo(() => {
    if (mode === 'fgsm') return x.map((v, i) => clip01(v + eps * sign(g[i])))
    if (mode === 'random') return x.map((v, i) => clip01(v + eps * noise[i]))
    let cur = x.slice()
    for (let s = 0; s < steps; s++) {
      const gs = inputGrad(cur, t)
      cur = cur.map((v, i) => clip01(v + STEP * sign(gs[i])))
    }
    return cur
  }, [mode, x, g, eps, noise, steps, t])

  const delta = adv.map((v, i) => v - x[i])
  const linf = Math.max(...delta.map(Math.abs))
  const { p } = forward(adv)
  const pred = p.indexOf(Math.max(...p))
  const top = p
    .map((v, k) => ({ k, v }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 3)
  const fooled = pred !== t

  const pick = (i: number) => {
    setWhich(i)
    setSteps(0)
  }

  return (
    <Figure
      title="Attack a real digit classifier with its own gradient"
      caption={
        <>
          The classifier is a small trained network (98% accurate on unseen digits). The second panel is <M>{'\\partial L / \\partial x'}</M>: orange pixels raise the
          loss when brightened, blue ones when darkened. Slide <M>{'\\varepsilon'}</M> to push every pixel by at most <M>{'\\varepsilon'}</M> along the sign of that
          gradient, then switch to random noise of the same size, which barely moves the prediction. "Many small steps" recomputes the gradient after every nudge.
        </>
      }
      wide
    >
      <div className={styles.pickRow} role="group" aria-label="Choose a test digit">
        <span>Test digit:</span>
        {EXAMPLES.map((e, i) => (
          <button key={e.id} type="button" className={`${styles.pick}${i === which ? ` ${styles.pickActive}` : ''}`} aria-pressed={i === which} onClick={() => pick(i)}>
            {e.label}
          </button>
        ))}
      </div>
      <Segmented<Mode>
        label="How to change the pixels"
        value={mode}
        onChange={(m) => {
          setMode(m)
          setSteps(0)
        }}
        options={[
          { value: 'fgsm', label: 'ε · sign(gradient)' },
          { value: 'random', label: 'random ±ε noise' },
          { value: 'steps', label: 'many small steps' },
        ]}
      />
      <div className={styles.panels} style={{ marginTop: '0.75rem' }}>
        <div className={styles.panel}>
          <Pixels values={x} label={`original digit ${t}`} />
          <span className={styles.panelTitle}>original x</span>
        </div>
        <div className={styles.panel}>
          <Pixels values={g} diverging label="gradient of the loss with respect to each pixel" />
          <span className={styles.panelTitle}>gradient ∂L/∂x</span>
        </div>
        <div className={styles.panel}>
          <Pixels values={delta} diverging label="the perturbation, magnified" />
          <span className={styles.panelTitle}>change δ (magnified)</span>
        </div>
        <div className={styles.panel}>
          <Pixels values={adv} label={`perturbed digit, classified as ${pred}`} />
          <span className={styles.panelTitle}>x + δ</span>
        </div>
      </div>
      <p className={styles.verdict} aria-live="polite">
        True digit <strong>{t}</strong>. The model now says <strong>{pred}</strong> ({(p[pred] * 100).toFixed(1)}%):{' '}
        {fooled ? <span className={styles.flip}>prediction flipped</span> : <span className={styles.hold}>still correct</span>}.
      </p>
      <Bars
        ariaLabel="Top three predicted probabilities for the perturbed digit"
        max={1}
        format={(v) => `${(v * 100).toFixed(1)}%`}
        data={top.map(({ k, v }) => ({ label: `digit ${k}${k === t ? ' (true)' : ''}`, value: v, color: k === t ? 'var(--viz-pos)' : 'var(--viz-2)', strong: k === pred }))}
      />
      <Controls>
        {mode !== 'steps' ? (
          <Slider label={<>perturbation size <M>{'\\varepsilon'}</M></>} value={eps} min={0} max={0.3} step={0.01} onChange={setEps} format={(v) => v.toFixed(2)} />
        ) : (
          <>
            <Button primary onClick={() => setSteps((s) => s + 1)}>
              Step (+{STEP})
            </Button>
            <Button onClick={() => setSteps((s) => s + 5)}>5 steps</Button>
            <Button onClick={() => setSteps(0)} disabled={steps === 0}>
              Reset
            </Button>
          </>
        )}
        <Readout
          items={[
            ...(mode === 'steps' ? ([['steps taken', String(steps)]] as [string, string][]) : []),
            ['largest pixel change (L∞)', linf.toFixed(2)],
            ['loss on true class', (-Math.log(Math.max(p[t], 1e-12))).toFixed(3)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
