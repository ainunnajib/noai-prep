import { useState, type ReactNode } from 'react'
import { Figure, Controls, Slider, Segmented, Toggle, useNarrow, mulberry32 } from '../../../../../kit'
import { Mat, softmaxRow, heat } from './Mat'
import s from './sdpa.module.css'

/*
  Causal and padding masks, the PyTorch way. The learner chooses how the mask tensor is built
  (tril: 1 = may attend, or triu(diagonal=1): 1 = blocked) and how masked_fill reads it
  (block where mask == 0, or where mask == 1). Two of the four combinations are correct; the other two
  are the classic bug, which flips the triangle and can leave a row with nothing to attend to (NaN).
*/

const WORDS = ['I', 'love', 'kaya', 'toast', 'so', 'much', 'lah', '!']
const MAXT = 8
// fixed illustrative scores (integers −2..3) so the picture is stable
const SCORES: number[][] = (() => {
  const rnd = mulberry32(2027)
  return Array.from({ length: MAXT }, () => Array.from({ length: MAXT }, () => Math.floor(rnd() * 6) - 2))
})()

type Build = 'tril' | 'triu'
type Rule = 'eq0' | 'eq1'
type Fill = 'inf' | '1e9'

export default function CausalMaskGrid() {
  const [T, setT] = useState(6)
  const [pads, setPads] = useState(2)
  const [causal, setCausal] = useState(true)
  const [padding, setPadding] = useState(true)
  const [build, setBuild] = useState<Build>('tril')
  const [rule, setRule] = useState<Rule>('eq0')
  const [fill, setFill] = useState<Fill>('inf')
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)

  const nPad = Math.min(pads, T - 1)
  const nReal = T - nPad
  const toks = Array.from({ length: T }, (_, k) => (k < nReal ? WORDS[k] : '[PAD]'))
  const isPad = toks.map((t) => t === '[PAD]')
  const keepConv = build === 'tril'
  const anyMask = causal || padding

  // the mask tensor exactly as the code builds it
  const mask: number[][] = toks.map((_, i) =>
    toks.map((__, j) => {
      let m = keepConv ? (causal ? (j <= i ? 1 : 0) : 1) : causal ? (j > i ? 1 : 0) : 0
      if (padding) m = keepConv ? m * (isPad[j] ? 0 : 1) : (m === 1 || isPad[j]) ? 1 : 0
      return m
    }),
  )
  const blocked = mask.map((r) => r.map((m) => anyMask && (rule === 'eq0' ? m === 0 : m === 1)))
  const fillVal = fill === 'inf' ? -Infinity : -1e9
  const masked = SCORES.slice(0, T).map((r, i) => r.slice(0, T).map((v, j) => (blocked[i][j] ? fillVal : v)))
  const W = masked.map(softmaxRow)

  // what SHOULD be blocked
  const intended = toks.map((_, i) => toks.map((__, j) => (causal && j > i) || (padding && isPad[j])))
  const correct = blocked.every((r, i) => r.every((b, j) => b === intended[i][j]))
  const nanRows = W.map((r) => r.some((v) => Number.isNaN(v)))
  const seesFuture = causal && blocked.some((r, i) => r.some((b, j) => !b && j > i))
  const lostPast = blocked.some((r, i) => r.some((b, j) => b && !intended[i][j]))

  const fullyBlocked = blocked.some((r) => r.every(Boolean))
  const realSeesPad = padding && blocked.some((r, i) => !isPad[i] && r.some((b, j) => !b && isPad[j]))
  let status: ReactNode
  if (!anyMask) status = <>✗ No mask: every token, [PAD]s included, can attend to every position, including the future.</>
  else if (correct)
    status = (
      <>
        ✓ Correct. {causal ? 'Each token attends only to itself and earlier tokens' : 'Each token attends to every real token'}
        {padding ? ', and no token attends to a [PAD]' : ''}. Blocked weights are exactly 0, and every row still adds up to 1.
      </>
    )
  else {
    const parts: string[] = []
    if (seesFuture) parts.push('tokens can see FUTURE positions (a language model could simply copy the next word)')
    if (realSeesPad) parts.push('real tokens attend to [PAD]s')
    if (lostPast) parts.push('tokens are blocked from positions they should see')
    let tail = ''
    if (nanRows.some(Boolean)) tail = ' A row where every score is −∞ gives 0 ÷ 0 = NaN, which then spreads through the whole network.'
    else if (fill === '1e9' && fullyBlocked) tail = ' With −1e9, a fully blocked row becomes uniform instead of NaN, which hides the bug.'
    status = (
      <>
        ✗ Bug: the mask is built with one convention and read with the other. Result: {parts.join('; ')}.{tail}
      </>
    )
  }

  // the code, line by line
  const fillTxt = fill === 'inf' ? "float('-inf')" : '-1e9'
  const ruleTxt = rule === 'eq0' ? 'mask == 0' : 'mask == 1'
  const ruleBad = anyMask && ((keepConv && rule === 'eq1') || (!keepConv && rule === 'eq0'))
  const lines: { code: string; note?: string; bad?: boolean }[] = []
  if (keepConv) {
    lines.push(causal ? { code: 'mask = torch.tril(torch.ones(T, T))', note: '1 = may attend' } : { code: 'mask = torch.ones(T, T)', note: '1 = may attend' })
    if (padding) lines.push({ code: 'mask = mask * (ids != PAD)', note: 'also hide [PAD] keys' })
  } else {
    lines.push(
      causal
        ? { code: 'mask = torch.triu(torch.ones(T, T), diagonal=1).bool()', note: 'True = future' }
        : { code: 'mask = torch.zeros(T, T).bool()', note: 'True = blocked' },
    )
    if (padding) lines.push({ code: 'mask = mask | (ids == PAD)', note: 'also hide [PAD] keys' })
  }
  if (anyMask) lines.push({ code: `scores = scores.masked_fill(${ruleTxt}, ${fillTxt})`, bad: ruleBad })
  else lines.length = 0
  lines.push({ code: 'weights = F.softmax(scores, dim=-1)' })

  const cw = narrow ? (T > 6 ? 31 : 36) : T > 6 ? 40 : 44
  const ch = narrow ? 28 : 30
  const lw = narrow ? 38 : 44
  const fmtW = (v: number) => (Number.isNaN(v) ? 'NaN' : v === 0 ? '0' : v > 0.995 ? '1' : v.toFixed(2).replace(/^0/, ''))
  const fmtS = (v: number) => (v === -Infinity ? '−∞' : v === -1e9 ? '−1e9' : String(v).replace('-', '−'))

  return (
    <Figure
      wide
      title="Masks: −∞ in the right cells, before the softmax"
      caption={
        <>
          Rows are queries and columns are keys. A blocked score becomes −∞ (hatched), so after softmax its weight is exactly 0 and the rest of the row is
          rescaled to add up to 1. Switch the causal mask off and on, add padding, then try the other way of building the mask while keeping the same{' '}
          <code>masked_fill</code>: the triangle flips and tokens see the future. Notice that with padding on the right, the causal mask already hides
          the [PAD]s from the real tokens; the padding mask matters most in encoders such as BERT, which have no causal mask. (Rows of [PAD] queries
          are faded: their outputs are ignored.)
        </>
      }
    >
      <Controls>
        <Slider label="sequence length T" value={T} min={3} max={MAXT} step={1} onChange={setT} />
        <Slider label="[PAD] tokens at the end" value={nPad} min={0} max={Math.min(4, T - 1)} step={1} onChange={setPads} />
        <Toggle label="causal mask" checked={causal} onChange={setCausal} />
        <Toggle label="padding mask" checked={padding} onChange={setPadding} />
      </Controls>
      <Controls>
        <Segmented
          label="build the mask with"
          value={build}
          onChange={setBuild}
          options={[
            { value: 'tril', label: 'tril: 1 = keep' },
            { value: 'triu', label: 'triu(diagonal=1): 1 = block' },
          ]}
        />
        <Segmented
          label="masked_fill where"
          value={rule}
          onChange={setRule}
          options={[
            { value: 'eq0', label: 'mask == 0' },
            { value: 'eq1', label: 'mask == 1' },
          ]}
        />
        <Segmented
          label="fill value"
          value={fill}
          onChange={setFill}
          options={[
            { value: 'inf', label: '−inf' },
            { value: '1e9', label: '−1e9' },
          ]}
        />
      </Controls>

      <pre className={s.code} aria-label="PyTorch code for this mask">
        {lines.map((l, k) => (
          <div key={k} className={l.bad ? s.codeBad : undefined}>
            {l.code}
            {l.note && <span className={s.codeCmt}>{`   # ${l.note}`}</span>}
            {l.bad && <span className={s.codeCmt}>{'   # ✗ wrong rule for this mask'}</span>}
          </div>
        ))}
      </pre>

      <div ref={ref} className={s.grids}>
        <Mat
          name={anyMask ? (keepConv ? 'mask (1 = keep)' : 'mask (1 = block)') : 'mask (none)'}
          data={mask.map((r) => r.map((m) => (anyMask ? m : '·')))}
          rowLabels={toks}
          colLabels={toks}
          cellW={cw}
          cellH={ch}
          labelW={lw}
          bg={(i, j) => (anyMask && mask[i][j] === 1 ? 'color-mix(in srgb, var(--viz-5) 28%, var(--surface))' : undefined)}
          cls={(i) => (isPad[i] ? s.cellDim : undefined)}
          ariaLabel="The boolean mask tensor"
          shape={`(${T}, ${T})`}
        />
        <Mat
          name="scores after masked_fill"
          data={masked}
          rowLabels={toks}
          colLabels={toks}
          cellW={cw}
          cellH={ch}
          labelW={lw}
          fmt={fmtS}
          cls={(i, j) => [blocked[i][j] ? s.cellBlocked : '', isPad[i] ? s.cellDim : ''].join(' ')}
          ariaLabel="Scores with blocked cells set to minus infinity"
          shape={`(${T}, ${T})`}
        />
        <Mat
          name="weights = softmax(rows)"
          data={W}
          rowLabels={toks}
          colLabels={toks}
          cellW={cw}
          cellH={ch}
          labelW={lw}
          fmt={fmtW}
          bg={(i, j) => (Number.isNaN(W[i][j]) || blocked[i][j] ? undefined : heat(W[i][j]))}
          cls={(i, j) => [Number.isNaN(W[i][j]) ? s.cellNan : blocked[i][j] ? s.cellBlocked : '', isPad[i] ? s.cellDim : ''].join(' ')}
          ariaLabel="Attention weights after softmax"
          shape="each row sums to 1"
        />
      </div>

      <div className={`${s.status} ${!anyMask || !correct ? s.statusBad : s.statusOk}`} role="status">
        {status}
      </div>
    </Figure>
  )
}
