import { useState, type ReactNode } from 'react'
import { Figure, Segmented, Readout } from '../../../../../kit'
import { PyPanel, MONO } from '../training-loop/PyCode'

/*
  Eight real PyTorch error messages. For each: read the code and the message, decide which kind of
  bug it is (shape, dtype, device or autograd), then see the message decoded piece by piece and the fix.
  Messages 1-5 and 7 were produced by PyTorch 2.14 (CPU); 6 and 8 need a GPU and use the wording of
  recent PyTorch versions.
*/

type Family = 'shape' | 'dtype' | 'device' | 'autograd'

interface Case {
  code: string[]
  msg: string
  family: Family
  parts: { match: string; note: ReactNode }[]
  fix: string[]
  gpu?: boolean
}

const CASES: Case[] = [
  {
    code: ['layer = nn.Linear(10, 5)', 'x = torch.randn(4, 20)', 'out = layer(x)'],
    msg: 'RuntimeError: mat1 and mat2 shapes cannot be multiplied (4x20 and 10x5)',
    family: 'shape',
    parts: [
      { match: '4x20', note: <>mat1 is your input <code>x</code>: 4 examples × 20 features.</> },
      { match: '10x5', note: <>mat2 is the layer's weight, transposed: in_features 10 × out_features 5. The inner numbers must match, and 20 ≠ 10.</> },
    ],
    fix: ['layer = nn.Linear(20, 5)   # in_features must equal x.shape[1]'],
  },
  {
    code: ['conv = nn.Conv2d(3, 8, kernel_size=3)', 'img = torch.randn(8, 28, 28, 3)   # (N, H, W, C)', 'out = conv(img)'],
    msg: 'RuntimeError: Given groups=1, weight of size [8, 3, 3, 3], expected input[8, 28, 28, 3] to have 3 channels, but got 28 channels instead',
    family: 'shape',
    parts: [
      { match: 'weight of size [8, 3, 3, 3]', note: <>The kernel is (out_channels, in_channels, kH, kW): this layer wants 3 input channels.</> },
      { match: 'input[8, 28, 28, 3]', note: <>PyTorch reads every image batch as (N, C, H, W), so it takes C = 28. The image is channels-last.</> },
    ],
    fix: ['img = img.permute(0, 3, 1, 2)   # (N, H, W, C) -> (N, C, H, W)'],
  },
  {
    code: ['layer = nn.Linear(3, 2)', 'x = torch.tensor([[1, 2, 3]])', 'out = layer(x)'],
    msg: 'RuntimeError: mat1 and mat2 must have the same dtype, but got Long and Float',
    family: 'dtype',
    parts: [
      { match: 'Long', note: <>int64: <code>torch.tensor</code> saw whole numbers and made an integer tensor.</> },
      { match: 'Float', note: <>float32: the layer's weights. Layers need floating-point inputs.</> },
    ],
    fix: ['x = torch.tensor([[1., 2., 3.]])   # or: x = x.float()'],
  },
  {
    code: ['criterion = nn.CrossEntropyLoss()', 'logits = model(x)                  # shape (4, 3)', 'labels = torch.tensor([0., 2., 1., 1.])', 'loss = criterion(logits, labels)'],
    msg: 'RuntimeError: expected target dtype to be Long or Byte, but got Float',
    family: 'dtype',
    parts: [
      { match: 'target', note: <>The target is the second argument: the class labels.</> },
      { match: 'Long or Byte', note: <>Class indices must be whole numbers (int64 is usual).</> },
      { match: 'Float', note: <>The labels were written with decimal points, so they are float32.</> },
    ],
    fix: ['labels = labels.long()'],
  },
  {
    code: ['conv = nn.Conv2d(3, 8, kernel_size=3)', 'img = torch.from_numpy(np.random.rand(4, 3, 32, 32))', 'out = conv(img)'],
    msg: 'RuntimeError: Input type (double) and bias type (float) should be the same',
    family: 'dtype',
    parts: [
      { match: 'Input type (double)', note: <>The images are float64: NumPy's default float, and <code>from_numpy</code> keeps it.</> },
      {
        match: 'bias type (float)',
        note: (
          <>
            The layer's bias (and weights) are float32. Convolution layers word a clash as <i>Input type … should be the same</i>: two different number
            types mean a dtype bug, while a <code>cuda</code> in only one of the two names would mean a device bug.
          </>
        ),
      },
    ],
    fix: ['img = img.float()   # float64 -> float32'],
  },
  {
    code: ["model = Net().to('cuda')", 'x = torch.randn(4, 3)', 'out = model(x)'],
    msg: 'RuntimeError: Expected all tensors to be on the same device, but got mat1 is on cpu, different from other tensors on cuda:0 (when checking argument in method wrapper_CUDA_addmm)',
    family: 'device',
    gpu: true,
    parts: [
      { match: 'mat1 is on cpu', note: <>mat1 is the input <code>x</code>, which was never moved.</> },
      { match: 'cuda:0', note: <>The model's weights are on GPU number 0.</> },
    ],
    fix: ["x = x.to('cuda')   # better: x = x.to(device)"],
  },
  {
    code: ['preds = model(x)', 'plt.plot(preds.numpy())'],
    msg: "RuntimeError: Can't call numpy() on Tensor that requires grad. Use tensor.detach().numpy() instead.",
    family: 'autograd',
    parts: [
      { match: 'requires grad', note: <>The predictions are part of the autograd graph (they depend on weights that require gradients).</> },
      { match: 'tensor.detach().numpy()', note: <>Cut the tensor out of the graph first. (Or run the model inside <code>torch.no_grad()</code>.)</> },
    ],
    fix: ['plt.plot(preds.detach().cpu().numpy())   # .cpu() as well if it is on a GPU'],
  },
  {
    code: ['preds = model(x).detach()   # model and x on the GPU', 'arr = preds.numpy()'],
    msg: "TypeError: can't convert cuda:0 device type tensor to numpy. Use Tensor.cpu() to copy the tensor to host memory first.",
    family: 'device',
    gpu: true,
    parts: [
      { match: 'cuda:0 device type tensor', note: <>NumPy only works with the computer's main memory (RAM); this tensor is in GPU memory.</> },
      { match: 'Tensor.cpu()', note: <>Copy it back to the CPU ("host") first.</> },
    ],
    fix: ['arr = preds.cpu().numpy()'],
  },
]

const FAM: { value: Family; label: string }[] = [
  { value: 'shape', label: 'shape' },
  { value: 'dtype', label: 'dtype' },
  { value: 'device', label: 'device' },
  { value: 'autograd', label: 'autograd' },
]
const HL = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)']
const article = (w: string) => (/^[aeiou]/.test(w) ? 'an' : 'a')

function Message({ c, reveal }: { c: Case; reveal: boolean }) {
  // split the message into plain text and highlighted parts (no numbers inside the message: they would read as part of it)
  const pieces: ReactNode[] = []
  let rest = c.msg
  let k = 0
  c.parts.forEach((p, i) => {
    const at = rest.indexOf(p.match)
    if (at < 0) return
    pieces.push(<span key={k++}>{rest.slice(0, at)}</span>)
    pieces.push(
      reveal ? (
        <span key={k++} style={{ background: `color-mix(in srgb, ${HL[i]} 24%, var(--surface))`, borderBottom: `2px solid ${HL[i]}`, borderRadius: 3, padding: '0 2px', color: 'var(--ink)' }}>
          {p.match}
        </span>
      ) : (
        <span key={k++}>{p.match}</span>
      ),
    )
    rest = rest.slice(at + p.match.length)
  })
  pieces.push(<span key={k++}>{rest}</span>)
  return (
    <div style={{ border: '1px solid var(--rule)', borderRadius: 10, background: 'var(--surface)', width: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '0.22rem 0.75rem', borderBottom: '1px dashed var(--rule)', fontFamily: MONO, fontSize: 12, color: 'var(--ink-3)' }}>
        error message{c.gpu ? ' (on a machine with a GPU)' : ''}
      </div>
      <div style={{ padding: '0.5rem 0.75rem', fontFamily: MONO, fontSize: 13, lineHeight: 1.6, color: 'var(--bad)', fontWeight: 600, overflowWrap: 'anywhere' }}>{pieces}</div>
    </div>
  )
}

export default function ErrorDecoder() {
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, Family>>({})
  const c = CASES[idx]
  const picked = answers[idx]
  const reveal = picked != null
  const right = picked === c.family
  const solved = CASES.filter((cc, i) => answers[i] === cc.family).length

  return (
    <Figure
      title="Decode the error message"
      caption={
        <>
          Pick an error, read the code and the last line of the traceback, and decide what kind of bug it is. Then the message is decoded piece by piece. The habit to build: find the two things the
          message says disagree (two shapes, two dtypes or two devices), and trace each back to the line that made it.
        </>
      }
    >
      <div style={{ width: '100%' }}>
      <Segmented
        label="Error"
        value={idx}
        onChange={setIdx}
        options={CASES.map((cc, i) => ({
          value: i,
          label: (
            <span>
              {i + 1}
              {answers[i] != null && <span aria-hidden="true">{answers[i] === cc.family ? ' ✓' : ' ✗'}</span>}
            </span>
          ),
        }))}
      />
      </div>
      <PyPanel lines={c.code} tones={{ [c.code.length - 1]: 'bad' }} />
      <Message c={c} reveal={reveal} />
      <div style={{ width: '100%', display: 'grid', gap: 6 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink-2)' }}>What kind of bug is this?</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {FAM.map((f) => {
            const isPicked = picked === f.value
            const isAns = reveal && f.value === c.family
            return (
              <button
                key={f.value}
                type="button"
                className="btn btn-small"
                onClick={() => setAnswers({ ...answers, [idx]: f.value })}
                aria-pressed={isPicked}
                style={{
                  borderColor: isAns ? 'var(--ok)' : isPicked ? 'var(--bad)' : undefined,
                  background: isAns ? 'var(--ok-soft)' : isPicked ? 'var(--bad-soft)' : undefined,
                  color: isAns ? 'var(--ok)' : isPicked ? 'var(--bad)' : undefined,
                }}
              >
                {f.label}
                {isAns ? ' ✓' : isPicked ? ' ✗' : ''}
              </button>
            )
          })}
        </div>
      </div>
      {reveal && (
        <div style={{ width: '100%', display: 'grid', gap: 8 }}>
          <div style={{ fontSize: 14, lineHeight: 1.5, color: right ? 'var(--ok)' : 'var(--bad)', fontWeight: 700 }}>
            {right ? `Yes: ${article(c.family)} ${c.family} error.` : `Not quite: this is ${article(c.family)} ${c.family} error.`}
          </div>
          <ol style={{ margin: 0, paddingLeft: '1.3rem', display: 'grid', gap: 4, fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-2)' }}>
            {c.parts.map((p, i) => (
              <li key={i} style={{ paddingLeft: 2 }}>
                <span style={{ fontFamily: MONO, fontWeight: 700, color: HL[i] }}>{p.match}</span>: {p.note}
              </li>
            ))}
          </ol>
          <PyPanel lines={c.fix} title="the fix" tones={{ 0: 'ok' }} />
        </div>
      )}
      <Readout items={[['diagnosed correctly', `${solved} of ${CASES.length}`]]} />
    </Figure>
  )
}
