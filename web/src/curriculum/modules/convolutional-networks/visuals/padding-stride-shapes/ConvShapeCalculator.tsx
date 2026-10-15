import { useEffect, useId, useMemo, useState } from 'react'
import { Figure, Controls, Slider, Toggle, Button, M, usePlayer, PlayerControls, useContainerWidth, useBump, mulberry32, shuffled } from '../../../../../kit'
import s from './pss.module.css'

/*
  The output-size formula, made countable. Left: an n×n input (blue) with p rings of zero
  padding (hatched, always, on every side), the k×k kernel window (orange) and, above the grid, the
  column positions the window starts at, s apart. Right: the output grid, one cell per window
  position. Cells the window never reaches (because the last jump would overshoot, or, when k < s,
  because they fall between two windows) get a red
  outline, tint and ×, drawn on top so a padding cell stays hatched. Challenge mode hides the
  answer until you pick one.
*/

interface Cfg {
  n: number
  k: number
  p: number
  s: number
}

const outSize = ({ n, k, p, s: st }: Cfg) => (n + 2 * p >= k ? Math.floor((n + 2 * p - k) / st) + 1 : 0)

function randomCfg(seed: number): Cfg {
  const rnd = mulberry32(seed * 7919 + 13)
  for (;;) {
    const c: Cfg = { n: 5 + Math.floor(rnd() * 8), k: [1, 3, 3, 3, 5, 5, 2, 4][Math.floor(rnd() * 8)], p: Math.floor(rnd() * 3), s: 1 + Math.floor(rnd() * 3) }
    if (c.n + 2 * c.p >= c.k && c.p < c.k) return c
  }
}

function distractors(c: Cfg): number[] {
  const o = outSize(c)
  const P = c.n + 2 * c.p
  const cands = [
    Math.ceil((P - c.k) / c.s) + 1, // rounding up instead of down
    Math.floor((P - c.k) / c.s), // forgetting the + 1
    c.n >= c.k ? Math.floor((c.n - c.k) / c.s) + 1 : -1, // forgetting the padding
    Math.floor((c.n + c.p - c.k) / c.s) + 1, // padding only one side
    Math.floor((P - c.k + 1) / c.s), // (n + 2p − k + 1) / s
    o + 1,
    o + 2,
    o - 1,
  ]
  const out: number[] = []
  for (const v of cands) if (v > 0 && v !== o && !out.includes(v)) out.push(v)
  return out.slice(0, 3)
}

export default function ConvShapeCalculator() {
  const [cfg, setCfg] = useState<Cfg>({ n: 8, k: 3, p: 0, s: 2 })
  const [quiz, setQuiz] = useState(false)
  const [seed, bump] = useBump()
  const [picked, setPicked] = useState<number | null>(null)
  const [ref, W] = useContainerWidth<HTMLDivElement>(600)
  const hatchId = 'pad-hatch-' + useId().replace(/:/g, '')

  const c = quiz ? randomCfg(seed + 1) : cfg
  const P = c.n + 2 * c.p
  const o = outSize(c)
  const valid = o > 0
  const player = usePlayer({ steps: Math.max(1, o * o), interval: 650 })
  useEffect(() => {
    player.reset()
    setPicked(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.n, c.k, c.p, c.s, quiz, seed])

  const options = useMemo(() => shuffled([o, ...distractors(c)], mulberry32(seed * 31 + 5)), [o, seed, c.n, c.k, c.p, c.s]) // eslint-disable-line react-hooks/exhaustive-deps
  const revealed = !quiz || picked !== null

  const step = Math.min(player.step, Math.max(0, o * o - 1))
  const ri = Math.floor(step / Math.max(1, o))
  const ci = step % Math.max(1, o)

  // layout
  const side = W >= 520
  const availL = side ? W * 0.58 : W - 8
  const cs = Math.max(13, Math.min(34, Math.floor(availL / P)))
  const ocs = Math.max(14, Math.min(34, side ? Math.floor((W * 0.36) / Math.max(1, o)) : Math.floor((W - 8) / Math.max(1, o))))
  const top = 30 // room for the stride ruler
  const gridW = P * cs
  // covered[i]: some window spans column (and row) i, i.e. j·s ≤ i < j·s + k for some window j.
  // Cells are missed past the last window and, when k < s, in the gaps between windows.
  const covered = Array.from({ length: P }, (_, i) => valid && Array.from({ length: o }, (_, j) => j * c.s).some((st) => st <= i && i < st + c.k))
  const missed = covered.flatMap((cv, i) => (cv ? [] : [i]))
  const skipped = missed.length // columns (and rows) never covered
  const skippedImage = missed.filter((i) => i >= c.p && i < c.p + c.n).length // ... of which real image pixels
  const gapSkipped = valid ? missed.filter((i) => i < (o - 1) * c.s + c.k).length : 0 // ... of which between windows

  const set = (key: keyof Cfg) => (v: number) => setCfg((old) => ({ ...old, [key]: v }))
  const frac = (P - c.k) / c.s
  const exact = Number.isInteger(frac)
  const tex = '\\displaystyle ' + (!revealed
    ? `\\text{output} = \\left\\lfloor \\frac{n + 2p - k}{s} \\right\\rfloor + 1 = \\;?`
    : valid
    ? `\\left\\lfloor \\frac{n + 2p - k}{s} \\right\\rfloor + 1 = \\left\\lfloor \\frac{${c.n} + ${2 * c.p} - ${c.k}}{${c.s}} \\right\\rfloor + 1 = \\left\\lfloor ${exact ? frac : `${(Math.floor(frac * 100) / 100).toString()}${Math.abs(frac * 100 - Math.floor(frac * 100)) > 1e-9 ? '\\ldots' : ''}`} \\right\\rfloor + 1 = ${Math.floor(frac)} + 1 = ${o}`
    : `n + 2p = ${P} < k = ${c.k}`)

  return (
    <Figure
      title="Count the positions: the output-size formula"
      caption={
        <>
          <b>Try:</b> press <b>Play</b>: each window position makes one output cell. Then set p = 1 and watch a ring of zeros appear on <i>both</i>{' '}
          sides. <b>Notice:</b> cells marked × are never reached, because one more jump would overshoot the edge: that is the floor ⌊ ⌋.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <div className={s.row}>
          <div className={s.col}>
            <span className={s.cap}>
              Input {c.n} × {c.n}
              {c.p > 0 ? `, padded to ${P} × ${P}` : ''}
            </span>
            <svg viewBox={`-3 -3 ${gridW + 6} ${gridW + top + 6}`} width={gridW + 6} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} role="img" aria-label={`Input of ${c.n} by ${c.n} with padding ${c.p}; kernel ${c.k} by ${c.k}; stride ${c.s}`}>
              <defs>
                <pattern id={hatchId} width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width={6} height={6} style={{ fill: 'var(--surface)' }} />
                  <line x1={0} y1={0} x2={0} y2={6} style={{ stroke: 'var(--viz-muted)', strokeWidth: 2, strokeOpacity: 0.8 }} />
                </pattern>
              </defs>
              <g transform={`translate(0, ${top})`}>
                {Array.from({ length: P * P }, (_, idx) => {
                  const r = Math.floor(idx / P)
                  const q = idx % P
                  const pad = r < c.p || q < c.p || r >= c.p + c.n || q >= c.p + c.n
                  const unreached = revealed && valid && (!covered[r] || !covered[q])
                  const x0 = q * cs + 1
                  const y0 = r * cs + 1
                  const m = cs * 0.22 // half-size of the ×
                  return (
                    <g key={idx}>
                      <rect
                        x={x0}
                        y={y0}
                        width={cs - 2}
                        height={cs - 2}
                        rx={3}
                        style={{
                          fill: pad ? `url(#${hatchId})` : 'color-mix(in srgb, var(--viz-1) 16%, var(--surface))',
                          stroke: pad ? 'color-mix(in srgb, var(--viz-muted) 70%, var(--surface))' : 'color-mix(in srgb, var(--viz-1) 45%, var(--surface))',
                          strokeWidth: 1,
                        }}
                      />
                      {unreached && (
                        <>
                          <rect
                            x={x0 + 1}
                            y={y0 + 1}
                            width={cs - 4}
                            height={cs - 4}
                            rx={2}
                            style={{ fill: 'color-mix(in srgb, var(--viz-neg) 25%, transparent)', stroke: 'var(--viz-neg)', strokeWidth: 2 }}
                          />
                          <path
                            d={`M${x0 + cs / 2 - 1 - m},${y0 + cs / 2 - 1 - m}l${2 * m},${2 * m}m0,${-2 * m}l${-2 * m},${2 * m}`}
                            style={{ fill: 'none', stroke: 'var(--viz-neg)', strokeWidth: 1.8, strokeLinecap: 'round' }}
                          />
                        </>
                      )}
                    </g>
                  )
                })}
                {valid && revealed && (
                  <rect
                    x={ci * c.s * cs}
                    y={ri * c.s * cs}
                    width={c.k * cs}
                    height={c.k * cs}
                    rx={4}
                    style={{ fill: 'color-mix(in srgb, var(--viz-2) 20%, transparent)', stroke: 'var(--viz-2)', strokeWidth: 3 }}
                  />
                )}
              </g>
              {/* stride ruler: possible start columns */}
              {valid &&
                revealed &&
                Array.from({ length: o }, (_, j) => {
                  const x = j * c.s * cs + cs / 2
                  const nx = (j + 1) * c.s * cs + cs / 2
                  return (
                    <g key={`st${j}`}>
                      {j < o - 1 && (
                        <path
                          d={`M${x + 4},${top - 12} Q${(x + nx) / 2},${top - 28} ${nx - 4},${top - 12}`}
                          style={{ fill: 'none', stroke: 'var(--viz-2)', strokeWidth: 1.5 }}
                        />
                      )}
                      <circle cx={x} cy={top - 10} r={j === ci ? 5 : 3.5} style={{ fill: j === ci ? 'var(--viz-2)' : 'var(--surface)', stroke: 'var(--viz-2)', strokeWidth: 1.6 }} />
                    </g>
                  )
                })}
            </svg>
            <span className={s.capSmall}>
              kernel {c.k} × {c.k} (orange), stride {c.s}
              {c.p > 0 ? `; hatched = zero padding (p = ${c.p})` : ''}
              {valid && revealed && skipped > 0
                ? `; × = ${skipped} column${skipped > 1 ? 's' : ''} and row${skipped > 1 ? 's' : ''} never reached (${
                    skippedImage === 0 ? 'only padding zeros here' : skippedImage === skipped ? 'real image pixels' : `${skippedImage} of them real image pixels`
                  }${gapSkipped > 0 ? `; ${gapSkipped === skipped ? 'all' : gapSkipped} of them sit between windows, because the kernel is narrower than the stride` : ''})`
                : ''}
            </span>
          </div>
          <div className={s.col}>
            <span className={s.cap}>{revealed && valid ? `Output ${o} × ${o}` : 'Output ? × ?'}</span>
            {revealed && valid ? (
              <svg viewBox={`-3 -3 ${o * ocs + 6} ${o * ocs + 6}`} width={o * ocs + 6} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} role="img" aria-label={`Output grid of ${o} by ${o}`}>
                {Array.from({ length: o * o }, (_, idx) => {
                  const r = Math.floor(idx / o)
                  const q = idx % o
                  const cur = idx === step
                  return (
                    <rect
                      key={idx}
                      x={q * ocs + 1.5}
                      y={r * ocs + 1.5}
                      width={ocs - 3}
                      height={ocs - 3}
                      rx={3}
                      style={{ fill: cur ? 'color-mix(in srgb, var(--viz-2) 45%, var(--surface))' : 'color-mix(in srgb, var(--viz-3) 22%, var(--surface))', stroke: cur ? 'var(--viz-2)' : 'color-mix(in srgb, var(--viz-3) 55%, var(--surface))', strokeWidth: cur ? 2.5 : 1 }}
                    />
                  )
                })}
              </svg>
            ) : (
              <div className={s.note} style={{ width: 'auto', maxWidth: 240 }}>
                {valid ? 'How many positions fit along one side? Pick an answer below.' : 'The kernel is bigger than the padded input: no position fits.'}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={s.formula}>
        <M>{tex}</M>
      </div>
      {quiz && (
        <>
          <div className={s.chipRow}>
            <span>n = {c.n}</span>
            <span>k = {c.k}</span>
            <span>p = {c.p}</span>
            <span>s = {c.s}</span>
          </div>
          <div className={s.choices} role="group" aria-label="Choose the output size">
            {options.map((v) => (
              <button
                key={v}
                type="button"
                className={`${s.choice} ${picked !== null && v === o ? s.choiceRight : ''} ${picked === v && v !== o ? s.choiceWrong : ''}`}
                disabled={picked !== null}
                onClick={() => setPicked(v)}
              >
                {v} × {v}
              </button>
            ))}
            <Button onClick={bump}>New layer</Button>
          </div>
          {picked !== null && (
            <div className={`${s.note} ${picked === o ? s.good : s.bad}`} aria-live="polite">
              {picked === o
                ? `Right: ${o} positions fit along each side.`
                : `Not quite. Padded size ${c.n} + 2×${c.p} = ${P}; minus k gives ${P - c.k}; ÷ ${c.s} rounded down is ${Math.floor(frac)}; plus 1 is ${o}.`}
            </div>
          )}
        </>
      )}
      {revealed && valid && <PlayerControls player={player} label={(st) => `Position ${Math.min(st, o * o - 1) + 1} of ${o * o}`} />}
      <Controls>
        {!quiz && (
          <>
            <Slider label="input size n" value={cfg.n} min={3} max={12} onChange={set('n')} />
            <Slider label="kernel size k" value={cfg.k} min={1} max={7} onChange={set('k')} />
            <Slider label="padding p" value={cfg.p} min={0} max={3} onChange={set('p')} />
            <Slider label="stride s" value={cfg.s} min={1} max={4} onChange={set('s')} />
          </>
        )}
        <Toggle label="Challenge me" checked={quiz} onChange={setQuiz} />
      </Controls>
    </Figure>
  )
}
