import { useState } from 'react'
import { Figure, Toggle } from '../../../../../kit'
import { TraceStepper, type ConsoleLine, type DFrame, type DObj, type TraceStep } from './pyviz'

/*
  The mutable default argument trap. The default value is evaluated once, when `def` runs,
  and stored on the function object (dashed box). Every call that leaves out `items`
  gets an arrow to that one stored list. The fix stores None and builds a list per call.
*/

const BUGGY = 'def add_item(x, items=[]):\n    items.append(x)\n    return items\n\nprint(add_item(1))\nprint(add_item(2))\nprint(add_item(3))'
const FIXED =
  'def add_item(x, items=None):\n    if items is None:\n        items = []\n    items.append(x)\n    return items\n\nprint(add_item(1))\nprint(add_item(2))\nprint(add_item(3))'

const DEF_LABEL = 'default (made once)'
const CALL = 'add_item(x, items)'
const show = (xs: number[]) => `[${xs.join(', ')}]`
const cells = (xs: number[]) => xs.map(String)

function buggySteps(): TraceStep[] {
  const steps: TraceStep[] = [
    {
      line: [1],
      note: <>Running the <code>def</code> line evaluates the default <code>[]</code> <b>right now, once</b>. That single list is stored on the function.</>,
      frames: [{ id: 'd', kind: 'defaults', label: DEF_LABEL, names: [{ name: 'items', to: 'D', hl: true }] }],
      objects: [{ id: 'D', type: 'list', cells: [], hl: true }],
      out: [],
    },
  ]
  const printed: ConsoleLine[] = []
  let list: number[] = []
  const defaults = (hl = false): DFrame => ({ id: 'd', kind: 'defaults', label: DEF_LABEL, names: [{ name: 'items', to: 'D', hl }] })
  for (const x of [1, 2, 3]) {
    const callLine = 4 + x
    const callFrame = (hl: boolean): DFrame => ({ id: 'f', label: CALL, names: [{ name: 'x', value: String(x) }, { name: 'items', to: 'D', hl }] })
    steps.push({
      line: [callLine],
      note:
        x === 1 ? (
          <>Call 1 leaves out <code>items</code>, so the parameter gets an arrow to the stored default list.</>
        ) : (
          <>Call {x} also leaves out <code>items</code>, so it gets an arrow to the <b>same</b> stored list, which still holds {show(list)}.</>
        ),
      frames: [defaults(), callFrame(true)],
      objects: [{ id: 'D', type: 'list', cells: cells(list) }],
      out: [...printed],
      predict:
        x === 1
          ? undefined
          : {
              q: `Predict: what will print(add_item(${x})) show?`,
              options: x === 2 ? ['[2]', '[1, 2]', '[1]'] : ['[3]', '[1, 2, 3]', '[2, 3]'],
              answer: 1,
              hide: false,
            },
    })
    list = [...list, x]
    steps.push({
      line: [2],
      note: <><code>items.append({x})</code> changes the stored default list itself.</>,
      frames: [defaults(), callFrame(false)],
      objects: [{ id: 'D', type: 'list', cells: cells(list), hl: true }],
      out: [...printed],
    })
    printed.push({ text: show(list) })
    steps.push({
      line: [3, callLine],
      note:
        x === 1 ? (
          <>The list is returned and printed; the frame goes away. But the default list keeps its 1 for next time.</>
        ) : (
          <>The shared list is returned and printed. It has grown by one item on every call.</>
        ),
      frames: [defaults(true)],
      objects: [{ id: 'D', type: 'list', cells: cells(list) }],
      out: [...printed],
    })
  }
  return steps
}

function fixedSteps(): TraceStep[] {
  const defaults: DFrame = { id: 'd', kind: 'defaults', label: DEF_LABEL, names: [{ name: 'items', value: 'None' }] }
  const steps: TraceStep[] = [
    {
      line: [1],
      note: <>This time the stored default is <code>None</code>, which can never be changed.</>,
      frames: [{ ...defaults, names: [{ name: 'items', value: 'None', hl: true }] }],
      objects: [],
      out: [],
    },
  ]
  const printed: ConsoleLine[] = []
  let freed: DObj[] = []
  for (const x of [1, 2, 3]) {
    const callLine = 6 + x
    const id = `N${x}`
    steps.push({
      line: [callLine],
      note: <>Call {x} leaves out <code>items</code>, so the parameter starts as <code>None</code>.</>,
      frames: [defaults, { id: 'f', label: CALL, names: [{ name: 'x', value: String(x) }, { name: 'items', value: 'None', hl: true }] }],
      objects: freed,
      out: [...printed],
      predict: x === 2 ? { q: 'Predict: what will print(add_item(2)) show now?', options: ['[2]', '[1, 2]', '[1]'], answer: 0, hide: false } : undefined,
    })
    steps.push({
      line: [2, 3],
      note: <><code>items is None</code> is True, so line 3 builds a <b>fresh</b> empty list for this call only.</>,
      frames: [defaults, { id: 'f', label: CALL, names: [{ name: 'x', value: String(x) }, { name: 'items', to: id, hl: true }] }],
      objects: [{ id, type: 'list', cells: [], hl: true }],
      out: [...printed],
    })
    steps.push({
      line: [4],
      note: <><code>items.append({x})</code> changes this call's own list.</>,
      frames: [defaults, { id: 'f', label: CALL, names: [{ name: 'x', value: String(x) }, { name: 'items', to: id }] }],
      objects: [{ id, type: 'list', cells: [String(x)], hl: true }],
      out: [...printed],
    })
    printed.push({ text: `[${x}]` })
    freed = [{ id, type: 'list', cells: [String(x)], garbage: true }]
    steps.push({
      line: [5, callLine],
      note: <>Returned and printed. Once printed, nothing points at that list, so it is freed. The next call starts from scratch.</>,
      frames: [defaults],
      objects: freed,
      out: [...printed],
    })
  }
  return steps
}

const BUGGY_STEPS = buggySteps()
const FIXED_STEPS = fixedSteps()

export default function DefaultArgTrap() {
  const [fixed, setFixed] = useState(false)
  return (
    <Figure
      title="Default values are made once, not on every call"
      caption={
        <>
          Press <b>Play</b> (or <b>Next</b>) to make three calls. The dashed box is the default value Python stored when the <code>def</code> line ran. With{' '}
          <code>items=[]</code> every call reaches that one list, so it keeps growing. Switch on the fix and replay: <code>None</code> is stored instead, and each call builds its
          own new list.
        </>
      }
    >
      <Toggle label={<>Apply the fix: <code>items=None</code></>} checked={fixed} onChange={setFixed} />
      <TraceStepper
        code={fixed ? FIXED : BUGGY}
        steps={fixed ? FIXED_STEPS : BUGGY_STEPS}
        resetKey={fixed ? 'fixed' : 'buggy'}
        interval={1300}
        diagramLabel={fixed ? 'Each call creates its own new list' : 'Every call shares the one default list stored on the function'}
      />
    </Figure>
  )
}
