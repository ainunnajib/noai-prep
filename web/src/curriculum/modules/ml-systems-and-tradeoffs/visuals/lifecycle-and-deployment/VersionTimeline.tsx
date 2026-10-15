import { useState } from 'react'
import { Figure, Controls, Segmented, Toggle, useNarrow } from '../../../../../kit'

/*
  Six weekly retrains of a fraud model. Each week produces (or reuses) six artefacts. If an artefact
  type is not versioned, every retrain overwrites it, so only week 6's copy survives.
  Two things a compliance team might ask for week W:
    re-run  : reproduce the exact predictions (e.g. why transaction X was flagged)
              needs weights + scaler/encoder + code + library versions
    rebuild : retrain the same model from scratch to show how it was made
              needs data + code + config & seed + library versions
              (the scaler/encoder is refitted from the data by the code)
*/

type Art = 'data' | 'code' | 'config' | 'env' | 'prep' | 'weights'

const ROWS: { id: Art; name: string; cells: string[]; colour: string }[] = [
  { id: 'data', name: 'Data snapshot', cells: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'], colour: 'var(--viz-1)' },
  { id: 'code', name: 'Code (commit)', cells: ['3fa', '3fa', '9c2', '9c2', 'e71', 'e71'], colour: 'var(--viz-5)' },
  { id: 'config', name: 'Config + seed', cells: ['s7', 's12', 's3', 's41', 's8', 's19'], colour: 'var(--viz-6)' },
  { id: 'env', name: 'Library versions', cells: ['2.3', '2.3', '2.3', '2.3', '2.4', '2.4'], colour: 'var(--viz-3)' },
  { id: 'prep', name: 'Scaler / encoder', cells: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'], colour: 'var(--viz-2)' },
  { id: 'weights', name: 'Model weights', cells: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'], colour: 'var(--viz-4)' },
]

const NAME: Record<Art, string> = {
  data: 'data snapshot',
  code: 'code version',
  config: 'config and random seed',
  env: 'library versions',
  prep: 'fitted scaler / encoder',
  weights: 'model weights',
}

const GOALS: { title: string; needs: Art[]; good: string; bad: string }[] = [
  {
    title: 'Re-run its predictions (why was transaction X flagged?)',
    needs: ['weights', 'prep', 'code', 'env'],
    good: 'Reproduced: the same inputs give the same scores as in that week.',
    bad: 'Cannot re-run it exactly.',
  },
  {
    title: 'Rebuild it from scratch (show how it was trained)',
    needs: ['data', 'code', 'config', 'env'],
    good: 'Reproduced: retraining gives the same model.',
    bad: 'Cannot rebuild it.',
  },
]

const LATEST = 6

export default function VersionTimeline() {
  const [tracked, setTracked] = useState<Record<Art, boolean>>({ data: false, code: true, config: false, env: false, prep: false, weights: false })
  const [week, setWeek] = useState(3)
  const [ref, narrow] = useNarrow<HTMLDivElement>(520)
  const has = (a: Art, w: number) => tracked[a] || w === LATEST
  const allOk = GOALS.every((g) => g.needs.every((a) => has(a, week)))

  return (
    <Figure
      wide
      title={`Can you reproduce the model from week ${week}?`}
      caption={
        <>
          The team retrains a fraud model every week. Anything that is <b>not versioned</b> gets overwritten by the next retrain, so only week 6’s copy survives (faded, crossed-out chips).
          At the start only the code is in git, as in many real teams. Switch on versioning for more artefacts until both requests for week 3 succeed, then try other weeks. Notice that
          “save the latest model” always works for week 6 and never for anything older.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', overflowX: 'auto' }}>
        <div
          role="table"
          aria-label="Artefacts produced by each weekly retrain"
          style={{ display: 'grid', gridTemplateColumns: `minmax(${narrow ? 92 : 130}px, 1.4fr) repeat(6, minmax(${narrow ? 33 : 44}px, 1fr))`, gap: narrow ? 3 : 5, alignItems: 'center', minWidth: 0 }}
        >
          <div role="columnheader" style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 700 }}>
            artefact
          </div>
          {[1, 2, 3, 4, 5, 6].map((w) => (
            <button
              key={w}
              type="button"
              role="columnheader"
              onClick={() => setWeek(w)}
              aria-pressed={week === w}
              style={{
                font: 'inherit',
                fontSize: 12,
                fontWeight: 800,
                padding: '3px 0',
                borderRadius: 7,
                border: `1.5px solid ${week === w ? 'var(--accent)' : 'transparent'}`,
                background: week === w ? 'var(--accent-soft)' : 'transparent',
                color: week === w ? 'var(--ink)' : 'var(--ink-3)',
                cursor: 'pointer',
              }}
            >
              {narrow ? `w${w}` : `week ${w}`}
            </button>
          ))}
          {ROWS.map((r) => (
            <div key={r.id} role="row" style={{ display: 'contents' }}>
              <div role="rowheader" style={{ fontSize: narrow ? 12 : 13, fontWeight: 700, color: 'var(--ink-2)', lineHeight: 1.2 }}>
                {r.name}
                <div style={{ fontSize: 11, fontWeight: 650, color: tracked[r.id] ? 'var(--ok)' : 'var(--ink-3)' }}>{tracked[r.id] ? 'versioned' : 'latest only'}</div>
              </div>
              {r.cells.map((c, i) => {
                const w = i + 1
                const ok = has(r.id, w)
                const isSel = w === week
                return (
                  <div
                    key={w}
                    role="cell"
                    onClick={() => setWeek(w)}
                    style={{
                      height: 30,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 7,
                      fontFamily: 'var(--font-mono)',
                      fontSize: narrow ? 11 : 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: ok ? `1.5px solid ${isSel ? 'var(--ok)' : r.colour}` : `1.5px dashed ${isSel ? 'var(--bad)' : 'var(--rule)'}`,
                      background: ok ? `color-mix(in srgb, ${r.colour} ${isSel ? 26 : 14}%, var(--surface))` : isSel ? 'var(--bad-soft)' : 'var(--surface-2)',
                      color: ok ? 'var(--ink)' : isSel ? 'var(--bad)' : 'var(--ink-3)',
                      textDecoration: ok ? undefined : 'line-through',
                      opacity: ok || isSel ? 1 : 0.7,
                      boxShadow: isSel ? '0 0 0 2px var(--accent-soft)' : undefined,
                    }}
                    aria-label={`${r.name}, week ${w}: ${ok ? c : 'overwritten'}`}
                  >
                    {c}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <Controls>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-2)', width: '100%' }}>Version these (keep every week’s copy):</span>
        {ROWS.map((r) => (
          <Toggle key={r.id} label={r.name} checked={tracked[r.id]} onChange={(v) => setTracked((t) => ({ ...t, [r.id]: v }))} />
        ))}
      </Controls>
      <Controls>
        <Segmented label="Week the auditors ask about" value={week} onChange={setWeek} options={[1, 2, 3, 4, 5, 6].map((w) => ({ value: w, label: String(w) }))} />
      </Controls>

      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }} role="status">
        {GOALS.map((g) => {
          const missing = g.needs.filter((a) => !has(a, week))
          const ok = missing.length === 0
          return (
            <div
              key={g.title}
              style={{
                borderRadius: 10,
                padding: '0.5rem 0.7rem',
                border: `1.5px solid ${ok ? 'var(--ok)' : 'var(--bad)'}`,
                background: ok ? 'var(--ok-soft)' : 'var(--bad-soft)',
                fontSize: 13,
                lineHeight: 1.45,
              }}
            >
              <div style={{ fontWeight: 800, color: 'var(--ink)' }}>
                Week {week}: {g.title}
              </div>
              <ul style={{ margin: '4px 0', paddingLeft: '1.1rem' }}>
                {g.needs.map((a) => (
                  <li key={a} style={{ color: has(a, week) ? 'var(--ok)' : 'var(--bad)', fontWeight: 650 }}>
                    {has(a, week) ? '✓' : '✗'} {NAME[a]}
                    {!has(a, week) && ' (overwritten)'}
                  </li>
                ))}
              </ul>
              <div style={{ fontWeight: 750, color: ok ? 'var(--ok)' : 'var(--bad)' }}>{ok ? g.good : g.bad}</div>
            </div>
          )
        })}
      </div>
      {allOk && week !== LATEST && (
        <div style={{ width: '100%', fontSize: 13.5, color: 'var(--ink-2)' }}>
          Both requests succeed for week {week}, and it took all six artefact types. An experiment tracker or model registry records exactly this bundle for every run.
        </div>
      )}
    </Figure>
  )
}
