import { useState } from 'react'
import { Figure, Segmented, Slider, Toggle, Controls, Readout, useContainerWidth } from '../../../../../kit'
import { frac } from '../drill-linear-algebra/drillKit'
import d from '../drill-linear-algebra/drill.module.css'

/*
  Two pictures that replace probability formulas with counting.
  Dice: all 36 outcomes of two dice; pick an event and see its cells (or its complement).
  Bayes: 100 people; set how common the condition is and how good the test is, then count the
  positive tests that are real.
*/

type View = 'dice' | 'bayes'
type DiceEvent = 'sumEq' | 'sumGe' | 'six' | 'doubles'

export default function QuickProbability() {
  const [view, setView] = useState<View>('bayes')
  return (
    <Figure
      title="Probability by counting: dice and a 100-person grid"
      caption={
        view === 'dice' ? (
          <>
            Every cell is one equally likely outcome of two dice (first die down the side, second along the top). Pick an event and count its cells out of 36. Switch on{' '}
            <strong>complement</strong> for “at least one” questions: counting what does <em>not</em> happen is often quicker.
          </>
        ) : (
          <>
            Each dot is a person. Change how common the condition is and how good the test is, then look only at the people who test positive (filled dots): what fraction of them
            are really ill? With a rare condition, most positives are false alarms even for a good test.
          </>
        )
      }
    >
      <div className={d.wrap}>
        <Segmented
          label="Picture"
          value={view}
          onChange={setView}
          options={[
            { value: 'bayes', label: 'Bayes in 100 people' },
            { value: 'dice', label: 'Two dice' },
          ]}
        />
        {view === 'dice' ? <Dice /> : <Bayes />}
      </div>
    </Figure>
  )
}

function Dice() {
  const [ev, setEv] = useState<DiceEvent>('sumEq')
  const [k, setK] = useState(7)
  const [comp, setComp] = useState(false)
  const hit = (a: number, b: number) => (ev === 'sumEq' ? a + b === k : ev === 'sumGe' ? a + b >= k : ev === 'six' ? a === 6 || b === 6 : a === b)
  let n = 0
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (hit(a, b)) n++
  const shown = comp ? 36 - n : n
  const name = ev === 'sumEq' ? `sum = ${k}` : ev === 'sumGe' ? `sum ≥ ${k}` : ev === 'six' ? 'at least one 6' : 'a double'
  const cell = 36
  const pad = 26
  const W = pad + 6 * cell + 4
  const colour = comp ? 'var(--viz-2)' : 'var(--viz-1)'
  return (
    <>
      <div className={d.row}>
        <Segmented
          label="Event"
          value={ev}
          onChange={setEv}
          options={[
            { value: 'sumEq', label: 'sum = k' },
            { value: 'sumGe', label: 'sum ≥ k' },
            { value: 'six', label: 'a 6' },
            { value: 'doubles', label: 'double' },
          ]}
        />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem 1.2rem', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox={`0 0 ${W} ${W}`} width={W} height={W} style={{ maxWidth: '100%' }} role="img" aria-label={`Two-dice grid: ${shown} of 36 cells highlighted.`}>
          {[1, 2, 3, 4, 5, 6].map((v) => (
            <g key={v}>
              <text x={pad + (v - 0.5) * cell} y={16} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 12, fontWeight: 700 }}>
                {v}
              </text>
              <text x={12} y={pad + (v - 0.5) * cell + 4} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 12, fontWeight: 700 }}>
                {v}
              </text>
            </g>
          ))}
          {Array.from({ length: 36 }, (_, i) => {
            const a = Math.floor(i / 6) + 1
            const b = (i % 6) + 1
            const on = hit(a, b) !== comp
            return (
              <g key={i}>
                <rect
                  x={pad + (b - 1) * cell + 1.5}
                  y={pad + (a - 1) * cell + 1.5}
                  width={cell - 3}
                  height={cell - 3}
                  rx={5}
                  style={{ fill: on ? `color-mix(in srgb, ${colour} 70%, var(--surface))` : 'var(--surface)', stroke: on ? colour : 'var(--rule)', strokeWidth: 1.5 }}
                />
                <text x={pad + (b - 0.5) * cell} y={pad + (a - 0.5) * cell + 4.5} textAnchor="middle" style={{ fill: on ? 'var(--ink)' : 'var(--ink-3)', fontSize: 12.5, fontWeight: on ? 800 : 500 }}>
                  {a + b}
                </text>
              </g>
            )
          })}
        </svg>
        <div style={{ display: 'grid', gap: '0.4rem', minWidth: 0, maxWidth: '16rem' }}>
          <div className={d.prompt} style={{ textAlign: 'left' }}>
            P({comp ? `not ${name}` : name}) = {shown}/36 {frac(shown, 36) !== `${shown}/36` ? `= ${frac(shown, 36)}` : ''}
          </div>
          {comp && (
            <div className={d.small}>
              So P({name}) = 1 − {frac(shown, 36)} = {frac(n, 36)}.
            </div>
          )}
          {ev === 'six' && !comp && <div className={d.small}>Faster: no 6 on either die is 5 × 5 = 25 cells, so 1 − 25/36 = 11/36. Try the complement switch.</div>}
          {ev === 'sumEq' && k === 7 && <div className={d.small}>7 is the most likely sum: one cell on every row.</div>}
        </div>
      </div>
      <Controls>
        {(ev === 'sumEq' || ev === 'sumGe') && <Slider label="k" value={k} min={2} max={12} step={1} onChange={setK} />}
        <Toggle label="Show the complement" checked={comp} onChange={setComp} />
      </Controls>
    </>
  )
}

function Bayes() {
  const [prev, setPrev] = useState(10)
  const [sens, setSens] = useState(90)
  const [fpr, setFpr] = useState(10)
  const [ref, w] = useContainerWidth<HTMLDivElement>(360)
  const sick = Math.round(prev)
  const TP = Math.round((sick * sens) / 100)
  const FN = sick - TP
  const healthy = 100 - sick
  const FP = Math.round((healthy * fpr) / 100)
  const TN = healthy - FP
  const exact = (prev * sens) / (prev * sens + (100 - prev) * fpr)
  const grid = TP + FP > 0 ? TP / (TP + FP) : 0
  // people in order: TP, FN, FP, TN
  const kinds: ('TP' | 'FN' | 'FP' | 'TN')[] = [...Array(TP).fill('TP'), ...Array(FN).fill('FN'), ...Array(FP).fill('FP'), ...Array(TN).fill('TN')]
  const size = Math.min(300, Math.max(220, w))
  const step = size / 10
  const r = step * 0.36
  const style = (k: string) => {
    if (k === 'TP') return { fill: 'var(--viz-neg)', stroke: 'var(--viz-neg)', strokeWidth: 2 }
    if (k === 'FN') return { fill: 'var(--surface)', stroke: 'var(--viz-neg)', strokeWidth: 2.2 }
    if (k === 'FP') return { fill: 'var(--viz-2)', stroke: 'var(--viz-2)', strokeWidth: 2 }
    return { fill: 'var(--surface)', stroke: 'var(--viz-muted)', strokeWidth: 1.2 }
  }
  return (
    <>
      <div ref={ref} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem 1.2rem', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ maxWidth: '100%' }} role="img" aria-label={`100 people: ${TP} true positives, ${FP} false positives, ${FN} missed, ${TN} true negatives.`}>
          {kinds.map((k, i) => (
            <circle key={i} cx={(i % 10) * step + step / 2} cy={Math.floor(i / 10) * step + step / 2} r={k === 'TN' ? r * 0.75 : r} style={style(k)} />
          ))}
        </svg>
        <div style={{ display: 'grid', gap: '0.45rem', minWidth: 0, maxWidth: '17rem' }}>
          <div className={d.small}>
            <Legend colour="var(--viz-neg)" filled /> ill, test positive (TP) <strong className="tabular">{TP}</strong>
            <br />
            <Legend colour="var(--viz-neg)" /> ill, test negative (FN) <strong className="tabular">{FN}</strong>
            <br />
            <Legend colour="var(--viz-2)" filled /> healthy, test positive (FP) <strong className="tabular">{FP}</strong>
            <br />
            <Legend colour="var(--viz-muted)" /> healthy, test negative (TN) <strong className="tabular">{TN}</strong>
          </div>
          <div className={d.prompt} style={{ textAlign: 'left' }}>
            P(ill | positive) = {TP}/{TP + FP} {TP + FP > 0 ? `≈ ${Math.round(grid * 100)}%` : ''}
          </div>
          <div className={d.small}>
            Out of {TP + FP} positive tests, only {TP} belong to people who are ill.{' '}
            {Math.abs(exact - grid) > 0.005 && <>The exact value (without rounding people) is {Math.round(exact * 100)}%.</>}
          </div>
        </div>
      </div>
      <Controls>
        <Slider label="how common (prevalence)" value={prev} min={1} max={30} step={1} onChange={setPrev} format={(v) => `${v}%`} />
        <Slider label="test catches the ill (sensitivity)" value={sens} min={50} max={100} step={5} onChange={setSens} format={(v) => `${v}%`} />
        <Slider label="false alarms among the healthy" value={fpr} min={0} max={30} step={1} onChange={setFpr} format={(v) => `${v}%`} />
      </Controls>
      <Readout
        items={[
          ['P(ill)', `${prev}%`],
          ['P(positive | ill)', `${sens}%`],
          ['P(ill | positive)', `${Math.round(exact * 100)}%`],
        ]}
      />
    </>
  )
}

function Legend({ colour, filled }: { colour: string; filled?: boolean }) {
  return (
    <svg width={12} height={12} viewBox="0 0 12 12" aria-hidden="true" style={{ verticalAlign: '-1px', marginRight: 4 }}>
      <circle cx={6} cy={6} r={4.5} style={{ fill: filled ? colour : 'var(--surface)', stroke: colour, strokeWidth: 2 }} />
    </svg>
  )
}
