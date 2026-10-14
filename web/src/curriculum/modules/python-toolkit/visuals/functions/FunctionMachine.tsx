import { useEffect, useState } from 'react'
import { Figure, Controls, Slider, Segmented, Toggle, Button, useContainerWidth } from '../../../../../kit'
import { CodePanel } from './CodePanel'
import s from './fn.module.css'

/*
  A function as a machine. Arguments drop into the parameter slots, the body computes, and the
  value leaves through the output chute (return) or only appears on the screen (print), in which
  case the chute delivers None. Outputs are formatted exactly as Python 3 prints them.
*/

type Machine = 'area' | 'update'
type Mode = 'return' | 'print'

/** Python's repr of a float (all values here are in the range where JS and Python agree). */
const pyFloat = (x: number) => (Number.isInteger(x) ? x.toFixed(1) : String(x))
const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const PHASES = 5 // 0 args waiting, 1 in slots, 2 computed, 3 leaving, 4 delivered

export default function FunctionMachine() {
  const [machine, setMachine] = useState<Machine>('area')
  const [mode, setMode] = useState<Mode>('return')
  const [w, setW] = useState(3)
  const [h, setH] = useState(4)
  const [uw, setUw] = useState(2)
  const [grad, setGrad] = useState(4)
  const [passLr, setPassLr] = useState(false)
  const [lr, setLr] = useState(0.5)
  const [runId, setRunId] = useState(0)
  const [phase, setPhase] = useState(PHASES - 1)

  useEffect(() => {
    if (runId === 0 || reducedMotion()) {
      setPhase(PHASES - 1)
      return
    }
    setPhase(0)
    let p = 0
    const t = window.setInterval(() => {
      p += 1
      setPhase(p)
      if (p >= PHASES - 1) window.clearInterval(t)
    }, 650)
    return () => window.clearInterval(t)
  }, [runId])

  const rerun = () => setRunId((r) => r + 1)
  // After any change (debounced while a slider is dragged), run the call again so the new values travel through.
  const [dirty, setDirty] = useState(0)
  useEffect(() => {
    if (dirty === 0) return
    const t = window.setTimeout(rerun, 280)
    return () => window.clearTimeout(t)
  }, [dirty])
  const change = <T,>(set: (v: T) => void) => (v: T) => {
    set(v)
    setDirty((d) => d + 1)
  }

  // ---------- the program ----------
  const isArea = machine === 'area'
  const lrUsed = passLr ? lr : 0.1
  const value = isArea ? w * h : uw - lrUsed * grad
  const valueText = isArea ? String(value) : pyFloat(value)
  const exprText = isArea ? 'w * h' : 'w - lr * grad'
  const name = isArea ? 'area' : 'update'
  const target = isArea ? 'result' : 'new_w'
  const params = isArea
    ? [
        { p: 'w', v: String(w), dflt: false },
        { p: 'h', v: String(h), dflt: false },
      ]
    : [
        { p: 'w', v: pyFloat(uw), dflt: false },
        { p: 'grad', v: String(grad), dflt: false },
        { p: 'lr', v: pyFloat(lrUsed), dflt: !passLr },
      ]
  const callArgs = isArea ? `${w}, ${h}` : `${pyFloat(uw)}, ${grad}${passLr ? `, lr=${pyFloat(lr)}` : ''}`
  const body = mode === 'return' ? `    return ${exprText}` : `    print(${exprText})`
  const lines = [
    isArea ? 'def area(w, h):' : 'def update(w, grad, lr=0.1):',
    body,
    '',
    `${target} = ${name}(${callArgs})`,
    `print('${target} is', ${target})`,
  ]
  const delivered = mode === 'return' ? valueText : 'None'
  const consoleLines = mode === 'return' ? [`${target} is ${valueText}`] : [valueText, `${target} is None`]
  const noisy = /\.\d{5,}/.test(valueText)
  const computedText = isArea ? `${w} * ${h} = ${valueText}` : `${pyFloat(uw)} - ${pyFloat(lrUsed)} * ${grad} = ${valueText}`

  // ---------- layout ----------
  const [ref, measured] = useContainerWidth<HTMLDivElement>(520)
  const width = Math.max(300, Math.min(measured, 560))
  const narrow = width < 440
  const screenW = narrow ? 70 : 96
  const mw = Math.min(310, width - screenW - 30)
  const mx = Math.max(4, (width - mw - screenW - 16) / 2)
  const tokenY = 20 // centre of a waiting argument token
  const slotTop = 44
  const bodyTop = 96
  const bodyH = 84
  const landY = slotTop + 17 // centre of a token sitting in its slot
  const chuteTop = bodyTop + bodyH
  const resultY = chuteTop + 50
  const height = resultY + 46
  const slotX = (i: number) => mx + ((i + 0.5) * mw) / params.length
  const cx = mx + mw / 2
  const scrX = mx + mw + 16
  const midOut = chuteTop + 25
  const outY = phase >= 4 ? resultY + 20 : midOut
  const tokenW = (t: string) => Math.max(30, t.length * 8 + 16)
  const boxW = 150

  const svg = (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={`The ${name} machine. Arguments ${callArgs}. Body ${body.trim()}. ${target} receives ${delivered}.`} style={{ display: 'block', maxWidth: width, margin: '0 auto' }}>
      {/* parameter slots (hoppers) with their argument tokens */}
      {params.map((pr, i) => {
        const x = slotX(i)
        const tw = tokenW(pr.v)
        const dy = (phase >= 1 ? landY : tokenY) - tokenY
        return (
          <g key={pr.p}>
            <path d={`M${x - 30},${slotTop} L${x + 30},${slotTop} L${x + 13},${bodyTop} L${x - 13},${bodyTop} Z`} style={{ fill: 'color-mix(in srgb, var(--viz-1) 10%, var(--surface))', stroke: 'var(--viz-1)', strokeWidth: 1.5 }} />
            <text x={x} y={bodyTop + 18} textAnchor="middle" className={s.svgMono} style={{ fill: 'var(--viz-1)', fontSize: 13, fontWeight: 800 }}>
              {pr.p}
            </text>
            <g style={{ transform: `translate(0px, ${dy}px)`, transition: 'transform 0.45s ease' }}>
              <rect x={x - tw / 2} y={tokenY - 12} width={tw} height={24} rx={12} style={{ fill: pr.dflt ? 'var(--surface)' : 'var(--viz-1)', stroke: 'var(--viz-1)', strokeWidth: 1.5, strokeDasharray: pr.dflt ? '4 3' : undefined }} />
              <text x={x} y={tokenY + 4.5} textAnchor="middle" className={s.svgMono} style={{ fill: pr.dflt ? 'var(--viz-1)' : 'var(--surface)', fontSize: 12.5, fontWeight: 800 }}>
                {pr.v}
              </text>
              {pr.dflt && (
                <text x={x + 34} y={tokenY + 4} style={{ fill: 'var(--ink-2)', fontSize: 10.5, fontWeight: 700 }}>
                  default
                </text>
              )}
            </g>
          </g>
        )
      })}

      {/* machine body */}
      <rect x={mx} y={bodyTop} width={mw} height={bodyH} rx={12} style={{ fill: 'var(--surface-2)', stroke: 'var(--ink-2)', strokeWidth: 2 }} />
      <text x={cx} y={bodyTop + 46} textAnchor="middle" className={s.svgMono} style={{ fill: 'var(--ink)', fontSize: narrow ? 12.5 : 14, fontWeight: 700 }}>
        {phase >= 2 ? computedText : exprText}
      </text>
      <text x={mx + 10} y={bodyTop + 72} className={s.svgMono} style={{ fill: 'var(--ink-2)', fontSize: 11.5, fontWeight: 700 }}>
        {name}()
      </text>
      <text x={mx + mw - 10} y={bodyTop + 72} textAnchor="end" style={{ fill: mode === 'return' ? 'var(--viz-pos)' : 'var(--viz-2)', fontSize: 11.5, fontWeight: 800 }}>
        {mode === 'return' ? 'return → chute' : 'print → screen'}
      </text>

      {/* screen */}
      <line x1={mx + mw} y1={bodyTop + 42} x2={scrX} y2={bodyTop + 42} style={{ stroke: 'var(--ink-2)', strokeWidth: 1.5 }} />
      <rect x={scrX} y={bodyTop + 20} width={screenW} height={44} rx={6} style={{ fill: mode === 'print' && phase >= 2 ? 'color-mix(in srgb, var(--viz-2) 18%, var(--surface))' : 'var(--surface)', stroke: 'var(--ink-2)', strokeWidth: 1.5 }} />
      <text x={scrX + screenW / 2} y={bodyTop + 47} textAnchor="middle" className={s.svgMono} style={{ fill: 'var(--ink)', fontSize: 13, fontWeight: 800 }}>
        {mode === 'print' && phase >= 2 ? valueText : ''}
      </text>
      <text x={scrX + screenW / 2} y={bodyTop + 80} textAnchor="middle" style={{ fill: 'var(--ink-2)', fontSize: 10.5, fontWeight: 700 }}>
        screen
      </text>

      {/* chute */}
      <path d={`M${cx - 20},${chuteTop} L${cx - 20},${resultY} M${cx + 20},${chuteTop} L${cx + 20},${resultY}`} style={{ stroke: 'var(--ink-2)', strokeWidth: 2 }} />
      <text x={cx + 28} y={chuteTop + 22} style={{ fill: 'var(--ink-2)', fontSize: 10.5, fontWeight: 700 }}>
        output chute
      </text>

      {/* the variable that receives the result */}
      <rect x={cx - boxW / 2} y={resultY} width={boxW} height={40} rx={8} style={{ fill: 'var(--surface)', stroke: 'var(--viz-3)', strokeWidth: 2 }} />
      <text x={cx - boxW / 2 + 8} y={resultY + 25} className={s.svgMono} style={{ fill: 'var(--viz-3)', fontSize: 12.5, fontWeight: 800 }}>
        {target}
      </text>

      {/* the value travelling down the chute */}
      {phase >= 3 && (
        <g style={{ transform: `translate(0px, ${outY - midOut}px)`, transition: 'transform 0.5s ease' }}>
          <rect x={cx - tokenW(delivered) / 2 + (phase >= 4 ? 28 : 0)} y={midOut - 12} width={tokenW(delivered)} height={24} rx={12} style={{ fill: mode === 'return' ? 'var(--viz-pos)' : 'var(--viz-muted)', transition: 'x 0.5s ease' }} />
          <text x={cx + (phase >= 4 ? 28 : 0)} y={midOut + 4.5} textAnchor="middle" className={s.svgMono} style={{ fill: 'var(--surface)', fontSize: 12.5, fontWeight: 800 }}>
            {delivered}
          </text>
        </g>
      )}
    </svg>
  )

  return (
    <Figure
      title="A function is a machine: arguments in, return value out"
      caption={
        <>
          Change the arguments and watch them drop into the parameter slots. Then switch the body from <span className={s.mono}>return</span> to{' '}
          <span className={s.mono}>print</span>: the number still appears on the screen, but nothing useful comes down the chute, so the variable receives{' '}
          <span className={s.mono}>None</span>. Try the <span className={s.mono}>update</span> machine and leave out <span className={s.mono}>lr</span> to see its default value fill the slot.
        </>
      }
    >
      <div ref={ref} className={s.wrap}>
        <CodePanel lines={lines} active={phase <= 0 ? 4 : phase < 4 ? 2 : 5} />
        {svg}
        <pre className={s.console} aria-live="polite">
          <span className={s.consoleLabel}>Printed output</span>
          {phase >= 4 ? (
            consoleLines.map((l, i) => (
              <span key={i}>
                {l}
                {'\n'}
              </span>
            ))
          ) : mode === 'print' && phase >= 2 ? (
            <span>
              {valueText}
              {'\n'}
            </span>
          ) : (
            <span className={s.muted}>…</span>
          )}
        </pre>
        {phase >= 4 && (
          <div className={s.status}>
            {mode === 'return' ? (
              <>
                <b>return</b> handed {valueText} back to the caller, so <span className={s.mono}>{target}</span> holds {valueText} and later code can use it.
              </>
            ) : (
              <>
                <b>print</b> only showed {valueText} on the screen. A function with no <span className={s.mono}>return</span> hands back <b>None</b>, so{' '}
                <span className={s.mono}>{target}</span> is None and <span className={s.mono}>{target} + 1</span> would crash with a TypeError.
              </>
            )}
            {noisy && <> (The long decimal is real: computers store decimals in binary, so tiny rounding errors appear.)</>}
          </div>
        )}

        <div className={s.row}>
          <Segmented label="Machine" value={machine} onChange={change(setMachine)} options={[{ value: 'area', label: <span className={s.mono}>area(w, h)</span> }, { value: 'update', label: <span className={s.mono}>update(w, grad, lr=0.1)</span> }]} />
          <Segmented label="Body" value={mode} onChange={change(setMode)} options={[{ value: 'return', label: <span className={s.mono}>return</span> }, { value: 'print', label: <span className={s.mono}>print</span> }]} />
        </div>
        <Controls>
          {isArea ? (
            <>
              <Slider label="w" value={w} min={0} max={12} step={1} onChange={change(setW)} />
              <Slider label="h" value={h} min={0} max={12} step={1} onChange={change(setH)} />
            </>
          ) : (
            <>
              <Slider label="w" value={uw} min={-3} max={3} step={0.5} onChange={change(setUw)} format={pyFloat} />
              <Slider label="grad" value={grad} min={-4} max={4} step={1} onChange={change(setGrad)} />
              <Toggle label={<span>pass <span className={s.mono}>lr</span> in the call</span>} checked={passLr} onChange={change(setPassLr)} />
              {passLr && <Slider label="lr" value={lr} min={0.1} max={1} step={0.1} onChange={change((v: number) => setLr(Math.round(v * 10) / 10))} format={pyFloat} />}
            </>
          )}
          <Button primary onClick={rerun}>
            Run the call again
          </Button>
        </Controls>
      </div>
    </Figure>
  )
}
