/*
  Contour lines of a 2-D function by marching squares. Returns, for each level, a list of line
  segments [x1, y1, x2, y2] in data coordinates. Small and dependency-free.
*/

export type Seg = [number, number, number, number]

export function contourSegments(
  f: (x: number, y: number) => number,
  xr: [number, number],
  yr: [number, number],
  levels: number[],
  nx = 120,
  ny = 60,
): Seg[][] {
  const dx = (xr[1] - xr[0]) / nx
  const dy = (yr[1] - yr[0]) / ny
  const v: number[][] = []
  for (let j = 0; j <= ny; j++) {
    const row: number[] = []
    for (let i = 0; i <= nx; i++) row.push(f(xr[0] + i * dx, yr[0] + j * dy))
    v.push(row)
  }
  return levels.map((lv) => {
    const segs: Seg[] = []
    const lerp = (a: number, b: number) => (lv - a) / (b - a)
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const a = v[j][i] // bottom-left
        const b = v[j][i + 1] // bottom-right
        const c = v[j + 1][i + 1] // top-right
        const d = v[j + 1][i] // top-left
        const idx = (a > lv ? 1 : 0) | (b > lv ? 2 : 0) | (c > lv ? 4 : 0) | (d > lv ? 8 : 0)
        if (idx === 0 || idx === 15) continue
        const x0 = xr[0] + i * dx
        const y0 = yr[0] + j * dy
        // crossing points on each edge
        const bottom: [number, number] = [x0 + lerp(a, b) * dx, y0]
        const right: [number, number] = [x0 + dx, y0 + lerp(b, c) * dy]
        const top: [number, number] = [x0 + lerp(d, c) * dx, y0 + dy]
        const left: [number, number] = [x0, y0 + lerp(a, d) * dy]
        const add = (p: [number, number], q: [number, number]) => segs.push([p[0], p[1], q[0], q[1]])
        switch (idx) {
          case 1:
          case 14:
            add(left, bottom)
            break
          case 2:
          case 13:
            add(bottom, right)
            break
          case 3:
          case 12:
            add(left, right)
            break
          case 4:
          case 11:
            add(right, top)
            break
          case 6:
          case 9:
            add(bottom, top)
            break
          case 7:
          case 8:
            add(left, top)
            break
          case 5:
            add(left, top)
            add(bottom, right)
            break
          case 10:
            add(left, bottom)
            add(right, top)
            break
        }
      }
    }
    return segs
  })
}
