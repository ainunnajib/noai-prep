import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Controls, Toggle, usePlayer, PlayerControls, useNarrow, M } from '../../../../../kit'
import { CodeLines, Console, Chips, Shape, LabMatrix, matmul, transpose, softmax, softmaxCols, fmt, type CodeLine } from './ui'
import s from './attn.module.css'

/*
  Q3.1 typed out: the six TODO lines of scaled_dot_product_attention, run on the lesson's example
  "cats purr [PAD]" (B = h = 1, T = 3, d_k = 4, d_v = 2). Each step highlights one line and shows the
  tensor it produces. A chip injects a classic slip; the console shows what the notebook's real test
  cell printed for that version (captured from a PyTorch 2.14 run).
*/

const TOK = ['cats', 'purr', '[PAD]']
const Q = [
  [1, 1, 0, 0],
  [0, 0, 1, 1],
  [1, 0, 1, 0],
]
const K = [
  [1, 1, 0, 0],
  [0, 0, 1, 1],
  [1, 1, 1, 1],
]
const V = [
  [1, 0],
  [0, 1],
  [0, 0],
]
const MASK = [1, 1, 0]

type Bug = 'ok' | 'noscale' | 'dim' | 'mask1' | 'fill0'

const HEAD = 'outputs printed by the notebook test cell for 3.1'
const T1 = [
  '============================================================',
  'Testing Scaled Dot-Product Attention...',
  '============================================================',
  '  Output shape: torch.Size([2, 8, 10, 64])',
  '  Attention shape: torch.Size([2, 8, 10, 10])',
  '  Attention sums to 1: 1.0000',
]
const TEST: Record<Bug, string[]> = {
  ok: [...T1, '  ✓ Attention working!', '', 'Testing Attention with Mask...', '  ✓ Masked attention working!'],
  noscale: [...T1, '  ✓ Attention working!', '', 'Testing Attention with Mask...', '  ✓ Masked attention working!'],
  dim: [...T1, '  ✗ Attention failed: ', '', 'Testing Attention with Mask...', '  ✗ Masked attention failed: Masked positions should have 0 attention'],
  mask1: [...T1, '  ✓ Attention working!', '', 'Testing Attention with Mask...', '  ✗ Masked attention failed: Masked positions should have 0 attention'],
  fill0: [...T1, '  ✓ Attention working!', '', 'Testing Attention with Mask...', '  ✗ Masked attention failed: Masked positions should have 0 attention'],
}
const VERDICT: Record<Bug, ReactNode> = {
  ok: 'All visible checks pass, and the values match a hand calculation.',
  noscale: (
    <>
      Every visible check still passes: they test shapes, row sums and zeros, not values. Without <code>/ math.sqrt(d_k)</code> the weights are
      sharper than they should be, so only the hidden value tests would catch this.
    </>
  ),
  dim: (
    <>
      Softmax over <code>dim=-2</code> makes each <b>column</b> add up to 1. The printed mean of the row sums is still 1.0000 (each column sums to 1, so the
      total is T), but the <code>allclose</code> check on every row fails, with an empty message because that assert has none.
    </>
  ),
  mask1: (
    <>
      <code>mask == 1</code> hides the real tokens and keeps the padding, so all the weight lands on <code>[PAD]</code>.
    </>
  ),
  fill0: (
    <>
      Filling with 0 does not hide anything: <M>{'e^0 = 1'}</M>, so a "masked" key still gets weight. You need a huge negative number such as{' '}
      <code>-1e9</code>.
    </>
  ),
}

const BUG_OPTIONS: { value: Bug; label: string; bad?: boolean }[] = [
  { value: 'ok', label: 'Correct code' },
  { value: 'noscale', label: 'Forgot ÷ √d_k', bad: true },
  { value: 'dim', label: 'softmax dim=-2', bad: true },
  { value: 'mask1', label: 'mask == 1', bad: true },
  { value: 'fill0', label: 'fill with 0', bad: true },
]

const STEP_NAMES = ['inputs', 'scores', 'scale', 'mask', 'softmax', 'dropout', 'output']

export default function AttentionCodeStepper() {
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const [useMask, setUseMask] = useState(true)
  const [bug, setBug] = useState<Bug>('ok')
  const player = usePlayer({ steps: 7, interval: 1600 })
  const step = player.step

  const calc = useMemo(() => {
    const raw = matmul(Q, transpose(K))
    const scaled = bug === 'noscale' ? raw.map((r) => [...r]) : raw.map((r) => r.map((v) => v / 2))
    const hide = (j: number) => (bug === 'mask1' ? MASK[j] === 1 : MASK[j] === 0)
    const masked = useMask ? scaled.map((r) => r.map((v, j) => (hide(j) ? (bug === 'fill0' ? 0 : -1e9) : v))) : scaled
    const maskedCells = useMask ? scaled.map((r) => r.map((_, j) => hide(j) && bug !== 'fill0')) : undefined
    const weights = bug === 'dim' ? softmaxCols(masked) : masked.map(softmax)
    const out = matmul(weights, V)
    const rowSums = weights.map((r) => r.reduce((a, b) => a + b, 0))
    return { raw, scaled, masked, maskedCells, weights, out, rowSums }
  }, [bug, useMask])

  const line = (i: number, code: string, note?: ReactNode, badWhen?: Bug[]): CodeLine => {
    const isBad = badWhen?.includes(bug)
    const skipped = (i === 3 && !useMask) || i === 5
    return { code, note, tone: step === i ? (isBad ? 'bad' : 'cur') : isBad ? 'bad' : skipped && step >= i ? 'dim' : undefined }
  }
  const maskLine =
    bug === 'mask1'
      ? '    scores = scores.masked_fill(mask == 1, -1e9)'
      : bug === 'fill0'
        ? '    scores = scores.masked_fill(mask == 0, 0)'
        : '    scores = scores.masked_fill(mask == 0, -1e9)'
  const lines: CodeLine[] = [
    line(0, 'd_k = query.size(-1)', '# 4 here, 64 in the test'),
    line(1, 'scores = torch.matmul(query, key.transpose(-2, -1))', '# (B, h, T, T)'),
    line(
      2,
      bug === 'noscale' ? '# (scaling line forgotten)' : 'scores = scores / math.sqrt(d_k)',
      bug === 'noscale' ? '# scores stay unscaled' : '# ÷ 2 here, ÷ 8 in the test',
      ['noscale'],
    ),
    line(3, 'if mask is not None:'),
    line(3, maskLine, useMask ? '# 0 in the mask = hide' : '# mask is None: skipped', ['mask1', 'fill0']),
    line(
      4,
      bug === 'dim' ? 'attention_weights = F.softmax(scores, dim=-2)' : 'attention_weights = F.softmax(scores, dim=-1)',
      bug === 'dim' ? '# columns sum to 1' : '# each row sums to 1',
      ['dim'],
    ),
    line(5, 'if dropout is not None:'),
    line(5, '    attention_weights = dropout(attention_weights)', '# None in the tests: skipped'),
    line(6, 'output = torch.matmul(attention_weights, value)', '# (B, h, T, d_v)'),
  ]

  const rowFmt = (v: number) => fmt(v, 2)
  let main: ReactNode
  let say: ReactNode
  let shapeTiny = ''
  let shapeTest = ''
  if (step === 0) {
    main = (
      <div className={s.trio}>
        <LabMatrix caption="query (Q)" data={Q} rowLabels={TOK} format={(v) => String(v)} cell={34} />
        <LabMatrix caption="key (K)" data={K} rowLabels={TOK} format={(v) => String(v)} cell={34} colour="var(--viz-2)" />
        <LabMatrix caption="value (V)" data={V} rowLabels={TOK} format={(v) => String(v)} cell={34} colour="var(--viz-3)" />
      </div>
    )
    say = (
      <>
        Three tokens, each with a query, a key and a value. <code>query.size(-1)</code> reads the last axis, so <M>{'d_k = 4'}</M>. Never type 64: hidden tests use other
        sizes.
      </>
    )
    shapeTiny = 'Q, K: (1, 1, 3, 4)'
    shapeTest = 'Q, K, V: (2, 8, 10, 64)'
  } else if (step === 1) {
    main = <LabMatrix caption="scores = Q Kᵀ" data={calc.raw} rowLabels={TOK} colLabels={TOK} format={(v) => fmt(v, 0)} hlRow={0} />
    say = (
      <>
        Row <i>i</i>, column <i>j</i> is the dot product of query <i>i</i> with key <i>j</i>. For <code>cats</code>: <M>{'[1,1,0,0]\\cdot[1,1,0,0] = 2'}</M>, with{' '}
        <code>purr</code> 0, and with <code>[PAD]</code> 2. <code>transpose(-2, -1)</code> swaps only the last two axes of the key.
      </>
    )
    shapeTiny = '(1, 1, 3, 3)'
    shapeTest = '(2, 8, 10, 10)'
  } else if (step === 2) {
    main = <LabMatrix caption={bug === 'noscale' ? 'scores (not scaled!)' : 'scores ÷ √d_k = scores ÷ 2'} data={calc.scaled} rowLabels={TOK} colLabels={TOK} format={rowFmt} hlRow={0} />
    say =
      bug === 'noscale' ? (
        <>The scores stay twice as big as they should be. Nothing crashes, and no shape changes.</>
      ) : (
        <>
          <M>{'\\sqrt{4} = 2'}</M>, so every score is halved: the <code>cats</code> row becomes <M>{'[1, 0, 1]'}</M>. Use <code>math.sqrt</code> because <code>d_k</code> is a plain
          number.
        </>
      )
    shapeTiny = '(1, 1, 3, 3)'
    shapeTest = '(2, 8, 10, 10)'
  } else if (step === 3) {
    main = <LabMatrix caption={useMask ? 'after masked_fill' : 'no mask: unchanged'} data={calc.masked} rowLabels={TOK} colLabels={TOK} format={rowFmt} masked={calc.maskedCells} hlRow={0} />
    say = !useMask ? (
      <>With <code>mask=None</code> the line is skipped, and the padding key keeps a high score.</>
    ) : bug === 'mask1' ? (
      <>The mask is <M>{'[1, 1, 0]'}</M>. Testing <code>mask == 1</code> hides the two real tokens instead of the padding.</>
    ) : bug === 'fill0' ? (
      <>The padding scores became 0, which is not small at all compared with the others.</>
    ) : (
      <>
        The mask <M>{'[1, 1, 0]'}</M> has shape (B, 1, 1, T): 0 means hide. <code>masked_fill</code> writes <M>{'-10^9'}</M> into every score in the <code>[PAD]</code> column,
        for every query row at once (broadcasting).
      </>
    )
    shapeTiny = 'mask (1, 1, 1, 3)'
    shapeTest = 'mask (2, 1, 1, 10)'
  } else if (step === 4) {
    main = (
      <div className={s.withSums}>
        <LabMatrix caption={`softmax(scores, dim=${bug === 'dim' ? '-2' : '-1'})`} data={calc.weights} rowLabels={TOK} colLabels={TOK} format={rowFmt} range={[0, 1]} masked={calc.maskedCells} hlRow={0} />
        <div className={s.sums} aria-label="row sums">
          <span className={s.sumsHead}>row sum</span>
          {calc.rowSums.map((v, i) => (
            <span key={i} className={Math.abs(v - 1) < 1e-6 ? s.sumOk : s.sumBad}>
              {v.toFixed(2)}
            </span>
          ))}
        </div>
      </div>
    )
    say =
      bug === 'dim' ? (
        <>Each column now adds up to 1, so the row sums are wrong and the test's <code>allclose</code> fails.</>
      ) : (
        <>
          Row by row: <code>cats</code> has scaled scores <M>{useMask && bug === 'ok' ? '[1, 0, -10^9]' : `[${calc.masked[0].map((v) => (v <= -1e8 ? '-10^9' : String(+v.toFixed(2)))).join(', ')}]`}</M>, giving
          weights <M>{`[${calc.weights[0].map((v) => v.toFixed(2)).join(', ')}]`}</M>. Every row adds up to 1.
        </>
      )
    shapeTiny = '(1, 1, 3, 3)'
    shapeTest = '(2, 8, 10, 10)'
  } else if (step === 5) {
    main = <LabMatrix caption="weights (unchanged)" data={calc.weights} rowLabels={TOK} colLabels={TOK} format={rowFmt} range={[0, 1]} masked={calc.maskedCells} />
    say = (
      <>
        The tests pass <code>dropout=None</code>, so this line does nothing. Inside <code>MultiHeadAttention</code> it receives <code>self.dropout</code>, which in training zeroes a
        random 10% of the weights and scales the rest by <M>{'1/0.9'}</M>.
      </>
    )
    shapeTiny = '(1, 1, 3, 3)'
    shapeTest = '(2, 8, 10, 10)'
  } else {
    main = (
      <div className={s.trio}>
        <LabMatrix caption="weights" data={calc.weights} rowLabels={TOK} format={rowFmt} range={[0, 1]} masked={calc.maskedCells} cell={44} hlRow={0} />
        <span className={s.op}>@</span>
        <LabMatrix caption="value" data={V} format={(v) => String(v)} cell={34} colour="var(--viz-3)" />
        <span className={s.op}>=</span>
        <LabMatrix caption="output" data={calc.out} rowLabels={TOK} format={rowFmt} range={[0, 1]} cell={44} colour="var(--viz-3)" hlRow={0} />
      </div>
    )
    say = (
      <>
        Each output row is a weighted average of the value rows: <code>cats</code> gets <M>{`${calc.weights[0][0].toFixed(2)}\\,[1,0] + ${calc.weights[0][1].toFixed(2)}\\,[0,1] + ${calc.weights[0][2].toFixed(2)}\\,[0,0]`}</M>.
        Return <b>both</b> <code>output</code> and <code>attention_weights</code>.
      </>
    )
    shapeTiny = 'output (1, 1, 3, 2)'
    shapeTest = 'output (2, 8, 10, 64)'
  }

  return (
    <Figure
      title="Six lines of Q3.1, one at a time"
      caption={
        <>
          Press <b>Next</b> to run one line at a time on the example sentence <code>cats purr [PAD]</code>. Then pick a slip from the chips: watch which line turns red, how the
          numbers change, and what the notebook's real test cell printed. Notice that forgetting <M>{'\\sqrt{d_k}'}</M> passes every visible check.
        </>
      }
    >
      <div ref={wrapRef} className={s.stack}>
        <CodeLines lines={lines} title="def scaled_dot_product_attention(query, key, value, mask=None, dropout=None):" narrow={narrow} />
        <div className={s.stage}>
          <div className={s.stageMain}>{main}</div>
          <p className={s.say}>
            <b>Step {step + 1}, {STEP_NAMES[step]}.</b> {say}
          </p>
          <div className={s.shapes}>
            <span>
              this example <Shape tone="accent">{shapeTiny}</Shape>
            </span>
            <span>
              notebook test <Shape>{shapeTest}</Shape>
            </span>
          </div>
        </div>
        <PlayerControls player={player} label={(i) => `Line ${i + 1} of 7`} />
        <Controls>
          <Chips label="Inject a slip" options={BUG_OPTIONS} value={bug} onChange={setBug} />
          <Toggle label="Pass the padding mask [1, 1, 0]" checked={useMask} onChange={setUseMask} />
        </Controls>
        <p className={`${s.verdict} ${bug === 'ok' ? s.verdictOk : s.verdictBad}`}>{VERDICT[bug]}</p>
        <Console title={HEAD} lines={TEST[bug]} />
      </div>
    </Figure>
  )
}
