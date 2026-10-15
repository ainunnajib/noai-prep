import { useState } from 'react'
import { Figure, Controls, Readout, Button, Toggle, Plot, Grid, Axes, FnPath, Path, Label, VLine, M } from '../../../../../kit'
import { Handle } from '../logistic-regression/Handle'
import { fix, small } from './info'

/*
  Coin flips: the likelihood L(p) = p^h (1 − p)^t of the observed flips for every possible p, and the
  log-likelihood ln L(p) = h ln p + t ln(1 − p) underneath. Add heads/tails, multiply the data by 10,
  drag p, and optionally add a prior (like 2 extra heads and 2 extra tails) to see the MAP estimate.
*/

const START = ['H', 'H', 'T', 'H', 'H', 'H', 'T', 'H', 'T', 'H']
const MAX_N = 400

export default function LikelihoodCurve() {
  const [seq, setSeq] = useState<string[]>(START)
  const [mult, setMult] = useState(1)
  const [p, setP] = useState(0.5)
  const [prior, setPrior] = useState(false)

  const h = seq.filter((s) => s === 'H').length * mult
  const t = seq.filter((s) => s === 'T').length * mult
  const n = h + t
  const L = (x: number) => x ** h * (1 - x) ** t
  const ll = (x: number) => (h ? h * Math.log(x) : 0) + (t ? t * Math.log(1 - x) : 0)
  const mle = n ? h / n : 0.5
  const map = (h + 2) / (n + 4)
  const Lmax = L(mle)
  const postMax = map ** (h + 2) * (1 - map) ** (t + 2)
  const post = (x: number) => ((x ** (h + 2) * (1 - x) ** (t + 2)) / postMax) * Lmax
  const llMax = n ? ll(Math.min(0.999999, Math.max(1e-6, mle))) : 0
  const yTop = Lmax * 1.2
  const llRange: [number, number] = [llMax - 12, llMax + 1.5]

  const add = (s: 'H' | 'T') => {
    if (n + mult > MAX_N) return
    setSeq([...seq, s])
  }
  const undo = () => seq.length > 0 && setSeq(seq.slice(0, -1))
  const reset = () => {
    setSeq(START)
    setMult(1)
    setP(0.5)
  }
  const onP = (x: number) => setP(Math.min(0.99, Math.max(0.01, Math.round(x * 100) / 100)))

  const formula = n ? `p^{${h}}(1-p)^{${t}}` : '1'
  const seqText = mult === 1 ? seq.join(' ') : `${seq.join(' ')}  (each flip counted ${mult} times)`

  return (
    <Figure
      title="Which p explains the flips best?"
      caption={
        <>
          The top curve is the likelihood <M>{`L(p) = ${formula}`}</M>: the probability of exactly these flips if the coin's chance of heads were <M>p</M>. Drag
          the pink dot to try different <M>p</M>; the peak (dashed line) is the maximum-likelihood estimate, always heads ÷ flips. Add flips and watch the
          peak move. Press <b>10× the data</b>: the peak stays put but the curve gets narrower (more data, more certainty), while the likelihood values become
          tiny. The bottom curve, <M>{'\\ln L(p)'}</M>, has its peak in the same place and stays a manageable size. Switch on the prior to see the MAP estimate.
        </>
      }
    >
      <div style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--ink-2)', textAlign: 'center', overflowWrap: 'anywhere' }} aria-label="Observed flips">
        {n === 0 ? 'no flips yet: add some' : seqText}
      </div>
      <Plot x={[0, 1]} y={[0, n ? yTop : 1.2]} width={480} height={210} minHeight={190} margin={{ left: 70, bottom: 30, top: 18 }} ariaLabel={`Likelihood of ${h} heads and ${t} tails for every p; it peaks at p = ${fix(mle)}`}>
        <Grid xTicks={10} yTicks={3} />
        <Axes xTicks={5} yTicks={3} tickFormat={(v) => small(v)} />
        <Label x={0} y={n ? yTop : 1.2} dx={-62} dy={-6} size={12.5} weight={700} color="var(--ink-2)">
          likelihood L(p)
        </Label>
        {prior && n > 0 && <FnPath f={post} color="var(--viz-3)" width={2} dash="6 4" samples={200} />}
        <FnPath f={L} color="var(--viz-1)" width={3} samples={300} />
        {n > 0 && <VLine x={mle} color="var(--viz-1)" />}
        {/* near p = 1 the label goes on the left of the line, so it never runs off the plot */}
        {n > 0 && (
          <Label x={mle} y={yTop} dx={mle > 0.75 ? -5 : 5} dy={12} anchor={mle > 0.75 ? 'end' : 'start'} size={12} color="var(--viz-1)">
            {`peak p̂ = ${fix(mle)}`}
          </Label>
        )}
        {prior && n > 0 && <VLine x={map} color="var(--viz-3)" dash="2 3" />}
        <Path points={[[p, 0], [p, L(p)]]} color="var(--viz-4)" width={1.4} dash="3 4" />
        <Handle x={p} y={L(p)} lockY onChange={onP} step={0.01} color="var(--viz-4)" ariaLabel="Guess for p (likelihood plot)" valueText={`p ${p.toFixed(2)}, likelihood ${small(L(p), 3)}`} />
      </Plot>
      <Plot x={[0, 1]} y={n ? llRange : [-1, 1]} width={480} height={170} minHeight={160} margin={{ left: 70, bottom: 36, top: 18 }} ariaLabel={`Log-likelihood for every p; it also peaks at p = ${fix(mle)}`}>
        <Grid xTicks={10} yTicks={3} />
        <Axes xLabel="p = P(heads)" xTicks={5} yTicks={3} />
        <Label x={0} y={n ? llRange[1] : 1} dx={-62} dy={-6} size={12.5} weight={700} color="var(--ink-2)">
          log-likelihood ln L(p)
        </Label>
        <FnPath f={(x) => ll(x)} color="var(--viz-5)" width={3} samples={300} />
        {n > 0 && <VLine x={mle} color="var(--viz-5)" />}
        <Handle
          x={p}
          y={Math.max(llRange[0], ll(p))}
          lockY
          onChange={onP}
          step={0.01}
          color="var(--viz-4)"
          ariaLabel="Guess for p (log-likelihood plot)"
          valueText={`p ${p.toFixed(2)}, log-likelihood ${ll(p).toFixed(2)}`}
        />
      </Plot>
      <Readout
        items={[
          ['data', `${h} heads, ${t} tails`],
          ['your p', fix(p)],
          ['L(p)', small(L(p), 3)],
          ['ln L(p)', fix(ll(p))],
          ['MLE p̂', n ? `${h}/${n} = ${fix(mle)}` : '–'],
          ...(prior ? ([['MAP', `${h + 2}/${n + 4} = ${fix(map)}`]] as [string, string][]) : []),
        ]}
      />
      {prior && (
        <div style={{ width: '100%', fontSize: '0.85rem', color: 'var(--ink-2)', lineHeight: 1.45 }}>
          <span style={{ color: 'var(--viz-3)', fontWeight: 700 }}>Green dashed curve:</span> likelihood × prior, where the prior <M>{'\\propto p^2(1-p)^2'}</M>{' '}
          favours fair-ish coins (rescaled to the same height). Its peak, the MAP estimate, is pulled towards 0.5, as if you had seen 2 extra heads and 2 extra
          tails. With 10× the data the pull almost disappears.
        </div>
      )}
      <Controls>
        <Button onClick={() => add('H')} disabled={n + mult > MAX_N}>
          + heads
        </Button>
        <Button onClick={() => add('T')} disabled={n + mult > MAX_N}>
          + tails
        </Button>
        <Button onClick={undo} disabled={seq.length === 0}>
          Undo
        </Button>
        {/* 10× is only offered while 10 × the flips stays within MAX_N, so L(p̂) never underflows to 0 */}
        <Button onClick={() => setMult(mult === 1 ? 10 : 1)} primary={mult === 1} disabled={mult === 1 && seq.length * 10 > MAX_N}>
          {mult === 1 ? '10× the data' : 'Back to 1×'}
        </Button>
        <Button onClick={reset}>Reset</Button>
        <Toggle label="Add a fair-coin prior (MAP)" checked={prior} onChange={setPrior} />
      </Controls>
    </Figure>
  )
}
