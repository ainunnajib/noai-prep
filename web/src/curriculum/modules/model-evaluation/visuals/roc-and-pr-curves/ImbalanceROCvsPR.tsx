import { useMemo, useState } from 'react'
import { Figure, Controls, Slider, Readout, Plot, Grid, Axes, Path, Dots, HLine, Label, useNarrow } from '../../../../../kit'
import { normInv } from '../confusion-matrix-and-metrics/evalMath'
import { binormalAt, binormalAUC, binormalCurves, type Pt } from './roc'
import s from '../confusion-matrix-and-metrics/eval.module.css'

/*
  One classifier (binormal, separation d = 2.5, ROC-AUC 0.961), evaluated on populations with
  different shares of positives. TPR and FPR are computed inside each class, so the ROC curve
  cannot change. Precision = share·TPR / (share·TPR + (1 − share)·FPR) mixes the classes, so the
  PR curve sinks as positives get rarer.
*/

const D = 2.5
const SHARES = [0.5, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005]
const ROC_C = 'var(--viz-1)'
const PR_C = 'var(--viz-5)'
const OP_C = 'var(--viz-ink)'

const pctTxt = (v: number) => `${(v * 100).toLocaleString('en-GB', { maximumFractionDigits: 1 })}%`

export default function ImbalanceROCvsPR() {
  const [si, setSi] = useState(0)
  const [recall, setRecall] = useState(0.8)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)

  const share = SHARES[si]
  const curves = useMemo(() => binormalCurves(D, share), [share])
  const balanced = useMemo(() => binormalCurves(D, 0.5), [])
  const auc = binormalAUC(D)

  // operating point with the chosen recall: TPR = 1 − Φ(c − d/2)  =>  c = d/2 + Φ⁻¹(1 − recall)
  const c = D / 2 + normInv(1 - recall)
  const { fpr } = binormalAt(c, D)
  const precision = (share * recall) / (share * recall + (1 - share) * fpr)
  const per = 100000
  const caught = per * share * recall
  const alarms = per * (1 - share) * fpr

  const rocArea: Pt[] = [...curves.roc, [1, 0], [0, 0]]
  const prArea: Pt[] = [[0, 0], ...curves.pr, [1, 0]]
  const size = narrow ? 300 : 330

  return (
    <Figure
      title="Same model, rarer positives: ROC stays, PR sinks"
      caption={
        <>
          One classifier with ROC-AUC 0.96, tested on populations with fewer and fewer positives. The black dot is the threshold that catches 80% of the
          positives. Slide the share of positives from 50% down to 0.5%: the ROC curve (left) does not move at all, because TPR and FPR are each computed
          inside one class. The precision-recall curve (right) sinks towards the dashed baseline, because the same small false positive rate now produces far
          more false alarms than true catches. The faint curve is the PR curve at 50% for comparison.
        </>
      }
    >
      <div ref={wrapRef} className={s.wrap} style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: 14, justifyItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: size }}>
          <Plot x={[0, 1]} y={[0, 1]} width={size} height={size} maxWidth={size} margin={{ left: 42, right: 12, top: 26, bottom: 38 }} ariaLabel={`ROC curve, AUC ${auc.toFixed(2)}, unchanged by the share of positives`}>
            <Path points={rocArea} fill="var(--viz-fill)" color="none" width={0} closed />
            <Grid xTicks={5} yTicks={5} />
            <Axes xLabel="false positive rate" yLabel="true positive rate (recall)" xTicks={5} yTicks={5} />
            <Path points={[[0, 0], [1, 1]]} color="var(--viz-muted)" dash="5 5" width={1.6} />
            <Path points={curves.roc} color={ROC_C} width={3} />
            <Dots points={[{ x: fpr, y: recall, color: OP_C, r: 6 }]} />
            <Label x={fpr} y={recall} dx={10} dy={14}>
              {`FPR ${fpr.toFixed(3)}`}
            </Label>
            <Label x={0.62} y={0.3} anchor="middle" color={ROC_C} size={13} weight={700}>
              {`ROC-AUC = ${auc.toFixed(3)}`}
            </Label>
          </Plot>
        </div>
        <div style={{ width: '100%', maxWidth: size }}>
          <Plot x={[0, 1]} y={[0, 1]} width={size} height={size} maxWidth={size} margin={{ left: 42, right: 12, top: 26, bottom: 38 }} ariaLabel={`Precision-recall curve for ${pctTxt(share)} positives, PR-AUC ${curves.ap.toFixed(2)}`}>
            <Path points={prArea} fill="color-mix(in srgb, var(--viz-5) 14%, transparent)" color="none" width={0} closed />
            <Grid xTicks={5} yTicks={5} />
            <Axes xLabel="recall" yLabel="precision" xTicks={5} yTicks={5} />
            {si > 0 && <Path points={balanced.pr} color={PR_C} width={1.6} opacity={0.35} />}
            <HLine y={share} color="var(--viz-muted)" dash="5 5" label={share >= 0.1 ? `baseline = ${pctTxt(share)}` : undefined} />
            <Path points={curves.pr} color={PR_C} width={3} />
            <Dots points={[{ x: recall, y: precision, color: OP_C, r: 6 }]} />
            <Label x={recall} y={precision} dx={recall > 0.6 ? -10 : 10} dy={precision > 0.85 ? 18 : -10} anchor={recall > 0.6 ? 'end' : 'start'}>
              {`precision ${precision.toFixed(2)}`}
            </Label>
            <Label x={0.38} y={0.3} anchor="middle" color={PR_C} size={13} weight={700}>
              {`PR-AUC = ${curves.ap.toFixed(3)}`}
            </Label>
          </Plot>
        </div>
      </div>
      <p className={s.note}>
        Out of {per.toLocaleString('en-GB')} cases with {pctTxt(share)} positives, the threshold for {Math.round(recall * 100)}% recall catches{' '}
        <span className={s.big}>{Math.round(caught).toLocaleString('en-GB')}</span> real positives and raises{' '}
        <span className={s.big}>{Math.round(alarms).toLocaleString('en-GB')}</span> false alarms
        {alarms > caught ? ` (${(alarms / caught).toFixed(1)} false alarms for every real one)` : ''}.
      </p>
      <Controls>
        <Slider label="share of positives" value={si} min={0} max={SHARES.length - 1} step={1} onChange={setSi} format={() => pctTxt(share)} />
        <Slider label="operating point: recall" value={recall} min={0.1} max={0.95} step={0.05} onChange={setRecall} format={(v) => v.toFixed(2)} />
        <Readout
          items={[
            ['ROC-AUC', auc.toFixed(3)],
            ['PR-AUC', curves.ap.toFixed(3)],
            ['precision', precision.toFixed(3)],
          ]}
        />
      </Controls>
    </Figure>
  )
}
