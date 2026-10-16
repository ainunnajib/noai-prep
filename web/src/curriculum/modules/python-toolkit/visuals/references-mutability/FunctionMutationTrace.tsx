import { useState } from 'react'
import { Figure, Segmented } from '../../../../../kit'
import { TraceStepper, out, type DFrame, type TraceStep } from './pyviz'

/*
  Passing a list to a function passes an arrow to the same object.
  Three versions of add_bonus: mutate the argument, rebind the parameter, or return a new list.
*/

type Key = 'mutate' | 'rebind' | 'pure'

const G = 'Global names'
const F = 'add_bonus(scores)'

const g = (extra: DFrame['names'] = []): DFrame => ({ id: 'g', label: G, names: [{ name: 'marks', to: 'L1' }, ...extra] })

function build(key: Key): { code: string; steps: TraceStep[] } {
  const body = key === 'mutate' ? 'scores.append(100)' : key === 'rebind' ? 'scores = scores + [100]' : 'return scores + [100]'
  const call = key === 'pure' ? 'new = add_bonus(marks)' : 'add_bonus(marks)'
  const last = key === 'pure' ? 'print(marks, new)' : 'print(marks)'
  const code = `def add_bonus(scores):\n    ${body}\n\nmarks = [70, 85]\n${call}\n${last}`

  const start: TraceStep = {
    line: [4],
    note: <>The <code>def</code> on line 1 only stored the recipe. Line 4 points the global name <code>marks</code> at a new list.</>,
    frames: [{ id: 'g', label: G, names: [{ name: 'marks', to: 'L1', hl: true }] }],
    objects: [{ id: 'L1', type: 'list', cells: ['70', '85'], hl: true }],
    out: [],
  }
  const enter: TraceStep = {
    line: [5],
    note: <>Calling <code>add_bonus(marks)</code> opens a new local scope (Python calls it a <b>frame</b>). The parameter <code>scores</code> receives a copy of the <b>arrow</b>, not a copy of the list.</>,
    frames: [g(), { id: 'f', label: F, names: [{ name: 'scores', to: 'L1', hl: true }] }],
    objects: [{ id: 'L1', type: 'list', cells: ['70', '85'] }],
    out: [],
  }

  if (key === 'mutate') {
    return {
      code,
      steps: [
        start,
        enter,
        {
          line: [2],
          note: <><code>scores.append(100)</code> follows the arrow and changes the shared list <b>in place</b>. The caller's list is the same object.</>,
          frames: [g(), { id: 'f', label: F, names: [{ name: 'scores', to: 'L1' }] }],
          objects: [{ id: 'L1', type: 'list', cells: ['70', '85', '100'], hl: true }],
          out: [],
        },
        {
          line: [5],
          note: <>The function ends and its local scope, with the name <code>scores</code>, is thrown away. The change it made to the list stays.</>,
          frames: [g()],
          objects: [{ id: 'L1', type: 'list', cells: ['70', '85', '100'] }],
          out: [],
        },
        {
          line: [6],
          note: <><code>marks</code> points at the list the function changed.</>,
          frames: [{ id: 'g', label: G, names: [{ name: 'marks', to: 'L1', hl: true }] }],
          objects: [{ id: 'L1', type: 'list', cells: ['70', '85', '100'] }],
          out: out('[70, 85, 100]'),
          predict: { q: 'What does print(marks) show?', options: ['[70, 85]', '[70, 85, 100]', 'None'], answer: 1 },
        },
      ],
    }
  }
  if (key === 'rebind') {
    return {
      code,
      steps: [
        start,
        enter,
        {
          line: [2],
          note: <><code>scores + [100]</code> builds a <b>new</b> list, and <code>=</code> moves only the local name <code>scores</code> to it. The caller's list is untouched.</>,
          frames: [g(), { id: 'f', label: F, names: [{ name: 'scores', to: 'L2', hl: true }] }],
          objects: [
            { id: 'L1', type: 'list', cells: ['70', '85'] },
            { id: 'L2', type: 'list', cells: ['70', '85', '100'], hl: true },
          ],
          out: [],
        },
        {
          line: [5],
          note: <>The call's local scope is thrown away. Nothing points at the new list any more, so Python frees it: the work is lost.</>,
          frames: [g()],
          objects: [
            { id: 'L1', type: 'list', cells: ['70', '85'] },
            { id: 'L2', type: 'list', cells: ['70', '85', '100'], garbage: true },
          ],
          out: [],
        },
        {
          line: [6],
          note: <>Rebinding a parameter never reaches the caller. Only mutation does.</>,
          frames: [{ id: 'g', label: G, names: [{ name: 'marks', to: 'L1', hl: true }] }],
          objects: [{ id: 'L1', type: 'list', cells: ['70', '85'] }],
          out: out('[70, 85]'),
          predict: { q: 'What does print(marks) show?', options: ['[70, 85]', '[70, 85, 100]', 'None'], answer: 0 },
        },
      ],
    }
  }
  return {
    code,
    steps: [
      start,
      enter,
      {
        line: [2],
        note: <><code>scores + [100]</code> builds a new list, and <code>return</code> hands its arrow back to the caller. The input list is not changed.</>,
        frames: [g(), { id: 'f', label: F, names: [{ name: 'scores', to: 'L1' }] }],
        objects: [
          { id: 'L1', type: 'list', cells: ['70', '85'] },
          { id: 'L2', type: 'list', cells: ['70', '85', '100'], hl: true },
        ],
        out: [],
      },
      {
        line: [5],
        note: <>The call's local scope is thrown away and <code>new = ...</code> points a global name at the returned list. Nothing was lost and nothing was changed by surprise.</>,
        frames: [g([{ name: 'new', to: 'L2', hl: true }])],
        objects: [
          { id: 'L1', type: 'list', cells: ['70', '85'] },
          { id: 'L2', type: 'list', cells: ['70', '85', '100'] },
        ],
        out: [],
      },
      {
        line: [6],
        note: <>This is the safest pattern: take an input, return a new result, and leave the input alone.</>,
        frames: [g([{ name: 'new', to: 'L2' }])],
        objects: [
          { id: 'L1', type: 'list', cells: ['70', '85'] },
          { id: 'L2', type: 'list', cells: ['70', '85', '100'] },
        ],
        out: out('[70, 85] [70, 85, 100]'),
        predict: {
          q: 'What does print(marks, new) show?',
          options: ['[70, 85] [70, 85, 100]', '[70, 85, 100] [70, 85, 100]', '[70, 85] None'],
          answer: 0,
        },
      },
    ],
  }
}

const PROGRAMS: Record<Key, { code: string; steps: TraceStep[] }> = { mutate: build('mutate'), rebind: build('rebind'), pure: build('pure') }

export default function FunctionMutationTrace() {
  const [key, setKey] = useState<Key>('mutate')
  const p = PROGRAMS[key]
  return (
    <Figure
      title="What can a function do to the list you pass in?"
      caption={
        <>
          Step through each version of <code>add_bonus</code>. In every version the parameter <code>scores</code> starts as a second arrow to the caller's list. Mutating
          through that arrow changes the caller's list; reassigning <code>scores</code> only moves the local arrow; returning a new list leaves the input alone.
        </>
      }
    >
      <Segmented
        label="Function body"
        value={key}
        onChange={setKey}
        options={[
          { value: 'mutate', label: 'append' },
          { value: 'rebind', label: 'scores = …' },
          { value: 'pure', label: 'return new' },
        ]}
      />
      <TraceStepper code={p.code} steps={p.steps} resetKey={key} diagramLabel="Global and function frames pointing at list objects" />
    </Figure>
  )
}
