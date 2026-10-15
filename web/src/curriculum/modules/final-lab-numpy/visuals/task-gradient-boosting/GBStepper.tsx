import { useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, Button, Plot, Grid, Axes, Path, Dots, HLine, useNarrow } from '../../../../../kit'
import { boost, predictAt, treePredict, mse, mae, TOY_X, TOY_Y, type Loss, type Tree } from './gb'
import { Py } from './code'
import s from './gb.module.css'

/*
  The Q1.6a fit loop, one TODO step at a time, on 24 points. Top: the data and the model F(x).
  Bottom: this round's negative gradient (the tree's targets) and the tree fitted to it. Right: the
  loop's code with the current step highlighted.
*/

const MAX = 60
const X_DOM: [number, number] = [0, 10]

const CODE: { tag: string; code: string }[] = [
  { tag: '', code: 'for m in range(self.n_estimators):' },
  { tag: 'a', code: '    residuals = self._compute_negative_gradient(y, current_pred)' },
  { tag: 'b', code: '    indices = self._subsample_indices(n_samples, rng)' },
  { tag: 'c', code: '    tree = DecisionTreeRegressor(max_depth=self.max_depth, ...)' },
  { tag: 'c', code: '    tree.fit(X[indices], residuals[indices])' },
  { tag: 'd', code: '    current_pred += self.learning_rate * tree.predict(X)' },
  { tag: 'e', code: '    self.trees.append(tree)' },
  { tag: '', code: 'return self' },
]
const TAGS = ['a', 'b', 'c', 'd', 'e']

/** Exact staircase of F_m(x) = F0 + lr * (sum of the first m trees) across the x-domain. */
function staircase(cutsOf: Tree[], f: (x: number) => number): [number, number][] {
  const cuts = [...new Set(cutsOf.flatMap((t) => t.cuts))].filter((c) => c > X_DOM[0] && c < X_DOM[1]).sort((a, b) => a - b)
  const edges = [X_DOM[0], ...cuts, X_DOM[1]]
  const pts: [number, number][] = []
  for (let i = 0; i < edges.length - 1; i++) {
    const v = f((edges[i] + edges[i + 1]) / 2)
    pts.push([edges[i], v], [edges[i + 1], v])
  }
  return pts
}

const f2 = (v: number) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2)

export default function GBStepper() {
  const [loss, setLoss] = useState<Loss>('l2')
  const [lr, setLr] = useState(0.3)
  const [subsample, setSubsample] = useState(1)
  const [depth, setDepth] = useState(2)
  const [k, setK] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(700)

  const run = useMemo(() => boost({ loss, lr, depth, subsample, nRounds: MAX, seed: 7 }), [loss, lr, depth, subsample])
  const last = MAX * 5
  const t = k === 0 ? 0 : Math.ceil(k / 5) // tree being built (1-based)
  const sub = k === 0 ? -1 : (k - 1) % 5 // 0..4 = steps a..e
  const round = t > 0 ? run.rounds[t - 1] : null
  const treesDone = k === 0 ? 0 : sub === 4 ? t : t - 1
  const updated = sub >= 3 // step d has moved current_pred
  const mShown = t === 0 ? 0 : updated ? t : t - 1
  const nextTreeEnd = (kk: number) => Math.min(last, kk % 5 === 0 && kk > 0 ? kk + 5 : Math.ceil(Math.max(kk, 1) / 5) * 5)

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setK((kk) => {
        if (kk >= last) {
          setPlaying(false)
          return kk
        }
        return nextTreeEnd(kk)
      })
    }, 650)
    return () => window.clearInterval(id)
  }, [playing, last])

  const trees = run.rounds.map((r) => r.tree)
  const Fnow = (x: number) => predictAt(run, mShown, lr, x)
  const Fprev = (x: number) => predictAt(run, Math.max(0, mShown - 1), lr, x)
  const stairNow = staircase(trees.slice(0, mShown), Fnow)
  const stairPrev = staircase(trees.slice(0, Math.max(0, mShown - 1)), Fprev)
  const Fpts = round ? (updated ? round.after : round.before) : TOY_Y.map(() => run.F0)
  const trainLoss = loss === 'l2' ? mse(TOY_Y, Fpts) : mae(TOY_Y, Fpts)
  const inSample = new Set(round ? round.idx : TOY_X.map((_, i) => i))
  const showSample = sub >= 1
  const rRange = loss === 'l2' ? 4.5 : 1.6

  const note = (() => {
    const F0txt = loss === 'l2' ? `F0 = mean(y) = ${run.F0.toFixed(3)}` : `F0 = median(y) = ${run.F0.toFixed(3)}`
    if (!round) return <>Before any tree: {F0txt} for every sample. Press <b>Next step</b> to start tree 1.</>
    const r = round.r
    const n = TOY_Y.length
    if (sub === 0) {
      if (loss === 'l2')
        return (
          <>
            <b>Tree {t}, step a.</b> residuals = y − current_pred: {n} numbers from {f2(Math.min(...r))} to {f2(Math.max(...r))}. They are the vertical gaps in the top plot.
          </>
        )
      const pos = r.filter((v) => v > 0).length
      return (
        <>
          <b>Tree {t}, step a.</b> residuals = sign(y − current_pred): {pos} samples get +1 and {n - pos - r.filter((v) => v === 0).length} get −1. Only the direction survives, not the size.
        </>
      )
    }
    if (sub === 1)
      return subsample >= 1 ? (
        <>
          <b>Step b.</b> subsample = 1.0, so indices = all {n} rows.
        </>
      ) : (
        <>
          <b>Step b.</b> subsample = {subsample.toFixed(2)}: int({n} × {subsample.toFixed(2)}) = {round.idx.length} rows drawn without replacement (filled). The other {n - round.idx.length} sit this tree out.
        </>
      )
    if (sub === 2) {
      const v = round.tree.values
      return (
        <>
          <b>Step c.</b> A depth-{depth} tree cuts x into {v.length} pieces. Each piece predicts the mean target of the sampled rows inside it: values from {f2(Math.min(...v))} to {f2(Math.max(...v))}.
        </>
      )
    }
    if (sub === 3) {
      const moves = round.h.map((h) => lr * h)
      return (
        <>
          <b>Step d.</b> Every row moves by learning_rate × tree(x) = {lr.toFixed(2)} × tree(x), at most {Math.max(...moves.map(Math.abs)).toFixed(2)}. All {n} rows move, sampled or not. Training {loss === 'l2' ? 'MSE' : 'MAE'}: {(loss === 'l2' ? mse(TOY_Y, round.before) : mae(TOY_Y, round.before)).toFixed(3)} → {trainLoss.toFixed(3)}.
        </>
      )
    }
    return (
      <>
        <b>Step e.</b> self.trees now holds {t} tree{t === 1 ? '' : 's'}. predict() replays them: F0 + {lr.toFixed(2)} × (sum of the {t} trees&apos; outputs).
      </>
    )
  })()

  const plots = (
    <div className={s.two} style={{ gridTemplateColumns: narrow ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) minmax(0, 1fr)' }}>
      <div>
        <p className={s.panelLabel}>Data and the model F(x) after {mShown} tree{mShown === 1 ? '' : 's'}</p>
        <Plot x={X_DOM} y={[2, 11]} width={380} height={250} minHeight={200} ariaLabel="Training points and the boosted model's step-shaped prediction">
          <Grid xTicks={10} yTicks={5} />
          <Axes xLabel="x" yLabel="y" xTicks={5} yTicks={5} />
          {round &&
            sub <= 2 &&
            TOY_X.map((x, i) => (
              <Path
                key={`r${i}`}
                points={[
                  [x, round.before[i]],
                  [x, TOY_Y[i]],
                ]}
                color={TOY_Y[i] >= round.before[i] ? 'var(--viz-pos)' : 'var(--viz-neg)'}
                width={2}
                opacity={showSample && !inSample.has(i) ? 0.3 : 0.85}
              />
            ))}
          {updated && <Path points={stairPrev} color="var(--viz-muted)" width={2} dash="5 4" />}
          <Path points={stairNow} color="var(--viz-1)" width={3} />
          <Dots
            points={TOY_X.map((x, i) => ({
              x,
              y: TOY_Y[i],
              color: 'var(--viz-ink)',
              hollow: showSample && !inSample.has(i),
            }))}
            r={4.5}
          />
        </Plot>
      </div>
      <div>
        <p className={s.panelLabel}>{round ? `Tree ${t}: its targets (${loss === 'l2' ? 'residuals' : 'signs'}) and what it learns` : 'The next tree’s targets appear at step a'}</p>
        <Plot x={X_DOM} y={[-rRange, rRange]} width={380} height={250} minHeight={170} ariaLabel="This round's negative gradient for each point, and the tree fitted to it">
          <Grid xTicks={10} yTicks={4} />
          <Axes xTicks={5} yTicks={4} xLabel="x" yLabel={loss === 'l2' ? 'r = y − F' : 'r = sign(y − F)'} />
          <HLine y={0} color="var(--viz-axis)" dash="0" width={1} />
          {round &&
            TOY_X.map((x, i) => (
              <Path
                key={`s${i}`}
                points={[
                  [x, 0],
                  [x, round.r[i]],
                ]}
                color={round.r[i] >= 0 ? 'var(--viz-pos)' : 'var(--viz-neg)'}
                width={2}
                opacity={showSample && !inSample.has(i) ? 0.25 : 0.9}
              />
            ))}
          {round && (
            <Dots
              points={TOY_X.map((x, i) => ({ x, y: round.r[i], color: round.r[i] >= 0 ? 'var(--viz-pos)' : 'var(--viz-neg)', hollow: showSample && !inSample.has(i) }))}
              r={3.5}
            />
          )}
          {round && sub >= 2 && <Path points={staircase([round.tree], (x) => treePredict(round.tree, x))} color="var(--viz-4)" width={3} />}
          {round && sub >= 3 && <Path points={staircase([round.tree], (x) => lr * treePredict(round.tree, x))} color="var(--viz-2)" width={2.5} dash="6 4" />}
        </Plot>
      </div>
    </div>
  )

  const code = (
    <div className={s.stack}>
      <div className={s.code}>
        <div className={s.codeBar}>
          <span>GradientBoostingRegressor.fit · Q1.6a</span>
          <span>len(self.trees) = {treesDone}</span>
        </div>
        <div className={s.codeBody} style={{ fontSize: narrow ? 11 : 12.5 }}>
          {CODE.map((l, i) => {
            const on = l.tag !== '' && sub >= 0 && TAGS[sub] === l.tag
            return (
              <span key={i} className={`${s.line} ${s.lineWrap} ${on ? s.lineOn : ''}`}>
                <span className={`${s.stepTag} ${on ? s.stepTagOn : ''}`}>{l.tag}</span>
                <Py code={narrow ? l.code.replace(/^ {4}/, '  ') : l.code} />
              </span>
            )
          })}
        </div>
      </div>
      <div className={s.note} aria-live="polite">
        {note}
      </div>
    </div>
  )

  return (
    <Figure
      wide
      title="The fit loop, one TODO step at a time"
      caption={
        <>
          Press <b>Next step</b> to walk through steps a to e for one tree, then <b>Next tree</b> or <b>Play</b> to add many. Watch the gaps in the
          top plot shrink: every tree is fitted to <i>what is still wrong</i>, and only a fraction (the learning rate) of its answer is added. Switch
          to <b>L1</b> and the targets become ±1, so each tree can move a point by at most the learning rate; notice how the outlier at x = 7.1
          pulls the L2 model up but hardly moves the L1 one. With <b>subsample</b> below 1, hollow points are left out of that tree&apos;s fit but
          still move in step d. The learning rate starts at 0.3 so the fit shows after fewer trees; the exam task uses 0.1.
        </>
      }
    >
      <div ref={wrapRef} className={s.stack}>
        {code}
        {plots}
        <div className={s.legend}>
          <span className={s.key}>
            <span className={s.swatch} style={{ borderColor: 'var(--viz-1)' }} /> F(x)
          </span>
          <span className={s.key}>
            <span className={s.swatch} style={{ borderColor: 'var(--viz-4)' }} /> tree(x)
          </span>
          <span className={s.key}>
            <span className={`${s.swatch} ${s.swatchDash}`} style={{ borderColor: 'var(--viz-2)' }} /> learning_rate × tree(x)
          </span>
          <span className={s.key}>
            <span className={s.dot} style={{ border: '2px solid var(--viz-ink)' }} /> not in this tree&apos;s subsample
          </span>
        </div>
      </div>
      <Controls>
        <Button
          onClick={() => {
            setPlaying(false)
            setK(0)
          }}
        >
          Reset
        </Button>
        <Button
          onClick={() => {
            setPlaying(false)
            setK((kk) => Math.max(0, kk - 1))
          }}
          disabled={k === 0}
        >
          Back
        </Button>
        <Button
          primary
          onClick={() => {
            setPlaying(false)
            setK((kk) => Math.min(last, kk + 1))
          }}
          disabled={k >= last}
        >
          Next step
        </Button>
        <Button
          onClick={() => {
            setPlaying(false)
            setK((kk) => nextTreeEnd(kk))
          }}
          disabled={k >= last}
        >
          Next tree
        </Button>
        <Button onClick={() => (playing ? setPlaying(false) : (setK((kk) => (kk >= last ? 0 : kk)), setPlaying(true)))}>{playing ? 'Pause' : 'Play'}</Button>
        <Slider
          label="trees in self.trees"
          value={treesDone}
          min={0}
          max={MAX}
          step={1}
          onChange={(v) => {
            setPlaying(false)
            setK(v * 5)
          }}
        />
      </Controls>
      <Controls>
        <Segmented
          label="criterion"
          value={loss}
          onChange={setLoss}
          options={[
            { value: 'l2', label: "'l2'" },
            { value: 'l1', label: "'l1'" },
          ]}
        />
        <Segmented
          label="max_depth"
          value={depth}
          onChange={setDepth}
          options={[
            { value: 1, label: '1' },
            { value: 2, label: '2' },
            { value: 3, label: '3' },
          ]}
        />
        <Slider label="learning_rate" value={lr} min={0.05} max={1} step={0.05} onChange={setLr} format={(v) => v.toFixed(2)} />
        <Slider label="subsample" value={subsample} min={0.5} max={1} step={0.05} onChange={setSubsample} format={(v) => v.toFixed(2)} />
      </Controls>
      <Readout
        items={[
          ['tree being built', round ? String(t) : '–'],
          ['step', sub >= 0 ? TAGS[sub] : 'start'],
          [`training ${loss === 'l2' ? 'MSE' : 'MAE'}`, trainLoss.toFixed(3)],
          ['F0', run.F0.toFixed(3)],
        ]}
      />
    </Figure>
  )
}
