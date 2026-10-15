import { useState } from 'react'
import { Figure, Controls, Segmented, Readout } from '../../../../../kit'
import s from './mha.module.css'

/*
  "Right shape, wrong numbers". A (T = 4, d_model = 6) tensor is split into h = 2 heads of d_k = 3,
  either correctly (view to (B, T, h, d_k) then transpose(1, 2)) or with the classic bug
  (view straight to (B, h, T, d_k)). view always reads the numbers in memory order, row by row,
  so the bug cuts the memory strip into the wrong pieces.
*/

const T = 4
const D = 6
const H = 2
const DK = D / H
const TOK = ['A', 'B', 'C', 'D']
const TOK_COLOUR = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-6)']

type Mode = 'good' | 'bad'
type Src = { t: number; j: number }

/** Which source number lands at head hh, row r, column c. */
function source(mode: Mode, hh: number, r: number, c: number): Src {
  if (mode === 'good') return { t: r, j: hh * DK + c }
  const f = hh * T * DK + r * DK + c // position in the memory strip
  return { t: Math.floor(f / D), j: f % D }
}

const rowOk = (mode: Mode, hh: number, r: number) =>
  Array.from({ length: DK }, (_, c) => source(mode, hh, r, c)).every((p, c) => p.t === r && p.j === hh * DK + c)

const bg = (t: number, strong: boolean) => `color-mix(in srgb, ${TOK_COLOUR[t]} ${strong ? 60 : 30}%, var(--surface))`

export default function ReshapeTrap() {
  const [mode, setMode] = useState<Mode>('bad')
  const [pick, setPick] = useState<Src>({ t: 1, j: 0 })

  const okRows = Array.from({ length: H }, (_, hh) => Array.from({ length: T }, (_, r) => rowOk(mode, hh, r)))
  const nOk = okRows.flat().filter(Boolean).length
  const seen = Array.from({ length: H }, (_, hh) => {
    const set = new Set<number>()
    for (let r = 0; r < T; r++) for (let c = 0; c < DK; c++) set.add(source(mode, hh, r, c).t)
    return [...set].sort().map((t) => TOK[t])
  })
  const isPick = (p: Src) => p.t === pick.t && p.j === pick.j

  return (
    <Figure
      title="Right shape, wrong numbers"
      caption={
        <>
          Both lines of code give a tensor of shape (B, h, T, d_k) = (1, 2, 4, 3), and neither raises an error. Tap any square to see where that
          number came from. With the bug, <code>view</code> cuts the row-by-row memory strip into heads, so head 0's "token B" row is really the
          second half of token A. Rows outlined in red hold the wrong token's features: the model still trains, just badly.
        </>
      }
    >
      <div className={s.trap}>
        <div className={s.mat}>
          <div className={s.matTitle}>x after W_q: T = 4 tokens × d_model = 6 (columns 0–2 → head 0, 3–5 → head 1)</div>
          <div className={s.matGrid} style={{ gridTemplateColumns: `auto repeat(${D}, auto)` }}>
            {Array.from({ length: T }, (_, t) => (
              <div key={t} className={s.matRow}>
                <span className={s.rowLabel}>{TOK[t]}</span>
                {Array.from({ length: D }, (_, j) => (
                  <button
                    key={j}
                    type="button"
                    className={`${s.cellBtn} ${isPick({ t, j }) ? s.cellOn : ''}`}
                    style={{ background: bg(t, isPick({ t, j })), marginLeft: j === DK ? 8 : 0 }}
                    onClick={() => setPick({ t, j })}
                    aria-label={`token ${TOK[t]} feature ${j}`}
                  >
                    {TOK[t]}
                    {j}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <Controls>
          <Segmented
            label="split with"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'good', label: 'view(B, T, h, d_k).transpose(1, 2)' },
              { value: 'bad', label: 'view(B, h, T, d_k)' },
            ]}
          />
        </Controls>

        <div className={s.trapHeads}>
          {Array.from({ length: H }, (_, hh) => (
            <div key={hh} className={s.mat}>
              <div className={s.matTitle}>
                head {hh} · rows should be A, B, C, D<br />actually holds tokens {seen[hh].join(', ')}
              </div>
              <div className={s.matGrid} style={{ gridTemplateColumns: `auto repeat(${DK}, auto)` }}>
                {Array.from({ length: T }, (_, r) => (
                  <div key={r} className={s.matRow}>
                    <span className={s.rowLabel}>{TOK[r]}</span>
                    {Array.from({ length: DK }, (_, c) => {
                      const p = source(mode, hh, r, c)
                      return (
                        <button
                          key={c}
                          type="button"
                          className={`${s.cellBtn} ${isPick(p) ? s.cellOn : ''} ${okRows[hh][r] ? '' : s.rowBad}`}
                          style={{ background: bg(p.t, isPick(p)) }}
                          onClick={() => setPick(p)}
                          aria-label={`head ${hh} row ${r} column ${c} holds token ${TOK[p.t]} feature ${p.j}`}
                        >
                          {TOK[p.t]}
                          {p.j}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={s.verdict} style={{ color: mode === 'good' ? 'var(--viz-pos)' : 'var(--viz-neg)' }}>
          {mode === 'good'
            ? 'Correct: row r of every head is token r, holding that head’s own 3 features.'
            : `Bug: only ${nOk} of ${H * T} rows hold the right token’s features.`}
        </div>
        <Readout
          items={[
            ['shape', '(1, 2, 4, 3)'],
            ['error raised', 'none'],
            ['rows correct', `${nOk} / ${H * T}`],
            ['picked', `${TOK[pick.t]}${pick.j}`],
          ]}
        />
      </div>
    </Figure>
  )
}
