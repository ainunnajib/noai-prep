import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, usePlayer, PlayerControls, useContainerWidth } from '../../../../../kit'
import s from '../big-o/algo.module.css'
import d from './dp.module.css'

/*
  Edit distance by dynamic programming. D[i][j] = fewest edits turning the first i letters of the
  source into the first j letters of the target. Cells fill row by row; each one takes the cheapest of
  substitute/match (diagonal), delete (from above) and insert (from the left). At the end the path
  of choices is traced back from the bottom-right corner and shown as an alignment.
*/

type Dir = 'diag' | 'up' | 'left'

function solve(a: string, b: string) {
  const m = a.length
  const n = b.length
  const D: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  const from: (Dir | null)[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null))
  for (let i = 1; i <= m; i++) {
    D[i][0] = i
    from[i][0] = 'up'
  }
  for (let j = 1; j <= n; j++) {
    D[0][j] = j
    from[0][j] = 'left'
  }
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++) {
      const diag = D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      const up = D[i - 1][j] + 1
      const left = D[i][j - 1] + 1
      const best = Math.min(diag, up, left)
      D[i][j] = best
      from[i][j] = best === diag ? 'diag' : best === up ? 'up' : 'left'
    }
  // trace back
  const path: [number, number][] = [[m, n]]
  const ops: { top: string; bottom: string; op: 'match' | 'sub' | 'del' | 'ins' }[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    const f = from[i][j]
    if (f === 'diag') {
      ops.unshift({ top: a[i - 1], bottom: b[j - 1], op: a[i - 1] === b[j - 1] ? 'match' : 'sub' })
      i--
      j--
    } else if (f === 'up') {
      ops.unshift({ top: a[i - 1], bottom: '–', op: 'del' })
      i--
    } else {
      ops.unshift({ top: '–', bottom: b[j - 1], op: 'ins' })
      j--
    }
    path.unshift([i, j])
  }
  return { D, from, path, ops }
}

const ARROW: Record<Dir, string> = { diag: '↖', up: '↑', left: '←' }
const OP_LABEL = { match: 'match', sub: 'substitute', del: 'delete', ins: 'insert' }
const clean = (v: string) => v.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8)

export default function DPTableFill() {
  const [a, setA] = useState('KITTEN')
  const [b, setB] = useState('SITTING')
  const A = a || 'A'
  const B = b || 'B'
  const m = A.length
  const n = B.length
  const sol = useMemo(() => solve(A, B), [A, B])
  const total = m * n
  const player = usePlayer({ steps: total + 2, interval: 600 })
  useEffect(() => {
    player.setStep(total + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [A, B])
  const st = Math.min(player.step, total + 1)
  const showPath = st === total + 1
  const curIdx = st >= 1 && st <= total ? st - 1 : -1
  const ci = curIdx >= 0 ? Math.floor(curIdx / n) + 1 : -1
  const cj = curIdx >= 0 ? (curIdx % n) + 1 : -1
  const filled = (i: number, j: number) => i === 0 || j === 0 || (i - 1) * n + (j - 1) < Math.max(0, st === total + 1 ? total : st)
  const onPath = (i: number, j: number) => showPath && sol.path.some(([x, y]) => x === i && y === j)

  const [ref, width] = useContainerWidth<HTMLDivElement>(560)
  // n + 2 columns with 2 px gaps between them must fit the width
  const cell = Math.max(24, Math.min(42, Math.floor((Math.min(width, 560) - 4 - 2 * (n + 1)) / (n + 2))))

  const style = (i: number, j: number): CSSProperties => {
    const isCur = i === ci && j === cj
    const isNb = ci > 0 && ((i === ci - 1 && j === cj - 1) || (i === ci - 1 && j === cj) || (i === ci && j === cj - 1))
    if (isCur) return { borderColor: 'var(--viz-2)', background: 'color-mix(in srgb, var(--viz-2) 26%, var(--surface))', borderWidth: 2.5 }
    if (onPath(i, j)) return { borderColor: 'var(--viz-3)', background: 'color-mix(in srgb, var(--viz-3) 28%, var(--surface))', borderWidth: 2 }
    if (isNb) return { borderColor: 'var(--viz-1)', background: 'color-mix(in srgb, var(--viz-1) 14%, var(--surface))', borderWidth: 2 }
    if (i === 0 || j === 0) return { background: 'var(--surface-2)' }
    return {}
  }

  let explain = null
  if (ci > 0) {
    const same = A[ci - 1] === B[cj - 1]
    const opts: [Dir, string, number, number][] = [
      ['diag', same ? `match ${A[ci - 1]}` : `substitute ${A[ci - 1]}→${B[cj - 1]}`, sol.D[ci - 1][cj - 1], same ? 0 : 1],
      ['up', `delete ${A[ci - 1]}`, sol.D[ci - 1][cj], 1],
      ['left', `insert ${B[cj - 1]}`, sol.D[ci][cj - 1], 1],
    ]
    const best = sol.D[ci][cj]
    explain = (
      <div className={s.verdict} aria-live="polite">
        Row <b>{A[ci - 1]}</b>, column <b>{B[cj - 1]}</b>: turn "{A.slice(0, ci)}" into "{B.slice(0, cj)}". The letters {same ? 'match' : 'differ'}.
        <ul className={d.opts}>
          {opts.map(([dir, label, base, add]) => (
            <li key={dir} style={{ fontWeight: sol.from[ci][cj] === dir ? 800 : 500 }}>
              {ARROW[dir]} {label}: {base} + {add} = {base + add}
              {sol.from[ci][cj] === dir ? '  ← smallest' : ''}
            </li>
          ))}
        </ul>
        So this cell is {best}.
      </div>
    )
  } else if (st === 0) {
    explain = (
      <div className={s.verdict} aria-live="polite">
        The first row and column are free to fill: turning "" into the first <i>j</i> target letters needs <i>j</i> inserts, and turning the first{' '}
        <i>i</i> source letters into "" needs <i>i</i> deletes.
      </div>
    )
  } else {
    explain = (
      <div className={s.verdict} aria-live="polite">
        Edit distance from {A} to {B} = <b>{sol.D[m][n]}</b> (bottom-right cell). Following the arrows back from that corner (green) gives the
        edits themselves:
      </div>
    )
  }

  return (
    <Figure
      title="Filling the edit-distance table"
      caption={
        <>
          Cell (row <i>i</i>, column <i>j</i>) holds the fewest edits that turn the first <i>i</i> letters of the source into the first <i>j</i>{' '}
          letters of the target. Press Restart, then Next: each new cell (orange) only looks at three cells already filled (blue). Type your own
          words (up to 8 letters each) and see the green path of choices behind the answer. The ∅ row and column stand for the empty word.
        </>
      }
    >
      <div className={s.wrap} ref={ref}>
        <div className={d.inputs}>
          <label className={d.inputLabel}>
            source (rows)
            <input type="text" className={d.input} value={a} onChange={(e) => setA(clean(e.target.value))} aria-label="Source word" spellCheck={false} />
          </label>
          <label className={d.inputLabel}>
            target (columns)
            <input type="text" className={d.input} value={b} onChange={(e) => setB(clean(e.target.value))} aria-label="Target word" spellCheck={false} />
          </label>
        </div>

        {!a || !b ? (
          <p className={s.muted} role="status">
            Type a word in both boxes to fill the table.
          </p>
        ) : (
          <>
          <div className={d.gridWrap}>
            <div className={d.grid} style={{ gridTemplateColumns: `repeat(${n + 2}, ${cell}px)` }} role="table" aria-label={`Edit distance table from ${A} to ${B}`}>
              <span className={d.head} />
              <span className={d.head}>∅</span>
              {[...B].map((ch, j) => (
                <span key={`h${j}`} className={d.head} style={{ color: j + 1 === cj ? 'var(--viz-2)' : undefined }}>
                  {ch}
                </span>
              ))}
              {sol.D.map((row, i) => (
                <span key={`r${i}`} style={{ display: 'contents' }}>
                  <span className={d.head} style={{ color: i === ci ? 'var(--viz-2)' : undefined }}>
                    {i === 0 ? '∅' : A[i - 1]}
                  </span>
                  {row.map((v, j) => (
                    <span key={`c${i}-${j}`} className={d.cell} style={{ ...style(i, j), height: cell }} role="cell">
                      {filled(i, j) && (
                        <>
                          {i > 0 && j > 0 && <span className={d.arrow}>{ARROW[sol.from[i][j]!]}</span>}
                          {v}
                        </>
                      )}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>

          {explain}

          {showPath && (
            <div className={d.align} aria-label="Alignment of the two words">
              {sol.ops.map((o, k) => (
                <span key={k} className={`${d.col} ${d[o.op]}`}>
                  <span>{o.top}</span>
                  <span>{o.bottom}</span>
                  <span className={d.opName}>{OP_LABEL[o.op]}</span>
                </span>
              ))}
            </div>
          )}

          <PlayerControls player={player} label={(k) => (k === 0 ? 'First row and column filled' : k > total ? 'Traced back' : `Cell ${k} of ${total}`)} />
          </>
        )}

        <Controls>
          <span className={s.muted}>
            Try SUNDAY → SATURDAY, TEA → EAT, or two words of your own. Time and memory: one cell each, so <i>m</i> × <i>n</i>.
          </span>
        </Controls>
      </div>
    </Figure>
  )
}
