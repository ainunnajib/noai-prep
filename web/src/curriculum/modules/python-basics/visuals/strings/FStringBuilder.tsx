import { useState } from 'react'
import { Figure, Slider, Segmented } from '../../../../../kit'
import { highlightPy } from './pyCode'
import { floatRepr } from './pyStr'
import s from './str.module.css'

/*
  An f-string, with each {field} colour-linked to the piece of output it produces.
  The average is (a + b + c) / 3, so its exact value is never halfway between two rounded
  values: toFixed() then gives exactly what Python's format(avg, '.2f') gives.
*/

const SPECS = ['', ':.2f', ':.1f', ':.0f'] as const
type Spec = (typeof SPECS)[number]

function formatAvg(x: number, spec: Spec) {
  if (spec === '') return floatRepr(x)
  return x.toFixed(Number(spec[2]))
}

export default function FStringBuilder() {
  const [name, setName] = useState('Wei Ling')
  const [a, setA] = useState(85)
  const [b, setB] = useState(72)
  const [c, setC] = useState(78)
  const [spec, setSpec] = useState<Spec>(':.2f')
  const [upper, setUpper] = useState(false)

  const avg = (a + b + c) / 3
  const nameField = upper ? 'name.upper()' : 'name'
  const nameOut = upper ? name.toUpperCase() : name
  const avgOut = formatAvg(avg, spec)

  return (
    <Figure
      title="Build an f-string"
      caption={
        <>
          Move the test scores, pick a format for the average, and edit the name. Each coloured <code>{'{field}'}</code> in the f-string becomes the
          piece of output with the same colour. <code>:.2f</code> means "a float with 2 decimal places", rounded; the variable itself keeps all its
          digits.
        </>
      }
    >
      <div className={s.wrap}>
        <div className={s.grid2}>
          <Slider label="test 1" value={a} min={0} max={100} onChange={setA} />
          <Slider label="test 2" value={b} min={0} max={100} onChange={setB} />
          <Slider label="test 3" value={c} min={0} max={100} onChange={setC} />
        </div>
        <div className={s.row}>
          <label className={s.field} style={{ flex: '1 1 180px' }}>
            <span className={s.fieldLabel}>name =</span>
            <input className={s.input} value={name} maxLength={16} spellCheck={false} onChange={(e) => setName(e.target.value)} aria-label="Name" />
          </label>
          <Segmented
            label="Format for avg"
            options={SPECS.map((sp) => ({ value: sp, label: <span style={{ fontFamily: 'var(--font-mono)' }}>{`{avg${sp}}`}</span> }))}
            value={spec}
            onChange={setSpec}
          />
          <Segmented
            label="Name field"
            options={[
              { value: 'plain', label: <span style={{ fontFamily: 'var(--font-mono)' }}>{'{name}'}</span> },
              { value: 'upper', label: <span style={{ fontFamily: 'var(--font-mono)' }}>{'{name.upper()}'}</span> },
            ]}
            value={upper ? 'upper' : 'plain'}
            onChange={(v) => setUpper(v === 'upper')}
          />
        </div>
        <div className={s.fBox} aria-live="polite">
          <div className={s.fLine}>
            {highlightPy(`name = "${name}"`)}
            <br />
            {highlightPy(`avg = (${a} + ${b} + ${c}) / 3`)}
            <span className={s.plain}>{`   # ${floatRepr(avg)}`}</span>
          </div>
          <div>
            <span className={s.fLabel}>Without formatting</span>
            <div className={s.fLine}>{highlightPy(`print(name, "scored", avg)`)}</div>
            <div className={`${s.fLine} ${s.plain}`}>
              {name} scored {floatRepr(avg)}
            </div>
          </div>
          <div>
            <span className={s.fLabel}>With an f-string</span>
            <div className={s.fLine}>
              <span className="tok keyword">print</span>
              <span className="tok punctuation">(</span>
              <span className="tok string">f"</span>
              <span className={s.field1}>{`{${nameField}}`}</span>
              <span className="tok string"> scored </span>
              <span className={s.field2}>{`{avg${spec}}`}</span>
              <span className="tok string"> on average"</span>
              <span className="tok punctuation">)</span>
            </div>
            <div className={s.fLine}>
              <span className={s.field1}>{nameOut}</span> scored <span className={s.field2}>{avgOut}</span> on average
            </div>
          </div>
        </div>
      </div>
    </Figure>
  )
}
