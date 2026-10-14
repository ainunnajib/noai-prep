/*
  The hawker-centre bandit (pure logic, no React).
  Four stalls; a meal at stall k gives a satisfaction score drawn from Normal(mean_k, 2²).
  The diner keeps a running average Q_k for each stall and picks ε-greedily:
    with probability ε a random stall (explore), otherwise the stall with the highest Q (exploit),
  then updates  Q_k ← Q_k + (r − Q_k) / N_k   (the running average of the scores so far).
*/
import { mulberry32 } from '../../../../../kit'

export const STALLS = [
  { name: 'Chicken rice', mean: 6 },
  { name: 'Laksa', mean: 4 },
  { name: 'Nasi lemak', mean: 8 },
  { name: 'Prata', mean: 5 },
]
export const SIGMA = 2
export const MEALS = 100
export const BEST = STALLS.reduce((b, s, i) => (s.mean > STALLS[b].mean ? i : b), 0)
export const EPSILONS = [0, 0.1, 0.5, 1]

export interface Diner {
  Q: number[]
  N: number[]
  t: number
  total: number
  last: { stall: number; reward: number; explored: boolean } | null
  rnd: () => number
  gauss: () => number
}

export function gaussian(rnd: () => number): () => number {
  return () => {
    const u = Math.max(1e-12, rnd())
    const v = rnd()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
}

export function newDiner(seed: number): Diner {
  const rnd = mulberry32(seed)
  return { Q: STALLS.map(() => 0), N: STALLS.map(() => 0), t: 0, total: 0, last: null, rnd, gauss: gaussian(rnd) }
}

/** Eat one meal: choose ε-greedily, get a score, update the running average. Mutates and returns the diner. */
export function eat(d: Diner, eps: number): Diner {
  let stall: number
  const explored = d.rnd() < eps
  if (explored) stall = Math.floor(d.rnd() * STALLS.length)
  else {
    const m = Math.max(...d.Q)
    const ties = d.Q.map((q, i) => (q === m ? i : -1)).filter((i) => i >= 0)
    stall = ties[Math.floor(d.rnd() * ties.length)]
  }
  const reward = STALLS[stall].mean + SIGMA * d.gauss()
  d.N[stall] += 1
  d.Q[stall] += (reward - d.Q[stall]) / d.N[stall]
  d.t += 1
  d.total += reward
  d.last = { stall, reward, explored }
  return d
}

/** Average score at each meal number (1..MEALS) and average total, over many simulated diners. */
export function simulate(eps: number, diners: number, seed: number) {
  const perMeal = new Array<number>(MEALS).fill(0)
  let total = 0
  let bestShare = 0
  for (let k = 0; k < diners; k++) {
    const d = newDiner(seed + k * 7919)
    for (let t = 0; t < MEALS; t++) {
      eat(d, eps)
      perMeal[t] += d.last!.reward
      if (d.last!.stall === BEST) bestShare++
    }
    total += d.total
  }
  return { perMeal: perMeal.map((v) => v / diners), total: total / diners, bestShare: bestShare / (diners * MEALS) }
}
