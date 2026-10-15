import { useState, type ReactNode } from 'react'
import { Figure, Controls, Segmented, Toggle, Readout, useNarrow } from '../../../../../kit'
import css from './modules.module.css'

/*
  TinyNet: Linear -> ReLU -> Linear, as a real nn.Module. Edit the four layer sizes in the code,
  choose how the layers are stored (as attributes, a plain Python list, or nn.ModuleList), or delete
  super().__init__(). The module tree, model.parameters(), print(model) and a forward-pass shape
  trace all update, using the same rules and messages as PyTorch 2.x.
*/

type Storage = 'attr' | 'list' | 'modulelist'
type Sel = 'root' | 'fc1' | 'act' | 'fc2' | 'layers'

const N = 5 // batch size of the example input
const F = 4 // the data has 4 features

interface Sizes {
  i1: number
  o1: number
  i2: number
  o2: number
}

function Num({ v, set, min = 1, max = 16, label }: { v: number; set: (n: number) => void; min?: number; max?: number; label: string }) {
  return (
    <span className={css.num}>
      <button type="button" className={css.stepBtn} onClick={() => set(Math.max(min, v - 1))} aria-label={`decrease ${label}`}>
        ◀
      </button>
      <b>{v}</b>
      <button type="button" className={css.stepBtn} onClick={() => set(Math.min(max, v + 1))} aria-label={`increase ${label}`}>
        ▶
      </button>
    </span>
  )
}

export default function ModuleTreeExplorer() {
  const [sz, setSz] = useState<Sizes>({ i1: 4, o1: 8, i2: 8, o2: 3 })
  const [storage, setStorage] = useState<Storage>('attr')
  const [withSuper, setWithSuper] = useState(true)
  const [sel, setSel] = useState<Sel>('root')
  const set = (k: keyof Sizes) => (n: number) => setSz((s) => ({ ...s, [k]: n }))
  // phones: indent by 2 spaces per level so the ◀ ▶ steppers stay on screen
  const [wrapRef, narrow] = useNarrow<HTMLDivElement>(560)
  const I = (level: number) => ' '.repeat(level * (narrow ? 2 : 4))

  const registered = storage !== 'list'
  const names = storage === 'modulelist' ? { fc1: 'layers.0', act: 'layers.1', fc2: 'layers.2' } : { fc1: 'fc1', act: 'act', fc2: 'fc2' }
  const params = registered
    ? [
        { name: `${names.fc1}.weight`, shape: [sz.o1, sz.i1], owner: 'fc1' as Sel },
        { name: `${names.fc1}.bias`, shape: [sz.o1], owner: 'fc1' as Sel },
        { name: `${names.fc2}.weight`, shape: [sz.o2, sz.i2], owner: 'fc2' as Sel },
        { name: `${names.fc2}.bias`, shape: [sz.o2], owner: 'fc2' as Sel },
      ]
    : []
  const numel = (s: number[]) => s.reduce((a, b) => a * b, 1)
  const total = params.reduce((a, p) => a + numel(p.shape), 0)
  const shown = params.filter((p) => sel === 'root' || sel === 'layers' || p.owner === sel)

  // forward trace with real error messages
  const trace: { label: string; shape?: string; err?: string }[] = [{ label: 'x', shape: `(${N}, ${F})` }]
  let width = F
  let failed = false
  for (const [layer, i, o] of [
    ['fc1', sz.i1, sz.o1],
    ['act', 0, 0],
    ['fc2', sz.i2, sz.o2],
  ] as [string, number, number][]) {
    if (failed) break
    if (layer === 'act') {
      trace.push({ label: 'ReLU', shape: `(${N}, ${width})` })
      continue
    }
    if (width !== i) {
      trace.push({ label: `Linear(${i}, ${o})`, err: `RuntimeError: mat1 and mat2 shapes cannot be multiplied (${N}x${width} and ${i}x${o})` })
      failed = true
    } else {
      width = o
      trace.push({ label: `Linear(${i}, ${o})`, shape: `(${N}, ${o})` })
    }
  }
  const fwdErr = trace.find((t) => t.err)?.err

  const lin = (i: number, o: number) => `Linear(in_features=${i}, out_features=${o}, bias=True)`
  const printed =
    storage === 'attr'
      ? `TinyNet(\n  (fc1): ${lin(sz.i1, sz.o1)}\n  (act): ReLU()\n  (fc2): ${lin(sz.i2, sz.o2)}\n)`
      : storage === 'list'
        ? 'TinyNet()'
        : `TinyNet(\n  (layers): ModuleList(\n    (0): ${lin(sz.i1, sz.o1)}\n    (1): ReLU()\n    (2): ${lin(sz.i2, sz.o2)}\n  )\n)`

  const L = (content: ReactNode, opts: { on?: boolean; gone?: boolean } = {}, key?: string | number) => (
    <span key={key} className={`${css.line} ${opts.on ? css.lineOn : ''} ${opts.gone ? css.lineGone : ''}`}>
      {content}
    </span>
  )
  const k = (t: string) => <span className={css.kw}>{t}</span>
  const linCode = (a: keyof Sizes, b: keyof Sizes, which: string) => (
    <>
      nn.Linear(
      <Num v={sz[a]} set={set(a)} label={`${which} in_features`} />, <Num v={sz[b]} set={set(b)} label={`${which} out_features`} />)
    </>
  )

  const initLines: ReactNode[] =
    storage === 'attr'
      ? [
          L(<>{I(2)}self.fc1 = {linCode('i1', 'o1', 'fc1')}</>, { on: sel === 'fc1' }, 'a1'),
          L(<>{I(2)}self.act = nn.ReLU()</>, { on: sel === 'act' }, 'a2'),
          L(<>{I(2)}self.fc2 = {linCode('i2', 'o2', 'fc2')}</>, { on: sel === 'fc2' }, 'a3'),
        ]
      : [
          L(<>{I(2)}self.layers = {storage === 'modulelist' ? 'nn.ModuleList([' : '['}</>, { on: sel === 'layers' }, 'l0'),
          L(<>{I(3)}{linCode('i1', 'o1', 'first layer')},</>, { on: sel === 'fc1' }, 'l1'),
          L(<>{I(3)}nn.ReLU(),</>, { on: sel === 'act' }, 'l2'),
          L(<>{I(3)}{linCode('i2', 'o2', 'second layer')},</>, { on: sel === 'fc2' }, 'l3'),
          L(<>{I(2)}{storage === 'modulelist' ? '])' : ']'}</>, {}, 'l4'),
        ]
  const fwdLines: ReactNode[] =
    storage === 'attr'
      ? [L(I(2) + 'x = self.fc1(x)', {}, 'f1'), L(I(2) + 'x = self.act(x)', {}, 'f2'), L(I(2) + 'return self.fc2(x)', {}, 'f3')]
      : [L(I(2) + 'for layer in self.layers:', {}, 'f1'), L(I(3) + 'x = layer(x)', {}, 'f2'), L(I(2) + 'return x', {}, 'f3')]

  const treeNode = (id: Sel, label: string, kind: string, depth: number, count?: number) => (
    <button type="button" key={id} className={`${css.node} ${sel === id ? css.nodeOn : ''}`} style={{ marginLeft: depth * 18, width: `calc(100% - ${depth * 18}px)` }} onClick={() => setSel(id)}>
      <span className={css.mono} style={{ fontWeight: 700 }}>
        {label}
      </span>
      <span className={css.nodeKind}>{kind}</span>
      {count != null && <span className={css.count}>{count} params</span>}
    </button>
  )

  return (
    <Figure
      wide
      title="Inside an nn.Module: what gets registered"
      caption={
        <>
          Click a node in the tree to see its parameters. Change the layer sizes with ◀ ▶ inside the code: the weight shapes and the forward trace follow, and a
          size that does not match the incoming data stops the forward pass. Then switch the storage to a plain Python list (the layers still run, but{' '}
          <code>model.parameters()</code> is empty, so nothing would be trained) and switch off <code>super().__init__()</code>.
        </>
      }
    >
      <Controls>
        <Segmented
          label="Store the layers as"
          value={storage}
          onChange={(v) => {
            setStorage(v)
            setSel('root')
          }}
          options={[
            { value: 'attr', label: 'attributes' },
            { value: 'list', label: 'a Python list' },
            { value: 'modulelist', label: 'nn.ModuleList' },
          ]}
        />
        <Toggle label={<code>super().__init__()</code>} checked={withSuper} onChange={setWithSuper} />
      </Controls>

      <div ref={wrapRef} style={{ width: '100%' }}>
      <pre className={`${css.code} ${narrow ? css.codeNarrow : ''}`} aria-label="The model's code">
        {L(
          <>
            {k('class')} TinyNet(nn.Module):
          </>,
        )}
        {L(
          <>
            {I(1)}
            {k('def')} __init__(self):
          </>,
        )}
        {L(I(2) + 'super().__init__()', { gone: !withSuper, on: !withSuper })}
        {initLines}
        {L(
          <>
            {I(1)}
            {k('def')} forward(self, x):
          </>,
        )}
        {fwdLines}
      </pre>
      </div>

      {!withSuper ? (
        storage === 'list' ? (
          <div className={css.err} role="alert">
            {`model = TinyNet()             # no error yet\nlist(model.parameters())\nAttributeError: 'TinyNet' object has no attribute '_parameters'`}
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--ink-2)', marginTop: 4 }}>
              A plain list is stored like any Python attribute, so building the model seems to work. But <code>nn.Module.__init__</code> never ran, so the
              registries that hold parameters and sub-modules do not exist: the first thing that needs them (<code>model.parameters()</code>,{' '}
              <code>model(x)</code>, <code>print(model)</code>) fails.
            </div>
          </div>
        ) : (
          <div className={css.err} role="alert">
            {`model = TinyNet()\nAttributeError: cannot assign module before Module.__init__() call`}
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--ink-2)', marginTop: 4 }}>
              <code>nn.Module.__init__</code> creates the registries that hold parameters and sub-modules. Without it, the very first{' '}
              <code>{storage === 'attr' ? 'self.fc1 = …' : 'self.layers = nn.ModuleList(…)'}</code> has nowhere to go, so building the model fails.
            </div>
          </div>
        )
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, width: '100%' }}>
            <div className={css.tree} aria-label="Module tree">
              <div className={css.note} style={{ fontWeight: 700 }}>
                model.named_modules()
              </div>
              {treeNode('root', 'TinyNet', 'model', 0, total)}
              {storage === 'attr' && (
                <>
                  {treeNode('fc1', 'fc1', 'Linear', 1, sz.i1 * sz.o1 + sz.o1)}
                  {treeNode('act', 'act', 'ReLU', 1, 0)}
                  {treeNode('fc2', 'fc2', 'Linear', 1, sz.i2 * sz.o2 + sz.o2)}
                </>
              )}
              {storage === 'modulelist' && (
                <>
                  {treeNode('layers', 'layers', 'ModuleList', 1, total)}
                  {treeNode('fc1', '0', 'Linear', 2, sz.i1 * sz.o1 + sz.o1)}
                  {treeNode('act', '1', 'ReLU', 2, 0)}
                  {treeNode('fc2', '2', 'Linear', 2, sz.i2 * sz.o2 + sz.o2)}
                </>
              )}
              {storage === 'list' && <div className={css.note}>No children: a plain list is invisible to PyTorch, so its layers are never registered.</div>}
            </div>
            <div style={{ display: 'grid', gap: 6, alignContent: 'start' }}>
              <div className={css.note} style={{ fontWeight: 700 }}>
                {sel === 'root' ? 'model.named_parameters()' : `parameters of ${sel === 'layers' ? 'layers' : storage === 'modulelist' ? `layers.${sel === 'fc1' ? 0 : sel === 'act' ? 1 : 2}` : sel}`}
              </div>
              {shown.length ? (
                <table className={css.table}>
                  <thead>
                    <tr>
                      <th>name</th>
                      <th>shape</th>
                      <th>numel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((p) => (
                      <tr key={p.name}>
                        <td>{p.name}</td>
                        <td>({p.shape.join(', ')}{p.shape.length === 1 ? ',' : ''})</td>
                        <td>{numel(p.shape)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className={css.note}>{registered ? 'ReLU has no parameters: it is a fixed function.' : 'Empty: nothing was registered.'}</div>
              )}
            </div>
          </div>

          <div className={css.trace} aria-label="Forward pass shapes">
            {trace.map((t, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <span className={css.arrow}>→</span>}
                {i > 0 && <span className={`${css.layer} ${t.err ? css.bad : ''}`} style={t.err ? { color: 'var(--bad)' } : undefined}>{t.label}</span>}
                {t.shape && (
                  <>
                    {i > 0 && <span className={css.arrow}>→</span>}
                    <span className={css.shape}>{i === 0 ? `x ${t.shape}` : t.shape}</span>
                  </>
                )}
              </span>
            ))}
          </div>
          {fwdErr && <div className={css.err}>{`model(x)\n${fwdErr}`}</div>}

          <pre className={css.out}>
            <span className={css.comment}>{'>>> '}</span>
            {'print(model)\n'}
            {printed}
          </pre>
          <Readout
            items={[
              ['sum(p.numel() for p in model.parameters())', String(total)],
              ['torch.optim.SGD(model.parameters(), lr=0.1)', registered ? 'OK' : 'ValueError: optimizer got an empty parameter list'],
            ]}
          />
        </>
      )}
    </Figure>
  )
}
