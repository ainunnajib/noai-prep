import { useState, type ReactNode } from 'react'
import { Figure, Segmented, Button, MatrixGrid, useNarrow } from '../../../../../kit'
import { Chip, Chips, CodePanel, Note, Out, Section } from '../reading-loss-curves/ui'
import s from './sd.module.css'

/*
  Silent bugs: three snippets that run without any error but compute the wrong thing. Each card has a
  sanity check that exposes the bug, then a choice of fixes. Every number is computed here from the
  same small tensors as in the lesson (and matches PyTorch's output).
*/

type CardId = 'broadcast' | 'softmax' | 'image'

// ---------- card 1: broadcasting in a hand-written MSE ----------
const Y = [1, 2, 3, 4]
const YP = [1.5, 2.0, 2.5, 4.0]
const DIFF = YP.map((p) => Y.map((t) => p - t)) // (4, 1) - (4,) -> (4, 4)
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
const WRONG_MSE = mean(DIFF.flat().map((d) => d * d))
const RIGHT_MSE = mean(YP.map((p, i) => (p - Y[i]) ** 2))
const WRONG_MAE = mean(DIFF.flat().map(Math.abs))
const f4 = (v: number) => v.toFixed(4)

// ---------- card 2: softmax over the wrong dim ----------
const LOGITS = [
  [2.0, 1.0, 0.1],
  [0.5, 2.5, 0.3],
]
const softmaxRows = (m: number[][]) =>
  m.map((r) => {
    const e = r.map(Math.exp)
    const t = e.reduce((a, b) => a + b, 0)
    return e.map((v) => v / t)
  })
const transpose = (m: number[][]) => m[0].map((_, j) => m.map((r) => r[j]))
const P_DIM0 = transpose(softmaxRows(transpose(LOGITS)))
const P_DIM1 = softmaxRows(LOGITS)
const P_GLOBAL = (() => {
  const t = P_DIM0.flat().reduce((a, b) => a + b, 0)
  return P_DIM0.map((r) => r.map((v) => v / t))
})()
const P_SIGMOID = LOGITS.map((r) => r.map((v) => 1 / (1 + Math.exp(-v))))
const rowSums = (m: number[][]) => m.map((r) => r.reduce((a, b) => a + b, 0))

// ---------- card 3: reshape instead of permute ----------
const SZ = 8
/** A toy 8 x 8 picture stored as (H, W, C): R = the sun, G = the grass, B = the sky. */
const IMG: number[][][] = Array.from({ length: SZ }, (_, i) =>
  Array.from({ length: SZ }, (_, j) => {
    const sun = (i - 1.5) ** 2 + (j - 5.8) ** 2 <= 2.3 ? 1 : 0
    const grass = i >= 6 ? 1 : i === 5 && j <= 2 ? 0.7 : 0
    const sky = i <= 4 ? 0.85 - 0.12 * i : 0
    return [sun, grass, Math.max(0, sky - sun * 0.6)]
  }),
)
type Planes = number[][][] // (3, 8, 8)
const FLAT_HWC = IMG.flat(2)
const PERMUTE: Planes = [0, 1, 2].map((c) => IMG.map((row) => row.map((px) => px[c])))
const RESHAPE: Planes = [0, 1, 2].map((c) => Array.from({ length: SZ }, (_, i) => Array.from({ length: SZ }, (_, j) => FLAT_HWC[c * SZ * SZ + i * SZ + j])))
const TRANSPOSE02: Planes = [0, 1, 2].map((c) => Array.from({ length: SZ }, (_, i) => Array.from({ length: SZ }, (_, j) => IMG[j][i][c])))
const CH = [
  { name: 'R (sun)', colour: 'var(--viz-neg)' },
  { name: 'G (grass)', colour: 'var(--viz-3)' },
  { name: 'B (sky)', colour: 'var(--viz-1)' },
]

function Plane({ data, colour, name }: { data: number[][]; colour: string; name: string }) {
  const cell = 10
  return (
    <div className={s.planeBox}>
      <svg viewBox={`0 0 ${SZ * cell} ${SZ * cell}`} role="img" aria-label={`channel ${name} as an 8 by 8 picture`}>
        {data.map((row, i) =>
          row.map((v, j) => (
            <rect key={`${i}-${j}`} x={j * cell} y={i * cell} width={cell} height={cell} style={{ fill: `color-mix(in srgb, ${colour} ${Math.round(v * 92)}%, var(--surface-2))` }} />
          )),
        )}
      </svg>
      <span>{name}</span>
    </div>
  )
}

function PlaneSet({ planes, label }: { planes: Planes; label: ReactNode }) {
  return (
    <div style={{ width: '100%', display: 'grid', gap: '0.3rem' }}>
      <div className={s.caption}>{label}</div>
      <div className={s.planes}>
        {planes.map((p, c) => (
          <Plane key={c} data={p} colour={CH[c].colour} name={CH[c].name} />
        ))}
      </div>
    </div>
  )
}

interface FixOpt {
  label: ReactNode
  ok: boolean
  result: ReactNode
}

interface CardDef {
  title: string
  intro: ReactNode
  lines: string[]
  bad: number
  output: ReactNode
  checkLines: string[]
  check: ReactNode
  fixes: FixOpt[]
}

const fmtRow = (r: number[]) => `[${r.map((v) => v.toFixed(3)).join(', ')}]`
/** like PyTorch's default print (4 decimals) */
const fmtRow4 = (r: number[]) => `[${r.map((v) => v.toFixed(4)).join(', ')}]`

function cards(narrow: boolean): Record<CardId, CardDef> {
  return {
    broadcast: {
      title: 'A mean squared error that is too big',
      intro: 'Four predictions from a regression model and their targets. The code runs and prints a loss.',
      lines: ['# targets, shape (4,)', 'y = torch.tensor([1., 2., 3., 4.])', '# predictions, shape (4, 1)', 'y_pred = torch.tensor(', '    [[1.5], [2.0], [2.5], [4.0]])', 'loss = ((y_pred - y) ** 2).mean()', 'print(loss)'],
      bad: 5,
      output: `tensor(${f4(WRONG_MSE)})`,
      checkLines: ['# by hand: errors 0.5, 0, 0.5, 0', '# so MSE = (0.25 + 0.25) / 4 = 0.125', 'print((y_pred - y).shape)'],
      check: (
        <div className={s.stack}>
          <Out title="output">torch.Size([4, 4])</Out>
          <div className={s.matrixRow}>
            <MatrixGrid data={DIFF} cells={[0, 1, 2, 3].map((i) => [i, i] as [number, number])} heat diverging cellSize={narrow ? 44 : 50} format={(v) => v.toFixed(1)} label="y_pred - y, every prediction minus every target" ariaLabel="4 by 4 table of differences" />
          </div>
          <Note tone="bad">
            Broadcasting stretched the <code>(4, 1)</code> column and the <code>(4,)</code> row into a 4 × 4 table. Only the 4 highlighted cells compare a prediction
            with <i>its own</i> target; the loss averages all 16, giving {f4(WRONG_MSE)} instead of {f4(RIGHT_MSE)}.
          </Note>
        </div>
      ),
      fixes: [
        { label: <code>(y_pred.squeeze(1) - y)</code>, ok: true, result: <>Shape (4,) and loss {f4(RIGHT_MSE)}. squeeze(1) removes the size-1 column dimension.</> },
        { label: <code>(y_pred - y.view(-1, 1))</code>, ok: true, result: <>Shape (4, 1) and loss {f4(RIGHT_MSE)}. Turning y into a column works just as well: what matters is that both shapes match.</> },
        { label: <code>(y_pred - y).abs().mean()</code>, ok: false, result: <>Still a 4 × 4 table: this gives {f4(WRONG_MAE)}. Changing the loss does not change the shapes.</> },
        {
          label: <code>nn.MSELoss()(y_pred, y)</code>,
          ok: false,
          result: (
            <>
              Same wrong answer, {f4(WRONG_MSE)}, plus a warning: "Using a target size (torch.Size([4])) that is different to the input size (torch.Size([4, 1])). This will
              likely lead to incorrect results due to broadcasting." Read your warnings!
            </>
          ),
        },
      ],
    },
    softmax: {
      title: 'Softmax over the wrong dimension',
      intro: 'Class probabilities for a batch of 2 images and 3 classes. The logits have shape (batch, classes) = (2, 3).',
      lines: ['# 2 images (rows) x 3 classes', 'logits = torch.tensor(', '    [[2.0, 1.0, 0.1],', '     [0.5, 2.5, 0.3]])', 'probs = torch.softmax(logits, dim=0)', 'print(probs)'],
      bad: 4,
      output: `tensor([${fmtRow4(P_DIM0[0])},\n        ${fmtRow4(P_DIM0[1])}])`,
      checkLines: ['# each image should sum to 1', 'print(probs.sum(dim=1))'],
      check: (
        <div className={s.stack}>
          <Out title="output">{`tensor(${fmtRow4(rowSums(P_DIM0))})`}</Out>
          <div className={s.matrixRow}>
            <MatrixGrid data={P_DIM0.map((r, i) => [...r.map((v) => v.toFixed(3)), `Σ${rowSums(P_DIM0)[i].toFixed(2)}`])} cols={[3]} cellSize={narrow ? 58 : 62} label="probs with dim=0 (rows = images)" ariaLabel="probabilities with row sums" />
          </div>
          <Note tone="bad">
            dim=0 runs down the columns, so each <i>class</i> sums to 1 across the batch, and the images' rows sum to {rowSums(P_DIM0)[0].toFixed(2)} and{' '}
            {rowSums(P_DIM0)[1].toFixed(2)}. The values also change if you add another image to the batch, which a real probability never should.
          </Note>
        </div>
      ),
      fixes: [
        { label: <code>torch.softmax(logits, dim=1)</code>, ok: true, result: <>Rows are now {fmtRow(P_DIM1[0])} and {fmtRow(P_DIM1[1])}, and each sums to 1.000.</> },
        { label: <code>torch.softmax(logits, dim=-1)</code>, ok: true, result: <>Same as dim=1 here: −1 means the last dimension, which is the class dimension. Many people write −1 so it keeps working if extra dimensions are added in front.</> },
        {
          label: <code>probs / probs.sum()</code>,
          ok: false,
          result: (
            <>
              Now all six numbers add up to 1, but the rows sum to {rowSums(P_GLOBAL)[0].toFixed(3)} and {rowSums(P_GLOBAL)[1].toFixed(3)}. Each image needs its own
              distribution.
            </>
          ),
        },
        {
          label: <code>torch.sigmoid(logits)</code>,
          ok: false,
          result: <>Sigmoid treats every class separately: the first row becomes {fmtRow(P_SIGMOID[0])}, which sums to {rowSums(P_SIGMOID)[0].toFixed(3)}. That suits multi-label problems, not "pick one of 3 classes".</>,
        },
      ],
    },
    image: {
      title: 'A scrambled image',
      intro: 'Images on disk are stored as (height, width, channels), but PyTorch layers want (channels, height, width). The code runs; the model just learns badly.',
      lines: ['img = load_image()   # (H, W, C)', 'x = img.reshape(3, 8, 8)  # want (C, H, W)', 'out = model(x.unsqueeze(0))'],
      bad: 1,
      output: 'No error. Validation accuracy stays poor and nothing in the loss curve tells you why.',
      checkLines: ['# look at what the model sees', 'for c in range(3):', '    plt.imshow(x[c])'],
      check: (
        <div className={s.stack}>
          <div className={s.twoUp}>
            <PlaneSet planes={PERMUTE} label="the picture's real channels" />
            <PlaneSet planes={RESHAPE} label="what x holds after reshape" />
          </div>
          <Note tone="bad">
            reshape only regroups the numbers in their memory order. In memory the values go pixel by pixel (R, G, B, R, G, B, …), so the "sun channel" is filled with
            the first 64 numbers: a mix of all three colours of the top rows. Every channel is a striped mess.
          </Note>
        </div>
      ),
      fixes: [
        { label: <code>img.permute(2, 0, 1)</code>, ok: true, result: <PlaneSet planes={PERMUTE} label="x after permute(2, 0, 1): correct" /> },
        {
          label: <code>img.transpose(0, 2)</code>,
          ok: false,
          result: (
            <div className={s.stack}>
              <PlaneSet planes={TRANSPOSE02} label="x after transpose(0, 2)" />
              <span>The channels are separated, but transpose(0, 2) swaps H and C, giving (C, W, H): every picture is flipped along its diagonal (the sky is now on the left).</span>
            </div>
          ),
        },
        { label: <code>img.view(3, 8, 8)</code>, ok: false, result: <>view, like reshape, only regroups numbers in memory order: exactly the same scrambled channels.</> },
      ],
    },
  }
}

export default function SilentBugGallery() {
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(520)
  const [card, setCard] = useState<CardId>('broadcast')
  const [checked, setChecked] = useState<Record<CardId, boolean>>({ broadcast: false, softmax: false, image: false })
  const [fix, setFix] = useState<Record<CardId, number | null>>({ broadcast: null, softmax: null, image: null })
  const c = cards(narrow)[card]
  const f = fix[card]

  return (
    <Figure
      title="Silent bug gallery"
      caption={
        <>
          Three snippets that run without any error and print believable numbers, yet compute the wrong thing. Run each card's sanity check to expose the bug, then pick
          a fix. Notice that every check is cheap: a shape print, a sum that should be 1, a picture of the input.
        </>
      }
    >
      <div ref={wrapRef} className={narrow ? s.narrow : undefined} style={{ width: '100%', display: 'grid', gap: '0.8rem' }}>
        <Segmented
          label="Card"
          value={card}
          onChange={setCard}
          options={[
            { value: 'broadcast', label: '1. MSE' },
            { value: 'softmax', label: '2. Softmax' },
            { value: 'image', label: '3. Image' },
          ]}
        />
        <div className={s.symptom}>
          <b>{c.title}.</b> {c.intro}
        </div>
        <CodePanel lines={c.lines} tones={checked[card] ? { [c.bad]: 'bad' } : undefined} title="runs without error" size={12} />
        <Out title="output">{c.output}</Out>
        {!checked[card] ? (
          <div>
            <Button primary onClick={() => setChecked((x) => ({ ...x, [card]: true }))}>
              Run the sanity check
            </Button>
          </div>
        ) : (
          <>
            <CodePanel lines={c.checkLines} title="sanity check" size={12} lineNumbers={false} />
            {c.check}
            <Section label="Pick the fix for the highlighted line">
              <Chips label="Fix">
                {c.fixes.map((o, i) => (
                  <Chip key={i} state={f === i ? (o.ok ? 'good' : 'bad') : 'idle'} onClick={() => setFix((x) => ({ ...x, [card]: x[card] === i ? null : i }))}>
                    {o.label}
                  </Chip>
                ))}
              </Chips>
            </Section>
            {f !== null && (
              <Note tone={c.fixes[f].ok ? 'good' : 'bad'}>
                <b>{c.fixes[f].ok ? 'Fixed.' : 'Still wrong.'}</b> {c.fixes[f].result}
              </Note>
            )}
          </>
        )}
      </div>
    </Figure>
  )
}
