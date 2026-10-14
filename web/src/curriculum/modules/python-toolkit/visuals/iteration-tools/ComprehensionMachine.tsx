import { useEffect, useState, type ReactNode } from 'react'
import { Figure, Segmented, usePlayer, PlayerControls, useContainerWidth } from '../../../../../kit'
import { CodePanel } from './CodePanel'
import s from './it.module.css'

/*
  A list comprehension as a conveyor belt. Each input value is taken in turn, tested by the filter
  gate (if there is one) and, if it passes, transformed by the expression and appended to the
  output list. The equivalent for-loop is shown alongside, with the running line highlighted.
  Python semantics are used throughout (e.g. -1 % 3 == 2).
*/

type SrcKey = 'nums' | 'range'
type ExprKey = 'x' | 'sq' | 'dbl' | 'mod'
type FiltKey = 'none' | 'pos' | 'even' | 'notm1'

const SOURCES: Record<SrcKey, { code: string; label: string; values: number[] }> = {
  nums: { code: 'nums', label: 'nums = [3, -1, 4, -1, 5, -9]', values: [3, -1, 4, -1, 5, -9] },
  range: { code: 'range(6)', label: 'range(6) gives 0, 1, 2, 3, 4, 5', values: [0, 1, 2, 3, 4, 5] },
}
const pyMod = (a: number, b: number) => ((a % b) + b) % b
const EXPRS: Record<ExprKey, { code: string; f: (x: number) => number }> = {
  x: { code: 'x', f: (x) => x },
  sq: { code: 'x ** 2', f: (x) => x * x },
  dbl: { code: '2 * x', f: (x) => 2 * x },
  mod: { code: 'x % 3', f: (x) => pyMod(x, 3) },
}
const FILTERS: Record<FiltKey, { code: string; f: (x: number) => boolean }> = {
  none: { code: '', f: () => true },
  pos: { code: 'if x > 0', f: (x) => x > 0 },
  even: { code: 'if x % 2 == 0', f: (x) => pyMod(x, 2) === 0 },
  notm1: { code: 'if x != -1', f: (x) => x !== -1 },
}

export default function ComprehensionMachine() {
  const [src, setSrc] = useState<SrcKey>('nums')
  const [expr, setExpr] = useState<ExprKey>('sq')
  const [filt, setFilt] = useState<FiltKey>('pos')
  const S = SOURCES[src]
  const E = EXPRS[expr]
  const F = FILTERS[filt]
  const n = S.values.length
  const total = 2 * n + 1
  const player = usePlayer({ steps: total, interval: 750 })

  // Complete at rest: whenever the recipe changes, show the finished result (press Play to watch it run).
  useEffect(() => {
    player.setStep(total - 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, expr, filt])

  const k = player.step
  const cur = k === 0 ? -1 : Math.floor((k - 1) / 2)
  const ph = k === 0 ? -1 : (k - 1) % 2
  const doneUpTo = (j: number) => j < cur || (j === cur && ph === 1)
  const passes = S.values.map(F.f)
  const out = S.values.map((x, j) => ({ j, v: E.f(x) })).filter(({ j }) => passes[j] && doneUpTo(j))
  const rejected = S.values.map((x, j) => ({ j, x })).filter(({ j }) => !passes[j] && doneUpTo(j))
  const allOut = S.values.filter((_, j) => passes[j]).map(E.f)

  const hasFilter = filt !== 'none'
  const loopLines = hasFilter
    ? ['result = []', `for x in ${S.code}:`, `    ${F.code}:`, `        result.append(${E.code})`]
    : ['result = []', `for x in ${S.code}:`, `    result.append(${E.code})`]
  const appendLine = hasFilter ? 4 : 3
  const active = cur < 0 ? 1 : ph === 0 ? (hasFilter ? 3 : 2) : passes[cur] ? appendLine : 3

  const x = cur >= 0 ? S.values[cur] : null
  let status: ReactNode
  if (cur < 0) status = <>Ready: the loop is about to take the first value.</>
  else if (ph === 0)
    status = hasFilter ? (
      <>
        x = {x}. Test <span className={s.mono}>{F.code.replace('if ', '')}</span>: {passes[cur] ? <b className={s.ok}>True, so it passes the gate</b> : <b className={s.err}>False, so it is rejected</b>}.
      </>
    ) : (
      <>x = {x}. There is no filter, so every value goes through.</>
    )
  else
    status = passes[cur] ? (
      <>
        Compute <span className={s.mono}>{E.code}</span> with x = {x}: <b>{E.f(x!)}</b>, and append it to the result.
      </>
    ) : (
      <>x = {x} is skipped: nothing is appended.</>
    )

  // ---------- layout ----------
  const [ref, measured] = useContainerWidth<HTMLDivElement>(520)
  const width = Math.max(300, Math.min(measured, 600))
  const wide = width >= 520
  const chipW = wide ? 50 : 40
  const gap = Math.min(10, (width - 8 - n * chipW) / (n - 1))
  const rowX = (j: number) => (width - (n * chipW + (n - 1) * gap)) / 2 + j * (chipW + gap)
  const inY = 26
  const mY = 116 // centre line of the machine row
  const outY = 214
  const height = 276
  // machine row
  const bx = wide ? 48 : 40 // width of the small x and value boxes
  const ag = 15 // gap for each arrow
  const room = width - 2 * bx - 3 * ag - 8
  const gateW = Math.min(150, room * 0.55)
  const exprW = Math.min(126, room * 0.45)
  const machineW = 2 * bx + 3 * ag + gateW + exprW
  const m0 = (width - machineW) / 2
  const gateX = m0 + bx + ag
  const exprX = gateX + gateW + ag
  const resX = exprX + exprW + ag
  const pass = cur >= 0 ? passes[cur] : null

  const arrow = (x1: number, x2: number, y: number, on: boolean) => (
    <g>
      <line x1={x1} y1={y} x2={x2 - 5} y2={y} style={{ stroke: on ? 'var(--ink-2)' : 'var(--rule)', strokeWidth: 2 }} />
      <path d={`M${x2},${y} l-7,-4.5 l0,9 Z`} style={{ fill: on ? 'var(--ink-2)' : 'var(--rule)' }} />
    </g>
  )

  return (
    <Figure
      title="A list comprehension is a loop on a conveyor belt"
      caption={
        <>
          Choose an expression and a filter, then press <b>Play</b> (or step with <b>Next</b>). Each value is tested by the gate; only values that pass are
          transformed and dropped into the result, in their original order. The for loop underneath does exactly the same work, line by line.
        </>
      }
    >
      <div ref={ref} className={s.wrap}>
        <pre className={s.bigCode} aria-label="The list comprehension">
          result = [<span className={s.exprPart}>{E.code}</span> <span className={s.forPart}>for x in {S.code}</span>
          {hasFilter && (
            <>
              {' '}
              <span className={s.ifPart}>{F.code}</span>
            </>
          )}
          ]
        </pre>

        <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={`Inputs ${S.values.join(', ')}. Result so far: [${out.map((o) => o.v).join(', ')}].`} style={{ display: 'block', maxWidth: width, margin: '0 auto' }}>
          {/* inputs */}
          <text x={rowX(0)} y={14} style={{ fill: 'var(--viz-1)', fontSize: 12, fontWeight: 800 }}>
            {S.label}
          </text>
          {S.values.map((v, j) => {
            const isCur = j === cur
            const done = doneUpTo(j) && !isCur
            return (
              <g key={j} style={{ opacity: done ? 0.4 : 1, transition: 'opacity 0.3s' }}>
                <rect x={rowX(j)} y={inY} width={chipW} height={30} rx={8} style={{ fill: isCur ? 'color-mix(in srgb, var(--viz-1) 22%, var(--surface))' : 'var(--surface)', stroke: 'var(--viz-1)', strokeWidth: isCur ? 2.5 : 1.3 }} />
                <text x={rowX(j) + chipW / 2} y={inY + 20} textAnchor="middle" className={s.svgMono} style={{ fill: 'var(--ink)', fontSize: wide ? 14 : 13, fontWeight: 700 }}>
                  {v}
                </text>
              </g>
            )
          })}
          {cur >= 0 && (
            <path d={`M${rowX(cur) + chipW / 2},${inY + 32} C${rowX(cur) + chipW / 2},${mY - 30} ${m0 + bx / 2},${inY + 50} ${m0 + bx / 2},${mY - 22}`} style={{ fill: 'none', stroke: 'var(--viz-1)', strokeWidth: 1.8, strokeDasharray: '4 3' }} />
          )}

          {/* machine: x -> gate -> expression -> value */}
          <rect x={m0} y={mY - 20} width={bx} height={40} rx={10} style={{ fill: 'color-mix(in srgb, var(--viz-1) 14%, var(--surface))', stroke: 'var(--viz-1)', strokeWidth: 2 }} />
          <text x={m0 + bx / 2} y={mY + 36} textAnchor="middle" style={{ fill: 'var(--viz-1)', fontSize: 11, fontWeight: 800 }}>
            x
          </text>
          <text x={m0 + bx / 2} y={mY + 5} textAnchor="middle" className={s.svgMono} style={{ fill: 'var(--ink)', fontSize: 14, fontWeight: 800 }}>
            {x ?? ''}
          </text>
          {arrow(m0 + bx, gateX, mY, cur >= 0)}
          <rect x={gateX} y={mY - 20} width={gateW} height={40} rx={10} style={{ fill: hasFilter ? 'color-mix(in srgb, var(--viz-3) 12%, var(--surface))' : 'var(--surface)', stroke: hasFilter ? 'var(--viz-3)' : 'var(--rule)', strokeWidth: 2, strokeDasharray: hasFilter ? undefined : '4 3' }} />
          <text x={gateX + gateW / 2} y={mY + 5} textAnchor="middle" className={s.svgMono} style={{ fill: hasFilter ? 'var(--viz-3)' : 'var(--viz-muted)', fontSize: 12, fontWeight: 800 }}>
            {hasFilter ? F.code.replace('if ', '') : 'no filter'}
          </text>
          <text x={gateX + gateW / 2} y={mY + 36} textAnchor="middle" style={{ fill: 'var(--viz-3)', fontSize: 11, fontWeight: 800 }}>
            gate
          </text>
          {cur >= 0 && hasFilter && (
            <text x={gateX + gateW / 2} y={mY + 54} textAnchor="middle" style={{ fill: pass ? 'var(--viz-pos)' : 'var(--viz-neg)', fontSize: 12, fontWeight: 800 }}>
              {pass ? '✓ True: pass' : '✗ False: reject'}
            </text>
          )}
          {arrow(gateX + gateW, exprX, mY, cur >= 0 && !!pass)}
          <rect x={exprX} y={mY - 20} width={exprW} height={40} rx={10} style={{ fill: 'color-mix(in srgb, var(--viz-2) 14%, var(--surface))', stroke: 'var(--viz-2)', strokeWidth: 2 }} />
          <text x={exprX + exprW / 2} y={mY + 5} textAnchor="middle" className={s.svgMono} style={{ fill: 'var(--viz-2)', fontSize: 12.5, fontWeight: 800 }}>
            {E.code}
          </text>
          <text x={exprX + exprW / 2} y={mY + 36} textAnchor="middle" style={{ fill: 'var(--viz-2)', fontSize: 11, fontWeight: 800 }}>
            expression
          </text>
          {arrow(exprX + exprW, resX, mY, cur >= 0 && !!pass && ph === 1)}
          <rect x={resX} y={mY - 20} width={bx} height={40} rx={10} style={{ fill: 'var(--surface)', stroke: cur >= 0 && pass && ph === 1 ? 'var(--viz-pos)' : 'var(--rule)', strokeWidth: 2 }} />
          <text x={resX + bx / 2} y={mY + 36} textAnchor="middle" style={{ fill: 'var(--viz-pos)', fontSize: 11, fontWeight: 800 }}>
            value
          </text>
          <text x={resX + bx / 2} y={mY + 5} textAnchor="middle" className={s.svgMono} style={{ fill: 'var(--ink)', fontSize: 14, fontWeight: 800 }}>
            {cur >= 0 && pass && ph === 1 ? E.f(x!) : ''}
          </text>

          {/* output list */}
          <text x={rowX(0)} y={outY - 12} style={{ fill: 'var(--viz-pos)', fontSize: 12, fontWeight: 800 }}>
            result
          </text>
          <text x={rowX(0) - 2} y={outY + 20} textAnchor="end" className={s.svgMono} style={{ fill: 'var(--ink-2)', fontSize: 18 }}>
            [
          </text>
          {out.map((o, i) => (
            <g key={o.j}>
              <rect x={rowX(i)} y={outY} width={chipW} height={28} rx={8} style={{ fill: 'color-mix(in srgb, var(--viz-pos) 18%, var(--surface))', stroke: 'var(--viz-pos)', strokeWidth: 1.5 }} />
              <text x={rowX(i) + chipW / 2} y={outY + 19} textAnchor="middle" className={s.svgMono} style={{ fill: 'var(--ink)', fontSize: 13, fontWeight: 800 }}>
                {o.v}
              </text>
            </g>
          ))}
          <text x={out.length ? rowX(out.length - 1) + chipW + 4 : rowX(0) + 4} y={outY + 20} className={s.svgMono} style={{ fill: 'var(--ink-2)', fontSize: 18 }}>
            ]
          </text>
          {rejected.length > 0 && (
            <text x={rowX(0)} y={outY + 52} style={{ fill: 'var(--viz-neg)', fontSize: 12, fontWeight: 700 }}>
              rejected by the gate: {rejected.map((r) => r.x).join(', ')}
            </text>
          )}
        </svg>
        <div className={s.split}>
          <CodePanel lines={loopLines} active={active} label="The same thing as a for loop" />
          <div className={s.status} aria-live="polite">
            {status}
          </div>
        </div>

        <pre className={s.console}>
          <span className={s.consoleLabel}>print(result)</span>
          {k === total - 1 ? <span className={s.out}>[{allOut.join(', ')}]</span> : <span className={s.muted}>[{out.map((o) => o.v).join(', ')}…</span>}
        </pre>

        <PlayerControls player={player} label={(st) => (st === 0 ? 'Start' : `Value ${Math.floor((st - 1) / 2) + 1} of ${n}`)} />
        <div className={s.row}>
          <Segmented label="Expression" value={expr} onChange={setExpr} options={(Object.keys(EXPRS) as ExprKey[]).map((key) => ({ value: key, label: <span className={s.mono}>{EXPRS[key].code}</span> }))} />
          <Segmented label="Filter" value={filt} onChange={setFilt} options={(Object.keys(FILTERS) as FiltKey[]).map((key) => ({ value: key, label: <span className={s.mono}>{FILTERS[key].code || 'none'}</span> }))} />
          <Segmented label="Input" value={src} onChange={setSrc} options={[{ value: 'nums', label: <span className={s.mono}>nums</span> }, { value: 'range', label: <span className={s.mono}>range(6)</span> }]} />
        </div>
      </div>
    </Figure>
  )
}
