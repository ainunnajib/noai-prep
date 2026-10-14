import { useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, useNarrow } from '../../../../../kit'

/*
  A miniature lesson page from this site. Click a region to learn what it is for and how to use
  it so that it actually makes you learn (most tips are retrieval or prediction in disguise).
*/

interface Region {
  id: string
  name: string
  what: string
  how: string
  habit: 'predict' | 'retrieve' | 'connect' | 'check'
  mini: ReactNode
}

const bar = (w: string, c = 'var(--surface-3)', h = 6): ReactNode => <span style={{ display: 'block', height: h, width: w, borderRadius: 3, background: c }} />

const tag = (text: string, c: string): ReactNode => (
  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: c }}>{text}</span>
)

const REGIONS: Region[] = [
  {
    id: 'hook',
    name: 'Opening lines',
    what: 'One to three sentences on why the lesson matters.',
    how: 'Before reading on, turn the hook into a question you want answered, for example "why does the Final need practice before the Prelim?". Reading to answer a question sticks better than reading to finish.',
    habit: 'connect',
    mini: (
      <span style={{ display: 'grid', gap: 4 }}>
        {bar('92%')}
        {bar('70%')}
      </span>
    ),
  },
  {
    id: 'analogy',
    name: 'Picture it (analogy)',
    what: 'An everyday comparison, from MRT trains to hawker centres, that gives the new idea something familiar to hang on.',
    how: 'Use it as a hook, then test it: where does the analogy break? Later, try to explain the idea to a friend using only the analogy. If you can, you understand it.',
    habit: 'connect',
    mini: (
      <span style={{ display: 'grid', gap: 4 }}>
        {tag('Picture it', 'var(--d-ai)')}
        {bar('80%')}
      </span>
    ),
  },
  {
    id: 'visual',
    name: 'Interactive visual',
    what: 'A figure you drag, slide or click, built so that one idea changes in front of you.',
    how: 'Predict first. Before you touch anything, say out loud what you think will happen ("if I slide this up, the curve gets steeper"). Then do it. A wrong prediction is the most useful outcome: it shows you exactly what you misunderstood. Then do whatever the caption asks.',
    habit: 'predict',
    mini: (
      <span style={{ display: 'grid', gap: 5 }}>
        <svg viewBox="0 0 120 34" style={{ width: '100%', height: 30 }} aria-hidden="true">
          <path d="M4 30 C30 30 40 6 64 8 S100 26 116 4" style={{ fill: 'none', stroke: 'var(--viz-1)', strokeWidth: 2.5 }} />
          <circle cx={64} cy={8} r={4.5} style={{ fill: 'var(--viz-2)' }} />
        </svg>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {bar('40%', 'var(--accent)', 4)}
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--accent)' }} />
        </span>
      </span>
    ),
  },
  {
    id: 'key',
    name: 'Formal idea and Key idea',
    what: 'The definition or formula with every symbol explained, then a yellow box with the one sentence to remember.',
    how: 'Cover the explanation and say what each symbol means. Copy the Key idea onto a flashcard, phrased as a question on the front ("What is the expected value of a blind guess?").',
    habit: 'retrieve',
    mini: (
      <span style={{ display: 'grid', gap: 4 }}>
        {tag('Key idea', 'var(--highlight-ink)')}
        {bar('85%', 'color-mix(in srgb, var(--highlight) 55%, transparent)')}
      </span>
    ),
  },
  {
    id: 'steps',
    name: 'Worked example',
    what: 'A small calculation done one step at a time, with Back and Next buttons.',
    how: 'Do not just click Next. Try each step yourself on paper first, then click to check. Small numbers are chosen on purpose so you can do them without a calculator, just like the Prelim.',
    habit: 'retrieve',
    mini: (
      <span style={{ display: 'grid', gap: 4 }}>
        <span style={{ display: 'flex', gap: 3 }}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i === 0 ? 'var(--accent)' : 'var(--surface-3)' }} />
          ))}
        </span>
        {bar('60%')}
      </span>
    ),
  },
  {
    id: 'code',
    name: 'Code',
    what: 'Python you can run in the page (or read, with its real output).',
    how: 'Run it once. Then change one thing and predict the new output before you run it again. The Prelim asks "what does this print?", so predicting output is exactly the skill being tested.',
    habit: 'predict',
    mini: (
      <span style={{ display: 'grid', gap: 4, background: 'var(--slate)', borderRadius: 4, padding: '5px 6px' }}>
        {bar('70%', 'color-mix(in srgb, var(--slate-ink) 40%, transparent)', 4)}
        {bar('45%', 'color-mix(in srgb, var(--slate-accent) 60%, transparent)', 4)}
      </span>
    ),
  },
  {
    id: 'mistake',
    name: 'Common mistake',
    what: 'The classic error on this topic, in a red box.',
    how: 'Ask yourself honestly: did I make this one? Exam distractors (the wrong options) are built from exactly these mistakes, so knowing them is how you spot the trap.',
    habit: 'check',
    mini: (
      <span style={{ display: 'grid', gap: 4 }}>
        {tag('Common mistake', 'var(--bad)')}
        {bar('75%', 'color-mix(in srgb, var(--bad) 30%, transparent)')}
      </span>
    ),
  },
  {
    id: 'exam',
    name: 'In the exam',
    what: 'How NOAI asks about this topic: speed tricks, traps, and what to memorise.',
    how: 'Add anything to memorise to your flashcards straight away. These boxes are the closest thing to inside information about the paper.',
    habit: 'retrieve',
    mini: (
      <span style={{ display: 'grid', gap: 4 }}>
        {tag('In the exam', 'var(--accent)')}
        {bar('65%', 'color-mix(in srgb, var(--accent) 30%, transparent)')}
      </span>
    ),
  },
  {
    id: 'past',
    name: 'Real exam question',
    what: 'An official NOAI question placed right after the part of the lesson that prepares you for it.',
    how: 'Time yourself: about 36 seconds, as in the Prelim. If you get it wrong, read the explanation and write the question number in your mistake log to retry next week.',
    habit: 'retrieve',
    mini: (
      <span style={{ display: 'grid', gap: 4 }}>
        <span style={{ alignSelf: 'start', justifySelf: 'start', background: 'var(--highlight)', color: 'var(--slate)', fontSize: 9.5, fontWeight: 800, padding: '0 4px', borderRadius: 3 }}>REAL EXAM</span>
        {bar('70%')}
      </span>
    ),
  },
  {
    id: 'quick',
    name: 'Quick check',
    what: 'One question in the middle of the lesson.',
    how: 'Answer it before scrolling back up. Struggling to recall is not failure: that effort is what makes the memory stronger.',
    habit: 'retrieve',
    mini: (
      <span style={{ display: 'grid', gap: 3 }}>
        {[0, 1].map((i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid var(--ink-3)' }} />
            {bar(i ? '45%' : '60%')}
          </span>
        ))}
      </span>
    ),
  },
  {
    id: 'remember',
    name: 'Remember (takeaways)',
    what: 'Three to five bullet points that sum up the lesson.',
    how: 'Cover the box and try to write the bullets from memory first. Then turn each one into a flashcard question.',
    habit: 'retrieve',
    mini: (
      <span style={{ display: 'grid', gap: 4, background: 'var(--slate)', borderRadius: 4, padding: '5px 6px' }}>
        {tag('Remember', 'var(--slate-accent)')}
        {bar('70%', 'color-mix(in srgb, var(--slate-ink) 35%, transparent)', 4)}
      </span>
    ),
  },
  {
    id: 'checkpoint',
    name: 'Checkpoint quiz',
    what: 'Five exam-style questions at the end of every lesson.',
    how: 'Do it straight after the lesson, then again a few days later without rereading first: that second try is a spaced review. Below 4 out of 5? Revisit the sections behind the questions you missed.',
    habit: 'check',
    mini: (
      <span style={{ display: 'grid', gap: 4 }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--ink)' }}>Checkpoint · 5 questions</span>
        {bar('80%')}
      </span>
    ),
  },
]

const HABIT: Record<Region['habit'], { label: string; colour: string }> = {
  predict: { label: 'Predict before you look', colour: 'var(--viz-4)' },
  retrieve: { label: 'Test yourself', colour: 'var(--viz-3)' },
  connect: { label: 'Connect to what you know', colour: 'var(--viz-5)' },
  check: { label: 'Check your understanding', colour: 'var(--viz-2)' },
}

export default function LessonAnatomy() {
  const [sel, setSel] = useState('visual')
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const r = REGIONS.find((x) => x.id === sel)!
  const h = HABIT[r.habit]

  const info = (
    <div aria-live="polite" style={{ position: narrow ? 'static' : 'sticky', top: 80, display: 'grid', gap: '0.55rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-m)', padding: narrow ? '0.7rem 0.8rem' : '0.85rem 1rem', margin: narrow ? '4px 0 8px' : 0, borderTop: `4px solid ${h.colour}` }}>
      <span style={{ justifySelf: 'start', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: h.colour }}>{h.label}</span>
      <strong style={{ fontSize: '1.05rem', color: 'var(--ink)' }}>{r.name}</strong>
      <div style={{ fontSize: '0.92rem', color: 'var(--ink-2)', lineHeight: 1.5 }}>{r.what}</div>
      <div style={{ fontSize: '0.95rem', color: 'var(--ink)', lineHeight: 1.55 }}>
        <strong>How to use it: </strong>
        {r.how}
      </div>
    </div>
  )

  const regionStyle = (on: boolean): CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: narrow ? '1fr' : '7.5rem 1fr',
    gap: narrow ? 3 : 8,
    alignItems: 'center',
    textAlign: 'left',
    font: 'inherit',
    width: '100%',
    padding: '5px 7px',
    borderRadius: 7,
    cursor: 'pointer',
    border: `1.5px solid ${on ? 'var(--accent)' : 'transparent'}`,
    background: on ? 'var(--accent-soft)' : 'transparent',
    color: 'var(--ink)',
  })

  return (
    <Figure
      title="The anatomy of a lesson on this site"
      caption={
        <>
          Click (or tap) any part of the miniature page to see what it is for and how to use it. Notice the coloured tag on each tip: almost every part becomes a learning tool once you{' '}
          <strong>predict</strong> or <strong>test yourself</strong> with it, instead of just reading it.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'minmax(0, 1fr) minmax(0, 1.1fr)', gap: '0.9rem', alignItems: 'start' }}>
        <div
          role="list"
          aria-label="Parts of a lesson page"
          style={{ border: '1.5px solid var(--rule)', borderRadius: 'var(--radius-m)', background: 'var(--surface)', padding: 6, display: 'grid', gap: 2, boxShadow: 'var(--shadow-card)' }}
        >
          <div aria-hidden="true" style={{ padding: '4px 7px 6px', display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>Lesson title</span>
            {bar('50%', 'var(--surface-3)', 4)}
          </div>
          {REGIONS.map((x) => (
            <div role="listitem" key={x.id}>
              <button type="button" aria-pressed={x.id === sel} onClick={() => setSel(x.id)} style={regionStyle(x.id === sel)}>
                <span style={{ fontSize: 11.5, fontWeight: 750, color: x.id === sel ? 'var(--accent)' : 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span aria-hidden="true" style={{ width: 7, height: 7, borderRadius: '50%', background: HABIT[x.habit].colour, flex: 'none' }} />
                  {x.name}
                </span>
                <span aria-hidden="true" style={{ display: 'block', minWidth: 0 }}>
                  {x.mini}
                </span>
              </button>
              {narrow && x.id === sel && info}
            </div>
          ))}
        </div>
        {!narrow && info}
      </div>
    </Figure>
  )
}
