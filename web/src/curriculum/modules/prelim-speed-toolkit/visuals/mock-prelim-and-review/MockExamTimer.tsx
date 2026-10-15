import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Figure, Button, Bars, Plot, Rect, HLine, Axes, Label, useAnimationFrame } from '../../../../../kit'
import m from './mp.module.css'

/*
  A 10-question, 6-minute mini mock at real Prelim pace (36 s a question), in the five domain
  blocks of the 2026 paper. Exam interface: navigator, flag, countdown, a checkpoint alert at
  half time and a sweep alert with a minute left. After submitting: score, a time-per-question
  chart against the 36 s line, a domain breakdown and the answers with explanations.
*/

type Dom = 'Maths' | 'Computing' | 'AI/ML/DL' | 'GenAI' | 'Problem solving'
type Kind = 'recall' | 'computation' | 'code reading' | 'scenario'
interface MQ {
  dom: Dom
  kind: Kind
  q: string
  code?: string
  options: string[]
  answer: number
  why: string
}

const QS: MQ[] = [
  {
    dom: 'Maths',
    kind: 'computation',
    q: 'What is the dot product of [2, −1, 3] and [4, 0, −2]?',
    options: ['14', '2', '−2', '8'],
    answer: 1,
    why: '2·4 + (−1)·0 + 3·(−2) = 8 + 0 − 6 = 2. 14 drops the minus sign on −2.',
  },
  {
    dom: 'Maths',
    kind: 'computation',
    q: 'A 2 × 2 matrix has trace 5 and determinant 6. What are its eigenvalues?',
    options: ['1 and 6', '5 and 6', '2 and 3', '−2 and −3'],
    answer: 2,
    why: 'The eigenvalues add up to the trace (5) and multiply to the determinant (6): 2 + 3 = 5 and 2 × 3 = 6.',
  },
  {
    dom: 'Computing',
    kind: 'code reading',
    q: 'What does this print?',
    code: 'x = np.arange(12).reshape(3, 4)\nprint(x[:, 1].shape)',
    options: ['(4,)', '(3, 1)', '(1, 4)', '(3,)'],
    answer: 3,
    why: 'x[:, 1] takes column 1 from every one of the 3 rows. The integer index removes that axis, leaving a 1-D array of length 3.',
  },
  {
    dom: 'Computing',
    kind: 'recall',
    q: 'In a PyTorch training loop, which call clears the gradients left over from the previous step?',
    options: ['optimiser.zero_grad()', 'loss.backward()', 'optimiser.step()', 'model.eval()'],
    answer: 0,
    why: '.backward() adds to the stored gradients, so zero_grad() must reset them every step. step() applies the update; eval() switches dropout and batch norm to test mode.',
  },
  {
    dom: 'AI/ML/DL',
    kind: 'computation',
    q: 'A spam filter flags 50 emails, and 40 of them really are spam. The inbox held 80 spam emails in total. What is the filter’s recall?',
    options: ['0.8', '0.5', '0.4', '0.625'],
    answer: 1,
    why: 'Recall = TP / (TP + FN) = 40 / 80 = 0.5: it caught half of the spam. 0.8 = 40 / 50 is the precision.',
  },
  {
    dom: 'AI/ML/DL',
    kind: 'scenario',
    q: 'A network reaches 99% training accuracy but only 70% validation accuracy. Which change is most likely to help?',
    options: ['Train for many more epochs so it fits the data better', 'Add regularisation, such as dropout or weight decay', 'Double the number of layers to add more capacity', 'Raise the learning rate tenfold to escape the minimum'],
    answer: 1,
    why: 'A big train–validation gap is overfitting. Regularisation limits memorisation; more epochs or a bigger network make overfitting worse.',
  },
  {
    dom: 'GenAI',
    kind: 'recall',
    q: 'When sampling text from an LLM, what does the temperature control?',
    options: [
      'The maximum number of tokens it may generate',
      'How many earlier tokens it can attend to',
      'How random the choice of each next token is',
      'The learning rate used when it was fine-tuned',
    ],
    answer: 2,
    why: 'Temperature rescales the logits before softmax: high temperature flattens the probabilities (more random), low temperature sharpens them, and 0 means always pick the most likely token.',
  },
  {
    dom: 'GenAI',
    kind: 'recall',
    q: 'Why does retrieval-augmented generation (RAG) tend to reduce hallucinations?',
    options: [
      'It retrains the model on the documents before every question',
      'It puts relevant source text into the prompt for the answer to rely on',
      'It only allows words that appear in the training data',
      'It sets the temperature to zero for factual questions',
    ],
    answer: 1,
    why: 'RAG retrieves passages and adds them to the prompt, so the model can ground its answer in real text. The weights are not changed.',
  },
  {
    dom: 'Problem solving',
    kind: 'scenario',
    q: 'Training loss falls steadily for 200 steps, then suddenly jumps to NaN. You are using plain SGD with a learning rate of 0.5 and no gradient clipping. What should you try first?',
    options: [
      'Collect more training data before retraining',
      'Add more layers so the model has more capacity',
      'Switch the loss function to mean squared error',
      'Lower the learning rate, or clip the gradients',
    ],
    answer: 3,
    why: 'A sudden NaN after stable progress is the classic sign of exploding updates: a learning rate of 0.5 is large. Lowering it or clipping gradients is the cheap first test.',
  },
  {
    dom: 'Problem solving',
    kind: 'scenario',
    q: 'A fraud detector scores 99.5% accuracy on a test set in which 0.5% of transactions are fraud. What should you check first?',
    options: [
      'Whether it just predicts “not fraud” for everything: check recall on the fraud class',
      'Whether 99.5% could rise to 100% with a few more epochs of training',
      'Whether the model has too few parameters for the size of the data set',
      'Whether accuracy would be higher with a larger batch size during training',
    ],
    answer: 0,
    why: 'Predicting “not fraud” every time already scores 99.5% here. With heavy imbalance, accuracy hides failure; recall (and precision) on the rare class tell the truth.',
  },
]

const N = QS.length
const PER_Q = 36
const DURATION = N * PER_Q
const DOMS: Dom[] = ['Maths', 'Computing', 'AI/ML/DL', 'GenAI', 'Problem solving']

const mmss = (sec: number) => {
  const s = Math.max(0, Math.ceil(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function Inline({ text }: { text: string }) {
  const parts = text.split('`')
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <code key={i}>{p}</code> : <span key={i}>{p}</span>))}
    </>
  )
}

function TimeChart({ spent, answers }: { spent: number[]; answers: (number | null)[] }) {
  const top = Math.max(60, Math.ceil(Math.max(...spent) / 10) * 10 + 10)
  return (
    <Plot x={[0.4, N + 0.6]} y={[0, top]} width={520} height={220} minHeight={200} margin={{ left: 44, bottom: 34, top: 12, right: 12 }} ariaLabel="Seconds spent on each question, with the 36-second average marked">
      <Axes hideXTicks yTicks={4} yLabel="seconds" />
      {spent.map((s, i) => {
        const a = answers[i]
        const colour = a === null ? 'var(--viz-muted)' : a === QS[i].answer ? 'var(--viz-pos)' : 'var(--viz-neg)'
        return <Rect key={i} x0={i + 1 - 0.32} x1={i + 1 + 0.32} y0={0} y1={Math.max(0.5, s)} fill={colour} rx={2} />
      })}
      <HLine y={PER_Q} color="var(--viz-2)" dash="5 4" width={2} label="36 s = exam pace" />
      {spent.map((_, i) => (
        <Label key={i} x={i + 1} y={0} dy={17} anchor="middle" size={11}>
          {`Q${i + 1}`}
        </Label>
      ))}
    </Plot>
  )
}

export default function MockExamTimer() {
  const [phase, setPhase] = useState<'ready' | 'running' | 'done'>('ready')
  const [t, setT] = useState(0)
  const [cur, setCur] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(N).fill(null))
  const [flags, setFlags] = useState<boolean[]>(() => Array(N).fill(false))
  const [spent, setSpent] = useState<number[]>(() => Array(N).fill(0))
  const [seenCheckpoint, setSeenCheckpoint] = useState(false)
  const curRef = useRef(0)
  curRef.current = cur

  useAnimationFrame((dt) => {
    setT((x) => Math.min(DURATION, x + dt))
    setSpent((s) => {
      const n = s.slice()
      n[curRef.current] += dt
      return n
    })
  }, phase === 'running')

  useEffect(() => {
    if (phase === 'running' && t >= DURATION) setPhase('done')
  }, [t, phase])

  const start = () => {
    setPhase('running')
    setT(0)
    setCur(0)
    setAnswers(Array(N).fill(null))
    setFlags(Array(N).fill(false))
    setSpent(Array(N).fill(0))
    setSeenCheckpoint(false)
  }

  const answered = answers.filter((a) => a !== null).length
  const blanks = N - answered
  const left = DURATION - t
  const q = QS[cur]
  const running = phase === 'running'
  const done = phase === 'done'
  const right = answers.filter((a, i) => a === QS[i].answer).length

  let banner: ReactNode = null
  if (running && left <= 60) {
    banner = (
      <div className={`${m.banner} ${blanks ? m.bannerBad : m.bannerGood}`} role="status">
        <strong>One minute left: sweep.</strong> {blanks ? `${blanks} question${blanks === 1 ? ' has' : 's have'} no answer yet. Put a best guess on every one: a blank always scores 0.` : 'Every question has an answer. Use the time on your flags.'}
      </div>
    )
  } else if (running && t >= DURATION / 2 && !seenCheckpoint) {
    const ok = answered >= N / 2
    banner = (
      <div className={`${m.banner} ${ok ? m.bannerGood : m.bannerBad}`} role="status">
        <strong>Checkpoint, {mmss(DURATION / 2)} gone.</strong> The must-hit mark is Q{N / 2}; you have answered {answered}. {ok ? 'On pace: keep going.' : 'Behind: switch to speed mode, guess and flag the slow ones.'}{' '}
        <button type="button" className="btn btn-small" onClick={() => setSeenCheckpoint(true)}>
          OK
        </button>
      </div>
    )
  }

  if (done) {
    const slow = spent.map((s, i) => [s, i] as const).sort((a, b) => b[0] - a[0])[0]
    const over = spent.filter((s) => s > PER_Q).length
    const kinds: Kind[] = ['recall', 'computation', 'code reading', 'scenario']
    return (
      <Figure title="Mini mock: your results" caption={<>Green bars were right, red wrong, grey blank. Bars above the dashed line took longer than exam pace. Untimed practice can never show you this chart: where your time goes is the part of your performance that only a timed mock measures.</>}>
        <div className={m.wrap}>
          <div className={m.examBar}>
            <span className={m.clock}>
              {right} / {N}
            </span>
            <span className="tabular" style={{ fontSize: '0.9rem', color: 'var(--ink-2)' }}>
              {blanks ? `${blanks} blank (guessing them would add ${blanks / 4} expected) · ` : ''}time used {mmss(Math.min(t, DURATION))} of {mmss(DURATION)}
            </span>
          </div>
          <div className={m.nav} aria-label="Results per question">
            {QS.map((qq, i) => (
              <button key={i} type="button" className={`${m.navBtn} ${answers[i] === null ? '' : answers[i] === qq.answer ? m.navRight : m.navWrong} ${flags[i] ? m.navFlag : ''}`} disabled aria-label={`Question ${i + 1}: ${answers[i] === null ? 'blank' : answers[i] === qq.answer ? 'right' : 'wrong'}${flags[i] ? ', flagged' : ''}`}>
                {i + 1}
              </button>
            ))}
          </div>
          <TimeChart spent={spent} answers={answers} />
          <div className={m.banner}>
            {over ? (
              <>
                {over} question{over === 1 ? '' : 's'} took longer than 36 s. The slowest was Q{slow[1] + 1} ({Math.round(slow[0])} s, {QS[slow[1]].kind}). Over 150 questions, every extra 10 s on one question is a question you may not reach.
              </>
            ) : blanks > 0 ? (
              <>
                No question took longer than 36 s, but {blanks} {blanks === 1 ? 'was' : 'were'} left blank. On the real paper a blank always scores 0, so leave a best guess on every question
                before you submit.
              </>
            ) : (
              <>Every question was under 36 s. On the full paper, keep that pace for 90 minutes.</>
            )}
          </div>
          <Bars
            ariaLabel="Right answers per domain"
            max={2}
            format={(v) => `${v} / 2`}
            data={DOMS.map((d, i) => ({ label: d, value: QS.filter((qq, j) => qq.dom === d && answers[j] === qq.answer).length, color: `var(--viz-${i + 1})` }))}
          />
          <div style={{ fontSize: '0.88rem', color: 'var(--ink-2)' }}>
            By question type:{' '}
            {kinds
              .map((k) => {
                const all = QS.map((qq, j) => [qq, j] as const).filter(([qq]) => qq.kind === k)
                return `${k} ${all.filter(([qq, j]) => answers[j] === qq.answer).length}/${all.length}`
              })
              .join(' · ')}
          </div>
          <ol className={m.plan} style={{ paddingLeft: 0, marginLeft: 0 }}>
            {QS.map((qq, i) => {
              const a = answers[i]
              const ok = a === qq.answer
              return (
                <li key={i} className={m.planItem}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                    <strong>Q{i + 1}</strong>
                    <span className={m.tag} style={{ color: 'var(--ink-3)' }}>
                      {qq.dom} · {qq.kind}
                    </span>
                    {flags[i] && (
                      <span className={m.tag} style={{ color: 'var(--viz-2)' }}>
                        flagged
                      </span>
                    )}
                    <span style={{ color: ok ? 'var(--viz-pos)' : 'var(--viz-neg)', fontWeight: 750 }}>{a === null ? 'blank' : ok ? 'right' : 'wrong'}</span>
                    <span className="tabular" style={{ color: 'var(--ink-3)', fontSize: '0.8rem' }}>
                      {Math.round(spent[i])} s
                    </span>
                  </div>
                  <div>
                    <Inline text={qq.q} />
                    {qq.code && (
                      <pre style={{ margin: '0.3rem 0 0', padding: '0.35rem 0.5rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-s)', fontSize: '0.82rem', overflowX: 'auto' }}>
                        <code>{qq.code}</code>
                      </pre>
                    )}
                  </div>
                  <div style={{ color: 'var(--ink-2)' }}>
                    {a !== null && !ok && <>You: {qq.options[a]}. </>}
                    Answer: <strong>{qq.options[qq.answer]}</strong>. {qq.why}
                  </div>
                </li>
              )
            })}
          </ol>
          <div className="controls" style={{ justifyContent: 'center' }}>
            <Button primary onClick={start}>
              Sit it again
            </Button>
            <Button onClick={() => setPhase('ready')}>Back to the start</Button>
          </div>
        </div>
      </Figure>
    )
  }

  return (
    <Figure
      title="Mini mock: 10 questions in 6 minutes"
      caption={
        <>
          Real Prelim pace: 36 s a question, two questions from each domain, in domain blocks like the 2026 paper. Answer, flag and move around with the numbered navigator; you get a checkpoint
          alert at half time and a sweep alert with a minute left. Nothing is marked until you submit. (The real Prelim is a Google Form with no flag button, so keep your flags on scrap paper there.)
        </>
      }
    >
      <div className={m.wrap}>
        <div className={m.examBar}>
          <span className={`${m.clock} ${running && left <= 60 ? m.clockLow : ''}`} aria-live="off">
            {mmss(left)}
          </span>
          <span className="tabular" style={{ fontSize: '0.88rem', color: 'var(--ink-2)' }}>
            answered {answered}/{N} · flagged {flags.filter(Boolean).length}
          </span>
          {running ? (
            <Button primary onClick={() => setPhase('done')}>
              Submit
            </Button>
          ) : (
            <Button primary onClick={start}>
              Start the clock
            </Button>
          )}
        </div>
        <div className={m.nav} role="group" aria-label="Question navigator">
          {QS.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${m.navBtn} ${answers[i] !== null ? m.navAnswered : ''} ${i === cur ? m.navCurrent : ''} ${flags[i] ? m.navFlag : ''}`}
              onClick={() => setCur(i)}
              disabled={!running}
              aria-label={`Question ${i + 1}${answers[i] !== null ? ', answered' : ''}${flags[i] ? ', flagged' : ''}`}
              aria-current={i === cur}
            >
              {i + 1}
            </button>
          ))}
        </div>
        {banner}
        <div className={m.qcard}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className={m.tag} style={{ color: 'var(--ink-3)' }}>
              Q{cur + 1} · {q.dom}
            </span>
            {flags[cur] && (
              <span className={m.tag} style={{ color: 'var(--viz-2)' }}>
                flagged
              </span>
            )}
          </div>
          <div className={m.qtext}>
            <Inline text={q.q} />
          </div>
          {q.code && (
            <pre style={{ margin: 0, padding: '0.5rem 0.65rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-s)', fontSize: '0.88rem', overflowX: 'auto' }}>
              <code>{q.code}</code>
            </pre>
          )}
          <div role="radiogroup" aria-label={`Options for question ${cur + 1}`} style={{ display: 'grid', gap: '0.4rem' }}>
            {q.options.map((o, i) => {
              const on = answers[cur] === i
              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  className={`${m.choice} ${on ? m.choiceOn : ''}`}
                  disabled={!running}
                  onClick={() => setAnswers((a) => a.map((x, j) => (j === cur ? (x === i ? null : i) : x)))}
                >
                  <span className={`${m.dot} ${on ? m.dotOn : ''}`} aria-hidden="true" />
                  <span>{o}</span>
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'space-between' }}>
            <Button onClick={() => setCur((c) => Math.max(0, c - 1))} disabled={!running || cur === 0}>
              Back
            </Button>
            <Button onClick={() => setFlags((f) => f.map((x, j) => (j === cur ? !x : x)))} disabled={!running}>
              {flags[cur] ? 'Unflag' : 'Flag for later'}
            </Button>
            <Button primary={running && cur < N - 1} onClick={() => setCur((c) => Math.min(N - 1, c + 1))} disabled={!running || cur === N - 1}>
              Next
            </Button>
          </div>
        </div>
        {!running && <div style={{ fontSize: '0.86rem', color: 'var(--ink-3)', textAlign: 'center' }}>Have scrap paper and a pen ready, no calculator. The clock starts when you press Start.</div>}
      </div>
    </Figure>
  )
}
