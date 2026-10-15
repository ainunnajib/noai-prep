import { useState, type CSSProperties } from 'react'
import { Figure, Bars, Plot, Grid, Axes, Path, Dots, Label, HLine, useNarrow } from '../../../../../kit'
import { VOCAB, CLASSES, CLS_C, PRIOR, type Word, type Cls, likelihood, scores, frac, small } from './nbData'

/*
  Naive Bayes with no smoothing (α = 0). Each class's score starts at its prior and is multiplied by
  P(word | class) for every word in the message. The chart shows the running score on a log scale:
  multiplying by a number below 1 is a step down, and multiplying by 0 drops off the bottom.
*/

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const pow10 = (e: number) => (e === 0 ? '1' : `10${e < 0 ? '⁻' : ''}${String(Math.abs(e)).split('').map((d) => SUP[+d]).join('')}`)
const FLOOR = -6

const chip = (on: boolean): CSSProperties => ({
  padding: '0.3rem 0.75rem',
  borderRadius: 999,
  border: `1.5px solid ${on ? 'var(--accent)' : 'var(--rule)'}`,
  background: on ? 'var(--accent-soft)' : 'var(--surface)',
  color: on ? 'var(--accent)' : 'var(--ink-2)',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.88rem',
  fontWeight: on ? 700 : 500,
  cursor: 'pointer',
})

function Cell({ num, den, p, c, isZero }: { num: number; den: number; p: number; c: string; isZero: boolean }) {
  return (
    <div style={{ display: 'grid', gap: 3 }}>
      <span className="tabular" style={{ fontSize: '0.88rem', color: isZero ? 'var(--viz-neg)' : 'var(--ink)', fontWeight: isZero ? 700 : 500 }}>
        {frac(num, den)} = {p.toFixed(1)}
        {isZero && ' (never seen!)'}
      </span>
      <span style={{ height: 6, borderRadius: 3, background: 'var(--surface-3)', overflow: 'hidden' }}>
        <span style={{ display: 'block', height: '100%', width: `${p * 100}%`, background: c }} />
      </span>
    </div>
  )
}

export default function NaiveBayesSpam() {
  const [msg, setMsg] = useState<Word[]>(['free', 'lunch', 'now'])
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(600)
  const words = msg
  const { raw, post } = scores(words, 0)

  const toggle = (w: Word) => setMsg((m) => (m.includes(w) ? m.filter((x) => x !== w) : [...m, w]))

  // running products for the chart
  const run = (c: Cls) => {
    const out: number[] = [PRIOR[c]]
    for (const w of words) out.push(out[out.length - 1] * likelihood(c, w, 0).p)
    return out
  }
  const runs = { spam: run('spam'), normal: run('normal') }
  const toY = (v: number) => (v > 0 ? Math.max(FLOOR, Math.log10(v)) : FLOOR)
  const n = words.length
  const winner: Cls | null = post ? (post.spam >= post.normal ? 'spam' : 'normal') : null

  const th: CSSProperties = { fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.03em' }
  const rowLabel: CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--ink)' }

  return (
    <Figure
      title="Naive Bayes: start from the prior, multiply in each word"
      caption={
        <>
          Tap words to build a message. Each class's score starts at its prior (how common the class is) and is multiplied by how typical each word is
          for that class. The higher score wins. Try <b>free lunch now</b>, then add <b>win</b> (spam catches up), then add <b>prize</b>: "prize" never
          appeared in a normal training message, so the normal score is multiplied by 0 and can never recover. Hold that thought.
        </>
      }
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }} role="group" aria-label="Words in the message">
        {VOCAB.map((w) => (
          <button key={w} type="button" style={chip(msg.includes(w))} aria-pressed={msg.includes(w)} onClick={() => toggle(w)}>
            {w}
          </button>
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: '0.95rem', color: 'var(--ink-2)' }}>
        message: <b style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>{words.length ? `"${words.join(' ')}"` : '(empty: tap a word)'}</b>
      </div>
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '8px 12px', alignItems: 'center' }}>
          <span style={th}>factor</span>
          <span style={{ ...th, color: CLS_C.spam }}>spam</span>
          <span style={{ ...th, color: CLS_C.normal }}>normal</span>
          <span style={rowLabel}>prior</span>
          {CLASSES.map((c) => (
            <Cell key={c} num={c === 'spam' ? 4 : 6} den={10} p={PRIOR[c]} c={CLS_C[c]} isZero={false} />
          ))}
          {words.map((w) => (
            <div key={w} style={{ display: 'contents' }}>
              <span style={rowLabel}>× P({w} | ·)</span>
              {CLASSES.map((c) => {
                const l = likelihood(c, w, 0)
                return <Cell key={c} num={l.num} den={l.den} p={l.p} c={CLS_C[c]} isZero={l.p === 0} />
              })}
            </div>
          ))}
          <span style={{ ...rowLabel, fontWeight: 700, borderTop: '1.5px solid var(--rule)', paddingTop: 6 }}>= score</span>
          {CLASSES.map((c) => (
            <span
              key={c}
              className="tabular"
              style={{ fontWeight: 700, borderTop: '1.5px solid var(--rule)', paddingTop: 6, color: raw[c] === 0 ? 'var(--viz-neg)' : CLS_C[c], fontSize: '0.95rem' }}
            >
              {small(raw[c])}
            </span>
          ))}
        </div>
        <div style={{ display: 'grid', gap: 2 }}>
          <div style={{ fontSize: 'var(--step--1)', fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center' }}>Running score (log scale)</div>
          <Plot
            x={[-0.4, Math.max(1, n) + 0.4]}
            y={[FLOOR - 0.3, 0.2]}
            width={320}
            height={240}
            minHeight={220}
            margin={{ left: 46, bottom: 36, right: 14, top: 10 }}
            ariaLabel={`Running Naive Bayes scores: spam ends at ${small(raw.spam)}, normal ends at ${small(raw.normal)}.`}
          >
            <Grid xTicks={1} yTicks={6} />
            <Axes yTicks={6} hideXTicks tickFormat={(v) => pow10(Math.round(v))} />
            <HLine y={FLOOR} color="var(--viz-neg)" dash="3 3" width={1} label="0 (fell off)" />
            {CLASSES.map((c) => (
              <g key={c}>
                <Path points={runs[c].map((v, i) => [i, toY(v)] as [number, number])} color={CLS_C[c]} width={3} />
                <Dots points={runs[c].map((v, i) => ({ x: i, y: toY(v), r: 4.5, color: CLS_C[c], hollow: v === 0 }))} />
              </g>
            ))}
            {['prior', ...words].map((w, i) => (
              <Label key={w} x={i} y={FLOOR - 0.3} dy={16} anchor="middle" size={11} color="var(--viz-ink)">
                {w}
              </Label>
            ))}
          </Plot>
        </div>
      </div>
      <div style={{ width: '100%', maxWidth: 460, margin: '0 auto', display: 'grid', gap: 4 }} aria-live="polite">
        {post ? (
          <>
            <div style={{ fontSize: '0.88rem', color: 'var(--ink-2)', textAlign: 'center' }}>
              Divide each score by their total (normalise) to get P(class | message):
            </div>
            <Bars
              data={CLASSES.map((c) => ({ label: c, value: post[c], color: CLS_C[c], strong: c === winner }))}
              max={1}
              format={(v) => `${(v * 100).toFixed(1)}%`}
              ariaLabel="Posterior probability of each class"
            />
          </>
        ) : (
          <div style={{ textAlign: 'center', fontWeight: 700, color: 'var(--viz-neg)' }}>Both scores are 0: Naive Bayes cannot decide. (Laplace smoothing, below, fixes this.)</div>
        )}
      </div>
    </Figure>
  )
}
