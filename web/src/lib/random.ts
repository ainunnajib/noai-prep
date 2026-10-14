/** Deterministic PRNG (mulberry32) so shuffles are stable for a given seed. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Returns a new shuffled array (Fisher–Yates) using the given rng. */
export function shuffled<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const a = items.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** A permutation of option indices, stable per question id + seed. */
export function optionOrder(n: number, key: string, seed = 0): number[] {
  return shuffled(
    Array.from({ length: n }, (_, i) => i),
    mulberry32(hashString(key) ^ seed),
  )
}

export function sample<T>(items: readonly T[], k: number, rng: () => number = Math.random): T[] {
  return shuffled(items, rng).slice(0, Math.max(0, Math.min(k, items.length)))
}
