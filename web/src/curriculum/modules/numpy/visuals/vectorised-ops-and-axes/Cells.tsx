import type { CSSProperties, ReactNode } from 'react'

/*
  Small building blocks for drawing NumPy arrays as grids of cells. Shared by the visuals of
  the lessons "vectorised-ops-and-axes", "broadcasting" and "from-scratch-patterns".
  Colours come only from theme tokens, so light and dark mode both work.
*/

export type Tone = 'plain' | 'a' | 'b' | 'c' | 'd' | 'bad' | 'ghost' | 'dim'

export const TONE_COLOUR: Record<Exclude<Tone, 'plain' | 'ghost' | 'dim'>, string> = {
  a: 'var(--viz-1)',
  b: 'var(--viz-2)',
  c: 'var(--viz-3)',
  d: 'var(--viz-5)',
  bad: 'var(--viz-neg)',
}

export const mono: CSSProperties = { fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }

export function cellStyle(tone: Tone, size: number, strong = false): CSSProperties {
  const base: CSSProperties = {
    ...mono,
    boxSizing: 'border-box',
    width: size,
    height: size,
    display: 'grid',
    placeItems: 'center',
    fontSize: size >= 40 ? '0.9rem' : '0.8rem',
    lineHeight: 1,
    borderRadius: 6,
    border: '1.5px solid transparent',
    background: 'var(--surface-2)',
    color: 'var(--ink)',
    padding: 0,
    transition: 'background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease',
  }
  if (tone === 'ghost') {
    return { ...base, background: 'transparent', border: '1.5px dashed color-mix(in srgb, var(--viz-muted) 80%, transparent)', color: 'var(--ink-3)' }
  }
  if (tone === 'dim') return { ...base, opacity: 0.4 }
  if (tone === 'plain') return strong ? { ...base, border: '2px solid var(--ink-2)', fontWeight: 700 } : base
  const c = TONE_COLOUR[tone]
  return {
    ...base,
    background: `color-mix(in srgb, ${c} ${strong ? 34 : 20}%, var(--surface))`,
    border: `${strong ? 2.5 : 1.5}px solid ${c}`,
    fontWeight: strong ? 700 : 500,
  }
}

/** A single array cell. Becomes a button when clickable. */
export function Cell({
  children,
  tone = 'plain',
  size = 40,
  strong,
  onClick,
  onHover,
  label,
  style,
}: {
  children: ReactNode
  tone?: Tone
  size?: number
  strong?: boolean
  onClick?: () => void
  onHover?: (on: boolean) => void
  label?: string
  style?: CSSProperties
}) {
  const s = { ...cellStyle(tone, size, strong), ...style }
  if (onClick) {
    return (
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        onMouseEnter={onHover ? () => onHover(true) : undefined}
        onMouseLeave={onHover ? () => onHover(false) : undefined}
        style={{ ...s, cursor: 'pointer', ...mono }}
      >
        {children}
      </button>
    )
  }
  return (
    <div role="cell" aria-label={label} style={s}>
      {children}
    </div>
  )
}

/** Square brackets around a block, like a maths matrix. */
export function Brackets({ children, colour = 'var(--ink)', pad = 7 }: { children: ReactNode; colour?: string; pad?: number }) {
  const side: CSSProperties = { position: 'absolute', top: 0, bottom: 0, width: 6, borderTop: `2px solid ${colour}`, borderBottom: `2px solid ${colour}` }
  return (
    <div style={{ position: 'relative', padding: `3px ${pad + 3}px`, display: 'inline-block' }}>
      <span aria-hidden="true" style={{ ...side, left: 0, borderLeft: `2px solid ${colour}` }} />
      {children}
      <span aria-hidden="true" style={{ ...side, right: 0, borderRight: `2px solid ${colour}` }} />
    </div>
  )
}

/** A 2-D array drawn as a grid of cells, with optional brackets and caption above. */
export function ArrayGrid({
  data,
  size = 40,
  gap = 4,
  tone,
  strong,
  onCellClick,
  onCellHover,
  label,
  sublabel,
  brackets = true,
  ariaLabel,
  format = (v) => String(v),
}: {
  data: (number | string)[][]
  size?: number
  gap?: number
  tone?: (i: number, j: number) => Tone
  strong?: (i: number, j: number) => boolean
  onCellClick?: (i: number, j: number) => void
  onCellHover?: (i: number, j: number, on: boolean) => void
  label?: ReactNode
  sublabel?: ReactNode
  brackets?: boolean
  ariaLabel?: string
  format?: (v: number) => string
}) {
  const cols = data[0]?.length ?? 0
  const grid = (
    <div role="table" aria-label={ariaLabel} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${size}px)`, gap }}>
      {data.map((row, i) =>
        row.map((v, j) => (
          <Cell
            key={`${i}-${j}`}
            size={size}
            tone={tone ? tone(i, j) : 'plain'}
            strong={strong ? strong(i, j) : false}
            onClick={onCellClick ? () => onCellClick(i, j) : undefined}
            onHover={onCellHover ? (on) => onCellHover(i, j, on) : undefined}
            label={`row ${i}, column ${j}: ${typeof v === 'number' ? format(v) : v}`}
          >
            {typeof v === 'number' ? format(v) : v}
          </Cell>
        )),
      )}
    </div>
  )
  return (
    <div style={{ display: 'inline-grid', justifyItems: 'center', gap: 4, minWidth: 0 }}>
      {label && <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>{label}</div>}
      {brackets ? <Brackets>{grid}</Brackets> : grid}
      {sublabel && <div style={{ fontSize: '0.8rem', color: 'var(--ink-3)', ...mono }}>{sublabel}</div>}
    </div>
  )
}

/** Python-style shape text: (3,) for 1-D, (2, 3) for 2-D, () for a scalar. */
export function shapeText(shape: number[]): string {
  if (shape.length === 0) return '()'
  if (shape.length === 1) return `(${shape[0]},)`
  return `(${shape.join(', ')})`
}

/** Format numbers the way NumPy's print() shows an int or float array (right-aligned columns). */
export function npPrint(data: number[] | number[][], float = false, decimals = 0): string {
  const fmt = (v: number) => {
    if (!float) return String(v)
    if (decimals === 0) return Number.isInteger(v) ? `${v}.` : String(v)
    return v.toFixed(decimals)
  }
  const is2d = Array.isArray(data[0])
  const rows: number[][] = is2d ? (data as number[][]) : [data as number[]]
  const strs = rows.map((r) => r.map(fmt))
  const w = Math.max(...strs.flat().map((s) => s.length))
  const line = (r: string[]) => '[' + r.map((s) => s.padStart(w)).join(' ') + ']'
  if (!is2d) return line(strs[0])
  return '[' + strs.map((r, i) => (i === 0 ? '' : ' ') + line(r)).join('\n') + ']'
}

export const smallLabel: CSSProperties = { fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink-2)' }

/** Monospace output panel that looks like a notebook cell's output. */
export function OutputBox({ children, tone = 'plain', label, nowrap, small }: { children: ReactNode; tone?: 'plain' | 'bad' | 'ok'; label?: ReactNode; nowrap?: boolean; small?: boolean }) {
  const c = tone === 'bad' ? 'var(--viz-neg)' : tone === 'ok' ? 'var(--viz-pos)' : 'var(--rule)'
  return (
    <div
      style={{
        width: '100%',
        boxSizing: 'border-box',
        border: `1.5px solid ${c}`,
        background: tone === 'bad' ? 'color-mix(in srgb, var(--viz-neg) 9%, var(--surface))' : 'var(--surface-2)',
        borderRadius: 10,
        padding: '0.55rem 0.75rem',
        fontSize: small ? '0.76rem' : '0.85rem',
        overflowX: 'auto',
      }}
    >
      {label && <div style={{ ...mono, fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-3)', marginBottom: 4 }}>{label}</div>}
      <pre style={{ ...mono, margin: 0, whiteSpace: nowrap ? 'pre' : 'pre-wrap', overflowWrap: nowrap ? 'normal' : 'anywhere', color: tone === 'bad' ? 'var(--viz-neg)' : 'var(--ink)' }}>{children}</pre>
    </div>
  )
}
