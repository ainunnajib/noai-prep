/*
  The picture used throughout the "Vision-language models" lesson: a hawker stall. It is drawn in a
  100 × 100 box (y down) so that its main objects line up with a 4 × 4 grid of 25 × 25 patches:

      row 0:  sign    sign    sign    sign
      row 1:  lantern pot     price   clock
      row 2:  counter plate   cup     cat
      row 3:  counter counter counter stool

  Colours come from theme tokens only, so it works in light and dark mode.
*/

export type PatchLabel = 'sign' | 'lantern' | 'pot' | 'price' | 'clock' | 'counter' | 'plate' | 'cup' | 'cat' | 'stool'

export const PATCHES: PatchLabel[][] = [
  ['sign', 'sign', 'sign', 'sign'],
  ['lantern', 'pot', 'price', 'clock'],
  ['counter', 'plate', 'cup', 'cat'],
  ['counter', 'counter', 'counter', 'stool'],
]

const ink = 'var(--viz-ink)'
const t = (c: string, p: number) => `color-mix(in srgb, ${c} ${p}%, var(--surface))`
const S = (fill: string, stroke = ink, w = 1.4) => ({ fill, stroke, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const })
const L = (stroke: string, w = 1.4) => ({ fill: 'none', stroke, strokeWidth: w, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const })

/** The drawing itself, as SVG children for a 100 × 100 viewBox. */
export function HawkerScene() {
  return (
    <g>
      {/* wall */}
      <rect x="0" y="0" width="100" height="100" style={{ fill: t('var(--viz-6)', 14) }} />
      {/* signboard */}
      <rect x="3" y="3" width="94" height="19" rx="2" style={S(t('var(--viz-neg)', 85))} />
      <text x="50" y="11" textAnchor="middle" style={{ fill: 'var(--surface)', fontSize: 6, fontWeight: 800, letterSpacing: 0.6, fontFamily: 'var(--font-display)' }}>
        AH HUAT
      </text>
      <text x="50" y="19" textAnchor="middle" style={{ fill: 'var(--surface)', fontSize: 6.2, fontWeight: 800, letterSpacing: 0.4, fontFamily: 'var(--font-display)' }}>
        CHICKEN RICE
      </text>
      {/* lantern */}
      <path d="M12 22 V28" style={L(ink, 1)} />
      <ellipse cx="12" cy="36" rx="7" ry="8" style={S(t('var(--viz-neg)', 80))} />
      <path d="M8 30 q4 6 0 12 M16 30 q-4 6 0 12" style={L(t('var(--viz-6)', 90), 0.9)} />
      <rect x="9.5" y="43.5" width="5" height="2" style={S(t('var(--viz-6)', 90), ink, 0.8)} />
      {/* pot with steam */}
      <path d="M31 32 q-3 -4 0 -7 M37 32 q-3 -4 0 -7 M43 32 q-3 -4 0 -7" style={L(t('var(--viz-axis)', 70), 1)} />
      <path d="M28 35 H46 V45 q0 4 -4 4 H32 q-4 0 -4 -4 Z" style={S(t('var(--viz-axis)', 45))} />
      <rect x="26" y="33.5" width="22" height="3" rx="1.2" style={S(t('var(--viz-axis)', 60))} />
      {/* price board */}
      <rect x="53" y="28" width="20" height="17" rx="1.5" style={S('var(--surface)')} />
      <text x="63" y="35" textAnchor="middle" style={{ fill: ink, fontSize: 4, fontWeight: 700 }}>
        1 plate
      </text>
      <text x="63" y="42.5" textAnchor="middle" style={{ fill: 'var(--viz-neg)', fontSize: 6, fontWeight: 800 }}>
        $4.50
      </text>
      {/* wall clock, top right of row 1 */}
      <circle cx="87" cy="37" r="6" style={S('var(--surface)')} />
      <path d="M87 37 V33.5 M87 37 h2.6" style={L(ink, 1)} />
      {/* counter */}
      <rect x="0" y="60" width="74" height="40" style={S(t('var(--viz-1)', 35))} />
      <rect x="0" y="57" width="76" height="5" rx="1" style={S(t('var(--viz-6)', 55))} />
      <path d="M8 72 H66 M8 84 H66" style={L(t('var(--viz-1)', 60), 1)} />
      {/* plate of chicken rice */}
      <ellipse cx="37" cy="55" rx="13" ry="4.5" style={S('var(--surface)')} />
      <path d="M27 55 q4 -8 11 -1 Z" style={S(t('var(--viz-muted)', 30), ink, 1)} />
      <path d="M36 55 q3 -6 6 -1 Z M41 55 q3 -6 6 -1 Z" style={S(t('var(--viz-6)', 60), ink, 1)} />
      {/* cup of kopi */}
      <path d="M57 47 h10 l-1.5 10 h-7 Z" style={S('var(--surface)')} />
      <path d="M67 49 q4 0 3 4 q-1 2 -3 2" style={L(ink, 1.1)} />
      <rect x="57.5" y="47.5" width="9" height="2.2" style={{ fill: t('var(--viz-2)', 70) }} />
      {/* stool */}
      <rect x="77" y="83" width="20" height="3" rx="1" style={S(t('var(--viz-axis)', 55))} />
      <path d="M80 86 L78 99 M94 86 L96 99" style={L(ink, 1.6)} />
      {/* cat sitting on the stool */}
      <path d="M95 80 q6 -2 3 -10" style={L(ink, 3.4)} />
      <path d="M95 80 q6 -2 3 -10" style={L(t('var(--viz-2)', 85), 2)} />
      <ellipse cx="87" cy="75" rx="8" ry="8.5" style={S(t('var(--viz-2)', 85))} />
      <path d="M81.5 58 L82.5 51 L86 56 Z M88 56 L91.5 51 L92.5 58 Z" style={S(t('var(--viz-2)', 85), ink, 1.1)} />
      <circle cx="87" cy="61" r="6.5" style={S(t('var(--viz-2)', 85))} />
      <circle cx="84.8" cy="60.5" r="0.9" style={{ fill: ink }} />
      <circle cx="89.2" cy="60.5" r="0.9" style={{ fill: ink }} />
      <path d="M86.2 63 l0.8 0.8 l0.8 -0.8 Z" style={S(ink, ink, 0.6)} />
    </g>
  )
}

/** Overlay a P × P patch grid on the 100 × 100 drawing. */
export function PatchGrid({ n, color = 'var(--surface)', width = 0.6 }: { n: number; color?: string; width?: number }) {
  const lines = []
  for (let i = 1; i < n; i++) {
    const p = (100 * i) / n
    lines.push(<line key={`v${i}`} x1={p} x2={p} y1={0} y2={100} style={{ stroke: color, strokeWidth: width }} />)
    lines.push(<line key={`h${i}`} y1={p} y2={p} x1={0} x2={100} style={{ stroke: color, strokeWidth: width }} />)
  }
  return <g aria-hidden="true">{lines}</g>
}
