import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Figure, Controls, Slider, Button } from '../../../../../kit'

/*
  Build a word-level vocabulary step by step. Tokenise = lowercase, then split into runs of
  letters/digits. Ids 0 and 1 are reserved for [PAD] and [UNK]. A word joins the vocabulary
  once it has been seen `minFreq` times, and (exactly like the lesson's Python code) the words
  that qualify are numbered in order of first appearance. A test sentence is then encoded with the
  vocabulary built so far, unknown words become [UNK] (id 1), and the result is padded with
  [PAD] (id 0) or cut to a fixed length.
*/

const DEFAULT_TRAIN = 'The cat sat on the mat.\nThe dog sat on the log.\nA cat saw a dog.'
const DEFAULT_TEST = 'the dog sat on a sofa'

const tokenise = (s: string) => s.toLowerCase().match(/[a-z0-9']+/g) ?? []

const chip = (bg: string, fg = 'var(--ink)', border = 'transparent'): CSSProperties => ({
  display: 'inline-grid',
  justifyItems: 'center',
  gap: 1,
  padding: '0.2rem 0.45rem',
  borderRadius: 6,
  background: bg,
  color: fg,
  border: `1.5px solid ${border}`,
  fontFamily: 'var(--font-mono)',
  fontSize: 13,
  lineHeight: 1.2,
})

function build(tokens: string[], upto: number, minFreq: number) {
  const count = new Map<string, number>()
  const ids = new Map<string, number>([
    ['[PAD]', 0],
    ['[UNK]', 1],
  ])
  let last: { word: string; event: 'new' | 'count' | 'id' } | null = null
  for (let i = 0; i < upto; i++) {
    const w = tokens[i]
    const c = (count.get(w) ?? 0) + 1
    count.set(w, c)
    last = { word: w, event: c === minFreq ? 'id' : c === 1 ? 'new' : 'count' }
  }
  // a Map keeps insertion order, i.e. order of first appearance, like Python's Counter
  for (const [w, c] of count) if (c >= minFreq) ids.set(w, ids.size)
  return { count, ids, last }
}

export default function VocabBuilder() {
  const [train, setTrain] = useState(DEFAULT_TRAIN)
  const [test, setTest] = useState(DEFAULT_TEST)
  const [minFreq, setMinFreq] = useState(1)
  const [maxLen, setMaxLen] = useState(8)
  const tokens = useMemo(() => tokenise(train), [train])
  const [step, setStep] = useState(tokens.length)
  const [playing, setPlaying] = useState(false)

  // keep the step inside range when the text changes; show the finished vocabulary
  useEffect(() => {
    setStep(tokens.length)
    setPlaying(false)
  }, [tokens.length])

  useEffect(() => {
    if (!playing) return
    if (step >= tokens.length) {
      setPlaying(false)
      return
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), 650)
    return () => window.clearTimeout(t)
  }, [playing, step, tokens.length])

  const { count, ids, last } = build(tokens, Math.min(step, tokens.length), minFreq)
  const vocab = [...ids.entries()]
  const pending = [...count.entries()].filter(([w]) => !ids.has(w))

  const testTokens = tokenise(test)
  const encoded = testTokens.map((w) => ({ w, id: ids.get(w) ?? 1, unk: !ids.has(w) }))
  const withPad = [...encoded.slice(0, maxLen), ...Array.from({ length: Math.max(0, maxLen - encoded.length) }, () => ({ w: '[PAD]', id: 0, unk: false }))]
  const cut = Math.max(0, encoded.length - maxLen)

  let message = 'Press Play or Next to add the training words one at a time.'
  const nWords = vocab.length - 2
  if (step >= tokens.length && tokens.length) message = `Done: ${vocab.length} entries (${nWords} word${nWords === 1 ? '' : 's'} + [PAD] + [UNK]).`
  if (last && step < tokens.length && step > 0) {
    const c = count.get(last.word) ?? 0
    if (last.event === 'id') {
      const myId = ids.get(last.word) ?? 0
      const shifted = vocab.filter(([w, id]) => id > myId && !w.startsWith('[')).map(([w]) => `“${w}”`)
      message =
        minFreq === 1
          ? `“${last.word}” is new, so it gets the next free id: ${myId}.`
          : `“${last.word}” has now been seen ${c} times, so it joins the vocabulary with id ${myId}.` +
            (shifted.length
              ? ` Ids follow first appearance (as in the code below), and “${last.word}” appeared before ${shifted.join(', ')}, so ${shifted.length === 1 ? 'that word moves' : 'those words move'} up by one.`
              : '')
    }
    else if (last.event === 'new') message = `“${last.word}” is new, but needs ${minFreq} sightings before it gets an id.`
    else message = ids.has(last.word) ? `“${last.word}” is already in the vocabulary (id ${ids.get(last.word)}), so only its count goes up to ${c}.` : `“${last.word}” seen ${c} time${c > 1 ? 's' : ''}: still below the minimum of ${minFreq}.`
  }

  const label: CSSProperties = { fontSize: 'var(--step--1)', fontWeight: 700, color: 'var(--ink-2)' }
  const box: CSSProperties = { width: '100%', display: 'grid', gap: '0.35rem' }

  return (
    <Figure
      wide
      title="Building a vocabulary, one token at a time"
      caption={
        <>
          Step through the training sentences: each new word is added to the vocabulary with the next free id. Then look at the test sentence: a word
          the vocabulary has never seen becomes <code>[UNK]</code> (id 1), and short sentences are padded with <code>[PAD]</code> (id 0) to a fixed
          length. Edit the sentences, or raise the minimum frequency so rare words are left out (the words that qualify are numbered in order of
          first appearance, exactly as in the Python code below).
        </>
      }
    >
      <div style={box}>
        <label style={label} htmlFor="vocab-train">
          Training sentences (edit me)
        </label>
        <textarea
          id="vocab-train"
          value={train}
          rows={3}
          spellCheck={false}
          onChange={(e) => setTrain(e.target.value)}
          style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: 13, padding: '0.4rem 0.5rem', borderRadius: 8, border: '1px solid var(--rule)', background: 'var(--surface-2)', color: 'var(--ink)', resize: 'vertical' }}
        />
      </div>
      <div style={box}>
        <span style={label}>Tokens ({tokens.length})</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }} aria-label="Training tokens">
          {tokens.map((w, i) => {
            const done = i < step
            const current = i === step - 1 && step < tokens.length
            return (
              <span
                key={i}
                style={chip(
                  current ? 'color-mix(in srgb, var(--viz-2) 30%, var(--surface))' : done ? 'color-mix(in srgb, var(--viz-1) 14%, var(--surface))' : 'var(--surface-2)',
                  done ? 'var(--ink)' : 'var(--ink-3)',
                  current ? 'var(--viz-2)' : 'transparent',
                )}
              >
                {w}
              </span>
            )
          })}
        </div>
      </div>
      <Controls>
        <Button onClick={() => { setPlaying(false); setStep(0) }}>Restart</Button>
        <Button onClick={() => { setPlaying(false); setStep((s) => Math.max(0, s - 1)) }}>Back</Button>
        <Button primary onClick={() => { if (step >= tokens.length) setStep(0); setPlaying((p) => !p) }}>{playing ? 'Pause' : 'Play'}</Button>
        <Button onClick={() => { setPlaying(false); setStep((s) => Math.min(tokens.length, s + 1)) }}>Next</Button>
        <span className="tabular" style={{ fontSize: 'var(--step--1)', color: 'var(--ink-3)' }}>
          {Math.min(step, tokens.length)} / {tokens.length} tokens
        </span>
      </Controls>
      <p style={{ margin: 0, width: '100%', fontSize: 'var(--step--1)', color: 'var(--ink)' }} aria-live="polite">
        {message}
      </p>
      <div style={box}>
        <span style={label}>Vocabulary: word → id</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {vocab.map(([w, id]) => (
            <span key={w} style={chip(w.startsWith('[') ? 'var(--surface-3)' : 'color-mix(in srgb, var(--viz-3) 18%, var(--surface))', 'var(--ink)', last?.word === w && last.event === 'id' && step < tokens.length ? 'var(--viz-3)' : 'transparent')}>
              <span>{w}</span>
              <b style={{ color: 'var(--viz-3)' }}>{id}</b>
            </span>
          ))}
          {pending.map(([w, c]) => (
            <span key={w} style={chip('transparent', 'var(--ink-3)', 'var(--rule)')} title="seen, but not often enough yet">
              <span>{w}</span>
              <span style={{ fontSize: 11 }}>{`seen ${c}×`}</span>
            </span>
          ))}
        </div>
      </div>
      <Controls>
        <Slider label="minimum frequency" value={minFreq} min={1} max={3} step={1} onChange={setMinFreq} />
        <Slider label="padded length" value={maxLen} min={4} max={10} step={1} onChange={setMaxLen} />
      </Controls>
      <div style={box}>
        <label style={label} htmlFor="vocab-test">
          Test sentence (edit me)
        </label>
        <input
          id="vocab-test"
          value={test}
          spellCheck={false}
          onChange={(e) => setTest(e.target.value)}
          style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: 13, padding: '0.4rem 0.5rem', borderRadius: 8, border: '1px solid var(--rule)', background: 'var(--surface-2)', color: 'var(--ink)' }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }} aria-label="Encoded test sentence">
          {withPad.map((e, i) => (
            <span
              key={i}
              style={chip(
                e.w === '[PAD]' ? 'var(--surface-3)' : e.unk ? 'color-mix(in srgb, var(--viz-neg) 18%, var(--surface))' : 'color-mix(in srgb, var(--viz-3) 18%, var(--surface))',
                'var(--ink)',
                e.unk ? 'var(--viz-neg)' : 'transparent',
              )}
            >
              <span>{e.unk ? `${e.w} → [UNK]` : e.w}</span>
              <b style={{ color: e.unk ? 'var(--viz-neg)' : e.w === '[PAD]' ? 'var(--ink-3)' : 'var(--viz-3)' }}>{e.id}</b>
            </span>
          ))}
        </div>
        <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)' }}>
          ids = [{withPad.map((e) => e.id).join(', ')}]{cut > 0 ? `   (${cut} token${cut > 1 ? 's' : ''} cut off)` : ''}
        </div>
      </div>
    </Figure>
  )
}
