import type { ImageId } from './toyClip'

/*
  Small drawn "photos" for the CLIP lesson. Each is drawn in a 100 × 100 box (y down) with theme
  colours only, so it works in light and dark mode. Pretend each one is a photo.
*/

const ink = 'var(--viz-ink)'
const t = (c: string, p: number) => `color-mix(in srgb, ${c} ${p}%, var(--surface))`
const S = (fill: string, stroke = ink, w = 2.2) => ({ fill, stroke, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const })
const L = (stroke: string, w = 2.2) => ({ fill: 'none', stroke, strokeWidth: w, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const })

function Cat() {
  const fur = t('var(--viz-2)', 85)
  return (
    <>
      <rect x="0" y="0" width="100" height="100" style={{ fill: t('var(--viz-5)', 14) }} />
      {/* sofa */}
      <rect x="6" y="40" width="88" height="30" rx="8" style={S(t('var(--viz-4)', 45))} />
      <rect x="4" y="62" width="92" height="24" rx="8" style={S(t('var(--viz-4)', 60))} />
      <rect x="10" y="85" width="6" height="9" style={S(t('var(--viz-4)', 70))} />
      <rect x="84" y="85" width="6" height="9" style={S(t('var(--viz-4)', 70))} />
      {/* tail */}
      <path d="M72 66 C 86 64, 88 76, 74 76" style={L(ink, 6.5)} />
      <path d="M72 66 C 86 64, 88 76, 74 76" style={L(fur, 4)} />
      {/* curled body */}
      <ellipse cx="54" cy="64" rx="22" ry="12" style={S(fur)} />
      {/* head */}
      <path d="M22 50 L25 37 L33 46 Z" style={S(fur)} />
      <path d="M38 45 L45 37 L46 50 Z" style={S(fur)} />
      <circle cx="35" cy="58" r="12" style={S(fur)} />
      {/* closed eyes + nose */}
      <path d="M28 57 q3 3 6 0" style={L(ink, 1.8)} />
      <path d="M37 57 q3 3 6 0" style={L(ink, 1.8)} />
      <path d="M34.5 62 l1.5 1.5 l1.5 -1.5 Z" style={S(ink, ink, 1)} />
      <text x="70" y="30" style={{ fill: ink, fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
        z z
      </text>
    </>
  )
}

function Dog() {
  const coat = t('var(--viz-6)', 70)
  return (
    <>
      <rect x="0" y="0" width="100" height="100" style={{ fill: t('var(--viz-1)', 12) }} />
      <rect x="0" y="74" width="100" height="26" style={{ fill: t('var(--viz-3)', 40) }} />
      {/* legs */}
      {[30, 38, 58, 66].map((x) => (
        <rect key={x} x={x} y="62" width="6" height="18" rx="2" style={S(coat)} />
      ))}
      {/* tail */}
      <path d="M70 52 q12 -6 14 -18" style={L(ink, 6)} />
      <path d="M70 52 q12 -6 14 -18" style={L(coat, 3.5)} />
      {/* body */}
      <ellipse cx="50" cy="56" rx="23" ry="12" style={S(coat)} />
      {/* head */}
      <circle cx="26" cy="42" r="11" style={S(coat)} />
      <ellipse cx="17" cy="47" rx="6" ry="4.5" style={S(coat)} />
      <path d="M28 33 q8 2 7 14 q-6 -3 -7 -14 Z" style={S(t('var(--viz-6)', 95))} />
      <circle cx="12" cy="46" r="2.3" style={{ fill: ink }} />
      <circle cx="23" cy="39" r="1.8" style={{ fill: ink }} />
      {/* ball */}
      <circle cx="84" cy="80" r="8" style={S(t('var(--viz-neg)', 80))} />
      <path d="M77 77 q7 5 14 0" style={L('var(--surface)', 1.6)} />
    </>
  )
}

function Bird() {
  const body = t('var(--viz-1)', 75)
  return (
    <>
      <rect x="0" y="0" width="100" height="100" style={{ fill: t('var(--viz-1)', 10) }} />
      <circle cx="80" cy="20" r="14" style={{ fill: t('var(--viz-3)', 30) }} />
      <circle cx="18" cy="16" r="10" style={{ fill: t('var(--viz-3)', 22) }} />
      {/* branch */}
      <path d="M2 74 L98 62" style={L(t('var(--viz-6)', 90), 6)} />
      <path d="M70 66 q8 -10 18 -12" style={L(t('var(--viz-6)', 90), 3.5)} />
      <ellipse cx="86" cy="52" rx="7" ry="4" transform="rotate(-25 86 52)" style={S(t('var(--viz-3)', 70), ink, 1.6)} />
      {/* tail */}
      <path d="M62 56 L82 66 L78 56 Z" style={S(body)} />
      {/* body + head */}
      <ellipse cx="50" cy="52" rx="16" ry="12" style={S(body)} />
      <circle cx="36" cy="40" r="9" style={S(body)} />
      <path d="M48 52 q8 -2 12 4" style={L(ink, 1.8)} />
      <path d="M27 39 L19 42 L27 44 Z" style={S(t('var(--viz-2)', 90), ink, 1.6)} />
      <circle cx="34" cy="38" r="1.8" style={{ fill: ink }} />
      {/* feet */}
      <path d="M46 63 v6 M54 63 v6" style={L(t('var(--viz-2)', 90), 2)} />
    </>
  )
}

function Train() {
  return (
    <>
      <rect x="0" y="0" width="100" height="100" style={{ fill: t('var(--viz-5)', 10) }} />
      {/* platform roof */}
      <rect x="0" y="6" width="100" height="8" style={{ fill: t('var(--viz-axis)', 35) }} />
      {/* body */}
      <path d="M4 30 H82 q12 0 14 12 V72 H4 Z" style={S(t('var(--viz-muted)', 30))} />
      <rect x="4" y="58" width="92" height="6" style={{ fill: t('var(--viz-neg)', 85) }} />
      {[10, 30, 50].map((x) => (
        <rect key={x} x={x} y="38" width="14" height="14" rx="2" style={S(t('var(--viz-1)', 45), ink, 1.6)} />
      ))}
      <path d="M70 38 H84 q6 0 8 6 V52 H70 Z" style={S(t('var(--viz-1)', 45), ink, 1.6)} />
      {/* wheels + rail */}
      {[16, 36, 62, 82].map((x) => (
        <circle key={x} cx={x} cy="76" r="5" style={S(t('var(--viz-ink)', 70), ink, 1.4)} />
      ))}
      <path d="M0 82 H100" style={L(ink, 2.5)} />
      <path d="M0 90 H100" style={L(t('var(--viz-axis)', 60), 2)} />
    </>
  )
}

function Bicycle() {
  const red = t('var(--viz-neg)', 92)
  return (
    <>
      <rect x="0" y="0" width="100" height="100" style={{ fill: t('var(--viz-6)', 12) }} />
      <path d="M0 84 H100" style={L(t('var(--viz-axis)', 50), 2)} />
      <circle cx="26" cy="64" r="17" style={L(ink, 3)} />
      <circle cx="76" cy="64" r="17" style={L(ink, 3)} />
      <circle cx="26" cy="64" r="2.5" style={{ fill: ink }} />
      <circle cx="76" cy="64" r="2.5" style={{ fill: ink }} />
      {/* frame */}
      <path d="M26 64 L44 64 L66 40 L38 40 Z M44 64 L36 34 M66 40 L76 64 M66 40 L62 28" style={L(red, 3.5)} />
      <path d="M30 32 H42" style={L(ink, 4)} />
      <path d="M56 28 H68" style={L(ink, 3)} />
    </>
  )
}

function Laksa() {
  return (
    <>
      <rect x="0" y="0" width="100" height="100" style={{ fill: t('var(--viz-6)', 14) }} />
      {/* steam */}
      <path d="M36 28 q-5 -7 0 -14 M50 26 q-5 -7 0 -14 M64 28 q-5 -7 0 -14" style={L(t('var(--viz-axis)', 70), 2)} />
      {/* bowl */}
      <path d="M12 50 H88 q-4 34 -38 36 q-34 -2 -38 -36 Z" style={S(t('var(--viz-1)', 30))} />
      <path d="M22 62 q28 10 56 0" style={L(t('var(--viz-1)', 60), 2)} />
      {/* broth */}
      <ellipse cx="50" cy="50" rx="38" ry="9" style={S(t('var(--viz-2)', 85))} />
      {/* noodles, prawn, chilli */}
      <path d="M24 50 q5 -4 10 0 t10 0 t10 0 t10 0" style={L(t('var(--viz-6)', 60), 2.2)} />
      <path d="M30 54 q5 -4 10 0 t10 0 t10 0" style={L(t('var(--viz-6)', 60), 2.2)} />
      <path d="M62 44 q8 -4 10 4" style={L(t('var(--viz-neg)', 80), 3.5)} />
      <circle cx="40" cy="46" r="2.5" style={{ fill: t('var(--viz-neg)', 95) }} />
      <circle cx="57" cy="53" r="2" style={{ fill: t('var(--viz-3)', 85) }} />
    </>
  )
}

function ChickenRice() {
  return (
    <>
      <rect x="0" y="0" width="100" height="100" style={{ fill: t('var(--viz-3)', 12) }} />
      <ellipse cx="50" cy="60" rx="44" ry="26" style={S('var(--surface)')} />
      <ellipse cx="50" cy="60" rx="34" ry="18" style={L(t('var(--viz-axis)', 40), 1.5)} />
      {/* rice dome */}
      <path d="M14 64 C 16 36, 50 34, 52 62 Z" style={S(t('var(--viz-muted)', 25))} />
      {[
        [24, 54],
        [32, 48],
        [40, 55],
        [30, 59],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="2.4" ry="1.3" style={{ fill: t('var(--viz-muted)', 70) }} />
      ))}
      {/* chicken slices */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${50 + i * 10} 66 q7 -22 15 -2 Z`} style={S(t('var(--viz-6)', 55), ink, 1.6)} />
      ))}
      {/* cucumber */}
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={34 + i * 10} cy="74" r="4.2" style={S(t('var(--viz-3)', 70), ink, 1.4)} />
      ))}
      {/* chilli dip */}
      <circle cx="84" cy="24" r="9" style={S('var(--surface)')} />
      <circle cx="84" cy="24" r="6" style={{ fill: t('var(--viz-neg)', 85) }} />
    </>
  )
}

function Sunset() {
  return (
    <>
      <rect x="0" y="0" width="100" height="100" style={{ fill: t('var(--viz-2)', 22) }} />
      <rect x="0" y="0" width="100" height="26" style={{ fill: t('var(--viz-4)', 20) }} />
      <circle cx="50" cy="58" r="20" style={S(t('var(--viz-2)', 90), 'none', 0)} />
      <rect x="0" y="58" width="100" height="42" style={{ fill: t('var(--viz-1)', 60) }} />
      <path d="M8 68 q6 -3 12 0 M30 76 q6 -3 12 0 M58 70 q6 -3 12 0 M76 82 q6 -3 12 0 M14 90 q6 -3 12 0" style={L('var(--surface)', 2)} />
      <path d="M38 64 h24 M42 70 h16" style={L(t('var(--viz-2)', 90), 2.2)} />
      <path d="M70 26 l5 -3 l5 3 M82 34 l4 -2.5 l4 2.5" style={L(ink, 1.8)} />
    </>
  )
}

function Jaguar() {
  const coat = t('var(--viz-6)', 60)
  return (
    <>
      <rect x="0" y="0" width="100" height="100" style={{ fill: t('var(--viz-3)', 22) }} />
      <path d="M0 18 q14 -14 26 0 q12 -14 24 0 M58 10 q14 -10 26 2 q8 -6 16 0" style={L(t('var(--viz-3)', 75), 3)} />
      <rect x="0" y="80" width="100" height="20" style={{ fill: t('var(--viz-3)', 45) }} />
      {/* legs */}
      {[26, 34, 62, 70].map((x) => (
        <rect key={x} x={x} y="62" width="7" height="22" rx="3" style={S(coat)} />
      ))}
      {/* tail */}
      <path d="M78 54 q16 0 16 22" style={L(ink, 6.5)} />
      <path d="M78 54 q16 0 16 22" style={L(coat, 4)} />
      {/* body */}
      <ellipse cx="52" cy="56" rx="28" ry="13" style={S(coat)} />
      {/* head */}
      <circle cx="22" cy="44" r="11" style={S(coat)} />
      <circle cx="16" cy="34" r="3.5" style={S(coat, ink, 1.8)} />
      <circle cx="28" cy="34" r="3.5" style={S(coat, ink, 1.8)} />
      <circle cx="18" cy="43" r="1.6" style={{ fill: ink }} />
      <circle cx="26" cy="43" r="1.6" style={{ fill: ink }} />
      <path d="M20 49 l2 2 l2 -2 Z" style={S(ink, ink, 1)} />
      {/* rosettes */}
      {[
        [40, 50],
        [52, 47],
        [64, 50],
        [46, 60],
        [58, 61],
        [70, 58],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.4" style={L(ink, 1.8)} />
      ))}
    </>
  )
}

function Mouse() {
  return (
    <>
      <rect x="0" y="0" width="100" height="100" style={{ fill: t('var(--viz-axis)', 12) }} />
      {/* mouse pad */}
      <rect x="14" y="30" width="72" height="62" rx="8" style={{ fill: t('var(--viz-1)', 25) }} />
      {/* cable */}
      <path d="M50 38 C 50 20, 30 22, 34 4" style={L(ink, 2.5)} />
      {/* body */}
      <path d="M50 38 C 70 38, 72 56, 70 70 C 68 86, 32 86, 30 70 C 28 56, 30 38, 50 38 Z" style={S(t('var(--viz-muted)', 40))} />
      <path d="M30 58 H70 M50 38 V58" style={L(ink, 1.8)} />
      <rect x="47" y="43" width="6" height="10" rx="3" style={S(t('var(--viz-ink)', 60), ink, 1.4)} />
    </>
  )
}

const DRAW: Record<ImageId, () => JSX.Element> = {
  cat: Cat,
  dog: Dog,
  bird: Bird,
  train: Train,
  bicycle: Bicycle,
  laksa: Laksa,
  chickenrice: ChickenRice,
  sunset: Sunset,
  jaguar: Jaguar,
  mouse: Mouse,
}

/** A drawn thumbnail as a standalone <svg>. */
export function Thumb({ id, size = 44, title }: { id: ImageId; size?: number; title?: string }) {
  const D = DRAW[id]
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={title ?? id} style={{ display: 'block', borderRadius: Math.max(4, size * 0.14), overflow: 'hidden', flex: 'none' }}>
      <D />
      <rect x="1" y="1" width="98" height="98" rx="13" style={{ fill: 'none', stroke: 'var(--rule)', strokeWidth: 2 }} />
    </svg>
  )
}

/** The same drawing placed inside a parent <svg> at (x, y) with side `size`. */
export function ThumbG({ id, x, y, size }: { id: ImageId; x: number; y: number; size: number }) {
  const D = DRAW[id]
  const clip = `thumbclip-${id}`
  return (
    <g transform={`translate(${x},${y}) scale(${size / 100})`}>
      <defs>
        <clipPath id={clip}>
          <rect x="0" y="0" width="100" height="100" rx="14" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <D />
      </g>
      <rect x="1" y="1" width="98" height="98" rx="14" style={{ fill: 'none', stroke: 'var(--viz-axis)', strokeWidth: 3 }} />
    </g>
  )
}
