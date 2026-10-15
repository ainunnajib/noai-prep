import { useState } from 'react'
import { Figure, Controls, Segmented } from '../../../../../kit'
import s from './gb.module.css'

/*
  Real scores from a small benchmark we ran on 14 Oct 2026 (scikit-learn 1.9.1, 5-fold cross-validation,
  standard settings, no tuning). Each bar is the mean over the 5 folds; the thin line spans ± one standard
  deviation.
    linear   = Ridge(alpha=1) (regression) or LogisticRegression (classification), standardised features
    forest   = RandomForest with 200 trees, other settings default
    boosting = HistGradientBoosting (scikit-learn's LightGBM-style booster), max_iter=300, other settings
               default (so its built-in early stopping is on for the two larger datasets)
    mlp      = MLP with hidden layers (256, 128) and early stopping, standardised features
  Forest cover uses a random sample of 20,000 of the 581,012 rows.
*/

type ModelKey = 'linear' | 'forest' | 'boost' | 'mlp'
type DataKey = 'california' | 'covtype' | 'diabetes'

const MODELS: { key: ModelKey; name: string; colour: string; good: string[]; bad: string[] }[] = [
  {
    key: 'linear',
    name: 'Linear model',
    colour: 'var(--viz-1)',
    good: ['Fast, and its coefficients are easy to explain', 'Hard to overfit; strong on small data or when the pattern really is close to a straight line'],
    bad: ['Cannot capture thresholds or interactions ("big flats are only expensive in central areas") unless you build those features yourself', 'Needs scaled features and encoded categories'],
  },
  {
    key: 'forest',
    name: 'Random forest',
    colour: 'var(--viz-3)',
    good: ['Strong out of the box with almost no tuning; trees are trained in parallel', 'Robust to outliers and useless features; free out-of-bag estimate'],
    bad: ['Usually a little behind well-tuned gradient boosting', 'Large models that are slower to predict with; cannot extrapolate beyond the training range'],
  },
  {
    key: 'boost',
    name: 'Gradient boosting',
    colour: 'var(--viz-2)',
    good: ['Usually the most accurate choice on tables of data', 'XGBoost, LightGBM and CatBoost add regularisation, fast histogram splits and native handling of missing values and categories'],
    bad: ['Trees are built one after another, and there are more knobs to tune (η, number of trees, depth)', 'Can overfit noisy labels; use early stopping on validation data'],
  },
  {
    key: 'mlp',
    name: 'Neural network (MLP)',
    colour: 'var(--viz-5)',
    good: ['Can learn almost any function given enough data; the right tool for images, text and audio', 'Easy to combine with learned embeddings'],
    bad: ['On medium-sized tables it is usually beaten by tree ensembles', 'Needs scaling, careful tuning and more compute; harder to interpret'],
  },
]

const DATA: Record<DataKey, { label: string; about: string; metric: string; scores: Record<ModelKey, [number, number]> }> = {
  california: {
    label: 'House prices',
    about: 'California housing: 20,640 districts, 8 numeric features (income, house age, rooms, location…), predict the median house value.',
    metric: 'R² (1 = perfect)',
    scores: { linear: [0.604, 0.008], forest: [0.81, 0.006], boost: [0.845, 0.005], mlp: [0.794, 0.005] },
  },
  covtype: {
    label: 'Forest cover',
    about: 'Forest cover type: 20,000 plots sampled from 581,012, 54 features (elevation, slope, soil type…), predict which of 7 tree species covers the plot.',
    metric: 'accuracy',
    scores: { linear: [0.724, 0.005], forest: [0.833, 0.005], boost: [0.785, 0.019], mlp: [0.803, 0.011] },
  },
  diabetes: {
    label: 'Small and simple',
    about: 'Diabetes progression: only 442 patients, 10 numeric features, predict a disease score a year later. Small, noisy and close to linear.',
    metric: 'R² (1 = perfect)',
    scores: { linear: [0.49, 0.091], forest: [0.427, 0.098], boost: [0.35, 0.162], mlp: [0.447, 0.106] },
  },
}

export default function TabularLeaderboard() {
  const [ds, setDs] = useState<DataKey>('california')
  const [sel, setSel] = useState<ModelKey>('boost')
  const d = DATA[ds]
  const best = (Object.keys(d.scores) as ModelKey[]).reduce((a, k) => (d.scores[k][0] > d.scores[a][0] ? k : a), 'linear' as ModelKey)
  const m = MODELS.find((x) => x.key === sel)!

  return (
    <Figure
      title="Which model wins on a table of data?"
      caption={
        <>
          Real scores we measured for four model families with standard settings and no tuning (5-fold cross-validation, scikit-learn). <b>Tap a
          bar</b> for that model's strengths and weaknesses, and switch datasets. On house prices, boosting wins. On forest cover, the random forest
          wins and boosting with untuned settings falls behind even the neural network: boosting has more knobs, and its defaults are not always
          right. On the tiny, nearly linear diabetes data the plain linear model wins. "The default to beat" does not mean "always wins": try
          several models and compare them on validation data.
        </>
      }
    >
      <p className={s.status}>{d.about}</p>
      <div style={{ width: '100%', display: 'grid', gap: 8 }} role="group" aria-label={`Scores on ${d.label}, measured as ${d.metric}`}>
        {MODELS.map((x) => {
          const [mean, sd] = d.scores[x.key]
          const active = x.key === sel
          return (
            <button
              key={x.key}
              type="button"
              onClick={() => setSel(x.key)}
              onMouseEnter={() => setSel(x.key)}
              onFocus={() => setSel(x.key)}
              aria-pressed={active}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
                gap: 3,
                width: '100%',
                textAlign: 'left',
                padding: '6px 8px',
                borderRadius: 8,
                border: `1.5px solid ${active ? x.colour : 'transparent'}`,
                background: active ? 'var(--surface-2)' : 'transparent',
                color: 'var(--ink)',
                font: 'inherit',
                cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 'var(--step--1)', fontWeight: 700 }}>
                <span>
                  {x.name}
                  {x.key === best && <span style={{ color: 'var(--ink-3)', fontWeight: 600 }}> · best here</span>}
                </span>
                <span className="tabular">
                  {mean.toFixed(3)} <span style={{ color: 'var(--ink-3)', fontWeight: 500 }}>± {sd.toFixed(3)}</span>
                </span>
              </span>
              <span style={{ position: 'relative', display: 'block', height: 16, borderRadius: 5, background: 'var(--surface-3)' }}>
                <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.max(0, mean) * 100}%`, borderRadius: 5, background: `color-mix(in srgb, ${x.colour} ${active ? 85 : 60}%, var(--surface))` }} />
                <span style={{ position: 'absolute', top: 7, height: 2, left: `${Math.max(0, mean - sd) * 100}%`, width: `${2 * sd * 100}%`, background: 'var(--viz-ink)' }} />
              </span>
            </button>
          )
        })}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-3)', padding: '0 8px' }} aria-hidden="true">
          <span>0</span>
          <span>{d.metric}</span>
          <span>1</span>
        </div>
      </div>
      <div className={s.card} style={{ width: '100%', borderColor: m.colour }}>
        <h4>{m.name}</h4>
        <div className={s.cards} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div>
            <b style={{ color: 'var(--viz-pos)' }}>Strengths</b>
            <ul>
              {m.good.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <b style={{ color: 'var(--viz-neg)' }}>Weaknesses</b>
            <ul>
              {m.bad.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Controls>
        <Segmented
          label="Dataset"
          value={ds}
          onChange={setDs}
          options={(Object.keys(DATA) as DataKey[]).map((k) => ({ value: k, label: DATA[k].label }))}
        />
      </Controls>
    </Figure>
  )
}
