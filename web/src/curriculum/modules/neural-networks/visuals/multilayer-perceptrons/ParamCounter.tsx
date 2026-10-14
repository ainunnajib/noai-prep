import { useState } from 'react'
import { Figure, Controls, Segmented, Button, M } from '../../../../../kit'
import s from './playground.module.css'

/*
  Parameter counter for a fully connected network. Every connection between layers of sizes
  n (in) and m (out) has n × m weights plus m biases.
*/

const PRESETS: { id: string; label: string; sizes: number[] }[] = [
  { id: 'tiny', label: '2-3-1', sizes: [2, 3, 1] },
  { id: 'mnist', label: '784-128-10 (digits)', sizes: [784, 128, 10] },
  { id: 'wide', label: 'wide 2-64-1', sizes: [2, 64, 1] },
  { id: 'deep', label: 'deep 2-8-8-8-8-1', sizes: [2, 8, 8, 8, 8, 1] },
]
const MAX = 4096
const fmt = (v: number) => v.toLocaleString('en-GB')

/** A number box that lets you clear it and type freely; it only commits whole numbers from 1 to MAX. */
function NumField({ value, onCommit, label }: { value: number; onCommit: (v: number) => void; label: string }) {
  const [text, setText] = useState(String(value))
  const [shown, setShown] = useState(value)
  if (shown !== value) {
    setShown(value)
    setText(String(value))
  }
  return (
    <input
      className={s.numInput}
      type="number"
      inputMode="numeric"
      min={1}
      max={MAX}
      value={text}
      aria-label={label}
      onChange={(e) => {
        setText(e.target.value)
        const v = Math.round(Number(e.target.value))
        if (e.target.value !== '' && Number.isFinite(v) && v >= 1 && v <= MAX) {
          setShown(v)
          onCommit(v)
        }
      }}
      onBlur={() => setText(String(value))}
    />
  )
}

export default function ParamCounter() {
  const [sizes, setSizes] = useState<number[]>(PRESETS[1].sizes)
  const preset = PRESETS.find((p) => p.sizes.join('-') === sizes.join('-'))?.id ?? ''
  const conns = sizes.slice(0, -1).map((nIn, l) => {
    const nOut = sizes[l + 1]
    return { nIn, nOut, w: nIn * nOut, b: nOut }
  })
  const total = conns.reduce((a, c) => a + c.w + c.b, 0)
  const biggest = Math.max(1, ...conns.map((c) => c.w + c.b))

  const setSize = (l: number, v: number) => setSizes((sz) => sz.map((u, i) => (i === l ? Math.max(1, Math.min(MAX, Math.round(v) || 1)) : u)))
  const remove = (l: number) => setSizes((sz) => sz.filter((_, i) => i !== l))
  const addHidden = () => setSizes((sz) => [...sz.slice(0, -1), sz[sz.length - 2] ?? 8, sz[sz.length - 1]])
  const name = (l: number) => (l === 0 ? 'input' : l === sizes.length - 1 ? 'output' : `hidden ${l}`)

  return (
    <Figure
      title="Count the parameters, layer by layer"
      caption={
        <>
          Type any layer size, add or remove hidden layers, or pick a preset. Each dashed link is one fully connected layer: <M>{'n_{\\text{in}} \\times n_{\\text{out}}'}</M>{' '}
          weights (blue) plus <M>{'n_{\\text{out}}'}</M> biases (orange). Bars are drawn relative to the biggest link. Compare the presets: in the digits network almost every
          parameter sits in the first link, and the wide 2-64-1 and deep 2-8-8-8-8-1 networks have almost the same number of parameters.
        </>
      }
    >
      <Controls>
        <Segmented label="preset" value={preset} onChange={(id) => setSizes(PRESETS.find((p) => p.id === id)!.sizes)} options={PRESETS.map((p) => ({ value: p.id, label: p.label }))} />
      </Controls>
      <div className={s.stack}>
        {sizes.map((n, l) => (
          <div key={l}>
            <div className={s.layerRow}>
              <span className={s.layerName}>{name(l)}</span>
              <NumField value={n} onCommit={(v) => setSize(l, v)} label={`Number of neurons in the ${name(l)} layer`} />
              <span className={s.unit}>{l === 0 ? (n === 1 ? 'feature' : 'features') : n === 1 ? 'neuron' : 'neurons'}</span>
              {l > 0 && l < sizes.length - 1 && (
                <button type="button" className={s.removeBtn} onClick={() => remove(l)} aria-label={`Remove ${name(l)}`}>
                  remove
                </button>
              )}
            </div>
            {l < conns.length && (
              <div className={s.conn}>
                <div className={s.connText}>
                  <M>{`${conns[l].nIn} \\times ${conns[l].nOut} + ${conns[l].nOut}`}</M> = <b>{fmt(conns[l].w + conns[l].b)}</b>{' '}
                  <span className={s.unit}>({total ? ((100 * (conns[l].w + conns[l].b)) / total).toFixed(1) : '0'}% of all parameters)</span>
                </div>
                <div className={s.track} role="img" aria-label={`${fmt(conns[l].w)} weights and ${fmt(conns[l].b)} biases`}>
                  <span style={{ width: `${(100 * conns[l].w) / biggest}%`, background: 'var(--viz-1)' }} />
                  <span style={{ width: `${Math.max(0.6, (100 * conns[l].b) / biggest)}%`, background: 'var(--viz-2)' }} />
                </div>
              </div>
            )}
          </div>
        ))}
        <div className={s.total}>
          Total = {conns.map((c) => fmt(c.w + c.b)).join(' + ')} = <strong>{fmt(total)}</strong> parameters
        </div>
      </div>
      <Controls>
        <Button onClick={addHidden} disabled={sizes.length >= 8}>
          Add a hidden layer
        </Button>
      </Controls>
    </Figure>
  )
}
