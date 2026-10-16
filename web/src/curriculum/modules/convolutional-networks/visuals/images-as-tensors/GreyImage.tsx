/*
  A tiny greyscale image drawn as it really looks: each cell is filled with its own grey
  (0 = black, 255 = white) and shows its value. The cell colours are the image's data, so they
  are rgb() greys rather than theme tokens; the number on each cell flips between black and
  white so it stays readable on both dark and light pixels.
*/

const LETTER_T = [
  [0, 0, 0, 0, 0],
  [0, 255, 255, 255, 0],
  [0, 0, 255, 0, 0],
  [0, 0, 255, 0, 0],
  [0, 0, 0, 0, 0],
]

export default function GreyImage({ data = LETTER_T, cell = 46, label = 'A 5 × 5 greyscale image of the letter T' }: { data?: number[][]; cell?: number; label?: string }) {
  const cols = data[0].length
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: '0.45rem', margin: '1.25rem 0' }}>
      <div
        role="img"
        aria-label={`${label}: ${data.map((r) => r.join(' ')).join('; ')}`}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, ${cell}px))`,
          gap: 2,
          padding: 2,
          borderRadius: 6,
          background: 'var(--viz-grid)',
          maxWidth: '100%',
        }}
      >
        {data.flatMap((row, i) =>
          row.map((v, j) => (
            <div
              key={`${i}-${j}`}
              style={{
                aspectRatio: '1',
                display: 'grid',
                placeItems: 'center',
                background: `rgb(${v}, ${v}, ${v})`,
                color: v >= 128 ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: 3,
                userSelect: 'none',
              }}
            >
              {v}
            </div>
          )),
        )}
      </div>
      <span style={{ fontSize: '0.85rem', color: 'var(--ink-2)', textAlign: 'center' }}>{label}, drawn in its real greys: 0 is black, 255 is white</span>
    </div>
  )
}
