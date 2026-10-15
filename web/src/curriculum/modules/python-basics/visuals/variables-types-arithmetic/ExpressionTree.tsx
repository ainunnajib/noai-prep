import { useMemo, useState, type ReactNode } from 'react'
import { Figure, Button, Toggle } from '../../../../../kit'
import { parse, trace, repr, typeName, PyError, Unsupported, type Node, type PyVal } from './miniPython'
import s from './viz.module.css'

/** repr() that never throws during render (huge ints raise a PyError, as in CPython's 4300-digit limit) */
function safeRepr(v: Parameters<typeof repr>[0]): string {
  try {
    return repr(v)
  } catch (e) {
    return e instanceof PyError ? `(${e.pyType}: too many digits to show)` : '?'
  }
}

/*
  An expression drawn as a tree, collapsed one operation at a time in the exact order Python
  evaluates it (left operand, right operand, then the operator). Values come from miniPython.ts.
*/

const PRESETS = ['2 + 3 * 4 ** 2', '(2 + 3) * 4 ** 2', '7 // 2 + 7 % 2', '-2 ** 2', '2 ** 3 ** 2', '10 - 4 - 3', '0.1 + 0.2', "'ha' * 3 + '!'"]

const LEVEL: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '//': 2, '%': 2, '**': 4 }

interface Placed {
  id: number
  x: number
  y: number
  label: string
  kind: 'op' | 'leaf' | 'value' | 'error'
  w: number
  children: Placed[]
}

const CHAR_W = 8.6
const GAP = 12
const ROW_H = 58
const OP_R = 18

function leafWidth(label: string) {
  return Math.max(36, label.length * CHAR_W + 16)
}

function opLabel(n: Node): string {
  if (n.kind === 'bin') return n.op
  if (n.kind === 'unary') return n.op
  if (n.kind === 'call') return `${n.fn}()`
  return ''
}

/** Lay the current (partly collapsed) tree out: leaves left to right, parents centred above. */
function layout(root: Node, done: Map<number, PyVal>, errorId: number | null) {
  let cursor = 0
  let depthMax = 0
  const place = (n: Node, depth: number): Placed => {
    depthMax = Math.max(depthMax, depth)
    const y = 26 + depth * ROW_H
    if (done.has(n.id) || n.kind === 'lit' || n.kind === 'name') {
      const label = done.has(n.id) ? safeRepr(done.get(n.id)!) : n.kind === 'lit' ? n.text : n.kind === 'name' ? n.name : ''
      const w = leafWidth(label)
      const x = cursor + w / 2
      cursor += w + GAP
      return { id: n.id, x, y, label, kind: n.id === errorId ? 'error' : done.has(n.id) ? 'value' : 'leaf', w, children: [] }
    }
    const kids = n.kind === 'bin' ? [n.left, n.right] : n.kind === 'unary' ? [n.arg] : n.kind === 'call' ? n.args : []
    if (kids.length === 0) {
      const label = opLabel(n)
      const w = leafWidth(label)
      const x = cursor + w / 2
      cursor += w + GAP
      return { id: n.id, x, y, label, kind: n.id === errorId ? 'error' : 'op', w, children: [] }
    }
    const start = cursor
    const children = kids.map((k) => place(k, depth + 1))
    const label = opLabel(n)
    const w = Math.max(OP_R * 2, label.length * CHAR_W + 14)
    const span = cursor - GAP - start
    if (span < w) {
      // the operator box is wider than everything below it: centre the subtree under it
      const shift = (w - span) / 2
      const move = (p: Placed) => {
        p.x += shift
        p.children.forEach(move)
      }
      children.forEach(move)
      cursor = start + w + GAP
    }
    const x = (children[0].x + children[children.length - 1].x) / 2
    return { id: n.id, x, y, label, kind: n.id === errorId ? 'error' : 'op', w, children }
  }
  const tree = place(root, 0)
  return { tree, width: Math.max(cursor - GAP, 60), height: 26 + depthMax * ROW_H + 26 }
}

function parentsOf(root: Node) {
  const m = new Map<number, Node>()
  const walk = (n: Node) => {
    const kids = n.kind === 'bin' ? [n.left, n.right] : n.kind === 'unary' ? [n.arg] : n.kind === 'call' ? n.args : []
    kids.forEach((k) => {
      m.set(k.id, n)
      walk(k)
    })
  }
  walk(root)
  return m
}

/** Source text of the partly evaluated expression, with the next operation highlighted. */
function exprText(n: Node, done: Map<number, PyVal>, nextId: number | null, lastId: number | null, keepNegParen = false): ReactNode {
  if (done.has(n.id)) {
    const v = safeRepr(done.get(n.id)!)
    const shown = keepNegParen && v.startsWith('-') ? `(${v})` : v
    return n.id === lastId ? <span className={s.hlDone}>{shown}</span> : shown
  }
  let inner: ReactNode
  switch (n.kind) {
    case 'lit':
      inner = n.text
      break
    case 'name':
      inner = n.name
      break
    case 'unary':
      inner = (
        <>
          {n.op}
          {exprText(n.arg, done, nextId, lastId)}
        </>
      )
      break
    case 'bin':
      inner = (
        <>
          {exprText(n.left, done, nextId, lastId, n.op === '**' && n.left.paren > 0)} {n.op} {exprText(n.right, done, nextId, lastId)}
        </>
      )
      break
    case 'call':
      inner = (
        <>
          {n.fn}(
          {n.args.map((a, i) => (
            <span key={a.id}>
              {i > 0 && ', '}
              {exprText(a, done, nextId, lastId)}
            </span>
          ))}
          )
        </>
      )
      break
  }
  for (let i = 0; i < n.paren; i++) inner = <>({inner})</>
  return n.id === nextId ? <span className={s.hlNext}>{inner}</span> : inner
}

/** Python's hidden brackets: every operation wrapped in its own pair. */
function fullBrackets(n: Node, top = true): string {
  switch (n.kind) {
    case 'lit':
      return n.text
    case 'name':
      return n.name
    case 'unary':
      return top ? `${n.op}${fullBrackets(n.arg, false)}` : `(${n.op}${fullBrackets(n.arg, false)})`
    case 'bin': {
      const body = `${fullBrackets(n.left, false)} ${n.op} ${fullBrackets(n.right, false)}`
      return top ? body : `(${body})`
    }
    case 'call':
      return `${n.fn}(${n.args.map((a) => fullBrackets(a, true)).join(', ')})`
  }
}

/** Original source text of a node (with its own brackets). */
function srcOf(n: Node): string {
  const inner = n.kind === 'lit' ? n.text : n.kind === 'name' ? n.name : fullBrackets({ ...n, paren: 0 } as Node, true)
  return n.paren > 0 ? `(${inner})` : inner
}

function reason(n: Node, parent: Node | undefined): string {
  if (n.paren > 0) return 'It is inside brackets, so it goes first.'
  if (n.kind === 'call') return `A function call runs as soon as its input is ready.`
  if (n.kind === 'unary')
    return n.arg.kind === 'bin' && n.arg.op === '**' ? 'Only now does the leading minus apply: ** binds tighter than a minus sign in front.' : 'Apply the minus sign.'
  if (n.kind !== 'bin') return ''
  if (n.op === '**' && parent?.kind === 'unary' && parent.op === '-')
    return '** binds tighter than a minus sign in front, so the power goes first: this means -(2 ** 2), not (-2) ** 2.'.replace('2 ** 2', `${srcOf(n.left)} ** ${srcOf(n.right)}`).replace('(-2) ** 2', `(-${srcOf(n.left)}) ** ${srcOf(n.right)}`)
  if (n.op === '**' && parent?.kind === 'bin' && parent.op === '**' && parent.right === n) return '** is the exception that works right to left, so the right-hand power goes first.'
  if (parent?.kind === 'bin' && LEVEL[parent.op] === LEVEL[n.op] && parent.left === n) return 'Same level as the operator after it, so Python works from left to right.'
  if (n.op === '**') return '** (power) comes before * / // % and before + −.'
  if (LEVEL[n.op] === 2) return '* / // % come before + and −.'
  return parent ? '+ and − come last.' : 'This is the last operation.'
}

export default function ExpressionTree() {
  const [src, setSrc] = useState(PRESETS[0])
  const [draft, setDraft] = useState(PRESETS[0])
  const [step, setStep] = useState(0)
  const [full, setFull] = useState(false)

  const parsed = useMemo(() => {
    try {
      const root = parse(src)
      return { root, ...trace(root), parents: parentsOf(root) }
    } catch (e) {
      if (e instanceof PyError || e instanceof Unsupported) return { error: e }
      throw e
    }
  }, [src])

  const load = (t: string) => {
    setSrc(t)
    setDraft(t)
    setStep(0)
  }

  let body: ReactNode
  if (!('root' in parsed)) {
    body = (
      <div className={`${s.status} ${s.bad}`}>
        {parsed.error instanceof PyError ? `${parsed.error.pyType}: ${parsed.error.message}` : parsed.error?.message}
      </div>
    )
  } else {
    const { root, steps, parents } = parsed
    const n = steps.length
    const k = Math.min(step, n)
    const done = new Map<number, PyVal>()
    let errorId: number | null = null
    steps.slice(0, k).forEach((st) => {
      if (st.value) done.set(st.node.id, st.value)
      if (st.error) errorId = st.node.id
    })
    const next = k < n ? steps[k] : null
    const last = k > 0 ? steps[k - 1] : null
    const { tree, width, height } = layout(root, done, errorId)
    const W = width + 24
    const finalVal = k === n && parsed.result ? parsed.result : null
    const err = k === n && steps[n - 1]?.error ? steps[n - 1].error : null

    const nodes: ReactNode[] = []
    const edges: ReactNode[] = []
    const walk = (p: Placed) => {
      p.children.forEach((c) => {
        edges.push(<line key={`e${c.id}`} x1={p.x + 12} y1={p.y + OP_R} x2={c.x + 12} y2={c.y - 15} style={{ stroke: 'var(--viz-axis)', strokeWidth: 1.6 }} />)
        walk(c)
      })
      const isNext = next?.node.id === p.id
      const isLast = last?.node.id === p.id && p.kind === 'value'
      const cx = p.x + 12
      if (p.kind === 'op') {
        nodes.push(
          <g key={p.id}>
            <rect
              x={cx - p.w / 2}
              y={p.y - OP_R}
              width={p.w}
              height={OP_R * 2}
              rx={OP_R}
              style={{ fill: isNext ? 'var(--highlight)' : 'var(--surface)', stroke: isNext ? 'var(--slate)' : 'var(--viz-axis)', strokeWidth: isNext ? 2 : 1.5 }}
            />
            <text x={cx} y={p.y + 5} textAnchor="middle" className={s.svgMono} style={{ fill: isNext ? 'var(--slate)' : 'var(--ink)', fontSize: 15, fontWeight: 800 }}>
              {p.label}
            </text>
          </g>,
        )
      } else {
        const colour = p.kind === 'error' ? 'var(--viz-neg)' : p.kind === 'value' ? 'var(--viz-3)' : 'var(--ink-3)'
        nodes.push(
          <g key={p.id}>
            <rect
              x={cx - p.w / 2}
              y={p.y - 15}
              width={p.w}
              height={30}
              rx={7}
              style={{
                fill: p.kind === 'error' ? 'var(--bad-soft)' : isLast ? 'color-mix(in srgb, var(--viz-3) 22%, var(--surface))' : 'var(--surface-2)',
                stroke: colour,
                strokeWidth: isLast || p.kind === 'error' ? 2.4 : 1.4,
              }}
            />
            <text x={cx} y={p.y + 5} textAnchor="middle" className={s.svgMono} style={{ fill: p.kind === 'error' ? 'var(--viz-neg)' : 'var(--ink)', fontSize: 14, fontWeight: 700 }}>
              {p.kind === 'error' ? '✗ ' + p.label : p.label}
            </text>
          </g>,
        )
      }
    }
    walk(tree)

    const nextNode = next?.node
    const nextParent = nextNode ? parents.get(nextNode.id) : undefined
    let status: ReactNode
    if (next && nextNode) {
      const preview = next.error ? `${next.error instanceof PyError ? next.error.pyType : 'error'}` : safeRepr(next.value!)
      status = (
        <>
          <strong>Next:</strong> the highlighted part{next.error ? ' raises ' : ' gives '}
          <code>{preview}</code>. {reason(nextNode, nextParent)}
        </>
      )
    } else if (err) {
      status = (
        <>
          <strong>{err instanceof PyError ? `${err.pyType}: ${err.message}` : err.message}</strong> Python stops here, so there is no result.
        </>
      )
    } else if (finalVal) {
      status = (
        <>
          <strong>Done:</strong> the result is <code>{safeRepr(finalVal)}</code>, of type <code>{typeName(finalVal)}</code>.
          {n === 0 ? ' There was nothing to work out.' : ` Python needed ${n} step${n === 1 ? '' : 's'}.`}
        </>
      )
    }

    body = (
      <>
        <div className={s.exprLine} aria-live="polite">
          <span className={s.exprLabel}>The expression now</span>
          {exprText(root, done, nextNode?.id ?? null, last?.node.id ?? null)}
        </div>
        <div className={s.treeBox}>
          <svg className={s.svg} viewBox={`0 0 ${W} ${height}`} style={{ maxWidth: W }} role="img" aria-label={`Expression tree for ${src}, step ${k} of ${n}`}>
            {edges}
            {nodes}
          </svg>
        </div>
        <div className={`${s.status} ${err ? s.bad : finalVal ? s.good : ''}`}>{status}</div>
        <div className={s.btnRow}>
          <Button onClick={() => setStep(0)} disabled={k === 0}>
            Restart
          </Button>
          <Button onClick={() => setStep(k - 1)} disabled={k === 0}>
            Back
          </Button>
          <Button primary onClick={() => setStep(k + 1)} disabled={k >= n}>
            Next step
          </Button>
          <Button onClick={() => setStep(n)} disabled={k >= n}>
            Run all
          </Button>
          <span className={s.spacer} />
          <Toggle label="Show Python's hidden brackets" checked={full} onChange={setFull} />
        </div>
        {full && (
          <div className={s.exprLine}>
            <span className={s.exprLabel}>How Python groups it</span>
            {fullBrackets(root)}
          </div>
        )}
      </>
    )
  }

  return (
    <Figure
      title="Watch Python evaluate an expression"
      caption={
        <>
          Press <strong>Next step</strong> to collapse the tree one operation at a time, in the exact order Python uses. Then try the other examples
          (compare the first two: brackets reshape the tree) or type your own expression with <code>+ - * / // % **</code> and brackets.
        </>
      }
      wide
    >
      <div className={s.wrap}>
        <div className={s.chips} role="group" aria-label="Example expressions">
          {PRESETS.map((p) => (
            <button key={p} type="button" className={`${s.chip} ${s.codeChip} ${p === src ? s.chipOn : ''}`} aria-pressed={p === src} onClick={() => load(p)}>
              {p}
            </button>
          ))}
        </div>
        <form
          className={s.prompt}
          onSubmit={(e) => {
            e.preventDefault()
            if (draft.trim()) load(draft.trim())
          }}
        >
          <span className={s.promptSign} aria-hidden="true">
            &gt;&gt;&gt;
          </span>
          <input
            className={s.input}
            value={draft}
            maxLength={60}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-label="Expression to evaluate"
            onChange={(e) => setDraft(e.target.value)}
          />
          <Button primary onClick={() => draft.trim() && load(draft.trim())} disabled={!draft.trim()}>
            Draw
          </Button>
        </form>
        {body}
      </div>
    </Figure>
  )
}
