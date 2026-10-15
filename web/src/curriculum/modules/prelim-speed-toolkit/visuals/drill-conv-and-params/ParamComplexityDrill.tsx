import { useEffect, useMemo, useRef, useState } from 'react'
import { Figure, Button, Bars, mulberry32, shuffled } from '../../../../../kit'
import { Stats, TimerBar, fmtInt, useCountdown } from '../drill-kit/ddKit'
import s from '../drill-kit/dd.module.css'

/*
  90-second mixed drill on the dozen formulas behind most deep-learning computation questions:
  parameter counts, Big-O costs and learning-rate schedule values. Four options each, like the
  Prelim; the distractors are the classic slips (no bias, forgot the output projection, ...).
  After the run, every miss is listed with the formula that answers it.
*/

type Cat = 'params' | 'bigo' | 'sched'
interface Item {
  cat: Cat
  prompt: string
  code?: string
  options: string[]
  answer: number
  why: string
}

const CAT_LABEL: Record<Cat, string> = { params: 'Parameters', bigo: 'Big-O', sched: 'Schedules' }
const RUN = 90
const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }

/** Learning rates and other small decimals, without float noise. */
function lr(v: number): string {
  if (v === 0) return '0'
  const t = Number(v.toPrecision(4))
  if (Math.abs(t) >= 1e-4) return String(t)
  const [m, e] = t.toExponential().split('e')
  return `${m}×10${e.replace('+', '').split('').map((c) => SUP[c] ?? c).join('')}`
}

type Gen = (r: () => number) => { prompt: string; code?: string; right: string; wrong: string[]; why: string }

const pickFrom = (r: () => number) => <T,>(xs: T[]) => xs[Math.floor(r() * xs.length)]

const PARAMS: Gen[] = [
  (r) => {
    const pick = pickFrom(r)
    const i = pick([4, 10, 20, 64, 100, 128, 256, 784])
    const o = pick([2, 3, 5, 10, 16, 32, 64, 128])
    return {
      prompt: 'How many parameters?',
      code: `nn.Linear(${i}, ${o})`,
      right: fmtInt(i * o + o),
      // when in = out, 'one bias per input' equals the answer and is dropped, so a fourth slip stands by
      wrong: [fmtInt(i * o), fmtInt(i * o + i), fmtInt((i + 1) * (o + 1)), fmtInt(i + o)],
      why: `Linear: in × out weights + out biases = ${fmtInt(i)} × ${o} + ${o} = ${fmtInt(i * o + o)}.`,
    }
  },
  (r) => {
    const pick = pickFrom(r)
    const i = pick([16, 32, 64, 128, 512])
    const o = pick([4, 8, 10, 16, 32])
    return {
      prompt: 'How many parameters?',
      code: `nn.Linear(${i}, ${o}, bias=False)`,
      right: fmtInt(i * o),
      wrong: [fmtInt(i * o + o), fmtInt(i + o), fmtInt(i * o + i), fmtInt(i * o + 1)],
      why: `bias=False leaves only the weight matrix: ${i} × ${o} = ${fmtInt(i * o)}.`,
    }
  },
  (r) => {
    const pick = pickFrom(r)
    const V = pick([1000, 5000, 10000, 30000, 50000])
    const d = pick([16, 64, 128, 300, 512])
    return {
      prompt: 'How many parameters?',
      code: `nn.Embedding(${V}, ${d})`,
      right: fmtInt(V * d),
      wrong: [fmtInt(V * d + d), fmtInt(V + d), fmtInt(V * d + V)],
      why: `An embedding is a lookup table with one row of ${d} numbers per token and no bias: ${fmtInt(V)} × ${d} = ${fmtInt(V * d)}.`,
    }
  },
  (r) => {
    const pick = pickFrom(r)
    const d = pick([8, 16, 32, 64, 128, 256, 512])
    const h = pick([2, 4, 8])
    return {
      prompt: 'How many parameters (biases on)?',
      code: `nn.MultiheadAttention(embed_dim=${d}, num_heads=${h})`,
      right: fmtInt(4 * d * d + 4 * d),
      wrong: [fmtInt(3 * d * d + 3 * d), fmtInt(4 * d * d), fmtInt(h * (4 * d * d + 4 * d))],
      why: `Four d × d projections (Q, K, V and output), each with d biases: 4d² + 4d = 4 × ${fmtInt(d * d)} + 4 × ${d} = ${fmtInt(4 * d * d + 4 * d)}. The heads split d between them, so h does not change the count.`,
    }
  },
  (r) => {
    const pick = pickFrom(r)
    const [d, k] = pick([
      [512, 512],
      [768, 768],
      [1024, 1024],
      [4096, 4096],
      [768, 3072],
    ])
    const rank = pick([4, 8, 16])
    return {
      prompt: `LoRA with rank r = ${rank} on one ${d} × ${k} weight matrix. How many trainable parameters?`,
      right: fmtInt(rank * (d + k)),
      // d·k / r equals the answer for 512 × 512 at r = 16, so 'only B' stands by
      wrong: [fmtInt(d * k), fmtInt(rank * d * k), fmtInt((d * k) / rank), fmtInt(rank * d)],
      why: `LoRA trains B (${d} × ${rank}) and A (${rank} × ${k}): r(d + k) = ${rank} × ${fmtInt(d + k)} = ${fmtInt(rank * (d + k))}, instead of all ${fmtInt(d * k)} entries of W.`,
    }
  },
  (r) => {
    const pick = pickFrom(r)
    const k = pick([1, 3, 3, 5])
    const ci = pick([3, 8, 16, 32])
    const co = pick([8, 16, 32, 64])
    const per = k * k * ci
    return {
      prompt: 'How many parameters?',
      code: `nn.Conv2d(${ci}, ${co}, kernel_size=${k})`,
      right: fmtInt((per + 1) * co),
      wrong: [fmtInt(per * co), fmtInt((k * k + 1) * co), fmtInt(per * co + ci), fmtInt(per * co + 1)],
      why: `(k·k·C_in + 1)·C_out = (${k}·${k}·${ci} + 1)·${co} = ${per + 1} × ${co} = ${fmtInt((per + 1) * co)}.`,
    }
  },
  (r) => {
    const pick = pickFrom(r)
    const d = pick([64, 128, 256, 512, 768])
    return {
      prompt: 'How many learnable parameters?',
      code: `nn.LayerNorm(${d})`,
      right: fmtInt(2 * d),
      wrong: [fmtInt(d), '0', fmtInt(d * d)],
      why: `LayerNorm learns a scale γ and a shift β for each of the ${d} features: 2 × ${d} = ${fmtInt(2 * d)}.`,
    }
  },
  (r) => {
    const pick = pickFrom(r)
    const c = pick([16, 32, 64, 128])
    return {
      prompt: 'How many learnable parameters?',
      code: `nn.BatchNorm2d(${c})`,
      right: fmtInt(2 * c),
      wrong: [fmtInt(4 * c), fmtInt(c), '0'],
      why: `γ and β per channel: 2 × ${c} = ${2 * c}. The running mean and variance are stored too, but they are buffers updated by averaging, not parameters learnt by gradient descent.`,
    }
  },
  (r) => {
    const pick = pickFrom(r)
    const learn = pick(['nn.LayerNorm(64)', 'nn.BatchNorm2d(32)', 'nn.Embedding(100, 8)', 'nn.Conv2d(3, 3, 1)'])
    return {
      prompt: 'Which layer has learnable parameters?',
      right: learn,
      wrong: ['nn.ReLU()', 'nn.MaxPool2d(2)', 'nn.Dropout(p=0.5)'],
      why: `${learn} learns weights. ReLU, max-pooling and dropout apply a fixed rule, so they have 0 parameters.`,
    }
  },
  (r) => {
    const pick = pickFrom(r)
    const i = pick([4, 10, 20, 784])
    const hdn = pick([8, 16, 32, 64, 128])
    const o = pick([2, 3, 10])
    const total = i * hdn + hdn + hdn * o + o
    return {
      prompt: 'How many parameters in total?',
      code: `nn.Sequential(nn.Linear(${i}, ${hdn}), nn.ReLU(), nn.Linear(${hdn}, ${o}))`,
      right: fmtInt(total),
      wrong: [fmtInt(i * hdn + hdn * o), fmtInt(i * hdn + hdn), fmtInt(total + hdn)],
      why: `(${i}·${hdn} + ${hdn}) + (${hdn}·${o} + ${o}) = ${fmtInt(i * hdn + hdn)} + ${fmtInt(hdn * o + o)} = ${fmtInt(total)}. ReLU adds nothing.`,
    }
  },
]

const BIGO: Gen[] = [
  () => ({
    prompt: 'Computing the attention scores QKᵀ for n tokens, each a vector of width d, costs',
    right: 'O(n²d)',
    wrong: ['O(nd)', 'O(nd²)', 'O(n³)'],
    why: 'QKᵀ is (n × d)(d × n): n² scores, each a dot product of length d, so O(n²d). Quadratic in sequence length.',
  }),
  (r) => {
    const m = pickFrom(r)([2, 3, 4])
    return {
      prompt: `The attention score matrix for 1,000 tokens takes 1 s. About how long for ${fmtInt(1000 * m)} tokens (same d)?`,
      right: `${m * m} s`,
      wrong: [`${m} s`, `${m * m * m} s`, `${2 * m + 1} s`],
      why: `O(n²): ${m}× the tokens means ${m}² = ${m * m}× the work.`,
    }
  },
  () => ({
    prompt: 'Multiplying an (n × m) matrix by an (m × p) matrix costs',
    right: 'O(nmp)',
    wrong: ['O(nm + mp)', 'O(np)', 'O(m³)'],
    why: 'The result has n·p entries, and each is a dot product of length m: O(nmp).',
  }),
  (r) => {
    const pick = pickFrom(r)
    const [n, m, p] = pick([
      [100, 200, 50],
      [10, 100, 1000],
      [20, 50, 10],
      [1000, 10, 100],
    ])
    return {
      prompt: `About how many multiplications does (${n} × ${m}) @ (${m} × ${p}) need?`,
      right: fmtInt(n * m * p),
      // m³ equals the answer when n·p = m², so 'only m × p' stands by
      wrong: [fmtInt(n * p), fmtInt(n * m + m * p), fmtInt(m * m * m), fmtInt(m * p)],
      why: `${n}·${p} entries × ${m} multiplications each = ${fmtInt(n * m * p)}.`,
    }
  },
  () => ({
    prompt: "Newton's method on a model with p parameters must invert (or solve with) the p × p Hessian. That step costs",
    right: 'O(p³)',
    wrong: ['O(p)', 'O(p²)', 'O(p log p)'],
    why: 'Inverting a p × p matrix is O(p³); just storing it is O(p²). Gradient descent needs only O(p) per step, which is why deep learning avoids Newton.',
  }),
  (r) => {
    const p = pickFrom(r)([1000, 10000, 100000])
    const e = Math.round(Math.log10(p))
    const sup = (k: number) => `10${String(k).split('').map((c) => SUP[c]).join('')}`
    return {
      prompt: `How many numbers does the Hessian of a ${fmtInt(p)}-parameter model hold?`,
      right: sup(2 * e),
      wrong: [sup(e), `2 × ${sup(e)}`, sup(3 * e)],
      why: `p × p = ${sup(e)} × ${sup(e)} = ${sup(2 * e)} second derivatives.`,
    }
  },
  () => ({
    prompt: 'Brute-force k-nearest-neighbours: predicting ONE query against n training points with d features costs',
    right: 'O(nd)',
    wrong: ['O(d)', 'O(n²d)', 'O(log n)'],
    why: 'One distance (O(d)) to each of the n stored points: O(nd) per query. kNN is fast to train and slow to predict.',
  }),
  (r) => {
    const pick = pickFrom(r)
    const [name, pow] = pick([
      ['O(n²)', 2],
      ['O(n³)', 3],
      ['O(n)', 1],
    ] as [string, number][])
    const t = pick([1, 2, 3])
    const right = t * 2 ** pow
    const cands = [t * 2, t * 4, t * 8, t * 16, t * 6].filter((v) => v !== right)
    return {
      prompt: `An ${name} algorithm takes ${t} s for n = 1,000. About how long for n = 2,000?`,
      right: `${right} s`,
      wrong: cands.slice(0, 3).map((v) => `${v} s`),
      why: `Doubling n multiplies ${name} work by 2${pow === 1 ? '' : SUP[String(pow)]} = ${2 ** pow}: ${t} × ${2 ** pow} = ${right} s.`,
    }
  },
  () => ({
    prompt: 'Binary search in a sorted list of 1,000,000 items needs about how many comparisons?',
    right: '20',
    wrong: ['1,000', '500,000', '1,000,000'],
    why: 'O(log₂ n): each comparison halves the list, and 2²⁰ ≈ 1,000,000, so about 20.',
  }),
]

const SCHED: Gen[] = [
  (r) => {
    const pick = pickFrom(r)
    const [mx, mn] = pick([
      [0.1, 0],
      [0.1, 0.02],
      [0.01, 0],
      [0.001, 0.0001],
      [0.004, 0],
    ])
    const T = pick([100, 50, 1000])
    const at = (t: number) => mn + 0.5 * (mx - mn) * (1 + Math.cos((Math.PI * t) / T))
    const which = pick(['mid', 'mid', 'end'])
    const t = which === 'mid' ? T / 2 : T
    const right = lr(at(t))
    const pool = [at(T / 4), at((3 * T) / 4), at(0), at(T), at(T / 2)].map(lr).filter((v, i, a) => v !== right && a.indexOf(v) === i)
    return {
      prompt: `Cosine schedule from η_max = ${lr(mx)} down to η_min = ${lr(mn)} over ${fmtInt(T)} epochs. What is the learning rate at epoch ${fmtInt(t)}?`,
      right,
      wrong: pool.slice(0, 3),
      why:
        which === 'mid'
          ? `Halfway, cos(π/2) = 0, so η = η_min + ½(η_max − η_min) = (η_max + η_min)/2 = ${right}.`
          : `At the end, cos(π) = −1, so η = η_min = ${right}.`,
    }
  },
  (r) => {
    const pick = pickFrom(r)
    const eta = pick([0.001, 0.0004, 0.1, 0.003, 0.0006])
    const W = pick([100, 500, 1000, 2000])
    const frac = pick([0.1, 0.25, 0.5, 0.75])
    const t = W * frac
    const right = lr(eta * frac)
    const pool = [eta, eta * (1 - frac) === eta * frac ? eta / 4 : eta * (1 - frac), eta / 2 === eta * frac ? eta / 10 : eta / 2, eta * frac * 10].map(lr).filter((v, i, a) => v !== right && a.indexOf(v) === i)
    return {
      prompt: `Linear warm-up from 0 to ${lr(eta)} over the first ${fmtInt(W)} steps. What is the learning rate at step ${fmtInt(t)}?`,
      right,
      wrong: pool.slice(0, 3),
      why: `η_t = η × t / W = ${lr(eta)} × ${fmtInt(t)}/${fmtInt(W)} = ${right}.`,
    }
  },
  (r) => {
    const pick = pickFrom(r)
    const eta = pick([0.1, 0.01, 0.2])
    const g = pick([0.1, 0.5])
    const every = pick([10, 30])
    const e = pick([every * 2 + 5, every * 3 - 1, every + 1, every * 3 + 4])
    const k = Math.floor(e / every)
    const right = lr(eta * g ** k)
    const pool = [eta * g ** (k + 1), eta * g ** Math.max(0, k - 1), eta * g * k, eta * g ** (k + 2)].map(lr).filter((v, i, a) => v !== right && a.indexOf(v) === i)
    return {
      prompt: `Step decay: start at ${lr(eta)} and multiply by ${g} after every ${every} epochs. What is the learning rate during epoch ${e}?`,
      right,
      wrong: pool.slice(0, 3),
      why: `⌊${e}/${every}⌋ = ${k} drops have happened: ${lr(eta)} × ${g}${k === 1 ? '' : SUP[String(k)] ?? `^${k}`} = ${right}.`,
    }
  },
]

const GENS: Record<Cat, Gen[]> = { params: PARAMS, bigo: BIGO, sched: SCHED }

function makeItem(seed: number, cats: Cat[]): Item {
  const r = mulberry32(seed)
  const cat = cats[Math.floor(r() * cats.length)]
  const gens = GENS[cat]
  const g = gens[Math.floor(r() * gens.length)](r)
  const wrong = g.wrong.filter((w, i, a) => w !== g.right && a.indexOf(w) === i).slice(0, 3)
  const opts = shuffled([g.right, ...wrong], r)
  return { cat, prompt: g.prompt, code: g.code, options: opts, answer: opts.indexOf(g.right), why: g.why }
}

interface Done {
  item: Item
  picked: number
}

export default function ParamComplexityDrill() {
  const [cats, setCats] = useState<Cat[]>(['params', 'bigo', 'sched'])
  const [run, setRun] = useState(0)
  const [qn, setQn] = useState(0)
  const [state, setState] = useState<'idle' | 'running' | 'done'>('idle')
  const [picked, setPicked] = useState<number | null>(null)
  const [log, setLog] = useState<Done[]>([])
  const startRef = useRef<HTMLDivElement>(null)

  // every question asked in this sprint, so none comes up twice in one round
  const seen = useRef(new Set<string>())
  const item = useMemo(() => {
    const base = 7907 * (run + 1) + 131 * qn + cats.length * 17 + (cats.includes('sched') ? 5 : 0)
    let it = makeItem(base, cats)
    for (let k = 1; k < 40 && seen.current.has(it.prompt + it.code); k++) it = makeItem(base + 1000 * k, cats)
    return it
  }, [run, qn, cats])
  useEffect(() => {
    seen.current.add(item.prompt + item.code)
  }, [item])

  const left = useCountdown(RUN, state === 'running', () => setState('done'), run)

  const start = () => {
    seen.current = new Set()
    setRun((x) => x + 1)
    setQn(0)
    setLog([])
    setPicked(null)
    setState('running')
  }

  const choose = (i: number) => {
    if (state !== 'running' || picked !== null) return
    setPicked(i)
    setLog((l) => [...l, { item, picked: i }])
  }

  useEffect(() => {
    if (picked === null) return
    const ok = picked === item.answer
    const id = window.setTimeout(
      () => {
        setPicked(null)
        setQn((x) => x + 1)
      },
      ok ? 450 : 1400,
    )
    return () => window.clearTimeout(id)
  }, [picked, item.answer])

  const toggle = (c: Cat) => {
    if (state === 'running') return
    setCats((cs) => (cs.includes(c) ? (cs.length > 1 ? cs.filter((x) => x !== c) : cs) : [...cs, c]))
  }

  const right = log.filter((d) => d.picked === d.item.answer).length
  const misses = log.filter((d) => d.picked !== d.item.answer)
  const perCat = (['params', 'bigo', 'sched'] as Cat[]).filter((c) => cats.includes(c) || log.some((d) => d.item.cat === c))
  const mono = !!item.options.find((o) => o.startsWith('nn.'))

  return (
    <Figure
      title="Parameters, Big-O and schedules: 90-second sprint"
      caption={
        <>
          Pick the right option as fast as you can; a wrong pick flashes the right one and moves on. When the clock stops, every miss is listed with its formula. The wrong options are the classic
          slips (no bias, a forgotten projection, multiplying instead of squaring), so a miss tells you exactly which formula to re-learn. Choose the topics with the chips.
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.spread}>
          <div className={s.chips} role="group" aria-label="Topics">
            {(['params', 'bigo', 'sched'] as Cat[]).map((c) => (
              <button key={c} type="button" className={`${s.chip} ${cats.includes(c) ? s.chipOn : ''}`} aria-pressed={cats.includes(c)} onClick={() => toggle(c)} disabled={state === 'running'}>
                {CAT_LABEL[c]}
              </button>
            ))}
          </div>
          <Stats items={[['right', `${right} / ${log.length}`]]} />
        </div>
        <div className={s.stage} ref={startRef}>
          <div className={s.spread}>
            <span className={s.label}>{state === 'done' ? 'Review' : `Question ${qn + 1} · ${CAT_LABEL[item.cat]}`}</span>
            <span className={`${s.small} tabular`}>{state === 'running' ? `${Math.ceil(left)} s left` : `${RUN} s`}</span>
          </div>
          <TimerBar left={state === 'running' ? left : state === 'done' ? 0 : RUN} limit={RUN} label="time left in the sprint" />
          {state !== 'done' && (
            <>
              <div className={s.prompt}>{item.prompt}</div>
              {item.code && <div className={`${s.code} ${s.codeWrap}`}>{item.code}</div>}
              <div className={`${s.options} ${mono || item.options.some((o) => o.length > 22) ? s.optionsOne : ''}`}>
                {item.options.map((o, i) => {
                  const cls =
                    picked === null ? '' : i === item.answer ? s.optRight : i === picked ? s.optWrong : s.optDim
                  return (
                    <button key={i} type="button" className={`${s.opt} ${mono ? s.optMono : ''} ${cls}`} disabled={state !== 'running' || picked !== null} onClick={() => choose(i)}>
                      {o}
                    </button>
                  )
                })}
              </div>
              {picked !== null && picked !== item.answer && (
                <div className={`${s.feedback} ${s.miss}`} aria-live="polite">
                  {item.why}
                </div>
              )}
            </>
          )}
          {state === 'done' && (
            <div className={s.wrap} aria-live="polite">
              <div className={s.prompt}>
                {right} right out of {log.length} in {RUN} s{log.length ? ` (${Math.round((100 * right) / log.length)}%)` : ''}.
              </div>
              {perCat.length > 1 && (
                <Bars
                  ariaLabel="Right answers by topic"
                  max={1}
                  format={(v) => `${Math.round(v * 100)}%`}
                  data={perCat.map((c, i) => {
                    const all = log.filter((d) => d.item.cat === c)
                    const ok = all.filter((d) => d.picked === d.item.answer).length
                    return { label: `${CAT_LABEL[c]} (${ok}/${all.length})`, value: all.length ? ok / all.length : 0, color: `var(--viz-${i + 1})` }
                  })}
                />
              )}
              {misses.length > 0 ? (
                <>
                  <div className={s.label}>Your misses, with the formula</div>
                  <ul className={s.review} style={{ paddingLeft: 0, marginLeft: 0 }}>
                    {misses.map((d, i) => (
                      <li key={i} className={s.reviewItem}>
                        <span>
                          {d.item.prompt} {d.item.code && <code>{d.item.code}</code>}
                        </span>
                        <span>
                          <span className={s.missText}>You: {d.item.options[d.picked]}</span> · <span className={s.okText}>Answer: {d.item.options[d.item.answer]}</span>
                        </span>
                        <span className={s.small}>{d.item.why}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                log.length > 0 && <div className={`${s.feedback} ${s.ok}`}>No misses. Try to beat {log.length} next time.</div>
              )}
            </div>
          )}
          <div className={s.row}>
            {state !== 'running' && (
              <Button primary onClick={start}>
                {state === 'done' ? 'Go again' : `Start the ${RUN} s sprint`}
              </Button>
            )}
            {state === 'running' && <Button onClick={() => setState('done')}>Stop and review</Button>}
          </div>
        </div>
      </div>
    </Figure>
  )
}
