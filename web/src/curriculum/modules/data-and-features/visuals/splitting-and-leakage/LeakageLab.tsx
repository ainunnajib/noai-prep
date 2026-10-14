import { useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Controls, Toggle, Readout, Plot, Rect, Label, Path, usePlot } from '../../../../../kit'

/*
  Leakage lab. A fraud model is built from 200 labelled past transactions (3 weakly useful features,
  1,997 pure-noise features, and optionally a post-outcome feature refund_issued). The learner
  switches leaky steps on and off and wraps preprocessing in a Pipeline; the workflow diagram
  marks every step that sees validation rows, and two bars compare the validation score the team
  would report with the true score on fresh data.

  The scores are not made up: they are averages over 200 simulated datasets, computed in Python with
  scikit-learn (StandardScaler -> SelectKBest(f_classif, k=10) -> LogisticRegression; 150 training
  rows, 50 validation rows, 1,000 fresh rows in which refund_issued is not known yet). Fitting the
  scaler on all rows changed no average by more than 0.03 points, so those cases share numbers
  after rounding. A real scikit-learn Pipeline gave exactly the "000" and "001" numbers.
*/

// key = scaleAll selectAll refund (1 = leaky step active)  ->  [reported %, true %]
const RESULTS: Record<string, [number, number]> = {
  '000': [68.0, 67.0],
  '001': [90.6, 58.8],
  '010': [80.2, 68.5],
  '011': [93.3, 58.6],
  '100': [68.0, 67.0],
  '101': [90.6, 58.8],
  '110': [80.2, 68.5],
  '111': [93.3, 58.6],
}

type Kind = 'plain' | 'leak' | 'pipe' | 'score'
const boxStyle = (k: Kind): CSSProperties => ({
  border: `2px solid ${k === 'leak' ? 'var(--viz-neg)' : k === 'pipe' ? 'var(--viz-pos)' : k === 'score' ? 'var(--viz-1)' : 'var(--rule)'}`,
  background: k === 'leak' ? 'color-mix(in srgb, var(--viz-neg) 10%, var(--surface))' : k === 'pipe' ? 'color-mix(in srgb, var(--viz-pos) 9%, var(--surface))' : 'var(--surface)',
  borderRadius: 10,
  padding: '6px 10px',
  fontSize: '0.86rem',
  lineHeight: 1.35,
  color: 'var(--ink)',
  textAlign: 'center',
})
const badge = (c: string): CSSProperties => ({ display: 'inline-block', marginLeft: 6, padding: '0 6px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 800, color: 'var(--surface)', background: c })
const arrow = <div style={{ textAlign: 'center', color: 'var(--ink-3)', lineHeight: 1, fontSize: '0.9rem' }} aria-hidden="true">↓</div>

function Box({ kind = 'plain', children }: { kind?: Kind; children: ReactNode }) {
  return <div style={boxStyle(kind)}>{children}</div>
}

function ChanceLine() {
  const { xs, ys } = usePlot()
  return (
    <g>
      <line x1={xs(50)} x2={xs(50)} y1={ys(1.75)} y2={ys(-0.6)} style={{ stroke: 'var(--viz-muted)', strokeDasharray: '4 4', strokeWidth: 1.5 }} />
      <text className="plot-label" x={xs(50)} y={ys(-0.6) + 14} textAnchor="middle" style={{ fill: 'var(--ink-3)', fontSize: 11.5 }}>
        50% = coin flip
      </text>
    </g>
  )
}

export default function LeakageLab() {
  const [scaleAll, setScaleAll] = useState(false)
  const [selectAll, setSelectAll] = useState(true)
  const [refund, setRefund] = useState(false)
  const [pipeline, setPipeline] = useState(false)

  const eScale = scaleAll && !pipeline
  const eSelect = selectAll && !pipeline
  const [reported, truth] = RESULTS[`${eScale ? 1 : 0}${eSelect ? 1 : 0}${refund ? 1 : 0}`]
  const gap = reported - truth

  let verdict: ReactNode
  if (refund)
    verdict = (
      <>
        <b>Target leakage.</b> <code>refund_issued</code> is only known after a fraud is confirmed. In the validation rows it gives the answer away;
        next month it is always 0, so the model is lost. A Pipeline cannot fix this, because the feature itself is the leak: remove it.
      </>
    )
  else if (eSelect)
    verdict = (
      <>
        <b>Selection leakage.</b> The 10 "best" features were chosen using the validation rows' labels too, so some pure-noise features look useful
        exactly on those rows. The model is no better on fresh data; only its report card is.
      </>
    )
  else if (eScale)
    verdict = (
      <>
        <b>A mild leak.</b> The scaler saw the validation rows' means and spreads, but never their labels, so the score barely moves here. It is still
        a bug: with an imputer, a small dataset or data that changes over time, it can matter, and you cannot know in advance how much.
      </>
    )
  else
    verdict = (
      <>
        <b>Honest.</b> Every step learned from the training rows only, so the validation score is a fair preview of the score on fresh data (the small
        difference is chance).
      </>
    )

  const leakSteps = (
    <>
      {eScale && (
        <>
          <Box kind="leak">
            Fit the scaler on <b>all 200 rows</b>
            <span style={badge('var(--viz-neg)')}>sees validation rows</span>
          </Box>
          {arrow}
        </>
      )}
      {eSelect && (
        <>
          <Box kind="leak">
            Pick the 10 best of 2,000 features using <b>all 200 rows and their labels</b>
            <span style={badge('var(--viz-neg)')}>sees validation labels</span>
          </Box>
          {arrow}
        </>
      )}
    </>
  )

  return (
    <Figure
      title="Leakage lab: the report card versus reality"
      caption={
        <>
          Switch the leaky steps on and off and compare the bars. The top bar is the validation accuracy the team would report; the bottom bar is the
          accuracy the model really gets next month on new transactions. A big gap means the report is lying. Then switch on <b>Use a Pipeline</b>: it
          moves the scaler and the feature picker after the split, so they learn from training rows only. Notice which leak it cannot fix. (Each
          number is an average over 200 simulated datasets, computed with scikit-learn.)
        </>
      }
    >
      <Controls>
        <Toggle label="Fit the scaler on all rows" checked={scaleAll} onChange={setScaleAll} />
        <Toggle label="Pick features using all rows" checked={selectAll} onChange={setSelectAll} />
        <Toggle label={<>Include <code>refund_issued</code></>} checked={refund} onChange={setRefund} />
        <Toggle label={<b>Use a Pipeline</b>} checked={pipeline} onChange={setPipeline} />
      </Controls>
      {pipeline && (scaleAll || selectAll) && (
        <div style={{ fontSize: '0.82rem', color: 'var(--viz-pos)', fontWeight: 700, textAlign: 'center' }}>
          The Pipeline overrides the "all rows" switches: inside it, fitting only ever sees training rows.
        </div>
      )}
      <div style={{ display: 'grid', gap: 4, width: '100%', maxWidth: 460 }} aria-label="Workflow diagram">
        <Box>
          200 past transactions, labelled fraud or not: 2,000 features{refund ? ' + refund_issued' : ''}
          {refund && <span style={badge('var(--viz-neg)')}>known only after the outcome</span>}
        </Box>
        {arrow}
        {leakSteps}
        <Box>Split: 150 training rows · 50 validation rows</Box>
        {arrow}
        {pipeline ? (
          <Box kind="pipe">
            <b>Pipeline</b>.fit(training rows): scaler → pick 10 features → logistic regression
            <span style={badge('var(--viz-pos)')}>training rows only</span>
          </Box>
        ) : (
          <Box>
            {!eScale && 'Fit the scaler on training rows → '}
            {!eSelect && 'pick 10 features on training rows → '}
            train logistic regression on training rows
          </Box>
        )}
        {arrow}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <Box kind="score">Score on the 50 validation rows: what you report</Box>
          <Box kind="score">Score on 1,000 new transactions next month: reality</Box>
        </div>
      </div>
      <Plot x={[0, 100]} y={[-0.9, 1.9]} width={460} height={150} maxWidth={560} margin={{ top: 6, bottom: 30, left: 66, right: 50 }} ariaLabel={`Reported validation accuracy ${reported.toFixed(1)}%, true accuracy ${truth.toFixed(1)}%`}>
        <Rect x0={0} x1={100} y0={0.75} y1={1.55} fill="var(--surface-2)" />
        <Rect x0={0} x1={100} y0={-0.25} y1={0.55} fill="var(--surface-2)" />
        <Rect x0={0} x1={reported} y0={0.75} y1={1.55} fill={gap > 5 ? 'var(--viz-neg)' : 'var(--viz-1)'} rx={4} />
        <Rect x0={0} x1={truth} y0={-0.25} y1={0.55} fill="var(--viz-pos)" rx={4} />
        <Label x={0} y={1.15} dx={-8} dy={5} anchor="end" color="var(--ink-2)" weight={700} size={12.5}>
          reported
        </Label>
        <Label x={0} y={0.15} dx={-8} dy={5} anchor="end" color="var(--ink-2)" weight={700} size={12.5}>
          reality
        </Label>
        <Label x={reported} y={1.15} dx={5} dy={5} weight={800}>{`${reported.toFixed(1)}%`}</Label>
        <Label x={truth} y={0.15} dx={5} dy={5} weight={800}>{`${truth.toFixed(1)}%`}</Label>
        <ChanceLine />
        <Path points={[[0, -0.6], [100, -0.6]]} color="var(--viz-axis)" width={1} />
      </Plot>
      <Readout
        items={[
          ['reported', `${reported.toFixed(1)}%`],
          ['reality', `${truth.toFixed(1)}%`],
          ['over-promise', `${gap >= 0 ? '+' : ''}${gap.toFixed(1)} points`],
        ]}
      />
      <div style={{ fontSize: '0.92rem', color: 'var(--ink-2)', lineHeight: 1.5, maxWidth: 560 }}>{verdict}</div>
    </Figure>
  )
}
