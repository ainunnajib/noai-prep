/*
  A real (tiny) GAN in one dimension, trained with exact expectations so it is deterministic.

    real data      x ~ N(MU_R, SD_R²)
    generator      G(z) = b + a·z,  z ~ N(0, 1)            (2 parameters)
    discriminator  D(x) = σ(c0 + c1·u + c2·u²),  u = (x − 2)/2.5   (3 parameters)

  One training round = K_D gradient-descent steps on D's loss (G frozen), then one step on G's
  loss (D frozen). Losses (binary cross-entropy, natural log):
    loss_D = −E_real[ln D(x)] − E_fake[ln(1 − D(x))]
    loss_G = −E_fake[ln D(G(z))]                       (the usual "non-saturating" generator loss)
  Expectations are computed on a fixed grid of z values weighted by the normal density.
*/

export const MU_R = 3
export const SD_R = 0.7
export const K_D = 5
const C = 2
const S = 2.5

const NZ = 81
const ZS: number[] = []
const WS: number[] = []
{
  let tot = 0
  for (let j = 0; j < NZ; j++) {
    const z = -4 + (8 * j) / (NZ - 1)
    const w = Math.exp(-0.5 * z * z)
    ZS.push(z)
    WS.push(w)
    tot += w
  }
  for (let j = 0; j < NZ; j++) WS[j] /= tot
}

export interface GanState {
  b: number
  a: number
  c: [number, number, number]
  round: number
  diverged: boolean
}

export interface GanStats {
  dReal: number
  dFake: number
  lossD: number
  lossG: number
}

const sig = (v: number) => 1 / (1 + Math.exp(-v))
/** ln(1 + e^v), computed stably */
const softplus = (v: number) => Math.max(v, 0) + Math.log1p(Math.exp(-Math.abs(v)))

export function logit(c: readonly number[], x: number) {
  const u = (x - C) / S
  return c[0] + c[1] * u + c[2] * u * u
}
export const dOf = (c: readonly number[], x: number) => sig(logit(c, x))

/** d(logit)/dx: the slope the generator follows */
export function logitSlope(c: readonly number[], x: number) {
  const u = (x - C) / S
  return (c[1] + 2 * c[2] * u) / S
}

export function normalPdf(x: number, mu: number, sd: number) {
  const s = Math.max(1e-6, Math.abs(sd))
  const t = (x - mu) / s
  return Math.exp(-0.5 * t * t) / (s * Math.sqrt(2 * Math.PI))
}

export function stats(st: GanState): GanStats {
  let dReal = 0
  let dFake = 0
  let lossD = 0
  let lossG = 0
  for (let j = 0; j < NZ; j++) {
    const lr = logit(st.c, MU_R + SD_R * ZS[j])
    const lf = logit(st.c, st.b + st.a * ZS[j])
    dReal += WS[j] * sig(lr)
    dFake += WS[j] * sig(lf)
    lossD += WS[j] * (softplus(-lr) + softplus(lf)) // −ln σ(l) = softplus(−l); −ln(1 − σ(l)) = softplus(l)
    lossG += WS[j] * softplus(-lf)
  }
  return { dReal, dFake, lossD, lossG }
}

const LIM = { b: 25, a: 10, c: 80 }
const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v))

/** One round: K_D discriminator steps, then one generator step. Pure. */
export function trainRound(st: GanState, lrD: number, lrG: number): GanState {
  if (st.diverged) return st
  const c: [number, number, number] = [st.c[0], st.c[1], st.c[2]]
  const { b, a } = st
  for (let k = 0; k < K_D; k++) {
    const g = [0, 0, 0]
    for (let j = 0; j < NZ; j++) {
      const xr = MU_R + SD_R * ZS[j]
      const xf = b + a * ZS[j]
      const ur = (xr - C) / S
      const uf = (xf - C) / S
      const er = -(1 - sig(logit(c, xr))) // d(−ln D)/d logit at a real point
      const ef = sig(logit(c, xf)) // d(−ln(1 − D))/d logit at a fake point
      g[0] += WS[j] * (er + ef)
      g[1] += WS[j] * (er * ur + ef * uf)
      g[2] += WS[j] * (er * ur * ur + ef * uf * uf)
    }
    for (let i = 0; i < 3; i++) c[i] = clamp(c[i] - lrD * g[i], LIM.c)
  }
  // generator step: d/dθ of −E[ln D(b + a z)] = −E[(1 − D)·slope·dx/dθ]
  let gb = 0
  let ga = 0
  for (let j = 0; j < NZ; j++) {
    const xf = b + a * ZS[j]
    const push = -(1 - dOf(c, xf)) * logitSlope(c, xf)
    gb += WS[j] * push
    ga += WS[j] * push * ZS[j]
  }
  const nb = b - lrG * gb
  const na = a - lrG * ga
  const diverged = !Number.isFinite(nb) || !Number.isFinite(na) || Math.abs(nb) > LIM.b || Math.abs(na) > LIM.a
  return { b: clamp(Number.isFinite(nb) ? nb : 0, LIM.b), a: clamp(Number.isFinite(na) ? na : 1, LIM.a), c, round: st.round + 1, diverged }
}
