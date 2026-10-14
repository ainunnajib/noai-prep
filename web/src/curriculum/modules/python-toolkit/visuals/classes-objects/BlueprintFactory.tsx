import { useEffect, useState, type CSSProperties } from 'react'
import { Figure, Controls, Segmented, Slider, Button } from '../../../../../kit'
import { CodeView, MONO } from '../references-mutability/pyviz'

/*
  One class, many objects. The class card is the blueprint; pressing "Create" runs
  Student(name, score) step by step (empty object -> __init__ fills self.name, self.score
  -> the new name points at it). Click any object to inspect it and to run .passed().
*/

const CODE = `class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score

    def passed(self):
        return self.score >= 50`

interface Obj {
  v: string
  name: string
  score: number
}

const START: Obj[] = [
  { v: 's1', name: 'Aisha', score: 81 },
  { v: 's2', name: 'Ben', score: 45 },
]
const NAMES = ['Chen', 'Divya', 'Farid', 'Mei']
const MAX = 5

const BUILD_NOTES = [
  'Python makes a new, empty Student object, then calls __init__ with self = that new object.',
  'self.name = name stores the first attribute on this object.',
  'self.score = score stores the second attribute on this object.',
  '__init__ is done. The new name now points at the finished object.',
]

export default function BlueprintFactory() {
  const [objs, setObjs] = useState<Obj[]>(START)
  const [sel, setSel] = useState(0)
  const [name, setName] = useState('Chen')
  const [score, setScore] = useState(64)
  const [build, setBuild] = useState<{ idx: number; step: number } | null>(null)

  useEffect(() => {
    if (!build || build.step >= 3) return
    const t = window.setTimeout(() => setBuild({ idx: build.idx, step: build.step + 1 }), 900)
    return () => window.clearTimeout(t)
  }, [build])

  const nextVar = `s${objs.length + 1}`
  const create = () => {
    if (objs.length >= MAX) return
    const idx = objs.length
    setObjs([...objs, { v: nextVar, name, score }])
    setSel(idx)
    setBuild({ idx, step: 0 })
  }
  const reset = () => {
    setObjs(START)
    setSel(0)
    setBuild(null)
  }

  const building = build && build.step < 3
  const active = building ? [build!.step + 2] : build ? [] : [7]
  const o = objs[sel]
  const shownRows = (i: number) => (build && build.idx === i ? build.step : 3)

  const card = (selected: boolean, fresh: boolean): CSSProperties => ({
    textAlign: 'left',
    font: 'inherit',
    color: 'var(--ink)',
    cursor: 'pointer',
    borderRadius: 12,
    padding: '0.5rem 0.65rem',
    minWidth: 128,
    flex: '1 1 128px',
    maxWidth: 190,
    background: fresh ? 'color-mix(in srgb, var(--viz-2) 12%, var(--surface))' : 'var(--surface)',
    border: `2px solid ${selected ? 'var(--accent)' : 'var(--rule)'}`,
    boxShadow: selected ? '0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent)' : undefined,
    transition: 'all 0.25s',
  })

  return (
    <Figure
      title="One blueprint, many objects"
      caption={
        <>
          Choose a name and a score, then press <b>Create</b> and watch <code>__init__</code> fill in the new object one attribute at a time. Click any object card to
          inspect it: every object has its own <code>name</code> and <code>score</code>, and <code>passed()</code> reads the score of whichever object it is called on.
        </>
      }
    >
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 270px), 1fr))', gap: 12, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 8, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--viz-1)' }}>The class: a blueprint (it stores no student data itself)</div>
          <CodeView code={CODE} active={active} fontSize={12.5} />
          <div style={{ fontSize: 14, lineHeight: 1.5, background: 'var(--surface-2)', borderRadius: 8, padding: '0.45rem 0.65rem', minHeight: '3em' }}>
            {building || (build && build.step === 3) ? (
              <>
                <b>Step {build!.step + 1} of 4.</b> {BUILD_NOTES[build!.step]}
              </>
            ) : (
              <>
                Line 7 is the method <code>passed</code>. It works for any object, because <code>self</code> is whichever object you call it on.
              </>
            )}
          </div>
        </div>
        <div style={{ display: 'grid', gap: 8, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--viz-2)' }}>The objects (instances) made from it</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {objs.map((ob, i) => {
              const rows = shownRows(i)
              const fresh = Boolean(build && build.idx === i && build.step < 3)
              return (
                <button key={ob.v} type="button" style={card(i === sel, fresh)} onClick={() => {
                    setSel(i)
                    if (!building) setBuild(null)
                  }} aria-pressed={i === sel} aria-label={`Inspect ${ob.v}`}>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 700, marginBottom: 4 }}>
                    <span style={{ fontFamily: MONO, color: build && build.idx === i && build.step < 3 ? 'var(--ink-3)' : 'var(--accent)', fontSize: 14 }}>
                      {build && build.idx === i && build.step < 3 ? '…' : ob.v}
                    </span>{' '}
                    → Student object
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 13.5, lineHeight: 1.6, minHeight: '3.2em' }}>
                    {rows >= 1 ? (
                      <div>
                        <span style={{ color: 'var(--ink-3)' }}>name </span>'{ob.name}'
                      </div>
                    ) : (
                      <div style={{ color: 'var(--ink-3)', fontStyle: 'italic', fontFamily: 'var(--font-body)', fontSize: 12.5 }}>empty object</div>
                    )}
                    {rows >= 2 && (
                      <div>
                        <span style={{ color: 'var(--ink-3)' }}>score </span>
                        {ob.score}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
          <div style={{ border: '1px solid var(--rule)', borderRadius: 10, padding: '0.5rem 0.7rem', background: 'var(--surface-2)', fontSize: 14, lineHeight: 1.55 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              Inspecting <code>{o.v}</code>
            </div>
            <div style={{ fontFamily: MONO, fontSize: 13.5 }}>
              <div>
                {o.v}.name <span style={{ color: 'var(--ink-3)' }}>→</span> '{o.name}'
              </div>
              <div>
                {o.v}.score <span style={{ color: 'var(--ink-3)' }}>→</span> {o.score}
              </div>
              <div>
                {o.v}.passed() <span style={{ color: 'var(--ink-3)' }}>→</span>{' '}
                <b style={{ color: o.score >= 50 ? 'var(--viz-pos)' : 'var(--viz-neg)' }}>{o.score >= 50 ? 'True' : 'False'}</b>
              </div>
            </div>
            <div style={{ marginTop: 6, color: 'var(--ink-2)', fontSize: 13.5 }}>
              <code>{o.v}.passed()</code> runs <code>Student.passed({o.v})</code>, so <code>self</code> is {o.v} and <code>self.score</code> is {o.score}:{' '}
              {o.score} &gt;= 50 is {o.score >= 50 ? 'True' : 'False'}.
            </div>
          </div>
        </div>
      </div>
      <Controls>
        <Segmented label="name" value={name} onChange={setName} options={NAMES.map((n) => ({ value: n, label: n }))} />
        <Slider label="score" value={score} min={0} max={100} step={1} onChange={setScore} />
        {objs.length < MAX ? (
          <Button primary onClick={create} disabled={Boolean(building)}>
            Create {nextVar} = Student('{name}', {score})
          </Button>
        ) : (
          <Button onClick={reset}>Reset to two objects</Button>
        )}
      </Controls>
    </Figure>
  )
}
