import { useEffect, useMemo, useRef, useState } from 'react'
import { Figure, Segmented, Button, M, mulberry32 } from '../../../../../kit'
import { AnswerBox, Stats, TimerBar, History, useCountdown, parseNumber, close, frac, avg } from '../drill-linear-algebra/drillKit'
import d from '../drill-linear-algebra/drill.module.css'

/*
  Metrics from a confusion matrix, against a 20-second clock. Rows are the actual class,
  columns the predicted class. After you answer, the cells in the numerator glow green and the
  cells in the denominator are outlined blue, so you see which counts each metric uses.
*/

type Metric = 'precision' | 'recall' | 'f1' | 'accuracy'
type Mode = 'mixed' | Metric
type Cell = 'TP' | 'FN' | 'FP' | 'TN'

interface Q {
  metric: Metric
  c: Record<Cell, number>
}

const LIMIT = 20
const NAME: Record<Metric, string> = { precision: 'precision', recall: 'recall', f1: 'F1 score', accuracy: 'accuracy' }
const USES: Record<Metric, { num: Cell[]; den: Cell[] }> = {
  precision: { num: ['TP'], den: ['TP', 'FP'] },
  recall: { num: ['TP'], den: ['TP', 'FN'] },
  f1: { num: ['TP'], den: ['TP', 'FP', 'FN'] },
  accuracy: { num: ['TP', 'TN'], den: ['TP', 'FP', 'FN', 'TN'] },
}

function makeQ(seed: number, mode: Mode): Q {
  const r = mulberry32(seed)
  const ms: Metric[] = ['precision', 'recall', 'f1', 'accuracy']
  const metric = mode === 'mixed' ? ms[Math.floor(r() * 4)] : mode
  const pick = (xs: number[]) => xs[Math.floor(r() * xs.length)]
  // friendly numbers: many questions land on tidy fractions
  const TP = pick([4, 6, 8, 9, 10, 12, 15, 16, 18, 20, 24, 30, 36, 40, 45])
  const FP = pick([1, 2, 3, 4, 5, 6, 8, 10, 12, 15])
  const FN = pick([1, 2, 3, 4, 5, 6, 8, 10, 12, 20])
  let TN = pick([20, 30, 40, 50, 60, 70, 80, 100])
  // make the total a round number about half the time, so accuracy is quick
  if (r() < 0.5) {
    const total = TP + FP + FN
    const target = Math.ceil((total + 20) / 50) * 50
    TN = target - total
  }
  return { metric, c: { TP, FP, FN, TN } }
}

function answerOf(q: Q): [number, number] {
  const { TP, FP, FN, TN } = q.c
  if (q.metric === 'precision') return [TP, TP + FP]
  if (q.metric === 'recall') return [TP, TP + FN]
  if (q.metric === 'f1') return [2 * TP, 2 * TP + FP + FN]
  return [TP + TN, TP + FP + FN + TN]
}

function formula(q: Q) {
  const { TP, FP, FN, TN } = q.c
  const [n, dd] = answerOf(q)
  const dec = (n / dd).toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
  if (q.metric === 'precision') return `\\text{precision} = \\frac{TP}{TP + FP} = \\frac{${TP}}{${TP} + ${FP}} = \\frac{${TP}}{${dd}} \\approx ${dec}`
  if (q.metric === 'recall') return `\\text{recall} = \\frac{TP}{TP + FN} = \\frac{${TP}}{${TP} + ${FN}} = \\frac{${TP}}{${dd}} \\approx ${dec}`
  if (q.metric === 'f1') return `F_1 = \\frac{2\\,TP}{2\\,TP + FP + FN} = \\frac{${2 * TP}}{${2 * TP} + ${FP} + ${FN}} = \\frac{${2 * TP}}{${dd}} \\approx ${dec}`
  return `\\text{accuracy} = \\frac{TP + TN}{\\text{total}} = \\frac{${TP} + ${TN}}{${dd}} = \\frac{${TP + TN}}{${dd}} \\approx ${dec}`
}

export default function MetricsFromCounts() {
  const [mode, setMode] = useState<Mode>('mixed')
  const [round, setRound] = useState(0)
  const [running, setRunning] = useState(false)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<null | { ok: boolean; given: string; timeUp?: boolean }>(null)
  const [marks, setMarks] = useState<boolean[]>([])
  const [times, setTimes] = useState<number[]>([])
  const started = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const nextRef = useRef<HTMLDivElement>(null)

  const q = useMemo(() => makeQ(611953 + 7919 * round + ['mixed', 'precision', 'recall', 'f1', 'accuracy'].indexOf(mode), mode), [round, mode])
  const [an, ad] = answerOf(q)
  const value = an / ad

  const finish = (given: string, timeUp = false) => {
    const v = parseNumber(given)
    const ok = !timeUp && v !== null && close(v, value, 0.011)
    setResult({ ok, given, timeUp })
    setMarks((m) => [...m, ok])
    if (ok) setTimes((t) => [...t, (performance.now() - started.current) / 1000])
  }
  const left = useCountdown(LIMIT, running && !result, () => finish('', true), `${round}-${mode}`)

  const next = () => {
    setRound((x) => x + 1)
    setInput('')
    setResult(null)
    setRunning(true)
  }
  useEffect(() => {
    if (running && !result) {
      started.current = performance.now()
      inputRef.current?.focus({ preventScroll: true })
    }
  }, [round, running, result, mode])
  useEffect(() => {
    if (!result) return
    if (result.ok) {
      const id = window.setTimeout(next, 1500)
      return () => window.clearTimeout(id)
    }
    nextRef.current?.querySelector('button')?.focus({ preventScroll: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  const uses = USES[q.metric]
  const cellCls = (c: Cell) => {
    if (!result) return d.cmCell
    if (uses.num.includes(c)) return `${d.cmCell} ${d.cmNum}`
    if (uses.den.includes(c)) return `${d.cmCell} ${d.cmDen}`
    return d.cmCell
  }

  return (
    <Figure
      title="Metrics from counts: one fraction each"
      caption={
        <>
          Rows are what each case <strong>really</strong> is; columns are what the model <strong>predicted</strong>. Find the four counts, then build the fraction: type it as a fraction
          like <code>3/4</code> or as a decimal. After each answer, green cells are the numerator and blue-outlined cells complete the denominator.
        </>
      }
    >
      <div className={d.wrap}>
        <Segmented
          label="Ask for"
          value={mode}
          onChange={(v) => {
            setMode(v)
            setResult(null)
            setInput('')
          }}
          options={[
            { value: 'mixed', label: 'Mixed' },
            { value: 'precision', label: 'Precision' },
            { value: 'recall', label: 'Recall' },
            { value: 'f1', label: 'F1' },
            { value: 'accuracy', label: 'Accuracy' },
          ]}
        />
        <div className={d.stage}>
          <div className={d.spread} style={{ width: '100%' }}>
            <span className={d.label}>Model {round + 1}</span>
            <span className={`${d.small} tabular`}>{running && !result ? `${Math.ceil(left)} s` : `${LIMIT} s each`}</span>
          </div>
          <TimerBar left={running && !result ? left : LIMIT} limit={LIMIT} />
          <div className={d.cm} role="table" aria-label={`Confusion matrix: TP ${q.c.TP}, FN ${q.c.FN}, FP ${q.c.FP}, TN ${q.c.TN}`}>
            <span />
            <span className={d.cmHead}>predicted positive</span>
            <span className={d.cmHead}>predicted negative</span>
            <span className={d.cmSide}>actually positive</span>
            {(['TP', 'FN'] as Cell[]).map((c) => (
              <span key={c} className={cellCls(c)} role="cell">
                <span className={d.cmName}>{c}</span>
                <span className={d.cmVal}>{q.c[c]}</span>
              </span>
            ))}
            <span className={d.cmSide}>actually negative</span>
            {(['FP', 'TN'] as Cell[]).map((c) => (
              <span key={c} className={cellCls(c)} role="cell">
                <span className={d.cmName}>{c}</span>
                <span className={d.cmVal}>{q.c[c]}</span>
              </span>
            ))}
          </div>
          <div className={`${d.prompt} ${d.big}`}>{NAME[q.metric]} = ?</div>
          {running ? (
            <AnswerBox value={input} onChange={setInput} onSubmit={() => parseNumber(input) !== null && finish(input)} placeholder="e.g. 3/4 or 0.75" disabled={!!result} inputRef={inputRef} label={`Your ${NAME[q.metric]}`} />
          ) : (
            <Button primary onClick={() => setRunning(true)}>
              Start the drill
            </Button>
          )}
          {result && (
            <div className={`${d.feedback} ${result.ok ? d.ok : d.miss}`} aria-live="polite">
              <div>
                {result.ok ? (
                  <span className={d.okText}>Right: {frac(an, ad)}.</span>
                ) : (
                  <span className={d.missText}>
                    {result.timeUp ? 'Time is up.' : `Not ${result.given}.`} The answer is {frac(an, ad)} ≈ {value.toFixed(2)}.
                  </span>
                )}
              </div>
              <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                <M>{formula(q)}</M>
              </div>
              {q.metric === 'f1' && (
                <div className={d.small}>
                  F1 is the harmonic mean <M>{'\\frac{2PR}{P + R}'}</M> of precision <M>{`P = ${frac(q.c.TP, q.c.TP + q.c.FP)}`}</M> and recall <M>{`R = ${frac(q.c.TP, q.c.TP + q.c.FN)}`}</M>; the
                  count form <M>{'\\frac{2TP}{2TP + FP + FN}'}</M> gives the same number with no fractions inside fractions.
                </div>
              )}
              {!result.ok && (
                <div ref={nextRef}>
                  <Button primary onClick={next}>
                    Next model
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        <Stats
          items={[
            ['answered', marks.length],
            ['right', marks.filter(Boolean).length],
            ['average time', times.length ? `${avg(times).toFixed(1)} s` : '–'],
          ]}
        />
        <History marks={marks} />
      </div>
    </Figure>
  )
}
