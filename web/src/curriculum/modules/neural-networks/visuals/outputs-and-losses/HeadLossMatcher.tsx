import { useEffect, useRef, useState } from 'react'
import { Figure, Button, CodeBlock, useNarrow } from '../../../../../kit'
import s from './heads.module.css'

/*
  Tap a task, then the output layer + loss that fits it (or the other way round). Correct pairs are
  joined by a line and show the matching PyTorch code; wrong pairs explain what would go wrong.
*/

type TaskId = 'reg' | 'bin' | 'multi' | 'tags'
type HeadId = 'linear' | 'sigmoid' | 'softmax' | 'sigmoids'

const TASKS: { id: TaskId; text: string; sub: string; color: string }[] = [
  { id: 'reg', text: 'Predict tomorrow’s PSI air-quality reading', sub: 'a number such as 42 or 118', color: 'var(--viz-3)' },
  { id: 'bin', text: 'Is this email spam?', sub: 'yes or no', color: 'var(--viz-2)' },
  { id: 'multi', text: 'Which digit, 0 to 9, is in this image?', sub: 'exactly one of 10 classes', color: 'var(--viz-1)' },
  { id: 'tags', text: 'Which of 5 hawker dishes appear in this photo?', sub: 'any number of them at once', color: 'var(--viz-4)' },
]

const HEADS: { id: HeadId; text: string; sub: string }[] = [
  { id: 'sigmoids', text: 'K logits → a sigmoid on each', sub: 'loss: binary cross-entropy for every label' },
  { id: 'linear', text: '1 output, no activation', sub: 'loss: mean squared error (or MAE)' },
  { id: 'softmax', text: 'K logits → softmax', sub: 'loss: cross-entropy' },
  { id: 'sigmoid', text: '1 logit → sigmoid', sub: 'loss: binary cross-entropy' },
]

const ANSWER: Record<TaskId, HeadId> = { reg: 'linear', bin: 'sigmoid', multi: 'softmax', tags: 'sigmoids' }

const CODE: Record<TaskId, string> = {
  reg: `head = nn.Linear(64, 1)        # 1 number, no activation
loss_fn = nn.MSELoss()         # or nn.L1Loss() for MAE
pred = head(h).squeeze(1)      # shape (N,)
loss = loss_fn(pred, y)        # y: floats, shape (N,)`,
  bin: `head = nn.Linear(64, 1)        # 1 logit, NO sigmoid here
loss_fn = nn.BCEWithLogitsLoss()  # sigmoid is inside
logit = head(h).squeeze(1)     # shape (N,)
loss = loss_fn(logit, y)       # y: 0.0 or 1.0, shape (N,)
p_spam = torch.sigmoid(logit)  # probability, if needed`,
  multi: `head = nn.Linear(64, 10)       # 10 logits, NO softmax here
loss_fn = nn.CrossEntropyLoss()  # log-softmax is inside
logits = head(h)               # shape (N, 10)
loss = loss_fn(logits, y)      # y: class indices, shape (N,)
digit = logits.argmax(dim=1)   # the predicted class`,
  tags: `head = nn.Linear(64, 5)        # 5 logits, one per dish
loss_fn = nn.BCEWithLogitsLoss()  # sigmoid + BCE per logit
logits = head(h)               # shape (N, 5)
loss = loss_fn(logits, y)      # y: 0/1 floats, shape (N, 5)
present = torch.sigmoid(logits) > 0.5`,
}

const WHY: Record<TaskId, string> = {
  reg: 'A PSI reading can be any size, so the last neuron must output a raw number: no sigmoid or softmax to squash it. MSE punishes big errors heavily; MAE is gentler on outliers.',
  bin: 'One yes/no question needs one logit. The sigmoid turns it into P(spam) between 0 and 1, and binary cross-entropy scores that probability.',
  multi: 'Exactly one digit is correct, so the 10 probabilities should share 100%: that is what softmax does. Cross-entropy then takes −ln of the probability given to the true digit.',
  tags: 'Each dish is its own yes/no question, and several can be "yes" at once, so each logit gets its own sigmoid and its own binary cross-entropy. The probabilities do not have to add up to 1.',
}

function wrongReason(t: TaskId, h: HeadId): { msg: string; near?: boolean } {
  if (t === 'reg') return { msg: 'A sigmoid or softmax squashes outputs to between 0 and 1, but a PSI reading can be 42 or 118. Regression needs a raw number with no squashing.' }
  if (t === 'bin') {
    if (h === 'softmax')
      return {
        near: true,
        msg: 'With K = 2 logits, softmax works and equals a sigmoid, but the standard, simpler head for one yes/no question is one logit with a sigmoid (BCEWithLogitsLoss).',
      }
    if (h === 'sigmoids') return { msg: '"A sigmoid on each of K logits" is for K separate yes/no questions. Spam or not is a single question: one logit is enough.' }
    return { msg: 'A raw number with MSE can go below 0 or above 1, so it is not a probability, and MSE even punishes predictions that are "too right" (say 3 for a label of 1). Squash one logit with a sigmoid and use binary cross-entropy.' }
  }
  if (t === 'multi') {
    if (h === 'sigmoids')
      return { msg: 'Separate sigmoids treat each digit as an independent yes/no question, so the model could say "3: 90%, 8: 90%". Exactly one digit is true, so the probabilities should share 100%: softmax.' }
    if (h === 'sigmoid') return { msg: 'One sigmoid answers one yes/no question, but here there are 10 possible answers.' }
    return { msg: 'One raw number cannot give a probability for each of 10 classes, and treating digits as numbers wrongly says that a "7" is closer to an "8" than to a "1".' }
  }
  if (h === 'softmax')
    return { msg: 'Softmax forces the 5 dish probabilities to add up to 1, so if a photo shows chicken rice AND satay, they must share the probability. Each dish needs its own yes/no.' }
  if (h === 'sigmoid') return { msg: 'One logit answers one yes/no question, but there are 5 dishes to check.' }
  return { msg: 'A single raw number cannot say which of 5 dishes are present.' }
}

type Line = { x1: number; y1: number; x2: number; y2: number; color: string }

export default function HeadLossMatcher() {
  const [matched, setMatched] = useState<Partial<Record<TaskId, HeadId>>>({ multi: 'softmax' })
  const [selTask, setSelTask] = useState<TaskId | null>(null)
  const [selHead, setSelHead] = useState<HeadId | null>(null)
  const [last, setLast] = useState<{ kind: 'good' | 'bad' | 'meh'; task: TaskId; head: HeadId } | null>({ kind: 'good', task: 'multi', head: 'softmax' })
  const [wrongFlash, setWrongFlash] = useState(0)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const boardRef = useRef<HTMLDivElement>(null)
  const taskRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const headRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [lines, setLines] = useState<Line[]>([])

  const headOwner = (h: HeadId) => (Object.keys(matched) as TaskId[]).find((t) => matched[t] === h)

  const tryPair = (t: TaskId, h: HeadId) => {
    setSelTask(null)
    setSelHead(null)
    if (ANSWER[t] === h) {
      setMatched((m) => ({ ...m, [t]: h }))
      setLast({ kind: 'good', task: t, head: h })
    } else {
      setLast({ kind: wrongReason(t, h).near ? 'meh' : 'bad', task: t, head: h })
      setWrongFlash((n) => n + 1)
    }
  }
  const clickTask = (t: TaskId) => {
    if (selHead) tryPair(t, selHead)
    else if (matched[t]) setLast({ kind: 'good', task: t, head: matched[t]! })
    else setSelTask(selTask === t ? null : t)
  }
  const clickHead = (h: HeadId) => {
    const owner = headOwner(h)
    if (selTask) tryPair(selTask, h)
    else if (owner) setLast({ kind: 'good', task: owner, head: h })
    else setSelHead(selHead === h ? null : h)
  }

  // Measure card positions and draw connecting lines (wide layout only).
  useEffect(() => {
    const board = boardRef.current
    if (!board || narrow) {
      setLines([])
      return
    }
    const measure = () => {
      const b = board.getBoundingClientRect()
      const out: Line[] = []
      for (const t of TASKS) {
        const h = matched[t.id]
        const te = taskRefs.current[t.id]
        const he = h ? headRefs.current[h] : null
        if (!h || !te || !he) continue
        const tr = te.getBoundingClientRect()
        const hr = he.getBoundingClientRect()
        out.push({ x1: tr.right - b.left, y1: tr.top + tr.height / 2 - b.top, x2: hr.left - b.left, y2: hr.top + hr.height / 2 - b.top, color: t.color })
      }
      setLines(out)
    }
    measure()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    ro?.observe(board)
    return () => ro?.disconnect()
  }, [matched, narrow])

  useEffect(() => {
    if (!wrongFlash) return
    const id = window.setTimeout(() => setWrongFlash(0), 400)
    return () => window.clearTimeout(id)
  }, [wrongFlash])

  const done = Object.keys(matched).length
  const taskOf = (id: TaskId) => TASKS.find((t) => t.id === id)!
  const headOf = (id: HeadId) => HEADS.find((h) => h.id === id)!

  return (
    <Figure
      title="Match each task to its output layer and loss"
      caption={
        <>
          Tap a task, then the output layer and loss that fit it (one pair is done for you). A correct pair is joined up and shows its PyTorch code; a wrong pair explains
          what would go wrong. Notice that the model itself never contains the final sigmoid or softmax: <code>BCEWithLogitsLoss</code> and <code>CrossEntropyLoss</code>{' '}
          apply them inside, so the model hands over raw logits.
        </>
      }
    >
      <div ref={wrapRef} className={s.wrap}>
        <div ref={boardRef} className={`${s.board} ${narrow ? s.boardNarrow : ''}`}>
          <div className={s.col}>
            <div className={s.colTitle}>The task</div>
            {TASKS.map((t) => {
              const m = matched[t.id]
              const isWrong = wrongFlash > 0 && last?.kind !== 'good' && last?.task === t.id
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    taskRefs.current[t.id] = el
                  }}
                  type="button"
                  className={`${s.card} ${selTask === t.id ? s.selected : ''} ${isWrong ? s.wrong : ''}`}
                  style={m ? { borderColor: t.color } : undefined}
                  aria-pressed={selTask === t.id}
                  onClick={() => clickTask(t.id)}
                >
                  <span className={s.cardMain}>{t.text}</span>
                  <span className={s.cardSub}>{t.sub}</span>
                  {m && narrow && (
                    <span className={s.tag} style={{ background: t.color }}>
                      ✓ {headOf(m).text}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          {!narrow && <div aria-hidden="true" />}
          <div className={s.col}>
            <div className={s.colTitle}>Output layer + loss</div>
            {HEADS.map((h) => {
              const owner = headOwner(h.id)
              const isWrong = wrongFlash > 0 && last?.kind !== 'good' && last?.head === h.id
              return (
                <button
                  key={h.id}
                  ref={(el) => {
                    headRefs.current[h.id] = el
                  }}
                  type="button"
                  className={`${s.card} ${selHead === h.id ? s.selected : ''} ${isWrong ? s.wrong : ''}`}
                  style={owner ? { borderColor: taskOf(owner).color } : undefined}
                  aria-pressed={selHead === h.id}
                  onClick={() => clickHead(h.id)}
                >
                  <span className={s.cardMain}>{h.text}</span>
                  <span className={s.cardSub}>{h.sub}</span>
                </button>
              )
            })}
          </div>
          {!narrow && (
            <svg className={s.lines} aria-hidden="true">
              {lines.map((l, i) => (
                <g key={i}>
                  <path
                    d={`M${l.x1},${l.y1} C${l.x1 + 30},${l.y1} ${l.x2 - 30},${l.y2} ${l.x2},${l.y2}`}
                    style={{ fill: 'none', stroke: l.color, strokeWidth: 3, strokeLinecap: 'round' }}
                  />
                  <circle cx={l.x1} cy={l.y1} r={4.5} style={{ fill: l.color }} />
                  <circle cx={l.x2} cy={l.y2} r={4.5} style={{ fill: l.color }} />
                </g>
              ))}
            </svg>
          )}
        </div>
        <div className={s.row}>
          <span className={s.score}>
            {done} of 4 matched{done === 4 ? ': all correct!' : selTask ? ': now tap an output layer' : selHead ? ': now tap a task' : ''}
          </span>
          <Button
            onClick={() => {
              setMatched({})
              setLast(null)
              setSelTask(null)
              setSelHead(null)
            }}
          >
            Start again
          </Button>
        </div>
        <div className={`${s.feedback} ${last ? s[last.kind] : ''}`} aria-live="polite">
          {!last ? (
            <>Tap a task card to begin.</>
          ) : last.kind === 'good' ? (
            <>
              <b>{taskOf(last.task).text}</b> → <b>{headOf(last.head).text}</b>. {WHY[last.task]}
              <CodeBlock code={CODE[last.task]} title="PyTorch" showLineNumbers={false} />
            </>
          ) : (
            <>
              <b>{last.kind === 'meh' ? 'Nearly.' : 'Not quite.'}</b> {wrongReason(last.task, last.head).msg}
            </>
          )}
        </div>
      </div>
    </Figure>
  )
}
