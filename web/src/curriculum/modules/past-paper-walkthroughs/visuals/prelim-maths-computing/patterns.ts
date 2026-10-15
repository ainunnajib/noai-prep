/*
  The question templates of the 2026 Prelim's first two blocks (Q1–60 Mathematics, Q61–119 Computing).
  Every one of the 119 items is assigned to exactly one template. Text fields use a tiny markup:
  $…$ for maths (KaTeX) and `…` for code. Generators deal fresh variants for the 20-second drill.
*/
import { mulberry32, shuffled } from '../../../../../kit'

export type Domain = 'maths' | 'computing'
export type OptKind = 'math' | 'code' | 'text'

export interface Variant {
  prompt: string
  opts: string[]
  kind: OptKind
  answer: number
  why: string
}

export interface Template {
  id: string
  name: string
  group: string
  domain: Domain
  items: number[]
  stem: string
  method: string
  trap: string
  lessons: { href: string; label: string }[]
  gen?: (r: () => number) => Variant
}

const L = (m: string, l: string, label: string) => ({ href: `#/learn/${m}/${l}`, label })

// ---------- helpers ----------
const pick = <T,>(r: () => number, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)]
const int = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1))
export const fmt = (x: number) => String(Math.round(x * 1000) / 1000)

/** correct option + distractors (first 3 distinct ones are used), shuffled by r */
function pack(r: () => number, correct: string, wrong: string[]): { opts: string[]; answer: number } {
  const seen = new Set([correct])
  const ws: string[] = []
  for (const w of wrong) {
    if (seen.has(w)) continue
    seen.add(w)
    ws.push(w)
    if (ws.length === 3) break
  }
  const all = [correct, ...ws]
  const order = shuffled(
    all.map((_, i) => i),
    r,
  )
  return { opts: order.map((i) => all[i]), answer: order.indexOf(0) }
}

const sh = (a: number, b: number) => `${a}\\times ${b}`
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))
const frac = (p: number, q: number) => {
  if (p === 0) return '0'
  const g = gcd(p, q)
  const [a, b] = [p / g, q / g]
  return b === 1 ? String(a) : `\\tfrac{${a}}{${b}}`
}
const term = (c: number, body: string) => (c === 1 ? body : `${c}${body}`)
const powx = (n: number) => (n === 0 ? '' : n === 1 ? 'x' : `x^{${n}}`)

// ---------- generators ----------
const genShape = (r: () => number): Variant => {
  const m = int(r, 2, 6)
  const n = int(r, 2, 6)
  const p = int(r, 2, 6)
  if (r() < 0.25) {
    const n2 = n === 6 ? 5 : n + 1
    const o = pack(r, 'cannot multiply', [sh(m, n2), sh(n, n2), sh(m, n), sh(n2, m)])
    return { prompt: `A $${sh(m, n)}$ matrix times a $${sh(n2, p)}$ matrix gives:`, ...o, kind: 'math', why: `The inner sizes are ${n} and ${n2}. They must be equal, so the product does not exist.` }
  }
  const o = pack(r, sh(m, p), [sh(n, n), sh(m, n), sh(p, m), 'cannot multiply', sh(n, p), sh(m + 1, p), sh(m, p + 1), sh(n + 1, n + 1)])
  return { prompt: `A $${sh(m, n)}$ matrix times a $${sh(n, p)}$ matrix gives a matrix of shape:`, ...o, kind: 'math', why: `Inner ${n} = ${n} cancels; the outer sizes ${m} and ${p} survive: $${sh(m, p)}$.` }
}

const genTranspose = (r: () => number): Variant => {
  const m = int(r, 2, 7)
  let n = int(r, 2, 7)
  if (n === m) n = m + 1
  const o = pack(r, sh(n, m), [sh(m, n), sh(m, m), sh(n, n)])
  return { prompt: `$A$ is $${sh(m, n)}$. What is the shape of $A^\\top$?`, ...o, kind: 'math', why: `Transposing swaps rows and columns: $${sh(m, n)} \\to ${sh(n, m)}$.` }
}

const NORM_VECS: [number[], number][] = [
  [[3, 4], 5],
  [[6, 8], 10],
  [[5, 12], 13],
  [[8, 15], 17],
  [[1, 2, 2], 3],
  [[2, 3, 6], 7],
  [[2, 6, 9], 11],
  [[4, 4, 7], 9],
  [[9, 12], 15],
]
const genNorm = (r: () => number): Variant => {
  const [v, l2] = pick(r, NORM_VECS)
  const l1 = v.reduce((a, x) => a + x, 0)
  const sq = l2 * l2
  const mx = Math.max(...v)
  const o = pack(r, String(l2), [String(l1), String(sq), String(mx), String(l2 + 1)])
  return { prompt: `What is the L2 norm of $v = [${v.join(', ')}]$?`, ...o, kind: 'math', why: `$\\sqrt{${v.map((x) => `${x}^2`).join(' + ')}} = \\sqrt{${sq}} = ${l2}$. Adding the entries gives the L1 norm, ${l1}; ${sq} forgets the square root.` }
}

const genDot = (r: () => number): Variant => {
  const a = [int(r, -2, 5), int(r, 0, 5), int(r, 1, 5)]
  const b = [int(r, 1, 5), int(r, -2, 4), int(r, 1, 5)]
  const prods = a.map((x, i) => x * b[i])
  const dot = prods.reduce((s2, x) => s2 + x, 0)
  const sumAll = a.reduce((s2, x) => s2 + x, 0) + b.reduce((s2, x) => s2 + x, 0)
  const o = pack(r, String(dot), [String(sumAll), String(dot - prods[2]), String(dot + a[0] * b[1]), String(dot + 1), String(dot - 1), String(dot + 2), String(dot - 2)])
  return { prompt: `What is $[${a.join(', ')}] \\cdot [${b.join(', ')}]$?`, ...o, kind: 'math', why: `Multiply matching entries and add: ${prods.map((x) => (x < 0 ? `(${x})` : x)).join(' + ')} = ${dot}.` }
}

const genDet = (r: () => number): Variant => {
  if (r() < 0.5) {
    const [a, b, c, d] = [int(r, 1, 6), int(r, 0, 5), int(r, 0, 5), int(r, 1, 6)]
    const det = a * d - b * c
    const o = pack(r, String(det), [String(a * d + b * c), String(a * c - b * d), String(b * c - a * d), String(a * d), String(det + 1), String(det - 1), String(det + 2)])
    return { prompt: `What is $\\det\\begin{bmatrix}${a} & ${b}\\\\ ${c} & ${d}\\end{bmatrix}$?`, ...o, kind: 'math', why: `$ad - bc = ${a}\\times${d} - ${b}\\times${c} = ${det}$.` }
  }
  const ls = [int(r, -2, 4), int(r, 1, 4), int(r, -1, 3)]
  const prod = ls.reduce((a, x) => a * x, 1)
  const sum = ls.reduce((a, x) => a + x, 0)
  const o = pack(r, String(prod), [String(sum), String(Math.abs(prod) === prod ? -prod : Math.abs(prod)), String(prod + 1), String(prod - 1), String(prod + 2), String(prod - 2)])
  return {
    prompt: `A $3\\times3$ matrix has eigenvalues $${ls.join(', ')}$. What is its determinant?`,
    ...o,
    kind: 'math',
    why: `The determinant is the product of the eigenvalues: $${ls.map((x) => (x < 0 ? `(${x})` : x)).join('\\times')} = ${prod}$${prod === 0 ? ', so the matrix is singular' : ''}.${sum !== prod ? ` The sum, ${sum}, is the trace, not the determinant.` : ''}`,
  }
}

const genRank = (r: () => number): Variant => {
  const [m, n] = pick(r, [
    [100, 50],
    [8, 20],
    [30, 12],
    [5, 7],
    [64, 128],
    [1000, 3],
  ] as const)
  const o = pack(r, String(Math.min(m, n)), [String(Math.max(m, n)), String(m * n), String(m + n)])
  return { prompt: `What is the largest possible rank of a $${sh(m, n)}$ matrix?`, ...o, kind: 'math', why: `Rank can never exceed the smaller dimension: $\\min(${m}, ${n}) = ${Math.min(m, n)}$.` }
}

const genTrace = (r: () => number): Variant => {
  const A = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => int(r, 0, 9)))
  const tr = A[0][0] + A[1][1] + A[2][2]
  const all = A.flat().reduce((a, x) => a + x, 0)
  const prodD = A[0][0] * A[1][1] * A[2][2]
  const anti = A[0][2] + A[1][1] + A[2][0]
  const o = pack(r, String(tr), [String(all), String(prodD), String(anti), String(tr + 1), String(tr - 1), String(tr + 2)])
  const tex = A.map((row) => row.join(' & ')).join('\\\\ ')
  return { prompt: `What is the trace of $\\begin{bmatrix}${tex}\\end{bmatrix}$?`, ...o, kind: 'math', why: `Trace = sum of the main diagonal: ${A[0][0]} + ${A[1][1]} + ${A[2][2]} = ${tr}.` }
}

const DECOMP: [string, string, string[]][] = [
  ['In $A = U\\Sigma V^\\top$ (SVD), what is $\\Sigma$?', 'a diagonal matrix of singular values', ['an orthogonal matrix of eigenvectors', 'the covariance matrix', 'an upper-triangular matrix']],
  ['In $A = QR$, what is $R$?', 'an upper-triangular matrix', ['an orthogonal matrix', 'a diagonal matrix of eigenvalues', 'a symmetric matrix']],
  ['In PCA, the principal directions are the eigenvectors of which matrix?', 'the covariance matrix', ['the data matrix itself', 'the identity matrix', 'the Hessian of the loss']],
  ['If $Av = \\lambda v$ with $v \\neq 0$, what is $v$?', 'an eigenvector, scaled by $\\lambda$', ['an eigenvalue of $A$', 'a row of $A$', 'the inverse of $A$']],
]
const genDecomp = (r: () => number): Variant => {
  const [q, a, ws] = pick(r, DECOMP)
  const o = pack(r, a, ws)
  return { prompt: q, ...o, kind: 'text', why: `Recall item: ${a.replace(/^an? /, '')}.` }
}

const genDeriv = (r: () => number): Variant => {
  const a = int(r, 2, 6)
  const n = int(r, 2, 5)
  const b = int(r, 1, 9)
  const ans = `${a * n}${powx(n - 1)}`
  const o = pack(r, ans, [`${a}${powx(n - 1)}`, `${a * n}${powx(n)}`, `${a * n}${powx(n - 1)} + ${b}`, `${n}${powx(n - 1)}`])
  return { prompt: `What is $\\dfrac{d}{dx}\\left(${a}x^{${n}} + ${b}\\right)$?`, ...o, kind: 'math', why: `Power rule: bring the ${n} down and lower the power by one, $${a}\\times${n}\\,${powx(n - 1)}$; the constant ${b} has slope 0.` }
}

const genPartial = (r: () => number): Variant => {
  const a = int(r, 1, 4)
  const b = int(r, 1, 6)
  const ans = `${term(2 * a, 'xy')} + ${b}`
  const o = pack(r, ans, [`${term(a, 'x^2')} + ${b}`, term(2 * a, 'xy'), `${term(2 * a, 'x')} + ${b}`, `${term(a, 'x^2y')} + ${b}`])
  return { prompt: `What is $\\dfrac{\\partial}{\\partial x}\\left(${term(a, 'x^2y')} + ${term(b, 'x')}\\right)$?`, ...o, kind: 'math', why: `Treat $y$ as a constant: $${term(a, 'x^2')}$ → $${term(2 * a, 'x')}$, times $y$; and $${term(b, 'x')}$ → ${b}.` }
}

const genChain = (r: () => number): Variant => {
  const w = int(r, 1, 3)
  const x = int(r, 1, 3)
  let y = int(r, 0, 6)
  if (y === w * x) y += 2
  const yh = w * x
  const g = 2 * (yh - y) * x
  const o = pack(r, String(g), [String(2 * (yh - y)), String((yh - y) * x), String(2 * w), String(g + x), String(-g), String(g - x), String(g + 1), String(g - 1)])
  return {
    prompt: `$L = (\\hat y - y)^2$ with $\\hat y = wx$. If $w = ${w}$, $x = ${x}$ and $y = ${y}$, what is $\\partial L/\\partial w$?`,
    ...o,
    kind: 'math',
    why: `$\\hat y = ${yh}$. Chain rule: $2(\\hat y - y)\\cdot x = 2(${yh - y})(${x}) = ${g}$. Forgetting the inner factor $x$ gives ${2 * (yh - y)}.`,
  }
}

const genSigmoid = (r: () => number): Variant => {
  const p = pick(r, [0.5, 0.2, 0.8, 0.9, 0.1, 0.6, 0.4, 0.7, 0.3])
  const d = p * (1 - p)
  const o = pack(r, fmt(d), [fmt(p), fmt(1 - p), fmt(p * p), fmt(p * (1 + p)), '1'])
  return { prompt: `At some input, $\\sigma(x) = ${p}$. What is the slope $\\sigma'(x)$ there?`, ...o, kind: 'math', why: `$\\sigma' = \\sigma(1-\\sigma) = ${p}\\times${fmt(1 - p)} = ${fmt(d)}$. It can never exceed 0.25.` }
}

const genHessian = (r: () => number): Variant => {
  const k = int(r, 2, 5)
  const o = pack(r, `10^{${2 * k}}`, [`10^{${k}}`, `2\\times10^{${k}}`, `10^{${3 * k}}`])
  return { prompt: `A model has $10^{${k}}$ parameters. How many entries does its Hessian have?`, ...o, kind: 'math', why: `The Hessian is $n \\times n$: $(10^{${k}})^2 = 10^{${2 * k}}$ entries. Inverting it costs about $n^3 = 10^{${3 * k}}$ operations.` }
}

const genGD = (r: () => number): Variant => {
  const w = int(r, 1, 6)
  const lr = pick(r, [0.1, 0.5, 0.25])
  const g = lr === 0.25 ? pick(r, [-4, 4, 8, -8]) : lr === 0.5 ? pick(r, [-4, -2, 2, 4, 6]) : pick(r, [-3, -2, 2, 3, 5])
  const nw = w - lr * g
  const o = pack(r, fmt(nw), [fmt(w + lr * g), fmt(w - g), fmt(lr * g), fmt(nw + 1), fmt(nw - 1)])
  return { prompt: `Gradient descent: $w = ${w}$, gradient $= ${g}$, learning rate $= ${lr}$. What is the new $w$?`, ...o, kind: 'math', why: `$w - \\eta g = ${w} - ${lr}\\times(${g}) = ${fmt(nw)}$. Step against the gradient.` }
}

const genDesc = (r: () => number): Variant => {
  const xs = Array.from({ length: 5 }, () => int(r, 1, 15))
  const sum0 = xs.reduce((a, x) => a + x, 0)
  xs[4] += (5 - (sum0 % 5)) % 5
  const sum = xs.reduce((a, x) => a + x, 0)
  const mean = sum / 5
  const sorted = [...xs].sort((a, b) => a - b)
  const median = sorted[2]
  const range = sorted[4] - sorted[0]
  if (r() < 0.5) {
    const o = pack(r, String(mean), [String(median), fmt(sum / 4), String(range), String(mean + 1), String(sum), String(mean - 1), String(mean + 2)])
    return { prompt: `What is the mean of $[${xs.join(', ')}]$?`, ...o, kind: 'math', why: `Sum ÷ count = ${sum} ÷ 5 = ${mean}.` }
  }
  const o = pack(r, String(median), [String(xs[2]), fmt(mean), String(range), String(sorted[1]), String(sorted[3]), String(median + 1), String(median - 1), String(median + 2)])
  return { prompt: `What is the median of $[${xs.join(', ')}]$?`, ...o, kind: 'math', why: `Sort first: [${sorted.join(', ')}]. The middle value is ${median}.` }
}

const genZ = (r: () => number): Variant => {
  const mu = pick(r, [10, 20, 50, 60, 70, 100])
  const sd = pick(r, [2, 4, 5, 10])
  const z = pick(r, [-2, -1.5, -1, 1, 1.5, 2, 3])
  const x = mu + z * sd
  const o = pack(r, fmt(z), [fmt(x - mu), fmt((x - mu) / (sd * sd)), fmt(x / sd), fmt(-z)])
  return { prompt: `Mean $= ${mu}$, standard deviation $= ${sd}$. What is the z-score of $x = ${x}$?`, ...o, kind: 'math', why: `$z = (x-\\mu)/\\sigma = (${x} - ${mu})/${sd} = ${fmt(z)}$.` }
}

const genProb = (r: () => number): Variant => {
  const k = int(r, 2, 6)
  const ans = frac(7 - k, 6)
  const o = pack(r, ans, [frac(6 - k, 6), frac(k, 6), '\\tfrac{1}{6}', frac(k - 1, 6), '\\tfrac{1}{2}'])
  return { prompt: `A fair six-sided die is rolled. What is $P(\\text{roll} \\ge ${k})$?`, ...o, kind: 'math', why: `Count the faces ${k} to 6: there are ${7 - k} of them, so $${7 - k}/6 = ${ans}$. “At least ${k}” includes ${k} itself.` }
}

const genMetric = (r: () => number): Variant => {
  const tp = int(r, 2, 9)
  const fp = int(r, 1, 6)
  let fn = int(r, 1, 6)
  if (fn === fp) fn = fp + 1
  const askP = r() < 0.5
  const ans = askP ? frac(tp, tp + fp) : frac(tp, tp + fn)
  const other = askP ? frac(tp, tp + fn) : frac(tp, tp + fp)
  const o = pack(r, ans, [other, frac(tp, tp + fp + fn), frac(askP ? fp : fn, tp + (askP ? fp : fn)), '\\tfrac{1}{2}', frac(tp, fp + fn), frac(tp + 1, tp + fp + fn + 1)])
  return {
    prompt: `TP = ${tp}, FP = ${fp}, FN = ${fn}. What is the ${askP ? 'precision' : 'recall'}?`,
    ...o,
    kind: 'math',
    why: askP ? `Precision = TP/(TP+FP) = ${tp}/${tp + fp}: of everything flagged, how much was real.` : `Recall = TP/(TP+FN) = ${tp}/${tp + fn}: of everything real, how much was caught.`,
  }
}

const WORDS = ['Merlion', 'kopi-o', 'Hello', 'NOAI', 'durian', 'hawker', 'Changi']
const genPyOut = (r: () => number): Variant => {
  const kind = int(r, 0, 3)
  if (kind === 0) {
    const k = int(r, 3, 5)
    const sq = Array.from({ length: k }, (_, i) => i * i)
    const o = pack(r, `[${sq.join(', ')}]`, [`[${Array.from({ length: k }, (_, i) => (i + 1) * (i + 1)).join(', ')}]`, `[${Array.from({ length: k }, (_, i) => i).join(', ')}]`, `[${Array.from({ length: k }, (_, i) => 2 * i).join(', ')}]`])
    return { prompt: `What is \`[x**2 for x in range(${k})]\`?`, ...o, kind: 'code', why: `range(${k}) is 0 to ${k - 1}; square each one.` }
  }
  if (kind === 1) {
    const w = pick(r, WORDS)
    const o = pack(r, String(w.length), [String(w.length - 1), String(w.length + 1), 'Error'])
    return { prompt: `What does \`len("${w}")\` return?`, ...o, kind: 'code', why: `len counts every character${w.includes('-') ? ', the hyphen too' : ''}: ${w.length}.` }
  }
  if (kind === 2) {
    const a = int(r, 0, 3)
    const b = a + int(r, 3, 5)
    const rng = (lo: number, hi: number) => `[${Array.from({ length: hi - lo }, (_, i) => lo + i).join(', ')}]`
    const o = pack(r, rng(a, b), [rng(a, b + 1), rng(a + 1, b + 1), rng(0, b), rng(a + 1, b)])
    return { prompt: `What is \`list(range(${a}, ${b}))\`?`, ...o, kind: 'code', why: `range stops just before the end value ${b}.` }
  }
  const [x, y] = [int(r, 1, 4), int(r, 5, 9)]
  const o = pack(r, `[${x}, ${y}, ${x}, ${y}]`, [`[${2 * x}, ${2 * y}]`, `[[${x}, ${y}], [${x}, ${y}]]`, 'Error'])
  return { prompt: `What is \`[${x}, ${y}] * 2\`?`, ...o, kind: 'code', why: `On a list, * repeats it (a NumPy array would double each entry).` }
}

const genPySem = (r: () => number): Variant => {
  const mut = pick(r, ['list', 'dict', 'set'])
  const ws = shuffled(['tuple', 'str', 'int', 'float', 'frozenset'], r).slice(0, 3)
  const o = pack(r, mut, ws)
  return { prompt: 'Which of these Python types is mutable?', ...o, kind: 'code', why: `${mut} can be changed in place; tuple, str, int, float and frozenset cannot.` }
}

const genArange = (r: () => number): Variant => {
  const a = int(r, 0, 3)
  const s2 = int(r, 2, 4)
  const k = int(r, 3, 5)
  const b = a + s2 * k
  const seq = (lo: number, hi: number, st: number) => {
    const out: number[] = []
    for (let v = lo; v < hi; v += st) out.push(v)
    return out
  }
  const ans = seq(a, b, s2)
  const o = pack(r, `[${ans.join(', ')}]`, [`[${[...ans, b].join(', ')}]`, `[${ans.map((v) => v + s2).join(', ')}]`, `[${seq(a, Math.min(b, a + 6), 1).join(', ')}]`])
  return { prompt: `What does \`np.arange(${a}, ${b}, ${s2})\` produce?`, ...o, kind: 'code', why: `Start at ${a}, step ${s2}, stop before ${b}.` }
}

const genBroadcast = (r: () => number): Variant => {
  const m = int(r, 2, 5)
  let n = int(r, 2, 5)
  if (n === m) n = m + 1
  const v = int(r, 0, 2)
  const t = (a: number, b?: number) => (b == null ? `(${a},)` : `(${a}, ${b})`)
  if (v === 0) {
    const o = pack(r, t(m, n), [t(m, 1), t(1, n), 'Error', t(n, m)])
    return { prompt: `Shapes \`${t(m, 1)}\` + \`${t(1, n)}\` broadcast to:`, ...o, kind: 'code', why: `Each size-1 axis stretches to match the other: ${t(m, n)}.` }
  }
  if (v === 1) {
    const o = pack(r, t(m, n), ['Error', t(n), t(m, n * 2)])
    return { prompt: `Shapes \`${t(m, n)}\` + \`${t(n)}\` broadcast to:`, ...o, kind: 'code', why: `The 1-D shape lines up with the LAST axis (${n} = ${n}), so it is copied along the rows: ${t(m, n)}.` }
  }
  const o = pack(r, 'Error', [t(m, n), t(m), t(n, m)])
  return { prompt: `Shapes \`${t(m, n)}\` + \`${t(m)}\` broadcast to:`, ...o, kind: 'code', why: `Trailing axes are compared: ${n} vs ${m} differ and neither is 1, so NumPy raises an error.` }
}

const COLS = ['total price', 'unit price', 'final score', 'bus stop', 'postal code']
const genPandas = (r: () => number): Variant => {
  const c = pick(r, COLS)
  const o = pack(r, `df['${c}']`, [`df.${c}`, `df('${c}')`, `df.loc['${c}']`])
  return { prompt: `Which of these selects the column '${c}' (it has a space)?`, ...o, kind: 'code', why: `Square brackets take any column name. .loc['${c}'] looks for a ROW label; df(...) is a call; dot access breaks on the space.` }
}

const API: [string, string][] = [
  ['loss.backward()', 'computes gradients of the loss for every parameter'],
  ['optimiser.step()', 'updates the weights using the stored gradients'],
  ['optimiser.zero_grad()', 'resets the stored gradients to zero'],
  ['torch.no_grad()', 'switches off gradient tracking, e.g. for inference'],
  ['model.eval()', 'switches dropout and BatchNorm to evaluation behaviour'],
  ["x.to('cuda')", 'moves the tensor to the GPU'],
  ['x.item()', 'turns a one-element tensor into a Python number'],
  ['x.detach()', 'returns a tensor cut off from the computation graph'],
  ['requires_grad=True', 'tells autograd to track operations on this tensor'],
]
const genTorch = (r: () => number): Variant => {
  const i = int(r, 0, API.length - 1)
  const others = shuffled(
    API.filter((_, j) => j !== i).map((x) => x[1]),
    r,
  )
  const o = pack(r, API[i][1], others)
  return { prompt: `What does \`${API[i][0]}\` do?`, ...o, kind: 'text', why: `${API[i][0]} ${API[i][1]}.` }
}

const genAccum = (r: () => number): Variant => {
  const k = int(r, 2, 4)
  const g = pick(r, [0.5, 1, 2, 3])
  const o = pack(r, fmt(k * g), [fmt(g), '0', 'an error', fmt(g * g)])
  return { prompt: `Each training step’s own gradient for $w$ is ${g}. After ${k} steps of \`loss.backward()\` with no \`zero_grad()\`, what is \`w.grad\`?`, ...o, kind: 'text', why: `backward() adds into .grad: ${k} × ${g} = ${fmt(k * g)}.` }
}

// ---------- the 26 templates ----------
export const TEMPLATES: Template[] = [
  { id: 'shape', name: 'Shape of a product', group: 'Linear algebra', domain: 'maths', items: [1, 3, 9], stem: 'Q1: What is the result of multiplying a 3×2 matrix by a 2×4 matrix?', method: '$(m\\times n)(n\\times p) \\to m\\times p$: check the inner pair, keep the outer pair.', trap: 'Comparing the outer numbers, or answering with the inner pair. Matrix “division” (Q3) is not an operation at all.', lessons: [L('vectors-and-matrices', 'matrices-and-multiplication', 'Matrices and multiplication')], gen: genShape },
  { id: 'transpose', name: 'Transpose and symmetry', group: 'Linear algebra', domain: 'maths', items: [5, 7], stem: 'Q5: If matrix A is 2×3, what is the shape of Aᵀ?', method: 'Transpose swaps rows and columns: $m\\times n \\to n\\times m$. Symmetric means $A = A^\\top$: entry $(i, j)$ equals entry $(j, i)$.', trap: 'Leaving the shape unchanged; comparing rows with rows instead of mirroring across the diagonal.', lessons: [L('vectors-and-matrices', 'matrices-and-multiplication', 'Matrices and multiplication')], gen: genTranspose },
  { id: 'norms', name: 'Norms', group: 'Linear algebra', domain: 'maths', items: [2, 22], stem: 'Q2: Given vector v = [3, 4], what is its L2 norm?', method: 'L2 $= \\sqrt{\\text{sum of squares}}$; know the triples 3-4-5, 5-12-13, 8-15-17. The Frobenius norm does the same over every entry of a matrix.', trap: '7 is the L1 norm (just add); 25 forgets the square root.', lessons: [L('vectors-and-matrices', 'dot-product-and-norms', 'Dot product and norms')], gen: genNorm },
  { id: 'dot', name: 'Dot product', group: 'Linear algebra', domain: 'maths', items: [6], stem: 'Q6: What is the dot product of [1, 2, 3] and [4, 5, 6]?', method: 'Multiply matching entries, then add: $4 + 10 + 18 = 32$.', trap: 'Adding all six numbers (21), or dropping one of the products.', lessons: [L('vectors-and-matrices', 'dot-product-and-norms', 'Dot product and norms')], gen: genDot },
  { id: 'det', name: 'Determinant, inverse, singular', group: 'Linear algebra', domain: 'maths', items: [8, 11, 15], stem: 'Q15: If matrix A has eigenvalues [4, 2, 0], what can you conclude?', method: '$2\\times2$: $ad - bc$. $\\det$ = product of eigenvalues. $\\det = 0$ ⇔ singular (no inverse).', trap: 'Calling a matrix invertible when one eigenvalue is 0.', lessons: [L('vectors-and-matrices', 'identity-inverse-determinant', 'Identity, inverse and determinant'), L('linear-algebra-deeper', 'eigenvectors-eigenvalues', 'Eigenvectors and eigenvalues')], gen: genDet },
  { id: 'rank', name: 'Rank', group: 'Linear algebra', domain: 'maths', items: [10, 19, 23], stem: 'Q19: If A is a 100×50 matrix, what is the maximum possible rank?', method: 'rank ≤ min(rows, columns). The zero matrix has rank 0. $(A^\\top A)^{-1}A^\\top$ needs full column rank.', trap: 'Taking the larger dimension, or the product 100 × 50.', lessons: [L('linear-algebra-deeper', 'span-rank-independence', 'Span, independence and rank')], gen: genRank },
  { id: 'vocab', name: 'Matrix vocabulary', group: 'Linear algebra', domain: 'maths', items: [4, 16, 18, 21, 24], stem: 'Q16: What is the trace of a matrix?', method: 'Identity: 1s on the diagonal, 0s elsewhere. Trace: sum of the diagonal. Positive definite: all eigenvalues > 0. Condition number: how much the output can swing for a small change in the input.', trap: '“Sum of all elements” for the trace; “all elements > 0” for positive definite.', lessons: [L('vectors-and-matrices', 'identity-inverse-determinant', 'Identity, inverse and determinant')], gen: genTrace },
  { id: 'decomp', name: 'Eigen, PCA, SVD, QR', group: 'Linear algebra', domain: 'maths', items: [12, 13, 14, 17, 20, 25], stem: 'Q12: In eigenvalue decomposition, what does Av = λv represent?', method: '$Av = \\lambda v$: $v$ keeps its direction and is scaled by $\\lambda$. PCA directions are eigenvectors of the covariance matrix. SVD’s $\\Sigma$ holds singular values; QR’s $Q$ is orthogonal, $R$ upper triangular.', trap: 'Swapping roles (λ as the vector), or choosing a side effect over the definition.', lessons: [L('linear-algebra-deeper', 'eigenvectors-eigenvalues', 'Eigenvectors and eigenvalues'), L('linear-algebra-deeper', 'covariance-and-pca', 'Covariance and PCA'), L('linear-algebra-deeper', 'svd-and-special-matrices', 'SVD and special matrices')], gen: genDecomp },
  { id: 'deriv', name: 'Derivative rules', group: 'Calculus', domain: 'maths', items: [26, 27, 31, 32], stem: 'Q32: What is the second derivative of f(x) = x³?', method: 'Power rule: $x^n \\to n x^{n-1}$; constants vanish; $(e^x)\' = e^x$. Second derivative: apply the rule twice.', trap: 'Stopping after one derivative ($3x^2$), or keeping the constant.', lessons: [L('calculus-and-gradient-descent', 'derivative-rules', 'Derivative rules')], gen: genDeriv },
  { id: 'partial', name: 'Partial derivatives and gradients', group: 'Calculus', domain: 'maths', items: [29, 30, 42], stem: 'Q29: What is ∂/∂x of f(x,y) = x²y + 3x?', method: 'Freeze every other variable as a constant, then differentiate. The gradient is the vector of all the partials.', trap: 'Differentiating $y$ as well; writing the gradient as a sum $2x + 2y$ instead of the vector $[2x, 2y]$.', lessons: [L('calculus-and-gradient-descent', 'partial-derivatives-gradients', 'Partial derivatives and the gradient')], gen: genPartial },
  { id: 'chain', name: 'Chain rule and backprop', group: 'Calculus', domain: 'maths', items: [28, 35, 43], stem: 'Q35: If L = (ŷ − y)² and ŷ = wx, what is ∂L/∂w?', method: 'Outer derivative (at the inside) × inner derivative: $\\partial L/\\partial w = 2(\\hat y - y)\\cdot x$.', trap: 'Forgetting the inner factor $x$; writing $f\'(x)g\'(x)$ instead of $f\'(g(x))g\'(x)$.', lessons: [L('calculus-and-gradient-descent', 'chain-rule', 'The chain rule'), L('backpropagation', 'backprop-step-by-step', 'Backprop step by step')], gen: genChain },
  { id: 'activ', name: 'Activation derivatives', group: 'Calculus', domain: 'maths', items: [34, 36, 44], stem: 'Q34: What is ∂/∂x of sigmoid σ(x) = 1/(1+e^(−x))?', method: '$\\sigma\' = \\sigma(1-\\sigma) \\le \\tfrac14$; ReLU’s slope is 0 or 1 (undefined at 0). Many factors $\\le \\tfrac14$ multiplied together → vanishing gradients.', trap: '$\\sigma\' = \\sigma$, which is the rule for $e^x$.', lessons: [L('neural-networks', 'activation-functions', 'Activation functions'), L('backpropagation', 'vanishing-and-exploding-gradients', 'Vanishing and exploding gradients')], gen: genSigmoid },
  { id: 'hessian', name: 'Hessian and Newton', group: 'Optimisation', domain: 'maths', items: [37, 38, 39, 45, 74], stem: 'Q45: Why is Newton’s method rarely used in deep learning?', method: 'Hessian = all second derivatives ($n\\times n$). Positive definite at a critical point → local minimum. Newton needs $H^{-1}$: $n^2$ memory and about $n^3$ time.', trap: 'Blaming the forward pass or backprop, which every optimiser pays for.', lessons: [L('calculus-and-gradient-descent', 'curvature-convexity', 'Curvature and the Hessian'), L('ml-systems-and-tradeoffs', 'cost-of-ml', 'The cost of ML operations')], gen: genHessian },
  { id: 'optim', name: 'Gradient descent and optimisers', group: 'Optimisation', domain: 'maths', items: [33, 40, 41, 66, 67, 68, 69, 70, 71, 75], stem: 'Q71: Adam optimiser combines:', method: 'Step $= -\\eta \\times$ gradient. Batch GD uses all the data, SGD one sample, mini-batch something in between. Momentum averages past gradients; Adam = momentum + RMSProp.', trap: 'Mixing up batch and mini-batch; “Adam = SGD + batch GD”.', lessons: [L('calculus-and-gradient-descent', 'gradient-descent', 'Gradient descent'), L('training-deep-networks', 'momentum-and-adam', 'Momentum, RMSProp and Adam')], gen: genGD },
  { id: 'sched', name: 'Learning-rate schedule scenarios', group: 'Optimisation', domain: 'computing', items: [72, 73], stem: 'Q72: BERT-base from scratch with AdamW diverges early without warm-up. Why does warm-up help?', method: 'At the start the weights are random and Adam’s running averages are not settled yet, so big steps blow up. Warm-up keeps steps small until they settle; a decay (cosine) fine-tunes at the end.', trap: 'Long, technical-sounding options that describe a different mechanism (batch size, gradient clipping).', lessons: [L('training-deep-networks', 'learning-rate-warmup-schedules', 'Learning-rate schedules and warm-up')] },
  { id: 'desc', name: 'Descriptive statistics', group: 'Probability and statistics', domain: 'maths', items: [46, 47, 48, 53, 58], stem: 'Q58: In a right-skewed distribution, which is typically largest?', method: 'Mean = sum ÷ n; median = middle value after sorting; constant data has variance 0; SD $= \\sqrt{\\text{variance}}$; a right skew drags the mean past the median.', trap: 'SD as the square of the variance; taking the median of an unsorted list.', lessons: [L('probability-and-statistics', 'describing-data', 'Describing data')], gen: genDesc },
  { id: 'z', name: 'z-scores and the normal curve', group: 'Probability and statistics', domain: 'maths', items: [50, 54, 59], stem: 'Q54: A dataset has mean = 10, std = 2. What is the z-score of x = 14?', method: '$z = (x-\\mu)/\\sigma$. 68–95–99.7% lie within 1, 2, 3 SDs. Sample means are roughly normal for large $n$ (CLT).', trap: 'Skipping a step: 4 (no divide), 7 (no subtract), 1 (divided by the variance).', lessons: [L('probability-and-statistics', 'distributions-and-clt', 'Distributions and the CLT')], gen: genZ },
  { id: 'prob', name: 'Probability, Bayes and inference', group: 'Probability and statistics', domain: 'maths', items: [49, 51, 52, 60, 62, 63, 64, 65], stem: 'Q51: Two events A and B are independent if:', method: 'Count outcomes. Independent ⇔ $P(A\\cap B) = P(A)P(B)$. Bayes turns $P(B|A)$ into $P(A|B)$. Type I error = false positive. p-value = the chance of data at least this extreme if $H_0$ is true.', trap: 'Confusing independent with mutually exclusive; reading p = 0.03 as “97% confidence”.', lessons: [L('probability-and-statistics', 'probability-rules', 'Probability rules'), L('probability-and-statistics', 'bayes-theorem', 'Bayes’ theorem')], gen: genProb },
  { id: 'metrics', name: 'Metric and loss formulas', group: 'Probability and statistics', domain: 'maths', items: [55, 56, 57, 61], stem: 'Q55: In a confusion matrix, precision is defined as:', method: 'Precision = TP/(TP+FP): “of the ones I flagged”. Recall = TP/(TP+FN): “of the real ones”. F1 = their harmonic mean. Binary cross-entropy $= -[y\\log\\hat y + (1-y)\\log(1-\\hat y)]$.', trap: 'Swapping FP and FN (precision ↔ recall); F1 as the ordinary average.', lessons: [L('model-evaluation', 'confusion-matrix-and-metrics', 'Confusion matrix and metrics')], gen: genMetric },
  { id: 'pyout', name: 'Python output prediction', group: 'Python', domain: 'computing', items: [76, 78, 80, 81, 82, 86, 88], stem: 'Q82: What is the list comprehension [x**2 for x in range(3)]?', method: 'Run it in your head: `range(n)` is 0 to n − 1; `+` on lists joins them; `len` counts characters; `zip` pairs items up.', trap: 'A range that includes its end; `+` adding element by element as if the lists were NumPy arrays.', lessons: [L('python-basics', 'lists', 'Lists'), L('python-toolkit', 'iteration-tools', 'Comprehensions, zip and generators')], gen: genPyOut },
  { id: 'pysem', name: 'Python semantics', group: 'Python', domain: 'computing', items: [77, 79, 83, 84, 85, 87, 89, 90], stem: 'Q84: What is the difference between `is` and `==`?', method: 'Lists, dicts and sets are mutable; tuples, strings and numbers are not. `{}` is an empty dict. `is` = same object, `==` = same value. `*args` = extra positional arguments; generators `yield` lazily.', trap: '`{}` as an empty set; thinking a function receives a copy of a list.', lessons: [L('python-toolkit', 'references-mutability', 'Names, references and surprises'), L('python-toolkit', 'dicts-tuples-sets', 'Dicts, tuples and sets')], gen: genPySem },
  { id: 'npshape', name: 'NumPy creation, shape, indexing', group: 'NumPy', domain: 'computing', items: [91, 92, 94, 95, 97, 103], stem: 'Q94: What does np.arange(0, 10, 2) produce?', method: '`np.arange(start, stop, step)` stops before `stop`. `np.zeros((r, c)).shape == (r, c)`. `arr[0]` is the first row; `arr[:, 0]` the first column.', trap: 'Including the stop value; mixing up row and column indexing.', lessons: [L('numpy', 'arrays-and-shapes', 'Arrays, shape and dtype'), L('numpy', 'indexing-and-masks', 'Indexing, slicing and masks')], gen: genArange },
  { id: 'npops', name: 'NumPy operations and speed', group: 'NumPy', domain: 'computing', items: [93, 96, 98, 102, 104, 105], stem: 'Q102: What is the difference between np.dot() and * for arrays?', method: '`*` is element-wise; `@` or `np.dot` is matrix multiplication. Broadcasting stretches size-1 axes. NumPy is fast because of contiguous memory, C loops and vectorisation.', trap: '`*` as matrix multiplication; “NumPy uses the GPU automatically”.', lessons: [L('numpy', 'vectorised-ops-and-axes', 'Element-wise ops and matrix products'), L('numpy', 'broadcasting', 'Broadcasting')], gen: genBroadcast },
  { id: 'pandas', name: 'pandas selection and groupby', group: 'pandas', domain: 'computing', items: [99, 100, 101], stem: 'Q99: Which is the ONLY valid way to select the column \'total price\'?', method: '`df[\'col\']` works for any name; `df.loc[rows, cols]` puts rows first; `groupby(\'k\').mean()` splits by k and averages each group; `fillna`/`dropna` handle missing values.', trap: '`df.loc[\'col\']` looks for a row, not a column.', lessons: [L('pandas-and-plotting', 'dataframes-and-selection', 'DataFrames and selection'), L('pandas-and-plotting', 'groupby-merge', 'groupby and merging')], gen: genPandas },
  { id: 'torchapi', name: 'PyTorch API ↔ purpose', group: 'PyTorch', domain: 'computing', items: [106, 107, 108, 109, 111, 112, 113, 114, 116, 117, 118, 119], stem: 'Q109: What does loss.backward() do?', method: 'One API, one job: `requires_grad` tracks; `backward()` computes gradients; `step()` updates; `zero_grad()` clears; `no_grad()` switches tracking off; `train()`/`eval()` switch dropout and BatchNorm.', trap: '“backward() updates the weights”: that is `step()`.', lessons: [L('pytorch', 'autograd', 'Autograd'), L('pytorch', 'training-loop', 'The training loop')], gen: genTorch },
  { id: 'accum', name: 'Gradient accumulation', group: 'PyTorch', domain: 'computing', items: [110, 115], stem: 'Q110: Why do you need optimiser.zero_grad()?', method: '`backward()` adds into `.grad` (+=). `zero_grad()` resets it each step; skipping it on purpose is gradient accumulation.', trap: '“The second call overwrites the first.”', lessons: [L('pytorch', 'autograd', 'Autograd'), L('debugging-and-diagnosis', 'pytorch-gotchas', 'PyTorch gotchas')], gen: genAccum },
]

export const GROUPS = [...new Set(TEMPLATES.map((t) => t.group))]
export const TOTAL_ITEMS = TEMPLATES.reduce((a, t) => a + t.items.length, 0)

/** deal a variant of template t with a seed */
export function deal(t: Template, seed: number): Variant | null {
  if (!t.gen) return null
  const r = mulberry32(seed * 2654435761 + t.id.length * 97 + 13)
  // redraw (same random stream) until the four options are distinct
  let v = t.gen(r)
  for (let i = 0; i < 40 && new Set(v.opts).size < 4; i++) v = t.gen(r)
  return v
}
