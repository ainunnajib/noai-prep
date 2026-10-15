import { useState } from 'react'
import { Figure, Controls, Readout, Segmented, useContainerWidth } from '../../../../../kit'

/*
  The ML lifecycle as a loop. Six stages sit on a ring; "Frame the problem" sits in the middle
  because every stage serves it and monitoring can send you back to it. Click a stage to see its
  inputs, outputs, tools and typical failure.

  Manual versus automated: the hours are the manual daily-retrain process from a 2026 NOAI Prelim
  question (download 0.5 h + clean 1 h, features 2 h, train 1.5 h, deploy 1 h = 6 h). The slip
  estimate is an illustrative assumption: each of the 5 hand-run steps has a 2% chance of a human
  slip (wrong file, forgotten step, wrong model copied), so P(at least one slip) = 1 − 0.98^5 ≈ 9.6%
  per run, and over 30 daily runs about 30 × 0.096 ≈ 2.9 runs a month go wrong.
*/

type StageId = 'data' | 'features' | 'train' | 'evaluate' | 'deploy' | 'monitor' | 'frame'

interface Stage {
  id: StageId
  name: string
  short: string
  hours: number // hands-on hours in the manual process (0 = not part of the timed process)
  input: string
  output: string
  tools: string
  fails: string
}

const RING: Stage[] = [
  {
    id: 'data',
    name: 'Collect and clean data',
    short: 'Data',
    hours: 1.5,
    input: 'Raw records from databases, logs, sensors or forms.',
    output: 'A clean, labelled training table, saved as a versioned snapshot.',
    tools: 'SQL, pandas, an ETL job (extract → transform → load).',
    fails: 'Missing values, wrong labels, duplicates, or data from the future leaking into training.',
  },
  {
    id: 'features',
    name: 'Engineer features',
    short: 'Features',
    hours: 2,
    input: 'The clean table.',
    output: 'Model-ready numbers (scaled, encoded) plus the fitted scalers and encoders.',
    tools: 'scikit-learn Pipeline, a feature store.',
    fails: 'Training–serving skew: features computed one way in training and another way live.',
  },
  {
    id: 'train',
    name: 'Train',
    short: 'Train',
    hours: 1.5,
    input: 'Features, a config (hyperparameters) and a random seed.',
    output: 'Model weights.',
    tools: 'PyTorch or scikit-learn on a GPU/CPU; an experiment tracker such as MLflow logs each run.',
    fails: 'Overfitting, a bad learning rate, or a run nobody can reproduce.',
  },
  {
    id: 'evaluate',
    name: 'Evaluate',
    short: 'Evaluate',
    hours: 0,
    input: 'The new model and held-out (ideally the most recent) data.',
    output: 'Metrics against a baseline and the current model: a go or no-go decision.',
    tools: 'Validation and test sets, the experiment tracker.',
    fails: 'Testing on data the model has seen, the wrong metric, or old data only.',
  },
  {
    id: 'deploy',
    name: 'Deploy (serve)',
    short: 'Deploy',
    hours: 1,
    input: 'An approved model from the model registry.',
    output: 'Live predictions: a scheduled batch job or a real-time API.',
    tools: 'Model registry (staging → production), Docker, TorchScript/ONNX export, CI/CD.',
    fails: 'The wrong model version, different preprocessing from training, or answers that are too slow.',
  },
  {
    id: 'monitor',
    name: 'Monitor',
    short: 'Monitor',
    hours: 0,
    input: 'Live inputs, predictions, system metrics and (later) true labels.',
    output: 'Alerts that trigger investigation and retraining.',
    tools: 'Dashboards (e.g. Grafana), drift checks on input and prediction distributions.',
    fails: 'Watching only server errors, or waiting months for labels before noticing a problem.',
  },
]

const FRAME: Stage = {
  id: 'frame',
  name: 'Frame the problem',
  short: 'Frame',
  hours: 0,
  input: 'A real decision someone has to make ("which payments should we block?").',
  output: 'The prediction target, the metric that reflects its cost, a baseline to beat, and limits on latency and budget.',
  tools: 'Talking to the people who will use the predictions; looking at past data.',
  fails: 'Optimising the wrong thing, e.g. accuracy when only 1% of payments are fraud.',
}

const MANUAL_STEPS = 5 // download, clean, features, train, deploy
const SLIP = 0.02
const RUNS_PER_MONTH = 30

export default function MLLifecycleLoop() {
  const [sel, setSel] = useState<StageId>('train')
  const [mode, setMode] = useState<'manual' | 'auto'>('manual')
  const [wrapRef, measured] = useContainerWidth<HTMLDivElement>(520)
  const W = Math.max(300, Math.min(560, measured))
  const R = Math.min(W / 2 - 50, 150)
  const H = Math.round(2 * R + 74)
  const cx = W / 2
  const cy = H / 2
  const pillW = 86
  const pillH = 30
  const n = RING.length
  const ang = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n
  const pos = (i: number): [number, number] => [cx + R * Math.cos(ang(i)), cy + R * Math.sin(ang(i))]

  const stage = sel === 'frame' ? FRAME : RING.find((s) => s.id === sel)!
  const totalHours = RING.reduce((s, x) => s + x.hours, 0)
  const pSlip = 1 - Math.pow(1 - SLIP, MANUAL_STEPS)
  const auto = mode === 'auto'

  // arc from node i to node i+1 along the ring, trimmed so it starts/ends outside the pills
  const gap = Math.min(0.42, 54 / R)
  const arc = (i: number) => {
    const a0 = ang(i) + gap
    const a1 = ang(i + 1) - gap
    const p0 = [cx + R * Math.cos(a0), cy + R * Math.sin(a0)]
    const p1 = [cx + R * Math.cos(a1), cy + R * Math.sin(a1)]
    // arrowhead direction = tangent at a1 (clockwise)
    const tx = -Math.sin(a1)
    const ty = Math.cos(a1)
    const h = 8
    const bx = p1[0] - tx * h
    const by = p1[1] - ty * h
    const head = `M${p1[0]},${p1[1]}L${bx - ty * h * 0.55},${by + tx * h * 0.55}L${bx + ty * h * 0.55},${by - tx * h * 0.55}Z`
    return { d: `M${p0[0]},${p0[1]}A${R},${R} 0 0 1 ${p1[0]},${p1[1]}`, head, mid: ang(i) + Math.PI / n }
  }

  const colourOf = (id: StageId) => (id === 'train' ? 'var(--viz-2)' : id === 'monitor' ? 'var(--viz-4)' : id === 'frame' ? 'var(--viz-5)' : 'var(--viz-1)')

  // a plain function (not a component defined in render), so the pills keep keyboard focus across re-renders
  const pill = (s: Stage, x: number, y: number) => {
    const on = sel === s.id
    const c = colourOf(s.id)
    const badge = s.id === 'frame' ? null : auto ? 'auto' : s.hours > 0 ? `${s.hours} h` : s.id === 'monitor' ? 'ad hoc' : 'by eye'
    return (
      <g
        key={s.id}
        role="button"
        tabIndex={0}
        aria-pressed={on}
        aria-label={`${s.name}: show details`}
        style={{ cursor: 'pointer', outline: 'none' }}
        onClick={() => setSel(s.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setSel(s.id)
          }
        }}
      >
        <rect
          x={x - pillW / 2}
          y={y - pillH / 2}
          width={pillW}
          height={pillH}
          rx={pillH / 2}
          style={{
            fill: on ? `color-mix(in srgb, ${c} 26%, var(--surface))` : `color-mix(in srgb, ${c} 9%, var(--surface))`,
            stroke: c,
            strokeWidth: on ? 3 : 1.5,
          }}
        />
        <text x={x} y={y} dy="0.35em" textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 13, fontWeight: 750 }}>
          {s.short}
        </text>
        {badge && (
          <g>
            <rect
              x={x - 28}
              y={y + pillH / 2 - 3}
              width={56}
              height={17}
              rx={8}
              style={{ fill: auto ? 'var(--ok-soft)' : 'var(--warn-soft)', stroke: auto ? 'var(--ok)' : 'var(--warn)', strokeWidth: 1 }}
            />
            <text x={x} y={y + pillH / 2 + 5} dy="0.35em" textAnchor="middle" style={{ fill: auto ? 'var(--ok)' : 'var(--warn)', fontSize: 11.5, fontWeight: 750 }}>
              {badge}
            </text>
          </g>
        )}
      </g>
    )
  }

  return (
    <Figure
      wide
      title="The ML lifecycle is a loop"
      caption={
        <>
          Click any stage to see what goes in, what comes out, the usual tools and what typically goes wrong. Then switch from <b>manual</b> to <b>automated pipeline</b>. The hours are the
          daily-retrain process from a 2026 NOAI question; the slip risk assumes each hand-run step has a 2% chance of a mistake. Notice how small the orange <b>Train</b> stage is: a quarter of
          the hands-on time, one stop out of six.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="Six lifecycle stages on a ring (data, features, train, evaluate, deploy, monitor) with 'frame the problem' in the centre">
          <circle cx={cx} cy={cy} r={R} style={{ fill: 'none', stroke: 'var(--viz-grid)', strokeWidth: 10 }} />
          {auto && <circle cx={cx} cy={cy} r={R - 26} style={{ fill: 'none', stroke: 'var(--ok)', strokeWidth: 1.5, strokeDasharray: '5 5' }} />}
          {RING.map((_, i) => {
            const a = arc(i)
            const back = i === n - 1
            const c = back ? 'var(--viz-4)' : 'var(--viz-axis)'
            return (
              <g key={i}>
                <path d={a.d} style={{ fill: 'none', stroke: c, strokeWidth: back ? 2.5 : 1.8, strokeDasharray: back ? '6 4' : undefined }} />
                <path d={a.head} style={{ fill: c }} />
                {back && (
                  <text
                    x={cx + (R + 16) * Math.cos(a.mid)}
                    y={cy + (R + 16) * Math.sin(a.mid)}
                    dy="0.35em"
                    textAnchor="end"
                    className="plot-label"
                    style={{ fill: 'var(--viz-4)', fontSize: 12, fontWeight: 750 }}
                  >
                    retrain
                  </text>
                )}
              </g>
            )
          })}
          {/* frame → data */}
          <line x1={cx} y1={cy - pillH / 2 - 2} x2={cx} y2={cy - R + pillH / 2 + 22} style={{ stroke: 'var(--viz-5)', strokeWidth: 1.8 }} />
          <path d={`M${cx},${cy - R + pillH / 2 + 15}l-5,9l10,0Z`} style={{ fill: 'var(--viz-5)' }} />
          {auto && (
            <text x={cx} y={cy + 34} textAnchor="middle" style={{ fill: 'var(--ok)', fontSize: 11.5, fontWeight: 700 }}>
              orchestrator runs
            </text>
          )}
          {auto && (
            <text x={cx} y={cy + 49} textAnchor="middle" style={{ fill: 'var(--ok)', fontSize: 11.5, fontWeight: 700 }}>
              the loop on a schedule
            </text>
          )}
          {pill(FRAME, cx, cy)}
          {RING.map((s, i) => {
            const [x, y] = pos(i)
            return pill(s, x, y)
          })}
        </svg>
      </div>

      <div
        style={{
          width: '100%',
          border: `1.5px solid ${colourOf(stage.id)}`,
          borderRadius: 12,
          padding: '0.6rem 0.8rem',
          background: `color-mix(in srgb, ${colourOf(stage.id)} 6%, var(--surface))`,
          fontSize: 14,
          lineHeight: 1.45,
          display: 'grid',
          gap: 4,
        }}
        aria-live="polite"
      >
        <div style={{ fontWeight: 800, color: 'var(--ink)' }}>{stage.name}</div>
        <div>
          <b style={{ color: 'var(--ink-2)' }}>In:</b> {stage.input}
        </div>
        <div>
          <b style={{ color: 'var(--ink-2)' }}>Out:</b> {stage.output}
        </div>
        <div>
          <b style={{ color: 'var(--ink-2)' }}>Tools:</b> {stage.tools}
        </div>
        <div>
          <b style={{ color: 'var(--bad)' }}>Goes wrong:</b> {stage.fails}
        </div>
      </div>

      <div style={{ width: '100%', display: 'grid', gap: 4 }}>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 650 }}>Hands-on time for one manual retrain ({totalHours} h)</div>
        <div style={{ display: 'flex', width: '100%', height: 38, borderRadius: 7, overflow: 'hidden', border: '1px solid var(--rule)' }} role="img" aria-label="Data 1.5 h, features 2 h, train 1.5 h, deploy 1 h">
          {RING.filter((s) => s.hours > 0).map((s) => (
            <div
              key={s.id}
              onClick={() => setSel(s.id)}
              style={{
                width: `${(s.hours / totalHours) * 100}%`,
                background: `color-mix(in srgb, ${colourOf(s.id)} ${s.id === 'train' ? 55 : 22}%, var(--surface))`,
                borderRight: '1px solid var(--surface)',
                display: 'grid',
                placeContent: 'center',
                textAlign: 'center',
                fontSize: 11.5,
                lineHeight: 1.15,
                fontWeight: 700,
                color: 'var(--ink)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              <span>{s.short}</span>
              <span style={{ fontWeight: 600, color: 'var(--ink-2)' }}>{s.hours} h</span>
            </div>
          ))}
        </div>
      </div>

      <Controls>
        <Segmented
          label="How the loop is run"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'manual', label: 'manual' },
            { value: 'auto', label: 'automated pipeline' },
          ]}
        />
      </Controls>
      <Readout
        items={
          auto
            ? [
                ['hands-on per retrain', '≈ 0 h (check alerts)'],
                ['per month (30 retrains)', '≈ 0 h'],
                ['slips in repeated steps', 'none: same tested code'],
              ]
            : [
                ['hands-on per retrain', `${totalHours} h`],
                ['per month (30 retrains)', `${totalHours * RUNS_PER_MONTH} h`],
                ['P(a slip in one run)', `1 − 0.98⁵ ≈ ${(pSlip * 100).toFixed(1)}%`],
                ['runs with a slip / month', `≈ ${(pSlip * RUNS_PER_MONTH).toFixed(1)}`],
              ]
        }
      />
    </Figure>
  )
}
