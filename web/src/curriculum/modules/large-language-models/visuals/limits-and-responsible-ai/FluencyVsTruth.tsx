import { useState } from 'react'
import { Figure, Controls, Toggle, Plot, Axes, Grid, Path, Dots, Label, Arrow, M } from '../../../../../kit'
import { QUESTIONS, QCOL, SHORT, point, pct, type QId } from './hallucinationData'
import s from './lim.module.css'

/*
  How sure each reply sounds (the average probability of its tokens, mostly ordinary words) against
  how likely it is to be true, for the three questions of HallucinationConfidence. The wording is
  confident for all three, so the dots sit at similar x but very different heights.
*/

const ORDER: QId[] = ['known', 'rare', 'madeup']

export default function FluencyVsTruth() {
  const [src, setSrc] = useState(false)
  const pts = QUESTIONS.map((x) => ({ q: x, now: point(x, src), before: point(x, false) }))
  const rare = QUESTIONS.find((x) => x.id === 'rare')!
  const rareFact = rare.noSource.reduce((a, b) => (b.p > a.p ? b : a))
  const minSure = Math.round(Math.min(...pts.map((p) => p.now[0])) * 100)

  return (
    <Figure
      title="Sounding sure is not being right"
      caption={
        <>
          <b>Try:</b> switch the source on and off. <b>Notice:</b> all three replies sound about equally sure, but how often they are true differs
          hugely. A source, not fluency, makes them true.
        </>
      }
    >
      <div className={s.wrap}>
        <Controls>
          <Toggle label="Give it a retrieved source" checked={src} onChange={setSrc} />
        </Controls>
        <Plot x={[0.5, 1]} y={[0, 1]} width={480} height={270} minHeight={240} margin={{ left: 44, bottom: 40, top: 12, right: 14 }} ariaLabel="How sure each question's reply sounds against how often it is true">
          <Grid xTicks={5} yTicks={5} />
          <Path points={[[0.5, 0], [0.5, 0.5], [1, 1], [1, 0]]} closed color="none" fill="color-mix(in srgb, var(--viz-neg) 9%, transparent)" width={0} />
          <Path points={[[0.5, 0.5], [1, 1]]} color="var(--ink-3)" width={1.5} dash="5 4" />
          <Label x={0.515} y={0.2} dy={4} color="var(--ink-2)" size={11.5}>
            sounds surer than it is right
          </Label>
          <Axes xLabel="how sure it sounds (avg token probability)" yLabel="chance the reply is true" xTicks={5} yTicks={5} tickFormat={(v) => `${Math.round(v * 100)}%`} />
          {src &&
            pts.map(({ q: x, now, before }) =>
              Math.hypot(now[0] - before[0], now[1] - before[1]) > 0.03 ? <Arrow key={`a${x.id}`} from={before} to={now} color="var(--viz-3)" width={1.6} head={7} dash="4 3" /> : null,
            )}
          {src && <Dots points={pts.map(({ before, q: x }) => ({ x: before[0], y: before[1], hollow: true, color: QCOL[x.id], r: 4.5 }))} />}
          <Dots points={pts.map(({ now, q: x }) => ({ x: now[0], y: now[1], color: QCOL[x.id], r: 6.5 }))} />
        </Plot>
        <div className={s.legend} aria-label="Legend">
          {ORDER.map((id) => (
            <span key={id}>
              <span className={s.swatch} style={{ background: QCOL[id], borderRadius: '50%' }} />
              {SHORT[id]}
            </span>
          ))}
          <span>
            <span className={s.swatchDash} />
            as sure as it is right
          </span>
          {src && (
            <span>
              <span className={s.swatch} style={{ border: '2px solid var(--viz-muted)', borderRadius: '50%' }} />
              before the source
            </span>
          )}
        </div>
        <p className={s.note}>
          All three replies sound sure (average token probability {minSure}% or more), because most of their tokens are ordinary words. Only the
          fact token differs: for the rare fact the model gives its top year just {pct(rareFact.p)}, yet the sentence reads just as confidently.{' '}
          {src ? (
            <>With a source, every dot climbs to or above the dashed line: now each reply is at least as likely to be right as it sounds.</>
          ) : (
            <>
              The made-up prize gets a confident year {pct(1 - point(QUESTIONS[2], false)[1])} of the time. <M>{'\\text{Fluency} \\neq \\text{truth}'}</M>.
            </>
          )}
        </p>
      </div>
    </Figure>
  )
}
