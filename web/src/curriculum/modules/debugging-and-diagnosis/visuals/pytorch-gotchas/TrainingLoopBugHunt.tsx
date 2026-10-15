import { useEffect, useState, type ReactNode } from 'react'
import { Figure, Button, Toggle } from '../../../../../kit'
import { CodePanel, Note, Section, type LineTone } from '../reading-loss-curves/ui'

/*
  Bug hunt: six short PyTorch snippets, each with one classic bug. The learner clicks the line that
  causes it; the explanation and the fixed code appear. An optional 36-second clock per snippet
  matches the Prelim's pace (150 questions in 90 minutes).
*/

interface Snippet {
  title: string
  symptom: ReactNode
  lines: string[]
  /** lines that count as the bug (first is the main one) */
  bug: number[]
  why: ReactNode
  fix: string[]
}

const SNIPPETS: Snippet[] = [
  {
    title: 'The loss lurches about',
    symptom: 'Training starts well, then the loss jumps around more and more.',
    lines: ['optimizer.zero_grad()', 'for x, y in train_loader:', '    loss = loss_fn(model(x), y)', '    loss.backward()', '    optimizer.step()'],
    bug: [0],
    why: (
      <>
        <code>zero_grad()</code> runs once, before the loop. PyTorch <b>adds</b> each new gradient to <code>.grad</code>, so from the second batch on every step is pushed by
        the sum of all the gradients so far, including stale ones from long-gone batches.
      </>
    ),
    fix: ['for x, y in train_loader:', '    optimizer.zero_grad()', '    loss = loss_fn(model(x), y)', '    loss.backward()', '    optimizer.step()'],
  },
  {
    title: 'Validation accuracy wobbles',
    symptom: 'The model has dropout. Running evaluate() twice on the same data gives two different accuracies, both lower than expected.',
    lines: ['def evaluate(model, loader):', '    model.train()', '    hits = 0', '    with torch.no_grad():', '        for x, y in loader:', '            p = model(x).argmax(1)', '            hits += (p == y).sum()', '    return hits.item() / n_val'],
    bug: [1],
    why: (
      <>
        In train mode, dropout still switches off random units on every call and BatchNorm uses the statistics of the current batch (and even updates its running
        averages). Evaluation must use <code>model.eval()</code>. Note that <code>no_grad()</code> does not change the mode: it only stops gradient tracking.
      </>
    ),
    fix: ['def evaluate(model, loader):', '    model.eval()', '    ...'],
  },
  {
    title: 'Epoch 1 is fine, then training changes',
    symptom: 'evaluate() (from the last snippet, now fixed) calls model.eval(). After the first epoch the training loss behaves differently and dropout seems to have no effect.',
    lines: ['model.train()', 'for epoch in range(10):', '    for x, y in train_loader:', '        train_step(model, x, y)', '    acc = evaluate(model, val_loader)'],
    bug: [0],
    why: (
      <>
        <code>model.train()</code> runs only once. The first call to <code>evaluate()</code> switches the model to eval mode and nothing switches it back, so epochs 2 to
        10 train with dropout off (the training loss drops faster and the model overfits more) and with BatchNorm using its stored running statistics, which
        stop updating. Set the mode at the start of every epoch.
      </>
    ),
    fix: ['for epoch in range(10):', '    model.train()', '    for x, y in train_loader:', '        train_step(model, x, y)', '    acc = evaluate(model, val_loader)'],
  },
  {
    title: 'Out of memory at test time',
    symptom: 'Training ran fine, but predicting on the test set crashes with "CUDA out of memory" halfway through.',
    lines: ['model.eval()', 'preds = []', 'for x in test_loader:', '    out = model(x)', '    preds.append(out)', 'preds = torch.cat(preds)'],
    bug: [3, 4],
    why: (
      <>
        Without <code>torch.no_grad()</code> every forward pass records a computation graph so it could backpropagate later, and each stored <code>out</code> keeps its
        graph, with all the layer activations, alive. Memory grows batch after batch. (<code>model.eval()</code> does not switch tracking off.)
      </>
    ),
    fix: ['model.eval()', 'preds = []', 'with torch.no_grad():', '    for x in test_loader:', '        preds.append(model(x))', 'preds = torch.cat(preds)'],
  },
  {
    title: 'Nothing ever changes',
    symptom: 'No error, but the loss is exactly the same every epoch.',
    lines: ['for x, y in train_loader:', '    optimizer.zero_grad()', '    loss = loss_fn(model(x), y)', '    optimizer.step()', '    loss.backward()'],
    bug: [3, 4],
    why: (
      <>
        <code>step()</code> runs before <code>backward()</code>, so it only sees gradients that <code>zero_grad()</code> has just cleared (set to <code>None</code>): no update. The fresh gradients
        are then wiped by the next <code>zero_grad()</code>. The order is always: zero_grad, forward, backward, step.
      </>
    ),
    fix: ['for x, y in train_loader:', '    optimizer.zero_grad()', '    loss = loss_fn(model(x), y)', '    loss.backward()', '    optimizer.step()'],
  },
  {
    title: 'Memory creeps up every step',
    symptom: 'Training slows down and memory use grows a little with every batch until it crashes.',
    lines: ['total = 0', 'for x, y in train_loader:', '    optimizer.zero_grad()', '    loss = loss_fn(model(x), y)', '    loss.backward()', '    optimizer.step()', '    total += loss'],
    bug: [6],
    why: (
      <>
        <code>loss</code> is a tensor that carries autograd history, so <code>total += loss</code> builds one ever-longer chain of history across the whole loop, and
        none of it can be freed. Add the plain number instead.
      </>
    ),
    fix: ['    total += loss.item()   # a Python float'],
  },
]

const LIMIT = 36

interface Result {
  tries: number
  solved: boolean
  timedOut: boolean
  wrong: number | null
}

const fresh = (): Result => ({ tries: 0, solved: false, timedOut: false, wrong: null })

export default function TrainingLoopBugHunt() {
  const [i, setI] = useState(0)
  const [results, setResults] = useState<Result[]>(() => SNIPPETS.map(fresh))
  const [timed, setTimed] = useState(false)
  const [left, setLeft] = useState(LIMIT)
  const sn = SNIPPETS[i]
  const r = results[i]
  const done = r.solved || r.timedOut
  const running = timed && !done

  useEffect(() => {
    if (!running) return
    const t = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearInterval(t)
  }, [running, i])

  useEffect(() => {
    if (running && left === 0) setResults((rs) => rs.map((x, k) => (k === i ? { ...x, timedOut: true } : x)))
  }, [left, running, i])

  const go = (k: number) => {
    setI(k)
    setLeft(LIMIT)
  }
  const click = (line: number) => {
    if (done) return
    const ok = sn.bug.includes(line)
    setResults((rs) => rs.map((x, k) => (k === i ? { ...x, tries: x.tries + 1, solved: ok, wrong: ok ? null : line } : x)))
  }
  const score = results.filter((x) => x.solved && x.tries === 1).length
  const tones: Record<number, LineTone> = {}
  if (done) sn.bug.forEach((b) => (tones[b] = 'ok'))
  if (r.wrong !== null && !done) tones[r.wrong] = 'bad'

  return (
    <Figure
      title="Bug hunt: training loops"
      caption={
        <>
          Each snippet has exactly one bug, and none of them raises an error at the buggy line. Read the symptom, then click the line that causes it. Switch on the clock to practise at
          Prelim pace: 36 seconds is the time you have per question.
        </>
      }
    >
      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }} role="group" aria-label="Snippets">
          {SNIPPETS.map((s, k) => {
            const rr = results[k]
            const mark = rr.solved ? '✓' : rr.timedOut ? '✗' : ''
            return (
              <button
                key={k}
                type="button"
                className={`btn btn-small${k === i ? ' btn-primary' : ''}`}
                onClick={() => go(k)}
                aria-label={`Snippet ${k + 1}: ${s.title}`}
                style={{ minWidth: '2.6rem' }}
              >
                {k + 1}
                {mark && ` ${mark}`}
              </button>
            )
          })}
        </div>
        <span style={{ fontSize: '0.88rem', color: 'var(--ink-2)' }}>
          first-try score <b className="tabular">{score}</b> / {SNIPPETS.length}
        </span>
      </div>
      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', alignItems: 'center' }}>
        <Toggle
          label="36-second clock"
          checked={timed}
          onChange={(v) => {
            setTimed(v)
            setLeft(LIMIT)
          }}
        />
        {timed && (
          <span
            className="tabular"
            aria-live="off"
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              padding: '0.15rem 0.55rem',
              borderRadius: 999,
              background: left <= 10 && running ? 'var(--bad-soft)' : 'var(--surface-2)',
              color: left <= 10 && running ? 'var(--bad)' : 'var(--ink)',
            }}
          >
            {done ? 'stopped' : `${left} s`}
          </span>
        )}
      </div>
      <Section label={`Snippet ${i + 1}: ${sn.title}`}>
        <Note>
          <b>Symptom:</b> {sn.symptom}
        </Note>
      </Section>
      <CodePanel lines={sn.lines} tones={tones} onLineClick={click} disabled={done} title="click the buggy line" size={12.5} />
      {!done && r.wrong !== null && (
        <Note tone="bad">
          Line {r.wrong + 1} is fine. Think about what the symptom says is going wrong, then try again.
        </Note>
      )}
      {done && (
        <>
          <Note tone={r.solved ? 'good' : 'warn'}>
            <b>{r.solved ? (r.tries === 1 ? 'Found it first time.' : `Found it in ${r.tries} tries.`) : "Time's up."}</b> {sn.why}
          </Note>
          <CodePanel lines={sn.fix} title="fixed" size={12.5} tones={{}} />
          {i < SNIPPETS.length - 1 && (
            <div>
              <Button primary onClick={() => go(i + 1)}>
                Next snippet
              </Button>
            </div>
          )}
        </>
      )}
    </Figure>
  )
}
