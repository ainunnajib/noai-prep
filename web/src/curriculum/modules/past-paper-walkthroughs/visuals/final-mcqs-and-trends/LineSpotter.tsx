import { useState, type ReactNode } from 'react'
import { Figure, M } from '../../../../../kit'
import s from '../prelim-problem-solving/ppw.module.css'
import { Note, LessonLink, cx } from '../prelim-problem-solving/shared'
import { CodePanel, CodeLine, type LineState } from './CodePanel'

/*
  Six short snippets, one per bug pattern of the 2026 Final MCQs. Each has exactly one decisive line.
  Click lines: every line you click explains itself; find the bug to unlock its pattern, the fix and
  the Final question that used the same pattern. Bugs and their effects were checked by running them.
*/

type PatternId = 'sign' | 'norm' | 'leak' | 'func' | 'state' | 'edge'
const PATTERNS: Record<PatternId, { name: string; color: string }> = {
  sign: { name: 'Sign or formula error', color: 'var(--viz-1)' },
  norm: { name: 'Wrong normalisation', color: 'var(--viz-2)' },
  leak: { name: 'Data leakage', color: 'var(--viz-3)' },
  func: { name: 'Wrong function choice', color: 'var(--viz-4)' },
  state: { name: 'State bug', color: 'var(--viz-5)' },
  edge: { name: 'Unhandled edge case', color: 'var(--viz-6)' },
}

interface Snippet {
  id: string
  tab: string
  pattern: PatternId
  task: ReactNode
  lines: string[]
  bug: number
  /** a line that is close (part of the story) but not the decisive one */
  near?: number
  notes: Record<number, ReactNode>
  fix: string
  final: ReactNode
  lesson: { to: string; label: string }
}

const SNIPPETS: Snippet[] = [
  {
    id: 'ada',
    tab: 'AdaBoost',
    pattern: 'sign',
    task: <>One round of AdaBoost with labels in &#123;−1, +1&#125;. The ensemble never improves on its first stump. Which line is wrong?</>,
    lines: [
      'def adaboost_round(X, y, w):  # y in {-1, +1}',
      '    stump = DecisionTreeClassifier(max_depth=1)',
      '    stump.fit(X, y, sample_weight=w)',
      '    pred = stump.predict(X)',
      '    err = np.sum(w * (pred != y)) / np.sum(w)',
      '    alpha = 0.5 * np.log((1 - err) / err)',
      '    w = w * np.exp(alpha * y * pred)',
      '    return w / np.sum(w), stump, alpha',
    ],
    bug: 7,
    notes: {
      1: <>Labels are ±1, so <code>y * pred</code> is +1 for a correct point and −1 for a mistake. Keep that in mind.</>,
      2: <>A one-split tree (a stump) as the weak learner: fine.</>,
      3: <>Trains the stump with the current sample weights: fine.</>,
      4: <>Predictions on the training data: fine.</>,
      5: (
        <>
          Weighted error <M>{'\\varepsilon = \\sum_i w_i[\\text{wrong}_i] / \\sum_i w_i'}</M>: matches the formula.
        </>
      ),
      6: (
        <>
          <M>{'\\alpha = \\tfrac12 \\ln\\frac{1-\\varepsilon}{\\varepsilon}'}</M>, the textbook &ldquo;amount of say&rdquo;: fine.
        </>
      ),
      7: (
        <>
          <b>The bug: a missing minus sign.</b> The rule is <M>{'w_i \\leftarrow w_i\\, e^{-\\alpha y_i h(x_i)}'}</M>. As written, correct points (<M>{'y\\,h = +1'}</M>) are multiplied
          by <M>{'e^{\\alpha}'}</M> and mistakes shrink, so the booster learns to ignore its hard cases. In our test run the weight on mistakes fell from 5.3% to
          0.3% after one round, instead of rising to 50%.
        </>
      ),
      8: <>Renormalising so the weights sum to 1: fine.</>,
    },
    fix: '    w = w * np.exp(-alpha * y * pred)',
    final: <>2026 Final Q5 asks about the same update, written with 0/1 mistakes instead of ±1 labels.</>,
    lesson: { to: 'trees-and-ensembles/boosting-adaboost', label: 'Boosting and AdaBoost' },
  },
  {
    id: 'attn',
    tab: 'Attention',
    pattern: 'norm',
    task: <>Scaled dot-product attention with <code>d_k = 64</code>. The attention weights come out almost uniform. Which line is wrong?</>,
    lines: [
      'def attention(Q, K, V):  # (batch, seq, d_k)',
      '    d_k = Q.shape[-1]',
      '    scores = Q @ K.transpose(-2, -1)',
      '    scores = scores / d_k',
      '    weights = torch.softmax(scores, dim=-1)',
      '    return weights @ V',
    ],
    bug: 4,
    notes: {
      1: <>Shapes in the comment: each query and key is a vector of length <code>d_k</code>.</>,
      2: <>Reads <code>d_k</code> from the last dimension: fine.</>,
      3: <>Every query dotted with every key, giving shape (batch, seq, seq): fine.</>,
      4: (
        <>
          <b>The bug: divide by <M>{'\\sqrt{d_k}'}</M>, not <M>{'d_k'}</M>.</b> A dot product of two random length-64 vectors has a standard deviation of about{' '}
          <M>{'\\sqrt{64} = 8'}</M>. Dividing by 8 brings it to about 1; dividing by 64 shrinks it to about 0.13, so softmax spreads its weight almost evenly and
          attention cannot focus.
        </>
      ),
      5: <>Softmax over the last dimension (over the keys), so each query&rsquo;s weights sum to 1: fine.</>,
      6: <>Weighted average of the values: fine.</>,
    },
    fix: '    scores = scores / math.sqrt(d_k)',
    final: <>2026 Final Q16 tests the √d_k scaling; Q10 tests the other normalisation classic, dividing the loss by accumulation_steps.</>,
    lesson: { to: 'attention-and-transformers/scaled-dot-product-attention', label: 'Scaled dot-product attention and masks' },
  },
  {
    id: 'scale',
    tab: 'Scaling',
    pattern: 'leak',
    task: <>A logistic regression is scored on a held-out test set. The score is a little better than the model deserves. Which line causes that?</>,
    lines: [
      'scaler = StandardScaler()',
      'X_all = scaler.fit_transform(X)',
      'X_tr, X_te, y_tr, y_te = train_test_split(X_all, y, test_size=0.2)',
      'model = LogisticRegression().fit(X_tr, y_tr)',
      'print(model.score(X_te, y_te))',
    ],
    bug: 2,
    near: 3,
    notes: {
      1: <>Creating the scaler: fine.</>,
      2: (
        <>
          <b>The bug: fitting on every row.</b> The scaler learns its mean and standard deviation from the test rows too, so information about the test set
          leaks into training. Fit on <code>X_tr</code> only, then transform both splits.
        </>
      ),
      3: <>The split is fine in itself; it simply happens one step too late.</>,
      4: <>Fitting on the training split: fine.</>,
      5: <>Scoring on the test split: fine, but the number it prints is now slightly optimistic.</>,
    },
    fix: 'scaler.fit(X_tr)  # after the split; then transform X_tr and X_te',
    final: <>2026 Final Q3 hides the same leak inside cross-validation, with feature selection, where it can turn a coin-flip model into an &ldquo;80%&rdquo; one.</>,
    lesson: { to: 'data-and-features/splitting-and-leakage', label: 'Splitting data and avoiding leakage' },
  },
  {
    id: 'multi',
    tab: 'Multi-label',
    pattern: 'func',
    task: <>Each photo may contain any of 5 objects. Photos with two objects never get both of them predicted. Which line is wrong?</>,
    lines: [
      '# each photo may contain any of 5 objects (multi-label)',
      'logits = model(images)  # (batch, 5)',
      'probs = torch.softmax(logits, dim=1)',
      'loss = F.binary_cross_entropy(probs, targets)',
      'preds = probs > 0.5',
    ],
    bug: 3,
    notes: {
      1: <>Multi-label: several labels can be 1 at once. Keep that in mind.</>,
      2: <>One raw score (logit) per object: fine.</>,
      3: (
        <>
          <b>The bug: softmax for a multi-label task.</b> Softmax makes the 5 probabilities add up to 1, so two objects cannot both be likely: logits [4, 4, −3]
          become [0.50, 0.50, 0.00]. A sigmoid per label gives [0.98, 0.98, 0.05].
        </>
      ),
      4: <>Binary cross-entropy per label is the right loss for multi-label, once the probabilities come from a sigmoid.</>,
      5: <>A 0.5 threshold per label: fine with sigmoid, but with softmax two objects can never both pass it.</>,
    },
    fix: 'probs = torch.sigmoid(logits)  # or F.binary_cross_entropy_with_logits(logits, targets)',
    final: <>2026 Final Q6 compares sigmoid + BCE, BCE-with-logits and softmax for exactly this multi-label set-up.</>,
    lesson: { to: 'neural-networks/outputs-and-losses', label: 'Output layers and loss functions' },
  },
  {
    id: 'head',
    tab: 'Fine-tuning',
    pattern: 'state',
    task: <>A pretrained network gets a new 10-class head. The loss barely moves, and the head&rsquo;s weights never change. Which line is wrong?</>,
    lines: [
      'model = Net()  # pretrained backbone + head',
      'optimiser = torch.optim.Adam(model.parameters(), lr=1e-3)',
      'model.head = nn.Linear(512, 10)  # new task: 10 classes',
      'for x, y in loader:',
      '    optimiser.zero_grad()',
      '    loss = F.cross_entropy(model(x), y)',
      '    loss.backward()',
      '    optimiser.step()',
    ],
    bug: 3,
    near: 2,
    notes: {
      1: <>Loading the model: fine.</>,
      2: <>Fine on its own: the optimiser stores the parameters that exist <i>right now</i>. Now look at what happens next.</>,
      3: (
        <>
          <b>The bug: the new layer is created after the optimiser was built.</b> Its weights get gradients but are not in the optimiser&rsquo;s list, so{' '}
          <code>step()</code> never updates them. Replace the head first, then create the optimiser.
        </>
      ),
      4: <>Loop over mini-batches: fine.</>,
      5: <>Clears last step&rsquo;s gradients: fine.</>,
      6: <>Forward pass and loss: fine.</>,
      7: <>Backward pass fills <code>.grad</code>, the new head included: fine.</>,
      8: <>Updates only the parameters the optimiser knows about, which excludes the new head.</>,
    },
    fix: 'model.head = nn.Linear(512, 10)  # move this ABOVE the optimiser line',
    final: <>2026 Final Q14 (optimiser built before the head is replaced) and Q8 (BatchNorm running statistics as buffers) are both state bugs.</>,
    lesson: { to: 'pytorch/modules-and-layers', label: 'nn.Module, layers and saving models' },
  },
  {
    id: 'iou',
    tab: 'IoU',
    pattern: 'edge',
    task: <>Per-class IoU for segmentation. The mean IoU over classes sometimes comes out as <code>nan</code>. Which line is responsible?</>,
    lines: [
      'def iou(pred, target, cls):',
      '    p = (pred == cls)',
      '    t = (target == cls)',
      '    inter = (p & t).sum()',
      '    union = (p | t).sum()',
      '    return inter / union',
    ],
    bug: 6,
    notes: {
      1: <>Masks of predicted and true pixels of one class: fine.</>,
      2: <>Boolean mask of pixels predicted as <code>cls</code>: fine.</>,
      3: <>Boolean mask of pixels that really are <code>cls</code>: fine.</>,
      4: <>Intersection: pixels in both masks. Fine.</>,
      5: <>Union: pixels in either mask. Fine.</>,
      6: (
        <>
          <b>The bug: no case for an empty union.</b> If the class appears in neither the prediction nor the target, this is <M>{'0/0'}</M>, which gives{' '}
          <code>nan</code> and poisons the mean. Return <code>nan</code> on purpose and average with <code>np.nanmean</code>, which skips that class.
        </>
      ),
    },
    fix: "    return inter / union if union > 0 else float('nan')  # then np.nanmean",
    final: <>2026 Final Q13 is this exact edge case; Q18 is another (truncating a sequence cuts off its &lt;EOS&gt; token).</>,
    lesson: { to: 'vision-tasks/segmentation-metrics', label: 'Measuring segmentation: IoU per class and mean IoU' },
  },
]

interface SnipState {
  clicked: number[]
  firstTry: boolean | null
}

export default function LineSpotter() {
  const [idx, setIdx] = useState(0)
  const [st, setSt] = useState<SnipState[]>(() => SNIPPETS.map(() => ({ clicked: [], firstTry: null })))
  const snip = SNIPPETS[idx]
  const cur = st[idx]
  const found = cur.clicked.includes(snip.bug)
  const click = (n: number) =>
    setSt((all) =>
      all.map((x, i) =>
        i !== idx || x.clicked.includes(n) ? x : { clicked: [...x.clicked, n], firstTry: x.firstTry === null ? n === snip.bug : x.firstTry },
      ),
    )
  const lineState = (n: number): LineState => {
    if (!cur.clicked.includes(n)) return found ? 'dim' : 'plain'
    if (n === snip.bug) return 'found'
    return n === snip.near ? 'picked' : 'ok'
  }
  const notes: Record<number, ReactNode> = {}
  cur.clicked.forEach((n) => (notes[n] = snip.notes[n]))
  const nFound = st.filter((x, i) => x.clicked.includes(SNIPPETS[i].bug)).length
  const firstTries = st.filter((x) => x.firstTry === true).length

  return (
    <Figure
      title="Line spotter: one bug, one line"
      caption={
        <>
          Pick a snippet and click the line you suspect. Every line you click explains itself; the decisive line unlocks the pattern, the one-line fix and the
          2026 Final question built on the same pattern. Collect all six patterns. Notice that in each snippet only one line contradicts a formula or rule you
          already know.
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.row} role="tablist" aria-label="Snippets">
          {SNIPPETS.map((sn, i) => {
            const done = st[i].clicked.includes(sn.bug)
            return (
              <button
                key={sn.id}
                type="button"
                role="tab"
                aria-selected={i === idx}
                className={cx(s.chip, i === idx && s.selected, done && i !== idx && s.good)}
                onClick={() => setIdx(i)}
              >
                {i + 1} · {sn.tab}
                {done ? ' ✓' : ''}
              </button>
            )
          })}
        </div>
        <div className={s.stepCard}>
          <span className={s.label}>
            Snippet {idx + 1} of {SNIPPETS.length}
          </span>
          <span>{snip.task}</span>
        </div>
        <CodePanel lines={snip.lines} state={lineState} notes={notes} onLine={click} ariaLabel={`Snippet ${idx + 1}: click a line`} title="click the line you suspect" />
        {found ? (
          <Note tone="good">
            <b>Pattern: {PATTERNS[snip.pattern].name}.</b> Fix:
            <code className={s.fixLine}>
              <CodeLine text={snip.fix.trim()} />
            </code>
            {snip.final} Learn it: <LessonLink to={snip.lesson.to}>{snip.lesson.label}</LessonLink>.
          </Note>
        ) : cur.clicked.length > 0 ? (
          <Note tone="plain">
            Not that one yet.{' '}
            {snip.near && cur.clicked.includes(snip.near)
              ? 'You are close: the problem sits right next to a line you have checked.'
              : 'Keep checking the lines that compute, divide, choose a function or change state against the rule they should follow.'}
          </Note>
        ) : null}
        <div className={s.patternRow} aria-label="Patterns collected">
          {(Object.keys(PATTERNS) as PatternId[]).map((p) => {
            const got = SNIPPETS.some((sn, i) => sn.pattern === p && st[i].clicked.includes(sn.bug))
            return (
              <span key={p} className={cx(s.patternChip, got && s.patternGot)} style={got ? { borderColor: PATTERNS[p].color } : undefined}>
                <span className={s.legendSwatch} style={{ background: got ? PATTERNS[p].color : 'var(--surface-3)' }} />
                {got ? PATTERNS[p].name : '?'}
              </span>
            )
          })}
        </div>
        <div className={s.muted}>
          Patterns found: {nFound} of 6 · found on the first click: {firstTries}
        </div>
      </div>
    </Figure>
  )
}
