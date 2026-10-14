import { useState } from 'react'
import { Figure, Segmented } from '../../../../../kit'
import { TraceStepper, out, type TraceStep } from './pyviz'

/*
  Python-Tutor style stepper: names on the left, objects on the right, arrows between them.
  Four tiny programs that look alike but behave differently: alias, copy, rebind, and ints.
*/

type Key = 'alias' | 'copy' | 'rebind' | 'ints'

const G = 'Global names'

const PROGRAMS: Record<Key, { code: string; steps: TraceStep[] }> = {
  alias: {
    code: 'a = [1, 2]\nb = a\nb.append(3)\nprint(a)',
    steps: [
      {
        line: [1],
        note: <>Python first builds a list object holding 1 and 2, then points the name <code>a</code> at it.</>,
        frames: [{ id: 'g', label: G, names: [{ name: 'a', to: 'L1', hl: true }] }],
        objects: [{ id: 'L1', type: 'list', cells: ['1', '2'], hl: true }],
        out: [],
      },
      {
        line: [2],
        note: <><code>b = a</code> copies the <b>arrow</b>, not the list. Two names now point at one list, so <code>b</code> is an alias of <code>a</code>.</>,
        frames: [{ id: 'g', label: G, names: [{ name: 'a', to: 'L1' }, { name: 'b', to: 'L1', hl: true }] }],
        objects: [{ id: 'L1', type: 'list', cells: ['1', '2'] }],
        out: [],
      },
      {
        line: [3],
        note: <><code>b.append(3)</code> follows b's arrow and changes that list <b>in place</b>. No arrow moved.</>,
        frames: [{ id: 'g', label: G, names: [{ name: 'a', to: 'L1' }, { name: 'b', to: 'L1' }] }],
        objects: [{ id: 'L1', type: 'list', cells: ['1', '2', '3'], hl: true }],
        out: [],
      },
      {
        line: [4],
        note: <>Follow <code>a</code>'s arrow: it reaches the same list that <code>b</code> changed, so <code>a</code> shows the 3 too.</>,
        frames: [{ id: 'g', label: G, names: [{ name: 'a', to: 'L1', hl: true }, { name: 'b', to: 'L1' }] }],
        objects: [{ id: 'L1', type: 'list', cells: ['1', '2', '3'] }],
        out: out('[1, 2, 3]'),
        predict: { q: 'What does print(a) show?', options: ['[1, 2]', '[1, 2, 3]', '[3]'], answer: 1 },
      },
    ],
  },
  copy: {
    code: 'a = [1, 2]\nb = a.copy()\nb.append(3)\nprint(a)',
    steps: [
      {
        line: [1],
        note: <>Build a list holding 1 and 2 and point <code>a</code> at it.</>,
        frames: [{ id: 'g', label: G, names: [{ name: 'a', to: 'L1', hl: true }] }],
        objects: [{ id: 'L1', type: 'list', cells: ['1', '2'], hl: true }],
        out: [],
      },
      {
        line: [2],
        note: <><code>a.copy()</code> builds a <b>brand-new</b> list with the same items. Now there are two lists, one per name.</>,
        frames: [{ id: 'g', label: G, names: [{ name: 'a', to: 'L1' }, { name: 'b', to: 'L2', hl: true }] }],
        objects: [
          { id: 'L1', type: 'list', cells: ['1', '2'] },
          { id: 'L2', type: 'list', cells: ['1', '2'], hl: true },
        ],
        out: [],
      },
      {
        line: [3],
        note: <><code>b.append(3)</code> changes only the list that <code>b</code> points at.</>,
        frames: [{ id: 'g', label: G, names: [{ name: 'a', to: 'L1' }, { name: 'b', to: 'L2' }] }],
        objects: [
          { id: 'L1', type: 'list', cells: ['1', '2'] },
          { id: 'L2', type: 'list', cells: ['1', '2', '3'], hl: true },
        ],
        out: [],
      },
      {
        line: [4],
        note: <><code>a</code> still points at the original list, which nobody changed.</>,
        frames: [{ id: 'g', label: G, names: [{ name: 'a', to: 'L1', hl: true }, { name: 'b', to: 'L2' }] }],
        objects: [
          { id: 'L1', type: 'list', cells: ['1', '2'] },
          { id: 'L2', type: 'list', cells: ['1', '2', '3'] },
        ],
        out: out('[1, 2]'),
        predict: { q: 'What does print(a) show?', options: ['[1, 2]', '[1, 2, 3]', '[3]'], answer: 0 },
      },
    ],
  },
  rebind: {
    code: 'a = [1, 2]\nb = a\nb = [9]\nprint(a)',
    steps: [
      {
        line: [1],
        note: <>Build a list holding 1 and 2 and point <code>a</code> at it.</>,
        frames: [{ id: 'g', label: G, names: [{ name: 'a', to: 'L1', hl: true }] }],
        objects: [{ id: 'L1', type: 'list', cells: ['1', '2'], hl: true }],
        out: [],
      },
      {
        line: [2],
        note: <><code>b = a</code>: two names, one list (an alias), exactly as before.</>,
        frames: [{ id: 'g', label: G, names: [{ name: 'a', to: 'L1' }, { name: 'b', to: 'L1', hl: true }] }],
        objects: [{ id: 'L1', type: 'list', cells: ['1', '2'] }],
        out: [],
      },
      {
        line: [3],
        note: <><code>b = [9]</code> does not touch the old list. It builds a new list and moves <b>only b's arrow</b>. This is rebinding, not mutating.</>,
        frames: [{ id: 'g', label: G, names: [{ name: 'a', to: 'L1' }, { name: 'b', to: 'L2', hl: true }] }],
        objects: [
          { id: 'L1', type: 'list', cells: ['1', '2'] },
          { id: 'L2', type: 'list', cells: ['9'], hl: true },
        ],
        out: [],
      },
      {
        line: [4],
        note: <>The list that <code>a</code> points at was never changed.</>,
        frames: [{ id: 'g', label: G, names: [{ name: 'a', to: 'L1', hl: true }, { name: 'b', to: 'L2' }] }],
        objects: [
          { id: 'L1', type: 'list', cells: ['1', '2'] },
          { id: 'L2', type: 'list', cells: ['9'] },
        ],
        out: out('[1, 2]'),
        predict: { q: 'What does print(a) show?', options: ['[1, 2]', '[9]', '[1, 2, 9]'], answer: 0 },
      },
    ],
  },
  ints: {
    code: 'x = 5\ny = x\ny = y + 1\nprint(x)',
    steps: [
      {
        line: [1],
        note: <>Numbers are objects too: <code>x</code> points at an int object 5.</>,
        frames: [{ id: 'g', label: G, names: [{ name: 'x', to: 'I5', hl: true }] }],
        objects: [{ id: 'I5', type: 'int', cells: ['5'], hl: true }],
        out: [],
      },
      {
        line: [2],
        note: <><code>y = x</code> points <code>y</code> at the same int object. Nothing is copied.</>,
        frames: [{ id: 'g', label: G, names: [{ name: 'x', to: 'I5' }, { name: 'y', to: 'I5', hl: true }] }],
        objects: [{ id: 'I5', type: 'int', cells: ['5'] }],
        out: [],
      },
      {
        line: [3],
        note: <>An int is <b>immutable</b>: it can never change. So <code>y + 1</code> builds a new int 6, and only <code>y</code>'s arrow moves to it.</>,
        frames: [{ id: 'g', label: G, names: [{ name: 'x', to: 'I5' }, { name: 'y', to: 'I6', hl: true }] }],
        objects: [
          { id: 'I5', type: 'int', cells: ['5'] },
          { id: 'I6', type: 'int', cells: ['6'], hl: true },
        ],
        out: [],
      },
      {
        line: [4],
        note: <>Immutable objects are always safe to share: no one can change them behind your back.</>,
        frames: [{ id: 'g', label: G, names: [{ name: 'x', to: 'I5', hl: true }, { name: 'y', to: 'I6' }] }],
        objects: [
          { id: 'I5', type: 'int', cells: ['5'] },
          { id: 'I6', type: 'int', cells: ['6'] },
        ],
        out: out('5'),
        predict: { q: 'What does print(x) show?', options: ['5', '6', 'an error'], answer: 0 },
      },
    ],
  },
}

export default function ReferenceArrows() {
  const [key, setKey] = useState<Key>('alias')
  const p = PROGRAMS[key]
  return (
    <Figure
      title="Names point at objects: step through four look-alike programs"
      caption={
        <>
          Pick a program and press <b>Next</b> one line at a time. Before the last line runs, predict what it prints. Watch which steps <b>move an arrow</b>{' '}
          (assignment with <code>=</code>) and which <b>change an object</b> (<code>.append</code>). Only the second kind is seen through every name that points at the object.
        </>
      }
    >
      <Segmented
        label="Program"
        value={key}
        onChange={setKey}
        options={[
          { value: 'alias', label: 'b = a' },
          { value: 'copy', label: 'a.copy()' },
          { value: 'rebind', label: 'b = [9]' },
          { value: 'ints', label: 'ints' },
        ]}
      />
      <TraceStepper code={p.code} steps={p.steps} resetKey={key} diagramLabel={`Names and objects for the program ${p.code.replace(/\n/g, '; ')}`} />
    </Figure>
  )
}
