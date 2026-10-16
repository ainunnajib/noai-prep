import { useEffect, useState, type CSSProperties } from 'react'
import { Figure, Controls, Segmented, Slider, usePlayer, PlayerControls } from '../../../../../kit'

/*
  Bayes as a learning rule, one clue at a time. Three hypotheses (where is my friend?) start with
  prior beliefs. Each clue has a likelihood under each hypothesis. Stepper phases per clue:
  (1) show the likelihoods next to the current beliefs, (2) multiply: the bars shrink and no longer
  add to 1, (3) renormalise: divide by their total to get the posterior, which becomes the next prior.
*/

const PLACES = ['Hawker centre', 'Library', 'Home'] as const
const SHORT = ['Hawker', 'Library', 'Home'] as const
const CLUES = ['They send a photo of a cup of kopi.', 'On a call, the background is very quiet.', 'They say: "Leaving now, home in 20 minutes."']
const DEFAULT_L = [
  [0.6, 0.1, 0.5],
  [0.1, 0.8, 0.5],
  [0.7, 0.6, 0.05],
]
const PRIORS: Record<string, number[]> = {
  even: [1 / 3, 1 / 3, 1 / 3],
  library: [0.2, 0.6, 0.2],
}
const H = 150 // px height of a bar with value 1

const f3 = (v: number) => String(Math.round(v * 1000) / 1000)

type Phase = 'prior' | 'likelihood' | 'multiply' | 'normalise'

const bar = (h: number, color: string, extra: CSSProperties = {}): CSSProperties => ({
  width: '100%',
  height: Math.max(0, h),
  background: color,
  borderRadius: '5px 5px 0 0',
  transition: 'height 0.6s ease, background 0.4s, opacity 0.4s',
  ...extra,
})

export default function PriorPosteriorBars() {
  const [priorKey, setPriorKey] = useState<'even' | 'library'>('even')
  const [L, setL] = useState<number[][]>(DEFAULT_L)
  const player = usePlayer({ steps: 1 + 3 * CLUES.length, interval: 1400 })
  // start with the first clue's likelihoods on show, so the figure is meaningful at rest
  useEffect(() => {
    player.setStep(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const s = player.step

  // run the whole chain of updates
  const beliefs: number[][] = [PRIORS[priorKey]]
  const products: number[][] = []
  const totals: number[] = []
  for (let c = 0; c < CLUES.length; c++) {
    const u = beliefs[c].map((b, i) => b * L[c][i])
    const t = u.reduce((a, v) => a + v, 0)
    products.push(u)
    totals.push(t)
    beliefs.push(u.map((v) => v / t))
  }

  const c = s === 0 ? 0 : Math.floor((s - 1) / 3)
  const phase: Phase = s === 0 ? 'prior' : (['likelihood', 'multiply', 'normalise'] as const)[(s - 1) % 3]
  const shown = phase === 'prior' || phase === 'likelihood' ? beliefs[c] : phase === 'multiply' ? products[c] : beliefs[c + 1]
  const showLik = phase === 'likelihood' || phase === 'multiply'
  const best = shown.indexOf(Math.max(...shown))
  const sumShown = shown.reduce((a, v) => a + v, 0)

  const setLik = (i: number, v: number) => setL((m) => m.map((row, r) => (r === c ? row.map((x, j) => (j === i ? v : x)) : row)))

  const phaseText: Record<Phase, string> = {
    prior: 'Before any clue: the prior. Each bar is how much you believe that place, and they add to 1.',
    likelihood: `Clue ${c + 1}: ${CLUES[c]} The orange bars are the likelihoods: how probable this clue is if your friend is in each place. They are separate "if" questions, one per place, so they don't need to add to 1.`,
    multiply: `Multiply each belief by its likelihood. The bars shrink, and now add up to only ${f3(totals[c])}, not 1.`,
    normalise: `Divide every bar by ${f3(totals[c])} so they add to 1 again. This is the posterior${c < CLUES.length - 1 ? ', and it becomes the prior for the next clue.' : '.'}`,
  }

  const cell: CSSProperties = { padding: '0.25rem 0.45rem', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }
  const active = (col: Phase[]) => (col.includes(phase) ? { background: 'var(--highlight-soft)', color: 'var(--highlight-ink)', fontWeight: 700 } : {})

  return (
    <Figure
      title="Prior × likelihood, then renormalise"
      caption={
        <>
          Where is your friend: at the hawker centre, the library or home? Press <b>Next</b> to step through three clues. Watch each update happen in three moves:
          show the likelihoods, multiply (the bars shrink), then rescale so they add to 1. Drag the sliders to change how likely the current clue is in each place,
          and switch the prior to see how a different starting belief changes the end result.
        </>
      }
    >
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', alignItems: 'end', maxWidth: 520 }}>
        {PLACES.map((p, i) => (
          <div key={p} style={{ display: 'grid', gap: '0.3rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem', alignItems: 'end', height: H + 22 }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%' }}>
                <span className="tabular" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--viz-1)' }}>
                  {f3(shown[i])}
                </span>
                <div
                  style={bar(shown[i] * H, phase === 'multiply' ? 'color-mix(in srgb, var(--viz-1) 45%, var(--surface))' : 'var(--viz-1)', {
                    outline: phase === 'multiply' ? '2px dashed var(--viz-1)' : undefined,
                    outlineOffset: -2,
                  })}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%', opacity: showLik ? (phase === 'multiply' ? 0.45 : 1) : 0, transition: 'opacity 0.4s' }}>
                <span className="tabular" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--viz-2-ink)' }}>
                  {f3(L[c][i])}
                </span>
                <div style={bar(showLik ? L[c][i] * H : 0, 'var(--viz-2)')} />
              </div>
            </div>
            <div style={{ borderTop: '2px solid var(--viz-axis)', paddingTop: '0.25rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: i === best && phase !== 'likelihood' ? 800 : 600, color: 'var(--ink)' }}>
              {p}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--ink-2)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span>
          <span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--viz-1)', borderRadius: 2, marginRight: 5 }} />
          belief {phase === 'multiply' ? '(not yet rescaled)' : `(adds to ${f3(sumShown)})`}
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--viz-2)', borderRadius: 2, marginRight: 5 }} />
          likelihood P(clue | place)
        </span>
      </div>
      <p style={{ margin: 0, minHeight: '3em', fontSize: '0.95rem', width: '100%', textAlign: 'center' }} aria-live="polite">
        {phaseText[phase]}
      </p>
      <div className="table-wrap" style={{ width: '100%', maxWidth: 520 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr>
              <th style={{ ...cell, textAlign: 'left' }}>clue {c + 1}</th>
              <th style={{ ...cell, ...active(['prior', 'likelihood']) }}>prior</th>
              <th style={{ ...cell, ...active(['likelihood']) }}>× likelihood</th>
              <th style={{ ...cell, ...active(['multiply']) }}>= product</th>
              <th style={{ ...cell, ...active(['normalise']) }}>÷ {f3(totals[c])}</th>
            </tr>
          </thead>
          <tbody>
            {SHORT.map((p, i) => (
              <tr key={p} style={{ borderTop: '1px solid var(--rule)' }}>
                <td style={{ ...cell, textAlign: 'left', fontWeight: 650 }}>{p}</td>
                <td style={cell}>{f3(beliefs[c][i])}</td>
                <td style={cell}>{f3(L[c][i])}</td>
                <td style={{ ...cell, opacity: phase === 'prior' || phase === 'likelihood' ? 0.35 : 1 }}>{f3(products[c][i])}</td>
                <td style={{ ...cell, opacity: phase === 'normalise' ? 1 : 0.35, fontWeight: phase === 'normalise' ? 700 : 400 }}>{f3(beliefs[c + 1][i])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PlayerControls player={player} label={(st) => (st === 0 ? 'Prior' : `Clue ${Math.floor((st - 1) / 3) + 1}: ${['likelihood', 'multiply', 'renormalise'][(st - 1) % 3]}`)} />
      <Controls>
        {SHORT.map((p, i) => (
          <Slider key={p} label={`P(clue ${c + 1} | ${p.toLowerCase()})`} value={L[c][i]} min={0.05} max={0.95} step={0.05} onChange={(v) => setLik(i, v)} format={(v) => v.toFixed(2)} />
        ))}
      </Controls>
      <Controls>
        <Segmented
          label="Prior"
          value={priorKey}
          onChange={setPriorKey}
          options={[
            { value: 'even', label: 'no idea (1/3 each)' },
            { value: 'library', label: 'usually studies (library 0.6)' },
          ]}
        />
      </Controls>
    </Figure>
  )
}
