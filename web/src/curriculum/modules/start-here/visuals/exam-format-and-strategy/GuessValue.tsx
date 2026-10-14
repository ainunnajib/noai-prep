import { useState, type CSSProperties } from 'react'
import { Figure, Controls, Slider, Button, Bars, M, mulberry32, useBump } from '../../../../../kit'

/*
  Expected marks from guessing when wrong answers cost nothing.
  One guess among k remaining options is right with probability 1/k, so it is worth 1/k of a
  mark on average; n guesses are worth n/k. Click options to cross them out, then try guessing
  for real (a seeded random draw, so each press gives a new but repeatable result).
*/

const LETTERS = ['A', 'B', 'C', 'D']

const frac = (k: number) => (k === 1 ? '1' : `\\tfrac{1}{${k}}`)

export default function GuessValue() {
  const [out, setOut] = useState<boolean[]>([false, true, false, false])
  const [n, setN] = useState(20)
  const [seed, bump] = useBump()
  const crossed = out.filter(Boolean).length
  const left = 4 - crossed
  const p = 1 / left
  const expected = n * p

  // a real run of n guesses with probability p each
  const rng = mulberry32(1000 + seed * 7919 + left)
  const hits = Array.from({ length: n }, () => rng() < p)
  const got = hits.filter(Boolean).length

  const toggle = (i: number) =>
    setOut((o) => {
      const next = o.slice()
      next[i] = !next[i]
      return next.filter(Boolean).length > 3 ? o : next
    })

  const card = (i: number): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    padding: '0.5rem 0.7rem',
    borderRadius: 'var(--radius-m)',
    border: `1.5px solid ${out[i] ? 'var(--rule)' : 'var(--accent)'}`,
    background: out[i] ? 'var(--surface-2)' : 'var(--surface)',
    cursor: 'pointer',
    font: 'inherit',
    color: 'var(--ink)',
    textAlign: 'left',
    width: '100%',
    opacity: out[i] ? 0.6 : 1,
  })

  return (
    <Figure
      title="What is a guess worth?"
      caption={
        <>
          Click the options you are <em>sure</em> are wrong to cross them out (up to three). The chance of a lucky guess jumps from 1 in 4 to 1 in 3 to 1 in 2. Then press{' '}
          <strong>Guess them all</strong> a few times: single runs bounce around, but they average out at the expected value. A blank is always worth exactly 0.
        </>
      }
    >
      <div style={{ width: '100%', display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: '0.4rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)' }}>A question you cannot work out</div>
          {LETTERS.map((L, i) => (
            <button key={L} type="button" aria-pressed={out[i]} aria-label={`Option ${L}${out[i] ? ', crossed out' : ''}`} onClick={() => toggle(i)} style={card(i)}>
              <span
                style={{
                  flex: 'none',
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  border: '1.5px solid var(--ink-3)',
                  color: 'var(--ink-2)',
                }}
              >
                {L}
              </span>
              <span style={{ flex: 1, display: 'grid', gap: 4 }} aria-hidden="true">
                <span style={{ height: 7, borderRadius: 4, width: `${[78, 60, 70, 52][i]}%`, background: 'var(--surface-3)' }} />
                <span style={{ height: 7, borderRadius: 4, width: `${[40, 55, 30, 45][i]}%`, background: 'var(--surface-3)' }} />
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: out[i] ? 'var(--viz-neg)' : 'var(--ink-3)', whiteSpace: 'nowrap' }}>{out[i] ? '✕ crossed out' : 'still possible'}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gap: '0.5rem', alignContent: 'start' }}>
          <div style={{ borderRadius: 'var(--radius-m)', background: 'var(--accent-soft)', padding: '0.7rem 0.85rem', display: 'grid', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink-2)' }}>Chance this guess is right</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ink)' }} className="tabular">
              1 in {left} = {Math.round(p * 100)}%
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--ink-2)' }}>
              Expected marks per guess: <M>{`1 \\times ${frac(left)} + 0 \\times ${left === 1 ? '0' : `\\tfrac{${left - 1}}{${left}}`} = ${frac(left)}`}</M>
            </span>
          </div>
          {crossed === 3 && <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ok)' }}>Three crossed out: you know the answer! That is no longer a guess.</div>}
        </div>
      </div>

      <Controls>
        <Slider label="questions you would otherwise leave blank" value={n} min={0} max={40} step={1} onChange={setN} />
      </Controls>
      <div style={{ width: '100%' }}>
        <Bars
          ariaLabel="Expected marks from blanks and from guessing"
          max={Math.max(1, n)}
          format={(v) => v.toFixed(v % 1 ? 2 : 0)}
          data={[
            { label: 'Leave blank', value: 0, color: 'var(--viz-muted)' },
            { label: 'Guess blind (1 in 4)', value: n / 4, color: 'var(--viz-2)', strong: crossed === 0 },
            ...(crossed > 0 ? [{ label: `Cross out ${crossed} (1 in ${left})`, value: expected, color: 'var(--viz-pos)', strong: true }] : []),
          ]}
        />
      </div>

      <div style={{ width: '100%', display: 'grid', gap: '0.45rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', alignItems: 'center' }}>
          <Button primary onClick={bump}>
            Guess them all
          </Button>
          <span className="tabular" style={{ fontSize: '0.92rem', color: 'var(--ink)' }}>
            This run: <strong>{got}</strong> right out of {n} · expected <strong>{expected.toFixed(expected % 1 ? 2 : 0)}</strong>
          </span>
        </div>
        <div aria-label={`${got} of ${n} guesses were right`} role="img" style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {hits.map((h, i) => (
            <span
              key={i}
              aria-hidden="true"
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                display: 'grid',
                placeItems: 'center',
                fontSize: 12,
                fontWeight: 900,
                background: h ? 'var(--viz-pos)' : 'var(--surface-3)',
                color: h ? 'var(--surface)' : 'var(--ink-3)',
              }}
            >
              {h ? '✓' : '·'}
            </span>
          ))}
        </div>
      </div>
    </Figure>
  )
}
