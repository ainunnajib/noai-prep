import { useState, type ReactNode } from 'react'
import { Figure, Controls, Button, usePlayer, PlayerControls, useNarrow, useBump, mulberry32, M } from '../../../../../kit'
import { Mat, matmul, transpose, softmaxRow, fmt2, heat } from './Mat'
import s from './sdpa.module.css'

/*
  softmax(QKᵀ/√d_k)V for three tokens with d_k = d_v = 2, one stage per step.
  The learner edits Q, K and V, steps through the pipeline, and taps (or hovers) any cell to see
  exactly which query, key or weights produced it.
*/

const TOK = ['I', 'love', 'laksa']
const INIT: Record<'Q' | 'K' | 'V', number[][]> = {
  Q: [
    [2, 0],
    [0, 2],
    [1, 1],
  ],
  K: [
    [2, 1],
    [0, 2],
    [-1, 1],
  ],
  V: [
    [3, 0],
    [0, 3],
    [1, 1],
  ],
}
const STAGES = ['Q, K, V', 'Q Kᵀ', '÷ √dₖ', 'softmax', '× V']
const STEP_TITLES = ['Start: one row per token', 'Scores: S = Q Kᵀ', 'Scale: divide by √dₖ', 'Softmax along each row', 'Output: A V']
const f = fmt2
const paren = (v: number) => (v < 0 ? `(${f(v)})` : f(v))

export default function AttentionMatrixStepper() {
  const [mats, setMats] = useState(INIT)
  const [cell, setCell] = useState<[number, number]>([2, 0])
  const [out, setOut] = useState<[number, number]>([2, 0])
  const [seed, bump] = useBump()
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)
  const player = usePlayer({ steps: 5, interval: 2600 })
  const step = player.step

  const { Q, K, V } = mats
  const dk = Q[0].length
  const root = Math.sqrt(dk)
  const KT = transpose(K)
  const S = matmul(Q, KT)
  const Ssc = S.map((r) => r.map((v) => v / root))
  const A = Ssc.map(softmaxRow)
  const O = matmul(A, V)
  const [i, j] = cell
  const [oi, oc] = out

  const cw = narrow ? 42 : 50
  const ch = narrow ? 30 : 34
  const common = { cellW: cw, cellH: ch, labelW: narrow ? 34 : 40 }

  const edit = (name: 'Q' | 'K' | 'V') => (r: number, c: number, v: number) =>
    setMats((m) => ({ ...m, [name]: m[name].map((row, a) => row.map((x, b) => (a === r && b === c ? v : x))) }))

  const randomise = () => {
    bump()
    const rnd = mulberry32(1000 + seed * 7919)
    const make = () => TOK.map(() => [0, 0].map(() => Math.floor(rnd() * 6) - 2))
    setMats({ Q: make(), K: make(), V: make().map((r) => r.map((v) => Math.abs(v))) })
  }

  const shape = (label: string, r: number, c: number) => (
    <>
      {label} = ({r}, {c})
    </>
  )

  let view: ReactNode
  let explain: ReactNode
  let shapeLine: string
  if (step === 0) {
    view = (
      <>
        <Mat {...common} name="Q (queries)" data={Q} rowLabels={TOK} editable onEdit={edit('Q')} shape={shape('(T, dₖ)', 3, dk)} ariaLabel="Query matrix Q, editable" />
        <Mat {...common} name="K (keys)" data={K} rowLabels={TOK} editable onEdit={edit('K')} shape={shape('(T, dₖ)', 3, dk)} ariaLabel="Key matrix K, editable" />
        <Mat {...common} name="V (values)" data={V} rowLabels={TOK} editable onEdit={edit('V')} shape={shape('(T, dᵥ)', 3, 2)} ariaLabel="Value matrix V, editable" />
      </>
    )
    explain = (
      <>
        Each <b>row</b> belongs to one token: row "love" of Q is the query of "love", row "love" of K is its key, and row "love" of V is its value. Here
        T = 3 tokens and d<sub>k</sub> = d<sub>v</sub> = 2. Type new numbers (−3 to 3) into any cell, then press <b>Next</b>.
      </>
    )
    shapeLine = 'Q (3, 2)   K (3, 2)   V (3, 2)'
  } else if (step === 1) {
    view = (
      <>
        <Mat {...common} name="Q" data={Q} rowLabels={TOK} hlRows={[i]} onSelect={(r) => setCell([r, j])} shape="(3, 2)" ariaLabel="Q with the selected query row highlighted" />
        <span className={s.op}>×</span>
        <Mat {...common} name="Kᵀ" data={KT} colLabels={TOK} hlCols={[j]} onSelect={(_, c) => setCell([i, c])} shape="(2, 3)" ariaLabel="K transposed, keys as columns" />
        <span className={s.op}>=</span>
        <Mat {...common} name="S (scores)" data={S} rowLabels={TOK} colLabels={TOK} sel={cell} hlRows={[i]} hlCols={[j]} onSelect={(r, c) => setCell([r, c])} shape="(3, 3)" ariaLabel="Score matrix S" />
      </>
    )
    const q = Q[i]
    const k = K[j]
    explain = (
      <>
        <b>
          S[{TOK[i]}, {TOK[j]}]
        </b>{' '}
        = query of "{TOK[i]}" · key of "{TOK[j]}" ={' '}
        <span className={s.calc}>
          {q.map((qv, d) => `${paren(qv)}×${paren(k[d])}`).join(' + ')} = {f(S[i][j])}
        </span>
        . Row "{TOK[i]}" of S holds its score against every key. Transposing K turns the keys into columns, so one matrix multiplication computes every
        query–key dot product at once. Tap any cell.
      </>
    )
    shapeLine = '(T, dₖ) @ (dₖ, T) → (T, T):  (3, 2) @ (2, 3) → (3, 3)'
  } else if (step === 2) {
    view = (
      <>
        <Mat {...common} name="S" data={S} rowLabels={TOK} colLabels={TOK} sel={cell} onSelect={(r, c) => setCell([r, c])} shape="(3, 3)" ariaLabel="Scores before scaling" />
        <span className={s.opSmall}>÷ √{dk} ≈ {root.toFixed(2)}</span>
        <Mat {...common} name="S / √dₖ" data={Ssc} rowLabels={TOK} colLabels={TOK} sel={cell} onSelect={(r, c) => setCell([r, c])} shape="(3, 3)" ariaLabel="Scaled scores" />
      </>
    )
    explain = (
      <>
        Every score is divided by <b>√d<sub>k</sub> = √{dk} ≈ {root.toFixed(3)}</b>:{' '}
        <span className={s.calc}>
          {f(S[i][j])} ÷ {root.toFixed(3)} = {f(Ssc[i][j])}
        </span>
        . With d<sub>k</sub> = 2 this hardly changes anything, but real models use d<sub>k</sub> = 64 or more, where it divides by 8 or more and keeps
        softmax from saturating. The shape does not change.
      </>
    )
    shapeLine = '(T, T) → (T, T):  (3, 3) → (3, 3)'
  } else if (step === 3) {
    const sums = A.map((r) => [r.reduce((a, b) => a + b, 0)])
    const ex = Ssc[i].map(Math.exp)
    const tot = ex.reduce((a, b) => a + b, 0)
    view = (
      <>
        <Mat {...common} name="S / √dₖ" data={Ssc} rowLabels={TOK} colLabels={TOK} sel={cell} hlRows={[i]} onSelect={(r, c) => setCell([r, c])} shape="(3, 3)" ariaLabel="Scaled scores" />
        <span className={s.opSmall}>softmax →</span>
        <Mat
          {...common}
          name="A (weights)"
          data={A}
          rowLabels={TOK}
          colLabels={TOK}
          sel={cell}
          hlRows={[i]}
          onSelect={(r, c) => setCell([r, c])}
          bg={(r, c) => heat(A[r][c])}
          fmt={(v) => v.toFixed(2)}
          shape="(3, 3)"
          ariaLabel="Attention weights A"
        />
        <Mat cellW={cw} cellH={ch} name="row sum" data={sums} colLabels={['Σ']} fmt={(v) => v.toFixed(2)} hlRows={[i]} shape="(3, 1)" ariaLabel="Row sums, all equal to 1" />
      </>
    )
    explain = (
      <>
        Softmax works <b>along each row</b> (<code>dim=-1</code>). Row "{TOK[i]}":{' '}
        <span className={s.calc}>
          e^ = {ex.map((v) => v.toFixed(2)).join(', ')}; total {tot.toFixed(2)}
        </span>
        , so{' '}
        <b>
          A[{TOK[i]}, {TOK[cell[1]]}]
        </b>{' '}
        ={' '}
        <span className={s.calc}>
          {ex[cell[1]].toFixed(2)} ÷ {tot.toFixed(2)} = {A[i][cell[1]].toFixed(3)}
        </span>
        . Every row adds up to 1: each token shares out exactly 100% of its attention among the keys.
      </>
    )
    shapeLine = '(T, T) → (T, T): each row now sums to 1'
  } else {
    view = (
      <>
        <Mat
          {...common}
          name="A"
          data={A}
          rowLabels={TOK}
          colLabels={TOK}
          hlRows={[oi]}
          onSelect={(r) => setOut([r, oc])}
          bg={(r, c) => heat(A[r][c])}
          fmt={(v) => v.toFixed(2)}
          shape="(3, 3)"
          ariaLabel="Attention weights A"
        />
        <span className={s.op}>×</span>
        <Mat {...common} name="V" data={V} rowLabels={TOK} hlCols={[oc]} onSelect={(_, c) => setOut([oi, c])} shape="(3, 2)" ariaLabel="Values V" />
        <span className={s.op}>=</span>
        <Mat {...common} name="output" data={O} rowLabels={TOK} sel={out} onSelect={(r, c) => setOut([r, c])} shape="(3, 2)" ariaLabel="Attention output" />
      </>
    )
    explain = (
      <>
        Output row "{TOK[oi]}" is a weighted average of the value rows, using row "{TOK[oi]}" of A as the weights. Column {oc + 1}:{' '}
        <span className={s.calc}>
          {A[oi].map((a, k) => `${a.toFixed(2)}×${paren(V[k][oc])}`).join(' + ')} = {f(O[oi][oc])}
        </span>
        . One output vector per token, as long as a value vector.
      </>
    )
    shapeLine = '(T, T) @ (T, dᵥ) → (T, dᵥ):  (3, 3) @ (3, 2) → (3, 2)'
  }

  return (
    <Figure
      wide
      title="Attention as matrices, one step at a time"
      caption={
        <>
          Press <b>Next</b> (or tap a stage) to build <M>{'\\operatorname{softmax}(QK^\\top/\\sqrt{d_k})\\,V'}</M> for three tokens. At each stage, tap
          or hover over any cell to see where its number comes from, and edit Q, K and V in the first stage. Notice the shapes: the scores are a T × T
          table (every query against every key), and the output has one row per token again. The whole thing is just two matrix multiplications with a
          row-wise softmax in between.
        </>
      }
    >
      <div className={s.pipe} role="group" aria-label="Stages">
        {STAGES.map((name, k) => (
          <span key={k} style={{ display: 'contents' }}>
            {k > 0 && <span className={s.pipeArrow}>→</span>}
            <button type="button" className={`${s.pipeChip} ${k === step ? s.pipeOn : k < step ? s.pipeDone : ''}`} onClick={() => player.setStep(k)} aria-pressed={k === step}>
              {name}
            </button>
          </span>
        ))}
      </div>
      <div className={s.matName} style={{ fontSize: 'var(--step-0)' }}>
        {step + 1}. {STEP_TITLES[step]}
      </div>
      <div ref={ref} className={s.eqRow}>
        {view}
      </div>
      <div className={s.matShape} style={{ fontSize: '0.82rem' }}>
        shapes: {shapeLine}
      </div>
      <div className={s.explain} aria-live="polite">
        {explain}
      </div>
      <Controls>
        <PlayerControls player={player} label={(k) => `Stage ${k + 1} of 5`} />
        <Button onClick={randomise}>New random Q, K, V</Button>
        <Button onClick={() => setMats(INIT)}>Reset numbers</Button>
      </Controls>
    </Figure>
  )
}
