import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Segmented, Button, mulberry32, hashString, useNarrow } from '../../../../../kit'
import s from './craft.module.css'

/*
  A simulated experiment log for an image-classification task whose baseline notebook (a small CNN
  trained from scratch) scores about 62% validation accuracy. Each component has a fixed true
  effect, two of them interact with the pretrained backbone, and every run adds seed noise
  (standard deviation 0.45 points) that is deterministic for a given configuration and seed.
  Toggle components, pick a seed, log the run; the ablation takes the logged configuration with the
  best MEAN over seeds 1–3 (not the luckiest single run), removes one component at a time and
  averages seeds 1–3 again.
*/

type CompId = 'P' | 'A' | 'S' | 'L' | 'D'

const COMPS: { id: CompId; name: string; mid: string; short: string; colour: string }[] = [
  { id: 'P', name: 'pretrained ResNet-18', mid: 'pretrained ResNet', short: 'pretrained', colour: 'var(--viz-1)' },
  { id: 'A', name: 'flip + crop augmentation', mid: 'flip + crop', short: 'augment', colour: 'var(--viz-3)' },
  { id: 'S', name: 'cosine LR schedule', mid: 'cosine LR', short: 'cosine LR', colour: 'var(--viz-5)' },
  { id: 'L', name: 'label smoothing 0.1', mid: 'label smoothing', short: 'smoothing', colour: 'var(--viz-6)' },
  { id: 'D', name: 'dropout 0.5 in the head', mid: 'dropout', short: 'dropout', colour: 'var(--viz-4)' },
]

const BASE = 62
const NOISE_SD = 0.45
const SEEDS = [1, 2, 3]

const keyOf = (cfg: Set<CompId>) => COMPS.filter((c) => cfg.has(c.id)).map((c) => c.id).join('')
const setOf = (key: string) => new Set(key.split('').filter(Boolean) as CompId[])

function trueScore(cfg: Set<CompId>) {
  const P = cfg.has('P')
  let v = BASE
  if (P) v += 14
  if (cfg.has('A')) v += P ? 3 : 6
  if (cfg.has('S')) v += 1.5
  if (cfg.has('L')) v += 0.2
  if (cfg.has('D')) v += P ? -0.6 : 0.8
  return v
}

function score(key: string, seed: number) {
  const rnd = mulberry32(hashString(`${key}|${seed}`))
  const u = Math.max(1e-12, rnd())
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd())
  return trueScore(setOf(key)) + NOISE_SD * z
}

const meanOverSeeds = (key: string) => SEEDS.reduce((a, sd) => a + score(key, sd), 0) / SEEDS.length
/** colour pulled towards the ink, so small text stays readable in both themes */
const textOf = (c: string) => `color-mix(in srgb, ${c} 60%, var(--ink))`

interface Run {
  n: number
  key: string
  seed: number
}

const START: Run[] = [
  { n: 1, key: '', seed: 1 },
  { n: 2, key: 'A', seed: 1 },
  { n: 3, key: 'PA', seed: 1 },
]

export default function AblationTable() {
  const [ref, narrow] = useNarrow<HTMLDivElement>(520)
  const [cfg, setCfg] = useState<Set<CompId>>(new Set(['P', 'A', 'S']))
  const [seed, setSeed] = useState(1)
  const [runs, setRuns] = useState<Run[]>(START)
  const [sort, setSort] = useState<'order' | 'score'>('order')
  const [msg, setMsg] = useState('')

  const baseScore = score(runs[0].key, runs[0].seed)
  const rows = runs.map((r, i) => {
    const prev = i > 0 ? setOf(runs[i - 1].key) : null
    const cur = setOf(r.key)
    const changes = prev ? COMPS.filter((c) => prev.has(c.id) !== cur.has(c.id)).length : 0
    return { ...r, val: score(r.key, r.seed), changes }
  })
  // the configuration to ablate: best mean over seeds 1–3, so one lucky seed cannot pick it
  const bestKey = [...new Set(runs.map((r) => r.key))].reduce((a, k) => (meanOverSeeds(k) > meanOverSeeds(a) ? k : a), runs[0].key)
  const bestName = bestKey ? COMPS.filter((c) => bestKey.includes(c.id)).map((c) => c.short).join(' + ') : 'baseline'
  const shown = sort === 'score' ? [...rows].sort((a, b) => b.val - a.val) : rows
  const deltas = rows.map((r) => r.val - baseScore)
  const lo = Math.min(-2, ...deltas)
  const hi = Math.max(2, ...deltas)
  const zero = (-lo / (hi - lo)) * 100

  const ablation = useMemo(() => {
    const full = setOf(bestKey)
    const fullMean = meanOverSeeds(bestKey)
    const spread = Math.sqrt(SEEDS.reduce((a, sd) => a + (score(bestKey, sd) - fullMean) ** 2, 0) / (SEEDS.length - 1))
    const items = COMPS.filter((c) => full.has(c.id)).map((c) => {
      const without = new Set(full)
      without.delete(c.id)
      return { comp: c, drop: fullMean - meanOverSeeds(keyOf(without)) }
    })
    return { fullMean, spread, items }
  }, [bestKey])
  const abMax = Math.max(1, ...ablation.items.map((x) => Math.abs(x.drop)))

  const toggle = (id: CompId) => {
    const next = new Set(cfg)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setCfg(next)
    setMsg('')
  }
  const log = () => {
    const key = keyOf(cfg)
    if (runs.some((r) => r.key === key && r.seed === seed)) {
      setMsg(`Already logged: the same configuration with seed ${seed} gives exactly ${score(key, seed).toFixed(1)}% again, because a fixed seed makes the run repeatable.`)
      return
    }
    setRuns([...runs, { n: runs.length + 1, key, seed }])
    const prev = setOf(runs[runs.length - 1].key)
    const nChanged = COMPS.filter((c) => prev.has(c.id) !== cfg.has(c.id)).length
    setMsg(nChanged > 1 ? `Run ${runs.length + 1} changed ${nChanged} things at once, so you cannot tell which one caused the difference.` : '')
  }
  const reset = () => {
    setRuns(START)
    setCfg(new Set(['P', 'A', 'S']))
    setSeed(1)
    setMsg('')
  }

  const tagsFor = (key: string) => {
    const set = setOf(key)
    if (!set.size) return <span className={s.tag}>baseline</span>
    if (narrow)
      return (
        <span style={{ fontSize: '0.76rem' }}>
          {COMPS.filter((c) => set.has(c.id))
            .map((c) => c.short)
            .join(' + ')}
        </span>
      )
    return COMPS.filter((c) => set.has(c.id)).map((c) => (
      <span key={c.id} className={s.tag} style={{ boxShadow: `inset 3px 0 0 ${c.colour}` }}>
        {c.mid}
      </span>
    ))
  }

  return (
    <Figure
      title="An experiment log, then an ablation"
      caption={
        <>
          Change one thing, log it, and re-run it with seeds 1, 2 and 3. Notice that runs wobble by about half a point, so smaller gains are not evidence; the ablation shows which parts carry the
          score.
        </>
      }
    >
      <div ref={ref} className={s.panel}>
        <div className={s.panelTitle}>Next experiment</div>
        <div className={s.toggles} role="group" aria-label="Components to include">
          {COMPS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`${s.compChip} ${cfg.has(c.id) ? s.compChipOn : ''}`}
              style={cfg.has(c.id) ? { borderColor: c.colour } : undefined}
              aria-pressed={cfg.has(c.id)}
              onClick={() => toggle(c.id)}
            >
              {cfg.has(c.id) ? '✓ ' : '+ '}
              {c.name}
            </button>
          ))}
        </div>
        <div className={s.runRow}>
          <Segmented label="Seed" value={seed} onChange={(v) => {
              setSeed(v)
              setMsg('')
            }} options={SEEDS.map((sd) => ({ value: sd, label: String(sd) }))} />
          <Button primary onClick={log}>
            Run and log
          </Button>
          <Button onClick={reset}>Reset</Button>
        </div>
        {msg && <p style={{ margin: '0.45rem 0 0', fontSize: '0.8rem', color: 'var(--warn)', fontWeight: 700 }}>{msg}</p>}
      </div>

      <div className={s.panel}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
          <div className={s.panelTitle} style={{ margin: 0 }}>
            Experiment log
          </div>
          <Segmented
            label="Sort"
            value={sort}
            onChange={setSort}
            options={[
              { value: 'order', label: 'run order' },
              { value: 'score', label: 'best first' },
            ]}
          />
        </div>
        <div className={s.scroll}>
          <table className={s.log}>
            <thead>
              <tr>
                <th>#</th>
                <th>configuration</th>
                <th className={s.num}>seed</th>
                <th className={s.num}>val acc</th>
                <th className={narrow ? s.num : undefined} style={{ width: narrow ? undefined : '30%' }}>
                  vs run 1
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => {
                const d = r.val - baseScore
                const left = d >= 0 ? zero : ((d - lo) / (hi - lo)) * 100
                const width = (Math.abs(d) / (hi - lo)) * 100
                return (
                  <tr key={r.n} className={r.key === bestKey ? s.best : undefined}>
                    <td className={s.num}>{r.n}</td>
                    <td>
                      <div className={s.cfg}>
                        {tagsFor(r.key)}
                        {r.changes > 1 && <span className={s.warn}>{r.changes} changes at once</span>}
                      </div>
                    </td>
                    <td className={s.num}>{r.seed}</td>
                    <td className={s.num}>{r.val.toFixed(1)}%</td>
                    {narrow ? (
                      <td className={s.num} style={{ color: textOf(d >= 0 ? 'var(--viz-pos)' : 'var(--viz-neg)'), fontWeight: 700 }}>
                        {d >= 0 ? '+' : '−'}
                        {Math.abs(d).toFixed(1)}
                      </td>
                    ) : (
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <div className={s.bar} style={{ flex: 1 }} title={`${d >= 0 ? '+' : ''}${d.toFixed(1)} points`}>
                          <div className={s.barFill} style={{ left: `${left}%`, width: `${width}%`, background: d >= 0 ? 'var(--viz-pos)' : 'var(--viz-neg)' }} />
                          <div style={{ position: 'absolute', left: `${zero}%`, top: -2, bottom: -2, width: 1.5, background: 'var(--viz-axis)' }} />
                        </div>
                        <span className={s.num} style={{ fontSize: '0.72rem', color: 'var(--ink-2)', minWidth: '2.4rem' }}>
                          {d >= 0 ? '+' : '−'}
                          {Math.abs(d).toFixed(1)}
                        </span>
                      </div>
                    </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className={s.panel}>
        <div className={s.panelTitle}>Ablation of the best configuration ({bestName}), mean of seeds 1–3</div>
        {ablation.items.length === 0 ? (
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ink-2)' }}>The best configuration is the baseline itself, so there is nothing to remove yet. Log a run with some components.</p>
        ) : (
          <table className={s.log}>
            <tbody>
              {ablation.items.map(({ comp, drop }) => {
                const verdict = drop > 0.8 ? { t: 'keep: clearly helps', c: textOf('var(--viz-pos)') } : drop < -0.8 ? { t: 'remove: it hurts', c: textOf('var(--viz-neg)') } : { t: 'within seed noise', c: 'var(--warn)' }
                return (
                  <tr key={comp.id}>
                    <td style={{ width: narrow ? '34%' : '32%' }}>
                      without <strong>{narrow ? comp.short : comp.name}</strong>
                    </td>
                    <td className={s.num} style={{ width: '4.5rem' }}>
                      {drop >= 0 ? '−' : '+'}
                      {Math.abs(drop).toFixed(1)}
                    </td>
                    <td>
                      <div className={s.bar}>
                        <div className={s.barFill} style={{ left: 0, width: `${(Math.abs(drop) / abMax) * 100}%`, background: drop >= 0 ? comp.colour : 'var(--viz-neg)' }} />
                      </div>
                    </td>
                    <td className={s.verdict} style={{ color: verdict.c }}>
                      {verdict.t}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      <Controls>
        <Readout
          items={[
            ['best configuration, mean of 3 seeds', `${ablation.fullMean.toFixed(1)}%`],
            ['seed-to-seed spread (sd)', `${ablation.spread.toFixed(2)} points`],
          ]}
        />
      </Controls>
    </Figure>
  )
}
