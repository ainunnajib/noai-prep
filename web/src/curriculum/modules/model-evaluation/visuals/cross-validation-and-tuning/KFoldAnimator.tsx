import { useMemo, useState } from 'react'
import {
  Figure,
  Controls,
  Readout,
  Slider,
  Toggle,
  Button,
  usePlayer,
  PlayerControls,
  Plot,
  Axes,
  Rect,
  VLine,
  Label,
  Dots,
  mulberry32,
  useBump,
} from '../../../../../kit'
import { gauss, assignFolds, fitThreshold, countCorrect, mean, std } from './sim'
import s from './cv.module.css'

/*
  k-fold cross-validation on 40 students (hours of revision per week -> pass or fail; 10 fail).
  The model is a one-number rule, "pass if hours >= t", refitted on the training folds in every
  round. Each round one fold (orange) validates. The grid shows all k rounds; the dot plot shows
  the k validation scores with their mean and +/- 1 standard deviation.
  Aha: one split gives one noisy number; k-fold gives an average with error bars.
*/

const N = 40

// fixed dataset (same every visit): 10 fail (label 0) then 30 pass (label 1)
const DATA = (() => {
  const rng = mulberry32(7)
  const hours: number[] = []
  const label: number[] = []
  for (let i = 0; i < N; i++) {
    const pass = i >= 10 ? 1 : 0
    let h = pass ? 6.5 + 1.8 * gauss(rng) : 4 + 1.6 * gauss(rng)
    h = Math.max(0.5, Math.min(11.5, Math.round(h * 2) / 2))
    hours.push(h)
    label.push(pass)
  }
  return { hours, label }
})()

interface Round {
  t: number
  val: number[]
  correct: number
  score: number
}

const fmtH = (v: number) => String(Math.round(v * 100) / 100)

export default function KFoldAnimator() {
  const [k, setK] = useState(5)
  const [strat, setStrat] = useState(true)
  const [seed, bump] = useBump()
  const player = usePlayer({ steps: k, interval: 1300 })
  const r = Math.min(player.step, k - 1)

  const { rounds, fails } = useMemo(() => {
    const fold = assignFolds(DATA.label, k, strat, mulberry32(1000 + seed * 97 + k * 13 + (strat ? 1 : 0)))
    const rounds: Round[] = []
    const fails: number[] = []
    for (let f = 0; f < k; f++) {
      const tr = fold.map((g, i) => (g !== f ? i : -1)).filter((i) => i >= 0)
      const val = fold.map((g, i) => (g === f ? i : -1)).filter((i) => i >= 0)
      const t = fitThreshold(
        tr.map((i) => DATA.hours[i]),
        tr.map((i) => DATA.label[i]),
      )
      const correct = countCorrect(
        val.map((i) => DATA.hours[i]),
        val.map((i) => DATA.label[i]),
        t,
      )
      rounds.push({ t, val, correct, score: correct / val.length })
      fails.push(val.filter((i) => DATA.label[i] === 0).length)
    }
    return { rounds, fails }
  }, [k, strat, seed])

  const scores = rounds.map((x) => x.score)
  const m = mean(scores)
  const sd = std(scores)
  const cur = rounds[r]
  const nTrain = N - cur.val.length

  // dot plot: stack equal scores
  const lo = Math.min(0.5, Math.floor(Math.min(...scores) * 10) / 10)
  const seen = new Map<string, number>()
  const dots = scores.map((v, i) => {
    const key = v.toFixed(4)
    const h = seen.get(key) ?? 0
    seen.set(key, h + 1)
    return { x: v, y: 0.6 + h, i }
  })
  const top = Math.max(3.2, Math.max(...dots.map((d) => d.y)) + 1.6)

  const cols = `auto repeat(${k}, minmax(0, 1fr)) auto`

  return (
    <Figure
      title="k-fold cross-validation, round by round"
      caption={
        <>
          Each row is one round. The orange fold is held out for validation; the model ("pass if hours ≥ <i>t</i>") is refitted on the blue folds,
          then scored on the orange one. Press <b>Play</b> to watch the orange fold move along. Every student is validated exactly once. The dot plot
          collects the {k} scores: any <b>single</b> split would have reported just one of those dots, while the mean ± SD is far more stable. Raise{' '}
          <i>k</i> and the folds get smaller, so each score gets noisier. Switch stratification off and watch the pink "fails" counts (failing students in each fold) become uneven.
        </>
      }
    >
      <div className={s.wrap}>
        <Controls>
          <Slider label="number of folds k" value={k} min={2} max={10} step={1} onChange={(v) => { player.reset(); setK(v) }} />
          <Toggle label="stratified folds" checked={strat} onChange={setStrat} />
          <Button onClick={bump}>Reshuffle folds</Button>
        </Controls>

        <div className={s.foldGrid} style={{ gridTemplateColumns: cols }} role="group" aria-label={`${k}-fold cross-validation: ${k} rounds, each holding out a different fold`}>
          <span className={s.gridHead} style={{ textAlign: 'left' }}>
            fold
          </span>
          {Array.from({ length: k }, (_, f) => (
            <span key={`h${f}`} className={s.gridHead}>
              {f + 1}
            </span>
          ))}
          <span className={s.gridHead} style={{ textAlign: 'right' }}>
            score
          </span>

          <span className={s.gridHead} style={{ textAlign: 'left', color: 'var(--viz-4)' }}>
            fails
          </span>
          {fails.map((c, f) => (
            <span key={`f${f}`} className={s.failCount}>
              {c}
            </span>
          ))}
          <span />

          {rounds.map((row, i) => (
            <RoundRow key={i} i={i} k={k} active={i === r} score={row.score} onPick={() => player.setStep(i)} />
          ))}
        </div>

        <div className={s.legend}>
          <span>
            <span className={`${s.swatch} ${s.cellTrain}`} /> train on these folds
          </span>
          <span>
            <span className={`${s.swatch} ${s.cellVal}`} /> validate on this fold
          </span>
          <span>
            <span className={s.dot} style={{ width: 12, height: 12 }} /> pass
          </span>
          <span>
            <span className={`${s.dot} ${s.dotFail}`} style={{ width: 12, height: 12 }} /> fail
          </span>
        </div>

        <div className={s.detail} aria-live="polite">
          <div className={s.small}>
            <b>Round {r + 1}:</b> trained on {nTrain} students, the rule became <b>pass if hours ≥ {fmtH(cur.t)}</b>. On the {cur.val.length} held-out
            students it got{' '}
            <b>
              {cur.correct} of {cur.val.length}
            </b>{' '}
            right, a score of <b>{cur.score.toFixed(2)}</b>.
          </div>
          <div className={s.tokens} aria-label="validation students: hours, true result, and whether the rule got them right">
            {cur.val.map((i) => {
              const pred = DATA.hours[i] >= cur.t ? 1 : 0
              const ok = pred === DATA.label[i]
              return (
                <span key={i} className={s.token} title={`${DATA.hours[i]} h, ${DATA.label[i] ? 'pass' : 'fail'}`}>
                  <span className={`${s.dot} ${DATA.label[i] ? '' : s.dotFail}`} />
                  <span>{DATA.hours[i]}h</span>
                  <span className={`${s.mark} ${ok ? s.ok : s.bad}`}>{ok ? '✓' : '✗'}</span>
                </span>
              )
            })}
          </div>
        </div>

        <Plot x={[lo, 1.0]} y={[0, top]} width={520} height={140} minHeight={130} margin={{ left: 16, right: 18, top: 8, bottom: 42 }} ariaLabel={`The ${k} fold scores, mean ${m.toFixed(2)}, standard deviation ${sd.toFixed(2)}`}>
          <Rect x0={Math.max(lo, m - sd)} x1={Math.min(1, m + sd)} y0={0} y1={top} fill="color-mix(in srgb, var(--viz-5) 16%, transparent)" />
          <Axes xLabel="validation score" xTicks={6} hideYTicks />
          <VLine x={m} color="var(--viz-5)" dash="0" width={2.5} />
          <Label x={m} y={top} dy={14} dx={m > (lo + 1) / 2 ? -6 : 6} anchor={m > (lo + 1) / 2 ? 'end' : 'start'} color="var(--viz-5)">
            {`mean ${m.toFixed(2)} ± ${sd.toFixed(2)}`}
          </Label>
          <Dots
            points={dots.map((d) => ({
              x: d.x,
              y: d.y,
              r: d.i === r ? 8 : 6,
              color: d.i === r ? 'var(--viz-2)' : 'var(--viz-1)',
            }))}
          />
        </Plot>

        <PlayerControls player={player} label={(st) => `Round ${Math.min(st, k - 1) + 1} of ${k}`} />
        <Readout
          items={[
            ['rows per fold', `${Math.floor(N / k)}${N % k ? `–${Math.ceil(N / k)}` : ''}`],
            ['worst / best fold', `${Math.min(...scores).toFixed(2)} / ${Math.max(...scores).toFixed(2)}`],
            ['mean', m.toFixed(3)],
            ['SD', sd.toFixed(3)],
          ]}
        />
      </div>
    </Figure>
  )
}

function RoundRow({ i, k, active, score, onPick }: { i: number; k: number; active: boolean; score: number; onPick: () => void }) {
  return (
    <>
      <button type="button" className={s.rowHead} onClick={onPick} aria-label={`Show round ${i + 1}`} style={{ color: active ? 'var(--accent)' : undefined }}>
        R{i + 1}
      </button>
      {Array.from({ length: k }, (_, f) => (
        <span
          key={f}
          className={`${s.cell} ${f === i ? s.cellVal : s.cellTrain} ${active ? '' : s.dim}`}
          style={active ? { boxShadow: '0 0 0 2px color-mix(in srgb, var(--accent) 45%, transparent)' } : undefined}
        />
      ))}
      <span className={`${s.score} ${active ? '' : s.muted}`}>{score.toFixed(2)}</span>
    </>
  )
}
