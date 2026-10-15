import { mulberry32 } from '../../../../../kit'

/*
  Procedurally generated images (no files, no network). All deterministic.
*/

export type RGB = [number, number, number]

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const lerp3 = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
const clamp255 = (v: number) => Math.max(0, Math.min(255, Math.round(v)))

export const SKY_W = 48
export const SKY_H = 32

/**
 * A sunset over Marina Bay as a 48×32 RGB image: three hotel towers with the sky park on top,
 * a low skyline, the sun and its reflection in the water. Returns img[y][x] = [r, g, b] (0-255 integers).
 */
export function makeSkyline(): RGB[][] {
  const rnd = mulberry32(48)
  const horizon = 22
  const top: RGB = [22, 28, 78]
  const mid: RGB = [128, 62, 128]
  const low: RGB = [246, 146, 62]
  const img: RGB[][] = []
  // low skyline heights (left and right edges)
  const lowH = [4, 4, 6, 6, 3, 3, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 5, 5, 5, 2, 2]
  const towers: [number, number][] = [
    [9, 13],
    [16, 20],
    [23, 27],
  ]
  for (let y = 0; y < SKY_H; y++) {
    const row: RGB[] = []
    for (let x = 0; x < SKY_W; x++) {
      let c: RGB
      if (y < horizon) {
        const t = y / (horizon - 1)
        c = t < 0.55 ? lerp3(top, mid, t / 0.55) : lerp3(mid, low, (t - 0.55) / 0.45)
        // sun with a soft glow
        const d = Math.hypot(x - 37, y - 17.5)
        if (d < 3.6) c = [255, 226, 128]
        else if (d < 6) c = lerp3([255, 200, 110], c, (d - 3.6) / 2.4)
        // low skyline
        if (lowH[x] && y >= horizon - lowH[x]) c = [74, 52, 92]
        // towers (with lit windows)
        for (const [a, b] of towers) {
          if (x >= a && x <= b && y >= 9) {
            c = [38, 34, 62]
            if (x > a && x < b && y > 10 && y < horizon - 1 && rnd() < 0.16) c = [232, 188, 92]
          }
        }
        // the sky park slab across the top of the towers
        if (y >= 7 && y <= 8 && x >= 8 && x <= 31) c = [52, 46, 74]
      } else {
        // water: darker with depth, the sun's reflection breaks into streaks
        const t = (y - horizon) / (SKY_H - horizon - 1)
        c = lerp3([52, 52, 104], [14, 18, 48], t)
        if (x >= 34 && x <= 40 && (y + x) % 2 === 0) c = lerp3([236, 140, 70], c, Math.abs(x - 37) / 4 + t * 0.4)
        for (const [a, b] of towers) if (x >= a && x <= b && y <= horizon + 5) c = lerp3([30, 28, 56], c, (y - horizon) / 6)
      }
      row.push([clamp255(c[0]), clamp255(c[1]), clamp255(c[2])])
    }
    img.push(row)
  }
  return img
}

/** A hand-drawn 10×10 greyscale digit "7" (0 = black background, 255 = white ink). */
export const SEVEN: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 190, 255, 255, 255, 255, 230, 0, 0],
  [0, 0, 0, 0, 0, 0, 40, 255, 90, 0],
  [0, 0, 0, 0, 0, 0, 180, 220, 0, 0],
  [0, 0, 0, 0, 0, 60, 255, 80, 0, 0],
  [0, 0, 0, 0, 0, 200, 200, 0, 0, 0],
  [0, 0, 0, 0, 80, 255, 70, 0, 0, 0],
  [0, 0, 0, 0, 210, 210, 0, 0, 0, 0],
  [0, 0, 0, 0, 255, 120, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

/**
 * A synthetic chest X-ray, n×n greyscale (0-255). `density` in [0, 1] adds a whitish haze, the way
 * fluid or denser tissue does: it lifts the whole picture and lowers its contrast (a fixed affine change
 * v -> v(1 - 0.4d) + 100d), and makes the lungs slightly denser. Bright = dense (bone, heart), dark = air.
 * Because the haze is mostly one affine change per image, per-image standardisation removes it almost
 * completely, which is exactly the information loss the lesson describes.
 */
export function makeXray(n: number, density: number, seed: number): number[][] {
  const rnd = mulberry32(seed)
  const img: number[][] = []
  const cx = (n - 1) / 2
  for (let y = 0; y < n; y++) {
    const row: number[] = []
    for (let x = 0; x < n; x++) {
      const u = (x - cx) / (n / 2) // -1..1
      const v = (y - cx) / (n / 2)
      let val = 18 // air outside the body
      // body outline
      const body = (u / 0.92) ** 2 + ((v - 0.05) / 1.05) ** 2 < 1
      if (body) val = 120
      // lungs: two dark lobes
      const lungL = ((u + 0.42) / 0.3) ** 2 + ((v + 0.02) / 0.62) ** 2 < 1
      const lungR = ((u - 0.42) / 0.3) ** 2 + ((v + 0.02) / 0.62) ** 2 < 1
      if (lungL || lungR) val = 52 + 18 * density
      // ribs: bright bands crossing the lungs
      if ((lungL || lungR) && Math.abs(Math.sin((v - 0.45 * u * u) * 10)) > 0.88) val += 42
      // spine and heart
      if (Math.abs(u) < 0.09 && body) val = 205
      if (((u + 0.12) / 0.26) ** 2 + ((v - 0.3) / 0.24) ** 2 < 1) val = 190
      val += (rnd() - 0.5) * 18
      // haze: lifts everything and lowers the contrast
      val = val * (1 - 0.4 * density) + 100 * density
      row.push(Math.max(0, Math.min(255, Math.round(val))))
    }
    img.push(row)
  }
  return img
}
