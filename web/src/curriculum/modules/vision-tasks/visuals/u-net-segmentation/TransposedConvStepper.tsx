import { useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Controls, Segmented, Toggle, Readout, M, MatrixGrid, usePlayer, PlayerControls, useContainerWidth } from '../../../../../kit'

/*
  Transposed convolution as stamping. Each input value x[a][b] multiplies the whole kernel W, and that k x k "stamp" is added
  into the output with its top-left corner at (a*s, b*s). Where stamps overlap, the values add. Padding p then trims p rows and
  columns from every edge. Output size: (n - 1)s - 2p + k. Checked against torch.nn.ConvTranspose2d (no kernel flip).
*/

const X = [
  [1, 2],
  [3, 4],
]
const NIN = 2
const KERNELS: Record<'ones' | 'weighted', Record<2 | 3, number[][]>> = {
  ones: {
    2: [
      [1, 1],
      [1, 1],
    ],
    3: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
  },
  weighted: {
    2: [
      [1, 2],
      [0, 1],
    ],
    3: [
      [0, 1, 0],
      [1, 2, 1],
      [0, 1, 0],
    ],
  },
}
const STAMP_COLORS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)']
const ORDER: [number, number][] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
]

const cellBase: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  borderRadius: 5,
  fontFamily: 'var(--font-mono)',
  fontWeight: 700,
  boxSizing: 'border-box',
  border: '1.5px solid transparent',
}

function Small({ data, label, size, color, highlight }: { data: number[][]; label: ReactNode; size: number; color?: string; highlight?: [number, number] }) {
  return (
    <div style={{ display: 'grid', gap: '0.25rem', justifyItems: 'center' }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-2)' }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data[0].length}, ${size}px)`, gap: 3 }}>
        {data.map((row, i) =>
          row.map((v, j) => {
            const hl = highlight && highlight[0] === i && highlight[1] === j
            return (
              <div
                key={`${i}-${j}`}
                style={{
                  ...cellBase,
                  height: size,
                  fontSize: size < 30 ? '0.72rem' : '0.85rem',
                  color: 'var(--ink)',
                  background: color ? `color-mix(in srgb, ${color} ${hl ? 38 : 16}%, var(--surface))` : 'var(--surface-2)',
                  borderColor: hl ? color ?? 'var(--accent)' : 'transparent',
                }}
              >
                {v}
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}

export default function TransposedConvStepper() {
  const [k, setK] = useState<2 | 3>(3)
  const [s, setS] = useState<1 | 2 | 3>(2)
  const [p, setP] = useState<0 | 1>(0)
  const [kind, setKind] = useState<'ones' | 'weighted'>('ones')
  const [showCover, setShowCover] = useState(false)
  const [sel, setSel] = useState<[number, number] | null>(null)
  const player = usePlayer({ steps: 5, interval: 1100 })
  const [ref, width] = useContainerWidth<HTMLDivElement>(560)

  const W = KERNELS[kind][k]
  const F = (NIN - 1) * s + k // full size before trimming padding
  const O = F - 2 * p
  const placed = Math.min(4, player.step + 1) // stamps placed so far
  const current = player.step < 4 ? player.step : -1
  const final = player.step === 4

  // running sums and coverage
  const out = Array.from({ length: F }, () => Array(F).fill(0) as number[])
  const cover = Array.from({ length: F }, () => Array(F).fill(0) as number[])
  const owner = Array.from({ length: F }, () => Array(F).fill(-1) as number[])
  for (let t = 0; t < placed; t++) {
    const [a, b] = ORDER[t]
    for (let r = 0; r < k; r++)
      for (let c = 0; c < k; c++) {
        out[a * s + r][b * s + c] += X[a][b] * W[r][c]
        cover[a * s + r][b * s + c] += 1
        owner[a * s + r][b * s + c] = t
      }
  }

  // default selection: the first cell with an overlap, else the top-left cell
  let chosen = sel
  if (!chosen || chosen[0] >= F || chosen[1] >= F) {
    chosen = [0, 0]
    outer: for (let i = 0; i < F; i++)
      for (let j = 0; j < F; j++)
        if (cover[i][j] >= 2) {
          chosen = [i, j]
          break outer
        }
  }
  const [si, sj] = chosen
  const terms: { a: number; b: number; r: number; c: number }[] = []
  for (let t = 0; t < placed; t++) {
    const [a, b] = ORDER[t]
    const r = si - a * s
    const c = sj - b * s
    if (r >= 0 && r < k && c >= 0 && c < k) terms.push({ a, b, r, c })
  }
  const expl =
    terms.length === 0 ? (
      <>no stamp covers this cell (yet), so it stays 0.</>
    ) : (
      <M>{`${terms.map((t) => `x_{${t.a}${t.b}} W_{${t.r}${t.c}}`).join(' + ')} = ${terms.map((t) => `${X[t.a][t.b]}\\cdot ${W[t.r][t.c]}`).join(' + ')} = ${out[si][sj]}`}</M>
    )

  const cs = Math.max(30, Math.min(52, Math.floor((Math.min(width, 520) - 16) / F) - 4))
  const small = Math.max(22, Math.min(40, Math.floor((Math.min(width, 560) - 100) / (2 + 2 * k)) - 3))
  const [ca, cb] = current >= 0 ? ORDER[current] : [-1, -1]
  const stampData = current >= 0 ? W.map((row) => row.map((w) => X[ca][cb] * w)) : null

  // coverage pattern for a bigger (5x5) input of ones with a kernel of ones
  const n5 = 5
  const F5 = (n5 - 1) * s + k
  const cover5 = Array.from({ length: F5 }, () => Array(F5).fill(0) as number[])
  for (let a = 0; a < n5; a++) for (let b = 0; b < n5; b++) for (let r = 0; r < k; r++) for (let c = 0; c < k; c++) cover5[a * s + r][b * s + c] += 1
  const pattern = k < s ? 'gaps' : k % s === 0 ? 'even' : 'checker'
  const cell5 = Math.max(16, Math.min(26, Math.floor((Math.min(width, 520) - 10) / F5)))

  const stepLabel = (st: number) => (st < 4 ? `Stamp ${st + 1} of 4` : p > 0 ? 'Trim the padding' : 'Done')

  return (
    <Figure
      title="Transposed convolution: stamp, shift, add"
      caption={
        <>
          Press <b>Next</b> (or Play). Each input value multiplies the whole kernel, and that stamp is added to the output, shifted by the
          stride. Cells covered by two or more stamps (thick border) add up. Click any output cell to see its sum. Try kernel 3 with stride 2:
          the middle row and column collect extra stamps. Then switch on the overlap pattern to see why that causes checkerboard artefacts.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', gap: '0.9rem', justifyItems: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', alignItems: 'end', justifyContent: 'center' }}>
          <Small data={X} label={<>input x (2×2)</>} size={small} color="var(--viz-1)" highlight={current >= 0 ? ORDER[current] : undefined} />
          <div style={{ fontSize: '1.2rem', color: 'var(--ink-3)', paddingBottom: small / 2 - 8 }}>×</div>
          <Small data={W} label={<>kernel W ({k}×{k})</>} size={small} />
          {stampData && (
            <>
              <div style={{ fontSize: '1.2rem', color: 'var(--ink-3)', paddingBottom: small / 2 - 8 }}>=</div>
              <Small data={stampData} label={<>stamp {X[ca][cb]}·W</>} size={small} color={STAMP_COLORS[current]} />
            </>
          )}
        </div>

        <div style={{ display: 'grid', gap: '0.3rem', justifyItems: 'center' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-2)' }}>
            output ({final && p > 0 ? `${F}×${F} trimmed to ${O}×${O}` : `${F}×${F}`})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${F}, ${cs}px)`, gap: 3 }} role="grid" aria-label="output grid">
            {out.map((row, i) =>
              row.map((v, j) => {
                const isCur = current >= 0 && owner[i][j] >= 0 && i >= ca * s && i < ca * s + k && j >= cb * s && j < cb * s + k
                const cov = cover[i][j]
                const trimmed = final && p > 0 && (i < p || j < p || i >= F - p || j >= F - p)
                const isSel = i === si && j === sj
                const col = isCur ? STAMP_COLORS[current] : cov > 0 ? 'var(--viz-1)' : null
                const pct = isCur ? 34 : Math.min(48, 10 + 14 * cov)
                const style: CSSProperties = {
                  ...cellBase,
                  height: cs,
                  fontSize: cs < 36 ? '0.75rem' : '0.9rem',
                  cursor: 'pointer',
                  color: cov ? 'var(--ink)' : 'var(--ink-3)',
                  background: trimmed ? 'var(--surface-3)' : col ? `color-mix(in srgb, ${col} ${pct}%, var(--surface))` : 'var(--surface-2)',
                  borderColor: isSel ? 'var(--accent)' : cov >= 2 ? 'var(--viz-ink)' : 'transparent',
                  borderWidth: isSel ? 3 : cov >= 2 ? 2 : 1.5,
                  opacity: trimmed ? 0.45 : 1,
                  textDecoration: trimmed ? 'line-through' : undefined,
                }
                return (
                  <button
                    key={`${i}-${j}`}
                    type="button"
                    style={style}
                    onClick={() => setSel([i, j])}
                    aria-label={`output row ${i}, column ${j}: ${v}${cov >= 2 ? `, ${cov} stamps overlap` : ''}`}
                  >
                    {v}
                  </button>
                )
              }),
            )}
          </div>
        </div>
        <div style={{ fontSize: '0.92rem', color: 'var(--ink)', textAlign: 'center', maxWidth: '100%' }}>
          cell (row {si}, col {sj}) = {expl}
        </div>

        {showCover && (
          <div style={{ display: 'grid', gap: '0.35rem', justifyItems: 'center', maxWidth: '100%' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center' }}>
              How many stamps land on each output pixel (5×5 input, k = {k}, s = {s})
            </div>
            <MatrixGrid data={cover5} heat={[0, Math.max(...cover5.flat())]} cellSize={cell5} brackets={false} ariaLabel="coverage counts" />
            <div style={{ fontSize: '0.86rem', color: 'var(--ink-2)', textAlign: 'center', maxWidth: 460 }}>
              {pattern === 'gaps' && <>Kernel smaller than the stride: some pixels get <b>no</b> stamp at all, leaving a grid of gaps.</>}
              {pattern === 'checker' && (
                <>
                  The kernel size ({k}) is not a multiple of the stride ({s}), so neighbouring pixels get different numbers of stamps: a{' '}
                  <b>checkerboard</b> pattern that a network has to fight to hide.
                </>
              )}
              {pattern === 'even' && <>The kernel size is a multiple of the stride, so every pixel away from the edges gets the same number of stamps: no checkerboard.</>}
            </div>
          </div>
        )}
      </div>
      <PlayerControls player={player} label={stepLabel} />
      <Readout
        items={[
          [
            'output size',
            <M key="f">{`(n-1)s - 2p + k = (${NIN}-1)\\cdot ${s} - 2\\cdot ${p} + ${k} = ${O}`}</M>,
          ],
        ]}
      />
      <Controls>
        <Segmented
          label="kernel size k"
          value={k}
          onChange={(v) => {
            setK(v)
            setSel(null)
          }}
          options={[
            { value: 2, label: '2' },
            { value: 3, label: '3' },
          ]}
        />
        <Segmented
          label="stride s"
          value={s}
          onChange={(v) => {
            setS(v)
            setSel(null)
          }}
          options={[
            { value: 1, label: '1' },
            { value: 2, label: '2' },
            { value: 3, label: '3' },
          ]}
        />
        <Segmented
          label="padding p"
          value={p}
          onChange={(v) => {
            setP(v)
            setSel(null)
          }}
          options={[
            { value: 0, label: '0' },
            { value: 1, label: '1' },
          ]}
        />
        <Segmented
          label="kernel values"
          value={kind}
          onChange={setKind}
          options={[
            { value: 'ones', label: 'all 1s' },
            { value: 'weighted', label: 'mixed' },
          ]}
        />
        <Toggle label="show the overlap pattern" checked={showCover} onChange={setShowCover} />
      </Controls>
    </Figure>
  )
}
