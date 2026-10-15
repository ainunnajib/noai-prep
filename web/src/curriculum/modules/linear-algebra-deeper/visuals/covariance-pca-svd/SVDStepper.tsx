import { useMemo, useRef, useState } from 'react'
import { Figure, Controls, Slider, Button, Plot, Grid, Axes, Arrow, Path, Dots, Label, useAnimationFrame, useNarrow } from '../../../../../kit'
import { type M2, type V2, apply, mul, rot, dirV, fmt, fix, imageOfCircle } from '../eigenvectors-eigenvalues/eig2'
import { svd2, MiniMat, FactorRow } from './la2'
import s from '../eigenvectors-eigenvalues/ev.module.css'

/*
  SVD as three moves: Vᵀ turns the circle (so the special input directions v₁, v₂ land on the
  axes), Σ stretches along the axes by σ₁ and σ₂, and U turns the result into place. Scrub t from
  0 to 3; every intermediate picture is a genuine linear map applied to the unit circle.
*/

const PRESETS: { name: string; m: M2 }[] = [
  { name: 'Shear', m: [[1, 1], [0, 1]] },
  { name: 'Symmetric', m: [[2, 1], [1, 2]] },
  { name: 'General', m: [[1.5, -0.5], [1, 1]] },
  { name: 'With a flip', m: [[0.4, 1.2], [1.4, 0.2]] },
  { name: 'Rank 1', m: [[1, 2], [0.5, 1]] },
]

const STAGES = ['start', 'after Vᵀ (turn)', 'after Σ (stretch)', 'after U (turn)']
const sameM = (A: M2, B: M2) => A.every((r, i) => r.every((v, j) => Math.abs(v - B[i][j]) < 1e-9))

export default function SVDStepper() {
  const [A, setA] = useState<M2>(PRESETS[0].m)
  const [t, setT] = useState(3)
  const [target, setTarget] = useState<number | null>(null)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(620)

  const d = useMemo(() => {
    const r = svd2(A)
    // pick the sign of v₁ that makes the first turn as small as possible
    let { alpha, beta, v1, v2, u1, u2 } = r
    if (alpha > 90 || alpha <= -90) {
      alpha = alpha > 90 ? alpha - 180 : alpha + 180
      beta = beta > 0 ? beta - 180 : beta + 180
      v1 = [-v1[0], -v1[1]]
      v2 = [-v2[0], -v2[1]]
      u1 = [-u1[0], -u1[1]]
      u2 = [-u2[0], -u2[1]]
    }
    const Vt: M2 = rot(-alpha)
    const U: M2 = mul(rot(beta), [
      [1, 0],
      [0, r.flip],
    ])
    return { ...r, alpha, beta, v1, v2, u1, u2, Vt, U }
  }, [A])

  // animate t towards the target stage
  const tRef = useRef(t)
  tRef.current = t
  useAnimationFrame((dt) => {
    if (target === null) return
    const dir = Math.sign(target - tRef.current)
    let nt = tRef.current + dir * dt * 0.9
    if ((dir > 0 && nt >= target) || (dir < 0 && nt <= target) || dir === 0) {
      nt = target
      setTarget(null)
    }
    tRef.current = nt
    setT(nt)
  }, target !== null)

  const ease = (x: number) => x * x * (3 - 2 * x)
  const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
  const t1 = ease(clamp01(t))
  const t2 = ease(clamp01(t - 1))
  const t3 = ease(clamp01(t - 2))
  const M: M2 = useMemo(() => {
    const step1 = rot(-d.alpha * t1)
    const sig: M2 = [
      [1 + (d.s1 - 1) * t2, 0],
      [0, 1 + (d.s2 - 1) * t2],
    ]
    const step3 = mul(rot(d.beta * t3), [
      [1, 0],
      [0, 1 + (d.flip - 1) * t3],
    ])
    return mul(step3, mul(sig, step1))
  }, [d, t1, t2, t3])

  const reach = Math.max(1, d.s1)
  const L = Math.max(2, Math.ceil(reach * 1.2 * 2) / 2)
  const circle = imageOfCircle(M, 120)
  const clock: V2[] = Array.from({ length: 12 }, (_, i) => apply(M, dirV(90 - i * 30)))
  const a1 = apply(M, d.v1)
  const a2 = apply(M, d.v2)
  const stage = t >= 2.999 ? 3 : t >= 1.999 && t < 2.001 ? 2 : t >= 0.999 && t < 1.001 ? 1 : t <= 0.001 ? 0 : -1
  const active = t <= 1 ? 0 : t <= 2 ? 1 : 2 // which factor is acting now
  const rank = (d.s1 > 1e-9 ? 1 : 0) + (d.s2 > 1e-9 ? 1 : 0)
  const presetIdx = PRESETS.findIndex((p) => sameM(p.m, A))

  const setEntry = (i: 0 | 1, j: 0 | 1, v: number) => {
    const mm = A.map((r) => [...r]) as M2
    mm[i][j] = v
    setA(mm)
  }
  const go = (to: number) => setTarget(Math.max(0, Math.min(3, to)))


  return (
    <Figure
      title="SVD: every matrix is turn, stretch, turn"
      caption={
        <>
          The dashed circle is every input of length 1, with 12 "clock" dots so you can see it turn (the bigger dot starts at 12 o'clock). Press{' '}
          <b>Next stage</b> or scrub the slider. First <b>Vᵀ</b> turns the circle so that the two special input directions{' '}
          <span className={s.c2}>v₁</span> and <span className={s.c3}>v₂</span> land on the axes. Then <b>Σ</b> stretches along the axes by the singular values
          σ₁ and σ₂. Finally <b>U</b> turns the oval into place. The result is exactly what <i>A</i> does: the oval's half-widths are the singular values. Try{' '}
          <b>Rank 1</b>: σ₂ = 0 and the circle is crushed onto a line. In <b>With a flip</b> the determinant is negative, so <i>U</i> also mirrors the plane: the
          oval folds flat for a moment and opens up mirrored, like a page being turned over.
        </>
      }
    >
      <div className={s.row}>
        {PRESETS.map((p, i) => (
          <Button
            key={p.name}
            primary={i === presetIdx}
            onClick={() => {
              setA(p.m)
              setT(3)
              setTarget(null)
            }}
          >
            {p.name}
          </Button>
        ))}
      </div>
      <div ref={wrapRef} className={`${s.panels} ${narrow ? s.panelsNarrow : ''}`}>
        <div className={s.panel}>
          <Plot x={[-L, L]} y={[-L, L]} width={340} height={340} margin={{ top: 8, right: 8, bottom: 8, left: 8 }} maxWidth={400} ariaLabel="The unit circle being turned, stretched and turned into an ellipse">
            <Grid xTicks={2 * L} yTicks={2 * L} />
            <Axes origin xTicks={Math.min(8, 2 * L)} yTicks={Math.min(8, 2 * L)} />
            <Path points={imageOfCircle([[1, 0], [0, 1]], 96)} closed color="var(--viz-muted)" width={1.4} dash="5 5" />
            <Path points={circle} closed color="var(--viz-5)" width={2.2} fill="color-mix(in srgb, var(--viz-5) 14%, transparent)" />
            <Dots points={clock.map((p, i) => ({ x: p[0], y: p[1], r: i === 0 ? 5.5 : 3, color: i === 0 ? 'var(--viz-4)' : 'var(--viz-5)' }))} stroke="none" />
            <Arrow from={[0, 0]} to={a1} color="var(--viz-2)" width={3} />
            <Arrow from={[0, 0]} to={a2} color="var(--viz-3)" width={3} />
            <Label x={a1[0]} y={a1[1]} dx={6} dy={-6} color="var(--viz-2)" weight={750}>
              {t >= 2.999 ? `σ₁u₁` : t <= 0.001 ? 'v₁' : ''}
            </Label>
            <Label x={a2[0]} y={a2[1]} dx={6} dy={14} color="var(--viz-3)" weight={750}>
              {t >= 2.999 ? (d.s2 > 1e-6 ? `σ₂u₂` : '') : t <= 0.001 ? 'v₂' : ''}
            </Label>
          </Plot>
          <div className={s.chipRow}>
            {STAGES.map((n, i) => (
              <span key={n} className={`${s.chip} ${stage === i ? s.chipOn : ''}`}>
                {i}: {n}
              </span>
            ))}
          </div>
        </div>
        <div className={s.panel}>
          <FactorRow
            lhs={<MiniMat rows={A} name="A" format={(v) => fmt(v, 2)} />}
            factors={[
              <MiniMat key="u" rows={d.U} name="U" note={d.flip < 0 ? `turn ${fmt(d.beta, 0)}° and flip` : `turn ${fmt(d.beta, 0)}°`} on={active === 2 && t > 2} />,
              <MiniMat
                key="s"
                rows={[
                  [d.s1, 0],
                  [0, d.s2],
                ]}
                name="Σ"
                note={`stretch ×${fix(d.s1)}, ×${fix(d.s2)}`}
                on={active === 1 && t > 1 && t <= 2}
              />,
              <MiniMat key="v" rows={d.Vt} name="Vᵀ" note={`turn ${fmt(-d.alpha, 0)}°`} on={active === 0 && t > 0 && t <= 1} />,
            ]}
          />
          <div className={s.formula}>
            Read it right to left: <b>Vᵀ</b> acts first, then <b>Σ</b>, then <b>U</b>.
            <br />
            singular values <span className={`${s.mono} ${s.c2}`}>σ₁ = {fix(d.s1)}</span>, <span className={`${s.mono} ${s.c3}`}>σ₂ = {fix(d.s2)}</span>
            <br />
            non-zero singular values = rank = <b>{rank}</b>; <span className={s.mono}>σ₁ × σ₂ = {fix(d.s1 * d.s2)} = |det A|</span>
          </div>
        </div>
      </div>
      <div className={s.row}>
        <Button onClick={() => (setTarget(null), setT(0))}>Restart</Button>
        <Button onClick={() => go(Math.ceil(t - 1.001))} disabled={t <= 0}>
          Back
        </Button>
        <Button primary onClick={() => (t >= 3 ? (setT(0), setTarget(3)) : go(Math.floor(t + 1.001)))}>
          {t >= 3 ? 'Replay all' : 'Next stage'}
        </Button>
      </div>
      <Controls>
        <Slider label="scrub through the three moves" value={Math.round(t * 100) / 100} min={0} max={3} step={0.01} onChange={(v) => (setTarget(null), setT(v))} format={(v) => v.toFixed(2)} />
      </Controls>
      <div className={s.matSliders}>
        <Slider label="a" value={A[0][0]} min={-2} max={2} step={0.1} onChange={(v) => setEntry(0, 0, v)} format={(v) => fmt(v, 1)} />
        <Slider label="b" value={A[0][1]} min={-2} max={2} step={0.1} onChange={(v) => setEntry(0, 1, v)} format={(v) => fmt(v, 1)} />
        <Slider label="c" value={A[1][0]} min={-2} max={2} step={0.1} onChange={(v) => setEntry(1, 0, v)} format={(v) => fmt(v, 1)} />
        <Slider label="d" value={A[1][1]} min={-2} max={2} step={0.1} onChange={(v) => setEntry(1, 1, v)} format={(v) => fmt(v, 1)} />
      </div>
    </Figure>
  )
}
