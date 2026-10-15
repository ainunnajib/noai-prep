import { useMemo, useState } from 'react'
import { Figure, Toggle, CodeBlock } from '../../../../../kit'
import { HANDBOOK, STOP } from './handbook'
import s from './rag.module.css'

/*
  A test bench for the retriever. Five fixes can be switched on/off; the tokeniser, vocabulary,
  matrix and scores are rebuilt with exactly those choices (like re-running the notebook), and
  seven "hidden tests" compare the output with the fully fixed pipeline.

  Cross-checked with Python (numpy): all fixes off -> 2/7 pass; turning fixes on in order
  (lower, punctuation, stop words, epsilon, skip zeros) -> 3, 4, 4, 4, 7 passes.
  An all-zero query vector without epsilon gives [nan nan nan nan] and argsort returns [0, 1].
*/

interface Fixes {
  lower: boolean
  strip: boolean
  stop: boolean
  eps: boolean
  skip: boolean
}

const TESTS: { q: string; what: string }[] = [
  { q: 'Is the library open on Friday?', what: 'a normal question' },
  { q: 'LIBRARY FRIDAY', what: 'capital letters' },
  { q: 'Friday?', what: 'punctuation' },
  { q: 'Where is the canteen?', what: 'mostly stop words' },
  { q: '', what: 'empty query' },
  { q: 'swimming pool timetable', what: 'only unknown words' },
  { q: 'library library library', what: 'repeated word' },
]

function build(fx: Fixes) {
  const tok = (t: string) => {
    const x = fx.lower ? t.toLowerCase() : t
    let ws = fx.strip ? (x.match(/[A-Za-z]+/g) ?? []) : x.split(/\s+/).filter(Boolean)
    if (fx.stop) ws = ws.filter((w) => !STOP.has(w))
    return ws
  }
  const T = HANDBOOK.map(tok)
  const vocab = [...new Set(T.flat())].sort()
  const index = new Map(vocab.map((w, j) => [w, j]))
  const D = T.map((t) => {
    const v = new Array(vocab.length).fill(0) as number[]
    for (const w of t) v[index.get(w)!] += 1
    return v
  })
  const dNorm = D.map((r) => Math.sqrt(r.reduce((a, x) => a + x * x, 0)))
  const retrieve = (query: string, k = 2) => {
    const tokens = tok(query)
    const q = new Array(vocab.length).fill(0) as number[]
    for (const w of tokens) {
      const j = index.get(w)
      if (j !== undefined) q[j] += 1
    }
    const qn = Math.sqrt(q.reduce((a, x) => a + x * x, 0))
    const scores = D.map((r, i) => {
      const dot = r.reduce((a, x, j) => a + x * q[j], 0)
      const den = dNorm[i] * qn
      return fx.eps ? dot / (den + 1e-10) : den === 0 ? (dot === 0 ? NaN : Infinity) : dot / den
    })
    // np.argsort(-scores, kind="stable"): NaN sorts last; ties keep index order
    const key = (v: number) => (Number.isNaN(v) ? Infinity : -v)
    let top = scores
      .map((_, i) => i)
      .sort((a, b) => key(scores[a]) - key(scores[b]) || a - b)
      .slice(0, k)
    if (fx.skip) top = top.filter((i) => scores[i] > 0)
    return { tokens, known: tokens.map((w) => index.has(w)), q, qn, scores, top }
  }
  return { retrieve, vocab }
}

const ALL_ON: Fixes = { lower: true, strip: true, stop: true, eps: true, skip: true }
const reference = build(ALL_ON)
const EXPECTED = TESTS.map((t) => reference.retrieve(t.q).top)

const outText = (top: number[], scores: number[]) => {
  if (scores.some(Number.isNaN)) return `${top.map((i) => `d${i}`).join(', ')} · scores nan`
  if (!top.length) return "I don't know"
  return top.map((i) => `d${i}`).join(', ')
}
const expText = (top: number[]) => (top.length ? top.map((i) => `d${i}`).join(', ') : "I don't know")
const r3 = (v: number) => (Number.isNaN(v) ? 'nan' : String(Number(v.toFixed(3))))

export default function EdgeCaseTester() {
  const [fx, setFx] = useState<Fixes>({ lower: false, strip: false, stop: false, eps: false, skip: false })
  const [sel, setSel] = useState(4)
  const sys = useMemo(() => build(fx), [fx])
  const results = TESTS.map((t, i) => {
    const r = sys.retrieve(t.q)
    const pass = !r.scores.some(Number.isNaN) && r.top.join() === EXPECTED[i].join()
    return { ...r, pass }
  })
  const nPass = results.filter((r) => r.pass).length
  const cur = results[sel]
  const test = TESTS[sel]
  const set = (key: keyof Fixes) => (v: boolean) => setFx({ ...fx, [key]: v })

  // diagnosis for the selected test
  let why: string
  const unmatched = cur.tokens.filter((_, i) => !cur.known[i])
  if (cur.pass) {
    why =
      sel === 6
        ? 'Passes. Repeating a word makes q three times longer but keeps its direction, so every cosine score is unchanged.'
        : 'Passes: the output matches the expected answer.'
  } else if (cur.scores.some(Number.isNaN)) {
    why = 'No query word matched the vocabulary, so q is all zeros and ‖q‖ = 0. Every score is 0 ÷ 0 = nan (NumPy prints “RuntimeWarning: invalid value encountered in divide”), and argsort then returns d0, d1 for no reason. Fix: add a tiny epsilon to the denominator.'
  } else if (cur.top.some((i) => cur.scores[i] <= 0)) {
    why = 'Some returned documents score 0: they share no word with the query, but [:k] always returns k documents. Fix: skip documents whose score is 0 and answer “I don’t know” if none are left.'
  } else if (cur.qn === 0 && EXPECTED[sel].length) {
    const caps = unmatched.find((w) => w !== w.toLowerCase())
    const punct = unmatched.find((w) => /[^A-Za-z]/.test(w))
    why = caps
      ? `“${caps}” is not the same string as “${caps.toLowerCase().replace(/[^a-z]/g, '')}”: without lower-casing, capital letters make a different word, so nothing matches.`
      : punct
        ? `“${punct}” is not the same string as “${punct.toLowerCase().replace(/[^a-z]/g, '')}”: splitting on spaces leaves punctuation glued to the word, so nothing matches.`
        : 'No query word matched the vocabulary.'
  } else if (!fx.stop && cur.tokens.some((w) => STOP.has(w.toLowerCase()))) {
    why = 'Stop words such as “the” and “is” appear in almost every document, so they match everywhere and drown out the one real keyword. Fix: remove stop words (from documents and query alike).'
  } else if (!fx.strip) {
    why = 'Punctuation glued to words (“Friday.”, “week:”) splits one word into several vocabulary entries, which changes the matches and the lengths.'
  } else {
    why = 'Capitalised and lower-case copies of a word count as different words, which changes the matches and the lengths.'
  }

  const code = [
    'def tokenise(text):',
    ...(fx.lower ? ['    text = text.lower()'] : []),
    fx.strip ? `    words = re.findall(r"[${fx.lower ? 'a-z' : 'A-Za-z'}]+", text)` : '    words = text.split()',
    ...(fx.stop ? ['    words = [w for w in words if w not in STOP]'] : []),
    '    return words',
    '',
    'def retrieve(query, k=2):',
    '    q = vectorise(query)',
    '    norms = np.linalg.norm(D, axis=1) * np.linalg.norm(q)',
    fx.eps ? '    scores = D @ q / (norms + 1e-10)' : '    scores = D @ q / norms',
    '    top = np.argsort(-scores, kind="stable")[:k]',
    ...(fx.skip ? ['    top = [i for i in top if scores[i] > 0]'] : []),
    '    return top',
  ]
  const fixLines = code
    .map((l, i) => (/lower\(\)|findall|not in STOP|1e-10|scores\[i\] > 0/.test(l) ? i + 1 : 0))
    .filter(Boolean)

  return (
    <Figure
      wide
      title="Hidden-test bench: does your retriever survive the boring cases?"
      caption={
        <>
          The tests start against a first-attempt retriever that splits on spaces and divides with no safety net: 2 of 7 pass. Switch the fixes on one at a
          time and click a test to see <i>why</i> it fails. Notice that some fixes only help together: the empty query needs both the epsilon (no nan) and
          skipping zero scores (no made-up answers). The last test always passes, because cosine ignores how long the query vector is.
        </>
      }
    >
      <div className={s.fixes} role="group" aria-label="Fixes">
        <Toggle label="lower-case" checked={fx.lower} onChange={set('lower')} />
        <Toggle label="strip punctuation" checked={fx.strip} onChange={set('strip')} />
        <Toggle label="remove stop words" checked={fx.stop} onChange={set('stop')} />
        <Toggle label="epsilon in the division" checked={fx.eps} onChange={set('eps')} />
        <Toggle label="skip zero scores" checked={fx.skip} onChange={set('skip')} />
      </div>
      <div className={s.sectionLabel} style={{ width: '100%' }} aria-live="polite">
        {nPass} of {TESTS.length} tests pass
      </div>
      <div className={s.tests} aria-label="Test cases">
        {TESTS.map((t, i) => {
          const r = results[i]
          return (
            <button key={i} type="button" className={`${s.test} ${sel === i ? s.testSel : ''}`} onClick={() => setSel(i)} aria-pressed={sel === i}>
              <span className={s.testQ}>{t.q === '' ? '"" (empty)' : `"${t.q}"`}</span>
              <span className={s.testOut}>→ {outText(r.top, r.scores)}</span>
              <span className={`${s.badge} ${r.pass ? s.pass : s.fail}`}>{r.pass ? 'PASS' : 'FAIL'}</span>
            </button>
          )
        })}
      </div>
      <div className={s.detail} aria-live="polite">
        <div>
          <b>Test {sel + 1}</b> ({test.what}): query <code>{JSON.stringify(test.q)}</code>
        </div>
        <div>
          tokens:{' '}
          {cur.tokens.length ? (
            cur.tokens.map((w, i) => (
              <span key={i} className={`${s.tokChip} ${cur.known[i] ? s.tokIn : s.tokOut}`} title={cur.known[i] ? 'in the vocabulary' : 'not in the vocabulary: ignored'}>
                {w}
              </span>
            ))
          ) : (
            <i>none</i>
          )}
        </div>
        <div className={s.testOut}>
          scores = [{cur.scores.map(r3).join(', ')}] · returns {expText(cur.top)} · expected {expText(EXPECTED[sel])}
        </div>
        <div>{why}</div>
      </div>
      <div className={s.code}>
        <CodeBlock code={code.join('\n')} highlight={fixLines} showLineNumbers={false} title="your retriever right now (fix lines highlighted)" />
      </div>
    </Figure>
  )
}
