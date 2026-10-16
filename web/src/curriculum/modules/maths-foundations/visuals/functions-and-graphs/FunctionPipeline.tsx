import { Fragment, useEffect, useMemo, useState } from 'react'
import { Figure, Controls, Slider, Button, M } from '../../../../../kit'
import { parse, evaluate, toTex, pyDef, fmt, fmtTex, type Node } from './formula'
import s from './FunctionPipeline.module.css'

/*
  Two function "machines" in a pipeline. A ball carrying the input drops through the first
  machine, comes out as a new number, and drops through the second. The learner can change the
  input, type new formulas, and swap the order to compare f(g(x)) with g(f(x)).
*/

type Parsed = { tree: Node | null; error: string | null }

function useFormula(src: string, fallback: Node): Parsed & { use: Node } {
  const parsed = useMemo<Parsed>(() => {
    try {
      return { tree: parse(src), error: null }
    } catch (e) {
      return { tree: null, error: (e as Error).message }
    }
  }, [src])
  const [lastGood, setLastGood] = useState<Node>(fallback)
  useEffect(() => {
    if (parsed.tree) setLastGood(parsed.tree)
  }, [parsed.tree])
  return { ...parsed, use: parsed.tree ?? lastGood }
}

const LAST_STAGE = 4

export default function FunctionPipeline() {
  const [x, setX] = useState(2)
  const [fSrc, setFSrc] = useState('3x + 1')
  const [gSrc, setGSrc] = useState('x^2')
  const [gFirst, setGFirst] = useState(true) // true: f(g(x)); false: g(f(x))
  const [stage, setStage] = useState(LAST_STAGE)
  const [running, setRunning] = useState(false)

  const f = useFormula(fSrc, parse('3x + 1'))
  const g = useFormula(gSrc, parse('x^2'))

  useEffect(() => {
    if (!running) return
    if (stage >= LAST_STAGE) {
      setRunning(false)
      return
    }
    const t = window.setTimeout(() => setStage((v) => v + 1), 620)
    return () => window.clearTimeout(t)
  }, [running, stage])

  const drop = () => {
    setStage(0)
    setRunning(true)
  }
  // any change shows the finished result at once (complete at rest)
  const settle = () => {
    setRunning(false)
    setStage(LAST_STAGE)
  }

  const first = gFirst ? { name: 'g', tree: g.use, cls: s.machine } : { name: 'f', tree: f.use, cls: `${s.machine} ${s.machineB}` }
  const second = gFirst ? { name: 'f', tree: f.use, cls: `${s.machine} ${s.machineB}` } : { name: 'g', tree: g.use, cls: s.machine }

  const mid = evaluate(first.tree, x)
  const out = Number.isFinite(mid) ? evaluate(second.tree, mid) : NaN
  const otherMid = evaluate(second.tree, x)
  const otherOut = Number.isFinite(otherMid) ? evaluate(first.tree, otherMid) : NaN

  const X = fmt(x)
  const comp = `${second.name}(${first.name}(${X}))`
  const compOther = `${first.name}(${second.name}(${X}))`

  const subst = (name: string, tree: Node, at: number, val: number) => {
    const sub = toTex(tree, at).s
    const plain = toTex(tree).s === 'x'
    return `${name}(${fmt(at)}) = ${plain ? '' : `${sub} = `}${fmtTex(val)}`
  }

  const ball = (idx: number, value: number, out = false) => {
    const waiting = stage < idx
    const active = running && stage === idx
    const cls = [s.ball, out ? s.ballOut : '', waiting ? s.ballWaiting : '', active ? s.ballActive : ''].join(' ')
    return (
      <div className={cls} aria-label={waiting ? 'not computed yet' : `value ${fmt(value)}`}>
        {waiting ? '?' : fmt(value)}
      </div>
    )
  }
  const pipe = (idx: number) => <div className={`${s.pipe} ${stage >= idx ? s.pipeLit : ''}`} aria-hidden="true" />
  const machine = (idx: number, m: typeof first) => (
    <div className={`${m.cls} ${running && stage === idx ? s.machineActive : ''}`}>
      <span className={s.machineName}>machine {m.name}</span>
      <span className={s.machineFormula}>
        <M>{`${m.name}(x) = ${toTex(m.tree).s}`}</M>
      </span>
    </div>
  )

  const rows: { lane: React.ReactNode; side: React.ReactNode }[] = [
    {
      lane: ball(0, x),
      side: (
        <>
          <strong>Input</strong>: the ball carries <M>{`x = ${X}`}</M>
        </>
      ),
    },
    { lane: pipe(1), side: null },
    {
      lane: machine(1, first),
      side: (
        <pre className={s.code} aria-label={`Python for ${first.name}`}>
          <code>{pyDef(first.name, first.tree)}</code>
        </pre>
      ),
    },
    { lane: pipe(2), side: null },
    {
      lane: ball(2, mid),
      side:
        stage >= 2 ? (
          <div className={s.mathLine}>
            <M>{subst(first.name, first.tree, x, mid)}</M>
          </div>
        ) : (
          <span>
            machine <strong>{first.name}</strong> is working…
          </span>
        ),
    },
    { lane: pipe(3), side: null },
    {
      lane: machine(3, second),
      side: (
        <pre className={s.code} aria-label={`Python for ${second.name}`}>
          <code>{pyDef(second.name, second.tree)}</code>
        </pre>
      ),
    },
    { lane: pipe(4), side: null },
    {
      lane: ball(4, out, true),
      side:
        stage >= 4 ? (
          <div className={s.mathLine}>
            {Number.isFinite(mid) ? <M>{subst(second.name, second.tree, mid, out)}</M> : <span>the first machine gave no number</span>}
            <div>
              so <M>{`${comp} = ${fmtTex(out)}`}</M>
            </div>
          </div>
        ) : (
          <span>
            machine <strong>{second.name}</strong> is waiting…
          </span>
        ),
    },
  ]

  return (
    <Figure
      title="Function machines in a pipeline"
      caption={
        <>
          Press <b>Drop the ball</b> and follow the number through both machines. Then press <b>Swap the order</b>: with{' '}
          <M>{'f(x) = 3x + 1'}</M> and <M>{'g(x) = x^2'}</M>, <M>{'f(g(2)) = 13'}</M> but <M>{'g(f(2)) = 49'}</M>. Type your own formulas too (for example{' '}
          <code>abs(x - 3)</code>, <code>max(0, x)</code> or <code>2x - 1</code>). Notice that the Python <code>def</code> is the same machine written as code.
        </>
      }
    >
      <div className={s.grid} role="group" aria-label={`Pipeline computing ${comp}`}>
        {rows.map((r, i) => (
          <Fragment key={i}>
            <div className={s.lane}>{r.lane}</div>
            <div className={s.side}>{r.side}</div>
          </Fragment>
        ))}
      </div>

      <div className={s.compare} aria-live="polite">
        <span className={`${s.compareItem} ${s.compareItemOn}`}>
          this order: <M>{`${comp} = ${fmtTex(out)}`}</M>
        </span>
        <span className={s.compareItem}>
          swapped: <M>{`${compOther} = ${fmtTex(otherOut)}`}</M>
        </span>
      </div>
      {(!Number.isFinite(out) || !Number.isFinite(otherOut)) && (
        <div style={{ width: '100%', fontSize: '0.88rem', color: 'var(--ink-2)', textAlign: 'center' }}>
          “Undefined” means no number comes out: dividing by 0 has no answer (Python stops with <code>ZeroDivisionError</code>), and neither has the square root of
          a negative number.
        </div>
      )}

      <Controls>
        <Slider
          label={
            <>
              input <M>x</M>
            </>
          }
          value={x}
          min={-4}
          max={4}
          step={0.5}
          onChange={(v) => {
            setX(v)
            settle()
          }}
        />
        <div className={s.buttons}>
          <Button primary onClick={drop}>
            Drop the ball
          </Button>
          <Button
            onClick={() => {
              setGFirst((v) => !v)
              settle()
            }}
          >
            Swap the order
          </Button>
        </div>
      </Controls>
      <div className={s.inputs}>
        {(
          [
            ['f', fSrc, setFSrc, f],
            ['g', gSrc, setGSrc, g],
          ] as const
        ).map(([name, src, set, p]) => (
          <label key={name} className={s.field}>
            <span className={s.fieldLabel}>
              type a formula for <M>{`${name}(x)`}</M>
            </span>
            <input
              className={`${s.textInput} ${p.error ? s.textInputBad : ''}`}
              value={src}
              maxLength={28}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              onChange={(e) => {
                set(e.target.value)
                settle()
              }}
              aria-invalid={!!p.error}
            />
            <span className={s.error} aria-live="polite">
              {p.error ? `${p.error} (using the last formula that worked)` : ''}
            </span>
          </label>
        ))}
      </div>
    </Figure>
  )
}
