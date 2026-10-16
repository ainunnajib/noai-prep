/*
  Shape bookkeeping for the NOAI 2026 Task 2 network (BrokenUNet): two encoder levels, a bottleneck,
  ONE decoder level that joins the level-2 skip map x2, and a 1x1 output conv.

    3x3 conv:          H - 2 with padding=0 ("valid"), H with padding=1 ("same")
    MaxPool2d(2):      floor(H / 2)
    ConvTranspose2d(k=2, s=2): 2H
    torch.cat(dim=1):  needs equal H and W; channels add (128 + 128 = 256)

  Verified against PyTorch for every input size from 36 to 140 (and 200, 250, 252, 256, 300) for each
  alignment option (scratch script unet2.py): e.g. 256 valid -> x2 122, d1 114, output 110;
  128 valid -> 58, 50, 46; 256 same -> 128, 128, 128; 250 same -> 125 vs 124 (cat fails).
*/

export type Pad = 0 | 1
/** how the skip map x2 and the decoder map d1 are joined */
export type Join = 'none' | 'crop' | 'resize'

export interface Row {
  name: string
  op: string
  c: number
  h: number
  /** 'skip' marks x2, 'up' marks d1 */
  role?: 'skip' | 'up' | 'cat' | 'out'
}

export interface NetTrace {
  rows: Row[]
  x2: number
  d1: number
  /** size after joining (crop / resize), null if torch.cat fails */
  joined: number | null
  out: number | null
  /** input too small for the valid convolutions */
  tooSmall: boolean
}

export function traceNet(n: number, pad: Pad, join: Join): NetTrace {
  const conv = (h: number) => (pad ? h : h - 2)
  const rows: Row[] = []
  let h = n
  const push = (name: string, op: string, c: number, hh: number, role?: Row['role']) => rows.push({ name, op, c, h: hh, role })
  h = conv(h)
  push('enc1_1', 'conv 3×3', 64, h)
  h = conv(h)
  push('enc1_2', 'conv 3×3', 64, h)
  h = Math.floor(h / 2)
  push('pool1', 'max pool 2', 64, h)
  h = conv(h)
  push('enc2_1', 'conv 3×3', 128, h)
  h = conv(h)
  const x2 = h
  push('enc2_2 → x2', 'conv 3×3', 128, h, 'skip')
  h = Math.floor(h / 2)
  push('pool2', 'max pool 2', 128, h)
  h = conv(h)
  push('bot1', 'conv 3×3', 256, h)
  h = conv(h)
  push('bot2', 'conv 3×3', 256, h)
  const d1 = 2 * h
  push('upconv1 → d1', 'up-conv 2×2, stride 2', 128, d1, 'up')
  const tooSmall = rows.some((r) => r.h < 1)
  if (tooSmall) return { rows, x2, d1, joined: null, out: null, tooSmall: true }
  let joined: number | null
  if (x2 === d1) joined = d1
  else if (join === 'crop') joined = d1 <= x2 ? d1 : null
  else if (join === 'resize') joined = x2
  else joined = null
  if (joined == null) return { rows, x2, d1, joined: null, out: null, tooSmall: false }
  push('torch.cat', 'join on dim 1', 256, joined, 'cat')
  let o = conv(joined)
  push('dec1_1', 'conv 3×3', 128, o)
  o = conv(o)
  push('dec1_2', 'conv 3×3', 64, o)
  push('final', 'conv 1×1', 2, o, 'out')
  return { rows, x2, d1, joined, out: o < 1 ? null : o, tooSmall: o < 1 }
}

export const catError = (x2: number, d1: number) =>
  `RuntimeError: Sizes of tensors must match except in dimension 1. Expected size ${x2} but got size ${d1} for tensor number 1 in the list.`
