import { useState, type CSSProperties, type ReactNode } from 'react'
import { Figure, Segmented, Button } from '../../../../../kit'
import { Console, MONO, useFitFont, type ConsoleLine } from '../references-mutability/pyviz'

/*
  An abstract base class is a template with blanks. Loss(ABC) has two abstract methods
  (dashed slots) and one concrete, shared method (step). Children fill the slots.
  Creating Loss or an incomplete child raises TypeError; a complete child works, and
  step (base code) calls self.gradient (child code).
*/

type Child = 'l2' | 'l1' | 'half'

const CHILD: Record<Child, { cls: string; value?: string; gradient?: string; v: (y: number, p: number) => number; g?: (y: number, p: number) => number }> = {
  l2: { cls: 'L2Loss', value: 'return (p - y) ** 2 / 2', gradient: 'return p - y', v: (y, p) => (p - y) ** 2 / 2, g: (y, p) => p - y },
  // the sign of p - y: 1, 0 or -1 (True counts as 1, False as 0), like np.sign(p - y)
  l1: { cls: 'L1Loss', value: 'return abs(p - y)', gradient: 'return (p > y) - (p < y)', v: (y, p) => Math.abs(p - y), g: (y, p) => (p > y ? 1 : 0) - (p < y ? 1 : 0) },
  half: { cls: 'HalfLoss', value: 'return abs(p - y)', v: (y, p) => Math.abs(p - y) },
}

const Y = 5
const P = 2
const LR = 0.5
const num = (x: number) => (Number.isInteger(x) ? String(x) : String(Math.round(x * 1e6) / 1e6))

type Slot = 'value' | 'gradient' | 'step'

function Row({ children, kind, hl, badge, minH = 62, fs = 12.5 }: { children: ReactNode; kind: 'abstract' | 'concrete' | 'missing' | 'inherited'; hl?: boolean; badge?: string; minH?: number; fs?: number }) {
  const border =
    kind === 'abstract' ? '2px dashed var(--viz-5)' : kind === 'missing' ? '2px dashed var(--viz-neg)' : kind === 'inherited' ? '1.5px dotted var(--rule)' : '1.5px solid var(--rule)'
  const bg = hl
    ? 'var(--highlight-soft)'
    : kind === 'abstract'
      ? 'color-mix(in srgb, var(--viz-5) 7%, var(--surface))'
      : kind === 'missing'
        ? 'color-mix(in srgb, var(--viz-neg) 8%, var(--surface))'
        : 'var(--surface-2)'
  const style: CSSProperties = {
    position: 'relative',
    border,
    background: bg,
    boxShadow: hl ? 'inset 3px 0 0 var(--highlight)' : undefined,
    borderRadius: 8,
    padding: '0.35rem 0.45rem',
    minHeight: minH,
    fontFamily: MONO,
    fontSize: fs,
    lineHeight: 1.5,
    whiteSpace: 'pre',
    overflowX: 'auto',
    color: 'var(--ink)',
    transition: 'all 0.25s',
  }
  return (
    <div style={style}>
      {badge && (
        <span
          style={{
            position: 'absolute',
            top: 4,
            right: 6,
            fontFamily: 'var(--font-body)',
            fontSize: 11.5,
            fontWeight: 700,
            color: 'var(--on-highlight)',
            background: 'var(--highlight)',
            borderRadius: 999,
            padding: '0 0.45rem',
          }}
        >
          {badge}
        </span>
      )}
      {children}
    </div>
  )
}

const tag = (t: string, colour: string) => <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 700, color: colour }}>{t}</span>

export default function AbstractTemplate() {
  const [child, setChild] = useState<Child>('l2')
  const [made, setMade] = useState<Child | null>(null)
  const [log, setLog] = useState<ConsoleLine[]>([{ text: '# create an object to see what Python allows', tone: 'note' }])
  const [hl, setHl] = useState<{ base: Partial<Record<Slot, string>>; child: Partial<Record<Slot, string>> }>({ base: {}, child: {} })

  const c = CHILD[child]
  // longest code line: "    return p - lr * self.gradient(y, p)" (39 chars); card + row padding about 46px
  const [fitRef, fs] = useFitFont<HTMLDivElement>(39, 46)
  const push = (lines: ConsoleLine[]) => setLog((l) => [...l, ...lines].slice(-6))

  const makeBase = () => {
    setMade(null)
    setHl({ base: {}, child: {} })
    push([
      { text: '>>> loss = Loss()', tone: 'cmd' },
      { text: "TypeError: Can't instantiate abstract class Loss without an implementation for abstract methods 'gradient', 'value'", tone: 'err' },
    ])
  }
  const makeChild = () => {
    setHl({ base: {}, child: {} })
    if (!c.gradient) {
      setMade(null)
      push([
        { text: `>>> loss = ${c.cls}()`, tone: 'cmd' },
        { text: `TypeError: Can't instantiate abstract class ${c.cls} without an implementation for abstract method 'gradient'`, tone: 'err' },
      ])
    } else {
      setMade(child)
      push([
        { text: `>>> loss = ${c.cls}()`, tone: 'cmd' },
        { text: '# works: every blank is filled in', tone: 'ok' },
      ])
    }
  }
  const callValue = () => {
    setHl({ base: {}, child: { value: '1' } })
    push([{ text: `>>> loss.value(${Y}, ${P})`, tone: 'cmd' }, { text: num(c.v(Y, P)) }])
  }
  const callStep = () => {
    const g = c.g!(Y, P)
    setHl({ base: { step: '1 runs' }, child: { gradient: '2 called' } })
    push([
      { text: `>>> loss.step(${Y}, ${P}, ${LR})`, tone: 'cmd' },
      { text: `# self.gradient(${Y}, ${P}) = ${num(g)}, so ${P} - ${LR} * (${num(g)}) = ${num(P - LR * g)}`, tone: 'note' },
      { text: num(P - LR * g) },
    ])
  }

  const canCall = made === child

  return (
    <Figure
      title="An abstract base class is a template with blanks"
      caption={
        <>
          Dashed slots are <b>abstract methods</b>: blanks every subclass must fill in. Try to create <code>Loss()</code>, then the incomplete <code>HalfLoss()</code>,
          then a complete child. With a complete child, call <code>step</code>: the shared code in the base class runs first, and its <code>self.gradient(...)</code> call
          lands in the child's code.
        </>
      }
    >
      <Segmented
        label="Subclass"
        value={child}
        onChange={(v) => {
          setChild(v)
          setHl({ base: {}, child: {} })
        }}
        options={[
          { value: 'l2', label: 'L2Loss' },
          { value: 'l1', label: 'L1Loss' },
          { value: 'half', label: 'HalfLoss' },
        ]}
      />
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 12 }}>
        <div ref={fitRef} style={{ border: '2px solid var(--viz-5)', borderRadius: 12, padding: '0.5rem 0.4rem', display: 'grid', gap: 6, alignContent: 'start', minWidth: 0 }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14 }}>
            class Loss(ABC): <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-3)', fontWeight: 400 }}>the template</span>
          </div>
          <Row fs={fs} kind="abstract">
            {tag('blank: subclasses must write it', 'var(--viz-5)')}
            {'\n@abstractmethod\ndef value(self, y, p): ...'}
          </Row>
          <Row fs={fs} kind="abstract">
            {tag('blank: subclasses must write it', 'var(--viz-5)')}
            {'\n@abstractmethod\ndef gradient(self, y, p): ...'}
          </Row>
          <Row fs={fs} kind="concrete" hl={Boolean(hl.base.step)} badge={hl.base.step}>
            {tag('shared code, written once', 'var(--viz-3)')}
            {'\ndef step(self, y, p, lr):\n    return p - lr * self.gradient(y, p)'}
          </Row>
        </div>
        <div style={{ border: `2px solid ${c.gradient ? 'var(--viz-2)' : 'var(--viz-neg)'}`, borderRadius: 12, padding: '0.5rem 0.4rem', display: 'grid', gap: 6, alignContent: 'start', minWidth: 0 }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14 }}>
            class {c.cls}(Loss): <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-3)', fontWeight: 400 }}>fills the blanks</span>
          </div>
          <Row fs={fs} kind="concrete" hl={Boolean(hl.child.value)} badge={hl.child.value ? 'runs' : undefined}>
            {tag('fills value', 'var(--viz-2)')}
            {`\ndef value(self, y, p):\n    ${c.value}`}
          </Row>
          {c.gradient ? (
            <Row fs={fs} kind="concrete" hl={Boolean(hl.child.gradient)} badge={hl.child.gradient}>
              {tag(child === 'l1' ? 'fills gradient: the sign, 1, 0 or -1' : 'fills gradient', 'var(--viz-2)')}
              {`\ndef gradient(self, y, p):\n    ${c.gradient}`}
            </Row>
          ) : (
            <Row fs={fs} kind="missing">
              {tag('still blank: gradient was never written', 'var(--viz-neg)')}
              {'\n\n'}
            </Row>
          )}
          <Row fs={fs} kind="inherited">
            {tag('inherited, not rewritten', 'var(--ink-3)')}
            {'\nstep comes from Loss'}
          </Row>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, width: '100%' }}>
        <Button onClick={makeBase}>
          <span style={{ fontFamily: MONO }}>Loss()</span>
        </Button>
        <Button primary onClick={makeChild}>
          <span style={{ fontFamily: MONO }}>{c.cls}()</span>
        </Button>
        <Button onClick={callValue} disabled={!canCall}>
          <span style={{ fontFamily: MONO }}>loss.value({Y}, {P})</span>
        </Button>
        <Button onClick={callStep} disabled={!canCall}>
          <span style={{ fontFamily: MONO }}>
            loss.step({Y}, {P}, {LR})
          </span>
        </Button>
      </div>
      <Console lines={log} title="console" minLines={3} />
    </Figure>
  )
}
