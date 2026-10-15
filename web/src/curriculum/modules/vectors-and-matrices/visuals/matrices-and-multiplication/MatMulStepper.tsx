import { Fragment, useEffect, useState } from 'react'
import { Figure, Controls, Segmented, usePlayer, PlayerControls, useContainerWidth } from '../../../../../kit'
import { matmul } from './Mat'
import s from './mm.module.css'

/*
  Step through a matrix product one output entry at a time. Layout: the left matrix sits
  bottom-left, the right matrix top-right, and the product fills the corner where a row of
  the left matrix meets a column of the right one. Each step lights up that row and column
  and shows the dot product that produces the entry.
*/

type Ex = 'hawker' | 'numbers'
type Order = 'AB' | 'BA'

interface Named {
  name: string
  M: number[][]
  rows?: string[]
  cols?: string[]
}

const DISHES = ['rice', 'laksa', 'kopi']
const EXAMPLES: Record<Ex, { A: Named; B: Named }> = {
  hawker: {
    A: { name: 'A (orders)', M: [[0, 1, 2], [2, 1, 1]], rows: ['Aisha', 'Ben'], cols: DISHES },
    B: { name: 'B (per dish)', M: [[4, 600], [5, 600], [2, 100]], rows: DISHES, cols: ['$', 'kcal'] },
  },
  numbers: {
    A: { name: 'A', M: [[1, 2], [3, 4]] },
    B: { name: 'B', M: [[5, 6], [7, 8]] },
  },
}

const tint = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, var(--surface))`

export default function MatMulStepper() {
  const [ex, setEx] = useState<Ex>('hawker')
  const [order, setOrder] = useState<Order>('AB')
  const [ref, W] = useContainerWidth<HTMLDivElement>(480)

  const L = order === 'AB' ? EXAMPLES[ex].A : EXAMPLES[ex].B
  const R = order === 'AB' ? EXAMPLES[ex].B : EXAMPLES[ex].A
  const Lname = order === 'AB' ? 'A' : 'B'
  const Rname = order === 'AB' ? 'B' : 'A'
  const m = L.M.length
  const n = L.M[0].length
  const p = R.M[0].length
  const C = matmul(L.M, R.M)
  const other = order === 'AB' ? matmul(EXAMPLES[ex].B.M, EXAMPLES[ex].A.M) : matmul(EXAMPLES[ex].A.M, EXAMPLES[ex].B.M)

  const player = usePlayer({ steps: m * p, interval: 1600 })
  useEffect(() => {
    player.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ex, order])
  const k = Math.min(player.step, m * p - 1)
  const i = Math.floor(k / p)
  const j = k % p

  // ---- layout (real pixels) ----
  const labelled = !!L.rows
  const rowLabW = labelled ? 50 : 14
  const g = 16
  const topLab = labelled ? 20 : 8
  const botLab = labelled ? 20 : 6
  const c = Math.max(32, Math.min(50, Math.floor((Math.min(W, 520) - rowLabW - g - 10) / (n + p))))
  const xL = rowLabW
  const xR = xL + n * c + g
  const yT = topLab + 2
  const yB = yT + n * c + g
  const width = xR + p * c + 8
  const height = yB + m * c + botLab
  const ins = 2

  const cell = (x: number, y: number, fill: string, stroke: string, sw: number, text: string, color: string, key: string, onClick?: () => void, aria?: string) => (
    <g
      key={key}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={aria}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick()) : undefined}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <rect x={x + ins} y={y + ins} width={c - 2 * ins} height={c - 2 * ins} rx={6} style={{ fill, stroke, strokeWidth: sw }} />
      <text x={x + c / 2} y={y + c / 2} dy="0.35em" textAnchor="middle" className={s.monoText} style={{ fontSize: c >= 40 ? 15 : 13, fontWeight: 700, fill: color }}>
        {text}
      </text>
    </g>
  )

  const jump = (ii: number, jj: number) => {
    player.pause()
    player.setStep(ii * p + jj)
  }

  const meaning =
    ex === 'hawker' && order === 'AB'
      ? j === 0
        ? `${L.rows![i]} pays $${C[i][j]} in total.`
        : `${L.rows![i]} eats ${C[i][j]} kcal.`
      : null

  return (
    <Figure
      title="Matrix multiplication, one entry at a time"
      caption={
        <>
          Press <b>Play</b> or <b>Next</b>, or tap any cell of the product. Each entry is a <b>row of the left matrix</b> (blue) times a{' '}
          <b>column of the right matrix</b> (orange): multiply matching pairs and add. In the hawker example A holds who ordered what (rice = chicken rice) and B
          holds each dish's price and calories. Then switch to B·A and compare.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', justifyItems: 'center' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width={width} style={{ maxWidth: '100%', height: 'auto' }} role="img" aria-label={`${Lname} times ${Rname}: computing entry row ${i + 1}, column ${j + 1}`}>
          {/* guide lines from the active row and column into the active output cell */}
          <line x1={xL + n * c} x2={xR + j * c} y1={yB + i * c + c / 2} y2={yB + i * c + c / 2} style={{ stroke: 'var(--viz-1)', strokeWidth: 2, strokeDasharray: '4 4' }} />
          <line x1={xR + j * c + c / 2} x2={xR + j * c + c / 2} y1={yT + n * c} y2={yB + i * c} style={{ stroke: 'var(--viz-2)', strokeWidth: 2, strokeDasharray: '4 4' }} />

          {/* left matrix */}
          {L.M.map((row, ii) =>
            row.map((v, kk) => {
              const on = ii === i
              return cell(xL + kk * c, yB + ii * c, on ? tint('var(--viz-1)', 26) : 'var(--surface-2)', on ? 'var(--viz-1)' : 'transparent', 1.8, String(v), 'var(--viz-ink)', `l${ii}${kk}`)
            }),
          )}
          {/* right matrix */}
          {R.M.map((row, kk) =>
            row.map((v, jj) => {
              const on = jj === j
              return cell(xR + jj * c, yT + kk * c, on ? tint('var(--viz-2)', 26) : 'var(--surface-2)', on ? 'var(--viz-2)' : 'transparent', 1.8, String(v), 'var(--viz-ink)', `r${kk}${jj}`)
            }),
          )}
          {/* product */}
          {C.map((row, ii) =>
            row.map((v, jj) => {
              const idx = ii * p + jj
              const on = idx === k
              const done = idx <= k
              return cell(
                xR + jj * c,
                yB + ii * c,
                on ? tint('var(--viz-3)', 36) : done ? tint('var(--viz-3)', 12) : 'var(--surface)',
                on ? 'var(--viz-3)' : done ? tint('var(--viz-3)', 50) : 'var(--viz-muted)',
                on ? 2.4 : 1.2,
                done ? String(v) : '?',
                done ? 'var(--viz-ink)' : 'var(--ink-3)',
                `c${ii}${jj}`,
                () => jump(ii, jj),
                `entry row ${ii + 1}, column ${jj + 1}${done ? ` = ${v}` : ''}`,
              )
            }),
          )}

          {/* labels */}
          {L.rows?.map((t, ii) => (
            <text key={`lr${ii}`} x={xL - 6} y={yB + ii * c + c / 2} dy="0.35em" textAnchor="end" style={{ fontSize: 12, fontWeight: ii === i ? 800 : 600, fill: ii === i ? 'var(--viz-1)' : 'var(--ink-2)' }}>
              {t}
            </text>
          ))}
          {L.cols?.map((t, kk) => (
            <text key={`lc${kk}`} x={xL + kk * c + c / 2} y={yB + m * c + 14} textAnchor="middle" style={{ fontSize: 11, fontWeight: 600, fill: 'var(--ink-2)' }}>
              {t}
            </text>
          ))}
          {R.rows?.map((t, kk) => (
            <text key={`rr${kk}`} x={xR - 6} y={yT + kk * c + c / 2} dy="0.35em" textAnchor="end" style={{ fontSize: 11, fontWeight: 600, fill: 'var(--ink-2)' }}>
              {t}
            </text>
          ))}
          {R.cols?.map((t, jj) => (
            <text key={`rc${jj}`} x={xR + jj * c + c / 2} y={yT - 6} textAnchor="middle" style={{ fontSize: 12, fontWeight: jj === j ? 800 : 600, fill: jj === j ? 'var(--viz-2)' : 'var(--ink-2)' }}>
              {t}
            </text>
          ))}
          {/* matrix names: the left matrix is named above itself, the right one in the empty corner to its left */}
          <text x={xL + (n * c) / 2} y={yB - 6} textAnchor="middle" style={{ fontSize: 13, fontWeight: 800, fill: 'var(--viz-1)' }}>
            {L.name}
          </text>
          <text x={xR - 8} y={labelled ? yT - 6 : yT + (n * c) / 2} dy={labelled ? undefined : '0.35em'} textAnchor="end" style={{ fontSize: 13, fontWeight: 800, fill: 'var(--viz-2)' }}>
            {R.name}
          </text>
        </svg>
      </div>

      <div className={s.calc} aria-live="polite">
        <div>
          Entry (row {i + 1}, column {j + 1}) of {Lname}
          {Rname} = <span className={s.aNum}>row {i + 1} of {Lname}</span>
          {L.rows ? ` (${L.rows[i]})` : ''} · <span className={s.bNum}>column {j + 1} of {Rname}</span>
          {R.cols ? ` (${R.cols[j]})` : ''}
        </div>
        <div className={s.calcLine}>
          {L.M[i].map((a, kk) => (
            <Fragment key={kk}>
              {kk > 0 && <span>+</span>}
              <span className={s.term}>
                <span className={s.aNum}>{a}</span>×<span className={s.bNum}>{R.M[kk][j]}</span>
              </span>
            </Fragment>
          ))}
          <span>=</span>
          <span>{L.M[i].map((a, kk) => a * R.M[kk][j]).join(' + ')}</span>
          <span>=</span>
          <span className={s.outNum}>{C[i][j]}</span>
        </div>
        {meaning && <div>{meaning}</div>}
      </div>

      {ex === 'hawker' && order === 'BA' && (
        <div className={s.warn}>
          The shapes fit, (3×2)(2×3) → 3×3, so the computer happily returns 9 numbers. But look at what gets paired: B's columns ($, kcal) with A's rows
          (Aisha, Ben). A price times a customer means nothing. Swapping the order changed the shape <i>and</i> destroyed the meaning.
        </div>
      )}
      {ex === 'numbers' && (
        <div className={s.calc}>
          <div>
            Other order: {order === 'AB' ? 'BA' : 'AB'} = [[{other[0].join(', ')}], [{other[1].join(', ')}]], not the same as {order === 'AB' ? 'AB' : 'BA'} = [[
            {C[0].join(', ')}], [{C[1].join(', ')}]].
          </div>
        </div>
      )}

      <PlayerControls player={player} label={(st) => `Entry ${Math.min(st, m * p - 1) + 1} of ${m * p}`} />
      <Controls>
        <Segmented
          label="Example"
          value={ex}
          onChange={setEx}
          options={[
            { value: 'hawker', label: 'Hawker bill' },
            { value: 'numbers', label: '2×2 numbers' },
          ]}
        />
        <Segmented
          label="Order"
          value={order}
          onChange={setOrder}
          options={[
            { value: 'AB', label: 'A·B' },
            { value: 'BA', label: 'B·A' },
          ]}
        />
      </Controls>
    </Figure>
  )
}
