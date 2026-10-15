import { useState } from 'react'
import { Figure, Segmented, Button, useNarrow } from '../../../../../kit'
import { parseShape, sameShape, shapeText } from './ddKit'
import s from './dd.module.css'

/*
  Shape annotator: real NumPy, PyTorch and pandas snippets with an empty shape column. The learner
  writes the shape produced by each line; Check marks every row and highlights the FIRST mismatch
  with the rule that line follows (later rows often go wrong only because of it). Every expected
  shape was produced by running the snippet in Python.
*/

type Lib = 'PyTorch' | 'NumPy' | 'pandas'
interface Line {
  code: string
  shape?: number[]
  /** shape shown, not asked */
  given?: boolean
  why?: string
}
interface Snippet {
  id: string
  lib: Lib
  title: string
  lines: Line[]
}

const SNIPPETS: Snippet[] = [
  {
    id: 'cnn',
    lib: 'PyTorch',
    title: 'A small CNN',
    lines: [
      { code: 'x = torch.randn(32, 3, 28, 28)', shape: [32, 3, 28, 28], given: true },
      { code: 'conv = nn.Conv2d(3, 16, kernel_size=3)' },
      { code: 'h = conv(x)', shape: [32, 16, 26, 26], why: 'C becomes 16, the number of filters. H and W: (28 + 0 − 3)/1 + 1 = 26.' },
      { code: 'h = F.max_pool2d(h, 2)', shape: [32, 16, 13, 13], why: 'Pooling keeps N and C and halves H and W: 26 → 13.' },
      { code: 'h = h.flatten(1)', shape: [32, 2704], why: 'flatten(1) keeps dim 0 (the batch) and multiplies the rest: 16 × 13 × 13 = 2704.' },
      { code: 'out = nn.Linear(2704, 10)(h)', shape: [32, 10], why: 'A Linear layer replaces only the last dimension: 2704 → 10.' },
      { code: 'pred = out.argmax(dim=1)', shape: [32], why: 'argmax over dim 1 removes that dimension: one class index per image.' },
    ],
  },
  {
    id: 'attn',
    lib: 'PyTorch',
    title: 'Attention scores',
    lines: [
      { code: 'x = torch.randn(4, 10, 64)   # (batch, tokens, d)', shape: [4, 10, 64], given: true },
      { code: 'Wq, Wk, Wv = nn.Linear(64, 64), nn.Linear(64, 64), nn.Linear(64, 64)' },
      { code: 'q = Wq(x)', shape: [4, 10, 64], why: 'Linear(64, 64) maps the last dimension 64 → 64; the batch and token dimensions pass straight through.' },
      { code: 'kT = Wk(x).transpose(-2, -1)', shape: [4, 64, 10], why: 'transpose(-2, -1) swaps the last two dimensions: (4, 10, 64) → (4, 64, 10).' },
      { code: 'scores = q @ kT / 8', shape: [4, 10, 10], why: 'Batched matrix product: (10 × 64) @ (64 × 10) = 10 × 10 for each of the 4 batch items. Dividing by 8 = √64 changes no shape.' },
      { code: 'w = scores.softmax(dim=-1)', shape: [4, 10, 10], why: 'Softmax never changes the shape; each row now sums to 1.' },
      { code: 'out = w @ Wv(x)', shape: [4, 10, 64], why: '(10 × 10) @ (10 × 64) = 10 × 64: each token gets a weighted mix of the 10 value vectors.' },
    ],
  },
  {
    id: 'reduce',
    lib: 'PyTorch',
    title: 'Reductions and joins',
    lines: [
      { code: 'x = torch.randn(8, 5)', shape: [8, 5], given: true },
      { code: 'a = x.sum(dim=0)', shape: [5], why: 'Summing over dim 0 removes it: 8 rows collapse into one row of 5 totals.' },
      { code: 'b = x.mean(dim=1, keepdim=True)', shape: [8, 1], why: 'keepdim=True keeps the reduced dimension with size 1, ready for broadcasting.' },
      { code: 'c = x - b', shape: [8, 5], why: 'Broadcasting stretches (8, 1) across the 5 columns.' },
      { code: 'd = x.unsqueeze(0)', shape: [1, 8, 5], why: 'unsqueeze(0) inserts a new dimension of size 1 at position 0.' },
      { code: 'e = torch.cat([x, x], dim=0)', shape: [16, 5], why: 'cat joins along an EXISTING dimension: 8 + 8 = 16 rows.' },
      { code: 'f = torch.stack([x, x], dim=0)', shape: [2, 8, 5], why: 'stack creates a NEW dimension in front: two (8, 5) tensors → (2, 8, 5).' },
      { code: 'g = x.view(-1)', shape: [40], why: '−1 means "whatever is left": 8 × 5 = 40 numbers in one dimension.' },
    ],
  },
  {
    id: 'broadcast',
    lib: 'NumPy',
    title: 'Standardise, then a surprise',
    lines: [
      { code: 'X = np.zeros((100, 3))', shape: [100, 3], given: true },
      { code: 'mu = X.mean(axis=0)', shape: [3], why: 'axis=0 averages down the rows: one mean per column.' },
      { code: 'Z = X - mu', shape: [100, 3], why: 'Broadcasting: (100, 3) − (3,) subtracts the row of means from every row.' },
      { code: 'w = np.ones(3)', shape: [3], why: 'A 1-D array of length 3.' },
      { code: 'y = X @ w', shape: [100], why: '(100 × 3) @ (3,) gives a 1-D array of length 100 (not (100, 1)).' },
      { code: 'col = y[:, None]', shape: [100, 1], why: 'None (np.newaxis) inserts a new axis of size 1.' },
      { code: 'D = col - y', shape: [100, 100], why: 'The broadcasting surprise: (100, 1) − (100,) is read as (100, 1) − (1, 100), giving a 100 × 100 table of every difference.' },
    ],
  },
  {
    id: 'images',
    lib: 'NumPy',
    title: 'A batch of images',
    lines: [
      { code: 'imgs = np.zeros((64, 28, 28))', shape: [64, 28, 28], given: true },
      { code: 'first = imgs[0]', shape: [28, 28], why: 'One integer index removes that axis: the first image.' },
      { code: 'rows = imgs[:, 0, :]', shape: [64, 28], why: 'The top row of every image: the integer index removes the middle axis.' },
      { code: 'flat = imgs.reshape(64, -1)', shape: [64, 784], why: '28 × 28 = 784 pixels per image, 64 images.' },
      { code: 'T = flat.T', shape: [784, 64], why: '.T reverses the axes.' },
      { code: 'G = flat @ flat.T', shape: [64, 64], why: '(64 × 784) @ (784 × 64) = 64 × 64: every image dotted with every image.' },
      { code: 'm = imgs.max(axis=0)', shape: [28, 28], why: 'The maximum over the batch axis, pixel by pixel: one 28 × 28 image.' },
    ],
  },
  {
    id: 'pandas',
    lib: 'pandas',
    title: 'Class records',
    lines: [
      {
        code: "df = pd.DataFrame({\n  'name': ['Ali', 'Bea', 'Chen', 'Dev', 'Eve', 'Fai'],\n  'score': [72, 65, 88, 91, 58, 77],\n  'cca': ['art', 'band', 'art', 'chess', 'band', 'chess']})",
        shape: [6, 3],
        given: true,
      },
      { code: "s = df['score']", shape: [6], why: 'Single brackets pick one column as a Series: shape (6,).' },
      { code: "sub = df[['name', 'score']]", shape: [6, 2], why: 'Double brackets (a list of names) give a DataFrame with those 2 columns.' },
      { code: "top = df[df['score'] > 70]", shape: [4, 3], why: 'The mask keeps rows where score > 70: 72, 88, 91 and 77, so 4 rows, all 3 columns.' },
      { code: "avg = df.groupby('cca')['score'].mean()", shape: [3], why: 'One mean per group (art, band and chess), so a Series of length 3.' },
      { code: 'a = df.iloc[0:2]', shape: [2, 3], why: 'iloc uses positions, and the end is EXCLUDED: rows 0 and 1.' },
      { code: 'b = df.loc[0:2]', shape: [3, 3], why: 'loc uses labels, and the end is INCLUDED: rows labelled 0, 1 and 2.' },
    ],
  },
]

type Mark = 'ok' | 'bad' | 'empty'

export default function ShapeAnnotator() {
  const [lib, setLib] = useState<Lib>('PyTorch')
  const [id, setId] = useState('cnn')
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)

  const snip = SNIPPETS.find((x) => x.id === id) ?? SNIPPETS[0]
  const key = (i: number) => `${snip.id}:${i}`
  const asked = snip.lines.map((l, i) => ({ l, i })).filter(({ l }) => l.shape && !l.given)

  const markOf = (i: number): Mark => {
    const l = snip.lines[i]
    const raw = inputs[key(i)] ?? ''
    if (!raw.trim()) return 'empty'
    return sameShape(parseShape(raw), l.shape!) ? 'ok' : 'bad'
  }
  const marks = asked.map(({ i }) => [i, markOf(i)] as const)
  const firstBad = checked ? marks.find(([, m]) => m !== 'ok')?.[0] ?? -1 : -1
  const nOk = marks.filter(([, m]) => m === 'ok').length

  const pickLib = (v: Lib) => {
    setLib(v)
    setId(SNIPPETS.find((x) => x.lib === v)!.id)
    setChecked(false)
    setRevealed(false)
  }
  const pickSnippet = (v: string) => {
    setId(v)
    setChecked(false)
    setRevealed(false)
  }
  const clear = () => {
    setInputs((m) => {
      const n = { ...m }
      snip.lines.forEach((_, i) => delete n[key(i)])
      return n
    })
    setChecked(false)
    setRevealed(false)
  }
  const reveal = () => {
    setInputs((m) => {
      const n = { ...m }
      asked.forEach(({ l, i }) => (n[key(i)] = shapeText(l.shape!)))
      return n
    })
    setRevealed(true)
    setChecked(true)
  }

  const libSnips = SNIPPETS.filter((x) => x.lib === lib)

  return (
    <Figure
      title="Shape annotator: write the shape next to every line"
      caption={
        <>
          Fill the shape column (type <code>32, 16, 26, 26</code> or <code>(5,)</code>), then press Check. The first wrong row is marked with a red bar and the rule it follows; rows after it are often
          wrong only because of it, which is exactly how a shape bug spreads through real code. Notice how few rules there are: a layer changes one dimension, a reduction removes one, broadcasting
          stretches size-1 dimensions.
        </>
      }
    >
      <div className={s.wrap} ref={wrapRef}>
        <div className={s.spread}>
          <Segmented label="Library" value={lib} onChange={pickLib} options={(['PyTorch', 'NumPy', 'pandas'] as Lib[]).map((v) => ({ value: v, label: v }))} />
          {libSnips.length > 1 && (
            <div className={s.chips} role="group" aria-label="Snippet">
              {libSnips.map((x) => (
                <button key={x.id} type="button" className={`${s.chip} ${x.id === id ? s.chipOn : ''}`} aria-pressed={x.id === id} onClick={() => pickSnippet(x.id)}>
                  {x.title}
                </button>
              ))}
            </div>
          )}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setChecked(true)
          }}
          style={{ display: 'grid', gap: '0.6rem', width: '100%' }}
        >
          <div className={s.annot} role="table" aria-label={`${snip.title}: code and shapes`}>
            {snip.lines.map((l, i) => {
              const m = l.shape && !l.given ? markOf(i) : null
              const cls = checked && m ? (m === 'ok' ? s.rowOk : s.rowBad) : ''
              const first = checked && i === firstBad
              const showWhy = !!l.why && checked && (revealed || first)
              return (
                <div key={key(i)} role="row" className={`${s.annotRow} ${narrow ? s.annotNarrow : ''} ${cls} ${first ? s.rowFirstBad : ''}`}>
                  <div role="cell" className={s.annotCode}>
                    {l.code.split('#').map((part, j) => (j === 0 ? <span key={j}>{part}</span> : <span key={j} className={s.annotComment}>#{part}</span>))}
                  </div>
                  <div role="cell" className={s.annotCell}>
                    {l.given && l.shape ? (
                      <span className={s.annotGiven}>{narrow ? 'shape: ' : ''}{shapeText(l.shape)}</span>
                    ) : l.shape ? (
                      <>
                        {narrow && <span className={s.small}>shape</span>}
                        <input
                          className={s.annotInput}
                          value={inputs[key(i)] ?? ''}
                          onChange={(e) => {
                            const v = e.target.value
                            setInputs((mm) => ({ ...mm, [key(i)]: v }))
                            setChecked(false)
                            setRevealed(false)
                          }}
                          placeholder="shape?"
                          aria-label={`Shape after: ${l.code}`}
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                        />
                        <span className={s.mark} aria-hidden="true" style={{ color: m === 'ok' ? 'var(--viz-pos)' : 'var(--viz-neg)' }}>
                          {checked ? (m === 'ok' ? '✓' : m === 'bad' ? '✗' : '?') : ''}
                        </span>
                      </>
                    ) : (
                      <span className={s.small} style={{ color: 'var(--ink-3)' }}>
                        {narrow ? '' : 'no tensor'}
                      </span>
                    )}
                  </div>
                  {showWhy && <div className={s.why}>{l.why}</div>}
                </div>
              )
            })}
          </div>
          <div className={s.spread}>
            <div className={s.row}>
              <button type="submit" className="btn btn-primary btn-small">
                Check
              </button>
              <Button onClick={reveal}>Reveal answers</Button>
              <Button onClick={clear}>Clear</Button>
            </div>
            <span className={s.small} aria-live="polite">
              {checked
                ? revealed
                  ? 'All shapes shown, each with its rule.'
                  : firstBad === -1
                    ? `All ${asked.length} right.`
                    : `${nOk} of ${asked.length} right. First mismatch: row ${firstBad + 1}${markOf(firstBad) === 'empty' ? ' (empty)' : ''}.`
                : `${asked.length} shapes to fill`}
            </span>
          </div>
        </form>
      </div>
    </Figure>
  )
}
