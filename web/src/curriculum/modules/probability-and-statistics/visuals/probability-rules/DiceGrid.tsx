import { useState } from 'react'
import { Figure, Controls, Readout, Segmented, Plot, usePlot, M } from '../../../../../kit'

/*
  The 36 equally likely outcomes of rolling two dice, as a 6 x 6 table (rows = first die,
  columns = second die). Pick a preset event or click cells to build your own; the count of
  highlighted cells over 36 is the probability. With `given`, a second control shrinks the
  table to the outcomes we know happened, and the probability is recounted inside it.
*/

type Pair = [number, number]
const EVENTS = {
  seven: { label: 'sum is 7', test: ([a, b]: Pair) => a + b === 7 },
  doubles: { label: 'doubles', test: ([a, b]: Pair) => a === b },
  six: { label: 'at least one 6', test: ([a, b]: Pair) => a === 6 || b === 6 },
  big: { label: 'sum ≥ 10', test: ([a, b]: Pair) => a + b >= 10 },
} as const
type EventKey = keyof typeof EVENTS | 'custom'

const GIVENS = {
  none: { label: 'nothing', test: () => true },
  first6: { label: 'first die is 6', test: ([a]: Pair) => a === 6 },
  big: { label: 'sum ≥ 10', test: ([a, b]: Pair) => a + b >= 10 },
} as const
type GivenKey = keyof typeof GIVENS

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
const frac = (n: number, d: number) => {
  if (n === 0) return '0'
  const g = gcd(n, d)
  return n / g === d / g ? '1' : `\\tfrac{${n / g}}{${d / g}}`
}
const key = (a: number, b: number) => `${a}${b}`
const ALL: Pair[] = []
for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) ALL.push([a, b])

function Table({ inEvent, inGiven, onToggle, show }: { inEvent: (p: Pair) => boolean; inGiven: (p: Pair) => boolean; onToggle: (p: Pair) => void; show: 'sum' | 'pair' }) {
  const { xs, ys } = usePlot()
  const cell = xs(1) - xs(0)
  const cellH = ys(0) - ys(1)
  return (
    <g>
      {/* headers */}
      {[1, 2, 3, 4, 5, 6].map((v) => (
        <g key={v}>
          <text x={xs(v + 0.5)} y={ys(6.5) + 5} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 13, fontWeight: 700 }}>
            {v}
          </text>
          <text x={xs(0.5)} y={ys(6 - v + 0.5) + 5} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 13, fontWeight: 700 }}>
            {v}
          </text>
        </g>
      ))}
      <text x={xs(4)} y={ys(7.2) + 4} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 12 }}>
        second die →
      </text>
      <text x={xs(0.5)} y={ys(7.2) + 4} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 12 }}>
        first ↓
      </text>
      {ALL.map(([a, b]) => {
        const x = xs(b)
        const y = ys(6 - a + 1)
        const g = inGiven([a, b])
        const e = inEvent([a, b])
        const fill = !g ? 'var(--surface-2)' : e ? 'color-mix(in srgb, var(--viz-1) 70%, var(--surface))' : 'var(--surface)'
        return (
          <g
            key={key(a, b)}
            role="button"
            tabIndex={0}
            aria-pressed={e}
            aria-label={`first die ${a}, second die ${b}${e ? ', in the event' : ''}`}
            style={{ cursor: 'pointer', opacity: g ? 1 : 0.35 }}
            onClick={() => onToggle([a, b])}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault()
                onToggle([a, b])
              }
            }}
          >
            <rect x={x + 2} y={y + 2} width={cell - 4} height={cellH - 4} rx={6} style={{ fill, stroke: g ? 'var(--viz-axis)' : 'var(--rule)', strokeWidth: 1.25 }} />
            <text x={x + cell / 2} y={y + cellH / 2 + 4.5} textAnchor="middle" style={{ fill: e && g ? 'var(--surface)' : 'var(--ink)', fontSize: show === 'pair' ? 12 : 14, fontWeight: 650, fontVariantNumeric: 'tabular-nums', pointerEvents: 'none' }}>
              {show === 'pair' ? `${a},${b}` : a + b}
            </text>
          </g>
        )
      })}
    </g>
  )
}

export default function DiceGrid({ given: withGiven = false }: { given?: boolean }) {
  const [ev, setEv] = useState<EventKey>(withGiven ? 'doubles' : 'seven')
  const [custom, setCustom] = useState<Set<string>>(new Set())
  const [given, setGiven] = useState<GivenKey>(withGiven ? 'big' : 'none')
  const [show, setShow] = useState<'sum' | 'pair'>('sum')

  const inEvent = (p: Pair) => (ev === 'custom' ? custom.has(key(...p)) : EVENTS[ev].test(p))
  const inGiven = (p: Pair) => GIVENS[given].test(p)
  const world = ALL.filter(inGiven)
  const hits = world.filter(inEvent)
  const toggle = (p: Pair) => {
    const base = ev === 'custom' ? new Set(custom) : new Set(ALL.filter((q) => EVENTS[ev as keyof typeof EVENTS].test(q)).map((q) => key(...q)))
    const k = key(...p)
    if (base.has(k)) base.delete(k)
    else base.add(k)
    setCustom(base)
    setEv('custom')
  }
  const evLabel = ev === 'custom' ? 'your event' : EVENTS[ev].label
  const ratio = (n: number, d: number) => {
    const simple = frac(n, d)
    return simple === `\\tfrac{${n}}{${d}}` ? simple : `\\tfrac{${n}}{${d}} = ${simple}`
  }
  const tex =
    given === 'none'
      ? `P(\\text{${evLabel}}) = ${ratio(hits.length, 36)}`
      : `P(\\text{${evLabel}} \\mid \\text{${GIVENS[given].label}}) = ${ratio(hits.length, world.length)}`

  return (
    <Figure
      title={withGiven ? 'Knowing something shrinks the table' : 'Two dice: 36 equally likely outcomes'}
      caption={
        withGiven ? (
          <>
            Pick what you are told under <b>Given</b>. The greyed-out cells did not happen, so they leave the count: the new denominator is the number of cells
            still in play. Try event <b>doubles</b> given <b>sum ≥ 10</b>, then given <b>nothing</b>. The same event has a different probability once you know
            more.
          </>
        ) : (
          <>
            Each cell is one outcome: the row is the first die and the column is the second, and each cell shows the total. Pick an event, or click cells to
            build your own. The probability is just <i>highlighted cells ÷ 36</i>. Notice that 7 is the most likely total: it has six cells, while 2 and 12
            have only one each.
          </>
        )
      }
    >
      <Plot x={[0, 7]} y={[0, 7.45]} width={340} height={357} maxWidth={380} margin={{ left: 6, right: 6, top: 4, bottom: 4 }} ariaLabel={`Six by six table of two-dice outcomes; ${hits.length} of ${world.length} cells are in the event`}>
        <Table inEvent={inEvent} inGiven={inGiven} onToggle={toggle} show={show} />
      </Plot>
      <div style={{ fontSize: '1.05rem' }}>
        <M>{tex}</M>
      </div>
      <Controls>
        <Segmented
          label="Event"
          value={ev}
          onChange={setEv}
          options={[...(Object.keys(EVENTS) as (keyof typeof EVENTS)[]).map((k) => ({ value: k as EventKey, label: EVENTS[k].label })), ...(ev === 'custom' ? [{ value: 'custom' as EventKey, label: 'yours' }] : [])]}
        />
        {withGiven && <Segmented label="Given" value={given} onChange={setGiven} options={(Object.keys(GIVENS) as GivenKey[]).map((k) => ({ value: k, label: GIVENS[k].label }))} />}
        <Segmented
          label="Cells show"
          value={show}
          onChange={setShow}
          options={[
            { value: 'sum', label: 'total' },
            { value: 'pair', label: 'both dice' },
          ]}
        />
      </Controls>
      <Readout
        items={[
          [given === 'none' ? 'outcomes' : 'outcomes still possible', String(world.length)],
          ['in the event', String(hits.length)],
          ...(given === 'none' ? ([['not in the event', `${36 - hits.length}  (complement: 1 − ${hits.length}/36)`]] as [string, string][]) : []),
        ]}
      />
    </Figure>
  )
}
