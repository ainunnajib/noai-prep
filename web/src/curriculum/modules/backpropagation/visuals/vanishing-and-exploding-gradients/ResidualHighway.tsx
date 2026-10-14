import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Button, M, useAnimationFrame, useContainerWidth } from '../../../../../kit'
import { makeBlocks, highwayNorms } from './highway'
import { sci } from './sim'

/*
  Two stacks built from the SAME blocks. Top: plain (y = F(x)). Bottom: residual (y = x + F(x)), with a skip arc
  over every block. A pulse of gradient travels from the loss (right) back to the input (left); each block lights up
  with the size of the gradient that reaches it. Blue and fading = vanishing, green = healthy, orange = growing.
*/

const DURATION = 2.6 // seconds for the pulse to cross the stack

function shade(g: number): { fill: string; stroke: string; lg: number } {
  const lg = Math.log10(Math.max(1e-300, g))
  if (lg < -1) {
    const t = Math.max(0, Math.min(1, (lg + 10) / 9))
    return { fill: `color-mix(in srgb, var(--viz-1) ${Math.round(4 + t * 62)}%, var(--surface))`, stroke: `color-mix(in srgb, var(--viz-1) ${Math.round(25 + t * 60)}%, var(--surface))`, lg }
  }
  if (lg > 1) return { fill: 'color-mix(in srgb, var(--viz-2) 70%, var(--surface))', stroke: 'var(--viz-2)', lg }
  return { fill: 'color-mix(in srgb, var(--viz-3) 66%, var(--surface))', stroke: 'var(--viz-3)', lg }
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
}: {
  W: number
  y: number
  depth: number
  at: number[]
  atInput: number
  residual: boolean
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
      <rect x={cx(depth + 1) - 9} y={y - 9} width={18} height={18} rx={3} style={{ fill: 'color-mix(in srgb, var(--viz-3) 66%, var(--surface))', stroke: 'var(--viz-ink)', strokeWidth: 1.5 }} />
      <text x={cx(depth + 1)} y={y + bh / 2 + 15} textAnchor="middle" style={{ fill: 'var(--viz-axis)', fontSize: 11 }}>
        loss
      </text>
      {/* the travelling pulse */}
      {front > 0.001 && front < depth + 1 && (
        <circle cx={left + unit * front} cy={y} r={pulseR} style={{ fill: pulse.stroke, stroke: 'var(--surface)', strokeWidth: 2 }} />
      )}
      <text x={cx(0) - 10} y={y + bh / 2 + 32} style={{ fill: 'var(--viz-ink)', fontSize: 12 }}>
        <tspan style={{ fontWeight: 700 }}>reaches the input at ×{reached(0) ? sci(atInput) : '…'}</tspan>
      </text>
    </g>
  )
}

export default function ResidualHighway() {
  const [depth, setDepth] = useState(20)
  const [s, setS] = useState(0.3)
  const [front, setFront] = useState(0) // 0 = pulse has reached the input (complete at rest)
  const [playing, setPlaying] = useState(false)
  const [wrapRef, measured] = useContainerWidth<HTMLDivElement>(600)
  const W = Math.max(280, Math.min(720, measured))
  const blocks = useMemo(() => makeBlocks(2024), [])
  const plain = useMemo(() => highwayNorms(blocks, depth, s, false), [blocks, depth, s])
  const res = useMemo(() => highwayNorms(blocks, depth, s, true), [blocks, depth, s])

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
          Press <b>Send the gradient back</b> and follow the pulse from the loss to the input. Both stacks use exactly the same blocks; on its own,
          each block shrinks the gradient to about <M>s</M> of its size. In the plain stack those factors multiply and the pulse fades to almost
          nothing. In the residual stack every block computes <M>{'y = x + F(x)'}</M>, so the gradient also flows along each arc unchanged and
          the pulse arrives at full strength (with a large <M>s</M> it even grows a little, which is why real ResNets also use BatchNorm). Add
          blocks: the plain stack gets dimmer and dimmer, the residual one does not.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Plain stack: gradient reaches the input at ${sci(plain.atInput)}. Residual stack: ${sci(res.atInput)}.`} style={{ display: 'block', maxWidth: W }}>
          <Row W={W} y={64} depth={depth} at={plain.at} atInput={plain.atInput} residual={false} front={front} title="Plain: y = F(x)" />
          <Row W={W} y={64 + rowGap} depth={depth} at={res.at} atInput={res.atInput} residual front={front} title="Residual: y = x + F(x)" />
        </svg>
      </div>
      <Controls>
        <Button primary onClick={play} disabled={playing}>
          {playing ? 'Sending…' : 'Send the gradient back'}
        </Button>
        <Slider label="number of blocks" value={depth} min={4} max={30} step={1} onChange={(v) => { setDepth(v); setPlaying(false); setFront(0) }} />
        <Slider label={<>each block's own factor <M>s</M></>} value={s} min={0.1} max={0.6} step={0.05} onChange={(v) => { setS(v); setPlaying(false); setFront(0) }} format={(v) => v.toFixed(2)} />
      </Controls>
    </Figure>
  )
}
