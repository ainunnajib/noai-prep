import { useMemo, useState } from 'react'
import { Figure, Controls, Segmented } from '../../../../../kit'
import { GAME, type Guess } from './realData'
import s from './bg.module.css'

/*
  Hide one word and compare two real models' guesses for it:
  BERT sees the words on BOTH sides of the [MASK]; GPT-2 sees only the words to the LEFT.
  Numbers are real outputs of bert-base-uncased and gpt2 (see realData.ts).
*/

const LABELS = ['football', 'coffee', 'library', 'train']
const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()
const pct = (p: number) => (p >= 0.1 ? `${(p * 100).toFixed(0)}%` : p >= 0.001 ? `${(p * 100).toFixed(1)}%` : p >= 0.0001 ? `${(p * 100).toFixed(2)}%` : '<0.01%')

function GuessPanel({ title, sub, g, truth, context, on }: { title: string; sub: string; g: Guess; truth: string; context: React.ReactNode; on: boolean }) {
  const top = Math.max(...g.top.map((t) => t[1]), g.p)
  const inTop = g.top.some((t) => same(t[0], truth))
  return (
    <div className={`${s.panel} ${on ? s.panelOn : ''}`}>
      <div className={s.panelTitle}>
        <span>{title}</span>
        <span className={s.panelSub}>{sub}</span>
      </div>
      <div className={s.tokens} style={{ fontSize: '0.9rem' }}>
        {context}
      </div>
      <div className={s.rows} aria-label={`${title} top guesses`}>
        {g.top.map(([w, p]) => (
          <div key={w} className={`${s.row} ${same(w, truth) ? s.rowStrong : ''}`}>
            <span className={s.rowLabel}>{w}</span>
            <span className={s.track} aria-hidden="true">
              <span className={s.fill} style={{ width: `${(p / top) * 100}%`, background: same(w, truth) ? 'var(--viz-3)' : 'var(--viz-1)' }} />
            </span>
            <span className={s.val}>{pct(p)}</span>
          </div>
        ))}
        {!inTop && (
          <div className={`${s.row} ${s.rowStrong}`}>
            <span className={s.rowLabel}>{truth}</span>
            <span className={s.track} aria-hidden="true">
              <span className={s.fill} style={{ width: `${Math.max(1.5, (g.p / top) * 100)}%`, background: 'var(--viz-3)' }} />
            </span>
            <span className={s.val}>{pct(g.p)}</span>
          </div>
        )}
      </div>
      <p className={s.hint}>
        P("<b>{truth}</b>") = <b>{pct(g.p)}</b>
        {!inTop && ' (not in the top 5)'}
        {g.pieces && g.pieces.length > 1 && <> · GPT-2 spells it as {g.pieces.length} pieces, so this is their product</>}
      </p>
    </div>
  )
}

export default function MaskedWordGame() {
  const [si, setSi] = useState(0)
  const [maskRaw, setMask] = useState(7)
  const sent = GAME[si]
  const words = sent.words
  const mask = sent.preds[maskRaw] ? maskRaw : 1
  const pr = sent.preds[mask]!
  const truth = words[mask]

  const stats = useMemo(() => {
    let wins = 0
    let n = 0
    GAME.forEach((g) =>
      g.preds.forEach((p) => {
        if (!p) return
        n++
        if (p.both.p > p.left.p) wins++
      }),
    )
    return { wins, n }
  }, [])

  const ratio = pr.both.p / Math.max(pr.left.p, 1e-12)
  const verdict =
    ratio >= 2
      ? `Seeing both sides made "${truth}" about ${ratio >= 100 ? Math.round(ratio).toLocaleString('en-GB') : ratio.toFixed(0)} times more likely.`
      : ratio > 0.5
        ? `Here the two models are about equally sure: the left side already says most of what there is to know.`
        : `A rare case where the left-only model does better: BERT's right-hand clues pointed it elsewhere.`

  const ctxBoth = words.map((w, j) => (
    <span key={j} className={`${s.tok} ${j === mask ? s.tokMask : ''}`} style={{ minHeight: '1.6rem', padding: '0.05rem 0.4rem' }}>
      {j === mask ? '[MASK]' : w}
    </span>
  ))
  const ctxLeft = words.map((w, j) => (
    <span key={j} className={`${s.tok} ${j === mask ? s.tokMask : j > mask ? s.tokHidden : ''}`} style={{ minHeight: '1.6rem', padding: '0.05rem 0.4rem' }}>
      {j === mask ? 'next?' : w}
    </span>
  ))

  return (
    <Figure
      wide
      title="Fill in the blank: both sides versus left only"
      caption={
        <>
          Click any word to hide it. The BERT panel shows the guesses of a real BERT (bert-base-uncased), which reads the words on <b>both</b> sides of
          the gap. The GPT-2 panel shows a real GPT-2, which reads only the words to the <b>left</b>, because that is all a next-word predictor ever
          gets. Hide "match" or "students": the
          words after the gap give the answer away. Across all {stats.n} words in these sentences, BERT gives the true word a higher probability{' '}
          {stats.wins} times. (Deleting the right side and asking BERT instead does not work: it was never trained that way, and it just guesses a full
          stop.)
        </>
      }
    >
      <Controls>
        <Segmented label="sentence" value={si} onChange={(v) => setSi(v)} options={LABELS.map((l, i) => ({ value: i, label: l }))} />
      </Controls>
      <div className={s.tokens} role="group" aria-label="Click a word to hide it">
        {words.map((w, j) =>
          sent.preds[j] ? (
            <button
              key={j}
              type="button"
              className={`${s.tok} ${s.tokBtn} ${j === mask ? s.tokMask : ''}`}
              onClick={() => setMask(j)}
              aria-pressed={j === mask}
              aria-label={`hide "${w}"`}
            >
              {j === mask ? '[MASK]' : w}
            </button>
          ) : (
            <span key={j} className={s.tok}>
              {w}
            </span>
          ),
        )}
      </div>
      <div className={s.pair}>
        <GuessPanel title="BERT" sub="sees both sides" g={pr.both} truth={truth} context={ctxBoth} on={pr.both.p >= pr.left.p} />
        <GuessPanel title="GPT-2" sub="sees the left only" g={pr.left} truth={truth} context={ctxLeft} on={pr.left.p > pr.both.p} />
      </div>
      <div className={`${s.status} ${ratio >= 2 ? s.statusOk : ''}`} role="status">
        Hidden word: <b>{truth}</b>. {verdict}
      </div>
    </Figure>
  )
}
