/*
  Frame generators for the sorting visual. Each frame is a snapshot after (or just before) one
  comparison, with the indices being compared, the sorted region and running counters.
  The counting functions are used for the "race" table and must match the animations exactly.
*/

export type Algo = 'bubble' | 'insertion' | 'merge'

export interface Frame {
  a: number[]
  cmp: number[] // indices being compared
  moved: number[] // indices just written / swapped
  sorted: boolean[] // items known to be in their final place
  range?: [number, number] // merge sort: the sub-list being merged [lo, hi)
  comparisons: number
  note: string
}

const fin = (n: number, f: (i: number) => boolean) => Array.from({ length: n }, (_, i) => f(i))

export function bubbleFrames(input: number[]): Frame[] {
  const a = input.slice()
  const n = a.length
  const frames: Frame[] = [{ a: a.slice(), cmp: [], moved: [], sorted: fin(n, () => false), comparisons: 0, note: 'Start: each pass bubbles the largest remaining bar to the right.' }]
  let c = 0
  for (let i = 0; i < n - 1; i++) {
    let swapped = false
    for (let j = 0; j < n - 1 - i; j++) {
      c++
      const swap = a[j] > a[j + 1]
      if (swap) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
        swapped = true
      }
      frames.push({
        a: a.slice(),
        cmp: [j, j + 1],
        moved: swap ? [j, j + 1] : [],
        sorted: fin(n, (k) => k >= n - i),
        comparisons: c,
        note: swap ? `Pass ${i + 1}: neighbours out of order, so swap them.` : `Pass ${i + 1}: neighbours already in order.`,
      })
    }
    if (!swapped) {
      frames.push({ a: a.slice(), cmp: [], moved: [], sorted: fin(n, () => true), comparisons: c, note: `Pass ${i + 1} made no swaps, so the list is sorted. Done after ${c} comparisons.` })
      return frames
    }
  }
  frames.push({ a: a.slice(), cmp: [], moved: [], sorted: fin(n, () => true), comparisons: c, note: `Sorted after ${c} comparisons.` })
  return frames
}

export function insertionFrames(input: number[]): Frame[] {
  const a = input.slice()
  const n = a.length
  const frames: Frame[] = [{ a: a.slice(), cmp: [], moved: [], sorted: fin(n, (k) => k === 0), comparisons: 0, note: 'Start: the first bar on its own is a sorted hand of one card.' }]
  let c = 0
  for (let i = 1; i < n; i++) {
    let j = i
    while (j > 0) {
      c++
      const swap = a[j - 1] > a[j]
      if (swap) [a[j - 1], a[j]] = [a[j], a[j - 1]]
      frames.push({
        a: a.slice(),
        cmp: [j - 1, j],
        moved: swap ? [j - 1, j] : [],
        sorted: fin(n, (k) => k <= i && k !== (swap ? j - 1 : j)),
        comparisons: c,
        note: swap ? `Insert bar ${i + 1}: it is smaller than its left neighbour, so it slides left.` : `Insert bar ${i + 1}: its left neighbour is smaller, so it stops here.`,
      })
      if (!swap) break
      j--
    }
  }
  frames.push({ a: a.slice(), cmp: [], moved: [], sorted: fin(n, () => true), comparisons: c, note: `Sorted after ${c} comparisons.` })
  return frames
}

export function mergeFrames(input: number[]): Frame[] {
  const a = input.slice()
  const n = a.length
  const frames: Frame[] = [{ a: a.slice(), cmp: [], moved: [], sorted: fin(n, () => false), comparisons: 0, note: 'Start: split the list in half again and again, then merge sorted halves.' }]
  let c = 0
  const rec = (lo: number, hi: number) => {
    if (hi - lo <= 1) return
    const mid = Math.floor((lo + hi) / 2)
    rec(lo, mid)
    rec(mid, hi)
    const left = a.slice(lo, mid)
    const right = a.slice(mid, hi)
    const out: number[] = []
    let i = 0
    let j = 0
    const snap = () => [...a.slice(0, lo), ...out, ...left.slice(i), ...right.slice(j), ...a.slice(hi)]
    const last = lo === 0 && hi === n
    while (i < left.length && j < right.length) {
      c++
      const k = lo + out.length
      const pL = k
      const pR = k + (left.length - i)
      const takeLeft = left[i] <= right[j]
      frames.push({
        a: snap(),
        cmp: [pL, pR],
        moved: [],
        sorted: fin(n, (q) => last && q < k),
        range: [lo, hi],
        comparisons: c,
        note: `Merge [${lo}…${hi - 1}]: compare the fronts of the two sorted halves; the smaller (${Math.min(left[i], right[j])}) goes next.`,
      })
      if (takeLeft) out.push(left[i++])
      else out.push(right[j++])
    }
    while (i < left.length) out.push(left[i++])
    while (j < right.length) out.push(right[j++])
    for (let k = 0; k < out.length; k++) a[lo + k] = out[k]
    frames.push({
      a: a.slice(),
      cmp: [],
      moved: Array.from({ length: hi - lo }, (_, k) => lo + k),
      sorted: fin(n, () => last),
      range: [lo, hi],
      comparisons: c,
      note: `One half ran out, so copy the rest: [${lo}…${hi - 1}] is now sorted.`,
    })
  }
  rec(0, n)
  frames.push({ a: a.slice(), cmp: [], moved: [], sorted: fin(n, () => true), comparisons: c, note: `Sorted after ${c} comparisons.` })
  return frames
}

export const FRAMES: Record<Algo, (a: number[]) => Frame[]> = { bubble: bubbleFrames, insertion: insertionFrames, merge: mergeFrames }
