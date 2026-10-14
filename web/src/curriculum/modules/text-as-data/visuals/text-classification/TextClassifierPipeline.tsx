import { useMemo, useState } from 'react'
import { Figure, Segmented, Plot, Grid, Axes, Path, Label, usePlot } from '../../../../../kit'
import s from './tc.module.css'
import { DivergingBars, ProbBar, SentenceInput } from './parts'
import { VOCAB, EMB, EMB_W, EMB_B, TFIDF_B, TRAIN_POS, TRAIN_NEG } from './toyData'
import { tokenise, scoreTfidf, scoreEmb, fixed, signed, type Tok } from './toyModel'

/*
  Raw review → tokens → vector → score → probability, for two vectorisers:
  TF-IDF (a long, sparse vector with one slot per vocabulary word) and the average of
  2-D word embeddings (a short, dense vector you can plot). Both feed a logistic regression.
*/

const PRESETS = ['The chicken rice was shiok!', 'Cold laksa and a rude uncle', 'Cheap and good, will come back', 'Not bad at all']
type Mode = 'tfidf' | 'emb'

type Anchor = 'start' | 'middle' | 'end'
interface Box {
  x0: number
  y0: number
  x1: number
  y1: number
}
/** approximate bounding box of a 12px label */
const box = (x: number, y: number, anchor: Anchor, text: string): Box => {
  const w = text.length * 6.9 + 4
  const x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2
  return { x0, y0: y - 11, x1: x0 + w, y1: y + 3 }
}
const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1

const heat = (v: number) => `color-mix(in srgb, var(--viz-1) ${Math.round(18 + v * 72)}%, var(--surface))`

function TokenStrip({ toks }: { toks: Tok[] }) {
  if (!toks.length) return <span className={s.empty}>Type a review above.</span>
  return (
    <div className={s.tokens} aria-label="Tokens">
      {toks.map((t, i) => (
        <span
          key={i}
          className={`${s.tok} ${t.status === 'known' ? s.tokKnown : t.status === 'stop' ? s.tokStop : s.tokUnknown}`}
          title={t.status === 'known' ? 'in the vocabulary' : t.status === 'stop' ? 'stop word: removed' : 'not in the vocabulary: ignored'}
        >
          {t.word}
        </span>
      ))}
    </div>
  )
}

/** Everything drawn inside the embedding plot (needs the plot's scales). */
function EmbLayer({ toks, mean, pos }: { toks: Tok[]; mean: [number, number]; pos: boolean }) {
  const { xs, ys, width } = usePlot()
  const known = [...new Set(toks.filter((t) => t.status === 'known').map((t) => t.word))]
  // decision boundary: EMB_W·[x, y] + EMB_B = 0  →  x = (−EMB_B − EMB_W[1]·y) / EMB_W[0]
  const bx = (y: number) => (-EMB_B - EMB_W[1] * y) / EMB_W[0]
  // group words whose dots (nearly) coincide, then place each label where it overlaps nothing else
  const groups: { x: number; y: number; words: string[] }[] = []
  for (const w of known) {
    const [ex, ey] = EMB[w]
    const g = groups.find((gg) => Math.hypot(xs(gg.x) - xs(ex), ys(gg.y) - ys(ey)) < 9)
    if (g) g.words.push(w)
    else groups.push({ x: ex, y: ey, words: [w] })
  }
  const mx = xs(mean[0])
  const my = ys(mean[1])
  const [left, right] = xs.range()
  const bottom = ys(-0.97) - 4
  const placed: Box[] = [box(xs(0.97), bottom, 'end', 'predicts positive'), box(xs(-0.97), bottom, 'start', 'predicts negative')]
  if (known.length) placed.push(box(mx, my + 25, 'middle', 'average'), { x0: mx - 12, y0: my - 12, x1: mx + 12, y1: my + 12 })
  const labels = groups
    .slice()
    .sort((a, b) => ys(a.y) - ys(b.y))
    .map((g) => {
      const text = g.words.join(', ')
      const px = xs(g.x)
      const py = ys(g.y)
      const options: [number, number, Anchor][] = [
        [px + 8, py + 4, 'start'],
        [px - 8, py + 4, 'end'],
        [px, py - 9, 'middle'],
        [px, py + 18, 'middle'],
      ]
      const fits = (o: [number, number, Anchor]) => {
        const b = box(o[0], o[1], o[2], text)
        return b.x0 >= left - 30 && b.x1 <= Math.min(width, right + 30) && !placed.some((q) => overlaps(q, b))
      }
      const pick = options.find(fits) ?? options.find((o) => { const b = box(o[0], o[1], o[2], text); return b.x0 >= 0 && b.x1 <= width }) ?? options[0]
      placed.push(box(pick[0], pick[1], pick[2], text))
      return { g, text, px, py, pick }
    })
  return (
    <g>
      <Path points={[[bx(1.1), 1.1], [1.1, 1.1], [1.1, -1.1], [bx(-1.1), -1.1]]} closed fill="color-mix(in srgb, var(--viz-pos) 13%, transparent)" color="none" width={0} />
      <Path points={[[bx(1.1), 1.1], [-1.1, 1.1], [-1.1, -1.1], [bx(-1.1), -1.1]]} closed fill="color-mix(in srgb, var(--viz-neg) 11%, transparent)" color="none" width={0} />
      <Path points={[[bx(1.1), 1.1], [bx(-1.1), -1.1]]} color="var(--viz-ink)" width={1.8} dash="6 4" />
      <Label x={0.97} y={-0.97} anchor="end" dy={-4} color="var(--viz-pos)" size={12}>
        predicts positive
      </Label>
      <Label x={-0.97} y={-0.97} anchor="start" dy={-4} color="var(--viz-neg)" size={12}>
        predicts negative
      </Label>
      {VOCAB.map((w) => (
        <circle key={w} cx={xs(EMB[w][0])} cy={ys(EMB[w][1])} r={2.4} style={{ fill: 'var(--viz-muted)', opacity: 0.55 }} />
      ))}
      {known.length > 0 &&
        known.map((w) => <line key={`l${w}`} x1={xs(EMB[w][0])} y1={ys(EMB[w][1])} x2={mx} y2={my} style={{ stroke: 'var(--viz-muted)', strokeWidth: 1.3, strokeDasharray: '3 3' }} />)}
      {labels.map(({ g, px, py }) => (
        <circle key={`d${g.words.join()}`} cx={px} cy={py} r={5.5} style={{ fill: 'var(--viz-1)', stroke: 'var(--surface)', strokeWidth: 1.5 }} />
      ))}
      {labels.map(({ g, text, pick }) => (
        <text key={`t${g.words.join()}`} className="plot-label" x={pick[0]} y={pick[1]} textAnchor={pick[2]} style={{ fontSize: 12 }}>
          {text}
        </text>
      ))}
      {known.length > 0 && (
        <g>
          <path d={`M${mx},${my - 10}L${mx + 10},${my}L${mx},${my + 10}L${mx - 10},${my}Z`} style={{ fill: pos ? 'var(--viz-pos)' : 'var(--viz-neg)', stroke: 'var(--viz-ink)', strokeWidth: 1.8 }} />
          <text className="plot-label" x={mx} y={my + 25} textAnchor="middle" style={{ fontSize: 12.5 }}>
            average
          </text>
        </g>
      )}
    </g>
  )
}

export default function TextClassifierPipeline() {
  const [text, setText] = useState(PRESETS[0])
  const [mode, setMode] = useState<Mode>('tfidf')
  const toks = useMemo(() => tokenise(text), [text])
  const tf = useMemo(() => scoreTfidf(toks), [toks])
  const em = useMemo(() => scoreEmb(toks), [toks])
  const res = mode === 'tfidf' ? tf : em
  const nonZero = tf.vec.filter((v) => v > 0).length
  const nKnown = toks.filter((t) => t.status === 'known').length

  return (
    <Figure
      title="From a review to a prediction"
      caption={
        <>
          Pick an example or type your own hawker review, then switch the vectoriser. Both versions use the same three stages and a logistic regression trained on just{' '}
          {TRAIN_POS.length + TRAIN_NEG.length} toy reviews. Notice how <b>TF-IDF</b> makes a long vector that is almost all zeros, while <b>averaged embeddings</b> squeeze any review into
          one point on the map. Try <i>Not bad at all</i>: both get it wrong, because neither knows what "not" does to the next word.
        </>
      }
    >
      <div className={s.wrap}>
        <SentenceInput label="Review" value={text} onChange={setText} presets={PRESETS} />

        <section className={s.stage} aria-label="Stage 1: tokenise">
          <div className={s.stageHead}>
            <span className={s.stageNum}>1</span> Tokenise
          </div>
          <TokenStrip toks={toks} />
          <div className={s.legend} aria-hidden="true">
            <span>
              <span className={`${s.tok} ${s.tokKnown}`}>word</span> in vocabulary
            </span>
            <span>
              <span className={`${s.tok} ${s.tokStop}`}>the</span> stop word, dropped
            </span>
            <span>
              <span className={`${s.tok} ${s.tokUnknown}`}>wah</span> unknown, ignored
            </span>
          </div>
        </section>
        <div className={s.arrowDown} aria-hidden="true">
          ↓
        </div>

        <section className={s.stage} aria-label="Stage 2: vectorise">
          <div className={s.stageHead}>
            <span className={s.stageNum}>2</span> Vectorise
          </div>
          <Segmented
              label="Vectoriser"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'tfidf', label: 'TF-IDF' },
                { value: 'emb', label: 'Averaged embeddings' },
              ]}
            />
          {mode === 'tfidf' ? (
            <>
              <p className={s.stageNote}>
                One slot per vocabulary word ({VOCAB.length} slots). A slot is non-zero only if its word is in the review: <b>{nonZero}</b> of {VOCAB.length} here.
              </p>
              <div className={s.strip} style={{ gridTemplateColumns: `repeat(${VOCAB.length}, 1fr)` }} role="img" aria-label={`TF-IDF vector with ${nonZero} non-zero entries out of ${VOCAB.length}`}>
                {tf.vec.map((v, j) => (
                  <span key={j} className={s.stripCell} title={`${VOCAB[j]}: ${v.toFixed(2)}`} style={{ background: v > 0 ? heat(v) : 'var(--surface)' }} />
                ))}
              </div>
              <div className={s.entries}>
                {tf.contribs.length ? (
                  tf.contribs.map((c) => (
                    <span key={c.word} className={s.entry} style={{ background: heat(c.value) }}>
                      {c.word} {c.value.toFixed(2)}
                    </span>
                  ))
                ) : (
                  <span className={s.empty}>No vocabulary words: the vector is all zeros.</span>
                )}
              </div>
            </>
          ) : (
            <>
              <p className={s.stageNote}>
                Each word is a point (2 numbers). The review becomes the <b>average</b> of its words' points: always 2 numbers, however long the review. Grey dots are the other vocabulary words.
              </p>
              <Plot x={[-1.1, 1.1]} y={[-1.1, 1.1]} width={440} height={380} minHeight={340} ariaLabel="Word embeddings in 2-D, the average point of the review and the classifier's boundary">
                <Grid xTicks={4} yTicks={4} />
                <EmbLayer toks={toks} mean={em.mean} pos={em.p >= 0.5} />
                <Axes xLabel="how positive →" yLabel="about food ↑" xTicks={4} yTicks={4} />
              </Plot>
              <p className={s.stageNote} style={{ textAlign: 'center' }}>
                average = ({fixed(em.mean[0])}, {fixed(em.mean[1])}) from {nKnown} known word{nKnown === 1 ? '' : 's'}
              </p>
            </>
          )}
        </section>
        <div className={s.arrowDown} aria-hidden="true">
          ↓
        </div>

        <section className={s.stage} aria-label="Stage 3: classify">
          <div className={s.stageHead}>
            <span className={s.stageNum}>3</span> Classify (logistic regression)
          </div>
          {res.contribs.length > 0 ? (
            <DivergingBars ariaLabel="How much each word moves the score" rows={res.contribs.map((c) => ({ key: c.word, label: c.word, value: c.contrib }))} />
          ) : (
            <span className={s.empty}>No known words, so the score is just the bias.</span>
          )}
          <p className={s.sum}>
            {mode === 'tfidf' ? (
              <>
                z = b + Σ w·x = {fixed(TFIDF_B)}
                {tf.contribs.map((c) => ` ${c.contrib < 0 ? '−' : '+'} ${Math.abs(c.contrib).toFixed(2)}`).join('')} = <b>{fixed(tf.z)}</b>
              </>
            ) : (
              <>
                z = b + w·average = {fixed(EMB_B)} + {fixed(EMB_W[0])}×({fixed(em.mean[0])}) {EMB_W[1] < 0 ? '−' : '+'} {Math.abs(EMB_W[1]).toFixed(2)}×({fixed(em.mean[1])}) = <b>{fixed(em.z)}</b>
              </>
            )}
          </p>
          <ProbBar p={res.p} />
          <p className={s.verdict}>
            p = σ(z) = σ({fixed(res.z)}) = <strong>{res.p.toFixed(2)}</strong>, so the model predicts <strong>{res.p >= 0.5 ? 'positive' : 'negative'}</strong>
            {mode === 'emb' ? <> (score {signed(em.z)}: the diamond is on the {em.p >= 0.5 ? 'green' : 'red'} side of the dashed line)</> : null}.
          </p>
        </section>
      </div>
    </Figure>
  )
}
