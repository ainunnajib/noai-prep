import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Button, Plot, Grid, Axes, Arrow, Path, Label, DraggablePoint, MatrixGrid, M } from '../../../../../kit'
import { type M2, type V2, type Eig, apply, eig2, dirV, angleOf, lineGap, norm, scale, fmt, fix, fmtV, imageOfCircle } from './eig2'
import s from './ev.module.css'

/*
  Hunt for the directions a matrix does not turn. The probe v runs round the unit circle; Av is
  drawn from the same origin. When Av lands on v's own line, v is an eigenvector and the
  stretch factor λ = (signed length of Av) / (length of v) is its eigenvalue.
*/

const PRESETS: { name: string; m: M2 }[] = [
  { name: 'Stretch', m: [[2, 1], [1, 2]] },
  { name: 'Diagonal', m: [[2, 0], [0, 0.5]] },
  { name: 'Flip', m: [[1, 2], [2, 1]] },
  { name: 'Shear', m: [[1, 1], [0, 1]] },
  { name: 'Squash', m: [[1, 2], [0.5, 1]] },
  { name: 'Rotate 90°', m: [[0, -1], [1, 0]] },
]

const ALIGN = 0.6 // degrees: closer than this counts as "on the line"
const SNAP = 3.5 // degrees: dragging this close snaps onto an eigen-line

const sameM = (A: M2, B: M2) => A.every((r, i) => r.every((v, j) => Math.abs(v - B[i][j]) < 1e-9))
const norm180 = (a: number) => ((a % 180) + 180) % 180
/** eigen-directions as angles in [0, 180) with their eigenvalues */
function dirsOf(eig: Eig): { ang: number; l: number }[] {
  if (eig.kind === 'two') return [{ ang: norm180(angleOf(eig.v1)), l: eig.l1 }, { ang: norm180(angleOf(eig.v2)), l: eig.l2 }]
  if (eig.kind === 'one') return [{ ang: norm180(angleOf(eig.v)), l: eig.l }]
  return []
}

export default function EigenHunter() {
  const [m, setM] = useState<M2>(PRESETS[0].m)
  const [theta, setTheta] = useState(25)
  const [found, setFound] = useState<number[]>([])
  const [showLines, setShowLines] = useState(false)
  const [editing, setEditing] = useState(false)

  const eig = useMemo(() => eig2(m), [m])
  const dirs = useMemo(() => dirsOf(eig), [eig])

  const outline = useMemo(() => imageOfCircle(m), [m])
  const reach = Math.max(...outline.map(norm))
  const L = Math.max(2.5, Math.ceil(reach * 1.15 * 2) / 2)

  const v = dirV(theta)
  const Av = apply(m, v)
  const hit = eig.kind === 'all' ? { ang: theta, l: eig.l } : dirs.find((d) => lineGap(theta, d.ang) < ALIGN)
  const lam = hit ? hit.l : null
  const gap = norm(Av) < 1e-9 ? 0 : lineGap(angleOf(Av), theta)

  const record = (t: number) => {
    const d = dirs.find((q) => lineGap(t, q.ang) < ALIGN)
    if (d) {
      const key = Math.round(d.ang * 10) / 10
      setFound((f) => (f.includes(key) ? f : [...f, key]))
    }
  }

  const setDir = (t: number, snap: number) => {
    let nt = ((t % 360) + 360) % 360
    for (const d of dirs) {
      if (lineGap(nt, d.ang) < snap) {
        // snap to whichever end of the eigen-line is nearer
        const cands = [d.ang, d.ang + 180, d.ang - 180, d.ang + 360]
        nt = cands.reduce((best, c) => (Math.abs(c - nt) < Math.abs(best - nt) ? c : best), cands[0])
        nt = ((nt % 360) + 360) % 360
      }
    }
    setTheta(nt)
    record(nt)
  }

  const choose = (mm: M2) => {
    setM(mm)
    // a new matrix starts a new hunt, but if v already sits on one of its eigen-lines, that one counts as found
    const d = dirsOf(eig2(mm)).find((q) => lineGap(theta, q.ang) < ALIGN)
    setFound(d ? [Math.round(d.ang * 10) / 10] : [])
  }
  const setEntry = (i: 0 | 1, j: 0 | 1, val: number) => {
    const mm = m.map((r) => [...r]) as M2
    mm[i][j] = val
    choose(mm)
  }

  const total = eig.kind === 'two' ? 2 : eig.kind === 'one' ? 1 : 0

  let status: { cls: string; text: React.ReactNode }
  if (eig.kind === 'all') {
    status = { cls: s.statusGood, text: <>This matrix is {fmt(eig.l)} times the identity: it scales every arrow by the same factor, so <b>every</b> direction is an eigenvector with λ = {fmt(eig.l)}.</> }
  } else if (lam !== null && Math.abs(lam) < 1e-6) {
    status = { cls: s.statusGood, text: <>Eigenvector found. <i>A</i> squashes this direction to the zero vector: <M>{'Av = 0 = 0\\cdot v'}</M>, so its eigenvalue is <b>λ = 0</b>.</> }
  } else if (lam !== null) {
    status = {
      cls: s.statusGood,
      text: (
        <>
          Eigenvector found. <i>Av</i> lies on <i>v</i>'s own line{lam < 0 ? ', pointing backwards' : ''}: <M>{`Av = ${fmt(lam)}\\,v`}</M>, so its eigenvalue is{' '}
          <b>λ = {fmt(lam)}</b>
          {lam < 0 ? ' (a flip)' : Math.abs(lam - 1) < 1e-6 ? ' (left exactly as it was)' : lam > 1 ? ' (a stretch)' : ' (a shrink)'}.
        </>
      ),
    }
  } else if (eig.kind === 'complex') {
    status = { cls: s.statusBad, text: <>Av is {gap.toFixed(1)}° off v's line. Try every direction: this matrix turns <b>all</b> of them, so it has no real eigenvectors.</> }
  } else {
    status = { cls: '', text: <>Av is turned {gap.toFixed(1)}° away from v's line, so this v is <b>not</b> an eigenvector. Keep turning v.</> }
  }

  const presetIdx = PRESETS.findIndex((p) => sameM(p.m, m))
  const far = L * 3

  return (
    <Figure
      title="Eigenvector hunt: find the arrows that do not turn"
      caption={
        <>
          <b>Try:</b>
          <ol className="try">
            <li>
              Drag the <span className={s.c1}>blue</span> tip round until the <span className={s.c2}>orange</span> output lands on its line.
            </li>
            <li>
              Try the presets <b>Flip</b>, <b>Shear</b>, <b>Squash</b> and <b>Rotate 90°</b>.
            </li>
          </ol>
          <b>Notice:</b> when <i>Av</i> lands on v's own line you have an eigenvector, and the stretch is λ; Flip gives a negative λ, Shear only one eigen-line,
          Squash λ = 0 and Rotate 90° none at all.
          <span className="fine">
            The dashed circle holds every input of length 1, the shaded oval every output. Turn on <b>Edit the matrix entries</b> to build your own.
          </span>
        </>
      }
    >
      <div className={s.stack}>
        <div className={s.row}>
          {PRESETS.map((p, i) => (
            <Button key={p.name} primary={i === presetIdx} onClick={() => choose(p.m)}>
              {p.name}
            </Button>
          ))}
        </div>
        <Plot x={[-L, L]} y={[-L, L]} width={400} height={400} margin={{ top: 10, right: 10, bottom: 10, left: 10 }} ariaLabel="A probe arrow v on the unit circle and its image Av under the matrix">
          <Grid xTicks={2 * L} yTicks={2 * L} />
          <Axes origin xTicks={Math.min(8, 2 * L)} yTicks={Math.min(8, 2 * L)} />
          <Path points={outline} closed color="var(--viz-5)" width={1.5} fill="color-mix(in srgb, var(--viz-5) 12%, transparent)" opacity={0.9} />
          <Path points={imageOfCircle([[1, 0], [0, 1]])} closed color="var(--viz-muted)" width={1.5} dash="5 5" />
          {showLines &&
            dirs.map((d, i) => {
              const u = dirV(d.ang)
              return (
                <g key={i}>
                  <Path points={[scale(u, -far), scale(u, far)]} color="var(--viz-3)" width={2} dash="8 6" />
                  <Label x={u[0] * L * 0.82} y={u[1] * L * 0.82} dx={6} dy={u[0] * u[1] >= 0 ? 16 : -8} color="var(--viz-3)">
                    {`λ = ${fmt(d.l)}`}
                  </Label>
                </g>
              )
            })}
          {hit && <Path points={[scale(v, -far), scale(v, far)]} color="var(--highlight)" width={9} opacity={0.75} />}
          <Path points={[scale(v, -far), scale(v, far)]} color={hit ? 'var(--viz-3)' : 'var(--viz-muted)'} width={hit ? 2.5 : 1.2} dash={hit ? undefined : '2 5'} />
          <Arrow from={[0, 0]} to={Av} color="var(--viz-2)" width={hit ? 6 : 3.5} head={hit ? 14 : 11} label={lam !== null && Math.abs(lam - 1) < 1e-6 ? undefined : 'Av'} labelOffset={[8, 16]} />
          <Arrow from={[0, 0]} to={v} color="var(--viz-1)" width={3} />
          <DraggablePoint
            x={v[0]}
            y={v[1]}
            color="var(--viz-1)"
            r={8}
            label={lam !== null && Math.abs(lam - 1) < 1e-6 ? 'v = Av' : 'v'}
            onChange={(x, y) => setDir(angleOf([x, y] as V2), SNAP)}
          />
        </Plot>
        <div className={`${s.status} ${status.cls}`} role="status">
          {status.text}
        </div>
        <div className={s.chipRow} aria-label="eigen-lines found">
          {total === 0 ? (
            <span className={s.chip}>{eig.kind === 'all' ? 'every direction is an eigen-direction' : 'no real eigen-lines to find'}</span>
          ) : (
            Array.from({ length: total }, (_, i) => (
              <span key={i} className={`${s.chip} ${i < found.length ? s.chipOn : ''}`}>
                {i < found.length ? `eigen-line ${i + 1} found ✓` : `eigen-line ${i + 1}: ?`}
              </span>
            ))
          )}
        </div>
      </div>
      <Controls>
        <Slider label="direction of v" value={Math.round(theta)} min={0} max={359} step={1} onChange={(t) => setDir(t, 1.5)} format={(t) => `${t}°`} />
        <Readout
          items={[
            ['v', fmtV(v)],
            ['Av', fmtV(Av)],
            ['angle off v’s line', `${fix(gap, 1)}°`],
          ]}
        />
      </Controls>
      <div className={s.row}>
        <MatrixGrid data={m} format={(x) => fmt(x)} label={<>A</>} cellSize={48} ariaLabel="the matrix A" />
        <div style={{ display: 'grid', gap: '0.3rem' }}>
          <Toggle label="Show the eigen-lines" checked={showLines} onChange={setShowLines} />
          <Toggle label="Edit the matrix entries" checked={editing} onChange={setEditing} />
        </div>
      </div>
      {editing && (
        <div className={s.matSliders}>
          <Slider label="a" value={m[0][0]} min={-2} max={2} step={0.1} onChange={(x) => setEntry(0, 0, x)} format={(x) => fmt(x, 1)} />
          <Slider label="b" value={m[0][1]} min={-2} max={2} step={0.1} onChange={(x) => setEntry(0, 1, x)} format={(x) => fmt(x, 1)} />
          <Slider label="c" value={m[1][0]} min={-2} max={2} step={0.1} onChange={(x) => setEntry(1, 0, x)} format={(x) => fmt(x, 1)} />
          <Slider label="d" value={m[1][1]} min={-2} max={2} step={0.1} onChange={(x) => setEntry(1, 1, x)} format={(x) => fmt(x, 1)} />
        </div>
      )}
    </Figure>
  )
}
