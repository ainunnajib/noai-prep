/*
  A tiny gridworld and a tabular Q-learning agent (pure logic, no React).

  Tiles: '.' floor, '#' wall, 'S' start, 'G' goal, 'P' pit. G and P end the episode.
  Actions: 0 up, 1 right, 2 down, 3 left. Bumping into a wall or the edge leaves you where you are.
  Update (Q-learning):  Q(s,a) ← Q(s,a) + α [ r + γ · max_a' Q(s',a') − Q(s,a) ]
  (for an episode-ending move the target is just r).
*/
import { mulberry32 } from '../../../../../kit'

export const LAYOUT = ['. . . . G', '. # . . P', '. # . . .', 'S . . # .'].map((r) => r.split(' '))
export const ROWS = LAYOUT.length
export const COLS = LAYOUT[0].length
export const N_STATES = ROWS * COLS
export const MOVES: [number, number][] = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
]
export const ALPHA = 0.5
export const GAMMA = 0.9
export const MAX_STEPS = 40
export const EPS_ON = 0.2

export type Outcome = 'G' | 'P' | 'T'
export interface Rewards {
  G: number
  P: number
}

export const tile = (s: number) => LAYOUT[Math.floor(s / COLS)][s % COLS]
export const isTerminal = (s: number) => {
  const t = tile(s)
  return t === 'G' || t === 'P'
}
export const START = (() => {
  for (let s = 0; s < N_STATES; s++) if (tile(s) === 'S') return s
  return 0
})()

export function nextState(s: number, a: number): number {
  const r = Math.floor(s / COLS) + MOVES[a][0]
  const c = (s % COLS) + MOVES[a][1]
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return s
  const n = r * COLS + c
  return tile(n) === '#' ? s : n
}

export interface Agent {
  Q: Float64Array
  visits: Uint32Array
  pos: number
  t: number
  ret: number
  episode: number
  outcomes: Outcome[]
  lastAction: number
  lastExplored: boolean
  /** total reward of the most recent finished episode */
  lastReturn: number
  rnd: () => number
}

export function newAgent(seed: number): Agent {
  const visits = new Uint32Array(N_STATES)
  visits[START] = 1
  return { Q: new Float64Array(N_STATES * 4), visits, pos: START, t: 0, ret: 0, episode: 0, outcomes: [], lastAction: -1, lastExplored: false, lastReturn: 0, rnd: mulberry32(seed) }
}

export const maxQ = (Q: Float64Array, s: number) => Math.max(Q[s * 4], Q[s * 4 + 1], Q[s * 4 + 2], Q[s * 4 + 3])

/** Best action in state s, or -1 if all four actions still look the same (nothing learned yet). */
export function bestAction(Q: Float64Array, s: number): number {
  const m = maxQ(Q, s)
  let best = -1
  let count = 0
  for (let a = 0; a < 4; a++) {
    if (Q[s * 4 + a] === m) {
      best = a
      count++
    }
  }
  return count === 4 ? -1 : best
}

/** One time step: choose an action ε-greedily, move, receive the reward, update Q. Returns the outcome if the episode ended. */
export function step(ag: Agent, eps: number, R: Rewards): Outcome | null {
  const s = ag.pos
  let a: number
  ag.lastExplored = ag.rnd() < eps
  if (ag.lastExplored) a = Math.floor(ag.rnd() * 4)
  else {
    const m = maxQ(ag.Q, s)
    const ties = [0, 1, 2, 3].filter((k) => ag.Q[s * 4 + k] === m)
    a = ties[Math.floor(ag.rnd() * ties.length)]
  }
  const n = nextState(s, a)
  const t = tile(n)
  const done = t === 'G' || t === 'P'
  const r = done ? R[t as keyof Rewards] : 0
  const target = done ? r : r + GAMMA * maxQ(ag.Q, n)
  ag.Q[s * 4 + a] += ALPHA * (target - ag.Q[s * 4 + a])
  ag.lastAction = a
  ag.pos = n
  ag.visits[n]++
  ag.ret += r
  ag.t++
  if (done || ag.t >= MAX_STEPS) {
    const out: Outcome = done ? (t as Outcome) : 'T'
    ag.outcomes.push(out)
    ag.lastReturn = ag.ret
    ag.episode++
    ag.pos = START
    ag.t = 0
    ag.ret = 0
    return out
  }
  return null
}

/** Run whole episodes at once (for "+50 episodes"). */
export function runEpisodes(ag: Agent, n: number, eps: number, R: Rewards) {
  const target = ag.episode + n
  let guard = 0
  while (ag.episode < target && guard++ < n * (MAX_STEPS + 1)) step(ag, eps, R)
}

/** Where the greedy policy leads from the start (following best actions, at most 20 moves). */
export function greedyPath(Q: Float64Array): number[] {
  const path = [START]
  let s = START
  for (let k = 0; k < 20; k++) {
    const a = bestAction(Q, s)
    if (a < 0) break
    const n = nextState(s, a)
    if (n === s) break
    path.push(n)
    s = n
    if (isTerminal(n)) break
  }
  return path
}
