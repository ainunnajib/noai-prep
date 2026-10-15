import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Controls, Button, Segmented, Bars, Plot, Grid, Axes, Path, useNarrow } from '../../../../../kit'
import Figure from '../TouchFigure'
import { TRAIN, TEST, X_RANGE, Y_RANGE, PASS_BG, FAIL_BG, knnPass, regionRuns, bestLine, linePass, halfPlane, prefersReducedMotion, type Student } from './students'
import { Regions, StudentMarks, WrongRings, Legend, RegionVars } from './parts'

/*
  Two classifiers trained on the same 24 students:
  - the "memoriser": 1-nearest neighbour, whose wiggly boundary gets every training student right;
  - the simple straight line found in the boundary visual (22/24 on training).
  "Reveal" drops new students (never seen in training) onto both maps, 12 at a time, and scores both.
*/

type Model = {
  name: string
  sub: string
  /** colour of this model's bars in the summary chart (shown as a chip next to its name) */
  color: string
  pass: (x: number, y: number) => boolean
}

const BATCH = 12
const pct = (a: number, b: number) => (b ? Math.round((100 * a) / b) : 0)

const panel: CSSProperties = {
  border: '1px solid var(--rule)',
  borderRadius: 'var(--radius-m)',
  padding: '0.55rem 0.6rem 0.5rem',
  minWidth: 0,
  display: 'grid',
  gap: '0.35rem',
  alignContent: 'start',
}

function score(m: Model, data: Student[]) {
  const wrong = data.filter((p) => m.pass(p.x, p.y) !== p.pass)
  return { correct: data.length - wrong.length, wrong }
}

export default function GeneralisationPeek() {
  const [revealed, setRevealed] = useState(0)
  const [guess, setGuess] = useState<'none' | 'memoriser' | 'line'>('none')
  const [still, setStill] = useState(true)
  useEffect(() => setStill(prefersReducedMotion()), [])
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)

  const best = useMemo(() => bestLine(TRAIN), [])
  const nnRuns = useMemo(() => regionRuns((x, y) => knnPass(TRAIN, x, y, 1), 100, 70), [])
  const models: Model[] = [
    { name: 'The memoriser', sub: 'wiggly boundary: copy the nearest classmate', color: 'var(--viz-4)', pass: (x, y) => knnPass(TRAIN, x, y, 1) },
    { name: 'The simple line', sub: 'the best straight boundary', color: 'var(--viz-3)', pass: (x, y) => linePass(best, x, y) },
  ]
  const test = TEST.slice(0, revealed)
  const scores = models.map((m) => ({ train: score(m, TRAIN), test: score(m, test) }))
  const winner: 'memoriser' | 'line' = scores[1].test.correct >= scores[0].test.correct ? 'line' : 'memoriser'
  const winnerName = winner === 'line' ? 'the simple line' : 'the memoriser'
  const lineFar: [number, number][] = (() => {
    // two far-apart points on the line a·x + b·y = c
    const { a, b, c } = best
    const p0: [number, number] = Math.abs(b) > Math.abs(a) ? [0, c / b] : [c / a, 0]
    const dir: [number, number] = [b, -a]
    return [
      [p0[0] - dir[0] * 40, p0[1] - dir[1] * 40],
      [p0[0] + dir[0] * 40, p0[1] + dir[1] * 40],
    ]
  })()

  return (
    <Figure
      title="Memorising vs generalising"
      caption={
        <>
          Both maps were trained on the same 24 students. The memoriser copies the label of the nearest classmate, so it gets every one of them right; the
          line gets 22. First guess which will do better on students it has never seen, then press <b>Reveal</b>. New students are drawn as hollow marks, and
          a red ring means that map predicted them wrongly. Reveal all three batches before you decide.
        </>
      }
    >
      <Legend
        extra={[
          {
            label: 'new student (hollow)',
            swatch: (
              <svg width="14" height="14" aria-hidden="true">
                <circle cx="7" cy="7" r="5" style={{ fill: 'var(--surface)', stroke: 'var(--viz-2)', strokeWidth: 2.2 }} />
              </svg>
            ),
          },
        ]}
      />
      <div ref={wrapRef} style={{ width: '100%', display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: '0.7rem' }}>
        {models.map((m, mi) => {
          const sc = scores[mi]
          const passPoly = mi === 1 ? halfPlane(best, 1) : []
          const failPoly = mi === 1 ? halfPlane(best, -1) : []
          return (
            <div key={mi} style={panel}>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--ink)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: 3, background: m.color, display: 'inline-block', flex: 'none' }} />
                  {m.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-3)', fontWeight: 600 }}>{m.sub}</div>
              </div>
              <Plot
                x={X_RANGE}
                y={Y_RANGE}
                width={360}
                height={262}
                maxWidth={460}
                margin={{ left: 30, right: 10 }}
                ariaLabel={`${m.name}: ${sc.train.correct} of ${TRAIN.length} training students right${revealed ? `, ${sc.test.correct} of ${revealed} new students right` : ''}`}
              >
                {mi === 0 ? (
                  <Regions runs={nnRuns} />
                ) : (
                  <RegionVars>
                    <Path points={passPoly} closed fill={PASS_BG} color="none" width={0} />
                    <Path points={failPoly} closed fill={FAIL_BG} color="none" width={0} />
                  </RegionVars>
                )}
                <Grid xTicks={5} yTicks={4} />
                <Axes xLabel="revision (h)" yLabel="sleep (h)" xTicks={5} yTicks={4} />
                {mi === 1 && <Path points={lineFar} color="var(--viz-ink)" width={2.5} />}
                <StudentMarks data={TRAIN} r={5} dim={revealed > 0} />
                <StudentMarks data={test} r={5.5} hollow />
                <WrongRings pts={sc.test.wrong} still={still} r={10} />
              </Plot>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', justifyContent: 'start', gap: '0.1rem 0.8rem', fontSize: '0.85rem' }} className="tabular">
                <span style={{ color: 'var(--ink-3)' }}>training students</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink)' }}>
                  {sc.train.correct}/{TRAIN.length} = {pct(sc.train.correct, TRAIN.length)}%
                </span>
                <span style={{ color: 'var(--ink-3)' }}>new students</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: revealed ? 'var(--ink)' : 'var(--ink-3)' }}>
                  {revealed ? `${sc.test.correct}/${revealed} = ${pct(sc.test.correct, revealed)}%` : 'not seen yet'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
      {revealed === 0 ? (
        <Segmented
          label="Your guess: which will do better on new students?"
          value={guess}
          onChange={setGuess}
          options={[
            { value: 'memoriser', label: 'the memoriser' },
            { value: 'line', label: 'the simple line' },
          ]}
        />
      ) : (
        <div style={{ width: '100%', display: 'grid', gap: '0.4rem' }}>
          <Bars
            ariaLabel="Accuracy on training students and on new students for both maps"
            max={100}
            format={(v) => `${Math.round(v)}%`}
            data={[
              { label: 'memoriser, training', value: pct(scores[0].train.correct, TRAIN.length), color: 'color-mix(in srgb, var(--viz-4) 55%, var(--surface))' },
              { label: 'memoriser, new', value: pct(scores[0].test.correct, revealed), color: 'var(--viz-4)', strong: true },
              { label: 'line, training', value: pct(scores[1].train.correct, TRAIN.length), color: 'color-mix(in srgb, var(--viz-3) 55%, var(--surface))' },
              { label: 'line, new', value: pct(scores[1].test.correct, revealed), color: 'var(--viz-3)', strong: true },
            ]}
          />
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--ink-2)', textAlign: 'center' }} aria-live="polite">
            {revealed < TEST.length
              ? `${revealed} new students so far. Reveal more before deciding: a few students can be lucky or unlucky.`
              : `All ${TEST.length} new students revealed: the memoriser misjudged ${TEST.length - scores[0].test.correct}, the line ${TEST.length - scores[1].test.correct}. The perfect training score did not carry over, because the memoriser's boundary bends around individual training students, unusual ones included, and new students who land in those bends and islands are misjudged.${
                  guess === 'none' ? '' : guess === winner ? ` You guessed ${winnerName}: right!` : ` You guessed ${guess === 'line' ? 'the simple line' : 'the memoriser'}. Not this time: ${winnerName} did better.`
                }`}
          </p>
        </div>
      )}
      <Controls>
        <Button primary onClick={() => setRevealed((r) => Math.min(TEST.length, r + BATCH))} disabled={revealed >= TEST.length}>
          {revealed === 0 ? `Reveal ${BATCH} new students` : revealed < TEST.length ? `Reveal ${BATCH} more` : 'All revealed'}
        </Button>
        <Button
          onClick={() => {
            setRevealed(0)
            setGuess('none')
          }}
        >
          Start again
        </Button>
      </Controls>
    </Figure>
  )
}
