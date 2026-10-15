/*
  A tiny parser + step-by-step evaluator for Boolean expressions over two switches A and B.
  Grammar (Python's precedence, lowest first):
    or_expr  := and_expr ('or' and_expr)*
    and_expr := not_expr ('and' not_expr)*
    not_expr := 'not' not_expr | cmp
    cmp      := atom (('==' | '!=') atom)*        (chained like Python: a == b != c)
    atom     := 'A' | 'B' | 'True' | 'False' | '(' or_expr ')'
  As in Python, `A == not B` is a syntax error and `not A == B` means `not (A == B)`.
*/

export type Node =
  | { k: 'lit'; v: boolean; paren: boolean }
  | { k: 'var'; name: 'A' | 'B'; paren: boolean }
  | { k: 'not'; a: Node; paren: boolean }
  | { k: 'and' | 'or'; a: Node; b: Node; paren: boolean }
  | { k: 'cmp'; ops: ('==' | '!=')[]; items: Node[]; paren: boolean }

export class ExprError extends Error {
  constructor(
    public kind: 'SyntaxError' | 'NameError' | 'Not supported here',
    message: string,
  ) {
    super(message)
  }
}

type Tok = { t: 'name'; v: string } | { t: 'op'; v: '==' | '!=' } | { t: '(' } | { t: ')' }

function tokenise(src: string): Tok[] {
  const out: Tok[] = []
  let i = 0
  while (i < src.length) {
    const c = src[i]
    if (/\s/.test(c)) {
      i++
      continue
    }
    if (c === '(' || c === ')') {
      out.push({ t: c })
      i++
      continue
    }
    const two = src.slice(i, i + 2)
    if (two === '==' || two === '!=') {
      out.push({ t: 'op', v: two })
      i += 2
      continue
    }
    if (two === '&&' || two === '||') throw new ExprError('SyntaxError', `Python has no ${two}. Write the word ${two === '&&' ? 'and' : 'or'} instead.`)
    if (c === '!') throw new ExprError('SyntaxError', 'Python has no ! operator. Write the word not instead.')
    if (c === '=') throw new ExprError('SyntaxError', 'a single = assigns a value. To compare, use ==.')
    if (c === '&' || c === '|' || c === '^' || c === '~') throw new ExprError('Not supported here', 'this box only understands and, or, not, ==, != and brackets.')
    const m = /^[A-Za-z_]\w*/.exec(src.slice(i))
    if (m) {
      out.push({ t: 'name', v: m[0] })
      i += m[0].length
      continue
    }
    throw new ExprError('SyntaxError', `unexpected character ${c}`)
  }
  return out
}

export function parse(src: string): Node {
  const toks = tokenise(src)
  if (!toks.length) throw new ExprError('SyntaxError', 'type a condition, for example A and not B')
  let p = 0
  const peek = () => toks[p]
  const isName = (v: string) => {
    const t = peek()
    return t?.t === 'name' && t.v === v
  }

  function orExpr(): Node {
    let left = andExpr()
    while (isName('or')) {
      p++
      left = { k: 'or', a: left, b: andExpr(), paren: false }
    }
    return left
  }
  function andExpr(): Node {
    let left = notExpr()
    while (isName('and')) {
      p++
      left = { k: 'and', a: left, b: notExpr(), paren: false }
    }
    return left
  }
  function notExpr(): Node {
    if (isName('not')) {
      p++
      return { k: 'not', a: notExpr(), paren: false }
    }
    return cmp()
  }
  function cmp(): Node {
    const first = atom()
    const items = [first]
    const ops: ('==' | '!=')[] = []
    while (peek()?.t === 'op') {
      ops.push((peek() as { t: 'op'; v: '==' | '!=' }).v)
      p++
      items.push(atom())
    }
    return ops.length ? { k: 'cmp', ops, items, paren: false } : first
  }
  function atom(): Node {
    const t = peek()
    if (!t) throw new ExprError('SyntaxError', 'the condition ends too early')
    if (t.t === '(') {
      p++
      const inner = orExpr()
      if (peek()?.t !== ')') throw new ExprError('SyntaxError', "'(' was never closed")
      p++
      return { ...inner, paren: true }
    }
    if (t.t === 'name') {
      p++
      if (t.v === 'True' || t.v === 'False') return { k: 'lit', v: t.v === 'True', paren: false }
      if (t.v === 'A' || t.v === 'B') return { k: 'var', name: t.v, paren: false }
      if (t.v === 'and' || t.v === 'or' || t.v === 'not') throw new ExprError('SyntaxError', `${t.v} is in the wrong place`)
      if (t.v === 'true' || t.v === 'false')
        throw new ExprError('NameError', `name '${t.v}' is not defined. Python writes ${t.v === 'true' ? 'True' : 'False'} with a capital letter.`)
      throw new ExprError('NameError', `name '${t.v}' is not defined. Only A and B exist here.`)
    }
    if (t.t === ')') throw new ExprError('SyntaxError', "unmatched ')'")
    throw new ExprError('SyntaxError', `${t.v} needs a value on both sides`)
  }

  const node = orExpr()
  if (p < toks.length) {
    const t = toks[p]
    throw new ExprError('SyntaxError', t.t === ')' ? "unmatched ')'" : `unexpected ${t.t === 'name' || t.t === 'op' ? t.v : t.t}`)
  }
  return node
}

export function evaluate(n: Node, env: { A: boolean; B: boolean }): boolean {
  switch (n.k) {
    case 'lit':
      return n.v
    case 'var':
      return env[n.name]
    case 'not':
      return !evaluate(n.a, env)
    case 'and':
      return evaluate(n.a, env) && evaluate(n.b, env)
    case 'or':
      return evaluate(n.a, env) || evaluate(n.b, env)
    case 'cmp': {
      const vals = n.items.map((x) => evaluate(x, env))
      return n.ops.every((op, i) => (op === '==' ? vals[i] === vals[i + 1] : vals[i] !== vals[i + 1]))
    }
  }
}

/** True when Python would skip the right side of some `and` / `or` because its left side already decides the answer. */
export function stopsEarly(n: Node, env: { A: boolean; B: boolean }): boolean {
  switch (n.k) {
    case 'lit':
    case 'var':
      return false
    case 'not':
      return stopsEarly(n.a, env)
    case 'and':
    case 'or': {
      if (stopsEarly(n.a, env)) return true
      const va = evaluate(n.a, env)
      return (n.k === 'and' ? !va : va) || stopsEarly(n.b, env)
    }
    case 'cmp':
      return n.items.some((x) => stopsEarly(x, env))
  }
}

export function show(n: Node): string {
  let s: string
  switch (n.k) {
    case 'lit':
      s = n.v ? 'True' : 'False'
      break
    case 'var':
      s = n.name
      break
    case 'not':
      s = 'not ' + show(n.a)
      break
    case 'and':
    case 'or':
      s = `${show(n.a)} ${n.k} ${show(n.b)}`
      break
    case 'cmp':
      s = n.items.map((x, i) => (i ? `${n.ops[i - 1]} ${show(x)}` : show(x))).join(' ')
      break
  }
  return n.paren ? `(${s})` : s
}

function substitute(n: Node, env: { A: boolean; B: boolean }): Node {
  switch (n.k) {
    case 'lit':
      return n
    case 'var':
      return { k: 'lit', v: env[n.name], paren: n.paren }
    case 'not':
      return { ...n, a: substitute(n.a, env) }
    case 'and':
    case 'or':
      return { ...n, a: substitute(n.a, env), b: substitute(n.b, env) }
    case 'cmp':
      return { ...n, items: n.items.map((x) => substitute(x, env)) }
  }
}

const isLit = (n: Node) => n.k === 'lit'

/** Reduce the first operation (left to right, innermost first) whose inputs are all values. */
function reduceOnce(n: Node): Node | null {
  switch (n.k) {
    case 'lit':
      // brackets around a single value are dropped as a step of their own
      return n.paren ? { ...n, paren: false } : null
    case 'var':
      return null
    case 'not': {
      const a = reduceOnce(n.a)
      if (a) return { ...n, a }
      return { k: 'lit', v: !(n.a as { v: boolean }).v, paren: false }
    }
    case 'and':
    case 'or': {
      const a = reduceOnce(n.a)
      if (a) return { ...n, a }
      const va = (n.a as { v: boolean }).v
      // Python stops early: `False and ...` is False and `True or ...` is True without looking at the right side
      if (n.k === 'and' ? !va : va) return { k: 'lit', v: va, paren: false }
      const b = reduceOnce(n.b)
      if (b) return { ...n, b }
      const vb = (n.b as { v: boolean }).v
      return { k: 'lit', v: n.k === 'and' ? va && vb : va || vb, paren: false }
    }
    case 'cmp': {
      for (let i = 0; i < n.items.length; i++) {
        const r = reduceOnce(n.items[i])
        if (r) return { ...n, items: n.items.map((x, j) => (j === i ? r : x)) }
      }
      if (!n.items.every(isLit)) return null
      return { k: 'lit', v: evaluate(n, { A: false, B: false }), paren: false }
    }
  }
}

/** The evaluation as a list of strings: substituted expression, then one operation at a time. */
export function traceSteps(n: Node, env: { A: boolean; B: boolean }): string[] {
  let cur = substitute(n, env)
  const out = [show(cur)]
  for (let guard = 0; guard < 40; guard++) {
    const next = reduceOnce(cur)
    if (!next) break
    cur = next
    out.push(show(cur))
  }
  return out
}
