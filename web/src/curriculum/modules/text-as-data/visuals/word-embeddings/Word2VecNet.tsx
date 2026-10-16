import { Figure, useContainerWidth } from '../../../../../kit'

/*
  The Word2Vec (skip-gram) network for a 6-word vocabulary and d = 3: a one-hot input, the matrix W
  (V × d) to the middle layer and the matrix W′ (d × V) to one score per word. Only the edges leaving
  the active input are used, so the middle layer is exactly that word's row of W.
*/

const V = 6
const D = 3
const HOT = 2

export default function Word2VecNet() {
  const [ref, measured] = useContainerWidth<HTMLDivElement>(560)
  const W = Math.max(300, Math.min(620, measured))
  const H = 300
  const r = 13
  const top = 58
  const bottom = H - 62
  const x = [62, W / 2, W - 62]
  const gap = (bottom - top) / (V - 1)
  const y = (layer: number, i: number) => {
    const n = layer === 1 ? D : V
    return (top + bottom) / 2 + (i - (n - 1) / 2) * (layer === 1 ? gap * 1.35 : gap)
  }
  const midY = y(1, D - 1) + r + 20

  return (
    <Figure
      title="The Word2Vec network"
      caption={
        <>
          The input is the one-hot vector of the centre word (here word 2 of a 6-word vocabulary, counting from 0). Only its edges (orange) carry
          anything, so the middle layer is exactly <b>that word&apos;s row of <i>W</i></b>: its embedding <i>v</i>
          <sub>c</sub>. Every score then uses all of <i>W′</i>: column <i>o</i> of <i>W′</i> is word <i>o</i>&apos;s output vector <i>u</i>
          <sub>o</sub>, and score <i>o</i> is <i>u</i>
          <sub>o</sub> · <i>v</i>
          <sub>c</sub>.
        </>
      }
    >
      <div ref={ref} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          style={{ maxWidth: '100%', display: 'block' }}
          role="img"
          aria-label="Word2Vec network: a one-hot input of 6 words with word 2 switched on, the matrix W of shape V by d leading to 3 embedding numbers, and the matrix W prime of shape d by V leading to 6 scores. Only the edges from the active input are highlighted."
        >
          {/* W: input → embedding */}
          {Array.from({ length: V }).flatMap((_, i) =>
            Array.from({ length: D }).map((__, j) => (
              <line
                key={`a${i}-${j}`}
                x1={x[0]}
                y1={y(0, i)}
                x2={x[1]}
                y2={y(1, j)}
                style={i === HOT ? { stroke: 'var(--viz-2)', strokeWidth: 2.6 } : { stroke: 'var(--viz-muted)', strokeWidth: 1, opacity: 0.35 }}
              />
            )),
          )}
          {/* W′: embedding → scores */}
          {Array.from({ length: D }).flatMap((_, j) =>
            Array.from({ length: V }).map((__, o) => (
              <line key={`b${j}-${o}`} x1={x[1]} y1={y(1, j)} x2={x[2]} y2={y(2, o)} style={{ stroke: 'var(--viz-1)', strokeWidth: 1.3, opacity: 0.55 }} />
            )),
          )}
          {/* nodes */}
          {[0, 1, 2].flatMap((layer) =>
            Array.from({ length: layer === 1 ? D : V }).map((_, i) => {
              const hot = (layer === 0 && i === HOT) || layer === 1
              return (
                <g key={`n${layer}-${i}`}>
                  <circle
                    cx={x[layer]}
                    cy={y(layer, i)}
                    r={r}
                    style={{
                      fill: hot ? `color-mix(in srgb, ${layer === 0 ? 'var(--viz-2)' : 'var(--viz-1)'} 35%, var(--surface))` : 'var(--surface)',
                      stroke: 'var(--viz-ink)',
                      strokeWidth: 1.5,
                    }}
                  />
                  {layer === 0 && (
                    <text x={x[0]} y={y(0, i)} dy="0.35em" textAnchor="middle" className="nnet-node-label">
                      {i === HOT ? 1 : 0}
                    </text>
                  )}
                  {layer === 0 && (
                    <text x={x[0] - r - 6} y={y(0, i)} dy="0.35em" textAnchor="end" style={{ fontSize: 11, fill: 'var(--ink-2)' }}>
                      {i}
                    </text>
                  )}
                </g>
              )
            }),
          )}
          {/* matrix names over the two bundles of edges */}
          <text x={(x[0] + x[1]) / 2} y={22} textAnchor="middle" className="plot-label" style={{ fontSize: 13.5, fontWeight: 800 }}>
            W (V × d)
          </text>
          <text x={(x[1] + x[2]) / 2} y={22} textAnchor="middle" className="plot-label" style={{ fontSize: 13.5, fontWeight: 800 }}>
            W′ (d × V)
          </text>
          <text x={x[1]} y={midY} textAnchor="middle" className="plot-label" style={{ fontSize: 12 }}>
            = row 2 of W
          </text>
          {/* layer names */}
          {['one-hot in (V)', 'embedding (d)', 'scores (V)'].map((t, l) => (
            <text key={t} x={x[l]} y={H - 10} textAnchor={l === 0 ? 'start' : l === 2 ? 'end' : 'middle'} dx={l === 0 ? -30 : l === 2 ? 30 : 0} className="nnet-layer-label">
              {t}
            </text>
          ))}
        </svg>
      </div>
    </Figure>
  )
}
