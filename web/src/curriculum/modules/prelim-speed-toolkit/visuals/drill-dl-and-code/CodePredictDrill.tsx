import { useEffect, useMemo, useRef, useState } from 'react'
import { Figure, Segmented, Button, Bars, CodeBlock, mulberry32, shuffled } from '../../../../../kit'
import { History, Stats, TimerBar, loadLocal, saveLocal, useCountdown } from './ddKit'
import s from './dd.module.css'

/*
  Code-output cards, each built around one classic trap. 30 seconds a card; after answering, the
  trap is named and explained. Filter by library; a personal chart counts misses per trap family
  (remembered in this browser only). Every output here was produced by running the code.
*/

type Lib = 'Python' | 'NumPy' | 'pandas' | 'PyTorch'
type Trap = 'ends' | 'division' | 'aliasing' | 'views' | 'shapes' | 'dtypes' | 'loc' | 'loop'

const TRAP_LABEL: Record<Trap, string> = {
  ends: 'Ranges and slices',
  division: '// and %',
  aliasing: 'Mutability and aliasing',
  views: 'Views and copies',
  shapes: '* vs @, broadcasting, dims',
  dtypes: 'Integer dtypes',
  loc: 'loc vs iloc',
  loop: 'Training-loop traps',
}

interface Card {
  id: string
  lib: Lib
  trap: Trap
  code: string
  ask: string
  options: string[]
  /** index of the right option in `options` before shuffling */
  answer: number
  why: string
}

const CARDS: Card[] = [
  {
    id: 'range',
    lib: 'Python',
    trap: 'ends',
    code: 'print(list(range(2, 8, 2)))',
    ask: 'What is printed?',
    options: ['[2, 4, 6]', '[2, 4, 6, 8]', '[4, 6, 8]', '[2, 3, 4, 5, 6, 7]'],
    answer: 0,
    why: 'range(start, stop, step) stops BEFORE stop: 2, 4, 6. The 8 is never reached.',
  },
  {
    id: 'slice',
    lib: 'Python',
    trap: 'ends',
    code: 's = "NOAI2027"\nprint(s[2:5])',
    ask: 'What is printed?',
    options: ['AI2', 'AI20', 'OAI2', 'OAI'],
    answer: 0,
    why: 'Indices start at 0 (N=0, O=1, A=2) and the slice end is excluded: positions 2, 3, 4 give "AI2". Length = 5 − 2 = 3.',
  },
  {
    id: 'floordiv',
    lib: 'Python',
    trap: 'division',
    code: 'print(7 // 2, -7 // 2)',
    ask: 'What is printed?',
    options: ['3 -4', '3 -3', '3.5 -3.5', '4 -4'],
    answer: 0,
    why: '// is FLOOR division: it rounds down, towards −∞. 3.5 → 3, but −3.5 → −4 (not −3).',
  },
  {
    id: 'mod',
    lib: 'Python',
    trap: 'division',
    code: 'print(-7 % 3)',
    ask: 'What is printed?',
    options: ['2', '-1', '1', '-2'],
    answer: 0,
    why: 'Python keeps a // b and a % b consistent: −7 = 3 × (−3) + 2, because −7 // 3 = −3. So the remainder is 2; it takes the sign of the divisor.',
  },
  {
    id: 'default',
    lib: 'Python',
    trap: 'aliasing',
    code: 'def add(item, bag=[]):\n    bag.append(item)\n    return bag\n\nadd(1)\nprint(add(2))',
    ask: 'What is printed?',
    options: ['[1, 2]', '[2]', '[1]', 'None'],
    answer: 0,
    why: 'A default value is created ONCE, when the function is defined. Both calls append to the same list. Fix: bag=None, then bag = [] inside.',
  },
  {
    id: 'alias',
    lib: 'Python',
    trap: 'aliasing',
    code: 'a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)',
    ask: 'What is printed?',
    options: ['[1, 2, 3, 4]', '[1, 2, 3]', '[4]', 'An error'],
    answer: 0,
    why: 'b = a copies the REFERENCE, not the list: a and b are two names for one list. Use b = a.copy() for a separate list.',
  },
  {
    id: 'grid',
    lib: 'Python',
    trap: 'aliasing',
    code: 'grid = [[0] * 3] * 2\ngrid[0][0] = 5\nprint(grid)',
    ask: 'What is printed?',
    options: ['[[5, 0, 0], [5, 0, 0]]', '[[5, 0, 0], [0, 0, 0]]', '[[5, 5, 5], [0, 0, 0]]', '[[5, 0, 0, 5, 0, 0]]'],
    answer: 0,
    why: '* 2 repeats the reference to ONE inner list, so both rows are the same object. Build rows separately: [[0] * 3 for _ in range(2)].',
  },
  {
    id: 'sortnone',
    lib: 'Python',
    trap: 'aliasing',
    code: 'nums = [3, 1, 2]\nresult = nums.sort()\nprint(result)',
    ask: 'What is printed?',
    options: ['None', '[1, 2, 3]', '[3, 1, 2]', 'An error'],
    answer: 0,
    why: 'list.sort() sorts in place and returns None. sorted(nums) returns a new sorted list.',
  },
  {
    id: 'is',
    lib: 'Python',
    trap: 'aliasing',
    code: 'a = [1, 2]\nb = [1, 2]\nprint(a == b, a is b)',
    ask: 'What is printed?',
    options: ['True False', 'True True', 'False False', 'False True'],
    answer: 0,
    why: '== compares values (equal); is asks "the same object?" Two separately built lists are different objects.',
  },
  {
    id: 'star',
    lib: 'NumPy',
    trap: 'shapes',
    code: 'A = np.array([[1, 2], [3, 4]])\nprint(A * A)',
    ask: 'What is printed?',
    options: ['[[ 1  4]\n [ 9 16]]', '[[ 7 10]\n [15 22]]', '[[2 4]\n [6 8]]', '30'],
    answer: 0,
    why: '* is element-wise: each entry squared. The matrix product A @ A would give [[7, 10], [15, 22]].',
  },
  {
    id: 'bcast',
    lib: 'NumPy',
    trap: 'shapes',
    code: 'a = np.array([1, 2, 3])\nb = np.array([[10], [20]])\nprint((a + b).shape)',
    ask: 'What is printed?',
    options: ['(2, 3)', '(3,)', '(2, 1)', 'An error: shapes do not match'],
    answer: 0,
    why: 'Line shapes up from the right: (3,) and (2, 1). Size-1 dimensions stretch, so (1, 3) + (2, 1) → (2, 3): every row of b added to every element of a.',
  },
  {
    id: 'view',
    lib: 'NumPy',
    trap: 'views',
    code: 'a = np.arange(5)\nb = a[1:3]\nb[:] = 0\nprint(a)',
    ask: 'What is printed?',
    options: ['[0 0 0 3 4]', '[0 1 2 3 4]', '[0 0 0 0 4]', '[0 1 0 0 4]'],
    answer: 0,
    why: 'A basic slice is a VIEW of the same memory, so writing to b changes a[1] and a[2]. Use a[1:3].copy() to get an independent array.',
  },
  {
    id: 'fancy',
    lib: 'NumPy',
    trap: 'views',
    code: 'a = np.arange(5)\nb = a[[1, 2]]\nb[:] = 0\nprint(a)',
    ask: 'What is printed?',
    options: ['[0 1 2 3 4]', '[0 0 0 3 4]', '[0 0 2 3 4]', 'An error'],
    answer: 0,
    why: 'Indexing with a LIST of positions ("fancy" indexing) makes a copy, so a is untouched. Compare the slice a[1:3], which is a view.',
  },
  {
    id: 'intarr',
    lib: 'NumPy',
    trap: 'dtypes',
    code: 'a = np.array([1, 2, 3])\na[0] = 2.9\nprint(a)',
    ask: 'What is printed?',
    options: ['[2 2 3]', '[2.9 2.  3. ]', '[3 2 3]', 'An error'],
    answer: 0,
    why: 'a has an integer dtype, fixed when it was created. Storing 2.9 truncates it to 2 without any warning.',
  },
  {
    id: 'loc',
    lib: 'pandas',
    trap: 'loc',
    code: "df = pd.DataFrame({'x': [10, 20, 30, 40]})\nprint(len(df.loc[1:2]), len(df.iloc[1:2]))",
    ask: 'What is printed?',
    options: ['2 1', '1 1', '2 2', '1 2'],
    answer: 0,
    why: 'loc slices by LABEL and includes the end (labels 1 and 2); iloc slices by POSITION and excludes it (position 1 only).',
  },
  {
    id: 'zerograd',
    lib: 'PyTorch',
    trap: 'loop',
    code: 'w = torch.tensor(2.0, requires_grad=True)\nfor _ in range(3):\n    loss = 3 * w\n    loss.backward()\nprint(w.grad)',
    ask: 'What is printed?',
    options: ['tensor(9.)', 'tensor(3.)', 'tensor(6.)', 'tensor(27.)'],
    answer: 0,
    why: '.backward() ADDS to .grad. Three calls each add d(3w)/dw = 3, giving 9. That is why a training loop calls optimiser.zero_grad() every step.',
  },
  {
    id: 'eval',
    lib: 'PyTorch',
    trap: 'loop',
    code: 'drop = nn.Dropout(p=0.5)\nx = torch.ones(4)\ndrop.eval()\nprint(drop(x))',
    ask: 'What is printed?',
    options: ['tensor([1., 1., 1., 1.])', 'tensor([0.5000, 0.5000, 0.5000, 0.5000])', 'About half 0s, the rest 2s', 'tensor([2., 2., 2., 2.])'],
    answer: 0,
    why: 'In eval mode dropout does nothing. In train mode it zeroes about half and doubles the rest (to keep the average). Forgetting model.eval() makes test predictions random.',
  },
  {
    id: 'softmaxce',
    lib: 'PyTorch',
    trap: 'loop',
    code: 'loss_fn = nn.CrossEntropyLoss()\nlogits = torch.tensor([[10.0, 0.0]])\ntarget = torch.tensor([0])\nprint(round(loss_fn(logits.softmax(dim=1), target).item(), 4))',
    ask: 'The model is confident and right. What is printed?',
    options: ['0.3133', '0.0', '0.6931', '1.3133'],
    answer: 0,
    why: 'CrossEntropyLoss applies log-softmax itself. Feeding it probabilities squashes them a second time, so the loss is stuck near 0.31 even for a perfect answer (on the raw logits it is 0.0000454). Pass raw logits.',
  },
  {
    id: 'tdtype',
    lib: 'PyTorch',
    trap: 'dtypes',
    code: 't = torch.tensor([1, 2, 3])\nprint(t.dtype)',
    ask: 'What is printed?',
    options: ['torch.int64', 'torch.float32', 'torch.int32', 'torch.float64'],
    answer: 0,
    why: 'torch.tensor infers the dtype from the data: whole numbers give int64. Write [1., 2., 3.] or pass dtype=torch.float32 for a float tensor.',
  },
  {
    id: 'tmean',
    lib: 'PyTorch',
    trap: 'dtypes',
    code: 't = torch.tensor([1, 2, 3])\nprint(t.mean())',
    ask: 'What happens?',
    options: ['A RuntimeError', 'tensor(2.)', 'tensor(2)', '2.0'],
    answer: 0,
    why: 't is int64, and mean() refuses integer tensors: "mean(): could not infer output dtype". Integer tensors also cannot have requires_grad=True.',
  },
  {
    id: 'argmax',
    lib: 'PyTorch',
    trap: 'shapes',
    code: 'x = torch.tensor([[1, 5, 2],\n                  [7, 0, 3]])\nprint(x.argmax(dim=1))',
    ask: 'What is printed?',
    options: ['tensor([1, 0])', 'tensor([1, 0, 1])', 'tensor([5, 7])', 'tensor(3)'],
    answer: 0,
    why: 'dim=1 looks along each row: the largest of [1, 5, 2] is at index 1, of [7, 0, 3] at index 0. dim=0 would give [1, 0, 1]; argmax returns positions, not values.',
  },
  {
    id: 'tview',
    lib: 'PyTorch',
    trap: 'views',
    code: 'x = torch.arange(6).reshape(2, 3)\ny = x.view(3, 2)\ny[0, 0] = 100\nprint(x[0, 0])',
    ask: 'What is printed?',
    options: ['tensor(100)', 'tensor(0)', 'An error', 'tensor(1)'],
    answer: 0,
    why: 'view() reshapes WITHOUT copying: x and y share memory, so the write shows up in x. Use .clone() for an independent copy.',
  },
]

const LIMIT = 30
const STORE = 'noai-prep:drill-dl-traps'
type Tally = Record<string, { seen: number; missed: number }>
type Filter = 'all' | 'Python' | 'NumPy' | 'PyTorch'

export default function CodePredictDrill() {
  const [filter, setFilter] = useState<Filter>('all')
  const [deck, setDeck] = useState(0)
  const [pos, setPos] = useState(0)
  const [running, setRunning] = useState(false)
  const [picked, setPicked] = useState<number | null>(null)
  const [timeUp, setTimeUp] = useState(false)
  const [marks, setMarks] = useState<boolean[]>([])
  const [tally, setTally] = useState<Tally>(() => loadLocal<Tally>(STORE, {}))
  const nextRef = useRef<HTMLDivElement>(null)

  const cards = useMemo(() => {
    const pool = CARDS.filter((c) => filter === 'all' || c.lib === filter || (filter === 'NumPy' && c.lib === 'pandas'))
    return shuffled(pool, mulberry32(4242 + deck * 31 + filter.length))
  }, [filter, deck])
  const card = cards[pos % cards.length]
  const order = useMemo(() => shuffled([0, 1, 2, 3], mulberry32(9001 + deck * 7 + pos * 13 + card.id.length)), [deck, pos, card.id])
  const shown = order.map((i) => card.options[i])
  const right = order.indexOf(card.answer)
  const answered = picked !== null || timeUp

  const record = (ok: boolean) => {
    setMarks((m) => [...m, ok])
    setTally((t) => {
      const cur = t[card.trap] ?? { seen: 0, missed: 0 }
      const n = { ...t, [card.trap]: { seen: cur.seen + 1, missed: cur.missed + (ok ? 0 : 1) } }
      saveLocal(STORE, n)
      return n
    })
  }

  const left = useCountdown(
    LIMIT,
    running && !answered,
    () => {
      setTimeUp(true)
      record(false)
    },
    `${deck}-${pos}-${filter}`,
  )

  const choose = (i: number) => {
    if (!running || answered) return
    setPicked(i)
    record(i === right)
  }
  const next = () => {
    setPicked(null)
    setTimeUp(false)
    if (pos + 1 >= cards.length) {
      setDeck((d) => d + 1)
      setPos(0)
    } else setPos((p) => p + 1)
    setRunning(true)
  }
  useEffect(() => {
    if (answered) nextRef.current?.querySelector('button')?.focus({ preventScroll: true })
  }, [answered])

  const hits = marks.filter(Boolean).length
  const chart = (Object.keys(TRAP_LABEL) as Trap[])
    .filter((t) => tally[t]?.seen)
    .map((t) => ({ label: `${TRAP_LABEL[t]} (${tally[t].missed}/${tally[t].seen})`, value: tally[t].missed, color: 'var(--viz-neg)' }))
    .sort((a, b) => b.value - a.value)
  const ok = picked !== null && picked === right

  return (
    <Figure
      title="Predict the output: one trap per card"
      caption={
        <>
          Read the code, predict what it prints, and pick before the 30 s run out. Most wrong options are exactly what you get by falling into the trap, and after you answer the trap is named and explained.
          The chart counts your misses by trap family (saved in this browser only): the tallest bar is the one to revise.
        </>
      }
    >
      <div className={s.wrap}>
        <Segmented
          label="Cards from"
          value={filter}
          onChange={(v) => {
            setFilter(v)
            setPos(0)
            setPicked(null)
            setTimeUp(false)
          }}
          options={[
            { value: 'all', label: 'All' },
            { value: 'Python', label: 'Python' },
            { value: 'NumPy', label: 'NumPy & pandas' },
            { value: 'PyTorch', label: 'PyTorch' },
          ]}
        />
        <div className={s.stage}>
          <div className={s.spread}>
            <span className={s.label}>
              Card {(pos % cards.length) + 1} of {cards.length} · {card.lib}
            </span>
            <span className={`${s.small} tabular`}>{running && !answered ? `${Math.ceil(left)} s` : answered ? '' : `${LIMIT} s each`}</span>
          </div>
          <TimerBar left={running && !answered ? left : LIMIT} limit={LIMIT} />
          <div style={{ width: '100%', minWidth: 0 }}>
            <CodeBlock code={card.code} language="python" showLineNumbers={false} />
          </div>
          <div className={s.prompt}>{card.ask}</div>
          <div className={`${s.options} ${shown.some((o) => o.length > 18) ? s.optionsOne : ''}`}>
            {shown.map((o, i) => {
              const cls = !answered ? '' : i === right ? s.optRight : i === picked ? s.optWrong : s.optDim
              return (
                <button key={i} type="button" className={`${s.opt} ${s.optMono} ${cls}`} disabled={!running || answered} onClick={() => choose(i)}>
                  {o}
                </button>
              )
            })}
          </div>
          {!running && (
            <Button primary onClick={() => setRunning(true)}>
              Start the clock
            </Button>
          )}
          {answered && (
            <div className={`${s.feedback} ${ok ? s.ok : s.miss}`} aria-live="polite">
              <div className={s.row}>
                <span className={ok ? s.okText : s.missText}>{ok ? 'Right.' : timeUp ? 'Time is up.' : 'Caught by the trap.'}</span>
                <span className={s.tag} style={{ color: 'var(--viz-5)' }}>
                  Trap: {TRAP_LABEL[card.trap]}
                </span>
              </div>
              <div>{card.why}</div>
              <div ref={nextRef} className={s.row} style={{ justifyContent: 'flex-end' }}>
                <Button primary onClick={next}>
                  Next card
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className={s.spread}>
          <Stats items={[['this session', `${hits} / ${marks.length}`]]} />
          <History marks={marks} />
        </div>
        {chart.length > 0 && (
          <div style={{ width: '100%', display: 'grid', gap: '0.4rem' }}>
            <div className={s.spread}>
              <span className={s.label}>Your misses by trap (missed / seen)</span>
              <button
                type="button"
                className={s.chip}
                onClick={() => {
                  setTally({})
                  saveLocal(STORE, {})
                }}
              >
                Reset chart
              </button>
            </div>
            <Bars data={chart} max={Math.max(1, ...chart.map((c) => c.value))} format={(v) => String(v)} ariaLabel="Misses per trap family" />
          </div>
        )}
      </div>
    </Figure>
  )
}
