import { useEffect, useMemo, useRef, useState } from 'react'
import { Figure, Controls, Readout, Slider, Plot, Axes, Rect, Label, VLine, M } from '../../../../../kit'
import { fix } from '../eigenvectors-eigenvalues/eig2'
import { svd } from '../covariance-and-pca/la2'
import c from '../covariance-and-pca/cps.module.css'
import s from '../eigenvectors-eigenvalues/ev.module.css'

/*
  A 48×48 greyscale picture is a 48×48 matrix of ink levels (2,304 numbers). Its SVD splits it into
  layers σᵢ uᵢ vᵢᵀ, biggest first. Keeping the first k layers gives the best possible rank-k copy,
  which needs k × (48 + 48 + 1) numbers: a saving only while that is less than 2,304.
  The picture has soft, shaded edges, so its singular values fall off gradually (it has full rank).
*/

const N = 48
const KMAX = 30
const sig = (z: number) => 1 / (1 + Math.exp(-z))

/** A shaded, winking smiley with soft edges; values are ink levels from 0 (paper) to 1 (ink). */
function makeImage(): number[][] {
  const A: number[][] = []
  for (let i = 0; i < N; i++) {
    A.push([])
    for (let j = 0; j < N; j++) {
      const x = ((j + 0.5) / N) * 2 - 1
      const y = 1 - ((i + 0.5) / N) * 2
      let v = 0.06 + (0.06 * (1 - y)) / 2
      const face = sig((0.8 - Math.hypot(x, y + 0.02)) / 0.035)
      const shade = 0.7 + 0.12 * (-0.6 * x + 0.8 * y)
      v = v * (1 - face) + shade * face
      const eye = sig((0.11 - Math.hypot(x + 0.3, y - 0.25)) / 0.025)
      const wink = y > 0.2 ? sig((0.03 - Math.abs(Math.hypot(x - 0.3, y - 0.18) - 0.12)) / 0.012) : 0
      const smile = y < -0.1 ? sig((0.045 - Math.abs(Math.hypot(x, y - 0.05) - 0.45)) / 0.015) * sig((-0.05 - y) / 0.03) : 0
      const dark = Math.max(eye, wink, smile)
      A[i].push(v * (1 - dark) + 0.05 * dark)
    }
  }
  return A
}

const IMG = makeImage()

type RGB = [number, number, number]
function parseColor(str: string): RGB {
  const t = str.trim()
  if (t.startsWith('#')) {
    const h = t.slice(1)
    const full = h.length === 3 ? h.split('').map((ch) => ch + ch).join('') : h.slice(0, 6)
    return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)]
  }
  const m = t.match(/rgba?\(([^)]+)\)/)
  if (m) {
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number)
    return [p[0] || 0, p[1] || 0, p[2] || 0]
  }
  return [128, 128, 128]
}

/** Ink and paper colours from the theme tokens, re-read when the light/dark theme changes. */
function useInkPaper(): { ink: RGB; paper: RGB } | null {
  const [cols, setCols] = useState<{ ink: RGB; paper: RGB } | null>(null)
  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement)
      setCols({ ink: parseColor(cs.getPropertyValue('--viz-ink') || '#17203a'), paper: parseColor(cs.getPropertyValue('--surface') || '#ffffff') })
    }
    read()
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    mq?.addEventListener?.('change', read)
    const mo = new MutationObserver(read)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] })
    return () => {
      mq?.removeEventListener?.('change', read)
      mo.disconnect()
    }
  }, [])
  return cols
}

/** The picture drawn on a canvas, one canvas pixel per matrix entry, scaled up with crisp pixels. */
function Picture({ A, title }: { A: number[][]; title: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const cols = useInkPaper()
  useEffect(() => {
    const cv = ref.current
    const ctx = cv?.getContext('2d')
    if (!cv || !ctx || !cols) return
    const img = ctx.createImageData(N, N)
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++) {
        const v = Math.max(0, Math.min(1, A[i][j]))
        const k = (i * N + j) * 4
        for (let ch = 0; ch < 3; ch++) img.data[k + ch] = Math.round(cols.ink[ch] * v + cols.paper[ch] * (1 - v))
        img.data[k + 3] = 255
      }
    ctx.putImageData(img, 0, 0)
  }, [A, cols])
  return (
    <div className={c.pic}>
      <div className={c.picTitle}>{title}</div>
      <canvas ref={ref} width={N} height={N} className={c.picSvg} style={{ imageRendering: 'pixelated', aspectRatio: '1 / 1' }} role="img" aria-label={title} />
    </div>
  )
}

export default function LowRankPicture() {
  const [k, setK] = useState(5)
  const dec = useMemo(() => svd(IMG), [])
  const approx = useMemo(() => {
    const out = Array.from({ length: N }, () => Array(N).fill(0) as number[])
    for (let r = 0; r < k; r++) {
      const sr = dec.s[r]
      if (sr < 1e-12) continue
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) out[i][j] += sr * dec.U[i][r] * dec.V[j][r]
    }
    return out
  }, [k, dec])
  const total = Math.sqrt(dec.s.reduce((a, x) => a + x * x, 0))
  const err = Math.sqrt(dec.s.slice(k).reduce((a, x) => a + x * x, 0))
  const stored = k * (2 * N + 1)
  const pct = Math.round((100 * stored) / (N * N))
  const breakEven = Math.ceil((N * N) / (2 * N + 1)) // first k that costs at least as much as the picture
  const shown = dec.s.slice(0, KMAX)
  const sMax = dec.s[0]
  const costly = stored >= N * N

  return (
    <Figure
      title="Low-rank approximation: keep only the biggest stretches"
      caption={
        <>
          <b>Try:</b> slide <i>k</i> from 1 up to about 12, then on to {breakEven}.
          <br />
          <b>Notice:</b> five layers (485 numbers, 21% of the picture) already give a recognisable face, and from k = {breakEven} on the layers cost more than the
          picture itself.
          <span className="fine">
            The 48 × 48 picture is a matrix of 2,304 ink levels. Each layer σᵢuᵢvᵢᵀ costs 48 + 48 + 1 = 97 numbers, and the error is the Frobenius norm of what was
            thrown away, <M>{'\\sqrt{\\sigma_{k+1}^2 + \\sigma_{k+2}^2 + \\dots}'}</M>.
          </span>
        </>
      }
    >
      <div className={c.pics}>
        <Picture A={IMG} title="original (2,304 numbers)" />
        <Picture A={approx} title={`rank ${k} copy (${stored.toLocaleString('en-GB')} numbers)`} />
      </div>
      <div className={s.panelTitle}>Singular values σ₁, σ₂, … of the picture (kept ones in orange)</div>
      <Plot x={[0.3, KMAX + 0.7]} y={[0, sMax * 1.12]} width={420} height={170} minHeight={150} margin={{ top: 14, right: 8, bottom: 32, left: 36 }} ariaLabel="Bar chart of the singular values of the picture">
        <Axes xTicks={6} yTicks={4} xLabel="i" />
        {shown.map((v, i) => (
          <Rect key={i} x0={i + 1 - 0.36} x1={i + 1 + 0.36} y0={0} y1={v} fill={i < k ? 'var(--viz-2)' : 'color-mix(in srgb, var(--viz-muted) 45%, transparent)'} />
        ))}
        <VLine x={breakEven - 0.5} color="var(--viz-neg)" dash="4 4" />
        <Label x={breakEven - 0.5} y={sMax * 0.55} dx={-5} anchor="end" size={11} color="var(--viz-neg)">
          no saving from here →
        </Label>
        <Label x={1} y={dec.s[0]} dy={-4} dx={10} size={12} weight={700}>
          {`σ₁ = ${fix(dec.s[0])}`}
        </Label>
      </Plot>
      <Controls>
        <Slider label={<>layers kept, <i>k</i></>} value={k} min={1} max={KMAX} step={1} onChange={setK} />
        <Readout
          items={[
            [
              'numbers stored',
              <span key="st" style={costly ? { color: 'var(--viz-neg)', fontWeight: 750 } : undefined}>
                {`${k} × 97 = ${stored.toLocaleString('en-GB')} of 2,304 (${pct}%)`}
                {costly ? ': no saving' : ''}
              </span>,
            ],
            [
              <>
                error ‖A − A<sub>k</sub>‖<sub>F</sub>
              </>,
              <>
                {fix(err, 3)} ({fix((100 * err) / total, 1)}% of ‖A‖<sub>F</sub>)
              </>,
            ],
          ]}
        />
      </Controls>
    </Figure>
  )
}
