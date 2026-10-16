/*
  Shared maths for the diffusion visuals: noise schedules and the "ideal denoiser" for toy 2-D data.

  Schedules (T = 1000):
    linear (DDPM):  beta_t from 1e-4 to 0.02,  abar_t = prod_{s<=t} (1 - beta_s)
    cosine (Improved DDPM): abar_t = f(t)/f(0),  f(t) = cos^2(((t/T) + s)/(1 + s) * pi/2),  s = 0.008,
                    with each beta_t clipped to at most 0.999

  Ideal denoiser: if the data distribution is a mixture of small round Gaussians N(y_j, s^2 I), the
  best possible noise prediction for x_t has a closed form (the posterior mean of x_0 given x_t).
  The visuals use it in place of a trained network, so what you see is what a perfectly trained
  network would do.
*/

export const T = 1000

function linearAbar(): number[] {
  const out = [1]
  let a = 1
  for (let t = 1; t <= T; t++) {
    const beta = 1e-4 + ((0.02 - 1e-4) * (t - 1)) / (T - 1)
    a *= 1 - beta
    out.push(a)
  }
  return out
}

function cosineAbar(): number[] {
  const s = 0.008
  const f = (t: number) => Math.cos((((t / T) + s) / (1 + s)) * (Math.PI / 2)) ** 2
  const out = [1]
  let a = 1
  for (let t = 1; t <= T; t++) {
    const beta = Math.min(0.999, 1 - f(t) / f(t - 1))
    a *= 1 - beta
    out.push(a)
  }
  return out
}

/** abar[t] for t = 0..T (abar[0] = 1) */
export const ABAR = { linear: linearAbar(), cosine: cosineAbar() }
export type ScheduleName = keyof typeof ABAR

export function gaussian(rng: () => number) {
  const u = Math.max(1e-12, rng())
  const v = rng()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export type Pt = [number, number]

/**
 * Posterior mean of x0 given x_t for data = equal mixture of N(c_j, s^2 I) (2-D), noise level abar.
 * Each component j contributes c_j + k (x_t - sqrt(abar) c_j), weighted by how likely x_t is under it.
 */
export function x0Hat(x: Pt, abar: number, centres: Pt[], s: number): Pt {
  const sa = Math.sqrt(abar)
  const v = abar * s * s + 1 - abar
  const k = (sa * s * s) / v
  let best = -Infinity
  const logw = new Array<number>(centres.length)
  for (let j = 0; j < centres.length; j++) {
    const dx = x[0] - sa * centres[j][0]
    const dy = x[1] - sa * centres[j][1]
    const l = -(dx * dx + dy * dy) / (2 * v)
    logw[j] = l
    if (l > best) best = l
  }
  let tot = 0
  let mx = 0
  let my = 0
  for (let j = 0; j < centres.length; j++) {
    const w = Math.exp(logw[j] - best)
    tot += w
    mx += w * (centres[j][0] + k * (x[0] - sa * centres[j][0]))
    my += w * (centres[j][1] + k * (x[1] - sa * centres[j][1]))
  }
  return [mx / tot, my / tot]
}

/** the matching ideal noise prediction: eps_hat = (x_t - sqrt(abar) x0_hat) / sqrt(1 - abar) */
export function epsHat(x: Pt, abar: number, centres: Pt[], s: number): Pt {
  const x0 = x0Hat(x, abar, centres, s)
  const sa = Math.sqrt(abar)
  const sb = Math.sqrt(1 - abar)
  return [(x[0] - sa * x0[0]) / sb, (x[1] - sa * x0[1]) / sb]
}

/** K evenly spaced timesteps from T down to 0 */
export function timesteps(K: number): number[] {
  return Array.from({ length: K + 1 }, (_, i) => Math.round(T - (T * i) / K))
}
