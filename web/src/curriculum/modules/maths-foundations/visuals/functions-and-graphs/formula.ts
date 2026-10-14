/*
  A tiny, safe formula language for the FunctionPipeline visual.
  Learners type things like "3x + 1", "x^2", "abs(x - 2)", "max(0, x)" or "2(x + 1)^2".
  We parse into a small tree, then evaluate it, print it as LaTeX, and print it as Python.
  No eval(): only numbers, x, + - * / ^, brackets and a few named functions are allowed.
*/

export type FnName = 'abs' | 'max' | 'min' | 'sqrt' | 'relu'
const FNS: Record<FnName, number> = { abs: 1, max: 2, min: 2, sqrt: 1, relu: 1 }

export type Node =
  | { k: 'num'; v: number }
  | { k: 'x' }
  | { k: 'neg'; a: Node }
  | { k: 'bin'; op: '+' | '-' | '*' | '/' | '^'; a: Node; b: Node }
  | { k: 'fn'; name: FnName; args: Node[] }

type Tok = { t: 'num'; v: number; s: string } | { t: 'id'; s: string } | { t: 'op'; s: string }

function tokenize(src: string): Tok[] {
  const s = src
    .toLowerCase()
    .replace(/\*\*/g, '^')
    .replace(/[−–]/g, '-')
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
  const out: Tok[] = []
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (c === ' ') {
      i++
      continue
    }
    const num = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i))
    if (num) {
      out.push({ t: 'num', v: Number(num[1]), s: num[1] })
      i += num[1].length
      continue
    }
    const id = /^[a-z]+/.exec(s.slice(i))
    if (id) {
      const w = id[0]
      // "xx" is read as x times x; any other unknown word is an error
      if (w === 'x' || w in FNS) out.push({ t: 'id', s: w })
      else if (/^x+$/.test(w)) for (let j = 0; j < w.length; j++) out.push({ t: 'id', s: 'x' })
      else throw new Error(`I don't know "${w}". Use x, numbers, + − × / ^, brackets, abs, max, min, sqrt or relu.`)
      i += w.length
      continue
    }
    if ('+-*/^(),'.includes(c)) {
      out.push({ t: 'op', s: c })
      i++
      continue
    }
    throw new Error(`I can't read the symbol "${c}".`)
  }
  return out
}

export function parse(src: string): Node {
  const toks = tokenize(src)
  if (!toks.length) throw new Error('Type a formula that uses x.')
  let p = 0
  const peek = () => toks[p]
  const isOp = (s: string) => peek()?.t === 'op' && peek()!.s === s
  const expect = (s: string) => {
    if (!isOp(s)) throw new Error(`Expected "${s}".`)
    p++
  }
  const startsAtom = () => {
    const t = peek()
    return !!t && (t.t === 'num' || t.t === 'id' || (t.t === 'op' && t.s === '('))
  }

  function expr(): Node {
    let a = term()
    while (isOp('+') || isOp('-')) {
      const op = peek()!.s as '+' | '-'
      p++
      a = { k: 'bin', op, a, b: term() }
    }
    return a
  }
  function term(): Node {
    let a = unary()
    for (;;) {
      if (isOp('*') || isOp('/')) {
        const op = peek()!.s as '*' | '/'
        p++
        a = { k: 'bin', op, a, b: unary() }
      } else if (startsAtom()) {
        a = { k: 'bin', op: '*', a, b: power() } // implicit multiplication: 3x, 2(x + 1)
      } else return a
    }
  }
  function unary(): Node {
    if (isOp('-')) {
      p++
      return { k: 'neg', a: unary() }
    }
    if (isOp('+')) {
      p++
      return unary()
    }
    return power()
  }
  function power(): Node {
    const base = atom()
    if (isOp('^')) {
      p++
      return { k: 'bin', op: '^', a: base, b: unary() }
    }
    return base
  }
  function atom(): Node {
    const t = peek()
    if (!t) throw new Error('The formula ends too early.')
    if (t.t === 'num') {
      p++
      return { k: 'num', v: t.v }
    }
    if (t.t === 'id') {
      p++
      if (t.s === 'x') return { k: 'x' }
      const name = t.s as FnName
      expect('(')
      const args = [expr()]
      while (isOp(',')) {
        p++
        args.push(expr())
      }
      expect(')')
      if (args.length !== FNS[name]) throw new Error(`${name}( ) needs ${FNS[name]} input${FNS[name] > 1 ? 's' : ''}.`)
      return { k: 'fn', name, args }
    }
    if (t.s === '(') {
      p++
      const e = expr()
      expect(')')
      return e
    }
    throw new Error(`Unexpected "${t.s}".`)
  }

  const tree = expr()
  if (p < toks.length) throw new Error(`Unexpected "${(toks[p] as { s: string }).s}".`)
  return tree
}

export function evaluate(n: Node, x: number): number {
  switch (n.k) {
    case 'num':
      return n.v
    case 'x':
      return x
    case 'neg':
      return -evaluate(n.a, x)
    case 'bin': {
      const a = evaluate(n.a, x)
      const b = evaluate(n.b, x)
      if (n.op === '+') return a + b
      if (n.op === '-') return a - b
      if (n.op === '*') return a * b
      if (n.op === '/') return b === 0 ? NaN : a / b
      return Math.pow(a, b)
    }
    case 'fn': {
      const v = n.args.map((a) => evaluate(a, x))
      if (n.name === 'abs') return Math.abs(v[0])
      if (n.name === 'max') return Math.max(v[0], v[1])
      if (n.name === 'min') return Math.min(v[0], v[1])
      if (n.name === 'relu') return Math.max(0, v[0])
      return v[0] < 0 ? NaN : Math.sqrt(v[0])
    }
  }
}

/** Format a number for display: integers stay integers, others get up to 3 decimals. */
export function fmt(v: number): string {
  if (!Number.isFinite(v)) return 'undefined'
  if (Math.abs(v) >= 1e6) return v.toExponential(2)
  const r = Math.round(v * 1000) / 1000
  return String(Object.is(r, -0) ? 0 : r)
}

// precedence: + - → 1, * / → 2, unary minus → 3, ^ → 4, atoms → 5
const PREC = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 4 } as const

/** LaTeX for a tree. If `sub` is given, x is replaced by that number (shown in brackets when negative). */
export function toTex(n: Node, sub?: number): { s: string; p: number } {
  const wrap = (c: { s: string; p: number }, min: number) => (c.p < min ? `\\left(${c.s}\\right)` : c.s)
  switch (n.k) {
    case 'num':
      return { s: fmt(n.v), p: 5 }
    case 'x':
      if (sub === undefined) return { s: 'x', p: 5 }
      return sub < 0 ? { s: `(${fmt(sub)})`, p: 5 } : { s: fmt(sub), p: 5 }
    case 'neg':
      return { s: `-${wrap(toTex(n.a, sub), 3)}`, p: 3 }
    case 'fn': {
      // a bare substituted x needs no extra brackets inside f( ): max(0, -3), not max(0, (-3))
      const a = n.args.map((x) => (x.k === 'x' && sub !== undefined ? fmt(sub) : toTex(x, sub).s))
      if (n.name === 'abs') return { s: `\\lvert ${a[0]} \\rvert`, p: 5 }
      if (n.name === 'sqrt') return { s: `\\sqrt{${a[0]}}`, p: 5 }
      if (n.name === 'relu') return { s: `\\operatorname{ReLU}(${a[0]})`, p: 5 }
      return { s: `\\${n.name}(${a.join(', ')})`, p: 5 }
    }
    case 'bin': {
      const pr = PREC[n.op]
      const A = toTex(n.a, sub)
      const B = toTex(n.b, sub)
      if (n.op === '^') return { s: `${A.p < 5 ? `\\left(${A.s}\\right)` : A.s}^{${B.s}}`, p: 4 }
      if (n.op === '/') {
        const bare = (c: Node, t: { s: string }) => (c.k === 'x' && sub !== undefined ? fmt(sub) : t.s)
        return { s: `\\frac{${bare(n.a, A)}}{${bare(n.b, B)}}`, p: 5 }
      }
      if (n.op === '*') {
        const l = wrap(A, 2)
        const r = wrap(B, 3)
        // write 3x and 2(x+1) the way a textbook would, but keep a dot between two numbers
        const aNum = n.a.k === 'num' || (n.a.k === 'neg' && n.a.a.k === 'num')
        const implicit = sub === undefined && aNum && (n.b.k === 'x' || n.b.k === 'fn' || B.p < 3 || (n.b.k === 'bin' && n.b.op === '^' && n.b.a.k !== 'num'))
        return { s: implicit ? `${l}${r}` : `${l} \\times ${r}`, p: 2 }
      }
      const r = n.op === '-' ? wrap(B, pr + 1) : wrap(B, pr)
      return { s: `${wrap(A, pr)} ${n.op} ${r}`, p: pr }
    }
  }
}

/** Python source for a tree, e.g. 3 * x + 1, x ** 2, abs(x - 2), max(0, x). */
export function toPy(n: Node): { s: string; p: number; math: boolean } {
  const wrap = (c: { s: string; p: number }, min: number) => (c.p < min ? `(${c.s})` : c.s)
  switch (n.k) {
    case 'num':
      return { s: fmt(n.v), p: 5, math: false }
    case 'x':
      return { s: 'x', p: 5, math: false }
    case 'neg': {
      const a = toPy(n.a)
      return { s: `-${wrap(a, 3)}`, p: 3, math: a.math }
    }
    case 'fn': {
      const a = n.args.map(toPy)
      const m = a.some((x) => x.math)
      const args = a.map((x) => x.s).join(', ')
      if (n.name === 'sqrt') return { s: `math.sqrt(${args})`, p: 5, math: true }
      if (n.name === 'relu') return { s: `max(0, ${args})`, p: 5, math: m }
      return { s: `${n.name}(${args})`, p: 5, math: m }
    }
    case 'bin': {
      const A = toPy(n.a)
      const B = toPy(n.b)
      const m = A.math || B.math
      if (n.op === '^') return { s: `${wrap(A, 5)} ** ${wrap(B, 3)}`, p: 4, math: m }
      const pr = PREC[n.op]
      const r = n.op === '-' || n.op === '/' ? wrap(B, pr + 1) : wrap(B, pr)
      return { s: `${wrap(A, pr)} ${n.op} ${r}`, p: pr, math: m }
    }
  }
}

export function pyDef(name: string, n: Node): string {
  const py = toPy(n)
  return `${py.math ? 'import math\n\n' : ''}def ${name}(x):\n    return ${py.s}`
}
