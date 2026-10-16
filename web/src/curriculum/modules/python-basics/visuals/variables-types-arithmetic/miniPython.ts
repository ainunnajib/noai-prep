/*
  A tiny, faithful subset of Python expressions for this lesson's visuals.

  Supports: int (arbitrary size, via BigInt), float, str, bool, None literals; the operators
  + - * / // % ** (with Python's precedence, ** right-associative, unary minus below **);
  brackets; and the calls int(), float(), str(), bool(), type(), len(), abs(), print().

  Results and error messages follow CPython 3.13 (checked against real Python by a fuzz test
  during authoring). Anything outside the subset raises an `Unsupported` error so the UI can
  say "this mini box can't do that" instead of pretending to be Python.
*/

export type PyVal =
  | { t: 'int'; v: bigint }
  | { t: 'float'; v: number }
  | { t: 'str'; v: string }
  | { t: 'bool'; v: boolean }
  | { t: 'none' }
  | { t: 'type'; v: string }

export type BinOp = '+' | '-' | '*' | '/' | '//' | '%' | '**'

export type Node =
  | { id: number; kind: 'lit'; value: PyVal; text: string; paren: number }
  | { id: number; kind: 'name'; name: string; paren: number }
  | { id: number; kind: 'unary'; op: '-' | '+'; arg: Node; paren: number }
  | { id: number; kind: 'bin'; op: BinOp; left: Node; right: Node; paren: number }
  | { id: number; kind: 'call'; fn: string; args: Node[]; paren: number }

/** A real Python exception (type + message), e.g. TypeError: … */
export class PyError extends Error {
  constructor(
    public pyType: string,
    message: string,
  ) {
    super(message)
  }
}
/** Something real Python can do but this mini box deliberately doesn't. */
export class Unsupported extends Error {}

// ---------------------------------------------------------------- values

export const int = (v: bigint | number): PyVal => ({ t: 'int', v: typeof v === 'bigint' ? v : BigInt(v) })
export const float = (v: number): PyVal => ({ t: 'float', v })
export const str = (v: string): PyVal => ({ t: 'str', v })
export const bool = (v: boolean): PyVal => ({ t: 'bool', v })
const NONE: PyVal = { t: 'none' }

export function typeName(x: PyVal): string {
  switch (x.t) {
    case 'none':
      return 'NoneType'
    case 'type':
      return 'type'
    default:
      return x.t
  }
}

/** Python's repr() of a float: shortest round-trip digits, scientific below 1e-4 and from 1e16. */
export function floatRepr(x: number): string {
  if (Number.isNaN(x)) return 'nan'
  if (x === Infinity) return 'inf'
  if (x === -Infinity) return '-inf'
  if (x === 0) return Object.is(x, -0) ? '-0.0' : '0.0'
  const sign = x < 0 ? '-' : ''
  const [mant, expStr] = Math.abs(x).toExponential().split('e')
  const digits = mant.replace('.', '')
  const e = Number(expStr)
  if (e < -4 || e >= 16) {
    const m = digits.length > 1 ? digits[0] + '.' + digits.slice(1) : digits
    return sign + m + 'e' + (e < 0 ? '-' : '+') + String(Math.abs(e)).padStart(2, '0')
  }
  if (e >= 0) {
    const whole = digits.length > e + 1 ? digits.slice(0, e + 1) : digits.padEnd(e + 1, '0')
    const frac = digits.length > e + 1 ? digits.slice(e + 1) : '0'
    return sign + whole + '.' + frac
  }
  return sign + '0.' + '0'.repeat(-e - 1) + digits
}

export function strRepr(s: string): string {
  const q = s.includes("'") && !s.includes('"') ? '"' : "'"
  let out = q
  for (const ch of s) {
    if (ch === '\\') out += '\\\\'
    else if (ch === q) out += '\\' + q
    else if (ch === '\n') out += '\\n'
    else if (ch === '\t') out += '\\t'
    else if (ch === '\r') out += '\\r'
    else if (ch < ' ' || ch === '\x7f') out += '\\x' + ch.charCodeAt(0).toString(16).padStart(2, '0')
    else out += ch
  }
  return out + q
}

const INT_STR_LIMIT = 4300
function intText(v: bigint): string {
  const s = v.toString()
  if (s.replace('-', '').length > INT_STR_LIMIT)
    throw new PyError('ValueError', 'Exceeds the limit (4300 digits) for integer string conversion; use sys.set_int_max_str_digits() to increase the limit')
  return s
}

/** repr(x): what a notebook shows for an expression's value. */
export function repr(x: PyVal): string {
  switch (x.t) {
    case 'int':
      return intText(x.v)
    case 'float':
      return floatRepr(x.v)
    case 'str':
      return strRepr(x.v)
    case 'bool':
      return x.v ? 'True' : 'False'
    case 'none':
      return 'None'
    case 'type':
      return `<class '${x.v}'>`
  }
}

/** str(x): what print() shows. */
export function pyStr(x: PyVal): string {
  return x.t === 'str' ? x.v : repr(x)
}

export function truthy(x: PyVal): boolean {
  switch (x.t) {
    case 'int':
      return x.v !== 0n
    case 'float':
      return x.v !== 0
    case 'str':
      return x.v.length > 0
    case 'bool':
      return x.v
    case 'none':
      return false
    case 'type':
      return true
  }
}

// ---------------------------------------------------------------- tokenizer

type Tok = { k: 'num' | 'str' | 'name' | 'op' | 'end'; s: string; pos: number; value?: PyVal }

const FLOAT_RE = /^(?:(?:\d(?:_?\d)*)?\.\d(?:_?\d)*|\d(?:_?\d)*\.)(?:[eE][+-]?\d(?:_?\d)*)?|^\d(?:_?\d)*[eE][+-]?\d(?:_?\d)*/
const INT_RE = /^(?:0[xX](?:_?[0-9a-fA-F])+|0[oO](?:_?[0-7])+|0[bB](?:_?[01])+|\d(?:_?\d)*)/

function tokenize(src: string): Tok[] {
  const toks: Tok[] = []
  let i = 0
  while (i < src.length) {
    const ch = src[i]
    if (ch === ' ' || ch === '\t') {
      i++
      continue
    }
    if (ch === '\n' || ch === '\r') throw new Unsupported('This box takes one line at a time.')
    if (ch === '#') break
    const rest = src.slice(i)
    if (/[0-9.]/.test(ch)) {
      const fm = FLOAT_RE.exec(rest)
      const im = INT_RE.exec(rest)
      if (fm && (!im || fm[0].length >= im[0].length)) {
        const text = fm[0]
        if (/^[A-Za-z_0-9]/.test(src.slice(i + text.length))) throw new PyError('SyntaxError', 'invalid decimal literal')
        toks.push({ k: 'num', s: text, pos: i, value: float(parseFloat(text.replace(/_/g, ''))) })
        i += text.length
        continue
      }
      if (im) {
        const text = im[0]
        if (/^[A-Za-z_0-9]/.test(src.slice(i + text.length))) throw new PyError('SyntaxError', 'invalid decimal literal')
        const clean = text.replace(/_/g, '')
        if (/^0\d/.test(clean) && !/^0+$/.test(clean))
          throw new PyError('SyntaxError', 'leading zeros in decimal integer literals are not permitted; use an 0o prefix for octal integers')
        toks.push({ k: 'num', s: text, pos: i, value: int(BigInt(clean)) })
        i += text.length
        continue
      }
      throw new PyError('SyntaxError', 'invalid syntax')
    }
    if (ch === '"' || ch === "'") {
      let j = i + 1
      let v = ''
      let closed = false
      while (j < src.length) {
        const c = src[j]
        if (c === '\\' && j + 1 < src.length) {
          const n = src[j + 1]
          const map: Record<string, string> = { n: '\n', t: '\t', '\\': '\\', "'": "'", '"': '"', r: '\r', '0': '\0' }
          v += n in map ? map[n] : '\\' + n
          j += 2
          continue
        }
        if (c === ch) {
          closed = true
          break
        }
        v += c
        j++
      }
      if (!closed) throw new PyError('SyntaxError', 'unterminated string literal (detected at line 1)')
      toks.push({ k: 'str', s: src.slice(i, j + 1), pos: i, value: str(v) })
      i = j + 1
      continue
    }
    if (/[A-Za-z_]/.test(ch)) {
      const m = /^[A-Za-z_]\w*/.exec(rest)!
      if (/^["']/.test(src.slice(i + m[0].length)) && /^[rRbBuUfF]{1,2}$/.test(m[0]))
        throw new Unsupported('String prefixes like f"…" are not supported in this box (you will meet f-strings in the strings lesson).')
      if (['and', 'or', 'not', 'in', 'is', 'if', 'else', 'lambda'].includes(m[0]))
        throw new Unsupported(
          `${m[0]} is real Python, but this box only does arithmetic and types. You will use and, or, not and if/else in the decisions lesson.`,
        )
      toks.push({ k: 'name', s: m[0], pos: i })
      i += m[0].length
      continue
    }
    const two = src.slice(i, i + 2)
    if (two === '**' || two === '//') {
      toks.push({ k: 'op', s: two, pos: i })
      i += 2
      continue
    }
    if (two === '==' || two === '!=' || two === '<=' || two === '>=' || ch === '<' || ch === '>')
      throw new Unsupported('Comparisons such as == and < come in the lesson on decisions. This box only does arithmetic and types.')
    if (ch === '=') throw new Unsupported('This box works out expressions; it cannot store variables. Leave out the "name =" part.')
    if ('+-*/%(),'.includes(ch)) {
      toks.push({ k: 'op', s: ch, pos: i })
      i++
      continue
    }
    if ('[]{}.:'.includes(ch)) throw new Unsupported(`This box does not understand "${ch}" (lists, indexing and methods come in later lessons).`)
    throw new PyError('SyntaxError', 'invalid syntax')
  }
  toks.push({ k: 'end', s: '', pos: src.length })
  return toks
}

// ---------------------------------------------------------------- parser

export function parse(src: string): Node {
  const toks = tokenize(src)
  let p = 0
  let nextId = 1
  const peek = () => toks[p]
  const isOp = (s: string) => toks[p].k === 'op' && toks[p].s === s
  const take = () => toks[p++]

  function expr(): Node {
    let left = term()
    while (isOp('+') || isOp('-')) {
      const op = take().s as BinOp
      left = { id: nextId++, kind: 'bin', op, left, right: term(), paren: 0 }
    }
    return left
  }
  function term(): Node {
    let left = factor()
    while (isOp('*') || isOp('/') || isOp('//') || isOp('%')) {
      const op = take().s as BinOp
      left = { id: nextId++, kind: 'bin', op, left, right: factor(), paren: 0 }
    }
    return left
  }
  function factor(): Node {
    if (isOp('-') || isOp('+')) {
      const op = take().s as '-' | '+'
      return { id: nextId++, kind: 'unary', op, arg: factor(), paren: 0 }
    }
    return power()
  }
  function power(): Node {
    const base = atom()
    if (isOp('**')) {
      take()
      return { id: nextId++, kind: 'bin', op: '**', left: base, right: factor(), paren: 0 }
    }
    return base
  }
  function atom(): Node {
    const t = peek()
    if (t.k === 'num') {
      take()
      return { id: nextId++, kind: 'lit', value: t.value!, text: t.s, paren: 0 }
    }
    if (t.k === 'str') {
      take()
      let text = t.s
      let v = (t.value as { t: 'str'; v: string }).v
      while (peek().k === 'str') {
        const u = take()
        text += ' ' + u.s
        v += (u.value as { t: 'str'; v: string }).v
      }
      return { id: nextId++, kind: 'lit', value: str(v), text, paren: 0 }
    }
    if (t.k === 'name') {
      take()
      if (t.s === 'True' || t.s === 'False') return { id: nextId++, kind: 'lit', value: bool(t.s === 'True'), text: t.s, paren: 0 }
      if (t.s === 'None') return { id: nextId++, kind: 'lit', value: NONE, text: 'None', paren: 0 }
      if (isOp('(')) {
        take()
        const args: Node[] = []
        while (!isOp(')')) {
          if (peek().k === 'end') throw new PyError('SyntaxError', "'(' was never closed")
          args.push(expr())
          if (isOp(',')) take()
          else if (!isOp(')')) {
            if (peek().k === 'end') throw new PyError('SyntaxError', "'(' was never closed")
            throw new PyError('SyntaxError', 'invalid syntax. Perhaps you forgot a comma?')
          }
        }
        take()
        return { id: nextId++, kind: 'call', fn: t.s, args, paren: 0 }
      }
      return { id: nextId++, kind: 'name', name: t.s, paren: 0 }
    }
    if (isOp('(')) {
      take()
      if (isOp(')')) throw new Unsupported('Empty brackets () make a tuple, which this box does not support.')
      const inner = expr()
      if (isOp(',')) throw new Unsupported('A comma inside brackets makes a tuple, which this box does not support.')
      if (!isOp(')')) {
        if (peek().k === 'end') throw new PyError('SyntaxError', "'(' was never closed")
        throw new PyError('SyntaxError', 'invalid syntax')
      }
      take()
      inner.paren += 1
      return inner
    }
    if (isOp(')')) throw new PyError('SyntaxError', "unmatched ')'")
    throw new PyError('SyntaxError', 'invalid syntax')
  }

  if (peek().k === 'end') throw new Unsupported('Type an expression, for example 7 // 2.')
  const root = expr()
  if (peek().k !== 'end') {
    if (isOp(')')) throw new PyError('SyntaxError', "unmatched ')'")
    if (isOp(',')) throw new Unsupported('A comma here would make a tuple, which this box does not support.')
    throw new PyError('SyntaxError', 'invalid syntax')
  }
  return root
}

// ---------------------------------------------------------------- arithmetic

const TWO53 = 2n ** 53n
const FLOAT_MAX_INT = 2n ** 1024n

function asNumeric(x: PyVal): { t: 'int'; v: bigint } | { t: 'float'; v: number } | null {
  if (x.t === 'int' || x.t === 'float') return x
  if (x.t === 'bool') return { t: 'int', v: x.v ? 1n : 0n }
  return null
}

function intToFloat(v: bigint): number {
  if (v >= FLOAT_MAX_INT || v <= -FLOAT_MAX_INT) throw new PyError('OverflowError', 'int too large to convert to float')
  return Number(v)
}

const babs = (v: bigint) => (v < 0n ? -v : v)

function intTrueDiv(a: bigint, b: bigint): number {
  if (b === 0n) throw new PyError('ZeroDivisionError', 'division by zero')
  if (babs(a) <= TWO53 && babs(b) <= TWO53) return Number(a) / Number(b)
  const neg = a < 0n !== b < 0n
  const A = babs(a)
  const B = babs(b)
  if (A === 0n) return neg ? -0 : 0
  const shift = 70 - (A.toString(2).length - B.toString(2).length)
  const q = shift >= 0 ? (A << BigInt(shift)) / B : A / (B << BigInt(-shift))
  const half = Math.trunc(shift / 2)
  const val = Number(q) * 2 ** -half * 2 ** -(shift - half)
  if (!Number.isFinite(val)) throw new PyError('OverflowError', 'integer division result too large for a float')
  return neg ? -val : val
}

function floorDivInt(a: bigint, b: bigint): bigint {
  const q = a / b
  return (a % b !== 0n && a < 0n !== b < 0n) ? q - 1n : q
}
function modInt(a: bigint, b: bigint): bigint {
  const r = a % b
  return r !== 0n && r < 0n !== b < 0n ? r + b : r
}

/** CPython's float divmod (Objects/floatobject.c). */
function floatDivmod(vx: number, wx: number): [number, number] {
  let mod = vx % wx
  let div = (vx - mod) / wx
  if (mod !== 0) {
    if (wx < 0 !== mod < 0) {
      mod += wx
      div -= 1.0
    }
  } else {
    mod = wx < 0 ? -0 : 0
  }
  let floordiv: number
  if (div !== 0) {
    floordiv = Math.floor(div)
    if (div - floordiv > 0.5) floordiv += 1.0
  } else {
    const q = vx / wx
    floordiv = q < 0 || Object.is(q, -0) ? -0 : 0
  }
  return [floordiv, mod]
}

/** |x| = m · 2^e with m odd (x finite, non-zero). */
function decompose(x: number): [bigint, number] {
  const dv = new DataView(new ArrayBuffer(8))
  dv.setFloat64(0, Math.abs(x))
  const hi = dv.getUint32(0)
  const lo = dv.getUint32(4)
  const bexp = (hi >>> 20) & 0x7ff
  let m = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo)
  let e: number
  if (bexp === 0) e = -1074
  else {
    m |= 1n << 52n
    e = bexp - 1075
  }
  while ((m & 1n) === 0n) {
    m >>= 1n
    e++
  }
  return [m, e]
}

const bitLen = (v: bigint) => v.toString(2).length

/** num/den · 2^exp2 rounded to the nearest double (ties to even); null if subnormal. */
function ratioToDouble(num: bigint, den: bigint, exp2: number): number | null {
  const s = 56 - (bitLen(num) - bitLen(den))
  const n2 = s >= 0 ? num << BigInt(s) : num
  const d2 = s >= 0 ? den : den << BigInt(-s)
  let q = n2 / d2
  const sticky = n2 % d2 !== 0n
  const extra = bitLen(q) - 53
  const mask = (1n << BigInt(extra)) - 1n
  const dropped = q & mask
  const half = 1n << BigInt(extra - 1)
  q >>= BigInt(extra)
  if (dropped > half || (dropped === half && (sticky || (q & 1n) === 1n))) q += 1n
  const e = exp2 - s + extra
  const top = e + bitLen(q) - 1
  if (top > 1023) return Infinity
  if (top < -1022) return null
  const h = Math.trunc(e / 2)
  return Number(q) * 2 ** h * 2 ** (e - h)
}

/** Correctly rounded a ** n for an integer n (what C's pow returns for these cases). */
function exactIntPow(a: number, n: number): number | null {
  if (!Number.isFinite(a) || a === 0 || Math.abs(n) > 4096) return null
  const [m, e] = decompose(a)
  if (bitLen(m) * Math.abs(n) > 200000) return null
  const neg = a < 0 && Math.abs(n) % 2 === 1
  const M = m ** BigInt(Math.abs(n))
  const r = n >= 0 ? ratioToDouble(M, 1n, e * n) : ratioToDouble(1n, M, e * n)
  if (r === null) return null
  return neg ? -r : r
}

function floatPow(a: number, b: number): number {
  if (b === 0) return 1.0
  if (Number.isNaN(a)) return a
  if (Number.isNaN(b)) return a === 1 ? 1.0 : b
  if (a === 1) return 1.0
  if (a === -1 && !Number.isFinite(b)) return 1.0
  if (a === 0 && b < 0) throw new PyError('ZeroDivisionError', '0.0 cannot be raised to a negative power')
  if (a < 0 && Number.isFinite(a) && Number.isFinite(b) && !Number.isInteger(b))
    throw new Unsupported('Python gives a complex number here (a negative number to a fractional power), which this box does not support.')
  const exact = Number.isInteger(b) ? exactIntPow(a, b) : null
  const r = exact ?? (b === 0.5 && a >= 0 ? Math.sqrt(a) : Math.pow(a, b))
  if (!Number.isFinite(r) && Number.isFinite(a) && Number.isFinite(b)) throw new PyError('OverflowError', "(34, 'Numerical result out of range')")
  return r
}

function unsupportedOperands(op: string, a: PyVal, b: PyVal): PyError {
  const shown = op === '**' ? '** or pow()' : op
  return new PyError('TypeError', `unsupported operand type(s) for ${shown}: '${typeName(a)}' and '${typeName(b)}'`)
}

const MAX_STR = 20000

function repeatStr(s: string, n: bigint): PyVal {
  if (n <= 0n || s.length === 0) return str('')
  if (BigInt(s.length) * n > BigInt(MAX_STR)) throw new Unsupported('That string would be too long to show here.')
  return str(s.repeat(Number(n)))
}

export function binop(op: BinOp, a: PyVal, b: PyVal): PyVal {
  const na = asNumeric(a)
  const nb = asNumeric(b)
  if (na && nb) {
    if (na.t === 'int' && nb.t === 'int') {
      const x = na.v
      const y = nb.v
      switch (op) {
        case '+':
          return int(x + y)
        case '-':
          return int(x - y)
        case '*':
          return int(x * y)
        case '/':
          return float(intTrueDiv(x, y))
        case '//':
          if (y === 0n) throw new PyError('ZeroDivisionError', 'integer division or modulo by zero')
          return int(floorDivInt(x, y))
        case '%':
          if (y === 0n) throw new PyError('ZeroDivisionError', 'integer modulo by zero')
          return int(modInt(x, y))
        case '**': {
          if (y < 0n) {
            if (x === 0n) throw new PyError('ZeroDivisionError', '0.0 cannot be raised to a negative power')
            return float(floatPow(intToFloat(x), intToFloat(y)))
          }
          if (x === 0n || x === 1n) return int(y === 0n ? 1n : x)
          if (x === -1n) return int(y % 2n === 0n ? 1n : -1n)
          const bits = (babs(x).toString(2).length - 1) * Number(y)
          if (bits > 60000) throw new Unsupported('That number is too big for this box (Python could compute it, but it has thousands of digits).')
          return int(x ** y)
        }
      }
    }
    const x = na.t === 'int' ? intToFloat(na.v) : na.v
    const y = nb.t === 'int' ? intToFloat(nb.v) : nb.v
    switch (op) {
      case '+':
        return float(x + y)
      case '-':
        return float(x - y)
      case '*':
        return float(x * y)
      case '/':
        if (y === 0) throw new PyError('ZeroDivisionError', 'float division by zero')
        return float(x / y)
      case '//':
        if (y === 0) throw new PyError('ZeroDivisionError', 'float floor division by zero')
        return float(floatDivmod(x, y)[0])
      case '%':
        if (y === 0) throw new PyError('ZeroDivisionError', 'float modulo by zero')
        return float(floatDivmod(x, y)[1])
      case '**':
        return float(floatPow(x, y))
    }
  }
  // at least one non-number
  if (op === '+') {
    if (a.t === 'str' && b.t === 'str') {
      if (a.v.length + b.v.length > MAX_STR) throw new Unsupported('That string would be too long to show here.')
      return str(a.v + b.v)
    }
    if (a.t === 'str') throw new PyError('TypeError', `can only concatenate str (not "${typeName(b)}") to str`)
    throw unsupportedOperands(op, a, b)
  }
  if (op === '*') {
    if (a.t === 'str' && nb) {
      if (nb.t === 'float') throw new PyError('TypeError', "can't multiply sequence by non-int of type 'float'")
      return repeatStr(a.v, nb.v)
    }
    if (b.t === 'str' && na) {
      if (na.t === 'float') throw new PyError('TypeError', "can't multiply sequence by non-int of type 'float'")
      return repeatStr(b.v, na.v)
    }
    if (a.t === 'str' && b.t === 'str') throw new PyError('TypeError', "can't multiply sequence by non-int of type 'str'")
    if (a.t === 'str' || b.t === 'str') {
      const other = a.t === 'str' ? b : a
      throw new PyError('TypeError', `can't multiply sequence by non-int of type '${typeName(other)}'`)
    }
    throw unsupportedOperands(op, a, b)
  }
  if (op === '%' && a.t === 'str') throw new Unsupported('% after a string is an old way of formatting text, which this box does not support. Use f-strings instead (strings lesson).')
  throw unsupportedOperands(op, a, b)
}

export function unop(op: '-' | '+', a: PyVal): PyVal {
  const n = asNumeric(a)
  if (!n) throw new PyError('TypeError', `bad operand type for unary ${op}: '${typeName(a)}'`)
  if (op === '+') return n
  return n.t === 'int' ? int(-n.v) : float(-n.v)
}

const INT_STR_RE = /^[+-]?\d(?:_?\d)*$/
const FLOAT_STR_RE = /^[+-]?(?:(?:\d(?:_?\d)*)?\.\d(?:_?\d)*|\d(?:_?\d)*\.?)(?:[eE][+-]?\d(?:_?\d)*)?$/
const isSpace = (c: string) => /\s/.test(c)
const pyStrip = (s: string) => {
  let a = 0
  let b = s.length
  while (a < b && isSpace(s[a])) a++
  while (b > a && isSpace(s[b - 1])) b--
  return s.slice(a, b)
}

export function callFn(fn: string, args: PyVal[], out: string[]): PyVal {
  const one = (allowZero: boolean): PyVal | null => {
    if (args.length === 0 && allowZero) return null
    if (args.length !== 1) {
      if (fn === 'len') throw new PyError('TypeError', `len() takes exactly one argument (${args.length} given)`)
      if (fn === 'type') throw new PyError('TypeError', 'type() takes 1 or 3 arguments')
      if (fn === 'abs') throw new PyError('TypeError', `abs() takes exactly one argument (${args.length} given)`)
      throw new Unsupported(`${fn}() with ${args.length} arguments is not supported in this box.`)
    }
    return args[0]
  }
  switch (fn) {
    case 'print':
      out.push(args.map(pyStr).join(' '))
      return NONE
    case 'type': {
      const x = one(false)!
      return { t: 'type', v: typeName(x) }
    }
    case 'int': {
      const x = one(true)
      if (!x) return int(0)
      switch (x.t) {
        case 'int':
          return x
        case 'bool':
          return int(x.v ? 1 : 0)
        case 'float':
          if (Number.isNaN(x.v)) throw new PyError('ValueError', 'cannot convert float NaN to integer')
          if (!Number.isFinite(x.v)) throw new PyError('OverflowError', 'cannot convert float infinity to integer')
          return int(BigInt(Math.trunc(x.v)))
        case 'str': {
          const s = pyStrip(x.v)
          if (!INT_STR_RE.test(s)) throw new PyError('ValueError', `invalid literal for int() with base 10: ${strRepr(x.v).slice(0, 200)}`)
          return int(BigInt(s.replace(/_/g, '')))
        }
        default:
          throw new PyError('TypeError', `int() argument must be a string, a bytes-like object or a real number, not '${typeName(x)}'`)
      }
    }
    case 'float': {
      const x = one(true)
      if (!x) return float(0)
      switch (x.t) {
        case 'float':
          return x
        case 'int':
          return float(intToFloat(x.v))
        case 'bool':
          return float(x.v ? 1 : 0)
        case 'str': {
          const s = pyStrip(x.v)
          const low = s.toLowerCase().replace(/^[+-]/, '')
          const neg = s.startsWith('-')
          if (low === 'inf' || low === 'infinity') return float(neg ? -Infinity : Infinity)
          if (low === 'nan') return float(NaN)
          if (!FLOAT_STR_RE.test(s)) throw new PyError('ValueError', `could not convert string to float: ${strRepr(x.v)}`)
          return float(parseFloat(s.replace(/_/g, '')))
        }
        default:
          throw new PyError('TypeError', `float() argument must be a string or a real number, not '${typeName(x)}'`)
      }
    }
    case 'str': {
      const x = one(true)
      return str(x ? pyStr(x) : '')
    }
    case 'bool': {
      const x = one(true)
      return bool(x ? truthy(x) : false)
    }
    case 'len': {
      const x = one(false)!
      if (x.t !== 'str') throw new PyError('TypeError', `object of type '${typeName(x)}' has no len()`)
      return int(Array.from(x.v).length)
    }
    case 'abs': {
      const x = one(false)!
      const n = asNumeric(x)
      if (!n) throw new PyError('TypeError', `bad operand type for abs(): '${typeName(x)}'`)
      return n.t === 'int' ? int(babs(n.v)) : float(Math.abs(n.v))
    }
    default:
      throw new PyError('NameError', `name '${fn}' is not defined`)
  }
}

// ---------------------------------------------------------------- evaluation

const SUPPORTED_FNS = ['print', 'type', 'int', 'float', 'str', 'bool', 'len', 'abs']
const OTHER_BUILTINS = ['round', 'min', 'max', 'sum', 'pow', 'divmod', 'input', 'range', 'list', 'tuple', 'dict', 'set', 'sorted', 'reversed', 'enumerate', 'zip', 'map', 'filter', 'isinstance', 'repr', 'chr', 'ord', 'hex', 'bin', 'oct', 'id', 'hash', 'help', 'dir', 'open', 'any', 'all', 'complex', 'format', 'iter', 'next', 'object', 'super', 'eval', 'exec']

/** dir(builtins) in CPython 3.13: the candidates for "Did you mean" suggestions. */
const BUILTIN_NAMES = 'ArithmeticError,AssertionError,AttributeError,BaseException,BaseExceptionGroup,BlockingIOError,BrokenPipeError,BufferError,BytesWarning,ChildProcessError,ConnectionAbortedError,ConnectionError,ConnectionRefusedError,ConnectionResetError,DeprecationWarning,EOFError,Ellipsis,EncodingWarning,EnvironmentError,Exception,ExceptionGroup,False,FileExistsError,FileNotFoundError,FloatingPointError,FutureWarning,GeneratorExit,IOError,ImportError,ImportWarning,IndentationError,IndexError,InterruptedError,IsADirectoryError,KeyError,KeyboardInterrupt,LookupError,MemoryError,ModuleNotFoundError,NameError,None,NotADirectoryError,NotImplemented,NotImplementedError,OSError,OverflowError,PendingDeprecationWarning,PermissionError,ProcessLookupError,PythonFinalizationError,RecursionError,ReferenceError,ResourceWarning,RuntimeError,RuntimeWarning,StopAsyncIteration,StopIteration,SyntaxError,SyntaxWarning,SystemError,SystemExit,TabError,TimeoutError,True,TypeError,UnboundLocalError,UnicodeDecodeError,UnicodeEncodeError,UnicodeError,UnicodeTranslateError,UnicodeWarning,UserWarning,ValueError,Warning,ZeroDivisionError,_IncompleteInputError,__build_class__,__debug__,__doc__,__import__,__loader__,__name__,__package__,__spec__,abs,aiter,all,anext,any,ascii,bin,bool,breakpoint,bytearray,bytes,callable,chr,classmethod,compile,complex,copyright,credits,delattr,dict,dir,divmod,enumerate,eval,exec,exit,filter,float,format,frozenset,getattr,globals,hasattr,hash,help,hex,id,input,int,isinstance,issubclass,iter,len,license,list,locals,map,max,memoryview,min,next,object,oct,open,ord,pow,print,property,quit,range,repr,reversed,round,set,setattr,slice,sorted,staticmethod,str,sum,super,tuple,type,vars,zip'.split(',')

/** Common standard-library modules: Python adds "Did you forget to import …?" for these. */
const STDLIB_COMMON = 'abc,array,collections,copy,csv,datetime,decimal,fractions,functools,glob,io,itertools,json,math,operator,os,pathlib,pickle,random,re,statistics,string,sys,time,typing'.split(',')

/* CPython's suggestion algorithm (Python/suggestions.c): a Levenshtein distance where a
   substitution costs 2, or 1 if only the letter case differs. */
const MOVE_COST = 2
function substitutionCost(a: string, b: string): number {
  if ((a.charCodeAt(0) & 31) !== (b.charCodeAt(0) & 31)) return MOVE_COST
  if (a === b) return 0
  return a.toLowerCase() === b.toLowerCase() ? 1 : MOVE_COST
}
function levenshtein(a: string, b: string, maxCost: number): number {
  if (a === b) return 0
  while (a.length && b.length && a[0] === b[0]) {
    a = a.slice(1)
    b = b.slice(1)
  }
  while (a.length && b.length && a[a.length - 1] === b[b.length - 1]) {
    a = a.slice(0, -1)
    b = b.slice(0, -1)
  }
  if (!a.length || !b.length) return (a.length + b.length) * MOVE_COST
  if (a.length > 40 || b.length > 40) return maxCost + 1
  if (b.length < a.length) [a, b] = [b, a]
  if ((b.length - a.length) * MOVE_COST > maxCost) return maxCost + 1
  const buf: number[] = []
  for (let i = 0, tmp = MOVE_COST; i < a.length; i++, tmp += MOVE_COST) buf[i] = tmp
  let result = 0
  for (let bi = 0; bi < b.length; bi++) {
    let distance = (result = bi * MOVE_COST)
    let minimum = Infinity
    for (let i = 0; i < a.length; i++) {
      const substitute = distance + substitutionCost(b[bi], a[i])
      distance = buf[i]
      const insertDelete = Math.min(result, distance) + MOVE_COST
      result = Math.min(insertDelete, substitute)
      buf[i] = result
      if (result < minimum) minimum = result
    }
    if (minimum > maxCost) return maxCost + 1
  }
  return result
}

function nameError(name: string): PyError {
  let best: string | null = null
  let bestD = Infinity
  for (const item of BUILTIN_NAMES) {
    if (item === name) continue
    const maxD = Math.min(Math.floor(((name.length + item.length + 3) * MOVE_COST) / 6), bestD - 1)
    const d = levenshtein(name, item, maxD)
    if (d > maxD) continue
    if (best === null || d < bestD) {
      best = item
      bestD = d
    }
  }
  const forgot = STDLIB_COMMON.includes(name)
  const hint = best ? `. Did you mean: '${best}'?${forgot ? ` Or did you forget to import '${name}'?` : ''}` : forgot ? `. Did you forget to import '${name}'?` : ''
  return new PyError('NameError', `name '${name}' is not defined${hint}`)
}

export interface TraceStep {
  /** the node that was just worked out */
  node: Node
  value?: PyVal
  error?: PyError | Unsupported
}

/**
 * Evaluate in Python's order (left operand, right operand, then the operator) and record one
 * step per operator/call. Stops at the first error, which is the last step.
 */
export function trace(root: Node): { steps: TraceStep[]; out: string[]; result?: PyVal; error?: PyError | Unsupported } {
  const steps: TraceStep[] = []
  const out: string[] = []
  const ev = (n: Node): PyVal => {
    switch (n.kind) {
      case 'lit':
        return n.value
      case 'name': {
        const e = nameError(n.name)
        steps.push({ node: n, error: e })
        throw e
      }
      case 'unary': {
        const a = ev(n.arg)
        return record(n, () => unop(n.op, a))
      }
      case 'bin': {
        const a = ev(n.left)
        const b = ev(n.right)
        return record(n, () => binop(n.op, a, b))
      }
      case 'call': {
        if (!SUPPORTED_FNS.includes(n.fn)) {
          const e = OTHER_BUILTINS.includes(n.fn)
            ? new Unsupported(`${n.fn}() is a real Python function, but this mini box only knows ${SUPPORTED_FNS.map((f) => f + '()').join(', ')}.`)
            : nameError(n.fn)
          steps.push({ node: n, error: e })
          throw e
        }
        const args = n.args.map(ev)
        return record(n, () => callFn(n.fn, args, out))
      }
    }
  }
  const record = (n: Node, f: () => PyVal): PyVal => {
    try {
      const v = f()
      steps.push({ node: n, value: v })
      return v
    } catch (e) {
      if (e instanceof PyError || e instanceof Unsupported) steps.push({ node: n, error: e })
      throw e
    }
  }
  try {
    const result = ev(root)
    return { steps, out, result }
  } catch (e) {
    if (e instanceof PyError || e instanceof Unsupported) return { steps, out, error: e }
    throw e
  }
}

/** Parse and evaluate one line, like a notebook cell. */
export function run(src: string): { out: string[]; result?: PyVal; shown?: string; error?: PyError | Unsupported } {
  let root: Node
  try {
    root = parse(src)
  } catch (e) {
    if (e instanceof PyError || e instanceof Unsupported) return { out: [], error: e }
    throw e
  }
  const r = trace(root)
  if (r.error) return { out: r.out, error: r.error }
  try {
    return { out: r.out, result: r.result, shown: r.result && r.result.t !== 'none' ? repr(r.result) : undefined }
  } catch (e) {
    if (e instanceof PyError) return { out: r.out, error: e }
    throw e
  }
}
