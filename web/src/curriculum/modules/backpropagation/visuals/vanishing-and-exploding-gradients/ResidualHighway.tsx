import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Button, M, useAnimationFrame, useContainerWidth } from '../../../../../kit'
import { highwayNorms } from './highway'
import { sci, SIZE_COLOUR } from './sim'

/*
  Two stacks built from the SAME blocks, each with its own derivative F′ = s. Top: plain (y = F(x)), so every
  block multiplies the gradient by s. Bottom: residual (y = x + F(x)), with a skip arc over every block, so every
  block multiplies it by 1 + s. A pulse of gradient travels from the loss (right) back to the input (left); each
  block lights up with the size of the gradient that reaches it, in the module's size colours: indigo and fading =
  vanishing, green = healthy (within ×10), red = exploding.
*/

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const sup = (n: number) => String(n).split('').map((c) => SUP[c] ?? c).join('')

const DURATION = 2.6 // seconds for the pulse to cross the stack

function shade(g: number): { fill: string; stroke: string; lg: number } {
  const lg = Math.log10(Math.max(1e-300, g))
  if (lg < -1) {
    const t = Math.max(0, Math.min(1, (lg + 10) / 9))
    return {
      fill: `color-mix(in srgb, ${SIZE_COLOUR.vanishing} ${Math.round(4 + t * 62)}%, var(--surface))`,
      stroke: `color-mix(in srgb, ${SIZE_COLOUR.vanishing} ${Math.round(25 + t * 60)}%, var(--surface))`,
      lg,
    }
  }
  if (lg > 1) return { fill: `color-mix(in srgb, ${SIZE_COLOUR.exploding} 70%, var(--surface))`, stroke: SIZE_COLOUR.exploding, lg }
  return { fill: `color-mix(in srgb, ${SIZE_COLOUR.healthy} 66%, var(--surface))`, stroke: SIZE_COLOUR.healthy, lg }
}

function Row({
  W,
  y,
  depth,
  at,
  atInput,
  residual,
  front,
  title,
  formula,
}: {
  W: number
  y: number
  depth: number
  at: number[]
  atInput: number
  residual: boolean
  /** how the arrival size is computed, e.g. "1.10²⁰" */
  formula: string
  /** pulse position in block units: depth + 1 = at the loss, 0 = at the input */
  front: number
  title: string
}) {
  const left = 30
  const right = W - 30
  const unit = (right - left) / (depth + 1)
  const cx = (i: number) => left + unit * i // 0 = input, 1..depth = blocks, depth+1 = loss
  const bw = Math.max(6, Math.min(30, unit * 0.62))
  const bh = Math.max(16, Math.min(30, bw * 1.25))
  // gradient size at the pulse (log-interpolated between neighbouring blocks)
  const valueAt = (pos: number) => {
    const vals = [atInput, ...at, 1]
    const i = Math.max(0, Math.min(vals.length - 2, Math.floor(pos)))
    const t = Math.max(0, Math.min(1, pos - i))
    const a = Math.log10(Math.max(1e-300, vals[i]))
    const b = Math.log10(Math.max(1e-300, vals[i + 1]))
    return 10 ** (a + (b - a) * t)
  }
  const pulseVal = valueAt(front)
  const pulse = shade(pulseVal)
  const pulseR = Math.max(2.5, Math.min(11, 7 + 1.4 * Math.max(-3.5, Math.min(2, pulse.lg))))
  const reached = (pos: number) => pos >= front - 1e-9
  const inShade = reached(0) ? shade(atInput) : null
  return (
    <g>
      <text x={left - 22} y={y - bh / 2 - (residual ? 32 : 12)} style={{ fill: 'var(--viz-ink)', fontSize: 13, fontWeight: 700 }}>
        {title}
      </text>
      <line x1={cx(0)} x2={cx(depth + 1)} y1={y} y2={y} style={{ stroke: 'var(--viz-muted)', strokeWidth: 2 }} />
      {residual &&
        Array.from({ length: depth }, (_, i) => {
          const x = cx(i + 1)
          const hgt = Math.min(22, bh * 0.55 + 8)
          const x0 = x - unit / 2 + 1
          const x1 = x + unit / 2 - 1
          const lit = reached(i + 1)
          const s = shade(at[i])
          return (
            <path
              key={`arc${i}`}
              d={`M${x0},${y} C${x0},${y - bh / 2 - hgt} ${x1},${y - bh / 2 - hgt} ${x1},${y}`}
              style={{ fill: 'none', stroke: lit ? s.stroke : 'var(--viz-muted)', strokeWidth: lit ? 2 : 1.25, opacity: lit ? 1 : 0.6 }}
            />
          )
        })}
      {Array.from({ length: depth }, (_, i) => {
        const x = cx(i + 1)
        const lit = reached(i + 1)
        const s = shade(at[i])
        return (
          <rect
            key={`b${i}`}
            x={x - bw / 2}
            y={y - bh / 2}
            width={bw}
            height={bh}
            rx={Math.min(5, bw / 4)}
            style={{ fill: lit ? s.fill : 'var(--surface-2)', stroke: lit ? s.stroke : 'var(--viz-muted)', strokeWidth: 1.5 }}
          />
        )
      })}
      {/* input and loss */}
      <circle cx={cx(0)} cy={y} r={9} style={{ fill: inShade ? inShade.fill : 'var(--surface-2)', stroke: 'var(--viz-ink)', strokeWidth: 1.5 }} />
      <text x={cx(0)} y={y + bh / 2 + 15} textAnchor="middle" style={{ fill: 'var(--viz-axis)', fontSize: 11 }}>
        input
      </text>
      <rect x={cx(depth + 1) - 9} y={y - 9} width={18} height={18} rx={3} style={{ fill: `color-mix(in srgb, ${SIZE_COLOUR.healthy} 66%, var(--surface))`, stroke: 'var(--viz-ink)', strokeWidth: 1.5 }} />
      <text x={cx(depth + 1)} y={y + bh / 2 + 15} textAnchor="middle" style={{ fill: 'var(--viz-axis)', fontSize: 11 }}>
        loss
      </text>
      {/* the travelling pulse */}
      {front > 0.001 && front < depth + 1 && (
        <circle cx={left + unit * front} cy={y} r={pulseR} style={{ fill: pulse.stroke, stroke: 'var(--surface)', strokeWidth: 2 }} />
      )}
      <text x={cx(0) - 10} y={y + bh / 2 + 32} style={{ fill: 'var(--viz-ink)', fontSize: 12.5 }}>
        <tspan style={{ fontWeight: 700 }}>reaches the input at ×{reached(0) ? sci(atInput) : '…'}</tspan>
        {reached(0) && <tspan style={{ fill: 'var(--ink-2)' }}>{`  = ${formula}`}</tspan>}
      </text>
    </g>
  )
}

export default function ResidualHighway() {
  const [depth, setDepth] = useState(20)
  const [s, setS] = useState(0.1)
  const [front, setFront] = useState(0) // 0 = pulse has reached the input (complete at rest)
  const [playing, setPlaying] = useState(false)
  const [wrapRef, measured] = useContainerWidth<HTMLDivElement>(600)
  const W = Math.max(280, Math.min(720, measured))
  const plain = useMemo(() => highwayNorms(depth, s, false), [depth, s])
  const res = useMemo(() => highwayNorms(depth, s, true), [depth, s])

  useAnimationFrame((dt) => {
    setFront((f) => {
      const nf = f - (dt / DURATION) * (depth + 1)
      if (nf <= 0) {
        setPlaying(false)
        return 0
      }
      return nf
    })
  }, playing)

  const play = () => {
    setFront(depth + 1)
    setPlaying(true)
  }
  const rowGap = 120
  const H = 64 + rowGap + 60

  return (
    <Figure
      title={`The same ${depth} blocks, with and without skip connections`}
      caption={
        <>
          Press <b>Send the gradient back</b> and follow the pulse from the loss to the input. Both stacks use exactly the same blocks, each with
          its own derivative <M>{"F' = s"}</M>. The plain stack multiplies by <M>s</M> at every block, so after <M>D</M> blocks the pulse is{' '}
          <M>{'s^D'}</M>: almost nothing. In the residual stack every block computes <M>{'y = x + F(x)'}</M>, so it multiplies by{' '}
          <M>{'1 + s'}</M> and the pulse arrives at <M>{'(1 + s)^D'}</M>, never weaker than it started (here every <M>s</M> is positive; in a real
          network <M>{"F'"}</M> can be negative, so the skip path guarantees a direct route for the gradient, not that it can never shrink). With a
          large <M>s</M> or many blocks it grows (try <M>s = 0.3</M> with 30 blocks), one reason real ResNets also use BatchNorm.
        </>
      }
    >
      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '0.25rem 1rem', fontSize: '0.84rem', color: 'var(--ink-2)' }}>
        <span>Block colour = size of the gradient reaching it:</span>
        {[
          [SIZE_COLOUR.vanishing, 'shrinking (fades as it vanishes)'],
          [SIZE_COLOUR.healthy, 'about 1 (within ×10)'],
          [SIZE_COLOUR.exploding, 'growing'],
        ].map(([c, t]) => (
          <span key={t}>
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: c, verticalAlign: '-0.1em', marginRight: 5 }} />
            {t}
          </span>
        ))}
      </div>
      <div ref={wrapRef} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Plain stack: gradient reaches the input at ${sci(plain.atInput)}. Residual stack: ${sci(res.atInput)}.`} style={{ display: 'block', maxWidth: W }}>
          <Row W={W} y={64} depth={depth} at={plain.at} atInput={plain.atInput} residual={false} front={front} title="Plain: y = F(x)" formula={`(${s.toFixed(2)})${sup(depth)}`} />
          <Row W={W} y={64 + rowGap} depth={depth} at={res.at} atInput={res.atInput} residual front={front} title="Residual: y = x + F(x)" formula={`(${(1 + s).toFixed(2)})${sup(depth)}`} />
        </svg>
      </div>
      <Controls>
        <Button primary onClick={play} disabled={playing}>
          {playing ? 'Sending…' : 'Send the gradient back'}
        </Button>
        <Slider label="number of blocks" value={depth} min={4} max={30} step={1} onChange={(v) => { setDepth(v); setPlaying(false); setFront(0) }} />
        <Slider label={<>each block's own derivative <M>{"F' = s"}</M></>} value={s} min={0.02} max={0.3} step={0.02} onChange={(v) => { setS(v); setPlaying(false); setFront(0) }} format={(v) => v.toFixed(2)} />
      </Controls>
    </Figure>
  )
}
