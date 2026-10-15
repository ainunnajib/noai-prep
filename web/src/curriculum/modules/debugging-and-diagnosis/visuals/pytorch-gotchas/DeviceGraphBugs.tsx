import { useState, type ReactNode } from 'react'
import { Figure, Segmented } from '../../../../../kit'
import { Chip, Chips, CodePanel, Note, Out, Section } from '../reading-loss-curves/ui'

/*
  Match each buggy snippet to what PyTorch does when it runs. Five of the messages were produced by
  running the code with PyTorch 2.x on a CPU; the device-mismatch one needs a GPU and its ending
  varies with the operation and version, so only its fixed beginning is shown.
*/

type ErrId = 'nocuda' | 'device' | 'inplace' | 'numpy' | 'nograd' | 'silent'

const ERRORS: { id: ErrId; short: string; full: string }[] = [
  { id: 'nocuda', short: 'Torch not compiled with CUDA enabled', full: 'AssertionError: Torch not compiled with CUDA enabled' },
  { id: 'device', short: 'Expected all tensors to be on the same device', full: 'RuntimeError: Expected all tensors to be on the same device, … cuda:0 and cpu …' },
  {
    id: 'inplace',
    short: 'modified by an inplace operation',
    full: 'RuntimeError: one of the variables needed for gradient computation has been modified by an inplace operation: [torch.FloatTensor [3]], which is output 0 of Sigmoid, is at version 1; expected version 0 instead.',
  },
  { id: 'numpy', short: "Can't call numpy() on Tensor that requires grad", full: "RuntimeError: Can't call numpy() on Tensor that requires grad. Use tensor.detach().numpy() instead." },
  { id: 'nograd', short: 'element 0 of tensors does not require grad', full: 'RuntimeError: element 0 of tensors does not require grad and does not have a grad_fn' },
  { id: 'silent', short: 'No error, but the weights never change', full: 'No error. loss.backward() runs, but every weight’s .grad stays None, so optimizer.step() changes nothing.' },
]

interface Card {
  name: string
  context: ReactNode
  lines: string[]
  bad: number[]
  err: ErrId
  why: ReactNode
  fix: string[]
}

const CARDS: Card[] = [
  {
    name: '.cuda() in forward',
    context: 'Written on a GPU machine, then run on a laptop without a GPU.',
    lines: ['class Net(nn.Module):', '    def forward(self, x):', '        x = x.cuda()', '        return self.fc(x)', '', 'model = Net()', 'model(torch.randn(2, 4))'],
    bad: [2],
    err: 'nocuda',
    why: (
      <>
        The model hard-codes a device, so it can only ever run where that device exists. (On a PyTorch build that does have CUDA but a machine with no GPU, the message
        is about a missing NVIDIA driver instead.) Keep device choices out of <code>forward</code>: pick the device once and move the model and the data to it.
      </>
    ),
    fix: ['if torch.cuda.is_available():', "    device = 'cuda'", 'else:', "    device = 'cpu'", 'model = Net().to(device)', 'x = x.to(device)    # in the loop'],
  },
  {
    name: 'A new tensor in forward',
    context: 'The model and x are on the GPU (cuda:0).',
    lines: ['def forward(self, x):', '    noise = torch.randn(x.shape)', '    return self.fc(x + noise)'],
    bad: [1],
    err: 'device',
    why: (
      <>
        <code>model.to(device)</code> moves the model's parameters and buffers, but a tensor created inside <code>forward</code> is made on the CPU by default. Adding a
        CPU tensor to a GPU tensor fails. Create new tensors on the same device as the input.
      </>
    ),
    fix: ['def forward(self, x):', '    noise = torch.randn_like(x)', '    # or: torch.randn(x.shape, device=x.device)', '    return self.fc(x + noise)'],
  },
  {
    name: 'An in-place edit',
    context: 'Part of a custom layer; the error appears at loss.backward().',
    lines: ['z = torch.randn(3, requires_grad=True)', 'h = torch.sigmoid(z)', 'h += 1          # in place', 'loss = h.sum()', 'loss.backward()'],
    bad: [2],
    err: 'inplace',
    why: (
      <>
        To backpropagate through sigmoid, autograd saves its output <code>h</code>. <code>h += 1</code> overwrites that saved tensor in place, so the gradient can no
        longer be computed correctly, and PyTorch refuses. Make a new tensor instead.
      </>
    ),
    fix: ['h = torch.sigmoid(z)', 'h = h + 1       # a new tensor', 'loss = h.sum()', 'loss.backward()'],
  },
  {
    name: 'NumPy inside the loss',
    context: 'A custom loss called as loss_fn(model(x), y).',
    lines: ['def loss_fn(pred, y):', '    d = pred.numpy() - y.numpy()', '    return torch.tensor((d ** 2).mean())'],
    bad: [1],
    err: 'numpy',
    why: (
      <>
        NumPy knows nothing about gradients, so PyTorch will not hand it a tensor that is part of a computation graph. The hint in the message (add{' '}
        <code>.detach()</code>) silences the error but leads straight to the next card.
      </>
    ),
    fix: ['def loss_fn(pred, y):', '    return ((pred - y) ** 2).mean()'],
  },
  {
    name: 'Following the hint',
    context: 'The same loss after adding .detach(); the error appears at loss.backward().',
    lines: ['def loss_fn(pred, y):', '    p = pred.detach().numpy()', '    d = p - y.numpy()', '    return torch.tensor((d ** 2).mean())'],
    bad: [1, 3],
    err: 'nograd',
    why: (
      <>
        <code>.detach()</code> cuts the tensor out of the graph, and <code>torch.tensor(...)</code> builds a brand-new tensor with no history. The loss is no longer
        connected to any weight, so there is nothing to backpropagate through.
      </>
    ),
    fix: ['def loss_fn(pred, y):', '    return ((pred - y) ** 2).mean()'],
  },
  {
    name: '.item() inside the loss',
    context: 'Someone "fixed" the previous card by asking for gradients.',
    lines: ['def loss_fn(pred, y):', '    l = ((pred - y) ** 2).mean()', '    l = l.item()          # a float', '    return torch.tensor(', '        l, requires_grad=True)'],
    bad: [2, 3],
    err: 'silent',
    why: (
      <>
        <code>.item()</code> turns the loss into a plain Python number, so the link to the model is gone. <code>requires_grad=True</code> makes a new leaf tensor that
        backward() can run on, but the gradient stops there: no weight receives one. The most dangerous version, because nothing complains.
      </>
    ),
    fix: ['def loss_fn(pred, y):', '    return ((pred - y) ** 2).mean()'],
  },
]

export default function DeviceGraphBugs() {
  const [ci, setCi] = useState(0)
  const [picks, setPicks] = useState<(ErrId | null)[]>(() => CARDS.map(() => null))
  const c = CARDS[ci]
  const pick = picks[ci]
  const solved = pick === c.err
  const matched = CARDS.filter((k, i) => picks[i] === k.err).length
  const full = ERRORS.find((e) => e.id === c.err)!

  return (
    <Figure
      title="Device and graph bugs: match the message"
      caption={
        <>
          Six snippets, six outcomes. For each snippet, pick what PyTorch does when it runs; a correct match reveals the full message and the fix. Most messages here
          were produced by running the code; the device message needs a GPU, and its ending varies, so only its fixed beginning is shown.
        </>
      }
    >
      <Segmented
        label={`Snippet (matched ${matched} of ${CARDS.length})`}
        value={ci}
        onChange={setCi}
        options={CARDS.map((k, i) => ({ value: i, label: `${picks[i] === k.err ? '✓ ' : ''}${i + 1}` }))}
      />
      <Note>
        <b>{c.name}.</b> {c.context}
      </Note>
      <CodePanel lines={c.lines} tones={solved ? Object.fromEntries(c.bad.map((b) => [b, 'bad'])) : undefined} size={12.5} />
      <Section label="What happens when it runs?">
        <Chips label="Possible outcomes">
          {ERRORS.map((e) => (
            <Chip key={e.id} state={pick === e.id ? (e.id === c.err ? 'good' : 'bad') : 'idle'} onClick={() => setPicks((ps) => ps.map((p, i) => (i === ci ? e.id : p)))}>
              {e.short}
            </Chip>
          ))}
        </Chips>
      </Section>
      {pick && !solved && <Note tone="bad">Not this one. Look at which line touches a device, a saved tensor, NumPy or a plain Python number.</Note>}
      {solved && (
        <>
          <Out tone={c.err === 'silent' ? 'out' : 'err'} title={c.err === 'silent' ? 'what you see' : 'error'}>
            {full.full}
          </Out>
          <Note tone="good">
            <b>Matched.</b> {c.why}
          </Note>
          <CodePanel lines={c.fix} title="fix" size={12.5} />
        </>
      )}
    </Figure>
  )
}
