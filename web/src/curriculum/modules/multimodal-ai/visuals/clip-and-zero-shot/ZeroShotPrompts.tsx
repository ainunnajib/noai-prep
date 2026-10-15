import { useState } from 'react'
import { Figure, Toggle, Button, useNarrow, M } from '../../../../../kit'
import { Thumb } from './Thumb'
import { AXES, IMAGES, add, cosine, encodeText, imageEmbedding, normalise, softmax, type ImageId, type Vec } from './toyClip'
import s from './clip.module.css'

/*
  Zero-shot classification with the toy CLIP: one text prompt per class, embed, compare with the
  picture's embedding by cosine similarity, softmax over (cosine / τ), pick the biggest.
  Edit the template, the class names, or switch on a prompt ensemble: the classifier changes
  instantly, with no training.
*/

const TEST: ImageId[] = ['cat', 'jaguar', 'mouse']
const TAU = 0.1
const PRESETS = ['{}', 'a photo of a {}', 'a photo of a {}, a type of wild animal', 'a drawing of a {}']
const ENSEMBLE = ['a photo of a {}', 'a close-up photo of a {}', 'a photo of a {} in the wild', 'a photo of a {}, a type of animal']
const START_CLASSES = ['cat', 'dog', 'jaguar', 'leopard', 'mouse']

const fill = (tpl: string, c: string) => (tpl.includes('{}') ? tpl.split('{}').join(c) : `${tpl} ${c}`.trim())

function classEmbedding(templates: string[], c: string): { v: Vec; senses: string[] } {
  let sum = new Array(AXES.length).fill(0) as Vec
  const senses: string[] = []
  for (const t of templates) {
    const e = encodeText(fill(t, c))
    sum = add(sum, e.v)
    for (const tok of e.tokens) if (tok.kind === 'ambiguous' && tok.sense) senses.push(tok.sense)
  }
  return { v: normalise(sum), senses }
}

export default function ZeroShotPrompts() {
  const [img, setImg] = useState<ImageId>('jaguar')
  const [tpl, setTpl] = useState('a photo of a {}')
  const [ens, setEns] = useState(false)
  const [classes, setClasses] = useState<string[]>(START_CLASSES)
  const [draft, setDraft] = useState('')
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)

  const templates = ens ? ENSEMBLE : [tpl]
  const iv = imageEmbedding(img)
  const rows = classes.map((c) => {
    const { v, senses } = classEmbedding(templates, c)
    return { c, cos: cosine(iv, v), senses }
  })
  const probs = softmax(rows.map((r) => r.cos / TAU))
  const win = probs.indexOf(Math.max(...probs))
  const second = probs.map((p, k) => [p, k] as const).filter(([, k]) => k !== win).sort((a, b) => b[0] - a[0])[0]?.[1] ?? win
  const nearTie = classes.length > 1 && probs[win] < 1.6 / classes.length
  const truth = IMAGES[img].label
  const correct = rows[win]?.c.toLowerCase().trim() === truth
  const truthListed = classes.some((c) => c.toLowerCase().trim() === truth)
  const unknown = classes.filter((c) => encodeText(c).known === 0)

  const addClass = () => {
    const c = draft.toLowerCase().replace(/[^a-z ]/g, '').trim()
    if (c && !classes.includes(c) && classes.length < 8) setClasses([...classes, c])
    setDraft('')
  }

  // how the toy read ambiguous class names
  const senseNotes = rows
    .filter((r) => r.senses.length)
    .map((r) => {
      const counts = new Map<string, number>()
      r.senses.forEach((x) => counts.set(x, (counts.get(x) ?? 0) + 1))
      const parts = [...counts.entries()].map(([k, n]) => (templates.length > 1 ? `${k} in ${n} of ${templates.length} prompts` : k))
      return `“${r.c}” as ${parts.join(', ')}`
    })

  return (
    <Figure
      wide
      title="Build a classifier out of words"
      caption={
        <>
          Each class becomes a sentence; the class whose sentence lands closest to the picture wins. Probabilities are a softmax of{' '}
          <M>{'\\cos/\\tau'}</M> with <M>{'\\tau = 0.1'}</M> in this toy. Start with the jaguar: with <i>a photo of a jaguar</i> the toy cannot tell whether you mean the
          big cat or the car, so <i>leopard</i> wins. Pick the template that adds <i>a type of wild animal</i>, or switch on the ensemble, and the same picture is now
          classified correctly. Then try that wild-animal template on the computer mouse: it backfires, and the probabilities collapse to a guess. Add or remove classes too. Nothing is retrained at any point:
          changing the words changes the classifier.
        </>
      }
    >
      <div ref={ref} className={`${s.zsTop} ${narrow ? s.zsTopNarrow : ''}`}>
        <div style={{ display: 'grid', gap: '0.4rem', justifyItems: 'center' }}>
          <Thumb id={img} size={104} title={IMAGES[img].name} />
          <div className={s.imgPick} role="group" aria-label="Choose the test picture">
            {TEST.map((id) => (
              <button key={id} type="button" className={s.imgBtn} aria-pressed={img === id} aria-label={`Test picture: ${IMAGES[id].name}`} onClick={() => setImg(id)}>
                <Thumb id={id} size={34} title={IMAGES[id].name} />
              </button>
            ))}
          </div>
          <span className={s.senseNote}>
            true label: <b>{truth}</b>
          </span>
        </div>

        <div style={{ display: 'grid', gap: '0.7rem', width: '100%', minWidth: 0 }}>
          <div className={s.field}>
            <label className={s.inputLabel} htmlFor="zs-tpl">
              Prompt template ({'{}'} = class name)
            </label>
            <input id="zs-tpl" className={s.input} type="text" value={ens ? 'ensemble of 4 templates (below)' : tpl} disabled={ens} maxLength={70} spellCheck={false} onChange={(e) => setTpl(e.target.value)} />
            {!ens && (
              <div className={s.chips} role="group" aria-label="Template presets">
                {PRESETS.map((p) => (
                  <button key={p} type="button" className={s.chip} aria-pressed={tpl === p} style={tpl === p ? { borderColor: 'var(--accent)', color: 'var(--ink)' } : undefined} onClick={() => setTpl(p)}>
                    {p}
                  </button>
                ))}
              </div>
            )}
            {!ens && !tpl.includes('{}') && <span className={s.senseNote}>No {'{}'} in the template, so the class name is added at the end.</span>}
          </div>
          <Toggle label="Prompt ensemble: average the embeddings of 4 templates" checked={ens} onChange={setEns} />
          {ens && (
            <ol className={s.ensList}>
              {ENSEMBLE.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          )}
          <div className={s.field}>
            <span className={s.inputLabel}>Classes</span>
            <div className={s.classList}>
              {classes.map((c) => (
                <span key={c} className={s.classChip}>
                  {c}
                  <button type="button" className={s.chipX} aria-label={`Remove class ${c}`} disabled={classes.length <= 2} onClick={() => setClasses(classes.filter((x) => x !== c))}>
                    ×
                  </button>
                </span>
              ))}
              <input
                className={s.smallInput}
                type="text"
                value={draft}
                placeholder="add a class…"
                aria-label="Add a class name"
                maxLength={24}
                spellCheck={false}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addClass()
                }}
              />
              <Button onClick={addClass} disabled={!draft.trim() || classes.length >= 8}>
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className={s.table} role="table" aria-label="Similarity and probability for each class">
        <span className={s.th} role="columnheader">
          {ens ? 'class (4 prompts averaged)' : 'prompt sent to the text encoder'}
        </span>
        <span className={s.th} role="columnheader" style={{ textAlign: 'right' }}>
          cos
        </span>
        <span className={s.th} role="columnheader">
          probability
        </span>
        <span className={s.th} role="columnheader" />
        {rows.map((r, k) => (
          <div key={r.c} role="row" style={{ display: 'contents' }}>
            <span role="cell" className={`${s.prompt} ${k === win ? s.promptWin : ''}`}>
              {ens ? r.c : fill(tpl, r.c)}
            </span>
            <span role="cell" className={s.num}>
              {r.cos.toFixed(2)}
            </span>
            <span role="cell" className={s.bar}>
              <span className={s.barFill} style={{ width: `${probs[k] * 100}%`, background: k === win ? 'var(--viz-3)' : 'var(--viz-muted)' }} />
            </span>
            <span role="cell" className={s.num} style={{ fontWeight: k === win ? 800 : 500 }}>
              {(probs[k] * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>

      <div className={s.verdict} aria-live="polite">
        Prediction: <b>{rows[win]?.c}</b>{' '}
        {truthListed ? correct ? <span className={s.ok}>✓ correct</span> : <span className={s.bad}>✗ wrong (it is a {truth})</span> : <span className={s.bad}>(“{truth}” is not one of your classes)</span>}
        {nearTie && (
          <>
            {' '}
            but only just: {Math.round(probs[win] * 100)}% against {Math.round(probs[second] * 100)}% for “{rows[second].c}”. Random guessing among {classes.length} classes would give{' '}
            {Math.round(100 / classes.length)}% each, so this classifier is barely better than a guess.
          </>
        )}
        {senseNotes.length > 0 && (
          <>
            <br />
            <span className={s.senseNote}>The toy text encoder read {senseNotes.join('; ')}.</span>
          </>
        )}
        {unknown.length > 0 && (
          <>
            <br />
            <span className={s.senseNote}>Not in the toy vocabulary (so only the template counts): {unknown.join(', ')}.</span>
          </>
        )}
      </div>
    </Figure>
  )
}
