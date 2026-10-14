import { useState } from 'react'
import { Figure, Controls, Readout, Segmented, Toggle } from '../../../../../kit'
import { CodeView, Console, Lamp, MemoryDiagram, type DObj } from './pyviz'

/*
  Two lamps: a == b (same value?) and a is b (same object?).
  Switch between "same object", "equal twin" and "different", and optionally mutate b.
*/

type Setup = 'same' | 'twin' | 'diff'

export default function IdentityVsEquality() {
  const [setup, setSetup] = useState<Setup>('twin')
  const [mutate, setMutate] = useState(false)

  const aCells = ['1', '2']
  const bStart = setup === 'diff' ? ['2', '1'] : ['1', '2']
  const shared = setup === 'same'
  const aNow = shared && mutate ? [...aCells, '3'] : aCells
  const bNow = mutate ? [...bStart, '3'] : bStart

  const eq = aNow.join(',') === bNow.join(',')
  const same = shared

  const line2 = setup === 'same' ? 'b = a' : setup === 'twin' ? 'b = [1, 2]' : 'b = [2, 1]'
  const code = ['a = [1, 2]', line2, ...(mutate ? ['b.append(3)'] : []), 'print(a == b, a is b)'].join('\n')

  const objects: DObj[] = shared
    ? [{ id: 'A', type: 'list', tag: 'id A', cells: aNow, hl: mutate }]
    : [
        { id: 'A', type: 'list', tag: 'id A', cells: aNow },
        { id: 'B', type: 'list', tag: 'id B', cells: bNow, hl: mutate },
      ]

  const why = same
    ? mutate
      ? 'One object with two names: appending through b changed the list that a also points at. It is still equal to itself, and still itself.'
      : 'One object with two names. It is equal to itself, and it is itself.'
    : setup === 'diff'
      ? 'Different objects with different values. Lists compare item by item, in order, so [1, 2] and [2, 1] are not equal.'
      : eq
        ? 'Two separate objects that happen to hold equal values: == is True, but is is False. Twins, not one person.'
        : 'Appending changed only b’s own list, so the twins are no longer equal. They were never the same object.'

  return (
    <Figure
      title="Same value (==) or same object (is)?"
      caption={
        <>
          Choose how <code>b</code> is made, then switch on <code>b.append(3)</code>. The <code>==</code> lamp compares <b>contents</b>; the <code>is</code> lamp compares{' '}
          <b>arrows</b> (do both names reach the same object, with the same <code>id</code>?). Real <code>id()</code> values are long numbers; the letters stand in for them.
        </>
      }
    >
      <Controls>
        <Segmented
          label="How b is made"
          value={setup}
          onChange={setSetup}
          options={[
            { value: 'same', label: 'b = a' },
            { value: 'twin', label: 'b = [1, 2]' },
            { value: 'diff', label: 'b = [2, 1]' },
          ]}
        />
        <Toggle label={<>then run <code>b.append(3)</code></>} checked={mutate} onChange={setMutate} />
      </Controls>
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 12, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 10, minWidth: 0 }}>
          <CodeView code={code} />
          <Console lines={[{ text: `${eq ? 'True' : 'False'} ${same ? 'True' : 'False'}` }]} minLines={1} />
        </div>
        <MemoryDiagram
          frames={[{ id: 'g', label: 'Global names', names: [{ name: 'a', to: 'A' }, { name: 'b', to: shared ? 'A' : 'B', hl: true }] }]}
          objects={objects}
          minHeight={112}
          ariaLabel={shared ? 'a and b both point at one list' : `a points at list ${aNow.join(', ')}; b points at a different list ${bNow.join(', ')}`}
        />
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Lamp on={eq} label="a == b" sub="same value?" />
        <Lamp on={same} label="a is b" sub="same object?" />
      </div>
      <Readout
        items={[
          ['id(a)', 'A'],
          ['id(b)', shared ? 'A' : 'B'],
          ['a is b means', 'id(a) == id(b)'],
        ]}
      />
      <div style={{ width: '100%', fontSize: 14.5, lineHeight: 1.5, background: 'var(--surface-2)', borderRadius: 8, padding: '0.5rem 0.7rem' }}>{why}</div>
    </Figure>
  )
}
