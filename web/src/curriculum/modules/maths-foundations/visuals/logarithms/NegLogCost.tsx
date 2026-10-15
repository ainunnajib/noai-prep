import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Readout, Toggle, Plot, Grid, Axes, FnPath, Dots, Label, HLine, DraggablePoint, useNarrow, M } from '../../../../../kit'

/*
  −ln p: the cost cross-entropy charges when the model gives the TRUE answer probability p.
  0 when p = 1, ln 2 ≈ 0.693 at p = 0.5, ln 10 ≈ 2.303 at p = 0.1, and it shoots up as p → 0.
  Quiz mode hides the anchor table and asks for the anchors.
*/

const ANCHORS: { tex: string; value: string; note: string }[] = [
  { tex: '\\ln 1', value: '0', note: 'e⁰ = 1' },
  { tex: '\\ln 2', value: '0.693', note: 'about 0.7' },
  { tex: '\\ln e', value: '1', note: 'e¹ = e' },
  { tex: '\\ln 10', value: '2.303', note: 'about 2.3' },
  { tex: '\\log_2 10', value: '3.32', note: '2¹⁰ ≈ 10³' },
  { tex: '\\ln \\tfrac{1}{K}', value: '−ln K', note: 'quotient rule' },
]

const QUIZ: { q: string; options: string[]; answer: number; why: string }[] = [
  { q: '\\ln 2 \\approx\\; ?', options: ['0.301', '0.5', '0.693', '1.443'], answer: 2, why: '0.301 is log₁₀ 2, a different base.' },
  { q: '\\ln 10 \\approx\\; ?', options: ['1', '2.303', '3.32', '10'], answer: 1, why: '3.32 is log₂ 10; ln uses base e ≈ 2.718.' },
  { q: '\\text{10 classes, each } p = \\tfrac{1}{10}\\text{: cost } {-\\ln}\\tfrac{1}{10} \\approx\\; ?', options: ['−2.303', '0.1', '1', '2.303'], answer: 3, why: '−ln(1/10) = ln 10. The minus sign makes the cost positive.' },
]

const cost = (p: number) => -Math.log(p)
const snapP = (x: number) => Math.max(0.01, Math.min(1, Math.round(x * 100) / 100))

function verdict(p: number) {
  if (p >= 0.9) return { text: 'confident and right: almost free', colour: 'var(--viz-pos)' }
  if (p >= 0.3) return { text: 'unsure: a moderate cost', colour: 'var(--viz-6)' }
  if (p >= 0.1) return { text: 'mostly wrong: an expensive answer', colour: 'var(--viz-2)' }
  return { text: 'confident and WRONG: punished hard', colour: 'var(--viz-neg)' }
}

/** −ln p equals ln(1/p): the cost of a fair guess among 1/p options. Only say so when 1/p is (nearly) whole. */
function guessText(p: number) {
  if (p >= 1) return 'being certain: no guessing'
  const k = 1 / p
  const r = Math.round(k)
  return Math.abs(k - r) < 0.05 ? `a fair guess among ${r} options` : `a fair guess among about ${r} options`
}

const cell: CSSProperties = { padding: '0.3rem 0.5rem', borderBottom: '1px solid var(--rule)', textAlign: 'left', fontSize: '0.9rem' }

export default function NegLogCost() {
  const [p, setP] = useState(0.25)
  const [quiz, setQuiz] = useState(false)
  const [picked, setPicked] = useState<(number | null)[]>([null, null, null])
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(620)
  const c = cost(p)
  const v = verdict(p)

  const toggleQuiz = (on: boolean) => {
    setQuiz(on)
    setPicked([null, null, null])
  }

  return (
    <Figure
      title="−ln p: the price of a probability"
      caption={
        <>
          Drag the point along the curve. <M>{'p'}</M> is the probability the model gave to the <em>correct</em> answer, and{' '}
          <M>{'-\\ln p'}</M> is what cross-entropy charges for it. A sure, correct answer (<M>{'p = 1'}</M>) costs nothing; a coin-flip costs{' '}
          <M>{'\\ln 2 \\approx 0.693'}</M>; giving the truth only 1% costs 4.6, and the cost has no ceiling as <M>{'p \\to 0'}</M>. Turn on quiz mode
          to test yourself on the anchor values.
        </>
      }
    >
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '1rem', alignItems: 'start' }}>
        <Plot x={[0, 1.02]} y={[0, 5.3]} width={420} height={330} minHeight={280} margin={{ left: 40, right: 12, top: 12 }} ariaLabel={`The curve y = minus ln p. At p = ${p.toFixed(2)} the cost is ${c.toFixed(3)}.`}>
          <Grid xTicks={10} yTicks={5} />
          <Axes xTicks={5} yTicks={5} xLabel="p (probability of the true answer)" yLabel="cost −ln p" />
          <FnPath f={(x) => (x > 0 ? cost(x) : NaN)} domain={[0.004, 1.02]} color="var(--viz-1)" width={3} samples={400} />
          <HLine y={c} color="var(--viz-2)" dash="3 4" width={1.2} />
          <Dots
            points={[
              { x: 1, y: 0, r: 5, color: 'var(--viz-pos)' },
              { x: 0.5, y: cost(0.5), r: 5, color: 'var(--viz-6)' },
              { x: 0.1, y: cost(0.1), r: 5, color: 'var(--viz-neg)' },
              { x: 0.01, y: cost(0.01), r: 5, color: 'var(--viz-neg)' },
            ]}
          />
          <Label x={1} y={0} dx={4} dy={-12} anchor="end" color="var(--viz-pos)">
            {quiz ? '?' : 'cost 0'}
          </Label>
          <Label x={0.5} y={cost(0.5)} dx={4} dy={-12} color="var(--viz-6)">
            {quiz ? 'p = 0.5: ?' : 'p = 0.5: ln 2 ≈ 0.693'}
          </Label>
          <Label x={0.1} y={cost(0.1)} dx={9} dy={4} color="var(--viz-neg)">
            {quiz ? 'p = 0.1: ?' : 'p = 0.1: ln 10 ≈ 2.303'}
          </Label>
          <Label x={0.01} y={cost(0.01)} dx={9} dy={4} color="var(--viz-neg)">
            {quiz ? 'p = 0.01: ?' : 'p = 0.01: 2 ln 10 ≈ 4.605'}
          </Label>
          <DraggablePoint x={p} y={c} color="var(--viz-2)" constrain={(x) => [snapP(x), cost(snapP(x))]} onChange={(x) => setP(snapP(x))} />
        </Plot>
        <div style={{ display: 'grid', gap: '0.5rem', minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)' }}>{quiz ? 'Quiz: no peeking' : 'Anchor values to memorise'}</div>
          {!quiz ? (
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <tbody>
                {ANCHORS.map((a) => (
                  <tr key={a.tex}>
                    <td style={cell}>
                      <M>{a.tex}</M>
                    </td>
                    <td style={{ ...cell, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{a.value}</td>
                    <td style={{ ...cell, color: 'var(--ink-3)', fontSize: '0.8rem' }}>{a.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {QUIZ.map((q, qi) => {
                const sel = picked[qi]
                return (
                  <div key={qi} style={{ display: 'grid', gap: '0.35rem' }}>
                    <div>
                      <M>{q.q}</M>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {q.options.map((o, oi) => {
                        const isSel = sel === oi
                        const right = oi === q.answer
                        const bg = sel === null ? 'var(--surface-2)' : right ? 'var(--ok-soft)' : isSel ? 'var(--bad-soft)' : 'var(--surface-2)'
                        const bd = sel === null ? 'var(--rule)' : right ? 'var(--ok)' : isSel ? 'var(--bad)' : 'var(--rule)'
                        return (
                          <button
                            key={o}
                            type="button"
                            onClick={() => setPicked(picked.map((x, i) => (i === qi ? oi : x)))}
                            style={{ font: 'inherit', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: 8, border: `1.5px solid ${bd}`, background: bg, color: 'var(--ink)', cursor: 'pointer' }}
                            aria-pressed={isSel}
                          >
                            {o}
                          </button>
                        )
                      })}
                    </div>
                    {sel !== null && (
                      <div style={{ fontSize: '0.8rem', color: sel === q.answer ? 'var(--ok)' : 'var(--bad)', fontWeight: 600 }}>
                        {sel === q.answer ? 'Correct. ' : `Not quite: it is ${q.options[q.answer]}. `}
                        <span style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{q.why}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Readout
        items={[
          ['p', p.toFixed(2)],
          ['cost −ln p', c.toFixed(3)],
          ['same cost as', guessText(p)],
        ]}
      />
      <div style={{ width: '100%', fontSize: '0.875rem', fontWeight: 700, color: v.colour }}>{v.text}</div>
      <Controls>
        <Toggle label="Quiz mode (hide the anchors)" checked={quiz} onChange={toggleQuiz} />
      </Controls>
    </Figure>
  )
}
