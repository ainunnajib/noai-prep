import { useState, type ReactNode } from 'react'
import { Figure, Button, Toggle } from '../../../../../kit'
import s from './clean.module.css'
import { CSV_TEXT, RAW, fmtFloatColumn, fmtSeries } from './data'

/*
  A messy CSV (prices stored as text with commas, an 'unknown' area, a duplicated row) goes
  through a three-step cleaning recipe. Step through it, skip steps or pick a wrong fix, and
  watch df.dtypes, df.shape and five sanity checks (max, mean, cheapest flat, duplicates)
  update. Every result and error message below was checked against pandas 2.2.
*/

type PriceFix = 'replace' | 'astype' | 'coerce'
type AreaFix = 'coerce' | 'astype'

interface Row {
  town: string
  area: string | number | null
  price: string | number | null
  /** original row label */
  label: number
}

interface State {
  rows: Row[]
  areaType: 'object' | 'float64'
  priceType: 'object' | 'int64' | 'float64'
  log: { step: number; ok: boolean; msg: string }[]
}

const PRICE_CODE: Record<PriceFix, string> = {
  replace: "df['price'] = df['price'].str.replace(',', '').astype(int)",
  astype: "df['price'] = df['price'].astype(int)",
  coerce: "df['price'] = pd.to_numeric(df['price'], errors='coerce')",
}
const AREA_CODE: Record<AreaFix, string> = {
  coerce: "df['area'] = pd.to_numeric(df['area'], errors='coerce')",
  astype: "df['area'] = df['area'].astype(float)",
}

function run(upTo: number, on: boolean[], pf: PriceFix, af: AreaFix): State {
  let rows: Row[] = RAW.map((r, i) => ({ ...r, label: i }))
  let areaType: State['areaType'] = 'object'
  let priceType: State['priceType'] = 'object'
  const log: State['log'] = []
  // step 1: price
  if (upTo >= 1 && on[0]) {
    if (pf === 'replace') {
      rows = rows.map((r) => ({ ...r, price: Number(String(r.price).replace(/,/g, '')) }))
      priceType = 'int64'
      log.push({ step: 1, ok: true, msg: 'price is now int64' })
    } else if (pf === 'astype') {
      log.push({ step: 1, ok: false, msg: "ValueError: invalid literal for int() with base 10: '585,000'" })
    } else {
      rows = rows.map((r) => ({ ...r, price: null }))
      priceType = 'float64'
      log.push({ step: 1, ok: false, msg: 'No error, but every price became NaN: "585,000" is not a number until the commas go' })
    }
  }
  // step 2: area
  if (upTo >= 2 && on[1]) {
    if (af === 'coerce') {
      rows = rows.map((r) => ({ ...r, area: r.area === 'unknown' ? null : Number(r.area) }))
      areaType = 'float64'
      log.push({ step: 2, ok: true, msg: "'unknown' became NaN; area is now float64" })
    } else {
      log.push({ step: 2, ok: false, msg: "ValueError: could not convert string to float: 'unknown'" })
    }
  }
  // step 3: duplicates (NaN counts as equal to NaN here, as in pandas)
  if (upTo >= 3 && on[2]) {
    const seen = new Set<string>()
    rows = rows.filter((r) => {
      const k = JSON.stringify([r.town, r.area, r.price])
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    log.push({ step: 3, ok: true, msg: `${RAW.length - rows.length} duplicate row removed` })
  }
  return { rows, areaType, priceType, log }
}

type Verdict = 'ok' | 'bad' | 'warn'
interface Check {
  code: string
  out: string
  v: Verdict
  why: ReactNode
}

const cut = (t: string, n = 26) => (t.length > n ? t.slice(0, n) + '…' : t)
const pyNum = (x: number, isInt: boolean) => (isInt ? String(x) : Number.isInteger(x) ? x.toFixed(1) : String(x))

function checks(st: State): Check[] {
  const { rows, priceType, areaType } = st
  const out: Check[] = []
  const dupCount = rows.length - new Set(rows.map((r) => JSON.stringify([r.town, r.area, r.price]))).size
  const hasDup = dupCount > 0

  // 1. max price
  if (priceType === 'object') {
    const mx = (rows.map((r) => r.price as string)).reduce((a, b) => (b > a ? b : a))
    out.push({ code: "df['price'].max()", out: `'${mx}'`, v: 'bad', why: <>Text is compared letter by letter, and "7" beats "1", so the S$1,050,000 flat loses.</> })
  } else if (priceType === 'float64') {
    out.push({ code: "df['price'].max()", out: 'nan', v: 'bad', why: <>Every price is NaN, so there is nothing to compare.</> })
  } else {
    const mx = Math.max(...rows.map((r) => r.price as number))
    out.push({ code: "df['price'].max()", out: String(mx), v: 'ok', why: <>A real number: the Bishan flat.</> })
  }

  // 2. mean price
  if (priceType === 'object') {
    out.push({ code: "df['price'].mean()", out: `TypeError: Could not convert string '${cut(rows.map((r) => r.price).join(''))}' to numeric`, v: 'bad', why: <>pandas glued the text together before giving up: you cannot average text.</> })
  } else if (priceType === 'float64') {
    out.push({ code: "df['price'].mean()", out: 'nan', v: 'bad', why: <>No error message, just a silent nan. This is the dangerous one.</> })
  } else {
    const m = rows.reduce((a, r) => a + (r.price as number), 0) / rows.length
    out.push({
      code: "df['price'].mean()",
      out: pyNum(m, false),
      v: hasDup ? 'warn' : 'ok',
      why: hasDup ? <>Runs, but the duplicated Bedok flat is counted twice and drags the mean down.</> : <>Five different flats, each counted once.</>,
    })
  }

  // 3. mean area
  if (areaType === 'object') {
    out.push({ code: "df['area'].mean()", out: `TypeError: Could not convert string '${cut(rows.map((r) => r.area).join(''))}' to numeric`, v: 'bad', why: <>One word, 'unknown', made the whole column text.</> })
  } else {
    const v = rows.map((r) => r.area).filter((x): x is number => typeof x === 'number')
    const m = v.reduce((a, b) => a + b, 0) / v.length
    out.push({ code: "df['area'].mean()", out: pyNum(m, false), v: hasDup ? 'warn' : 'ok', why: hasDup ? <>Skips the NaN, but counts the duplicate twice.</> : <>The mean of the 4 known areas (NaN is skipped).</> })
  }

  // 4. cheapest flat
  const sorted = [...rows].sort((a, b) => {
    if (priceType === 'object') return (a.price as string) < (b.price as string) ? -1 : (a.price as string) > (b.price as string) ? 1 : 0
    if (priceType === 'float64') return 0
    return (a.price as number) - (b.price as number)
  })
  const cheapest = sorted[0].town
  out.push({
    code: "df.sort_values('price').iloc[0]['town']",
    out: `'${cheapest}'`,
    v: priceType === 'int64' ? 'ok' : 'bad',
    why:
      priceType === 'object' ? (
        <>Sorted as text, "1,050,000" comes first, so the most expensive flat looks cheapest.</>
      ) : priceType === 'float64' ? (
        <>With every price NaN the sort does nothing, so this is just the first row.</>
      ) : (
        <>Sorted as numbers: Bedok at 398000.</>
      ),
  })

  // 5. duplicates
  out.push({
    code: 'df.duplicated().sum()',
    out: String(dupCount),
    v: hasDup ? 'warn' : 'ok',
    why: hasDup ? <>Row 3 is an exact copy of row 1: one flat listed twice.</> : <>No repeated rows left.</>,
  })
  return out
}

export default function DtypeDoctor() {
  const [step, setStep] = useState(0)
  const [on, setOn] = useState([true, true, true])
  const [pf, setPf] = useState<PriceFix>('replace')
  const [af, setAf] = useState<AreaFix>('coerce')
  const st = run(step, on, pf, af)
  const ch = checks(st)

  const priceShown = st.priceType === 'int64' ? st.rows.map((r) => String(r.price)) : st.priceType === 'float64' ? st.rows.map(() => 'NaN') : st.rows.map((r) => `'${r.price}'`)
  const areaShown = st.areaType === 'float64' ? fmtFloatColumn(st.rows.map((r) => r.area as number | null)) : st.rows.map((r) => `'${r.area}'`)
  const dtypes = fmtSeries(['town', 'area', 'price'], ['object', st.areaType, st.priceType], 'dtype: object')
  const keptLabels = new Set(st.rows.map((r) => r.label))

  const steps: { title: string; code: ReactNode; choose?: ReactNode }[] = [
    {
      title: 'Fix the prices',
      code: PRICE_CODE[pf],
      choose: (
        <select aria-label="How to convert price" value={pf} onChange={(e) => setPf(e.target.value as PriceFix)}>
          <option value="replace">remove commas, then astype(int)</option>
          <option value="astype">astype(int) straight away</option>
          <option value="coerce">pd.to_numeric(errors='coerce')</option>
        </select>
      ),
    },
    {
      title: "Fix the area ('unknown')",
      code: AREA_CODE[af],
      choose: (
        <select aria-label="How to convert area" value={af} onChange={(e) => setAf(e.target.value as AreaFix)}>
          <option value="coerce">pd.to_numeric(errors='coerce')</option>
          <option value="astype">astype(float)</option>
        </select>
      ),
    },
    { title: 'Remove repeated rows', code: 'df = df.drop_duplicates()' },
  ]

  const icon = (v: Verdict) => (v === 'ok' ? '✓' : v === 'bad' ? '✗' : '!')

  return (
    <Figure
      title="Clean the types, then the duplicates"
      caption={
        <>
          Press <strong>Next step</strong> to run the recipe one line at a time, and watch <code>df.dtypes</code> and the
          checks underneath. Then go back, switch a step off or pick a wrong fix: a skipped step shows up later as an error,
          a silent <code>nan</code> or, worst of all, a believable wrong answer.
        </>
      }
    >
      <div className={s.stack}>
        <div className={s.ioLabel}>flats.csv</div>
        <pre className={s.csv}>{CSV_TEXT}</pre>
        <div className={s.recipe}>
          <div className={`${s.rstep} ${s.rstepDone}${step === 0 ? ` ${s.rstepCur}` : ''}`}>
            <span className={s.rstepNum}>0</span>
            <div className={s.rstepBody}>
              <div className={s.rstepTitle}>Read the file</div>
              <div className={s.rstepCode}>df = pd.read_csv('flats.csv')</div>
            </div>
          </div>
          {steps.map((x, k) => {
            const n = k + 1
            const done = step >= n
            const skipped = !on[k]
            const entry = st.log.find((l) => l.step === n)
            return (
              <div key={n} className={`${s.rstep}${done && !skipped ? ` ${s.rstepDone}` : ''}${step === n ? ` ${s.rstepCur}` : ''}${!done ? ` ${s.rstepTodo}` : ''}${skipped ? ` ${s.rstepSkipped}` : ''}`}>
                <span className={s.rstepNum}>{n}</span>
                <div className={s.rstepBody}>
                  <div className={s.rstepTitle}>
                    <span>{x.title}</span>
                    <Toggle label={skipped ? 'skipped' : 'run it'} checked={!skipped} onChange={(v) => setOn((o) => o.map((b, j) => (j === k ? v : b)))} />
                  </div>
                  {x.choose}
                  <div className={s.rstepCode}>{x.code}</div>
                  {done && entry && <div className={`${s.rstepMsg} ${entry.ok ? s.ok : s.bad}`}>{entry.ok ? '✓ ' : '✗ '}{entry.msg}</div>}
                </div>
              </div>
            )
          })}
        </div>
        <div className={s.exprRow} style={{ justifyContent: 'center' }}>
          <Button onClick={() => setStep((p) => Math.max(0, p - 1))} disabled={step === 0}>
            Back
          </Button>
          <Button primary onClick={() => setStep((p) => Math.min(3, p + 1))} disabled={step === 3}>
            Next step
          </Button>
          <span className={s.hint} style={{ width: 'auto' }}>
            after step {step} of 3
          </span>
        </div>
        <div className={s.twoUp}>
          <div className={s.scroll}>
            <table className={`${s.table} ${s.compact}`} aria-label="The DataFrame after the steps so far">
              <thead>
                <tr>
                  <th className={s.corner} />
                  <th>town</th>
                  <th>area</th>
                  <th>price</th>
                </tr>
              </thead>
              <tbody>
                {RAW.map((_, i) => {
                  const j = st.rows.findIndex((r) => r.label === i)
                  if (j < 0) {
                    return (
                      <tr key={i} className={`${s.faded} ${s.strike}`}>
                        <th scope="row">{i}</th>
                        <td>{RAW[i].town}</td>
                        <td colSpan={2} style={{ textAlign: 'center' }}>
                          duplicate, dropped
                        </td>
                      </tr>
                    )
                  }
                  return (
                    <tr key={i}>
                      <th scope="row">{i}</th>
                      <td>{st.rows[j].town}</td>
                      <td className={st.areaType === 'object' ? s.textVal : st.rows[j].area === null ? s.missing : undefined}>{areaShown[j]}</td>
                      <td className={st.priceType === 'object' ? s.textVal : st.rows[j].price === null ? s.missing : undefined}>{priceShown[j]}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className={s.io}>
            <div className={s.ioLabel}>df.dtypes</div>
            <pre className={s.out}>{dtypes.join('\n')}</pre>
            <div className={s.ioLabel}>df.shape</div>
            <pre className={s.out}>{`(${keptLabels.size}, 3)`}</pre>
          </div>
        </div>
        <div className={s.ioLabel}>sanity checks</div>
        <div className={s.checks} aria-live="polite">
          {ch.map((c) => (
            <div key={c.code} className={s.check}>
              <span className={`${s.checkIcon} ${s[c.v]}`} aria-label={c.v === 'ok' ? 'correct' : c.v === 'bad' ? 'wrong' : 'misleading'}>
                {icon(c.v)}
              </span>
              <span>
                <span className={s.checkCode}>{c.code}</span> → <span className={`${s.checkOut} ${s[c.v]}`}>{c.out}</span>
              </span>
              <span className={s.checkWhy}>{c.why}</span>
            </div>
          ))}
        </div>
      </div>
    </Figure>
  )
}
