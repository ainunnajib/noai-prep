import { useState } from 'react'
import { Figure, Controls, Segmented, Toggle, Button, Bars, Plot, Axes, Grid, Path, Dots, Label, Arrow, M, mulberry32, hashString } from '../../../../../kit'
import s from './lim.module.css'

/*
  Why LLMs hallucinate. The same answer template is filled in with the "fact" token, whose
  probability depends on how well the fact was learnt. All other tokens are confident, so the
  sentence reads equally fluently whether the fact is right or wrong.
  Probabilities are illustrative (chosen by hand), not read from a real model.
*/

type QId = 'known' | 'rare' | 'madeup'
type Kind = 'right' | 'wrong' | 'honest'

interface Option {
  /** the fact token, or null for the "I'm not sure" reply */
  fact: string | null
  p: number
}

interface Question {
  id: QId
  tab: string
  prompt: string
  remark: string
  template: [string, number][] // '{X}' marks the fact token
  truth: string | null // null: the thing does not exist
  source: string
  noSource: Option[]
  withSource: Option[]
}

const ABSTAIN: [string, number][] = [
  ["'m", 0.9],
  [' not', 0.95],
  [' sure', 0.93],
  ['.', 0.9],
]

const QUESTIONS: Question[] = [
  {
    id: 'known',
    tab: 'Well-known fact',
    prompt: 'In what year did Singapore become independent?',
    remark: 'This fact appears on thousands of web pages, so the model learnt it well.',
    template: [
      ['Singapore', 0.71],
      [' became', 0.88],
      [' independent', 0.95],
      [' in', 0.97],
      ['{X}', 0],
      ['.', 0.96],
    ],
    truth: '1965',
    source: 'Singapore separated from Malaysia and became an independent country on 9 August 1965.',
    noSource: [
      { fact: '1965', p: 0.94 },
      { fact: '1963', p: 0.03 },
      { fact: '1959', p: 0.02 },
      { fact: null, p: 0.01 },
    ],
    withSource: [
      { fact: '1965', p: 0.99 },
      { fact: '1963', p: 0.005 },
      { fact: '1959', p: 0.003 },
      { fact: null, p: 0.002 },
    ],
  },
  {
    id: 'rare',
    tab: 'Rare fact',
    prompt: "In what year did Singapore's first MRT trains start carrying passengers?",
    remark: 'This fact appears only a few times in the training text, often next to other dates.',
    template: [
      ['The', 0.58],
      [' first', 0.86],
      [' MRT', 0.93],
      [' trains', 0.84],
      [' ran', 0.62],
      [' in', 0.95],
      ['{X}', 0],
      ['.', 0.97],
    ],
    truth: '1987',
    source: 'The first MRT section, between Yio Chu Kang and Toa Payoh, opened to passengers on 7 November 1987.',
    noSource: [
      { fact: '1987', p: 0.37 },
      { fact: '1988', p: 0.28 },
      { fact: '1990', p: 0.14 },
      { fact: '1984', p: 0.09 },
      { fact: '1983', p: 0.07 },
      { fact: null, p: 0.05 },
    ],
    withSource: [
      { fact: '1987', p: 0.97 },
      { fact: '1988', p: 0.01 },
      { fact: '1990', p: 0.005 },
      { fact: '1984', p: 0.005 },
      { fact: '1983', p: 0.005 },
      { fact: null, p: 0.005 },
    ],
  },
  {
    id: 'madeup',
    tab: 'Made-up prize',
    prompt: 'In what year was the Merlion Prize for Robotics first awarded?',
    remark: 'We invented this prize. It does not exist, so the only correct reply is "I\'m not sure".',
    template: [
      ['The', 0.66],
      [' Merlion', 0.97],
      [' Prize', 0.98],
      [' was', 0.9],
      [' first', 0.91],
      [' awarded', 0.95],
      [' in', 0.97],
      ['{X}', 0],
      ['.', 0.97],
    ],
    truth: null,
    source: 'Search found no document that mentions a "Merlion Prize for Robotics".',
    noSource: [
      { fact: '2016', p: 0.22 },
      { fact: '2018', p: 0.19 },
      { fact: '2015', p: 0.17 },
      { fact: '2012', p: 0.14 },
      { fact: '2019', p: 0.12 },
      { fact: '2010', p: 0.1 },
      { fact: null, p: 0.06 },
    ],
    withSource: [
      { fact: null, p: 0.9 },
      { fact: '2016', p: 0.03 },
      { fact: '2018', p: 0.02 },
      { fact: '2015', p: 0.02 },
      { fact: '2012', p: 0.01 },
      { fact: '2019', p: 0.01 },
      { fact: '2010', p: 0.01 },
    ],
  },
]

const kindOf = (q: Question, o: Option): Kind => {
  if (o.fact === null) return q.truth === null ? 'right' : 'honest'
  return o.fact === q.truth ? 'right' : 'wrong'
}

const KIND_COLOUR: Record<Kind, string> = { right: 'var(--viz-pos)', wrong: 'var(--viz-neg)', honest: 'var(--viz-6)' }

/** The tokens of one reply, with the probability the model gave each. */
function tokensOf(q: Question, o: Option): [string, number][] {
  if (o.fact === null) return [['I', o.p], ...ABSTAIN]
  return q.template.map(([t, p]) => (t === '{X}' ? [` ${o.fact}`, o.p] : [t, p]))
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length

/** x: how fluent the most likely reply is (mean token probability); y: chance the reply is true. */
function point(q: Question, src: boolean): [number, number] {
  const opts = src ? q.withSource : q.noSource
  const top = opts.reduce((a, b) => (b.p > a.p ? b : a))
  const fluency = mean(tokensOf(q, top).map(([, p]) => p))
  const truth = opts.filter((o) => kindOf(q, o) === 'right').reduce((a, o) => a + o.p, 0)
  return [fluency, truth]
}

const sentence = (toks: [string, number][]) => toks.map(([t]) => t).join('')
const pct = (p: number) => (p >= 0.995 ? '99%' : p < 0.01 ? '<1%' : `${Math.round(p * 100)}%`)

const SHORT: Record<QId, string> = { known: 'well-known fact', rare: 'rare fact', madeup: 'made-up prize' }
const QCOL: Record<QId, string> = { known: 'var(--viz-1)', rare: 'var(--viz-2)', madeup: 'var(--viz-5)' }

export default function HallucinationConfidence() {
  const [qid, setQid] = useState<QId>('rare')
  const [src, setSrc] = useState(false)
  const [draws, setDraws] = useState<Record<string, number[]>>({})
  const q = QUESTIONS.find((x) => x.id === qid)!
  const opts = src ? q.withSource : q.noSource
  const key = `${qid}-${src ? 1 : 0}`
  const hist = draws[key] ?? []
  const topIdx = opts.reduce((best, o, i) => (o.p > opts[best].p ? i : best), 0)
  const shownIdx = hist.length ? hist[hist.length - 1] : topIdx
  const shown = opts[shownIdx]
  const toks = tokensOf(q, shown)
  const shownKind = kindOf(q, shown)
  const keyPos = shown.fact === null ? 0 : q.template.findIndex(([t]) => t === '{X}')
  const pRight = opts.filter((o) => kindOf(q, o) === 'right').reduce((a, o) => a + o.p, 0)

  const askAgain = () => {
    const n = hist.length
    const rng = mulberry32((hashString(key) + n * 7919) >>> 0)
    const r = rng()
    let acc = 0
    let pick = opts.length - 1
    for (let i = 0; i < opts.length; i++) {
      acc += opts[i].p
      if (r < acc) {
        pick = i
        break
      }
    }
    setDraws((d) => ({ ...d, [key]: [...(d[key] ?? []), pick] }))
  }

  const pts = QUESTIONS.map((x) => ({ q: x, now: point(x, src), before: point(x, false) }))

  return (
    <Figure
      wide
      title="Fluent is not the same as true"
      caption={
        <>
          An LLM writes its reply one token at a time. Under each token is the probability the model gave it (illustrative numbers, not from a real
          model). Switch between the three questions: the wording stays confident every time, and only the <b>fact</b> token changes. For the rare
          fact, press <b>Ask again</b> a few times and watch the year change while the sentence sounds just as sure. Then turn on{' '}
          <b>retrieved source</b>: with the right text in front of it, the model copies the fact instead of guessing, and for the made-up prize it
          says it is not sure.
        </>
      }
    >
      <div className={s.wrap}>
        <Controls>
          <Segmented label="Question" value={qid} onChange={setQid} options={QUESTIONS.map((x) => ({ value: x.id, label: x.tab }))} />
          <Toggle label="Give it a retrieved source" checked={src} onChange={setSrc} />
        </Controls>

        <div className={s.chat}>
          <div className={`${s.bubble} ${s.userBubble}`}>
            <span className={s.who}>You</span>
            {q.prompt}
          </div>
          {src && (
            <div className={`${s.bubble} ${s.sourceBubble}`}>
              <span className={s.who}>{q.truth === null ? 'Search result' : 'Retrieved passage'}</span>
              {q.source}
              <p className={s.small} style={{ marginTop: '0.3rem' }}>
                Instruction added to the prompt: "Answer only from the retrieved text. If it does not contain the answer, say you are not sure."
              </p>
            </div>
          )}
          <div className={`${s.bubble} ${s.botBubble}`}>
            <span className={s.who}>Model</span>
            <div className={s.chips} aria-label={`Reply: ${sentence(toks)}`}>
              {toks.map(([t, p], i) => {
                const isKey = i === keyPos
                const col = isKey ? KIND_COLOUR[shownKind] : 'var(--viz-1)'
                return (
                  <span key={i} className={s.chip}>
                    <span className={`${s.chipText} ${isKey ? s.chipKey : ''}`} style={isKey ? { borderColor: col } : undefined}>
                      {t.trim() || t}
                    </span>
                    <span className={s.chipBar}>
                      <span className={s.chipFill} style={{ width: `${p * 100}%`, background: col }} />
                    </span>
                    <span className={s.chipP}>{p.toFixed(2)}</span>
                  </span>
                )
              })}
            </div>
          </div>
        </div>
        <p className={s.note}>{q.remark}</p>

        <div className={s.row} style={{ alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 260px', minWidth: 0, display: 'grid', gap: '0.4rem' }}>
            <p className={s.subhead}>{shown.fact === null ? 'Possible replies' : 'Possible replies at the fact token'}</p>
            <Bars
              ariaLabel="Probability of each possible reply"
              max={1}
              format={pct}
              data={opts.map((o, i) => {
                const k = kindOf(q, o)
                return {
                  label: (
                    <>
                      {o.fact ?? "\u201CI'm not sure\u201D"} {k === 'right' ? '✓' : k === 'wrong' ? '✗' : ''}
                    </>
                  ),
                  value: o.p,
                  color: KIND_COLOUR[k],
                  strong: i === shownIdx,
                }
              })}
            />
          </div>
          <div style={{ flex: '1 1 220px', minWidth: 0, display: 'grid', gap: '0.45rem' }}>
            <p className={s.subhead}>Ask the same question again</p>
            <div>
              <Button primary onClick={askAgain}>
                Ask again
              </Button>
            </div>
            {hist.length === 0 ? (
              <p className={s.small}>Each press samples a new reply from the probabilities on the left.</p>
            ) : (
              <ul className={s.history} aria-label="Previous replies">
                {hist
                  .slice(-4)
                  .reverse()
                  .map((idx, i) => {
                    const o = opts[idx]
                    const k = kindOf(q, o)
                    return (
                      <li key={hist.length - i}>
                        <span className={s.mark} style={{ color: KIND_COLOUR[k] }} aria-label={k}>
                          {k === 'right' ? '✓' : k === 'wrong' ? '✗' : '?'}
                        </span>
                        <span>{sentence(tokensOf(q, o))}</span>
                      </li>
                    )
                  })}
              </ul>
            )}
            <p className={s.small}>
              Chance a reply is right: <b style={{ color: 'var(--ink)' }}>{pct(pRight)}</b>
              {hist.length > 0 && (
                <>
                  {' '}
                  · asked {hist.length} time{hist.length === 1 ? '' : 's'}, right {hist.filter((i) => kindOf(q, opts[i]) === 'right').length}
                </>
              )}
            </p>
          </div>
        </div>

        <p className={s.subhead}>Sounding sure versus being right</p>
        <Plot x={[0.5, 1]} y={[0, 1]} width={480} height={270} minHeight={240} margin={{ left: 44, bottom: 40, top: 12, right: 14 }} ariaLabel="How fluent each question's reply is against how often it is true">
          <Grid xTicks={5} yTicks={5} />
          <Path points={[[0.5, 0], [0.5, 0.5], [1, 1], [1, 0]]} closed color="none" fill="color-mix(in srgb, var(--viz-neg) 9%, transparent)" width={0} />
          <Path points={[[0.5, 0.5], [1, 1]]} color="var(--viz-muted)" width={1.5} dash="5 4" />
          <Label x={0.515} y={0.2} dy={4} color="var(--viz-neg)" size={11.5}>
            below the line: overconfident
          </Label>
          <Label x={0.515} y={0.72} color="var(--viz-muted)" size={11.5}>
            honest line
          </Label>
          <Axes xLabel="how fluent the reply is (avg token probability)" yLabel="chance the reply is true" xTicks={5} yTicks={5} tickFormat={(v) => `${Math.round(v * 100)}%`} />
          {src &&
            pts.map(({ q: x, now, before }) =>
              Math.hypot(now[0] - before[0], now[1] - before[1]) > 0.03 ? <Arrow key={`a${x.id}`} from={before} to={now} color="var(--viz-3)" width={1.6} head={7} dash="4 3" /> : null,
            )}
          {src && <Dots points={pts.map(({ before, q: x }) => ({ x: before[0], y: before[1], hollow: true, color: QCOL[x.id], r: 4.5 }))} />}
          <Dots
            points={pts.map(({ now, q: x }) => ({
              x: now[0],
              y: now[1],
              color: QCOL[x.id],
              r: x.id === qid ? 8 : 5.5,
            }))}
          />
        </Plot>
        <div className={s.legend} aria-label="Legend">
          {QUESTIONS.map((x) => (
            <span key={x.id} style={{ fontWeight: x.id === qid ? 800 : 500, color: x.id === qid ? 'var(--ink)' : undefined }}>
              <span className={s.swatch} style={{ background: QCOL[x.id], borderRadius: '50%' }} />
              {SHORT[x.id]}
            </span>
          ))}
          {src && (
            <span>
              <span className={s.swatch} style={{ border: '2px solid var(--viz-muted)', borderRadius: '50%' }} />
              before the source
            </span>
          )}
        </div>
        <p className={s.note}>
          All three replies read fluently (average token probability {Math.round(Math.min(...pts.map((p) => p.now[0])) * 100)}% or more), but
          their heights differ hugely. A dot on the dashed line would be honest (as sure as it is right); a dot below it is{' '}
          <b>overconfident</b>.{' '}
          {src ? (
            <>
              With a source, every dot climbs up to the honest line: the evidence, not the fluency, made the replies true.
            </>
          ) : (
            <>
              The made-up prize gets a confident year {pct(1 - point(QUESTIONS[2], false)[1])} of the time. <M>{'\\text{Fluency} \\neq \\text{truth}'}</M>.
            </>
          )}
        </p>
      </div>
    </Figure>
  )
}
