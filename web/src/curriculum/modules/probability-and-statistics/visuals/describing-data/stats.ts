/** Small statistics helpers shared by this lesson's visuals. */

export const mean = (xs: number[]) => xs.reduce((s, v) => s + v, 0) / xs.length

export function median(xs: number[]) {
  const s = [...xs].sort((a, b) => a - b)
  const n = s.length
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}

/** most common value(s); empty when every value appears only once */
export function modes(xs: number[]) {
  const c = new Map<number, number>()
  xs.forEach((v) => c.set(v, (c.get(v) ?? 0) + 1))
  const top = Math.max(...c.values())
  if (top < 2) return []
  return [...c.entries()].filter(([, k]) => k === top).map(([v]) => v).sort((a, b) => a - b)
}

/** up to 3 decimals, trailing zeros removed */
export function fmt(v: number, dp = 3) {
  const r = Math.round(v * 10 ** dp) / 10 ** dp
  return String(Object.is(r, -0) ? 0 : r)
}
