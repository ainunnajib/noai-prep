import { useState, type ReactNode } from 'react'
import { Figure, Controls, Button, usePlayer, PlayerControls, useNarrow } from '../../../../../kit'
import { CodeLines, Chips, Shape, type CodeLine } from '../task-attention/ui'
import s from './pe.module.css'

/*
  Q3.6 + Q3.7: TransformerClassifier.forward, one line per step, for a batch of two sentences
  (T = 4; the second is padded). Shapes are shown for this example and for the notebook's test
  (B = 2, T = 10, d_model = 256). At the pooling step the learner can change the [PAD] token's
  vector and compare plain mean pooling with masked mean pooling. The 2-number encoder outputs are
  illustrative (real ones have 256 numbers), and the arithmetic on them is exact.
*/

const S1 = [
  ['what', 812],
  ['a', 17],
  ['great', 2304],
  ['film', 1550],
] as const
const S2 = [
  ['so', 233],
  ['very', 410],
  ['dull', 6921],
  ['[PAD]', 0],
] as const

const REAL: [number, number][] = [
  [2, 0],
  [0, 2],
  [4, 4],
]
const PADS: [number, number][] = [
  [9, 9],
  [-3, 5],
  [0, 0],
  [6, -2],
]

type Pool = 'mean' | 'masked'

const CODE: CodeLine[] = [
  { code: 'x = self.token_embedding(input_ids) * math.sqrt(self.d_model)' },
  { code: 'x = self.pos_encoding(x)' },
  { code: 'mask = None' },
  { code: 'if attention_mask is not None:' },
  { code: '    mask = attention_mask.unsqueeze(1).unsqueeze(2)' },
  { code: 'for layer in self.encoder_layers:' },
  { code: '    x = layer(x, mask)' },
  { code: 'pooled = x.mean(dim=1)' },
  { code: 'return self.classifier(pooled)' },
]
/** code lines highlighted at each step */
const STEP_LINES: number[][] = [[], [0], [1], [2, 3, 4], [5, 6], [7], [8]]
const STEP_NAMES = ['inputs', 'embed', 'positions', 'mask', 'encoder', 'pool', 'classify']
const SHAPES: [string, string][] = [
  ['input_ids (2, 4)', 'input_ids (2, 10)'],
  ['(2, 4, 256)', '(2, 10, 256)'],
  ['(2, 4, 256)', '(2, 10, 256)'],
  ['mask (2, 1, 1, 4)', 'mask (2, 1, 1, 10)'],
  ['(2, 4, 256)', '(2, 10, 256)'],
  ['pooled (2, 256)', 'pooled (2, 256)'],
  ['logits (2, 2)', 'logits (2, 2)'],
]

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2)).replace('-', '−')

function Tokens({ showIds, showMask }: { showIds?: boolean; showMask?: boolean }) {
  const row = (label: string, toks: readonly (readonly [string, number])[]) => (
    <div className={s.tokRow}>
      <span className={s.tokLab}>{label}</span>
      {toks.map(([w, id], i) => (
        <span key={i} className={`${s.tok} ${w === '[PAD]' ? s.tokPad : ''}`}>
          {w}
          {showIds && <small>id {id}</small>}
          {showMask && <small>mask {w === '[PAD]' ? 0 : 1}</small>}
        </span>
      ))}
    </div>
  )
  return (
    <div className={s.tokens}>
      {row('sentence 1', S1)}
      {row('sentence 2', S2)}
    </div>
  )
}

export default function ClassifierHeadFlow() {
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const [pool, setPool] = useState<Pool>('mean')
  const [padIdx, setPadIdx] = useState(0)
  const player = usePlayer({ steps: 7, interval: 1700 })
  const step = player.step
  const pad = PADS[padIdx]

  const lines: CodeLine[] = CODE.map((l, i) => {
    let code = l.code
    if (i === 7 && pool === 'masked') code = 'pooled = (x * m).sum(dim=1) / m.sum(dim=1)'
    return { code, tone: STEP_LINES[step].includes(i) ? 'cur' : undefined }
  })

  const sum = REAL.reduce((a, v) => [a[0] + v[0], a[1] + v[1]], [0, 0])
  const plain: [number, number] = [(sum[0] + pad[0]) / 4, (sum[1] + pad[1]) / 4]
  const masked: [number, number] = [sum[0] / 3, sum[1] / 3]
  const res = pool === 'mean' ? plain : masked

  let stage: ReactNode
  let say: ReactNode
  if (step === 0) {
    stage = <Tokens showIds showMask />
    say = (
      <>
        A batch of two sentences, already turned into token ids and padded to the same length T = 4. <code>attention_mask</code> has shape (B, T): 1 for a real token, 0 for padding.
        The test also calls <code>model(input_ids)</code> with no mask at all.
      </>
    )
  } else if (step === 1) {
    stage = (
      <div className={s.flow}>
        <span className={s.box}>id 2304</span>
        <span className={s.arrow}>→ nn.Embedding →</span>
        <span className={`${s.box} ${s.boxOn}`}>256 numbers</span>
        <span className={s.arrow}>× √256 = × 16</span>
      </div>
    )
    say = (
      <>
        <code>nn.Embedding(vocab_size, d_model)</code> is a lookup table: row <i>id</i> is that token's vector. Each id becomes 256 numbers, so (B, T) becomes (B, T, d_model). The
        notebook's step 1 then multiplies by <code>math.sqrt(self.d_model)</code>, as in the original Transformer.
      </>
    )
  } else if (step === 2) {
    stage = (
      <div className={s.flow}>
        <span className={s.box}>x (B, T, 256)</span>
        <span className={s.arrow}>+</span>
        <span className={`${s.box} ${s.boxOn}`}>pe[:, :T] (1, T, 256)</span>
      </div>
    )
    say = <>Part 3's positional encoding adds one position code to every token. The (1, T, 256) table broadcasts across the batch, so the shape does not change.</>
  } else if (step === 3) {
    stage = (
      <div className={s.flow}>
        <span className={s.box}>(B, T) = (2, 4)</span>
        <span className={s.arrow}>unsqueeze(1) →</span>
        <span className={s.box}>(2, 1, 4)</span>
        <span className={s.arrow}>unsqueeze(2) →</span>
        <span className={`${s.box} ${s.boxOn}`}>(2, 1, 1, 4)</span>
      </div>
    )
    say = (
      <>
        Attention scores have shape (B, h, T, T). Adding two axes of size 1 lets the mask broadcast across every head and every query row, exactly the (B, 1, 1, T) shape that Q3.1
        expected. Keep <code>mask = None</code> when no mask is given.
      </>
    )
  } else if (step === 4) {
    stage = (
      <div className={s.flow}>
        {[1, 2, 3, 4].map((k) => (
          <span key={k} className={s.flow}>
            <span className={`${s.box} ${s.boxOn}`}>layer {k}</span>
            {k < 4 && <span className={s.arrow}>→</span>}
          </span>
        ))}
      </div>
    )
    say = (
      <>
        Four given <code>TransformerEncoderLayer</code>s, each attention + feed-forward with residuals and LayerNorm. Each keeps the shape (B, T, 256), and the mask stops real tokens
        from attending to <code>[PAD]</code>. The <code>[PAD]</code> position still gets an output vector of its own.
      </>
    )
  } else if (step === 5) {
    stage = (
      <div className={s.pool}>
        <div className={s.vecRow} aria-label="Encoder outputs for sentence 2">
          {['so', 'very', 'dull'].map((w, i) => (
            <span key={w} className={s.vec}>
              <small>{w}</small>[{REAL[i].map(fmt).join(', ')}]
            </span>
          ))}
          <span className={`${s.vec} ${s.vecPad} ${pool === 'masked' ? s.vecOut : ''}`}>
            <small>[PAD]</small>[{pad.map(fmt).join(', ')}]
          </span>
        </div>
        <div className={s.result}>
          {pool === 'mean'
            ? `mean over 4 = ([${sum.map(fmt).join(', ')}] + [${pad.map(fmt).join(', ')}]) / 4 = [${res.map(fmt).join(', ')}]`
            : `masked mean = [${sum.map(fmt).join(', ')}] / 3 = [${res.map(fmt).join(', ')}]`}
        </div>
        <Button onClick={() => setPadIdx((i) => (i + 1) % PADS.length)}>Change the [PAD] vector</Button>
      </div>
    )
    say =
      pool === 'mean' ? (
        <>
          <code>x.mean(dim=1)</code> averages over the T axis, turning (B, T, 256) into (B, 256): one vector per sentence. Plain mean also averages the <code>[PAD]</code> vector, so
          changing it changes the result. This is what the official solution does.
        </>
      ) : (
        <>
          Masked mean multiplies by <code>m = attention_mask.unsqueeze(-1)</code>, shape (B, T, 1), and divides by the number of real tokens. Change the <code>[PAD]</code> vector: the
          result stays [2, 2].
        </>
      )
  } else {
    stage = (
      <div className={s.flow}>
        {['LayerNorm(256)', 'Linear(256, 256)', 'ReLU', 'Dropout', 'Linear(256, 2)'].map((b, i) => (
          <span key={b} className={s.flow}>
            <span className={`${s.box} ${i === 4 ? s.boxOn : ''}`}>{b}</span>
            {i < 4 && <span className={s.arrow}>→</span>}
          </span>
        ))}
      </div>
    )
    say = (
      <>
        Q3.6's <code>self.classifier</code> is an <code>nn.Sequential</code> of five layers in exactly the order the comment lists. The last <code>Linear</code> maps 256 numbers to{' '}
        <code>num_classes</code> = 2 <b>logits</b>, the raw scores for each class. No softmax: the loss function applies it during training.
      </>
    )
  }

  return (
    <Figure
      title="From token ids to two logits"
      caption={
        <>
          Step through <code>forward</code> and watch the shape after each line, for this tiny batch and for the notebook's test. At the pooling step, switch between plain and masked
          mean and press <b>Change the [PAD] vector</b>: only plain mean is affected by the padding.
        </>
      }
    >
      <div ref={wrapRef} className={s.stack}>
        <CodeLines lines={lines} title="def forward(self, input_ids, attention_mask=None):" narrow={narrow} />
        <div className={s.verdict} style={{ background: 'color-mix(in srgb, var(--surface-2) 60%, var(--surface))', border: '1px solid var(--rule)', display: 'grid', gap: '0.7rem', justifyItems: 'center' }}>
          {stage}
          <p style={{ margin: 0, justifySelf: 'stretch', color: 'var(--ink-2)' }}>
            <b>
              Step {step + 1}, {STEP_NAMES[step]}.
            </b>{' '}
            {say}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem 1rem', fontSize: 12.5, color: 'var(--ink-3)', justifySelf: 'stretch' }}>
            <span>
              this example <Shape tone="accent">{SHAPES[step][0]}</Shape>
            </span>
            <span>
              notebook test <Shape>{SHAPES[step][1]}</Shape>
            </span>
          </div>
        </div>
        <PlayerControls player={player} label={(i) => `Step ${i + 1} of 7`} />
        <Controls>
          <Chips
            label="Pooling"
            options={[
              { value: 'mean', label: 'Plain mean (official solution)' },
              { value: 'masked', label: 'Masked mean' },
            ]}
            value={pool}
            onChange={setPool}
          />
        </Controls>
      </div>
    </Figure>
  )
}
