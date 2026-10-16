import { useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Segmented, Slider, Plot, usePlot, usePlayer, PlayerControls, M, useNarrow } from '../../../../../kit'

/*
  A probability tree that builds itself one level at a time. Edges carry probabilities; each leaf's
  probability is the product along its path; an event is a set of leaves whose probabilities add.
  Scenarios: coin flips (2 or 3 flips, adjustable P(heads)) and two sweets from a bag of 3 red and
  2 green, eaten (second branch depends on the first) or put back (independent).
  All arithmetic is done with exact fractions.
*/

type Q = [number, number]
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a))
const red = ([n, d]: Q): Q => {
  const g = gcd(n, d) || 1
  return [n / g, d / g]
}
const mul = (a: Q, b: Q): Q => red([a[0] * b[0], a[1] * b[1]])
const add = (a: Q, b: Q): Q => red([a[0] * b[1] + b[0] * a[1], a[1] * b[1]])
const one: Q = [1, 1]
const zero: Q = [0, 1]
const sub1 = (a: Q): Q => red([a[1] - a[0], a[1]])

type Scenario = 'coins' | 'sweets'
type Branch = { sym: string; p: Q; edge: string }

interface Leaf {
  path: string[]
  probs: Q[]
  edges: string[]
  p: Q
}

function decimal(q: Q) {
  const v = q[0] / q[1]
  return String(Math.round(v * 10000) / 10000)
}

export default function ProbabilityTree() {
  const [scenario, setScenario] = useState<Scenario>('coins')
  const [flips, setFlips] = useState<2 | 3>(3)
  const [k, setK] = useState(5) // P(heads) = k / 10
  const [putBack, setPutBack] = useState(false)
  const [eventKey, setEventKey] = useState('atLeast')
  const [ref, narrow] = useNarrow<HTMLDivElement>()

  const L = scenario === 'coins' ? flips : 2
  const fair = scenario === 'coins' && k === 5
  const useFractions = scenario === 'sweets' || fair
  const show = (q: Q) => (useFractions ? (q[0] === 0 ? '0' : q[0] === q[1] ? '1' : `${q[0]}/${q[1]}`) : decimal(q))

  const branches = (path: string[]): Branch[] => {
    if (scenario === 'coins') {
      const ph: Q = red([k, 10])
      const pt: Q = red([10 - k, 10])
      return [
        { sym: 'H', p: ph, edge: show(ph) },
        { sym: 'T', p: pt, edge: show(pt) },
      ]
    }
    // sweets: 3 red, 2 green
    let r = 3
    let g = 2
    if (!putBack) for (const s of path) s === 'R' ? r-- : g--
    const n = r + g
    return [
      { sym: 'R', p: red([r, n]), edge: `${r}/${n}` },
      { sym: 'G', p: red([g, n]), edge: `${g}/${n}` },
    ]
  }

  const leaves = useMemo(() => {
    const out: Leaf[] = []
    const walk = (path: string[], probs: Q[], edges: string[]) => {
      if (path.length === L) {
        out.push({ path, probs, edges, p: probs.reduce(mul, one) })
        return
      }
      for (const b of branches(path)) walk([...path, b.sym], [...probs, b.p], [...edges, b.edge])
    }
    walk([], [], [])
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario, flips, k, putBack])

  const events: Record<string, { label: string; test: (p: string[]) => boolean; complement?: (p: string[]) => boolean; none?: string }> =
    scenario === 'coins'
      ? {
          atLeast: { label: 'at least one H', test: (p) => p.includes('H'), complement: (p) => !p.includes('H'), none: 'no heads' },
          exactly: { label: 'exactly one H', test: (p) => p.filter((s) => s === 'H').length === 1 },
          all: { label: 'all H', test: (p) => p.every((s) => s === 'H') },
          noneH: { label: 'no H', test: (p) => !p.includes('H') },
        }
      : {
          atLeast: { label: 'at least one green', test: (p) => p.includes('G'), complement: (p) => !p.includes('G'), none: 'no green' },
          exactly: { label: 'one of each', test: (p) => p.includes('G') && p.includes('R') },
          all: { label: 'both green', test: (p) => p.every((s) => s === 'G') },
          noneH: { label: 'same colour', test: (p) => p[0] === p[1] },
        }
  const ev = events[eventKey] ?? events.atLeast
  const hit = leaves.filter((l) => ev.test(l.path))
  const total = hit.reduce((s, l) => add(s, l.p), zero)

  const steps = L + 3
  const player = usePlayer({ steps, interval: 1300 })
  // start complete (whole tree built, event highlighted); Restart walks through the build
  useEffect(() => {
    player.setStep(steps - 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps])
  const step = player.step
  const level = Math.min(step, L) // how many levels of branches are visible
  const showLeafProbs = step >= L + 1
  const showEvent = step >= L + 2

  const stepText = (s: number) => {
    if (s === 0) return 'Start at the root'
    if (s <= L) return scenario === 'coins' ? `Flip ${s}: branch on H or T` : `Sweet ${s}: branch on red or green`
    if (s === L + 1) return 'Multiply along each path'
    return 'Add the paths in the event'
  }

  const symColor = (s: string) => (s === 'H' ? 'var(--viz-1)' : s === 'T' ? 'var(--viz-2)' : s === 'R' ? 'var(--viz-neg)' : 'var(--viz-pos)')
  const labelUnits = narrow ? 1.5 : L === 3 ? 2.35 : 2.0
  const nLeaves = leaves.length

  let sumTex = ''
  if (showEvent) {
    const parts = hit.map((l) => show(l.p))
    if (narrow && parts.length > 1) {
      // break a long sum into rows of three terms so it fits a phone
      const rows: string[] = []
      for (let i = 0; i < parts.length; i += 3) rows.push(parts.slice(i, i + 3).join(' + '))
      sumTex = `\\begin{aligned}P(\\text{${ev.label}}) &= ${rows.join(' \\\\ &\\quad + ')} \\\\ &= ${show(total)}\\end{aligned}`
    } else sumTex = `P(\\text{${ev.label}}) = ${parts.length ? parts.join(' + ') : '0'} = ${show(total)}`
    if (ev.complement) {
      const none = leaves.filter((l) => ev.complement!(l.path)).reduce((s, l) => add(s, l.p), zero)
      const comp = `1 - P(\\text{${ev.none}}) = 1 - ${show(none)} = ${show(sub1(none))}`
      sumTex = narrow ? `\\begin{gathered}${sumTex} \\\\[4pt] \\text{or} \\quad ${comp}\\end{gathered}` : `${sumTex}\\quad\\text{or}\\quad ${comp}`
    }
  }

  return (
    <Figure
      title="Probability trees: multiply along, add across"
      caption={
        <>
          The tree starts complete. Press <b>Restart</b> and then <b>Play</b> (or <b>Next</b>) to watch it grow one level at a time. Each leaf's probability is the
          product of the probabilities along its path, and the leaves always add up to 1. Pick an event to highlight its leaves and add them. For "at least
          one", compare the long sum with the one-line complement trick. In the sweets bag, eating the first sweet changes the second set of branches; putting it
          back makes the draws independent.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%' }}>
        <Plot
          x={[-0.15, L + labelUnits]}
          y={[0, nLeaves]}
          width={600}
          height={L === 3 ? 330 : 240}
          minHeight={L === 3 ? 290 : 210}
          margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
          ariaLabel={`Probability tree with ${nLeaves} leaves; ${ev.label} has probability ${show(total)}`}
        >
          <Tree leaves={leaves} L={L} level={level} showLeafProbs={showLeafProbs} showEvent={showEvent} inEvent={(l) => ev.test(l.path)} symColor={symColor} show={show} narrow={narrow} />
        </Plot>
      </div>
      <div style={{ minHeight: '2.4em', textAlign: 'center', fontSize: narrow ? '0.88rem' : '1rem', width: '100%', overflowX: 'auto' }}>
        {showEvent ? <M>{sumTex}</M> : <span style={{ color: 'var(--ink-3)' }}>{showLeafProbs ? 'Every leaf: multiply the probabilities along its path.' : 'Building the tree…'}</span>}
      </div>
      <PlayerControls player={player} label={(s) => `${s + 1}/${steps}: ${stepText(s)}`} />
      <Controls>
        <Segmented
          label="Scenario"
          value={scenario}
          onChange={(v) => {
            setScenario(v)
            player.setStep(v === 'coins' ? flips + 2 : 4)
          }}
          options={[
            { value: 'coins', label: 'coin flips' },
            { value: 'sweets', label: 'sweets from a bag' },
          ]}
        />
        <Segmented label="Event" value={eventKey} onChange={setEventKey} options={Object.entries(events).map(([value, e]) => ({ value, label: e.label }))} />
      </Controls>
      <Controls>
        {scenario === 'coins' ? (
          <>
            <Segmented
              label="Flips"
              value={flips}
              onChange={setFlips}
              options={[
                { value: 2, label: '2' },
                { value: 3, label: '3' },
              ]}
            />
            <Slider label="P(heads)" value={k / 10} min={0.1} max={0.9} step={0.1} onChange={(v) => setK(Math.round(v * 10))} format={(v) => (Math.round(v * 10) === 5 ? '0.5 (fair)' : v.toFixed(1))} />
          </>
        ) : (
          <Segmented
            label="Bag: 3 red, 2 green. After the first draw, the sweet is"
            value={putBack ? 'back' : 'eaten'}
            onChange={(v) => setPutBack(v === 'back')}
            options={[
              { value: 'eaten', label: 'eaten (not replaced)' },
              { value: 'back', label: 'put back' },
            ]}
          />
        )}
      </Controls>
    </Figure>
  )
}

function Tree({
  leaves,
  L,
  level,
  showLeafProbs,
  showEvent,
  inEvent,
  symColor,
  show,
  narrow,
}: {
  leaves: Leaf[]
  L: number
  level: number
  showLeafProbs: boolean
  showEvent: boolean
  inEvent: (l: Leaf) => boolean
  symColor: (s: string) => string
  show: (q: Q) => string
  narrow: boolean
}) {
  const { xs, ys } = usePlot()
  const n = leaves.length
  // y of the node reached by a path prefix = mean of the y of the leaves below it
  const yOf = (prefix: string[]) => {
    const idx = leaves.map((l, i) => (prefix.every((s, j) => l.path[j] === s) ? i : -1)).filter((i) => i >= 0)
    const mean = idx.reduce((s, i) => s + i, 0) / idx.length
    return n - mean - 0.5
  }
  // collect each edge once
  const edges: { from: string[]; to: string[]; label: string; sym: string; hot: boolean }[] = []
  const seen = new Set<string>()
  leaves.forEach((l) => {
    for (let d = 0; d < L; d++) {
      const to = l.path.slice(0, d + 1)
      const id = to.join('')
      if (seen.has(id)) {
        if (inEvent(l)) edges.find((e) => e.to.join('') === id)!.hot = true
        continue
      }
      seen.add(id)
      edges.push({ from: l.path.slice(0, d), to, label: l.edges[d], sym: l.path[d], hot: inEvent(l) })
    }
  })
  // highlight colour: purple is not used by any H/T/R/G node, so "in the event" never looks like "green sweet"
  const hotColor = 'var(--viz-5)'
  return (
    <g>
      {edges
        .filter((e) => e.to.length <= level)
        .map((e) => {
          const x1 = xs(e.from.length)
          const y1 = ys(yOf(e.from))
          const x2 = xs(e.to.length)
          const y2 = ys(yOf(e.to))
          const hot = showEvent && e.hot
          const faded = showEvent && !e.hot
          const mx = (x1 + x2) / 2
          const my = (y1 + y2) / 2
          return (
            <g key={e.to.join('')} style={{ opacity: faded ? 0.4 : 1 }}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: hot ? hotColor : 'var(--viz-axis)', strokeWidth: hot ? 3 : 1.6 }} />
              <text x={mx} y={my + (y2 < y1 ? -6 : 14)} textAnchor="middle" className="plot-label" style={{ fontSize: 12, fill: 'var(--ink-2)' }}>
                {e.label}
              </text>
            </g>
          )
        })}
      <circle cx={xs(0)} cy={ys(yOf([]))} r={5} style={{ fill: 'var(--viz-ink)' }} />
      {edges
        .filter((e) => e.to.length <= level)
        .map((e) => (
          <g key={'n' + e.to.join('')} style={{ opacity: showEvent && !e.hot ? 0.45 : 1 }}>
            <circle cx={xs(e.to.length)} cy={ys(yOf(e.to))} r={11} style={{ fill: symColor(e.sym), stroke: 'var(--surface)', strokeWidth: 2 }} />
            <text x={xs(e.to.length)} y={ys(yOf(e.to)) + 4.5} textAnchor="middle" style={{ fill: 'var(--surface)', fontSize: 12, fontWeight: 800 }}>
              {e.sym}
            </text>
          </g>
        ))}
      {showLeafProbs &&
        leaves.map((l, i) => {
          const hot = showEvent && inEvent(l)
          const yc = ys(n - i - 0.5)
          const fill = hot ? hotColor : showEvent ? 'var(--ink-3)' : 'var(--viz-ink)'
          if (narrow) {
            // phones: two short lines, so the "multiply along the path" product still shows
            return (
              <g key={i}>
                <text x={xs(L) + 16} y={yc - 1} className="plot-label" style={{ fontSize: 12, fill, fontWeight: hot ? 800 : 650 }}>
                  {`${l.path.join('')} = ${show(l.p)}`}
                </text>
                <text x={xs(L) + 16} y={yc + 11} className="plot-label" style={{ fontSize: 10.5, fill: hot ? hotColor : 'var(--ink-3)', fontWeight: 500 }}>
                  {l.edges.join('·')}
                </text>
              </g>
            )
          }
          return (
            <text key={i} x={xs(L) + 18} y={yc + 4.5} className="plot-label" style={{ fontSize: 12.5, fill, fontWeight: hot ? 800 : 600 }}>
              {`${l.path.join('')}:  ${l.edges.join(' × ')} = ${show(l.p)}`}
            </text>
          )
        })}
    </g>
  )
}
