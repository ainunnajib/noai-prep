/*
  The numbers behind ParamBufferInspector: a BatchNorm-style module MyNorm(3), simulated exactly.

    class MyNorm(nn.Module):
        def __init__(self, n=3, momentum=0.1, eps=1e-5):
            super().__init__()
            self.gamma = nn.Parameter(torch.ones(n))
            self.beta = nn.Parameter(torch.zeros(n))
            self.register_buffer('running_mean', torch.zeros(n))
            self.register_buffer('running_var', torch.ones(n))
            self.num_batches = torch.tensor(0)
            self.momentum, self.eps = momentum, eps

        def forward(self, x):
            if self.training:
                mean = x.mean(dim=0)
                var = x.var(dim=0, unbiased=False)
                with torch.no_grad():
                    self.running_mean.mul_(1 - self.momentum).add_(self.momentum * mean)
                    self.running_var.mul_(1 - self.momentum).add_(self.momentum * var)
                    self.num_batches += 1
            else:
                mean, var = self.running_mean, self.running_var
            return self.gamma * (x - mean) / torch.sqrt(var + self.eps) + self.beta

  Training step: loss = ((model(X) - Y) ** 2).mean(); loss.backward(); SGD(lr=0.3).step().
  Checked against PyTorch: step 1 gives loss 1.1667, gamma [1.2, 0.9, 1.1], beta [0.2, -0.2, 0],
  running_mean [0.2, 0.4, 0.5], running_var [1.0, 1.1, 1.1]; after 3 steps, eval on [3, 4, 7]
  gives [4.1455, 1.4674, 6.2289].
*/

export type Name = 'gamma' | 'beta' | 'running_mean' | 'running_var' | 'num_batches'
export type Kind = 'param' | 'buffer' | 'plain'
export type Vec = [number, number, number]

export const NAMES: Name[] = ['gamma', 'beta', 'running_mean', 'running_var', 'num_batches']
export const DEFAULT_KINDS: Record<Name, Kind> = { gamma: 'param', beta: 'param', running_mean: 'buffer', running_var: 'buffer', num_batches: 'plain' }

export interface Values {
  gamma: Vec
  beta: Vec
  running_mean: Vec
  running_var: Vec
  num_batches: number
}

export const INIT: Values = { gamma: [1, 1, 1], beta: [0, 0, 0], running_mean: [0, 0, 0], running_var: [1, 1, 1], num_batches: 0 }

export const X: Vec[] = [
  [1, 2, 3],
  [3, 6, 5],
  [1, 4, 7],
  [3, 4, 5],
]
export const X_NEW: Vec = [3, 4, 7]
const A: Vec = [2, 0.5, 1.5] // the targets were made as A * x_norm + C
const C: Vec = [1, -1, 0]
export const LR = 0.3
export const MOM = 0.1
export const EPS = 1e-5

const N = X.length
const col = (j: number) => X.map((r) => r[j])
const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length

export const BATCH_MEAN = [0, 1, 2].map((j) => mean(col(j))) as Vec
export const BATCH_VAR = [0, 1, 2].map((j) => mean(col(j).map((v) => (v - BATCH_MEAN[j]) ** 2))) as Vec
const XN = X.map((r) => r.map((v, j) => (v - BATCH_MEAN[j]) / Math.sqrt(BATCH_VAR[j] + EPS)))
const Y = XN.map((r) => r.map((v, j) => A[j] * v + C[j]))

/** the tensors forward() touches when it runs on a GPU; a plain attribute among them stays on the CPU */
export type StepResult = { next: Values; loss?: number; error?: string; partial?: Name }

export const DEVICE_ERROR = 'RuntimeError: Expected all tensors to be on the same device, but found at least two devices, cuda:0 and cpu!'
/** what SGD(model.parameters()) raises when nothing is registered as a Parameter */
export const EMPTY_OPT_ERROR = 'ValueError: optimizer got an empty parameter list'
/** what loss.backward() raises when nothing used in the training forward pass requires grad */
export const NO_GRAD_ERROR = 'RuntimeError: element 0 of tensors does not require grad and does not have a grad_fn'

const map3 = (f: (j: number) => number) => [f(0), f(1), f(2)] as Vec

/** model.train(); out = model(X); loss.backward(); optimizer.step() */
export function trainStep(v: Values, kinds: Record<Name, Kind>, onGpu: boolean): StepResult {
  const next: Values = { ...v, gamma: [...v.gamma] as Vec, beta: [...v.beta] as Vec, running_mean: [...v.running_mean] as Vec, running_var: [...v.running_var] as Vec }
  const cpuOnly = (n: Name) => onGpu && kinds[n] === 'plain'
  // running_mean.mul_(0.9) runs on its own device; .add_(0.1 * mean) then needs the GPU batch mean
  for (const [n, batch] of [
    ['running_mean', BATCH_MEAN],
    ['running_var', BATCH_VAR],
  ] as const) {
    if (cpuOnly(n)) {
      next[n] = map3((j) => next[n][j] * (1 - MOM))
      return { next, error: DEVICE_ERROR, partial: n }
    }
    next[n] = map3((j) => next[n][j] * (1 - MOM) + MOM * batch[j])
  }
  next.num_batches += 1 // fine on either device: it never meets a GPU tensor
  if (cpuOnly('gamma') || cpuOnly('beta')) return { next, error: DEVICE_ERROR }
  // forward() ran (and updated the statistics), but if neither gamma nor beta is a Parameter the
  // output does not require grad, so loss.backward() has nothing to differentiate
  if (kinds.gamma !== 'param' && kinds.beta !== 'param') return { next, error: NO_GRAD_ERROR }
  // forward output with the batch statistics, then the MSE loss and its gradients
  const out = XN.map((r) => r.map((x, j) => v.gamma[j] * x + v.beta[j]))
  let loss = 0
  const dG = [0, 0, 0]
  const dB = [0, 0, 0]
  out.forEach((r, i) =>
    r.forEach((o, j) => {
      const d = o - Y[i][j]
      loss += d * d
      const g = (2 * d) / (N * 3)
      dG[j] += g * XN[i][j]
      dB[j] += g
    }),
  )
  loss /= N * 3
  // optimizer.step() only touches registered parameters that received a gradient (gamma, beta)
  if (kinds.gamma === 'param') next.gamma = map3((j) => v.gamma[j] - LR * dG[j])
  if (kinds.beta === 'param') next.beta = map3((j) => v.beta[j] - LR * dB[j])
  return { next, loss }
}

/** model.eval(); with torch.no_grad(): model(X_NEW) */
export function evaluate(v: Values, kinds: Record<Name, Kind>, onGpu: boolean): { out?: Vec; error?: string } {
  if (onGpu && (['gamma', 'beta', 'running_mean', 'running_var'] as Name[]).some((n) => kinds[n] === 'plain')) return { error: DEVICE_ERROR }
  return { out: map3((j) => (v.gamma[j] * (X_NEW[j] - v.running_mean[j])) / Math.sqrt(v.running_var[j] + EPS) + v.beta[j]) }
}

/** torch.save(model.state_dict()), then a fresh MyNorm(3) loads it: plain attributes fall back to their starting values */
export function saveAndReload(v: Values, kinds: Record<Name, Kind>): Values {
  const fresh: Values = { ...INIT }
  for (const n of NAMES) if (kinds[n] !== 'plain') (fresh as unknown as Record<Name, Vec | number>)[n] = v[n]
  return fresh
}

/** state_dict order: parameters first, then buffers, each in the order they were registered */
export function stateDictKeys(kinds: Record<Name, Kind>): Name[] {
  return [...NAMES.filter((n) => kinds[n] === 'param'), ...NAMES.filter((n) => kinds[n] === 'buffer')]
}
