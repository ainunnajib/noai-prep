import { useState, type ReactNode } from 'react'
import { Figure, Controls, Toggle, Button, useNarrow } from '../../../../../kit'
import { PyPanel, Out, MONO } from '../training-loop/PyCode'

/*
  Three tensors-to-be (the model's weights, the inputs, the targets) sit on the CPU or on the GPU.
  Tap a chip to move it; press Run to try the forward pass and the loss. Every operation needs all
  of its tensors on one device, otherwise PyTorch raises "Expected all tensors to be on the same
  device". The device-agnostic pattern moves everything to `device` in one go.
*/

type Dev = 'cpu' | 'gpu'
type Item = 'model' | 'inputs' | 'targets'
const ITEMS: Item[] = ['model', 'inputs', 'targets']
const LABEL: Record<Item, string> = { model: 'model (weights)', inputs: 'inputs', targets: 'targets' }
const COLOUR: Record<Item, string> = { model: 'var(--viz-5)', inputs: 'var(--viz-1)', targets: 'var(--viz-2)' }
const NAME: Record<Dev, string> = { cpu: 'cpu', gpu: 'cuda:0' }

interface Result {
  tone: 'ok' | 'err'
  /** what the console prints */
  text: string
  /** our explanation underneath */
  note: string
  line?: number
}

function codeLines(place: Record<Item, Dev>, agnostic: boolean): string[] {
  return agnostic
    ? [
        "device = 'cuda' if torch.cuda.is_available() else 'cpu'",
        'model = Net().to(device)',
        'inputs = inputs.to(device)',
        'targets = targets.to(device)',
        'outputs = model(inputs)',
        'loss = criterion(outputs, targets)',
        'print(loss.device)',
      ]
    : [
        place.model === 'gpu' ? "model = Net().to('cuda')" : 'model = Net()',
        place.inputs === 'gpu' ? "inputs = inputs.to('cuda')" : '# inputs stay on the CPU',
        place.targets === 'gpu' ? "targets = targets.to('cuda')" : '# targets stay on the CPU',
        'outputs = model(inputs)',
        'loss = criterion(outputs, targets)',
        'print(loss.device)',
      ]
}

/** What running the code does, line by line, for this placement. */
function evaluate(place: Record<Item, Dev>, hasGpu: boolean, n: number): Result {
  const m = place.model
  const i = place.inputs
  const t = place.targets
  if (m !== i)
    return {
      tone: 'err',
      line: n - 3,
      text: `RuntimeError: Expected all tensors to be on the same device, but got mat1 is on ${NAME[i]}, different from other tensors on ${NAME[m]} (when checking argument in method wrapper_CUDA_addmm)`,
      note: `Raised by outputs = model(inputs). Inside nn.Linear, "mat1" is your inputs (on ${NAME[i]}) and the "other tensors" are the layer's weight and bias (on ${NAME[m]}).`,
    }
  if (m !== t)
    return {
      tone: 'err',
      line: n - 2,
      text: `RuntimeError: Expected all tensors to be on the same device, but found at least two devices, ${NAME[m]} and ${NAME[t]}!`,
      note: `The forward pass worked, so outputs lives on ${NAME[m]} (where the model is). The loss then meets targets on ${NAME[t]}.`,
    }
  return {
    tone: 'ok',
    line: n - 1,
    text: NAME[m],
    note: `Everything is on ${NAME[m]}, so the forward pass and the loss both run${m === 'cpu' && hasGpu ? ', but on the CPU: the GPU sits idle' : ''}.`,
  }
}

const NO_CUDA: Result = {
  tone: 'err',
  text: 'AssertionError: Torch not compiled with CUDA enabled',
  note: "This laptop has a CPU-only install of PyTorch, so .to('cuda') itself fails (other installs raise a RuntimeError about a missing NVIDIA driver or GPU instead). Hard-coding 'cuda' breaks code on laptops; the device-agnostic pattern avoids it.",
}

export default function DeviceMismatch() {
  const [place, setPlace] = useState<Record<Item, Dev>>({ model: 'gpu', inputs: 'cpu', targets: 'cpu' })
  const [hasGpu, setHasGpu] = useState(true)
  const [agnostic, setAgnostic] = useState(false)
  // 'run' = show the result of running the current code; 'nocuda' = the last move failed; null = not run yet
  const [shown, setShown] = useState<'run' | 'nocuda' | null>('run')
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)

  const lines = codeLines(place, agnostic)
  const ran = shown === 'run' ? evaluate(place, hasGpu, lines.length) : shown === 'nocuda' ? NO_CUDA : null
  const result: Result | null =
    ran && agnostic && ran.tone === 'ok'
      ? { ...ran, note: hasGpu ? "device became 'cuda', and the model and every batch followed it." : "Same code, no GPU: device became 'cpu', and everything still runs." }
      : ran

  const move = (it: Item) => {
    const to: Dev = place[it] === 'cpu' ? 'gpu' : 'cpu'
    setAgnostic(false)
    if (to === 'gpu' && !hasGpu) {
      setShown('nocuda')
      return
    }
    setPlace({ ...place, [it]: to })
    setShown(null)
  }
  const run = () => setShown('run')
  const applyPattern = () => {
    const d: Dev = hasGpu ? 'gpu' : 'cpu'
    setPlace({ model: d, inputs: d, targets: d })
    setAgnostic(true)
    setShown(null)
  }

  const box = (d: Dev, title: ReactNode, sub: string) => {
    const off = d === 'gpu' && !hasGpu
    return (
      <div
        style={{
          flex: '1 1 0',
          minWidth: 0,
          border: `2px ${off ? 'dashed' : 'solid'} ${d === 'gpu' ? 'var(--viz-3)' : 'var(--viz-axis)'}`,
          borderRadius: 12,
          padding: '8px 10px 10px',
          background: off ? 'var(--surface-2)' : `color-mix(in srgb, ${d === 'gpu' ? 'var(--viz-3)' : 'var(--viz-axis)'} 7%, var(--surface))`,
          display: 'grid',
          gap: 6,
          alignContent: 'start',
          minHeight: 150,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 750, fontSize: 15, color: 'var(--ink)' }}>{title}</span>
          <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--ink-3)' }}>{sub}</span>
        </div>
        {off && <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>No CUDA GPU on this machine.</div>}
        {ITEMS.filter((it) => place[it] === d).map((it) => (
          <button
            key={it}
            type="button"
            onClick={() => move(it)}
            aria-label={`${LABEL[it]} is on ${NAME[d]}. Move it to ${d === 'cpu' ? 'the GPU' : 'the CPU'}`}
            style={{
              font: 'inherit',
              fontSize: 13.5,
              fontWeight: 700,
              textAlign: 'left',
              padding: '7px 10px',
              borderRadius: 9,
              border: `2px solid ${COLOUR[it]}`,
              background: `color-mix(in srgb, ${COLOUR[it]} 16%, var(--surface))`,
              color: 'var(--ink)',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <span>{LABEL[it]}</span>
            <span aria-hidden="true" style={{ color: 'var(--ink-3)', fontWeight: 600 }}>
              {d === 'cpu' ? 'move →' : '← move'}
            </span>
          </button>
        ))}
      </div>
    )
  }

  const tones: Record<number, 'ok' | 'bad' | 'warn' | 'hl'> = {}
  if (result?.line != null) tones[result.line] = result.tone === 'ok' ? 'ok' : 'bad'

  return (
    <Figure
      title="Where does each tensor live?"
      caption={
        <>
          Tap a chip to move it between the CPU and the GPU, then press <b>Run</b>. The forward pass needs the model's weights and the inputs on one device; the loss needs the outputs and the
          targets on one device. Then press <b>Use the device-agnostic pattern</b>, and switch off the GPU: the code does not change, and it still runs on a laptop.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'flex', flexDirection: narrow ? 'column' : 'row', gap: 10 }}>
        {box('cpu', 'CPU', 'RAM')}
        {box('gpu', 'GPU', hasGpu ? 'cuda:0, own memory' : 'not available')}
      </div>
      <PyPanel lines={lines} tones={tones} size={narrow ? 12 : 13} />
      <Controls>
        <Button primary onClick={run}>
          Run
        </Button>
        <Button onClick={applyPattern}>Use the device-agnostic pattern</Button>
        <Toggle
          label="this machine has a CUDA GPU"
          checked={hasGpu}
          onChange={(v) => {
            setHasGpu(v)
            setShown(null)
            // the device-agnostic code needs no change: device simply follows the machine
            if (agnostic) setPlace({ model: v ? 'gpu' : 'cpu', inputs: v ? 'gpu' : 'cpu', targets: v ? 'gpu' : 'cpu' })
            else if (!v) setPlace({ model: 'cpu', inputs: 'cpu', targets: 'cpu' })
          }}
        />
      </Controls>
      <Out tone={result?.tone === 'err' ? 'err' : 'out'}>{result ? result.text : '(press Run to execute the code above)'}</Out>
      {result && <div style={{ width: '100%', fontSize: 13.5, lineHeight: 1.5, color: result.tone === 'err' ? 'var(--ink-2)' : 'var(--ok)', fontWeight: result.tone === 'ok' ? 650 : 400 }}>{result.note}</div>}
    </Figure>
  )
}
