import { useMemo, useState } from 'react'
import { Figure, Controls, Readout, Button, Plot, Grid, Axes, Path, HLine, Label, useAnimationFrame } from '../../../../../kit'
import { runOneBatch, STEPS, LN_K, SOFTMAX_TWICE_FLOOR, GOOD_LR, HUGE_INIT, type BugId } from './oneBatch'
import { Chip, Chips, CodePanel, Legend, Note, Section, type LineTone } from '../reading-loss-curves/ui'

/*
  Overfit one batch: a tiny network is trained on the same 16 examples for 300 steps, either correctly
  or with one injected bug. Every curve is computed live (see oneBatch.ts). The healthy run stays in
  the background for comparison, and the line ln 4 marks the loss an untrained 4-class model should start at.
*/

const Y_TOP = 1.8

const BUGS: { id: BugId; label: string }[] = [
  { id: 'none', label: 'No bug' },
  { id: 'noZeroGrad', label: 'Missing zero_grad()' },
  { id: 'shuffled', label: 'Labels shuffled on their own' },
  { id: 'softmaxTwice', label: 'Softmax before CrossEntropyLoss' },
  { id: 'frozen', label: 'All weights frozen' },
  { id: 'lrLow', label: 'Learning rate 100× too low' },
  { id: 'hugeInit', label: 'Huge initial weights' },
]

function code(bug: BugId): { lines: string[]; bad: number[] } {
  const lines = [
    'model = Net()          # 2 -> 16 -> 4',
    'params = model.parameters()',
    `opt = Adam(params, lr=${bug === 'lrLow' ? GOOD_LR / 100 : GOOD_LR})`,
    'loss_fn = nn.CrossEntropyLoss()',
    '# ONE batch of 16, reused every step',
    'x, y = next(iter(train_loader))',
    'for step in range(300):',
    '    opt.zero_grad()',
    '    loss = loss_fn(model(x), y)',
    '    loss.backward()',
    '    opt.step()',
  ]
  let bad: number[] = []
  switch (bug) {
    case 'noZeroGrad':
      lines[7] = '    # opt.zero_grad()   (forgotten)'
      bad = [7]
      break
    case 'shuffled':
      lines.splice(7, 0, '    y = y[torch.randperm(16)]')
      bad = [7]
      break
    case 'softmaxTwice':
      lines.splice(8, 1, '    p = model(x).softmax(dim=1)', '    loss = loss_fn(p, y)')
      bad = [8, 9]
      break
    case 'frozen':
      lines.splice(1, 0, 'for p in model.parameters():', '    p.requires_grad = False')
      bad = [1, 2]
      break
    case 'lrLow':
      bad = [2]
      break
    case 'hugeInit':
      lines.splice(1, 0, `model.out.weight.data *= ${HUGE_INIT}`, `model.out.bias.data *= ${HUGE_INIT}`)
      bad = [1, 2]
      break
  }
  return { lines, bad }
}

function verdict(bug: BugId, loss: number[]): { tone: 'good' | 'bad' | 'warn'; text: string } {
  const last = loss[loss.length - 1]
  const tail = loss.slice(100)
  const maxTail = Math.max(...tail)
  switch (bug) {
    case 'none':
      return { tone: 'good', text: `Passes. The loss starts at ${loss[0].toFixed(2)} (close to ln 4 ≈ 1.39) and falls to ${last.toFixed(3)}: the model, loss and training loop can learn. Now try each bug.` }
    case 'noZeroGrad':
      return {
        tone: 'bad',
        text: `Fails. Without zero_grad() every backward() adds onto the old gradients, so each step is pushed by stale gradients from earlier steps. The loss keeps lurching back up (as high as ${maxTail.toFixed(2)} after step 100) instead of settling.`,
      }
    case 'shuffled':
      return {
        tone: 'bad',
        text: `Fails. Each step the same inputs arrive with different labels, so there is no rule to learn: the loss wanders around ln 4 ≈ 1.39 (now ${last.toFixed(2)}), the loss of a model that guesses.`,
      }
    case 'softmaxTwice':
      return {
        tone: 'bad',
        text: `Fails. CrossEntropyLoss applies its own softmax, so the model's outputs pass through softmax twice. Its inputs are then squashed into 0 to 1, and the loss can never go below ln(1 + 3/e) ≈ ${SOFTMAX_TWICE_FLOOR.toFixed(3)}. It is stuck at ${last.toFixed(3)}.`,
      }
    case 'frozen':
      return { tone: 'bad', text: `Fails. The loss is exactly ${loss[0].toFixed(3)} at every step: a perfectly flat line means no weight is being updated at all.` }
    case 'lrLow':
      return {
        tone: 'warn',
        text: `Too slow to tell. After 300 steps the loss has only crept from ${loss[0].toFixed(2)} to ${last.toFixed(2)}. The code may be fine, but the learning rate is far too low: raise it and test again.`,
      }
    case 'hugeInit':
      return {
        tone: 'warn',
        text: `The very first point is the clue: the loss starts at ${loss[0].toFixed(2)}, far above ln 4 ≈ 1.39, because the untrained model is confidently wrong. It recovers here, but in a deep network outputs this large often saturate and stall training. The initial-loss check catches this in one step.`,
      }
  }
}

export default function OverfitOneBatch() {
  const [bug, setBug] = useState<BugId>('none')
  const [progress, setProgress] = useState(STEPS)
  const runs = useMemo(() => {
    const out = {} as Record<BugId, ReturnType<typeof runOneBatch>>
    for (const b of BUGS) out[b.id] = runOneBatch(b.id)
    return out
  }, [])
  const run = runs[bug]
  const healthy = runs.none
  const animating = progress < STEPS
  useAnimationFrame((dt) => setProgress((p) => Math.min(STEPS, p + dt * 190)), animating)

  const pick = (b: BugId) => {
    setBug(b)
    setProgress(0)
  }
  const shownN = Math.floor(progress)
  const pts: [number, number][] = run.loss.slice(0, shownN + 1).map((v, i) => [i, Math.min(v, Y_TOP + 0.5)])
  const v = verdict(bug, run.loss)
  const { lines, bad } = code(bug)
  const tones: Record<number, LineTone> = {}
  bad.forEach((i) => (tones[i] = 'bad'))
  const minLoss = Math.min(...run.loss)
  const offChart = run.loss[0] > Y_TOP

  return (
    <Figure
      title="Overfit one batch"
      caption={
        <>
          A small network (2 inputs, 16 hidden units, 4 classes) trained with Adam on the same 16 examples for 300 steps, computed live in your browser. With no bug it
          memorises the batch and the loss heads to 0. Switch on one bug at a time and compare its curve with the healthy run (faded). The dashed line is ln 4, the
          loss an untrained 4-class model should start at.
        </>
      }
    >
      <Section label="Inject a bug">
        <Chips label="Bug">
          {BUGS.map((b) => (
            <Chip key={b.id} state={b.id === bug ? 'selected' : 'idle'} onClick={() => pick(b.id)}>
              {b.label}
            </Chip>
          ))}
        </Chips>
      </Section>
      <Plot x={[0, STEPS]} y={[0, Y_TOP]} width={560} height={280} minHeight={220} margin={{ left: 44, right: 14, top: 18 }} ariaLabel={`Loss on one batch over 300 steps: ${BUGS.find((b) => b.id === bug)!.label}`}>
        <Grid xTicks={6} yTicks={4} />
        <Axes xLabel="step" yLabel="loss on the batch" xTicks={6} yTicks={4} />
        <HLine y={LN_K} color="var(--ink-3)" label="ln 4 ≈ 1.39" />
        {bug !== 'none' && <Path points={healthy.loss.map((y, i) => [i, y] as [number, number])} color="var(--viz-3)" width={2} opacity={0.3} />}
        <Path points={pts} color={bug === 'none' ? 'var(--viz-3)' : 'var(--viz-2)'} width={2.8} />
        {offChart && (
          <Label x={6} y={Y_TOP} dy={30} dx={6} color="var(--viz-2)" size={12}>
            {`↑ step 0: ${run.loss[0].toFixed(2)} (off the chart)`}
          </Label>
        )}
      </Plot>
      <Legend
        items={[
          { color: bug === 'none' ? 'var(--viz-3)' : 'var(--viz-2)', label: bug === 'none' ? 'healthy run' : 'with the bug' },
          ...(bug !== 'none' ? [{ color: 'var(--viz-3)', label: 'healthy run', faint: true }] : []),
          { color: 'var(--ink-3)', label: 'expected start, ln 4', dash: true, thin: true },
        ]}
      />
      <Controls>
        <Readout
          items={[
            ['loss at step 0', run.loss[0].toFixed(3)],
            ['lowest loss', minLoss.toFixed(3)],
            ['batch accuracy at the end', `${Math.round(run.acc * 100)}%`],
          ]}
        />
        <Button onClick={() => setProgress(0)} disabled={animating}>
          Run again
        </Button>
      </Controls>
      {!animating && <Note tone={v.tone}>{v.text}</Note>}
      <CodePanel lines={lines} tones={tones} title="the one-batch test" size={12} />
    </Figure>
  )
}
