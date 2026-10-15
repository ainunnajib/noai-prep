import { useState, type ReactNode } from 'react'
import { Figure, Controls, Button, Readout } from '../../../../../kit'
import s from './ed.module.css'

/*
  Sort tasks into the three Transformer families. Select a card (tap or drag) and drop it on a family.
  Feedback explains the choice from the task's input → output shape.
*/

type Fam = 'enc' | 'dec' | 'encdec'

interface Task {
  id: string
  label: string
  fam: Fam
  also?: Fam
  why: string
}

const TASKS: Task[] = [
  { id: 'sentiment', label: 'Is this review positive or negative?', fam: 'enc', why: 'Text in, one label out. An encoder reads the whole review in both directions and a head on [CLS] classifies it.' },
  { id: 'ner', label: 'Tag the people and places in a sentence', fam: 'enc', why: 'Text in, one label per token out. Each tag depends on words on both sides, so an encoder with a small head on every token fits.' },
  { id: 'spam', label: 'Flag spam messages', fam: 'enc', why: 'Another classification: a fixed set of labels, no new text to write. Encoder-only models are small and fast at this.' },
  { id: 'chat', label: 'A chatbot that answers anything', fam: 'dec', why: 'Open-ended text out, written one token at a time: exactly what decoder-only LLMs (GPT, Llama, Qwen) are trained to do.' },
  { id: 'code', label: 'Autocomplete code as you type', fam: 'dec', why: 'Continue a sequence from the left: next-token prediction with a causal mask.' },
  { id: 'translate', label: 'Translate English to Malay', fam: 'encdec', also: 'dec', why: 'One sequence in, a different sequence out (other length, other word order): the encoder reads, the decoder writes with cross-attention (MarianMT, T5).' },
  { id: 'summ', label: 'Summarise a long news article', fam: 'encdec', also: 'dec', why: 'Long text in, short text out: BART and T5 were built for this.' },
  { id: 'asr', label: 'Turn speech into text', fam: 'encdec', why: 'Audio in, text out: an audio encoder and a text decoder joined by cross-attention. This is Whisper.' },
  { id: 'caption', label: 'Write a caption for a photo', fam: 'encdec', why: 'Image in, sentence out: a vision encoder (for example a ViT) and a text decoder that cross-attends to the image.' },
]

const FAMS: { id: Fam; name: string; role: string; models: string; diagram: ReactNode }[] = [
  {
    id: 'enc',
    name: 'Encoder-only',
    role: 'the reader: understands text',
    models: 'BERT, RoBERTa, DistilBERT',
    diagram: <MiniDiagram kind="enc" />,
  },
  {
    id: 'dec',
    name: 'Decoder-only',
    role: 'the writer: continues text',
    models: 'GPT, Llama, Qwen, Gemma',
    diagram: <MiniDiagram kind="dec" />,
  },
  {
    id: 'encdec',
    name: 'Encoder-decoder',
    role: 'the translator: one sequence into another',
    models: 'T5, BART, MarianMT, Whisper',
    diagram: <MiniDiagram kind="encdec" />,
  },
]

const START: Record<string, Fam | null> = Object.fromEntries(TASKS.map((t) => [t.id, null]))
START.sentiment = 'enc'
START.chat = 'dec'

export default function ModelFamilyMap() {
  const [place, setPlace] = useState<Record<string, Fam | null>>(START)
  const [sel, setSel] = useState<string | null>('translate')
  const [last, setLast] = useState<string | null>(null)
  const [over, setOver] = useState<Fam | null>(null)

  const drop = (id: string, fam: Fam) => {
    setPlace((p) => ({ ...p, [id]: fam }))
    setLast(id)
    setSel(null)
    setOver(null)
  }
  const grade = (t: Task) => {
    const f = place[t.id]
    if (!f) return null
    return f === t.fam ? 'ok' : f === t.also ? 'also' : 'bad'
  }
  const placed = TASKS.filter((t) => place[t.id])
  const right = TASKS.filter((t) => grade(t) === 'ok').length
  const deck = TASKS.filter((t) => !place[t.id])
  const selTask = TASKS.find((t) => t.id === sel)
  const lastTask = TASKS.find((t) => t.id === last)
  const famName = (f: Fam) => FAMS.find((x) => x.id === f)!.name

  let feedback: ReactNode = (
    <>
      Two cards are already placed. Pick another card, then choose its family. <b>Hint:</b> look at what goes in and what comes out.
    </>
  )
  let fbClass = s.status
  if (lastTask) {
    const g = grade(lastTask)
    if (g === 'ok') {
      feedback = (
        <>
          ✓ <b>{lastTask.label}</b> → {famName(lastTask.fam)}. {lastTask.why}
        </>
      )
      fbClass = `${s.status} ${s.statusOk}`
    } else if (g === 'also') {
      feedback = (
        <>
          ≈ <b>{lastTask.label}</b>: a large decoder-only LLM can do this too, if you prompt it. The classic fit is <b>{famName(lastTask.fam)}</b>: {lastTask.why}
        </>
      )
      fbClass = `${s.status} ${s.statusWarn}`
    } else if (g === 'bad') {
      feedback = (
        <>
          ✗ <b>{lastTask.label}</b> is not a natural fit for {famName(place[lastTask.id]!)}. Best: <b>{famName(lastTask.fam)}</b>. {lastTask.why}
        </>
      )
      fbClass = `${s.status} ${s.statusBad}`
    }
  }

  const cardCls = (t: Task) => {
    const g = grade(t)
    return [s.card, t.id === sel ? s.cardSel : '', g === 'ok' ? s.cardOk : g === 'also' ? s.cardAlso : g === 'bad' ? s.cardBad : ''].join(' ')
  }
  const mark = (t: Task) => {
    const g = grade(t)
    return g === 'ok' ? '✓ ' : g === 'also' ? '≈ ' : g === 'bad' ? '✗ ' : ''
  }

  return (
    <Figure
      wide
      title="Which family fits the task?"
      caption={
        <>
          Tap a task card, then tap <b>Place here</b> under a family (on a computer you can also drag the card). A card can be moved again by tapping
          it. Notice the rule: the shape of the task decides the architecture. Label or tag the input → encoder. Keep writing → decoder. Turn one
          sequence into a different one → encoder-decoder.
        </>
      }
    >
      <div className={s.deck} aria-label="Task cards still to place">
        {deck.length === 0 ? (
          <span className={s.deckEmpty}>All cards placed.</span>
        ) : (
          deck.map((t) => (
            <button
              key={t.id}
              type="button"
              className={cardCls(t)}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', t.id)
                setSel(t.id)
              }}
              onClick={() => setSel(sel === t.id ? null : t.id)}
              aria-pressed={t.id === sel}
            >
              {t.label}
            </button>
          ))
        )}
      </div>

      <div className={s.cols}>
        {FAMS.map((f) => (
          <div
            key={f.id}
            className={`${s.col} ${selTask ? s.colTarget : ''} ${over === f.id ? s.colDrop : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setOver(f.id)
            }}
            onDragLeave={() => setOver(null)}
            onDrop={(e) => {
              e.preventDefault()
              const id = e.dataTransfer.getData('text/plain')
              if (id) drop(id, f.id)
            }}
          >
            <div className={s.colHead}>
              <span className={s.colName}>{f.name}</span>
              <span className={s.colSub}>{f.role}</span>
            </div>
            {f.diagram}
            <span className={s.colSub}>e.g. {f.models}</span>
            {selTask && (
              <button type="button" className={s.placeBtn} onClick={() => drop(selTask.id, f.id)} aria-label={`Place "${selTask.label}" in ${f.name}`}>
                Place here
              </button>
            )}
            <div className={s.colCards}>
              {TASKS.filter((t) => place[t.id] === f.id).map((t) => (
                <button key={t.id} type="button" className={cardCls(t)} onClick={() => setSel(sel === t.id ? null : t.id)} aria-pressed={t.id === sel} draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', t.id); setSel(t.id) }}>
                  {mark(t)}
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={fbClass} role="status">
        {feedback}
      </div>
      <Controls>
        <Readout
          items={[
            ['placed', `${placed.length} of ${TASKS.length}`],
            ['best fit', `${right} of ${placed.length}`],
          ]}
        />
        <Button
          onClick={() => {
            setPlace(Object.fromEntries(TASKS.map((t) => [t.id, t.fam])))
            setSel(null)
            setLast(null)
          }}
        >
          Show answers
        </Button>
        <Button
          onClick={() => {
            setPlace(START)
            setSel('translate')
            setLast(null)
          }}
        >
          Reset
        </Button>
      </Controls>
    </Figure>
  )
}

function MiniDiagram({ kind }: { kind: Fam }) {
  const box = (x: number, w: number, label: string, color: string) => (
    <g>
      <rect x={x} y={14} width={w} height={26} rx={6} style={{ fill: `color-mix(in srgb, ${color} 16%, var(--surface))`, stroke: color, strokeWidth: 1.4 }} />
      <text x={x + w / 2} y={31} textAnchor="middle" style={{ fill: 'var(--ink)', fontSize: 11, fontWeight: 800 }}>
        {label}
      </text>
    </g>
  )
  const arrow = (x1: number, y1: number, x2: number, y2: number, color = 'var(--viz-muted)') => (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: color, strokeWidth: 1.6 }} />
      <path d={`M${x2},${y2} l-5,-3 l0,6 z`} transform={`rotate(${(Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI} ${x2} ${y2})`} style={{ fill: color }} />
    </g>
  )
  const lab = (x: number, y: number, t: string, anchor: 'start' | 'middle' | 'end' = 'middle') => (
    <text x={x} y={y} textAnchor={anchor} style={{ fill: 'var(--ink-3)', fontSize: 10.5, fontWeight: 600 }}>
      {t}
    </text>
  )
  return (
    <svg viewBox="0 0 200 54" role="img" aria-label={`${kind} diagram`} style={{ width: '100%', maxWidth: 240, height: 'auto', display: 'block' }}>
      {kind === 'enc' && (
        <>
          {lab(4, 31, 'text', 'start')}
          {arrow(28, 27, 54, 27)}
          {box(56, 80, 'Encoder', 'var(--viz-1)')}
          {arrow(136, 27, 162, 27)}
          {lab(196, 31, 'labels', 'end')}
          {lab(96, 52, 'sees both sides')}
        </>
      )}
      {kind === 'dec' && (
        <>
          {lab(4, 31, 'text', 'start')}
          {arrow(28, 27, 54, 27)}
          {box(56, 80, 'Decoder', 'var(--viz-5)')}
          {arrow(136, 27, 162, 27)}
          {lab(196, 31, 'next', 'end')}
          <path d="M150,27 C150,4 96,2 96,12" style={{ fill: 'none', stroke: 'var(--viz-5)', strokeWidth: 1.4, strokeDasharray: '3 3' }} />
          {lab(96, 52, 'left to right, loops')}
        </>
      )}
      {kind === 'encdec' && (
        <>
          {box(2, 76, 'Encoder', 'var(--viz-1)')}
          {arrow(78, 27, 116, 27, 'var(--viz-2)')}
          {lab(97, 10, 'cross-attn')}
          {box(118, 80, 'Decoder', 'var(--viz-5)')}
          {lab(40, 52, 'input')}
          {lab(158, 52, 'output')}
        </>
      )}
    </svg>
  )
}
