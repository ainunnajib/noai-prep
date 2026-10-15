import { useState } from 'react'
import { Figure, Segmented, Toggle } from '../../../../../kit'
import { CodePanel, Note, Out, type LineTone } from '../reading-loss-curves/ui'
import s from './pg.module.css'

/*
  Asserts turn silent shape bugs into loud ones at the right line. A tiny text classifier averages
  token embeddings (B, T, C) over the T tokens and classifies the result. Inject a bug, switch the
  asserts on or off, and choose whether T and C are equal. The shapes are traced with PyTorch's rules
  and the messages match real runs (B = 4, T = 8, C = 16, K = 3).
*/

type Bug = 'none' | 'dim2' | 'dim0' | 'transpose'
const B = 4
const T = 8
const K = 3

interface Line {
  code: string
  /** shape after this line, or a message */
  note?: string
  tone?: LineTone
}

interface Trace {
  lines: Line[]
  outcome: 'ok' | 'silent' | 'error'
  message: string
  /** index of the line where it failed */
  at: number | null
}

const fmt = (sh: number[]) => `(${sh.join(', ')})`
const same = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i])

function trace(bug: Bug, asserts: boolean, C: number): Trace {
  const lines: Line[] = []
  const meanDim = bug === 'dim2' ? 2 : bug === 'dim0' ? 0 : 1
  lines.push({ code: 'def forward(self, tokens):', note: `tokens: (${B}, ${T})` })
  lines.push({ code: '    B, T = tokens.shape', note: `B = ${B}, T = ${T}` })
  let x = [B, T, C]
  lines.push({ code: '    x = self.embed(tokens)', note: fmt(x) })
  if (asserts) lines.push({ code: '    assert x.shape == (B, T, C)', note: 'passes' })
  if (bug === 'transpose') {
    x = [x[0], x[2], x[1]]
    lines.push({ code: '    x = x.transpose(1, 2)', note: fmt(x) })
  }
  x = x.filter((_, i) => i !== meanDim)
  lines.push({ code: `    x = x.mean(dim=${meanDim})`, note: fmt(x) })
  const fail = (at: number, message: string): Trace => {
    lines[at] = { ...lines[at], tone: 'bad', note: 'fails' }
    return { lines, outcome: 'error', message, at }
  }
  if (asserts) {
    lines.push({ code: '    assert x.shape == (B, C), x.shape' })
    if (!same(x, [B, C])) return fail(lines.length - 1, `AssertionError: torch.Size([${x.join(', ')}])`)
    lines[lines.length - 1].note = 'passes'
  }
  lines.push({ code: '    out = self.head(x)' })
  const last = x[x.length - 1]
  if (last !== C) {
    const a = x.slice(0, -1).reduce((p, q) => p * q, 1)
    return fail(lines.length - 1, `RuntimeError: mat1 and mat2 shapes cannot be multiplied (${a}x${last} and ${C}x${K})`)
  }
  const out = [...x.slice(0, -1), K]
  lines[lines.length - 1].note = fmt(out)
  if (asserts) {
    lines.push({ code: '    assert out.shape == (B, K)' })
    if (!same(out, [B, K])) return fail(lines.length - 1, 'AssertionError')
    lines[lines.length - 1].note = 'passes'
  }
  lines.push({ code: '    return out' })
  lines.push({ code: '' })
  lines.push({ code: 'loss = loss_fn(model(tokens), y)' })
  if (out[0] !== B) return fail(lines.length - 1, `ValueError: Expected input batch_size (${out[0]}) to match target batch_size (${B}).`)
  lines[lines.length - 1].note = 'a number'
  if (bug !== 'none') return { lines, outcome: 'silent', message: 'No error. The loss is a number and training runs, but the model averages the wrong axis.', at: null }
  return { lines, outcome: 'ok', message: 'No error, and every shape is the one you meant.', at: null }
}

export default function ShapeAssertions() {
  const [bug, setBug] = useState<Bug>('dim2')
  const [asserts, setAsserts] = useState(true)
  const [distinct, setDistinct] = useState(true)
  const C = distinct ? 16 : 8
  const tr = trace(bug, asserts, C)
  const tones: Record<number, LineTone> = {}
  const notes: Record<number, string> = {}
  tr.lines.forEach((l, i) => {
    if (l.tone) tones[i] = l.tone
    else if (l.code.trim().startsWith('assert')) tones[i] = 'hl'
    if (l.note) notes[i] = `→ ${l.note}`
  })

  let verdict: { tone: 'good' | 'bad' | 'warn'; text: string }
  if (tr.outcome === 'ok') verdict = { tone: 'good', text: 'No bug injected: every assert passes and the loss computes.' }
  else if (tr.outcome === 'silent')
    verdict = {
      tone: 'bad',
      text: distinct
        ? 'Silent: the bug slipped through. (Switch the asserts on.)'
        : `Silent, even with asserts: because T and C are both ${T}, the wrong shape (${B}, ${T}) looks exactly like the right one (${B}, ${C}). Use a different size for every dimension when you test.`,
    }
  else if (tr.message.startsWith('AssertionError'))
    verdict = { tone: 'good', text: `Caught on line ${tr.at! + 1}, the line right after the bug, and the message prints the shape that was actually there.` }
  else
    verdict = {
      tone: 'warn',
      text: `Caught, but only on line ${tr.at! + 1}, after the bug: the message talks about a matrix multiply or the batch size, not about the mean that caused it. Switch the asserts on to stop at the right place.`,
    }

  return (
    <Figure
      title="Asserts: make shape bugs loud"
      caption={
        <>
          A tiny text classifier: token embeddings of shape (B, T, C) are averaged over the T tokens, and a Linear(C, K) head scores K = 3 classes. Inject a bug, then compare
          running with and without the assert lines. Finally set T equal to C and watch a bug hide even from the asserts. The shapes follow PyTorch's rules and the
          messages match real runs.
        </>
      }
    >
      <div className={s.toggles}>
        <Segmented
          label="Bug"
          value={bug}
          onChange={setBug}
          options={[
            { value: 'none', label: 'none' },
            { value: 'dim2', label: 'mean(dim=2)' },
            { value: 'dim0', label: 'mean(dim=0)' },
            { value: 'transpose', label: 'stray transpose' },
          ]}
        />
        <Segmented
          label="Test sizes"
          value={distinct ? 'd' : 'e'}
          onChange={(v) => setDistinct(v === 'd')}
          options={[
            { value: 'd', label: 'T = 8, C = 16' },
            { value: 'e', label: 'T = C = 8' },
          ]}
        />
        <Toggle label="assert lines" checked={asserts} onChange={setAsserts} />
      </div>
      <CodePanel lines={tr.lines.map((l) => l.code)} tones={tones} notes={notes} title="forward pass, traced" size={12} />
      {tr.outcome === 'error' ? (
        <Out tone="err" title={`stopped at line ${tr.at! + 1}`}>
          {tr.message}
        </Out>
      ) : (
        <Out tone={tr.outcome === 'ok' ? 'ok' : 'out'} title="finished">
          {tr.message}
        </Out>
      )}
      <Note tone={verdict.tone}>{verdict.text}</Note>
    </Figure>
  )
}
