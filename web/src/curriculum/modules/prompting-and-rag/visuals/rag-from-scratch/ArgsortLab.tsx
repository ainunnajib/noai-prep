import { useState } from 'react'
import { Figure, Controls, Segmented } from '../../../../../kit'
import { stableArgsortAsc } from './handbook'
import s from './rag.module.css'

/*
  Which line of NumPy really returns the top-k documents? Each idiom is run stage by stage on a
  real score array from the lesson (rounded to 3 d.p., exactly as Python prints them).
  Verified with numpy: for [0.333, 0.775, 0.183, 0.333], argsort -> [2 0 3 1],
  argsort(-s) -> [1 0 3 2], argsort()[::-1] -> [1 3 0 2].
*/

const PRESETS = [
  { key: 'lib', label: '“library open Friday”', scores: [1.0, 0.516, 0.548, 0.0] },
  { key: 'can', label: '“canteen open Monday” (a tie)', scores: [0.333, 0.775, 0.183, 0.333] },
  { key: 'hall', label: '“exam hall closed”', scores: [0.0, 0.258, 0.73, 0.667] },
] as const
type PresetKey = (typeof PRESETS)[number]['key']

interface Stage {
  code: string
  values: number[]
  /** are the entries document indices (true) or scores (false)? */
  isIndex: boolean
}

type IdiomKey = 'asc' | 'sortvals' | 'revcopy' | 'neg' | 'tail' | 'tailrev' | 'argmax'

const IDIOMS: { key: IdiomKey; code: (k: number) => string }[] = [
  { key: 'asc', code: (k) => `np.argsort(scores)[:${k}]` },
  { key: 'neg', code: (k) => `np.argsort(-scores)[:${k}]` },
  { key: 'revcopy', code: (k) => `np.argsort(scores)[::-1][:${k}]` },
  { key: 'tail', code: (k) => `scores.argsort()[-${k}:]` },
  { key: 'tailrev', code: (k) => `scores.argsort()[-${k}:][::-1]` },
  { key: 'sortvals', code: (k) => `np.sort(scores)[::-1][:${k}]` },
  { key: 'argmax', code: () => 'np.argmax(scores)' },
]

/** NumPy-style print of a 3-d.p. float: 1.0 -> "1.", 0.73 -> "0.73", -0.0 -> "-0." */
const fmt = (v: number) => {
  const t = v.toFixed(3).replace(/0+$/, '')
  return Object.is(v, -0) ? '-0.' : t
}

function run(key: IdiomKey, sc: number[], k: number): Stage[] {
  const asc = stableArgsortAsc(sc)
  const neg = stableArgsortAsc(sc.map((v) => -v))
  switch (key) {
    case 'asc':
      return [
        { code: 'np.argsort(scores)', values: asc, isIndex: true },
        { code: `[:${k}]`, values: asc.slice(0, k), isIndex: true },
      ]
    case 'neg':
      return [
        { code: '-scores', values: sc.map((v) => -v), isIndex: false },
        { code: 'np.argsort(-scores)', values: neg, isIndex: true },
        { code: `[:${k}]`, values: neg.slice(0, k), isIndex: true },
      ]
    case 'revcopy': {
      const r = [...asc].reverse()
      return [
        { code: 'np.argsort(scores)', values: asc, isIndex: true },
        { code: '[::-1]', values: r, isIndex: true },
        { code: `[:${k}]`, values: r.slice(0, k), isIndex: true },
      ]
    }
    case 'tail':
      return [
        { code: 'scores.argsort()', values: asc, isIndex: true },
        { code: `[-${k}:]`, values: asc.slice(asc.length - k), isIndex: true },
      ]
    case 'tailrev': {
      const t = asc.slice(asc.length - k)
      return [
        { code: 'scores.argsort()', values: asc, isIndex: true },
        { code: `[-${k}:]`, values: t, isIndex: true },
        { code: '[::-1]', values: [...t].reverse(), isIndex: true },
      ]
    }
    case 'sortvals': {
      const v = [...sc].sort((a, b) => a - b)
      const r = [...v].reverse()
      return [
        { code: 'np.sort(scores)', values: v, isIndex: false },
        { code: '[::-1]', values: r, isIndex: false },
        { code: `[:${k}]`, values: r.slice(0, k), isIndex: false },
      ]
    }
    case 'argmax': {
      let best = 0
      sc.forEach((v, i) => {
        if (v > sc[best]) best = i
      })
      return [{ code: 'np.argmax(scores)', values: [best], isIndex: true }]
    }
  }
}

export default function ArgsortLab() {
  const [preset, setPreset] = useState<PresetKey>('can')
  const [idiom, setIdiom] = useState<IdiomKey>('asc')
  const [k, setK] = useState(2)
  const sc = [...PRESETS.find((p) => p.key === preset)!.scores]
  const stages = run(idiom, sc, k)
  const final = stages[stages.length - 1]
  const reference = stableArgsortAsc(sc.map((v) => -v)).slice(0, k)
  const finalIdx = final.isIndex ? final.values : []
  const picked = new Set(finalIdx)

  // verdict
  let ok = false
  let text = ''
  if (!final.isIndex) {
    text = `${k === 1 ? 'This is the top score itself, not the document it belongs to' : `These are the top ${k} scores themselves, not the documents they belong to`}. You cannot look up a document from the score ${Number(final.values[0].toFixed(3))}. Use argsort, which returns positions.`
  } else if (idiom === 'argmax' && k > 1) {
    text = `np.argmax returns a single position (the best document), so it cannot give a top-${k} list. It is the right tool only when k = 1.`
  } else {
    const n = finalIdx.length === reference.length
    const sameOrder = n && finalIdx.every((v, i) => sc[v] === sc[reference[i]])
    // compare the SCORES picked, not the indices: with a tie, two different documents can be equally right
    const byScore = (idx: number[]) => idx.map((i) => sc[i]).sort((a, b) => a - b).join()
    const sameScores = n && byScore(finalIdx) === byScore(reference)
    const lowest = stableArgsortAsc(sc).slice(0, k)
    const isLowest = n && byScore(finalIdx) === byScore(lowest)
    const extra = finalIdx.filter((i) => !reference.includes(i))
    const missing = reference.filter((i) => !finalIdx.includes(i))
    const tieNote =
      extra.length === 1 && missing.length === 1 ? ` (and the tie at ${fmt(sc[extra[0]])} went to d${extra[0]} rather than d${missing[0]})` : ''
    if (sameOrder && finalIdx.join() === reference.join()) {
      ok = true
      text = `Correct: the ${k === 1 ? 'best document' : `${k} best documents, best first`}.`
    } else if (sameOrder) {
      ok = true
      text = `Correct ranking by score. The tie is broken the other way, though: reversing a stable ascending sort puts the higher index first${tieNote}. Fine for retrieval, but it can disagree with an expected output.`
    } else if (sameScores) {
      text = `These are the top ${k} scores, but worst first${tieNote}. Reverse with [::-1] so the best document comes first.`
    } else if (isLowest) {
      text = `Wrong documents. argsort sorts from smallest to largest, so this picks the ${k === 1 ? 'lowest score' : `${k} lowest scores`}.`
    } else {
      text = `Wrong documents: these are not the ${k === 1 ? 'highest score' : `${k} highest scores`}.`
    }
  }

  return (
    <Figure
      title="Which line really returns the top-k documents?"
      caption={
        <>
          Blue cells are <b>document numbers</b> (positions), with that document's score underneath; grey cells are scores. Notice that <code>argsort</code> always sorts
          from smallest to largest, so on its own it finds the <i>worst</i> documents, and that ties (d0 and d3 both score 0.333) can be broken either way.
        </>
      }
    >
      <p className={s.tryLine}>
        <b>Try:</b> click each line of NumPy below and follow it stage by stage, first with k = 2, then with k = 1.
      </p>
      <div className={s.field}>
        <span className={s.sectionLabel}>scores from the query</span>
        <div className={s.chips} role="radiogroup" aria-label="Scores from the query">
          {PRESETS.map((p) => (
            <button key={p.key} type="button" role="radio" aria-checked={preset === p.key} className={`${s.chip} ${preset === p.key ? s.chipOn : ''}`} onClick={() => setPreset(p.key)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <Controls>
        <Segmented label="k" value={k} onChange={setK} options={[1, 2, 3].map((v) => ({ value: v, label: String(v) }))} />
      </Controls>
      <div className={s.idioms} role="radiogroup" aria-label="NumPy line to test">
        {IDIOMS.map((d) => (
          <button key={d.key} type="button" role="radio" aria-checked={idiom === d.key} className={`${s.idiom} ${idiom === d.key ? s.idiomOn : ''}`} onClick={() => setIdiom(d.key)}>
            {d.code(k)}
          </button>
        ))}
      </div>
      <div className={s.stack}>
        <ArrRow label="scores" values={sc} isIndex={false} sc={sc} picked={picked} showDocs />
        {stages.map((st, i) => (
          <ArrRow key={i} label={st.code} values={st.values} isIndex={st.isIndex} sc={sc} picked={picked} final={i === stages.length - 1} />
        ))}
      </div>
      <div className={`${s.verdict} ${ok ? s.verdictOk : s.verdictBad}`} role="status">
        <span className={s.verdictIcon} aria-hidden="true">
          {ok ? '✓' : '✗'}
        </span>
        <span>
          {final.isIndex ? (
            <>
              Returns {finalIdx.length === 1 && idiom === 'argmax' ? finalIdx[0] : `[${finalIdx.join(' ')}]`} → {finalIdx.map((i) => `d${i}`).join(', ')}.{' '}
            </>
          ) : (
            <>Returns [{final.values.map(fmt).join(' ')}]. </>
          )}
          {text}
        </span>
      </div>
    </Figure>
  )
}

function ArrRow({
  label,
  values,
  isIndex,
  sc,
  picked,
  final,
  showDocs,
}: {
  label: string
  values: number[]
  isIndex: boolean
  sc: number[]
  picked: Set<number>
  final?: boolean
  showDocs?: boolean
}) {
  return (
    <div className={s.arrRow}>
      <span className={s.arrLabel}>{label}</span>
      <span className={s.arr}>
        {values.map((v, i) => {
          const style = isIndex ? { background: 'color-mix(in srgb, var(--viz-1) 22%, var(--surface))' } : undefined
          return (
            <span key={i} className={`${s.arrCell} ${final ? s.arrPicked : ''}`} style={style}>
              {isIndex ? v : fmt(v)}
              <span className={s.arrSub}>{isIndex ? fmt(sc[v]) : showDocs ? `d${i}${picked.has(i) ? ' ✓' : ''}` : ' '}</span>
            </span>
          )
        })}
      </span>
    </div>
  )
}
