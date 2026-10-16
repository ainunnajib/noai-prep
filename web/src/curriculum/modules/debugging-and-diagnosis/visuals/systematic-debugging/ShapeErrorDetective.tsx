import { useState, type ReactNode } from 'react'
import { Figure } from '../../../../../kit'
import { Chip, Chips, Note, Out, Section } from '../reading-loss-curves/ui'
import { runFlow, fmtShape, type Layer, type MatErr } from './shapes'
import s from './sd.module.css'

/*
  Shape error detective: three broken models with the real error PyTorch prints. The learner decodes
  the two shapes in the message and picks a fix; the shapes are re-propagated through the model
  (shapes.ts follows PyTorch's rules), ending in a working model, a new error, or a silent mistake.
*/

const lin = (inF: number, outF: number): Layer => ({ k: 'linear', inF, outF })
const RELU: Layer = { k: 'relu' }
const FLAT: Layer = { k: 'flatten' }
const conv = (cin: number, cout: number): Layer => ({ k: 'conv', cin, cout, ks: 3, pad: 1 })
const POOL: Layer = { k: 'pool', ks: 2 }

interface Fix {
  label: ReactNode
  input?: number[]
  layers: Layer[]
  note: ReactNode
}

interface Case {
  name: string
  story: ReactNode
  input: number[]
  layers: Layer[]
  fixes: Fix[]
}

const CNN = [conv(1, 16), RELU, POOL, conv(16, 32), RELU, POOL, FLAT]

const CASES: Case[] = [
  {
    name: 'MLP on MNIST',
    story: 'A two-layer network for 28 × 28 handwritten digits. A batch of 32 images arrives straight from the DataLoader.',
    input: [32, 1, 28, 28],
    layers: [lin(784, 128), RELU, lin(128, 10)],
    fixes: [
      { label: <>Add <code>nn.Flatten()</code> as the first layer</>, layers: [FLAT, lin(784, 128), RELU, lin(128, 10)], note: 'Flatten turns each 1 × 28 × 28 image into one row of 784 numbers, exactly what nn.Linear(784, 128) expects.' },
      {
        label: <>Change the first layer to <code>nn.Linear(28, 128)</code></>,
        layers: [lin(28, 128), RELU, lin(128, 10)],
        note: 'nn.Linear works on the last dimension only, so now every row of 28 pixels is treated as a separate example. The model runs, but the output is 4-D and the loss rejects it.',
      },
      { label: <>Reshape the input with <code>x.view(784, -1)</code></>, layers: [{ k: 'view', spec: [784, -1] }, lin(784, 128), RELU, lin(128, 10)], note: 'The numbers are now 784 rows of 32: the batch dimension must stay first. x.view(32, -1) or x.view(x.size(0), -1) would be right.' },
      { label: <>Use a batch size of 784</>, input: [784, 1, 28, 28], layers: [lin(784, 128), RELU, lin(128, 10)], note: 'The batch size was never the problem: the same error comes back with a different first number.' },
    ],
  },
  {
    name: 'Layers that do not line up',
    story: 'An MLP whose two Linear layers were edited separately. Flattened images of 784 pixels, batch of 32.',
    input: [32, 784],
    layers: [lin(784, 512), RELU, lin(256, 10)],
    fixes: [
      { label: <>Change the last layer to <code>nn.Linear(512, 10)</code></>, layers: [lin(784, 512), RELU, lin(512, 10)], note: 'Each layer\'s in_features must equal the previous layer\'s out_features: 512 → 512.' },
      { label: <>Change the first layer to <code>nn.Linear(784, 256)</code></>, layers: [lin(784, 256), RELU, lin(256, 10)], note: 'Also a correct fix: you can change either side of the junction. Now the hidden layer has 256 units instead of 512.' },
      { label: <>Change the last layer to <code>nn.Linear(256, 512)</code></>, layers: [lin(784, 512), RELU, lin(256, 512)], note: 'That changed out_features, the wrong side of the layer: the inner numbers are still 512 and 256.' },
      { label: <>Transpose the input: <code>model(x.T)</code></>, input: [784, 32], layers: [lin(784, 512), RELU, lin(256, 10)], note: 'Transposing puts the 784 features first, so the very first layer now fails. Never transpose the batch dimension away.' },
    ],
  },
  {
    name: 'CNN with the wrong in_features',
    story: 'Two conv blocks (3 × 3 conv with padding 1, ReLU, 2 × 2 max-pool) on 28 × 28 greyscale images, then a classifier. The author forgot the second pooling when working out in_features.',
    input: [32, 1, 28, 28],
    layers: [...CNN, lin(32 * 14 * 14, 10)],
    fixes: [
      { label: <>Use <code>nn.Linear(32 * 7 * 7, 10)</code></>, layers: [...CNN, lin(32 * 7 * 7, 10)], note: 'Two poolings halve 28 → 14 → 7, so each image becomes 32 channels × 7 × 7 = 1568 numbers.' },
      {
        label: <>Replace <code>nn.Flatten()</code> with <code>x.view(-1, 6272)</code></>,
        layers: [...CNN.slice(0, -1), { k: 'view', spec: [-1, 6272] }, lin(6272, 10)],
        note: 'view(-1, 6272) happily packs 4 images into each row (4 × 1568 = 6272), so the batch shrinks from 32 to 8. The error only appears later, at the loss. Always keep the batch size: x.view(x.size(0), -1).',
      },
      { label: <>Use <code>nn.Linear(1568, 6272)</code></>, layers: [...CNN, lin(1568, 6272)], note: 'This runs without any error, yet it is wrong: the model now gives 6272 scores per image, and cross_entropy simply treats it as a 6272-class problem.' },
      {
        label: <>Delete the second <code>nn.MaxPool2d(2)</code></>,
        layers: [conv(1, 16), RELU, POOL, conv(16, 32), RELU, FLAT, lin(32 * 14 * 14, 10)],
        note: 'This also works: without the second pooling the maps stay 14 × 14 and 32 × 14 × 14 = 6272 matches. It changes the architecture (4 times more weights in the last layer), so make sure that is what you want.',
      },
    ],
  },
]

function Decoder({ m }: { m: MatErr }) {
  const ok = m.b === m.c
  return (
    <div style={{ width: '100%', display: 'grid', gap: '0.35rem' }}>
      <div className={s.decode} aria-label={`mat1 is ${m.a} by ${m.b}, mat2 is ${m.c} by ${m.d}`}>
        <span className={s.mat}>
          <small>mat1 = data</small>
          {m.a} × <span className={`${s.inner}${ok ? ' ' + s.match : ''}`}>{m.b}</span>
        </span>
        <span className={s.mat}>
          <small>mat2 = layer</small>
          <span className={`${s.inner}${ok ? ' ' + s.match : ''}`}>{m.c}</span> × {m.d}
        </span>
      </div>
      <div style={{ fontSize: '0.86rem', color: 'var(--ink-2)', textAlign: 'center', lineHeight: 1.45 }}>
        mat1 is the data reaching a Linear layer (rows × <b>features</b>); mat2 is that layer, written <b>in_features</b> × out_features. The inner numbers must be
        equal: this layer expects <b>{m.c}</b> features but receives <b>{m.b}</b>.
      </div>
    </div>
  )
}

export default function ShapeErrorDetective() {
  const [ci, setCi] = useState(0)
  const [fi, setFi] = useState<number | null>(null)
  const c = CASES[ci]
  const fix = fi === null ? null : c.fixes[fi]
  const res = runFlow(fix?.input ?? c.input, fix?.layers ?? c.layers, 32, 10)
  const original = runFlow(c.input, c.layers, 32, 10)
  const tone = res.status === 'ok' ? 'good' : res.status === 'silent' ? 'warn' : 'bad'

  return (
    <Figure
      title="Shape error detective"
      caption={
        <>
          Each model crashes with the real message PyTorch prints. Read the two shapes in the message, find the layer where they meet, then try a fix: the shapes are
          pushed through the model again, layer by layer, using PyTorch's rules. Some fixes work, some move the error somewhere else, and one runs without any
          error while still being wrong.
        </>
      }
    >
      <Section label="Case">
        <Chips label="Case">
          {CASES.map((k, i) => (
            <Chip
              key={k.name}
              state={i === ci ? 'selected' : 'idle'}
              onClick={() => {
                setCi(i)
                setFi(null)
              }}
            >
              {k.name}
            </Chip>
          ))}
        </Chips>
      </Section>
      <div className={s.symptom}>{c.story}</div>
      <Out tone="err" title="what PyTorch says">
        {original.message}
      </Out>
      {original.mat && <Decoder m={original.mat} />}
      <Section label={fix ? 'Shapes after your fix' : 'Shapes through the model'}>
        <div className={s.flow} role="list" aria-label="Tensor shapes through the model">
          {res.steps.map((st, i) => {
            const last = i === res.steps.length - 1
            const cls = st.error ? s.bad : last && res.status === 'silent' ? s.warn : st.shape ? s.ok : ''
            return (
              <div key={i} className={`${s.flowRow} ${cls}`} role="listitem">
                <span className={s.flowLayer}>{st.code}</span>
                <span className={s.flowShape}>{st.error ? <b>✗ error</b> : st.shape && st.shape.length ? <b>{fmtShape(st.shape)}</b> : last ? <b>✓ loss</b> : ''}</span>
              </div>
            )
          })}
        </div>
      </Section>
      <Section label="Pick a fix">
        <Chips label="Fix">
          {c.fixes.map((f, i) => {
            const r = runFlow(f.input ?? c.input, f.layers, 32, 10)
            return (
              <Chip key={i} state={fi === i ? (r.status === 'ok' ? 'good' : 'bad') : 'idle'} onClick={() => setFi(fi === i ? null : i)}>
                {f.label}
              </Chip>
            )
          })}
        </Chips>
      </Section>
      {fix && (
        <div className={s.stack}>
          {res.status === 'error' ? (
            <Out tone="err" title="new error">
              {res.message}
            </Out>
          ) : (
            <Out tone={res.status === 'ok' ? 'ok' : 'out'} title="result">
              {res.status === 'ok' ? '✓ ' : '⚠ '}
              {res.message}
            </Out>
          )}
          <Note tone={tone}>
            <b>{res.status === 'ok' ? 'Fixed.' : res.status === 'silent' ? 'Runs, but wrong.' : 'Not fixed.'}</b> {fix.note}
          </Note>
        </div>
      )}
    </Figure>
  )
}
