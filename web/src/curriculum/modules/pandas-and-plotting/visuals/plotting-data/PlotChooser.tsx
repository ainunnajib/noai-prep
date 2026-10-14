import { useState } from 'react'
import { Figure, Button } from '../../../../../kit'
import { Chart, FRIENDLY, defaultTitle, yLabelFor, type Kind, type Spec } from './charts'
import s from './pc.module.css'

/*
  Five questions about the same 144 HDB resale flats, five plot types. Pick the plot that answers
  the question; a wrong pick explains what that plot can and cannot show, a right pick opens the
  full plot with its matplotlib code.
*/

interface PlotInfo {
  name: string
  spec: Spec
  shows: string
  code: string[]
}

const PLOTS: Record<Kind, PlotInfo> = {
  hist: {
    name: 'Histogram',
    spec: { kind: 'hist', x: 'price', y: 'count', hue: null, bins: 12 },
    shows: 'shows how one numeric column is spread out: each bar counts the flats in one price range',
    code: ["ax.hist(df['price'], bins=12)"],
  },
  scatter: {
    name: 'Scatter',
    spec: { kind: 'scatter', x: 'area', y: 'price', hue: null, bins: 12 },
    shows: 'puts two numeric columns against each other, one dot per flat',
    code: ["ax.scatter(df['area'], df['price'])"],
  },
  line: {
    name: 'Line',
    spec: { kind: 'line', x: 'year', y: 'price', hue: null, bins: 12 },
    shows: 'joins one value per time step in order, so it shows change over time',
    code: ["med = df.groupby('year')['price'].median()", "ax.plot(med.index, med.values, marker='o')"],
  },
  bar: {
    name: 'Bar',
    spec: { kind: 'bar', x: 'town', y: 'price', hue: null, bins: 12 },
    shows: 'compares one number per category (here the average price of each town)',
    code: ["avg = df.groupby('town')['price'].mean()", 'ax.bar(avg.index, avg.values)'],
  },
  box: {
    name: 'Box',
    spec: { kind: 'box', x: 'flat_type', y: 'price', hue: null, bins: 12 },
    shows: 'summarises the spread inside each category: median, middle half and outliers',
    code: ["sns.boxplot(data=df, x='flat_type', y='price', ax=ax)   # seaborn"],
  },
}
const ORDER: Kind[] = ['hist', 'scatter', 'line', 'bar', 'box']

const QUESTIONS: { q: string; answer: Kind; need: string; why: string }[] = [
  {
    q: 'Do bigger flats cost more?',
    answer: 'scatter',
    need: 'two numeric columns for every flat, area and price, to see whether one rises with the other',
    why: 'Each dot is one flat: across is its floor area, up is its price. The cloud slopes upwards, so bigger flats tend to cost more. The spread around that trend is the other factors, mostly the town.',
  },
  {
    q: 'Are most resale prices low, high or in between? How spread out are they?',
    answer: 'hist',
    need: 'the shape of one numeric column: how many flats fall into each price range',
    why: 'The tallest bars sit between about $340k and $630k, and a long tail stretches to the right: a few flats cost far more than the rest. A tail like this is called right skew.',
  },
  {
    q: 'How has the typical resale price changed from 2017 to 2024?',
    answer: 'line',
    need: 'one value per year, joined up in time order',
    why: 'One point per year, joined in order, so your eye follows the trend: roughly flat until 2020, then rising every year.',
  },
  {
    q: 'Which town has the highest average price?',
    answer: 'bar',
    need: 'one number (an average) for each town, side by side so the heights can be compared',
    why: 'One bar per category; bar charts start at zero so heights can be compared fairly. Bishan is clearly the most expensive of the three.',
  },
  {
    q: 'How do prices differ between flat types, and are there any unusual flats?',
    answer: 'box',
    need: 'the spread of prices inside each category, with unusual values marked',
    why: 'Each box holds the middle half of a flat type’s prices and the line inside is its median. 5-room flats cost the most, and each circle is a flat priced unusually high for its type, such as the 5-room flat that sold for over a million dollars.',
  },
]

export default function PlotChooser() {
  const [qi, setQi] = useState(0)
  const [tries, setTries] = useState<Kind[][]>(QUESTIONS.map(() => []))
  const Q = QUESTIONS[qi]
  const mine = tries[qi]
  const solved = mine.includes(Q.answer)
  const last = mine[mine.length - 1]
  const firstTime = tries.filter((t, i) => t[0] === QUESTIONS[i].answer).length
  const answered = tries.filter((t, i) => t.includes(QUESTIONS[i].answer)).length

  const pick = (k: Kind) => {
    if (solved) return
    setTries((t) => t.map((x, i) => (i === qi ? [...x, k] : x)))
  }
  const P = PLOTS[Q.answer]

  return (
    <Figure
      title="Which plot answers the question?"
      caption={
        <>
          All five thumbnails show the <i>same</i> 144 flats. Read the question, then tap the plot that answers it. Notice that the question decides the plot:
          relationship → scatter, distribution → histogram (or box plot), change over time → line, comparing categories → bar.
        </>
      }
    >
      <div className={s.question} aria-live="polite">
        <div className={s.qEyebrow}>
          Question {qi + 1} of {QUESTIONS.length}
        </div>
        <div className={s.qText}>{Q.q}</div>
      </div>

      <div className={s.thumbs} role="group" aria-label="Plot types">
        {ORDER.map((k) => {
          const tried = mine.includes(k)
          const cls = tried ? (k === Q.answer ? s.thumbRight : s.thumbWrong) : ''
          return (
            <button key={k} type="button" className={`${s.thumb} ${cls}`} onClick={() => pick(k)} aria-pressed={tried} aria-label={`${PLOTS[k].name} plot`}>
              <Chart spec={PLOTS[k].spec} thumb width={200} height={140} ariaLabel={`Thumbnail of a ${PLOTS[k].name.toLowerCase()} plot`} />
              <span className={s.thumbName}>{PLOTS[k].name}</span>
            </button>
          )
        })}
      </div>

      {!last && <div className={`${s.feedback} ${s.neutral}`}>Tap the plot you would draw to answer this question.</div>}
      {last && !solved && (
        <div className={`${s.feedback} ${s.bad}`} aria-live="polite">
          <b>Not this one.</b> A {PLOTS[last].name.toLowerCase()} plot {PLOTS[last].shows}. This question needs {Q.need}.
        </div>
      )}
      {solved && (
        <>
          <div className={`${s.feedback} ${s.good}`} aria-live="polite">
            <b>Yes: a {P.name.toLowerCase()} plot.</b> {Q.why}
          </div>
          <Chart
            spec={P.spec}
            width={520}
            height={300}
            maxWidth={620}
            minHeight={250}
            title={defaultTitle(P.spec)}
            xlabel={FRIENDLY[P.spec.x]}
            ylabel={yLabelFor(P.spec)}
            ariaLabel={`${P.name} plot answering: ${Q.q}`}
          />
          <pre className={s.code}>
            {[
              'fig, ax = plt.subplots()',
              ...P.code,
              `ax.set_xlabel('${FRIENDLY[P.spec.x]}')`,
              `ax.set_ylabel('${yLabelFor(P.spec)}')`,
              `ax.set_title('${defaultTitle(P.spec)}')`,
              'plt.show()',
            ].map((line, i) => (
              <span key={i} className={s.codeLine}>
                {line}
              </span>
            ))}
          </pre>
        </>
      )}

      <div className={s.row}>
        <span className={s.score}>
          Answered {answered} of {QUESTIONS.length} · right first time: {firstTime}
        </span>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Button onClick={() => setQi((qi + QUESTIONS.length - 1) % QUESTIONS.length)}>Previous</Button>
          <Button primary={solved} onClick={() => setQi((qi + 1) % QUESTIONS.length)}>
            Next question
          </Button>
        </div>
      </div>
    </Figure>
  )
}
