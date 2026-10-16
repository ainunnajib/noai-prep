/*
  A tiny shape checker that follows PyTorch's rules for the layers used in the shape-error visuals.
  Error messages are copied from real PyTorch 2.x runs (see the lesson for the code that produced them).
*/

export type Layer =
  | { k: 'linear'; inF: number; outF: number }
  | { k: 'relu' }
  | { k: 'flatten' }
  | { k: 'conv'; cin: number; cout: number; ks: number; pad: number }
  | { k: 'pool'; ks: number }
  | { k: 'view'; spec: number[] }
  | { k: 'T' }

export const fmtShape = (sh: number[]) => `(${sh.join(', ')}${sh.length === 1 ? ',' : ''})`

export function layerCode(l: Layer): string {
  switch (l.k) {
    case 'linear':
      return `nn.Linear(${l.inF}, ${l.outF})`
    case 'relu':
      return 'nn.ReLU()'
    case 'flatten':
      return 'nn.Flatten()'
    case 'conv':
      return `nn.Conv2d(${l.cin}, ${l.cout}, ${l.ks}, padding=${l.pad})`
    case 'pool':
      return `nn.MaxPool2d(${l.ks})`
    case 'view':
      return `x.view(${l.spec.join(', ')})`
    case 'T':
      return 'x.T'
  }
}

export interface MatErr {
  a: number
  b: number
  c: number
  d: number
}

export interface Step {
  code: string
  shape: number[] | null
  error?: string
  mat?: MatErr
}

const prod = (xs: number[]) => xs.reduce((a, b) => a * b, 1)

function apply(l: Layer, sh: number[]): { shape: number[] } | { error: string; mat?: MatErr } {
  switch (l.k) {
    case 'linear': {
      const last = sh[sh.length - 1]
      if (last !== l.inF) {
        const a = prod(sh.slice(0, -1))
        return { error: `RuntimeError: mat1 and mat2 shapes cannot be multiplied (${a}x${last} and ${l.inF}x${l.outF})`, mat: { a, b: last, c: l.inF, d: l.outF } }
      }
      return { shape: [...sh.slice(0, -1), l.outF] }
    }
    case 'relu':
      return { shape: sh }
    case 'flatten':
      return { shape: [sh[0], prod(sh.slice(1))] }
    case 'conv': {
      if (sh.length !== 4 || sh[1] !== l.cin)
        return {
          error: `RuntimeError: Given groups=1, weight of size [${l.cout}, ${l.cin}, ${l.ks}, ${l.ks}], expected input[${sh.join(', ')}] to have ${l.cin} channels, but got ${sh[1]} channels instead`,
        }
      const o = (n: number) => Math.floor((n + 2 * l.pad - l.ks) / 1) + 1
      return { shape: [sh[0], l.cout, o(sh[2]), o(sh[3])] }
    }
    case 'pool':
      return { shape: [sh[0], sh[1], Math.floor(sh[2] / l.ks), Math.floor(sh[3] / l.ks)] }
    case 'view': {
      const total = prod(sh)
      const known = prod(l.spec.filter((v) => v !== -1))
      if (total % known !== 0) return { error: `RuntimeError: shape '[${l.spec.join(', ')}]' is invalid for input of size ${total}` }
      return { shape: l.spec.map((v) => (v === -1 ? total / known : v)) }
    }
    case 'T':
      return { shape: [...sh].reverse() }
  }
}

export interface FlowResult {
  steps: Step[]
  /** 'ok' = runs and the output is right; 'silent' = runs but the output is wrong; 'error' = raises */
  status: 'ok' | 'silent' | 'error'
  message: string
  mat?: MatErr
}

/** Run input -> layers -> F.cross_entropy(out, y) with y of shape (batch,) and `classes` classes. */
export function runFlow(input: number[], layers: Layer[], batch: number, classes: number): FlowResult {
  const steps: Step[] = [{ code: 'x  (the input)', shape: input }]
  let sh = input
  for (const l of layers) {
    const r = apply(l, sh)
    if ('error' in r) {
      steps.push({ code: layerCode(l), shape: null, error: r.error, mat: r.mat })
      return { steps, status: 'error', message: r.error, mat: r.mat }
    }
    sh = r.shape
    steps.push({ code: layerCode(l), shape: sh })
  }
  const lossCode = `F.cross_entropy(out, y)   y: (${batch},)`
  if (sh.length > 2) {
    const msg = `RuntimeError: only batches of spatial targets supported (3D tensors) but got targets of dimension: 1`
    steps.push({ code: lossCode, shape: null, error: msg })
    return { steps, status: 'error', message: msg }
  }
  if (sh[0] !== batch) {
    const msg = `ValueError: Expected input batch_size (${sh[0]}) to match target batch_size (${batch}).`
    steps.push({ code: lossCode, shape: null, error: msg })
    return { steps, status: 'error', message: msg }
  }
  steps.push({ code: lossCode, shape: [] })
  if (sh[1] !== classes) return { steps, status: 'silent', message: `No error, but the model outputs ${sh[1]} scores per image for a ${classes}-class problem.` }
  return { steps, status: 'ok', message: `Output ${fmtShape(sh)}: one row of ${classes} class scores per image, and the loss computes.` }
}
