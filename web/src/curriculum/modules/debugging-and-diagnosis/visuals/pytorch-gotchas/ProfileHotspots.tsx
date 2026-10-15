import { useState } from 'react'
import { Figure, Bars, Button, Toggle } from '../../../../../kit'
import { Chip, Chips, CodePanel, Note, Section } from '../reading-loss-curves/ui'
import s from './pg.module.css'

/*
  Measure, don't guess. One epoch of a small MLP (200 -> 64 -> 10, batches of 64, 6,400 rows) whose
  data is stored as Python lists. The times were measured with cProfile on one CPU core with
  PyTorch 2.x (the run with the median total out of 9), grouped into five parts. Your machine will
  give different numbers, but the same picture.
*/

type Part = 'data' | 'forward' | 'backward' | 'step' | 'other'

const PARTS: { id: Part; label: string; colour: string }[] = [
  { id: 'data', label: 'list → tensor (torch.tensor)', colour: 'var(--viz-neg)' },
  { id: 'forward', label: 'forward pass', colour: 'var(--viz-1)' },
  { id: 'backward', label: 'backward pass', colour: 'var(--viz-5)' },
  { id: 'step', label: 'optimiser step', colour: 'var(--viz-3)' },
  { id: 'other', label: 'everything else', colour: 'var(--viz-muted)' },
]

// milliseconds per epoch, measured (see the comment above)
const SLOW: Record<Part, number> = { data: 749, forward: 116, backward: 155, step: 88, other: 82 }
const FAST: Record<Part, number> = { data: 0, forward: 98, backward: 125, step: 52, other: 73 }
const total = (r: Record<Part, number>) => PARTS.reduce((t, p) => t + r[p.id], 0)

const SLOW_CODE = ['# rows: 6,400 Python lists of 200 floats', 'for i in range(0, 6400, 64):', '    x = torch.tensor(rows[i:i+64])', '    y = torch.tensor(labels[i:i+64])', '    opt.zero_grad()', '    loss = loss_fn(model(x), y)', '    loss.backward()', '    opt.step()']
const FAST_CODE = ['X = torch.tensor(rows)      # once', 'Y = torch.tensor(labels)', 'for i in range(0, 6400, 64):', '    x, y = X[i:i+64], Y[i:i+64]', '    opt.zero_grad()', '    loss = loss_fn(model(x), y)', '    loss.backward()', '    opt.step()']

const GUESSES: { id: Part; label: string }[] = [
  { id: 'forward', label: 'the forward pass' },
  { id: 'backward', label: 'the backward pass' },
  { id: 'step', label: 'the optimiser step' },
  { id: 'data', label: 'turning lists into tensors' },
]

export default function ProfileHotspots() {
  const [guess, setGuess] = useState<Part | null>(null)
  const [shown, setShown] = useState(false)
  const [fixed, setFixed] = useState(false)
  const prof = fixed ? FAST : SLOW
  const tot = total(prof)
  const top = PARTS.reduce((a, p) => (prof[p.id] > prof[a.id] ? p : a), PARTS[0])
  const reveal = shown || guess !== null

  return (
    <Figure
      title="Measure, don't guess: a profile"
      caption={
        <>
          One epoch of a small network whose data is kept as Python lists. Guess which part is slowest, then look at the profile (measured with cProfile on one CPU
          core; your numbers will differ, the picture will not). Then apply the fix and profile again.
        </>
      }
    >
      <CodePanel lines={fixed ? FAST_CODE : SLOW_CODE} tones={fixed ? { 0: 'ok', 1: 'ok', 3: 'ok' } : reveal ? { 2: 'bad', 3: 'bad' } : undefined} title={fixed ? 'after the fix' : 'one training epoch'} size={12} />
      {!fixed && (
        <Section label="Your guess: where does most of the time go?">
          <Chips label="Guess">
            {GUESSES.map((g) => (
              <Chip key={g.id} state={guess === g.id ? (g.id === 'data' ? 'good' : 'bad') : 'idle'} onClick={() => setGuess(g.id)}>
                {g.label}
              </Chip>
            ))}
          </Chips>
        </Section>
      )}
      {!reveal ? (
        <div>
          <Button onClick={() => setShown(true)}>Just show me the profile</Button>
        </div>
      ) : (
        <>
          <Bars
            ariaLabel="Time per part of the epoch"
            max={SLOW.data}
            format={(v) => `${Math.round(v)} ms`}
            data={PARTS.map((p) => ({ label: p.label, value: prof[p.id], color: p.colour, strong: p.id === top.id }))}
          />
          <div className={s.total}>
            <span>
              total: <b>{tot} ms</b> per epoch
            </span>
            <span>
              biggest part: <b>{Math.round((100 * prof[top.id]) / tot)}%</b> {top.label}
            </span>
          </div>
          <Toggle label="Fix: convert the data to tensors once, before the loop" checked={fixed} onChange={setFixed} />
          <Note tone={fixed ? 'good' : guess === 'data' ? 'good' : 'warn'}>
            {fixed ? (
              <>
                <b>
                  {total(SLOW)} ms → {total(FAST)} ms, about {(total(SLOW) / total(FAST)).toFixed(1)}× faster
                </b>{' '}
                per epoch, without touching the model. The conversion (about {SLOW.data} ms) now happens once before training instead of in every epoch, so a
                20-epoch run drops from about {((20 * total(SLOW)) / 1000).toFixed(0)} s to about {((SLOW.data + 20 * total(FAST)) / 1000).toFixed(1)} s. The
                remaining time is spread over the real work: forward, backward and the update.
              </>
            ) : (
              <>
                {guess === 'data' ? <b>Good instinct. </b> : guess ? <b>Most people guess the model. </b> : null}
                About {Math.round((100 * SLOW.data) / total(SLOW))}% of the epoch goes on <code>torch.tensor(...)</code>, copying Python lists into tensors again in every
                epoch. The model itself is a small fraction. Without a profiler you would have optimised the wrong thing.
              </>
            )}
          </Note>
        </>
      )}
    </Figure>
  )
}
