import { useState } from 'react'
import { Figure, Controls, Readout, Segmented, Button, mulberry32, useNarrow } from '../../../../../kit'
import { PyPanel, Out, MONO } from '../training-loop/PyCode'

/*
  Transfer learning on a small image classifier: three pretrained conv blocks and a new head.
  Lock layers (requires_grad = False), build the optimiser, run training steps, and watch which
  layers' weights actually change. A layer changes only if it gets a .grad (not frozen) AND the
  optimiser holds it. The silent bug: unfreezing a layer after building the optimiser from the
  trainable parameters only; it gets gradients but is never updated. (Checked in PyTorch, see the
  lesson's code.) Parameter counts are those of Conv2d(3,16,3), Conv2d(16,32,3), Conv2d(32,64,3), Linear(64,10).
*/

type L = 'conv1' | 'conv2' | 'conv3' | 'fc'
const LAYERS: { id: L; desc: string; n: number }[] = [
  { id: 'conv1', desc: 'Conv2d(3, 16, 3), pretrained', n: 448 },
  { id: 'conv2', desc: 'Conv2d(16, 32, 3), pretrained', n: 4640 },
  { id: 'conv3', desc: 'Conv2d(32, 64, 3), pretrained', n: 18496 },
  { id: 'fc', desc: 'Linear(64, 10), new head', n: 650 },
]
const ALL: L[] = ['conv1', 'conv2', 'conv3', 'fc']
type Build = 'all' | 'trainable'

interface State {
  frozen: Record<L, boolean>
  /** which layers were frozen when the optimiser was built */
  builtFrozen: Record<L, boolean>
  opt: L[]
  built: Build
  updates: Record<L, number>
  stepped: number
}

const INIT: State = {
  frozen: { conv1: true, conv2: true, conv3: true, fc: false },
  builtFrozen: { conv1: true, conv2: true, conv3: true, fc: false },
  opt: ['fc'],
  built: 'trainable',
  updates: { conv1: 0, conv2: 0, conv3: 0, fc: 3 },
  stepped: 3,
}

function Lock({ open }: { open: boolean }) {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 5 }}>
      <path d={open ? 'M3 6V4a3 3 0 0 1 5.8-1.1' : 'M3 6V4a3 3 0 0 1 6 0v2'} style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' }} />
      <rect x="1" y="6" width="10" height="7.5" rx="1.6" style={{ fill: 'currentColor' }} />
    </svg>
  )
}

function WeightStrip({ id, version, active }: { id: L; version: number; active: boolean }) {
  const r = mulberry32(id.length * 97 + id.charCodeAt(id.length - 1) * 13 + version * 7919)
  return (
    <div style={{ display: 'flex', gap: 2 }} aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => {
        const v = r()
        return (
          <span
            key={i}
            style={{
              width: 9,
              height: 16,
              borderRadius: 2,
              background: `color-mix(in srgb, ${v > 0.5 ? 'var(--viz-2)' : 'var(--viz-1)'} ${Math.round(20 + Math.abs(v - 0.5) * 140)}%, var(--surface))`,
              outline: active ? '2px solid var(--ok)' : undefined,
              transition: 'background 0.4s',
            }}
          />
        )
      })}
    </div>
  )
}

export default function FreezePanel() {
  const [s, setS] = useState<State>(INIT)
  const [buildMode, setBuildMode] = useState<Build>('trainable')
  const [last, setLast] = useState<Record<L, string> | null>(null)
  // a real PyTorch error from the last button press (everything frozen), or null
  const [err, setErr] = useState<{ line: string; msg: string; note: string } | null>(null)
  const [ref, narrow] = useNarrow<HTMLDivElement>(560)

  const trainable = LAYERS.filter((l) => !s.frozen[l.id]).reduce((a, l) => a + l.n, 0)
  const frozenN = LAYERS.filter((l) => s.frozen[l.id]).reduce((a, l) => a + l.n, 0)
  const inOpt = LAYERS.filter((l) => s.opt.includes(l.id)).reduce((a, l) => a + l.n, 0)

  const toggle = (id: L) => {
    setS({ ...s, frozen: { ...s.frozen, [id]: !s.frozen[id] } })
    setLast(null)
    setErr(null)
  }
  const build = () => {
    setLast(null)
    const opt = buildMode === 'all' ? ALL : ALL.filter((id) => !s.frozen[id])
    if (opt.length === 0) {
      // Adam([]) refuses; the old optimiser (if any) is kept
      setErr({
        line: 'optimizer = torch.optim.Adam([p for p in model.parameters() if p.requires_grad], lr=1e-3)',
        msg: 'ValueError: optimizer got an empty parameter list',
        note: 'Every layer is frozen, so the list of trainable parameters is empty. Unfreeze at least the head first.',
      })
      return
    }
    setErr(null)
    setS({ ...s, opt, built: buildMode, builtFrozen: { ...s.frozen } })
  }
  const step = () => {
    if (ALL.every((id) => s.frozen[id])) {
      setLast(null)
      setErr({
        line: 'loss.backward()',
        msg: 'RuntimeError: element 0 of tensors does not require grad and does not have a grad_fn',
        note: 'With every layer frozen, nothing in the forward pass requires grad, so autograd recorded no graph and the loss cannot be differentiated.',
      })
      return
    }
    setErr(null)
    const updates = { ...s.updates }
    const msg = {} as Record<L, string>
    for (const id of ALL) {
      const grad = !s.frozen[id]
      const held = s.opt.includes(id)
      if (grad && held) {
        updates[id]++
        msg[id] = 'updated'
      } else if (grad && !held) msg[id] = 'has .grad, but the optimiser does not hold it: NOT updated'
      else if (!grad && held) msg[id] = 'frozen: .grad is None, so step() skips it'
      else msg[id] = 'frozen: no .grad, not in the optimiser'
    }
    setS({ ...s, updates, stepped: s.stepped + 1 })
    setLast(msg)
  }

  // the code in the order it ran: freezing, building the optimiser, then any later changes
  const frozenAtBuild = ALL.filter((id) => s.builtFrozen[id])
  const changedAfter = ALL.filter((id) => s.builtFrozen[id] !== s.frozen[id])
  const code = [
    ...(frozenAtBuild.length ? frozenAtBuild.map((id) => `model.${id}.requires_grad_(False)`) : ['# nothing frozen']),
    s.built === 'all' ? 'optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)' : 'optimizer = torch.optim.Adam(',
    ...(s.built === 'all' ? [] : ['    [p for p in model.parameters() if p.requires_grad], lr=1e-3)']),
    `# the optimiser holds: ${s.opt.join(', ') || 'nothing'}`,
    ...changedAfter.map((id) => `model.${id}.requires_grad_(${s.frozen[id] ? 'False' : 'True'})   # changed after building`),
  ]
  const bug = ALL.some((id) => !s.frozen[id] && !s.opt.includes(id))

  return (
    <Figure
      wide
      title="Freeze, build the optimiser, take a step"
      caption={
        <>
          The three conv blocks are frozen and only the new head trains (try <b>Take a training step</b>). Now unlock <code>conv3</code> to fine-tune it and step again: it gets gradients but its
          weights do not move, because the optimiser was built before you unlocked it. Rebuild the optimiser and step once more. Also try building it from <code>model.parameters()</code>: frozen
          weights are then held but skipped, which is harmless.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'grid', gap: 6 }}>
        {LAYERS.map((l) => {
          const fr = s.frozen[l.id]
          const held = s.opt.includes(l.id)
          const m = last?.[l.id]
          const tone = !m ? 'var(--ink-3)' : m === 'updated' ? 'var(--ok)' : m.startsWith('has .grad') ? 'var(--bad)' : 'var(--ink-3)'
          return (
            <div
              key={l.id}
              style={{
                display: 'grid',
                gridTemplateColumns: narrow ? 'auto minmax(0, 1fr)' : 'auto minmax(0, 1.3fr) auto minmax(0, 1fr)',
                gap: narrow ? '4px 10px' : 12,
                alignItems: 'center',
                padding: '7px 10px',
                borderRadius: 10,
                border: `1.5px solid ${m && m.startsWith('has .grad') ? 'var(--bad)' : 'var(--rule)'}`,
                background: fr ? 'var(--surface-2)' : 'var(--surface)',
              }}
            >
              <button
                type="button"
                onClick={() => toggle(l.id)}
                aria-pressed={fr}
                aria-label={`${fr ? 'Unfreeze' : 'Freeze'} ${l.id}`}
                title={fr ? 'frozen: click to unfreeze' : 'trainable: click to freeze'}
                style={{
                  font: 'inherit',
                  fontSize: 12.5,
                  fontWeight: 700,
                  minWidth: 92,
                  padding: '5px 8px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  border: `1.5px solid ${fr ? 'var(--viz-axis)' : 'var(--viz-3)'}`,
                  background: fr ? 'var(--surface-3)' : 'color-mix(in srgb, var(--viz-3) 14%, var(--surface))',
                  color: 'var(--ink)',
                }}
              >
                <Lock open={!fr} />
                {fr ? 'frozen' : 'trainable'}
              </button>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                  {l.id} <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontSize: 12 }}>{l.n.toLocaleString('en-GB')} params</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{l.desc}</div>
              </div>
              <div style={{ display: 'grid', gap: 3, justifyItems: narrow ? 'start' : 'center', gridColumn: narrow ? '1 / 2' : undefined }}>
                <WeightStrip id={l.id} version={s.updates[l.id]} active={m === 'updated'} />
                <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>updated {s.updates[l.id]}×</span>
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.4, minWidth: 0 }}>
                <div style={{ fontWeight: 650, color: held ? 'var(--accent)' : 'var(--ink-3)' }}>{held ? 'in the optimiser' : 'not in the optimiser'}</div>
                {m && <div style={{ color: tone, fontWeight: m === 'updated' || tone === 'var(--bad)' ? 700 : 500 }}>{m}</div>}
              </div>
            </div>
          )
        })}
      </div>
      <PyPanel
        lines={code}
        tones={Object.fromEntries(code.map((l, i) => [i, l.includes('changed after') && l.includes('True') && bug ? 'warn' : undefined]).filter(([, t]) => t)) as Record<number, 'warn'>}
        size={narrow ? 11.5 : 12.5}
      />
      <Controls>
        <Segmented
          label="Build the optimiser from"
          value={buildMode}
          onChange={setBuildMode}
          options={[
            { value: 'trainable', label: 'trainable params only' },
            { value: 'all', label: 'model.parameters()' },
          ]}
        />
        <Button onClick={build}>Build the optimiser</Button>
        <Button primary onClick={step}>
          Take a training step
        </Button>
      </Controls>
      {err && (
        <div style={{ width: '100%', display: 'grid', gap: 4 }} role="alert">
          <Out tone="err" title={err.line}>
            {err.msg}
          </Out>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink-2)' }}>{err.note}</div>
        </div>
      )}
      <Readout
        items={[
          ['trainable', trainable.toLocaleString('en-GB')],
          ['frozen', frozenN.toLocaleString('en-GB')],
          ['held by the optimiser', inOpt.toLocaleString('en-GB')],
        ]}
      />
    </Figure>
  )
}
