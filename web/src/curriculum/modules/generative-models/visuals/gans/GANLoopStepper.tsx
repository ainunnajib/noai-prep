import { type ReactNode } from 'react'
import { Figure, CodeBlock, usePlayer, PlayerControls, useNarrow, mulberry32 } from '../../../../../kit'

/*
  One round of GAN training, step by step: which network runs, which one learns, and where the
  gradients flow. The highlighted code lines are the same training loop shown in the lesson.
*/

const CODE = `for real in loader:                  # real images, target 1
    z = torch.randn(B, z_dim)        # random noise
    fake = G(z)                      # fakes, target 0

    # --- discriminator's turn (G frozen) ---
    loss_D = bce(D(real), ones) + bce(D(fake.detach()), zeros)
    opt_D.zero_grad()
    loss_D.backward()                # gradients reach D only
    opt_D.step()                     # update D

    # --- generator's turn (D frozen) ---
    loss_G = bce(D(fake), ones)      # "call these real"
    opt_G.zero_grad()
    loss_G.backward()                # gradients flow through D into G
    opt_G.step()                     # update G only`

/** the same loop without end-of-line comments, for phones */
const CODE_NARROW = `for real in loader:
    z = torch.randn(B, z_dim)
    fake = G(z)

    # D's turn (G frozen)
    out_r = D(real)
    out_f = D(fake.detach())
    loss_D = (bce(out_r, ones)
            + bce(out_f, zeros))
    opt_D.zero_grad()
    loss_D.backward()
    opt_D.step()

    # G's turn (D frozen)
    loss_G = bce(D(fake), ones)
    opt_G.zero_grad()
    loss_G.backward()
    opt_G.step()`

/** wide line number -> narrow line number(s) */
const NARROW_LINES: Record<number, number[]> = { 1: [1], 2: [2], 3: [3], 5: [5], 6: [6, 7, 8, 9], 7: [10], 8: [11], 9: [12], 11: [14], 12: [15], 13: [16], 14: [17], 15: [18] }

type NodeId = 'z' | 'G' | 'fakes' | 'data' | 'reals' | 'D' | 'outF' | 'outR' | 'loss'
interface Box {
  x: number
  y: number
  w: number
  h: number
}
type Layout = { W: number; H: number; box: Record<NodeId, Box>; badgeG: [number, number]; badgeD: [number, number] }

const WIDE: Layout = {
  W: 690,
  H: 262,
  box: {
    z: { x: 8, y: 34, w: 84, h: 44 },
    G: { x: 112, y: 22, w: 88, h: 68 },
    fakes: { x: 246, y: 36, w: 112, h: 40 },
    data: { x: 8, y: 166, w: 84, h: 44 },
    reals: { x: 246, y: 168, w: 112, h: 40 },
    D: { x: 392, y: 88, w: 92, h: 68 },
    outF: { x: 520, y: 18, w: 162, h: 44 },
    outR: { x: 520, y: 182, w: 162, h: 44 },
    loss: { x: 520, y: 88, w: 162, h: 68 },
  },
  badgeG: [156, 98],
  badgeD: [438, 164],
}

const NARROW: Layout = {
  W: 340,
  H: 506,
  box: {
    z: { x: 8, y: 8, w: 110, h: 40 },
    G: { x: 18, y: 72, w: 90, h: 62 },
    fakes: { x: 8, y: 188, w: 110, h: 40 },
    data: { x: 222, y: 8, w: 110, h: 40 },
    reals: { x: 222, y: 188, w: 110, h: 40 },
    D: { x: 125, y: 262, w: 90, h: 62 },
    outF: { x: 8, y: 362, w: 150, h: 46 },
    outR: { x: 182, y: 362, w: 150, h: 46 },
    loss: { x: 60, y: 432, w: 220, h: 68 },
  },
  badgeG: [162, 94],
  badgeD: [270, 284],
}

interface Phase {
  title: string
  text: ReactNode
  lines: number[]
  active: NodeId[]
  g: 'idle' | 'forward' | 'updated' | 'frozen'
  d: 'idle' | 'forward' | 'updated' | 'frozen'
  grad: 'none' | 'D' | 'DG'
  fakeTarget?: string
  loss?: string[]
  outF?: string
  outR?: string
}

const PHASES: Phase[] = [
  {
    title: '1 · Real batch',
    text: <>Take a mini-batch of real images from the training set. For the discriminator they carry the target label <b>1 = real</b>.</>,
    lines: [1],
    active: ['data', 'reals'],
    g: 'idle',
    d: 'idle',
    grad: 'none',
  },
  {
    title: '2 · Make fakes',
    text: <>Draw random noise <i>z</i> and run the generator forward. Its outputs are the fakes, with target label <b>0 = fake</b> for D's lesson.</>,
    lines: [2, 3],
    active: ['z', 'G', 'fakes'],
    g: 'forward',
    d: 'idle',
    grad: 'none',
    fakeTarget: 'target 0',
  },
  {
    title: "3 · Discriminator's turn",
    text: (
      <>
        D scores both batches and is graded with binary cross-entropy: real should get 1, fake should get 0. Gradients flow into <b>D only</b>; <code>.detach()</code>{' '}
        cuts the path back into G, so G is untouched.
      </>
    ),
    lines: [5, 6, 7, 8, 9],
    active: ['reals', 'fakes', 'D', 'outF', 'outR', 'loss'],
    g: 'frozen',
    d: 'updated',
    grad: 'D',
    fakeTarget: 'target 0',
    loss: ['loss_D', '= −ln 0.8 − ln(1 − 0.3)', '≈ 0.22 + 0.36 = 0.58'],
    outF: 'D(fake) = 0.3',
    outR: 'D(real) = 0.8',
  },
  {
    title: "4 · Generator's turn",
    text: (
      <>
        Now the fakes are scored again by the improved D, but this time with the target <b>1</b>: G wants D to call them real. The gradient travels back{' '}
        <b>through D</b> (whose weights stay frozen) <b>into G</b>, and only G is updated. G never touches a real image.
      </>
    ),
    lines: [11, 12, 13, 14, 15],
    active: ['fakes', 'D', 'outF', 'loss', 'G'],
    g: 'updated',
    d: 'frozen',
    grad: 'DG',
    fakeTarget: 'target 1',
    loss: ['loss_G', '= −ln 0.2', '≈ 1.61'],
    outF: 'D(fake) = 0.2',
  },
  {
    title: '5 · Repeat',
    text: (
      <>
        Next batch, same two turns. Each player's improvement makes the other's job harder. If all goes well, the fakes end up so realistic that D outputs about{' '}
        <b>0.5</b> for everything: a coin flip.
      </>
    ),
    lines: [1],
    active: ['data', 'reals', 'z', 'G', 'fakes', 'D', 'outF', 'outR'],
    g: 'idle',
    d: 'idle',
    grad: 'none',
    outF: 'D(fake) → 0.5',
    outR: 'D(real) → 0.5',
  },
]

/** a tiny 5×5 "image" */
function TinyImage({ x, y, size, kind, seed, dim }: { x: number; y: number; size: number; kind: 'real' | 'fake'; seed: number; dim: boolean }) {
  const px = size / 5
  const pats = [
    [0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
  ]
  const rng = mulberry32(seed)
  const base = pats[seed % 3]
  const cells = base.map((v) => (kind === 'real' ? v : Math.max(0, Math.min(1, 0.55 * v + 0.45 * rng() + (rng() - 0.5) * 0.3))))
  const col = kind === 'real' ? 'var(--viz-1)' : 'var(--viz-3)'
  return (
    <g opacity={dim ? 0.35 : 1}>
      {cells.map((v, i) => (
        <rect
          key={i}
          x={x + (i % 5) * px}
          y={y + Math.floor(i / 5) * px}
          width={px}
          height={px}
          style={{ fill: `color-mix(in srgb, ${col} ${Math.round(8 + v * 82)}%, var(--surface))` }}
        />
      ))}
      <rect x={x} y={y} width={size} height={size} style={{ fill: 'none', stroke: 'var(--viz-axis)', strokeWidth: 0.8 }} />
    </g>
  )
}

const cx = (b: Box) => b.x + b.w / 2
const cy = (b: Box) => b.y + b.h / 2

/** point on the border of box b in the direction of (tx, ty) */
function edgePoint(b: Box, tx: number, ty: number): [number, number] {
  const dx = tx - cx(b)
  const dy = ty - cy(b)
  const sx = dx === 0 ? Infinity : b.w / 2 / Math.abs(dx)
  const sy = dy === 0 ? Infinity : b.h / 2 / Math.abs(dy)
  const s = Math.min(sx, sy)
  return [cx(b) + dx * s, cy(b) + dy * s]
}

function ArrowLine({ from, to, color, dash, width = 2, offset = 0 }: { from: Box; to: Box; color: string; dash?: string; width?: number; offset?: number }) {
  let [x1, y1] = edgePoint(from, cx(to), cy(to))
  let [x2, y2] = edgePoint(to, cx(from), cy(from))
  const len = Math.hypot(x2 - x1, y2 - y1) || 1
  const ux = (x2 - x1) / len
  const uy = (y2 - y1) / len
  // shift sideways (to draw a backward arrow next to a forward one)
  x1 += -uy * offset
  x2 += -uy * offset
  y1 += ux * offset
  y2 += ux * offset
  x2 -= ux * 3
  y2 -= uy * 3
  const h = 8
  const bx = x2 - ux * h
  const by = y2 - uy * h
  return (
    <g>
      <line x1={x1 + ux * 3} y1={y1 + uy * 3} x2={bx} y2={by} style={{ stroke: color, strokeWidth: width, strokeDasharray: dash }} strokeLinecap="round" />
      <path d={`M${x2},${y2}L${bx - uy * 4.5},${by + ux * 4.5}L${bx + uy * 4.5},${by - ux * 4.5}Z`} style={{ fill: color }} />
    </g>
  )
}

function Badge({ x, y, state }: { x: number; y: number; state: Phase['g'] }) {
  if (state === 'idle') return null
  const text = state === 'updated' ? 'learning' : state === 'frozen' ? 'frozen' : 'forward only'
  const col = state === 'updated' ? 'var(--viz-pos)' : state === 'frozen' ? 'var(--viz-1)' : 'var(--viz-muted)'
  const w = text.length * 6.6 + 14
  return (
    <g>
      <rect x={x - w / 2} y={y} width={w} height={18} rx={9} style={{ fill: `color-mix(in srgb, ${col} 18%, var(--surface))`, stroke: col, strokeWidth: 1 }} />
      <text x={x} y={y + 13} textAnchor="middle" style={{ fontSize: 11.5, fontWeight: 700, fill: 'var(--ink)' }}>
        {text}
      </text>
    </g>
  )
}

function Diagram({ L, ph }: { L: Layout; ph: Phase }) {
  const B = L.box
  const on = (id: NodeId) => ph.active.includes(id)
  const fwd = 'var(--viz-axis)'
  const grad = 'var(--viz-neg)'
  const nodeStyle = (id: NodeId, col = 'var(--viz-ink)') => ({
    fill: on(id) ? `color-mix(in srgb, ${col} 10%, var(--surface))` : 'var(--surface)',
    stroke: on(id) ? col : 'var(--viz-muted)',
    strokeWidth: on(id) ? 2 : 1.2,
    opacity: on(id) ? 1 : 0.55,
  })
  const txt = (id: NodeId) => ({ fontSize: 13, fill: 'var(--ink)', opacity: on(id) ? 1 : 0.5, fontWeight: 600 })
  const trap = (b: Box, narrowRight: boolean) => {
    const i = b.h * 0.22
    return narrowRight
      ? `M${b.x},${b.y} L${b.x + b.w},${b.y + i} L${b.x + b.w},${b.y + b.h - i} L${b.x},${b.y + b.h} Z`
      : `M${b.x},${b.y + i} L${b.x + b.w},${b.y} L${b.x + b.w},${b.y + b.h} L${b.x},${b.y + b.h - i} Z`
  }
  const imgSize = 30
  const imgs = (b: Box, kind: 'real' | 'fake') =>
    [0, 1, 2].map((k) => (
      <TinyImage key={k} x={b.x + 4 + k * (imgSize + 5)} y={b.y + (b.h - imgSize) / 2} size={imgSize} kind={kind} seed={k + (kind === 'fake' ? 10 : 0)} dim={!on(kind === 'real' ? 'reals' : 'fakes')} />
    ))
  const narrow = L === NARROW
  const showFwd = (a: NodeId, b: NodeId) => on(a) && on(b)

  return (
    <svg viewBox={`0 0 ${L.W} ${L.H}`} style={{ width: '100%', maxWidth: L.W * 1.15, display: 'block', margin: '0 auto' }} role="img" aria-label={`GAN training diagram: ${ph.title}`}>
      {/* forward edges */}
      {showFwd('z', 'G') && <ArrowLine from={B.z} to={B.G} color={fwd} />}
      {showFwd('G', 'fakes') && <ArrowLine from={B.G} to={B.fakes} color={fwd} />}
      {showFwd('data', 'reals') && <ArrowLine from={B.data} to={B.reals} color={fwd} />}
      {showFwd('fakes', 'D') && <ArrowLine from={B.fakes} to={B.D} color={fwd} />}
      {showFwd('reals', 'D') && <ArrowLine from={B.reals} to={B.D} color={fwd} />}
      {showFwd('D', 'outF') && <ArrowLine from={B.D} to={B.outF} color={fwd} />}
      {showFwd('D', 'outR') && <ArrowLine from={B.D} to={B.outR} color={fwd} />}
      {ph.loss && showFwd('outF', 'loss') && !narrow && <ArrowLine from={B.outF} to={B.loss} color={fwd} width={1.4} />}
      {ph.loss && showFwd('outR', 'loss') && !narrow && <ArrowLine from={B.outR} to={B.loss} color={fwd} width={1.4} />}
      {ph.loss && narrow && showFwd('outF', 'loss') && <ArrowLine from={B.outF} to={B.loss} color={fwd} width={1.4} />}
      {ph.loss && narrow && showFwd('outR', 'loss') && <ArrowLine from={B.outR} to={B.loss} color={fwd} width={1.4} />}

      {/* gradient (backward) edges */}
      {ph.grad !== 'none' && <ArrowLine from={B.loss} to={B.D} color={grad} dash="6 4" width={2.4} offset={narrow ? 0 : 0} />}
      {ph.grad === 'DG' && (
        <>
          <ArrowLine from={B.D} to={B.fakes} color={grad} dash="6 4" width={2.4} offset={-9} />
          <ArrowLine from={B.fakes} to={B.G} color={grad} dash="6 4" width={2.4} offset={-9} />
        </>
      )}
      {ph.grad === 'D' && (
        <g>
          {(() => {
            const [x, y] = edgePoint(B.fakes, cx(B.G), cy(B.G))
            const [x2, y2] = edgePoint(B.G, cx(B.fakes), cy(B.fakes))
            const mx = (x + x2) / 2
            const my = (y + y2) / 2
            return (
              <g>
                <line x1={mx - 7} y1={my - 7} x2={mx + 7} y2={my + 7} style={{ stroke: grad, strokeWidth: 3 }} />
                <line x1={mx - 7} y1={my + 7} x2={mx + 7} y2={my - 7} style={{ stroke: grad, strokeWidth: 3 }} />
                <text x={mx + (narrow ? 12 : 0)} y={my + (narrow ? 4 : -12)} textAnchor={narrow ? 'start' : 'middle'} style={{ fontSize: 11.5, fill: grad, fontWeight: 700 }}>
                  detach
                </text>
              </g>
            )
          })()}
        </g>
      )}

      {/* nodes */}
      <rect x={B.z.x} y={B.z.y} width={B.z.w} height={B.z.h} rx={8} style={nodeStyle('z')} />
      <text x={cx(B.z)} y={cy(B.z) + 4} textAnchor="middle" style={txt('z')}>
        noise z
      </text>
      <path d={trap(B.G, false)} style={nodeStyle('G', 'var(--viz-3)')} />
      <text x={cx(B.G)} y={cy(B.G) - 2} textAnchor="middle" style={{ ...txt('G'), fontSize: 15 }}>
        G
      </text>
      <text x={cx(B.G)} y={cy(B.G) + 14} textAnchor="middle" style={{ ...txt('G'), fontSize: 11.5, fontWeight: 400 }}>
        generator
      </text>
      <Badge x={L.badgeG[0]} y={L.badgeG[1]} state={ph.g} />

      <rect x={B.data.x} y={B.data.y} width={B.data.w} height={B.data.h} rx={8} style={nodeStyle('data')} />
      <text x={cx(B.data)} y={cy(B.data) + 4} textAnchor="middle" style={txt('data')}>
        training set
      </text>

      {imgs(B.fakes, 'fake')}
      {narrow ? (
        <text x={B.fakes.x + B.fakes.w + 6} y={cy(B.fakes) - 3} style={{ ...txt('fakes'), fontSize: 12 }}>
          <tspan>fakes</tspan>
          {ph.fakeTarget && (
            <tspan x={B.fakes.x + B.fakes.w + 6} dy={15}>
              {ph.fakeTarget}
            </tspan>
          )}
        </text>
      ) : (
        <text x={cx(B.fakes)} y={B.fakes.y - 6} textAnchor="middle" style={{ ...txt('fakes'), fontSize: 12 }}>
          fakes{ph.fakeTarget ? ` · ${ph.fakeTarget}` : ''}
        </text>
      )}
      {imgs(B.reals, 'real')}
      <text x={cx(B.reals)} y={B.reals.y + B.reals.h + 15} textAnchor="middle" style={{ ...txt('reals'), fontSize: 12 }}>
        real · target 1
      </text>

      <path d={trap(B.D, true)} style={nodeStyle('D', 'var(--viz-2)')} />
      <text x={cx(B.D)} y={cy(B.D) - 2} textAnchor="middle" style={{ ...txt('D'), fontSize: 15 }}>
        D
      </text>
      <text x={cx(B.D)} y={cy(B.D) + 14} textAnchor="middle" style={{ ...txt('D'), fontSize: 11.5, fontWeight: 400 }}>
        discriminator
      </text>
      <Badge x={L.badgeD[0]} y={L.badgeD[1]} state={ph.d} />

      {(['outF', 'outR'] as const).map((id) => {
        const t = id === 'outF' ? ph.outF : ph.outR
        const b = B[id]
        return (
          <g key={id}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={8} style={{ ...nodeStyle(id, 'var(--viz-2)'), opacity: t ? 1 : 0.35 }} />
            <text x={cx(b)} y={cy(b) + 4} textAnchor="middle" style={{ fontSize: 12.5, fill: 'var(--ink)', opacity: t ? 1 : 0.5 }}>
              {t ?? (id === 'outF' ? 'D(fake)' : 'D(real)')}
            </text>
          </g>
        )
      })}
      {ph.loss && (
        <g>
          <rect x={B.loss.x} y={B.loss.y} width={B.loss.w} height={B.loss.h} rx={8} style={{ fill: 'color-mix(in srgb, var(--viz-neg) 10%, var(--surface))', stroke: 'var(--viz-neg)', strokeWidth: 1.6 }} />
          {ph.loss.map((part, i) => (
            <text key={i} x={cx(B.loss)} y={cy(B.loss) + (i - (ph.loss!.length - 1) / 2) * 18 + 4} textAnchor="middle" style={{ fontSize: 12.5, fill: 'var(--ink)', fontWeight: i === 0 ? 700 : 400 }}>
              {part}
            </text>
          ))}
        </g>
      )}
    </svg>
  )
}

export default function GANLoopStepper() {
  const player = usePlayer({ steps: PHASES.length, interval: 2600 })
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const ph = PHASES[player.step]
  return (
    <Figure
      wide
      title="One round of GAN training"
      caption={
        <>
          Step through one round. Watch which network <b>learns</b> and which is <b>frozen</b>, and follow the red dashed arrows: they are the gradients. In the
          generator's turn the gradient passes <i>through</i> the discriminator, which is the only way information about real data ever reaches G. Example numbers
          are illustrative.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <Diagram L={narrow ? NARROW : WIDE} ph={ph} />
        <p style={{ margin: '0.5rem auto 0.4rem', maxWidth: 640, fontSize: '0.9375rem', color: 'var(--ink)' }} aria-live="polite">
          <b>{ph.title}.</b> {ph.text}
        </p>
        <CodeBlock code={narrow ? CODE_NARROW : CODE} highlight={narrow ? ph.lines.flatMap((l) => NARROW_LINES[l] ?? []) : ph.lines} title="the training loop" showLineNumbers={!narrow} />
      </div>
      <PlayerControls player={player} label={(s) => `Step ${s + 1} of ${PHASES.length}`} />
    </Figure>
  )
}
