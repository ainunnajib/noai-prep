import { useState } from 'react'
import { Figure, Controls, Readout, Slider, Toggle, Button, useNarrow } from '../../../../../kit'
import { clipPoly, boxPoly, type Pt } from '../perceptron/shared'
import { BOX, DATA, LEAK, NET0, N_HIDDEN, stats, train, type Net } from './deadSim'

/*
  Sixteen hidden neurons of a small network (2 → 16 → 1) as tiles. Each tile is the square of training
  inputs, with the 120 inputs drawn as dots (dark where the neuron is on, grey where it is off); the
  orange part is where that neuron is switched on (z > 0). A neuron whose orange part holds no dots at all
  is dead. "moved" is how far the neuron's weights travelled during the last training press:
  a dead ReLU neuron (switched on for no input at all) gets exactly zero gradient, so it never moves again.
  The "latest run" table keeps the latest result of each activation, so the two runs can be compared.
*/

const LRS = [0.01, 0.03, 0.1, 0.3, 1, 3]

interface LogItem {
  from: number
  to: number
  lr: number
  leaky: boolean
  dead: number
  loss: number
}

interface Latest {
  steps: number
  off: number
  loss: number
}

function Tile({ w, b, frac, moved, leaky, size }: { w: [number, number]; b: number; frac: number; moved: number | null; leaky: boolean; size: number }) {
  const dead = frac === 0 && !leaky
  const asleep = frac === 0 && leaky
  const s = size
  const pad = 3
  const toPx = ([x, y]: Pt): Pt => [pad + ((x + BOX) / (2 * BOX)) * (s - 2 * pad), pad + ((BOX - y) / (2 * BOX)) * (s - 2 * pad)]
  const on = clipPoly(boxPoly([-BOX, BOX], [-BOX, BOX]), w[0], w[1], b, 1)
  const d = on.length > 2 ? on.map((p, i) => `${i ? 'L' : 'M'}${toPx(p).map((v) => v.toFixed(1)).join(',')}`).join('') + 'Z' : ''
  // the training inputs as dots: one path for the inputs that switch the neuron on, one for the rest
  let dotsOn = ''
  let dotsOff = ''
  for (const x of DATA.x) {
    const [px, py] = toPx([x[0], x[1]])
    const seg = `M${px.toFixed(1)},${py.toFixed(1)}h0`
    if (w[0] * x[0] + w[1] * x[1] + b > 0) dotsOn += seg
    else dotsOff += seg
  }
  return (
    <div
      style={{
        display: 'grid',
        justifyItems: 'center',
        gap: 2,
        padding: '4px 2px 5px',
        borderRadius: 8,
        border: dead ? '1.5px dashed var(--viz-muted)' : '1.5px solid var(--rule)',
        background: dead ? 'var(--surface-3)' : 'var(--surface)',
        minWidth: 0,
      }}
    >
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden="true" style={{ display: 'block' }}>
        <rect
          x={pad}
          y={pad}
          width={s - 2 * pad}
          height={s - 2 * pad}
          rx={3}
          style={{ fill: dead ? 'var(--surface-3)' : 'var(--surface-2)', stroke: 'var(--viz-muted)', strokeWidth: 1 }}
        />
        {d && <path d={d} style={{ fill: 'color-mix(in srgb, var(--viz-2) 70%, var(--surface))' }} />}
        {dotsOff && <path d={dotsOff} style={{ fill: 'none', stroke: 'var(--viz-muted)', strokeWidth: 2, strokeLinecap: 'round' }} />}
        {dotsOn && <path d={dotsOn} style={{ fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: 2.2, strokeLinecap: 'round' }} />}
        {dead && (
          <path d={`M${s * 0.3},${s * 0.3}L${s * 0.7},${s * 0.7}M${s * 0.7},${s * 0.3}L${s * 0.3},${s * 0.7}`} style={{ stroke: 'var(--viz-muted)', strokeWidth: 2.5 }} strokeLinecap="round" />
        )}
      </svg>
      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: dead ? 'var(--viz-neg)' : 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
        {dead ? 'dead' : asleep ? 'off, alive' : `${Math.round(frac * 100)}% on`}
      </span>
      <span style={{ fontSize: '0.72rem', color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>{moved === null ? ' ' : `moved ${moved === 0 ? '0' : moved < 0.005 ? '<0.01' : moved.toFixed(2)}`}</span>
    </div>
  )
}

function distance(a: Net, b: Net, j: number) {
  return Math.hypot(a.w1[j][0] - b.w1[j][0], a.w1[j][1] - b.w1[j][1], a.b1[j] - b.b1[j], a.w2[j] - b.w2[j])
}

export default function DeadNeuronMap() {
  const data = DATA
  const net0 = NET0
  const [lrIdx, setLrIdx] = useState(2)
  const [leaky, setLeaky] = useState(false)
  const [net, setNet] = useState<Net>(net0)
  const [prev, setPrev] = useState<Net | null>(null)
  const [steps, setSteps] = useState(0)
  const [log, setLog] = useState<LogItem[]>([])
  const [latest, setLatest] = useState<{ relu: Latest | null; leaky: Latest | null }>({ relu: null, leaky: null })
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)

  const lr = LRS[lrIdx]
  const st = stats(net, data, leaky)
  const zeroCount = st.frac.filter((f) => f === 0).length

  const doTrain = (n: number) => {
    const next = train(net, data, lr, leaky, n)
    const s = stats(next, data, leaky)
    const off = s.frac.filter((f) => f === 0).length
    setPrev(net)
    setNet(next)
    setLog((old) => [...old, { from: steps + 1, to: steps + n, lr, leaky, dead: off, loss: s.loss }].slice(-4))
    setLatest((old) => ({ ...old, [leaky ? 'leaky' : 'relu']: { steps: steps + n, off, loss: s.loss } }))
    setSteps(steps + n)
  }
  const reset = () => {
    setNet(net0)
    setPrev(null)
    setSteps(0)
    setLog([])
  }

  const tileSize = narrow ? 52 : 58
  return (
    <Figure
      title="Watching ReLU neurons die"
      caption={
        <>
          A 2-16-1 network learns a wavy surface from 120 points. Each tile is one hidden neuron: the dots are the 120 training inputs, the orange part is where
          the neuron is switched on (<i>z</i> &gt; 0), and &ldquo;moved&rdquo; is how far its weights changed in the last press. A huge η shoves orange regions away
          from every dot: a neuron whose orange part holds no dots is <b>dead</b>. (Leaky ReLU&rsquo;s α is 0.1 here, ten times the usual 0.01, so its effect shows
          quickly.)
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', gridTemplateColumns: `repeat(${narrow ? 4 : 8}, minmax(0, 1fr))`, gap: narrow ? 5 : 7 }}>
        {Array.from({ length: N_HIDDEN }, (_, j) => (
          <Tile key={j} w={net.w1[j] as [number, number]} b={net.b1[j]} frac={st.frac[j]} moved={prev ? distance(prev, net, j) : null} leaky={leaky} size={tileSize} />
        ))}
      </div>
      <Readout
        items={[
          ['steps trained', String(steps)],
          [leaky ? 'off for every input' : 'dead neurons', `${zeroCount} of ${N_HIDDEN}`],
          ['training loss (MSE)', st.loss.toFixed(3)],
        ]}
      />
      <Controls>
        <Slider label="learning rate η" value={lrIdx} min={0} max={LRS.length - 1} step={1} onChange={setLrIdx} format={(i) => String(LRS[i])} />
        <Toggle
          label={`Leaky ReLU (α = ${LEAK})`}
          checked={leaky}
          onChange={(v) => {
            setLeaky(v)
            reset()
          }}
        />
      </Controls>
      <Controls>
        <Button primary onClick={() => doTrain(100)}>
          Train 100 steps
        </Button>
        <Button onClick={() => doTrain(500)}>Train 500 steps</Button>
        <Button onClick={reset}>Reset</Button>
      </Controls>
      {(latest.relu || latest.leaky) && (
        <table style={{ borderCollapse: 'collapse', fontSize: '0.84rem', fontVariantNumeric: 'tabular-nums', color: 'var(--ink)' }} aria-label="Latest result for ReLU and for Leaky ReLU">
          <thead>
            <tr style={{ color: 'var(--ink-3)' }}>
              {['latest run', 'steps', 'neurons off', 'loss'].map((h) => (
                <th key={h} style={{ padding: '2px 8px', fontWeight: 700, textAlign: h === 'latest run' ? 'left' : 'right', borderBottom: '1.5px solid var(--rule)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(['relu', 'leaky'] as const).map((k) => {
              const r = latest[k]
              return (
                <tr key={k} style={{ fontWeight: (k === 'leaky') === leaky ? 700 : 400 }}>
                  <td style={{ padding: '2px 8px' }}>{k === 'relu' ? 'ReLU' : 'Leaky ReLU'}</td>
                  <td style={{ padding: '2px 8px', textAlign: 'right' }}>{r ? r.steps.toLocaleString('en-GB') : '–'}</td>
                  <td style={{ padding: '2px 8px', textAlign: 'right' }}>{r ? `${r.off} of ${N_HIDDEN}` : '–'}</td>
                  <td style={{ padding: '2px 8px', textAlign: 'right' }}>{r ? r.loss.toFixed(3) : '–'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      {log.length > 0 && (
        <div style={{ width: '100%', fontSize: '0.84rem', color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.6 }}>
          {log.map((l, i) => (
            <div key={i}>
              steps {l.from}–{l.to}: η = {l.lr}, {l.leaky ? 'Leaky ReLU' : 'ReLU'} → {l.dead} {l.leaky ? 'off for every input' : 'dead'}, loss {l.loss.toFixed(3)}
            </div>
          ))}
        </div>
      )}
    </Figure>
  )
}
