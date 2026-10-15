import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Slider, Segmented, usePlayer, PlayerControls, useContainerWidth, useNarrow, Plot, Grid, Axes, Dots, Bars, Label } from '../../../../../kit'
import { synth } from './speech'
import { FRAME_S, N_FR, SEGS, frameFeatures, predict, clusterFrames, meanSpanLoss } from './hubert'
import s from './sm.module.css'

/*
  HuBERT's pretraining in four steps, on 0.6 s of synthetic speech:
  1. cut the audio into 20 ms frames, 2. give every frame a "hidden unit" with k-means (computed live),
  3. hide a span of frames, 4. predict the hidden frames' units; the loss counts masked frames only.
  The predictor in step 4 is a toy stand-in for the Transformer (it trusts nearby visible frames).
*/

// viz-5 (violet) sits close to viz-1 (blue) in dark mode, so it is used last
const UNIT_COLOURS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)', 'var(--viz-6)', 'var(--viz-5)']
const STAGES = ['1 · frames', '2 · k-means units', '3 · mask', '4 · predict']

export default function HuBERTMaskedUnits() {
  const [k, setK] = useState(5)
  const [mStart, setMStart] = useState(10)
  const [mLen, setMLen] = useState(6)
  const [sel, setSel] = useState<number | null>(null)
  const player = usePlayer({ steps: 4, interval: 2600 })
  const step = player.step
  const [wrapRef, width] = useContainerWidth<HTMLDivElement>(620)
  const [colsRef, narrow] = useNarrow<HTMLDivElement>(560)

  const wave = useMemo(() => synth(SEGS, 'hubert-demo'), [])
  // features shown and clustered: [log2(brightness in kHz), loudness in dB]
  const feats = useMemo(() => frameFeatures(wave).map(([b, db]) => [Math.log2(b), db] as [number, number]), [wave])
  // standardise both features before clustering so neither dominates
  const { labels: units, centroids } = useMemo(() => clusterFrames(feats, k), [feats, k])

  const start = Math.min(mStart, N_FR - 1)
  const end = Math.min(N_FR, start + mLen)
  const masked = Array.from({ length: N_FR }, (_, i) => step >= 2 && i >= start && i < end)
  const maskedIdx = masked.map((m, i) => (m ? i : -1)).filter((i) => i >= 0)
  const preds = maskedIdx.map((t) => ({ t, p: predict(t, units, masked, k) }))
  const losses = preds.map(({ t, p }) => -Math.log(p[units[t]]))
  const loss = losses.length ? losses.reduce((a, b) => a + b, 0) / losses.length : 0
  // by default inspect a frame at the edge of the span, next to a visible clue, where the toy model guesses right
  const isRight = (q: { t: number; p: number[] }) => q.p.indexOf(Math.max(...q.p)) === units[q.t]
  const edge = preds.filter((q) => q.t === start || q.t === end - 1)
  const focus = sel != null && masked[sel] ? sel : (edge.find(isRight) ?? preds.find(isRight) ?? preds[0])?.t ?? null
  // the trend: loss for each span length, averaged over every position the span can take
  const trend = useMemo(() => Array.from({ length: 12 }, (_, i) => meanSpanLoss(units, k, i + 1)), [units, k])
  const trendMax = Math.max(...trend)
  const focusPred = focus != null ? preds.find((q) => q.t === focus)?.p : undefined

  // ---- strip geometry ----
  const W = Math.max(300, width)
  const pad = 6
  const cw = (W - 2 * pad) / N_FR
  const waveH = 58
  const cellY = waveH + 8
  const cellH = 26
  const H = cellY + cellH + 20
  const env = useMemo(() => {
    const cols = Math.max(60, Math.floor(W - 2 * pad))
    const out: [number, number][] = []
    for (let c = 0; c < cols; c++) {
      const a = Math.floor((c / cols) * wave.length)
      const b = Math.max(a + 1, Math.floor(((c + 1) / cols) * wave.length))
      let lo = 0
      let hi = 0
      for (let i = a; i < b; i++) {
        lo = Math.min(lo, wave[i])
        hi = Math.max(hi, wave[i])
      }
      out.push([lo, hi])
    }
    return out
  }, [wave, W])
  const peak = Math.max(...env.map(([lo, hi]) => Math.max(-lo, hi)), 1e-6)
  const envPath = env.map(([lo, hi], c) => `M${(pad + c + 0.5).toFixed(1)},${(waveH / 2 - (hi / peak) * (waveH / 2 - 2)).toFixed(1)}V${(waveH / 2 - (lo / peak) * (waveH / 2 - 2) + 0.6).toFixed(1)}`).join('')

  // brightness is shown (and clustered) on a log scale, in octaves, which spreads out the vowels
  const ys = feats.map((f) => f[1])
  const xr: [number, number] = [-1.2, 3.2]
  const yr: [number, number] = [Math.floor(Math.min(...ys) - 4), Math.ceil(Math.max(...ys) + 4)]

  const pick = (i: number) => {
    setSel(i)
  }

  const controls = (
    <Controls>
      {step >= 1 && (
        <Segmented
          label="units (k)"
          value={k}
          onChange={(v) => setK(v)}
          options={[3, 4, 5, 6].map((v) => ({ value: v, label: String(v) }))}
        />
      )}
      {step >= 2 && <Slider label="mask start (frame)" value={start} min={0} max={N_FR - 1} step={1} onChange={(v) => (setMStart(v), setSel(null))} />}
      {step >= 2 && <Slider label="mask length" value={mLen} min={1} max={12} step={1} onChange={(v) => (setMLen(v), setSel(null))} format={(v) => `${v} frames (${v * 20} ms)`} />}
      <Readout
        items={[
          ['frames', `${N_FR} × 20 ms`],
          ['masked', step >= 2 ? `${maskedIdx.length}` : '0'],
          ['loss on these masked frames', step >= 3 && losses.length ? loss.toFixed(2) : '–'],
          ['average over all span positions', step >= 3 ? trend[Math.min(12, end - start) - 1].toFixed(2) : '–'],
        ]}
      />
    </Controls>
  )

  return (
    <Figure
      title="HuBERT: invent a vocabulary for sound, then play BERT's game"
      caption={
        <>
          Step through to step 4, then make the span longer. Notice the bars under the guesses: averaged over every span position,
          the loss rises, because frames deep inside a long gap are far from any visible clue.
        </>
      }
    >
      <div className={s.stack}>
        <div className={s.stages} aria-label="HuBERT pretraining stages">
          {STAGES.map((t, i) => (
            <button key={t} type="button" className={`${s.stage} ${i === step ? s.stageOn : i < step ? s.stageDone : ''}`} onClick={() => (player.pause(), player.setStep(i))}>
              {t}
            </button>
          ))}
        </div>

        <div ref={wrapRef} style={{ width: '100%' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block' }} role="img" aria-label={`0.6 seconds of speech cut into ${N_FR} frames of 20 ms${step >= 1 ? `, each labelled with one of ${k} hidden units` : ''}${step >= 2 ? `, with frames ${start} to ${end - 1} masked` : ''}`}>
            <defs>
              <pattern id="hubert-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="6" height="6" style={{ fill: 'var(--surface)', opacity: 0.55 }} />
                <line x1="0" y1="0" x2="0" y2="6" style={{ stroke: 'var(--viz-ink)', strokeWidth: 2 }} />
              </pattern>
            </defs>
            <path d={envPath} style={{ stroke: 'var(--viz-1)', strokeWidth: 1, fill: 'none' }} />
            {Array.from({ length: N_FR + 1 }, (_, i) => (
              <line key={i} x1={pad + i * cw} x2={pad + i * cw} y1={0} y2={cellY + cellH} style={{ stroke: 'var(--viz-grid)', strokeWidth: i % 5 === 0 ? 1.2 : 0.7 }} />
            ))}
            {units.map((u, i) => {
              const x = pad + i * cw
              const isM = masked[i]
              const fill = step >= 1 ? `color-mix(in srgb, ${UNIT_COLOURS[u]} ${isM ? 45 : 62}%, var(--surface))` : 'var(--surface-2)'
              return (
                <g key={i} onClick={() => pick(i)} style={{ cursor: 'pointer' }}>
                  <rect x={x + 0.5} y={cellY} width={cw - 1} height={cellH} rx={2} style={{ fill, stroke: 'var(--viz-axis)', strokeWidth: 0.6 }} />
                  {isM && <rect x={x + 0.5} y={cellY} width={cw - 1} height={cellH} rx={2} style={{ fill: 'url(#hubert-hatch)' }} />}
                  {step >= 1 && !isM && cw >= 11 && (
                    <text x={x + cw / 2} y={cellY + cellH / 2 + 4} textAnchor="middle" style={{ fontSize: 10.5, fontWeight: 700, fill: 'var(--viz-ink)' }}>
                      {u}
                    </text>
                  )}
                  {focus === i && step >= 3 && <rect x={x - 1} y={cellY - 3} width={cw + 2} height={cellH + 6} rx={3} style={{ fill: 'none', stroke: 'var(--viz-ink)', strokeWidth: 2.2 }} />}
                </g>
              )
            })}
            {step >= 2 && (
              <text x={pad + ((start + end) / 2) * cw} y={cellY - 4} textAnchor="middle" style={{ fontSize: 11, fontWeight: 800, fill: 'var(--viz-ink)', stroke: 'var(--surface)', strokeWidth: 4, paintOrder: 'stroke', strokeLinejoin: 'round' }}>
                [MASK] × {end - start}
              </text>
            )}
            {[0, 0.2, 0.4, 0.6].map((t) => (
              <text key={t} x={Math.min(W - pad - 2, Math.max(pad, pad + (t / FRAME_S) * cw))} y={H - 4} textAnchor={t === 0 ? 'start' : t === 0.6 ? 'end' : 'middle'} style={{ fontSize: 11, fill: 'var(--ink-2)' }}>
                {t === 0.6 ? '600 ms' : `${t * 1000}`}
              </text>
            ))}
          </svg>
        </div>
        {narrow && controls}

        <div ref={colsRef} className={`${s.cols} ${narrow ? s.colsNarrow : ''}`}>
          <div className={s.panel}>
            <p className={s.panelTitle}>Each frame as a dot</p>
            <Plot x={xr} y={yr} width={300} height={210} minHeight={190} margin={{ left: 40, right: 10, top: 10, bottom: 40 }} ariaLabel="Scatter plot of frames by brightness and loudness, coloured by k-means cluster">
              <Grid xTicks={5} yTicks={4} />
              <Axes xLabel="brightness: where the energy sits (kHz)" yLabel="dB" yTicks={4} hideXTicks />
              {[-1, 0, 1, 2, 3].map((v) => (
                <Label key={v} x={v} y={yr[0]} dy={16} anchor="middle" size={11} color="var(--viz-axis)">
                  {String(2 ** v)}
                </Label>
              ))}
              <Dots
                points={feats.map((f, i) => ({
                  x: f[0],
                  y: f[1],
                  color: step >= 1 ? UNIT_COLOURS[units[i]] : 'var(--viz-muted)',
                  r: focus === i && step >= 3 ? 7 : 4.5,
                  hollow: masked[i],
                }))}
              />
              {step >= 1 && <Dots points={centroids.map((c, j) => ({ x: c[0], y: c[1], color: UNIT_COLOURS[j], r: 7, shape: 'cross' as const }))} />}
            </Plot>
            <p className={s.small}>Two numbers per frame so you can see them; real HuBERT clusters 39 MFCC numbers per frame in round 1.</p>
          </div>

          <div className={s.panel}>
            {step === 0 && (
              <>
                <p className={s.panelTitle}>1 · Cut into frames</p>
                <p className={s.hint}>
                  HuBERT's first layers (a small CNN) turn the 16,000 samples per second into <b>one vector every 20 ms</b>: 50 frames per second.
                  These 0.6 s make {N_FR} frames. No transcript is needed anywhere in this process.
                </p>
              </>
            )}
            {step === 1 && (
              <>
                <p className={s.panelTitle}>2 · k-means: a unit for every frame</p>
                <p className={s.hint}>
                  k-means puts similar-sounding frames in the same cluster. The cluster number becomes that frame's target "word", a <b>hidden unit</b>. Units
                  are not letters or phonemes, just consistent sound categories. HuBERT uses 100 units in round 1 and 500 in round 2.
                </p>
              </>
            )}
            {step === 2 && (
              <>
                <p className={s.panelTitle}>3 · Hide spans of frames</p>
                <p className={s.hint}>
                  The hatched frames are replaced by a learned <b>[MASK]</b> vector before the Transformer sees them. You can still see their true colours; the
                  model cannot. Real HuBERT starts a 10-frame span at about 8% of frames, hiding roughly half of the audio.
                </p>
              </>
            )}
            {step === 3 && (
              <>
                <p className={s.panelTitle}>4 · Predict frame {focus ?? '–'}'s unit</p>
                {focusPred && focus != null ? (
                  <Bars
                    ariaLabel={`Predicted unit probabilities for frame ${focus}`}
                    max={1}
                    format={(v) => v.toFixed(2)}
                    data={focusPred.map((p, u) => ({ label: `unit ${u}${u === units[focus] ? ' (true)' : ''}`, value: p, color: UNIT_COLOURS[u], strong: u === units[focus] }))}
                  />
                ) : (
                  <p className={s.hint}>Mask some frames first.</p>
                )}
                <p className={s.small}>
                  Tap a hatched frame to inspect it. Loss for this frame: −ln p(true) ={' '}
                  <b>{focusPred && focus != null ? (-Math.log(focusPred[units[focus]])).toFixed(2) : '–'}</b>. Visible frames are not scored. Frames deep
                  inside the gap are often guessed wrong, which is why the real model must learn how speech flows.
                </p>
                <TrendBars trend={trend} max={trendMax} cur={end - start} />
              </>
            )}
          </div>
        </div>

        <PlayerControls player={player} label={(i) => STAGES[i]} />
        {!narrow && controls}
      </div>
    </Figure>
  )
}

/** Average masked-frame loss for span lengths 1 to 12, with the current length highlighted. */
function TrendBars({ trend, max, cur }: { trend: number[]; max: number; cur: number }) {
  const W = 260
  const H = 92
  const left = 4
  const bw = (W - left) / trend.length
  const base = H - 18
  const top = 16
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 320, display: 'block' }} role="img" aria-label="Average loss over all span positions for span lengths 1 to 12">
      <text x={0} y={10} style={{ fontSize: 11, fontWeight: 700, fill: 'var(--ink-2)' }}>
        average loss by span length
      </text>
      {trend.map((v, i) => {
        const h = ((base - top) * v) / max
        const on = i + 1 === cur
        return (
          <g key={i}>
            <rect x={left + i * bw + 2} y={base - h} width={bw - 4} height={h} rx={2} style={{ fill: on ? 'var(--viz-2)' : 'color-mix(in srgb, var(--viz-1) 45%, var(--surface))' }} />
            <text x={left + (i + 0.5) * bw} y={H - 5} textAnchor="middle" style={{ fontSize: 11, fill: on ? 'var(--ink)' : 'var(--ink-3)', fontWeight: on ? 800 : 500 }}>
              {i + 1}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
