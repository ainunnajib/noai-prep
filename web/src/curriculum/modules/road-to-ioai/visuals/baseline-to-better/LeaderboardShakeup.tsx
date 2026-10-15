import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Button, Plot, Grid, Axes, Dots, Path, Label, usePlot, useBump, mulberry32 } from '../../../../../kit'
import s from './craft.module.css'

/*
  K submissions whose TRUE accuracies are all close to 80% (sd 0.8 points). Each is scored on:
    - a small public leaderboard set (n_pub examples, adjustable),
    - your own local validation (2,000 labelled examples),
    - the hidden private test set (5,000 examples), which decides the final ranking.
  A score on n examples is a binomial count / n (normal approximation, seeded).
  Picking the submission with the best public score picks the luckiest draw, so its private score
  falls back; picking by the larger local validation set does better on average.
*/

const N_VAL = 2000
const N_PRIV = 5000
const PUB_SIZES = [100, 200, 500, 1000, 2000, 5000]
const REPS = 300

function contest(rnd: () => number, K: number, nPub: number) {
  const normal = () => {
    const u = Math.max(1e-12, rnd())
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd())
  }
  const draw = (n: number, p: number) => Math.min(n, Math.max(0, Math.round(n * p + Math.sqrt(n * p * (1 - p)) * normal()))) / n
  const subs = Array.from({ length: K }, () => {
    const p = Math.min(0.95, Math.max(0.6, 0.8 + 0.008 * normal()))
    return { p, pub: draw(nPub, p), val: draw(N_VAL, p), priv: draw(N_PRIV, p) }
  })
  const argmax = (f: (x: (typeof subs)[number]) => number) => subs.reduce((bi, x, i) => (f(x) > f(subs[bi]) ? i : bi), 0)
  return { subs, byPub: argmax((x) => x.pub), byVal: argmax((x) => x.val), byPriv: argmax((x) => x.priv) }
}

const pct = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`

/** A bold label with a halo in the background colour, so it stays readable on top of dots. */
function Tag({ x, y, dx, dy, anchor, colour, children }: { x: number; y: number; dx: number; dy: number; anchor: 'start' | 'end'; colour: string; children: string }) {
  const { xs, ys } = usePlot()
  return (
    <text
      x={xs(x) + dx}
      y={ys(y) + dy}
      textAnchor={anchor}
      style={{ fontSize: 12, fontWeight: 800, fill: colour, paintOrder: 'stroke', stroke: 'var(--surface)', strokeWidth: 4, strokeLinejoin: 'round' }}
    >
      {children}
    </text>
  )
}

export default function LeaderboardShakeup() {
  const [K, setK] = useState(40)
  const [pubIdx, setPubIdx] = useState(1)
  const [seed, bump] = useBump()
  const nPub = PUB_SIZES[pubIdx]

  const one = useMemo(() => contest(mulberry32(9001 + seed * 7919), K, nPub), [K, nPub, seed])
  const avg = useMemo(() => {
    const rnd = mulberry32(424242)
    let pubOfPick = 0
    let privOfPick = 0
    let privOfVal = 0
    let privBest = 0
    for (let r = 0; r < REPS; r++) {
      const c = contest(rnd, K, nPub)
      pubOfPick += c.subs[c.byPub].pub
      privOfPick += c.subs[c.byPub].priv
      privOfVal += c.subs[c.byVal].priv
      privBest += c.subs[c.byPriv].priv
    }
    return { pubOfPick: pubOfPick / REPS, privOfPick: privOfPick / REPS, privOfVal: privOfVal / REPS, privBest: privBest / REPS }
  }, [K, nPub])

  const A = one.subs[one.byPub]
  const B = one.subs[one.byVal]
  const all = one.subs.flatMap((x) => [x.pub, x.priv])
  const lo = Math.floor(Math.min(...all) * 100 - 1) / 100
  const hi = Math.ceil(Math.max(...all) * 100 + 1) / 100
  const fmtTick = (v: number) => `${Math.round(v * 100)}`

  return (
    <Figure
      title="Choosing by the public leaderboard"
      caption={
        <>
          Every dot is one submission; all of them are really about equally good (true accuracy near 80%). Left to right is the score the small public leaderboard shows, bottom to top the score on
          the hidden test that decides the final ranking. Add submissions and shrink the public set: the public scores spread out sideways while the hidden scores barely move, so the "best" public
          submission is mostly the luckiest one, and it falls back when the hidden scores are revealed.
        </>
      }
    >
      <Plot x={[lo, hi]} y={[lo, hi]} width={420} height={360} margin={{ left: 44, bottom: 40, top: 12, right: 14 }} ariaLabel="Scatter plot of public leaderboard score against hidden test score for each submission.">
        <Grid xTicks={6} yTicks={6} />
        <Axes xLabel="public leaderboard (%)" yLabel="hidden test (%)" xTicks={6} yTicks={6} tickFormat={fmtTick} />
        <Path points={[[lo, lo], [hi, hi]]} color="var(--viz-muted)" width={1.5} dash="5 4" />
        <Label x={hi} y={hi} dx={-4} dy={14} anchor="end" color="var(--ink-3)" size={11}>
          same score on both
        </Label>
        <Dots points={one.subs.map((x) => ({ x: x.pub, y: x.priv, r: 3.5, color: 'color-mix(in srgb, var(--viz-1) 55%, var(--surface))' }))} />
        <Path points={[[A.pub, A.pub], [A.pub, A.priv]]} color="var(--viz-neg)" width={2} dash="3 3" />
        <Dots
          points={[
            { x: B.pub, y: B.priv, r: 6.5, color: 'var(--viz-pos)', shape: 'square' },
            { x: A.pub, y: A.priv, r: 7, color: 'var(--viz-neg)' },
          ]}
        />
        {one.byPub === one.byVal ? (
          <Tag x={A.pub} y={A.priv} dx={A.pub > (lo + hi) / 2 ? -10 : 10} dy={-10} anchor={A.pub > (lo + hi) / 2 ? 'end' : 'start'} colour="var(--ink)">
            both pick this one
          </Tag>
        ) : (
          <>
            <Tag x={A.pub} y={A.priv} dx={-9} dy={18} anchor="end" colour="var(--viz-neg)">
              best on public
            </Tag>
            <Tag x={B.pub} y={B.priv} dx={B.pub > (lo + hi) / 2 ? -9 : 9} dy={-9} anchor={B.pub > (lo + hi) / 2 ? 'end' : 'start'} colour="var(--viz-pos)">
              best on your validation
            </Tag>
          </>
        )}
      </Plot>
      <Controls>
        <Slider label="submissions tried" value={K} min={1} max={100} step={1} onChange={setK} />
        <Slider label="public leaderboard size" value={pubIdx} min={0} max={PUB_SIZES.length - 1} step={1} onChange={setPubIdx} format={(i) => `${PUB_SIZES[i].toLocaleString('en-GB')} examples`} />
        <Button onClick={bump}>Rerun the contest</Button>
      </Controls>
      <table className={s.log} style={{ maxWidth: 460 }}>
        <thead>
          <tr>
            <th />
            <th className={s.num}>this contest</th>
            <th className={s.num}>average of {REPS}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ color: 'var(--viz-neg)', fontWeight: 700 }}>picked by public, public → hidden</td>
            <td className={s.num}>
              {pct(A.pub)} → {pct(A.priv)}
            </td>
            <td className={s.num}>
              {pct(avg.pubOfPick)} → {pct(avg.privOfPick)}
            </td>
          </tr>
          <tr>
            <td style={{ color: 'var(--viz-pos)', fontWeight: 700 }}>picked by your validation, hidden</td>
            <td className={s.num}>{pct(B.priv)}</td>
            <td className={s.num}>{pct(avg.privOfVal)}</td>
          </tr>
          <tr>
            <td>best possible, hidden</td>
            <td className={s.num}>{pct(one.subs[one.byPriv].priv)}</td>
            <td className={s.num}>{pct(avg.privBest)}</td>
          </tr>
        </tbody>
      </table>
      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--ink-3)', textAlign: 'center' }}>
        Your validation: {N_VAL.toLocaleString('en-GB')} labelled examples. Hidden test: {N_PRIV.toLocaleString('en-GB')} examples. Simulated data.
      </p>
    </Figure>
  )
}
