import { useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Slider, Segmented, Readout, usePlayer, PlayerControls } from '../../../../../kit'
import s from './emb.module.css'

/*
  Word2Vec training pairs from a sentence. For each centre word, the context is the words at most
  `window` positions away. Skip-gram makes one (centre -> context word) pair per context word;
  CBOW makes one (all context words -> centre) example per position.
*/

const DEFAULT = 'the uncle cooks spicy laksa at the hawker centre'

export default function SkipGramWindow() {
  const [text, setText] = useState(DEFAULT)
  const [win, setWin] = useState(2)
  const [mode, setMode] = useState<'skip' | 'cbow'>('skip')
  const words = useMemo(() => (text.toLowerCase().match(/[a-z0-9']+/g) ?? []).slice(0, 14), [text])
  const player = usePlayer({ steps: Math.max(1, words.length), interval: 1100, loop: false })
  const centre = Math.min(player.step, Math.max(0, words.length - 1))
  // start with "laksa" as the centre word
  useEffect(() => {
    player.setStep(4)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ctx = words.map((_, j) => j).filter((j) => j !== centre && Math.abs(j - centre) <= win)
  const totalSkip = words.reduce((acc, _, i) => acc + words.filter((__, j) => j !== i && Math.abs(j - i) <= win).length, 0)

  return (
    <Figure
      wide
      title="Free training data from a sliding window"
      caption={
        <>
          Press <b>Play</b> or tap any word to make it the centre. Every word within <i>window</i> positions of it is a context word. In{' '}
          <b>skip-gram</b> each (centre → context) pair is one training example: “given <i>laksa</i>, predict <i>spicy</i>”. <b>CBOW</b> turns it
          round and predicts the centre from all its context words together. No human labels anything: the text itself supplies the answers, so any
          amount of text becomes training data.
        </>
      }
    >
      <div style={{ width: '100%', display: 'grid', gap: '0.3rem' }}>
        <label className={s.label} htmlFor="sg-text">
          Sentence
        </label>
        <input
          id="sg-text"
          className={s.input}
          value={text}
          spellCheck={false}
          onChange={(e) => {
            setText(e.target.value)
            player.reset()
          }}
        />
      </div>
      <div className={s.sentence} role="group" aria-label="Words of the sentence">
        {words.map((w, j) => {
          const isC = j === centre
          const isX = ctx.includes(j)
          return (
            <button
              key={j}
              type="button"
              className={`${s.word} ${isC ? s.wordCentre : isX ? s.wordContext : ''}`}
              onClick={() => {
                player.pause()
                player.setStep(j)
              }}
              aria-pressed={isC}
            >
              {w}
              <span className={s.wordRole} style={{ color: isC ? 'var(--viz-2)' : 'var(--viz-1)' }}>
                {isC ? 'centre' : isX ? `${j < centre ? '−' : '+'}${Math.abs(j - centre)}` : ''}
              </span>
            </button>
          )
        })}
      </div>
      <PlayerControls player={player} label={(st) => `centre word ${Math.min(st, words.length - 1) + 1} of ${words.length}`} />
      <Controls>
        <Slider label="window size" value={win} min={1} max={4} step={1} onChange={setWin} />
        <Segmented
          label="model"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'skip', label: 'skip-gram' },
            { value: 'cbow', label: 'CBOW' },
          ]}
        />
      </Controls>
      <div className={s.panel}>
        <span className={s.label}>{mode === 'skip' ? `Training pairs from this position (${ctx.length})` : 'Training example from this position (1)'}</span>
        <div className={s.pairs} aria-live="polite">
          {words.length === 0 ? (
            <span className={s.small}>type a sentence</span>
          ) : mode === 'skip' ? (
            ctx.map((j) => (
              <span key={j} className={s.pair}>
                {words[centre]}
                <span className={s.arrow}>→</span>
                {words[j]}
              </span>
            ))
          ) : (
            <span className={s.pair}>
              [{ctx.map((j) => words[j]).join(', ')}]<span className={s.arrow}>→</span>
              <b>{words[centre]}</b>
            </span>
          )}
        </div>
      </div>
      <Readout
        items={[
          ['skip-gram pairs in the whole sentence', String(totalSkip)],
          ['CBOW examples', String(words.length)],
        ]}
      />
    </Figure>
  )
}
