import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Figure, Segmented, Button, usePlayer, PlayerControls } from '../../../../../kit'
import { Console, MONO, useFitFont, type ConsoleLine } from '../references-mutability/pyviz'

/*
  Method lookup along the inheritance chain. Python looks for a method on the object's own
  class first, then walks up to the parent, then to `object`. Click a call and watch the search.
  Key aha: describe() lives in Model, but its self.kind() starts the search again at Baseline.
*/

type Cls = 'object' | 'Model' | 'Baseline'
type Who = 'b' | 'm'

interface Method {
  name: string
  lines: string[]
}

const CLASSES: { id: Cls; head: string; methods: Method[]; note?: string }[] = [
  { id: 'object', head: 'class object:', note: "Python's built-in root class (__eq__, __repr__, …)", methods: [] },
  {
    id: 'Model',
    head: 'class Model:',
    methods: [
      { name: '__init__', lines: ['def __init__(self, name):', '    self.name = name'] },
      { name: 'fit', lines: ['def fit(self, X, y):', '    self.trained = True'] },
      { name: 'kind', lines: ['def kind(self):', '    return "generic model"'] },
      { name: 'describe', lines: ['def describe(self):', '    return self.name + ": " + self.kind()'] },
    ],
  },
  {
    id: 'Baseline',
    head: 'class Baseline(Model):',
    methods: [{ name: 'kind', lines: ['def kind(self):', '    return "mean baseline"'] }],
  },
]

interface Step {
  cls: Cls
  method: string
  found: boolean
  note: string
}

interface Call {
  label: string
  steps: Step[]
  result: ConsoleLine[]
  summary: string
  sets?: 'trained'
}

function chain(start: Cls): Cls[] {
  return start === 'Baseline' ? ['Baseline', 'Model', 'object'] : ['Model', 'object']
}

function lookup(start: Cls, method: string, why: string): Step[] {
  const out: Step[] = []
  for (const c of chain(start)) {
    const has = CLASSES.find((k) => k.id === c)!.methods.some((m) => m.name === method)
    out.push({
      cls: c,
      method,
      found: has,
      note: has
        ? `${why}Found ${method} in ${c}${c === start ? ', the object’s own class' : ''}. Its code runs.`
        : c === 'object'
          ? `${why}No ${method} in object either. There is nowhere left to look.`
          : `${why}No ${method} in ${c}, so Python moves up to ${c === 'Baseline' ? 'the parent class, Model' : 'object'}.`,
    })
    if (has) break
  }
  return out
}

function calls(who: Who): Call[] {
  const cls: Cls = who === 'b' ? 'Baseline' : 'Model'
  const nm = who === 'b' ? 'b1' : 'm1'
  const kindText = who === 'b' ? 'mean baseline' : 'generic model'
  return [
    {
      label: `${who} = ${cls}("${nm}")`,
      steps: lookup(cls, '__init__', 'Creating the object looks up __init__. '),
      result: [{ text: `>>> ${who} = ${cls}("${nm}")`, tone: 'cmd' }, { text: `# ${who}.name is now "${nm}"`, tone: 'note' }],
      summary:
        who === 'b'
          ? 'Baseline has no __init__ of its own, so it uses the one it inherits from Model, which stores self.name.'
          : 'Model’s own __init__ runs and stores self.name.',
    },
    {
      label: `${who}.fit(X, y)`,
      steps: lookup(cls, 'fit', ''),
      result: [{ text: `>>> ${who}.fit(X, y)`, tone: 'cmd' }, { text: `# ${who}.trained is now True`, tone: 'note' }],
      summary: who === 'b' ? 'Baseline reuses Model’s fit without writing it again. That is the point of inheritance.' : 'fit is Model’s own method.',
      sets: 'trained',
    },
    {
      label: `${who}.kind()`,
      steps: lookup(cls, 'kind', ''),
      result: [{ text: `>>> ${who}.kind()`, tone: 'cmd' }, { text: `'${kindText}'` }],
      summary:
        who === 'b' ? 'Baseline’s own kind is found first, so it overrides (hides) the parent’s version.' : 'A plain Model uses its own kind.',
    },
    {
      label: `${who}.describe()`,
      steps: [
        ...lookup(cls, 'describe', ''),
        ...lookup(cls, 'kind', `describe calls self.kind(). self is ${who}, a ${cls}, so the search starts again at ${cls}. `),
      ],
      result: [{ text: `>>> ${who}.describe()`, tone: 'cmd' }, { text: `'${nm}: ${kindText}'` }],
      summary:
        who === 'b'
          ? 'describe came from the parent, but kind came from the child. Parent code calling self.something() picks up the child’s override.'
          : 'Both describe and kind come from Model.',
    },
    {
      label: `${who}.save()`,
      steps: lookup(cls, 'save', ''),
      result: [
        { text: `>>> ${who}.save()`, tone: 'cmd' },
        { text: `AttributeError: '${cls}' object has no attribute 'save'`, tone: 'err' },
      ],
      summary: 'No class in the chain defines save, so Python raises AttributeError.',
    },
  ]
}

export default function InheritanceTree() {
  const [who, setWho] = useState<Who>('b')
  const [ci, setCi] = useState(3)
  const list = calls(who)
  const call = list[ci]
  const player = usePlayer({ steps: call.steps.length + 1, interval: 1100 })
  const [trained, setTrained] = useState(false)
  // the longest code line in the boxes has 41 characters; box + row padding is about 52px
  const [fitRef, fs] = useFitFont<HTMLDivElement>(41, 52)

  // At rest, show the finished search for b.describe(); after choosing another call, start from step 1.
  const prev = useRef(`${who}${ci}`)
  useEffect(() => {
    player.setStep(call.steps.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (prev.current === `${who}${ci}`) return
    prev.current = `${who}${ci}`
    player.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [who, ci])

  const done = player.step >= call.steps.length
  const visible = call.steps.slice(0, Math.min(player.step + 1, call.steps.length))
  const cur = done ? null : call.steps[player.step]

  useEffect(() => {
    if (done && call.sets === 'trained') setTrained(true)
  }, [done, call.sets])

  const status = (c: Cls): { text: string; tone: 'found' | 'miss' | 'none' } => {
    const hits = visible.filter((s) => s.cls === c)
    if (!hits.length) return { text: '', tone: 'none' }
    const lastHit = hits[hits.length - 1]
    return lastHit.found ? { text: `found ${lastHit.method}`, tone: 'found' } : { text: `no ${lastHit.method} here`, tone: 'miss' }
  }

  const isRunning = (c: Cls, m: string) => visible.some((s) => s.cls === c && s.method === m && s.found)
  const objCls: Cls = who === 'b' ? 'Baseline' : 'Model'

  const box = (c: Cls, faded: boolean): CSSProperties => {
    const st = status(c)
    const isCur = cur?.cls === c
    return {
      border: `2px ${c === 'object' ? 'dashed' : 'solid'} ${st.tone === 'found' ? 'var(--viz-pos)' : isCur ? 'var(--accent)' : 'var(--rule)'}`,
      borderRadius: 12,
      padding: '0.45rem 0.65rem',
      background: st.tone === 'found' ? 'color-mix(in srgb, var(--viz-pos) 9%, var(--surface))' : 'var(--surface)',
      opacity: faded ? 0.38 : 1,
      transition: 'all 0.3s',
      minWidth: 0,
    }
  }

  return (
    <Figure
      title="Where does Python find a method?"
      caption={
        <>
          Pick an object and a call, then press <b>Play</b> or <b>Next</b>. Python searches the object's own class first, then its parent, then <code>object</code>, and runs
          the first match. Watch <code>b.describe()</code>: its code lives in <code>Model</code>, yet the <code>self.kind()</code> inside it finds the child's version.
        </>
      }
    >
      <Segmented
        label="Object"
        value={who}
        onChange={(v) => {
          setWho(v)
          setTrained(false)
        }}
        options={[
          { value: 'b', label: 'b = Baseline("b1")' },
          { value: 'm', label: 'm = Model("m1")' },
        ]}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, width: '100%' }}>
        {list.map((c, i) => (
          <Button key={c.label} primary={i === ci} onClick={() => (i === ci ? player.reset() : setCi(i))}>
            <span style={{ fontFamily: MONO }}>{c.label}</span>
          </Button>
        ))}
      </div>
      <div ref={fitRef} style={{ width: '100%', display: 'grid', gap: 6 }}>
        {CLASSES.map((k, idx) => {
          const st = status(k.id)
          const outside = who === 'm' && k.id === 'Baseline'
          return (
            <div key={k.id} style={{ display: 'grid', gap: 6 }}>
              <div style={box(k.id, outside)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{k.head}</span>
                  {st.text && (
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: st.tone === 'found' ? 'var(--viz-pos)' : 'var(--viz-neg)' }}>
                      {st.tone === 'found' ? '✓ ' : '✗ '}
                      {st.text}
                    </span>
                  )}
                  {outside && <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>not searched: m is a plain Model</span>}
                </div>
                {k.note && <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{k.note}</div>}
                <div style={{ display: 'grid', gap: 4, marginTop: k.methods.length ? 6 : 0, overflowX: 'auto' }}>
                  {k.methods.map((m) => {
                    const run = isRunning(k.id, m.name)
                    const overridden = k.id === 'Baseline' && m.name === 'kind'
                    return (
                      <div
                        key={m.name}
                        style={{
                          fontFamily: MONO,
                          fontSize: fs,
                          lineHeight: 1.5,
                          whiteSpace: 'pre',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 6,
                          minWidth: 'max-content',
                          background: run ? 'var(--highlight-soft)' : 'var(--surface-2)',
                          boxShadow: run ? 'inset 3px 0 0 var(--highlight)' : overridden ? 'inset 3px 0 0 var(--viz-2)' : undefined,
                          color: 'var(--ink)',
                        }}
                      >
                        {overridden && (
                          <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--viz-2)', fontWeight: 700 }}>overrides Model.kind</span>
                        )}
                        {m.lines.join('\n')}
                      </div>
                    )
                  })}
                </div>
              </div>
              {idx < CLASSES.length - 1 && (
                <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1 }}>
                  ▲ {CLASSES[idx + 1].id} inherits from {k.id}
                </div>
              )}
            </div>
          )
        })}
        <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1 }}>▲ search starts at the object's class: type({who}) is {objCls}</div>
        <div
          style={{
            border: '2px solid var(--viz-2)',
            borderRadius: 12,
            padding: '0.4rem 0.65rem',
            fontFamily: MONO,
            fontSize: 13.5,
            background: 'color-mix(in srgb, var(--viz-2) 7%, var(--surface))',
          }}
        >
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{who}</span> → {objCls} object{'   '}
          <span style={{ color: 'var(--ink-3)' }}>name</span> "{who === 'b' ? 'b1' : 'm1'}"
          {trained && (
            <>
              {'   '}
              <span style={{ color: 'var(--ink-3)' }}>trained</span> True
            </>
          )}
        </div>
      </div>
      <div style={{ width: '100%', fontSize: 14, lineHeight: 1.5, background: 'var(--surface-2)', borderRadius: 8, padding: '0.5rem 0.7rem', minHeight: '3.2em' }}>
        {done ? (
          <>
            <b>Result.</b> {call.summary}
          </>
        ) : (
          cur?.note
        )}
      </div>
      <Console lines={done ? call.result : [call.result[0]]} minLines={2} />
      <PlayerControls player={player} label={(k) => (k >= call.steps.length ? 'done' : `search step ${k + 1} of ${call.steps.length}`)} />
    </Figure>
  )
}
