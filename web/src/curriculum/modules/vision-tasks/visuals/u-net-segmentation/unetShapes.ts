/*
  Shape bookkeeping for a standard U-Net, used by UNetShapeTracer.
  Each encoder level: two 3x3 convs (padding 1 = "same" keeps H; padding 0 = "valid" loses 2 per conv), then 2x2 max pool (floor(H/2)).
  Bottleneck: two 3x3 convs.
  Each decoder level: ConvTranspose2d(k=2, s=2) doubles H and halves channels, concatenate with the skip map (dim=1), two 3x3 convs.
  Final 1x1 conv to K class scores. Verified against PyTorch (572 valid depth 4 -> 388; 256 valid depth 2 -> skip 122 vs up 114).
*/

export type PadMode = 'same' | 'valid'

export interface EncLevel {
  c: number
  h: number
  /** size after the 2x2 max pool, floor(h / 2) */
  pooled: number
}

export interface DecLevel {
  /** after ConvTranspose2d(k=2, s=2) */
  upC: number
  upH: number
  /** encoder skip map at this level */
  skipH: number
  /** what happened at the concatenation */
  join: 'none' | 'copy' | 'crop' | 'mismatch'
  /** after torch.cat (channels and size) */
  catC: number
  catH: number
  /** after the two 3x3 convs */
  outC: number
  outH: number
}

export interface Trace {
  enc: EncLevel[]
  bott: { c: number; h: number } | null
  /** decoder levels in the order they run: deepest first */
  dec: (DecLevel & { level: number })[]
  out: { c: number; h: number } | null
  error: null | { kind: 'too-small'; where: string } | { kind: 'mismatch'; level: number; skipH: number; upH: number }
}

export const BASE_CH = 64
export const NUM_CLASSES = 2

export function traceUNet(n: number, depth: number, pad: PadMode, skips: boolean, crop: boolean): Trace {
  const loss = pad === 'valid' ? 4 : 0 // two 3x3 convs
  const enc: EncLevel[] = []
  let h = n
  for (let i = 0; i < depth; i++) {
    const after = h - loss
    if (after < 1) return { enc, bott: null, dec: [], out: null, error: { kind: 'too-small', where: `encoder level ${i + 1}` } }
    const pooled = Math.floor(after / 2)
    enc.push({ c: BASE_CH * 2 ** i, h: after, pooled })
    if (pooled < 1) return { enc, bott: null, dec: [], out: null, error: { kind: 'too-small', where: `pool ${i + 1}` } }
    h = pooled
  }
  const bh = h - loss
  if (bh < 1) return { enc, bott: null, dec: [], out: null, error: { kind: 'too-small', where: 'the bottleneck' } }
  const bott = { c: BASE_CH * 2 ** depth, h: bh }
  const dec: Trace['dec'] = []
  let x = bh
  for (let i = depth - 1; i >= 0; i--) {
    const upC = BASE_CH * 2 ** i
    const upH = 2 * x
    const skipH = enc[i].h
    let join: DecLevel['join'] = 'none'
    let catC = upC
    if (skips) {
      catC = 2 * upC
      if (skipH === upH) join = 'copy'
      else if (crop && skipH > upH) join = 'crop'
      else {
        dec.push({ level: i, upC, upH, skipH, join: 'mismatch', catC, catH: upH, outC: upC, outH: upH - loss })
        return { enc, bott, dec, out: null, error: { kind: 'mismatch', level: i, skipH, upH } }
      }
    }
    const outH = upH - loss
    if (outH < 1) {
      dec.push({ level: i, upC, upH, skipH, join, catC, catH: upH, outC: upC, outH })
      return { enc, bott, dec, out: null, error: { kind: 'too-small', where: `decoder level ${i + 1}` } }
    }
    dec.push({ level: i, upC, upH, skipH, join, catC, catH: upH, outC: upC, outH })
    x = outH
  }
  return { enc, bott, dec, out: { c: NUM_CLASSES, h: x }, error: null }
}

export const shp = (c: number, h: number) => `${c}×${h}×${h}`
