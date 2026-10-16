import { useState } from 'react'
import { Figure, Controls, Slider, M } from '../../../../../kit'
import { WindowStrip } from './ConvDrill'
import s from '../drill-kit/dd.module.css'

/*
  The output-size formula as counting. One side of the input, padded, with every place a window of
  size k fits when it jumps s cells at a time. The count under the strip always equals
  floor((n + 2p − k) / s) + 1, worked out beside it with the same numbers.
*/

export default function WindowExplorer() {
  const [n, setN] = useState(7)
  const [k, setK] = useState(3)
  const [p, setP] = useState(0)
  const [st, setSt] = useState(2)
  const L = n + 2 * p
  const fits = k <= L
  const out = fits ? Math.floor((L - k) / st) + 1 : 0

  return (
    <Figure
      title="Count the places the window fits"
      caption={
        <>
          Each orange bar is one place the window can sit; the output has one value per place. Change the numbers and count the bars: the count always
          matches the formula. A stride that does not divide evenly leaves cells over at the end (shown red), which is what the round-down does.
        </>
      }
    >
      <div className={s.wrap} style={{ width: '100%' }}>
        {fits ? (
          <WindowStrip q={{ n, k, p, st }} />
        ) : (
          <p className={s.legend} role="status">
            The window ({k} cells) is wider than the padded row ({L} cells), so it fits nowhere.
          </p>
        )}
        <div className="tabular" style={{ textAlign: 'center', fontSize: '0.95rem' }} aria-live="polite">
          {fits ? (
            <M>{`\\left\\lfloor \\dfrac{${n} + 2 \\times ${p} - ${k}}{${st}} \\right\\rfloor + 1 = \\left\\lfloor \\dfrac{${L - k}}{${st}} \\right\\rfloor + 1 = ${Math.floor((L - k) / st)} + 1 = ${out}`}</M>
          ) : (
            'no output'
          )}
        </div>
        <Controls>
          <Slider label={<>input size <M>n</M></>} value={n} min={3} max={14} step={1} onChange={setN} />
          <Slider label={<>kernel <M>k</M></>} value={k} min={1} max={5} step={1} onChange={setK} />
          <Slider label={<>padding <M>p</M></>} value={p} min={0} max={2} step={1} onChange={setP} />
          <Slider label={<>stride <M>s</M></>} value={st} min={1} max={3} step={1} onChange={setSt} />
        </Controls>
      </div>
    </Figure>
  )
}
