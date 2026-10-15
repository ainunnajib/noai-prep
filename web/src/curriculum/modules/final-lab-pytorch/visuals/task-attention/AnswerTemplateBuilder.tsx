import { useMemo, useState } from 'react'
import { Figure, Segmented, Bars, Readout, Button, useNarrow, mulberry32, M } from '../../../../../kit'
import { softmax } from './ui'
import s from './attn.module.css'

/*
  Q3.2 (2 marks, marked by hand): "Why is scaling by sqrt(d_k) necessary?"
  Top: live evidence from 400 random queries against 10 random keys with N(0, 1) entries, so the
  learner has real numbers to quote. Bottom: a text box seeded with the notebook's own template and a
  keyword checker for the four points a full answer makes.
*/

const N_Q = 400
const N_K = 10

function normals(rnd: () => number, n: number): Float64Array {
  const out = new Float64Array(n)
  for (let i = 0; i < n; i += 2) {
    const u = Math.max(1e-12, rnd())
    const v = rnd()
    const r = Math.sqrt(-2 * Math.log(u))
    out[i] = r * Math.cos(2 * Math.PI * v)
    if (i + 1 < n) out[i + 1] = r * Math.sin(2 * Math.PI * v)
  }
  return out
}

interface Evidence {
  std: number
  maxW: [number, number]
  slope: [number, number]
  example: [number[], number[]]
}

function evidence(dk: number): Evidence {
  const rnd = mulberry32(2026 + dk)
  const q = normals(rnd, N_Q * dk)
  const k = normals(rnd, N_Q * N_K * dk)
  let sum = 0
  let sum2 = 0
  const maxW: [number, number] = [0, 0]
  const slope: [number, number] = [0, 0]
  let example: [number[], number[]] = [[], []]
  for (let a = 0; a < N_Q; a++) {
    const sc: number[] = []
    for (let j = 0; j < N_K; j++) {
      let acc = 0
      const qo = a * dk
      const ko = (a * N_K + j) * dk
      for (let t = 0; t < dk; t++) acc += q[qo + t] * k[ko + t]
      sc.push(acc)
      sum += acc
      sum2 += acc * acc
    }
    ;[1, Math.sqrt(dk)].forEach((div, m) => {
      const p = softmax(sc.map((x) => x / div))
      const top = Math.max(...p)
      maxW[m] += top / N_Q
      slope[m] += (top * (1 - top)) / N_Q
      if (a === 0) example[m] = p
    })
  }
  const n = N_Q * N_K
  const mean = sum / n
  return { std: Math.sqrt(sum2 / n - mean * mean), maxW, slope, example: example as [number[], number[]] }
}

const TEMPLATE =
  'When d_k is large (e.g., 512), dot products between Q and K become very large in magnitude. This causes softmax to... which leads to... This is problematic for training because...'

/** The template's own words, removed before the keyword check so they earn no points. */
const TEMPLATE_PARTS = [
  'When d_k is large (e.g., 512), dot products between Q and K become very large in magnitude.',
  'This causes softmax to',
  'which leads to',
  'This is problematic for training because',
]

function ownWords(text: string): string {
  let t = text
  for (const part of TEMPLATE_PARTS) t = t.split(part).join(' ')
  return t.replace(/\.\.\./g, ' ')
}

const WEAK = 'Scaling makes the numbers smaller so the model trains better.'

const MODEL =
  'If the entries of q and k have mean 0 and variance 1, their dot product is a sum of d_k such terms, so its variance is d_k and its typical size grows like √d_k (about 22.6 when d_k = 512). Such large scores push softmax into saturation: almost all the weight goes to one key, a nearly one-hot row. In that region the softmax gradients (p_i(1 − p_i) and −p_i p_j) are almost zero, so the query and key projections barely learn and training is slow or unstable. Dividing by √d_k brings the variance of the scores back to about 1, which keeps softmax in the range where its gradients are useful.'

const POINTS: { title: string; hint: string; test: (t: string) => boolean }[] = [
  {
    title: 'Dot products grow with d_k',
    hint: 'A sum of d_k products: variance d_k, typical size √d_k.',
    test: (t) => /(variance|magnitude|grow|larger|large|big|increase)/i.test(t) && /(d_?k|dimension)/i.test(t),
  },
  {
    title: 'Softmax saturates',
    hint: 'Nearly all the weight on one key: a one-hot, peaked row.',
    test: (t) => /(saturat|one-hot|one hot|peak|spik|extreme|all (of )?the (weight|attention)|nearly all|almost all|dominat|close to (1|one)|winner)/i.test(t),
  },
  {
    title: 'Gradients vanish, so learning stalls',
    hint: 'Saturated softmax has gradients near zero, so Q and K barely update.',
    test: (t) => /(gradient|vanish)/i.test(t) || /(learn|train)\w*.{0,40}(slow|stall|stop|unstable|hard)/i.test(t),
  },
  {
    title: 'What the fix does',
    hint: 'Dividing by √d_k brings the variance of the scores back to about 1.',
    test: (t) => /(√|sqrt|square root|root)/i.test(t) && /(variance|std|standard deviation|spread)/i.test(t) && /(\b1\b|one|unit|constant)/i.test(t),
  },
]

export default function AnswerTemplateBuilder() {
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const [dk, setDk] = useState(512)
  const [text, setText] = useState(TEMPLATE)
  const [showModel, setShowModel] = useState(false)
  const ev = useMemo(() => evidence(dk), [dk])
  const own = ownWords(text)
  const hits = POINTS.map((p) => p.test(own))
  const score = hits.filter(Boolean).length

  const bars = (w: number[], colour: string) =>
    w.map((v, i) => ({ label: `key ${i + 1}`, value: v, color: colour, strong: v === Math.max(...w) }))

  return (
    <Figure
      title="Build the Q3.2 answer from evidence"
      caption={
        <>
          First change <M>{'d_k'}</M> and read the evidence: real random vectors, so these are numbers you can quote. Then finish the notebook's template sentence in the box (or
          load the weak answer to see what it misses). The ticks come from a simple keyword check of the words you add, not the template's: aim for all four points
          in two to four sentences.
        </>
      }
    >
      <div ref={wrapRef} className={s.stack}>
        <div className={s.evidence}>
          <div className={s.evHead}>Evidence: one query against 10 keys, entries drawn from N(0, 1)</div>
          <Segmented label="d_k" options={[4, 16, 64, 512].map((v) => ({ value: v, label: String(v) }))} value={dk} onChange={setDk} />
          <div className={`${s.evCols} ${narrow ? s.evColsNarrow : ''}`}>
            <div>
              <div className={s.evColTitle}>softmax(q·k): no scaling</div>
              <Bars data={bars(ev.example[0], 'var(--viz-2)')} max={1} ariaLabel="Weights without scaling" />
            </div>
            <div>
              <div className={s.evColTitle}>softmax(q·k / √d_k): scaled</div>
              <Bars data={bars(ev.example[1], 'var(--viz-1)')} max={1} ariaLabel="Weights with scaling" />
            </div>
          </div>
          <Readout
            items={[
              ['spread of q·k (std)', `${ev.std.toFixed(1)}  (√d_k = ${Math.sqrt(dk).toFixed(1)})`],
              ['average top weight', `${ev.maxW[0].toFixed(2)} → ${ev.maxW[1].toFixed(2)}`],
              ['slope p(1 − p) of top weight', `${ev.slope[0].toFixed(3)} → ${ev.slope[1].toFixed(3)}`],
            ]}
          />
        </div>

        <label htmlFor="q32-answer" className={s.evHead} style={{ justifySelf: 'start' }}>
          answer_3_2 = """ … """
        </label>
        <textarea id="q32-answer" className={s.answer} value={text} onChange={(e) => setText(e.target.value)} spellCheck />
        <div className={s.btnRow}>
          <Button onClick={() => setText(TEMPLATE)}>Notebook template</Button>
          <Button onClick={() => setText(WEAK)}>Load a weak answer</Button>
          <Button onClick={() => setText('')}>Clear</Button>
          <Button primary onClick={() => setShowModel((v) => !v)}>
            {showModel ? 'Hide model answer' : 'Show model answer'}
          </Button>
        </div>
        <div className={s.score} aria-live="polite">
          Points mentioned: {score} of 4 <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>(the template's own words don't count)</span>
        </div>
        <div className={s.points} role="list">
          {POINTS.map((p, i) => (
            <div key={p.title} role="listitem" className={`${s.point} ${hits[i] ? s.pointOn : ''}`}>
              <span className={s.tick} aria-hidden="true">
                {hits[i] ? '✓' : ''}
              </span>
              <span>
                <b>{p.title}</b>
                <span className={s.pointHint}>{p.hint}</span>
              </span>
            </div>
          ))}
        </div>
        {showModel && <div className={s.model}>{MODEL}</div>}
      </div>
    </Figure>
  )
}
