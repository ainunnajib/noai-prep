/*
  A symbolic trace of what each line of a training-loop body does to the tensors, following
  PyTorch's rules:
  - optimizer.zero_grad() sets every .grad to None (set_to_none=True is the default since PyTorch 2.0)
  - optimizer.step() skips a parameter whose .grad is None, otherwise updates the weights in place
  - loss.backward() ADDS this batch's gradient to .grad, and fails if the weights were changed in
    place after the forward pass that built the graph
  - Python raises NameError when a variable is used before it was first assigned
  The trace explains WHY; the outcome itself (loss curve, error) comes from real PyTorch runs in
  loopData.ts. tests: the classification below agrees with those runs for all 326 programs.
*/

export type LineId = 'Z' | 'F' | 'C' | 'B' | 'S'

export const LINE_CODE: Record<LineId, string> = {
  Z: 'optimizer.zero_grad()',
  F: 'outputs = model(inputs)',
  C: 'loss = criterion(outputs, targets)',
  B: 'loss.backward()',
  S: 'optimizer.step()',
}

export type Tone = 'ok' | 'warn' | 'bad' | 'muted'
export interface LineNote {
  text: string
  tone: Tone
}

export type Verdict = 'learns' | 'lags' | 'flat' | 'unstable' | 'crash'

export interface Trace {
  /** notes[iteration-1][position in program] */
  notes: LineNote[][]
  verdict: Verdict
  crash?: { iter: number; line: LineId; type: string }
}

export function traceProgram(prog: LineId[], iterations = 3): Trace {
  let grad: number[] | null = null
  let outputs: { iter: number; ver: number } | null = null
  let loss: { iter: number; ver: number } | null = null
  let ver = 0
  let stepped = false
  let stale = false
  let summed = false
  const notes: LineNote[][] = []
  for (let t = 1; t <= iterations; t++) {
    const row: LineNote[] = []
    notes.push(row)
    for (const line of prog) {
      if (line === 'Z') {
        row.push(grad ? { text: '.grad cleared (set to None)', tone: 'ok' } : { text: '.grad is already None', tone: 'muted' })
        grad = null
      } else if (line === 'F') {
        outputs = { iter: t, ver }
        row.push({ text: `predictions for batch ${t}`, tone: 'ok' })
      } else if (line === 'C') {
        if (!outputs) {
          row.push({ text: "NameError: 'outputs' does not exist yet", tone: 'bad' })
          return { notes, verdict: 'crash', crash: { iter: t, line, type: 'NameError' } }
        }
        loss = { ...outputs }
        row.push({ text: outputs.iter === t ? `loss for batch ${t}` : `loss from batch ${outputs.iter}'s predictions`, tone: outputs.iter === t ? 'ok' : 'warn' })
      } else if (line === 'B') {
        if (!loss) {
          row.push({ text: "NameError: 'loss' does not exist yet", tone: 'bad' })
          return { notes, verdict: 'crash', crash: { iter: t, line, type: 'NameError' } }
        }
        if (loss.ver !== ver) {
          row.push({ text: 'RuntimeError: weights changed in place since the forward pass', tone: 'bad' })
          return { notes, verdict: 'crash', crash: { iter: t, line, type: 'RuntimeError' } }
        }
        if (grad) {
          grad = [...grad, loss.iter]
          row.push({ text: `.grad += batch ${loss.iter}'s gradient (now a sum of ${grad.length} batches)`, tone: 'warn' })
        } else {
          grad = [loss.iter]
          row.push({ text: `.grad = batch ${loss.iter}'s gradient`, tone: 'ok' })
        }
      } else {
        if (!grad) {
          row.push({ text: 'skipped: .grad is None, nothing to apply', tone: 'warn' })
        } else {
          stepped = true
          ver++
          if (grad.length > 1) {
            summed = true
            row.push({ text: `weights move using ${grad.length} batches' gradients added up`, tone: 'bad' })
          } else if (grad[0] !== t) {
            stale = true
            row.push({ text: `weights move using batch ${grad[0]}'s gradient`, tone: 'warn' })
          } else {
            row.push({ text: `weights move using batch ${t}'s gradient`, tone: 'ok' })
          }
        }
      }
    }
  }
  const verdict: Verdict = !stepped ? 'flat' : summed ? 'unstable' : stale ? 'lags' : 'learns'
  return { notes, verdict }
}
