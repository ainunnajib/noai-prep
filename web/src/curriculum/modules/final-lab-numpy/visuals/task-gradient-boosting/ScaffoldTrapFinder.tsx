import { useState, type ReactNode } from 'react'
import { Figure, Button, useNarrow } from '../../../../../kit'
import { Py } from './code'
import s from './gb.module.css'

/*
  The 2026 Task 1 skeleton with the given code greyed out and the answer slots as buttons. Click a slot to
  see what goes there. On the right, pick a classic trap and run the notebook's test cell: the printed
  outputs are the real ones, produced by running the official solution with that one bug
  (scratch/gb/traps.py, scikit-learn 1.9, NumPy 2.5).
*/

type SlotId = '1.1' | '1.2' | '1.3' | '1.4' | '1.5' | '1.6a' | '1.6b' | '1.7'

interface SlotInfo {
  title: string
  marks: string
  code: string
  note: ReactNode
}

const SLOTS: Record<SlotId, SlotInfo> = {
  '1.1': {
    title: 'l1_negative_gradient',
    marks: '2 marks',
    code: 'return np.sign(y - y_pred)',
    note: <>Element-wise, so it works for any shape (the test uses (3, 5) arrays). np.sign gives 0 where y equals y_pred, a valid sub-gradient.</>,
  },
  '1.2': {
    title: 'l2_negative_gradient',
    marks: '2 marks',
    code: 'return y - y_pred',
    note: <>The residual: truth minus prediction. The order matters: y_pred − y is the gradient, which points uphill.</>,
  },
  '1.3': {
    title: 'l1_initial_prediction',
    marks: '2 marks',
    code: 'return np.float64(np.median(y))',
    note: <>No axis argument: one number for the whole array, even when the test passes y of shape (3, 5).</>,
  },
  '1.4': {
    title: 'l2_initial_prediction',
    marks: '2 marks',
    code: 'return np.float64(np.mean(y))',
    note: <>The mean minimises squared error. np.mean already returns np.float64; wrapping it makes the return type explicit.</>,
  },
  '1.5': {
    title: 'BaseGradientBoosting.predict',
    marks: '4 marks',
    code: 'predictions = np.full(X.shape[0], self.init_prediction)\nfor tree in self.trees:\n    predictions += self.learning_rate * tree.predict(X)\nreturn predictions',
    note: (
      <>
        The heading says &quot;implement <code>__init__</code>&quot;, but <code>__init__</code> is already written in the subclass. The empty slot marked{' '}
        <b>QUESTION 1.5</b> is <b>predict</b>: start every sample at F0, then add learning_rate × tree(X) for every stored tree.
      </>
    ),
  },
  '1.6a': {
    title: 'GradientBoostingRegressor.fit (the loop)',
    marks: '8 marks with 1.6b',
    code: 'for m in range(self.n_estimators):\n    residuals = self._compute_negative_gradient(y, current_pred)  # a\n    indices = self._subsample_indices(n_samples, rng)             # b\n    tree = DecisionTreeRegressor(max_depth=self.max_depth,\n                                 random_state=rng.randint(0, 10000))\n    tree.fit(X[indices], residuals[indices])                      # c\n    current_pred += self.learning_rate * tree.predict(X)          # d\n    self.trees.append(tree)                                       # e\nreturn self',
    note: <>Fit on the sampled rows only, but update current_pred for ALL rows. Use the helpers the base class gives you rather than re-writing them.</>,
  },
  '1.6b': {
    title: 'GradientBoostingRegressor.predict',
    marks: '8 marks with 1.6a',
    code: 'predictions = np.full(X.shape[0], self.init_prediction)\nfor tree in self.trees:\n    predictions += self.learning_rate * tree.predict(X)\nreturn predictions',
    note: <>The same loop as Q1.5, written after the given &quot;Model not fitted yet&quot; check. This subclass method overrides the base class one.</>,
  },
  '1.7': {
    title: 'GBREarlyStop.fit (bonus)',
    marks: '5 bonus marks',
    code: '# fit the tree as in 1.6a, then\nF_train += self.learning_rate * tree.predict(X_train)\nF_val += self.learning_rate * tree.predict(X_val)\nself.trees.append(tree)\nval_loss = np.mean((y_val - F_val) ** 2)   # MAE for \'l1\'\nif val_loss < best_val_loss - min_delta:\n    best_val_loss, best_n_estimators = val_loss, m + 1\n    patience_counter = 0\nelse:\n    patience_counter += 1\nif patience_counter >= patience:\n    break',
    note: <>Part 3 of this lesson builds this step by step. Keep the default criterion=&quot;l1&quot; that this class&apos;s __init__ is given.</>,
  },
}

type Row = { kind: 'given'; code: string } | { kind: 'slot'; id: SlotId; code: string } | { kind: 'blank' }

const SKELETON: Row[] = [
  { kind: 'slot', id: '1.1', code: 'def l1_negative_gradient(y, y_pred):' },
  { kind: 'slot', id: '1.2', code: 'def l2_negative_gradient(y, y_pred):' },
  { kind: 'slot', id: '1.3', code: 'def l1_initial_prediction(y):' },
  { kind: 'slot', id: '1.4', code: 'def l2_initial_prediction(y):' },
  { kind: 'blank' },
  { kind: 'given', code: 'class BaseGradientBoosting(ABC):' },
  { kind: 'given', code: '    def _compute_negative_gradient(self, y, y_pred): ...' },
  { kind: 'given', code: '    def _compute_initial_prediction(self, y): ...' },
  { kind: 'given', code: '    def _subsample_indices(self, n_samples, rng): ...' },
  { kind: 'slot', id: '1.5', code: '    def predict(self, X):' },
  { kind: 'given', code: '    @abstractmethod\n    def fit(self, X, y): return' },
  { kind: 'blank' },
  { kind: 'given', code: 'class GradientBoostingRegressor(BaseGradientBoosting):' },
  { kind: 'given', code: "    def __init__(self, n_estimators=100,\n                 learning_rate=0.1, max_depth=3,\n                 criterion='l2', subsample=1.0,\n                 random_state=42): ...  # given" },
  { kind: 'given', code: '    def fit(self, X, y):\n        # given: init_prediction, current_pred, rng' },
  { kind: 'slot', id: '1.6a', code: '        for m in range(self.n_estimators): ...' },
  { kind: 'slot', id: '1.6b', code: '    def predict(self, X):' },
  { kind: 'blank' },
  { kind: 'given', code: 'class GBREarlyStop(GradientBoostingRegressor):' },
  { kind: 'given', code: '    def __init__(self, ..., criterion="l1", ...): ...' },
  { kind: 'given', code: '    def fit(self, X_train, y_train, X_val, y_val,\n            patience=10, min_delta=1e-4):\n        # given: trackers, F_train, F_val' },
  { kind: 'slot', id: '1.7', code: '        for m in range(self.n_estimators): ...' },
  { kind: 'given', code: '        self.trees = self.trees[:best_n_estimators]' },
]

interface Trap {
  id: string
  label: string
  slot: SlotId | null
  wrong?: string
  right?: string
  test: string
  out: string
  tone: 'ok' | 'bad' | 'warn'
  why: ReactNode
}

const TRAPS: Trap[] = [
  {
    id: 'none',
    label: 'No trap: the correct code',
    slot: null,
    test: "Test cell: criterion='l2', 100 trees, max_depth 3, learning_rate 0.1",
    out: '  MSE: 1267.7653',
    tone: 'ok',
    why: <>About the same as scikit-learn&apos;s own GradientBoostingRegressor (1268.7214). Always predicting the mean would give 17109.5225.</>,
  },
  {
    id: 'lr',
    label: 'predict() forgets the learning rate',
    slot: '1.6b',
    wrong: 'predictions += tree.predict(X)',
    right: 'predictions += self.learning_rate * tree.predict(X)',
    test: "Test cell: criterion='l2', 100 trees, learning_rate 0.1",
    out: '  MSE: 959122.5914',
    tone: 'bad',
    why: <>fit() took steps of 0.1 × tree(X), so the trees were built for that. Adding each tree at full size counts every correction 10 times over.</>,
  },
  {
    id: 'sign',
    label: 'Gradient instead of negative gradient',
    slot: '1.2',
    wrong: 'return y_pred - y',
    right: 'return y - y_pred',
    test: "Test cell: criterion='l2'",
    out: '  MSE: 1867059918463.7993',
    tone: 'bad',
    why: <>Every tree now pushes the predictions away from the targets, the gaps grow, and the next tree pushes harder: the model walks uphill.</>,
  },
  {
    id: 'fity',
    label: 'Tree fitted to y, not to the residuals',
    slot: '1.6a',
    wrong: 'tree.fit(X[indices], y[indices])',
    right: 'tree.fit(X[indices], residuals[indices])',
    test: "Test cell: criterion='l2'",
    out: '  MSE: 824446.8997',
    tone: 'bad',
    why: <>Each tree learns the whole target again instead of what is still wrong, so 100 trees × 0.1 stack about 10 copies of y on top of F0.</>,
  },
  {
    id: 'sub',
    label: 'Subsampling: update only the sampled rows',
    slot: '1.6a',
    wrong: 'current_pred[indices] += self.learning_rate * tree.predict(X[indices])',
    right: 'current_pred += self.learning_rate * tree.predict(X)',
    test: "Same data, criterion='l2', subsample=0.5",
    out: '  MSE: 7102.1432     (correct code: 859.3483)',
    tone: 'bad',
    why: <>predict() will add every tree to every row, so fit() must too. Otherwise the residuals that later trees learn are measured against predictions the final model never makes.</>,
  },
  {
    id: 'append',
    label: 'Forget self.trees.append(tree)',
    slot: '1.6a',
    wrong: '# self.trees.append(tree)   <- missing',
    right: 'self.trees.append(tree)',
    test: "Test cell: criterion='l2'",
    out: '  MSE: 17109.5225\n  (len(gb.trees) is 0, so the check len(gb.trees) == 10 fails)',
    tone: 'bad',
    why: <>The trees were trained and thrown away. predict() has only F0, so you get exactly the always-predict-the-mean score.</>,
  },
  {
    id: 'median',
    label: 'np.median(y, axis=0)',
    slot: '1.3',
    wrong: 'return np.median(y, axis=0)',
    right: 'return np.float64(np.median(y))',
    test: 'Q1.3 test cell: y = np.random.rand(3, 5)  (after np.random.seed(0))',
    out: 'array([0.64589411, 0.52889492, 0.60276338, 0.92559664, 0.38344152])\n\nexpected one number: np.float64(0.5680445610939323)',
    tone: 'warn',
    why: <>axis=0 takes the median of each column, so a (3, 5) input gives 5 numbers. The function must return a single np.float64.</>,
  },
]

export default function ScaffoldTrapFinder() {
  const [slot, setSlot] = useState<SlotId>('1.5')
  const [trapId, setTrapId] = useState('none')
  const [ranId, setRanId] = useState('none')
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(680)
  const trap = TRAPS.find((t) => t.id === trapId)!
  const ran = TRAPS.find((t) => t.id === ranId)!
  const stale = trapId !== ranId
  const info = SLOTS[slot]

  const pickTrap = (t: Trap) => {
    setTrapId(t.id)
    if (t.slot) setSlot(t.slot)
  }

  return (
    <Figure
      wide
      title="Read the scaffold, then spring the traps"
      caption={
        <>
          Greyed lines are given; the dashed boxes are the answer slots. Click a slot to see what goes there (start with Q1.5: its heading
          asks for <code>__init__</code>, but the empty method is <code>predict</code>). Then pick a trap and press <b>Run the test cell</b>. Each
          output is the real one from running the official solution with that single bug. Most traps do not crash: they print a number, and only a
          number you can sanity-check against the baseline (17109.5) tells you something is wrong.
        </>
      }
    >
      <div ref={wrapRef} className={s.two} style={narrow ? { gridTemplateColumns: 'minmax(0, 1fr)' } : { gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)' }}>
        <div className={s.code}>
          <div className={s.codeBar}>
            <span>question_1.ipynb (skeleton)</span>
            <span>slots = your code</span>
          </div>
          <div className={s.codeBody} style={{ fontSize: 11 }}>
            {SKELETON.map((r, i) => {
              if (r.kind === 'blank') return <span key={i} className={s.line} />
              if (r.kind === 'given')
                return (
                  <span key={i} className={`${s.line} ${s.lineWrap} ${s.lineGiven}`}>
                    <Py code={r.code} />
                  </span>
                )
              const bad = ran.slot === r.id && ran.id !== 'none' && !stale
              return (
                <button
                  key={i}
                  type="button"
                  className={`${s.slot} ${slot === r.id ? s.slotOn : ''}`}
                  style={bad ? { borderColor: 'var(--bad)' } : undefined}
                  onClick={() => setSlot(r.id)}
                  aria-pressed={slot === r.id}
                >
                  <span className={s.marks}>Q{r.id}</span>
                  <span style={{ whiteSpace: 'pre-wrap' }}>{r.code.trim()}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className={s.stack}>
          <div className={s.code}>
            <div className={s.codeBar}>
              <span>
                Q{slot} · {info.title}
              </span>
              <span>{info.marks}</span>
            </div>
            <div className={s.codeBody} style={{ fontSize: 11.5 }}>
              {info.code.split('\n').map((l, i) => (
                <span key={i} className={`${s.line} ${s.lineWrap}`}>
                  <Py code={l} />
                </span>
              ))}
            </div>
          </div>
          <div className={s.note}>{info.note}</div>

          <p className={s.panelLabel} style={{ marginTop: 4 }}>
            Pick a trap
          </p>
          <div className={s.traps} role="radiogroup" aria-label="traps">
            {TRAPS.map((t) => (
              <button key={t.id} type="button" role="radio" aria-checked={trapId === t.id} className={`${s.trap} ${trapId === t.id ? s.trapOn : ''}`} onClick={() => pickTrap(t)}>
                <span className={`${s.radio} ${trapId === t.id ? s.radioOn : ''}`} />
                <span>
                  {t.label}
                  {t.slot && <span style={{ color: 'var(--ink-3)' }}> · Q{t.slot}</span>}
                </span>
              </button>
            ))}
          </div>
          {trap.wrong && (
            <div className={s.code}>
              <div className={s.codeBody} style={{ fontSize: 11.5 }}>
                <span className={`${s.line} ${s.lineWrap} ${s.lineBad}`}>
                  <Py code={trap.wrong} />
                </span>
                <span className={`${s.line} ${s.lineWrap} ${s.lineOk}`}>
                  <Py code={trap.right!} />
                </span>
              </div>
            </div>
          )}
          <div className={s.code}>
            <div className={s.codeBar}>
              <span>{stale ? 'output is stale: press Run' : ran.test}</span>
              <Button primary onClick={() => setRanId(trapId)}>
                Run the test cell
              </Button>
            </div>
            <pre className={`${s.out} ${ran.tone === 'bad' ? s.outBad : ran.tone === 'warn' ? s.outWarn : s.outOk}`} style={{ opacity: stale ? 0.45 : 1 }} aria-live="polite">
              {ran.out}
            </pre>
          </div>
          {!stale && <div className={s.note}>{ran.why}</div>}
        </div>
      </div>
    </Figure>
  )
}
