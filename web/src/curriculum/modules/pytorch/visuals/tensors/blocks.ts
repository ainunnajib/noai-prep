/*
  Lays out a tensor of up to 4 dims as coloured cells, following the way PyTorch prints it:
    last dim      -> cells across a row
    2nd-last dim  -> rows down a sheet
    3rd-last dim  -> separate sheets, side by side (wrapping onto new lines when narrow)
    4th-last dim  -> framed boxes stacked vertically
  Positions are in px, sized to the available width so cells stay legible on phones.
*/

export interface CellBox {
  x: number
  y: number
  w: number
  h: number
}

export interface SheetLabel {
  x: number
  y: number
  text: string
}

export interface GroupFrame {
  x: number
  y: number
  w: number
  h: number
  label: string
}

export interface TensorLayout {
  /** one box per element, in logical (row-major) order */
  cells: CellBox[]
  width: number
  height: number
  sheetLabels: SheetLabel[]
  frames: GroupFrame[]
  /** cell width in px (to decide whether text fits) */
  cell: number
}

export interface LayoutOptions {
  maxCell?: number
  minCell?: number
  gap?: number
  sheetGap?: number
  /** label above sheet j of group g */
  sheetLabel?: (g: number, j: number) => string
  /** label on the frame of group g (4-D only) */
  groupLabel?: (g: number) => string
  /** height of a thin 1-row strip whose cells are narrower than minCell */
  stripHeight?: number
}

export function layoutTensor(shape: number[], avail: number, opts: LayoutOptions = {}): TensorLayout {
  const { maxCell = 30, minCell = 14, sheetGap = 14, stripHeight = 22 } = opts
  const d = shape.length
  const cols = shape[d - 1] ?? 1
  const rows = d >= 2 ? shape[d - 2] : 1
  const sheets = d >= 3 ? shape[d - 3] : 1
  const groups = d >= 4 ? shape[d - 4] : 1
  const pad = d >= 4 ? 7 : 0
  const frameLabelH = d >= 4 ? 17 : 0
  const labelH = d >= 3 ? 16 : 0
  const lineGap = 8
  const inner = avail - 2 * pad - 2

  let gap = opts.gap ?? (cols > 20 ? 1 : 3)
  let perLine = sheets
  let s = 0
  for (perLine = sheets; perLine >= 1; perLine--) {
    s = Math.floor((inner - (perLine - 1) * sheetGap - perLine * (cols - 1) * gap) / (perLine * cols))
    if (s >= minCell || perLine === 1) break
  }
  let cw = Math.min(maxCell, s)
  let ch = cw
  if (cw < minCell) {
    // a long thin strip: narrow cells, kept tall enough to see
    gap = cols > 30 ? 1 : gap
    cw = Math.max(2, (inner - (cols - 1) * gap) / cols)
    ch = rows === 1 ? stripHeight : Math.max(cw, 6)
  }
  const sw = cols * cw + (cols - 1) * gap
  const sh = rows * ch + (rows - 1) * gap
  const nPer = Math.min(sheets, perLine)
  const lines = Math.ceil(sheets / nPer)
  const contentW = nPer * sw + (nPer - 1) * sheetGap
  const contentH = lines * (labelH + sh) + (lines - 1) * lineGap
  const groupW = contentW + 2 * pad
  const groupH = contentH + 2 * pad + frameLabelH
  const width = groupW
  const groupGap = 10
  const height = groups * groupH + (groups - 1) * groupGap
  const x0 = Math.max(0, (avail - width) / 2)

  const cells: CellBox[] = []
  const sheetLabels: SheetLabel[] = []
  const frames: GroupFrame[] = []
  for (let g = 0; g < groups; g++) {
    const gy = g * (groupH + groupGap)
    if (d >= 4) frames.push({ x: x0, y: gy, w: groupW, h: groupH, label: opts.groupLabel ? opts.groupLabel(g) : `[${g}]` })
    for (let j = 0; j < sheets; j++) {
      const line = Math.floor(j / nPer)
      const col = j % nPer
      const sx = x0 + pad + col * (sw + sheetGap)
      const sy = gy + pad + frameLabelH + line * (labelH + sh + lineGap)
      if (d >= 3) sheetLabels.push({ x: sx, y: sy, text: opts.sheetLabel ? opts.sheetLabel(g, j) : `[${j}]` })
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) cells.push({ x: sx + c * (cw + gap), y: sy + labelH + r * (ch + gap), w: cw, h: ch })
    }
  }
  return { cells, width: Math.max(width, 10), height, sheetLabels, frames, cell: cw }
}

/** split a logical index into its multi-index for this shape */
export function unravel(k: number, shape: number[]): number[] {
  const idx = new Array(shape.length).fill(0)
  let rem = k
  for (let i = shape.length - 1; i >= 0; i--) {
    idx[i] = rem % shape[i]
    rem = Math.floor(rem / shape[i])
  }
  return idx
}

export function ravel(idx: number[], shape: number[]): number {
  let k = 0
  for (let i = 0; i < shape.length; i++) k = k * shape[i] + idx[i]
  return k
}
