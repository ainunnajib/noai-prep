import { useEffect, useState } from 'react'
import { Figure, Controls, Slider, Button, usePlayer, PlayerControls, useContainerWidth } from '../../../../../kit'
import { ChoiceGroup } from '../references-mutability/pyviz'
import s from './it.module.css'

/*
  zip as a jacket zip: items at the same position are joined into tuples, and the zip stops at
  the end of the shorter list. enumerate is the same idea with an automatic counter on the left.
  The console shows that both return a one-pass iterator: list(z) a second time gives [].
*/

type Mode = 'zip' | 'enum' | 'enum1'
const NAMES = ['Aisha', 'Ben', 'Chen', 'Dev', 'Ella']
const SCORES = [78, 92, 85, 64, 70]
const q = (x: string) => `'${x}'`

interface Line {
  cmd: string
  out?: string
  note?: string
}

export default function ZipZipper() {
  const [nNames, setNNames] = useState(4)
  const [nScores, setNScores] = useState(3)
  const [mode, setMode] = useState<Mode>('zip')
  const names = NAMES.slice(0, nNames)
  const scores = SCORES.slice(0, nScores)
  const isZip = mode === 'zip'
  const start = mode === 'enum1' ? 1 : 0
  const left = isZip ? names.map(q) : names.map((_, i) => String(i + start))
  const right = isZip ? scores.map(String) : names.map(q)
  const pairs = Math.min(left.length, right.length)
  const tuples = Array.from({ length: pairs }, (_, i) => `(${left[i]}, ${right[i]})`)
  const listText = `[${tuples.join(', ')}]`
  const makeCmd = isZip ? 'z = zip(names, scores)' : mode === 'enum' ? 'z = enumerate(names)' : 'z = enumerate(names, start=1)'
  const objName = isZip ? 'zip' : 'enumerate'

  // At rest the diagram already shows the pairs zip will make, but the console has only created z:
  // the learner's first print(list(z)) shows the pairs, and the second shows [].
  const freshLog = (): Line[] => [{ cmd: makeCmd }]
  const [log, setLog] = useState<Line[]>(freshLog)
  const [used, setUsed] = useState(false)
  const player = usePlayer({ steps: pairs + 1, interval: 520 })

  useEffect(() => {
    setLog(freshLog())
    setUsed(false)
    player.setStep(pairs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nNames, nScores, mode])

  const push = (l: Line) => setLog((old) => [...old, l].slice(-7))
  const listAgain = () => {
    if (used) push({ cmd: 'print(list(z))', out: '[]', note: 'already used up!' })
    else {
      push({ cmd: 'print(list(z))', out: listText })
      setUsed(true)
      player.play()
    }
  }
  const remake = () => {
    push({ cmd: makeCmd })
    setUsed(false)
    player.reset()
  }

  // ---------- layout ----------
  const [ref, measured] = useContainerWidth<HTMLDivElement>(520)
  const narrow = measured < 520
  const width = Math.max(300, Math.min(measured, 560))
  const charW = 7.6
  const chip = (t: string) => t.length * charW + 14
  const rows = Math.max(left.length, right.length)
  const rowH = 36
  const top = 30
  // room below the last row only when the pull tab parks there (every row has a partner)
  const height = top + Math.max(rows * rowH + 6, pairs * rowH + 24)
  const lw = Math.max(...left.map(chip), 40)
  const rw = Math.max(...right.map(chip), 40)
  const tw = Math.max(...tuples.map(chip), 60)
  const teeth = 40
  const arrowW = 24
  const total = lw + teeth + rw + arrowW + tw
  const x0 = Math.max(4, (width - total) / 2)
  const xL = x0
  const xT = xL + lw
  const xR = xT + teeth
  const xA = xR + rw
  const xP = xA + arrowW
  const rowY = (i: number) => top + i * rowH
  const zippedRows = player.step // rows 0..step-1 are zipped
  const pullY = rowY(Math.min(zippedRows, pairs)) - 6
  const leftover = (side: 'L' | 'R', i: number) => (side === 'L' ? i >= right.length : i >= left.length)

  return (
    <Figure
      title="zip pairs items up, and stops at the shorter list"
      caption={
        <>
          Change the lengths of the two lists and watch the zip close pair by pair: items without a partner are dropped. Switch to{' '}
          <span className={s.mono}>enumerate</span> to get a counter instead of a second list. Then press <span className={s.mono}>print(list(z))</span> twice: an iterator can
          only be used once, so the second time it gives <span className={s.mono}>[]</span>. Make a fresh <span className={s.mono}>z</span> to start again.
        </>
      }
    >
      <div ref={ref} className={s.wrap}>
        <pre className={s.bigCode} style={{ fontSize: '0.85rem' }}>
          names = [{names.map(q).join(', ')}]
          {isZip && (
            <>
              {'\n'}scores = [{scores.join(', ')}]
            </>
          )}
        </pre>

        <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={`${makeCmd.slice(4)} gives ${listText}`} style={{ display: 'block', maxWidth: width, margin: '0 auto' }}>
          <text x={xL + lw / 2} y={16} textAnchor="middle" style={{ fill: 'var(--viz-1)', fontSize: 12, fontWeight: 800 }}>
            {isZip ? 'names' : 'counter'}
          </text>
          <text x={xR + rw / 2} y={16} textAnchor="middle" style={{ fill: 'var(--viz-2)', fontSize: 12, fontWeight: 800 }}>
            {isZip ? 'scores' : 'names'}
          </text>
          <text x={xP + tw / 2} y={16} textAnchor="middle" style={{ fill: 'var(--viz-3)', fontSize: 12, fontWeight: 800 }}>
            tuples
          </text>
          <text x={xT + teeth / 2} y={16} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 12, fontWeight: 800 }}>
            zip
          </text>
          {/* zipper tape */}
          <rect x={xT + 4} y={top - 4} width={teeth - 8} height={rows * rowH} rx={4} style={{ fill: 'var(--surface-2)' }} />
          {Array.from({ length: rows }, (_, i) => {
            const y = rowY(i)
            const closed = i < zippedRows && i < pairs
            const hasL = i < left.length
            const hasR = i < right.length
            const midY = y + 14
            return (
              <g key={i}>
                {hasL && (
                  <g style={{ opacity: leftover('L', i) ? 0.35 : 1 }}>
                    <rect x={xL} y={y} width={lw} height={28} rx={8} style={{ fill: 'color-mix(in srgb, var(--viz-1) 14%, var(--surface))', stroke: 'var(--viz-1)', strokeWidth: 1.5 }} />
                    <text x={xL + lw / 2} y={y + 19} textAnchor="middle" className={s.svgMono} style={{ fill: 'var(--ink)', fontSize: 12.5, fontWeight: 700 }}>
                      {left[i]}
                    </text>
                  </g>
                )}
                {hasR && (
                  <g style={{ opacity: leftover('R', i) ? 0.35 : 1 }}>
                    <rect x={xR} y={y} width={rw} height={28} rx={8} style={{ fill: 'color-mix(in srgb, var(--viz-2) 14%, var(--surface))', stroke: 'var(--viz-2)', strokeWidth: 1.5 }} />
                    <text x={xR + rw / 2} y={y + 19} textAnchor="middle" className={s.svgMono} style={{ fill: 'var(--ink)', fontSize: 12.5, fontWeight: 700 }}>
                      {right[i]}
                    </text>
                  </g>
                )}
                {/* teeth: interlocked when this row is zipped, apart otherwise */}
                <rect x={closed ? xT + 6 : xT + 2} y={midY - 10} width={(teeth - 8) / 2 + 2} height={9} rx={2} style={{ fill: hasL ? 'var(--viz-1)' : 'var(--rule)', transition: 'x 0.3s' }} />
                <rect x={closed ? xT + teeth / 2 - 3 : xT + teeth / 2 + 1} y={midY + 1} width={(teeth - 8) / 2 + 2} height={9} rx={2} style={{ fill: hasR ? 'var(--viz-2)' : 'var(--rule)', transition: 'x 0.3s' }} />
                {i < pairs ? (
                  <g style={{ opacity: closed ? 1 : 0, transition: 'opacity 0.3s' }}>
                    <line x1={xA + 4} y1={midY} x2={xP - 6} y2={midY} style={{ stroke: 'var(--ink-2)', strokeWidth: 1.5 }} />
                    <path d={`M${xP - 2},${midY} l-6,-4 l0,8 Z`} style={{ fill: 'var(--ink-2)' }} />
                    <rect x={xP} y={y} width={tw} height={28} rx={8} style={{ fill: 'color-mix(in srgb, var(--viz-3) 16%, var(--surface))', stroke: 'var(--viz-3)', strokeWidth: 1.5 }} />
                    <text x={xP + tw / 2} y={y + 19} textAnchor="middle" className={s.svgMono} style={{ fill: 'var(--ink)', fontSize: 12.5, fontWeight: 700 }}>
                      {tuples[i]}
                    </text>
                  </g>
                ) : (
                  <text x={xP + 4} y={y + 19} style={{ fill: 'var(--viz-muted)', fontSize: 12, fontStyle: 'italic', opacity: zippedRows >= pairs ? 1 : 0 }}>
                    no partner: dropped
                  </text>
                )}
              </g>
            )
          })}
          {/* the zip pull */}
          <g style={{ transform: `translateY(${pullY}px)`, transition: 'transform 0.45s ease' }}>
            <rect x={xT + teeth / 2 - 11} y={0} width={22} height={13} rx={3} style={{ fill: 'var(--ink-2)' }} />
            <rect x={xT + teeth / 2 - 5} y={12} width={10} height={16} rx={3} style={{ fill: 'var(--ink-2)' }} />
          </g>
        </svg>

        <pre className={s.console} aria-live="polite">
          <span className={s.consoleLabel}>Python console</span>
          {log.map((l, i) => (
            <span key={i}>
              <span className={s.muted}>{'>>> '}</span>
              {l.cmd}
              {'\n'}
              {l.out != null && (
                <>
                  <span className={l.out === '[]' ? s.err : s.out}>{l.out}</span>
                  {l.note && <span className={s.muted}>{`   # ${l.note}`}</span>}
                  {'\n'}
                </>
              )}
            </span>
          ))}
        </pre>
        <div className={s.row} role="group" aria-label="Try in the console">
          <span className={s.rowLabel}>Try in the console:</span>
          <Button onClick={remake}>
            <span className={s.mono}>{makeCmd}</span>
          </Button>
          <Button onClick={() => push({ cmd: 'print(z)', out: `<${objName} object at 0x…>`, note: 'a lazy iterator, not a list' })}>
            <span className={s.mono}>print(z)</span>
          </Button>
          <Button primary onClick={listAgain}>
            <span className={s.mono}>print(list(z))</span>
          </Button>
        </div>
        <PlayerControls player={player} label={(k) => `${k} of ${pairs} pairs zipped`} />
        <ChoiceGroup
          narrow={narrow}
          label="Function"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'zip', label: <span className={s.mono}>zip(names, scores)</span>, short: <span className={s.mono}>zip</span> },
            { value: 'enum', label: <span className={s.mono}>enumerate(names)</span>, short: <span className={s.mono}>enumerate</span> },
            { value: 'enum1', label: <span className={s.mono}>enumerate(names, start=1)</span>, short: <span className={s.mono}>enumerate(start=1)</span> },
          ]}
        />
        <Controls>
          <Slider label="len(names)" value={nNames} min={1} max={5} step={1} onChange={setNNames} />
          {isZip && <Slider label="len(scores)" value={nScores} min={1} max={5} step={1} onChange={setNScores} />}
        </Controls>
      </div>
    </Figure>
  )
}
