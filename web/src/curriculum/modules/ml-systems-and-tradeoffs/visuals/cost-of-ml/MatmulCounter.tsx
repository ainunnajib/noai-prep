import { useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, usePlayer, PlayerControls, Button, useContainerWidth, mulberry32 } from '../../../../../kit'

/*
  (m × n)(n × p): every one of the m·p output cells is a dot product of a row of A (n numbers) with a
  column of B (n numbers), i.e. n multiply-adds. Step through the cells and watch the count reach m·n·p.
  Matrix entries are small integers from a fixed seed so the arithmetic can be checked by eye.
*/

const GAP = 14

function makeMatrix(rows: number, cols: number, seed: number) {
  const rnd = mulberry32(seed)
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.floor(rnd() * 4)))
}

export default function MatmulCounter() {
  const [m, setM] = useState(2)
  const [n, setN] = useState(3)
  const [p, setP] = useState(4)
  const cells = m * p
  const player = usePlayer({ steps: cells, interval: 850 })
  const { setStep } = player
  useEffect(() => setStep(0), [m, n, p, setStep])

  const A = useMemo(() => makeMatrix(m, n, 11 + m * 7 + n), [m, n])
  const B = useMemo(() => makeMatrix(n, p, 29 + n * 5 + p), [n, p])
  const C = useMemo(() => A.map((row) => Array.from({ length: p }, (_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0))), [A, B, p])

  const step = Math.min(player.step, cells - 1)
  const ci = Math.floor(step / p)
  const cj = step % p
  const done = step + 1 // cells computed so far
  const count = done * n

  const [wrapRef, w] = useContainerWidth<HTMLDivElement>(360)
  const avail = Math.max(240, Math.min(w, 460))
  const c = Math.max(24, Math.min(44, Math.floor((avail - GAP - 8) / (n + p))))
  const top = n * c + GAP // y where A and C start
  const left = n * c + GAP // x where B and C start
  const W = left + p * c + 4
  const H = top + m * c + 4

  const cellRect = (x: number, y: number, fill: string, stroke = 'var(--rule)', sw = 1) => (
    <rect x={x + 1} y={y + 1} width={c - 2} height={c - 2} rx={5} style={{ fill, stroke, strokeWidth: sw }} />
  )
  const txt = (x: number, y: number, s: string | number, color = 'var(--ink)', weight = 600) => (
    <text x={x + c / 2} y={y + c / 2} dy="0.35em" textAnchor="middle" style={{ fill: color, fontSize: Math.min(15, c * 0.45), fontWeight: weight, fontVariantNumeric: 'tabular-nums' }}>
      {s}
    </text>
  )
  const soft = (v: string, pct: number) => `color-mix(in srgb, ${v} ${pct}%, var(--surface))`

  return (
    <Figure
      title="Counting the work in a matrix product"
      caption={
        <>
          Each output cell of <b>C = AB</b> is a row of A (blue) times a column of B (orange): multiply the {n} pairs and add them up, so {n} multiply-adds per cell. Press Play or Next to fill C,
          then change the sizes. Notice the total is always (number of cells) × (length of each row) = <b>m·p × n = m·n·p</b>, and that changing the shared size n changes the cost but not the
          shape of C.
        </>
      }
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: 13, color: 'var(--ink-2)', justifyContent: 'center' }} aria-hidden="true">
        {[
          ['var(--viz-1)', `A: ${m}×${n}`],
          ['var(--viz-2)', `B: ${n}×${p}`],
          ['var(--viz-3)', `C = AB: ${m}×${p}`],
        ].map(([col, t]) => (
          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 650 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: `color-mix(in srgb, ${col} 40%, var(--surface))`, border: `1.5px solid ${col}` }} />
            {t}
          </span>
        ))}
      </div>
      <div ref={wrapRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} style={{ maxWidth: '100%', height: 'auto', display: 'block', fontFamily: 'var(--font-body)' }} role="img" aria-label={`A ${m} by ${n} matrix times a ${n} by ${p} matrix; computing cell row ${ci + 1}, column ${cj + 1}`}>
          {/* B: n rows × p cols, above C */}
          {B.map((row, k) =>
            row.map((v, j) => (
              <g key={`b${k}-${j}`}>
                {cellRect(left + j * c, k * c, j === cj ? soft('var(--viz-2)', 34) : 'var(--surface-2)', j === cj ? 'var(--viz-2)' : 'var(--rule)', j === cj ? 1.6 : 1)}
                {txt(left + j * c, k * c, v, j === cj ? 'var(--ink)' : 'var(--ink-2)')}
              </g>
            )),
          )}
          {/* A: m rows × n cols, left of C */}
          {A.map((row, i) =>
            row.map((v, k) => (
              <g key={`a${i}-${k}`}>
                {cellRect(k * c, top + i * c, i === ci ? soft('var(--viz-1)', 30) : 'var(--surface-2)', i === ci ? 'var(--viz-1)' : 'var(--rule)', i === ci ? 1.6 : 1)}
                {txt(k * c, top + i * c, v, i === ci ? 'var(--ink)' : 'var(--ink-2)')}
              </g>
            )),
          )}
          {/* C: m × p */}
          {C.map((row, i) =>
            row.map((v, j) => {
              const idx = i * p + j
              const isCur = idx === step
              const isDone = idx < step
              return (
                <g key={`c${i}-${j}`}>
                  {cellRect(left + j * c, top + i * c, isCur ? soft('var(--viz-3)', 45) : isDone ? soft('var(--viz-3)', 16) : 'var(--surface)', isCur ? 'var(--viz-3)' : 'var(--rule)', isCur ? 2.2 : 1)}
                  {(isCur || isDone) && txt(left + j * c, top + i * c, v, 'var(--ink)', isCur ? 800 : 600)}
                </g>
              )
            }),
          )}
        </svg>
      </div>

      <div
        role="status"
        style={{
          width: '100%',
          padding: '0.5rem 0.7rem',
          borderRadius: 8,
          background: 'var(--surface-2)',
          fontSize: 14,
          lineHeight: 1.6,
          fontFamily: 'var(--font-mono)',
          overflowWrap: 'anywhere',
        }}
      >
        <span style={{ fontWeight: 700 }}>{`C[${ci + 1},${cj + 1}] = `}</span>
        {A[ci].map((a, k) => (
          <span key={k}>
            {k > 0 && ' + '}
            <span style={{ color: 'var(--viz-1)', fontWeight: 700 }}>{a}</span>×<span style={{ color: 'var(--viz-2)', fontWeight: 700 }}>{B[k][cj]}</span>
          </span>
        ))}
        <span> = </span>
        <b>{C[ci][cj]}</b>
        <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-body)', fontSize: 13 }}>{`   (${n} multiply-add${n > 1 ? 's' : ''})`}</span>
      </div>

      <PlayerControls player={player} label={(s) => `cell ${Math.min(s, cells - 1) + 1} of ${cells}`} />
      <Controls>
        <Slider label="m (rows of A)" value={m} min={1} max={4} onChange={setM} />
        <Slider label="n (shared size)" value={n} min={1} max={5} onChange={setN} />
        <Slider label="p (columns of B)" value={p} min={1} max={5} onChange={setP} />
      </Controls>
      <Controls>
        <Readout
          items={[
            ['multiply-adds so far', `${count} = ${done} cell${done > 1 ? 's' : ''} × ${n}`],
            ['total', `${m}·${n}·${p} = ${m * n * p}`],
          ]}
        />
        <Button onClick={() => setStep(cells - 1)} disabled={step === cells - 1}>
          Fill all
        </Button>
      </Controls>
    </Figure>
  )
}
